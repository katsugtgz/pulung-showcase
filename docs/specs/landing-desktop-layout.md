# Spec Layout Desktop — Landing Page

- **Asal tiket:** GitHub issue #41 (implementasi layout desktop)
- **Peta ke rencana:** issue #40 (map)
- **Tiket implementasi:** issue #45 — spec ini harus bisa dieksekusi verbatim tanpa keputusan desain tambahan.
- **Stack:** Next 16, React 19, Tailwind v4 (CSS-first `@theme`, **tidak ada** `tailwind.config.js`).
- **Palet (dari `globals.css` `@theme`):** `--color-primary #1E6FB8`, `--color-accent #D22B3A` (CTA saja), skala neutral putih/abu. **Ungu dilarang.**
- **Bahasa string:** Indonesia (semua string sudah di komponen; spec ini tidak menambah/mengubah teks, hanya class Tailwind responsif dan sedikit markup pembungkus).

## 0. Cakupan & non-tujuan

Spec ini **hanya menambah** perilaku `md` / `lg` / `xl`. Perilaku `mobile` (viewport `< 768px`) **tidak di-spec ulang** dan **harus identik** dengan kondisi sekarang. Semua class responsif ditulis bersanding dengan class mobile yang ada (`max-w-md` dipertahankan sebagai baseline, lalu di-override oleh `lg:`/`md:`). Tidak menambah dependency, gambar, ikon, font, atau komponen baru. Hanya class Tailwind responsif + sejumlah kecil pembungkus `<div>` di Hero.

## 1. Prinsip global

### 1.1 Sumber masalah saat ini

`src/app/(public)/page.tsx` membungkus seluruh halaman dengan satu kunci:

```tsx
<main className="mx-auto min-h-dvh max-w-md bg-neutral-50">
```

Akibatnya lebar konten — termasuk background biru `<Header/>` dan `<Hero/>` — terkunci ke `28rem` (`448px`), dan setiap komponen turunan memakai `mx-auto max-w-md` internal yang menjadi **redundan** (container dalam container). Untuk desktop, dua lapis `max-w-md` ini harus dilepas secara terkoordinasi: kunci di `page.tsx` dihilangkan, lalu tiap komponen mengelola containernya sendiri.

### 1.2 Strategi container

- **`<main>` jadi full-width** (lepas `mx-auto` + `max-w-md`). Tugas `<main>` hanya `min-h-dvh` + `bg-neutral-50`. Section-section di dalamnya yang memiliki background (`<Hero/>`, `<Header/>`, `<Footer/>`, serta section berselang-seling `bg-neutral-50` / `bg-white`) menjadi full-bleed secara alami → identitas banner biru Header+Hero membentang penuh lintas viewport.
- **Setiap section memiliki container dalam sendiri** berpola seragam:

  ```
  mx-auto max-w-md lg:max-w-7xl
  ```

  `max-w-7xl` = `80rem` = `1280px` = persis lebar breakpoint `xl`. Dipilih alih-alih `max-w-screen-xl` karena di Tailwind v4 namespace `max-w-screen-*` tidak dijamin ada (v4 menggantinya menjadi `max-w-breakpoint-*`). `max-w-7xl` adalah utilitas bawaan di v3 maupun v4, tanpa perlu konfigurasi apa pun.
- Padding horizontal section: kini `px-6`. Tambahkan `lg:px-8` di seluruh section untuk pernapasan yang lebih longgar di desktop. (Hero & Header punya aturan terpisah, lihat bab 2 & 3.)
- Container di atas dipasang pada elemen yang **saat ini** ber-class `mx-auto max-w-md` di tiap komponen (lihat tabel per-section). Tidak ada container baru yang diciptakan.

### 1.3 Breakpoint yang dipakai

| Token | Lebar  | Peran dalam spec                                  |
| ----- | ------ | ------------------------------------------------- |
| `md`  | `768`  | Grid 2 kolom untuk Paket / Testimoni / Sosial.    |
| `lg`  | `1024` | Aktivasi layout desktop utama (nav inline, split Hero, cluster 2-kolom, container `max-w-7xl`). |
| `xl`  | `1280` | Cap container. Tidak ada layout khusus lain.     |

