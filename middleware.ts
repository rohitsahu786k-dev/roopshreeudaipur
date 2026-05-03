import { NextResponse, type NextRequest } from "next/server";

const authCookieName = "ruhani_token";

function getRoleFromToken(token: string): string | null {
  try {
    const [, payloadB64] = token.split(".");
    if (!payloadB64) return null;
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload?.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(authCookieName)?.value;

  if (!token) {
    const loginUrl = new URL("/account", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = getRoleFromToken(token);

  if (!role) {
    const loginUrl = new URL("/account", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/manager") && role !== "admin" && role !== "manager") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/manager/:path*"]
};
