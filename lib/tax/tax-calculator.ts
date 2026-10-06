import {
  PTKPStatus,
  TERCategory,
  PTKP_RATES,
  TER_A_TIERS,
  TER_B_TIERS,
  TER_C_TIERS,
  TERTier,
  PASAL_17_BRACKETS,
  BIAYA_JABATAN_RATE,
  MAX_BIAYA_JABATAN_MONTHLY,
  MAX_BIAYA_JABATAN_YEARLY,
  BPJS_DEFAULTS,
  UMKM_FINAL_RATE,
  UMKM_OP_TAX_EXEMPT_LIMIT,
  TARIF_BADAN_NORMAL,
  PASAL_31E_DISCOUNT,
  BATAS_PEREDARAN_31E_PENUH,
  BATAS_PEREDARAN_31E_MAKSIMAL,
  PPH23_RATES,
  PPH_FINAL_4_2,
} from './tax-rates';

export function formatIDR(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return 'Rp 0';
  const rounded = Math.round(amount);
  return 'Rp ' + rounded.toLocaleString('id-ID');
}

export function formatPercent(decimal: number): string {
  const percent = decimal * 100;
  return (
    percent.toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }) + '%'
  );
}

export function terbilang(n: number): string {
  const angka = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];
  n = Math.floor(Math.abs(n));
  if (n === 0) return '';
  if (n < 12) return angka[n];
  if (n < 20) return terbilang(n - 10) + ' Belas';
  if (n < 100) return terbilang(Math.floor(n / 10)) + ' Puluh ' + terbilang(n % 10);
  if (n < 200) return 'Seratus ' + terbilang(n - 100);
  if (n < 1000) return terbilang(Math.floor(n / 100)) + ' Ratus ' + terbilang(n % 100);
  if (n < 2000) return 'Seribu ' + terbilang(n - 1000);
  if (n < 1_000_000)
    return terbilang(Math.floor(n / 1000)) + ' Ribu ' + terbilang(n % 1000);
  if (n < 1_000_000_000)
    return (
      terbilang(Math.floor(n / 1_000_000)) +
      ' Juta ' +
      terbilang(n % 1_000_000)
    );
  if (n < 1_000_000_000_000)
    return (
      terbilang(Math.floor(n / 1_000_000_000)) +
      ' Miliar ' +
      terbilang(n % 1_000_000_000)
    );
  if (n < 1_000_000_000_000_000)
    return (
      terbilang(Math.floor(n / 1_000_000_000_000)) +
      ' Triliun ' +
      terbilang(n % 1_000_000_000_000)
    );
  return '';
}

export function terbilangRupiah(amount: number): string {
  if (!amount || amount === 0) return 'Nol Rupiah';
  const hasil = terbilang(amount).replace(/\s+/g, ' ').trim();
  return hasil ? hasil + ' Rupiah' : 'Nol Rupiah';
}

// 1. Dapatkan Kategori TER berdasarkan status PTKP
export function getTERCategory(status: PTKPStatus): TERCategory {
  const item = PTKP_RATES[status];
  return item ? item.category : 'A';
}

// 2. Dapatkan Tarif TER yang berlaku untuk penghasilan bruto bulanan tertentu
export function getTERRate(status: PTKPStatus, monthlyGross: number): {
  category: TERCategory;
  rate: number;
  tier: TERTier;
} {
  const category = getTERCategory(status);
  let tiers: TERTier[];

  if (category === 'A') {
    tiers = TER_A_TIERS;
  } else if (category === 'B') {
    tiers = TER_B_TIERS;
  } else {
    tiers = TER_C_TIERS;
  }

  for (const tier of tiers) {
    if (tier.max === null) {
      if (monthlyGross > tier.min) {
        return { category, rate: tier.rate, tier };
      }
    } else {
      if (monthlyGross > tier.min && monthlyGross <= tier.max) {
        return { category, rate: tier.rate, tier };
      }
      if (tier.min === 0 && monthlyGross <= tier.max) {
        return { category, rate: tier.rate, tier };
      }
    }
  }

  // fallback to last
  const last = tiers[tiers.length - 1];
  return { category, rate: last.rate, tier: last };
}

// 3. Perhitungan PPh Progresif Pasal 17 Ayat (1) Huruf a UU HPP atas PKP Setahun
export interface ProgressiveTierResult {
  label: string;
  rate: number;
  taxableInBracket: number;
  taxAmount: number;
}

