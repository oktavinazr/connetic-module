import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { getStageTimers } from '../utils/stageTimer';
import {
  getAdminStageSync,
  clearForceAdvance,
  calcTimerRemaining,
  clearSyncCache,
  type AdminStageSync,
} from '../utils/adminStageSync';

interface GlobalStageSyncState {
  loaded: boolean;
  sync: AdminStageSync | null;
  timerMinutes: number;
  timerRemaining: number;
  timerExpired: boolean;
  isPaused: boolean;
  isUnlimited: boolean;
  forceAdvanced: boolean;
  isIdle: boolean;
  shouldWait: boolean;
  wasReset: boolean;
  refresh: () => void;
  acknowledgeAdvance: () => void;
  clearReset: () => void;
}

export function useGlobalStageSync(
  lessonId: string,
  stageIndex: number,
  isStageCompleted: boolean,
): GlobalStageSyncState {
  const [sync, setSync] = useState<AdminStageSync | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timerRemaining, setTimerRemaining] = useState(-1);
  const [timerExpired, setTimerExpired] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isUnlimited, setIsUnlimited] = useState(true);
  const [forceAdvanced, setForceAdvanced] = useState(false);
  const [wasReset, setWasReset] = useState(false);
  const stageCompletedRef = useRef(isStageCompleted);
  stageCompletedRef.current = isStageCompleted;
  const prevStartedAtRef = useRef<string | null | undefined>(null);

  const isIdle = !sync || sync.session_status === 'idle';

  const applySync = useCallback((s: AdminStageSync | null, timersData?: any[]) => {
    setSync(s);

    const tm = timersData?.find((t: any) => t.stage_index === (s?.current_stage_index ?? stageIndex));
    const mins = tm?.duration_minutes ?? 0;
    setTimerMinutes(mins);

    if (s && s.session_status !== 'idle') {
      const { seconds, isExpired, isUnlimited: unlimited, isPaused: paused } = calcTimerRemaining(s, mins);
      setTimerRemaining(seconds);
      setTimerExpired(isExpired);
      setIsUnlimited(unlimited);
      setIsPaused(paused);
    } else {
      setTimerRemaining(-1);
      setTimerExpired(false);
      setIsUnlimited(true);
      setIsPaused(false);
    }

    setLoaded(true);

    if (
      prevStartedAtRef.current &&
      s?.stage_started_at &&
      s.stage_started_at !== prevStartedAtRef.current &&
      stageCompletedRef.current
    ) {
      setWasReset(true);
    }
    prevStartedAtRef.current = s?.stage_started_at;
  }, [stageIndex]);

  const refresh = useCallback(async () => {
    const [s, timers] = await Promise.all([
      getAdminStageSync(lessonId),
      getStageTimers(lessonId),
    ]);
    applySync(s, timers);
  }, [lessonId, applySync]);

  // ── Supabase Realtime subscription (instant sync) ──
  useEffect(() => {
    const channel = supabase
      .channel(`admin_stage_sync:${lessonId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_stage_sync',
          filter: `lesson_id=eq.${lessonId}`,
        },
        async (payload) => {
          const newData = payload.new as Record<string, any> | null;
          if (newData) {
            clearSyncCache(lessonId);
            const timers = await getStageTimers(lessonId);
            applySync({
              id: newData.id,
              lesson_id: newData.lesson_id,
              current_stage_index: newData.current_stage_index,
              stage_started_at: newData.stage_started_at,
              force_advance: newData.force_advance,
              force_advance_at: newData.force_advance_at,
              status: newData.status,
              session_status: newData.session_status,
              paused_at: newData.paused_at,
              total_paused_ms: newData.total_paused_ms,
              added_minutes: newData.added_minutes,
              updated_at: newData.updated_at,
            }, timers);
          }
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[realtime] admin_stage_sync:${lessonId} subscribed`);
        } else {
          console.warn(`[realtime] admin_stage_sync:${lessonId} status: ${status}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lessonId, applySync]);

  // Initial load + polling (fast fallback — 1s)
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Local countdown tick
  useEffect(() => {
    if (!loaded || isIdle || isPaused || isUnlimited || timerRemaining <= 0) return;
    const t = setInterval(() => {
      setTimerRemaining(r => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [loaded, isIdle, isPaused, isUnlimited, timerRemaining <= 0 ? 0 : 1]);

  useEffect(() => {
    if (timerRemaining === 0 && !isUnlimited) setTimerExpired(true);
  }, [timerRemaining, isUnlimited]);

  useEffect(() => {
    if (sync?.force_advance) setForceAdvanced(true);
  }, [sync?.force_advance]);

  const acknowledgeAdvance = useCallback(() => {
    setForceAdvanced(false);
    clearForceAdvance(lessonId);
  }, [lessonId]);

  const clearReset = useCallback(() => setWasReset(false), []);

  const shouldWait =
    isStageCompleted &&
    !isIdle &&
    sync?.session_status !== 'idle' &&
    sync?.status !== 'advanced' &&
    !forceAdvanced &&
    sync?.current_stage_index === stageIndex;

  return {
    loaded, sync,
    timerMinutes,
    timerRemaining, timerExpired, isPaused, isUnlimited,
    forceAdvanced, isIdle, shouldWait, wasReset,
    refresh, acknowledgeAdvance, clearReset,
  };
}
