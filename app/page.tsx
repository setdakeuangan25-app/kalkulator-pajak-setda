'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from '@/components/tax/Navbar';
import { PPh21KaryawanTab } from '@/components/tax/PPh21KaryawanTab';
import { KalkulatorManualTab } from '@/components/tax/KalkulatorManualTab';
import { PPh21FreelancerTab } from '@/components/tax/PPh21FreelancerTab';
import { UMKMTab } from '@/components/tax/UMKMTab';
import { PPhBadanTab } from '@/components/tax/PPhBadanTab';
import { PPNTab } from '@/components/tax/PPNTab';
import { RegulasiTab } from '@/components/tax/RegulasiTab';
import { PrintSlipModal } from '@/components/tax/PrintSlipModal';
import { RegulatoryConfigModal } from '@/components/tax/RegulatoryConfigModal';
import { EmployeeSalaryInput } from '@/lib/tax/tax-calculator';
import { ShieldCheck, Sparkles } from 'lucide-react';

export default function TaxCalculatorPage() {
  const [activeTab, setActiveTab] = useState<string>('manual');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);

  // Shared state for Employee Salary Input
  const [salaryInput, setSalaryInput] = useState<EmployeeSalaryInput>({
    baseSalary: 10_000_000,
    allowanceFixed: 1_500_000,
    allowanceVariable: 500_000,
    overtimeBonus: 0,
    hasNPWP: true,
    statusPTKP: 'TK/0',
    includeBPJS: true,
    method: 'gross',
    annualBonusTHR: 10_000_000,
    monthsWorkedPerYear: 12,
  });

  const handleSelectPreset = (presetId: string) => {
    if (presetId === 'karyawan_tk0') {
      setActiveTab('pph21');
      setSalaryInput({
        baseSalary: 8_500_000,
        allowanceFixed: 1_000_000,
        allowanceVariable: 500_000,
        overtimeBonus: 0,
        hasNPWP: true,
        statusPTKP: 'TK/0',
        includeBPJS: true,
        method: 'gross',
        annualBonusTHR: 8_500_000,
        monthsWorkedPerYear: 12,
      });
    } else if (presetId === 'karyawan_k1') {
      setActiveTab('pph21');
      setSalaryInput({
        baseSalary: 15_000_000,
        allowanceFixed: 2_500_000,
        allowanceVariable: 1_000_000,
        overtimeBonus: 1_500_000,
        hasNPWP: true,
        statusPTKP: 'K/1',
        includeBPJS: true,
        method: 'gross',
        annualBonusTHR: 17_500_000,
        monthsWorkedPerYear: 12,
      });
    } else if (presetId === 'manager_k2') {
      setActiveTab('pph21');
      setSalaryInput({
        baseSalary: 30_000_000,
        allowanceFixed: 5_000_000,
        allowanceVariable: 2_000_000,
        overtimeBonus: 0,
        hasNPWP: true,
        statusPTKP: 'K/2',
        includeBPJS: true,
        method: 'gross_up',
        annualBonusTHR: 35_000_000,
        monthsWorkedPerYear: 12,
      });
    } else if (presetId === 'manual_pengadaan' || presetId === 'manual_pph21_25') {
      setActiveTab('manual');
    } else if (presetId === 'freelancer') {
      setActiveTab('freelancer');
    } else if (presetId === 'umkm') {
      setActiveTab('umkm');
    } else if (presetId === 'badan') {
      setActiveTab('badan');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80 flex flex-col font-sans relative overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* Ambient Liquid Glass Mesh Orbs */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-emerald-300/25 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="fixed top-24 -right-40 w-[28rem] h-[28rem] bg-blue-300/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/2 left-1/3 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed -bottom-40 right-1/4 w-[30rem] h-[30rem] bg-emerald-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Bar Component */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPrintSlip={() => setIsPrintModalOpen(true)}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
        onSelectPreset={handleSelectPreset}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-w-0">
        {/* Navigation Breadcrumb & Quick Info Glass Card */}
        <div className="mb-6 glass-surface rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 shadow-xs border border-white/80">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Modul Aktif:</span>
            <span className="font-medium text-slate-700">
              {activeTab === 'manual' && 'Perhitungan Manual Bruto, Pilihan Tarif & PPN'}
              {activeTab === 'pph21' && 'PPh 21 Karyawan Tetap (TER PP 58/2023 & Ps. 17)'}
              {activeTab === 'freelancer' && 'PPh 21 Bukan Pegawai / Tenaga Ahli (PMK 168/2023)'}
              {activeTab === 'umkm' && 'PPh Final UMKM 0,5% (PP 55/2022)'}
              {activeTab === 'badan' && 'PPh Badan & Fasilitas Pengurangan Tarif (Pasal 31E)'}
              {activeTab === 'ppn_pph23' && 'PPN 11%/12%, PPh 23 & PPh Final 4(2)'}
              {activeTab === 'regulasi' && 'Tabel Lengkap TER & Kompilasi Regulasi'}
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
            <span className="bg-white/60 px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-2xs">
              Tahun Pajak: 2024 - 2026
            </span>
          </div>
        </div>

        {/* Tab Switcher Content with Smooth Liquid Transitions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'manual' && (
              <KalkulatorManualTab onOpenConfigModal={() => setIsConfigModalOpen(true)} />
            )}

            {activeTab === 'pph21' && (
              <PPh21KaryawanTab
                salaryInput={salaryInput}
                setSalaryInput={setSalaryInput}
                onOpenPrintSlip={() => setIsPrintModalOpen(true)}
              />
            )}

            {activeTab === 'freelancer' && <PPh21FreelancerTab />}

            {activeTab === 'umkm' && <UMKMTab />}

            {activeTab === 'badan' && <PPhBadanTab />}

            {activeTab === 'ppn_pph23' && <PPNTab />}

            {activeTab === 'regulasi' && <RegulasiTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer with Frosted Glass look */}
      <footer className="border-t border-white/60 bg-white/60 backdrop-blur-xl py-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Kalkulator Pajak RI · Berdasarkan UU HPP No. 7/2021, PP 58/2023, PMK 168/2023, dan PP 55/2022
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Perhitungan Akurat & Teruji</span>
            <span>·</span>
            <span>Liquid Glass Modern Interface</span>
          </div>
        </div>
      </footer>

      {/* Printable Slip Modal */}
      <PrintSlipModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        salaryInput={salaryInput}
      />

      {/* Dynamic Tax Regulation Config Modal */}
      <RegulatoryConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </div>
  );
}

