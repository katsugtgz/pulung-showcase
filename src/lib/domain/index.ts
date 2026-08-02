/**
 * domain — typed query + mutation interface over the operational data source of
 * truth (siswa, instruktur, sesi/jadwal, pembayaran) for epics E1–E10.
 *
 * Mirrors `catalog-data` conventions: UI and other modules MUST consume data
 * through these functions; raw data constants live in `data.ts` and are
 * intentionally not re-exported. `*ById` lookups throw a TypeError on unknown
 * ids so callers can surface a 404 (e.g. via next/navigation `notFound()`).
 *
 * State is held in a mutable in-memory singleton (see `store.ts`). All query
 * functions return defensive copies so callers cannot corrupt the store.
 * Validation errors throw TypeError with English developer messages matching
 * the existing error style; illegal state-machine transitions also throw.
 */

import { getBranchById, getPackageById } from "@/lib/catalog-data";
import { getStore, resetStore } from "./store";
import type {
  EnrollmentStatus,
  Instruktur,
  Pembayaran,
  PembayaranMethod,
  PembayaranStatus,
  Sesi,
  SesiStatus,
  Siswa,
} from "./types";

export type {
  EnrollmentStatus,
  Instruktur,
  Pembayaran,
  PembayaranMethod,
  PembayaranStatus,
  Role,
  Sesi,
  SesiStatus,
  Siswa,
} from "./types";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function findById<T extends { id: string }>(
  items: T[],
  id: string,
  kind: string,
): T {
  for (const item of items) {
    if (item.id === id) return item;
  }
  throw new TypeError(`Unknown ${kind} id: ${id}`);
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

function assertDate(value: string, field: string): void {
  if (!DATE_RE.test(value)) {
    throw new TypeError(`Invalid ${field} format (expected YYYY-MM-DD): ${value}`);
  }
}

function assertTime(value: string, field: string): void {
  if (!TIME_RE.test(value)) {
    throw new TypeError(`Invalid ${field} format (expected HH:MM): ${value}`);
  }
}

/** Parse the trailing integer from an id like "sesi-005" → 5. Returns 0 on no match. */
function parseIdNum(id: string, prefix: string): number {
  const m = new RegExp(`^${prefix}-(\\d+)$`).exec(id);
  return m ? parseInt(m[1], 10) : 0;
}

/** Generate the next sequential id continuing seed numbering, zero-padded to 3 digits. */
function nextId(items: { id: string }[], prefix: string): string {
  const max = items.reduce((m, it) => Math.max(m, parseIdNum(it.id, prefix)), 0);
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

/* ------------------------------ siswa ------------------------------ */

export function getSiswa(): Siswa[] {
  return [...getStore().siswa];
}

export function getSiswaById(id: string): Siswa {
  return { ...findById(getStore().siswa, id, "siswa") };
}

export function getSiswaByBranch(branchId: string): Siswa[] {
  return getStore().siswa.filter((s) => s.branchId === branchId);
}

export function getSiswaByEnrollmentStatus(
  status: EnrollmentStatus,
): Siswa[] {
  return getStore().siswa.filter((s) => s.enrollmentStatus === status);
}

/* ---------------------------- instruktur --------------------------- */

export function getInstruktur(): Instruktur[] {
  return [...getStore().instruktur];
}

export function getInstrukturById(id: string): Instruktur {
  return { ...findById(getStore().instruktur, id, "instruktur") };
}

export function getInstrukturByBranch(branchId: string): Instruktur[] {
  return getStore().instruktur.filter((i) => i.branchId === branchId);
}

/* ------------------------------ sesi ------------------------------- */

export function getSesi(): Sesi[] {
  return [...getStore().sesi];
}

export function getSesiById(id: string): Sesi {
  return { ...findById(getStore().sesi, id, "sesi") };
}

export function getSesiByInstruktur(instrukturId: string): Sesi[] {
  return getStore().sesi.filter((s) => s.instrukturId === instrukturId);
}

export function getSesiBySiswa(siswaId: string): Sesi[] {
  return getStore().sesi.filter((s) => s.siswaId === siswaId);
}

export function getSesiByStatus(status: SesiStatus): Sesi[] {
  return getStore().sesi.filter((s) => s.status === status);
}

/* ---------------------------- pembayaran --------------------------- */

export function getPembayaran(): Pembayaran[] {
  return [...getStore().pembayaran];
}

export function getPembayaranById(id: string): Pembayaran {
  return { ...findById(getStore().pembayaran, id, "pembayaran") };
}

export function getPembayaranBySiswa(siswaId: string): Pembayaran[] {
  return getStore().pembayaran.filter((p) => p.siswaId === siswaId);
}

export function getPembayaranByStatus(status: PembayaranStatus): Pembayaran[] {
  return getStore().pembayaran.filter((p) => p.status === status);
}

/* -------------------- enrollment state machine -------------------- */

/**
 * Allowed forward transitions in the enrollment lifecycle (PRD §73):
 *   menunggu_bayar      -> menunggu_konfirmasi
 *   menunggu_konfirmasi -> terkonfirmasi
 *   terkonfirmasi       -> jadwal_dipilih
 *   jadwal_dipilih      -> selesai
 *
 * Returns the set of statuses reachable in one step from `from`.
 */
export function nextEnrollmentStatus(from: EnrollmentStatus): EnrollmentStatus[] {
  switch (from) {
    case "menunggu_bayar":
      return ["menunggu_konfirmasi"];
    case "menunggu_konfirmasi":
      return ["terkonfirmasi"];
    case "terkonfirmasi":
      return ["jadwal_dipilih"];
    case "jadwal_dipilih":
      return ["selesai"];
    case "selesai":
      return [];
  }
}

/**
 * True iff `to` is reachable in one forward step from `from` (anti-skipping
 * guard for state-machine transitions).
 */
export function canTransitionEnrollment(
  from: EnrollmentStatus,
  to: EnrollmentStatus,
): boolean {
  return nextEnrollmentStatus(from).includes(to);
}

/* ---------------------------- aggregations ------------------------- */

/**
 * Dashboard summary counts for the admin shell. Pre-computed shape so the UI
 * can render stat cards without re-deriving counts.
 */
export interface DomainSummary {
  totalSiswa: number;
  totalInstruktur: number;
  totalSesi: number;
  totalPembayaran: number;
  /** Count of siswa whose enrollment is still in-flight (not selesai). */
  siswaAktif: number;
  /** Count of payments awaiting admin verification (PRD F5). */
  pembayaranMenungguKonfirmasi: number;
  /** Count of open (non-selesai) session slots. */
  sesiTerjadwal: number;
}

export function getDomainSummary(): DomainSummary {
  const st = getStore();
  return {
    totalSiswa: st.siswa.length,
    totalInstruktur: st.instruktur.length,
    totalSesi: st.sesi.length,
    totalPembayaran: st.pembayaran.length,
    siswaAktif: st.siswa.filter((sw) => sw.enrollmentStatus !== "selesai").length,
    pembayaranMenungguKonfirmasi: st.pembayaran.filter(
      (p) => p.status === "pending",
    ).length,
    sesiTerjadwal: st.sesi.filter((ses) => ses.status !== "selesai").length,
  };
}

/* ========================== MUTATION API =========================== */

/* ------------------------------ siswa ------------------------------ */

/**
 * Patch mutable fields of an existing siswa. Only `fullName`, `packageId`, and
 * `branchId` may be changed; identity and enrollment status have their own
 * mutation functions.
 *
 * @throws TypeError — unknown id, or packageId/branchId not in catalog-data.
 */
export function updateSiswa(
  id: string,
  patch: Partial<Pick<Siswa, "fullName" | "packageId" | "branchId">>,
): Siswa {
  const st = getStore();
  const idx = st.siswa.findIndex((s) => s.id === id);
  if (idx === -1) throw new TypeError(`Unknown siswa id: ${id}`);
  if (patch.packageId !== undefined) {
    getPackageById(patch.packageId); // throws TypeError if unknown
  }
  if (patch.branchId !== undefined) {
    getBranchById(patch.branchId); // throws TypeError if unknown
  }
  st.siswa[idx] = { ...st.siswa[idx], ...patch };
  return { ...st.siswa[idx] };
}

/**
 * Advance a siswa's enrollment status by one step in the forward state machine
 * (PRD §73). Throws on illegal (backward, skip, or terminal) transitions.
 *
 * @throws TypeError — unknown siswaId, or transition not allowed by the machine.
 */
export function setEnrollmentStatus(
  siswaId: string,
  to: EnrollmentStatus,
): Siswa {
  const st = getStore();
  const idx = st.siswa.findIndex((s) => s.id === siswaId);
  if (idx === -1) throw new TypeError(`Unknown siswa id: ${siswaId}`);
  const from = st.siswa[idx].enrollmentStatus;
  if (!canTransitionEnrollment(from, to)) {
    throw new TypeError(
      `Illegal enrollment transition: ${from} -> ${to}`,
    );
  }
  st.siswa[idx] = { ...st.siswa[idx], enrollmentStatus: to };
  return { ...st.siswa[idx] };
}

/* ------------------------------ sesi ------------------------------- */

/** Input shape for `addSesi`. */
export interface AddSesiInput {
  instrukturId: string;
  branchId: string;
  /** Session date, YYYY-MM-DD. */
  date: string;
  /** Session start time, HH:MM (24-hour). */
  startTime: string;
  /** Session end time, HH:MM (24-hour). Must be after startTime. */
  endTime: string;
  /** Defaults to "tersedia". */
  status?: SesiStatus;
}

/**
 * Create a new session slot. Generates a sequential `sesi-XXX` id continuing
 * the seed numbering. Anti-bentrok/conflict checking is out of scope (issue #21).
 *
 * @throws TypeError — unknown instrukturId/branchId, invalid date/time formats,
 *   or startTime not before endTime.
 */
export function addSesi(input: AddSesiInput): Sesi {
  const st = getStore();
  if (!st.instruktur.some((i) => i.id === input.instrukturId)) {
    throw new TypeError(`Unknown instruktur id: ${input.instrukturId}`);
  }
  getBranchById(input.branchId); // throws TypeError if unknown
  assertDate(input.date, "date");
  assertTime(input.startTime, "startTime");
  assertTime(input.endTime, "endTime");
  if (input.startTime >= input.endTime) {
    throw new TypeError(
      `startTime must be before endTime: ${input.startTime} >= ${input.endTime}`,
    );
  }
  const newSesi: Sesi = {
    id: nextId(st.sesi, "sesi"),
    instrukturId: input.instrukturId,
    branchId: input.branchId,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    status: input.status ?? "tersedia",
  };
  st.sesi.push(newSesi);
  return { ...newSesi };
}

/** Patch shape for `updateSesi`. Pass `siswaId: undefined` to clear the booking. */
export interface UpdateSesiPatch {
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: SesiStatus;
  siswaId?: string;
}

/**
 * Patch an existing sesi slot. All field validations from `addSesi` apply to
 * any supplied values; the effective start/end time pair (merged with existing)
 * is re-validated. Pass `siswaId: undefined` to clear a booking reference.
 *
 * Invariants enforced:
 * - `patch.status` must be a member of `SesiStatus` (runtime guard against
 *   untyped callers — the TS type already rules out compile-time mistakes).
 * - The resulting sesi must not be `dipesan` without a `siswaId` (set either
 *   in this patch or pre-existing on the row). Violation throws TypeError.
 *
 * @throws TypeError — unknown id, invalid date/time format, unknown siswaId,
 *   invalid SesiStatus, or `dipesan` resulting state without a siswaId.
 */
export function updateSesi(id: string, patch: UpdateSesiPatch): Sesi {
  if (
    patch.status !== undefined &&
    patch.status !== "tersedia" &&
    patch.status !== "dipesan" &&
    patch.status !== "selesai"
  ) {
    throw new TypeError(`Invalid SesiStatus: ${String(patch.status)}`);
  }
  const st = getStore();
  const idx = st.sesi.findIndex((s) => s.id === id);
  if (idx === -1) throw new TypeError(`Unknown sesi id: ${id}`);
  const existing = st.sesi[idx];
  if (patch.date !== undefined) assertDate(patch.date, "date");
  if (patch.startTime !== undefined) assertTime(patch.startTime, "startTime");
  if (patch.endTime !== undefined) assertTime(patch.endTime, "endTime");
  const effectiveStart = patch.startTime ?? existing.startTime;
  const effectiveEnd = patch.endTime ?? existing.endTime;
  if (effectiveStart >= effectiveEnd) {
    throw new TypeError(
      `startTime must be before endTime: ${effectiveStart} >= ${effectiveEnd}`,
    );
  }
  if ("siswaId" in patch && patch.siswaId !== undefined) {
    if (!st.siswa.some((s) => s.id === patch.siswaId)) {
      throw new TypeError(`Unknown siswa id: ${patch.siswaId}`);
    }
  }
  // Resulting-state invariant: dipesan requires a siswaId. Evaluate against
  // the merged row so a patch that sets status without re-stating siswaId
  // still benefits from the existing value on the row.
  const effectiveStatus = patch.status ?? existing.status;
  const effectiveSiswaId =
    "siswaId" in patch ? patch.siswaId : existing.siswaId;
  if (effectiveStatus === "dipesan" && !effectiveSiswaId) {
    throw new TypeError(
      "Sesi dengan status dipesan harus memiliki siswaId.",
    );
  }
  st.sesi[idx] = { ...existing, ...patch };
  return { ...st.sesi[idx] };
}

/**
 * Remove a session slot from the store. Throws if the slot is "dipesan" —
 * booked sessions must be reassigned before deletion.
 *
 * @throws TypeError — unknown id, or sesi has status "dipesan".
 */
export function removeSesi(id: string): void {
  const st = getStore();
  const idx = st.sesi.findIndex((s) => s.id === id);
  if (idx === -1) throw new TypeError(`Unknown sesi id: ${id}`);
  if (st.sesi[idx].status === "dipesan") {
    throw new TypeError(
      `Cannot remove sesi ${id}: status is "dipesan". Reassign the booking first.`,
    );
  }
  st.sesi.splice(idx, 1);
}

/* ---------------------------- pembayaran --------------------------- */

/** Input shape for `addPembayaran`. */
export interface AddPembayaranInput {
  siswaId: string;
  packageId: string;
  amountIdr: number;
  method: PembayaranMethod;
  /** ISO 8601 string, caller-supplied (avoids server-time dependency in tests). */
  createdAt: string;
}

/**
 * Record a new payment. Status starts as "pending". Generates a sequential
 * `pembayaran-XXX` id continuing the seed numbering.
 *
 * @throws TypeError — unknown siswaId or packageId not in catalog-data.
 */
export function addPembayaran(input: AddPembayaranInput): Pembayaran {
  const st = getStore();
  if (!st.siswa.some((s) => s.id === input.siswaId)) {
    throw new TypeError(`Unknown siswa id: ${input.siswaId}`);
  }
  getPackageById(input.packageId); // throws TypeError if unknown
  const newPembayaran: Pembayaran = {
    id: nextId(st.pembayaran, "pembayaran"),
    siswaId: input.siswaId,
    packageId: input.packageId,
    amountIdr: input.amountIdr,
    method: input.method,
    status: "pending",
    createdAt: input.createdAt,
  };
  st.pembayaran.push(newPembayaran);
  return { ...newPembayaran };
}

/**
 * Approve a pending payment. Sets status to "terverifikasi" and records the
 * verifier's admin id and verification timestamp.
 *
 * @throws TypeError — unknown id, or payment is not "pending".
 */
export function verifikasiPembayaran(
  id: string,
  adminId: string,
  verifiedAt: string,
): Pembayaran {
  const st = getStore();
  const idx = st.pembayaran.findIndex((p) => p.id === id);
  if (idx === -1) throw new TypeError(`Unknown pembayaran id: ${id}`);
  if (st.pembayaran[idx].status !== "pending") {
    throw new TypeError(
      `Cannot verify pembayaran ${id}: status is "${st.pembayaran[idx].status}", expected "pending"`,
    );
  }
  st.pembayaran[idx] = {
    ...st.pembayaran[idx],
    status: "terverifikasi",
    verifiedAt,
    verifiedByAdminId: adminId,
  };
  return { ...st.pembayaran[idx] };
}

/**
 * Reject a pending payment. Sets status to "ditolak" and records the
 * verifier's admin id and rejection timestamp.
 *
 * @throws TypeError — unknown id, or payment is not "pending".
 */
export function tolakPembayaran(
  id: string,
  adminId: string,
  verifiedAt: string,
): Pembayaran {
  const st = getStore();
  const idx = st.pembayaran.findIndex((p) => p.id === id);
  if (idx === -1) throw new TypeError(`Unknown pembayaran id: ${id}`);
  if (st.pembayaran[idx].status !== "pending") {
    throw new TypeError(
      `Cannot reject pembayaran ${id}: status is "${st.pembayaran[idx].status}", expected "pending"`,
    );
  }
  st.pembayaran[idx] = {
    ...st.pembayaran[idx],
    status: "ditolak",
    verifiedAt,
    verifiedByAdminId: adminId,
  };
  return { ...st.pembayaran[idx] };
}

/* ------------------------------ store ------------------------------ */

/**
 * Restore the domain store to its pristine seed state.
 * Call in `beforeEach` in tests that exercise mutations to ensure isolation.
 */
export function resetDomainStore(): void {
  resetStore();
}
