"use client";

import { useTransition } from "react";
import {
  konfirmasiPembayaranAction,
  tolakPembayaranAction,
} from "./pembayaran-actions";

/*
 * Tombol aksi konfirmasi/tolak pembayaran untuk panel admin. Komponen client
 * yang memanggil server actions; halaman induk (/admin) tetap Server Component.
 */

interface PembayaranActionButtonsProps {
  pembayaranId: string;
}

export default function PembayaranActionButtons({
  pembayaranId,
}: PembayaranActionButtonsProps) {
  const [isPendingKonfirmasi, startKonfirmasi] = useTransition();
  const [isPendingTolak, startTolak] = useTransition();

  function handleKonfirmasi() {
    startKonfirmasi(async () => {
      const result = await konfirmasiPembayaranAction(pembayaranId);
      if (!result.ok) {
        // Untuk demo: tampilkan error di console; produksi bisa pakai toast.
        console.error("Gagal konfirmasi:", result.error);
      }
    });
  }

  function handleTolak() {
    startTolak(async () => {
      const result = await tolakPembayaranAction(pembayaranId);
      if (!result.ok) {
        console.error("Gagal menolak:", result.error);
      }
    });
  }

  const busy = isPendingKonfirmasi || isPendingTolak;

  return (
    <div className="mt-3 flex gap-2">
      <button
        type="button"
        onClick={handleKonfirmasi}
        disabled={busy}
        className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
      >
        {isPendingKonfirmasi ? "Memproses..." : "Konfirmasi"}
      </button>
      <button
        type="button"
        onClick={handleTolak}
        disabled={busy}
        className="flex-1 rounded-lg border border-accent px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent hover:text-white disabled:opacity-50"
      >
        {isPendingTolak ? "Memproses..." : "Tolak"}
      </button>
    </div>
  );
}
