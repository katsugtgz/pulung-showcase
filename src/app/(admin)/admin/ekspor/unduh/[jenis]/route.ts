import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import {
  generateSiswaXlsx,
  generateJadwalXlsx,
  generatePembayaranXlsx,
} from "@/lib/excel-export";

/*
 * GET /admin/ekspor/unduh/[jenis] — serves admin Excel exports as .xlsx downloads.
 *
 * jenis: siswa | jadwal | pembayaran  (anything else → 404)
 *
 * Auth: env-gated Clerk pattern (same as /app/kartu/unduh/route.ts). When
 * Clerk keys are absent (local dev / build pre-render) the auth check is
 * skipped so `pnpm build` succeeds. In production, callers must carry a
 * valid Clerk session with metadata.role === "admin"; any other role (or no
 * session) gets a 403 with an Indonesian message.
 *
 * The /admin/:path* matcher in proxy.ts already blocks unauthenticated users
 * at the middleware layer, so this guard is a defence-in-depth check specific
 * to the download artifact.
 *
 * Buffer.from() satisfies BodyInit across all TS/Node versions; the raw
 * Uint8Array<ArrayBufferLike> generic trips TS 5.9.3's strict body checks.
 */

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

const VALID_JENIS = new Set(["siswa", "jadwal", "pembayaran"]);

type Jenis = "siswa" | "jadwal" | "pembayaran";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jenis: string }> },
): Promise<NextResponse> {
  const { jenis } = await params;

  // 404 for unknown export types.
  if (!VALID_JENIS.has(jenis)) {
    notFound();
  }

  // Admin-only guard (env-gated).
  if (clerkEnabled) {
    const { sessionClaims } = await auth();
    if (sessionClaims?.metadata?.role !== "admin") {
      return new NextResponse(
        "Akses ditolak: hanya admin yang dapat mengunduh data ekspor.",
        { status: 403 },
      );
    }
  }

  const type = jenis as Jenis;

  let bytes: Uint8Array;
  switch (type) {
    case "siswa":
      bytes = await generateSiswaXlsx();
      break;
    case "jadwal":
      bytes = await generateJadwalXlsx();
      break;
    case "pembayaran":
      bytes = await generatePembayaranXlsx();
      break;
  }

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="pulung-${type}.xlsx"`,
    },
  });
}
