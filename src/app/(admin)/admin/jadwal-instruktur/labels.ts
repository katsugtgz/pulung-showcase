/**
 * Label dan badge maps untuk status sesi — diekstrak agar `components.tsx`
 * hanya mengekspor komponen (mematuhi aturan react-doctor only-export-components).
 */

import type { SesiStatus } from "@/lib/domain";

export const SESI_STATUS_LABEL: Record<SesiStatus, string> = {
  tersedia: "Tersedia",
  dipesan: "Dipesan",
  selesai: "Selesai",
};

export const SESI_STATUS_BADGE: Record<SesiStatus, string> = {
  tersedia: "bg-green-100 text-green-700",
  dipesan: "bg-amber-100 text-amber-700",
  selesai: "bg-neutral-100 text-neutral-500",
};

/*
 * Pemetaan pesan domain (English dev) → Indonesia untuk UI.
 * Dipindah dari actions.ts: file "use server" hanya boleh mengekspor
 * async function (Next 16 / Turbopack memvalidasi ini saat build).
 */
/** Petakan pesan domain (English dev) ke pesan Indonesia untuk UI. */
export function mapDomainError(msg: string): string {
  // Pass-through bentrok messages produced by jadwal-booking and the
  // reschedule guard (C4): they are already user-facing Indonesian.
  if (msg.includes("Jadwal bentrok:")) {
    return msg;
  }
  // Missing-owner invariant from updateSesi: distinguish from the generic
  // "dipesan" branch below so admins promoting tersedia → dipesan without
  // an assigned siswa get the correct recovery hint.
  if (msg.includes("harus memiliki siswaId")) {
    return "Sesi berstatus dipesan harus memiliki siswa. Tetapkan siswa terlebih dahulu.";
  }
  if (msg.includes("dipesan")) {
    return "Sesi sudah dipesan siswa — pindahkan dulu jadwalnya.";
  }
  if (msg.includes("startTime must be before endTime")) {
    return "Waktu mulai harus sebelum waktu selesai.";
  }
  if (
    msg.includes("Invalid date") ||
    msg.includes("Invalid startTime") ||
    msg.includes("Invalid endTime")
  ) {
    return "Format tanggal/waktu tidak valid.";
  }
  if (msg.includes("Unknown instruktur")) {
    return "Instruktur tidak ditemukan.";
  }
  if (msg.includes("Unknown branch")) {
    return "Cabang tidak ditemukan.";
  }
  if (msg.includes("Unknown package")) {
    return "Paket tidak ditemukan.";
  }
  return "Terjadi kesalahan. Coba lagi.";
}
