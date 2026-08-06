# Guidelines Overview

Dokumentasi ini disusun untuk menjawab satu hal utama:
"Apa yang perlu diketahui sekretaris desa dan operator sebelum memutuskan perubahan apa yang akan dilakukan pertama kali."

## Cara baca

1. Baca file ini dulu untuk memahami arah keputusan.
2. Lanjut ke `backend.md` kalau ingin tahu sumber data, scraper, API, dan konfigurasi server.
3. Lanjut ke `frontend.md` kalau ingin tahu struktur UI, CMS, dan halaman yang akan berubah di sisi pengguna.

## Keputusan awal yang paling penting

Sebelum mengubah fitur apa pun, tentukan dulu 3 hal ini:

1. Sumber data utama
   - Apakah data sekolah tetap diambil dari Supabase.
   - Apakah scraping DAPO hanya dipakai untuk sinkronisasi.
   - Apakah WordPress hanya untuk artikel beranda.

2. Siapa yang berhak mengubah apa
   - Sekretaris desa biasanya butuh kontrol konten dan validasi.
   - Operator biasanya butuh akses edit data sekolah dan upload gambar.
   - Akun admin di aplikasi saat ini dibatasi per sekolah.

3. Urutan perubahan pertama
   - Jika data belum stabil, rapikan backend dan Supabase dulu.
   - Jika struktur konten sudah jelas, rapikan frontend CMS dan page detail.
   - Jika publikasi berita penting, aktifkan WordPress sebagai jalur terpisah.

## Ringkasan arsitektur

- `backend/` menangani API, scraping DAPO, login admin, dan upload storage ke Supabase.
- `src/` menangani frontend React, halaman publik, dan halaman admin CMS.
- Supabase dipakai sebagai sumber data utama untuk konten sekolah dan media.
- WordPress dipakai hanya untuk konten artikel yang memang sengaja dipisahkan.

## File yang sebaiknya dibaca dulu

- `backend.md`
- `frontend.md`
- `../README.md`

## Prinsip revisi dokumentasi

- Jelaskan dulu alur kerja, baru detail file.
- Bedakan data publik, data CMS, dan data scraping.
- Jangan ubah struktur kalau belum jelas dampaknya ke sekolah yang sudah ada.
- Kalau ada perubahan besar, cek dulu apakah menyentuh `Supabase`, `backend`, atau `frontend` lebih dulu.

## Versi singkat untuk sekretaris desa

Kalau hanya perlu keputusan cepat, pakai urutan ini:

1. Tentukan dulu apakah yang mau diubah adalah data, tampilan, atau berita.
2. Kalau yang diubah data sekolah, mulai dari backend dan Supabase.
3. Kalau yang diubah hanya isi halaman atau layout, fokus ke frontend.
4. Kalau yang diubah berita beranda, itu masuk ke WordPress, bukan CMS sekolah.
5. Kalau perubahan menyangkut banyak sekolah sekaligus, validasi dampaknya sebelum jalan.

### Hal yang paling aman diubah lebih dulu

- Teks sambutan.
- Artikel WordPress beranda.
- Konten galeri atau berita sekolah yang hanya berdampak ke satu sekolah.

### Hal yang perlu lebih dulu dicek

- `school_admins` untuk hak akses.
- `schools` untuk data inti.
- `school_sync_status` untuk histori sinkronisasi.
- `VITE_BACKEND_URL` dan `SUPABASE_URL` kalau data tidak muncul.

## Urutan prioritas perubahan

| Prioritas | Area | Kenapa dikerjakan lebih dulu | Dampak kalau salah |
| --- | --- | --- | --- |
| 1 | Supabase schema dan akses | Ini fondasi semua data sekolah dan hak akses admin | Login gagal, data tidak sinkron, atau tabel tidak bisa ditulis |
| 2 | Backend sync dan upload | Backend menghubungkan scraping, CMS, dan storage | Data tidak masuk, gambar tidak terunggah, atau admin gagal simpan |
| 3 | Data inti sekolah | Nama, slug, NPSN, alamat, status, statistik | Routing rusak atau halaman detail tampil tidak konsisten |
| 4 | Frontend CMS | Form edit, daftar sekolah, dan detail sekolah | Operator sulit mengelola data, tapi data inti masih aman |
| 5 | WordPress berita | Konten artikel beranda terpisah dari data sekolah | Hanya mempengaruhi tampilan berita, relatif paling aman |
| 6 | Styling dan polish UI | Perubahan visual tanpa mengubah data | Risiko fungsional paling kecil |

## Cara memakai tabel prioritas

- Kalau ada konflik antara kebutuhan tampilan dan data, pilih data dulu.
- Kalau ada konflik antara CMS dan publik, pastikan publik tetap stabil.
- Kalau hanya ingin perbaikan cepat untuk sekretaris desa, mulai dari prioritas 1 sampai 3.
- Kalau hanya ingin pembaruan konten, biasanya cukup prioritas 4 sampai 6.
