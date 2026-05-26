import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Lock } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { getLessonProgress, savePosttestResult, LessonProgress } from '../utils/progress';
import { lessons, type TestQuestion } from '../data/lessons';
import { loadTestQuestions } from '../utils/adminData';
import { TestPage } from '../components/TestPage';

export function EvaluationPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [user] = useState(getCurrentUser);
  const lesson = lessonId ? lessons[lessonId] : null;

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
  const [progressLoaded, setProgressLoaded] = useState(false);

  const [questions, setQuestions] = useState<TestQuestion[]>(lesson?.posttest.questions ?? []);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (!lesson) { navigate('/dashboard'); return; }
    getLessonProgress(user.id, lessonId!).then((p) => {
      setProgress(p);
      setProgressLoaded(true);
    });
    loadTestQuestions(`lesson_${lessonId}_posttest`).then(setQuestions);
  }, [user, lesson, lessonId, navigate]);

  if (!lesson) return null;

  // Show loading skeleton until progress is confirmed — prevents flash of the
  // start screen for students who already completed the posttest.
  if (!progressLoaded) {
    return (
      <div className="min-h-screen bg-[#F0F3FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="h-16 w-16 rounded-2xl bg-[#D5DEEF]" />
          <div className="h-4 w-48 rounded-lg bg-[#D5DEEF]" />
          <div className="h-3 w-32 rounded-lg bg-[#D5DEEF]" />
        </div>
      </div>
    );
  }

  // Hard lock: posttest can only be taken once. If already completed, show a
  // locked/results screen immediately — never allow re-starting the test.
  if (progress.posttestCompleted && !(progress.answers.posttest as number[] | undefined)?.length) {
    return (
      <div className="min-h-screen bg-[#F0F3FA] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border-2 border-[#628ECB]/20 shadow-lg p-10 max-w-md w-full text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#628ECB]/10 mx-auto mb-5">
            <Lock className="h-10 w-10 text-[#628ECB]" />
          </div>
          <h2 className="text-xl font-black text-[#395886] mb-2">Post-Test Sudah Dikerjakan</h2>
          <p className="text-sm text-[#395886]/60 leading-relaxed mb-6">
            Post-test untuk pertemuan ini hanya dapat dikerjakan satu kali dan sudah kamu selesaikan sebelumnya.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 bg-[#395886] text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-[#628ECB] transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleComplete = async (score: number, answers: number[]) => {
    await savePosttestResult(user!.id, lessonId!, score, answers);
    // Redirect to review page after brief delay to show results
    setTimeout(() => navigate(`/review/${lessonId}`), 2000);
  };

  const existingAnswers = progress.posttestCompleted
    ? (progress.answers.posttest as number[] | undefined)
    : undefined;

  return (
    <TestPage
      title={`Post-Test ${lesson.title}`}
      description={`Evaluasi akhir untuk ${lesson.topic}`}
      questions={questions}
      onComplete={handleComplete}
      backPath="/dashboard"
      showResults={progress.posttestCompleted}
      existingAnswers={existingAnswers}
      existingScore={progress.posttestScore}
      duration={10} // 10 menit untuk posttest pertemuan
      lessonFlow={{
        step: 4,
        lessonId: lessonId!,
        pretestCompleted: progress.pretestCompleted,
        allStagesCompleted: progress.completedStages.length === lesson.stages.length,
        posttestCompleted: progress.posttestCompleted,
      }}
    />
  );
}