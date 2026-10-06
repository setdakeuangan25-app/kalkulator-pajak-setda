'use client';

import React from 'react';
import {
  EmployeeSalaryInput,
  calculateEmployeeTax,
  formatIDR,
  formatPercent,
} from '@/lib/tax/tax-calculator';
import { PTKP_RATES } from '@/lib/tax/tax-rates';
import { Printer, X, Download, ShieldCheck } from 'lucide-react';

interface PrintSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  salaryInput: EmployeeSalaryInput;
}

export const PrintSlipModal: React.FC<PrintSlipModalProps> = ({
  isOpen,
  onClose,
  salaryInput,
}) => {
  const [metadata] = React.useState(() => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      refId: `SIM-${Math.floor(100000 + Math.random() * 900000)}`,
    };
  });

  if (!isOpen) return null;

  const result = calculateEmployeeTax(salaryInput);
  const { monthly, annual, terCategory } = result;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden print:border-none print:shadow-none">
        {/* Modal Header (hidden on print) */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-400">
              LEMBAR SIMULASI RESMI
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-xs text-slate-300">
              Slip Bukti Pemotongan PPh 21
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800 text-xs">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <div className="text-base font-extrabold text-slate-900 tracking-tight">
                LEMBAR SIMULASI PENGHITUNGAN PPH PASAL 21
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5">
                Berdasarkan PP No. 58/2023, PMK No. 168/2023 & UU HPP No. 7/2021
              </div>
            </div>
            <div className="text-right text-[11px] font-mono text-slate-500">
              <div>Tanggal: {metadata.date}</div>
              <div>Ref: {metadata.refId}</div>
            </div>
          </div>

          {/* Profile metadata */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded border border-slate-200 text-xs">
            <div>
              <div className="text-slate-500 text-[11px]">Status PTKP:</div>
              <div className="font-bold text-slate-900">
                {salaryInput.statusPTKP} ({PTKP_RATES[salaryInput.statusPTKP]?.description})
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px]">Kategori Tarif Efektif:</div>
              <div className="font-bold text-emerald-800">
                TER Kategori {terCategory} ({formatPercent(monthly.terRate)})
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px]">Status NPWP:</div>
              <div className="font-semibold text-slate-900">
                {salaryInput.hasNPWP ? 'Terdaftar (100%)' : 'Tanpa NPWP (+20%)'}
              </div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px]">Metode Pemotongan:</div>
              <div className="font-semibold text-slate-900 uppercase">
                Metode {salaryInput.method}
              </div>
            </div>
          </div>

          {/* Table Breakdown */}
          <div className="border border-slate-300 rounded overflow-x-auto w-full">
            <table className="w-full text-xs min-w-[440px]">
              <thead className="bg-slate-100 text-slate-800 border-b border-slate-300">
                <tr>
                  <th className="py-2 px-3 text-left font-bold">Uraian Komponen</th>
                  <th className="py-2 px-3 text-right font-bold">Nominal (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-slate-50 font-semibold text-slate-900">
                  <td colSpan={2} className="py-1.5 px-3">
                    1. PENGHASILAN BRUTO BULANAN
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 text-slate-700">• Gaji Pokok</td>
                  <td className="py-1.5 px-3 text-right font-mono tabular-nums">
                    {formatIDR(monthly.baseSalary)}
                  </td>
                </tr>
                {monthly.allowanceFixed > 0 && (
                  <tr>
                    <td className="py-1.5 px-3 text-slate-700">• Tunjangan Tetap</td>
                    <td className="py-1.5 px-3 text-right font-mono tabular-nums">
                      {formatIDR(monthly.allowanceFixed)}
                    </td>
                  </tr>
                )}
                {monthly.allowanceVariable > 0 && (
                  <tr>
                    <td className="py-1.5 px-3 text-slate-700">• Tunjangan Tidak Tetap</td>
                    <td className="py-1.5 px-3 text-right font-mono tabular-nums">
                      {formatIDR(monthly.allowanceVariable)}
                    </td>
                  </tr>
                )}
                {monthly.overtimeBonus > 0 && (
                  <tr>
                    <td className="py-1.5 px-3 text-slate-700">• Lembur / Bonus Bulanan</td>
                    <td className="py-1.5 px-3 text-right font-mono tabular-nums">
                      {formatIDR(monthly.overtimeBonus)}
                    </td>
                  </tr>
                )}
                {salaryInput.includeBPJS && (
                  <tr>
                    <td className="py-1.5 px-3 text-slate-700">
                      • BPJS Ditanggung Perusahaan (JKK, JKM, BPJS Kes 4%)
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono tabular-nums">
                      +{formatIDR(monthly.bpjsJKK + monthly.bpjsJKM + monthly.bpjsKesehatanPerusahaan)}
                    </td>
                  </tr>
                )}
                <tr className="font-bold bg-slate-50">
                  <td className="py-2 px-3">Total Bruto Dasar Pemotongan TER</td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums">
                    {formatIDR(monthly.grossIncome)}
                  </td>
                </tr>

                <tr className="bg-slate-50 font-semibold text-slate-900">
                  <td colSpan={2} className="py-1.5 px-3">
                    2. PEMOTONGAN IURAN & PAJAK (JANUARI - NOVEMBER)
                  </td>
                </tr>
                {salaryInput.includeBPJS && (
                  <tr>
                    <td className="py-1.5 px-3 text-slate-700">
                      • Iuran JHT 2%, JP 1%, BPJS Kes 1% (Karyawan)
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono tabular-nums text-rose-700">
                      -{formatIDR(monthly.totalPengurang)}
                    </td>
                  </tr>
                )}
                <tr className="font-bold text-rose-700 bg-rose-50/50">
                  <td className="py-2 px-3">
                    • PPh 21 Bulanan (TER {terCategory} · {formatPercent(monthly.terRate)})
                  </td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums">
                    -{formatIDR(monthly.terTaxMonthly)}
                  </td>
                </tr>

                <tr className="bg-emerald-50 text-emerald-950 font-extrabold text-sm border-t-2 border-emerald-600">
                  <td className="py-2.5 px-3">3. PENGHASILAN BERSIH (TAKE HOME PAY)</td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                    {formatIDR(monthly.takeHomePay)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* December reconciliation note */}
          <div className="border border-slate-200 rounded p-3 text-[11px] bg-slate-50 space-y-1">
            <div className="font-bold text-slate-800">
              Evaluasi Masa Pajak Terakhir (Desember):
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total PPh 21 Terutang Setahun (Tarif Progresif Ps. 17):</span>
              <span className="font-mono font-bold text-slate-900">
                {formatIDR(annual.totalTaxAnnual)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>PPh 21 Telah Dipotong Masa Jan–Nov (11 Bulan):</span>
              <span className="font-mono text-slate-700">
                {formatIDR(annual.taxPaidJanToNov)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-emerald-900 pt-1 border-t border-slate-200">
              <span>PPh 21 Dipotong di Gaji Masa Desember:</span>
              <span className="font-mono">{formatIDR(annual.taxDecember)}</span>
            </div>
          </div>

          {/* Footer signatures */}
          <div className="pt-6 grid grid-cols-2 text-center text-xs text-slate-600">
            <div>
              <div className="mb-12">Disiapkan Oleh,</div>
              <div className="border-t border-slate-400 inline-block px-8 pt-1 font-semibold text-slate-900">
                Bagian Keuangan / Payroll
              </div>
            </div>
            <div>
              <div className="mb-12">Diterima & Disetujui,</div>
              <div className="border-t border-slate-400 inline-block px-8 pt-1 font-semibold text-slate-900">
                Pegawai Bersangkutan
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (hidden on print) */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex items-center justify-end gap-2 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Dokumen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
