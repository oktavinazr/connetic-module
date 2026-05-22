import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Info,
  MessageSquare,
  RotateCcw,
  Trophy,
  User,
  XCircle,
} from 'lucide-react';
import { useActivityTracker } from '../../hooks/useActivityTracker';

interface FollowUpChoice {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

interface BranchChoice {
  id: string;
  text: string;
  isOptimal: boolean;
  consequence: string;
  followUpQuestion?: string;
  followUpChoices?: FollowUpChoice[];
}

interface LegacyBranchingScenario {
  mode?: 'legacy';
  context: string;
  initialQuestion: string;
  focusAreas?: string[];
  choices: BranchChoice[];
  finalEvaluation: string;
}

interface TcpStepOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
}

interface TcpBranchStep {
  id: string;
  prompt: string;
  options: TcpStepOption[];
}

interface TcpConclusionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
}

interface TcpBranchingScenario {
  mode: 'tcp-branching';
  caseTitle?: string;
  context: string;
  initialQuestion: string;
  focusAreas?: string[];
  choices: BranchChoice[];
  steps: TcpBranchStep[];
  argumentPrompt?: string;
  argumentAfterStepId?: string;
  conclusionQuestion?: string;
  conclusionOptions?: TcpConclusionOption[];
  finalEvaluation: string;
}

type BranchingScenario = LegacyBranchingScenario | TcpBranchingScenario;

