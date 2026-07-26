# Pulung Design Contract

> Single source of truth for the visual + interaction language of the public
> landing (`/`) and shared section components under `src/components/landing/`.
> Read this before adding or refreshing a section.

**Status:** Accepted (2026-07-18). Companion to ADR-004 in `DECISIONS.md`.

## 1. Inspiration synthesis

The 2026 landing refresh synthesizes lessons from four product
brands studied at the pattern level only. **None of their proprietary assets,
copy, color tokens, or complete layouts are reproduced here** — Pulung's
brand palette is fixed in `globals.css` and must not drift toward any of
these references.

| Reference | What we took | What we explicitly did not take |
|---|---|---|
| **Uber** (marketing site) | Restrained typography scale, generous whitespace around a single dominant CTA per viewport, monochrome-led surfaces with one accent. | Black background, the "Move Anything" hero geometry, their custom typeface. |
| **Airbnb** (listing + marketing) | Honest imagery (real photos in real context) over stock illustration; section rhythm alternates light/dark bands to segment intent; microcopy leads with the user's verb. | Cereal pink/red, rounded "ubershield" badges, their illustration system, the Bélo logo lockup shape. |
| **Wise** (pricing + product) | Plain-language price presentation with the "Contoh" honesty tag for placeholders; numbers never animate; conversion-color CTAs sit on white, never on tonal gradients. | Wise green, their step-progress visualization, the multi-currency calculator. |
| **Tesla** (configurator + product) | Single brand color used as accent only (never as background for prose); dark polarity reserved for the "“big idea" hero band; spec-sheet typography (uppercase + tracking for eyebrows). | Tesla red, the configurator carousel, vehicle studio renders. |

Five principles survive the synthesis and run through the rest of this
document:

1. **Type carries the brand, not chrome.** Hierarchy is built from size,
   weight, and spacing — never from color blocks.
2. **Whitespace is the section divider.** Vertical rhythm beats card
   borders; do not stack bordered cards next to each other.
3. **One red CTA per viewport.** Red is the only conversion color; it
   appears once per scroll-stop.
4. **Imagery is honest.** Prefer the owner's branch photos. Every
   placeholder carries a visible "Contoh" overlay so the visitor never
   mistakes a stock image for a real branch.
5. **Motion never gates visibility.** Animation refines; it does not
   reveal. The page is fully readable with JS off or
   `prefers-reduced-motion: reduce`.

## 2. Color roles (semantic, not raw)

The tokens below are defined in `src/app/globals.css` under `@theme` and
generate utilities like `bg-primary`, `text-accent`, `border-neutral-200`.
**Never hardcode hex in section files.** The single sanctioned arbitrary
value is `bg-[#075E54]` for the WhatsApp dark-green CTA (see §6).

| Role | Token | Hex | Use |
|---|---|---|---|
| Primary surface / link | `--color-primary` | `#1e6fb8` | Brand blue. Primary buttons, links, in-page anchors, primary icons. |
| Primary surface (pressed/hover) | `--color-primary-dark` | `#185a99` | Hover/active state of primary buttons; sticky CTA bar background. |
| Primary surface (subtle accent) | `--color-primary-light` | `#4a8fce` | Decorative tints only — never on text. |
| Accent (CTA red) | `--color-accent` | `#d22b3a` | The ONE conversion CTA per viewport; the PULUNG wordmark. ADR-004: wordmark only sits on a light plate. |
| Accent (pressed/hover) | `--color-accent-dark` | `#a8222e` | Hover/active on accent buttons. |
| Surface base | `--color-neutral-50` | `#f8fafc` | Page background; the wordmark plate surface (ADR-004). |
| Surface card | white | `#ffffff` | Cards, primary CTA surface (so the red reads as 4.59:1+). |
| Border hairline | `--color-neutral-200` | `#e2e8f0` | Card outlines, divider rules. |
| Border emphasized | `--color-neutral-300` | `#cbd5e1` | Toggle/button borders in unselected state. |
| Body text | `--color-neutral-900` | `#0f172a` | All body copy. |
| Secondary text | `--color-neutral-600` | `#475569` | Captions, helper text. |
| Tertiary text | `--color-neutral-500` | `#64748b` | Meta/disclaimer text (`text-xs` only). |

