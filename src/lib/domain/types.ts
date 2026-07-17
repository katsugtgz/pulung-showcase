/**
 * Type definitions for the domain module — the operational data layer for the
 * Kursus Mengemudi Pulung demo (post-landing epics E1–E10).
 *
 * Siblings to `catalog-data` (which models the public-facing marketing data:
 * packages, branches, clusters) and mirrors its conventions: UI consumes data
 * through the query functions in `index.ts`; raw constants live in `data.ts`
 * and are intentionally not re-exported. All seed data here is MOCK for the
 * demo — no real customer PII. All user-facing strings are Indonesian.
 *
 * Cross-references: `packageId` and `branchId` values must exist in
 * `catalog-data` (type-only dependency via `import type`).
 */

import type { TransmissionType } from "@/lib/catalog-data";

/**
 * Application roles. Re-exported from `@/types/globals` (single source of
 * truth) so the `domain` module's public surface stays self-documenting for
 * consumers that already import from here. See globals.d.ts for the
 * `CustomJwtSessionClaims` augmentation that ties `Role` to Clerk JWT claims.
 */
export type { Role } from "@/types/globals";

/**
 * Enrollment state machine per PRD §73:
 *   pilih paket -> menunggu bayar -> menunggu konfirmasi admin ->
 *   terkonfirmasi -> jadwal dipilih -> invoice+kartu terbit (selesai).
 *
 * Forward transitions only; see `index.ts` `nextEnrollmentStatus` for the
 * allowed edges.
 */
export type EnrollmentStatus =
  | "menunggu_bayar"
  | "menunggu_konfirmasi"
  | "terkonfirmasi"
  | "jadwal_dipilih"
  | "selesai";

/** Payment method. QRIS is mocked for the demo; manual = admin-confirmed cash/transfer. */
export type PembayaranMethod = "qris" | "manual";

/** Payment verification lifecycle. */
export type PembayaranStatus = "pending" | "terverifikasi" | "ditolak";

/** Sesi/jadwal slot lifecycle. Anti-bentrok: a `dipesan` slot cannot be double-booked. */
export type SesiStatus = "tersedia" | "dipesan" | "selesai";

/** A student (siswa). Linked 1:1 to a Clerk user when auth is live. */
export interface Siswa {
  /** Stable identifier, safe for URLs and React keys, e.g. "siswa-001". */
  id: string;
  /**
   * Clerk user id. Optional in the demo seed because seeded rows predate live
   * Clerk keys; a real siswa has this set after registration.
   */
  clerkUserId?: string;
  /** Indonesian full name, e.g. "Rizki Pratama". */
  fullName: string;
  /** Enrolled package — must exist in `catalog-data` (e.g. "paket-manual"). */
  packageId: string;
  /** Home branch — must exist in `catalog-data` (e.g. "gunung-anyar"). */
  branchId: string;
  /** Where in the enrollment state machine this siswa currently sits. */
  enrollmentStatus: EnrollmentStatus;
  /** Enrollment creation date, `YYYY-MM-DD`. */
  createdAt: string;
}

/** A driving instructor (instruktur). */
export interface Instruktur {
  /** Stable identifier, e.g. "instruktur-001". */
  id: string;
  /** Indonesian full name, e.g. "Pak Slamet". */
  fullName: string;
  /** Branch where this instructor is based — must exist in `catalog-data`. */
  branchId: string;
  /** Transmission types this instructor is certified to teach. */
  transmissions: readonly TransmissionType[];
  /** Display-form WhatsApp number for admin contact, e.g. "+62 812-3456-7890". */
  whatsapp: string;
}

/**
 * A scheduled session slot (sesi/jadwal) per PRD F3. Anti-bentrok invariant:
 * when `status === "dipesan"`, `siswaId` MUST be set and no two `dipesan` slots
 * for the same `instrukturId` may overlap in time.
 */
export interface Sesi {
  /** Stable identifier, e.g. "sesi-001". */
  id: string;
  /** Owning instructor — must exist in this module. */
  instrukturId: string;
  /** Branch where the session takes place — must exist in `catalog-data`. */
  branchId: string;
  /** Session date, `YYYY-MM-DD`. */
  date: string;
  /** Start time, `HH:mm` (24h, Asia/Jakarta). */
  startTime: string;
  /** End time, `HH:mm` (24h, Asia/Jakarta). Must be after `startTime`. */
  endTime: string;
  /** Slot lifecycle. */
  status: SesiStatus;
  /** Set when `status === "dipesan"` — references a siswa id in this module. */
  siswaId?: string;
}

/** A payment record (pembayaran) per PRD F4/F5. */
export interface Pembayaran {
  /** Stable identifier, e.g. "pembayaran-001". */
  id: string;
  /** Owning student — must exist in this module. */
  siswaId: string;
  /** Package the payment is for — must exist in `catalog-data`. */
  packageId: string;
  /** Amount in IDR (matches the package's dummy price in catalog-data). */
  amountIdr: number;
  /** How the payment was made. */
  method: PembayaranMethod;
  /** Verification lifecycle. */
  status: PembayaranStatus;
  /** Creation date, `YYYY-MM-DD`. */
  createdAt: string;
  /** Date an admin verified the payment, `YYYY-MM-DD`, if `terverifikasi`. */
  verifiedAt?: string;
  /** Clerk admin user id who verified, if `terverifikasi`. */
  verifiedByAdminId?: string;
}
