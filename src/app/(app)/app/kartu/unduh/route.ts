import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getSiswaById } from "@/lib/domain";
import { generateKartuSiswaPdf } from "@/lib/pdf/kartu-siswa";

/*
 * GET /app/kartu/unduh — serves the student's kartu siswa as a downloadable PDF.
 *
 * Auth: same env-gated Clerk pattern as the (app) layout. If Clerk keys are
 * absent (local dev / build pre-render), the auth check is skipped so the
 * build succeeds. Live role verification is done by the layout + proxy.
 *
 * Demo convention: the signed-in user is always mapped to siswa-001 for the
 * prototype. A real implementation would resolve clerkUserId → siswaId via DB.
 *
 * Enrollment gate: statuses that precede admin confirmation block PDF download
 * with a 403 so the route and the preview page stay in sync.
 */

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

// Statuses that do not yet have a confirmed enrollment → block download.
const BLOCKED_STATUSES = new Set(["menunggu_bayar", "menunggu_konfirmasi"]);

// Demo mapping — same convention as /app/page.tsx.
const DEMO_SISWA_ID = "siswa-001";

export async function GET(): Promise<NextResponse> {
  if (clerkEnabled) {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");
  }

  const siswa = getSiswaById(DEMO_SISWA_ID);

  if (BLOCKED_STATUSES.has(siswa.enrollmentStatus)) {
    return new NextResponse(
      "Kartu tersedia setelah pendaftaran terkonfirmasi",
      { status: 403 },
    );
  }

  const bytes = await generateKartuSiswaPdf(DEMO_SISWA_ID);

  // Buffer.from() satisfies BodyInit across all TS/Node versions; the raw
  // Uint8Array<ArrayBufferLike> generic trips TS 5.9.3's strict body checks.
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="kartu-siswa-pulung.pdf"',
    },
  });
}
