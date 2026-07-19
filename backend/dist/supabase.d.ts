import type { SchoolSyncStatus, ScrapedSchoolData } from "./types.js";
export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
type CmsImageUploadPayload = {
    fileName: string;
    mimeType: string;
    base64: string;
    folder?: string;
    schoolId?: number;
    schoolSlug?: string | null;
    schoolName?: string | null;
};
type StorageFileRecord = {
    path: string;
    name: string;
    bucket: string;
    publicUrl: string;
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
export declare function validateAdminLogin(username: string, password: string): Promise<AdminSessionPayload | null>;
export declare function authenticateAdminSession(token: string): AdminSessionTokenPayload | null;
export declare function syncCmsSchoolRecord(school: CmsSchoolPayload): Promise<void>;
export declare function deleteCmsSchoolRecord(schoolId: number): Promise<void>;
export declare function upsertSchoolRecord(school: ScrapedSchoolData, _syncStatus: SchoolSyncStatus): Promise<number | null>;
export declare function insertSchoolSyncStatus(schoolId: number, syncStatus: SchoolSyncStatus): Promise<void>;
export declare function listCmsStorageFilesForSchool(schoolId: number): Promise<StorageFileRecord[]>;
export declare function uploadCmsImage(payload: CmsImageUploadPayload): Promise<{
    publicUrl: string;
    path: string;
    bucket: string;
}>;
export {};
//# sourceMappingURL=supabase.d.ts.map