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
export type SectionKey = "hero" | "paket" | "testimonials" | "faq";

/** Sections that carry short body copy beneath the header. */
export type BodySectionKey = "paket" | "testimonials" | "faq";

/** WhatsApp-first, low-friction CTA labels (never "Daftar"/"Submit"). */
export interface CtaCopy {
  /** Primary CTA, e.g. "Tanya Jadwal via WhatsApp". */
  primary: string;
  /** Secondary CTA, e.g. "Chat Sekarang". */
  secondary: string;
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
