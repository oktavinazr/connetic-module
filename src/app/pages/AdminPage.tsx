import React, { useMemo, useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart2,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Download,
  Eye,
  FileText,
  Filter,
  HelpCircle,
  Key,
  Lightbulb,
  LogOut,
  MonitorPlay,
  Search,
  ShieldCheck,
  TrendingUp,
  Trophy,
  User,
  Users,
  Video,
  XCircle,
  X,
} from 'lucide-react';
import { useNavigate, Link, useSearchParams } from 'react-router';
import { lessons, globalPretest, globalPosttest, type Stage } from '../data/lessons';
import { getAllStudents, logout, getCurrentUser, resetStudentPassword } from '../utils/auth';
import { getAllProgress, getGlobalTestProgress, getLessonProgress } from '../utils/progress';
import { Header } from '../components/layout/Header';
import { EditLearningSection } from '../components/admin/EditLearningSection';
import { StageAnswerDetail, getStageAnswerSummary, CTL_META } from '../components/admin/StageDetail';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminSection = 'dashboard' | 'students' | 'edit-learning' | 'results';

const GROUP_STORAGE_KEY = 'student-groups';

const CHART_COLORS = ['#628ECB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

interface LessonSummary {
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
}

interface StudentActivitySummary {
  student: {
    id: string;
    name: string;
    username: string;
    email: string;
    gender: string;
    class: string;
    nis: string;
  };
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

// ─── Test Answer Section ──────────────────────────────────────────────────────

function TestAnswerSection({
  title, score, totalQ, completed, questions, answers,
}: {
  title: string;
  score: number | null;
  totalQ: number;
  completed: boolean;
  questions: Array<{ question: string; options: string[]; correctAnswer: number }>;
  answers: number[];
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
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between gap-4 bg-[#F8FAFD] px-5 py-4 text-left transition-colors hover:bg-[#F0F3FA]"
      >
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${pct >= 80 ? 'bg-[#10B981]' : pct >= 60 ? 'bg-[#F59E0B]' : 'bg-red-400'}`} />
          <div>
            <p className="text-sm font-black text-[#395886]">{title}</p>
            <p className="text-xs font-medium text-[#395886]/50">
              {correctCount} benar dari {totalQ} soal
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${
            pct >= 80 ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
            : pct >= 60 ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20'
            : 'bg-red-50 text-red-600 border-red-200'
          }`}>
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
            const studentAnswerLabel = studentAns !== null ? String.fromCharCode(65 + studentAns) : 'Tidak dijawab';
            const correctAnswerLabel = String.fromCharCode(65 + q.correctAnswer);
            return (
              <div
                key={i}
                className={`rounded-[1.5rem] border p-5 ${
                  isCorrect ? 'border-[#10B981]/25 bg-[#10B981]/[0.03]' : 'border-red-100 bg-red-50/[0.05]'
                }`}
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                      isCorrect ? 'bg-[#10B981] text-white' : 'bg-red-500 text-white'
                    }`}>
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-base font-bold leading-relaxed text-[#395886]">{q.question}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                          isCorrect ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-red-50 text-red-600'
                        }`}>
                          {isCorrect ? 'Benar' : 'Salah'}
                        </span>
                        <span className="rounded-full bg-[#F0F3FA] px-3 py-1 text-xs font-bold text-[#395886]/65">
                          Jawaban siswa: {studentAnswerLabel}
                        </span>
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                          Kunci: {correctAnswerLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                  {studentAns !== null ? (
                    isCorrect ? <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0 mt-0.5" />
                  )}
                </div>

                <div className="grid gap-2.5">
                  {q.options.map((opt, oi) => {
                    const isStudent = oi === studentAns;
                    const isCorrectOpt = oi === q.correctAnswer;
                    return (
                      <div key={oi} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                        isCorrectOpt ? 'border-[#10B981]/30 bg-[#10B981]/10 text-[#0F8A66] font-semibold'
                        : isStudent && !isCorrect ? 'border-red-200 bg-red-50 text-red-700 font-semibold'
                        : 'border-[#E5EBF5] bg-[#F8FAFD] text-[#395886]/75'
                      }`}>
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-xs font-black">
                          {String.fromCharCode(65 + oi)}
                        </span>
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

// ─── Student Detail Modal ─────────────────────────────────────────────────────

function StudentDetailModal({ activity, onClose }: { activity: StudentActivitySummary; onClose: () => void }) {
  const [tab, setTab] = useState<'summary' | 'tests' | 'ctl'>('summary');
  const tabItems = [
    { id: 'summary' as const, label: 'Ringkasan' },
    { id: 'tests' as const, label: 'Riwayat Tes' },
    { id: 'ctl' as const, label: 'Monitoring CTL' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-[#D5DEEF] bg-white shadow-2xl">
        <div className="shrink-0 bg-gradient-to-r from-[#628ECB] to-[#395886] px-8 py-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              {activity.group && (
                <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full tracking-wide mb-2 inline-block">
                  {activity.group}
                </span>
              )}
              <h2 className="text-2xl font-bold">{activity.student.name}</h2>
              <p className="text-white/75 text-sm mt-1">
                {activity.student.nis} · {activity.student.class} · {activity.student.gender}
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{activity.overallProgress}%</p>
              <p className="text-white/70 text-xs mt-1 uppercase tracking-wider">Progress Keseluruhan</p>
            </div>
          </div>
          <div className="mt-5 flex gap-1 bg-white/10 rounded-xl p-1">
            {tabItems.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  tab === t.id ? 'bg-white text-[#395886] shadow-sm' : 'text-white/70 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'summary' && (
            <div className="p-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#D5DEEF] bg-[#F8FAFD] p-4">
                  <p className="text-xs font-bold text-[#395886]/50 uppercase tracking-wide mb-3">Info Siswa</p>
                  <div className="space-y-1.5 text-sm">
                    <p className="text-[#395886]"><span className="text-[#395886]/60">Email:</span> {activity.student.email}</p>
                    <p className="text-[#395886]"><span className="text-[#395886]/60">NIS:</span> {activity.student.nis}</p>
                    <p className="text-[#395886]"><span className="text-[#395886]/60">Kelompok:</span> {activity.group ?? <span className="italic text-[#395886]/40">Belum memilih</span>}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-[#D5DEEF] bg-[#F8FAFD] p-4 text-center flex flex-col justify-center">
                  <p className="text-[10px] font-black text-[#395886]/50 uppercase tracking-widest mb-2">Pre-Test Umum</p>
                  {activity.globalPretestCompleted ? (
                    <>
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-2xl font-black text-[#628ECB]">{activity.globalPretest}</span>
                        <span className="text-sm font-bold text-[#628ECB]/30">/ {globalPretest.questions.length}</span>
                      </div>
                      <p className="text-[10px] font-black text-[#628ECB]/50 mt-1 uppercase tracking-tighter">Nilai: {Math.round(((activity.globalPretest ?? 0) / globalPretest.questions.length) * 100)}</p>
                    </>
                  ) : <p className="text-2xl font-bold text-gray-200 mt-1">—</p>}
                </div>
                <div className="rounded-2xl border border-[#D5DEEF] bg-[#F8FAFD] p-4 text-center flex flex-col justify-center">
                  <p className="text-[10px] font-black text-[#395886]/50 uppercase tracking-widest mb-2">Post-Test Umum</p>
                  {activity.globalPosttestCompleted ? (
                    <>
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-2xl font-black text-[#F59E0B]">{activity.globalPosttest}</span>
                        <span className="text-sm font-bold text-[#F59E0B]/30">/ {globalPosttest.questions.length}</span>
                      </div>
                      <p className="text-[10px] font-black text-[#F59E0B]/50 mt-1 uppercase tracking-tighter">Nilai: {Math.round(((activity.globalPosttest ?? 0) / globalPosttest.questions.length) * 100)}</p>
                    </>
                  ) : <p className="text-2xl font-bold text-gray-200 mt-1">—</p>}
                </div>
              </div>
              <div>
                <h3 className="text-[#395886] font-bold text-base mb-3">Progress Setiap Pertemuan</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {activity.lessons.map(lesson => {
                    const ld = lessons[lesson.lessonId];
                    const pct = Math.round(
                      (((lesson.pretestCompleted ? 1 : 0) + lesson.completedStages.length + (lesson.posttestCompleted ? 1 : 0)) /
                        (1 + lesson.totalStages + 1)) * 100
                    );
                    return (
                      <div key={lesson.lessonId} className="rounded-2xl border border-[#D5DEEF] p-4 bg-[#F8FAFD]">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-bold text-[#395886] text-sm">{lesson.lessonTitle}</p>
                            <p className="text-xs text-[#628ECB]">{lesson.topic}</p>
                          </div>
                          <span className="text-sm font-bold text-[#628ECB]">{pct}%</span>
                        </div>
                        <div className="w-full bg-[#D5DEEF] rounded-full h-1.5 mb-3 overflow-hidden">
                          <div className="bg-[#628ECB] h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${lesson.pretestCompleted ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                            Pre-Test {lesson.pretestCompleted ? `✓ ${lesson.pretest}/${ld?.pretest.questions.length ?? '?'}` : '—'}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${lesson.completedStages.length > 0 ? 'bg-[#628ECB]/10 text-[#628ECB] border-[#628ECB]/20' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                            CTL {lesson.completedStages.length}/{lesson.totalStages}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${lesson.posttestCompleted ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                            Post-Test {lesson.posttestCompleted ? `✓ ${lesson.posttest}/${ld?.posttest.questions.length ?? '?'}` : '—'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === 'tests' && (
            <div className="p-6 space-y-3">
              <TestAnswerSection
                title="Pre-Test Umum"
                score={activity.globalPretest}
                totalQ={globalPretest.questions.length}
                completed={activity.globalPretestCompleted}
                questions={globalPretest.questions}
                answers={activity.globalPretestAnswers}
              />
              {activity.lessons.map(lesson => {
                const ld = lessons[lesson.lessonId];
                if (!ld) return null;
                return (
                  <div key={lesson.lessonId} className="space-y-2">
                    <p className="text-xs font-bold text-[#395886]/50 uppercase tracking-widest px-1">
                      {lesson.lessonTitle} — {lesson.topic}
                    </p>
                    <TestAnswerSection
                      title={`Pre-Test ${lesson.lessonTitle}`}
                      score={lesson.pretest}
                      totalQ={ld.pretest.questions.length}
                      completed={lesson.pretestCompleted}
                      questions={ld.pretest.questions}
                      answers={lesson.pretestAnswers}
                    />
                    <TestAnswerSection
                      title={`Post-Test ${lesson.lessonTitle}`}
                      score={lesson.posttest}
                      totalQ={ld.posttest.questions.length}
                      completed={lesson.posttestCompleted}
                      questions={ld.posttest.questions}
                      answers={lesson.posttestAnswers}
                    />
                  </div>
                );
              })}
              <TestAnswerSection
                title="Post-Test Umum"
                score={activity.globalPosttest}
                totalQ={globalPosttest.questions.length}
                completed={activity.globalPosttestCompleted}
                questions={globalPosttest.questions}
                answers={activity.globalPosttestAnswers}
              />
            </div>
          )}

          {tab === 'ctl' && (
            <div className="p-6 space-y-6">
              {activity.lessons.map(lesson => {
                const ld = lessons[lesson.lessonId];
                if (!ld) return null;
                return (
                  <div key={lesson.lessonId}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-[#395886]">{lesson.lessonTitle}</h3>
                        <p className="text-xs text-[#628ECB]">{lesson.topic}</p>
                      </div>
                      <span className="text-xs font-bold text-[#628ECB] bg-[#628ECB]/10 px-3 py-1 rounded-full">
                        {lesson.completedStages.length}/{lesson.totalStages} Selesai
                      </span>
                    </div>
                    <div className="rounded-2xl border border-[#D5DEEF] overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-[#F0F3FA]">
                            <th className="px-4 py-3 text-left text-xs font-bold text-[#395886]/50 uppercase tracking-wide w-8">#</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-[#395886]/50 uppercase tracking-wide">Tahap CTL</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-[#395886]/50 uppercase tracking-wide w-24">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-[#395886]/50 uppercase tracking-wide">Ringkasan Jawaban</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D5DEEF]">
                          {ld.stages.map((stage, si) => {
                            const done = lesson.completedStages.includes(si);
                            const stageAnswer = lesson.stageAnswers[`stage_${si}`];
                            const meta = CTL_META[stage.type] ?? CTL_META.constructivism;
                            return (
                              <tr key={si} className={done ? 'bg-white' : 'bg-[#F8FAFD]'}>
                                <td className="px-4 py-3 text-xs font-bold text-[#395886]/40">{si + 1}</td>
                                <td className="px-4 py-3">
                                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${meta.bg} ${meta.text} ${meta.border}`}>
                                    {meta.icon}
                                    {meta.label}
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  {done ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#10B981]">
                                      <CheckCircle className="w-3.5 h-3.5" /> Selesai
                                    </span>
                                  ) : (
                                    <span className="text-xs font-bold text-[#395886]/30">Belum</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {done ? (
                                    <div className="group relative">
                                      <div className="max-h-20 overflow-hidden text-xs text-[#395886]/70 leading-relaxed">
                                        <StageAnswerDetail stage={stage} answer={stageAnswer} />
                                      </div>
                                      <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  ) : (
                                    <span className="text-xs text-[#395886]/30 italic">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="shrink-0 flex justify-end border-t border-[#D5DEEF] bg-[#F8FAFD] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-2xl bg-[#628ECB] px-8 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-[#395886] active:scale-95"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Sidebar ────────────────────────────────────────────────────────────

function AdminSidebar({
  section,
  onSection,
  onLogout,
  userName,
}: {
  section: AdminSection;
  onSection: (s: AdminSection) => void;
  onLogout: () => void;
  userName: string;
}) {
  const navItems: { id: AdminSection; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard Admin', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'students', label: 'Data Siswa', icon: <Users className="w-4 h-4" /> },
    { id: 'edit-learning', label: 'Manajemen Konten', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'results', label: 'Hasil Belajar', icon: <BarChart2 className="w-4 h-4" /> },
  ];
  return (
    <div className="hidden lg:flex flex-col w-64 shrink-0 bg-white border-r border-[#D5DEEF]">
      <div className="sticky top-[76px] h-[calc(100vh-76px)] flex flex-col overflow-y-auto">
        {/* User info */}
        <div className="px-4 py-5 border-b border-[#D5DEEF] bg-[#F8FAFD]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#628ECB]/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-[#628ECB]" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[#395886] text-sm truncate">{userName}</p>
              <p className="text-xs text-[#628ECB] font-semibold uppercase tracking-wide">Administrator</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#395886]/40 px-3 py-2">Menu Utama</p>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                section === item.id
                  ? 'bg-[#628ECB] text-white shadow-md'
                  : 'text-[#395886]/70 hover:text-[#395886] hover:bg-[#F0F3FA]'
              }`}
            >
              <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                section === item.id ? 'bg-white/20' : 'bg-[#628ECB]/8 text-[#628ECB]'
              }`}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-[#D5DEEF]">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <span className="shrink-0 w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </span>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Score Badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score, total, completed }: { score: number | null; total: number; completed: boolean }) {
  if (!completed) return <span className="text-xs text-[#395886]/30 font-medium">—</span>;
  const pct = Math.round(((score ?? 0) / total) * 100);
  return (
    <div className={`inline-flex flex-col items-center px-2 py-1 rounded-lg border ${
      pct >= 86 ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
      : pct >= 71 ? 'bg-[#628ECB]/10 text-[#628ECB] border-[#628ECB]/20'
      : pct >= 60 ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20'
      : 'bg-red-50 text-red-600 border-red-100'
    } min-w-[48px]`}>
      <span className="text-[11px] font-black leading-none">{score}/{total}</span>
      <span className="text-[8px] font-bold opacity-60 mt-0.5 tracking-tighter">Nilai: {pct}</span>
    </div>
  );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────

export function AdminPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = getCurrentUser();

  const initialSection = (searchParams.get('section') as AdminSection) || 'dashboard';
  const [section, setSection] = useState<AdminSection>(
    ['dashboard', 'students', 'edit-learning', 'results'].includes(initialSection) ? initialSection : 'dashboard'
  );
  const [selectedStudent, setSelectedStudent] = useState<StudentActivitySummary | null>(null);
  const [accountStudent, setAccountStudent] = useState<StudentActivitySummary | null>(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Awaited<ReturnType<typeof getAllStudents>>>([]);
  const [studentActivities, setStudentActivities] = useState<StudentActivitySummary[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Results section filters
  const [filterClass, setFilterClass] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');

  const [isResettingPw, setIsResettingPw] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetPassword = async (userId: string) => {
    if (!window.confirm('Yakin ingin mereset kata sandi siswa ini ke "connetic123"?')) return;
    
    setIsResettingPw(true);
    try {
      // Panggil fungsi secara langsung, tidak perlu pakai "await import" lagi
      const success = await resetStudentPassword(userId);
      
      if (success) {
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 3000);
      } else {
        alert('Gagal mereset kata sandi. Silakan cek koneksi internet.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan pada sistem.');
    }
    setIsResettingPw(false);
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    getAllStudents().then(setStudents);
  }, [user, navigate]);

  useEffect(() => {
    const nextSection = (searchParams.get('section') as AdminSection) || 'dashboard';
    if (nextSection !== section && ['dashboard', 'students', 'edit-learning', 'results'].includes(nextSection)) {
      setSection(nextSection);
    }
  }, [searchParams]);

  useEffect(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('section', section);
      return next;
    }, { replace: true });
  }, [section, setSearchParams]);

  const availableGroups = useMemo<string[]>(() => {
    const firstLesson = Object.values(lessons)[0];
    const lcStage = firstLesson?.stages.find(s => s.type === 'learning-community');
    return lcStage?.groupActivity?.groupNames ?? ['Kelompok 1', 'Kelompok 2', 'Kelompok 3', 'Kelompok 4', 'Kelompok 5', 'Kelompok 6', 'Kelompok 7', 'Kelompok 8'];
  }, []);

  useEffect(() => {
    if (students.length === 0) return;
    const totalSteps = 2 + Object.values(lessons).length * 9;

    Promise.all(
      students.map(async student => {
        const [allProgress, globalTests] = await Promise.all([
          getAllProgress(student.id),
          getGlobalTestProgress(student.id),
        ]);

        const lessonsData: LessonSummary[] = await Promise.all(
          Object.values(lessons).map(async lesson => {
            const lp = await getLessonProgress(student.id, lesson.id);
            return {
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              topic: lesson.topic,
              pretestCompleted: lp.pretestCompleted,
              pretest: lp.pretestScore ?? null,
              pretestAnswers: Array.isArray(lp.answers['pretest']) ? lp.answers['pretest'] : [],
              posttestCompleted: lp.posttestCompleted,
              posttest: lp.posttestScore ?? null,
              posttestAnswers: Array.isArray(lp.answers['posttest']) ? lp.answers['posttest'] : [],
              completedStages: lp.completedStages,
              totalStages: lesson.stages.length,
              stageAnswers: lp.answers,
            };
          })
        );

        let completedSteps = 0;
        if (globalTests.globalPretestCompleted) completedSteps++;
        if (globalTests.globalPosttestCompleted) completedSteps++;
        allProgress.forEach(p => {
          if (p.pretestCompleted) completedSteps++;
          completedSteps += p.completedStages.length;
          if (p.posttestCompleted) completedSteps++;
        });

        return {
          student: {
            id: student.id, name: student.name, username: student.username,
            email: student.email, gender: student.gender, class: student.class, nis: student.nis,
          },
          group: student.groupName ?? null,
          globalPretestCompleted: globalTests.globalPretestCompleted,
          globalPretest: globalTests.globalPretestScore ?? null,
          globalPretestAnswers: globalTests.globalPretestAnswers ?? [],
          globalPosttestCompleted: globalTests.globalPosttestCompleted,
          globalPosttest: globalTests.globalPosttestScore ?? null,
          globalPosttestAnswers: globalTests.globalPosttestAnswers ?? [],
          overallProgress: Math.round((completedSteps / totalSteps) * 100),
          lessons: lessonsData,
        };
      })
    ).then(setStudentActivities);
  }, [students]);

  // Stats
  const totalStudents = studentActivities.length;
  const activeStudents = studentActivities.filter(s => s.overallProgress > 0).length;
  const averageProgress = totalStudents > 0
    ? Math.round(studentActivities.reduce((sum, s) => sum + s.overallProgress, 0) / totalStudents)
    : 0;
  const completedStudents = studentActivities.filter(s => s.overallProgress === 100).length;

  // Filtered students for table
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return studentActivities;
    return studentActivities.filter(s =>
      s.student.name.toLowerCase().includes(q) ||
      s.student.nis.toLowerCase().includes(q) ||
      s.student.class.toLowerCase().includes(q) ||
      (s.group ?? '').toLowerCase().includes(q)
    );
  }, [studentActivities, searchQuery]);

  // Students by group
  const studentsByGroup = useMemo(() => {
    const groups: Record<string, StudentActivitySummary[]> = {};
    availableGroups.forEach(g => (groups[g] = []));
    const noGroup: StudentActivitySummary[] = [];
    studentActivities.forEach(activity => {
      if (activity.group && groups[activity.group] !== undefined) {
        groups[activity.group].push(activity);
      } else if (activity.group) {
        if (!groups[activity.group]) groups[activity.group] = [];
        groups[activity.group].push(activity);
      } else {
        noGroup.push(activity);
      }
    });
    return { groups, noGroup };
  }, [studentActivities, availableGroups]);

  // Unique classes for filter
  const uniqueClasses = useMemo(() =>
    [...new Set(studentActivities.map(s => s.student.class))].filter(Boolean).sort(),
    [studentActivities]
  );

  // Filtered for results
  const filteredResults = useMemo(() => {
    return studentActivities.filter(s => {
      if (filterClass !== 'all' && s.student.class !== filterClass) return false;
      if (filterGroup !== 'all' && (s.group ?? 'none') !== filterGroup) return false;
      return true;
    });
  }, [studentActivities, filterClass, filterGroup]);

  const lessonList = Object.values(lessons);

  // ── Student table state ──────────────────────────────────────────────────
  const [sortCol, setSortCol] = useState<'name' | 'group' | 'progress'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filterGroupStudents, setFilterGroupStudents] = useState('all');

  function toggleSort(col: typeof sortCol) {
    if (sortCol === col) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortCol(col); setSortDir('asc'); }
  }

  const filteredAndSortedStudents = useMemo(() => {
    let list = studentActivities.filter(s => {
      if (filterGroupStudents !== 'all' && (s.group ?? 'none') !== filterGroupStudents) return false;
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      return (
        s.student.name.toLowerCase().includes(q) ||
        s.student.username.toLowerCase().includes(q) ||
        s.student.email.toLowerCase().includes(q) ||
        s.student.nis.toLowerCase().includes(q) ||
        (s.group ?? '').toLowerCase().includes(q)
      );
    });
    list = [...list].sort((a, b) => {
      let va: string | number = '';
      let vb: string | number = '';
      if (sortCol === 'name') { va = a.student.name; vb = b.student.name; }
      else if (sortCol === 'group') { va = a.group ?? ''; vb = b.group ?? ''; }
      else if (sortCol === 'progress') { va = a.overallProgress; vb = b.overallProgress; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [studentActivities, searchQuery, filterGroupStudents, sortCol, sortDir]);

  // ── Chart data ───────────────────────────────────────────────────────────
  const pretestPosttestData = useMemo(() => {
    const pctOf = (score: number | null, total: number) =>
      total > 0 && score !== null ? Math.round((score / total) * 100) : 0;

    const avgArr = (arr: number[]) =>
      arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

    const globalPre = studentActivities
      .filter(s => s.globalPretestCompleted)
      .map(s => pctOf(s.globalPretest, globalPretest.questions.length));
    const globalPost = studentActivities
      .filter(s => s.globalPosttestCompleted)
      .map(s => pctOf(s.globalPosttest, globalPosttest.questions.length));

    const rows = [
      { name: 'Pre/Post Umum', pretest: avgArr(globalPre), posttest: avgArr(globalPost) },
      ...lessonList.map(lesson => {
        const pre = studentActivities
          .flatMap(s => s.lessons.filter(l => l.lessonId === lesson.id && l.pretestCompleted))
          .map(l => pctOf(l.pretest, lesson.pretest.questions.length));
        const post = studentActivities
          .flatMap(s => s.lessons.filter(l => l.lessonId === lesson.id && l.posttestCompleted))
          .map(l => pctOf(l.posttest, lesson.posttest.questions.length));
        return { name: lesson.title, pretest: avgArr(pre), posttest: avgArr(post) };
      }),
    ];
    return rows;
  }, [studentActivities, lessonList]);

  const lessonProgressData = useMemo(() =>
    lessonList.map(lesson => {
      const total = studentActivities.length || 1;
      const selesai = studentActivities.filter(s => {
        const ld = s.lessons.find(l => l.lessonId === lesson.id);
        return ld && ld.pretestCompleted && ld.completedStages.length === ld.totalStages && ld.posttestCompleted;
      }).length;
      const berjalan = studentActivities.filter(s => {
        const ld = s.lessons.find(l => l.lessonId === lesson.id);
        return ld && (ld.pretestCompleted || ld.completedStages.length > 0) &&
          !(ld.pretestCompleted && ld.completedStages.length === ld.totalStages && ld.posttestCompleted);
      }).length;
      return {
        name: lesson.title,
        selesai: Math.round((selesai / total) * 100),
        berjalan: Math.round((berjalan / total) * 100),
      };
    }),
  [studentActivities, lessonList]);

  const groupDistData = useMemo(() => {
    const groups: Record<string, number> = {};
    studentActivities.forEach(s => {
      const g = s.group ?? 'Belum Bergabung';
      groups[g] = (groups[g] ?? 0) + 1;
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [studentActivities]);

  const ctlCompletionData = useMemo(() => {
    const stageTypes: Record<string, { completed: number; total: number }> = {};
    studentActivities.forEach(s => {
      s.lessons.forEach(lesson => {
        const ld = lessons[lesson.lessonId];
        if (!ld) return;
        ld.stages.forEach((stage, si) => {
          const key = CTL_META[stage.type]?.label ?? stage.type;
          if (!stageTypes[key]) stageTypes[key] = { completed: 0, total: 0 };
          stageTypes[key].total++;
          if (lesson.completedStages.includes(si)) stageTypes[key].completed++;
        });
      });
    });
    return Object.entries(stageTypes).map(([name, d]) => ({
      name,
      pct: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0,
    }));
  }, [studentActivities]);

  const activityData = useMemo(() => [
    { name: 'Aktif', value: activeStudents, color: '#10B981' },
    { name: 'Belum Aktif', value: totalStudents - activeStudents, color: '#D5DEEF' },
  ], [activeStudents, totalStudents]);

  function exportCsv() {
    const headers = [
      'NIS', 'Nama', 'Kelas', 'Kelompok', 'Progress (%)',
      'Pre-Test Umum', 'Post-Test Umum',
      ...lessonList.flatMap(l => [`Pre-${l.title}`, `Post-${l.title}`]),
    ];
    const rows = filteredResults.map(s => [
      s.student.nis,
      s.student.name,
      s.student.class,
      s.group ?? '-',
      s.overallProgress,
      s.globalPretestCompleted ? s.globalPretest ?? 0 : '-',
      s.globalPosttestCompleted ? s.globalPosttest ?? 0 : '-',
      ...s.lessons.flatMap(l => [
        l.pretestCompleted ? l.pretest ?? 0 : '-',
        l.posttestCompleted ? l.posttest ?? 0 : '-',
      ]),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hasil-belajar-connetic.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const handleLogout = () => { logout(); navigate('/'); };
  const confirmLogout = () => setIsLogoutOpen(true);

  const mobileNavItems = [
    { label: 'Dashboard Admin', onClick: () => setSection('dashboard'), icon: <ShieldCheck className="h-4 w-4" /> },
    { label: 'Data Siswa', onClick: () => setSection('students'), icon: <Users className="h-4 w-4" /> },
    { label: 'Manajemen Konten Pembelajaran', onClick: () => setSection('edit-learning'), icon: <BookOpen className="h-4 w-4" /> },
    { label: 'Hasil Belajar', onClick: () => setSection('results'), icon: <BarChart2 className="h-4 w-4" /> },
    { label: 'Logout', onClick: confirmLogout, icon: <LogOut className="h-4 w-4" />, danger: true },
  ];

  const sectionLabel: Record<AdminSection, string> = {
    dashboard: 'Dashboard Admin',
    students: 'Data Siswa',
    'edit-learning': 'Manajemen Konten Pembelajaran',
    results: 'Hasil Belajar',
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F0F3FA]">
      <Header
        user={user}
        onLogout={confirmLogout}
        activeSection={sectionLabel[section]}
        role="admin"
      />

      {/* ── Body ── */}
      <div className="flex">
        {/* Desktop sidebar */}
        <AdminSidebar
          section={section}
          onSection={setSection}
          onLogout={confirmLogout}
          userName={user.name}
        />

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* ── Dashboard ── */}
            {section === 'dashboard' && (
              <div className="space-y-7">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#628ECB] mb-2">Monitoring Panel</p>
                  <h1 className="text-3xl font-bold text-[#395886] tracking-tight mb-1">Dashboard Admin</h1>
                  <p className="text-sm text-[#395886]/60">Pantau aktivitas siswa dan progres pembelajaran CTL secara menyeluruh.</p>
                </div>

                {/* Stat cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: 'Total Siswa', value: totalStudents, colorVal: 'text-[#395886]', iconBg: 'bg-[#628ECB]/10 text-[#628ECB]', icon: <Users className="w-6 h-6" /> },
                    { label: 'Siswa Aktif', value: activeStudents, colorVal: 'text-[#10B981]', iconBg: 'bg-[#10B981]/10 text-[#10B981]', icon: <TrendingUp className="w-6 h-6" /> },
                    { label: 'Rata-rata Progress', value: `${averageProgress}%`, colorVal: 'text-[#628ECB]', iconBg: 'bg-[#628ECB]/10 text-[#628ECB]', icon: <ShieldCheck className="w-6 h-6" /> },
                    { label: 'Selesai Semua', value: completedStudents, colorVal: 'text-[#F59E0B]', iconBg: 'bg-[#F59E0B]/10 text-[#F59E0B]', icon: <Trophy className="w-6 h-6" /> },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-sm p-5 border border-[#D5DEEF] hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-[#395886]/55 mb-1">{stat.label}</p>
                          <p className={`text-3xl font-bold ${stat.colorVal}`}>{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-2xl ${stat.iconBg}`}>{stat.icon}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Row 1: Pretest vs Posttest + Activity donut */}
                <div className="grid gap-5 lg:grid-cols-3">
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D5DEEF] shadow-sm p-6">
                    <h3 className="font-bold text-[#395886] mb-1">Perbandingan Rata-rata Pretest & Posttest</h3>
                    <p className="text-xs text-[#395886]/50 mb-5">Rata-rata skor siswa dalam persentase (%)</p>
                    {studentActivities.length === 0 ? (
                      <div className="h-56 flex items-center justify-center text-sm text-[#395886]/35">Belum ada data.</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={230}>
                        <BarChart data={pretestPosttestData} barCategoryGap="28%" barGap={4}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5EBF5" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#395886', fontWeight: 600 }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: '#395886' }} axisLine={false} tickLine={false} />
                          <Tooltip formatter={(v: number) => [`${v}%`]} contentStyle={{ borderRadius: 12, border: '1px solid #D5DEEF', fontSize: 12 }} />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          <Bar dataKey="pretest" name="Pretest" fill="#628ECB" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="posttest" name="Posttest" fill="#10B981" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border border-[#D5DEEF] shadow-sm p-6 flex flex-col">
                    <h3 className="font-bold text-[#395886] mb-1">Status Aktivitas Siswa</h3>
                    <p className="text-xs text-[#395886]/50 mb-4">Siswa aktif vs belum aktif</p>
                    {totalStudents === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-sm text-[#395886]/35">Belum ada data.</div>
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height={170}>
                          <PieChart>
                            <Pie data={activityData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                              {activityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #D5DEEF', fontSize: 12 }} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-3 space-y-2">
                          {activityData.map((d, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2 text-[#395886]/70 font-medium">
                                <span className="h-3 w-3 rounded-full shrink-0" style={{ background: d.color }} />
                                {d.name}
                              </span>
                              <span className="font-bold text-[#395886]">{d.value} siswa</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Row 2: Lesson progress + Group distribution */}
                <div className="grid gap-5 lg:grid-cols-3">
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-[#D5DEEF] shadow-sm p-6">
                    <h3 className="font-bold text-[#395886] mb-1">Progres Penyelesaian Pertemuan</h3>
                    <p className="text-xs text-[#395886]/50 mb-5">Persentase siswa yang selesai dan sedang berjalan per pertemuan</p>
                    {studentActivities.length === 0 ? (
                      <div className="h-52 flex items-center justify-center text-sm text-[#395886]/35">Belum ada data.</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={Math.max(180, lessonProgressData.length * 44)}>
                        <BarChart data={lessonProgressData} layout="vertical" barCategoryGap="30%">
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5EBF5" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: '#395886' }} axisLine={false} tickLine={false} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#395886', fontWeight: 600 }} width={90} axisLine={false} tickLine={false} />
                          <Tooltip formatter={(v: number) => [`${v}%`]} contentStyle={{ borderRadius: 12, border: '1px solid #D5DEEF', fontSize: 12 }} />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          <Bar dataKey="selesai" name="Selesai" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="berjalan" name="Berjalan" stackId="a" fill="#628ECB" radius={[0, 6, 6, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border border-[#D5DEEF] shadow-sm p-6 flex flex-col">
                    <h3 className="font-bold text-[#395886] mb-1">Distribusi Kelompok</h3>
                    <p className="text-xs text-[#395886]/50 mb-4">Jumlah siswa per kelompok</p>
                    {groupDistData.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-sm text-[#395886]/35">Belum ada data.</div>
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height={170}>
                          <PieChart>
                            <Pie data={groupDistData} cx="50%" cy="50%" outerRadius={75} paddingAngle={3} dataKey="value">
                              {groupDistData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #D5DEEF', fontSize: 12 }} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-2 space-y-1.5 overflow-y-auto max-h-32">
                          {groupDistData.map((d, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-1.5 text-[#395886]/70 font-medium truncate">
                                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                {d.name}
                              </span>
                              <span className="font-bold text-[#395886] ml-2 shrink-0">{d.value}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Row 3: CTL Stage completion */}
                <div className="bg-white rounded-2xl border border-[#D5DEEF] shadow-sm p-6">
                  <h3 className="font-bold text-[#395886] mb-1">Persentase Penyelesaian Tahapan CTL</h3>
                  <p className="text-xs text-[#395886]/50 mb-5">Persentase siswa yang telah menyelesaikan setiap jenis tahapan CTL</p>
                  {ctlCompletionData.length === 0 ? (
                    <div className="h-44 flex items-center justify-center text-sm text-[#395886]/35">Belum ada data.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={ctlCompletionData} barCategoryGap="32%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5EBF5" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#395886', fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: '#395886' }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v: number) => [`${v}%`, 'Penyelesaian']} contentStyle={{ borderRadius: 12, border: '1px solid #D5DEEF', fontSize: 12 }} />
                        <Bar dataKey="pct" name="Penyelesaian (%)" radius={[6, 6, 0, 0]}>
                          {ctlCompletionData.map((entry, i) => (
                            <Cell key={i} fill={entry.pct >= 80 ? '#10B981' : entry.pct >= 50 ? '#628ECB' : '#F59E0B'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Row 4: Top students */}
                <div className="bg-white rounded-2xl border border-[#D5DEEF] shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#D5DEEF] flex items-center justify-between">
                    <h3 className="font-bold text-[#395886]">Progres Siswa Teratas</h3>
                    <span className="text-xs font-bold bg-[#628ECB]/10 text-[#628ECB] px-2.5 py-1 rounded-full">Top 5</span>
                  </div>
                  <div className="divide-y divide-[#D5DEEF]">
                    {[...studentActivities]
                      .sort((a, b) => b.overallProgress - a.overallProgress)
                      .slice(0, 5)
                      .map((s, i) => (
                        <div key={s.student.id} className="px-6 py-3.5 flex items-center gap-3 hover:bg-[#F8FAFD] transition-colors">
                          <span className={`shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${i === 0 ? 'bg-[#F59E0B] text-white' : i === 1 ? 'bg-[#395886]/20 text-[#395886]' : 'bg-[#628ECB]/10 text-[#628ECB]'}`}>
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-[#395886] truncate">{s.student.name}</p>
                            <p className="text-xs text-[#395886]/50">{s.student.class}{s.group ? ` · ${s.group}` : ''}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <p className="text-xs font-black text-[#628ECB] leading-none">{s.overallProgress}<span className="text-[10px] opacity-40">%</span></p>
                              <p className="text-[8px] font-bold text-[#395886]/30 uppercase tracking-tighter mt-0.5">Progress</p>
                            </div>
                            <div className="w-12 bg-[#D5DEEF] rounded-full h-1 overflow-hidden">
                              <div className={`h-full rounded-full ${s.overallProgress === 100 ? 'bg-[#10B981]' : 'bg-[#628ECB]'}`} style={{ width: `${s.overallProgress}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    {studentActivities.length === 0 && (
                      <div className="px-6 py-8 text-center">
                        <p className="text-sm text-[#395886]/40">Belum ada data siswa.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Data Siswa ── */}
            {section === 'students' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#628ECB] mb-1">Manajemen</p>
                    <h1 className="text-2xl font-bold text-[#395886]">Data Siswa</h1>
                    <p className="text-sm text-[#395886]/60 mt-1">Kelola data seluruh siswa, pantau progres, dan akses akun secara langsung.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={filterClass}
                      onChange={e => setFilterClass(e.target.value)}
                      className="px-4 py-2 text-sm border border-[#D5DEEF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30 bg-white text-[#395886] font-semibold"
                    >
                      <option value="all">Semua Kelas</option>
                      {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                      value={filterGroupStudents}
                      onChange={e => setFilterGroupStudents(e.target.value)}
                      className="px-4 py-2 text-sm border border-[#D5DEEF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30 bg-white text-[#395886] font-semibold"
                    >
                      <option value="all">Semua Kelompok</option>
                      <option value="none">Belum Berkelompok</option>
                      {availableGroups.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-[#D5DEEF]">
                  <div className="px-8 py-5 border-b border-[#D5DEEF] flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#628ECB]/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#628ECB]" />
                      </div>
                      <div>
                        <h2 className="text-[#395886] font-bold text-lg leading-tight">Daftar Siswa</h2>
                        <p className="text-xs text-[#395886]/50 font-medium">Total {filteredAndSortedStudents.length} siswa ditemukan</p>
                      </div>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#395886]/40" />
                      <input
                        type="text"
                        placeholder="Cari nama, username, email..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2.5 text-sm border border-[#D5DEEF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30 focus:border-[#628ECB] bg-[#F8FAFD] text-[#395886] w-72 transition-all"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] border-collapse">
                      <thead>
                        <tr className="bg-[#F0F3FA]/50 border-b border-[#D5DEEF]">
                          <th className="px-6 py-4 text-left text-[11px] font-black text-[#395886]/50 uppercase tracking-widest cursor-pointer hover:text-[#628ECB] transition-colors" onClick={() => toggleSort('name')}>
                            <div className="flex items-center gap-1">
                              Nama & Identitas
                              {sortCol === 'name' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-[11px] font-black text-[#395886]/50 uppercase tracking-widest cursor-pointer hover:text-[#628ECB] transition-colors" onClick={() => toggleSort('group')}>
                            <div className="flex items-center gap-1">
                              Kelompok
                              {sortCol === 'group' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-[11px] font-black text-[#395886]/50 uppercase tracking-widest">Username / Email</th>
                          <th className="px-6 py-4 text-center text-[11px] font-black text-[#395886]/50 uppercase tracking-widest">Gender</th>
                          <th className="px-6 py-4 text-left text-[11px] font-black text-[#395886]/50 uppercase tracking-widest cursor-pointer hover:text-[#628ECB] transition-colors" onClick={() => toggleSort('progress')}>
                            <div className="flex items-center gap-1">
                              Progres Belajar
                              {sortCol === 'progress' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-right text-[11px] font-black text-[#395886]/50 uppercase tracking-widest">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D5DEEF]">
                        {filteredAndSortedStudents.map(activity => (
                          <tr key={activity.student.id} className="hover:bg-[#F8FAFD] transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#395886]/10 to-[#628ECB]/10 flex items-center justify-center text-[#395886] font-bold text-xs shrink-0">
                                  {activity.student.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-[#395886] text-sm truncate">{activity.student.name}</p>
                                  <p className="text-[11px] font-bold text-[#628ECB] mt-0.5">{activity.student.nis} · {activity.student.class}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 min-w-[150px]">
                              {activity.group ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#628ECB]/10 text-[#628ECB] text-xs font-bold border border-[#628ECB]/20 whitespace-nowrap">
                                  <Users className="w-3 h-3 shrink-0" /> {activity.group}
                                </span>
                              ) : (
                                <span className="text-xs text-[#395886]/30 italic font-medium whitespace-nowrap">Belum memilih</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-xs font-bold text-[#395886]">{activity.student.username}</p>
                              <p className="text-[11px] text-[#395886]/50 mt-0.5">{activity.student.email}</p>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-lg ${activity.student.gender === 'Laki-laki' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                {activity.student.gender === 'Laki-laki' ? 'L' : 'P'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-[#D5DEEF] rounded-full overflow-hidden max-w-[100px]">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      activity.overallProgress === 100 ? 'bg-[#10B981]' : 'bg-[#628ECB]'
                                    }`}
                                    style={{ width: `${activity.overallProgress}%` }}
                                  />
                                </div>
                                <span className="text-xs font-black text-[#395886]">{activity.overallProgress}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setSelectedStudent(activity)}
                                  className="p-2 rounded-xl bg-[#628ECB]/10 text-[#628ECB] hover:bg-[#628ECB] hover:text-white transition-all shadow-sm"
                                  title="Detail Hasil Belajar"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setAccountStudent(activity)}
                                  className="p-2 rounded-xl bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981] hover:text-white transition-all shadow-sm"
                                  title="Lihat Info Akun"
                                >
                                  <Key className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredAndSortedStudents.length === 0 && (
                    <div className="px-8 py-20 text-center">
                      <div className="w-16 h-16 bg-[#F8FAFD] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#D5DEEF]">
                        <Search className="w-8 h-8 text-[#395886]/20" />
                      </div>
                      <h3 className="text-lg font-bold text-[#395886]">Tidak ada hasil ditemukan</h3>
                      <p className="text-sm text-[#395886]/50 max-w-xs mx-auto mt-1">Coba sesuaikan kata kunci atau filter yang sedang digunakan.</p>
                      <button
                        onClick={() => { setSearchQuery(''); setFilterGroupStudents('all'); setFilterClass('all'); }}
                        className="mt-6 text-sm font-bold text-[#628ECB] hover:underline"
                      >
                        Reset semua filter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Kelompok ── */}
            {false && (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#628ECB] mb-1">Monitoring</p>
                  <h1 className="text-2xl font-bold text-[#395886]">Kelompok Belajar</h1>
                  <p className="text-sm text-[#395886]/60 mt-1">Pantau anggota dan progres setiap kelompok.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="bg-white rounded-2xl border border-[#D5DEEF] p-5 shadow-sm">
                    <p className="text-xs font-bold text-[#395886]/50 uppercase tracking-wide mb-1">Total Kelompok</p>
                    <p className="text-3xl font-bold text-[#395886]">{availableGroups.length}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-[#D5DEEF] p-5 shadow-sm">
                    <p className="text-xs font-bold text-[#395886]/50 uppercase tracking-wide mb-1">Sudah Bergabung</p>
                    <p className="text-3xl font-bold text-[#10B981]">{studentActivities.filter(s => s.group).length}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-[#D5DEEF] p-5 shadow-sm">
                    <p className="text-xs font-bold text-[#395886]/50 uppercase tracking-wide mb-1">Belum Bergabung</p>
                    <p className="text-3xl font-bold text-[#F59E0B]">{studentActivities.filter(s => !s.group).length}</p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {availableGroups.map(groupName => {
                    const members = studentsByGroup.groups[groupName] ?? [];
                    const avgProgress = members.length > 0
                      ? Math.round(members.reduce((s, m) => s + m.overallProgress, 0) / members.length)
                      : 0;
                    return (
                      <div key={groupName} className="bg-white rounded-2xl border border-[#D5DEEF] shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-[#628ECB] to-[#395886] px-5 py-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-white text-base">{groupName}</h3>
                            <span className="text-xs font-bold bg-white/20 text-white px-2.5 py-1 rounded-full">
                              {members.length} anggota
                            </span>
                          </div>
                          {members.length > 0 && (
                            <div className="mt-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-white/70">Avg. Progress</span>
                                <span className="text-xs font-bold text-white">{avgProgress}%</span>
                              </div>
                              <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-white h-full rounded-full" style={{ width: `${avgProgress}%` }} />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="divide-y divide-[#D5DEEF]">
                          {members.length === 0 ? (
                            <div className="px-5 py-6 text-center">
                              <Users className="w-8 h-8 text-[#D5DEEF] mx-auto mb-2" />
                              <p className="text-sm text-[#395886]/40 italic">Belum ada anggota</p>
                            </div>
                          ) : (
                            members.map(m => (
                              <div key={m.student.id} className="px-5 py-3 flex items-center gap-3 hover:bg-[#F8FAFD] transition-colors">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#628ECB]/10 text-[#628ECB]">
                                  <User className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-[#395886] text-sm truncate">{m.student.name}</p>
                                  <p className="text-xs text-[#395886]/50">{m.student.class}</p>
                                </div>
                                <span className="text-xs font-bold text-[#628ECB] shrink-0">{m.overallProgress}%</span>
                                <button
                                  onClick={() => setSelectedStudent(m)}
                                  className="shrink-0 text-[#395886]/30 hover:text-[#628ECB] transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {studentsByGroup.noGroup.length > 0 && (
                  <div className="bg-white rounded-2xl border border-[#D5DEEF] shadow-sm overflow-hidden">
                    <div className="px-5 py-4 bg-[#F8FAFD] border-b border-[#D5DEEF]">
                      <h3 className="font-bold text-[#395886]/60 text-sm flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Belum Memilih Kelompok ({studentsByGroup.noGroup.length} siswa)
                      </h3>
                    </div>
                    <div className="divide-y divide-[#D5DEEF]">
                      {studentsByGroup.noGroup.map(m => (
                        <div key={m.student.id} className="px-5 py-3 flex items-center gap-3 hover:bg-[#F8FAFD] transition-colors">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#395886] text-sm truncate">{m.student.name}</p>
                            <p className="text-xs text-[#395886]/50">{m.student.class} · {m.student.nis}</p>
                          </div>
                          <span className="text-xs font-bold text-[#395886]/50">{m.overallProgress}%</span>
                          <button onClick={() => setSelectedStudent(m)} className="shrink-0 text-[#395886]/30 hover:text-[#628ECB] transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Edit Pembelajaran ── */}
            {section === 'edit-learning' && <EditLearningSection />}

            {/* ── Hasil Belajar ── */}
            {section === 'results' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#628ECB] mb-1">Analitik</p>
                    <h1 className="text-2xl font-bold text-[#395886]">Hasil Belajar</h1>
                    <p className="text-sm text-[#395886]/60 mt-1">Rekap nilai pre-test dan post-test seluruh siswa.</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative group">
                      <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[#395886] bg-white border border-[#D5DEEF] rounded-xl hover:border-[#628ECB] transition-all shadow-sm">
                        <Eye className="w-4 h-4 text-[#628ECB]" />
                        Lihat Detail Jawaban
                        <ChevronDown className="w-4 h-4 text-[#395886]/30" />
                      </button>
                      <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-[#D5DEEF] rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2 overflow-hidden">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40 px-3 py-2 border-b border-[#D5DEEF] mb-1">Evaluasi Umum</p>
                        <Link to="/admin/results/global-pretest" className="flex items-center justify-between px-3 py-2 hover:bg-[#F0F3FA] rounded-xl text-sm font-bold text-[#395886] transition-colors">
                          Pretest Umum <ChevronRight className="w-3 h-3" />
                        </Link>
                        <Link to="/admin/results/global-posttest" className="flex items-center justify-between px-3 py-2 hover:bg-[#F0F3FA] rounded-xl text-sm font-bold text-[#395886] transition-colors">
                          Posttest Umum <ChevronRight className="w-3 h-3" />
                        </Link>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40 px-3 py-2 border-b border-[#D5DEEF] mt-2 mb-1">Per Pertemuan</p>
                        <div className="max-h-60 overflow-y-auto pr-1">
                          {lessonList.map(l => (
                            <div key={l.id} className="space-y-0.5 mb-2">
                              <p className="px-3 text-[10px] font-bold text-[#628ECB]">{l.title}</p>
                              <Link to={`/admin/results/lesson-pretest/${l.id}`} className="flex items-center justify-between px-4 py-1.5 hover:bg-[#F0F3FA] rounded-lg text-xs font-semibold text-[#395886]">
                                Pretest <ChevronRight className="w-2.5 h-2.5" />
                              </Link>
                              <Link to={`/admin/results/lesson-posttest/${l.id}`} className="flex items-center justify-between px-4 py-1.5 hover:bg-[#F0F3FA] rounded-lg text-xs font-semibold text-[#395886]">
                                Posttest <ChevronRight className="w-2.5 h-2.5" />
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={exportCsv}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#628ECB] rounded-xl hover:bg-[#395886] shadow-md transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                  </div>
                </div>

                {/* Summaries */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Avg Pre-Umum', val: pretestPosttestData[0].pretest, color: 'text-[#628ECB]' },
                    { label: 'Avg Post-Umum', val: pretestPosttestData[0].posttest, color: 'text-[#F59E0B]' },
                    { label: 'Siswa Tuntas', val: completedStudents, color: 'text-[#10B981]' },
                    { label: 'Siswa Berjalan', val: activeStudents - completedStudents, color: 'text-blue-500' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-[#D5DEEF] shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40 mb-1">{s.label}</p>
                      <p className={`text-2xl font-black ${s.color}`}>{typeof s.val === 'number' && s.val <= 100 && i < 2 ? `${s.val}%` : s.val}</p>
                    </div>
                  ))}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 items-center bg-white border border-[#D5DEEF] rounded-2xl px-5 py-4 shadow-sm">
                  <span className="text-sm font-semibold text-[#395886]/60">Filter:</span>
                  <select
                    value={filterClass}
                    onChange={e => setFilterClass(e.target.value)}
                    className="border border-[#D5DEEF] rounded-xl px-3 py-2 text-sm text-[#395886] bg-[#F8FAFD] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30 focus:border-[#628ECB]"
                  >
                    <option value="all">Semua Kelas</option>
                    {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select
                    value={filterGroup}
                    onChange={e => setFilterGroup(e.target.value)}
                    className="border border-[#D5DEEF] rounded-xl px-3 py-2 text-sm text-[#395886] bg-[#F8FAFD] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30 focus:border-[#628ECB]"
                  >
                    <option value="all">Semua Kelompok</option>
                    {availableGroups.map(g => <option key={g} value={g}>{g}</option>)}
                    <option value="none">Belum Bergabung</option>
                  </select>
                  {(filterClass !== 'all' || filterGroup !== 'all') && (
                    <button
                      onClick={() => { setFilterClass('all'); setFilterGroup('all'); }}
                      className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Reset Filter
                    </button>
                  )}
                  <span className="text-xs text-[#395886]/50 ml-auto">{filteredResults.length} siswa</span>
                </div>

                {/* Results table */}
                <div className="bg-white rounded-2xl border border-[#D5DEEF] shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse" style={{ minWidth: `${600 + lessonList.length * 140}px` }}>
                      <thead>
                        <tr className="bg-[#F0F3FA]">
                          <th className="px-4 py-3 text-left text-xs font-bold text-[#395886]/55 uppercase tracking-wide sticky left-0 bg-[#F0F3FA] z-10 min-w-[160px]">Siswa</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-[#395886]/55 uppercase tracking-wide">Kelas</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-[#395886]/55 uppercase tracking-wide min-w-[120px]">Kelompok</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-[#628ECB]/70 uppercase tracking-wide bg-[#628ECB]/5">Pre-Umum</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-[#F59E0B]/80 uppercase tracking-wide bg-[#F59E0B]/5">Post-Umum</th>
                          {lessonList.map(l => (
                            <th key={l.id} colSpan={2} className="px-4 py-3 text-center text-xs font-bold text-[#395886]/55 uppercase tracking-wide border-l border-[#D5DEEF]">
                              {l.title}
                            </th>
                          ))}
                          <th className="px-4 py-3 text-center text-xs font-bold text-[#395886]/55 uppercase tracking-wide">Progress</th>
                        </tr>
                        <tr className="bg-[#F8FAFD] border-b border-[#D5DEEF]">
                          <th className="sticky left-0 bg-[#F8FAFD] z-10" />
                          <th />
                          <th />
                          <th className="px-4 py-2 text-center text-[10px] font-bold text-[#628ECB]/60 bg-[#628ECB]/5">Nilai</th>
                          <th className="px-4 py-2 text-center text-[10px] font-bold text-[#F59E0B]/70 bg-[#F59E0B]/5">Nilai</th>
                          {lessonList.map(l => (
                            <>
                              <th key={`${l.id}-pre`} className="px-3 py-2 text-center text-[10px] font-bold text-[#10B981]/70 border-l border-[#D5DEEF]">Pre</th>
                              <th key={`${l.id}-post`} className="px-3 py-2 text-center text-[10px] font-bold text-[#F59E0B]/70">Post</th>
                            </>
                          ))}
                          <th />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D5DEEF]">
                        {filteredResults.length === 0 ? (
                          <tr>
                            <td colSpan={5 + lessonList.length * 2 + 1} className="px-6 py-10 text-center">
                              <p className="text-sm text-[#395886]/40">Tidak ada data yang sesuai filter.</p>
                            </td>
                          </tr>
                        ) : (
                          filteredResults.map(s => (
                            <tr key={s.student.id} className="hover:bg-[#F8FAFD] transition-colors">
                              <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-[#F8FAFD] z-10 border-r border-[#D5DEEF]/50">
                                <div className="flex items-center gap-2">
                                  <div>
                                    <p className="font-bold text-sm text-[#395886]">{s.student.name}</p>
                                    <p className="text-xs text-[#395886]/50">{s.student.nis}</p>
                                  </div>
                                  <button
                                    onClick={() => setSelectedStudent(s)}
                                    className="ml-1 text-[#395886]/30 hover:text-[#628ECB] transition-colors shrink-0"
                                    title="Lihat detail"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-[#395886]/70">{s.student.class}</td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {s.group ? (
                                  <span className="text-xs font-bold bg-[#628ECB]/10 text-[#628ECB] px-3 py-1 rounded-full">{s.group}</span>
                                ) : <span className="text-xs text-[#395886]/30">—</span>}
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
                                  <>
                                    <td key={`${l.lessonId}-pre`} className="px-3 py-3 text-center border-l border-[#D5DEEF]/50">
                                      <ScoreBadge score={l.pretest} total={ld?.pretest.questions.length ?? 0} completed={l.pretestCompleted} />
                                    </td>
                                    <td key={`${l.lessonId}-post`} className="px-3 py-3 text-center">
                                      <ScoreBadge score={l.posttest} total={ld?.posttest.questions.length ?? 0} completed={l.posttestCompleted} />
                                    </td>
                                  </>
                                );
                              })}
                              <td className="px-4 py-3 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <div className="w-12 bg-[#D5DEEF] rounded-full h-1 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${s.overallProgress === 100 ? 'bg-[#10B981]' : 'bg-[#628ECB]'}`}
                                      style={{ width: `${s.overallProgress}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-black text-[#628ECB] leading-none">{s.overallProgress}<span className="opacity-40 font-bold">%</span></span>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {filteredResults.length > 0 && (
                    <div className="px-6 py-3 bg-[#F8FAFD] border-t border-[#D5DEEF]">
                      <p className="text-xs text-[#395886]/50 font-medium">
                        {filteredResults.length} siswa ditampilkan
                        {(filterClass !== 'all' || filterGroup !== 'all') && ' (difilter)'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ── Modals ── */}
      {selectedStudent && (
        <StudentDetailModal activity={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}

      {accountStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAccountStudent(null)} />
          <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-[#D5DEEF] bg-white shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#395886] to-[#628ECB] px-7 py-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center text-2xl font-black shrink-0">
                  {accountStudent.student.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-0.5">Info Akun Siswa</p>
                  <h2 className="text-xl font-black leading-tight truncate">{accountStudent.student.name}</h2>
                  <p className="text-white/70 text-sm mt-0.5">{accountStudent.student.nis} · {accountStudent.student.class}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="rounded-2xl border border-[#D5DEEF] bg-[#F8FAFD] divide-y divide-[#D5DEEF]/60 overflow-hidden">
                {[
                  { label: 'Username', value: accountStudent.student.username, mono: true, highlight: true },
                  { label: 'Email', value: accountStudent.student.email, mono: false, highlight: false },
                  { label: 'NIS', value: accountStudent.student.nis, mono: true, highlight: false },
                  { label: 'Kelas', value: accountStudent.student.class, mono: false, highlight: false },
                  { label: 'Kelamin', value: accountStudent.student.gender, mono: false, highlight: false },
                ].map(({ label, value, mono, highlight }) => (
                  <div key={label} className={`flex items-center justify-between gap-4 px-5 py-3 ${highlight ? 'bg-[#628ECB]/5' : ''}`}>
                    <p className="text-xs font-bold text-[#395886]/50 uppercase tracking-wide shrink-0">{label}</p>
                    <p className={`text-sm font-bold text-[#395886] text-right ${mono ? 'font-mono' : ''} ${highlight ? 'text-[#628ECB]' : ''}`}>{value}</p>
                  </div>
                ))}
                
                {/* BAGIAN YANG DIUBAH: TOMBOL RESET PASSWORD */}
                <div className="flex flex-col gap-3 px-5 py-4 bg-red-50/30">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-xs font-bold text-[#395886]/50 uppercase tracking-wide shrink-0 pt-1.5">Kata Sandi</p>
                    <div className="text-right">
                      {resetSuccess ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10B981]/10 text-[#10B981] text-xs font-bold border border-[#10B981]/20">
                          <CheckCircle className="w-3.5 h-3.5" /> Berhasil Direset!
                        </span>
                      ) : (
                        <button
                          onClick={() => handleResetPassword(accountStudent.student.id)}
                          disabled={isResettingPw}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                            isResettingPw 
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                              : 'bg-white border-2 border-red-200 text-red-600 hover:border-red-400 hover:bg-red-50 active:scale-95'
                          }`}
                        >
                          {isResettingPw ? 'Mereset...' : 'Reset ke Default'}
                        </button>
                      )}
                    </div>
                  </div>
                  {resetSuccess ? (
                    <p className="text-[11px] font-medium text-[#10B981] text-right">
                      Sandi sekarang adalah: <strong className="font-mono bg-[#10B981]/10 px-1 rounded">connetic123</strong>
                    </p>
                  ) : (
                    <p className="text-[10px] text-[#395886]/40 text-right leading-relaxed">
                      Sandi saat ini dienkripsi. Klik tombol di atas untuk mengubah sandi siswa ini menjadi <strong>connetic123</strong>.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                  Berikan <strong>username</strong> di atas kepada siswa untuk masuk. Jika lupa kata sandi, siswa perlu mengganti password melalui admin database.
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 flex justify-end">
              <button
                onClick={() => setAccountStudent(null)}
                className="px-7 py-2.5 bg-[#628ECB] text-white text-sm font-bold rounded-2xl hover:bg-[#395886] transition-all shadow-md active:scale-95"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <AlertDialogContent className="border-[#D5DEEF] rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#395886] text-xl font-bold">Konfirmasi Keluar</AlertDialogTitle>
            <AlertDialogDescription className="text-[#395886]/60 font-medium">
              Apakah Anda yakin ingin logout dari panel admin?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="border-[#D5DEEF] text-[#395886] hover:bg-[#F0F3FA] rounded-xl font-bold">
              Tidak
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600 rounded-xl font-bold shadow-lg shadow-red-200"
              onClick={handleLogout}
            >
              Ya, Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
