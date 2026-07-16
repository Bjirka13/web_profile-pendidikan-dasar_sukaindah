import { useNavigate } from "react-router";
import { MapPin, User, Phone, Info } from "lucide-react";
import { type SchoolFull } from "../data/schools";
import { Footer, Navbar } from "../components/Layout";
import { useSchoolCms } from "../cms/school-cms";

const font = "'Plus Jakarta Sans', sans-serif";

function SchoolCard({ school }: { school: SchoolFull }) {
  const navigate = useNavigate();
  return (
    <div className="bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 flex flex-col">
      <div className="relative h-52 bg-muted overflow-hidden">
        <img src={school.cardImage} alt={school.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute top-4 right-4 bg-accent/95 text-foreground text-xs font-semibold uppercase tracking-[0.2em] rounded-full px-3 py-1 shadow-lg">
          {school.accreditation || "-"}
        </div>
      </div>
      <div className="flex-1 p-6 flex flex-col">
        <h3 className="text-foreground font-extrabold text-lg mb-3 leading-tight" style={{ fontFamily: font }}>{school.name}</h3>
        <div className="space-y-3 text-sm text-muted-foreground mb-6">
          <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />{school.address}, Desa {school.desa}</p>
          <p className="flex items-center gap-2"><User className="w-4 h-4 text-primary" />{school.principal.name || "Belum ada data"}</p>
          <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" />{school.contact || "-"}</p>
        </div>
        <button
          onClick={() => navigate(`/sekolah/${school.slug}`)}
          className="mt-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold text-sm rounded-2xl py-3 transition-all duration-150 shadow-sm"
          style={{ fontFamily: font }}
        >
          <Info className="w-4 h-4" /> Lihat Detail
        </button>
      </div>
    </div>
  );
}

export default function Schools() {
  const { schools } = useSchoolCms();

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: font }}>
      <Navbar />
      <main>
        <section className="relative min-h-[420px] bg-[radial-gradient(circle_at_top,_rgba(254,226,196,0.15),_transparent_45%),linear-gradient(135deg,#8b2e22_0%,#1e6b3a_100%)] overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1588423851962-29a61047cb11?w=1600&auto=format&fit=crop')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/50" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center py-20">
            <span className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-bold uppercase tracking-[0.3em] px-4 py-2 rounded-full mb-5 backdrop-blur-sm" style={{ fontFamily: font }}>
              Direktori Sekolah
            </span>
            <h1 className="text-white font-extrabold text-4xl md:text-5xl max-w-3xl leading-tight" style={{ fontFamily: font }}>
              Semua Sekolah Dasar di Desa Sukaindah
            </h1>
            <p className="mt-5 max-w-2xl text-white/75 text-base md:text-lg" style={{ fontFamily: font }}>
              Temukan profil, fasilitas, prestasi, dan kontak lengkap setiap sekolah dasar di Desa Sukaindah. Klik detail untuk melihat informasi sekolah lebih lengkap.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
              <div>
                <p className="text-primary text-xs uppercase tracking-[0.35em] font-bold mb-2" style={{ fontFamily: font }}>Daftar Sekolah</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground" style={{ fontFamily: font }}>Koleksi Data dan Profil Sekolah</h2>
              </div>
              <p className="text-muted-foreground text-sm max-w-xl" style={{ fontFamily: font }}>
                Halaman ini menampilkan semua sekolah yang terdaftar di portal pendidikan Desa Sukaindah. Gunakan tombol detail untuk membuka profil sekolah secara lengkap.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {schools.map((school) => (
                <SchoolCard key={school.id} school={school} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

