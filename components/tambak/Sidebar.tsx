"use client";

import { Fish, BarChart3, Waves, CircleDollarSign, PackageCheck, Layers, BookOpen } from "lucide-react";
import { Pond, Cycle } from "@/types/pond";

interface SidebarProps {
  ponds: Pond[];
  cycles: Cycle[];
  selectedPondId: string;
  onSelectPond: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  ponds,
  cycles,
  selectedPondId,
  onSelectPond,
  isOpen,
  onClose,
}: SidebarProps) {
  const activeCycles = cycles.filter((c) => c.status === "AKTIF");
  const sellingCycles = cycles.filter((c) => c.status === "PENJUALAN");

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white shadow-xs shadow-sky-500/20">
            <Fish className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-sm leading-tight">
              Buku Besar <span className="text-sky-600">Tambak</span>
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">Buku Kas & Lapangan</p>
          </div>
        </div>

        {/* Menu Navigasi Utama */}
        <nav className="p-3 space-y-1">
          <a
            href="#ringkasan"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-sky-700 bg-sky-50 transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-sky-600" />
            <span>Dasbor & BEP</span>
          </a>
          <a
            href="#denah-kolam"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <Waves className="w-4 h-4 text-slate-500" />
            <span>Denah 8 Kolam</span>
          </a>
          <a
            href="#buku-stok"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <PackageCheck className="w-4 h-4 text-slate-500" />
            <span>Buku Stok & Penjualan</span>
          </a>
          <a
            href="#rincian-biaya"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <CircleDollarSign className="w-4 h-4 text-slate-500" />
            <span>Rincian Biaya & Pakan</span>
          </a>
        </nav>

        {/* Indeks Cepat Kolam (Gaya Tab Buku Kas) */}
        <div className="flex-1 overflow-y-auto px-3 py-2 border-t border-slate-100">
          <div className="flex items-center justify-between px-2 py-1 mb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Indeks Kolam</span>
            <span className="text-sky-600 font-normal">{activeCycles.length} Aktif</span>
          </div>

          <div className="space-y-1">
            {ponds.map((pond) => {
              const isSelected = pond.id === selectedPondId;
              const activeCycle = cycles.find((c) => c.pondId === pond.id && c.status === "AKTIF");
              const sellingCycle = cycles.find((c) => c.pondId === pond.id && c.status === "PENJUALAN");

              const statusLabel = activeCycle
                ? activeCycle.speciesName.replace("Lele ", "").replace("Nila ", "")
                : sellingCycle
                ? "Jual Stok"
                : "Kosong";

              return (
                <button
                  key={pond.id}
                  onClick={() => {
                    onSelectPond(pond.id);
                    onClose();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-all ${
                    isSelected
                      ? "bg-sky-600 text-white font-semibold shadow-xs"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        activeCycle
                          ? isSelected
                            ? "bg-emerald-300"
                            : "bg-emerald-500"
                          : sellingCycle
                          ? isSelected
                            ? "bg-amber-300"
                            : "bg-amber-500"
                          : isSelected
                          ? "bg-sky-200"
                          : "bg-slate-300"
                      }`}
                    />
                    <span className="truncate">Kolam {pond.id}</span>
                  </div>

                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 font-medium ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : activeCycle
                        ? "bg-sky-50 text-sky-700"
                        : sellingCycle
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {statusLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Info Ringkas Bawah */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50/70 text-[11px] text-slate-500">
          <div className="flex justify-between items-center mb-1">
            <span>Siklus Pembesaran:</span>
            <span className="font-semibold text-slate-800">{activeCycles.length} Kolam</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Tahap Penjualan:</span>
            <span className="font-semibold text-amber-600">{sellingCycles.length} Siklus</span>
          </div>
        </div>
      </aside>
    </>
  );
}
