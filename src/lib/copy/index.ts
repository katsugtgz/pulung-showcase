/**
 * copy — typed query interface over all prospect-facing Indonesian landing-page
 * strings. Single source of truth for hero/section headers/body/CTA copy,
 * sibling to the catalog-data module and mirroring its conventions.
 *
 * UI MUST consume copy through these functions; raw strings live in `data.ts`
 * and are intentionally not re-exported here. `getHeroVariant` / `getSection*`
 * throw a TypeError on unknown keys so callers surface the failure loudly.
 *
 * Sourcing & verification rules: see `data.ts`. Unverified claims are marked
 * `// TODO: verify owner` and phrased neutrally — never displayed as fact.
 */

import {
  activeHeroVariant,
  caraKerjaSteps,
  cta,
  credibility,
  faq,
  heroCopy,
  heroVariants,
  locationTransmissionHelp,
  samplePriceDisclaimer,
  sectionBody,
  sectionHeaders,
  seo,
  stickyCta,
  testimonials,
} from "./data";
import type {
  BodySectionKey,
  CaraKerjaStep,
  CredibilityItem,
  CtaCopy,
  FaqEntry,
  HeroCopy,
  HeroPasDirection,
  HeroVariant,
  SectionKey,
  SeoCopy,
  StickyCtaCopy,
  TestimonialEntry,
} from "./types";

export type {
  BodySectionKey,
  CaraKerjaStep,
  CredibilityIconKey,
  CredibilityItem,
  CredibilitySurface,
  CtaCopy,
  FaqEntry,
  HeroCopy,
  HeroPasDirection,
  HeroVariant,
  SectionKey,
  SeoCopy,
  StickyCtaCopy,
  TestimonialEntry,
  TrustBarItem,
} from "./types";

/** Full hero copy block (variants, active variant, subheadline, trust-bar). */
export function getHeroCopy(): HeroCopy {
  return {
    variants: [...heroCopy.variants],
    activeVariant: heroCopy.activeVariant,
    subheadline: heroCopy.subheadline,
    trustBar: [...heroCopy.trustBar],
  };
}

/** The recommended default (active) PAS variant for the hero. */
export function getActiveHeroVariant(): HeroVariant {
  return getHeroVariant(activeHeroVariant);
}

/** Look up a hero variant by PAS direction; throws TypeError if unknown. */
export function getHeroVariant(direction: HeroPasDirection): HeroVariant {
  for (const variant of heroVariants) {
    if (variant.direction === direction) return { ...variant };
  }
  throw new TypeError(`Unknown hero PAS direction: ${direction}`);
}

/**
 * PAS-style section header. For `hero`, returns the active variant's headline
 * (single source of truth — avoids drift between section headers and variants).
 * For other sections, returns the curated header from `data.ts`.
 */
export function getSectionHeader(section: SectionKey): string {
  if (section === "hero") {
    return getActiveHeroVariant().headline;
  }
  const header = sectionHeaders[section];
  if (header === undefined) {
    throw new TypeError(`Unknown section: ${section}`);
  }
  return header;
}

/** Short body copy for a section; throws TypeError if the section has none. */
export function getSectionBody(section: BodySectionKey): string {
  const body = sectionBody[section];
  if (body === undefined) {
    throw new TypeError(`Unknown body section: ${section}`);
  }
  return body;
}

/** WhatsApp-first CTA labels (primary + secondary). */
export function getCta(): CtaCopy {
  return { ...cta };
}

/**
 * Real Google Maps reviews, verbatim, curated from the committed SerpAPI
 * snapshot (`@/lib/maps-reviews`). Returns a fresh array so callers can
 * never mutate source. No-fabrication rule holds: only attributed quotes.
 */
export function getTestimonials(): readonly TestimonialEntry[] {
  return [...testimonials];
}

/** Landing FAQ Q&A entries. Returns a fresh array so callers can't mutate source. */
export function getFaq(): readonly FaqEntry[] {
  return faq.map((entry) => ({ ...entry }));
}

/**
 * SEO / social-share meta copy for the root layout's Next.js metadata. Returns a
 * fresh keywords array so callers can never mutate source.
 */
export function getSeoCopy(): SeoCopy {
  return { ...seo, keywords: [...seo.keywords] };
}

/**
 * Credibility strip badges — three trust signals rendered compactly under the
 * hero (registration, founding year, motto). All facts are verified in
 * `data.ts`. Returns a fresh array so callers can never mutate source.
 */
export function getCredibility(): readonly CredibilityItem[] {
  return credibility.map((item) => ({ ...item }));
}

/**
 * "Cara Kerja" steps — three ordered steps describing existing Pulung
 * behavior (choose package → choose branch → chat routed admin). Returns a
 * fresh array so callers can never mutate source.
 */
export function getCaraKerja(): readonly CaraKerjaStep[] {
  return caraKerjaSteps.map((step) => ({ ...step }));
}

/**
 * One-line Indonesian microcopy for the location picker's transmission toggle,
 * explaining that the choice personalizes the WhatsApp inquiry (issue #50
 * story #14).
 */
export function getLocationTransmissionHelp(): string {
  return locationTransmissionHelp;
}

/**
 * Sticky floating CTA copy. Routes to #lokasi so the prospect reaches the
 * cluster-routed WhatsApp link rather than a generic number.
 */
export function getStickyCta(): StickyCtaCopy {
  return { ...stickyCta };
}

/**
 * Canonical Indonesian sample-price disclaimer — single source of truth for
 * the "*harga contoh" tag used on package cards, FAQ answers, and any future
 * surface that displays dummy catalog prices.
 */
export function getSamplePriceDisclaimer(): string {
  return samplePriceDisclaimer;
}
