-- ==============================================================================
-- DATABASE RESET SCRIPT – CONNETIC MODULE
-- ==============================================================================
-- Jalankan seluruh script ini di SQL Editor Supabase.
-- Script ini menghapus SEMUA data pengguna & pembelajaran, tetapi TIDAK
-- menyentuh struktur tabel, schema, RLS policy, trigger, atau konfigurasi.
-- Aman dijalankan berulang kali — tabel yang belum ada akan dilewati.
-- ==============================================================================

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. HAPUS DATA TABEL ANAK (yang mereferensi users / data pembelajaran)
-- ══════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
    tbl TEXT;
    tables_to_clear TEXT[] := ARRAY[
        'group_discussions',
        'ctl_activity_events',
        'ctl_activity_sessions',
        'lesson_progress',
        'global_test_progress',
        'assessment_drafts'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables_to_clear
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = tbl
        ) THEN
            EXECUTE format('DELETE FROM public.%I', tbl);
            RAISE NOTICE '  ✅ Tabel % → data dihapus', tbl;
        ELSE
            RAISE NOTICE '  ⏭️  Tabel % → belum ada, dilewati', tbl;
        END IF;
    END LOOP;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. HAPUS SELURUH AKUN PENGGUNA (terakhir, setelah data anak dibersihkan)
-- ══════════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'users'
    ) THEN
        DELETE FROM public.users;
        RAISE NOTICE '  ✅ Tabel users → semua akun dihapus';
    ELSE
        RAISE NOTICE '  ⏭️  Tabel users → belum ada, dilewati';
    END IF;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. VERIFIKASI: Cek semua tabel yang ada di database
-- ══════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
    tbl TEXT;
    cnt BIGINT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  VERIFIKASI HASIL RESET';
    RAISE NOTICE '========================================';
    FOR tbl IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
        ORDER BY table_name
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM public.%I', tbl) INTO cnt;
        RAISE NOTICE '  % → % baris', tbl, cnt;
    END LOOP;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ RESET SELESAI — semua data pengguna &';
    RAISE NOTICE '   pembelajaran telah dibersihkan.';
    RAISE NOTICE '   Struktur tabel, policy, & konfigurasi TETAP UTUH.';
END $$;

COMMIT;

-- ==============================================================================
-- CATATAN:
-- ==============================================================================
-- ✅ Data yang dihapus:
--    • group_discussions     → Diskusi kelompok & voting
--    • ctl_activity_events   → Log aktivitas CTL detail
--    • ctl_activity_sessions → Sesi progres CTL
--    • lesson_progress       → Progres belajar & skor
--    • global_test_progress  → Global pretest/posttest
--    • assessment_drafts     → Draft jawaban sementara
--    • users                 → SEMUA akun (siswa & admin)
--
-- 🔒 Tabel KONFIGURASI (dibiarkan utuh):
--    • admin_group_names, admin_questions, stage_timers, admin_stage_overrides
--    (hanya jika tabelnya sudah ada di database)
-- ==============================================================================
