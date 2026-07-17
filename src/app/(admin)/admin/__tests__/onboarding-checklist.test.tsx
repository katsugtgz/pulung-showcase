/**
 * Tests for OnboardingChecklist (Slice 25).
 *
 * Konvensi repo: co-located di __tests__, menggunakan @testing-library/react,
 * vitest. Tidak ada mock-call assertion — hanya perilaku yang diuji.
 */

import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OnboardingChecklist } from "../onboarding-checklist";

const STORAGE_KEY = "pulung_admin_onboarding_dismissed";

// Mock localStorage — Node 24 native localStorage requires --localstorage-file,
// so we replace it with a simple in-memory mock that jsdom can use.
const storageMock: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => storageMock[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    storageMock[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete storageMock[key];
  }),
  clear: vi.fn(() => {
    for (const key in storageMock) delete storageMock[key];
  }),
  length: 0,
  key: vi.fn(() => null),
};

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

beforeEach(() => {
  // Reset storage and mocks between tests
  for (const key in storageMock) delete storageMock[key];
  vi.clearAllMocks();
  // Restore the spy implementations after clearAllMocks
  localStorageMock.getItem.mockImplementation((key: string) => storageMock[key] ?? null);
  localStorageMock.setItem.mockImplementation((key: string, value: string) => {
    storageMock[key] = value;
  });
  localStorageMock.clear.mockImplementation(() => {
    for (const key in storageMock) delete storageMock[key];
  });
});

afterEach(cleanup);

/* ========================= rendering ========================= */

describe("OnboardingChecklist", () => {
  it("menampilkan heading Indonesia setelah mount", () => {
    render(<OnboardingChecklist />);
    expect(
      screen.getByText(/Selamat datang di Dasbor Admin/i),
    ).toBeInTheDocument();
  });

  it("menampilkan semua 5 item checklist", () => {
    render(<OnboardingChecklist />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(5);
  });

  it("menampilkan link ke /admin/siswa", () => {
    render(<OnboardingChecklist />);
    const link = screen.getByRole("link", { name: /Kelola Data Siswa/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/admin/siswa");
  });

  it("menampilkan link ke /admin/jadwal-instruktur", () => {
    render(<OnboardingChecklist />);
    const link = screen.getByRole("link", { name: /Atur Jadwal Instruktur/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/admin/jadwal-instruktur");
  });

  it("menampilkan link ke /admin/jadwal-siswa", () => {
    render(<OnboardingChecklist />);
    const link = screen.getByRole("link", { name: /Kelola Jadwal Siswa/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/admin/jadwal-siswa");
  });

  it("menampilkan link ke /admin/ekspor", () => {
    render(<OnboardingChecklist />);
    const link = screen.getByRole("link", { name: /Ekspor Data Excel/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/admin/ekspor");
  });

  it("menampilkan link ke #pending-heading untuk konfirmasi pembayaran", () => {
    render(<OnboardingChecklist />);
    const link = screen.getByRole("link", { name: /Konfirmasi Pembayaran/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "#pending-heading");
  });

  /* ========================= dismiss ========================= */

  it("menyembunyikan checklist setelah tombol dismiss diklik", async () => {
    const user = userEvent.setup();
    render(<OnboardingChecklist />);

    const closeBtn = screen.getByRole("button", {
      name: /Saya sudah mengerti/i,
    });
    await user.click(closeBtn);

    expect(
      screen.queryByText(/Selamat datang di Dasbor Admin/i),
    ).not.toBeInTheDocument();
  });

  it("menyimpan status dismiss ke localStorage", async () => {
    const user = userEvent.setup();
    render(<OnboardingChecklist />);

    await user.click(
      screen.getByRole("button", { name: /Saya sudah mengerti/i }),
    );

    expect(localStorageMock.setItem).toHaveBeenCalledWith(STORAGE_KEY, "true");
  });

  it("tidak ditampilkan jika localStorage sudah di-set dismissed", () => {
    storageMock[STORAGE_KEY] = "true";
    render(<OnboardingChecklist />);

    expect(
      screen.queryByText(/Selamat datang di Dasbor Admin/i),
    ).not.toBeInTheDocument();
  });

  it("tombol X (ikon) juga menutup checklist", async () => {
    const user = userEvent.setup();
    render(<OnboardingChecklist />);

    const iconBtn = screen.getByRole("button", {
      name: /Tutup panduan onboarding/i,
    });
    await user.click(iconBtn);

    expect(
      screen.queryByText(/Selamat datang di Dasbor Admin/i),
    ).not.toBeInTheDocument();
  });
});
