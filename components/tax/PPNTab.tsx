'use client';

import React, { useState } from 'react';
import {
  calculateVAT,
  calculatePPh23,
  calculatePPhFinal42,
  formatIDR,
  formatPercent,
} from '@/lib/tax/tax-calculator';
import {
  Receipt,
  FileText,
  Calculator,
  Info,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const PPNTab: React.FC = () => {
  // PPN state
  const [vatAmount, setVatAmount] = useState<number>(50_000_000);
  const [vatPriceType, setVatPriceType] = useState<'exclude' | 'include'>('exclude');
  const [vatRatePercent, setVatRatePercent] = useState<number>(11);

  // PPh 23 state
  const [pph23Amount, setPph23Amount] = useState<number>(25_000_000);
  const [pph23Category, setPph23Category] = useState<'jasa_sewa' | 'royalti_dividen'>('jasa_sewa');
  const [pph23HasNPWP, setPph23HasNPWP] = useState<boolean>(true);

  // PPh 4(2) state
  const [pph42Amount, setPph42Amount] = useState<number>(60_000_000);
  const [pph42Type, setPph42Type] = useState<
    'sewa_tanah_bangunan' | 'pengalihan_tanah_bangunan' | 'bunga_deposito'
  >('sewa_tanah_bangunan');

  const vatResult = calculateVAT({
    amount: vatAmount,
    priceType: vatPriceType,
    ratePercent: vatRatePercent,
  });

  const pph23Result = calculatePPh23(pph23Amount, pph23Category, pph23HasNPWP);
  const pph42Result = calculatePPhFinal42(pph42Amount, pph42Type);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 rounded-lg p-4 sm:p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <span className="text-xs font-semibold text-emerald-400">
            UU HARMONISASI PERATURAN PERPAJAKAN (UU HPP)
          </span>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
            Kalkulator PPN (11% / 12%), PPh 23 & PPh Final Pasal 4(2)
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Perhitungan pajak atas transaksi barang dan jasa, faktur pajak PPN, pemotongan PPh 23 atas jasa dan sewa,
            serta PPh Final atas sewa properti/tanah dan bunga deposito.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SECTION 1: PPN Calculator */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-xs">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-emerald-700" />
              Pajak Pertambahan Nilai (PPN)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Faktur transaksi BKP & JKP (Tarif 11% / 12%)
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Nilai Transaksi */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Nilai Transaksi</label>
                <span className="font-mono text-emerald-700 font-medium">
                  {formatIDR(vatAmount)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-mono text-xs">
                  Rp
                </span>
                <input
                  type="text"
                  value={vatAmount === 0 ? '' : vatAmount.toLocaleString('id-ID')}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '');
                    setVatAmount(clean === '' ? 0 : parseInt(clean, 10));
                  }}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-1.5 text-xs font-mono border border-slate-300 rounded focus:border-emerald-600 outline-none"
                />
              </div>
            </div>

            {/* Metode Include vs Exclude */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Status Harga
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVatPriceType('exclude')}
                  className={`py-1.5 px-2 rounded border text-center font-medium transition-all ${
                    vatPriceType === 'exclude'
                      ? 'border-emerald-600 bg-emerald-50 text-slate-900 font-bold'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Belum Termasuk (Exclude)
                </button>
                <button
                  type="button"
                  onClick={() => setVatPriceType('include')}
                  className={`py-1.5 px-2 rounded border text-center font-medium transition-all ${
                    vatPriceType === 'include'
                      ? 'border-emerald-600 bg-emerald-50 text-slate-900 font-bold'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  Sudah Termasuk (Include)
                </button>
              </div>
            </div>

            {/* Tarif PPN (11% vs 12%) */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Tarif PPN
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVatRatePercent(11)}
                  className={`py-1.5 px-2 rounded border text-center font-medium transition-all ${
                    vatRatePercent === 11
                      ? 'border-emerald-600 bg-emerald-50 text-slate-900 font-bold'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  11% (Tarif Saat Ini)
                </button>
                <button
                  type="button"
                  onClick={() => setVatRatePercent(12)}
                  className={`py-1.5 px-2 rounded border text-center font-medium transition-all ${
                    vatRatePercent === 12
                      ? 'border-emerald-600 bg-emerald-50 text-slate-900 font-bold'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  12% (Simulasi UU HPP)
                </button>
              </div>
            </div>

            {/* Hasil PPN */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Dasar Pengenaan Pajak (DPP):</span>
                <span className="font-mono font-medium text-slate-900">
                  {formatIDR(vatResult.dpp)}
                </span>
              </div>
              <div className="flex justify-between py-1 bg-emerald-50 px-2 rounded text-emerald-900">
                <span className="font-medium">PPN Terutang ({vatRatePercent}%):</span>
                <span className="font-mono font-bold">
                  {formatIDR(vatResult.vatAmount)}
                </span>
              </div>
              <div className="flex justify-between py-1 font-bold text-slate-900 border-t border-slate-100">
                <span>Total Nilai Transaksi:</span>
                <span className="font-mono">{formatIDR(vatResult.totalWithVAT)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: PPh 23 Calculator */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-xs">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-700" />
              PPh Pasal 23 (Jasa & Sewa)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Pemotongan pajak atas imbalan jasa badan usaha & sewa
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Nilai Transaksi PPh 23 */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Nilai Bruto Transaksi</label>
                <span className="font-mono text-emerald-700 font-medium">
                  {formatIDR(pph23Amount)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-mono text-xs">
                  Rp
                </span>
                <input
                  type="text"
                  value={pph23Amount === 0 ? '' : pph23Amount.toLocaleString('id-ID')}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '');
                    setPph23Amount(clean === '' ? 0 : parseInt(clean, 10));
                  }}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-1.5 text-xs font-mono border border-slate-300 rounded focus:border-emerald-600 outline-none"
                />
              </div>
            </div>

            {/* Kategori Objek PPh 23 */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Objek Pemotongan PPh 23
              </label>
              <select
                value={pph23Category}
                onChange={(e) =>
                  setPph23Category(e.target.value as 'jasa_sewa' | 'royalti_dividen')
                }
                className="w-full py-1.5 px-2.5 text-xs border border-slate-300 rounded bg-white text-slate-800 focus:border-emerald-600 outline-none"
              >
                <option value="jasa_sewa">Jasa Teknik, Manajemen, Konsultan, Sewa Alat (2%)</option>
                <option value="royalti_dividen">Royalti, Hadiah, Dividen Badan DN (15%)</option>
              </select>
            </div>

            {/* NPWP Status */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="font-medium text-slate-700">Penyedia Memiliki NPWP</span>
                <span className="text-[10px] text-slate-400 block">Non-NPWP tarif 2x lipat (100% lebih tinggi)</span>
              </div>
              <button
                type="button"
                onClick={() => setPph23HasNPWP(!pph23HasNPWP)}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  pph23HasNPWP ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                    pph23HasNPWP ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Hasil PPh 23 */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Tarif Pemotongan:</span>
                <span className="font-mono font-medium text-slate-900">
                  {formatPercent(pph23Result.taxRate)}
                </span>
              </div>
              <div className="flex justify-between py-1 bg-rose-50 px-2 rounded text-rose-900">
                <span className="font-medium">PPh 23 Dipotong:</span>
                <span className="font-mono font-bold">
                  -{formatIDR(pph23Result.taxAmount)}
                </span>
              </div>
              <div className="flex justify-between py-1 font-bold text-emerald-900 border-t border-slate-100">
                <span>Bersih Diterima Vendor:</span>
                <span className="font-mono">{formatIDR(pph23Result.netPayment)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: PPh Final 4(2) Calculator */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-xs">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-emerald-700" />
              PPh Final Pasal 4 ayat (2)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Sewa properti/tanah, pengalihan hak, bunga deposito
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Nilai Transaksi */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Nilai Transaksi Bruto</label>
                <span className="font-mono text-emerald-700 font-medium">
                  {formatIDR(pph42Amount)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-mono text-xs">
                  Rp
                </span>
                <input
                  type="text"
                  value={pph42Amount === 0 ? '' : pph42Amount.toLocaleString('id-ID')}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '');
                    setPph42Amount(clean === '' ? 0 : parseInt(clean, 10));
                  }}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-1.5 text-xs font-mono border border-slate-300 rounded focus:border-emerald-600 outline-none"
                />
              </div>
            </div>

            {/* Objek PPh Final 4(2) */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Kategori Objek PPh Final
              </label>
              <select
                value={pph42Type}
                onChange={(e) =>
                  setPph42Type(
                    e.target.value as
                      | 'sewa_tanah_bangunan'
                      | 'pengalihan_tanah_bangunan'
                      | 'bunga_deposito'
                  )
                }
                className="w-full py-1.5 px-2.5 text-xs border border-slate-300 rounded bg-white text-slate-800 focus:border-emerald-600 outline-none"
              >
                <option value="sewa_tanah_bangunan">Sewa Tanah dan/atau Bangunan (10%)</option>
                <option value="pengalihan_tanah_bangunan">Pengalihan Hak Tanah/Bangunan (2,5%)</option>
                <option value="bunga_deposito">Bunga Deposito / Tabungan Bank (20%)</option>
              </select>
            </div>

            {/* Hasil PPh Final 4(2) */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Tarif PPh Final:</span>
                <span className="font-mono font-medium text-slate-900">
                  {formatPercent(pph42Result.taxRate)}
                </span>
              </div>
              <div className="flex justify-between py-1 bg-rose-50 px-2 rounded text-rose-900">
                <span className="font-medium">PPh Final Terutang:</span>
                <span className="font-mono font-bold">
                  -{formatIDR(pph42Result.taxAmount)}
                </span>
              </div>
              <div className="flex justify-between py-1 font-bold text-emerald-900 border-t border-slate-100">
                <span>Bersih Setelah Pajak:</span>
                <span className="font-mono">{formatIDR(pph42Result.netPayment)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
