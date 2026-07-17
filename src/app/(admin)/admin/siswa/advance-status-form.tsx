"use client";

import { useState, useTransition } from "react";
import type { EnrollmentStatus } from "@/lib/domain";
import { advanceEnrollmentStatusAction } from "./actions";
import { ENROLLMENT_LABEL } from "./enrollment-labels";

interface AdvanceStatusFormProps {
  siswaId: string;
  currentStatus: EnrollmentStatus;
  nextStatuses: EnrollmentStatus[];
}

/**
 * Tombol untuk memajukan status pendaftaran siswa ke langkah berikutnya.
 * Hanya menampilkan status yang diizinkan oleh mesin status (nextEnrollmentStatus).
 * Komponen klien karena butuh state interaktif.
 */
export function AdvanceStatusForm({
  siswaId,
  currentStatus,
  nextStatuses,
}: AdvanceStatusFormProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);

  if (nextStatuses.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Status saat ini adalah status akhir. Tidak ada perubahan yang tersedia.
      </p>
    );
  }

  function handleAdvance(to: EnrollmentStatus) {
    startTransition(async () => {
      const res = await advanceEnrollmentStatusAction(siswaId, to);
      setResult(res);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-neutral-600">
        Pilih status berikutnya untuk siswa ini:
      </p>
      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((status) => (
          <button
            key={status}
            type="button"
            disabled={isPending}
            onClick={() => handleAdvance(status)}
            className="rounded-lg border border-primary bg-white px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50"
          >
            {ENROLLMENT_LABEL[status] ?? status}
          </button>
        ))}
      </div>
      {result && !result.ok && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {result.error}
        </p>
      )}
      {result?.ok && (
        <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Status pendaftaran berhasil diperbarui.
        </p>
      )}
      {isPending && (
        <p className="text-sm text-neutral-500">Memproses…</p>
      )}
    </div>
  );
}
