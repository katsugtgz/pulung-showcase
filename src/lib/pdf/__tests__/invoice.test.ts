import { beforeEach, describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { generateInvoicePdf, invoiceNumber } from "../invoice";
import {
  addPembayaran,
  getPembayaranById,
  resetDomainStore,
  tolakPembayaran,
  verifikasiPembayaran,
} from "@/lib/domain";
import type { Pembayaran } from "@/lib/domain";

// ---------------------------------------------------------------------------
// invoiceNumber helper
// ---------------------------------------------------------------------------

describe("invoiceNumber", () => {
  it("formats correctly for pembayaran-001 (verifiedAt 2026-07-11)", () => {
    const p: Pembayaran = {
      id: "pembayaran-001",
      siswaId: "siswa-001",
      packageId: "paket-manual",
      amountIdr: 1_500_000,
      method: "qris",
      status: "terverifikasi",
      createdAt: "2026-07-10",
      verifiedAt: "2026-07-11",
    };
    expect(invoiceNumber(p)).toBe("INV/2026/001");
  });

  it("formats correctly for a hypothetical pembayaran-006 verified in 2026", () => {
    const p: Pembayaran = {
      id: "pembayaran-006",
      siswaId: "siswa-001",
      packageId: "paket-manual",
      amountIdr: 1_500_000,
      method: "qris",
      status: "terverifikasi",
      createdAt: "2026-07-15",
      verifiedAt: "2026-07-16",
    };
    expect(invoiceNumber(p)).toBe("INV/2026/006");
  });

  it("uses verifiedAt year, not createdAt year", () => {
    const p: Pembayaran = {
      id: "pembayaran-010",
      siswaId: "siswa-001",
      packageId: "paket-manual",
      amountIdr: 1_500_000,
      method: "manual",
      status: "terverifikasi",
      createdAt: "2025-12-30",
      verifiedAt: "2026-01-03",
    };
    expect(invoiceNumber(p)).toBe("INV/2026/010");
  });
});

// ---------------------------------------------------------------------------
// generateInvoicePdf
// ---------------------------------------------------------------------------

describe("generateInvoicePdf", () => {
  beforeEach(() => resetDomainStore());

  it("returns bytes starting with the %PDF magic header", async () => {
    const bytes = await generateInvoicePdf("pembayaran-001");
    const magic = new TextDecoder().decode(bytes.slice(0, 4));
    expect(magic).toBe("%PDF");
  });

  it("throws TypeError for an unknown pembayaran id", async () => {
    await expect(generateInvoicePdf("pembayaran-999")).rejects.toThrow(
      TypeError,
    );
  });

  it("throws TypeError if payment status is 'pending'", async () => {
    // pembayaran-003 is seeded as pending
    await expect(generateInvoicePdf("pembayaran-003")).rejects.toThrow(
      TypeError,
    );
  });

  it("throws TypeError if payment status is 'ditolak'", async () => {
    const p = addPembayaran({
      siswaId: "siswa-001",
      packageId: "paket-manual",
      amountIdr: 1_500_000,
      method: "qris",
      createdAt: "2026-07-17",
    });
    tolakPembayaran(p.id, "admin-001", "2026-07-17");
    await expect(generateInvoicePdf(p.id)).rejects.toThrow(TypeError);
  });

  it("generates exactly one page", async () => {
    const bytes = await generateInvoicePdf("pembayaran-001");
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(1);
  });

  it("produces a non-trivial byte length (> 1 000 bytes)", async () => {
    const bytes = await generateInvoicePdf("pembayaran-001");
    expect(bytes.byteLength).toBeGreaterThan(1_000);
  });

  it("works for a freshly verified payment created via domain mutations", async () => {
    const p = addPembayaran({
      siswaId: "siswa-001",
      packageId: "paket-manual",
      amountIdr: 1_500_000,
      method: "qris",
      createdAt: "2026-07-17",
    });
    verifikasiPembayaran(p.id, "admin-001", "2026-07-17");
    const bytes = await generateInvoicePdf(p.id);
    const magic = new TextDecoder().decode(bytes.slice(0, 4));
    expect(magic).toBe("%PDF");
    expect(bytes.byteLength).toBeGreaterThan(1_000);
  });

  it("invoiceNumber derived from seed matches expected format", () => {
    // Round-trip: read from store and derive invoice number
    const p = getPembayaranById("pembayaran-001");
    expect(invoiceNumber(p)).toBe("INV/2026/001");
  });
});
