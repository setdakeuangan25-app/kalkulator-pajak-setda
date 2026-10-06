'use client';

import React, { useState } from 'react';
import {
  calculateCorporateTax,
  formatIDR,
  formatPercent,
} from '@/lib/tax/tax-calculator';
import {
  Building2,
  TrendingDown,
  Info,
  CheckCircle2,
  Percent,
} from 'lucide-react';

export const PPhBadanTab: React.FC = () => {
  const [grossRevenue, setGrossRevenue] = useState<number>(3_800_000_000); // 3.8 Miliar
  const [taxableProfit, setTaxableProfit] = useState<number>(450_000_000); // Laba Fiskal 450 Jt
  const [usePasal31E, setUsePasal31E] = useState<boolean>(true);

  const result = calculateCorporateTax({
    grossRevenue,
    taxableProfit,
    usePasal31E,
  });

  const handleRevenueChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setGrossRevenue(clean === '' ? 0 : parseInt(clean, 10));
  };

  const handleProfitChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setTaxableProfit(clean === '' ? 0 : parseInt(clean, 10));
  };

  const normalTaxWithoutFacility = taxableProfit * 0.22;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 rounded-lg p-4 sm:p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <span className="text-xs font-semibold text-emerald-400">
            UU HPP NOMOR 7 TAHUN 2021 & PASAL 31E UU PPH
          </span>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
            Kalkulator PPh Badan & Fasilitas Pasal 31E
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Tarif umum PPh Badan adalah 22%. Perusahaan dengan omzet di bawah Rp 50 Miliar berhak mendapatkan
            fasilitas pengurangan tarif 50% (tarif efektif 11%) untuk omzet s.d. Rp 4,8 Miliar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Input Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">
            Parameter Keuangan Badan Usaha (PT / CV)
          </h3>

          <div className="space-y-4 text-xs">
            {/* Peredaran Bruto (Omzet) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">
                  Peredaran Bruto / Omzet Setahun
                </label>
                <span className="font-mono text-emerald-700 font-medium">
                  {formatIDR(grossRevenue)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">
                  Rp
                </span>
                <input
                  type="text"
                  value={grossRevenue === 0 ? '' : grossRevenue.toLocaleString('id-ID')}
                  onChange={(e) => handleRevenueChange(e.target.value)}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-slate-300 rounded focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[
                  { label: 'Rp 2 M', val: 2_000_000_000 },
                  { label: 'Rp 4,5 M', val: 4_500_000_000 },
                  { label: 'Rp 10 M', val: 10_000_000_000 },
                  { label: 'Rp 60 M', val: 60_000_000_000 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setGrossRevenue(preset.val)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-mono transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Penghasilan Kena Pajak / Laba Fiskal */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">
                  Penghasilan Kena Pajak (Laba Bersih Fiskal)
                </label>
                <span className="font-mono text-emerald-700 font-medium">
                  {formatIDR(taxableProfit)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">
                  Rp
                </span>
                <input
                  type="text"
                  value={taxableProfit === 0 ? '' : taxableProfit.toLocaleString('id-ID')}
                  onChange={(e) => handleProfitChange(e.target.value)}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-slate-300 rounded focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Laba komersial setelah koreksi fiskal positif & negatif
              </span>
            </div>

            {/* Toggle Fasilitas 31E */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">
                  Gunakan Fasilitas Pengurangan Tarif (Pasal 31E)
                </div>
                <div className="text-[11px] text-slate-500">
                  Diskon 50% tarif untuk omzet s.d. Rp 4,8 Miliar
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUsePasal31E(!usePasal31E)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  usePasal31E ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                    usePasal31E ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-4">
          {/* Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-lg p-3.5">
              <span className="text-[11px] text-slate-500 block">Status Kategori</span>
              <span className="text-xs font-bold text-slate-900 block mt-1 line-clamp-2">
                {result.category === 'under_4_8b'
                  ? 'Fasilitas 50% Penuh'
                  : result.category === 'between_4_8b_50b'
                  ? 'Fasilitas Proporsional'
                  : 'Tarif Normal (22%)'}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">Pasal 31E UU PPh</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5">
              <span className="text-[11px] text-slate-500 block">Tarif Efektif</span>
              <span className="text-base sm:text-lg font-bold font-mono text-slate-900 block mt-1 tabular-nums">
                {formatPercent(result.effectiveTaxRate)}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                vs Tarif Normal 22%
              </span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5">
              <span className="text-[11px] text-emerald-800 font-medium block">
                Penghematan Pajak
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-emerald-700 block mt-1 tabular-nums">
                {formatIDR(result.taxSaving)}
              </span>
              <span className="text-[10px] text-emerald-700 mt-1 block">Fasilitas Negara</span>
            </div>

            <div className="bg-slate-900 text-white rounded-lg p-3.5">
              <span className="text-[11px] text-slate-300 block">Total PPh Badan</span>
              <span className="text-base sm:text-lg font-bold font-mono text-emerald-400 block mt-1 tabular-nums">
                {formatIDR(result.totalTax)}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">PPh Terutang (SPT 1771)</span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Rincian Perhitungan Pajak Penghasilan Badan Usaha
            </h4>

            <div className="border border-slate-200 rounded overflow-x-auto text-xs w-full">
              <table className="w-full min-w-[500px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <tr>
                    <th className="py-2 px-3 text-left font-semibold">Komponen</th>
                    <th className="py-2 px-3 text-right font-semibold">Tarif</th>
                    <th className="py-2 px-3 text-right font-semibold">Dasar Pengenaan (PKP)</th>
                    <th className="py-2 px-3 text-right font-semibold">Pajak Terutang (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.facilityPKP > 0 && (
                    <tr>
                      <td className="py-2 px-3 text-slate-700 font-medium">
                        PKP Mendapat Fasilitas Pasal 31E
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-700 font-semibold">
                        11% (50% × 22%)
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums">
                        {formatIDR(result.facilityPKP)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-medium tabular-nums text-slate-900">
                        {formatIDR(result.taxFromFacility)}
                      </td>
                    </tr>
                  )}
                  {result.nonFacilityPKP > 0 && (
                    <tr>
                      <td className="py-2 px-3 text-slate-700 font-medium">
                        PKP Tidak Mendapat Fasilitas
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">
                        22% (Normal)
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums">
                        {formatIDR(result.nonFacilityPKP)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-medium tabular-nums text-slate-900">
                        {formatIDR(result.taxFromNonFacility)}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-slate-100 font-bold text-slate-900">
                    <td className="py-2.5 px-3">TOTAL PPH BADAN TERUTANG</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-800">
                      {formatPercent(result.effectiveTaxRate)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {formatIDR(taxableProfit)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-base tabular-nums">
                      {formatIDR(result.totalTax)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Comparison Callout */}
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-700 space-y-1.5">
              <div className="flex justify-between items-center text-slate-600">
                <span>Pajak jika tanpa fasilitas (Tarif normal 22%):</span>
                <span className="font-mono text-slate-800 font-medium">
                  {formatIDR(normalTaxWithoutFacility)}
                </span>
              </div>
              <div className="flex justify-between items-center text-emerald-700 font-semibold">
                <span>Total Penghematan dari Fasilitas Pasal 31E:</span>
                <span className="font-mono">-{formatIDR(result.taxSaving)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
