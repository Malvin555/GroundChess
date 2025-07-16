import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/auth/login", "/auth/signup", "/privacy", "/faq", "/terms", "/contact"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  if (pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!token) {
    if (isPublic) return NextResponse.next();
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // ✅ Decode JWT payload safely
  try {
    const base64Payload = token.split(".")[1];
    const jsonPayload = atob(base64Payload);
    const payload = JSON.parse(jsonPayload);

    // Optionally check payload.userId exists
    if (!payload?.userId) throw new Error("Invalid token structure");

    // If trying to access login/register while logged in → redirect to dashboard
    if (pathname === "/auth/login" || pathname === "/auth/signup") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("JWT decode failed:", err);
    return isPublic
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|api/).*)"],
};
