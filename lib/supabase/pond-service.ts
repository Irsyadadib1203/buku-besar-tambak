import {
  Pond,
  Species,
  Cycle,
  FeedBatch,
  Mortality,
  Harvest,
  Sale,
  StockAdjustment,
  Expense,
  Asset,
  CycleAnalytics,
  DashboardSummary,
  SaleChannel,
  AdjustReason,
  AllocationMethod,
  PondType,
  PondStatus,
  CycleStatus,
} from "@/types/pond";
import {
  umurIkanHari,
  populationHidup,
  srBerjalan,
  srAkhir,
  durasiHariBatch,
  batchPakan,
  rasioPakan,
  stokPanen,
  ringkasanPenjualan,
  balikModal,
  hppPerKg,
  penyusutanAset,
  alokasiVolume,
} from "../calc";

// MASTER SPESIES STANDAR (Referensi Spesies Akuakultur)
export const SEED_SPECIES: Species[] = [
  {
    id: "sp-lele-sang",
    name: "Lele Sangkuriang",
    category: "LELE",
    targetDays: 60,
    targetSr: 80,
    targetSizePerKg: 9,
    targetFeedRatio: 1.05,
    colorHex: "#0284C7",
  },
  {
    id: "sp-lele-muti",
    name: "Lele Mutiara",
    category: "LELE",
    targetDays: 60,
    targetSr: 85,
    targetSizePerKg: 9,
    targetFeedRatio: 1.0,
    colorHex: "#0369A1",
  },
  {
    id: "sp-nila-merah",
    name: "Nila Merah Nirwana",
    category: "NILA",
    targetDays: 120,
    targetSr: 85,
    targetSizePerKg: 3,
    targetFeedRatio: 1.2,
    colorHex: "#0EA5E9",
  },
  {
    id: "sp-nila-hitam",
    name: "Nila Hitam Gesit",
    category: "NILA",
    targetDays: 120,
    targetSr: 80,
    targetSizePerKg: 3,
    targetFeedRatio: 1.25,
    colorHex: "#2563EB",
  },
];

// DATA AWAL BERSIH (SIAP PRODUKSI / FRESH DATABASE)
export const SEED_ASSETS: Asset[] = [];
export const SEED_CYCLES: Cycle[] = [];
export const SEED_PONDS: Pond[] = [];

/**
 * Menghitung analisis siklus mendalam berdasarkan PRD v1.1 Bagian 8
 */
