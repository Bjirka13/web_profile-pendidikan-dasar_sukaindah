import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { allSchools as seedSchools, type SchoolFull } from "../data/schools";

const STORAGE_KEY = "portal-pendidikan-school-cms-v1";
const ADMIN_STORAGE_KEY = "portal-pendidikan-admin-session-v1";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") || "http://localhost:4000";
const SUPABASE_REST_URL = SUPABASE_URL ? `${SUPABASE_URL}/rest/v1` : "";
const HAS_SUPABASE = Boolean(SUPABASE_REST_URL && SUPABASE_KEY);
const ADMIN_PASSWORD_SALT = "portal-pendidikan-admin-v1";
const ADMIN_SESSION_SECRET = "portal-pendidikan-admin-session-v1";
const ADMIN_PASSWORD_HASHES = [
  "b8b5d86efd9a66ca00b909661c19be2ab00237342dd89bc171bf48dfc1c7882d",
  "390753ca1e426b785de7ad0317d0100959aaa69c7be7bb1ad12571e23fed1c5c",
  "5aaf5c2d3f8c51b07cb6b927d45b2a27ac2d84c28a931c2685b5e105731476fe",
  "efd8f4d1a5203729c3cea37f739ecdc894d9a8a527a8cdc39c6f1b29cfd390e6",
] as const;

type AdminUsername = `ops${1 | 2 | 3 | 4}`;
type AdminAccount = {
  username: AdminUsername;
  schoolId: number;
  schoolSlug: string;
  schoolName: string;
  passwordHash: string;
};

type AdminSession = {
  username: string;
  schoolId: number;
  schoolSlug: string;
  schoolName: string;
  token: string;
};

type SchoolTableRow = {
  id: number;
  slug: string;
  npsn: string;
  name: string;
  short_name?: string | null;
  tagline?: string | null;
  status?: string | null;
  accreditation?: string | null;
  year_established?: string | null;
  address?: string | null;
  kode_pos?: string | null;
  kecamatan?: string | null;
  desa?: string | null;
  contact?: string | null;
  email?: string | null;
  hero_image?: string | null;
  card_image?: string | null;
  maps_embed?: string | null;
  sync_status?: string | null;
  profile_summary?: string | null;
  profile_details?: string[] | null;
  facilities?: Array<{ name: string; count?: number }> | null;
  grade_stats?: Array<{ grade: number; label: string; total: number; male: number; female: number }> | null;
  total_students?: number | null;
  male_students?: number | null;
  female_students?: number | null;
  total_teachers?: number | null;
  total_classrooms?: number | null;
  total_study_groups?: number | null;
};

type RoleStatRole = "guru" | "tenaga_didik" | "peserta_didik";

type RoleStatRow = {
  school_id: number;
  role: RoleStatRole;
  total?: number | null;
  male?: number | null;
  female?: number | null;
  scraped_at?: string | null;
};

type RelatedRow = Record<string, unknown> & { school_id: number };

export function cloneSchoolData(school: SchoolFull): SchoolFull {
  return JSON.parse(JSON.stringify(school)) as SchoolFull;
}

function textOrFallback(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

const ADMIN_ACCOUNTS: AdminAccount[] = seedSchools.slice(0, 4).map((school, index) => ({
  username: `ops${index + 1}` as AdminUsername,
  schoolId: school.id,
  schoolSlug: school.slug,
  schoolName: school.name,
  passwordHash: ADMIN_PASSWORD_HASHES[index],
}));

function getAdminAccount(username: string): AdminAccount | undefined {
  return ADMIN_ACCOUNTS.find((account) => account.username === username.trim().toLowerCase());
}

function signAdminSession(session: Pick<AdminSession, "username" | "schoolId" | "schoolSlug">): string {
  return btoa(`${ADMIN_SESSION_SECRET}:${session.username}:${session.schoolId}:${session.schoolSlug}`);
}

function readAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<AdminSession>;
    if (
      typeof parsed.username !== "string" ||
      typeof parsed.schoolId !== "number" ||
      typeof parsed.schoolSlug !== "string" ||
      typeof parsed.schoolName !== "string" ||
      typeof parsed.token !== "string"
    ) {
      return null;
    }

    const expectedToken = signAdminSession({
      username: parsed.username,
      schoolId: parsed.schoolId,
      schoolSlug: parsed.schoolSlug,
    });
    if (parsed.token !== expectedToken) {
      return null;
    }

    return {
      username: parsed.username,
      schoolId: parsed.schoolId,
      schoolSlug: parsed.schoolSlug,
      schoolName: parsed.schoolName,
      token: expectedToken,
    };
  } catch {
    return null;
  }
}

