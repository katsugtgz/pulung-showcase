# Pulung — agent notes

Demo prototype for **Kursus Mengemudi Pulung** (driving school, Surabaya, est. 2000). Mobile-first Next.js 16 App Router app: public landing + Clerk auth + course catalog + QRIS mock payment + siswa dashboard + admin dashboard (students, schedules, exports, PDF invoice/student-card).

**Generated:** 2026-07-18 · **Commit:** `71fe3c9` · **Branch:** `feat/45-landing-desktop-layout`

Full context: `docs/prd-proposal-aligned.md` (PRD, scope source of truth), `contact.md` (business data source of truth), `stitch/` (mobile design references), `DECISIONS.md` (3 ADRs).

Subdirectory guides: [`src/app/AGENTS.md`](src/app/AGENTS.md) · [`src/lib/AGENTS.md`](src/lib/AGENTS.md) · [`src/components/AGENTS.md`](src/components/AGENTS.md)

## STRUCTURE

```
pulung/
├── src/
│   ├── proxy.ts                  # Next 16 renamed middleware.ts → proxy.ts (Clerk RBAC edge guard)
│   ├── app/                      # App Router, 4 route groups — see src/app/AGENTS.md
│   │   ├── (public)/             # / + Clerk sign-in/up (NO ClerkProvider at root — ADR-002)
│   │   ├── (protected)/          # /dashboard, /catalog/* (plain auth, no role)
│   │   ├── (app)/app/            # siswa role: jadwal, kartu, invoice, cara-pakai
│   │   └── (admin)/admin/        # admin role: siswa, jadwal-*, ekspor
│   ├── components/               # landing sections + auth-provider — see src/components/AGENTS.md
│   ├── lib/                      # 10 module-per-feature modules — see src/lib/AGENTS.md
│   └── types/globals.d.ts        # Role = "admin" | "siswa"
├── docs/                         # PRD + admin/student guides + specs/
├── research/                     # copy-research.md (rounds 1+2) — provenance for src/lib/copy
├── scripts/qa/                   # 5 agent-browser E2E flows (Playwright forbidden)
├── stitch/                       # 4 mobile mockups + IBM Carbon design-system ref (NOT Pulung brand)
├── assets/                       # OCR source crops + raw icons — NOT served; prod images live in public/
├── public/images/                # only 2 prod SVGs: course-hero.svg, qris-placeholder.svg
├── qa-audit/                     # frozen evidence from feat/45 audit (historical, not living)
├── contact.md                    # business source of truth (branches, WA, prices)
└── DECISIONS.md                  # ADR-001 (TS 5.9.3), ADR-002 (Clerk-free landing), ADR-003 (wordmark WCAG)
```

## WHERE TO LOOK

| Task | Location | Notes |
|---|---|---|
| Change a price / branch / WA number | `src/lib/catalog-data/data.ts` ONLY | WA routing + invoices + exports all derive from here |
| Add a route | `src/app/<group>/<route>/` | MUST add `/path:.*` to `config.matcher` in `src/proxy.ts` if it calls `auth()` — omission = runtime 500 |
| Assign user role | `src/app/(admin)/admin/actions.ts` `setRole` | Writes to Clerk `publicMetadata.role` |
| Edit Indonesian copy | `src/lib/copy/data.ts` | Every unverified claim tagged `// TODO: verify owner` — never resolve with invented values |
| Add a server action | co-located `actions.ts` next to the page | All return `{ ok: true } \| { ok: false; error }` |
| Add a PDF document | new file in `src/lib/pdf/` reusing `brand.ts` | Follow `kartu-siswa.ts` pattern |
| Add a booking rule | `src/lib/jadwal-booking/index.ts::cekBentrok` | Single chokepoint for siswa + admin paths |
| Refresh Google reviews | `node scripts/fetch-maps-reviews.mjs` (manual, SerpAPI key) | Snapshot committed; zero runtime network |
| Edit-test a route locally | boot `pnpm dev` + `node scripts/qa/<flow>.mjs` | agent-browser only — Playwright forbidden |

## CONVENTIONS (deviations from standard Next.js)

- **`src/proxy.ts`** — Next 16 renamed `middleware.ts` → `proxy.ts`. Wires `clerkMiddleware` with `await auth()` + regex path matching (NOT `auth.protect()` — Organizations-only; NOT `createRouteMatcher` — deprecated in 7.x).
- **No `<ClerkProvider>` at root layout** (ADR-002). `<AuthProvider>` mounts Clerk only inside auth'd group layouts so `/` ships zero Clerk JS (avoids dev-handshake Lighthouse penalty). **Env-gated**: pass-through when `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is unset, so scaffold builds keyless.
- **RBAC via custom `publicMetadata.role`** (NOT Clerk Organizations). Two roles: `admin` (`/admin/*`) and `siswa` (`/app/*`). Defense-in-depth: proxy regex + per-layout re-check + per-action `requireAdmin()`.
- **Co-located route files** (no `_lib`/`_components`): `page.tsx` + sibling `actions.ts` (server actions) + `components.tsx`/`*-form.tsx` (client UI) + `labels.ts` + `__tests__/`. The only `_`-prefixed folders are `__tests__/`.
- **Module-per-feature in `src/lib/`**: every module = folder with `index.ts` (barrel/query API) + `types.ts` + `data.ts`/`store.ts` (private) + `__tests__/`. Consumers never touch raw data.
- **Server Components by default**; `"use client"` only when state/effects needed (3 of 10 landing components).
- **Named exports only** across `src/components/` (zero `export default`).
- **`passWithNoTests: true`** in vitest — green tests early isn't a signal; check actual file coverage.