**Contrast pairs that pass WCAG AA (4.5:1 normal, 3:1 large):**

| Pair | Ratio | Status |
|---|---|---|
| `neutral-900` on `neutral-50` | ~16.4:1 | Pass AAA |
| `neutral-600` on white | ~7.5:1 | Pass AAA |
| `neutral-500` on white | ~4.85:1 | Pass AA (normal) |
| `primary` on white | ~4.88:1 | Pass AA (normal) |
| `accent` on white | ~4.59:1 | Pass AA (large text ≥18px or ≥14px bold) |
| `accent` on `neutral-50` | ~4.66:1 | Pass AA (large text) |
| white on `primary-dark` | ~4.88:1 | Pass AA |
| white on `#075E54` (WhatsApp dark green) | ~7.67:1 | Pass AAA |
| `accent` on `primary` (forbidden — see ADR-003, ADR-004) | ~1.03:1 | **FAIL** — never use directly |

### The one-red-primary-CTA rule

Each viewport (one scroll-stop on mobile, one screen on desktop) renders
**at most one** accent-red button or accent-red display headline.

- The PULUNG wordmark on its ADR-004 light-pill surface does **not** count
  as the viewport's red CTA — the pill plate makes the wordmark a "name
  plate" lockup, materially different from a direct red element. The hero
  may therefore pair the pill wordmark with one `bg-accent` CTA button.
- A second action in the same viewport must be `bg-primary`, a text link,
  or an outline button (`border border-neutral-300`).
- Trust badges, package headers, and rating stars use `text-accent` as a
  small glyph color — that is a third category and does not count toward
  the one-button rule.
- The WhatsApp dark-green button is its own conversion color (cluster
  routing handoff, not the marketing conversion). It is allowed alongside
  one accent-red CTA.

## 3. Typography scale

`Inter` (loaded via `next/font/google` in `src/app/layout.tsx`) is the only
typeface. No second family. Weights available: 400 / 500 / 600 / 700.

| Token | Class | Size / line-height | Weight | Tracking | Use |
|---|---|---|---|---|---|
| Display | `text-4xl lg:text-5xl` | 36–48px / 1.1 | 700 | `-0.02em` (`tracking-tight`) | Hero `<h1>` only. One per page. |
| H2 | `text-2xl lg:text-3xl` | 24–30px / 1.2 | 700 | `-0.01em` (`tracking-tight`) | Section headings (`<h2>`). |
| H3 | `text-lg lg:text-xl` | 18–20px / 1.3 | 700 | normal | Card titles (`<h3>` / `<h4>`). |
| Body | `text-base` | 16px / 1.5 | 400 | normal | Body copy, default. |
| Body small | `text-sm` | 14px / 1.5 | 400 | normal | Helper text, secondary paragraphs. |
| Eyebrow | `text-xs uppercase tracking-wide` | 12px / 1.4 | 600 | `0.05em` | Optional section eyebrow; never a link. |
| Caption | `text-xs` | 12px / 1.4 | 400 | normal | Disclaimer / "Contoh" overlay / meta. |

**Eyebrow color** is always `text-primary` or `text-neutral-500`. Never
accent red (reserved for the CTA). **Bold eyebrows are forbidden** —
uppercase + tracking already signals meta.

## 4. Spacing tokens

Tailwind v4's default spacing scale. Pulung's spacing vocabulary:

| Class | px | Use |
|---|---|---|
| `gap-1` / `gap-1.5` | 4 / 6 | Icon + label inline. |
| `gap-2` | 8 | Compact button group, badge + label. |
| `gap-3` / `gap-4` | 12 / 16 | Card grid gutters (mobile). |
| `gap-6` / `gap-8` | 24 / 32 | Card grid gutters (desktop). |
| `px-6 lg:px-8` | 24 / 32 | Section horizontal padding (mobile / desktop). |
| `py-10 lg:py-16` | 40 / 64 | Section vertical padding (mobile / desktop). |
| `py-2.5` | 10 | Button vertical padding (default CTA). |
| `p-4` / `p-5` | 16 / 20 | Card inner padding (compact / standard). |

