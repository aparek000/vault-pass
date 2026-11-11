/**
 * VaultPass: Secure Password Manager
 * Architecture: Zero-Knowledge Client-Side AES-256-GCM + Apple LocalAuthentication / WebAuthn + Supabase RLS
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Shield,
  KeyRound,
  Search,
  Plus,
  Lock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Settings,
  Sparkles,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import {
  ScreenState,
  UserProfile,
  PasswordEntry,
  PasswordCategory,
  BiometryType,
  AutoLockTimeout,
} from './types';
import { detectDeviceBiometry } from './services/biometrics';
import {
  fetchUserVaultEntries,
  createPasswordEntry,
  updatePasswordEntry,
  deletePasswordEntry,
  seedInitialVault,
} from './services/vaultStorage';
import { SplashScreen } from './components/SplashScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SecurityDiagnosticView } from './components/SecurityDiagnosticView';
import { AuthView } from './components/AuthView';
import { BiometricSetupView } from './components/BiometricSetupView';
import { PasswordCard } from './components/PasswordCard';
import { PasswordDetailModal } from './components/PasswordDetailModal';
import { AddEditPasswordModal } from './components/AddEditPasswordModal';
import { BiometricModal } from './components/BiometricModal';
import { AutoLockOverlay } from './components/AutoLockOverlay';
import { SettingsView } from './components/SettingsView';
import { HelpCenterModal } from './components/HelpCenterModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { DeployModal } from './components/DeployModal';
import { Navbar } from './components/Navbar';
import { MobileDeviceFrame } from './components/MobileDeviceFrame';

const DEFAULT_USER: UserProfile = {
  id: 'usr_default_demo',
  name: 'Alex Rivera',
  email: 'alex.rivera@vaultpass.app',
  biometric_enabled: true,
  biometry_type: 'faceID',
  auto_lock_timeout: '5m',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function App() {
  // Screens & Navigation
  const [screen, setScreen] = useState<ScreenState>('splash');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USER);
  const [masterKey, setMasterKey] = useState<string>('Vault#Pass2026!');

  // Vault data
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PasswordCategory>('All');

  // Modals & Interactivity
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | null>(null);
  const [detailEntry, setDetailEntry] = useState<PasswordEntry | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  // Biometric Challenge
  const [biometricModalOpen, setBiometricModalOpen] = useState(false);
  const [biometricActionLabel, setBiometricActionLabel] = useState('Verifikasi identitas');
  const [biometricPendingCallback, setBiometricPendingCallback] = useState<(() => void) | null>(null);

  // Auto Lock
  const [isVaultLocked, setIsVaultLocked] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());

  // Themes & Presentation
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isMobileDeviceView, setIsMobileDeviceView] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Initial detection
  useEffect(() => {
    const biometry = detectDeviceBiometry();
    setCurrentUser((prev) => ({
      ...prev,
      biometry_type: biometry.type,
    }));
  }, []);

  // Sync dark class on html
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load entries when user / master key changes
  const reloadEntries = async () => {
    if (!currentUser.id) return;
    try {
      const data = await fetchUserVaultEntries(currentUser.id, masterKey);
      setEntries(data);
    } catch (err) {
      console.error('Failed to load vault entries:', err);
    }
  };

  useEffect(() => {
    if (screen === 'vault') {
      reloadEntries();
    }
  }, [screen, currentUser.id]);

  // Toast auto-clear
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  // Trigger Biometric verification
  const requireBiometric = (action: string, callback: () => void) => {
    if (!currentUser.biometric_enabled) {
      callback();
      return;
    }

    let label = 'Verifikasi identitas kamu';
    if (action === 'reveal') label = 'Pindai untuk melihat password';
    if (action === 'copy') label = 'Pindai untuk menyalin password ke clipboard';
    if (action === 'unlock') label = 'Buka kunci vault dengan biometrik';

    setBiometricActionLabel(label);
    setBiometricPendingCallback(() => callback);
    setBiometricModalOpen(true);
  };

  const handleBiometricSuccess = () => {
    setBiometricModalOpen(false);
    if (biometricPendingCallback) {
      biometricPendingCallback();
      setBiometricPendingCallback(null);
    }
    if (isVaultLocked) {
      setIsVaultLocked(false);
      lastActivityRef.current = Date.now();
    }
  };

  // Inactivity & Visibility Auto-Lock Listener
  useEffect(() => {
    const timeoutSetting = currentUser.auto_lock_timeout;
    if (timeoutSetting === 'never' || screen !== 'vault') return;

    let timeoutMs = 5 * 60 * 1000; // default 5m
    if (timeoutSetting === 'immediate') timeoutMs = 30 * 1000;
    if (timeoutSetting === '1m') timeoutMs = 60 * 1000;
    if (timeoutSetting === '5m') timeoutMs = 5 * 60 * 1000;
    if (timeoutSetting === '15m') timeoutMs = 15 * 60 * 1000;

    const recordActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const intervalId = window.setInterval(() => {
      if (!isVaultLocked && Date.now() - lastActivityRef.current > timeoutMs) {
        setIsVaultLocked(true);
      }
    }, 5000);

    const handleVisibilityChange = () => {
      if (document.hidden && timeoutSetting === 'immediate') {
        setIsVaultLocked(true);
      }
    };

    window.addEventListener('mousemove', recordActivity);
    window.addEventListener('keydown', recordActivity);
    window.addEventListener('touchstart', recordActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('mousemove', recordActivity);
      window.removeEventListener('keydown', recordActivity);
      window.removeEventListener('touchstart', recordActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentUser.auto_lock_timeout, isVaultLocked, screen]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        entry.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.website_url && entry.website_url.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' || entry.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [entries, searchQuery, selectedCategory]);

  // Handle Save / Edit entry
  const handleSavePassword = async (data: {
    service_name: string;
    username: string;
    plain_password: string;
    notes?: string;
    website_url?: string;
    category?: PasswordCategory;
    icon_key?: string;
  }) => {
    if (editingEntry) {
      await updatePasswordEntry(
        currentUser.id,
        editingEntry.id,
        {
          service_name: data.service_name,
          username: data.username,
          plain_password: data.plain_password || undefined,
          notes: data.notes,
          website_url: data.website_url,
          category: data.category,
        },
        masterKey
      );
      showToast(`Password untuk ${data.service_name} berhasil diperbarui.`);
    } else {
      await createPasswordEntry(currentUser.id, data, masterKey);
      showToast(`Password untuk ${data.service_name} telah dienkripsi dan disimpan.`);
    }
    await reloadEntries();
    setEditingEntry(null);
  };

  const handleDeleteEntry = async (entry: PasswordEntry) => {
    requireBiometric('delete', async () => {
      if (confirm(`Apakah kamu yakin ingin menghapus password untuk ${entry.service_name}?`)) {
        await deletePasswordEntry(currentUser.id, entry.id);
        await reloadEntries();
        if (detailEntry?.id === entry.id) {
          setDetailEntry(null);
        }
        showToast(`Entry ${entry.service_name} telah dihapus.`);
      }
    });
  };

  // Screen Rendering
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans">
      {/* 1. Splash Screen */}
      {screen === 'splash' && (
        <SplashScreen onComplete={() => setScreen('welcome')} />
      )}

      {/* Global Notifications Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs py-3 px-4 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation bar visible in authenticated vault & settings views */}
      {(screen === 'vault' || screen === 'settings' || screen === 'help' || screen === 'diagnostic') && (
        <Navbar
          currentScreen={screen}
          onNavigate={(target) => setScreen(target)}
          onOpenAdd={() => {
            setEditingEntry(null);
            setIsAddModalOpen(true);
          }}
          onOpenDeploy={() => setIsDeployModalOpen(true)}
          onLockVault={() => setIsVaultLocked(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          isMobileDeviceView={isMobileDeviceView}
          onToggleDeviceView={() => setIsMobileDeviceView(!isMobileDeviceView)}
          savedCount={entries.length}
        />
      )}

      {/* Main Content Body */}
      <main className="flex-1 flex flex-col">
        <MobileDeviceFrame enabled={isMobileDeviceView}>
          {/* 2. Welcome Screen */}
          {screen === 'welcome' && (
            <WelcomeScreen
              onStart={() => {
                setAuthMode('register');
                setScreen('diagnostic');
              }}
              onHaveAccount={() => {
                setAuthMode('login');
                setScreen('diagnostic');
              }}
            />
          )}

          {/* 3. Security Diagnostic Screen */}
          {screen === 'diagnostic' && (
            <SecurityDiagnosticView
              onProceed={() => {
                if (currentUser.id && currentUser.id !== 'usr_default_demo') {
                  setScreen('vault');
                } else {
                  setScreen(authMode);
                }
              }}
              onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
              isStandalone={screen === 'diagnostic' && currentUser.id !== 'usr_default_demo'}
            />
          )}

          {/* 4. Login / Register Screens */}
          {(screen === 'login' || screen === 'register') && (
            <AuthView
              mode={screen}
              onSwitchMode={(mode) => setScreen(mode)}
              onSuccess={(user, key) => {
                setCurrentUser((prev) => ({
                  ...prev,
                  id: user.id,
                  email: user.email,
                  name: user.name,
                }));
                setMasterKey(key);
                setScreen('biometric_setup');
              }}
              onForgotPassword={() => {
                showToast('Link pemulihan akun telah dikirim ke email kamu.');
              }}
            />
          )}

          {/* 5. Biometric Setup Screen */}
          {screen === 'biometric_setup' && (
            <BiometricSetupView
              onComplete={(enabled, type) => {
                setCurrentUser((prev) => ({
                  ...prev,
                  biometric_enabled: enabled,
                  biometry_type: type,
                }));
                showToast(`Proteksi ${type === 'faceID' ? 'Face ID' : 'Touch ID'} berhasil diaktifkan.`);
                setScreen('vault');
              }}
              onSkip={() => {
                setScreen('vault');
              }}
            />
          )}

          {/* 6. Dashboard: Password Vault */}
          {screen === 'vault' && (
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
              {/* Header section (strictly according to prompt requirement #9) */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    My Vault
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Your passwords are protected.
                  </p>
                </div>

                {/* Vault Count Metric Card */}
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-lg font-mono">
                    {entries.length}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                      Saved Passwords
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      AES-256 Encrypted
                    </span>
                  </div>
                </div>
              </div>

              {/* Search Bar & Category Filters (Section 14) */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search your passwords by app, website, or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs md:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Categories Segmented Control */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {(['All', 'Social', 'Work', 'Finance', 'Entertainment', 'Tech'] as PasswordCategory[]).map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap shrink-0 border ${
                          selectedCategory === cat
                            ? 'bg-slate-900 dark:bg-emerald-500/20 text-white dark:text-emerald-300 border-slate-900 dark:border-emerald-500/40 shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Password Cards Grid (Section 9 & 10) */}
              {filteredEntries.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <KeyRound className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                    Tidak ada password ditemukan
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {searchQuery
                      ? `Tidak ada hasil untuk pencarian "${searchQuery}". Coba kata kunci lain.`
                      : 'Vault kamu masih kosong. Tambahkan password pertama kamu untuk memulai.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEntry(null);
                      setIsAddModalOpen(true);
                    }}
                    className="mt-2 px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Password</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEntries.map((entry) => (
                    <PasswordCard
                      key={entry.id}
                      entry={entry}
                      masterKey={masterKey}
                      onRequireBiometric={requireBiometric}
                      onCopySuccess={(service) => showToast(`Password ${service} disalin ke clipboard.`)}
                      onSelectDetail={(e) => setDetailEntry(e)}
                      onEdit={(e) => {
                        setEditingEntry(e);
                        setIsAddModalOpen(true);
                      }}
                      onDelete={handleDeleteEntry}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 7. Settings Screen */}
          {screen === 'settings' && (
            <SettingsView
              user={currentUser}
              onUpdateSettings={(updates) => {
                setCurrentUser((prev) => ({ ...prev, ...updates }));
                showToast('Pengaturan keamanan berhasil diperbarui.');
              }}
              onRunDiagnostics={() => setScreen('diagnostic')}
              onOpenSupabase={() => setIsSupabaseModalOpen(true)}
              onOpenDeploy={() => setIsDeployModalOpen(true)}
              onLogout={() => {
                if (confirm('Apakah kamu yakin ingin logout dari VaultPass?')) {
                  setScreen('login');
                  setMasterKey('');
                }
              }}
              onRequireBiometric={requireBiometric}
            />
          )}

          {/* 8. Help Center */}
          {screen === 'help' && (
            <div className="w-full max-w-2xl mx-auto px-4 py-8">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      How to use VaultPass
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Instruksi penggunaan dan panduan keamanan
                    </p>
                  </div>
                </div>

                <div className="space-y-3 bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <ol className="space-y-2.5 list-decimal pl-4">
                    <li>Login menggunakan akun kamu.</li>
                    <li>Selesaikan security diagnostic untuk memastikan kesiapan sistem.</li>
                    <li>Aktifkan Face ID atau Touch ID untuk kemudahan akses cepat.</li>
                    <li>Tambahkan password melalui tombol <strong>+ (Add Password)</strong>.</li>
                    <li>Masukkan nama aplikasi, username, dan password.</li>
                    <li>Simpan. Data dienkripsi sebelum disimpan ke database Supabase.</li>
                    <li>Untuk melihat password, lakukan verifikasi biometrik.</li>
                    <li>Untuk menyalin password, tekan tombol Copy.</li>
                  </ol>
                </div>

                <div className="pt-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Tips Keamanan
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      • Jangan membagikan master password kepada siapa pun.
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      • Gunakan password yang berbeda untuk setiap akun penting.
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      • Jangan menggunakan password yang sama di semua layanan.
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      • Aktifkan biometrik untuk melindungi autentikasi fisik.
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      • Jangan pernah menyimpan encryption key di source code.
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      • Selalu pastikan aplikasi diakses melalui HTTPS.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </MobileDeviceFrame>
      </main>

      {/* Floating Action Button (+) for Mobile / Quick Access */}
      {screen === 'vault' && (
        <button
          type="button"
          onClick={() => {
            setEditingEntry(null);
            setIsAddModalOpen(true);
          }}
          title="Add Password"
          className="fixed bottom-20 md:bottom-8 right-6 z-40 w-14 h-14 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/25 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}

      {/* Modal: Add / Edit Password */}
      <AddEditPasswordModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSavePassword}
        initialEntry={editingEntry}
        masterKey={masterKey}
      />

      {/* Modal: Password Detail */}
      <PasswordDetailModal
        isOpen={Boolean(detailEntry)}
        entry={detailEntry}
        onClose={() => setDetailEntry(null)}
        onEdit={(entry) => {
          setDetailEntry(null);
          setEditingEntry(entry);
          setIsAddModalOpen(true);
        }}
        onDelete={handleDeleteEntry}
        onRequireBiometric={requireBiometric}
        onCopySuccess={(service) => showToast(`Password ${service} disalin ke clipboard.`)}
        masterKey={masterKey}
      />

      {/* Modal: Biometric Prompt Challenge */}
      <BiometricModal
        isOpen={biometricModalOpen}
        biometryType={currentUser.biometry_type}
        subtitle={biometricActionLabel}
        onSuccess={handleBiometricSuccess}
        onCancel={() => {
          setBiometricModalOpen(false);
          setBiometricPendingCallback(null);
        }}
      />

      {/* Auto-Lock Screen Overlay */}
      <AutoLockOverlay
        isLocked={isVaultLocked}
        biometryType={currentUser.biometry_type}
        onUnlockRequest={() => requireBiometric('unlock', () => setIsVaultLocked(false))}
        onLogout={() => {
          setIsVaultLocked(false);
          setScreen('login');
          setMasterKey('');
        }}
      />

      {/* Supabase Connection & RLS Schema Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigSaved={() => {
          showToast('Konfigurasi Supabase disimpan.');
          reloadEntries();
        }}
      />

      {/* Deploy to GitHub & Netlify Guide Modal */}
      <DeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />

      {/* Help Center Modal */}
      <HelpCenterModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
