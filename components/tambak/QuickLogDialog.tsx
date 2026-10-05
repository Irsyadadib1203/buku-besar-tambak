"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pond, Cycle, SaleChannel, AdjustReason } from "@/types/pond";
import { Utensils, Skull, ShoppingBag, PackageCheck, AlertCircle } from "lucide-react";

type ActionTab = "pakan" | "mati" | "panen" | "jual" | "susut";

interface QuickLogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ponds: Pond[];
  cycles: Cycle[];
  defaultPondId: string;
  initialTab?: ActionTab;
  onSaveFeedBatch: (data: {
    cycleId: string;
    feedType: string;
    qtyKg: number;
    totalPrice: number;
    startedAt: string;
    finishedAt?: string | null;
    note?: string;
  }) => void;
  onSaveMortality: (data: {
    cycleId: string;
    count: number;
    diedAt: string;
    cause?: string;
  }) => void;
  onSaveHarvest: (data: {
    cycleId: string;
    count: number;
    kg: number;
    harvestedAt: string;
    note?: string;
  }) => void;
  onSaveSale: (data: {
    cycleId: string;
    kg: number;
    pricePerKg: number;
    total: number;
    channel: SaleChannel;
    buyer?: string;
    soldAt: string;
    note?: string;
  }) => void;
  onSaveStockAdjustment: (data: {
    cycleId: string;
    kg: number;
    reason: AdjustReason;
    adjustedAt: string;
    note?: string;
  }) => void;
}