**Section wrapper pattern** (informal but mandatory):

```tsx
<section id="…" aria-labelledby="…-heading" className="px-6 py-10 lg:px-8 lg:py-16">
  <div className="mx-auto max-w-md lg:max-w-7xl">
    <h2 id="…-heading" className="text-2xl lg:text-3xl font-bold tracking-tight text-neutral-900">
      …
    </h2>
    {/* section body */}
  </div>
</section>
```

`max-w-md` (28rem / 448px) is the mobile content column; `lg:max-w-7xl`
(80rem / 1280px) is the desktop content column. Do not introduce a third
max-width.

## 5. Surface rhythm — three polarities only

Every section is one of three polarities. Do not invent a fourth.

1. **White card** (`bg-white border border-neutral-200`) — the default.
   Trust content, package cards, FAQ items, footer top.
2. **Tonal band** (`bg-neutral-50`) — section dividers and the page
   background. Use to separate two white-card sections without a hard
   rule. Never nest a tonal card inside a tonal band (loses the boundary).
3. **Dark polarity / primary band** (`bg-primary` or `bg-primary-dark`)
   — the hero band and one optional "anchor" band (e.g. a final
   testimonial pull-quote). Maximum two primary bands per page. Body
   text on a primary band is always `text-white` or `text-white/90`+;
   never `text-neutral-*`.

**Forbidden:** gradients (linear/radial/conic) as section backgrounds,
frosted/blurred surfaces as containers (frosted chips in the hero are
allowed only as small overlays, not as section surfaces), and any
background pattern that competes with imagery.

### Polarity alternation rule

Adjacent sections must not share polarity unless one is the page
background (`neutral-50`). Pattern from top to bottom:

```
hero          → primary band
credibility   → white card on neutral-50
packages      → white cards on neutral-50 (page bg)
location      → white card on neutral-50
testimonials  → white cards on neutral-50
social        → white cards on neutral-50
faq           → white cards on neutral-50
footer        → primary band (the second/last dark band)
```

If a section needs to *emphasize* (e.g. a closing call-to-action before
the footer), insert a single `primary` band. That is the only legal third
dark band, and only if the page has not already used its allotment.

## 6. WhatsApp conversion surface

The WhatsApp CTA is the only color outside the brand palette, because its
recognizability carries conversion. Its treatment is fixed:

- **Surface:** `bg-[#075E54]` (WhatsApp dark green). White text contrast
  ≈ 7.67:1 — passes WCAG AA / AAA.
- **Hover/active:** `bg-[#064a43]` (a 12% darker shade; keeps contrast).
- **Focus ring:** `focus-visible:ring-2 focus-visible:ring-[#075E54]
  focus-visible:ring-offset-2`.
- **Glyph:** `WhatsappIcon` from `@/components/landing/icons`, sized
  `h-4 w-4` (inline buttons) or `h-5 w-5` (footer link block).
- **Forbidden:** `bg-[#25D366]` (bright corporate green; white text
  contrast ≈ 1.98:1 — fails WCAG AA). The location-picker and footer
  must never regress to this value. A unit test in
  `__tests__/accessibility-baseline.test.tsx` locks it.

The WhatsApp button is allowed in the same viewport as one accent-red
CTA, because the two serve different intents (cluster-routing handoff
vs. marketing conversion).

## 7. Radii

| Class | px | Use |
|---|---|---|
| `rounded-full` | — | Badges, pills (the wordmark plate, "Cabang Utama" tag), avatar. |
| `rounded-2xl` | 16 | Standard card. |
| `rounded-xl` | 12 | Button default; emphasized card. |
| `rounded-lg` | 8 | Small buttons in a tight group (transmission toggle); inputs. |
| `rounded-md` | 6 | Inline code-like chips (rare). |

