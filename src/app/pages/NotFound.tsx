import { useNavigate } from "react-router";
import { Navbar } from "./Home";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center flex-col gap-4 text-center px-4">
      <div className="text-8xl font-extrabold text-primary opacity-20" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>404</div>
      <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Halaman Tidak Ditemukan</h1>
      <p className="text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Halaman yang Anda cari tidak tersedia.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}
