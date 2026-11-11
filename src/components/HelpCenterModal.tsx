import React from 'react';
import { X, HelpCircle, ShieldCheck, Key, Lock, Smartphone, Terminal, CheckCircle2 } from 'lucide-react';

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpCenterModal: React.FC<HelpCenterModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Bantuan & Panduan Keamanan</h3>
              <p className="text-xs text-slate-400">Panduan penggunaan VaultPass & standar enkripsi</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto space-y-6 py-3 text-xs leading-relaxed pr-1">
          {/* Section 1: How to use VaultPass */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <span>How to use VaultPass</span>
            </h4>
            <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-slate-300">
              <ol className="space-y-2 list-none">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <span>Login menggunakan akun kamu atau buat vault baru.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <span>Selesaikan <strong>Security Diagnostic</strong> untuk memastikan kesiapan modul enkripsi dan hardware biometrik.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  <span>Aktifkan <strong>Face ID</strong> atau <strong>Touch ID</strong> untuk proteksi instan satu sentuhan.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                  <span>Tambahkan password melalui tombol <strong>+ (Add Password)</strong>.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">5</span>
                  <span>Masukkan nama aplikasi, username, dan gunakan generator untuk password yang kuat.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">6</span>
                  <span>Simpan. Password otomatis dienkripsi secara client-side dengan algoritma AES-256.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">7</span>
                  <span>Untuk melihat password, lakukan verifikasi biometrik. Password hanya tampil sementara dan otomatis tersembunyi kembali.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0">8</span>
                  <span>Untuk menyalin password, tekan tombol <strong>Copy</strong>. Clipboard otomatis dibersihkan dalam 30 detik untuk mencegah sniffing.</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Section 2: Security Tips */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Tips Keamanan Profesional</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-1">Jangan membagikan Master Password</span>
                <span className="text-slate-400 text-[11px]">Kunci utama kamu tidak pernah tersimpan di server. Jika hilang, data tidak dapat dipulihkan.</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-1">Password unik per layanan</span>
                <span className="text-slate-400 text-[11px]">Jangan pernah menggunakan password yang sama antar akun untuk mencegah efek domino credential stuffing.</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-1">Aktifkan Biometrik (Face ID / Touch ID)</span>
                <span className="text-slate-400 text-[11px]">Biometrik memverifikasi kehadiran fisik pengguna secara lokal tanpa mentransmisikan data sidik jari/wajah.</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="font-semibold text-slate-200 block mb-1">Koneksi Terenkripsi HTTPS</span>
                <span className="text-slate-400 text-[11px]">Selalu akses VaultPass melalui jalur aman TLS 1.3/HTTPS untuk mencegah man-in-the-middle attacks.</span>
              </div>
            </div>
          </div>

          {/* Section 3: Architecture Reference */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Arsitektur Native iOS & Web Cryptography</span>
            </h4>
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-[11px] font-mono text-slate-300 space-y-2">
              <p className="text-slate-400">
                // Implementasi iOS Native (SwiftUI):
                <br />- <strong>LAContext</strong>: canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics)
                <br />- <strong>Keychain Services</strong>: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
                <br />- <strong>Secure Enclave</strong>: Menjaga private key perangkat tidak pernah meninggalkan hardware.
              </p>
              <p className="text-slate-400 pt-1 border-t border-slate-850">
                // Implementasi Web Browser:
                <br />- <strong>WebAuthn</strong>: navigator.credentials.get() / PublicKeyCredential
                <br />- <strong>Web Cryptography API</strong>: crypto.subtle (PBKDF2 100k + AES-GCM 256)
                <br />- <strong>PostgreSQL RLS</strong>: Supabase auth.uid() = user_id policy
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 shrink-0 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors shadow-sm"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
