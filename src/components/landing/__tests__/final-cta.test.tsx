import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { FinalCta } from "../final-cta";
import { getCta, getSectionBody, getSectionHeader } from "@/lib/copy";

afterEach(cleanup);

/*
 * FinalCta (issue #50 ticket #57) — single closing conversion opportunity
 * after FAQ. The contract:
 *
 *   1. ONE call-to-action only (no competing buttons).
 *   2. CTA targets #lokasi (hands off to cluster-routed LocationPicker).
 *   3. CTA uses bg-accent (the one-red-primary-CTA per design-contract §3).
 *   4. Surface is bg-primary (the legal third primary band; design-contract
 *      §5 — hero + experience-band are the first two).
 *   5. No fabricated trust claims or owner-unverified copy.
 *   6. H2 + body copy flow through @/lib/copy (no hardcoded strings).
 */
describe("FinalCta", () => {
  it("renders exactly one call-to-action link (no competing actions)", () => {
    render(<FinalCta />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
  });

  it("routes the CTA to #lokasi (cluster-routed LocationPicker handoff, not wa.me)", () => {
    render(<FinalCta />);
    const cta = getCta();
    const link = screen.getByRole("link", { name: new RegExp(cta.primary) });
    expect(link).toHaveAttribute("href", "#lokasi");
    // Business-bug guard — never collapse cluster routing into a single number.
    expect(link.getAttribute("href")).not.toMatch(/^https:\/\/wa\.me\//);
  });

  it("uses the accent-red surface on the CTA (one-red rule, design-contract §3)", () => {
    render(<FinalCta />);
    const link = screen.getByRole("link");
    expect(link.className).toMatch(/bg-accent/);
    expect(link.className).toMatch(/text-white/);
  });

  it("reserves ≥48px touch target (py-3.5 or larger on text-base)", () => {
    render(<FinalCta />);
    const link = screen.getByRole("link");
    const paddingMatch = link.className.match(/\bpy-(\d(?:\.\d)?)\b/);
    expect(paddingMatch).not.toBeNull();
    const paddingValue = Number.parseFloat(paddingMatch![1]);
    expect(paddingValue).toBeGreaterThanOrEqual(3.5);
  });

  it("does not invent owner-unverified marketing claims", () => {
    const { container } = render(<FinalCta />);
    const text = (container.textContent ?? "").toLowerCase();
    const forbidden = [
      "dijamin lulus",
      "terbaik",
      "nomor 1",
      "populer",
      "termurah",
    ];
    for (const word of forbidden) {
      expect(text).not.toContain(word);
    }
  });

  it("uses the bg-primary dark polarity surface (design-contract §5 third band)", () => {
    const { container } = render(<FinalCta />);
    const section = container.querySelector("section");
    expect(section).not.toBeNull();
    expect(section!.className).toMatch(/bg-primary\b/);
  });

  /*
   * Copy-sourcing regression guard. An earlier revision hardcoded the H2 and
   * pulled body copy from the "testimonials" key — which rendered the
   * testimonials empty-state placeholder ("Cerita alumni Pulung akan tampil
   * di sini...") as the closing marketing message. The H2 + body MUST come
   * from the dedicated "final-cta" keys in the copy module.
   */
  it("renders the H2 from getSectionHeader('final-cta') — no hardcoded headline", () => {
    render(<FinalCta />);
    const expected = getSectionHeader("final-cta");
    const h2 = screen.getByRole("heading", { level: 2 });
    expect(h2).toHaveTextContent(expected);
  });

  it("renders the body from getSectionBody('final-cta') — never the testimonials placeholder", () => {
    render(<FinalCta />);
    const expected = getSectionBody("final-cta");
    const testimonialsPlaceholder = getSectionBody("testimonials");
    // The rendered paragraph must be the final-cta copy, not testimonials.
    expect(expected).not.toBe(testimonialsPlaceholder);
    expect(screen.getByText(expected)).toBeInTheDocument();
    // Explicit guard: the testimonials empty-state line must NOT appear.
    expect(
      screen.queryByText(testimonialsPlaceholder),
    ).not.toBeInTheDocument();
  });
});
