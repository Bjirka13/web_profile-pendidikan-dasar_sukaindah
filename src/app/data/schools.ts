
import { schoolImageAssets } from "../../image";

export interface TeacherStaff {
  name: string;
  position: string;
  nip?: string;
  photo: string;
  isAdmin?: boolean;
  isVicePrincipal?: boolean;
}

export interface Facility {
  name: string;
  description: string;
  photo: string;
  icon: string;
  count: number;
}

export interface Achievement {
  title: string;
  year: string;
  level: string;
  description: string;
  photo?: string;
}

export interface NewsItem {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  thumbnail: string;
  category: string;
}

export interface GalleryItem {
  photo: string;
  caption: string;
}

export interface GradeStats {
  grade: number;
  label: string;
  total: number;
  male: number;
  female: number;
}

export interface SchoolFull {
  id: number;
  slug: string;
  name: string;
  shortName: string;
  npsn: string;
  tagline: string;
  syncStatus: string;
  address: string;
  kodePos: string;
  kecamatan: string;
  desa: string;
  contact: string;
  email: string;
  accreditation: string;
  status: string;
  yearEstablished: string;
  heroImage: string;
  cardImage: string;
  mapsEmbed: string;

  principal: {
    name: string;
    photo: string;
    welcome: string;
    position: string;
    nip?: string;
  };

  history: string;
  vision: string;
  mission: string[];
  goals: string[];

  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  totalTeachers: number;
  totalClassrooms: number;
  totalStudyGroups: number;
  gradeStats: GradeStats[];

  staff: TeacherStaff[];
  teachers: TeacherStaff[];
  facilities: Facility[];
  achievements: Achievement[];
  news: NewsItem[];
  gallery: GalleryItem[];
}

/* ─── Shared Images ──────────────────────────────────────────────── */
const IMG = {
  building1: schoolImageAssets.sdn1.hero,
  building2: schoolImageAssets.sdn2.hero,
  building3: schoolImageAssets.sdn3.hero,
  building4: schoolImageAssets.sdn4.hero,

  principal1: schoolImageAssets.sdn1.principal,
  principal2: schoolImageAssets.sdn2.principal,
  principal3: schoolImageAssets.sdn3.principal,
  principal4: schoolImageAssets.sdn4.principal,

  teacherPlaceholder: schoolImageAssets.blank,
  teacherM1: schoolImageAssets.blank,
  teacherM2: schoolImageAssets.blank,
  teacherF1: schoolImageAssets.blank,
  teacherF2: schoolImageAssets.blank,
  teacherF3: schoolImageAssets.blank,

  library: schoolImageAssets.sdn1.classroom,
  classroom: schoolImageAssets.sdn1.classroom,
  computerLab: schoolImageAssets.sdn1.classroom,
  sportsField: schoolImageAssets.sdn1.classroom,
  teacherOffice: schoolImageAssets.sdn1.classroom,
  kidsOutdoor: schoolImageAssets.sdn1.classroom,
  kidsRunning: schoolImageAssets.sdn1.classroom,
  kidsSchool: schoolImageAssets.sdn1.classroom,
  kidsUniform: schoolImageAssets.sdn1.classroom,
  mosque: schoolImageAssets.sdn1.classroom,
};

/* ─── Shared facilities template ────────────────────────────────── */
function makeFacilities(schoolNo: number): Facility[] {
  return [
    { name: "Perpustakaan", description: `Koleksi lebih dari 1.200 buku pelajaran dan bacaan umum untuk mendukung literasi siswa SDN ${schoolNo}.`, photo: IMG.library, icon: "📚", count: 1 },
    { name: "Ruang Kelas", description: "Ruang belajar nyaman dengan pencahayaan alami, dilengkapi papan tulis dan meja belajar modern.", photo: IMG.classroom, icon: "🏫", count: 1 },
    { name: "Lab Komputer", description: "Fasilitas komputer dengan koneksi internet untuk mendukung pembelajaran digital dan literasi teknologi.", photo: IMG.computerLab, icon: "💻", count: 1 },
    { name: "Lapangan Olahraga", description: "Lapangan serbaguna untuk kegiatan olahraga dan upacara bendera, dikelilingi vegetasi hijau.", photo: IMG.sportsField, icon: "⚽", count: 1 },
    { name: "Ruang Guru", description: "Ruang kerja guru yang kondusif dilengkapi fasilitas pendukung administrasi dan persiapan mengajar.", photo: IMG.teacherOffice, icon: "🖊️", count: 1 },
    { name: "Musholla", description: "Tempat ibadah bersih dan nyaman untuk mendukung pendidikan karakter dan keimanan siswa.", photo: IMG.mosque, icon: "🕌", count: 1 },
    { name: "UKS", description: "Unit Kesehatan Sekolah dengan perlengkapan P3K dan tempat istirahat bagi siswa yang sakit.", photo: IMG.kidsUniform, icon: "🏥", count: 1 },
    { name: "Taman Bermain", description: "Area bermain aman untuk mengembangkan motorik dan kreativitas siswa saat jam istirahat.", photo: IMG.kidsOutdoor, icon: "🎡", count: 1 },
  ];
}

