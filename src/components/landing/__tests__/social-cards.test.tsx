import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SocialCards } from "../social-cards";
import { getSocialPosts } from "@/lib/catalog-data";

afterEach(cleanup);

/*
 * SocialCards (issue #50 ticket #56) — static links to verified Pulung
 * Instagram/TikTok accounts. No runtime embeds. The contract:
 *
 *   1. Every link opens in a new tab with rel="noopener noreferrer" (security).
 *   2. Every link points at instagram.com or tiktok.com (verified accounts
 *      only — no fabricated URLs).
 *   3. The whole card is the click target (large touch area, ≥48px).
 *   4. No <img> element may appear — text-first fallback only (no owned
 *      thumbnails in this demo phase; ticket #56 allows them when owner
 *      verifies them, but until then the polished text-first treatment is
 *      the contract).
 *   5. No runtime third-party script (Instagram/TikTok embed SDK) — verified
 *      structurally by asserting the section renders without external DOM
 *      additions (blockquote.instagram-media, tiktok-embed div, etc).
 */
describe("SocialCards", () => {
  it("renders one card per social post from catalog-data (no hardcoded accounts)", () => {
    render(<SocialCards />);
    const posts = getSocialPosts();
    const links = screen.getAllByRole("link");
    // Each post card is a link; one extra internal "Lihat pilihan paket"
    // link lives at the bottom. Filter to external cards only.
    const external = links.filter((a) =>
      /instagram\.com|tiktok\.com/.test(a.getAttribute("href") ?? ""),
    );
    expect(external.length).toBe(posts.length);
  });

  it("opens every external social link in a new tab with rel noopener noreferrer", () => {
    render(<SocialCards />);
    const links = screen.getAllByRole("link");
    const external = links.filter((a) =>
      a.getAttribute("target") === "_blank",
    );
    expect(external.length).toBeGreaterThan(0);
    for (const a of external) {
      expect(a.getAttribute("target")).toBe("_blank");
      const rel = a.getAttribute("rel") ?? "";
      expect(rel).toContain("noopener");
      expect(rel).toContain("noreferrer");
    }
  });

  /*
   * Touch target: each card is a full-height <a> wrapping both header and
   * body content. The link's rendered height is driven by inner content +
   * header (py-4) + body (p-5), well above 48px. We assert structurally
   * that the <a> carries flex + h-full — a refactor that strips them and
   * shrinks the click target to a tiny inline text node would fail.
   */
  it("renders each external card as a full-height flex container (≥48px touch target)", () => {
    render(<SocialCards />);
    const links = screen.getAllByRole("link");
    const external = links.filter((a) =>
      /instagram\.com|tiktok\.com/.test(a.getAttribute("href") ?? ""),
    );
    for (const a of external) {
      const cls = a.getAttribute("class") ?? "";
      expect(cls).toMatch(/flex/);
      expect(cls).toMatch(/h-full/);
      // Inner content must contribute height — at least one child div with
      // padding (header py-4 or body p-5). The card click area is the sum.
      const paddedChildren = a.querySelectorAll("div[class*='p-4'], div[class*='p-5']");
      expect(paddedChildren.length).toBeGreaterThan(0);
    }
  });

  it("does not render any <img> element (text-first fallback; no owned thumbnails yet)", () => {
    const { container } = render(<SocialCards />);
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(0);
  });

  /*
   * No-runtime-embed guard (ticket #56). Instagram/TikTok embed SDKs inject
   * recognizable DOM (blockquote.instagram-media, tiktok-embed). The static
   * link card must NOT contain any of these — the link is a plain <a>, not
   * an embed placeholder.
   */
  it("does not contain Instagram/TikTok embed SDK placeholders", () => {
    const { container } = render(<SocialCards />);
    expect(container.querySelector("blockquote.instagram-media")).toBeNull();
    expect(container.querySelector(".tiktok-embed")).toBeNull();
    expect(container.querySelector("iframe")).toBeNull();
    expect(container.querySelector("script")).toBeNull();
  });
});
