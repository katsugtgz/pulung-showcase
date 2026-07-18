# src/components — landing sections + auth-provider

Two residents: `landing/` (10 Server-first sections + 1 animation wrapper, all consumed by `(public)/page.tsx`) and `auth-provider.tsx` (env-gated Clerk wrapper, mounted once per auth'd group layout). No `ui/` primitives, no shadcn/Radix, no `components.json`.

## STRUCTURE

```
src/components/
├── auth-provider.tsx                    # <AuthProvider> — env-gated ClerkProvider (brand appearance + idID)
└── landing/
    ├── index.ts                         # barrel — named re-exports of all 10 sections
    ├── header.tsx                       # sticky top bar (Server)
    ├── hero.tsx                         # LCP hero + PULUNG wordmark (Server) — NEVER wrap in <Reveal>
    ├── credibility-strip.tsx            # 3-badge trust strip (Server)
    ├── packages.tsx                     # package cards from @/lib/catalog-data (Server)
    ├── location-picker.tsx              # WhatsApp-routing UI ("use client", useState) ⚠️ business-critical
    ├── testimonials.tsx                 # Google Maps review cards from @/lib/maps-reviews (Server)
    ├── social-cards.tsx                 # IG/TikTok link cards (Server)
    ├── faq.tsx                          # single-open accordion ("use client", useState)
    ├── footer.tsx                       # cluster contacts (Server)
    ├── reveal.tsx                       # scroll-reveal wrapper ("use client", IntersectionObserver)
    └── __tests__/
        ├── faq.test.tsx                 # copy-source + accordion behaviour
        ├── reveal.test.tsx              # IntersectionObserver fallback (vi.stubGlobal)
        └── testimonials.test.tsx        # PAS header + id-ID rating + 6 entries
```

## WHERE TO LOOK

| Task | Location |
|---|---|
| Add a landing section | new `landing/<name>.tsx` (named export, Server unless state needed) → add to `index.ts` barrel → compose in `(public)/page.tsx` |
| Wrap a below-fold section in scroll-reveal | `<Reveal>...</Reveal>` — NEVER wrap `<Hero/>` (LCP protection) |
| Add an authenticated layout's Clerk wrapper | mount `<AuthProvider>` inside the group's `layout.tsx` (NOT at root) |
| Change Clerk appearance | `auth-provider.tsx` `appearance` constant (note: hardcodes `"#1e6fb8"` — drift risk vs `var(--color-primary)`) |
| Change brand colors | `src/app/globals.css` `@theme` (NOT here — `auth-provider.tsx` literal is the only drift) |
| Add an icon | inline SVG in the consuming file (no shared `icons.tsx` — `WhatsappIcon` is duplicated in `location-picker.tsx` + `footer.tsx`) |

## CONVENTIONS

- **Named exports only** — zero `export default` in this tree.
- **Server Components by default** — only 3 of 10 landing components are `"use client"`: `reveal.tsx` (effect), `faq.tsx` (state), `location-picker.tsx` (state).
- **File naming**: kebab-case file (`social-cards.tsx`) → PascalCase export (`SocialCards`).
- **Zero-arity sections take no props** — every section pulls its own data via `@/lib/{copy,catalog-data,maps-reviews,wa-router,format}`. Only `Reveal` and `AuthProvider` take `{children: ReactNode}`.
- **All copy via `@/lib/copy`** — never hardcode Indonesian strings in JSX (test enforces this for `Faq`, `Testimonials`).
- **Card grid pattern** (informal, hand-repeated): `<ul><li>` semantics with `<article>` inside; class `rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm`.
- **Section wrapper pattern** (informal): `<section className="px-6 py-10 lg:px-8 lg:py-16">` with `mx-auto max-w-md lg:max-w-7xl` inner, anchored heading via `id` + `aria-labelledby`.
- **CTA button**: `rounded-xl bg-primary px-5 py-2.5 hover:bg-primary-dark active:scale-[0.98]`. Accent (`bg-accent`) reserved for sparingly-used CTAs only (CSS comment enforces).
- **Motion tokens** in `src/app/globals.css` `:root`: `--reveal-dur: 500ms`, `--reveal-distance: 12px`, `--reveal-blur: 3px`, `--reveal-ease`. `.t-reveal` + `.is-shown` toggled by IntersectionObserver; `.t-reveal-failsafe` keyframe forces visible at 2.5s if JS fails. `prefers-reduced-motion` honored.

## ANTI-PATTERNS

- **Never wrap `<Hero/>` in `<Reveal>`** — Hero is LCP; deferred reveal tanks Lighthouse performance.
- **Never import from `landing/<file>` directly** — go through `landing/index.ts` barrel.
- **Never hardcode brand colors** — use `bg-primary`, `text-accent`, etc. generated from `@theme`. Only sanctioned arbitrary value is `bg-[#25D366]` for WhatsApp corporate green in `location-picker.tsx`.
- **Never add `"use client"` to a Server-capable section** — Lighthouse performance gate. Default to Server; opt-in only for state/effects.
- **Never add a default export** — breaks the barrel convention.

## NOTES

- **No shared icon library.** `WhatsappIcon` is duplicated in `location-picker.tsx` and `footer.tsx`; `StarIcon`, `PinIcon`, `ShieldIcon`, etc. are file-local. Extract opportunity when count grows.
- **No shared `<Card>` / `<Button>` primitive.** Each section repeats the informal class strings. Acceptable for 10 sections; extract if UI scales.
- **`auth-provider.tsx` `colorPrimary: "#1e6fb8"`** is the only hardcoded brand literal (vs `var(--color-primary)` elsewhere). Drift risk if token changes; consolidate when convenient.
- **Test coverage**: only `testimonials`, `faq`, `reveal` are tested. Missing: `header`, `hero`, `credibility-strip`, `packages`, `location-picker` (⚠️ business-critical — wires WA routing), `social-cards`, `footer`. Pattern to copy: `testimonials.test.tsx` asserts against the data module, not magic strings.