/* ─── Shared achievements template ─────────────────────────────── */
function makeAchievements(schoolNo: number): Achievement[] {
  const baseYear = 2020 + schoolNo;
  return [
    { title: `Juara I Lomba Cerdas Cermat Tingkat Kecamatan`, year: String(baseYear + 3), level: "Kecamatan", description: "Siswa-siswi unggul dalam kompetisi pengetahuan umum dan akademik antar sekolah dasar se-Kecamatan Sukakarya.", photo: IMG.kidsUniform },
    { title: "Penghargaan Sekolah Adiwiyata", year: String(baseYear + 2), level: "Kabupaten", description: "Meraih predikat Sekolah Adiwiyata dari Dinas Lingkungan Hidup Kabupaten atas program penghijauan dan pengelolaan sampah.", photo: IMG.kidsOutdoor },
    { title: "Juara II Olimpiade Matematika", year: String(baseYear + 1), level: "Kecamatan", description: "Siswa berprestasi berhasil meraih medali perak pada kompetisi olimpiade matematika antar SD se-kecamatan.", photo: IMG.kidsSchool },
    { title: "Akreditasi A dari BAN-S/M", year: String(baseYear), level: "Nasional", description: "Meraih nilai akreditasi tertinggi dari Badan Akreditasi Nasional atas kualitas standar pendidikan dan manajemen sekolah.", photo: IMG.classroom },
  ];
}

/* ─── News template ─────────────────────────────────────────────── */
function makeNews(schoolNo: number): NewsItem[] {
  return [
    {
      id: 1,
      title: `Pentas Seni dan Pameran Karya Siswa SDN Sukaindah 0${schoolNo}`,
      date: "15 Juni 2024",
      excerpt: `SDN Sukaindah 0${schoolNo} sukses menggelar pentas seni tahunan yang menampilkan beragam bakat siswa dari kelas I hingga VI. Kegiatan ini dihadiri oleh orang tua, komite sekolah, dan tokoh masyarakat setempat.`,
      thumbnail: IMG.kidsOutdoor,
      category: "Kegiatan",
    },
    {
      id: 2,
      title: "Program Literasi Pagi Disambut Antusias Siswa",
      date: "3 Mei 2024",
      excerpt: "Program membaca 15 menit sebelum pelajaran dimulai terbukti meningkatkan minat baca siswa. Perpustakaan sekolah kini semakin ramai dikunjungi setiap jam istirahat.",
      thumbnail: IMG.library,
      category: "Program",
    },
    {
      id: 3,
      title: `Kunjungan Pengawas Dinas Pendidikan ke SDN Sukaindah 0${schoolNo}`,
      date: "20 April 2024",
      excerpt: "Tim pengawas dari Dinas Pendidikan Kabupaten melakukan supervisi akademik dan memberikan apresiasi atas perkembangan kualitas pembelajaran di sekolah kami.",
      thumbnail: IMG.classroom,
      category: "Informasi",
    },
  ];
}

