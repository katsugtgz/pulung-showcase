# Pulung — Demo Sistem Kursus Mengemudi

Prototipe web untuk **Kursus Mengemudi Pulung** (Surabaya, berdiri 2000): landing page mobile-first, pendaftaran siswa, katalog paket, pembayaran QRIS (mock), sampai dashboard admin — sesuai [PRD proposal](docs/prd-proposal-aligned.md).

## Fitur

**Sudah jalan (sisi publik & siswa)**

- Landing page lengkap: hero, paket & harga, pilih lokasi cabang, testimoni, FAQ, footer — semua copy Bahasa Indonesia dari modul copy ber-type.
- Routing WhatsApp per cluster cabang (MERR/Selatan vs Manyar/Pusat) + pesan CTA yang terisi otomatis sesuai pilihan transmisi.
- Auth Clerk (sign-in/up bertema brand) dengan area aplikasi terproteksi.
- Katalog kursus + halaman detail silabus.
- Alur enrollment dengan mock pembayaran QRIS.

**Sedang dikerjakan** (lihat [issues](../../issues))

- Chatbot "Tanya Pulung" (Gemini) di landing page.
- Dashboard admin: kelola siswa, jadwal instruktur & siswa (anti-bentrok), konfirmasi bayar, invoice otomatis, kartu siswa PDF, ekspor Excel.
- SEO meta + deploy demo ke Vercel.

## Tech stack

Next.js 16 · React 19 · Tailwind CSS 4 (CSS-first `@theme`) · Clerk · Vitest · pnpm · Node 24 LTS. Versi dipin persis — alasan keputusan penting (mis. TypeScript ditahan di 5.9.x) ada di [DECISIONS.md](DECISIONS.md).

## Menjalankan lokal

```bash
pnpm install
cp .env.example .env.local   # isi kunci Clerk & Gemini
pnpm dev                     # http://localhost:3000
```

## Quality gates (jalankan lokal)

> ⚠️ CI GitHub Actions **selalu merah** karena kendala billing akun — itu bukan indikator kualitas kode. Gate yang berlaku adalah yang lokal:

```bash
pnpm build                          # wajib sukses
pnpm test                           # unit test Vitest
npx react-doctor@latest --json      # skor harus 100
npx lhci collect && npx lhci assert # semua kategori Lighthouse ≥ 0.9
```

QA browser memakai CLI `agent-browser` (Playwright tidak dipakai di repo ini).

## Struktur penting

| Path | Isi |
|---|---|
| `src/` | Aplikasi Next.js (App Router) |
| `docs/prd-proposal-aligned.md` | PRD — sumber kebenaran scope |
| `contact.md` | Data bisnis (cabang, nomor WA, harga) — satu-satunya sumber; UI membacanya via modul `catalog-data` |
| `stitch/` | Desain mobile referensi |
| `AGENTS.md` / `DECISIONS.md` | Aturan kerja agent & catatan keputusan arsitektur |

## Versioning & rilis

Repo ini memakai [SemVer](https://semver.org) dengan tag `vX.Y.Z`:

- Selama fase demo, versi tetap `0.x` — **minor** naik tiap milestone selesai (mis. epic PRD kelar), **patch** untuk perbaikan kecil.
- `v1.0.0` = seluruh alur proposal (siswa + admin, E1–E12) terdemokan end-to-end.

Cara rilis (satu perintah, tag dibuat otomatis dari `main`):

```bash
gh release create v0.X.0 --target main --title "v0.X.0 — <nama milestone>" --generate-notes
```

Riwayat rilis: lihat halaman [Releases](../../releases).
