/**
 * domain — typed query interface over the operational data source of truth
 * (siswa, instruktur, sesi/jadwal, pembayaran) for epics E1–E10.
 *
 * Mirrors `catalog-data` conventions: UI and other modules MUST consume data
 * through these functions; raw data constants live in `data.ts` and are
 * intentionally not re-exported. `*ById` lookups throw a TypeError on unknown
 * ids so callers can surface a 404 (e.g. via next/navigation `notFound()`).
 *
 * All mutations (state-machine transitions) are NOT implemented here — this
 * module is read-only mock data for the demo; live writes happen through
 * server actions on top of a real store (out of scope for this slice).
 */

import { instruktur, pembayaran, sesi, siswa } from "./data";
import type {
  EnrollmentStatus,
  Instruktur,
  Pembayaran,
  PembayaranMethod,
  PembayaranStatus,
  Sesi,
  SesiStatus,
  Siswa,
} from "./types";

export type {
  EnrollmentStatus,
  Instruktur,
  Pembayaran,
  PembayaranMethod,
  PembayaranStatus,
  Role,
  Sesi,
  SesiStatus,
  Siswa,
} from "./types";

function findById<T extends { id: string }>(
  items: readonly T[],
  id: string,
  kind: string,
): T {
  for (const item of items) {
    if (item.id === id) return item;
  }
  throw new TypeError(`Unknown ${kind} id: ${id}`);
}

/* ------------------------------ siswa ------------------------------ */

export function getSiswa(): Siswa[] {
  return [...siswa];
}

export function getSiswaById(id: string): Siswa {
  return findById(siswa, id, "siswa");
}

export function getSiswaByBranch(branchId: string): Siswa[] {
  return siswa.filter((s) => s.branchId === branchId);
}

export function getSiswaByEnrollmentStatus(
  status: EnrollmentStatus,
): Siswa[] {
  return siswa.filter((s) => s.enrollmentStatus === status);
}

/* ---------------------------- instruktur --------------------------- */

export function getInstruktur(): Instruktur[] {
  return [...instruktur];
}

export function getInstrukturById(id: string): Instruktur {
  return findById(instruktur, id, "instruktur");
}

export function getInstrukturByBranch(branchId: string): Instruktur[] {
  return instruktur.filter((i) => i.branchId === branchId);
}

/* ------------------------------ sesi ------------------------------- */

export function getSesi(): Sesi[] {
  return [...sesi];
}

export function getSesiById(id: string): Sesi {
  return findById(sesi, id, "sesi");
}

export function getSesiByInstruktur(instrukturId: string): Sesi[] {
  return sesi.filter((s) => s.instrukturId === instrukturId);
}

export function getSesiBySiswa(siswaId: string): Sesi[] {
  return sesi.filter((s) => s.siswaId === siswaId);
}

export function getSesiByStatus(status: SesiStatus): Sesi[] {
  return sesi.filter((s) => s.status === status);
}

/* ---------------------------- pembayaran --------------------------- */

export function getPembayaran(): Pembayaran[] {
  return [...pembayaran];
}

export function getPembayaranById(id: string): Pembayaran {
  return findById(pembayaran, id, "pembayaran");
}

export function getPembayaranBySiswa(siswaId: string): Pembayaran[] {
  return pembayaran.filter((p) => p.siswaId === siswaId);
}

export function getPembayaranByStatus(status: PembayaranStatus): Pembayaran[] {
  return pembayaran.filter((p) => p.status === status);
}

/* -------------------- enrollment state machine -------------------- */

/**
 * Allowed forward transitions in the enrollment lifecycle (PRD §73):
 *   menunggu_bayar      -> menunggu_konfirmasi
 *   menunggu_konfirmasi -> terkonfirmasi
 *   terkonfirmasi       -> jadwal_dipilih
 *   jadwal_dipilih      -> selesai
 *
 * Returns the set of statuses reachable in one step from `from`.
 */
export function nextEnrollmentStatus(from: EnrollmentStatus): EnrollmentStatus[] {
  switch (from) {
    case "menunggu_bayar":
      return ["menunggu_konfirmasi"];
    case "menunggu_konfirmasi":
      return ["terkonfirmasi"];
    case "terkonfirmasi":
      return ["jadwal_dipilih"];
    case "jadwal_dipilih":
      return ["selesai"];
    case "selesai":
      return [];
  }
}

/**
 * True iff `to` is reachable in one forward step from `from` (anti-skipping
 * guard for state-machine transitions).
 */
export function canTransitionEnrollment(
  from: EnrollmentStatus,
  to: EnrollmentStatus,
): boolean {
  return nextEnrollmentStatus(from).includes(to);
}

/* ---------------------------- aggregations ------------------------- */

/**
 * Dashboard summary counts for the admin shell. Pre-computed shape so the UI
 * can render stat cards without re-deriving counts.
 */
export interface DomainSummary {
  totalSiswa: number;
  totalInstruktur: number;
  totalSesi: number;
  totalPembayaran: number;
  /** Count of siswa whose enrollment is still in-flight (not selesai). */
  siswaAktif: number;
  /** Count of payments awaiting admin verification (PRD F5). */
  pembayaranMenungguKonfirmasi: number;
  /** Count of open (non-selesai) session slots. */
  sesiTerjadwal: number;
}

export function getDomainSummary(): DomainSummary {
  return {
    totalSiswa: siswa.length,
    totalInstruktur: instruktur.length,
    totalSesi: sesi.length,
    totalPembayaran: pembayaran.length,
    siswaAktif: siswa.filter((s) => s.enrollmentStatus !== "selesai").length,
    pembayaranMenungguKonfirmasi: pembayaran.filter(
      (p) => p.status === "pending",
    ).length,
    sesiTerjadwal: sesi.filter((s) => s.status !== "selesai").length,
  };
}
