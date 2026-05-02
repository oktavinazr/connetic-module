import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import {
  ChevronLeft,
  CheckCircle,
  Lock,
  BookMarked,
  Network,
  Layers,
  ArrowLeftRight,
  ListChecks,
  ArrowRight,
} from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { isLessonUnlocked, getLessonProgress } from '../utils/progress';
import { lessons } from '../data/lessons';
import { LessonFlowSidebar } from '../components/LessonFlowSidebar';
import { Logo } from '../components/layout/Logo';

const topicCardConfig = [
  {
    Icon: Network,
    gradient: 'from-[#628ECB] to-[#395886]',
    border: 'border-[#628ECB]/20',
    text: 'text-[#628ECB]',
    num: '01',
  },
  {
    Icon: ListChecks,
    gradient: 'from-[#10B981] to-[#059669]',
    border: 'border-[#10B981]/20',
    text: 'text-[#10B981]',
    num: '02',
  },
  {
    Icon: Layers,
    gradient: 'from-[#8B5CF6] to-[#7C3AED]',
    border: 'border-[#8B5CF6]/20',
    text: 'text-[#8B5CF6]',
    num: '03',
  },
  {
    Icon: ArrowLeftRight,
    gradient: 'from-[#EC4899] to-[#DB2777]',
    border: 'border-[#EC4899]/20',
    text: 'text-[#EC4899]',
    num: '04',
  },
];

