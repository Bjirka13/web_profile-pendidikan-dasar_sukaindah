import { useNavigate } from "react-router";
import { MapPin, Phone, User, Info, GraduationCap, Users, School } from "lucide-react";
import { allSchools, type SchoolFull } from "../data/schools";
import { Navbar } from "../components/Layout";
import kadesImage from "../../image/Home/kades.png";
import logoImage from "../../image/Home/logo.png";
import kknImage from "../../image/Home/KKN_96.png";

const font = "'Plus Jakarta Sans', sans-serif";

/* ─── Hero ───────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative min-h-[540px] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1588423851962-29a61047cb11?w=1920&h=700&fit=crop&auto=format"
          alt="Pemandangan Desa Sukaindah"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/45 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 max-w-xl">
            <span className="inline-block bg-accent text-foreground text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-5 shadow" style={{ fontFamily: font }}>
              Selamat Datang
            </span>
            <h1 className="text-white font-extrabold leading-none mb-8" style={{ fontFamily: font, fontSize: "clamp(2rem, 5vw, 3.25rem)" }}>
              <span className="block">Portal Pendidikan</span>
              <span className="block text-accent">Sekolah Dasar</span>
              <span className="block">Desa Sukaindah</span>
            </h1>
            <p className="text-white/75 text-base leading-relaxed max-w-md" style={{ fontFamily: font }}>
              Menyajikan informasi lengkap mengenai sekolah dasar, tenaga pendidik,
              dan peserta didik di Desa Sukaindah, Kecamatan Sukakarya.
            </p>
          </div>
          <div className="shrink-0 flex items-center justify-center md:ml-auto md:justify-end md:-translate-x-6 lg:-translate-x-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-full border-4 border-accent/50 scale-110 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-2 border-white/20 scale-125" />
              <div className="w-52 h-52 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-accent shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1600792174569-59e1e0be0619?w=400&h=400&fit=crop&auto=format"
                  alt="Siswa-siswi SDN Desa Sukaindah"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Stats ──────────────────────────────────────────────────────── */
const totalTeachers = allSchools.reduce((acc, s) => acc + (s.totalTeachers || 0), 0);
const totalStudents = allSchools.reduce((acc, s) => acc + (s.totalStudents || 0), 0);
const totalSchools = allSchools.length;

const stats = [
  { label: "Total Guru", value: totalTeachers.toLocaleString("id"), icon: GraduationCap },
  { label: "Total Murid", value: totalStudents.toLocaleString("id"), icon: Users },
  { label: "Total SD", value: totalSchools.toString(), icon: School },
];

