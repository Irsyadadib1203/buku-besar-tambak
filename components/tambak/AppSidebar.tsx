"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Waves, 
  Wheat, 
  CircleDollarSign, 
  ShoppingCart, 
  Settings, 
  ChevronRight,
  Fish,
  Warehouse,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  X
} from "lucide-react";
import { useData } from "@/contexts/data-context";
import { useAuth } from "@/contexts/auth-context";

const navItems = [
  { name: "Dasbor & BEP", path: "/dashboard", icon: LayoutDashboard },
  { name: "Manajemen Kolam", path: "/kolam", icon: Waves },
  { name: "Catatan Pakan", path: "/pakan", icon: Wheat },
  { name: "Buku Kas (Biaya)", path: "/biaya", icon: CircleDollarSign },
  { name: "Penjualan & Stok", path: "/penjualan", icon: ShoppingCart },
  { name: "Aset & Alat", path: "/aset", icon: Warehouse },
  { name: "Master Jenis Ikan", path: "/master/ikan", icon: Fish },
  { name: "Pengaturan & Akun", path: "/pengaturan", icon: Settings },
];

export function AppSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { ponds, cycles, selectedPondId, setSelectedPondId } = useData();
  const { user, logout } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AKTIF": return "bg-emerald-500 ring-2 ring-emerald-100";
      case "PENJUALAN": return "bg-amber-500 ring-2 ring-amber-100";
      case "PERSIAPAN": return "bg-sky-500 ring-2 ring-sky-100";
      case "KOSONG": return "bg-slate-300";
      default: return "bg-slate-200";
    }
  };

  const isItemActive = (itemPath: string) => {
    if (itemPath === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(itemPath);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity" 
          onClick={onClose}
        />
      )}

      {/* Sidebar container: Clean White & Blue Base */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 text-slate-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"
        } flex flex-col h-full`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white shadow-xs shadow-sky-500/20">
              <Fish className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm leading-tight">
                Buku Besar <span className="text-sky-600">Tambak</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">Buku Kas & Lapangan</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Menu Navigasi Utama */}
        <div className="p-3 flex-1 overflow-y-auto space-y-6">
          <nav className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Menu Utama
            </div>
            {navItems.map((item) => {
              const active = isItemActive(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => onClose()}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    active 
                      ? "bg-sky-50 text-sky-700 shadow-xs border border-sky-100" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${active ? "text-sky-600" : "text-slate-400"}`} />
                  <span className="flex-1">{item.name}</span>
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Indeks Cepat Kolam */}
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between px-3 py-1 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Indeks Kolam ({ponds.length})</span>
              <span className="text-sky-600 font-normal">
                {cycles.filter((c) => c.status === "AKTIF").length} Aktif
              </span>
            </div>

            {ponds.length === 0 ? (
              <div className="px-3 py-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <p className="text-[11px] text-slate-400">Belum ada kolam</p>
                <Link
                  href="/kolam"
                  onClick={onClose}
                  className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 mt-1 inline-block"
                >
                  + Tambah Kolam
                </Link>
              </div>
            ) : (
              <div className="space-y-0.5 max-h-56 overflow-y-auto pr-1">
              {ponds.map((pond) => {
                const activeCycle = cycles.find((c) => c.pondId === pond.id && c.status === "AKTIF");
                const sellingCycle = cycles.find((c) => c.pondId === pond.id && c.status === "PENJUALAN");
                const isSelected = pathname === `/kolam/${pond.id}` || selectedPondId === pond.id;

                const statusLabel = activeCycle
                  ? activeCycle.speciesName.replace("Lele ", "").replace("Nila ", "")
                  : sellingCycle
                  ? "Jual Stok"
                  : pond.status === "NONAKTIF"
                  ? "Nonaktif"
                  : "Kosong";

                return (
                  <Link
                    key={pond.id}
                    href={`/kolam/${pond.id}`}
                    onClick={() => {
                      setSelectedPondId(pond.id);
                      onClose();
                    }}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all ${
                      isSelected
                        ? "bg-slate-100 text-slate-900 font-semibold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${getStatusColor(activeCycle ? "AKTIF" : sellingCycle ? "PENJUALAN" : pond.status)}`} />
                      <span className="truncate">{pond.name}</span>
                    </div>

                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                        activeCycle
                          ? "bg-emerald-50 text-emerald-700"
                          : sellingCycle
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {statusLabel}
                    </span>
                  </Link>
                );
              })}
            </div>
            )}
          </div>
        </div>

        {/* User Info & Logout Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
                {user?.role === "SUPERADMIN" ? (
                  <ShieldCheck className="w-4 h-4 text-sky-700" />
                ) : (
                  <UserIcon className="w-4 h-4 text-sky-700" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {user?.username || "Pengguna Tambak"}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {user?.role === "SUPERADMIN" ? "Super Admin" : "Owner Tambak"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => logout()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
              title="Keluar dari akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