async function hashAdminPassword(username: string, password: string): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("Browser crypto is unavailable.");
  }

  const payload = `${ADMIN_PASSWORD_SALT}:${username.trim().toLowerCase()}:${password}`;
  const bytes = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function persistAdminSession(session: AdminSession | null): void {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(ADMIN_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
}

function loadSchoolsFromStorage(): SchoolFull[] | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed as SchoolFull[];
  } catch {
    return null;
  }
}

function persistSchoolsToStorage(schools: SchoolFull[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(schools));
}

function getNextId(schools: SchoolFull[]): number {
  return schools.reduce((max, school) => Math.max(max, school.id), 0) + 1;
}

function createSchoolTemplate(nextId: number): SchoolFull {
  const base = cloneSchoolData(seedSchools[0]);

  return {
    ...base,
    id: nextId,
    slug: `sdn-baru-${String(nextId).padStart(2, "0")}`,
    name: `Sekolah Baru ${nextId}`,
    shortName: `SB ${nextId}`,
    npsn: `${90000000 + nextId}`,
    tagline: "Tulis tagline sekolah di sini",
    syncStatus: "Draft CMS",
    address: "Alamat sekolah",
    kodePos: "00000",
    kecamatan: base.kecamatan,
    desa: base.desa,
    contact: "",
    email: "",
    accreditation: "-",
    status: base.status,
    yearEstablished: String(new Date().getFullYear()),
    principal: {
      ...base.principal,
      name: "",
      position: "Kepala Sekolah",
      nip: undefined,
      welcome: "",
    },
    history: "",
    vision: "",
    mission: [""],
    goals: [""],
    totalStudents: 0,
    maleStudents: 0,
    femaleStudents: 0,
    totalTeachers: 0,
    totalClassrooms: 0,
    totalStudyGroups: 0,
    staff: [],
    teachers: [],
    facilities: [],
    achievements: [],
    news: [],
    gallery: [],
  };
}

type SchoolCmsContextValue = {
  schools: SchoolFull[];
  adminSession: AdminSession | null;
  getSchoolBySlug: (slug: string) => SchoolFull | undefined;
  getSchoolById: (id: number) => SchoolFull | undefined;
  saveSchool: (school: SchoolFull) => void;
  createSchool: () => SchoolFull;
  deleteSchool: (id: number) => void;
  resetSchools: () => void;
  login: (username: string, password: string) => Promise<AdminSession>;
  logout: () => void;
  syncSchoolsToSupabase: (schoolIds?: number[]) => Promise<void>;
  isSupabaseEnabled: boolean;
};

const SchoolCmsContext = createContext<SchoolCmsContextValue | null>(null);

