"use client";

import { useState } from "react";
import { useData } from "@/contexts/data-context";
import { PondGrid } from "@/components/tambak/PondGrid";
import { NewPondDialog } from "@/components/tambak/NewPondDialog";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit3, ArrowRight, Waves, Box, Info } from "lucide-react";
import { PondType, PondStatus } from "@/types/pond";

export default function PondsPage() {
  const { ponds, cycles, selectedPondId, setSelectedPondId, addPond, deletePond, updatePond, speciesList, startCycle } = useData();
  const router = useRouter();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNewCycleOpen, setIsNewCycleOpen] = useState(false);
  const [preselectedPondId, setPreselectedPondId] = useState<string | undefined>(undefined);

  // Form state for new pond
  const [name, setName] = useState("");
  const [type, setType] = useState<PondType>("TERPAL");
  const [lengthM, setLengthM] = useState<number>(6);
  const [widthM, setWidthM] = useState<number>(4);
  const [depthM, setDepthM] = useState<number>(1);
  const [note, setNote] = useState("");

  const handleSelectPond = (id: string) => {
    setSelectedPondId(id);
    router.push(`/kolam/${id}`);
  };

  const handleOpenTebar = (id?: string) => {
    setPreselectedPondId(id);
    setIsNewCycleOpen(true);
  };

  const handleCreatePond = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const volumeM3 = Number((lengthM * widthM * depthM).toFixed(2));

    addPond({
      name: name.trim(),
      type,
      lengthM,
      widthM,
      depthM,
      volumeM3,
      status: "KOSONG",
      note: note.trim() || undefined,
    });

    // Reset and close
    setName("");
    setType("TERPAL");
    setLengthM(6);
    setWidthM(4);
    setDepthM(1);
    setNote("");
    setIsAddModalOpen(false);
  };

  const handleDeletePond = (id: string, name: string) => {
    const hasActiveCycle = cycles.some((c) => c.pondId === id && c.status === "AKTIF");
    if (hasActiveCycle) {
      alert(`Kolam "${name}" sedang memiliki siklus pembesaran AKTIF. Selesaikan atau panen siklus terlebih dahulu sebelum menghapus kolam.`);
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus kolam "${name}"?`)) {
      deletePond(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Waves className="w-6 h-6 text-sky-600" />
            Manajemen Kolam Tambak
          </h2>
          <p className="text-sm text-slate-500">
            Kelola kolam secara dinamis (tambah, hapus, atur ukuran) dan pantau operasional setiap petak.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleOpenTebar()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-sky-600" />
            Tebar Siklus Baru
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Tambah Kolam Baru
          </button>
        </div>
      </div>

      {/* Visual Denah Kolam */}
      <PondGrid
        ponds={ponds}
        cycles={cycles}
        selectedPondId={selectedPondId}
        onSelectPond={handleSelectPond}
        onOpenNewPond={handleOpenTebar}
      />

      {/* Daftar Tabel Manajemen Kolam Fisik */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-sky-600" />
            <h3 className="font-bold text-slate-800 text-sm">Daftar Detail Fisik Kolam ({ponds.length})</h3>
          </div>
          <span className="text-xs text-slate-400">Total volume: {ponds.reduce((acc, p) => acc + (p.volumeM3 || 0), 0).toFixed(1)} m³</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500 text-[11px]">
              <tr>
                <th className="px-4 py-3">Nama Kolam</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3">Dimensi (P × L × D)</th>
                <th className="px-4 py-3">Volume</th>
                <th className="px-4 py-3">Status Saat Ini</th>
                <th className="px-4 py-3">Siklus Aktif</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ponds.map((pond) => {
                const activeCycle = cycles.find((c) => c.pondId === pond.id && c.status === "AKTIF");
                const sellingCycle = cycles.find((c) => c.pondId === pond.id && c.status === "PENJUALAN");

                return (
                  <tr key={pond.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          activeCycle
                            ? "bg-emerald-500"
                            : sellingCycle
                            ? "bg-amber-500"
                            : "bg-slate-300"
                        }`}
                      />
                      {pond.name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                        {pond.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {pond.lengthM || "-"}m × {pond.widthM || "-"}m × {pond.depthM || "-"}m
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {pond.volumeM3 ? `${pond.volumeM3} m³` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          activeCycle
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : sellingCycle
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {activeCycle ? "AKTIF" : sellingCycle ? "PENJUALAN" : pond.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {activeCycle ? (
                        <span className="font-medium text-sky-700">{activeCycle.speciesName} ({activeCycle.initialCount.toLocaleString("id-ID")} ekor)</span>
                      ) : sellingCycle ? (
                        <span className="font-medium text-amber-700">Jual Stok ({sellingCycle.speciesName})</span>
                      ) : (
                        <span className="text-slate-400 italic">Tidak ada siklus</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSelectPond(pond.id)}
                          className="px-2 py-1 text-[11px] rounded font-medium text-sky-700 hover:bg-sky-50 transition-colors flex items-center gap-1"
                          title="Lihat Detail Siklus Kolam"
                        >
                          Detail
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePond(pond.id, pond.name)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Hapus Kolam Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Kolam Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-600" />
                Tambah Kolam Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePond} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kolam <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Kolam A9 atau Terpal B5"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipe Kolam
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as PondType)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="TERPAL">Terpal</option>
                  <option value="BETON">Beton</option>
                  <option value="TANAH">Tanah</option>
                  <option value="BIOFLOK">Bioflok (Bundar)</option>
                  <option value="LAINNYA">Lainnya</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Panjang (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    value={lengthM}
                    onChange={(e) => setLengthM(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Lebar (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    value={widthM}
                    onChange={(e) => setWidthM(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Kedalaman (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    value={depthM}
                    onChange={(e) => setDepthM(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-between text-xs text-sky-800">
                <span className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-sky-600" />
                  Estimasi Volume:
                </span>
                <span className="font-bold font-mono">{(lengthM * widthM * depthM).toFixed(2)} m³</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan / Lokasi
                </label>
                <textarea
                  rows={2}
                  placeholder="Misal: Blok utara dekat tandon air"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-xs"
                >
                  Simpan Kolam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Wizard Tebar Baru */}
      <NewPondDialog
        isOpen={isNewCycleOpen}
        onClose={() => setIsNewCycleOpen(false)}
        ponds={ponds}
        speciesList={speciesList}
        preselectedPondId={preselectedPondId}
        onStartCycle={startCycle}
      />
    </div>
  );
}
