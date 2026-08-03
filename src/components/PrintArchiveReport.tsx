import React from 'react';
import { Student } from '../types';
import { formatDateIndonesian } from '../utils/formatters';
import { Printer, X, GraduationCap } from 'lucide-react';

interface PrintArchiveReportProps {
  students: Student[];
  schoolName?: string;
  onClose: () => void;
}

export const PrintArchiveReport: React.FC<PrintArchiveReportProps> = ({
  students,
  schoolName = 'SMP IT / SMA IT AL MUAWANAH',
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const total = students.length;
  const diterima = students.filter(s => s.statusPenerimaan === 'Diterima').length;
  const verifikasi = students.filter(s => s.statusPenerimaan === 'Proses Verifikasi').length;
  const cadangan = students.filter(s => s.statusPenerimaan === 'Cadangan').length;
  const ditolak = students.filter(s => s.statusPenerimaan === 'Ditolak').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Floating control buttons */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 print:hidden">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Laporan</span>
        </button>

        <button
          onClick={onClose}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl shadow-lg transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Printable Report Document */}
      <div className="bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-300 w-full max-w-4xl p-6 sm:p-8 my-auto font-sans print:shadow-none print:border-none print:max-w-none print:p-0 print:m-0">
        
        {/* Header Kop Surat */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
              <GraduationCap className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase text-slate-600">Yayasan Pendidikan Islam Al Muawanah</h2>
              <h1 className="text-base font-extrabold uppercase text-slate-900">{schoolName.toUpperCase()}</h1>
              <p className="text-[10px] text-slate-500">Sistem Pengarsipan &amp; Rekapitulasi Data Dokumen Siswa Digital</p>
            </div>
          </div>
          <div className="text-right text-[10px] text-slate-500">
            <div>Tanggal Cetak:</div>
            <div className="font-bold text-slate-900">{formatDateIndonesian(new Date().toISOString())}</div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider underline">LAPORAN REKAPITULASI DATA &amp; DOKUMEN DIGITAL SISWA</h3>
          <p className="text-xs text-slate-600 font-mono mt-0.5">TOTAL TERARSIP: {total} SISWA</p>
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4 text-center text-xs">
          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="text-[10px] text-emerald-800 font-medium">Diterima</div>
            <div className="text-base font-bold text-emerald-900">{diterima}</div>
          </div>
          <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="text-[10px] text-amber-800 font-medium">Verifikasi</div>
            <div className="text-base font-bold text-amber-900">{verifikasi}</div>
          </div>
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-[10px] text-blue-800 font-medium">Cadangan</div>
            <div className="text-base font-bold text-blue-900">{cadangan}</div>
          </div>
          <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg">
            <div className="text-[10px] text-rose-800 font-medium">Ditolak</div>
            <div className="text-base font-bold text-rose-900">{ditolak}</div>
          </div>
        </div>

        {/* Main Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <th className="p-2 border-r border-slate-300 w-8 text-center">No</th>
                <th className="p-2 border-r border-slate-300">No. Reg</th>
                <th className="p-2 border-r border-slate-300">Nama Siswa</th>
                <th className="p-2 border-r border-slate-300">NISN</th>
                <th className="p-2 border-r border-slate-300">Asal Sekolah</th>
                <th className="p-2 border-r border-slate-300 text-center">Nilai</th>
                <th className="p-2 border-r border-slate-300">Jalur</th>
                <th className="p-2 border-r border-slate-300">Jurusan</th>
                <th className="p-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.map((student, idx) => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="p-2 border-r border-slate-300 text-center">{idx + 1}</td>
                  <td className="p-2 border-r border-slate-300 font-mono">{student.noRegistrasi}</td>
                  <td className="p-2 border-r border-slate-300 font-bold">{student.namaLengkap}</td>
                  <td className="p-2 border-r border-slate-300 font-mono">{student.nisn}</td>
                  <td className="p-2 border-r border-slate-300">{student.asalSekolah}</td>
                  <td className="p-2 border-r border-slate-300 font-bold text-center">{student.nilaiRapor}</td>
                  <td className="p-2 border-r border-slate-300">{student.jalurPendaftaran}</td>
                  <td className="p-2 border-r border-slate-300">{student.jurusanPilihan}</td>
                  <td className="p-2 text-center font-semibold">{student.statusPenerimaan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="flex justify-between items-end text-xs text-center pt-4">
          <div className="w-48">
            <p className="text-slate-500 mb-12">Ketua Panitia PPDB,</p>
            <p className="font-bold underline text-slate-900">Drs. H. Mulyadi, M.M.</p>
            <p className="text-[10px] text-slate-500">NIP. 19800315 200501 1 003</p>
          </div>

          <div className="w-56">
            <p className="text-slate-500 mb-1">Bandung, {formatDateIndonesian(new Date().toISOString())}</p>
            <p className="text-slate-500 mb-12">Kepala Sekolah,</p>
            <p className="font-bold underline text-slate-900">Dr. H. Ahmad Dahlan, M.Pd.</p>
            <p className="text-[10px] text-slate-500">NIP. 19780512 200312 1 002</p>
          </div>
        </div>

      </div>
    </div>
  );
};