## ANTI-PATTERNS (THIS PROJECT)

- **Never hardcode business data in UI** — branch numbers, WA numbers, prices flow only through `src/lib/catalog-data/`. Wrong WA cluster routing (A vs B) is a **real business bug**, not a code smell. Cluster A (MERR/South) `+62 811-0000-0001`, Cluster B (Manyar/Central) `+62 811-0000-0002`.
- **Never reintroduce stitch purple `#5e4399`.** Brand palette is locked: primary blue `#1E6FB8`, accent red `#D22B3A` (CTAs only, sparingly), neutrals white/gray.
- **No `as any`, `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`** anywhere (ADR-001). The `as unknown as DomainStore` cast in `src/lib/domain/store.ts` is the *only* sanctioned cast and is documented inline.
- **Playwright is forbidden** repo-wide. Browser QA via `agent-browser` CLI only.
- **Never use bare `npx lhci`** — resolves to an unrelated typosquat. Always `npx @lhci/cli@latest`.
- **Never fabricate visual content** — image work ALWAYS routes through `/vision-9router` skill (orchestrator is vision-blind). Requires `NINEROUTER_URL` (and `NINEROUTER_KEY` if auth on) — verify with `curl $NINEROUTER_URL/api/health` → `{"ok":true}`.
- **Never claim "dijamin lulus" / guaranteed pass** in copy (legal/ethical rule, enforced by `research/copy-research.md`).
- **Never edit `.github/workflows/ci.yml` to "fix" red CI** — GitHub Actions ALWAYS FAILS due to account billing issue (regardless of code quality). Run gates locally instead.
- **Never resolve `// TODO: verify owner` markers** in `src/lib/copy/data.ts` with invented values — they require owner confirmation.

## UNIQUE STYLES

- All user-facing strings in **Indonesian (Bahasa Indonesia)**. Clerk localization set to `idID`. Test descriptions may be Indonesian (domain logic) or English (pure-data/critical-path).
- TS pinned to **5.9.3** (latest *classic*), NOT 7.x — TS 7 is the native Go rewrite, incompatible with Next 16's classic-API build type-checker (ADR-001). Do NOT bump past 5.x without re-verifying the build type-check path.
- All deps pinned to latest stable/LTS (verified 2026-07-17): Node 24 LTS, Next 16.2.10, React 19.2.7, Tailwind 4.3.3 (CSS-first `@theme` — **no `tailwind.config.js`**), @clerk/nextjs 7.5.20, pnpm 11, Vitest 4.1.10, pdf-lib 1.17.1, exceljs 4.4.0.
- Auth factors: Google OAuth + Email/password ONLY. SMS OTP out of scope.
- Demo placeholder `DEMO_SISWA_ID = "siswa-001"` is hardcoded in ≥4 `(app)/app/*` routes — real `clerkUserId → siswaId` binding is a deferred epic. Note before any production path.
- All `pnujulid` prices are dummy (`priceIsDummy: true`); UI must show "*harga contoh". Real prices only via admin WhatsApp.
- SemVer, currently `0.x` (demo phase). `v1.0.0` = full PRD E1–E12 demoed end-to-end.

## COMMANDS

```bash
pnpm install
cp .env.example .env.local   # isi kunci Clerk & Gemini
pnpm dev                     # http://localhost:3000
```

**Quality gates (LOCAL — these are the real gates):**

```bash
pnpm build                          # wajib sukses (also runs TS type-check)
npx react-doctor@latest --json      # score must be 100 — below = reject the change
npx @lhci/cli@latest collect && npx @lhci/cli@latest assert   # all Lighthouse categories ≥ 0.9 (headless Chrome via CDP)
pnpm test                           # Vitest unit tests must pass
```

Placeholder images: generate via `agy` CLI. WA routing QA: `node scripts/qa/wa-link-correctness.mjs` (manual, business-critical).

## NOTES

- **Red CI on GitHub is expected and irrelevant.** Local gates above are the real signal.
- **Matcher in `src/proxy.ts` is an explicit allowlist** — every new auth-touching route group MUST be added to `config.matcher` or it 500s at runtime (commented `⚠️ WAJIB` in the file).
- **`pnpm-workspace.yaml` is not a monorepo** — it only carries pnpm policy keys (`minimumReleaseAge`, `trustPolicy`, allow/exclude lists). Single package.
- **`.claude/worktrees/happy-exploring-kernighan/`** is a stale locked worktree with duplicate test files — ignore in greps; vitest include pattern (`src/**/*.test.{ts,tsx}`) won't match it.
- Two top-level proposals (`Proposal Pulung.md`, `Pulung Proposal July 17 2026.md`) duplicate `docs/` content — prefer `docs/prd-proposal-aligned.md` as the canonical PRD.
