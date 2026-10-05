"use client";

import { useState } from "react";
import { useData } from "@/contexts/data-context";
import { QuickLogDialog } from "@/components/tambak/QuickLogDialog";
import { Wheat, Plus, CheckCircle2, Clock, DollarSign } from "lucide-react";

export default function PakanPage() {
  const { 
    ponds, 
    cycles, 
    selectedPondId,
    saveFeedBatch, 
    saveMortality, 
    saveHarvest, 
    saveSale, 
    saveStockAdjustment,
    markFeedFinished 
  } = useData();

  const [isLogOpen, setIsLogOpen] = useState(false);

  const allFeedBatches = cycles.flatMap((c) =>
    c.feedBatches.map((f) => ({
      ...f,
      pondId: c.pondId,
      speciesName: c.speciesName,
      cycleStatus: c.status
    }))
  ).sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  // Statistics
  const totalKg = allFeedBatches.reduce((acc, b) => acc + (b.qtyKg || 0), 0);
  const totalBiaya = allFeedBatches.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
  const activeBatches = allFeedBatches.filter((b) => !b.finishedAt);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Wheat className="w-6 h-6 text-sky-600" />
            Catatan Batch Pakan
          </h2>
          <p className="text-sm text-slate-500">
            Pencatatan pakan per batch pembelian (&quot;habis dalam N hari&quot;) tanpa perlu timbang harian.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsLogOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          Beli / Mulai Pakan Baru
        </button>
      </div>

      {/* KPI Stats Pakan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Pakan Terpakai</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{totalKg.toLocaleString("id-ID")} kg</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Wheat className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Biaya Pakan</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(totalBiaya)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Batch Berjalan Saat Ini</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{activeBatches.length} Kolam</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Table Feed Batches */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Riwayat Batch Pakan ({allFeedBatches.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500 text-[11px]">
              <tr>
                <th className="px-4 py-3">Tgl Mulai</th>
                <th className="px-4 py-3">Kolam / Jenis Ikan</th>
                <th className="px-4 py-3">Merek / Jenis Pakan</th>
                <th className="px-4 py-3">Berat (Kg)</th>
                <th className="px-4 py-3 text-right">Total Biaya</th>
                <th className="px-4 py-3">Status Pemakaian</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allFeedBatches.map((batch) => {
                const isFinished = Boolean(batch.finishedAt);
                return (
                  <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium whitespace-nowrap">
                      {new Date(batch.startedAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">Kolam {batch.pondId}</div>
                      <div className="text-[11px] text-slate-500">{batch.speciesName}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {batch.feedType}
                      {batch.note && (
                        <p className="text-[10px] text-slate-400 font-normal">{batch.note}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {batch.qtyKg} kg
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatCurrency(batch.totalPrice)}
                    </td>
                    <td className="px-4 py-3">
                      {isFinished ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          Habis {batch.finishedAt ? new Date(batch.finishedAt).toLocaleDateString("id-ID") : ""}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Sedang Berjalan
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!isFinished && (
                        <button
                          type="button"
                          onClick={() => markFeedFinished(batch.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors"
                          title="Tandai pakan sudah habis hari ini"
                        >
                          Tandai Habis
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {allFeedBatches.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic">
                    Belum ada batch pakan yang dicatat. Klik &quot;Beli / Mulai Pakan Baru&quot; di atas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Modal Dialog */}
      <QuickLogDialog
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        ponds={ponds}
        cycles={cycles}
        defaultPondId={selectedPondId}
        initialTab="pakan"
        onSaveFeedBatch={saveFeedBatch}
        onSaveMortality={saveMortality}
        onSaveHarvest={saveHarvest}
        onSaveSale={saveSale}
        onSaveStockAdjustment={saveStockAdjustment}
      />
    </div>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
