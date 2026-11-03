import { NextRequest, NextResponse } from "next/server";
import {
  verifyAccessKey,
  createSessionToken,
  validateSessionToken,
  AUTH_COOKIE_NAME,
} from "@/lib/auth";
import { dbManager } from "@/lib/db";

export const dynamic = "force-dynamic";

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "127.0.0.1";
}

export async function POST(request: NextRequest) {
  try {
    const { action, accessKey } = await request.json();
    const clientIp = getClientIdentifier(request);

    if (action === "logout") {
      const response = NextResponse.json({
        success: true,
        message: "Session terminated successfully.",
        clearClientCache: true,
      });

      // Delete authentication cookie
      response.cookies.delete(AUTH_COOKIE_NAME);

      // Instruct browser to purge stored cache data for security
      response.headers.set("Clear-Site-Data", '"cache", "storage"');
      return response;
    }

    if (action === "login") {
      // 1. Check shared-store rate limiter before processing
      const rateCheck = await dbManager.checkAuthRateLimit(clientIp, 5, 15 * 60 * 1000);
      if (!rateCheck.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: `Too many failed login attempts. Temporarily locked out for security. Try again in ${rateCheck.retryAfterSeconds} seconds.`,
            retryAfterSeconds: rateCheck.retryAfterSeconds,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(rateCheck.retryAfterSeconds),
            },
          }
        );
      }

      if (!accessKey || typeof accessKey !== "string") {
        return NextResponse.json(
          { success: false, error: "Access secret key is required." },
          { status: 400 }
        );
      }

      const isValid = verifyAccessKey(accessKey);
      if (!isValid) {
        // Record failure in rate limiter
        const failRecord = await dbManager.recordAuthFailure(clientIp, 5, 15 * 60 * 1000);

        if (!failRecord.allowed) {
          return NextResponse.json(
            {
              success: false,
              error: `Maximum attempts exceeded. IP locked out for 15 minutes.`,
              retryAfterSeconds: failRecord.retryAfterSeconds,
            },
            {
              status: 429,
              headers: {
                "Retry-After": String(failRecord.retryAfterSeconds),
              },
            }
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: `Invalid authorization credentials. (${failRecord.remaining} attempts remaining before lockout)`,
            remainingAttempts: failRecord.remaining,
          },
          { status: 401 }
        );
      }

      // Successful login: clear previous failure counters
      await dbManager.clearAuthFailure(clientIp);

      const sessionToken = await createSessionToken();

      const response = NextResponse.json({
        success: true,
        message: "Cryptographic session authorized.",
      });

      // Detect if request is served over HTTPS (or forwarded HTTPS via proxy)
      const isHttps =
        request.nextUrl.protocol === "https:" ||
        request.headers.get("x-forwarded-proto") === "https" ||
        process.env.COOKIE_SECURE === "true";

      // Set hardened HTTP-Only session cookie
      // Over HTTPS, Secure is enforced. Over local Wi-Fi HTTP, Secure is relaxed so mobile Safari accepts the cookie.
      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: sessionToken,
        httpOnly: true,
        secure: isHttps,
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: "Unsupported action." },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Authentication error.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME);
  const isValid = await validateSessionToken(token?.value);

  return NextResponse.json(
    {
      authenticated: isValid,
      ownerAccount: process.env.AUTHORIZED_ACCOUNT_NAME || "Authorized Developer",
    },
    {
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    }
  );
}
