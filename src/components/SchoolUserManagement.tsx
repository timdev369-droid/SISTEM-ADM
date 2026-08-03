import React, { useState, useEffect } from 'react';
import { SchoolUser, SchoolUserRole, SchoolId } from '../types';
import { SCHOOLS } from '../data/schools';
import { 
  UserCheck, 
  UserPlus, 
  Users, 
  Search, 
  Shield, 
  Key, 
  Edit3, 
  Trash2, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Phone, 
  X,
  Plus
} from 'lucide-react';

const STORAGE_USERS_KEY = 'arsip_siswa_school_users';

export const INITIAL_SCHOOL_USERS: SchoolUser[] = [
  {
    id: 'user-001',
    name: 'Administrator Utama Yayasan',
    email: 'admin@gmail.com',
    password: 'admin123@',
    schoolAccess: 'all',
    role: 'Super Admin',
    isActive: true,
    createdAt: '2026-01-10',
    lastLoginAt: '2026-08-02 18:30',
    phone: '081234567890'
  },
  {
    id: 'user-002',
    name: 'Ustadz Ahmad Fauzi, S.Pd.',
    email: 'operator.smp@almuawanah.sch.id',
    password: 'smp123@',
    schoolAccess: 'smp_it',
    role: 'Operator SMP IT',
    isActive: true,
    createdAt: '2026-01-15',
    lastLoginAt: '2026-08-02 14:15',
    phone: '082198765432'
  },
  {
    id: 'user-003',
    name: 'Ustadzah Siti Rahma, S.T.',
    email: 'operator.sma@almuawanah.sch.id',
    password: 'sma123@',
    schoolAccess: 'sma_it',
    role: 'Operator SMA IT',
    isActive: true,
    createdAt: '2026-01-15',
    lastLoginAt: '2026-08-01 16:45',
    phone: '085712345678'
  },
  {
    id: 'user-004',
    name: 'Drs. H. Muhammad Ridwan, M.Ag.',
    email: 'kepsek@almuawanah.sch.id',
    password: 'kepsek123@',
    schoolAccess: 'all',
    role: 'Kepala Sekolah',
    isActive: true,
    createdAt: '2026-01-05',
    lastLoginAt: '2026-07-30 09:10',
    phone: '081388889999'
  },
  {
    id: 'user-005',
    name: 'Tim Verifikator Dokumen',
    email: 'verifikator@almuawanah.sch.id',
    password: 'verif123@',
    schoolAccess: 'all',
    role: 'Petugas Verifikator',
    isActive: true,
    createdAt: '2026-02-01',
    lastLoginAt: '2026-08-02 10:00',
    phone: '087800001111'
  }
];

interface SchoolUserManagementProps {
  showToast: (msg: string) => void;
}

