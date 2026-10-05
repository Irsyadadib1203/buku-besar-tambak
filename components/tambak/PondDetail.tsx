"use client";

import { Pond, Cycle } from "@/types/pond";
import { calculateCycleAnalytics } from "@/lib/supabase/pond-service";
import {
  Calendar,
  Package,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Check,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PondDetailProps {
  pond: Pond;
  cycle?: Cycle;
  includePenyusutan: boolean;
  onOpenQuickLog: (tab?: string) => void;
  onOpenNewPond: (pondId: string) => void;
  onMarkFeedFinished: (batchId: string) => void;
  onFinalizeCycle: (cycleId: string) => void;
}

export function PondDetail({
  pond,
  cycle,
  includePenyusutan,
  onOpenQuickLog,
  onOpenNewPond,
  onMarkFeedFinished,
  onFinalizeCycle,
}: PondDetailProps) {
  const rupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  const numberFormat = (val: number) => new Intl.NumberFormat("id-ID").format(val);

  // Jika kolam kosong dan tidak memiliki siklus
  if (!cycle) {
    return (
      <div className="card-clean p-8 text-center flex flex-col items-center justify-center min-h-[260px] mb-6 border-slate-200">
        <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Kolam {pond.id} Kosong / Siap Ditebar
        </h3>
        <p className="text-xs text-slate-500 max-w-md mb-4 leading-relaxed">
          Tipe {pond.type.toLowerCase()} ukuran {pond.lengthM}m × {pond.widthM}m × {pond.depthM}m (volume {pond.volumeM3} m³).
          Mulai tebar bibit baru untuk membuka siklus pembesaran.
        </p>
        <Button
          onClick={() => onOpenNewPond(pond.id)}
          className="bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs px-4 h-9"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Mulai Tebar di Kolam {pond.id}
        </Button>
      </div>
    );
  }

  const analytics = calculateCycleAnalytics(cycle, undefined, includePenyusutan);
  const totalBiayaTampil = includePenyusutan ? analytics.totalBiayaPenuh : analytics.totalBiayaTunai;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      {/* Kolom Kiri & Tengah: Siklus & Metrik */}
      <div className="lg:col-span-2 card-clean p-5 border-slate-200 flex flex-col justify-between">
        <div>
          {/* Header Siklus Kolam */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-700">
                  Kolam {pond.id} • {cycle.speciesName}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase ${
                    cycle.status === "AKTIF"
                      ? "badge-emerald"
                      : cycle.status === "PENJUALAN"
                      ? "badge-amber"
                      : "badge-gray"
                  }`}
                >
                  {cycle.status}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {cycle.speciesName}
              </h3>
            </div>

            {/* Label Stempel Laba: FINAL / BELUM FINAL (FR-84) */}
            <div className="text-right">
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border inline-block ${
                  analytics.isFinal
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : "bg-amber-50 text-amber-800 border-amber-300"
                }`}
              >
                {analytics.isFinal ? "STATUS: FINAL" : "STATUS: BELUM FINAL"}
              </span>
              <div className="text-xs text-slate-500 mt-1">
                Laba Terealisasi:{" "}
                <b
                  className={`font-mono ${
                    analytics.labaTerealisasi >= 0 ? "text-emerald-700" : "text-rose-600"
                  }`}
                >
                  {rupiah(analytics.labaTerealisasi)}
                </b>
              </div>
            </div>
          </div>

          {/* Pita Umur Siklus (FR-32 & Bagian 11) */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
              <div>
                <span className="text-slate-400 block text-[11px]">Tebar</span>
                <span className="font-semibold text-slate-800">{cycle.stockedAt}</span>
              </div>
              <div className="text-center">
                <span className="inline-block bg-sky-100 text-sky-800 font-bold px-2.5 py-0.5 rounded-full text-xs">
                  {cycle.releasedAt ? "Panen Selesai" : `Hari ke-${analytics.umurHari}`}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[11px]">Target Panen</span>
                <span className="font-semibold text-slate-800">
                  Target {analytics.targetDays} hari
                </span>
              </div>
            </div>

            {/* Progress Bar Pita Umur */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-sky-600 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (analytics.umurHari / analytics.targetDays) * 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
              <span>Awal: {numberFormat(cycle.initialCount)} ekor</span>
              {analytics.stokPanenKg > 0 && (
                <span className="font-semibold text-amber-700">
                  Jalur Penjualan: Sisa {analytics.stokPanenKg} kg
                </span>
              )}
              <span>Ukuran target: {cycle.expectedSizePerKg || 8}–10 ekor/kg</span>
            </div>
          </div>

          {/* 4 Kartu Metrik Inti Siklus */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3.5 text-center">
            <div className="p-3 rounded-lg bg-sky-50/70 border border-sky-100">
              <span className="text-[11px] text-slate-500 block mb-0.5">Populasi Hidup</span>
              <span className="text-lg font-bold text-slate-900 font-mono">
                {numberFormat(analytics.populasiHidup)}
              </span>
              <span className="text-[10px] text-slate-400 block">ekor di kolam</span>
            </div>

            <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-100">
              <span className="text-[11px] text-slate-500 block mb-0.5">Mortalitas (Mati)</span>
              <span className="text-lg font-bold text-rose-600 font-mono">
                {analytics.totalMati}
              </span>
              <span className="text-[10px] text-slate-500 block">
                SR: {analytics.srBerjalan}%
              </span>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100">
              <span className="text-[11px] text-slate-500 block mb-0.5">HPP Berjalan</span>
              <span className="text-lg font-bold text-emerald-700 font-mono">
                {rupiah(analytics.hppPerKgBerjalan)}
              </span>
              <span className="text-[10px] text-slate-400 block">per kg panen</span>
            </div>

            <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-100">
              <span className="text-[11px] text-slate-500 block mb-0.5">Stok Siap Jual</span>
              <span className="text-lg font-bold text-amber-800 font-mono">
                {analytics.stokPanenKg}{" "}
                <span className="text-xs font-normal text-slate-500">kg</span>
              </span>
              <span className="text-[10px] text-slate-500 block">
                {analytics.totalKgTerjual} kg terjual
              </span>
            </div>
          </div>
        </div>

        {/* Action Bottom */}
        <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-500 truncate mr-2">
            Catatan: {cycle.note || "Kondisi air stabil dan aerasi optimal."}
          </p>

          <div className="flex items-center gap-2">
            {cycle.status === "PENJUALAN" && analytics.stokPanenKg === 0 && (
              <Button
                size="sm"
                onClick={() => onFinalizeCycle(cycle.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Finalkan Siklus
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenQuickLog("pakan")}
              className="text-xs border-sky-300 text-sky-700 hover:bg-sky-50 h-8"
            >
              + Catat Kejadian
            </Button>
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Kartu Pakan Berjalan & Struk Biaya */}
      <div className="space-y-4">
        {/* Kartu Pakan Berjalan (FR-50, FR-51 & Bagian 11) */}
        <div className="card-clean p-4.5 border-slate-200 bg-gradient-to-br from-white to-sky-50/60">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-sky-600" />
              Pakan Berjalan
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold">
              Batch Terakhir
            </span>
          </div>

          {analytics.activeBatch ? (
            <div>
              <div className="text-lg font-bold text-slate-900">
                {analytics.activeBatch.feedType}
              </div>
              <p className="text-xs text-slate-700 mt-1 font-mono">
                {analytics.activeBatch.qtyKg} kg • {rupiah(analytics.activeBatch.totalPrice)} (
                {rupiah(Math.round(analytics.activeBatch.totalPrice / analytics.activeBatch.qtyKg))}/kg)
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mulai dipakai sejak {analytics.activeBatch.startedAt}
              </p>

              <button
                type="button"
                onClick={() => onMarkFeedFinished(analytics.activeBatch!.id)}
                className="mt-3.5 w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-2 rounded-lg transition-colors cursor-pointer"
              >
                Pakan Habis
              </button>
            </div>
          ) : (
            <div className="py-2 text-center">
              <p className="text-xs text-slate-500 mb-2">Tidak ada batch pakan yang sedang berjalan.</p>
              <button
                type="button"
                onClick={() => onOpenQuickLog("pakan")}
                className="text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                + Beli / Mulai Pakan Baru
              </button>
            </div>
          )}

          <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-600">Total Pakan Siklus</span>
            <span className="font-mono font-bold text-slate-900">
              {analytics.totalPakanKg} kg ({rupiah(analytics.biayaPakan)})
            </span>
          </div>
        </div>

        {/* Rincian Biaya Gaya Struk (Bagian 11) */}
        <div className="card-clean p-4 border-slate-200 bg-white">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
            Rincian Beban Siklus
          </span>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Bibit Awal</span>
              <span className="font-mono font-semibold text-slate-900">
                {rupiah(
                  cycle.expenses
                    .filter((e) => e.category === "Bibit")
                    .reduce((sum, e) => sum + e.total, 0)
                )}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Pakan (Seluruh Batch)</span>
              <span className="font-mono font-semibold text-slate-900">
                {rupiah(analytics.biayaPakan)}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Obat, Probiotik & Garam</span>
              <span className="font-mono font-semibold text-slate-900">
                {rupiah(
                  cycle.expenses
                    .filter((e) => e.category === "Obat & Vitamin" || e.category === "Probiotik/Kapur/Garam")
                    .reduce((sum, e) => sum + e.total, 0)
                )}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Listrik & Operasional</span>
              <span className="font-mono font-semibold text-slate-900">
                {rupiah(
                  cycle.expenses
                    .filter((e) => e.category === "Listrik" || e.category === "Tenaga Kerja" || e.category === "Biaya Penjualan")
                    .reduce((sum, e) => sum + e.total, 0)
                )}
              </span>
            </div>

            {includePenyusutan && (
              <div className="flex justify-between text-sky-800">
                <span>Penyusutan Aset (Hari Terpakai)</span>
                <span className="font-mono font-semibold">
                  {rupiah(analytics.totalPenyusutan)}
                </span>
              </div>
            )}

            <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
              <span>Total Beban Biaya</span>
              <span className="font-mono text-sky-700">{rupiah(totalBiayaTampil)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
