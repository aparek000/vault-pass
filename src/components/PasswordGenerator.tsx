import React, { useState, useEffect } from 'react';
import { RefreshCw, Check, Copy, ShieldCheck, Sliders } from 'lucide-react';
import {
  generateStrongPassword,
  evaluatePasswordStrength,
  GeneratorOptions,
  DEFAULT_GENERATOR_OPTIONS,
} from '../services/crypto';

interface PasswordGeneratorProps {
  onSelectPassword: (password: string) => void;
  initialPassword?: string;
}

export const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({
  onSelectPassword,
}) => {
  const [options, setOptions] = useState<GeneratorOptions>(DEFAULT_GENERATOR_OPTIONS);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const newPwd = generateStrongPassword(options);
    setPassword(newPwd);
  };

  useEffect(() => {
    handleGenerate();
  }, [options]);

  const strength = evaluatePasswordStrength(password);

  const handleCopy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 text-slate-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Password Generator
          </h4>
        </div>
        <span className={`text-xs font-semibold ${strength.color}`}>
          {strength.label} ({strength.score}/100)
        </span>
      </div>

      {/* Generated output box */}
      <div className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-xl mb-3.5">
        <span className="font-mono text-sm tracking-wide text-emerald-400 select-all truncate flex-1">
          {password}
        </span>
        <button
          type="button"
          onClick={handleGenerate}
          title="Acak Ulang"
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleCopy}
          title="Salin Password"
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Strength visual meter */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full transition-all duration-300 ${
            strength.score >= 80
              ? 'bg-emerald-500'
              : strength.score >= 60
              ? 'bg-emerald-400'
              : strength.score >= 40
              ? 'bg-amber-500'
              : 'bg-rose-500'
          }`}
          style={{ width: `${strength.score}%` }}
        />
      </div>

      {/* Length Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Panjang Karakter</span>
          <span className="font-mono font-semibold text-emerald-400">{options.length}</span>
        </div>
        <input
          type="range"
          min={8}
          max={32}
          value={options.length}
          onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value, 10) })}
          className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
        />

        {/* Option toggles */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-800/60">
            <input
              type="checkbox"
              checked={options.uppercase}
              onChange={(e) => setOptions({ ...options, uppercase: e.target.checked })}
              className="accent-emerald-400 rounded"
            />
            <span>Huruf Besar (A-Z)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-800/60">
            <input
              type="checkbox"
              checked={options.lowercase}
              onChange={(e) => setOptions({ ...options, lowercase: e.target.checked })}
              className="accent-emerald-400 rounded"
            />
            <span>Huruf Kecil (a-z)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-800/60">
            <input
              type="checkbox"
              checked={options.numbers}
              onChange={(e) => setOptions({ ...options, numbers: e.target.checked })}
              className="accent-emerald-400 rounded"
            />
            <span>Angka (0-9)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-800/60">
            <input
              type="checkbox"
              checked={options.symbols}
              onChange={(e) => setOptions({ ...options, symbols: e.target.checked })}
              className="accent-emerald-400 rounded"
            />
            <span>Simbol (!@#$)</span>
          </label>
        </div>
      </div>

      {/* Apply button */}
      <button
        type="button"
        onClick={() => onSelectPassword(password)}
        className="w-full mt-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl transition-colors shadow-sm"
      >
        Gunakan Password Ini
      </button>
    </div>
  );
};
