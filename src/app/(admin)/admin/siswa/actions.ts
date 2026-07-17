"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  updateSiswa,
  setEnrollmentStatus,
  canTransitionEnrollment,
} from "@/lib/domain";
import type { EnrollmentStatus } from "@/lib/domain";

/*
 * Server actions untuk manajemen siswa oleh admin (Slice 18).
 * Semua aksi dilindungi oleh guard requireAdmin — hanya admin
 * yang boleh mengubah data siswa.
 *
 * Pola: kembalikan { ok: true, ... } atau { ok: false, error: string }
 * sehingga komponen klien bisa menampilkan pesan kesalahan yang sesuai.
 */

export type SiswaActionResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Verifikasi bahwa pemanggil adalah admin. Mengembalikan true jika boleh
 * melanjutkan, false jika tidak.
 */
async function requireAdmin(): Promise<boolean> {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role === "admin";
}

/**
 * Perbarui data dasar siswa: nama lengkap, paket, dan cabang.
 */
export async function updateSiswaAction(
  siswaId: string,
  patch: { fullName?: string; packageId?: string; branchId?: string },
): Promise<SiswaActionResult> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "Tidak diizinkan: hanya admin." };
  }

  if (
    patch.fullName !== undefined &&
    typeof patch.fullName === "string" &&
    patch.fullName.trim().length === 0
  ) {
    return { ok: false, error: "Nama lengkap tidak boleh kosong." };
  }

  try {
    updateSiswa(siswaId, {
      fullName: patch.fullName?.trim(),
      packageId: patch.packageId,
      branchId: patch.branchId,
    });

    revalidatePath("/admin/siswa");
    revalidatePath(`/admin/siswa/${siswaId}`);
    revalidatePath("/admin");

    return { ok: true };
  } catch (err) {
    if (err instanceof TypeError) {
      if (err.message.includes("Unknown package")) {
        return { ok: false, error: "Paket tidak ditemukan." };
      }
      if (err.message.includes("Unknown branch") || err.message.includes("Unknown cabang")) {
        return { ok: false, error: "Cabang tidak ditemukan." };
      }
      if (err.message.includes("Unknown siswa")) {
        return { ok: false, error: "Siswa tidak ditemukan." };
      }
    }
    return {
      ok: false,
      error: `Gagal memperbarui data siswa: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Majukan status pendaftaran siswa satu langkah maju.
 * Hanya status yang diizinkan oleh mesin status yang bisa dipilih.
 */
export async function advanceEnrollmentStatusAction(
  siswaId: string,
  to: EnrollmentStatus,
): Promise<SiswaActionResult> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "Tidak diizinkan: hanya admin." };
  }

  try {
    setEnrollmentStatus(siswaId, to);

    revalidatePath("/admin/siswa");
    revalidatePath(`/admin/siswa/${siswaId}`);
    revalidatePath("/admin");

    return { ok: true };
  } catch (err) {
    if (err instanceof TypeError) {
      if (err.message.includes("Illegal enrollment transition")) {
        return { ok: false, error: "Perubahan status tidak diizinkan." };
      }
      if (err.message.includes("Unknown siswa")) {
        return { ok: false, error: "Siswa tidak ditemukan." };
      }
    }
    return {
      ok: false,
      error: `Gagal memperbarui status: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

// Re-export for use in client-side type checking
export { canTransitionEnrollment };
