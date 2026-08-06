# Supabase Database Design

Dokumen ini menjelaskan skema Supabase yang dipakai oleh aplikasi saat ini.
Fokusnya adalah pemisahan data inti sekolah, data sinkronisasi, konten CMS, dan media.

## Tujuan desain

1. Menyimpan data sekolah yang dipakai frontend publik.
2. Menyimpan data hasil scraping DAPO.
3. Menyimpan konten CMS sekolah yang bisa diedit operator.
4. Menyimpan file media di Supabase Storage dengan jalur yang konsisten.

## Prinsip desain

1. `schools` adalah tabel utama.
2. `school_sync_status` menyimpan histori sinkronisasi.
3. Tabel relasional dipakai untuk konten yang berubah lebih sering daripada identitas sekolah.
4. Konten UI sebaiknya dipisah dari data inti agar frontend tetap stabil.

## Tabel inti

### `schools`

Kolom penting:

- `id`
- `slug`
- `npsn`
- `name`
- `short_name`
- `tagline`
- `status`
- `accreditation`
- `year_established`
- `address`
- `kode_pos`
- `kecamatan`
- `desa`
- `contact`
- `email`
- `hero_image`
- `card_image`
- `maps_embed`
- `sync_status`
- `profile_summary`
- `profile_details`
- `facilities`
- `grade_stats`
- `total_students`
- `male_students`
- `female_students`
- `total_teachers`
- `total_classrooms`
- `total_study_groups`
- `created_at`
- `updated_at`

### Fungsi

- Menjadi sumber utama data sekolah di frontend.
- Dipakai backend untuk sinkronisasi dan sitemap.
- Menyimpan metadata yang tidak perlu dipecah ke tabel terpisah.

## Tabel sinkronisasi

### `school_sync_status`

Kolom penting:

- `id`
- `school_id`
- `status`
- `message`
- `scraped_at`
- `source_url`
- `created_at`

### Fungsi

- Menyimpan histori hasil scrape.
- Menjelaskan kapan data terakhir disinkronkan.
- Membantu audit kalau ada data yang gagal diambil.

## Tabel role statistik

### `school_role_stats`

Kolom penting:

- `id`
- `school_id`
- `role`
- `total`
- `male`
- `female`
- `scraped_at`
- `created_at`
- `updated_at`

### Fungsi

- Menyimpan statistik guru, tenaga didik, dan peserta didik.
- Dipakai frontend untuk ringkasan statistik dan grafik.

## Tabel konten CMS

### `school_principals`

- `name`
- `position`
- `photo`
- `welcome`
- `nip`

### `school_staff`

- `name`
- `position`
- `nip`
- `photo`
- `is_admin`
- `is_vice_principal`

### `school_teachers`

- `name`
- `position`
- `nip`
- `photo`

### `school_facilities_ui`

- `name`
- `description`
- `photo`
- `icon`
- `count`

### `school_achievements`

- `title`
- `year`
- `level`
- `description`
- `photo`

### `school_news`

- `id`
- `title`
- `date`
- `excerpt`
- `thumbnail`
- `category`

### `school_gallery`

- `photo`
- `caption`

### Fungsi

- Menyimpan konten yang bisa diedit dari halaman admin.
- Tetap terpisah dari data hasil scraping supaya perubahan konten tidak merusak data inti.

## Tabel akses admin

### `school_admins`

Kolom yang dipakai backend:

- `admin_email`
- `password_hash`
- `school_id`

### Fungsi

- Memetakan akun admin ke satu sekolah.
- Dipakai untuk login dan pembatasan akses.
- Menjaga agar satu akun hanya bisa mengelola sekolah yang ditugaskan.

## Storage

Backend dan frontend memakai Supabase Storage untuk media sekolah.

### Jalur umum

- `SchoolDetail/<school-folder>/school-hero`
- `SchoolDetail/<school-folder>/school-card`
- `SchoolDetail/<school-folder>/principal`
- `SchoolDetail/<school-folder>/staff`
- `SchoolDetail/<school-folder>/teachers`
- `SchoolDetail/<school-folder>/facilities`
- `SchoolDetail/<school-folder>/achievements`
- `SchoolDetail/<school-folder>/news`
- `SchoolDetail/<school-folder>/gallery`

### Fungsi

- Menyimpan gambar yang dipakai oleh halaman detail sekolah.
- Dibaca backend saat listing file.
- Diupload lewat backend agar session admin tetap tervalidasi.

## Hubungan dengan backend

### Backend menulis ke

- `schools`
- `school_sync_status`
- `school_role_stats`
- `school_principals`
- `school_staff`
- `school_teachers`
- `school_facilities_ui`
- `school_achievements`
- `school_news`
- `school_gallery`
- `school_admins` untuk login

### Backend membaca dari

- `schools`
- `school_sync_status`
- `school_role_stats`
- tabel konten relasional
- storage bucket

## Hubungan dengan frontend

- Frontend publik membaca data sekolah dari Supabase.
- Frontend admin mengirim perubahan ke backend, bukan langsung ke semua tabel.
- Upload gambar diproses backend supaya folder storage konsisten.

## Field mapping penting

| Field aplikasi | Supabase |
| --- | --- |
| `school.slug` | `schools.slug` |
| `school.npsn` | `schools.npsn` |
| `school.name` | `schools.name` |
| `school.address` | `schools.address` |
| `school.syncStatus` | `schools.sync_status` atau `school_sync_status.message` |
| `school.profileDetails` | `schools.profile_details` |
| `school.facilities` | `schools.facilities` atau `school_facilities_ui` |
| `school.roleStats` | `school_role_stats` |
| `school.principal` | `school_principals` |
| `school.staff` | `school_staff` |
| `school.teachers` | `school_teachers` |
| `school.achievements` | `school_achievements` |
| `school.news` | `school_news` |
| `school.gallery` | `school_gallery` |

## Saran implementasi

1. Jadikan `schools` sebagai sumber kebenaran utama.
2. Simpan histori sinkronisasi di `school_sync_status`.
3. Simpan statistik per peran di `school_role_stats`.
4. Pisahkan konten yang diedit operator dari data inti sekolah.
5. Gunakan RLS untuk membatasi akses publik dan admin.

