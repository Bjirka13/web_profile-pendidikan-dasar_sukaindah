import { useState } from "react";
import { MapPin, User, Phone, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { SchoolDetailDialog } from "./SchoolDetailDialog";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { SchoolFull } from "../data/schools";

interface SchoolsSectionProps {
  schools: SchoolFull[];
}

export function SchoolsSection({ schools }: SchoolsSectionProps) {
  const [selectedSchool, setSelectedSchool] = useState<SchoolFull | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDetail = (school: SchoolFull) => {
    setSelectedSchool(school);
    setIsDialogOpen(true);
  };

  const displaySchools = schools ?? [];

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
          {displaySchools.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-4">
              <Card className="border-dashed border-muted-foreground/30 bg-muted/20">
                <CardContent className="flex min-h-48 items-center justify-center">
                  <p className="text-center text-muted-foreground">Data kosong</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            displaySchools.map((school) => (
              <Card key={school.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 overflow-hidden">
                  <ImageWithFallback
                    src={school.cardImage || school.heroImage}
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
                    <span className="text-gray-700">{school.address || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 flex-shrink-0 text-gray-500" />
                    <span className="text-gray-700">{school.principal?.name || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 flex-shrink-0 text-gray-500" />
                    <span className="text-gray-700">{school.contact || "-"}</span>
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
            ))
          )}
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
