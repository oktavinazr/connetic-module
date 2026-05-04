-- ==============================================================================
-- DATABASE SETUP CONNETIC MODULE
-- ==============================================================================
-- Salin dan jalankan seluruh isi file ini di SQL Editor Supabase Anda.
-- File ini akan menyiapkan tabel Users dan Group Discussions secara otomatis.

-- 1. MENYIAPKAN TABEL USERS (Data Akun & Kelompok)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Menyimpan SHA-256 Hash
    gender TEXT, -- 'Laki-laki' | 'Perempuan'
    class TEXT,
    nis TEXT UNIQUE,
    role TEXT DEFAULT 'student', -- 'student' | 'admin'
    group_name TEXT, -- Kolom untuk menyimpan Kelompok secara global
    registered_at TIMESTAMPTZ DEFAULT now()
);

-- Matikan RLS (Row Level Security) agar fitur Register/Login/Pilih Kelompok lancar tanpa blokir.
-- Catatan: Untuk produksi, sebaiknya gunakan Policy yang lebih spesifik.
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Berikan izin akses penuh ke aplikasi
GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;


-- 2. MENYIAPKAN TABEL GROUP DISCUSSIONS (Kolaborasi Real-time)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.group_discussions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    module_id TEXT NOT NULL, -- Contoh: 'X.TCP.6'
    group_name TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    argument TEXT NOT NULL,
    choice_id TEXT,
    choice_text TEXT,
    votes TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Matikan RLS untuk kemudahan kolaborasi real-time antar siswa.
ALTER TABLE public.group_discussions DISABLE ROW LEVEL SECURITY;

-- Izinkan akses penuh
GRANT ALL ON TABLE public.group_discussions TO anon;
GRANT ALL ON TABLE public.group_discussions TO authenticated;
GRANT ALL ON TABLE public.group_discussions TO service_role;

-- AKTIFKAN FITUR REAL-TIME (Agar pesan diskusi muncul otomatis tanpa refresh)
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_discussions;


-- 3. MENYIAPKAN TABEL LEARNING ACTIVITY TRACKING SYSTEM (CTL)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ctl_activity_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    lesson_id TEXT NOT NULL,
    stage_index INTEGER NOT NULL,
    stage_type TEXT NOT NULL,
    status TEXT DEFAULT 'not_started',
    progress_percent INTEGER DEFAULT 0,
    latest_snapshot JSONB DEFAULT '{}'::jsonb,
    final_answer JSONB,
    started_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    total_attempts INTEGER DEFAULT 0,
    total_errors INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    wrong_count INTEGER DEFAULT 0,
    total_duration_sec INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, lesson_id, stage_index)
);

CREATE TABLE IF NOT EXISTS public.ctl_activity_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    lesson_id TEXT NOT NULL,
    stage_index INTEGER NOT NULL,
    stage_type TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    is_correct BOOLEAN,
    error_count INTEGER DEFAULT 0,
    attempt_delta INTEGER DEFAULT 0,
    progress_percent INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ctl_activity_sessions_user_lesson
    ON public.ctl_activity_sessions (user_id, lesson_id);

CREATE INDEX IF NOT EXISTS idx_ctl_activity_events_user_lesson_stage
    ON public.ctl_activity_events (user_id, lesson_id, stage_index, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ctl_activity_events_created_at
    ON public.ctl_activity_events (created_at DESC);

ALTER TABLE public.ctl_activity_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ctl_activity_events DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.ctl_activity_sessions TO anon;
GRANT ALL ON TABLE public.ctl_activity_sessions TO authenticated;
GRANT ALL ON TABLE public.ctl_activity_sessions TO service_role;

GRANT ALL ON TABLE public.ctl_activity_events TO anon;
GRANT ALL ON TABLE public.ctl_activity_events TO authenticated;
GRANT ALL ON TABLE public.ctl_activity_events TO service_role;

ALTER PUBLICATION supabase_realtime ADD TABLE public.ctl_activity_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ctl_activity_events;


-- 4. MENYIAPKAN TABEL ADMIN GROUP NAMES (Custom Nama Kelompok)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_group_names (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Matikan RLS agar admin bisa manage nama kelompok
ALTER TABLE public.admin_group_names DISABLE ROW LEVEL SECURITY;

-- Izinkan akses penuh
GRANT ALL ON TABLE public.admin_group_names TO anon;
GRANT ALL ON TABLE public.admin_group_names TO authenticated;
GRANT ALL ON TABLE public.admin_group_names TO service_role;


-- 5. CATATAN PENTING UNTUK ADMIN:
-- ==============================================================================
-- Jika Anda baru saja menjalankan script ini, pastikan untuk:
-- 1. Logout dari aplikasi.
-- 2. Daftar Ulang (Register) akun siswa baru agar data masuk ke Database.
-- 3. Akun yang terdaftar sebelum menjalankan script ini mungkin bersifat "Lokal" 
--    dan tidak bisa menyimpan pilihan kelompok ke database global.
