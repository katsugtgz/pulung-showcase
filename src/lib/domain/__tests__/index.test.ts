import { describe, expect, it } from "vitest";
import {
  canTransitionEnrollment,
  getDomainSummary,
  getInstruktur,
  getInstrukturById,
  getInstrukturByBranch,
  getPembayaran,
  getPembayaranById,
  getPembayaranBySiswa,
  getPembayaranByStatus,
  getSesi,
  getSesiById,
  getSesiByInstruktur,
  getSesiBySiswa,
  getSesiByStatus,
  getSiswa,
  getSiswaById,
  getSiswaByBranch,
  getSiswaByEnrollmentStatus,
  nextEnrollmentStatus,
} from "../index";
import type {
  EnrollmentStatus,
  Instruktur,
  Pembayaran,
  PembayaranStatus,
  Sesi,
  SesiStatus,
  Siswa,
} from "../types";
import { getBranches, getPackageById } from "@/lib/catalog-data";

const VALID_BRANCH_IDS = new Set(getBranches().map((b) => b.id));

describe("siswa", () => {
  it("returns at least five seeded siswa with complete shapes", () => {
    const all = getSiswa();
    expect(all.length).toBeGreaterThanOrEqual(5);
    for (const s of all) {
      expect(typeof s.id).toBe("string");
      expect(s.id.length).toBeGreaterThan(0);
      expect(typeof s.fullName).toBe("string");
      expect(s.fullName.length).toBeGreaterThan(0);
      expect(VALID_BRANCH_IDS.has(s.packageId)).toBe(false);
      expect(typeof s.createdAt).toBe("string");
      expect(/^\d{4}-\d{2}-\d{2}$/.test(s.createdAt)).toBe(true);
    }
  });

  it("every siswa packageId and branchId reference real catalog-data rows", () => {
    for (const s of getSiswa()) {
      expect(() => getPackageById(s.packageId)).not.toThrow();
      expect(VALID_BRANCH_IDS.has(s.branchId)).toBe(true);
    }
  });

  it("returns fresh array copies (mutation does not corrupt source)", () => {
    const a = getSiswa();
    a.push(a[0]);
    expect(getSiswa()).not.toHaveLength(a.length);
  });

  it("finds a siswa by id", () => {
    expect(getSiswaById("siswa-001").fullName).toBe("Rizki Pratama");
  });

  it("throws TypeError for an unknown siswa id", () => {
    expect(() => getSiswaById("nope")).toThrow(TypeError);
  });

  it("filters siswa by branch and by enrollment status", () => {
    const gunungAnyar = getSiswaByBranch("gunung-anyar");
    expect(gunungAnyar.every((s) => s.branchId === "gunung-anyar")).toBe(true);
    const menunggu = getSiswaByEnrollmentStatus("menunggu_bayar");
    expect(menunggu.every((s) => s.enrollmentStatus === "menunggu_bayar")).toBe(
      true,
    );
  });
});

describe("instruktur", () => {
  it("returns at least three seeded instruktur", () => {
    expect(getInstruktur().length).toBeGreaterThanOrEqual(3);
  });

  it("every instruktur has a real branch id and at least one transmission", () => {
    for (const i of getInstruktur()) {
      expect(VALID_BRANCH_IDS.has(i.branchId)).toBe(true);
      expect(i.transmissions.length).toBeGreaterThan(0);
      expect(i.whatsapp).toMatch(/^\+62/);
    }
  });

  it("finds an instruktur by id", () => {
    expect(getInstrukturById("instruktur-001").fullName).toMatch(/Slamet/);
  });

  it("throws TypeError for an unknown instruktur id", () => {
    expect(() => getInstrukturById("nope")).toThrow(TypeError);
  });

  it("filters instruktur by branch", () => {
    const atManyar = getInstrukturByBranch("manyar");
    expect(atManyar.every((i) => i.branchId === "manyar")).toBe(true);
    expect(atManyar.length).toBeGreaterThan(0);
  });
});

describe("sesi", () => {
  it("returns at least five seeded sesi with valid time ranges", () => {
    const all = getSesi();
    expect(all.length).toBeGreaterThanOrEqual(5);
    for (const s of all) {
      expect(s.startTime < s.endTime).toBe(true);
      expect(VALID_BRANCH_IDS.has(s.branchId)).toBe(true);
      expect(() => getInstrukturById(s.instrukturId)).not.toThrow();
    }
  });

  it("anti-bentrok invariant: dipesan sesi must carry a siswaId", () => {
    for (const s of getSesi()) {
      if (s.status === "dipesan") {
        expect(s.siswaId).toBeDefined();
        expect(() => getSiswaById(s.siswaId as string)).not.toThrow();
      }
    }
  });

  it("finds a sesi by id and throws on unknown", () => {
    expect(getSesiById("sesi-001").status).toBe("dipesan");
    expect(() => getSesiById("nope")).toThrow(TypeError);
  });

  it("filters sesi by instruktur, siswa, and status", () => {
    const byInstruktur = getSesiByInstruktur("instruktur-001");
    expect(byInstruktur.every((s) => s.instrukturId === "instruktur-001")).toBe(
      true,
    );
    const bySiswa = getSesiBySiswa("siswa-001");
    expect(bySiswa.every((s) => s.siswaId === "siswa-001")).toBe(true);
    const tersedia = getSesiByStatus("tersedia" as SesiStatus);
    expect(tersedia.every((s) => s.status === "tersedia")).toBe(true);
  });
});

