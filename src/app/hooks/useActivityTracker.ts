import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getCurrentUser } from '../utils/auth';
import {
  completeActivitySession,
  getCurrentSession,
  trackActivityEvent,
  upsertActivitySnapshot,
  defaultSession,
  type CTLActivitySession,
  type CTLActivityStatus,
  type CTLStageType,
} from '../utils/activityTracking';

interface TrackerOptions {
  lessonId: string;
  stageIndex: number;
  stageType: CTLStageType;
}

const SNAPSHOT_DEBOUNCE_MS = 1200;

export function useActivityTracker({ lessonId, stageIndex, stageType }: TrackerOptions) {
  const user = useMemo(() => getCurrentUser(), []);
  const [session, setSession] = useState<CTLActivitySession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const timerStartedRef = useRef<number>(Date.now());
  const pendingSnapshotRef = useRef<{
    snapshot: Record<string, any>;
    options?: { progressPercent?: number; status?: CTLActivityStatus; finalAnswer?: any; completed?: boolean };
  } | null>(null);
  const snapshotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSnapshotKeyRef = useRef<string>('');

  useEffect(() => {
    async function load() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await getCurrentSession(user.id, lessonId, stageIndex, stageType);
        setSession(data);
        if (data.latestSnapshot) {
          lastSnapshotKeyRef.current = JSON.stringify({
            snapshot: data.latestSnapshot,
            progressPercent: data.progressPercent,
            status: data.status,
            completed: data.status === 'completed',
          });
        }
        setIsLoading(false);
        void trackEvent('stage_opened', { stageType });
      } catch (err) {
        console.error('[useActivityTracker] load failed:', err);
        // Set default session so UI can render
        setSession(defaultSession(user.id, lessonId, stageIndex, stageType));
        setIsLoading(false);
      }
    }
    load();
  }, [lessonId, stageIndex, stageType, user?.id]);

  const flushSnapshot = useCallback(async () => {
    if (!user?.id || !pendingSnapshotRef.current) return;
    const payload = pendingSnapshotRef.current;
    const nextKey = JSON.stringify({
      snapshot: payload.snapshot,
      progressPercent: payload.options?.progressPercent,
      status: payload.options?.status,
      completed: payload.options?.completed,
    });

    if (lastSnapshotKeyRef.current === nextKey) {
      pendingSnapshotRef.current = null;
      return;
    }

    pendingSnapshotRef.current = null;
    lastSnapshotKeyRef.current = nextKey;

    await upsertActivitySnapshot({
      userId: user.id,
      lessonId,
      stageIndex,
      stageType,
      snapshot: payload.snapshot,
      progressPercent: payload.options?.progressPercent,
      status: payload.options?.status,
      finalAnswer: payload.options?.finalAnswer,
      completed: payload.options?.completed,
    });
  }, [lessonId, stageIndex, stageType, user?.id]);

  const saveSnapshot = useCallback(async (
    snapshot: Record<string, any>,
    options?: { progressPercent?: number; status?: CTLActivityStatus; finalAnswer?: any; completed?: boolean },
  ) => {
    if (!user?.id || isLoading) return;
    pendingSnapshotRef.current = { snapshot, options };
    if (snapshotTimerRef.current) clearTimeout(snapshotTimerRef.current);
    snapshotTimerRef.current = setTimeout(() => {
      snapshotTimerRef.current = null;
      void flushSnapshot();
    }, SNAPSHOT_DEBOUNCE_MS);
  }, [flushSnapshot, isLoading, user?.id]);

  const trackEvent = useCallback(async (
    eventType: string,
    eventData?: Record<string, any>,
    options?: {
      isCorrect?: boolean;
      errorCount?: number;
      attemptDelta?: number;
      progressPercent?: number;
    },
  ) => {
    if (!user?.id) return;
    await trackActivityEvent({
      userId: user.id,
      lessonId,
      stageIndex,
      stageType,
      eventType,
      eventData,
      isCorrect: options?.isCorrect,
      errorCount: options?.errorCount,
      attemptDelta: options?.attemptDelta,
      progressPercent: options?.progressPercent,
    });
  }, [lessonId, stageIndex, stageType, user?.id]);

  const complete = useCallback(async (finalAnswer: any, latestSnapshot?: Record<string, any>) => {
    if (!user?.id) return;
    if (snapshotTimerRef.current) {
      clearTimeout(snapshotTimerRef.current);
      snapshotTimerRef.current = null;
    }
    pendingSnapshotRef.current = null;
    await completeActivitySession({
      userId: user.id,
      lessonId,
      stageIndex,
      stageType,
      finalAnswer,
      latestSnapshot,
    });
  }, [lessonId, stageIndex, stageType, user?.id]);

  // Force immediate save (skip debounce) — use for critical state changes like phase transitions
  const saveImmediate = useCallback(async (
    snapshot: Record<string, any>,
    options?: { progressPercent?: number; status?: CTLActivityStatus; finalAnswer?: any; completed?: boolean },
  ) => {
    if (!user?.id || isLoading) return;
    if (snapshotTimerRef.current) {
      clearTimeout(snapshotTimerRef.current);
      snapshotTimerRef.current = null;
    }
    pendingSnapshotRef.current = null;
    await upsertActivitySnapshot({
      userId: user.id,
      lessonId,
      stageIndex,
      stageType,
      snapshot,
      progressPercent: options?.progressPercent,
      status: options?.status,
      finalAnswer: options?.finalAnswer,
      completed: options?.completed,
    });
  }, [lessonId, stageIndex, stageType, user?.id, isLoading]);

  useEffect(() => {
    return () => {
      if (snapshotTimerRef.current) {
        clearTimeout(snapshotTimerRef.current);
        snapshotTimerRef.current = null;
      }
      if (pendingSnapshotRef.current) {
        void flushSnapshot();
      }
      const totalDurationSec = Math.max(1, Math.round((Date.now() - timerStartedRef.current) / 1000));
      void trackEvent('stage_closed', { totalDurationSec });
    };
  }, [flushSnapshot, trackEvent]);

  return useMemo(() => ({
    user,
    session,
    isLoading,
    saveSnapshot,
    saveImmediate,
    trackEvent,
    complete,
  }), [complete, isLoading, saveImmediate, saveSnapshot, session, trackEvent, user]);
}

