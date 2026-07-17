/**
 * generateKartuSiswaPdf — builds a printable student ID card (kartu siswa)
 * PDF for a Pulung siswa.
 *
 * Layout: A6 landscape (420 × 298 pt). Card-style with a branded blue/red
 * header, a two-column field grid, and a "Safe Drive Training" motto strip.
 *
 * Reuses the shared brand primitives in `./brand.ts`.
 *
 * @param siswaId - A valid siswa id (e.g. "siswa-001"). Propagates the domain
 *   module's TypeError on unknown ids — callers can treat it as a 404.
 * @returns Serialised PDF bytes as Uint8Array.
 */

import { PDFDocument, PDFPage } from "pdf-lib";
import {
  getBranchById,
  getBranchCluster,
  getPackageById,
} from "@/lib/catalog-data";
import { getSiswaById } from "@/lib/domain";
import {
  BRAND_BLUE,
  BRAND_NEUTRAL_100,
  BRAND_NEUTRAL_200,
  BRAND_NEUTRAL_400,
  BRAND_NEUTRAL_900,
  BRAND_RED,
  BRAND_WHITE,
  BrandFonts,
  HEADER_HEIGHT,
  drawDocumentHeader,
  loadBrandFonts,
} from "./brand";

// ---------------------------------------------------------------------------
// Page geometry (A6 landscape, points)
// ---------------------------------------------------------------------------

const PAGE_WIDTH = 420;
const PAGE_HEIGHT = 298;

const MARGIN = 18;
const COL_GAP = 14;
const COL_WIDTH = (PAGE_WIDTH - MARGIN * 2 - COL_GAP) / 2;

const FOOTER_HEIGHT = 40;

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------

function drawLabel(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  fonts: BrandFonts,
): void {
  page.drawText(text.toUpperCase(), {
    x,
    y,
    size: 6.5,
    font: fonts.regular,
    color: BRAND_NEUTRAL_400,
  });
}

function drawValue(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  fonts: BrandFonts,
  size = 9.5,
): void {
  page.drawText(text, {
    x,
    y,
    size,
    font: fonts.bold,
    color: BRAND_NEUTRAL_900,
  });
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function generateKartuSiswaPdf(
  siswaId: string,
): Promise<Uint8Array> {
  // getSiswaById throws TypeError on unknown id — propagates to caller.
  const siswa = getSiswaById(siswaId);
  const pkg = getPackageById(siswa.packageId);
  const branch = getBranchById(siswa.branchId);
  const cluster = getBranchCluster(siswa.branchId);

  const enrollmentYear = siswa.createdAt.slice(0, 4);

  // Human-readable transmission label
  const transmissionLabel =
    pkg.transmission === "manual"
      ? "Manual"
      : pkg.transmission === "matic"
        ? "Matic"
        : "Manual + Matic";

  // Abbreviate long package names (e.g. "Paket Kombinasi (Manual + Matic)"
  // → "Paket Kombinasi") to keep the card layout clean.
  const packageDisplayName = pkg.name.includes(" (")
    ? pkg.name.split(" (")[0]
    : pkg.name;

  // Abbreviate cluster region — take only the part before the parenthetical.
  const clusterRegion = cluster.region.includes("(")
    ? cluster.region.split("(")[0].trim()
    : cluster.region;

  // ---------------------------------------------------------------------------
  // Build PDF
  // ---------------------------------------------------------------------------

  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const fonts = await loadBrandFonts(doc);

  // ── Background ─────────────────────────────────────────────────────────────
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    color: BRAND_NEUTRAL_100,
  });

  // ── Standard header (blue band + red stripe) ────────────────────────────────
  drawDocumentHeader(page, fonts);

  // Card number — right-aligned in the blue band
  const cardNumText = `No. ${siswaId}`;
  const cardNumWidth = fonts.regular.widthOfTextAtSize(cardNumText, 7.5);
  page.drawText(cardNumText, {
    x: PAGE_WIDTH - MARGIN - cardNumWidth,
    y: PAGE_HEIGHT - 30,
    size: 7.5,
    font: fonts.regular,
    color: BRAND_WHITE,
  });

  // ── White card body ────────────────────────────────────────────────────────
  const bodyTop = PAGE_HEIGHT - HEADER_HEIGHT;
  const bodyPad = 6; // inner shadow / border padding

  page.drawRectangle({
    x: MARGIN - bodyPad,
    y: FOOTER_HEIGHT,
    width: PAGE_WIDTH - (MARGIN - bodyPad) * 2,
    height: bodyTop - FOOTER_HEIGHT,
    color: BRAND_WHITE,
  });

  // "KARTU SISWA" section label
  page.drawText("KARTU SISWA", {
    x: MARGIN,
    y: bodyTop - 16,
    size: 6.5,
    font: fonts.regular,
    color: BRAND_NEUTRAL_400,
  });

  // Student name (prominent)
  const nameY = bodyTop - 33;
  page.drawText(siswa.fullName, {
    x: MARGIN,
    y: nameY,
    size: 15,
    font: fonts.bold,
    color: BRAND_NEUTRAL_900,
  });

  // Divider below name
  const dividerY = nameY - 12;
  page.drawLine({
    start: { x: MARGIN, y: dividerY },
    end: { x: PAGE_WIDTH - MARGIN, y: dividerY },
    thickness: 0.5,
    color: BRAND_NEUTRAL_200,
  });

  // Two-column field grid
  const leftX = MARGIN;
  const rightX = MARGIN + COL_WIDTH + COL_GAP;
  const labelGap = 10; // points between label baseline and value baseline
  const rowStep = 32;
  let rowY = dividerY - 22;

  // Row 1: No. Kartu | Tahun Masuk
  drawLabel(page, "No. Kartu", leftX, rowY + labelGap, fonts);
  drawValue(page, siswaId, leftX, rowY, fonts);

  drawLabel(page, "Tahun Masuk", rightX, rowY + labelGap, fonts);
  drawValue(page, enrollmentYear, rightX, rowY, fonts);

  rowY -= rowStep;

  // Row 2: Paket | Transmisi
  drawLabel(page, "Paket Kursus", leftX, rowY + labelGap, fonts);
  drawValue(page, packageDisplayName, leftX, rowY, fonts);

  drawLabel(page, "Transmisi", rightX, rowY + labelGap, fonts);
  drawValue(page, transmissionLabel, rightX, rowY, fonts);

  rowY -= rowStep;

  // Row 3: Cabang | Wilayah
  drawLabel(page, "Cabang", leftX, rowY + labelGap, fonts);
  drawValue(page, branch.name, leftX, rowY, fonts);

  drawLabel(page, "Wilayah", rightX, rowY + labelGap, fonts);
  drawValue(page, clusterRegion, rightX, rowY, fonts, 8.5);

  // ── Footer motto strip ────────────────────────────────────────────────────
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: FOOTER_HEIGHT,
    color: BRAND_BLUE,
  });

  // Red accent at top edge of footer
  page.drawRectangle({
    x: 0,
    y: FOOTER_HEIGHT - 3,
    width: PAGE_WIDTH,
    height: 3,
    color: BRAND_RED,
  });

  page.drawText("Safe Drive Training", {
    x: MARGIN,
    y: FOOTER_HEIGHT / 2 + 4,
    size: 11,
    font: fonts.bold,
    color: BRAND_WHITE,
  });

  page.drawText("Sejak 2000 — Kursus Mengemudi Pulung, Surabaya", {
    x: MARGIN,
    y: FOOTER_HEIGHT / 2 - 9,
    size: 7,
    font: fonts.regular,
    color: BRAND_WHITE,
  });

  return doc.save();
}
