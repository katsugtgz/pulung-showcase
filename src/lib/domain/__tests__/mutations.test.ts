/**
 * Mutation tests for the domain write layer. Every test exercises the public
 * interface only (index.ts exports); store internals are never imported.
 *
 * `resetDomainStore` is called in `beforeEach` to guarantee full isolation
 * between test cases — mutations from one test must not bleed into the next.
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  addPembayaran,
  addSesi,
  getPembayaran,
  getPembayaranById,
  getSesi,
  getSesiById,
  getSiswa,
  getSiswaById,
  removeSesi,
  resetDomainStore,
  setEnrollmentStatus,
  tolakPembayaran,
  updateSesi,
  updateSiswa,
  verifikasiPembayaran,
} from "../index";

beforeEach(() => {
  resetDomainStore();
});

/* ========================= updateSiswa ========================= */

describe("updateSiswa", () => {
  it("updates fullName and returns a copy with the new value", () => {
    const updated = updateSiswa("siswa-001", { fullName: "Rizki Baru" });
    expect(updated.fullName).toBe("Rizki Baru");
    // Store reflects the change
    expect(getSiswaById("siswa-001").fullName).toBe("Rizki Baru");
  });

  it("updates packageId when it exists in catalog-data", () => {
    const updated = updateSiswa("siswa-001", { packageId: "paket-matic" });
    expect(updated.packageId).toBe("paket-matic");
  });

  it("updates branchId when it exists in catalog-data", () => {
    const updated = updateSiswa("siswa-001", { branchId: "manyar" });
    expect(updated.branchId).toBe("manyar");
  });

  it("throws TypeError for an unknown siswa id", () => {
    expect(() => updateSiswa("siswa-999", { fullName: "Ghost" })).toThrow(
      TypeError,
    );
  });

  it("throws TypeError for a packageId that does not exist in catalog-data", () => {
    expect(() =>
      updateSiswa("siswa-001", { packageId: "paket-nonexistent" }),
    ).toThrow(TypeError);
  });

  it("throws TypeError for a branchId that does not exist in catalog-data", () => {
    expect(() =>
      updateSiswa("siswa-001", { branchId: "cabang-hantu" }),
    ).toThrow(TypeError);
  });

  it("does not change unpatched fields", () => {
    const before = getSiswaById("siswa-001");
    updateSiswa("siswa-001", { fullName: "Rizki Updated" });
    const after = getSiswaById("siswa-001");
    expect(after.packageId).toBe(before.packageId);
    expect(after.branchId).toBe(before.branchId);
    expect(after.enrollmentStatus).toBe(before.enrollmentStatus);
  });
});

/* ==================== setEnrollmentStatus ==================== */

describe("setEnrollmentStatus", () => {
  it("advances status one forward step", () => {
    // siswa-003 is "menunggu_konfirmasi" in seed
    const updated = setEnrollmentStatus("siswa-003", "terkonfirmasi");
    expect(updated.enrollmentStatus).toBe("terkonfirmasi");
    expect(getSiswaById("siswa-003").enrollmentStatus).toBe("terkonfirmasi");
  });

  it("advances through the full chain in sequence", () => {
    // siswa-005 starts at "menunggu_bayar"
    setEnrollmentStatus("siswa-005", "menunggu_konfirmasi");
    setEnrollmentStatus("siswa-005", "terkonfirmasi");
    setEnrollmentStatus("siswa-005", "jadwal_dipilih");
    const final = setEnrollmentStatus("siswa-005", "selesai");
    expect(final.enrollmentStatus).toBe("selesai");
  });

  it("throws TypeError for an unknown siswa id", () => {
    expect(() =>
      setEnrollmentStatus("siswa-999", "terkonfirmasi"),
    ).toThrow(TypeError);
  });

  it("throws TypeError when skipping a step", () => {
    // siswa-005 is "menunggu_bayar" — cannot jump to "terkonfirmasi"
    expect(() =>
      setEnrollmentStatus("siswa-005", "terkonfirmasi"),
    ).toThrow(TypeError);
  });

  it("throws TypeError for a backward transition", () => {
    // siswa-002 is "jadwal_dipilih" — cannot go back to "terkonfirmasi"
    expect(() =>
      setEnrollmentStatus("siswa-002", "terkonfirmasi"),
    ).toThrow(TypeError);
  });

  it("throws TypeError from the terminal state", () => {
    // siswa-004 is "selesai"
    expect(() =>
      setEnrollmentStatus("siswa-004", "selesai"),
    ).toThrow(TypeError);
  });
});

/* ========================== addSesi ========================== */

