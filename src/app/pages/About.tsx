import { Navbar, Footer } from "../components/Layout";
import kknImage from "../../image/Home/KKN_96.png";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Konten About Us sengaja dibuat statis dan tidak dihubungkan ke WordPress. */}
      <Navbar />
      <main className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-[1.2fr_0.8fr] items-center">
            <div>
              <p className="text-accent font-semibold uppercase tracking-[0.3em] mb-3">About Us</p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">Tim KKN 96 UNSIKA yang Mengembangkan Portal Pendidikan</h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Portal ini dibuat oleh kelompok KKN 96 Universitas Singaperbangsa Karawang untuk mendukung transparansi dan akses informasi pendidikan dasar di Desa Sukaindah. Kami merancang web ini agar masyarakat dapat mengenal sekolah, guru, fasilitas, dan statistik pendidikan secara mudah.
              </p>
              <div className="mt-10 space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">Visi Kami</h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    Membangun sistem informasi yang responsif untuk membantu orang tua, siswa, dan warga Desa Sukaindah mendapatkan data sekolah dasar dengan cepat dan dapat diandalkan.
                  </p>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">Misi Tim</h2>
                  <ul className="mt-3 list-disc list-inside text-muted-foreground space-y-2 leading-relaxed">
                    <li>Menampilkan data sekolah dan profil guru secara transparan.</li>
                    <li>Menyediakan statistik ringkas tentang jumlah sekolah, siswa, dan guru.</li>
                    <li>Mendukung program pembinaan masyarakat Desa Sukaindah melalui teknologi digital.</li>
                  </ul>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">Struktur Tim KKN 96</h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-muted-foreground/20 bg-white/80 p-6 shadow-sm">
                      <p className="text-sm uppercase tracking-[0.3em] text-accent font-semibold">Pembimbing</p>
                      <p className="mt-3 text-foreground font-semibold">Dosen Pembimbing Lapangan</p>
                      <p className="mt-2 text-muted-foreground text-sm">Membimbing pelaksanaan kegiatan KKN dan memberikan arahan akademik.</p>
                    </div>
                    <div className="rounded-3xl border border-muted-foreground/20 bg-white/80 p-6 shadow-sm">
                      <p className="text-sm uppercase tracking-[0.3em] text-accent font-semibold">Koordinasi</p>
                      <p className="mt-3 text-foreground font-semibold">Koordinator Lapangan</p>
                      <p className="mt-2 text-muted-foreground text-sm">Mengatur komunikasi antara tim KKN dan pihak desa serta sekolah.</p>
                    </div>
                    <div className="rounded-3xl border border-muted-foreground/20 bg-white/80 p-6 shadow-sm">
                      <p className="text-sm uppercase tracking-[0.3em] text-accent font-semibold">Administrasi</p>
                      <p className="mt-3 text-foreground font-semibold">Sekretaris Tim</p>
                      <p className="mt-2 text-muted-foreground text-sm">Mencatat dokumentasi, laporan, dan perkembangan kegiatan KKN.</p>
                    </div>
                    <div className="rounded-3xl border border-muted-foreground/20 bg-white/80 p-6 shadow-sm">
                      <p className="text-sm uppercase tracking-[0.3em] text-accent font-semibold">Teknologi</p>
                      <p className="mt-3 text-foreground font-semibold">Pengembang Web</p>
                      <p className="mt-2 text-muted-foreground text-sm">Membangun portal, desain antarmuka, dan memastikan akses informasi berjalan lancar.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-[2rem] overflow-hidden border border-muted-foreground/20 shadow-xl">
              <img src={kknImage} alt="Tim KKN 96 UNSIKA" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
