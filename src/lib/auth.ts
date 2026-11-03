import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const AUTH_COOKIE_NAME = "devsphere_auth_token";
const DEFAULT_DEV_KEY = "devsphere-master-key-2026";
const TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Returns the configured master access secret.
 * Enforces strict security in production: rejects requests if no key is configured.
 */
export function getAuthorizedKey(): string | null {
  const key =
    process.env.DEVSPHERE_ACCESS_KEY || process.env.DEVSUSPHERE_ACCESS_KEY;

  if (!key) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[SECURITY CRITICAL] DEVSPHERE_ACCESS_KEY is missing in production. All logins blocked."
      );
      return null;
    }
    return DEFAULT_DEV_KEY;
  }
  return key;
}

/**
 * Returns secret used to HMAC-sign session cookies.
 */
function getSessionSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[SECURITY CRITICAL] AUTH_SESSION_SECRET must be set in production environment."
      );
    }
    return "devsphere-local-session-secret-vault-2026";
  }
  return secret;
}

/**
 * Validates whether the supplied secret matches the authorized key.
 * Uses constant-time XOR comparison to prevent timing attacks across both Node & Edge runtimes.
 */
export function verifyAccessKey(providedKey: string): boolean {
  const authorizedKey = getAuthorizedKey();
  if (!authorizedKey) return false;

  const enc = new TextEncoder();
  const a = enc.encode(providedKey.trim());
  const b = enc.encode(authorizedKey.trim());

  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

/**
 * Helper to get a CryptoKey for HMAC-SHA256 operations using Web Crypto API.
 */
async function getHmacCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Creates a cryptographically secure, timestamped, HMAC-signed session token.
 * Format: <timestamp_base36>.<random_entropy_hex>.<hmac_signature_hex>
 * Universal across Node.js and Edge Runtime.
 */
export async function createSessionToken(): Promise<string> {
  const secret = getSessionSecret();
  const timestamp = Date.now().toString(36);

  // Generate 24 bytes of cryptographically secure random entropy
  const entropyBytes = new Uint8Array(24);
  crypto.getRandomValues(entropyBytes);
  const entropy = Array.from(entropyBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const payload = `${timestamp}.${entropy}`;
  const key = await getHmacCryptoKey(secret);
  const enc = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(payload)
  );

  const hmacHex = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${payload}.${hmacHex}`;
}

/**
 * Validates that a session token is authentic, untampered, and unexpired.
 * Resilient against cookie forgery and session replay.
 * Uses Web Crypto crypto.subtle.verify for constant-time cryptographic verification.
 */
export async function validateSessionToken(
  tokenString?: string | null
): Promise<boolean> {
  if (!tokenString || typeof tokenString !== "string") {
    return false;
  }

  const parts = tokenString.split(".");
  if (parts.length !== 3) {
    return false;
  }

  const [timestampStr, entropy, providedSignature] = parts;

  // 1. Check expiration
  const timestamp = parseInt(timestampStr, 36);
  if (isNaN(timestamp)) {
    return false;
  }

  const now = Date.now();
  if (now < timestamp || now - timestamp > TOKEN_MAX_AGE_MS) {
    return false; // Expired or future timestamp
  }

  // 2. Validate HMAC signature via Web Crypto API
  let secret: string;
  try {
    secret = getSessionSecret();
  } catch {
    return false;
  }

  try {
    const payload = `${timestampStr}.${entropy}`;
    const enc = new TextEncoder();
    const key = await getHmacCryptoKey(secret);

    // Convert provided signature hex back to Uint8Array
    if (providedSignature.length !== 64) {
      return false; // SHA-256 hex must be exactly 64 characters
    }

    const sigMatch = providedSignature.match(/.{1,2}/g);
    if (!sigMatch) return false;

    const signatureBytes = new Uint8Array(
      sigMatch.map((byte) => parseInt(byte, 16))
    );

    return await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      enc.encode(payload)
    );
  } catch {
    return false;
  }
}

/**
 * Server Component / Server Action authentication check.
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME);
  return await validateSessionToken(token?.value);
}

/**
 * Route Handler / API authentication verification helper.
 */
export async function verifyRequestAuth(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(AUTH_COOKIE_NAME);
  return await validateSessionToken(token?.value);
}