function StatsSection() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-foreground font-bold text-2xl md:text-3xl" style={{ fontFamily: font }}>Data Pendidikan Desa Sukaindah</h2>
          <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-accent" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-accent rounded-2xl p-8 flex flex-col items-center text-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
              <div className="bg-primary/10 rounded-full p-3 mb-4">
                <Icon className="w-7 h-7 text-primary" strokeWidth={2} />
              </div>
              <span className="text-4xl font-extrabold text-foreground block" style={{ fontFamily: font }}>{value}</span>
              <span className="text-foreground/70 font-semibold mt-1 text-sm tracking-wide uppercase" style={{ fontFamily: font }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Sambutan ───────────────────────────────────────────────────── */
function SambutanSection() {
  return (
    <section className="relative bg-primary overflow-hidden py-16 md:py-20">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-block bg-accent/20 text-accent text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full border border-accent/30" style={{ fontFamily: font }}>Sambutan</span>
        </div>
        <div className="flex flex-col md:flex-row items-start gap-10 md:gap-14">
          <div className="shrink-0 mx-auto md:mx-0">
            <div className="relative">
              <div className="w-44 h-52 md:w-52 md:h-64 rounded-2xl overflow-hidden border-4 border-accent shadow-2xl">
                <img src={kadesImage} alt="Kepala Desa Sukaindah" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-accent text-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow whitespace-nowrap">Kepala Desa</div>
            </div>
          </div>
          <div className="flex-1 mt-6 md:mt-0">
            <h2 className="text-accent font-extrabold text-2xl md:text-3xl mb-1" style={{ fontFamily: font }}>Sambutan Kepala Desa</h2>
            <h3 className="text-white font-semibold text-lg mb-5" style={{ fontFamily: font }}>Desa Sukaindah</h3>
            <div className="relative">
              <div className="absolute -left-2 top-0 text-accent text-5xl font-serif leading-none opacity-60">"</div>
              <blockquote className="pl-6 text-white/85 text-base leading-relaxed space-y-3" style={{ fontFamily: font }}>
                <p>Bismillahirrahmanirrahim. Assalamu'alaikum Warahmatullahi Wabarakatuh.</p>
                <p>Dengan penuh rasa syukur kepada Allah SWT, kami menyambut kehadiran Portal Pendidikan Dasar Desa Sukaindah. Portal ini hadir sebagai jembatan informasi antara masyarakat, orang tua, dan tenaga pendidik dalam mendukung kemajuan pendidikan di desa kita.</p>
                <p>Kami berharap portal ini dapat menjadi sarana yang bermanfaat bagi seluruh warga Desa Sukaindah dalam meningkatkan kualitas pendidikan generasi penerus bangsa.</p>
              </blockquote>
              <div className="absolute -right-2 bottom-0 text-accent text-5xl font-serif leading-none opacity-60 rotate-180">"</div>
            </div>
            <div className="mt-6 pt-5 border-t border-white/10">
              <p className="text-accent font-bold" style={{ fontFamily: font }}>Endang Syuhada, S.T</p>
              <p className="text-white/60 text-sm mt-0.5" style={{ fontFamily: font }}>Kepala Desa Sukaindah, Kecamatan Sukakarya</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── School Card ────────────────────────────────────────────────── */
function SchoolCard({ school }: { school: SchoolFull }) {
  const navigate = useNavigate();
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 flex flex-col">
      <div className="relative h-44 bg-muted overflow-hidden">
        <img src={school.cardImage} alt={`Gedung ${school.name}`} className="w-full h-full object-cover" />
        <div className="absolute top-3 right-3">
          <span className="bg-accent text-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow">Akreditasi {school.accreditation}</span>
        </div>
      </div>
      <div className="flex-1 p-5">
        <h3 className="text-foreground font-extrabold text-base mb-3 leading-tight" style={{ fontFamily: font }}>{school.name}</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" strokeWidth={2} />
            <span style={{ fontFamily: font }}>{school.address}, Desa {school.desa}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <User className="w-4 h-4 mt-0.5 text-primary shrink-0" strokeWidth={2} />
            <span style={{ fontFamily: font }}>{school.principal.name}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <Phone className="w-4 h-4 mt-0.5 text-primary shrink-0" strokeWidth={2} />
            <span style={{ fontFamily: font }}>{school.contact}</span>
          </li>
        </ul>
      </div>
      <div className="px-5 pb-5">
        <button
          onClick={() => navigate(`/sekolah/${school.slug}`)}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold text-sm rounded-xl py-2.5 transition-all duration-150 shadow-sm hover:shadow"
          style={{ fontFamily: font }}
        >
          <Info className="w-4 h-4" strokeWidth={2} />
          Detail Sekolah
        </button>
      </div>
    </div>
  );
}

/* ─── Schools Section ────────────────────────────────────────────── */
function SchoolsSection() {
  return (
    <section className="py-16 md:py-20" style={{ backgroundColor: "#8b2e22" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block bg-white/15 text-white text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full border border-white/20 mb-4" style={{ fontFamily: font }}>Direktori</span>
          <h2 className="text-white font-extrabold text-2xl md:text-3xl" style={{ fontFamily: font }}>Sekolah Dasar di Desa Sukaindah</h2>
          <p className="text-white/60 mt-2 text-sm" style={{ fontFamily: font }}>{allSchools.length} sekolah dasar negeri terdaftar</p>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-accent" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allSchools.map((school) => <SchoolCard key={school.id} school={school} />)}
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────── */
export function Footer() {
  return (
    <footer className="bg-foreground text-white/60 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <p style={{ fontFamily: font }}>© 2026 Portal Pendidikan Desa Sukaindah. Kecamatan Sukakarya.</p>
        <div className="flex flex-col items-start gap-3">
          <p className="text-white/60 self-start" style={{ fontFamily: font }}>Didukung oleh:</p>
          <div className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-full bg-white/5">
              <img src={kknImage} alt="KKN 96" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="text-left leading-tight">
              <p className="text-white/60 text-[9px]" style={{ fontFamily: font }}>KKN 96</p>
              <p className="text-white/60 text-[9px] tracking-wider" style={{ fontFamily: font }}>UNSIKA</p>
              <p className="text-white/60 text-[9px] tracking-wider" style={{ fontFamily: font }}>2026</p>
            </div>
            <div className="h-6 w-px bg-white/30" />
            <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center overflow-hidden rounded-full bg-white/5">
              <img src={logoImage} alt="Logo Desa" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="text-left leading-tight">
              <p className="text-white/60 text-[9px] font-semibold" style={{ fontFamily: font }}>Desa Sukaindah</p>
              <p className="text-white/60 text-[9px] tracking-wider" style={{ fontFamily: font }}>Kab. Bekasi</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Home Page ──────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: font }}>
      <Navbar />
      <HeroSection />
      <StatsSection />
      <SambutanSection />
      <SchoolsSection />
      <Footer />
    </div>
  );
}
