import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  CheckCircle, XCircle, ChevronDown, ChevronUp, ChevronRight,
  Clock, Download, Eye, Filter, Lightbulb, PenLine, Search,
  TrendingUp, Users, X, RefreshCw, Activity, Calendar, AlignLeft,
  BarChart2, Layers, BookOpen,
} from 'lucide-react';
import { lessons, globalPretest, globalPosttest } from '../../data/lessons';
import { CTL_META, StageAnswerDetail } from './StageDetail';
import type { CTLActivitySession } from '../../utils/activityTracking';

// ── Shared types (exported for AdminPage) ─────────────────────────────────────

export interface LessonSummary {
  lessonId: string;
  lessonTitle: string;
  topic: string;
  pretestCompleted: boolean;
  pretest: number | null;
  pretestAnswers: number[];
  posttestCompleted: boolean;
  posttest: number | null;
  posttestAnswers: number[];
  completedStages: number[];
  totalStages: number;
  stageAnswers: Record<string, any>;
  stageTracking: Record<string, CTLActivitySession>;
}

export interface StudentActivitySummary {
  student: { id: string; name: string; username: string; email: string; gender: string; class: string; nis: string };
  group: string | null;
  globalPretestCompleted: boolean;
  globalPretest: number | null;
  globalPretestAnswers: number[];
  globalPosttestCompleted: boolean;
  globalPosttest: number | null;
  globalPosttestAnswers: number[];
  overallProgress: number;
  lessons: LessonSummary[];
}

