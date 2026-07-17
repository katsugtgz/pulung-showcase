"use client";

import { useState, useTransition } from "react";
import { pindahkanSesiAction, batalkanSesiAdminAction } from "./actions";

/*
 * Komponen klien untuk halaman kelola jadwal siswa (admin, Slice 20).
 * Server Component meneruskan data yang sudah diformat ke sini.
 */

// ---------------------------------------------------------------------------
// Tipe shared (diekspor agar page.tsx bisa membentuk prop yang sesuai)
// ---------------------------------------------------------------------------

export interface BookedSesiDisplay {
  id: string;
  siswaName: string;
  instrukturName: string;
  branchName: string;
  date: string;
  dateFormatted: string;
  startTime: string;
  endTime: string;
}

export interface BookableSesiOption {
  id: string;
  instrukturName: string;
  branchName: string;
  dateFormatted: string;
  startTime: string;
  endTime: string;
}

// ---------------------------------------------------------------------------
// BookedSesiCard
// ---------------------------------------------------------------------------

interface BookedSesiCardProps {
  sesi: BookedSesiDisplay;
  bookableOptions: BookableSesiOption[];
}

function BookedSesiCard({ sesi, bookableOptions }: BookedSesiCardProps) {
  const [isReassigning, setIsReassigning] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleBatalkan() {
    setError(null);
    startTransition(async () => {
      const r = await batalkanSesiAdminAction(sesi.id);
      if (!r.ok) setError(r.error);
    });
  }

  function handlePindahkan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedTarget) return;
    setError(null);
    startTransition(async () => {
      const r = await pindahkanSesiAction(sesi.id, selectedTarget);
      if (r.ok) {
        setIsReassigning(false);
        setSelectedTarget("");
      } else {
        setError(r.error);
      }
    });
  }

  return (
    <li className="rounded-xl border border-neutral-200 bg-white p-4">
      {/* Info booking */}
      <div className="mb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-neutral-900">
              {sesi.siswaName}
            </p>
            <p className="mt-0.5 text-xs text-neutral-500">
              {sesi.dateFormatted} · {sesi.startTime}–{sesi.endTime} WIB
            </p>
            <p className="mt-0.5 text-xs text-neutral-400">
              {sesi.instrukturName} · {sesi.branchName}
            </p>
          </div>
          <span className="flex-shrink-0 rounded-md bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
            Dipesan
          </span>
        </div>
      </div>

      {/* Error feedback */}
      {error ? (
        <p
          role="alert"
          className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600"
        >
          {error}
        </p>
      ) : null}

      {/* Aksi */}
      {isReassigning ? (
        <form onSubmit={handlePindahkan} className="flex flex-col gap-3">
          <div>
            <label
              htmlFor={`target-${sesi.id}`}
              className="mb-1 block text-xs font-semibold text-neutral-700"
            >
              Pilih slot tujuan
            </label>
            <select
              id={`target-${sesi.id}`}
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              required
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">— Pilih slot —</option>
              {bookableOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.dateFormatted} · {opt.startTime}–{opt.endTime} ·{" "}
                  {opt.instrukturName}
                </option>
              ))}
            </select>
            {bookableOptions.length === 0 ? (
              <p className="mt-1 text-[11px] text-neutral-400">
                Tidak ada slot tersedia saat ini.
              </p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending || !selectedTarget}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              {isPending ? "Memindahkan…" : "Pindahkan"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsReassigning(false);
                setSelectedTarget("");
                setError(null);
              }}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Batal
            </button>
          </div>
        </form>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsReassigning(true)}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            Pindahkan
          </button>
          <button
            type="button"
            onClick={handleBatalkan}
            disabled={isPending}
            className="rounded-lg bg-[#D22B3A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? "Membatalkan…" : "Batalkan"}
          </button>
        </div>
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------
// BookedSesiList
// ---------------------------------------------------------------------------

interface BookedSesiListProps {
  sesiList: BookedSesiDisplay[];
  bookableOptions: BookableSesiOption[];
}

export function BookedSesiList({
  sesiList,
  bookableOptions,
}: BookedSesiListProps) {
  if (sesiList.length === 0) {
    return (
      <p className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500">
        Belum ada sesi yang sedang dipesan siswa.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {sesiList.map((s) => (
        <BookedSesiCard key={s.id} sesi={s} bookableOptions={bookableOptions} />
      ))}
    </ul>
  );
}