describe("addSesi", () => {
  it("creates a new sesi and returns it with a generated id", () => {
    const before = getSesi().length;
    const sesi = addSesi({
      instrukturId: "instruktur-001",
      branchId: "gunung-anyar",
      date: "2026-08-01",
      startTime: "09:00",
      endTime: "10:00",
    });
    expect(sesi.id).toMatch(/^sesi-\d{3}$/);
    expect(getSesi().length).toBe(before + 1);
  });

  it("continues the seed numbering for the generated id", () => {
    // Seed has sesi-001 through sesi-005; next should be sesi-006
    const sesi = addSesi({
      instrukturId: "instruktur-002",
      branchId: "manyar",
      date: "2026-08-02",
      startTime: "14:00",
      endTime: "15:30",
    });
    expect(sesi.id).toBe("sesi-006");
  });

  it("defaults status to 'tersedia' when not provided", () => {
    const sesi = addSesi({
      instrukturId: "instruktur-001",
      branchId: "gunung-anyar",
      date: "2026-08-03",
      startTime: "10:00",
      endTime: "11:00",
    });
    expect(sesi.status).toBe("tersedia");
  });

  it("respects an explicit status", () => {
    const sesi = addSesi({
      instrukturId: "instruktur-001",
      branchId: "gunung-anyar",
      date: "2026-08-04",
      startTime: "10:00",
      endTime: "11:00",
      status: "selesai",
    });
    expect(sesi.status).toBe("selesai");
  });

  it("throws TypeError for an unknown instrukturId", () => {
    expect(() =>
      addSesi({
        instrukturId: "instruktur-999",
        branchId: "gunung-anyar",
        date: "2026-08-01",
        startTime: "09:00",
        endTime: "10:00",
      }),
    ).toThrow(TypeError);
  });

  it("throws TypeError for a branchId not in catalog-data", () => {
    expect(() =>
      addSesi({
        instrukturId: "instruktur-001",
        branchId: "cabang-hantu",
        date: "2026-08-01",
        startTime: "09:00",
        endTime: "10:00",
      }),
    ).toThrow(TypeError);
  });

  it("throws TypeError for an invalid date format", () => {
    expect(() =>
      addSesi({
        instrukturId: "instruktur-001",
        branchId: "gunung-anyar",
        date: "08/01/2026",
        startTime: "09:00",
        endTime: "10:00",
      }),
    ).toThrow(TypeError);
  });

  it("throws TypeError for an invalid startTime format", () => {
    expect(() =>
      addSesi({
        instrukturId: "instruktur-001",
        branchId: "gunung-anyar",
        date: "2026-08-01",
        startTime: "9:00",
        endTime: "10:00",
      }),
    ).toThrow(TypeError);
  });

  it("throws TypeError when startTime equals endTime", () => {
    expect(() =>
      addSesi({
        instrukturId: "instruktur-001",
        branchId: "gunung-anyar",
        date: "2026-08-01",
        startTime: "10:00",
        endTime: "10:00",
      }),
    ).toThrow(TypeError);
  });

  it("throws TypeError when startTime is after endTime", () => {
    expect(() =>
      addSesi({
        instrukturId: "instruktur-001",
        branchId: "gunung-anyar",
        date: "2026-08-01",
        startTime: "11:00",
        endTime: "10:00",
      }),
    ).toThrow(TypeError);
  });

  it("throws TypeError when status is dipesan but siswaId is missing (C2)", () => {
    // addSesi must mirror updateSesi's invariant: an ownerless booked session
    // can never be persisted.
    expect(() =>
      addSesi({
        instrukturId: "instruktur-001",
        branchId: "gunung-anyar",
        date: "2026-08-01",
        startTime: "09:00",
        endTime: "10:00",
        status: "dipesan",
      }),
    ).toThrow(/harus memiliki siswaId/);
  });

  it("throws TypeError when status is dipesan and siswaId is unknown (C2)", () => {
    expect(() =>
      addSesi({
        instrukturId: "instruktur-001",
        branchId: "gunung-anyar",
        date: "2026-08-01",
        startTime: "09:00",
        endTime: "10:00",
        status: "dipesan",
        siswaId: "siswa-999",
      }),
    ).toThrow(/Unknown siswa id/);
  });

  it("creates a dipesan sesi with siswaId when both are supplied (C2)", () => {
    const sesi = addSesi({
      instrukturId: "instruktur-001",
      branchId: "gunung-anyar",
      date: "2026-08-01",
      startTime: "09:00",
      endTime: "10:00",
      status: "dipesan",
      siswaId: "siswa-001",
    });
    expect(sesi.status).toBe("dipesan");
    expect(sesi.siswaId).toBe("siswa-001");
  });
});

/* ========================= updateSesi ========================= */

