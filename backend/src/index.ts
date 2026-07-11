import express from "express";
import cors from "cors";
import { syncAllSchools, loadCatalog, getSchoolByNpsn } from "./scraper.js";
import { syncCmsSchoolRecord } from "./supabase.js";
import pino from "pino";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });
const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", version: "1.0.0" });
});

app.get("/api/schools", async (_req, res) => {
  try {
    const catalog = await loadCatalog();
    res.json(catalog);
  } catch (error) {
    logger.error({ err: error }, "Failed to load school catalog");
    res.status(500).json({ error: "Unable to read school data" });
  }
});

app.get("/api/schools/:npsn", async (req, res) => {
  try {
    const school = await getSchoolByNpsn(req.params.npsn);
    if (!school) {
      res.status(404).json({ error: "School not found" });
      return;
    }
    res.json(school);
  } catch (error) {
    logger.error({ err: error, npsn: req.params.npsn }, "Failed to load school record");
    res.status(500).json({ error: "Unable to read school data" });
  }
});

app.post("/api/sync", async (req, res) => {
  try {
    const catalog = await syncAllSchools();
    res.json({ success: true, updatedAt: catalog.updatedAt, count: catalog.results.length });
  } catch (error) {
    logger.error({ err: error }, "Sync job failed");
    res.status(500).json({ success: false, error: "Scraping job failed" });
  }
});

app.post("/api/admin/sync", async (req, res) => {
  try {
    const schools = Array.isArray(req.body?.schools) ? req.body.schools : [];
    if (schools.length === 0) {
      res.status(400).json({ success: false, error: "No schools provided" });
      return;
    }

    for (const school of schools) {
      await syncCmsSchoolRecord(school);
    }

    res.json({ success: true, count: schools.length });
  } catch (error) {
    logger.error({ err: error }, "Admin sync failed");
    res.status(500).json({ success: false, error: "Unable to sync admin changes" });
  }
});

app.listen(port, () => {
  logger.info(`Backend scraping server running on http://localhost:${port}`);
});
