/**
 * jadwal-booking — mesin anti-bentrok untuk pemesanan sesi (jadwal).
 *
 * Merupakan otoritas tunggal untuk pemeriksaan konflik jadwal, digunakan
 * oleh path siswa (pilih jadwal) maupun path admin (kelola jadwal siswa).
 *
 * Desain: fungsi murni di atas domain API — tidak punya store sendiri.
 * Validasi mengalir melalui `cekBentrok` sehingga aturan konflik konsisten
 * di kedua path.
 */

import {
  getSesi,
  getSesiById,
  getSesiByInstruktur,
  getSesiBySiswa,
  getSiswaById,
  updateSesi,
  setEnrollmentStatus,
  canTransitionEnrollment,
} from "@/lib/domain";
import type { Sesi } from "@/lib/domain";

// ---------------------------------------------------------------------------
// Tipe publik
// ---------------------------------------------------------------------------

/** Alasan konflik yang mungkin terjadi saat pemesanan. */
export type BentrokReason =
  | "slot_tidak_tersedia"  // status slot bukan "tersedia"
  | "siswa_overlap"        // siswa sudah punya booking di waktu yang bertabrakan
  | "instruktur_overlap";  // instruktur sudah punya sesi lain di waktu yang bertabrakan

/** Hasil `cekBentrok` — ok true jika tidak ada konflik. */
export type CekBentrokResult =
  | { ok: true }
  | { ok: false; reason: BentrokReason; message: string };

// ---------------------------------------------------------------------------
// Pembantu internal
// ---------------------------------------------------------------------------

/**
 * Cek apakah dua rentang waktu bertabrakan (overlap).
 *
 * Waktu disimpan sebagai string "HH:MM" 24 jam — dapat dibandingkan secara
 * leksikografis karena sudah zero-padded.
 *
 * Aturan: boundary menyentuh (endA === startB) TIDAK dianggap overlap.
 * Overlap ⟺ startA < endB AND startB < endA  (strict, bukan ≤).
 */
function timeRangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  return startA < endB && startB < endA;
}

// ---------------------------------------------------------------------------
// API publik
// ---------------------------------------------------------------------------

/**
 * Kembalikan semua sesi dengan status "tersedia" yang dapat dipesan siswa.
 * Urutan sama seperti dalam store (insertion order).
 */
export function getBookableSesi(): Sesi[] {
  return getSesi().filter((s) => s.status === "tersedia");
}

/**
 * Periksa apakah pemesanan sesiId oleh siswaId akan menimbulkan konflik.
 *
 * Tiga jenis konflik (diperiksa dalam urutan berikut):
 * 1. slot_tidak_tersedia — status slot bukan "tersedia".
 * 2. instruktur_overlap — instruktur slot punya sesi "dipesan" lain di
 *    tanggal + waktu yang bertabrakan.
 * 3. siswa_overlap — siswa sudah punya sesi "dipesan" lain di tanggal +
 *    waktu yang bertabrakan.
 *
 * @throws TypeError — sesiId atau siswaId tidak dikenal (dari domain).
 */
export function cekBentrok(sesiId: string, siswaId: string): CekBentrokResult {
  // throws TypeError jika id tidak dikenal
  const target = getSesiById(sesiId);
  getSiswaById(siswaId); // validasi siswaId ada

  // 1. Slot harus berstatus "tersedia"
  if (target.status !== "tersedia") {
    return {
      ok: false,
      reason: "slot_tidak_tersedia",
      message: `Sesi ${sesiId} tidak tersedia (status: ${target.status}).`,
    };
  }

  // 2. Instruktur double-book: cek sesi "dipesan" dari instruktur yang sama
  //    di tanggal yang sama dan waktu yang bertabrakan.
  const instrukturSesi = getSesiByInstruktur(target.instrukturId).filter(
    (s) => s.id !== sesiId && s.status === "dipesan" && s.date === target.date,
  );
  for (const s of instrukturSesi) {
    if (
      timeRangesOverlap(target.startTime, target.endTime, s.startTime, s.endTime)
    ) {
      return {
        ok: false,
        reason: "instruktur_overlap",
        message: `Jadwal bentrok: instruktur sudah terisi di jam ${s.startTime}–${s.endTime}.`,
      };
    }
  }

  // 3. Siswa overlap: cek sesi "dipesan" dari siswa yang sama di tanggal yang
  //    sama dan waktu yang bertabrakan.
  const siswaSesi = getSesiBySiswa(siswaId).filter(
    (s) => s.id !== sesiId && s.status === "dipesan" && s.date === target.date,
  );
  for (const s of siswaSesi) {
    if (
      timeRangesOverlap(target.startTime, target.endTime, s.startTime, s.endTime)
    ) {
      return {
        ok: false,
        reason: "siswa_overlap",
        message: `Jadwal bentrok: Anda sudah memiliki sesi di jam ${s.startTime}–${s.endTime} pada tanggal yang sama.`,
      };
    }
  }

  return { ok: true };
}