export function calculateProgressiveTax(pkp: number): {
  totalTax: number;
  breakdown: ProgressiveTierResult[];
} {
  if (pkp <= 0) {
    return { totalTax: 0, breakdown: [] };
  }

  // PKP dibulatkan ke bawah hingga ribuan penuh sesuai ketentuan perpajakan
  const roundedPKP = Math.floor(pkp / 1000) * 1000;
  let remainingPKP = roundedPKP;
  let totalTax = 0;
  let previousLimit = 0;
  const breakdown: ProgressiveTierResult[] = [];

  for (const bracket of PASAL_17_BRACKETS) {
    if (remainingPKP <= 0) break;

    const bracketSpan = bracket.limit - previousLimit;
    const taxableInBracket = Math.min(remainingPKP, bracketSpan);
    const taxAmount = taxableInBracket * bracket.rate;

    breakdown.push({
      label: bracket.label,
      rate: bracket.rate,
      taxableInBracket,
      taxAmount,
    });

    totalTax += taxAmount;
    remainingPKP -= taxableInBracket;
    previousLimit = bracket.limit;
  }

  return { totalTax, breakdown };
}

// 4. Kalkulator PPh 21 Karyawan Tetap Lengkap
export interface EmployeeSalaryInput {
  baseSalary: number; // Gaji Pokok
  allowanceFixed: number; // Tunjangan Tetap
  allowanceVariable: number; // Tunjangan Tidak Tetap / Transport / Makan
  overtimeBonus: number; // Lembur / Bonus Bulanan / THR (jika ada di bulan bersangkutan)
  hasNPWP: boolean;
  statusPTKP: PTKPStatus;
  includeBPJS: boolean; // Menghitung BPJS Ketenagakerjaan & Kesehatan otomatis
  // Kustom BPJS jika includeBPJS true
  jkkRatePercent?: number; // default 0.24%
  customPensionKaryawan?: number; // iuran pensiun mandiri
  method: 'gross' | 'nett' | 'gross_up'; // Metode pemotongan
  monthsWorkedPerYear?: number; // Default 12 bulan
  annualBonusTHR?: number; // THR/Bonus tahunan (untuk simulasi masa pajak Desember / tahunan)
}

export interface PPh21MonthlyResult {
  // Komponen Penghasilan Bruto
  baseSalary: number;
  allowanceFixed: number;
  allowanceVariable: number;
  overtimeBonus: number;
  bpjsJKM: number;
  bpjsJKK: number;
  bpjsKesehatanPerusahaan: number;
  grossIncome: number; // Bruto untuk dasar TER

  // Potongan Karyawan
  biayaJabatan: number; // Untuk kalkulasi tahunan/neto
  bpjsJHTKaryawan: number;
  bpjsJPKaryawan: number;
  bpjsKesehatanKaryawan: number;
  customPensionKaryawan: number;
  totalPengurang: number;

  // TER Details
  terCategory: TERCategory;
  terRate: number;
  terTaxMonthly: number; // PPh 21 Bulanan masa reguler (Jan-Nov)

  // Take Home Pay
  takeHomePay: number;

  // Analisis Gross-Up (jika metode Gross-Up)
  taxAllowance: number;
}

export interface PPh21AnnualResult {
  statusPTKP: PTKPStatus;
  ptkpAmount: number;
  annualGrossIncome: number;
  annualBiayaJabatan: number;
  annualPensionDeductions: number;
  annualNetIncome: number;
  pkp: number; // Penghasilan Kena Pajak (setelah dikurangi PTKP)
  totalTaxAnnual: number; // PPh 21 Terutang Setahun (Pasal 17)
  taxPaidJanToNov: number; // Akumulasi PPh 21 Jan-Nov (11 bulan)
  taxDecember: number; // Selisih PPh 21 di masa Desember
  taxDecemberUnderpayment: boolean; // Apakah ada kekurangan/kelebihan
  breakdownPasal17: ProgressiveTierResult[];
}

