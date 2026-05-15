import { useEffect, useRef, useState, useCallback } from 'react';
import { getStageTimers, getTimerRemaining, type StageTimer } from '../utils/stageTimer';
import {
  getAdminStageSync,
  clearForceAdvance,
  type AdminStageSync,
} from '../utils/adminStageSync';

interface GlobalStageSyncState {
  /** Whether the global sync is loaded */
  loaded: boolean;
  /** The admin-controlled global sync state */
  sync: AdminStageSync | null;
  /** The stage timer for the current stage */
  timer: StageTimer | undefined;
  /** Remaining seconds (-1 = unlimited) */
  timerRemaining: number;
  /** Whether the timer has expired */
  timerExpired: boolean;
  /** Whether force-advance was triggered by admin */
  forceAdvanced: boolean;
  /** Whether student should show "waiting" screen */
  shouldWait: boolean;
  /** Manually trigger a refresh of sync state */
  refresh: () => void;
  /** Called by student when they detect force-advance and are advancing */
  acknowledgeAdvance: () => void;
}

const POLL_INTERVAL_MS = 3000;

export function useGlobalStageSync(
  lessonId: string,
  stageIndex: number,
  isStageCompleted: boolean,
): GlobalStageSyncState {
  const [sync, setSync] = useState<AdminStageSync | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [timer, setTimer] = useState<StageTimer | undefined>();
  const [timerRemaining, setTimerRemaining] = useState(-1);
  const [timerExpired, setTimerExpired] = useState(false);
  const [forceAdvanced, setForceAdvanced] = useState(false);
  const stageCompletedRef = useRef(isStageCompleted);
  stageCompletedRef.current = isStageCompleted;

  const refresh = useCallback(async () => {
    const s = await getAdminStageSync(lessonId);
    setSync(s);
    setLoaded(true);
  }, [lessonId]);

  // Load timers
  useEffect(() => {
    getStageTimers(lessonId).then(timers => {
      const t = timers.find(tm => tm.stage_index === stageIndex);
      setTimer(t);
    });
  }, [lessonId, stageIndex]);

  // Initial load + polling
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  // Compute timer remaining
  useEffect(() => {
    if (!timer) {
      setTimerRemaining(-1);
      setTimerExpired(false);
      return;
    }

    const updateTimer = () => {
      // Use the admin sync started_at if available, else fallback to local
      const startedAt = sync?.stage_started_at;
      const { seconds, isExpired } = getTimerRemaining(timer, startedAt ?? null);

      if (isExpired && !timerExpired) {
        setTimerExpired(true);
        setTimerRemaining(0);
      } else if (!isExpired) {
        setTimerRemaining(seconds);
      }
    };

    updateTimer();
    const t = setInterval(updateTimer, 1000);
    return () => clearInterval(t);
  }, [timer, sync?.stage_started_at, timerExpired]);

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

  // Should wait: student completed but timer still running OR force_advance not yet
  // AND not all students have advanced
  const shouldWait =
    isStageCompleted &&
    sync?.status !== 'advanced' &&
    !timerExpired &&
    !forceAdvanced &&
    sync?.current_stage_index === stageIndex;

  return {
    loaded,
    sync,
    timer,
    timerRemaining,
    timerExpired,
    forceAdvanced,
    shouldWait,
    refresh,
    acknowledgeAdvance,
  };
}
