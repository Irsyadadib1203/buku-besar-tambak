"use client";

import { useData } from "@/contexts/data-context";
import { OverviewCards } from "@/components/tambak/OverviewCards";
import { FinancialBreakdown } from "@/components/tambak/FinancialBreakdown";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { summary, ponds, cycles, includePenyusutan } = useData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ringkasan Tambak</h2>
          <p className="text-sm text-slate-500">Monitor kinerja operasional dan finansial.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="bg-white">
            <Link href="/pakan">Catat Pakan</Link>
          </Button>
          <Button asChild className="bg-sky-600 hover:bg-sky-700 text-white">
            <Link href="/siklus/baru">
              <Plus className="w-4 h-4 mr-2" />
              Tebar Baru
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Dashboard */}
      <OverviewCards summary={summary} includePenyusutan={includePenyusutan} />

      {/* Financial Analytics */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Analisis Finansial & Proyeksi</h3>
        <FinancialBreakdown 
          summary={summary}
          cycles={cycles}
          ponds={ponds}
          includePenyusutan={includePenyusutan}
        />
      </div>
    </div>
  );
}
