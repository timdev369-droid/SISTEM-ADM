import React, { useState } from 'react';
import { Student, StudentStatus } from '../types';
import { getStatusBadgeStyle, getJalurBadgeStyle, formatDateIndonesian, getDocStatusBadgeStyle } from '../utils/formatters';
import { 
  X, 
  Printer, 
  Sparkles, 
  User, 
  GraduationCap, 
  Users, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Award, 
  ShieldAlert,
  Download,
  Building,
  CreditCard
} from 'lucide-react';

interface StudentDetailModalProps {
  student: Student | null;
  onClose: () => void;
  onPrintCard: (student: Student) => void;
  onAiVerify: (student: Student) => void;
  onUpdateStatus: (id: string, status: StudentStatus, notes?: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  onPrintCard,
  onAiVerify,
  onUpdateStatus
}) => {
  if (!student) return null;

  const [activeTab, setActiveTab] = useState<'biodata' | 'akademik' | 'orangtua' | 'dokumen' | 'evaluasi' | 'status'>('biodata');
  const [selectedStatus, setSelectedStatus] = useState<StudentStatus>(student.statusPenerimaan);
  const [catatanSekolah, setCatatanSekolah] = useState<string>(student.catatanSekolah || '');

  const handleSaveStatus = () => {
    onUpdateStatus(student.id, selectedStatus, catatanSekolah);
  };

  const docsList = [
    { label: 'Kartu Keluarga (KK)', item: student.dokumen?.kk },
    { label: 'Akta Kelahiran', item: student.dokumen?.akta },
    { label: 'Ijazah / SKL', item: student.dokumen?.ijazahSkl },
    { label: 'Pas Foto 3x4', item: student.dokumen?.pasFoto },
    { label: 'Sertifikat Prestasi (Opsional)', item: student.dokumen?.sertifikat }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header Banner */}
        <div className="bg-slate-900 text-white p-5 relative overflow-hidden flex-shrink-0">
          <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-start justify-between relative z-10 gap-4">
            <div className="flex items-center gap-4">
              <img
                src={student.pasFotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={student.namaLengkap}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-md bg-slate-800"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                    {student.noRegistrasi}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${getStatusBadgeStyle(student.statusPenerimaan)}`}>
                    {student.statusPenerimaan}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${getJalurBadgeStyle(student.jalurPendaftaran)}`}>
                    {student.jalurPendaftaran}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{student.namaLengkap}</h2>
                <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-3">
                  <span>NISN: <strong className="font-mono text-indigo-300">{student.nisn}</strong></span>
                  <span>&bull;</span>
                  <span>{student.asalSekolah}</span>
                  <span>&bull;</span>
                  <span>Pilihan: <strong className="text-emerald-400">{student.jurusanPilihan}</strong></span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Header Buttons */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-400">Terdaftar pada: {formatDateIndonesian(student.tanggalDaftar)}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAiVerify(student)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analisis AI Gemini</span>
              </button>
              <button
                onClick={() => onPrintCard(student)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Kartu Bukti</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-4 overflow-x-auto flex-shrink-0">
          <button
            onClick={() => setActiveTab('biodata')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'biodata'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Data Pribadi</span>
          </button>

          <button
            onClick={() => setActiveTab('akademik')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'akademik'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Akademik & Sekolah</span>
          </button>

          <button
            onClick={() => setActiveTab('orangtua')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'orangtua'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Orang Tua / Wali</span>
          </button>

          <button
            onClick={() => setActiveTab('dokumen')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'dokumen'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Dokumen Digital</span>
          </button>

          <button
            onClick={() => setActiveTab('evaluasi')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'evaluasi'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Evaluasi AI ({student.evaluasiAi?.skorKelengkapan || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'status'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Verifikasi Status</span>
          </button>
        </div>

        {/* Tab Contents Area */}
        <div className="p-6 overflow-y-auto flex-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          
          {/* TAB 1: BIODATA */}
          {activeTab === 'biodata' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 dark:border-slate-700">
                  <User className="w-4 h-4 text-indigo-600" /> Identitas Pribadi
                </h4>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500">Nama Lengkap:</span>
                  <span className="col-span-2 font-semibold text-slate-900 dark:text-white">{student.namaLengkap}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500">NISN:</span>
                  <span className="col-span-2 font-mono font-medium">{student.nisn}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500">NIK:</span>
                  <span className="col-span-2 font-mono font-medium">{student.nik}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500">Jenis Kelamin:</span>
                  <span className="col-span-2 font-medium">{student.jenisKelamin}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500">Tempat, Tgl Lahir:</span>
                  <span className="col-span-2 font-medium">{student.tempatLahir}, {formatDateIndonesian(student.tanggalLahir)}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500">Agama:</span>
                  <span className="col-span-2 font-medium">{student.agama}</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 dark:border-slate-700">
                  <MapPin className="w-4 h-4 text-indigo-600" /> Kontak & Domisili
                </h4>
                <div className="space-y-1">
                  <span className="text-slate-500 block">Alamat Lengkap:</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    {student.alamat}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-1 pt-2">
                  <span className="text-slate-500 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> No. HP:</span>
                  <span className="col-span-2 font-mono font-semibold text-indigo-600 dark:text-indigo-400">{student.noTelepon}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500 flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email:</span>
                  <span className="col-span-2 font-medium text-slate-800 dark:text-slate-200">{student.email}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AKADEMIK */}
          {activeTab === 'akademik' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 dark:border-slate-700">
                  <Building className="w-4 h-4 text-indigo-600" /> Riwayat Sekolah Asal
                </h4>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500">Asal Sekolah:</span>
                  <span className="col-span-2 font-bold text-slate-900 dark:text-white">{student.asalSekolah}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500">Tahun Lulus:</span>
                  <span className="col-span-2 font-medium">{student.tahunLulus}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500">Rata-Rata Rapor:</span>
                  <span className="col-span-2 text-base font-extrabold text-indigo-600 dark:text-indigo-400">{student.nilaiRapor} / 100</span>
                </div>
                <div className="pt-2">
                  <span className="text-slate-500 block mb-1">Prestasi / Penghargaan:</span>
                  <div className="bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 p-2.5 rounded-lg border border-purple-200 dark:border-purple-800 text-xs font-medium">
                    {student.prestasi || 'Tidak ada prestasi khusus terdaftar'}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 dark:border-slate-700">
                  <GraduationCap className="w-4 h-4 text-indigo-600" /> Pilihan Jurusan PPDB
                </h4>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500">Jalur Pendaftaran:</span>
                  <span className="col-span-2 font-bold text-slate-900 dark:text-white">{student.jalurPendaftaran}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500">Pilihan Utama:</span>
                  <span className="col-span-2 font-bold text-emerald-600 dark:text-emerald-400 text-sm">{student.jurusanPilihan}</span>
                </div>
                {student.jurusanSekunder && (
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-slate-500">Pilihan Cadangan:</span>
                    <span className="col-span-2 font-medium">{student.jurusanSekunder}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ORANG TUA */}
          {activeTab === 'orangtua' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 dark:border-slate-700">
                  <Users className="w-4 h-4 text-indigo-600" /> Data Ayah Kandung
                </h4>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500">Nama Ayah:</span>
                  <span className="col-span-2 font-bold text-slate-900 dark:text-white">{student.namaAyah}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500">Pekerjaan Ayah:</span>
                  <span className="col-span-2 font-medium">{student.pekerjaanAyah}</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-2 dark:border-slate-700">
                  <Users className="w-4 h-4 text-indigo-600" /> Data Ibu Kandung
                </h4>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500">Nama Ibu:</span>
                  <span className="col-span-2 font-bold text-slate-900 dark:text-white">{student.namaIbu}</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500">Pekerjaan Ibu:</span>
                  <span className="col-span-2 font-medium">{student.pekerjaanIbu}</span>
                </div>
              </div>

              <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block mb-0.5">No. HP Orang Tua / Wali:</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">{student.noHpOrtu}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Penghasilan Orang Tua (Gabungan):</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{student.penghasilanOrtu}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DOKUMEN DIGITAL */}
          {activeTab === 'dokumen' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">Daftar Berkas & Lampiran Pengarsipan</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {docsList.map((doc, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-900 dark:text-white text-xs">{doc.label}</div>
                      <div className="text-[11px] text-slate-500 font-mono truncate max-w-[180px]">
                        {doc.item?.name || 'Belum Diunggah'}
                      </div>
                      <div>
                        <span className={getDocStatusBadgeStyle(doc.item?.status || 'Belum Upload')}>
                          {doc.item?.status || 'Belum Upload'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {doc.item?.fileUrl && (
                        <a
                          href={doc.item.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs hover:bg-indigo-100 transition-colors"
                        >
                          Unduh
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: EVALUASI AI GEMINI */}
          {activeTab === 'evaluasi' && (
            <div className="space-y-4">
              {student.evaluasiAi ? (
                <div className="bg-gradient-to-br from-indigo-900/10 via-purple-900/10 to-slate-900/5 dark:from-indigo-950/40 dark:to-purple-950/40 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-200/60 dark:border-indigo-800/60 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">Hasil Evaluasi AI Gemini</h4>
                    </div>
                    <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-xs font-bold shadow-xs">
                      Skor Kelengkapan: {student.evaluasiAi.skorKelengkapan} / 100
                    </span>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider mb-1">Rekomendasi Evaluator:</h5>
                    <p className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900 text-slate-700 dark:text-slate-300 font-medium">
                      {student.evaluasiAi.rekomendasi}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60">
                      <h5 className="font-bold text-emerald-700 dark:text-emerald-400 text-xs mb-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Keunggulan Utama Siswa:
                      </h5>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-xs">
                        {student.evaluasiAi.keunggulan?.map((k, i) => (
                          <li key={i}>{k}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60">
                      <h5 className="font-bold text-amber-700 dark:text-amber-400 text-xs mb-2 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Catatan Penting Verifikator:
                      </h5>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-xs">
                        {student.evaluasiAi.catatanVerifikator?.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <Sparkles className="w-8 h-8 text-indigo-500 mx-auto mb-2 animate-bounce" />
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Belum ada analisis AI untuk siswa ini</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Jalankan analisis AI Gemini secara otomatis untuk memeriksa kelengkapan berkas, nilai, dan memberikan rekomendasi penerimaan.
                  </p>
                  <button
                    onClick={() => onAiVerify(student)}
                    className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Jalankan Verifikasi AI Sekarang
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: STATUS & VERIFIKASI */}
          {activeTab === 'status' && (
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white">Ubah Status Penerimaan & Catatan Verifikator</h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Diterima', 'Proses Verifikasi', 'Cadangan', 'Ditolak'] as StudentStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      selectedStatus === st
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Catatan Panitia PPDB / Pengarsip:
                </label>
                <textarea
                  value={catatanSekolah}
                  onChange={(e) => setCatatanSekolah(e.target.value)}
                  placeholder="Masukkan catatan fisik, kelengkapan seragam, atau jadwal verifikasi ulang..."
                  rows={3}
                  className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveStatus}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Simpan Perubahan Status
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center flex-shrink-0">
          <span className="text-xs text-slate-500">ID Arsip: {student.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
