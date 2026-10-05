"use client";

import { Menu, Calendar, Database, DollarSign, Settings, User as UserIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useData } from "@/contexts/data-context";
import { useAuth } from "@/contexts/auth-context";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import Link from "next/link";

export function AppHeader({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const pathname = usePathname();
  const { includePenyusutan, setIncludePenyusutan } = useData();
  const { user } = useAuth();

  const getPageTitle = () => {
    if (pathname === "/" || pathname === "/dashboard") return "Dasbor & BEP";
    if (pathname.startsWith("/kolam")) return "Manajemen Kolam";
    if (pathname.startsWith("/siklus")) return "Siklus Pembesaran";
    if (pathname.startsWith("/pakan")) return "Catatan Pakan";
    if (pathname.startsWith("/biaya")) return "Buku Kas & Biaya";
    if (pathname.startsWith("/penjualan")) return "Penjualan & Stok";
    if (pathname.startsWith("/aset")) return "Manajemen Aset";
    if (pathname.startsWith("/master/ikan")) return "Master Jenis Ikan";
    if (pathname.startsWith("/pengaturan")) return "Pengaturan Sistem";
    return "Buku Besar Tambak";
  };

  const todayFormatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between transition-all">
      <div className="flex items-center gap-3">
        <button 
          type="button"
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          onClick={onOpenMobileNav}
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5 h-5 text-sky-600" />
        </button>
        
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">
            {getPageTitle()}
          </h1>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
            <Calendar className="w-3 h-3 text-sky-600" />
            <span>{todayFormatted}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Toggle Mode Biaya: Tunai vs Penuh */}
        <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            type="button"
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              !includePenyusutan
                ? "bg-white shadow-xs text-sky-700 font-bold"
                : "text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setIncludePenyusutan(false)}
            title="Biaya operasional riil yang keluar tunai"
          >
            Tunai
          </button>
          <button
            type="button"
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              includePenyusutan
                ? "bg-white shadow-xs text-sky-700 font-bold"
                : "text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setIncludePenyusutan(true)}
            title="Biaya tunai ditambah beban penyusutan aset"
          >
            Penuh (+Aset)
          </button>
        </div>

        {/* Supabase Status Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-50 border border-slate-200 text-slate-600">
          <Database className="w-3 h-3 text-sky-600" />
          <span>{isSupabaseConfigured ? "Supabase Aktif" : "Database Siap"}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Link Pengaturan / Profil Akun */}
        <Link
          href="/pengaturan"
          className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
          title="Pengaturan akun & hak akses"
        >
          <div className="w-6 h-6 rounded-md bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
            {user?.username?.charAt(0).toUpperCase() || "A"}
          </div>
          <span className="hidden sm:inline text-xs font-medium truncate max-w-[100px]">
            {user?.username || "Akun"}
          </span>
        </Link>
      </div>
    </header>
  );
}
