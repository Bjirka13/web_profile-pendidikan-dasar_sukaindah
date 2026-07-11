import { useEffect, useRef, useState, type ChangeEvent, type ComponentType, type FormEvent, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  ArrowLeft,
  Building2,
  Camera,
  ClipboardList,
  Eye,
  FileText,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  LogIn,
  LogOut,
  Trash2,
  Users,
  GraduationCap,
  School,
  BadgeCheck,
} from "lucide-react";
import { Footer, Navbar } from "../components/Layout";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { cloneSchoolData, useSchoolCms } from "../cms/school-cms";
import type { SchoolFull } from "../data/schools";
import { schoolImageAssets } from "../../image";

const font = "'Plus Jakarta Sans', sans-serif";

function Field({
  label,
  children,
  hint,
  className = "",
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={`block space-y-2 ${className}`}>
      <div className="flex items-end justify-between gap-3">
        <span className="text-sm font-semibold text-foreground" style={{ fontFamily: font }}>
          {label}
        </span>
        {hint && (
          <span className="text-[11px] text-muted-foreground" style={{ fontFamily: font }}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </label>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: ComponentType<{ className?: string }>; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h2 className="text-xl font-extrabold text-foreground" style={{ fontFamily: font }}>{title}</h2>
        <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: font }}>{subtitle}</p>
      </div>
    </div>
  );
}

