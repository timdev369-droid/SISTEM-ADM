import React, { useState } from 'react';
import { Student } from '../types';
import { exportStudentsToExcel, exportStudentsToJSON, parseExcelOrCSVFile } from '../utils/storage';
import { X, FileSpreadsheet, Download, Upload, RefreshCw, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

interface ImportExportModalProps {
  students: Student[];
  isOpen: boolean;
  onClose: () => void;
  onImportData: (importedStudents: Student[]) => void;
  onResetData: () => void;
  onOpenDapodikSync?: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  students,
  isOpen,
  onClose,
  onImportData,
  onResetData,
  onOpenDapodikSync
}) => {
  if (!isOpen) return null;

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setImportStatus(null);

    try {
      const parsedStudents = await parseExcelOrCSVFile(file);
      if (parsedStudents && parsedStudents.length > 0) {
        onImportData(parsedStudents);
        setImportStatus(`Berhasil mengimpor ${parsedStudents.length} data siswa dari file "${file.name}"!`);
      } else {
        setImportStatus('File tidak memiliki data siswa yang dapat diproses.');
      }
    } catch (err: any) {
      setImportStatus(err.message || 'Gagal mengimpor file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Upload Excel & Export Data Siswa</h3>
              <p className="text-xs text-slate-400">Impor data dari file Excel (.xlsx / .csv) atau backup JSON</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs sm:text-sm">
          
          {/* Dapodik Key Service Integration Section */}
          {onOpenDapodikSync && (
            <div className="p-4 bg-gradient-to-r from-red-950/80 via-slate-900 to-indigo-950 rounded-2xl border border-red-800/80 text-white shadow-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center font-bold text-white shadow-md">
                    DP
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-2">
                      Integrasi Dapodik Kemendikbud
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-red-500/30 text-red-300 border border-red-400/30">
                        Key Service
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-300">Tarik data siswa &amp; rombel otomatis dari API Dapodik Local</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenDapodikSync();
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  Tarik Dapodik
                </button>
              </div>
            </div>
          )}

          {/* Upload Excel Section */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-emerald-600" /> Upload File Excel / CSV / JSON
            </h4>
            <div className="border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl p-5 text-center hover:border-emerald-500 transition-all">
              <FileSpreadsheet className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
              <input
                type="file"
                accept=".xlsx, .xls, .csv, .json"
                onChange={handleFileUpload}
                id="excel-file-upload-input"
                className="hidden"
                disabled={loading}
              />
              <label
                htmlFor="excel-file-upload-input"
                className="cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl inline-flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{loading ? 'Memproses File...' : 'Pilih File Excel (.xlsx) / CSV / JSON'}</span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Dukungan format: <strong>.XLSX, .XLS, .CSV, .JSON</strong>
              </p>
            </div>

            {importStatus && (
              <div className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                importStatus.includes('Berhasil') 
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
              }`}>
                {importStatus.includes('Berhasil') ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                <span>{importStatus}</span>
              </div>
            )}
          </div>

          {/* Export Options */}
          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Download className="w-4 h-4 text-indigo-600" /> Ekspor Backup Data ({students.length} Siswa Terarsip)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => exportStudentsToExcel(students)}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Unduh File Excel (.xlsx)</span>
              </button>

              <button
                onClick={() => exportStudentsToJSON(students)}
                className="p-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 rounded-xl border border-indigo-200 dark:border-indigo-800 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Backup Format JSON</span>
              </button>
            </div>
          </div>

          {/* Reset Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">Reset ke Data Sample Awal</h4>
                <p className="text-[11px] text-slate-500">Kembalikan daftar siswa ke sampel data awal.</p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Atur ulang seluruh data arsip ke sampel awal?')) {
                    onResetData();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Data</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-300 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

