/**
 * Unit tests — mesin anti-bentrok jadwal-booking.
 *
 * Konvensi: resetDomainStore() di beforeEach sehingga setiap test
 * dimulai dari seed data yang bersih.
 *
 * Seed data relevan:
 *   sesi-001: instruktur-001, 2026-07-20, 09:00–10:00, dipesan, siswa-001
 *   sesi-002: instruktur-001, 2026-07-20, 10:30–11:30, tersedia
 *   sesi-003: instruktur-002, 2026-07-21, 14:00–15:00, dipesan, siswa-002
 *   sesi-004: instruktur-003, 2026-07-22, 08:00–09:00, tersedia
 *   sesi-005: instruktur-001, 2026-07-18, 09:00–10:00, selesai,  siswa-004
 *
 *   siswa-001: Rizki Pratama,  terkonfirmasi
 *   siswa-002: Dewi Lestari,   jadwal_dipilih
 *   siswa-003: Bayu Nugroho,   menunggu_konfirmasi
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  addSesi,
  getSesiById,
  getSiswaById,
  resetDomainStore,
} from "@/lib/domain";
import {
  getBookableSesi,
  cekBentrok,
  bookSesi,
  pindahkanSesi,
  batalkanSesi,
} from "../index";

beforeEach(() => {
  resetDomainStore();
});

/* ────────────────────────────────────────────────────────────────────
 * getBookableSesi
 * ──────────────────────────────────────────────────────────────────── */

describe("getBookableSesi", () => {
  it("mengembalikan hanya slot berstatus tersedia", () => {
    const slots = getBookableSesi();
    expect(slots.every((s) => s.status === "tersedia")).toBe(true);
  });

  it("tidak termasuk slot dipesan atau selesai", () => {
    const slots = getBookableSesi();
    const ids = slots.map((s) => s.id);
    expect(ids).not.toContain("sesi-001"); // dipesan
    expect(ids).not.toContain("sesi-003"); // dipesan
    expect(ids).not.toContain("sesi-005"); // selesai
  });

  it("menyertakan sesi-002 dan sesi-004 dari seed", () => {
    const ids = getBookableSesi().map((s) => s.id);
    expect(ids).toContain("sesi-002");
    expect(ids).toContain("sesi-004");
  });
});

/* ────────────────────────────────────────────────────────────────────
 * cekBentrok — slot_tidak_tersedia
 * ──────────────────────────────────────────────────────────────────── */

describe("cekBentrok: slot sudah dipesan", () => {
  it("mengembalikan reason slot_tidak_tersedia untuk slot dipesan", () => {
    const result = cekBentrok("sesi-001", "siswa-002");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("slot_tidak_tersedia");
      expect(result.message).toMatch(/sesi-001/);
    }
  });

  it("mengembalikan reason slot_tidak_tersedia untuk slot selesai", () => {
    const result = cekBentrok("sesi-005", "siswa-002");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("slot_tidak_tersedia");
    }
  });
});

/* ────────────────────────────────────────────────────────────────────
 * cekBentrok — instruktur_overlap
 * ──────────────────────────────────────────────────────────────────── */

describe("cekBentrok: instruktur sudah punya sesi bertabrakan", () => {
  it("menolak pemesanan jika instruktur double-book pada rentang waktu yang overlap", () => {
    // instruktur-001 sudah punya sesi-001 (09:00–10:00, dipesan) pada 2026-07-20.
    // Tambahkan slot instruktur-001 pada 09:30–10:30 di tanggal yang sama.
    const overlap = addSesi({
      instrukturId: "instruktur-001",
      branchId: "gunung-anyar",
      date: "2026-07-20",
      startTime: "09:30",
      endTime: "10:30",
    });

    const result = cekBentrok(overlap.id, "siswa-003");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("instruktur_overlap");
      expect(result.message).toMatch(/instruktur/i);
    }
  });

  it("mengizinkan pemesanan jika instruktur punya slot di tanggal berbeda", () => {
    // sesi-004 adalah instruktur-003, 2026-07-22 — tidak ada konflik instruktur
    const result = cekBentrok("sesi-004", "siswa-003");
    expect(result.ok).toBe(true);
  });
});

/* ────────────────────────────────────────────────────────────────────
 * cekBentrok — siswa_overlap
 * ──────────────────────────────────────────────────────────────────── */

