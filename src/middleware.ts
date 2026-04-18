import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const handleI18n = createIntlMiddleware(routing);

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/:locale/dashboard(.*)",
]);

const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/:locale/admin(.*)",
  "/api/admin(.*)",
]);

// Extract the locale prefix from the incoming pathname so that redirects
// (e.g. to /sign-in) keep the user on the language they were browsing in.
function getLocalePrefix(pathname: string) {
  const firstSegment = pathname.split("/")[1];
  if ((routing.locales as readonly string[]).includes(firstSegment)) {
    return `/${firstSegment}`;
  }
  return "";
}

function signInUrl(request: Request, pathname: string) {
  return new URL(`${getLocalePrefix(pathname)}/sign-in`, request.url);
}

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // API routes: run auth checks only, skip i18n routing entirely.
  if (pathname.startsWith("/api")) {
    if (isAdminRoute(request)) {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.redirect(signInUrl(request, pathname));
      }
    }
    return NextResponse.next();
  }

  // Page routes: enforce auth first, then let next-intl handle locale routing.
  if (isProtectedRoute(request) || isAdminRoute(request)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(signInUrl(request, pathname));
    }
  }

  return handleI18n(request);
});

export const config = {
  matcher: [
    "/((?!_next|_vercel|monitoring-tunnel|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};
