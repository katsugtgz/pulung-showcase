"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { bayarQris } from "@/lib/pembayaran-flow";

/*
 * Server actions untuk layar pembayaran QRIS siswa.
 *
 * Demo note: signed-in Clerk user is mapped to seed siswa "siswa-001" — the
 * same convention used in (app)/app/page.tsx. Real user→siswa binding (via
 * Clerk userId) is a later epic; this keeps the demo runnable without it.
 */

const DEMO_SISWA_ID = "siswa-001";

export type BayarActionResult = { ok: true } | { ok: false; error: string };

/**
 * bayarQrisAction — creates a pending QRIS payment for the demo siswa and
 * advances enrollment when applicable.
 */
export async function bayarQrisAction(
  packageId: string,
): Promise<BayarActionResult> {
  // Verifikasi bahwa pemanggil adalah pengguna yang terautentikasi.
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "Tidak diizinkan: silakan masuk terlebih dahulu." };
  }

  if (!packageId || typeof packageId !== "string") {
    return { ok: false, error: "packageId tidak valid." };
  }

  try {
    bayarQris(DEMO_SISWA_ID, packageId, new Date().toISOString());
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
