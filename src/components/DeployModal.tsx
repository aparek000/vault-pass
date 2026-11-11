import React, { useState } from 'react';
import {
  X,
  Globe,
  Check,
  Copy,
  ExternalLink,
  Terminal,
  CloudUpload,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployModal: React.FC<DeployModalProps> = ({ isOpen, onClose }) => {
  const [copiedStep, setCopiedStep] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'github' | 'netlify' | 'env'>('github');

  if (!isOpen) return null;

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(id);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const gitCommands = `# 1. Inisialisasi Git repository
git init
git add .
git commit -m "feat: publish VaultPass password manager"

# 2. Sambungkan ke GitHub repo kamu
git branch -M main
git remote add origin https://github.com/USERNAME_KAMU/vaultpass.git
git push -u origin main`;

  const netlifyCliCommands = `# Build untuk production
npm run build

# Deploy langsung ke Netlify Production
npx netlify deploy --prod --dir=dist`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CloudUpload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Publish ke GitHub & Netlify</h3>
              <p className="text-xs text-slate-400">Panduan langkah demi langkah untuk online dengan HTTPS</p>
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
        <div className="flex gap-2 my-3 p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`flex-1 py-1.5 font-medium rounded-lg transition-colors ${
              activeTab === 'github'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Push ke GitHub
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('netlify')}
            className={`flex-1 py-1.5 font-medium rounded-lg transition-colors ${
              activeTab === 'netlify'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Deploy ke Netlify
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('env')}
            className={`flex-1 py-1.5 font-medium rounded-lg transition-colors ${
              activeTab === 'env'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Env Variables
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto space-y-4 py-2 text-xs leading-relaxed pr-1">
          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl">
                <h4 className="font-semibold text-slate-200 mb-1">Langkah 1: Buat Repository di GitHub</h4>
                <p className="text-slate-400">
                  Buka{' '}
                  <a
                    href="https://github.com/new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                  >
                    github.com/new <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  dan buat repository baru (contoh: <code>vaultpass</code>).
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 font-medium">Jalankan di Terminal Kamu:</span>
                  <button
                    type="button"
                    onClick={() => copyCode(gitCommands, 'git')}
                    className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg transition-colors flex items-center gap-1"
                  >
                    {copiedStep === 'git' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedStep === 'git' ? 'Tersalin' : 'Salin Perintah'}</span>
                  </button>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  <pre>{gitCommands}</pre>
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  File <code>.gitignore</code> dan <code>netlify.toml</code> sudah terkonfigurasi otomatis
                  sehingga aman untuk di-push ke GitHub tanpa mengekspos kredensial rahasia.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'netlify' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                <h4 className="font-semibold text-slate-200">Cara Utama: Hubungkan Repository GitHub</h4>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-400">
                  <li>
                    Buka{' '}
                    <a
                      href="https://app.netlify.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                    >
                      app.netlify.com <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    lalu klik <strong>Add new site &gt; Import an existing project</strong>.
                  </li>
                  <li>Pilih <strong>GitHub</strong> dan cari repository <code>vaultpass</code> kamu.</li>
                  <li>
                    Netlify otomatis membaca file <code>netlify.toml</code> kami:
                    <ul className="list-disc pl-4 mt-1 font-mono text-[11px] text-slate-300">
                      <li>Build command: <code>npm run build</code></li>
                      <li>Publish directory: <code>dist</code></li>
                    </ul>
                  </li>
                  <li>Klik <strong>Deploy VaultPass</strong>. Website kamu akan live dengan HTTPS dalam ~45 detik!</li>
                </ol>
              </div>

              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                <h4 className="font-semibold text-slate-200">Alternatif: Netlify Drag & Drop</h4>
                <p className="text-slate-400">
                  Jalankan <code>npm run build</code> di komputer kamu, lalu tarik folder <code>dist/</code> ke{' '}
                  <a
                    href="https://app.netlify.com/drop"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                  >
                    app.netlify.com/drop <ExternalLink className="w-3 h-3" />
                  </a>
                  .
                </p>
              </div>
            </div>
          )}

          {activeTab === 'env' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl">
                <h4 className="font-semibold text-slate-200 mb-1">Konfigurasi Environment Variables di Netlify</h4>
                <p className="text-slate-400">
                  Pada dashboard Netlify: buka <strong>Site configuration &gt; Environment variables</strong>, lalu
                  tambahkan:
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 font-mono text-[11px] text-slate-300 space-y-2">
                <div>
                  <span className="text-emerald-400 font-semibold block">VITE_SUPABASE_URL</span>
                  <span className="text-slate-500">https://your-project.supabase.co</span>
                </div>
                <div className="pt-2 border-t border-slate-850">
                  <span className="text-emerald-400 font-semibold block">VITE_SUPABASE_ANON_KEY</span>
                  <span className="text-slate-500">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</span>
                </div>
              </div>

              <p className="text-slate-400 text-[11px]">
                Setelah menambahkan variabel, lakukan <strong>Trigger deploy</strong> di Netlify agar perubahan diterapkan.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0">
          <span className="text-[11px] text-slate-500 font-mono">
            Vite · React 19 · Netlify Ready
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors shadow-sm"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
