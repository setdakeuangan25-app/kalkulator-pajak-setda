'use client';

import React, { useState } from 'react';
import {
  calculateNonEmployeeTax,
  formatIDR,
  formatPercent,
} from '@/lib/tax/tax-calculator';
import {
  Info,
  UserCheck,
  Briefcase,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const PPh21FreelancerTab: React.FC = () => {
  const [grossFee, setGrossFee] = useState<number>(35_000_000);
  const [cumulativeGrossPrevious, setCumulativeGrossPrevious] = useState<number>(0);
  const [hasNPWP, setHasNPWP] = useState<boolean>(true);
  const [professionName, setProfessionName] = useState<string>('Konsultan Teknologi Informasi');

  const result = calculateNonEmployeeTax({
    grossFee,
    isContinuous: true,
    cumulativeGrossPrevious,
    hasNPWP,
  });

  const netPayment = Math.max(0, grossFee - result.taxAmount);

  const handleGrossChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setGrossFee(clean === '' ? 0 : parseInt(clean, 10));
  };

  const handlePrevChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setCumulativeGrossPrevious(clean === '' ? 0 : parseInt(clean, 10));
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 rounded-lg p-4 sm:p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <span className="text-xs font-semibold text-emerald-400">
            REGULASI PMK NOMOR 168 TAHUN 2023
          </span>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
            Kalkulator PPh 21 Bukan Pegawai / Freelancer / Tenaga Ahli
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Berlaku bagi Dokter, Pengacara, Notaris, Konsultan, Akuntan, Programmer, Desainer, Arsitek,
            dan profesi pekerja bebas lainnya. Dasar Pengenaan Pajak (DPP) adalah 50% dari Penghasilan Bruto.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Input Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">
            Parameter Honorarium / Imbalan Jasa
          </h3>

          <div className="space-y-4 text-xs">
            {/* Profesi */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Kategori Pekerjaan / Jasa Keahlian
              </label>
              <select
                value={professionName}
                onChange={(e) => setProfessionName(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-slate-300 rounded bg-white text-slate-800 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
              >
                <option value="Konsultan Teknologi Informasi">Konsultan IT / Software Engineer</option>
                <option value="Dokter Praktik Mandiri">Dokter / Tenaga Medis</option>
                <option value="Pengacara & Konsultan Hukum">Pengacara / Advokat / Notaris</option>
                <option value="Akuntan & Konsultan Pajak">Akuntan / Auditor / Konsultan Pajak</option>
                <option value="Desainer & Arsitek">Desainer Grafis / Arsitek / Kreator Konten</option>
                <option value="Penerjemah & Pengajar">Penerjemah / Penulis / Tutor Lepas</option>
                <option value="Pekerja Bebas Lainnya">Bukan Pegawai Lainnya</option>
              </select>
            </div>

            {/* Imbalan Bruto Invoice Ini */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">
                  Imbalan Bruto Tagihan Ini (Fee)
                </label>
                <span className="font-mono text-emerald-700 font-medium">
                  {formatIDR(grossFee)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">
                  Rp
                </span>
                <input
                  type="text"
                  value={grossFee === 0 ? '' : grossFee.toLocaleString('id-ID')}
                  onChange={(e) => handleGrossChange(e.target.value)}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-slate-300 rounded focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                />
              </div>
            </div>

            {/* Akumulasi Bruto Sebelumnya */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">
                  Akumulasi Imbalan Bruto Sebelumnya di Tahun yang Sama
                </label>
                <span className="font-mono text-slate-600">
                  {formatIDR(cumulativeGrossPrevious)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">
                  Rp
                </span>
                <input
                  type="text"
                  value={
                    cumulativeGrossPrevious === 0
                      ? ''
                      : cumulativeGrossPrevious.toLocaleString('id-ID')
                  }
                  onChange={(e) => handlePrevChange(e.target.value)}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-slate-300 rounded focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Jika ini pembayaran pertama dalam tahun pajak, biarkan Rp 0.
              </span>
            </div>

            {/* Status NPWP */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">Memiliki NPWP / NIK Terdaftar</div>
                <div className="text-[11px] text-slate-500">
                  Non-NPWP dikenakan tarif 20% lebih tinggi (120%)
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHasNPWP(!hasNPWP)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  hasNPWP ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                    hasNPWP ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-lg p-3.5">
              <span className="text-[11px] text-slate-500 block">Penghasilan Bruto</span>
              <span className="text-base sm:text-lg font-bold font-mono text-slate-900 block mt-1 tabular-nums">
                {formatIDR(grossFee)}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">Total Tagihan</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5">
              <span className="text-[11px] text-slate-500 block">DPP (50% Bruto)</span>
              <span className="text-base sm:text-lg font-bold font-mono text-slate-700 block mt-1 tabular-nums">
                {formatIDR(result.dpp)}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">PMK 168/2023</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-3.5">
              <span className="text-[11px] text-slate-500 block">Potongan PPh 21</span>
              <span className="text-base sm:text-lg font-bold font-mono text-rose-600 block mt-1 tabular-nums">
                {formatIDR(result.taxAmount)}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Efektif: {formatPercent(result.effectiveRate)}
              </span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5">
              <span className="text-[11px] text-emerald-800 font-medium block">
                Penerimaan Bersih
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-emerald-950 block mt-1 tabular-nums">
                {formatIDR(netPayment)}
              </span>
              <span className="text-[10px] text-emerald-700 mt-1 block">Ditransfer ke Klien</span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Rincian Perhitungan Pajak Penghasilan Pasal 21 Tenaga Ahli
            </h4>

            <div className="border border-slate-200 rounded overflow-x-auto text-xs w-full">
              <table className="w-full min-w-[480px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <tr>
                    <th className="py-2 px-3 text-left font-semibold">Langkah Perhitungan</th>
                    <th className="py-2 px-3 text-right font-semibold">Keterangan Regulasi</th>
                    <th className="py-2 px-3 text-right font-semibold">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 px-3 text-slate-700">Imbalan Jasa Bruto Tagihan</td>
                    <td className="py-2 px-3 text-right text-slate-500">Nilai Invoice</td>
                    <td className="py-2 px-3 text-right font-mono font-medium tabular-nums">
                      {formatIDR(grossFee)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-700">Dasar Pengenaan Pajak (DPP)</td>
                    <td className="py-2 px-3 text-right text-slate-500">50% × Penghasilan Bruto</td>
                    <td className="py-2 px-3 text-right font-mono font-medium tabular-nums text-slate-800">
                      {formatIDR(result.dpp)}
                    </td>
                  </tr>
                  {cumulativeGrossPrevious > 0 && (
                    <tr>
                      <td className="py-2 px-3 text-slate-700">Akumulasi DPP Kumulatif Sebelumnya</td>
                      <td className="py-2 px-3 text-right text-slate-500">50% × Bruto Lalu</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-600">
                        {formatIDR(cumulativeGrossPrevious * 0.5)}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-rose-50/60 font-semibold text-rose-900">
                    <td className="py-2 px-3">Potongan Pajak PPh 21 Terutang</td>
                    <td className="py-2 px-3 text-right text-rose-700">
                      Tarif Ps. 17 {!hasNPWP ? '(+20% Non-NPWP)' : ''}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold tabular-nums text-rose-700">
                      -{formatIDR(result.taxAmount)}
                    </td>
                  </tr>
                  <tr className="bg-emerald-100/70 font-bold text-emerald-950 text-sm">
                    <td className="py-2.5 px-3">Diterima Bersih oleh Tenaga Ahli</td>
                    <td className="py-2.5 px-3 text-right text-emerald-800 text-xs font-normal">
                      Net Fee
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {formatIDR(netPayment)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Note on PMK 168 */}
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-700 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900">
                  Perubahan Penting PMK 168/2023 untuk Bukan Pegawai
                </span>
                <p className="mt-0.5 text-slate-600 leading-relaxed">
                  Pada regulasi sebelumnya (PER-16/PJ/2016), perhitungan untuk bukan pegawai berkesinambungan
                  mensyaratkan pengurangan PTKP bulanan jika ber-NPWP dan hanya memiliki 1 pemberi kerja.
                  Mulai 1 Januari 2024 melalui PMK 168/2023, DPP disederhanakan murni menjadi{' '}
                  <strong>50% × Penghasilan Bruto</strong> dan langsung dikenakan tarif progresif Pasal 17 UU HPP
                  secara kumulatif tanpa fasilitas PTKP bulanan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
