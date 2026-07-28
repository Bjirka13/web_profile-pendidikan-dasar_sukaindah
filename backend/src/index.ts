import express from "express";
import cors from "cors";
import { syncAllSchools, loadCatalog, loadSchoolList, getSchoolByNpsn } from "./scraper.js";
import {
  authenticateAdminSession,
  deleteCmsSchoolRecord,
  listCmsStorageFilesForSchool,
  syncCmsSchoolRecord,
  uploadCmsImage,
  validateAdminLogin,
} from "./supabase.js";
import pino from "pino";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });
const app: express.Application = express();
const SITE_URL = (process.env.SITE_URL || "https://portal-pendidikan-dasar-sukaindah.vercel.app").replace(/\/$/, "");

app.use(cors());
app.use(express.json({ limit: "25mb" }));

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

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

app.get("/sitemap.xml", async (_req, res) => {
  try {
    const [catalog, schoolList] = await Promise.all([loadCatalog(), loadSchoolList()]);
    const slugSet = new Set<string>();

    for (const school of catalog.schools) {
      const slug = typeof school.slug === "string" ? school.slug.trim() : "";
      if (slug) slugSet.add(slug);
    }

    for (const entry of schoolList) {
      const slug = typeof entry.slug === "string" ? entry.slug.trim() : "";
      if (slug) slugSet.add(slug);
    }

    const staticUrls = [
      `${SITE_URL}/`,
      `${SITE_URL}/sekolah`,
      `${SITE_URL}/statistik`,
      `${SITE_URL}/know-about-us`,
    ];

    const schoolUrls = Array.from(slugSet)
      .sort()
      .map((slug) => `${SITE_URL}/sekolah/${encodeURIComponent(slug)}`);

    const urls = [...staticUrls, ...schoolUrls]
      .map((loc) => `  <url>\n    <loc>${escapeXml(loc)}</loc>\n  </url>`)
      .join("\n");

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`);
  } catch (error) {
    logger.error({ err: error }, "Failed to build sitemap");
    res.status(500).type("text/plain").send("Unable to generate sitemap");
  }
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

    const normalizedSchools = schools.map((school: Record<string, unknown>) => {
      const { id: _ignoredId, ...rest } = school;
      return rest;
    });

    const unauthorizedDeletion = deletedSchoolIds.some((schoolId: number) => schoolId !== session.schoolId);

    if (unauthorizedDeletion) {
      res.status(403).json({ success: false, error: "Admin session is restricted to one school" });
      return;
    }

    if (normalizedSchools.length === 0 && deletedSchoolIds.length === 0) {
      res.status(400).json({ success: false, error: "No schools provided" });
      return;
    }

    for (const school of normalizedSchools) {
      await syncCmsSchoolRecord(school);
    }

    for (const schoolId of deletedSchoolIds) {
      await deleteCmsSchoolRecord(schoolId);
    }

    res.json({ success: true, count: schools.length, deletedCount: deletedSchoolIds.length });
  } catch (error) {
    logger.error({ err: error }, "Admin sync failed");
    const message = error instanceof Error ? error.message : "Unable to sync admin changes";
    res.status(500).json({ success: false, error: message });
  }
});

app.get("/api/storage/files", async (req, res) => {
  try {
    const schoolId = Number(req.query.schoolId ?? 0);
    if (!Number.isFinite(schoolId) || schoolId <= 0) {
      res.status(400).json({ success: false, error: "Invalid school id" });
      return;
    }

    const files = await listCmsStorageFilesForSchool(schoolId);
    res.json({ success: true, files });
  } catch (error) {
    logger.error({ err: error }, "Storage files listing failed");
    res.status(500).json({ success: false, error: "Unable to list storage files" });
  }
});

async function handleStorageUpload(req: express.Request, res: express.Response) {
  try {
    const session = requireAdminSession(req, res);
    if (!session) {
      return;
    }

    const fileName = typeof req.body?.fileName === "string" ? req.body.fileName : "";
    const mimeType = typeof req.body?.mimeType === "string" ? req.body.mimeType : "";
    const base64 = typeof req.body?.base64 === "string" ? req.body.base64 : "";
    const folder = typeof req.body?.folder === "string" ? req.body.folder : "";
    const allowedFolders = ["school-hero", "school-card", "principal", "staff", "teachers", "facilities", "achievements", "news", "gallery"];
    const normalizedFolder = folder.trim().toLowerCase() || "school-hero";

    if (!allowedFolders.includes(normalizedFolder)) {
      res.status(403).json({ success: false, error: "Upload folder is not allowed for this admin session" });
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
      folder: normalizedFolder,
      schoolId: session.schoolId,
      schoolSlug: session.schoolSlug,
      schoolName: session.schoolName,
    });

    res.json({ success: true, ...result });
  } catch (error) {
    logger.error({ err: error }, "Image upload failed");
    res.status(500).json({ success: false, error: "Unable to upload image" });
  }
}

app.post("/api/storage/upload", handleStorageUpload);
app.post("/api/admin/upload-image", handleStorageUpload);

app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ success: false, error: "Internal server error" });
});

export default app;
