export type PTKPStatus =
  | 'TK/0'
  | 'TK/1'
  | 'TK/2'
  | 'TK/3'
  | 'K/0'
  | 'K/1'
  | 'K/2'
  | 'K/3'
  | 'K/I/0'
  | 'K/I/1'
  | 'K/I/2'
  | 'K/I/3';

export type TERCategory = 'A' | 'B' | 'C';

export interface PTKPItem {
  status: PTKPStatus;
  label: string;
  amount: number;
  category: TERCategory;
  description: string;
}

export const PTKP_RATES: Record<PTKPStatus, PTKPItem> = {
  'TK/0': {
    status: 'TK/0',
    label: 'TK/0 - Tidak Kawin, 0 Tanggungan',
    amount: 54_000_000,
    category: 'A',
    description: 'Wajib Pajak sendiri tanpa tanggungan',
  },
  'TK/1': {
    status: 'TK/1',
    label: 'TK/1 - Tidak Kawin, 1 Tanggungan',
    amount: 58_500_000,
    category: 'A',
    description: 'Wajib Pajak sendiri + 1 tanggungan',
  },
  'TK/2': {
    status: 'TK/2',
    label: 'TK/2 - Tidak Kawin, 2 Tanggungan',
    amount: 63_000_000,
    category: 'B',
    description: 'Wajib Pajak sendiri + 2 tanggungan',
  },
  'TK/3': {
    status: 'TK/3',
    label: 'TK/3 - Tidak Kawin, 3 Tanggungan',
    amount: 67_500_000,
    category: 'B',
    description: 'Wajib Pajak sendiri + 3 tanggungan (maksimal)',
  },
  'K/0': {
    status: 'K/0',
    label: 'K/0 - Kawin, 0 Tanggungan',
    amount: 58_500_000,
    category: 'A',
    description: 'Wajib Pajak kawin tanpa tanggungan',
  },
  'K/1': {
    status: 'K/1',
    label: 'K/1 - Kawin, 1 Tanggungan',
    amount: 63_000_000,
    category: 'B',
    description: 'Wajib Pajak kawin + 1 tanggungan',
  },
  'K/2': {
    status: 'K/2',
    label: 'K/2 - Kawin, 2 Tanggungan',
    amount: 67_500_000,
    category: 'B',
    description: 'Wajib Pajak kawin + 2 tanggungan',
  },
  'K/3': {
    status: 'K/3',
    label: 'K/3 - Kawin, 3 Tanggungan',
    amount: 72_000_000,
    category: 'C',
    description: 'Wajib Pajak kawin + 3 tanggungan (maksimal)',
  },
  'K/I/0': {
    status: 'K/I/0',
    label: 'K/I/0 - Kawin, Istri Bekerja Digabung, 0 Tanggungan',
    amount: 112_500_000,
    category: 'A',
    description: 'Penghasilan suami dan istri digabung, 0 tanggungan',
  },
  'K/I/1': {
    status: 'K/I/1',
    label: 'K/I/1 - Kawin, Istri Bekerja Digabung, 1 Tanggungan',
    amount: 117_000_000,
    category: 'B',
    description: 'Penghasilan suami dan istri digabung + 1 tanggungan',
  },
  'K/I/2': {
    status: 'K/I/2',
    label: 'K/I/2 - Kawin, Istri Bekerja Digabung, 2 Tanggungan',
    amount: 121_500_000,
    category: 'B',
    description: 'Penghasilan suami dan istri digabung + 2 tanggungan',
  },
  'K/I/3': {
    status: 'K/I/3',
    label: 'K/I/3 - Kawin, Istri Bekerja Digabung, 3 Tanggungan',
    amount: 126_000_000,
    category: 'C',
    description: 'Penghasilan suami dan istri digabung + 3 tanggungan',
  },
};

export interface TERTier {
  min: number;
  max: number | null; // null means above min
  rate: number; // in decimal, e.g. 0.0025 = 0.25%
}

