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

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  // API routes: run auth checks only, skip i18n routing entirely.
  if (pathname.startsWith("/api")) {
    if (isAdminRoute(request)) {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
    }
    return NextResponse.next();
  }

  // Page routes: enforce auth first, then let next-intl handle locale routing.
  if (isProtectedRoute(request) || isAdminRoute(request)) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
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