describe("cekBentrok: siswa sudah punya sesi bertabrakan", () => {
  it("menolak jika siswa sudah punya booking overlap di tanggal yang sama", () => {
    // siswa-001 sudah punya sesi-001 (09:00–10:00) pada 2026-07-20.
    // Tambahkan slot lain (instruktur-002) di tanggal yang sama, jam 09:30–10:30.
    const overlap = addSesi({
      instrukturId: "instruktur-002",
      branchId: "manyar",
      date: "2026-07-20",
      startTime: "09:30",
      endTime: "10:30",
    });

    const result = cekBentrok(overlap.id, "siswa-001");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("siswa_overlap");
      expect(result.message).toMatch(/Jadwal bentrok/i);
    }
  });

  it("mengizinkan siswa memesan slot di tanggal yang berbeda", () => {
    // siswa-001 punya sesi-001 di 2026-07-20; sesi-004 di 2026-07-22 — beda tanggal
    const result = cekBentrok("sesi-004", "siswa-001");
    expect(result.ok).toBe(true);
  });
});

/* ────────────────────────────────────────────────────────────────────
 * cekBentrok — boundary touching
 * ──────────────────────────────────────────────────────────────────── */

describe("cekBentrok: batas waktu menyentuh (end == start) — BUKAN konflik", () => {
  it("mengizinkan slot yang mulai tepat saat slot lain berakhir (instruktur)", () => {
    // instruktur-001 punya sesi-001 (09:00–10:00, dipesan) pada 2026-07-20.
    // Slot baru mulai tepat di 10:00 — harus TIDAK overlap.
    const adjacent = addSesi({
      instrukturId: "instruktur-001",
      branchId: "gunung-anyar",
      date: "2026-07-20",
      startTime: "10:00",
      endTime: "11:00",
    });

    const result = cekBentrok(adjacent.id, "siswa-003");
    expect(result.ok).toBe(true);
  });

  it("mengizinkan slot yang berakhir tepat saat slot lain mulai (instruktur)", () => {
    // instruktur-001 punya sesi-002 (10:30–11:30, tersedia) — kita buat slot
    // yang berakhir tepat di 10:30 agar tidak overlap.
    const before = addSesi({
      instrukturId: "instruktur-001",
      branchId: "gunung-anyar",
      date: "2026-07-20",
      startTime: "09:30",
      endTime: "10:30",
      // status tersedia by default
    });
    // sesi-001 (09:00–10:00, dipesan) DOES overlap with 09:30–10:30,
    // tapi kita mau uji boundary dengan sesi-002 (tersedia, bukan dipesan).
    // instruktur overlap hanya cek slot "dipesan".
    // Jadi before tidak akan bertabrakan instruktur karena hanya sesi-001 yg dipesan
    // dan 09:00–10:00 vs 09:30–10:30 → 09:30 < 10:00 → overlap!
    // Untuk test boundary murni, pakai instruktur berbeda.
    const adjInstr = addSesi({
      instrukturId: "instruktur-003",
      branchId: "pandugo",
      date: "2026-07-22",
      startTime: "07:00",
      endTime: "08:00",
    });
    // sesi-004 instruktur-003 08:00–09:00 (tersedia, bukan dipesan) — tidak ada konflik instruktur.
    // adjInstr berakhir tepat di 08:00 = startTime sesi-004.
    // Kita uji: apakah ada siswa overlap? siswa-003 tidak punya booking apapun.
    const result = cekBentrok(adjInstr.id, "siswa-003");
    expect(result.ok).toBe(true);
  });

  it("mengizinkan slot siswa yang berakhir tepat saat booking lain mulai", () => {
    // siswa-001 punya sesi-001 (09:00–10:00, dipesan) pada 2026-07-20.
    // Slot baru instruktur-002 mulai tepat di 10:00 — boundary, bukan overlap.
    const boundary = addSesi({
      instrukturId: "instruktur-002",
      branchId: "manyar",
      date: "2026-07-20",
      startTime: "10:00",
      endTime: "11:00",
    });

    const result = cekBentrok(boundary.id, "siswa-001");
    expect(result.ok).toBe(true);
  });
});

/* ────────────────────────────────────────────────────────────────────
 * bookSesi — happy path
 * ──────────────────────────────────────────────────────────────────── */

describe("bookSesi: happy path", () => {
  it("mengubah status slot menjadi dipesan dan menetapkan siswaId", () => {
    // sesi-002: tersedia, instruktur-001, 2026-07-20, 10:30–11:30
    // siswa-001 punya sesi-001 di 09:00–10:00 — tidak overlap dengan 10:30–11:30
    const result = bookSesi("sesi-002", "siswa-001");
    expect(result.status).toBe("dipesan");
    expect(result.siswaId).toBe("siswa-001");
  });

  it("status slot di store diperbarui setelah bookSesi", () => {
    bookSesi("sesi-002", "siswa-001");
    const stored = getSesiById("sesi-002");
    expect(stored.status).toBe("dipesan");
    expect(stored.siswaId).toBe("siswa-001");
  });

  it("memajukan status pendaftaran siswa dari terkonfirmasi ke jadwal_dipilih", () => {
    // siswa-001.enrollmentStatus = "terkonfirmasi"
    bookSesi("sesi-002", "siswa-001");
    const siswa = getSiswaById("siswa-001");
    expect(siswa.enrollmentStatus).toBe("jadwal_dipilih");
  });

  it("tidak mengubah enrollment siswa yang sudah di jadwal_dipilih (no-op)", () => {
    // siswa-002.enrollmentStatus = "jadwal_dipilih" (tidak bisa maju ke jadwal_dipilih lagi)
    // sesi-004 adalah slot tersedia yang bisa dipesan siswa-002
    bookSesi("sesi-004", "siswa-002");
    const siswa = getSiswaById("siswa-002");
    // Setelah booking, enrollment tidak berubah (sudah jadwal_dipilih)
    expect(siswa.enrollmentStatus).toBe("jadwal_dipilih");
  });
});

