# Web Portal Pendidikan Dasar

Project ini berisi portal informasi sekolah dasar dengan frontend React + Vite, backend scraper/API, dan Supabase sebagai sumber data utama.

## Mulai baca dulu

Kalau tujuanmu adalah menentukan perubahan pertama yang aman untuk sekretaris desa dan operator, baca dokumentasi ini dulu:

1. [guidelines/README.md](/D:/KKN/Proker%20Web/Ide%20untuk%20page%20detail%20sekolah/guidelines/README.md)
2. [guidelines/backend.md](/D:/KKN/Proker%20Web/Ide%20untuk%20page%20detail%20sekolah/guidelines/backend.md)
3. [guidelines/frontend.md](/D:/KKN/Proker%20Web/Ide%20untuk%20page%20detail%20sekolah/guidelines/frontend.md)

## Menjalankan project

```bash
npm i
npm run dev
```

Kalau hanya ingin:

- frontend: `npm run dev:frontend`
- backend: `npm run dev:backend`

## Alur singkat

- Frontend membaca data sekolah dari Supabase melalui CMS provider.
- Backend menangani scraping DAPO, sinkronisasi data, login admin, upload gambar, dan sitemap.
- WordPress dipakai hanya untuk artikel beranda yang sengaja dipisahkan dari data sekolah.

## Konfigurasi environment

Gunakan file `.env.example` sebagai referensi.

### Frontend

- `VITE_BACKEND_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_STORAGE_BUCKET`
- `VITE_WORDPRESS_URL`

### Backend

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `ADMIN_SESSION_SECRET`
- `ADMIN_PASSWORD_SALT`
- `DAPO_BASE_URL`
- `SITE_URL`
- `LOG_LEVEL`
- `DEBUG_RETENTION_DAYS`
- `DEBUG_CLEANUP_ENABLED`

## WordPress CMS

Jika artikel beranda ingin diubah dari WordPress:

1. Install WordPress di domain atau subdomain.
2. Buat postingan dari admin WordPress.
3. Isi `VITE_WORDPRESS_URL`.
4. Deploy ulang frontend.

Bagian ini terpisah dari data sekolah supaya berita bisa diubah tanpa mengganggu struktur CMS sekolah.

## Supabase CMS setup

1. Copy `.env.example` menjadi `.env.local` di root project.
2. Isi `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, dan `VITE_BACKEND_URL`.
3. Pastikan backend juga punya `SUPABASE_URL` dan `SUPABASE_SECRET_KEY`.
4. Buka `/admin`.
5. Login dengan akun admin yang sudah ditetapkan di Supabase.
6. Gunakan `Sync Supabase` untuk mendorong perubahan ke database.

## Data flow yang perlu diingat

1. Scraper backend menulis data inti ke:
   - `schools`
   - `school_sync_status`
   - `school_role_stats`
   - `school_facilities_ui`
2. CMS frontend menulis konten sekolah ke:
   - `school_principals`
   - `school_staff`
   - `school_teachers`
   - `school_achievements`
   - `school_news`
   - `school_gallery`
3. File gambar disimpan ke Supabase Storage lewat backend agar session dan folder sekolah tetap terkontrol.

## Dokumentasi teknis

- [guidelines/Proker-RD-Juknis.md](/D:/KKN/Proker%20Web/Ide%20untuk%20page%20detail%20sekolah/guidelines/Proker-RD-Juknis.md)
- [guidelines/Supabase-Database-Design.md](/D:/KKN/Proker%20Web/Ide%20untuk%20page%20detail%20sekolah/guidelines/Supabase-Database-Design.md)
- [guidelines/keyword-index.md](/D:/KKN/Proker%20Web/Ide%20untuk%20page%20detail%20sekolah/guidelines/keyword-index.md)

