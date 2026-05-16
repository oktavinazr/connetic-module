import { useNavigate } from 'react-router';
import { getCurrentUser } from '../utils/auth';
import { saveGlobalPretestResult, getGlobalTestProgress, GlobalTestProgress } from '../utils/progress';
import { globalPretest, type TestQuestion } from '../data/lessons';
import { loadTestQuestions } from '../utils/adminData';
import { TestPage } from '../components/TestPage';
import { useEffect, useState } from 'react';

export function GlobalPretestPage() {
  const navigate = useNavigate();
  const [user] = useState(getCurrentUser);
  const [progress, setProgress] = useState<GlobalTestProgress>({
    userId: user?.id ?? '',
    globalPretestCompleted: false,
    globalPosttestCompleted: false,
  });
  const [questions, setQuestions] = useState<TestQuestion[]>(globalPretest.questions);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    getGlobalTestProgress(user.id).then(setProgress);
    loadTestQuestions('global-pretest').then(setQuestions);
  }, [user, navigate]);

  const handleComplete = async (score: number, answers: number[]) => {
    await saveGlobalPretestResult(user!.id, score, answers);
    getGlobalTestProgress(user!.id).then(setProgress);
  };

  const existingAnswers = progress.globalPretestCompleted
    ? (progress.globalPretestAnswers ?? [])
    : undefined;

  return (
    <TestPage
      title={globalPretest.title}
      description={globalPretest.description}
      questions={questions}
      onComplete={handleComplete}
      backPath="/dashboard"
      showResults={progress.globalPretestCompleted}
      existingAnswers={existingAnswers}
      existingScore={progress.globalPretestScore}
      duration={30}
      instructions={[
        'Kerjakan secara mandiri tanpa membuka materi pembelajaran.',
        'Baca seluruh opsi jawaban lalu pilih satu jawaban yang paling tepat.',
        'Gunakan hasil tes ini sebagai gambaran pemahaman awal sebelum memulai materi.',
      ]}
      durationNote="Waktu pengerjaan maksimal 30 menit. Setelah waktu habis, jawaban yang sudah dipilih akan diproses otomatis."
    />
  );
}