// PP 58 Tahun 2023 - Lampiran Huruf A (TER A)
export const TER_A_TIERS: TERTier[] = [
  { min: 0, max: 5_400_000, rate: 0 },
  { min: 5_400_000, max: 5_650_000, rate: 0.0025 },
  { min: 5_650_000, max: 5_950_000, rate: 0.005 },
  { min: 5_950_000, max: 6_300_000, rate: 0.0075 },
  { min: 6_300_000, max: 6_750_000, rate: 0.01 },
  { min: 6_750_000, max: 7_500_000, rate: 0.0125 },
  { min: 7_500_000, max: 8_550_000, rate: 0.015 },
  { min: 8_550_000, max: 9_650_000, rate: 0.0175 },
  { min: 9_650_000, max: 10_050_000, rate: 0.02 },
  { min: 10_050_000, max: 10_350_000, rate: 0.0225 },
  { min: 10_350_000, max: 10_700_000, rate: 0.025 },
  { min: 10_700_000, max: 11_050_000, rate: 0.03 },
  { min: 11_050_000, max: 11_600_000, rate: 0.035 },
  { min: 11_600_000, max: 12_500_000, rate: 0.04 },
  { min: 12_500_000, max: 13_750_000, rate: 0.05 },
  { min: 13_750_000, max: 15_100_000, rate: 0.06 },
  { min: 15_100_000, max: 16_950_000, rate: 0.07 },
  { min: 16_950_000, max: 19_750_000, rate: 0.08 },
  { min: 19_750_000, max: 24_150_000, rate: 0.09 },
  { min: 24_150_000, max: 26_450_000, rate: 0.1 },
  { min: 26_450_000, max: 28_000_000, rate: 0.11 },
  { min: 28_000_000, max: 30_050_000, rate: 0.12 },
  { min: 30_050_000, max: 32_400_000, rate: 0.13 },
  { min: 32_400_000, max: 35_400_000, rate: 0.14 },
  { min: 35_400_000, max: 39_100_000, rate: 0.15 },
  { min: 39_100_000, max: 43_850_000, rate: 0.16 },
  { min: 43_850_000, max: 47_800_000, rate: 0.17 },
  { min: 47_800_000, max: 51_400_000, rate: 0.18 },
  { min: 51_400_000, max: 56_300_000, rate: 0.19 },
  { min: 56_300_000, max: 62_200_000, rate: 0.2 },
  { min: 62_200_000, max: 68_600_000, rate: 0.21 },
  { min: 68_600_000, max: 77_500_000, rate: 0.22 },
  { min: 77_500_000, max: 89_000_000, rate: 0.23 },
  { min: 89_000_000, max: 103_000_000, rate: 0.24 },
  { min: 103_000_000, max: 125_000_000, rate: 0.25 },
  { min: 125_000_000, max: 157_000_000, rate: 0.26 },
  { min: 157_000_000, max: 200_000_000, rate: 0.27 },
  { min: 200_000_000, max: 265_000_000, rate: 0.28 },
  { min: 265_000_000, max: 375_000_000, rate: 0.29 },
  { min: 375_000_000, max: 535_000_000, rate: 0.3 },
  { min: 535_000_000, max: 750_000_000, rate: 0.31 },
  { min: 750_000_000, max: 1_050_000_000, rate: 0.32 },
  { min: 1_050_000_000, max: 1_400_000_000, rate: 0.33 },
  { min: 1_400_000_000, max: null, rate: 0.34 },
];

