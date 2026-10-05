import { describe, expect, it } from "vitest";
import {
  alokasiVolume,
  balikModal,
  batchPakan,
  durasiHariBatch,
  hariSiklus,
  hppPerKg,
  penyusutanAset,
  populationHidup,
  rasioPakan,
  ringkasanPenjualan,
  srAkhir,
  srBerjalan,
  stokPanen,
  umurIkanHari,
} from "../lib/calc";

describe("PRD v1.1 - Kriteria Penerimaan & Rumus Buku Besar Tambak", () => {
  it("FR-61: Tebar 10.000, mati 150, panen 2.000 ekor -> populasi hidup 7.850", () => {
    expect(populationHidup(10000, 150, 2000)).toBe(7850);
  });

  it("FR-32: Tebar 1 Okt, hari ini 25 Okt -> 'Hari ke-24'", () => {
    expect(hariSiklus(new Date("2026-10-01"), new Date("2026-10-25"))).toBe(24);
    expect(umurIkanHari(new Date("2026-10-01"), null, new Date("2026-10-25"))).toBe(24);
  });

  it("FR-50 & FR-51: Batch pakan PF800, 1 kg, Rp 23.500, mulai 1 Okt, habis 4 Okt (4 hari)", () => {
    const res = batchPakan(1, 23500, new Date("2026-10-01"), new Date("2026-10-04"));
    expect(res).toEqual({
      biaya: 23500,
      hargaPerKg: 23500,
      durasiHari: 4,
      durasiBerjalanHari: 4,
      konsumsiPerHari: 0.25,
      biayaPerHari: 5875,
    });
  });

  it("FR-53: Batch berjalan dihitung penuh pada biaya", () => {
    const berjalan = batchPakan(10, 120000, new Date("2026-10-01"), null, new Date("2026-10-03"));
    expect(berjalan.biaya).toBe(120000);
    expect(berjalan.durasiHari).toBeNull();
    expect(berjalan.durasiBerjalanHari).toBe(3);
    expect(berjalan.konsumsiPerHari).toBeCloseTo(3.33, 1);
  });

  it("FR-42: Alokasi biaya bersama Rp 800.000 metode volume tepat sampai rupiah terakhir", () => {
    const alokasi = alokasiVolume(800000, [10, 20, 30]);
    expect(alokasi.reduce((a, b) => a + b, 0)).toBe(800000);
  });

  it("FR-80 & FR-82: Panen 100 kg, jual 40 kg eceran (25k) + 60 kg pengepul (22k) -> omzet 2.32 jt, avg 23.200, stok 0", () => {
    const ringkasan = ringkasanPenjualan([
      { kg: 40, pricePerKg: 25000, channel: "ECERAN" },
      { kg: 60, pricePerKg: 22000, channel: "PENGEPUL" },
    ]);
    expect(ringkasan).toEqual({
      kg: 100,
      pendapatan: 2320000,
      hargaRataRata: 23200,
    });
    expect(stokPanen(100, 100, 0)).toBe(0);
  });

  it("FR-85: Biaya 2 jt, penjualan 1 jt, stok 60 kg -> 50% balik modal, min sisa Rp 16.667/kg", () => {
    const bep = balikModal(2000000, 1000000, 60);
    expect(bep).toEqual({
      persen: 50,
      kekurangan: 1000000,
      hargaMinimalSisa: 16667,
    });
  });

  it("FR-82: Penjualan melebihi stok ditolak", () => {
    expect(() => stokPanen(100, 101)).toThrow("Penjualan dan susut melebihi stok panen");
  });

  it("SR berjalan dan akhir", () => {
    expect(srBerjalan(1000, 50)).toBe(95);
    expect(srAkhir(1000, 920)).toBe(92);
  });

  it("Rasio pakan dan HPP berjalan", () => {
    expect(rasioPakan(120, 100)).toBe(1.2);
    expect(hppPerKg(1800000, 100)).toBe(18000);
  });

  it("Penyusutan aset garis lurus", () => {
    // Aset terpal Rp 600.000, sisa 0, umur 12 bulan (Rp 50.000/bln -> Rp 1.667/hari), terpakai 60 hari
    const susut = penyusutanAset(600000, 0, 12, 60, 1);
    expect(susut).toBe(100000);
  });
});
