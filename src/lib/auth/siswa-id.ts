/**
 * Resolve the demo siswa id for the currently signed-in Clerk user.
 *
 * PARTIAL FIX (bug C10): the previous code hardcoded `DEMO_SISWA_ID = "siswa-001"`
 * across every page and route, so every signed-in user shared one siswa
 * identity. This helper centralises the mapping and splits it by environment:
 *
 * - In development (`NODE_ENV !== "production"`) it keeps the legacy demo
 *   behaviour and returns `"siswa-001"` so the seeded data renders unchanged.
 * - In production it derives a deterministic, per-user siswa id from the
 *   Clerk userId: `siswa-clerk-${userId}`. Two different Clerk users no
 *   longer collide on the same siswa row.
 *
 * This is still a placeholder: a real production deployment must look the
 * siswa up in the siswa table (by `clerkUserId`) and 404 when the binding
 * does not exist. That lookup is a later epic — see DECISIONS.md.
 *
 * @param userId  Clerk user id of the signed-in user (`null` only in pre-auth
 *                contexts where a siswa id is not yet meaningful).
 */
export function getMySiswaId(userId: string | null): string {
  if (process.env.NODE_ENV !== "production") {
    return "siswa-001";
  }
  return `siswa-clerk-${userId ?? "anonymous"}`;
}
