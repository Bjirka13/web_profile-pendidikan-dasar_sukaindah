import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { SchoolSyncStatus, ScrapedSchoolData } from "./types.js";

for (const envPath of [resolve(process.cwd(), ".env"), resolve(process.cwd(), "..", ".env")]) {
  if (existsSync(envPath)) {
    config({ path: envPath });
    break;
  }
}

config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY;
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "school-assets";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_KEY) must be set in the project root .env before running the backend."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

type CmsImageUploadPayload = {
  fileName: string;
  mimeType: string;
  base64: string;
  folder?: string;
};

type AdminAccountRow = {
  admin_email: string;
  password_hash?: string | null;
  school_id?: number | null;
};

type SchoolRow = {
  id: number;
  slug?: string | null;
  name?: string | null;
};

type AdminSessionPayload = {
  username: string;
  schoolId: number;
  schoolSlug: string;
  schoolName: string;
  token: string;
  issuedAt: string;
  expiresAt: string;
};

type AdminSessionTokenPayload = {
  username: string;
  schoolId: number;
  schoolSlug: string;
  schoolName: string;
  issuedAt: string;
  expiresAt: string;
  jti: string;
};

type RelatedSchoolTableRow = Record<string, unknown>;
type SchoolFacilityUiRow = {
  school_id: number;
  name: string;
  description?: string | null;
  photo?: string | null;
  icon?: string | null;
  count?: number | null;
};

type RoleStatRole = "guru" | "tenaga_didik" | "peserta_didik";

type RoleStatRow = {
  school_id: number;
  role: RoleStatRole;
  total: number;
  male: number;
  female: number;
  scraped_at: string;
};

type CmsSchoolPayload = {
  id: number;
  slug: string;
  npsn: string;
  name: string;
  shortName: string;
  tagline: string;
  syncStatus: string;
  address: string;
  kodePos: string;
  kecamatan: string;
  desa: string;
  contact: string;
  email: string;
  accreditation: string;
  status: string;
  yearEstablished: string;
  heroImage: string;
  cardImage: string;
  mapsEmbed: string;
  principal: {
    name: string;
    photo: string;
    welcome: string;
    position: string;
    nip?: string;
  };
  history: string;
  vision: string;
  mission: string[];
  goals: string[];
  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  totalTeachers: number;
  totalClassrooms: number;
  totalStudyGroups: number;
  staff: Array<{
    name: string;
    position: string;
    photo: string;
    nip?: string;
    isAdmin?: boolean;
    isVicePrincipal?: boolean;
  }>;
  teachers: Array<{
    name: string;
    position: string;
    photo: string;
    nip?: string;
  }>;
  facilities: Array<{
    name: string;
    description: string;
    photo: string;
    icon: string;
    count: number;
  }>;
  achievements: Array<{
    title: string;
    year: string;
    level: string;
    description: string;
    photo?: string;
  }>;
  news: Array<{
    id: number;
    title: string;
    date: string;
    excerpt: string;
    thumbnail: string;
    category: string;
  }>;
  gallery: Array<{
    photo: string;
    caption: string;
  }>;
};

type RoleStatSourceRow = {
  role: RoleStatRole;
  total?: number;
  male?: number;
  female?: number;
};

function buildRoleStatRows(schoolId: number, school: ScrapedSchoolData, scrapedAt: string): RoleStatRow[] {
  const sourceRows: RoleStatSourceRow[] = [];

  if (school.roleStats?.length) {
    for (const item of school.roleStats) {
      sourceRows.push({
        role: item.role,
        total: item.total,
        male: item.male,
        female: item.female,
      });
    }
  }

  return sourceRows.map((item) => ({
    school_id: schoolId,
    role: item.role,
    total: item.total ?? 0,
    male: item.male ?? 0,
    female: item.female ?? 0,
    scraped_at: scrapedAt,
  }));
}

