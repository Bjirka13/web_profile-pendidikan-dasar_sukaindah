export interface SchoolListEntry {
    id: number;
    slug: string;
    npsn: string;
}
export interface SchoolSyncStatus {
    npsn: string;
    slug: string;
    status: "success" | "warning" | "failed";
    message: string;
    scrapedAt: string;
    sourceUrl: string;
}
export interface SchoolPrincipal {
    name?: string;
    position?: string;
    photo?: string;
    welcome?: string;
    nip?: string;
}
export interface SchoolStaffMember {
    name: string;
    position: string;
    photo?: string;
    nip?: string;
    isAdmin?: boolean;
    isVicePrincipal?: boolean;
}
export interface ScrapedSchoolData {
    id?: number;
    slug?: string;
    npsn: string;
    name: string;
    kepsek?: string;
    jenjang?: string;
    shortName?: string;
    tagline?: string;
    address?: string;
    kodePos?: string;
    kecamatan?: string;
    desa?: string;
    contact?: string;
    email?: string;
    accreditation?: string;
    status?: string;
    photo?: string;
    yearEstablished?: string;
    heroImage?: string;
    cardImage?: string;
    mapsEmbed?: string;
    principal?: SchoolPrincipal;
    history?: string;
    vision?: string;
    mission?: string[];
    goals?: string[];
    totalStudents?: number;
    maleStudents?: number;
    femaleStudents?: number;
    totalTeachers?: number;
    jumlahRombel?: number;
    jumlahSiswa?: number;
    jumlahGuru?: number;
    totalClassrooms?: number;
    totalStudyGroups?: number;
    profileSummary?: string;
    profileDetails?: string[];
    roleStats?: Array<{
        role: "guru" | "tenaga_didik" | "peserta_didik";
        total: number;
        male: number;
        female: number;
    }>;
    facilities?: Array<{
        name: string;
        count?: number;
    }>;
    gradeStats?: Array<{
        grade: number;
        label: string;
        total: number;
        male: number;
        female: number;
    }>;
    staff?: SchoolStaffMember[];
    teachers?: SchoolStaffMember[];
    achievements?: Array<{
        title: string;
        year?: string;
        description?: string;
    }>;
    news?: Array<{
        title: string;
        date?: string;
        excerpt?: string;
    }>;
    gallery?: Array<{
        photo: string;
        caption: string;
    }>;
    syncStatus?: string;
}
export interface ScrapeResult {
    entry: SchoolListEntry;
    success: boolean;
    payload?: ScrapedSchoolData;
    syncStatus: SchoolSyncStatus;
}
export interface SchoolCatalog {
    updatedAt: string | null;
    schools: ScrapedSchoolData[];
    results: ScrapeResult[];
}
//# sourceMappingURL=types.d.ts.map