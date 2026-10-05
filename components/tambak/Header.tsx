"use client";

import { Calendar, Database, Plus, ShieldCheck, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/client";

interface HeaderProps {
  onOpenQuickLog: () => void;
  onOpenSupabaseModal: () => void;
  onOpenNewPond: () => void;
  includePenyusutan: boolean;
  onTogglePenyusutan: () => void;
}

export function Header({
  onOpenQuickLog,
  onOpenSupabaseModal,
  onOpenNewPond,
  includePenyusutan,
  onTogglePenyusutan,
}: HeaderProps) {
  const todayFormatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 lg:px-8 py-3 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Title & Date */}
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-0.5">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <span>{todayFormatted}</span>
            <span className="text-slate-300">•</span>
            <span>Asia/Jakarta</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Buku Besar <span className="text-sky-600">Tambak</span>
          </h1>
        </div>

        {/* Action Buttons & Settings */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Toggle Biaya Tunai / Biaya Penuh (FR-93) */}
          <button
            type="button"
            onClick={onTogglePenyusutan}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
            title="Ubah metode perhitungan biaya: Tunai saja atau Penuh termasuk penyusutan aset"
          >
            <DollarSign className="w-3.5 h-3.5 text-sky-600" />
            <span>{includePenyusutan ? "Biaya Penuh (+Penyusutan)" : "Biaya Tunai"}</span>
          </button>

          {/* Supabase Status Button */}
          <button
            type="button"
            onClick={onOpenSupabaseModal}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isSupabaseConfigured
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100"
            }`}
          >
            <Database className="w-3.5 h-3.5 text-sky-600" />
            <span>{isSupabaseConfigured ? "Supabase: Terhubung" : "Database: Siap Supabase"}</span>
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          </button>

          {/* New Cycle Button */}
          <Button
            onClick={onOpenNewPond}
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold px-3 py-2 h-8.5"
          >
            <Plus className="w-3.5 h-3.5 mr-1 text-slate-600" />
            Tebar Baru
          </Button>

          {/* Quick Record Event Button */}
          <Button
            onClick={onOpenQuickLog}
            className="bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs px-3.5 py-2 h-8.5 shadow-xs shadow-sky-600/20"
          >
            <Plus className="w-4 h-4 mr-1" />
            Catat Cepat
          </Button>
        </div>
      </div>
    </header>
  );
}
