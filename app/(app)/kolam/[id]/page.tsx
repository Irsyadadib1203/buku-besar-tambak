"use client";

import { useEffect, useMemo, useState } from "react";
import { useData } from "@/contexts/data-context";
import { PondDetail } from "@/components/tambak/PondDetail";
import { QuickLogDialog } from "@/components/tambak/QuickLogDialog";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PondDetailPage() {
  const routeParams = useParams();
  const pondId = typeof routeParams?.id === "string" ? routeParams.id : "";

  const { 
    ponds, 
    cycles, 
    includePenyusutan, 
    setSelectedPondId,
    markFeedFinished,
    finalizeCycle,
    saveFeedBatch,
    saveMortality,
    saveHarvest,
    saveSale,
    saveStockAdjustment
  } = useData();
  
  const router = useRouter();
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const [quickLogTab, setQuickLogTab] = useState<"pakan" | "mati" | "panen" | "jual" | "susut">("pakan");

  useEffect(() => {
    if (pondId) {
      setSelectedPondId(pondId);
    }
  }, [pondId, setSelectedPondId]);

  const selectedPond = useMemo(() => {
    return ponds.find((p) => p.id === pondId) || ponds[0];
  }, [ponds, pondId]);

  const selectedCycle = useMemo(() => {
    return (
      cycles.find((c) => c.pondId === pondId && c.status === "AKTIF") ||
      cycles.find((c) => c.pondId === pondId && c.status === "PENJUALAN") ||
      cycles.find((c) => c.pondId === pondId)
    );
  }, [cycles, pondId]);

  if (!selectedPond) {
    return <div>Kolam tidak ditemukan.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/kolam">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Detail {selectedPond.name}</h2>
        </div>
      </div>

      <PondDetail
        pond={selectedPond}
        cycle={selectedCycle}
        includePenyusutan={includePenyusutan}
        onOpenQuickLog={(tabName) => {
          if (tabName) setQuickLogTab(tabName as any);
          setQuickLogOpen(true);
        }}
        onOpenNewPond={() => router.push('/siklus/baru')}
        onMarkFeedFinished={markFeedFinished}
        onFinalizeCycle={finalizeCycle}
      />

      <QuickLogDialog
        isOpen={quickLogOpen}
        onClose={() => setQuickLogOpen(false)}
        ponds={ponds}
        cycles={cycles}
        defaultPondId={pondId}
        initialTab={quickLogTab}
        onSaveFeedBatch={saveFeedBatch}
        onSaveMortality={saveMortality}
        onSaveHarvest={saveHarvest}
        onSaveSale={saveSale}
        onSaveStockAdjustment={saveStockAdjustment}
      />
    </div>
  );
}