function normalizeSchoolPayload(school: ScrapedSchoolData) {
  const slug = school.slug?.trim() || `school-${school.npsn}`;

  if (!school.slug?.trim()) {
    console.warn("Missing school.slug, using fallback slug for Supabase upsert", {
      npsn: school.npsn,
      name: school.name,
      originalSlug: school.slug,
      fallbackSlug: slug,
    });
  }

  return {
    slug,
    npsn: school.npsn,
    name: school.name,
    short_name: school.shortName,
    tagline: school.tagline,
    address: school.address,
    kode_pos: school.kodePos,
    kecamatan: school.kecamatan,
    desa: school.desa,
    contact: school.contact,
    email: school.email,
    accreditation: school.accreditation,
    status: school.status,
    year_established: school.yearEstablished,
    hero_image: school.heroImage || school.photo,
    card_image: school.cardImage || school.photo,
    maps_embed: school.mapsEmbed,
    profile_summary: school.profileSummary,
    profile_details: school.profileDetails,
    facilities: school.facilities,
    grade_stats: school.gradeStats,
    total_students: school.totalStudents,
    male_students: school.maleStudents,
    female_students: school.femaleStudents,
    total_teachers: school.totalTeachers,
    total_classrooms: school.totalClassrooms,
    total_study_groups: school.totalStudyGroups,
    updated_at: new Date().toISOString(),
  };
}

function getAdminSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || "portal-pendidikan-admin-session-v1";
}

function toBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function createAdminSessionToken(payload: AdminSessionTokenPayload): string {
  const serialized = JSON.stringify(payload);
  const signature = createHmac("sha256", getAdminSessionSecret()).update(serialized).digest("base64url");
  return `${toBase64Url(serialized)}.${signature}`;
}

