-- ==============================================================================
-- DATABASE RELATIONS MIGRATION – CONNETIC MODULE
-- ==============================================================================
-- Jalankan script ini di SQL Editor Supabase SETELAH DATABASE_SETUP.sql.
-- Script ini menambahkan Foreign Key (FK) antar tabel untuk menjaga
-- integritas data. Aman dijalankan berulang kali (idempotent).
--
-- Relasi yang ditambahkan:
--   ctl_activity_sessions.user_id  → users.id  (CASCADE DELETE)
--   ctl_activity_events.user_id    → users.id  (CASCADE DELETE)
--   lesson_progress.user_id        → users.id  (CASCADE DELETE)
--   global_test_progress.user_id   → users.id  (CASCADE DELETE)
--   assessment_drafts.user_id      → users.id  (CASCADE DELETE)
--   group_discussions.user_id      → users.id  (CASCADE DELETE)
--     ↑ Kolom ini perlu migrasi tipe TEXT → UUID terlebih dahulu.
--
-- ON DELETE CASCADE: Jika akun siswa dihapus dari tabel users,
-- semua data miliknya di tabel lain ikut terhapus otomatis.
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- LANGKAH 1: MIGRASI TIPE KOLOM group_discussions.user_id (TEXT → UUID)
-- ==============================================================================
-- Kolom ini seharusnya UUID (mengacu ke users.id) tapi saat ini bertipe TEXT.
-- Sebelum diubah, bersihkan dulu baris yang user_id-nya bukan UUID valid
-- (contoh: sisa data lama atau entry dari admin hardcode 'admin-root').
-- ==============================================================================

DO $$
DECLARE
    col_type TEXT;
BEGIN
    -- Cek tipe kolom saat ini
    SELECT data_type INTO col_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'group_discussions'
      AND column_name  = 'user_id';

    IF col_type IS NULL THEN
        RAISE NOTICE '  ⏭️  Tabel group_discussions tidak ditemukan, dilewati.';
    ELSIF col_type = 'uuid' THEN
        RAISE NOTICE '  ℹ️  group_discussions.user_id sudah UUID. Lanjut bersihkan orphan...';

        -- Hapus baris orphan: user_id valid UUID tapi tidak ada di tabel users
        DELETE FROM public.group_discussions
        WHERE user_id NOT IN (SELECT id FROM public.users);

        RAISE NOTICE '     Baris orphan (user tidak ada di users) telah dibersihkan.';
    ELSE
        RAISE NOTICE '  🔄 Migrasi group_discussions.user_id: % → UUID...', col_type;

        -- Hapus baris yang user_id-nya bukan format UUID valid
        DELETE FROM public.group_discussions
        WHERE user_id IS NULL
           OR user_id = ''
           OR NOT (user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$');

        RAISE NOTICE '     Baris dengan user_id non-UUID telah dibersihkan.';

        -- Hapus baris orphan: user_id format UUID valid tapi tidak ada di tabel users
        DELETE FROM public.group_discussions
        WHERE (user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')
          AND user_id::UUID NOT IN (SELECT id FROM public.users);

        RAISE NOTICE '     Baris orphan (user tidak ada di users) telah dibersihkan.';

        -- Ubah tipe kolom TEXT → UUID
        EXECUTE 'ALTER TABLE public.group_discussions ALTER COLUMN user_id TYPE UUID USING user_id::UUID';

        RAISE NOTICE '  ✅ Migrasi tipe kolom selesai: user_id sekarang UUID.';
    END IF;
END $$;


-- ==============================================================================
-- LANGKAH 1b: BERSIHKAN ORPHAN DATA DI SEMUA TABEL
-- ==============================================================================
-- Hapus baris di tabel child yang user_id-nya tidak ada di tabel users.
-- Ini mencegah error saat menambahkan FK constraint.
-- ==============================================================================

DO $$
DECLARE
    tbl TEXT;
    deleted_count BIGINT;
    tables_to_clean TEXT[] := ARRAY[
        'ctl_activity_sessions',
        'ctl_activity_events',
        'lesson_progress',
        'global_test_progress',
        'assessment_drafts'
    ];
BEGIN
    RAISE NOTICE '  🔄 Membersihkan orphan data...';
    FOREACH tbl IN ARRAY tables_to_clean
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = tbl
        ) THEN
            EXECUTE format(
                'WITH deleted AS (DELETE FROM public.%I WHERE user_id NOT IN (SELECT id FROM public.users) RETURNING 1)
                 SELECT COUNT(*) FROM deleted',
                tbl
            ) INTO deleted_count;
            IF deleted_count > 0 THEN
                RAISE NOTICE '     % → % baris orphan dihapus', tbl, deleted_count;
            ELSE
                RAISE NOTICE '     % → tidak ada orphan', tbl;
            END IF;
        ELSE
            RAISE NOTICE '     % → tabel tidak ditemukan, dilewati', tbl;
        END IF;
    END LOOP;
    RAISE NOTICE '  ✅ Pembersihan orphan selesai.';
END $$;


-- ==============================================================================
-- LANGKAH 2: TAMBAH FOREIGN KEY CONSTRAINTS
-- ==============================================================================
-- Setiap FK dibungkus DO block agar tidak error jika sudah ada (idempotent).
-- ==============================================================================

-- 2a. ctl_activity_sessions.user_id → users.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_ctl_sessions_user'
          AND table_schema    = 'public'
    ) THEN
        ALTER TABLE public.ctl_activity_sessions
            ADD CONSTRAINT fk_ctl_sessions_user
            FOREIGN KEY (user_id)
            REFERENCES public.users(id)
            ON DELETE CASCADE;
        RAISE NOTICE '  ✅ FK ditambahkan: ctl_activity_sessions.user_id → users.id';
    ELSE
        RAISE NOTICE '  ⏭️  FK fk_ctl_sessions_user sudah ada, dilewati.';
    END IF;
