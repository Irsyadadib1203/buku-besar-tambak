"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pond, Species } from "@/types/pond";

interface NewPondDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ponds: Pond[];
  speciesList: Species[];
  preselectedPondId?: string;
  onStartCycle: (data: {
    pondId: string;
    speciesId: string;
    speciesName: string;
    stockedAt: string;
    initialCount: number;
    initialSizeCm: number;
    seedCost: number;
    seedSupplier?: string;
    expectedSizePerKg: number;
    note?: string;
  }) => void;
}

export function NewPondDialog({
  isOpen,
  onClose,
  ponds,
  speciesList,
  preselectedPondId,
  onStartCycle,
}: NewPondDialogProps) {
  // Hanya kolam yang tidak memiliki siklus aktif (kolam kosong atau kolam berstatus PENJUALAN)
  const availablePonds = ponds.filter((p) => p.status === "KOSONG" || p.id === preselectedPondId);
  const defaultPond = preselectedPondId || availablePonds[0]?.id || "";

  const [pondId, setPondId] = useState<string>(defaultPond);
  const [speciesId, setSpeciesId] = useState<string>(speciesList[0]?.id || "");
  const [initialCount, setInitialCount] = useState<string>("");
  const [initialSizeCm, setInitialSizeCm] = useState<string>("");
  const [seedCost, setSeedCost] = useState<string>("");
  const [stockedAt, setStockedAt] = useState<string>(new Date().toISOString().split("T")[0]);
  const [seedSupplier, setSeedSupplier] = useState<string>("");
  const [expectedSizePerKg, setExpectedSizePerKg] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const selectedPondId = availablePonds.some((pond) => pond.id === pondId) ? pondId : defaultPond;
  const selectedSpeciesId = speciesList.some((species) => species.id === speciesId)
    ? speciesId
    : (speciesList[0]?.id || "");
  const selectedSpecies = speciesList.find((s) => s.id === selectedSpeciesId) || speciesList[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartCycle({
      pondId: selectedPondId,
      speciesId: selectedSpeciesId,
      speciesName: selectedSpecies?.name || "Lele Sangkuriang",
      stockedAt,
      initialCount: parseInt(initialCount, 10) || 0,
      initialSizeCm: parseFloat(initialSizeCm) || 0,
      seedCost: parseFloat(seedCost) || 0,
      seedSupplier,
      expectedSizePerKg: parseInt(expectedSizePerKg, 10) || selectedSpecies?.targetSizePerKg || 8,
      note,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border-slate-200 text-slate-900 shadow-xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900">
            Wizard Tebar Siklus Baru (FR-30)
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Mulai tebar bibit ikan. Pembelian bibit akan otomatis dicatat sebagai biaya kategori Bibit.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Pilih Kolam */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Pilih Kolam (Siap Tebar)
            </label>
            <select
              value={selectedPondId}
              onChange={(e) => setPondId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-sky-500"
            >
              <option value="" disabled>Pilih kolam</option>
              {availablePonds.map((p) => (
                <option key={p.id} value={p.id}>
                  Kolam {p.id} {p.status === "KOSONG" ? "(Kosong - Siap)" : `(${p.status})`}
                </option>
              ))}
            </select>
          </div>

          {/* Master Spesies Ikan Dinamis */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Master Jenis Ikan
            </label>
            <select
              value={selectedSpeciesId}
              onChange={(e) => {
                setSpeciesId(e.target.value);
                const sp = speciesList.find((s) => s.id === e.target.value);
                if (sp?.targetSizePerKg) setExpectedSizePerKg(sp.targetSizePerKg.toString());
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-sky-500"
            >
                <option value="" disabled>Pilih jenis ikan</option>
                {speciesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (Target {s.targetDays} hari • SR {s.targetSr}%)
                </option>
              ))}
            </select>
          </div>

          {/* Jumlah Tebar & Ukuran Bibit */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Jumlah Bibit (Ekor)
              </label>
              <input
                type="number"
                min="100"
                value={initialCount}
                onChange={(e) => setInitialCount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-base font-bold"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ukuran Awal (cm)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={initialSizeCm}
                onChange={(e) => setInitialSizeCm(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-base font-bold"
                placeholder="misal 5-7 cm"
              />
            </div>
          </div>

          {/* Biaya Bibit & Supplier */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Biaya Total Bibit (Rp)
              </label>
              <input
                type="number"
                min="0"
                value={seedCost}
                onChange={(e) => setSeedCost(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-base font-bold text-sky-700"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Supplier Bibit (Opsional)
              </label>
              <input
                type="text"
                value={seedSupplier}
                onChange={(e) => setSeedSupplier(e.target.value)}
                placeholder="nama balai / pembenih"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>

          {/* Tanggal Tebar & Ukuran Target */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Tebar
              </label>
              <input
                type="date"
                value={stockedAt}
                onChange={(e) => setStockedAt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Panen (ekor/kg)
              </label>
              <input
                type="number"
                min="1"
                value={expectedSizePerKg}
                onChange={(e) => setExpectedSizePerKg(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs h-8.5">
              Batal
            </Button>
            <Button type="submit" disabled={!selectedPondId || !selectedSpeciesId} className="bg-sky-600 hover:bg-sky-700 text-white text-xs h-8.5 font-medium">
              Konfirmasi & Mulai Tebar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
