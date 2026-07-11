
  # Web Portal Pendidikan Dasar

  This is a code bundle for Web Portal Pendidikan Dasar. The original project is available at https://www.figma.com/design/ULTGPQr5ZfnLTosVs9PvfM/Web-Portal-Pendidikan-Dasar.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

## WordPress CMS setup

  1. Install WordPress di domain atau subdomain Anda.
  2. Buat postingan di admin WordPress.
  3. Salin URL WordPress Anda, misalnya https://cms.example.com.
  4. Di Vercel, tambahkan environment variable:
     - `VITE_WORDPRESS_URL=https://cms.example.com`
5. Deploy ulang project.

Dengan cara ini, admin bisa edit konten lewat WordPress, sementara website tetap di Vercel. Bagian About Us sengaja dikecualikan agar tetap statis dan tidak berubah dari CMS.

## Supabase CMS setup

1. Copy `.env.example` menjadi `.env.local` di root project.
2. Isi:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` atau `VITE_SUPABASE_ANON_KEY`
3. Buka `/admin`.
4. Login pakai akun berikut:
   - `ops1` / `ops1-2026`
   - `ops2` / `ops2-2026`
   - `ops3` / `ops3-2026`
   - `ops4` / `ops4-2026`
5. Klik `Sync Supabase` untuk seed data awal ke database.

Kalau Supabase aktif, admin panel akan load dan sync data sekolah lewat Supabase, lalu tetap memakai `localStorage` sebagai cache lokal. Akun ops hanya bisa edit sekolah yang sesuai, termasuk berita dan koleksi di sekolah itu saja.

## Mapping data scraping

1. Scraper backend hanya menulis data inti ke Supabase:
   - `schools`
   - `school_sync_status`
   - `school_role_stats`
   - `school_facilities_ui`
   - `school_role_stats` dipakai frontend publik untuk angka siswa dan guru
2. Konten CMS tetap dikelola dari admin frontend:
   - `school_principals`
   - `school_staff`
   - `school_teachers`
   - `school_achievements`
   - `school_news`
   - `school_gallery`
   - `school_ui_contents`
3. Pastikan RLS/policy di Supabase mengizinkan service role backend untuk insert/update tabel scrape, dan hanya memberi akses baca/publik sesuai kebutuhan frontend.
  
