import { Link, useNavigate } from 'react-router';
import { BookOpen, CheckCircle, HelpCircle, LogOut, Lock, Target, Trophy, User, Users, ArrowRight, ClipboardList, X, ChevronRight, Award } from 'lucide-react';
import { getAllStudents, getCurrentUser, logout } from '../utils/auth';
import { getAllGroupAssignments } from '../utils/groups';
import {
  getAllProgress,
  getGlobalTestProgress,
  isGlobalPosttestUnlocked,
  LessonProgress,
  GlobalTestProgress,
} from '../utils/progress';
import { lessons, globalPretest, globalPosttest, type TestQuestion } from '../data/lessons';
import { ProfileModal } from '../components/ProfileModal';
import { GuideModal } from '../components/GuideModal';
import { useMemo, useState, useEffect, useCallback } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Header } from '../components/layout/Header';


export function DashboardPage() {
  const navigate = useNavigate();
  const [user] = useState(getCurrentUser);

  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [globalTestProgress, setGlobalTestProgress] = useState<GlobalTestProgress>({
    userId: user?.id ?? '',
    globalPretestCompleted: false,
    globalPosttestCompleted: false,
  });
  const [globalPosttestUnlocked, setGlobalPosttestUnlocked] = useState(false);
  const [lessonUnlockMap, setLessonUnlockMap] = useState<Record<string, boolean>>({});

  const buildLessonUnlockMap = useCallback((allProgress: LessonProgress[], globalProg: GlobalTestProgress) => {
    const map: Record<string, boolean> = {};
    const lessonIds = Object.keys(lessons).sort((a, b) => Number(a) - Number(b));

    for (const lessonId of lessonIds) {
      if (!globalProg.globalPretestCompleted) {
        map[lessonId] = false;
        continue;
      }

      if (lessonId === '1') {
        map[lessonId] = true;
        continue;
      }

      const prevLessonId = String(Number(lessonId) - 1);
      const prevLesson = lessons[prevLessonId];
      const prevProgress = allProgress.find((item) => item.lessonId === prevLessonId);

      map[lessonId] = Boolean(
        prevLesson &&
        prevProgress?.pretestCompleted &&
        prevProgress.completedStages.length >= prevLesson.stages.length &&
        prevProgress.posttestCompleted,
      );
    }

    return map;
  }, []);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    const [prog, globalProg, globalUnlocked] = await Promise.all([
      getAllProgress(user.id),
      getGlobalTestProgress(user.id),
      isGlobalPosttestUnlocked(user.id),
    ]);
    setProgress(prog);
    setGlobalTestProgress(globalProg);
    setGlobalPosttestUnlocked(globalUnlocked);
    setLessonUnlockMap(buildLessonUnlockMap(prog, globalProg));
  }, [buildLessonUnlockMap, user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [user, loadDashboardData, navigate]);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [groupAssignments, setGroupAssignments] = useState<Record<string, string>>({});

  const [mainTab, setMainTab] = useState<'kegiatan' | 'hasil'>('kegiatan');

  const [reviewModal, setReviewModal] = useState<{
    title: string;
    questions: TestQuestion[];
    studentAnswers: number[];
    score: number;
  } | null>(null);

  const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

  const openReview = (
    title: string,
    questions: TestQuestion[],
    studentAnswers: number[],
    score: number,
  ) => setReviewModal({ title, questions, studentAnswers, score });

  useEffect(() => {
    if (!isGroupOpen || !user) return;
    getAllGroupAssignments().then(setGroupAssignments);
  }, [isGroupOpen, user]);

  const selectedGroup = user ? groupAssignments[user.id] || '' : '';

  const [allStudents, setAllStudents] = useState<Awaited<ReturnType<typeof getAllStudents>>>([]);
  useEffect(() => {
    if (!isGroupOpen || !user) return;
    getAllStudents().then(setAllStudents);
  }, [isGroupOpen, user]);

  const studentsInSelectedGroup = useMemo(() => {
    if (!selectedGroup) return [];
    return allStudents.filter((student) => groupAssignments[student.id] === selectedGroup);
  }, [allStudents, groupAssignments, selectedGroup]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const fullName = user?.name ?? '';

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF2FB] to-[#F5F8FF]">
      <Header
        user={user}
        onLogout={() => setIsLogoutOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenGroup={() => setIsGroupOpen(true)}
        selectedGroup={selectedGroup}
        isPretestCompleted={globalTestProgress.globalPretestCompleted}
        activeSection="Dashboard"
        role="student"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome + Capaian */}
        <div className="flex flex-col gap-5 mb-8">
          {/* Hero Welcome Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#395886] via-[#4A6FA8] to-[#628ECB] shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.08),_transparent_50%)]" />
            <div className="absolute top-0 right-0 h-64 w-64 -translate-y-16 translate-x-16 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 translate-y-12 -translate-x-12 rounded-full bg-[#628ECB]/30 blur-2xl" />
            <div className="relative flex flex-col gap-6 p-7 sm:flex-row sm:items-center sm:p-9">
              {/* Greeting */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.45em] text-white/60 mb-1">Ruang Belajar Siswa</p>
                <h1 className="text-2xl font-black text-white sm:text-3xl tracking-tight">
                  Hai, <span className="text-white/90">{fullName}</span>!
                </h1>
                <p className="mt-2.5 text-sm text-white/65 font-medium leading-relaxed max-w-xl">
                  Lanjutkan aktivitas belajar dan pantau progres pembelajaran Anda hari ini.
                </p>
              </div>
              {/* Quick progress stats */}
              {(() => {
                const completedLessons = progress.filter(p => {
                  const lesson = lessons[p.lessonId];
                  return p.pretestCompleted && p.completedStages.length === lesson?.stages.length && p.posttestCompleted;
                }).length;
                const totalLessons = Object.keys(lessons).length;
                return (
                  <div className="flex items-center gap-2.5 sm:shrink-0">
                    <div className="flex flex-col items-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 px-5 py-3.5">
                      <p className="text-xl font-extrabold text-white">{completedLessons}<span className="text-sm text-white/60">/{totalLessons}</span></p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/55 mt-0.5">Pertemuan</p>
                    </div>
                    <div className="flex flex-col items-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 px-5 py-3.5">
                      <p className="text-xl font-extrabold text-white">
                        {globalTestProgress.globalPretestCompleted ? <CheckCircle className="h-5 w-5 text-[#34D399]" /> : <span className="text-white/40">—</span>}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/55 mt-0.5">Pre-Test</p>
                    </div>
                    <div className="flex flex-col items-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 px-5 py-3.5">
                      <p className="text-xl font-extrabold text-white">
                        {globalTestProgress.globalPosttestCompleted ? <CheckCircle className="h-5 w-5 text-[#FCD34D]" /> : <span className="text-white/40">—</span>}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/55 mt-0.5">Post-Test</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Capaian Pembelajaran */}
          <div className="relative overflow-hidden rounded-3xl bg-white border border-[#C8D8F0] shadow-sm">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#395886] to-[#628ECB] rounded-l-3xl" />
            <div className="flex items-start gap-5 p-6 pl-7">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#395886] to-[#628ECB] text-white shadow-md">
                <Target className="w-5 h-5" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-[#395886]">Capaian Pembelajaran</h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#628ECB] bg-[#628ECB]/10 px-2.5 py-1 rounded-lg">Fase E</span>
                </div>
                <p className="text-[11px] font-semibold text-[#628ECB] uppercase tracking-wider">Elemen: Media dan Jaringan Telekomunikasi</p>
                <p className="text-sm text-[#395886]/70 leading-relaxed">
                  Pada akhir fase E peserta didik mampu memahami{' '}
                  <strong className="font-bold text-[#395886]">prinsip dasar sistem IPv4/IPv6, TCP/IP</strong>,
                  Networking Service, Sistem Keamanan Jaringan Telekomunikasi, Sistem Seluler,
                  Sistem Microwave, Sistem VSAT IP, Sistem Optik, dan Sistem WLAN.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN TABS ─────────────────────────────────────────────────────── */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex gap-1 rounded-2xl border border-[#C8D8F0] bg-white p-1.5 shadow-md">
            <button
              onClick={() => setMainTab('kegiatan')}
              className={`inline-flex items-center gap-2 rounded-xl px-7 py-2.5 text-sm font-bold transition-all duration-200 ${
                mainTab === 'kegiatan'
                  ? 'bg-gradient-to-r from-[#395886] to-[#628ECB] text-white shadow-md'
                  : 'text-[#395886]/55 hover:bg-[#F0F3FA] hover:text-[#395886]'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Kegiatan Pembelajaran
            </button>
            <button
              onClick={() => setMainTab('hasil')}
              className={`inline-flex items-center gap-2 rounded-xl px-7 py-2.5 text-sm font-bold transition-all duration-200 ${
                mainTab === 'hasil'
                  ? 'bg-gradient-to-r from-[#395886] to-[#628ECB] text-white shadow-md'
                  : 'text-[#395886]/55 hover:bg-[#F0F3FA] hover:text-[#395886]'
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              Hasil Belajar
            </button>
          </div>
        </div>

        {/* ── TAB: KEGIATAN PEMBELAJARAN ──────────────────────────────────── */}
        {mainTab === 'kegiatan' && (
          <>
            {/* Compact Pre-Test Umum strip */}
            <div className={`mb-6 flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 shadow-sm transition-all ${
              globalTestProgress.globalPretestCompleted 
                ? 'border-[#10B981]/30 bg-gradient-to-r from-[#F0FDF4] to-[#DCFCE7]' 
                : 'border-[#C4B5FD]/60 bg-gradient-to-r from-[#F5F3FF] to-[#EDE9FE]'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  globalTestProgress.globalPretestCompleted ? 'bg-[#10B981] text-white shadow-lg shadow-[#10B981]/20' : 'bg-[#7C3AED]/15 text-[#7C3AED]'
                }`}>
                  {globalTestProgress.globalPretestCompleted ? <CheckCircle className="h-5 w-5" /> : <Trophy className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-black ${globalTestProgress.globalPretestCompleted ? 'text-[#065F46]' : 'text-[#3B1F6E]'}`}>Pre-Test Umum</p>
                    {globalTestProgress.globalPretestCompleted && (
                      <span className="text-[10px] font-black bg-[#10B981] text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">Selesai</span>
                    )}
                  </div>
                  <p className={`text-xs font-medium ${globalTestProgress.globalPretestCompleted ? 'text-[#065F46]/60' : 'text-[#3B1F6E]/55'}`}>
                    {globalTestProgress.globalPretestCompleted 
                      ? `Nilai: ${globalTestProgress.globalPretestScore}/${globalPretest.questions.length}` 
                      : 'Belum dikerjakan — kerjakan sebelum memulai pertemuan'}
                  </p>
                </div>
              </div>
              {globalTestProgress.globalPretestCompleted ? (
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 text-[#059669] text-xs font-black uppercase tracking-tighter">
                  Sudah Mengerjakan <CheckCircle className="w-3.5 h-3.5" />
                </div>
              ) : (
                <Link
                  to="/global-pretest"
                  className="shrink-0 rounded-xl bg-[#7C3AED] px-5 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-[#6D28D9] active:scale-95"
                >
                  Mulai Pre-Test
                </Link>
              )}
            </div>

            {/* Lesson grid */}
            <div className="grid md:grid-cols-2 gap-5 mb-6">
          {Object.values(lessons).map((lesson) => {
            const lessonProgress = progress.find((p) => p.lessonId === lesson.id);
            const pretestCompleted = lessonProgress?.pretestCompleted || false;
            const completedStages = lessonProgress?.completedStages.length || 0;
            const totalStages = lesson.stages.length;
            const posttestCompleted = lessonProgress?.posttestCompleted || false;
            const unlocked = lessonUnlockMap[lesson.id] ?? false;

            const totalSteps = 1 + totalStages + 1;
            let completedSteps = 0;
            if (pretestCompleted) completedSteps += 1;
            completedSteps += completedStages;
            if (posttestCompleted) completedSteps += 1;

            const progressPercentage = Math.round((completedSteps / totalSteps) * 100);
            const fullyCompleted = pretestCompleted && completedStages === totalStages && posttestCompleted;

            return (
              <div
                key={lesson.id}
                className={`group bg-white rounded-3xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl border ${
                  unlocked ? 'border-[#C8D8F0] hover:border-[#628ECB]/40' : 'border-[#E0E7F5] opacity-65'
                }`}
              >
                {/* Card accent bar */}
                <div className={`h-1.5 w-full ${unlocked ? 'bg-gradient-to-r from-[#395886] to-[#628ECB]' : 'bg-gray-200'}`} />
                <div className="p-7">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-0.5 flex-1 min-w-0 pr-3">
                      <h2 className="text-xl font-extrabold text-[#395886] group-hover:text-[#628ECB] transition-colors leading-tight">{lesson.title}</h2>
                      <h3 className="text-[#628ECB] font-semibold text-xs mt-1">{lesson.topic}</h3>
                    </div>
                    {unlocked ? (
                      fullyCompleted
                        ? <div className="h-9 w-9 shrink-0 bg-[#10B981]/10 rounded-2xl flex items-center justify-center text-[#10B981] border border-[#10B981]/20 shadow-sm shadow-[#10B981]/10"><CheckCircle className="w-5 h-5" strokeWidth={3} /></div>
                        : <div className="h-9 w-9 shrink-0 bg-[#F0F3FA] rounded-2xl flex items-center justify-center text-[#395886]/20 border border-[#D5DEEF]"><BookOpen className="w-4 h-4" /></div>
                    ) : (
                      <div className="h-9 w-9 shrink-0 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-200"><Lock className="w-4 h-4" /></div>
                    )}
                  </div>

                  <p className="text-[#395886]/65 text-sm leading-relaxed mb-5 font-medium">{lesson.description}</p>

                  {unlocked && (
                    <div className="mb-5 p-4 bg-gradient-to-br from-[#F8FAFD] to-[#EEF3FB] rounded-2xl border border-[#D5DEEF]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-[#395886]/50 uppercase tracking-widest">Progres Modul</span>
                        <span className={`text-sm font-extrabold ${fullyCompleted ? 'text-[#10B981]' : 'text-[#628ECB]'}`}>
                          {progressPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-[#D5DEEF] rounded-full h-2 overflow-hidden shadow-inner">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${fullyCompleted ? 'bg-[#10B981]' : 'bg-gradient-to-r from-[#395886] to-[#628ECB]'}`}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${pretestCompleted ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                          {pretestCompleted && <CheckCircle className="w-3 h-3" />} Pre-Test
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${completedStages === totalStages ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' : completedStages > 0 ? 'bg-[#628ECB]/10 text-[#628ECB] border-[#628ECB]/20' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                          {completedStages === totalStages && <CheckCircle className="w-3 h-3" />} CTL {completedStages}/{totalStages}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${posttestCompleted ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                          {posttestCompleted && <CheckCircle className="w-3 h-3" />} Post-Test
                        </span>
                      </div>
                    </div>
                  )}

                  {unlocked ? (
                    <Link
                      to={
                        fullyCompleted
                          ? `/review/${lesson.id}`
                          : completedSteps === 0
                          ? `/lesson-intro/${lesson.id}`
                          : !pretestCompleted
                          ? `/lesson-intro/${lesson.id}`
                          : completedStages === totalStages
                          ? `/evaluation/${lesson.id}`
                          : `/lesson/${lesson.id}`
                      }
                      className={`flex items-center justify-center gap-2 w-full text-white text-sm font-bold py-3.5 rounded-2xl transition-all active:scale-95 shadow-md ${
                        fullyCompleted
                          ? 'bg-[#395886] hover:bg-[#2E4A75] shadow-[#395886]/20'
                          : 'bg-gradient-to-r from-[#395886] to-[#628ECB] hover:from-[#2E4A75] hover:to-[#4A79BA] shadow-[#628ECB]/20'
                      }`}
                    >
                      {completedSteps === 0 ? 'Mulai Belajar' : fullyCompleted ? 'Review Materi' : 'Lanjutkan Progress'}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <div className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-400 text-sm font-bold py-3.5 rounded-2xl cursor-not-allowed border border-gray-200">
                      <Lock className="w-4 h-4" />
                      {globalTestProgress.globalPretestCompleted ? 'Selesaikan modul sebelumnya' : 'Selesaikan Pre-Test Umum'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

            {/* Compact Post-Test Umum strip */}
            <div className={`mb-6 flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 shadow-sm transition-all ${
              globalTestProgress.globalPosttestCompleted 
                ? 'border-[#FCD34D]/50 bg-gradient-to-r from-[#FFFBEB] to-[#FEF3C7]' 
                : 'border-[#FCD34D]/30 bg-gray-50'
            } ${!globalPosttestUnlocked && !globalTestProgress.globalPosttestCompleted ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  globalTestProgress.globalPosttestCompleted ? 'bg-[#F59E0B] text-white shadow-lg shadow-[#F59E0B]/20' : 'bg-[#F59E0B]/15 text-[#D97706]'
                }`}>
                  {globalTestProgress.globalPosttestCompleted ? <CheckCircle className="h-5 w-5" /> : <Trophy className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-black ${globalTestProgress.globalPosttestCompleted ? 'text-[#92400E]' : 'text-[#3B1F6E]'}`}>Post-Test Umum</p>
                    {globalTestProgress.globalPosttestCompleted && (
                      <span className="text-[10px] font-black bg-[#F59E0B] text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">Selesai</span>
                    )}
                  </div>
                  <p className={`text-xs font-medium ${globalTestProgress.globalPosttestCompleted ? 'text-[#92400E]/60' : 'text-[#92400E]/55'}`}>
                    {globalTestProgress.globalPosttestCompleted
                      ? `Nilai: ${globalTestProgress.globalPosttestScore}/${globalPosttest.questions.length}`
                      : globalPosttestUnlocked
                      ? 'Siap dikerjakan — selesaikan evaluasi akhir Anda'
                      : 'Selesaikan semua pertemuan terlebih dahulu'}
                  </p>
                </div>
              </div>
              {globalTestProgress.globalPosttestCompleted ? (
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#92400E] text-xs font-black uppercase tracking-tighter">
                  Sudah Mengerjakan <CheckCircle className="w-3.5 h-3.5" />
                </div>
              ) : globalPosttestUnlocked ? (
                <Link
                  to="/global-posttest"
                  className="shrink-0 rounded-xl bg-[#F59E0B] px-5 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-[#D97706] active:scale-95"
                >
                  Mulai Post-Test
                </Link>
              ) : (
                <div className="shrink-0 rounded-xl bg-gray-200 px-5 py-2 text-xs font-bold text-gray-400 cursor-not-allowed">
                  Terkunci
                </div>
              )}
            </div>
          </>
        )}

        {/* ── TAB: HASIL BELAJAR ────────────────────────────────────────────── */}
        {mainTab === 'hasil' && (
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] border border-[#D5DEEF] shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-[#628ECB]/10 flex items-center justify-center text-[#628ECB]">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#395886] tracking-tight">Ringkasan Hasil Belajar</h2>
                  <p className="text-sm font-medium text-[#395886]/50">Pantau seluruh pencapaian evaluasi dan aktivitas CTL kamu.</p>
                </div>
              </div>

              <div className="grid gap-4">
                {/* 1. Evaluasi Umum (Pre & Post) */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Global Pretest */}
                  {(() => {
                    const done = globalTestProgress.globalPretestCompleted;
                    const score = globalTestProgress.globalPretestScore ?? 0;
                    const total = globalPretest.questions.length;
                    return (
                      <div className={`group relative p-6 rounded-[2rem] border-2 transition-all duration-300 ${
                        done 
                          ? 'border-[#8B5CF6]/20 bg-gradient-to-br from-[#8B5CF6]/5 to-[#F5F3FF] shadow-sm hover:shadow-md' 
                          : 'border-[#D5DEEF] bg-gray-50/50'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${done ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/25' : 'bg-[#D5DEEF] text-[#395886]/30'}`}>
                            <Trophy className="w-5 h-5" />
                          </div>
                          {done && (
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] text-[10px] font-black uppercase tracking-wider border border-[#8B5CF6]/20">
                              <CheckCircle className="w-3 h-3" /> Selesai
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1 mb-6">
                          <h3 className="font-black text-[#395886] tracking-tight">Pre-Test Umum</h3>
                          <p className="text-xs font-bold text-[#395886]/40 uppercase tracking-widest">Evaluasi Awal</p>
                        </div>

                        <div className="flex items-end justify-between gap-4">
                          {done ? (
                            <>
                              <div className="relative">
                                <div className="absolute -inset-4 bg-[#8B5CF6]/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <p className="relative text-4xl font-black text-[#395886] leading-none">
                                  {Math.round((score/total)*100)}<span className="text-lg opacity-40">%</span>
                                </p>
                                <p className="text-[10px] font-black text-[#8B5CF6] mt-1.5 uppercase tracking-widest">{score}/{total} BENAR</p>
                              </div>
                              <button 
                                onClick={() => openReview('Pre-Test Umum', globalPretest.questions, globalTestProgress.globalPretestAnswers ?? [], score)} 
                                className="relative z-10 px-5 py-2.5 bg-white border-2 border-[#D5DEEF] rounded-2xl text-xs font-black text-[#395886] hover:border-[#8B5CF6] hover:text-[#8B5CF6] transition-all shadow-sm active:scale-95"
                              >
                                Review
                              </button>
                            </>
                          ) : (
                            <Link to="/global-pretest" className="w-full text-center py-3 bg-[#395886] text-white rounded-2xl text-xs font-black hover:bg-[#628ECB] transition-all shadow-lg shadow-[#395886]/10">Mulai Sekarang</Link>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Global Posttest */}
                  {(() => {
                    const done = globalTestProgress.globalPosttestCompleted;
                    const score = globalTestProgress.globalPosttestScore ?? 0;
                    const total = globalPosttest.questions.length;
                    const unlocked = globalPosttestUnlocked;
                    return (
                      <div className={`group relative p-6 rounded-[2rem] border-2 transition-all duration-300 ${
                        done 
                          ? 'border-[#F59E0B]/20 bg-gradient-to-br from-[#F59E0B]/5 to-[#FFFBEB] shadow-sm hover:shadow-md' 
                          : 'border-[#D5DEEF] bg-gray-50/50'
                      } ${!unlocked && !done ? 'opacity-60' : ''}`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${done ? 'bg-[#F59E0B] text-white shadow-lg shadow-[#F59E0B]/25' : 'bg-[#D5DEEF] text-[#395886]/30'}`}>
                            <Award className="w-5 h-5" />
                          </div>
                          {done && (
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-[10px] font-black uppercase tracking-wider border border-[#F59E0B]/20">
                              <CheckCircle className="w-3 h-3" /> Selesai
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 mb-6">
                          <h3 className="font-black text-[#395886] tracking-tight">Post-Test Umum</h3>
                          <p className="text-xs font-bold text-[#395886]/40 uppercase tracking-widest">Evaluasi Akhir</p>
                        </div>

                        <div className="flex items-end justify-between gap-4">
                          {done ? (
                            <>
                              <div className="relative">
                                <div className="absolute -inset-4 bg-[#F59E0B]/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <p className="relative text-4xl font-black text-[#395886] leading-none">
                                  {Math.round((score/total)*100)}<span className="text-lg opacity-40">%</span>
                                </p>
                                <p className="text-[10px] font-black text-[#F59E0B] mt-1.5 uppercase tracking-widest">{score}/{total} BENAR</p>
                              </div>
                              <button 
                                onClick={() => openReview('Post-Test Umum', globalPosttest.questions, globalTestProgress.globalPosttestAnswers ?? [], score)} 
                                className="relative z-10 px-5 py-2.5 bg-white border-2 border-[#D5DEEF] rounded-2xl text-xs font-black text-[#395886] hover:border-[#F59E0B] hover:text-[#F59E0B] transition-all shadow-sm active:scale-95"
                              >
                                Review
                              </button>
                            </>
                          ) : unlocked ? (
                            <Link to="/global-posttest" className="w-full text-center py-3 bg-[#F59E0B] text-white rounded-2xl text-xs font-black hover:bg-[#D97706] transition-all shadow-lg shadow-[#F59E0B]/10">Ikuti Tes</Link>
                          ) : (
                            <div className="w-full text-center py-3 bg-gray-200 text-gray-400 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-not-allowed border-2 border-gray-200/50"><Lock className="w-3.5 h-3.5" /> Terkunci</div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 2. Hasil Per Pertemuan (CTL & Tes) */}
                <div className="mt-4 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#628ECB] px-2">Detail Per Pertemuan</p>
                  {Object.values(lessons).map((lesson) => {
                    const lp = progress.find((p) => p.lessonId === lesson.id);
                    const ctlDone = (lp?.completedStages.length ?? 0) === lesson.stages.length;
                    const preDone = lp?.pretestCompleted ?? false;
                    const postDone = lp?.posttestCompleted ?? false;
                    const unlocked = lessonUnlockMap[lesson.id] ?? false;
                    
                    if (!unlocked && !lp) return null;

                    return (
                      <div key={lesson.id} className="group bg-[#F8FAFD] rounded-[2rem] border border-[#D5DEEF] p-6 hover:border-[#628ECB]/30 hover:shadow-md transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#395886] text-white flex items-center justify-center font-black text-sm shadow-md shadow-[#395886]/10">P{lesson.id}</div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-[#395886] truncate">{lesson.title}</h4>
                              <p className="text-xs text-[#395886]/50 font-medium truncate">{lesson.topic}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D5DEEF] shadow-sm">
                              <span className="text-[10px] font-bold text-[#395886]/40 uppercase">Pre</span>
                              <span className={`text-xs font-black ${preDone ? 'text-[#628ECB]' : 'text-gray-300'}`}>{preDone ? `${lp?.pretestScore}/${lesson.pretest.questions.length}` : '—'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D5DEEF] shadow-sm">
                              <span className="text-[10px] font-bold text-[#395886]/40 uppercase">CTL</span>
                              <span className={`text-xs font-black ${ctlDone ? 'text-[#10B981]' : lp?.completedStages.length ? 'text-[#F59E0B]' : 'text-gray-300'}`}>
                                {lp?.completedStages.length ?? 0}/{lesson.stages.length}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D5DEEF] shadow-sm">
                              <span className="text-[10px] font-bold text-[#395886]/40 uppercase">Post</span>
                              <span className={`text-xs font-black ${postDone ? 'text-[#628ECB]' : 'text-gray-300'}`}>{postDone ? `${lp?.posttestScore}/${lesson.posttest.questions.length}` : '—'}</span>
                            </div>
                            <Link to={`/review/${lesson.id}`} className="ml-2 flex items-center gap-2 px-5 py-2.5 bg-[#395886] text-white rounded-2xl text-xs font-bold hover:bg-[#628ECB] shadow-md shadow-[#395886]/10 transition-all active:scale-95">
                              Review Lengkap <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── REVIEW JAWABAN MODAL ───────────────────────────────────────────── */}
      <Dialog open={!!reviewModal} onOpenChange={(open) => !open && setReviewModal(null)}>
        <DialogContent className="border-[#D5DEEF] sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
          <DialogHeader className="p-8 pb-6 border-b border-[#D5DEEF] bg-[#F8FAFD]">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-[#395886] text-2xl font-black tracking-tight">{reviewModal?.title}</DialogTitle>
                <DialogDescription className="hidden">
                  Tinjauan hasil pengerjaan tes dan jawaban benar.
                </DialogDescription>
                {reviewModal && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="bg-[#628ECB]/10 px-3 py-1 rounded-full border border-[#628ECB]/20">
                      <p className="text-sm font-bold text-[#395886]">
                        Skor: <span className="text-[#628ECB]">{reviewModal.score}/{reviewModal.questions.length}</span>
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full border ${Math.round((reviewModal.score / reviewModal.questions.length) * 100) >= 70 ? 'bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]' : 'bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]'}`}>
                      <p className="text-sm font-black">
                        {Math.round((reviewModal.score / reviewModal.questions.length) * 100)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-[#D5DEEF]">
            {reviewModal?.questions.map((q, i) => {
              const studentAnswer = reviewModal.studentAnswers[i];
              const isCorrect = studentAnswer === q.correctAnswer;
              return (
                <div key={i} className={`rounded-[1.5rem] border-2 p-6 transition-all ${isCorrect ? 'border-[#10B981]/20 bg-[#10B981]/[0.02]' : 'border-red-100 bg-red-50/[0.02]'}`}>
                  <div className="mb-5 flex gap-4">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black shadow-sm ${isCorrect ? 'bg-[#10B981] text-white' : 'bg-red-500 text-white'}`}>
                      {i + 1}
                    </span>
                    <p className="font-bold text-[#395886] leading-relaxed text-base">{q.question}</p>
                  </div>
                  <div className="ml-12 grid gap-2.5">
                    {q.options.map((opt, j) => {
                      const isStudentChoice = studentAnswer === j;
                      const isCorrectChoice = q.correctAnswer === j;
                      let cls = 'flex items-start gap-3 rounded-xl border-2 p-4 text-sm font-medium transition-all ';
                      if (isCorrectChoice) {
                        cls += 'border-[#10B981] bg-[#10B981]/10 text-[#0F8A66] shadow-sm';
                      } else if (isStudentChoice && !isCorrect) {
                        cls += 'border-red-400 bg-red-50 text-red-700 shadow-sm';
                      } else {
                        cls += 'border-[#D5DEEF] bg-white text-[#395886]/50';
                      }
                      return (
                        <div key={j} className={cls}>
                          <span className={`shrink-0 font-black w-5 ${isCorrectChoice ? 'text-[#0F8A66]' : isStudentChoice ? 'text-red-700' : 'text-[#395886]/30'}`}>{OPTION_LABELS[j]}.</span>
                          <span className="flex-1 leading-relaxed">{opt}</span>
                          {isCorrectChoice && <CheckCircle className="ml-auto h-5 w-5 shrink-0 text-[#10B981]" />}
                          {isStudentChoice && !isCorrect && <X className="ml-auto h-5 w-5 shrink-0 text-red-500" />}
                        </div>
                      );
                    })}
                  </div>
                  {!isCorrect && typeof studentAnswer === 'number' && (
                    <div className="ml-12 mt-4 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-2 font-bold text-red-600 text-xs shadow-sm">
                        <X className="h-3.5 w-3.5" /> Jawaban kamu: <span className="bg-red-200/50 px-1.5 rounded ml-1">{OPTION_LABELS[studentAnswer]}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl bg-[#10B981]/5 border border-[#10B981]/20 px-4 py-2 font-bold text-[#10B981] text-xs shadow-sm">
                        <CheckCircle className="h-3.5 w-3.5" /> Benar: <span className="bg-[#10B981]/20 px-1.5 rounded ml-1">{OPTION_LABELS[q.correctAnswer]}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#D5DEEF] p-6 flex justify-end bg-[#F8FAFD]">
            <button
              onClick={() => setReviewModal(null)}
              className="px-10 py-3.5 bg-[#628ECB] text-white text-sm font-bold rounded-2xl hover:bg-[#395886] transition-all shadow-lg active:scale-95 shadow-[#628ECB]/20"
            >
              Tutup Review
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user!}
        onUpdate={() => {}}
      />

      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <Dialog open={isGroupOpen} onOpenChange={setIsGroupOpen}>
        <DialogContent className="border-[#D5DEEF] sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-[2rem]">
          <DialogHeader className="p-7 pb-5 bg-gradient-to-br from-[#395886] to-[#628ECB]">
            <DialogTitle className="text-white flex items-center gap-3 text-xl font-bold">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 border border-white/30">
                <Users className="w-4 h-4 text-white" />
              </div>
              Informasi Kelompok Saya
            </DialogTitle>
            <DialogDescription className="text-white/65 font-medium mt-1.5 text-sm">
              Kelompok belajar untuk aktivitas Learning Community.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Info kelompok */}
            {selectedGroup ? (
              <>
                <div className="rounded-2xl bg-[#EEF3FB] border border-[#628ECB]/20 p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#395886] flex items-center justify-center shrink-0 shadow-md">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#628ECB] mb-0.5">Kelompok Anda</p>
                    <p className="text-xl font-black text-[#395886] truncate">{selectedGroup}</p>
                    <p className="text-xs text-[#395886]/50 font-medium mt-0.5">{studentsInSelectedGroup.length} anggota • Peran: Anggota</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#628ECB] mb-3 px-1">Daftar Anggota</p>
                  <div className="space-y-2">
                    {studentsInSelectedGroup.length > 0 ? (
                      studentsInSelectedGroup.map((student) => (
                        <div key={student.id} className="flex items-center gap-3 rounded-2xl border border-[#D5DEEF] bg-white p-3.5 shadow-sm">
                          <div className="h-9 w-9 rounded-xl bg-[#628ECB]/10 flex items-center justify-center text-[#628ECB] shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-[#395886] truncate text-sm">{student.name}</p>
                            <p className="text-[10px] text-[#395886]/50 font-medium">{student.class}</p>
                          </div>
                          <span className="text-[10px] font-bold text-[#628ECB] bg-[#628ECB]/10 px-2.5 py-1 rounded-full shrink-0">Anggota</span>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center rounded-2xl border border-dashed border-[#D5DEEF]">
                        <Users className="w-10 h-10 text-[#D5DEEF] mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-[#395886]/40">Belum ada anggota lain di kelompok ini.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-10 text-center rounded-2xl border border-dashed border-[#D5DEEF]">
                <Users className="w-14 h-14 text-[#D5DEEF] mx-auto mb-3 opacity-40" />
                <p className="font-bold text-[#395886]/50 text-sm">Anda belum memiliki kelompok</p>
                <p className="text-xs text-[#395886]/35 mt-1">Hubungi guru untuk mendapatkan kelompok.</p>
              </div>
            )}

            {/* Keterangan */}
            <div className="flex items-start gap-3 rounded-2xl bg-[#F0F3FA] border border-[#D5DEEF] p-4">
              <HelpCircle className="w-4 h-4 text-[#628ECB] mt-0.5 shrink-0" />
              <p className="text-xs text-[#395886]/70 font-medium leading-relaxed">
                <span className="font-bold text-[#395886]">Kelompok ditentukan oleh guru.</span> Pengaturan kelompok hanya dapat dilakukan oleh guru/administrator. Hubungi guru jika ada pertanyaan terkait kelompok Anda.
              </p>
            </div>
          </div>

          <div className="p-5 bg-[#F8FAFD] border-t border-[#D5DEEF] flex justify-end">
            <button
              onClick={() => setIsGroupOpen(false)}
              className="px-7 py-2.5 bg-[#628ECB] text-white text-sm font-bold rounded-2xl hover:bg-[#395886] transition-all shadow-md active:scale-95"
            >
              Tutup
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <AlertDialogContent className="border-[#D5DEEF] rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#395886] text-xl font-bold">Konfirmasi Keluar</AlertDialogTitle>
            <AlertDialogDescription className="text-[#395886]/60 font-medium">
              Apakah Anda yakin ingin mengakhiri sesi belajar kali ini? Pastikan progress terakhir Anda telah tersimpan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="border-[#D5DEEF] text-[#395886] hover:bg-[#F0F3FA] rounded-xl font-bold">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 text-white hover:bg-red-600 rounded-xl font-bold shadow-lg shadow-red-200" onClick={handleLogout}>
              Ya, Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
