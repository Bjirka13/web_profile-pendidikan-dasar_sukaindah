import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  MapPin, Phone, Mail, User, ChevronRight, ChevronDown, ChevronUp,
  Hash, Award, BookOpen, Users, GraduationCap, School, Building2,
  Clock, Globe, Facebook, Instagram, X, ZoomIn, ExternalLink,
  Trophy, Newspaper, Image, PhoneCall, Home,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { getSchoolBySlug, type SchoolFull, type TeacherStaff, type GalleryItem } from "../data/schools";
import { Footer, Navbar } from "./Home";

const font = "'Plus Jakarta Sans', sans-serif";
const PIE_COLORS = ["#1e6b3a", "#e8b800"];

/* ─── Section wrapper ────────────────────────────────────────────── */
function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
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
      <h2 className="text-foreground font-extrabold text-2xl md:text-3xl" style={{ fontFamily: font }}>{title}</h2>
      {subtitle && <p className="text-muted-foreground mt-2 text-sm" style={{ fontFamily: font }}>{subtitle}</p>}
      <div className="mt-3 h-1 w-14 rounded-full bg-accent" />
    </div>
  );
}

/* ═══ SECTION 1: Hero Banner ═══════════════════════════════════════ */
function HeroBanner({ school }: { school: SchoolFull }) {
  const navigate = useNavigate();
  return (
    <div className="relative h-80 md:h-[440px] overflow-hidden">
      {/* Background */}
      <img src={school.heroImage} alt={`Gedung ${school.name}`} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end pb-8 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-white/60 text-xs mb-4" style={{ fontFamily: font }}>
            <button onClick={() => navigate("/")} className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="w-3 h-3" /> Beranda
            </button>
            <ChevronRight className="w-3 h-3 text-white/40" />
            <button onClick={() => navigate("/")} className="hover:text-white transition-colors">Sekolah</button>
            <ChevronRight className="w-3 h-3 text-white/40" />
            <span className="text-white/80">{school.name}</span>
          </nav>

          <div className="flex items-end gap-5">
            {/* School Logo */}
            <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
                <rect width="80" height="80" fill="#1e6b3a"/>
                <path d="M40 10 L10 26 L10 54 L40 70 L70 54 L70 26 Z" fill="#e8b800" opacity="0.85"/>
                <path d="M40 18 L16 32 L16 48 L40 62 L64 48 L64 32 Z" fill="#1e6b3a"/>
                <text x="40" y="45" textAnchor="middle" fontSize="16" fontWeight="900" fill="white" fontFamily="sans-serif">SD</text>
                <text x="40" y="57" textAnchor="middle" fontSize="6" fill="#e8b800" fontFamily="sans-serif">{school.id.toString().padStart(2, "0")}</text>
              </svg>
            </div>

            {/* Name + tagline */}
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="bg-accent text-foreground text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ fontFamily: font }}>
                  NPSN {school.npsn}
                </span>
                <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm" style={{ fontFamily: font }}>
                  {school.status}
                </span>
                <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm" style={{ fontFamily: font }}>
                  Akreditasi {school.accreditation}
                </span>
              </div>
              <h1 className="text-white font-extrabold text-2xl md:text-4xl leading-tight" style={{ fontFamily: font }}>
                {school.name}
              </h1>
              <p className="text-accent font-medium text-sm md:text-base mt-1 italic" style={{ fontFamily: font }}>
                "{school.tagline}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ SECTION 2: Principal's Welcome ════════════════════════════════ */
function PrincipalWelcome({ school }: { school: SchoolFull }) {
  const [expanded, setExpanded] = useState(false);
  const paragraphs = school.principal.welcome.split("\n\n").filter(Boolean);
  const preview = paragraphs.slice(0, 2);
  const rest = paragraphs.slice(2);

  return (
    <Section className="bg-white">
      <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-start">
        {/* Photo */}
        <div className="shrink-0 mx-auto md:mx-0">
          <div className="relative">
            <div className="w-48 h-60 md:w-56 md:h-72 rounded-2xl overflow-hidden shadow-xl border-4 border-secondary">
              <img src={school.principal.photo} alt={school.principal.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap text-center" style={{ fontFamily: font }}>
              {school.principal.position}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 mt-8 md:mt-0">
          <SectionHeader badge="Sambutan" title="Sambutan Kepala Sekolah" />
          <h3 className="text-primary font-bold text-xl mb-5" style={{ fontFamily: font }}>{school.principal.name}</h3>
          {school.principal.nip && (
            <p className="text-muted-foreground text-xs mb-4" style={{ fontFamily: font }}>NIP: {school.principal.nip}</p>
          )}

          <div className="space-y-3 text-foreground/80 leading-relaxed" style={{ fontFamily: font }}>
            {preview.map((p, i) => <p key={i} className="text-sm md:text-base">{p}</p>)}
            {expanded && rest.map((p, i) => <p key={i} className="text-sm md:text-base">{p}</p>)}
          </div>

          {rest.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-5 flex items-center gap-2 text-primary font-semibold text-sm hover:text-primary/80 transition-colors"
              style={{ fontFamily: font }}
            >
              {expanded ? <><ChevronUp className="w-4 h-4" /> Sembunyikan</> : <><ChevronDown className="w-4 h-4" /> Baca Selengkapnya</>}
            </button>
          )}
        </div>
      </div>
    </Section>
  );
}

/* ═══ SECTION 3: School Profile ══════════════════════════════════════ */
function SchoolProfile({ school }: { school: SchoolFull }) {
  return (
    <Section className="bg-background">
      <SectionHeader badge="Profil" title="Profil Sekolah" subtitle="Sejarah, Visi, Misi, dan Tujuan Sekolah" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* History */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-foreground text-lg" style={{ fontFamily: font }}>Sejarah Singkat</h3>
          </div>
          <p className="text-foreground/75 text-sm leading-relaxed" style={{ fontFamily: font }}>{school.history}</p>
        </div>

        {/* Vision */}
        <div className="bg-primary rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <span className="text-xl">🎯</span>
            </div>
            <h3 className="font-bold text-white text-lg" style={{ fontFamily: font }}>Visi</h3>
          </div>
          <p className="text-white/85 text-sm leading-relaxed italic" style={{ fontFamily: font }}>{school.vision}</p>
        </div>

        {/* Mission */}
        <div className="bg-accent rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center shrink-0">
              <span className="text-xl">🚀</span>
            </div>
            <h3 className="font-bold text-foreground text-lg" style={{ fontFamily: font }}>Misi</h3>
          </div>
          <ol className="space-y-2" style={{ fontFamily: font }}>
            {school.mission.map((m, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                <span>{m}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Goals */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/30 flex items-center justify-center shrink-0">
              <span className="text-xl">🏆</span>
            </div>
            <h3 className="font-bold text-foreground text-lg" style={{ fontFamily: font }}>Tujuan Sekolah</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {school.goals.map((g, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-sm text-foreground/80" style={{ fontFamily: font }}>{g}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ═══ SECTION 4: School Information ═════════════════════════════════ */
function SchoolInfo({ school }: { school: SchoolFull }) {
  const infoItems = [
    { icon: Hash, label: "NPSN", value: school.npsn, color: "bg-blue-50 text-blue-600" },
    { icon: Award, label: "Akreditasi", value: school.accreditation, color: "bg-yellow-50 text-yellow-600" },
    { icon: Building2, label: "Status", value: school.status, color: "bg-green-50 text-green-600" },
    { icon: Users, label: "Jumlah Siswa", value: school.totalStudents.toLocaleString("id"), color: "bg-purple-50 text-purple-600" },
    { icon: GraduationCap, label: "Jumlah Guru", value: school.totalTeachers.toString(), color: "bg-orange-50 text-orange-600" },
    { icon: School, label: "Ruang Kelas", value: school.totalClassrooms.toString(), color: "bg-teal-50 text-teal-600" },
    { icon: BookOpen, label: "Rombel", value: school.totalStudyGroups.toString(), color: "bg-rose-50 text-rose-600" },
    { icon: Clock, label: "Tahun Berdiri", value: school.yearEstablished, color: "bg-indigo-50 text-indigo-600" },
  ];

  return (
    <Section className="bg-primary">
      <SectionHeader badge="Data Sekolah" title="Informasi Sekolah" subtitle="Data dan statistik utama sekolah" />
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

/* ═══ SECTION 5: Org Structure ═══════════════════════════════════════ */
function OrgStructure({ school }: { school: SchoolFull }) {
  const vp = school.staff.filter((s) => s.isVicePrincipal);
  const admin = school.staff.filter((s) => s.isAdmin);
  const firstFourTeachers = school.teachers.slice(0, 4);

  function OrgCard({ person, highlight = false }: { person: TeacherStaff; highlight?: boolean }) {
    return (
      <div className={`flex flex-col items-center gap-2 p-3 rounded-2xl ${highlight ? "bg-primary text-white shadow-lg scale-105" : "bg-card border border-border shadow-sm"} transition-all`}>
        <img src={person.photo} alt={person.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" />
        <div className="text-center">
          <p className={`text-xs font-bold leading-tight ${highlight ? "text-white" : "text-foreground"}`} style={{ fontFamily: font }}>{person.name}</p>
          <p className={`text-xs mt-0.5 ${highlight ? "text-accent" : "text-muted-foreground"}`} style={{ fontFamily: font }}>{person.position}</p>
        </div>
      </div>
    );
  }

  function Connector() {
    return <div className="flex justify-center"><div className="w-px h-6 bg-border" /></div>;
  }

  return (
    <Section className="bg-background">
      <SectionHeader badge="Struktur" title="Struktur Organisasi" subtitle="Susunan kepemimpinan dan tenaga kependidikan" />

      {/* Principal */}
      <div className="flex justify-center">
        <div className="w-44">
          <OrgCard person={{ name: school.principal.name, position: school.principal.position, photo: school.principal.photo }} highlight />
        </div>
      </div>

      <Connector />

      {/* Vice + Admin */}
      {(vp.length > 0 || admin.length > 0) && (
        <>
          <div className="relative flex justify-center gap-4 flex-wrap">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-border" style={{ width: `${Math.min((vp.length + admin.length) * 20, 80)}%` }} />
            {[...vp, ...admin].map((p) => (
              <div key={p.name} className="w-40 mt-0">
                <OrgCard person={p} />
              </div>
            ))}
          </div>
          <Connector />
        </>
      )}

      {/* Teachers row */}
      <div className="relative">
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-border" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-0">
          {firstFourTeachers.map((t) => (
            <OrgCard key={t.name} person={t} />
          ))}
        </div>
        {school.teachers.length > 4 && (
          <div className="mt-3 text-center">
            <span className="text-muted-foreground text-sm" style={{ fontFamily: font }}>
              + {school.teachers.length - 4} guru lainnya
            </span>
          </div>
        )}
      </div>
    </Section>
  );
}

/* ═══ SECTION 6: Facilities ══════════════════════════════════════════ */
function Facilities({ school }: { school: SchoolFull }) {
  return (
    <Section className="bg-muted/50">
      <SectionHeader badge="Sarana & Prasarana" title="Fasilitas Sekolah" subtitle="Penunjang kegiatan belajar mengajar" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {school.facilities.map((facility) => (
          <div key={facility.name} className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group">
            <div className="relative h-40 overflow-hidden bg-muted">
              <img src={facility.photo} alt={facility.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span className="absolute bottom-3 left-3 text-2xl">{facility.icon}</span>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h4 className="font-bold text-foreground text-sm" style={{ fontFamily: font }}>{facility.name}</h4>
                <span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[11px] font-semibold px-2.5 py-1.5">
                  {facility.count} fasilitas
                </span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed" style={{ fontFamily: font }}>{facility.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ═══ SECTION 7: Teachers & Staff ════════════════════════════════════ */
function TeachersStaff({ school }: { school: SchoolFull }) {
  const [showAll, setShowAll] = useState(false);
  const PREVIEW = 6;
  const visible = showAll ? school.teachers : school.teachers.slice(0, PREVIEW);

  return (
    <Section className="bg-white">
      <SectionHeader badge="Tenaga Pendidik" title="Guru & Staf" subtitle={`${school.totalTeachers} tenaga pendidik dan kependidikan`} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {visible.map((teacher) => (
          <div key={teacher.name} className="flex flex-col items-center text-center p-4 rounded-2xl bg-background border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 group">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-secondary shadow-sm group-hover:border-primary transition-colors mb-3">
              <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover" />
            </div>
            <p className="text-xs font-bold text-foreground leading-tight" style={{ fontFamily: font }}>{teacher.name}</p>
            <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: font }}>{teacher.position}</p>
            {teacher.nip && <p className="text-xs text-muted-foreground/70 mt-0.5 font-mono text-[10px]">{teacher.nip.slice(0, 8)}...</p>}
          </div>
        ))}
      </div>
      {school.teachers.length > PREVIEW && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
            style={{ fontFamily: font }}
          >
            {showAll ? <><ChevronUp className="w-4 h-4" /> Sembunyikan</> : <><Users className="w-4 h-4" /> Lihat Semua Guru ({school.teachers.length})</>}
          </button>
        </div>
      )}
    </Section>
  );
}

/* ═══ SECTION 8: Student Statistics ═════════════════════════════════ */
function StudentStats({ school }: { school: SchoolFull }) {
  const pieData = [
    { name: "Laki-laki", value: school.maleStudents },
    { name: "Perempuan", value: school.femaleStudents },
  ];

  return (
    <Section className="bg-background">
      <SectionHeader badge="Kesiswaan" title="Statistik Siswa" subtitle="Data agregat peserta didik — tidak memuat informasi pribadi" />

      {/* Top summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { label: "Total Siswa", value: school.totalStudents, icon: "👥", color: "bg-primary text-white" },
          { label: "Siswa Laki-laki", value: school.maleStudents, icon: "👦", color: "bg-accent text-foreground" },
          { label: "Siswa Perempuan", value: school.femaleStudents, icon: "👧", color: "bg-secondary text-primary" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`${color} rounded-2xl p-6 flex items-center gap-4 shadow-sm`}>
            <span className="text-3xl">{icon}</span>
            <div>
              <p className="text-3xl font-extrabold leading-none" style={{ fontFamily: font }}>{value}</p>
              <p className="text-sm font-medium mt-1 opacity-80" style={{ fontFamily: font }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart by grade */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <h4 className="font-bold text-foreground mb-5" style={{ fontFamily: font }}>Jumlah Siswa per Kelas</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={school.gradeStats} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: font }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: font }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", fontFamily: font, fontSize: "12px", border: "1px solid rgba(0,0,0,0.1)" }}
                formatter={(value: number, name: string) => [value, name === "male" ? "Laki-laki" : name === "female" ? "Perempuan" : "Total"]}
              />
              <Bar dataKey="male" name="male" stackId="a" fill="#1e6b3a" radius={[0,0,0,0]} />
              <Bar dataKey="female" name="female" stackId="a" fill="#e8b800" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{ fontFamily: font }}>
              <div className="w-3 h-3 rounded-sm bg-primary" /> Laki-laki
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{ fontFamily: font }}>
              <div className="w-3 h-3 rounded-sm bg-accent" /> Perempuan
            </div>
          </div>
        </div>

        {/* Pie chart gender */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <h4 className="font-bold text-foreground mb-5" style={{ fontFamily: font }}>Distribusi Gender Siswa</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "12px", fontFamily: font, fontSize: "12px" }} formatter={(v: number) => [`${v} siswa`]} />
              <Legend iconType="circle" wrapperStyle={{ fontFamily: font, fontSize: "13px" }} />
            </PieChart>
          </ResponsiveContainer>
          {/* Percentage labels */}
          <div className="flex justify-center gap-8 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="text-center">
                <p className="text-2xl font-extrabold" style={{ color: PIE_COLORS[i], fontFamily: font }}>
                  {Math.round((d.value / school.totalStudents) * 100)}%
                </p>
                <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: font }}>{d.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ═══ SECTION 9: Achievements ════════════════════════════════════════ */
function Achievements({ school }: { school: SchoolFull }) {
  return (
    <Section className="bg-primary">
      <SectionHeader badge="Prestasi" title="Prestasi Sekolah" subtitle="Capaian dan penghargaan yang telah diraih" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {school.achievements.map((ach, i) => (
          <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex gap-0">
            {ach.photo && (
              <div className="w-24 shrink-0 relative overflow-hidden">
                <img src={ach.photo} alt={ach.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-primary/30" />
              </div>
            )}
            <div className="p-5 flex-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="inline-block bg-accent text-foreground text-xs font-bold px-2 py-0.5 rounded-full mb-2" style={{ fontFamily: font }}>
                    {ach.year}
                  </span>
                  <span className="ml-2 inline-block bg-secondary text-primary text-xs font-semibold px-2 py-0.5 rounded-full" style={{ fontFamily: font }}>
                    {ach.level}
                  </span>
                </div>
                <Trophy className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              </div>
              <h4 className="font-bold text-foreground text-sm leading-tight mb-1.5" style={{ fontFamily: font }}>{ach.title}</h4>
              <p className="text-muted-foreground text-xs leading-relaxed" style={{ fontFamily: font }}>{ach.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ═══ SECTION 10: Latest News ════════════════════════════════════════ */
function LatestNews({ school }: { school: SchoolFull }) {
  const categoryColors: Record<string, string> = {
    Kegiatan: "bg-blue-100 text-blue-700",
    Program: "bg-green-100 text-green-700",
    Informasi: "bg-orange-100 text-orange-700",
  };

  return (
    <Section className="bg-white">
      <div className="flex items-end justify-between mb-10">
        <SectionHeader badge="Berita" title="Berita Terkini" subtitle="Informasi dan kegiatan terbaru sekolah" />
        <button className="hidden sm:flex items-center gap-1.5 text-primary text-sm font-semibold hover:text-primary/80 transition-colors shrink-0 mb-3" style={{ fontFamily: font }}>
          Lihat Semua <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {school.news.map((item) => (
          <article key={item.id} className="bg-background rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group flex flex-col">
            <div className="relative h-44 overflow-hidden bg-muted">
              <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${categoryColors[item.category] ?? "bg-white/80 text-foreground"}`} style={{ fontFamily: font }}>
                {item.category}
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <p className="text-muted-foreground text-xs mb-2 flex items-center gap-1.5" style={{ fontFamily: font }}>
                <Clock className="w-3 h-3" /> {item.date}
              </p>
              <h4 className="font-bold text-foreground text-sm leading-snug mb-2 flex-1" style={{ fontFamily: font }}>{item.title}</h4>
              <p className="text-muted-foreground text-xs leading-relaxed mb-4 line-clamp-3" style={{ fontFamily: font }}>{item.excerpt}</p>
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

/* ═══ SECTION 11: Gallery ════════════════════════════════════════════ */
function GallerySection({ school }: { school: SchoolFull }) {
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  return (
    <Section className="bg-background">
      <SectionHeader badge="Galeri" title="Galeri Foto" subtitle="Dokumentasi kegiatan dan suasana sekolah" />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {school.gallery.map((item, i) => (
          <button
            key={i}
            onClick={() => setLightbox(item)}
            className="relative group overflow-hidden rounded-xl aspect-square bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <img src={item.photo} alt={item.caption} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
              <p className="text-white text-xs font-medium truncate" style={{ fontFamily: font }}>{item.caption}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
            onClick={() => setLightbox(null)}
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.photo} alt={lightbox.caption} className="w-full max-h-[75vh] object-contain rounded-xl shadow-2xl" />
            <p className="text-white/80 text-sm text-center mt-3" style={{ fontFamily: font }}>{lightbox.caption}</p>
          </div>
        </div>
      )}
    </Section>
  );
}

/* ═══ SECTION 12: Contact & Location ═════════════════════════════════ */
function ContactLocation({ school }: { school: SchoolFull }) {
  const contactItems = [
    { icon: MapPin, label: "Alamat", value: `${school.address}, Desa ${school.desa}, Kec. ${school.kecamatan}, ${school.kodePos}` },
    { icon: Phone, label: "Telepon", value: school.contact },
    { icon: Mail, label: "Email", value: school.email },
    { icon: User, label: "Kepala Sekolah", value: school.principal.name },
    { icon: Clock, label: "Jam Operasional", value: "Senin–Jumat, 07.00–13.00 WIB" },
    { icon: Globe, label: "Status Sekolah", value: `${school.status} — Akreditasi ${school.accreditation}` },
  ];

  return (
    <Section className="bg-muted/40">
      <SectionHeader badge="Kontak" title="Kontak & Lokasi" subtitle="Informasi komunikasi dan alamat sekolah" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact info */}
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

          {/* Social media row */}
          <div className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4 text-primary" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2" style={{ fontFamily: font }}>Media Sosial</p>
              <div className="flex gap-2">
                <button className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors">
                  <Facebook className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 hover:opacity-90 text-white rounded-lg flex items-center justify-center transition-opacity">
                  <Instagram className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-border bg-muted min-h-[300px]">
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
        </div>
      </div>
    </Section>
  );
}

/* ═══ Quick Nav (sticky sidebar tabs) ═══════════════════════════════ */
const NAV_ITEMS = [
  { id: "welcome", label: "Sambutan", icon: User },
  { id: "profile", label: "Profil", icon: BookOpen },
  { id: "info", label: "Info", icon: Hash },
  { id: "org", label: "Struktur", icon: Users },
  { id: "facilities", label: "Fasilitas", icon: Building2 },
  { id: "teachers", label: "Guru", icon: GraduationCap },
  { id: "students", label: "Siswa", icon: School },
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

/* ═══ Main SchoolDetail Component ════════════════════════════════════ */
export default function SchoolDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const school = getSchoolBySlug(slug ?? "");

  if (!school) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-2xl font-bold text-foreground" style={{ fontFamily: font }}>Sekolah tidak ditemukan.</p>
        <button onClick={() => navigate("/")} className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors" style={{ fontFamily: font }}>
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: font }}>
      <Navbar />
      <HeroBanner school={school} />
      <QuickNav />

      <div id="welcome"><PrincipalWelcome school={school} /></div>
      <div id="profile"><SchoolProfile school={school} /></div>
      <div id="info"><SchoolInfo school={school} /></div>
      <div id="org"><OrgStructure school={school} /></div>
      <div id="facilities"><Facilities school={school} /></div>
      <div id="teachers"><TeachersStaff school={school} /></div>
      <div id="students"><StudentStats school={school} /></div>
      <div id="achievements"><Achievements school={school} /></div>
      <div id="news"><LatestNews school={school} /></div>
      <div id="gallery"><GallerySection school={school} /></div>
      <div id="contact"><ContactLocation school={school} /></div>

      <Footer />
    </div>
  );
}
