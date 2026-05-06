import { supabase } from './supabase';

export interface StageTimer {
  id?: string;
  lesson_id: string;
  stage_index: number;
  duration_minutes: number; // 0 = unlimited
  updated_at?: string;
}

const timerCache = new Map<string, StageTimer[]>();

const CACHE_KEY = (lessonId: string) => `timers_${lessonId}`;

export async function getStageTimers(lessonId: string): Promise<StageTimer[]> {
  const cached = timerCache.get(CACHE_KEY(lessonId));
  if (cached) return [...cached];

  const { data, error } = await supabase
    .from('stage_timers')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('stage_index', { ascending: true });

  if (error) {
    console.error('[getStageTimers]', error.message);
    return [];
  }

  const timers: StageTimer[] = (data || []).map(row => ({
    id: row.id,
    lesson_id: row.lesson_id,
    stage_index: row.stage_index,
    duration_minutes: row.duration_minutes ?? 0,
    updated_at: row.updated_at,
  }));

  timerCache.set(CACHE_KEY(lessonId), [...timers]);
  return [...timers];
}

export async function setStageTimer(
  lessonId: string,
  stageIndex: number,
  durationMinutes: number
): Promise<void> {
  const payload = {
    lesson_id: lessonId,
    stage_index: stageIndex,
    duration_minutes: durationMinutes,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('stage_timers')
    .upsert(payload, { onConflict: 'lesson_id,stage_index' });

  if (error) {
    console.error('[setStageTimer]', error.message);
    return;
  }

  // Invalidate cache
  timerCache.delete(CACHE_KEY(lessonId));
}

export async function deleteStageTimer(lessonId: string, stageIndex: number): Promise<void> {
  const { error } = await supabase
    .from('stage_timers')
    .delete()
    .eq('lesson_id', lessonId)
    .eq('stage_index', stageIndex);

  if (error) {
    console.error('[deleteStageTimer]', error.message);
    return;
  }

  timerCache.delete(CACHE_KEY(lessonId));
}

export async function getAllStageTimers(): Promise<Record<string, StageTimer[]>> {
  const { data, error } = await supabase
    .from('stage_timers')
    .select('*')
    .order('lesson_id', { ascending: true })
    .order('stage_index', { ascending: true });

  if (error || !data) {
    console.error('[getAllStageTimers]', error?.message);
    return {};
  }

  const result: Record<string, StageTimer[]> = {};
  for (const row of data) {
    const timer: StageTimer = {
      id: row.id,
      lesson_id: row.lesson_id,
      stage_index: row.stage_index,
      duration_minutes: row.duration_minutes ?? 0,
      updated_at: row.updated_at,
    };
    if (!result[row.lesson_id]) result[row.lesson_id] = [];
    result[row.lesson_id].push(timer);
  }

  return result;
}

/**
 * Get the remaining seconds for a stage based on when it was started.
 * Returns -1 if unlimited (no timer set).
 */
export function getTimerRemaining(
  timer: StageTimer | undefined,
  startedAt: string | null,
): { seconds: number; isExpired: boolean; isUnlimited: boolean } {
  if (!timer || timer.duration_minutes <= 0) {
    return { seconds: -1, isExpired: false, isUnlimited: true };
  }

  if (!startedAt) {
    return { seconds: timer.duration_minutes * 60, isExpired: false, isUnlimited: false };
  }

  const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
  const total = timer.duration_minutes * 60;
  const remaining = Math.max(0, total - elapsed);

  return {
    seconds: Math.ceil(remaining),
    isExpired: remaining <= 0,
    isUnlimited: false,
  };
}
