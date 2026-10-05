"use client";

import { Wallet, TrendingUp, PackageCheck, Fish, ArrowUpRight } from "lucide-react";
import { DashboardSummary } from "@/types/pond";

interface OverviewCardsProps {
  summary: DashboardSummary;
  includePenyusutan: boolean;
}

export function OverviewCards({ summary, includePenyusutan }: OverviewCardsProps) {
  const rupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  const numberFormat = (val: number) =>
    new Intl.NumberFormat("id-ID").format(val);

  return (
    <section id="ringkasan" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Biaya Berjalan */}
      <div className="card-clean p-4.5 flex flex-col justify-between border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Biaya Berjalan
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {rupiah(summary.totalBiayaBerjalan)}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <span>{includePenyusutan ? "Biaya penuh (termasuk penyusutan)" : "Biaya tunai operasional riil"}</span>
          </p>
        </div>
      </div>

      {/* 2. Penjualan & Progres Balik Modal */}
      <div className="card-clean p-4.5 flex flex-col justify-between border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Penjualan Terkumpul
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {rupiah(summary.totalPenjualanTerkumpul)}
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, summary.persenBalikModalGlobal)}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-emerald-700">
              {summary.persenBalikModalGlobal.toFixed(1)}% BEP
            </span>
          </div>
        </div>
      </div>

      {/* 3. Stok Menunggu Terjual (FR-87) */}
      <div className="card-clean p-4.5 flex flex-col justify-between border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Stok Menunggu Terjual
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <PackageCheck className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {summary.totalStokMenungguJualKg}{" "}
            <span className="text-base font-normal text-slate-500">kg</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {summary.totalStokMenungguJualKg > 0
              ? `${summary.siklusPenjualanCount} siklus siap jual eceran / pengepul`
              : "Semua hasil panen telah habis terjual"}
          </p>
        </div>
      </div>

      {/* 4. Populasi Hidup */}
      <div className="card-clean p-4.5 flex flex-col justify-between border-slate-200">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Populasi Ikan Hidup
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Fish className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {numberFormat(summary.totalPopulasiHidup)}{" "}
            <span className="text-base font-normal text-slate-500">ekor</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {summary.kolamAktifCount} kolam sedang pembesaran aktif
          </p>
        </div>
      </div>
    </section>
  );
}
