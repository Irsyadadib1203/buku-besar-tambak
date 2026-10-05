"use client";

import { useState } from "react";
import { useData } from "@/contexts/data-context";
import { Warehouse, Plus, Calendar, DollarSign, Clock, ShieldAlert } from "lucide-react";

export default function AsetPage() {
  const { assets, ponds, addAsset, retireAsset } = useData();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [cost, setCost] = useState<number>(1000000);
  const [boughtAt, setBoughtAt] = useState<string>(new Date().toISOString().split("T")[0]);
  const [usefulLifeMonths, setUsefulLifeMonths] = useState<number>(24);
  const [salvageValue, setSalvageValue] = useState<number>(0);
  const [pondId, setPondId] = useState<string>("ALL");

  const totalCost = assets.reduce((acc, a) => acc + (a.cost || 0), 0);
  const activeAssets = assets.filter((a) => !a.retired);

  // Monthly depreciation rate
  const monthlyDepreciation = activeAssets.reduce((acc, a) => {
    const basis = Math.max(0, a.cost - (a.salvageValue || 0));
    return acc + (a.usefulLifeMonths > 0 ? basis / a.usefulLifeMonths : 0);
  }, 0);

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addAsset({
      name: name.trim(),
      cost,
      boughtAt,
      usefulLifeMonths,
      salvageValue,
      pondId: pondId === "ALL" ? null : pondId,
      retired: false,
    });

    setName("");
    setCost(1000000);
    setUsefulLifeMonths(24);
    setSalvageValue(0);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Warehouse className="w-6 h-6 text-sky-600" />
            Manajemen Aset & Penyusutan
          </h2>
          <p className="text-sm text-slate-500">
            Daftar modal awal dan peralatan tambak (terpal, pompa, aerator) yang dibebankan ke perhitungan HPP penuh.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Aset Baru
        </button>
      </div>

      {/* KPI Stats Aset */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Nilai Perolehan Aset</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(totalCost)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Aset Beroperasi (Aktif)</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{activeAssets.length} unit</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Warehouse className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Beban Penyusutan / Bulan</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(Math.round(monthlyDepreciation))}/bln</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Table Assets */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Daftar Peralatan & Fasilitas Tambak ({assets.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500 text-[11px]">
              <tr>
                <th className="px-4 py-3">Nama Aset</th>
                <th className="px-4 py-3">Tgl Beli</th>
                <th className="px-4 py-3">Alokasi Kolam</th>
                <th className="px-4 py-3 text-right">Harga Beli</th>
                <th className="px-4 py-3">Umur Manfaat</th>
                <th className="px-4 py-3 text-right">Susut/Bulan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assets.map((ast) => {
                const basis = Math.max(0, ast.cost - (ast.salvageValue || 0));
                const susutBulan = ast.usefulLifeMonths > 0 ? Math.round(basis / ast.usefulLifeMonths) : 0;
                return (
                  <tr key={ast.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {ast.name}
                    </td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap text-slate-600">
                      {new Date(ast.boughtAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                        {ast.pondId ? `Kolam ${ast.pondId}` : "Umum (Semua Kolam)"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(ast.cost)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {ast.usefulLifeMonths} bulan ({Number((ast.usefulLifeMonths / 12).toFixed(1))} thn)
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">
                      {formatCurrency(susutBulan)}/bln
                    </td>
                    <td className="px-4 py-3">
                      {ast.retired ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                          Afkir / Pensiun
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Aktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!ast.retired && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Tandai aset "${ast.name}" sebagai afkir/nonaktif?`)) {
                              retireAsset(ast.id);
                            }
                          }}
                          className="px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          Afkirkan
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Aset */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-sky-600" />
                Tambah Aset / Fasilitas Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Aset <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Pompa Air Celup 2 Inch atau Blower Aerator"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga Perolehan (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={cost}
                    onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Beli
                  </label>
                  <input
                    type="date"
                    required
                    value={boughtAt}
                    onChange={(e) => setBoughtAt(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Masa Manfaat (Bulan)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={usefulLifeMonths}
                    onChange={(e) => setUsefulLifeMonths(parseInt(e.target.value, 10) || 1)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nilai Sisa / Residu (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={salvageValue}
                    onChange={(e) => setSalvageValue(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alokasi Pembebanan
                </label>
                <select
                  value={pondId}
                  onChange={(e) => setPondId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="ALL">Umum (Dibagi Rata ke Seluruh Kolam)</option>
                  {ponds.map((p) => (
                    <option key={p.id} value={p.id}>Khusus Kolam {p.name}</option>
                  ))}
                </select>
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
                  Simpan Aset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
