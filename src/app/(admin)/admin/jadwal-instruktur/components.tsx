"use client";

import { useState, useTransition, type FormEvent } from "react";
import type { Instruktur, Sesi, SesiStatus } from "@/lib/domain";
import { getBranchById } from "@/lib/catalog-data";
import {
  tambahSesiAction,
  updateSesiAction,
  removeSesiAction,
} from "./actions";
import { SESI_STATUS_LABEL, SESI_STATUS_BADGE } from "./labels";

/* -----------------------------------------------------------------------
 * TambahSesiForm — form tambah slot sesi baru
 * --------------------------------------------------------------------- */

interface TambahSesiFormProps {
  instrukturList: Instruktur[];
}

export function TambahSesiForm({ instrukturList }: TambahSesiFormProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<
    { ok: true } | { ok: false; error: string } | null
  >(null);
  const [selectedId, setSelectedId] = useState<string>("");

  const selectedInstruktur = instrukturList.find((i) => i.id === selectedId);
  const branchName = selectedInstruktur
    ? getBranchById(selectedInstruktur.branchId).name
    : null;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    startTransition(async () => {
      const r = await tambahSesiAction({
        instrukturId: fd.get("instrukturId") as string,
        branchId: fd.get("branchId") as string,
        date: fd.get("date") as string,
        startTime: fd.get("startTime") as string,
        endTime: fd.get("endTime") as string,
      });
      setResult(r);
      if (r.ok) {
        form.reset();
        setSelectedId("");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Instruktur select */}
      <div>
        <label
          htmlFor="instrukturId"
          className="mb-1 block text-xs font-semibold text-neutral-700"
        >
          Instruktur
        </label>
        <select
          id="instrukturId"
          name="instrukturId"
          required
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">— Pilih instruktur —</option>
          {instrukturList.map((i) => (
            <option key={i.id} value={i.id}>
              {i.fullName}
            </option>
          ))}
        </select>
        {branchName ? (
          <p className="mt-1 text-[11px] text-neutral-400">
            Cabang: {branchName}
          </p>
        ) : null}
      </div>

      {/* branchId tersembunyi — diisi otomatis dari instruktur yang dipilih */}
      <input
        type="hidden"
        name="branchId"
        value={selectedInstruktur?.branchId ?? ""}
      />

      {/* Tanggal */}
      <div>
        <label
          htmlFor="date"
          className="mb-1 block text-xs font-semibold text-neutral-700"
        >
          Tanggal
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Waktu mulai & selesai */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="startTime"
            className="mb-1 block text-xs font-semibold text-neutral-700"
          >
            Mulai
          </label>
          <input
            id="startTime"
            name="startTime"
            type="time"
            required
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label
            htmlFor="endTime"
            className="mb-1 block text-xs font-semibold text-neutral-700"
          >
            Selesai
          </label>
          <input
            id="endTime"
            name="endTime"
            type="time"
            required
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Feedback */}
      {result !== null && !result.ok ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600"
        >
          {result.error}
        </p>
      ) : null}
      {result !== null && result.ok ? (
        <p
          role="status"
          className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700"
        >
          Sesi berhasil ditambahkan.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending || !selectedId}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isPending ? "Menyimpan…" : "Tambah Sesi"}
      </button>
    </form>
  );
}

/* -----------------------------------------------------------------------
 * SesiCard — satu baris slot sesi dengan kemampuan edit & hapus
 * --------------------------------------------------------------------- */

/** Sesi dengan field tambahan yang sudah diformat oleh Server Component. */
export interface SesiFormatted extends Sesi {
  branchName: string;
  dateFormatted: string;
}

interface SesiCardProps {
  sesi: SesiFormatted;
}

function SesiCard({ sesi }: SesiCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isDipesan = sesi.status === "dipesan";

  function handleRemove() {
    setError(null);
    startTransition(async () => {
      const r = await removeSesiAction(sesi.id);
      if (!r.ok) setError(r.error);
    });
  }

  function handleEditSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const patch = {
      date: fd.get("date") as string,
      startTime: fd.get("startTime") as string,
      endTime: fd.get("endTime") as string,
      status: fd.get("status") as SesiStatus,
    };
    startTransition(async () => {
      const r = await updateSesiAction(sesi.id, patch);
      if (r.ok) {
        setIsEditing(false);
        setError(null);
      } else {
        setError(r.error);
      }
    });
  }

  return (
    <li className="rounded-xl border border-neutral-200 bg-white p-4">
      {isEditing ? (
        /* ── Mode edit ── */
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-neutral-700">Ubah Sesi</p>

          <div>
            <label
              htmlFor={`date-${sesi.id}`}
              className="mb-1 block text-xs font-semibold text-neutral-700"
            >
              Tanggal
            </label>
            <input
              id={`date-${sesi.id}`}
              name="date"
              type="date"
              defaultValue={sesi.date}
              required
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor={`startTime-${sesi.id}`}
                className="mb-1 block text-xs font-semibold text-neutral-700"
              >
                Mulai
              </label>
              <input
                id={`startTime-${sesi.id}`}
                name="startTime"
                type="time"
                defaultValue={sesi.startTime}
                required
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label
                htmlFor={`endTime-${sesi.id}`}
                className="mb-1 block text-xs font-semibold text-neutral-700"
              >
                Selesai
              </label>
              <input
                id={`endTime-${sesi.id}`}
                name="endTime"
                type="time"
                defaultValue={sesi.endTime}
                required
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor={`status-${sesi.id}`}
              className="mb-1 block text-xs font-semibold text-neutral-700"
            >
              Status
            </label>
            <select
              id={`status-${sesi.id}`}
              name="status"
              defaultValue={sesi.status}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {(Object.keys(SESI_STATUS_LABEL) as SesiStatus[]).map((val) => (
                <option key={val} value={val}>
                  {SESI_STATUS_LABEL[val]}
                </option>
              ))}
            </select>
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600"
            >
              {error}
            </p>
          ) : null}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isPending ? "Menyimpan…" : "Simpan"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setError(null);
              }}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Batal
            </button>
          </div>
        </form>
      ) : (
        /* ── Mode tampil ── */
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-neutral-900">
                {sesi.dateFormatted}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                {sesi.startTime} – {sesi.endTime} · {sesi.branchName}
              </p>
            </div>
            <span
              className={`flex-shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${SESI_STATUS_BADGE[sesi.status]}`}
            >
              {SESI_STATUS_LABEL[sesi.status]}
            </span>
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Ubah
            </button>
            {isDipesan ? (
              <button
                type="button"
                disabled
                title="Sesi sudah dipesan siswa — pindahkan dulu jadwalnya"
                aria-label="Hapus sesi (tidak tersedia — sesi sudah dipesan)"
                className="cursor-not-allowed rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-300"
              >
                Hapus
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isPending}
                className="rounded-lg bg-[#D22B3A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? "Menghapus…" : "Hapus"}
              </button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

/* -----------------------------------------------------------------------
 * SesiList — daftar slot sesi satu instruktur
 * --------------------------------------------------------------------- */

interface SesiListProps {
  sesi: SesiFormatted[];
}

export function SesiList({ sesi }: SesiListProps) {
  if (sesi.length === 0) {
    return (
      <p className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500">
        Belum ada sesi untuk instruktur ini.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {sesi.map((s) => (
        <SesiCard key={s.id} sesi={s} />
      ))}
    </ul>
  );
}
