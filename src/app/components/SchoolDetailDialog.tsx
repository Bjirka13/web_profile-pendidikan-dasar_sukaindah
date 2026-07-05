import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { School } from "./SchoolsSection";
import { Building2, Award, Users, GraduationCap, MapPin, Phone, User } from "lucide-react";

interface SchoolDetailDialogProps {
  school: School | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SchoolDetailDialog({ school, open, onOpenChange }: SchoolDetailDialogProps) {
  if (!school) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{school.name}</DialogTitle>
          <DialogDescription>Informasi lengkap sekolah</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* NPSN Section */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg">Identitas Sekolah</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">NPSN</p>
                <p>{school.npsn}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Status</p>
                <p>{school.status}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Akreditasi</p>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <p>{school.akreditasi}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Phone className="w-5 h-5 text-green-600" />
              <h3 className="text-lg">Informasi Kontak</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                <div>
                  <p className="text-gray-600 mb-1">Alamat</p>
                  <p>{school.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 flex-shrink-0 text-gray-500" />
                <div>
                  <p className="text-gray-600 mb-1">Kepala Sekolah</p>
                  <p>{school.principal}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0 text-gray-500" />
                <div>
                  <p className="text-gray-600 mb-1">Nomor Telepon</p>
                  <p>{school.contact}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg">Statistik</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl mb-1">{school.students}</p>
                <p className="text-sm text-gray-600">Siswa</p>
              </div>
              <div className="bg-white p-3 rounded-lg text-center">
                <GraduationCap className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <p className="text-2xl mb-1">{school.teachers}</p>
                <p className="text-sm text-gray-600">Guru</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
