import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  Eye,
  FileText,
  HelpCircle,
  Info,
  Lightbulb,
  MonitorPlay,
  Search,
  Trophy,
  Users,
  Video,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { ConstructivismStage } from '../components/stages/ConstructivismStage';
import { InquiryStage } from '../components/stages/InquiryStage';
import { QuestioningStage } from '../components/stages/QuestioningStage';
import { LearningCommunityStage } from '../components/stages/LearningCommunityStage';
import { ModelingStage } from '../components/stages/ModelingStage';
import { ReflectionStage } from '../components/stages/ReflectionStage';
import { AuthenticAssessmentStage } from '../components/stages/AuthenticAssessmentStage';
import { LessonFlowSidebar } from '../components/LessonFlowSidebar';
import { Logo } from '../components/layout/Logo';
import { getStageDisplayTitle, lessons, stageLearningObjectivesByLesson } from '../data/lessons';
import { getCurrentUser } from '../utils/auth';
import { getCachedProgress, getLessonProgress, saveStageProgress } from '../utils/progress';
import { getStudentGroup } from '../utils/groups';
import { StageAnswerDetail } from '../components/admin/StageDetail';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DragAutoScroll } from '../components/DragAutoScroll';
import { ActivityGuideBox, CountdownTimer, StageCompletedOverlay } from '../components/stages/StageKit';
import { getStageTimers, getTimerRemaining } from '../utils/stageTimer';

type StageType =
  | 'constructivism'
  | 'inquiry'
  | 'questioning'
  | 'learning-community'
  | 'modeling'
  | 'reflection'
  | 'authentic-assessment';

interface StageGuide {
  icon: React.ReactNode;
  label: string;
  accentColor: string;
  borderColor: string;
  bgColor: string;
  steps: string[];
}

const stageGuides: Record<StageType, StageGuide> = {
  constructivism: {
    icon: <Video className="w-6 h-6" />,
    label: 'Constructivism',
    accentColor: 'text-[#628ECB]',
    borderColor: 'border-[#628ECB]/30',
    bgColor: 'bg-[#628ECB]/5',
    steps: [
      'Bangun dulu pemahaman awal dari pengalaman sehari-hari.',
      'Susun atau kelompokkan informasi sampai urutannya terasa logis.',
      'Tarik kesimpulan awal sebelum masuk ke materi formal.',
    ],
  },
  inquiry: {
    icon: <Search className="w-6 h-6" />,
    label: 'Inquiry',
    accentColor: 'text-[#10B981]',
    borderColor: 'border-[#10B981]/30',
    bgColor: 'bg-[#10B981]/5',
    steps: [
      'Eksplorasi materi lebih dulu sebelum menjawab.',
      'Susun struktur atau label berdasarkan hasil pengamatanmu sendiri.',
      'Periksa kembali urutan dan fungsi sampai konsisten.',
    ],
  },
  questioning: {
    icon: <HelpCircle className="w-6 h-6" />,
    label: 'Questioning',
    accentColor: 'text-[#8B5CF6]',
    borderColor: 'border-[#8B5CF6]/30',
    bgColor: 'bg-[#8B5CF6]/5',
    steps: [
      'Amati masalah dan aktifkan rasa ingin tahumu.',
      'Pilih solusi teknis yang paling relevan.',
      'Jelaskan alasan logismu sebelum melanjutkan.',
    ],
  },
  'learning-community': {
    icon: <Users className="w-6 h-6" />,
    label: 'Learning Community',
    accentColor: 'text-[#F59E0B]',
    borderColor: 'border-[#F59E0B]/30',
    bgColor: 'bg-[#F59E0B]/5',
    steps: [
      'Bandingkan beberapa alternatif atau jawaban teman.',
      'Berikan komentar, penguatan, atau koreksi yang jelas.',
      'Validasi logika bersama untuk memperkuat pemahaman.',
    ],
  },
  modeling: {
    icon: <MonitorPlay className="w-6 h-6" />,
    label: 'Modeling',
    accentColor: 'text-[#EC4899]',
    borderColor: 'border-[#EC4899]/30',
    bgColor: 'bg-[#EC4899]/5',
    steps: [
      'Ikuti simulasi langkah demi langkah dengan runtut.',
      'Selesaikan setiap aksi praktik sebelum berpindah.',
      'Gunakan model ini sebagai contoh sistematis.',
    ],
  },
  reflection: {
    icon: <Lightbulb className="w-6 h-6" />,
    label: 'Reflection',
    accentColor: 'text-[#F59E0B]',
    borderColor: 'border-[#F59E0B]/30',
    bgColor: 'bg-[#F59E0B]/5',
    steps: [
      'Hubungkan konsep-konsep utama menjadi satu gambaran utuh.',
      'Tuliskan kembali pemahamanmu dengan kalimat sendiri.',
      'Nilai perkembanganmu secara jujur.',
    ],
  },
  'authentic-assessment': {
    icon: <FileText className="w-6 h-6" />,
    label: 'Authentic Assessment',
    accentColor: 'text-[#8B5CF6]',
    borderColor: 'border-[#8B5CF6]/30',
    bgColor: 'bg-[#8B5CF6]/5',
    steps: [
      'Gunakan bukti kasus untuk memilih langkah diagnosis.',
      'Ikuti cabang keputusan sambil menjelaskan alasanmu.',
      'Simpulkan prioritas solusi berdasarkan hasil analisis.',
    ],
  },
};

