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
