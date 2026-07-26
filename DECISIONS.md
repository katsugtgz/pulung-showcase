# Architecture Decision Records — Pulung

## ADR-001: TypeScript 5.9.3 over 7.0.2

**Date:** 2026-07-17
**Status:** Accepted (lead-approved deviation from the original pin)

**Context:**
The project originally pinned TypeScript 7.0.2 (npm `latest` dist-tag). TS 7.x is
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
Deviates from the original "TS 7.0.2" pin; the project docs were updated to
reflect 5.9.3 so this wall isn't re-hit. 5.9.3 has every TS feature used by
this codebase.

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
**Status:** Superseded by ADR-004 (2026-07-18). Body retained for historical context.

**Context:**
Pulung's authentic 25-year street-banner identity is the red (`#D22B3A`)
"PULUNG" wordmark on the primary blue (`#1E6FB8`) field — a hard brand rule for
this project. Those two colors are near iso-luminant, so their contrast ratio is
~1.03:1, far below WCAG's 3:1 (large text). Lighthouse's `color-contrast` audit
flags the hero `<h1>` and the sticky-header wordmark link.

**Decision:**
Preserve the brand wordmark as-is; accept the two `color-contrast` violations on
the decorative wordmark as an intentional exception. Every **other** a11y
contrast issue on the landing was fixed (hero secondary text bumped to
`text-white/90`+, frosted trust chips switched to bordered-only so white text
sits on the blue, footer `neutral-500/600` bumped to `neutral-400`, footer
social tap targets enlarged to ≥24px). Result: accessibility 0.96 — above the
project's hard gate (no category < 0.9) — with the wordmark the sole remaining
flag.

**Alternatives rejected:**
- Recoloring the wordmark (white/dark) or placing it on a light plate: would
  pass the audit but violates the brand rule and loses the banner
  identity. A white text-stroke reads better for humans but doesn't change
  Lighthouse's fill-vs-background computation, so it wouldn't clear the audit.

**Revisit if:** the client supplies an official logo/lockup, or approves a
contrast-safe wordmark treatment.

## ADR-004: Reopened wordmark contrast — restrained light lockup surface (supersedes ADR-003's exemption)

**Date:** 2026-07-18
**Status:** Accepted (landing refresh issue #50). Supersedes the contrast
*exemption* in ADR-003 — ADR-003's brand-preservation rule (red `#D22B3A`
wordmark, blue `#1E6FB8` field both stay) is KEPT; only the surface treatment
changes.

**Context:**
ADR-003 accepted two `color-contrast` audit failures as an intentional
exception because the only alternatives available then were recoloring the
wordmark (brand violation) or adding a text-stroke (which Lighthouse's
fill-vs-background computation ignores). Issue #50 (landing refresh, 45 user
stories) reopens the question because:

1. **Measured old ratios** (sRGB relative luminance, WCAG 2.1 §1.4.11):
   - Red `#D22B3A` wordmark directly on primary blue `#1E6FB8` field:
     **~1.03:1** — far below the 3:1 large-text minimum. The two brand colors
     are near iso-luminant.
   - White `#FFFFFF` on the bright WhatsApp corporate green `#25D366` used on
     the branch-card CTA buttons: **~1.98:1** — also below 3:1. (Pre-existing
     finding; not introduced by the refresh.)
2. The 45-story refresh introduces *new* surfaces where the red-on-blue
   wordmark would appear at functional sizes (sticky CTA bar, refreshed hero
   lockups). Letting the exemption propagate would multiply the audit failures.
3. ADR-003 always carried a "revisit if the client approves a contrast-safe
   wordmark treatment" clause. The owner has now approved the restrained
   surface treatment described below.

**Decision:**
The red Pulung wordmark must NO LONGER sit directly on the primary blue field
as functional display text. The approved treatment is a **restrained light
lockup surface**: a white or `neutral-50` plate / pill placed behind the red
wordmark wherever it appears as functional display text (hero `<h1>`, sticky
header wordmark link, sticky CTA). On the light surface, red `#D22B3A` on
white measures **~4.59:1** and on `neutral-50` `#f8fafc` measures **~4.66:1** —
both pass WCAG 2.1 large-text 3:1 comfortably and clear Lighthouse's
`color-contrast` audit.

Equivalently, an owner-supplied official logo/lockup with measured ≥3:1
contrast may replace the plate+wordmark lockup entirely.

**Explicitly NOT done:**
- Do **not** invent a symbolic logo mark (no icon, no emblem, no monogram).
  The lockup stays as the wordmark on a surface — that is the entire change.
- Do **not** recolor the wordmark itself — it stays `#D22B3A` red. ADR-003's
  "preserve the brand wordmark" rule is preserved.
- Do **not** recolor the primary blue field or change the body background of
  the hero — the blue stays where it is; only the wordmark gets a local light
  surface.

**Accessibility rationale:**
WCAG 2.1 Success Criterion 1.4.11 (Non-text Contrast) and §1.4.6 (Contrast
Enhanced) treat large display text as needing ≥3:1 against its adjacent
background. The iso-luminant red-on-blue pair physically cannot meet that bar
without a separating surface. A light plate behind the wordmark:
- Preserves the banner identity (the red wordmark is still red; the blue field
  is still blue; the light plate reads as a "name plate" cutout).
- Restores the audit to a clean pass (no special-case exemption to maintain).
- Costs no new asset, no new dependency, no recolor.
- Is reversible: if the owner later supplies an official logo, drop the plate
  and use the logo (with contrast re-measured).

**Brand rule preserved (ADR-003 §Decision):**
- Primary blue `#1E6FB8` (and `-dark`/`-light` variants) — unchanged.
- Accent red `#D22B3A` (CTAs and the wordmark) — unchanged.
- Neutral scale (white, `neutral-50` … `neutral-900`) — unchanged.
- Forbidden: legacy mockup purple `#5e4399` (still forbidden).

The only delta vs ADR-003 is **where the red wordmark is allowed to sit**: not
directly on the blue field; on a light surface.

**Alternatives rejected:**
- **Recolor the wordmark to white/dark** (one of ADR-003's rejected options):
  still a brand violation; the banner identity is the *red* wordmark.
- **White text-stroke around the red wordmark** (ADR-003's other rejected
  option): improves human readability but does not change Lighthouse's
  fill-vs-background math; audit still fails.
- **Drop the wordmark from new surfaces entirely**: loses brand recall on the
  sticky CTA / refreshed hero. The light plate keeps the wordmark visible
  everywhere it needs to be.
- **Adopt a third-party logo lockup**: no owner-supplied official logo exists.
  Inventing one violates the no-fabrication rule.

**Consequence:**
- The two ADR-003 `color-contrast` exemptions are retired; the landing should
  now clear Lighthouse accessibility ≥0.9 with zero contrast flags.
- Section authors implementing the refreshed hero, sticky header, and sticky
  CTA must wrap the red PULUNG wordmark in a `bg-white` / `bg-neutral-50`
  plate or pill (rounded, padded) — the brand color tokens themselves do not
  change.
- ADR-003 stays in the ledger for historical context but its "Accepted"
  contrast exemption is superseded by this ADR's "restrained light surface"
  decision.
- **Revisit if:** the owner supplies an official logo with measured ≥3:1
  contrast, in which case the plate is removed and the logo is used directly.
