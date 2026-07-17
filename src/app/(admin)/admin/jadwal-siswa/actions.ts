"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { pindahkanSesi, batalkanSesi } from "@/lib/jadwal-booking";

/*
 * Server actions untuk manajemen jadwal siswa oleh admin (Slice 20).
 * Guard: requireAdmin — hanya admin yang boleh memanggil.
 * Pola: { ok: true } | { ok: false; error: string }
 */

export type JadwalSiswaActionResult =
  | { ok: true }
  | { ok: false; error: string };

async function requireAdmin(): Promise<boolean> {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role === "admin";
}

function revalidateAll() {
  revalidatePath("/admin/jadwal-siswa");
  revalidatePath("/admin/jadwal-instruktur");
  revalidatePath("/app/jadwal");
  revalidatePath("/admin");
}

/** Petakan pesan domain ke pesan Indonesia untuk UI. */
function mapDomainError(msg: string): string {
  if (msg.includes("tidak sedang dipesan")) {
    return "Sesi ini tidak sedang dipesan — tidak ada booking untuk dipindahkan.";
  }
  if (msg.includes("tidak tersedia")) {
    return "Slot tujuan tidak tersedia (mungkin sudah dipesan orang lain).";
  }
  if (msg.includes("instruktur sudah terisi")) {
    return msg; // sudah Indonesia dari engine
  }
  if (msg.includes("siswa sudah memiliki sesi")) {
    return msg; // sudah Indonesia dari engine
  }
  return "Terjadi kesalahan. Coba lagi.";
}

/**
 * Pindahkan booking dari satu slot ke slot lain.
 * Validasi anti-bentrok dilakukan oleh engine jadwal-booking.
 */
export async function pindahkanSesiAction(
  fromSesiId: string,
  toSesiId: string,
): Promise<JadwalSiswaActionResult> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "Tidak diizinkan: hanya admin." };
  }
  try {
    pindahkanSesi(fromSesiId, toSesiId);
    revalidateAll();
    return { ok: true };
  } catch (err) {
    if (err instanceof TypeError) {
      return { ok: false, error: mapDomainError(err.message) };
    }
    return { ok: false, error: "Gagal memindahkan jadwal. Coba lagi." };
  }
}

/**
 * Batalkan booking sesi — bebaskan slot kembali ke tersedia.
 */
export async function batalkanSesiAdminAction(
  sesiId: string,
): Promise<JadwalSiswaActionResult> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "Tidak diizinkan: hanya admin." };
  }
  try {
    batalkanSesi(sesiId);
    revalidateAll();
    return { ok: true };
  } catch (err) {
    if (err instanceof TypeError) {
      return {
        ok: false,
        error:
          "Gagal membatalkan jadwal — sesi mungkin sudah tidak aktif.",
      };
    }
    return { ok: false, error: "Gagal membatalkan jadwal. Coba lagi." };
  }
}