export function calculateCycleAnalytics(cycle: Cycle, assets: Asset[] = [], includePenyusutan = false): CycleAnalytics {
  const species = SEED_SPECIES.find((s) => s.id === cycle.speciesId) || {
    targetDays: 60,
    targetSizePerKg: 8,
  };
  const targetDays = species.targetDays;

  // Umur ikan
  const umurHari = umurIkanHari(
    new Date(cycle.stockedAt),
    cycle.releasedAt ? new Date(cycle.releasedAt) : null
  );

  // Kematian & Panen
  const totalMati = (cycle.mortalities || []).reduce((sum, m) => sum + m.count, 0);
  const totalEkorPanen = (cycle.harvests || []).reduce((sum, h) => sum + h.count, 0);
  const totalKgPanen = (cycle.harvests || []).reduce((sum, h) => sum + h.kg, 0);

  // Populasi hidup
  const populasiHidup = Math.max(0, cycle.initialCount - totalMati - totalEkorPanen);
  const srBerjalanVal = srBerjalan(cycle.initialCount, totalMati);

  // Pakan per batch
  const totalPakanKg = (cycle.feedBatches || []).reduce((sum, b) => sum + b.qtyKg, 0);
  const biayaPakan = (cycle.feedBatches || []).reduce((sum, b) => sum + b.totalPrice, 0);
  const activeBatch = (cycle.feedBatches || []).find((b) => !b.finishedAt) || null;

  // Biaya operasional langsung
  const biayaLangsung = (cycle.expenses || []).reduce((sum, e) => sum + e.total, 0);
  const totalBiayaTunai = biayaPakan + biayaLangsung;

  // Penyusutan aset proporsional hari terpakai
  const hariTerpakai = umurHari || 1;
  const totalPenyusutan = (assets || []).reduce((sum, ast) => {
    const porsi = ast.pondId === cycle.pondId ? 1 : ast.pondId === null ? 0.125 : 0;
    return sum + penyusutanAset(ast.cost, ast.salvageValue, ast.usefulLifeMonths, hariTerpakai, porsi);
  }, 0);

  const totalBiayaPenuh = totalBiayaTunai + totalPenyusutan;
  const totalBiaya = includePenyusutan ? totalBiayaPenuh : totalBiayaTunai;

  // Penjualan & Stok Panen
  const totalKgTerjual = (cycle.sales || []).reduce((sum, s) => sum + s.kg, 0);
  const totalSusutKg = (cycle.stockAdjustments || []).reduce((sum, a) => sum + a.kg, 0);
  const stokPanenKg = Math.max(0, totalKgPanen - totalKgTerjual - totalSusutKg);

  const totalPendapatan = (cycle.sales || []).reduce((sum, s) => sum + s.total, 0);
  const labaTerealisasi = totalPendapatan - totalBiaya;

  // Proyeksi
  const hargaAcuan = cycle.referencePricePerKg || (totalKgTerjual > 0 ? Math.round(totalPendapatan / totalKgTerjual) : 25000);
  const proyeksiPendapatan = totalPendapatan + stokPanenKg * hargaAcuan;
  const proyeksiLaba = proyeksiPendapatan - totalBiaya;

  // Balik Modal
  const bep = balikModal(totalBiaya, totalPendapatan, stokPanenKg);

  // Estimasi panen jika belum dipanen
  const targetSize = cycle.expectedSizePerKg || species.targetSizePerKg || 8;
  const estimasiKgPanen = totalKgPanen > 0 ? totalKgPanen : populasiHidup / targetSize;
  const hppPerKgBerjalan = hppPerKg(totalBiaya, totalKgPanen, estimasiKgPanen);

  const isFinal = cycle.status === "SELESAI";

  return {
    umurHari,
    targetDays,
    populasiHidup,
    totalMati,
    srBerjalan: Number(srBerjalanVal.toFixed(1)),
    totalPakanKg,
    biayaPakan,
    activeBatch,
    totalKgPanen,
    stokPanenKg,
    totalKgTerjual,
    totalPendapatan,
    totalBiayaTunai,
    totalPenyusutan,
    totalBiayaPenuh,
    labaTerealisasi,
    proyeksiPendapatan,
    proyeksiLaba,
    persenBalikModal: bep.persen,
    kekuranganBalikModal: bep.kekurangan,
    hargaMinSisaStok: bep.hargaMinimalSisa,
    hppPerKgBerjalan,
    isFinal,
  };
}

/**
 * Menghitung ringkasan global dasbor seluruh tambak
 */
export function calculateDashboardSummary(ponds: Pond[], cycles: Cycle[]): DashboardSummary {
  let totalPopulasiHidup = 0;
  let totalBiayaBerjalan = 0;
  let totalPenjualanTerkumpul = 0;
  let totalStokMenungguJualKg = 0;

  for (const cycle of cycles) {
    if (cycle.status !== "SELESAI") {
      const analytics = calculateCycleAnalytics(cycle);
      totalPopulasiHidup += analytics.populasiHidup;
      totalBiayaBerjalan += analytics.totalBiayaTunai;
      totalPenjualanTerkumpul += analytics.totalPendapatan;
      totalStokMenungguJualKg += analytics.stokPanenKg;
    }
  }

  const bepGlobal = balikModal(totalBiayaBerjalan, totalPenjualanTerkumpul, totalStokMenungguJualKg);
  const kolamAktifCount = ponds.filter((p) => p.status === "AKTIF").length;
  const siklusPenjualanCount = cycles.filter((c) => c.status === "PENJUALAN").length;

  return {
    kolamAktifCount,
    siklusPenjualanCount,
    totalPopulasiHidup,
    totalBiayaBerjalan,
    totalPenjualanTerkumpul,
    totalStokMenungguJualKg,
    persenBalikModalGlobal: bepGlobal.persen,
    kekuranganBalikModalGlobal: bepGlobal.kekurangan,
  };
}

/**
 * Data Storage & Synchronization Service
 * Data diakses melalui Route Handler yang memakai service-role hanya di server.
 */
