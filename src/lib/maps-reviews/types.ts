/**
 * Type definitions for the maps-reviews module.
 *
 * Mirrors `snapshot.json` — a committed snapshot of Pulung's three Google
 * Maps listings fetched via SerpAPI (refresh with
 * `scripts/fetch-maps-reviews.mjs`). The snapshot is repo data: builds and
 * runtime never call SerpAPI, so the rotating API key is not a deploy
 * dependency.
 */

export interface MapsReview {
  author: string;
  rating: number;
  /** Relative Indonesian date from Google Maps, e.g. "sebulan yang lalu". */
  date: string;
  /** Verbatim Indonesian review text — never rewritten or fabricated. */
  snippet: string;
}

export interface MapsBranch {
  /** Stable slug, e.g. "gunung-anyar". */
  slug: string;
  /** Indonesian display label, e.g. "Gunung Anyar". */
  label: string;
  /** Google Maps data_id — used by the refresh script, not by the UI. */
  dataId: string;
  /** Listing star rating as shown on Google Maps, e.g. 4.8. */
  rating: number;
  /** Total review count on the listing (larger than the snapshot sample). */
  reviewCount: number;
  reviews: MapsReview[];
}

export interface MapsSnapshot {
  /** ISO date (YYYY-MM-DD) the snapshot was fetched. */
  fetchedAt: string;
  source: string;
  branches: MapsBranch[];
}

export interface MapsBranchRatingSummary {
  slug: string;
  label: string;
  rating: number;
  reviewCount: number;
}

export interface MapsRatingSummary {
  /** Review-count-weighted average across listings, rounded to 1 decimal. */
  rating: number;
  /** Total review count across all listings. */
  reviewCount: number;
  branches: MapsBranchRatingSummary[];
}