export function LessonIntroPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [user] = useState(getCurrentUser);
  const lesson = lessonId ? lessons[lessonId] : null;
  const [unlocked, setUnlocked] = useState(false);
  const [progress, setProgress] = useState({
    lessonId: lessonId ?? '',
    userId: user?.id ?? '',
    pretestCompleted: false,
    completedStages: [] as number[],
    posttestCompleted: false,
    answers: {} as Record<string, any>,
    stageAttempts: {} as Record<string, number>,
    stageSuccess: {} as Record<string, boolean>,
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (!lesson) { navigate('/dashboard'); return; }
    isLessonUnlocked(user.id, lessonId!).then(setUnlocked);
    getLessonProgress(user.id, lessonId!).then(setProgress);
  }, [user, lesson, lessonId, navigate]);

  const fullyCompleted =
    progress.pretestCompleted &&
    progress.completedStages.length === lesson?.stages.length &&
    progress.posttestCompleted;

  if (!lesson) return null;

  const header = (
    <header className="sticky top-0 z-50 w-full border-b border-[#C8D8F0] bg-white/95 shadow-md backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[76px] items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="hidden sm:block min-w-0"><Logo /></div>
              <div className="sm:hidden"><Logo size="sm" /></div>
            </Link>
            <div className="h-8 w-px bg-[#D5DEEF] hidden sm:block" />
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#628ECB]/10 px-3 py-1 text-xs font-bold text-[#628ECB] uppercase tracking-widest border border-[#628ECB]/20">
              {lesson.title}
            </span>
          </div>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-[#395886] hover:text-[#628ECB] transition-colors text-sm font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  );

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#F0F3FA]">
        {header}
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-[#D5DEEF]">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mx-auto mb-6">
              <Lock className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-[#395886] mb-3">{lesson.title} Terkunci</h1>
            <p className="text-[#395886]/70 mb-8 font-medium">
              Selesaikan pertemuan sebelumnya terlebih dahulu untuk membuka pertemuan ini.
            </p>
            <Link
              to="/dashboard"
              className="inline-block bg-[#628ECB] text-white px-8 py-3 rounded-2xl hover:bg-[#395886] transition-colors font-bold shadow-lg"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFD]">
      {header}

      <div className="max-w-7xl mx-auto lg:flex lg:items-start lg:gap-8 px-4 sm:px-6 lg:px-8 py-8">
        <aside className="hidden lg:block lg:w-64 lg:shrink-0 lg:sticky lg:top-[100px]">
          <LessonFlowSidebar
            lesson={lesson}
            lessonId={lessonId!}
            progress={progress}
            currentStep={1}
            fullyCompleted={fullyCompleted}
          />
        </aside>

        <main className="flex-1 min-w-0">
          {/* Mobile Header */}
          <div className="lg:hidden mb-6 bg-gradient-to-br from-[#395886] to-[#628ECB] rounded-2xl px-5 py-4 shadow-lg shadow-[#628ECB]/20">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{lesson.title}</p>
            <p className="text-base font-black text-white leading-tight tracking-tight">{lesson.topic}</p>
          </div>

          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">

            {/* Pendahuluan Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#395886] to-[#628ECB] rounded-[2rem] px-8 py-7 text-white shadow-xl shadow-[#628ECB]/20">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-lg ring-1 ring-white/30">
                    <BookMarked className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-1">Eksplorasi Pembelajaran</p>
                    <h2 className="text-xl font-black tracking-tight">Pendahuluan — {lesson.topic}</h2>
                  </div>
                </div>
                <p className="text-sm font-medium text-white/80 leading-relaxed max-w-2xl">
                  Selamat datang di pertemuan ini! Di bawah ini adalah ringkasan materi yang akan Anda eksplorasi. Pastikan untuk meninjau kompetensi awal sebelum memulai Pre-Test untuk hasil maksimal.
                </p>
              </div>
            </div>

            {/* 4 Interactive Topic Cards */}
            {lesson.materials && lesson.materials.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-4">
                {lesson.materials.map((mat, i) => {
                  const cfg = topicCardConfig[i % topicCardConfig.length];
                  const { Icon, gradient, border, text, num } = cfg;
                  return (
                    <div
                      key={i}
                      className={`bg-white rounded-[1.5rem] border-2 ${border} shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:border-[#628ECB]/30 transition-all duration-300 group`}
                    >
                      <div className="flex items-center gap-5 p-6">
                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${text} mb-1.5`}>
                            Materi {num}
                          </p>
                          <p className="text-[15px] font-black text-[#395886] leading-snug tracking-tight">{mat}</p>
                        </div>
                      </div>
                      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient} opacity-20 group-hover:opacity-100 transition-opacity duration-300`} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Kompetensi Awal - Redesigned */}
            <div className="bg-white rounded-[2rem] border-2 border-[#D5DEEF] shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 border-b-2 border-[#D5DEEF]/60 bg-[#F8FAFD] px-8 py-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md border border-[#D5DEEF]/40">
                  <CheckCircle className="h-5 w-5 text-[#10B981]" />
                </div>
                <div>
                  <h2 className="text-base font-black text-[#395886] tracking-tight">Kompetensi Awal</h2>
                  <p className="text-[10px] font-bold text-[#395886]/40 uppercase tracking-widest mt-0.5">Syarat Minimum Pembelajaran</p>
                </div>
              </div>
              <div className="p-8">
                <div className="grid gap-4 sm:grid-cols-1">
                  {lesson.initialCompetencies.map((comp, i) => (
                    <div key={i} className="flex items-center gap-5 p-5 rounded-2xl bg-[#F0FDF4]/50 border-2 border-[#10B981]/10 transition-all hover:bg-[#F0FDF4] hover:border-[#10B981]/30 group">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#10B981] shadow-sm border border-[#10B981]/20 group-hover:scale-110 transition-transform">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-bold text-[#395886]/80 leading-relaxed">{comp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Section - Polished */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-white to-[#F8FAFD] rounded-[2rem] border-2 border-[#D5DEEF] shadow-lg px-8 py-6">
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h3 className="text-base font-black text-[#395886] mb-1">Siap Memulai Tantangan?</h3>
                <p className="text-[13px] text-[#395886]/60 font-bold">
                  Kerjakan Pre-Test sekarang untuk menguji pemahaman awal Anda.
                </p>
              </div>
              <Link
                to={`/lesson-pretest/${lessonId}`}
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-3 bg-[#628ECB] text-white px-8 py-4 rounded-[1.2rem] hover:bg-[#395886] hover:shadow-xl hover:shadow-[#395886]/20 transition-all font-black text-sm shadow-lg active:scale-95 group"
              >
                Mulai Pre-Test
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
