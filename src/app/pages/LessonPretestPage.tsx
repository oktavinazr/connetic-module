import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { getCurrentUser } from '../utils/auth';
import { getLessonProgress, savePretestResult, isLessonUnlocked, LessonProgress } from '../utils/progress';
import { lessons, type TestQuestion } from '../data/lessons';
import { loadTestQuestions } from '../utils/adminData';
import { TestPage } from '../components/TestPage';
import { Lock } from 'lucide-react';
import { Logo } from '../components/layout/Logo';

export function LessonPretestPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [user] = useState(getCurrentUser);
  const lesson = lessonId ? lessons[lessonId] : null;

  const [testActive, setTestActive] = useState(false);

  const [progress, setProgress] = useState<LessonProgress>({
    lessonId: lessonId ?? '',
    userId: user?.id ?? '',
    pretestCompleted: false,
    completedStages: [],
    posttestCompleted: false,
    answers: {},
    stageAttempts: {},
    stageSuccess: {},
  });
  const [unlocked, setUnlocked] = useState(false);
  const [questions, setQuestions] = useState<TestQuestion[]>(lesson?.pretest.questions ?? []);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (!lesson) { navigate('/dashboard'); return; }
    getLessonProgress(user.id, lessonId!).then(setProgress);
    isLessonUnlocked(user.id, lessonId!).then(setUnlocked);
    loadTestQuestions(`lesson_${lessonId}_pretest`).then(setQuestions);
  }, [user, lesson, lessonId, navigate]);

  useEffect(() => {
    if (!testActive || progress.pretestCompleted) return;
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [testActive, progress.pretestCompleted]);

  if (!lesson) return null;

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#F0F3FA]">
      <header className="sticky top-0 z-50 w-full border-b border-[#C8D8F0] bg-white/95 shadow-md backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[76px] items-center justify-between gap-6">
            <div className="flex min-w-0 items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="hidden min-w-0 sm:block">
                  <Logo />
                </div>
                <div className="sm:hidden">
                  <Logo size="sm" />
                </div>
              </Link>
              <div className="h-8 w-px bg-[#D5DEEF] hidden sm:block" />
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#628ECB]/10 px-3 py-1 text-xs font-bold text-[#628ECB] uppercase tracking-widest border border-[#628ECB]/20">
                Pre-Test Pertemuan
              </span>
            </div>
          </div>
        </div>
      </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-[2rem] shadow-lg p-8 text-center border border-[#D5DEEF]">
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

  const handleComplete = async (score: number, answers: number[]) => {
    setProgress(prev => ({ ...prev, pretestCompleted: true }));
    await savePretestResult(user!.id, lessonId!, score, answers);
    getLessonProgress(user!.id, lessonId!).then(setProgress);
  };

  const existingAnswers = progress.pretestCompleted
    ? progress.answers.pretest
    : undefined;

  return (
    <TestPage
      title={`Pre-Test ${lesson.title}`}
      description={`Tes awal untuk mengukur pemahaman awal Anda sebelum mempelajari ${lesson.topic}.`}
      questions={questions}
      onComplete={handleComplete}
      backPath={progress.pretestCompleted ? `/lesson/${lessonId}` : `/lesson-intro/${lessonId}`}
      showResults={progress.pretestCompleted}
      existingAnswers={existingAnswers}
      existingScore={progress.pretestScore}
      duration={5}
      onStart={() => setTestActive(true)}
      isLessonPretest={true}
      lessonFlow={{
        step: 2,
        lessonId: lessonId!,
        pretestCompleted: progress.pretestCompleted,
        allStagesCompleted: progress.completedStages.length === lesson.stages.length,
        posttestCompleted: progress.posttestCompleted,
      }}
    />
  );
}
