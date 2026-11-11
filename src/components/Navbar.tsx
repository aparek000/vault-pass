import React from 'react';
import {
  Shield,
  KeyRound,
  Settings,
  HelpCircle,
  Plus,
  Lock,
  Moon,
  Sun,
  Smartphone,
  Laptop,
  CloudUpload,
} from 'lucide-react';
import { ScreenState } from '../types';

interface NavbarProps {
  currentScreen: ScreenState;
  onNavigate: (screen: ScreenState) => void;
  onOpenAdd: () => void;
  onOpenDeploy: () => void;
  onLockVault: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isMobileDeviceView: boolean;
  onToggleDeviceView: () => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  onOpenAdd,
  onOpenDeploy,
  onLockVault,
  isDarkMode,
  onToggleDarkMode,
  isMobileDeviceView,
  onToggleDeviceView,
  savedCount,
}) => {
  return (
    <>
      {/* Desktop / Global Top Bar (Complies with 3-zone contract) */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark */}
          <div
            onClick={() => onNavigate('vault')}
            className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                VaultPass
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                · AES-256
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-400">
            <button
              type="button"
              onClick={() => onNavigate('vault')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentScreen === 'vault' ? 'text-emerald-500 font-semibold' : ''
              }`}
            >
              My Vault ({savedCount})
            </button>
            <button
              type="button"
              onClick={() => onNavigate('diagnostic')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentScreen === 'diagnostic' ? 'text-emerald-500 font-semibold' : ''
              }`}
            >
              Diagnostic
            </button>
            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentScreen === 'settings' ? 'text-emerald-500 font-semibold' : ''
              }`}
            >
              Settings
            </button>
            <button
              type="button"
              onClick={() => onNavigate('help')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                currentScreen === 'help' ? 'text-emerald-500 font-semibold' : ''
              }`}
            >
              Bantuan
            </button>
          </nav>

          {/* Zone 3: Primary Action & Quick Tools */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Device Viewport toggle (Mobile Frame vs Desktop) */}
            <button
              type="button"
              onClick={onToggleDeviceView}
              title={isMobileDeviceView ? 'Tampilan Desktop Lebar' : 'Tampilan Bingkai iPhone (Mobile)'}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              {isMobileDeviceView ? <Laptop className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            </button>

            {/* Dark/Light mode toggle */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Publish ke GitHub & Netlify */}
            <button
              type="button"
              onClick={onOpenDeploy}
              title="Publish ke GitHub & Netlify"
              className="px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <CloudUpload className="w-4 h-4 text-emerald-500" />
              <span className="hidden lg:inline">Publish</span>
            </button>

            {/* Quick Lock Button */}
            <button
              type="button"
              onClick={onLockVault}
              title="Kunci Vault Sekarang"
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-amber-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* Add Password CTA */}
            <button
              type="button"
              onClick={onOpenAdd}
              className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Password</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Ergonomic Bottom Tab Bar (fixed bottom-0) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-2 pb-safe">
        <div className="grid grid-cols-4 items-center h-12 max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => onNavigate('vault')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              currentScreen === 'vault'
                ? 'text-emerald-500 font-semibold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <KeyRound className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Vault</span>
          </button>

          <button
            type="button"
            onClick={onOpenAdd}
            className="flex flex-col items-center justify-center py-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-sm">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-[10px] mt-0.5 text-emerald-500 font-medium">Add</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              currentScreen === 'settings'
                ? 'text-emerald-500 font-semibold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Settings</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('help')}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              currentScreen === 'help'
                ? 'text-emerald-500 font-semibold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <HelpCircle className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Bantuan</span>
          </button>
        </div>
      </div>
    </>
  );
};
