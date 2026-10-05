"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useData } from "@/contexts/data-context";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { 
  ShieldCheck, 
  User as UserIcon, 
  UserPlus, 
  Trash2, 
  Database, 
  Key, 
  AlertTriangle, 
  CheckCircle2, 
  Lock,
  RefreshCw,
  Info
} from "lucide-react";

interface ManagedUser {
  id: string;
  username: string;
  role: "SUPERADMIN" | "OWNER";
}

export default function PengaturanPage() {
  const { user } = useAuth();
  const { showNotification } = useData();

  // Superadmin user management state
  const [userList, setUserList] = useState<ManagedUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"OWNER" | "SUPERADMIN">("OWNER");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    if (user?.role !== "SUPERADMIN") return;
    setIsLoadingUsers(true);
    try {
      const res = await fetch("/api/auth/users");
      if (res.ok) {
        const data = (await res.json()) as ManagedUser[];
        setUserList(data);
      }
    } catch (err) {
      console.error("Gagal memuat pengguna:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (user?.role === "SUPERADMIN") {
      const timer = window.setTimeout(() => {
        void fetchUsers();
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [user?.role]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!newUsername.trim() || !newPassword.trim()) {
      setFormError("Username dan password wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword.trim(),
          role: newRole,
        }),
      });

      const data = (await res.json()) as { error?: string };

      if (res.ok) {
        setFormSuccess(`Pengguna "${newUsername}" berhasil ditambahkan.`);
        setNewUsername("");
        setNewPassword("");
        setNewRole("OWNER");
        fetchUsers();
        showNotification("Pengguna baru berhasil ditambahkan.");
      } else {
        setFormError(data.error || "Gagal menambahkan pengguna.");
      }
    } catch (err) {
      setFormError("Terjadi kesalahan sistem saat menghubungi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (!confirm(`Hapus pengguna "${username}"? Pengguna ini tidak akan bisa login lagi.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/auth/users?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchUsers();
        showNotification(`Pengguna "${username}" telah dihapus.`);
      } else {
        alert("Gagal menghapus pengguna.");
      }
    } catch (err) {
      console.error("Gagal menghapus pengguna:", err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Halaman */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Pengaturan & Hak Akses</h2>
        <p className="text-sm text-slate-500">
          Kelola profil pengguna, hak akses akun, konfigurasi database, dan preferensi aplikasi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Profil & Status Sesi */}
        <div className="space-y-6">
          {/* Kartu Profil Sesi */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Akun Masuk Saat Ini
            </h3>
            
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg">
                {user?.role === "SUPERADMIN" ? (
                  <ShieldCheck className="w-6 h-6 text-sky-700" />
                ) : (
                  <UserIcon className="w-6 h-6 text-sky-700" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{user?.username}</h4>
                <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                  user?.role === "SUPERADMIN" 
                    ? "bg-sky-50 text-sky-700 border border-sky-200" 
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}>
                  {user?.role === "SUPERADMIN" ? "Super Admin" : "Owner / Pengguna Tambak"}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-1.5 border border-slate-100">
              <div className="flex justify-between">
                <span>Metode Auth:</span>
                <span className="font-semibold text-slate-800">Cookie HttpOnly</span>
              </div>
              <div className="flex justify-between">
                <span>Hak Kelola Akses:</span>
                <span className="font-semibold text-slate-800">
                  {user?.role === "SUPERADMIN" ? "Penuh (Superadmin)" : "Akses Tambak Saja"}
                </span>
              </div>
            </div>
          </div>

          {/* Kartu Status Supabase */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-sky-600" />
              <h3 className="font-bold text-slate-800 text-sm">Status Database Supabase</h3>
            </div>
            
            <p className="text-xs text-slate-500 mb-3.5 leading-relaxed">
              Data operasional disimpan di Supabase dan diakses aman melalui server aplikasi.
            </p>

            <div className="p-3 rounded-lg border text-xs flex items-center justify-between mb-3 bg-slate-50 border-slate-200">
              <span className="text-slate-600">Koneksi Supabase:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                isSupabaseConfigured 
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? "bg-emerald-500" : "bg-amber-500"}`} />
                {isSupabaseConfigured ? "Endpoint terkonfigurasi" : "Belum dikonfigurasi"}
              </span>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1">
              <p>• Schema SQL lengkap tersedia di <code>lib/supabase/schema.sql</code></p>
              <p>• URL dan service-role key dikonfigurasi di environment Vercel</p>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Superadmin Manajemen Pengguna */}
        <div className="lg:col-span-2 space-y-6">
          {user?.role === "SUPERADMIN" ? (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-sky-600" />
                    Manajemen Pengguna & Hak Akses
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tambahkan akun owner atau operator baru untuk menggunakan sistem ini.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchUsers}
                  disabled={isLoadingUsers}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Segarkan daftar pengguna"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingUsers ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* Info Superadmin */}
              <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-100 text-xs text-sky-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Catatan Super Admin (.env):</p>
                  <p className="text-[11px] text-sky-800 leading-relaxed">
                    Kredensial akun Super Admin Anda dikonfigurasi melalui variabel environment <code>SUPERADMIN_USERNAME</code> dan <code>SUPERADMIN_PASSWORD</code> di file <code>.env.local</code>. Akun pengguna tambahan yang dibuat di bawah ini disimpan aman di sistem.
                  </p>
                </div>
              </div>

              {/* Form Tambah Pengguna Baru */}
              <form onSubmit={handleAddUser} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  + Buat Akun Pengguna Baru
                </h4>

                {formError && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                    {formSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Misal: owner_budi"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Minimal 12 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Peran / Hak Akses
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="OWNER">Owner (Pengguna Tambak)</option>
                      <option value="SUPERADMIN">Super Admin (Kelola Akun)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                  >
                    {isSubmitting ? "Menyimpan..." : "Tambah Pengguna"}
                  </button>
                </div>
              </form>

              {/* Tabel Daftar Pengguna Terdaftar */}
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
                  Daftar Pengguna Tambahan ({userList.length})
                </h4>

                {userList.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                    Belum ada pengguna tambahan. Anda dapat menambahkan owner lain lewat form di atas.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left text-slate-700">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                        <tr>
                          <th className="px-4 py-2.5">Username</th>
                          <th className="px-4 py-2.5">Peran</th>
                          <th className="px-4 py-2.5">ID Pengguna</th>
                          <th className="px-4 py-2.5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {userList.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50">
                            <td className="px-4 py-2.5 font-semibold text-slate-900">
                              {u.username}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.role === "SUPERADMIN" 
                                  ? "bg-sky-50 text-sky-700 border border-sky-200" 
                                  : "bg-slate-100 text-slate-700"
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 font-mono text-slate-400 text-[10px]">
                              {u.id}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.id, u.username)}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Hapus Akun Pengguna"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 text-center py-10 space-y-3">
              <Lock className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">Hak Akses Super Admin Diperlukan</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Anda saat ini login sebagai akun <strong>Owner</strong>. Penambahan pengguna baru dan pengelolaan hak akses hanya dapat dilakukan oleh akun <strong>Super Admin</strong>.
              </p>
            </div>
          )}

          {/* Zona Berbahaya / Reset Data */}
          <div className="bg-white rounded-xl shadow-xs border border-rose-200 p-6">
            <h3 className="text-sm font-bold text-rose-700 flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Zona Berbahaya: Reset Data Lokal
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Menghapus cache browser dari versi lama. Data Supabase tidak akan disentuh.
            </p>
            <button
              type="button"
              onClick={() => {
                if (confirm("Hapus cache browser dari versi lama? Data Supabase tidak akan dihapus.")) {
                  localStorage.removeItem("tambak_ponds_v11");
                  localStorage.removeItem("tambak_cycles_v11");
                  localStorage.removeItem("tambak_assets_v11");
                  window.location.href = "/dashboard";
                }
              }}
              className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            >
              Bersihkan Cache Lama
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
