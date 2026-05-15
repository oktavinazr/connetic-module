import { useMemo, useState, useEffect } from 'react';
import {
  AlertCircle, ArrowRight, CheckCircle, Info, RotateCcw, Trophy, User, XCircle,
} from 'lucide-react';
import { useActivityTracker } from '../../hooks/useActivityTracker';

interface FollowUpChoice {
  id: string; text: string; isCorrect: boolean; explanation: string;
}
interface BranchChoice {
  id: string; text: string; isOptimal: boolean; consequence: string;
  followUpQuestion?: string; followUpChoices?: FollowUpChoice[];
}
interface BranchingScenario {
  context: string; initialQuestion: string; focusAreas?: string[];
  choices: BranchChoice[]; finalEvaluation: string;
}

interface AuthenticAssessmentStageProps {
  branchingScenario?: BranchingScenario;
  lessonId: string; stageIndex: number;
  onComplete: (answer: {
    initialChoice: string | null; initialReason: string;
    followUpChoice: string | null; followUpReason: string;
    isOptimal: boolean; isFollowUpCorrect: boolean;
  }) => void;
}

export function AuthenticAssessmentStage({
  lessonId, stageIndex, branchingScenario, onComplete,
}: AuthenticAssessmentStageProps) {
  const [initialChoice, setInitialChoice] = useState<string | null>(null);
  const [initialReason, setInitialReason] = useState('');
  const [initialSubmitted, setInitialSubmitted] = useState(false);
  const [followUpChoice, setFollowUpChoice] = useState<string | null>(null);
  const [followUpReason, setFollowUpReason] = useState('');
  const [followUpSubmitted, setFollowUpSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isDone, setIsDone] = useState(false);
  const tracker = useActivityTracker({ lessonId, stageIndex, stageType: 'authentic-assessment' });

  const scenario = branchingScenario;
  const selectedBranch = useMemo(() => scenario?.choices.find(c => c.id === initialChoice) ?? null, [initialChoice, scenario]);
  const selectedFollowUp = useMemo(() => selectedBranch?.followUpChoices?.find(c => c.id === followUpChoice) ?? null, [followUpChoice, selectedBranch]);
  const showFinalSummary = initialSubmitted && (!selectedBranch?.followUpQuestion || followUpSubmitted);

  if (!scenario) return null;

  useEffect(() => {
    void tracker.saveSnapshot(
      { initialChoice, initialReason, initialSubmitted, followUpChoice, followUpReason, followUpSubmitted, isDone },
      { progressPercent: showFinalSummary ? 85 : initialSubmitted ? 55 : initialChoice ? 25 : 5 },
    );
  }, [followUpChoice, followUpReason, followUpSubmitted, initialChoice, initialReason, initialSubmitted, isDone, showFinalSummary]);

  const countWords = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
  const MIN_WORDS = 20;

  const handleInitialSubmit = () => {
    if (!initialChoice) { setError('Pilih langkah diagnosis awal terlebih dahulu.'); return; }
    if (countWords(initialReason) < MIN_WORDS) { setError(`Tuliskan alasan diagnosis awal minimal ${MIN_WORDS} kata.`); return; }
    setError(''); setInitialSubmitted(true);
    void tracker.trackEvent('initial_decision_submitted', { initialChoice, wordCount: countWords(initialReason) }, { progressPercent: 55 });
  };

  const handleFollowUpSubmit = () => {
    if (!followUpChoice) { setError('Pilih prioritas tindak lanjut terlebih dahulu.'); return; }
    if (countWords(followUpReason) < MIN_WORDS) { setError(`Tuliskan alasan prioritas minimal ${MIN_WORDS} kata.`); return; }
    setError(''); setFollowUpSubmitted(true);
    void tracker.trackEvent('follow_up_submitted', { followUpChoice, wordCount: countWords(followUpReason) }, { progressPercent: 85 });
  };

  const handleReset = () => {
    setInitialChoice(null); setInitialReason(''); setInitialSubmitted(false);
    setFollowUpChoice(null); setFollowUpReason(''); setFollowUpSubmitted(false);
    setError(''); setIsDone(false);
  };

  const handleComplete = () => {
    const finalAnswer = { initialChoice, initialReason, followUpChoice, followUpReason, isOptimal: selectedBranch?.isOptimal ?? false, isFollowUpCorrect: selectedFollowUp?.isCorrect ?? false };
    setIsDone(true);
    void tracker.complete(finalAnswer, { initialChoice, initialSubmitted, followUpChoice, followUpSubmitted, finalAnswer });
    onComplete(finalAnswer);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      {/* Header */}
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
        {/* Left Column — Context + Consequence */}
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
                    {scenario.focusAreas.map(area => (
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

        {/* Right Column — Choices */}
        <div className="space-y-4">
          <div className="rounded-lg border-2 border-[#D5DEEF] bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-bold text-[#395886]">{scenario.initialQuestion}</p>
            <div className="space-y-2">
              {scenario.choices.map(choice => (
                <button key={choice.id} disabled={initialSubmitted} onClick={() => setInitialChoice(choice.id)}
                  className={`w-full rounded-lg border-2 p-3 text-left text-[11px] font-bold transition-all ${
                    initialChoice === choice.id ? 'border-[#F43F5E] bg-[#F43F5E] text-white shadow-md' : 'border-[#D5DEEF] bg-white text-[#395886]/70 hover:border-[#F43F5E]/40'
                  } ${initialSubmitted && initialChoice !== choice.id ? 'opacity-40 grayscale' : ''}`}
                >{choice.text}</button>
              ))}
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-[11px] font-bold text-[#395886]">Jelaskan alasan diagnosis awalmu:</label>
              <textarea value={initialReason} onChange={e => setInitialReason(e.target.value)} disabled={initialSubmitted} rows={3}
                className="w-full resize-none rounded-lg border-2 border-[#D5DEEF] p-3 text-xs font-medium text-[#395886] outline-none transition-all focus:border-[#F43F5E] disabled:bg-[#F8FAFD]"
                placeholder={`Tuliskan bukti apa yang membuatmu memilih langkah ini... (minimal ${MIN_WORDS} kata)`} />
              <p className={`mt-1 text-[10px] ${countWords(initialReason) >= MIN_WORDS ? 'text-[#10B981]' : 'text-[#395886]/40'}`}>
                {countWords(initialReason)} / {MIN_WORDS} kata{countWords(initialReason) >= MIN_WORDS ? ' ✓' : ` — minimal ${MIN_WORDS} kata untuk melanjutkan`}
              </p>
            </div>

            {!initialSubmitted && (
              <button onClick={handleInitialSubmit} disabled={!initialChoice || countWords(initialReason) < MIN_WORDS}
                className={`mt-4 w-full rounded-lg py-2.5 text-xs font-black transition-all ${
                  initialChoice && countWords(initialReason) >= MIN_WORDS ? 'bg-[#F43F5E] text-white shadow-lg' : 'cursor-not-allowed bg-[#D5DEEF] text-[#395886]/40'
                }`}>Ambil Keputusan Awal</button>
            )}

            {initialSubmitted && selectedBranch?.followUpQuestion && (
              <div className="mt-6 border-t border-[#D5DEEF] pt-5">
                <p className="mb-3 text-xs font-bold text-[#395886]">{selectedBranch.followUpQuestion}</p>
                <div className="space-y-2">
                  {selectedBranch.followUpChoices?.map(choice => (
                    <button key={choice.id} disabled={followUpSubmitted} onClick={() => setFollowUpChoice(choice.id)}
                      className={`w-full rounded-lg border-2 p-3 text-left text-[11px] font-bold transition-all ${
                        followUpChoice === choice.id ? 'border-[#395886] bg-[#395886] text-white shadow-md' : 'border-[#D5DEEF] bg-white text-[#395886]/70 hover:border-[#395886]/40'
                      } ${followUpSubmitted && followUpChoice !== choice.id ? 'opacity-40' : ''}`}
                    >{choice.text}</button>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="mb-1.5 block text-[11px] font-bold text-[#395886]">Jelaskan alasan prioritas tindak lanjutmu:</label>
                  <textarea value={followUpReason} onChange={e => setFollowUpReason(e.target.value)} disabled={followUpSubmitted} rows={3}
                    className="w-full resize-none rounded-lg border-2 border-[#D5DEEF] p-3 text-xs font-medium text-[#395886] outline-none transition-all focus:border-[#395886] disabled:bg-[#F8FAFD]"
                    placeholder={`Jelaskan mengapa masalah ini perlu diprioritaskan... (minimal ${MIN_WORDS} kata)`} />
                  <p className={`mt-1 text-[10px] ${countWords(followUpReason) >= MIN_WORDS ? 'text-[#10B981]' : 'text-[#395886]/40'}`}>
                    {countWords(followUpReason)} / {MIN_WORDS} kata{countWords(followUpReason) >= MIN_WORDS ? ' ✓' : ` — minimal ${MIN_WORDS} kata untuk melanjutkan`}
                  </p>
                </div>
                {!followUpSubmitted && (
                  <button onClick={handleFollowUpSubmit} disabled={!followUpChoice || countWords(followUpReason) < MIN_WORDS}
                    className={`mt-4 w-full rounded-lg py-2.5 text-xs font-black transition-all ${
                      followUpChoice && countWords(followUpReason) >= MIN_WORDS ? 'bg-[#395886] text-white shadow-lg' : 'cursor-not-allowed bg-[#D5DEEF] text-[#395886]/40'
                    }`}>Konfirmasi Prioritas</button>
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

      {/* Summary */}
      {showFinalSummary && (
        <div className="rounded-lg border-2 border-dashed border-[#D5DEEF] bg-white p-5 text-center shadow-sm">
          <Trophy className="mx-auto mb-2 h-8 w-8 text-[#F59E0B]" />
          <h4 className="mb-2 text-xs font-black uppercase tracking-widest text-[#395886]">Analisis Selesai</h4>
          <p className="mx-auto mb-5 max-w-3xl text-xs font-medium leading-relaxed text-[#395886]/75">{scenario.finalEvaluation}</p>
          <div className="mb-5 grid gap-2 md:grid-cols-3">
            {[
              { title: 'Keruntutan Berpikir', color: 'text-[#628ECB]', desc: 'Apakah langkah diagnosis diambil secara sistematis dari bukti yang ada?' },
              { title: 'Kemampuan Berargumen', color: 'text-[#F43F5E]', desc: 'Apakah alasan teknis untuk setiap pilihan sudah jelas dan relevan?' },
              { title: 'Penarikan Kesimpulan', color: 'text-[#10B981]', desc: 'Apakah prioritas solusi ditetapkan berdasarkan dampak terbesar pada layanan?' },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-[#D5DEEF] bg-[#F8FAFF] p-3 text-left">
                <p className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.title}</p>
                <p className="mt-1 text-[10px] font-medium leading-relaxed text-[#395886]/80">{item.desc}</p>
              </div>
            ))}
          </div>
          {!isDone ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <button onClick={handleReset} className="flex-1 rounded-lg border-2 border-[#D5DEEF] py-2.5 text-[11px] font-bold text-[#395886] transition-all hover:bg-white">
                <RotateCcw className="mx-auto mb-0.5 h-3.5 w-3.5" /> Coba Jalur Lain
              </button>
              <button onClick={handleComplete} className="flex flex-[2] items-center justify-center gap-2 rounded-lg bg-[#10B981] py-2.5 text-xs font-black text-white shadow-lg transition-all hover:bg-[#059669]">
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
