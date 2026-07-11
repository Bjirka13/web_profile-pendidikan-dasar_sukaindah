import { useMemo, useState } from "react";
import { Users, GraduationCap, School, BookOpen, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Card, CardContent } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { type SchoolFull } from "../data/schools";
import { useSchoolCms } from "../cms/school-cms";

const SEMESTER_OPTIONS = [
  "2025/2026 Ganjil",
  "2025/2026 Genap",
] as const;

type SemesterKey = (typeof SEMESTER_OPTIONS)[number];

interface StatsAggregate {
  totalSchools: number;
  totalStudents: number;
  totalTeachers: number;
  totalClassrooms: number;
  totalStudyGroups: number;
  maleStudents: number;
  femaleStudents: number;
  gradeStats: Array<{ label: string; male: number; female: number }>;
}

function normalizeGradeLabel(label: string): string {
  return label.replace(/\s*\.\s*[A-Z]$/i, "").trim();
}

function aggregateSchoolStats(schools: SchoolFull[]): StatsAggregate {
  const gradeMap = new Map<string, { label: string; male: number; female: number }>();

  const totals = schools.reduce(
    (acc, school) => {
      acc.totalStudents += school.totalStudents;
      acc.maleStudents += school.maleStudents;
      acc.femaleStudents += school.femaleStudents;
      acc.totalTeachers += school.totalTeachers;
      acc.totalClassrooms += school.totalClassrooms;
      acc.totalStudyGroups += school.totalStudyGroups;

      school.gradeStats.forEach((grade) => {
        const normalizedLabel = normalizeGradeLabel(grade.label);
        const existing = gradeMap.get(normalizedLabel);
        if (existing) {
          existing.male += grade.male;
          existing.female += grade.female;
        } else {
          gradeMap.set(normalizedLabel, { label: normalizedLabel, male: grade.male, female: grade.female });
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
      gradeStats: [] as Array<{ label: string; male: number; female: number }>,
    } satisfies StatsAggregate
  );

  totals.gradeStats = Array.from(gradeMap.values()).sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
  return totals;
}

const PIE_COLORS = ["#1e6b3a", "#e8b800"];

export function StatsSection() {
  const { schools } = useSchoolCms();
  const [selectedSemester, setSelectedSemester] = useState<SemesterKey>(SEMESTER_OPTIONS[0]);
  const SEMESTER_STATS = useMemo<Record<SemesterKey, StatsAggregate>>(
    () => ({
      "2025/2026 Ganjil": aggregateSchoolStats(schools),
      "2025/2026 Genap": aggregateSchoolStats(schools),
    }),
    [schools]
  );
  const semester = SEMESTER_STATS[selectedSemester as SemesterKey];
  const pieData = [
    { name: "Laki-laki", value: semester.maleStudents },
    { name: "Perempuan", value: semester.femaleStudents },
  ];

  const barData = semester.gradeStats.map((item) => ({
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
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <p className="text-accent font-semibold uppercase tracking-[0.3em] mb-3">Statistik</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">Ringkasan Data Pendidikan</h2>
            <p className="mt-4 text-gray-600 max-w-2xl">
              Visualisasi data per semester untuk sekolah dasar di Desa Sukaindah.
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
          {cards.map((card, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-gray-100 ${card.color}`}>
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
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Jumlah Siswa per Kelas</h3>
                  <p className="text-sm text-muted-foreground mt-1">Data semester {selectedSemester}</p>
                </div>
              </div>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 8, left: -18, bottom: 5 }}>
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
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Distribusi Gender Siswa</h3>
                  <p className="text-sm text-muted-foreground mt-1">Semester {selectedSemester}</p>
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
              <div className="mt-4 text-sm font-semibold text-foreground">Total Siswa: {semester.totalStudents.toLocaleString("id")}</div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {pieData.map((item, index) => (
                  <div key={item.name} className="rounded-2xl bg-gray-50 p-4 flex items-center gap-3 shadow-sm">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }} />
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{Math.round((item.value / semester.totalStudents) * 100)}% dari total</p>
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