function ListEditor({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const updateItem = (index: number, nextValue: string) => {
    const next = [...value];
    next[index] = nextValue;
    onChange(next);
  };

  const addItem = () => onChange([...value, ""]);
  const removeItem = (index: number) => onChange(value.filter((_, itemIndex) => itemIndex !== index));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-foreground" style={{ fontFamily: font }}>{label}</span>
        <Button type="button" size="sm" variant="secondary" onClick={addItem}>
          <Plus className="w-4 h-4" /> Tambah
        </Button>
      </div>
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={`${label}-${index}`} className="flex items-center gap-2">
            <Input
              value={item}
              onChange={(event) => updateItem(index, event.target.value)}
              placeholder={placeholder}
            />
            <Button type="button" size="icon" variant="outline" onClick={() => removeItem(index)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BooleanPill({
  value,
  onToggle,
  label,
}: {
  value: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        value ? "bg-primary text-white" : "bg-secondary text-primary"
      }`}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${value ? "bg-white" : "bg-primary"}`} />
      {label}
    </button>
  );
}

function ArrayHeader({
  title,
  subtitle,
  onAdd,
}: {
  title: string;
  subtitle: string;
  onAdd: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-foreground" style={{ fontFamily: font }}>{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: font }}>{subtitle}</p>
      </div>
      <Button type="button" size="sm" variant="secondary" onClick={onAdd}>
        <Plus className="w-4 h-4" /> Tambah
      </Button>
    </div>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" size="icon" variant="outline" onClick={onClick}>
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}

function ArrayCard({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">{children}</div>;
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
}

function ImageUploadField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
    } catch (error) {
      console.error(error);
      window.alert("Gagal membaca gambar.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <span className="text-sm font-semibold text-foreground" style={{ fontFamily: font }}>
          {label}
        </span>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Tempel URL gambar atau upload file"
          />
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
            Upload
          </Button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>
        {value ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-muted/30">
            <img src={value} alt={label} className="h-40 w-full object-cover" loading="lazy" />
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-xs text-muted-foreground">
            Belum ada gambar.
          </div>
        )}
      </div>
    </div>
  );
}

function schoolSummary(school: SchoolFull) {
  return [
    { label: "Siswa", value: school.totalStudents, icon: Users },
    { label: "Guru", value: school.totalTeachers, icon: GraduationCap },
    { label: "Rombel", value: school.totalStudyGroups, icon: School },
  ];
}

function createEmptyStaff(): SchoolFull["staff"][number] {
  return {
    name: "",
    position: "",
    photo: schoolImageAssets.blank,
    isAdmin: false,
    isVicePrincipal: false,
  };
}

function createEmptyTeacher(): SchoolFull["teachers"][number] {
  return {
    name: "",
    position: "",
    nip: "",
    photo: schoolImageAssets.blank,
  };
}

function createEmptyFacility(): SchoolFull["facilities"][number] {
  return {
    name: "",
    description: "",
    photo: schoolImageAssets.blank,
    icon: "🏫",
    count: 1,
  };
}

function createEmptyAchievement(): SchoolFull["achievements"][number] {
  return {
    title: "",
    year: "",
    level: "",
    description: "",
    photo: schoolImageAssets.blank,
  };
}

function createEmptyNewsItem(): SchoolFull["news"][number] {
  return {
    id: Date.now(),
    title: "",
    date: "",
    excerpt: "",
    thumbnail: schoolImageAssets.blank,
    category: "Kegiatan",
  };
}

function createEmptyGalleryItem(): SchoolFull["gallery"][number] {
  return {
    photo: schoolImageAssets.blank,
    caption: "",
  };
}

export default function Admin() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    schools,
    adminSession,
    saveSchool,
    syncSchoolsToSupabase,
    isSupabaseEnabled,
    login,
    logout,
  } = useSchoolCms();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<SchoolFull | null>(null);
  const [dirty, setDirty] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authUsername, setAuthUsername] = useState("ops1");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    if (!adminSession) return;

    const matched = schools.find((school) => school.id === adminSession.schoolId);
    if (matched) {
      setSelectedId(matched.id);
      setSearchParams({ school: matched.slug });
    }
  }, [adminSession, schools, setSearchParams]);

  useEffect(() => {
    if (!adminSession) return;
    if (selectedId === adminSession.schoolId) return;
    setSelectedId(adminSession.schoolId);
  }, [adminSession, selectedId]);

  useEffect(() => {
    if (adminSession) return;

    const idParam = searchParams.get("school");
    if (idParam) {
      const matchedBySlug = schools.find((school) => school.slug === idParam);
      const matchedById = Number.isFinite(Number(idParam))
        ? schools.find((school) => school.id === Number(idParam))
        : undefined;
      const selected = matchedBySlug || matchedById;
      if (selected) {
        setSelectedId(selected.id);
        return;
      }
    }

    if (selectedId === null && schools.length > 0) {
      setSelectedId(schools[0].id);
    }
  }, [adminSession, schools, searchParams, selectedId]);

  useEffect(() => {
    const school = selectedId ? schools.find((item) => item.id === selectedId) : undefined;
    setDraft(school ? cloneSchoolData(school) : null);
    setDirty(false);
  }, [schools, selectedId]);

  const selectedSchool = draft;

  const stats = [
    { label: "Total Sekolah", value: schools.length.toString(), icon: Building2 },
    { label: "Total Siswa", value: schools.reduce((acc, school) => acc + school.totalStudents, 0).toLocaleString("id"), icon: Users },
    { label: "Total Guru", value: schools.reduce((acc, school) => acc + school.totalTeachers, 0).toString(), icon: GraduationCap },
  ];

  const updateDraft = (patch: Partial<SchoolFull>) => {
    if (!selectedSchool) return;
    setDraft({ ...selectedSchool, ...patch });
    setDirty(true);
  };

  const replaceArrayItem = <T,>(key: keyof Pick<SchoolFull, "staff" | "teachers" | "facilities" | "achievements" | "news" | "gallery">, index: number, nextItem: T) => {
    if (!selectedSchool) return;
    const current = [...selectedSchool[key]] as T[];
    current[index] = nextItem;
    updateDraft({ [key]: current } as Partial<SchoolFull>);
  };

  const addArrayItem = <T,>(key: keyof Pick<SchoolFull, "staff" | "teachers" | "facilities" | "achievements" | "news" | "gallery">, item: T) => {
    if (!selectedSchool) return;
    updateDraft({ [key]: [...selectedSchool[key], item] } as Partial<SchoolFull>);
  };

  const removeArrayItem = (key: keyof Pick<SchoolFull, "staff" | "teachers" | "facilities" | "achievements" | "news" | "gallery">, index: number) => {
    if (!selectedSchool) return;
    updateDraft({
      [key]: selectedSchool[key].filter((_, itemIndex) => itemIndex !== index),
    } as Partial<SchoolFull>);
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);
    setAuthenticating(true);
    try {
      const session = await login(authUsername, authPassword);
      setSelectedId(session.schoolId);
      setSearchParams({ school: session.schoolSlug });
      setAuthPassword("");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Login gagal.");
    } finally {
      setAuthenticating(false);
    }
  };

  const handleLogout = () => {
    logout();
    setSelectedId(null);
    setDraft(null);
    setDirty(false);
    setSearchParams({});
  };

  const handleSave = async () => {
    if (!selectedSchool) return;
    setSaving(true);
    try {
      saveSchool(selectedSchool);
      setSelectedId(selectedSchool.id);
      setSearchParams((current) => {
        current.set("school", selectedSchool.slug);
        return current;
      });
      setDirty(false);
      window.alert("Perubahan berhasil disimpan di proyek.");
    } catch (error) {
      console.error(error);
      window.alert("Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  const handleSyncSupabase = async () => {
    if (!isSupabaseEnabled) {
      window.alert("Supabase belum dikonfigurasi di frontend.");
      return;
    }

    setSyncing(true);
    try {
      await syncSchoolsToSupabase(selectedSchool ? [selectedSchool.id] : undefined);
      window.alert("Data sekolah berhasil disinkronkan ke Supabase.");
    } catch (error) {
      console.error(error);
      window.alert("Sinkronisasi Supabase gagal. Cek konfigurasi tabel dan policy.");
    } finally {
      setSyncing(false);
    }
  };

  if (!adminSession) {
    return (
      <div className="min-h-screen bg-background" style={{ fontFamily: font }}>
        <Navbar />
        <main className="relative overflow-hidden">
          <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(30,107,58,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(232,184,0,0.18),_transparent_30%),linear-gradient(135deg,#0f172a_0%,#1e293b_55%,#f5f1e8_100%)]">
            <div className="absolute inset-0 opacity-15 bg-[url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1600&auto=format&fit=crop')] bg-cover bg-center" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-white">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_minmax(0,420px)] lg:items-center">
                <div className="max-w-2xl space-y-5">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.35em] backdrop-blur-sm">
                    CMS Admin
                  </span>
                  <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                    Login admin cuma untuk sekolah yang ditugaskan.
                  </h1>
                  <p className="max-w-xl text-white/75 text-base md:text-lg">
                    Akun <strong>ops1</strong> sampai <strong>ops4</strong> masing-masing dikunci ke 1 sekolah.
                    Setelah login, admin cuma bisa edit data sekolahnya sendiri, termasuk berita, galeri, dan konten lain.
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {["ops1 -> SDN 1", "ops2 -> SDN 2", "ops3 -> SDN 3", "ops4 -> SDN 4"].map((item) => (
                      <span key={item} className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <Card className="border-border/80 bg-white/95 shadow-2xl text-foreground">
                  <CardContent className="p-6 md:p-8 space-y-5">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold">Masuk Admin</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Gunakan username ops dan password masing-masing akun.
                        </p>
                      </div>
                    </div>

                    <form className="space-y-4" onSubmit={handleLogin}>
                      <Field label="Username">
                        <Input value={authUsername} onChange={(event) => setAuthUsername(event.target.value)} placeholder="ops1" autoComplete="username" />
                      </Field>
                      <Field label="Password">
                        <Input
                          type="password"
                          value={authPassword}
                          onChange={(event) => setAuthPassword(event.target.value)}
                          placeholder="ops1-2026"
                          autoComplete="current-password"
                        />
                      </Field>

                      {authError && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                          {authError}
                        </div>
                      )}

                      <Button type="submit" className="w-full" disabled={authenticating}>
                        <LogIn className="w-4 h-4" />
                        {authenticating ? "Memproses..." : "Masuk ke Admin"}
                      </Button>
                    </form>

                    <div className="rounded-2xl bg-muted/70 p-4 text-sm text-muted-foreground space-y-2">
                      <p className="font-semibold text-foreground">Catatan akun</p>
                      <p>ops1 = SDN Sukaindah 01</p>
                      <p>ops2 = SDN Sukaindah 02</p>
                      <p>ops3 = SDN Sukaindah 03</p>
                      <p>ops4 = SDN Sukaindah 04</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: font }}>
      <Navbar />

      <main className="pb-16">
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(30,107,58,0.28),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(34,197,94,0.16),_transparent_26%),linear-gradient(135deg,#0f2f1f_0%,#1e6b3a_58%,#f4faf5_100%)]">
          <div className="absolute inset-0 bg-gradient-to-b from-green-950/70 via-green-950/30 to-transparent" />
          <div className="absolute inset-0 opacity-8 bg-[url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1600&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-white">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.35em] backdrop-blur-sm">
                  CMS Admin
                </span>
                <h1 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight">
                  Panel Admin
                </h1>
                <p className="mt-5 max-w-2xl text-white/75 text-base md:text-lg">
                  Edit profil sekolah, statistik, dan konten utama
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Badge variant={isSupabaseEnabled ? "default" : "secondary"}>
                    {isSupabaseEnabled ? "Supabase aktif" : "Supabase belum aktif"}
                  </Badge>
                  <Badge variant="secondary" className="gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    {adminSession.username} {"->"} {adminSession.schoolName}
                  </Badge>
                  <Button type="button" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" onClick={handleSyncSupabase} disabled={syncing}>
                    <RefreshCw className="w-4 h-4" />
                    {syncing ? "Menyinkronkan..." : "Sync Supabase"}
                  </Button>
                  <Button type="button" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {stats.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent text-foreground flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-extrabold leading-none">{value}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/65 mt-1">{label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-10">
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <Card className="border-border/80 shadow-xl overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-foreground" style={{ fontFamily: font }}>Sekolah Aktif</h2>
                    <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: font }}>Data hanya untuk sekolah yang ditugaskan ke akun ini</p>
                  </div>
                  <Button type="button" size="icon" variant="outline" onClick={() => navigate("/")}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>

                {selectedSchool ? (
                <div className="rounded-3xl border border-border bg-gradient-to-b from-emerald-50 to-white p-4 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-foreground" style={{ fontFamily: font }}>{selectedSchool.name}</p>
                        <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: font }}>{selectedSchool.slug}</p>
                      </div>
                      <Badge variant={selectedSchool.accreditation === "A" ? "default" : "secondary"}>
                        {selectedSchool.accreditation}
                      </Badge>
                    </div>
                    <div className="grid gap-2 text-sm text-muted-foreground">
                      <p>{selectedSchool.npsn}</p>
                      <p>{selectedSchool.address}</p>
                      <p>{selectedSchool.kecamatan}, {selectedSchool.desa}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {schoolSummary(selectedSchool).map((item) => (
                        <span key={item.label} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] text-primary font-semibold">
                          <item.icon className="w-3.5 h-3.5" />
                          {item.value}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    Sekolah aktif belum tersedia.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/80 shadow-xl">
              <CardContent className="p-5 md:p-6">
                {!selectedSchool ? (
                  <div className="rounded-3xl border border-dashed border-border p-10 text-center">
                    <ClipboardList className="mx-auto w-12 h-12 text-muted-foreground" />
                    <p className="mt-4 text-lg font-bold text-foreground">Sekolah aktif belum tersedia</p>
                    <p className="mt-2 text-sm text-muted-foreground">Login ulang atau cek mapping akun ke sekolah di Supabase.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between mb-6">
                      <SectionTitle
                        icon={Building2}
                        title={selectedSchool.name}
                        subtitle="Ubah data utama yang tampil di halaman publik"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <Button type="button" variant="outline" onClick={() => navigate(`/sekolah/${selectedSchool.slug}`)}>
                          <Eye className="w-4 h-4" /> Preview
                        </Button>
                        <Button type="button" onClick={handleSave} disabled={!dirty || saving}>
                          <Save className="w-4 h-4" /> Simpan
                        </Button>
                      </div>
                    </div>

                    <Tabs defaultValue="profile" className="gap-4">
                      <TabsList className="w-full h-auto flex-wrap justify-start bg-muted p-1">
                        <TabsTrigger value="profile" className="flex-1 min-w-28">Profil</TabsTrigger>
                        <TabsTrigger value="content" className="flex-1 min-w-28">Konten</TabsTrigger>
                        <TabsTrigger value="achievement" className="flex-1 min-w-28">Prestasi</TabsTrigger>
                        <TabsTrigger value="news" className="flex-1 min-w-28">Berita</TabsTrigger>
                        <TabsTrigger value="collection" className="flex-1 min-w-28">Koleksi</TabsTrigger>
                        <TabsTrigger value="stats" className="flex-1 min-w-28">Statistik</TabsTrigger>
                      </TabsList>

                      <TabsContent value="profile" className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="Nama Sekolah">
                            <Input value={selectedSchool.name} onChange={(event) => updateDraft({ name: event.target.value })} />
                          </Field>
                          <Field label="Slug URL" hint="Dipakai untuk detail page">
                            <Input value={selectedSchool.slug} onChange={(event) => updateDraft({ slug: event.target.value })} />
                          </Field>
                          <Field label="Nama Singkat">
                            <Input value={selectedSchool.shortName} onChange={(event) => updateDraft({ shortName: event.target.value })} />
                          </Field>
                          <Field label="NPSN">
                            <Input value={selectedSchool.npsn} onChange={(event) => updateDraft({ npsn: event.target.value })} />
                          </Field>
                          <Field label="Tagline">
                            <Input value={selectedSchool.tagline} onChange={(event) => updateDraft({ tagline: event.target.value })} />
                          </Field>
                          <Field label="Status">
                            <Input value={selectedSchool.status} onChange={(event) => updateDraft({ status: event.target.value })} />
                          </Field>
                          <Field label="Akreditasi">
                            <Input value={selectedSchool.accreditation} onChange={(event) => updateDraft({ accreditation: event.target.value })} />
                          </Field>
                          <Field label="Tahun Berdiri">
                            <Input value={selectedSchool.yearEstablished} onChange={(event) => updateDraft({ yearEstablished: event.target.value })} />
                          </Field>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="Alamat">
                            <Textarea value={selectedSchool.address} onChange={(event) => updateDraft({ address: event.target.value })} />
                          </Field>
                          <Field label="Kode Pos">
                            <Input value={selectedSchool.kodePos} onChange={(event) => updateDraft({ kodePos: event.target.value })} />
                          </Field>
                          <Field label="Kecamatan">
                            <Input value={selectedSchool.kecamatan} onChange={(event) => updateDraft({ kecamatan: event.target.value })} />
                          </Field>
                          <Field label="Desa">
                            <Input value={selectedSchool.desa} onChange={(event) => updateDraft({ desa: event.target.value })} />
                          </Field>
                          <Field label="Kontak">
                            <Input value={selectedSchool.contact} onChange={(event) => updateDraft({ contact: event.target.value })} />
                          </Field>
                          <Field label="Email">
                            <Input value={selectedSchool.email} onChange={(event) => updateDraft({ email: event.target.value })} />
                          </Field>
                          <ImageUploadField
                            label="Hero Image"
                            value={selectedSchool.heroImage}
                            onChange={(next) => updateDraft({ heroImage: next })}
                            hint="Upload atau tempel URL"
                          />
                          <ImageUploadField
                            label="Card Image"
                            value={selectedSchool.cardImage}
                            onChange={(next) => updateDraft({ cardImage: next })}
                          />
                          <Field label="Maps Embed URL" className="md:col-span-2">
                            <Textarea value={selectedSchool.mapsEmbed} onChange={(event) => updateDraft({ mapsEmbed: event.target.value })} />
                          </Field>
                        </div>
                      </TabsContent>

                      <TabsContent value="content" className="space-y-5">
                        <div className="rounded-3xl border border-border bg-muted/20 p-5">
                          <div className="flex items-start gap-3">
                            <BadgeCheck className="w-5 h-5 text-primary mt-0.5" />
                            <div className="space-y-2">
                              <p className="font-semibold text-foreground">Konten CMS</p>
                              <p className="text-sm text-muted-foreground">
                                Bagian ini murni dari admin CMS: kepala sekolah, sejarah, visi, misi, tujuan, staff, guru, prestasi, berita, dan galeri.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
                          <div className="space-y-4">
                            <Field label="Nama Kepala Sekolah">
                              <Input
                                value={selectedSchool.principal.name}
                                onChange={(event) =>
                                  updateDraft({
                                    principal: { ...selectedSchool.principal, name: event.target.value },
                                  })
                                }
                              />
                            </Field>
                            <Field label="Jabatan">
                              <Input
                                value={selectedSchool.principal.position}
                                onChange={(event) =>
                                  updateDraft({
                                    principal: { ...selectedSchool.principal, position: event.target.value },
                                  })
                                }
                              />
                            </Field>
                            <Field label="NIP">
                              <Input
                                value={selectedSchool.principal.nip ?? ""}
                                onChange={(event) =>
                                  updateDraft({
                                    principal: { ...selectedSchool.principal, nip: event.target.value || undefined },
                                  })
                                }
                              />
                            </Field>
                            <ImageUploadField
                              label="Foto Kepala Sekolah"
                              value={selectedSchool.principal.photo}
                              onChange={(next) =>
                                updateDraft({
                                  principal: { ...selectedSchool.principal, photo: next },
                                })
                              }
                            />
                          </div>

                          <div className="space-y-4">
                            <Field label="Sambutan Kepala Sekolah">
                              <Textarea
                                value={selectedSchool.principal.welcome}
                                onChange={(event) =>
                                  updateDraft({
                                    principal: { ...selectedSchool.principal, welcome: event.target.value },
                                  })
                                }
                                className="min-h-48"
                              />
                            </Field>
                          </div>
                        </div>

                        <div className="grid gap-4">
                          <Field label="Sejarah Sekolah">
                            <Textarea value={selectedSchool.history} onChange={(event) => updateDraft({ history: event.target.value })} className="min-h-32" />
                          </Field>
                          <Field label="Visi Sekolah">
                            <Textarea value={selectedSchool.vision} onChange={(event) => updateDraft({ vision: event.target.value })} />
                          </Field>
                          <ListEditor
                            label="Misi"
                            value={selectedSchool.mission}
                            onChange={(next) => updateDraft({ mission: next })}
                            placeholder="Tulis poin misi"
                          />
                          <ListEditor
                            label="Tujuan"
                            value={selectedSchool.goals}
                            onChange={(next) => updateDraft({ goals: next })}
                            placeholder="Tulis tujuan sekolah"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="stats" className="space-y-5">
                        <div className="rounded-3xl border border-border bg-muted/20 p-5">
                          <div className="flex items-start gap-3">
                            <BadgeCheck className="w-5 h-5 text-primary mt-0.5" />
                            <div className="space-y-2">
                              <p className="font-semibold text-foreground">Statistik terkunci</p>
                              <p className="text-sm text-muted-foreground">
                                Bagian ini mengikuti hasil scraping yang tersinkron ke Supabase. Admin tidak bisa edit manual supaya angka tetap konsisten dengan sumber data.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          <div className="rounded-3xl border border-border bg-card p-5">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total Siswa</p>
                            <p className="mt-3 text-3xl font-extrabold text-foreground">{selectedSchool.totalStudents.toLocaleString("id")}</p>
                          </div>
                          <div className="rounded-3xl border border-border bg-card p-5">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Siswa Laki-laki</p>
                            <p className="mt-3 text-3xl font-extrabold text-foreground">{selectedSchool.maleStudents.toLocaleString("id")}</p>
                          </div>
                          <div className="rounded-3xl border border-border bg-card p-5">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Siswa Perempuan</p>
                            <p className="mt-3 text-3xl font-extrabold text-foreground">{selectedSchool.femaleStudents.toLocaleString("id")}</p>
                          </div>
                          <div className="rounded-3xl border border-border bg-card p-5">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total Guru</p>
                            <p className="mt-3 text-3xl font-extrabold text-foreground">{selectedSchool.totalTeachers.toLocaleString("id")}</p>
                          </div>
                          <div className="rounded-3xl border border-border bg-card p-5">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ruang Kelas</p>
                            <p className="mt-3 text-3xl font-extrabold text-foreground">{selectedSchool.totalClassrooms.toLocaleString("id")}</p>
                          </div>
                          <div className="rounded-3xl border border-border bg-card p-5">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Rombel</p>
                            <p className="mt-3 text-3xl font-extrabold text-foreground">{selectedSchool.totalStudyGroups.toLocaleString("id")}</p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="achievement" className="space-y-6">
                        <div className="rounded-3xl border border-border bg-emerald-50/70 p-5">
                          <div className="flex items-start gap-3">
                            <BadgeCheck className="w-5 h-5 text-primary mt-0.5" />
                            <div className="space-y-2">
                              <p className="font-semibold text-foreground">CMS Prestasi</p>
                              <p className="text-sm text-muted-foreground">
                                Prestasi sekolah tampil di halaman publik dan disimpan per sekolah, jadi admin hanya mengelola milik sekolahnya sendiri.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <ArrayHeader
                            title="Achievements"
                            subtitle="Prestasi sekolah yang ditampilkan di halaman publik"
                            onAdd={() => addArrayItem("achievements", createEmptyAchievement())}
                          />
                          {selectedSchool.achievements.length === 0 ? (
                            <EmptyState text="Belum ada prestasi." />
                          ) : (
                            <div className="space-y-3">
                              {selectedSchool.achievements.map((achievement, index) => (
                                <ArrayCard key={`${achievement.title || "achievement"}-${index}`}>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <Field label="Judul" className="md:col-span-2">
                                      <Input
                                        value={achievement.title}
                                        onChange={(event) =>
                                          replaceArrayItem("achievements", index, {
                                            ...achievement,
                                            title: event.target.value,
                                          })
                                        }
                                      />
                                    </Field>
                                    <Field label="Tahun">
                                      <Input
                                        value={achievement.year}
                                        onChange={(event) =>
                                          replaceArrayItem("achievements", index, {
                                            ...achievement,
                                            year: event.target.value,
                                          })
                                        }
                                      />
                                    </Field>
                                    <Field label="Level">
                                      <Input
                                        value={achievement.level}
                                        onChange={(event) =>
                                          replaceArrayItem("achievements", index, {
                                            ...achievement,
                                            level: event.target.value,
                                          })
                                        }
                                      />
                                    </Field>
                                    <div className="md:col-span-2">
                                      <ImageUploadField
                                        label="Foto"
                                        value={achievement.photo ?? ""}
                                        onChange={(next) =>
                                          replaceArrayItem("achievements", index, {
                                            ...achievement,
                                            photo: next || undefined,
                                          })
                                        }
                                      />
                                    </div>
                                    <Field label="Deskripsi" className="md:col-span-2">
                                      <Textarea
                                        value={achievement.description}
                                        onChange={(event) =>
                                          replaceArrayItem("achievements", index, {
                                            ...achievement,
                                            description: event.target.value,
                                          })
                                        }
                                      />
                                    </Field>
                                    <div className="md:col-span-2 flex justify-end">
                                      <RemoveButton onClick={() => removeArrayItem("achievements", index)} />
                                    </div>
                                  </div>
                                </ArrayCard>
                              ))}
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="news" className="space-y-6">
                        <div className="rounded-3xl border border-border bg-emerald-50/70 p-5">
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-primary mt-0.5" />
                            <div className="space-y-2">
                              <p className="font-semibold text-foreground">CMS Berita</p>
                              <p className="text-sm text-muted-foreground">
                                Berita sekolah juga disimpan per sekolah, jadi admin tidak bisa mengubah berita sekolah lain.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <ArrayHeader
                            title="News"
                            subtitle="Artikel berita singkat yang tampil di halaman detail"
                            onAdd={() => addArrayItem("news", createEmptyNewsItem())}
                          />
                          {selectedSchool.news.length === 0 ? (
                            <EmptyState text="Belum ada berita." />
                          ) : (
                            <div className="space-y-3">
                              {selectedSchool.news.map((newsItem, index) => (
                                <ArrayCard key={`${newsItem.id}-${index}`}>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <Field label="Judul" className="md:col-span-2">
                                      <Input
                                        value={newsItem.title}
                                        onChange={(event) =>
                                          replaceArrayItem("news", index, { ...newsItem, title: event.target.value })
                                        }
                                      />
                                    </Field>
                                    <Field label="Tanggal">
                                      <Input
                                        value={newsItem.date}
                                        onChange={(event) =>
                                          replaceArrayItem("news", index, { ...newsItem, date: event.target.value })
                                        }
                                      />
                                    </Field>
                                    <Field label="Kategori">
                                      <Input
                                        value={newsItem.category}
                                        onChange={(event) =>
                                          replaceArrayItem("news", index, { ...newsItem, category: event.target.value })
                                        }
                                      />
                                    </Field>
                                    <div className="md:col-span-2">
                                      <ImageUploadField
                                        label="Thumbnail"
                                        value={newsItem.thumbnail}
                                        onChange={(next) =>
                                          replaceArrayItem("news", index, {
                                            ...newsItem,
                                            thumbnail: next,
                                          })
                                        }
                                      />
                                    </div>
                                    <Field label="Excerpt" className="md:col-span-2">
                                      <Textarea
                                        value={newsItem.excerpt}
                                        onChange={(event) =>
                                          replaceArrayItem("news", index, {
                                            ...newsItem,
                                            excerpt: event.target.value,
                                          })
                                        }
                                      />
                                    </Field>
                                    <div className="md:col-span-2 flex justify-end">
                                      <RemoveButton onClick={() => removeArrayItem("news", index)} />
                                    </div>
                                  </div>
                                </ArrayCard>
                              ))}
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="collection" className="space-y-6">
                        <div className="grid gap-6">
                          <div className="space-y-4">
                            <ArrayHeader
                              title="Staff"
                              subtitle="Operator, tata usaha, dan kepengurusan sekolah"
                              onAdd={() => addArrayItem("staff", createEmptyStaff())}
                            />
                            {selectedSchool.staff.length === 0 ? (
                              <EmptyState text="Belum ada staff." />
                            ) : (
                              <div className="space-y-3">
                                {selectedSchool.staff.map((person, index) => (
                                  <ArrayCard key={`${person.name || "staff"}-${index}`}>
                                    <div className="grid gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                                      <Field label="Nama">
                                        <Input
                                          value={person.name}
                                          onChange={(event) =>
                                            replaceArrayItem("staff", index, { ...person, name: event.target.value })
                                          }
                                        />
                                      </Field>
                                      <Field label="Jabatan">
                                        <Input
                                          value={person.position}
                                          onChange={(event) =>
                                            replaceArrayItem("staff", index, { ...person, position: event.target.value })
                                          }
                                        />
                                      </Field>
                                      <div className="md:col-span-2">
                                        <ImageUploadField
                                          label="Foto"
                                          value={person.photo}
                                          onChange={(next) =>
                                            replaceArrayItem("staff", index, { ...person, photo: next })
                                          }
                                        />
                                      </div>
                                      <div className="flex items-end justify-between gap-3">
                                        <div className="flex flex-wrap gap-2">
                                          <BooleanPill
                                            value={Boolean(person.isAdmin)}
                                            onToggle={() =>
                                              replaceArrayItem("staff", index, { ...person, isAdmin: !person.isAdmin })
                                            }
                                            label="Admin"
                                          />
                                          <BooleanPill
                                            value={Boolean(person.isVicePrincipal)}
                                            onToggle={() =>
                                              replaceArrayItem("staff", index, {
                                                ...person,
                                                isVicePrincipal: !person.isVicePrincipal,
                                              })
                                            }
                                            label="Wakil"
                                          />
                                        </div>
                                        <RemoveButton onClick={() => removeArrayItem("staff", index)} />
                                      </div>
                                    </div>
                                  </ArrayCard>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="space-y-4">
                            <ArrayHeader
                              title="Teachers"
                              subtitle="Data guru dan tenaga pendidik"
                              onAdd={() => addArrayItem("teachers", createEmptyTeacher())}
                            />
                            {selectedSchool.teachers.length === 0 ? (
                              <EmptyState text="Belum ada guru." />
                            ) : (
                              <div className="space-y-3">
                                {selectedSchool.teachers.map((teacher, index) => (
                                  <ArrayCard key={`${teacher.name || "teacher"}-${index}`}>
                                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                                      <Field label="Nama">
                                        <Input
                                          value={teacher.name}
                                          onChange={(event) =>
                                            replaceArrayItem("teachers", index, { ...teacher, name: event.target.value })
                                          }
                                        />
                                      </Field>
                                      <Field label="Jabatan">
                                        <Input
                                          value={teacher.position}
                                          onChange={(event) =>
                                            replaceArrayItem("teachers", index, { ...teacher, position: event.target.value })
                                          }
                                        />
                                      </Field>
                                      <Field label="NIP">
                                        <Input
                                          value={teacher.nip ?? ""}
                                          onChange={(event) =>
                                            replaceArrayItem("teachers", index, {
                                              ...teacher,
                                              nip: event.target.value || undefined,
                                            })
                                          }
                                        />
                                      </Field>
                                      <div className="md:col-span-2">
                                        <ImageUploadField
                                          label="Foto"
                                          value={teacher.photo}
                                          onChange={(next) =>
                                            replaceArrayItem("teachers", index, { ...teacher, photo: next })
                                          }
                                        />
                                      </div>
                                      <div className="md:col-span-2 flex justify-end">
                                        <RemoveButton onClick={() => removeArrayItem("teachers", index)} />
                                      </div>
                                    </div>
                                  </ArrayCard>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="space-y-4">
                            <ArrayHeader
                              title="Facilities"
                              subtitle="Sarana prasarana, ikon, dan jumlah"
                              onAdd={() => addArrayItem("facilities", createEmptyFacility())}
                            />
                            {selectedSchool.facilities.length === 0 ? (
                              <EmptyState text="Belum ada fasilitas." />
                            ) : (
                              <div className="space-y-3">
                                {selectedSchool.facilities.map((facility, index) => (
                                  <ArrayCard key={`${facility.name || "facility"}-${index}`}>
                                    <div className="grid gap-3 md:grid-cols-2">
                                      <Field label="Nama">
                                        <Input
                                          value={facility.name}
                                          onChange={(event) =>
                                            replaceArrayItem("facilities", index, { ...facility, name: event.target.value })
                                          }
                                        />
                                      </Field>
                                      <Field label="Jumlah">
                                        <Input
                                          type="number"
                                          value={facility.count}
                                          onChange={(event) =>
                                            replaceArrayItem("facilities", index, {
                                              ...facility,
                                              count: Number(event.target.value) || 0,
                                            })
                                          }
                                        />
                                      </Field>
                                      <Field label="Ikon">
                                        <Input
                                          value={facility.icon}
                                          onChange={(event) =>
                                            replaceArrayItem("facilities", index, { ...facility, icon: event.target.value })
                                          }
                                        />
                                      </Field>
                                      <div className="md:col-span-2">
                                        <ImageUploadField
                                          label="Foto"
                                          value={facility.photo}
                                          onChange={(next) =>
                                            replaceArrayItem("facilities", index, { ...facility, photo: next })
                                          }
                                        />
                                      </div>
                                      <Field label="Deskripsi" className="md:col-span-2">
                                        <Textarea
                                          value={facility.description}
                                          onChange={(event) =>
                                            replaceArrayItem("facilities", index, {
                                              ...facility,
                                              description: event.target.value,
                                            })
                                          }
                                        />
                                      </Field>
                                      <div className="md:col-span-2 flex justify-end">
                                        <RemoveButton onClick={() => removeArrayItem("facilities", index)} />
                                      </div>
                                    </div>
                                  </ArrayCard>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="space-y-4">
                            <ArrayHeader
                              title="Gallery"
                              subtitle="Kumpulan foto dan caption galeri sekolah"
                              onAdd={() => addArrayItem("gallery", createEmptyGalleryItem())}
                            />
                            {selectedSchool.gallery.length === 0 ? (
                              <EmptyState text="Belum ada galeri." />
                            ) : (
                              <div className="space-y-3">
                                {selectedSchool.gallery.map((galleryItem, index) => (
                                  <ArrayCard key={`${galleryItem.caption || "gallery"}-${index}`}>
                                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                                      <div className="md:col-span-2">
                                        <ImageUploadField
                                          label="Foto"
                                          value={galleryItem.photo}
                                          onChange={(next) =>
                                            replaceArrayItem("gallery", index, {
                                              ...galleryItem,
                                              photo: next,
                                            })
                                          }
                                        />
                                      </div>
                                      <div className="flex items-end justify-end">
                                        <RemoveButton onClick={() => removeArrayItem("gallery", index)} />
                                      </div>
                                      <Field label="Caption" className="md:col-span-2">
                                        <Textarea
                                          value={galleryItem.caption}
                                          onChange={(event) =>
                                            replaceArrayItem("gallery", index, {
                                              ...galleryItem,
                                              caption: event.target.value,
                                            })
                                          }
                                        />
                                      </Field>
                                    </div>
                                  </ArrayCard>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