describe("pembayaran", () => {
  it("returns at least five seeded pembayaran", () => {
    expect(getPembayaran().length).toBeGreaterThanOrEqual(5);
  });

  it("every pembayaran references a real siswa and package with matching amount", () => {
    for (const p of getPembayaran()) {
      expect(() => getSiswaById(p.siswaId)).not.toThrow();
      const pkg = getPackageById(p.packageId);
      expect(p.amountIdr).toBe(pkg.priceIdr);
    }
  });

  it("finds a pembayaran by id and throws on unknown", () => {
    expect(getPembayaranById("pembayaran-001").status).toBe("terverifikasi");
    expect(() => getPembayaranById("nope")).toThrow(TypeError);
  });

  it("filters pembayaran by siswa and status", () => {
    const forSiswa1 = getPembayaranBySiswa("siswa-001");
    expect(forSiswa1.every((p) => p.siswaId === "siswa-001")).toBe(true);
    const pending = getPembayaranByStatus("pending" as PembayaranStatus);
    expect(pending.every((p) => p.status === "pending")).toBe(true);
  });

  it("terverifikasi pembayaran must carry verifiedAt", () => {
    for (const p of getPembayaran()) {
      if (p.status === "terverifikasi") {
        expect(p.verifiedAt).toBeDefined();
        expect(typeof p.verifiedAt).toBe("string");
      }
    }
  });
});

describe("enrollment state machine", () => {
  const ALL: EnrollmentStatus[] = [
    "menunggu_bayar",
    "menunggu_konfirmasi",
    "terkonfirmasi",
    "jadwal_dipilih",
    "selesai",
  ];

  it("every status returns exactly one forward neighbor except selesai (terminal)", () => {
    const transitions = new Map<EnrollmentStatus, EnrollmentStatus>();
    for (const s of ALL) {
      const next = nextEnrollmentStatus(s);
      if (s === "selesai") {
        expect(next).toEqual([]);
      } else {
        expect(next).toHaveLength(1);
        transitions.set(s, next[0]);
      }
    }
    // The forward chain is contiguous and ends at selesai.
    expect(transitions.get("menunggu_bayar")).toBe("menunggu_konfirmasi");
    expect(transitions.get("menunggu_konfirmasi")).toBe("terkonfirmasi");
    expect(transitions.get("terkonfirmasi")).toBe("jadwal_dipilih");
    expect(transitions.get("jadwal_dipilih")).toBe("selesai");
  });

  it("canTransitionEnrollment only allows the single forward edge", () => {
    expect(
      canTransitionEnrollment("menunggu_bayar", "menunggu_konfirmasi"),
    ).toBe(true);
    // Skipping a step is forbidden.
    expect(
      canTransitionEnrollment("menunggu_bayar", "terkonfirmasi"),
    ).toBe(false);
    // Backwards is forbidden.
    expect(
      canTransitionEnrollment("terkonfirmasi", "menunggu_konfirmasi"),
    ).toBe(false);
    // Terminal state cannot transition.
    expect(canTransitionEnrollment("selesai", "selesai")).toBe(false);
  });
});

describe("domain summary", () => {
  it("aggregates consistent counts derived from the seeded data", () => {
    const summary = getDomainSummary();
    expect(summary.totalSiswa).toBe(getSiswa().length);
    expect(summary.totalInstruktur).toBe(getInstruktur().length);
    expect(summary.totalSesi).toBe(getSesi().length);
    expect(summary.totalPembayaran).toBe(getPembayaran().length);
    expect(summary.siswaAktif).toBe(
      getSiswa().filter((s) => s.enrollmentStatus !== "selesai").length,
    );
    expect(summary.pembayaranMenungguKonfirmasi).toBe(
      getPembayaran().filter((p) => p.status === "pending").length,
    );
    expect(summary.sesiTerjadwal).toBe(
      getSesi().filter((s) => s.status !== "selesai").length,
    );
  });
});

describe("type alignment", () => {
  it("query results carry the runtime shape their interfaces declare", () => {
    const s: Siswa = getSiswaById("siswa-001");
    expect(typeof s.id).toBe("string");
    expect(typeof s.enrollmentStatus).toBe("string");

    const i: Instruktur = getInstrukturById("instruktur-002");
    expect(Array.isArray(i.transmissions)).toBe(true);

    const ses: Sesi = getSesiById("sesi-003");
    expect(typeof ses.startTime).toBe("string");

    const p: Pembayaran = getPembayaranById("pembayaran-004");
    expect(typeof p.amountIdr).toBe("number");
    expect(p.amountIdr).toBeGreaterThan(0);
  });
});
