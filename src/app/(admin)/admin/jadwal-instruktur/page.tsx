import type { Metadata } from "next";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getInstruktur, getSesiByInstruktur } from "@/lib/domain";
import { getBranchById } from "@/lib/catalog-data";
import { formatDate } from "@/lib/format";
import { TambahSesiForm, SesiList } from "./components";

/*
 * Halaman admin: kelola jadwal instruktur (Slice 19).
 * Server Component — mengambil data dan meneruskannya ke Client Component.
 * Auth dijaga oleh layout (admin) dan proxy.ts.
 *
 * Fitur: tambah slot, ubah slot (tanggal/waktu/status), hapus slot.
 * Anti-bentrok: di luar scope slice ini (issue #21).
 */

export const metadata: Metadata = {
  title: "Jadwal Instruktur — Admin Kursus Mengemudi Pulung",
};

export default function JadwalInstrukturPage() {
  const instrukturList = getInstruktur();

  const groups = instrukturList.map((instruktur) => {
    const branch = getBranchById(instruktur.branchId);
    const sesi = getSesiByInstruktur(instruktur.id).map((s) => ({
      ...s,
      branchName: getBranchById(s.branchId).name,
      dateFormatted: formatDate(s.date),
    }));
    return { instruktur, branch, sesi };
  });

  return (
    <main className="mx-auto min-h-dvh max-w-2xl bg-neutral-50 px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-3">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Panel Admin
          </p>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900">
            Jadwal Instruktur
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Kelola slot ketersediaan instruktur — tambah, ubah, atau hapus sesi.
          </p>
        </header>
        <UserButton />
      </div>

      {/* Tambah slot baru */}
      <section aria-labelledby="tambah-heading" className="mb-8">
        <h2
          id="tambah-heading"
          className="mb-3 text-base font-bold text-neutral-900"
        >
          Tambah Sesi Baru
        </h2>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <TambahSesiForm instrukturList={instrukturList} />
        </div>
      </section>

      {/* Daftar sesi per instruktur */}
      {groups.map(({ instruktur, branch, sesi }) => (
        <section
          key={instruktur.id}
          aria-labelledby={`instruktur-${instruktur.id}-heading`}
          className="mb-6"
        >
          <h2
            id={`instruktur-${instruktur.id}-heading`}
            className="mb-3 text-base font-bold text-neutral-900"
          >
            {instruktur.fullName}
            <span className="ml-2 text-sm font-normal text-neutral-500">
              · {branch.name}
            </span>
          </h2>
          <SesiList sesi={sesi} />
        </section>
      ))}

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
