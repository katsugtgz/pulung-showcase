"use client";

import { useState, useTransition } from "react";
import type { Sesi, Instruktur } from "@/lib/domain";
import { bookSesiAction, batalkanSesiAction } from "./actions";

/*
 * Komponen klien untuk halaman pilih jadwal siswa (Slice 20).
 * Menerima data yang sudah diformat oleh Server Component.
 */

// ---------------------------------------------------------------------------
// Tipe shared
// ---------------------------------------------------------------------------

export interface SesiDisplay extends Sesi {
  instrukturName: string;
  branchName: string;
  dateFormatted: string;
}

// ---------------------------------------------------------------------------
// BookableSlotList — daftar slot yang bisa dipesan
// ---------------------------------------------------------------------------

interface BookableSlotListProps {
  /** Slot yang tersedia, sudah dikelompokkan per tanggal oleh server. */
  groups: { date: string; dateFormatted: string; sesi: SesiDisplay[] }[];
}

export function BookableSlotList({ groups }: BookableSlotListProps) {
  const [pending, setPending] = useState<string | null>(null); // sesiId sedang diproses
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <p className="text-sm text-neutral-500">
          Belum ada slot tersedia. Cek lagi nanti ya, atau hubungi admin lewat
          WhatsApp kalau kamu perlu jadwal segera.
        </p>
      </div>
    );
  }

  function handleBook(sesiId: string) {
    setError(null);
    setPending(sesiId);
    startTransition(async () => {
      const r = await bookSesiAction(sesiId);
      setPending(null);
      if (!r.ok) setError(r.error);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600"
        >
          {error}
        </p>
      ) : null}

      {groups.map((group) => (
        <section
          key={group.date}
          aria-labelledby={`date-${group.date}-heading`}
        >
          <h3
            id={`date-${group.date}-heading`}
            className="mb-2 text-sm font-bold text-neutral-700"
          >
            {group.dateFormatted}
          </h3>
          <ul className="flex flex-col gap-2">
            {group.sesi.map((s) => (
              <li
                key={s.id}
                className="rounded-xl border border-neutral-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {s.startTime}–{s.endTime} WIB
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {s.instrukturName} · {s.branchName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleBook(s.id)}
                    disabled={pending !== null}
                    className="flex-shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    {pending === s.id ? "Memesan…" : "Pesan"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MyBookingList — booking aktif siswa dengan opsi batalkan
// ---------------------------------------------------------------------------

interface MyBookingListProps {
  bookings: SesiDisplay[];
}

export function MyBookingList({ bookings }: MyBookingListProps) {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (bookings.length === 0) {
    return (
      <p className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500">
        Belum ada jadwal yang dipesan. Pilih slot di bawah untuk mulai.
      </p>
    );
  }

  function handleBatalkan(sesiId: string) {
    setError(null);
    setPending(sesiId);
    startTransition(async () => {
      const r = await batalkanSesiAction(sesiId);
      setPending(null);
      if (!r.ok) setError(r.error);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600"
        >
          {error}
        </p>
      ) : null}

      <ul className="flex flex-col gap-2">
        {bookings.map((s) => (
          <li
            key={s.id}
            className="rounded-xl border border-neutral-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  {s.dateFormatted}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {s.startTime}–{s.endTime} WIB · {s.instrukturName} ·{" "}
                  {s.branchName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleBatalkan(s.id)}
                disabled={pending !== null}
                className="flex-shrink-0 rounded-lg bg-[#D22B3A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {pending === s.id ? "Membatalkan…" : "Batalkan"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
