"use client";

import { Pond, Cycle } from "@/types/pond";
import { calculateCycleAnalytics } from "@/lib/supabase/pond-service";
import { Plus, Utensils, Calendar, ShieldCheck, Tag } from "lucide-react";

interface PondGridProps {
  ponds: Pond[];
  cycles: Cycle[];
  selectedPondId: string;
  onSelectPond: (id: string) => void;
  onOpenNewPond: (pondId?: string) => void;
}

export function PondGrid({
  ponds,
  cycles,
  selectedPondId,
  onSelectPond,
  onOpenNewPond,
}: PondGridProps) {
  const numberFormat = (val: number) => new Intl.NumberFormat("id-ID").format(val);

  return (
    <section id="denah-kolam" className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Denah Kolam & Keadaan Hari Ini</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800">
              {ponds.length} Kolam
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Pilih kolam untuk memeriksa umur ikan, pemberian pakan berjalan, atau kelola penjualan panen.
          </p>
        </div>
      </div>

      {ponds.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Belum Ada Kolam Terdaftar</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Mulai tambahkan petak kolam pertama Anda untuk mencatat siklus pembesaran ikan dan operasional tambak.
          </p>
          <button
            type="button"
            onClick={() => onOpenNewPond()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 text-xs font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Tambah Kolam Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {ponds.map((pond) => {
          const isSelected = pond.id === selectedPondId;

          // Cari siklus aktif atau siklus penjualan terkait kolam ini
          const activeCycle = cycles.find((c) => c.pondId === pond.id && c.status === "AKTIF");
          const sellingCycle = cycles.find((c) => c.pondId === pond.id && c.status === "PENJUALAN");
          const displayCycle = activeCycle || sellingCycle;

          const isKosong = !activeCycle;
          const isPenjualan = !activeCycle && Boolean(sellingCycle);
          const isAktif = Boolean(activeCycle);

          const analytics = displayCycle ? calculateCycleAnalytics(displayCycle) : null;

          return (
            <div
              key={pond.id}
              onClick={() => onSelectPond(pond.id)}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between min-h-[148px] ${
                isSelected
                  ? "pond-card-selected bg-white ring-2 ring-sky-500 shadow-md"
                  : isAktif
                  ? "bg-white border-slate-200 hover:border-sky-300 hover:shadow-xs"
                  : isPenjualan
                  ? "bg-amber-50/50 border-amber-200 hover:border-amber-300"
                  : "bg-slate-50/60 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              {/* Header Kartu: Nama & Badge Status Stempel */}
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <span className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isAktif
                          ? "bg-emerald-500"
                          : isPenjualan
                          ? "bg-amber-500"
                          : "bg-slate-300"
                      }`}
                    />
                    {pond.name || `Kolam ${pond.id}`}
                  </span>

                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase ${
                      isAktif
                        ? "badge-emerald"
                        : isPenjualan
                        ? "badge-amber"
                        : "badge-gray"
                    }`}
                  >
                    {isAktif ? "AKTIF" : isPenjualan ? "PENJUALAN" : "KOSONG"}
                  </span>
                </div>

                {/* Konten Siklus atau Kolam Kosong */}
                {isKosong && !isPenjualan ? (
                  <div className="mt-2 text-slate-400 flex flex-col items-center justify-center py-2 text-center">
                    <p className="text-xs text-slate-500 font-medium">Siap untuk tebar</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenNewPond(pond.id);
                      }}
                      className="mt-2 text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Mulai Tebar
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Nama Jenis Ikan */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-bold text-slate-900 tracking-tight">
                        {displayCycle?.speciesName}
                      </span>
                    </div>

                    {/* Informasi Umur & Populasi / Stok */}
                    {isAktif && analytics && (
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <span className="font-semibold text-slate-800">
                            Hari ke-{analytics.umurHari}
                          </span>
                          <span className="font-mono text-slate-500 text-[11px]">
                            {numberFormat(analytics.populasiHidup)} ekor
                          </span>
                        </div>
                        {/* Progress Bar Umur Target */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-sky-600 h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (analytics.umurHari / analytics.targetDays) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {isPenjualan && analytics && (
                      <div className="mt-1 text-xs">
                        <span className="text-amber-800 font-semibold bg-amber-100/70 px-2 py-0.5 rounded text-[11px] inline-block mb-1">
                          Sisa Stok: {analytics.stokPanenKg} kg
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Kolam kosong (bisa ditebar lagi)
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Kartu: Pakan Berjalan (FR-50 & FR-51) */}
              {isAktif && analytics && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  {analytics.activeBatch ? (
                    <div className="flex items-center gap-1.5 text-sky-800 font-medium truncate">
                      <Utensils className="w-3 h-3 text-sky-600 shrink-0" />
                      <span className="truncate">
                        {analytics.activeBatch.feedType} • berjalan hari ke-
                        {analytics.activeBatch ? analytics.umurHari % 4 + 1 : 1}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Belum ada pakan aktif</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}
    </section>
  );
}
