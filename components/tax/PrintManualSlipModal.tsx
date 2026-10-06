'use client';

import React, { useState } from 'react';
import { formatIDR, formatPercent, terbilangRupiah } from '@/lib/tax/tax-calculator';
import { Printer, X, Copy, Check, FileCheck, Building2, ShieldCheck } from 'lucide-react';

export interface PrintManualSlipData {
  totalContractValue: number;
  dpp: number;
  usePPN: boolean;
  ppnMode: 'include' | 'exclude';
  ppnRatePercent: number;
  ppnAmount: number;
  isWapu: boolean;
  taxName: string;
  currentTaxRate: number;
  taxBasis: 'dpp' | 'bruto';
  taxBasisAmount: number;
  pphAmount: number;
  hasNPWP: boolean;
  useSecondTax: boolean;
  secondTaxName: string;
  secondTaxRate: number;
  secondTaxAmount: number;
  totalDeductionByTreasurer: number;
  netDisbursementToVendor: number;
}

interface PrintManualSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PrintManualSlipData;
}

export const PrintManualSlipModal: React.FC<PrintManualSlipModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  // Call hooks at the top (Rules of Hooks)
  const [metadata] = useState(() => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      refId: `BKT-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    };
  });

  const [institutionName, setInstitutionName] = useState<string>(
    'BAGIAN KEUANGAN / BENDAHARA PENGELUARAN'
  );
  const [vendorName, setVendorName] = useState<string>('CV / PT Rekanan Penyedia');
  const [transactionPurpose, setTransactionPurpose] = useState<string>(
    'Pembayaran atas pengadaan barang / jasa kegiatan operasional'
  );
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const terbilangNet = terbilangRupiah(data.netDisbursementToVendor);

  const handleCopyText = () => {
    const text = `
LEMBAR BUKTI POTONGAN PAJAK & KWITANSI PENGADAAN
No. Ref: ${metadata.refId}
Tanggal: ${metadata.date}
Instansi: ${institutionName}
Penerima / Rekanan: ${vendorName}
Uraian: ${transactionPurpose}
--------------------------------------------------
1. Nilai Bruto Transaksi: ${formatIDR(data.totalContractValue)}
2. Dasar Pengenaan Pajak (DPP): ${formatIDR(data.dpp)}
3. PPN ${data.ppnRatePercent}% (${data.usePPN ? (data.isWapu ? 'Dipungut Bendahara/WAPU' : 'Dibayar ke Rekanan') : 'Non-PPN'}): ${formatIDR(data.ppnAmount)}
4. ${data.taxName} (${formatPercent(data.currentTaxRate / 100)}): ${formatIDR(data.pphAmount)}
${data.useSecondTax ? `5. ${data.secondTaxName} (${data.secondTaxRate}%): ${formatIDR(data.secondTaxAmount)}\n` : ''}--------------------------------------------------
TOTAL POTONGAN PAJAK: ${formatIDR(data.totalDeductionByTreasurer)}
JUMLAH BERSIH DIBAYARKAN: ${formatIDR(data.netDisbursementToVendor)}
Terbilang: ${terbilangNet}
==================================================
Dihitung otomatis melalui Kalkulator Pajak RI
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full border border-slate-200 overflow-hidden print:border-none print:shadow-none">
        {/* Modal Top Bar (hidden on print) */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-400">
              PRATINJAU CETAK DOKUMEN
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-xs text-slate-300">
              Bukti Potongan & Kwitansi Pembayaran
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
        <div className="p-6 sm:p-8 space-y-6 text-slate-800 text-xs bg-white">
          {/* Header Lembaga / Kuitansi */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-1">
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="text-base font-extrabold text-slate-900 tracking-tight border-b border-transparent hover:border-slate-300 focus:border-emerald-600 outline-none w-full sm:w-96 bg-transparent"
                title="Klik untuk mengubah nama instansi/bagian"
              />
              <div className="text-slate-500 text-[11px]">
                LEMBAR BUKTI PERHITUNGAN TRANSAKSI & PEMOTONGAN PAJAK (KWITANSI PENGADAAN)
              </div>
            </div>
            <div className="text-right text-[11px] font-mono text-slate-600 shrink-0">
              <div>Tanggal: {metadata.date}</div>
              <div>No. Bukti: {metadata.refId}</div>
            </div>
          </div>

          {/* Form Metadata Transaksi (Editable on screen) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 text-[11px] block">Penerima / Nama Rekanan:</span>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-600 outline-none w-full"
              />
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Status Wajib Pajak:</span>
              <div className="font-semibold text-slate-800">
                {data.hasNPWP ? 'Memiliki NPWP (Tarif Standar)' : 'Tanpa NPWP (Tarif Non-NPWP)'}
              </div>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 text-[11px] block">Uraian Keperluan / Belanja:</span>
              <input
                type="text"
                value={transactionPurpose}
                onChange={(e) => setTransactionPurpose(e.target.value)}
                className="font-medium text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-600 outline-none w-full"
              />
            </div>
          </div>

          {/* Table Breakdown */}
          <div className="border border-slate-300 rounded overflow-x-auto w-full">
            <table className="w-full text-xs min-w-[480px]">
              <thead className="bg-slate-100 text-slate-800 border-b border-slate-300">
                <tr>
                  <th className="py-2 px-3 text-left font-bold">No</th>
                  <th className="py-2 px-3 text-left font-bold">Uraian Komponen Pembayaran & Pajak</th>
                  <th className="py-2 px-3 text-center font-bold">Tarif</th>
                  <th className="py-2 px-3 text-right font-bold">Dasar Perhitungan (Rp)</th>
                  <th className="py-2 px-3 text-right font-bold">Nominal (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {/* 1. Nilai Bruto */}
                <tr>
                  <td className="py-2 px-3 text-slate-500 font-mono">1</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">
                    Nilai Bruto Tagihan / SPK
                    <span className="text-[10px] text-slate-500 block font-normal">
                      {data.usePPN
                        ? `Nilai transaksi (${data.ppnMode.toUpperCase()} PPN ${data.ppnRatePercent}%)`
                        : 'Nilai transaksi tanpa PPN'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center text-slate-500">-</td>
                  <td className="py-2 px-3 text-right text-slate-500 font-mono">-</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatIDR(data.totalContractValue)}
                  </td>
                </tr>

                {/* 2. DPP */}
                <tr className="bg-slate-50/60">
                  <td className="py-2 px-3 text-slate-500 font-mono">2</td>
                  <td className="py-2 px-3 text-slate-800">
                    Dasar Pengenaan Pajak (DPP)
                    <span className="text-[10px] text-slate-500 block">
                      Nilai acuan sebelum pengenaan PPN
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center text-slate-500">
                    {data.usePPN ? `100/${100 + data.ppnRatePercent}` : '100%'}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-600 font-mono tabular-nums">
                    {formatIDR(data.totalContractValue)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                    {formatIDR(data.dpp)}
                  </td>
                </tr>

                {/* 3. PPN */}
                <tr>
                  <td className="py-2 px-3 text-slate-500 font-mono">3</td>
                  <td className="py-2 px-3 text-slate-800">
                    Pajak Pertambahan Nilai (PPN {data.ppnRatePercent}%)
                    <span className="text-[10px] text-slate-500 block">
                      {data.usePPN
                        ? data.isWapu
                          ? 'Dipungut oleh Bendahara (WAPU) & Disetor ke Kas Negara'
                          : 'Dibayarkan kepada Rekanan PKP'
                        : 'Bukan Objek PPN / Tanpa PPN'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center font-mono font-semibold text-slate-700">
                    {data.usePPN ? `${data.ppnRatePercent}%` : '0%'}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-600 font-mono tabular-nums">
                    {data.usePPN ? formatIDR(data.dpp) : '-'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatIDR(data.ppnAmount)}
                  </td>
                </tr>

                {/* 4. PPh */}
                <tr className="bg-rose-50/40">
                  <td className="py-2 px-3 text-rose-700 font-mono">4</td>
                  <td className="py-2 px-3 font-semibold text-rose-950">
                    Potongan {data.taxName}
                    <span className="text-[10px] text-rose-700 block font-normal">
                      Dasar potongan: {data.taxBasis === 'dpp' ? 'DPP' : 'Total Bruto'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center font-mono font-bold text-rose-900">
                    {data.currentTaxRate}%
                  </td>
                  <td className="py-2 px-3 text-right text-slate-600 font-mono tabular-nums">
                    {formatIDR(data.taxBasisAmount)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-rose-700 tabular-nums">
                    -{formatIDR(data.pphAmount)}
                  </td>
                </tr>

                {/* 5. Second Tax if any */}
                {data.useSecondTax && (
                  <tr className="bg-amber-50/40">
                    <td className="py-2 px-3 text-amber-700 font-mono">5</td>
                    <td className="py-2 px-3 font-semibold text-amber-950">
                      Potongan {data.secondTaxName}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-amber-900">
                      {data.secondTaxRate}%
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600 font-mono tabular-nums">
                      {formatIDR(data.dpp)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-amber-800 tabular-nums">
                      -{formatIDR(data.secondTaxAmount)}
                    </td>
                  </tr>
                )}

                {/* Total Potongan */}
                <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                  <td colSpan={4} className="py-2 px-3 text-right">
                    TOTAL POTONGAN PAJAK OLEH BENDAHARA
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-rose-700 tabular-nums font-bold">
                    {formatIDR(data.totalDeductionByTreasurer)}
                  </td>
                </tr>

                {/* Net Payment */}
                <tr className="bg-emerald-50 text-emerald-950 font-extrabold text-sm border-t-2 border-emerald-600">
                  <td colSpan={4} className="py-2.5 px-3">
                    JUMLAH BERSIH DIBAYARKAN KE REKANAN (TRANSFER NETTO / SP2D)
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                    {formatIDR(data.netDisbursementToVendor)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Terbilang Box */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs">
            <span className="font-bold text-slate-800">Terbilang Bersih:</span>
            <div className="font-semibold text-emerald-900 italic mt-0.5">
              &ldquo;{terbilangNet}&rdquo;
            </div>
          </div>

          {/* Signatures Area */}
          <div className="pt-8 grid grid-cols-3 text-center text-xs text-slate-700 gap-4">
            <div>
              <div className="text-[11px] text-slate-500 mb-14">Menyetujui,</div>
              <div className="border-t border-slate-400 inline-block px-4 pt-1 font-semibold text-slate-900 w-full">
                Pejabat Pembuat Komitmen (PPK)
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 mb-14">Lunas Dibayar Oleh,</div>
              <div className="border-t border-slate-400 inline-block px-4 pt-1 font-semibold text-slate-900 w-full">
                Bendahara Pengeluaran
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 mb-14">Diterima Bersih Oleh,</div>
              <div className="border-t border-slate-400 inline-block px-4 pt-1 font-semibold text-slate-900 w-full">
                Penyedia / Rekanan
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar (hidden on print) */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex items-center justify-between print:hidden">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tersalin ke Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Teks Kuitansi</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
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
              <span>Cetak Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
