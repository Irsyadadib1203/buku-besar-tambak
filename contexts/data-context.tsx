"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  Pond,
  Cycle,
  Species,
  Asset,
  DashboardSummary,
} from "@/types/pond";
import {
  fetchPondsAndCycles,
  calculateDashboardSummary,
  syncPondToSupabase,
  deletePondFromSupabase,
  syncCycleToSupabase,
  syncFeedBatchToSupabase,
  syncMortalityToSupabase,
  syncHarvestToSupabase,
  syncSaleToSupabase,
  syncStockAdjustmentToSupabase,
  syncExpenseToSupabase,
  syncAssetToSupabase,
} from "@/lib/supabase/pond-service";

interface DataContextType {
  ponds: Pond[];
  cycles: Cycle[];
  speciesList: Species[];
  assets: Asset[];
  selectedPondId: string;
  setSelectedPondId: (id: string) => void;
  includePenyusutan: boolean;
  setIncludePenyusutan: (val: boolean) => void;
  notification: string | null;
  showNotification: (msg: string) => void;
  summary: DashboardSummary;
  
  // Handlers
  startCycle: (data: any) => void;
  saveFeedBatch: (data: any) => void;
  markFeedFinished: (batchId: string) => void;
  saveMortality: (data: any) => void;
  saveHarvest: (data: any) => void;
  saveSale: (data: any) => void;
  saveStockAdjustment: (data: any) => void;
  saveExpense: (data: any) => void;
  finalizeCycle: (cycleId: string) => void;

