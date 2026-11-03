import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Publicly allowed paths (auth routes, static assets, manifests, icons, service worker)
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js"
  ) {
    return NextResponse.next();
  }

  // Cryptographically verify session token
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
  const isValid = await validateSessionToken(authCookie?.value);

  // If unauthorized, redirect to /login (or return 401 for /api routes)
  if (!isValid) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Valid cryptographic session token required.",
        },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
