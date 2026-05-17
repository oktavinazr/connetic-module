import { supabase } from './supabase';

export type CTLStageType =
  | 'constructivism'
  | 'inquiry'
  | 'questioning'
  | 'learning-community'
  | 'modeling'
  | 'reflection'
  | 'authentic-assessment';

export type CTLActivityStatus = 'not_started' | 'in_progress' | 'completed';

export interface CTLActivitySession {
  id?: string;
  userId: string;
  lessonId: string;
  stageIndex: number;
  stageType: CTLStageType;
  status: CTLActivityStatus;
  progressPercent: number;
  latestSnapshot: Record<string, any>;
  finalAnswer?: any;
  startedAt?: string | null;
  lastActivityAt?: string | null;
  completedAt?: string | null;
  totalAttempts: number;
  totalErrors: number;
  correctCount: number;
  wrongCount: number;
  totalDurationSec: number;
  updatedAt?: string | null;
}

export interface CTLActivityEvent {
  id?: string;
  userId: string;
  lessonId: string;
  stageIndex: number;
  stageType: CTLStageType;
  eventType: string;
  eventData?: Record<string, any>;
  isCorrect?: boolean | null;
  errorCount?: number;
  attemptDelta?: number;
  progressPercent?: number | null;
  createdAt?: string;
}

const sessionCache = new Map<string, CTLActivitySession>();
const lessonCache = new Map<string, CTLActivitySession[]>();

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const sessionKey = (userId: string, lessonId: string, stageIndex: number) =>
  `${userId}:${lessonId}:${stageIndex}`;

const normalizeNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeObject = (value: unknown): Record<string, any> =>
  value && typeof value === 'object' && !Array.isArray(value) ? { ...(value as Record<string, any>) } : {};

const cloneSession = (session: CTLActivitySession): CTLActivitySession => ({
  ...session,
  latestSnapshot: normalizeObject(session.latestSnapshot),
  finalAnswer: session.finalAnswer,
});

const normalizeSession = (row: Record<string, any>): CTLActivitySession => ({
  id: row.id,
  userId: row.user_id,
  lessonId: row.lesson_id,
  stageIndex: normalizeNumber(row.stage_index),
  stageType: row.stage_type,
  status: row.status ?? 'not_started',
  progressPercent: normalizeNumber(row.progress_percent),
  latestSnapshot: normalizeObject(row.latest_snapshot),
  finalAnswer: row.final_answer,
  startedAt: row.started_at ?? null,
  lastActivityAt: row.last_activity_at ?? null,
  completedAt: row.completed_at ?? null,
  totalAttempts: normalizeNumber(row.total_attempts),
  totalErrors: normalizeNumber(row.total_errors),
  correctCount: normalizeNumber(row.correct_count),
  wrongCount: normalizeNumber(row.wrong_count),
  totalDurationSec: normalizeNumber(row.total_duration_sec),
  updatedAt: row.updated_at ?? null,
});

export function defaultSession(
  userId: string,
  lessonId: string,
  stageIndex: number,
  stageType: CTLStageType,
): CTLActivitySession {
  return {
    userId,
    lessonId,
    stageIndex,
    stageType,
    status: 'not_started',
    progressPercent: 0,
    latestSnapshot: {},
    totalAttempts: 0,
    totalErrors: 0,
    correctCount: 0,
    wrongCount: 0,
    totalDurationSec: 0,
  };
}

export async function getCurrentSession(
  userId: string,
  lessonId: string,
  stageIndex: number,
  stageType: CTLStageType,
): Promise<CTLActivitySession> {
  const key = sessionKey(userId, lessonId, stageIndex);
  const cached = sessionCache.get(key);
  if (cached) return cloneSession(cached);
  if (!isUuid(userId)) return defaultSession(userId, lessonId, stageIndex, stageType);

  const { data, error } = await supabase
    .from('ctl_activity_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .eq('stage_index', stageIndex)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error('[getCurrentSession]', error.message);
    return defaultSession(userId, lessonId, stageIndex, stageType);
  }

  const session = normalizeSession(data);
  sessionCache.set(key, cloneSession(session));
  return cloneSession(session);
}

function invalidateLessonCache(userId: string, lessonId: string) {
  lessonCache.delete(`${userId}:${lessonId}`);
}

export async function upsertActivitySnapshot(params: {
  userId: string;
  lessonId: string;
  stageIndex: number;
  stageType: CTLStageType;
  snapshot: Record<string, any>;
  progressPercent?: number;
  status?: CTLActivityStatus;
  finalAnswer?: any;
  completed?: boolean;
}) {
  const { userId, lessonId, stageIndex, stageType, snapshot, finalAnswer } = params;
  if (!isUuid(userId)) return;

  const now = new Date().toISOString();
  const current = await getCurrentSession(userId, lessonId, stageIndex, stageType);

  // Guard: if already completed, don't allow any further updates
  if (current.status === 'completed') {
    return;
  }

  const startedAt = current.startedAt ?? now;
  const status: CTLActivityStatus = params.completed
    ? 'completed'
    : params.status ?? 'in_progress';
  const progressPercent = Math.max(
    current.progressPercent,
    Math.min(100, Math.round(params.progressPercent ?? current.progressPercent ?? 0)),
  );

  const payload = {
    user_id: userId,
    lesson_id: lessonId,
    stage_index: stageIndex,
    stage_type: stageType,
    status,
    progress_percent: progressPercent,
    latest_snapshot: snapshot,
    final_answer: finalAnswer ?? current.finalAnswer ?? null,
    started_at: startedAt,
    last_activity_at: now,
    completed_at: params.completed ? now : current.completedAt,
    total_attempts: current.totalAttempts,
    total_errors: current.totalErrors,
    correct_count: current.correctCount,
    wrong_count: current.wrongCount,
    total_duration_sec: current.totalDurationSec,
    updated_at: now,
  };

  const { error } = await supabase
    .from('ctl_activity_sessions')
    .upsert(payload, { onConflict: 'user_id,lesson_id,stage_index' });

  if (error) {
    console.error('[upsertActivitySnapshot]', error.message);
    return;
  }

  const next = normalizeSession(payload);
  sessionCache.set(sessionKey(userId, lessonId, stageIndex), next);
  invalidateLessonCache(userId, lessonId);
}

