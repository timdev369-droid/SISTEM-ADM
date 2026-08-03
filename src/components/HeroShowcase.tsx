import React from 'react';
import { SchoolId, SchoolInfo } from '../types';
import { SCHOOLS } from '../data/schools';
import { 
  GraduationCap, 
  Sparkles, 
  PlusCircle, 
  Printer, 
  FileSpreadsheet, 
  ShieldCheck, 
  BookOpen, 
  Building2, 
  CheckCircle2, 
  Database,
  ArrowRight,
  Flame
} from 'lucide-react';

interface HeroShowcaseProps {
  activeSchoolId: SchoolId;
  onSchoolChange: (id: SchoolId) => void;
  totalStudents: number;
  diterimaCount: number;
  onOpenAddModal: () => void;
  onOpenPrintReport: () => void;
  onOpenImportExport: () => void;
  onRunBatchAiVerify: () => void;
  onOpenAdminPanel: () => void;
  isAdminLoggedIn: boolean;
}

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({
  activeSchoolId,
  onSchoolChange,
  totalStudents,
  diterimaCount,
  onOpenAddModal,
  onOpenPrintReport,
  onOpenImportExport,
  onRunBatchAiVerify,
  onOpenAdminPanel,
  isAdminLoggedIn
}) => {
  const activeSchool: SchoolInfo = SCHOOLS.find(s => s.id === activeSchoolId) || SCHOOLS[0];
  const isSmp = activeSchoolId === 'smp_it';

  return (
    <div className="mb-8 relative overflow-hidden rounded-3xl transition-all duration-300 shadow-2xl border border-slate-800">
      
      {/* Background Gradient & Animated Glows */}
      <div className={`absolute inset-0 transition-all duration-500 ${
        isSmp 
          ? 'bg-gradient-to-br from-slate-950 via-emerald-950/80 to-slate-900' 
          : 'bg-gradient-to-br from-slate-950 via-indigo-950/80 to-slate-900'
      }`} />

      {/* Decorative Blur Circles */}
      <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
        isSmp ? 'bg-emerald-500/15' : 'bg-indigo-500/15'
      }`} />
      <div className={`absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
        isSmp ? 'bg-teal-500/15' : 'bg-purple-500/15'
      }`} />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 p-6 sm:p-8 md:p-10 text-white">
        
        {/* Top Header Row: Multi-Institution Badge & School Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800/80">
          
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shadow-xl ring-2 ${
              isSmp
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 ring-emerald-400/40 text-white'
                : 'bg-gradient-to-tr from-indigo-600 to-purple-500 ring-indigo-400/40 text-white'
            }`}>
              <Building2 className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Yayasan Pendidikan Islam Al Muawanah
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800/90 text-emerald-300 border border-emerald-500/30">
                  <Database className="w-3 h-3 text-emerald-400" />
                  Database Terpisah Active
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2 mt-0.5">
                {activeSchool.name}
              </h2>
            </div>
          </div>

          {/* Interactive School Switcher Tabs */}
          <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-2 shadow-inner">
            {SCHOOLS.map((s) => {
              const isActive = s.id === activeSchoolId;
              const isSmpTab = s.id === 'smp_it';

              return (
                <button
                  key={s.id}
                  onClick={() => onSchoolChange(s.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? isSmpTab
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg ring-2 ring-emerald-400/50'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg ring-2 ring-indigo-400/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-slate-600'}`} />
                  <span>{s.shortName}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isSmpTab ? 'SMP' : 'SMA'}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Middle Row: Content & Features */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-8 space-y-4">
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-3xl">
              Sistem Pengarsipan Data &amp; Dokumen Siswa Terpadu untuk <strong className="text-white font-semibold">{activeSchool.levelName}</strong>. Pengelolaan rekapitulasi data pokok, kelengkapan berkas digital, verifikasi AI Gemini, dan ekspor rekap Laporan Siswa.
            </p>

            {/* Major Program Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                Program Unggulan {activeSchool.shortName}:
              </span>
              {activeSchool.majors.map((m) => (
                <span 
                  key={m}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                    isSmp
                      ? 'bg-emerald-950/60 text-emerald-200 border-emerald-800/60'
                      : 'bg-indigo-950/60 text-indigo-200 border-indigo-800/60'
                  }`}
                >
                  {m}
                </span>
              ))}
            </div>

            {/* Key Feature Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Verifikator AI Gemini
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                <FileSpreadsheet className="w-4 h-4 text-teal-400" />
                Impor/Ekspor Excel (.xlsx)
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                <Printer className="w-4 h-4 text-indigo-400" />
                Cetak Kartu &amp; Rekap PDF
              </span>
            </div>
          </div>

          {/* Quick Stats & Action Hub Column */}
          <div className="lg:col-span-4 bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between gap-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Status Database Arsip</span>
                <span className="text-lg font-extrabold text-white flex items-center gap-1.5">
                  {totalStudents} Siswa
                  <span className="text-xs font-normal text-emerald-400 font-mono">({diterimaCount} Verifikasi Lengkap)</span>
                </span>
              </div>
              <div className={`p-2.5 rounded-xl ${isSmp ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-500/20 text-indigo-300'}`}>
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenAddModal}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Siswa Baru</span>
              </button>

              <button
                onClick={onRunBatchAiVerify}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
                title="Jalankan verifikasi AI Gemini untuk seluruh pendaftar"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Verify AI</span>
              </button>

              <button
                onClick={onOpenPrintReport}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-indigo-400" />
                <span>Cetak Rekap</span>
              </button>

              <button
                onClick={onOpenImportExport}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Excel / Backup</span>
              </button>
            </div>

            {/* Admin status pill */}
            <button
              onClick={onOpenAdminPanel}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                isAdminLoggedIn
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                  : 'bg-slate-800/80 text-slate-300 border border-slate-700/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className={`w-4 h-4 ${isAdminLoggedIn ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{isAdminLoggedIn ? 'Panel Admin Selesai Login' : 'Akses Modul Administrator'}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
