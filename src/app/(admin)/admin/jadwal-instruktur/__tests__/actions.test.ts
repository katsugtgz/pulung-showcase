/**
 * Regression tests for jadwal-instruktur/actions.ts server-action guards.
 *
 * Covers:
 *   C3 — mapDomainError distinguishes "Unknown package" → "Paket tidak ditemukan."
 *        from "Unknown branch" → "Cabang tidak ditemukan."
 *   C4 — updateSesiAction rejects admin reschedules that would move a dipesan
 *        sesi onto a conflicting time slot for the same instruktur or siswa.
 *
 * The action calls `auth()` from Clerk; we mock it to return an admin session
 * so requireAdmin() passes. Domain state is reset between tests.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  auth: async () => ({
    userId: "user_admin_test",
    sessionClaims: {
      sub: "user_admin_test",
      metadata: { role: "admin" },
    },
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: () => {},
}));

import { resetDomainStore, addSesi, updateSesi, getSesiById } from "@/lib/domain";
import {
  mapDomainError,
  tambahSesiAction,
  updateSesiAction,
} from "../actions";

beforeEach(() => {
  resetDomainStore();
});

describe("mapDomainError (C3)", () => {
  it("maps 'Unknown branch' to 'Cabang tidak ditemukan.'", () => {
    expect(mapDomainError("Unknown branch id: cabang-hantu")).toBe(
      "Cabang tidak ditemukan.",
    );
  });

  it("maps 'Unknown package' to 'Paket tidak ditemukan.' (regression for C3)", () => {
    // Before the fix, the same branch as Unknown branch was returned.
    expect(mapDomainError("Unknown package id: paket-hantu")).toBe(
      "Paket tidak ditemukan.",
    );
  });

  it("maps 'Unknown instruktur' to 'Instruktur tidak ditemukan.'", () => {
    expect(mapDomainError("Unknown instruktur id: instruktur-999")).toBe(
      "Instruktur tidak ditemukan.",
    );
  });

  it("falls back to a generic message when no pattern matches", () => {
    expect(mapDomainError("something unexpected")).toBe(
      "Terjadi kesalahan. Coba lagi.",
    );
  });
});

describe("tambahSesiAction: end-to-end error mapping", () => {
  it("returns the mapped 'Cabang tidak ditemukan.' for an unknown branch", async () => {
    const result = await tambahSesiAction({
      instrukturId: "instruktur-001",
      branchId: "cabang-hantu",
      date: "2026-08-15",
      startTime: "09:00",
      endTime: "10:00",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Cabang tidak ditemukan.");
    }
  });
});

describe("updateSesiAction: reschedule conflict guard (C4)", () => {
  it("allows admin to reschedule a dipesan sesi to a non-conflicting slot", async () => {
    // sesi-001 seed: instruktur-001, siswa-001, 2026-07-20 09:00–10:00, dipesan.
    // Moving to 2026-08-15 (no other sesi that day) must succeed.
    const result = await updateSesiAction("sesi-001", {
      date: "2026-08-15",
    });
    expect(result.ok).toBe(true);
    expect(getSesiById("sesi-001").date).toBe("2026-08-15");
  });

  it("rejects admin reschedule that conflicts with the instruktur's other dipesan sesi", async () => {
    // Create a second dipesan slot for the same instruktur via the public API
    // (avoid reaching into the store; the invariant on addSesi would reject
    // a dipesan row without a siswaId).
    const added = addSesi({
      instrukturId: "instruktur-001",
      branchId: "gunung-anyar",
      date: "2026-07-25",
      startTime: "10:00",
      endTime: "11:00",
    });
    updateSesi(added.id, { siswaId: "siswa-002", status: "dipesan" });

    // Try to move sesi-001 onto 2026-07-25 10:30–11:30 — overlap.
    const result = await updateSesiAction("sesi-001", {
      date: "2026-07-25",
      startTime: "10:30",
      endTime: "11:30",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/instruktur/i);
    }
    expect(getSesiById("sesi-001").date).toBe("2026-07-20");
  });

  it("rejects admin reschedule that conflicts with the siswa's other dipesan sesi", async () => {
    const added = addSesi({
      instrukturId: "instruktur-002",
      branchId: "manyar",
      date: "2026-09-01",
      startTime: "09:00",
      endTime: "10:00",
    });
    updateSesi(added.id, { siswaId: "siswa-001", status: "dipesan" });

    // Try to move sesi-001 onto 2026-09-01 09:30–10:30 — siswa overlap.
    const result = await updateSesiAction("sesi-001", {
      date: "2026-09-01",
      startTime: "09:30",
      endTime: "10:30",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/siswa/i);
    }
  });

  it("does not run the reschedule guard when the patch only changes status (no time change)", async () => {
    // sesi-001 dipesan → selesai. No date/time patch → guard skipped.
    const result = await updateSesiAction("sesi-001", { status: "selesai" });
    expect(result.ok).toBe(true);
    expect(getSesiById("sesi-001").status).toBe("selesai");
  });

  it("does not run the reschedule guard on a tersedia sesi", async () => {
    // sesi-002 is tersedia — admin may freely move it.
    const result = await updateSesiAction("sesi-002", {
      date: "2026-10-01",
      startTime: "08:00",
      endTime: "09:00",
    });
    expect(result.ok).toBe(true);
  });

  it("runs the reschedule guard when a tersedia sesi is patched to dipesan with a new time", async () => {
    // sesi-002 is tersedia. Promoting it to dipesan while also moving onto
    // 2026-07-20 09:00–10:00 (overlaps sesi-001's booked slot for the same
    // instruktur) must be rejected: the resulting status is dipesan, so the
    // overlap scan runs before updateSesi applies the patch.
    const result = await updateSesiAction("sesi-002", {
      date: "2026-07-20",
      startTime: "09:00",
      endTime: "10:00",
      status: "dipesan",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/instruktur/i);
    }
    expect(getSesiById("sesi-002").status).toBe("tersedia");
  });

  it("skips the reschedule guard when a dipesan sesi is moved while flipping status to selesai", async () => {
    // sesi-001 (instruktur-001, dipesan) overlaps itself in time, but the
    // resulting status is "selesai" — no overlap concern. Combined patch
    // must succeed even though the time window technically overlaps the
    // sesi's own slot.
    const result = await updateSesiAction("sesi-001", {
      startTime: "09:30",
      endTime: "10:30",
      status: "selesai",
    });
    expect(result.ok).toBe(true);
    expect(getSesiById("sesi-001").status).toBe("selesai");
    expect(getSesiById("sesi-001").startTime).toBe("09:30");
  });

  it("maps the missing-siswaId invariant to a clear assignment prompt, not 'already booked'", async () => {
    // Promoting a tersedia slot to dipesan without siswaId triggers the
    // resulting-state invariant in updateSesi. The user-facing message must
    // guide the admin toward assigning a siswa, not imply the slot is taken.
    const result = await updateSesiAction("sesi-002", {
      status: "dipesan",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/siswa/i);
      expect(result.error).not.toMatch(/sudah dipesan/i);
    }
  });
});

describe("mapDomainError: missing-siswaId invariant", () => {
  it("maps 'harus memiliki siswaId' to the assignment prompt", () => {
    expect(mapDomainError("Sesi dengan status dipesan harus memiliki siswaId.")).toBe(
      "Sesi berstatus dipesan harus memiliki siswa. Tetapkan siswa terlebih dahulu.",
    );
  });
});
