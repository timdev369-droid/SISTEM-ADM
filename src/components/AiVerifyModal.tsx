import React, { useState, useEffect } from 'react';
import { Student, AiEvaluation } from '../types';
import { Sparkles, X, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck, Award } from 'lucide-react';

interface AiVerifyModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyEvaluation: (studentId: string, evaluation: AiEvaluation) => void;
}

export const AiVerifyModal: React.FC<AiVerifyModalProps> = ({
  student,
  isOpen,
  onClose,
  onApplyEvaluation
}) => {
  if (!isOpen || !student) return null;

  const [loading, setLoading] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<AiEvaluation | null>(student.evaluasiAi || null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runAiVerification = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/verify-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: student.namaLengkap,
          nisn: student.nisn,
          jalur: student.jalurPendaftaran,
          jurusan: student.jurusanPilihan,
          asalSekolah: student.asalSekolah,
          nilaiRapor: student.nilaiRapor,
          prestasi: student.prestasi,
          dokumenStatus: {
            kk: student.dokumen?.kk?.status,
            akta: student.dokumen?.akta?.status,
            ijazahSkl: student.dokumen?.ijazahSkl?.status,
            pasFoto: student.dokumen?.pasFoto?.status
          }
        })
      });

      const data = await response.json();
      if (data.success && data.data) {
        const evalObj: AiEvaluation = {
          ...data.data,
          evaluatedAt: new Date().toLocaleString('id-ID')
        };
        setEvaluationResult(evalObj);
        onApplyEvaluation(student.id, evalObj);
      } else {
        setErrorMsg(data.message || 'Gagal memproses verifikasi AI.');
      }
    } catch (err: any) {
      console.error('AI Verify fetch error:', err);
      setErrorMsg('Gagal menghubungi server AI Gemini.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !student.evaluasiAi) {
      runAiVerification();
    } else if (isOpen && student.evaluasiAi) {
      setEvaluationResult(student.evaluasiAi);
    }
  }, [isOpen, student]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-900/80 shadow-2xl w-full max-w-xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-5 flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
              <Sparkles className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Analisis Verifikasi AI Gemini</h3>
              <p className="text-xs text-indigo-200">
                Pemeriksaan otomatis kelengkapan & kelayakan pendaftaran
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-xs sm:text-sm">
          
          {/* Target Student Info */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between mb-4">
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">{student.namaLengkap}</div>
              <div className="text-xs text-slate-500 font-mono">NISN: {student.nisn} &bull; {student.asalSekolah}</div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 rounded-lg border border-indigo-200">
              {student.jalurPendaftaran}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                AI Gemini sedang menganalisis berkas & data akademik...
              </div>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Memeriksa kecocokan nilai rapor, keabsahan dokumen, dan menghasilkan rekomendasi kelayakan.
              </p>
            </div>
          ) : errorMsg ? (
            <div className="py-6 text-center space-y-3">
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-xs">
                {errorMsg}
              </div>
              <button
                onClick={runAiVerification}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-500"
              >
                Coba Lagi
              </button>
            </div>
          ) : evaluationResult ? (
            <div className="space-y-4">
              
              {/* Score Gauge Banner */}
              <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Status Kelayakan</div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span>{evaluationResult.statusKelayakan}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {evaluationResult.skorKelengkapan}
                    <span className="text-xs text-slate-400 font-normal">/100</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Skor Pendaftaran</div>
                </div>
              </div>

              {/* Recommendation Box */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-1">
                  Rekomendasi AI Gemini:
                </h4>
                <p className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {evaluationResult.rekomendasi}
                </p>
              </div>

              {/* Strengths & Validator Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                  <h5 className="font-bold text-emerald-800 dark:text-emerald-400 text-xs mb-1.5 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Poin Keunggulan:
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 text-xs">
                    {evaluationResult.keunggulan?.map((k, idx) => (
                      <li key={idx}>{k}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50/60 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200 dark:border-amber-900/50">
                  <h5 className="font-bold text-amber-800 dark:text-amber-400 text-xs mb-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Catatan Panitia:
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 text-xs">
                    {evaluationResult.catatanVerifikator?.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="text-right text-[10px] text-slate-400 italic">
                Dianalisis pada: {evaluationResult.evaluatedAt || new Date().toLocaleTimeString()}
              </div>

            </div>
          ) : null}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <button
            onClick={runAiVerification}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Analisis Ulang</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
