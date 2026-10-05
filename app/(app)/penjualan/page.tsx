"use client";

import { useState } from "react";
import { useData } from "@/contexts/data-context";
import { QuickLogDialog } from "@/components/tambak/QuickLogDialog";
import { ShoppingCart, Plus, PackageCheck, TrendingUp, DollarSign, Scale, AlertCircle } from "lucide-react";
import { calculateCycleAnalytics } from "@/lib/supabase/pond-service";

export default function PenjualanPage() {
  const { 
    ponds, 
    cycles, 
    selectedPondId,
    saveFeedBatch, 
    saveMortality, 
    saveHarvest, 
    saveSale, 
    saveStockAdjustment 
  } = useData();

  const [isLogOpen, setIsLogOpen] = useState(false);
  const [logTab, setLogTab] = useState<"jual" | "susut">("jual");

  const allSales = cycles.flatMap((c) =>
    c.sales.map((s) => ({
      ...s,
      pondId: c.pondId,
      speciesName: c.speciesName,
    }))
  ).sort((a, b) => new Date(b.soldAt).getTime() - new Date(a.soldAt).getTime());

  // Aggregate cycle stock & revenue
  const totalRevenue = allSales.reduce((acc, s) => acc + (s.total || 0), 0);
  const totalKgSold = allSales.reduce((acc, s) => acc + (s.kg || 0), 0);
  const avgPricePerKg = totalKgSold > 0 ? Math.round(totalRevenue / totalKgSold) : 0;

  // Total stock awaiting sale across cycles
  let totalStockAwaitingSale = 0;
  for (const c of cycles) {
    const analytics = calculateCycleAnalytics(c);
    totalStockAwaitingSale += analytics.stokPanenKg;
  }

  const handleOpenLog = (tab: "jual" | "susut") => {
    setLogTab(tab);
    setIsLogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-sky-600" />
            Penjualan Bertahap & Buku Stok Panen
          </h2>
          <p className="text-sm text-slate-500">
            Catat penjualan bertahap (pengepul atau eceran) dan pantau sisa stok hasil panen yang belum terjual.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleOpenLog("susut")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors shadow-xs"
          >
            <AlertCircle className="w-4 h-4 text-slate-500" />
            Catat Susut
          </button>
          <button
            type="button"
            onClick={() => handleOpenLog("jual")}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Catat Penjualan Baru
          </button>
        </div>
      </div>

      {/* KPI Stats Penjualan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Pendapatan Masuk</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Ikan Terjual</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{totalKgSold.toLocaleString("id-ID")} kg</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Stok Menunggu Jual</p>
            <p className="text-xl font-bold text-amber-600 mt-1">{totalStockAwaitingSale.toLocaleString("id-ID")} kg</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Harga Jual Rata-rata</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(avgPricePerKg)}/kg</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Ringkasan Stok Panen Per Siklus */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
        <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
          <PackageCheck className="w-4 h-4 text-sky-600" />
          Buku Posisi Stok Panen per Siklus Kolam
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {cycles.filter((c) => c.harvests.length > 0 || c.status === "PENJUALAN").map((c) => {
            const analytics = calculateCycleAnalytics(c);
            return (
              <div key={c.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-sm">Kolam {c.pondId}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.status === "PENJUALAN" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-slate-500 font-medium">{c.speciesName}</p>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Panen</span>
                    <span className="font-semibold text-slate-700">{analytics.totalKgPanen} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Terjual</span>
                    <span className="font-semibold text-slate-700">{analytics.totalKgTerjual} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Sisa Stok</span>
                    <span className="font-bold text-amber-700">{analytics.stokPanenKg} kg</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabel Riwayat Penjualan */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Riwayat Transaksi Penjualan ({allSales.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500 text-[11px]">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Kolam / Jenis</th>
                <th className="px-4 py-3">Pembeli & Saluran</th>
                <th className="px-4 py-3">Jumlah (Kg)</th>
                <th className="px-4 py-3 text-right">Harga/Kg</th>
                <th className="px-4 py-3 text-right">Total Pendapatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium whitespace-nowrap">
                    {new Date(sale.soldAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">Kolam {sale.pondId}</div>
                    <div className="text-[11px] text-slate-500">{sale.speciesName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{sale.buyer || "Eceran Tanpa Nama"}</div>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      sale.channel === "PENGEPUL" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"
                    }`}>
                      {sale.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {sale.kg} kg
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700">
                    {formatCurrency(sale.pricePerKg)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">
                    {formatCurrency(sale.total)}
                  </td>
                </tr>
              ))}
              {allSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">
                    Belum ada transaksi penjualan yang dicatat.
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
        initialTab={logTab}
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