// PP 58 Tahun 2023 - Lampiran Huruf B (TER B)
export const TER_B_TIERS: TERTier[] = [
  { min: 0, max: 6_200_000, rate: 0 },
  { min: 6_200_000, max: 6_500_000, rate: 0.0025 },
  { min: 6_500_000, max: 6_850_000, rate: 0.005 },
  { min: 6_850_000, max: 7_300_000, rate: 0.0075 },
  { min: 7_300_000, max: 7_750_000, rate: 0.01 },
  { min: 7_750_000, max: 8_200_000, rate: 0.0125 },
  { min: 8_200_000, max: 8_700_000, rate: 0.015 },
  { min: 8_700_000, max: 9_200_000, rate: 0.0175 },
  { min: 9_200_000, max: 9_750_000, rate: 0.02 },
  { min: 9_750_000, max: 10_350_000, rate: 0.0225 },
  { min: 10_350_000, max: 11_000_000, rate: 0.025 },
  { min: 11_000_000, max: 11_750_000, rate: 0.0275 },
  { min: 11_750_000, max: 12_550_000, rate: 0.03 },
  { min: 12_550_000, max: 13_500_000, rate: 0.0325 },
  { min: 13_500_000, max: 14_500_000, rate: 0.035 },
  { min: 14_500_000, max: 15_650_000, rate: 0.0375 },
  { min: 15_650_000, max: 16_950_000, rate: 0.04 },
  { min: 16_950_000, max: 18_500_000, rate: 0.0425 },
  { min: 18_500_000, max: 20_300_000, rate: 0.045 },
  { min: 20_300_000, max: 22_350_000, rate: 0.0475 },
  { min: 22_350_000, max: 24_750_000, rate: 0.05 },
  { min: 24_750_000, max: 27_600_000, rate: 0.0525 },
  { min: 27_600_000, max: 31_000_000, rate: 0.055 },
  { min: 31_000_000, max: 35_100_000, rate: 0.0575 },
  { min: 35_100_000, max: 40_050_000, rate: 0.06 },
  { min: 40_050_000, max: 46_100_000, rate: 0.0625 },
  { min: 46_100_000, max: 53_600_000, rate: 0.065 },
  { min: 53_600_000, max: 63_100_000, rate: 0.0675 },
  { min: 63_100_000, max: 75_250_000, rate: 0.07 },
  { min: 75_250_000, max: 91_050_000, rate: 0.0725 },
  { min: 91_050_000, max: 112_000_000, rate: 0.075 },
  { min: 112_000_000, max: 140_000_000, rate: 0.0775 },
  { min: 140_000_000, max: 177_300_000, rate: 0.08 },
  { min: 177_300_000, max: 230_700_000, rate: 0.0825 },
  { min: 230_700_000, max: 310_250_000, rate: 0.085 },
  { min: 310_250_000, max: 436_950_000, rate: 0.0875 },
  { min: 436_950_000, max: 675_000_000, rate: 0.09 },
  { min: 675_000_000, max: 950_000_000, rate: 0.1 },
  { min: 950_000_000, max: 1_405_000_000, rate: 0.25 },
  { min: 1_405_000_000, max: null, rate: 0.34 },
];

// PP 58 Tahun 2023 - Lampiran Huruf C (TER C)
export const TER_C_TIERS: TERTier[] = [
  { min: 0, max: 6_600_000, rate: 0 },
  { min: 6_600_000, max: 6_950_000, rate: 0.0025 },
  { min: 6_950_000, max: 7_350_000, rate: 0.005 },
  { min: 7_350_000, max: 7_800_000, rate: 0.0075 },
  { min: 7_800_000, max: 8_250_000, rate: 0.01 },
  { min: 8_250_000, max: 8_750_000, rate: 0.0125 },
  { min: 8_750_000, max: 9_300_000, rate: 0.015 },
  { min: 9_300_000, max: 9_850_000, rate: 0.0175 },
  { min: 9_850_000, max: 10_500_000, rate: 0.02 },
  { min: 10_500_000, max: 11_200_000, rate: 0.0225 },
  { min: 11_200_000, max: 12_000_000, rate: 0.025 },
  { min: 12_000_000, max: 12_850_000, rate: 0.0275 },
  { min: 12_850_000, max: 13_800_000, rate: 0.03 },
  { min: 13_800_000, max: 14_850_000, rate: 0.0325 },
  { min: 14_850_000, max: 16_000_000, rate: 0.035 },
  { min: 16_000_000, max: 17_300_000, rate: 0.0375 },
  { min: 17_300_000, max: 18_800_000, rate: 0.04 },
  { min: 18_800_000, max: 20_550_000, rate: 0.0425 },
  { min: 20_550_000, max: 22_600_000, rate: 0.045 },
  { min: 22_600_000, max: 25_000_000, rate: 0.0475 },
  { min: 25_000_000, max: 27_850_000, rate: 0.05 },
  { min: 27_850_000, max: 31_250_000, rate: 0.0525 },
  { min: 31_250_000, max: 35_350_000, rate: 0.055 },
  { min: 35_350_000, max: 40_350_000, rate: 0.0575 },
  { min: 40_350_000, max: 46_450_000, rate: 0.06 },
  { min: 46_450_000, max: 53_950_000, rate: 0.0625 },
  { min: 53_950_000, max: 63_450_000, rate: 0.065 },
  { min: 63_450_000, max: 75_600_000, rate: 0.0675 },
  { min: 75_600_000, max: 91_350_000, rate: 0.07 },
  { min: 91_350_000, max: 112_250_000, rate: 0.0725 },
  { min: 112_250_000, max: 140_200_000, rate: 0.075 },
  { min: 140_200_000, max: 177_450_000, rate: 0.0775 },
  { min: 177_450_000, max: 230_800_000, rate: 0.08 },
  { min: 230_800_000, max: 310_300_000, rate: 0.0825 },
  { min: 310_300_000, max: 436_950_000, rate: 0.085 },
  { min: 436_950_000, max: 675_000_000, rate: 0.0875 },
  { min: 675_000_000, max: 950_000_000, rate: 0.1 },
  { min: 950_000_000, max: 1_419_000_000, rate: 0.25 },
  { min: 1_419_000_000, max: null, rate: 0.34 },
];

