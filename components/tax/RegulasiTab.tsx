'use client';

import React, { useState } from 'react';
import {
  TER_A_TIERS,
  TER_B_TIERS,
  TER_C_TIERS,
  PASAL_17_BRACKETS,
  PTKP_RATES,
} from '@/lib/tax/tax-rates';
import {
  formatIDR,
  formatPercent,
  getTERRate,
} from '@/lib/tax/tax-calculator';
import {
  BookOpen,
  Search,
  ExternalLink,
  Shield,
  FileText,
  HelpCircle,
  Scale,
} from 'lucide-react';

export const RegulasiTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'A' | 'B' | 'C'>('A');
  const [searchSalary, setSearchSalary] = useState<number>(10_000_000);

  const activeTiers =
    selectedCategory === 'A'
      ? TER_A_TIERS
      : selectedCategory === 'B'
      ? TER_B_TIERS
      : TER_C_TIERS;

  // Find tier for searched salary
  const searchedRateInfo = getTERRate(
    selectedCategory === 'A' ? 'TK/0' : selectedCategory === 'B' ? 'K/1' : 'K/3',
    searchSalary
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 rounded-lg p-4 sm:p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <span className="text-xs font-semibold text-emerald-400">
            PUSAT REFERENSI & DASAR HUKUM PERPAJAKAN
          </span>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
            Katalog Regulasi & Tabel Lengkap TER PP 58/2023
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Tabel resmi Tarif Efektif Rata-Rata (TER) Kategori A, B, dan C beserta rangkuman undang-undang
            dan peraturan menteri keuangan yang mendasari perhitungan kalkulator ini.
          </p>
        </div>
      </div>

      {/* Interactive TER Table Inspector */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Tabel Tarif Efektif Rata-Rata Bulanan (PP 58/2023)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih kategori atau ketik nominal gaji untuk melihat lapisan tarif yang berlaku secara otomatis
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs self-start sm:self-auto">
            <button
              onClick={() => setSelectedCategory('A')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                selectedCategory === 'A'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kategori A (TK/0, TK/1, K/0)
            </button>
            <button
              onClick={() => setSelectedCategory('B')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                selectedCategory === 'B'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kategori B (TK/2, TK/3, K/1, K/2)
            </button>
            <button
              onClick={() => setSelectedCategory('C')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                selectedCategory === 'C'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kategori C (K/3)
            </button>
          </div>
        </div>

        {/* Live Search Tool */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-700 whitespace-nowrap">
              Cek Tarif Gaji Bulanan:
            </span>
            <div className="relative flex-1 sm:w-48">
              <span className="absolute left-2.5 top-2 text-slate-400 font-mono text-xs">
                Rp
              </span>
              <input
                type="text"
                value={searchSalary === 0 ? '' : searchSalary.toLocaleString('id-ID')}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, '');
                  setSearchSalary(clean === '' ? 0 : parseInt(clean, 10));
                }}
                placeholder="10.000.000"
                className="w-full pl-8 pr-2 py-1.5 border border-slate-300 rounded font-mono text-xs focus:border-emerald-600 outline-none bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-slate-500">Hasil Penelusuran:</span>
            <div className="bg-emerald-100/70 border border-emerald-300 px-3 py-1 rounded text-emerald-900 font-bold font-mono">
              TER {selectedCategory} · {formatPercent(searchedRateInfo.rate)} (Pajak:{' '}
              {formatIDR(searchSalary * searchedRateInfo.rate)})
            </div>
          </div>
        </div>

        {/* Tiers Scrollable Table */}
        <div className="border border-slate-200 rounded text-xs max-h-[380px] overflow-y-auto overflow-x-auto w-full">
          <table className="w-full min-w-[540px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 sticky top-0 z-10">
              <tr>
                <th className="py-2 px-3 text-left font-semibold w-16">Lapisan</th>
                <th className="py-2 px-3 text-left font-semibold">Rentang Penghasilan Bruto Bulanan</th>
                <th className="py-2 px-3 text-right font-semibold">Tarif Efektif (%)</th>
                <th className="py-2 px-3 text-right font-semibold">Estimasi Pajak Nilai Tengah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeTiers.map((tier, idx) => {
                const isMatching =
                  (tier.max === null && searchSalary > tier.min) ||
                  (tier.max !== null &&
                    searchSalary > tier.min &&
                    searchSalary <= tier.max) ||
                  (tier.min === 0 && tier.max !== null && searchSalary <= tier.max);

                const sampleAmount =
                  tier.max === null
                    ? tier.min + 100_000_000
                    : (tier.min + tier.max) / 2;

                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isMatching
                        ? 'bg-emerald-50/80 font-semibold text-emerald-950'
                        : 'hover:bg-slate-50/70 text-slate-700'
                    }`}
                  >
                    <td className="py-2 px-3 font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-3">
                      {tier.max === null ? (
                        <span>Di atas {formatIDR(tier.min)}</span>
                      ) : tier.min === 0 ? (
                        <span>Sampai dengan {formatIDR(tier.max)}</span>
                      ) : (
                        <span>
                          {formatIDR(tier.min + 1)} s.d. {formatIDR(tier.max)}
                        </span>
                      )}
                      {isMatching && (
                        <span className="ml-2 text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-normal">
                          Cocok
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold tabular-nums">
                      {formatPercent(tier.rate)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-500 tabular-nums">
                      {formatIDR(sampleAmount * tier.rate)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legal Reference Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: UU HPP */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Scale className="w-4 h-4 text-emerald-700" />
            <span>UU No. 7 Tahun 2021 (Harmonisasi Peraturan Perpajakan)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Merekontruksi lapisan tarif pajak penghasilan orang pribadi dari 4 menjadi 5 lapisan, menaikkan batas
            lapisan terbawah dari Rp 50 Juta menjadi Rp 60 Juta (tarif 5%), dan menambahkan lapisan tarif 35%
            untuk penghasilan di atas Rp 5 Miliar. Menetapkan tarif PPh Badan sebesar 22% dan PPN sebesar 11%.
          </p>
          <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700">Tarif Progresif Orang Pribadi:</div>
            <div>• 0 s.d. Rp 60 Juta: 5%</div>
            <div>• &gt; Rp 60 Juta s.d. Rp 250 Juta: 15%</div>
            <div>• &gt; Rp 250 Juta s.d. Rp 500 Juta: 25%</div>
            <div>• &gt; Rp 500 Juta s.d. Rp 5 Miliar: 30%</div>
            <div>• &gt; Rp 5 Miliar: 35%</div>
          </div>
        </div>

        {/* Card 2: PP 58/2023 & PMK 168/2023 */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <FileText className="w-4 h-4 text-emerald-700" />
            <span>PP 58/2023 & PMK 168/2023 (Skema TER)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Berlaku mulai 1 Januari 2024. Menghilangkan kompleksitas penghitungan Penghasilan Kena Pajak (PKP)
            dan penyetaraan setahun setiap bulan. Pemotongan PPh 21 masa Januari–November cukup mengalikan penghasilan
            bruto dengan Tarif Efektif Rata-Rata (TER) sesuai kategori PTKP.
          </p>
          <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700">Kategori TER Berdasarkan PTKP:</div>
            <div>• <strong>Kategori A:</strong> TK/0 (Rp 54 Jt), TK/1 (Rp 58.5 Jt), K/0 (Rp 58.5 Jt)</div>
            <div>• <strong>Kategori B:</strong> TK/2 (Rp 63 Jt), TK/3 (Rp 67.5 Jt), K/1 (Rp 63 Jt), K/2 (Rp 67.5 Jt)</div>
            <div>• <strong>Kategori C:</strong> K/3 (Rp 72 Jt)</div>
            <div>• <strong>Masa Desember:</strong> Dihitung ulang setahun dengan Tarif Pasal 17 UU HPP.</div>
          </div>
        </div>

        {/* Card 3: PP 55/2022 */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>PP 55/2022 (PPh Final UMKM 0,5%)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Memberikan insentif bagi pelaku UMKM dengan omzet maksimal Rp 4,8 Miliar setahun. Khusus
            Wajib Pajak Orang Pribadi, peredaran bruto kumulatif sampai dengan <strong>Rp 500 Juta setahun tidak dikenakan pajak</strong>.
            Pajak 0,5% hanya dipungut atas omzet di atas Rp 500 Juta.
          </p>
          <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-500">
            <div>Masa berlaku: 7 tahun (Orang Pribadi), 4 tahun (CV/Koperasi), 3 tahun (PT).</div>
          </div>
        </div>

        {/* Card 4: Fasilitas 31E */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Shield className="w-4 h-4 text-emerald-700" />
            <span>Pasal 31E UU PPh (Fasilitas PPh Badan)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Wajib Pajak Badan dalam negeri dengan peredaran bruto hingga Rp 50 Miliar berhak memperoleh fasilitas
            pengurangan tarif 50% (sehingga tarif efektif menjadi <strong>11%</strong>) atas bagian Penghasilan
            Kena Pajak dari peredaran bruto sampai dengan Rp 4,8 Miliar.
          </p>
          <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-500">
            <div>Penghematan pajak maksimal mencapai ratusan juta rupiah bagi perseroan berbadan hukum.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
