import React, { useState } from 'react';
import { Student, FilterOptions, StudentStatus, RegistrationPath } from '../types';
import { getStatusBadgeStyle, getJalurBadgeStyle, formatDateIndonesian } from '../utils/formatters';
import { UploadSingleDocModal } from './UploadSingleDocModal';
import { 
  Eye, 
  Edit3, 
  Trash2, 
  Printer, 
  Sparkles, 
  ArrowUpDown, 
  CheckSquare, 
  Square, 
  Filter, 
  X, 
  LayoutGrid, 
  List, 
  MoreVertical,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle,
  GraduationCap,
  Upload,
  FileCheck,
  FileText
} from 'lucide-react';

interface StudentTableProps {
  students: Student[];
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onViewStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onPrintCard: (student: Student) => void;
  onAiVerify: (student: Student) => void;
  onBatchUpdateStatus: (ids: string[], status: StudentStatus) => void;
  onBatchDelete: (ids: string[]) => void;
  onExportSelected: (students: Student[]) => void;
  onSaveStudent?: (student: Student) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  filters,
  onFilterChange,
  onViewStudent,
  onEditStudent,
  onDeleteStudent,
  onPrintCard,
  onAiVerify,
  onBatchUpdateStatus,
  onBatchDelete,
  onExportSelected,
  onSaveStudent
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortField, setSortField] = useState<'namaLengkap' | 'nilaiRapor' | 'tanggalDaftar' | 'noRegistrasi'>('tanggalDaftar');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [uploadModalStudent, setUploadModalStudent] = useState<Student | null>(null);

  // Handle Sort Toggle
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    // Search query
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchName = student.namaLengkap.toLowerCase().includes(q);
      const matchNisn = student.nisn.includes(q);
      const matchNoReg = student.noRegistrasi.toLowerCase().includes(q);
      const matchSchool = student.asalSekolah.toLowerCase().includes(q);
      const matchParent = student.namaAyah.toLowerCase().includes(q) || student.namaIbu.toLowerCase().includes(q);
      if (!matchName && !matchNisn && !matchNoReg && !matchSchool && !matchParent) return false;
    }

    // Jalur
    if (filters.jalur && filters.jalur !== 'semua' && student.jalurPendaftaran !== filters.jalur) {
      return false;
    }

    // Status
    if (filters.status && filters.status !== 'semua' && student.statusPenerimaan !== filters.status) {
      return false;
    }

    // Jurusan
    if (filters.jurusan && filters.jurusan !== 'semua' && student.jurusanPilihan !== filters.jurusan) {
      return false;
    }

    // Gender
    if (filters.jenisKelamin && filters.jenisKelamin !== 'semua' && student.jenisKelamin !== filters.jenisKelamin) {
      return false;
    }

    // Kelas
    if (filters.kelas && filters.kelas !== 'semua') {
      if (student.kelas && !student.kelas.toLowerCase().includes(filters.kelas.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Selection logic
  const isAllSelected = sortedStudents.length > 0 && selectedIds.length === sortedStudents.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedStudents.map(s => s.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectedStudentsObj = students.filter(s => selectedIds.includes(s.id));

  const activeFiltersCount = [
    filters.jalur !== 'semua' ? filters.jalur : null,
    filters.status !== 'semua' ? filters.status : null,
    filters.jurusan !== 'semua' ? filters.jurusan : null,
    filters.jenisKelamin !== 'semua' ? filters.jenisKelamin : null,
    filters.kelas && filters.kelas !== 'semua' ? filters.kelas : null,
  ].filter(Boolean).length;

  const resetFilters = () => {
    onFilterChange({
      search: '',
      jalur: 'semua',
      status: 'semua',
      jurusan: 'semua',
      jenisKelamin: 'semua',
      statusDokumen: 'semua',
      kelas: 'semua'
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
      
      {/* Filter & View Mode Controls Bar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Left: Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Jalur Dropdown */}
            <select
              value={filters.jalur}
              onChange={(e) => onFilterChange({ ...filters, jalur: e.target.value })}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none cursor-pointer"
            >
              <option value="semua">Semua Jalur Pendaftaran</option>
              <option value="Zonasi">Jalur Zonasi</option>
              <option value="Prestasi">Jalur Prestasi</option>
              <option value="Afirmasi">Jalur Afirmasi</option>
              <option value="Perpindahan Orang Tua">Jalur Perpindahan Ortu</option>
            </select>

            {/* Status Dropdown */}
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none cursor-pointer"
            >
              <option value="semua">Semua Status Penerimaan</option>
              <option value="Diterima">Diterima</option>
              <option value="Proses Verifikasi">Proses Verifikasi</option>
              <option value="Cadangan">Cadangan</option>
              <option value="Ditolak">Ditolak</option>
            </select>

            {/* Jurusan Dropdown */}
            <select
              value={filters.jurusan}
              onChange={(e) => onFilterChange({ ...filters, jurusan: e.target.value })}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none cursor-pointer"
            >
              <option value="semua">Semua Jurusan / Program</option>
              <option value="IPA / MIPA">IPA / MIPA</option>
              <option value="IPS / Soshum">IPS / Soshum</option>
              <option value="Teknik Komputer & Jaringan">Teknik Komputer & Jaringan (TKJ)</option>
              <option value="Desain Komunikasi Visual">Desain Komunikasi Visual (DKV)</option>
              <option value="Akuntansi & Keuangan">Akuntansi & Keuangan</option>
              <option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak (RPL)</option>
            </select>

            {/* Gender Dropdown */}
            <select
              value={filters.jenisKelamin}
              onChange={(e) => onFilterChange({ ...filters, jenisKelamin: e.target.value })}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none cursor-pointer"
            >
              <option value="semua">Semua Jenis Kelamin</option>
              <option value="Laki-Laki">Laki-Laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>

            {/* Kelas Dropdown */}
            <select
              value={filters.kelas || 'semua'}
              onChange={(e) => onFilterChange({ ...filters, kelas: e.target.value })}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none cursor-pointer"
            >
              <option value="semua">Semua Kelas</option>
              <option value="Kelas 7">Kelas 7</option>
              <option value="Kelas 8">Kelas 8</option>
              <option value="Kelas 9">Kelas 9</option>
              <option value="Kelas 10">Kelas 10</option>
              <option value="Kelas 11">Kelas 11</option>
              <option value="Kelas 12">Kelas 12</option>
            </select>

            {/* Reset Filter Button */}
            {(activeFiltersCount > 0 || filters.search) && (
              <button
                onClick={resetFilters}
                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filter ({activeFiltersCount})</span>
              </button>
            )}

          </div>

          {/* Right: View Toggles & Summary Count */}
          <div className="flex items-center justify-between lg:justify-end gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan <strong className="text-slate-800 dark:text-slate-200">{sortedStudents.length}</strong> dari {students.length} arsip
            </span>

            {/* Table / Grid Mode Toggle */}
            <div className="flex items-center p-0.5 bg-slate-200/70 dark:bg-slate-800 rounded-lg">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabel</span>
              </button>

              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kartu</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Batch Action Bar when rows selected */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-900 text-white p-3 px-4 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="bg-indigo-700 text-indigo-100 px-2 py-0.5 rounded-md">
              {selectedIds.length} Terpilih
            </span>
            <span>Aksi Massal:</span>
          </div>

          <div className="flex items-center flex-wrap gap-2 text-xs">
            <button
              onClick={() => onBatchUpdateStatus(selectedIds, 'Diterima')}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Set Diterima</span>
            </button>

            <button
              onClick={() => onBatchUpdateStatus(selectedIds, 'Cadangan')}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Set Cadangan</span>
            </button>

            <button
              onClick={() => onBatchUpdateStatus(selectedIds, 'Ditolak')}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Set Ditolak</span>
            </button>

            <button
              onClick={() => onExportSelected(selectedStudentsObj)}
              className="px-2.5 py-1 bg-indigo-700 hover:bg-indigo-600 text-white rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ekspor Terpilih</span>
            </button>

            <button
              onClick={() => {
                if (confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} arsip siswa terpilih?`)) {
                  onBatchDelete(selectedIds);
                  setSelectedIds([]);
                }
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Massal</span>
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="p-1 hover:bg-indigo-800 rounded text-indigo-200"
              title="Batal seleksi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main View Display */}
      {sortedStudents.length === 0 ? (
        <div className="py-16 text-center px-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Tidak ada arsip siswa yang sesuai
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau sesuaikan filter jalur dan status penerimaan pendaftar.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Bersihkan Filter
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-indigo-600">
                    {isAllSelected ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('noRegistrasi')}>
                  <div className="flex items-center gap-1">
                    <span>No. Reg / Tgl</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('namaLengkap')}>
                  <div className="flex items-center gap-1">
                    <span>Pendaftar & NISN</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Asal Sekolah</th>
                <th className="py-3 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('nilaiRapor')}>
                  <div className="flex items-center gap-1">
                    <span>Nilai Rapor</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Jalur & Jurusan</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Upload Berkas</th>
                <th className="py-3 px-3">Evaluasi AI</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {sortedStudents.map((student) => {
                const isSelected = selectedIds.includes(student.id);
                const hasUploadedDoc = student.dokumen && (
                  student.dokumen.ijazahSkl?.fileUrl || 
                  student.dokumen.kk?.fileUrl || 
                  student.dokumen.akta?.fileUrl ||
                  student.dokumen.pasFoto?.fileUrl
                );

                return (
                  <tr 
                    key={student.id} 
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <button onClick={() => toggleSelectOne(student.id)} className="text-slate-400 hover:text-indigo-600">
                        {isSelected ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* Registration No */}
                    <td className="py-3 px-3 font-mono font-medium text-slate-800 dark:text-slate-200">
                      <div>{student.noRegistrasi}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{formatDateIndonesian(student.tanggalDaftar)}</div>
                    </td>

                    {/* Student Avatar + Name + NISN */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={student.pasFotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={student.namaLengkap}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                        />
                        <div>
                          <div 
                            onClick={() => onViewStudent(student)}
                            className="font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer line-clamp-1"
                          >
                            {student.namaLengkap}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                            <span>NISN: {student.nisn}</span>
                            <span>&bull;</span>
                            <span>{student.jenisKelamin}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Origin School */}
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                      <div className="line-clamp-1">{student.asalSekolah}</div>
                      <div className="text-[10px] text-slate-400">Lulus {student.tahunLulus}</div>
                    </td>

                    {/* Grades */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {student.nilaiRapor}
                      </div>
                      {student.prestasi && student.prestasi !== '-' && (
                        <span className="inline-block text-[9px] text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded font-medium truncate max-w-[120px]" title={student.prestasi}>
                          Ada Prestasi
                        </span>
                      )}
                    </td>

                    {/* Jalur & Jurusan */}
                    <td className="py-3 px-3">
                      <div className="mb-1">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-md border ${getJalurBadgeStyle(student.jalurPendaftaran)}`}>
                          {student.jalurPendaftaran}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        {student.jurusanPilihan}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg border ${getStatusBadgeStyle(student.statusPenerimaan)}`}>
                        {student.statusPenerimaan}
                      </span>
                    </td>

                    {/* Upload Berkas (1 File per Siswa) */}
                    <td className="py-3 px-3">
                      {hasUploadedDoc ? (
                        <button
                          onClick={() => setUploadModalStudent(student)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-[11px] font-extrabold border border-emerald-300/80 dark:border-emerald-800 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                          title="1 File Berkas Terupload - Klik untuk edit / ganti berkas"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>1 File Terupload</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setUploadModalStudent(student)}
                          className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs hover:scale-102"
                          title="Upload 1 File Berkas (PDF / Gambar) untuk siswa ini"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Berkas</span>
                        </button>
                      )}
                    </td>

                    {/* Evaluasi AI */}
                    <td className="py-3 px-3">
                      {student.evaluasiAi ? (
                        <button
                          onClick={() => onAiVerify(student)}
                          className="flex items-center gap-1.5 p-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 rounded-lg text-[11px] font-medium border border-indigo-200/60 dark:border-indigo-900/40 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Skor {student.evaluasiAi.skorKelengkapan}/100</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onAiVerify(student)}
                          className="flex items-center gap-1 p-1 px-2 text-slate-500 hover:text-indigo-600 text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Analisis AI</span>
                        </button>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewStudent(student)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Lihat Profil Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onPrintCard(student)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Cetak Bukti Pendaftaran"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEditStudent(student)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit Data Siswa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Hapus arsip pendaftaran untuk ${student.namaLengkap}?`)) {
                              onDeleteStudent(student.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Hapus Arsip"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* BENTO GRID VIEW */
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedStudents.map((student) => {
            const isSelected = selectedIds.includes(student.id);
            return (
              <div
                key={student.id}
                className={`bg-white dark:bg-slate-800/80 rounded-xl p-4 border transition-all flex flex-col justify-between hover:shadow-md relative ${
                  isSelected 
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20' 
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={student.pasFotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={student.namaLengkap}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                      />
                      <div>
                        <div className="text-[10px] font-mono text-slate-400">{student.noRegistrasi}</div>
                        <h4 
                          onClick={() => onViewStudent(student)}
                          className="font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600 cursor-pointer line-clamp-1"
                        >
                          {student.namaLengkap}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium line-clamp-1">{student.asalSekolah}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSelectOne(student.id)}
                      className="text-slate-400 hover:text-indigo-600"
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${getStatusBadgeStyle(student.statusPenerimaan)}`}>
                      {student.statusPenerimaan}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${getJalurBadgeStyle(student.jalurPendaftaran)}`}>
                      {student.jalurPendaftaran}
                    </span>
                  </div>

                  {/* Details summary */}
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg text-xs space-y-1 mb-3">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>NISN:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{student.nisn}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Jurusan:</span>
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">{student.jurusanPilihan}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Rata-Rata Rapor:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{student.nilaiRapor}</span>
                    </div>
                  </div>

                  {/* Upload Berkas Button for 1 File per Siswa */}
                  <button
                    onClick={() => setUploadModalStudent(student)}
                    className={`w-full mb-3 py-2 px-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border ${
                      student.dokumen && (
                        student.dokumen.ijazahSkl?.fileUrl || 
                        student.dokumen.kk?.fileUrl || 
                        student.dokumen.akta?.fileUrl
                      )
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500'
                    }`}
                  >
                    {student.dokumen && (
                      student.dokumen.ijazahSkl?.fileUrl || 
                      student.dokumen.kk?.fileUrl || 
                      student.dokumen.akta?.fileUrl
                    ) ? (
                      <>
                        <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>1 File Terupload (Edit/Ganti)</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload Berkas (1 File)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-1">
                  <button
                    onClick={() => onViewStudent(student)}
                    className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Profil</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onPrintCard(student)}
                      className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-400 rounded-lg transition-colors cursor-pointer"
                      title="Cetak Bukti Pendaftaran"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditStudent(student)}
                      className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 dark:text-slate-400 rounded-lg transition-colors cursor-pointer"
                      title="Edit Data"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteStudent(student.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Single Document Upload Modal per Student */}
      <UploadSingleDocModal
        student={uploadModalStudent}
        isOpen={!!uploadModalStudent}
        onClose={() => setUploadModalStudent(null)}
        onSaveDocument={(studentId, updatedStudent, msg) => {
          if (onSaveStudent) {
            onSaveStudent(updatedStudent);
          }
        }}
      />

    </div>
  );
};
