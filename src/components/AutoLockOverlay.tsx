import React from 'react';
import { Lock, ScanFace, Fingerprint, Shield, KeyRound } from 'lucide-react';
import { BiometryType } from '../types';

interface AutoLockOverlayProps {
  isLocked: boolean;
  biometryType: BiometryType;
  onUnlockRequest: () => void;
  onLogout: () => void;
}

export const AutoLockOverlay: React.FC<AutoLockOverlayProps> = ({
  isLocked,
  biometryType,
  onUnlockRequest,
  onLogout,
}) => {
  if (!isLocked) return null;

  const isFaceID = biometryType === 'faceID';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900/90 border border-slate-800 p-8 shadow-2xl text-center text-slate-100 flex flex-col items-center">
        {/* Animated Security Shield Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Lock className="w-9 h-9" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
            {isFaceID ? <ScanFace className="w-4 h-4" /> : <Fingerprint className="w-4 h-4" />}
          </div>
        </div>

        <h2 className="text-xl font-bold tracking-tight text-white mb-2">Vault Locked</h2>
        <p className="text-xs text-slate-400 leading-relaxed mb-8 max-w-[260px]">
          Vault terkunci otomatis untuk menjaga keamanan data enkripsi kamu saat tidak aktif.
        </p>

        {/* Primary unlock CTA */}
        <button
          type="button"
          onClick={onUnlockRequest}
          className="w-full py-3 px-5 bg-emerald-400 hover:bg-emerald-300 active:scale-[0.98] text-slate-950 font-semibold text-sm rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mb-3"
        >
          {isFaceID ? (
            <>
              <ScanFace className="w-4 h-4" />
              <span>Unlock with Face ID</span>
            </>
          ) : (
            <>
              <Fingerprint className="w-4 h-4" />
              <span>Unlock with Touch ID</span>
            </>
          )}
        </button>

        {/* Alternate login/logout */}
        <button
          type="button"
          onClick={onLogout}
          className="py-2 px-4 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
        >
          Logout & Masuk Akun Lain
        </button>
      </div>
    </div>
  );
};
