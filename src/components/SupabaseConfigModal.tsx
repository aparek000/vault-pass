import React, { useState } from 'react';
import { X, Database, Check, Copy, ExternalLink, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { getStoredSupabaseConfig, saveStoredSupabaseConfig, testSupabaseConnection } from '../services/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'schema'>('config');

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(url, anonKey);
    setTesting(false);
    setTestResult(res);
  };

  const handleSave = () => {
    saveStoredSupabaseConfig(url, anonKey);
    onConfigSaved();
    onClose();
  };

  const sqlSchemaScript = `-- Supabase PostgreSQL Schema & RLS Policies for VaultPass
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    email TEXT UNIQUE NOT NULL,
    biometric_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.password_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    username TEXT NOT NULL,
    encrypted_password TEXT NOT NULL, -- AES-GCM Ciphertext JSON
    website_url TEXT,
    notes TEXT,
    category TEXT DEFAULT 'Social',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_entries ENABLE ROW LEVEL SECURITY;

-- Strict Isolation: User A CANNOT read User B data
CREATE POLICY "Users can view own entries" ON public.password_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own entries" ON public.password_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own entries" ON public.password_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own entries" ON public.password_entries FOR DELETE USING (auth.uid() = user_id);
`;

  const copySql = async () => {
    await navigator.clipboard.writeText(sqlSchemaScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Supabase Database & RLS</h3>
              <p className="text-xs text-slate-400">PostgreSQL cloud backend dengan Row Level Security</p>
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

        {/* Tab switch */}
        <div className="flex gap-2 my-3 p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'config'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Koneksi API
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'schema'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SQL Schema & RLS Policies
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto space-y-4 py-1 text-xs">
          {activeTab === 'config' ? (
            <div className="space-y-4">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
                <p className="text-slate-300 leading-relaxed">
                  VaultPass dirancang dengan arsitektur <strong>Zero-Knowledge</strong>. Semua password selalu
                  dienkripsi di browser kamu menggunakan AES-GCM 256 sebelum dikirim ke database Supabase.
                  Supabase maupun admin server tidak pernah melihat password dalam bentuk plaintext.
                </p>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  SUPABASE_URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyzproject.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">
                  SUPABASE_ANON_KEY
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Kunci aman untuk akses publik client-side dengan proteksi RLS PostgreSQL.
                </span>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                    testResult.ok
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}
                >
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">{testResult.ok ? 'Koneksi Berhasil' : 'Perhatian'}</span>
                    <span className="leading-relaxed">{testResult.message}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Menguji...' : 'Uji Koneksi'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">PostgreSQL DDL + RLS Rules</span>
                <button
                  type="button"
                  onClick={copySql}
                  className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-xl font-medium transition-colors flex items-center gap-1.5"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Tersalin' : 'Salin SQL Schema'}</span>
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[300px]">
                <pre>{sqlSchemaScript}</pre>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Salin kode SQL di atas dan jalankan pada <strong>Supabase Dashboard &gt; SQL Editor</strong>.
                Aturan Row Level Security menjamin User A tidak dapat mengakses password milik User B.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors shadow-sm"
          >
            Simpan Konfigurasi
          </button>
        </div>
      </div>
    </div>
  );
};
