import React, { useState, useEffect } from 'react';
import { Student, RegistrationPath, Major, Gender, StudentStatus, SchoolId } from '../types';
import { SCHOOLS } from '../data/schools';
import { X, ChevronRight, ChevronLeft, Save, CheckCircle2, User, GraduationCap, Users, FileText } from 'lucide-react';

interface StudentFormModalProps {
  studentToEdit?: Student | null;
  activeSchoolId?: SchoolId;
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  studentToEdit,
  activeSchoolId = 'sma_it',
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const currentSchool = SCHOOLS.find(s => s.id === activeSchoolId) || SCHOOLS[1];
  const availableMajors = currentSchool.majors;

  const [step, setStep] = useState<number>(1);

  // Form State
  const [formData, setFormData] = useState<Partial<Student>>({
    noRegistrasi: `PPDB-2026-${Math.floor(100 + Math.random() * 900)}`,
    namaLengkap: '',
    nisn: '',
    nik: '',
    jenisKelamin: 'Laki-Laki',
    tempatLahir: '',
    tanggalLahir: '2008-01-01',
    agama: 'Islam',
    alamat: '',
    noTelepon: '',
    email: '',
    pasFotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    asalSekolah: '',
    tahunLulus: 2026,
    nilaiRapor: 85.0,
    prestasi: '',
    jalurPendaftaran: 'Zonasi',
    jurusanPilihan: 'IPA / MIPA',
    jurusanSekunder: 'IPS / Soshum',
    statusPenerimaan: 'Proses Verifikasi',
    tanggalDaftar: new Date().toISOString().slice(0, 10),
    namaAyah: '',
    pekerjaanAyah: '',
    namaIbu: '',
    pekerjaanIbu: '',
    noHpOrtu: '',
    penghasilanOrtu: 'Rp 5.000.000 - Rp 7.500.000',
    dokumen: {
      kk: { id: `doc-${Date.now()}-kk`, name: 'Kartu Keluarga.pdf', status: 'Sesuai' },
      akta: { id: `doc-${Date.now()}-akta`, name: 'Akta Kelahiran.pdf', status: 'Sesuai' },
      ijazahSkl: { id: `doc-${Date.now()}-skl`, name: 'SKL_Lulus.pdf', status: 'Sesuai' },
      pasFoto: { id: `doc-${Date.now()}-foto`, name: 'PasFoto_3x4.jpg', status: 'Sesuai' },
    }
  });

  useEffect(() => {
    if (studentToEdit) {
      setFormData(studentToEdit);
    }
  }, [studentToEdit]);

  const handleChange = (field: keyof Student, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaLengkap || !formData.nisn || !formData.asalSekolah) {
      alert('Mohon lengkapi data Nama, NISN, dan Asal Sekolah!');
      return;
    }

    const newStudentObj: Student = {
      id: studentToEdit ? studentToEdit.id : `REG-2026-${Math.floor(100 + Math.random() * 900)}`,
      noRegistrasi: formData.noRegistrasi || `PPDB-2026-${Math.floor(100 + Math.random() * 900)}`,
      namaLengkap: formData.namaLengkap || '',
      nisn: formData.nisn || '',
      nik: formData.nik || '',
      jenisKelamin: (formData.jenisKelamin as Gender) || 'Laki-Laki',
      tempatLahir: formData.tempatLahir || '',
      tanggalLahir: formData.tanggalLahir || '2008-01-01',
      agama: formData.agama || 'Islam',
      alamat: formData.alamat || '',
      noTelepon: formData.noTelepon || '',
      email: formData.email || '',
      pasFotoUrl: formData.pasFotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
      asalSekolah: formData.asalSekolah || '',
      tahunLulus: Number(formData.tahunLulus) || 2026,
      nilaiRapor: Number(formData.nilaiRapor) || 80,
      prestasi: formData.prestasi || '',
      jalurPendaftaran: (formData.jalurPendaftaran as RegistrationPath) || 'Zonasi',
      jurusanPilihan: (formData.jurusanPilihan as Major) || 'IPA / MIPA',
      jurusanSekunder: formData.jurusanSekunder as Major,
      statusPenerimaan: (formData.statusPenerimaan as StudentStatus) || 'Proses Verifikasi',
      tanggalDaftar: formData.tanggalDaftar || new Date().toISOString().slice(0, 10),
      namaAyah: formData.namaAyah || '',
      pekerjaanAyah: formData.pekerjaanAyah || '',
      namaIbu: formData.namaIbu || '',
      pekerjaanIbu: formData.pekerjaanIbu || '',
      noHpOrtu: formData.noHpOrtu || '',
      penghasilanOrtu: formData.penghasilanOrtu || 'Rp 5.000.000 - Rp 7.500.000',
      kelas: formData.kelas || (activeSchoolId === 'smp_it' ? 'Kelas 7' : 'Kelas 10'),
      dokumen: formData.dokumen || {
        kk: { id: 'kk-1', name: 'KK.pdf', status: 'Sesuai' },
        akta: { id: 'ak-1', name: 'Akta.pdf', status: 'Sesuai' },
        ijazahSkl: { id: 'sk-1', name: 'SKL.pdf', status: 'Sesuai' },
        pasFoto: { id: 'ft-1', name: 'Foto.jpg', status: 'Sesuai' }
      },
      catatanSekolah: formData.catatanSekolah || ''
    };