/* ─── Gallery template ──────────────────────────────────────────── */
function makeGallery(): GalleryItem[] {
  return [
    { photo: IMG.kidsOutdoor, caption: "Kegiatan Pramuka di Lapangan Sekolah" },
    { photo: IMG.kidsRunning, caption: "Lomba Lari pada Hari Olahraga Nasional" },
    { photo: IMG.kidsSchool, caption: "Foto Bersama Siswa Baru Tahun Ajaran 2024" },
    { photo: IMG.library, caption: "Program Literasi Perpustakaan Sekolah" },
    { photo: IMG.classroom, caption: "Suasana Belajar di Ruang Kelas" },
    { photo: IMG.computerLab, caption: "Pembelajaran TIK di Lab Komputer" },
    { photo: IMG.sportsField, caption: "Olahraga Pagi Bersama" },
    { photo: IMG.kidsUniform, caption: "Upacara Bendera Setiap Hari Senin" },
  ];
}

/* ─── School 1 ───────────────────────────────────────────────────── */
const school1: SchoolFull = {
  id: 1, slug: "sdn-sukaindah-01",
  name: "SDN Sukaindah 01", shortName: "SDN SI 01",
  npsn: "20218491", tagline: "Cerdas, Berkarakter, Berprestasi",
  syncStatus: "Sinkronisasi DAPO berhasil 10/7/2026",
  address: "KP. CABANG PULO BAMBU RT.01 RW.01", kodePos: "17646",
  kecamatan: "Sukakarya", desa: "Sukaindah",
  contact: "082112345601", email: "sdn01sukaindah@gmail.com",
  accreditation: "B", status: "Negeri", yearEstablished: "1910",
  heroImage: IMG.building1, cardImage: IMG.building1,
  mapsEmbed: "https://maps.app.goo.gl/rDQGbRz1GYzp6J319",

  principal: {
    name: "Ranih Usnani, S.Pd",
    position: "Kepala Sekolah",
    photo: IMG.principal1,
    welcome: `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nSelamat datang di halaman resmi SDN Sukaindah 01. Kami berkomitmen untuk mewujudkan pendidikan yang berkualitas, berkarakter, dan berdaya saing tinggi bagi seluruh putra-putri Desa Sukaindah.\n\nSDN Sukaindah 01 terus berupaya meningkatkan mutu pembelajaran melalui metode yang inovatif, kreatif, dan menyenangkan. Kami percaya bahwa setiap anak memiliki potensi luar biasa yang perlu dikembangkan secara optimal.\n\nMari bersama-sama kita wujudkan generasi penerus bangsa yang cerdas, beriman, dan berakhlak mulia. Dukungan dan kepercayaan Bapak/Ibu orang tua sangat berarti bagi kemajuan sekolah kita bersama.\n\nWassalamu'alaikum Warahmatullahi Wabarakatuh.`,
  },

  history: "SDN Sukaindah 01 memiliki sejarah panjang yang bermula pada tahun 1970. Pada awal pendiriannya, sekolah ini dikenal sebagai Sekolah Rakyat (SR) yang didirikan sebagai upaya menyediakan pendidikan dasar bagi anak-anak di wilayah Desa Sukaindah. Seiring perkembangan sistem pendidikan nasional, nama sekolah kemudian berubah menjadi SD Kumejing. Selanjutnya, sekolah ini kembali mengalami perubahan nama hingga resmi dikenal sebagai SDN Sukaindah 01 seperti saat ini. Selama lebih dari satu abad, SDN Sukaindah 01 telah menjadi bagian penting dalam perkembangan pendidikan di Desa Sukaindah. Berbagai generasi telah menempuh pendidikan di sekolah ini dan banyak alumninya yang telah berkontribusi di berbagai bidang kehidupan, baik di tingkat daerah maupun nasional.",
  vision: "Terwujudnya Warga Sekolah Yang Unggul Dalam Prestasi Berbasis Iptek, Berlandaskan Imtaq, Luhur Budi Pekertidan Peduli Terhadap Lingkungan.",
  mission: [
    "Meningkatkan kualitas pendidikan",
    "Meningkatkan Disiplin belajar",
    "Meningkatkan kegiatan Literasi & numerasi",
    "Membiasakan berprilaku yang sesuai dengan profil pelajar pancasila",
    "Menciptakan lingkungan hidup yang aman, tertib, nyaman, bersih dan indah",
    "Meningkatkan keterampilan hidup mandiri, kreatif, percaya diri dan bersikap jujur"
  ],
  goals: [
    "Meningkatkan rata-rata nilai UN/UASBN minimal 8,0 pada tahun 2025",
    "Menghasilkan lulusan yang memiliki kompetensi akademik dan karakter yang unggul",
    "Mewujudkan sekolah ramah anak yang bebas dari bullying dan kekerasan",
    "Meningkatkan ketersediaan dan kualitas sarana prasarana pendidikan",
  ],

  totalStudents: 304, maleStudents: 159, femaleStudents: 145,
  totalTeachers: 13, totalClassrooms: 5, totalStudyGroups: 10,
  gradeStats: [
    { grade: 1, label: "Kelas I.A", total: 33, male: 12, female: 21 },
    { grade: 1, label: "Kelas I.B", total: 30, male: 20, female: 10 },
    { grade: 2, label: "Kelas II.A", total: 30, male: 17, female: 13 },
    { grade: 2, label: "Kelas II.B", total: 22, male: 17, female: 5 },
    { grade: 3, label: "Kelas III.A", total: 30, male: 13, female: 17 },
    { grade: 3, label: "Kelas III.B", total: 34, male: 11, female: 23 },
    { grade: 4, label: "Kelas IV.A", total: 28, male: 15, female: 13 },
    { grade: 4, label: "Kelas IV.B", total: 28, male: 15, female: 13 },
    { grade: 5, label: "Kelas V", total: 29, male: 16, female: 13 },
    { grade: 6, label: "Kelas VI", total: 41, male: 24, female: 17 },
  ],

  staff: [
    { name: "Dedi, A.Md", position: "Operator Sekolah", photo: IMG.teacherM1, isAdmin: true },
    { name: "Safitri Nuraelasari", position: "Tata Usaha", photo: IMG.teacherM1, isAdmin: true },
    { name: "Mulyani Setiawati", position: "Penjaga Sekolah", photo: IMG.teacherM1, isAdmin: true },
  ],
  teachers: [
    { name: "Heri Mabruri, S.Pd.SD", position: "Guru Kelas", nip: "198305172008011005", photo: IMG.teacherF1 },
    { name: "Nuraini, S.Pd.", position: "Guru Kelas", nip: "198309102008012004", photo: IMG.teacherM1 },
    { name: "Siti Khodijah, S.Pd.", position: "Guru Kelas", nip: "198506122008012002", photo: IMG.teacherF2 },
    { name: "Anita Carolina, S.Pd.", position: "Guru Kelas", nip: "198305022014102003", photo: IMG.teacherM2 },
    { name: "Ahmad Baijuri, S.Pd.", position: "Guru Kelas", nip: "199408132020121003", photo: IMG.teacherF3 },
    { name: "Ratna Widyawati, S.Pd.", position: "Guru Kelas", nip: "198104162023212001", photo: IMG.teacherM1 },
    { name: "Muhyiy Legowijoyo, S.Pd.", position: "Guru Kelas", nip: "198904232025211010", photo: IMG.teacherM1 },
    { name: "Ipah Syaripah, S.Pd.", position: "Guru Kelas", nip: "197507182025212001", photo: IMG.teacherM1 },
    { name: "Aulia Qowiyah, S.Pd.", position: "Guru Bid. Studi Agama Islam", nip: "199502252025212061", photo: IMG.teacherM1 }
  ],
  facilities: makeFacilities(1),
  achievements: makeAchievements(1),
  news: makeNews(1),
  gallery: makeGallery(),
};

