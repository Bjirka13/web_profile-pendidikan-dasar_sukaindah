import { ImageWithFallback } from "./figma/ImageWithFallback";

export function WelcomeSection() {
  return (
    <section className="relative min-h-[500px] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1588423851962-29a61047cb11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvbmVzaWFuJTIwdmlsbGFnZSUyMHJpY2UlMjBmaWVsZHxlbnwxfHx8fDE3ODI2Mzk3MjF8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Desa Sukaindah"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 z-10 relative">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Text Content */}
          <div className="text-white">
            <h1 className="mb-4">
              Selamat Datang di Portal Pendidikan Dasar
            </h1>
            <h2 className="mb-6">
              Desa Sukaindah
            </h2>
            <p className="text-lg opacity-90 mb-6">
              Portal informasi lengkap tentang sekolah dasar dan pendidikan di Desa Sukaindah. 
              Kami berkomitmen untuk memberikan pendidikan berkualitas bagi generasi muda desa.
            </p>
            <div className="flex gap-4">
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
                <p className="text-sm opacity-80">Total Sekolah</p>
                <p className="text-2xl">4 SD</p>
              </div>
            </div>
          </div>

          {/* Circle Masked Image */}
          <div className="flex justify-center md:justify-end">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1615466178532-b6d2f9c304de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvbmVzaWFuJTIwZWxlbWVudGFyeSUyMHNjaG9vbCUyMHN0dWRlbnQlMjBzbWlsaW5nfGVufDF8fHx8MTc4MjYzOTcyMXww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Siswa SD Sukaindah"
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
