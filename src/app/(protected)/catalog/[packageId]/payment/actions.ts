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
 *
 * Auth: gate the auth() call on NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (same
 * pattern as /app/kartu/unduh/route.ts) so local dev / build works without
 * Clerk keys. When Clerk is disabled the action behaves as if the user is
 * signed-out and returns the "silakan masuk" error.
 */

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

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
  let userId: string | null = null;
  let role: string | undefined = undefined;
  if (clerkEnabled) {
    const clerkAuth = await auth();
    userId = clerkAuth.userId;
    role = clerkAuth.sessionClaims?.metadata?.role;
  }
  if (!userId) {
    return { ok: false, error: "Tidak diizinkan: silakan masuk terlebih dahulu." };
  }

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
    // Production-only: the clerk-derived siswa id has no row in the siswa
    // table until the prodmigration epic ships (see siswa-id.ts). bayarQris
    // throws "Unknown siswa id" — surface a clear Indonesian message that
    // tells the user to contact admin instead of leaking the synthetic id.
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Unknown siswa id")) {
      return {
        ok: false,
        error:
          "Akunmu belum terhubung ke data siswa. Hubungi admin untuk mengaktifkan akunmu.",
      };
    }
    return { ok: false, error: msg };
  }

  revalidatePath(`/catalog/${packageId}/payment`);
  revalidatePath("/app");
  revalidatePath("/admin");

  return { ok: true };
}
