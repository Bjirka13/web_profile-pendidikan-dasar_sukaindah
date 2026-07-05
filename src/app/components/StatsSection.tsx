import { Users, GraduationCap, School } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export function StatsSection() {
  const stats = [
    {
      icon: School,
      label: "Sekolah Dasar",
      value: "4",
      color: "text-blue-600"
    },
    {
      icon: Users,
      label: "Total Siswa",
      value: "720",
      color: "text-green-600"
    },
    {
      icon: GraduationCap,
      label: "Total Guru",
      value: "48",
      color: "text-purple-600"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="mb-4">Data Pendidikan Desa Sukaindah</h2>
          <p className="text-gray-600">
            Ringkasan statistik pendidikan dasar di Desa Sukaindah
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-full bg-gray-100 ${stat.color}`}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                </div>
                <div className="text-4xl mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
