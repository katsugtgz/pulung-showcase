/**
 * excel-export — generates .xlsx workbooks for admin data exports (Slice 24).
 *
 * Three exported functions, each returning a Promise<Uint8Array> that can be
 * served directly as a download response body. All data comes from the domain
 * and catalog-data modules — nothing is hardcoded.
 *
 * Brand header style: bold white text on primary blue (#1E6FB8), header row
 * frozen so columns stay visible while scrolling.
 */

import ExcelJS from "exceljs";
import {
  getSiswa,
  getSesi,
  getPembayaran,
  getInstrukturById,
  getSiswaById,
} from "@/lib/domain";
import {
  getPackageById,
  getBranchById,
  getBranchCluster,
} from "@/lib/catalog-data";
import { formatIDR, formatDate } from "@/lib/format";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Brand-blue ARGB for the header fill. */
const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1E6FB8" },
};

/** Bold white font for header cells. */
const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: "FFFFFFFF" },
};

/**
 * Create a new workbook with a single worksheet already configured:
 * - Bold white text on brand-blue header row
 * - Header row frozen (row 1)
 * - Columns defined by the caller
 * Returns { workbook, ws } so the caller can add rows.
 */
function createWorkbook(
  sheetName: string,
  columns: Array<{ header: string; key: string; width: number }>,
): { workbook: ExcelJS.Workbook; ws: ExcelJS.Worksheet } {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Kursus Mengemudi Pulung";
  workbook.created = new Date();

  const ws = workbook.addWorksheet(sheetName);

  // Set columns (triggers header row generation).
  ws.columns = columns.map((c) => ({
    header: c.header,
    key: c.key,
    width: c.width,
  }));

  // Style the header row.
  const headerRow = ws.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });
  headerRow.commit();

  // Freeze the header row.
  ws.views = [{ state: "frozen", ySplit: 1 }];

  return { workbook, ws };
}

// ---------------------------------------------------------------------------
// Indonesian label maps
// ---------------------------------------------------------------------------

const ENROLLMENT_LABEL: Record<string, string> = {
  menunggu_bayar: "Menunggu Bayar",
  menunggu_konfirmasi: "Menunggu Konfirmasi",
  terkonfirmasi: "Terkonfirmasi",
  jadwal_dipilih: "Jadwal Dipilih",
  selesai: "Selesai",
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu",
  terverifikasi: "Terverifikasi",
  ditolak: "Ditolak",
};

const SESI_STATUS_LABEL: Record<string, string> = {
  tersedia: "Tersedia",
  dipesan: "Dipesan",
  selesai: "Selesai",
};

const METHOD_LABEL: Record<string, string> = {
  qris: "QRIS",
  manual: "Manual",
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate an .xlsx workbook with all siswa data.
 *
 * Sheet "Data Siswa": ID, Nama Lengkap, Paket, Cabang, Wilayah (cluster),
 * Status Pendaftaran (Indonesian label), Terdaftar (formatDate of createdAt).
 */
export async function generateSiswaXlsx(): Promise<Uint8Array> {
  const { workbook, ws } = createWorkbook("Data Siswa", [
    { header: "ID", key: "id", width: 14 },
    { header: "Nama Lengkap", key: "namaLengkap", width: 28 },
    { header: "Paket", key: "paket", width: 22 },
    { header: "Cabang", key: "cabang", width: 20 },
    { header: "Wilayah", key: "wilayah", width: 20 },
    { header: "Status Pendaftaran", key: "statusPendaftaran", width: 22 },
    { header: "Terdaftar", key: "terdaftar", width: 20 },
  ]);

  for (const siswa of getSiswa()) {
    const pkg = getPackageById(siswa.packageId);
    const branch = getBranchById(siswa.branchId);
    const cluster = getBranchCluster(siswa.branchId);

    ws.addRow({
      id: siswa.id,
      namaLengkap: siswa.fullName,
      paket: pkg.name,
      cabang: branch.name,
      wilayah: cluster.region,
      statusPendaftaran:
        ENROLLMENT_LABEL[siswa.enrollmentStatus] ?? siswa.enrollmentStatus,
      terdaftar: formatDate(siswa.createdAt),
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer);
}

/**
 * Generate an .xlsx workbook with all sesi/jadwal data.
 *
 * Sheet "Jadwal Sesi": ID, Instruktur, Cabang, Tanggal, Mulai, Selesai,
 * Status, Siswa (name if booked, else "—").
 */
export async function generateJadwalXlsx(): Promise<Uint8Array> {
  const { workbook, ws } = createWorkbook("Jadwal Sesi", [
    { header: "ID", key: "id", width: 12 },
    { header: "Instruktur", key: "instruktur", width: 28 },
    { header: "Cabang", key: "cabang", width: 20 },
    { header: "Tanggal", key: "tanggal", width: 20 },
    { header: "Mulai", key: "mulai", width: 10 },
    { header: "Selesai", key: "selesai", width: 10 },
    { header: "Status", key: "status", width: 14 },
    { header: "Siswa", key: "siswa", width: 28 },
  ]);

  for (const sesi of getSesi()) {
    const instruktur = getInstrukturById(sesi.instrukturId);
    const branch = getBranchById(sesi.branchId);
    let siswaName = "—";
    if (sesi.siswaId) {
      try {
        siswaName = getSiswaById(sesi.siswaId).fullName;
      } catch {
        siswaName = sesi.siswaId;
      }
    }

    ws.addRow({
      id: sesi.id,
      instruktur: instruktur.fullName,
      cabang: branch.name,
      tanggal: formatDate(sesi.date),
      mulai: sesi.startTime,
      selesai: sesi.endTime,
      status: SESI_STATUS_LABEL[sesi.status] ?? sesi.status,
      siswa: siswaName,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer);
}

/**
 * Generate an .xlsx workbook with all pembayaran data.
 *
 * Sheet "Pembayaran": ID, Siswa, Paket, Jumlah (formatIDR), Metode, Status,
 * Dibuat (formatDate of createdAt), Diverifikasi (formatDate of verifiedAt
 * or "—").
 */
export async function generatePembayaranXlsx(): Promise<Uint8Array> {
  const { workbook, ws } = createWorkbook("Pembayaran", [
    { header: "ID", key: "id", width: 18 },
    { header: "Siswa", key: "siswa", width: 28 },
    { header: "Paket", key: "paket", width: 22 },
    { header: "Jumlah", key: "jumlah", width: 16 },
    { header: "Metode", key: "metode", width: 12 },
    { header: "Status", key: "status", width: 16 },
    { header: "Dibuat", key: "dibuat", width: 20 },
    { header: "Diverifikasi", key: "diverifikasi", width: 20 },
  ]);

  for (const pembayaran of getPembayaran()) {
    let siswaName = pembayaran.siswaId;
    try {
      siswaName = getSiswaById(pembayaran.siswaId).fullName;
    } catch {
      // fallback to id
    }
    const pkg = getPackageById(pembayaran.packageId);

    ws.addRow({
      id: pembayaran.id,
      siswa: siswaName,
      paket: pkg.name,
      jumlah: formatIDR(pembayaran.amountIdr),
      metode: METHOD_LABEL[pembayaran.method] ?? pembayaran.method,
      status: PAYMENT_STATUS_LABEL[pembayaran.status] ?? pembayaran.status,
      dibuat: formatDate(pembayaran.createdAt),
      diverifikasi: pembayaran.verifiedAt
        ? formatDate(pembayaran.verifiedAt)
        : "—",
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer);
}
