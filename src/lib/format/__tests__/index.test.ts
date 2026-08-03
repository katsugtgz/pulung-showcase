import { describe, expect, it } from "vitest";
import { formatDate, formatIDR, todayYmd } from "../index";

describe("todayYmd", () => {
  it("returns a YYYY-MM-DD string", () => {
    expect(todayYmd()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("matches the current UTC calendar date (toISOString slicing)", () => {
    const iso = new Date().toISOString();
    const expected = iso.slice(0, 10);
    expect(todayYmd()).toBe(expected);
  });
});

describe("formatIDR", () => {
  it("formats the example value", () => {
    expect(formatIDR(1_500_000)).toBe("Rp 1.500.000");
  });

  it("formats 0", () => {
    expect(formatIDR(0)).toBe("Rp 0");
  });

  it("formats large numbers (10M+)", () => {
    expect(formatIDR(10_000_000)).toBe("Rp 10.000.000");
    expect(formatIDR(1_234_567_890)).toBe("Rp 1.234.567.890");
  });

  it("prefixes negatives with a minus before the currency", () => {
    expect(formatIDR(-1_000)).toBe("-Rp 1.000");
    expect(formatIDR(-1_500_000)).toBe("-Rp 1.500.000");
  });

  it("truncates fractional rupiah toward zero", () => {
    expect(formatIDR(1_500_000.99)).toBe("Rp 1.500.000");
    expect(formatIDR(-1_500_000.99)).toBe("-Rp 1.500.000");
  });

  it("throws TypeError for NaN", () => {
    expect(() => formatIDR(NaN)).toThrow(TypeError);
  });

  it("throws TypeError for ±Infinity", () => {
    expect(() => formatIDR(Infinity)).toThrow(TypeError);
    expect(() => formatIDR(-Infinity)).toThrow(TypeError);
  });
});

describe("formatDate", () => {
  it("formats the example ISO date in Indonesian", () => {
    expect(formatDate("2026-07-17")).toBe("17 Juli 2026");
  });

  it("maps every Indonesian month correctly", () => {
    expect(formatDate("2026-01-05")).toBe("5 Januari 2026");
    expect(formatDate("2026-02-28")).toBe("28 Februari 2026");
    expect(formatDate("2026-03-31")).toBe("31 Maret 2026");
    expect(formatDate("2026-12-31")).toBe("31 Desember 2026");
  });

  it("throws TypeError for empty or non-string input", () => {
    expect(() => formatDate("")).toThrow(TypeError);
    expect(() => formatDate(null as unknown as string)).toThrow(TypeError);
  });

  it("throws TypeError for wrong shape", () => {
    expect(() => formatDate("17-07-2026")).toThrow(TypeError);
    expect(() => formatDate("2026/07/17")).toThrow(TypeError);
    expect(() => formatDate("2026-7-17")).toThrow(TypeError);
    expect(() => formatDate("not-a-date")).toThrow(TypeError);
  });

  it("throws TypeError for impossible month or day", () => {
    expect(() => formatDate("2026-13-01")).toThrow(TypeError);
    expect(() => formatDate("2026-00-10")).toThrow(TypeError);
    expect(() => formatDate("2026-07-32")).toThrow(TypeError);
    expect(() => formatDate("2026-07-00")).toThrow(TypeError);
  });

  it("throws TypeError for impossible calendar dates (Feb 30, Apr 31, Feb 29 non-leap)", () => {
    expect(() => formatDate("2026-02-30")).toThrow(TypeError);
    expect(() => formatDate("2026-04-31")).toThrow(TypeError);
    expect(() => formatDate("2025-02-29")).toThrow(TypeError); // 2025 is not a leap year
  });

  it("accepts Feb 29 on leap years", () => {
    expect(() => formatDate("2024-02-29")).not.toThrow();
    expect(formatDate("2024-02-29")).toBe("29 Februari 2024");
  });

  it("accepts ISO dates with years 0000-0099 without remapping to 1900s", () => {
    // Regression: the multi-arg Date constructor treats years 0-99 as
    // 1900-1999, which previously rejected valid ISO dates in that range.
    expect(() => formatDate("0099-02-28")).not.toThrow();
    expect(formatDate("0099-02-28")).toBe("28 Februari 99");
    expect(() => formatDate("0001-01-01")).not.toThrow();
    expect(formatDate("0001-01-01")).toBe("1 Januari 1");
  });
});
