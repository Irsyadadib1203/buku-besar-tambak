/**
 * BUKU BESAR TAMBAK - RUMUS KALKULASI FINANSIAL & AKUAKULTUR
 * Berdasarkan PRD v1.1 Bagian 8
 * Seluruh fungsi bersifat murni (pure function) tanpa efek samping.
 */

export type Sale = {
  kg: number;
  pricePerKg: number;
  channel?: "PENGEPUL" | "ECERAN" | "LAINNYA";
  isPaid?: boolean;
};

// 1. Umur Siklus (Hari ke-N)
export function hariSiklus(tebar: Date, acuan: Date = new Date()): number {
  const ms = Date.UTC(acuan.getFullYear(), acuan.getMonth(), acuan.getDate()) -
    Date.UTC(tebar.getFullYear(), tebar.getMonth(), tebar.getDate());
  return Math.max(0, Math.round(ms / 86400000));
}

export function umurIkanHari(tebar: Date, releasedAt?: Date | null, hariIni: Date = new Date()): number {
  const targetDate = releasedAt ?? hariIni;
  return hariSiklus(tebar, targetDate);
}

// 2. Populasi Hidup
export function populationHidup(initial: number, mati: number, panenEkor: number): number {
  if (mati + panenEkor > initial) {
    throw new Error("Jumlah mati dan panen tidak boleh melebihi tebar awal.");
  }
  return initial - mati - panenEkor;
}

// 3. Survival Rate (SR)
export function srBerjalan(initial: number, mati: number): number {
  if (initial <= 0) return 0;
  return Math.max(0, ((initial - mati) / initial) * 100);
}

export function srAkhir(initial: number, panenEkor: number): number {
  if (initial <= 0) return 0;
  return Math.min(100, Math.max(0, (panenEkor / initial) * 100));
}

// 4. Batch Pakan
export function durasiHariBatch(startedAt: Date, finishedAt?: Date | null, hariIni: Date = new Date()): number {
  const end = finishedAt ?? hariIni;
  if (finishedAt && finishedAt < startedAt) {
    throw new Error("Tanggal pakan habis tidak boleh sebelum tanggal mulai.");
  }
  return hariSiklus(startedAt, end) + 1; // Inklusif
}

export function batchPakan(
  qtyKg: number,
  totalPrice: number,
  startedAt: Date,
  finishedAt?: Date | null,
  hariIni: Date = new Date()
) {
  if (qtyKg <= 0 || totalPrice < 0) {
    throw new Error("Jumlah pakan dan harga harus valid.");
  }
  const durasi = finishedAt ? durasiHariBatch(startedAt, finishedAt) : durasiHariBatch(startedAt, null, hariIni);
  const hargaPerKg = totalPrice / qtyKg;
  const konsumsiPerHari = durasi > 0 ? qtyKg / durasi : 0;
  const biayaPerHari = durasi > 0 ? totalPrice / durasi : 0;

  return {
    biaya: totalPrice,
    hargaPerKg,
    durasiHari: finishedAt ? durasi : null,
    durasiBerjalanHari: durasi,
    konsumsiPerHari,
    biayaPerHari,
  };
}

// Rasio Pakan (FCR berbasis panen riil: kg pakan / kg panen)
export function rasioPakan(totalPakanKg: number, kgPanen: number): number | null {
  if (kgPanen <= 0) return null;
  return totalPakanKg / kgPanen;
}

// 5. Alokasi Biaya Bersama (Volume, Populasi, atau Rata)
export function alokasiVolume(total: number, volumes: number[]): number[] {
  const valid = volumes.map((v) => Math.max(0, v));
  const jumlah = valid.reduce((sum, v) => sum + v, 0);
  if (jumlah === 0) return valid.map(() => 0);
  
  const terbesar = valid.indexOf(Math.max(...valid));
  const hasil = valid.map((v) => Math.floor((total * v) / jumlah));
  hasil[terbesar] += total - hasil.reduce((sum, val) => sum + val, 0);
  return hasil;
}

// 6. Stok Panen & Susut
export function stokPanen(panenKg: number, penjualanKg: number, susutKg: number = 0): number {
  if (penjualanKg + susutKg > panenKg) {
    throw new Error("Penjualan dan susut melebihi stok panen yang tersedia.");
  }
  return panenKg - penjualanKg - susutKg;
}

// 7. Ringkasan Penjualan
export function ringkasanPenjualan(sales: Sale[]) {
  const kg = sales.reduce((sum, s) => sum + s.kg, 0);
  const pendapatan = sales.reduce((sum, s) => sum + s.kg * s.pricePerKg, 0);
  const hargaRataRata = kg === 0 ? 0 : Math.round(pendapatan / kg);
  return { kg, pendapatan, hargaRataRata };
}

// 8. Balik Modal (BEP)
export function balikModal(totalBiaya: number, pendapatan: number, stokKg: number) {
  const kekurangan = Math.max(0, totalBiaya - pendapatan);
  const persen = totalBiaya === 0 ? 100 : (pendapatan / totalBiaya) * 100;
  const hargaMinimalSisa = stokKg <= 0 ? 0 : Math.ceil(kekurangan / stokKg);
  return { persen, kekurangan, hargaMinimalSisa };
}

// 9. HPP per kg (Berjalan vs Final)
export function hppPerKg(totalBiaya: number, kgPanen: number, estimasiKgPanen: number = 0): number {
  if (kgPanen > 0) {
    return Math.round(totalBiaya / kgPanen);
  }
  if (estimasiKgPanen > 0) {
    return Math.round(totalBiaya / estimasiKgPanen);
  }
  return 0;
}

// 10. Penyusutan Aset Garis Lurus (per siklus pemakaian)
export function penyusutanAset(
  hargaPerolehan: number,
  nilaiSisa: number,
  umurBulan: number,
  hariTerpakai: number,
  porsiAset: number = 1
): number {
  if (umurBulan <= 0) return 0;
  const penyusutanPerBulan = (hargaPerolehan - nilaiSisa) / umurBulan;
  const penyusutanPerHari = penyusutanPerBulan / 30;
  return Math.round(penyusutanPerHari * hariTerpakai * porsiAset);
}
