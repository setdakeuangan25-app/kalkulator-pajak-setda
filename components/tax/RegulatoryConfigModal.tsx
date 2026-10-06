'use client';

import React, { useState, useEffect } from 'react';
import {
  TaxRegulationConfig,
  DEFAULT_TAX_CONFIG,
  loadStoredConfig,
  saveStoredConfig,
  resetConfigToDefaults,
  CustomTaxPreset,
} from '@/lib/tax/tax-config-store';
import {
  Sliders,
  X,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';

interface RegulatoryConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
}

export const RegulatoryConfigModal: React.FC<RegulatoryConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  if (!isOpen) return null;

  return (
    <RegulatoryConfigDialog onClose={onClose} onConfigSaved={onConfigSaved} />
  );
};

const RegulatoryConfigDialog: React.FC<{
  onClose: () => void;
  onConfigSaved?: () => void;
}> = ({ onClose, onConfigSaved }) => {
  const [config, setConfig] = useState<TaxRegulationConfig>(() => loadStoredConfig());
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // New preset form
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [newPresetRate, setNewPresetRate] = useState<number>(2.5);
  const [newPresetRateNonNPWP, setNewPresetRateNonNPWP] = useState<number>(3.0);
  const [newPresetUsePPN, setNewPresetUsePPN] = useState<boolean>(true);
  const [newPresetDesc, setNewPresetDesc] = useState<string>('');

  const handleSave = () => {
    saveStoredConfig(config);
    setSaveSuccess(true);
    if (onConfigSaved) onConfigSaved();
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    if (confirm('Kembalikan seluruh konfigurasi tarif ke regulasi resmi default pemerintah?')) {
      const def = resetConfigToDefaults();
      setConfig(def);
      if (onConfigSaved) onConfigSaved();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1500);
    }
  };

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(config, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `regulasi_pajak_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed.ppnRate === 'number') {
          saveStoredConfig(parsed);
          setConfig(parsed);
          alert('Konfigurasi regulasi berhasil diimpor!');
          if (onConfigSaved) onConfigSaved();
        } else {
          alert('Format file JSON tidak sesuai.');
        }
      } catch {
        alert('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleAddPreset = () => {
    if (!newPresetName.trim()) {
      alert('Mohon isi nama aturan/tarif pajak baru.');
      return;
    }
    const id = `custom_${Date.now()}`;
    const newPreset: CustomTaxPreset = {
      id,
      name: newPresetName.trim(),
      rateWithNPWP: newPresetRate,
      rateNoNPWP: newPresetRateNonNPWP,
      defaultPPN: newPresetUsePPN,
      ppnMode: 'include',
      desc: newPresetDesc.trim() || 'Tarif kustom baru',
    };

    const updated = {
      ...config,
      manualPresets: [...config.manualPresets, newPreset],
    };
    setConfig(updated);
    setNewPresetName('');
    setNewPresetDesc('');
  };

  const handleDeletePreset = (id: string) => {
    const updated = {
      ...config,
      manualPresets: config.manualPresets.filter((p) => p.id !== id),
    };
    setConfig(updated);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold tracking-tight">
              Pembaruan & Pengaturan Regulasi Pajak Dinamis
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto text-xs text-slate-800 flex-1">
          {/* Info Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 flex items-start gap-3 text-emerald-950">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">
                Pembaruan Fleksibel Tanpa Perlu Merombak Kode Program
              </div>
              <p className="mt-0.5 text-emerald-800 leading-relaxed text-[11px]">
                Jika pemerintah menerbitkan peraturan baru (misal PPN naik menjadi 12%,
                penyesuaian tarif PPh, atau penambahan objek pajak baru), Anda dapat langsung
                mengubah persentase atau menambah aturan baru di sini. Pengaturan otomatis tersimpan
                di peramban Anda.
              </p>
            </div>
          </div>

          {/* Section 1: Parameter Pokok */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1.5">
              1. Tarif Pokok Nasional (PPN & PPh Umum)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* PPN */}
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                <label className="font-semibold text-slate-800 block">
                  Tarif Pajak Pertambahan Nilai (PPN)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={config.ppnRate}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          ppnRate: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full py-1.5 pl-3 pr-7 border border-slate-300 rounded bg-white text-xs font-mono font-bold outline-none focus:border-emerald-600"
                    />
                    <span className="absolute right-2.5 top-2 text-slate-400 font-mono text-xs">
                      %
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 whitespace-nowrap">
                    (Saat ini 11%, UU HPP 12%)
                  </span>
                </div>
              </div>

              {/* PPh Final UMKM */}
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                <label className="font-semibold text-slate-800 block">
                  Tarif PPh Final UMKM (PP 55/2022)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={config.umkmRate}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          umkmRate: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full py-1.5 pl-3 pr-7 border border-slate-300 rounded bg-white text-xs font-mono font-bold outline-none focus:border-emerald-600"
                    />
                    <span className="absolute right-2.5 top-2 text-slate-400 font-mono text-xs">
                      %
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 whitespace-nowrap">
                    (Default: 0,5%)
                  </span>
                </div>
              </div>

              {/* PPh Badan */}
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                <label className="font-semibold text-slate-800 block">
                  Tarif Normal PPh Badan
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={config.corporateRate}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          corporateRate: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full py-1.5 pl-3 pr-7 border border-slate-300 rounded bg-white text-xs font-mono font-bold outline-none focus:border-emerald-600"
                    />
                    <span className="absolute right-2.5 top-2 text-slate-400 font-mono text-xs">
                      %
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 whitespace-nowrap">
                    (Default: 22%)
                  </span>
                </div>
              </div>

              {/* Batas Bebas Pajak UMKM OP */}
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                <label className="font-semibold text-slate-800 block">
                  Batas Omzet Bebas Pajak UMKM OP
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400 font-mono text-xs">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={config.umkmExemptLimit.toLocaleString('id-ID')}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '');
                      setConfig({
                        ...config,
                        umkmExemptLimit: clean === '' ? 0 : parseInt(clean, 10),
                      });
                    }}
                    className="w-full py-1.5 pl-8 pr-3 border border-slate-300 rounded bg-white text-xs font-mono font-bold outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Daftar Preset Tarif Pembelian & Jasa */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-1.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                2. Daftar Tarif Pemotongan Transaksi & Kwitansi
              </h4>
              <span className="text-[11px] text-slate-500">
                {config.manualPresets.length} Tarif Tersedia (Bisa langsung diedit angkanya di bawah)
              </span>
            </div>

            <div className="border border-slate-200 rounded overflow-x-auto w-full">
              <table className="w-full text-xs min-w-[560px]">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 text-left font-semibold">Nama Aturan / Pajak</th>
                    <th className="py-2 px-2 text-center font-semibold w-24">NPWP (%)</th>
                    <th className="py-2 px-2 text-center font-semibold w-24">Non-NPWP (%)</th>
                    <th className="py-2 px-2 text-center font-semibold w-24">Ketentuan PPN</th>
                    <th className="py-2 px-2 text-center font-semibold w-12">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {config.manualPresets.map((preset) => (
                    <tr key={preset.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-medium text-slate-800">
                        {preset.name}
                        <span className="block text-[10px] text-slate-400">{preset.desc}</span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <div className="relative inline-block w-20">
                          <input
                            type="number"
                            step="0.05"
                            value={preset.rateWithNPWP}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setConfig({
                                ...config,
                                manualPresets: config.manualPresets.map((p) =>
                                  p.id === preset.id ? { ...p, rateWithNPWP: val } : p
                                ),
                              });
                            }}
                            className="w-full py-1 pr-4 pl-1.5 border border-slate-300 rounded text-center font-mono font-bold text-emerald-800 bg-white text-xs outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            title="Edit persentase ber-NPWP"
                          />
                          <span className="absolute right-1.5 top-1 text-slate-400 font-mono text-[11px] pointer-events-none">
                            %
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <div className="relative inline-block w-20">
                          <input
                            type="number"
                            step="0.05"
                            value={preset.rateNoNPWP}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setConfig({
                                ...config,
                                manualPresets: config.manualPresets.map((p) =>
                                  p.id === preset.id ? { ...p, rateNoNPWP: val } : p
                                ),
                              });
                            }}
                            className="w-full py-1 pr-4 pl-1.5 border border-slate-300 rounded text-center font-mono text-rose-700 bg-white text-xs outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            title="Edit persentase tanpa NPWP"
                          />
                          <span className="absolute right-1.5 top-1 text-slate-400 font-mono text-[11px] pointer-events-none">
                            %
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setConfig({
                              ...config,
                              manualPresets: config.manualPresets.map((p) =>
                                p.id === preset.id ? { ...p, defaultPPN: !p.defaultPPN } : p
                              ),
                            });
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                            preset.defaultPPN
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                          title="Klik untuk mengubah aturan default PPN"
                        >
                          {preset.defaultPPN ? 'Gunakan PPN' : 'Non-PPN'}
                        </button>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeletePreset(preset.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus tarif ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Form Tambah Tarif Baru */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2.5">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tambah Aturan / Tarif Pajak Baru ke Daftar:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Nama Potongan (misal: PPh Pasal 22 Industri 0.25%)"
                    className="w-full py-1.5 px-2.5 border border-slate-300 rounded bg-white text-xs outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="0.05"
                    value={newPresetRate}
                    onChange={(e) => setNewPresetRate(parseFloat(e.target.value) || 0)}
                    placeholder="Tarif NPWP %"
                    className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white text-xs font-mono outline-none focus:border-emerald-600"
                    title="Tarif ber-NPWP (%)"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="0.05"
                    value={newPresetRateNonNPWP}
                    onChange={(e) => setNewPresetRateNonNPWP(parseFloat(e.target.value) || 0)}
                    placeholder="Tarif Non-NPWP %"
                    className="w-full py-1.5 px-2 border border-slate-300 rounded bg-white text-xs font-mono outline-none focus:border-emerald-600"
                    title="Tarif tanpa NPWP (%)"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
                <input
                  type="text"
                  value={newPresetDesc}
                  onChange={(e) => setNewPresetDesc(e.target.value)}
                  placeholder="Keterangan singkat / dasar hukum aturan baru ini"
                  className="w-full sm:w-2/3 py-1.5 px-2.5 border border-slate-300 rounded bg-white text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddPreset}
                  className="w-full sm:w-auto px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-xs flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambahkan ke Daftar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Backup, Import, and Reset Area */}
          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="px-3 py-1.5 border border-slate-300 rounded bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 text-xs font-medium transition-colors"
                title="Cadangkan aturan pajak ke file JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor File JSON</span>
              </button>

              <label className="px-3 py-1.5 border border-slate-300 rounded bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Impor File JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 text-rose-700 hover:bg-rose-50 rounded border border-rose-200 flex items-center gap-1.5 text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset ke Standar Pemerintah</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            {saveSuccess ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Perubahan tersimpan dan aktif!
              </span>
            ) : (
              <span>Pengaturan disimpan permanen di penyimpanan peramban.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan & Terapkan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
