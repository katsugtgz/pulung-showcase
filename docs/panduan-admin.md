# Panduan Admin — Kursus Mengemudi Pulung

**Untuk staf yang mengelola dasbor admin Kursus Mengemudi Pulung.**  
Dokumen ini berisi panduan langkah demi langkah untuk semua tugas operasional di panel admin.

> **Catatan teknis:** Tangkapan layar dalam dokumen ini belum dapat disertakan karena proses masuk admin membutuhkan konfigurasi tambahan pada sistem autentikasi (Clerk JWT template belum menyertakan `publicMetadata` dalam sesi token bawaan — perlu dikonfigurasi via Clerk Dashboard agar pemeriksaan peran admin berfungsi penuh). Deskripsi antarmuka dalam panduan ini ditulis berdasarkan kode sumber asli dan akurat sesuai tampilan nyata.

---

## Daftar Isi

1. [Login Pertama & Kenali Dasbor](#1-login-pertama--kenali-dasbor)
2. [Kelola Data Siswa](#2-kelola-data-siswa)
3. [Kelola Jadwal Instruktur & Jadwal Siswa](#3-kelola-jadwal-instruktur--jadwal-siswa)
4. [Terima Notifikasi & Konfirmasi Pembayaran](#4-terima-notifikasi--konfirmasi-pembayaran)
5. [Invoice Otomatis & Kartu Siswa PDF](#5-invoice-otomatis--kartu-siswa-pdf)
6. [Ekspor Excel](#6-ekspor-excel)

---

## 1. Login Pertama & Kenali Dasbor

### Cara Masuk

1. Buka browser dan pergi ke alamat: `https://[domain]/sign-in`
2. Masukkan **alamat email** akun admin Anda, lalu klik tombol **"Lanjutkan"**.
3. Masukkan **kata sandi** Anda, lalu klik **"Lanjutkan"**.
4. Jika diminta kode verifikasi, cek email Anda dan masukkan kode yang diterima.
5. Setelah masuk, Anda akan diarahkan ke beranda. Tambahkan `/admin` di akhir alamat URL untuk membuka dasbor admin: `https://[domain]/admin`

> **Catatan:** Hanya akun dengan peran `admin` yang bisa mengakses halaman ini. Jika Anda diarahkan kembali ke beranda, berarti akun Anda belum memiliki peran admin. Hubungi pengelola sistem.

### Tampilan Dasbor Admin

Saat berhasil masuk, Anda akan melihat halaman **Dasbor Admin** dengan tampilan sebagai berikut:

**Bagian atas:**
- Label biru kecil "PANEL ADMIN"
- Judul besar: **"Dasbor Admin"**
- Keterangan singkat: "Kelola data siswa, jadwal instruktur, dan konfirmasi pembayaran Kursus Mengemudi Pulung."
- Tombol profil pengguna (ikon lingkaran) di pojok kanan atas

**Panduan Selamat Datang (Onboarding Checklist) — muncul saat pertama kali login:**  
Kartu biru muda berisi daftar 5 tugas dengan tautan langsung:
1. Kelola Data Siswa → `/admin/siswa`
2. Atur Jadwal Instruktur → `/admin/jadwal-instruktur`
3. Kelola Jadwal Siswa → `/admin/jadwal-siswa`
4. Konfirmasi Pembayaran → langsung ke bagian antrean di bawah
5. Ekspor Data Excel → `/admin/ekspor`

Klik tombol **"Saya sudah mengerti — tutup panduan ini"** atau ikon silang (×) di pojok kanan untuk menutup panduan ini. Panduan tidak akan muncul lagi setelah ditutup.

**Kartu Ringkasan (4 kotak):**
| Kartu | Isi |
|-------|-----|
| Total Siswa | Jumlah seluruh siswa terdaftar, dengan keterangan siswa aktif |
| Instruktur | Jumlah instruktur yang terdaftar di sistem |
| Sesi Terjadwal | Sesi yang sudah dijadwalkan vs total sesi |
| Menunggu Konfirmasi | Jumlah pembayaran yang belum diverifikasi |

**Navigasi Cepat (Kelola):**  
Di bawah kartu ringkasan terdapat 4 tautan navigasi dalam tampilan grid 2×2:
- **Data Siswa** → `/admin/siswa`
- **Jadwal Instruktur** → `/admin/jadwal-instruktur`
- **Jadwal Siswa** → `/admin/jadwal-siswa`
- **Ekspor Excel** → `/admin/ekspor`

---

## 2. Kelola Data Siswa

### Lihat Daftar Siswa

1. Dari dasbor, klik **"Data Siswa"** di bagian Navigasi Cepat, atau langsung ke `/admin/siswa`.
2. Halaman **"Kelola Siswa"** menampilkan daftar semua siswa dalam format kartu vertikal.
3. Setiap baris menampilkan:
   - **Nama lengkap** siswa
   - Paket kursus, nama cabang, dan tanggal pendaftaran (contoh: "Paket Manual · Gunung Anyar · terdaftar 2026-01-15")
   - **Badge status** berwarna di sebelah kanan (lihat tabel status di bawah)

**Status Pendaftaran:**
| Status | Warna Badge | Arti |
|--------|-------------|------|
| Menunggu Bayar | Kuning/Amber | Siswa belum membayar |
| Menunggu Konfirmasi | Biru | Siswa sudah transfer, menunggu admin verifikasi |
| Terkonfirmasi | Hijau | Pembayaran sudah dikonfirmasi |
| Jadwal Dipilih | Biru/Ungu | Siswa sudah memilih jadwal sesi |
| Selesai | Abu-abu | Kursus selesai |

### Lihat & Edit Detail Siswa

1. Klik nama siswa di daftar untuk membuka halaman detail.
2. Halaman detail menampilkan:
   - **Status pendaftaran saat ini** (kartu atas)
   - Form **"Majukan Status Pendaftaran"** — tombol untuk mengubah status siswa ke tahap berikutnya
   - Form **"Edit Data Siswa"** — ubah nama, email, nomor telepon, paket, dan cabang
   - **Riwayat Pembayaran** siswa (jumlah, metode, status verifikasi)
   - **Jadwal Sesi** yang sudah dipesan siswa

### Cara Majukan Status Siswa

1. Buka halaman detail siswa (klik dari daftar `/admin/siswa`).
2. Di bagian **"Majukan Status Pendaftaran"**, klik tombol yang menampilkan nama status berikutnya.
   - Contoh: jika status saat ini "Menunggu Konfirmasi", tombol akan bertuliskan **"Terkonfirmasi"**
3. Status diperbarui secara langsung. Urutan status hanya bisa maju satu langkah, tidak bisa melompati tahap.

> **Peraturan status:** Urutan wajib: Menunggu Bayar → Menunggu Konfirmasi → Terkonfirmasi → Jadwal Dipilih → Selesai. Tidak bisa mundur atau melompat.

### Cara Edit Data Siswa

1. Buka halaman detail siswa.
2. Di bagian **"Edit Data Siswa"**, ubah field yang diperlukan:
   - Nama Lengkap
   - Email
   - Nomor Telepon
   - Paket (pilih dari daftar)
   - Cabang (pilih dari daftar)
3. Klik tombol **"Simpan Perubahan"**.
4. Jika berhasil, muncul pesan konfirmasi di bawah form.

---

## 3. Kelola Jadwal Instruktur & Jadwal Siswa

### Jadwal Instruktur

Halaman ini digunakan untuk mengatur **ketersediaan slot waktu instruktur** — kapan instruktur bisa mengajar.

1. Klik **"Jadwal Instruktur"** di navigasi cepat dasbor, atau buka `/admin/jadwal-instruktur`.
2. Di bagian **"Tambah Sesi Baru"**, isi:
   - **Instruktur** — pilih dari daftar dropdown
   - **Tanggal** — pilih tanggal sesi
   - **Waktu Mulai** dan **Waktu Selesai**
   - Status sesi (tersedia/dipesan/selesai)
3. Klik **"Tambah Sesi"** untuk menyimpan.
4. Di bawah form tambah, Anda bisa melihat daftar sesi per instruktur. Setiap sesi bisa diedit atau dihapus dari sini.

### Jadwal Siswa (Anti-Bentrok)

Halaman ini digunakan untuk melihat **semua booking sesi aktif** dan memindahkan siswa jika ada konflik jadwal.

1. Klik **"Jadwal Siswa"** di navigasi cepat, atau buka `/admin/jadwal-siswa`.
2. Halaman menampilkan **ringkasan** di atas: jumlah sesi aktif dan jumlah slot yang tersedia.
3. Di bagian **"Sesi Aktif"**, setiap booking menampilkan:
   - Nama siswa
   - Nama instruktur dan cabang
   - Tanggal dan jam sesi

### Cara Menangani Konflik Jadwal

Sistem secara otomatis **menolak booking yang bentrok** — satu instruktur tidak bisa memiliki dua sesi di waktu yang sama. Jika siswa ingin pindah jadwal atau ada konflik:

1. Di halaman `/admin/jadwal-siswa`, cari sesi yang perlu dipindahkan.
2. Klik tombol **"Pindahkan"** pada baris sesi tersebut.
3. Pilih slot baru dari dropdown **"Pindahkan ke Slot"** (hanya menampilkan slot tersedia/bookable).
4. Klik **"Konfirmasi Pindah"**.
5. Sistem akan memvalidasi: jika slot baru juga sudah terisi, pemindahan akan ditolak dengan pesan error.

Jika ingin membatalkan sesi:
1. Klik tombol **"Batalkan"** pada baris sesi.
2. Sesi dikembalikan ke status "tersedia" dan siswa kehilangan booking-nya.

---

## 4. Terima Notifikasi & Konfirmasi Pembayaran

### Cara Notifikasi Bekerja

Ketika siswa mengunggah bukti transfer QRIS, sistem otomatis membuat entri pembayaran berstatus **"Pending"**. Admin akan melihat notifikasi di dasbor.

**Notifikasi di dasbor:**  
Jika ada pembayaran menunggu, muncul banner biru muda di atas ringkasan:
> 🔔 **[N] pembayaran menunggu konfirmasi**

Klik banner tersebut untuk langsung menuju antrean pembayaran.

### Cara Konfirmasi Pembayaran

1. Di dasbor (`/admin`), gulir ke bagian **"Pembayaran Menunggu Konfirmasi"**.
2. Setiap entri pembayaran menampilkan:
   - Nama siswa
   - Nama paket, metode pembayaran (QRIS), dan tanggal pengiriman
   - Jumlah (dalam format Rupiah)
3. Di bawah informasi pembayaran, ada dua tombol aksi:
   - Tombol **hijau "Konfirmasi"** — pembayaran diverifikasi, status siswa berubah ke "Terkonfirmasi"
   - Tombol **merah "Tolak"** — pembayaran ditolak, siswa dapat mengirim ulang bukti

4. Klik tombol sesuai keputusan Anda.
5. Setelah dikonfirmasi/ditolak, entri berpindah ke bagian **"Riwayat Pembayaran"** di bawah antrean.

**Yang terjadi pada siswa setelah admin mengambil tindakan:**
- Setelah **Konfirmasi**: Status pendaftaran siswa berubah ke "Terkonfirmasi" dan mereka bisa memilih jadwal sesi di halaman siswa.
- Setelah **Tolak**: Status siswa kembali ke "Menunggu Bayar" dan mereka perlu mengunggah ulang bukti transfer.

> **Penting:** Konfirmasi pembayaran ini dilakukan **secara manual** berdasarkan bukti transfer yang diunggah siswa. Pastikan jumlah, nama rekening tujuan, dan tanggal transfer sesuai sebelum mengklik Konfirmasi.

---

## 5. Invoice Otomatis & Kartu Siswa PDF

### Invoice Otomatis

Invoice dibuat **secara otomatis** oleh sistem setelah pembayaran dikonfirmasi. Admin tidak perlu membuat invoice secara manual.

**Cara siswa mengunduh invoice:**
- Siswa login ke akun mereka, buka menu **Invoice** di panel siswa (`/app/invoice`).
- Sistem menampilkan daftar pembayaran. Siswa klik **"Unduh PDF"** untuk mengunduh invoice dalam format PDF.

**Yang perlu admin ketahui:**
- Invoice dihasilkan secara real-time saat siswa mengklik tombol unduh.
- Invoice memuat: nama siswa, detail paket, jumlah yang dibayar, metode pembayaran, dan tanggal verifikasi.
- Jika ada keluhan tentang isi invoice, admin dapat mengedit data siswa (nama, paket, cabang) melalui `/admin/siswa/[id]`, dan invoice akan otomatis diperbarui.

### Kartu Siswa PDF

Kartu siswa adalah dokumen resmi yang membuktikan bahwa siswa terdaftar di Kursus Mengemudi Pulung.

**Cara siswa mengunduh kartu:**
- Siswa buka menu **Kartu Siswa** di panel siswa (`/app/kartu`).
- Klik tombol **"Unduh Kartu PDF"** untuk mengunduh.

**Yang perlu admin ketahui:**
- Kartu siswa hanya bisa diunduh oleh siswa dengan status **"Terkonfirmasi"** ke atas.
- Kartu memuat: nama siswa, paket kursus, cabang, nomor ID siswa, dan data lain dari sistem.
- Jika siswa tidak bisa mengunduh kartu, periksa status pendaftaran mereka di `/admin/siswa/[id]` — pastikan minimal sudah "Terkonfirmasi".

---

## 6. Ekspor Excel

Halaman ekspor memungkinkan admin mengunduh data operasional dalam format `.xlsx` untuk keperluan pelaporan, rekap, atau backup.

### Cara Mengunduh Data

1. Klik **"Ekspor Excel"** di navigasi cepat dasbor, atau buka `/admin/ekspor`.
2. Halaman menampilkan **tiga kartu unduh**:

| Data | Isi File |
|------|----------|
| **Data Siswa** | Nama, paket, cabang, wilayah, status pendaftaran seluruh siswa |
| **Jadwal Sesi** | Tanggal, waktu, status, instruktur, dan siswa yang memesan |
| **Pembayaran** | Jumlah, metode, status verifikasi, dan tanggal pembayaran |

3. Klik tombol biru **"Unduh .xlsx"** di kartu yang diinginkan.
4. File akan langsung terunduh ke komputer Anda.

### Impor Data (Stub Demo)

Di bagian bawah halaman ekspor terdapat area **"Impor dari Spreadsheet"** — namun ini hanya tampilan demo dan **belum aktif**. Label "Stub demo — impor belum aktif" ditampilkan jelas di sebelah judul. Fitur impor akan tersedia di versi penuh.

---

## ⚠️ PERINGATAN PENTING: Routing WhatsApp Klaster

> **BAHAYA BISNIS NYATA — BACA SEBELUM MENGHUBUNGI SISWA**
>
> Kursus Mengemudi Pulung dibagi menjadi **dua klaster operasional** dengan nomor WhatsApp admin yang berbeda. Salah menghubungi siswa ke klaster yang salah adalah bug bisnis nyata — konfirmasi jadwal bisa tidak sampai ke tim yang berwenang.
>
> ---
>
> ### Klaster A — MERR & Selatan
> **WhatsApp:** +62 811-0000-0001  
> **Wilayah:** Surabaya Selatan & Timur (MERR / Rungkut / Gunung Anyar / Pandugo / Juanda / Sidoarjo)  
> **Instagram:** @pulung_drivingcourse
>
> ### Klaster B — Manyar & Pusat
> **WhatsApp:** +62 811-0000-0002  
> **Wilayah:** Surabaya Pusat & Timur (Manyar / Bratang / Ngagel / Gubeng / Pucang)  
> **Instagram:** @pulungkursusmengemudi
>
> ---
>
> **Cara menentukan klaster yang benar:**  
> Lihat **cabang** siswa di halaman detail mereka (`/admin/siswa/[id]`). Cabang menentukan klaster:
> - Gunung Anyar, Pandugo, Juanda → **Klaster A** (+62 811-0000-0001)
> - Manyar, Pucang → **Klaster B** (+62 811-0000-0002)

---

## Pertanyaan Umum

**T: Saya tidak bisa mengakses `/admin` — diarahkan ke beranda.**  
J: Akun Anda mungkin belum memiliki peran admin. Hubungi pengelola sistem untuk mengatur peran `admin` pada akun Anda.

**T: Siswa mengeluh tidak bisa memilih jadwal setelah membayar.**  
J: Periksa status pendaftaran siswa di `/admin/siswa`. Pastikan sudah mencapai status **"Terkonfirmasi"** — jika masih "Menunggu Konfirmasi", lakukan konfirmasi pembayaran terlebih dahulu dari dasbor.

**T: Siswa mengeluh tidak bisa mengunduh kartu siswa.**  
J: Kartu siswa hanya tersedia setelah status "Terkonfirmasi". Periksa dan majukan status siswa jika diperlukan.

**T: Ada dua slot sesi di waktu yang sama untuk instruktur yang sama — apakah ini normal?**  
J: Tidak. Sistem seharusnya menolak booking bentrok secara otomatis. Jika terjadi, buka `/admin/jadwal-siswa` dan batalkan salah satu sesi yang bentrok, lalu hubungi pengembang untuk investigasi.

**T: File Excel yang diunduh kosong.**  
J: Ini normal jika belum ada data. Pastikan sudah ada siswa, sesi, atau pembayaran yang terdaftar sebelum mengunduh.

---

*Dokumen ini ditulis berdasarkan kode sumber aplikasi Pulung versi demo (Next.js 16, Clerk 7, Tailwind 4). Data bisnis (nomor WhatsApp, wilayah klaster) bersumber dari `contact.md` sebagai sumber kebenaran tunggal.*
