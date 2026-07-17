import Link from "next/link";
import type { Metadata } from "next";
import {
  getSesiBySiswa,
  getInstrukturById,
} from "@/lib/domain";
import { getBookableSesi } from "@/lib/jadwal-booking";
import { getBranchById } from "@/lib/catalog-data";
import { formatDate } from "@/lib/format";
import { BookableSlotList, MyBookingList } from "./components";
import type { SesiDisplay } from "./components";

/*
 * Halaman pilih jadwal siswa (Slice 20).
 * Server Component — mengambil data dan meneruskannya ke Client Component.
 *
 * Catatan: siswa ditampilkan berdasarkan DEMO_SISWA_ID = "siswa-001" sebagai
 * representasi demo — konvensi sama dengan app/page.tsx. Pengikatan ke Clerk
 * user id sesungguhnya adalah epik sesudahnya.
 *
 * Auth dijaga oleh layout (app) dan proxy.ts — pengguna yang mencapai halaman
 * ini pasti sudah login.
 */

export const metadata: Metadata = {
  title: "Pilih Jadwal — Kursus Mengemudi Pulung",
};

// Demo mapping: setiap pengguna login diperlakukan sebagai siswa-001.
const DEMO_SISWA_ID = "siswa-001";

function toSesiDisplay(
  s: ReturnType<typeof getBookableSesi>[number],
): SesiDisplay {
  const instruktur = getInstrukturById(s.instrukturId);
  const branch = getBranchById(s.branchId);
  return {
    ...s,
    instrukturName: instruktur.fullName,
    branchName: branch.name,
    dateFormatted: formatDate(s.date),
  };
}

/** Kelompokkan sesi per tanggal (ascending). */
function groupByDate(sesiList: SesiDisplay[]) {
  const map = new Map<
    string,
    { date: string; dateFormatted: string; sesi: SesiDisplay[] }
  >();
  for (const s of sesiList) {
    if (!map.has(s.date)) {
      map.set(s.date, {
        date: s.date,
        dateFormatted: s.dateFormatted,
        sesi: [],
      });
    }
    map.get(s.date)!.sesi.push(s);
  }
  // Urutkan per tanggal ascending
  return [...map.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
}

export default function JadwalSiswaPage() {
  const bookable = getBookableSesi().map(toSesiDisplay);
  const groups = groupByDate(bookable);

  const myBookings: SesiDisplay[] = [];
  for (const s of getSesiBySiswa(DEMO_SISWA_ID)) {
    if (s.status === "dipesan") myBookings.push(toSesiDisplay(s));
  }

  return (
    <main className="mx-auto min-h-dvh max-w-md bg-neutral-50 px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Area Siswa
        </p>
        <h1 className="mt-1 text-2xl font-bold text-neutral-900">
          Pilih Jadwal
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Pilih slot jadwal yang tersedia untuk sesi mengemudi Anda.
        </p>
      </div>

      {/* Booking aktif */}
      <section aria-labelledby="my-booking-heading" className="mb-8">
        <h2
          id="my-booking-heading"
          className="mb-3 text-base font-bold text-neutral-900"
        >
          Jadwal Saya
        </h2>
        <MyBookingList bookings={myBookings} />
      </section>

      {/* Slot tersedia */}
      <section aria-labelledby="available-heading" className="mb-8">
        <h2
          id="available-heading"
          className="mb-3 text-base font-bold text-neutral-900"
        >
          Slot Tersedia
        </h2>
        <BookableSlotList groups={groups} />
      </section>

      <footer className="mt-10 border-t border-neutral-200 pt-6">
        <Link
          href="/app"
          className="text-sm font-medium text-primary hover:text-primary-dark"
        >
          ← Kembali ke dasbor
        </Link>
      </footer>
    </main>
  );
}