`sm` (`640`) dan `2xl` (`1536`) **tidak dipakai** di spec ini.

### 1.4 Type scale per breakpoint

Skala tipografi diperbesar mulai `lg`. Semua class di bawah menimpa (override) class mobile yang ada; class mobile dipertahankan sebagai baseline.

| Elemen                              | Sekarang (mobile)        | Tambah desktop            |
| ----------------------------------- | ------------------------ | ------------------------- |
| Hero `<h1>` wordmark PULUNG         | `text-6xl`               | `lg:text-7xl`             |
| Hero headline (`<p>`)               | `text-lg`                | `lg:text-2xl`             |
| Hero subheadline (`<p>`)            | `text-sm`                | `lg:text-base`            |
| Hero eyebrow (`Kursus Mengemudi`)   | `text-xs`                | *(tidak diubah)*          |
| Header wordmark `PULUNG`            | `text-2xl`               | *(tidak diubah)*          |
| Heading section `<h2>`              | `text-2xl`               | `lg:text-3xl`             |
| Body section (`<p>` deskripsi)      | `text-sm`                | *(tidak diubah)*          |
| Badge harga Packages (`Mulai dari`) | `text-xl`                | `lg:text-2xl`             |

Semua pasangan di atas ditulis dengan cara **menambah** token `lg:` ke class yang ada — mis. `text-2xl font-bold ...` → `text-2xl lg:text-3xl font-bold ...`.

### 1.5 Spacing rhythm antar-section

- Section konten (Packages, LocationPicker, Testimonials, SocialCards, FAQ) kini `py-10`. Tambah `lg:py-16` agar vertikal rhythm lebih lapang di desktop.
- `<CredibilityStrip/>` kini `pt-8 pb-6` → tambah `lg:pt-12 lg:pb-10`.
- `<Hero/>` kini `pb-12 pt-14` → tambah `lg:pb-20 lg:pt-20`.
- `<Footer/>` kini `pb-8 pt-10` → tambah `lg:pt-16`.
- `<Header/>` `py-3` tidak diubah (bar tipis, tetap ramping).
- Urutan section, pembungkus `<Reveal>`, dan `bg-neutral-50`/`bg-white` berselang **tidak diubah** sama sekali (lihat `page.tsx`).

## 2. Header — sticky nav dengan link inline di `lg`

**Tujuan:** tetap bilah tipis `bg-primary` yang menyatu dengan Hero; di `lg` muncul tautan navigasi inline (anchor) di tengah, tombol auth tetap di kanan, wordmark di kiri.

**Layout:**

- `< md`: identik dengan sekarang — wordmark kiri, tombol `Masuk` / `Daftar` kanan.
- `≥ lg`: tiga kelompok di baris yang sama lewat `justify-between` (sudah ada): **wordmark | nav | auth**. Nav berisi tiga anchor ke section yang **sudah punya `id`**: `#packages`, `#lokasi`, `#faq`. (Tidak ada anchor ke Testimoni/Sosial karena section itu belum punya `id`; menambah `id` di luar cakupan spec ini agar tidak memengaruhi rencana lain.)

**Perubahan:**

| Elemen / baris di `header.tsx`                   | Ganti `X` → `Y`                                                                                                                |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `<header>` (luar)                                | `className="sticky top-0 z-30 bg-primary px-6 py-3 text-white"` → tambahkan ` lg:px-8`                                          |
| `<div>` container dalam                          | `mx-auto flex max-w-md items-center justify-between gap-3` → `mx-auto flex max-w-md lg:max-w-7xl items-center justify-between gap-3` |
| (baru) `<nav>` di antara wordmark & auth         | Sisipkan: `<nav className="hidden gap-6 lg:flex"><Link href="#packages" className="text-sm font-medium text-white/90 hover:text-white">Paket</Link><Link href="#lokasi" className="text-sm font-medium text-white/90 hover:text-white">Lokasi</Link><Link href="#faq" className="text-sm font-medium text-white/90 hover:text-white">FAQ</Link></nav>` |

