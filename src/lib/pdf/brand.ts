/**
 * Brand constants and reusable PDF drawing primitives for Kursus Mengemudi
 * Pulung. Palette mirrors globals.css (primary #1E6FB8, accent #D22B3A).
 *
 * Reused by: kartu-siswa.ts (Slice 23), invoice.ts (future slices).
 * Standard fonts only — no font file assets required.
 */

import {
  PDFDocument,
  PDFFont,
  PDFPage,
  StandardFonts,
  rgb,
} from "pdf-lib";

// ---------------------------------------------------------------------------
// Brand colours
// ---------------------------------------------------------------------------

/** Primary brand blue: #1E6FB8 */
export const BRAND_BLUE = rgb(30 / 255, 111 / 255, 184 / 255);

/** Accent red: #D22B3A */
export const BRAND_RED = rgb(210 / 255, 43 / 255, 58 / 255);

/** Pure white */
export const BRAND_WHITE = rgb(1, 1, 1);

/** Neutral 100: #F1F5F9 */
export const BRAND_NEUTRAL_100 = rgb(0.945, 0.961, 0.976);

/** Neutral 200: #E2E8F0 */
export const BRAND_NEUTRAL_200 = rgb(0.886, 0.91, 0.941);

/** Neutral 400: #94A3B8 */
export const BRAND_NEUTRAL_400 = rgb(0.58, 0.639, 0.722);

/** Neutral 900: #0F172A */
export const BRAND_NEUTRAL_900 = rgb(0.059, 0.09, 0.165);

// ---------------------------------------------------------------------------
// Font loader
// ---------------------------------------------------------------------------

export interface BrandFonts {
  regular: PDFFont;
  bold: PDFFont;
}

/**
 * Embed Helvetica + HelveticaBold (standard PDF fonts — no binary assets)
 * into the given document. Call once per document and pass the result to
 * drawing helpers.
 */
export async function loadBrandFonts(doc: PDFDocument): Promise<BrandFonts> {
  const [regular, bold] = await Promise.all([
    doc.embedFont(StandardFonts.Helvetica),
    doc.embedFont(StandardFonts.HelveticaBold),
  ]);
  return { regular, bold };
}

// ---------------------------------------------------------------------------
// Document header
// ---------------------------------------------------------------------------

/**
 * Total height of the standard document header (blue band + red accent),
 * in points. Content below the header starts at `page.height - HEADER_HEIGHT`.
 */
export const HEADER_HEIGHT = 60;

/**
 * Draw the standard Pulung document header on `page`.
 *
 * Covers the top {@link HEADER_HEIGHT} points:
 * - Blue band (55 pt): "PULUNG" wordmark + subtitle
 * - Red accent stripe (5 pt) immediately below the blue band
 *
 * All coordinates are absolute from the page's bottom-left origin (pdf-lib
 * default). Callers may overlay additional content in the header area after
 * this call (e.g. a card number or document type badge).
 */
export function drawDocumentHeader(page: PDFPage, fonts: BrandFonts): void {
  const { width, height } = page.getSize();

  // Blue band
  page.drawRectangle({
    x: 0,
    y: height - 55,
    width,
    height: 55,
    color: BRAND_BLUE,
  });

  // Red accent stripe
  page.drawRectangle({
    x: 0,
    y: height - HEADER_HEIGHT,
    width,
    height: 5,
    color: BRAND_RED,
  });

  // "PULUNG" wordmark — bold, white
  page.drawText("PULUNG", {
    x: 20,
    y: height - 30,
    size: 22,
    font: fonts.bold,
    color: BRAND_WHITE,
  });

  // Subtitle
  page.drawText(
    "Kursus Mengemudi Pulung — Safe Drive Training · Sejak 2000",
    {
      x: 20,
      y: height - 48,
      size: 7.5,
      font: fonts.regular,
      color: BRAND_WHITE,
    },
  );
}
