import { supabase } from './supabase';

export interface AdminStageSync {
  id?: string;
  lesson_id: string;
  current_stage_index: number;
  stage_started_at: string | null;
  force_advance: boolean;
  force_advance_at: string | null;
  status: 'active' | 'waiting' | 'advanced';
  session_status: 'idle' | 'active' | 'paused';
  paused_at: string | null;
  total_paused_ms: number;
  added_minutes: number;
  updated_at?: string;
}

const cache = new Map<string, AdminStageSync>();

function normalizeSync(data: any): AdminStageSync {
  return {
    id: data.id,
    lesson_id: data.lesson_id,
    current_stage_index: data.current_stage_index ?? 0,
    stage_started_at: data.stage_started_at ?? null,
    force_advance: data.force_advance ?? false,
    force_advance_at: data.force_advance_at ?? null,
    status: data.status ?? 'active',
    session_status: data.session_status ?? 'idle',
    paused_at: data.paused_at ?? null,
    total_paused_ms: data.total_paused_ms ?? 0,
    added_minutes: data.added_minutes ?? 0,
    updated_at: data.updated_at,
  };
}

export async function getAdminStageSync(lessonId: string): Promise<AdminStageSync | null> {
  const cached = cache.get(lessonId);
  if (cached) return { ...cached };

  const { data, error } = await supabase
    .from('admin_stage_sync')
    .select('*')
    .eq('lesson_id', lessonId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error('[getAdminStageSync]', error.message);
    return null;
  }

  const sync = normalizeSync(data);
  cache.set(lessonId, sync);
  return { ...sync };
}

/** Start session: set status=active, stage=0, record start time */
export async function startSession(lessonId: string): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('admin_stage_sync')
    .upsert({
      lesson_id: lessonId,
      current_stage_index: 0,
      stage_started_at: now,
      force_advance: false,
      force_advance_at: null,
      status: 'active',
      session_status: 'active',
      paused_at: null,
      total_paused_ms: 0,
      added_minutes: 0,
      updated_at: now,
    }, { onConflict: 'lesson_id' });

  if (error) console.error('[startSession]', error.message);
  cache.delete(lessonId);
}

/** Pause session for all students */
export async function pauseSession(lessonId: string): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('admin_stage_sync')
    .update({
      session_status: 'paused',
      paused_at: now,
      updated_at: now,
    })
    .eq('lesson_id', lessonId);

  if (error) console.error('[pauseSession]', error.message);
  cache.delete(lessonId);
}

/** Resume session from pause */
export async function resumeSession(lessonId: string): Promise<void> {
  // Read current state to calculate accumulated pause time
  const current = await getAdminStageSync(lessonId);
  const now = new Date();
  const nowISO = now.toISOString();

  let additionalPauseMs = 0;
  if (current?.paused_at) {
    additionalPauseMs = now.getTime() - new Date(current.paused_at).getTime();
  }

  const { error } = await supabase
    .from('admin_stage_sync')
    .update({
      session_status: 'active',
      paused_at: null,
      total_paused_ms: (current?.total_paused_ms ?? 0) + additionalPauseMs,
      updated_at: nowISO,
    })
    .eq('lesson_id', lessonId);

  if (error) console.error('[resumeSession]', error.message);
  cache.delete(lessonId);
}

/** Add minutes to current stage timer */
export async function addSessionTime(lessonId: string, minutes: number): Promise<void> {
  const current = await getAdminStageSync(lessonId);
  const now = new Date().toISOString();

  const { error } = await supabase
    .from('admin_stage_sync')
    .update({
      added_minutes: (current?.added_minutes ?? 0) + minutes,
      updated_at: now,
    })
    .eq('lesson_id', lessonId);

  if (error) console.error('[addSessionTime]', error.message);
  cache.delete(lessonId);
}

