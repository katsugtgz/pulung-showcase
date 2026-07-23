# Audit Aset — Student Flow (Responsive Journey)

**Tiket:** [#93 — Audit student-flow asset needs and sourcing paths](https://github.com/katsugtgz/pulung/issues/93)
**Peta:** [#90 — Wayfinder: Responsive student journey from mobile mockups](https://github.com/katsugtgz/pulung/issues/90)
**Tanggal:** 2026-07-23
**Penulis:** Sisyphus (AFK research, owner tidak ikut)

---

## Tujuan audit

Matriks layar-per-layar, sadar-provenance (provenance-aware), yang memetakan **setiap kebutuhan aset visual di seluruh perjalanan siswa** ke sumbernya. Mematuhi [Visual Asset Workflow](../AGENTS.md#visual-asset-workflow):

- **Reuse local** — aset yang sudah ada di `public/images/` dipakai ulang.
- **Path A — SerpAPI** — mencari foto dunia nyata yang sudah ada (lisensi diverifikasi, sumber dicatat).
- **Path B — Antigravity (`agy --print`)** — membuat ilustrasi/stiker sintetis baru, gaya brand Pulung.
- **Build inline SVG** — ikon di `src/components/app-shell/icons.tsx` atau modul baru.
- **Defer (TODO owner)** — foto real Pulung (kendaraan, cabang, instruktur, siswa) TIDAK digenerasi dan TIDAK diambil dari stock; menunggu konfirmasi/foto dari owner.

Aturan autentisitas (dari `AGENTS.md`): orang, kendaraan, dan lokasi yang digenerasi adalah **ilustratif** — alt text netral, label "ilustrasi", diganti dengan foto owner saat autentisitas dibutuhkan.

---

## Inventaris aset lokal (status quo)

### `public/images/stickers/*.jpg` — 14 stiker brand-styled
`car_suramadu`, `car_suroboyo`, `drivers_license`, `gear_shift`, `graduation_car`, `instructor_student`, `key_fob`, `learner_car`, `roundabout_sign`, `seatbelt_buckle`, `side_mirror`, `steering_wheel`, `traffic_cone`, `winding_road`

**Pemakaian saat ini:** HANYA komponen landing (`src/components/landing/*`). **Belum ada satu pun stiker yang dipakai di rute siswa `/app/*` atau `/catalog/*`.**

### `public/images/*.svg` — 3 SVG
- `hero-placeholder.svg` — hero landing.
- `course-hero.svg` — hero katalog (sudah dipakai di `/catalog/[packageId]`).
- `qris-placeholder.svg` — QR placeholder (dipakai di `/catalog/[packageId]/payment`).

### `assets/` dan `asset-image/` — SUMBER MENTAH, TIDAK DISAJIKAN
- `assets/ocr-source/*.jpg` — crop OCR dokumen lama (bukan aset runtime).
- `assets/{car,whatsapp-icon,location-icon,rw-dev-logo,application-flow}.{jpg,png}` — referensi kerja, bukan brand final.
- `asset-image/*.jpg` — sumber 14 stiker di `public/images/stickers/` (duplikat, sudah dipublikasi via `public/`).

### `stitch/` dan `mockup hp only/` — REFERENSI DESAIN, BUKAN ASET PRODUKSI
- `stitch/*/screen.png` — IBM Carbon (BUKAN brand Pulung; anti-pattern).
- `mockup hp only/*.jpg` — 6 foto wireframe dari owner → sumber arah visual, bukan konten literal.

### Ikon sistem
**Tidak ada library ikon eksternal** (lucide-react, heroicons, react-icons — semua tidak dipakai). Empat ikon custom inline di `src/components/app-shell/icons.tsx`: `HomeIcon`, `CalendarIcon`, `InvoiceIcon`, `CardIcon`. Pola yang sudah terbukti: inline SVG stroke-style, color via `currentColor`.

---

## Matriks layar-per-layar (student flow lengkap)

Layar = seluruh titik dalam perjalanan siswa, mencakup yang sudah ada DAN yang akan datang dari tiket [#91](https://github.com/katsugtgz/pulung/issues/91) (Riwayat + Profil) dan [#94](https://github.com/katsugtgz/pulung/issues/94) (Jadwal compact). Compact dan desktop **memakai aset yang sama** — hanya tata letak beda.

### 1. Sign-in / Sign-up — `(public)/sign-in|sign-up`
| Kebutuhan | Sumber | Aksi |
|---|---|---|
| Dekorasi hero (mockup: foto full-bleed mobil+instruktur+siswa) | **Path B (agy)** | Generasi **stiker hero** gaya brand (mobil instruktur + siswa, palet biru Pulung, alt netral "ilustrasi"). Bukan foto real. Catat di `public/images/stickers/sign-in-hero.webp`. |
| Logo sosial Google | **Reuse existing brand asset** | Google "G" sudah tersedia via Clerk appearance; tidak perlu aset baru. |
| Ikon input (email, password, toggle visibility) | Clerk default | Tidak perlu aset baru. |

**Catatan:** Foto lifestyle real via SerpAPI ditolak untuk sign-in karena (a) lisensi stock tidak terverifikasi, (b) bisa terlihat seperti "mobil Pulung" palsu. Stiker agy lebih aman + on-brand.

### 2. Catalog list — `/catalog`
| Kebutuhan | Sumber | Aksi |
|---|---|---|
| Thumbnail per paket | **Reuse local** | Pakai stiker sesuai tema paket: `learner_car` (paket inti), `graduation_car` (paket lengkap), `drivers_license` (sim). Pemetaan eksplisit di `catalog-data`. |
| Ikon transmisi (manual/matic) | **Build inline SVG** | Tambah `GearShiftIcon` di modul ikon katalog (atau reuse `gear_shift.jpg` kecil). |

### 3. Course detail — `/catalog/[packageId]`
| Kebutuhan | Sumber | Aksi |
|---|---|---|
| Hero paket (mockup: foto mobil besar) | **Reuse local** | `learner_car.jpg` untuk hero utama. Sudah ada pola `course-hero.svg`; konsistenkan. |
| Badge "Mobil Manual/Matic" | **Build inline SVG** | Badge stroke-style di komponen detail. |
| Avatar instruktur (mockup: foto orang) | **Reuse local** | `instructor_student.jpg` dengan alt "ilustrasi instruktur". Bukan foto staff real. |
| Ikon fitur (asuransi, sertifikat, bantuan 24/7) | **Build inline SVG** | Tambah `ShieldIcon`, `CertificateIcon`, `HeadsetIcon` di `src/components/catalog/icons.tsx` (modul baru). |

### 4. QRIS Payment — `/catalog/[packageId]/payment`
| Kebutuhan | Sumber | Aksi |
|---|---|---|
| QR placeholder | **Reuse local** | `qris-placeholder.svg` sudah ada dan dipakai. |
| Ikon countdown timer | **Build inline SVG** | `ClockIcon` di modul ikon payment. |
| Ikon langkah ① ② ③ | **Build inline SVG** | Numbered step indicator inline. |
| Ikon download invoice | **Build inline SVG** | `DownloadIcon`. |
| Ikon share | **Build inline SVG** | `ShareIcon`. |

**Tidak butuh raster.** Layar ini murni fungsional (mockup #2 konfirmasi: zero photography).

### 5. Payment success state (dalam halaman yang sama, status `terverifikasi`)
| Kebutuhan | Sumber | Aksi |
|---|---|---|
| Ilustrasi celebration (mockup: lingkaran navy + checkmark + confetti) | **Path B (agy)** | Generasi **stiker celebration** gaya brand: lingkaran biru-primary + checkmark putih + aksen merah/biru kecil. Simpan `public/images/stickers/payment-success.webp`. **Bukan navy** (anti-pattern stitch). |
| Badge "Lunas" | **Build inline SVG** | Badge inline, palet brand. |

### 6. Payment expired/retry state (status `kedaluwarsa`)
| Kebutuhan | Sumber | Aksi |
|---|---|---|
| Indikator kedaluwarsa | **Build inline SVG** | `ExpiredIcon` stroke-style. |
| Tidak perlu ilustrasi besar — layout text-driven sudah cukup (validated by #96 variant A/B/C) |

### 7. Beranda siswa — `/app` (dashboard siswa ringkas)
| Kebutuhan | Sumber | Aksi |
|---|---|---|
| Avatar siswa di header | **Build: initials-based** | Lingkaran warna primary + inisial nama. **Tidak ada foto** (demo). Real photo = TODO owner. |
| Kartu ringkasan status paket | **Build inline SVG** | Ikon status di kartu (resume, next session). |
| Stiker dekoratif empty state (jika belum ada jadwal) | **Reuse local** | `steering_wheel.jpg` atau `winding_road.jpg` untuk empty state. |

### 8. Jadwal (compact, dari #94) — `/app/jadwal`
| Kebutuhan | Sumber | Aksi |
|---|---|---|
| Date strip + navigation arrows | **Build inline SVG** | `ChevronLeftIcon`, `ChevronRightIcon`. |
| Avatar instruktur di chip (mockup: foto kecil orang) | **Build: initials-based** | Inisial nama instruktur di lingkaran kecil. **Tidak ada foto** (demo). Real photo instruktur = TODO owner. |
| Ikon status slot (available/booked/conflict/selected/loading) | **Build inline SVG** | Status indicator dots/borders, palet brand. |
| Ikon bell notifikasi "Booked" | **Build inline SVG** | `BellIcon`. |

**Tidak butuh raster baru.** Compact = date strip horizontal + filter + satu kolom slot; desktop boleh grid (sumber: #94). Status icons via CSS/SVG.

### 9. Riwayat (BARU, dari #91) — `/app/riwayat`
| Kebutuhan | Sumber | Aksi |
|---|---|---|
| Ikon status transaksi (pending, terverifikasi, ditolak, kedaluwarsa) | **Build inline SVG** | 4 ikon status di modul ikon riwayat. |
| Thumbnail invoice (optional) | **Reuse local** | `invoice.svg` baru (mini icon) atau skip — list text-driven sudah cukup. |
| Ikon download invoice per row | **Build inline SVG** | `DownloadIcon` (sudah dibuat di #4, reuse). |

**Tidak butuh raster baru.**

### 10. Profil (BARU, dari #91) — `/app/profil`
| Kebutuhan | Sumber | Aksi |
|---|---|---|
| Foto profil siswa (mockup: portrait ID) | **Build: initials-based** | Lingkaran besar warna primary + inisial. **Tidak ada foto real** (demo). Real photo = TODO owner. |
| Preview kartu siswa (digital card) | **Reuse existing PDF rendering** | Sudah ada di `/app/kartu`; embed ulang view di profil (compact). |
| Ikon data (ID, telepon, alamat, paket) | **Build inline SVG** | Sekumpulan ikon stroke-style di modul ikon profil. |

### 11. Kartu Siswa — `/app/kartu` (existing) + PDF
| Kebutuhan | Sumber | Aksi |
|---|---|---|
| Portrait di kartu (mockup: foto orang) | **Build: initials-based** (UI) + **kosong di PDF** (demo) | Demo UI pakai lingkaran inisial; PDF biarkan placeholder kosong dengan label "Foto siswa" sampai owner supplies. |
| Watermark ikon mobil di kartu | **Reuse local** | `learner_car.jpg` opacity rendah, atau inline SVG mobil sederhana di PDF (`pdf-lib` draw). |
| Logo PULUNG di kartu | **Reuse existing** | Wordmark text-based di PDF brand module `src/lib/pdf/brand.ts` (sudah ada). |

### 12. Bottom nav / app shell — `src/components/app-shell/`
| Kebutuhan | Sumber | Aksi |
|---|---|---|
| Ikon Beranda (existing) | Reuse | `HomeIcon` ✓ |
| Ikon Jadwal (existing) | Reuse | `CalendarIcon` ✓ |
| Ikon Riwayat (BARU, menggantikan Invoice) | **Build inline SVG** | `HistoryIcon` atau `ReceiptIcon` stroke-style. |
| Ikon Profil (BARU, menggantikan Kartu) | **Build inline SVG** | `UserIcon` stroke-style. |
| Ikon kartu (jika Profil dan Kartu disatukan di Profil) | Lihat #91 prototipe | Tunda sampai #91 menetapkan IA final. |

---

## Ringkasan sourcing (klasifikasi provenance)

| Sumber | Jumlah kebutuhan | Detail |
|---|---|---|
| **Reuse local (existing assets)** | 6 pemakaian | Stiker (`learner_car`, `instructor_student`, `graduation_car`, `drivers_license`, `steering_wheel`, `winding_road`) + 3 SVG yang sudah ada (`qris-placeholder`, `course-hero`, `hero-placeholder`). |
| **Path A — SerpAPI** | **0** | Tidak ada kebutuhan aset dunia nyata yang bisa dipenuhi stock berlisensi tanpa risiko mis-representasi sebagai "Pulung real". |
| **Path B — Antigravity (`agy`)** | **2 aset baru** | (1) `sign-in-hero.webp` stiker hero sign-in; (2) `payment-success.webp` stiker celebration. Keduanya gaya brand Pulung (biru primary, aksen merah, alt netral "ilustrasi"). |
| **Build inline SVG** | ~15 ikon baru | Status (pending/terverifikasi/ditolak/kedaluwarsa), navigasi (chevrons, history, user, bell), fitur (shield, certificate, headset, download, share, clock, gear-shift). Ekstensi pola `src/components/app-shell/icons.tsx` ke modul per-fitur. |
| **Initials-based avatar (no raster)** | 3 konteks | Avatar siswa (Beranda, Profil), avatar instruktur (Jadwal chip). Demo-only; real photo = TODO owner. |
| **Defer (TODO owner)** | 4 kategori | Foto real: instruktur, siswa, kendaraan Pulung, eksterior cabang. **TIDAK digenerasi, TIDAK diambil stock.** Menunggu foto owner. |

---

## Catatan penting untuk tiket turunan

### Untuk #91 (Prototype Riwayat + Profil)
- Asumsi aset di prototipe: initials-based avatar, ikon inline SVG, **tidak ada raster baru**.
- Jika prototipe menunjukkan bahwa avatar foto benar-benar dibutuhkan untuk pengalaman, **tetap defer ke owner** — jangan gunakan stock sebagai "demo" karena bisa terlihat seperti orang real.
- Modul ikon profil + riwayat harus konsisten stroke-style dengan `app-shell/icons.tsx`.

### Untuk #94 (Prototype Jadwal compact)
- Asumsi aset: ikon inline SVG (chevrons, status dots), initials-based avatar instruktur.
- Tidak ada stiker/foto baru yang dibutuhkan. Density compact dicapai via layout + tipografi, bukan aset.

### Untuk #95 (Lock acceptance + migration)
- Kriteria acceptance aset: (a) semua ilustrasi ber-alt netral + label "ilustrasi" bila menampilkan orang/kendaraan; (b) tidak ada klaim "ini foto Pulung"; (c) Lighthouse image audit tidak boleh gagal karena aset tidak teroptimasi (SVG/stiker kecil); (d) 2 aset agy baru harus `webp` dan `< 50KB` masing-masing.
- Migration contract: rute `/app/invoice` → redirect ke `/app/riwayat`, `/app/kartu` → redirect ke `/app/profil`. Tidak ada aset yang berubah path — hanya navigasi.

---

## Out of scope

- **Generasi aset agy yang sebenarnya** (file `.webp` fisik) — tunda sampai prototipe #91+#94 menetapkan komposisi visual final. Audit ini hanya memetakan KEBUTUHAN; eksekusi generasi menyusul keputusan tata letak.
- **Pengambilan foto owner** — di luar kendali agent; owner awareness via #95.
- **Optimasi aset landing yang sudah ada** — bukan bagian student-flow.
- **Audit aset admin dashboard** — #90 secara eksplisit mengecualikan "admin dashboard redesign".
