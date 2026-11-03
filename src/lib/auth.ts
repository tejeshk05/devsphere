import { cookies } from "next/headers";

const AUTH_COOKIE_NAME = "devsphere_auth_token";
const DEFAULT_DEV_KEY = "devsphere-master-key-2026";

/**
 * Validates whether the supplied secret matches the authorized key in environment.
 */
export function verifyAccessKey(providedKey: string): boolean {
  const authorizedKey = process.env.DEVSUSPHERE_ACCESS_KEY || DEFAULT_DEV_KEY;
  return providedKey.trim() === authorizedKey.trim();
}

/**
 * Checks if the current request session is authenticated.
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME);

  if (!token?.value) {
    return false;
  }

  // Token matches the current valid session signature
  const expectedSignature = getSessionSignature();
  return token.value === expectedSignature;
}

export function getSessionSignature(): string {
  const secret = process.env.AUTH_SESSION_SECRET || "devsphere-local-session-secret-vault";
  // Simple deterministic signature for edge/server cookie verification
  let hash = 0;
  for (let i = 0; i < secret.length; i++) {
    hash = (hash << 5) - hash + secret.charCodeAt(i);
    hash |= 0;
  }
  return `sess_${Math.abs(hash).toString(36)}`;
}

export { AUTH_COOKIE_NAME };

