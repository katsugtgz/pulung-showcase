import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import {
  getSesiBySiswa,
  getInstrukturById,
} from "@/lib/domain";
import { getBookableSesi } from "@/lib/jadwal-booking";
import { getBranchById } from "@/lib/catalog-data";
import { formatDate } from "@/lib/format";
import { getMySiswaId } from "@/lib/auth/siswa-id";
import { BookableSlotList, MyBookingList } from "./components";
import type { SesiDisplay } from "./components";

/*
 * Halaman pilih jadwal siswa (Slice 20).
 * Server Component — mengambil data dan meneruskannya ke Client Component.
 *
 * Demo: in development the signed-in user is mapped to seed siswa "siswa-001";
 * in production the siswa id is derived from the Clerk userId.
 *
 * Auth dijaga oleh layout (app) dan proxy.ts — pengguna yang mencapai halaman
 * ini pasti sudah login.
 */

export const metadata: Metadata = {
  title: "Pilih Jadwal — Kursus Mengemudi Pulung",
};

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

/** Kelompokkan sesi per tanggal (ascending, lexicographic on YYYY-MM-DD). */
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
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export default async function JadwalSiswaPage() {
  const { userId } = await auth();
  const siswaId = getMySiswaId(userId);

  const bookable = getBookableSesi().map(toSesiDisplay);
  const groups = groupByDate(bookable);

  const myBookings: SesiDisplay[] = [];
  for (const s of getSesiBySiswa(siswaId)) {
    if (s.status === "dipesan") myBookings.push(toSesiDisplay(s));
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-bold text-neutral-900">Pilih Jadwal</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Pilih slot jadwal yang tersedia untuk sesi mengemudi Anda.
        </p>
      </header>

      {/* Booking aktif */}
      <section aria-labelledby="my-booking-heading">
        <h2
          id="my-booking-heading"
          className="mb-3 text-base font-bold text-neutral-900"
        >
          Jadwal Saya
        </h2>
        <MyBookingList bookings={myBookings} />
      </section>

      {/* Slot tersedia */}
      <section aria-labelledby="available-heading">
        <h2
          id="available-heading"
          className="mb-3 text-base font-bold text-neutral-900"
        >
          Slot Tersedia
        </h2>
        <BookableSlotList groups={groups} />
      </section>
    </div>
  );
}
