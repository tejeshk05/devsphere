import { NextRequest, NextResponse } from "next/server";
import { verifyAccessKey, getSessionSignature, AUTH_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { action, accessKey } = await request.json();

    if (action === "logout") {
      const response = NextResponse.json({ success: true, message: "Logged out" });
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }

    if (action === "login") {
      if (!accessKey) {
        return NextResponse.json(
          { success: false, error: "Access key is required." },
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

      const response = NextResponse.json({
        success: true,
        message: "Authentication successful",
      });

      // Set HTTP-only secure cookie (expires in 30 days)
      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: getSessionSignature(),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });

      return response;
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Auth failure";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME);
  const isValid = token?.value === getSessionSignature();

  return NextResponse.json({
    authenticated: isValid,
    ownerAccount: process.env.AUTHORIZED_ACCOUNT_NAME || "Authorized Developer",
  });
}

