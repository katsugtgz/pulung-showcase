"use client";

import { useState, useTransition } from "react";

/*
 * Tombol pembayaran mock (simulasi). Saat diklik, menampilkan status sukses
 * 'Pembayaran berhasil (simulasi)'. TIDAK ada integrasi payment provider —
 * ini hanya demo visual alur QRIS.
 */
export default function PayButton() {
  const [paid, setPaid] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() => {
      // Simulasi pemrosesan sesaat, lalu tampilkan status sukses.
      setPaid(true);
    });
  }

  if (paid) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm"
      >
        <svg
          className="h-5 w-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            clipRule="evenodd"
            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
            fillRule="evenodd"
          />
        </svg>
        Pembayaran berhasil (simulasi)
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-dark disabled:opacity-60"
    >
      {isPending ? "Memproses..." : "Bayar dengan QRIS"}
    </button>
  );
}
