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


-- 3. CATATAN PENTING UNTUK ADMIN:
-- ==============================================================================
-- Jika Anda baru saja menjalankan script ini, pastikan untuk:
-- 1. Logout dari aplikasi.
-- 2. Daftar Ulang (Register) akun siswa baru agar data masuk ke Database.
-- 3. Akun yang terdaftar sebelum menjalankan script ini mungkin bersifat "Lokal" 
--    dan tidak bisa menyimpan pilihan kelompok ke database global.
