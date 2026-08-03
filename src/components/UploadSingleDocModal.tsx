import React, { useState, useRef } from 'react';
import { Student, StudentDocument, DocumentStatus } from '../types';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  File, 
  Download, 
  Eye, 
  Sparkles,
  ShieldCheck,
  Check,
  FileCheck
} from 'lucide-react';

interface UploadSingleDocModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveDocument: (studentId: string, updatedStudent: Student, successMessage: string) => void;
}

export const UploadSingleDocModal: React.FC<UploadSingleDocModalProps> = ({
  student,
  isOpen,
  onClose,
  onSaveDocument
}) => {
  if (!isOpen || !student) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Single Document option for Student (KK, KTP, Ijazah in 1 File)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>('');
  const [customDocName, setCustomDocName] = useState<string>('');
  const [docStatus, setDocStatus] = useState<DocumentStatus>('Sesuai');
  const [notes, setNotes] = useState<string>('Berkas Dokumen Siswa (KK, KTP, Ijazah) lengkap & terverifikasi.');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Get current doc info if exists (checks ijazahSkl or kk)
  const currentDoc: StudentDocument | undefined = student.dokumen 
    ? (student.dokumen.ijazahSkl || student.dokumen.kk || student.dokumen.akta) 
    : undefined;

  const handleFileSelect = (file: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 10 MB per file berkas.');
      return;
    }
    setSelectedFile(file);
    setCustomDocName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreviewUrl(e.target?.result as string || '');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !currentDoc?.fileUrl) {
      alert('Pilih 1 file berkas dokumen siswa (PDF / Gambar) terlebih dahulu!');
      return;
    }

    setIsUploading(true);

    setTimeout(() => {
      const updatedDocObj: StudentDocument = {
        id: currentDoc?.id || `doc-${Date.now()}-dokumen-siswa`,
        name: customDocName || selectedFile?.name || currentDoc?.name || `Dokumen_Siswa_${student.namaLengkap.replace(/\s+/g, '_')}.pdf`,
        fileUrl: filePreviewUrl || currentDoc?.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        status: docStatus,
        notes: notes || 'File Dokumen Siswa (KK, KTP, Ijazah) terverifikasi oleh Petugas TU.',
        uploadedAt: new Date().toISOString()
      };

      const updatedStudent: Student = {
        ...student,
        dokumen: {
          ...student.dokumen,
          ijazahSkl: updatedDocObj,
          kk: updatedDocObj,
          akta: updatedDocObj
        }
      };

      onSaveDocument(
        student.id, 
        updatedStudent, 
        `1 File Dokumen Siswa (KK, KTP, Ijazah) untuk ${student.namaLengkap} berhasil diupload!`
      );
      setIsUploading(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
        >
          &times;
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 shadow-inner">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Upload Berkas Siswa (1 File)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload 1 file dokumen resmi per siswa untuk keperluan verifikasi TU.
            </p>
          </div>
        </div>

        {/* Student Target Badge */}
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <img
              src={student.pasFotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={student.namaLengkap}
              className="w-10 h-10 rounded-xl object-cover border border-indigo-300 dark:border-indigo-700"
            />
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">{student.namaLengkap}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                No. Reg: {student.noRegistrasi} &bull; NISN: {student.nisn}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white shadow-xs">
            {student.asalSekolah}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Single Unified Document Option Card */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Pilihan Berkas Dokumen Siswa:
            </label>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 border-2 border-indigo-500 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    Dokumen Siswa (KK, KTP, &amp; Ijazah)
                  </h4>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                    1 File gabungan atau scan dokumen utama siswa
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white shadow-xs">
                Terpilih (1 File)
              </span>
            </div>
          </div>

          {/* Drag and Drop File Upload Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              File Berkas Terpilih (Maksimal 1 File PDF / Gambar):
            </label>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              className="hidden"
            />

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
                isDragOver
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : selectedFile || currentDoc?.fileUrl
                  ? 'border-emerald-500/80 bg-emerald-500/5 dark:bg-emerald-950/20'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 hover:border-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              {selectedFile ? (
                <div className="flex flex-col items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1 max-w-[280px]">
                    {selectedFile.name}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    ({(selectedFile.size / 1024).toFixed(1)} KB) &bull; Klik untuk mengganti file
                  </span>
                </div>
              ) : currentDoc?.fileUrl ? (
                <div className="flex flex-col items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <FileCheck className="w-8 h-8 text-emerald-500" />
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1 max-w-[280px]">
                    {currentDoc.name || 'File_Berkas_Tersimpan.pdf'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Status: <strong className="text-emerald-600">{currentDoc.status}</strong> &bull; Klik untuk upload file baru
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Klik atau Drag &amp; Drop 1 File Berkas ke Sini
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Format disukai: PDF, JPG, PNG, atau DOCX (Max 10 MB)
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Status & Custom Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Status Verifikasi Berkas:
              </label>
              <select
                value={docStatus}
                onChange={(e) => setDocStatus(e.target.value as DocumentStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Sesuai">Sesuai (Lengkap &amp; Valid)</option>
                <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                <option value="Belum Upload">Belum Upload</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Label Dokumen:
              </label>
              <input
                type="text"
                value={customDocName}
                onChange={(e) => setCustomDocName(e.target.value)}
                placeholder="misal: Ijazah_Siswa_Ahmad.pdf"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUploading ? (
                <span>Proses Uploading...</span>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Simpan &amp; Upload Berkas</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-all cursor-pointer"
            >
              Batal
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
