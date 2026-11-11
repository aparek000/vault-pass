/**
 * Zero-Knowledge Cryptography Service for VaultPass
 * Uses Web Cryptography API (SubtleCrypto)
 * - PBKDF2 with 100,000 iterations & SHA-256 for key derivation
 * - AES-GCM 256-bit for password encryption & decryption
 * - CSPRNG (crypto.getRandomValues) for initialization vectors & salts
 */

import { EncryptedPayload } from '../types';

// Convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Derive AES-GCM 256-bit key from master password using PBKDF2
 */
export async function deriveKeyFromPassword(
  password: string,
  saltBytes: Uint8Array
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt plaintext string into an EncryptedPayload using master password
 */
export async function encryptData(
  plainText: string,
  masterKeyOrPassword: CryptoKey | string,
  userSalt?: string
): Promise<EncryptedPayload> {
  const enc = new TextEncoder();
  const data = enc.encode(plainText);

  // Generate 12-byte IV for AES-GCM
  const ivBytes = crypto.getRandomValues(new Uint8Array(12));

  let key: CryptoKey;
  let saltBytes: Uint8Array;

  if (typeof masterKeyOrPassword === 'string') {
    saltBytes = userSalt
      ? new Uint8Array(base64ToBuffer(userSalt))
      : crypto.getRandomValues(new Uint8Array(16));
    key = await deriveKeyFromPassword(masterKeyOrPassword, saltBytes);
  } else {
    key = masterKeyOrPassword;
    saltBytes = userSalt
      ? new Uint8Array(base64ToBuffer(userSalt))
      : crypto.getRandomValues(new Uint8Array(16));
  }

  const cipherBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: ivBytes,
    },
    key,
    data
  );

  return {
    cipherText: bufferToBase64(cipherBuffer),
    iv: bufferToBase64(ivBytes.buffer as ArrayBuffer),
    salt: bufferToBase64(saltBytes.buffer as ArrayBuffer),
    version: 1,
  };
}

/**
 * Decrypt EncryptedPayload back into plaintext using master password or derived key
 */
export async function decryptData(
  payload: EncryptedPayload | string,
  masterKeyOrPassword: CryptoKey | string
): Promise<string> {
  let parsedPayload: EncryptedPayload;
  if (typeof payload === 'string') {
    parsedPayload = JSON.parse(payload) as EncryptedPayload;
  } else {
    parsedPayload = payload;
  }

  const cipherBytes = base64ToBuffer(parsedPayload.cipherText);
  const ivBytes = new Uint8Array(base64ToBuffer(parsedPayload.iv));
  const saltBytes = new Uint8Array(base64ToBuffer(parsedPayload.salt));

  let key: CryptoKey;
  if (typeof masterKeyOrPassword === 'string') {
    key = await deriveKeyFromPassword(masterKeyOrPassword, saltBytes);
  } else {
    key = masterKeyOrPassword;
  }

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBytes,
    },
    key,
    cipherBytes
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}

/**
 * Strong Password Generator
 */
export interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  avoidAmbiguous: boolean;
}

export const DEFAULT_GENERATOR_OPTIONS: GeneratorOptions = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  avoidAmbiguous: true,
};

const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS_CHARS = 'iIlL1oO0';

export function generateStrongPassword(options: GeneratorOptions = DEFAULT_GENERATOR_OPTIONS): string {
  let pool = '';
  let mustInclude: string[] = [];

  const filterAmbiguous = (str: string) => {
    if (!options.avoidAmbiguous) return str;
    return str.split('').filter((c) => !AMBIGUOUS_CHARS.includes(c)).join('');
  };

  if (options.uppercase) {
    const chars = filterAmbiguous(UPPERCASE_CHARS);
    pool += chars;
    if (chars.length > 0) mustInclude.push(getRandomChar(chars));
  }
  if (options.lowercase) {
    const chars = filterAmbiguous(LOWERCASE_CHARS);
    pool += chars;
    if (chars.length > 0) mustInclude.push(getRandomChar(chars));
  }
  if (options.numbers) {
    const chars = filterAmbiguous(NUMBER_CHARS);
    pool += chars;
    if (chars.length > 0) mustInclude.push(getRandomChar(chars));
  }
  if (options.symbols) {
    pool += SYMBOL_CHARS;
    mustInclude.push(getRandomChar(SYMBOL_CHARS));
  }

  if (pool.length === 0) {
    pool = filterAmbiguous(LOWERCASE_CHARS + NUMBER_CHARS);
  }

  const length = Math.max(8, Math.min(64, options.length));
  const remainingLength = length - mustInclude.length;
  const randomChars: string[] = [];

  const randomValues = new Uint32Array(remainingLength);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < remainingLength; i++) {
    randomChars.push(pool[randomValues[i] % pool.length]);
  }

  // Combine and shuffle using Fisher-Yates with CSPRNG
  const combined = [...mustInclude, ...randomChars];
  for (let i = combined.length - 1; i > 0; i--) {
    const jValues = new Uint32Array(1);
    crypto.getRandomValues(jValues);
    const j = jValues[0] % (i + 1);
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined.join('');
}

function getRandomChar(chars: string): string {
  const randomArray = new Uint32Array(1);
  crypto.getRandomValues(randomArray);
  return chars[randomArray[0] % chars.length];
}

/**
 * Password Strength Evaluator (Score 0-100, entropy estimation)
 */
export interface PasswordStrengthResult {
  score: number; // 0 - 100
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Military Grade';
  color: string;
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isPwnedOrCommon?: boolean;
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasNumber) poolSize += 10;
  if (hasSpecial) poolSize += 33;

  let score = 0;
  if (password.length > 0) {
    // Base length points
    score += Math.min(password.length * 4, 40);

    // Character variety
    if (hasLower) score += 10;
    if (hasUpper) score += 15;
    if (hasNumber) score += 15;
    if (hasSpecial) score += 20;

    // Bonus for length > 12 and > 16
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
  }

  score = Math.min(100, Math.max(0, score));

  let label: PasswordStrengthResult['label'] = 'Very Weak';
  let color = 'text-rose-500';

  if (score >= 90 && password.length >= 14) {
    label = 'Military Grade';
    color = 'text-emerald-400';
  } else if (score >= 70 && hasMinLength) {
    label = 'Strong';
    color = 'text-emerald-500';
  } else if (score >= 50 && hasMinLength) {
    label = 'Fair';
    color = 'text-amber-500';
  } else if (score >= 30) {
    label = 'Weak';
    color = 'text-orange-500';
  }

  return {
    score,
    label,
    color,
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
  };
}

/**
 * Copy with automatic clipboard clearing after 30 seconds
 */
let clipboardTimeout: number | null = null;

export async function copySecurePassword(
  text: string,
  autoClearSeconds: number = 30,
  onCleared?: () => void
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);

    if (clipboardTimeout) {
      window.clearTimeout(clipboardTimeout);
    }

    if (autoClearSeconds > 0) {
      clipboardTimeout = window.setTimeout(async () => {
        try {
          const currentText = await navigator.clipboard.readText();
          if (currentText === text) {
            await navigator.clipboard.writeText('');
            if (onCleared) onCleared();
          }
        } catch {
          // If read permissions denied, overwrite directly
          try {
            await navigator.clipboard.writeText('');
            if (onCleared) onCleared();
          } catch {
            // ignore
          }
        }
      }, autoClearSeconds * 1000);
    }

    return true;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}