/**
 * Pesan slot sesi untuk seorang siswa.
 *
 * - Validasi via `cekBentrok` — melempar TypeError dengan pesan Indonesia
 *   jika ada konflik.
 * - Mengubah status slot menjadi "dipesan" dan menetapkan siswaId.
 * - Jika status pendaftaran siswa memungkinkan transisi ke "jadwal_dipilih"
 *   (yaitu dari "terkonfirmasi"), status dimajukan; selainnya no-op.
 *
 * @throws TypeError — konflik jadwal atau id tidak dikenal.
 */
export function bookSesi(sesiId: string, siswaId: string): Sesi {
  const check = cekBentrok(sesiId, siswaId);
  if (!check.ok) {
    throw new TypeError(check.message);
  }

  const booked = updateSesi(sesiId, { siswaId, status: "dipesan" });

  // Majukan status pendaftaran jika legal (terkonfirmasi → jadwal_dipilih)
  const siswa = getSiswaById(siswaId);
  if (canTransitionEnrollment(siswa.enrollmentStatus, "jadwal_dipilih")) {
    setEnrollmentStatus(siswaId, "jadwal_dipilih");
  }

  return booked;
}

/**
 * Pindahkan booking dari satu slot ke slot lain (admin reassign).
 *
 * Menggunakan engine konflik yang sama untuk memvalidasi slot target:
 * - Instruktur dan siswa overlap diperiksa, dengan mengecualikan slot sumber
 *   (yang akan dibebaskan) dari cek konflik.
 * - Bebaskan slot lama (`status: "tersedia"`, `siswaId: undefined`).
 * - Booking slot baru.
 *
 * @throws TypeError — slot lama tidak sedang "dipesan", slot target tidak
 *   tersedia, atau ada konflik di target.
 */
export function pindahkanSesi(fromSesiId: string, toSesiId: string): Sesi {
  const from = getSesiById(fromSesiId);
  if (from.status !== "dipesan" || !from.siswaId) {
    throw new TypeError(
      `Sesi ${fromSesiId} tidak sedang dipesan — tidak ada booking untuk dipindahkan.`,
    );
  }
  const siswaId = from.siswaId;

  const target = getSesiById(toSesiId);
  getSiswaById(siswaId); // pastikan siswa masih ada

  if (target.status !== "tersedia") {
    throw new TypeError(
      `Sesi target ${toSesiId} tidak tersedia (status: ${target.status}).`,
    );
  }

  // Instruktur overlap — kecualikan slot sumber (akan dibebaskan)
  const instrukturSesi = getSesiByInstruktur(target.instrukturId).filter(
    (s) =>
      s.id !== toSesiId &&
      s.id !== fromSesiId &&
      s.status === "dipesan" &&
      s.date === target.date,
  );
  for (const s of instrukturSesi) {
    if (
      timeRangesOverlap(target.startTime, target.endTime, s.startTime, s.endTime)
    ) {
      throw new TypeError(
        `Jadwal bentrok: instruktur sudah terisi di jam ${s.startTime}–${s.endTime}.`,
      );
    }
  }

  // Siswa overlap — kecualikan slot sumber (akan dibebaskan)
  const siswaSesi = getSesiBySiswa(siswaId).filter(
    (s) =>
      s.id !== toSesiId &&
      s.id !== fromSesiId &&
      s.status === "dipesan" &&
      s.date === target.date,
  );
  for (const s of siswaSesi) {
    if (
      timeRangesOverlap(target.startTime, target.endTime, s.startTime, s.endTime)
    ) {
      throw new TypeError(
        `Jadwal bentrok: siswa sudah memiliki sesi di jam ${s.startTime}–${s.endTime} pada tanggal yang sama.`,
      );
    }
  }

  // Validasi lolos — lakukan mutasi: bebaskan lama, booking baru
  updateSesi(fromSesiId, { siswaId: undefined, status: "tersedia" });
  return updateSesi(toSesiId, { siswaId, status: "dipesan" });
}

/**
 * Batalkan booking sebuah sesi — bebaskan slot kembali ke "tersedia".
 *
 * Ownership guard (H14): the caller must supply the siswaId whose booking is
 * being cancelled. If the sesi's stored siswaId does not match, the call is
 * rejected with a TypeError — siswa A can no longer cancel siswa B's booking
 * by guessing the sesi id.
 *
 * @throws TypeError — sesi tidak dikenal, tidak sedang dipesan, atau bukan
 *   milik `siswaId` yang diberikan.
 */
export function batalkanSesi(sesiId: string, siswaId: string): Sesi {
  const sesi = getSesiById(sesiId);
  if (sesi.status !== "dipesan") {
    throw new TypeError(
      `Sesi ${sesiId} tidak sedang dipesan (status: ${sesi.status}) — tidak ada booking untuk dibatalkan.`,
    );
  }
  if (sesi.siswaId !== siswaId) {
    throw new TypeError(
      `Sesi ini tidak dapat dibatalkan: bukan milik Anda.`,
    );
  }
  return updateSesi(sesiId, { siswaId: undefined, status: "tersedia" });
}
