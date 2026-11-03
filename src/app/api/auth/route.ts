import { NextRequest, NextResponse } from "next/server";
import {
  verifyAccessKey,
  createSessionToken,
  validateSessionToken,
  AUTH_COOKIE_NAME,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { action, accessKey } = await request.json();

    if (action === "logout") {
      const response = NextResponse.json({
        success: true,
        message: "Session terminated successfully.",
      });
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }

    if (action === "login") {
      if (!accessKey || typeof accessKey !== "string") {
        return NextResponse.json(
          { success: false, error: "Access secret key is required." },
          { status: 400 }
        );
      }

      const isValid = verifyAccessKey(accessKey);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Invalid authorization credentials." },
          { status: 401 }
        );
      }

      const sessionToken = await createSessionToken();

      const response = NextResponse.json({
        success: true,
        message: "Cryptographic session authorized.",
      });

      // Set hardened HTTP-Only session cookie
      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
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

  return NextResponse.json({
    authenticated: isValid,
    ownerAccount: process.env.AUTHORIZED_ACCOUNT_NAME || "Authorized Developer",
  });
}
