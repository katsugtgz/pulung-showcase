# Architecture Decision Records — Pulung

## ADR-001: TypeScript 5.9.3 over 7.0.2

**Date:** 2026-07-17
**Status:** Accepted (lead-approved deviation from AGENTS.md original pin)

**Context:**
AGENTS.md originally pinned TypeScript 7.0.2 (npm `latest` dist-tag). TS 7.x is
the native Go rewrite ("tsgo"). Its package `exports` map points the main entry
(`.`) to `./lib/version.cjs`, which exports only `version`. The classic compiler
API (`createProgram`, `createIncrementalProgram`, `readConfigFile`,
`parseJsonConfigFileContent`, `ModuleKind`) is not exposed from the main entry.

Next.js 16.2.10's build type-checker
(`node_modules/next/dist/lib/typescript/runTypeCheck.js`) is classic-API only —
it calls `typescript.createProgram(...)` / `createIncrementalProgram(...)` and
helpers that depend on `ts.readConfigFile`. There is no native/CLI type-check
branch in this installed version. With TS 7.0.2, `next build` compiles
successfully but then crashes during `Running TypeScript ...` with:

```
The "id" argument must be of type string. Received undefined
Next.js build worker exited with code: 1
```

The `@typescript/native-preview` early-return path in
`verify-typescript-setup.js` only triggers when the `typescript` package is
*missing*; since 7.0.2 is installed, Next loads it and hits the classic API,
which is undefined.

**Decision:**
Pin `typescript@5.9.3` (latest classic-stable). This restores the classic
compiler API Next 16.x requires and preserves build-time strict type
enforcement — a load-bearing part of the project's quality model
("NO `as any`, NO `@ts-ignore`, NO `@ts-expect-error`").

**Alternatives rejected:**
- **TS 7.0.2 + `typescript.ignoreBuildErrors: true`**: makes the build pass but
  disables build-time type-checking, turning the "TypeScript strict mode" gate
  cosmetic.
- **TS 6.0.0-beta**: has the classic API but is a beta — unsuitable for a
  client demo.

**Consequence:**
Deviates from the AGENTS.md original "TS 7.0.2" pin. AGENTS.md will be updated
to reflect 5.9.3 so future agents don't re-hit this wall. 5.9.3 has every TS
feature used by this codebase.

## ADR-002: Public landing ships zero Clerk (provider + middleware scoped away from `/`)

**Date:** 2026-07-17
**Status:** Accepted (slice 8 polish, issue #9)

**Context:**
The landing (`/`) originally rendered `<ClerkProvider>` at the root layout and
its header used client Clerk components (`SignInButton`/`SignUpButton`/
`UserButton`/`Show`). The proxy matcher also ran `clerkMiddleware` on `/`.

On a Clerk **development** instance (`pk_test`), running the middleware on `/`
forces a blocking dev-browser handshake redirect chain on every fresh load:

```
/ → …clerk.accounts.dev/v1/client/handshake?__clerk_hs_reason=dev-browser-missing → /?__clerk_handshake=…
```

That ~1.8s redirect plus ~290 KiB of Clerk client JS and third-party cookies
tanked the landing's Lighthouse scores (performance 0.69, best-practices 0.75),
failing the issue #9 "all gates ≥0.9" acceptance criterion. The handshake does
**not** happen in production with a `pk_live` key, but this repo only has test
keys and the gate always cold-loads.

**Decision:**
Make the public landing genuinely Clerk-free.
- Remove `<ClerkProvider>` from the root layout; introduce `AuthProvider`
  (`src/components/auth-provider.tsx`, env-gated) and mount it only on the
  routes that use client Clerk: the auth pages (`<SignIn/>`/`<SignUp/>`) and the
  authenticated dashboards (`<UserButton/>`).
- The landing header uses static `<Link>`s to `/sign-in` and `/sign-up` instead
  of Clerk client components.
- Move the `UserButton` (account/sign-out) — previously only on the landing
  header — into the `/dashboard`, `/app`, and `/admin` dashboards.
- Scope the proxy matcher to the Clerk-touching routes (`/app`, `/admin`,
  `/dashboard`, `/catalog`, `/sign-in`, `/sign-up`); `/` is deliberately absent.

**Consequence:**
Landing loads in ~60ms with no third-party requests → performance 100,
best-practices 100, SEO 100. This also reflects a genuinely faster production
landing. Trade-off: signed-in visitors see "Masuk"/"Daftar" links on the
marketing page rather than their avatar (a conventional pattern for a public
landing); their account controls live on the dashboards. Auth enforcement is
unchanged — every protected route still redirects unauthenticated users to
`/sign-in` (verified via curl on `pnpm start`).

## ADR-003: Brand wordmark exempt from WCAG contrast (red on blue)

**Date:** 2026-07-17
**Status:** Accepted (slice 8 polish, issue #9)

**Context:**
Pulung's authentic 25-year street-banner identity is the red (`#D22B3A`)
"PULUNG" wordmark on the primary blue (`#1E6FB8`) field — a hard brand rule in
AGENTS.md. Those two colors are near iso-luminant, so their contrast ratio is
~1.03:1, far below WCAG's 3:1 (large text). Lighthouse's `color-contrast` audit
flags the hero `<h1>` and the sticky-header wordmark link.

**Decision:**
Preserve the brand wordmark as-is; accept the two `color-contrast` violations on
the decorative wordmark as an intentional exception. Every **other** a11y
contrast issue on the landing was fixed (hero secondary text bumped to
`text-white/90`+, frosted trust chips switched to bordered-only so white text
sits on the blue, footer `neutral-500/600` bumped to `neutral-400`, footer
social tap targets enlarged to ≥24px). Result: accessibility 0.96 — above the
AGENTS.md hard gate (no category < 0.9) — with the wordmark the sole remaining
flag.

**Alternatives rejected:**
- Recoloring the wordmark (white/dark) or placing it on a light plate: would
  pass the audit but violates the AGENTS.md brand rule and loses the banner
  identity. A white text-stroke reads better for humans but doesn't change
  Lighthouse's fill-vs-background computation, so it wouldn't clear the audit.

**Revisit if:** the client supplies an official logo/lockup, or approves a
contrast-safe wordmark treatment.
