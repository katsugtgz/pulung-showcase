# src/lib — module-per-feature domain layer

10 typed modules. Every module = folder with `index.ts` (barrel/query API) + `types.ts` + `data.ts`/`store.ts` (PRIVATE) + `__tests__/`. **Consumers never import from `data.ts`/`store.ts` — only from the barrel.** Total ~2.3k LOC + ~2.4k LOC tests.

## STRUCTURE + DEPENDENCY LAYERS

```
Layer 0 (root, no deps):
  catalog-data/        # ⭐ business source of truth (packages/clusters/branches/socials)
  format/              # formatIDR + formatDate (Indonesian, ICU-independent)

Layer 1 (depends on L0):
  domain/              # ⭐ operational store (siswa/instruktur/sesi/pembayaran) + state machine
  wa-router/           # ⚠️ CRITICAL WhatsApp cluster routing (real business bug if wrong)
  maps-reviews/        # Google Maps rating/testimonials from committed snapshot.json

Layer 2 (depends on L1):
  jadwal-booking/      # anti-bentrok scheduling (depends on domain)
  pembayaran-flow/     # QRIS payment orchestration (depends on domain + catalog-data)
  copy/                # Indonesian landing copy (depends on maps-reviews for testimonials)

Layer 3 (depends on L2):
  pdf/                 # brand.ts + invoice.ts + kartu-siswa.ts (depends on domain + catalog-data + format)
  excel-export/        # generateSiswaXlsx / generateJadwalXlsx / generatePembayaranXlsx
```

## WHERE TO LOOK

| Task | Module | Entry |
|---|---|---|
| Change a price / branch / WA number | `catalog-data` | `data.ts` ONLY — every consumer re-derives |
| Add a siswa/instruktur/sesi/pembayaran mutation | `domain` | `index.ts` — keep state-machine invariants |
| Add a booking rule (anti-bentrok) | `jadwal-booking` | `index.ts::cekBentrok` — single chokepoint for siswa + admin paths |
| Add a payment state transition | `pembayaran-flow` | `index.ts` — keep idempotent on retry |
| Build a `wa.me` link | `wa-router` | `buildWhatsAppLink({branchId, packageId?, transmission?})` |
| Add an Indonesian copy string | `copy` | `data.ts` — tag `// TODO: verify owner` if unverified |
| Refresh Google reviews | `maps-reviews` | `node scripts/fetch-maps-reviews.mjs` (SerpAPI key, manual) |
| Add a PDF document | `pdf` | new file reusing `brand.ts`; follow `kartu-siswa.ts` pattern |
| Add an Excel export | `excel-export` | `index.ts`; brand blue ARGB `FF1E6FB8` for header fill |

## CRITICAL MODULES (highest blast radius)

### `catalog-data/` — business source of truth
- **Read-only.** Packages, clusters, branches, social posts. 3 packages, 2 clusters, 5 branches.
- **`priceIsDummy: true`** on every package — UI must show "*harga contoh".
- `*ById` lookups **throw TypeError** on unknown id (callers surface as 404).
- All array returns are fresh copies (defensive).
- 172-line test asserts the literal WA phone numbers.

### `wa-router/` — WhatsApp cluster routing (⚠️ REAL BUSINESS BUG if wrong)
- **Cluster A** (MERR/South: gunung-anyar, pandugo, juanda) → `+62 851-0087-0957`
- **Cluster B** (Manyar/Central: manyar, pucang) → `+62 812-3253-1989`
- 3/2 branch split verified by per-branch parametrised test.
- Prefilled Indonesian message template includes transmission phrase + branch name + cluster region.
- Only consumer: `src/components/landing/location-picker.tsx` + `hero.tsx`.

### `domain/` — operational store (largest module)
- In-memory `globalThis["__pulung_domain_store__"]` singleton, HMR-safe, `resetDomainStore()` for tests.
- **Enrollment state machine (forward-only):** `menunggu_bayar → menunggu_konfirmasi → terkonfirmasi → jadwal_dipilih → selesai`. Backward/skip/terminal throws TypeError.
- **Payment lifecycle:** `pending → terverifikasi | ditolak`. Verify/reject non-pending throws.
- **Sesi `dipesan` invariant:** MUST carry `siswaId`; cannot be deleted (reassign first).
- **Date/time validation:** `YYYY-MM-DD` and `HH:MM` regex; `startTime < endTime` enforced.
- **FK integrity:** mutations re-validate `packageId`/`branchId` via catalog-data lookups.
- **Sequential zero-padded ids:** `sesi-006`, `pembayaran-006`, etc.
- 488-line `index.ts` (4 sections: siswa/instruktur/sesi/pembayaran) + 480-line mutation test.

### `jadwal-booking/` — anti-bentrok engine
- 3 conflict types checked in order: `slot_tidak_tersedia` → `instruktur_overlap` → `siswa_overlap`.
- **Boundary-touching is NOT a conflict** — strict `<` comparison. 10:00–11:00 + 11:00–12:00 are compatible.
- Booking auto-advances enrollment `terkonfirmasi → jadwal_dipilih`.
- `pindahkanSesi` filters out source slot to avoid false conflict.

## CONVENTIONS

- **Module-per-feature folders** — never flat files in `lib/`. Every module has its own `__tests__/`.
- **Barrel-only public API** — `data.ts`/`store.ts` are private; never `import { x } from "@/lib/<mod>/data"`.
- **Pure data modules use no mocks** — tests import real `catalog-data` and assert on seeded values.
- **`resetDomainStore()` in `beforeEach`** for any test exercising mutations.
- **TypeError-on-unknown-id** is the universal error convention.
- **Fresh-array-copy invariant** explicitly tested for every getter.
- **Indonesian test descriptions** for domain logic; English for pure-data critical-path tests.
- **Mocks only when unavoidable**: jsdom gaps (`IntersectionObserver`), Node 24 `localStorage`, Next.js Server Actions.

## ANTI-PATTERNS

- **Never hardcode branch/WA/price data in UI** — only via `catalog-data`. AGENTS.md calls wrong WA routing a real business bug.
- **Never read from `domain/store.ts` directly** — go through `index.ts`. The `as unknown as DomainStore` cast inside `store.ts` is the *only* sanctioned cast in the repo (documented inline).
- **Never resolve `// TODO: verify owner` markers** in `copy/data.ts` with invented values.
- **Never edit `maps-reviews/snapshot.json` by hand** — regenerate via `scripts/fetch-maps-reviews.mjs` (SerpAPI).
- **Never bypass the enrollment state machine** — always go through `nextEnrollmentStatus` / `canTransitionEnrollment`.

## NOTES

- **`copy ↔ maps-reviews` circular dependency** (type-only one way, runtime the other). TypeScript erases types at runtime — works fine in a single package. If splitting packages, move `TestimonialEntry` to a neutral `src/lib/types`.
- **All QRIS payment is mocked** — `pembayaran-flow` records status only, no real gateway.
- **`domain/data.ts` seed is `as const`** — mutations need the `as unknown as DomainStore` cast in `store.ts` to widen to writable interface (documented; not slop).
- **PDF content tests are shallow** — only magic header + page count; don't verify siswa name/price appears in rendered bytes. Manual QA via `agent-browser` covers visual.
- **Refactor candidates** (LOW priority): split 488-line `domain/index.ts` into `domain/{siswa,instruktur,sesi,pembayaran}.ts` re-exported via `index.ts`. Cosmetic.