interface AuthenticAssessmentStageProps {
  branchingScenario?: BranchingScenario;
  lessonId: string;
  stageIndex: number;
  onTrackerPhase?: (phase: 'consistency' | 'arguing' | 'conclusion') => void;
  onComplete: (answer: any) => void;
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function LegacyAuthenticAssessment({
  lessonId,
  stageIndex,
  scenario,
  onComplete,
}: {
  lessonId: string;
  stageIndex: number;
  scenario: LegacyBranchingScenario;
  onComplete: (answer: any) => void;
}) {
  const [initialChoice, setInitialChoice] = useState<string | null>(null);
  const [initialReason, setInitialReason] = useState('');
  const [initialSubmitted, setInitialSubmitted] = useState(false);
  const [followUpChoice, setFollowUpChoice] = useState<string | null>(null);
  const [followUpReason, setFollowUpReason] = useState('');
  const [followUpSubmitted, setFollowUpSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isDone, setIsDone] = useState(false);
  const tracker = useActivityTracker({ lessonId, stageIndex, stageType: 'authentic-assessment' });
  const selectedBranch = useMemo(() => scenario.choices.find((choice) => choice.id === initialChoice) ?? null, [initialChoice, scenario]);
  const selectedFollowUp = useMemo(() => selectedBranch?.followUpChoices?.find((choice) => choice.id === followUpChoice) ?? null, [followUpChoice, selectedBranch]);
  const showFinalSummary = initialSubmitted && (!selectedBranch?.followUpQuestion || followUpSubmitted);
  const MIN_WORDS = 20;

  useEffect(() => {
    void tracker.saveSnapshot(
      { initialChoice, initialReason, initialSubmitted, followUpChoice, followUpReason, followUpSubmitted, isDone },
      { progressPercent: showFinalSummary ? 85 : initialSubmitted ? 55 : initialChoice ? 25 : 5 },
    );
  }, [followUpChoice, followUpReason, followUpSubmitted, initialChoice, initialReason, initialSubmitted, isDone, showFinalSummary, tracker]);

  return (
    <div className="mx-auto w-full space-y-4">
      <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-[#F43F5E]/20 bg-white p-4 shadow-sm md:flex-row">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#F43F5E] text-white shadow-md">
          <User className="h-7 w-7" strokeWidth={2.5} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#F43F5E]">Analisis Kasus</p>
          <p className="text-xs font-bold italic leading-relaxed text-[#395886]">
            "Gunakan bukti kasus, jelaskan alasan diagnosismu, lalu simpulkan tindakan yang paling prioritas."
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border-2 border-[#D5DEEF] bg-white shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-[#D5DEEF] bg-gray-50 px-4 py-2.5">
              <AlertCircle className="h-4 w-4 text-[#F43F5E]" />
              <h3 className="text-xs font-bold text-[#395886]">Konteks Situasi</h3>
            </div>
            <div className="p-4">
              <p className="text-xs font-medium leading-relaxed text-[#395886]/80">{scenario.context}</p>
              {scenario.focusAreas && scenario.focusAreas.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#F43F5E]">Fokus Gangguan</p>
                  <div className="flex flex-wrap gap-1.5">
                    {scenario.focusAreas.map((area) => (
                      <span key={area} className="rounded-md border border-[#F43F5E]/20 bg-[#F43F5E]/5 px-2.5 py-1 text-[10px] font-bold text-[#F43F5E]">{area}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {initialSubmitted && selectedBranch && (
            <div className={`rounded-lg border-2 p-4 ${selectedBranch.isOptimal ? 'border-[#10B981]/20 bg-[#F0FDF4]' : 'border-[#F59E0B]/20 bg-[#FFFBEB]'}`}>
              <div className="mb-2 flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-white ${selectedBranch.isOptimal ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`}>
                  {selectedBranch.isOptimal ? <CheckCircle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                </div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${selectedBranch.isOptimal ? 'text-[#065F46]' : 'text-[#92400E]'}`}>Konsekuensi Keputusan</p>
              </div>
              <p className={`text-xs font-bold leading-relaxed ${selectedBranch.isOptimal ? 'text-[#065F46]' : 'text-[#92400E]'}`}>{selectedBranch.consequence}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border-2 border-[#D5DEEF] bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-bold text-[#395886]">{scenario.initialQuestion}</p>
            <div className="space-y-2">
              {scenario.choices.map((choice) => (
                <button
                  key={choice.id}
                  disabled={initialSubmitted}
                  onClick={() => setInitialChoice(choice.id)}
                  className={`w-full rounded-lg border-2 p-3 text-left text-[11px] font-bold transition-all ${
                    initialChoice === choice.id ? 'border-[#F43F5E] bg-[#F43F5E] text-white shadow-md' : 'border-[#D5DEEF] bg-white text-[#395886]/70 hover:border-[#F43F5E]/40'
                  } ${initialSubmitted && initialChoice !== choice.id ? 'opacity-40 grayscale' : ''}`}
                >
                  {choice.text}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-[11px] font-bold text-[#395886]">Jelaskan alasan diagnosis awalmu:</label>
              <textarea
                value={initialReason}
                onChange={(event) => setInitialReason(event.target.value)}
                disabled={initialSubmitted}
                rows={3}
                className="w-full resize-none rounded-lg border-2 border-[#D5DEEF] p-3 text-xs font-medium text-[#395886] outline-none transition-all focus:border-[#F43F5E] disabled:bg-[#F8FAFD]"
                placeholder={`Tuliskan bukti apa yang membuatmu memilih langkah ini... (minimal ${MIN_WORDS} kata)`}
              />
              <p className={`mt-1 text-[10px] ${countWords(initialReason) >= MIN_WORDS ? 'text-[#10B981]' : 'text-[#395886]/40'}`}>
                {countWords(initialReason)} / {MIN_WORDS} kata{countWords(initialReason) >= MIN_WORDS ? ' ✓' : ` — minimal ${MIN_WORDS} kata untuk melanjutkan`}
              </p>
            </div>

            {!initialSubmitted && (
              <button
                onClick={() => {
                  if (!initialChoice) {
                    setError('Pilih langkah diagnosis awal terlebih dahulu.');
                    return;
                  }
                  if (countWords(initialReason) < MIN_WORDS) {
                    setError(`Tuliskan alasan diagnosis awal minimal ${MIN_WORDS} kata.`);
                    return;
                  }
                  setError('');
                  setInitialSubmitted(true);
                }}
                disabled={!initialChoice || countWords(initialReason) < MIN_WORDS}
                className={`mt-4 w-full rounded-lg py-2.5 text-xs font-black transition-all ${
                  initialChoice && countWords(initialReason) >= MIN_WORDS ? 'bg-[#F43F5E] text-white shadow-lg' : 'cursor-not-allowed bg-[#D5DEEF] text-[#395886]/40'
                }`}
              >
                Ambil Keputusan Awal
              </button>
            )}

            {initialSubmitted && selectedBranch?.followUpQuestion && (
              <div className="mt-6 border-t border-[#D5DEEF] pt-5">
                <p className="mb-3 text-xs font-bold text-[#395886]">{selectedBranch.followUpQuestion}</p>
                <div className="space-y-2">
                  {selectedBranch.followUpChoices?.map((choice) => (
                    <button
                      key={choice.id}
                      disabled={followUpSubmitted}
                      onClick={() => setFollowUpChoice(choice.id)}
                      className={`w-full rounded-lg border-2 p-3 text-left text-[11px] font-bold transition-all ${
                        followUpChoice === choice.id ? 'border-[#395886] bg-[#395886] text-white shadow-md' : 'border-[#D5DEEF] bg-white text-[#395886]/70 hover:border-[#395886]/40'
                      } ${followUpSubmitted && followUpChoice !== choice.id ? 'opacity-40' : ''}`}
                    >
                      {choice.text}
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="mb-1.5 block text-[11px] font-bold text-[#395886]">Jelaskan alasan prioritas tindak lanjutmu:</label>
                  <textarea
                    value={followUpReason}
                    onChange={(event) => setFollowUpReason(event.target.value)}
                    disabled={followUpSubmitted}
                    rows={3}
                    className="w-full resize-none rounded-lg border-2 border-[#D5DEEF] p-3 text-xs font-medium text-[#395886] outline-none transition-all focus:border-[#395886] disabled:bg-[#F8FAFD]"
                    placeholder={`Jelaskan mengapa masalah ini perlu diprioritaskan... (minimal ${MIN_WORDS} kata)`}
                  />
                  <p className={`mt-1 text-[10px] ${countWords(followUpReason) >= MIN_WORDS ? 'text-[#10B981]' : 'text-[#395886]/40'}`}>
                    {countWords(followUpReason)} / {MIN_WORDS} kata{countWords(followUpReason) >= MIN_WORDS ? ' ✓' : ` — minimal ${MIN_WORDS} kata untuk melanjutkan`}
                  </p>
                </div>
                {!followUpSubmitted && (
                  <button
                    onClick={() => {
                      if (!followUpChoice) {
                        setError('Pilih prioritas tindak lanjut terlebih dahulu.');
                        return;
                      }
                      if (countWords(followUpReason) < MIN_WORDS) {
                        setError(`Tuliskan alasan prioritas minimal ${MIN_WORDS} kata.`);
                        return;
                      }
                      setError('');
                      setFollowUpSubmitted(true);
                    }}
                    disabled={!followUpChoice || countWords(followUpReason) < MIN_WORDS}
                    className={`mt-4 w-full rounded-lg py-2.5 text-xs font-black transition-all ${
                      followUpChoice && countWords(followUpReason) >= MIN_WORDS ? 'bg-[#395886] text-white shadow-lg' : 'cursor-not-allowed bg-[#D5DEEF] text-[#395886]/40'
                    }`}
                  >
                    Konfirmasi Prioritas
                  </button>
                )}
              </div>
            )}

            {error && <div className="mt-4 rounded-lg border-2 border-red-200 bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700">{error}</div>}
          </div>

          {followUpSubmitted && selectedFollowUp && (
            <div className={`rounded-lg border-2 p-4 ${selectedFollowUp.isCorrect ? 'border-[#10B981]/20 bg-[#F0FDF4]' : 'border-[#F59E0B]/20 bg-[#FFFBEB]'}`}>
              <div className="mb-2 flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-white ${selectedFollowUp.isCorrect ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`}>
                  {selectedFollowUp.isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                </div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${selectedFollowUp.isCorrect ? 'text-[#065F46]' : 'text-[#92400E]'}`}>Evaluasi Prioritas</p>
              </div>
              <p className={`text-xs font-bold leading-relaxed ${selectedFollowUp.isCorrect ? 'text-[#065F46]' : 'text-[#92400E]'}`}>{selectedFollowUp.explanation}</p>
            </div>
          )}
        </div>
      </div>

      {showFinalSummary && (
        <div className="rounded-lg border-2 border-dashed border-[#D5DEEF] bg-white p-5 text-center shadow-sm">
          <Trophy className="mx-auto mb-2 h-8 w-8 text-[#F59E0B]" />
          <h4 className="mb-2 text-xs font-black uppercase tracking-widest text-[#395886]">Analisis Selesai</h4>
          <p className="mx-auto mb-5 max-w-3xl text-xs font-medium leading-relaxed text-[#395886]/75">{scenario.finalEvaluation}</p>
          {!isDone ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => {
                  setInitialChoice(null);
                  setInitialReason('');
                  setInitialSubmitted(false);
                  setFollowUpChoice(null);
                  setFollowUpReason('');
                  setFollowUpSubmitted(false);
                  setError('');
                  setIsDone(false);
                }}
                className="flex-1 rounded-lg border-2 border-[#D5DEEF] py-2.5 text-[11px] font-bold text-[#395886] transition-all hover:bg-white"
              >
                <RotateCcw className="mx-auto mb-0.5 h-3.5 w-3.5" /> Coba Jalur Lain
              </button>
              <button
                onClick={() => {
                  const finalAnswer = {
                    initialChoice,
                    initialReason,
                    followUpChoice,
                    followUpReason,
                    isOptimal: selectedBranch?.isOptimal ?? false,
                    isFollowUpCorrect: selectedFollowUp?.isCorrect ?? false,
                  };
                  setIsDone(true);
                  void tracker.complete(finalAnswer, { initialChoice, initialSubmitted, followUpChoice, followUpSubmitted, finalAnswer });
                  onComplete(finalAnswer);
                }}
                className="flex flex-[2] items-center justify-center gap-2 rounded-lg bg-[#10B981] py-2.5 text-xs font-black text-white shadow-lg transition-all hover:bg-[#059669]"
              >
                Submit Aktivitas <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-[#10B981] py-2.5 text-xs font-black text-white">
              <CheckCircle className="h-4 w-4" /> Penilaian berhasil disimpan
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TcpBranchingAuthenticAssessment({
  lessonId,
  stageIndex,
  scenario,
  onTrackerPhase,
  onComplete,
}: {
  lessonId: string;
  stageIndex: number;
  scenario: TcpBranchingScenario;
  onTrackerPhase?: (phase: 'consistency' | 'arguing' | 'conclusion') => void;
  onComplete: (answer: any) => void;
}) {
  const tracker = useActivityTracker({ lessonId, stageIndex, stageType: 'authentic-assessment' });
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [stepStatus, setStepStatus] = useState<Record<string, 'pending' | 'correct'>>({});
  const [stepFeedback, setStepFeedback] = useState<{ stepId: string; text: string; isCorrect: boolean } | null>(null);
  const [argumentUnlocked, setArgumentUnlocked] = useState(false);
  const [argumentText, setArgumentText] = useState('');
  const [argumentSaved, setArgumentSaved] = useState(false);
  const [conclusionChoice, setConclusionChoice] = useState<string | null>(null);
  const [conclusionSubmitted, setConclusionSubmitted] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isRestored, setIsRestored] = useState(false);

  const MIN_WORDS = 20;
  const currentStep = scenario.steps[currentStepIndex];
  const argumentStepIndex = scenario.steps.findIndex((step) => step.id === scenario.argumentAfterStepId);
  const conclusionOptions = scenario.conclusionOptions || [];
  const selectedConclusion = conclusionOptions.find((option) => option.id === conclusionChoice) || null;

  useEffect(() => {
    if (!tracker.isLoading && tracker.session?.latestSnapshot && !isRestored) {
      const snapshot = tracker.session.latestSnapshot;
      if (snapshot.currentStepIndex !== undefined) setCurrentStepIndex(snapshot.currentStepIndex);
      if (snapshot.selectedOptions) setSelectedOptions(snapshot.selectedOptions);
      if (snapshot.stepStatus) setStepStatus(snapshot.stepStatus);
      if (snapshot.argumentUnlocked) setArgumentUnlocked(snapshot.argumentUnlocked);
      if (snapshot.argumentText) setArgumentText(snapshot.argumentText);
      if (snapshot.argumentSaved) setArgumentSaved(snapshot.argumentSaved);
      if (snapshot.conclusionChoice) setConclusionChoice(snapshot.conclusionChoice);
      if (snapshot.conclusionSubmitted) setConclusionSubmitted(snapshot.conclusionSubmitted);
      if (snapshot.isDone) setIsDone(snapshot.isDone);
      setIsRestored(true);
      return;
    }
    if (!tracker.isLoading) setIsRestored(true);
  }, [isRestored, tracker.isLoading, tracker.session]);

  const progressPercent = useMemo(() => {
    const consistencyWeight = 45;
    const arguingWeight = 25;
    const conclusionWeight = 30;
    const stepRatio = scenario.steps.length > 0 ? Object.keys(stepStatus).length / scenario.steps.length : 0;
    return Math.round(
      stepRatio * consistencyWeight +
      (argumentSaved ? arguingWeight : 0) +
      (conclusionSubmitted ? conclusionWeight : 0),
    );
  }, [argumentSaved, conclusionSubmitted, scenario.steps.length, stepStatus]);

  useEffect(() => {
    if (!isRestored) return;
    void tracker.saveSnapshot({
      currentStepIndex,
      selectedOptions,
      stepStatus,
      argumentUnlocked,
      argumentText,
      argumentSaved,
      conclusionChoice,
      conclusionSubmitted,
      isDone,
    }, {
      progressPercent,
    });
  }, [argumentSaved, argumentText, argumentUnlocked, conclusionChoice, conclusionSubmitted, currentStepIndex, isDone, isRestored, progressPercent, selectedOptions, stepStatus, tracker]);

  useEffect(() => {
    if (!onTrackerPhase) return;
    if (conclusionSubmitted) onTrackerPhase('conclusion');
    else if (argumentUnlocked || argumentSaved) onTrackerPhase(argumentSaved ? 'conclusion' : 'arguing');
    else onTrackerPhase('consistency');
  }, [argumentSaved, argumentUnlocked, conclusionSubmitted, onTrackerPhase]);

  const logicalIndicators = [
    {
      label: 'Keruntutan Berpikir',
      status: Object.keys(stepStatus).length === scenario.steps.length ? 'done' : !argumentUnlocked ? 'active' : 'done',
    },
    {
      label: 'Kemampuan Berargumen',
      status: argumentSaved ? 'done' : argumentUnlocked ? 'active' : 'pending',
    },
    {
      label: 'Penarikan Kesimpulan',
      status: conclusionSubmitted ? 'done' : argumentSaved ? 'active' : 'pending',
    },
  ] as const;

  const handleOptionCheck = () => {
    if (!currentStep) return;
    const selectedId = selectedOptions[currentStep.id];
    if (!selectedId) return;
    const option = currentStep.options.find((entry) => entry.id === selectedId);
    if (!option) return;

    setStepFeedback({ stepId: currentStep.id, text: option.feedback, isCorrect: option.isCorrect });

    if (!option.isCorrect) {
      void tracker.trackEvent('tcp_branch_wrong_choice', { stepId: currentStep.id, optionId: selectedId }, { isCorrect: false, errorCount: 1, attemptDelta: 1, progressPercent });
      return;
    }

    const nextStatus = { ...stepStatus, [currentStep.id]: 'correct' as const };
    setStepStatus(nextStatus);
    void tracker.trackEvent('tcp_branch_correct_choice', { stepId: currentStep.id, optionId: selectedId }, { isCorrect: true, attemptDelta: 1, progressPercent });

    if (currentStep.id === scenario.argumentAfterStepId) {
      setArgumentUnlocked(true);
      return;
    }

    if (currentStepIndex < scenario.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleArgumentSave = () => {
    if (countWords(argumentText) < MIN_WORDS) return;
    setArgumentSaved(true);
    void tracker.trackEvent('tcp_branch_argument_saved', { wordCount: countWords(argumentText) }, { isCorrect: true, progressPercent });
    const nextIndex = argumentStepIndex + 1;
    if (nextIndex < scenario.steps.length) {
      setCurrentStepIndex(nextIndex);
    }
  };

  const readyForConclusion = Object.keys(stepStatus).length === scenario.steps.length && argumentSaved;

  const handleConclusionSubmit = () => {
    if (!selectedConclusion) return;
    setConclusionSubmitted(true);
    const finalAnswer = {
      mode: 'tcp-branching',
      selectedOptions,
      stepStatus,
      argumentText: argumentText.trim(),
      conclusionChoice,
      conclusionCorrect: selectedConclusion.isCorrect,
      conclusionFeedback: selectedConclusion.feedback,
    };
    setIsDone(true);
    void tracker.complete(finalAnswer, {
      currentStepIndex,
      selectedOptions,
      stepStatus,
      argumentUnlocked,
      argumentText,
      argumentSaved,
      conclusionChoice,
      conclusionSubmitted: true,
      isDone: true,
      finalAnswer,
    });
    onComplete(finalAnswer);
  };

  return (
    <div className="mx-auto w-full space-y-5">
      <div className="rounded-2xl border-2 border-[#8B5CF6]/20 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[#8B5CF6]/10 bg-gradient-to-r from-[#8B5CF6]/8 to-transparent">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6]/10">
            <User className="h-5 w-5 text-[#8B5CF6]" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8B5CF6]">{scenario.caseTitle || 'Branching TCP Case Simulation'}</p>
            <p className="text-sm font-bold text-[#395886]">Analisis jalur komunikasi TCP langkah demi langkah</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-xl border border-[#D5DEEF] bg-[#FBFCFF] p-4">
            <p className="text-sm text-[#395886]/80 leading-relaxed">{scenario.context}</p>
            {scenario.focusAreas && scenario.focusAreas.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {scenario.focusAreas.map((area) => (
                  <span key={area} className="rounded-full border border-[#8B5CF6]/15 bg-[#F5F3FF] px-3 py-1 text-[10px] font-bold text-[#6D28D9]">
                    {area}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border-2 border-[#D5DEEF] bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/45 mb-3">Logical Thinking Tracker</p>
            <div className="grid gap-3 md:grid-cols-3">
              {logicalIndicators.map((indicator) => (
                <div
                  key={indicator.label}
                  className={`rounded-xl border p-3 ${
                    indicator.status === 'done'
                      ? 'border-[#10B981]/25 bg-[#ECFDF5] text-[#065F46]'
                      : indicator.status === 'active'
                        ? 'border-[#628ECB]/25 bg-[#EEF4FF] text-[#395886]'
                        : 'border-[#D5DEEF] bg-[#F8FAFF] text-[#395886]/45'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {indicator.status === 'done' ? (
                      <CheckCircle className="w-4 h-4 text-[#10B981]" />
                    ) : indicator.status === 'active' ? (
                      <AlertCircle className="w-4 h-4 text-[#628ECB]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-current opacity-40" />
                    )}
                    <p className="text-xs font-bold">{indicator.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {scenario.steps.map((step, index) => {
              const done = stepStatus[step.id] === 'correct';
              const active = currentStepIndex === index && !readyForConclusion;
              return (
                <div key={step.id} className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-widest ${
                  done ? 'border-[#10B981]/20 bg-[#ECFDF5] text-[#10B981]' : active ? 'border-[#628ECB]/20 bg-[#EEF4FF] text-[#628ECB]' : 'border-[#D5DEEF] bg-white text-[#395886]/35'
                }`}>
                  Langkah {index + 1}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {!readyForConclusion && currentStep && (
        <div className="rounded-2xl border-2 border-[#D5DEEF] bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#D5DEEF]/60 bg-[#F8FAFF]">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#628ECB]">Keruntutan Berpikir</p>
            <p className="text-sm font-bold text-[#395886]">{currentStep.prompt}</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-2">
              {currentStep.options.map((option) => (
                <button
                  key={option.id}
                  disabled={stepStatus[currentStep.id] === 'correct'}
                  onClick={() => setSelectedOptions((prev) => ({ ...prev, [currentStep.id]: option.id }))}
                  className={`w-full rounded-xl border-2 p-3 text-left text-sm font-bold transition-all ${
                    selectedOptions[currentStep.id] === option.id
                      ? 'border-[#628ECB] bg-[#628ECB] text-white shadow-md'
                      : 'border-[#D5DEEF] bg-white text-[#395886]/75 hover:border-[#628ECB]/30'
                  }`}
                >
                  {option.text}
                </button>
              ))}
            </div>

            {stepFeedback?.stepId === currentStep.id && (
              <div className={`rounded-xl border p-4 ${stepFeedback.isCorrect ? 'border-[#10B981]/20 bg-[#ECFDF5]' : 'border-red-200 bg-red-50'}`}>
                <p className={`text-sm font-bold ${stepFeedback.isCorrect ? 'text-[#065F46]' : 'text-red-700'}`}>
                  {stepFeedback.isCorrect ? 'Langkah tepat.' : 'Pilihan belum sesuai.'}
                </p>
                <p className={`text-xs leading-relaxed mt-1 ${stepFeedback.isCorrect ? 'text-[#10B981]/80' : 'text-red-600/90'}`}>{stepFeedback.text}</p>
              </div>
            )}

            {!argumentUnlocked || currentStep.id !== scenario.argumentAfterStepId ? (
              stepStatus[currentStep.id] !== 'correct' && (
                <button
                  onClick={handleOptionCheck}
                  disabled={!selectedOptions[currentStep.id]}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black transition-all ${
                    selectedOptions[currentStep.id] ? 'bg-[#628ECB] text-white hover:bg-[#395886] shadow-md' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'
                  }`}
                >
                  Periksa Langkah
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )
            ) : null}
          </div>
        </div>
      )}

      {argumentUnlocked && !argumentSaved && (
        <div className="rounded-2xl border-2 border-[#8B5CF6]/20 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#8B5CF6]/10 bg-gradient-to-r from-[#8B5CF6]/8 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#8B5CF6]/10">
                <MessageSquare className="w-4 h-4 text-[#8B5CF6]" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#8B5CF6]/70">Kemampuan Berargumen</p>
                <p className="text-xs font-bold text-[#395886]">{scenario.argumentPrompt}</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <textarea
              value={argumentText}
              onChange={(event) => setArgumentText(event.target.value)}
              rows={5}
              className="w-full resize-none rounded-xl border-2 border-[#D5DEEF] p-4 text-sm text-[#395886] outline-none transition-all focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5"
              placeholder="Tuliskan argumenmu di sini... (minimal 20 kata)"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className={`text-[10px] font-bold ${countWords(argumentText) >= 20 ? 'text-[#10B981]' : 'text-[#395886]/40'}`}>
                {countWords(argumentText)} / 20 kata{countWords(argumentText) >= 20 ? ' ✓' : ''}
              </span>
              <button
                onClick={handleArgumentSave}
                disabled={countWords(argumentText) < 20}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black transition-all ${
                  countWords(argumentText) >= 20 ? 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-md' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'
                }`}
              >
                Simpan Argumen
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {readyForConclusion && (
        <div className="rounded-2xl border-2 border-[#10B981]/20 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#10B981]/10 bg-gradient-to-r from-[#10B981]/8 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#10B981]/10">
                <Trophy className="w-4 h-4 text-[#10B981]" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#10B981]/70">Penarikan Kesimpulan</p>
                <p className="text-xs font-bold text-[#395886]">{scenario.conclusionQuestion}</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-2">
              {conclusionOptions.map((option) => (
                <button
                  key={option.id}
                  disabled={conclusionSubmitted}
                  onClick={() => setConclusionChoice(option.id)}
                  className={`w-full rounded-xl border-2 p-3 text-left text-sm font-bold transition-all ${
                    conclusionChoice === option.id
                      ? 'border-[#10B981] bg-[#10B981] text-white shadow-md'
                      : 'border-[#D5DEEF] bg-white text-[#395886]/75 hover:border-[#10B981]/30'
                  }`}
                >
                  {option.text}
                </button>
              ))}
            </div>

            {selectedConclusion && (
              <div className={`rounded-xl border p-4 ${selectedConclusion.isCorrect ? 'border-[#10B981]/20 bg-[#ECFDF5]' : 'border-red-200 bg-red-50'}`}>
                <p className={`text-sm font-bold ${selectedConclusion.isCorrect ? 'text-[#065F46]' : 'text-red-700'}`}>
                  {selectedConclusion.isCorrect ? 'Kesimpulan tepat.' : 'Kesimpulan belum tepat.'}
                </p>
                <p className={`text-xs mt-1 leading-relaxed ${selectedConclusion.isCorrect ? 'text-[#10B981]/80' : 'text-red-600/90'}`}>{selectedConclusion.feedback}</p>
              </div>
            )}

            {!conclusionSubmitted ? (
              <button
                onClick={handleConclusionSubmit}
                disabled={!conclusionChoice}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black transition-all ${
                  conclusionChoice ? 'bg-[#10B981] text-white hover:bg-[#059669] shadow-md' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'
                }`}
              >
                Submit Aktivitas
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="rounded-xl border border-[#10B981]/20 bg-[#ECFDF5] p-4 text-center">
                <p className="text-sm font-bold text-[#065F46]">{scenario.finalEvaluation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!isDone && (
        <div className="flex justify-start">
          <button
            onClick={() => {
              setCurrentStepIndex(0);
              setSelectedOptions({});
              setStepStatus({});
              setStepFeedback(null);
              setArgumentUnlocked(false);
              setArgumentText('');
              setArgumentSaved(false);
              setConclusionChoice(null);
              setConclusionSubmitted(false);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-[#D5DEEF] bg-white px-4 py-2.5 text-xs font-bold text-[#395886]/70 hover:bg-[#F8FAFF]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Ulangi Simulasi
          </button>
        </div>
      )}
    </div>
  );
}

export function AuthenticAssessmentStage({
  lessonId,
  stageIndex,
  branchingScenario,
  onTrackerPhase,
  onComplete,
}: AuthenticAssessmentStageProps) {
  if (!branchingScenario) return null;

  if (branchingScenario.mode === 'tcp-branching' && branchingScenario.steps) {
    return (
      <TcpBranchingAuthenticAssessment
        lessonId={lessonId}
        stageIndex={stageIndex}
        scenario={branchingScenario}
        onTrackerPhase={onTrackerPhase}
        onComplete={onComplete}
      />
    );
  }

  return (
    <LegacyAuthenticAssessment
      lessonId={lessonId}
      stageIndex={stageIndex}
      scenario={branchingScenario}
      onComplete={onComplete}
    />
  );
}
