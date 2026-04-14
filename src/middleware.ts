import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define route matchers
const isPublicRoute = createRouteMatcher([
  "/",
  "/clasificacion",
  "/partidos",
  "/partidos/(.*)",
  "/nosotros",
  "/unete",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/matches",
  "/api/standings",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  // Continue with standard response (security headers now handled by next.config.js)
  const response = NextResponse.next();

  // Skip authentication for public routes
  if (isPublicRoute(request)) {
    return response;
  }

  // Get user info
  const { userId } = await auth();

  // Admin route protection - require authentication only
  // Role checking is handled by individual route handlers and HOCs
  if (isAdminRoute(request)) {
    if (!userId) {
      // Redirect to sign-in page
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    return response;
  }

  // Default: allow access for non-matched routes
  return response;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
