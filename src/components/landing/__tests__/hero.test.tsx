import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Hero } from "../hero";
import { getActiveHeroVariant, getCta, getHeroCopy } from "@/lib/copy";

afterEach(cleanup);

/*
 * Hero (issue #50) — wordmark lockup + benefit-led H1 + dual CTA to distinct
 * in-page anchors. Pairs with hero acceptance in scripts/qa/landing-render.mjs.
 */
describe("Hero", () => {
  it("renders the PULUNG wordmark lockup as a separate element from the H1", () => {
    render(<Hero />);
    // Wordmark lives in its own span (text-accent, inside a white pill). It
    // MUST NOT be the page H1 — the H1 is the benefit-led headline (story #2).
    const wordmark = screen.getByText("PULUNG");
    expect(wordmark).toBeInTheDocument();
    expect(wordmark.tagName).not.toBe("H1");
  });

  it("renders the active PAS variant headline as the semantic H1 (story #2)", () => {
    render(<Hero />);
    const activeHeadline = getActiveHeroVariant().headline;
    // Benefit-led variant — NOT the brand name. Assertion guards against
    // regressing H1 back to "PULUNG" (the old wordmark-as-h1 pattern).
    expect(activeHeadline).not.toBe("PULUNG");
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(activeHeadline);
  });

  it("renders exactly two hero CTAs with distinct hrefs (#lokasi vs #packages — story #7)", () => {
    render(<Hero />);
    const cta = getCta();
    // Both anchors are required; their hrefs MUST differ so the two buttons
    // don't collapse into a single destination (spec issue #50 story #7).
    const primary = screen.getByRole("link", { name: cta.primary });
    const secondary = screen.getByRole("link", { name: cta.secondary });
    expect(primary).toHaveAttribute("href", "#lokasi");
    expect(secondary).toHaveAttribute("href", "#packages");
    expect(primary.getAttribute("href")).not.toBe(secondary.getAttribute("href"));
  });

  it("routes the WhatsApp-first CTA to #lokasi (location picker), not a generic wa.me link", () => {
    render(<Hero />);
    const cta = getCta();
    const primary = screen.getByRole("link", { name: cta.primary });
    const href = primary.getAttribute("href") ?? "";
    expect(href).toBe("#lokasi");
    // Defense against accidental regression to a hardcoded wa.me deep link —
    // the hero CTA should hand off to the cluster-routed LocationPicker,
    // not collapse cluster routing into a single number (business-bug guard).
    expect(href).not.toMatch(/^https:\/\/wa\.me\//);
  });

  it("renders every trust-bar chip from the copy module (no hardcoded labels)", () => {
    render(<Hero />);
    const { trustBar } = getHeroCopy();
    for (const chip of trustBar) {
      expect(screen.getByText(chip.label)).toBeInTheDocument();
    }
  });

  it("uses the eyebrow 'Kursus Mengemudi' to label the business category (not a claim)", () => {
    render(<Hero />);
    expect(screen.getByText("Kursus Mengemudi")).toBeInTheDocument();
  });

  /*
   * Hero image (issue #50 story #43 — reserve dimensions + LCP-aware).
   * The image is a placeholder SVG with priority + fill + unoptimized so the
   * browser never makes a runtime third-party request and never reflows when
   * the SVG resolves. The "Contoh" overlay (story #37) marks it as a stand-in
   * for the owner-supplied photo that doesn't exist yet — guardrails here
   * prevent a future regression that drops priority (hurting LCP) or drops
   * the alt text (hurting screen-reader users).
   */
  it("renders the hero image with descriptive alt text, priority, and the 'Contoh' overlay (stories #37, #43)", () => {
    render(<Hero />);
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("src", "/images/hero-placeholder.svg");
    // Alt text must be non-empty and describe the illustration honestly.
    const alt = image.getAttribute("alt") ?? "";
    expect(alt.length).toBeGreaterThan(20);
    expect(alt.toLowerCase()).toContain("contoh");
    // data-nimg is next/image's structural marker — guards against a future
    // regression that swaps it for a raw <img> and loses the optimization
    // pipeline (reserved dimensions, lazy-loading policy, etc). The
    // `priority` prop itself isn't observable in jsdom (Next consumes it for
    // preload-link emission, not for an <img> attribute), so it's enforced
    // at the JSX source level + Lighthouse LCP audit instead.
    expect(image).toHaveAttribute("data-nimg", "fill");
    // The "Contoh" overlay chip is rendered as a sibling span — verify the
    // word is visible to sighted users (defense against removal).
    expect(screen.getByText("Contoh")).toBeInTheDocument();
  });

  /*
   * Conversion-color contract (design contract §2 — one red CTA per
   * viewport). The primary hero CTA is the single dominant red action in the
   * first viewport; the secondary CTA must use a non-red treatment so the
   * primary stays unambiguously the conversion target.
   */
  it("uses bg-accent only on the primary CTA; secondary CTA stays non-red (design contract §2)", () => {
    render(<Hero />);
    const cta = getCta();
    const primary = screen.getByRole("link", { name: cta.primary });
    const secondary = screen.getByRole("link", { name: cta.secondary });
    expect(primary.className).toContain("bg-accent");
    expect(secondary.className).not.toContain("bg-accent");
  });

  it("renders learner_car and side_mirror stickers as decorative elements", () => {
    const { container } = render(<Hero />);
    const learnerImg = container.querySelector('img[src*="learner_car.jpg"]') as HTMLImageElement;
    expect(learnerImg).toBeInTheDocument();
    expect(learnerImg.alt).toBe("");
    expect(learnerImg.closest('[aria-hidden="true"]')).not.toBeNull();

    const sideMirrorImg = container.querySelector('img[src*="side_mirror.jpg"]') as HTMLImageElement;
    expect(sideMirrorImg).toBeInTheDocument();
    expect(sideMirrorImg.alt).toBe("");
    expect(sideMirrorImg.closest('[aria-hidden="true"]')).not.toBeNull();
  });
});

