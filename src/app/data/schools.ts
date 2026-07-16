export interface TeacherStaff {
  name: string;
  position: string;
  nip?: string;
  photo: string;
  isAdmin?: boolean;
  isVicePrincipal?: boolean;
}

export interface Facility {
  name: string;
  description: string;
  photo: string;
  icon: string;
  count: number;
}

export interface Achievement {
  title: string;
  year: string;
  level: string;
  description: string;
  photo?: string;
}

export interface NewsItem {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  thumbnail: string;
  category: string;
}

export interface GalleryItem {
  photo: string;
  caption: string;
}

export interface GradeStats {
  grade: number;
  label: string;
  total: number;
  male: number;
  female: number;
}

export interface RoleStats {
  role: "guru" | "tenaga_didik" | "peserta_didik";
  total: number;
  male: number;
  female: number;
  scrapedAt?: string;
}

export interface SchoolFull {
  id: number;
  slug: string;
  name: string;
  shortName: string;
  npsn: string;
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

  profileSummary: string;
  profileDetails: string[];

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
  gradeStats: GradeStats[];
  roleStats: RoleStats[];

  staff: TeacherStaff[];
  teachers: TeacherStaff[];
  facilities: Facility[];
  achievements: Achievement[];
  news: NewsItem[];
  gallery: GalleryItem[];
}