  // CRUD
  addPond: (pond: Omit<Pond, "id">) => void;
  updatePond: (id: string, pond: Partial<Pond>) => void;
  archivePond: (id: string) => void;
  deletePond: (id: string) => void;
  addAsset: (asset: Omit<Asset, "id">) => void;
  retireAsset: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedPondId, setSelectedPondId] = useState<string>("");
  const [includePenyusutan, setIncludePenyusutan] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4500);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchPondsAndCycles();
        setPonds(data.ponds);
        setCycles(data.cycles);
        setSpeciesList(data.species);
        setAssets(data.assets);
        if (data.ponds.length > 0) {
          setSelectedPondId(data.ponds[0].id);
        }
      } catch (error) {
        console.error("Gagal memuat data:", error);
        showNotification(error instanceof Error ? error.message : "Gagal memuat data.");
      }
    }
    loadData();
  }, []);

  const summary = useMemo(() => {
    return calculateDashboardSummary(ponds, cycles);
  }, [ponds, cycles]);

  const saveAndSync = (nextPonds: Pond[], nextCycles: Cycle[], nextAssets: Asset[] = assets) => {
    setPonds(nextPonds);
    setCycles(nextCycles);
    setAssets(nextAssets);
  };

  const syncOrNotify = (operation: Promise<unknown>) => {
    void operation.catch((error) => {
      console.error("Gagal menyimpan perubahan:", error);
      showNotification(error instanceof Error ? error.message : "Perubahan belum tersimpan.");
    });
  };

  const createId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

  const startCycle = (data: any) => {
    if (!data.pondId || !Number.isFinite(data.initialCount) || data.initialCount <= 0) {
      showNotification("Pilih kolam dan isi jumlah bibit yang valid.");
      return;
    }
    if (cycles.some((cycle) => cycle.pondId === data.pondId && cycle.status === "AKTIF")) {
      showNotification("Kolam ini masih memiliki siklus aktif.");
      return;
    }
    const cycleId = createId("cy");
    const initialSeedExpense = {
      id: `ex-${cycleId}-bibit`,
      cycleId,
      category: "Bibit",
      spentAt: data.stockedAt,
      description: `${data.initialCount.toLocaleString("id-ID")} benih ${data.speciesName || "ikan"}`,
      qty: data.initialCount,
      unitPrice: Math.round(data.seedCost / data.initialCount),
      total: data.seedCost,
    };

    const newCycle: Cycle = {
      id: cycleId,
      pondId: data.pondId,
      speciesId: data.speciesId,
      speciesName: data.speciesName,
      status: "AKTIF",
      stockedAt: data.stockedAt,
      initialCount: data.initialCount,
      initialSizeCm: data.initialSizeCm,
      expectedSizePerKg: data.expectedSizePerKg,
      seedSupplier: data.seedSupplier,
      note: data.note,
      feedBatches: [],
      mortalities: [],
      harvests: [],
      sales: [],
      stockAdjustments: [],
      expenses: [initialSeedExpense],
    };

    const nextCycles = [...cycles, newCycle];
    const nextPonds = ponds.map((p) => (p.id === data.pondId ? { ...p, status: "AKTIF" as const } : p));
    saveAndSync(nextPonds, nextCycles);
    setSelectedPondId(data.pondId);
    showNotification(`Siklus baru untuk Kolam ${data.pondId} resmi dimulai.`);

    // Supabase sync
    syncOrNotify(syncCycleToSupabase(newCycle));
    const updatedPond = nextPonds.find(p => p.id === data.pondId);
    if (updatedPond) syncOrNotify(syncPondToSupabase(updatedPond));
    syncOrNotify(syncExpenseToSupabase(initialSeedExpense));
  };

  const saveFeedBatch = (data: any) => {
    const newBatch = { ...data, id: createId("fb") };
    const nextCycles = cycles.map((c) => {
      if (c.id !== data.cycleId) return c;
      return { ...c, feedBatches: [...(c.feedBatches || []), newBatch] };
    });
    saveAndSync(ponds, nextCycles);
    showNotification(`Batch pakan ${data.feedType} berhasil dicatat.`);

    // Supabase sync
    syncOrNotify(syncFeedBatchToSupabase(newBatch));
  };

  const markFeedFinished = (batchId: string) => {
    const today = new Date().toISOString().split("T")[0];
    let updatedBatchObj: any = null;

    const nextCycles = cycles.map((c) => {
      const batchExists = c.feedBatches.some((b) => b.id === batchId);
      if (!batchExists) return c;
      return {
        ...c,
        feedBatches: c.feedBatches.map((b) => {
          if (b.id === batchId) {
            updatedBatchObj = { ...b, finishedAt: today };
            return updatedBatchObj;
          }
          return b;
        }),
      };
    });
    saveAndSync(ponds, nextCycles);
    showNotification("Pakan berhasil ditandai habis.");

    if (updatedBatchObj) {
      syncOrNotify(syncFeedBatchToSupabase(updatedBatchObj));
    }
  };

  const saveMortality = (data: any) => {
    const newM = { ...data, id: createId("m") };
    const nextCycles = cycles.map((c) => {
      if (c.id !== data.cycleId) return c;
      return { ...c, mortalities: [...(c.mortalities || []), newM] };
    });
    saveAndSync(ponds, nextCycles);
    showNotification(`Kematian ${data.count} ekor ikan dicatat.`);

    // Supabase sync
    syncOrNotify(syncMortalityToSupabase(newM));
  };

  const saveHarvest = (data: any) => {
    let targetPondId = "";
    let shouldReleasePond = false;
    const newH = { ...data, id: createId("h") };
    let updatedCycleObj: any = null;

    const nextCycles = cycles.map((c) => {
      if (c.id !== data.cycleId) return c;
      targetPondId = c.pondId;
      const updatedHarvests = [...(c.harvests || []), newH];
      
      const totalMati = (c.mortalities || []).reduce((sum, m) => sum + m.count, 0);
      const totalPanen = updatedHarvests.reduce((sum, h) => sum + h.count, 0);
      const populasiSisa = Math.max(0, c.initialCount - totalMati - totalPanen);
      
      shouldReleasePond = populasiSisa === 0 || data.note?.includes("tuntas") || false;

      updatedCycleObj = {
        ...c,
        harvests: updatedHarvests,
        status: shouldReleasePond ? ("PENJUALAN" as const) : c.status,
        releasedAt: shouldReleasePond ? data.harvestedAt : c.releasedAt,
      };

      return updatedCycleObj;
    });

    const nextPonds = ponds.map((p) =>
      p.id === targetPondId && shouldReleasePond ? { ...p, status: "KOSONG" as const } : p
    );
    saveAndSync(nextPonds, nextCycles);
    showNotification(`Panen ${data.kg} kg dicatat.`);

    // Supabase sync
    syncOrNotify(syncHarvestToSupabase(newH));
    if (updatedCycleObj) syncOrNotify(syncCycleToSupabase(updatedCycleObj));
    const releasedPond = nextPonds.find(p => p.id === targetPondId);
    if (releasedPond) syncOrNotify(syncPondToSupabase(releasedPond));
  };

  const saveSale = (data: any) => {
    const newSale = { ...data, id: createId("s"), isPaid: true };
    const nextCycles = cycles.map((c) => {
      if (c.id !== data.cycleId) return c;
      return { ...c, sales: [...(c.sales || []), newSale] };
    });
    saveAndSync(ponds, nextCycles);
    showNotification(`Penjualan ${data.kg} kg berhasil dicatat.`);

    // Supabase sync
    syncOrNotify(syncSaleToSupabase(newSale));
  };

  const saveStockAdjustment = (data: any) => {
    const newAdj = { ...data, id: createId("adj") };
    const nextCycles = cycles.map((c) => {
      if (c.id !== data.cycleId) return c;
      return { ...c, stockAdjustments: [...(c.stockAdjustments || []), newAdj] };
    });
    saveAndSync(ponds, nextCycles);
    showNotification(`Susut stok ${data.kg} kg dicatat.`);

    // Supabase sync
    syncOrNotify(syncStockAdjustmentToSupabase(newAdj));
  };

  const saveExpense = (data: any) => {
    const newExp = { ...data, id: createId("ex") };
    const nextCycles = cycles.map((c) => {
      if (c.id !== data.cycleId) return c;
      return { ...c, expenses: [...(c.expenses || []), newExp] };
    });
    saveAndSync(ponds, nextCycles);
    showNotification(`Biaya ${data.category} sebesar Rp ${Number(data.total).toLocaleString("id-ID")} dicatat.`);

    // Supabase sync
    syncOrNotify(syncExpenseToSupabase(newExp));
  };

  const finalizeCycle = (cycleId: string) => {
    const today = new Date().toISOString().split("T")[0];
    let finalCycleObj: any = null;

    const nextCycles = cycles.map((c) => {
      if (c.id !== cycleId) return c;
      finalCycleObj = { ...c, status: "SELESAI" as const, closedAt: today };
      return finalCycleObj;
    });

    saveAndSync(ponds, nextCycles);
    showNotification("Siklus berhasil difinalisasi.");

    if (finalCycleObj) {
      syncOrNotify(syncCycleToSupabase(finalCycleObj));
    }
  };

  const addPond = (pond: Omit<Pond, "id">) => {
    const newId = createId("pond");
    const newPondObj = { ...pond, id: newId };
    const newPonds = [...ponds, newPondObj];
    saveAndSync(newPonds, cycles);
    showNotification(`Kolam ${pond.name} berhasil ditambahkan.`);

    // Supabase sync
    syncOrNotify(syncPondToSupabase(newPondObj));
  };

  const updatePond = (id: string, updates: Partial<Pond>) => {
    let updatedPondObj: any = null;
    const newPonds = ponds.map((p) => {
      if (p.id === id) {
        updatedPondObj = { ...p, ...updates };
        return updatedPondObj;
      }
      return p;
    });
    saveAndSync(newPonds, cycles);
    showNotification("Data kolam berhasil diperbarui.");

    if (updatedPondObj) {
      syncOrNotify(syncPondToSupabase(updatedPondObj));
    }
  };

  const archivePond = (id: string) => {
    updatePond(id, { status: "NONAKTIF" });
  };

  const deletePond = (id: string) => {
    const newPonds = ponds.filter((p) => p.id !== id);
    const newCycles = cycles.filter((cycle) => cycle.pondId !== id);
    saveAndSync(newPonds, newCycles);
    showNotification("Kolam berhasil dihapus.");

    // Supabase sync
    syncOrNotify(deletePondFromSupabase(id));
  };

  const addAsset = (asset: Omit<Asset, "id">) => {
    const newId = createId("ast");
    const newAssetObj = { ...asset, id: newId };
    const newAssets = [...assets, newAssetObj];
    saveAndSync(ponds, cycles, newAssets);
    showNotification(`Aset "${asset.name}" berhasil ditambahkan.`);

    // Supabase sync
    syncOrNotify(syncAssetToSupabase(newAssetObj));
  };

  const retireAsset = (id: string) => {
    let retiredAssetObj: any = null;
    const newAssets = assets.map((a) => {
      if (a.id === id) {
        retiredAssetObj = { ...a, retired: true };
        return retiredAssetObj;
      }
      return a;
    });
    saveAndSync(ponds, cycles, newAssets);
    showNotification("Aset berhasil ditandai afkir/nonaktif.");

    if (retiredAssetObj) {
      syncOrNotify(syncAssetToSupabase(retiredAssetObj));
    }
  };

  return (
    <DataContext.Provider
      value={{
        ponds,
        cycles,
        speciesList,
        assets,
        selectedPondId,
        setSelectedPondId,
        includePenyusutan,
        setIncludePenyusutan,
        notification,
        showNotification,
        summary,
        startCycle,
        saveFeedBatch,
        markFeedFinished,
        saveMortality,
        saveHarvest,
        saveSale,
        saveStockAdjustment,
        saveExpense,
        finalizeCycle,
        addPond,
        updatePond,
        archivePond,
        deletePond,
        addAsset,
        retireAsset,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