/** Skip to next stage (advance all students). On last stage, marks as completed. */
export async function skipToNextStage(lessonId: string): Promise<void> {
  const current = await getAdminStageSync(lessonId);
  const nextIndex = (current?.current_stage_index ?? 0) + 1;
  const now = new Date().toISOString();
  const isFinished = (current?.current_stage_index ?? 0) >= 6; // 6 = last stage (Authentic Assessment)

  const { error } = await supabase
    .from('admin_stage_sync')
    .update({
      current_stage_index: nextIndex,
      stage_started_at: now,
      force_advance: false,
      force_advance_at: null,
      status: isFinished ? 'completed' : 'active',
      session_status: isFinished ? 'active' : 'active',
      paused_at: null,
      total_paused_ms: 0,
      added_minutes: 0,
      updated_at: now,
    })
    .eq('lesson_id', lessonId);

  if (error) console.error('[skipToNextStage]', error.message);
  cache.delete(lessonId);
}

/** Reset current stage: restart timer only, preserve all student progress */
export async function resetCurrentStage(lessonId: string): Promise<void> {
  const now = new Date().toISOString();

  // Only reset sync state — student answers and progress are preserved
  const { error: syncError } = await supabase
    .from('admin_stage_sync')
    .update({
      stage_started_at: now,
      force_advance: false,
      force_advance_at: null,
      status: 'waiting',
      session_status: 'idle',
      paused_at: null,
      total_paused_ms: 0,
      added_minutes: 0,
      updated_at: now,
    })
    .eq('lesson_id', lessonId);

  if (syncError) console.error('[resetCurrentStage]', syncError.message);

  cache.delete(lessonId);
}

/** Legacy compat: force advance (same as skip but doesn't reset timer) */
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

  if (error) console.error('[forceAdvanceStage]', error.message);
  cache.delete(lessonId);
}

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

  if (error) console.error('[clearForceAdvance]', error.message);
  cache.delete(lessonId);
}

/** Calculate remaining seconds accounting for pause and added time */
export function calcTimerRemaining(
  sync: AdminStageSync | null,
  timerMinutes: number,
): { seconds: number; isExpired: boolean; isUnlimited: boolean; isPaused: boolean } {
  if (!sync || sync.session_status === 'idle') {
    return { seconds: -1, isExpired: false, isUnlimited: true, isPaused: false };
  }

  if (timerMinutes <= 0) {
    return { seconds: -1, isExpired: false, isUnlimited: true, isPaused: sync.session_status === 'paused' };
  }

  if (!sync.stage_started_at) {
    return { seconds: timerMinutes * 60 + (sync.added_minutes ?? 0) * 60, isExpired: false, isUnlimited: false, isPaused: sync.session_status === 'paused' };
  }

  const now = Date.now();
  const startedMs = new Date(sync.stage_started_at).getTime();
  const totalDurationSec = timerMinutes * 60 + (sync.added_minutes ?? 0) * 60;

  // Calculate effective paused duration
  let pausedMs = sync.total_paused_ms ?? 0;
  if (sync.session_status === 'paused' && sync.paused_at) {
    pausedMs += now - new Date(sync.paused_at).getTime();
  }

  const elapsedSec = (now - startedMs - pausedMs) / 1000;
  const remaining = Math.max(0, totalDurationSec - elapsedSec);

  return {
    seconds: Math.ceil(remaining),
    isExpired: remaining <= 0,
    isUnlimited: false,
    isPaused: sync.session_status === 'paused',
  };
}

// ── Student status query (unchanged) ─────────────────────────────────────────

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
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id, name, nis, class, group_name')
    .eq('role', 'student');

  if (userError || !users) {
    console.error('[getStudentStageStatuses:users]', userError?.message);
    return [];
  }

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

  const sessionMap = new Map<string, any>();
  (sessions || []).forEach(s => {
    sessionMap.set(`${s.user_id}|${s.stage_index}`, s);
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

export async function getStageCompletionStats(
  lessonId: string,
  stageIndex: number,
): Promise<{ completed: number; total: number; inProgress: number; notStarted: number }> {
  const statuses = await getStudentStageStatuses(lessonId, stageIndex);
  return {
    completed: statuses.filter(s => s.status === 'completed').length,
    total: statuses.length,
    inProgress: statuses.filter(s => s.status === 'in_progress').length,
    notStarted: statuses.filter(s => s.status === 'not_started').length,
  };
}

export function clearSyncCache(lessonId?: string) {
  if (lessonId) cache.delete(lessonId);
  else cache.clear();
}
