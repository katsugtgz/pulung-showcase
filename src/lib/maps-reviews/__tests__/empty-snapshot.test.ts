/**
 * Regression test for D3: getMapsRating must not divide by zero when the
 * snapshot has zero total reviews.
 *
 * The default snapshot has reviews, so we override it via vi.mock to inject
 * a synthetic empty snapshot. This keeps the existing index.test.ts (which
 * exercises the real snapshot) untouched.
 */
import { describe, expect, it, vi } from "vitest";

vi.mock("../snapshot.json", () => ({
  default: {
    branches: [
      {
        slug: "ghost-a",
        label: "Ghost A",
        rating: 0,
        reviewCount: 0,
        reviews: [],
      },
      {
        slug: "ghost-b",
        label: "Ghost B",
        rating: 0,
        reviewCount: 0,
        reviews: [],
      },
    ],
  },
}));

import { getMapsRating } from "../index";

describe("getMapsRating: divide-by-zero guard (D3)", () => {
  it("returns rating 0 instead of NaN when reviewCount is 0", () => {
    const result = getMapsRating();
    expect(result.reviewCount).toBe(0);
    expect(Number.isNaN(result.rating)).toBe(false);
    expect(result.rating).toBe(0);
  });

  it("still surfaces the branch rows even when empty", () => {
    const result = getMapsRating();
    expect(result.branches).toHaveLength(2);
    expect(result.branches.every((b) => b.reviewCount === 0)).toBe(true);
  });
});
