import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing);

// Define route matchers (with locale prefix patterns)
const isPublicRoute = createRouteMatcher([
  "/",
  "/:locale",
  "/:locale/rsvp",
  "/:locale/contacto",
  "/:locale/contact",
  "/:locale/clasificacion",
  "/:locale/standings",
  "/:locale/partidos",
  "/:locale/matches",
  "/:locale/partidos/(.*)",
  "/:locale/matches/(.*)",
  "/:locale/nosotros",
  "/:locale/about",
  "/:locale/unete",
  "/:locale/join",
  "/:locale/gdpr",
  "/:locale/jugadores-historicos",
  "/:locale/legends",
  "/:locale/joaquin",
  "/:locale/sign-in(.*)",
  "/:locale/sign-up(.*)",
  "/api/contact",
  "/api/rsvp",
  "/api/matches",
  "/api/standings",
  "/api/gdpr",
]);

// Protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/:locale/dashboard(.*)",
]);

const isAdminRoute = createRouteMatcher([
  "/:locale/admin(.*)",
  "/api/admin(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  // Run next-intl middleware first to handle locale detection and routing
  const intlResponse = intlMiddleware(request);

  // Skip authentication for public routes
  if (isPublicRoute(request)) {
    return intlResponse;
  }

  // Get user info
  const { userId } = await auth();

  // Protected routes (dashboard, etc.) - require authentication
  if (isProtectedRoute(request)) {
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    return intlResponse;
  }

  // Admin route protection
  if (isAdminRoute(request)) {
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    return intlResponse;
  }

  // Default: allow access for non-matched routes
  return intlResponse;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
