# Keyword Index

Use these keywords to refer back to the repo audit quickly.

## Keywords

- `FLOW-FRONTEND`
  - Frontend app is a Vite React bundle.
  - Main pages read from local data in `src/app/data/schools.ts`.
  - `Home`, `Schools`, and `SchoolDetail` do not fetch school data from backend.

- `FLOW-BACKEND`
  - Backend is a separate scraper/API service in `backend/`.
  - Endpoints exist in `backend/src/index.ts`:
    - `GET /api/health`
    - `GET /api/schools`
    - `GET /api/schools/:npsn`
    - `POST /api/sync`
  - Scraping logic is in `backend/src/scraper.ts`.

- `STATIC-DATA`
  - School profiles, staff, facilities, achievements, news, and gallery are hardcoded in `src/app/data/schools.ts`.
  - Home hero, kepala desa section, and schools directory are also static/local.
  - `About` is intentionally static.

- `WORDPRESS-DYNAMIC`
  - The only runtime fetch in frontend is `WordPressPosts`.
  - It reads `VITE_WORDPRESS_URL` and fetches WordPress posts from `/wp-json/wp/v2/posts?per_page=3`.

- `STATS-RISK`
  - `src/app/components/StatsSection.tsx` references `SEMESTER_STATS`.
  - The source definition is commented out, so this is a runtime-risk area to revisit if stats need to stay active.

## Notes

- When you say one of the keywords above, I will use this mapping as the reference point.
- If you want a new keyword added later, use a short uppercase label and I will extend this file.
