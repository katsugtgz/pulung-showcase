"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { addSesi, updateSesi, removeSesi } from "@/lib/domain";
import type { AddSesiInput, SesiStatus } from "@/lib/domain";

/*
 * Server actions untuk kelola jadwal instruktur (Slice 19).
 * Dijaga oleh requireAdmin — hanya admin yang boleh memanggil.
 * Mengembalikan { ok: true } atau { ok: false; error: <pesan Indonesia> }.
 */

export type SesiActionResult = { ok: true } | { ok: false; error: string };

/** Verifikasi pemanggil adalah admin — sama persis dengan guards di admin/actions.ts */
async function requireAdmin(): Promise<boolean> {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role === "admin";
}

/** Petakan pesan domain (English dev) ke pesan Indonesia untuk UI. */
function mapDomainError(msg: string): string {
  if (msg.includes("dipesan")) {
    return "Sesi sudah dipesan siswa — pindahkan dulu jadwalnya.";
  }
  if (msg.includes("startTime must be before endTime")) {
    return "Waktu mulai harus sebelum waktu selesai.";
  }
  if (
    msg.includes("Invalid date") ||
    msg.includes("Invalid startTime") ||
    msg.includes("Invalid endTime")
  ) {
    return "Format tanggal/waktu tidak valid.";
  }
  if (msg.includes("Unknown instruktur")) {
    return "Instruktur tidak ditemukan.";
  }
  if (msg.includes("Unknown branch") || msg.includes("Unknown package")) {
    return "Cabang tidak ditemukan.";
  }
  return "Terjadi kesalahan. Coba lagi.";
}

/** Buat slot sesi baru. Branch diambil dari instruktur yang dipilih. */
export async function tambahSesiAction(
  input: AddSesiInput,
): Promise<SesiActionResult> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "Tidak diizinkan: hanya admin." };
  }
  try {
    addSesi(input);
    revalidatePath("/admin/jadwal-instruktur");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    if (err instanceof TypeError) {
      return { ok: false, error: mapDomainError(err.message) };
    }
    return { ok: false, error: "Gagal menambah sesi. Coba lagi." };
  }
}

/** Patch mutable fields pada sesi yang ada (tanggal, waktu, status). */
export interface UpdateSesiInput {
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: SesiStatus;
}

export async function updateSesiAction(
  id: string,
  patch: UpdateSesiInput,
): Promise<SesiActionResult> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "Tidak diizinkan: hanya admin." };
  }
  try {
    updateSesi(id, patch);
    revalidatePath("/admin/jadwal-instruktur");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    if (err instanceof TypeError) {
      return { ok: false, error: mapDomainError(err.message) };
    }
    return { ok: false, error: "Gagal mengubah sesi. Coba lagi." };
  }
}

/**
 * Hapus slot sesi. Melempar Indonesian error jika status "dipesan" —
 * sesuai domain removeSesi yang melempar TypeError untuk slot terbooking.
 */
export async function removeSesiAction(
  id: string,
): Promise<SesiActionResult> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "Tidak diizinkan: hanya admin." };
  }
  try {
    removeSesi(id);
    revalidatePath("/admin/jadwal-instruktur");
    revalidatePath("/admin");
    return { ok: true };
  } catch (err) {
    if (err instanceof TypeError) {
      return { ok: false, error: mapDomainError(err.message) };
    }
    return { ok: false, error: "Gagal menghapus sesi. Coba lagi." };
  }
}
