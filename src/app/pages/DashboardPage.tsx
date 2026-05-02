import { Link, useNavigate } from 'react-router';
import { BookOpen, CheckCircle, HelpCircle, LogOut, Lock, Target, Trophy, User, Users, ArrowRight, ClipboardList, X, ChevronRight, Award } from 'lucide-react';
import { getAllStudents, getCurrentUser, logout, updateUser } from '../utils/auth';
import {
  getAllProgress,
  getGlobalTestProgress,
  isLessonUnlocked,
  isGlobalPosttestUnlocked,
  LessonProgress,
  GlobalTestProgress,
} from '../utils/progress';
import { lessons, TestQuestion } from '../data/lessons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  const [user, setUser] = useState(getCurrentUser);

  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [globalTestProgress, setGlobalTestProgress] = useState<GlobalTestProgress>({
    userId: user?.id ?? '',
    globalPretestCompleted: false,
    globalPosttestCompleted: false,
  });
  const [globalPosttestUnlocked, setGlobalPosttestUnlocked] = useState(false);
  const [lessonUnlockMap, setLessonUnlockMap] = useState<Record<string, boolean>>({});
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
    const unlockEntries = await Promise.all(
      Object.keys(lessons).map(async (id) => [id, await isLessonUnlocked(user.id, id)] as [string, boolean])
    );
    setLessonUnlockMap(Object.fromEntries(unlockEntries));
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadDashboardData();
  }, [loadDashboardData, navigate]);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);

  const [mainTab, setMainTab] = useState<'kegiatan' | 'hasil'>('kegiatan');

  const [reviewModal, setReviewModal] = useState<{
    title: string;
    questions: TestQuestion[];
    studentAnswers: number[];
    score: number;
  } | null>(null);

  const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

  const availableGroups = useMemo<string[]>(() => {
    const firstLesson = Object.values(lessons)[0];
    const learningCommunityStage = firstLesson?.stages.find((stage) => stage.type === 'learning-community');
    return learningCommunityStage?.groupActivity?.groupNames ?? ['Kelompok 1', 'Kelompok 2', 'Kelompok 3', 'Kelompok 4', 'Kelompok 5', 'Kelompok 6', 'Kelompok 7', 'Kelompok 8'];
  }, []);

  const selectedGroup = user?.groupName || '';

  const [allStudents, setAllStudents] = useState<Awaited<ReturnType<typeof getAllStudents>>>([]);
  useEffect(() => {
    if (!user) return;
    getAllStudents().then(setAllStudents);
  }, [user]);

  const studentsInSelectedGroup = useMemo(() => {
    if (!selectedGroup) return [];
    return allStudents.filter((student) => student.groupName === selectedGroup);
  }, [allStudents, selectedGroup]);

  const saveGroupSelection = async (groupName: string) => {
    if (!user) return;

    // Check if group is full
    const studentsInGroup = allStudents.filter((student) => student.groupName === groupName);
    if (studentsInGroup.length >= 5 && user.groupName !== groupName) {
      alert(`${groupName} sudah penuh (maksimal 5 orang). Silakan pilih kelompok lain.`);
      return;
    }

    const success = await updateUser(user.id, { groupName });
    if (success) {
      setUser(getCurrentUser()); // Update local state immediately
      loadDashboardData();
      getAllStudents().then(setAllStudents);
    } else {
      alert('Gagal menyimpan pilihan kelompok. Silakan coba lagi.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const fullName = user?.name ?? '';
  const firstName = fullName.split(' ')[0];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF2FB] to-[#F5F8FF]">
      <Header
        user={user}
        onLogout={() => setIsLogoutOpen(true)}
        onProfile={() => setIsProfileOpen(true)}
        onGuide={() => setIsGuideOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome + Capaian */}
        <div className="flex flex-col gap-5 mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#395886] via-[#4A6FA8] to-[#628ECB] shadow-lg">
            <div className="relative flex flex-col gap-6 p-7 sm:flex-row sm:items-center sm:p-9">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.45em] text-white/60 mb-1">Ruang Belajar Siswa</p>
                <h1 className="text-2xl font-black text-white sm:text-3xl tracking-tight">
                  Hai, <span className="text-white/90">{firstName}</span>!
                </h1>
                <p className="mt-2.5 text-sm text-white/65 font-medium leading-relaxed max-w-xl">
                  Lanjutkan aktivitas belajar dan pantau progres pembelajaran Anda hari ini.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <div className="flex flex-col items-end gap-1 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none">Pre-Test Umum</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <p className="text-lg font-black text-white leading-none">
                      {globalTestProgress.globalPretestCompleted ? (globalTestProgress.globalPretestScore ?? 0) : <span className="text-white/40">-</span>}
                    </p>
                    {globalTestProgress.globalPretestCompleted ? <CheckCircle className="h-5 w-5 text-[#34D399]" /> : <span className="text-white/40">-</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none">Post-Test Umum</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <p className="text-lg font-black text-white leading-none">
                      {globalTestProgress.globalPosttestCompleted ? (globalTestProgress.globalPosttestScore ?? 0) : <span className="text-white/40">-</span>}
                    </p>
                    {globalTestProgress.globalPosttestCompleted ? <CheckCircle className="h-5 w-5 text-[#FCD34D]" /> : <span className="text-white/40">-</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN TABS ------------------------------------------------------------- */}
        <div className="flex items-center gap-2 mb-8 bg-white/50 p-1.5 rounded-[1.5rem] border border-[#D5DEEF] w-fit shadow-sm">
          <button
            onClick={() => setMainTab('kegiatan')}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-black transition-all duration-200 ${
              mainTab === 'kegiatan'
                ? 'bg-[#395886] text-white shadow-lg shadow-[#395886]/20'
                : 'text-[#395886]/55 hover:bg-white hover:text-[#395886]'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Kegiatan Pembelajaran
          </button>
          <button
            onClick={() => setMainTab('hasil')}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-black transition-all duration-200 ${
              mainTab === 'hasil'
                ? 'bg-gradient-to-r from-[#395886] to-[#628ECB] text-white shadow-md'
                : 'text-[#395886]/55 hover:bg-[#F0F3FA] hover:text-[#395886]'
            }`}
          >
            <Target className="w-4 h-4" />
            Hasil Belajar
          </button>
        </div>

        {/* TAB: KEGIATAN PEMBELAJARAN ----------------------------------------------- */}
        {mainTab === 'kegiatan' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-8 animate-in fade-in duration-500">
            <div className="space-y-6">
              <div className="grid gap-5">
                {/* Global Pretest */}
                <div className="group relative bg-white p-5 rounded-3xl border border-[#D5DEEF] hover:border-[#628ECB] transition-all shadow-sm hover:shadow-xl hover:-translate-y-1">
                  <div className="flex items-center gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EEF2FF] group-hover:bg-[#628ECB] transition-colors">
                      <Target className="h-7 w-7 text-[#628ECB] group-hover:text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#628ECB] bg-[#EEF2FF] px-2 py-0.5 rounded">Pre-Evaluation</span>
                      </div>
                      <h3 className="text-base font-black text-[#395886] group-hover:text-[#628ECB] transition-colors">Pre-Test Umum</h3>
                      <p className="text-xs text-[#395886]/55 font-medium mt-1">
                        {globalTestProgress.globalPretestCompleted ? 'Sudah dikerjakan - kerjakan sebelum memulai pertemuan' : 'Belum dikerjakan - kerjakan sebelum memulai pertemuan'}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {globalTestProgress.globalPretestCompleted ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10B981]/10 border border-[#10B981]/20">
                          <CheckCircle className="h-5 w-5 text-[#10B981]" />
                        </div>
                      ) : (
                        <Link to="/global-pretest" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#395886] text-white shadow-lg hover:bg-[#628ECB] transition-all group-hover:scale-110">
                          <ArrowRight className="h-5 w-5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lesson Modules */}
                {Object.values(lessons).map((lesson, idx) => {
                  const isUnlocked = lessonUnlockMap[lesson.id];
                  const lp = progress.find((p) => p.lessonId === lesson.id);
                  const isCompleted =
                    lp?.pretestCompleted &&
                    lp?.completedStages.length === lesson.stages.length &&
                    lp?.posttestCompleted;

                  return (
                    <div key={lesson.id} className={`group relative bg-white p-5 rounded-3xl border border-[#D5DEEF] transition-all shadow-sm ${isUnlocked ? 'hover:border-[#628ECB] hover:shadow-xl hover:-translate-y-1' : 'opacity-60 bg-gray-50/50 grayscale-[0.5]'}`}>
                      <div className="flex items-center gap-5">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-[#D5DEEF]/30">
                          {isUnlocked ? (
                            <BookOpen className="h-7 w-7 text-[#628ECB]" />
                          ) : (
                            <Lock className="h-7 w-7 text-[#D5DEEF]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isUnlocked ? 'bg-[#EEF2FF] text-[#628ECB]' : 'bg-gray-200 text-gray-400'}`}>Pertemuan {idx + 1}</span>
                            {isCompleted && <span className="text-[10px] font-black uppercase bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded border border-[#10B981]/20">Selesai</span>}
                          </div>
                          <h3 className="text-base font-black text-[#395886]">{lesson.topic}</h3>
                          {!isUnlocked && (
                            <p className="text-[10px] font-bold text-red-400 uppercase mt-1 flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Selesaikan pertemuan sebelumnya
                            </p>
                          )}
                        </div>
                        <div className="shrink-0">
                          {isUnlocked ? (
                            <Link to={`/lesson-intro/${lesson.id}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#395886] text-white shadow-lg hover:bg-[#628ECB] transition-all group-hover:scale-110">
                              <ArrowRight className="h-5 w-5" />
                            </Link>
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-white cursor-not-allowed">
                              <Lock className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Global Posttest */}
                {(() => {
                  const done = globalTestProgress.globalPosttestCompleted;
                  return (
                    <div className={`group relative bg-[#FFFBEB] p-5 rounded-3xl border transition-all shadow-sm ${globalPosttestUnlocked ? 'border-amber-200 hover:border-[#F59E0B] hover:shadow-xl hover:-translate-y-1' : 'border-[#D5DEEF] opacity-60 grayscale'}`}>
                      <div className="flex items-center gap-5">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                          <Award className={`h-7 w-7 ${globalPosttestUnlocked ? 'text-[#F59E0B]' : 'text-gray-300'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${globalPosttestUnlocked ? 'bg-amber-100 text-[#92400E]' : 'bg-gray-200 text-gray-400'}`}>Final Evaluation</span>
                          </div>
                          <h3 className="text-base font-black text-[#395886]">Post-Test Umum</h3>
                          <p className="text-xs text-[#92400E]/55 font-medium">
                            {globalTestProgress.globalPosttestCompleted
                              ? 'Sudah dikerjakan'
                              : globalPosttestUnlocked
                                ? 'Siap dikerjakan - selesaikan evaluasi akhir Anda'
                                : 'Terkunci - selesaikan semua modul pertemuan'}
                          </p>
                        </div>
                        <div className="shrink-0">
                          {done ? (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10B981]/10 border border-[#10B981]/20">
                              <CheckCircle className="h-5 w-5 text-[#10B981]" />
                            </div>
                          ) : globalPosttestUnlocked ? (
                            <Link to="/global-posttest" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F59E0B] text-white shadow-lg hover:bg-[#D97706] transition-all group-hover:scale-110">
                              <ArrowRight className="h-5 w-5" />
                            </Link>
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-white cursor-not-allowed">
                              <Lock className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Sidebar dashboard - info kelompok, dll */}
            <aside className="space-y-6">
              <div className="bg-white rounded-[2.5rem] border-2 border-[#D5DEEF] p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-[#628ECB]/10 flex items-center justify-center text-[#628ECB]"><Users className="w-6 h-6" /></div>
                  <h3 className="text-lg font-black text-[#395886]">Kelompok Belajar</h3>
                </div>

                {!selectedGroup ? (
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-[#395886]/60 leading-relaxed">Anda belum memilih kelompok. Silakan bergabung dengan kelompok untuk berdiskusi di tahap Learning Community.</p>
                    <button onClick={() => setIsGroupOpen(true)} className="w-full py-3.5 rounded-2xl bg-[#628ECB] text-white font-black text-xs hover:bg-[#395886] transition-all shadow-lg shadow-[#628ECB]/20 active:scale-95">Pilih Kelompok Sekarang</button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="px-4 py-1.5 rounded-xl bg-[#628ECB] text-white text-[10px] font-black uppercase tracking-widest shadow-md">{selectedGroup}</div>
                      <button onClick={() => setIsGroupOpen(true)} className="text-[10px] font-black text-[#628ECB] uppercase hover:underline">Ganti</button>
                    </div>
                    
                    <div className="space-y-2.5">
                      <p className="text-[10px] font-black text-[#395886]/40 uppercase tracking-widest ml-1">Rekan Kelompok ({studentsInSelectedGroup.length}/5)</p>
                      <div className="grid gap-2">
                        {studentsInSelectedGroup.map(s => (
                          <div key={s.id} className={`flex items-center gap-3 p-3 rounded-2xl border ${s.id === user.id ? 'bg-[#EEF2FF] border-[#628ECB]/30' : 'bg-[#F8FAFD] border-[#D5DEEF]'}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${s.id === user.id ? 'bg-[#628ECB] text-white' : 'bg-[#D5DEEF] text-[#395886]/50'}`}>{s.name.substring(0,2).toUpperCase()}</div>
                            <span className={`text-xs font-bold ${s.id === user.id ? 'text-[#395886]' : 'text-[#395886]/70'}`}>{s.name} {s.id === user.id && '(Kamu)'}</span>
                          </div>
                        ))}
                        {studentsInSelectedGroup.length === 0 && <p className="text-xs italic text-[#395886]/40 py-2">Memuat data kelompok...</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-[#EEF2FF] rounded-[2rem] p-8 border border-[#628ECB]/10">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="w-5 h-5 text-[#628ECB]" />
                  <p className="text-[10px] font-black text-[#628ECB] uppercase tracking-widest">Informasi</p>
                </div>
                <p className="text-xs font-bold text-[#395886]/70 leading-relaxed italic">"Gunakan modul ini secara berurutan. Setiap pertemuan akan terbuka secara otomatis setelah pertemuan sebelumnya diselesaikan."</p>
              </div>
            </aside>
          </div>
        )}

        {/* TAB: HASIL BELAJAR ------------------------------------------------------ */}
        {mainTab === 'hasil' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Global Pretest Result Card */}
              {(() => {
                const done = globalTestProgress.globalPretestCompleted;
                const score = globalTestProgress.globalPretestScore ?? 0;
                const total = 30;
                return (
                  <div className="bg-white p-6 rounded-3xl border border-[#D5DEEF] shadow-sm relative overflow-hidden group hover:border-[#8B5CF6] transition-all">
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]" />
                          <p className="text-[10px] font-black text-[#8B5CF6] uppercase tracking-widest">Pre-Test Umum</p>
                        </div>
                        <p className="text-xs font-bold text-[#395886]/60 leading-relaxed">Capaian awal sebelum pembelajaran.</p>
                      </div>
                      
                      <div className="flex items-end justify-between gap-4">
                        {done ? (
                          <>
                            <div>
                              <p className="text-3xl font-black text-[#395886] leading-none tabular-nums">
                                {Math.round((score/total)*100)}
                              </p>
                              <div className="flex items-center gap-1.5 mt-2">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                  (score/total)*100 >= 86 ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' :
                                  (score/total)*100 >= 71 ? 'bg-[#628ECB]/10 text-[#628ECB] border-[#628ECB]/20' :
                                  (score/total)*100 >= 60 ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' :
                                  'bg-red-50 text-red-500 border-red-100'
                                }`}>
                                  { (score/total)*100 >= 86 ? 'Sangat Baik' : (score/total)*100 >= 71 ? 'Baik' : (score/total)*100 >= 60 ? 'Cukup' : 'Perlu Latihan' }
                                </span>
                                <p className="text-[9px] font-bold text-[#395886]/40 uppercase tracking-widest">{score}/{total} BENAR</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => setReviewModal({ title: 'Pre-Test Umum', questions: [], studentAnswers: globalTestProgress.globalPretestAnswers ?? [], score })}
                              className="relative z-10 px-5 py-2.5 bg-white border-2 border-[#D5DEEF] rounded-2xl text-xs font-black text-[#395886] hover:border-[#8B5CF6] hover:text-[#8B5CF6] transition-all shadow-sm active:scale-95"
                            >
                              Review
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-300">
                             <Lock className="w-4 h-4" />
                             <span className="text-xs font-bold uppercase tracking-widest">Belum Ada Data</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Global Posttest Result Card */}
              {(() => {
                const done = globalTestProgress.globalPosttestCompleted;
                const score = globalTestProgress.globalPosttestScore ?? 0;
                const total = 30;
                return (
                  <div className="bg-white p-6 rounded-3xl border border-[#D5DEEF] shadow-sm relative overflow-hidden group hover:border-[#F59E0B] transition-all">
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                          <p className="text-[10px] font-black text-[#F59E0B] uppercase tracking-widest">Post-Test Umum</p>
                        </div>
                        <p className="text-xs font-bold text-[#395886]/60 leading-relaxed">Capaian akhir setelah pembelajaran.</p>
                      </div>
                      
                      <div className="flex items-end justify-between gap-4">
                        {done ? (
                          <>
                            <div>
                              <p className="text-3xl font-black text-[#395886] leading-none tabular-nums">
                                {Math.round((score/total)*100)}
                              </p>
                              <div className="flex items-center gap-1.5 mt-2">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                  (score/total)*100 >= 86 ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' :
                                  (score/total)*100 >= 71 ? 'bg-[#628ECB]/10 text-[#628ECB] border-[#628ECB]/20' :
                                  (score/total)*100 >= 60 ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' :
                                  'bg-red-50 text-red-500 border-red-100'
                                }`}>
                                  { (score/total)*100 >= 86 ? 'Sangat Baik' : (score/total)*100 >= 71 ? 'Baik' : (score/total)*100 >= 60 ? 'Cukup' : 'Perlu Latihan' }
                                </span>
                                <p className="text-[9px] font-bold text-[#395886]/40 uppercase tracking-widest">{score}/{total} BENAR</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => setReviewModal({ title: 'Post-Test Umum', questions: [], studentAnswers: globalTestProgress.globalPosttestAnswers ?? [], score })}
                              className="relative z-10 px-5 py-2.5 bg-white border-2 border-[#D5DEEF] rounded-2xl text-xs font-black text-[#395886] hover:border-[#F59E0B] hover:text-[#F59E0B] transition-all shadow-sm active:scale-95"
                            >
                              Review
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-300">
                             <Lock className="w-4 h-4" />
                             <span className="text-xs font-bold uppercase tracking-widest">Belum Ada Data</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Individual Lesson Results Table */}
            <div className="bg-white rounded-3xl border border-[#D5DEEF] overflow-hidden shadow-sm">
              <div className="p-6 border-b border-[#D5DEEF] bg-[#F8FAFD]">
                <h3 className="text-base font-black text-[#395886]">Detail Hasil Per Pertemuan</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-[#395886]/40 border-b border-[#D5DEEF]">Modul</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-[#395886]/40 border-b border-[#D5DEEF]">Pre-Test</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-[#395886]/40 border-b border-[#D5DEEF]">Tahap CTL</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-[#395886]/40 border-b border-[#D5DEEF]">Post-Test</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-[#395886]/40 border-b border-[#D5DEEF]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Object.values(lessons).map(lesson => {
                      const lp = progress.find(p => p.lessonId === lesson.id);
                      const preDone = lp?.pretestCompleted;
                      const postDone = lp?.posttestCompleted;
                      const ctlDoneCount = lp?.completedStages.length ?? 0;
                      const ctlTotal = lesson.stages.length;

                      return (
                        <tr key={lesson.id} className="hover:bg-[#F8FAFD] transition-colors group">
                          <td className="px-6 py-5">
                            <p className="text-xs font-black text-[#395886] group-hover:text-[#628ECB] transition-colors">{lesson.title}</p>
                            <p className="text-[10px] font-bold text-[#395886]/40 mt-0.5">{lesson.topic}</p>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className="flex flex-col items-center">
                              <span className={`text-xs font-black ${preDone ? 'text-[#628ECB]' : 'text-gray-300'}`}>{preDone ? `${lp?.pretestScore}/${lesson.pretest.questions.length}` : '-'}</span>
                              <span className="text-[8px] font-bold uppercase text-[#395886]/30">Benar</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className="flex flex-col items-center">
                              <span className={`text-xs font-black ${ctlDoneCount === ctlTotal ? 'text-[#10B981]' : 'text-[#395886]/70'}`}>{ctlDoneCount}/{ctlTotal}</span>
                              <span className="text-[8px] font-bold uppercase text-[#395886]/30">Selesai</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className="flex flex-col items-center">
                              <span className={`text-xs font-black ${postDone ? 'text-[#628ECB]' : 'text-gray-300'}`}>{postDone ? `${lp?.posttestScore}/${lesson.posttest.questions.length}` : '-'}</span>
                              <span className="text-[8px] font-bold uppercase text-[#395886]/30">Benar</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <Link to={`/review/${lesson.id}`} className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-[#628ECB] hover:text-[#395886] transition-colors">
                              <Eye className="w-3 h-3" />
                              Detail
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* REVIEW JAWABAN MODAL --------------------------------------------------- */}
      <Dialog open={!!reviewModal} onOpenChange={() => setReviewModal(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col rounded-[2.5rem] border-none shadow-2xl p-0">
          <DialogHeader className="p-8 border-b border-[#D5DEEF] bg-[#F8FAFD] shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-[#395886] text-2xl font-black tracking-tight">{reviewModal?.title}</DialogTitle>
                {reviewModal && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-2xl border-2 border-[#D5DEEF] flex items-center gap-3 shadow-sm">
                      <p className="text-[10px] font-black text-[#395886]/40 uppercase tracking-widest">Nilai Akhir</p>
                      <p className="text-xl font-black text-[#395886] tabular-nums">
                        {Math.round((reviewModal.score / (reviewModal.questions.length || 30)) * 100)}
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-2xl border-2 flex items-center gap-2 shadow-sm ${
                      Math.round((reviewModal.score / (reviewModal.questions.length || 30)) * 100) >= 86 ? 'bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]' :
                      Math.round((reviewModal.score / (reviewModal.questions.length || 30)) * 100) >= 71 ? 'bg-[#628ECB]/10 border-[#628ECB]/20 text-[#628ECB]' :
                      Math.round((reviewModal.score / (reviewModal.questions.length || 30)) * 100) >= 60 ? 'bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]' :
                      'bg-red-50 border-red-100 text-red-600'
                    }`}>
                      <p className="text-[10px] font-black uppercase tracking-widest">
                        {
                          Math.round((reviewModal.score / (reviewModal.questions.length || 30)) * 100) >= 86 ? 'Sangat Baik' :
                          Math.round((reviewModal.score / (reviewModal.questions.length || 30)) * 100) >= 71 ? 'Baik' :
                          Math.round((reviewModal.score / (reviewModal.questions.length || 30)) * 100) >= 60 ? 'Cukup' :
                          'Perlu Latihan'
                        }
                      </p>
                    </div>
                    <div className="px-4 py-2 rounded-2xl border-2 border-[#D5DEEF] bg-white flex items-center gap-2 shadow-sm">
                      <p className="text-[10px] font-black text-[#395886]/40 uppercase tracking-widest">Akurasi</p>
                      <p className="text-xs font-black text-[#395886]/60 uppercase tracking-tighter">
                        {reviewModal.score}/{(reviewModal.questions.length || 30)} Benar
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => setReviewModal(null)} className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5 text-[#395886]" />
              </button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-white">
             <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileSearch className="w-16 h-16 text-[#D5DEEF] mb-4 opacity-40" />
                <p className="text-sm font-bold text-[#395886]/40 max-w-xs">Data detail jawaban belum tersedia untuk ditampilkan di modal ini. Silakan cek detail pertemuan.</p>
             </div>
          </div>
          
          <div className="p-6 border-t border-[#D5DEEF] bg-[#F8FAFD] flex justify-end">
             <button onClick={() => setReviewModal(null)} className="px-8 py-3 rounded-2xl bg-[#395886] text-white font-black text-sm hover:bg-[#2A4468] transition-all">Tutup Review</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* FOOTER --------------------------------------------------------------- */}
      <footer className="bg-white border-t border-[#D5DEEF] mt-12 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 grayscale opacity-50">
              <Logo size="sm" />
            </div>
            <p className="text-xs font-bold text-[#395886]/40 uppercase tracking-widest">
              &copy; 2026 CONNETIC Module. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* LOGOUT CONFIRMATION */}
      <AlertDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-[#395886]">Sudah Selesai Belajar?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-[#395886]/60">
              Sesi Anda akan berakhir, tapi progres belajar akan tetap tersimpan aman di sistem kami.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="rounded-xl font-bold border-2 border-[#D5DEEF]">Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600 rounded-xl font-bold shadow-lg shadow-red-200" onClick={handleLogout}>
              Ya, Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FileSearch(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><circle cx="11.5" cy="15.5" r="2.5"/><path d="M16 20l-2-2"/>
    </svg>
  );
}
