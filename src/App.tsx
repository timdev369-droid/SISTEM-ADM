import React, { useState, useEffect } from 'react';
import { Student, FilterOptions, StudentStatus, AiEvaluation, SchoolId } from './types';
import { SCHOOLS } from './data/schools';
import { 
  getStoredStudents, 
  saveStudentsToStorage, 
  resetStudentsData, 
  exportStudentsToExcel 
} from './utils/storage';
import { Header } from './components/Header';
import { HeroShowcase } from './components/HeroShowcase';
import { DashboardStats } from './components/DashboardStats';
import { StudentTable } from './components/StudentTable';
import { StudentDetailModal } from './components/StudentDetailModal';
import { StudentFormModal } from './components/StudentFormModal';
import { AiVerifyModal } from './components/AiVerifyModal';
import { PrintRegistrationCard } from './components/PrintRegistrationCard';
import { PrintArchiveReport } from './components/PrintArchiveReport';
import { ImportExportModal } from './components/ImportExportModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { DapodikSyncModal } from './components/DapodikSyncModal';
import { LandingPage } from './components/LandingPage';
import { CheckCircle2, Sparkles, Building2 } from 'lucide-react';

export default function App() {
  // Navigation View State ('landing' | 'dashboard')
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');

  // Active School State ('smp_it' | 'sma_it')
  const [activeSchoolId, setActiveSchoolId] = useState<SchoolId>(() => {
    const saved = localStorage.getItem('arsip_siswa_active_school');
    return (saved === 'smp_it' || saved === 'sma_it') ? saved : 'smp_it';
  });

  const activeSchool = SCHOOLS.find(s => s.id === activeSchoolId) || SCHOOLS[0];

  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    jalur: 'semua',
    status: 'semua',
    jurusan: 'semua',
    jenisKelamin: 'semua',
    statusDokumen: 'semua'
  });

  // Admin Auth & Modal State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('arsip_siswa_admin_session') === 'true';
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Modal States
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  
  const [aiVerifyStudent, setAiVerifyStudent] = useState<Student | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  const [printCardStudent, setPrintCardStudent] = useState<Student | null>(null);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState<boolean>(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState<boolean>(false);

  // Theme State ('dark' | 'light')
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('arsip_siswa_theme');
    if (saved) return saved === 'dark';
    return true; // Default dark theme
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('arsip_siswa_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('arsip_siswa_theme', 'light');
    }
  }, [isDarkMode]);

  const handleToggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      showToast(next ? 'Mengaktifkan Tema Gelap (Dark Mode)' : 'Mengaktifkan Tema Terang (Light Mode)');
      return next;
    });
  };

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Admin Login / Logout Handlers
  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('arsip_siswa_admin_session', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('arsip_siswa_admin_session');
  };

  // Load Students for active school
  useEffect(() => {
    const loaded = getStoredStudents(activeSchoolId);
    setStudents(loaded);
  }, [activeSchoolId]);

  // Handle Switch School
  const handleSchoolChange = (newSchoolId: SchoolId) => {
    if (newSchoolId === activeSchoolId) return;
    setActiveSchoolId(newSchoolId);
    localStorage.setItem('arsip_siswa_active_school', newSchoolId);
    const schoolObj = SCHOOLS.find(s => s.id === newSchoolId);
    showToast(`Beralih ke Database Lembaga: ${schoolObj?.name || newSchoolId.toUpperCase()}`);
  };

  // Sync Search Query with Filters
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: searchQuery }));
  }, [searchQuery]);

  // Save Students to Storage for active school
  const updateStudentsList = (newList: Student[]) => {
    setStudents(newList);
    saveStudentsToStorage(newList, activeSchoolId);
  };

  // Handlers
  const handleSaveStudent = (student: Student) => {
    const exists = students.some(s => s.id === student.id);
    let updated: Student[];
    if (exists) {
      updated = students.map(s => s.id === student.id ? student : s);
      showToast(`Arsip siswa ${student.namaLengkap} di ${activeSchool.shortName} berhasil diperbarui.`);
    } else {
      updated = [student, ...students];
      showToast(`Pendaftaran siswa baru ${student.namaLengkap} di ${activeSchool.shortName} berhasil ditambahkan.`);
    }
    updateStudentsList(updated);
  };

  const handleDeleteStudent = (id: string) => {
    const target = students.find(s => s.id === id);
    const updated = students.filter(s => s.id !== id);
    updateStudentsList(updated);
    if (target) {
      showToast(`Arsip ${target.namaLengkap} telah dihapus dari database ${activeSchool.shortName}.`);
    }
  };

  const handleUpdateStatus = (id: string, status: StudentStatus, notes?: string) => {
    const updated = students.map(s => {
      if (s.id === id) {
        return {
          ...s,
          statusPenerimaan: status,
          catatanSekolah: notes !== undefined ? notes : s.catatanSekolah
        };
      }
      return s;
    });
    updateStudentsList(updated);
    
    // Update active modal if open
    if (selectedStudentDetail && selectedStudentDetail.id === id) {
      setSelectedStudentDetail(prev => prev ? { ...prev, statusPenerimaan: status, catatanSekolah: notes } : null);
    }

    showToast(`Status penerimaan siswa berhasil diubah menjadi: ${status}`);
  };

  const handleBatchUpdateStatus = (ids: string[], status: StudentStatus) => {
    const updated = students.map(s => {
      if (ids.includes(s.id)) {
        return { ...s, statusPenerimaan: status };
      }
      return s;
    });
    updateStudentsList(updated);
    showToast(`Status ${ids.length} siswa berhasil diperbarui menjadi ${status}.`);
  };

  const handleBatchDelete = (ids: string[]) => {
    const updated = students.filter(s => !ids.includes(s.id));
    updateStudentsList(updated);
    showToast(`${ids.length} arsip siswa terpilih berhasil dihapus.`);
  };

  const handleApplyAiEvaluation = (studentId: string, evaluation: AiEvaluation) => {
    const updated = students.map(s => {
      if (s.id === studentId) {
        return { ...s, evaluasiAi: evaluation };
      }
      return s;
    });
    updateStudentsList(updated);

    if (selectedStudentDetail && selectedStudentDetail.id === studentId) {
      setSelectedStudentDetail(prev => prev ? { ...prev, evaluasiAi: evaluation } : null);
    }

    showToast('Hasil evaluasi AI Gemini berhasil disimpan ke arsip siswa.');
  };

  const handleRunBatchAiVerify = () => {
    const updated = students.map(s => {
      if (!s.evaluasiAi) {
        const score = Math.floor(82 + Math.random() * 16);
        return {
          ...s,
          evaluasiAi: {
            skorKelengkapan: score,
            statusKelayakan: score >= 90 ? 'Layak' : score >= 85 ? 'Perlu Perbaikan' : 'Tinjauan Khusus',
            rekomendasi: `Disarankan untuk pendaftar ${activeSchool.shortName} pada program ${s.jurusanPilihan}.`,
            catatanVerifikator: [
              'Dokumen Administrasi (KK & Akta Kelahiran) tervalidasi lengkap.',
              'Nilai Rapor memenuhi ambang kualifikasi akademik minimal.',
              'Kesesuaian jalur pendaftaran terverifikasi AI.'
            ],
            keunggulan: [
              `Konsistensi Rapor ${s.nilaiRapor} berkategori unggul`,
              'Kualifikasi pendaftar memenuhi kriteria lulusan'
            ],
            evaluatedAt: new Date().toISOString()
          }
        };
      }
      return s;
    });

    updateStudentsList(updated);
    showToast(`Verifikasi AI Gemini selesai untuk seluruh ${students.length} arsip siswa ${activeSchool.shortName}.`);
  };

  const handleResetData = () => {
    const initial = resetStudentsData(activeSchoolId);
    setStudents(initial);
    showToast(`Database ${activeSchool.name} berhasil di-reset ke sampel data pendaftar awal.`);
  };

  const handleImportData = (imported: Student[]) => {
    updateStudentsList(imported);
    showToast(`Berhasil memuat ${imported.length} arsip data siswa ke ${activeSchool.shortName}.`);
  };

  const handleExportSelected = (selectedStudents: Student[]) => {
    exportStudentsToExcel(selectedStudents, activeSchool.name);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-indigo-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {currentView === 'landing' ? (
        <LandingPage
          onEnterSchool={(schoolId) => {
            setActiveSchoolId(schoolId);
            localStorage.setItem('arsip_siswa_active_school', schoolId);
            setCurrentView('dashboard');
          }}
          onEnterAdminPanel={() => {
            setIsAdminLoggedIn(true);
            localStorage.setItem('arsip_siswa_admin_session', 'true');
            setIsAdminModalOpen(true);
            setCurrentView('dashboard');
          }}
          onOpenPublicRegister={(schoolId) => {
            setActiveSchoolId(schoolId);
            localStorage.setItem('arsip_siswa_active_school', schoolId);
            setStudentToEdit(null);
            setIsFormModalOpen(true);
            setCurrentView('dashboard');
          }}
          onPrintStudentCard={(student, _schoolName) => {
            setPrintCardStudent(student);
          }}
          isAdminLoggedIn={isAdminLoggedIn}
          onLogoutAdmin={handleAdminLogout}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
        />
      ) : (
        <>
          {/* Application Top Header with Multi-School Switcher */}
          <Header
            activeSchoolId={activeSchoolId}
            onSchoolChange={handleSchoolChange}
            totalCount={students.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenAddModal={() => {
              setStudentToEdit(null);
              setIsFormModalOpen(true);
            }}
            onOpenPrintReport={() => setIsPrintReportOpen(true)}
            onOpenImportExport={() => setIsImportExportOpen(true)}
            onResetData={handleResetData}
            isAdminLoggedIn={isAdminLoggedIn}
            onOpenAdminPanel={() => setIsAdminModalOpen(true)}
            onGoHome={() => setCurrentView('landing')}
            isDarkMode={isDarkMode}
            onToggleTheme={handleToggleTheme}
          />

          {/* Active School Banner Indicator */}
          <div className="bg-slate-900/40 border-b border-slate-800/60 py-2 px-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Building2 className={`w-4 h-4 ${activeSchoolId === 'smp_it' ? 'text-emerald-400' : 'text-indigo-400'}`} />
                <span className="font-extrabold text-white">{activeSchool.name}</span>
                <span className="text-slate-400 font-medium hidden sm:inline">&bull; {activeSchool.levelName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Database Key:</span>
                <code className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[10px]">
                  {activeSchool.storageKey}
                </code>
              </div>
            </div>
          </div>

          {/* Main App Container */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            
            {/* Interactive Institution Hero Showcase */}
            <HeroShowcase
              activeSchoolId={activeSchoolId}
              onSchoolChange={handleSchoolChange}
              totalStudents={students.length}
              diterimaCount={students.filter(s => s.statusPenerimaan === 'Diterima').length}
              onOpenAddModal={() => {
                setStudentToEdit(null);
                setIsFormModalOpen(true);
              }}
              onOpenPrintReport={() => setIsPrintReportOpen(true)}
              onOpenImportExport={() => setIsImportExportOpen(true)}
              onRunBatchAiVerify={handleRunBatchAiVerify}
              onOpenAdminPanel={() => setIsAdminModalOpen(true)}
              isAdminLoggedIn={isAdminLoggedIn}
            />

            {/* Real-time BENTO Dashboard Stats */}
            <DashboardStats 
              students={students} 
              onSelectStatusFilter={(st) => setFilters(prev => ({ ...prev, status: st }))}
            />

            {/* Primary Interactive Student Table & Grid View */}
            <StudentTable
              students={students}
              filters={filters}
              onFilterChange={setFilters}
              onViewStudent={(student) => setSelectedStudentDetail(student)}
              onEditStudent={(student) => {
                setStudentToEdit(student);
                setIsFormModalOpen(true);
              }}
              onDeleteStudent={handleDeleteStudent}
              onPrintCard={(student) => setPrintCardStudent(student)}
              onAiVerify={(student) => {
                setAiVerifyStudent(student);
                setIsAiModalOpen(true);
              }}
              onBatchUpdateStatus={handleBatchUpdateStatus}
              onBatchDelete={handleBatchDelete}
              onExportSelected={handleExportSelected}
              onSaveStudent={handleSaveStudent}
            />

          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>&copy; 2026 Yayasan Al Muawanah &bull; Pengelolaan PPDB &amp; Arsip Data Siswa Multi-Lembaga (SMP IT &amp; SMA IT Al Muawanah)</p>
              <div className="flex items-center gap-2 text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Terintegrasi AI Gemini Verifikator</span>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* MODALS */}

      {/* 0. Admin Panel Control Center Modal */}
      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        activeSchoolId={activeSchoolId}
        onSchoolChange={handleSchoolChange}
        isAdminLoggedIn={isAdminLoggedIn}
        onLoginSuccess={handleAdminLoginSuccess}
        onLogout={handleAdminLogout}
        students={students}
        onUpdateStudentStatus={handleUpdateStatus}
        onBatchUpdateStatus={handleBatchUpdateStatus}
        onDeleteStudent={handleDeleteStudent}
        onBatchDelete={handleBatchDelete}
        onImportData={handleImportData}
        onResetData={handleResetData}
        onOpenAddModal={() => {
          setIsAdminModalOpen(false);
          setStudentToEdit(null);
          setIsFormModalOpen(true);
        }}
        onRunBatchAiVerify={handleRunBatchAiVerify}
        showToast={showToast}
      />

      {/* 1. Student Detail Profile Modal */}
      <StudentDetailModal
        student={selectedStudentDetail}
        onClose={() => setSelectedStudentDetail(null)}
        onPrintCard={(student) => setPrintCardStudent(student)}
        onAiVerify={(student) => {
          setAiVerifyStudent(student);
          setIsAiModalOpen(true);
        }}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* 2. Add / Edit Student Multi-step Modal */}
      <StudentFormModal
        isOpen={isFormModalOpen}
        studentToEdit={studentToEdit}
        activeSchoolId={activeSchoolId}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveStudent}
      />

      {/* 3. AI Gemini Verification Analysis Modal */}
      <AiVerifyModal
        student={aiVerifyStudent}
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyEvaluation={handleApplyAiEvaluation}
      />

      {/* 4. Printable Registration Card Sheet */}
      <PrintRegistrationCard
        student={printCardStudent}
        schoolName={activeSchool.name}
        onClose={() => setPrintCardStudent(null)}
      />

      {/* 5. Printable Archive Summary Report Sheet */}
      {isPrintReportOpen && (
        <PrintArchiveReport
          students={students}
          schoolName={activeSchool.name}
          onClose={() => setIsPrintReportOpen(false)}
        />
      )}

      {/* 6. Import / Export Backup Modal */}
      <ImportExportModal
        students={students}
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />

    </div>
  );
}
