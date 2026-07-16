import { useMemo, useState } from "react";
import { BookOpen, Clock, GraduationCap, School, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { type SchoolFull } from "../data/schools";
import { useSchoolCms } from "../cms/school-cms";

const SEMESTER_OPTIONS = ["2025/2026 Ganjil", "2025/2026 Genap"] as const;
type SemesterKey = (typeof SEMESTER_OPTIONS)[number];
const PIE_COLORS = ["#1e6b3a", "#e8b800"];

interface StatsAggregate {
  totalSchools: number;
  totalStudents: number;
  totalTeachers: number;
  totalClassrooms: number;
  totalStudyGroups: number;
  maleStudents: number;
  femaleStudents: number;
  roleStats: Array<{ label: string; male: number; female: number }>;
}

function classroomCount(school: SchoolFull): number {
  return school.totalClassrooms || school.facilities.find((facility) => facility.name.toLowerCase() === "ruang kelas")?.count || 0;
}

function aggregateSchoolStats(schools: SchoolFull[]): StatsAggregate {
  const roleMap = new Map<string, { label: string; male: number; female: number }>();

  const totals = schools.reduce(
    (acc, school) => {
      acc.totalStudents += school.totalStudents;
      acc.maleStudents += school.maleStudents;
      acc.femaleStudents += school.femaleStudents;
      acc.totalTeachers += school.totalTeachers;
      acc.totalClassrooms += classroomCount(school);
      acc.totalStudyGroups += school.totalStudyGroups;

      school.roleStats.forEach((role) => {
        const label = role.role === "guru" ? "Guru" : role.role === "tenaga_didik" ? "Tendik" : "Peserta Didik";
        const existing = roleMap.get(label);
        if (existing) {
          existing.male += role.male;
          existing.female += role.female;
        } else {
          roleMap.set(label, { label, male: role.male, female: role.female });
        }
      });

      return acc;
    },
    {
      totalSchools: schools.length,
      totalStudents: 0,
      totalTeachers: 0,
      totalClassrooms: 0,
      totalStudyGroups: 0,
      maleStudents: 0,
      femaleStudents: 0,
      roleStats: [] as Array<{ label: string; male: number; female: number }>,
    } satisfies StatsAggregate
  );

  totals.roleStats = Array.from(roleMap.values()).sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
  return totals;
}

export function StatsSection() {
  const { schools } = useSchoolCms();
  const [selectedSemester, setSelectedSemester] = useState<SemesterKey>(SEMESTER_OPTIONS[0]);
  const semesterStats = useMemo<Record<SemesterKey, StatsAggregate>>(
    () => ({
      "2025/2026 Ganjil": aggregateSchoolStats(schools),
      "2025/2026 Genap": aggregateSchoolStats(schools),
    }),
    [schools]
  );

  const semester = semesterStats[selectedSemester];
  const pieData = [
    { name: "Laki-laki", value: semester.maleStudents },
    { name: "Perempuan", value: semester.femaleStudents },
  ];

  const roleData = semester.roleStats.map((item) => ({
    label: item.label,
    male: item.male,
    female: item.female,
  }));

  const cards = [
    { icon: School, label: "Sekolah Dasar", value: semester.totalSchools.toString(), color: "text-blue-600" },
    { icon: Users, label: "Total Siswa", value: semester.totalStudents.toLocaleString("id"), color: "text-green-600" },
    { icon: GraduationCap, label: "Total Guru", value: semester.totalTeachers.toString(), color: "text-purple-600" },
    { icon: BookOpen, label: "Total Rombel", value: semester.totalStudyGroups.toString(), color: "text-teal-600" },
    { icon: Clock, label: "Ruang Kelas", value: semester.totalClassrooms.toString(), color: "text-orange-600" },
  ];

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-amber-100 bg-white/80 px-5 py-6 shadow-[0_24px_80px_-30px_rgba(16,24,40,0.22)] backdrop-blur md:px-8 md:py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(232,184,0,0.12),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.10),_transparent_25%)]" />
      <div className="relative">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <p className="text-amber-700 font-semibold uppercase tracking-[0.3em] mb-3">Statistik</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">Ringkasan Data Pendidikan</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl">
              Visualisasi data dari tabel `schools` dan `school_role_stats`.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedSemester} onValueChange={(value: string) => setSelectedSemester(value as SemesterKey)}>
              <SelectTrigger size="sm" className="w-56">
                <SelectValue>{selectedSemester}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SEMESTER_OPTIONS.map((semesterKey) => (
                  <SelectItem key={semesterKey} value={semesterKey}>
                    {semesterKey}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-10">
          {cards.map((card, index) => (
            <Card
              key={index}
              className="overflow-hidden border border-amber-100/80 bg-white/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-500" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-amber-50 ${card.color}`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {selectedSemester.includes("Ganjil") ? "Ganjil" : "Genap"}
                  </span>
                </div>
                <div className="text-3xl font-extrabold mb-2">{card.value}</div>
                <div className="text-sm text-muted-foreground">{card.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="overflow-hidden border border-amber-100 bg-white/90 shadow-sm transition-all duration-300 hover:shadow-xl">
            <div className="h-1 bg-gradient-to-r from-amber-500 to-yellow-400" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Komposisi Peran Warga Sekolah</h3>
                  <p className="text-sm text-muted-foreground mt-1">Data dari tabel `school_role_stats`</p>
                </div>
              </div>
              <div className="h-[320px]">
                {roleData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roleData} margin={{ top: 10, right: 8, left: -18, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, fontSize: 13, border: "1px solid rgba(0,0,0,0.1)" }}
                        formatter={(value: number, name: string) => [value, name === "male" ? "Laki-laki" : "Perempuan"]}
                      />
                      <Bar dataKey="male" name="Laki-laki" stackId="a" fill="#1e6b3a" barSize={24} radius={[0, 0, 0, 0]} />
                      <Bar dataKey="female" name="Perempuan" stackId="a" fill="#e8b800" barSize={24} radius={[0, 0, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
                    Belum ada data role.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-amber-100 bg-white/90 shadow-sm transition-all duration-300 hover:shadow-xl">
            <div className="h-1 bg-gradient-to-r from-yellow-400 to-amber-500" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Distribusi Gender Siswa</h3>
                  <p className="text-sm text-muted-foreground mt-1">Data dari kolom total siswa</p>
                </div>
              </div>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13, border: "1px solid rgba(0,0,0,0.1)" }} formatter={(value: number) => [`${value} siswa`, ""]} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/60 px-4 py-3 text-sm font-semibold text-foreground">
                Total Siswa: {semester.totalStudents.toLocaleString("id")}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {pieData.map((item, index) => (
                  <div
                    key={item.name}
                    className="rounded-2xl border border-amber-100 bg-white px-4 py-4 flex items-center gap-3 shadow-sm"
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }} />
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{semester.totalStudents > 0 ? Math.round((item.value / semester.totalStudents) * 100) : 0}% dari total</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
