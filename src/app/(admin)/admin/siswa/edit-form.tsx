"use client";

import { useState, useTransition } from "react";
import type { Siswa } from "@/lib/domain";
import type { Package, Branch } from "@/lib/catalog-data";
import { updateSiswaAction } from "./actions";

interface EditSiswaFormProps {
  siswa: Siswa;
  packages: Package[];
  branches: Branch[];
}

/**
 * Formulir edit data dasar siswa (nama, paket, cabang).
 * Komponen klien karena butuh state interaktif.
 */
export function EditSiswaForm({ siswa, packages, branches }: EditSiswaFormProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const packageId = formData.get("packageId") as string;
    const branchId = formData.get("branchId") as string;

    startTransition(async () => {
      const res = await updateSiswaAction(siswa.id, {
        fullName,
        packageId,
        branchId,
      });
      setResult(res);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label
          htmlFor="fullName"
          className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
        >
          Nama Lengkap
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          defaultValue={siswa.fullName}
          required
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label
          htmlFor="packageId"
          className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
        >
          Paket Kursus
        </label>
        <select
          id="packageId"
          name="packageId"
          defaultValue={siswa.packageId}
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {packages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="branchId"
          className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500"
        >
          Cabang
        </label>
        <select
          id="branchId"
          name="branchId"
          defaultValue={siswa.branchId}
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </div>

      {result && !result.ok && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {result.error}
        </p>
      )}
      {result?.ok && (
        <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Data siswa berhasil diperbarui.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Menyimpan…" : "Simpan Perubahan"}
      </button>
    </form>
  );
}
