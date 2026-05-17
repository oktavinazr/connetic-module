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
  Clock,
  Pause as PauseIcon,
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
import { ActivityGuideBox, EssayBox, StageCompletedOverlay, ATPConclusionBox, LogicalThinkingTracker } from '../components/stages/StageKit';
import { useGlobalStageSync } from '../hooks/useGlobalStageSync';

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
  if (type === 'questioning' && lid === '1') return false;
  if (type === 'inquiry' && lid === '1') return false;
  if (type === 'constructivism' && lid === '1') return false;
  return true;
};

function InlineReflectionEssay({ prompt, onDone }: { prompt: string; onDone: (essay: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div ref={ref} className="mt-4">
      <EssayBox
        prompt={prompt}
        objectiveLabel="Refleksi"
        submitLabel="Submit Jawaban"
        minWords={20}
        onSubmit={onDone}
      />
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
    return 0; // Mulai dari awal, sync admin akan menyesuaikan
  });
  const [stageInitDone, setStageInitDone] = useState(false);
  const [trackerPhase, setTrackerPhase] = useState<'consistency' | 'arguing' | 'conclusion'>('consistency');
  const [showStageSummary, setShowStageSummary] = useState(false);
  // Activity guide is always open
  const [pendingReflection, setPendingReflection] = useState<{ stageAnswer: unknown } | null>(null);

  // ── Global Stage Sync (timer + force-advance + waiting) ──
  const isStageCompleted = progress.completedStages.some(idx => Number(idx) === currentStageIndex);
  const globalSync = useGlobalStageSync(
    lessonId ?? '',
    currentStageIndex ?? 0,
    isStageCompleted || pendingReflection !== null,
  );

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

    if (!stageInitDone && globalSync.loaded && progressLoaded) {
      if (!globalSync.isIdle && globalSync.sync?.current_stage_index !== undefined) {
        // Sesi aktif → ikuti tahap admin
        setCurrentStageIndex(globalSync.sync.current_stage_index);
      } else {
        // Sesi idle → cari tahap pertama yang belum selesai
        const firstIncomplete = lesson.stages.findIndex(
          (_, index) => !progress.completedStages.includes(index),
        );
        setCurrentStageIndex(firstIncomplete !== -1 ? firstIncomplete : lesson.stages.length - 1);
      }
      setStageInitDone(true);
    }
  }, [stageInitDone, lesson, lessonId, navigate, progress, progressLoaded, globalSync.loaded, globalSync.isIdle, globalSync.sync?.current_stage_index]);

  useEffect(() => {
    setPendingReflection(null);
    setTrackerPhase('consistency');
  }, [currentStageIndex]);

  // Sync to admin stage when session is active
  useEffect(() => {
    if (!globalSync.loaded || globalSync.isIdle || currentStageIndex === null) return;
    const syncStage = globalSync.sync?.current_stage_index;
    if (syncStage !== undefined && syncStage !== currentStageIndex) {
      // Admin advanced → follow
      if (syncStage > currentStageIndex) {
        if (syncStage >= (lesson?.stages.length ?? 0) || globalSync.sync?.status === 'completed') {
          navigate(`/evaluation/${lessonId}`);
        } else {
          setCurrentStageIndex(syncStage);
          window.scrollTo(0, 0);
        }
      }
      // Student got ahead (e.g. refresh) → pull back to admin stage
      else if (syncStage < currentStageIndex) {
        setCurrentStageIndex(syncStage);
        window.scrollTo(0, 0);
      }
    }
  }, [globalSync.sync?.current_stage_index, globalSync.sync?.status, globalSync.loaded, globalSync.isIdle, currentStageIndex]);

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
    // Block if session is idle
    if (globalSync.isIdle) return;

    const isCompleted = progress.completedStages.includes(index);
    const syncStage = globalSync.sync?.current_stage_index ?? 0;
    const isCurrentSyncStage = index === syncStage;
    
    // Allow clicking ONLY the current admin-synced stage
    // Completed stages from PREVIOUS sessions are NOT accessible until admin advances
    if (!isCurrentSyncStage) return;
    
    setCurrentStageIndex(index);
    window.scrollTo(0, 0);
  };

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
            onTrackerPhase={setTrackerPhase}
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
            conclusionPrompt={currentStage.conclusionPrompt}
            atpBehavior={currentStage.atpAbcd?.behavior}
            objectiveCode={currentStage.objectiveCode}
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
            conclusionPrompt={currentStage.conclusionPrompt}
            onTrackerPhase={(phase) => setTrackerPhase(phase as 'consistency' | 'arguing' | 'conclusion')}
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
            syncStageIndex={globalSync.sync?.current_stage_index ?? 0}
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
                const syncStage = globalSync.sync?.current_stage_index ?? 0;
                const isAllowed = index === syncStage;
                return (
                  <button
                    key={index}
                    onClick={() => handleStageClick(index)}
                    disabled={!isAllowed}
                    title={getStageDisplayTitle(stage.type)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-bold transition-all ${
                      isCurrent
                        ? 'border-[#628ECB] bg-[#628ECB] text-white'
                        : completed
                          ? 'border-[#10B981]/20 bg-[#10B981]/10 text-[#10B981]'
                          : 'border-[#D5DEEF] bg-white text-[#395886]/35'
                    } ${!isAllowed ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
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
            <div className="p-6 sm:p-8 space-y-5">
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

          {/* ── Session state screens ── */}
          {globalSync.isIdle ? (
            <div className="w-full">
              <div className="rounded-2xl border-2 border-[#628ECB]/20 bg-gradient-to-br from-[#F0F3FA] to-white p-10 text-center shadow-sm">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#628ECB]/10">
                  <Clock className="h-10 w-10 text-[#628ECB] animate-pulse" />
                </div>
                <h3 className="text-xl font-black text-[#395886]">Menunggu guru memulai sesi pembelajaran...</h3>
                <p className="mt-2 text-sm text-[#395886]/60 max-w-md mx-auto">
                  Guru akan memulai sesi kelas sebentar lagi. Tahapan CTL akan terbuka secara otomatis setelah sesi dimulai.
                </p>
                <div className="mt-6 flex justify-center">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="h-2 w-2 rounded-full bg-[#628ECB]/40 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-4xl mx-auto space-y-5">
            <>
              {/* Pause — full overlay to block interaction, ALWAYS visible */}
              {globalSync.isPaused && (
                <div className="w-full mb-4 sticky top-[76px] z-50">
                  <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-8 text-center shadow-lg">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 border-4 border-amber-200">
                      <PauseIcon className="h-10 w-10 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-black text-amber-700">⏸ Sesi Sedang Dijeda oleh Guru</h3>
                    <p className="mt-2 text-sm text-amber-600 max-w-md mx-auto">
                      Guru sedang menjeda sesi pembelajaran. Seluruh aktivitas dihentikan sementara.
                      Tunggu hingga guru menekan tombol "Lanjutkan".
                    </p>
                    <div className="mt-5 flex justify-center gap-2">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="h-3 w-3 rounded-full bg-amber-400 animate-bounce"
                          style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Logical Thinking Tracker — tepat di atas aktivitas */}
              {!globalSync.isPaused && (
                <div className="flex justify-center pt-2 pb-1">
                  <LogicalThinkingTracker
                    activePhase={
                      isStageCompleted || pendingReflection !== null ? 'conclusion' : trackerPhase
                    }
                    isStageCompleted={isStageCompleted || pendingReflection !== null}
                  />
                </div>
              )}

              {/* Activity guide — hide during pause */}
              {!globalSync.isPaused && !isStageCompleted && stageGuideSteps.length > 0 && (
                <div className="pt-2">
                  <ActivityGuideBox steps={stageGuideSteps} />
                </div>
              )}

              {/* Stage content — only show when not paused */}
              {!globalSync.isPaused && <>
              {isStageCompleted && pendingReflection === null ? (
            <div className="flex flex-col gap-4">
              {/* Green success banner */}
              <div className="rounded-2xl border-2 border-[#10B981]/30 bg-gradient-to-r from-[#ECFDF5] to-white p-5 flex items-center gap-4 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#10B981] shadow-md">
                  <CheckCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#10B981]">Tahap Selesai</p>
                  <p className="text-base font-bold text-[#065F46]">{displayTitle} berhasil diselesaikan</p>
                  <p className="text-xs text-[#10B981]/70 mt-0.5">Jawaban telah tersimpan dan tidak dapat diubah.</p>
                </div>
              </div>

              {/* Ringkasan Jawaban — always visible after completion */}
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

              {/* Waiting indicator OR advance button */}
              <div className="rounded-2xl border-2 border-[#F59E0B]/20 bg-gradient-to-br from-amber-50 to-white p-5 text-center shadow-sm">
                {(globalSync.forceAdvanced || globalSync.sync?.status === 'advanced') ? (
                  /* Admin has advanced — show go button */
                  <>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4 text-[#10B981]" />
                      <p className="text-sm font-bold text-[#10B981]">Guru telah melanjutkan ke tahap berikutnya!</p>
                    </div>
                    <button
                      onClick={() => {
                        globalSync.acknowledgeAdvance();
                        if (isLastStage) {
                          setShowStageSummary(true);
                        } else {
                          setCurrentStageIndex(currentStageIndex + 1);
                          window.scrollTo(0, 0);
                        }
                      }}
                      className="inline-flex items-center gap-2 bg-[#628ECB] text-white px-6 py-2.5 rounded-xl hover:bg-[#395886] transition-all font-bold text-sm shadow-md active:scale-95"
                    >
                      {isLastStage ? 'Lanjut ke Post-Test' : `Lanjut ke ${getStageDisplayTitle(lesson.stages[currentStageIndex + 1].type)}`}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  /* Still waiting for teacher */
                  <>
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                      <Clock className="h-6 w-6 text-amber-500" />
                    </div>
                    <p className="text-sm font-bold text-[#395886]">Menunggu guru melanjutkan tahap...</p>
                    <p className="mt-1 text-xs text-[#395886]/50">
                      Kamu sudah selesai lebih cepat. Guru akan melanjutkan ke tahap berikutnya setelah seluruh kelas siap.
                    </p>
                    <div className="mt-3 flex justify-center gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (globalSync.timerExpired && !globalSync.forceAdvanced) ? (
            /* ── Timer Expired — non-completed students wait ── */
            <div className="w-full">
              <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                  <Clock className="h-10 w-10 text-red-500" />
                </div>
                <h3 className="text-xl font-black text-[#395886]">⏰ Waktu Habis</h3>
                <p className="mt-2 text-sm text-[#395886]/60 max-w-md mx-auto">
                  Waktu pengerjaan telah habis. Tunggu guru melanjutkan ke tahap berikutnya.
                </p>
                <div className="mt-6 flex justify-center">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="h-2 w-2 rounded-full bg-red-300 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <DndProvider backend={HTML5Backend}>
                <DragAutoScroll />
                {renderStage()}
              </DndProvider>
              {(pendingReflection !== null) && currentStage.conclusionPrompt && currentStage.atpAbcd?.behavior && (
                <div className="mt-6">
                  <ATPConclusionBox
                    atpBehavior={currentStage.atpAbcd.behavior}
                    objectiveCode={currentStage.objectiveCode || ''}
                    stageType={currentStage.type}
                    onSubmit={(text) => {
                      handleStageComplete({ ...(pendingReflection.stageAnswer as object || {}), conclusion: text });
                    }}
                    disabled={!!(currentStageAnswer?.conclusion)}
                    defaultValue={(pendingReflection.stageAnswer as any)?.conclusion || currentStageAnswer?.conclusion || ''}
                  />
                </div>
              )}
              {pendingReflection !== null && !currentStage.conclusionPrompt && (
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
              </>}
            </>
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
