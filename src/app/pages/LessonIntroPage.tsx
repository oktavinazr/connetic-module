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
  ArrowRight,
} from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { isLessonUnlocked, getLessonProgress } from '../utils/progress';
import { lessons } from '../data/lessons';
import { LessonFlowSidebar } from '../components/LessonFlowSidebar';
import { Logo } from '../components/layout/Logo';

const materialIcons: Record<string, React.ComponentType<any>> = {
  'Konsep Dasar TCP/IP': Network,
  'Lapisan Protokol TCP/IP': Layers,
  'Alur Transmisi Data (Encapsulation & Decapsulation)': ArrowLeftRight,
};

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
            <p className="text-white/60 text-xs font-black uppercase tracking-[0.2em] mb-1">{lesson.title}</p>
            <p className="text-lg font-black text-white leading-tight tracking-tight">{lesson.topic}</p>
          </div>

          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">

            {/* Pendahuluan Banner — Deep Tech Blue */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#395886] to-[#628ECB] rounded-2xl px-6 sm:px-8 py-6 text-white shadow-xl shadow-[#628ECB]/20">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg ring-1 ring-white/30">
                    <BookMarked className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-white/60 mb-0.5">Pendahuluan</p>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">{lesson.topic}</h2>
                  </div>
                </div>
                <p className="text-sm font-medium text-white/80 leading-relaxed">
                  Selamat datang di pertemuan ini. Di bawah ini adalah ringkasan materi yang akan Anda eksplorasi.
                  Pastikan untuk meninjau kompetensi awal sebelum memulai Pre-Test untuk hasil maksimal.
                </p>
              </div>
            </div>

            {/* Materi Pembelajaran — Compact Cards */}
            {lesson.materials && lesson.materials.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#395886]/40">Materi Pembelajaran</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {lesson.materials.map((mat, i) => {
                    const Icon = materialIcons[mat];
                    return (
                      <div
                        key={i}
                        className="bg-white rounded-xl border-2 border-[#D5DEEF] shadow-sm px-4 py-3.5 flex items-center gap-3 hover:border-[#628ECB]/25 hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#628ECB]/10 group-hover:bg-[#628ECB]/20 transition-colors">
                          {Icon ? <Icon className="h-4 w-4 text-[#628ECB]" /> : <BookMarked className="h-4 w-4 text-[#628ECB]" />}
                        </div>
                        <span className="text-sm font-bold text-[#395886] leading-tight">{mat}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Kompetensi Awal — Compact & Readable */}
            <div className="bg-white rounded-2xl border-2 border-[#D5DEEF] shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#D5DEEF] bg-[#F8FAFD]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#10B981]/10">
                  <CheckCircle className="h-5 w-5 text-[#10B981]" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-[#10B981] mb-0.5">Kompetensi Awal</p>
                  <p className="text-xs font-semibold text-[#395886]/40 uppercase tracking-widest">Syarat Minimum Pembelajaran</p>
                </div>
              </div>
              <div className="px-5 py-3.5">
                <div className="space-y-2.5">
                  {lesson.initialCompetencies.map((comp, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F0FDF4]/40 border border-[#10B981]/10">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#10B981]/10 mt-0.5">
                        <CheckCircle className="h-3.5 w-3.5 text-[#10B981]" />
                      </div>
                      <span className="text-sm font-medium text-[#395886]/75 leading-relaxed">{comp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl border-2 border-[#D5DEEF] shadow-sm px-5 py-4">
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h3 className="text-base font-bold text-[#395886] mb-0.5">Siap Memulai Tantangan?</h3>
                <p className="text-sm text-[#395886]/60 font-medium">
                  Kerjakan Pre-Test sekarang untuk menguji pemahaman awal Anda.
                </p>
              </div>
              <Link
                to={`/lesson-pretest/${lessonId}`}
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2.5 bg-[#628ECB] text-white px-6 py-3 rounded-xl hover:bg-[#395886] hover:shadow-lg transition-all font-bold text-sm shadow-md active:scale-95 group"
              >
                Mulai Pre-Test
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