const stageCtlDescriptions: Record<StageType, string> = {
  constructivism: 'Membangun pemahaman sendiri dari pengalaman baru berdasarkan pengetahuan awal.',
  inquiry: 'Proses perpindahan dari pengamatan (eksplorasi materi) menjadi pemahaman melalui siklus observasi dan bertanya.',
  questioning: 'Guru mendorong rasa ingin tahu siswa melalui pertanyaan.',
  'learning-community': 'Belajar kelompok untuk berbagi ide dan pengalaman.',
  modeling: 'Guru atau siswa memberikan contoh konsep yang dipelajari.',
  reflection: 'Mengulas kembali apa yang telah dipelajari di akhir pertemuan.',
  'authentic-assessment': 'Menilai proses dan hasil belajar (pengetahuan, sikap, keterampilan) secara menyeluruh.',
};

const stageReflectionPrompts: Record<StageType, string> = {
  constructivism: '',
  inquiry: 'Berdasarkan eksplorasi dan penyusunan yang kamu lakukan, apa kesimpulan utama yang kamu temukan tentang konsep ini? Jelaskan dengan kata-katamu sendiri secara runtut.',
  questioning: 'Berdasarkan skenario yang baru saja kamu analisis, mengapa gangguan pada satu lapisan dapat memengaruhi seluruh proses komunikasi? Jelaskan alasanmu secara logis.',
  'learning-community': 'Berdasarkan diskusi dan perbandingan jawaban yang kamu lakukan, apa perbedaan perspektif paling penting yang kamu temukan, dan mengapa pemahaman bersama lebih kuat dari pemahaman individual?',
  modeling: 'Setelah mengikuti simulasi langkah demi langkah, jelaskan secara sistematis bagaimana proses tersebut bekerja dalam jaringan nyata. Apa bagian yang paling krusial dan mengapa?',
  reflection: 'Hubungkan seluruh konsep yang telah kamu pelajari dalam pertemuan ini. Apa hubungan mendasar antar konsep tersebut dan bagaimana kamu akan menjelaskannya kepada teman yang belum memahaminya?',
  'authentic-assessment': 'Berdasarkan studi kasus yang kamu selesaikan, jelaskan proses berpikirmu dalam mendiagnosis masalah dan menentukan solusi. Apa yang menjadi dasar setiap keputusanmu?',
};

const stageNeedsExternalReflection = (type: StageType, lid: string): boolean => {
  if (type === 'constructivism') return false;
  if (type === 'inquiry' && lid === '1') return false;
  if (type === 'questioning' && lid === '1') return false;
  return true;
};

