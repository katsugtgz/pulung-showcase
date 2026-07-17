"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import type { Role } from "@/types/globals";

/*
 * Server actions untuk manajemen role (custom RBAC via Clerk publicMetadata,
 * BUKAN Organizations). Hanya admin yang boleh memanggil aksi ini — penjagaan
 * dilakukan dengan memeriksa sessionClaims.metadata.role === 'admin'.
 *
 * Clerk 7: clerkClient() sekarang async — harus di-await. Lihat
 * https://clerk.com/docs/guides/secure/basic-rbac
 *
 * Catatan env-gate: tanpa NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, auth() tidak
 * mengembalikan sessionClaims sehingga penjagaan menolak panggilan. Aksi ini
 * tidak boleh dipanggil di build time; verifikasi live dilakukan manusia
 * setelah memasang kunci.
 */

export type RoleActionResult =
  | { ok: true; role: Role | null }
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
 * Tetapkan role untuk seorang user Clerk.
 *
 * @param userId  Id user Clerk target.
 * @param role    Role baru ('admin' | 'siswa').
 */
export async function setRole(
  userId: string,
  role: Role,
): Promise<RoleActionResult> {
  if (typeof userId !== "string" || userId.length === 0) {
    return { ok: false, error: "userId wajib diisi." };
  }
  if (role !== "admin" && role !== "siswa") {
    return { ok: false, error: "role harus 'admin' atau 'siswa'." };
  }
  if (!(await requireAdmin())) {
    return { ok: false, error: "Tidak diizinkan: hanya admin." };
  }

  try {
    const client = await clerkClient();
    const res = await client.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });
    const stored = res.publicMetadata.role;
    return {
      ok: true,
      role: stored === "admin" || stored === "siswa" ? stored : role,
    };
  } catch (err) {
    return {
      ok: false,
      error: `Gagal memperbarui role: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Hapus role dari seorang user Clerk (set publicMetadata.role = null — cara
 * terdokumentasi Clerk untuk menghapus kunci metadata).
 *
 * @param userId  Id user Clerk target.
 */
export async function removeRole(userId: string): Promise<RoleActionResult> {
  if (typeof userId !== "string" || userId.length === 0) {
    return { ok: false, error: "userId wajib diisi." };
  }
  if (!(await requireAdmin())) {
    return { ok: false, error: "Tidak diizinkan: hanya admin." };
  }

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: null },
    });
    return { ok: true, role: null };
  } catch (err) {
    return {
      ok: false,
      error: `Gagal menghapus role: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
