'use client';

import React, { useState } from 'react';
import {
  EmployeeSalaryInput,
  calculateEmployeeTax,
  formatIDR,
  formatPercent,
} from '@/lib/tax/tax-calculator';
import { PTKP_RATES } from '@/lib/tax/tax-rates';
import { Printer, X, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
  const [metadata] = useState(() => {
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

  const [downloadNotice, setDownloadNotice] = useState<boolean>(false);

  if (!isOpen) return null;

  const result = calculateEmployeeTax(salaryInput);
  const { monthly, annual, terCategory } = result;

  const handleDownloadPrintableHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Slip_PPh21_${metadata.refId}</title>
  <style>
    @page { size: A4; margin: 12mm 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px; color: #0f172a; background: #f8fafc; line-height: 1.4; font-size: 12px; }
    .doc-container { max-width: 800px; margin: 0 auto; border: 1px solid #cbd5e1; padding: 32px; border-radius: 8px; background: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
    .title { font-size: 16px; font-weight: 800; margin: 3px 0; color: #0f172a; }
    .desc { font-size: 10px; color: #64748b; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px; }
    .table-wrap { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px; }
    .table-wrap th { background: #f1f5f9; border-bottom: 2px solid #cbd5e1; padding: 7px 10px; text-align: left; font-weight: bold; }
    .table-wrap td { border-bottom: 1px solid #e2e8f0; padding: 7px 10px; }
    .tr-net { background: #ecfdf5; font-weight: bold; font-size: 12px; border-top: 2px solid #059669; }
    .signs { display: grid; grid-template-columns: 1fr 1fr; text-align: center; font-size: 11px; margin-top: 40px; }
    .sign-line { border-top: 1px solid #94a3b8; margin-top: 45px; padding-top: 4px; font-weight: bold; }
    .no-print { background: #0f172a; color: #fff; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .btn-print { background: #059669; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px; }
    @media print {
      body { padding: 0; background: #fff; }
      .doc-container { border: none; padding: 0; box-shadow: none; max-width: 100%; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <div>
      <div style="font-weight: bold; color: #34d399;">LEMBAR SIMULASI PPH 21 SIAP CETAK & SIMPAN PDF</div>
      <div style="font-size: 11px; color: #94a3b8;">Klik tombol cetak atau gunakan menu browser (Ctrl+P / Cmd+P) lalu pilih Destination: Save as PDF.</div>
    </div>
    <button class="btn-print" onclick="window.print()">Cetak / Simpan PDF</button>
  </div>
  <div class="doc-container">
    <div class="header">
      <div>
        <div class="title">LEMBAR SIMULASI PENGHITUNGAN PPH PASAL 21</div>
        <div class="desc">Berdasarkan PP No. 58/2023, PMK No. 168/2023 & UU HPP No. 7/2021</div>
      </div>
      <div style="text-align: right; font-family: monospace; font-size: 11px;">
        <div><strong>Tanggal:</strong> ${metadata.date}</div>
        <div><strong>Ref:</strong> ${metadata.refId}</div>
      </div>
    </div>
    <div class="meta-box">
      <div><span style="color: #64748b;">Status PTKP:</span><br><strong>${salaryInput.statusPTKP} (${PTKP_RATES[salaryInput.statusPTKP]?.description})</strong></div>
      <div><span style="color: #64748b;">Kategori Tarif Efektif:</span><br><strong style="color: #065f46;">TER Kategori ${terCategory} (${formatPercent(monthly.terRate)})</strong></div>
      <div><span style="color: #64748b;">Status NPWP:</span><br><strong>${salaryInput.hasNPWP ? 'Terdaftar (100%)' : 'Tanpa NPWP (+20%)'}</strong></div>
      <div><span style="color: #64748b;">Metode Pemotongan:</span><br><strong style="text-transform: uppercase;">Metode ${salaryInput.method}</strong></div>
    </div>
    <table class="table-wrap">
      <thead>
        <tr>
          <th>Uraian Komponen</th>
          <th style="text-align: right; width: 180px;">Nominal (Rp)</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #f8fafc; font-weight: bold;">
          <td colspan="2">1. PENGHASILAN BRUTO BULANAN</td>
        </tr>
        <tr>
          <td>• Gaji Pokok</td>
          <td style="text-align: right; font-family: monospace;">${formatIDR(monthly.baseSalary)}</td>
        </tr>
        <tr>
          <td>• Tunjangan Tetap & Variabel</td>
          <td style="text-align: right; font-family: monospace;">${formatIDR(monthly.allowanceFixed + monthly.allowanceVariable)}</td>
        </tr>
        ${salaryInput.includeBPJS ? `
        <tr>
          <td>• Premi BPJS Ditanggung Perusahaan (JKK, JKM, BPJS Kes 4%)</td>
          <td style="text-align: right; font-family: monospace;">${formatIDR(monthly.bpjsJKK + monthly.bpjsJKM + monthly.bpjsKesehatanPerusahaan)}</td>
        </tr>` : ''}
        <tr style="background: #f1f5f9; font-weight: bold;">
          <td>Total Bruto Dasar Pemotongan TER</td>
          <td style="text-align: right; font-family: monospace;">${formatIDR(monthly.grossIncome)}</td>
        </tr>
        <tr style="background: #f8fafc; font-weight: bold;">
          <td colspan="2">2. PEMOTONGAN IURAN & PAJAK (JANUARI - NOVEMBER)</td>
        </tr>
        ${salaryInput.includeBPJS ? `
        <tr>
          <td>• Iuran JHT 2%, JP 1%, BPJS Kes 1% (Karyawan)</td>
          <td style="text-align: right; font-family: monospace; color: #be123c;">-${formatIDR(monthly.totalPengurang)}</td>
        </tr>` : ''}
        <tr style="background: #fff1f2; font-weight: bold; color: #be123c;">
          <td>• PPh 21 Bulanan (TER ${terCategory} · ${formatPercent(monthly.terRate)})</td>
          <td style="text-align: right; font-family: monospace;">-${formatIDR(monthly.terTaxMonthly)}</td>
        </tr>
        <tr class="tr-net">
          <td>3. PENGHASILAN BERSIH (TAKE HOME PAY)</td>
          <td style="text-align: right; font-family: monospace;">${formatIDR(monthly.takeHomePay)}</td>
        </tr>
      </tbody>
    </table>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; font-size: 11px; margin-bottom: 24px;">
      <div style="font-weight: bold; color: #0f172a; margin-bottom: 4px;">Evaluasi Masa Pajak Terakhir (Desember):</div>
      <div style="display: flex; justify-content: space-between;"><span>Total PPh 21 Terutang Setahun (Tarif Progresif Ps. 17):</span><strong style="font-family: monospace;">${formatIDR(annual.totalTaxAnnual)}</strong></div>
      <div style="display: flex; justify-content: space-between;"><span>PPh 21 Telah Dipotong Masa Jan–Nov:</span><span style="font-family: monospace;">${formatIDR(annual.taxPaidJanToNov)}</span></div>
      <div style="display: flex; justify-content: space-between; border-top: 1px solid #cbd5e1; padding-top: 4px; margin-top: 4px; font-weight: bold; color: #065f46;"><span>PPh 21 Dipotong di Gaji Masa Desember:</span><span style="font-family: monospace;">${formatIDR(annual.taxDecember)}</span></div>
    </div>
    <div class="signs">
      <div>Disiapkan Oleh,<div class="sign-line">Bagian Keuangan / Payroll</div></div>
      <div>Diterima & Disetujui,<div class="sign-line">Pegawai Bersangkutan</div></div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Slip_PPh21_${metadata.refId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 5000);
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      handleDownloadPrintableHTML();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md p-3 sm:p-6 md:p-8 flex justify-center items-start print:p-0 print:bg-white print:static print-modal-container">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden print:border-none print:shadow-none printable-document my-auto sm:my-6 md:my-8 relative">
        {/* Modal Header (hidden on print) - Sticky so it is never clipped */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900 text-white print:hidden gap-3 flex-wrap sm:flex-nowrap border-b border-slate-800 shadow-md">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold text-emerald-400 shrink-0">
              LEMBAR SIMULASI RESMI
            </span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-xs text-slate-300 truncate">
              Slip Bukti Pemotongan PPh 21 Karyawan
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={handleDownloadPrintableHTML}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white rounded-lg text-xs font-semibold transition-all border border-slate-700 shadow-xs cursor-pointer"
              title="Unduh file dokumen siap cetak (.html) untuk dibuka di browser"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Unduh File (.HTML/PDF)</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Sekarang</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Download Success Notice Banner */}
        {downloadNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 sm:px-6 py-2.5 flex items-center justify-between text-emerald-900 text-xs transition-all">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Dokumen berhasil diunduh!</strong> Buka berkas <code>Slip_PPh21_{metadata.refId}.html</code> untuk langsung melihat lembar cetak atau menyimpan sebagai PDF.
              </span>
            </div>
            <button
              onClick={() => setDownloadNotice(false)}
              className="text-emerald-700 hover:text-emerald-950 font-bold px-2 py-0.5"
            >
              &times;
            </button>
          </div>
        )}

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
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex items-center justify-between gap-2 print:hidden flex-wrap">
          <button
            onClick={handleDownloadPrintableHTML}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-xs font-semibold text-emerald-800 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Unduh Dokumen Siap Cetak</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Dokumen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
