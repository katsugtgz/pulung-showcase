import { describe, expect, it } from "vitest";
import { getMapsRating, getMapsTestimonials } from "../index";
import snapshotJson from "../snapshot.json";
import type { MapsSnapshot } from "../types";

const snapshot = snapshotJson as MapsSnapshot;

describe("getMapsRating", () => {
  it("exposes all three Pulung listings", () => {
    const { branches } = getMapsRating();
    const slugs = branches.map((b) => b.slug).sort();
    expect(slugs).toEqual(["gunung-anyar", "manyar", "merr"]);
  });

  it("computes the review-count-weighted average from the snapshot", () => {
    const { rating, reviewCount } = getMapsRating();
    const total = snapshot.branches.reduce((s, b) => s + b.reviewCount, 0);
    const weighted = snapshot.branches.reduce(
      (s, b) => s + b.rating * b.reviewCount,
      0,
    );
    expect(reviewCount).toBe(total);
    expect(rating).toBe(Math.round((weighted / total) * 10) / 10);
  });

  it("stays within star-rating bounds with a plausible review volume", () => {
    const { rating, reviewCount } = getMapsRating();
    expect(rating).toBeGreaterThanOrEqual(1);
    expect(rating).toBeLessThanOrEqual(5);
    expect(reviewCount).toBeGreaterThan(0);
  });
});

describe("getMapsTestimonials", () => {
  it("curates exactly six entries", () => {
    expect(getMapsTestimonials()).toHaveLength(6);
  });

  it("represents every branch at least once", () => {
    const contexts = getMapsTestimonials().map((t) => t.context);
    for (const branch of snapshot.branches) {
      expect(
        contexts.some((c) => c === `Ulasan Google — cabang ${branch.label}`),
      ).toBe(true);
    }
  });

  it("only surfaces verbatim 5-star quotes from the snapshot", () => {
    const allSnippets = new Set(
      snapshot.branches.flatMap((b) =>
        b.reviews
          .filter((r) => r.rating === 5)
          .map((r) => r.snippet.trim()),
      ),
    );
    for (const t of getMapsTestimonials()) {
      expect(t.quote.length).toBeGreaterThan(0);
      // Quote must exist verbatim among the 5-star snapshot reviews —
      // proves nothing was rewritten, fabricated, or taken from a low rating.
      expect(allSnippets.has(t.quote)).toBe(true);
    }
  });

  it("assigns unique stable ids tied to branch slugs", () => {
    const ids = getMapsTestimonials().map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^maps-(manyar|gunung-anyar|merr)-\d+$/);
    }
  });
});