**Tidak berubah:** warna wordmark (`text-accent`), tombol `Masuk` (outline putih) & `Daftar` (`bg-accent`), perilaku `sticky top-0 z-30`, fakta bahwa kedua tombol adalah `<Link>` statis (bukan komponen Clerk sisi-klien — lihat ADR-002).

## 3. Hero — split 2 kolom di `lg`

**Tujuan:** pertahankan banner biru full-bleed; di `lg` konten berubah dari satu kolom terpusat menjadi dua kolom: **kiri** (eyebrow + wordmark + headline + subheadline + CTA, rata kiri) dan **kanan** (trust-bar chips). `text-center` hanya berlaku `< lg`.

**Layout:**

- `< lg`: identik sekarang (tunggal, terpusat, `flex-col items-center`).
- `≥ lg`: container dalam jadi `lg:max-w-7xl`, berpindah ke `lg:flex-row`, `lg:items-center`, `lg:text-left`, `lg:gap-12`. Trust-bar chips dipindahkan ke kolom kanan.

**Restrukturisasi markup (diperlukan karena urutan DOM saat ini: …subheadline → chips → CTA; di desktop chips harus pindah ke kolom terpisah):**

Konten container dalam (`relative mx-auto flex max-w-md flex-col items-center`) saat ini berisi berurutan: `p` eyebrow → `h1` → `p` headline → `p` subheadline → `ul` trust-bar → `div` CTA. Ubah menjadi dua `<div>` kolom:

1. Kolom kiri `<div className="lg:flex-1 lg:text-left">` membungkus: eyebrow, `h1`, headline, subheadline, **dan** CTA.
2. Kolom kanan `<div className="mt-8 lg:mt-0 lg:w-72 lg:flex-shrink-0">` membungkus: `ul` trust-bar. (`mt-8` agar mobile tetap punya jarak dari subheadline; di `lg` di-nol-kan.)
3. Container dalam **tetap** `items-center` (di `lg` container jadi `flex-row`, sehingga `items-center` berarti kedua kolom rata tengah vertikal — sesuai tabel di bawah). Perataan teks kiri di desktop sudah ditangani `lg:text-left`; wordmark & headline tetap rata tengah di mobile via `text-center` bawaan `<header>`.

**Perubahan:**

| Elemen / baris di `hero.tsx`                                  | Ganti `X` → `Y`                                                                                                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `<header>` (luar, bg-primary)                                 | `relative overflow-hidden bg-primary px-6 pb-12 pt-14 text-center text-white` → tambahkan ` lg:px-8 lg:pb-20 lg:pt-20`                            |
| Container dalam (`<div>`)                                     | `relative mx-auto flex max-w-md flex-col items-center` → `relative mx-auto flex max-w-md lg:max-w-7xl flex-col items-center lg:flex-row lg:items-center lg:gap-12 lg:text-left` |
| Wordmark `<h1>`                                              | `text-6xl ...` → `text-6xl lg:text-7xl ...`                                                                                                       |
| Headline `<p>`                                               | `mt-4 text-balance text-lg font-medium leading-snug text-white` → tambah ` lg:text-2xl`                                                           |
| Subheadline `<p>`                                            | `mt-2 text-balance text-sm leading-relaxed text-white/90` → tambah ` lg:text-base`                                                                |
| Blok CTA (`mt-8 flex w-full flex-col gap-3`)                  | tetap `mt-8 flex w-full flex-col gap-3` + tambah ` lg:max-w-md lg:flex-row`                                                                       |

**Tidak berubah:** kedua CTA mengarah ke `#lokasi`, label dari `@/lib/copy` (`cta.primary` / `cta.secondary`), warna `bg-accent` & outline putih, dekorasi sudut (`aria-hidden`), lengkungan transisi ke strip kredibilitas (`absolute -bottom-px ... bg-neutral-50`), fakta bahwa Hero **tidak** dibungkus `<Reveal>` (LCP).

## 4. CredibilityStrip — 3 badge berjajar lebih lapang

**Tujuan:** strip tetap 3 kolom (sudah `grid-cols-3`), container melebar secukupnya (`max-w-4xl`, bukan `7xl` — tiga badge kecil di bentang 1280px terlalu renggang) dan tiap badge membesar sedikit di `lg`. Tetap kompak (ini strip, bukan hero).

