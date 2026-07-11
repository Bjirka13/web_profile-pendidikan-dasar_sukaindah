import { Navbar, Footer } from "../components/Layout";
import { StatsSection } from "../components/StatsSection";

export default function Statistics() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(232,184,0,0.22),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.18),_transparent_30%),linear-gradient(180deg,#fff8db_0%,#fffdf5_42%,#fff9e8_100%)]" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-amber-100/70 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-[2rem] border border-amber-100 bg-white/75 px-6 py-10 text-center shadow-[0_24px_80px_-30px_rgba(16,24,40,0.25)] backdrop-blur">
            <p className="text-amber-700 font-semibold uppercase tracking-[0.35em] mb-3">Statistik</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">Ringkasan Statistik Pendidikan</h1>
            <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto">
              Temukan data agregat tentang jumlah sekolah, siswa, dan guru yang tersedia di Desa Sukaindah.
            </p>
          </div>
          <div className="mt-10">
            <StatsSection />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
