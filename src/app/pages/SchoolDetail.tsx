import { useState, type ComponentType, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Award,
  BookOpen,
  Building2,
  ChevronRight,
  Clock,
  Eye,
  Globe,
  GraduationCap,
  Home,
  Image,
  Mail,
  MapPin,
  Newspaper,
  Phone,
  PhoneCall,
  School,
  Trophy,
  Users,
  X,
  ZoomIn,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type SchoolFull } from "../data/schools";
import { Footer, Navbar } from "../components/Layout";
import { useSchoolCms } from "../cms/school-cms";

const font = "'Plus Jakarta Sans', sans-serif";
const PIE_COLORS = ["#1e6b3a", "#e8b800"];

function Section({ id, children, className = "" }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`py-14 md:py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

function SectionHeader({ badge, title, subtitle }: { badge?: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-10">
      {badge && (
        <span className="inline-block bg-secondary text-primary text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3" style={{ fontFamily: font }}>
          {badge}
        </span>
      )}
      <h2 className="text-foreground font-extrabold text-2xl md:text-3xl" style={{ fontFamily: font }}>
        {title}
      </h2>
      {subtitle && <p className="text-muted-foreground mt-2 text-sm" style={{ fontFamily: font }}>{subtitle}</p>}
      <div className="mt-3 h-1 w-14 rounded-full bg-accent" />
    </div>
  );
}

function textOrDash(value: string | null | undefined): string {
  return value && value.trim().length > 0 ? value : "-";
}

function classroomCount(school: SchoolFull): number {
  return school.totalClassrooms || school.facilities.find((facility) => facility.name.toLowerCase() === "ruang kelas")?.count || 0;
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function HeroBanner({ school }: { school: SchoolFull }) {
  const navigate = useNavigate();

  return (
    <div className="relative h-80 md:h-[440px] overflow-hidden">
      <img src={school.heroImage || school.cardImage} alt={`Gedung ${school.name}`} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-end pb-8 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <nav className="flex items-center gap-1.5 text-white/60 text-xs mb-4" style={{ fontFamily: font }}>
            <button onClick={() => navigate("/")} className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="w-3 h-3" /> Beranda
            </button>
            <ChevronRight className="w-3 h-3 text-white/40" />
            <button onClick={() => navigate("/sekolah")} className="hover:text-white transition-colors">
              Sekolah
            </button>
            <ChevronRight className="w-3 h-3 text-white/40" />
            <span className="text-white/80">{school.name || "Sekolah"}</span>
          </nav>

          <div className="flex items-end gap-5">
            <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
                <rect width="80" height="80" fill="#1e6b3a" />
                <path d="M40 10 L10 26 L10 54 L40 70 L70 54 L70 26 Z" fill="#e8b800" opacity="0.85" />
                <path d="M40 18 L16 32 L16 48 L40 62 L64 48 L64 32 Z" fill="#1e6b3a" />
                <text x="40" y="45" textAnchor="middle" fontSize="16" fontWeight="900" fill="white" fontFamily="sans-serif">
                  SD
                </text>
                <text x="40" y="57" textAnchor="middle" fontSize="6" fill="#e8b800" fontFamily="sans-serif">
                  {school.id.toString().padStart(2, "0")}
                </text>
              </svg>
            </div>

            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="bg-accent text-foreground text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ fontFamily: font }}>
                  NPSN {school.npsn || "-"}
                </span>
                <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm" style={{ fontFamily: font }}>
                  {textOrDash(school.status)}
                </span>
                <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm" style={{ fontFamily: font }}>
                  Akreditasi {textOrDash(school.accreditation)}
                </span>
              </div>
              <h1 className="text-white font-extrabold text-2xl md:text-4xl leading-tight" style={{ fontFamily: font }}>
                {school.name || "Sekolah"}
              </h1>
              <p className="text-accent font-medium text-sm md:text-base mt-1 italic" style={{ fontFamily: font }}>
                {school.syncStatus || "Belum ada status sinkronisasi"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSummary({ school }: { school: SchoolFull }) {
  const highlights = [
    { label: "Akreditasi", value: textOrDash(school.accreditation) },
    { label: "Status", value: textOrDash(school.status) },
    { label: "Tahun Berdiri", value: textOrDash(school.yearEstablished) },
  ];

  return (
    <Section className="bg-gradient-to-b from-white to-slate-50/70">
      <SectionHeader badge="Sejarah" title="Sejarah Sekolah" subtitle="Latar belakang dan perjalanan sekolah dalam satu narasi yang jelas" />
      <div className="rounded-[32px] border border-border/70 bg-card p-6 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.18)] md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
                <School className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Latar belakang</p>
                <h3 className="mt-1 font-bold text-foreground text-xl" style={{ fontFamily: font }}>
                  {school.name || "Sekolah"}
                </h3>
              </div>
            </div>

            <p className="mt-6 text-sm leading-7 text-foreground/80" style={{ fontFamily: font }}>
              {school.history || "Belum ada sejarah singkat sekolah yang diisi."}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.label} className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
                  <p className="mt-1 font-semibold text-foreground" style={{ fontFamily: font }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Section>
  );
}

function PrincipalGreetingSection({ school }: { school: SchoolFull }) {
  return (
    <Section className="bg-muted/40">
      <SectionHeader badge="Sambutan" title="Sambutan Kepala Sekolah" subtitle="Pesan dan informasi singkat dari pimpinan sekolah" />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {school.principal.photo ? (
              <img src={school.principal.photo} alt={school.principal.name || "Kepala Sekolah"} className="h-24 w-24 rounded-2xl object-cover shadow-sm" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary shadow-sm">
                {initials(school.principal.name || "Kepala Sekolah")}
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Kepala Sekolah</p>
              <h3 className="mt-2 text-xl font-bold text-foreground" style={{ fontFamily: font }}>
                {school.principal.name || "Belum ada nama kepala sekolah"}
              </h3>
              <p className="mt-1 text-sm font-semibold text-primary">{school.principal.position || "Kepala Sekolah"}</p>
              <p className="mt-2 text-sm text-muted-foreground">{school.principal.nip ? `NIP. ${school.principal.nip}` : "NIP belum tersedia"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Sambutan</p>
          {school.principal.welcome ? (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground/80" style={{ fontFamily: font }}>
              {school.principal.welcome}
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Belum ada sambutan kepala sekolah yang diisi.</p>
          )}
        </div>
      </div>
    </Section>
  );
}

function VisionMissionGoalsSection({ school }: { school: SchoolFull }) {
  const missionItems = (school.mission || []).filter((item) => item && item.trim().length > 0);

  const cards = [
    {
      title: "Visi",
      subtitle: "Tujuan jangka panjang sekolah",
      icon: Eye,
      accent: "bg-primary/10 text-primary",
      body: school.vision || "Visi sekolah belum tersedia.",
      highlight: true,
    },
    {
      title: "Misi",
      subtitle: "Langkah utama yang dijalankan sekolah",
      icon: GraduationCap,
      accent: "bg-amber-50 text-amber-600",
      items: missionItems,
      emptyText: "Belum ada data misi sekolah.",
    },
  ];

  return (
    <Section className="bg-gradient-to-b from-background via-white to-background">
      <SectionHeader badge="Visi & Misi" title="Visi dan Misi Sekolah" subtitle="Arah dan komitmen sekolah dalam satu panduan yang mudah dibaca" />
      <div className="grid gap-5 lg:grid-cols-2">
        {cards.map(({ title, subtitle, icon: Icon, accent, body, items, emptyText, highlight }) => (
          <div key={title} className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg" style={{ fontFamily: font }}>{title}</h3>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              </div>
            </div>

            {body ? (
              <div className={`mt-5 rounded-2xl p-5 ${highlight ? "bg-primary/5" : "bg-muted/40"}`}>
                <p className="text-sm leading-relaxed text-foreground/80" style={{ fontFamily: font }}>{body}</p>
              </div>
            ) : null}

            {items ? (
              items.length > 0 ? (
                <ul className="mt-5 space-y-2">
                  {items.map((item, index) => (
                    <li key={`${title}-${index}`} className="flex gap-2 rounded-xl bg-muted/40 px-3 py-2 text-sm text-foreground/80">
                      <span className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${highlight ? "bg-primary" : "bg-accent"}`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 text-sm text-muted-foreground">{emptyText}</p>
              )
            ) : null}
          </div>
        ))}
      </div>
    </Section>
  );
}