export async function fetchPondsAndCycles(): Promise<{
  ponds: Pond[];
  cycles: Cycle[];
  species: Species[];
  assets: Asset[];
}> {
  try {
    const response = await fetch("/api/data", { cache: "no-store" });
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error || "Gagal memuat data dari server.");
    }
    const { species: dbSpecies, ponds: dbPonds, assets: dbAssets, cycles: dbCycles } =
      (await response.json()) as { species?: any[]; ponds?: any[]; assets?: any[]; cycles?: any[] };
    if (!Array.isArray(dbPonds)) throw new Error("Format data server tidak valid.");
        const mappedPonds: Pond[] = dbPonds.map((p: any) => ({
          id: p.id,
          name: p.name,
          type: p.type as PondType,
          lengthM: p.length_m ? Number(p.length_m) : undefined,
          widthM: p.width_m ? Number(p.width_m) : undefined,
          depthM: p.depth_m ? Number(p.depth_m) : undefined,
          volumeM3: p.volume_m3 ? Number(p.volume_m3) : undefined,
          status: p.status as PondStatus,
          note: p.note,
        }));

        const mappedCycles: Cycle[] = (dbCycles || []).map((c: any) => ({
          id: c.id,
          pondId: c.pond_id,
          speciesId: c.species_id,
          speciesName: c.species?.name || "Ikan",
          status: c.status as CycleStatus,
          stockedAt: c.stocked_at,
          releasedAt: c.released_at,
          closedAt: c.closed_at,
          initialCount: Number(c.initial_count),
          initialSizeCm: c.initial_size_cm ? Number(c.initial_size_cm) : undefined,
          expectedSizePerKg: c.expected_size_per_kg ? Number(c.expected_size_per_kg) : undefined,
          referencePricePerKg: c.reference_price_per_kg ? Number(c.reference_price_per_kg) : undefined,
          seedSupplier: c.seed_supplier,
          note: c.note,
          feedBatches: (c.feed_batches || []).map((f: any) => ({
            id: f.id,
            cycleId: f.cycle_id,
            feedType: f.feed_type,
            qtyKg: Number(f.qty_kg),
            totalPrice: Number(f.total_price),
            startedAt: f.started_at,
            finishedAt: f.finished_at,
            note: f.note,
          })),
          mortalities: (c.mortalities || []).map((m: any) => ({
            id: m.id,
            cycleId: m.cycle_id,
            diedAt: m.died_at,
            count: Number(m.count),
            cause: m.cause,
          })),
          harvests: (c.harvests || []).map((h: any) => ({
            id: h.id,
            cycleId: h.cycle_id,
            harvestedAt: h.harvested_at,
            count: Number(h.count),
            kg: Number(h.kg),
            note: h.note,
          })),
          sales: (c.sales || []).map((s: any) => ({
            id: s.id,
            cycleId: s.cycle_id,
            soldAt: s.sold_at,
            kg: Number(s.kg),
            pricePerKg: Number(s.price_per_kg),
            total: Number(s.total),
            channel: s.channel as SaleChannel,
            buyer: s.buyer,
            isPaid: Boolean(s.is_paid),
            note: s.note,
          })),
          stockAdjustments: (c.stock_adjustments || []).map((a: any) => ({
            id: a.id,
            cycleId: a.cycle_id,
            adjustedAt: a.adjusted_at,
            kg: Number(a.kg),
            reason: a.reason as AdjustReason,
            note: a.note,
          })),
          expenses: (c.expenses || []).map((e: any) => ({
            id: e.id,
            cycleId: e.cycle_id,
            category: e.category || "Lain-lain",
            spentAt: e.spent_at,
            description: e.description,
            qty: Number(e.qty),
            unit: e.unit,
            unitPrice: Number(e.unit_price),
            total: Number(e.total),
            note: e.note,
          })),
        }));

        const mappedSpecies: Species[] = (dbSpecies && dbSpecies.length > 0)
          ? dbSpecies.map((s: any) => ({
              id: s.id,
              name: s.name,
              category: s.category,
              targetDays: Number(s.target_days),
              targetSr: Number(s.target_sr),
              targetSizePerKg: s.target_size_per_kg ? Number(s.target_size_per_kg) : undefined,
              targetFeedRatio: s.target_feed_ratio ? Number(s.target_feed_ratio) : undefined,
              colorHex: s.color_hex,
              archived: Boolean(s.archived),
            }))
          : SEED_SPECIES;

        const mappedAssets: Asset[] = (dbAssets || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          pondId: a.pond_id,
          boughtAt: a.bought_at,
          cost: Number(a.cost),
          usefulLifeMonths: Number(a.useful_life_months),
          salvageValue: Number(a.salvage_value || 0),
          retired: Boolean(a.retired),
        }));

        return {
          ponds: mappedPonds,
          cycles: mappedCycles,
          species: mappedSpecies,
          assets: mappedAssets,
        };
  } catch (error) {
    throw error instanceof Error ? error : new Error("Gagal memuat data dari server.");
  }
}

