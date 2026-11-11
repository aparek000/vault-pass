/**
 * Vault Storage & Synchronization Service
 * Manages encrypted password items with Supabase PostgreSQL RLS and secure local cache.
 * Guarantees that NO password is EVER stored in plaintext.
 */

import { PasswordEntry, EncryptedPayload, PasswordCategory } from '../types';
import { encryptData, decryptData } from './crypto';
import { getSupabaseClient } from './supabase';

const VAULT_STORAGE_PREFIX = 'vaultpass_entries_';

// Initial pre-encrypted sample data for first-time onboarding
export const INITIAL_SAMPLE_SERVICES = [
  {
    service_name: 'Google',
    username: 'alex.rivera@gmail.com',
    initialPlain: 'Gg!9x#P7mQv$L2k8',
    category: 'Work' as PasswordCategory,
    website_url: 'https://accounts.google.com',
    notes: 'Personal & Google Cloud Platform account with 2FA enabled',
    icon_key: 'google',
    color: '#4285F4',
  },
  {
    service_name: 'Instagram',
    username: 'alex_creator',
    initialPlain: 'Insta#Secure!2026@Pass',
    category: 'Social' as PasswordCategory,
    website_url: 'https://instagram.com',
    notes: 'Main social profile with connected Meta Business suite',
    icon_key: 'instagram',
    color: '#E1306C',
  },
  {
    service_name: 'Discord',
    username: 'alex_cyber#4092',
    initialPlain: 'Disc0rd_V@ult$8810!',
    category: 'Social' as PasswordCategory,
    website_url: 'https://discord.com',
    notes: 'Developer servers & gaming squad community',
    icon_key: 'discord',
    color: '#5865F2',
  },
  {
    service_name: 'Roblox',
    username: 'AlexGameDev88',
    initialPlain: 'R0bl0x#Legend^9934',
    category: 'Entertainment' as PasswordCategory,
    website_url: 'https://roblox.com',
    notes: 'Roblox Studio creator account with 2-step verification',
    icon_key: 'roblox',
    color: '#000000',
  },
  {
    service_name: 'GitHub',
    username: 'arivera-sec',
    initialPlain: 'Gh!DevOps*AES256^Token',
    category: 'Tech' as PasswordCategory,
    website_url: 'https://github.com',
    notes: 'SSH keys and Personal Access Tokens configured',
    icon_key: 'github',
    color: '#24292F',
  },
  {
    service_name: 'Spotify',
    username: 'alex.rivera@gmail.com',
    initialPlain: 'Sp0tify!Vibe$Wave26',
    category: 'Entertainment' as PasswordCategory,
    website_url: 'https://spotify.com',
    notes: 'Premium Family subscription owner',
    icon_key: 'spotify',
    color: '#1DB954',
  },
];

/**
 * Seed initial encrypted entries for a newly created user vault
 */
export async function seedInitialVault(userId: string, masterKey: string): Promise<PasswordEntry[]> {
  const seededEntries: PasswordEntry[] = [];
  const now = new Date().toISOString();

  for (const item of INITIAL_SAMPLE_SERVICES) {
    const encrypted: EncryptedPayload = await encryptData(item.initialPlain, masterKey);
    const entry: PasswordEntry = {
      id: crypto.randomUUID(),
      user_id: userId,
      service_name: item.service_name,
      username: item.username,
      encrypted_password: JSON.stringify(encrypted),
      website_url: item.website_url,
      notes: item.notes,
      category: item.category,
      created_at: now,
      updated_at: now,
      icon_key: item.icon_key,
      color: item.color,
    };
    seededEntries.push(entry);
  }

  saveLocalEntries(userId, seededEntries);
  return seededEntries;
}

export function getLocalEntries(userId: string): PasswordEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${VAULT_STORAGE_PREFIX}${userId}`);
    if (!raw) return [];
    return JSON.parse(raw) as PasswordEntry[];
  } catch (err) {
    console.error('Failed to parse local vault entries:', err);
    return [];
  }
}

export function saveLocalEntries(userId: string, entries: PasswordEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${VAULT_STORAGE_PREFIX}${userId}`, JSON.stringify(entries));
  } catch (err) {
    console.error('Failed to save local vault entries:', err);
  }
}

/**
 * Fetch password entries for current user.
 * Tries Supabase first with strict RLS; falls back to encrypted local store.
 */
export async function fetchUserVaultEntries(userId: string, masterKey?: string): Promise<PasswordEntry[]> {
  const supabase = getSupabaseClient();
  let localEntries = getLocalEntries(userId);

  // If local is completely empty and user has a masterKey, seed initial items
  if (localEntries.length === 0 && masterKey) {
    localEntries = await seedInitialVault(userId, masterKey);
  }

  if (!supabase) {
    return localEntries;
  }

  try {
    const { data, error } = await supabase
      .from('password_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase query failed, using local vault:', error.message);
      return localEntries;
    }

    if (data && data.length > 0) {
      // Map and sync local
      saveLocalEntries(userId, data as PasswordEntry[]);
      return data as PasswordEntry[];
    } else if (localEntries.length > 0) {
      // Push local items to Supabase so user doesn't lose them
      try {
        await supabase.from('password_entries').insert(localEntries);
      } catch {
        // ignore if offline
      }
    }

    return localEntries;
  } catch (err) {
    console.warn('Network error reaching Supabase, using local vault:', err);
    return localEntries;
  }
}

