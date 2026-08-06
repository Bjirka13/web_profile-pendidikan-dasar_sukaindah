# Guidelines

Folder `guidelines/` berisi dokumentasi kerja yang dipakai untuk menentukan urutan perubahan pertama.

Intinya bukan daftar aturan abstrak, tetapi panduan praktis untuk menjawab:
"Apa yang perlu diketahui sekretaris desa dan operator sebelum memutuskan perubahan apa yang akan dilakukan pertama kali."

## Urutan baca

1. `README.md`
2. `backend.md`
3. `frontend.md`

## Isi folder

- `README.md`
  - Ringkasan arah proyek dan keputusan awal.
- `backend.md`
  - Penjelasan backend, file penting, dan konfigurasi `.env`.
- `frontend.md`
  - Penjelasan frontend, struktur folder, dan konfigurasi `.env`.
- `keyword-index.md`
  - Peta istilah cepat untuk merujuk kembali ke bagian penting.
- `Proker-RD-Juknis.md`
  - Latar program kerja, rancangan detail, dan petunjuk teknis.
- `Supabase-Database-Design.md`
  - Catatan desain database dan alasan pemisahan tabel.
- `supabase-schema.sql`
  - Contoh schema SQL yang bisa dipakai sebagai referensi implementasi.

## Prinsip dokumentasi

- Jelaskan dulu keputusan, baru teknis.
- Prioritaskan perubahan yang paling berpengaruh ke data, akses, dan alur kerja.
- Sekretaris desa dan operator harus tahu mana yang aman diubah, mana yang harus lewat backend, dan mana yang cukup di frontend.
- Kalau satu perubahan bisa mempengaruhi banyak sekolah, dokumentasikan dulu dampaknya sebelum dieksekusi.

