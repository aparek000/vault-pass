import React, { useState, useEffect } from 'react';
import { X, Lock, Globe, User, FileText, KeyRound, Sparkles, AlertCircle } from 'lucide-react';
import { PasswordEntry, PasswordCategory } from '../types';
import { PasswordGenerator } from './PasswordGenerator';
import { evaluatePasswordStrength } from '../services/crypto';

interface AddEditPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    service_name: string;
    username: string;
    plain_password: string;
    notes?: string;
    website_url?: string;
    category?: PasswordCategory;
    icon_key?: string;
  }) => Promise<void>;
  initialEntry?: PasswordEntry | null;
  masterKey: string;
}

const CATEGORIES: PasswordCategory[] = ['Social', 'Work', 'Finance', 'Entertainment', 'Tech'];

const PRESET_SERVICES = [
  { name: 'Google', icon: 'google', cat: 'Work' },
  { name: 'Instagram', icon: 'instagram', cat: 'Social' },
  { name: 'Discord', icon: 'discord', cat: 'Social' },
  { name: 'Roblox', icon: 'roblox', cat: 'Entertainment' },
  { name: 'GitHub', icon: 'github', cat: 'Tech' },
  { name: 'Spotify', icon: 'spotify', cat: 'Entertainment' },
  { name: 'Netflix', icon: 'globe', cat: 'Entertainment' },
  { name: 'Steam', icon: 'globe', cat: 'Entertainment' },
  { name: 'Banking', icon: 'globe', cat: 'Finance' },
];

export const AddEditPasswordModal: React.FC<AddEditPasswordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEntry,
}) => {
  const [serviceName, setServiceName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<PasswordCategory>('Social');
  const [iconKey, setIconKey] = useState<string>('');
  const [showGenerator, setShowGenerator] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialEntry) {
      setServiceName(initialEntry.service_name);
      setUsername(initialEntry.username);
      setWebsiteUrl(initialEntry.website_url || '');
      setNotes(initialEntry.notes || '');
      setCategory(initialEntry.category || 'Social');
      setIconKey(initialEntry.icon_key || '');
      setPassword(''); // keep blank unless user changes it
      setShowGenerator(false);
      setError('');
    } else {
      setServiceName('');
      setUsername('');
      setPassword('');
      setWebsiteUrl('');
      setNotes('');
      setCategory('Social');
      setIconKey('');
      setShowGenerator(false);
      setError('');
    }
  }, [initialEntry, isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: (typeof PRESET_SERVICES)[0]) => {
    setServiceName(preset.name);
    setIconKey(preset.icon);
    setCategory(preset.cat as PasswordCategory);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) {
      setError('Nama aplikasi atau website wajib diisi.');
      return;
    }
    if (!username.trim()) {
      setError('Username atau email wajib diisi.');
      return;
    }
    if (!initialEntry && !password.trim()) {
      setError('Password wajib diisi atau gunakan Password Generator.');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      await onSave({
        service_name: serviceName,
        username,
        plain_password: password,
        website_url: websiteUrl,
        notes,
        category,
        icon_key: iconKey || serviceName.toLowerCase(),
      });
      setIsSaving(false);
      onClose();
    } catch (err: unknown) {
      setIsSaving(false);
      setError(err instanceof Error ? err.message : 'Gagal menyimpan password.');
    }
  };

  const strength = password ? evaluatePasswordStrength(password) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                {initialEntry ? 'Edit Password' : 'Add Password'}
              </h3>
              <p className="text-xs text-slate-400">
                Enkripsi AES-256 client-side aktif sebelum disimpan
              </p>
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

        {/* Preset chips for fast quick-fill */}
        {!initialEntry && (
          <div className="pt-3 pb-2">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-2">
              Pilihan Cepat
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SERVICES.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors border ${
                    serviceName.toLowerCase() === p.name.toLowerCase()
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800/80 text-slate-300 border-slate-750 hover:bg-slate-800'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* App / Website Name */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              App / Website Name *
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                required
                placeholder="Google, Instagram, Discord, Bank BCA..."
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-100 placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Username / Email */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Username / Email *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                required
                placeholder="username@gmail.com atau user ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 text-slate-100 placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Password with Generator Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">
                {initialEntry ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password *'}
              </label>
              <button
                type="button"
                onClick={() => setShowGenerator(!showGenerator)}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{showGenerator ? 'Tutup Generator' : 'Generate Strong Password'}</span>
              </button>
            </div>

            {showGenerator ? (
              <div className="mb-3">
                <PasswordGenerator
                  onSelectPassword={(pwd) => {
                    setPassword(pwd);
                    setShowGenerator(false);
                  }}
                />
              </div>
            ) : (
              <div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Masukkan password atau generate..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono focus:outline-none focus:border-emerald-500 text-slate-100 placeholder:text-slate-600"
                  />
                </div>
                {strength && (
                  <div className="flex items-center justify-between text-[11px] mt-1.5 px-1">
                    <span className="text-slate-500">Kekuatan Password</span>
                    <span className={`font-semibold ${strength.color}`}>
                      {strength.label} ({strength.score}/100)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Kategori
            </label>
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                    category === cat
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-semibold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Catatan / Security Notes (Opsional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <textarea
                rows={2}
                placeholder="2FA backup code, pertanyaan keamanan, atau detail login..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-100 placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-medium text-slate-400 bg-slate-800 hover:bg-slate-750 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {isSaving ? 'Mengenkripsi...' : 'Save Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