**Layout:** 3 kolom di semua breakpoint; jarak & ukuran ikon tumbuh di `lg`.

**Perubahan:**

| Elemen / baris di `credibility-strip.tsx`        | Ganti `X` → `Y`                                                                 |
| ------------------------------------------------ | ------------------------------------------------------------------------------- |
| `<section>` (luar)                               | `bg-neutral-50 px-6 pt-8 pb-6` → tambahkan ` lg:px-8 lg:pt-12 lg:pb-10`         |
| `<ul>` grid badge                                | `mx-auto grid max-w-md grid-cols-3 gap-3` → `mx-auto grid max-w-md lg:max-w-4xl grid-cols-3 gap-3 lg:gap-8` |
| Lingkar ikon badge (di `Badge`)                  | `flex h-12 w-12 items-center justify-center rounded-full bg-primary/10` → tambah ` lg:h-14 lg:w-14` |

**Tidak berubah:** 3 badge (KORLANTAS/Dishub, 25+ tahun, Safe Drive Training), `aria-hidden` pada svg, label tiap badge, struktur `<Badge/>`.

## 5. Packages — grid 2 kolom `md` / 3 kolom `lg`

**Tujuan:** tiga kartu (Manual, Matic, Kombinasi) berbaris. Mobile 1 kolom, `md` 2 kolom, `lg` 3 kolom.

**Perubahan:**

| Elemen / baris di `packages.tsx`                | Ganti `X` → `Y`                                                                                                |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `<section>` (luar)                              | `scroll-mt-4 bg-neutral-50 px-6 py-10` → tambahkan ` lg:px-8 lg:py-16`                                         |
| Container dalam `<div>`                          | `mx-auto max-w-md` → `mx-auto max-w-md md:max-w-5xl lg:max-w-7xl`                                              |
| Heading `<h2>`                                  | `text-center text-2xl ...` → `text-center text-2xl lg:text-3xl ...`                                            |
| `<ul>` daftar kartu                             | `mt-6 flex flex-col gap-4` → `mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3`                       |
| Harga `<span>` `Mulai dari` nominal            | `text-xl font-bold text-neutral-900` → `text-xl lg:text-2xl font-bold text-neutral-900`                        |

**Tidak berubah:** konten tiap kartu (nama, badge transmisi, fakta kunci `Sesi`/`Durasi`/`Mobil`, daftar fitur, `formatIDR`, tombol `Pelajari` → `/catalog/[id]`), disclaimer `*harga contoh`, catatan dinamis harga di bawah daftar, sumber data `getPackages()`.

## 6. LocationPicker — dua kluster berdampingan di `lg`

**Tujuan:** di `lg` kedua kluster (A dan B) tampil berdampingan dua kolom; toggle transmisi + heading tetap satu baris penuh di atas. Mobile tetap satu kolom bertumpuk.

**Perubahan:**

| Elemen / baris di `location-picker.tsx`         | Ganti `X` → `Y`                                                                                          |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `<section>` (luar)                              | `scroll-mt-4 bg-white px-6 py-10` → tambahkan ` lg:px-8 lg:py-16`                                        |
| Container dalam `<div>`                          | `mx-auto max-w-md` → `mx-auto max-w-md lg:max-w-7xl`                                                     |
| Heading `<h2>`                                  | `text-center text-2xl ...` → `text-center text-2xl lg:text-3xl ...`                                      |
| `<div>` pembungkus daftar kluster (`mt-6 flex flex-col gap-6`) | `mt-6 flex flex-col gap-6` → `mt-6 flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-8`                  |

**Tidak berubah:** toggle transmisi (logika `"use client"` + `useState`), label CTA WhatsApp (`cta.primary`), `buildWhatsAppLink({ branchId, transmission })`, header kluster (region + Instagram + WhatsApp), badge `Cabang Utama`, warna tombol `bg-[#25D366]`, data dari `getClusters()`/`getBranchesByCluster()`.

## 7. Testimonials — grid 2 kolom `md` / 3 kolom `lg`

**Perubahan:**