/* ─── School 2 ───────────────────────────────────────────────────── */
const school2: SchoolFull = {
  id: 2, slug: "sdn-sukaindah-02",
  name: "SDN Sukaindah 02", shortName: "SDN SI 02",
  npsn: "20218490", tagline: "Berilmu, Berakhlak, Berprestasi",
  syncStatus: "Sinkronisasi DAPO berhasil 10/7/2026",
  address: "Kp. Kumejing", kodePos: "17630",
  kecamatan: "Sukakarya", desa: "Sukaindah",
  contact: "082112345602", email: "sdn.sukaindah02@gmail.com",
  accreditation: "B", status: "Negeri", yearEstablished: "1910",
  heroImage: IMG.building2, cardImage: IMG.building2,
  mapsEmbed: "https://maps.app.goo.gl/Du7FvmqqDBw8ooga7",

  principal: {
    name: "Nurhayadi, S.Pd. SD",
    position: "Kepala Sekolah",
    photo: IMG.principal2,
    welcome: `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nSalam hangat dari SDN Sukaindah 02. Sebagai pemimpin sekolah ini, saya mengajak seluruh warga sekolah untuk bersama-sama mewujudkan impian besar: menjadikan SDN Sukaindah 02 sebagai sekolah yang unggul, inovatif, dan berkarakter.\n\nPendidikan bukan sekadar transfer pengetahuan, tetapi proses pembentukan karakter dan akhlak mulia yang akan menjadi bekal hidup anak-anak kita. Oleh karena itu, kami menggabungkan kurikulum akademik yang kuat dengan pendidikan karakter yang berkelanjutan.\n\nKepercayaan orang tua dan masyarakat adalah amanah yang kami emban dengan penuh tanggung jawab. Bersama kita wujudkan generasi emas Indonesia.\n\nWassalamu'alaikum Warahmatullahi Wabarakatuh.`,
  },

  history: "SDN Sukaindah 02 didirikan pada tahun 1975 untuk melayani pertumbuhan penduduk di bagian timur Desa Sukaindah. Berawal dari sebuah bangunan sederhana dengan tiga ruang kelas, sekolah ini berkembang pesat seiring kepercayaan masyarakat. Kini sekolah ini memiliki fasilitas lengkap dan terus berinovasi dalam pelayanan pendidikan.",
  vision: "Menjadi sekolah unggulan yang menghasilkan peserta didik berilmu, berakhlak mulia, beriman, dan siap menghadapi tantangan masa depan dengan percaya diri.",
  mission: [
    "Melaksanakan pembelajaran bermakna yang berpusat pada siswa (student-centered learning)",
    "Membangun budaya literasi dan numerasi yang kuat sejak dini",
    "Menanamkan nilai-nilai keagamaan, nasionalisme, dan gotong royong dalam kehidupan sehari-hari",
    "Mengoptimalkan potensi setiap siswa melalui program ekstrakurikuler yang beragam",
    "Menjalin sinergi positif antara sekolah, keluarga, dan komunitas",
  ],
  goals: [
    "Mempertahankan akreditasi A dan meningkatkan standar pelayanan pendidikan",
    "Meningkatkan persentase kelulusan dengan nilai rata-rata minimal 8,5",
    "Mewujudkan sekolah inklusif yang ramah bagi semua siswa",
    "Mengembangkan program unggulan berbasis teknologi dan seni budaya lokal",
  ],

  totalStudents: 255, maleStudents: 142, femaleStudents: 113,
  totalTeachers: 11, totalClassrooms: 6, totalStudyGroups: 9,
  gradeStats: [
    { grade: 1, label: "Kelas I", total: 49, male: 26, female: 23 },
    { grade: 2, label: "Kelas II", total: 48, male: 25, female: 23 },
    { grade: 3, label: "Kelas III", total: 47, male: 24, female: 23 },
    { grade: 4, label: "Kelas IV", total: 48, male: 25, female: 23 },
    { grade: 5, label: "Kelas V", total: 47, male: 24, female: 23 },
    { grade: 6, label: "Kelas VI", total: 48, male: 24, female: 24 },
  ],

  staff: [
    { name: "M. D'nisyahwal. H", position: "Operator Sekolah", photo: IMG.teacherM1, isVicePrincipal: true },
    { name: "Sudrajat", position: "Penjaga", photo: IMG.teacherF3, isAdmin: true },
  ],
  teachers: [
    { name: "Nurlaelah, S.Pd.", position: "Guru Kelas", nip: "197410262000032001", photo: IMG.teacherF1 },
    { name: "H. Sarohman, S.Pd.", position: "Guru Kelas", nip: "197412231999032006", photo: IMG.teacherM1 },
    { name: "Kurningsih, S.Pd.", position: "Guru Kelas", nip: "196907172007011004", photo: IMG.teacherF2 },
    { name: "Uun Khaerunnisa, S.Pd.", position: "Guru Kelas", nip: "198012162014082001", photo: IMG.teacherM2 },
    { name: "Ari Amalia Hastuti, S.Pd.", position: "Guru Kelas", nip: "198904012020122004", photo: IMG.teacherF3 },
    { name: "Mariah, S.Pd.", position: "Guru Kelas", nip: "-", photo: IMG.teacherM1 },
    { name: "Taufik Hidayat, S.Pd.", position: "Guru Kelas", nip: "-", photo: IMG.teacherF1 },
    { name: "Roimun, S.Pd.", position: "Guru Kelas", nip: "-", photo: IMG.teacherM2 },
  ],
  facilities: makeFacilities(2),
  achievements: makeAchievements(2),
  news: makeNews(2),
  gallery: makeGallery(),
};

