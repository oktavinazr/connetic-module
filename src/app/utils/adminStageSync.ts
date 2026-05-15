import { supabase } from './supabase';

export interface AdminStageSync {
  id?: string;
  lesson_id: string;
  current_stage_index: number;
  stage_started_at: string | null;
  force_advance: boolean;
  force_advance_at: string | null;
  status: 'active' | 'waiting' | 'advanced';
  updated_at?: string;
}

const cache = new Map<string, AdminStageSync>();

/**
 * Get the current global stage sync state for a lesson.
 * This is a singleton row per lesson that controls synchronized stage progression.
 */
export async function getAdminStageSync(lessonId: string): Promise<AdminStageSync | null> {
  const cached = cache.get(lessonId);
  if (cached) return { ...cached };

  const { data, error } = await supabase
    .from('admin_stage_sync')
    .select('*')
    .eq('lesson_id', lessonId)
    .maybeSingle();

  if (error) {
    console.error('[getAdminStageSync]', error.message);
    return null;
  }

  if (!data) return null;

  const sync: AdminStageSync = {
    id: data.id,
    lesson_id: data.lesson_id,
    current_stage_index: data.current_stage_index,
    stage_started_at: data.stage_started_at ?? null,
    force_advance: data.force_advance ?? false,
    force_advance_at: data.force_advance_at ?? null,
    status: data.status ?? 'active',
    updated_at: data.updated_at,
  };

  cache.set(lessonId, sync);
  return { ...sync };
}

/**
 * Initialize or update the global stage sync for a lesson.
 * Called when a new stage begins for the class.
 */
export async function setAdminStageSync(
  lessonId: string,
  stageIndex: number,
  stageStartedAt?: string,
): Promise<void> {
  const now = new Date().toISOString();
  const payload = {
    lesson_id: lessonId,
    current_stage_index: stageIndex,
    stage_started_at: stageStartedAt ?? now,
    force_advance: false,
    force_advance_at: null,
    status: 'active',
    updated_at: now,
  };

  const { error } = await supabase
    .from('admin_stage_sync')
    .upsert(payload, { onConflict: 'lesson_id' });

  if (error) {
    console.error('[setAdminStageSync]', error.message);
    return;
  }

  cache.delete(lessonId);
}

/**
 * Admin force-advances the stage.
 * All students will detect this on their next poll and advance.
 */
export async function forceAdvanceStage(lessonId: string): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('admin_stage_sync')
    .update({
      force_advance: true,
      force_advance_at: now,
      status: 'advanced',
      updated_at: now,
    })
    .eq('lesson_id', lessonId);

  if (error) {
    console.error('[forceAdvanceStage]', error.message);
    return;
  }

  cache.delete(lessonId);
}

/**
 * Reset the force_advance flag after students have advanced.
 * Called server-side but we expose it for cleanup.
 */
export async function clearForceAdvance(lessonId: string): Promise<void> {
  const { error } = await supabase
    .from('admin_stage_sync')
    .update({
      force_advance: false,
      force_advance_at: null,
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('lesson_id', lessonId);

  if (error) {
    console.error('[clearForceAdvance]', error.message);
    return;
  }

  cache.delete(lessonId);
}

/**
 * Get all active sessions for a specific lesson and stage.
 * Used by the admin monitoring grid.
 */
export interface StudentStageStatus {
  userId: string;
  userName: string;
  userNis: string;
  userClass: string;
  groupName: string | null;
  stageIndex: number;
  stageType: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progressPercent: number;
  totalAttempts: number;
  totalErrors: number;
  startedAt: string | null;
  completedAt: string | null;
}

export async function getStudentStageStatuses(
  lessonId: string,
  stageIndex?: number,
): Promise<StudentStageStatus[]> {
  // Get all users first
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id, name, nis, class, group_name')
    .eq('role', 'student');

  if (userError || !users) {
    console.error('[getStudentStageStatuses:users]', userError?.message);
    return [];
  }

  // Get all ctl_activity_sessions for this lesson
  let query = supabase
    .from('ctl_activity_sessions')
    .select('*')
    .eq('lesson_id', lessonId);

  if (stageIndex !== undefined) {
    query = query.eq('stage_index', stageIndex);
  }

  const { data: sessions, error: sessionError } = await query;

  if (sessionError) {
    console.error('[getStudentStageStatuses:sessions]', sessionError.message);
    return [];
  }

  const sessionMap = new Map<string, typeof sessions[0]>();
  (sessions || []).forEach(s => {
    const key = `${s.user_id}|${s.stage_index}`;
    sessionMap.set(key, s);
  });

  return users.map(user => {
    const key = `${user.id}|${stageIndex ?? 0}`;
    const session = sessionMap.get(key);

    return {
      userId: user.id,
      userName: user.name,
      userNis: user.nis,
      userClass: user.class,
      groupName: user.group_name ?? null,
      stageIndex: session?.stage_index ?? (stageIndex ?? 0),
      stageType: session?.stage_type ?? '',
      status: (session?.status as StudentStageStatus['status']) ?? 'not_started',
      progressPercent: session?.progress_percent ?? 0,
      totalAttempts: session?.total_attempts ?? 0,
      totalErrors: session?.total_errors ?? 0,
      startedAt: session?.started_at ?? null,
      completedAt: session?.completed_at ?? null,
    };
  });
}

/**
 * Count how many students are completed vs total for a stage.
 */
export async function getStageCompletionStats(
  lessonId: string,
  stageIndex: number,
): Promise<{ completed: number; total: number; inProgress: number; notStarted: number }> {
  const statuses = await getStudentStageStatuses(lessonId, stageIndex);
  const completed = statuses.filter(s => s.status === 'completed').length;
  const inProgress = statuses.filter(s => s.status === 'in_progress').length;
  const notStarted = statuses.filter(s => s.status === 'not_started').length;

  return {
    completed,
    total: statuses.length,
    inProgress,
    notStarted,
  };
}

// Polling helper: clear cache
export function clearSyncCache(lessonId?: string) {
  if (lessonId) {
    cache.delete(lessonId);
  } else {
    cache.clear();
  }
}