export async function trackActivityEvent(params: CTLActivityEvent) {
  const { userId, lessonId, stageIndex, stageType } = params;
  if (!isUuid(userId)) return;

  const now = new Date().toISOString();
  const current = await getCurrentSession(userId, lessonId, stageIndex, stageType);

  // Guard: don't track events for already completed sessions
  if (current.status === 'completed') {
    return;
  }

  const attemptDelta = normalizeNumber(params.attemptDelta);
  const errorCount = normalizeNumber(params.errorCount);
  const isCorrect = params.isCorrect === true;
  const isWrong = params.isCorrect === false;
  const progressPercent = params.progressPercent == null
    ? current.progressPercent
    : Math.min(100, Math.max(current.progressPercent, Math.round(params.progressPercent)));

  const nextSessionPayload = {
    user_id: userId,
    lesson_id: lessonId,
    stage_index: stageIndex,
    stage_type: stageType,
    status: 'in_progress' as CTLActivityStatus,
    progress_percent: progressPercent,
    latest_snapshot: current.latestSnapshot,
    final_answer: current.finalAnswer ?? null,
    started_at: current.startedAt ?? now,
    last_activity_at: now,
    completed_at: current.completedAt,
    total_attempts: current.totalAttempts + attemptDelta,
    total_errors: current.totalErrors + errorCount + (isWrong ? 1 : 0),
    correct_count: current.correctCount + (isCorrect ? 1 : 0),
    wrong_count: current.wrongCount + (isWrong ? 1 : 0),
    total_duration_sec: current.totalDurationSec,
    updated_at: now,
  };

  const { error: sessionError } = await supabase
    .from('ctl_activity_sessions')
    .upsert(nextSessionPayload, { onConflict: 'user_id,lesson_id,stage_index' });

  if (sessionError) {
    console.error('[trackActivityEvent:session]', sessionError.message);
    return;
  }

  const { error } = await supabase.from('ctl_activity_events').insert({
    user_id: userId,
    lesson_id: lessonId,
    stage_index: stageIndex,
    stage_type: stageType,
    event_type: params.eventType,
    event_data: params.eventData ?? {},
    is_correct: params.isCorrect ?? null,
    error_count: errorCount,
    attempt_delta: attemptDelta,
    progress_percent: params.progressPercent ?? null,
    created_at: now,
  });

  if (error) {
    console.error('[trackActivityEvent:event]', error.message);
  }

  const next = normalizeSession(nextSessionPayload);
  sessionCache.set(sessionKey(userId, lessonId, stageIndex), next);
  invalidateLessonCache(userId, lessonId);
}

export async function completeActivitySession(params: {
  userId: string;
  lessonId: string;
  stageIndex: number;
  stageType: CTLStageType;
  finalAnswer: any;
  latestSnapshot?: Record<string, any>;
}) {
  const { userId, lessonId, stageIndex, stageType, finalAnswer } = params;
  // Guard: check if already completed before proceeding
  if (isUuid(userId)) {
    const current = await getCurrentSession(userId, lessonId, stageIndex, stageType);
    if (current.status === 'completed') {
      return;
    }
  }
  const snapshot = params.latestSnapshot ?? { finalAnswer };
  await upsertActivitySnapshot({
    userId,
    lessonId,
    stageIndex,
    stageType,
    snapshot,
    finalAnswer,
    progressPercent: 100,
    status: 'completed',
    completed: true,
  });
  await trackActivityEvent({
    userId,
    lessonId,
    stageIndex,
    stageType,
    eventType: 'stage_completed',
    eventData: { hasFinalAnswer: finalAnswer != null },
    progressPercent: 100,
  });
}

export async function getLessonActivitySessions(userId: string, lessonId: string): Promise<CTLActivitySession[]> {
  const key = `${userId}:${lessonId}`;
  const cached = lessonCache.get(key);
  if (cached) return cached.map(cloneSession);
  if (!isUuid(userId)) return [];

  const { data, error } = await supabase
    .from('ctl_activity_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .order('stage_index', { ascending: true });

  if (error || !data) {
    if (error) console.error('[getLessonActivitySessions]', error.message);
    return [];
  }

  const sessions = data.map((row) => normalizeSession(row));
  lessonCache.set(key, sessions.map(cloneSession));
  sessions.forEach((session) => {
    sessionCache.set(sessionKey(session.userId, session.lessonId, session.stageIndex), cloneSession(session));
  });
  return sessions.map(cloneSession);
}

export async function getStudentActivityFeed(limit = 50): Promise<CTLActivityEvent[]> {
  const { data, error } = await supabase
    .from('ctl_activity_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) {
    if (error) console.error('[getStudentActivityFeed]', error.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    userId: row.user_id,
    lessonId: row.lesson_id,
    stageIndex: normalizeNumber(row.stage_index),
    stageType: row.stage_type,
    eventType: row.event_type,
    eventData: normalizeObject(row.event_data),
    isCorrect: row.is_correct,
    errorCount: normalizeNumber(row.error_count),
    attemptDelta: normalizeNumber(row.attempt_delta),
    progressPercent: row.progress_percent,
    createdAt: row.created_at,
  }));
}
