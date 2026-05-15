import React, { useEffect, useState, useCallback } from 'react';
import {
  getStudentStageStatuses,
  getStageCompletionStats,
  forceAdvanceStage,
  getAdminStageSync,
  setAdminStageSync,
  type StudentStageStatus,
} from '../../utils/adminStageSync';
import { getStageTimers, getTimerRemaining, type StageTimer } from '../../utils/stageTimer';
import { lessons } from '../../data/lessons';
import { RefreshCw, SkipForward, Users, Clock, CheckCircle, Timer, Play } from 'lucide-react';

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  not_started: { bg: 'bg-gray-100', text: 'text-gray-400', border: 'border-gray-200', label: 'Belum Mulai' },
  in_progress: { bg: 'bg-[#628ECB]/10', text: 'text-[#628ECB]', border: 'border-[#628ECB]/30', label: 'Mengerjakan' },
  completed: { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]', border: 'border-[#10B981]/30', label: 'Selesai' },
};

const STAGE_COLORS = ['#628ECB', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#F59E0B', '#8B5CF6'];
const STAGE_NAMES = ['Constructivism', 'Inquiry', 'Questioning', 'Learning Community', 'Modeling', 'Reflection', 'Authentic Assessment'];

export function RealtimeMonitorSection() {
  const [lessonId, setLessonId] = useState('1');
  const [statuses, setStatuses] = useState<StudentStageStatus[]>([]);
  const [stageIndex, setStageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timers, setTimers] = useState<StageTimer[]>([]);
  const [timerRemaining, setTimerRemaining] = useState(-1);
  const [syncState, setSyncState] = useState<Awaited<ReturnType<typeof getAdminStageSync>>>(null);
  const [stats, setStats] = useState({ completed: 0, total: 0, inProgress: 0, notStarted: 0 });
  const [skipping, setSkipping] = useState(false);
  const [starting, setStarting] = useState(false);
  const [tick, setTick] = useState(0);

  const lesson = lessons[lessonId];

  // Auto-refresh every 5 seconds
  const refresh = useCallback(async () => {
    const [s, tm, sy] = await Promise.all([
      getStudentStageStatuses(lessonId, stageIndex),
      getStageTimers(lessonId),
      getAdminStageSync(lessonId),
    ]);
    setStatuses(s);
    setTimers(tm);
    setSyncState(sy);
    setLoading(false);
    setTick(t => t + 1);
  }, [lessonId, stageIndex]);

  useEffect(() => {
    setLoading(true);
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Compute stats
  useEffect(() => {
    const completed = statuses.filter(s => s.status === 'completed').length;
    const inProgress = statuses.filter(s => s.status === 'in_progress').length;
    const notStarted = statuses.filter(s => s.status === 'not_started').length;
    setStats({ completed, total: statuses.length, inProgress, notStarted });
  }, [statuses]);

  // Compute timer remaining
  useEffect(() => {
    const timer = timers.find(t => t.stage_index === stageIndex);
    const startedAt = syncState?.stage_started_at;
    if (timer && timer.duration_minutes > 0) {
      const { seconds, isExpired } = getTimerRemaining(timer, startedAt ?? null);
      if (isExpired) {
        setTimerRemaining(0);
      } else {
        setTimerRemaining(seconds);
      }
    } else {
      setTimerRemaining(-1);
    }
  }, [timers, stageIndex, syncState, tick]);

  // Real-time countdown tick
  useEffect(() => {
    if (timerRemaining <= 0) return;
    const t = setInterval(() => {
      setTimerRemaining(r => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [timerRemaining <= 0 ? 0 : 1]);

  const timer = timers.find(t => t.stage_index === stageIndex);
  const timerMinutes = timer?.duration_minutes ?? 0;
  const mins = Math.floor(Math.max(0, timerRemaining) / 60);
  const secs = Math.max(0, timerRemaining) % 60;
  const allDone = stats.total > 0 && stats.completed === stats.total;
  const timerExpired = timerRemaining === 0 && timerMinutes > 0;

  const handleForceAdvance = async () => {
    if (!window.confirm(`Lanjutkan semua siswa ke tahap berikutnya sekarang?`)) return;
    setSkipping(true);
    await forceAdvanceStage(lessonId);
    await refresh();
    setSkipping(false);
  };

  const handleStartStage = async (idx: number) => {
    setStarting(true);
    setStageIndex(idx);
    await setAdminStageSync(lessonId, idx);
    await refresh();
    setStarting(false);
  };

  const groupedByGroup = () => {
    const groups: Record<string, StudentStageStatus[]> = {};
    statuses.forEach(s => {
      const g = s.groupName || 'Belum Berkelompok';
      if (!groups[g]) groups[g] = [];
      groups[g].push(s);
    });
    return groups;
  };

  if (!lesson) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-[#395886]/40">Pilih pertemuan untuk memantau.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#628ECB] mb-2">Realtime Monitor</p>
          <h1 className="text-3xl font-bold text-[#395886] tracking-tight mb-1">Monitoring Aktivitas CTL Realtime</h1>
          <p className="text-sm text-[#395886]/60">Pantau progres seluruh siswa per tahapan secara langsung. Sinkronisasi otomatis setiap 5 detik.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={lessonId}
            onChange={e => { setLessonId(e.target.value); setStageIndex(0); }}
            className="px-4 py-2 text-sm border border-[#D5DEEF] rounded-xl bg-white text-[#395886] font-semibold"
          >
            {Object.keys(lessons).map(id => (
              <option key={id} value={id}>Pertemuan {id}: {lessons[id].topic}</option>
            ))}
          </select>
          <button
            onClick={refresh}
            className="p-2.5 rounded-xl border border-[#D5DEEF] bg-white hover:bg-[#F0F3FA] text-[#628ECB] transition-colors"
            title="Segarkan"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stage Selector */}
      <div className="bg-white rounded-2xl border border-[#D5DEEF] p-4 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40 mb-3">Pilih Tahapan</p>
        <div className="flex flex-wrap gap-2">
          {lesson.stages.map((stage, idx) => (
            <button
              key={idx}
              onClick={() => handleStartStage(idx)}
              disabled={starting}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2
                ${stageIndex === idx
                  ? 'text-white shadow-md'
                  : 'border-[#D5DEEF] bg-white text-[#395886]/60 hover:border-[#628ECB]/30 hover:text-[#395886]'
                }
                ${starting ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
              `}
              style={stageIndex === idx ? { backgroundColor: STAGE_COLORS[idx], borderColor: STAGE_COLORS[idx] } : {}}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 text-xs font-black">
                {idx + 1}
              </span>
              {STAGE_NAMES[idx] || stage.type}
            </button>
          ))}
        </div>
      </div>

      {/* Stats + Timer + Skip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Completion stats */}
        <div className="bg-white rounded-2xl border border-[#D5DEEF] p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40 mb-2">Status Kelas</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-[#10B981]">{stats.completed}</span>
            <span className="text-lg text-[#395886]/30">/ {stats.total}</span>
            <span className="text-xs font-bold text-[#395886]/50 mb-1">selesai</span>
          </div>
          <div className="mt-2 h-1.5 bg-[#D5DEEF] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10B981] rounded-full transition-all duration-500"
              style={{ width: `${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%` }}
            />
          </div>
          <div className="mt-2 flex gap-3 text-[10px] font-bold">
            <span className="text-[#628ECB]">{stats.inProgress} mengerjakan</span>
            <span className="text-gray-400">{stats.notStarted} belum</span>
          </div>
        </div>

        {/* Timer */}
        <div className="bg-white rounded-2xl border border-[#D5DEEF] p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40 mb-2">Timer Tahap</p>
          {timerMinutes > 0 ? (
            <div className={`flex items-center gap-2 ${timerRemaining <= 60 && timerRemaining > 0 ? 'text-amber-600' : timerRemaining === 0 ? 'text-red-600' : 'text-[#395886]'}`}>
              <Clock className={`w-5 h-5 ${timerRemaining <= 60 && timerRemaining > 0 ? 'animate-pulse' : ''}`} />
              <span className="text-2xl font-black font-mono">
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#395886]/40">
              <Timer className="w-5 h-5" />
              <span className="text-lg font-bold">Tanpa batas</span>
            </div>
          )}
          <p className="mt-1 text-[10px] text-[#395886]/40">
            {timerMinutes > 0 ? `Durasi: ${timerMinutes} menit` : 'Timer belum diatur'}
            {timerExpired && <span className="ml-2 text-red-500 font-bold">⏰ WAKTU HABIS</span>}
          </p>
        </div>

        {/* Skip button */}
        <div className="bg-white rounded-2xl border border-[#D5DEEF] p-4 shadow-sm flex flex-col justify-center">
          <button
            onClick={handleForceAdvance}
            disabled={skipping || stats.total === 0}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all
              ${allDone || timerExpired
                ? 'bg-[#10B981] text-white shadow-md hover:bg-[#059669]'
                : 'bg-[#F59E0B] text-white shadow-md hover:bg-[#D97706]'
              }
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {skipping ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <SkipForward className="w-4 h-4" />
            )}
            Skip & Lanjut Tahap
          </button>
          <p className="mt-1.5 text-[9px] text-center text-[#395886]/40">
            {allDone ? 'Semua siswa sudah selesai' : `${stats.completed}/${stats.total} selesai — tetap bisa skip`}
          </p>
        </div>

        {/* Quick info */}
        <div className="bg-white rounded-2xl border border-[#D5DEEF] p-4 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 text-[#395886]">
            <Users className="w-5 h-5 text-[#628ECB]" />
            <span className="text-lg font-bold">{stats.total} siswa</span>
          </div>
          <p className="mt-1 text-[10px] text-[#395886]/40">
            {lesson.title} — {lesson.topic}
          </p>
        </div>
      </div>

      {/* Student Grid */}
      <div className="bg-white rounded-2xl border border-[#D5DEEF] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#D5DEEF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#395886]">Status Siswa — {STAGE_NAMES[stageIndex] || `Tahap ${stageIndex + 1}`}</h3>
            <span className="text-xs text-[#395886]/40">({statuses.length} siswa)</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-300" /> Belum</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#628ECB]" /> Proses</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Selesai</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-6 h-6 text-[#628ECB] animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFD] text-left">
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[#395886]/50">No</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[#395886]/50">Nama Siswa</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[#395886]/50">Kelas</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[#395886]/50">Kelompok</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[#395886]/50 text-center">Status</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[#395886]/50 text-center">Progress</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-[#395886]/50 text-center">Percobaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5DEEF]">
                {Object.entries(groupedByGroup()).map(([groupName, students]) => (
                  <React.Fragment key={groupName}>
                    <tr className="bg-[#F0F3FA]/50">
                      <td colSpan={7} className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-[#628ECB]">
                        <Users className="w-3 h-3 inline mr-1.5" />
                        {groupName}
                        <span className="ml-2 text-[#395886]/40 font-normal normal-case">
                          ({students.filter(s => s.status === 'completed').length}/{students.length} selesai)
                        </span>
                      </td>
                    </tr>
                    {students.map((student, i) => {
                      const status = STATUS_COLORS[student.status] || STATUS_COLORS.not_started;
                      return (
                        <tr key={student.userId} className="hover:bg-[#F8FAFD] transition-colors">
                          <td className="px-5 py-2.5 text-xs text-[#395886]/40">{i + 1}</td>
                          <td className="px-5 py-2.5">
                            <p className="font-semibold text-[#395886] text-xs">{student.userName}</p>
                            <p className="text-[10px] text-[#395886]/40">{student.userNis}</p>
                          </td>
                          <td className="px-5 py-2.5 text-xs text-[#395886]/60">{student.userClass}</td>
                          <td className="px-5 py-2.5 text-xs text-[#395886]/60">{student.groupName || '—'}</td>
                          <td className="px-5 py-2.5 text-center">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${status.bg} ${status.text} border ${status.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'in_progress' ? 'bg-[#628ECB] animate-pulse' : student.status === 'completed' ? 'bg-[#10B981]' : 'bg-gray-300'}`} />
                              {status.label}
                            </span>
                          </td>
                          <td className="px-5 py-2.5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 bg-[#D5DEEF] rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${student.status === 'completed' ? 'bg-[#10B981]' : 'bg-[#628ECB]'}`}
                                  style={{ width: `${student.progressPercent}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-[#395886]/60 w-7">{student.progressPercent}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-2.5 text-center">
                            <span className={`text-xs font-bold ${student.totalAttempts > 0 ? 'text-[#628ECB]' : 'text-[#395886]/25'}`}>
                              {student.totalAttempts > 0 ? `${student.totalAttempts}×` : '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
                {statuses.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-[#395886]/35">
                      Belum ada data siswa untuk tahap ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 py-3 bg-white rounded-2xl border border-[#D5DEEF] shadow-sm text-[10px] text-[#395886]/50">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300" /> Abu-abu: Belum mulai</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#628ECB]" /> Biru: Sedang mengerjakan</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10B981]" /> Hijau: Selesai</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Merah: Waktu habis/belum submit</span>
      </div>
    </div>
  );
}