export function QuickLogDialog({
  isOpen,
  onClose,
  ponds,
  cycles,
  defaultPondId,
  initialTab = "pakan",
  onSaveFeedBatch,
  onSaveMortality,
  onSaveHarvest,
  onSaveSale,
  onSaveStockAdjustment,
}: QuickLogDialogProps) {
  const [tab, setTab] = useState<ActionTab>(initialTab);
  const [selectedPondId, setSelectedPondId] = useState<string>(defaultPondId || "");

  // State Pakan
  const [feedType, setFeedType] = useState<string>("");
  const [feedQtyKg, setFeedQtyKg] = useState<string>("");
  const [feedTotalPrice, setFeedTotalPrice] = useState<string>("");
  const [feedPricePerKg, setFeedPricePerKg] = useState<string>("");
  const [feedStartedAt, setFeedStartedAt] = useState<string>(new Date().toISOString().split("T")[0]);
  const [feedFinishedDays, setFeedFinishedDays] = useState<string>("");

  // State Kematian
  const [deadCount, setDeadCount] = useState<string>("");
  const [deadCause, setDeadCause] = useState<string>("");
  const [deadDate, setDeadDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // State Panen
  const [harvestCount, setHarvestCount] = useState<string>("");
  const [harvestKg, setHarvestKg] = useState<string>("");
  const [harvestDate, setHarvestDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [isFullHarvest, setIsFullHarvest] = useState<boolean>(false);

  // State Penjualan
  const [saleKg, setSaleKg] = useState<string>("");
  const [salePricePerKg, setSalePricePerKg] = useState<string>("");
  const [saleTotal, setSaleTotal] = useState<string>("");
  const [saleChannel, setSaleChannel] = useState<SaleChannel>("ECERAN");
  const [saleBuyer, setSaleBuyer] = useState<string>("");
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // State Susut
  const [susutKg, setSusutKg] = useState<string>("");
  const [susutReason, setSusutReason] = useState<AdjustReason>("SUSUT");

  // Cari siklus yang sesuai dengan kolam terpilih
  const currentCycle = cycles.find(
    (c) => c.pondId === selectedPondId && (tab === "jual" ? c.status !== "SELESAI" : c.status === "AKTIF")
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (initialTab) setTab(initialTab);
      if (defaultPondId) setSelectedPondId(defaultPondId);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialTab, defaultPondId, isOpen]);

  // Auto calculate pakan price
  const handleFeedQtyChange = (val: string) => {
    setFeedQtyKg(val);
    const q = parseFloat(val) || 0;
    const p = parseFloat(feedPricePerKg) || 0;
    if (q > 0 && p > 0) {
      setFeedTotalPrice(Math.round(q * p).toString());
    }
  };

  const handleFeedTotalChange = (val: string) => {
    setFeedTotalPrice(val);
    const tot = parseFloat(val) || 0;
    const q = parseFloat(feedQtyKg) || 0;
    if (q > 0 && tot > 0) {
      setFeedPricePerKg(Math.round(tot / q).toString());
    }
  };

  // Auto calculate penjualan
  const handleSaleKgChange = (val: string) => {
    setSaleKg(val);
    const kgVal = parseFloat(val) || 0;
    const pVal = parseFloat(salePricePerKg) || 0;
    if (kgVal > 0 && pVal > 0) {
      setSaleTotal(Math.round(kgVal * pVal).toString());
    }
  };

  const handleSalePriceChange = (val: string) => {
    setSalePricePerKg(val);
    const kgVal = parseFloat(saleKg) || 0;
    const pVal = parseFloat(val) || 0;
    if (kgVal > 0 && pVal > 0) {
      setSaleTotal(Math.round(kgVal * pVal).toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCycle) return;

    if (tab === "pakan") {
      let finDate: string | null = null;
      if (feedFinishedDays && parseInt(feedFinishedDays) > 0) {
        const d = new Date(feedStartedAt);
        d.setDate(d.getDate() + parseInt(feedFinishedDays) - 1);
        finDate = d.toISOString().split("T")[0];
      }
      onSaveFeedBatch({
        cycleId: currentCycle.id,
        feedType,
        qtyKg: parseFloat(feedQtyKg) || 0,
        totalPrice: parseFloat(feedTotalPrice) || 0,
        startedAt: feedStartedAt,
        finishedAt: finDate,
      });
    } else if (tab === "mati") {
      onSaveMortality({
        cycleId: currentCycle.id,
        count: parseInt(deadCount) || 0,
        diedAt: deadDate,
        cause: deadCause,
      });
    } else if (tab === "panen") {
      onSaveHarvest({
        cycleId: currentCycle.id,
        count: parseInt(harvestCount) || 0,
        kg: parseFloat(harvestKg) || 0,
        harvestedAt: harvestDate,
        note: isFullHarvest ? "Panen kuras tuntas" : "Panen bertahap",
      });
    } else if (tab === "jual") {
      onSaveSale({
        cycleId: currentCycle.id,
        kg: parseFloat(saleKg) || 0,
        pricePerKg: parseFloat(salePricePerKg) || 0,
        total: parseFloat(saleTotal) || 0,
        channel: saleChannel,
        buyer: saleBuyer,
        soldAt: saleDate,
      });
    } else if (tab === "susut") {
      onSaveStockAdjustment({
        cycleId: currentCycle.id,
        kg: parseFloat(susutKg) || 0,
        reason: susutReason,
        adjustedAt: new Date().toISOString().split("T")[0],
      });
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border-slate-200 text-slate-900 shadow-xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900">
            Catat Cepat Lapangan
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Input singkat nyaman untuk pencatatan langsung di sisi kolam.
          </DialogDescription>
        </DialogHeader>

        {/* 5 Tab Pilihan Aksi (FR-50, FR-60, FR-70, FR-80, FR-83) */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 rounded-lg text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setTab("pakan")}
            className={`py-1.5 rounded-md transition-all ${
              tab === "pakan" ? "bg-white text-sky-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pakan
          </button>
          <button
            type="button"
            onClick={() => setTab("mati")}
            className={`py-1.5 rounded-md transition-all ${
              tab === "mati" ? "bg-white text-rose-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Mati
          </button>
          <button
            type="button"
            onClick={() => setTab("panen")}
            className={`py-1.5 rounded-md transition-all ${
              tab === "panen" ? "bg-white text-sky-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Panen
          </button>
          <button
            type="button"
            onClick={() => setTab("jual")}
            className={`py-1.5 rounded-md transition-all ${
              tab === "jual" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Jual
          </button>
          <button
            type="button"
            onClick={() => setTab("susut")}
            className={`py-1.5 rounded-md transition-all ${
              tab === "susut" ? "bg-white text-amber-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Susut
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Pemilih Kolam (FR-22) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Kolam Sasaran
            </label>
            <select
              value={selectedPondId}
              onChange={(e) => setSelectedPondId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-sky-500"
            >
              {ponds.map((p) => {
                const cy = cycles.find((c) => c.pondId === p.id && c.status !== "SELESAI");
                return (
                  <option key={p.id} value={p.id}>
                    Kolam {p.id} {cy ? `• ${cy.speciesName} (${cy.status})` : "(Kosong)"}
                  </option>
                );
              })}
            </select>
          </div>

          {/* TAB 1: PAKAN PER BATCH (FR-50) */}
          {tab === "pakan" && (
            <div className="space-y-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Jenis / Merk Pakan (Autocomplete)
                </label>
                <input
                  type="text"
                  list="feedSuggestions"
                  value={feedType}
                  onChange={(e) => setFeedType(e.target.value)}
                  placeholder="mis. PF800, 781-1, Sinta Nila"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                  required
                />
                <datalist id="feedSuggestions">
                  <option value="PF800" />
                  <option value="PF1000" />
                  <option value="781-1" />
                  <option value="781-2" />
                  <option value="Sinta Nila Grower" />
                  <option value="Nila Finisher" />
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Berat Pakan (kg)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    value={feedQtyKg}
                    onChange={(e) => handleFeedQtyChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-base font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Harga Total (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={feedTotalPrice}
                    onChange={(e) => handleFeedTotalChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-base font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Mulai Dipakai
                  </label>
                  <input
                    type="date"
                    value={feedStartedAt}
                    onChange={(e) => setFeedStartedAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Habis Dalam (Hari) <span className="font-normal text-slate-400">opsional</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={feedFinishedDays}
                    onChange={(e) => setFeedFinishedDays(e.target.value)}
                    placeholder="kosongkan bila masih berjalan"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IKAN MATI (FR-60) */}
          {tab === "mati" && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jumlah Mati (Ekor)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={deadCount}
                    onChange={(e) => setDeadCount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-base font-bold text-rose-600"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Kematian
                  </label>
                  <input
                    type="date"
                    value={deadDate}
                    onChange={(e) => setDeadDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Penyebab (Opsional)
                </label>
                <input
                  type="text"
                  value={deadCause}
                  onChange={(e) => setDeadCause(e.target.value)}
                  placeholder="mis. perubahan suhu, kanibalisme, jamur"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>
          )}

          {/* TAB 3: PANEN (FR-70) */}
          {tab === "panen" && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jumlah Ikan Dipanen (Ekor)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={harvestCount}
                    onChange={(e) => setHarvestCount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-base font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Total Berat Panen (kg)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.5"
                    value={harvestKg}
                    onChange={(e) => setHarvestKg(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-base font-bold text-sky-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tanggal Panen
                </label>
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fullHarvest"
                  checked={isFullHarvest}
                  onChange={(e) => setIsFullHarvest(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="fullHarvest" className="text-xs text-slate-700 cursor-pointer">
                  Tandai panen total (kosongkan kolam agar bisa ditebar lagi)
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: JUAL (FR-80) */}
          {tab === "jual" && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Saluran Penjualan
                  </label>
                  <select
                    value={saleChannel}
                    onChange={(e) => setSaleChannel(e.target.value as SaleChannel)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold"
                  >
                    <option value="ECERAN">Eceran (Warung / Pasar)</option>
                    <option value="PENGEPUL">Pengepul (Borongan)</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Pembeli
                  </label>
                  <input
                    type="text"
                    value={saleBuyer}
                    onChange={(e) => setSaleBuyer(e.target.value)}
                    placeholder="misal: Pak H. Supri"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Berat (kg)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={saleKg}
                    onChange={(e) => handleSaleKgChange(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 font-mono text-sm font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Harga / kg
                  </label>
                  <input
                    type="number"
                    value={salePricePerKg}
                    onChange={(e) => handleSalePriceChange(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 font-mono text-sm font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Total (Rp)
                  </label>
                  <input
                    type="number"
                    value={saleTotal}
                    onChange={(e) => setSaleTotal(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-300 font-mono text-sm font-bold text-emerald-700"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SUSUT STOK (FR-83) */}
          {tab === "susut" && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Berat Susut (kg)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    value={susutKg}
                    onChange={(e) => setSusutKg(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-base font-bold text-amber-700"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alasan Susut
                  </label>
                  <select
                    value={susutReason}
                    onChange={(e) => setSusutReason(e.target.value as AdjustReason)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  >
                    <option value="SUSUT">Susut Timbangan</option>
                    <option value="MATI">Mati Pasca Panen</option>
                    <option value="KONSUMSI">Konsumsi Sendiri</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Susut stok akan mengurangi stok panen yang ada tanpa menambah pendapatan buku kas.
              </p>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs h-8.5">
              Batal
            </Button>
            <Button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white text-xs h-8.5 font-medium">
              Simpan Transaksi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
