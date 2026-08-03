"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  addSesi,
  updateSesi,
  removeSesi,
  getSesiById,
  getSesiByInstruktur,
  getSesiBySiswa,
} from "@/lib/domain";
import { timeRangesOverlap } from "@/lib/jadwal-booking";
import type { AddSesiInput, Sesi, SesiStatus } from "@/lib/domain";

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
export function mapDomainError(msg: string): string {
  // Pass-through bentrok messages produced by jadwal-booking and the
  // reschedule guard (C4): they are already user-facing Indonesian.
  if (msg.includes("Jadwal bentrok:")) {
    return msg;
  }
  // Missing-owner invariant from updateSesi: distinguish from the generic
  // "dipesan" branch below so admins promoting tersedia → dipesan without
  // an assigned siswa get the correct recovery hint.
  if (msg.includes("harus memiliki siswaId")) {
    return "Sesi berstatus dipesan harus memiliki siswa. Tetapkan siswa terlebih dahulu.";
  }
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
  if (msg.includes("Unknown branch")) {
    return "Cabang tidak ditemukan.";
  }
  if (msg.includes("Unknown package")) {
    return "Paket tidak ditemukan.";
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

/**
 * Reschedule conflict check for a `dipesan` sesi (C4). cekBentrok assumes a
 * fresh booking on a `tersedia` slot; here the slot is already booked and we
 * are mutating its date/time, so we mirror cekBentrok's overlap logic against
 * the *proposed* values while excluding the sesi itself from candidates.
 *
 * @throws TypeError on conflict with the instruktur's or siswa's other dipesan
 *   sessions for the proposed date.
 */
function assertRescheduleNoBentrok(
  sesi: Sesi,
  proposedDate: string,
  proposedStart: string,
  proposedEnd: string,
): void {
  for (const other of getSesiByInstruktur(sesi.instrukturId)) {
    if (
      other.id !== sesi.id &&
      other.status === "dipesan" &&
      other.date === proposedDate &&
      timeRangesOverlap(proposedStart, proposedEnd, other.startTime, other.endTime)
    ) {
      throw new TypeError(
        `Jadwal bentrok: instruktur sudah terisi di jam ${other.startTime}–${other.endTime}.`,
      );
    }
  }
  if (sesi.siswaId) {
    for (const other of getSesiBySiswa(sesi.siswaId)) {
      if (
        other.id !== sesi.id &&
        other.status === "dipesan" &&
        other.date === proposedDate &&
        timeRangesOverlap(proposedStart, proposedEnd, other.startTime, other.endTime)
      ) {
        throw new TypeError(
          `Jadwal bentrok: siswa sudah memiliki sesi di jam ${other.startTime}–${other.endTime} pada tanggal yang sama.`,
        );
      }
    }
  }
}

export async function updateSesiAction(
  id: string,
  patch: UpdateSesiInput,
): Promise<SesiActionResult> {
  if (!(await requireAdmin())) {
    return { ok: false, error: "Tidak diizinkan: hanya admin." };
  }
  try {
    // C4: a booked sesi may not be silently moved onto a conflicting slot.
    // The guard must evaluate the *resulting* status (patch ?? existing) so
    // an admin cannot bypass the overlap scan by changing time together with
    // status — e.g. promoting tersedia → dipesan, or moving a dipesan slot
    // while flipping it back to tersedia (the latter has no overlap concern,
    // the former must be conflict-checked).
    const existing = getSesiById(id);
    const resultingStatus = patch.status ?? existing.status;
    const timeChanged =
      patch.date !== undefined ||
      patch.startTime !== undefined ||
      patch.endTime !== undefined;
    if (timeChanged && resultingStatus === "dipesan") {
      const proposedDate = patch.date ?? existing.date;
      const proposedStart = patch.startTime ?? existing.startTime;
      const proposedEnd = patch.endTime ?? existing.endTime;
      if (proposedStart < proposedEnd) {
        assertRescheduleNoBentrok(
          existing,
          proposedDate,
          proposedStart,
          proposedEnd,
        );
      }
    }

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
