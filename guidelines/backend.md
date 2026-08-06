# Backend

Backend ada di folder `backend/` dan berfungsi sebagai service Node.js untuk scraping, API, autentikasi admin, serta integrasi Supabase.

## Fungsi utama

- Ambil data dari DAPO dan simpan hasil sinkronisasi.
- Sediakan endpoint API untuk frontend.
- Tangani login admin, session token, dan upload gambar ke Supabase Storage.
- Buat sitemap dari data sekolah yang tersedia.

## Struktur penting

- `backend/src/index.ts`
  - File utama Express.
  - Menyimpan route API seperti health check, daftar sekolah, detail sekolah, sync, login admin, upload image, dan sitemap.
  - Ini file pertama yang dibaca kalau ingin tahu request masuk ke mana.

- `backend/src/server.ts`
  - Entry point saat backend dijalankan.
  - Hanya mengimpor app dari `index.ts`.
  - Berguna untuk deploy dan build output.

- `backend/src/scraper.ts`
  - Inti proses scraping DAPO.
  - Mengambil HTML sekolah, parsing data, lalu menyimpan hasil ke file catalog dan Supabase.
  - Juga mengelola file debug HTML, retry, dan filtering sekolah yang cocok dengan daftar frontend.

- `backend/src/supabase.ts`
  - Semua logika Supabase ada di sini.
  - Menangani login admin, validasi session, upsert data sekolah, sinkronisasi tabel relasional, listing storage, dan upload file gambar.
  - Jika ada error database, file ini biasanya yang harus dicek pertama kali.

- `backend/src/types.ts`
  - Definisi tipe data yang dipakai scraper dan catalog.
  - Penting untuk menjaga struktur data tetap konsisten antar file.

- `backend/data/school-list.json`
  - Daftar sekolah target scraping.
  - Kalau ingin menambah atau mengurangi sekolah target, mulai dari sini.

- `backend/data/schools.json`
  - Output hasil scraping terakhir.
  - Dipakai sebagai catalog lokal untuk baca cepat.

- `backend/inspect-dapo.mjs`
  - Tool bantu untuk inspeksi halaman DAPO secara manual.

- `backend/test-login.js` dan `backend/test-parse.ts`
  - Script bantu untuk validasi login dan parsing.
  - Bukan jalur utama aplikasi, tapi berguna saat debugging.

## Alur per fitur

### 1. API publik

- `GET /api/health`
  - Dicek dari `backend/src/index.ts`.
- `GET /api/schools`
  - Mengambil catalog sekolah dari file hasil scrape.
- `GET /api/schools/:npsn`
  - Mengambil satu sekolah berdasarkan NPSN.

### 2. Sinkronisasi DAPO

- `POST /api/sync`
  - Menjalankan `syncAllSchools()` dari `backend/src/scraper.ts`.
- Alurnya:
  - baca `school-list.json`
  - ambil HTML DAPO
  - parsing data
  - simpan ke `schools.json`
  - update Supabase

### 3. Login admin

- `POST /api/admin/login`
  - Validasi username dan password admin.
  - Session token dibuat dan dipakai frontend untuk request berikutnya.

### 4. Sync data CMS ke Supabase

- `POST /api/admin/sync`
  - Menerima data sekolah dari frontend admin.
  - Menulis ulang data sekolah dan tabel relasional terkait ke Supabase.
  - Hanya boleh untuk sekolah yang sesuai dengan session admin.

### 5. Upload gambar dan storage

- `POST /api/storage/upload`
- `POST /api/admin/upload-image`
  - Dua route ini memakai handler yang sama.
  - Gambar disimpan ke Supabase Storage dengan folder sekolah yang sudah dinormalisasi.
- `GET /api/storage/files`
  - Untuk membaca file yang sudah tersimpan di storage.

### 6. Sitemap

- `/sitemap.xml`
  - Dibangun dari slug sekolah di catalog dan daftar sekolah target.
  - Path publik yang ikut dimasukkan:
    - `/`
    - `/sekolah`
    - `/statistik`
    - `/know-about-us`
    - `/sekolah/:slug`

## Konfigurasi `.env`

Backend membaca `.env` dari folder kerja saat runtime. Praktiknya, taruh file ini di root project atau di `backend/.env` saat menjalankan backend dari folder itu.

### Variabel yang dipakai

- `SUPABASE_URL`
  - URL project Supabase.
- `SUPABASE_SECRET_KEY`
  - Service role key atau secret key untuk akses backend.
- `SUPABASE_KEY`
  - Alternatif jika nama variabel lama masih dipakai.
- `SUPABASE_STORAGE_BUCKET`
  - Nama bucket storage.
  - Default: `image`.
- `ADMIN_SESSION_SECRET`
  - Secret untuk tanda tangan session admin.
- `ADMIN_PASSWORD_SALT`
  - Salt untuk hashing password admin.
- `DAPO_BASE_URL`
  - URL sumber scraping DAPO.
  - Default: `https://dapo.kemendikdasmen.go.id/`
- `SITE_URL`
  - Dipakai untuk sitemap dan URL publik.
- `LOG_LEVEL`
  - Level log pino, misalnya `info` atau `debug`.
- `DEBUG_RETENTION_DAYS`
  - Lama penyimpanan file debug HTML.
- `DEBUG_CLEANUP_ENABLED`
  - Set ke `false` kalau cleanup debug file ingin dimatikan.

### Catatan penting

- Backend akan gagal jalan kalau `SUPABASE_URL` dan `SUPABASE_SECRET_KEY` tidak tersedia.
- Session admin dibatasi per sekolah.
- Upload gambar juga dibatasi per sekolah sesuai session.

## Urutan cek kalau ada masalah

1. Cek `backend/src/index.ts` untuk route dan request masuk.
2. Cek `backend/src/supabase.ts` kalau masalah login, sync, atau storage.
3. Cek `backend/src/scraper.ts` kalau data DAPO tidak masuk.
4. Cek `backend/data/school-list.json` kalau sekolah target salah.
5. Cek `.env` kalau koneksi Supabase atau DAPO gagal.