function supabaseHeaders(token?: string): HeadersInit {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${token || SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

async function supabaseRequest(path: string, init?: RequestInit, token?: string): Promise<Response> {
  if (!HAS_SUPABASE) {
    throw new Error("Supabase environment is not configured.");
  }

  return fetch(`${SUPABASE_REST_URL}/${path}`, {
    ...init,
    headers: {
      ...supabaseHeaders(token),
      ...(init?.headers || {}),
    },
  });
}

async function supabaseSelect<T>(table: string, query = "*", token?: string): Promise<T[]> {
  const response = await supabaseRequest(`${table}?select=${encodeURIComponent(query)}`, {
    method: "GET",
  }, token);

  if (!response.ok) {
    throw new Error(`Failed to load ${table}: ${response.status}`);
  }

  return (await response.json()) as T[];
}

async function supabaseDeleteBySchoolId(table: string, schoolId: number, token?: string): Promise<void> {
  const response = await supabaseRequest(`${table}?school_id=eq.${schoolId}`, {
    method: "DELETE",
  }, token);

  if (!response.ok) {
    throw new Error(`Failed to delete ${table}: ${response.status}`);
  }
}

async function supabaseInsert<T>(table: string, rows: T[], token?: string): Promise<void> {
  if (rows.length === 0) return;

  const response = await supabaseRequest(table, {
    method: "POST",
    body: JSON.stringify(rows),
  }, token);

  if (!response.ok) {
    throw new Error(`Failed to insert into ${table}: ${response.status}`);
  }
}

async function backendRequest(path: string, body: unknown): Promise<Response> {
  return fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

function toSchoolTableRow(school: SchoolFull): SchoolTableRow {
  return {
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
    facilities: school.facilities.map((facility) => ({ name: facility.name, count: facility.count })),
    grade_stats: school.gradeStats.map((grade) => ({
      grade: grade.grade,
      label: grade.label,
      total: grade.total,
      male: grade.male,
      female: grade.female,
    })),
    total_students: school.totalStudents,
    male_students: school.maleStudents,
    female_students: school.femaleStudents,
    total_teachers: school.totalTeachers,
    total_classrooms: school.totalClassrooms,
    total_study_groups: school.totalStudyGroups,
  };
}

function mergeSchoolFromRemote(base: SchoolFull, row?: SchoolTableRow, related?: {
  principal?: RelatedRow | null;
  staff?: RelatedRow[];
  teachers?: RelatedRow[];
  facilities?: RelatedRow[];
  gallery?: RelatedRow[];
}, roleStats?: Map<RoleStatRole, RoleStatRow>): SchoolFull {
  if (!row) return base;

  const school = cloneSchoolData(base);
  school.id = row.id;
  school.slug = row.slug ?? school.slug;
  school.npsn = row.npsn ?? school.npsn;
  school.name = row.name ?? school.name;
  school.shortName = row.short_name ?? school.shortName;
  school.tagline = row.tagline ?? school.tagline;
  school.status = row.status ?? school.status;
  school.accreditation = row.accreditation ?? school.accreditation;
  school.yearEstablished = row.year_established ?? school.yearEstablished;
  school.address = row.address ?? school.address;
  school.kodePos = row.kode_pos ?? school.kodePos;
  school.kecamatan = row.kecamatan ?? school.kecamatan;
  school.desa = row.desa ?? school.desa;
  school.contact = row.contact ?? school.contact;
  school.email = row.email ?? school.email;
  school.heroImage = row.hero_image ?? school.heroImage;
  school.cardImage = row.card_image ?? school.cardImage;
  school.mapsEmbed = row.maps_embed ?? school.mapsEmbed;
  school.syncStatus = row.sync_status ?? school.syncStatus;
  const studentsStat = roleStats?.get("peserta_didik");
  const teachersStat = roleStats?.get("guru");
  school.totalStudents = studentsStat?.total ?? row.total_students ?? school.totalStudents;
  school.maleStudents = studentsStat?.male ?? row.male_students ?? school.maleStudents;
  school.femaleStudents = studentsStat?.female ?? row.female_students ?? school.femaleStudents;
  school.totalTeachers = teachersStat?.total ?? row.total_teachers ?? school.totalTeachers;
  school.totalClassrooms = row.total_classrooms ?? school.totalClassrooms;
  school.totalStudyGroups = row.total_study_groups ?? school.totalStudyGroups;

  const profileDetails = Array.isArray(row.profile_details)
    ? row.profile_details.map((item) => String(item ?? "")).filter((item) => item.trim().length > 0)
    : [];
  if (profileDetails.length > 0) {
    school.history = profileDetails[0] ?? school.history;
    school.vision = profileDetails[1] ?? school.vision;
    const remaining = profileDetails.slice(2);
    if (remaining.length > 0) {
      const splitIndex = Math.ceil(remaining.length / 2);
      const mission = remaining.slice(0, splitIndex);
      const goals = remaining.slice(splitIndex);
      if (mission.length > 0) {
        school.mission = mission;
      }
      if (goals.length > 0) {
        school.goals = goals;
      }
    }
  }

  if (row.facilities?.length) {
    school.facilities = row.facilities.map((facility) => ({
      name: facility.name,
      description: textOrFallback(
        facility.description,
        base.facilities.find((item) => item.name === facility.name)?.description ?? ""
      ),
      photo: textOrFallback(
        facility.photo,
        base.facilities.find((item) => item.name === facility.name)?.photo ?? base.cardImage
      ),
      icon: base.facilities.find((item) => item.name === facility.name)?.icon ?? "🏫",
      count: facility.count ?? 0,
    }));
  }

  if (row.grade_stats?.length) {
    school.gradeStats = row.grade_stats.map((grade) => ({
      grade: grade.grade,
      label: grade.label,
      total: grade.total,
      male: grade.male,
      female: grade.female,
    }));
  }

  if (related?.principal) {
    school.principal = {
      name: String(related.principal.name ?? school.principal.name),
      position: String(related.principal.position ?? school.principal.position),
      photo: String(related.principal.photo ?? school.principal.photo),
      welcome: String(related.principal.welcome ?? school.principal.welcome),
      nip: related.principal.nip ? String(related.principal.nip) : undefined,
    };
  }

  if (related?.staff?.length) {
    school.staff = related.staff.map((person) => ({
      name: String(person.name ?? ""),
      position: String(person.position ?? ""),
      photo: String(person.photo ?? ""),
      nip: person.nip ? String(person.nip) : undefined,
      isAdmin: Boolean(person.is_admin),
      isVicePrincipal: Boolean(person.is_vice_principal),
    }));
  }

  if (related?.teachers?.length) {
    school.teachers = related.teachers.map((person) => ({
      name: String(person.name ?? ""),
      position: String(person.position ?? ""),
      photo: String(person.photo ?? ""),
      nip: person.nip ? String(person.nip) : undefined,
    }));
  }

  if (related?.facilities?.length) {
    school.facilities = related.facilities.map((facility) => ({
      name: String(facility.name ?? ""),
      description: textOrFallback(
        facility.description,
        base.facilities.find((item) => item.name === String(facility.name ?? ""))?.description ?? ""
      ),
      photo: textOrFallback(
        facility.photo,
        base.facilities.find((item) => item.name === String(facility.name ?? ""))?.photo ?? base.cardImage
      ),
      icon: String(facility.icon ?? "🏫"),
      count: Number(facility.count ?? 0),
    }));
  }

  if (related?.gallery?.length) {
    school.gallery = related.gallery.map((item) => ({
      photo: String(item.photo ?? ""),
      caption: String(item.caption ?? ""),
    }));
  }

  return school;
}

async function loadSchoolsFromSupabase(): Promise<SchoolFull[] | null> {
  if (!HAS_SUPABASE) return null;

  const [schoolsRows, principalRows, staffRows, teacherRows, facilityRows, galleryRows, roleStatRows] =
    await Promise.all([
      supabaseSelect<SchoolTableRow>("schools"),
      supabaseSelect<RelatedRow>("school_principals"),
      supabaseSelect<RelatedRow>("school_staff"),
      supabaseSelect<RelatedRow>("school_teachers"),
      supabaseSelect<RelatedRow>("school_facilities_ui"),
      supabaseSelect<RelatedRow>("school_gallery"),
      supabaseSelect<RoleStatRow>("school_role_stats"),
    ]);

  const bySlug = new Map(schoolsRows.map((row) => [row.slug, row]));
  const principalBySchoolId = new Map(principalRows.map((row) => [row.school_id, row]));
  const staffBySchoolId = new Map<number, RelatedRow[]>();
  const teachersBySchoolId = new Map<number, RelatedRow[]>();
  const facilitiesBySchoolId = new Map<number, RelatedRow[]>();
  const galleryBySchoolId = new Map<number, RelatedRow[]>();
  const roleStatsBySchoolId = new Map<number, Map<RoleStatRole, RoleStatRow>>();

  for (const row of staffRows) {
    staffBySchoolId.set(row.school_id, [...(staffBySchoolId.get(row.school_id) ?? []), row]);
  }
  for (const row of teacherRows) {
    teachersBySchoolId.set(row.school_id, [...(teachersBySchoolId.get(row.school_id) ?? []), row]);
  }
  for (const row of facilityRows) {
    facilitiesBySchoolId.set(row.school_id, [...(facilitiesBySchoolId.get(row.school_id) ?? []), row]);
  }
  for (const row of galleryRows) {
    galleryBySchoolId.set(row.school_id, [...(galleryBySchoolId.get(row.school_id) ?? []), row]);
  }
  for (const row of roleStatRows) {
    const schoolMap = roleStatsBySchoolId.get(row.school_id) ?? new Map<RoleStatRole, RoleStatRow>();
    schoolMap.set(row.role, row);
    roleStatsBySchoolId.set(row.school_id, schoolMap);
  }

  const merged = seedSchools.map((base) =>
    mergeSchoolFromRemote(base, bySlug.get(base.slug), {
      principal: principalBySchoolId.get(base.id) ?? null,
      staff: staffBySchoolId.get(base.id) ?? [],
      teachers: teachersBySchoolId.get(base.id) ?? [],
      facilities: facilitiesBySchoolId.get(base.id) ?? [],
      gallery: galleryBySchoolId.get(base.id) ?? [],
    }, roleStatsBySchoolId.get(base.id))
  );

  return merged;
}

async function syncSchoolToSupabase(school: SchoolFull, token?: string): Promise<void> {
  if (!HAS_SUPABASE) return;

  const baseRow = toSchoolTableRow(school);
  const schoolResponse = await supabaseRequest("schools?id=eq." + school.id, {
    method: "PATCH",
    body: JSON.stringify(baseRow),
  }, token);

  if (!schoolResponse.ok) {
    throw new Error(`Failed to upsert school ${school.name}: ${schoolResponse.status}`);
  }

  const schoolId = school.id;

  await Promise.all([
    supabaseDeleteBySchoolId("school_principals", schoolId, token),
    supabaseDeleteBySchoolId("school_staff", schoolId, token),
    supabaseDeleteBySchoolId("school_teachers", schoolId, token),
    supabaseDeleteBySchoolId("school_facilities_ui", schoolId, token),
    supabaseDeleteBySchoolId("school_gallery", schoolId, token),
  ]);

  await supabaseInsert("school_principals", [{
    school_id: schoolId,
    name: school.principal.name,
    position: school.principal.position,
    photo: school.principal.photo,
    welcome: school.principal.welcome,
    nip: school.principal.nip ?? null,
  }], token);

  await supabaseInsert("school_staff", school.staff.map((person) => ({
    school_id: schoolId,
    name: person.name,
    position: person.position,
    nip: person.nip ?? null,
    photo: person.photo,
    is_admin: Boolean(person.isAdmin),
    is_vice_principal: Boolean(person.isVicePrincipal),
  })), token);

  await supabaseInsert("school_teachers", school.teachers.map((person) => ({
    school_id: schoolId,
    name: person.name,
    position: person.position,
    nip: person.nip ?? null,
    photo: person.photo,
  })), token);

  await supabaseInsert("school_facilities_ui", school.facilities.map((facility) => ({
    school_id: schoolId,
    name: facility.name,
    description: facility.description,
    photo: facility.photo,
    icon: facility.icon,
    count: facility.count,
  })), token);

  await supabaseInsert("school_gallery", school.gallery.map((item) => ({
    school_id: schoolId,
    photo: item.photo,
    caption: item.caption,
  })), token);
}

async function syncAllSchoolsToSupabase(schools: SchoolFull[]): Promise<void> {
  if (!HAS_SUPABASE) return;

  const response = await backendRequest("/api/admin/sync", { schools });
  if (!response.ok) {
    throw new Error(`Failed to sync admin changes: ${response.status}`);
  }
}

export function SchoolCmsProvider({ children }: { children: React.ReactNode }) {
  const [schools, setSchools] = useState<SchoolFull[]>(() => seedSchools.map(cloneSchoolData));
  const [hydrated, setHydrated] = useState(false);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => readAdminSession());

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (HAS_SUPABASE) {
          const remoteSchools = await loadSchoolsFromSupabase();
          if (!active) return;
          if (remoteSchools && remoteSchools.length > 0) {
            setSchools(remoteSchools.map(cloneSchoolData));
            setHydrated(true);
            return;
          }
        }

        const savedSchools = loadSchoolsFromStorage();
        if (!active) return;
        if (savedSchools && savedSchools.length > 0) {
          setSchools(savedSchools.map(cloneSchoolData));
        }
      } catch (error) {
        console.warn("Failed to load schools from Supabase, falling back to seed data:", error);
      } finally {
        if (active) {
          setHydrated(true);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persistSchoolsToStorage(schools);
  }, [hydrated, schools]);

  const value = useMemo<SchoolCmsContextValue>(() => {
    const canManageSchool = (schoolId: number) => {
      if (!adminSession) return true;
      return adminSession.schoolId === schoolId;
    };

    const saveSchool = (school: SchoolFull) => {
      if (!canManageSchool(school.id)) {
        return;
      }

      setSchools((current) =>
        current.map((item) => (item.id === school.id ? cloneSchoolData(school) : item))
      );
    };

    const createSchool = () => {
      if (adminSession) {
        throw new Error("Akun ops hanya dapat mengelola satu sekolah.");
      }

      const nextSchool = createSchoolTemplate(getNextId(schools));
      setSchools((current) => [...current, cloneSchoolData(nextSchool)]);
      return nextSchool;
    };

    const deleteSchool = (id: number) => {
      if (!canManageSchool(id)) {
        return;
      }

      setSchools((current) => current.filter((school) => school.id !== id));
    };

    const resetSchools = () => {
      if (adminSession) {
        throw new Error("Akun ops tidak boleh reset semua sekolah.");
      }

      setSchools(seedSchools.map(cloneSchoolData));
    };

    const login = async (username: string, password: string) => {
      const account = getAdminAccount(username);
      if (!account) {
        throw new Error("Username tidak ditemukan.");
      }

      const enteredHash = await hashAdminPassword(account.username, password);
      if (enteredHash !== account.passwordHash) {
        throw new Error("Password salah.");
      }

      const session: AdminSession = {
        username: account.username,
        schoolId: account.schoolId,
        schoolSlug: account.schoolSlug,
        schoolName: account.schoolName,
        token: signAdminSession(account),
      };

      setAdminSession(session);
      persistAdminSession(session);
      return session;
    };

    const logout = () => {
      setAdminSession(null);
      persistAdminSession(null);
    };

    const syncSchoolsToSupabase = async (schoolIds?: number[]) => {
      const targetSchools = schoolIds && schoolIds.length > 0
        ? schools.filter((school) => schoolIds.includes(school.id))
        : adminSession
          ? schools.filter((school) => school.id === adminSession.schoolId)
          : schools;
      await syncAllSchoolsToSupabase(targetSchools);
    };

    return {
      schools,
      adminSession,
      getSchoolBySlug: (slug: string) => schools.find((school) => school.slug === slug),
      getSchoolById: (id: number) => schools.find((school) => school.id === id),
      saveSchool,
      createSchool,
      deleteSchool,
      resetSchools,
      login,
      logout,
      syncSchoolsToSupabase,
      isSupabaseEnabled: HAS_SUPABASE,
    };
  }, [adminSession, schools]);

  return <SchoolCmsContext.Provider value={value}>{children}</SchoolCmsContext.Provider>;
}

export function useSchoolCms() {
  const context = useContext(SchoolCmsContext);
  if (!context) {
    throw new Error("useSchoolCms must be used inside SchoolCmsProvider");
  }
  return context;
}
