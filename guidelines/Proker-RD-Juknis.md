# Program Kerja, Rancangan Detail, dan Juknis
# Portal Informasi Sekolah Dasar Berbasis Data DAPO

## 1. Program Kerja

### Nama program
Pembangunan portal informasi sekolah dasar berbasis data DAPO untuk mendukung digitalisasi informasi pendidikan.

### Tujuan

1. Menyediakan portal informasi sekolah yang rapi dan mudah diakses.
2. Menggunakan data DAPO sebagai sumber sinkronisasi data sekolah.
3. Menyediakan halaman detail sekolah yang cukup lengkap untuk publik.
4. Memberi jalur update konten yang jelas untuk operator dan pengelola desa.

### Sasaran

- Masyarakat umum yang ingin melihat profil sekolah.
- Orang tua siswa yang membutuhkan informasi cepat.
- Operator sekolah atau pengelola konten yang mengubah data sekolah.
- Sekretaris desa yang perlu memahami perubahan mana yang aman dilakukan lebih dulu.

### Output

- Portal web sekolah yang bisa diakses online.
- Halaman daftar sekolah.
- Halaman detail sekolah.
- Backend scraper dan API untuk sinkronisasi data.
- Dokumentasi kerja dan pedoman implementasi.

## 2. Rancangan Detail

### Bentuk sistem saat ini

- Frontend: React + Vite.
- Backend: Node.js + Express + TypeScript.
- Database: Supabase.
- Artikel berita beranda: WordPress.

### Pembagian peran komponen

1. Frontend publik
   - Menampilkan beranda, direktori sekolah, halaman detail, statistik, dan halaman about.
2. Frontend admin
   - Dipakai untuk login, edit data sekolah, upload gambar, dan sinkronisasi perubahan.
3. Backend
   - Menyediakan API publik.
   - Menjalankan scraping DAPO.
   - Mengelola login admin, upload storage, dan sitemap.
4. Supabase
   - Menyimpan data sekolah, data sinkronisasi, konten sekolah, dan file media.

### Urutan kerja yang disarankan

1. Rapikan sumber data dan skema Supabase terlebih dahulu.
2. Pastikan backend bisa login, sinkron, dan upload gambar dengan benar.
3. Pastikan frontend membaca data dari Supabase dengan struktur yang konsisten.
4. Baru sesuaikan tampilan atau konten tambahan jika data dasarnya sudah stabil.

## 3. Petunjuk Teknis

### A. Prinsip kerja

- Bedakan data inti, data konten, dan data media.
- Jangan mencampur logika scraping dengan logika CMS.
- Kalau perubahan menyentuh banyak sekolah sekaligus, validasi dulu dampaknya.

### B. Backend

- `backend/src/index.ts`
  - Route API, sitemap, login admin, sync admin, dan upload image.
- `backend/src/scraper.ts`
  - Scrape DAPO, parsing HTML, simpan catalog, dan update Supabase.
- `backend/src/supabase.ts`
  - Semua operasi database, storage, login admin, dan session token.
- `backend/src/types.ts`
  - Struktur data yang dipakai antar modul.
- `backend/data/school-list.json`
  - Daftar target sekolah untuk scraper.

### C. Frontend

- `src/app/routes.ts`
  - Daftar halaman yang tersedia.
- `src/app/cms/school-cms.tsx`
  - Load data sekolah, login admin, sync, dan upload gambar.
- `src/app/data/schools.ts`
  - Bentuk data utama sekolah di frontend.
- `src/app/pages/Admin.tsx`
  - UI edit konten sekolah.
- `src/app/pages/SchoolDetail.tsx`
  - Halaman detail sekolah yang paling lengkap.

### D. Data yang perlu dijaga

- Identitas sekolah: `slug`, `npsn`, `name`.
- Data ringkas: alamat, status, akreditasi, tahun berdiri, kontak.
- Data statistik: siswa, guru, rombel, fasilitas.
- Konten sekolah: kepala sekolah, staf, guru, prestasi, berita, galeri.
- Media: gambar hero, card, foto personel, dan galeri.

### E. Kriteria perubahan pertama yang aman

1. Jika data sekolah belum stabil, ubah backend dan Supabase dulu.
2. Jika data sudah stabil, baru ubah tampilan frontend.
3. Jika konten berita yang berubah, WordPress bisa dipisahkan dari CMS sekolah.
4. Jika hanya satu sekolah yang terdampak, cek session admin dan relasi sekolahnya.

## 4. Juknis singkat untuk tim

### Untuk sekretaris desa

- Prioritaskan perubahan yang tidak merusak struktur data sekolah.
- Pastikan ada pemisahan antara data publik, konten desa, dan konten operator.
- Minta penjelasan dampak sebelum menyetujui perubahan besar.

### Untuk operator

- Gunakan backend dan CMS untuk perubahan yang menyangkut data sekolah.
- Gunakan upload image melalui jalur backend, bukan menyimpan manual ke storage.
- Cek kembali sekolah yang dipilih sebelum menyimpan perubahan.

### Untuk pengembang

- Jaga tipe data frontend dan backend tetap konsisten.
- Bila menambah fitur baru, tentukan dulu apakah masuk `schools`, tabel relasional, atau storage.
- Dokumentasikan perubahan besar di folder `guidelines/`.

