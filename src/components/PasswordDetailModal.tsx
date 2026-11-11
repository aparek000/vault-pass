import React, { useState } from 'react';
import {
  X,
  Eye,
  EyeOff,
  Copy,
  Check,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  ShieldCheck,
  Globe,
  KeyRound,
  FileText,
} from 'lucide-react';
import { PasswordEntry } from '../types';
import { revealEntryPassword } from '../services/vaultStorage';
import { copySecurePassword } from '../services/crypto';

interface PasswordDetailModalProps {
  isOpen: boolean;
  entry: PasswordEntry | null;
  onClose: () => void;
  onEdit: (entry: PasswordEntry) => void;
  onDelete: (entry: PasswordEntry) => void;
  onRequireBiometric: (action: 'reveal' | 'copy', callback: () => void) => void;
  onCopySuccess: (service: string) => void;
  masterKey: string;
}

export const PasswordDetailModal: React.FC<PasswordDetailModalProps> = ({
  isOpen,
  entry,
  onClose,
  onEdit,
  onDelete,
  onRequireBiometric,
  onCopySuccess,
  masterKey,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [plainPassword, setPlainPassword] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !entry) return null;

  const handleShowPassword = () => {
    if (isRevealed) {
      setIsRevealed(false);
      setPlainPassword('');
    } else {
      onRequireBiometric('reveal', async () => {
        try {
          const decrypted = await revealEntryPassword(entry, masterKey);
          setPlainPassword(decrypted);
          setIsRevealed(true);

          // Auto-hide after 20s
          setTimeout(() => {
            setIsRevealed(false);
            setPlainPassword('');
          }, 20000);
        } catch {
          setIsRevealed(true);
        }
      });
    }
  };

  const handleCopyPassword = () => {
    onRequireBiometric('copy', async () => {
      try {
        const decrypted = await revealEntryPassword(entry, masterKey);
        const ok = await copySecurePassword(decrypted, 30);
        if (ok) {
          setIsCopied(true);
          onCopySuccess(entry.service_name);
          setTimeout(() => setIsCopied(false), 3000);
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-sm">
              {entry.service_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">{entry.service_name}</h3>
              <p className="text-xs text-slate-400 font-normal">Kategori: {entry.category}</p>
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

        {/* Content list */}
        <div className="space-y-4 py-4 text-xs">
          {/* Username */}
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">
              Username / Email
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm text-slate-200 select-all truncate">
                {entry.username}
              </span>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(entry.username);
                  onCopySuccess('Username');
                }}
                className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-white bg-slate-850 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Salin
              </button>
            </div>
          </div>

          {/* Password with Biometric Reveal */}
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">Password</span>
              <span className="text-[10px] text-emerald-400 font-mono">AES-256-GCM Ciphertext</span>
            </div>

            <div className="flex items-center justify-between gap-2 mt-1">
              {isRevealed && plainPassword ? (
                <span className="font-mono text-sm font-semibold text-emerald-400 tracking-normal select-all truncate">
                  {plainPassword}
                </span>
              ) : (
                <span className="font-mono text-base tracking-[0.25em] text-slate-500 select-none">
                  ••••••••••••••••
                </span>
              )}

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleShowPassword}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-750 rounded-lg transition-colors"
                >
                  {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{isRevealed ? 'Hide' : 'Show'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    isCopied
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Notes if any */}
          {entry.notes && (
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">
                Catatan
              </span>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{entry.notes}</p>
            </div>
          )}

          {/* Metadata Timestamps */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
            <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-850">
              <span className="text-slate-500 block mb-0.5">Created</span>
              <span className="font-mono text-slate-300">{formatDate(entry.created_at)}</span>
            </div>
            <div className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-850">
              <span className="text-slate-500 block mb-0.5">Last Updated</span>
              <span className="font-mono text-slate-300">{formatDate(entry.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(entry);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Entry</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(entry);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Password</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
