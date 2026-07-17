/**
 * Internal seeded domain data. NOT part of the public module surface —
 * consumers must use the query functions in `index.ts`. All rows are MOCK data
 * for the demo (no real customer PII); Indonesian names are illustrative.
 *
 * Cross-references to `catalog-data` are by id only (packageId, branchId) and
 * are validated in `__tests__/index.test.ts` to keep the two modules in sync.
 */

import type {
  EnrollmentStatus,
  Instruktur,
  Pembayaran,
  Sesi,
  Siswa,
} from "./types";

export const siswa: readonly Siswa[] = [
  {
    id: "siswa-001",
    fullName: "Rizki Pratama",
    packageId: "paket-manual",
    branchId: "gunung-anyar",
    enrollmentStatus: "terkonfirmasi",
    createdAt: "2026-07-05",
  },
  {
    id: "siswa-002",
    fullName: "Dewi Lestari",
    packageId: "paket-matic",
    branchId: "manyar",
    enrollmentStatus: "jadwal_dipilih",
    createdAt: "2026-07-04",
  },
  {
    id: "siswa-003",
    fullName: "Bayu Nugroho",
    packageId: "paket-kombinasi",
    branchId: "pandugo",
    enrollmentStatus: "menunggu_konfirmasi",
    createdAt: "2026-07-12",
  },
  {
    id: "siswa-004",
    fullName: "Siti Rahmawati",
    packageId: "paket-manual",
    branchId: "pucang",
    enrollmentStatus: "selesai",
    createdAt: "2026-06-20",
  },
  {
    id: "siswa-005",
    fullName: "Andi Wijaya",
    packageId: "paket-matic",
    branchId: "juanda",
    enrollmentStatus: "menunggu_bayar",
    createdAt: "2026-07-15",
  },
] as const;

export const instruktur: readonly Instruktur[] = [
  {
    id: "instruktur-001",
    fullName: "Pak Slamet Riyadi",
    branchId: "gunung-anyar",
    transmissions: ["manual", "matic"],
    whatsapp: "+62 812-1111-2222",
  },
  {
    id: "instruktur-002",
    fullName: "Bu Hartati Wulandari",
    branchId: "manyar",
    transmissions: ["matic"],
    whatsapp: "+62 812-3333-4444",
  },
  {
    id: "instruktur-003",
    fullName: "Pak Joko Susilo",
    branchId: "pandugo",
    transmissions: ["manual", "mixed"],
    whatsapp: "+62 812-5555-6666",
  },
] as const;

export const sesi: readonly Sesi[] = [
  {
    id: "sesi-001",
    instrukturId: "instruktur-001",
    branchId: "gunung-anyar",
    date: "2026-07-20",
    startTime: "09:00",
    endTime: "10:00",
    status: "dipesan",
    siswaId: "siswa-001",
  },
  {
    id: "sesi-002",
    instrukturId: "instruktur-001",
    branchId: "gunung-anyar",
    date: "2026-07-20",
    startTime: "10:30",
    endTime: "11:30",
    status: "tersedia",
  },
  {
    id: "sesi-003",
    instrukturId: "instruktur-002",
    branchId: "manyar",
    date: "2026-07-21",
    startTime: "14:00",
    endTime: "15:00",
    status: "dipesan",
    siswaId: "siswa-002",
  },
  {
    id: "sesi-004",
    instrukturId: "instruktur-003",
    branchId: "pandugo",
    date: "2026-07-22",
    startTime: "08:00",
    endTime: "09:00",
    status: "tersedia",
  },
  {
    id: "sesi-005",
    instrukturId: "instruktur-001",
    branchId: "gunung-anyar",
    date: "2026-07-18",
    startTime: "09:00",
    endTime: "10:00",
    status: "selesai",
    siswaId: "siswa-004",
  },
] as const;

export const pembayaran: readonly Pembayaran[] = [
  {
    id: "pembayaran-001",
    siswaId: "siswa-001",
    packageId: "paket-manual",
    amountIdr: 1_500_000,
    method: "qris",
    status: "terverifikasi",
    createdAt: "2026-07-10",
    verifiedAt: "2026-07-11",
  },
  {
    id: "pembayaran-002",
    siswaId: "siswa-002",
    packageId: "paket-matic",
    amountIdr: 1_750_000,
    method: "qris",
    status: "terverifikasi",
    createdAt: "2026-07-08",
    verifiedAt: "2026-07-09",
  },
  {
    id: "pembayaran-003",
    siswaId: "siswa-003",
    packageId: "paket-kombinasi",
    amountIdr: 2_500_000,
    method: "manual",
    status: "pending",
    createdAt: "2026-07-15",
  },
  {
    id: "pembayaran-004",
    siswaId: "siswa-004",
    packageId: "paket-manual",
    amountIdr: 1_500_000,
    method: "qris",
    status: "terverifikasi",
    createdAt: "2026-07-01",
    verifiedAt: "2026-07-02",
  },
  {
    id: "pembayaran-005",
    siswaId: "siswa-005",
    packageId: "paket-matic",
    amountIdr: 1_750_000,
    method: "qris",
    status: "pending",
    createdAt: "2026-07-16",
  },
] as const;
