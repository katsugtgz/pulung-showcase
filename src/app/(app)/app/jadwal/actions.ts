"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { bookSesi, batalkanSesi } from "@/lib/jadwal-booking";

/*
 * Server actions untuk pemilihan jadwal siswa (Slice 20).
 * Guard: pengguna harus login (userId hadir). Role "siswa" sudah dijaga
 * oleh layout (app) dan proxy.ts — tidak perlu role-check tambahan di sini.
 *
 * Pola: { ok: true } | { ok: false; error: string } — sama dengan seluruh
 * actions di codebase ini.
 *
 * Catatan: DEMO_SISWA_ID dipetakan dari userId yang login. Pada demo ini
 * kita hardcode ke "siswa-001" sebagai representasi demo — sama dengan
 * konvensi di app/page.tsx.
 */

export type JadwalActionResult =
  | { ok: true }
  | { ok: false; error: string };

const DEMO_SISWA_ID = "siswa-001";

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
 * Pesan slot sesi untuk demo siswa (siswa-001).
 * Validasi anti-bentrok dilakukan oleh engine jadwal-booking.
 */
export async function bookSesiAction(
  sesiId: string,
): Promise<JadwalActionResult> {
  const userId = await requireAuth();
  if (!userId) {
    return { ok: false, error: "Anda harus login untuk memilih jadwal." };
  }

  try {
    bookSesi(sesiId, DEMO_SISWA_ID);
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
 * Batalkan booking sesi siswa.
 */
export async function batalkanSesiAction(
  sesiId: string,
): Promise<JadwalActionResult> {
  const userId = await requireAuth();
  if (!userId) {
    return { ok: false, error: "Anda harus login." };
  }

  try {
    batalkanSesi(sesiId);
    revalidatePath("/app/jadwal");
    revalidatePath("/app");
    return { ok: true };
  } catch (err) {
    if (err instanceof TypeError) {
      return {
        ok: false,
        error: "Gagal membatalkan jadwal — sesi mungkin sudah tidak aktif.",
      };
    }
    return { ok: false, error: "Gagal membatalkan jadwal. Coba lagi." };
  }
}
