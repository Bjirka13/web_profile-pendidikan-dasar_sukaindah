import { School } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg">Portal Pendidikan Dasar</h1>
              <p className="text-sm text-gray-600">Desa Sukaindah</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