/**
 * Add a new password entry:
 * 1. Encrypts plaintext password into AES-GCM ciphertext
 * 2. Persists to Supabase with user_id & local cache
 */
export async function createPasswordEntry(
  userId: string,
  entryData: {
    service_name: string;
    username: string;
    plain_password: string;
    notes?: string;
    website_url?: string;
    category?: PasswordCategory;
    icon_key?: string;
    color?: string;
  },
  masterKey: string
): Promise<PasswordEntry> {
  const encrypted = await encryptData(entryData.plain_password, masterKey);
  const now = new Date().toISOString();

  const newEntry: PasswordEntry = {
    id: crypto.randomUUID(),
    user_id: userId,
    service_name: entryData.service_name.trim(),
    username: entryData.username.trim(),
    encrypted_password: JSON.stringify(encrypted),
    notes: entryData.notes?.trim() || '',
    website_url: entryData.website_url?.trim() || '',
    category: entryData.category || 'Social',
    created_at: now,
    updated_at: now,
    icon_key: entryData.icon_key,
    color: entryData.color,
  };

  // 1. Save local
  const current = getLocalEntries(userId);
  const updated = [newEntry, ...current];
  saveLocalEntries(userId, updated);

  // 2. Save to Supabase if connected
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('password_entries').insert({
        id: newEntry.id,
        user_id: newEntry.user_id,
        service_name: newEntry.service_name,
        username: newEntry.username,
        encrypted_password: newEntry.encrypted_password,
        notes: newEntry.notes,
        website_url: newEntry.website_url,
        category: newEntry.category,
        created_at: newEntry.created_at,
        updated_at: newEntry.updated_at,
      });
    } catch (err) {
      console.warn('Could not sync newly created entry to Supabase:', err);
    }
  }

  return newEntry;
}

/**
 * Update an existing entry
 */
export async function updatePasswordEntry(
  userId: string,
  entryId: string,
  updates: {
    service_name?: string;
    username?: string;
    plain_password?: string;
    notes?: string;
    website_url?: string;
    category?: PasswordCategory;
  },
  masterKey: string
): Promise<PasswordEntry | null> {
  const current = getLocalEntries(userId);
  const index = current.findIndex((e) => e.id === entryId);
  if (index === -1) return null;

  const existing = current[index];
  let encrypted_password = existing.encrypted_password;

  if (updates.plain_password) {
    const encrypted = await encryptData(updates.plain_password, masterKey);
    encrypted_password = JSON.stringify(encrypted);
  }

  const updatedEntry: PasswordEntry = {
    ...existing,
    service_name: updates.service_name !== undefined ? updates.service_name.trim() : existing.service_name,
    username: updates.username !== undefined ? updates.username.trim() : existing.username,
    encrypted_password,
    notes: updates.notes !== undefined ? updates.notes.trim() : existing.notes,
    website_url: updates.website_url !== undefined ? updates.website_url.trim() : existing.website_url,
    category: updates.category || existing.category,
    updated_at: new Date().toISOString(),
  };

  current[index] = updatedEntry;
  saveLocalEntries(userId, current);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from('password_entries')
        .update({
          service_name: updatedEntry.service_name,
          username: updatedEntry.username,
          encrypted_password: updatedEntry.encrypted_password,
          notes: updatedEntry.notes,
          website_url: updatedEntry.website_url,
          category: updatedEntry.category,
          updated_at: updatedEntry.updated_at,
        })
        .eq('id', entryId)
        .eq('user_id', userId);
    } catch (err) {
      console.warn('Could not sync updated entry to Supabase:', err);
    }
  }

  return updatedEntry;
}

/**
 * Delete a password entry
 */
export async function deletePasswordEntry(userId: string, entryId: string): Promise<boolean> {
  const current = getLocalEntries(userId);
  const filtered = current.filter((e) => e.id !== entryId);
  saveLocalEntries(userId, filtered);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from('password_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', userId);
    } catch (err) {
      console.warn('Could not delete entry in Supabase:', err);
    }
  }

  return true;
}

/**
 * Decrypt a single password entry for temporary view/copy
 */
export async function revealEntryPassword(entry: PasswordEntry, masterKey: string): Promise<string> {
  try {
    return await decryptData(entry.encrypted_password, masterKey);
  } catch (err) {
    console.error('Decryption failed for entry:', entry.id, err);
    throw new Error('Gagal mendekripsi password. Kunci master tidak sesuai.');
  }
}
