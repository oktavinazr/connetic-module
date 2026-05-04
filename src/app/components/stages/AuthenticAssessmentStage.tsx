import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Info,
  RotateCcw,
  Trophy,
  User,
  XCircle,
} from 'lucide-react';
import { useEffect } from 'react';
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

interface BranchingScenario {
  context: string;
  initialQuestion: string;
  focusAreas?: string[];
  choices: BranchChoice[];
  finalEvaluation: string;
}

interface AuthenticAssessmentStageProps {
  branchingScenario?: BranchingScenario;
  lessonId: string;
  stageIndex: number;
  onComplete: (answer: {
    initialChoice: string | null;
    initialReason: string;
    followUpChoice: string | null;
    followUpReason: string;
    isOptimal: boolean;
    isFollowUpCorrect: boolean;
  }) => void;
}

export function AuthenticAssessmentStage({
  lessonId,
  stageIndex,
  branchingScenario,
  onComplete,
}: AuthenticAssessmentStageProps) {
  const [initialChoice, setInitialChoice] = useState<string | null>(null);
  const [initialReason, setInitialReason] = useState('');
  const [initialSubmitted, setInitialSubmitted] = useState(false);
  const [followUpChoice, setFollowUpChoice] = useState<string | null>(null);
  const [followUpReason, setFollowUpReason] = useState('');
  const [followUpSubmitted, setFollowUpSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isDone, setIsDone] = useState(false);
  const tracker = useActivityTracker({
    lessonId,
    stageIndex,
    stageType: 'authentic-assessment',
  });

  const scenario = branchingScenario;
  const selectedBranch = useMemo(
    () => scenario?.choices.find((choice) => choice.id === initialChoice) ?? null,
    [initialChoice, scenario],
  );
  const selectedFollowUp = useMemo(
    () => selectedBranch?.followUpChoices?.find((choice) => choice.id === followUpChoice) ?? null,
    [followUpChoice, selectedBranch],
  );

  const showFinalSummary =
    initialSubmitted && (!selectedBranch?.followUpQuestion || followUpSubmitted);

  if (!scenario) return null;

  useEffect(() => {
    void tracker.saveSnapshot(
      {
        initialChoice,
        initialReason,
        initialSubmitted,
        followUpChoice,
        followUpReason,
        followUpSubmitted,
        isDone,
      },
      {
        progressPercent: showFinalSummary ? 85 : initialSubmitted ? 55 : initialChoice ? 25 : 5,
      },
    );
  }, [
    followUpChoice,
    followUpReason,
    followUpSubmitted,
    initialChoice,
    initialReason,
    initialSubmitted,
    isDone,
    showFinalSummary,
  ]);

  const handleInitialSubmit = () => {
    if (!initialChoice) {
      setError('Pilih langkah diagnosis awal terlebih dahulu.');
      return;
    }

    if (initialReason.trim().length < 25) {
      setError('Tuliskan alasan diagnosis awal minimal 25 karakter.');
      return;
    }

    setError('');
    setInitialSubmitted(true);
    void tracker.trackEvent('initial_decision_submitted', {
      initialChoice,
      reasonLength: initialReason.trim().length,
    }, { progressPercent: 55 });
  };

  const handleFollowUpSubmit = () => {
    if (!followUpChoice) {
      setError('Pilih prioritas tindak lanjut terlebih dahulu.');
      return;
    }

    if (followUpReason.trim().length < 25) {
      setError('Tuliskan alasan prioritas minimal 25 karakter.');
      return;
    }

    setError('');
    setFollowUpSubmitted(true);
    void tracker.trackEvent('follow_up_submitted', {
      followUpChoice,
      reasonLength: followUpReason.trim().length,
    }, { progressPercent: 85 });
  };

  const handleReset = () => {
    setInitialChoice(null);
    setInitialReason('');
    setInitialSubmitted(false);
    setFollowUpChoice(null);
    setFollowUpReason('');
    setFollowUpSubmitted(false);
    setError('');
    setIsDone(false);
  };

  const handleComplete = () => {
    const finalAnswer = {
      initialChoice,
      initialReason,
      followUpChoice,
      followUpReason,
      isOptimal: selectedBranch?.isOptimal ?? false,
      isFollowUpCorrect: selectedFollowUp?.isCorrect ?? false,
    };
    setIsDone(true);
    void tracker.complete(finalAnswer, {
      initialChoice,
      initialSubmitted,
      followUpChoice,
      followUpSubmitted,
      finalAnswer,
    });
    onComplete(finalAnswer);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col items-center gap-6 rounded-2xl border-2 border-[#8B5CF6]/20 bg-white p-6 shadow-sm md:flex-row">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#8B5CF6] text-white shadow-md">
          <User className="h-10 w-10" strokeWidth={2.5} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#8B5CF6]">
            Analisis Kasus
          </p>
          <p className="text-sm font-bold italic leading-relaxed text-[#395886]">
            "Gunakan bukti kasus, jelaskan alasan diagnosismu, lalu simpulkan tindakan yang paling prioritas."
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border-2 border-[#D5DEEF] bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-[#D5DEEF] bg-gray-50 px-6 py-4">
              <AlertCircle className="h-5 w-5 text-[#8B5CF6]" />
              <h3 className="text-sm font-bold text-[#395886]">Konteks Situasi</h3>
            </div>
            <div className="p-6">
              <p className="text-sm font-medium leading-relaxed text-[#395886]/80">
                {scenario.context}
              </p>

              {scenario.focusAreas && scenario.focusAreas.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#8B5CF6]">
                    Fokus Gangguan
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {scenario.focusAreas.map((area) => (
                      <span
                        key={area}
                        className="rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/5 px-3 py-1 text-[11px] font-bold text-[#8B5CF6]"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {initialSubmitted && selectedBranch && (
            <div
              className={`rounded-2xl border-2 p-6 ${
                selectedBranch.isOptimal
                  ? 'border-[#10B981]/20 bg-[#F0FDF4]'
                  : 'border-[#F59E0B]/20 bg-[#FFFBEB]'
              }`}
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${
                    selectedBranch.isOptimal ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
                  }`}
                >
                  {selectedBranch.isOptimal ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Info className="h-5 w-5" />
                  )}
                </div>
                <p
                  className={`text-xs font-black uppercase tracking-widest ${
                    selectedBranch.isOptimal ? 'text-[#065F46]' : 'text-[#92400E]'
                  }`}
                >
                  Konsekuensi Keputusan Awal
                </p>
              </div>
              <p
                className={`text-sm font-bold leading-relaxed ${
                  selectedBranch.isOptimal ? 'text-[#065F46]' : 'text-[#92400E]'
                }`}
              >
                {selectedBranch.consequence}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-[#D5DEEF] bg-white p-6 shadow-sm">
            <p className="mb-4 text-sm font-bold text-[#395886]">{scenario.initialQuestion}</p>

            <div className="space-y-3">
              {scenario.choices.map((choice) => (
                <button
                  key={choice.id}
                  disabled={initialSubmitted}
                  onClick={() => setInitialChoice(choice.id)}
                  className={`w-full rounded-2xl border-2 p-4 text-left text-xs font-bold transition-all ${
                    initialChoice === choice.id
                      ? 'border-[#8B5CF6] bg-[#8B5CF6] text-white shadow-md'
                      : 'border-[#D5DEEF] bg-white text-[#395886]/70 hover:border-[#8B5CF6]/40'
                  } ${initialSubmitted && initialChoice !== choice.id ? 'opacity-40 grayscale' : ''}`}
                >
                  {choice.text}
                </button>
              ))}
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-xs font-bold text-[#395886]">
                Jelaskan alasan diagnosis awalmu:
              </label>
              <textarea
                value={initialReason}
                onChange={(event) => setInitialReason(event.target.value)}
                disabled={initialSubmitted}
                rows={4}
                className="w-full resize-none rounded-2xl border-2 border-[#D5DEEF] p-4 text-sm font-medium text-[#395886] outline-none transition-all focus:border-[#8B5CF6] disabled:bg-[#F0F3FA]"
                placeholder="Tuliskan bukti apa yang membuatmu memilih langkah ini lebih dulu."
              />
              <p className={`mt-1 text-[11px] ${initialReason.trim().length >= 25 ? 'text-[#10B981]' : 'text-[#395886]/40'}`}>
                {initialReason.trim().length} karakter (minimal 25)
              </p>
            </div>

            {!initialSubmitted && (
              <button
                onClick={handleInitialSubmit}
                disabled={!initialChoice || initialReason.trim().length < 25}
                className={`mt-5 w-full rounded-xl py-3 text-sm font-black transition-all ${
                  initialChoice && initialReason.trim().length >= 25
                    ? 'bg-[#8B5CF6] text-white shadow-lg'
                    : 'cursor-not-allowed bg-[#D5DEEF] text-[#395886]/40'
                }`}
              >
                Ambil Keputusan Awal
              </button>
            )}

            {initialSubmitted && selectedBranch?.followUpQuestion && (
              <div className="mt-8 border-t border-[#D5DEEF] pt-8">
                <p className="mb-4 text-sm font-bold text-[#395886]">{selectedBranch.followUpQuestion}</p>

                <div className="space-y-3">
                  {selectedBranch.followUpChoices?.map((choice) => (
                    <button
                      key={choice.id}
                      disabled={followUpSubmitted}
                      onClick={() => setFollowUpChoice(choice.id)}
                      className={`w-full rounded-2xl border-2 p-4 text-left text-xs font-bold transition-all ${
                        followUpChoice === choice.id
                          ? 'border-[#628ECB] bg-[#628ECB] text-white shadow-md'
                          : 'border-[#D5DEEF] bg-white text-[#395886]/70 hover:border-[#628ECB]/40'
                      } ${followUpSubmitted && followUpChoice !== choice.id ? 'opacity-40' : ''}`}
                    >
                      {choice.text}
                    </button>
                  ))}
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-xs font-bold text-[#395886]">
                    Jelaskan alasan prioritas tindak lanjutmu:
                  </label>
                  <textarea
                    value={followUpReason}
                    onChange={(event) => setFollowUpReason(event.target.value)}
                    disabled={followUpSubmitted}
                    rows={4}
                    className="w-full resize-none rounded-2xl border-2 border-[#D5DEEF] p-4 text-sm font-medium text-[#395886] outline-none transition-all focus:border-[#628ECB] disabled:bg-[#F0F3FA]"
                    placeholder="Jelaskan mengapa masalah ini perlu diprioritaskan lebih dulu."
                  />
                  <p className={`mt-1 text-[11px] ${followUpReason.trim().length >= 25 ? 'text-[#10B981]' : 'text-[#395886]/40'}`}>
                    {followUpReason.trim().length} karakter (minimal 25)
                  </p>
                </div>

                {!followUpSubmitted && (
                  <button
                    onClick={handleFollowUpSubmit}
                    disabled={!followUpChoice || followUpReason.trim().length < 25}
                    className={`mt-5 w-full rounded-xl py-3 text-sm font-black transition-all ${
                      followUpChoice && followUpReason.trim().length >= 25
                        ? 'bg-[#628ECB] text-white shadow-lg'
                        : 'cursor-not-allowed bg-[#D5DEEF] text-[#395886]/40'
                    }`}
                  >
                    Konfirmasi Prioritas
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
                {error}
              </div>
            )}
          </div>

          {followUpSubmitted && selectedFollowUp && (
            <div
              className={`rounded-2xl border-2 p-6 ${
                selectedFollowUp.isCorrect
                  ? 'border-[#10B981]/20 bg-[#F0FDF4]'
                  : 'border-[#F59E0B]/20 bg-[#FFFBEB]'
              }`}
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${
                    selectedFollowUp.isCorrect ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
                  }`}
                >
                  {selectedFollowUp.isCorrect ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                </div>
                <p
                  className={`text-xs font-black uppercase tracking-widest ${
                    selectedFollowUp.isCorrect ? 'text-[#065F46]' : 'text-[#92400E]'
                  }`}
                >
                  Evaluasi Prioritas
                </p>
              </div>
              <p
                className={`text-sm font-bold leading-relaxed ${
                  selectedFollowUp.isCorrect ? 'text-[#065F46]' : 'text-[#92400E]'
                }`}
              >
                {selectedFollowUp.explanation}
              </p>
            </div>
          )}
        </div>
      </div>

      {showFinalSummary && (
        <div className="rounded-2xl border-2 border-dashed border-[#D5DEEF] bg-white p-6 text-center shadow-sm">
          <Trophy className="mx-auto mb-3 h-10 w-10 text-[#F59E0B]" />
          <h4 className="mb-2 text-sm font-black uppercase tracking-widest text-[#395886]">
            Analisis Selesai
          </h4>
          <p className="mx-auto mb-6 max-w-3xl text-sm font-medium leading-relaxed text-[#395886]/75">
            {scenario.finalEvaluation}
          </p>

          <div className="mb-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-[#D5DEEF] bg-[#F8FAFF] p-4 text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]">
                Keruntutan Berpikir
              </p>
              <p className="mt-2 text-xs font-medium leading-relaxed text-[#395886]/80">
                Apakah langkah diagnosis diambil secara sistematis dari bukti yang ada?
              </p>
            </div>
            <div className="rounded-2xl border border-[#D5DEEF] bg-[#F8FAFF] p-4 text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#8B5CF6]">
                Kemampuan Berargumen
              </p>
              <p className="mt-2 text-xs font-medium leading-relaxed text-[#395886]/80">
                Apakah alasan teknis untuk setiap pilihan sudah jelas dan relevan?
              </p>
            </div>
            <div className="rounded-2xl border border-[#D5DEEF] bg-[#F8FAFF] p-4 text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#10B981]">
                Penarikan Kesimpulan
              </p>
              <p className="mt-2 text-xs font-medium leading-relaxed text-[#395886]/80">
                Apakah prioritas solusi ditetapkan berdasarkan dampak terbesar pada layanan?
              </p>
            </div>
          </div>

          {!isDone ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleReset}
                className="flex-1 rounded-xl border-2 border-[#D5DEEF] py-3 text-xs font-bold text-[#395886] transition-all hover:bg-white"
              >
                <RotateCcw className="mx-auto mb-1 h-4 w-4" />
                Coba Jalur Lain
              </button>
              <button
                onClick={handleComplete}
                className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-[#10B981] py-3 text-sm font-black text-white shadow-lg transition-all hover:bg-[#059669]"
              >
                Selesaikan Penilaian
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-[#10B981] py-3 text-sm font-black text-white">
              <CheckCircle className="h-5 w-5" />
              Penilaian berhasil disimpan
            </div>
          )}
        </div>
      )}
    </div>
  );
}