describe("updateSesi", () => {
  it("updates date and returns a copy with the new value", () => {
    const updated = updateSesi("sesi-002", { date: "2026-08-10" });
    expect(updated.date).toBe("2026-08-10");
    expect(getSesiById("sesi-002").date).toBe("2026-08-10");
  });

  it("updates status", () => {
    const updated = updateSesi("sesi-002", { status: "selesai" });
    expect(updated.status).toBe("selesai");
  });

  it("clears siswaId when passed as undefined (on a tersedia sesi)", () => {
    // sesi-002 is "tersedia"; clearing siswaId there is a legal no-op-ish
    // patch that does not violate the dipesan-requires-siswaId invariant.
    const updated = updateSesi("sesi-002", { siswaId: undefined });
    expect(updated.siswaId).toBeUndefined();
  });

  it("throws TypeError when clearing siswaId on a dipesan sesi without freeing it", () => {
    // sesi-001 is "dipesan" — clearing siswaId without changing status would
    // leave a dipesan row with no owner; the new invariant forbids that.
    expect(() => updateSesi("sesi-001", { siswaId: undefined })).toThrow(
      TypeError,
    );
  });

  it("allows clearing siswaId on a dipesan sesi when status also moves to tersedia", () => {
    // batalkan-style patch: free the slot AND clear the owner atomically.
    const updated = updateSesi("sesi-001", {
      siswaId: undefined,
      status: "tersedia",
    });
    expect(updated.siswaId).toBeUndefined();
    expect(updated.status).toBe("tersedia");
  });

  it("throws TypeError when setting status dipesan on a sesi without a siswaId", () => {
    // sesi-002 is "tersedia" with no siswaId — promoting it to dipesan in the
    // same patch without supplying siswaId violates the invariant.
    expect(() => updateSesi("sesi-002", { status: "dipesan" })).toThrow(
      TypeError,
    );
  });

  it("rejects an invalid SesiStatus value at runtime (C1)", () => {
    // The TS type already rules this out at compile time, but server-action
    // callers pass untyped form input — guard the runtime boundary too.
    expect(() =>
      updateSesi("sesi-002", {
        status: "bogus" as unknown as "tersedia",
      }),
    ).toThrow(TypeError);
  });

  it("throws TypeError for an unknown sesi id", () => {
    expect(() => updateSesi("sesi-999", { date: "2026-08-10" })).toThrow(
      TypeError,
    );
  });

  it("throws TypeError for an invalid date format", () => {
    expect(() =>
      updateSesi("sesi-002", { date: "2026/08/10" }),
    ).toThrow(TypeError);
  });

  it("throws TypeError when effective start >= end after patch", () => {
    // sesi-002 has 10:30–11:30; pushing endTime behind startTime
    expect(() =>
      updateSesi("sesi-002", { endTime: "10:00" }),
    ).toThrow(TypeError);
  });

  it("throws TypeError for a siswaId that does not exist", () => {
    expect(() =>
      updateSesi("sesi-002", { siswaId: "siswa-999" }),
    ).toThrow(TypeError);
  });

  it("accepts a valid siswaId", () => {
    const updated = updateSesi("sesi-002", { siswaId: "siswa-003" });
    expect(updated.siswaId).toBe("siswa-003");
  });
});

/* ========================= removeSesi ========================= */

describe("removeSesi", () => {
  it("removes a tersedia sesi from the store", () => {
    const before = getSesi().length;
    removeSesi("sesi-002"); // status: tersedia
    expect(getSesi().length).toBe(before - 1);
    expect(getSesi().find((s) => s.id === "sesi-002")).toBeUndefined();
  });

  it("removes a selesai sesi from the store", () => {
    removeSesi("sesi-005"); // status: selesai
    expect(getSesi().find((s) => s.id === "sesi-005")).toBeUndefined();
  });

  it("throws TypeError for an unknown sesi id", () => {
    expect(() => removeSesi("sesi-999")).toThrow(TypeError);
  });

  it("throws TypeError when sesi has status 'dipesan'", () => {
    // sesi-001 is "dipesan"
    expect(() => removeSesi("sesi-001")).toThrow(TypeError);
  });
});

/* ======================== addPembayaran ======================= */

