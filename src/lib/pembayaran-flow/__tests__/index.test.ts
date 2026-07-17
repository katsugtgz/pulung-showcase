import { beforeEach, describe, expect, it } from "vitest";
import {
  bayarQris,
  konfirmasiPembayaran,
  tolakPembayaranFlow,
} from "../index";
import {
  getPembayaranById,
  getSiswaById,
  resetDomainStore,
} from "@/lib/domain";

// siswa-005 (Andi Wijaya) starts at enrollmentStatus "menunggu_bayar"
// with packageId "paket-matic" — ideal for testing the full state machine.
const SISWA_ID = "siswa-005";
const PACKAGE_ID = "paket-matic";
const CREATED_AT_1 = "2026-07-17T10:00:00.000Z";
const CREATED_AT_2 = "2026-07-17T12:00:00.000Z";
const VERIFIED_AT = "2026-07-17T11:00:00.000Z";
const ADMIN_ID = "admin-test-001";

beforeEach(() => {
  resetDomainStore();
});

describe("bayarQris", () => {
  it("creates a pending QRIS payment with the correct package price", () => {
    const { pembayaranId } = bayarQris(SISWA_ID, PACKAGE_ID, CREATED_AT_1);
    const p = getPembayaranById(pembayaranId);
    expect(p.status).toBe("pending");
    expect(p.method).toBe("qris");
    expect(p.siswaId).toBe(SISWA_ID);
    expect(p.packageId).toBe(PACKAGE_ID);
    // paket-matic priceIdr = 1_750_000
    expect(p.amountIdr).toBe(1_750_000);
  });

  it("advances enrollment menunggu_bayar → menunggu_konfirmasi on first payment", () => {
    expect(getSiswaById(SISWA_ID).enrollmentStatus).toBe("menunggu_bayar");
    bayarQris(SISWA_ID, PACKAGE_ID, CREATED_AT_1);
    expect(getSiswaById(SISWA_ID).enrollmentStatus).toBe("menunggu_konfirmasi");
  });

  it("does not re-advance enrollment on retry (no-op when already past menunggu_bayar)", () => {
    // First payment advances enrollment to menunggu_konfirmasi
    bayarQris(SISWA_ID, PACKAGE_ID, CREATED_AT_1);
    expect(getSiswaById(SISWA_ID).enrollmentStatus).toBe("menunggu_konfirmasi");

    // Retry: enrollment should not regress or throw
    bayarQris(SISWA_ID, PACKAGE_ID, CREATED_AT_2);
    expect(getSiswaById(SISWA_ID).enrollmentStatus).toBe("menunggu_konfirmasi");
  });

  it("throws TypeError for unknown siswaId", () => {
    expect(() => bayarQris("siswa-unknown", PACKAGE_ID, CREATED_AT_1)).toThrow(
      TypeError,
    );
  });

  it("throws TypeError for unknown packageId", () => {
    expect(() =>
      bayarQris(SISWA_ID, "paket-unknown", CREATED_AT_1),
    ).toThrow(TypeError);
  });
});

describe("happy path: pending → terverifikasi including enrollment side-effect", () => {
  it("marks the payment as terverifikasi and advances enrollment to terkonfirmasi", () => {
    const { pembayaranId } = bayarQris(SISWA_ID, PACKAGE_ID, CREATED_AT_1);
    expect(getSiswaById(SISWA_ID).enrollmentStatus).toBe("menunggu_konfirmasi");

    konfirmasiPembayaran(pembayaranId, ADMIN_ID, VERIFIED_AT);

    const p = getPembayaranById(pembayaranId);
    expect(p.status).toBe("terverifikasi");
    expect(p.verifiedByAdminId).toBe(ADMIN_ID);
    expect(p.verifiedAt).toBe(VERIFIED_AT);

    expect(getSiswaById(SISWA_ID).enrollmentStatus).toBe("terkonfirmasi");
  });
});

describe("tolak then retry produces a new pending payment", () => {
  it("creates a distinct new pending record after rejection", () => {
    const { pembayaranId: firstId } = bayarQris(
      SISWA_ID,
      PACKAGE_ID,
      CREATED_AT_1,
    );

    tolakPembayaranFlow(firstId, ADMIN_ID, VERIFIED_AT);
    expect(getPembayaranById(firstId).status).toBe("ditolak");

    // Enrollment is not reset — siswa stays at menunggu_konfirmasi
    expect(getSiswaById(SISWA_ID).enrollmentStatus).toBe("menunggu_konfirmasi");

    // Retry: creates a brand-new pending payment
    const { pembayaranId: secondId } = bayarQris(
      SISWA_ID,
      PACKAGE_ID,
      CREATED_AT_2,
    );
    expect(firstId).not.toBe(secondId);

    const p2 = getPembayaranById(secondId);
    expect(p2.status).toBe("pending");
    expect(p2.createdAt).toBe(CREATED_AT_2);
  });
});

describe("illegal double-confirm throws", () => {
  it("throws TypeError if the payment is already terverifikasi", () => {
    const { pembayaranId } = bayarQris(SISWA_ID, PACKAGE_ID, CREATED_AT_1);

    // First confirmation succeeds
    konfirmasiPembayaran(pembayaranId, ADMIN_ID, VERIFIED_AT);
    expect(getPembayaranById(pembayaranId).status).toBe("terverifikasi");

    // Second confirmation must throw
    expect(() =>
      konfirmasiPembayaran(pembayaranId, ADMIN_ID, CREATED_AT_2),
    ).toThrow(TypeError);
  });

  it("throws TypeError if the payment is already ditolak", () => {
    const { pembayaranId } = bayarQris(SISWA_ID, PACKAGE_ID, CREATED_AT_1);
    tolakPembayaranFlow(pembayaranId, ADMIN_ID, VERIFIED_AT);

    expect(() =>
      konfirmasiPembayaran(pembayaranId, ADMIN_ID, CREATED_AT_2),
    ).toThrow(TypeError);
  });
});
