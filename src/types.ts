export type SchoolId = 'smp_it' | 'sma_it';

export interface SchoolInfo {
  id: SchoolId;
  name: string;
  shortName: string;
  levelName: string;
  code: string;
  colorScheme: 'emerald' | 'indigo';
  majors: string[];
  storageKey: string;
}

export type StudentStatus = 'Diterima' | 'Proses Verifikasi' | 'Cadangan' | 'Ditolak';

export type RegistrationPath = 'Zonasi' | 'Prestasi' | 'Afirmasi' | 'Perpindahan Orang Tua';

export type Gender = 'Laki-Laki' | 'Perempuan';

export type Major = 
  | 'IPA / MIPA' 
  | 'IPS / Soshum' 
  | 'Tahfidz Al-Qur\'an & Keagamaan'
  | 'Unggulan Science & Math'
  | 'Bahasa & Komunikasi Global'
  | 'Teknik Komputer & Jaringan' 
  | 'Desain Komunikasi Visual' 
  | 'Akuntansi & Keuangan' 
  | 'Rekayasa Perangkat Lunak';

export type DocumentStatus = 'Sesuai' | 'Perlu Perbaikan' | 'Belum Upload';

export interface StudentDocument {
  id: string;
  name: string;
  fileUrl?: string;
  status: DocumentStatus;
  notes?: string;
  uploadedAt?: string;
}

export interface AiEvaluation {
  skorKelengkapan: number;
  statusKelayakan: 'Layak' | 'Perlu Perbaikan' | 'Tinjauan Khusus';
  rekomendasi: string;
  catatanVerifikator: string[];
  keunggulan: string[];
  evaluatedAt?: string;
}

export interface Student {
  id: string;
  noRegistrasi: string;
  namaLengkap: string;
  nisn: string;
  nik: string;
  jenisKelamin: Gender;
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  alamat: string;
  noTelepon: string;
  email: string;
  pasFotoUrl: string;
  asalSekolah: string;
  tahunLulus: number;
  nilaiRapor: number; // e.g. 88.5
  prestasi?: string;
  jalurPendaftaran: RegistrationPath;
  jurusanPilihan: Major;
  jurusanSekunder?: Major;
  statusPenerimaan: StudentStatus;
  tanggalDaftar: string;
  namaAyah: string;
  pekerjaanAyah: string;
  namaIbu: string;
  pekerjaanIbu: string;
  noHpOrtu: string;
  penghasilanOrtu: string;
  dokumen: {
    kk: StudentDocument;
    akta: StudentDocument;
    ijazahSkl: StudentDocument;
    pasFoto: StudentDocument;
    sertifikat?: StudentDocument;
  };
  evaluasiAi?: AiEvaluation;
  catatanSekolah?: string;
  kelas?: string;
  dapodikSynced?: boolean;
  dapodikSyncedAt?: string;
}

export interface DapodikConfig {
  serverIp: string;
  serverPort: string;
  npsnSmp: string;
  npsnSma: string;
  serviceKey: string;
  semester: string;
  tahunAjaran: string;
  autoUpdateExisting: boolean;
  importParentsData: boolean;
  importRaporData: boolean;
  defaultStatus: StudentStatus;
  lastSyncTimestamp?: string;
  lastSyncCount?: number;
}

export interface FilterOptions {
  search: string;
  jalur: string;
  status: string;
  jurusan: string;
  jenisKelamin: string;
  statusDokumen: string;
  kelas?: string;
}

export type SchoolUserRole = 'Super Admin' | 'Operator SMP IT' | 'Operator SMA IT' | 'Kepala Sekolah' | 'Petugas Verifikator';

export interface SchoolUser {
  id: string;
  name: string;
  email: string;
  password: string;
  schoolAccess: SchoolId | 'all';
  role: SchoolUserRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  phone?: string;
}

