export interface CustomTaxPreset {
  id: string;
  name: string;
  rateWithNPWP: number;
  rateNoNPWP: number;
  defaultPPN: boolean;
  ppnMode: 'include' | 'exclude';
  desc: string;
}

export interface TaxRegulationConfig {
  version: string;
  lastUpdated: string;
  notes: string;
  // PPN
  ppnRate: number; // default 11
  // UMKM
  umkmRate: number; // default 0.5%
  umkmExemptLimit: number; // default 500.000.000
  // PPh Badan
  corporateRate: number; // default 22%
  corporate31ELimit: number; // default 4.800.000.000
  // PTKP TK/0
  ptkpTK0Amount: number; // default 54.000.000
  // Biaya Jabatan
  biayaJabatanRate: number; // default 5%
  maxBiayaJabatanMonthly: number; // default 500.000
  // Presets untuk kalkulator manual
  manualPresets: CustomTaxPreset[];
}

export const DEFAULT_TAX_CONFIG: TaxRegulationConfig = {
  version: '2024-2026.1',
  lastUpdated: 'Januari 2024',
  notes: 'Sesuai UU HPP No. 7/2021, PP 58/2023, PMK 168/2023, PP 55/2022, PP 80/2010',
  ppnRate: 11,
  umkmRate: 0.5,
  umkmExemptLimit: 500_000_000,
  corporateRate: 22,
  corporate31ELimit: 4_800_000_000,
  ptkpTK0Amount: 54_000_000,
  biayaJabatanRate: 5,
  maxBiayaJabatanMonthly: 500_000,
  manualPresets: [
    {
      id: 'pph22_15',
      name: 'PPh 22 Belanja Barang Pemerintah (1,5%)',
      rateWithNPWP: 1.5,
      rateNoNPWP: 3.0,
      defaultPPN: true,
      ppnMode: 'include',
      desc: 'Pengadaan barang/material oleh instansi pemerintah di atas Rp 2 Juta',
    },
    {
      id: 'pph23_2',
      name: 'PPh 23 Jasa / Sewa Peralatan (2%)',
      rateWithNPWP: 2.0,
      rateNoNPWP: 4.0,
      defaultPPN: true,
      ppnMode: 'include',
      desc: 'Jasa teknik, manajemen, konsultan, katering, atau sewa aset non-tanah',
    },
    {
      id: 'pph21_25',
      name: 'PPh 21 Honorarium / Kegiatan (2,5%)',
      rateWithNPWP: 2.5,
      rateNoNPWP: 3.0,
      defaultPPN: false,
      ppnMode: 'include',
      desc: 'Tarif efektif 2,5% (Honorarium PNS Golongan III / Tenaga Ahli DPP 50% × 5%)',
    },
    {
      id: 'pph21_5',
      name: 'PPh 21 Honorarium / Kegiatan (5%)',
      rateWithNPWP: 5.0,
      rateNoNPWP: 6.0,
      defaultPPN: false,
      ppnMode: 'include',
      desc: 'Narasumber, juri, tim kerja, atau pegawai tidak tetap',
    },
    {
      id: 'pph42_175',
      name: 'PPh Final Konstruksi Kualifikasi Kecil (1,75%)',
      rateWithNPWP: 1.75,
      rateNoNPWP: 1.75,
      defaultPPN: true,
      ppnMode: 'include',
      desc: 'Pekerjaan konstruksi kualifikasi usaha kecil (PP 9/2022)',
    },
    {
      id: 'pph42_265',
      name: 'PPh Final Konstruksi Menengah/Besar (2,65%)',
      rateWithNPWP: 2.65,
      rateNoNPWP: 2.65,
      defaultPPN: true,
      ppnMode: 'include',
      desc: 'Pekerjaan konstruksi kualifikasi menengah/besar (PP 9/2022)',
    },
    {
      id: 'pph42_10',
      name: 'PPh Final Sewa Gedung / Tanah (10%)',
      rateWithNPWP: 10.0,
      rateNoNPWP: 10.0,
      defaultPPN: true,
      ppnMode: 'include',
      desc: 'Sewa ruang rapat, gedung pertemuan, atau tanah (Pasal 4 ayat 2)',
    },
    {
      id: 'umkm_05',
      name: 'PPh Final UMKM PP 55/2022 (0,5%)',
      rateWithNPWP: 0.5,
      rateNoNPWP: 0.5,
      defaultPPN: false,
      ppnMode: 'include',
      desc: 'Transaksi dengan rekanan penyedia ber-Suket UMKM 0,5%',
    },
  ],
};

const STORAGE_KEY = 'kalkulator_pajak_config_v1';

export function loadStoredConfig(): TaxRegulationConfig {
  if (typeof window === 'undefined') return DEFAULT_TAX_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TAX_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_TAX_CONFIG,
      ...parsed,
      manualPresets:
        Array.isArray(parsed.manualPresets) && parsed.manualPresets.length > 0
          ? parsed.manualPresets
          : DEFAULT_TAX_CONFIG.manualPresets,
    };
  } catch {
    return DEFAULT_TAX_CONFIG;
  }
}

export function saveStoredConfig(config: TaxRegulationConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event('tax-config-updated'));
  } catch (e) {
    console.error('Gagal menyimpan konfigurasi pajak:', e);
  }
}

export function resetConfigToDefaults(): TaxRegulationConfig {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('tax-config-updated'));
  }
  return DEFAULT_TAX_CONFIG;
}

export function updateManualPreset(updatedPreset: CustomTaxPreset): void {
  const current = loadStoredConfig();
  const exists = current.manualPresets.some((p) => p.id === updatedPreset.id);
  const updatedPresets = exists
    ? current.manualPresets.map((p) => (p.id === updatedPreset.id ? updatedPreset : p))
    : [...current.manualPresets, updatedPreset];
  saveStoredConfig({
    ...current,
    manualPresets: updatedPresets,
  });
}

export function deleteManualPreset(id: string): void {
  const current = loadStoredConfig();
  saveStoredConfig({
    ...current,
    manualPresets: current.manualPresets.filter((p) => p.id !== id),
  });
}
