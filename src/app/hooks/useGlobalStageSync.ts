import { useEffect, useRef, useState, useCallback } from 'react';
import { getStageTimers } from '../utils/stageTimer';
import {
  getAdminStageSync,
  clearForceAdvance,
  calcTimerRemaining,
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

const POLL_INTERVAL_MS = 1000;

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

  const refresh = useCallback(async () => {
    const [s, timers] = await Promise.all([
      getAdminStageSync(lessonId),
      getStageTimers(lessonId),
    ]);
    setSync(s);

    const tm = timers.find(t => t.stage_index === (s?.current_stage_index ?? stageIndex));
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

    // Detect reset: stage_started_at changed to a newer value while student was completed
    if (
      prevStartedAtRef.current &&
      s?.stage_started_at &&
      s.stage_started_at !== prevStartedAtRef.current &&
      stageCompletedRef.current
    ) {
      setWasReset(true);
    }
    prevStartedAtRef.current = s?.stage_started_at;
  }, [lessonId, stageIndex]);

  // Initial load + polling
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  // Local countdown tick between polls
  useEffect(() => {
    if (!loaded || isIdle || isPaused || isUnlimited || timerRemaining <= 0) return;
    const t = setInterval(() => {
      setTimerRemaining(r => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [loaded, isIdle, isPaused, isUnlimited, timerRemaining <= 0 ? 0 : 1]);

  // Detect expired
  useEffect(() => {
    if (timerRemaining === 0 && !isUnlimited) {
      setTimerExpired(true);
    }
  }, [timerRemaining, isUnlimited]);

  // Detect force-advance
  useEffect(() => {
    if (sync?.force_advance) {
      setForceAdvanced(true);
    }
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
