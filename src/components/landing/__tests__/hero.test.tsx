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
});