| Elemen / baris di `testimonials.tsx` | Ganti `X` → `Y`                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `<section>` (luar)                   | `bg-neutral-50 px-6 py-10` → tambahkan ` lg:px-8 lg:py-16`                                       |
| Container dalam `<div>`              | `mx-auto max-w-md` → `mx-auto max-w-md lg:max-w-7xl`                                             |
| Heading `<h2>`                       | `text-center text-2xl ...` → `text-center text-2xl lg:text-3xl ...`                              |
| `<ul>` daftar testimoni             | `mt-6 flex flex-col gap-4` → `mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3`        |

**Tidak berubah:** baris rating (`getMapsRating()`), fallback ketika `testimonials` kosong (panel putus-putus + `getSectionBody("testimonials")`), sumber `getTestimonials()`.

## 8. SocialCards — grid 2 kolom `md`

**Tujuan:** kartu media sosial cukup sempit; 2 kolom sudah cukup (tidak perlu 3). Mobile 1 kolom, `md` 2 kolom, `lg` tetap 2 kolom (lebih lapang, bukan lebih banyak).

**Perubahan:**

| Elemen / baris di `social-cards.tsx` | Ganti `X` → `Y`                                                                          |
| ------------------------------------ | ---------------------------------------------------------------------------------------- |
| `<section>` (luar)                   | `bg-white px-6 py-10` → tambahkan ` lg:px-8 lg:py-16`                                    |
| Container dalam `<div>`              | `mx-auto max-w-md` → `mx-auto max-w-md md:max-w-2xl lg:max-w-7xl`                        |
| Heading `<h2>`                       | `text-center text-2xl ...` → `text-center text-2xl lg:text-3xl ...`                      |
| `<ul>` daftar kartu                  | `mt-6 flex flex-col gap-3` → `mt-6 grid grid-cols-1 gap-3 md:grid-cols-2`               |

**Tidak berubah:** `target="_blank"`, ikon platform, pratinjau caption (`line-clamp-2`), `getSocialPosts()`.

## 9. FAQ — satu kolom baca yang lebih lebar di `lg`

**Tujuan:** FAQ adalah teks baca, bukan grid. Di `lg` lebarkan kolom ke `max-w-3xl` (`48rem`) — cukup lapang untuk paragraf, cukup sempit untuk keterbacaan. **Tidak** di-grid.

**Perubahan:**

| Elemen / baris di `faq.tsx` | Ganti `X` → `Y`                                                              |
| --------------------------- | ---------------------------------------------------------------------------- |
| `<section>` (luar)          | `scroll-mt-4 bg-neutral-50 px-6 py-10` → tambahkan ` lg:px-8 lg:py-16`       |
| Container dalam `<div>`     | `mx-auto max-w-md` → `mx-auto max-w-md lg:max-w-3xl`                         |
| Heading `<h2>`             | `text-center text-2xl ...` → `text-center text-2xl lg:text-3xl ...`          |

**Tidak berubah:** logika `"use client"` + `useState` accordion satu-terbuka, atribut `aria-expanded`/`aria-controls`, `hidden` pada panel tertutup, sumber `getFaq()`/`getSectionHeader("faq")`/`getSectionBody("faq")`, struktur `<ul>` vertikal (tidak di-grid).

## 10. Footer — dua kluster berdampingan + container lebar

**Tujuan:** di `lg` dua kartu kluster berdampingan; identitas & kredit tetap terpusat.

**Perubahan:**

| Elemen / baris di `footer.tsx`         | Ganti `X` → `Y`                                                                          |
| -------------------------------------- | ---------------------------------------------------------------------------------------- |
| `<footer>` (luar)                      | `bg-neutral-900 px-6 pb-8 pt-10 text-neutral-300` → tambahkan ` lg:px-8 lg:pt-16`        |
| Container dalam `<div>`                | `mx-auto max-w-md` → `mx-auto max-w-md lg:max-w-7xl`                                     |
| `<div>` pembungkus daftar kluster     | `mb-6 grid gap-4` → `mb-6 grid gap-4 lg:grid-cols-2`                                     |

