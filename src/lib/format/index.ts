/**
 * Indonesian-locale formatting helpers (currency, dates). Pure functions,
 * ICU-independent: output is stable across Node/ICU versions.
 */

const INDONESIAN_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

const GROUP_THREE_DIGITS = /\B(?=(\d{3})+(?!\d))/g;

/**
 * Format a whole-rupiah amount as "Rp 1.500.000" (id-ID: '.' thousands sep).
 *
 * Behavior:
 * - 0 -> "Rp 0"
 * - negative -> "-Rp 1.000" (sign before the currency)
 * - large -> "Rp 10.000.000"
 * - fractional rupiah is truncated toward zero
 * - NaN / ±Infinity -> throws TypeError
 */
export function formatIDR(amount: number): string {
  if (!Number.isFinite(amount)) {
    throw new TypeError(
      `formatIDR: amount must be a finite number, got ${amount}`,
    );
  }
  const sign = amount < 0 ? "-" : "";
  const whole = Math.abs(Math.trunc(amount)).toString();
  return `${sign}Rp ${whole.replace(GROUP_THREE_DIGITS, ".")}`;
}

/**
 * Format a `YYYY-MM-DD` ISO date as an Indonesian long date, e.g.
 * "17 Juli 2026".
 *
 * Behavior:
 * - input must be a zero-padded `YYYY-MM-DD` string
 * - empty / non-string / wrong shape / impossible month or day -> throws TypeError
 */
export function formatDate(iso: string): string {
  if (typeof iso !== "string" || iso.length === 0) {
    throw new TypeError(`formatDate: expected a YYYY-MM-DD string, got ${iso}`);
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    throw new TypeError(`formatDate: expected a YYYY-MM-DD string, got ${iso}`);
  }
  const year = match[1] as string;
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) {
    throw new TypeError(`formatDate: invalid month in ${iso}`);
  }
  if (day < 1 || day > 31) {
    throw new TypeError(`formatDate: invalid day in ${iso}`);
  }
  return `${day} ${INDONESIAN_MONTHS[month - 1]} ${year}`;
}
