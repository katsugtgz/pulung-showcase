import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Reveal } from "../reveal";
import { Header } from "../header";
import { Hero } from "../hero";
import { Footer } from "../footer";
import { StickyCta } from "../sticky-cta";
import { Faq } from "../faq";
import { Packages } from "../packages";
import { SocialCards } from "../social-cards";
import { LocationPicker } from "../location-picker";

/*
 * Accessibility baseline for the refreshed landing (issue #51 / design
 * contract §12 + §6 + §10). Locks three properties that section authors
 * must not regress as they add or refresh sections:
 *
 *   1. Every interactive element renders a visible focus ring (keyboard
 *      a11y). The contract accepts either `focus-visible:ring-…` (modern,
 *      keyboard-only) or `focus:ring-…` (legacy, always-on). A bare
 *      `focus:outline-none` without a ring would fail this guard.
 *   2. The Reveal primitive never gates content visibility on
 *      IntersectionObserver availability — content is fully rendered
 *      even when the observer is undefined (progressive enhancement,
 *      issue #50 story #24).
 *   3. WhatsApp CTAs use the dark-green surface #075E54 (≈7.67:1 contrast
 *      on white text). The bright #25D366 corporate green (≈1.98:1)
 *      fails WCAG AA normal text — see design contract §6 + ADR-004.
 *
 * Section-specific behavior (cluster routing, accordion state, copy
 * sourcing) is covered by the per-section test files. This file is the
 * contract-level guardrail.
 */

/*
 * jsdom does not provide IntersectionObserver. Reveal and StickyCta both
 * stub it to undefined to exercise their fallback paths deterministically.
 */
beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", undefined);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

/**
 * Yields every interactive element rendered inside `container`. Includes
 * elements that are visually hidden via the `hidden` attribute (the
 * LocationPicker keeps unselected branches in the DOM for SEO + QA — its
 * WA links must still carry the focus-ring contract for the case they
 * become visible).
 */
function* interactiveElements(
  container: HTMLElement,
): Generator<HTMLAnchorElement | HTMLButtonElement> {
  for (const a of container.querySelectorAll<HTMLAnchorElement>("a")) {
    yield a;
  }
  for (const btn of container.querySelectorAll<HTMLButtonElement>("button")) {
    yield btn;
  }
}

/**
 * The design contract (§12) accepts either focus-visible:ring or focus:ring
 * as a visible focus indicator. outline-none without a ring would fail.
 */
function hasVisibleFocusRing(el: HTMLElement): boolean {
  const cls = el.className;
  return /focus(-visible)?:ring/.test(cls);
}

describe("Accessibility baseline — focus rings on every interactive element", () => {
  it("Header: wordmark link, nav anchors, and auth links all carry a focus ring", () => {
    const { container } = render(<Header />);
    const interactive = Array.from(interactiveElements(container));
    expect(interactive.length).toBeGreaterThan(0);
    for (const el of interactive) {
      expect(hasVisibleFocusRing(el), el.outerHTML).toBe(true);
    }
  });

  it("Hero: primary and secondary CTAs both carry a focus ring", () => {
    const { container } = render(<Hero />);
    const interactive = Array.from(interactiveElements(container));
    expect(interactive.length).toBeGreaterThan(0);
    for (const el of interactive) {
      expect(hasVisibleFocusRing(el), el.outerHTML).toBe(true);
    }
  });

  it("Footer: anchor nav and per-cluster contact links all carry a focus ring", () => {
    const { container } = render(<Footer />);
    const interactive = Array.from(interactiveElements(container));
    expect(interactive.length).toBeGreaterThan(0);
    for (const el of interactive) {
      expect(hasVisibleFocusRing(el), el.outerHTML).toBe(true);
    }
  });

  it("StickyCta: the floating mobile CTA carries a focus ring", () => {
    const { container } = render(<StickyCta />);
    const interactive = Array.from(interactiveElements(container));
    expect(interactive).toHaveLength(1);
    for (const el of interactive) {
      expect(hasVisibleFocusRing(el), el.outerHTML).toBe(true);
    }
  });

  it("Faq: every accordion trigger carries a focus ring", () => {
    const { container } = render(<Faq />);
    const interactive = Array.from(interactiveElements(container));
    expect(interactive.length).toBeGreaterThan(0);
    for (const el of interactive) {
      expect(hasVisibleFocusRing(el), el.outerHTML).toBe(true);
    }
  });

  it("Packages: every 'Pelajari' link carries a focus ring", () => {
    const { container } = render(<Packages />);
    const interactive = Array.from(interactiveElements(container));
    expect(interactive.length).toBeGreaterThan(0);
    for (const el of interactive) {
      expect(hasVisibleFocusRing(el), el.outerHTML).toBe(true);
    }
  });

  it("SocialCards: every external social card + internal hint link carries a focus ring", () => {
    const { container } = render(<SocialCards />);
    const interactive = Array.from(interactiveElements(container));
    expect(interactive.length).toBeGreaterThan(0);
    for (const el of interactive) {
      expect(hasVisibleFocusRing(el), el.outerHTML).toBe(true);
    }
  });

  it("LocationPicker: transmission toggles, cluster selectors, and WA CTAs all carry a focus ring", () => {
    const { container } = render(<LocationPicker />);
    const interactive = Array.from(interactiveElements(container));
    expect(interactive.length).toBeGreaterThan(0);
    for (const el of interactive) {
      expect(hasVisibleFocusRing(el), el.outerHTML).toBe(true);
    }
  });
});

describe("Accessibility baseline — Reveal progressive enhancement", () => {
  it("renders children visible immediately when IntersectionObserver is unavailable", () => {
    const { getByText } = render(
      <Reveal>
        <p>Baseline-visible content</p>
      </Reveal>,
    );

    const child = getByText("Baseline-visible content");
    expect(child).toBeVisible();
    const wrapper = child.parentElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper!.className).toContain("is-shown");
  });

  it("does not apply opacity:0 or content-hiding styles in the baseline state", () => {
    const { container } = render(
      <Reveal>
        <p>Never hidden</p>
      </Reveal>,
    );
    // The wrapper carries t-reveal (positional offset only) plus is-shown
    // (neutralizes the offset). Neither class hides content.
    const wrapper = container.querySelector(".t-reveal");
    expect(wrapper).not.toBeNull();
    expect(wrapper!.className).toContain("is-shown");
  });
});

describe("Accessibility baseline — WhatsApp CTA contrast (design contract §6)", () => {
  it("LocationPicker WA buttons use the dark-green surface #075E54 (passes WCAG AA)", () => {
    const { container } = render(<LocationPicker />);
    // Query every <a> inside #lokasi, including hidden ones — the WA links
    // for unselected clusters stay in the DOM for SEO + the QA
    // wa-link-correctness.mjs flow, so the contract must hold for them too.
    const waLinks = container.querySelectorAll<HTMLAnchorElement>(
      'a[href^="https://wa.me/"]',
    );
    expect(waLinks.length).toBeGreaterThan(0);
    for (const a of Array.from(waLinks)) {
      expect(a.className).toContain("bg-[#075E54]");
      expect(a.className).not.toContain("bg-[#25D366]");
    }
  });
});
