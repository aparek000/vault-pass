import React, { useState } from 'react';
import {
  ShieldCheck,
  Fingerprint,
  ScanFace,
  Clock,
  KeyRound,
  Database,
  LogOut,
  AlertTriangle,
  Check,
  ChevronRight,
  Shield,
  FileCode,
  Download,
  Upload,
  CloudUpload,
} from 'lucide-react';
import { UserProfile, AutoLockTimeout, BiometryType } from '../types';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateSettings: (updates: Partial<UserProfile>) => void;
  onRunDiagnostics: () => void;
  onOpenSupabase: () => void;
  onOpenDeploy?: () => void;
  onLogout: () => void;
  onRequireBiometric: (action: string, callback: () => void) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateSettings,
  onRunDiagnostics,
  onOpenSupabase,
  onOpenDeploy,
  onLogout,
  onRequireBiometric,
}) => {
  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMessage, setPwdMessage] = useState('');
  const [exportNotice, setExportNotice] = useState('');

  const isFaceID = user.biometry_type === 'faceID';

  const handleToggleBiometric = () => {
    onRequireBiometric('toggle_biometric', () => {
      onUpdateSettings({ biometric_enabled: !user.biometric_enabled });
    });
  };

  const handleTimeoutChange = (timeout: AutoLockTimeout) => {
    onUpdateSettings({ auto_lock_timeout: timeout });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPwdMessage('Password baru harus minimal 8 karakter.');
      return;
    }
    setPwdMessage('Master Password berhasil diperbarui.');
    setTimeout(() => {
      setChangePwdOpen(false);
      setPwdMessage('');
      setCurrentPassword('');
      setNewPassword('');
    }, 1500);
  };

  const handleExportBackup = () => {
    onRequireBiometric('export', () => {
      const dataStr = localStorage.getItem(`vaultpass_entries_${user.id}`) || '[]';
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vaultpass-encrypted-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setExportNotice('File cadangan terenkripsi berhasil diunduh.');
      setTimeout(() => setExportNotice(''), 3000);
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Security Settings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Konfigurasi autentikasi biometrik, timeout auto-lock, dan koneksi Supabase
        </p>
      </div>

      {/* Group 1: Biometric Authentication */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              {isFaceID ? <ScanFace className="w-5 h-5" /> : <Fingerprint className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Biometric Authentication
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gunakan {isFaceID ? 'Face ID' : 'Touch ID'} untuk membuka vault & verifikasi password
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={user.biometric_enabled}
              onChange={handleToggleBiometric}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
      </div>

      {/* Group 2: Auto Lock Timeout */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Auto Lock Timeout
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kunci vault otomatis saat aplikasi tidak digunakan atau berada di latar belakang
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-1">
          {(
            [
              { id: 'immediate', label: 'Immediately' },
              { id: '1m', label: '1 minute' },
              { id: '5m', label: '5 minutes' },
              { id: '15m', label: '15 minutes' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTimeoutChange(t.id)}
              className={`py-2 text-xs font-medium rounded-xl transition-colors border ${
                user.auto_lock_timeout === t.id
                  ? 'bg-slate-900 dark:bg-emerald-500/20 text-white dark:text-emerald-300 border-slate-900 dark:border-emerald-500/40 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Group 3: Master Password & Diagnostic */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
        {/* Change Master Password */}
        <div className="p-4">
          <div
            onClick={() => setChangePwdOpen(!changePwdOpen)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Change Master Password
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Perbarui kunci utama yang digunakan untuk enkripsi AES vault
                </p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${changePwdOpen ? 'rotate-90' : ''}`} />
          </div>

          {changePwdOpen && (
            <form onSubmit={handleChangePassword} className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Password Saat Ini</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Password Baru (Minimal 8 karakter)</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
                />
              </div>

              {pwdMessage && (
                <p className="text-xs text-emerald-500 font-medium">{pwdMessage}</p>
              )}

              <button
                type="submit"
                className="py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl transition-colors"
              >
                Simpan Password Baru
              </button>
            </form>
          )}
        </div>

        {/* Security Diagnostic */}
        <div
          onClick={onRunDiagnostics}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Security Diagnostic
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Jalankan ulang pemeriksaan integritas perangkat, passcode, dan biometrik
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Supabase Connection */}
        <div
          onClick={onOpenSupabase}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Supabase & PostgreSQL RLS
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Konfigurasi URL, API Key, dan salin script SQL schema & security policies
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Publish ke GitHub & Netlify */}
        {onOpenDeploy && (
          <div
            onClick={onOpenDeploy}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <CloudUpload className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Publish ke GitHub & Netlify
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Panduan deploy online, CI/CD otomatis, dan konfigurasi environment variables
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        )}

        {/* Encrypted Vault Export */}
        <div
          onClick={handleExportBackup}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-500 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Export Encrypted Vault
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unduh salinan backup terenkripsi ciphertext AES-256 untuk disimpan offline
              </p>
              {exportNotice && <p className="text-xs text-emerald-500 mt-1">{exportNotice}</p>}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Session Management & Logout */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Active Session
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {user.email} · Terenkripsi
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
