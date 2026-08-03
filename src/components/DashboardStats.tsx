import React from 'react';
import { Student, StudentStatus } from '../types';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Award, 
  TrendingUp, 
  MapPin, 
  ShieldCheck,
  FileCheck,
  Sparkles
} from 'lucide-react';

interface DashboardStatsProps {
  students: Student[];
  onSelectStatusFilter?: (status: StudentStatus | 'semua') => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ 
  students,
  onSelectStatusFilter 
}) => {
  const total = students.length;
  
  const diterima = students.filter(s => s.statusPenerimaan === 'Diterima').length;
  const verifikasi = students.filter(s => s.statusPenerimaan === 'Proses Verifikasi').length;
  const cadangan = students.filter(s => s.statusPenerimaan === 'Cadangan').length;
  const ditolak = students.filter(s => s.statusPenerimaan === 'Ditolak').length;

  const jalurZonasi = students.filter(s => s.jalurPendaftaran === 'Zonasi').length;
  const jalurPrestasi = students.filter(s => s.jalurPendaftaran === 'Prestasi').length;
  const jalurAfirmasi = students.filter(s => s.jalurPendaftaran === 'Afirmasi').length;
  const jalurPindahan = students.filter(s => s.jalurPendaftaran === 'Perpindahan Orang Tua').length;

  const avgScore = total > 0 
    ? (students.reduce((acc, curr) => acc + (curr.nilaiRapor || 0), 0) / total).toFixed(1)
    : '0';

  const completeDocs = students.filter(s => {
    const docs = Object.values(s.dokumen || {});
    return docs.every((d: any) => d?.status === 'Sesuai');
  }).length;

  const docPercentage = total > 0 ? Math.round((completeDocs / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
      {/* Card 1: Total Rekap Siswa */}
      <div 
        onClick={() => onSelectStatusFilter && onSelectStatusFilter('semua')}
        className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer relative overflow-hidden group"
      >
        <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-indigo-50 dark:bg-indigo-950/40 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
        
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Siswa Terarsip
          </span>
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60 shadow-xs">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 relative z-10">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{total}</span>
          <span className="text-xs text-slate-500 font-medium">Siswa Terdaftar</span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 relative z-10">
          <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            100% Terarsip Sistem
          </span>
          <span className="text-[10px] text-indigo-500 font-bold group-hover:underline">Klik Filter &rarr;</span>
        </div>
      </div>

      {/* Card 2: Status Penerimaan Breakdown */}
      <div 
        onClick={() => onSelectStatusFilter && onSelectStatusFilter('Diterima')}
        className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-800 transition-all cursor-pointer relative overflow-hidden group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Status Kelulusan
          </span>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{diterima}</span>
          <span className="text-xs text-slate-500 font-medium">Diterima ({total > 0 ? Math.round((diterima/total)*100) : 0}%)</span>
        </div>
        
        {/* Progress bar stack */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex gap-0.5">
          <div style={{ width: `${total > 0 ? (diterima/total)*100 : 0}%` }} className="bg-emerald-500 h-full" title="Diterima" />
          <div style={{ width: `${total > 0 ? (verifikasi/total)*100 : 0}%` }} className="bg-amber-400 h-full" title="Proses Verifikasi" />
          <div style={{ width: `${total > 0 ? (cadangan/total)*100 : 0}%` }} className="bg-blue-400 h-full" title="Cadangan" />
          <div style={{ width: `${total > 0 ? (ditolak/total)*100 : 0}%` }} className="bg-rose-400 h-full" title="Ditolak" />
        </div>

        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> {verifikasi} Proses</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> {cadangan} Cadangan</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> {ditolak} Ditolak</span>
        </div>
      </div>

      {/* Card 3: Distribusi Jalur Pendaftaran */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Jalur Pendaftaran
          </span>
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/80 dark:text-purple-400 border border-purple-100 dark:border-purple-900/60 shadow-xs">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 mt-1 text-xs">
          <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-2 rounded-xl border border-indigo-100/60 dark:border-indigo-900/40">
            <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Zonasi</div>
            <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{jalurZonasi} <span className="text-[10px] font-normal text-slate-500">Siswa</span></div>
          </div>
          <div className="bg-purple-50/70 dark:bg-purple-950/40 p-2 rounded-xl border border-purple-100/60 dark:border-purple-900/40">
            <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Prestasi</div>
            <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{jalurPrestasi} <span className="text-[10px] font-normal text-slate-500">Siswa</span></div>
          </div>
          <div className="bg-teal-50/70 dark:bg-teal-950/40 p-2 rounded-xl border border-teal-100/60 dark:border-teal-900/40">
            <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">Afirmasi</div>
            <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{jalurAfirmasi} <span className="text-[10px] font-normal text-slate-500">Siswa</span></div>
          </div>
          <div className="bg-sky-50/70 dark:bg-sky-950/40 p-2 rounded-xl border border-sky-100/60 dark:border-sky-900/40">
            <div className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">Pindahan Ortu</div>
            <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{jalurPindahan} <span className="text-[10px] font-normal text-slate-500">Siswa</span></div>
          </div>
        </div>
      </div>

      {/* Card 4: Rata-Rata Nilai & Kelengkapan Berkas */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Akademik &amp; Berkas
          </span>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-100 dark:border-amber-900/60 shadow-xs">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="flex items-center justify-between mt-1">
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{avgScore}</div>
            <div className="text-[11px] text-slate-500 font-medium">Rata-Rata Rapor</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">{docPercentage}%</div>
            <div className="text-[11px] text-slate-500 font-medium">Berkas Lengkap</div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
            <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
            {completeDocs} dari {total} siswa validasi 100%
          </span>
          <span className="flex items-center gap-1 text-indigo-500 font-bold">
            <Sparkles className="w-3 h-3" />
            AI Ready
          </span>
        </div>
      </div>

    </div>
  );
};
