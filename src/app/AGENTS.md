# src/app — App Router + RBAC

4 route groups. Auth is **defense-in-depth**: `src/proxy.ts` edge regex → group `layout.tsx` re-check → per-action `requireAdmin()`. All env-gated to pass-through when `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is unset (keyless scaffold).

## STRUCTURE

```
src/app/
├── layout.tsx                # Root — NO ClerkProvider (ADR-002); Inter font + SEO copy from @/lib/copy
├── globals.css               # Tailwind 4 CSS-first @theme (brand palette + .t-reveal motion tokens)
├── icon.svg
├── (public)/                 # NO AUTH
│   ├── page.tsx              # / — landing (composes 10 sections from @/components/landing)
│   ├── sign-in/[[...sign-in]]/page.tsx    # wraps <SignIn/> in <AuthProvider>
│   └── sign-up/[[...sign-up]]/page.tsx
├── (protected)/              # PLAIN AUTH — auth.protect() (no role gate)
│   ├── layout.tsx
│   ├── dashboard/page.tsx
│   └── catalog/
│       ├── page.tsx                                   # /catalog — package list
│       └── [packageId]/
│           ├── page.tsx                               # generateStaticParams
│           └── payment/{page.tsx, actions.ts, PayButton.tsx}   # QRIS mock payment
├── (app)/app/                # ROLE = "siswa"
│   ├── layout.tsx                                       # sessionClaims.metadata.role === "siswa"
│   ├── page.tsx                                         # siswa dashboard (DEMO_SISWA_ID = "siswa-001")
│   ├── jadwal/{page.tsx, actions.ts, components.tsx}    # BookableSlotList, MyBookingList
│   ├── invoice/[pembayaranId]/unduh/route.ts           # PDF route handler (env-gated Clerk)
│   ├── kartu/{page.tsx, unduh/route.ts}                # student card PDF
│   └── cara-pakai/page.tsx
└── (admin)/admin/            # ROLE = "admin"
    ├── layout.tsx                                       # sessionClaims.metadata.role === "admin"
    ├── page.tsx + onboarding-checklist.tsx              # dashboard shell + localStorage-dismissed checklist
    ├── actions.ts                                       # setRole / removeRole via clerkClient
    ├── pembayaran-actions.ts                            # konfirmasi/tolak pembayaran (kebab-case, inconsistent)
    ├── siswa/{page.tsx, [id]/page.tsx, actions.ts, edit-form.tsx, advance-status-form.tsx, enrollment-labels.ts}
    ├── jadwal-instruktur/{page.tsx, actions.ts, components.tsx, labels.ts}
    ├── jadwal-siswa/{page.tsx, actions.ts, components.tsx}
    └── ekspor/{page.tsx, unduh/[jenis]/route.ts}        # jenis ∈ siswa|jadwal|pembayaran
```

## WHERE TO LOOK

| Task | Location |
|---|---|
| Add an admin page | `src/app/(admin)/admin/<feature>/` — must use `requireAdmin()` in actions |
| Add a siswa page | `src/app/(app)/app/<feature>/` — must use `DEMO_SISWA_ID` (until real clerkUserId binding) |
| Add a plain-auth page | `src/app/(protected)/<feature>/` — accessible to ANY signed-in user |
| Add a public page | `src/app/(public)/<feature>/` — no auth, must NOT mount ClerkProvider |
| Add a PDF/Excel download | route handler with env-gated Clerk + `Buffer.from(bytes)` for BodyInit |
| Wire a server action | co-located `actions.ts`; uniform return `{ ok: true } \| { ok: false; error }` |

## CONVENTIONS

- **Group folder name is arbitrary; inner folder is the URL.** `(admin)` group → `/admin/*` actual path. RBAC enforced by `layout.tsx` + `proxy.ts` regex — NOT by group folder name.
- **Matcher in `src/proxy.ts` is an allowlist.** Every new auth-touching route MUST be added to `config.matcher` (`⚠️ WAJIB` comment) or it 500s at runtime. Currently covers `/dashboard`, `/catalog`, `/app`, `/admin`, `/sign-in`, `/sign-up`, `/(api|trpc)(.*)`, `/__clerk`. **`/` is deliberately absent** so the public landing ships zero Clerk JS (avoids dev-handshake Lighthouse penalty).
- **Wrong-role redirect → `/`** (not `/sign-in`) — avoids Clerk bouncing signed-in users back into redirect loops.
- **`page.tsx` is a Server Component** reading domain/catalog data; passes to co-located `"use client"` component (`components.tsx` / `*-form.tsx` / `PayButton.tsx`). Server actions live in sibling `actions.ts`.
- **No shared shell/sidebar component.** Every authenticated page re-implements its inline header (`<UserButton/>` + "Panel Admin"/"Area Siswa" eyebrow + "Kembali ke beranda" footer). Biggest DRY opportunity if refactoring.

## ANTI-PATTERNS

- **Never wrap root `layout.tsx` in `<ClerkProvider>`** — ADR-002 explicitly removed it for Lighthouse. Use `<AuthProvider>` inside group layouts only.
- **Never trust the layout guard alone** — server actions in `(admin)/*/actions.ts` MUST re-call `requireAdmin()` themselves (defense-in-depth).
- **Never run `auth.protect()` in `(app)` or `(admin)` layouts** — that's Organizations-only. Use `await auth()` + manual `sessionClaims.metadata.role` check.
- **Naming inconsistency**: `(admin)/admin/pembayaran-actions.ts` is kebab-case while every other actions file is plain `actions.ts`. Match the `actions.ts` convention when adding new files.

## NOTES

- **`DEMO_SISWA_ID = "siswa-001"`** is hardcoded in ≥4 `(app)/app/*` routes. Real `clerkUserId → siswaId` binding is a deferred epic — flag before any production path.
- **`requireAdmin()` helper is duplicated across `(admin)/admin/*/actions.ts`** — extract to `@/lib/auth-guards` once a third caller appears.
- **PDF/Excel route handlers** all use `Buffer.from(bytes)` to satisfy TS 5.9.3 BodyInit (raw `Uint8Array<ArrayBufferLike>` trips strict body checks).
- **`(protected)` is the only group using `auth.protect()`** — others use `await auth()` + role check. Different mechanisms for "any signed-in user" vs "specific role".
