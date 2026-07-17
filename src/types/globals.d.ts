/**
 * Global TypeScript augmentations for the Pulung app.
 *
 * 1. `Role` — single source of truth for the custom RBAC roles. Backed by
 *    Clerk `publicMetadata.role` (NOT Clerk Organizations). `admin` = Pulung
 *    staff with dashboard access; `siswa` = enrolled student with the student
 *    app. The `domain` module and server actions import `Role` from here.
 *
 * 2. `CustomJwtSessionClaims` augmentation — exposes the user's publicMetadata
 *    as a typed top-level `metadata` field on Clerk JWT session claims. This
 *    requires a one-time Clerk Dashboard config (Sessions → Customize session
 *    token → Claims editor):
 *
 *        { "metadata": "{{user.public_metadata}}" }
 *
 *    After that, `sessionClaims?.metadata?.role` is typed as
 *    `'admin' | 'siswa' | undefined` everywhere `auth()` is called
 *    (middleware, server components, server actions). See:
 *    https://clerk.com/docs/guides/secure/basic-rbac
 */

export type Role = "admin" | "siswa";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Role;
    };
  }
}
