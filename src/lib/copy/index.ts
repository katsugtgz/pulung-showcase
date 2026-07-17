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
  cta,
  heroCopy,
  heroVariants,
  sectionBody,
  sectionHeaders,
  testimonials,
} from "./data";
import type {
  BodySectionKey,
  CtaCopy,
  HeroCopy,
  HeroPasDirection,
  HeroVariant,
  SectionKey,
  TestimonialEntry,
} from "./types";

export type {
  BodySectionKey,
  CtaCopy,
  HeroCopy,
  HeroPasDirection,
  HeroVariant,
  SectionKey,
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
 * Empty today — research found ZERO verifiable customer reviews (see
 * `data.ts`). Returns a fresh empty array so callers can never mutate source.
 * Fill only with real, attributed quotes once the owner supplies them.
 */
export function getTestimonials(): readonly TestimonialEntry[] {
  return [...testimonials];
}
