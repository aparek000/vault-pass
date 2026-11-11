-- ==============================================================================
-- VaultPass: Production PostgreSQL Schema & Row Level Security (RLS)
-- Execute this script in your Supabase SQL Editor (https://app.supabase.com)
-- ==============================================================================

-- 1. Enable UUID generator
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    email TEXT UNIQUE NOT NULL,
    biometric_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create password_entries table
-- CRITICAL SECURITY: encrypted_password contains client-side encrypted AES-GCM ciphertext payload.
-- NEVER store plaintext passwords.
CREATE TABLE IF NOT EXISTS public.password_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    username TEXT NOT NULL,
    encrypted_password TEXT NOT NULL,
    website_url TEXT,
    notes TEXT,
    category TEXT DEFAULT 'Social',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create index for fast user lookup
CREATE INDEX IF NOT EXISTS idx_password_entries_user_id ON public.password_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_password_entries_service ON public.password_entries(user_id, service_name);

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_entries ENABLE ROW LEVEL SECURITY;

-- 6. POLICIES FOR profiles
-- Users can only see their own profile
CREATE POLICY "Users can view own profile" 
    ON public.profiles 
    FOR SELECT 
    USING (auth.uid() = id);

-- Users can only insert their own profile
CREATE POLICY "Users can insert own profile" 
    ON public.profiles 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" 
    ON public.profiles 
    FOR UPDATE 
    USING (auth.uid() = id);

-- 7. POLICIES FOR password_entries
-- User A CANNOT read User B's passwords under any circumstance
CREATE POLICY "Users can view own password entries" 
    ON public.password_entries 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own password entries" 
    ON public.password_entries 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own password entries" 
    ON public.password_entries 
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own password entries" 
    ON public.password_entries 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- 8. Trigger to auto-create profile on auth.users sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, biometric_enabled, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    TRUE,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_password_entries_updated_at ON public.password_entries;
CREATE TRIGGER update_password_entries_updated_at
  BEFORE UPDATE ON public.password_entries
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
