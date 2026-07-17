import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextMiddleware, type NextRequest } from "next/server";

/*
 * Env-gated Clerk proxy with custom RBAC role guards.
 *
 * When no Clerk publishable key is configured the proxy becomes a pass-through
 * so the scaffold builds and runs without real keys. Auth + role checks
 * activate once NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set.
 *
 * Next.js 16 renamed `middleware.ts` to `proxy.ts`; Clerk's `clerkMiddleware`
 * helper is unchanged. Per Clerk 7 guidance we read session claims via
 * `await auth()` inside the middleware (NOT `auth.protect()`, which is
 * Organizations-only; NOT `createRouteMatcher`, which is deprecated in 7.x
 * and logs a runtime warning — we use native Next.js path matching instead).
 *
 * Role model (custom RBAC via publicMetadata, NOT Organizations):
 *   - /admin/*  -> requires sessionClaims.metadata.role === 'admin'
 *   - /app/*    -> requires sessionClaims.metadata.role === 'siswa'
 *   - everything else -> public (the existing (protected) group keeps its own
 *     plain-auth gate via auth().protect() in its layout)
 *
 * Unauthenticated users are sent to /sign-in; authenticated-but-wrong-role
 * users are sent to / to avoid redirect loops (Clerk bounces signed-in users
 * back from /sign-in, so /sign-in is only for the truly unauthenticated).
 */

const clerkEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

const ADMIN_PATTERN = /^\/admin(\/|$)/;
const APP_PATTERN = /^\/app(\/|$)/;

const clerk = clerkMiddleware(async (auth, req: NextRequest) => {
  const path = req.nextUrl.pathname;

  if (ADMIN_PATTERN.test(path)) {
    const { sessionClaims } = await auth();
    if (!sessionClaims) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    if (sessionClaims.metadata?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return;
  }

  if (APP_PATTERN.test(path)) {
    const { sessionClaims } = await auth();
    if (!sessionClaims) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    if (sessionClaims.metadata?.role !== "siswa") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return;
  }
});

const passthrough: NextMiddleware = () => NextResponse.next();

export default clerkEnabled ? clerk : passthrough;

/*
 * Matcher is scoped so the PUBLIC LANDING (/) never runs clerkMiddleware. Every
 * other Clerk-touching route is listed: the auth pages (/sign-in, /sign-up,
 * whose <AuthProvider> SSRs auth()), the RBAC groups (/app, /admin), and the
 * plain-auth group (/dashboard, /catalog). The landing is intentionally absent:
 *   - It is a pure marketing page that ships zero Clerk JS (its header uses
 *     static links to the auth pages), so no server middleware is needed.
 *   - On a Clerk *development* instance, running the middleware on / forces a
 *     blocking dev-browser handshake redirect (…/v1/client/handshake?
 *     __clerk_hs_reason=dev-browser-missing) on every fresh load. That ~1.8s
 *     redirect chain tanks Lighthouse performance/best-practices on the landing
 *     (and never happens in production with a pk_live key). Keeping / out of
 *     the matcher makes the public page fast & cookie-free while every route
 *     that calls auth()/auth.protect() below stays fully covered.
 * See DECISIONS.md ADR-002.
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/catalog/:path*",
    "/app/:path*",
    "/admin/:path*",
    "/sign-in/:path*",
    "/sign-up/:path*",
    // Always run for API and tRPC routes.
    "/(api|trpc)(.*)",
    // Clerk auto-proxy path (Clerk 7 helper routes). Must come after the
    // API/TRPC matcher — see https://clerk.com/docs/nextjs/middleware.
    "/__clerk/:path*",
  ],
};
