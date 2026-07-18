/**
 * Type definitions for the copy module — single source of truth for every
 * prospect-facing Indonesian string on the landing page.
 *
 * Mirrors the catalog-data module conventions: UI consumes copy through the
 * query functions in `index.ts`; raw strings live in `data.ts` and are not
 * re-exported. All content is Indonesian and sourced from
 * `research/copy-research.md`. Unverifiable business claims are marked
 * `// TODO: verify owner` in `data.ts` and phrased neutrally — never asserted
 * as fact.
 */

/**
 * PAS (Problem-Agitate-Solution) directions for the hero headline.
 * - `aman`    : warmth/safety angle — "Safe Drive Training", beginner anchor.
 * - `trust`   : authority angle — 25 tahun + cabang (RECOMMENDED DEFAULT).
 * - `cepat`   : urgency angle — "kepepet" butuh bisa nyetir segera.
 */
export type HeroPasDirection = "aman" | "trust" | "cepat";

/** One PAS headline variant for the hero. */
export interface HeroVariant {
  direction: HeroPasDirection;
  /** Indonesian headline. */
  headline: string;
}

/** A trust-bar chip, e.g. "Sejak 2000". */
export interface TrustBarItem {
  /** Stable identifier for React keys. */
  id: string;
  /** Indonesian short label. */
  label: string;
}

/** All prospect-facing hero copy. */
export interface HeroCopy {
  /** All three PAS variants; UI renders the active one. */
  variants: readonly HeroVariant[];
  /** Recommended default variant key (trust/otoritas). */
  activeVariant: HeroPasDirection;
  /** Shared Indonesian subheadline rendered under the headline. */
  subheadline: string;
  /** Trust-bar chips below the subheadline. */
  trustBar: readonly TrustBarItem[];
}

/** Landing-page sections that carry a PAS-style header. */
export type SectionKey =
  | "hero"
  | "paket"
  | "testimonials"
  | "faq"
  | "cara-kerja";

/** Sections that carry short body copy beneath the header. */
export type BodySectionKey = "paket" | "testimonials" | "faq" | "cara-kerja";

/** WhatsApp-first, low-friction CTA labels (never "Daftar"/"Submit"). */
export interface CtaCopy {
  /** Primary CTA, e.g. "Tanya Jadwal via WhatsApp". */
  primary: string;
  /** Secondary CTA, e.g. "Chat Sekarang". */
  secondary: string;
  /**
   * In-page anchor destination for the primary hero CTA — distinct from
   * {@link CtaCopy.secondaryHref} so the two hero CTAs never collide
   * (issue #50 story #7). Always an in-page anchor (e.g. `#lokasi`).
   */
  primaryHref: string;
  /**
   * In-page anchor destination for the secondary hero CTA — distinct from
   * {@link CtaCopy.primaryHref} (issue #50 story #7).
   */
  secondaryHref: string;
}

/**
 * One step in the "Cara Kerja" (how it works) section. Each step describes
 * EXISTING Pulung behavior only — no invented claims. The numeric ordering is
 * carried by the array index in `data.ts`; the `id` is a stable React key.
 */
export interface CaraKerjaStep {
  /** Stable identifier for React keys, e.g. "pilih-paket". */
  id: string;
  /** Short Indonesian step title. */
  title: string;
  /** Indonesian step description — verified facts only. */
  description: string;
}

/**
 * Sticky bottom / floating CTA copy. The label is WhatsApp-first; the href is
 * an in-page anchor to the location picker (so the prospect reaches the
 * cluster-routed WA link rather than a generic number).
 */
export interface StickyCtaCopy {
  /** Indonesian CTA label, e.g. "Tanya Admin via WhatsApp". */
  label: string;
  /** In-page anchor, e.g. `#lokasi`. */
  href: string;
}

/** SEO / social-share meta copy, consumed by Next.js metadata in the root layout. */
export interface SeoCopy {
  /** `<title>` — keyword-aware, trust-angle. */
  title: string;
  /** Meta description (~160 chars). */
  description: string;
  /** Open Graph / social-card title. */
  ogTitle: string;
  /** Open Graph / social-card description. */
  ogDescription: string;
  /** Keyword hints for the Surabaya driving-school market. */
  keywords: readonly string[];
}

/**
 * Testimonial entry. Forward-compatible: the array is EMPTY today because
 * `research/copy-research.md` §1 found ZERO verbatim, verifiable customer
 * reviews. Do not fabricate entries — fill only with real, attributed quotes
 * once the owner supplies them.
 */
export interface TestimonialEntry {
  id: string;
  /** Indonesian first name + optional area, e.g. "Rina — Rungkut". */
  name: string;
  /** Verbatim Indonesian quote with written attribution/permission. */
  quote: string;
  /** Optional context line. */
  context?: string;
}

/** One FAQ question/answer pair for the landing accordion. */
export interface FaqEntry {
  /** Stable id for React keys + accordion ARIA control ids. */
  id: string;
  /** Indonesian question shown on the accordion trigger. */
  question: string;
  /** Indonesian answer shown in the expanded panel. */
  answer: string;
}

/**
 * Icon key for a credibility badge. UI resolves these to shared icon components
 * in `@/components/landing/icons` — keeping icon choice declarative in copy
 * (data-driven UI, no ad-hoc icons inline).
 */
export type CredibilityIconKey = "shield" | "calendar" | "steer";

/**
 * Surface tone for a credibility card. Drives tonal variety so the strip is
 * not three identical white cards. `primary` = bg-primary/5, `white` = bg-white
 * with neutral border.
 */
export type CredibilitySurface = "primary" | "white";

/** One badge in the credibility strip (trust signals under the hero). */
export interface CredibilityItem {
  /** Stable id for React keys. */
  id: string;
  /** Icon key — resolved by the UI to a shared icon component. */
  icon: CredibilityIconKey;
  /** Indonesian bold label, e.g. "Sejak 2000" or "Terdaftar Resmi". */
  label: string;
  /** Optional Indonesian supporting line below the label. */
  supportingLine?: string;
  /** Surface tone for visual variety. */
  surface: CredibilitySurface;
}
