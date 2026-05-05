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

-- AKTIFKAN FITUR REAL-TIME (Agar pesan diskusi muncul otomatis tanpa refresh)
-- Gunakan DO block untuk menghindari error jika tabel sudah ditambahkan
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.group_discussions;
EXCEPTION WHEN OTHERS THEN
    -- Tabel sudah ditambahkan sebelumnya, abaikan error
    RAISE NOTICE 'Tabel group_discussions sudah ada di publication supabase_realtime';
END $$;


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

-- AKTIFKAN REAL-TIME UNTUK CTL TABLES
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ctl_activity_sessions;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Tabel ctl_activity_sessions sudah ada di publication supabase_realtime';
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ctl_activity_events;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Tabel ctl_activity_events sudah ada di publication supabase_realtime';
END $$;


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


-- 5. MENYIAPKAN TABEL LESSON PROGRESS (Progress Belajar per Siswa)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    lesson_id TEXT NOT NULL,
    pretest_completed BOOLEAN DEFAULT false,
    pretest_score INTEGER,
    completed_stages INTEGER[] DEFAULT '{}',
    posttest_completed BOOLEAN DEFAULT false,
    posttest_score INTEGER,
    answers JSONB DEFAULT '{}'::jsonb,
    stage_attempts JSONB DEFAULT '{}'::jsonb,
    stage_success JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.lesson_progress DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.lesson_progress TO anon;
GRANT ALL ON TABLE public.lesson_progress TO authenticated;
GRANT ALL ON TABLE public.lesson_progress TO service_role;


-- 6. MENYIAPKAN TABEL GLOBAL TEST PROGRESS (Pretest/Posttest Global)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.global_test_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL,
    global_pretest_completed BOOLEAN DEFAULT false,
    global_pretest_score INTEGER,
    global_pretest_answers INTEGER[] DEFAULT '{}',
    global_posttest_completed BOOLEAN DEFAULT false,
    global_posttest_score INTEGER,
    global_posttest_answers INTEGER[] DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.global_test_progress DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.global_test_progress TO anon;
GRANT ALL ON TABLE public.global_test_progress TO authenticated;
GRANT ALL ON TABLE public.global_test_progress TO service_role;


-- 7. MENYIAPKAN TABEL ASSESSMENT DRAFTS (Simpan Jawaban Sementara)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.assessment_drafts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    draft_key TEXT NOT NULL,
    answers INTEGER[] DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, draft_key)
);

ALTER TABLE public.assessment_drafts DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.assessment_drafts TO anon;
GRANT ALL ON TABLE public.assessment_drafts TO authenticated;
GRANT ALL ON TABLE public.assessment_drafts TO service_role;


-- 8. MENYIAPKAN TABEL ADMIN QUESTIONS (Edit Soal oleh Admin)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_key TEXT UNIQUE NOT NULL,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_questions DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.admin_questions TO anon;
GRANT ALL ON TABLE public.admin_questions TO authenticated;
GRANT ALL ON TABLE public.admin_questions TO service_role;


-- 9. MENYIAPKAN TABEL ADMIN STAGE OVERRIDES (Custom Stage oleh Admin)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_stage_overrides (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    stage_index INTEGER NOT NULL,
    override_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(lesson_id, stage_index)
);

ALTER TABLE public.admin_stage_overrides DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.admin_stage_overrides TO anon;
GRANT ALL ON TABLE public.admin_stage_overrides TO authenticated;
GRANT ALL ON TABLE public.admin_stage_overrides TO service_role;


-- 10. CATATAN PENTING UNTUK ADMIN:
-- ==============================================================================
-- Jika Anda baru saja menjalankan script ini, pastikan untuk:
-- 1. Logout dari aplikasi.
-- 2. Daftar Ulang (Register) akun siswa baru agar data masuk ke Database.
-- 3. Akun yang terdaftar sebelum menjalankan script ini mungkin bersifat "Lokal" 
--    dan tidak bisa menyimpan pilihan kelompok ke database global.
