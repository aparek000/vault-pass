/**
 * Supabase Client Configuration & Prober
 * Supports environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
 * and in-app secure configuration for custom project connectivity.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '../types';

const STORAGE_KEY_URL = 'vaultpass_supabase_url';
const STORAGE_KEY_ANON = 'vaultpass_supabase_anon_key';

export function getStoredSupabaseConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envAnon = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) || '' : '';
  const localAnon = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON) || '' : '';

  const activeUrl = localUrl || envUrl;
  const activeAnon = localAnon || envAnon;

  const isConfigured = Boolean(
    activeUrl &&
    activeAnon &&
    activeUrl.startsWith('https://') &&
    activeUrl.includes('.supabase.co')
  );

  return {
    url: activeUrl,
    anonKey: activeAnon,
    isConnected: isConfigured,
  };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem(STORAGE_KEY_URL, url.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_URL);
    }

    if (anonKey.trim()) {
      localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_ANON);
    }
  }
}

let cachedClient: SupabaseClient | null = null;
let lastClientKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  const clientKey = `${config.url}_${config.anonKey}`;
  if (cachedClient && lastClientKey === clientKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastClientKey = clientKey;
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Probe connection to Supabase instance for security diagnostics
 */
export async function testSupabaseConnection(
  url?: string,
  anonKey?: string
): Promise<{ ok: boolean; message: string; latencyMs?: number }> {
  const activeUrl = url || getStoredSupabaseConfig().url;
  const activeKey = anonKey || getStoredSupabaseConfig().anonKey;

  if (!activeUrl || !activeKey) {
    return {
      ok: false,
      message: 'Supabase URL & Anon Key belum dikonfigurasi (Mode Terisolasi Aktif)',
    };
  }

  const startTime = performance.now();
  try {
    const testClient = createClient(activeUrl, activeKey, {
      auth: { persistSession: false },
    });

    // Simple health check query
    const { error } = await testClient.from('profiles').select('id').limit(1);
    const latencyMs = Math.round(performance.now() - startTime);

    if (error && error.code !== 'PGRST116' && !error.message.includes('permission denied')) {
      // If table doesn't exist yet, but server responded
      if (error.code === '42P01') {
        return {
          ok: true,
          message: `Koneksi database berhasil (${latencyMs}ms), tabel profiles belum dibuat. Jalankan SQL schema.`,
          latencyMs,
        };
      }
      return {
        ok: false,
        message: `Error koneksi: ${error.message}`,
        latencyMs,
      };
    }

    return {
      ok: true,
      message: `Terhubung dengan database Supabase PostgreSQL (${latencyMs}ms)`,
      latencyMs,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown connection error';
    return {
      ok: false,
      message: `Gagal terhubung ke host Supabase: ${errorMsg}`,
    };
  }
}
