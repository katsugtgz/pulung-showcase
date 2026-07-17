import { describe, expect, it } from "vitest";
import {
  getActiveHeroVariant,
  getCta,
  getHeroCopy,
  getHeroVariant,
  getSectionBody,
  getSectionHeader,
  getTestimonials,
} from "../index";
import type {
  BodySectionKey,
  HeroPasDirection,
  SectionKey,
} from "../types";

describe("hero copy", () => {
  it("exposes exactly three PAS variants keyed aman / trust / cepat", () => {
    const hero = getHeroCopy();
    const directions = hero.variants.map((v) => v.direction).sort();
    expect(directions).toEqual(["aman", "cepat", "trust"]);
    expect(hero.variants).toHaveLength(3);
  });

  it("marks trust/otoritas as the recommended default active variant", () => {
    expect(getHeroCopy().activeVariant).toBe("trust");
  });

  it("getActiveHeroVariant resolves to the trust variant", () => {
    expect(getActiveHeroVariant().direction).toBe("trust");
  });

  it("every variant headline is non-empty Indonesian", () => {
    for (const v of getHeroCopy().variants) {
      expect(typeof v.headline).toBe("string");
      expect(v.headline.length).toBeGreaterThan(0);
    }
  });

  it("getHeroVariant resolves each known direction", () => {
    const known: HeroPasDirection[] = ["aman", "trust", "cepat"];
    for (const d of known) {
      expect(getHeroVariant(d).direction).toBe(d);
    }
  });

  it("getHeroVariant throws TypeError for an unknown direction", () => {
    expect(() => getHeroVariant("nope" as HeroPasDirection)).toThrow(TypeError);
  });

  it("has a non-empty Indonesian subheadline", () => {
    expect(getHeroCopy().subheadline.length).toBeGreaterThan(0);
  });

  it("exposes the three required trust-bar items verbatim", () => {
    const labels = getHeroCopy().trustBar.map((t) => t.label);
    expect(labels).toEqual([
      "Sejak 2000",
      "Instruktur berpengalaman",
      "Jangkauan seluruh Surabaya",
    ]);
  });

  it("returns fresh copies so source cannot be mutated", () => {
    const a = getHeroCopy();
    a.variants.push(a.variants[0]);
    a.trustBar.push(a.trustBar[0]);
    expect(getHeroCopy().variants).toHaveLength(3);
    expect(getHeroCopy().trustBar).toHaveLength(3);
  });
});

describe("section headers", () => {
  it("returns the curated PAS header for each non-hero section", () => {
    expect(getSectionHeader("paket")).toBe("Paket yang Pas Buat Kamu");
    expect(getSectionHeader("testimonials")).toBe(
      "Kata Mereka yang Udah Bisa Nyetir",
    );
    expect(getSectionHeader("faq")).toBe("Masih Ragu? Ini Jawabannya");
  });

  it("hero header mirrors the active (trust) variant headline — no drift", () => {
    expect(getSectionHeader("hero")).toBe(getActiveHeroVariant().headline);
  });

  it("throws TypeError for an unknown section", () => {
    expect(() => getSectionHeader("nope" as SectionKey)).toThrow(TypeError);
  });
});

describe("section body", () => {
  it("returns non-empty Indonesian body copy for each body section", () => {
    const sections: BodySectionKey[] = ["paket", "testimonials", "faq"];
    for (const s of sections) {
      expect(getSectionBody(s).length).toBeGreaterThan(0);
    }
  });

  it("throws TypeError for a section without body copy", () => {
    expect(() => getSectionBody("hero" as BodySectionKey)).toThrow(TypeError);
  });
});

describe("cta", () => {
  it("uses WhatsApp-first low-friction microcopy, never Daftar/Submit", () => {
    const c = getCta();
    expect(c.primary).toBe("Tanya Jadwal via WhatsApp");
    expect(c.secondary).toBe("Chat Sekarang");
    expect(c.primary).not.toMatch(/Daftar|Submit/i);
    expect(c.secondary).not.toMatch(/Daftar|Submit/i);
  });

  it("returns a fresh copy so source cannot be mutated", () => {
    const a = getCta();
    a.primary = "mutated";
    expect(getCta().primary).toBe("Tanya Jadwal via WhatsApp");
  });
});

describe("testimonials", () => {
  it("is empty — research found ZERO verifiable reviews (no fabrication)", () => {
    expect(getTestimonials()).toEqual([]);
  });

  it("returns a fresh empty array each call", () => {
    const a = getTestimonials();
    // Prove it is a distinct array without claiming a testimonial exists.
    expect(a).not.toBe(getTestimonials());
    expect(a).toEqual([]);
  });
});
