"use client";

import { useState } from "react";
import { useData } from "@/contexts/data-context";
import { CircleDollarSign, Plus, Filter, Tag, Info } from "lucide-react";

const EXPENSE_CATEGORIES = [
  "Bibit",
  "Obat & Vitamin",
  "Probiotik/Kapur/Garam",
  "Listrik",
  "Tenaga Kerja",
  "Transportasi",
  "Air",
  "Perbaikan",
  "Biaya Penjualan",
  "Lain-lain",
];

export default function BiayaPage() {
  const { cycles, ponds, saveExpense } = useData();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("SEMUA");

  // Form State
  const activeCycles = cycles.filter((c) => c.status === "AKTIF" || c.status === "PENJUALAN");
  const [cycleId, setCycleId] = useState<string>(activeCycles[0]?.id || cycles[0]?.id || "");
  const [category, setCategory] = useState<string>("Obat & Vitamin");
  const [spentAt, setStockedAt] = useState<string>(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const [unit, setUnit] = useState<string>("botol");
  const [unitPrice, setUnitPrice] = useState<number>(50000);

  // Extract all expenses across cycles
  const allExpenses = cycles.flatMap((c) =>
    c.expenses.map((e) => ({
      ...e,
      pondId: c.pondId,
      speciesName: c.speciesName,
    }))
  ).sort((a, b) => new Date(b.spentAt).getTime() - new Date(a.spentAt).getTime());

  // Filtered expenses
  const filteredExpenses = selectedCategoryFilter === "SEMUA"
    ? allExpenses
    : allExpenses.filter((e) => e.category === selectedCategoryFilter);

  const totalBiaya = filteredExpenses.reduce((acc, e) => acc + (e.total || 0), 0);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cycleId || !description.trim()) return;

    const total = qty * unitPrice;

    saveExpense({
      cycleId,
      category,
      spentAt,
      description: description.trim(),
      qty,
      unit: unit.trim() || undefined,
      unitPrice,
      total,
    });

    setDescription("");
    setQty(1);
    setUnitPrice(50000);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <CircleDollarSign className="w-6 h-6 text-sky-600" />
            Buku Kas Biaya Operasional
          </h2>
          <p className="text-sm text-slate-500">
            Pencatatan seluruh biaya langsung (bibit, vitamin, listrik, perbaikan, penjualan) per siklus kolam.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          Catat Biaya Baru
        </button>
      </div>

      {/* KPI Stats Biaya */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Pengeluaran Kas</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(totalBiaya)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <CircleDollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Jumlah Transaksi</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{filteredExpenses.length} entri</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Filter Aktif</p>
            <p className="text-xl font-bold text-sky-700 mt-1">{selectedCategoryFilter}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Filter className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Kategori Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setSelectedCategoryFilter("SEMUA")}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            selectedCategoryFilter === "SEMUA"
              ? "bg-sky-600 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Semua ({allExpenses.length})
        </button>
        {EXPENSE_CATEGORIES.map((cat) => {
          const count = allExpenses.filter((e) => e.category === cat).length;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategoryFilter === cat
                  ? "bg-sky-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Tabel Biaya */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Rincian Pengeluaran Kas ({filteredExpenses.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-500 text-[11px]">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Kolam / Siklus</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Deskripsi</th>
                <th className="px-4 py-3">Kuantitas</th>
                <th className="px-4 py-3 text-right">Harga Satuan</th>
                <th className="px-4 py-3 text-right">Total Biaya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium whitespace-nowrap">
                    {new Date(exp.spentAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">Kolam {exp.pondId}</div>
                    <div className="text-[11px] text-slate-500">{exp.speciesName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {exp.description}
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-mono">
                    {exp.qty} {exp.unit || ""}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600 font-mono">
                    {formatCurrency(exp.unitPrice)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">
                    {formatCurrency(exp.total)}
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic">
                    Belum ada data pengeluaran untuk kategori ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Catat Biaya Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CircleDollarSign className="w-4 h-4 text-sky-600" />
                Catat Biaya Operasional Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Kolam / Siklus <span className="text-red-500">*</span>
                </label>
                <select
                  value={cycleId}
                  onChange={(e) => setCycleId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  required
                >
                  {cycles.map((c) => (
                    <option key={c.id} value={c.id}>
                      Kolam {c.pondId} - {c.speciesName} ({c.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Biaya
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Pengeluaran
                  </label>
                  <input
                    type="date"
                    required
                    value={spentAt}
                    onChange={(e) => setStockedAt(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi / Keterangan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Probiotik EM4 2 botol atau Token Listrik"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Kuantitas
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(parseFloat(e.target.value) || 1)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Satuan
                  </label>
                  <input
                    type="text"
                    placeholder="botol/kg/bln"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Harga Satuan
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-between text-xs text-sky-900">
                <span className="font-medium">Total Biaya:</span>
                <span className="font-bold text-sm font-mono">{formatCurrency(qty * unitPrice)}</span>
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
                  Simpan Biaya
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
