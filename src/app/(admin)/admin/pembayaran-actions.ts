"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  konfirmasiPembayaran,
  tolakPembayaranFlow,
} from "@/lib/pembayaran-flow";
import { getPembayaranById } from "@/lib/domain";
import { todayYmd } from "@/lib/format";

/*
 * Server actions untuk konfirmasi / penolakan pembayaran di panel admin.
 *
 * Penjagaan requireAdmin direplikasi dari ./actions.ts — file itu tidak
 * diubah agar tidak mengganggu pekerjaan agen lain yang berjalan paralel.
 */

export type PembayaranActionResult =
  | { ok: true }
  | { ok: false; error: string };

/** Verifikasi bahwa pemanggil adalah admin. */
async function requireAdmin(): Promise<boolean> {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role === "admin";
}

/**
 * konfirmasiPembayaranAction — memverifikasi pembayaran pending dan
 * memajukan enrollment siswa ke terkonfirmasi.
 */
export async function konfirmasiPembayaranAction(
  pembayaranId: string,
): Promise<PembayaranActionResult> {
  if (!pembayaranId || typeof pembayaranId !== "string") {
    return { ok: false, error: "pembayaranId tidak valid." };
  }
  if (!(await requireAdmin())) {
    return { ok: false, error: "Tidak diizinkan: hanya admin." };
  }

  // Ambil packageId sebelum memanggil flow agar revalidate bisa menargetkan
  // halaman bayar siswa yang sesuai.
  let packageId: string;
  try {
    const p = getPembayaranById(pembayaranId);
    packageId = p.packageId;
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  const { sessionClaims } = await auth();
  const adminId = sessionClaims?.sub ?? "admin";

  try {
    konfirmasiPembayaran(pembayaranId, adminId, todayYmd());
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  revalidatePath("/admin");
  revalidatePath("/app");
  revalidatePath(`/catalog/${packageId}/payment`);

  return { ok: true };
}

/**
 * tolakPembayaranAction — menolak pembayaran pending. Enrollment siswa tidak
 * diubah; siswa dapat mencoba kembali dengan membuat pembayaran baru.
 */
export async function tolakPembayaranAction(
  pembayaranId: string,
): Promise<PembayaranActionResult> {
  if (!pembayaranId || typeof pembayaranId !== "string") {
    return { ok: false, error: "pembayaranId tidak valid." };
  }
  if (!(await requireAdmin())) {
    return { ok: false, error: "Tidak diizinkan: hanya admin." };
  }

  let packageId: string;
  try {
    const p = getPembayaranById(pembayaranId);
    packageId = p.packageId;
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  const { sessionClaims } = await auth();
  const adminId = sessionClaims?.sub ?? "admin";

  try {
    tolakPembayaranFlow(pembayaranId, adminId, todayYmd());
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  revalidatePath("/admin");
  revalidatePath("/app");
  revalidatePath(`/catalog/${packageId}/payment`);

  return { ok: true };
}
