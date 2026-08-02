"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { bookSesi, batalkanSesi } from "@/lib/jadwal-booking";
import { getMySiswaId } from "@/lib/auth/siswa-id";

/*
 * Server actions untuk pemilihan jadwal siswa (Slice 20).
 * Guard: pengguna harus login (userId hadir). Role "siswa" sudah dijaga
 * oleh layout (app) dan proxy.ts — tidak perlu role-check tambahan di sini.
 *
 * Pola: { ok: true } | { ok: false; error: string } — sama dengan seluruh
 * actions di codebase ini.
 *
 * Demo: in development the signed-in user is mapped to seed siswa "siswa-001";
 * in production the siswa id is derived from the Clerk userId.
 */

export type JadwalActionResult =
  | { ok: true }
  | { ok: false; error: string };

async function requireAuth(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/** Petakan pesan domain (English dev) ke pesan Indonesia untuk UI. */
function mapBentrokMessage(msg: string): string {
  if (msg.includes("tidak tersedia")) {
    return "Jadwal ini tidak lagi tersedia — mungkin sudah dipesan orang lain.";
  }
  if (msg.includes("instruktur sudah terisi")) {
    return msg; // sudah dalam bahasa Indonesia dari engine
  }
  if (msg.includes("Anda sudah memiliki sesi")) {
    return msg; // sudah dalam bahasa Indonesia dari engine
  }
  return `Jadwal bentrok: ${msg}`;
}

/**
 * Pesan slot sesi untuk siswa yang sedang login.
 * Validasi anti-bentrok dilakukan oleh engine jadwal-booking.
 */
export async function bookSesiAction(
  sesiId: string,
): Promise<JadwalActionResult> {
  const userId = await requireAuth();
  if (!userId) {
    return { ok: false, error: "Anda harus login untuk memilih jadwal." };
  }

  const siswaId = getMySiswaId(userId);
  try {
    bookSesi(sesiId, siswaId);
    revalidatePath("/app/jadwal");
    revalidatePath("/app");
    return { ok: true };
  } catch (err) {
    if (err instanceof TypeError) {
      return { ok: false, error: mapBentrokMessage(err.message) };
    }
    return { ok: false, error: "Gagal memesan jadwal. Coba lagi." };
  }
}

/**
 * Batalkan booking sesi siswa yang sedang login. Engine jadwal-booking
 * memverifikasi kepemilikan (sesi.siswaId === siswaId) sebelum membebaskan.
 */
export async function batalkanSesiAction(
  sesiId: string,
): Promise<JadwalActionResult> {
  const userId = await requireAuth();
  if (!userId) {
    return { ok: false, error: "Anda harus login." };
  }

  const siswaId = getMySiswaId(userId);
  try {
    batalkanSesi(sesiId, siswaId);
    revalidatePath("/app/jadwal");
    revalidatePath("/app");
    return { ok: true };
  } catch (err) {
    if (err instanceof TypeError) {
      return {
        ok: false,
        error: err.message.includes("bukan milik Anda")
          ? err.message
          : "Gagal membatalkan jadwal — sesi mungkin sudah tidak aktif.",
      };
    }
    return { ok: false, error: "Gagal membatalkan jadwal. Coba lagi." };
  }
}
