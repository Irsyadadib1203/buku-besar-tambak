"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DashboardSummary, Cycle, Pond } from "@/types/pond";
import { calculateCycleAnalytics } from "@/lib/supabase/pond-service";
import { CheckCircle2, AlertTriangle, TrendingUp, PackageCheck, AlertCircle } from "lucide-react";

interface FinancialBreakdownProps {
  summary: DashboardSummary;
  cycles: Cycle[];
  ponds: Pond[];
  includePenyusutan: boolean;
}

export function FinancialBreakdown({
  summary,
  cycles,
  ponds,
  includePenyusutan,
}: FinancialBreakdownProps) {
  const rupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  // Ambil siklus yang memiliki riwayat panen atau penjualan (misal A4)
  const activeAndSellingCycles = cycles.filter((c) => c.status !== "SELESAI");
  const cycleWithSales = cycles.find((c) => c.sales.length > 0) || cycles[0];
  const analytics = cycleWithSales ? calculateCycleAnalytics(cycleWithSales, undefined, includePenyusutan) : null;

  return (
    <section id="buku-stok" className="space-y-6">
      <div className="card-clean p-5 border-slate-200">
        <Tabs defaultValue="balik-modal" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-700">
                Analisis Finansial & Mutasi Panen
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Jalur Balik Modal (BEP) & Buku Stok Panen
              </h3>
            </div>

            <TabsList className="bg-slate-100 p-1 rounded-lg">
              <TabsTrigger
                value="balik-modal"
                className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-sky-700 px-3 py-1 rounded-md"
              >
                Jalur Balik Modal
              </TabsTrigger>
              <TabsTrigger
                value="buku-stok"
                className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-sky-700 px-3 py-1 rounded-md"
              >
                Buku Stok Panen
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: JALUR BALIK MODAL (FR-85) */}
          <TabsContent value="balik-modal" className="pt-4 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-sky-50/70 border border-sky-100">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-sky-800 uppercase tracking-wider">
                  Progres Balik Modal Tambak
                </span>
                <div className="text-lg font-bold text-slate-900">
                  {summary.persenBalikModalGlobal >= 100 ? (
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Modal Investasi Siklus Sudah Tertutup (Profit)
                    </span>
                  ) : (
                    <span>
                      {summary.persenBalikModalGlobal.toFixed(1)}% Menuju Balik Modal
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  {summary.persenBalikModalGlobal < 100
                    ? `Memerlukan pendapatan tambahan ${rupiah(summary.kekuranganBalikModalGlobal)} lagi untuk menutup modal operasional berjalan.`
                    : "Seluruh pengeluaran operasional tambak periode ini telah kembali dari hasil penjualan."}
                </p>
              </div>

              {summary.totalStokMenungguJualKg > 0 && summary.persenBalikModalGlobal < 100 && (
                <div className="bg-white p-3 rounded-lg border border-sky-200 shadow-xs text-right">
                  <span className="text-[11px] text-slate-500 block">Harga Min. Sisa Stok (BEP)</span>
                  <span className="text-base font-bold font-mono text-sky-700">
                    {rupiah(
                      Math.ceil(summary.kekuranganBalikModalGlobal / summary.totalStokMenungguJualKg)
                    )}{" "}
                    <span className="text-xs font-normal text-slate-500">/ kg</span>
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    (dari {summary.totalStokMenungguJualKg} kg sisa stok)
                  </span>
                </div>
              )}
            </div>

            {/* Visualisasi Bar Jalur Balik Modal */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-2">
                <span>Total Biaya: {rupiah(summary.totalBiayaBerjalan)}</span>
                <span>Penjualan: {rupiah(summary.totalPenjualanTerkumpul)}</span>
              </div>

              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-700"
                  style={{ width: `${Math.min(100, summary.persenBalikModalGlobal)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
                <span>0%</span>
                <span className="font-semibold text-emerald-700 font-mono">
                  {summary.persenBalikModalGlobal.toFixed(1)}% Tertutup
                </span>
                <span>100% (Titik Impas)</span>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: BUKU STOK PANEN (FR-82, FR-86) */}
          <TabsContent value="buku-stok" className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-semibold text-[11px]">
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Kolam & Komoditas</th>
                    <th className="py-2.5 px-3">Keterangan / Pembeli</th>
                    <th className="py-2.5 px-3 text-center">Saluran</th>
                    <th className="py-2.5 px-3 text-right">Masuk (Panen)</th>
                    <th className="py-2.5 px-3 text-right">Keluar (Jual)</th>
                    <th className="py-2.5 px-3 text-right">Harga / kg</th>
                    <th className="py-2.5 px-3 text-right">Pendapatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                  {/* Riwayat Panen Kolam A4 */}
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 text-slate-500 font-sans">18 Okt 2026</td>
                    <td className="py-2 px-3 font-sans font-medium text-slate-900">Kolam A4 (Lele)</td>
                    <td className="py-2 px-3 font-sans">Panen total tuntas</td>
                    <td className="py-2 px-3 text-center font-sans">
                      <span className="badge-blue px-1.5 py-0.5 rounded text-[10px]">PANEN</span>
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-600 font-bold">+680 kg</td>
                    <td className="py-2 px-3 text-right text-slate-400">—</td>
                    <td className="py-2 px-3 text-right text-slate-400">—</td>
                    <td className="py-2 px-3 text-right text-slate-400">—</td>
                  </tr>

                  {/* Penjualan 1 */}
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 text-slate-500 font-sans">19 Okt 2026</td>
                    <td className="py-2 px-3 font-sans font-medium text-slate-900">Kolam A4</td>
                    <td className="py-2 px-3 font-sans">Pak H. Supri (Borongan partai)</td>
                    <td className="py-2 px-3 text-center font-sans">
                      <span className="badge-amber px-1.5 py-0.5 rounded text-[10px]">PENGEPUL</span>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400">—</td>
                    <td className="py-2 px-3 text-right text-rose-600 font-semibold">-400 kg</td>
                    <td className="py-2 px-3 text-right">Rp 22.000</td>
                    <td className="py-2 px-3 text-right text-slate-900 font-bold">Rp 8.800.000</td>
                  </tr>

                  {/* Penjualan 2 */}
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 text-slate-500 font-sans">21 Okt 2026</td>
                    <td className="py-2 px-3 font-sans font-medium text-slate-900">Kolam A4</td>
                    <td className="py-2 px-3 font-sans">Warung Pecel Lamongan</td>
                    <td className="py-2 px-3 text-center font-sans">
                      <span className="badge-emerald px-1.5 py-0.5 rounded text-[10px]">ECERAN</span>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400">—</td>
                    <td className="py-2 px-3 text-right text-rose-600 font-semibold">-120 kg</td>
                    <td className="py-2 px-3 text-right">Rp 25.000</td>
                    <td className="py-2 px-3 text-right text-slate-900 font-bold">Rp 3.000.000</td>
                  </tr>

                  {/* Penjualan 3 */}
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 text-slate-500 font-sans">23 Okt 2026</td>
                    <td className="py-2 px-3 font-sans font-medium text-slate-900">Kolam A4</td>
                    <td className="py-2 px-3 font-sans">Eceran pasar pagi</td>
                    <td className="py-2 px-3 text-center font-sans">
                      <span className="badge-emerald px-1.5 py-0.5 rounded text-[10px]">ECERAN</span>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400">—</td>
                    <td className="py-2 px-3 text-right text-rose-600 font-semibold">-100 kg</td>
                    <td className="py-2 px-3 text-right">Rp 25.000</td>
                    <td className="py-2 px-3 text-right text-slate-900 font-bold">Rp 2.500.000</td>
                  </tr>

                  {/* Total Baris Sisa */}
                  <tr className="bg-sky-50/60 font-semibold text-slate-900 border-t-2 border-slate-300">
                    <td className="py-2.5 px-3 font-sans">Hari Ini</td>
                    <td className="py-2.5 px-3 font-sans">Semua Kolam</td>
                    <td className="py-2.5 px-3 font-sans">Total Stok Ikan Menunggu Terjual</td>
                    <td className="py-2.5 px-3 text-center font-sans">—</td>
                    <td className="py-2.5 px-3 text-right">680 kg</td>
                    <td className="py-2.5 px-3 text-right">620 kg</td>
                    <td className="py-2.5 px-3 text-right">—</td>
                    <td className="py-2.5 px-3 text-right text-sky-800 text-sm font-bold">
                      {rupiah(summary.totalPenjualanTerkumpul)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Peringatan Lapangan (FR-100) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-clean p-4 border-slate-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Sisa Stok Panen Kolam A4 (60 kg)
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Kolam A4 sudah kosong dan dapat ditebar bibit baru. Jual sisa 60 kg ikan lele untuk menutup modal berjalan.
            </p>
          </div>
        </div>

        <div className="card-clean p-4 border-slate-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Target Panen Kolam A2 (H-13 Menuju Panen)
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Periksa kebutuhan pakan akhir (finisher) dan hubungi pengepul atau warung langganan untuk penyerapan hasil panen.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
