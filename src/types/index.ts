export type ScreenState =
  | 'splash'
  | 'welcome'
  | 'diagnostic'
  | 'login'
  | 'register'
  | 'biometric_setup'
  | 'vault'
  | 'settings'
  | 'help';

export type BiometryType = 'faceID' | 'touchID' | 'passkey' | 'none';

export type AutoLockTimeout = 'immediate' | '1m' | '5m' | '15m' | 'never';

export type PasswordCategory = 'All' | 'Social' | 'Work' | 'Finance' | 'Entertainment' | 'Tech';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  biometric_enabled: boolean;
  biometry_type: BiometryType;
  auto_lock_timeout: AutoLockTimeout;
  created_at: string;
  updated_at: string;
}

export interface EncryptedPayload {
  cipherText: string;
  iv: string;
  salt: string;
  version: number;
}

export interface PasswordEntry {
  id: string;
  user_id: string;
  service_name: string;
  username: string;
  encrypted_password: string; // JSON serialized EncryptedPayload
  website_url?: string;
  notes?: string;
  category: PasswordCategory;
  created_at: string;
  updated_at: string;
  icon_key?: string;
  color?: string;
}

export interface DecryptedPasswordEntry extends Omit<PasswordEntry, 'encrypted_password'> {
  plain_password?: string;
  isRevealed?: boolean;
}

export interface SecurityCheckItem {
  id: string;
  title: string;
  description: string;
  status: 'passed' | 'warning' | 'failed' | 'checking';
  details?: string;
  fixAction?: () => void;
  fixLabel?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastChecked?: string;
}
