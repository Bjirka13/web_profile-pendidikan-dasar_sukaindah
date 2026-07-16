import express from "express";
import cors from "cors";
import { syncAllSchools, loadCatalog, getSchoolByNpsn } from "./scraper.js";
import {
  authenticateAdminSession,
  deleteCmsSchoolRecord,
  syncCmsSchoolRecord,
  uploadCmsImage,
  validateAdminLogin,
} from "./supabase.js";
import pino from "pino";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });
const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json({ limit: "25mb" }));

function getBearerToken(req: express.Request): string {
  const header = req.header("authorization") || "";
  if (!header.toLowerCase().startsWith("bearer ")) {
    return "";
  }
  return header.slice(7).trim();
}

function requireAdminSession(req: express.Request, res: express.Response) {
  const token = getBearerToken(req);
  if (!token) {
    res.status(401).json({ success: false, error: "Missing admin session token" });
    return null;
  }

  const session = authenticateAdminSession(token);
  if (!session) {
    res.status(401).json({ success: false, error: "Invalid or expired admin session" });
    return null;
  }

  return session;
}

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

app.post("/api/admin/login", async (req, res) => {
  try {
    const username = typeof req.body?.username === "string" ? req.body.username : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!username || !password) {
      res.status(400).json({ success: false, error: "Username and password are required" });
      return;
    }

    const session = await validateAdminLogin(username, password);
    if (!session) {
      res.status(401).json({ success: false, error: "Invalid admin credentials" });
      return;
    }

    res.json({ success: true, ...session });
  } catch (error) {
    logger.error({ err: error }, "Admin login failed");
    res.status(500).json({ success: false, error: "Unable to authenticate admin" });
  }
});

app.post("/api/admin/sync", async (req, res) => {
  try {
    const session = requireAdminSession(req, res);
    if (!session) {
      return;
    }

    const schools = Array.isArray(req.body?.schools) ? req.body.schools : [];
    const deletedSchoolIds = Array.isArray(req.body?.deletedSchoolIds)
      ? req.body.deletedSchoolIds.filter((item: unknown) => typeof item === "number")
      : [];

    const unauthorizedSchool = schools.some(
      (school: { id?: unknown }) => typeof school?.id === "number" && school.id !== session.schoolId
    );
    const unauthorizedDeletion = deletedSchoolIds.some((schoolId: number) => schoolId !== session.schoolId);

    if (unauthorizedSchool || unauthorizedDeletion) {
      res.status(403).json({ success: false, error: "Admin session is restricted to one school" });
      return;
    }

    if (schools.length === 0 && deletedSchoolIds.length === 0) {
      res.status(400).json({ success: false, error: "No schools provided" });
      return;
    }

    for (const school of schools) {
      await syncCmsSchoolRecord(school);
    }

    for (const schoolId of deletedSchoolIds) {
      await deleteCmsSchoolRecord(schoolId);
    }

    res.json({ success: true, count: schools.length, deletedCount: deletedSchoolIds.length });
  } catch (error) {
    logger.error({ err: error }, "Admin sync failed");
    res.status(500).json({ success: false, error: "Unable to sync admin changes" });
  }
});

app.post("/api/admin/upload-image", async (req, res) => {
  try {
    const session = requireAdminSession(req, res);
    if (!session) {
      return;
    }

    const fileName = typeof req.body?.fileName === "string" ? req.body.fileName : "";
    const mimeType = typeof req.body?.mimeType === "string" ? req.body.mimeType : "";
    const base64 = typeof req.body?.base64 === "string" ? req.body.base64 : "";
    const folder = typeof req.body?.folder === "string" ? req.body.folder : "";

    if (!folder.startsWith(`cms/schools/${session.schoolId}/`)) {
      res.status(403).json({ success: false, error: "Upload folder does not match admin school" });
      return;
    }

    if (!fileName || !mimeType || !base64) {
      res.status(400).json({ success: false, error: "Missing fileName, mimeType, or base64" });
      return;
    }

    const result = await uploadCmsImage({
      fileName,
      mimeType,
      base64,
      folder,
    });

    res.json({ success: true, ...result });
  } catch (error) {
    logger.error({ err: error }, "Image upload failed");
    res.status(500).json({ success: false, error: "Unable to upload image" });
  }
});

app.listen(port, () => {
  logger.info(`Backend scraping server running on http://localhost:${port}`);
});