/* ─── School 3 ───────────────────────────────────────────────────── */
const school3: SchoolFull = {
  id: 3, slug: "sdn-sukaindah-03",
  name: "SDN Sukaindah 03", shortName: "SDN SI 03",
  npsn: "20218489", tagline: "Disiplin, Kreatif, Mandiri",
  syncStatus: "Sinkronisasi DAPO berhasil 10/7/2026",
  address: "Kp. Cabang Pulo Bambu", kodePos: "17640",
  kecamatan: "Sukakarya", desa: "Sukaindah",
  contact: "082112345603", email: "sdn.sukaindah03@gmail.com",
  accreditation: "C", status: "Negeri", yearEstablished: "1977",
  heroImage: IMG.building3, cardImage: IMG.building3,
  mapsEmbed: "https://maps.app.goo.gl/QVsnVHSWnvz6hoFd9",

  principal: {
    name: "Endang Sutarni, S.Pd. SD",
    position: "Kepala Sekolah",
    photo: IMG.principal3,
    welcome: `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nSelamat datang di SDN Sukaindah 03, sekolah yang berkomitmen mencetak generasi yang disiplin, kreatif, dan mandiri.\n\nSejak berdiri tahun 1980, SDN Sukaindah 03 telah menjadi bagian integral dari kehidupan masyarakat Desa Sukaindah. Kami bangga dengan perjalanan panjang ini dan terus bersemangat untuk memberikan pelayanan pendidikan terbaik.\n\nDengan semangat gotong royong, kami mengundang seluruh pemangku kepentingan—orang tua, komite, dan masyarakat—untuk bersama-sama membangun sekolah yang lebih baik demi masa depan anak-anak kita.\n\nWassalamu'alaikum Warahmatullahi Wabarakatuh.`,
  },

  history: "Berdiri pada tahun 1980, SDN Sukaindah 03 hadir untuk melayani warga dusun barat Desa Sukaindah. Melewati berbagai tantangan dan perubahan, sekolah ini tetap eksis dan terus berkembang. Renovasi besar dilakukan pada tahun 2015 dengan bantuan dana BOS dan partisipasi masyarakat, menghadirkan gedung yang lebih nyaman dan modern.",
  vision: "Membentuk insan yang disiplin, kreatif, mandiri, beriman, dan bertaqwa, serta mampu berkontribusi positif bagi masyarakat dan bangsa.",
  mission: [
    "Menerapkan disiplin positif dalam seluruh aspek kehidupan sekolah",
    "Mengembangkan kreativitas siswa melalui kegiatan seni, budaya, dan keterampilan",
    "Membangun kemandirian belajar melalui pendekatan inquiry dan project-based learning",
    "Memperkuat nilai-nilai keagamaan dan budi pekerti luhur",
    "Meningkatkan kompetensi guru melalui pelatihan dan pengembangan profesional berkelanjutan",
  ],
  goals: [
    "Meningkatkan akreditasi dari B menjadi A pada periode akreditasi berikutnya",
    "Meningkatkan angka partisipasi dan kehadiran siswa minimal 95%",
    "Mewujudkan program adiwiyata tingkat kabupaten pada tahun 2025",
    "Mengoptimalkan penggunaan teknologi dalam proses pembelajaran",
  ],

  totalStudents: 130, maleStudents: 69, femaleStudents: 61,
  totalTeachers: 10, totalClassrooms: 6, totalStudyGroups: 6,
  gradeStats: [
    { grade: 1, label: "Kelas I", total: 44, male: 23, female: 21 },
    { grade: 2, label: "Kelas II", total: 43, male: 22, female: 21 },
    { grade: 3, label: "Kelas III", total: 42, male: 21, female: 21 },
    { grade: 4, label: "Kelas IV", total: 43, male: 22, female: 21 },
    { grade: 5, label: "Kelas V", total: 42, male: 22, female: 20 },
    { grade: 6, label: "Kelas VI", total: 42, male: 22, female: 20 },
  ],

  staff: [
    { name: "M. D'nisyahwal. H", position: "Operator Sekolah", photo: IMG.teacherM1, isVicePrincipal: true },
    { name: "Sudrajat", position: "Penjaga", photo: IMG.teacherF3, isAdmin: true },
  ],
  teachers: [
    { name: "Nurlaelah, S.Pd.", position: "Guru Kelas", nip: "197410262000032001", photo: IMG.teacherF1 },
    { name: "H. Sarohman, S.Pd.", position: "Guru Kelas", nip: "197412231999032006", photo: IMG.teacherM1 },
    { name: "Kurningsih, S.Pd.", position: "Guru Kelas", nip: "196907172007011004", photo: IMG.teacherF2 },
    { name: "Uun Khaerunnisa, S.Pd.", position: "Guru Kelas", nip: "198012162014082001", photo: IMG.teacherM2 },
    { name: "Ari Amalia Hastuti, S.Pd.", position: "Guru Kelas", nip: "198904012020122004", photo: IMG.teacherF3 },
    { name: "Mariah, S.Pd.", position: "Guru Kelas", nip: "-", photo: IMG.teacherM1 },
    { name: "Taufik Hidayat, S.Pd.", position: "Guru Kelas", nip: "-", photo: IMG.teacherF1 },
    { name: "Roimun, S.Pd.", position: "Guru Kelas", nip: "-", photo: IMG.teacherM2 },
  ],
  facilities: makeFacilities(3),
  achievements: makeAchievements(3),
  news: makeNews(3),
  gallery: makeGallery(),
};

