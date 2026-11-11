import React, { useState, useEffect } from 'react';
import { ScanFace, Fingerprint, Lock, CheckCircle2, XCircle, AlertCircle, Key } from 'lucide-react';
import { BiometryType } from '../types';

interface BiometricModalProps {
  isOpen: boolean;
  biometryType: BiometryType;
  title?: string;
  subtitle?: string;
  onSuccess: () => void;
  onCancel: () => void;
  allowPasscodeFallback?: boolean;
}

export const BiometricModal: React.FC<BiometricModalProps> = ({
  isOpen,
  biometryType,
  title = 'Verifikasi Biometrik',
  subtitle = 'Pindai wajah atau sidik jari untuk mengonfirmasi identitas kamu.',
  onSuccess,
  onCancel,
  allowPasscodeFallback = true,
}) => {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'failed' | 'passcode'>('idle');
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStatus('scanning');
      setPasscode('');
      setPasscodeError('');

      // Simulate authentic biometric sensor scan timing (800ms)
      const timer = window.setTimeout(() => {
        setStatus('success');
        const completeTimer = window.setTimeout(() => {
          onSuccess();
          setStatus('idle');
        }, 550);
        return () => window.clearTimeout(completeTimer);
      }, 950);

      return () => window.clearTimeout(timer);
    } else {
      setStatus('idle');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isFaceID = biometryType === 'faceID';

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.length >= 4) {
      setStatus('success');
      setTimeout(() => {
        onSuccess();
        setStatus('idle');
      }, 400);
    } else {
      setPasscodeError('Masukkan minimal 4 digit passcode.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-center text-slate-100">
        {status === 'passcode' ? (
          <div>
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-800/80 flex items-center justify-center text-emerald-400">
              <Key className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100">Gunakan Device Passcode</h3>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Masukkan passcode perangkat atau master PIN kamu.
            </p>

            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <input
                type="password"
                maxLength={8}
                autoFocus
                placeholder="••••••"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full text-center text-2xl tracking-widest py-3 bg-slate-950 border border-slate-750 rounded-xl focus:outline-none focus:border-emerald-500 font-mono text-white"
              />

              {passcodeError && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{passcodeError}</span>
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setStatus('scanning')}
                  className="flex-1 py-2.5 text-xs font-medium text-slate-400 bg-slate-800 hover:bg-slate-750 rounded-xl transition-colors"
                >
                  Kembali ke Biometrik
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors"
                >
                  Buka Kunci
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            {/* Visual Scanner Frame */}
            <div className="relative w-24 h-24 mx-auto mb-5 flex items-center justify-center">
              {/* Outer sensor ring */}
              <div
                className={`absolute inset-0 rounded-full border-2 transition-all duration-500 ${
                  status === 'success'
                    ? 'border-emerald-500 scale-105'
                    : status === 'failed'
                    ? 'border-rose-500'
                    : 'border-emerald-500/40 animate-ping opacity-25'
                }`}
              />

              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden ${
                  status === 'success'
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : status === 'failed'
                    ? 'bg-rose-500/15 text-rose-400'
                    : 'bg-slate-800 text-emerald-400 shadow-inner'
                }`}
              >
                {/* Scanning line indicator */}
                {status === 'scanning' && (
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan-line" />
                )}

                {status === 'success' ? (
                  <CheckCircle2 className="w-10 h-10 animate-in zoom-in duration-300" />
                ) : status === 'failed' ? (
                  <XCircle className="w-10 h-10 animate-in shake duration-300" />
                ) : isFaceID ? (
                  <ScanFace className="w-10 h-10 animate-bio-pulse" />
                ) : (
                  <Fingerprint className="w-10 h-10 animate-bio-pulse" />
                )}
              </div>
            </div>

            {/* Labels */}
            <h3 className="text-base font-semibold text-slate-100 tracking-tight">
              {status === 'success'
                ? 'Terverifikasi'
                : status === 'failed'
                ? 'Verifikasi Gagal'
                : isFaceID
                ? 'Face ID'
                : 'Touch ID'}
            </h3>

            <p className="text-xs text-slate-400 mt-1.5 mb-6 px-2 leading-relaxed">
              {status === 'success'
                ? 'Identitas telah terkonfirmasi secara aman.'
                : status === 'failed'
                ? 'Verifikasi biometrik gagal. Silakan coba lagi.'
                : subtitle}
            </p>

            {/* Action buttons */}
            <div className="space-y-2">
              {allowPasscodeFallback && status !== 'success' && (
                <button
                  type="button"
                  onClick={() => setStatus('passcode')}
                  className="w-full py-2.5 px-4 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-colors"
                >
                  Gunakan Passcode Perangkat
                </button>
              )}

              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