**No mixed radii inside one card.** If a card contains a button, the
button radius must be ≤ the card radius (so the button visually nests).
Never use `rounded-none` for a CTA.

## 8. Imagery

**Owner photography is the first choice.** Branch photos, instructor
photos, and any real Pulung-owned image beat every stock alternative.
When a real photo is unavailable:

- Use a generated SVG placeholder.
- Every placeholder MUST carry a visible "Contoh" overlay
  (`text-xs font-semibold uppercase tracking-wide`) so the visitor never
  mistakes a placeholder for a real branch. The overlay sits top-left on
  a `bg-neutral-900/70 text-white` chip, `rounded-md`, `m-2`.
- Imagery is never the primary CTA affordance. A photo of a car does not
  link to `/catalog` — text + button does.
- Decorative imagery gets `aria-hidden="true"`. Informative imagery gets
  an `alt` describing the content, never the file name.

**Forbidden:** AI-photorealistic renders of people; stock illustrations
of cartoon characters; any image with a third-party watermark; stock
photos that imply "dijamin lulus" (guaranteed pass).

## 9. Icon conventions

The shared vocabulary lives in `src/components/landing/icons.tsx`
(15 icons). Authoring rules:

- **Named exports only**, never a default export.
- **ViewBox 24×24** for general icons; **20×20** for the small
  `CheckIcon` and `StarIcon` glyphs (preserves the original path data;
  re-scaling would distort).
- **`aria-hidden="true"`** by default — every icon is decorative. If an
  icon carries meaning, the consuming section must add an accessible
  label via adjacent text or `aria-label` on the parent.
- **Color via `currentColor`** — never hardcode brand hex inside an
  icon. Consumers theme with `text-primary`, `text-accent`, etc.
- **Sizing via `className`** (e.g. `"h-5 w-5"`). Icons ship without a
  default size so the section controls the visual rhythm.
- **Stroke vocabulary:** 1.8 for trust/credibility icons, 2 for
  navigation arrows, fill-only for the small glyphs.
- **Server-safe** — no `"use client"` directive in `icons.tsx`.

When a section needs a new icon, add it to `icons.tsx` and re-export via
the `landing/index.ts` barrel. Do not declare a one-off inline SVG in a
section file.

## 10. Motion

`src/components/landing/reveal.tsx` is the only scroll-reveal primitive.
Its baseline rule:

- The `.t-reveal` class **only** applies a `translateY(10px)` offset;
  it never applies `opacity: 0` or `filter: blur()`. Content is fully
  visible at all times — the IntersectionObserver merely neutralizes the
  offset.
- `prefers-reduced-motion: reduce` disables the offset entirely
  (`.t-reveal { transform: none; transition: none; }`).
- If `IntersectionObserver` is undefined, the component sets
  `shown = true` immediately (see `reveal.tsx` line 22-25).

**Never wrap `<Hero>` in `<Reveal>`** — Hero is the LCP element;
deferring its paint tanks Lighthouse performance.

**Sticky CTA** motion is opt-in via `motion-safe:` — reduced-motion
users get an instant toggle, not a slide.

## 11. Responsive breakpoints

Mobile-first. The four targets:

| Breakpoint | Tailwind prefix | Min width | Target |
|---|---|---|---|
| Mobile (default) | — | 0 | iPhone SE / typical Android. Design column = `max-w-md` (448px). |
| `sm` | `sm:` | 640px | Large phone / small tablet (portrait). Toggle grids go 2-up here. |
| `md` | `md:` | 768px | Tablet (portrait). Rarely used on the landing. |
| `lg` | `lg:` | 1024px | Tablet (landscape) / small laptop. Section padding doubles; content column widens to `max-w-7xl` (1280px). |
| `xl` | `xl:` | 1280px | Desktop. Use sparingly — most sections cap at `max-w-7xl`. |
| `2xl` | `2xl:` | 1536px | Wide desktop. Avoid unless the layout genuinely benefits (it usually does not). |

