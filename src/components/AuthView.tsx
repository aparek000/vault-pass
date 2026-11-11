import React, { useState } from 'react';
import { Lock, Mail, User, KeyRound, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { evaluatePasswordStrength } from '../services/crypto';
import { getSupabaseClient } from '../services/supabase';

interface AuthViewProps {
  mode: 'login' | 'register';
  onSwitchMode: (mode: 'login' | 'register') => void;
  onSuccess: (user: { id: string; email: string; name: string }, masterKey: string) => void;
  onForgotPassword: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  mode,
  onSwitchMode,
  onSuccess,
  onForgotPassword,
}) => {
  const [email, setEmail] = useState('demo@vaultpass.app');
  const [name, setName] = useState('Alex Rivera');
  const [password, setPassword] = useState('Vault#Pass2026!');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = evaluatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Harap isi semua kolom yang diperlukan.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Harap masukkan nama lengkap kamu.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Konfirmasi password tidak cocok.');
        return;
      }
      if (!strength.hasMinLength || !strength.hasUpper || !strength.hasLower || !strength.hasNumber || !strength.hasSpecial) {
        setError('Password harus memenuhi semua kriteria keamanan (8+ karakter, huruf besar, kecil, angka, simbol).');
        return;
      }
    }

    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      let userId = 'user_demo_' + email.replace(/[^a-zA-Z0-9]/g, '');

      if (supabase) {
        try {
          if (mode === 'register') {
            const { data, error: regError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: { name },
              },
            });
            if (regError) throw regError;
            if (data.user) {
              userId = data.user.id;
            }
          } else {
            const { data, error: loginError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (loginError) throw loginError;
            if (data.user) {
              userId = data.user.id;
            }
          }
        } catch (authErr: unknown) {
          // If offline / demo credentials or Supabase not linked yet, allow offline mock sign-in
          const msg = authErr instanceof Error ? authErr.message : 'Auth error';
          console.warn('Supabase Auth notice, fallback to local vault encryption:', msg);
          if (msg.includes('Invalid login credentials')) {
            setError('Email atau password salah.');
            setLoading(false);
            return;
          }
        }
      }

      setLoading(false);
      onSuccess(
        {
          id: userId,
          email,
          name: mode === 'register' ? name : name || email.split('@')[0],
        },
        password // The master key derived in memory for client-side AES-GCM
      );
    } catch (err: unknown) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Autentikasi gagal. Silakan coba lagi.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 animate-in fade-in duration-300">
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl text-slate-100">
        {/* Brand Lockup */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto mb-3 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'Masukkan kredensial master untuk membuka vault terenkripsi kamu.'
              : 'Daftar dan aktifkan perlindungan biometrik untuk akunmu.'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl mb-4 flex items-center gap-2 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Nama Lengkap</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-100 placeholder:text-slate-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Email / Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-100 placeholder:text-slate-600 font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">
                {mode === 'login' ? 'Master Password' : 'Password'}
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300"
                >
                  Forgot Password?
                </button>
              )}
            </div>

            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-100 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-100 font-mono"
                />
              </div>

              {/* Password strength checklist */}
              <div className="mt-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-[11px] space-y-1.5">
                <div className="flex items-center justify-between font-medium mb-1">
                  <span className="text-slate-400">Kekuatan Password:</span>
                  <span className={strength.color}>{strength.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-slate-400">
                  <span className={strength.hasMinLength ? 'text-emerald-400' : ''}>
                    {strength.hasMinLength ? '✓' : '○'} Minimal 8 karakter
                  </span>
                  <span className={strength.hasUpper ? 'text-emerald-400' : ''}>
                    {strength.hasUpper ? '✓' : '○'} Huruf besar (A-Z)
                  </span>
                  <span className={strength.hasLower ? 'text-emerald-400' : ''}>
                    {strength.hasLower ? '✓' : '○'} Huruf kecil (a-z)
                  </span>
                  <span className={strength.hasNumber ? 'text-emerald-400' : ''}>
                    {strength.hasNumber ? '✓' : '○'} Angka (0-9)
                  </span>
                  <span className={strength.hasSpecial ? 'text-emerald-400' : ''}>
                    {strength.hasSpecial ? '✓' : '○'} Karakter khusus (!@#$)
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            <span>{loading ? 'Memproses...' : mode === 'login' ? 'Login' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Switch mode */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <span>
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => onSwitchMode('register')}
                className="font-semibold text-emerald-400 hover:text-emerald-300 ml-1"
              >
                Create Account
              </button>
            </span>
          ) : (
            <span>
              Sudah memiliki akun?{' '}
              <button
                type="button"
                onClick={() => onSwitchMode('login')}
                className="font-semibold text-emerald-400 hover:text-emerald-300 ml-1"
              >
                Login
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
