import React, { useState } from 'react';
import { Student, StudentStatus, SchoolId } from '../types';
import { SCHOOLS } from '../data/schools';
import { 
  ShieldCheck, 
  Lock, 
  LogIn, 
  LogOut, 
  Users, 
  UserCheck, 
  AlertTriangle, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  Key, 
  CheckCircle2, 
  X, 
  Eye, 
  EyeOff, 
  ShieldAlert,
  Sliders,
  Check,
  Search,
  Building2
} from 'lucide-react';
import { exportStudentsToExcel, exportStudentsToJSON, parseExcelOrCSVFile } from '../utils/storage';
import { SchoolUserManagement, INITIAL_SCHOOL_USERS } from './SchoolUserManagement';


interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSchoolId: SchoolId;
  onSchoolChange: (id: SchoolId) => void;
  isAdminLoggedIn: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
  students: Student[];
  onUpdateStudentStatus: (id: string, status: StudentStatus, notes?: string) => void;
  onBatchUpdateStatus: (ids: string[], status: StudentStatus) => void;
  onDeleteStudent: (id: string) => void;
  onBatchDelete: (ids: string[]) => void;
  onImportData: (newStudents: Student[]) => void;
  onResetData: () => void;
  onOpenAddModal: () => void;
  onRunBatchAiVerify: () => void;
  showToast: (msg: string) => void;
  onOpenDapodikSync?: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  activeSchoolId,
  onSchoolChange,
  isAdminLoggedIn,
  onLoginSuccess,
  onLogout,
  students,
  onUpdateStudentStatus,
  onBatchUpdateStatus,
  onDeleteStudent,
  onBatchDelete,
  onImportData,
  onResetData,
  onOpenAddModal,
  onRunBatchAiVerify,
  showToast,
  onOpenDapodikSync
}) => {
  if (!isOpen) return null;

  // Login Form States
  const [emailInput, setEmailInput] = useState<string>('admin@gmail.com');
  const [passwordInput, setPasswordInput] = useState<string>('admin123@');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'control' | 'students' | 'users' | 'system' | 'account'>('control');

  // Student Selection State for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchStudentTerm, setSearchStudentTerm] = useState<string>('');
  const [targetBatchStatus, setTargetBatchStatus] = useState<StudentStatus>('Diterima');

  // File Upload State
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);

  // Handle Login Submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    // Check saved school users
    let userList = INITIAL_SCHOOL_USERS;
    try {
      const savedUsers = localStorage.getItem('arsip_siswa_school_users');
      if (savedUsers) userList = JSON.parse(savedUsers);
    } catch (err) {}

    const matchedUser = userList.find(u => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword);

    if (matchedUser) {
      if (!matchedUser.isActive) {
        setLoginError(`Akun "${matchedUser.name}" dalam status Non-Aktif. Hubungi Administrator Utama!`);
        return;
      }
      onLoginSuccess();
      showToast(`Login berhasil sebagai ${matchedUser.name} (${matchedUser.role})!`);
    } else if (cleanEmail === 'admin@gmail.com' && cleanPassword === 'admin123@') {
      onLoginSuccess();
      showToast('Login Admin berhasil! Akses Kontrol Admin diaktifkan.');
    } else {
      setLoginError('Email atau password salah! Gunakan kredensial operator terdaftar atau admin@gmail.com');
    }
  };


  const handleFillDemoCredentials = () => {
    setEmailInput('admin@gmail.com');
    setPasswordInput('admin123@');
    setLoginError(null);
  };

  // Student selection handlers
  const filteredStudents = students.filter(s => 
    s.namaLengkap.toLowerCase().includes(searchStudentTerm.toLowerCase()) ||
    s.noRegistrasi.toLowerCase().includes(searchStudentTerm.toLowerCase()) ||
    s.nisn.includes(searchStudentTerm) ||
    s.asalSekolah.toLowerCase().includes(searchStudentTerm.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelectStudent = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleApplyBatchStatus = () => {
    if (selectedIds.length === 0) return;
    onBatchUpdateStatus(selectedIds, targetBatchStatus);
    showToast(`Berhasil memperbarui status ${selectedIds.length} siswa menjadi "${targetBatchStatus}"`);
    setSelectedIds([]);
  };

  const handleApplyBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} data siswa terpilih?`)) {
      onBatchDelete(selectedIds);
      showToast(`Berhasil menghapus ${selectedIds.length} data siswa terpilih.`);
      setSelectedIds([]);
    }
  };

  // Upload File Excel Handler inside Admin Panel
  const handleAdminFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setUploadStatusMsg(null);

    try {
      const parsed = await parseExcelOrCSVFile(file);
      if (parsed && parsed.length > 0) {
        onImportData(parsed);
        setUploadStatusMsg(`Berhasil mengimpor ${parsed.length} data siswa baru dari "${file.name}"!`);
        showToast(`Impor ${parsed.length} data siswa dari Excel berhasil.`);
      } else {
        setUploadStatusMsg('File Excel tidak berisi data siswa yang dapat diolah.');
      }
    } catch (err: any) {
      setUploadStatusMsg(err.message || 'Gagal mengunggah file.');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all my-8">
        
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/90 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/30">
              <ShieldCheck className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Panel Utama Administrator</h3>
                {isAdminLoggedIn && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    LOGGED IN
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Sistem Pusat Pengelolaan Arsip &amp; Verifikasi Data Siswa Sekolah
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* School Database Selector inside Admin Modal */}
        {isAdminLoggedIn && (
          <div className="bg-slate-950 px-6 py-2.5 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-300">Database Lembaga Terpilih:</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {SCHOOLS.map((s) => {
                const isActive = s.id === activeSchoolId;
                return (
                  <button
                    key={s.id}
                    onClick={() => onSchoolChange(s.id)}
                    className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isActive
                        ? s.id === 'smp_it' 
                          ? 'bg-emerald-600 text-white shadow ring-1 ring-emerald-400/50'
                          : 'bg-indigo-600 text-white shadow ring-1 ring-indigo-400/50'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{s.name}</span>
                    <span className="text-[10px] opacity-80">({s.id === 'smp_it' ? 'SMP' : 'SMA'})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Body */}
        {!isAdminLoggedIn ? (
          /* LOGIN SCREEN FOR ADMIN & PETUGAS TU */
          <div className="p-6 sm:p-8 max-w-lg mx-auto my-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner border border-indigo-200 dark:border-indigo-800">
                <Lock className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">Authentikasi Sistem &amp; Peran User</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Silakan pilih Peran User (Petugas TU Upload Berkas atau Super Admin) untuk masuk ke panel pengelolaan.
              </p>
            </div>

            {/* Role Cards Selector BEFORE Login */}
            <div className="mb-6">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
                Pilih Peran Pengguna (Role):
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {/* Role 1: TU SMP IT */}
                <button
                  type="button"
                  onClick={() => {
                    onSchoolChange('smp_it');
                    setEmailInput('operator.smp@almuawanah.sch.id');
                    setPasswordInput('smp123@');
                    setLoginError(null);
                  }}
                  className={`p-3 rounded-2xl border transition-all text-left cursor-pointer flex items-center gap-3.5 ${
                    activeSchoolId === 'smp_it' && emailInput.includes('smp')
                      ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white">Petugas TU - SMP IT</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        Upload Berkas
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      Role Pengarsipan &amp; Upload Dokumen Siswa SMP IT
                    </p>
                  </div>
                </button>

                {/* Role 2: TU SMA IT */}
                <button
                  type="button"
                  onClick={() => {
                    onSchoolChange('sma_it');
                    setEmailInput('operator.sma@almuawanah.sch.id');
                    setPasswordInput('sma123@');
                    setLoginError(null);
                  }}
                  className={`p-3 rounded-2xl border transition-all text-left cursor-pointer flex items-center gap-3.5 ${
                    activeSchoolId === 'sma_it' && emailInput.includes('sma')
                      ? 'bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/30 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white">Petugas TU - SMA IT</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                        Upload Berkas
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      Role Pengarsipan &amp; Upload Dokumen Siswa SMA IT
                    </p>
                  </div>
                </button>

                {/* Role 3: Super Admin */}
                <button
                  type="button"
                  onClick={() => {
                    setEmailInput('admin@gmail.com');
                    setPasswordInput('admin123@');
                    setLoginError(null);
                  }}
                  className={`p-3 rounded-2xl border transition-all text-left cursor-pointer flex items-center gap-3.5 ${
                    emailInput.includes('admin')
                      ? 'bg-purple-500/10 border-purple-500 ring-2 ring-purple-500/30 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white">Super Admin / Kepala Sekolah</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                        Full Control
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      Akses Utama, Kelola Semua Unit &amp; User Management TU
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Demo Credentials Info Card */}
            <div className="mb-5 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                    <Key className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Kredensial Terpilih:
                  </p>
                  <p className="mt-1 font-mono text-[11px] bg-amber-100/80 dark:bg-amber-900/60 p-1.5 rounded-lg text-amber-900 dark:text-amber-100">
                    Email: <strong>{emailInput || 'admin@gmail.com'}</strong> &bull; Pass: <strong>{passwordInput || 'admin123@'}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemoCredentials}
                  className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] rounded-xl shadow-sm transition-all whitespace-nowrap active:scale-95 cursor-pointer"
                >
                  Autofill Admin
                </button>
              </div>
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Admin
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="admin@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password Admin
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Ke Panel Admin</span>
              </button>
            </form>

            <div className="mt-6 text-center text-[11px] text-slate-400">
              Pengarsipan Data Siswa SMA Negeri 1 Utama &bull; Autentikasi Admin Terproteksi
            </div>
          </div>
        ) : (
          /* LOGGED IN ADMIN CONTROL CENTER */
          <div>
            {/* Admin Header & Navigation Tabs */}
            <div className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setActiveTab('control')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'control'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span>Pusat Kontrol &amp; AI</span>
                </button>

                <button
                  onClick={() => setActiveTab('students')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'students'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Kelola Data &amp; Excel ({students.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'users'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>User Sekolah &amp; Operator</span>
                </button>


                <button
                  onClick={() => setActiveTab('system')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'system'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Sistem &amp; Pemeliharaan</span>
                </button>

                <button
                  onClick={() => setActiveTab('account')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'account'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Key className="w-4 h-4" />
                  <span>Akun Admin</span>
                </button>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  showToast('Anda telah logout dari Panel Admin.');
                }}
                className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-800/80 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap self-end sm:self-auto"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout Admin</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              
              {/* TAB 1: PUSAT KONTROL & AI */}
              {activeTab === 'control' && (
                <div className="space-y-6">
                  
                  {/* Status Quick Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Total Terarsip</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{students.length}</p>
                    </div>

                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <p className="text-emerald-700 dark:text-emerald-300 text-[11px] font-medium">Siswa Diterima</p>
                      <p className="text-xl font-black text-emerald-800 dark:text-emerald-200 mt-0.5">
                        {students.filter(s => s.statusPenerimaan === 'Diterima').length}
                      </p>
                    </div>

                    <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
                      <p className="text-amber-700 dark:text-amber-300 text-[11px] font-medium">Proses Verifikasi</p>
                      <p className="text-xl font-black text-amber-800 dark:text-amber-200 mt-0.5">
                        {students.filter(s => s.statusPenerimaan === 'Proses Verifikasi').length}
                      </p>
                    </div>

                    <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800">
                      <p className="text-purple-700 dark:text-purple-300 text-[11px] font-medium">Terverifikasi AI</p>
                      <p className="text-xl font-black text-purple-800 dark:text-purple-200 mt-0.5">
                        {students.filter(s => !!s.evaluasiAi).length}
                      </p>
                    </div>
                  </div>

                  {/* Dapodik Integration Banner */}
                  {onOpenDapodikSync && (
                    <div className="p-5 bg-gradient-to-r from-red-950 via-slate-900 to-indigo-950 rounded-2xl text-white shadow-xl border border-red-800/80 relative overflow-hidden">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30 uppercase tracking-wider">
                            <Key className="w-3.5 h-3.5 text-red-400" />
                            <span>Integrasi Web Service Kemendikbud</span>
                          </div>
                          <h4 className="text-lg font-black text-white">Tarik Data Siswa Langsung dari Dapodik</h4>
                          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                            Hubungkan aplikasi dengan Service Key Token Dapodik Local untuk menarik biodata siswa, NISN, NIK, Rombel, dan data orang tua secara otomatis.
                          </p>
                        </div>

                        <button
                          onClick={onOpenDapodikSync}
                          className="px-5 py-3 bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-red-900/40 flex items-center gap-2 transition-all active:scale-95 cursor-pointer whitespace-nowrap self-stretch md:self-auto justify-center"
                        >
                          <Key className="w-4 h-4 text-amber-400" />
                          <span>Buka Pengaturan &amp; Tarik Dapodik</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* AI Batch Verifier Section */}
                  <div className="p-5 bg-gradient-to-r from-purple-900/90 via-indigo-900 to-slate-900 rounded-2xl text-white shadow-xl relative overflow-hidden border border-indigo-700/50">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30">
                          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                          <span>AI Gemini Verifikator Otomatis</span>
                        </div>
                        <h4 className="text-lg font-bold text-white">Verifikasi AI Massal Seluruh Pendaftar</h4>
                        <p className="text-xs text-purple-200/80 max-w-xl">
                          Jalankan analisis AI Gemini otomatis untuk mengevaluasi kelayakan, skor kelengkapan dokumen, keunggulan, dan rekomendasi jalur penerimaan seluruh siswa dalam 1-klik.
                        </p>
                      </div>

                      <button
                        onClick={onRunBatchAiVerify}
                        className="px-5 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer whitespace-nowrap self-stretch md:self-auto justify-center"
                      >
                        <Sparkles className="w-4 h-4 text-purple-100 animate-spin" style={{ animationDuration: '3s' }} />
                        <span>Jalankan AI Verifikasi Massal</span>
                      </button>
                    </div>
                  </div>

                  {/* Mass Status Quick Update Panel */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Pembaruan Status Massal Berdasarkan Kategori
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => {
                          const targetIds = students.filter(s => s.statusPenerimaan === 'Proses Verifikasi').map(s => s.id);
                          if (targetIds.length === 0) {
                            showToast('Tidak ada siswa yang berstatus Proses Verifikasi.');
                            return;
                          }
                          onBatchUpdateStatus(targetIds, 'Diterima');
                          showToast(`Berhasil menerima ${targetIds.length} siswa dari Proses Verifikasi!`);
                        }}
                        className="p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex flex-col items-start gap-1 shadow-md transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Terima Semua Siswa Verifikasi
                        </span>
                        <span className="text-[10px] font-normal text-emerald-100">
                          Ubah status ({students.filter(s => s.statusPenerimaan === 'Proses Verifikasi').length} siswa) ke Diterima
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          const targetIds = students.filter(s => s.statusPenerimaan === 'Proses Verifikasi').map(s => s.id);
                          if (targetIds.length === 0) {
                            showToast('Tidak ada siswa yang berstatus Proses Verifikasi.');
                            return;
                          }
                          onBatchUpdateStatus(targetIds, 'Cadangan');
                          showToast(`Berhasil memindahkan ${targetIds.length} siswa ke status Cadangan.`);
                        }}
                        className="p-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs flex flex-col items-start gap-1 shadow-md transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" /> Jadikan Cadangan Semua Verifikasi
                        </span>
                        <span className="text-[10px] font-normal text-amber-100">
                          Ubah status ({students.filter(s => s.statusPenerimaan === 'Proses Verifikasi').length} siswa) ke Cadangan
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          const allIds = students.map(s => s.id);
                          onBatchUpdateStatus(allIds, 'Proses Verifikasi');
                          showToast(`Status seluruh ${allIds.length} siswa dikembalikan ke "Proses Verifikasi".`);
                        }}
                        className="p-3.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-xs flex flex-col items-start gap-1 shadow-md transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-1">
                          <RefreshCw className="w-4 h-4" /> Reset Status Semua Siswa
                        </span>
                        <span className="text-[10px] font-normal text-slate-300">
                          Kembalikan status seluruh ({students.length}) siswa ke Verifikasi
                        </span>
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: KELOLA DATA & EXCEL */}
              {activeTab === 'students' && (
                <div className="space-y-4">
                  
                  {/* Top Excel Upload & Add Action */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Upload &amp; Impor File Excel (.xlsx / .csv)
                      </h4>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                        Tambah data siswa secara massal menggunakan file spredsheet Excel.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept=".xlsx, .xls, .csv, .json"
                        onChange={handleAdminFileUpload}
                        id="admin-excel-input"
                        className="hidden"
                        disabled={uploadLoading}
                      />
                      <label
                        htmlFor="admin-excel-input"
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{uploadLoading ? 'Memproses...' : 'Upload Excel'}</span>
                      </label>

                      <button
                        onClick={onOpenAddModal}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <span>+ Tambah Manual</span>
                      </button>
                    </div>
                  </div>

                  {uploadStatusMsg && (
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      <span>{uploadStatusMsg}</span>
                    </div>
                  )}

                  {/* Batch Action Toolbar for Selected Students */}
                  <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-60">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchStudentTerm}
                          onChange={(e) => setSearchStudentTerm(e.target.value)}
                          placeholder="Filter dalam admin panel..."
                          className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                        />
                      </div>
                      <span className="text-slate-500 font-semibold text-[11px] whitespace-nowrap">
                        Terpilih: {selectedIds.length} dari {filteredStudents.length}
                      </span>
                    </div>

                    {selectedIds.length > 0 && (
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <select
                          value={targetBatchStatus}
                          onChange={(e) => setTargetBatchStatus(e.target.value as StudentStatus)}
                          className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-xs"
                        >
                          <option value="Diterima">Ubah ke Diterima</option>
                          <option value="Proses Verifikasi">Ubah ke Verifikasi</option>
                          <option value="Cadangan">Ubah ke Cadangan</option>
                          <option value="Ditolak">Ubah ke Ditolak</option>
                        </select>

                        <button
                          onClick={handleApplyBatchStatus}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow text-xs cursor-pointer"
                        >
                          Terapkan
                        </button>

                        <button
                          onClick={handleApplyBatchDelete}
                          className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus ({selectedIds.length})</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Student Table with Checkboxes */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="max-h-80 overflow-y-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold sticky top-0 z-10">
                          <tr>
                            <th className="p-3 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                                onChange={toggleSelectAll}
                                className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                            </th>
                            <th className="p-3">No. Reg / Nama Siswa</th>
                            <th className="p-3">NISN</th>
                            <th className="p-3">Asal Sekolah</th>
                            <th className="p-3">Jalur &amp; Jurusan</th>
                            <th className="p-3">Nilai</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Aksi Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                          {filteredStudents.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="p-6 text-center text-slate-400">
                                Tidak ada data siswa yang cocok dengan filter pencarian.
                              </td>
                            </tr>
                          ) : (
                            filteredStudents.map((s) => {
                              const isChecked = selectedIds.includes(s.id);
                              return (
                                <tr key={s.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${isChecked ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''}`}>
                                  <td className="p-3 text-center">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleSelectStudent(s.id)}
                                      className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    />
                                  </td>
                                  <td className="p-3 font-semibold">
                                    <div className="font-bold text-slate-900 dark:text-white">{s.namaLengkap}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">{s.noRegistrasi}</div>
                                  </td>
                                  <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">{s.nisn}</td>
                                  <td className="p-3 text-slate-700 dark:text-slate-300 max-w-[140px] truncate">{s.asalSekolah}</td>
                                  <td className="p-3">
                                    <div className="font-medium">{s.jalurPendaftaran}</div>
                                    <div className="text-[10px] text-slate-400">{s.jurusanPilihan}</div>
                                  </td>
                                  <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">{s.nilaiRapor}</td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                                      s.statusPenerimaan === 'Diterima' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                                      s.statusPenerimaan === 'Cadangan' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                                      s.statusPenerimaan === 'Ditolak' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                                      'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                    }`}>
                                      {s.statusPenerimaan}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right">
                                    <select
                                      value={s.statusPenerimaan}
                                      onChange={(e) => {
                                        onUpdateStudentStatus(s.id, e.target.value as StudentStatus);
                                        showToast(`Status ${s.namaLengkap} diubah menjadi ${e.target.value}`);
                                      }}
                                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-[11px] font-medium"
                                    >
                                      <option value="Diterima">Diterima</option>
                                      <option value="Proses Verifikasi">Verifikasi</option>
                                      <option value="Cadangan">Cadangan</option>
                                      <option value="Ditolak">Ditolak</option>
                                    </select>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: PENGATURAN USER SEKOLAH & OPERATOR */}
              {activeTab === 'users' && (
                <SchoolUserManagement showToast={showToast} />
              )}

              {/* TAB 4: SISTEM & PEMELIHARAAN */}
              {activeTab === 'system' && (

                <div className="space-y-5 text-xs sm:text-sm">
                  
                  {/* Backup & Export Section */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Download className="w-4 h-4 text-indigo-600" />
                      Ekspor &amp; Backup Seluruh Database Siswa
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Unduh arsip lengkap dalam bentuk spreadsheet Excel (.xlsx) atau file cadangan JSON untuk disimpan di penyimpanan lokal/cloud sekolah.
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={() => exportStudentsToExcel(students)}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Ekspor File Excel (.xlsx)</span>
                      </button>

                      <button
                        onClick={() => exportStudentsToJSON(students)}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Unduh Backup JSON</span>
                      </button>
                    </div>
                  </div>

                  {/* Reset & Wipe Controls */}
                  <div className="p-5 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-3">
                    <h4 className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      Pemeliharaan Database &amp; Reset Data
                    </h4>
                    <p className="text-xs text-rose-800/80 dark:text-rose-300/80">
                      Tindakan administrator untuk mengembalikan data ke sampel awal atau menghapus arsip.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                      <button
                        onClick={() => {
                          if (window.confirm('Kembalikan arsip data ke sampel awal sekolah?')) {
                            onResetData();
                            showToast('Database berhasil di-reset ke sampel data awal.');
                          }
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all cursor-pointer w-full sm:w-auto justify-center"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reset ke Sample Data Awal</span>
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm('PERINGATAN! Anda akan menghapus SELURUH data siswa terarsip. Lanjutkan?')) {
                            onImportData([]);
                            showToast('Seluruh arsip siswa telah dikosongkan.');
                          }
                        }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all cursor-pointer w-full sm:w-auto justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Kosongkan Seluruh Database</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 4: AKUN ADMIN */}
              {activeTab === 'account' && (
                <div className="space-y-5">
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                        SA
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          Administrator Utama
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                            Super Admin
                          </span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          SMA Negeri 1 Utama &bull; Sistem Pengarsipan Digital
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400 font-medium block">Email Login Terdaftar:</span>
                        <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                          admin@gmail.com
                        </span>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-400 font-medium block">Password Akun:</span>
                        <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                          admin123@
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-500">
                        Sesi login aktif tersimpan di penyimpanan aman browser.
                      </p>

                      <button
                        onClick={() => {
                          onLogout();
                          showToast('Berhasil keluar dari sesi Admin.');
                        }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Logout dari Sesi Admin</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
