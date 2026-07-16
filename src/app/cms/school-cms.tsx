import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { type Achievement, type GalleryItem, type NewsItem, type RoleStats, type SchoolFull } from "../data/schools";

const ADMIN_STORAGE_KEY = "portal-pendidikan-admin-session-v1";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") || "";
const SUPABASE_REST_URL = SUPABASE_URL ? `${SUPABASE_URL}/rest/v1` : "";
const HAS_SUPABASE = Boolean(SUPABASE_REST_URL && SUPABASE_KEY);

type AdminSession = {
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
  total_students?: number | null;
  male_students?: number | null;
  female_students?: number | null;
  total_teachers?: number | null;
  total_classrooms?: number | null;
  total_study_groups?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type RelatedRow = {
  id?: number;
  school_id: number;
  name?: string | null;
  position?: string | null;
  photo?: string | null;
  welcome?: string | null;
  nip?: string | null;
  is_admin?: boolean | null;
  is_vice_principal?: boolean | null;
  description?: string | null;
  icon?: string | null;
  count?: number | null;
  title?: string | null;
  year?: string | null;
  level?: string | null;
  excerpt?: string | null;
  thumbnail?: string | null;
  category?: string | null;
  caption?: string | null;
  role?: "guru" | "tenaga_didik" | "peserta_didik" | null;
  total?: number | null;
  male?: number | null;
  female?: number | null;
  status?: string | null;
  message?: string | null;
  source_url?: string | null;
  scraped_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type UploadImageResponse = {
  success?: boolean;
  publicUrl?: string;
  error?: string;
};

type AdminLoginResponse = {
  success?: boolean;
  error?: string;
  username?: string;
  schoolId?: number;
  schoolSlug?: string;
  schoolName?: string;
  token?: string;
  issuedAt?: string;
  expiresAt?: string;
};

export function cloneSchoolData(school: SchoolFull): SchoolFull {
  return JSON.parse(JSON.stringify(school)) as SchoolFull;
}

function textOrEmpty(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function formatDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function decodeAdminSessionToken(token: string): AdminSessionTokenPayload | null {
  const [payloadPart] = token.split(".");
  if (!payloadPart) {
    return null;
  }

  try {
    const serialized = atob(payloadPart);
    const parsed = JSON.parse(serialized) as Partial<AdminSessionTokenPayload>;
    if (
      typeof parsed.username !== "string" ||
      typeof parsed.schoolId !== "number" ||
      typeof parsed.schoolSlug !== "string" ||
      typeof parsed.schoolName !== "string" ||
      typeof parsed.issuedAt !== "string" ||
      typeof parsed.expiresAt !== "string" ||
      typeof parsed.jti !== "string"
    ) {
      return null;
    }

    if (Number.isNaN(new Date(parsed.issuedAt).getTime()) || Number.isNaN(new Date(parsed.expiresAt).getTime())) {
      return null;
    }

    if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
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

    const tokenPayload = decodeAdminSessionToken(parsed.token);
    if (!tokenPayload) {
      return null;
    }

    if (
      tokenPayload.username !== parsed.username ||
      tokenPayload.schoolId !== parsed.schoolId ||
      tokenPayload.schoolSlug !== parsed.schoolSlug ||
      tokenPayload.schoolName !== parsed.schoolName
    ) {
      return null;
    }

    return {
      username: parsed.username,
      schoolId: parsed.schoolId,
      schoolSlug: parsed.schoolSlug,
      schoolName: parsed.schoolName,
      token: parsed.token,
      issuedAt: tokenPayload.issuedAt,
      expiresAt: tokenPayload.expiresAt,
    };
  } catch {
    return null;
  }
}

function persistAdminSession(session: AdminSession | null): void {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(ADMIN_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
}

function createBlankSchool(id: number): SchoolFull {
  return {
    id,
    slug: "",
    name: "",
    shortName: "",
    npsn: "",
    tagline: "",
    syncStatus: "",
    address: "",
    kodePos: "",
    kecamatan: "",
    desa: "",
    contact: "",
    email: "",
    accreditation: "",
    status: "",
    yearEstablished: "",
    heroImage: "",
    cardImage: "",
    mapsEmbed: "",
    profileSummary: "",
    profileDetails: [],
    principal: {
      name: "",
      photo: "",
      welcome: "",
      position: "",
      nip: "",
    },
    history: "",
    vision: "",
    mission: [],
    goals: [],
    totalStudents: 0,
    maleStudents: 0,
    femaleStudents: 0,
    totalTeachers: 0,
    totalClassrooms: 0,
    totalStudyGroups: 0,
    gradeStats: [],
    roleStats: [],
    staff: [],
    teachers: [],
    facilities: [],
    achievements: [],
    news: [],
    gallery: [],
  };
}

function parseProfileNarrative(details: string[]): Pick<SchoolFull, "history" | "vision" | "mission" | "goals"> {
  if (details.length === 0) {
    return { history: "", vision: "", mission: [], goals: [] };
  }

  const identityHints = ["NPSN", "Status", "Bentuk Pendidikan", "SK Pendirian", "Tanggal SK"];
  const looksLikeIdentity = details.slice(0, 5).some((item) => identityHints.some((hint) => item.includes(hint)));

  if (looksLikeIdentity) {
    return { history: "", vision: "", mission: [], goals: [] };
  }

  const history = details[0] ?? "";
  const vision = details[1] ?? "";
  const remaining = details.slice(2);
  const splitIndex = Math.ceil(remaining.length / 2);

  return {
    history,
    vision,
    mission: remaining.slice(0, splitIndex),
    goals: remaining.slice(splitIndex),
  };
}

function latestSyncStatus(rows: RelatedRow[]): string {
  if (rows.length === 0) return "";

  const latest = [...rows].sort((a, b) => {
    const left = new Date(a.scraped_at ?? a.created_at ?? 0).getTime();
    const right = new Date(b.scraped_at ?? b.created_at ?? 0).getTime();
    return right - left;
  })[0];

  const message = textOrEmpty(latest.message ?? latest.category ?? latest.name);
  const fallback = textOrEmpty(latest.status);
  const date = formatDate(latest.scraped_at ?? latest.created_at);
  const base = message || fallback;

  if (!base) return "";
  return date ? `${base} • ${date}` : base;
}

function resolveTotalTeachers(row: SchoolTableRow, roleStats: RoleStats[]): number {
  const roleTotal = roleStats
    .filter((item) => item.role === "guru" || item.role === "tenaga_didik")
    .reduce((acc, item) => acc + item.total, 0);
  return numberOrZero(row.total_teachers) || roleTotal;
}

function resolveTotalStudents(row: SchoolTableRow, roleStats: RoleStats[]): number {
  const roleStat = roleStats.find((item) => item.role === "peserta_didik");
  return numberOrZero(row.total_students) || (roleStat?.total ?? 0);
}

function resolveStudentGender(row: SchoolTableRow, roleStats: RoleStats[]): { male: number; female: number } {
  const roleStat = roleStats.find((item) => item.role === "peserta_didik");
  return {
    male: numberOrZero(row.male_students) || (roleStat?.male ?? 0),
    female: numberOrZero(row.female_students) || (roleStat?.female ?? 0),
  };
}

function resolveTotalClassrooms(row: SchoolTableRow, facilities: SchoolFull["facilities"]): number {
  const classroomFacility = facilities.find((facility) => facility.name.toLowerCase() === "ruang kelas");
  return numberOrZero(row.total_classrooms) || classroomFacility?.count || 0;
}

function toSchoolFacilityRows(rows: RelatedRow[]): SchoolFull["facilities"] {
  return rows
    .slice()
    .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
    .map((row) => ({
      name: textOrEmpty(row.name),
      description: textOrEmpty(row.description),
      photo: textOrEmpty(row.photo),
      icon: textOrEmpty(row.icon),
      count: numberOrZero(row.count),
    }));
}

function toSchoolAchievements(rows: RelatedRow[]): Achievement[] {
  return rows
    .slice()
    .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
    .map((row) => ({
      title: textOrEmpty(row.title),
      year: textOrEmpty(row.year),
      level: textOrEmpty(row.level),
      description: textOrEmpty(row.description ?? row.excerpt),
      photo: textOrEmpty(row.photo),
    }));
}

function toSchoolNews(rows: RelatedRow[]): NewsItem[] {
  return rows
    .slice()
    .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
    .map((row) => ({
      id: numberOrZero(row.id),
      title: textOrEmpty(row.title),
      date: textOrEmpty(row.date ?? row.scraped_at),
      excerpt: textOrEmpty(row.excerpt ?? row.description),
      thumbnail: textOrEmpty(row.thumbnail ?? row.photo),
      category: textOrEmpty(row.category) || "Informasi",
    }));
}

function toSchoolGallery(rows: RelatedRow[]): GalleryItem[] {
  return rows
    .slice()
    .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
    .map((row) => ({
      photo: textOrEmpty(row.photo),
      caption: textOrEmpty(row.caption),
    }));
}

function toSchoolRoleStats(rows: RelatedRow[]): RoleStats[] {
  return rows
    .slice()
    .sort((a, b) => {
      const order: Record<string, number> = {
        guru: 0,
        tenaga_didik: 1,
        peserta_didik: 2,
      };
      return (order[a.role ?? ""] ?? 99) - (order[b.role ?? ""] ?? 99);
    })
    .map((row) => ({
      role: row.role ?? "guru",
      total: numberOrZero(row.total),
      male: numberOrZero(row.male),
      female: numberOrZero(row.female),
      scrapedAt: textOrEmpty(row.scraped_at),
    }));
}

function toTeacherRows(rows: RelatedRow[]): SchoolFull["teachers"] {
  return rows
    .slice()
    .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
    .map((row) => ({
      name: textOrEmpty(row.name),
      position: textOrEmpty(row.position),
      photo: textOrEmpty(row.photo),
      nip: textOrEmpty(row.nip) || undefined,
    }));
}

function toStaffRows(rows: RelatedRow[]): SchoolFull["staff"] {
  return rows
    .slice()
    .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
    .map((row) => ({
      name: textOrEmpty(row.name),
      position: textOrEmpty(row.position),
      photo: textOrEmpty(row.photo),
      nip: textOrEmpty(row.nip) || undefined,
      isAdmin: Boolean(row.is_admin),
      isVicePrincipal: Boolean(row.is_vice_principal),
    }));
}

function toPrincipalRow(rows: RelatedRow[], fallback: SchoolFull["principal"]): SchoolFull["principal"] {
  const principal = rows[0];
  if (!principal) {
    return fallback;
  }

  return {
    name: textOrEmpty(principal.name),
    position: textOrEmpty(principal.position),
    photo: textOrEmpty(principal.photo),
    welcome: textOrEmpty(principal.welcome),
    nip: textOrEmpty(principal.nip) || undefined,
  };
}

function toSchoolFromRow(
  row: SchoolTableRow,
  related: {
    principal: RelatedRow[];
    staff: RelatedRow[];
    teachers: RelatedRow[];
    facilities: RelatedRow[];
    achievements: RelatedRow[];
    news: RelatedRow[];
    gallery: RelatedRow[];
    syncStatus: RelatedRow[];
    roleStats: RelatedRow[];
  }
): SchoolFull {
  const base = createBlankSchool(row.id);
  const profileDetails = Array.isArray(row.profile_details)
    ? row.profile_details.map((item) => textOrEmpty(item)).filter(Boolean)
    : [];
  const narrative = parseProfileNarrative(profileDetails);
  const facilities = toSchoolFacilityRows(related.facilities);
  const roleStats = toSchoolRoleStats(related.roleStats);
  const studentGender = resolveStudentGender(row, roleStats);

  return {
    ...base,
    id: row.id,
    slug: textOrEmpty(row.slug),
    name: textOrEmpty(row.name),
    shortName: textOrEmpty(row.short_name),
    npsn: textOrEmpty(row.npsn),
    tagline: textOrEmpty(row.tagline),
    syncStatus: latestSyncStatus(related.syncStatus) || textOrEmpty(row.sync_status),
    address: textOrEmpty(row.address),
    kodePos: textOrEmpty(row.kode_pos),
    kecamatan: textOrEmpty(row.kecamatan),
    desa: textOrEmpty(row.desa),
    contact: textOrEmpty(row.contact),
    email: textOrEmpty(row.email),
    accreditation: textOrEmpty(row.accreditation),
    status: textOrEmpty(row.status),
    yearEstablished: textOrEmpty(row.year_established),
    heroImage: textOrEmpty(row.hero_image),
    cardImage: textOrEmpty(row.card_image),
    mapsEmbed: textOrEmpty(row.maps_embed),
    profileSummary: textOrEmpty(row.profile_summary),
    profileDetails,
    ...narrative,
    totalStudents: resolveTotalStudents(row, roleStats),
    maleStudents: studentGender.male,
    femaleStudents: studentGender.female,
    totalTeachers: resolveTotalTeachers(row, roleStats),
    totalClassrooms: resolveTotalClassrooms(row, facilities),
    totalStudyGroups: numberOrZero(row.total_study_groups),
    gradeStats: [],
    roleStats,
    principal: toPrincipalRow(related.principal, base.principal),
    staff: toStaffRows(related.staff),
    teachers: toTeacherRows(related.teachers),
    facilities,
    achievements: toSchoolAchievements(related.achievements),
    news: toSchoolNews(related.news),
    gallery: toSchoolGallery(related.gallery),
  };
}

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

async function backendRequest(path: string, body: unknown, token?: string): Promise<Response> {
  const url = BACKEND_URL ? `${BACKEND_URL}${path}` : path;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
}

async function uploadImageToBackend(schoolId: number, folder: string, file: File, token: string): Promise<string> {
  const response = await backendRequest(
    "/api/admin/upload-image",
    {
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    base64: await fileToBase64(file),
    folder: `cms/schools/${schoolId}/${folder}`,
    },
    token
  );

  const payload = (await response.json().catch(() => ({}))) as UploadImageResponse;
  if (!response.ok || !payload.success || !payload.publicUrl) {
    throw new Error(payload.error || `Gagal mengunggah gambar (${response.status}).`);
  }

  return payload.publicUrl;
}

async function loadSchoolsFromSupabase(): Promise<SchoolFull[]> {
  if (!HAS_SUPABASE) {
    throw new Error("Supabase environment is not configured.");
  }

  const [
    schoolsRows,
    principalRows,
    staffRows,
    teacherRows,
    facilityRows,
    achievementRows,
    newsRows,
    galleryRows,
    syncRows,
    roleStatRows,
  ] = await Promise.all([
    supabaseSelect<SchoolTableRow>("schools"),
    supabaseSelect<RelatedRow>("school_principals"),
    supabaseSelect<RelatedRow>("school_staff"),
    supabaseSelect<RelatedRow>("school_teachers"),
    supabaseSelect<RelatedRow>("school_facilities_ui"),
    supabaseSelect<RelatedRow>("school_achievements"),
    supabaseSelect<RelatedRow>("school_news"),
    supabaseSelect<RelatedRow>("school_gallery"),
    supabaseSelect<RelatedRow>("school_sync_status"),
    supabaseSelect<RelatedRow>("school_role_stats"),
  ]);

  return schoolsRows
    .slice()
    .sort((a, b) => a.id - b.id)
    .map((row) =>
      toSchoolFromRow(row, {
        principal: principalRows.filter((item) => item.school_id === row.id),
        staff: staffRows.filter((item) => item.school_id === row.id),
        teachers: teacherRows.filter((item) => item.school_id === row.id),
        facilities: facilityRows.filter((item) => item.school_id === row.id),
        achievements: achievementRows.filter((item) => item.school_id === row.id),
        news: newsRows.filter((item) => item.school_id === row.id),
        gallery: galleryRows.filter((item) => item.school_id === row.id),
        syncStatus: syncRows.filter((item) => item.school_id === row.id),
        roleStats: roleStatRows.filter((item) => item.school_id === row.id),
      })
    );
}

type SchoolCmsContextValue = {
  schools: SchoolFull[];
  adminSession: AdminSession | null;
  isLoading: boolean;
  getSchoolBySlug: (slug: string) => SchoolFull | undefined;
  getSchoolById: (id: number) => SchoolFull | undefined;
  saveSchool: (school: SchoolFull) => Promise<void>;
  createSchool: () => SchoolFull;
  deleteSchool: (id: number) => void;
  resetSchools: () => void;
  login: (username: string, password: string) => Promise<AdminSession>;
  logout: () => void;
  syncSchoolsToSupabase: (schoolIds?: number[]) => Promise<void>;
  uploadSchoolImage: (schoolId: number, folder: string, file: File) => Promise<string>;
  isSupabaseEnabled: boolean;
};

const SchoolCmsContext = createContext<SchoolCmsContextValue | null>(null);

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
    profile_summary: school.profileSummary,
    profile_details: school.profileDetails,
    total_students: school.totalStudents,
    male_students: school.maleStudents,
    female_students: school.femaleStudents,
    total_teachers: school.totalTeachers,
    total_classrooms: school.totalClassrooms,
    total_study_groups: school.totalStudyGroups,
  };
}

async function syncAllSchoolsToSupabase(
  schools: SchoolFull[],
  deletedSchoolIds: number[] = [],
  token?: string
): Promise<void> {
  const response = await backendRequest("/api/admin/sync", { schools, deletedSchoolIds }, token);
  if (!response.ok) {
    throw new Error(`Failed to sync admin changes: ${response.status}`);
  }
}

async function fetchAdminAccount(username: string, password: string): Promise<AdminSession> {
  const response = await backendRequest("/api/admin/login", { username, password });
  const payload = (await response.json().catch(() => ({}))) as AdminLoginResponse;

  if (!response.ok || !payload.success || !payload.username || typeof payload.schoolId !== "number") {
    throw new Error(payload.error || "Login gagal.");
  }

  const tokenPayload = payload.token ? decodeAdminSessionToken(payload.token) : null;
  if (!payload.token || !tokenPayload) {
    throw new Error("Sesi admin dari backend tidak valid.");
  }

  return {
    username: payload.username,
    schoolId: payload.schoolId,
    schoolSlug: payload.schoolSlug || payload.username,
    schoolName: payload.schoolName || payload.username,
    token: payload.token,
    issuedAt: payload.issuedAt || tokenPayload.issuedAt,
    expiresAt: payload.expiresAt || tokenPayload.expiresAt,
  };
}

export function SchoolCmsProvider({ children }: { children: ReactNode }) {
  const [schools, setSchools] = useState<SchoolFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => readAdminSession());

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const remoteSchools = await loadSchoolsFromSupabase();
        if (!active) return;
        setSchools(remoteSchools.map(cloneSchoolData));
      } catch (error) {
        console.error("Failed to load schools from Supabase:", error);
        if (active) {
          setSchools([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<SchoolCmsContextValue>(() => {
    const canManageSchool = (schoolId: number) => {
      if (!adminSession) return false;
      return adminSession.schoolId === schoolId;
    };

    const saveSchool = async (school: SchoolFull) => {
      if (!adminSession) {
        throw new Error("Login admin diperlukan untuk menyimpan perubahan.");
      }
      if (!canManageSchool(school.id)) {
        throw new Error("Akun admin ini hanya bisa mengelola satu sekolah.");
      }

      const updatedSchools = schools.map((item) => (item.id === school.id ? cloneSchoolData(school) : item));
      await syncAllSchoolsToSupabase(updatedSchools, [], adminSession.token);
      setSchools(updatedSchools);
    };

    const createSchool = () => {
      if (!adminSession) {
        throw new Error("Login admin diperlukan untuk menambah sekolah.");
      }
      const nextId = schools.reduce((max, school) => Math.max(max, school.id), 0) + 1;
      const nextSchool = createBlankSchool(nextId);
      const updatedSchools = [...schools, cloneSchoolData(nextSchool)];
      setSchools(updatedSchools);
      void syncAllSchoolsToSupabase(updatedSchools, [], adminSession.token).catch((error) => {
        console.error("Failed to persist created school to Supabase:", error);
      });
      return nextSchool;
    };

    const deleteSchool = (id: number) => {
      if (!adminSession) {
        throw new Error("Login admin diperlukan untuk menghapus sekolah.");
      }
      if (!canManageSchool(id)) {
        throw new Error("Akun admin ini hanya bisa mengelola satu sekolah.");
      }

      const updatedSchools = schools.filter((school) => school.id !== id);
      setSchools(updatedSchools);
      void syncAllSchoolsToSupabase(updatedSchools, [id], adminSession.token).catch((error) => {
        console.error("Failed to delete school from Supabase:", error);
      });
    };

    const resetSchools = () => {
      if (!adminSession) {
        throw new Error("Login admin diperlukan untuk reset data.");
      }
      const deletedSchoolIds = schools.map((school) => school.id);
      void syncAllSchoolsToSupabase([], deletedSchoolIds, adminSession.token).catch((error) => {
        console.error("Failed to reset schools on Supabase:", error);
      });
      setSchools([]);
    };

    const login = async (username: string, password: string) => {
      const session = await fetchAdminAccount(username, password);
      setAdminSession(session);
      persistAdminSession(session);
      return session;
    };

    const logout = () => {
      setAdminSession(null);
      persistAdminSession(null);
    };

    const syncSchoolsToSupabase = async (schoolIds?: number[]) => {
      if (!adminSession) {
        throw new Error("Login admin diperlukan untuk sinkronisasi.");
      }
      const targetSchools = schoolIds && schoolIds.length > 0
        ? schools.filter((school) => schoolIds.includes(school.id))
        : schools.filter((school) => school.id === adminSession.schoolId);
      if (targetSchools.some((school) => school.id !== adminSession.schoolId)) {
        throw new Error("Akun admin ini hanya bisa menyinkronkan sekolahnya sendiri.");
      }
      await syncAllSchoolsToSupabase(targetSchools, [], adminSession.token);
    };

    const uploadSchoolImage = async (schoolId: number, folder: string, file: File) => {
      if (!adminSession) {
        throw new Error("Login admin diperlukan untuk upload gambar.");
      }
      if (!HAS_SUPABASE) {
        throw new Error("Supabase belum dikonfigurasi di frontend.");
      }
      if (adminSession.schoolId !== schoolId) {
        throw new Error("Akun admin ini hanya bisa mengunggah gambar untuk sekolahnya sendiri.");
      }
      return uploadImageToBackend(schoolId, folder, file, adminSession.token);
    };

    return {
      schools,
      adminSession,
      isLoading,
      getSchoolBySlug: (slug: string) => schools.find((school) => school.slug === slug),
      getSchoolById: (id: number) => schools.find((school) => school.id === id),
      saveSchool,
      createSchool,
      deleteSchool,
      resetSchools,
      login,
      logout,
      syncSchoolsToSupabase,
      uploadSchoolImage,
      isSupabaseEnabled: HAS_SUPABASE,
    };
  }, [adminSession, isLoading, schools]);

  return <SchoolCmsContext.Provider value={value}>{children}</SchoolCmsContext.Provider>;
}

export function useSchoolCms() {
  const context = useContext(SchoolCmsContext);
  if (!context) {
    throw new Error("useSchoolCms must be used inside SchoolCmsProvider");
  }
  return context;
}
