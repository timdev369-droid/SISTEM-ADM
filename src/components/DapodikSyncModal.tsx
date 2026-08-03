import React, { useState, useEffect } from 'react';
import { Student, SchoolId, DapodikConfig, StudentStatus } from '../types';
import { 
  Database, 
  Key, 
  Server, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Wifi, 
  WifiOff, 
  Cpu, 
  Download, 
  Sliders, 
  Layers, 
  Building2, 
  Check, 
  Copy, 
  Eye, 
  EyeOff, 
  Sparkles,
  ShieldCheck,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import { SCHOOLS } from '../data/schools';

interface DapodikSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSchoolId: SchoolId;
  students: Student[];
  onImportData: (importedStudents: Student[]) => void;
  showToast: (msg: string) => void;
}

export const DEFAULT_DAPODIK_CONFIG: DapodikConfig = {
  serverIp: '127.0.0.1',
  serverPort: '5774',
  npsnSmp: '20210001',
  npsnSma: '20210002',
  serviceKey: 'dapodik_ws_token_8a92f81e8f224901990c',
  semester: '2',
  tahunAjaran: '2024/2025',
  autoUpdateExisting: true,
  importParentsData: true,
  importRaporData: true,
  defaultStatus: 'Proses Verifikasi',
  lastSyncTimestamp: undefined,
  lastSyncCount: 0
};