export interface ProgressiveBracket {
  limit: number; // upper limit for bracket; Infinity for last
  rate: number;
  label: string;
}

// Tarif Progresif Orang Pribadi Pasal 17 ayat (1) huruf a UU HPP
export const PASAL_17_BRACKETS: ProgressiveBracket[] = [
  { limit: 60_000_000, rate: 0.05, label: 'Lapisan I: 0 s.d. Rp 60.000.000 (5%)' },
  { limit: 250_000_000, rate: 0.15, label: 'Lapisan II: > Rp 60.000.000 s.d. Rp 250.000.000 (15%)' },
  { limit: 500_000_000, rate: 0.25, label: 'Lapisan III: > Rp 250.000.000 s.d. Rp 500.000.000 (25%)' },
  { limit: 5_000_000_000, rate: 0.3, label: 'Lapisan IV: > Rp 500.000.000 s.d. Rp 5.000.000.000 (30%)' },
  { limit: Infinity, rate: 0.35, label: 'Lapisan V: Di atas Rp 5.000.000.000 (35%)' },
];

export const BIAYA_JABATAN_RATE = 0.05; // 5%
export const MAX_BIAYA_JABATAN_MONTHLY = 500_000; // Rp 500.000 / bulan
export const MAX_BIAYA_JABATAN_YEARLY = 6_000_000; // Rp 6.000.000 / tahun

// Default BPJS Rates
export const BPJS_DEFAULTS = {
  // Ditanggung Pemberi Kerja (menambah penghasilan bruto karyawan)
  jkkRate: 0.0024, // 0.24% (sangat rendah)
  jkmRate: 0.003, // 0.30%
  bpjsKesehatanPerusahaan: 0.04, // 4% (max cap Rp 12.000.000 gaji dasar = 480.000)
  bpjsKesehatanCap: 12_000_000,
  
  // Ditanggung Karyawan (mengurangi bruto / take home pay)
  jhtKaryawan: 0.02, // 2%
  jpKaryawan: 0.01, // 1% (max upah JP 2024 ~ Rp 10.042.300 = 100.423)
  jpCap: 10_042_300,
  bpjsKesehatanKaryawan: 0.01, // 1%
};

// UMKM PP 55 Tahun 2022
export const UMKM_FINAL_RATE = 0.005; // 0.5%
export const UMKM_OP_TAX_EXEMPT_LIMIT = 500_000_000; // Rp 500 Juta per tahun untuk Orang Pribadi

// PPh Badan (UU HPP & Pasal 31E)
export const TARIF_BADAN_NORMAL = 0.22; // 22%
export const PASAL_31E_DISCOUNT = 0.5; // Diskon 50% sehingga 11%
export const BATAS_PEREDARAN_31E_PENUH = 4_800_000_000; // 4.8 Miliar
export const BATAS_PEREDARAN_31E_MAKSIMAL = 50_000_000_000; // 50 Miliar

// PPN
export const PPN_RATE_CURRENT = 0.11; // 11%
export const PPN_RATE_FUTURE = 0.12; // 12%

// PPh 23
export const PPH23_RATES = {
  jasaDanSewa: 0.02, // 2%
  dividenBadanRoyaltiHadiah: 0.15, // 15%
  nonNpwpMultiplier: 2.0, // Kena 100% lebih tinggi (atau 4% dan 30%)
};

// PPh Final 4(2)
export const PPH_FINAL_4_2 = {
  sewaTanahBangunan: 0.1, // 10%
  pengalihanTanahBangunan: 0.025, // 2.5%
  bungaDeposito: 0.2, // 20%
};
