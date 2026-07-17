/**
 * Tests for TambahSesiForm (client component) and SESI_STATUS_LABEL helper.
 * Convention: behaviour-only assertions, no implementation details.
 */

import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock server actions — they are async functions that cannot run in jsdom
vi.mock("../actions", () => ({
  tambahSesiAction: vi.fn(),
  updateSesiAction: vi.fn(),
  removeSesiAction: vi.fn(),
}));

// Mock catalog-data (getBranchById) to avoid relying on real data in unit tests
vi.mock("@/lib/catalog-data", () => ({
  getBranchById: (id: string) => ({ id, name: `Cabang ${id}` }),
}));

import { TambahSesiForm } from "../components";
import { SESI_STATUS_LABEL } from "../labels";
import { tambahSesiAction } from "../actions";

const mockInstrukturList = [
  {
    id: "instruktur-001",
    fullName: "Pak Slamet Riyadi",
    branchId: "gunung-anyar",
    transmissions: ["manual", "matic"] as const,
    whatsapp: "+62 812-1111-2222",
  },
  {
    id: "instruktur-002",
    fullName: "Bu Hartati Wulandari",
    branchId: "manyar",
    transmissions: ["matic"] as const,
    whatsapp: "+62 812-3333-4444",
  },
];

afterEach(cleanup);

/* ------------------------------------------------------------------ */
/* SESI_STATUS_LABEL pure helper                                       */
/* ------------------------------------------------------------------ */

describe("SESI_STATUS_LABEL", () => {
  it("maps every SesiStatus to an Indonesian label", () => {
    expect(SESI_STATUS_LABEL.tersedia).toBe("Tersedia");
    expect(SESI_STATUS_LABEL.dipesan).toBe("Dipesan");
    expect(SESI_STATUS_LABEL.selesai).toBe("Selesai");
  });

  it("covers exactly the three known statuses", () => {
    const keys = Object.keys(SESI_STATUS_LABEL);
    expect(keys).toHaveLength(3);
    expect(keys).toContain("tersedia");
    expect(keys).toContain("dipesan");
    expect(keys).toContain("selesai");
  });
});

/* ------------------------------------------------------------------ */
/* TambahSesiForm                                                       */
/* ------------------------------------------------------------------ */

describe("TambahSesiForm", () => {
  beforeEach(() => {
    vi.mocked(tambahSesiAction).mockReset();
  });

  it("renders an option for each instructor", () => {
    render(<TambahSesiForm instrukturList={mockInstrukturList} />);
    // The placeholder option + one per instructor
    const options = screen.getAllByRole<HTMLOptionElement>("option");
    const instrukturOptions = options.filter(
      (o) => o.value !== "",
    );
    expect(instrukturOptions).toHaveLength(mockInstrukturList.length);
    expect(
      screen.getByRole("option", { name: "Pak Slamet Riyadi" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Bu Hartati Wulandari" }),
    ).toBeInTheDocument();
  });

  it("submit button is disabled until an instructor is selected", () => {
    render(<TambahSesiForm instrukturList={mockInstrukturList} />);
    expect(
      screen.getByRole("button", { name: /tambah sesi/i }),
    ).toBeDisabled();
  });

  it("shows branch name hint after selecting an instructor", async () => {
    const user = userEvent.setup();
    render(<TambahSesiForm instrukturList={mockInstrukturList} />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: /instruktur/i }),
      "instruktur-001",
    );

    expect(screen.getByText(/cabang:/i)).toBeInTheDocument();
  });

  it("shows Indonesian error message when action returns { ok: false }", async () => {
    vi.mocked(tambahSesiAction).mockResolvedValue({
      ok: false,
      error: "Sesi sudah dipesan siswa — pindahkan dulu jadwalnya.",
    });

    const user = userEvent.setup();
    render(<TambahSesiForm instrukturList={mockInstrukturList} />);

    // Select instructor to enable submit
    await user.selectOptions(
      screen.getByRole("combobox", { name: /instruktur/i }),
      "instruktur-001",
    );

    // Fill required fields to pass browser validation
    await user.type(screen.getByLabelText(/tanggal/i), "2026-08-01");
    await user.type(screen.getByLabelText(/mulai/i), "09:00");
    await user.type(screen.getByLabelText(/selesai/i), "10:00");

    await user.click(screen.getByRole("button", { name: /tambah sesi/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Sesi sudah dipesan siswa — pindahkan dulu jadwalnya.",
      );
    });
  });

  it("shows success message and resets form when action returns { ok: true }", async () => {
    vi.mocked(tambahSesiAction).mockResolvedValue({ ok: true });

    const user = userEvent.setup();
    render(<TambahSesiForm instrukturList={mockInstrukturList} />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: /instruktur/i }),
      "instruktur-002",
    );

    await user.type(screen.getByLabelText(/tanggal/i), "2026-08-02");
    await user.type(screen.getByLabelText(/mulai/i), "14:00");
    await user.type(screen.getByLabelText(/selesai/i), "15:00");

    await user.click(screen.getByRole("button", { name: /tambah sesi/i }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Sesi berhasil ditambahkan.",
      );
    });
  });

  it("calls tambahSesiAction with instrukturId and branchId from selected instructor", async () => {
    vi.mocked(tambahSesiAction).mockResolvedValue({ ok: true });

    const user = userEvent.setup();
    render(<TambahSesiForm instrukturList={mockInstrukturList} />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: /instruktur/i }),
      "instruktur-001",
    );
    await user.type(screen.getByLabelText(/tanggal/i), "2026-08-03");
    await user.type(screen.getByLabelText(/mulai/i), "08:00");
    await user.type(screen.getByLabelText(/selesai/i), "09:00");

    await user.click(screen.getByRole("button", { name: /tambah sesi/i }));

    await waitFor(() => {
      expect(tambahSesiAction).toHaveBeenCalledWith(
        expect.objectContaining({
          instrukturId: "instruktur-001",
          branchId: "gunung-anyar",
        }),
      );
    });
  });
});