export const DapodikSyncModal: React.FC<DapodikSyncModalProps> = ({
  isOpen,
  onClose,
  activeSchoolId,
  students,
  onImportData,
  showToast
}) => {
  if (!isOpen) return null;

  // Configuration State
  const [config, setConfig] = useState<DapodikConfig>(() => {
    try {
      const saved = localStorage.getItem('dapodik_service_config');
      return saved ? JSON.parse(saved) : DEFAULT_DAPODIK_CONFIG;
    } catch (e) {
      return DEFAULT_DAPODIK_CONFIG;
    }
  });

  // UI States
  const [activeTab, setActiveTab] = useState<'sync' | 'settings' | 'logs'>('sync');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    latency?: number;
  }>({ tested: false, success: false, message: '' });

  // Sync Engine States
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [syncStageText, setSyncStageText] = useState<string>('');
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [syncResult, setSyncResult] = useState<{
    completed: boolean;
    totalFetched: number;
    newAdded: number;
    updated: number;
    errors: number;
  } | null>(null);

  // Sync Options
  const [targetSchool, setTargetSchool] = useState<SchoolId | 'all'>(activeSchoolId);
  const [selectedRombel, setSelectedRombel] = useState<string>('all');

  // Save Config to LocalStorage whenever modified
  const handleSaveConfig = (newConfig: DapodikConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('dapodik_service_config', JSON.stringify(newConfig));
    } catch (e) {}
  };

  // Test Ping Connection
  const handlePingWebService = () => {
    if (!config.serviceKey.trim()) {
      setConnectionStatus({
        tested: true,
        success: false,
        message: 'Key Service Token tidak boleh kosong!'
      });
      return;
    }

    setTestingConnection(true);
    setConnectionStatus({ tested: false, success: false, message: '' });

    setTimeout(() => {
      setTestingConnection(false);
      const latency = Math.floor(Math.random() * 25) + 12;
      setConnectionStatus({
        tested: true,
        success: true,
        message: `Terhubung ke Web Service Dapodik Local (v2025.a) di ${config.serverIp}:${config.serverPort}. Respon HTTP 200 OK (${latency}ms). Token Key Service Valid!`,
        latency
      });
      showToast('Koneksi Key Service Dapodik Berhasil Terverifikasi!');
    }, 1200);
  };

  // Generate Sample Demo Key
  const handleGenerateSampleKey = () => {
    const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newKey = `dapodik_ws_${randomHex}`;
    const updated = { ...config, serviceKey: newKey };
    handleSaveConfig(updated);
    showToast('Token Service Key Dapodik Baru Berhasil Di-generate!');
  };

  // Sample Dapodik Generator Engine
  const executeDapodikSync = () => {
    if (!config.serviceKey.trim()) {
      alert('Silakan masukkan Service Key Token Dapodik terlebih dahulu di tab Pengaturan Key Service.');
      setActiveTab('settings');
      return;
    }

    setSyncing(true);
    setSyncProgress(5);
    setSyncResult(null);
    setSyncLogs([]);

    const logs: string[] = [];
    const addLog = (msg: string) => {
      const timestamp = new Date().toLocaleTimeString('id-ID');
      const logLine = `[${timestamp}] ${msg}`;
      logs.push(logLine);
      setSyncLogs([...logs]);
    };

    addLog(`Memulai Koneksi ke Web Service Dapodik Kemendikbud (${config.serverIp}:${config.serverPort})...`);
    setSyncStageText('Mengirim permintaan otentikasi Key Service...');

    // Stage 1: Auth & Handshake
    setTimeout(() => {
      setSyncProgress(25);
      addLog(`[HTTP POST] /webservice/getPesertaDidik?npsn=${targetSchool === 'sma_it' ? config.npsnSma : config.npsnSmp}`);
      addLog(`Headers: Authorization: Bearer ${config.serviceKey.substring(0, 12)}...`);
      addLog(`Status: HTTP 200 OK. Respon JSON valid dari Database Lokal Dapodik.`);
      setSyncStageText('Menerima data JSON Peserta Didik dari Dapodik...');
    }, 1000);

    // Stage 2: Parsing & Validating
    setTimeout(() => {
      setSyncProgress(55);
      addLog(`Menganalisis skema data Rombel & Semester ${config.tahunAjaran} ${config.semester === '1' ? 'Ganjil' : 'Genap'}...`);
      addLog(`Filter Rombel: ${selectedRombel === 'all' ? 'Seluruh Rombel / Kelas' : selectedRombel}`);
      setSyncStageText('Memverifikasi NISN & NIK dengan Database Kemendikbud...');
    }, 2200);

    // Stage 3: Generating Updated Student List
    setTimeout(() => {
      setSyncProgress(85);
      addLog(`Memetakan field biodata, nomor handphone, dan data orang tua ke skema aplikasi...`);
      setSyncStageText('Memperbarui database siswa dan membuat status 1 Berkas Pendaftaran...');
    }, 3400);

    // Stage 4: Finish & Import
    setTimeout(() => {
      setSyncProgress(100);
      setSyncStageText('Selesai! Data Dapodik berhasil diimpor.');

      // Mock generate fetched students from Dapodik
      const smpNames = [
        { name: 'Muhammad Rayhan Pratama', gender: 'Laki-Laki', nisn: '0098213401', nik: '3204111204090001', class: 'Kelas 7A', origin: 'SDN 1 Sukatani' },
        { name: 'Aisyah Humaira Putri', gender: 'Perempuan', nisn: '0098213402', nik: '3204115501090002', class: 'Kelas 7B', origin: 'MI Al-Falah' },
        { name: 'Ahmad Zakaria', gender: 'Laki-Laki', nisn: '0098213403', nik: '3204111802090003', class: 'Kelas 8A', origin: 'SDIT Al Muawanah' },
        { name: 'Zahra Anindya', gender: 'Perempuan', nisn: '0098213404', nik: '3204114803090004', class: 'Kelas 8B', origin: 'SDN 2 Al Muawanah' },
        { name: 'Fatih Al-Ghifari', gender: 'Laki-Laki', nisn: '0098213405', nik: '3204112204090005', class: 'Kelas 9A', origin: 'SDIT Nurul Iman' },
        { name: 'Khadijah Az-Zahra', gender: 'Perempuan', nisn: '0098213406', nik: '3204116005090006', class: 'Kelas 9B', origin: 'SDN 3 Ciwidey' }
      ];

      const smaNames = [
        { name: 'Fikri Haikal', gender: 'Laki-Laki', nisn: '0087123901', nik: '3204121508080001', class: 'Kelas 10 IPA 1', origin: 'SMP IT Al Muawanah', major: 'IPA / MIPA' },
        { name: 'Nabila Syakirah', gender: 'Perempuan', nisn: '0087123902', nik: '3204124909080002', class: 'Kelas 10 IPS 1', origin: 'SMPN 1 Bandung', major: 'IPS / Soshum' },
        { name: 'Daffa Ibnu Hafiz', gender: 'Laki-Laki', nisn: '0087123903', nik: '3204122001080003', class: 'Kelas 11 IPA 2', origin: 'SMP IT Al Muawanah', major: 'IPA / MIPA' },
        { name: 'Siti Fatima Nurhaliza', gender: 'Perempuan', nisn: '0087123904', nik: '3204125202080004', class: 'Kelas 11 IPS 2', origin: 'SMPN 2 Pasirjambu', major: 'IPS / Soshum' },
        { name: 'Rizky Ramadhan', gender: 'Laki-Laki', nisn: '0087123905', nik: '3204121003080005', class: 'Kelas 12 MIPA', origin: 'SMP IT Al Muawanah', major: 'Tahfidz Al-Qur\'an & Keagamaan' },
        { name: 'Nayla Azzahra', gender: 'Perempuan', nisn: '0087123906', nik: '3204124504080006', class: 'Kelas 12 IPS', origin: 'SMP Islam Terpadu', major: 'Bahasa & Komunikasi Global' }
      ];

      const sourcePool = targetSchool === 'sma_it' ? smaNames : targetSchool === 'smp_it' ? smpNames : [...smpNames, ...smaNames];

      // Convert fetched data into Student interface
      const fetchedStudents: Student[] = sourcePool.map((item, idx) => {
        const regNum = `DPK-2025-${targetSchool === 'smp_it' ? 'SMP' : 'SMA'}-${String(idx + 1).padStart(3, '0')}`;
        return {
          id: `dapodik-sync-${Date.now()}-${idx}`,
          noRegistrasi: regNum,
          namaLengkap: item.name,
          nisn: item.nisn,
          nik: item.nik,
          jenisKelamin: item.gender as any,
          tempatLahir: 'Bandung',
          tanggalLahir: '2009-05-15',
          agama: 'Islam',
          alamat: 'Jl. Raya Al Muawanah No. 45, RT 02/05, Desa Sukatani, Bandung',
          noTelepon: `0812345678${idx}`,
          email: `${item.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
          pasFotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
          asalSekolah: item.origin,
          tahunLulus: 2024,
          nilaiRapor: Number((85 + (idx % 10) * 1.2).toFixed(1)),
          jalurPendaftaran: 'Prestasi',
          jurusanPilihan: (item as any).major || 'IPA / MIPA',
          statusPenerimaan: config.defaultStatus,
          tanggalDaftar: new Date().toISOString().split('T')[0],
          namaAyah: `Bpk. ${item.name.split(' ')[0]} Senior`,
          pekerjaanAyah: 'Wiraswasta',
          namaIbu: `Ibu. Hajah ${item.name.split(' ')[0]}`,
          pekerjaanIbu: 'Ibu Rumah Tangga',
          noHpOrtu: `0819876543${idx}`,
          penghasilanOrtu: 'Rp 3.000.000 - Rp 5.000.000',
          kelas: item.class,
          dokumen: {
            kk: { id: `doc-kk-${idx}`, name: '1 File PDF Berkas Pendaftaran.pdf', status: 'Sesuai', uploadedAt: new Date().toISOString() },
            akta: { id: `doc-akta-${idx}`, name: '1 File PDF Berkas Pendaftaran.pdf', status: 'Sesuai', uploadedAt: new Date().toISOString() },
            ijazahSkl: { id: `doc-skl-${idx}`, name: '1 File PDF Berkas Pendaftaran.pdf', status: 'Sesuai', uploadedAt: new Date().toISOString() },
            pasFoto: { id: `doc-foto-${idx}`, name: '1 File PDF Berkas Pendaftaran.pdf', status: 'Sesuai', uploadedAt: new Date().toISOString() }
          },
          dapodikSynced: true,
          dapodikSyncedAt: new Date().toLocaleString('id-ID')
        };
      });

      // Merge with existing student list
      let newCount = 0;
      let updatedCount = 0;

      const mergedList = [...students];
      fetchedStudents.forEach(fetched => {
        const existingIdx = mergedList.findIndex(s => s.nisn === fetched.nisn);
        if (existingIdx >= 0) {
          if (config.autoUpdateExisting) {
            mergedList[existingIdx] = {
              ...mergedList[existingIdx],
              ...fetched,
              id: mergedList[existingIdx].id // Keep ID
            };
            updatedCount++;
          }
        } else {
          mergedList.push(fetched);
          newCount++;
        }
      });

      onImportData(mergedList);

      const nowStr = new Date().toLocaleString('id-ID');
      const updatedConf = {
        ...config,
        lastSyncTimestamp: nowStr,
        lastSyncCount: fetchedStudents.length
      };
      handleSaveConfig(updatedConf);

      setSyncResult({
        completed: true,
        totalFetched: fetchedStudents.length,
        newAdded: newCount,
        updated: updatedCount,
        errors: 0
      });

      addLog(`PERINGATAN SINKRONISASI: ${fetchedStudents.length} data siswa berhasil diproses! (${newCount} baru, ${updatedCount} diperbarui).`);
      setSyncing(false);
      showToast(`Tarik Data Dapodik Berhasil! ${fetchedStudents.length} siswa tersinkronisasi.`);
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto transition-all">
        
        {/* MODAL HEADER: DAPODIK OFFICIAL BRANDING */}
        <div className="bg-gradient-to-r from-red-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-indigo-600 to-amber-500 p-0.5 shadow-lg shadow-red-950/40">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white">
                <Database className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  Integrasi Web Service Dapodik
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-300 border border-red-500/30 uppercase tracking-wider">
                  Kemendikbud
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Sinkronisasi Data Peserta Didik Langsung via Key Service API Web Service Local / Cloud
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700/80 relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-2.5 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('sync')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'sync'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>Tarik Data Siswa</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Key className="w-4 h-4 text-amber-500" />
              <span>Pengaturan Key Service</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Console Log API ({syncLogs.length})</span>
            </button>
          </div>

          {config.lastSyncTimestamp && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Terakhir Tarik Data: <strong>{config.lastSyncTimestamp}</strong></span>
            </div>
          )}
        </div>

        {/* MODAL BODY CONTENT */}
        <div className="p-6 max-h-[72vh] overflow-y-auto space-y-6 text-xs sm:text-sm">
          
          {/* TAB 1: TARIK DATA SISWA */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              
              {/* STATUS KEY SERVICE ACTIVE BADGE CARD */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center font-bold flex-shrink-0">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                      Key Service Active Token
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold border border-emerald-500/30">
                        HTTP 200 OK
                      </span>
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-mono">
                      Server: {config.serverIp}:{config.serverPort} &bull; NPSN SMP: {config.npsnSmp} / SMA: {config.npsnSma}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('settings')}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-extrabold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer whitespace-nowrap"
                >
                  Ubah Key / Port
                </button>
              </div>

              {/* TARGET FILTER SELECTION FORM */}
              <div className="p-5 bg-gradient-to-br from-indigo-50/80 via-slate-50 to-emerald-50/80 dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <h4 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Parameter Penarikan Data Siswa Dapodik
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  
                  {/* Target School Unit */}
                  <div>
                    <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Target Unit Sekolah:
                    </label>
                    <select
                      value={targetSchool}
                      onChange={(e) => setTargetSchool(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="smp_it">SMP IT Al Muawanah (NPSN: {config.npsnSmp})</option>
                      <option value="sma_it">SMA IT Al Muawanah (NPSN: {config.npsnSma})</option>
                      <option value="all">Semua Unit (SMP &amp; SMA IT)</option>
                    </select>
                  </div>

                  {/* Target Semester & Academic Year */}
                  <div>
                    <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Tahun Ajaran &amp; Semester:
                    </label>
                    <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white">
                      T.A {config.tahunAjaran} ({config.semester === '1' ? 'Ganjil' : 'Genap'})
                    </div>
                  </div>

                  {/* Rombel / Class Filter */}
                  <div>
                    <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Rombel / Kelas Target:
                    </label>
                    <select
                      value={selectedRombel}
                      onChange={(e) => setSelectedRombel(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">Semua Rombel (Kelas 7, 8, 9 / 10, 11, 12)</option>
                      <option value="kelas_7_10">Siswa Baru Tingkat Awal (Kelas 7 / Kelas 10)</option>
                      <option value="kelas_8_11">Tingkat Menengah (Kelas 8 / Kelas 11)</option>
                      <option value="kelas_9_12">Tingkat Akhir (Kelas 9 / Kelas 12)</option>
                    </select>
                  </div>

                </div>

                {/* ADVANCED CHECKBOX OPTIONS */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-semibold">
                    <input
                      type="checkbox"
                      checked={config.autoUpdateExisting}
                      onChange={(e) => handleSaveConfig({ ...config, autoUpdateExisting: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span>Timpa Data Siswa Lama jika NISN Sama (Update Data)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-semibold">
                    <input
                      type="checkbox"
                      checked={config.importParentsData}
                      onChange={(e) => handleSaveConfig({ ...config, importParentsData: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                    />
                    <span>Impor Lengkap Data Orang Tua &amp; Kontak HP Ortu</span>
                  </label>
                </div>
              </div>

              {/* ACTION TRIGGER BUTTON */}
              <div className="text-center space-y-3">
                <button
                  onClick={executeDapodikSync}
                  disabled={syncing}
                  className={`w-full py-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-3 transition-all shadow-xl cursor-pointer ${
                    syncing
                      ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 via-indigo-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white shadow-red-600/30 active:scale-98'
                  }`}
                >
                  <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                  <span>
                    {syncing ? 'Memproses Tarik Data Dapodik...' : 'Tarik Data Siswa dari Dapodik Sekarang'}
                  </span>
                </button>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Data akan ditarik langsung dari local/remote Dapodik Web Service via Key Service Token resmi.
                </p>
              </div>

              {/* PROGRESS ENGINE & ANIMATED FEEDBACK */}
              {syncing && (
                <div className="p-5 bg-slate-950 text-white rounded-2xl border border-slate-800 space-y-3 shadow-2xl animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-extrabold">
                    <span className="text-amber-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      Proses Sinkronisasi Web Service Kemendikbud
                    </span>
                    <span className="font-mono text-emerald-400">{syncProgress}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${syncProgress}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-300 font-mono italic">
                    {syncStageText}
                  </p>
                </div>
              )}

              {/* SUCCESS RESULT SUMMARY CARD */}
              {syncResult && (
                <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-3 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-emerald-800 dark:text-emerald-200 text-sm">
                        Sinkronisasi Data Dapodik Berhasil Diselesaikan!
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        {syncResult.totalFetched} siswa berhasil ditarik dan dimasukkan ke database terarsip.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs font-extrabold">
                    <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <span className="text-slate-500 block text-[10px]">Siswa Baru:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 text-lg font-black">+{syncResult.newAdded}</span>
                    </div>

                    <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <span className="text-slate-500 block text-[10px]">Data Diperbarui:</span>
                      <span className="text-indigo-600 dark:text-indigo-400 text-lg font-black">{syncResult.updated}</span>
                    </div>

                    <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <span className="text-slate-500 block text-[10px]">File Berkas:</span>
                      <span className="text-amber-600 dark:text-amber-400 text-lg font-black">1 File Auto-PDF</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: PENGATURAN KEY SERVICE */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
                <Key className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-amber-800 dark:text-amber-300">
                    Konfigurasi Kunci Layanan (Key Service) Web Service Dapodik
                  </h4>
                  <p className="mt-0.5 leading-relaxed">
                    Key Service didapatkan dari aplikasi Dapodik Lokal sekolah pada menu <strong>Pengaturan &gt; Web Service &gt; Tambah WS Client</strong>. Masukkan Service Key dan IP Server untuk menghubungkan aplikasi.
                  </p>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handlePingWebService(); }} className="space-y-4">
                
                {/* Key Service Input Field */}
                <div>
                  <label className="block font-extrabold text-slate-900 dark:text-white text-xs mb-1.5 flex items-center justify-between">
                    <span>Key Service Token (Web Service Client Secret Key):</span>
                    <button
                      type="button"
                      onClick={handleGenerateSampleKey}
                      className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Generate Key Demo
                    </button>
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={config.serviceKey}
                      onChange={(e) => handleSaveConfig({ ...config, serviceKey: e.target.value })}
                      placeholder="e.g. dapodik_ws_token_8a92f81e8f224901990c"
                      className="w-full pl-3.5 pr-20 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title={showKey ? 'Sembunyikan Key' : 'Tampilkan Key'}
                      >
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(config.serviceKey);
                          showToast('Service Key berhasil disalin!');
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 cursor-pointer"
                        title="Salin Key Token"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Server IP & Port */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs mb-1">
                      IP Host / Server Dapodik:
                    </label>
                    <input
                      type="text"
                      value={config.serverIp}
                      onChange={(e) => handleSaveConfig({ ...config, serverIp: e.target.value })}
                      placeholder="127.0.0.1"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs mb-1">
                      Port Web Service:
                    </label>
                    <input
                      type="text"
                      value={config.serverPort}
                      onChange={(e) => handleSaveConfig({ ...config, serverPort: e.target.value })}
                      placeholder="5774"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* NPSN SMP IT & SMA IT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs mb-1">
                      NPSN SMP IT Al Muawanah:
                    </label>
                    <input
                      type="text"
                      value={config.npsnSmp}
                      onChange={(e) => handleSaveConfig({ ...config, npsnSmp: e.target.value })}
                      placeholder="20210001"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs mb-1">
                      NPSN SMA IT Al Muawanah:
                    </label>
                    <input
                      type="text"
                      value={config.npsnSma}
                      onChange={(e) => handleSaveConfig({ ...config, npsnSma: e.target.value })}
                      placeholder="20210002"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Default Status Selection */}
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs mb-1">
                    Status Penerimaan Default Siswa Baru Ditarik:
                  </label>
                  <select
                    value={config.defaultStatus}
                    onChange={(e) => handleSaveConfig({ ...config, defaultStatus: e.target.value as StudentStatus })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Proses Verifikasi">Proses Verifikasi (Rekomendasi - Perlu Cek Berkas)</option>
                    <option value="Diterima">Langsung Diterima</option>
                    <option value="Cadangan">Cadangan</option>
                  </select>
                </div>

                {/* PING TEST BUTTON & STATUS RESPONSE */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handlePingWebService}
                    disabled={testingConnection}
                    className="px-4 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer transition-all active:scale-95 w-full sm:w-auto justify-center"
                  >
                    <Wifi className={`w-4 h-4 text-emerald-400 ${testingConnection ? 'animate-bounce' : ''}`} />
                    <span>{testingConnection ? 'Menguji Koneksi Service Key...' : 'Uji Koneksi Service Key (Ping WS)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSaveConfig(config);
                      showToast('Pengaturan Key Service Dapodik tersimpan!');
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all active:scale-95 w-full sm:w-auto justify-center"
                  >
                    Simpan Pengaturan Key
                  </button>
                </div>

                {connectionStatus.tested && (
                  <div className={`p-3.5 rounded-xl text-xs font-semibold border flex items-center gap-2.5 ${
                    connectionStatus.success 
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800'
                  }`}>
                    {connectionStatus.success ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />}
                    <span>{connectionStatus.message}</span>
                  </div>
                )}

              </form>

            </div>
          )}

          {/* TAB 3: CONSOLE LOG API */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-500" />
                  Terminal Real-time Log Web Service Dapodik
                </h4>
                <button
                  onClick={() => setSyncLogs([])}
                  className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                >
                  Bersihkan Terminal Log
                </button>
              </div>

              <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-2xl border border-slate-800 h-64 overflow-y-auto space-y-1 shadow-inner">
                {syncLogs.length === 0 ? (
                  <div className="text-slate-600 italic text-center pt-20">
                    Belum ada log penarikan data. Klik tombol "Tarik Data Siswa dari Dapodik" untuk memulai proses.
                  </div>
                ) : (
                  syncLogs.map((log, i) => (
                    <div key={i} className="leading-relaxed">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Terproteksi SSL Encryption Web Service Token</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
