'use client';

import React, { useState } from 'react';
import { formatIDR, formatPercent, terbilangRupiah } from '@/lib/tax/tax-calculator';
import { Printer, X, Copy, Check, Download, FileText, CheckCircle2, Eye } from 'lucide-react';

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
  const [downloadNotice, setDownloadNotice] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<'paper' | 'form'>('paper');

  if (!isOpen) return null;

  const terbilangNet = terbilangRupiah(data.netDisbursementToVendor);

  const handleDownloadPrintableHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Kwitansi_Pajak_${metadata.refId}</title>
  <style>
    @page { size: A4; margin: 12mm 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px; color: #0f172a; background: #f8fafc; line-height: 1.4; font-size: 12px; }
    .doc-container { max-width: 800px; margin: 0 auto; border: 1px solid #cbd5e1; padding: 32px; border-radius: 8px; background: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
    .subhead { font-size: 10px; font-weight: bold; color: #065f46; text-transform: uppercase; letter-spacing: 0.5px; }
    .title { font-size: 16px; font-weight: 800; margin: 3px 0; color: #0f172a; }
    .desc { font-size: 10px; color: #64748b; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px; }
    .table-wrap { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px; }
    .table-wrap th { background: #f1f5f9; border-bottom: 2px solid #cbd5e1; padding: 7px 10px; text-align: left; font-weight: bold; }
    .table-wrap td { border-bottom: 1px solid #e2e8f0; padding: 7px 10px; }
    .tr-net { background: #ecfdf5; font-weight: bold; font-size: 12px; border-top: 2px solid #059669; }
    .terbilang { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; font-size: 11px; margin-bottom: 24px; }
    .signs { display: grid; grid-template-columns: 1fr 1fr 1fr; text-align: center; font-size: 10px; margin-top: 30px; }
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
      <div style="font-weight: bold; color: #34d399;">DOKUMEN SIAP CETAK & SIMPAN PDF</div>
      <div style="font-size: 11px; color: #94a3b8;">Klik tombol cetak atau gunakan menu browser (Ctrl+P / Cmd+P) lalu pilih Destination: Save as PDF.</div>
    </div>
    <button class="btn-print" onclick="window.print()">Cetak / Simpan PDF</button>
  </div>
  <div class="doc-container">
    <div class="header">
      <div>
        <div class="subhead">LEMBAR BUKTI TRANSAKSI & PEMOTONGAN PAJAK (KWITANSI PENGADAAN)</div>
        <div class="title">${institutionName}</div>
        <div class="desc">Format Standar Pertanggungjawaban Keuangan & Pemotongan Pajak Instansi Pemerintah / Swasta</div>
      </div>
      <div style="text-align: right; font-family: monospace; font-size: 11px;">
        <div><strong>Tanggal:</strong> ${metadata.date}</div>
        <div><strong>No. Bukti:</strong> ${metadata.refId}</div>
      </div>
    </div>
    <div class="meta-box">
      <div><span style="color: #64748b;">Penerima / Rekanan:</span><br><strong>${vendorName}</strong></div>
      <div><span style="color: #64748b;">Status NPWP:</span><br><strong>${data.hasNPWP ? 'Memiliki NPWP (Tarif Standar)' : 'Tanpa NPWP (Tarif Non-NPWP)'}</strong></div>
      <div style="grid-column: span 2;"><span style="color: #64748b;">Uraian Keperluan / Belanja:</span><br><strong>${transactionPurpose}</strong></div>
    </div>
    <table class="table-wrap">
      <thead>
        <tr>
          <th style="width: 25px;">No</th>
          <th>Uraian Komponen Pembayaran & Pajak</th>
          <th style="text-align: center; width: 60px;">Tarif</th>
          <th style="text-align: right; width: 140px;">Dasar Perhitungan (Rp)</th>
          <th style="text-align: right; width: 140px;">Nominal (Rp)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td><strong>Nilai Bruto Tagihan / SPK</strong><br><small style="color: #64748b;">${data.usePPN ? `Transaksi (${data.ppnMode.toUpperCase()} PPN ${data.ppnRatePercent}%)` : 'Transaksi Non-PPN'}</small></td>
          <td style="text-align: center;">-</td>
          <td style="text-align: right;">-</td>
          <td style="text-align: right; font-weight: bold; font-family: monospace;">${formatIDR(data.totalContractValue)}</td>
        </tr>
        <tr style="background: #f8fafc;">
          <td>2</td>
          <td>Dasar Pengenaan Pajak (DPP)</td>
          <td style="text-align: center;">${data.usePPN ? `100/${100 + data.ppnRatePercent}` : '100%'}</td>
          <td style="text-align: right; font-family: monospace;">${formatIDR(data.totalContractValue)}</td>
          <td style="text-align: right; font-family: monospace; font-weight: 600;">${formatIDR(data.dpp)}</td>
        </tr>
        <tr>
          <td>3</td>
          <td>Pajak Pertambahan Nilai (PPN ${data.ppnRatePercent}%)<br><small style="color: #64748b;">${data.usePPN ? (data.isWapu ? 'Dipungut Bendahara (WAPU) & Disetor ke Kas Negara' : 'Dibayarkan ke Rekanan PKP') : 'Bukan Objek PPN'}</small></td>
          <td style="text-align: center; font-weight: 600;">${data.usePPN ? `${data.ppnRatePercent}%` : '0%'}</td>
          <td style="text-align: right; font-family: monospace;">${data.usePPN ? formatIDR(data.dpp) : '-'}</td>
          <td style="text-align: right; font-weight: bold; font-family: monospace;">${formatIDR(data.ppnAmount)}</td>
        </tr>
        <tr style="background: #fff1f2;">
          <td style="color: #be123c;">4</td>
          <td><strong style="color: #881337;">Potongan ${data.taxName}</strong><br><small style="color: #be123c;">Dasar: ${data.taxBasis === 'dpp' ? 'DPP' : 'Total Bruto'}</small></td>
          <td style="text-align: center; font-weight: bold; color: #881337;">${data.currentTaxRate}%</td>
          <td style="text-align: right; font-family: monospace;">${formatIDR(data.taxBasisAmount)}</td>
          <td style="text-align: right; font-weight: bold; font-family: monospace; color: #be123c;">-${formatIDR(data.pphAmount)}</td>
        </tr>
        ${data.useSecondTax ? `
        <tr style="background: #fffbeb;">
          <td style="color: #b45309;">5</td>
          <td><strong style="color: #78350f;">Potongan ${data.secondTaxName}</strong></td>
          <td style="text-align: center; font-weight: bold; color: #78350f;">${data.secondTaxRate}%</td>
          <td style="text-align: right; font-family: monospace;">${formatIDR(data.dpp)}</td>
          <td style="text-align: right; font-weight: bold; font-family: monospace; color: #b45309;">-${formatIDR(data.secondTaxAmount)}</td>
        </tr>` : ''}
        <tr style="background: #f1f5f9; font-weight: bold;">
          <td colspan="4" style="text-align: right;">TOTAL POTONGAN PAJAK OLEH BENDAHARA</td>
          <td style="text-align: right; color: #be123c; font-family: monospace;">${formatIDR(data.totalDeductionByTreasurer)}</td>
        </tr>
        <tr class="tr-net">
          <td colspan="4">JUMLAH BERSIH DIBAYARKAN KE REKANAN (TRANSFER NETTO / SP2D)</td>
          <td style="text-align: right; font-family: monospace;">${formatIDR(data.netDisbursementToVendor)}</td>
        </tr>
      </tbody>
    </table>
    <div class="terbilang">
      <strong>Terbilang Bersih:</strong> <em style="color: #065f46;">&ldquo;${terbilangNet}&rdquo;</em>
    </div>
    <div class="signs">
      <div>Menyetujui,<div class="sign-line">Pejabat Pembuat Komitmen (PPK)</div></div>
      <div>Lunas Dibayar Oleh,<div class="sign-line">Bendahara Pengeluaran</div></div>
      <div>Diterima Bersih Oleh,<div class="sign-line">Penyedia / Rekanan</div></div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Kwitansi_Pajak_${metadata.refId}.html`;
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
      // In sandbox iframes window.print may throw or be blocked, trigger download as reliable fallback
      handleDownloadPrintableHTML();
    }
  };

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md p-3 sm:p-6 md:p-8 flex justify-center items-start print:p-0 print:bg-white print:static print-modal-container">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden print:border-none print:shadow-none printable-document my-auto sm:my-6 md:my-8 relative">
        {/* Modal Top Bar (hidden on print) - Sticky so it is never clipped */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900 text-white print:hidden gap-3 flex-wrap sm:flex-nowrap border-b border-slate-800 shadow-md">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold text-emerald-400 shrink-0">
              PRATINJAU CETAK DOKUMEN
            </span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-xs text-slate-300 truncate">
              Bukti Potongan Pajak & Kwitansi Pengadaan
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* View Mode Toggle: Paper A4 Preview vs Edit Form */}
            <div className="bg-slate-800 p-0.5 rounded-lg flex items-center border border-slate-700 text-xs">
              <button
                onClick={() => setPreviewMode('paper')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                  previewMode === 'paper'
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Tampilkan simulasi kertas cetak PDF resmi"
              >
                <Eye className="w-3 h-3" />
                <span className="text-[11px]">Format Kertas A4</span>
              </button>
              <button
                onClick={() => setPreviewMode('form')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                  previewMode === 'form'
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Edit nama instansi, rekanan, dan uraian"
              >
                <FileText className="w-3 h-3" />
                <span className="text-[11px]">Edit Uraian</span>
              </button>
            </div>

            {/* Direct Download HTML/PDF File button for Sandbox & Preview testing */}
            <button
              onClick={handleDownloadPrintableHTML}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white rounded-lg text-xs font-semibold transition-all border border-slate-700 shadow-xs cursor-pointer"
              title="Unduh file dokumen mandiri (.html) yang dapat dibuka di tab browser manapun untuk langsung dicetak atau simpan ke PDF"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Unduh File (.HTML/PDF)</span>
            </button>

            {/* Direct Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer"
              title="Buka dialog cetak browser atau simpan PDF"
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
                <strong>Dokumen berhasil diunduh!</strong> Buka berkas <code>Kwitansi_Pajak_{metadata.refId}.html</code> untuk langsung melihat lembar cetak atau menyimpan sebagai PDF.
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
        <div className={`p-4 sm:p-8 space-y-5 text-slate-800 text-xs bg-white ${previewMode === 'paper' ? 'bg-slate-50/50 print:bg-white' : ''}`}>
          {/* Paper sheet frame if paper preview mode */}
          <div className={`${previewMode === 'paper' ? 'bg-white p-5 sm:p-7 rounded-lg border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0' : ''} space-y-5`}>
            {/* Header Lembaga / Kuitansi */}
            <div className="border-b-2 border-slate-900 pb-3 flex flex-col sm:flex-row justify-between items-start gap-3 print-avoid-break">
              <div className="space-y-1 w-full sm:flex-1 min-w-0">
                <div className="text-[10px] sm:text-[11px] font-bold text-emerald-800 uppercase tracking-wide print:text-slate-700">
                  LEMBAR BUKTI TRANSAKSI & PEMOTONGAN PAJAK (KWITANSI PENGADAAN)
                </div>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-emerald-600 outline-none w-full bg-transparent print:border-none"
                  title="Klik untuk mengubah nama instansi/bagian"
                  placeholder="NAMA INSTANSI / SATUAN KERJA"
                />
                <div className="text-slate-500 text-[10px] sm:text-[11px]">
                  Format Standar Pertanggungjawaban Keuangan & Pemotongan Pajak Instansi Pemerintah / Swasta
                </div>
              </div>
              <div className="text-left sm:text-right text-[11px] font-mono text-slate-700 shrink-0 bg-slate-50 print:bg-transparent p-2.5 sm:p-0 rounded border sm:border-0 border-slate-200 w-full sm:w-auto">
                <div className="flex justify-between sm:block gap-2">
                  <span className="text-slate-500 sm:text-slate-600">Tanggal: </span>
                  <span className="font-semibold text-slate-900">{metadata.date}</span>
                </div>
                <div className="flex justify-between sm:block gap-2 mt-0.5">
                  <span className="text-slate-500 sm:text-slate-600">No. Bukti: </span>
                  <span className="font-semibold text-slate-900">{metadata.refId}</span>
                </div>
              </div>
            </div>

            {/* Form Metadata Transaksi (Editable on screen) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 print:bg-slate-50/50 p-3.5 rounded border border-slate-200 text-xs print-avoid-break">
              <div>
                <span className="text-slate-500 text-[11px] block">Penerima / Nama Rekanan:</span>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-emerald-600 outline-none w-full print:border-none"
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
                  className="font-medium text-slate-800 bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-emerald-600 outline-none w-full print:border-none"
                />
              </div>
            </div>

            {/* Table Breakdown */}
            <div className="border border-slate-300 rounded overflow-x-auto w-full print:overflow-visible print:border-slate-400">
              <table className="w-full text-xs min-w-[480px] print:min-w-0">
                <thead className="bg-slate-100 text-slate-800 border-b border-slate-300">
                  <tr>
                    <th className="py-2 px-3 text-left font-bold w-8">No</th>
                    <th className="py-2 px-3 text-left font-bold">Uraian Komponen Pembayaran & Pajak</th>
                    <th className="py-2 px-3 text-center font-bold w-16">Tarif</th>
                    <th className="py-2 px-3 text-right font-bold w-36">Dasar Perhitungan (Rp)</th>
                    <th className="py-2 px-3 text-right font-bold w-36">Nominal (Rp)</th>
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
                  <tr className="bg-rose-50/40 print:bg-rose-50/20">
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
                    <tr className="bg-amber-50/40 print:bg-amber-50/20">
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
                  <tr className="bg-emerald-50 print:bg-emerald-50/40 text-emerald-950 font-extrabold text-sm border-t-2 border-emerald-600">
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
            <div className="bg-slate-50 print:bg-slate-50/50 border border-slate-200 rounded p-3 text-xs print-avoid-break">
              <span className="font-bold text-slate-800">Terbilang Bersih:</span>
              <div className="font-semibold text-emerald-900 italic mt-0.5">
                &ldquo;{terbilangNet}&rdquo;
              </div>
            </div>

            {/* Signatures Area */}
            <div className="pt-6 grid grid-cols-3 text-center text-xs text-slate-700 gap-4 print-avoid-break">
              <div>
                <div className="text-[11px] text-slate-500 mb-12">Menyetujui,</div>
                <div className="border-t border-slate-400 inline-block px-2 pt-1 font-semibold text-slate-900 w-full text-[11px]">
                  Pejabat Pembuat Komitmen (PPK)
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 mb-12">Lunas Dibayar Oleh,</div>
                <div className="border-t border-slate-400 inline-block px-2 pt-1 font-semibold text-slate-900 w-full text-[11px]">
                  Bendahara Pengeluaran
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 mb-12">Diterima Bersih Oleh,</div>
                <div className="border-t border-slate-400 inline-block px-2 pt-1 font-semibold text-slate-900 w-full text-[11px]">
                  Penyedia / Rekanan
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar (hidden on print) */}
        <div className="bg-slate-100 border-t border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between print:hidden gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
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

            <button
              onClick={handleDownloadPrintableHTML}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-xs font-semibold text-emerald-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Unduh Dokumen Siap Cetak</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
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
