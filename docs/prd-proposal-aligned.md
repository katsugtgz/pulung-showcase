# PRD — Demo Pulung, Sesuai Proposal RW Dev

> **Status:** draft, siap di-`/to-spec`.
> **Keputusan scope (2026-07-17):** Demo dibangun **sesuai proposal RW Dev** — bukan sekadar landing page. Artinya seluruh alur di `assets/application-flow.png` harus terwakili: sisi **Siswa** (register → invoice/kartu) **dan** sisi **Admin** (kelola siswa, jadwal, konfirmasi bayar).
> **Sumber kebenaran:** `Proposal Pulung.md`, `Pulung Proposal July 17 2026.md`, `assets/application-flow.png`, `contact.md`. Data bisnis hanya dari modul `catalog-data` + `contact.md`.

---

## 1. Latar & tujuan

Sistem web untuk Kursus Mengemudi Pulung yang, sesuai proposal, bertujuan **meningkatkan efisiensi kerja admin** (transisi dari input manual ke otomatis) dan **mempermudah pendaftaran + pemilihan jadwal bagi siswa**. Demo ini adalah prototipe yang mendemonstrasikan seluruh alur proposal secara end-to-end, dengan integrasi berat di-*mock* seperlunya (lihat §6).

Manfaat (dari proposal):
- Calon pelanggan dapat info produk lewat landing page.
- Admin merekap data siswa & membagi jadwal instruktur.
- Siswa mendaftar & memilih jadwal secara mandiri.

## 2. Kesenjangan vs kondisi sekarang (kenapa PRD ini ada)

Slice #1–#17 yang sudah ada hanya mencakup **landing page + enrollment siswa parsial**. Yang **hilang total** dari rencana dan wajib ditambah agar sesuai proposal:

- **Seluruh dashboard Admin** — kelola data siswa, kelola jadwal instruktur, kelola jadwal siswa, konfirmasi pembayaran manual, notifikasi pembayaran.
- **Langkah akhir alur Siswa** — *Pemilihan jadwal*, *Invoice*, *Kartu siswa (PDF)*.
- **Integrasi spreadsheet Excel** (impor/ekspor data siswa & jadwal).

