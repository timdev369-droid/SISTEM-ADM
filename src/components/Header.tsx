import React from 'react';
import { 
  GraduationCap, 
  PlusCircle, 
  Printer, 
  Search, 
  FileSpreadsheet, 
  FolderArchive,
  ShieldCheck,
  Lock,
  Building2,
  Home,
  Sun,
  Moon
} from 'lucide-react';
import { SchoolId, SchoolInfo } from '../types';
import { SCHOOLS } from '../data/schools';

interface HeaderProps {
  activeSchoolId: SchoolId;
  onSchoolChange: (id: SchoolId) => void;
  totalCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAddModal: () => void;
  onOpenPrintReport: () => void;
  onOpenImportExport: () => void;
  onResetData: () => void;
  isAdminLoggedIn: boolean;
  onOpenAdminPanel: () => void;
  onGoHome?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeSchoolId,
  onSchoolChange,
  totalCount,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenPrintReport,
  onOpenImportExport,
  isAdminLoggedIn,
  onOpenAdminPanel,
  onGoHome,
  isDarkMode = true,
  onToggleTheme
}) => {
  const activeSchool: SchoolInfo = SCHOOLS.find(s => s.id === activeSchoolId) || SCHOOLS[1];

  return (
    <header className={`sticky top-0 z-30 backdrop-blur-md border-b transition-all shadow-md ${
      isDarkMode 
        ? 'bg-slate-900/95 border-slate-800 text-white' 
        : 'bg-white/95 border-slate-200 text-slate-900'
    }`}>
      
      {/* Top Bar: Multi-School Institution Selector Tabs */}
      <div className={`border-b px-4 sm:px-6 py-2 transition-colors ${
        isDarkMode ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-100 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {onGoHome && (
              <button
                onClick={onGoHome}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border-slate-700/80' 
                    : 'bg-white hover:bg-slate-200 text-indigo-700 border-slate-300 shadow-xs'
                }`}
                title="Kembali ke Halaman Depan (Portal Utama)"
              >
                <Home className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Halaman Depan</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className={`text-xs font-bold tracking-wide hidden md:inline ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                Lembaga Al Muawanah:
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {SCHOOLS.map((school) => {
              const isActive = school.id === activeSchoolId;
              const isSmp = school.id === 'smp_it';

              return (
                <button
                  key={school.id}
                  onClick={() => onSchoolChange(school.id)}
                  className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? isSmp
                        ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/40'
                        : 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400/40'
                      : isDarkMode
                        ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300 shadow-xs'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white animate-pulse' : isDarkMode ? 'bg-slate-500' : 'bg-slate-400'}`}></span>
                  <span>{school.name}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {school.levelName.includes('Pertama') ? 'SMP' : 'SMA'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Logo & Active School Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg ring-2 ${
                activeSchool.id === 'smp_it' 
                  ? 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 shadow-emerald-500/25 ring-emerald-400/30 text-white'
                  : 'bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-500 shadow-indigo-500/25 ring-indigo-400/30 text-white'
              }`}>
                <FolderArchive className="w-6 h-6 text-white" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className={`text-lg font-extrabold tracking-tight flex items-center gap-2 ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {activeSchool.name}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                      activeSchool.id === 'smp_it'
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        : 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
                    }`}>
                      Database Terpisah
                    </span>
                  </h1>
                </div>

                <p className={`text-xs flex items-center gap-1.5 mt-0.5 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <GraduationCap className={`w-3.5 h-3.5 ${activeSchool.id === 'smp_it' ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`} />
                  <span>{activeSchool.levelName} &bull; Sistem Pengarsipan &amp; Rekapitulasi Dokumen</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1"></span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">Terarsip ({totalCount} Siswa)</span>
                </p>
              </div>
            </div>

            {/* Mobile quick add button & Admin login */}
            <div className="flex items-center gap-1.5 lg:hidden">
              <button
                onClick={onOpenAdminPanel}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md ${
                  isAdminLoggedIn 
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/50' 
                    : isDarkMode ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-slate-100 text-slate-800 border border-slate-300'
                }`}
                title="Panel Admin"
              >
                {isAdminLoggedIn ? <ShieldCheck className="w-4 h-4 text-emerald-200" /> : <Lock className="w-4 h-4" />}
              </button>
              <button
                onClick={onOpenAddModal}
                className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md active:scale-95 transition-transform"
                title="Tambah Siswa Baru"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Search & Actions Toolbar */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto">
            {/* Search Box */}
            <div className="relative w-full sm:w-64 md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={`Cari di ${activeSchool.shortName}...`}
                className={`w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                  isDarkMode 
                    ? 'bg-slate-800/80 border-slate-700/80 text-slate-100 placeholder-slate-400' 
                    : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs ${
                    isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  &times;
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              
              {/* Admin Panel Button */}
              <button
                onClick={onOpenAdminPanel}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-md ${
                  isAdminLoggedIn
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white ring-2 ring-emerald-400/30'
                    : isDarkMode
                      ? 'bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/80'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300'
                }`}
                title="Akses Panel Admin"
              >
                {isAdminLoggedIn ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    <span>Panel Admin</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-400 text-slate-950 uppercase tracking-wider">
                      Aktif
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Login Admin</span>
                  </>
                )}
              </button>

              <button
                onClick={onOpenAddModal}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Siswa Baru</span>
              </button>

              <button
                onClick={onOpenPrintReport}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap cursor-pointer ${
                  isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700/80' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-xs'
                }`}
                title="Cetak Laporan Arsip Rekapitulasi"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Cetak Rekap</span>
              </button>

              <button
                onClick={onOpenImportExport}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap cursor-pointer ${
                  isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700/80' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-xs'
                }`}
                title="Upload Excel (.xlsx/.csv) & Backup Data"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Excel / Backup</span>
              </button>

              {onToggleTheme && (
                <button
                  onClick={onToggleTheme}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold text-xs border transition-all whitespace-nowrap cursor-pointer shadow-sm active:scale-95 ${
                    isDarkMode 
                      ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700/80' 
                      : 'bg-slate-100 hover:bg-slate-200 text-indigo-700 border-slate-300'
                  }`}
                  title={isDarkMode ? 'Beralih ke Tema Terang (Light Mode)' : 'Beralih ke Tema Gelap (Dark Mode)'}
                >
                  {isDarkMode ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                      <span className="hidden sm:inline">Terang</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="hidden sm:inline">Gelap</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
