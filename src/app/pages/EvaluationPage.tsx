import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
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

  const [questions, setQuestions] = useState<TestQuestion[]>(lesson?.posttest.questions ?? []);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (!lesson) { navigate('/dashboard'); return; }
    getLessonProgress(user.id, lessonId!).then((p) => {
      if (p.completedStages.length < lesson.stages.length) {
        navigate(`/lesson/${lessonId}`);
        return;
      }
      setProgress(p);
    });
    loadTestQuestions(`lesson_${lessonId}_posttest`).then(setQuestions);
  }, [user, lesson, lessonId, navigate]);

  if (!lesson) return null;

  const handleComplete = async (score: number, answers: number[]) => {
    await savePosttestResult(user!.id, lessonId!, score, answers);
    // Redirect to review page after brief delay to show results
    setTimeout(() => navigate(`/review/${lessonId}`), 2000);
  };

  const existingAnswers = progress.posttestCompleted
    ? progress.answers.posttest
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
      duration={15} // 15 menit untuk posttest pertemuan
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