function InlineReflectionEssay({ prompt, onDone }: { prompt: string; onDone: (essay: string) => void }) {
  const [essay, setEssay] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div ref={ref} className="mt-4 rounded-2xl border-2 border-[#628ECB]/20 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#628ECB]/8 to-transparent border-b border-[#628ECB]/10">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#628ECB]/10">
          <Eye className="w-4 h-4 text-[#628ECB]" />
        </div>
        <div className="flex-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#628ECB]">Refleksi Mandiri</p>
          <p className="text-xs font-bold text-[#395886]">Tulis pemahaman atau kesimpulanmu berdasarkan aktivitas ini</p>
        </div>
        {submitted && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" /> Tersimpan
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="mb-3 p-3 rounded-xl bg-[#F8FAFF] border border-[#D5DEEF]">
          <p className="text-xs font-bold text-[#395886] leading-relaxed">{prompt}</p>
        </div>
        <textarea
          value={essay}
          onChange={e => setEssay(e.target.value)}
          disabled={submitted}
          rows={4}
          className={`w-full p-3 rounded-xl border-2 text-sm leading-relaxed resize-none outline-none transition-all
            ${submitted
              ? 'border-[#10B981]/30 bg-[#ECFDF5] text-[#065F46]'
              : 'border-[#D5DEEF] bg-[#F8FAFF] focus:bg-white focus:border-[#628ECB]'}`}
          placeholder="Tuliskan refleksimu di sini... (minimal 30 karakter)"
        />
        <div className="flex items-center justify-between mt-2">
          <span className={`text-[10px] font-bold ${essay.length >= 30 ? 'text-[#10B981]' : 'text-[#395886]/40'}`}>
            {essay.length} karakter{essay.length > 0 && essay.length < 30 ? ` (${30 - essay.length} lagi)` : ''}{essay.length >= 30 ? ' (v)' : ''}
          </span>
          {!submitted ? (
            <button
              onClick={() => { setSubmitted(true); onDone(essay); }}
              disabled={essay.length < 30}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all
                ${essay.length >= 30
                  ? 'bg-[#628ECB] text-white hover:bg-[#395886] shadow-sm active:scale-95'
                  : 'bg-[#EEF2FF] text-[#395886]/30 cursor-not-allowed'}`}
            >
              <ArrowRight className="w-3.5 h-3.5" /> Kirim Refleksi
            </button>
          ) : (
            <span className="text-xs font-bold text-[#10B981]">Refleksi berhasil disimpan</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [user] = useState(() => getCurrentUser());
  const [groupName, setGroupName] = useState<string | undefined>(user?.groupName);
  const lesson = lessonId ? lessons[lessonId] : null;

  const initialProgress = getCachedProgress(user?.id ?? '', lessonId ?? '');

  const [progress, setProgress] = useState(
    initialProgress ?? {
      lessonId: lessonId ?? '',
      userId: user?.id ?? '',
      pretestCompleted: false,
      completedStages: [] as number[],
      posttestCompleted: false,
      answers: {} as Record<string, unknown>,
      stageAttempts: {} as Record<string, number>,
      stageSuccess: {} as Record<string, boolean>,
    },
  );
  const [progressLoaded, setProgressLoaded] = useState(!!initialProgress);
  const [currentStageIndex, setCurrentStageIndex] = useState<number | null>(() => {
    if (!initialProgress?.pretestCompleted || !lesson) return null;
    const firstIncomplete = lesson.stages.findIndex((_, index) => !initialProgress.completedStages.includes(index));
    return firstIncomplete !== -1 ? firstIncomplete : 0;
  });
  const [showStageSummary, setShowStageSummary] = useState(false);
  const [guideCollapsed, setGuideCollapsed] = useState(true);
  const [pendingReflection, setPendingReflection] = useState<{ stageAnswer: unknown } | null>(null);

  // ── Stage Timer ──
  const [stageTimers, setStageTimers] = useState<any[]>([]);
  const [timerRemaining, setTimerRemaining] = useState<number>(-1);
  const [timerExpired, setTimerExpired] = useState(false);

  useEffect(() => {
    if (lessonId && currentStageIndex !== null) {
      getStageTimers(lessonId).then(timers => {
        setStageTimers(timers);
        const timer = timers.find(t => t.stage_index === currentStageIndex);
        if (timer && timer.duration_minutes > 0) {
          setTimerRemaining(timer.duration_minutes * 60);
          setTimerExpired(false);
        } else {
          setTimerRemaining(-1);
          setTimerExpired(false);
        }
      });
    }
  }, [lessonId, currentStageIndex]);

  const handleTimerExpire = () => {
    setTimerExpired(true);
    setTimerRemaining(0);
  };

  useEffect(() => {
    if (user && lessonId) {
      getLessonProgress(user.id, lessonId).then((value) => {
        setProgress(value);
        setProgressLoaded(true);
      });
    }
  }, [lessonId, user]);

  useEffect(() => {
    if (user) {
      getStudentGroup(user.id).then((g) => {
        if (g) setGroupName(g);
      });
    }
  }, [user]);

  const fullyCompleted =
    progress?.pretestCompleted &&
    progress?.completedStages?.length === (lesson?.stages.length || 0) &&
    progress?.posttestCompleted;

  useEffect(() => {
    if (!progressLoaded) return;

    if (!lesson) {
      navigate('/dashboard');
      return;
    }

    if (!progress.pretestCompleted) {
      navigate(`/lesson-intro/${lessonId}`);
      return;
    }

    if (currentStageIndex === null) {
      const firstIncomplete = lesson.stages.findIndex(
        (_, index) => !progress.completedStages.includes(index),
      );
      setCurrentStageIndex(firstIncomplete !== -1 ? firstIncomplete : 0);
    }
  }, [currentStageIndex, lesson, lessonId, navigate, progress, progressLoaded]);

  useEffect(() => {
    setGuideCollapsed(true);
    setPendingReflection(null);
  }, [currentStageIndex]);

  if (!lesson || currentStageIndex === null) return null;

  const currentStage = lesson.stages[currentStageIndex];
  const currentStageAnswer = progress.answers[`stage_${currentStageIndex}`] ?? progress.answers[currentStageIndex];
  const isLastStage = currentStageIndex === lesson.stages.length - 1;
  const guide = stageGuides[currentStage.type as StageType];
  const displayTitle = getStageDisplayTitle(currentStage.type);
  const stageLearningObjectives =
    stageLearningObjectivesByLesson[lesson.id]?.[currentStage.type] ?? [];
  const stageGuideSteps =
    currentStage.activityGuide && currentStage.activityGuide.length > 0
      ? currentStage.activityGuide
      : guide.steps;
  const logicalThinkingIndicators = currentStage.logicalThinkingIndicators ?? [];
  const facilitatorNotes = currentStage.facilitatorNotes ?? [];
  const atpAbcd = currentStage.atpAbcd;

  const handleStageComplete = async (answer: unknown) => {
    await saveStageProgress(user!.id, lessonId!, currentStageIndex, answer);
    const updatedProgress = await getLessonProgress(user!.id, lessonId!);
    setProgress(updatedProgress);
    setPendingReflection(null);
    window.scrollTo(0, 0);
  };

  const handleStageClick = (index: number) => {
    const isCompleted = progress.completedStages.includes(index);
    const isNextToComplete = index === 0 || progress.completedStages.includes(index - 1);
    
    if (fullyCompleted || isCompleted || isNextToComplete) {
      setCurrentStageIndex(index);
      window.scrollTo(0, 0);
    }
  };

  const isStageCompleted = progress.completedStages.some(idx => Number(idx) === currentStageIndex);

  const handleStageActivityComplete = (answer: unknown) => {
    if (stageNeedsExternalReflection(currentStage.type as StageType, lessonId!)) {
      setPendingReflection({ stageAnswer: answer });
    } else {
      handleStageComplete(answer);
    }
  };

  const renderStage = () => {
    const commonProps = {
      onComplete: handleStageActivityComplete,
      lessonId: lessonId!,
      stageIndex: currentStageIndex,
      isCompleted: isStageCompleted || pendingReflection !== null,
    };

    switch (currentStage.type) {
      case 'constructivism':
        return (
          <ConstructivismStage
            {...commonProps}
            apersepsi={currentStage.apersepsi}
            question={currentStage.question ?? ''}
            options={currentStage.options ?? []}
            correctAnswer={currentStage.correctAnswer}
            feedback={currentStage.feedback}
            videoUrl={currentStage.videoUrl}
            storyScramble={currentStage.storyScramble}
            analogySortGroups={currentStage.analogySortGroups}
            analogySortItems={currentStage.analogySortItems}
            constructivismEssay1={currentStage.constructivismEssay1}
            constructivismEssay2={currentStage.constructivismEssay2}
          />
        );
      case 'inquiry':
        return (
          <InquiryStage
            {...commonProps}
            material={currentStage.material}
            explorationSections={currentStage.explorationSections}
            groups={currentStage.groups}
            groupItems={currentStage.groupItems}
            question={currentStage.question}
            flowItems={currentStage.flowItems}
            flowInstruction={currentStage.flowInstruction}
            labelingSlots={currentStage.labelingSlots}
            labelingLabels={currentStage.labelingLabels}
            matchingPairs={currentStage.matchingPairs}
            inquiryReflection1={currentStage.inquiryReflection1}
            inquiryReflection2={currentStage.inquiryReflection2}
          />
        );
      case 'questioning':
        return (
          <QuestioningStage
            {...commonProps}
            scenario={currentStage.scenario}
            whyQuestion={currentStage.whyQuestion}
            hint={currentStage.hint}
            reasonOptions={currentStage.reasonOptions}
            teacherQuestion={currentStage.teacherQuestion}
            questionBank={currentStage.questionBank}
            problemVisual={currentStage.problemVisual}
          />
        );
      case 'learning-community':
        return (
          <LearningCommunityStage
            {...commonProps}
            matchingPairs={currentStage.matchingPairs}
            caseScenario={currentStage.caseScenario}
            peerAnswers={currentStage.peerAnswers}
            peerVotingScenario={currentStage.peerVotingScenario}
            peerComments={currentStage.peerComments}
            caseComparisonData={currentStage.caseComparisonData}
            encapsulationCaseData={currentStage.encapsulationCaseData}
            encapsulationCase={currentStage.encapsulationCase}
            decapsulationCase={currentStage.decapsulationCase}
            layers5={currentStage.layers5}
            groupActivity={currentStage.groupActivity}
            moduleId={currentStage.moduleId || ''}
            groupName={groupName}
          />
        );
      case 'modeling': {
        const modelingStepsData =
          currentStage.modelingSteps ??
          currentStage.steps?.map((step) => ({
            id: step.id,
            type: 'example' as const,
            title: step.title,
            content: step.description,
          }));

        return (
          <ModelingStage 
            {...commonProps} 
            modelingSteps={modelingStepsData} 
            title={currentStage.title}
            description={currentStage.description}
            objectiveCode={currentStage.objectiveCode}
          />
        );
      }
      case 'reflection':
        return (
          <ReflectionStage
            {...commonProps}
            moduleId={currentStage.moduleId || ''}
            conceptMapNodes={currentStage.conceptMapNodes}
            conceptMapConnections={currentStage.conceptMapConnections}
            conceptMapTitle={`Hubungkan Antar Konsep ${lesson.topic}`}
          />
        );
      case 'authentic-assessment':
        return (
          <AuthenticAssessmentStage
            {...commonProps}
            branchingScenario={currentStage.branchingScenario}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F3FA]">
      <header className="sticky top-0 z-50 w-full border-b border-[#C8D8F0] bg-white/95 shadow-md backdrop-blur-md transition-all">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
              <div className="hidden h-8 w-px bg-[#D5DEEF] sm:block" />
              <span className="hidden items-center gap-1.5 rounded-lg border border-[#628ECB]/20 bg-[#628ECB]/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#628ECB] sm:inline-flex">
                {lesson.title}
              </span>
            </div>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-sm font-bold text-[#395886] transition-colors hover:text-[#628ECB]"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:flex lg:items-start lg:gap-6 lg:px-8">
        <aside className="hidden lg:sticky lg:top-[92px] lg:block lg:w-64 lg:shrink-0">
          <LessonFlowSidebar
            lesson={lesson}
            lessonId={lessonId!}
            progress={progress}
            currentStep={3}
            currentStageIndex={currentStageIndex}
            fullyCompleted={fullyCompleted}
            onStageClick={handleStageClick}
          />
        </aside>

        <main className="min-w-0 flex-1 flex flex-col gap-6">
          <div className="lg:hidden rounded-2xl border border-[#D5DEEF] bg-white px-4 py-3 shadow-sm">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]">
                  {lesson.title}
                </span>
                <p className="truncate text-xs font-bold text-[#395886]">{lesson.topic}</p>
              </div>
              <span className="shrink-0 whitespace-nowrap rounded-lg bg-[#628ECB]/10 px-2.5 py-1 text-[10px] font-bold text-[#628ECB]">
                Tahap {currentStageIndex + 1}/{lesson.stages.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              {lesson.stages.map((stage, index) => {
                const completed = progress.completedStages.includes(index);
                const isCurrent = index === currentStageIndex;
                return (
                  <button
                    key={index}
                    onClick={() => handleStageClick(index)}
                    disabled={!fullyCompleted}
                    title={getStageDisplayTitle(stage.type)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-bold transition-all ${
                      isCurrent
                        ? 'border-[#628ECB] bg-[#628ECB] text-white'
                        : completed
                          ? 'border-[#10B981]/20 bg-[#10B981]/10 text-[#10B981]'
                          : 'border-[#D5DEEF] bg-white text-[#395886]/35'
                    } ${!fullyCompleted ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        isCurrent ? 'bg-white' : completed ? 'bg-[#10B981]' : 'bg-[#D5DEEF]'
                      }`}
                    />
                    {getStageDisplayTitle(stage.type)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`relative overflow-hidden rounded-2xl border-2 shadow-sm transition-colors duration-500 ${guide.borderColor} ${guide.bgColor}`}>
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ${guide.accentColor}`}>
                  {guide.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`inline-block rounded-full bg-white px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest shadow-sm mb-1 ${guide.accentColor}`}>
                    Tahapan CTL
                  </span>
                  <h1 className="text-base sm:text-lg font-bold text-[#395886] mb-0.5 tracking-tight">{displayTitle}</h1>
                  <p className="text-[11px] leading-relaxed text-[#395886]/60">
                    {stageCtlDescriptions[currentStage.type as StageType]}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {stageLearningObjectives.length > 0 && (
                  <div className="rounded-xl border border-white/70 bg-white/50 overflow-hidden px-4 pt-3 pb-4">
                    <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${guide.accentColor}`}>
                      Tujuan Pembelajaran (ATP)
                    </p>
                    <div className="space-y-1.5">
                      {stageLearningObjectives.map((obj) => (
                        <p key={obj.code} className="text-[11px] leading-relaxed text-[#395886]/70">
                          <span className="font-bold text-[#395886]/90">{obj.code}:</span>{' '}
                          {obj.atpAbcd
                            ? `(A) ${obj.atpAbcd.audience} (B) ${obj.atpAbcd.behavior} (C) ${obj.atpAbcd.condition} (D) ${obj.atpAbcd.degree}`
                            : obj.description}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {user?.role === 'admin' && (atpAbcd || logicalThinkingIndicators.length > 0 || facilitatorNotes.length > 0) && (
                <div className="pt-3 border-t border-white/50">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-red-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-600">
                    Mode Admin / Guru
                  </div>
                  <div className="grid gap-3 xl:grid-cols-3">
                    {atpAbcd && (
                      <div className="rounded-xl border border-white/50 bg-white/40 p-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-3.5 w-3.5 text-[#628ECB]" />
                          <h2 className="text-xs font-black text-[#395886]">ATP (ABCD)</h2>
                        </div>
                        <div className="space-y-1.5 text-[11px] text-[#395886]/80">
                          <div className="rounded-lg bg-white/50 px-2.5 py-1.5"><span className="font-black text-[#395886]">A</span>: {atpAbcd.audience}</div>
                          <div className="rounded-lg bg-white/50 px-2.5 py-1.5"><span className="font-black text-[#395886]">B</span>: {atpAbcd.behavior}</div>
                          <div className="rounded-lg bg-white/50 px-2.5 py-1.5"><span className="font-black text-[#395886]">C</span>: {atpAbcd.condition}</div>
                          <div className="rounded-lg bg-white/50 px-2.5 py-1.5"><span className="font-black text-[#395886]">D</span>: {atpAbcd.degree}</div>
                        </div>
                      </div>
                    )}
                    {logicalThinkingIndicators.length > 0 && (
                      <div className="rounded-xl border border-white/50 bg-white/40 p-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-3.5 w-3.5 text-[#10B981]" />
                          <h2 className="text-xs font-black text-[#395886]">Logical Thinking</h2>
                        </div>
                        <div className="space-y-1.5">
                          {logicalThinkingIndicators.map((ind) => (
                            <div key={ind} className="rounded-lg bg-white/50 px-2.5 py-1.5 text-[11px] leading-relaxed text-[#395886]/80">{ind}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {facilitatorNotes.length > 0 && (
                      <div className="rounded-xl border border-white/50 bg-white/40 p-3 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="h-3.5 w-3.5 text-[#F59E0B]" />
                          <h2 className="text-xs font-black text-[#395886]">Peran Guru</h2>
                        </div>
                        <div className="space-y-1.5">
                          {facilitatorNotes.map((note) => (
                            <div key={note} className="rounded-lg bg-white/50 px-2.5 py-1.5 text-[11px] leading-relaxed text-[#395886]/80">{note}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {!isStageCompleted && stageGuideSteps.length > 0 && (
            <ActivityGuideBox
              steps={stageGuideSteps}
              collapsed={guideCollapsed}
              onToggle={() => setGuideCollapsed(!guideCollapsed)}
            />
          )}

          {isStageCompleted && pendingReflection === null ? (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border-2 border-[#10B981]/30 bg-gradient-to-r from-[#ECFDF5] to-white p-5 flex items-center gap-4 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#10B981] shadow-md">
                  <CheckCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#10B981]">Tahap Selesai</p>
                  <p className="text-base font-bold text-[#065F46]">{displayTitle} berhasil diselesaikan</p>
                  <p className="text-xs text-[#10B981]/70 mt-0.5">Seluruh aktivitas dan refleksi telah tersimpan. Kamu tidak dapat mengubah jawaban yang sudah disubmit.</p>
                </div>
              </div>

              {currentStageAnswer && (
                <div className="bg-white rounded-2xl border-2 border-[#D5DEEF] shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#628ECB]/8 to-transparent border-b border-[#628ECB]/10">
                    <Eye className="w-4 h-4 text-[#628ECB]" />
                    <p className="text-xs font-bold text-[#395886]">Ringkasan Jawaban Kamu</p>
                  </div>
                  <div className="p-5">
                    <StageAnswerDetail stage={currentStage} answer={currentStageAnswer} />
                  </div>
                </div>
              )}

              {((currentStageAnswer as any)?.reflection || (currentStageAnswer as any)?.essay1 || (currentStageAnswer as any)?.essay2 || (currentStageAnswer as any)?.justification || (currentStageAnswer as any)?.summary) && (
                <div className="bg-white rounded-2xl border-2 border-[#628ECB]/20 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-3 bg-[#628ECB]/5 border-b border-[#628ECB]/10">
                    <Eye className="w-4 h-4 text-[#628ECB]" />
                    <p className="text-xs font-bold text-[#395886]">Refleksi & Jawaban Esai Kamu</p>
                  </div>
                  <div className="p-5 space-y-3">
                    {(currentStageAnswer as any)?.reflection && (
                      <p className="text-sm text-[#395886] leading-relaxed italic bg-[#F8FAFF] p-3 rounded-xl border border-[#D5DEEF]">"{(currentStageAnswer as any).reflection}"</p>
                    )}
                    {(currentStageAnswer as any)?.essay1 && (
                      <div>
                        <p className="text-[10px] font-bold text-[#395886]/50 uppercase mb-1">Esai Aktivitas 1</p>
                        <p className="text-sm text-[#395886] leading-relaxed italic bg-[#F8FAFF] p-3 rounded-xl border border-[#D5DEEF]">"{(currentStageAnswer as any).essay1}"</p>
                      </div>
                    )}
                    {(currentStageAnswer as any)?.essay2 && (
                      <div>
                        <p className="text-[10px] font-bold text-[#395886]/50 uppercase mb-1">Esai Aktivitas 2</p>
                        <p className="text-sm text-[#395886] leading-relaxed italic bg-[#F8FAFF] p-3 rounded-xl border border-[#D5DEEF]">"{(currentStageAnswer as any).essay2}"</p>
                      </div>
                    )}
                    {(currentStageAnswer as any)?.justification && (
                      <div>
                        <p className="text-[10px] font-bold text-[#395886]/50 uppercase mb-1">Argumen & Justifikasi</p>
                        <p className="text-sm text-[#395886] leading-relaxed italic bg-[#F8FAFF] p-3 rounded-xl border border-[#D5DEEF]">"{(currentStageAnswer as any).justification}"</p>
                      </div>
                    )}
                    {(currentStageAnswer as any)?.summary && !(currentStageAnswer as any)?.reflection && !(currentStageAnswer as any)?.essay1 && !(currentStageAnswer as any)?.essay2 && !(currentStageAnswer as any)?.justification && (
                      <p className="text-sm text-[#395886] leading-relaxed italic bg-[#F8FAFF] p-3 rounded-xl border border-[#D5DEEF]">"{(currentStageAnswer as any).summary}"</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-t border-[#D5DEEF]">
                <div className="flex items-center gap-2 text-xs text-[#10B981] font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  Tahap selesai dikerjakan — jawabanmu telah tersimpan
                </div>
                <button
                  onClick={() => {
                    if (isLastStage) {
                      setShowStageSummary(true);
                    } else {
                      setCurrentStageIndex(currentStageIndex + 1);
                      window.scrollTo(0, 0);
                    }
                  }}
                  className="flex items-center gap-2 bg-[#628ECB] text-white px-6 py-2.5 rounded-xl hover:bg-[#395886] transition-all font-bold text-sm shadow-md active:scale-95 whitespace-nowrap"
                >
                  {isLastStage ? 'Lanjut ke Post-Test' : `Lanjut ke ${getStageDisplayTitle(lesson.stages[currentStageIndex + 1].type)}`}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full">
              {/* Countdown timer for current stage */}
              {timerRemaining > 0 && !isStageCompleted && !timerExpired && (
                <div className="mb-4">
                  <CountdownTimer
                    seconds={timerRemaining}
                    onExpire={handleTimerExpire}
                    label={`Waktu ${currentStage.type}`}
                  />
                </div>
              )}
              {timerExpired && !isStageCompleted && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border-2 border-red-200 text-center">
                  <p className="text-sm font-black text-red-600">Waktu Habis!</p>
                  <p className="text-xs text-red-500 mt-1">Aktivitas otomatis terkunci. Jawaban terakhir akan disimpan.</p>
                </div>
              )}
              {(!timerExpired || isStageCompleted) && (
                <DndProvider backend={HTML5Backend}>
                  <DragAutoScroll />
                  {renderStage()}
                </DndProvider>
              )}
              {pendingReflection !== null && (
                <InlineReflectionEssay
                  prompt={
                    (currentStage.type === 'reflection' && (currentStage as any).essayReflection?.materialSummaryPrompt)
                      ? (currentStage as any).essayReflection.materialSummaryPrompt
                      : stageReflectionPrompts[currentStage.type as StageType]
                  }
                  onDone={(essay) => handleStageComplete({ ...(pendingReflection.stageAnswer as object), reflection: essay })}
                />
              )}
            </div>
          )}
        </main>
      </div>

      <Dialog open={showStageSummary} onOpenChange={() => {}}>
        <DialogContent
          className="overflow-hidden rounded-3xl border-none p-0 shadow-2xl sm:max-w-[400px]"
          onInteractOutside={(event) => event.preventDefault()}
        >
          <div className="relative p-8 text-center bg-white">
            <div className="relative mb-6 inline-block">
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#395886] to-[#628ECB] shadow-lg">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-[#10B981] text-white shadow-md">
                <CheckCircle className="h-4 w-4" strokeWidth={3} />
              </div>
            </div>

            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl font-black leading-tight tracking-tight text-[#395886]">
                Luar biasa!
              </DialogTitle>
            </DialogHeader>

            <p className="mt-3 px-2 text-sm font-medium leading-relaxed text-[#395886]/70">
              Kamu telah menuntaskan seluruh tahapan CTL pada pertemuan ini. Lanjutkan ke post-test, tinjau kembali hasil belajarmu, atau unduh rekap PDF.
            </p>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => {
                  setShowStageSummary(false);
                  navigate(`/evaluation/${lessonId}`);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#395886] py-4 text-sm font-bold text-white shadow-lg shadow-[#395886]/20 transition-all hover:bg-[#628ECB] active:scale-95"
              >
                Lanjut ke Post-Test
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => {
                  setShowStageSummary(false);
                  navigate(`/review/${lessonId}`);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#628ECB]/30 bg-[#628ECB]/5 py-3 text-sm font-bold text-[#395886] transition-all hover:bg-[#628ECB]/10 active:scale-95"
              >
                <Eye className="h-4 w-4 text-[#628ECB]" />
                Review Tahapan Pembelajaran
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