export interface HasilBelajarSectionProps {
  studentActivities: StudentActivitySummary[];
  exportCsv: () => void;
  setSelectedStudent: (s: StudentActivitySummary) => void;
  availableGroups: string[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDateTime(v?: string | null) {
  if (!v) return '—';
  return new Date(v).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function formatTimeOnly(v?: string | null) {
  if (!v) return '—';
  return new Date(v).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function formatDuration(sec: number) {
  if (!sec) return '—';
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  if (h > 0) return `${h}j ${m}m`;
  if (m > 0) return `${m}m ${s}d`;
  return `${s} detik`;
}

function getLessonCtlMetrics(lesson: LessonSummary) {
  return Object.values(lesson.stageTracking).reduce(
    (acc, s) => {
      acc.attempts += s.totalAttempts; acc.errors += s.totalErrors;
      acc.correct += s.correctCount; acc.wrong += s.wrongCount; acc.duration += s.totalDurationSec;
      return acc;
    },
    { attempts: 0, errors: 0, correct: 0, wrong: 0, duration: 0 },
  );
}

// ── 3-Indicator extractors ────────────────────────────────────────────────────

function extractConsistency(session: CTLActivitySession, lessonId: string): string {
  const snap = session.latestSnapshot; const answer = session.finalAnswer;
  switch (session.stageType) {
    case 'constructivism': {
      const fa = snap?.finalAnswer ?? {};
      const parts: string[] = [];
      if (fa.essay1 ?? answer?.essay1) parts.push('Esai 1 ✓');
      if (fa.essay2 ?? answer?.essay2) parts.push('Esai 2 ✓');
      const sel = fa.selectedOption ?? answer?.selectedOption;
      if (sel) parts.push(`Pilihan: ${sel} (${(fa.isCorrect ?? answer?.isCorrect) ? 'Benar' : 'Salah'})`);
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
        const checked = (Object.values(ev) as boolean[]).filter(Boolean).length;
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

function extractArgument(session: CTLActivitySession): string | null {
  const snap = session.latestSnapshot; const answer = session.finalAnswer;
  switch (session.stageType) {
    case 'constructivism': { const fa = snap?.finalAnswer ?? {}; return fa.essay1 ?? fa.essay2 ?? answer?.essay1 ?? answer?.essay2 ?? null; }
    case 'inquiry': return snap?.essay1Text ?? snap?.reflection1 ?? answer?.reflection1 ?? answer?.essay1 ?? null;
    case 'questioning': return snap?.essay ?? answer?.justification ?? null;
    case 'learning-community': {
      const m1 = snap?.module1Data ?? answer?.module1Data; const m2 = snap?.module2Data ?? answer?.module2Data;
      return m1?.bestArgument?.argument ?? m1?.discussions?.[0]?.argument ?? m2?.bestArgument?.argument ?? m2?.discussions?.[0]?.argument ?? null;
    }
    case 'modeling': return snap?.essay ?? answer?.essay ?? answer?.argument ?? null;
    case 'reflection': return snap?.argumentText ?? answer?.argumentText ?? null;
    case 'authentic-assessment': return snap?.initialReason ?? answer?.initialReason ?? null;
    default: return null;
  }
}

function extractConclusion(session: CTLActivitySession): string | null {
  const snap = session.latestSnapshot; const answer = session.finalAnswer;
  switch (session.stageType) {
    case 'constructivism': { const fa = snap?.finalAnswer ?? {}; return fa.conclusion ?? answer?.conclusion ?? answer?.summary ?? null; }
    case 'inquiry': return snap?.conclusionText ?? answer?.conclusion ?? answer?.summary ?? null;
    case 'questioning': return snap?.conclusionText ?? answer?.conclusion ?? null;
    case 'learning-community': return answer?.finalConclusion ?? snap?.finalConclusion ?? null;
    case 'modeling': return snap?.conclusionText ?? answer?.conclusion ?? null;
    case 'reflection': return snap?.conclusionText ?? answer?.conclusionText ?? answer?.conclusion ?? null;
    case 'authentic-assessment': return snap?.followUpReason ?? answer?.followUpReason ?? null;
    default: return null;
  }
}

// ── Sub-components ─────────────────────────────────────────────────────────────

export function ScoreBadge({ score, total, completed }: { score: number | null; total: number; completed: boolean }) {
  if (!completed) return <span className="text-xs text-[#395886]/30 font-medium">—</span>;
  const pct = Math.round(((score ?? 0) / total) * 100);
  return (
    <div className={`inline-flex flex-col items-center px-2 py-1 rounded-lg border min-w-[52px] ${
      pct >= 86 ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
      : pct >= 71 ? 'bg-[#628ECB]/10 text-[#628ECB] border-[#628ECB]/20'
      : pct >= 60 ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20'
      : 'bg-red-50 text-red-600 border-red-100'
    }`}>
      <span className="text-[11px] font-black leading-none">{score}/{total}</span>
      <span className="text-[8px] font-bold opacity-60 mt-0.5 tracking-tighter">Nilai: {pct}</span>
    </div>
  );
}

export function TestAnswerSection({ title, score, totalQ, completed, questions, answers }: {
  title: string; score: number | null; totalQ: number; completed: boolean;
  questions: Array<{ question: string; options: string[]; correctAnswer: number }>; answers: number[];
}) {
  const [open, setOpen] = useState(false);
  if (!completed) {
    return (
      <div className="rounded-2xl border border-[#D5DEEF] bg-[#F8FAFD] px-5 py-4 flex items-center justify-between">
        <div>
          <p className="font-bold text-[#395886] text-sm">{title}</p>
          <p className="text-xs text-[#395886]/50 mt-0.5">Belum dikerjakan</p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-400">—</span>
      </div>
    );
  }
  const correctCount = answers.filter((a, i) => a === questions[i]?.correctAnswer).length;
  const pct = Math.round((correctCount / totalQ) * 100);
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-[#D5DEEF] bg-white shadow-sm">
      <button onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between gap-4 bg-[#F8FAFD] px-5 py-4 text-left hover:bg-[#F0F3FA] transition-colors">
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${pct >= 80 ? 'bg-[#10B981]' : pct >= 60 ? 'bg-[#F59E0B]' : 'bg-red-400'}`} />
          <div>
            <p className="text-sm font-black text-[#395886]">{title}</p>
            <p className="text-xs font-medium text-[#395886]/50">{correctCount} benar dari {totalQ} soal</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${
            pct >= 80 ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
            : pct >= 60 ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20'
            : 'bg-red-50 text-red-600 border-red-200'}`}>
            {score ?? correctCount}/{totalQ} ({pct}%)
          </span>
          <ChevronDown className={`w-4 h-4 text-[#395886]/50 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open && (
        <div className="space-y-4 border-t border-[#D5DEEF] bg-white p-5">
          {questions.map((q, i) => {
            const studentAns = answers[i] ?? null;
            const isCorrect = studentAns === q.correctAnswer;
            return (
              <div key={i} className={`rounded-[1.5rem] border p-5 ${isCorrect ? 'border-[#10B981]/25 bg-[#10B981]/[0.03]' : 'border-red-100 bg-red-50/[0.05]'}`}>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black ${isCorrect ? 'bg-[#10B981] text-white' : 'bg-red-500 text-white'}`}>{i + 1}</span>
                    <div>
                      <p className="text-base font-bold leading-relaxed text-[#395886]">{q.question}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${isCorrect ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-red-50 text-red-600'}`}>{isCorrect ? 'Benar' : 'Salah'}</span>
                        <span className="rounded-full bg-[#F0F3FA] px-3 py-1 text-xs font-bold text-[#395886]/65">Jawaban: {studentAns !== null ? String.fromCharCode(65 + studentAns) : '—'}</span>
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Kunci: {String.fromCharCode(65 + q.correctAnswer)}</span>
                      </div>
                    </div>
                  </div>
                  {studentAns !== null ? (isCorrect ? <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />) : <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0 mt-0.5" />}
                </div>
                <div className="grid gap-2.5">
                  {q.options.map((opt, oi) => {
                    const isStudent = oi === studentAns; const isCorrectOpt = oi === q.correctAnswer;
                    return (
                      <div key={oi} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${isCorrectOpt ? 'border-[#10B981]/30 bg-[#10B981]/10 text-[#0F8A66] font-semibold' : isStudent && !isCorrect ? 'border-red-200 bg-red-50 text-red-700 font-semibold' : 'border-[#E5EBF5] bg-[#F8FAFD] text-[#395886]/75'}`}>
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-xs font-black">{String.fromCharCode(65 + oi)}</span>
                        <span className="flex-1">{opt}</span>
                        {isCorrectOpt && <span className="shrink-0 text-[11px] font-black uppercase tracking-wide">Kunci</span>}
                        {isStudent && !isCorrect && <span className="shrink-0 text-[11px] font-black uppercase tracking-wide">Dipilih</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const STAGE_LABELS = ['Constructivism', 'Inquiry', 'Questioning', 'Learning Com.', 'Modeling', 'Reflection', 'Assessment'];
const LESSON_LIST = Object.values(lessons);

// ── Tab: Pretest & Posttest ───────────────────────────────────────────────────

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

function PrePostTab({ students, availableGroups, uniqueClasses, setSelectedStudent }: {
  students: StudentActivitySummary[];
  availableGroups: string[];
  uniqueClasses: string[];
  setSelectedStudent: (s: StudentActivitySummary) => void;
}) {
  // View toggle: tabel nilai | analisis butir soal
  const [view, setView] = useState<'tabel' | 'analisis'>('tabel');

  // Shared filters
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [searchQ, setSearchQ] = useState('');

  // Tabel view state
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  // Analisis view state
  const [analysisTestKey, setAnalysisTestKey] = useState('global-pre');

  const filtered = useMemo(() => students.filter(s => {
    if (filterGroup !== 'all' && (s.group ?? 'none') !== filterGroup) return false;
    if (filterClass !== 'all' && s.student.class !== filterClass) return false;
    if (searchQ && !s.student.name.toLowerCase().includes(searchQ.toLowerCase()) &&
        !s.student.nis.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  }), [students, filterGroup, filterClass, searchQ]);

  const pctOf = (score: number | null, total: number) =>
    total > 0 && score !== null ? Math.round((score / total) * 100) : 0;
  const avgArr = (arr: number[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const globalPrePcts = students.filter(s => s.globalPretestCompleted)
    .map(s => pctOf(s.globalPretest, globalPretest.questions.length));
  const globalPostPcts = students.filter(s => s.globalPosttestCompleted)
    .map(s => pctOf(s.globalPosttest, globalPosttest.questions.length));

  // ── Analysis config ──────────────────────────────────────────────────────────
  const analysisConfig = useMemo(() => {
    if (analysisTestKey === 'global-pre') return { title: 'Pre-Test Umum', questions: globalPretest.questions };
    if (analysisTestKey === 'global-post') return { title: 'Post-Test Umum', questions: globalPosttest.questions };
    const m = analysisTestKey.match(/^(lesson-pre|lesson-post)-(.+)$/);
    if (m) {
      const ld = lessons[m[2]];
      return {
        title: m[1] === 'lesson-pre' ? `Pre-Test ${ld?.title ?? ''}` : `Post-Test ${ld?.title ?? ''}`,
        questions: m[1] === 'lesson-pre' ? (ld?.pretest.questions ?? []) : (ld?.posttest.questions ?? []),
      };
    }
    return { title: '—', questions: [] as typeof globalPretest.questions };
  }, [analysisTestKey]);

  const analysisResults = useMemo(() => {
    const { questions } = analysisConfig;
    return filtered.map(s => {
      let completed = false;
      let answers: number[] = [];
      if (analysisTestKey === 'global-pre') { completed = s.globalPretestCompleted; answers = s.globalPretestAnswers; }
      else if (analysisTestKey === 'global-post') { completed = s.globalPosttestCompleted; answers = s.globalPosttestAnswers; }
      else {
        const m = analysisTestKey.match(/^(lesson-pre|lesson-post)-(.+)$/);
        if (m) {
          const lesson = s.lessons.find(l => l.lessonId === m[2]);
          if (m[1] === 'lesson-pre') { completed = lesson?.pretestCompleted ?? false; answers = lesson?.pretestAnswers ?? []; }
          else { completed = lesson?.posttestCompleted ?? false; answers = lesson?.posttestAnswers ?? []; }
        }
      }
      const answersClamped = questions.map((_, i) => completed ? (answers[i] ?? null) : null) as (number | null)[];
      const isCorrect = questions.map((q, i) => answersClamped[i] === q.correctAnswer);
      return { student: s.student, completed, answers: answersClamped, isCorrect };
    });
  }, [filtered, analysisTestKey, analysisConfig]);

  const questionStats = useMemo(() => {
    const { questions } = analysisConfig;
    return questions.map((_, qi) => {
      const answered = analysisResults.filter(r => r.answers[qi] !== null);
      const correct = analysisResults.filter(r => r.isCorrect[qi]).length;
      const pct = answered.length > 0 ? Math.round((correct / answered.length) * 100) : 0;
      return { correct, answered: answered.length, pct };
    });
  }, [analysisResults, analysisConfig]);

  // ── Excel export (full multi-sheet) ─────────────────────────────────────────
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const makeSheet = (
      questions: Array<{ question: string; options: string[]; correctAnswer: number }>,
      getData: (s: StudentActivitySummary) => { completed: boolean; answers: number[]; score: number | null },
    ) => {
      const keyRow = ['KUNCI JAWABAN', ...questions.map(q => OPTION_LABELS[q.correctAnswer]), '', ''];
      const header = ['NIS', 'Nama', 'Kelas', 'Kelompok',
        ...questions.map((_, i) => `No.${i + 1}`), 'Benar', 'Nilai (%)'];
      const rows = filtered.map(s => {
        const { completed, answers, score } = getData(s);
        const correct = completed ? answers.filter((a, i) => a === questions[i]?.correctAnswer).length : 0;
        return [s.student.nis, s.student.name, s.student.class, s.group ?? '—',
          ...questions.map((_, i) => completed && answers[i] !== undefined ? OPTION_LABELS[answers[i]] : '—'),
          completed ? correct : '—', completed ? pctOf(score, questions.length) : '—'];
      });
      return XLSX.utils.aoa_to_sheet([header, keyRow, ...rows]);
    };

    const summaryHeader = ['NIS', 'Nama', 'Kelas', 'Kelompok',
      'Pre-Umum (%)', 'Post-Umum (%)',
      ...LESSON_LIST.flatMap(l => [`Pre ${l.title} (%)`, `Post ${l.title} (%)`]),
      'CTL Selesai', 'Progress (%)'];
    const summaryRows = filtered.map(s => [
      s.student.nis, s.student.name, s.student.class, s.group ?? '—',
      s.globalPretestCompleted ? pctOf(s.globalPretest, globalPretest.questions.length) : '—',
      s.globalPosttestCompleted ? pctOf(s.globalPosttest, globalPosttest.questions.length) : '—',
      ...LESSON_LIST.flatMap(l => {
        const ls = s.lessons.find(x => x.lessonId === l.id);
        const ld = lessons[l.id];
        return [ls?.pretestCompleted ? pctOf(ls.pretest, ld?.pretest.questions.length ?? 0) : '—',
          ls?.posttestCompleted ? pctOf(ls.posttest, ld?.posttest.questions.length ?? 0) : '—'];
      }),
      s.lessons.reduce((sum, l) => sum + l.completedStages.length, 0), s.overallProgress,
    ]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([summaryHeader, ...summaryRows]), 'Ringkasan Skor');
    XLSX.utils.book_append_sheet(wb, makeSheet(globalPretest.questions, s => ({ completed: s.globalPretestCompleted, answers: s.globalPretestAnswers, score: s.globalPretest })), 'Pre-Test Umum');
    XLSX.utils.book_append_sheet(wb, makeSheet(globalPosttest.questions, s => ({ completed: s.globalPosttestCompleted, answers: s.globalPosttestAnswers, score: s.globalPosttest })), 'Post-Test Umum');
    LESSON_LIST.forEach(l => {
      const ld = lessons[l.id]; if (!ld) return;
      XLSX.utils.book_append_sheet(wb, makeSheet(ld.pretest.questions, s => { const ls = s.lessons.find(x => x.lessonId === l.id); return { completed: ls?.pretestCompleted ?? false, answers: ls?.pretestAnswers ?? [], score: ls?.pretest ?? null }; }), `Pre-P${l.id}`);
      XLSX.utils.book_append_sheet(wb, makeSheet(ld.posttest.questions, s => { const ls = s.lessons.find(x => x.lessonId === l.id); return { completed: ls?.posttestCompleted ?? false, answers: ls?.posttestAnswers ?? [], score: ls?.posttest ?? null }; }), `Post-P${l.id}`);
    });
    XLSX.writeFile(wb, 'HasilBelajar_PrePostTest.xlsx');
  };

  // ── Excel export (matrix only for current analysis) ──────────────────────────
  const handleExportMatrix = () => {
    const { questions, title } = analysisConfig;
    const header = ['Nama', 'NIS', 'Kelas', ...questions.map((_, i) => `No.${i + 1}`), 'Benar', 'Nilai (%)'];
    const keyRow = ['KUNCI JAWABAN', '', '', ...questions.map(q => OPTION_LABELS[q.correctAnswer]), '', ''];
    const accuracyRow = ['Akurasi (%)', '', '', ...questionStats.map(s => `${s.pct}%`), '', ''];
    const rows = analysisResults.map(r => {
      const correct = r.isCorrect.filter(Boolean).length;
      return [r.student.name, r.student.nis, r.student.class,
        ...r.answers.map(a => a !== null ? OPTION_LABELS[a] : '—'),
        r.completed ? correct : '—',
        r.completed ? (questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0) : '—'];
    });
    const ws = XLSX.utils.aoa_to_sheet([header, keyRow, accuracyRow, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Analisis Butir Soal');
    XLSX.writeFile(wb, `AnalisisButir_${title.replace(/\s+/g, '_')}.xlsx`);
  };

  // ── Shared filter bar ────────────────────────────────────────────────────────
  const FilterBar = () => (
    <div className="flex flex-wrap gap-3 items-center bg-white border border-[#D5DEEF] rounded-2xl px-5 py-4">
      <span className="text-sm font-semibold text-[#395886]/50">Filter:</span>
      <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
        className="border border-[#D5DEEF] rounded-xl px-3 py-2 text-sm text-[#395886] bg-[#F8FAFD] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30">
        <option value="all">Semua Kelas</option>
        {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
        className="border border-[#D5DEEF] rounded-xl px-3 py-2 text-sm text-[#395886] bg-[#F8FAFD] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30">
        <option value="all">Semua Kelompok</option>
        {availableGroups.map(g => <option key={g} value={g}>{g}</option>)}
        <option value="none">Belum Bergabung</option>
      </select>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#395886]/40" />
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Cari nama / NIS..."
          className="pl-9 pr-4 py-2 text-xs border border-[#D5DEEF] rounded-xl bg-[#F8FAFD] text-[#395886] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30 w-44" />
      </div>
      {(filterGroup !== 'all' || filterClass !== 'all' || searchQ) && (
        <button onClick={() => { setFilterGroup('all'); setFilterClass('all'); setSearchQ(''); }}
          className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600">
          <X className="w-3.5 h-3.5" /> Reset
        </button>
      )}
      <span className="text-xs text-[#395886]/40">{filtered.length} siswa</span>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Avg Pre-Test Umum', val: `${avgArr(globalPrePcts)}%`, color: 'text-[#628ECB]', bg: 'bg-[#628ECB]/5 border-[#628ECB]/15' },
          { label: 'Avg Post-Test Umum', val: `${avgArr(globalPostPcts)}%`, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/5 border-[#F59E0B]/15' },
          { label: 'Sudah Pre-Test', val: `${students.filter(s => s.globalPretestCompleted).length}/${students.length}`, color: 'text-[#10B981]', bg: 'bg-[#10B981]/5 border-[#10B981]/15' },
          { label: 'Sudah Post-Test', val: `${students.filter(s => s.globalPosttestCompleted).length}/${students.length}`, color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/5 border-[#8B5CF6]/15' },
        ].map((stat, i) => (
          <div key={i} className={`rounded-2xl border p-4 ${stat.bg}`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/50 mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2 bg-white border border-[#D5DEEF] rounded-2xl p-1.5 shadow-sm">
        {[
          { id: 'tabel' as const, label: 'Tabel Nilai Siswa', icon: <BarChart2 className="w-4 h-4" /> },
          { id: 'analisis' as const, label: 'Analisis Butir Soal', icon: <Layers className="w-4 h-4" /> },
        ].map(v => (
          <button key={v.id} onClick={() => setView(v.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              view === v.id ? 'bg-[#628ECB] text-white shadow-md' : 'text-[#395886]/60 hover:text-[#395886] hover:bg-[#F0F3FA]'
            }`}>
            {v.icon}{v.label}
          </button>
        ))}
      </div>

      {/* ── View: Tabel Nilai ─────────────────────────────────────────────────── */}
      {view === 'tabel' && (
        <>
          <div className="flex flex-wrap gap-3 items-center bg-white border border-[#D5DEEF] rounded-2xl px-5 py-4">
            <span className="text-sm font-semibold text-[#395886]/50">Filter:</span>
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
              className="border border-[#D5DEEF] rounded-xl px-3 py-2 text-sm text-[#395886] bg-[#F8FAFD] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30">
              <option value="all">Semua Kelas</option>
              {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
              className="border border-[#D5DEEF] rounded-xl px-3 py-2 text-sm text-[#395886] bg-[#F8FAFD] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30">
              <option value="all">Semua Kelompok</option>
              {availableGroups.map(g => <option key={g} value={g}>{g}</option>)}
              <option value="none">Belum Bergabung</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#395886]/40" />
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Cari nama / NIS..."
                className="pl-9 pr-4 py-2 text-xs border border-[#D5DEEF] rounded-xl bg-[#F8FAFD] text-[#395886] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30 w-44" />
            </div>
            {(filterGroup !== 'all' || filterClass !== 'all' || searchQ) && (
              <button onClick={() => { setFilterGroup('all'); setFilterClass('all'); setSearchQ(''); }}
                className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600">
                <X className="w-3.5 h-3.5" /> Reset
              </button>
            )}
            <span className="text-xs text-[#395886]/40">{filtered.length} siswa</span>
            <button onClick={handleExportExcel}
              className="ml-auto flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#10B981] rounded-xl hover:bg-[#0D9669] shadow-sm transition-colors">
              <Download className="w-3.5 h-3.5" /> Export Semua ke Excel
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#D5DEEF] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: `${820 + LESSON_LIST.length * 140}px` }}>
                <thead>
                  <tr className="bg-[#F0F3FA]">
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#395886]/55 uppercase tracking-wide sticky left-0 bg-[#F0F3FA] z-10 min-w-[180px]">Siswa</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#395886]/55 uppercase tracking-wide">Kelas</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#395886]/55 uppercase tracking-wide min-w-[110px]">Kelompok</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-[#628ECB]/70 uppercase tracking-wide bg-[#628ECB]/5">Pre-Umum</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-[#F59E0B]/80 uppercase tracking-wide bg-[#F59E0B]/5">Post-Umum</th>
                    {LESSON_LIST.map(l => (
                      <th key={l.id} colSpan={2} className="px-4 py-3 text-center text-xs font-bold text-[#395886]/55 uppercase tracking-wide border-l border-[#D5DEEF]">
                        {l.title}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center text-xs font-bold text-[#395886]/55 uppercase tracking-wide border-l border-[#D5DEEF]">CTL</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-[#395886]/55 uppercase tracking-wide">Progress</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-[#395886]/55 uppercase tracking-wide">Detail</th>
                  </tr>
                  <tr className="bg-[#F8FAFD] border-b border-[#D5DEEF]">
                    <th className="sticky left-0 bg-[#F8FAFD] z-10" /><th /><th />
                    <th className="px-4 py-2 text-center text-[10px] font-bold text-[#628ECB]/60 bg-[#628ECB]/5">Nilai</th>
                    <th className="px-4 py-2 text-center text-[10px] font-bold text-[#F59E0B]/70 bg-[#F59E0B]/5">Nilai</th>
                    {LESSON_LIST.map(l => (
                      <React.Fragment key={l.id}>
                        <th className="px-3 py-2 text-center text-[10px] font-bold text-[#10B981]/70 border-l border-[#D5DEEF]">Pre</th>
                        <th className="px-3 py-2 text-center text-[10px] font-bold text-[#F59E0B]/70">Post</th>
                      </React.Fragment>
                    ))}
                    <th className="px-3 py-2 text-center text-[10px] font-bold text-[#628ECB]/70 border-l border-[#D5DEEF]">Tahap</th>
                    <th /><th />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5DEEF]">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7 + LESSON_LIST.length * 2} className="px-6 py-10 text-center text-sm text-[#395886]/40">Tidak ada data sesuai filter.</td></tr>
                  ) : filtered.map(s => {
                    const completedStages = s.lessons.reduce((sum, l) => sum + l.completedStages.length, 0);
                    const totalStages = s.lessons.reduce((sum, l) => sum + l.totalStages, 0);
                    const isExpanded = expandedStudent === s.student.id;
                    return (
                      <React.Fragment key={s.student.id}>
                        <tr className={`hover:bg-[#F8FAFD] transition-colors ${isExpanded ? 'bg-[#F0F5FF]' : ''}`}>
                          <td className={`px-4 py-3 sticky left-0 z-10 border-r border-[#D5DEEF]/50 ${isExpanded ? 'bg-[#F0F5FF]' : 'bg-white'}`}>
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="font-bold text-sm text-[#395886]">{s.student.name}</p>
                                <p className="text-xs text-[#395886]/50">{s.student.nis}</p>
                              </div>
                              <button onClick={() => setSelectedStudent(s)}
                                className="ml-1 text-[#395886]/30 hover:text-[#628ECB] transition-colors shrink-0" title="Lihat detail">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#395886]/70">{s.student.class}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {s.group ? <span className="text-xs font-bold bg-[#628ECB]/10 text-[#628ECB] px-3 py-1 rounded-full">{s.group}</span>
                              : <span className="text-xs text-[#395886]/30">—</span>}
                          </td>
                          <td className="px-4 py-3 text-center bg-[#628ECB]/3">
                            <ScoreBadge score={s.globalPretest} total={globalPretest.questions.length} completed={s.globalPretestCompleted} />
                          </td>
                          <td className="px-4 py-3 text-center bg-[#F59E0B]/3">
                            <ScoreBadge score={s.globalPosttest} total={globalPosttest.questions.length} completed={s.globalPosttestCompleted} />
                          </td>
                          {s.lessons.map(l => {
                            const ld = lessons[l.lessonId];
                            return (
                              <React.Fragment key={l.lessonId}>
                                <td className="px-3 py-3 text-center border-l border-[#D5DEEF]/50">
                                  <ScoreBadge score={l.pretest} total={ld?.pretest.questions.length ?? 0} completed={l.pretestCompleted} />
                                </td>
                                <td className="px-3 py-3 text-center">
                                  <ScoreBadge score={l.posttest} total={ld?.posttest.questions.length ?? 0} completed={l.posttestCompleted} />
                                </td>
                              </React.Fragment>
                            );
                          })}
                          <td className="px-3 py-3 text-center border-l border-[#D5DEEF]/50">
                            <div className="inline-flex min-w-[66px] flex-col items-center rounded-lg border border-[#628ECB]/20 bg-[#628ECB]/8 px-2 py-1">
                              <span className="text-[11px] font-black text-[#628ECB]">{completedStages}/{totalStages}</span>
                              <span className="text-[8px] font-bold uppercase tracking-wide text-[#628ECB]/60">Tahap</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <div className="w-12 bg-[#D5DEEF] rounded-full h-1.5 overflow-hidden">
                                <div className={`h-full rounded-full ${s.overallProgress === 100 ? 'bg-[#10B981]' : 'bg-[#628ECB]'}`}
                                  style={{ width: `${s.overallProgress}%` }} />
                              </div>
                              <span className="text-[10px] font-black text-[#628ECB] leading-none">{s.overallProgress}<span className="opacity-40 font-bold">%</span></span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <button onClick={() => setExpandedStudent(isExpanded ? null : s.student.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                                isExpanded ? 'bg-[#628ECB] text-white' : 'bg-[#628ECB]/10 text-[#628ECB] hover:bg-[#628ECB]/20'}`}>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              {isExpanded ? 'Tutup' : 'Jawaban'}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={7 + LESSON_LIST.length * 2} className="p-0">
                              <div className="bg-[#F8FAFD] border-t-2 border-[#628ECB]/20 px-6 py-5 space-y-4">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-black uppercase tracking-widest text-[#628ECB]">Detail Jawaban — {s.student.name}</p>
                                  <span className="text-[10px] text-[#395886]/40">{s.student.nis} · {s.student.class}</span>
                                </div>
                                <div className="space-y-3">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40">Evaluasi Umum</p>
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <TestAnswerSection title="Pre-Test Umum" score={s.globalPretest} totalQ={globalPretest.questions.length}
                                      completed={s.globalPretestCompleted} questions={globalPretest.questions} answers={s.globalPretestAnswers} />
                                    <TestAnswerSection title="Post-Test Umum" score={s.globalPosttest} totalQ={globalPosttest.questions.length}
                                      completed={s.globalPosttestCompleted} questions={globalPosttest.questions} answers={s.globalPosttestAnswers} />
                                  </div>
                                </div>
                                {s.lessons.map(lesson => {
                                  const ld = lessons[lesson.lessonId];
                                  if (!ld) return null;
                                  return (
                                    <div key={lesson.lessonId} className="space-y-3">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40">{lesson.lessonTitle} — {lesson.topic}</p>
                                      <div className="grid gap-3 sm:grid-cols-2">
                                        <TestAnswerSection title={`Pre-Test ${lesson.lessonTitle}`} score={lesson.pretest}
                                          totalQ={ld.pretest.questions.length} completed={lesson.pretestCompleted}
                                          questions={ld.pretest.questions} answers={lesson.pretestAnswers} />
                                        <TestAnswerSection title={`Post-Test ${lesson.lessonTitle}`} score={lesson.posttest}
                                          totalQ={ld.posttest.questions.length} completed={lesson.posttestCompleted}
                                          questions={ld.posttest.questions} answers={lesson.posttestAnswers} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length > 0 && (
              <div className="px-6 py-3 bg-[#F8FAFD] border-t border-[#D5DEEF]">
                <p className="text-xs text-[#395886]/50 font-medium">{filtered.length} siswa ditampilkan</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── View: Analisis Butir Soal ─────────────────────────────────────────── */}
      {view === 'analisis' && (
        <>
          {/* Test selector */}
          <div className="bg-white border border-[#D5DEEF] rounded-2xl px-5 py-4 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/50">Pilih Evaluasi:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'global-pre', label: 'Pre-Test Umum', color: 'bg-[#628ECB]' },
                { key: 'global-post', label: 'Post-Test Umum', color: 'bg-[#F59E0B]' },
                ...LESSON_LIST.flatMap(l => [
                  { key: `lesson-pre-${l.id}`, label: `Pre — ${l.title}`, color: 'bg-[#10B981]' },
                  { key: `lesson-post-${l.id}`, label: `Post — ${l.title}`, color: 'bg-[#8B5CF6]' },
                ]),
              ].map(opt => (
                <button key={opt.key} onClick={() => setAnalysisTestKey(opt.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    analysisTestKey === opt.key
                      ? `${opt.color} text-white shadow-md border-transparent`
                      : 'bg-white border-[#D5DEEF] text-[#395886]/60 hover:border-[#628ECB] hover:text-[#395886]'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter + export */}
          <div className="flex flex-wrap gap-3 items-center bg-white border border-[#D5DEEF] rounded-2xl px-5 py-4">
            <span className="text-sm font-semibold text-[#395886]/50">Filter:</span>
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
              className="border border-[#D5DEEF] rounded-xl px-3 py-2 text-sm text-[#395886] bg-[#F8FAFD] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30">
              <option value="all">Semua Kelas</option>
              {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
              className="border border-[#D5DEEF] rounded-xl px-3 py-2 text-sm text-[#395886] bg-[#F8FAFD] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30">
              <option value="all">Semua Kelompok</option>
              {availableGroups.map(g => <option key={g} value={g}>{g}</option>)}
              <option value="none">Belum Bergabung</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#395886]/40" />
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Cari nama / NIS..."
                className="pl-9 pr-4 py-2 text-xs border border-[#D5DEEF] rounded-xl bg-[#F8FAFD] text-[#395886] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30 w-44" />
            </div>
            {(filterGroup !== 'all' || filterClass !== 'all' || searchQ) && (
              <button onClick={() => { setFilterGroup('all'); setFilterClass('all'); setSearchQ(''); }}
                className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600">
                <X className="w-3.5 h-3.5" /> Reset
              </button>
            )}
            <span className="text-xs text-[#395886]/40">{filtered.length} siswa · {analysisConfig.questions.length} soal</span>
            <button onClick={handleExportMatrix}
              className="ml-auto flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#10B981] rounded-xl hover:bg-[#0D9669] shadow-sm transition-colors">
              <Download className="w-3.5 h-3.5" /> Export Matriks ke Excel
            </button>
          </div>

          {/* Matrix table */}
          <div className="bg-white rounded-2xl border border-[#D5DEEF] shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#395886] to-[#628ECB] flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Analisis Butir Soal</p>
                <p className="text-base font-black text-white">{analysisConfig.title}</p>
              </div>
              <div className="flex items-center gap-4 text-white/80 text-xs font-bold">
                <span>{filtered.filter(s => analysisResults.find(r => r.student.id === s.student.id)?.completed).length} mengerjakan</span>
                <span>dari {filtered.length} siswa</span>
              </div>
            </div>

            {analysisConfig.questions.length === 0 ? (
              <div className="py-16 text-center text-sm text-[#395886]/40">Tidak ada soal pada evaluasi ini.</div>
            ) : (
              <div className="overflow-x-auto" style={{ maxHeight: '70vh' }}>
                <table className="w-full border-collapse text-sm" style={{ minWidth: `${240 + analysisConfig.questions.length * 52}px` }}>
                  <thead className="sticky top-0 z-20">
                    {/* Column numbers */}
                    <tr className="bg-[#F0F3FA]">
                      <th className="sticky left-0 z-30 bg-[#F0F3FA] px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#395886]/60 min-w-[210px] border-r border-b border-[#D5DEEF]">
                        Nama Siswa
                      </th>
                      {analysisConfig.questions.map((_, i) => (
                        <th key={i} className="px-2 py-3 text-center text-xs font-bold text-[#395886]/60 min-w-[48px] border-r border-b border-[#D5DEEF]/60 last:border-r-0"
                          title={analysisConfig.questions[i]?.question}>
                          <span className="cursor-help">{i + 1}</span>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-[#395886]/60 min-w-[88px] border-l border-b border-[#D5DEEF]">Skor</th>
                    </tr>

                    {/* Answer key row */}
                    <tr className="bg-amber-50 border-b-2 border-amber-200">
                      <td className="sticky left-0 z-30 bg-amber-50 px-5 py-2.5 border-r border-amber-200">
                        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-700">
                          <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />Kunci Jawaban
                        </span>
                      </td>
                      {analysisConfig.questions.map((q, i) => (
                        <td key={i} className="px-2 py-2.5 text-center border-r border-amber-100 last:border-r-0">
                          <span className="inline-flex h-8 w-8 mx-auto items-center justify-center rounded-xl bg-amber-400 text-xs font-black text-white shadow-sm">
                            {OPTION_LABELS[q.correctAnswer]}
                          </span>
                        </td>
                      ))}
                      <td className="px-4 py-2.5 border-l border-amber-200 text-center">
                        <span className="text-xs font-bold text-amber-600">—</span>
                      </td>
                    </tr>

                    {/* Per-question accuracy */}
                    <tr className="bg-[#F0F5FF] border-b-2 border-[#D5DEEF]">
                      <td className="sticky left-0 z-30 bg-[#F0F5FF] px-5 py-2 border-r border-[#D5DEEF]">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]">Akurasi Per Soal</span>
                      </td>
                      {questionStats.map((stat, i) => (
                        <td key={i} className="px-2 py-2 text-center border-r border-[#D5DEEF]/40 last:border-r-0">
                          <span className={`text-[10px] font-black ${stat.pct >= 70 ? 'text-[#10B981]' : stat.pct >= 50 ? 'text-[#F59E0B]' : 'text-red-500'}`}>
                            {stat.pct}%
                          </span>
                        </td>
                      ))}
                      <td className="px-4 py-2 border-l border-[#D5DEEF] text-center">
                        <span className="text-[10px] font-bold text-[#628ECB]">
                          {questionStats.length > 0 ? Math.round(questionStats.reduce((s, q) => s + q.pct, 0) / questionStats.length) : 0}%
                        </span>
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisResults.length === 0 ? (
                      <tr>
                        <td colSpan={analysisConfig.questions.length + 2} className="px-6 py-10 text-center text-sm text-[#395886]/40">
                          Belum ada siswa yang mengerjakan evaluasi ini.
                        </td>
                      </tr>
                    ) : analysisResults.map((res, rowIdx) => {
                      const correct = res.isCorrect.filter(Boolean).length;
                      const totalQ = analysisConfig.questions.length;
                      const score = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
                      return (
                        <tr key={res.student.id}
                          className={`border-b border-[#D5DEEF]/50 transition-colors hover:bg-[#F8FAFD] ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFF]'}`}>
                          <td className={`sticky left-0 z-10 px-5 py-3 border-r border-[#D5DEEF]/60 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFF]'}`}>
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#395886]/10 to-[#628ECB]/10 flex items-center justify-center text-[#395886] font-bold text-xs shrink-0">
                                {res.student.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-[#395886] text-sm truncate max-w-[140px]">{res.student.name}</p>
                                {!res.completed && <p className="text-[10px] text-[#395886]/40 italic">Belum mengerjakan</p>}
                              </div>
                            </div>
                          </td>
                          {res.answers.map((ans, i) => {
                            if (ans === null) {
                              return (
                                <td key={i} className="px-2 py-3 text-center border-r border-[#D5DEEF]/40 last:border-r-0">
                                  <span className="inline-flex h-8 w-8 mx-auto items-center justify-center rounded-xl bg-gray-100 text-xs font-medium text-gray-400">—</span>
                                </td>
                              );
                            }
                            const isOk = res.isCorrect[i];
                            return (
                              <td key={i} className="px-2 py-3 text-center border-r border-[#D5DEEF]/40 last:border-r-0">
                                <span className={`inline-flex h-8 w-8 mx-auto items-center justify-center rounded-xl text-xs font-black shadow-sm ${
                                  isOk ? 'bg-[#10B981] text-white' : 'bg-red-500 text-white'
                                }`} title={isOk ? 'Benar' : `Salah (kunci: ${OPTION_LABELS[analysisConfig.questions[i]?.correctAnswer ?? 0]})`}>
                                  {OPTION_LABELS[ans]}
                                </span>
                              </td>
                            );
                          })}
                          <td className="px-4 py-3 text-center border-l border-[#D5DEEF]/60">
                            {res.completed ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className={`text-sm font-black ${score >= 80 ? 'text-[#10B981]' : score >= 60 ? 'text-[#F59E0B]' : 'text-red-500'}`}>{score}%</span>
                                <span className="text-[9px] font-bold text-[#395886]/35">{correct}/{totalQ}</span>
                              </div>
                            ) : <span className="text-xs text-[#395886]/30">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-5 px-5 py-4 border-t border-[#D5DEEF] bg-[#F8FAFD]">
              <span className="text-[10px] font-bold text-[#395886]/50 uppercase tracking-wide">Keterangan:</span>
              {[
                { bg: 'bg-[#10B981]', label: 'Benar' },
                { bg: 'bg-red-500', label: 'Salah' },
                { bg: 'bg-amber-400', label: 'Kunci Jawaban' },
                { bg: 'bg-gray-100 text-gray-400', label: 'Tidak Dijawab', text: true },
              ].map(item => (
                <span key={item.label} className="inline-flex items-center gap-2 text-xs font-medium text-[#395886]/70">
                  <span className={`h-6 w-6 rounded-lg ${item.bg} flex items-center justify-center text-[9px] font-black ${item.text ? '' : 'text-white'}`}>
                    A
                  </span>
                  {item.label}
                </span>
              ))}
              <span className="ml-auto text-[10px] text-[#395886]/40 italic hidden sm:block">Arahkan kursor ke nomor soal untuk melihat teks pertanyaan</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Tab: Monitoring CTL (3 Indicators) ────────────────────────────────────────

function MonitoringCTLTab({ students }: { students: StudentActivitySummary[] }) {
  const [lessonId, setLessonId] = useState(LESSON_LIST[0]?.id ?? '1');
  const [stageIndex, setStageIndex] = useState(0);
  const [searchQ, setSearchQ] = useState('');

  const stageKey = `stage_${stageIndex}`;
  const lessonData = lessons[lessonId];

  const filtered = useMemo(() =>
    students.filter(s => !searchQ || s.student.name.toLowerCase().includes(searchQ.toLowerCase())),
    [students, searchQ]
  );

  return (
    <div className="space-y-5">
      {/* Header info */}
      <div className="bg-gradient-to-r from-[#628ECB]/8 to-[#395886]/5 rounded-2xl border border-[#628ECB]/15 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#628ECB]/15 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-[#628ECB]" />
          </div>
          <div>
            <h3 className="font-bold text-[#395886]">3 Indikator Berpikir Logis CTL</h3>
            <p className="text-xs text-[#395886]/60 mt-0.5 leading-relaxed">
              Pilih pertemuan dan tahap CTL, lalu lihat detail setiap siswa berdasarkan 3 indikator:
              <strong className="text-[#628ECB]"> Keruntutan Berpikir</strong> ·
              <strong className="text-[#10B981]"> Kemampuan Berargumen</strong> ·
              <strong className="text-[#8B5CF6]"> Penarikan Kesimpulan</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 items-center bg-white border border-[#D5DEEF] rounded-2xl px-5 py-4">
        <div className="flex gap-2">
          {LESSON_LIST.map(l => (
            <button key={l.id} onClick={() => setLessonId(l.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                lessonId === l.id ? 'bg-[#395886] text-white shadow-sm' : 'bg-white border border-[#D5DEEF] text-[#395886]/60 hover:text-[#395886] hover:border-[#628ECB]'
              }`}>
              Pertemuan {l.id}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#395886]/40" />
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Cari siswa..."
            className="pl-9 pr-4 py-2 text-xs border border-[#D5DEEF] rounded-xl bg-[#F8FAFD] text-[#395886] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30 w-48" />
        </div>
      </div>

      {/* Stage tabs */}
      <div className="bg-white rounded-2xl border border-[#D5DEEF] shadow-sm overflow-hidden">
        <div className="flex gap-0 overflow-x-auto border-b border-[#D5DEEF]">
          {STAGE_LABELS.map((label, i) => {
            const stageCompleteCount = students.filter(s => {
              const sk = `stage_${i}`;
              const ls = s.lessons.find(l => l.lessonId === lessonId);
              return ls?.stageTracking[sk]?.status === 'completed';
            }).length;
            return (
              <button key={i} onClick={() => setStageIndex(i)}
                className={`flex-shrink-0 px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap border-b-2 -mb-px transition-colors ${
                  stageIndex === i ? 'border-[#628ECB] text-[#628ECB] bg-[#F0F5FF]' : 'border-transparent text-[#395886]/40 hover:text-[#395886]/70 hover:bg-[#F8FAFD]'
                }`}>
                {label}
                {stageCompleteCount > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[8px] ${stageIndex === i ? 'bg-[#628ECB]/20 text-[#628ECB]' : 'bg-gray-100 text-gray-400'}`}>
                    {stageCompleteCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Stage info bar */}
        {lessonData && (
          <div className="px-5 py-3 bg-[#F8FAFD] border-b border-[#D5DEEF] flex items-center gap-3">
            {(() => {
              const meta = CTL_META[lessonData.stages[stageIndex]?.type] ?? CTL_META.constructivism;
              return (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${meta.bg} ${meta.text} ${meta.border}`}>
                  {meta.icon}{meta.label}
                </div>
              );
            })()}
            <p className="text-xs text-[#395886]/60">{lessonData.stages[stageIndex]?.title}</p>
            <span className="ml-auto text-[10px] text-[#395886]/40">
              {filtered.filter(s => s.lessons.find(l => l.lessonId === lessonId)?.stageTracking[stageKey]?.status === 'completed').length}/{filtered.length} selesai
            </span>
          </div>
        )}

        {/* Per-student rows */}
        <div className="divide-y divide-[#D5DEEF]">
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-[#395886]/35">Tidak ada siswa ditemukan.</div>
          )}
          {filtered.map(s => {
            const lessonSummary = s.lessons.find(l => l.lessonId === lessonId);
            const session = lessonSummary?.stageTracking[stageKey];
            const hasData = !!session;
            const consistency = hasData ? extractConsistency(session, lessonId) : '—';
            const argument = hasData ? extractArgument(session) : null;
            const conclusion = hasData ? extractConclusion(session) : null;

            return (
              <div key={s.student.id} className="px-5 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#628ECB]/10 flex items-center justify-center text-[#628ECB] text-xs font-black shrink-0">
                    {s.student.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#395886]">{s.student.name}</p>
                    <div className="flex items-center gap-2 text-[9px]">
                      <span className="text-[#395886]/40">{s.group ?? '—'}</span>
                      <span className="text-[#395886]/20">·</span>
                      <span className={`font-bold ${
                        session?.status === 'completed' ? 'text-[#10B981]'
                        : session?.status === 'in_progress' ? 'text-[#628ECB]' : 'text-[#395886]/30'}`}>
                        {session?.status === 'completed' ? 'Selesai' : session?.status === 'in_progress' ? 'Sedang proses' : 'Belum dimulai'}
                      </span>
                      {session && session.totalAttempts > 0 && (
                        <><span className="text-[#395886]/20">·</span><span className="text-[#395886]/40">{session.totalAttempts} percobaan, {session.totalErrors} kesalahan</span></>
                      )}
                    </div>
                  </div>
                  {session && (
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-[#628ECB]">{session.progressPercent}%</p>
                      <p className="text-[9px] text-[#395886]/40">Progres</p>
                    </div>
                  )}
                </div>

                {!hasData ? (
                  <p className="text-xs text-[#395886]/30 italic pl-11">Belum ada aktivitas pada tahap ini.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pl-0 sm:pl-11">
                    {/* Keruntutan Berpikir */}
                    <div className="rounded-xl border border-[#628ECB]/20 overflow-hidden">
                      <div className="px-3 py-2 bg-[#628ECB]/5 border-b border-[#628ECB]/15">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#628ECB]">Keruntutan Berpikir</p>
                      </div>
                      <div className="px-3 py-2.5">
                        {consistency === '—' ? <p className="text-xs text-[#395886]/30 italic">Belum ada data aktivitas</p>
                          : <p className="text-xs text-[#395886] leading-relaxed">{consistency}</p>}
                      </div>
                    </div>
                    {/* Kemampuan Berargumen */}
                    <div className="rounded-xl border border-[#10B981]/20 overflow-hidden">
                      <div className="px-3 py-2 bg-[#10B981]/5 border-b border-[#10B981]/15">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#10B981]">Kemampuan Berargumen</p>
                      </div>
                      <div className="px-3 py-2.5">
                        {argument ? <p className="text-xs text-[#395886] leading-relaxed line-clamp-4">"{argument}"</p>
                          : <p className="text-xs text-[#395886]/30 italic">Belum ada argumen tertulis</p>}
                      </div>
                    </div>
                    {/* Penarikan Kesimpulan */}
                    <div className="rounded-xl border border-[#8B5CF6]/20 overflow-hidden">
                      <div className="px-3 py-2 bg-[#8B5CF6]/5 border-b border-[#8B5CF6]/15">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#8B5CF6]">Penarikan Kesimpulan</p>
                      </div>
                      <div className="px-3 py-2.5">
                        {conclusion ? <p className="text-xs text-[#395886] leading-relaxed line-clamp-4">"{conclusion}"</p>
                          : <p className="text-xs text-[#395886]/30 italic">Belum ada kesimpulan tertulis</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Tab: Detail Aktivitas ─────────────────────────────────────────────────────

function DetailAktivitasTab({ students, setSelectedStudent }: {
  students: StudentActivitySummary[];
  setSelectedStudent: (s: StudentActivitySummary) => void;
}) {
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [filterLesson, setFilterLesson] = useState('all');
  const [searchQ, setSearchQ] = useState('');

  const filtered = useMemo(() =>
    students.filter(s => !searchQ || s.student.name.toLowerCase().includes(searchQ.toLowerCase())),
    [students, searchQ]
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white border border-[#D5DEEF] rounded-2xl px-5 py-4">
        <select value={filterLesson} onChange={e => setFilterLesson(e.target.value)}
          className="border border-[#D5DEEF] rounded-xl px-3 py-2 text-sm text-[#395886] bg-[#F8FAFD] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30">
          <option value="all">Semua Pertemuan</option>
          {LESSON_LIST.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
        </select>
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#395886]/40" />
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Cari nama siswa..."
            className="pl-9 pr-4 py-2 text-xs border border-[#D5DEEF] rounded-xl bg-[#F8FAFD] text-[#395886] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30 w-48" />
        </div>
      </div>

      {/* Students accordion */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#D5DEEF] py-12 text-center text-sm text-[#395886]/35">Tidak ada siswa ditemukan.</div>
        )}
        {filtered.map(s => {
          const isStudentOpen = expandedStudent === s.student.id;
          const displayLessons = filterLesson === 'all' ? s.lessons : s.lessons.filter(l => l.lessonId === filterLesson);
          const completedStages = s.lessons.reduce((sum, l) => sum + l.completedStages.length, 0);
          const totalStages = s.lessons.reduce((sum, l) => sum + l.totalStages, 0);

          return (
            <div key={s.student.id} className="bg-white rounded-2xl border border-[#D5DEEF] shadow-sm overflow-hidden">
              <button onClick={() => setExpandedStudent(isStudentOpen ? null : s.student.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFD] text-left transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#395886]/10 to-[#628ECB]/10 flex items-center justify-center text-[#395886] font-bold shrink-0">
                  {s.student.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#395886]">{s.student.name}</p>
                  <p className="text-xs text-[#395886]/50">{s.student.nis} · {s.student.class} · {s.group ?? 'Belum berkelompok'}</p>
                </div>
                <div className="hidden sm:flex items-center gap-4 shrink-0">
                  <div className="text-center">
                    <p className="text-sm font-black text-[#628ECB]">{completedStages}/{totalStages}</p>
                    <p className="text-[9px] text-[#395886]/40 uppercase">Tahap CTL</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-black ${s.overallProgress === 100 ? 'text-[#10B981]' : 'text-[#628ECB]'}`}>{s.overallProgress}%</p>
                    <p className="text-[9px] text-[#395886]/40 uppercase">Progress</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setSelectedStudent(s); }}
                    className="p-2 rounded-xl bg-[#628ECB]/10 text-[#628ECB] hover:bg-[#628ECB] hover:text-white transition-all" title="Detail lengkap">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#395886]/40 shrink-0 transition-transform ${isStudentOpen ? 'rotate-180' : ''}`} />
              </button>

              {isStudentOpen && (
                <div className="border-t border-[#D5DEEF]">
                  {displayLessons.map(lesson => {
                    const ld = lessons[lesson.lessonId];
                    if (!ld) return null;
                    const isLessonOpen = expandedLesson === `${s.student.id}-${lesson.lessonId}`;
                    const lessonMetrics = getLessonCtlMetrics(lesson);

                    return (
                      <div key={lesson.lessonId} className="border-b border-[#D5DEEF]/60 last:border-b-0">
                        <button
                          onClick={() => setExpandedLesson(isLessonOpen ? null : `${s.student.id}-${lesson.lessonId}`)}
                          className="w-full flex items-center gap-3 px-6 py-3.5 hover:bg-[#F8FAFD] text-left transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-[#395886]">{lesson.lessonTitle}</p>
                              <span className="text-xs text-[#628ECB]">{lesson.topic}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lesson.pretestCompleted ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-gray-100 text-gray-400'}`}>
                                Pre {lesson.pretestCompleted ? `✓ ${lesson.pretest}/${ld.pretest.questions.length}` : '—'}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lesson.completedStages.length > 0 ? 'bg-[#628ECB]/10 text-[#628ECB]' : 'bg-gray-100 text-gray-400'}`}>
                                CTL {lesson.completedStages.length}/{lesson.totalStages}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lesson.posttestCompleted ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-gray-100 text-gray-400'}`}>
                                Post {lesson.posttestCompleted ? `✓ ${lesson.posttest}/${ld.posttest.questions.length}` : '—'}
                              </span>
                              {lessonMetrics.attempts > 0 && (
                                <span className="text-[10px] text-[#395886]/40">{lessonMetrics.attempts} percobaan · {formatDuration(lessonMetrics.duration)}</span>
                              )}
                            </div>
                          </div>
                          <ChevronDown className={`w-3.5 h-3.5 text-[#395886]/30 shrink-0 transition-transform ${isLessonOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isLessonOpen && (
                          <div className="px-6 pb-5 space-y-3">
                            {ld.stages.map((stage, si) => {
                              const done = lesson.completedStages.includes(si);
                              const stageAnswer = lesson.stageAnswers[`stage_${si}`] ?? lesson.stageAnswers[si];
                              const tracking = lesson.stageTracking[`stage_${si}`];
                              const meta = CTL_META[stage.type] ?? CTL_META.constructivism;
                              const displayAnswer = stageAnswer || tracking?.finalAnswer || tracking?.latestSnapshot;

                              return (
                                <div key={si} className="rounded-2xl border border-[#D5DEEF] bg-white overflow-hidden">
                                  <div className="flex items-center gap-3 px-4 py-3 bg-[#F8FAFD] border-b border-[#D5DEEF]">
                                    <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#628ECB]/10 text-[#628ECB] text-[10px] font-black">{si + 1}</span>
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${meta.bg} ${meta.text} ${meta.border}`}>
                                      {meta.icon}{meta.label}
                                    </div>
                                    {done
                                      ? <span className="flex items-center gap-1 text-[10px] font-bold text-[#10B981]"><CheckCircle className="w-3 h-3" /> Selesai</span>
                                      : tracking
                                      ? <span className="text-[10px] font-bold text-amber-600">Sedang berjalan</span>
                                      : <span className="text-[10px] text-[#395886]/30">Belum dimulai</span>}
                                    {tracking && (
                                      <div className="ml-auto flex items-center gap-3 text-[9px] text-[#395886]/40">
                                        {tracking.totalAttempts > 0 && <span>{tracking.totalAttempts} percobaan</span>}
                                        {tracking.totalErrors > 0 && <span className="text-red-400">{tracking.totalErrors} kesalahan</span>}
                                        {tracking.totalDurationSec > 0 && <span>{formatDuration(tracking.totalDurationSec)}</span>}
                                      </div>
                                    )}
                                  </div>
                                  {displayAnswer && (
                                    <div className="p-4">
                                      <StageAnswerDetail stage={stage} answer={displayAnswer}
                                        snapshot={tracking?.latestSnapshot} lessonId={lesson.lessonId} />
                                    </div>
                                  )}
                                  {!displayAnswer && (
                                    <p className="px-4 py-3 text-xs text-[#395886]/30 italic">Belum ada jawaban tersimpan.</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab: Snapshot Aktivitas ───────────────────────────────────────────────────

function SnapshotTab({ students }: { students: StudentActivitySummary[] }) {
  const [lessonId, setLessonId] = useState(LESSON_LIST[0]?.id ?? '1');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState('');

  const STAGE_COLORS = ['#628ECB', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1', '#F43F5E'];

  const filtered = useMemo(() =>
    students.filter(s => !searchQ || s.student.name.toLowerCase().includes(searchQ.toLowerCase())),
    [students, searchQ]
  );

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white border border-[#D5DEEF] rounded-2xl px-5 py-4">
        <div className="flex gap-2">
          {LESSON_LIST.map(l => (
            <button key={l.id} onClick={() => setLessonId(l.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                lessonId === l.id ? 'bg-[#395886] text-white shadow-sm' : 'bg-white border border-[#D5DEEF] text-[#395886]/60 hover:text-[#395886] hover:border-[#628ECB]'
              }`}>
              Pertemuan {l.id}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#395886]/40" />
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Cari siswa..."
            className="pl-9 pr-4 py-2 text-xs border border-[#D5DEEF] rounded-xl bg-[#F8FAFD] text-[#395886] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30 w-48" />
        </div>
      </div>

      {/* Per-student snapshot */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#D5DEEF] py-12 text-center text-sm text-[#395886]/35">Tidak ada siswa ditemukan.</div>
        )}
        {filtered.map(s => {
          const lessonSummary = s.lessons.find(l => l.lessonId === lessonId);
          const ld = lessons[lessonId];
          const isOpen = expandedStudent === s.student.id;
          if (!ld || !lessonSummary) return null;

          const stages = ld.stages.map((stage, si) => ({
            stage, si, tracking: lessonSummary.stageTracking[`stage_${si}`],
            done: lessonSummary.completedStages.includes(si),
          }));
          const hasAnyData = stages.some(s => s.tracking);
          const totalDuration = Object.values(lessonSummary.stageTracking).reduce((sum, t) => sum + t.totalDurationSec, 0);
          const completedCount = lessonSummary.completedStages.length;

          return (
            <div key={s.student.id} className="bg-white rounded-2xl border border-[#D5DEEF] shadow-sm overflow-hidden">
              <button onClick={() => setExpandedStudent(isOpen ? null : s.student.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFD] text-left transition-colors">
                <div className="w-9 h-9 rounded-full bg-[#628ECB]/10 flex items-center justify-center text-[#628ECB] font-black shrink-0">
                  {s.student.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#395886]">{s.student.name}</p>
                  <p className="text-xs text-[#395886]/50">{s.student.nis} · {s.group ?? '—'}</p>
                </div>
                {/* Quick stats */}
                <div className="hidden sm:flex items-center gap-4 shrink-0">
                  <div className="text-center">
                    <p className="text-sm font-black text-[#628ECB]">{completedCount}/{ld.stages.length}</p>
                    <p className="text-[9px] text-[#395886]/40">Tahap Selesai</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-[#395886]">{formatDuration(totalDuration)}</p>
                    <p className="text-[9px] text-[#395886]/40">Total Durasi</p>
                  </div>
                  {!hasAnyData && <span className="text-xs text-[#395886]/25 italic">Belum ada aktivitas</span>}
                </div>
                <ChevronDown className={`w-4 h-4 text-[#395886]/40 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="border-t border-[#D5DEEF] px-5 py-5">
                  {/* Overall stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    {[
                      { label: 'Tahap Selesai', val: `${completedCount}/${ld.stages.length}`, color: 'text-[#628ECB]' },
                      { label: 'Total Durasi', val: formatDuration(totalDuration), color: 'text-[#395886]' },
                      { label: 'Total Percobaan', val: Object.values(lessonSummary.stageTracking).reduce((sum, t) => sum + t.totalAttempts, 0), color: 'text-[#8B5CF6]' },
                      { label: 'Total Kesalahan', val: Object.values(lessonSummary.stageTracking).reduce((sum, t) => sum + t.totalErrors, 0), color: 'text-red-500' },
                    ].map((item, i) => (
                      <div key={i} className="rounded-xl border border-[#D5DEEF] bg-[#F8FAFD] px-3 py-2.5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#395886]/40">{item.label}</p>
                        <p className={`text-lg font-black mt-1 ${item.color}`}>{item.val}</p>
                      </div>
                    ))}
                  </div>

                  {/* Timeline */}
                  <div className="relative pl-6">
                    {/* Vertical line */}
                    <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-[#D5DEEF] rounded-full" />

                    <div className="space-y-4">
                      {stages.map(({ stage, si, tracking, done }) => {
                        const meta = CTL_META[stage.type] ?? CTL_META.constructivism;
                        const color = STAGE_COLORS[si] ?? '#628ECB';

                        return (
                          <div key={si} className="relative">
                            {/* Timeline dot */}
                            <div className={`absolute -left-[1.35rem] top-3 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
                              done ? '' : tracking ? 'bg-amber-400' : 'bg-gray-200'}`}
                              style={{ backgroundColor: done ? color : undefined }}>
                              {done && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                            </div>

                            <div className={`rounded-xl border overflow-hidden ${done ? 'border-[#D5DEEF]' : tracking ? 'border-amber-200' : 'border-[#D5DEEF]/50 opacity-60'}`}>
                              {/* Stage header */}
                              <div className={`flex items-center gap-2.5 px-4 py-2.5 ${done ? 'bg-[#F8FAFD]' : tracking ? 'bg-amber-50' : 'bg-gray-50'}`}>
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${meta.bg} ${meta.text} ${meta.border}`}>
                                  {meta.icon}{meta.label}
                                </div>
                                <p className="text-xs text-[#395886]/60 truncate">{stage.title}</p>
                                {done && <span className="ml-auto text-[10px] font-bold text-[#10B981] flex items-center gap-1 shrink-0"><CheckCircle className="w-3 h-3" /> Selesai</span>}
                                {!done && tracking && <span className="ml-auto text-[10px] font-bold text-amber-600 shrink-0">Sedang berjalan</span>}
                                {!done && !tracking && <span className="ml-auto text-[10px] text-[#395886]/25 shrink-0">Belum dimulai</span>}
                              </div>

                              {/* Timeline details */}
                              {tracking && (
                                <div className="px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#395886]/40 flex items-center gap-1">
                                      <Calendar className="w-2.5 h-2.5" /> Mulai
                                    </p>
                                    <p className="text-xs font-bold text-[#395886] mt-0.5">{formatDateTime(tracking.startedAt)}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#395886]/40 flex items-center gap-1">
                                      <Activity className="w-2.5 h-2.5" /> Aktivitas Terakhir
                                    </p>
                                    <p className="text-xs font-bold text-[#395886] mt-0.5">{formatDateTime(tracking.lastActivityAt)}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#10B981]/60 flex items-center gap-1">
                                      <CheckCircle className="w-2.5 h-2.5" /> Submit
                                    </p>
                                    <p className="text-xs font-bold text-[#395886] mt-0.5">{formatDateTime(tracking.completedAt)}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#395886]/40 flex items-center gap-1">
                                      <Clock className="w-2.5 h-2.5" /> Durasi
                                    </p>
                                    <p className="text-xs font-bold text-[#395886] mt-0.5">{formatDuration(tracking.totalDurationSec)}</p>
                                  </div>
                                </div>
                              )}

                              {/* Attempt stats */}
                              {tracking && (tracking.totalAttempts > 0 || tracking.totalErrors > 0) && (
                                <div className="px-4 pb-3 flex flex-wrap gap-2">
                                  {tracking.totalAttempts > 0 && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#628ECB]/8 text-[10px] font-bold text-[#628ECB]">
                                      <RefreshCw className="w-2.5 h-2.5" /> {tracking.totalAttempts} percobaan
                                    </span>
                                  )}
                                  {tracking.totalErrors > 0 && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-[10px] font-bold text-red-500">
                                      <XCircle className="w-2.5 h-2.5" /> {tracking.totalErrors} kesalahan
                                    </span>
                                  )}
                                  {tracking.correctCount > 0 && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/8 text-[10px] font-bold text-[#10B981]">
                                      <CheckCircle className="w-2.5 h-2.5" /> {tracking.correctCount} benar
                                    </span>
                                  )}
                                  {tracking.wrongCount > 0 && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-[10px] font-bold text-amber-600">
                                      {tracking.wrongCount} salah
                                    </span>
                                  )}
                                  {Object.keys(tracking.latestSnapshot ?? {}).length > 0 && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#8B5CF6]/8 text-[10px] font-bold text-[#8B5CF6]">
                                      <AlignLeft className="w-2.5 h-2.5" /> {Object.keys(tracking.latestSnapshot).length} field snapshot
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type HasilTab = 'pretest' | 'ctl' | 'detail' | 'snapshot';

export function HasilBelajarSection({ studentActivities, exportCsv, setSelectedStudent, availableGroups }: HasilBelajarSectionProps) {
  const [activeTab, setActiveTab] = useState<HasilTab>('pretest');

  const sortedStudents = useMemo(() =>
    [...studentActivities].sort((a, b) =>
      a.student.name.localeCompare(b.student.name, 'id', { sensitivity: 'base' })
    ),
    [studentActivities]
  );

  const uniqueClasses = useMemo(() =>
    [...new Set(sortedStudents.map(s => s.student.class))].filter(Boolean).sort(),
    [sortedStudents]
  );

  const tabs: { id: HasilTab; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'pretest', label: 'Hasil Pretest & Posttest', icon: <BookOpen className="w-4 h-4" />, desc: 'Nilai, jawaban, dan status evaluasi' },
    { id: 'ctl', label: 'Monitoring CTL', icon: <Lightbulb className="w-4 h-4" />, desc: '3 indikator berpikir logis per siswa' },
    { id: 'detail', label: 'Detail Aktivitas', icon: <AlignLeft className="w-4 h-4" />, desc: 'Jawaban lengkap per tahapan CTL' },
    { id: 'snapshot', label: 'Snapshot Aktivitas', icon: <Activity className="w-4 h-4" />, desc: 'Timeline dan riwayat pengerjaan' },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#628ECB] mb-2">Analitik</p>
          <h1 className="text-3xl font-bold text-[#395886] tracking-tight mb-1">Hasil Belajar Siswa</h1>
          <p className="text-sm text-[#395886]/60">Rekap lengkap evaluasi tes, aktivitas CTL, indikator berpikir logis, dan timeline pengerjaan.</p>
        </div>
        <button onClick={exportCsv}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#628ECB] rounded-xl hover:bg-[#395886] shadow-md transition-colors shrink-0">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Tab navigation */}
      <div className="bg-white rounded-2xl border border-[#D5DEEF] shadow-sm overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-[#D5DEEF]">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-start gap-1 px-5 py-4 text-left transition-all ${
                activeTab === tab.id
                  ? 'bg-[#628ECB] text-white'
                  : 'hover:bg-[#F8FAFD] text-[#395886]'
              }`}>
              <div className={`flex items-center gap-2 ${activeTab === tab.id ? 'text-white' : 'text-[#628ECB]'}`}>
                {tab.icon}
                <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
              </div>
              <p className={`text-[10px] leading-tight ${activeTab === tab.id ? 'text-white/70' : 'text-[#395886]/50'}`}>{tab.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'pretest' && (
        <PrePostTab students={sortedStudents} availableGroups={availableGroups} uniqueClasses={uniqueClasses} setSelectedStudent={setSelectedStudent} />
      )}
      {activeTab === 'ctl' && (
        <MonitoringCTLTab students={sortedStudents} />
      )}
      {activeTab === 'detail' && (
        <DetailAktivitasTab students={sortedStudents} setSelectedStudent={setSelectedStudent} />
      )}
      {activeTab === 'snapshot' && (
        <SnapshotTab students={sortedStudents} />
      )}
    </div>
  );
}