Yang sudah/akan ada dan tetap dipakai: landing page (#1–#4, #13–#17), Clerk auth (#5), katalog paket (#2, #6), mock QRIS (#7). Catatan: **WhatsApp cluster routing (#3, #16) adalah tambahan di luar proposal** — dipertahankan sebagai fitur landing page, tapi ditandai sebagai *enhancement*, bukan bagian scope proposal.

## 3. Persona

| Persona | Siapa | Kebutuhan utama |
|---|---|---|
| **Calon siswa (awam/non-teknis)** | Pengunjung landing page | Info paket + cara daftar yang jelas |
| **Siswa terdaftar** | Sudah register/login | Pilih paket → bayar → pilih jadwal → terima kartu |
| **Admin (staff Pulung)** | Pegang dashboard | Rekap siswa, atur jadwal instruktur/siswa, konfirmasi bayar |

## 4. Alur produk (dari diagram — sumber kebenaran)

### 4.1 Siswa
`Register → Login → Pemilihan paket → Bayar via QRIS → [Berhasil?] → Pemilihan jadwal → Invoice & Kartu siswa (PDF) → Logout`
Loop: jika bayar **gagal**, kembali ke *Bayar via QRIS*.

### 4.2 Admin
`Login → { Kelola jadwal instruktur | Kelola data siswa | Kelola jadwal siswa } → Logout`
Ditambah dari fitur proposal (implisit di diagram, eksplisit di tabel fitur): **notifikasi pembayaran** masuk + **konfirmasi pembayaran manual** → memicu **invoice otomatis** + **kartu siswa**.

## 5. Fitur & kriteria (dipetakan dari tabel proposal)

| # | Fitur (proposal) | Ringkasan kebutuhan |
|---|---|---|
| F1 | Katalog pilihan kelas | Tampilkan jenis kelas (matic/manual/campuran) dari `catalog-data`. |
| F2 | Pendaftaran siswa | Register + pendataan siswa; ekspor ke Excel. |
| F3 | Jadwal tersedia | Admin atur/pilih/pindah/tutup slot jadwal; siswa pilih slot; anti-bentrok. Sinkron Excel. |
| F4 | Pembayaran online | QRIS + **konfirmasi manual admin** (demo: mock QRIS, tombol konfirmasi admin nyata). |
| F5 | Notifikasi pembayaran | Admin dapat notif setelah siswa bayar. |
| F6 | Invoice | Nota otomatis setelah pembayaran dikonfirmasi. |
| F7 | Kartu siswa | Kartu digital **PDF** berisi jadwal pilihan siswa. |

## 6. Demo-scoping: nyata vs mock

Karena ini prototipe, integrasi berat di-mock **tanpa mengubah alur**:

- **Auth** — nyata (Clerk), role `admin` vs `siswa`.
- **QRIS** — **mock** (tampilkan QR statis + tombol simulasi bayar). Konfirmasi manual admin **nyata** (mengubah state enrollment).
- **Data siswa/jadwal** — nyata di store demo (seeded), CRUD berfungsi.
- **Invoice & Kartu siswa** — **PDF nyata** (generate on the fly), karena ini yang paling "wow" saat demo.
- **Excel** — ekspor **nyata** (unduh .xlsx); impor boleh stub bila mahal.
- **Notifikasi** — in-app (badge/list), bukan push/email.

## 7. Kompleksitas yang tak terhindarkan ("kodratnya ribet")

Jaga tetap simpel di mana bisa; terima kompleksitas hanya di dua area ini:
- **Penjadwalan (F3)** — kelola jadwal instruktur + jadwal siswa dengan **anti-bentrok** adalah inti kerumitan. Tidak bisa disederhanakan tanpa menghilangkan nilai proposal.
- **Rantai pasca-bayar (F4→F5→F6→F7)** — state machine: `pilih paket → menunggu bayar → menunggu konfirmasi admin → terkonfirmasi → jadwal dipilih → invoice+kartu terbit`. Satu sumber kebenaran state, hindari cabang liar.

Semua di luar dua area itu (landing, register/login, pilih paket) **wajib tetap 2–3 tap**.

## 8. Epics untuk `/to-spec` (vertical slices, urut dependensi)

Landing page & auth dianggap sudah berjalan (#1–#5). PRD ini menambah:

1. **E1 — Siswa: pilih paket → enrollment state** (perluas #6/#7): buat entitas enrollment + state machine dasar.
2. **E2 — Siswa: mock QRIS + retry loop** sesuai node *Berhasil?* (perluas #7).
3. **E3 — Admin: shell dashboard + role-gating** (Clerk role `admin`), nav ke tiga modul.
4. **E4 — Admin: kelola data siswa** (list/detail/edit) + **ekspor Excel** (F2).
5. **E5 — Admin: notifikasi bayar + konfirmasi manual** → transisi state enrollment (F4/F5).
6. **E6 — Jadwal: model slot + kelola jadwal instruktur** (admin, F3).
7. **E7 — Jadwal: siswa pilih jadwal** (anti-bentrok, setelah bayar terkonfirmasi) + **admin kelola jadwal siswa** (F3).
8. **E8 — Invoice otomatis** (F6) — terbit saat konfirmasi.
9. **E9 — Kartu siswa PDF** (F7) — berisi jadwal terpilih.
10. **E10 — Sinkron/ekspor Excel jadwal** (F3) + finalisasi.
11. **E11 — Docs: onboarding admin** (in-app checklist + panduan langkah-bernomor + screenshot).
12. **E12 — Docs: tutorial siswa friendly** (task-based, inline, Bahasa Indonesia awam).

Dependensi inti: E1 → (E2, E3). E3 → (E4, E5, E6). E5 → E8 → E9. E6 → E7. E11/E12 **paling akhir** (butuh UI jadi agar screenshot & alur tak basi).

## 9. Non-goals (demo)

- Push/email/WA notification nyata (cukup in-app).
- Payment gateway QRIS produksi (mock).
- Multi-tenant / manajemen cabang penuh (pakai data seed 2 cluster).
- Impor Excel dua arah penuh (ekspor cukup; impor boleh stub).

## 10. Hard rules (dari AGENTS.md, berlaku di semua epic)

- Semua string user-facing **Bahasa Indonesia**.
- Palet: primary #1E6FB8, accent #D22B3A; **jangan** ungu #5e4399.
- Data bisnis hanya dari `catalog-data` + `contact.md`; routing WA cluster A/B tepat.
- QA pakai `agent-browser` (Playwright dilarang); placeholder image via `agy`.
- Gate lokal: `pnpm build`, react-doctor 100, Lighthouse ≥0.9, `pnpm test`. CI GitHub diabaikan (billing).

---

*Selanjutnya: jalankan `/to-spec` pada file ini per-epic (E1–E12), lalu `/to-tickets` → `/to-issues` dengan review gate di main loop. Testimoni tetap placeholder (riset round 1–2: nol ulasan terverifikasi).*