describe("addPembayaran", () => {
  it("creates a pending pembayaran with a generated id", () => {
    const before = getPembayaran().length;
    const pem = addPembayaran({
      siswaId: "siswa-001",
      packageId: "paket-manual",
      amountIdr: 1_500_000,
      method: "qris",
      createdAt: "2026-07-17",
    });
    expect(pem.status).toBe("pending");
    expect(pem.id).toMatch(/^pembayaran-\d{3}$/);
    expect(getPembayaran().length).toBe(before + 1);
  });

  it("continues the seed numbering for the generated id", () => {
    // Seed has pembayaran-001 through pembayaran-005; next should be pembayaran-006
    const pem = addPembayaran({
      siswaId: "siswa-001",
      packageId: "paket-manual",
      amountIdr: 1_500_000,
      method: "manual",
      createdAt: "2026-07-17",
    });
    expect(pem.id).toBe("pembayaran-006");
  });

  it("throws TypeError for an unknown siswaId", () => {
    expect(() =>
      addPembayaran({
        siswaId: "siswa-999",
        packageId: "paket-manual",
        amountIdr: 1_500_000,
        method: "qris",
        createdAt: "2026-07-17",
      }),
    ).toThrow(TypeError);
  });

  it("throws TypeError for a packageId not in catalog-data", () => {
    expect(() =>
      addPembayaran({
        siswaId: "siswa-001",
        packageId: "paket-nonexistent",
        amountIdr: 1_500_000,
        method: "qris",
        createdAt: "2026-07-17",
      }),
    ).toThrow(TypeError);
  });
});

/* =================== verifikasiPembayaran =================== */

describe("verifikasiPembayaran", () => {
  it("sets pending → terverifikasi and records verifier fields", () => {
    // pembayaran-003 is "pending" in seed
    const result = verifikasiPembayaran(
      "pembayaran-003",
      "admin-001",
      "2026-07-17",
    );
    expect(result.status).toBe("terverifikasi");
    expect(result.verifiedAt).toBe("2026-07-17");
    expect(result.verifiedByAdminId).toBe("admin-001");
    // Store reflects the change
    expect(getPembayaranById("pembayaran-003").status).toBe("terverifikasi");
  });

  it("throws TypeError for an unknown pembayaran id", () => {
    expect(() =>
      verifikasiPembayaran("pembayaran-999", "admin-001", "2026-07-17"),
    ).toThrow(TypeError);
  });

  it("throws TypeError when payment is already terverifikasi", () => {
    // pembayaran-001 is "terverifikasi" in seed
    expect(() =>
      verifikasiPembayaran("pembayaran-001", "admin-001", "2026-07-17"),
    ).toThrow(TypeError);
  });

  it("throws TypeError when payment is already ditolak", () => {
    // First reject it, then try to verify
    tolakPembayaran("pembayaran-003", "admin-001", "2026-07-17");
    expect(() =>
      verifikasiPembayaran("pembayaran-003", "admin-001", "2026-07-17"),
    ).toThrow(TypeError);
  });
});

/* ====================== tolakPembayaran ====================== */

describe("tolakPembayaran", () => {
  it("sets pending → ditolak and records verifier fields", () => {
    const result = tolakPembayaran(
      "pembayaran-003",
      "admin-002",
      "2026-07-17",
    );
    expect(result.status).toBe("ditolak");
    expect(result.verifiedAt).toBe("2026-07-17");
    expect(result.verifiedByAdminId).toBe("admin-002");
    expect(getPembayaranById("pembayaran-003").status).toBe("ditolak");
  });

  it("throws TypeError for an unknown pembayaran id", () => {
    expect(() =>
      tolakPembayaran("pembayaran-999", "admin-001", "2026-07-17"),
    ).toThrow(TypeError);
  });

  it("throws TypeError when payment is already terverifikasi", () => {
    expect(() =>
      tolakPembayaran("pembayaran-001", "admin-001", "2026-07-17"),
    ).toThrow(TypeError);
  });

  it("throws TypeError when payment is already ditolak", () => {
    tolakPembayaran("pembayaran-003", "admin-001", "2026-07-17");
    expect(() =>
      tolakPembayaran("pembayaran-003", "admin-001", "2026-07-17"),
    ).toThrow(TypeError);
  });
});

/* ==================== store isolation ====================== */

describe("store isolation (resetDomainStore)", () => {
  it("mutations from a previous test do not leak — addSesi id resets to sesi-006", () => {
    // If isolation works, the store was reset by beforeEach and the next addSesi
    // should generate sesi-006 (seed max is sesi-005), not a higher number.
    const sesi = addSesi({
      instrukturId: "instruktur-001",
      branchId: "gunung-anyar",
      date: "2026-09-01",
      startTime: "08:00",
      endTime: "09:00",
    });
    expect(sesi.id).toBe("sesi-006");
  });

  it("getSiswa returns exactly the seed count after reset", () => {
    // Remove does not apply to siswa, but updateSiswa should not change count
    updateSiswa("siswa-001", { fullName: "Mutated" });
    // Simulate what beforeEach does in the next test
    resetDomainStore();
    expect(getSiswa().find((s) => s.id === "siswa-001")?.fullName).toBe(
      "Rizki Pratama",
    );
  });
});
