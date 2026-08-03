import { Student, Gender, RegistrationPath, Major, StudentStatus, SchoolId } from '../types';
import { getInitialStudentsBySchool } from '../data/initialStudents';
import { SCHOOLS } from '../data/schools';
import * as XLSX from 'xlsx';

export const getStorageKey = (schoolId: SchoolId = 'sma_it'): string => {
  const school = SCHOOLS.find(s => s.id === schoolId);
  return school ? school.storageKey : `arsip_siswa_${schoolId}_almuawanah`;
};

export const getStoredStudents = (schoolId: SchoolId = 'sma_it'): Student[] => {
  try {
    const key = getStorageKey(schoolId);
    const data = localStorage.getItem(key);
    if (!data) {
      const initial = getInitialStudentsBySchool(schoolId);
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading localStorage:', err);
    return getInitialStudentsBySchool(schoolId);
  }
};

export const saveStudentsToStorage = (students: Student[], schoolId: SchoolId = 'sma_it'): void => {
  try {
    const key = getStorageKey(schoolId);
    localStorage.setItem(key, JSON.stringify(students));
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
};

export const resetStudentsData = (schoolId: SchoolId = 'sma_it'): Student[] => {
  const initial = getInitialStudentsBySchool(schoolId);
  try {
    const key = getStorageKey(schoolId);
    localStorage.setItem(key, JSON.stringify(initial));
  } catch (err) {
    console.error('Error resetting storage:', err);
  }
  return initial;
};

export const exportStudentsToExcel = (students: Student[], schoolName: string = 'Al Muawanah'): void => {
  if (!students || students.length === 0) return;

  const dataToExport = students.map((s, idx) => ({
    'No': idx + 1,
    'No Registrasi': s.noRegistrasi,
    'Nama Lengkap': s.namaLengkap,
    'NISN': s.nisn,
    'NIK': s.nik,
    'Jenis Kelamin': s.jenisKelamin,
    'Tempat Lahir': s.tempatLahir,
    'Tanggal Lahir': s.tanggalLahir,
    'Agama': s.agama || 'Islam',
    'Alamat': s.alamat,
    'No Telepon': s.noTelepon,
    'Email': s.email,
    'Asal Sekolah': s.asalSekolah,
    'Tahun Lulus': s.tahunLulus,
    'Nilai Rapor': s.nilaiRapor,
    'Prestasi': s.prestasi || '',
    'Jalur Pendaftaran': s.jalurPendaftaran,
    'Jurusan Pilihan': s.jurusanPilihan,
    'Status Penerimaan': s.statusPenerimaan,
    'Tanggal Daftar': s.tanggalDaftar,
    'Nama Ayah': s.namaAyah,
    'Pekerjaan Ayah': s.pekerjaanAyah || '',
    'Nama Ibu': s.namaIbu,
    'Pekerjaan Ibu': s.pekerjaanIbu || '',
    'No HP Ortu': s.noHpOrtu,
    'Penghasilan Ortu': s.penghasilanOrtu || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  const cleanSchoolName = schoolName.replace(/[^a-zA-Z0-9 ]/g, '_');
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Arsip Data Siswa');

  XLSX.writeFile(workbook, `Arsip_Data_Siswa_${cleanSchoolName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

export const exportStudentsToCSV = (students: Student[], schoolName?: string): void => {
  exportStudentsToExcel(students, schoolName);
};

export const exportStudentsToJSON = (students: Student[], schoolName: string = 'Al Muawanah'): void => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(students, null, 2)
  )}`;
  const cleanSchoolName = schoolName.replace(/[^a-zA-Z0-9 ]/g, '_');
  const link = document.createElement('a');
  link.setAttribute('href', jsonString);
  link.setAttribute('download', `Backup_Arsip_${cleanSchoolName}_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseExcelOrCSVFile = (file: File): Promise<Student[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        if (!buffer) {
          reject(new Error('File kosong atau tidak dapat dibaca.'));
          return;
        }

        // If file is JSON
        if (file.name.endsWith('.json')) {
          const textDecoder = new TextDecoder('utf-8');
          const jsonText = typeof buffer === 'string' ? buffer : textDecoder.decode(buffer as ArrayBuffer);
          const parsed = JSON.parse(jsonText);
          if (Array.isArray(parsed)) {
            resolve(parsed.map(normalizeStudentObject));
            return;
          }
        }

        // Otherwise parse Excel/CSV using XLSX
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          reject(new Error('File Excel tidak memiliki baris data.'));
          return;
        }

        const parsedStudents: Student[] = rawRows.map((row, index) => {
          const getVal = (keys: string[]): string => {
            for (const key of keys) {
              for (const rowKey of Object.keys(row)) {
                if (rowKey.trim().toLowerCase() === key.toLowerCase()) {
                  return String(row[rowKey]).trim();
                }
              }
            }
            return '';
          };

          const nama = getVal(['Nama Lengkap', 'Nama', 'namaLengkap', 'nama_lengkap', 'Nama Siswa']);
          const nisn = getVal(['NISN', 'nisn', 'No NISN']);
          const nik = getVal(['NIK', 'nik', 'No NIK']);
          const noReg = getVal(['No Registrasi', 'noRegistrasi', 'No Reg', 'Nomor Pendaftaran']) || `PPDB-2026-${Math.floor(100 + Math.random() * 900)}`;
          const jkRaw = getVal(['Jenis Kelamin', 'jenisKelamin', 'JK', 'Gender']);
          const jk: Gender = (jkRaw.toLowerCase().includes('p') && !jkRaw.toLowerCase().includes('laki')) ? 'Perempuan' : 'Laki-Laki';
          
          const tempatLahir = getVal(['Tempat Lahir', 'tempatLahir', 'Kota Lahir']) || 'Bandung';
          const tanggalLahir = getVal(['Tanggal Lahir', 'tanggalLahir', 'Tgl Lahir']) || '2010-01-01';
          const agama = getVal(['Agama', 'agama']) || 'Islam';
          const alamat = getVal(['Alamat', 'alamat', 'Alamat Lengkap']) || 'Jl. Al Muawanah Bandung';
          const noTelepon = getVal(['No Telepon', 'noTelepon', 'No HP', 'Telepon']) || '081234567890';
          const email = getVal(['Email', 'email']) || 'siswa@almuawanah.sch.id';
          
          const asalSekolah = getVal(['Asal Sekolah', 'asalSekolah', 'Sekolah Asal']) || 'SD / SMP Islam Terpadu';
          const tahunLulus = Number(getVal(['Tahun Lulus', 'tahunLulus', 'Tahun'])) || 2026;
          const nilaiRapor = Number(getVal(['Nilai Rapor', 'nilaiRapor', 'Rata Rapor', 'Nilai'])) || 88.0;
          const prestasi = getVal(['Prestasi', 'prestasi']);
          
          const jalurRaw = getVal(['Jalur Pendaftaran', 'jalurPendaftaran', 'Jalur']);
          let jalur: RegistrationPath = 'Zonasi';
          if (jalurRaw.toLowerCase().includes('prestasi')) jalur = 'Prestasi';
          else if (jalurRaw.toLowerCase().includes('afirmasi')) jalur = 'Afirmasi';
          else if (jalurRaw.toLowerCase().includes('pindah')) jalur = 'Perpindahan Orang Tua';

          const jurusanRaw = getVal(['Jurusan Pilihan', 'jurusanPilihan', 'Jurusan', 'Pilihan', 'Program']);
          let jurusan: Major = 'Tahfidz Al-Qur\'an & Keagamaan';
          if (jurusanRaw.toLowerCase().includes('ipa') || jurusanRaw.toLowerCase().includes('mipa')) jurusan = 'IPA / MIPA';
          else if (jurusanRaw.toLowerCase().includes('ips') || jurusanRaw.toLowerCase().includes('soshum')) jurusan = 'IPS / Soshum';
          else if (jurusanRaw.toLowerCase().includes('science') || jurusanRaw.toLowerCase().includes('math')) jurusan = 'Unggulan Science & Math';
          else if (jurusanRaw.toLowerCase().includes('bahasa') || jurusanRaw.toLowerCase().includes('global')) jurusan = 'Bahasa & Komunikasi Global';
          else if (jurusanRaw.toLowerCase().includes('tkj') || jurusanRaw.toLowerCase().includes('komputer')) jurusan = 'Teknik Komputer & Jaringan';
          else if (jurusanRaw.toLowerCase().includes('dkv') || jurusanRaw.toLowerCase().includes('desain')) jurusan = 'Desain Komunikasi Visual';

          const statusRaw = getVal(['Status Penerimaan', 'statusPenerimaan', 'Status']);
          let status: StudentStatus = 'Proses Verifikasi';
          if (statusRaw.toLowerCase().includes('terima') || statusRaw.toLowerCase().includes('lulus')) status = 'Diterima';
          else if (statusRaw.toLowerCase().includes('cadang')) status = 'Cadangan';
          else if (statusRaw.toLowerCase().includes('tolak')) status = 'Ditolak';

          const namaAyah = getVal(['Nama Ayah', 'namaAyah', 'Ayah']) || 'Ayah Siswa';
          const namaIbu = getVal(['Nama Ibu', 'namaIbu', 'Ibu']) || 'Ibu Siswa';
          const noHpOrtu = getVal(['No HP Ortu', 'noHpOrtu', 'HP Ortu', 'No Ortu']) || noTelepon;

          return {
            id: `REG-IMP-${Date.now()}-${index}`,
            noRegistrasi: noReg,
            namaLengkap: nama || `Siswa ${index + 1}`,
            nisn: nisn || `008${Math.floor(1000000 + Math.random() * 9000000)}`,
            nik: nik || `327${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
            jenisKelamin: jk,
            tempatLahir,
            tanggalLahir,
            agama,
            alamat,
            noTelepon,
            email,
            pasFotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
            asalSekolah,
            tahunLulus,
            nilaiRapor,
            prestasi,
            jalurPendaftaran: jalur,
            jurusanPilihan: jurusan,
            statusPenerimaan: status,
            tanggalDaftar: new Date().toISOString().slice(0, 10),
            namaAyah,
            pekerjaanAyah: getVal(['Pekerjaan Ayah', 'pekerjaanAyah']) || 'Wiraswasta',
            namaIbu,
            pekerjaanIbu: getVal(['Pekerjaan Ibu', 'pekerjaanIbu']) || 'Ibu Rumah Tangga',
            noHpOrtu,
            penghasilanOrtu: getVal(['Penghasilan Ortu', 'penghasilanOrtu']) || 'Rp 5.000.000 - Rp 7.500.000',
            dokumen: {
              kk: { id: `doc-${index}-kk`, name: 'KK.pdf', status: 'Sesuai' },
              akta: { id: `doc-${index}-akta`, name: 'Akta.pdf', status: 'Sesuai' },
              ijazahSkl: { id: `doc-${index}-skl`, name: 'SKL.pdf', status: 'Sesuai' },
              pasFoto: { id: `doc-${index}-foto`, name: 'PasFoto.jpg', status: 'Sesuai' }
            }
          };
        });

        resolve(parsedStudents);
      } catch (err: any) {
        console.error('Error parsing file:', err);
        reject(new Error('Gagal memproses file Excel/CSV. Pastikan format valid.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file dari disk.'));
    };

    reader.readAsArrayBuffer(file);
  });
};

export const normalizeStudentObject = (obj: any): Student => {
  return {
    id: obj.id || `REG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    noRegistrasi: obj.noRegistrasi || `PPDB-2026-${Math.floor(100 + Math.random() * 900)}`,
    namaLengkap: obj.namaLengkap || 'Siswa Tanpa Nama',
    nisn: obj.nisn || '0081234567',
    nik: obj.nik || '3273012345670001',
    jenisKelamin: obj.jenisKelamin || 'Laki-Laki',
    tempatLahir: obj.tempatLahir || 'Bandung',
    tanggalLahir: obj.tanggalLahir || '2010-01-01',
    agama: obj.agama || 'Islam',
    alamat: obj.alamat || 'Jl. Al Muawanah Bandung',
    noTelepon: obj.noTelepon || '081234567890',
    email: obj.email || 'siswa@almuawanah.sch.id',
    pasFotoUrl: obj.pasFotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    asalSekolah: obj.asalSekolah || 'SD / SMP Islam Terpadu',
    tahunLulus: Number(obj.tahunLulus) || 2026,
    nilaiRapor: Number(obj.nilaiRapor) || 88,
    prestasi: obj.prestasi || '',
    jalurPendaftaran: obj.jalurPendaftaran || 'Zonasi',
    jurusanPilihan: obj.jurusanPilihan || 'Tahfidz Al-Qur\'an & Keagamaan',
    jurusanSekunder: obj.jurusanSekunder,
    statusPenerimaan: obj.statusPenerimaan || 'Proses Verifikasi',
    tanggalDaftar: obj.tanggalDaftar || new Date().toISOString().slice(0, 10),
    namaAyah: obj.namaAyah || '',
    pekerjaanAyah: obj.pekerjaanAyah || '',
    namaIbu: obj.namaIbu || '',
    pekerjaanIbu: obj.pekerjaanIbu || '',
    noHpOrtu: obj.noHpOrtu || '',
    penghasilanOrtu: obj.penghasilanOrtu || '',
    dokumen: obj.dokumen || {
      kk: { id: 'kk-1', name: 'KK.pdf', status: 'Sesuai' },
      akta: { id: 'ak-1', name: 'Akta.pdf', status: 'Sesuai' },
      ijazahSkl: { id: 'sk-1', name: 'SKL.pdf', status: 'Sesuai' },
      pasFoto: { id: 'ft-1', name: 'Foto.jpg', status: 'Sesuai' }
    },
    evaluasiAi: obj.evaluasiAi,
    catatanSekolah: obj.catatanSekolah || ''
  };
};
