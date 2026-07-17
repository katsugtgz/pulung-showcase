/**
 * generateInvoicePdf — builds a downloadable invoice PDF for a terverifikasi
 * Pulung pembayaran.
 *
 * An invoice is a deterministic projection of a verified payment — it exists
 * the moment status flips to "terverifikasi". No separate entity is stored.
 *
 * Invoice number format: `INV/{year of verifiedAt}/{numeric tail of pembayaran id}`
 * Examples: pembayaran-001 verified 2026-07-11 → "INV/2026/001"
 *
 * Layout: A4 portrait. Reuses brand primitives from `./brand.ts`.
 *
 * @param pembayaranId - A valid pembayaran id. Throws TypeError on unknown id.
 * @returns Serialised PDF bytes as Uint8Array.
 */

import { PDFDocument } from "pdf-lib";
import { getBranchById, getPackageById } from "@/lib/catalog-data";
import { getPembayaranById, getSiswaById } from "@/lib/domain";
import type { Pembayaran } from "@/lib/domain";
import { formatDate, formatIDR } from "@/lib/format";
import {
  BRAND_BLUE,
  BRAND_NEUTRAL_100,
  BRAND_NEUTRAL_200,
  BRAND_NEUTRAL_400,
  BRAND_NEUTRAL_900,
  BRAND_RED,
  BRAND_WHITE,
  HEADER_HEIGHT,
  drawDocumentHeader,
  loadBrandFonts,
} from "./brand";

// ---------------------------------------------------------------------------
// Invoice number helper (also exported for testing and UI reuse)
// ---------------------------------------------------------------------------

/**
 * Derive the invoice number from a terverifikasi pembayaran.
 *
 * Format: `INV/{year of verifiedAt}/{zero-padded numeric tail of id}`
 * Callers must ensure the pembayaran is terverifikasi (verifiedAt present).
 */
export function invoiceNumber(pembayaran: Pembayaran): string {
  const year = (pembayaran.verifiedAt ?? pembayaran.createdAt).slice(0, 4);
  const tail = pembayaran.id.replace(/^pembayaran-/, "");
  return `INV/${year}/${tail}`;
}

