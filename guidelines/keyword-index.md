# Keyword Index

Gunakan keyword ini untuk merujuk bagian dokumentasi dengan cepat.

## Keywords

- `DOC-START`
  - Mulai baca dari `guidelines/README.md`.
  - Menjelaskan keputusan awal yang perlu dilihat sekretaris desa dan operator.

- `DOC-BACKEND`
  - Rujuk ke `guidelines/backend.md`.
  - Fokus pada API, scraper, Supabase, upload, dan `.env`.

- `DOC-FRONTEND`
  - Rujuk ke `guidelines/frontend.md`.
  - Fokus pada route, page, CMS provider, dan `.env` frontend.

- `FLOW-BACKEND`
  - Backend ada di `backend/`.
  - Route utama ada di `backend/src/index.ts`.
  - Scraping inti ada di `backend/src/scraper.ts`.
  - Integrasi Supabase ada di `backend/src/supabase.ts`.

- `FLOW-FRONTEND`
  - Frontend ada di `src/`.
  - Router ada di `src/app/routes.ts`.
  - CMS state dan mapping data ada di `src/app/cms/school-cms.tsx`.
  - Halaman utama ada di `src/app/pages/`.

- `ENV-BACKEND`
  - Variabel penting backend: `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `DAPO_BASE_URL`, `SITE_URL`, `ADMIN_SESSION_SECRET`, `ADMIN_PASSWORD_SALT`.

- `ENV-FRONTEND`
  - Variabel penting frontend: `VITE_BACKEND_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_STORAGE_BUCKET`, `VITE_WORDPRESS_URL`.

- `CONTENT-SPLIT`
  - WordPress hanya untuk artikel beranda lewat `WordPressPosts`.
  - Konten sekolah utama dikelola lewat Supabase dan CMS frontend.

## Notes

- Saat keyword dipakai, saya akan pakai file dokumen yang sesuai sebagai referensi utama.
- Kalau perlu keyword baru, cukup pakai label singkat huruf besar.
