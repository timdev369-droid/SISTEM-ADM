import React, { useState } from 'react';
import { SchoolId, Student, SchoolInfo, StudentDocument } from '../types';
import { SCHOOLS } from '../data/schools';
import { getStoredStudents } from '../utils/storage';
import { 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  UserCheck, 
  Search, 
  CheckCircle2, 
  Printer, 
  ArrowRight, 
  Lock, 
  Users, 
  LogOut,
  FileCheck,
  AlertCircle,
  FileText,
  Clock,
  BarChart3,
  Check,
  FolderCheck,
  PieChart,
  Sun,
  Moon
} from 'lucide-react';

interface LandingPageProps {
  onEnterSchool: (schoolId: SchoolId) => void;
  onEnterAdminPanel: () => void;
  onOpenPublicRegister: (schoolId: SchoolId) => void;
  onPrintStudentCard: (student: Student, schoolName: string) => void;
  isAdminLoggedIn: boolean;
  onLogoutAdmin: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterSchool,
  onEnterAdminPanel,
  onOpenPublicRegister,
  onPrintStudentCard,
  isAdminLoggedIn,
  onLogoutAdmin,
  isDarkMode = true,
  onToggleTheme
}) => {
  // Load students data
  const smpStudents = getStoredStudents('smp_it');
  const smaStudents = getStoredStudents('sma_it');

  // Search status state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<{ student: Student; school: SchoolInfo } | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Quick Login Modal State
  const [loginModalTarget, setLoginModalTarget] = useState<'admin' | 'smp_it' | 'sma_it' | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Tab View Filter for Landing
  const [selectedUnitView, setSelectedUnitView] = useState<'all' | 'smp_it' | 'sma_it'>('all');

  // Helper: Get student class grade
  const getSmpClass = (s: Student, idx: number): 'Kelas 7' | 'Kelas 8' | 'Kelas 9' => {
    if (s.kelas) {
      if (s.kelas.includes('7')) return 'Kelas 7';
      if (s.kelas.includes('8')) return 'Kelas 8';
      if (s.kelas.includes('9')) return 'Kelas 9';
    }
    const mod = idx % 3;
    return mod === 0 ? 'Kelas 7' : mod === 1 ? 'Kelas 8' : 'Kelas 9';
  };

  const getSmaClass = (s: Student, idx: number): 'Kelas 10' | 'Kelas 11' | 'Kelas 12' => {
    if (s.kelas) {
      if (s.kelas.includes('10')) return 'Kelas 10';
      if (s.kelas.includes('11')) return 'Kelas 11';
      if (s.kelas.includes('12')) return 'Kelas 12';
    }
    const mod = idx % 3;
    return mod === 0 ? 'Kelas 10' : mod === 1 ? 'Kelas 11' : 'Kelas 12';
  };

  // 1. CALCULATE GENDER BREAKDOWN PER CLASS
  // SMP IT Classes
  const smpClassData = {
    'Kelas 7': { male: 0, female: 0, total: 0 },
    'Kelas 8': { male: 0, female: 0, total: 0 },
    'Kelas 9': { male: 0, female: 0, total: 0 }
  };

  smpStudents.forEach((s, idx) => {
    const cls = getSmpClass(s, idx);
    if (s.jenisKelamin === 'Laki-Laki') {
      smpClassData[cls].male++;
    } else {
      smpClassData[cls].female++;
    }
    smpClassData[cls].total++;
  });

  const totalSmpMale = smpClassData['Kelas 7'].male + smpClassData['Kelas 8'].male + smpClassData['Kelas 9'].male;
  const totalSmpFemale = smpClassData['Kelas 7'].female + smpClassData['Kelas 8'].female + smpClassData['Kelas 9'].female;
  const totalSmpAll = smpStudents.length;

  // SMA IT Classes
  const smaClassData = {
    'Kelas 10': { male: 0, female: 0, total: 0 },
    'Kelas 11': { male: 0, female: 0, total: 0 },
    'Kelas 12': { male: 0, female: 0, total: 0 }
  };

  smaStudents.forEach((s, idx) => {
    const cls = getSmaClass(s, idx);
    if (s.jenisKelamin === 'Laki-Laki') {
      smaClassData[cls].male++;
    } else {
      smaClassData[cls].female++;
    }
    smaClassData[cls].total++;
  });

  const totalSmaMale = smaClassData['Kelas 10'].male + smaClassData['Kelas 11'].male + smaClassData['Kelas 12'].male;
  const totalSmaFemale = smaClassData['Kelas 10'].female + smaClassData['Kelas 11'].female + smaClassData['Kelas 12'].female;
  const totalSmaAll = smaStudents.length;

  const grandTotalMale = totalSmpMale + totalSmaMale;
  const grandTotalFemale = totalSmpFemale + totalSmaFemale;
  const grandTotalStudents = totalSmpAll + totalSmaAll;

  // 2. CALCULATE DOCUMENT UPLOAD PROGRESS
  const calculateDocStats = (students: Student[]) => {
    let totalDocs = 0;
    let sesuaiDocs = 0;
    let perbaikanDocs = 0;
    let belumDocs = 0;

    const docTypeStats = {
      kk: { name: 'Kartu Keluarga (KK)', total: 0, uploaded: 0 },
      akta: { name: 'Akta Kelahiran', total: 0, uploaded: 0 },
      ijazahSkl: { name: 'Ijazah / SKL', total: 0, uploaded: 0 },
      pasFoto: { name: 'Pas Foto Formal', total: 0, uploaded: 0 },
      sertifikat: { name: 'Sertifikat Prestasi', total: 0, uploaded: 0 }
    };

    students.forEach((s) => {
      const docs = s.dokumen;
      if (!docs) return;

      const processDoc = (doc?: StudentDocument, key?: keyof typeof docTypeStats) => {
        if (!doc) return;
        totalDocs++;
        if (key) docTypeStats[key].total++;

        if (doc.status === 'Sesuai') {
          sesuaiDocs++;
          if (key) docTypeStats[key].uploaded++;
        } else if (doc.status === 'Perlu Perbaikan') {
          perbaikanDocs++;
        } else {
          belumDocs++;
        }
      };

      processDoc(docs.kk, 'kk');
      processDoc(docs.akta, 'akta');
      processDoc(docs.ijazahSkl, 'ijazahSkl');
      processDoc(docs.pasFoto, 'pasFoto');
      if (docs.sertifikat) {
        processDoc(docs.sertifikat, 'sertifikat');
      }
    });

    const percentage = totalDocs > 0 ? Math.round((sesuaiDocs / totalDocs) * 100) : 0;

    return {
      totalDocs,
      sesuaiDocs,
      perbaikanDocs,
      belumDocs,
      percentage,
      docTypeStats
    };
  };

  const smpDocStats = calculateDocStats(smpStudents);
  const smaDocStats = calculateDocStats(smaStudents);
  const allDocStats = calculateDocStats([...smpStudents, ...smaStudents]);

  // Handle Search Status
  const handleSearchStatus = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    if (!searchQuery.trim()) {
      setSearchResult(null);
      return;
    }

    const q = searchQuery.trim().toLowerCase();

    const smpMatch = smpStudents.find(
      s => s.noRegistrasi.toLowerCase() === q || s.nisn.toLowerCase() === q || s.nik.toLowerCase() === q
    );
    if (smpMatch) {
      setSearchResult({ student: smpMatch, school: SCHOOLS[0] });
      return;
    }

    const smaMatch = smaStudents.find(
      s => s.noRegistrasi.toLowerCase() === q || s.nisn.toLowerCase() === q || s.nik.toLowerCase() === q
    );
    if (smaMatch) {
      setSearchResult({ student: smaMatch, school: SCHOOLS[1] });
      return;
    }

    setSearchResult(null);
  };

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanPass = passwordInput.trim().toLowerCase();

    if (loginModalTarget === 'admin') {
      if (!cleanPass || cleanPass === 'admin' || cleanPass === 'admin123' || cleanPass === 'admin123@' || cleanPass === '123456') {
        onEnterAdminPanel();
        setLoginModalTarget(null);
        setPasswordInput('');
      } else {
        setLoginError('Password Admin salah! (Gunakan: admin123@ atau klik Auto Login)');
      }
    } else if (loginModalTarget === 'smp_it') {
      if (!cleanPass || cleanPass === 'smp123' || cleanPass === 'smp123@' || cleanPass === 'admin' || cleanPass === 'admin123' || cleanPass === 'admin123@') {
        onEnterSchool('smp_it');
        setLoginModalTarget(null);
        setPasswordInput('');
      } else {
        setLoginError('Password Operator SMP IT salah! (Gunakan: smp123@ atau klik Auto Login)');
      }
    } else if (loginModalTarget === 'sma_it') {
      if (!cleanPass || cleanPass === 'sma123' || cleanPass === 'sma123@' || cleanPass === 'admin' || cleanPass === 'admin123' || cleanPass === 'admin123@') {
        onEnterSchool('sma_it');
        setLoginModalTarget(null);
        setPasswordInput('');
      } else {
        setLoginError('Password Operator SMA IT salah! (Gunakan: sma123@ atau klik Auto Login)');
      }
    }
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-indigo-500 selection:text-white pb-16 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* TOP HEADER NAVIGATION */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-300 ${
        isDarkMode 
          ? 'bg-slate-950/80 border-slate-800/80 text-white shadow-2xl shadow-indigo-950/20' 
          : 'bg-white/85 border-slate-200/90 text-slate-900 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3.5">
          
          <div className="flex items-center gap-3.5 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-900 dark:bg-slate-950 rounded-[14px] flex items-center justify-center text-white">
                <Building2 className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-sm font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Yayasan Pendidikan Islam Al Muawanah
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
                  Resmi
                </span>
              </div>
              <p className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Sistem Informasi &amp; Rekapitulasi Berkas Digital (SMP IT &amp; SMA IT)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onEnterSchool('smp_it')}
              className={`px-3.5 py-2 rounded-xl border font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 ${
                isDarkMode 
                  ? 'bg-emerald-950/50 hover:bg-emerald-900/70 border-emerald-800/80 text-emerald-300 hover:border-emerald-500' 
                  : 'bg-emerald-50/90 hover:bg-emerald-100 border-emerald-300/80 text-emerald-800'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-500" />
              <span>SMP IT ({smpStudents.length})</span>
            </button>

            <button
              onClick={() => onEnterSchool('sma_it')}
              className={`px-3.5 py-2 rounded-xl border font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 ${
                isDarkMode 
                  ? 'bg-indigo-950/50 hover:bg-indigo-900/70 border-indigo-800/80 text-indigo-300 hover:border-indigo-500' 
                  : 'bg-indigo-50/90 hover:bg-indigo-100 border-indigo-300/80 text-indigo-800'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              <span>SMA IT ({smaStudents.length})</span>
            </button>

            {isAdminLoggedIn ? (
              <div className={`flex items-center gap-2 pl-2.5 border-l ${isDarkMode ? 'border-slate-800' : 'border-slate-300'}`}>
                <button
                  onClick={onEnterAdminPanel}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Panel Admin</span>
                </button>
                <button
                  onClick={onLogoutAdmin}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isDarkMode ? 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-rose-600 border border-slate-200'
                  }`}
                  title="Logout Admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setLoginModalTarget('admin')}
                className={`px-3.5 py-2 rounded-xl border font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 ${
                  isDarkMode 
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-amber-400 hover:border-amber-500/50' 
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-amber-800 shadow-xs'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Login Admin</span>
              </button>
            )}

            {/* Theme Toggle Button (Light/Dark Mode) */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`p-2 rounded-xl border font-bold text-xs flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                  isDarkMode 
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-amber-400 hover:border-amber-400' 
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-indigo-700'
                }`}
                title={isDarkMode ? 'Beralih ke Tema Terang' : 'Beralih ke Tema Gelap'}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-600" />
                )}
              </button>
            )}
          </div>

        </div>
      </header>

      {/* HERO BANNER SUMMARY */}
      <section className={`border-b py-10 px-4 sm:px-6 lg:px-8 transition-colors relative overflow-hidden ${
        isDarkMode 
          ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-slate-800/80' 
          : 'bg-gradient-to-b from-indigo-50/70 via-slate-50 to-slate-100/80 border-slate-200'
      }`}>
        
        {/* Subtle Background Radial Accent Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="space-y-2.5">
              <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-extrabold shadow-2xs ${
                isDarkMode 
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' 
                  : 'bg-indigo-100/90 border-indigo-200 text-indigo-900'
              }`}>
                <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Dashboard Profiling Siswa &amp; Digitalisasi Berkas</span>
              </div>
              <h2 className={`text-2xl sm:text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Rekapitulasi Gender Per Kelas &amp; Progress Dokumen
              </h2>
              <p className={`text-xs sm:text-sm max-w-2xl leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Monitoring real-time jumlah siswa Laki-Laki &amp; Perempuan per tingkat kelas (SMP IT &amp; SMA IT Al Muawanah) serta status kelengkapan 1 File Berkas Pendaftaran.
              </p>
            </div>

            {/* Quick Filter Unit Buttons */}
            <div className={`flex items-center gap-1.5 p-1.5 rounded-2xl border self-start lg:self-auto shadow-sm ${
              isDarkMode ? 'bg-slate-900/90 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <button
                onClick={() => setSelectedUnitView('all')}
                className={`px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                  selectedUnitView === 'all'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Unit
              </button>
              <button
                onClick={() => setSelectedUnitView('smp_it')}
                className={`px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                  selectedUnitView === 'smp_it'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                SMP IT
              </button>
              <button
                onClick={() => setSelectedUnitView('sma_it')}
                className={`px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                  selectedUnitView === 'sma_it'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                SMA IT
              </button>
            </div>
          </div>

          {/* GRAND OVERVIEW CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <div className={`border rounded-2xl p-4.5 shadow-lg transition-all hover:translate-y-[-2px] ${
              isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className={`flex items-center justify-between text-xs mb-1.5 font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <span>Total Seluruh Siswa</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <div className={`text-2xl sm:text-3xl font-black font-mono ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {grandTotalStudents} <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Siswa</span>
              </div>
              <div className={`text-[11px] mt-1.5 flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">SMP: {totalSmpAll}</span>
                <span>&bull;</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">SMA: {totalSmaAll}</span>
              </div>
            </div>

            <div className={`border rounded-2xl p-4.5 shadow-lg transition-all hover:translate-y-[-2px] ${
              isDarkMode ? 'bg-slate-900/90 border-blue-900/40' : 'bg-blue-50/70 border-blue-200/80'
            }`}>
              <div className={`flex items-center justify-between text-xs mb-1.5 font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                <span>Siswa Laki-Laki (L)</span>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />
              </div>
              <div className={`text-2xl sm:text-3xl font-black font-mono ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                {grandTotalMale} <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-blue-600'}`}>Siswa</span>
              </div>
              <div className={`text-[11px] mt-1.5 ${isDarkMode ? 'text-slate-400' : 'text-blue-700'}`}>
                Rasio: <strong className={`font-mono ${isDarkMode ? 'text-white' : 'text-blue-950'}`}>{grandTotalStudents > 0 ? Math.round((grandTotalMale / grandTotalStudents) * 100) : 0}%</strong> dari total
              </div>
            </div>

            <div className={`border rounded-2xl p-4.5 shadow-lg transition-all hover:translate-y-[-2px] ${
              isDarkMode ? 'bg-slate-900/90 border-pink-900/40' : 'bg-pink-50/70 border-pink-200/80'
            }`}>
              <div className={`flex items-center justify-between text-xs mb-1.5 font-bold ${isDarkMode ? 'text-pink-300' : 'text-pink-800'}`}>
                <span>Siswa Perempuan (P)</span>
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-sm" />
              </div>
              <div className={`text-2xl sm:text-3xl font-black font-mono ${isDarkMode ? 'text-pink-300' : 'text-pink-900'}`}>
                {grandTotalFemale} <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-pink-600'}`}>Siswa</span>
              </div>
              <div className={`text-[11px] mt-1.5 ${isDarkMode ? 'text-slate-400' : 'text-pink-700'}`}>
                Rasio: <strong className={`font-mono ${isDarkMode ? 'text-white' : 'text-pink-950'}`}>{grandTotalStudents > 0 ? Math.round((grandTotalFemale / grandTotalStudents) * 100) : 0}%</strong> dari total
              </div>
            </div>

            <div className={`border rounded-2xl p-4.5 shadow-lg transition-all hover:translate-y-[-2px] ${
              isDarkMode ? 'bg-slate-900/90 border-emerald-900/40' : 'bg-emerald-50/70 border-emerald-200/80'
            }`}>
              <div className={`flex items-center justify-between text-xs mb-1.5 font-bold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>
                <span>Progress Upload Berkas</span>
                <FolderCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {allDocStats.percentage}%
              </div>
              <div className={`text-[11px] mt-1.5 ${isDarkMode ? 'text-slate-400' : 'text-emerald-800'}`}>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-300">{allDocStats.sesuaiDocs} Valid</span> / {allDocStats.totalDocs} Dokumen
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* MAIN CONTENT GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        
        {/* SECTION 1: JUMLAH SISWA PEREMPUAN & LAKI-LAKI PER KELAS SESUAI JENJANG */}
        <section className="space-y-6">
          
          <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  1. Rekapitulasi Siswa Laki-Laki &amp; Perempuan Per Kelas
                </h3>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Rincian data gender per tingkat/kelas untuk unit SMP IT (Kelas 7, 8, 9) dan SMA IT (Kelas 10, 11, 12).
                </p>
              </div>
            </div>
          </div>

          {/* JENJANG 1: SMP IT AL MUAWANAH */}
          {(selectedUnitView === 'all' || selectedUnitView === 'smp_it') && (
            <div className={`p-6 border rounded-3xl space-y-5 shadow-xl transition-all ${
              isDarkMode 
                ? 'bg-slate-900/80 border-emerald-800/60' 
                : 'bg-white border-emerald-200 shadow-emerald-500/5'
            }`}>
              
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
                isDarkMode ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-600/30">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">Jenjang Pertama</span>
                    <h4 className={`text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>SMP IT Al Muawanah</h4>
                  </div>
                </div>

                <div className={`flex items-center gap-3 text-xs px-4 py-2 rounded-xl border font-semibold ${
                  isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}>
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Total SMP IT:</span>
                  <span className="text-blue-600 dark:text-blue-300 font-mono font-bold">L: {totalSmpMale}</span>
                  <span>&bull;</span>
                  <span className="text-pink-600 dark:text-pink-300 font-mono font-bold">P: {totalSmpFemale}</span>
                  <span>&bull;</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-extrabold">{totalSmpAll} Siswa</span>
                </div>
              </div>

              {/* Class Cards Grid for SMP IT */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['Kelas 7', 'Kelas 8', 'Kelas 9'] as const).map((cls) => {
                  const data = smpClassData[cls];
                  const malePercent = data.total > 0 ? Math.round((data.male / data.total) * 100) : 0;
                  const femalePercent = data.total > 0 ? Math.round((data.female / data.total) * 100) : 0;

                  return (
                    <div key={cls} className={`border rounded-2xl p-5 shadow-sm transition-all ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 hover:border-emerald-500/40' 
                        : 'bg-slate-50/80 border-slate-200 hover:border-emerald-300 hover:bg-white'
                    }`}>
                      <div className={`flex items-center justify-between mb-3 border-b pb-2.5 ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`}>
                        <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          {cls} SMP IT
                        </span>
                        <span className={`text-xs font-bold font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Total: <strong className="text-emerald-600 dark:text-emerald-400 text-sm">{data.total}</strong> Siswa
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 my-4">
                        <div className={`p-3 rounded-xl border ${
                          isDarkMode ? 'bg-blue-950/40 border-blue-800/50' : 'bg-blue-50 border-blue-200'
                        }`}>
                          <span className={`text-[10px] font-bold uppercase block ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>Laki-Laki (L)</span>
                          <span className={`text-xl font-black font-mono mt-0.5 block ${isDarkMode ? 'text-blue-200' : 'text-blue-950'}`}>{data.male} Siswa</span>
                          <span className={`text-[10px] mt-1 block ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>{malePercent}% dari kelas</span>
                        </div>

                        <div className={`p-3 rounded-xl border ${
                          isDarkMode ? 'bg-pink-950/40 border-pink-800/50' : 'bg-pink-50 border-pink-200'
                        }`}>
                          <span className={`text-[10px] font-bold uppercase block ${isDarkMode ? 'text-pink-300' : 'text-pink-800'}`}>Perempuan (P)</span>
                          <span className={`text-xl font-black font-mono mt-0.5 block ${isDarkMode ? 'text-pink-200' : 'text-pink-950'}`}>{data.female} Siswa</span>
                          <span className={`text-[10px] mt-1 block ${isDarkMode ? 'text-pink-400' : 'text-pink-700'}`}>{femalePercent}% dari kelas</span>
                        </div>
                      </div>

                      {/* Visual Ratio Bar */}
                      <div className="space-y-1">
                        <div className={`flex justify-between text-[10px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          <span>Laki-Laki ({malePercent}%)</span>
                          <span>Perempuan ({femalePercent}%)</span>
                        </div>
                        <div className={`w-full h-2.5 rounded-full overflow-hidden flex ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                          <div style={{ width: `${malePercent}%` }} className="bg-blue-500 h-full transition-all duration-500" title={`Laki-Laki: ${data.male}`} />
                          <div style={{ width: `${femalePercent}%` }} className="bg-pink-500 h-full transition-all duration-500" title={`Perempuan: ${data.female}`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* JENJANG 2: SMA IT AL MUAWANAH */}
          {(selectedUnitView === 'all' || selectedUnitView === 'sma_it') && (
            <div className={`p-6 border rounded-3xl space-y-5 shadow-xl transition-all ${
              isDarkMode 
                ? 'bg-slate-900/80 border-indigo-800/60' 
                : 'bg-white border-indigo-200 shadow-indigo-500/5'
            }`}>
              
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
                isDarkMode ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">Jenjang Menengah Atas</span>
                    <h4 className={`text-base font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>SMA IT Al Muawanah</h4>
                  </div>
                </div>

                <div className={`flex items-center gap-3 text-xs px-4 py-2 rounded-xl border font-semibold ${
                  isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}>
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Total SMA IT:</span>
                  <span className="text-blue-600 dark:text-blue-300 font-mono font-bold">L: {totalSmaMale}</span>
                  <span>&bull;</span>
                  <span className="text-pink-600 dark:text-pink-300 font-mono font-bold">P: {totalSmaFemale}</span>
                  <span>&bull;</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-mono font-extrabold">{totalSmaAll} Siswa</span>
                </div>
              </div>

              {/* Class Cards Grid for SMA IT */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['Kelas 10', 'Kelas 11', 'Kelas 12'] as const).map((cls) => {
                  const data = smaClassData[cls];
                  const malePercent = data.total > 0 ? Math.round((data.male / data.total) * 100) : 0;
                  const femalePercent = data.total > 0 ? Math.round((data.female / data.total) * 100) : 0;

                  return (
                    <div key={cls} className={`border rounded-2xl p-5 shadow-sm transition-all ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-800 hover:border-indigo-500/40' 
                        : 'bg-slate-50/80 border-slate-200 hover:border-indigo-300 hover:bg-white'
                    }`}>
                      <div className={`flex items-center justify-between mb-3 border-b pb-2.5 ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'}`}>
                        <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                          {cls} SMA IT
                        </span>
                        <span className={`text-xs font-bold font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          Total: <strong className="text-indigo-600 dark:text-indigo-400 text-sm">{data.total}</strong> Siswa
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 my-4">
                        <div className={`p-3 rounded-xl border ${
                          isDarkMode ? 'bg-blue-950/40 border-blue-800/50' : 'bg-blue-50 border-blue-200'
                        }`}>
                          <span className={`text-[10px] font-bold uppercase block ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>Laki-Laki (L)</span>
                          <span className={`text-xl font-black font-mono mt-0.5 block ${isDarkMode ? 'text-blue-200' : 'text-blue-950'}`}>{data.male} Siswa</span>
                          <span className={`text-[10px] mt-1 block ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>{malePercent}% dari kelas</span>
                        </div>

                        <div className={`p-3 rounded-xl border ${
                          isDarkMode ? 'bg-pink-950/40 border-pink-800/50' : 'bg-pink-50 border-pink-200'
                        }`}>
                          <span className={`text-[10px] font-bold uppercase block ${isDarkMode ? 'text-pink-300' : 'text-pink-800'}`}>Perempuan (P)</span>
                          <span className={`text-xl font-black font-mono mt-0.5 block ${isDarkMode ? 'text-pink-200' : 'text-pink-950'}`}>{data.female} Siswa</span>
                          <span className={`text-[10px] mt-1 block ${isDarkMode ? 'text-pink-400' : 'text-pink-700'}`}>{femalePercent}% dari kelas</span>
                        </div>
                      </div>

                      {/* Visual Ratio Bar */}
                      <div className="space-y-1">
                        <div className={`flex justify-between text-[10px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          <span>Laki-Laki ({malePercent}%)</span>
                          <span>Perempuan ({femalePercent}%)</span>
                        </div>
                        <div className={`w-full h-2.5 rounded-full overflow-hidden flex ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                          <div style={{ width: `${malePercent}%` }} className="bg-blue-500 h-full transition-all duration-500" title={`Laki-Laki: ${data.male}`} />
                          <div style={{ width: `${femalePercent}%` }} className="bg-pink-500 h-full transition-all duration-500" title={`Perempuan: ${data.female}`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </section>

        {/* SECTION 2: JUMLAH PROGRESS UPLOAD BERKAS & DOKUMEN DIGITAL */}
        <section className="space-y-6 pt-4">
          
          <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-lg font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  2. Progress Upload Berkas &amp; Dokumen Digital Siswa
                </h3>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Laporan rekapitulasi status upload kelengkapan berkas pendaftaran (KK, Akta, SKL/Ijazah, Pas Foto, Sertifikat).
                </p>
              </div>
            </div>
          </div>

          {/* DOCUMENT PROGRESS OVERVIEW PANEL */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Overall Gauge & Progress Card */}
            <div className={`border rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all ${
              isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Progress Keseluruhan Dokumen
                  </span>
                  <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold font-mono">
                    {allDocStats.percentage}% Complete
                  </span>
                </div>

                {/* Progress Bar Display */}
                <div className="my-6 text-center">
                  <div className={`text-4xl font-black font-mono mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {allDocStats.sesuaiDocs} <span className={`text-base font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>/ {allDocStats.totalDocs} Dokumen</span>
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Berkas digital telah di-upload &amp; diverifikasi sesuai standar pendaftaran.
                  </p>

                  <div className={`w-full h-4 rounded-full overflow-hidden p-0.5 border my-4 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 shadow-md"
                      style={{ width: `${allDocStats.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Detailed Status Breakdown Grid */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2">
                  <div className={`p-2.5 rounded-xl border ${
                    isDarkMode ? 'bg-emerald-950/60 border-emerald-800/80' : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <span className={`text-[10px] font-bold uppercase block ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>Valid / Sesuai</span>
                    <span className={`text-base font-extrabold font-mono mt-0.5 block ${isDarkMode ? 'text-emerald-200' : 'text-emerald-900'}`}>{allDocStats.sesuaiDocs}</span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${
                    isDarkMode ? 'bg-amber-950/60 border-amber-800/80' : 'bg-amber-50 border-amber-200'
                  }`}>
                    <span className={`text-[10px] font-bold uppercase block ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>Perlu Perbaikan</span>
                    <span className={`text-base font-extrabold font-mono mt-0.5 block ${isDarkMode ? 'text-amber-200' : 'text-amber-900'}`}>{allDocStats.perbaikanDocs}</span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${
                    isDarkMode ? 'bg-rose-950/60 border-rose-800/80' : 'bg-rose-50 border-rose-200'
                  }`}>
                    <span className={`text-[10px] font-bold uppercase block ${isDarkMode ? 'text-rose-300' : 'text-rose-800'}`}>Belum Upload</span>
                    <span className={`text-base font-extrabold font-mono mt-0.5 block ${isDarkMode ? 'text-rose-200' : 'text-rose-900'}`}>{allDocStats.belumDocs}</span>
                  </div>
                </div>
              </div>

              <div className={`pt-4 border-t mt-6 text-[11px] flex items-center justify-between ${
                isDarkMode ? 'border-slate-800/80 text-slate-400' : 'border-slate-200 text-slate-500'
              }`}>
                <span>Rata-rata 4 dokumen wajib per siswa</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Terintegrasi AI Gemini</span>
              </div>
            </div>

            {/* Document Breakdown by Unit (SMP IT vs SMA IT) */}
            <div className={`border rounded-3xl p-6 shadow-xl lg:col-span-2 flex flex-col justify-between space-y-6 transition-all ${
              isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              
              <div>
                <h4 className={`text-sm font-extrabold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <PieChart className="w-4 h-4 text-indigo-500" />
                  <span>Komparasi Progress Upload Berkas Per Unit Lembaga</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* SMP IT Progress Card */}
                  <div className={`p-4 border rounded-2xl ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>
                        <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> SMP IT Al Muawanah
                      </span>
                      <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {smpDocStats.percentage}%
                      </span>
                    </div>

                    <div className={`w-full h-2.5 rounded-full overflow-hidden my-2 border ${
                      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-200 border-slate-300'
                    }`}>
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-500" 
                        style={{ width: `${smpDocStats.percentage}%` }} 
                      />
                    </div>

                    <div className={`flex justify-between text-[11px] font-mono mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      <span>Dokumen Valid: <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{smpDocStats.sesuaiDocs}</strong></span>
                      <span>Total: <strong className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{smpDocStats.totalDocs}</strong></span>
                    </div>
                  </div>

                  {/* SMA IT Progress Card */}
                  <div className={`p-4 border rounded-2xl ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-800'}`}>
                        <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> SMA IT Al Muawanah
                      </span>
                      <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm">
                        {smaDocStats.percentage}%
                      </span>
                    </div>

                    <div className={`w-full h-2.5 rounded-full overflow-hidden my-2 border ${
                      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-200 border-slate-300'
                    }`}>
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-500" 
                        style={{ width: `${smaDocStats.percentage}%` }} 
                      />
                    </div>

                    <div className={`flex justify-between text-[11px] font-mono mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      <span>Dokumen Valid: <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{smaDocStats.sesuaiDocs}</strong></span>
                      <span>Total: <strong className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{smaDocStats.totalDocs}</strong></span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Progress Per Jenis Dokumen List */}
              <div className={`space-y-3 pt-2 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <span className={`text-xs font-bold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Rincian Persentase Upload Per Jenis Dokumen Digital:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {Object.entries(allDocStats.docTypeStats).map(([key, stat]) => {
                    const pct = stat.total > 0 ? Math.round((stat.uploaded / stat.total) * 100) : 0;
                    return (
                      <div key={key} className={`p-2.5 border rounded-xl flex items-center justify-between gap-3 ${
                        isDarkMode ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span className={`truncate font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{stat.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{stat.uploaded}/{stat.total}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-800 border-slate-300 shadow-2xs'
                          }`}>
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

        </section>

        {/* SECTION 3: PENCARIAN STATUS ARSIP & AKSES QUICK DATABASE */}
        <section className={`border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl transition-all ${
          isDarkMode 
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-slate-800' 
            : 'bg-gradient-to-r from-indigo-50 via-white to-slate-50 border-indigo-200'
        }`}>
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className={`px-3 py-1 rounded-full border text-xs font-bold inline-flex items-center gap-1.5 ${
              isDarkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-100 text-indigo-800 border-indigo-300'
            }`}>
              <Search className="w-3.5 h-3.5" />
              <span>Cek Arsip &amp; Pencetakan Bukti Pendaftaran</span>
            </span>
            <h3 className={`text-xl sm:text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Cek Status Pendaftaran &amp; Kelengkapan Berkas
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Masukkan Nomor Registrasi (contoh: <code className="text-emerald-600 dark:text-emerald-300 font-mono font-bold">PPDB-SMP-001</code>) atau NISN / NIK Anda untuk melihat status kelengkapan berkas &amp; mencetak kartu bukti.
            </p>
          </div>

          <form onSubmit={handleSearchStatus} className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nomor Registrasi atau NISN..."
              className={`flex-1 px-4 py-3 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900 shadow-sm'
              }`}
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Cek Status</span>
            </button>
          </form>

          {/* Search Result Display */}
          {hasSearched && (
            <div className="max-w-xl mx-auto">
              {searchResult ? (
                <div className={`border rounded-2xl p-5 text-left shadow-2xl space-y-4 ${
                  isDarkMode ? 'bg-slate-950 border-emerald-500/40 text-slate-100' : 'bg-white border-emerald-400 text-slate-900'
                }`}>
                  <div className={`flex items-start justify-between gap-4 border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 block">
                        {searchResult.school.name}
                      </span>
                      <h4 className={`text-base font-black mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {searchResult.student.namaLengkap}
                      </h4>
                      <div className={`text-xs font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        No. Reg: {searchResult.student.noRegistrasi} &bull; NISN: {searchResult.student.nisn}
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                      searchResult.student.statusPenerimaan === 'Diterima'
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40'
                        : searchResult.student.statusPenerimaan === 'Proses Verifikasi'
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40'
                    }`}>
                      {searchResult.student.statusPenerimaan}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Jenis Kelamin:</span>
                      <span className={`font-semibold block ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{searchResult.student.jenisKelamin}</span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Jalur Pendaftaran:</span>
                      <span className={`font-semibold block ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{searchResult.student.jalurPendaftaran}</span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Program Pilihan:</span>
                      <span className={`font-semibold block ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{searchResult.student.jurusanPilihan}</span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Nilai Rapor:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono block">{searchResult.student.nilaiRapor}</span>
                    </div>
                  </div>

                  <div className={`pt-3 border-t flex items-center justify-between text-xs ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                    <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Tgl Daftar: {searchResult.student.tanggalDaftar}</span>
                    <button
                      onClick={() => onPrintStudentCard(searchResult.student, searchResult.school.name)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Bukti Arsip</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`border rounded-2xl p-5 text-center text-xs ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
                }`}>
                  Siswa tidak ditemukan dengan Nomor Registrasi / NISN tersebut. Mohon periksa kembali input Anda.
                </div>
              )}
            </div>
          )}

          {/* Quick Database Entry Bar */}
          <div className={`pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
            isDarkMode ? 'border-slate-800/80' : 'border-slate-200'
          }`}>
            <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Masuk ke Ruang Kelola Database:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEnterSchool('smp_it')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
              >
                <span>Buka SMP IT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onEnterSchool('sma_it')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
              >
                <span>Buka SMA IT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </section>

      </main>

      {/* FOOTER */}
      <footer className={`mt-16 py-6 border-t text-xs text-center ${
        isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-600'
      }`}>
        <p className={`font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-800'}`}>Yayasan Pendidikan Islam Al Muawanah</p>
        <p className="text-[11px] mt-0.5">Sistem Pengarsipan Data Siswa &amp; Rekapitulasi Berkas Digital &bull; SMP IT &amp; SMA IT Al Muawanah</p>
      </footer>

      {/* LOGIN MODAL */}
      {loginModalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`border rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <button
              onClick={() => {
                setLoginModalTarget(null);
                setLoginError('');
                setPasswordInput('');
              }}
              className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold cursor-pointer transition-colors ${
                isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              &times;
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Authentikasi &amp; Akses Peran
              </h3>
              <p className={`text-xs mt-1 max-w-sm mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Silakan pilih peran pengguna (Role TU Upload Berkas / Super Admin) untuk melanjutkan ke sistem database.
              </p>
            </div>

            {/* Role Selection Cards */}
            <div className="mb-6">
              <label className={`block text-xs font-extrabold uppercase tracking-wider mb-2.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Pilih Peran Akses Sistem (Role):
              </label>
              
              <div className="grid grid-cols-1 gap-2.5">
                {/* Option 1: TU SMP IT */}
                <div
                  onClick={() => {
                    setLoginModalTarget('smp_it');
                    setLoginError('');
                    setPasswordInput('smp123@');
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 relative overflow-hidden ${
                    loginModalTarget === 'smp_it'
                      ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                      : isDarkMode
                      ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold ${
                    loginModalTarget === 'smp_it' ? 'bg-emerald-600 text-white' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-black tracking-tight">Petugas TU - SMP IT</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        Upload Berkas Siswa
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Role Pendataan, Upload Ijazah/KK, &amp; Manajemen Siswa SMP
                    </p>
                  </div>
                </div>

                {/* Option 2: TU SMA IT */}
                <div
                  onClick={() => {
                    setLoginModalTarget('sma_it');
                    setLoginError('');
                    setPasswordInput('sma123@');
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 relative overflow-hidden ${
                    loginModalTarget === 'sma_it'
                      ? 'bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/30 shadow-md'
                      : isDarkMode
                      ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold ${
                    loginModalTarget === 'sma_it' ? 'bg-indigo-600 text-white' : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                  }`}>
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-black tracking-tight">Petugas TU - SMA IT</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                        Upload Berkas Siswa
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Role Pendataan, Upload Ijazah/KK, &amp; Manajemen Siswa SMA
                    </p>
                  </div>
                </div>

                {/* Option 3: Super Admin */}
                <div
                  onClick={() => {
                    setLoginModalTarget('admin');
                    setLoginError('');
                    setPasswordInput('admin123@');
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 relative overflow-hidden ${
                    loginModalTarget === 'admin'
                      ? 'bg-purple-500/10 border-purple-500 ring-2 ring-purple-500/30 shadow-md'
                      : isDarkMode
                      ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold ${
                    loginModalTarget === 'admin' ? 'bg-purple-600 text-white' : 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                  }`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-black tracking-tight">Super Admin / Kepala Sekolah</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                        Akses Penuh
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Pengaturan Sistem, Manajemen User TU, Rekap Laporan &amp; Multi Unit
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {loginModalTarget === 'smp_it'
                    ? 'Password Petugas TU SMP IT:'
                    : loginModalTarget === 'sma_it'
                    ? 'Password Petugas TU SMA IT:'
                    : 'Password Super Admin Utama:'}
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder={
                    loginModalTarget === 'smp_it'
                      ? 'Masukkan password TU SMP IT...'
                      : loginModalTarget === 'sma_it'
                      ? 'Masukkan password TU SMA IT...'
                      : 'Masukkan password Super Admin...'
                  }
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  autoFocus
                />
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                    Default Pass:{' '}
                    <code className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                      {loginModalTarget === 'smp_it' ? 'smp123@' : loginModalTarget === 'sma_it' ? 'sma123@' : 'admin123@'}
                    </code>
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                    &check; Akses Terverifikasi
                  </span>
                </div>
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs font-medium">
                  {loginError}
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className={`flex-1 py-3 px-4 rounded-xl text-white font-extrabold text-xs shadow-md transition-all cursor-pointer ${
                    loginModalTarget === 'smp_it'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : loginModalTarget === 'sma_it'
                      ? 'bg-indigo-600 hover:bg-indigo-500'
                      : 'bg-purple-600 hover:bg-purple-500'
                  }`}
                >
                  {loginModalTarget === 'admin'
                    ? 'Masuk Sebagai Super Admin'
                    : `Masuk Petugas TU ${loginModalTarget === 'smp_it' ? 'SMP IT' : 'SMA IT'}`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (loginModalTarget === 'admin') {
                      setPasswordInput('admin123@');
                      onEnterAdminPanel();
                    } else {
                      onEnterSchool(loginModalTarget);
                    }
                    setLoginModalTarget(null);
                  }}
                  className={`py-3 px-3.5 rounded-xl font-extrabold text-xs border transition-all cursor-pointer ${
                    isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-emerald-700 border-slate-300'
                  }`}
                  title="Masuk langsung tanpa perlu mengetik password"
                >
                  Auto Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
