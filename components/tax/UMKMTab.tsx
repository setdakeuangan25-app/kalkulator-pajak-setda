'use client';

import React, { useState } from 'react';
import {
  calculateUMKMTax,
  formatIDR,
  formatPercent,
} from '@/lib/tax/tax-calculator';
import {
  UMKM_FINAL_RATE,
  UMKM_OP_TAX_EXEMPT_LIMIT,
} from '@/lib/tax/tax-rates';
import {
  Store,
  Info,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const UMKMTab: React.FC = () => {
  const [taxpayerType, setTaxpayerType] = useState<'orang_pribadi' | 'badan'>(
    'orang_pribadi'
  );

  // 12 months turnovers, default with realistic business turnover ~ Rp 60.000.000 / month
  const [monthlyTurnovers, setMonthlyTurnovers] = useState<number[]>([
    50_000_000, 55_000_000, 60_000_000, 65_000_000, 70_000_000, 75_000_000,
    60_000_000, 65_000_000, 70_000_000, 80_000_000, 85_000_000, 95_000_000,
  ]);

  const [bulkMonthlyValue, setBulkMonthlyValue] = useState<number>(65_000_000);

  const result = calculateUMKMTax({
    taxpayerType,
    monthlyTurnovers,
  });

  const handleMonthChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    const num = clean === '' ? 0 : parseInt(clean, 10);
    const updated = [...monthlyTurnovers];
    updated[index] = num;
    setMonthlyTurnovers(updated);
  };

  const applyBulkAverage = () => {
    setMonthlyTurnovers(new Array(12).fill(bulkMonthlyValue));
  };

  const exemptUsedTotal =
    taxpayerType === 'orang_pribadi'
      ? Math.min(result.totalTurnover, UMKM_OP_TAX_EXEMPT_LIMIT)
      : 0;
  const exemptPercentage = Math.min(
    100,
    (result.totalTurnover / UMKM_OP_TAX_EXEMPT_LIMIT) * 100
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 rounded-lg p-4 sm:p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <span className="text-xs font-semibold text-emerald-400">
            REGULASI PP NOMOR 55 TAHUN 2022 & UU HPP
          </span>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
            Kalkulator PPh Final UMKM 0,5%
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Untuk Usaha Mikro, Kecil, dan Menengah (peredaran bruto tidak melebihi Rp 4,8 Miliar setahun).
            Khusus Wajib Pajak Orang Pribadi, omzet hingga <strong>Rp 500 Juta per tahun BEBAS PAJAK</strong>.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls & Metrics */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">
              Jenis Wajib Pajak & Fasilitas
            </h3>

            {/* Type selector */}
            <div className="space-y-2 text-xs">
              <label className="font-semibold text-slate-700 block">
                Bentuk Usaha / Wajib Pajak
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTaxpayerType('orang_pribadi')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    taxpayerType === 'orang_pribadi'
                      ? 'border-emerald-600 bg-emerald-50/50 text-slate-900 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="font-bold text-xs">Orang Pribadi</div>
                  <div className="text-[10px] text-emerald-800 mt-0.5 font-medium">
                    Bebas pajak s.d. Rp 500 Juta
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTaxpayerType('badan')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    taxpayerType === 'badan'
                      ? 'border-emerald-600 bg-emerald-50/50 text-slate-900 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="font-bold text-xs">Badan (PT / CV / Firma)</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Tarif 0,5% dari bulan pertama
                  </div>
                </button>
              </div>
            </div>

            {/* Bulk Setup Omzet */}
            <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
              <label className="font-semibold text-slate-700 block">
                Isi Otomatis Rata-Rata Omzet Bulanan
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2 text-slate-400 font-mono text-xs">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={bulkMonthlyValue === 0 ? '' : bulkMonthlyValue.toLocaleString('id-ID')}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '');
                      setBulkMonthlyValue(clean === '' ? 0 : parseInt(clean, 10));
                    }}
                    placeholder="0"
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:border-emerald-600 outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={applyBulkAverage}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium text-xs border border-slate-300 flex items-center gap-1 shrink-0"
                >
                  <RefreshCw className="w-3 h-3" />
                  Terapkan ke 12 Bulan
                </button>
              </div>
              <span className="text-[10px] text-slate-500 block">
                Atau ubah nominal masing-masing bulan langsung pada tabel di sebelah kanan.
              </span>
            </div>
          </div>

          {/* Visual Progress Bar (Batas Rp 500 Juta Bebas Pajak) */}
          {taxpayerType === 'orang_pribadi' && (
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">
                  Status Batas Rp 500 Jt Bebas Pajak
                </span>
                <span className="font-mono text-emerald-800 font-semibold">
                  {formatIDR(exemptUsedTotal)} / Rp 500.000.000
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div
                  className={`h-full transition-all duration-300 ${
                    result.totalTurnover >= UMKM_OP_TAX_EXEMPT_LIMIT
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  }`}
                  style={{ width: `${exemptPercentage}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <span>
                  Sisa Fasilitas Bebas Pajak:{' '}
                  <strong className="text-slate-800 font-mono">
                    {formatIDR(result.taxExemptRemaining)}
                  </strong>
                </span>
                <span>{exemptPercentage.toFixed(1)}% Terpakai</span>
              </div>

              {result.totalTurnover >= UMKM_OP_TAX_EXEMPT_LIMIT ? (
                <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded p-2 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    Akumulasi omzet telah melampaui batas Rp 500 Juta. Omzet selebihnya dipotong
                    tarif PPh Final 0,5%.
                  </span>
                </div>
              ) : (
                <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded p-2 flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
                  <span>
                    Seluruh omzet tahun ini masih berada dalam batas bebas pajak PP 55/2022. Pajak terutang = Rp 0!
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Quick Summary KPIs */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white border border-slate-200 rounded-lg p-3.5">
              <span className="text-slate-500 block">Total Omzet Setahun</span>
              <span className="text-base font-bold font-mono text-slate-900 block mt-1 tabular-nums">
                {formatIDR(result.totalTurnover)}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">12 Bulan Penjualan</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5">
              <span className="text-slate-500 block">Omzet Kena Pajak (DPP)</span>
              <span className="text-base font-bold font-mono text-slate-800 block mt-1 tabular-nums">
                {formatIDR(result.totalTaxableTurnover)}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Dikenakan 0,5%</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 col-span-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-emerald-800 font-semibold block">
                    Total PPh Final 0,5% Terutang Setahun
                  </span>
                  <span className="text-xs text-emerald-700 mt-0.5 block">
                    Disetorkan setiap tanggal 15 bulan berikutnya
                  </span>
                </div>
                <span className="text-lg sm:text-xl font-bold font-mono text-emerald-950 tabular-nums">
                  {formatIDR(result.totalTaxDue)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 12-Month Detailed Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">
              Jadwal Setoran Pajak Bulanan (Januari - Desember)
            </h4>
            <span className="text-xs font-mono text-slate-500">Tarif: 0,5% Final</span>
          </div>

          <div className="border border-slate-200 rounded text-xs max-h-[500px] overflow-y-auto overflow-x-auto w-full">
            <table className="w-full min-w-[500px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 sticky top-0 z-10">
                <tr>
                  <th className="py-2 px-3 text-left font-semibold">Bulan</th>
                  <th className="py-2 px-3 text-right font-semibold">Omzet Bruto (Rp)</th>
                  <th className="py-2 px-3 text-right font-semibold">Kumulatif</th>
                  <th className="py-2 px-3 text-right font-semibold">Kena Pajak</th>
                  <th className="py-2 px-3 text-right font-semibold">PPh Final (0,5%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.monthlyDetails.map((item, idx) => (
                  <tr key={item.month} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2 px-3 font-medium text-slate-800">
                      {item.monthName}
                    </td>
                    <td className="py-1 px-3 text-right">
                      <input
                        type="text"
                        value={item.turnover === 0 ? '' : item.turnover.toLocaleString('id-ID')}
                        onChange={(e) => handleMonthChange(idx, e.target.value)}
                        placeholder="0"
                        className="w-28 text-right py-1 px-2 border border-slate-200 rounded font-mono text-xs focus:border-emerald-600 outline-none"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-500 tabular-nums">
                      {formatIDR(item.cumulativeTurnover)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-700">
                      {formatIDR(item.taxableTurnover)}
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-mono font-bold tabular-nums ${
                        item.taxDue > 0 ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      {item.taxDue > 0 ? formatIDR(item.taxDue) : 'Rp 0 (Bebas)'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                  <td className="py-2.5 px-3">TOTAL 1 TAHUN</td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                    {formatIDR(result.totalTurnover)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-500">-</td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                    {formatIDR(result.totalTaxableTurnover)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-600 tabular-nums">
                    {formatIDR(result.totalTaxDue)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-700 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Jangka Waktu Berlakunya PPh Final UMKM:</strong> Sesuai PP 55/2022, skema 0,5%
              dapat dimanfaatkan paling lama <strong>7 tahun</strong> untuk Wajib Pajak Orang Pribadi,{' '}
              <strong>4 tahun</strong> untuk Koperasi, CV, atau Firma, dan <strong>3 tahun</strong> untuk
              Perseroan Terbatas (PT). Setelah batas waktu terlewati, WP beralih ke pembukuan dengan tarif umum Pasal 17.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