export function calculateEmployeeTax(input: EmployeeSalaryInput): {
  monthly: PPh21MonthlyResult;
  annual: PPh21AnnualResult;
  terCategory: TERCategory;
} {
  const {
    baseSalary,
    allowanceFixed,
    allowanceVariable,
    overtimeBonus,
    hasNPWP,
    statusPTKP,
    includeBPJS,
    jkkRatePercent = 0.24,
    customPensionKaryawan = 0,
    annualBonusTHR = 0,
    monthsWorkedPerYear = 12,
  } = input;

  const ptkpItem = PTKP_RATES[statusPTKP] || PTKP_RATES['TK/0'];

  // Hitung BPJS Ditanggung Perusahaan (Menambah Bruto)
  let bpjsJKK = 0;
  let bpjsJKM = 0;
  let bpjsKesehatanPerusahaan = 0;

  // Hitung BPJS Ditanggung Karyawan (Mengurangi Bruto untuk Neto Tahunan & mengurangi THP)
  let bpjsJHTKaryawan = 0;
  let bpjsJPKaryawan = 0;
  let bpjsKesehatanKaryawan = 0;

  if (includeBPJS) {
    const salaryBasis = baseSalary + allowanceFixed;
    bpjsJKK = salaryBasis * (jkkRatePercent / 100);
    bpjsJKM = salaryBasis * BPJS_DEFAULTS.jkmRate;

    const kesBase = Math.min(salaryBasis, BPJS_DEFAULTS.bpjsKesehatanCap);
    bpjsKesehatanPerusahaan = kesBase * BPJS_DEFAULTS.bpjsKesehatanPerusahaan;
    bpjsKesehatanKaryawan = kesBase * BPJS_DEFAULTS.bpjsKesehatanKaryawan;

    bpjsJHTKaryawan = salaryBasis * BPJS_DEFAULTS.jhtKaryawan;

    const jpBase = Math.min(salaryBasis, BPJS_DEFAULTS.jpCap);
    bpjsJPKaryawan = jpBase * BPJS_DEFAULTS.jpKaryawan;
  }

  // Bruto Dasar Bulanan
  const regularGross =
    baseSalary +
    allowanceFixed +
    allowanceVariable +
    overtimeBonus +
    bpjsJKK +
    bpjsJKM +
    bpjsKesehatanPerusahaan;

  // Dapatkan TER Bulanan
  const terInfo = getTERRate(statusPTKP, regularGross);
  let terRate = terInfo.rate;
  if (!hasNPWP) {
    // Sesuai UU HPP / PMK 168/2023 Pasal 14 ayat (1), non-NPWP dikenakan tarif 20% lebih tinggi jika belum dipotong tarif efektif
    // Namun dalam PP 58/2023, TER berlaku umum untuk pemotongan. Di beberapa penegasan, tarif non-NPWP dikenakan 120%
    terRate = terRate * 1.2;
  }

  let terTaxMonthly = regularGross * terRate;

  // Gross-Up Iterative Solver (jika perusahaan menanggung dengan tunjangan pajak)
  let taxAllowance = 0;
  if (input.method === 'gross_up') {
    let currentGross = regularGross;
    let allowanceEstimate = 0;
    // Iterate 3 times to converge
    for (let i = 0; i < 4; i++) {
      const iterTer = getTERRate(statusPTKP, currentGross);
      allowanceEstimate = currentGross * iterTer.rate;
      currentGross = regularGross + allowanceEstimate;
    }
    taxAllowance = allowanceEstimate;
    terTaxMonthly = allowanceEstimate;
  }

  // Biaya Jabatan Bulanan (5% dari bruto, maks 500rb)
  const biayaJabatan = Math.min(
    regularGross * BIAYA_JABATAN_RATE,
    MAX_BIAYA_JABATAN_MONTHLY
  );

  const totalPengurang =
    bpjsJHTKaryawan +
    bpjsJPKaryawan +
    bpjsKesehatanKaryawan +
    customPensionKaryawan;

  // Take Home Pay Calculation
  let takeHomePay = 0;
  if (input.method === 'gross') {
    // Karyawan dipotong PPh 21 dan potongan iuran
    takeHomePay =
      baseSalary +
      allowanceFixed +
      allowanceVariable +
      overtimeBonus -
      totalPengurang -
      terTaxMonthly;
  } else if (input.method === 'nett') {
    // Perusahaan bayar pajaknya langsung, karyawan hanya potong iuran
    takeHomePay =
      baseSalary +
      allowanceFixed +
      allowanceVariable +
      overtimeBonus -
      totalPengurang;
  } else {
    // Gross-up: Tunjangan pajak diterima dan langsung dipotong pajak senilai sama
    takeHomePay =
      baseSalary +
      allowanceFixed +
      allowanceVariable +
      overtimeBonus -
      totalPengurang;
  }

  const monthlyResult: PPh21MonthlyResult = {
    baseSalary,
    allowanceFixed,
    allowanceVariable,
    overtimeBonus,
    bpjsJKM,
    bpjsJKK,
    bpjsKesehatanPerusahaan,
    grossIncome: regularGross,
    biayaJabatan,
    bpjsJHTKaryawan,
    bpjsJPKaryawan,
    bpjsKesehatanKaryawan,
    customPensionKaryawan,
    totalPengurang,
    terCategory: terInfo.category,
    terRate: terInfo.rate,
    terTaxMonthly,
    takeHomePay: Math.max(0, takeHomePay),
    taxAllowance,
  };

  // --- PERHITUNGAN TAHUNAN / MASA DESEMBER (Pasal 17 UU HPP) ---
  const annualMonths = Math.min(12, Math.max(1, monthsWorkedPerYear));
  const annualGrossIncome =
    regularGross * annualMonths + annualBonusTHR;

  const annualBiayaJabatan = Math.min(
    annualGrossIncome * BIAYA_JABATAN_RATE,
    MAX_BIAYA_JABATAN_YEARLY
  );

  const annualPensionDeductions =
    (bpjsJHTKaryawan + bpjsJPKaryawan + customPensionKaryawan) * annualMonths;

  const annualNetIncome = Math.max(
    0,
    annualGrossIncome - annualBiayaJabatan - annualPensionDeductions
  );

  const pkp = Math.max(0, annualNetIncome - ptkpItem.amount);
  const roundedPKP = Math.floor(pkp / 1000) * 1000;

  const { totalTax: rawAnnualTax, breakdown } = calculateProgressiveTax(roundedPKP);
  const totalTaxAnnual = !hasNPWP ? rawAnnualTax * 1.2 : rawAnnualTax;

  // Pajak Jan-Nov (11 bulan) yang sudah dipotong via TER
  const janToNovMonths = Math.max(0, annualMonths - 1);
  const taxPaidJanToNov = terTaxMonthly * janToNovMonths;

  // Pajak masa Desember = Pajak Setahun - Pajak Terpotong Jan s/d Nov
  const taxDecember = Math.max(0, totalTaxAnnual - taxPaidJanToNov);
  const taxDecemberUnderpayment = totalTaxAnnual >= taxPaidJanToNov;

  const annualResult: PPh21AnnualResult = {
    statusPTKP,
    ptkpAmount: ptkpItem.amount,
    annualGrossIncome,
    annualBiayaJabatan,
    annualPensionDeductions,
    annualNetIncome,
    pkp: roundedPKP,
    totalTaxAnnual,
    taxPaidJanToNov,
    taxDecember,
    taxDecemberUnderpayment,
    breakdownPasal17: breakdown,
  };

  return {
    monthly: monthlyResult,
    annual: annualResult,
    terCategory: terInfo.category,
  };
}

