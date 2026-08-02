"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { bayarQris } from "@/lib/pembayaran-flow";
import { getMySiswaId } from "@/lib/auth/siswa-id";
import { todayYmd } from "@/lib/format";

/*
 * Server actions untuk layar pembayaran QRIS siswa.
 *
 * Demo note: signed-in Clerk user is mapped via getMySiswaId — in dev that
 * resolves to the seed siswa "siswa-001"; in production it is derived from
 * the Clerk userId. A real siswa-table lookup remains a later epic.
 */

export type BayarActionResult = { ok: true } | { ok: false; error: string };

/**
 * bayarQrisAction — creates a pending QRIS payment for the calling siswa and
 * advances enrollment when applicable.
 *
 * Authorization: only siswa-role users (or signed-in users without a role —
 * treating a brand-new Clerk user paying for the first time) may pay. Admins
 * are explicitly rejected so an admin session cannot create siswa payments.
 */
export async function bayarQrisAction(
  packageId: string,
): Promise<BayarActionResult> {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return { ok: false, error: "Tidak diizinkan: silakan masuk terlebih dahulu." };
  }

  const role = sessionClaims?.metadata?.role;
  if (role === "admin") {
    return {
      ok: false,
      error: "Admin tidak dapat melakukan pembayaran siswa.",
    };
  }

  if (!packageId || typeof packageId !== "string") {
    return { ok: false, error: "packageId tidak valid." };
  }

  const siswaId = getMySiswaId(userId);
  try {
    bayarQris(siswaId, packageId, todayYmd());
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  revalidatePath(`/catalog/${packageId}/payment`);
  revalidatePath("/app");
  revalidatePath("/admin");

  return { ok: true };
}
