# Pulung — Driving School Platform

Full-stack web platform for a driving school in Surabaya, Indonesia: public marketing site, student enrollment and scheduling, mock QRIS payments, and a complete admin back office.

**Live demo:** https://pulung.vercel.app

## Features

- Role-based access control with Clerk (admin and student roles enforced at the edge, layout, and server-action level)
- Student dashboard: lesson scheduling with conflict detection, downloadable student ID card, and payment history
- Course catalog with per-package syllabus pages and an enrollment flow
- Mock QRIS payment flow with admin-side payment confirmation
- PDF invoice and student-card generation, downloadable from the app
- Admin dashboard: student management, instructor and student schedule management with clash prevention, and Excel export
- Branch-aware WhatsApp routing that pre-fills contact messages per location and transmission choice
- Mobile-first landing page with localized Indonesian copy, FAQ, testimonials, and branch selector

## Tech Stack

- **Framework:** Next.js 16 (App Router, React Server Components), React 19
- **Language:** TypeScript (strict mode)
- **Auth:** Clerk (custom role metadata)
- **Styling:** Tailwind CSS 4 (CSS-first `@theme`)
- **Documents:** pdf-lib (invoices, student cards), ExcelJS (admin exports)
- **Testing:** Vitest + Testing Library
- **Tooling:** pnpm, Node.js 24 LTS

## Getting Started

### Prerequisites

- Node.js 24 LTS
- pnpm
- A [Clerk](https://clerk.com) application (free tier works)

### Install and run

```bash
pnpm install
cp .env.example .env.local
pnpm dev   # http://localhost:3000
```

### Environment variables

Set these in `.env.local` (see `.env.example` for details):

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in route (default `/sign-in`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up route (default `/sign-up`) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Post-sign-in redirect (default `/dashboard`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Post-sign-up redirect (default `/dashboard`) |

The app builds without Clerk keys (auth is env-gated), but sign-in and the protected dashboards require them.

### Tests and build

```bash
pnpm test    # Vitest unit tests
pnpm build   # production build with strict type checking
```

## Project Structure

| Path | Contents |
|---|---|
| `src/app/` | App Router routes in four groups: public, protected, student (`/app`), admin (`/admin`) |
| `src/lib/` | Feature modules (catalog data, scheduling, PDF, Excel export, WhatsApp routing) |
| `src/components/` | Landing sections and shared UI |
| `docs/` | Product requirements, guides, and business data |
| `DECISIONS.md` | Architecture decision records |

## License

MIT — see [LICENSE](LICENSE).
