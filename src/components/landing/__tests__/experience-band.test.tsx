import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ExperienceBand } from "../experience-band";
import { getBranches, getClusters, getPackages } from "@/lib/catalog-data";

afterEach(cleanup);

/*
 * ExperienceBand (issue #50 ticket #53) — the single dark polarity band
 * that breaks the white-card rhythm mid-landing. Every fact rendered here
 * MUST come from catalog-data; nothing invented. The "Sejak 2000" + "25+
 * tahun" claim is verified in contact.md + research brief (already used
 * verbatim in Hero trust chips + CredibilityStrip + Footer).
 *
 * What is intentionally NOT tested here:
 *   - Focus rings on interactive elements → none; band has no <a>/<button>.
 *   - Visual contrast on bg-primary → covered structurally by the
 *     text-white / text-white/90+ className assertions in the design
 *     contract; landing-contrast.mjs verifies at runtime.
 */
describe("ExperienceBand", () => {
  it("renders the verified founding year (2000) without inventing a different year", () => {
    render(<ExperienceBand />);
    expect(screen.getByText("2000")).toBeInTheDocument();
  });

  it("renders the verified branch count from catalog-data (no hardcoded number)", () => {
    render(<ExperienceBand />);
    const expected = String(getBranches().length);
    // The number renders as the dd's leading text node; match the digit.
    const stat = screen.getByText(expected);
    expect(stat.tagName).toBe("DD");
    expect(stat.textContent).toContain("cabang");
  });

  it("renders the verified cluster count from catalog-data", () => {
    render(<ExperienceBand />);
    const expected = String(getClusters().length);
    const stat = screen.getByText(expected);
    expect(stat.tagName).toBe("DD");
    expect(stat.textContent).toContain("klaster");
  });

  it("renders the verified package count from catalog-data", () => {
    render(<ExperienceBand />);
    const expected = String(getPackages().length);
    const stat = screen.getByText(expected);
    expect(stat.tagName).toBe("DD");
    expect(stat.textContent).toContain("paket");
  });

  /*
   * Registration claim guard — the only trust claim in this band is the
   * already-verified "Terdaftar KORLANTAS POLRI & Dishub Surabaya" line.
   * If a future author adds a new claim word ("dijamin", "terbaik",
   * "populer", "nomor 1"), this test fails. No fabricated marketing copy.
   */
  it("renders only the verified registration claim (no fabricated marketing copy)", () => {
    const { container } = render(<ExperienceBand />);
    const text = container.textContent ?? "";

    // Must include the verified registration line.
    expect(text).toContain("KORLANTAS POLRI");
    expect(text).toContain("Dishub Surabaya");

    // Explicitly forbidden claims per AGENTS.md + issue #50.
    const forbidden = ["dijamin lulus", "terbaik", "populer", "nomor 1"];
    for (const word of forbidden) {
      expect(text.toLowerCase()).not.toContain(word.toLowerCase());
    }
  });

  /*
   * Polarity contract — band must use bg-primary to count as the dark
   * polarity surface (design-contract §5). The class is asserted
   * structurally so a future token rename (e.g. bg-brand) can update one
   * place without silent drift.
   */
  it("uses the primary surface (dark polarity band contract)", () => {
    const { container } = render(<ExperienceBand />);
    const section = container.querySelector("section");
    expect(section).not.toBeNull();
    expect(section!.className).toMatch(/bg-primary\b/);
    // Body text on bg-primary must be white or white/90+ for WCAG AA.
    const headings = container.querySelectorAll("h2, p, dd, dt");
    for (const el of Array.from(headings)) {
      const cls = el.getAttribute("class") ?? "";
      // Every text element on the dark band must use the white family.
      expect(cls).toMatch(/text-white/);
    }
  });
});
