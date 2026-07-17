/**
 * pembayaran-flow — pure orchestration layer over the domain API.
 *
 * Encapsulates the QRIS-payment state machine so that transitions are
 * unit-testable without UI or server context. All side effects (store
 * mutations) happen via the domain module's public API; raw store access
 * is intentionally avoided here.
 */

import {
  addPembayaran,
  verifikasiPembayaran,
  tolakPembayaran,
  setEnrollmentStatus,
  canTransitionEnrollment,
  getSiswaById,
} from "@/lib/domain";
import { getPackageById } from "@/lib/catalog-data";

/**
 * bayarQris — creates a pending QRIS payment record and advances the siswa's
 * enrollment state from menunggu_bayar → menunggu_konfirmasi when that
 * transition is legal. If the transition is not legal (e.g. the siswa is
 * already past that step — a retry scenario), the enrollment is left
 * unchanged and only a new payment record is created.
 *
 * @throws TypeError — if siswaId or packageId are unknown.
 */
export function bayarQris(
  siswaId: string,
  packageId: string,
  createdAt: string,
): { pembayaranId: string } {
  const pkg = getPackageById(packageId); // throws TypeError if unknown
  const p = addPembayaran({
    siswaId,
    packageId,
    amountIdr: pkg.priceIdr,
    method: "qris",
    createdAt,
  });

  // Advance enrollment only when the transition is legal (first payment).
  // On a retry (siswa already at menunggu_konfirmasi or later), this is a no-op.
  const siswa = getSiswaById(siswaId);
  if (canTransitionEnrollment(siswa.enrollmentStatus, "menunggu_konfirmasi")) {
    setEnrollmentStatus(siswaId, "menunggu_konfirmasi");
  }

  return { pembayaranId: p.id };
}

/**
 * konfirmasiPembayaran — marks a pending payment as terverifikasi and advances
 * the siswa's enrollment from menunggu_konfirmasi → terkonfirmasi when that
 * transition is legal.
 *
 * @throws TypeError — if pembayaranId is unknown, or the payment is not "pending".
 */
export function konfirmasiPembayaran(
  pembayaranId: string,
  adminId: string,
  verifiedAt: string,
): void {
  // verifikasiPembayaran throws if not pending — let it propagate.
  const p = verifikasiPembayaran(pembayaranId, adminId, verifiedAt);
  const siswa = getSiswaById(p.siswaId);
  if (canTransitionEnrollment(siswa.enrollmentStatus, "terkonfirmasi")) {
    setEnrollmentStatus(p.siswaId, "terkonfirmasi");
  }
}

/**
 * tolakPembayaranFlow — rejects a pending payment. The siswa's enrollment
 * status is intentionally left unchanged; the siswa retries by paying again,
 * which produces a NEW pending record (see bayarQris).
 *
 * @throws TypeError — if pembayaranId is unknown, or the payment is not "pending".
 */
export function tolakPembayaranFlow(
  pembayaranId: string,
  adminId: string,
  verifiedAt: string,
): void {
  tolakPembayaran(pembayaranId, adminId, verifiedAt);
}
