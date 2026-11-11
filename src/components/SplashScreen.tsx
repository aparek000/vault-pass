import React, { useEffect } from 'react';
import { Shield, Lock } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 p-6 select-none cursor-pointer animate-in fade-in duration-500"
    >
      {/* Background subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Security Emblem */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-2xl shadow-emerald-500/10 animate-bio-pulse">
          <Shield className="w-12 h-12" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Lock className="w-5 h-5 text-emerald-300 translate-y-0.5" />
        </div>
      </div>

      {/* Brand title & subtitle */}
      <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">VaultPass</h1>
      <p className="text-sm text-slate-400 font-medium tracking-wide">
        Your passwords. Protected.
      </p>

      {/* Subtext info */}
      <div className="mt-16 flex items-center gap-2 text-xs text-slate-500 font-mono">
        <span className="w-2 h-2 rounded-full bg-emerald-500/80 animate-ping" />
        <span>AES-256 · Biometrics · Zero-Knowledge</span>
      </div>
    </div>
  );
};