**Tidak berubah:** blok identitas (wordmark `text-accent`, motto "Safe Drive Training · Berdiri sejak 2000 · Surabaya"), tautan WhatsApp + Instagram per kluster, blok akreditasi, kredit "Demo oleh RW Dev", data `getClusters()`.

## 11. Urutan eksekusi untuk #45

Implementasi murni responsive-class + sedikit markup di Hero. **Tidak boleh** mengubah konten/teks, data, atau logika `"use client"`. Jalankan dalam urutan berikut; setelah selesai, jalankan gate lokal (`pnpm build`, `react-doctor` skor 100, `@lhci/cli` ≥ 0.9 semua kategori, `pnpm test`) seperti `AGENTS.md`.

| # | File                                       | Ringkasan perubahan                                                                                                                                                                                                  |
| - | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | `src/app/(public)/page.tsx`               | `<main>`: lepas `mx-auto max-w-md` → `min-h-dvh bg-neutral-50`. (Tidak sentuh urutan section / `<Reveal>`.)                                                                                                          |
| 2 | `src/components/landing/header.tsx`       | `lg:px-8`; container `max-w-md lg:max-w-7xl`; sisipkan `<nav>` tiga anchor (`#packages`, `#lokasi`, `#faq`) dengan `hidden lg:flex`.                                                                                 |
| 3 | `src/components/landing/hero.tsx`         | `lg:px-8 lg:pb-20 lg:pt-20`; container `max-w-md lg:max-w-7xl` + `lg:flex-row lg:items-center lg:gap-12 lg:text-left`; bagi konten menjadi kolom kiri (eyebrow→CTA) & kolom kanan (trust chips); type scale `lg:`; CTA `lg:max-w-md lg:flex-row`. |
| 4 | `src/components/landing/credibility-strip.tsx` | `lg:px-8 lg:pt-12 lg:pb-10`; `<ul>` `max-w-md lg:max-w-4xl ... lg:gap-8`; lingkar ikon `lg:h-14 lg:w-14`.                                                                                                         |
| 5 | `src/components/landing/packages.tsx`     | `lg:px-8 lg:py-16`; container `md:max-w-5xl lg:max-w-7xl`; heading `lg:text-3xl`; `<ul>` → `grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3`; harga `lg:text-2xl`.                                              |
| 6 | `src/components/landing/location-picker.tsx` | `lg:px-8 lg:py-16`; container `lg:max-w-7xl`; heading `lg:text-3xl`; pembungkus kluster `lg:grid lg:grid-cols-2 lg:gap-8`.                                                                                       |
| 7 | `src/components/landing/testimonials.tsx` | `lg:px-8 lg:py-16`; container `lg:max-w-7xl`; heading `lg:text-3xl`; `<ul>` → `grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3`.                                                                                |
| 8 | `src/components/landing/social-cards.tsx` | `lg:px-8 lg:py-16`; container `md:max-w-2xl lg:max-w-7xl`; heading `lg:text-3xl`; `<ul>` → `grid grid-cols-1 gap-3 md:grid-cols-2`.                                                                                  |
| 9 | `src/components/landing/faq.tsx`          | `lg:px-8 lg:py-16`; container `lg:max-w-3xl`; heading `lg:text-3xl`.                                                                                                                                                  |
| 10 | `src/components/landing/footer.tsx`      | `lg:px-8 lg:pt-16`; container `lg:max-w-7xl`; pembungkus kluster `lg:grid-cols-2`.                                                                                                                                    |

### Catatan penerimaan

- **Mobile identik:** lapor regresi bila ada perbedaan visual pada viewport `< 768px` dibanding state pra-PR. Semua class responsif di atas bersanding dengan class mobile yang ada — jangan hapus class mobile.
- **Banner biru kontinu Header+Hero:** setelah `<main>` dilepas `max-w-md`, background `bg-primary` Header & Hero harus membentang full viewport (sebelumnya terpotong `448px`). Ini diharapkan, bukan bug.
- **Tidak ada dependency/gambar/komponen baru.** Hanya class Tailwind responsif + dua `<div>` pembungkus di Hero.
- **Verifikasi Lighthouse** di breakpoint desktop (lebar `≥ 1280`) sekaligus mobile — tidak boleh ada kategori `< 0.9`.