/* ────────────────────────────────────────────────────────────────────
 * bookSesi — error path
 * ──────────────────────────────────────────────────────────────────── */

describe("bookSesi: menolak konflik", () => {
  it("melempar TypeError jika slot sudah dipesan", () => {
    expect(() => bookSesi("sesi-001", "siswa-002")).toThrow(TypeError);
  });

  it("melempar TypeError jika ada instruktur overlap", () => {
    const overlap = addSesi({
      instrukturId: "instruktur-001",
      branchId: "gunung-anyar",
      date: "2026-07-20",
      startTime: "09:30",
      endTime: "10:30",
    });
    expect(() => bookSesi(overlap.id, "siswa-003")).toThrow(TypeError);
  });

  it("melempar TypeError jika ada siswa overlap", () => {
    const overlap = addSesi({
      instrukturId: "instruktur-002",
      branchId: "manyar",
      date: "2026-07-20",
      startTime: "09:30",
      endTime: "10:30",
    });
    expect(() => bookSesi(overlap.id, "siswa-001")).toThrow(TypeError);
  });
});

/* ────────────────────────────────────────────────────────────────────
 * pindahkanSesi — happy path
 * ──────────────────────────────────────────────────────────────────── */

describe("pindahkanSesi: happy path", () => {
  it("slot lama dibebaskan setelah pindah", () => {
    // from: sesi-001 (dipesan, siswa-001) → to: sesi-004 (tersedia)
    pindahkanSesi("sesi-001", "sesi-004");
    const freed = getSesiById("sesi-001");
    expect(freed.status).toBe("tersedia");
    expect(freed.siswaId).toBeUndefined();
  });

  it("slot baru menjadi dipesan dengan siswaId yang benar", () => {
    pindahkanSesi("sesi-001", "sesi-004");
    const booked = getSesiById("sesi-004");
    expect(booked.status).toBe("dipesan");
    expect(booked.siswaId).toBe("siswa-001");
  });
});

/* ────────────────────────────────────────────────────────────────────
 * pindahkanSesi — error path
 * ──────────────────────────────────────────────────────────────────── */

describe("pindahkanSesi: menolak pemindahan tidak valid", () => {
  it("melempar TypeError jika slot sumber bukan dipesan", () => {
    expect(() => pindahkanSesi("sesi-002", "sesi-004")).toThrow(TypeError);
  });

  it("melempar TypeError jika slot target tidak tersedia", () => {
    // sesi-001 (dipesan) → sesi-003 (juga dipesan)
    expect(() => pindahkanSesi("sesi-001", "sesi-003")).toThrow(TypeError);
  });
});

/* ────────────────────────────────────────────────────────────────────
 * batalkanSesi
 * ──────────────────────────────────────────────────────────────────── */

describe("batalkanSesi", () => {
  it("membebaskan slot yang dipesan kembali ke tersedia", () => {
    batalkanSesi("sesi-001", "siswa-001");
    const freed = getSesiById("sesi-001");
    expect(freed.status).toBe("tersedia");
    expect(freed.siswaId).toBeUndefined();
  });

  it("melempar TypeError jika slot tidak sedang dipesan", () => {
    expect(() => batalkanSesi("sesi-002", "siswa-001")).toThrow(TypeError); // tersedia
    expect(() => batalkanSesi("sesi-005", "siswa-004")).toThrow(TypeError); // selesai
  });

  it("melempar TypeError jika pemanggil bukan pemilik booking (H14)", () => {
    // sesi-001 dipesan oleh siswa-001; siswa-002 tidak boleh membatalkannya.
    expect(() => batalkanSesi("sesi-001", "siswa-002")).toThrow(TypeError);
    expect(() => batalkanSesi("sesi-001", "siswa-002")).toThrow(
      /bukan milik Anda/,
    );
  });

  it("tidak melempar TypeError jika pemanggil adalah pemilik asli sesi-001", () => {
    // Sanity: pemilik yang benar tetap bisa membatalkan (sudah diuji di atas,
    // tetapi eksplisit untuk kontras dengan test H14).
    expect(() => batalkanSesi("sesi-001", "siswa-001")).not.toThrow();
  });
});
