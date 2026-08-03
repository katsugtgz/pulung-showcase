import { describe, expect, it } from "vitest";
import { buildWhatsAppLink, toInternationalDigits } from "../index";
import { getBranches } from "../../catalog-data";

const CLUSTER_A_DIGITS = "6285100870957";
const CLUSTER_B_DIGITS = "6281232531989";

describe("buildWhatsAppLink — cluster routing (critical business logic)", () => {
  const expectedDigits: Record<string, string> = {
    "gunung-anyar": CLUSTER_A_DIGITS,
    pandugo: CLUSTER_A_DIGITS,
    juanda: CLUSTER_A_DIGITS,
    manyar: CLUSTER_B_DIGITS,
    pucang: CLUSTER_B_DIGITS,
  };

  for (const branch of getBranches()) {
    it(`${branch.id} -> ${expectedDigits[branch.id]}`, () => {
      const link = buildWhatsAppLink({ branchId: branch.id });
      expect(link).toContain(`https://wa.me/${expectedDigits[branch.id]}`);
    });
  }

  it("routes exactly three branches to Cluster A and two to Cluster B", () => {
    const toDigits = (id: string) =>
      buildWhatsAppLink({ branchId: id }).match(/wa\.me\/(\d+)/)?.[1];
    const a = getBranches().filter(
      (b) => toDigits(b.id) === CLUSTER_A_DIGITS,
    );
    const b = getBranches().filter(
      (b) => toDigits(b.id) === CLUSTER_B_DIGITS,
    );
    expect(a).toHaveLength(3);
    expect(b).toHaveLength(2);
  });

  it("uses digits only (no '+', spaces, or dashes) in the host", () => {
    const link = buildWhatsAppLink({ branchId: "gunung-anyar" });
    expect(link.startsWith("https://wa.me/62")).toBe(true);
    expect(link).not.toContain("+");
    expect(link).not.toContain("-");
  });
});

function decodeText(link: string): string {
  return decodeURIComponent(new URL(link).searchParams.get("text")!);
}

describe("buildWhatsAppLink — prefilled message", () => {
  it("encodes the text param with encodeURIComponent", () => {
    const link = buildWhatsAppLink({ branchId: "gunung-anyar" });
    const raw = link.slice(link.indexOf("?text=") + "?text=".length);
    // encodeURIComponent percent-encodes spaces and commas; parentheses are
    // RFC-unreserved and stay literal, so we only assert those two.
    expect(raw).not.toMatch(/[ ,]/);
    expect(decodeURIComponent(raw).startsWith("Halo admin Pulung")).toBe(true);
  });

  it("defaults to 'manual atau matic' and includes the branch area name", () => {
    const decoded = decodeText(buildWhatsAppLink({ branchId: "gunung-anyar" }));
    expect(decoded).toContain("kursus mobil manual atau matic");
    expect(decoded).toContain("Gunung Anyar");
  });

  it("interpolates transmission 'matic'", () => {
    const decoded = decodeText(
      buildWhatsAppLink({ branchId: "gunung-anyar", transmission: "matic" }),
    );
    expect(decoded).toContain("kursus mobil matic di area");
  });

  it("interpolates transmission 'manual'", () => {
    const decoded = decodeText(
      buildWhatsAppLink({ branchId: "gunung-anyar", transmission: "manual" }),
    );
    expect(decoded).toContain("kursus mobil manual di area");
  });

  it("interpolates transmission 'mixed' as 'manual & matic'", () => {
    const decoded = decodeText(
      buildWhatsAppLink({ branchId: "gunung-anyar", transmission: "mixed" }),
    );
    expect(decoded).toContain("kursus mobil manual & matic");
  });

  it("derives transmission from packageId when none is explicit", () => {
    const decoded = decodeText(
      buildWhatsAppLink({ branchId: "gunung-anyar", packageId: "paket-matic" }),
    );
    expect(decoded).toContain("matic");
  });

  it("lets explicit transmission override the packageId transmission", () => {
    const decoded = decodeText(
      buildWhatsAppLink({
        branchId: "gunung-anyar",
        packageId: "paket-matic",
        transmission: "manual",
      }),
    );
    expect(decoded).toContain("kursus mobil manual");
  });

  it("produces a full well-formed link for a known case", () => {
    const link = buildWhatsAppLink({
      branchId: "gunung-anyar",
      transmission: "manual",
    });
    const message =
      "Halo admin Pulung, saya mau tanya paket kursus mobil manual di area Gunung Anyar (Surabaya Selatan & Timur (MERR / Rungkut / Juanda)). Bisa info jadwal & harga?";
    expect(link).toBe(
      `https://wa.me/${CLUSTER_A_DIGITS}?text=${encodeURIComponent(message)}`,
    );
  });
});

describe("buildWhatsAppLink — error handling", () => {
  it("throws TypeError for an unknown branchId", () => {
    expect(() => buildWhatsAppLink({ branchId: "nope" })).toThrow(TypeError);
  });

  it("throws TypeError for an unknown packageId", () => {
    expect(() =>
      buildWhatsAppLink({ branchId: "gunung-anyar", packageId: "nope" }),
    ).toThrow(TypeError);
  });
});

describe("toInternationalDigits (D4)", () => {
  it("keeps an Indonesian international number (62…) as-is", () => {
    expect(toInternationalDigits("+62 851-0087-0957")).toBe("6285100870957");
  });

  it("converts a domestic 0… number to 62…", () => {
    expect(toInternationalDigits("0851-0087-0957")).toBe("6285100870957");
  });

  it("returns foreign numbers as-is instead of prepending 62 (regression for D4)", () => {
    // Before the fix, '+1 415 555 2671' became '621415552671' — wrong country.
    expect(toInternationalDigits("+1 415 555 2671")).toBe("14155552671");
    expect(toInternationalDigits("+44 20 7946 0958")).toBe("442079460958");
    expect(toInternationalDigits("+65 6123 4567")).toBe("6561234567");
  });

  it("strips the 00 IDD prefix and returns the international number (D4 regression)", () => {
    // 00 is the international direct-dialling prefix (E.164 without the +).
    // Before the fix, '0044 20 7946 0958' matched the domestic '0…' rule and
    // became '6200442079460958' — wrong country, with the IDD prefix retained.
    expect(toInternationalDigits("0044 20 7946 0958")).toBe("442079460958");
    expect(toInternationalDigits("001 415 555 2671")).toBe("14155552671");
    expect(toInternationalDigits("0065 6123 4567")).toBe("6561234567");
  });

  it("strips non-digit characters but preserves the leading-zero rule", () => {
    expect(toInternationalDigits("(0812) 3253-1989")).toBe("6281232531989");
  });
});
