/**
 * maps-reviews — typed query interface over Pulung's real Google Maps
 * reputation, sibling to catalog-data/copy and mirroring their conventions.
 *
 * Data source is the committed `snapshot.json` (SerpAPI
 * google_maps_reviews; refresh manually with
 * `scripts/fetch-maps-reviews.mjs`). Zero network at build or runtime — the
 * landing page renders ratings and reviews fully offline, and the rotating
 * SerpAPI key is never needed to deploy.
 *
 * All numbers are COMPUTED from the snapshot; nothing is hardcoded, and
 * quotes are verbatim (trimmed only) — never rewritten or fabricated.
 */

import snapshotJson from "./snapshot.json";
import type { TestimonialEntry } from "@/lib/copy/types";
import type {
  MapsBranch,
  MapsRatingSummary,
  MapsSnapshot,
} from "./types";

export type {
  MapsBranch,
  MapsBranchRatingSummary,
  MapsRatingSummary,
  MapsReview,
  MapsSnapshot,
} from "./types";

const snapshot = snapshotJson as MapsSnapshot;

/**
 * Aggregate Google Maps rating across all Pulung listings: review-count-
 * weighted average (1 decimal) plus the total review count and per-branch
 * breakdown.
 */
export function getMapsRating(): MapsRatingSummary {
  const branches = snapshot.branches.map(
    ({ slug, label, rating, reviewCount }) => ({
      slug,
      label,
      rating,
      reviewCount,
    }),
  );
  const reviewCount = branches.reduce((sum, b) => sum + b.reviewCount, 0);
  if (reviewCount === 0) {
    return { rating: 0, reviewCount: 0, branches };
  }
  const weighted = branches.reduce(
    (sum, b) => sum + b.rating * b.reviewCount,
    0,
  );
  return {
    rating: Math.round((weighted / reviewCount) * 10) / 10,
    reviewCount,
    branches,
  };
}

const TESTIMONIAL_COUNT = 6;

interface Candidate {
  slug: string;
  label: string;
  author: string;
  quote: string;
  /** Index of the review within its branch's snapshot array — stable id. */
  reviewIndex: number;
}

/** 5-star reviews with a non-empty quote, longest (most informative) first. */
function candidatesFor(branch: MapsBranch): Candidate[] {
  const candidates: Candidate[] = [];
  for (const [reviewIndex, review] of branch.reviews.entries()) {
    const quote = review.snippet.trim();
    if (review.rating !== 5 || quote.length === 0) continue;
    candidates.push({
      slug: branch.slug,
      label: branch.label,
      author: review.author,
      quote,
      reviewIndex,
    });
  }
  return candidates.sort((a, b) => b.quote.length - a.quote.length);
}

/**
 * Six curated real Google reviews as landing testimonials: the strongest
 * quote from every branch first (each cabang represented), then the longest
 * remaining quotes across branches.
 */
export function getMapsTestimonials(): TestimonialEntry[] {
  const perBranch = snapshot.branches.map(candidatesFor);
  const picked: Candidate[] = [];
  for (const list of perBranch) {
    if (list.length > 0) picked.push(list[0]);
  }
  const rest = perBranch
    .flatMap((list) => list.slice(1))
    .sort((a, b) => b.quote.length - a.quote.length);
  for (const candidate of rest) {
    if (picked.length >= TESTIMONIAL_COUNT) break;
    picked.push(candidate);
  }
  return picked.map((c) => ({
    id: `maps-${c.slug}-${c.reviewIndex}`,
    name: c.author,
    quote: c.quote,
    context: `Ulasan Google — cabang ${c.label}`,
  }));
}
