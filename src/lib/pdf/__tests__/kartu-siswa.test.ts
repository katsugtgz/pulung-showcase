import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { generateKartuSiswaPdf } from "../kartu-siswa";

describe("generateKartuSiswaPdf", () => {
  it("returns bytes starting with the %PDF magic header", async () => {
    const bytes = await generateKartuSiswaPdf("siswa-001");
    const magic = new TextDecoder().decode(bytes.slice(0, 4));
    expect(magic).toBe("%PDF");
  });

  it("throws TypeError for an unknown siswa id", async () => {
    await expect(generateKartuSiswaPdf("siswa-999")).rejects.toThrow(
      TypeError,
    );
  });

  it("produces a non-trivial byte length (> 1 000 bytes)", async () => {
    // pdf-lib uses standard PDF fonts (referenced by name, not embedded as
    // binary data), so file sizes are compact — still well above a trivial
    // empty-document baseline.
    const bytes = await generateKartuSiswaPdf("siswa-001");
    expect(bytes.byteLength).toBeGreaterThan(1_000);
  });

  it("generates exactly one page", async () => {
    const bytes = await generateKartuSiswaPdf("siswa-001");
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(1);
  });

  it("works for every seeded siswa id (siswa-001 through siswa-005)", async () => {
    for (const id of ["siswa-001", "siswa-002", "siswa-003", "siswa-004", "siswa-005"]) {
      const bytes = await generateKartuSiswaPdf(id);
      expect(bytes.byteLength).toBeGreaterThan(1_000);
    }
  });
});
