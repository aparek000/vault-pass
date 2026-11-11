import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Database,
  Lock,
  Cpu,
  Wrench,
} from 'lucide-react';
import { runSecurityDiagnostics, DiagnosticSummary } from '../services/diagnostics';
import { SecurityCheckItem } from '../types';

interface SecurityDiagnosticViewProps {
  onProceed: () => void;
  onOpenSupabaseConfig: () => void;
  isStandalone?: boolean;
}

export const SecurityDiagnosticView: React.FC<SecurityDiagnosticViewProps> = ({
  onProceed,
  onOpenSupabaseConfig,
  isStandalone = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DiagnosticSummary | null>(null);

  const executeChecks = async () => {
    setLoading(true);
    try {
      const result = await runSecurityDiagnostics(onOpenSupabaseConfig);
      setSummary(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeChecks();
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Security Diagnostic</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pemeriksaan kesiapan perangkat, modul biometrik, dan integritas kriptografi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={executeChecks}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Pindai Ulang"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Readiness Description */}
        <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl mb-6 text-xs text-slate-300 leading-relaxed">
          <p>
            Diagnostik ini memeriksa kesiapan hardware (Face ID / Touch ID / Enclave),
            ketersediaan Web Cryptography API untuk enkripsi AES-256 client-side, dan status
            koneksi basis data Supabase RLS. Data biometrik kamu tidak pernah dibaca atau disimpan.
          </p>
        </div>

        {/* Checklist */}
        <div className="space-y-3 mb-6">
          {loading ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-400" />
              <p className="text-xs font-medium">Memeriksa kesiapan lingkungan keamanan...</p>
            </div>
          ) : summary ? (
            summary.checks.map((check: SecurityCheckItem) => (
              <div
                key={check.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {check.status === 'passed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-100 flex items-center gap-2">
                        <span>{check.title}</span>
                        {check.details && (
                          <span className="text-[10px] text-slate-500 font-mono font-normal">
                            ({check.details})
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {check.description}
                      </p>
                    </div>
                  </div>

                  {/* Fix button if issue found */}
                  {check.fixAction && check.fixLabel && (
                    <button
                      type="button"
                      onClick={check.fixAction}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{check.fixLabel}</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : null}
        </div>

        {/* Diagnostic Score & Action */}
        {summary && !loading && (
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              <span className="text-slate-500">Skor Kesiapan:</span>{' '}
              <span className="font-semibold text-emerald-400 font-mono">
                {summary.score}% Ready
              </span>
              <span className="text-slate-600 mx-2">·</span>
              <span className="text-slate-500">{summary.testedAt}</span>
            </div>

            <button
              type="button"
              onClick={onProceed}
              className="py-2.5 px-5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-2"
            >
              <span>{isStandalone ? 'Selesai & Kembali' : 'Lanjutkan ke Vault'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
