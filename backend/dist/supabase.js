import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
for (const envPath of [resolve(process.cwd(), ".env"), resolve(process.cwd(), "..", ".env")]) {
    if (existsSync(envPath)) {
        config({ path: envPath });
        break;
    }
}
config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY;
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "image";
if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_KEY) must be set in the project root .env before running the backend.");
}
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
});
function buildRoleStatRows(schoolId, school, scrapedAt) {
    const sourceRows = [];
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
function normalizeSchoolPayload(school) {
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
function getAdminSessionSecret() {
    return process.env.ADMIN_SESSION_SECRET || "portal-pendidikan-admin-session-v1";
}
function toBase64Url(value) {
    return Buffer.from(value, "utf8").toString("base64url");
}
function fromBase64Url(value) {
    return Buffer.from(value, "base64url").toString("utf8");
}
function createAdminSessionToken(payload) {
    const serialized = JSON.stringify(payload);
    const signature = createHmac("sha256", getAdminSessionSecret()).update(serialized).digest("base64url");
    return `${toBase64Url(serialized)}.${signature}`;
}
function verifyAdminSessionToken(token) {
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
        const payload = JSON.parse(serialized);
        if (typeof payload.username !== "string" ||
            typeof payload.schoolId !== "number" ||
            typeof payload.schoolSlug !== "string" ||
            typeof payload.schoolName !== "string" ||
            typeof payload.issuedAt !== "string" ||
            typeof payload.expiresAt !== "string" ||
            typeof payload.jti !== "string") {
            return null;
        }
        if (Number.isNaN(new Date(payload.issuedAt).getTime()) || Number.isNaN(new Date(payload.expiresAt).getTime())) {
            return null;
        }
        if (new Date(payload.expiresAt).getTime() <= Date.now()) {
            return null;
        }
        return payload;
    }
    catch {
        return null;
    }
}
function hashAdminPassword(username, password) {
    const salt = process.env.ADMIN_PASSWORD_SALT || "portal-pendidikan-admin-v1";
    const payload = `${salt}:${username.trim().toLowerCase()}:${password}`;
    return Buffer.from(payload).toString("base64");
}
function normalizeAdminEmail(identifier) {
    const value = identifier.trim().toLowerCase();
    if (!value) {
        return "";
    }
    if (value.includes("@")) {
        return value;
    }
    return `${value}@admin.com`;
}
async function fetchAdminAccount(username) {
    const normalizedUsername = normalizeAdminEmail(username);
    console.log("[admin-login] looking up admin account", {
        normalizedUsername,
    });
    const { data, error } = await supabase
        .from("school_admins")
        .select("admin_email,password_hash,school_id")
        .eq("admin_email", normalizedUsername)
        .maybeSingle();
    if (error) {
        console.error("[admin-login] Supabase admin account lookup error:", error);
        // If the school_admins table doesn't exist in the schema cache, treat as no account
        // to avoid crashing the login flow in environments where the admin table is not created yet.
        if (error?.code === "PGRST205") {
            return null;
        }
        throw error;
    }
    const account = data;
    if (!account) {
        console.warn("[admin-login] no matching school_admins row found", {
            normalizedUsername,
        });
        return null;
    }
    if (!account.school_id) {
        console.warn("[admin-login] admin account found but school_id missing", {
            normalizedUsername,
            adminEmail: account.admin_email,
        });
        return null;
    }
    console.log("[admin-login] admin account found", {
        normalizedUsername,
        adminEmail: account.admin_email,
        schoolId: account.school_id,
    });
    const { data: school, error: schoolError } = await supabase
        .from("schools")
        .select("id,slug,name")
        .eq("id", account.school_id)
        .maybeSingle();
    if (schoolError) {
        console.error("[admin-login] Supabase school lookup error:", schoolError);
        throw schoolError;
    }
    if (!school) {
        console.warn("[admin-login] school row not found for admin account", {
            normalizedUsername,
            schoolId: account.school_id,
        });
        return null;
    }
    return {
        account,
        school: school,
    };
}
export async function validateAdminLogin(username, password) {
    const normalizedUsername = normalizeAdminEmail(username);
    console.log("[admin-login] validating credentials", {
        normalizedUsername,
        passwordLength: password.length,
    });
    const result = await fetchAdminAccount(normalizedUsername);
    if (!result) {
        return null;
    }
    const { account, school } = result;
    const enteredHash = hashAdminPassword(normalizedUsername, password);
    const storedHash = String(account.password_hash ?? "").trim();
    if (!storedHash) {
        console.warn("[admin-login] password_hash missing in school_admins row", {
            normalizedUsername,
        });
        return null;
    }
    if (storedHash !== enteredHash) {
        console.warn("[admin-login] password hash mismatch", {
            normalizedUsername,
            storedHashPrefix: storedHash.slice(0, 16),
            enteredHashPrefix: enteredHash.slice(0, 16),
        });
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
    console.log("[admin-login] credentials accepted", {
        usernameNormalized,
        schoolId,
        schoolSlug,
        schoolName,
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
export function authenticateAdminSession(token) {
    return verifyAdminSessionToken(token);
}
function isRetryableSupabaseError(error) {
    if (!error) {
        return false;
    }
    const message = error instanceof Error ? error.message : String(error);
    const details = typeof error === "object" && error !== null && "details" in error
        ? String(error.details ?? "")
        : "";
    return [message, details].some((value) => /fetch failed|timeout|connecttimeout|connect timeout|und_err_connect_timeout|econnreset|socket hang up/i.test(value));
}
async function withSupabaseRetry(operation, context) {
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            if (!isRetryableSupabaseError(error) || attempt === 3) {
                throw error;
            }
            const delayMs = attempt * 1000;
            console.warn(`[supabase-retry] ${context} failed on attempt ${attempt}/3, retrying in ${delayMs}ms`, error);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
    throw lastError;
}
async function replaceRowsBySchoolId(table, schoolId, rows) {
    if (rows.length === 0) {
        console.log(`Supabase ${table}: no scraped rows for school_id=${schoolId}, keeping existing data.`);
        return;
    }
    const selectColumns = table === "school_facilities_ui"
        ? "name,photo,count"
        : table === "school_principals"
            ? "name,position,photo,welcome,nip"
            : table === "school_staff"
                ? "name,position,nip,photo,is_admin,is_vice_principal"
                : table === "school_teachers"
                    ? "name,position,nip,photo"
                    : table === "school_gallery"
                        ? "photo,caption"
                        : "name,photo";
    const { data: existingRows, error: selectError } = await supabase
        .from(table)
        .select(selectColumns)
        .eq("school_id", schoolId);
    if (selectError) {
        console.error(`Supabase ${table} select error:`, selectError);
        throw selectError;
    }
    const existingRowsSafe = (existingRows ?? []);
    const existingByKey = new Map(existingRowsSafe.map((row) => {
        const key = table === "school_gallery"
            ? String(row.photo ?? "")
            : String(row.name ?? "");
        return [key, row];
    }));
    const mergedRows = rows.map((row) => {
        const incoming = row;
        const existing = existingByKey.get(String(incoming.name ?? ""));
        if (table === "school_principals") {
            return {
                school_id: schoolId,
                name: String(incoming.name ?? existing?.name ?? ""),
                position: incoming.position ?? existing?.position ?? null,
                photo: incoming.photo ?? existing?.photo ?? null,
                welcome: incoming.welcome ?? existing?.welcome ?? null,
                nip: incoming.nip ?? existing?.nip ?? null,
            };
        }
        if (table === "school_staff") {
            return {
                school_id: schoolId,
                name: String(incoming.name ?? existing?.name ?? ""),
                position: incoming.position ?? existing?.position ?? null,
                nip: incoming.nip ?? existing?.nip ?? null,
                photo: incoming.photo ?? existing?.photo ?? null,
                is_admin: incoming.is_admin ?? existing?.is_admin ?? false,
                is_vice_principal: incoming.is_vice_principal ?? existing?.is_vice_principal ?? false,
            };
        }
        if (table === "school_teachers") {
            return {
                school_id: schoolId,
                name: String(incoming.name ?? existing?.name ?? ""),
                position: incoming.position ?? existing?.position ?? null,
                nip: incoming.nip ?? existing?.nip ?? null,
                photo: incoming.photo ?? existing?.photo ?? null,
            };
        }
        if (table === "school_facilities_ui") {
            return {
                school_id: schoolId,
                name: String(incoming.name ?? existing?.name ?? ""),
                photo: incoming.photo ?? existing?.photo ?? null,
                count: incoming.count ?? existing?.count ?? null,
            };
        }
        if (table === "school_gallery") {
            return {
                school_id: schoolId,
                photo: incoming.photo ?? existing?.photo ?? null,
                caption: incoming.caption ?? existing?.caption ?? null,
            };
        }
        return {
            school_id: schoolId,
            name: String(incoming.name ?? existing?.name ?? ""),
            photo: incoming.photo ?? existing?.photo ?? null,
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
async function replaceRowsBySchoolIdSimple(table, schoolId, rows) {
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
async function syncRoleStats(schoolId, school) {
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
async function syncRelatedSchoolData(schoolId, school) {
    await syncRoleStats(schoolId, school);
    await replaceRowsBySchoolId("school_facilities_ui", schoolId, (school.facilities ?? []).map((facility) => ({
        school_id: schoolId,
        name: facility.name,
        description: undefined,
        photo: undefined,
        icon: undefined,
        count: facility.count ?? null,
    })));
}
export async function syncCmsSchoolRecord(school) {
    const baseRow = {
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
    const { data: upsertedSchool, error: schoolError } = await withSupabaseRetry(async () => {
        return supabase
            .from("schools")
            .upsert(baseRow, { onConflict: "npsn" })
            .select("id")
            .single();
    }, "schools upsert");
    if (schoolError) {
        console.error("Supabase CMS school upsert error:", schoolError);
        throw schoolError;
    }
    const schoolId = Number(upsertedSchool?.id ?? 0);
    if (!schoolId) {
        throw new Error("Failed to resolve the Supabase school id after upsert");
    }
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
            photo: facility.photo,
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
export async function deleteCmsSchoolRecord(schoolId) {
    const tables = [
        "school_principals",
        "school_staff",
        "school_teachers",
        "school_facilities_ui",
        "school_achievements",
        "school_news",
        "school_gallery",
        "school_role_stats",
    ];
    await Promise.all(tables.map(async (table) => {
        const { error } = await supabase.from(table).delete().eq("school_id", schoolId);
        if (error) {
            console.error(`Supabase delete error for ${table}:`, error);
            throw error;
        }
    }));
    const { error: schoolError } = await supabase.from("schools").delete().eq("id", schoolId);
    if (schoolError) {
        console.error("Supabase school delete error:", schoolError);
        throw schoolError;
    }
}
export async function upsertSchoolRecord(school, _syncStatus) {
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
    console.log(`Supabase: upserted school source=${_syncStatus.npsn}/${_syncStatus.slug} scraped=${school.npsn}/${school.slug} => id ${id}`);
    return id;
}
export async function insertSchoolSyncStatus(schoolId, syncStatus) {
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
function sanitizePathSegment(segment) {
    return segment
        .trim()
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
}
function sanitizeFileName(fileName) {
    const parts = fileName.split(".");
    const extension = parts.length > 1 ? parts.pop() : "";
    const baseName = parts.join(".") || "image";
    const safeBase = sanitizePathSegment(baseName).slice(0, 60) || "image";
    const safeExtension = extension ? sanitizePathSegment(extension).slice(0, 10) : "";
    return safeExtension ? `${safeBase}.${safeExtension}` : safeBase;
}
function getFileExtension(fileName) {
    const lastDot = fileName.lastIndexOf(".");
    if (lastDot <= 0 || lastDot === fileName.length - 1) {
        return "";
    }
    return sanitizePathSegment(fileName.slice(lastDot + 1)).slice(0, 10);
}
function sanitizeStorageFolderName(value) {
    const cleaned = value.trim().replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    return cleaned || "school";
}
function deriveSchoolStorageFolderName(schoolSlug, schoolName, schoolId) {
    const candidates = [schoolSlug, schoolName].filter((value) => typeof value === "string" && value.trim().length > 0);
    const patterns = [
        /\b(?:sdn|sd)\s*[-_ ]?0?(\d{1,2})\b/i,
        /\b(?:sdn|sd)(\d{1,2})\b/i,
        /\b(\d{1,2})\b/,
    ];
    for (const candidate of candidates) {
        for (const pattern of patterns) {
            const match = candidate.match(pattern);
            if (match?.[1]) {
                return `SDN_${match[1].padStart(2, "0")}`;
            }
        }
    }
    const fallback = candidates[0] ?? `school-${schoolId ?? "unknown"}`;
    return sanitizeStorageFolderName(fallback).toUpperCase();
}
async function resolveSchoolStorageFolderName(schoolId) {
    const { data, error } = await withSupabaseRetry(async () => supabase.from("schools").select("slug,name").eq("id", schoolId).limit(1).maybeSingle(), `school storage folder lookup ${schoolId}`);
    if (error) {
        console.warn("Unable to resolve school storage folder from school table", { schoolId, error: error.message });
        return `SCHOOL_${schoolId}`;
    }
    return deriveSchoolStorageFolderName(data?.slug, data?.name, schoolId);
}
function normalizeUploadSectionFolder(folder) {
    if (!folder) {
        return "school-hero";
    }
    const segments = folder
        .split("/")
        .map(sanitizePathSegment)
        .filter(Boolean);
    const knownFolders = ["school-hero", "school-card", "principal", "staff", "teachers", "facilities", "achievements", "news", "gallery"];
    for (let index = segments.length - 1; index >= 0; index -= 1) {
        if (knownFolders.includes(segments[index])) {
            return segments[index];
        }
    }
    return segments[segments.length - 1] ?? "school-hero";
}
function resolveUploadFileName(payload, folder) {
    const normalizedFolder = folder.toLowerCase();
    const extension = getFileExtension(payload.fileName);
    if (normalizedFolder.includes("school-hero")) {
        return extension ? `hero_img.${extension}` : "hero_img";
    }
    if (normalizedFolder.includes("school-card")) {
        return extension ? `card_img.${extension}` : "card_img";
    }
    return sanitizeFileName(payload.fileName);
}
function decodeBase64(base64) {
    const payload = base64.includes(",") ? base64.split(",").pop() ?? "" : base64;
    return Buffer.from(payload, "base64");
}
export async function listCmsStorageFilesForSchool(schoolId) {
    const bucket = ensureBucketName();
    const schoolFolder = await resolveSchoolStorageFolderName(schoolId);
    const folders = ["school-hero", "school-card", "principal", "staff", "teachers", "facilities", "achievements", "news", "gallery"];
    const files = [];
    for (const folder of folders) {
        const folderPath = `SchoolDetail/${schoolFolder}/${folder}`;
        const { data, error } = await withSupabaseRetry(async () => supabase.storage.from(bucket).list(folderPath, {
            limit: 1000,
            sortBy: { column: "name", order: "asc" },
        }), `storage list ${folderPath}`);
        if (error) {
            continue;
        }
        const entries = Array.isArray(data) ? data : [];
        for (const entry of entries) {
            if (!entry || typeof entry.name !== "string") {
                continue;
            }
            const objectPath = `${folderPath}/${entry.name}`;
            const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(objectPath);
            if (!publicUrlData?.publicUrl) {
                continue;
            }
            files.push({
                path: objectPath,
                name: entry.name,
                bucket,
                publicUrl: publicUrlData.publicUrl,
            });
        }
    }
    return files;
}
function ensureBucketName() {
    return SUPABASE_STORAGE_BUCKET.trim() || "image";
}
export async function uploadCmsImage(payload) {
    const bucket = ensureBucketName();
    const schoolFolder = deriveSchoolStorageFolderName(payload.schoolSlug, payload.schoolName, payload.schoolId);
    const folder = normalizeUploadSectionFolder(payload.folder);
    const fileName = resolveUploadFileName(payload, folder);
    const path = ["SchoolDetail", schoolFolder, folder, fileName].filter(Boolean).join("/");
    const fileBody = decodeBase64(payload.base64);
    const { data: buckets, error: listError } = await withSupabaseRetry(async () => supabase.storage.listBuckets(), "storage list buckets");
    if (listError) {
        throw listError;
    }
    const bucketExists = buckets.some((item) => item.name === bucket);
    if (!bucketExists) {
        const { error: createError } = await withSupabaseRetry(async () => supabase.storage.createBucket(bucket, {
            public: true,
        }), "storage create bucket");
        if (createError) {
            throw createError;
        }
    }
    const { error: uploadError } = await withSupabaseRetry(async () => supabase.storage.from(bucket).upload(path, fileBody, {
        contentType: payload.mimeType,
        upsert: true,
    }), "storage upload");
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
//# sourceMappingURL=supabase.js.map