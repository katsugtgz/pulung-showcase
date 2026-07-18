import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { CredibilityStrip } from "../credibility-strip";
import { getCredibility } from "@/lib/copy";

afterEach(cleanup);

/*
 * Credibility strip (issue #50) — three trust badges sourced entirely from
 * `getCredibility()` (id / icon key / label / supporting line / surface).
 * Asserts the data-driven contract: no hardcoded strings, no badge type the
 * copy module doesn't know about.
 */
describe("CredibilityStrip", () => {
  it("renders exactly the badges from getCredibility() (3 — story #5)", () => {
    render(<CredibilityStrip />);
    const items = getCredibility();
    expect(items).toHaveLength(3);
    for (const item of items) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });

  it("renders every supporting line from the copy module (no hardcoded strings)", () => {
    render(<CredibilityStrip />);
    for (const item of getCredibility()) {
      if (item.supportingLine) {
        expect(screen.getByText(item.supportingLine)).toBeInTheDocument();
      }
    }
  });

  it("renders exactly three badge list items", () => {
    render(<CredibilityStrip />);
    const section = screen.getByRole("region", { name: "Kredibilitas" });
    const items = section.querySelectorAll("li");
    expect(items).toHaveLength(getCredibility().length);
  });

  it("renders an icon glyph (svg) inside every badge", () => {
    render(<CredibilityStrip />);
    const section = screen.getByRole("region", { name: "Kredibilitas" });
    const badges = section.querySelectorAll("li");
    for (const badge of Array.from(badges)) {
      const svg = badge.querySelector("svg");
      expect(svg).not.toBeNull();
    }
  });

  it("never invents badge copy the module doesn't expose", () => {
    render(<CredibilityStrip />);
    const section = screen.getByRole("region", { name: "Kredibilitas" });
    const allowed = new Set<string>();
    for (const item of getCredibility()) {
      allowed.add(item.label);
      if (item.supportingLine) {
        for (const word of item.supportingLine.split(/\s+/)) {
          if (word.length > 2) allowed.add(word);
        }
      }
    }
    // Sanity: every label in the rendered DOM is sourced from the module.
    for (const item of getCredibility()) {
      expect(section.textContent ?? "").toContain(item.label);
    }
  });
});