END $$;

-- 2b. ctl_activity_events.user_id → users.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_ctl_events_user'
          AND table_schema    = 'public'
    ) THEN
        ALTER TABLE public.ctl_activity_events
            ADD CONSTRAINT fk_ctl_events_user
            FOREIGN KEY (user_id)
            REFERENCES public.users(id)
            ON DELETE CASCADE;
        RAISE NOTICE '  ✅ FK ditambahkan: ctl_activity_events.user_id → users.id';
    ELSE
        RAISE NOTICE '  ⏭️  FK fk_ctl_events_user sudah ada, dilewati.';
    END IF;
END $$;

-- 2c. lesson_progress.user_id → users.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_lesson_progress_user'
          AND table_schema    = 'public'
    ) THEN
        ALTER TABLE public.lesson_progress
            ADD CONSTRAINT fk_lesson_progress_user
            FOREIGN KEY (user_id)
            REFERENCES public.users(id)
            ON DELETE CASCADE;
        RAISE NOTICE '  ✅ FK ditambahkan: lesson_progress.user_id → users.id';
    ELSE
        RAISE NOTICE '  ⏭️  FK fk_lesson_progress_user sudah ada, dilewati.';
    END IF;
END $$;

-- 2d. global_test_progress.user_id → users.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_global_test_progress_user'
          AND table_schema    = 'public'
    ) THEN
        ALTER TABLE public.global_test_progress
            ADD CONSTRAINT fk_global_test_progress_user
            FOREIGN KEY (user_id)
            REFERENCES public.users(id)
            ON DELETE CASCADE;
        RAISE NOTICE '  ✅ FK ditambahkan: global_test_progress.user_id → users.id';
    ELSE
        RAISE NOTICE '  ⏭️  FK fk_global_test_progress_user sudah ada, dilewati.';
    END IF;
END $$;

-- 2e. assessment_drafts.user_id → users.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_assessment_drafts_user'
          AND table_schema    = 'public'
    ) THEN
        ALTER TABLE public.assessment_drafts
            ADD CONSTRAINT fk_assessment_drafts_user
            FOREIGN KEY (user_id)
            REFERENCES public.users(id)
            ON DELETE CASCADE;
        RAISE NOTICE '  ✅ FK ditambahkan: assessment_drafts.user_id → users.id';
    ELSE
        RAISE NOTICE '  ⏭️  FK fk_assessment_drafts_user sudah ada, dilewati.';
    END IF;
END $$;

-- 2f. group_discussions.user_id → users.id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_group_discussions_user'
          AND table_schema    = 'public'
    ) THEN
        ALTER TABLE public.group_discussions
            ADD CONSTRAINT fk_group_discussions_user
            FOREIGN KEY (user_id)
            REFERENCES public.users(id)
            ON DELETE CASCADE;
        RAISE NOTICE '  ✅ FK ditambahkan: group_discussions.user_id → users.id';
    ELSE
        RAISE NOTICE '  ⏭️  FK fk_group_discussions_user sudah ada, dilewati.';
    END IF;
END $$;


-- ==============================================================================
-- LANGKAH 3: VERIFIKASI HASIL
-- ==============================================================================

DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  VERIFIKASI FOREIGN KEY CONSTRAINTS';
    RAISE NOTICE '========================================';

    FOR rec IN
        SELECT
            tc.constraint_name,
            tc.table_name          AS child_table,
            kcu.column_name        AS child_column,
            ccu.table_name         AS parent_table,
            ccu.column_name        AS parent_column,
            rc.delete_rule
        FROM information_schema.table_constraints    AS tc
        JOIN information_schema.key_column_usage     AS kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema    = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON tc.constraint_name = ccu.constraint_name
         AND tc.table_schema    = ccu.table_schema
        JOIN information_schema.referential_constraints AS rc
          ON tc.constraint_name = rc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema    = 'public'
          AND ccu.table_name     = 'users'
        ORDER BY tc.table_name
    LOOP
        RAISE NOTICE '  [FK] %.% → %.%  (DELETE: %)',
            rec.child_table, rec.child_column,
            rec.parent_table, rec.parent_column,
            rec.delete_rule;
    END LOOP;

    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ MIGRASI RELASI SELESAI.';
    RAISE NOTICE '   Hapus user → data terkait ikut terhapus (CASCADE).';
END $$;

COMMIT;

-- ==============================================================================
-- CATATAN PENTING:
-- ==============================================================================
-- ✅ Kode aplikasi TIDAK perlu diubah. FK hanya bekerja di level database.
--
-- ⚠️  Jika ada data group_discussions lama dengan user_id yang sudah tidak ada
--     di tabel users, baris tersebut TIDAK bisa ditambahkan FK.
--     Script ini otomatis membersihkan baris dengan user_id tidak valid sebelum
--     menambahkan FK.
--
-- 🔒 Tabel yang TIDAK ditambahkan FK (independen dari users):
--    • admin_group_names   → Master daftar nama kelompok
--    • admin_questions     → Bank soal
--    • stage_timers        → Pengaturan timer
--    • admin_stage_overrides → Override konten stage
--    • admin_stage_sync    → Sinkronisasi real-time sesi
-- ==============================================================================