/* ─── School 4 ───────────────────────────────────────────────────── */
const school4: SchoolFull = {
  id: 4, slug: "sdn-sukaindah-04",
  name: "SDN Sukaindah 04", shortName: "SDN SI 04",
  npsn: "20218488", tagline: "Beriman, Terampil, dan Berprestasi",
  syncStatus: "Sinkronisasi DAPO berhasil 10/7/2026",
  address: "KP. PULO GELATIK", kodePos: "17628",
  kecamatan: "Sukakarya", desa: "Sukaindah",
  contact: "082112345604", email: "sdn.sukaindah04@gmail.com",
  accreditation: "B", status: "Negeri", yearEstablished: "1910",
  heroImage: IMG.building4, cardImage: IMG.building4,
  mapsEmbed: "https://maps.app.goo.gl/t2t2777uGEp5zUFfA",

  principal: {
    name: "Niman Gunawan, S.Pd.SD",
    position: "Kepala Sekolah",
    photo: IMG.principal4,
    welcome: `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nPuji syukur kehadirat Allah SWT, SDN Sukaindah 04 terus tumbuh dan berkembang menjadi sekolah yang dipercaya masyarakat.\n\nVisi kami sederhana namun kuat: mencetak generasi yang beriman, terampil, dan berprestasi. Tiga pilar ini kami jadikan landasan dalam setiap keputusan dan kebijakan pendidikan di sekolah ini.\n\nKami mengundang Bapak dan Ibu orang tua untuk menjadi mitra sejati dalam mendidik anak-anak kita. Karena pendidikan terbaik adalah kolaborasi antara sekolah dan rumah.\n\nTerima kasih atas kepercayaan yang telah diberikan. Mari kita jadikan SDN Sukaindah 04 sebagai rumah kedua yang menyenangkan bagi putra-putri kita.\n\nWassalamu'alaikum Warahmatullahi Wabarakatuh.`,
  },

  history: "SDN Sukaindah 04 berdiri tahun 1983 untuk memenuhi kebutuhan pendidikan dasar di wilayah Cempaka Putih, Desa Sukaindah. Didirikan atas inisiatif tokoh masyarakat dan dukungan pemerintah daerah, sekolah ini telah mengalami berbagai transformasi. Tahun 2019 menjadi tonggak penting dengan selesainya pembangunan gedung baru berlantai dua yang modern dan representatif.",
  vision: "Terwujudnya Generasi Pelajar Pancasila Yang Cinta Lingkungan",
  mission: [
    "Membangun kebiasaan tertib beribadah dan 5S (Salam, Senyum, Sapa, Santun dan Sopan)",
    "Meningkatkan mutu lulusan yang sesuai dengan tuntutan masyarakat & perkembangan ilmu pengetahuan dan teknologi (Iptek)",
    "Mewujudkan proses pembelajaran yang aktif kreatif inovatif dan menyenangkan",
    "Meningkatkan mutu pendidikan dalam upaya mencerdaskan kehidupan generasi bermoral, kreatif, maju dan mandiri;",
    "Membina kemandirian peserta didik melalui kegiatan pembiasaan, kewirausahaan, dan pengembangan diri yang terencana dan berkesinambungan",
    "Menciptakan lingkungan sekolah sebagai tempat perkembangan intelektual, sosial, emosional, ketrampilan, dan pengembangan budaya lokal dalam kebhinekaan global.",
  ],
  goals: [
    "Mempertahankan akreditasi B dengan nilai standar pengelolaan minimal 90",
    "Menghasilkan minimal 2 siswa berprestasi di tingkat kabupaten setiap tahunnya",
    "Mewujudkan 100% guru bersertifikat pendidik pada tahun 2025",
    "Mengembangkan program ekstrakurikuler unggulan berbasis potensi lokal",
  ],

  totalStudents: 171, maleStudents: 96, femaleStudents: 75,
  totalTeachers: 10, totalClassrooms: 7, totalStudyGroups: 7,
  gradeStats: [
    { grade: 1, label: "Kelas I.A", total: 19, male: 10, female: 9 },
    { grade: 1, label: "Kelas I.B", total: 19, male: 8, female: 11 },
    { grade: 2, label: "Kelas II", total: 29, male: 17, female: 12 },
    { grade: 3, label: "Kelas III", total: 27, male: 17, female: 10 },
    { grade: 4, label: "Kelas IV", total: 25, male: 16, female: 9 },
    { grade: 5, label: "Kelas V", total: 33, male: 18, female: 15 },
    { grade: 6, label: "Kelas VI", total: 19, male: 10, female: 9 },
  ],

  staff: [
    { name: "Drs. Firmansyah", position: "Wakil Kepala Sekolah", photo: IMG.teacherM2, isVicePrincipal: true },
    { name: "Yuyun Yuningsih, A.Md.", position: "Kepala Tata Usaha", photo: IMG.teacherF2, isAdmin: true },
    { name: "Dadang Suhendar", position: "Staf Administrasi & Keuangan", photo: IMG.teacherM1, isAdmin: true },
  ],
  teachers: [
    { name: "Erti Patmawati, S.Pd", position: "Guru Kelas I.A & I.B", nip: "198203152006042015", photo: IMG.teacherF1 }, 
    { name: "Robiatul Adawiyah, S.Pd.I", position: "Guru Kelas II", nip: "197605222003121004", photo: IMG.teacherM1 },
    { name: "Afnani Arfan, S.Pd", position: "Guru Kelas III", nip: "198909102012012035", photo: IMG.teacherF1 },
    { name: "Sri Rahayu, S.Pd", position: "Guru Kelas IV", nip: "198104202005011014", photo: IMG.teacherM2 },
    { name: "Dian Prapti Handayani, S.Pd", position: "Guru Kelas V", nip: "199006242024212002", photo: IMG.teacherF2 },
    { name: "Junaidi, S.Pd", position: "Guru Kelas VI", nip: "198406142008011002", photo: IMG.teacherM1 },
    { name: "Vera Febriyanti, S.Pd", position: "Guru Kelas VI", nip: "198805262020122009", photo: IMG.teacherM1 },
    { name: "Oom Omaryati, S.Pd", position: "Guru Kelas VI", nip: "196811032008012003", photo: IMG.teacherM1 },/*2 guru lagi belum*/
  ],
  facilities: makeFacilities(4),
  achievements: makeAchievements(4),
  news: makeNews(4),
  gallery: makeGallery(),
};

export const allSchools: SchoolFull[] = [school1, school2, school3, school4];

export function getSchoolBySlug(slug: string): SchoolFull | undefined {
  return allSchools.find((s) => s.slug === slug);
}

export function getSchoolById(id: number): SchoolFull | undefined {
  return allSchools.find((s) => s.id === id);
}
