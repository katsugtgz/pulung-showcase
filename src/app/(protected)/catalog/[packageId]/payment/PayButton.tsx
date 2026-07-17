"use client";

import { useTransition } from "react";
import { bayarQrisAction } from "./actions";

/*
 * Tombol QRIS untuk memulai pembayaran. Memanggil server action bayarQrisAction
 * yang mencatat pembayaran di domain store dan memajukan status enrollment.
 */

interface PayButtonProps {
  packageId: string;
  /** Label tombol — "Bayar dengan QRIS" untuk pembayaran baru, "Coba lagi" untuk retry. */
  label?: string;
}

export default function PayButton({
  packageId,
  label = "Bayar dengan QRIS",
}: PayButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await bayarQrisAction(packageId);
      // revalidatePath in the action will trigger a server re-render;
      // no local state needed — the page shows the new state from the store.
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-dark disabled:opacity-60"
    >
      {isPending ? "Memproses..." : label}
    </button>
  );
}
