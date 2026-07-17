/**
 * Tests for the excel-export module (Slice 24).
 *
 * Verifications:
 * - Bytes start with PK zip magic (0x50 0x4B) — xlsx is a zip archive.
 * - Each workbook re-loads via ExcelJS and has the expected row count
 *   (domain count + 1 header row).
 * - Spot-check cells: siswa-001 name present; a pembayaran Jumlah cell
 *   equals formatIDR of the seed amount.
 */

import { describe, it, expect, beforeEach } from "vitest";
import ExcelJS from "exceljs";
import {
  generateSiswaXlsx,
  generateJadwalXlsx,
  generatePembayaranXlsx,
} from "../index";
import { getSiswa, getSesi, getPembayaran, resetDomainStore } from "@/lib/domain";
import { formatIDR } from "@/lib/format";

beforeEach(() => {
  resetDomainStore();
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function loadWorkbook(bytes: Uint8Array): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(bytes.buffer as ArrayBuffer);
  return wb;
}

// ---------------------------------------------------------------------------
// ZIP magic check
// ---------------------------------------------------------------------------

describe("xlsx magic bytes", () => {
  it("generateSiswaXlsx returns bytes starting with PK zip signature", async () => {
    const bytes = await generateSiswaXlsx();
    expect(bytes[0]).toBe(0x50); // 'P'
    expect(bytes[1]).toBe(0x4b); // 'K'
  });

  it("generateJadwalXlsx returns bytes starting with PK zip signature", async () => {
    const bytes = await generateJadwalXlsx();
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
  });

  it("generatePembayaranXlsx returns bytes starting with PK zip signature", async () => {
    const bytes = await generatePembayaranXlsx();
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
  });
});

// ---------------------------------------------------------------------------
// Row count = domain count + 1 header
// ---------------------------------------------------------------------------

describe("generateSiswaXlsx row count", () => {
  it("has exactly (siswa count + 1) rows", async () => {
    const domainCount = getSiswa().length;
    const bytes = await generateSiswaXlsx();
    const wb = await loadWorkbook(bytes);
    const ws = wb.getWorksheet("Data Siswa");
    expect(ws).toBeDefined();
    expect(ws!.rowCount).toBe(domainCount + 1);
  });
});

describe("generateJadwalXlsx row count", () => {
  it("has exactly (sesi count + 1) rows", async () => {
    const domainCount = getSesi().length;
    const bytes = await generateJadwalXlsx();
    const wb = await loadWorkbook(bytes);
    const ws = wb.getWorksheet("Jadwal Sesi");
    expect(ws).toBeDefined();
    expect(ws!.rowCount).toBe(domainCount + 1);
  });
});

describe("generatePembayaranXlsx row count", () => {
  it("has exactly (pembayaran count + 1) rows", async () => {
    const domainCount = getPembayaran().length;
    const bytes = await generatePembayaranXlsx();
    const wb = await loadWorkbook(bytes);
    const ws = wb.getWorksheet("Pembayaran");
    expect(ws).toBeDefined();
    expect(ws!.rowCount).toBe(domainCount + 1);
  });
});

// ---------------------------------------------------------------------------
// Spot-check cells
// ---------------------------------------------------------------------------

// Siswa columns: 1=ID, 2=Nama Lengkap, 3=Paket, 4=Cabang, 5=Wilayah,
//               6=Status Pendaftaran, 7=Terdaftar
describe("generateSiswaXlsx spot checks", () => {
  it("siswa-001 fullName appears in the Nama Lengkap column of row 2", async () => {
    const bytes = await generateSiswaXlsx();
    const wb = await loadWorkbook(bytes);
    const ws = wb.getWorksheet("Data Siswa")!;
    // Row 1 is header; row 2 is the first data row (siswa-001). Column 2 = Nama Lengkap.
    const namaCell = ws.getRow(2).getCell(2);
    expect(namaCell.value).toBe("Rizki Pratama");
  });

  it("first data row ID matches siswa-001", async () => {
    const bytes = await generateSiswaXlsx();
    const wb = await loadWorkbook(bytes);
    const ws = wb.getWorksheet("Data Siswa")!;
    // Column 1 = ID
    const idCell = ws.getRow(2).getCell(1);
    expect(idCell.value).toBe("siswa-001");
  });
});

// Pembayaran columns: 1=ID, 2=Siswa, 3=Paket, 4=Jumlah, 5=Metode,
//                    6=Status, 7=Dibuat, 8=Diverifikasi
describe("generatePembayaranXlsx spot checks", () => {
  it("first data row Jumlah equals formatIDR of pembayaran-001 amountIdr", async () => {
    const allPembayaran = getPembayaran();
    // Seed: pembayaran-001.amountIdr = 1_500_000
    const first = allPembayaran[0];
    const expected = formatIDR(first.amountIdr);

    const bytes = await generatePembayaranXlsx();
    const wb = await loadWorkbook(bytes);
    const ws = wb.getWorksheet("Pembayaran")!;
    // Column 4 = Jumlah
    const jumlahCell = ws.getRow(2).getCell(4);
    expect(jumlahCell.value).toBe(expected);
  });

  it("pembayaran-001 Diverifikasi is a formatted Indonesian date (not —)", async () => {
    const bytes = await generatePembayaranXlsx();
    const wb = await loadWorkbook(bytes);
    const ws = wb.getWorksheet("Pembayaran")!;
    // pembayaran-001 verifiedAt = "2026-07-11". Column 8 = Diverifikasi.
    const cell = ws.getRow(2).getCell(8);
    expect(cell.value).toBe("11 Juli 2026");
  });

  it("pembayaran-003 (pending, no verifiedAt) Diverifikasi is —", async () => {
    const bytes = await generatePembayaranXlsx();
    const wb = await loadWorkbook(bytes);
    const ws = wb.getWorksheet("Pembayaran")!;
    // pembayaran-003 is index 2 (0-based) → row 4 (1-based header + 2 offset).
    // Column 8 = Diverifikasi.
    const cell = ws.getRow(4).getCell(8);
    expect(cell.value).toBe("—");
  });
});

// Jadwal columns: 1=ID, 2=Instruktur, 3=Cabang, 4=Tanggal, 5=Mulai,
//                6=Selesai, 7=Status, 8=Siswa
describe("generateJadwalXlsx spot checks", () => {
  it("sesi-001 instruktur name appears in row 2", async () => {
    const bytes = await generateJadwalXlsx();
    const wb = await loadWorkbook(bytes);
    const ws = wb.getWorksheet("Jadwal Sesi")!;
    // Column 2 = Instruktur
    const instrukturCell = ws.getRow(2).getCell(2);
    expect(instrukturCell.value).toBe("Pak Slamet Riyadi");
  });

  it("sesi-001 siswa name is Rizki Pratama (dipesan)", async () => {
    const bytes = await generateJadwalXlsx();
    const wb = await loadWorkbook(bytes);
    const ws = wb.getWorksheet("Jadwal Sesi")!;
    // Column 8 = Siswa
    const siswaCell = ws.getRow(2).getCell(8);
    expect(siswaCell.value).toBe("Rizki Pratama");
  });

  it("sesi-002 siswa is — (tersedia, no siswaId)", async () => {
    const bytes = await generateJadwalXlsx();
    const wb = await loadWorkbook(bytes);
    const ws = wb.getWorksheet("Jadwal Sesi")!;
    // sesi-002 is the second data row → row 3. Column 8 = Siswa.
    const siswaCell = ws.getRow(3).getCell(8);
    expect(siswaCell.value).toBe("—");
  });
});