export const SchoolUserManagement: React.FC<SchoolUserManagementProps> = ({ showToast }) => {
  const [users, setUsers] = useState<SchoolUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USERS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse users from localStorage', e);
    }
    return INITIAL_SCHOOL_USERS;
  });

  // Filter States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  // Modal State for Create / Edit User
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<SchoolUser | null>(null);

  // Form Fields
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPassword, setFormPassword] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formSchoolAccess, setFormSchoolAccess] = useState<SchoolId | 'all'>('smp_it');
  const [formRole, setFormRole] = useState<SchoolUserRole>('Operator SMP IT');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [showPasswordInForm, setShowPasswordInForm] = useState<boolean>(false);

  // Sync users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users to localStorage', e);
    }
  }, [users]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormPhone('');
    setFormSchoolAccess('smp_it');
    setFormRole('Operator SMP IT');
    setFormIsActive(true);
    setShowPasswordInForm(false);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (user: SchoolUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword(user.password);
    setFormPhone(user.phone || '');
    setFormSchoolAccess(user.schoolAccess);
    setFormRole(user.role);
    setFormIsActive(user.isActive);
    setShowPasswordInForm(false);
    setIsModalOpen(true);
  };

  // Save User (Create or Update)
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      alert('Mohon isi nama, email, dan password user!');
      return;
    }

    if (editingUser) {
      // Update existing
      const updatedUsers = users.map(u => u.id === editingUser.id ? {
        ...u,
        name: formName.trim(),
        email: formEmail.trim().toLowerCase(),
        password: formPassword.trim(),
        phone: formPhone.trim(),
        schoolAccess: formSchoolAccess,
        role: formRole,
        isActive: formIsActive
      } : u);

      setUsers(updatedUsers);
      showToast(`User ${formName} berhasil diperbarui.`);
    } else {
      // Create new
      const newUser: SchoolUser = {
        id: `user-${Date.now()}`,
        name: formName.trim(),
        email: formEmail.trim().toLowerCase(),
        password: formPassword.trim(),
        phone: formPhone.trim(),
        schoolAccess: formSchoolAccess,
        role: formRole,
        isActive: formIsActive,
        createdAt: new Date().toISOString().split('T')[0],
        lastLoginAt: 'Belum pernah'
      };

      setUsers([newUser, ...users]);
      showToast(`User sekolah baru "${formName}" berhasil ditambahkan!`);
    }

    setIsModalOpen(false);
  };

  // Toggle User Active Status
  const handleToggleActiveStatus = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextState = !u.isActive;
        showToast(`Status user ${u.name} diubah menjadi ${nextState ? 'Aktif' : 'Non-Aktif'}`);
        return { ...u, isActive: nextState };
      }
      return u;
    }));
  };

  // Delete User
  const handleDeleteUser = (id: string, name: string) => {
    if (users.length <= 1) {
      alert('Gagal menghapus! Sistem membutuhkan minimal 1 akun Administrator.');
      return;
    }

    if (window.confirm(`Apakah Anda yakin ingin menghapus user sekolah "${name}"?`)) {
      setUsers(prev => prev.filter(u => u.id !== id));
      showToast(`User "${name}" telah dihapus.`);
    }
  };

  // Reset to initial demo users
  const handleResetToDefaultUsers = () => {
    if (window.confirm('Reset daftar user sekolah ke data sampel awal?')) {
      setUsers(INITIAL_SCHOOL_USERS);
      showToast('Daftar user sekolah telah dikembalikan ke sampel default.');
    }
  };

  // Filtered Users List
  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (u.phone && u.phone.includes(searchTerm));
    
    const matchSchool = selectedSchoolFilter === 'all' || u.schoolAccess === selectedSchoolFilter || u.schoolAccess === 'all';
    const matchRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;

    return matchSearch && matchSchool && matchRole;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Metrics */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl border border-slate-800 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Pengaturan Hak Akses &amp; Operator Sekolah</span>
            </div>
            <h3 className="text-lg font-bold text-white">Kelola Akun Operator &amp; User Lembaga</h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Atur akun pengelola arsip untuk unit SMP IT Al Muawanah, SMA IT Al Muawanah, Verifikator, dan Kepala Sekolah.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer whitespace-nowrap self-start md:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tambah User Sekolah</span>
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total User Terdaftar</span>
            <span className="text-lg font-black text-white mt-0.5 block">{users.length} User</span>
          </div>
          <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/80">
            <span className="text-[10px] text-emerald-300 font-bold uppercase block">User Aktif</span>
            <span className="text-lg font-black text-emerald-200 mt-0.5 block">{users.filter(u => u.isActive).length} User</span>
          </div>
          <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/60">
            <span className="text-[10px] text-emerald-300 font-bold uppercase block">Akses SMP IT</span>
            <span className="text-lg font-black text-emerald-200 mt-0.5 block">{users.filter(u => u.schoolAccess === 'smp_it' || u.schoolAccess === 'all').length} Operator</span>
          </div>
          <div className="bg-indigo-950/40 p-3 rounded-xl border border-indigo-800/60">
            <span className="text-[10px] text-indigo-300 font-bold uppercase block">Akses SMA IT</span>
            <span className="text-lg font-black text-indigo-200 mt-0.5 block">{users.filter(u => u.schoolAccess === 'sma_it' || u.schoolAccess === 'all').length} Operator</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, email, role, atau no. hp..."
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={selectedSchoolFilter}
            onChange={(e) => setSelectedSchoolFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-medium text-slate-800 dark:text-slate-200 text-xs"
          >
            <option value="all">Semua Akses Unit</option>
            <option value="smp_it">SMP IT Al Muawanah</option>
            <option value="sma_it">SMA IT Al Muawanah</option>
          </select>

          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-medium text-slate-800 dark:text-slate-200 text-xs"
          >
            <option value="all">Semua Peran / Role</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Operator SMP IT">Operator SMP IT</option>
            <option value="Operator SMA IT">Operator SMA IT</option>
            <option value="Kepala Sekolah">Kepala Sekolah</option>
            <option value="Petugas Verifikator">Petugas Verifikator</option>
          </select>

          <button
            onClick={handleResetToDefaultUsers}
            className="px-2.5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-xs transition-colors cursor-pointer"
            title="Reset ke daftar user default"
          >
            Reset Default
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">User Operator</th>
                <th className="p-3.5">Akses Unit Sekolah</th>
                <th className="p-3.5">Peran / Jabatan</th>
                <th className="p-3.5">Kredensial Login</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5">Login Terakhir</th>
                <th className="p-3.5 text-right">Aksi Pengaturan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium">Tidak ada user sekolah yang sesuai dengan kata kunci pencarian.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5 font-semibold">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-sm ${
                            u.schoolAccess === 'smp_it' ? 'bg-emerald-600' :
                            u.schoolAccess === 'sma_it' ? 'bg-indigo-600' : 'bg-purple-600'
                          }`}>
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{u.name}</div>
                            {u.phone && (
                              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{u.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        {u.schoolAccess === 'all' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            <Building2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                            <span>Semua Unit (SMP &amp; SMA)</span>
                          </span>
                        ) : u.schoolAccess === 'smp_it' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>SMP IT Al Muawanah</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>SMA IT Al Muawanah</span>
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-medium">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <Shield className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{u.role}</span>
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-mono text-[11px] text-slate-900 dark:text-slate-100 font-semibold">{u.email}</div>
                        <div className="text-[10px] text-slate-400 font-mono">Password: {u.password}</div>
                      </td>

                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleActiveStatus(u.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 transition-all cursor-pointer ${
                            u.isActive 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200' 
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-200'
                          }`}
                          title="Klik untuk mengubah status aktif"
                        >
                          {u.isActive ? <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />}
                          <span>{u.isActive ? 'Aktif' : 'Non-Aktif'}</span>
                        </button>
                      </td>

                      <td className="p-3.5 text-[11px] text-slate-500 font-mono">
                        {u.lastLoginAt || 'Belum Login'}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-950 text-slate-600 hover:text-indigo-600 dark:text-slate-300 transition-all cursor-pointer"
                            title="Edit data user"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-600 hover:text-rose-600 dark:text-slate-300 transition-all cursor-pointer"
                            title="Hapus user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {editingUser ? 'Edit User / Operator Sekolah' : 'Tambah User / Operator Sekolah Baru'}
                  </h4>
                  <p className="text-[11px] text-slate-400">Pengaturan akses &amp; kredensial pengelola arsip</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Operator / User *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Ustadz Ahmad Fauzi, S.Pd."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email / Username Login *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="operator@almuawanah.sch.id"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordInForm ? 'text' : 'password'}
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordInForm(!showPasswordInForm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPasswordInForm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Akses Unit Sekolah
                  </label>
                  <select
                    value={formSchoolAccess}
                    onChange={(e) => setFormSchoolAccess(e.target.value as SchoolId | 'all')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="smp_it">SMP IT Al Muawanah</option>
                    <option value="sma_it">SMA IT Al Muawanah</option>
                    <option value="all">Semua Unit (SMP &amp; SMA)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Peran / Jabatan
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as SchoolUserRole)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="Operator SMP IT">Operator SMP IT</option>
                    <option value="Operator SMA IT">Operator SMA IT</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Kepala Sekolah">Kepala Sekolah</option>
                    <option value="Petugas Verifikator">Petugas Verifikator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor Telepon / WhatsApp (Opsional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="user-active-checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="user-active-checkbox" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Status Akun Aktif (Bisa digunakan untuk login &amp; mengelola arsip)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingUser ? 'Simpan Perubahan' : 'Tambah User'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
