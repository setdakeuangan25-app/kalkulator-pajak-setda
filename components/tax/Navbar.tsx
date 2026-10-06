'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  Calculator,
  Printer,
  ShieldCheck,
  Sliders,
  SlidersHorizontal,
  User,
  Briefcase,
  Store,
  Building2,
  Receipt,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPrintSlip: () => void;
  onOpenConfigModal: () => void;
  onSelectPreset: (presetId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenPrintSlip,
  onOpenConfigModal,
  onSelectPreset,
}) => {
  const navTabs = [
    { id: 'manual', label: 'Perhitungan Manual & PPN', icon: SlidersHorizontal },
    { id: 'pph21', label: 'PPh 21 Karyawan', icon: User },
    { id: 'freelancer', label: 'PPh 21 Tenaga Ahli', icon: Briefcase },
    { id: 'umkm', label: 'PPh Final UMKM', icon: Store },
    { id: 'badan', label: 'PPh Badan (31E)', icon: Building2 },
    { id: 'ppn_pph23', label: 'PPN & PPh 23', icon: Receipt },
    { id: 'regulasi', label: 'Tabel TER & Regulasi', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-30 w-full min-w-0 bg-white/70 backdrop-blur-2xl border-b border-white/60 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all">
      {/* Upper regulatory notice bar with dark frosted glass */}
      <div className="bg-slate-900/90 backdrop-blur-xl text-slate-300 text-[11px] sm:text-xs px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 w-full min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            Regulasi Resmi Berlaku
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="text-slate-400 text-[10px] sm:text-[11px] truncate max-w-full">
            UU HPP No. 7/2021 · PP 58/2023 · PMK 168/2023 · PP 55/2022
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 shrink-0">
          <button
            onClick={onOpenConfigModal}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors underline cursor-pointer text-[11px] sm:text-xs font-medium"
          >
            <Sliders className="w-3 h-3 shrink-0" />
            <span>Kelola Regulasi Dinamis</span>
          </button>
        </div>
      </div>

      {/* Main Top Header Bar: Wordmark (Left) & Actions (Right) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-2.5 sm:py-3 gap-3 flex-wrap w-full min-w-0">
        {/* Wordmark with Apple glass badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white flex items-center justify-center font-bold text-base shadow-md shadow-emerald-700/20 ring-1 ring-white/30 shrink-0">
            <Calculator className="w-5 h-5 text-emerald-100" />
          </div>
          <div className="min-w-0">
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-tight block truncate">
              Kalkulator Pajak RI
            </span>
            <span className="text-[10px] text-slate-500 font-medium leading-none block mt-0.5 truncate">
              Simulasi & Perhitungan Pajak Akurat Terintegrasi
            </span>
          </div>
        </div>

        {/* Action Controls with Frosted Glass look */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {/* Quick preset selector */}
          <div className="min-w-0">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onSelectPreset(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="text-xs border border-white/80 rounded-xl bg-white/80 backdrop-blur-md text-slate-700 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer shadow-2xs max-w-[170px] sm:max-w-[210px] md:max-w-xs truncate transition-all hover:bg-white"
            >
              <option value="" disabled>
                Pilih Skenario Cepat...
              </option>
              <option value="manual_pengadaan">Belanja Barang Pemda (Rp 22,2 Jt + PPN & PPh 22)</option>
              <option value="manual_pph21_25">Honorarium Kegiatan (Rp 10 Jt + PPh 21 2,5%)</option>
              <option value="karyawan_tk0">Karyawan Baru (Rp 8.500.000, TK/0)</option>
              <option value="karyawan_k1">Supervisor (Rp 15.000.000, K/1 + THR)</option>
              <option value="manager_k2">Manager (Rp 30.000.000, K/2)</option>
              <option value="freelancer">Freelancer Konsultan IT (Rp 45.000.000)</option>
              <option value="umkm">UMKM Toko Retail (Omzet Rp 750 Jt/Thn)</option>
              <option value="badan">PT Perdagangan (Omzet Rp 3,2 Miliar)</option>
            </select>
          </div>

          <motion.button
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenConfigModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50/90 hover:bg-emerald-100/90 border border-emerald-300/80 rounded-xl transition-all whitespace-nowrap cursor-pointer shadow-2xs backdrop-blur-sm shrink-0"
            title="Kelola & Perbarui Tarif Tanpa Rombak Kode"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="hidden sm:inline">Update Regulasi</span>
            <span className="sm:hidden">Regulasi</span>
          </motion.button>

          <motion.button
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenPrintSlip}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-800 bg-white/80 hover:bg-white border border-slate-200/80 rounded-xl transition-all whitespace-nowrap cursor-pointer shadow-2xs backdrop-blur-sm shrink-0"
            title="Cetak atau unduh slip ringkasan perhitungan pajak"
          >
            <Printer className="w-3.5 h-3.5 text-slate-700 shrink-0" />
            <span>Slip / Ekspor</span>
          </motion.button>
        </div>
      </div>

      {/* Dedicated Menu Bar: Apple Dock / Segmented Control style */}
      <div className="border-t border-white/50 bg-slate-100/40 backdrop-blur-xl w-full min-w-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
          <nav className="flex items-center gap-1.5 overflow-x-auto py-2 text-xs w-full min-w-0 touch-pan-x scrollbar-none">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 text-xs ${
                    isActive
                      ? 'text-white font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {/* Sliding Motion Pill Background for Active Tab */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl shadow-md -z-10 border border-slate-700/60"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                      isActive ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  />
                  <span className="relative z-10">{tab.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

