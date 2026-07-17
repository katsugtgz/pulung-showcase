/**
 * Label dan kelas badge untuk status pendaftaran siswa.
 * Dipisah dari page.tsx agar bisa diimpor oleh komponen server DAN klien.
 */

import type { EnrollmentStatus } from "@/lib/domain";

export const ENROLLMENT_LABEL: Record<EnrollmentStatus, string> = {
  menunggu_bayar: "Menunggu Bayar",
  menunggu_konfirmasi: "Menunggu Konfirmasi",
  terkonfirmasi: "Terkonfirmasi",
  jadwal_dipilih: "Jadwal Dipilih",
  selesai: "Selesai",
};

export const ENROLLMENT_BADGE_CLASS: Record<EnrollmentStatus, string> = {
  menunggu_bayar: "bg-amber-100 text-amber-800",
  menunggu_konfirmasi: "bg-blue-100 text-blue-800",
  terkonfirmasi: "bg-green-100 text-green-800",
  jadwal_dipilih: "bg-primary/10 text-primary",
  selesai: "bg-neutral-100 text-neutral-600",
};