function GoalsSection({ school }: { school: SchoolFull }) {
  const goalItems = (school.goals || []).filter((item) => item && item.trim().length > 0);

  return (
    <Section className="bg-gradient-to-b from-slate-50 to-white">
      <SectionHeader badge="Tujuan" title="Tujuan Sekolah" subtitle="Target dan arah pencapaian sekolah yang ditampilkan lengkap tanpa pembatasan" />
      {goalItems.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {goalItems.map((item, index) => (
            <div key={`${item}-${index}`} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Tujuan {index + 1}</p>
                  <h3 className="font-semibold text-foreground" style={{ fontFamily: font }}>{school.name || "Sekolah"}</h3>
                </div>
              </div>
              <p className="text-sm leading-7 text-foreground/80" style={{ fontFamily: font }}>{item}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-sm text-muted-foreground">
          Belum ada data tujuan sekolah.
        </div>
      )}
    </Section>
  );
}

function SchoolInfo({ school }: { school: SchoolFull }) {
  const infoItems = [
    { icon: Award, label: "Akreditasi", value: textOrDash(school.accreditation), color: "bg-yellow-50 text-yellow-600" },
    { icon: Building2, label: "Status", value: textOrDash(school.status), color: "bg-green-50 text-green-600" },
    { icon: Users, label: "Jumlah Siswa", value: school.totalStudents.toLocaleString("id"), color: "bg-purple-50 text-purple-600" },
    { icon: GraduationCap, label: "Jumlah Guru", value: school.totalTeachers.toString(), color: "bg-orange-50 text-orange-600" },
    { icon: School, label: "Ruang Kelas", value: classroomCount(school).toString(), color: "bg-teal-50 text-teal-600" },
    { icon: BookOpen, label: "Rombel", value: school.totalStudyGroups.toString(), color: "bg-rose-50 text-rose-600" },
    { icon: Clock, label: "Tahun Berdiri", value: textOrDash(school.yearEstablished), color: "bg-indigo-50 text-indigo-600" },
    { icon: Globe, label: "Kode Pos", value: textOrDash(school.kodePos), color: "bg-sky-50 text-sky-600" },
  ];

  return (
    <Section className="bg-primary">
      <SectionHeader badge="Data Sekolah" title="Informasi Sekolah" subtitle="Ringkasan data utama sekolah yang ditampilkan pada bagian ini" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {infoItems.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" strokeWidth={2} />
            </div>
            <span className="text-2xl font-extrabold text-foreground" style={{ fontFamily: font }}>{value}</span>
            <span className="text-muted-foreground text-xs font-medium mt-1 uppercase tracking-wide" style={{ fontFamily: font }}>{label}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function OrgStructure({ school }: { school: SchoolFull }) {
  const vp = school.staff.filter((staff) => staff.isVicePrincipal);
  const admin = school.staff.filter((staff) => staff.isAdmin);
  const sortedTeachers = [...school.teachers].sort((left, right) => {
    const leftName = (left.name || "").trim().toLowerCase();
    const rightName = (right.name || "").trim().toLowerCase();
    return leftName.localeCompare(rightName);
  });
  const featuredTeacher = sortedTeachers[0];
  const remainingTeachers = Math.max(sortedTeachers.length - 1, 0);

  function Card({ name, role, photo, highlight = false }: { name: string; role: string; photo?: string; highlight?: boolean }) {
    return (
      <div className={`flex flex-col items-center gap-2 p-3 rounded-2xl ${highlight ? "bg-primary text-white shadow-lg scale-105" : "bg-card border border-border shadow-sm"} transition-all`}>
        {photo ? (
          <img src={photo} alt={name || role} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-muted text-xs font-bold text-foreground/60 shadow">
            {initials(name) || "?"}
          </div>
        )}
        <div className="text-center">
          <p className={`text-xs font-bold leading-tight ${highlight ? "text-white" : "text-foreground"}`} style={{ fontFamily: font }}>
            {name || "-"}
          </p>
          <p className={`text-xs mt-0.5 ${highlight ? "text-accent" : "text-muted-foreground"}`} style={{ fontFamily: font }}>
            {role || "-"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Section className="bg-background">
      <SectionHeader badge="Struktur" title="Struktur Organisasi" subtitle="Susunan pimpinan, staf, dan guru yang membentuk struktur sekolah" />

      <div className="flex justify-center">
        <div className="w-44">
          <Card name={school.principal.name} role={school.principal.position || "Kepala Sekolah"} photo={school.principal.photo} highlight />
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <div className="w-px h-6 bg-border" />
      </div>

      {vp.length > 0 || admin.length > 0 ? (
        <>
          <div className="relative flex justify-center gap-4 flex-wrap">
            {[...vp, ...admin].map((person) => (
              <div key={`${person.name}-${person.position}`} className="w-40 mt-0">
                <Card name={person.name} role={person.position} photo={person.photo} />
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <div className="w-px h-6 bg-border" />
          </div>
        </>
      ) : null}

      {sortedTeachers.length > 0 ? (
        <div className="mt-6 rounded-[28px] border border-border bg-gradient-to-b from-muted/20 to-background p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Guru</p>
              <p className="text-sm font-semibold text-foreground">Semua guru tampil dalam struktur cabang sekolah</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              {sortedTeachers.length} Guru
            </span>
          </div>

          <div className="relative mt-6 flex justify-center">
            <div className="absolute left-1/2 top-0 hidden h-8 w-px -translate-x-1/2 bg-border md:block" />
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {sortedTeachers.map((teacher) => (
                <div key={`${teacher.name}-${teacher.position}`} className="relative flex flex-col items-center">
                  <div className="mb-2 h-6 w-px bg-border" />
                  <Card name={teacher.name} role={teacher.position} photo={teacher.photo} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
          Belum ada data guru yang ditampilkan.
        </div>
      )}
    </Section>
  );
}

function Facilities({ school }: { school: SchoolFull }) {
  return (
    <Section className="bg-muted/50">
      <SectionHeader badge="Sarana & Prasarana" title="Fasilitas Sekolah" subtitle="Daftar sarana dan prasarana yang tersedia di sekolah" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {school.facilities.length > 0 ? school.facilities.map((facility) => (
          <div key={facility.name} className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group">
            <div className="relative h-40 overflow-hidden bg-muted">
              {facility.photo ? (
                <img src={facility.photo} alt={facility.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                  Belum ada foto
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              {facility.icon ? <span className="absolute bottom-3 left-3 text-2xl">{facility.icon}</span> : null}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h4 className="font-bold text-foreground text-sm" style={{ fontFamily: font }}>{facility.name || "-"}</h4>
                <span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-semibold px-2.5 py-1.5">
                  {facility.count} fasilitas
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed" style={{ fontFamily: font }}>
                {facility.description || "Belum ada deskripsi fasilitas."}
              </p>
            </div>
          </div>
        )) : (
          <div className="col-span-full rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
            Belum ada data fasilitas yang ditampilkan.
          </div>
        )}
      </div>
    </Section>
  );
}

function RoleStatsSection({ school }: { school: SchoolFull }) {
  const roleData = school.roleStats.map((item) => ({
    label: item.role === "guru" ? "Guru" : item.role === "tenaga_didik" ? "Tendik" : "Peserta Didik",
    male: item.male,
    female: item.female,
    total: item.total,
  }));

  const pieData = [
    { name: "Laki-laki", value: school.maleStudents },
    { name: "Perempuan", value: school.femaleStudents },
  ];

  return (
    <Section className="bg-background">
      <SectionHeader badge="Kesiswaan" title="Statistik Pendidikan" subtitle="Ringkasan data kesiswaan dan komposisi warga sekolah" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Siswa", value: school.totalStudents, icon: Users, color: "text-green-600" },
          { label: "Total Guru", value: school.totalTeachers, icon: GraduationCap, color: "text-purple-600" },
          { label: "Total Rombel", value: school.totalStudyGroups, icon: School, color: "text-teal-600" },
          { label: "Ruang Kelas", value: classroomCount(school), icon: Building2, color: "text-orange-600" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className={`mb-4 inline-flex rounded-2xl bg-amber-50 p-3 ${card.color}`}>
              <card.icon className="h-6 w-6" />
            </div>
            <p className="text-3xl font-extrabold text-foreground">{card.value.toLocaleString("id")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="mb-5">
            <h4 className="font-bold text-foreground" style={{ fontFamily: font }}>Komposisi Peran Warga Sekolah</h4>
            <p className="text-xs text-muted-foreground mt-1">Grafik komposisi peran warga sekolah</p>
          </div>
          {roleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={roleData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: font }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fontFamily: font }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", fontFamily: font, fontSize: "12px", border: "1px solid rgba(0,0,0,0.1)" }}
                  formatter={(value: number, name: string) => [value, name === "male" ? "Laki-laki" : "Perempuan"]}
                />
                <Bar dataKey="male" name="male" stackId="a" fill="#1e6b3a" />
                <Bar dataKey="female" name="female" stackId="a" fill="#e8b800" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[240px] items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
              Belum ada data role untuk divisualisasikan.
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <h4 className="font-bold text-foreground mb-5" style={{ fontFamily: font }}>Distribusi Gender Siswa</h4>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {pieData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "12px", fontFamily: font, fontSize: "12px" }} formatter={(value: number) => [`${value} siswa`, ""]} />
              <Legend iconType="circle" wrapperStyle={{ fontFamily: font, fontSize: "13px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-8 mt-2">
            {pieData.map((item, index) => (
              <div key={item.name} className="text-center">
                <p className="text-2xl font-extrabold" style={{ color: PIE_COLORS[index], fontFamily: font }}>
                  {school.totalStudents > 0 ? Math.round((item.value / school.totalStudents) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: font }}>{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function EmptyFeedSection({ badge, title, subtitle, icon: Icon, emptyText }: { badge: string; title: string; subtitle: string; icon: ComponentType<{ className?: string }>; emptyText: string }) {
  return (
    <Section className="bg-white">
      <SectionHeader badge={badge} title={title} subtitle={subtitle} />
      <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        {emptyText}
      </div>
    </Section>
  );
}

function ContactLocation({ school }: { school: SchoolFull }) {
  const contactItems = [
    { icon: MapPin, label: "Alamat", value: `${school.address || "-"}, Desa ${school.desa || "-"}, Kec. ${school.kecamatan || "-"}, ${school.kodePos || "-"}` },
    { icon: Phone, label: "Telepon", value: textOrDash(school.contact) },
    { icon: Mail, label: "Email", value: textOrDash(school.email) },
    { icon: Eye, label: "Kepala Sekolah", value: textOrDash(school.principal.name) },
    { icon: Clock, label: "Jam Operasional", value: "Senin-Jumat, 07.00-13.00 WIB" },
    { icon: Globe, label: "Status Sekolah", value: `${textOrDash(school.status)} - Akreditasi ${textOrDash(school.accreditation)}` },
  ];

  return (
    <Section className="bg-muted/40">
      <SectionHeader badge="Kontak" title="Kontak & Lokasi" subtitle="Informasi komunikasi dan alamat sekolah" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-0 bg-card rounded-2xl shadow-sm border border-border overflow-hidden divide-y divide-border">
          {contactItems.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-primary" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider" style={{ fontFamily: font }}>{label}</p>
                <p className="text-sm text-foreground font-semibold mt-0.5" style={{ fontFamily: font }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl overflow-hidden shadow-sm border border-border bg-muted min-h-[300px]">
          {school.mapsEmbed ? (
            <iframe
              src={school.mapsEmbed}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "300px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Lokasi ${school.name}`}
              className="w-full h-full min-h-[300px]"
            />
          ) : (
            <div className="flex min-h-[300px] items-center justify-center p-6 text-center text-sm text-muted-foreground">
              Koordinat peta sekolah belum tersedia.
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

function GallerySection({ school }: { school: SchoolFull }) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (school.gallery.length === 0) {
    return <EmptyFeedSection badge="Galeri" title="Galeri Foto" subtitle="Dokumentasi kegiatan sekolah" icon={Image} emptyText="Belum ada data galeri yang ditampilkan." />;
  }

  return (
    <Section className="bg-background">
      <SectionHeader badge="Galeri" title="Galeri Foto" subtitle="Dokumentasi kegiatan sekolah" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {school.gallery.map((item) => (
          <button
            key={`${item.photo}-${item.caption}`}
            onClick={() => setLightbox(item.photo)}
            className="relative group overflow-hidden rounded-xl aspect-square bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {item.photo ? (
              <img src={item.photo} alt={item.caption} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">Belum ada foto</div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
              <p className="text-white text-xs font-medium truncate" style={{ fontFamily: font }}>{item.caption}</p>
            </div>
          </button>
        ))}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
            onClick={() => setLightbox(null)}
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-3xl w-full" onClick={(event) => event.stopPropagation()}>
            <img src={lightbox} alt="Galeri sekolah" className="w-full max-h-[75vh] object-contain rounded-xl shadow-2xl" />
          </div>
        </div>
      )}
    </Section>
  );
}

function NewsSection({ school }: { school: SchoolFull }) {
  if (school.news.length === 0) {
    return <EmptyFeedSection badge="Berita" title="Berita Terkini" subtitle="Informasi dan kegiatan sekolah" icon={Newspaper} emptyText="Belum ada data berita yang ditampilkan." />;
  }

  const categoryColors: Record<string, string> = {
    Kegiatan: "bg-blue-100 text-blue-700",
    Program: "bg-green-100 text-green-700",
    Informasi: "bg-orange-100 text-orange-700",
  };

  return (
    <Section className="bg-white">
      <SectionHeader badge="Berita" title="Berita Terkini" subtitle="Informasi dan kegiatan sekolah" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {school.news.map((item) => (
          <article key={item.id} className="bg-background rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group flex flex-col">
            <div className="relative h-44 overflow-hidden bg-muted">
              {item.thumbnail ? (
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">Belum ada thumbnail</div>
              )}
              <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[item.category] ?? "bg-white/80 text-foreground"}`} style={{ fontFamily: font }}>
                {item.category || "Informasi"}
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <p className="text-muted-foreground text-xs mb-2 flex items-center gap-1.5" style={{ fontFamily: font }}>
                <Clock className="w-3 h-3" /> {item.date || "-"}
              </p>
              <h4 className="font-bold text-foreground text-sm leading-snug mb-2 flex-1" style={{ fontFamily: font }}>{item.title || "-"}</h4>
              <p className="text-muted-foreground text-xs leading-relaxed mb-4 line-clamp-3" style={{ fontFamily: font }}>{item.excerpt || "-"}</p>
              <button className="text-primary text-xs font-semibold flex items-center gap-1 hover:text-primary/80 transition-colors" style={{ fontFamily: font }}>
                Baca Selengkapnya <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

function AchievementsSection({ school }: { school: SchoolFull }) {
  if (school.achievements.length === 0) {
    return <EmptyFeedSection badge="Prestasi" title="Prestasi Sekolah" subtitle="Capaian dan penghargaan" icon={Trophy} emptyText="Belum ada data prestasi yang ditampilkan." />;
  }

  return (
    <Section className="bg-primary">
      <SectionHeader badge="Prestasi" title="Prestasi Sekolah" subtitle="Capaian dan penghargaan" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {school.achievements.map((achievement) => (
          <div key={achievement.title} className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex gap-0">
            {achievement.photo ? (
              <div className="w-24 shrink-0 relative overflow-hidden">
                <img src={achievement.photo} alt={achievement.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-primary/30" />
              </div>
            ) : null}
            <div className="p-5 flex-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="inline-block bg-accent text-foreground text-xs font-bold px-2 py-0.5 rounded-full mb-2" style={{ fontFamily: font }}>
                    {achievement.year || "-"}
                  </span>
                  <span className="ml-2 inline-block bg-secondary text-primary text-xs font-semibold px-2 py-0.5 rounded-full" style={{ fontFamily: font }}>
                    {achievement.level || "-"}
                  </span>
                </div>
                <Trophy className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              </div>
              <h4 className="font-bold text-foreground text-sm leading-tight mb-1.5" style={{ fontFamily: font }}>{achievement.title || "-"}</h4>
              <p className="text-muted-foreground text-xs leading-relaxed" style={{ fontFamily: font }}>{achievement.description || "-"}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function SchoolDetailFallback({ school }: { school: SchoolFull }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroBanner school={school} />
      <ProfileSummary school={school} />
      <PrincipalGreetingSection school={school} />
      <VisionMissionGoalsSection school={school} />
      <GoalsSection school={school} />
      <Footer />
    </div>
  );
}

const NAV_ITEMS = [
  { id: "profile", label: "Sejarah", icon: BookOpen },
  { id: "welcome", label: "Sambutan", icon: Eye },
  { id: "vision", label: "Visi", icon: GraduationCap },
  { id: "goals", label: "Tujuan", icon: Trophy },
  { id: "info", label: "Info", icon: School },
  { id: "org", label: "Struktur", icon: Users },
  { id: "facilities", label: "Fasilitas", icon: Building2 },
  { id: "stats", label: "Statistik", icon: Award },
  { id: "achievements", label: "Prestasi", icon: Trophy },
  { id: "news", label: "Berita", icon: Newspaper },
  { id: "gallery", label: "Galeri", icon: Image },
  { id: "contact", label: "Kontak", icon: PhoneCall },
];

function QuickNav() {
  return (
    <div className="hidden xl:flex fixed left-4 top-1/2 -translate-y-1/2 z-40 flex-col gap-1">
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
        <a
          key={id}
          href={`#${id}`}
          title={label}
          className="group flex items-center gap-2 text-white/0 hover:text-foreground bg-white/10 hover:bg-white rounded-xl p-2 shadow-sm hover:shadow-md transition-all duration-150 border border-white/10 hover:border-border"
        >
          <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" strokeWidth={2} />
          <span className="text-xs font-medium opacity-0 group-hover:opacity-100 w-0 group-hover:w-14 overflow-hidden whitespace-nowrap transition-all duration-200" style={{ fontFamily: font }}>
            {label}
          </span>
        </a>
      ))}
    </div>
  );
}

export default function SchoolDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { getSchoolBySlug, isLoading } = useSchoolCms();
  const school = getSchoolBySlug(slug ?? "");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-foreground font-semibold" style={{ fontFamily: font }}>Memuat data sekolah dari Supabase...</p>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-2xl font-bold text-foreground" style={{ fontFamily: font }}>Sekolah tidak ditemukan.</p>
        <button onClick={() => navigate("/sekolah")} className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors" style={{ fontFamily: font }}>
          Kembali ke Daftar Sekolah
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: font }}>
      <Navbar />
      <HeroBanner school={school} />
      <QuickNav />

      <div id="welcome"><PrincipalGreetingSection school={school} /></div>
      <div id="profile"><ProfileSummary school={school} /></div>
      <div id="vision"><VisionMissionGoalsSection school={school} /></div>
      <div id="goals"><GoalsSection school={school} /></div>
      <div id="info"><SchoolInfo school={school} /></div>
      <div id="org"><OrgStructure school={school} /></div>
      <div id="facilities"><Facilities school={school} /></div>
      <div id="stats"><RoleStatsSection school={school} /></div>
      <div id="achievements"><AchievementsSection school={school} /></div>
      <div id="news"><NewsSection school={school} /></div>
      <div id="gallery"><GallerySection school={school} /></div>
      <div id="contact"><ContactLocation school={school} /></div>

      <Footer />
    </div>
  );
}
