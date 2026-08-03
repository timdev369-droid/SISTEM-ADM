import { StudentStatus, RegistrationPath, DocumentStatus } from '../types';

export const getStatusBadgeStyle = (status: StudentStatus) => {
  switch (status) {
    case 'Diterima':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50';
    case 'Proses Verifikasi':
      return 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50';
    case 'Cadangan':
      return 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50';
    case 'Ditolak':
      return 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

export const getJalurBadgeStyle = (jalur: RegistrationPath) => {
  switch (jalur) {
    case 'Zonasi':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300';
    case 'Prestasi':
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300';
    case 'Afirmasi':
      return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300';
    case 'Perpindahan Orang Tua':
      return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const getDocStatusBadgeStyle = (status: DocumentStatus) => {
  switch (status) {
    case 'Sesuai':
      return 'bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1';
    case 'Perlu Perbaikan':
      return 'bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1';
    case 'Belum Upload':
      return 'bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

export const formatDateIndonesian = (dateString: string) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
};

export const formatCurrency = (amountStr: string) => {
  if (!amountStr) return 'Rp 0';
  return amountStr;
};
