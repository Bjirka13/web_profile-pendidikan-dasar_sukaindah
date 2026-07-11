import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import type { SchoolSyncStatus, ScrapedSchoolData } from "./types.js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_KEY) must be set in .env before running the backend."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

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
    replaceRowsBySchoolId("school_gallery", schoolId, school.gallery.map((item) => ({
      school_id: schoolId,
      photo: item.photo,
      caption: item.caption,
    }))),
  ]);
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