// =========================================================================
// OPERASI SINKRONISASI KE SUPABASE
// =========================================================================

async function persist(table: string, record: Record<string, unknown>) {
  const response = await fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operation: "upsert", table, record }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || "Gagal menyimpan data.");
  }
}

async function remove(table: string, id: string) {
  const response = await fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operation: "delete", table, id }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || "Gagal menghapus data.");
  }
}

export async function syncPondToSupabase(pond: Pond) {
  await persist("ponds", {
      id: pond.id,
      name: pond.name,
      type: pond.type,
      length_m: pond.lengthM,
      width_m: pond.widthM,
      depth_m: pond.depthM,
      volume_m3: pond.volumeM3,
      status: pond.status,
      note: pond.note,
  });
}

export async function deletePondFromSupabase(pondId: string) {
  await remove("ponds", pondId);
}

export async function syncCycleToSupabase(cycle: Cycle) {
  await persist("cycles", {
      id: cycle.id,
      pond_id: cycle.pondId,
      species_id: cycle.speciesId,
      status: cycle.status,
      stocked_at: cycle.stockedAt,
      released_at: cycle.releasedAt,
      closed_at: cycle.closedAt,
      initial_count: cycle.initialCount,
      initial_size_cm: cycle.initialSizeCm,
      expected_size_per_kg: cycle.expectedSizePerKg,
      reference_price_per_kg: cycle.referencePricePerKg,
      seed_supplier: cycle.seedSupplier,
      note: cycle.note,
  });
}

export async function syncFeedBatchToSupabase(batch: FeedBatch) {
  await persist("feed_batches", {
      id: batch.id,
      cycle_id: batch.cycleId,
      feed_type: batch.feedType,
      qty_kg: batch.qtyKg,
      total_price: batch.totalPrice,
      started_at: batch.startedAt,
      finished_at: batch.finishedAt,
      note: batch.note,
  });
}

export async function syncMortalityToSupabase(mortality: Mortality) {
  await persist("mortalities", {
      id: mortality.id,
      cycle_id: mortality.cycleId,
      died_at: mortality.diedAt,
      count: mortality.count,
      cause: mortality.cause,
  });
}

export async function syncHarvestToSupabase(harvest: Harvest) {
  await persist("harvests", {
      id: harvest.id,
      cycle_id: harvest.cycleId,
      harvested_at: harvest.harvestedAt,
      count: harvest.count,
      kg: harvest.kg,
      note: harvest.note,
  });
}

export async function syncSaleToSupabase(sale: Sale) {
  await persist("sales", {
      id: sale.id,
      cycle_id: sale.cycleId,
      sold_at: sale.soldAt,
      kg: sale.kg,
      price_per_kg: sale.pricePerKg,
      total: sale.total,
      channel: sale.channel,
      buyer: sale.buyer,
      is_paid: sale.isPaid,
      note: sale.note,
  });
}

export async function syncStockAdjustmentToSupabase(adj: StockAdjustment) {
  await persist("stock_adjustments", {
      id: adj.id,
      cycle_id: adj.cycleId,
      adjusted_at: adj.adjustedAt,
      kg: adj.kg,
      reason: adj.reason,
      note: adj.note,
  });
}

export async function syncExpenseToSupabase(expense: Expense) {
  await persist("expenses", {
      id: expense.id,
      cycle_id: expense.cycleId,
      category: expense.category,
      spent_at: expense.spentAt,
      description: expense.description,
      qty: expense.qty,
      unit: expense.unit,
      unit_price: expense.unitPrice,
      total: expense.total,
      note: expense.note,
  });
}

export async function syncAssetToSupabase(asset: Asset) {
  await persist("assets", {
      id: asset.id,
      name: asset.name,
      pond_id: asset.pondId,
      bought_at: asset.boughtAt,
      cost: asset.cost,
      useful_life_months: asset.usefulLifeMonths,
      salvage_value: asset.salvageValue,
      retired: asset.retired,
  });
}
