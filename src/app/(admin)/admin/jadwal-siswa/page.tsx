import Link from "next/link";
import type { Metadata } from "next";
import { UserMenu } from "@/components/user-menu";
import {
  getSesi,
  getSiswaById,
  getInstrukturById,
} from "@/lib/domain";
import { getBookableSesi } from "@/lib/jadwal-booking";
import { getBranchById } from "@/lib/catalog-data";
import { formatDate } from "@/lib/format";
import { BookedSesiList } from "./components";
import type { BookedSesiDisplay, BookableSesiOption } from "./components";

/*
 * Halaman admin: kelola jadwal siswa (Slice 20).
 * Server Component — mengambil data dan meneruskannya ke Client Component.
 * Auth dijaga oleh layout (admin) dan proxy.ts.
 *
 * Fitur: lihat semua booking aktif, pindahkan ke slot lain, batalkan booking.
 * Anti-bentrok: validasi dilakukan oleh engine jadwal-booking via pindahkanSesi.
 */

export const metadata: Metadata = {
  title: "Jadwal Siswa — Admin Kursus Mengemudi Pulung",
};

export default function JadwalSiswaPage() {
  // Semua sesi yang sedang dipesan — satu pass dengan for...of
  const bookedSesi: BookedSesiDisplay[] = [];
  for (const s of getSesi()) {
    if (s.status !== "dipesan") continue;
    let siswaName = "Siswa tidak dikenal";
    try {
      siswaName = getSiswaById(s.siswaId!).fullName;
    } catch {
      // siswaId tidak ditemukan — tampilkan fallback
    }
    const instruktur = getInstrukturById(s.instrukturId);
    const branch = getBranchById(s.branchId);
    bookedSesi.push({
      id: s.id,
      siswaName,
      instrukturName: instruktur.fullName,
      branchName: branch.name,
      date: s.date,
      dateFormatted: formatDate(s.date),
      startTime: s.startTime,
      endTime: s.endTime,
    });
  }
  bookedSesi.sort((a, b) => a.date.localeCompare(b.date));

  // Slot tersedia sebagai opsi pemindahan
  const bookableOptions: BookableSesiOption[] = getBookableSesi().map((s) => {
    const instruktur = getInstrukturById(s.instrukturId);
    const branch = getBranchById(s.branchId);
    return {
      id: s.id,
      instrukturName: instruktur.fullName,
      branchName: branch.name,
      dateFormatted: formatDate(s.date),
      startTime: s.startTime,
      endTime: s.endTime,
    };
  });

  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl bg-neutral-50 px-4 py-8 lg:max-w-5xl">
      <div className="mb-6 flex items-start justify-between gap-3">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Panel Admin
          </p>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900">
            Jadwal Siswa
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Kelola booking sesi aktif — pindahkan atau batalkan jadwal siswa.
          </p>
        </header>
        <UserMenu />
      </div>

      {/* Ringkasan */}
      <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-neutral-900">
              {bookedSesi.length}
            </p>
            <p className="text-xs text-neutral-500">Sesi Aktif</p>
          </div>
          <div className="h-8 w-px bg-neutral-200" />
          <div className="text-center">
            <p className="text-2xl font-bold text-neutral-900">
              {bookableOptions.length}
            </p>
            <p className="text-xs text-neutral-500">Slot Tersedia</p>
          </div>
        </div>
      </div>

      {/* Daftar booking aktif */}
      <section aria-labelledby="booked-heading" className="mb-8">
        <h2
          id="booked-heading"
          className="mb-3 text-base font-bold text-neutral-900"
        >
          Sesi Aktif ({bookedSesi.length})
        </h2>
        <BookedSesiList sesiList={bookedSesi} bookableOptions={bookableOptions} />
      </section>

      <footer className="mt-10 border-t border-neutral-200 pt-6">
        <Link
          href="/admin"
          className="text-sm font-medium text-primary hover:text-primary-dark"
        >
          ← Kembali ke dasbor
        </Link>
      </footer>
    </main>
  );
}
