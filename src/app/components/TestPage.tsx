import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router';
import {
  BookOpen,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Award,
  Clock,
  ArrowRight,
  FileText,
  Info,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { TestQuestion } from '../data/lessons';
import { lessons } from '../data/lessons';
import { getLessonProgress } from '../utils/progress';
import { getCurrentUser } from '../utils/auth';
import { LessonFlowSidebar } from './LessonFlowSidebar';
import { Logo } from './layout/Logo';

interface TestPageProps {
  title: string;
  description: string;
  questions: TestQuestion[];
  onComplete: (score: number, answers: number[]) => void;
  backPath: string;
  reflectionPath?: string;
  showResults?: boolean;
  existingAnswers?: number[];
  existingScore?: number;
  duration?: number;
  onStart?: () => void;
  isLessonPretest?: boolean;
  instructions?: string[];
  durationNote?: string;
  lessonFlow?: {
    step: number;
    lessonId?: string;
    pretestCompleted: boolean;
    allStagesCompleted: boolean;
    posttestCompleted: boolean;
  };
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

export function TestPage({
  title,
  description,
  questions,
  onComplete,
  backPath,
  reflectionPath,
  showResults: initialShowResults,
  existingAnswers,
  existingScore,
  duration,
  onStart,
  isLessonPretest,
  instructions = [],
  durationNote,
  lessonFlow,
}: TestPageProps) {
  const [started, setStarted] = useState(!!existingAnswers && existingAnswers.length > 0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => {
    if (existingAnswers && existingAnswers.length > 0) return existingAnswers;
    return new Array(questions.length).fill(null);
  });
  const [showResults, setShowResults] = useState(initialShowResults || false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    duration && !initialShowResults ? duration * 60 : null
  );
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Data sidebar (saat digunakan di dalam alur pertemuan)
  const sidebarLesson = lessonFlow?.lessonId ? lessons[lessonFlow.lessonId] : null;
  const sidebarUser = getCurrentUser();
  const [sidebarProgress, setSidebarProgress] = useState<import('../utils/progress').LessonProgress | null>(null);
  const sidebarFullyCompleted = !!(lessonFlow?.pretestCompleted && lessonFlow.allStagesCompleted && lessonFlow.posttestCompleted);
  const hasSidebar = !!(sidebarLesson && sidebarProgress && lessonFlow?.lessonId);

  useEffect(() => {
    if (lessonFlow?.lessonId && sidebarUser) {
      getLessonProgress(sidebarUser.id, lessonFlow.lessonId).then(setSidebarProgress as any);
    }
  }, [lessonFlow?.lessonId]);

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = answers[currentQuestionIndex];

  const handleTimeUp = useCallback(() => {
    const finalAnswers = answers.map(a => a ?? -1); // Fill unanswered with -1
    const score = finalAnswers.filter((ans, idx) => ans === questions[idx].correctAnswer).length;
    onComplete(score, finalAnswers);
    setShowResults(true);
  }, [answers, questions, onComplete]);

  useEffect(() => {
    if (started && !showResults && timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [started, showResults, timeRemaining]);

  useEffect(() => {
    if (started && !showResults && timeRemaining === 0 && duration) {
      handleTimeUp();
    }
  }, [timeRemaining, started, showResults, handleTimeUp, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (optionIndex: number) => {
    if (showResults) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowConfirmSubmit(true);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleConfirmSubmit = () => {
    const finalAnswers = answers.map(a => a ?? -1);
    const score = finalAnswers.filter((ans, idx) => ans === questions[idx].correctAnswer).length;
    onComplete(score, finalAnswers);
    setShowConfirmSubmit(false);
    setShowResults(true);
  };

  const handleCancelSubmit = () => {
    setShowConfirmSubmit(false);
  };

  const answeredCount = answers.filter(a => a !== null).length;
  const progress = (answeredCount / questions.length) * 100;

  const score =
    existingScore !== undefined
      ? existingScore
      : answers.filter((ans, idx) => ans === questions[idx].correctAnswer).length;
  const percentage = Math.round((score / questions.length) * 100);

  const introInstructions =
    instructions.length > 0
      ? instructions
      : [
          'Baca setiap soal dengan teliti sebelum memilih jawaban.',
          'Pilih satu jawaban yang paling tepat pada setiap nomor.',
          'Periksa kembali jawaban Anda sebelum menyelesaikan tes.',
        ];

  const scoreColor =
    percentage >= 86
      ? { text: 'text-[#10B981]', bg: 'bg-[#10B981]', light: 'bg-[#10B981]/10', border: 'border-[#10B981]/30', label: 'Sangat Baik', msg: 'Luar biasa! Pemahamanmu sangat mendalam.', sub: 'Kamu siap melanjutkan ke tantangan berikutnya dengan percaya diri.' }
      : percentage >= 71
      ? { text: 'text-[#628ECB]', bg: 'bg-[#628ECB]', light: 'bg-[#628ECB]/10', border: 'border-[#628ECB]/30', label: 'Baik', msg: 'Kerja bagus! Kamu memahami materi dengan baik.', sub: 'Pertahankan performamu dan teruslah bereksplorasi.' }
      : percentage >= 60
      ? { text: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]', light: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/30', label: 'Cukup', msg: 'Cukup baik, namun masih ada ruang untuk belajar.', sub: 'Tinjau kembali beberapa konsep yang belum sepenuhnya dikuasai.' }
      : { text: 'text-red-500', bg: 'bg-red-500', light: 'bg-red-50/50', border: 'border-red-200', label: 'Perlu Latihan', msg: 'Jangan menyerah! Belajar adalah proses.', sub: 'Yuk, pelajari lagi materinya dan coba kerjakan ulang nanti.' };

  // ─── Question Navigation Component ────────────────────────────────────────

  const QuestionNavPanel = ({ className = "" }: { className?: string }) => (
    <div className={`bg-white rounded-3xl border border-[#D5DEEF] shadow-sm overflow-hidden flex flex-col ${className}`}>
      <div className="px-5 py-4 border-b border-[#D5DEEF] bg-[#F8FAFD]">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-black text-[#395886] uppercase tracking-widest">Navigasi Soal</h3>
          <span className="text-[10px] font-bold text-[#628ECB] bg-[#628ECB]/10 px-2 py-0.5 rounded-full">
            {answeredCount}/{questions.length} Terjawab
          </span>
        </div>
        <div className="h-1 w-full bg-[#D5DEEF] rounded-full overflow-hidden mt-2">
          <div className="h-full bg-[#628ECB] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="p-4 overflow-y-auto max-h-[300px] sm:max-h-none">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((_, idx) => {
            const isAnswered = answers[idx] !== null;
            const isCurrent = idx === currentQuestionIndex;
            return (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`h-9 w-full rounded-xl text-xs font-black transition-all flex items-center justify-center border-2
                  ${isCurrent 
                    ? 'border-[#628ECB] bg-[#628ECB] text-white shadow-md shadow-[#628ECB]/20' 
                    : isAnswered 
                    ? 'border-[#10B981] bg-[#10B981]/5 text-[#10B981]' 
                    : 'border-[#D5DEEF] bg-white text-[#395886]/40 hover:border-[#628ECB]/30'}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-4 bg-[#F8FAFD] border-t border-[#D5DEEF] space-y-2">
        <div className="flex items-center gap-2 text-[10px] font-bold text-[#395886]/60">
          <div className="w-2.5 h-2.5 rounded-full bg-[#D5DEEF]" /> Belum dijawab
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-[#10B981]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Sudah dijawab
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-[#628ECB]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#628ECB]" /> Sedang dibuka
        </div>
      </div>
    </div>
  );

  // ─── Tampilan Hasil ────────────────────────────────────────────────────────

  if (showResults) {
    return (
      <div className="min-h-screen bg-[#F0F3FA]">
      <header className="sticky top-0 z-50 w-full border-b border-[#C8D8F0] bg-white/95 shadow-md backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[76px] items-center justify-between gap-6">
            <div className="flex min-w-0 items-center gap-4">
              <Link to={backPath} className="flex items-center gap-3">
                <div className="hidden sm:block min-w-0">
                  <Logo />
                </div>
                <div className="sm:hidden">
                  <Logo size="sm" />
                </div>
              </Link>
              <div className="h-8 w-px bg-[#D5DEEF] hidden sm:block" />
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#628ECB]/10 px-3 py-1 text-xs font-bold text-[#628ECB] uppercase tracking-widest border border-[#628ECB]/20">
                {title}
              </span>
            </div>
            <Link
              to={backPath}
              className="flex items-center gap-2 text-[#395886] hover:text-[#628ECB] transition-colors text-sm font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali</span>
            </Link>
          </div>
        </div>
      </header>

        <div className="max-w-7xl mx-auto lg:flex lg:items-start lg:gap-6 px-4 sm:px-6 lg:px-8 py-6">
          {hasSidebar && (
            <aside className="hidden lg:block lg:w-64 lg:shrink-0 lg:sticky lg:top-[100px]">
              <LessonFlowSidebar
                lesson={sidebarLesson!}
                lessonId={lessonFlow!.lessonId!}
                progress={sidebarProgress!}
                currentStep={lessonFlow!.step as 1 | 2 | 3 | 4}
                fullyCompleted={sidebarFullyCompleted}
              />
            </aside>
          )}
          <main className="flex-1 min-w-0">
          {/* Kartu Skor — compact & modern */}
          <div className="bg-white rounded-[2.5rem] shadow-lg border border-[#D5DEEF] overflow-hidden mb-8 animate-in zoom-in duration-500">
            <div className="bg-gradient-to-br from-[#395886] via-[#4A6FA8] to-[#628ECB] px-8 py-10">
              <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-[2rem] bg-white/10 backdrop-blur-md shadow-2xl ring-1 ring-white/30 flex-col group transition-transform hover:scale-105 duration-500">
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-1">Nilai Akhir</p>
                  <span className="text-5xl font-black text-white leading-none tabular-nums">{percentage}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                    <span className={`px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border-2 shadow-sm ${scoreColor.bg} text-white border-white/20`}>
                      {scoreColor.label}
                    </span>
                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">— {title} Selesai</span>
                  </div>
                  <h1 className="text-2xl font-black text-white leading-tight mb-2">{scoreColor.msg}</h1>
                  <p className="text-white/70 text-sm font-medium leading-relaxed max-w-lg">
                    {scoreColor.sub}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 shrink-0 w-full sm:w-auto">
                  <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-2xl border border-white/10 shadow-inner">
                    <div className="h-8 w-8 rounded-lg bg-[#34D399] flex items-center justify-center text-white shadow-lg shadow-[#34D399]/20">
                      <CheckCircle className="h-4 w-4" strokeWidth={3} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Benar</p>
                      <p className="text-base font-black text-white leading-none">{score}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-2xl border border-white/10 shadow-inner">
                    <div className="h-8 w-8 rounded-lg bg-red-400 flex items-center justify-center text-white shadow-lg shadow-red-400/20">
                      <XCircle className="h-4 w-4" strokeWidth={3} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Salah</p>
                      <p className="text-base font-black text-white leading-none">{questions.length - score}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-8 py-5 bg-[#F8FAFD] border-t border-[#D5DEEF] flex items-center gap-4">
              <div className="h-2 flex-1 bg-[#D5DEEF] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${scoreColor.bg}`} style={{ width: `${percentage}%` }} />
              </div>
              <span className={`text-xs font-black uppercase tracking-widest ${scoreColor.text}`}>
                Total: {questions.length} Soal
              </span>
            </div>
          </div>

          {/* Tombol Aksi Akhir */}
          <div className="mb-5 flex justify-center">
            {reflectionPath ? (
              <Link
                to={reflectionPath}
                className="inline-flex items-center gap-2 bg-[#F59E0B] text-white px-8 py-3.5 rounded-2xl hover:bg-[#D97706] transition-all shadow-lg font-black text-sm active:scale-95"
              >
                Lanjut ke Refleksi Belajar
                <ChevronRight className="h-5 w-5" strokeWidth={3} />
              </Link>
            ) : (
              <Link
                to={backPath}
                state={isLessonPretest ? { pretestJustCompleted: true } : undefined}
                className="inline-flex items-center gap-2 bg-[#395886] text-white px-8 py-3.5 rounded-2xl hover:bg-[#2A4468] transition-all shadow-md font-bold active:scale-95"
              >
                {isLessonPretest ? (
                  <>
                    Lanjutkan ke Tahapan CTL
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <ChevronLeft className="h-4 w-4" />
                    Kembali ke Dashboard
                  </>
                )}
              </Link>
            )}
          </div>

          {/* Ulasan Jawaban — compact */}
          <div className="bg-white rounded-3xl shadow-md border border-[#D5DEEF] overflow-hidden mb-6">
            <div className="flex items-center gap-3 border-b border-[#D5DEEF] px-6 py-4 bg-[#F8FAFD]">
              <FileText className="h-4 w-4 text-[#628ECB]" />
              <h2 className="text-sm font-bold text-[#395886]">Preview Jawaban</h2>
              <span className="ml-auto flex items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1 text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-full border border-[#10B981]/20"><CheckCircle className="h-3.5 w-3.5" />{score} Benar</span>
                <span className="flex items-center gap-1 text-red-500 bg-red-50 px-2.5 py-1 rounded-full border border-red-100"><XCircle className="h-3.5 w-3.5" />{questions.length - score} Salah</span>
              </span>
            </div>

            <div className="p-5 space-y-4">
              {questions.map((q, index) => {
                const studentAnswer = answers[index];
                const isCorrect = studentAnswer === q.correctAnswer;
                return (
                  <div key={index} className={`rounded-2xl border p-4 transition-all ${isCorrect ? 'border-[#10B981]/25 bg-[#10B981]/[0.025]' : 'border-red-100 bg-red-50/30'}`}>
                    <div className="mb-3 flex gap-3">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-black shadow-sm ${isCorrect ? 'bg-[#10B981] text-white' : 'bg-red-500 text-white'}`}>
                        {index + 1}
                      </span>
                      <p className="font-semibold text-[#395886] leading-snug text-sm">{q.question}</p>
                    </div>

                    <div className="ml-10 grid gap-1.5">
                      {q.options.map((opt, j) => {
                        const isStudentChoice = studentAnswer === j;
                        const isCorrectChoice = q.correctAnswer === j;

                        let cls = 'flex items-center gap-2.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all ';
                        if (isCorrectChoice) {
                          cls += 'border-[#10B981] bg-[#10B981]/10 text-[#0F8A66]';
                        } else if (isStudentChoice && !isCorrect) {
                          cls += 'border-red-300 bg-red-50 text-red-700';
                        } else {
                          cls += 'border-[#E5EBF5] bg-white text-[#395886]/40';
                        }

                        return (
                          <div key={j} className={cls}>
                            <span className={`shrink-0 font-black w-4 ${isCorrectChoice ? 'text-[#0F8A66]' : isStudentChoice ? 'text-red-700' : 'text-[#395886]/25'}`}>
                              {OPTION_LABELS[j]}.
                            </span>
                            <span className="flex-1 leading-snug">{opt}</span>
                            {isCorrectChoice && <CheckCircle className="ml-auto h-4 w-4 shrink-0 text-[#10B981]" />}
                            {isStudentChoice && !isCorrect && <XCircle className="ml-auto h-4 w-4 shrink-0 text-red-500" />}
                          </div>
                        );
                      })}
                    </div>

                    {!isCorrect && typeof studentAnswer === 'number' && studentAnswer !== -1 && (
                      <div className="ml-10 mt-2.5 flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-100 px-3 py-1.5 font-bold text-red-600 text-[10px]">
                          <XCircle className="h-3 w-3" /> Jawaban kamu: <span className="font-black ml-0.5">{OPTION_LABELS[studentAnswer]}</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg bg-[#10B981]/5 border border-[#10B981]/20 px-3 py-1.5 font-bold text-[#10B981] text-[10px]">
                          <CheckCircle className="h-3 w-3" /> Jawaban benar: <span className="font-black ml-0.5">{OPTION_LABELS[q.correctAnswer]}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
      </div>
    );
  }

  // ─── Tampilan Intro ────────────────────────────────────────────────────────

  if (!started) {
    return (
      <div className="min-h-screen bg-[#F0F3FA]">
      <header className="sticky top-0 z-50 w-full border-b border-[#C8D8F0] bg-white/95 shadow-md backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[76px] items-center justify-between gap-6">
            <div className="flex min-w-0 items-center gap-4">
              <Link to={backPath} className="flex items-center gap-3">
                <div className="hidden sm:block min-w-0">
                  <Logo />
                </div>
                <div className="sm:hidden">
                  <Logo size="sm" />
                </div>
              </Link>
              <div className="h-8 w-px bg-[#D5DEEF] hidden sm:block" />
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#628ECB]/10 px-3 py-1 text-xs font-bold text-[#628ECB] uppercase tracking-widest border border-[#628ECB]/20">
                {title}
              </span>
            </div>
            <Link
              to={backPath}
              className="flex items-center gap-2 text-[#395886] hover:text-[#628ECB] transition-colors text-sm font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali</span>
            </Link>
          </div>
        </div>
      </header>

        <div className="max-w-7xl mx-auto lg:flex lg:items-start lg:gap-6 px-4 sm:px-6 lg:px-8 py-6">
          {hasSidebar && (
            <aside className="hidden lg:block lg:w-64 lg:shrink-0 lg:sticky lg:top-[100px]">
              <LessonFlowSidebar
                lesson={sidebarLesson!}
                lessonId={lessonFlow!.lessonId!}
                progress={sidebarProgress!}
                currentStep={lessonFlow!.step as 1 | 2 | 3 | 4}
                fullyCompleted={sidebarFullyCompleted}
              />
            </aside>
          )}
          <main className="flex-1 min-w-0">
            {/* Kartu Hero */}
            <div className="bg-white rounded-[2rem] shadow-md border border-[#D5DEEF] overflow-hidden mb-6">
              <div className="bg-gradient-to-br from-[#395886] to-[#628ECB] px-8 py-8 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 mx-auto mb-4 shadow-md">
                  <FileText className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
                <p className="text-white/80 text-sm leading-relaxed">{description}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              {/* Petunjuk */}
              <div className="bg-white rounded-[1.5rem] border border-[#D5DEEF] shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 border-b border-[#628ECB]/20 bg-[#628ECB]/5 px-5 py-3">
                  <Info className="h-4 w-4 text-[#628ECB]" />
                  <h2 className="text-sm font-bold text-[#395886]">Petunjuk Pengerjaan</h2>
                </div>
                <div className="p-5">
                  <ul className="space-y-2.5">
                    {introInstructions.map((instruction, index) => (
                      <li key={index} className="flex items-start gap-2.5 text-sm text-[#395886]/80">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#628ECB]/10 text-[10px] font-bold text-[#628ECB]">
                          {index + 1}
                        </span>
                        <span className="leading-relaxed">{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Info Tes */}
              <div className="bg-white rounded-[1.5rem] border border-[#D5DEEF] shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 border-b border-[#10B981]/20 bg-[#10B981]/5 px-5 py-3">
                  <Award className="h-4 w-4 text-[#10B981]" />
                  <h2 className="text-sm font-bold text-[#395886]">Informasi Tes</h2>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3 rounded-xl bg-[#F0F3FA] px-4 py-3">
                    <FileText className="h-4 w-4 text-[#628ECB] shrink-0" />
                    <div>
                      <p className="text-xs text-[#395886]/50 font-semibold">Jumlah Soal</p>
                      <p className="text-sm font-bold text-[#395886]">{questions.length} soal pilihan ganda</p>
                    </div>
                  </div>
                  {duration && (
                    <div className="flex items-center gap-3 rounded-xl bg-[#F0F3FA] px-4 py-3">
                      <Clock className="h-4 w-4 text-[#628ECB] shrink-0" />
                      <div>
                        <p className="text-xs text-[#395886]/50 font-semibold">Durasi</p>
                        <p className="text-sm font-bold text-[#395886]">{duration} menit</p>
                      </div>
                    </div>
                  )}
                  {durationNote && (
                    <p className="text-xs text-[#395886]/60 leading-relaxed px-1">{durationNote}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => { setStarted(true); onStart?.(); }}
                className="inline-flex items-center gap-2 bg-[#628ECB] text-white px-10 py-4 rounded-2xl hover:bg-[#395886] transition-all shadow-lg shadow-[#628ECB]/20 font-bold text-base active:scale-95"
              >
                Mulai {title}
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ─── Tampilan Pertanyaan ───────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F0F3FA]">
      <header className="sticky top-0 z-50 w-full border-b border-[#D5DEEF] bg-white/90 shadow-sm backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[76px] items-center justify-between gap-6">
            <div className="flex min-w-0 items-center gap-4">
              <Link to={backPath} className="flex items-center gap-3">
                <div className="hidden sm:block min-w-0">
                  <Logo />
                </div>
                <div className="sm:hidden">
                  <Logo size="sm" />
                </div>
              </Link>
              <div className="h-8 w-px bg-[#D5DEEF] hidden sm:block" />
              <span className="hidden sm:block text-sm font-bold text-[#628ECB] uppercase tracking-widest">{title}</span>
            </div>
            <div className="flex items-center gap-3">
              {timeRemaining !== null && (
                <div
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold border ${
                    timeRemaining <= 60
                      ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                      : timeRemaining <= 180
                      ? 'bg-orange-50 text-orange-600 border-orange-200'
                      : 'bg-orange-50 text-orange-500 border-orange-200'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(timeRemaining)}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Nav Top Bar */}
      <div className="lg:hidden sticky top-[76px] z-40 bg-white border-b border-[#D5DEEF] overflow-x-auto scrollbar-hide py-3 px-4">
        <div className="flex items-center gap-2">
          {questions.map((_, idx) => {
            const isAnswered = answers[idx] !== null;
            const isCurrent = idx === currentQuestionIndex;
            return (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`h-8 w-8 shrink-0 rounded-lg text-[10px] font-black transition-all flex items-center justify-center border-2
                  ${isCurrent 
                    ? 'border-[#628ECB] bg-[#628ECB] text-white' 
                    : isAnswered 
                    ? 'border-[#10B981] bg-[#10B981]/5 text-[#10B981]' 
                    : 'border-[#D5DEEF] bg-white text-[#395886]/40'}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto lg:flex lg:items-start lg:gap-8 px-4 sm:px-6 lg:px-8 py-6">
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:sticky lg:top-[100px] gap-6">
          <QuestionNavPanel />
          {hasSidebar && (
            <LessonFlowSidebar
              lesson={sidebarLesson!}
              lessonId={lessonFlow!.lessonId!}
              progress={sidebarProgress!}
              currentStep={lessonFlow!.step as 1 | 2 | 3 | 4}
              fullyCompleted={sidebarFullyCompleted}
              isLocked={true}
            />
          )}
        </aside>

        <main className="flex-1 min-w-0">
          {/* Peringatan timer mendesak */}
          {timeRemaining !== null && timeRemaining <= 60 && timeRemaining > 0 && (
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 animate-pulse">
              <Clock className="h-5 w-5 text-red-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-700">Waktu Hampir Habis!</p>
                <p className="text-xs text-red-600">Segera selesaikan jawaban Anda.</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[2rem] shadow-md border border-[#D5DEEF] overflow-hidden">
            {/* Nomor soal */}
            <div className="px-7 pt-7 pb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#628ECB]/10 px-3 py-1 text-xs font-bold text-[#628ECB] border border-[#628ECB]/20">
                  Soal {currentQuestionIndex + 1}
                </span>
                <span className="text-[10px] font-bold text-[#395886]/40 uppercase tracking-widest">
                  {currentQuestionIndex + 1} dari {questions.length}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#395886] leading-snug">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Pilihan Jawaban */}
            <div className="px-7 pb-7 space-y-2.5">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectAnswer(index)}
                  className={`w-full flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-medium transition-all ${
                    selectedAnswer === index
                      ? 'border-[#628ECB] bg-[#628ECB]/8 text-[#395886]'
                      : 'border-[#D5DEEF] bg-white text-[#395886]/80 hover:border-[#628ECB]/40 hover:bg-[#F0F3FA]'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                      selectedAnswer === index
                        ? 'bg-[#628ECB] text-white'
                        : 'bg-[#F0F3FA] text-[#395886]/60'
                    }`}
                  >
                    {OPTION_LABELS[index]}
                  </span>
                  <span className="flex-1">{option}</span>
                  {selectedAnswer === index && (
                    <CheckCircle className="h-4 w-4 text-[#628ECB] shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Kaki */}
            <div className="border-t border-[#D5DEEF] px-7 py-5 flex items-center justify-between bg-[#F8FAFD]">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                  currentQuestionIndex > 0
                    ? 'text-[#395886] hover:bg-[#D5DEEF]/40 active:scale-95'
                    : 'text-[#395886]/20 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Sebelumnya
              </button>
              
              <button
                onClick={handleNext}
                className={`flex items-center gap-2 rounded-xl px-7 py-2.5 text-sm font-bold transition-all shadow-md active:scale-95 bg-[#628ECB] text-white hover:bg-[#395886]`}
              >
                {currentQuestionIndex < questions.length - 1 ? (
                  <>Lanjut <ChevronRight className="h-4 w-4" /></>
                ) : (
                  <>Kumpulkan <CheckCircle className="h-4 w-4" /></>
                )}
              </button>
            </div>
          </div>

          {/* Progress Indicator for Mobile (at bottom of card) */}
          <div className="lg:hidden mt-6 bg-white rounded-2xl border border-[#D5DEEF] p-4 flex items-center justify-between">
            <span className="text-xs font-bold text-[#395886]/60">Terjawab: {answeredCount}/{questions.length}</span>
            <button 
              onClick={() => setShowConfirmSubmit(true)}
              className="text-xs font-black text-[#628ECB] uppercase tracking-widest hover:underline"
            >
              Selesaikan Tes
            </button>
          </div>
        </main>
      </div>

      <AlertDialog open={showConfirmSubmit} onOpenChange={(open) => !open && handleCancelSubmit()}>
        <AlertDialogContent className="rounded-[2rem] border-[#D5DEEF] shadow-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#628ECB]/10 text-[#628ECB]">
                <AlertCircle className="h-5 w-5" />
              </div>
              <AlertDialogTitle className="text-[#395886] text-xl font-black">Konfirmasi Selesai</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-[#395886]/65 font-medium text-base leading-relaxed">
              Apakah Anda yakin sudah selesai mengerjakan? Jawaban tidak dapat diubah setelah dikumpulkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-2">
            <AlertDialogCancel onClick={handleCancelSubmit} className="border-[#D5DEEF] text-[#395886] hover:bg-[#F0F3FA] rounded-xl font-bold px-6">
              Tidak, Kembali
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit} className="bg-gradient-to-r from-[#395886] to-[#628ECB] text-white hover:from-[#2E4A75] hover:to-[#4A79BA] rounded-xl font-bold px-6 shadow-lg shadow-[#628ECB]/20">
              Ya, Kumpulkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