function verifyAdminSessionToken(token: string): AdminSessionTokenPayload | null {
  const [payloadPart, signaturePart, ...rest] = token.split(".");
  if (!payloadPart || !signaturePart || rest.length > 0) {
    return null;
  }

  const serialized = fromBase64Url(payloadPart);
  const expectedSignature = createHmac("sha256", getAdminSessionSecret()).update(serialized).digest("base64url");

  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  const signatureBuffer = Buffer.from(signaturePart, "utf8");

  if (expectedBuffer.length !== signatureBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(expectedBuffer, signatureBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(serialized) as Partial<AdminSessionTokenPayload>;
    if (
      typeof payload.username !== "string" ||
      typeof payload.schoolId !== "number" ||
      typeof payload.schoolSlug !== "string" ||
      typeof payload.schoolName !== "string" ||
      typeof payload.issuedAt !== "string" ||
      typeof payload.expiresAt !== "string" ||
      typeof payload.jti !== "string"
    ) {
      return null;
    }

    if (Number.isNaN(new Date(payload.issuedAt).getTime()) || Number.isNaN(new Date(payload.expiresAt).getTime())) {
      return null;
    }

    if (new Date(payload.expiresAt).getTime() <= Date.now()) {
      return null;
    }

    return payload as AdminSessionTokenPayload;
  } catch {
    return null;
  }
}

function hashAdminPassword(username: string, password: string): string {
  const salt = process.env.ADMIN_PASSWORD_SALT || "portal-pendidikan-admin-v1";
  const payload = `${salt}:${username.trim().toLowerCase()}:${password}`;
  return Buffer.from(payload).toString("base64");
}

function normalizeAdminEmail(identifier: string): string {
  const value = identifier.trim().toLowerCase();
  if (!value) {
    return "";
  }
  if (value.includes("@")) {
    return value;
  }
  return `${value}@admin.com`;
}

async function fetchAdminAccount(username: string): Promise<{ account: AdminAccountRow; school: SchoolRow } | null> {
  const normalizedUsername = normalizeAdminEmail(username);

  const { data, error } = await supabase
    .from("school_admins")
    .select("admin_email,password_hash,school_id")
    .eq("admin_email", normalizedUsername)
    .maybeSingle();

  if (error) {
    console.error("Supabase admin account lookup error:", error);
    // If the school_admins table doesn't exist in the schema cache, treat as no account
    // to avoid crashing the login flow in environments where the admin table is not created yet.
    if ((error as any)?.code === "PGRST205") {
      return null;
    }
    throw error;
  }

  const account = data as AdminAccountRow | null;
  if (!account?.school_id) {
    return null;
  }

  const { data: school, error: schoolError } = await supabase
    .from("schools")
    .select("id,slug,name")
    .eq("id", account.school_id)
    .maybeSingle();

  if (schoolError) {
    console.error("Supabase school lookup error:", schoolError);
    throw schoolError;
  }

  if (!school) {
    return null;
  }

  return {
    account,
    school: school as SchoolRow,
  };
}

export async function validateAdminLogin(username: string, password: string): Promise<AdminSessionPayload | null> {
  const normalizedUsername = normalizeAdminEmail(username);
  const result = await fetchAdminAccount(normalizedUsername);
  if (!result) {
    return null;
  }

  const { account, school } = result;

  const enteredHash = hashAdminPassword(normalizedUsername, password);
  const storedHash = String(account.password_hash ?? "").trim();
  if (!storedHash || storedHash !== enteredHash) {
    return null;
  }

  const schoolId = Number(account.school_id ?? 0);
  const schoolSlug = String(school.slug ?? "");
  const schoolName = String(school.name ?? "");
  const usernameNormalized = String(account.admin_email ?? normalizedUsername).trim().toLowerCase();
  const issuedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
  const token = createAdminSessionToken({
    username: usernameNormalized,
    schoolId,
    schoolSlug,
    schoolName,
    issuedAt,
    expiresAt,
    jti: randomUUID(),
  });

  return {
    username: usernameNormalized,
    schoolId,
    schoolSlug,
    schoolName,
    token,
    issuedAt,
    expiresAt,
  };
}

export function authenticateAdminSession(token: string): AdminSessionTokenPayload | null {
  return verifyAdminSessionToken(token);
}

async function replaceRowsBySchoolId(
  table: string,
  schoolId: number,
  rows: RelatedSchoolTableRow[]
): Promise<void> {
  if (rows.length === 0) {
    console.log(`Supabase ${table}: no scraped rows for school_id=${schoolId}, keeping existing data.`);
    return;
  }

  const { data: existingRows, error: selectError } = await supabase
    .from(table)
    .select("name,description,photo,icon,count")
    .eq("school_id", schoolId);

  if (selectError) {
    console.error(`Supabase ${table} select error:`, selectError);
    throw selectError;
  }

  const existingByName = new Map<string, SchoolFacilityUiRow>(
    (existingRows as SchoolFacilityUiRow[] | null | undefined ?? []).map((row) => [row.name, row])
  );
  const mergedRows = rows.map((row) => {
    const incoming = row as SchoolFacilityUiRow;
    const existing = existingByName.get(String(incoming.name ?? ""));

    return {
      school_id: schoolId,
      name: String(incoming.name ?? existing?.name ?? ""),
      description: incoming.description ?? existing?.description ?? null,
      photo: incoming.photo ?? existing?.photo ?? null,
      icon: incoming.icon ?? existing?.icon ?? null,
      count: incoming.count ?? existing?.count ?? null,
    };
  });

  const { error: deleteError } = await supabase.from(table).delete().eq("school_id", schoolId);

  if (deleteError) {
    console.error(`Supabase ${table} delete error:`, deleteError);
    throw deleteError;
  }

  const { error: insertError } = await supabase.from(table).insert(mergedRows);

  if (insertError) {
    console.error(`Supabase ${table} insert error:`, insertError);
    throw insertError;
  }
}

async function replaceRowsBySchoolIdSimple(
  table: string,
  schoolId: number,
  rows: RelatedSchoolTableRow[]
): Promise<void> {
  const { error: deleteError } = await supabase.from(table).delete().eq("school_id", schoolId);

  if (deleteError) {
    console.error(`Supabase ${table} delete error:`, deleteError);
    throw deleteError;
  }

  if (rows.length === 0) {
    return;
  }

  const { error: insertError } = await supabase.from(table).insert(rows);

  if (insertError) {
    console.error(`Supabase ${table} insert error:`, insertError);
    throw insertError;
  }
}

async function syncRoleStats(schoolId: number, school: ScrapedSchoolData): Promise<void> {
  const scrapedAt = new Date().toISOString();
  const roleStats = buildRoleStatRows(schoolId, school, scrapedAt);

  if (!roleStats.some((item) => item.total > 0 || item.male > 0 || item.female > 0)) {
    console.log(`Supabase school_role_stats: no scraped totals for school_id=${schoolId}, keeping existing data.`);
    return;
  }

  const { error: deleteError } = await supabase.from("school_role_stats").delete().eq("school_id", schoolId);

  if (deleteError) {
    console.error("Supabase school_role_stats delete error:", deleteError);
    throw deleteError;
  }

  const { error: insertError } = await supabase.from("school_role_stats").insert(roleStats);

  if (insertError) {
    console.error("Supabase school_role_stats insert error:", insertError);
    throw insertError;
  }
}

async function syncRelatedSchoolData(schoolId: number, school: ScrapedSchoolData): Promise<void> {
  await syncRoleStats(schoolId, school);

  await replaceRowsBySchoolId(
    "school_facilities_ui",
    schoolId,
    (school.facilities ?? []).map((facility) => ({
      school_id: schoolId,
      name: facility.name,
      description: undefined,
      photo: undefined,
      icon: undefined,
      count: facility.count ?? null,
    }))
  );
}

export async function syncCmsSchoolRecord(school: CmsSchoolPayload): Promise<void> {
  const baseRow = {
    id: school.id,
    slug: school.slug,
    npsn: school.npsn,
    name: school.name,
    short_name: school.shortName,
    tagline: school.tagline,
    status: school.status,
    accreditation: school.accreditation,
    year_established: school.yearEstablished,
    address: school.address,
    kode_pos: school.kodePos,
    kecamatan: school.kecamatan,
    desa: school.desa,
    contact: school.contact,
    email: school.email,
    hero_image: school.heroImage,
    card_image: school.cardImage,
    maps_embed: school.mapsEmbed,
    sync_status: school.syncStatus,
    profile_summary: school.principal.welcome?.slice(0, 140),
    profile_details: [school.history, school.vision, ...school.mission, ...school.goals].filter(Boolean),
    facilities: school.facilities,
    grade_stats: [],
    total_students: school.totalStudents,
    male_students: school.maleStudents,
    female_students: school.femaleStudents,
    total_teachers: school.totalTeachers,
    total_classrooms: school.totalClassrooms,
    total_study_groups: school.totalStudyGroups,
    updated_at: new Date().toISOString(),
  };

  const { error: schoolError } = await supabase
    .from("schools")
    .upsert(baseRow, { onConflict: "npsn" })
    .select("id")
    .single();

  if (schoolError) {
    console.error("Supabase CMS school upsert error:", schoolError);
    throw schoolError;
  }

  const schoolId = school.id;

  await Promise.all([
    replaceRowsBySchoolId("school_principals", schoolId, [{
      school_id: schoolId,
      name: school.principal.name,
      position: school.principal.position,
      photo: school.principal.photo,
      welcome: school.principal.welcome,
      nip: school.principal.nip ?? null,
    }]),
    replaceRowsBySchoolId("school_staff", schoolId, school.staff.map((person) => ({
      school_id: schoolId,
      name: person.name,
      position: person.position,
      nip: person.nip ?? null,
      photo: person.photo,
      is_admin: Boolean(person.isAdmin),
      is_vice_principal: Boolean(person.isVicePrincipal),
    }))),
    replaceRowsBySchoolId("school_teachers", schoolId, school.teachers.map((person) => ({
      school_id: schoolId,
      name: person.name,
      position: person.position,
      nip: person.nip ?? null,
      photo: person.photo,
    }))),
    replaceRowsBySchoolId("school_facilities_ui", schoolId, school.facilities.map((facility) => ({
      school_id: schoolId,
      name: facility.name,
      description: facility.description,
      photo: facility.photo,
      icon: facility.icon,
      count: facility.count,
    }))),
    replaceRowsBySchoolIdSimple("school_achievements", schoolId, school.achievements.map((achievement) => ({
      school_id: schoolId,
      title: achievement.title,
      year: achievement.year,
      level: achievement.level,
      description: achievement.description,
      photo: achievement.photo ?? null,
    }))),
    replaceRowsBySchoolIdSimple("school_news", schoolId, school.news.map((newsItem) => ({
      school_id: schoolId,
      id: newsItem.id,
      title: newsItem.title,
      date: newsItem.date,
      excerpt: newsItem.excerpt,
      thumbnail: newsItem.thumbnail,
      category: newsItem.category,
    }))),
    replaceRowsBySchoolId("school_gallery", schoolId, school.gallery.map((item) => ({
      school_id: schoolId,
      photo: item.photo,
      caption: item.caption,
    }))),
  ]);
}

export async function deleteCmsSchoolRecord(schoolId: number): Promise<void> {
  const tables = [
    "school_principals",
    "school_staff",
    "school_teachers",
    "school_facilities_ui",
    "school_achievements",
    "school_news",
    "school_gallery",
    "school_role_stats",
  ] as const;

  await Promise.all(
    tables.map(async (table) => {
      const { error } = await supabase.from(table).delete().eq("school_id", schoolId);
      if (error) {
        console.error(`Supabase delete error for ${table}:`, error);
        throw error;
      }
    })
  );

  const { error: schoolError } = await supabase.from("schools").delete().eq("id", schoolId);
  if (schoolError) {
    console.error("Supabase school delete error:", schoolError);
    throw schoolError;
  }
}

export async function upsertSchoolRecord(school: ScrapedSchoolData, _syncStatus: SchoolSyncStatus): Promise<number | null> {
  const payload = normalizeSchoolPayload(school);
  if (_syncStatus.npsn !== school.npsn) {
    console.warn("NPSN mismatch between source entry and scraped payload", {
      sourceNpsn: _syncStatus.npsn,
      sourceSlug: _syncStatus.slug,
      scrapedNpsn: school.npsn,
      scrapedSlug: school.slug,
    });
  }

  const { data, error } = await supabase
    .from("schools")
    .upsert(payload, { onConflict: "npsn" })
    .select("id")
    .single();

  if (error) {
    console.error("Supabase upsert error:", error);
    throw error;
  }

  const id = data?.id ?? null;
  if (id !== null) {
    await syncRelatedSchoolData(id, school);
  }

  console.log(
    `Supabase: upserted school source=${_syncStatus.npsn}/${_syncStatus.slug} scraped=${school.npsn}/${school.slug} => id ${id}`
  );
  return id;
}

export async function insertSchoolSyncStatus(schoolId: number, syncStatus: SchoolSyncStatus): Promise<void> {
  const { data, error } = await supabase.from("school_sync_status").insert([
    {
      school_id: schoolId,
      status: syncStatus.status,
      message: syncStatus.message,
      scraped_at: syncStatus.scrapedAt,
      source_url: syncStatus.sourceUrl,
    },
  ]).select("id").single();

  if (error) {
    console.error("Supabase sync status insert error:", error);
    throw error;
  }

  console.log(`Supabase: inserted sync status for school_id=${schoolId} id=${data?.id ?? "unknown"}`);
}

function sanitizePathSegment(segment: string): string {
  return segment
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sanitizeFileName(fileName: string): string {
  const parts = fileName.split(".");
  const extension = parts.length > 1 ? parts.pop() : "";
  const baseName = parts.join(".") || "image";
  const safeBase = sanitizePathSegment(baseName).slice(0, 60) || "image";
  const safeExtension = extension ? sanitizePathSegment(extension).slice(0, 10) : "";
  return safeExtension ? `${safeBase}.${safeExtension}` : safeBase;
}

function decodeBase64(base64: string): Buffer {
  const payload = base64.includes(",") ? base64.split(",").pop() ?? "" : base64;
  return Buffer.from(payload, "base64");
}

function ensureBucketName() {
  return SUPABASE_STORAGE_BUCKET.trim() || "school-assets";
}

export async function uploadCmsImage(payload: CmsImageUploadPayload): Promise<{ publicUrl: string; path: string; bucket: string }> {
  const fileName = sanitizeFileName(payload.fileName);
  const bucket = ensureBucketName();
  const folder = payload.folder
    ? payload.folder
        .split("/")
        .map(sanitizePathSegment)
        .filter(Boolean)
        .join("/")
    : "";
  const uniquePrefix = randomUUID();
  const path = [folder, `${uniquePrefix}-${fileName}`].filter(Boolean).join("/");
  const fileBody = decodeBase64(payload.base64);

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    throw listError;
  }

  const bucketExists = buckets.some((item) => item.name === bucket);
  if (!bucketExists) {
    const { error: createError } = await supabase.storage.createBucket(bucket, {
      public: true,
    });

    if (createError) {
      throw createError;
    }
  }

  const { error: uploadError } = await supabase.storage.from(bucket).upload(path, fileBody, {
    contentType: payload.mimeType,
    upsert: false,
  });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return {
    publicUrl: data.publicUrl,
    path,
    bucket,
  };
}
