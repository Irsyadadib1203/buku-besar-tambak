/**
 * BUKU BESAR TAMBAK - TIPE DATA SISTEM (PRD v1.1)
 */

export type PondType = "TERPAL" | "BETON" | "TANAH" | "BIOFLOK" | "LAINNYA";
export type PondStatus = "KOSONG" | "AKTIF" | "PERSIAPAN" | "NONAKTIF";
export type CycleStatus = "AKTIF" | "PENJUALAN" | "SELESAI";
export type AllocationMethod = "RATA" | "VOLUME" | "POPULASI";
export type SaleChannel = "PENGEPUL" | "ECERAN" | "LAINNYA";
export type AdjustReason = "MATI" | "KONSUMSI" | "SUSUT" | "LAINNYA";

export interface Species {
  id: string;
  name: string;
  category: "LELE" | "NILA" | "LAINNYA";
  targetDays: number;
  targetSr: number; // Persen (misal 80%)
  targetSizePerKg?: number; // Ekor per kg (misal 8-10)
  targetFeedRatio?: number; // Target rasio pakan (misal 1.1)
  colorHex?: string;
  archived?: boolean;
}

export interface Pond {
  id: string; // e.g. "A1", "A2", "Terpal 3"
  name: string;
  type: PondType;
  lengthM?: number;
  widthM?: number;
  depthM?: number;
  volumeM3?: number;
  status: PondStatus;
  note?: string;
  // Field join siklus aktif saat ini
  activeCycle?: Cycle;
}

export interface FeedBatch {
  id: string;
  cycleId: string;
  feedType: string; // misal "PF800", "781-2", "Sinta Nila"
  qtyKg: number;
  totalPrice: number;
  startedAt: string; // YYYY-MM-DD
  finishedAt?: string | null; // YYYY-MM-DD (null = sedang berjalan)
  note?: string;
}

export interface Mortality {
  id: string;
  cycleId: string;
  diedAt: string;
  count: number;
  cause?: string;
}

export interface Harvest {
  id: string;
  cycleId: string;
  harvestedAt: string;
  count: number; // ekor
  kg: number;
  note?: string;
}

export interface Sale {
  id: string;
  cycleId: string;
  soldAt: string;
  kg: number;
  pricePerKg: number;
  total: number;
  channel: SaleChannel;
  buyer?: string;
  isPaid: boolean;
  note?: string;
}

export interface StockAdjustment {
  id: string;
  cycleId: string;
  adjustedAt: string;
  kg: number;
  reason: AdjustReason;
  note?: string;
}

export interface Expense {
  id: string;
  cycleId?: string | null; // null = biaya bersama
  category: string; // Bibit, Obat & Vitamin, Listrik, Biaya Penjualan, dll
  spentAt: string;
  description: string;
  qty: number;
  unit?: string;
  unitPrice: number;
  total: number;
  method?: AllocationMethod;
  note?: string;
}

export interface Asset {
  id: string;
  name: string;
  pondId?: string | null; // null = umum
  boughtAt: string;
  cost: number;
  usefulLifeMonths: number;
  salvageValue: number;
  retired: boolean;
}

export interface Cycle {
  id: string;
  pondId: string;
  speciesId: string;
  speciesName: string;
  status: CycleStatus;
  stockedAt: string; // YYYY-MM-DD
  releasedAt?: string | null; // Tanggal kolam kosong (populasi = 0)
  closedAt?: string | null; // Tanggal finalisasi siklus
  initialCount: number;
  initialSizeCm?: number;
  expectedSizePerKg?: number;
  referencePricePerKg?: number;
  seedSupplier?: string;
  note?: string;
  // Detail teragregasi
  feedBatches: FeedBatch[];
  mortalities: Mortality[];
  harvests: Harvest[];
  sales: Sale[];
  stockAdjustments: StockAdjustment[];
  expenses: Expense[];
}

export interface CycleAnalytics {
  umurHari: number;
  targetDays: number;
  populasiHidup: number;
  totalMati: number;
  srBerjalan: number;
  totalPakanKg: number;
  biayaPakan: number;
  activeBatch?: FeedBatch | null;
  totalKgPanen: number;
  stokPanenKg: number;
  totalKgTerjual: number;
  totalPendapatan: number;
  totalBiayaTunai: number;
  totalPenyusutan: number;
  totalBiayaPenuh: number;
  labaTerealisasi: number;
  proyeksiPendapatan: number;
  proyeksiLaba: number;
  persenBalikModal: number;
  kekuranganBalikModal: number;
  hargaMinSisaStok: number;
  hppPerKgBerjalan: number;
  isFinal: boolean;
}

export interface DashboardSummary {
  kolamAktifCount: number;
  siklusPenjualanCount: number;
  totalPopulasiHidup: number;
  totalBiayaBerjalan: number;
  totalPenjualanTerkumpul: number;
  totalStokMenungguJualKg: number;
  persenBalikModalGlobal: number;
  kekuranganBalikModalGlobal: number;
}