// 5. Kalkulator PPh 21 Bukan Pegawai / Tenaga Ahli / Freelancer (PMK 168/2023)
export interface NonEmployeeTaxInput {
  grossFee: number; // Penghasilan Bruto per invoice/kegiatan
  isContinuous: boolean; // Berkesinambungan atau tidak
  cumulativeGrossPrevious: number; // Akumulasi bruto sebelumnya di tahun bersangkutan
  hasNPWP: boolean;
}

export function calculateNonEmployeeTax(input: NonEmployeeTaxInput): {
  dpp: number; // 50% x Bruto
  taxAmount: number;
  effectiveRate: number;
  breakdown: ProgressiveTierResult[];
} {
  const { grossFee, cumulativeGrossPrevious, hasNPWP } = input;
  // Sesuai PMK 168/2023: DPP = 50% x Penghasilan Bruto
  const currentDPP = grossFee * 0.5;
  const previousDPP = cumulativeGrossPrevious * 0.5;

  // Pajak dihitung dengan tarif Pasal 17 secara kumulatif atas DPP
  const prevTax = calculateProgressiveTax(previousDPP).totalTax;
  const newCumulativeDPP = previousDPP + currentDPP;
  const newCumulativeResult = calculateProgressiveTax(newCumulativeDPP);
  let taxAmount = Math.max(0, newCumulativeResult.totalTax - prevTax);

  if (!hasNPWP) {
    taxAmount = taxAmount * 1.2; // 20% lebih tinggi jika tanpa NPWP
  }

  const effectiveRate = grossFee > 0 ? taxAmount / grossFee : 0;

  return {
    dpp: currentDPP,
    taxAmount,
    effectiveRate,
    breakdown: newCumulativeResult.breakdown,
  };
}

// 6. Kalkulator UMKM PP 55 Tahun 2022
export interface UMKMTaxInput {
  taxpayerType: 'orang_pribadi' | 'badan';
  monthlyTurnovers: number[]; // Array 12 bulan omzet
}

