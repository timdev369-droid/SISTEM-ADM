import { SchoolInfo } from '../types';

export const SCHOOLS: SchoolInfo[] = [
  {
    id: 'smp_it',
    name: 'SMP IT Al Muawanah',
    shortName: 'SMP IT Al Muawanah',
    levelName: 'Sekolah Menengah Pertama Islam Terpadu',
    code: 'SMPIT-ALMUAWANAH',
    colorScheme: 'emerald',
    majors: [
      'Tahfidz Al-Qur\'an & Keagamaan',
      'Unggulan Science & Math',
      'Bahasa & Komunikasi Global'
    ],
    storageKey: 'arsip_siswa_smp_it_almuawanah'
  },
  {
    id: 'sma_it',
    name: 'SMA IT Al Muawanah',
    shortName: 'SMA IT Al Muawanah',
    levelName: 'Sekolah Menengah Atas Islam Terpadu',
    code: 'SMAIT-ALMUAWANAH',
    colorScheme: 'indigo',
    majors: [
      'IPA / MIPA',
      'IPS / Soshum',
      'Tahfidz Al-Qur\'an & Keagamaan',
      'Teknik Komputer & Jaringan',
      'Desain Komunikasi Visual'
    ],
    storageKey: 'arsip_siswa_sma_it_almuawanah'
  }
];
