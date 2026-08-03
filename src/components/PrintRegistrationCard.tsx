import React from 'react';
import { Student } from '../types';
import { formatDateIndonesian } from '../utils/formatters';
import { Printer, X, GraduationCap, CheckCircle } from 'lucide-react';

interface PrintRegistrationCardProps {
  student: Student | null;
  schoolName?: string;
  onClose: () => void;
}

export const PrintRegistrationCard: React.FC<PrintRegistrationCardProps> = ({
  student,
  schoolName = 'SMP IT / SMA IT AL MUAWANAH',
  onClose
}) => {
  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Floating control buttons (Hidden in print mode) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 print:hidden">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Sekarang</span>
        </button>

        <button
          onClick={onClose}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl shadow-lg transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Printable Sheet Card */}
      <div className="bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-300 w-full max-w-2xl p-6 sm:p-8 my-auto font-sans print:shadow-none print:border-none print:max-w-none print:p-0 print:m-0">
        
        {/* Official Kop Surat Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-center justify-between text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-900 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
              <GraduationCap className="w-8 h-8 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600">Yayasan Pendidikan Islam Al Muawanah</h2>
              <h1 className="text-lg font-extrabold uppercase tracking-tight text-slate-900">{schoolName.toUpperCase()}</h1>
              <p className="text-[10px] text-slate-500">Jl. Al Muawanah No. 1, Bandung &bull; Telp: (022) 7801234 &bull; Web: almuawanah.sch.id</p>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h3 className="text-base font-bold uppercase tracking-wider underline">KARTU ARSIP DATA &amp; DOKUMEN SISWA</h3>
          <p className="text-xs text-slate-600 font-mono mt-0.5">TANDA TERIMA ARSIP DIGITAL SISWA &bull; LEMBAGA AL MUAWANAH</p>
        </div>

        {/* Main Body Grid */}
        <div className="grid grid-cols-3 gap-6 text-xs mb-6">
          
          {/* Student Photo Box */}
          <div className="col-span-1 flex flex-col items-center justify-start space-y-2">
            <img
              src={student.pasFotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
              alt={student.namaLengkap}
              className="w-32 h-40 object-cover border-2 border-slate-900 rounded-lg shadow-sm"
            />
            <div className="text-center">
              <span className="font-mono font-bold text-xs block text-slate-900">{student.noRegistrasi}</span>
              <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 border border-slate-300 font-semibold text-[10px] rounded">
                Status: {student.statusPenerimaan}
              </span>
            </div>
          </div>

          {/* Student Detailed Information */}
          <div className="col-span-2 space-y-2">
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-1.5 font-semibold text-slate-600 w-36">Nama Lengkap:</td>
                  <td className="py-1.5 font-bold text-slate-900">{student.namaLengkap}</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-semibold text-slate-600">NISN:</td>
                  <td className="py-1.5 font-mono font-bold text-slate-900">{student.nisn}</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-semibold text-slate-600">NIK:</td>
                  <td className="py-1.5 font-mono text-slate-800">{student.nik}</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-semibold text-slate-600">Jenis Kelamin:</td>
                  <td className="py-1.5 text-slate-800">{student.jenisKelamin}</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-semibold text-slate-600">Tempat, Tgl Lahir:</td>
                  <td className="py-1.5 text-slate-800">{student.tempatLahir}, {formatDateIndonesian(student.tanggalLahir)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-semibold text-slate-600">Asal Sekolah:</td>
                  <td className="py-1.5 font-bold text-slate-900">{student.asalSekolah}</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-semibold text-slate-600">Rata-Rata Nilai Rapor:</td>
                  <td className="py-1.5 font-extrabold text-indigo-900 text-sm">{student.nilaiRapor} / 100</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-semibold text-slate-600">Jalur Pendaftaran:</td>
                  <td className="py-1.5 font-bold text-slate-900">{student.jalurPendaftaran}</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-semibold text-slate-600">Jurusan Pilihan:</td>
                  <td className="py-1.5 font-bold text-emerald-800">{student.jurusanPilihan}</td>
                </tr>
                <tr>
                  <td className="py-1.5 font-semibold text-slate-600">Nama Orang Tua:</td>
                  <td className="py-1.5 text-slate-800">{student.namaAyah} / {student.namaIbu}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

        {/* Instructions & Notes */}
        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-[11px] mb-8 space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Catatan Penting Pendaftar:
          </div>
          <ol className="list-decimal list-inside text-slate-600 space-y-0.5 pl-1">
            <li>Kartu bukti pendaftaran ini merupakan dokumen sah tanda terima pendaftaran digital PPDB 2026/2027.</li>
            <li>Harap membawa kartu ini beserta dokumen berkas fisik asli saat melakukan verifikasi ulang di sekolah.</li>
            <li>Periksa pengumuman penetapan hasil seleksi penerimaan resmi melalui portal utama sekolah.</li>
          </ol>
        </div>

        {/* Signatures Area */}
        <div className="flex justify-between items-end text-xs text-center pt-2">
          <div className="w-48">
            <p className="text-slate-500 mb-12">Calon Siswa Baru,</p>
            <p className="font-bold underline text-slate-900">{student.namaLengkap}</p>
            <p className="text-[10px] text-slate-500 font-mono">NISN: {student.nisn}</p>
          </div>

          <div className="w-56">
            <p className="text-slate-500 mb-1">Bandung, {formatDateIndonesian(new Date().toISOString())}</p>
            <p className="text-slate-500 mb-12">Panitia PPDB & Pengarsip,</p>
            <p className="font-bold underline text-slate-900">Dr. H. Ahmad Dahlan, M.Pd.</p>
            <p className="text-[10px] text-slate-500">NIP. 19780512 200312 1 002</p>
          </div>
        </div>

      </div>
    </div>
  );
};
