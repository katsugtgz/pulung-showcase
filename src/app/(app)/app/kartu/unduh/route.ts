import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getSiswaById } from "@/lib/domain";
import { generateKartuSiswaPdf } from "@/lib/pdf/kartu-siswa";
import { getMySiswaId } from "@/lib/auth/siswa-id";

/*
 * GET /app/kartu/unduh — serves the student's kartu siswa as a downloadable PDF.
 *
 * Auth: same env-gated Clerk pattern as the (app) layout. If Clerk keys are
 * absent (local dev / build pre-render), the auth check is skipped so the
 * build succeeds. Live role verification is done by the layout + proxy.
 *
 * Demo: in development the signed-in user is mapped to seed siswa "siswa-001";
 * in production the siswa id is derived from the Clerk userId. A real
 * implementation would resolve clerkUserId → siswaId via DB.
 *
 * Enrollment gate: statuses that precede admin confirmation block PDF download
 * with a 403 so the route and the preview page stay in sync.
 */

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

// Statuses that do not yet have a confirmed enrollment → block download.
const BLOCKED_STATUSES = new Set(["menunggu_bayar", "menunggu_konfirmasi"]);

export async function GET(): Promise<NextResponse> {
  let userId: string | null = null;
  if (clerkEnabled) {
    const clerkAuth = await auth();
    userId = clerkAuth.userId;
    if (!userId) redirect("/sign-in");
  }

  const siswaId = getMySiswaId(userId);
  // Fail-closed 404 if siswa lookup misses (see siswa-id.ts TODO(prodmigration)).
  let siswa;
  try {
    siswa = getSiswaById(siswaId);
  } catch {
    return new NextResponse("Data siswa tidak ditemukan", { status: 404 });
  }

  if (BLOCKED_STATUSES.has(siswa.enrollmentStatus)) {
    return new NextResponse(
      "Kartu tersedia setelah pendaftaran terkonfirmasi",
      { status: 403 },
    );
  }

  const bytes = await generateKartuSiswaPdf(siswaId);

  // Buffer.from() satisfies BodyInit across all TS/Node versions; the raw
  // Uint8Array<ArrayBufferLike> generic trips TS 5.9.3's strict body checks.
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="kartu-siswa-pulung.pdf"',
    },
  });
}