**QA minimum widths:** 390 (iPhone 14), 768 (iPad portrait), 1024 (iPad
landscape / small laptop), 1440 (typical laptop). Each section must read
cleanly at all four.

## 12. Focus states (accessibility baseline)

Every interactive element (`<a>`, `<button>`, `[tabindex="0"]`) must
ship a visible focus indicator. The shared pattern:

```
focus:outline-none focus-visible:ring-2 focus-visible:ring-{token} focus-visible:ring-offset-2
```

- The ring token matches the element's surface color (`ring-primary` on
  light surfaces; `ring-white` on `bg-primary` surfaces like StickyCta;
  `ring-[#075E54]` on WhatsApp buttons).
- `ring-offset-2` keeps the ring off the element's chrome.
- `outline-none` removes the default and `focus-visible:` restricts the
  custom ring to keyboard / programmatic focus (mouse clicks don't show
  it — matches modern Windows / macOS conventions).

The accessibility-baseline test
(`__tests__/accessibility-baseline.test.tsx`) asserts every interactive
element across the landing renders a `focus-visible:ring-` class. Do
not regress.

## 13. Do / Don't

**Do:**
- Source every Indonesian string from `@/lib/copy/` — never hardcode in
  JSX. The copy module is typed; section tests assert against it.
- Source every business datum (branches, prices, WhatsApp numbers) from
  `@/lib/catalog-data/` — wrong cluster routing is a real business bug.
- Wrap below-the-fold sections in `<Reveal>` for the subtle translateY
  settle. Never wrap `<Hero>` (LCP).
- Use Server Components by default. Mark `"use client"` only when state
  or effects are genuinely required (currently: `Reveal`, `Faq`,
  `LocationPicker`, `StickyCta`).
- Anchor every section: `id` + `aria-labelledby` pointing at the
  heading. Smooth-scroll anchors (#packages, #lokasi, #faq) depend on
  it.
- Prefer real owner photography. Mark placeholders with "Contoh".
- Pair every red conversion CTA with a non-red secondary action (`bg-primary`
  button, text link, or outline button).

**Don't:**
- Don't reintroduce the legacy mockup purple `#5e4399`. The palette is locked.
- Don't hardcode `bg-[#25D366]` for WhatsApp — that bright green fails
  WCAG on white text. Use `bg-[#075E54]`.
- Don't use `bg-accent` as a section background. Red is for the one CTA
  button / display wordmark only.
- Don't wrap `<Hero>` in `<Reveal>`. LCP protection.
- Don't import from `landing/<file>` directly. Go through the
  `landing/index.ts` barrel.
- Don't add `"use client"` to a Server-capable section. Lighthouse
  performance gate.
- Don't add a default export anywhere under `src/components/`. Named
  exports only.
- Don't use `as any`, `@ts-ignore`, `@ts-expect-error`, or
  `@ts-nocheck`. ADR-001.
- Don't invent a new logo / emblem / monogram. The lockup is the red
  wordmark on a light plate (ADR-004) — that is the entire brand mark.
- Don't claim "dijamin lulus" or invent owner-unverified copy.

## 14. Change protocol

This document is the contract. Tokens move with the code:

1. Adding / changing a token: edit `src/app/globals.css` `@theme` first,
   then update §2 (or the relevant section) here in the same commit.
2. Adding a section: follow §5 (polarity) and §11 (breakpoints); verify
   the section's interactive elements pass §12 (focus rings).
3. Adding an icon: follow §9, add to `icons.tsx`, re-export via
   `landing/index.ts`.
4. Adding a new conversion color (e.g. a payment-partner brand color):
   open an ADR first, then add a §6-style entry here. Never ad hoc.

The accessibility-baseline test in
`src/components/landing/__tests__/accessibility-baseline.test.tsx` is the
executable guardrail for §6 (WhatsApp surface), §10 (Reveal visibility),
and §12 (focus rings). Section tests assert the rest.