// ---------------------------------------------------------------------------
// Page geometry (A4 portrait, points)
// ---------------------------------------------------------------------------

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 50;
const FOOTER_H = 40;

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function generateInvoicePdf(
  pembayaranId: string,
): Promise<Uint8Array> {
  // Throws TypeError on unknown id — propagates to caller for a 404.
  const pembayaran = getPembayaranById(pembayaranId);

  if (pembayaran.status !== "terverifikasi") {
    throw new TypeError(
      `Invoice hanya tersedia untuk pembayaran terverifikasi. ` +
        `Status saat ini: "${pembayaran.status}" (id: ${pembayaranId})`,
    );
  }

  const siswa = getSiswaById(pembayaran.siswaId);
  const pkg = getPackageById(pembayaran.packageId);
  const branch = getBranchById(siswa.branchId);

  const invNum = invoiceNumber(pembayaran);

  const TRANSMISSION_LABEL: Record<string, string> = {
    manual: "Manual",
    matic: "Matic",
    mixed: "Manual + Matic",
  };
  const txLabel = TRANSMISSION_LABEL[pkg.transmission] ?? pkg.transmission;

  // ---------------------------------------------------------------------------
  // Build PDF
  // ---------------------------------------------------------------------------

  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const fonts = await loadBrandFonts(doc);

  // ── Background ──────────────────────────────────────────────────────────────
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_W,
    height: PAGE_H,
    color: BRAND_NEUTRAL_100,
  });

  // ── Standard header (blue band + red stripe) ────────────────────────────────
  drawDocumentHeader(page, fonts);

  // ── White content area ───────────────────────────────────────────────────────
  const contentTop = PAGE_H - HEADER_HEIGHT;
  const contentBot = FOOTER_H + 20;
  page.drawRectangle({
    x: MARGIN - 10,
    y: contentBot,
    width: PAGE_W - (MARGIN - 10) * 2,
    height: contentTop - contentBot,
    color: BRAND_WHITE,
  });

  // ---------------------------------------------------------------------------
  // Title section
  // ---------------------------------------------------------------------------

  const titleY = contentTop - 45;

  page.drawText("INVOICE", {
    x: MARGIN,
    y: titleY,
    size: 28,
    font: fonts.bold,
    color: BRAND_BLUE,
  });

  page.drawText(invNum, {
    x: MARGIN,
    y: titleY - 24,
    size: 11,
    font: fonts.regular,
    color: BRAND_NEUTRAL_400,
  });

  // Divider below title
  const divider1Y = titleY - 48;
  page.drawLine({
    start: { x: MARGIN, y: divider1Y },
    end: { x: PAGE_W - MARGIN, y: divider1Y },
    thickness: 0.75,
    color: BRAND_NEUTRAL_200,
  });

  // ---------------------------------------------------------------------------
  // Two-column info section
  // ---------------------------------------------------------------------------

  const LABEL_SIZE = 6.5;
  const VALUE_SIZE = 9.5;
  const LABEL_VAL_GAP = 12;
  const ROW_STEP = 30;

  const infoY = divider1Y - 22;
  const rightColX = PAGE_W / 2 + 10;

  // Left: tanggal pembayaran
  page.drawText("TANGGAL PEMBAYARAN", {
    x: MARGIN,
    y: infoY,
    size: LABEL_SIZE,
    font: fonts.regular,
    color: BRAND_NEUTRAL_400,
  });
  page.drawText(formatDate(pembayaran.createdAt), {
    x: MARGIN,
    y: infoY - LABEL_VAL_GAP,
    size: VALUE_SIZE,
    font: fonts.bold,
    color: BRAND_NEUTRAL_900,
  });

  // Left: tanggal verifikasi
  page.drawText("TANGGAL VERIFIKASI", {
    x: MARGIN,
    y: infoY - ROW_STEP,
    size: LABEL_SIZE,
    font: fonts.regular,
    color: BRAND_NEUTRAL_400,
  });
  page.drawText(formatDate(pembayaran.verifiedAt!), {
    x: MARGIN,
    y: infoY - ROW_STEP - LABEL_VAL_GAP,
    size: VALUE_SIZE,
    font: fonts.bold,
    color: BRAND_NEUTRAL_900,
  });

  // Right: nama siswa
  page.drawText("KEPADA", {
    x: rightColX,
    y: infoY,
    size: LABEL_SIZE,
    font: fonts.regular,
    color: BRAND_NEUTRAL_400,
  });
  page.drawText(siswa.fullName, {
    x: rightColX,
    y: infoY - LABEL_VAL_GAP,
    size: VALUE_SIZE,
    font: fonts.bold,
    color: BRAND_NEUTRAL_900,
  });

  // Right: cabang
  page.drawText("CABANG", {
    x: rightColX,
    y: infoY - ROW_STEP,
    size: LABEL_SIZE,
    font: fonts.regular,
    color: BRAND_NEUTRAL_400,
  });
  page.drawText(branch.name, {
    x: rightColX,
    y: infoY - ROW_STEP - LABEL_VAL_GAP,
    size: VALUE_SIZE,
    font: fonts.bold,
    color: BRAND_NEUTRAL_900,
  });

  // Divider below info section
  const divider2Y = infoY - ROW_STEP * 2 - 10;
  page.drawLine({
    start: { x: MARGIN, y: divider2Y },
    end: { x: PAGE_W - MARGIN, y: divider2Y },
    thickness: 0.75,
    color: BRAND_NEUTRAL_200,
  });

  // ---------------------------------------------------------------------------
  // Line-item table
  // ---------------------------------------------------------------------------

  const TABLE_TOP = divider2Y - 5;
  const THEAD_H = 24;
  const TROW_H = 28;

  // Column x-positions
  const COL_DESC = MARGIN + 8;
  const COL_TX = PAGE_W - MARGIN - 210;
  const COL_QTY = PAGE_W - MARGIN - 110;
  const COL_AMT_RIGHT = PAGE_W - MARGIN - 8; // right-edge for right-aligned text

  // Table header band (blue)
  page.drawRectangle({
    x: MARGIN,
    y: TABLE_TOP - THEAD_H,
    width: PAGE_W - 2 * MARGIN,
    height: THEAD_H,
    color: BRAND_BLUE,
  });

  const thY = TABLE_TOP - THEAD_H + 8;

  page.drawText("DESKRIPSI", {
    x: COL_DESC,
    y: thY,
    size: 7.5,
    font: fonts.bold,
    color: BRAND_WHITE,
  });
  page.drawText("TRANSMISI", {
    x: COL_TX,
    y: thY,
    size: 7.5,
    font: fonts.bold,
    color: BRAND_WHITE,
  });
  page.drawText("QTY", {
    x: COL_QTY,
    y: thY,
    size: 7.5,
    font: fonts.bold,
    color: BRAND_WHITE,
  });

  const thJumlah = "JUMLAH";
  page.drawText(thJumlah, {
    x: COL_AMT_RIGHT - fonts.bold.widthOfTextAtSize(thJumlah, 7.5),
    y: thY,
    size: 7.5,
    font: fonts.bold,
    color: BRAND_WHITE,
  });

  // Item row (white background)
  const itemRowY = TABLE_TOP - THEAD_H - TROW_H;
  page.drawRectangle({
    x: MARGIN,
    y: itemRowY,
    width: PAGE_W - 2 * MARGIN,
    height: TROW_H,
    color: BRAND_WHITE,
  });

  // Item row bottom border
  page.drawLine({
    start: { x: MARGIN, y: itemRowY },
    end: { x: PAGE_W - MARGIN, y: itemRowY },
    thickness: 0.5,
    color: BRAND_NEUTRAL_200,
  });

  const itemY = itemRowY + (TROW_H - VALUE_SIZE) / 2;

  page.drawText(pkg.name, {
    x: COL_DESC,
    y: itemY,
    size: VALUE_SIZE,
    font: fonts.bold,
    color: BRAND_NEUTRAL_900,
  });
  page.drawText(txLabel, {
    x: COL_TX,
    y: itemY,
    size: VALUE_SIZE,
    font: fonts.regular,
    color: BRAND_NEUTRAL_900,
  });
  page.drawText("1", {
    x: COL_QTY + 4,
    y: itemY,
    size: VALUE_SIZE,
    font: fonts.regular,
    color: BRAND_NEUTRAL_900,
  });

  const amtText = formatIDR(pembayaran.amountIdr);
  page.drawText(amtText, {
    x: COL_AMT_RIGHT - fonts.bold.widthOfTextAtSize(amtText, VALUE_SIZE),
    y: itemY,
    size: VALUE_SIZE,
    font: fonts.bold,
    color: BRAND_NEUTRAL_900,
  });

  // Total row (neutral-100 background with blue top accent)
  const totalRowY = itemRowY - TROW_H;
  page.drawRectangle({
    x: MARGIN,
    y: totalRowY,
    width: PAGE_W - 2 * MARGIN,
    height: TROW_H,
    color: BRAND_NEUTRAL_100,
  });

  // Blue accent top border for total row
  page.drawLine({
    start: { x: MARGIN, y: totalRowY + TROW_H },
    end: { x: PAGE_W - MARGIN, y: totalRowY + TROW_H },
    thickness: 1.5,
    color: BRAND_BLUE,
  });

  const totalY = totalRowY + (TROW_H - VALUE_SIZE) / 2;

  page.drawText("TOTAL", {
    x: COL_DESC,
    y: totalY,
    size: VALUE_SIZE,
    font: fonts.bold,
    color: BRAND_NEUTRAL_900,
  });

  const totalText = formatIDR(pembayaran.amountIdr);
  page.drawText(totalText, {
    x: COL_AMT_RIGHT - fonts.bold.widthOfTextAtSize(totalText, 11),
    y: totalY - 1,
    size: 11,
    font: fonts.bold,
    color: BRAND_BLUE,
  });

  // ---------------------------------------------------------------------------
  // Footer note (above footer strip)
  // ---------------------------------------------------------------------------

  const noteY = totalRowY - 30;
  page.drawText(
    "Pembayaran telah diverifikasi admin · Dokumen ini dibuat otomatis",
    {
      x: MARGIN,
      y: noteY,
      size: 8,
      font: fonts.regular,
      color: BRAND_NEUTRAL_400,
    },
  );

  // ---------------------------------------------------------------------------
  // Bottom motto strip (mirrors kartu-siswa footer)
  // ---------------------------------------------------------------------------

  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_W,
    height: FOOTER_H,
    color: BRAND_BLUE,
  });

  // Red accent at top edge of footer
  page.drawRectangle({
    x: 0,
    y: FOOTER_H - 3,
    width: PAGE_W,
    height: 3,
    color: BRAND_RED,
  });

  page.drawText("Safe Drive Training", {
    x: MARGIN,
    y: FOOTER_H / 2 + 4,
    size: 11,
    font: fonts.bold,
    color: BRAND_WHITE,
  });

  page.drawText("Sejak 2000 — Kursus Mengemudi Pulung, Surabaya", {
    x: MARGIN,
    y: FOOTER_H / 2 - 9,
    size: 7,
    font: fonts.regular,
    color: BRAND_WHITE,
  });

  return doc.save();
}
