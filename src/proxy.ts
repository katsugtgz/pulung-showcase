import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextMiddleware } from "next/server";

/*
 * Env-gated Clerk proxy: when no Clerk publishable key is configured the proxy
 * becomes a pass-through so the scaffold builds and runs without real keys.
 * Auth activates once NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set.
 *
 * Next.js 16 renamed the `middleware.ts` convention to `proxy.ts`; Clerk's
 * `clerkMiddleware` helper is unchanged. Per Clerk 7 guidance, route protection
 * (auth().protect()) lives in the protected route/layout, not in the proxy.
 */
const clerkEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

const clerk = clerkMiddleware();

const passthrough: NextMiddleware = () => NextResponse.next();

export default clerkEnabled ? clerk : passthrough;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files (paths with an extension).
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API and tRPC routes.
    "/(api|trpc)(.*)",
    // Clerk auto-proxy path (Clerk 7 helper routes). Must come after the
    // API/TRPC matcher — see https://clerk.com/docs/nextjs/middleware.
    "/__clerk/:path*",
  ],
};
