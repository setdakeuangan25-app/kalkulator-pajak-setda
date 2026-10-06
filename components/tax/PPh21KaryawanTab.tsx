'use client';

import React, { useState } from 'react';
import {
  PTKPStatus,
  PTKP_RATES,
} from '@/lib/tax/tax-rates';
import {
  EmployeeSalaryInput,
  calculateEmployeeTax,
  formatIDR,
  formatPercent,
} from '@/lib/tax/tax-calculator';
import {
  Info,
  Layers,
  ArrowRight,
  TrendingDown,
  Wallet,
  Calendar,
  Building2,
  FileCheck2,
  Copy,
  Check,
} from 'lucide-react';

interface PPh21KaryawanTabProps {
  salaryInput: EmployeeSalaryInput;
  setSalaryInput: React.Dispatch<React.SetStateAction<EmployeeSalaryInput>>;
  onOpenPrintSlip: () => void;
}

export const PPh21KaryawanTab: React.FC<PPh21KaryawanTabProps> = ({
  salaryInput,
  setSalaryInput,
  onOpenPrintSlip,
}) => {
  const [viewMode, setViewMode] = useState<'monthly' | 'annual' | 'comparison'>(
    'monthly'
  );
  const [copiedSlip, setCopiedSlip] = useState(false);

  const taxResult = calculateEmployeeTax(salaryInput);
  const { monthly, annual, terCategory } = taxResult;

  // Handle number input changes safely
  const handleNumberChange = (
    field: keyof EmployeeSalaryInput,
    val: string
  ) => {
    const cleanNum = val.replace(/\D/g, '');
    const num = cleanNum === '' ? 0 : parseInt(cleanNum, 10);
    setSalaryInput((prev) => ({
      ...prev,
      [field]: num,
    }));
  };

  const handleCopySummary = () => {
    const text = `
RINGKASAN PENGHITUNGAN PPH 21 (PP 58/2023 & PMK 168/2023)
==================================================
Gaji Pokok: ${formatIDR(monthly.baseSalary)}
Tunjangan: ${formatIDR(monthly.allowanceFixed + monthly.allowanceVariable)}
Total Bruto Bulanan: ${formatIDR(monthly.grossIncome)}
Status PTKP: ${salaryInput.statusPTKP} (TER ${terCategory})
Tarif TER: ${formatPercent(monthly.terRate)}
--------------------------------------------------
Potongan PPh 21 Bulanan (Jan-Nov): ${formatIDR(monthly.terTaxMonthly)}
Take Home Pay: ${formatIDR(monthly.takeHomePay)}
Metode: ${salaryInput.method.toUpperCase()}
--------------------------------------------------
Estimasi PPh 21 Tahunan (Ps. 17): ${formatIDR(annual.totalTaxAnnual)}
PPh 21 Terpotong Jan-Nov (11 bln): ${formatIDR(annual.taxPaidJanToNov)}
PPh 21 Masa Desember: ${formatIDR(annual.taxDecember)}
==================================================
Dihitung otomatis melalui Kalkulator Pajak RI
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedSlip(true);
    setTimeout(() => setCopiedSlip(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Regulation Note */}
      <div className="bg-slate-900 rounded-lg p-4 sm:p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <span>RESMI: SKEMA TER (TARIF EFEKTIF RATA-RATA) BERLAKU SEJAK 1 JANUARI 2024</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
            Kalkulator PPh Pasal 21 Pegawai Tetap
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Sesuai PP No. 58/2023 dan PMK No. 168/2023. Perhitungan bulan Januari–November menggunakan
            TER Bulanan (Kategori {terCategory}), sedangkan masa pajak Desember dihitung menggunakan tarif progresif Pasal 17 ayat (1) UU HPP.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={onOpenPrintSlip}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors whitespace-nowrap"
          >
            Buka Slip Resmi
          </button>
        </div>
      </div>

      {/* Main Grid: Input Form on Left (5 cols) & Live Results on Right (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Input Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-5 shadow-xs">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Parameter Penghasilan Karyawan
            </h3>
            <span className="text-[11px] text-slate-500">Mata Uang: IDR (Rp)</span>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 text-xs">
            {/* Gaji Pokok */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">
                  Gaji Pokok Bulanan
                </label>
                <span className="font-mono text-emerald-700 font-medium">
                  {formatIDR(salaryInput.baseSalary)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">
                  Rp
                </span>
                <input
                  type="text"
                  value={salaryInput.baseSalary === 0 ? '' : salaryInput.baseSalary.toLocaleString('id-ID')}
                  onChange={(e) => handleNumberChange('baseSalary', e.target.value)}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-slate-300 rounded focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                />
              </div>
            </div>

            {/* Tunjangan Tetap & Tidak Tetap in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  Tunjangan Tetap
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 font-mono text-xs">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={salaryInput.allowanceFixed === 0 ? '' : salaryInput.allowanceFixed.toLocaleString('id-ID')}
                    onChange={(e) => handleNumberChange('allowanceFixed', e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-2.5 py-2 text-xs font-mono border border-slate-300 rounded focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  Tunjangan Transport / Makan
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 font-mono text-xs">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={salaryInput.allowanceVariable === 0 ? '' : salaryInput.allowanceVariable.toLocaleString('id-ID')}
                    onChange={(e) => handleNumberChange('allowanceVariable', e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-2.5 py-2 text-xs font-mono border border-slate-300 rounded focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Lembur / Insentif Bulanan & THR/Bonus Setahun */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  Lembur / Bonus Bulan Ini
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 font-mono text-xs">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={salaryInput.overtimeBonus === 0 ? '' : salaryInput.overtimeBonus.toLocaleString('id-ID')}
                    onChange={(e) => handleNumberChange('overtimeBonus', e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-2.5 py-2 text-xs font-mono border border-slate-300 rounded focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  Bonus / THR Tahunan
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 font-mono text-xs">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={salaryInput.annualBonusTHR === 0 ? '' : salaryInput.annualBonusTHR?.toLocaleString('id-ID')}
                    onChange={(e) => handleNumberChange('annualBonusTHR', e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-2.5 py-2 text-xs font-mono border border-slate-300 rounded focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-500">
                  Untuk evaluasi masa akhir (Desember)
                </span>
              </div>
            </div>

            {/* Status PTKP */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">
                  Status PTKP (Penghasilan Tidak Kena Pajak)
                </label>
                <span className="text-[11px] font-mono text-slate-600 font-medium">
                  {formatIDR(PTKP_RATES[salaryInput.statusPTKP]?.amount || 54000000)} / thn
                </span>
              </div>
              <select
                value={salaryInput.statusPTKP}
                onChange={(e) =>
                  setSalaryInput((prev) => ({
                    ...prev,
                    statusPTKP: e.target.value as PTKPStatus,
                  }))
                }
                className="w-full py-2 px-3 text-xs border border-slate-300 rounded bg-white text-slate-800 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
              >
                <optgroup label="TER Kategori A (TK/0, TK/1, K/0)">
                  <option value="TK/0">TK/0 - Tidak Kawin, 0 Tanggungan (Rp 54 Juta)</option>
                  <option value="TK/1">TK/1 - Tidak Kawin, 1 Tanggungan (Rp 58.5 Juta)</option>
                  <option value="K/0">K/0 - Kawin, 0 Tanggungan (Rp 58.5 Juta)</option>
                </optgroup>
                <optgroup label="TER Kategori B (TK/2, TK/3, K/1, K/2)">
                  <option value="TK/2">TK/2 - Tidak Kawin, 2 Tanggungan (Rp 63 Juta)</option>
                  <option value="TK/3">TK/3 - Tidak Kawin, 3 Tanggungan (Rp 67.5 Juta)</option>
                  <option value="K/1">K/1 - Kawin, 1 Tanggungan (Rp 63 Juta)</option>
                  <option value="K/2">K/2 - Kawin, 2 Tanggungan (Rp 67.5 Juta)</option>
                </optgroup>
                <optgroup label="TER Kategori C (K/3)">
                  <option value="K/3">K/3 - Kawin, 3 Tanggungan (Rp 72 Juta)</option>
                </optgroup>
                <optgroup label="Status Istri Bekerja Digabung (K/I)">
                  <option value="K/I/0">K/I/0 - Kawin + Istri Bekerja, 0 Tanggungan (Rp 112.5 Jt)</option>
                  <option value="K/I/1">K/I/1 - Kawin + Istri Bekerja, 1 Tanggungan (Rp 117 Jt)</option>
                  <option value="K/I/2">K/I/2 - Kawin + Istri Bekerja, 2 Tanggungan (Rp 121.5 Jt)</option>
                  <option value="K/I/3">K/I/3 - Kawin + Istri Bekerja, 3 Tanggungan (Rp 126 Jt)</option>
                </optgroup>
              </select>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Kategori TER: <strong className="text-slate-800">Kategori {terCategory}</strong>
                </span>
                <span>{PTKP_RATES[salaryInput.statusPTKP]?.description}</span>
              </div>
            </div>

            {/* Metode Pemotongan Pajak: Gross vs Nett vs Gross-up */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1.5">
                Metode Pemotongan PPh 21
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: 'gross',
                    label: 'Gross',
                    desc: 'Dipotong dari gaji',
                  },
                  {
                    id: 'nett',
                    label: 'Nett',
                    desc: 'Ditanggung perush.',
                  },
                  {
                    id: 'gross_up',
                    label: 'Gross-Up',
                    desc: 'Tunjangan pajak',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setSalaryInput((prev) => ({
                        ...prev,
                        method: item.id as 'gross' | 'nett' | 'gross_up',
                      }))
                    }
                    className={`p-2 rounded text-left border transition-all ${
                      salaryInput.method === item.id
                        ? 'border-emerald-600 bg-emerald-50/50 text-slate-900 ring-1 ring-emerald-600'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-500 truncate">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles: NPWP & BPJS */}
            <div className="pt-2 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">Status Kepemilikan NPWP</div>
                  <div className="text-[11px] text-slate-500">
                    Non-NPWP dikenakan tarif 20% lebih tinggi
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSalaryInput((prev) => ({
                      ...prev,
                      hasNPWP: !prev.hasNPWP,
                    }))
                  }
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    salaryInput.hasNPWP ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                      salaryInput.hasNPWP ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">
                    Hitung BPJS Ketenagakerjaan & Kesehatan
                  </div>
                  <div className="text-[11px] text-slate-500">
                    JKK (0.24%), JKM (0.3%), Kes (4%/1%), JHT (2%), JP (1%)
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSalaryInput((prev) => ({
                      ...prev,
                      includeBPJS: !prev.includeBPJS,
                    }))
                  }
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    salaryInput.includeBPJS ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                      salaryInput.includeBPJS ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Results Dashboard */}
        <div className="lg:col-span-7 space-y-5">
          {/* 4 Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {/* 1. Bruto Bulanan */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 min-w-0">
              <span className="text-[11px] text-slate-500 block truncate">Penghasilan Bruto</span>
              <span
                className="text-sm sm:text-base xl:text-lg font-bold font-mono text-slate-900 block mt-1 tabular-nums truncate"
                title={formatIDR(monthly.grossIncome)}
              >
                {formatIDR(monthly.grossIncome)}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block truncate">Dasar hitung TER</span>
            </div>

            {/* 2. Tarif TER */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 min-w-0">
              <span className="text-[11px] text-slate-500 block truncate">
                Tarif TER ({terCategory})
              </span>
              <span
                className="text-sm sm:text-base xl:text-lg font-bold font-mono text-emerald-700 block mt-1 tabular-nums truncate"
                title={formatPercent(monthly.terRate)}
              >
                {formatPercent(monthly.terRate)}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block truncate">
                PP 58/2023 Kat. {terCategory}
              </span>
            </div>

            {/* 3. PPh 21 Bulanan */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 min-w-0">
              <span className="text-[11px] text-slate-500 block truncate">PPh 21 Bulanan</span>
              <span
                className="text-sm sm:text-base xl:text-lg font-bold font-mono text-rose-600 block mt-1 tabular-nums truncate"
                title={formatIDR(monthly.terTaxMonthly)}
              >
                {formatIDR(monthly.terTaxMonthly)}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block truncate">Masa Jan - Nov</span>
            </div>

            {/* 4. Take Home Pay */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 min-w-0">
              <span className="text-[11px] text-emerald-800 font-medium block truncate">
                Take Home Pay (THP)
              </span>
              <span
                className="text-sm sm:text-base xl:text-lg font-bold font-mono text-emerald-950 block mt-1 tabular-nums truncate"
                title={formatIDR(monthly.takeHomePay)}
              >
                {formatIDR(monthly.takeHomePay)}
              </span>
              <span className="text-[10px] text-emerald-700 mt-1 block truncate">Gaji Diterima Bersih</span>
            </div>
          </div>

          {/* Sub Navigation for View Modes */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('monthly')}
              className={`flex-1 py-1.5 px-3 rounded font-medium transition-colors text-center ${
                viewMode === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rincian Bulanan (Jan - Nov)
            </button>
            <button
              onClick={() => setViewMode('annual')}
              className={`flex-1 py-1.5 px-3 rounded font-medium transition-colors text-center ${
                viewMode === 'annual'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Masa Terakhir (Desember / Ps. 17)
            </button>
            <button
              onClick={() => setViewMode('comparison')}
              className={`flex-1 py-1.5 px-3 rounded font-medium transition-colors text-center ${
                viewMode === 'comparison'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Komparasi Gross / Nett / Gross-up
            </button>
          </div>

          {/* VIEW MODE 1: Monthly Breakdown */}
          {viewMode === 'monthly' && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Struktur Slip Gaji & Pemotongan TER Bulanan
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rincian penghasilan kotor, potongan iuran pensiun/kesehatan, dan PPh 21
                  </p>
                </div>
                <button
                  onClick={handleCopySummary}
                  className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 bg-slate-100 rounded border border-slate-200"
                >
                  {copiedSlip ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Ringkasan</span>
                    </>
                  )}
                </button>
              </div>

              {/* Data Table */}
              <div className="border border-slate-200 rounded overflow-x-auto text-xs w-full">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <tr>
                      <th className="py-2 px-3 text-left font-semibold">Komponen</th>
                      <th className="py-2 px-3 text-right font-semibold">Keterangan</th>
                      <th className="py-2 px-3 text-right font-semibold">Jumlah (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-slate-50/50 font-semibold text-slate-900">
                      <td colSpan={3} className="py-1.5 px-3">
                        A. PENGHASILAN BRUTO (GROSS)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-slate-700">Gaji Pokok</td>
                      <td className="py-2 px-3 text-right text-slate-500">Dasar Upah</td>
                      <td className="py-2 px-3 text-right font-mono font-medium tabular-nums">
                        {formatIDR(monthly.baseSalary)}
                      </td>
                    </tr>
                    {monthly.allowanceFixed > 0 && (
                      <tr>
                        <td className="py-2 px-3 text-slate-700">Tunjangan Tetap</td>
                        <td className="py-2 px-3 text-right text-slate-500">Jabatan/Keahlian</td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums">
                          {formatIDR(monthly.allowanceFixed)}
                        </td>
                      </tr>
                    )}
                    {monthly.allowanceVariable > 0 && (
                      <tr>
                        <td className="py-2 px-3 text-slate-700">Tunjangan Transport & Makan</td>
                        <td className="py-2 px-3 text-right text-slate-500">Kehadiran</td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums">
                          {formatIDR(monthly.allowanceVariable)}
                        </td>
                      </tr>
                    )}
                    {monthly.overtimeBonus > 0 && (
                      <tr>
                        <td className="py-2 px-3 text-slate-700">Lembur / Insentif Bulanan</td>
                        <td className="py-2 px-3 text-right text-slate-500">Variabel</td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums">
                          {formatIDR(monthly.overtimeBonus)}
                        </td>
                      </tr>
                    )}
                    {salaryInput.includeBPJS && (
                      <>
                        <tr>
                          <td className="py-2 px-3 text-slate-700">
                            BPJS JKK & JKM (Ditanggung Pemberi Kerja)
                          </td>
                          <td className="py-2 px-3 text-right text-slate-500">
                            0.24% JKK + 0.3% JKM
                          </td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums text-emerald-800">
                            +{formatIDR(monthly.bpjsJKK + monthly.bpjsJKM)}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-slate-700">
                            BPJS Kesehatan (Ditanggung Pemberi Kerja)
                          </td>
                          <td className="py-2 px-3 text-right text-slate-500">4% (Max Cap 12 Jt)</td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums text-emerald-800">
                            +{formatIDR(monthly.bpjsKesehatanPerusahaan)}
                          </td>
                        </tr>
                      </>
                    )}
                    <tr className="bg-slate-100 font-bold text-slate-900">
                      <td className="py-2 px-3">Total Bruto untuk Dasar TER</td>
                      <td className="py-2 px-3 text-right text-slate-500">
                        Dasar Pemotongan PP 58/2023
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums">
                        {formatIDR(monthly.grossIncome)}
                      </td>
                    </tr>

                    <tr className="bg-slate-50/50 font-semibold text-slate-900">
                      <td colSpan={3} className="py-1.5 px-3">
                        B. POTONGAN IURAN & PAJAK KARYAWAN
                      </td>
                    </tr>
                    {salaryInput.includeBPJS && (
                      <>
                        <tr>
                          <td className="py-2 px-3 text-slate-700">
                            BPJS JHT & Jaminan Pensiun (Ditanggung Karyawan)
                          </td>
                          <td className="py-2 px-3 text-right text-slate-500">
                            2% JHT + 1% JP
                          </td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums text-rose-700">
                            -{formatIDR(monthly.bpjsJHTKaryawan + monthly.bpjsJPKaryawan)}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-slate-700">
                            BPJS Kesehatan (Ditanggung Karyawan)
                          </td>
                          <td className="py-2 px-3 text-right text-slate-500">1%</td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums text-rose-700">
                            -{formatIDR(monthly.bpjsKesehatanKaryawan)}
                          </td>
                        </tr>
                      </>
                    )}
                    <tr className="bg-rose-50/60 font-semibold text-rose-900">
                      <td className="py-2 px-3">
                        Potongan PPh 21 TER ({terCategory}) · {formatPercent(monthly.terRate)}
                      </td>
                      <td className="py-2 px-3 text-right text-rose-700">
                        {salaryInput.method === 'gross'
                          ? 'Dipotong dari gaji'
                          : salaryInput.method === 'gross_up'
                          ? 'Ditunjang Gross-Up'
                          : 'Ditanggung Perusahaan'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold tabular-nums text-rose-700">
                        {salaryInput.method === 'gross'
                          ? `-${formatIDR(monthly.terTaxMonthly)}`
                          : formatIDR(monthly.terTaxMonthly)}
                      </td>
                    </tr>

                    <tr className="bg-emerald-100/70 font-bold text-emerald-950 text-sm">
                      <td className="py-2.5 px-3">GAJI BERSIH (TAKE HOME PAY)</td>
                      <td className="py-2.5 px-3 text-right text-emerald-800 text-xs font-normal">
                        Diterima Karyawan
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                        {formatIDR(monthly.takeHomePay)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Formula Callout */}
              <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-700 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900">
                    Dasar Ketentuan Tarif Efektif Rata-Rata (TER)
                  </div>
                  <p className="mt-0.5 text-slate-600 leading-relaxed">
                    PPh 21 bulanan dihitung dengan rumus:{' '}
                    <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-mono text-[11px] text-slate-900">
                      Penghasilan Bruto × Tarif TER
                    </code>
                    . Untuk status <strong>{salaryInput.statusPTKP}</strong> masuk ke{' '}
                    <strong>Kategori {terCategory}</strong> dengan penghasilan bruto{' '}
                    <strong>{formatIDR(monthly.grossIncome)}</strong>, tarif TER yang berlaku adalah{' '}
                    <strong>{formatPercent(monthly.terRate)}</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: Annual & December Reconciliation */}
          {viewMode === 'annual' && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900">
                  Rekonsiliasi Masa Pajak Terakhir (Desember / Tahunan)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mekanisme penyesuaian PPh 21 menggunakan tarif progresif Pasal 17 ayat (1) huruf a UU HPP
                </p>
              </div>

              {/* Explanatory Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="border border-slate-200 rounded p-3 bg-slate-50">
                  <span className="text-slate-500 block">Total PPh 21 Terutang Setahun</span>
                  <span className="text-base font-bold font-mono text-slate-900 block mt-1 tabular-nums">
                    {formatIDR(annual.totalTaxAnnual)}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">Tarif Progresif Ps. 17</span>
                </div>
                <div className="border border-slate-200 rounded p-3 bg-slate-50">
                  <span className="text-slate-500 block">PPh 21 Terpotong Jan–Nov</span>
                  <span className="text-base font-bold font-mono text-slate-700 block mt-1 tabular-nums">
                    {formatIDR(annual.taxPaidJanToNov)}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">11 Bulan via TER</span>
                </div>
                <div className="border border-emerald-300 rounded p-3 bg-emerald-50">
                  <span className="text-emerald-800 font-semibold block">
                    PPh 21 Masa Desember
                  </span>
                  <span className="text-base font-bold font-mono text-emerald-950 block mt-1 tabular-nums">
                    {formatIDR(annual.taxDecember)}
                  </span>
                  <span className="text-[10px] text-emerald-700 mt-1 block">
                    {annual.taxDecemberUnderpayment
                      ? 'Dipotong di gaji Desember'
                      : 'Kelebihan potong dikembalikan'}
                  </span>
                </div>
              </div>

              {/* Annual Calculation Table */}
              <div className="border border-slate-200 rounded overflow-x-auto text-xs w-full">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <tr>
                      <th className="py-2 px-3 text-left font-semibold">Komponen Perhitungan Setahun</th>
                      <th className="py-2 px-3 text-right font-semibold">Regulasi</th>
                      <th className="py-2 px-3 text-right font-semibold">Nilai (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2 px-3 text-slate-700">Penghasilan Bruto 1 Tahun + THR/Bonus</td>
                      <td className="py-2 px-3 text-right text-slate-500">12 Bulan</td>
                      <td className="py-2 px-3 text-right font-mono font-medium tabular-nums">
                        {formatIDR(annual.annualGrossIncome)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-slate-700">Biaya Jabatan (5% dari Bruto)</td>
                      <td className="py-2 px-3 text-right text-slate-500">Maks. Rp 6.000.000/thn</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-rose-700">
                        -{formatIDR(annual.annualBiayaJabatan)}
                      </td>
                    </tr>
                    {annual.annualPensionDeductions > 0 && (
                      <tr>
                        <td className="py-2 px-3 text-slate-700">Iuran Pensiun / JHT Setahun</td>
                        <td className="py-2 px-3 text-right text-slate-500">JHT 2% + JP 1%</td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums text-rose-700">
                          -{formatIDR(annual.annualPensionDeductions)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-slate-50 font-semibold text-slate-900">
                      <td className="py-2 px-3">Penghasilan Neto Setahun</td>
                      <td className="py-2 px-3 text-right text-slate-500">Bruto - Pengurang</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums">
                        {formatIDR(annual.annualNetIncome)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-slate-700">
                        PTKP ({annual.statusPTKP})
                      </td>
                      <td className="py-2 px-3 text-right text-slate-500">Bebas Pajak</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-rose-700">
                        -{formatIDR(annual.ptkpAmount)}
                      </td>
                    </tr>
                    <tr className="bg-slate-100 font-bold text-slate-900">
                      <td className="py-2 px-3">Penghasilan Kena Pajak (PKP)</td>
                      <td className="py-2 px-3 text-right text-slate-500">Dibulatkan ke ribuan penuh</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums">
                        {formatIDR(annual.pkp)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Progressive Tax Tier Breakdown */}
              <div>
                <div className="font-semibold text-xs text-slate-900 mb-2">
                  Rincian Lapisan Tarif Progresif Pasal 17 ayat (1) huruf a UU HPP:
                </div>
                <div className="space-y-1.5 text-xs">
                  {annual.breakdownPasal17.map((tier, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-600" />
                        <span className="font-medium text-slate-800">{tier.label}</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-slate-500 mr-3">
                          DPP: {formatIDR(tier.taxableInBracket)}
                        </span>
                        <span className="font-bold text-slate-900 tabular-nums">
                          {formatIDR(tier.taxAmount)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {annual.breakdownPasal17.length === 0 && (
                    <div className="p-3 text-center text-slate-500 bg-slate-50 border border-slate-200 rounded">
                      Penghasilan Neto berada di bawah PTKP. Tidak ada pajak terutang (Rp 0).
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 3: Comparison of Methods */}
          {viewMode === 'comparison' && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900">
                  Perbandingan Kebijakan Penggajian: Gross vs Nett vs Gross-Up
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Analisis perbandingan biaya perusahaan (Company Cost) vs penghasilan bersih diterima karyawan
                </p>
              </div>

              {/* 3 Columns Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Method Gross */}
                <div
                  className={`p-4 rounded-lg border ${
                    salaryInput.method === 'gross'
                      ? 'border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">Metode Gross</span>
                    {salaryInput.method === 'gross' && (
                      <span className="text-[10px] bg-emerald-600 text-white font-medium px-2 py-0.5 rounded">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Karyawan menanggung sendiri PPh 21 yang dipotong langsung dari gaji bulanan.
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Beban Pajak Karyawan:</span>
                      <span className="font-mono font-bold text-rose-600">
                        {formatIDR(monthly.terTaxMonthly)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Take Home Pay:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatIDR(monthly.takeHomePay)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Biaya Penggajian PT:</span>
                      <span className="font-mono text-slate-700">
                        {formatIDR(monthly.grossIncome)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Method Nett */}
                <div
                  className={`p-4 rounded-lg border ${
                    salaryInput.method === 'nett'
                      ? 'border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">Metode Nett</span>
                    {salaryInput.method === 'nett' && (
                      <span className="text-[10px] bg-emerald-600 text-white font-medium px-2 py-0.5 rounded">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Perusahaan menanggung PPh 21 tanpa tunjangan pajak (non-deductible expense secara fiskal).
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Beban Pajak Karyawan:</span>
                      <span className="font-mono text-slate-700">Rp 0 (Ditanggung PT)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Take Home Pay:</span>
                      <span className="font-mono font-bold text-emerald-800">
                        {formatIDR(
                          salaryInput.baseSalary +
                            salaryInput.allowanceFixed +
                            salaryInput.allowanceVariable -
                            monthly.totalPengurang
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Pengeluaran PT:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatIDR(monthly.grossIncome + monthly.terTaxMonthly)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Method Gross-Up */}
                <div
                  className={`p-4 rounded-lg border ${
                    salaryInput.method === 'gross_up'
                      ? 'border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">Metode Gross-Up</span>
                    {salaryInput.method === 'gross_up' && (
                      <span className="text-[10px] bg-emerald-600 text-white font-medium px-2 py-0.5 rounded">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Diberikan tunjangan pajak yang tepat sehingga dapat dibiayakan secara fiskal (deductible).
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tunjangan PPh 21:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        +{formatIDR(monthly.taxAllowance)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Take Home Pay:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatIDR(monthly.takeHomePay)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Biaya PT:</span>
                      <span className="font-mono text-slate-700">
                        {formatIDR(monthly.grossIncome + monthly.taxAllowance)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
