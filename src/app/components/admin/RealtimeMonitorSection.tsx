import React, { useEffect, useState, useCallback } from 'react';
import {
  getStudentStageStatuses,
  startSession,
  pauseSession,
  resumeSession,
  skipToNextStage,
  resetCurrentStage,
  getAdminStageSync,
  calcTimerRemaining,
  clearSyncCache,
  type StudentStageStatus,
  type AdminStageSync,
} from '../../utils/adminStageSync';
import { getStageTimers } from '../../utils/stageTimer';
import { lessons } from '../../data/lessons';
import { RefreshCw, SkipForward, Users, Clock, Timer, Filter, Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { getAllLessonSessionsDetailed, type AdminDetailedSession } from '../../utils/activityTracking';

const STAGE_LABELS = ['Constructivism', 'Inquiry', 'Questioning', 'Learning Com.', 'Modeling', 'Reflection', 'Assessment'];

function extractConsistencySummary(session: AdminDetailedSession, lessonId: string): string {
  const snap = session.latestSnapshot;
  const answer = session.finalAnswer;
  switch (session.stageType) {
    case 'constructivism': {
      const fa = snap?.finalAnswer ?? {};
      const parts: string[] = [];
      if (fa.essay1 ?? answer?.essay1) parts.push('Esai 1 ✓');
      if (fa.essay2 ?? answer?.essay2) parts.push('Esai 2 ✓');
      const sel = fa.selectedOption ?? answer?.selectedOption;
      const ok = fa.isCorrect ?? answer?.isCorrect;
      if (sel) parts.push(`Pilihan: ${sel} (${ok ? 'Benar' : 'Salah'})`);
      return parts.join(' · ') || '—';
    }
    case 'inquiry': {
      const parts: string[] = [];
      if (snap?.flowData ?? answer?.flowData) parts.push('Alur ✓');
      if (snap?.analogyData ?? answer?.analogyData) parts.push('Analogi ✓');
      const gd = snap?.groupData ?? answer?.groupData;
      if (gd) parts.push(`Pengelompokan ✓${gd.correctCount !== undefined ? ` (${gd.correctCount}/${gd.total ?? '?'} benar)` : ''}`);
      if (snap?.matchingData ?? answer?.matchingData) parts.push('Pencocokan ✓');
      return parts.join(' · ') || '—';
    }
    case 'questioning': {
      const isL1 = lessonId === '1' || snap?.matchPlacements !== undefined;
      if (isL1) {
        const mp = snap?.matchPlacements as Record<string, string> | undefined;
        if (!mp || !Object.keys(mp).length) return '—';
        const validated = snap?.matchValidated;
        const correct = Object.entries(mp).filter(([k, v]) => k === v).length;
        return validated ? `Layer matching: ${correct}/${Object.keys(mp).length} benar` : `${Object.keys(mp).length} layer dipasangkan`;
      }
      const selId = snap?.selectedId ?? answer?.selectedId;
      if (!selId) return '—';
      return `Identifikasi field TCP: ${answer?.isCorrect ? 'Benar' : 'Salah'}`;
    }
    case 'learning-community': {
      const parts: string[] = [];
      if (snap?.module1Data ?? answer?.module1Data) parts.push('Diskusi Modul 1 ✓');
      if (snap?.module2Data ?? answer?.module2Data) parts.push('Diskusi Modul 2 ✓');
      return parts.join(' · ') || '—';
    }
    case 'modeling': {
      const steps = (snap?.completedSteps ?? answer?.completedSteps) as number[] | undefined;
      return steps?.length ? `${steps.length} langkah simulasi selesai` : '—';
    }
    case 'reflection': {
      const parts: string[] = [];
      const md = snap?.mapData ?? answer?.mapData;
      if (md?.correctCount !== undefined) parts.push(`Peta konsep: ${md.correctCount}/${md.totalConnections ?? md.total ?? '?'} benar`);
      else if (md) parts.push('Peta konsep ✓');
      const ev = snap?.evaluationData ?? answer?.evaluationData;
      if (ev && Object.keys(ev).length) {
        const checked = Object.values(ev).filter(Boolean).length;
        parts.push(`Evaluasi diri: ${checked}/${Object.keys(ev).length}`);
      }
      return parts.join(' · ') || '—';
    }
    case 'authentic-assessment': {
      const ic = snap?.initialChoice ?? answer?.initialChoice;
      const fc = snap?.followUpChoice ?? answer?.followUpChoice;
      const parts: string[] = [];
      if (ic) parts.push(`Diagnosis${answer?.isOptimal !== undefined ? `: ${answer.isOptimal ? 'Optimal' : 'Tidak optimal'}` : ' ✓'}`);
      if (fc) parts.push('Tindak lanjut ✓');
      return parts.join(' · ') || '—';
    }
    default: return '—';
  }
}

function extractArgumentText(session: AdminDetailedSession): string | null {
  const snap = session.latestSnapshot;
  const answer = session.finalAnswer;
  switch (session.stageType) {
    case 'constructivism': {
      const fa = snap?.finalAnswer ?? {};
      return fa.essay1 ?? fa.essay2 ?? answer?.essay1 ?? answer?.essay2 ?? null;
    }
    case 'inquiry':
      return snap?.essay1Text ?? snap?.reflection1 ?? answer?.reflection1 ?? answer?.essay1 ?? null;
    case 'questioning':
      return snap?.essay ?? answer?.justification ?? null;
    case 'learning-community': {
      const m1 = snap?.module1Data ?? answer?.module1Data;
      const m2 = snap?.module2Data ?? answer?.module2Data;
      return m1?.bestArgument?.argument ?? m1?.discussions?.[0]?.argument
        ?? m2?.bestArgument?.argument ?? m2?.discussions?.[0]?.argument ?? null;
    }
    case 'modeling':
      return snap?.essay ?? answer?.essay ?? answer?.argument ?? null;
    case 'reflection':
      return snap?.argumentText ?? answer?.argumentText ?? null;
    case 'authentic-assessment':
      return snap?.initialReason ?? answer?.initialReason ?? null;
    default: return null;
  }
}

function extractConclusionText(session: AdminDetailedSession): string | null {
  const snap = session.latestSnapshot;
  const answer = session.finalAnswer;
  switch (session.stageType) {
    case 'constructivism': {
      const fa = snap?.finalAnswer ?? {};
      return fa.conclusion ?? answer?.conclusion ?? answer?.summary ?? null;
    }
    case 'inquiry':
      return snap?.conclusionText ?? answer?.conclusion ?? answer?.summary ?? null;
    case 'questioning':
      return snap?.conclusionText ?? answer?.conclusion ?? null;
    case 'learning-community':
      return answer?.finalConclusion ?? snap?.finalConclusion ?? null;
    case 'modeling':
      return snap?.conclusionText ?? answer?.conclusion ?? null;
    case 'reflection':
      return snap?.conclusionText ?? answer?.conclusionText ?? answer?.conclusion ?? null;
    case 'authentic-assessment':
      return snap?.followUpReason ?? answer?.followUpReason ?? null;
    default: return null;
  }
}

export function RealtimeMonitorSection() {
  const [lessonId, setLessonId] = useState('1');
  const [allStatuses, setAllStatuses] = useState<Record<number, StudentStageStatus[]>>({});
  const [loading, setLoading] = useState(true);
  const [syncState, setSyncState] = useState<Awaited<ReturnType<typeof getAdminStageSync>>>(null);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timerRemaining, setTimerRemaining] = useState(-1);
  const [timerExpired, setTimerExpired] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isUnlimited, setIsUnlimited] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterGroup, setFilterGroup] = useState('all');
  const [detailedSessions, setDetailedSessions] = useState<AdminDetailedSession[]>([]);
  const [detailStageIndex, setDetailStageIndex] = useState(0);

  const lesson = lessons[lessonId];
  const stageCount = lesson?.stages?.length ?? 7;

  const refresh = useCallback(async () => {
    const sync = await getAdminStageSync(lessonId);
    setSyncState(sync);

    const timers = await getStageTimers(lessonId);
    const stageIdx = sync?.current_stage_index ?? 0;
    const tm = timers.find(t => t.stage_index === stageIdx);
    const mins = tm?.duration_minutes ?? 0;
    setTimerMinutes(mins);

    if (sync && sync.session_status !== 'idle') {
      const { seconds, isExpired, isUnlimited: unlimited, isPaused: paused } = calcTimerRemaining(sync, mins);
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

    const stagePromises = Array.from({ length: stageCount }, (_, i) =>
      getStudentStageStatuses(lessonId, i),
    );
    const results = await Promise.all(stagePromises);
    const statusMap: Record<number, StudentStageStatus[]> = {};
    results.forEach((r, i) => { statusMap[i] = r; });
    setAllStatuses(statusMap);
    getAllLessonSessionsDetailed(lessonId).then(setDetailedSessions);
    setLoading(false);
  }, [lessonId, stageCount]);

  useEffect(() => {
    setLoading(true);
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  // ── Realtime subscription (instant sync from DB changes) ──
  useEffect(() => {
    const channel = supabase
      .channel(`admin_monitor:${lessonId}`)
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
            const sync = await getAdminStageSync(lessonId);
            setSyncState(sync);

            const timers = await getStageTimers(lessonId);
            const stageIdx = sync?.current_stage_index ?? 0;
            const tm = timers.find(t => t.stage_index === stageIdx);
            const mins = tm?.duration_minutes ?? 0;
            setTimerMinutes(mins);

            if (sync && sync.session_status !== 'idle') {
              const { seconds, isExpired, isUnlimited: unlimited, isPaused: paused } = calcTimerRemaining(sync, mins);
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
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lessonId]);

  const isIdle = !syncState || syncState.session_status === 'idle';
  const isCompleted = (syncState?.status as string) === 'completed';
  const currentSyncStage = syncState?.current_stage_index ?? 0;

  // Local countdown tick
  useEffect(() => {
    if (isIdle || isPaused || isUnlimited || timerRemaining <= 0) return;
    const t = setInterval(() => setTimerRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [isIdle, isPaused, isUnlimited, timerRemaining]);

  const doAction = async (label: string, fn: () => Promise<void>) => {
    setActionLoading(label);
    await fn();
    await refresh();
    setActionLoading(null);
  };

  const mins = Math.floor(Math.max(0, timerRemaining) / 60);
  const secs = Math.max(0, timerRemaining) % 60;

  // Flat, stable, alphabetically sorted
  const stage0 = allStatuses[0] ?? [];
  const allStudents = [...stage0].sort((a, b) => a.userName.localeCompare(b.userName, 'id'));
  const groupNames = [...new Set(allStudents.map(s => s.groupName || 'Belum Berkelompok'))].sort();
  const filteredStudents = filterGroup === 'all'
    ? allStudents
    : allStudents.filter(s => (s.groupName || 'Belum Berkelompok') === filterGroup);

  const stageStats = Array.from({ length: stageCount }, (_, i) => {
    const ss = allStatuses[i] ?? [];
    return {
      completed: ss.filter(s => s.status === 'completed').length,
      inProgress: ss.filter(s => s.status === 'in_progress').length,
      notStarted: ss.filter(s => s.status === 'not_started').length,
      total: ss.length,
    };
  });

  const totalCompleted = stageStats[currentSyncStage]?.completed ?? 0;
  const totalStudents = allStudents.length;

  const isLastStage = currentSyncStage >= stageCount - 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#628ECB] mb-2">Realtime Monitor</p>
          <h1 className="text-3xl font-bold text-[#395886] tracking-tight mb-1">Monitoring Aktivitas CTL Realtime</h1>
          <p className="text-sm text-[#395886]/60">Kontrol sesi kelas, timer, dan pantau progres seluruh siswa.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {Object.keys(lessons).map(id => (
              <button
                key={id}
                onClick={() => setLessonId(id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  lessonId === id
                    ? 'bg-[#395886] text-white shadow-sm'
                    : 'bg-white border border-[#D5DEEF] text-[#395886]/60 hover:text-[#395886] hover:border-[#628ECB]'
                }`}
              >
                Pertemuan {id}
              </button>
            ))}
          </div>
          <button onClick={refresh}
            className="p-2.5 rounded-xl border border-[#D5DEEF] bg-white hover:bg-[#F0F3FA] text-[#628ECB] transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Session Controls ── */}
      <div className="bg-white rounded-2xl border border-[#D5DEEF] p-5 shadow-sm">
        {isCompleted ? (
          /* Completed state — pertemuan selesai */
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10B981]/10 text-[#10B981] text-sm font-bold">
              <CheckCircle className="w-4 h-4" />
              Sudah selesai untuk pertemuan ini
            </div>
            <button
              onClick={() => {
                if (window.confirm('Reset seluruh sesi ke awal?\n\nSemua jawaban siswa TETAP TERSIMPAN. Hanya sesi yang diulang dari Constructivism.'))
                  doAction('reset', () => resetCurrentStage(lessonId));
              }}
              disabled={actionLoading !== null}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-[11px] font-bold text-[#395886]/40 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all disabled:opacity-50"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Sesi
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
          {/* Start / Pause / Resume */}
          {isIdle ? (
            <button
              onClick={() => doAction('start', () => startSession(lessonId))}
              disabled={actionLoading !== null}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-[#10B981] text-white shadow-md hover:bg-[#059669] transition-all disabled:opacity-50"
            >
              {actionLoading === 'start' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Mulai Sesi
            </button>
          ) : isPaused ? (
            <button
              onClick={() => doAction('resume', () => resumeSession(lessonId))}
              disabled={actionLoading !== null}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-[#10B981] text-white shadow-md hover:bg-[#059669] transition-all disabled:opacity-50"
            >
              {actionLoading === 'resume' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Lanjutkan Sesi
            </button>
          ) : (
            <button
              onClick={() => doAction('pause', () => pauseSession(lessonId))}
              disabled={actionLoading !== null}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-[#F59E0B] text-white shadow-md hover:bg-[#D97706] transition-all disabled:opacity-50"
            >
              {actionLoading === 'pause' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4" />}
              Jeda Waktu
            </button>
          )}

          {/* Skip / Selesaikan stage */}
          {!isIdle && (
            isLastStage ? (
              <button
                onClick={() => {
                  if (window.confirm('Selesaikan Authentic Assessment dan arahkan seluruh siswa ke Posttest?'))
                    doAction('skip', () => skipToNextStage(lessonId, stageCount));
                }}
                disabled={actionLoading !== null}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-[#10B981] text-white shadow-md hover:bg-[#059669] transition-all disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Selesaikan Aktivitas
              </button>
            ) : (
              <button
                onClick={() => {
                  if (window.confirm(`Lanjut ke ${STAGE_LABELS[currentSyncStage + 1]}?`))
                    doAction('skip', () => skipToNextStage(lessonId, stageCount));
                }}
                disabled={actionLoading !== null}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-[#EC4899] text-white shadow-md hover:bg-[#DB2777] transition-all disabled:opacity-50"
              >
                <SkipForward className="w-4 h-4" />
                Skip Tahapan
              </button>
            )
          )}

          {/* Status indicator + compact reset */}
          <div className="ml-auto flex items-center gap-2">
            {/* Compact reset button — only when session active/paused */}
            {!isIdle && (
              <button
                onClick={() => {
                  if (window.confirm('Reset seluruh sesi ke awal?\n\nSemua jawaban siswa TETAP TERSIMPAN. Sesi akan kembali ke Constructivism.'))
                    doAction('reset', () => resetCurrentStage(lessonId));
                }}
                disabled={actionLoading !== null}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-[#395886]/40 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all disabled:opacity-50"
                title="Reset tahapan ke awal"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
            {isIdle ? (
              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold text-gray-500">Sesi belum dimulai</span>
            ) : isPaused ? (
              <span className="rounded-full bg-amber-100 px-3 py-1.5 text-[10px] font-bold text-amber-700">Sesi dijeda</span>
            ) : (
              <span className="rounded-full bg-[#10B981]/10 px-3 py-1.5 text-[10px] font-bold text-[#10B981]">Sesi berjalan</span>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-2xl border border-[#D5DEEF] p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40 mb-2">Status Kelas</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-[#10B981]">{totalCompleted}</span>
            <span className="text-lg text-[#395886]/30">/ {totalStudents}</span>
          </div>
          <div className="mt-2 h-1.5 bg-[#D5DEEF] rounded-full overflow-hidden">
            <div className="h-full bg-[#10B981] rounded-full transition-all"
              style={{ width: `${totalStudents > 0 ? Math.round((totalCompleted / totalStudents) * 100) : 0}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#D5DEEF] p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40 mb-2">
            Timer — {STAGE_LABELS[currentSyncStage] || `Tahap ${currentSyncStage + 1}`}
          </p>
          {isIdle ? (
            <span className="text-lg text-[#395886]/30">—</span>
          ) : isPaused ? (
            <div className="flex items-center gap-2 text-amber-600">
              <Pause className="w-5 h-5" />
              <span className="text-2xl font-black font-mono">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
              <span className="text-[10px] font-bold">(dijeda)</span>
            </div>
          ) : isUnlimited ? (
            <div className="flex items-center gap-2 text-[#395886]/40">
              <Timer className="w-5 h-5" />
              <span className="text-lg font-bold">Tanpa batas</span>
            </div>
          ) : (
            <div className={`flex items-center gap-2 ${timerRemaining <= 60 ? 'text-amber-600' : timerExpired ? 'text-red-600' : 'text-[#395886]'}`}>
              <Clock className={`w-5 h-5 ${timerRemaining <= 60 && !timerExpired ? 'animate-pulse' : ''}`} />
              <span className="text-2xl font-black font-mono">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
            </div>
          )}
          <p className="mt-1 text-[10px] text-[#395886]/40">
            {!isUnlimited && `Durasi: ${timerMinutes} menit`}
            {timerExpired && <span className="ml-2 text-red-500 font-bold">⏰ HABIS</span>}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#D5DEEF] p-4 shadow-sm flex items-center justify-center">
          <div className="text-center">
            <Users className="w-6 h-6 text-[#628ECB] mx-auto mb-1" />
            <p className="text-lg font-bold text-[#395886]">{totalStudents} siswa</p>
            <p className="text-[10px] text-[#395886]/40">{lesson?.title} — {lesson?.topic}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#D5DEEF] p-4 shadow-sm flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-black text-[#628ECB]">{currentSyncStage + 1}/{stageCount}</div>
            <p className="text-[10px] text-[#395886]/40">Tahap aktif</p>
          </div>
        </div>
      </div>

      {/* Progress bar per stage */}
      <div className="bg-white rounded-2xl border border-[#D5DEEF] p-4 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40 mb-3">Progres Per Tahap</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Array.from({ length: stageCount }, (_, i) => {
            const s = stageStats[i];
            const pct = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
            const isActive = i === currentSyncStage;
            return (
              <div key={i} className={`rounded-xl border-2 p-3 text-center transition-all ${isActive ? 'border-[#628ECB] bg-[#628ECB]/5 shadow-sm' : 'border-[#D5DEEF] bg-[#F8FAFD]'}`}>
                <p className="text-[9px] font-black uppercase tracking-wider text-[#395886]/50 mb-1">{STAGE_LABELS[i]}</p>
                <p className={`text-lg font-black ${isActive ? 'text-[#628ECB]' : pct >= 100 ? 'text-[#10B981]' : 'text-[#395886]'}`}>{pct}%</p>
                <div className="mt-1.5 h-1 bg-[#D5DEEF] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-[#10B981]' : 'bg-[#628ECB]'}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1 text-[8px] text-[#395886]/40">{s.completed}/{s.total}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student grid */}
      <div className="bg-white rounded-2xl border border-[#D5DEEF] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#D5DEEF] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#395886]">Status Seluruh Siswa</h3>
            <span className="text-xs text-[#395886]/40">({filteredStudents.length} siswa)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3 h-3 text-[#395886]/40" />
              <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
                className="text-[10px] font-bold border border-[#D5DEEF] rounded-lg px-2.5 py-1.5 bg-white text-[#395886] outline-none focus:ring-2 focus:ring-[#628ECB]/20">
                <option value="all">Semua Kelompok</option>
                {groupNames.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 text-[9px] font-bold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300" /> Belum</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#628ECB]" /> Proses</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10B981]" /> Selesai</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><RefreshCw className="w-6 h-6 text-[#628ECB] animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#F8FAFD]">
                  <th className="sticky left-0 z-10 bg-[#F8FAFD] px-1 py-2.5 text-center text-[10px] font-black uppercase tracking-widest text-[#395886]/50 w-[40px]">No</th>
                  <th className="sticky left-[40px] z-10 bg-[#F8FAFD] px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-[#395886]/50 min-w-[150px]">Nama</th>
                  <th className="px-2 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-[#395886]/50 min-w-[60px]">Kelas</th>
                  <th className="px-2 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-[#395886]/50 min-w-[90px]">Kelompok</th>
                  {Array.from({ length: stageCount }, (_, i) => (
                    <th key={i} className="px-2 py-2.5 text-center text-[9px] font-black uppercase tracking-wider min-w-[64px]">
                      <span className={i === currentSyncStage ? 'text-[#628ECB]' : 'text-[#395886]/50'}>{STAGE_LABELS[i]?.split(' ')[0]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5DEEF]">
                {filteredStudents.map((student, rowIdx) => (
                  <tr key={student.userId} className="hover:bg-[#F8FAFD] transition-colors">
                    <td className="sticky left-0 z-10 bg-white px-1 py-2 text-center text-[10px] font-bold text-[#395886]/30 border-r border-[#D5DEEF]/50 w-[40px]">{rowIdx + 1}</td>
                    <td className="sticky left-[40px] z-10 bg-white px-3 py-2 border-r border-[#D5DEEF]/50">
                      <p className="font-semibold text-[#395886] truncate max-w-[140px]">{student.userName}</p>
                      <p className="text-[9px] text-[#395886]/40">{student.userNis}</p>
                    </td>
                    <td className="px-2 py-2 text-[10px] text-[#395886]/60">{student.userClass || '—'}</td>
                    <td className="px-2 py-2"><span className="inline-block rounded-full bg-[#628ECB]/8 px-2 py-0.5 text-[9px] font-bold text-[#628ECB]">{student.groupName || '—'}</span></td>
                    {Array.from({ length: stageCount }, (_, stageIdx) => {
                      const statuses = allStatuses[stageIdx] ?? [];
                      const st = statuses.find(s => s.userId === student.userId);
                      const status = st?.status ?? 'not_started';
                      const pct = st?.progressPercent ?? 0;
                      return (
                        <td key={stageIdx} className="px-1 py-2 text-center">
                          {status === 'completed' ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#10B981]/10 text-[#10B981] text-[11px] font-black">✓</span>
                          ) : status === 'in_progress' ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="w-2 h-2 rounded-full bg-[#628ECB] animate-pulse" />
                              <span className="text-[8px] font-bold text-[#628ECB]">{pct}%</span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-300 text-[11px] font-black">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {filteredStudents.length === 0 && !loading && (
                  <tr><td colSpan={4 + stageCount} className="px-5 py-12 text-center text-sm text-[#395886]/35">
                    {filterGroup !== 'all' ? `Tidak ada siswa di kelompok "${filterGroup}".` : 'Belum ada data.'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 px-5 py-3 bg-white rounded-2xl border border-[#D5DEEF] shadow-sm text-[9px] font-bold text-[#395886]/50">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300" /> Belum</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#628ECB]" /> Proses</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10B981]" /> Selesai</span>
        <span className="ml-auto flex items-center gap-1"><RefreshCw className="w-3 h-3 text-[#395886]/30" /> Auto-refresh 5 detik</span>
      </div>

      {/* ── Detail Logical Thinking Indicators ── */}
      <div className="bg-white rounded-2xl border border-[#D5DEEF] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#D5DEEF]">
          <h3 className="font-bold text-[#395886]">Detail Indikator Berpikir Logis</h3>
          <p className="text-xs text-[#395886]/50 mt-0.5">Keruntutan Berpikir · Kemampuan Berargumen · Penarikan Kesimpulan</p>
        </div>

        {/* Stage tab selector */}
        <div className="flex gap-0 overflow-x-auto border-b border-[#D5DEEF]">
          {STAGE_LABELS.map((label, i) => (
            <button
              key={i}
              onClick={() => setDetailStageIndex(i)}
              className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap border-b-2 -mb-px transition-colors flex-shrink-0 ${
                detailStageIndex === i
                  ? 'border-[#628ECB] text-[#628ECB] bg-[#F0F5FF]'
                  : 'border-transparent text-[#395886]/40 hover:text-[#395886]/70 hover:bg-[#F8FAFD]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Per-student rows */}
        <div className="divide-y divide-[#D5DEEF]">
          {(() => {
            const stageSessions = detailedSessions.filter(s => s.stageIndex === detailStageIndex);
            const studentNameMap = new Map(allStudents.map(s => [s.userId, s]));
            const sorted = [...stageSessions].sort((a, b) => {
              const na = studentNameMap.get(a.userId)?.userName ?? a.userId;
              const nb = studentNameMap.get(b.userId)?.userName ?? b.userId;
              return na.localeCompare(nb, 'id');
            });

            if (sorted.length === 0) {
              return (
                <div className="px-5 py-10 text-center text-sm text-[#395886]/35">
                  {loading ? 'Memuat data...' : 'Belum ada data aktivitas untuk tahap ini.'}
                </div>
              );
            }

            return sorted.map(session => {
              const info = studentNameMap.get(session.userId);
              const consistency = extractConsistencySummary(session, lessonId);
              const argument = extractArgumentText(session);
              const conclusion = extractConclusionText(session);

              return (
                <div key={session.userId} className="px-5 py-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#628ECB]/10 flex items-center justify-center text-[#628ECB] text-xs font-black shrink-0">
                      {(info?.userName ?? 'S')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#395886] truncate">{info?.userName ?? session.userId}</p>
                      <div className="flex items-center gap-2 text-[9px]">
                        <span className="text-[#395886]/40">{info?.groupName ?? '—'}</span>
                        <span className="text-[#395886]/20">·</span>
                        <span className={`font-bold ${
                          session.status === 'completed' ? 'text-[#10B981]'
                            : session.status === 'in_progress' ? 'text-[#628ECB]'
                            : 'text-[#395886]/30'
                        }`}>
                          {session.status === 'completed' ? 'Selesai' : session.status === 'in_progress' ? 'Sedang proses' : 'Belum dimulai'}
                        </span>
                        {session.totalAttempts > 0 && (
                          <>
                            <span className="text-[#395886]/20">·</span>
                            <span className="text-[#395886]/40">{session.totalAttempts} percobaan</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {/* Keruntutan Berpikir */}
                    <div className="rounded-xl border border-[#D5DEEF] overflow-hidden">
                      <div className="px-3 py-2 bg-[#628ECB]/5 border-b border-[#D5DEEF]">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#628ECB]">Keruntutan Berpikir</p>
                      </div>
                      <div className="px-3 py-2.5">
                        {consistency === '—'
                          ? <p className="text-xs text-[#395886]/30 italic">Belum ada data aktivitas</p>
                          : <p className="text-xs text-[#395886] leading-relaxed">{consistency}</p>
                        }
                      </div>
                    </div>

                    {/* Kemampuan Berargumen */}
                    <div className="rounded-xl border border-[#D5DEEF] overflow-hidden">
                      <div className="px-3 py-2 bg-[#10B981]/5 border-b border-[#D5DEEF]">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#10B981]">Kemampuan Berargumen</p>
                      </div>
                      <div className="px-3 py-2.5">
                        {argument
                          ? <p className="text-xs text-[#395886] leading-relaxed line-clamp-4">"{argument}"</p>
                          : <p className="text-xs text-[#395886]/30 italic">Belum ada argumen tertulis</p>
                        }
                      </div>
                    </div>

                    {/* Penarikan Kesimpulan */}
                    <div className="rounded-xl border border-[#D5DEEF] overflow-hidden">
                      <div className="px-3 py-2 bg-[#8B5CF6]/5 border-b border-[#D5DEEF]">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#8B5CF6]">Penarikan Kesimpulan</p>
                      </div>
                      <div className="px-3 py-2.5">
                        {conclusion
                          ? <p className="text-xs text-[#395886] leading-relaxed line-clamp-4">"{conclusion}"</p>
                          : <p className="text-xs text-[#395886]/30 italic">Belum ada kesimpulan tertulis</p>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}