export interface UMKMMonthDetail {
  month: number;
  monthName: string;
  turnover: number;
  cumulativeTurnover: number;
  taxExemptUsed: number;
  taxableTurnover: number;
  taxRate: number;
  taxDue: number;
}

export function calculateUMKMTax(input: UMKMTaxInput): {
  totalTurnover: number;
  totalTaxableTurnover: number;
  totalTaxDue: number;
  taxExemptRemaining: number;
  monthlyDetails: UMKMMonthDetail[];
} {
  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  let cumulativeTurnover = 0;
  let remainingExempt =
    input.taxpayerType === 'orang_pribadi' ? UMKM_OP_TAX_EXEMPT_LIMIT : 0;
  let totalTaxableTurnover = 0;
  let totalTaxDue = 0;
  const monthlyDetails: UMKMMonthDetail[] = [];

  for (let i = 0; i < 12; i++) {
    const turnover = input.monthlyTurnovers[i] || 0;
    cumulativeTurnover += turnover;

    let taxableInMonth = 0;
    let exemptUsedInMonth = 0;

    if (input.taxpayerType === 'orang_pribadi') {
      if (remainingExempt >= turnover) {
        // Seluruh omzet bulan ini masih dalam batas bebas pajak
        exemptUsedInMonth = turnover;
        taxableInMonth = 0;
        remainingExempt -= turnover;
      } else if (remainingExempt > 0) {
        // Sebagian omzet bulan ini menghabiskan batas bebas pajak
        exemptUsedInMonth = remainingExempt;
        taxableInMonth = turnover - remainingExempt;
        remainingExempt = 0;
      } else {
        // Batas bebas pajak sudah habis di bulan-bulan sebelumnya
        exemptUsedInMonth = 0;
        taxableInMonth = turnover;
      }
    } else {
      // Badan Usaha (PT/CV) tidak mendapatkan fasilitas bebas pajak Rp 500 juta
      taxableInMonth = turnover;
      exemptUsedInMonth = 0;
    }

    const taxDue = taxableInMonth * UMKM_FINAL_RATE;
    totalTaxableTurnover += taxableInMonth;
    totalTaxDue += taxDue;

    monthlyDetails.push({
      month: i + 1,
      monthName: monthNames[i],
      turnover,
      cumulativeTurnover,
      taxExemptUsed: exemptUsedInMonth,
      taxableTurnover: taxableInMonth,
      taxRate: UMKM_FINAL_RATE,
      taxDue,
    });
  }

  return {
    totalTurnover: cumulativeTurnover,
    totalTaxableTurnover,
    totalTaxDue,
    taxExemptRemaining: remainingExempt,
    monthlyDetails,
  };
}

// 7. Kalkulator PPh Badan UU HPP & Fasilitas Pasal 31E
export interface CorporateTaxInput {
  grossRevenue: number; // Omzet / Peredaran Bruto Setahun
  taxableProfit: number; // Penghasilan Kena Pajak (Laba Fiskal)
  usePasal31E: boolean; // Menggunakan fasilitas Pasal 31E
}

