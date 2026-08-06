# Frontend

Frontend ada di folder `src/` dan dibangun dengan React + Vite.
Fokusnya ada di halaman publik, halaman detail sekolah, dan halaman admin CMS.

## Struktur utama

- `src/main.tsx`
  - Entry point React.
  - Biasanya hanya render aplikasi utama.

- `src/app/App.tsx`
  - Root component aplikasi.
  - Membungkus router dengan `SchoolCmsProvider`.

- `src/app/routes.ts`
  - Daftar route aplikasi.
  - Ini file utama kalau ingin tahu halaman apa saja yang tersedia.

- `src/app/pages/`
  - Semua halaman utama ada di sini.

- `src/app/components/`
  - Komponen UI reusable seperti layout, section, dan komponen kecil lain.

- `src/app/cms/school-cms.tsx`
  - Pusat state CMS.
  - Load data sekolah dari Supabase, simpan perubahan ke backend, login admin, logout, dan upload gambar.

- `src/app/data/schools.ts`
  - Definisi tipe data frontend dan struktur sekolah lengkap.
  - Sangat penting karena banyak komponen bergantung pada bentuk data ini.

- `src/styles/`
  - CSS global, tema, font, dan styling dasar.

- `src/image/`
  - Aset gambar lokal untuk halaman home, detail sekolah, dan placeholder.

## File penting per halaman

### Halaman publik

- `src/app/pages/Home.tsx`
  - Beranda utama.
  - Menampilkan hero, statistik, sambutan, artikel WordPress, dan daftar sekolah.

- `src/app/pages/Schools.tsx`
  - Direktori semua sekolah.
  - Menampilkan kartu sekolah dan tombol menuju detail.

- `src/app/pages/SchoolDetail.tsx`
  - Halaman detail sekolah.
  - Menampilkan sejarah, sambutan, visi misi, struktur, fasilitas, statistik, prestasi, berita, galeri, dan kontak.

- `src/app/pages/Statistics.tsx`
  - Ringkasan statistik agregat.

- `src/app/pages/About.tsx`
  - Halaman about yang sengaja dibuat statis.

- `src/app/pages/NotFound.tsx`
  - Fallback untuk route yang tidak ditemukan.

### Halaman admin

- `src/app/pages/Admin.tsx`
  - UI admin untuk login, edit data sekolah, upload gambar, dan sinkronisasi.
  - Ini halaman yang paling sensitif terhadap perubahan struktur data.

## Komponen penting

- `src/app/components/Layout.tsx`
  - Struktur navbar dan footer.

- `src/app/components/Header.tsx`
  - Header visual atau elemen navigasi tambahan.

- `src/app/components/WordPressPosts.tsx`
  - Mengambil postingan dari WordPress lewat `VITE_WORDPRESS_URL`.
  - Hanya muncul kalau URL WordPress sudah diisi.

- `src/app/components/StatsSection.tsx`
  - Menampilkan statistik utama dari data sekolah.

- `src/app/components/SchoolsSection.tsx`
  - Bagian daftar sekolah di beranda.

- `src/app/components/SchoolDetailDialog.tsx`
  - Dialog detail sekolah jika dipakai di halaman tertentu.

- `src/app/components/WelcomeSection.tsx`
  - Section sambutan di beranda.

- `src/app/components/ui/`
  - Komponen UI dasar seperti button, dialog, input, tabs, dan sebagainya.

## Alur data frontend

1. `SchoolCmsProvider` di `src/app/cms/school-cms.tsx` load data sekolah dari Supabase.
2. Halaman publik membaca data dari provider, bukan dari fetch acak di tiap page.
3. Login admin disimpan di `localStorage` sebagai session.
4. Saat admin edit data, frontend kirim perubahan ke backend untuk disimpan ke Supabase.
5. Upload gambar juga lewat backend agar session dan folder sekolah tetap aman.

## Data yang sebaiknya dipahami dulu

- `src/app/data/schools.ts`
  - Definisi `SchoolFull`, `TeacherStaff`, `Facility`, `Achievement`, `NewsItem`, `GalleryItem`, `GradeStats`, dan `RoleStats`.
  - Jika tipe ini berubah, banyak file lain ikut terdampak.

- `src/app/cms/school-cms.tsx`
  - Mengatur mapping data Supabase ke bentuk `SchoolFull`.
  - Kalau data tidak tampil benar, biasanya masalahnya ada di file ini.

## Konfigurasi `.env`

Frontend membaca variabel dari Vite.

### Variabel yang dipakai

- `VITE_BACKEND_URL`
  - Base URL backend.
  - Dipakai untuk login admin, sync, dan upload file.
- `VITE_SUPABASE_URL`
  - URL project Supabase.
- `VITE_SUPABASE_PUBLISHABLE_KEY`
  - Publishable key untuk akses frontend.
- `VITE_SUPABASE_STORAGE_BUCKET`
  - Nama bucket storage.
  - Default: `image`.
- `VITE_WORDPRESS_URL`
  - URL WordPress untuk artikel di beranda.

### Catatan penting

- Kalau `VITE_BACKEND_URL` salah, login admin dan upload gambar akan gagal.
- Kalau `VITE_SUPABASE_URL` atau `VITE_SUPABASE_PUBLISHABLE_KEY` belum ada, CMS tidak bisa load data dari Supabase.
- Kalau `VITE_WORDPRESS_URL` kosong, section WordPress tidak ditampilkan.

## Urutan cek kalau ada masalah

1. Cek `src/app/cms/school-cms.tsx` kalau data tidak muncul atau login gagal.
2. Cek `src/app/routes.ts` kalau halaman tidak bisa dibuka.
3. Cek `src/app/data/schools.ts` kalau tipe data tidak cocok.
4. Cek `src/app/pages/Admin.tsx` kalau proses edit atau sync bermasalah.
5. Cek `.env.local` atau `.env` frontend kalau koneksi ke backend atau Supabase gagal.

