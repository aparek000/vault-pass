import React from 'react';
import { Shield, Lock, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
  onHaveAccount: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStart,
  onHaveAccount,
}) => {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 animate-in fade-in duration-300">
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl text-slate-100 text-center">
        {/* Shield / Lock Illustration */}
        <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-emerald-500/20 to-transparent border border-emerald-500/25 rotate-3" />
          <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 shadow-xl relative z-10 -rotate-3">
            <Shield className="w-10 h-10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-4 h-4 text-emerald-300 translate-y-0.5" />
            </div>
          </div>
        </div>

        {/* Headings */}
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
          Selamat datang di VaultPass
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto mb-8">
          Kelola password kamu dengan lebih aman dan mudah.
        </p>

        {/* Feature summary */}
        <div className="space-y-2.5 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl mb-8 text-left text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Enkripsi AES-256 client-side (Zero-Knowledge)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Verifikasi biometrik Face ID / Touch ID</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Supabase PostgreSQL dengan Row Level Security</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={onStart}
            className="w-full py-3.5 px-6 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/15 flex items-center justify-center gap-2"
          >
            <span>Mulai</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onHaveAccount}
            className="w-full py-3 px-6 bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium text-xs rounded-xl transition-colors border border-slate-700/60"
          >
            Saya sudah punya akun
          </button>
        </div>
      </div>
    </div>
  );
};