export function calculateCorporateTax(input: CorporateTaxInput): {
  category: 'under_4_8b' | 'between_4_8b_50b' | 'over_50b';
  categoryLabel: string;
  facilityPKP: number;
  nonFacilityPKP: number;
  taxFromFacility: number;
  taxFromNonFacility: number;
  totalTax: number;
  effectiveTaxRate: number;
  taxSaving: number;
} {
  const { grossRevenue, taxableProfit, usePasal31E } = input;
  const normalTax = Math.max(0, taxableProfit * TARIF_BADAN_NORMAL);

  if (!usePasal31E || grossRevenue > BATAS_PEREDARAN_31E_MAKSIMAL) {
    return {
      category: 'over_50b',
      categoryLabel: 'Peredaran Bruto > Rp 50 Miliar (Tarif Normal 22%)',
      facilityPKP: 0,
      nonFacilityPKP: Math.max(0, taxableProfit),
      taxFromFacility: 0,
      taxFromNonFacility: normalTax,
      totalTax: normalTax,
      effectiveTaxRate: taxableProfit > 0 ? normalTax / taxableProfit : 0,
      taxSaving: 0,
    };
  }

  if (grossRevenue <= BATAS_PEREDARAN_31E_PENUH) {
    // Mendapat fasilitas diskon 50% penuh atas seluruh laba fiskal (Tarif efektif 11%)
    const facilityTax = taxableProfit * (TARIF_BADAN_NORMAL * PASAL_31E_DISCOUNT);
    return {
      category: 'under_4_8b',
      categoryLabel:
        'Peredaran Bruto s.d. Rp 4,8 Miliar (Mendapat Diskon 50% Fasilitas Pasal 31E)',
      facilityPKP: Math.max(0, taxableProfit),
      nonFacilityPKP: 0,
      taxFromFacility: facilityTax,
      taxFromNonFacility: 0,
      totalTax: facilityTax,
      effectiveTaxRate: taxableProfit > 0 ? facilityTax / taxableProfit : 0,
      taxSaving: normalTax - facilityTax,
    };
  }

  // Omzet antara Rp 4,8 Miliar s.d. Rp 50 Miliar:
  // Bagian PKP yang mendapat fasilitas = (4,8 Miliar / Peredaran Bruto) x PKP
  const facilityRatio = BATAS_PEREDARAN_31E_PENUH / grossRevenue;
  const facilityPKP = Math.floor(taxableProfit * facilityRatio);
  const nonFacilityPKP = Math.max(0, taxableProfit - facilityPKP);

  const taxFromFacility =
    facilityPKP * (TARIF_BADAN_NORMAL * PASAL_31E_DISCOUNT);
  const taxFromNonFacility = nonFacilityPKP * TARIF_BADAN_NORMAL;
  const totalTax = taxFromFacility + taxFromNonFacility;

  return {
    category: 'between_4_8b_50b',
    categoryLabel:
      'Peredaran Bruto Rp 4,8 Miliar s.d. Rp 50 Miliar (Fasilitas Proporsional Pasal 31E)',
    facilityPKP,
    nonFacilityPKP,
    taxFromFacility,
    taxFromNonFacility,
    totalTax,
    effectiveTaxRate: taxableProfit > 0 ? totalTax / taxableProfit : 0,
    taxSaving: normalTax - totalTax,
  };
}

// 8. Kalkulator PPN (Pajak Pertambahan Nilai)
export interface VATInput {
  amount: number;
  priceType: 'exclude' | 'include'; // Exclude (belum termasuk) vs Include (sudah termasuk)
  ratePercent: number; // 11% atau 12%
}

export function calculateVAT(input: VATInput): {
  dpp: number;
  vatAmount: number;
  totalWithVAT: number;
} {
  const rate = input.ratePercent / 100;
  if (input.priceType === 'exclude') {
    const dpp = input.amount;
    const vatAmount = dpp * rate;
    return {
      dpp,
      vatAmount,
      totalWithVAT: dpp + vatAmount,
    };
  } else {
    // Sesuai rumus include: DPP = Harga / (1 + tarif)
    const dpp = input.amount / (1 + rate);
    const vatAmount = input.amount - dpp;
    return {
      dpp,
      vatAmount,
      totalWithVAT: input.amount,
    };
  }
}

// 9. Kalkulator PPh 23
export function calculatePPh23(
  amount: number,
  category: 'jasa_sewa' | 'royalti_dividen',
  hasNPWP: boolean
): {
  taxRate: number;
  taxAmount: number;
  netPayment: number;
} {
  let baseRate =
    category === 'jasa_sewa'
      ? PPH23_RATES.jasaDanSewa
      : PPH23_RATES.dividenBadanRoyaltiHadiah;

  if (!hasNPWP) {
    baseRate = baseRate * PPH23_RATES.nonNpwpMultiplier;
  }

  const taxAmount = amount * baseRate;
  return {
    taxRate: baseRate,
    taxAmount,
    netPayment: amount - taxAmount,
  };
}

// 10. Kalkulator PPh Final Pasal 4(2)
export function calculatePPhFinal42(
  amount: number,
  type: 'sewa_tanah_bangunan' | 'pengalihan_tanah_bangunan' | 'bunga_deposito'
): {
  taxRate: number;
  taxAmount: number;
  netPayment: number;
} {
  let taxRate = PPH_FINAL_4_2.sewaTanahBangunan;
  if (type === 'pengalihan_tanah_bangunan') {
    taxRate = PPH_FINAL_4_2.pengalihanTanahBangunan;
  } else if (type === 'bunga_deposito') {
    taxRate = PPH_FINAL_4_2.bungaDeposito;
  }

  const taxAmount = amount * taxRate;
  return {
    taxRate,
    taxAmount,
    netPayment: amount - taxAmount,
  };
}
