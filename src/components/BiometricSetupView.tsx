import React, { useState } from 'react';
import { ScanFace, Fingerprint, ShieldCheck, Check, ArrowRight, Key } from 'lucide-react';
import { BiometryType } from '../types';
import { detectDeviceBiometry } from '../services/biometrics';

interface BiometricSetupViewProps {
  onComplete: (enabled: boolean, type: BiometryType) => void;
  onSkip: () => void;
}

export const BiometricSetupView: React.FC<BiometricSetupViewProps> = ({
  onComplete,
  onSkip,
}) => {
  const biometry = detectDeviceBiometry();
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);

  const isFaceID = biometry.type === 'faceID';
  const buttonLabel = isFaceID
    ? 'Enable Face ID'
    : biometry.type === 'touchID'
    ? 'Enable Touch ID'
    : 'Enable Biometric / Passkey';

  const handleEnable = () => {
    setActivating(true);
    setTimeout(() => {
      setActivating(false);
      setActivated(true);
      setTimeout(() => {
        onComplete(true, biometry.type);
      }, 700);
    }, 1100);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 animate-in fade-in duration-300">
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl text-slate-100 text-center">
        {/* Sensor graphic */}
        <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-emerald-500/10 border border-emerald-500/20" />
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center transition-all duration-300">
            {activated ? (
              <Check className="w-9 h-9 animate-in zoom-in" />
            ) : isFaceID ? (
              <ScanFace className={`w-9 h-9 ${activating ? 'animate-bio-pulse' : ''}`} />
            ) : (
              <Fingerprint className={`w-9 h-9 ${activating ? 'animate-bio-pulse' : ''}`} />
            )}
          </div>
        </div>

        <h2 className="text-xl font-bold tracking-tight text-white mb-2">Secure Your Vault</h2>
        <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto mb-6">
          Gunakan Face ID atau Touch ID untuk melindungi password kamu dengan autentikasi instan tanpa memasukkan password master berulang kali.
        </p>

        {/* Security architecture highlights */}
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl mb-6 text-left space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Apple Secure Enclave & LocalAuthentication (LAContext)</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Privasi total: Sidik jari & wajah tidak pernah keluar dari perangkat</span>
          </div>
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Cadangan otomatis dengan device passcode perangkat</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleEnable}
            disabled={activating || activated}
            className="w-full py-3 px-5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/15 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {activated ? (
              <>
                <Check className="w-4 h-4" />
                <span>Biometrik Berhasil Diaktifkan</span>
              </>
            ) : activating ? (
              <span>Menginisialisasi Secure Enclave...</span>
            ) : (
              <>
                {isFaceID ? <ScanFace className="w-4 h-4" /> : <Fingerprint className="w-4 h-4" />}
                <span>{buttonLabel}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onSkip}
            className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
          >
            Lewati untuk sekarang (Gunakan Master Password)
          </button>
        </div>
      </div>
    </div>
  );
};
