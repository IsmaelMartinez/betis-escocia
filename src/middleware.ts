import { clerkMiddleware } from "@clerk/nextjs/server";

// Clerk wrapper is retained until the Clerk removal iteration; security
// headers are handled by next.config.js, so the middleware is a no-op pass.
export default clerkMiddleware();

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
