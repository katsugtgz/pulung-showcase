import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getPembayaranById } from "@/lib/domain";
import { generateInvoicePdf, invoiceNumber } from "@/lib/pdf/invoice";
import { getMySiswaId } from "@/lib/auth/siswa-id";

/*
 * GET /app/invoice/[pembayaranId]/unduh — serves the invoice as a downloadable PDF.
 *
 * Auth: same env-gated Clerk pattern as /app/kartu/unduh. If Clerk keys are
 * absent (local dev / build pre-render), the auth check is skipped so the
 * build succeeds. Live role verification is done by the layout + proxy.
 *
 * Demo: in development the signed-in user is mapped to seed siswa "siswa-001";
 * in production the siswa id is derived from the Clerk userId. A real
 * implementation would resolve clerkUserId → siswaId via DB.
 *
 * Guards:
 *   1. 404 via notFound() if pembayaranId is unknown.
 *   2. 403 if the pembayaran does not belong to the calling siswa OR is not
 *      terverifikasi — no invoice for pending/rejected payments.
 */

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pembayaranId: string }> },
): Promise<NextResponse> {
  let userId: string | null = null;
  if (clerkEnabled) {
    const clerkAuth = await auth();
    userId = clerkAuth.userId;
    if (!userId) redirect("/sign-in");
  }

  const siswaId = getMySiswaId(userId);
  const { pembayaranId } = await params;

  // 404 on unknown id — getPembayaranById throws TypeError; map to notFound().
  let pembayaran;
  try {
    pembayaran = getPembayaranById(pembayaranId);
  } catch {
    notFound();
  }

  // 403 if not the calling siswa's payment.
  if (pembayaran.siswaId !== siswaId) {
    return new NextResponse("Akses ditolak: pembayaran tidak ditemukan", {
      status: 403,
    });
  }

  // 403 if payment is not yet verified.
  if (pembayaran.status !== "terverifikasi") {
    return new NextResponse(
      "Invoice hanya tersedia untuk pembayaran yang telah diverifikasi",
      { status: 403 },
    );
  }

  const bytes = await generateInvoicePdf(pembayaranId);

  // Derive safe filename: INV/2026/001 → invoice-INV-2026-001.pdf
  const invNum = invoiceNumber(pembayaran);
  const safeName = `invoice-${invNum.replace(/\//g, "-")}.pdf`;

  // Buffer.from() satisfies BodyInit across all TS/Node versions; the raw
  // Uint8Array<ArrayBufferLike> generic trips TS 5.9.3's strict body checks.
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}"`,
    },
  });
}
