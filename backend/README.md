# Backend Scraper for Web Portal Pendidikan Dasar

## Overview

This backend is a separate Node.js scraper + API server that fetches DAPO school data and exposes it to the frontend.

## Structure

- `src/index.ts` - Express API server
- `src/scraper.ts` - scraping logic and catalog persistence
- `src/types.ts` - shared types for scraped school data
- `data/school-list.json` - list of schools to sync
- `data/schools.json` - scraped output catalog

## Installation

From the project root:

```bash
cd backend
pnpm install
```

## Development

Run with live reload:

```bash
pnpm dev
```

## Endpoints

- `GET /api/health`
- `GET /api/schools`
- `GET /api/schools/:npsn`
- `POST /api/sync`

## Sync workflow

1. `POST /api/sync` executes scraping for all entries in `data/school-list.json`
2. Scraped results are written to `data/schools.json`
3. Frontend can pull latest data from `/api/schools`

## Notes

- `DAPO_BASE_URL` can be configured via `.env`
- `scraper.ts` currently scrapes HTML selectors such as `.school-name`, `.accreditation`, and `.address`
- Adjust selectors to match the actual DAPO website structure
