import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow setup page and key API route
  if (pathname === "/setup" || pathname.startsWith("/api/key")) {
    console.log(`[ESCH:proxy] ${request.method} ${pathname} → pass (setup/key route)`);
    return NextResponse.next();
  }

  // Check for key in cookie (env var is available server-side but not in Edge runtime)
  const hasCookieKey = !!request.cookies.get("explorium_api_key")?.value;
  const hasEnvKey = !!process.env.EXPLORIUM_API_KEY;

  if (!hasCookieKey && !hasEnvKey) {
    console.log(`[ESCH:proxy] ${request.method} ${pathname} → redirect /setup (no key)`);
    return NextResponse.redirect(new URL("/setup", request.url));
  }

  const keySource = hasCookieKey ? "cookie" : "env";
  console.log(`[ESCH:proxy] ${request.method} ${pathname} → pass (key=${keySource})`);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
