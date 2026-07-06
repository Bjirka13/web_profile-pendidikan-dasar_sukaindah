import { Navbar, Footer } from "../components/Layout";
import { StatsSection } from "../components/StatsSection";

export default function Statistics() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-accent font-semibold uppercase tracking-[0.3em] mb-3">Statistik</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">Ringkasan Statistik Pendidikan</h1>
            <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto">
              Temukan data agregat tentang jumlah sekolah, siswa, dan guru yang tersedia di Desa Sukaindah.
            </p>
          </div>
          <StatsSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
