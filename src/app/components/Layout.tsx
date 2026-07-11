import { useState } from "react";
import { useNavigate } from "react-router";
import { Menu, X, MapPin, Phone, User, Info } from "lucide-react";
import logoImage from "../../image/Home/logo.png";
import kknImage from "../../image/Home/KKN_96.png";

const font = "'Plus Jakarta Sans', sans-serif";

export function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [
    { label: "Beranda", href: "/" },
    { label: "Sekolah", href: "/sekolah" },
    { label: "Statistik", href: "/statistik" },
    { label: "About Us", href: "/know-about-us" },
    { label: "Admin", href: "/admin" },
  ];

  const handleNavigate = (href: string) => {
    setMenuOpen(false);
    navigate(href);
  };

  return (
    <nav className="sticky top-0 z-50 bg-primary shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <button onClick={() => handleNavigate("/")} className="flex items-center gap-3 hover:opacity-90 transition-opacity -ml-4 sm:-ml-6 lg:-ml-8">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-md shrink-0">
              <img src={logoImage} alt="Logo Desa" className="w-8 h-8 object-contain" />
            </div>
            <div className="leading-tight text-left">
              <div className="text-white font-bold text-sm tracking-wide" style={{ fontFamily: font }}>PORTAL PENDIDIKAN</div>
              <div className="text-accent text-xs font-medium tracking-wider">SEKOLAH DASAR</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 p-2 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary md:hidden"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar absolute right-4 top-0 h-full" style={{ fontFamily: font }}>
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigate(item.href)}
                className="px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-primary/95">
          <div className="space-y-2 px-4 py-4" style={{ fontFamily: font }}>
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigate(item.href)}
                className="w-full rounded-2xl px-4 py-3 text-left text-white/90 hover:bg-white/10 hover:text-white transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

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
