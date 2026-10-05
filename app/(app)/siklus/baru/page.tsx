"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/contexts/data-context";
import { Button } from "@/components/ui/button";

export default function BaruPage() {
  const { ponds, speciesList, startCycle } = useData();
  const router = useRouter();

  const availablePonds = ponds.filter((p) => p.status === "KOSONG");
  const defaultPond = availablePonds[0]?.id || "";

  const [pondId, setPondId] = useState<string>(defaultPond);
  const [speciesId, setSpeciesId] = useState<string>(speciesList[0]?.id || "sp-lele-sang");
  const [initialCount, setInitialCount] = useState<string>("");
  const [initialSizeCm, setInitialSizeCm] = useState<string>("");
  const [seedCost, setSeedCost] = useState<string>("");
  const [stockedAt, setStockedAt] = useState<string>(new Date().toISOString().split("T")[0]);
  const [seedSupplier, setSeedSupplier] = useState<string>("");
  const [expectedSizePerKg, setExpectedSizePerKg] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const selectedSpecies = speciesList.find((s) => s.id === speciesId) || speciesList[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pondId) return alert("Pilih kolam yang tersedia!");

    startCycle({
      pondId,
      speciesId,
      speciesName: selectedSpecies?.name || "Ikan",
      stockedAt,
      initialCount: parseInt(initialCount, 10) || 0,
      initialSizeCm: parseFloat(initialSizeCm) || 0,
      seedCost: parseFloat(seedCost) || 0,
      seedSupplier,
      expectedSizePerKg: parseInt(expectedSizePerKg, 10) || selectedSpecies?.targetSizePerKg || 8,
      note,
    });
    router.push(`/kolam/${pondId}`);
  };

  if (availablePonds.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-2">Tidak ada kolam kosong</h2>
        <p className="text-slate-500 mb-4">Semua kolam saat ini sedang aktif atau dinonaktifkan.</p>
        <Button onClick={() => router.push('/kolam')}>Kembali ke Kolam</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Tebar Siklus Baru</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Pilih Kolam (Siap Tebar)</label>
          <select
            value={pondId}
            onChange={(e) => setPondId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300"
            required
          >
            {availablePonds.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.status})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Master Jenis Ikan</label>
          <select
            value={speciesId}
            onChange={(e) => {
              setSpeciesId(e.target.value);
              const sp = speciesList.find((s) => s.id === e.target.value);
              if (sp?.targetSizePerKg) setExpectedSizePerKg(sp.targetSizePerKg.toString());
            }}
            className="w-full px-3 py-2 rounded-lg border border-slate-300"
            required
          >
            {speciesList.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Jumlah Bibit (Ekor)</label>
            <input
              type="number"
              min="100"
              value={initialCount}
              onChange={(e) => setInitialCount(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ukuran Awal (cm)</label>
            <input
              type="number"
              step="0.5"
              min="1"
              value={initialSizeCm}
              onChange={(e) => setInitialSizeCm(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Biaya Total Bibit (Rp)</label>
            <input
              type="number"
              min="0"
              value={seedCost}
              onChange={(e) => setSeedCost(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Supplier Bibit</label>
            <input
              type="text"
              value={seedSupplier}
              onChange={(e) => setSeedSupplier(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tanggal Tebar</label>
            <input
              type="date"
              value={stockedAt}
              onChange={(e) => setStockedAt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Panen (ekor/kg)</label>
            <input
              type="number"
              min="1"
              value={expectedSizePerKg}
              onChange={(e) => setExpectedSizePerKg(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Catatan</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 h-24"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white">Mulai Tebar</Button>
        </div>
      </form>
    </div>
  );
}
