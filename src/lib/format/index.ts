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
 * Today's date as a `YYYY-MM-DD` string (the format `formatDate` and the
 * domain module expect). Slice the ISO 8601 timestamp so callers never pass
 * the full ISO string where a calendar date is required.
 */
export function todayYmd(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Format a `YYYY-MM-DD` ISO date as an Indonesian long date, e.g.
 * "17 Juli 2026".
 *
 * Behavior:
 * - input must be a zero-padded `YYYY-MM-DD` string
 * - empty / non-string / wrong shape / impossible calendar date -> throws TypeError
 * - rejects impossible calendar dates (Feb 30, Apr 31, Feb 29 non-leap) by
 *   round-tripping through `new Date(y, m-1, d)` and verifying month/day
 *   survive — JS Date silently rolls over, so the check catches it.
 */
export function formatDate(iso: string): string {
  if (typeof iso !== "string" || iso.length === 0) {
    throw new TypeError(`formatDate: expected a YYYY-MM-DD string, got ${iso}`);
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    throw new TypeError(`formatDate: expected a YYYY-MM-DD string, got ${iso}`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) {
    throw new TypeError(`formatDate: invalid month in ${iso}`);
  }
  if (day < 1 || day > 31) {
    throw new TypeError(`formatDate: invalid day in ${iso}`);
  }
  // Round-trip through Date to reject impossible calendar dates (Feb 30,
  // Apr 31, Feb 29 on non-leap years). JS Date normalizes overflow, so a
  // mismatch on month/day proves the input is not a real calendar date.
  // Use setFullYear (not the Date(y, m, d) constructor) so years 0-99 are
  // interpreted literally — the multi-arg constructor remaps them to
  // 1900-1999 and would reject valid ISO dates like "0099-02-28".
  const probe = new Date(0);
  probe.setFullYear(year, month - 1, day);
  if (
    probe.getFullYear() !== year ||
    probe.getMonth() !== month - 1 ||
    probe.getDate() !== day
  ) {
    throw new TypeError(`formatDate: invalid calendar date ${iso}`);
  }
  return `${day} ${INDONESIAN_MONTHS[month - 1]} ${year}`;
}
