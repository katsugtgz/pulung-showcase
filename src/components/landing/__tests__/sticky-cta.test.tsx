import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { StickyCta } from "../sticky-cta";
import { getStickyCta } from "@/lib/copy";

/*
 * jsdom does not ship IntersectionObserver. StickyCta falls back to
 * "always visible" when it is unavailable (the spec requires the CTA to never
 * disappear if the observer cannot be set up).
 */
beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", undefined);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

/*
 * StickyCta (issue #50 story #20) — mobile-only floating CTA. Routes to
 * #lokasi (per getStickyCta()) so the prospect hands off to the cluster-routed
 * WhatsApp picker rather than a generic number.
 */
describe("StickyCta", () => {
  it("renders an anchor linking to #lokasi (business-bug guard)", () => {
    render(<StickyCta />);
    const cta = getStickyCta();
    const link = screen.getByRole("link", { name: cta.label });
    expect(link).toHaveAttribute("href", "#lokasi");
    // Defense against regressing to a hardcoded wa.me link — sticky CTA hands
    // off to the LocationPicker for cluster routing.
    expect(link.getAttribute("href")).not.toMatch(/^https:\/\/wa\.me\//);
  });

  it("is mobile-only: the rendered link carries the lg:hidden class", () => {
    render(<StickyCta />);
    const cta = getStickyCta();
    const link = screen.getByRole("link", { name: cta.label });
    expect(link.className).toContain("lg:hidden");
  });

  it("uses the WhatsApp glyph (svg) inline with the label", () => {
    render(<StickyCta />);
    const cta = getStickyCta();
    const link = screen.getByRole("link", { name: cta.label });
    const svg = link.querySelector("svg");
    expect(svg).not.toBeNull();
  });

  it("stays visible when IntersectionObserver is unavailable (failsafe)", () => {
    render(<StickyCta />);
    const cta = getStickyCta();
    const link = screen.getByRole("link", { name: cta.label });
    // The component never applies the hide transform when the observer cannot
    // be set up — i.e. translate-y-full must NOT be set in this env.
    expect(link.className).not.toContain("translate-y-full");
    expect(link.className).toContain("translate-y-0");
  });

  it("uses the WhatsApp-first label from @/lib/copy (no hardcoded string)", () => {
    render(<StickyCta />);
    const cta = getStickyCta();
    expect(screen.getByRole("link", { name: cta.label })).toBeInTheDocument();
  });
});
