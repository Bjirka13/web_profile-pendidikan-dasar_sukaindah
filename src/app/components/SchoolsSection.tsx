import { useState } from "react";
import { MapPin, User, Phone, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { SchoolDetailDialog } from "./SchoolDetailDialog";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export interface School {
  id: string;
  name: string;
  address: string;
  principal: string;
  contact: string;
  npsn: string;
  status: string;
  akreditasi: string;
  students: number;
  teachers: number;
  image: string;
}

const schools: School[] = [
  {
    id: "1",
    name: "SDN 1 Sukaindah",
    address: "Jl. Raya Sukaindah No. 12, RT 01/RW 02",
    principal: "Ranih Usnani, S.Pd",
    contact: "0812-3456-7890",
    npsn: "20218491",
    status: "Negeri",
    akreditasi: "A",
    students: 240,
    teachers: 15,
    image: "https://images.unsplash.com/photo-1613896527026-f195d5c818ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvbmVzaWFuJTIwc2Nob29sJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzgyNjM5NzIyfDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "2",
    name: "SDN 2 Sukaindah",
    address: "Jl. Melati No. 45, RT 03/RW 04",
    principal: "Ahmad Dahlan, S.Pd",
    contact: "0813-4567-8901",
    npsn: "20123457",
    status: "Negeri",
    akreditasi: "B",
    students: 180,
    teachers: 12,
    image: "https://images.unsplash.com/photo-1613896527026-f195d5c818ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvbmVzaWFuJTIwc2Nob29sJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzgyNjM5NzIyfDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "3",
    name: "SDN 3 Sukaindah",
    address: "Jl. Mawar No. 78, RT 05/RW 06",
    principal: "Kartini Wijaya, S.Pd",
    contact: "0814-5678-9012",
    npsn: "20123458",
    status: "Negeri",
    akreditasi: "A",
    students: 210,
    teachers: 14,
    image: "https://images.unsplash.com/photo-1613896527026-f195d5c818ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvbmVzaWFuJTIwc2Nob29sJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzgyNjM5NzIyfDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "4",
    name: "SDN 4 Sukaindah",
    address: "Jl. Anggrek No. 23, RT 07/RW 08",
    principal: "Niman Gunawan, M.Pd",
    contact: "0815-6789-0123",
    npsn: "20123459",
    status: "Negeri",
    akreditasi: "B",
    students: 90,
    teachers: 7,
    image: "https://images.unsplash.com/photo-1613896527026-f195d5c818ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvbmVzaWFuJTIwc2Nob29sJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzgyNjM5NzIyfDA&ixlib=rb-4.1.0&q=80&w=1080"
  }
];

export function SchoolsSection() {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDetail = (school: School) => {
    setSelectedSchool(school);
    setIsDialogOpen(true);
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="mb-4">Sekolah Dasar di Desa Sukaindah</h2>
          <p className="text-gray-600">
            Informasi lengkap 4 sekolah dasar yang ada di Desa Sukaindah
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {schools.map((school) => (
            <Card key={school.id} className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 overflow-hidden">
                <ImageWithFallback
                  src={school.image}
                  alt={school.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{school.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                  <span className="text-gray-700">{school.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 flex-shrink-0 text-gray-500" />
                  <span className="text-gray-700">{school.principal}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 flex-shrink-0 text-gray-500" />
                  <span className="text-gray-700">{school.contact}</span>
                </div>
                <Button
                  onClick={() => handleOpenDetail(school)}
                  variant="outline"
                  className="w-full mt-4"
                >
                  <Info className="w-4 h-4 mr-2" />
                  Detail
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <SchoolDetailDialog
        school={selectedSchool}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </section>
  );
}
