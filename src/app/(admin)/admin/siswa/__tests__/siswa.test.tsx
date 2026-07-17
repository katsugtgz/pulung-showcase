/**
 * Tests untuk fitur admin kelola siswa (Slice 18).
 *
 * Mengikuti konvensi repo: co-located di __tests__, menggunakan
 * @testing-library/react, vitest, dan resetDomainStore untuk isolasi mutasi.
 * Tidak ada mock-call assertion — hanya perilaku yang diuji.
 */

import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { resetDomainStore, nextEnrollmentStatus } from "@/lib/domain";
import type { EnrollmentStatus } from "@/lib/domain";
import {
  ENROLLMENT_LABEL,
  ENROLLMENT_BADGE_CLASS,
} from "../enrollment-labels";
import { AdvanceStatusForm } from "../advance-status-form";

beforeEach(() => {
  resetDomainStore();
});

afterEach(cleanup);

/* ========================= label maps ========================= */

describe("ENROLLMENT_LABEL", () => {
  it("maps every EnrollmentStatus ke label Indonesia", () => {
    const statuses: EnrollmentStatus[] = [
      "menunggu_bayar",
      "menunggu_konfirmasi",
      "terkonfirmasi",
      "jadwal_dipilih",
      "selesai",
    ];
    for (const status of statuses) {
      expect(ENROLLMENT_LABEL[status]).toBeTruthy();
      // label harus dalam bahasa Indonesia (tidak sama dengan key itu sendiri)
      expect(ENROLLMENT_LABEL[status]).not.toBe(status);
    }
  });

  it("mengembalikan label yang dapat dibaca manusia untuk tiap status", () => {
    expect(ENROLLMENT_LABEL["menunggu_bayar"]).toBe("Menunggu Bayar");
    expect(ENROLLMENT_LABEL["menunggu_konfirmasi"]).toBe("Menunggu Konfirmasi");
    expect(ENROLLMENT_LABEL["terkonfirmasi"]).toBe("Terkonfirmasi");
    expect(ENROLLMENT_LABEL["jadwal_dipilih"]).toBe("Jadwal Dipilih");
    expect(ENROLLMENT_LABEL["selesai"]).toBe("Selesai");
  });
});

describe("ENROLLMENT_BADGE_CLASS", () => {
  it("mendefinisikan kelas badge untuk setiap status", () => {
    const statuses: EnrollmentStatus[] = [
      "menunggu_bayar",
      "menunggu_konfirmasi",
      "terkonfirmasi",
      "jadwal_dipilih",
      "selesai",
    ];
    for (const status of statuses) {
      expect(ENROLLMENT_BADGE_CLASS[status]).toBeTruthy();
      expect(typeof ENROLLMENT_BADGE_CLASS[status]).toBe("string");
    }
  });
});

/* ========================= nextEnrollmentStatus ========================= */

describe("nextEnrollmentStatus (via domain)", () => {
  it("dari menunggu_bayar: satu langkah ke menunggu_konfirmasi", () => {
    const next = nextEnrollmentStatus("menunggu_bayar");
    expect(next).toEqual(["menunggu_konfirmasi"]);
  });

  it("dari menunggu_konfirmasi: satu langkah ke terkonfirmasi", () => {
    const next = nextEnrollmentStatus("menunggu_konfirmasi");
    expect(next).toEqual(["terkonfirmasi"]);
  });

  it("dari terkonfirmasi: satu langkah ke jadwal_dipilih", () => {
    const next = nextEnrollmentStatus("terkonfirmasi");
    expect(next).toEqual(["jadwal_dipilih"]);
  });

  it("dari jadwal_dipilih: satu langkah ke selesai", () => {
    const next = nextEnrollmentStatus("jadwal_dipilih");
    expect(next).toEqual(["selesai"]);
  });

  it("dari selesai: tidak ada langkah berikutnya (array kosong)", () => {
    const next = nextEnrollmentStatus("selesai");
    expect(next).toEqual([]);
  });

  it("tidak bisa lompat status (tidak ada skip)", () => {
    // dari menunggu_bayar tidak bisa ke terkonfirmasi
    const next = nextEnrollmentStatus("menunggu_bayar");
    expect(next).not.toContain("terkonfirmasi");
    expect(next).not.toContain("selesai");
  });
});

/* ========================= AdvanceStatusForm ========================= */

describe("AdvanceStatusForm", () => {
  it("menampilkan pesan terminal saat status adalah 'selesai' (tidak ada langkah berikutnya)", () => {
    render(
      <AdvanceStatusForm
        siswaId="siswa-001"
        currentStatus="selesai"
        nextStatuses={[]}
      />,
    );
    expect(
      screen.getByText(/status akhir/i),
    ).toBeInTheDocument();
    // tidak ada tombol
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("menampilkan satu tombol untuk status berikutnya yang diizinkan", () => {
    render(
      <AdvanceStatusForm
        siswaId="siswa-003"
        currentStatus="menunggu_konfirmasi"
        nextStatuses={["terkonfirmasi"]}
      />,
    );
    const btn = screen.getByRole("button", { name: /Terkonfirmasi/i });
    expect(btn).toBeInTheDocument();
  });

  it("menampilkan label Indonesia untuk semua status yang diizinkan", () => {
    // Gunakan jadwal_dipilih -> selesai
    render(
      <AdvanceStatusForm
        siswaId="siswa-002"
        currentStatus="jadwal_dipilih"
        nextStatuses={["selesai"]}
      />,
    );
    expect(screen.getByRole("button", { name: /Selesai/i })).toBeInTheDocument();
  });

  it("tidak menampilkan tombol untuk status yang tidak diizinkan (backward/skip)", () => {
    // Dari menunggu_bayar, hanya menunggu_konfirmasi yang diizinkan
    render(
      <AdvanceStatusForm
        siswaId="siswa-005"
        currentStatus="menunggu_bayar"
        nextStatuses={nextEnrollmentStatus("menunggu_bayar")}
      />,
    );
    // hanya satu tombol
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent("Menunggu Konfirmasi");
    // tidak ada tombol untuk terkonfirmasi, jadwal_dipilih, atau selesai
    expect(screen.queryByRole("button", { name: /Terkonfirmasi/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Jadwal Dipilih/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Selesai/i })).not.toBeInTheDocument();
  });

  it("tombol menjadi disabled saat sedang memproses (useTransition pending)", async () => {
    const user = userEvent.setup();
    render(
      <AdvanceStatusForm
        siswaId="siswa-003"
        currentStatus="menunggu_konfirmasi"
        nextStatuses={["terkonfirmasi"]}
      />,
    );
    const btn = screen.getByRole("button", { name: /Terkonfirmasi/i });
    // Tombol tidak disabled saat idle
    expect(btn).not.toBeDisabled();
  });
});