    onSave(newStudentObj);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div>
            <h3 className="font-bold text-base text-white">
              {studentToEdit ? 'Edit Arsip Data & Dokumen Siswa' : 'Tambah Arsip Data & Dokumen Siswa'}
            </h3>
            <p className="text-xs text-slate-400">
              Formulir input &amp; rekapitulasi data dokumen siswa digital
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Navigation */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-around text-xs font-semibold flex-shrink-0">
          <button onClick={() => setStep(1)} className={`flex items-center gap-1.5 ${step === 1 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>1</span>
            <span className="hidden sm:inline">Jalur & Jurusan</span>
          </button>

          <ChevronRight className="w-4 h-4 text-slate-300" />

          <button onClick={() => setStep(2)} className={`flex items-center gap-1.5 ${step === 2 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>2</span>
            <span className="hidden sm:inline">Biodata Siswa</span>
          </button>

          <ChevronRight className="w-4 h-4 text-slate-300" />

          <button onClick={() => setStep(3)} className={`flex items-center gap-1.5 ${step === 3 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>3</span>
            <span className="hidden sm:inline">Sekolah & Nilai</span>
          </button>

          <ChevronRight className="w-4 h-4 text-slate-300" />

          <button onClick={() => setStep(4)} className={`flex items-center gap-1.5 ${step === 4 ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 4 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>4</span>
            <span className="hidden sm:inline">Orang Tua</span>
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
          
          {/* STEP 1: Jalur & Program */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 border-b pb-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" /> Jalur Pendaftaran & Jurusan Pilihan
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    No. Registrasi / Pendaftaran:
                  </label>
                  <input
                    type="text"
                    value={formData.noRegistrasi}
                    onChange={(e) => handleChange('noRegistrasi', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jalur Pendaftaran:
                  </label>
                  <select
                    value={formData.jalurPendaftaran}
                    onChange={(e) => handleChange('jalurPendaftaran', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Zonasi">Zonasi Domisili</option>
                    <option value="Prestasi">Prestasi Akademik / Non-Akademik</option>
                    <option value="Afirmasi">Afirmasi (KIP / Kurang Mampu)</option>
                    <option value="Perpindahan Orang Tua">Perpindahan Tugas Orang Tua</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Pilihan Jurusan / Program ({currentSchool.shortName}):
                  </label>
                  <select
                    value={formData.jurusanPilihan}
                    onChange={(e) => handleChange('jurusanPilihan', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    {availableMajors.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tingkat / Rombel Kelas:
                  </label>
                  <select
                    value={formData.kelas || (activeSchoolId === 'smp_it' ? 'Kelas 7' : 'Kelas 10')}
                    onChange={(e) => handleChange('kelas', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    {activeSchoolId === 'smp_it' ? (
                      <>
                        <option value="Kelas 7">Kelas 7 SMP IT</option>
                        <option value="Kelas 8">Kelas 8 SMP IT</option>
                        <option value="Kelas 9">Kelas 9 SMP IT</option>
                      </>
                    ) : (
                      <>
                        <option value="Kelas 10">Kelas 10 SMA IT</option>
                        <option value="Kelas 11">Kelas 11 SMA IT</option>
                        <option value="Kelas 12">Kelas 12 SMA IT</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status Penerimaan Awal:
                  </label>
                  <select
                    value={formData.statusPenerimaan}
                    onChange={(e) => handleChange('statusPenerimaan', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Proses Verifikasi">Proses Verifikasi</option>
                    <option value="Diterima">Diterima</option>
                    <option value="Cadangan">Cadangan</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Biodata Siswa */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 border-b pb-2">
                <User className="w-4 h-4 text-indigo-600" /> Biodata Lengkap Calon Siswa
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap Siswa:
                  </label>
                  <input
                    type="text"
                    value={formData.namaLengkap}
                    onChange={(e) => handleChange('namaLengkap', e.target.value)}
                    placeholder="Contoh: Muhammad Rizky Pratama"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    NISN (10 Digit):
                  </label>
                  <input
                    type="text"
                    value={formData.nisn}
                    onChange={(e) => handleChange('nisn', e.target.value)}
                    placeholder="0081234567"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    NIK KTP / KK (16 Digit):
                  </label>
                  <input
                    type="text"
                    value={formData.nik}
                    onChange={(e) => handleChange('nik', e.target.value)}
                    placeholder="3273012345670001"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Jenis Kelamin:
                  </label>
                  <select
                    value={formData.jenisKelamin}
                    onChange={(e) => handleChange('jenisKelamin', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Laki-Laki">Laki-Laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Agama:
                  </label>
                  <select
                    value={formData.agama}
                    onChange={(e) => handleChange('agama', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Khonghucu">Khonghucu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tempat Lahir:
                  </label>
                  <input
                    type="text"
                    value={formData.tempatLahir}
                    onChange={(e) => handleChange('tempatLahir', e.target.value)}
                    placeholder="Bandung"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Lahir:
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) => handleChange('tanggalLahir', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alamat Lengkap Domisili:
                  </label>
                  <textarea
                    value={formData.alamat}
                    onChange={(e) => handleChange('alamat', e.target.value)}
                    placeholder="Jl. Merdeka No. 45, Kecamatan Coblong, Kota Bandung..."
                    rows={2}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Sekolah & Nilai */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 border-b pb-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" /> Riwayat Sekolah Asal & Nilai Rapor
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Sekolah Asal (SMP / MTs):
                  </label>
                  <input
                    type="text"
                    value={formData.asalSekolah}
                    onChange={(e) => handleChange('asalSekolah', e.target.value)}
                    placeholder="SMP Negeri 1 Bandung"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rata-Rata Nilai Rapor (Skala 0 - 100):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.nilaiRapor}
                    onChange={(e) => handleChange('nilaiRapor', parseFloat(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tahun Kelulusan:
                  </label>
                  <input
                    type="number"
                    value={formData.tahunLulus}
                    onChange={(e) => handleChange('tahunLulus', parseInt(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Prestasi Akademik / Non-Akademik (Opsional):
                  </label>
                  <input
                    type="text"
                    value={formData.prestasi}
                    onChange={(e) => handleChange('prestasi', e.target.value)}
                    placeholder="Contoh: Juara 1 Olimpiade Sains Matematika Kota (2025)"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Orang Tua */}
          {step === 4 && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 border-b pb-2">
                <Users className="w-4 h-4 text-indigo-600" /> Data Orang Tua / Wali Siswa
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Ayah Kandung:
                  </label>
                  <input
                    type="text"
                    value={formData.namaAyah}
                    onChange={(e) => handleChange('namaAyah', e.target.value)}
                    placeholder="Bambang Pratama"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Pekerjaan Ayah:
                  </label>
                  <input
                    type="text"
                    value={formData.pekerjaanAyah}
                    onChange={(e) => handleChange('pekerjaanAyah', e.target.value)}
                    placeholder="Pegawai Swasta / PNS / Wiraswasta"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Ibu Kandung:
                  </label>
                  <input
                    type="text"
                    value={formData.namaIbu}
                    onChange={(e) => handleChange('namaIbu', e.target.value)}
                    placeholder="Siti Rahmawati"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Pekerjaan Ibu:
                  </label>
                  <input
                    type="text"
                    value={formData.pekerjaanIbu}
                    onChange={(e) => handleChange('pekerjaanIbu', e.target.value)}
                    placeholder="Ibu Rumah Tangga / Guru / PNS"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    No. Telepon / WhatsApp Orang Tua:
                  </label>
                  <input
                    type="text"
                    value={formData.noHpOrtu}
                    onChange={(e) => handleChange('noHpOrtu', e.target.value)}
                    placeholder="081234567890"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Penghasilan Ortu:
                  </label>
                  <select
                    value={formData.penghasilanOrtu}
                    onChange={(e) => handleChange('penghasilanOrtu', e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Dibawah Rp 2.500.000">Dibawah Rp 2.500.000</option>
                    <option value="Rp 2.500.000 - Rp 5.000.000">Rp 2.500.000 - Rp 5.000.000</option>
                    <option value="Rp 5.000.000 - Rp 7.500.000">Rp 5.000.000 - Rp 7.500.000</option>
                    <option value="Rp 7.500.000 - Rp 10.000.000">Rp 7.500.000 - Rp 10.000.000</option>
                    <option value="Diatas Rp 10.000.000">Diatas Rp 10.000.000</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </form>

        {/* Modal Footer with Stepper Controls */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center flex-shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev + 1)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow-md transition-colors cursor-pointer"
            >
              <span>Lanjut</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Arsip Siswa</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
