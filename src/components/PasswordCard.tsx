import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  Edit3,
  Trash2,
  ExternalLink,
  Shield,
  KeyRound,
  Globe,
} from 'lucide-react';
import { PasswordEntry } from '../types';

interface PasswordCardProps {
  entry: PasswordEntry;
  onRequireBiometric: (action: 'reveal' | 'copy', callback: () => void) => void;
  onCopySuccess: (service: string) => void;
  onSelectDetail: (entry: PasswordEntry) => void;
  onEdit: (entry: PasswordEntry) => void;
  onDelete: (entry: PasswordEntry) => void;
  masterKey: string;
}

export const PasswordCard: React.FC<PasswordCardProps> = ({
  entry,
  onRequireBiometric,
  onCopySuccess,
  onSelectDetail,
  onEdit,
  onDelete,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [decryptedText, setDecryptedText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const getServiceIcon = (name: string, key?: string) => {
    const lower = (key || name).toLowerCase();
    if (lower.includes('google')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        </div>
      );
    }
    if (lower.includes('instagram')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </div>
      );
    }
    if (lower.includes('discord')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-[#5865F2] flex items-center justify-center text-white shadow-sm">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
        </div>
      );
    }
    if (lower.includes('roblox')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white shadow-sm">
          <div className="w-4 h-4 border-2 border-white rotate-12 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white" />
          </div>
        </div>
      );
    }
    if (lower.includes('github')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-[#24292F] flex items-center justify-center text-white shadow-sm">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </div>
      );
    }
    if (lower.includes('spotify')) {
      return (
        <div className="w-10 h-10 rounded-xl bg-[#1DB954] flex items-center justify-center text-slate-950 shadow-sm">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
        <Globe className="w-5 h-5" />
      </div>
    );
  };

  const handleToggleReveal = () => {
    if (isRevealed) {
      setIsRevealed(false);
      setDecryptedText('');
    } else {
      onRequireBiometric('reveal', async () => {
        try {
          const { revealEntryPassword } = await import('../services/vaultStorage');
          const plain = await revealEntryPassword(entry, '');
          setDecryptedText(plain);
          setIsRevealed(true);

          // Auto-hide after 20 seconds for defense-in-depth
          setTimeout(() => {
            setIsRevealed(false);
            setDecryptedText('');
          }, 20000);
        } catch {
          // If master key needed, reveal fallback
          setIsRevealed(true);
        }
      });
    }
  };

  const handleCopy = () => {
    onRequireBiometric('copy', async () => {
      try {
        const { revealEntryPassword } = await import('../services/vaultStorage');
        const { copySecurePassword } = await import('../services/crypto');
        const plain = await revealEntryPassword(entry, '');
        const success = await copySecurePassword(plain, 30, () => {
          setIsCopied(false);
        });

        if (success) {
          setIsCopied(true);
          onCopySuccess(entry.service_name);
          setTimeout(() => setIsCopied(false), 3000);
        }
      } catch (err) {
        console.error('Copy failed:', err);
      }
    });
  };

  return (
    <div className="group relative rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 p-4 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        {/* Left: App icon and identity */}
        <div
          onClick={() => onSelectDetail(entry)}
          className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
        >
          {getServiceIcon(entry.service_name, entry.icon_key)}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {entry.service_name}
              </h3>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                · {entry.category}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
              {entry.username}
            </p>
          </div>
        </div>

        {/* Right action dots / menu buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(entry)}
            title="Edit Password"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(entry)}
            title="Hapus Entry"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Password Mask & Quick Action Strip */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between gap-2">
        {/* Hidden / Revealed password dots */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <KeyRound className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {isRevealed && decryptedText ? (
            <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 tracking-normal truncate select-all">
              {decryptedText}
            </span>
          ) : (
            <span className="text-base tracking-[0.25em] font-mono text-slate-400 dark:text-slate-500 select-none">
              ••••••••••••
            </span>
          )}
        </div>

        {/* Action Buttons: View & Copy */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleToggleReveal}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-lg transition-colors"
          >
            {isRevealed ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hide</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              isCopied
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-slate-900 dark:bg-emerald-500/20 text-white dark:text-emerald-400 hover:bg-slate-800 dark:hover:bg-emerald-500/30 border border-transparent dark:border-emerald-500/30'
            }`}
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
