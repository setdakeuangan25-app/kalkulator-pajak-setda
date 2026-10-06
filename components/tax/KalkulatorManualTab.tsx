'use client';

import React, { useState, useEffect } from 'react';
import { formatIDR, formatPercent } from '@/lib/tax/tax-calculator';
import { PrintManualSlipModal } from './PrintManualSlipModal';
import {
  TaxRegulationConfig,
  loadStoredConfig,
} from '@/lib/tax/tax-config-store';
import {
  SlidersHorizontal,
  Sliders,
  Receipt,
  FileCheck2,
  Copy,
  Check,
  Percent,
  CheckCircle2,
  Building,
  HelpCircle,
  RotateCcw,
  Printer,
  Info,
} from 'lucide-react';

interface KalkulatorManualTabProps {
  onOpenConfigModal?: () => void;
}

export const KalkulatorManualTab: React.FC<KalkulatorManualTabProps> = ({
  onOpenConfigModal,
}) => {
  // Load dynamic configuration from stored master data
  const [config, setConfig] = useState<TaxRegulationConfig>(() => loadStoredConfig());

  useEffect(() => {
    const handleConfigUpdated = () => {
      setConfig(loadStoredConfig());
    };
    window.addEventListener('tax-config-updated', handleConfigUpdated);
    return () => window.removeEventListener('tax-config-updated', handleConfigUpdated);
  }, []);

  // 1. Input Nilai Bruto
  const [grossInput, setGrossInput] = useState<number>(22_200_000);

  // 2. Pengaturan PPN (default dari config)
  const [usePPN, setUsePPN] = useState<boolean>(true);
  const [ppnMode, setPpnMode] = useState<'include' | 'exclude'>('include');
  const [userSelectedPpnRate, setUserSelectedPpnRate] = useState<number | null>(null);
  const ppnRatePercent = userSelectedPpnRate ?? config.ppnRate ?? 11;
  const [isWapu, setIsWapu] = useState<boolean>(true); // Pemungut PPN (Instansi Pemerintah / BUMN / WAPU)

  // 3. Pengaturan PPh
  const [taxBasis, setTaxBasis] = useState<'dpp' | 'bruto'>('dpp'); // Standar resmi: dari DPP
  const [hasNPWP, setHasNPWP] = useState<boolean>(true);
  const [pphPreset, setPphPreset] = useState<string>('pph22_15');
  const [customRate, setCustomRate] = useState<number>(1.5);
  const [taxName, setTaxName] = useState<string>('PPh 22 Belanja Barang Pemerintah (1,5%)');

  // 4. Pajak Tambahan / Daerah (Opsional)
  const [useSecondTax, setUseSecondTax] = useState<boolean>(false);
  const [secondTaxRate, setSecondTaxRate] = useState<number>(10);
  const [secondTaxName, setSecondTaxName] = useState<string>('Pajak Restoran / PB1');

  // Modal print state & copy feedback state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Preset Configurations menggabungkan Master Data Regulasi dinamis + Kustom
  const presets = [
    ...config.manualPresets,
    {
      id: 'custom',
      name: 'Tarif Kustom (Bebas Input Sendiri)',
      rateWithNPWP: customRate,
      rateNoNPWP: customRate,
      defaultPPN: usePPN,
      ppnMode: ppnMode,
      desc: 'Masukkan persentase tarif pajak sesuai kebutuhan khusus Anda',
    },
  ];

  // Active Rate determination
  const activePreset = presets.find((p) => p.id === pphPreset) || presets[0] || {
    id: 'custom',
    name: 'Tarif Pajak',
    rateWithNPWP: 1.5,
    rateNoNPWP: 3.0,
    defaultPPN: true,
    ppnMode: 'include' as const,
    desc: '',
  };

  let currentTaxRate =
    pphPreset === 'custom'
      ? customRate
      : hasNPWP
      ? activePreset.rateWithNPWP
      : activePreset.rateNoNPWP;

  // Handle Preset Change
  const handleSelectPreset = (presetId: string) => {
    setPphPreset(presetId);
    const sel = presets.find((p) => p.id === presetId);
    if (sel) {
      setTaxName(sel.name);
      if (presetId !== 'custom') {
        setCustomRate(sel.rateWithNPWP);
        setUsePPN(sel.defaultPPN);
        setPpnMode(sel.ppnMode);
      }
    }
  };

  // --- MATHEMATICAL TAX ENGINE ---
  let dpp = 0;
  let ppnAmount = 0;
  let totalContractValue = 0; // Total Nilai Tagihan (termasuk PPN jika ada)

  if (usePPN) {
    const rateDecimal = ppnRatePercent / 100;
    if (ppnMode === 'include') {
      // Nilai bruto input sudah mengandung PPN
      dpp = grossInput / (1 + rateDecimal);
      ppnAmount = grossInput - dpp;
      totalContractValue = grossInput;
    } else {
      // Nilai bruto input belum mengandung PPN
      dpp = grossInput;
      ppnAmount = dpp * rateDecimal;
      totalContractValue = dpp + ppnAmount;
    }
  } else {
    dpp = grossInput;
    ppnAmount = 0;
    totalContractValue = grossInput;
  }

  // Dasar perhitungan PPh
  const taxBasisAmount = taxBasis === 'dpp' ? dpp : totalContractValue;
  const pphAmount = taxBasisAmount * (currentTaxRate / 100);

  // Pajak Tambahan / Kedua
  const secondTaxAmount = useSecondTax ? dpp * (secondTaxRate / 100) : 0;

  // Total Potongan Pajak
  // Jika Bendahara / WAPU: PPN dipungut bendahara + PPh dipotong bendahara
  // Jika Non-WAPU: PPN dibayar ke rekanan, hanya PPh yang dipotong bendahara
  let totalDeductionByTreasurer = 0;
  let netDisbursementToVendor = 0;

  if (isWapu && usePPN) {
    totalDeductionByTreasurer = ppnAmount + pphAmount + secondTaxAmount;
    netDisbursementToVendor = totalContractValue - totalDeductionByTreasurer;
  } else {
    // Non-Wapu (PPN tidak dipotong kasir, hanya PPh dan pajak daerah)
    totalDeductionByTreasurer = pphAmount + secondTaxAmount;
    netDisbursementToVendor = totalContractValue - totalDeductionByTreasurer;
  }

  // Handle number input changes
  const handleGrossChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setGrossInput(clean === '' ? 0 : parseInt(clean, 10));
  };

  const handleCopySummary = () => {
    const text = `
RINCIAN PERHITUNGAN TRANSAKSI & PEMOTONGAN PAJAK
==================================================
Nilai Tagihan / Bruto: ${formatIDR(totalContractValue)}
Status PPN: ${usePPN ? `Ya (${ppnMode.toUpperCase()} PPN ${ppnRatePercent}%)` : 'Tanpa PPN'}
Dasar Pengenaan Pajak (DPP): ${formatIDR(dpp)}
--------------------------------------------------
1. PPN ${ppnRatePercent}% ${isWapu ? '(Dipungut Bendahara/WAPU)' : '(Dibayar ke Rekanan)'}: ${formatIDR(ppnAmount)}
2. ${taxName} (${formatPercent(currentTaxRate / 100)}): ${formatIDR(pphAmount)}
${useSecondTax ? `3. ${secondTaxName} (${secondTaxRate}%): ${formatIDR(secondTaxAmount)}\n` : ''}--------------------------------------------------
TOTAL POTONGAN PAJAK: ${formatIDR(totalDeductionByTreasurer)}
NET PEMBAYARAN KE REKANAN: ${formatIDR(netDisbursementToVendor)}
==================================================
Status Rekanan: ${hasNPWP ? 'Ber-NPWP (Tarif Normal)' : 'Non-NPWP (Tarif Lebih Tinggi)'}
Dasar PPh: ${taxBasis === 'dpp' ? 'Dari DPP (Sebelum PPN)' : 'Dari Total Bruto'}
Dihitung otomatis melalui Kalkulator Pajak RI
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 rounded-lg p-4 sm:p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <span className="text-xs font-semibold text-emerald-400">
            MODUL KHUSUS BENDAHARA, PENGADAAN & KEUANGAN
          </span>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
            Kalkulator Fleksibel: Bruto, PPh Pilihan & Simulasi PPN
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Hitung transaksi belanja, pengadaan, kwitansi, atau kontrak dengan input nilai bruto,
            pilihan pengenaan PPN (Include / Exclude), serta pemilihan tarif PPh fleksibel atau kustom.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenConfigModal && (
            <button
              onClick={onOpenConfigModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-medium transition-colors whitespace-nowrap cursor-pointer border border-slate-700 shadow-xs"
              title="Perbarui regulasi atau tambah tarif pajak baru tanpa rombak kode"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kelola / Tambah Tarif Baru</span>
            </button>
          )}
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors whitespace-nowrap cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Rincian</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs (5 cols) & Results (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full min-w-0">
        {/* LEFT COLUMN: Input Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-5 shadow-xs">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
              Parameter Transaksi & Pilihan Tarif
            </h3>
            <span className="text-[11px] text-slate-500">IDR (Rp)</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Input Nilai Bruto */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-800">
                  Nilai Bruto Transaksi / Nilai Tagihan (Rp)
                </label>
                <span className="font-mono text-emerald-700 font-bold">
                  {formatIDR(grossInput)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">
                  Rp
                </span>
                <input
                  type="text"
                  value={grossInput === 0 ? '' : grossInput.toLocaleString('id-ID')}
                  onChange={(e) => handleGrossChange(e.target.value)}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-slate-300 rounded focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                />
              </div>

              {/* Quick Preset Bruto */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  { label: 'Rp 2 Jt', val: 2_000_000 },
                  { label: 'Rp 5 Jt', val: 5_000_000 },
                  { label: 'Rp 22,2 Jt', val: 22_200_000 },
                  { label: 'Rp 50 Jt', val: 50_000_000 },
                  { label: 'Rp 100 Jt', val: 100_000_000 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setGrossInput(item.val)}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-mono transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SEKSI PPN: Menggunakan PPN atau Tidak */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">
                    Gunakan Pajak Pertambahan Nilai (PPN)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Aktifkan jika transaksi dikenai PPN
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUsePPN(!usePPN)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    usePPN ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                      usePPN ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {usePPN && (
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  {/* Status Harga: Include vs Exclude */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Status Nilai Bruto terhadap PPN
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPpnMode('include')}
                        className={`py-2 px-2.5 rounded border text-left transition-all ${
                          ppnMode === 'include'
                            ? 'border-emerald-600 bg-white ring-1 ring-emerald-600 font-bold text-slate-900'
                            : 'border-slate-200 bg-slate-100 text-slate-600'
                        }`}
                      >
                        <div className="text-xs">Sudah Termasuk PPN</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          Bruto = Nilai Akhir Kwitansi
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPpnMode('exclude')}
                        className={`py-2 px-2.5 rounded border text-left transition-all ${
                          ppnMode === 'exclude'
                            ? 'border-emerald-600 bg-white ring-1 ring-emerald-600 font-bold text-slate-900'
                            : 'border-slate-200 bg-slate-100 text-slate-600'
                        }`}
                      >
                        <div className="text-xs">Belum Termasuk PPN</div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          PPN ditambahkan di atas bruto
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Tarif PPN (11% / 12%) */}
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <div>
                      <label className="font-medium text-slate-700 block mb-1">
                        Tarif PPN Berlaku
                      </label>
                      <select
                        value={ppnRatePercent}
                        onChange={(e) => setUserSelectedPpnRate(parseFloat(e.target.value))}
                        className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white text-slate-800 focus:border-emerald-600 outline-none"
                      >
                        <option value={11}>11% (Regulasi Saat Ini)</option>
                        <option value={12}>12% (UU HPP Masa Depan)</option>
                        <option value={10}>10% (Regulasi Lama)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-medium text-slate-700 block mb-1">
                        Pemungut PPN
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsWapu(!isWapu)}
                        className={`w-full py-1.5 px-2 border rounded text-xs transition-colors ${
                          isWapu
                            ? 'border-emerald-600 bg-emerald-100/60 font-semibold text-emerald-900'
                            : 'border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        {isWapu ? 'Instansi / WAPU (Dipungut)' : 'Non-WAPU (Dibayar ke Rekanan)'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SEKSI PPH: Pilihan Tarif */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 block">
                  Pilih Tarif Pajak Penghasilan (PPh)
                </label>
                {onOpenConfigModal && (
                  <button
                    type="button"
                    onClick={onOpenConfigModal}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
                    title="Ubah tarif regulasi atau tambah tarif baru tanpa rombak kode"
                  >
                    <Sliders className="w-3 h-3 text-emerald-600" />
                    <span>Kelola / Tambah Tarif Baru</span>
                  </button>
                )}
              </div>

              {/* Preset Select Dropdown */}
              <select
                value={pphPreset}
                onChange={(e) => handleSelectPreset(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-slate-300 rounded bg-white text-slate-900 font-medium focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none cursor-pointer"
              >
                {presets.map((p) => {
                  const rateLabel =
                    p.id === 'custom'
                      ? 'Bebas Input (%)'
                      : `${hasNPWP ? p.rateWithNPWP : p.rateNoNPWP}%`;
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} ({rateLabel})
                    </option>
                  );
                })}
              </select>

              {/* Input Custom Rate if Custom selected */}
              {pphPreset === 'custom' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/60 border border-amber-200 rounded">
                  <div>
                    <label className="font-medium text-amber-900 block mb-1">
                      Nama Potongan Pajak
                    </label>
                    <input
                      type="text"
                      value={taxName}
                      onChange={(e) => setTaxName(e.target.value)}
                      placeholder="Contoh: PPh 21 Tenaga Ahli"
                      className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white text-xs outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-amber-900 block mb-1">
                      Besaran Tarif (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="100"
                        value={customRate}
                        onChange={(e) => setCustomRate(parseFloat(e.target.value) || 0)}
                        className="w-full py-1.5 pl-2 pr-6 border border-slate-300 rounded bg-white text-xs font-mono outline-none focus:border-emerald-600"
                      />
                      <span className="absolute right-2 top-2 text-slate-400 font-mono text-xs">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dasar Pengenaan PPh (Dari DPP vs Dari Total Bruto) */}
              {usePPN && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="font-semibold text-slate-700">Dasar Hitung PPh</span>
                    <span className="text-[10px] text-slate-500 block">
                      Standar aturan perpajakan: PPh dipotong dari DPP (sebelum PPN)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setTaxBasis('dpp')}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                        taxBasis === 'dpp'
                          ? 'bg-white text-slate-900 font-bold shadow-xs'
                          : 'text-slate-600'
                      }`}
                    >
                      Dari DPP
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaxBasis('bruto')}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                        taxBasis === 'bruto'
                          ? 'bg-white text-slate-900 font-bold shadow-xs'
                          : 'text-slate-600'
                      }`}
                    >
                      Dari Bruto
                    </button>
                  </div>
                </div>
              )}

              {/* Status NPWP Rekanan */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <div>
                  <div className="font-semibold text-slate-800">
                    Status Kepemilikan NPWP / NIK Terdaftar
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {hasNPWP
                      ? `Tarif normal diterapkan: ${currentTaxRate}%`
                      : `Tanpa NPWP dikenakan tarif lebih tinggi: ${currentTaxRate}%`}
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

              {/* Optional: Second Tax (Pajak Daerah / PB1 / Retribusi) */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800">
                      Tambah Pajak Tambahan / Daerah (Opsional)
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Misal: Pajak Restoran (PB1 10%), Retribusi, atau Iuran
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseSecondTax(!useSecondTax)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      useSecondTax ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                        useSecondTax ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {useSecondTax && (
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded">
                    <div>
                      <input
                        type="text"
                        value={secondTaxName}
                        onChange={(e) => setSecondTaxName(e.target.value)}
                        placeholder="Nama Pajak"
                        className="w-full py-1 px-2 border border-slate-300 rounded text-xs bg-white outline-none"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        value={secondTaxRate}
                        onChange={(e) => setSecondTaxRate(parseFloat(e.target.value) || 0)}
                        placeholder="10"
                        className="w-full py-1 pl-2 pr-5 border border-slate-300 rounded text-xs font-mono bg-white outline-none"
                      />
                      <span className="absolute right-2 top-1.5 text-slate-400 font-mono text-xs">
                        %
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Results & Treasury Slip */}
        <div className="lg:col-span-7 space-y-4 min-w-0 w-full">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {/* Total Kontrak / Bruto */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 min-w-0">
              <span className="text-[11px] text-slate-500 block truncate">Nilai Tagihan</span>
              <span
                className="text-sm sm:text-base xl:text-lg font-bold font-mono text-slate-900 block mt-1 tabular-nums truncate"
                title={formatIDR(totalContractValue)}
              >
                {formatIDR(totalContractValue)}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block truncate">
                {usePPN ? `${ppnMode.toUpperCase()} PPN` : 'Tanpa PPN'}
              </span>
            </div>

            {/* Nilai DPP */}
            <div className="bg-white border border-slate-200 rounded-lg p-3.5 min-w-0">
              <span className="text-[11px] text-slate-500 block truncate">Dasar Pengenaan (DPP)</span>
              <span
                className="text-sm sm:text-base xl:text-lg font-bold font-mono text-slate-700 block mt-1 tabular-nums truncate"
                title={formatIDR(dpp)}
              >
                {formatIDR(dpp)}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block truncate">Sebelum PPN</span>
            </div>

            {/* Total Potongan */}
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3.5 min-w-0">
              <span className="text-[11px] text-rose-800 font-medium block truncate">
                Total Potongan Pajak
              </span>
              <span
                className="text-sm sm:text-base xl:text-lg font-bold font-mono text-rose-700 block mt-1 tabular-nums truncate"
                title={formatIDR(totalDeductionByTreasurer)}
              >
                {formatIDR(totalDeductionByTreasurer)}
              </span>
              <span className="text-[10px] text-rose-600 mt-1 block truncate">
                {usePPN && isWapu ? 'PPN + PPh' : 'Hanya PPh'}
              </span>
            </div>

            {/* Net Payment */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 min-w-0">
              <span className="text-[11px] text-emerald-800 font-medium block truncate">
                Transfer ke Rekanan
              </span>
              <span
                className="text-sm sm:text-base xl:text-lg font-bold font-mono text-emerald-950 block mt-1 tabular-nums truncate"
                title={formatIDR(netDisbursementToVendor)}
              >
                {formatIDR(netDisbursementToVendor)}
              </span>
              <span className="text-[10px] text-emerald-700 mt-1 block truncate">
                Net Pembayaran (SP2D)
              </span>
            </div>
          </div>

          {/* Detailed Statement Table */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-xs min-w-0 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Rincian SPM / Kwitansi Pemotongan Pajak
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Format rincian standar pengadaan barang/jasa dan bendahara pengeluaran
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 font-medium transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Rincian</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="flex items-center gap-1 text-xs text-emerald-800 hover:text-emerald-950 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-300 font-semibold transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Cetak Kwitansi</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="border border-slate-200 rounded overflow-x-auto text-xs w-full">
              <table className="w-full min-w-[500px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <tr>
                    <th className="py-2.5 px-3 text-left font-semibold">Uraian Transaksi & Pajak</th>
                    <th className="py-2.5 px-3 text-center font-semibold">Tarif</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Dasar Perhitungan (Rp)</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Nominal (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Total Tagihan */}
                  <tr>
                    <td className="py-2 px-3 text-slate-800 font-medium">
                      1. Nilai Bruto Transaksi
                    </td>
                    <td className="py-2 px-3 text-center text-slate-500">-</td>
                    <td className="py-2 px-3 text-right text-slate-500 font-mono">
                      {usePPN && ppnMode === 'include' ? 'Include PPN' : 'Exclude PPN'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatIDR(totalContractValue)}
                    </td>
                  </tr>

                  {/* DPP */}
                  <tr className="bg-slate-50/50">
                    <td className="py-2 px-3 text-slate-700">
                      2. Dasar Pengenaan Pajak (DPP)
                    </td>
                    <td className="py-2 px-3 text-center text-slate-500">
                      {usePPN ? `100/${100 + ppnRatePercent}` : '100%'}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-500 font-mono">
                      {formatIDR(totalContractValue)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-medium text-slate-900 tabular-nums">
                      {formatIDR(dpp)}
                    </td>
                  </tr>

                  {/* PPN */}
                  {usePPN ? (
                    <tr className="bg-blue-50/40">
                      <td className="py-2 px-3 text-blue-950 font-medium">
                        3. PPN Terutang ({ppnRatePercent}%)
                        <span className="block text-[10px] text-blue-700">
                          {isWapu
                            ? '• Dipungut Bendahara (WAPU) & Disetor ke Kas Negara'
                            : '• Dibayarkan ke Rekanan PKP'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-semibold text-blue-900">
                        {ppnRatePercent}%
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600 font-mono tabular-nums">
                        {formatIDR(dpp)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-blue-900 tabular-nums">
                        {formatIDR(ppnAmount)}
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td className="py-2 px-3 text-slate-400">3. PPN</td>
                      <td className="py-2 px-3 text-center text-slate-400">0%</td>
                      <td className="py-2 px-3 text-right text-slate-400">-</td>
                      <td className="py-2 px-3 text-right text-slate-400 font-mono">Rp 0 (Non-PPN)</td>
                    </tr>
                  )}

                  {/* PPh */}
                  <tr className="bg-rose-50/40">
                    <td className="py-2 px-3 text-rose-950 font-medium">
                      4. {taxName}
                      <span className="block text-[10px] text-rose-700">
                        • Dasar: {taxBasis === 'dpp' ? 'DPP (Sebelum PPN)' : 'Nilai Bruto'}
                        {!hasNPWP ? ' (Tanpa NPWP)' : ''}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-semibold text-rose-900">
                      {currentTaxRate}%
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600 font-mono tabular-nums">
                      {formatIDR(taxBasisAmount)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-rose-700 tabular-nums">
                      -{formatIDR(pphAmount)}
                    </td>
                  </tr>

                  {/* Second Tax if any */}
                  {useSecondTax && (
                    <tr className="bg-amber-50/40">
                      <td className="py-2 px-3 text-amber-950 font-medium">
                        5. {secondTaxName}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-semibold text-amber-900">
                        {secondTaxRate}%
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600 font-mono tabular-nums">
                        {formatIDR(dpp)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-amber-800 tabular-nums">
                        -{formatIDR(secondTaxAmount)}
                      </td>
                    </tr>
                  )}

                  {/* Summary Rows */}
                  <tr className="bg-slate-100 font-semibold text-slate-900 border-t border-slate-300">
                    <td colSpan={3} className="py-2 px-3">
                      TOTAL POTONGAN PAJAK OLEH BENDAHARA / KASIR
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-rose-700 tabular-nums">
                      {formatIDR(totalDeductionByTreasurer)}
                    </td>
                  </tr>

                  <tr className="bg-emerald-100/80 font-bold text-emerald-950 text-sm border-t-2 border-emerald-600">
                    <td colSpan={3} className="py-2.5 px-3">
                      JUMLAH BERSIH DIBAYARKAN KE REKANAN (NET PAYMENT)
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {formatIDR(netDisbursementToVendor)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Government / Treasury Accounting Rules Reminder */}
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-700 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Info className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ketentuan Pemotongan & Pemungutan Pajak oleh Instansi Pemerintah:</span>
              </div>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-1 leading-relaxed text-[11px]">
                <li>
                  <strong>PPh Pasal 22:</strong> Dipungut sebesar <strong>1,5%</strong> atas pembelian barang
                  dengan nilai di atas Rp 2.000.000 (tidak termasuk PPN). Transaksi di bawah Rp 2 Juta tidak dipungut PPh 22.
                </li>
                <li>
                  <strong>PPh Pasal 23:</strong> Dipotong sebesar <strong>2%</strong> atas imbalan jasa
                  (konsultan, sewa peralatan, perbaikan, katering, dll) dari nilai DPP tanpa batas nominal minimal.
                </li>
                <li>
                  <strong>PPN Instansi Pemerintah (PMK 59/2022):</strong> Bendahara pemerintah memungut PPN 11%
                  untuk pembayaran di atas Rp 2.000.000 (termasuk PPN).
                </li>
                <li>
                  <strong>Dasar Pengenaan PPh:</strong> Selalu dihitung dari <strong>DPP (Dasar Pengenaan Pajak)</strong>,
                  bukan dari nilai bruto yang sudah bercampur PPN.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Manual Slip Modal */}
      <PrintManualSlipModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        data={{
          totalContractValue,
          dpp,
          usePPN,
          ppnMode,
          ppnRatePercent,
          ppnAmount,
          isWapu,
          taxName,
          currentTaxRate,
          taxBasis,
          taxBasisAmount,
          pphAmount,
          hasNPWP,
          useSecondTax,
          secondTaxName,
          secondTaxRate,
          secondTaxAmount,
          totalDeductionByTreasurer,
          netDisbursementToVendor,
        }}
      />
    </div>
  );
};
