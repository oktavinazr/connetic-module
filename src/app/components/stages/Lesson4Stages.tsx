import React, { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import {
  AlertCircle, CheckCircle, ChevronDown, ChevronRight, GripVertical,
  Lightbulb, MessageSquare,
} from 'lucide-react';
import {
  ATPConclusionBox, ContinueActivityButton, EssayBox,
  FeedbackBanner, StepTracker,
} from './StageKit';

const DND_L4 = 'L4_SORTABLE';
const MAX_TRIES = 3;

interface Lesson4StageProps {
  stage: any;
  lessonId: string;
  stageIndex: number;
  onComplete: (answer: any) => void | Promise<void>;
  isCompleted?: boolean;
  onTrackerPhase?: (phase: 'consistency' | 'arguing' | 'conclusion') => void;
}

// --- Shared helper: attempt badge for card headers ---
function AttemptBadge({ attempts, color = '#628ECB' }: { attempts: number; color?: string }) {
  if (attempts === 0) return null;
  const exhausted = attempts >= MAX_TRIES;
  return (
    <div
      className={
        'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold shrink-0 transition-colors ' +
        (exhausted ? 'border-red-200 bg-red-50 text-red-500' : 'bg-white')
      }
      style={exhausted ? {} : { borderColor: color + '33', color }}
    >
      <AlertCircle className="w-3 h-3" />
      {exhausted ? 'Habis' : `${MAX_TRIES - attempts}x lagi`}
    </div>
  );
}

// --- Shared helper: answer key reveal box ---
function AnswerKeyCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-[#10B981]/25 bg-[#ECFDF5] p-4 animate-in fade-in duration-300">
      <p className="mb-2 text-xs font-black uppercase tracking-widest text-[#10B981]">{title}</p>
      <div className="space-y-1.5 text-sm text-[#065F46]">{children}</div>
    </div>
  );
}

// --- Shared drag-and-drop sortable item ---
function SortableItem({
  index, text, onMove, locked,
}: {
  index: number; text: string;
  onMove: (from: number, to: number) => void;
  locked?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: DND_L4,
    item: { index },
    collect: (m) => ({ isDragging: m.isDragging() }),
    canDrag: !locked,
  });
  const [, drop] = useDrop({
    accept: DND_L4,
    hover(item: { index: number }) {
      if (!ref.current || item.index === index) return;
      onMove(item.index, index);
      item.index = index;
    },
  });
  drag(drop(ref));
  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.3 : 1 }}
      className={
        'flex items-start gap-3 p-4 rounded-xl border-2 transition-all select-none ' +
        (locked
          ? 'border-[#10B981]/30 bg-[#ECFDF5] cursor-default'
          : 'border-[#D5DEEF] bg-white shadow-sm hover:border-[#628ECB]/40 hover:shadow-md cursor-grab active:cursor-grabbing')
      }
    >
      <GripVertical
        className={'w-4 h-4 shrink-0 mt-0.5 ' + (locked ? 'text-[#10B981]/40' : 'text-[#628ECB]/40')}
      />
      <span
        className={'text-sm leading-relaxed font-medium flex-1 ' + (locked ? 'text-[#065F46]' : 'text-[#395886]')}
      >
        {text}
      </span>
    </div>
  );
}

// ===========================================================================
// STAGE 1: CONSTRUCTIVISM
// ===========================================================================
function Lesson4ConstructivismStage({ stage, onComplete, onTrackerPhase }: Lesson4StageProps) {
  type Phase = 'scramble' | 'essay1' | 'sort' | 'essay2' | 'conclusion';
  const [phase, setPhase] = useState<Phase>('scramble');
  const [items, setItems] = useState<any[]>(() =>
    [...(stage.storyScramble?.fragments ?? [])].sort(() => Math.random() - 0.5),
  );
  const [checked, setChecked] = useState(false);
  const [ok, setOk] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sortRevealed, setSortRevealed] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<any>({});
  const sortItems: any[] = stage.analogySortItems ?? [];

  const goPhase = (p: Phase) => {
    setPhase(p);
    if (p === 'essay1') onTrackerPhase?.('arguing');
    if (p === 'conclusion') onTrackerPhase?.('conclusion');
  };

  const checkOrder = () => {
    const correct = items.every((item, idx) => item.order === idx + 1);
    const next = attempts + 1;
    setAttempts(next);
    setChecked(true);
    if (correct) setOk(true);
    else if (next >= MAX_TRIES) setShowAnswer(true);
  };

  const moveItem = (from: number, to: number) => {
    setItems((prev) => {
      const arr = [...prev];
      const [m] = arr.splice(from, 1);
      arr.splice(to, 0, m);
      return arr;
    });
    setChecked(false);
  };

  const sortedFragments = [...(stage.storyScramble?.fragments ?? [])].sort(
    (a: any, b: any) => a.order - b.order,
  );

  return (
    <div className="space-y-5">
      <StepTracker
        steps={['Kronologi', 'Argumen NAT', 'Perbandingan', 'Refleksi', 'Kesimpulan']}
        current={['scramble', 'essay1', 'sort', 'essay2', 'conclusion'].indexOf(phase)}
      />

      {/* Phase 1: Story Scramble */}
      {phase === 'scramble' && (
        <div className="space-y-4 animate-in fade-in duration-400">
          <div className="rounded-xl border-2 border-[#628ECB]/20 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-[#628ECB]/8 border-b border-[#628ECB]/10">
              <p className="text-xs font-black uppercase tracking-widest text-[#628ECB]">
                Aktivitas 1 - Keruntutan Berpikir
              </p>
              <div className="flex items-center justify-between gap-3 mt-0.5">
                <h3 className="text-base font-bold text-[#395886]">Susun Kronologi IPv6</h3>
                <AttemptBadge attempts={attempts} color="#628ECB" />
              </div>
              <p className="text-xs text-[#395886]/60 mt-0.5">{stage.storyScramble?.instruction}</p>
            </div>
            <div className="p-5 space-y-2">
              {items.map((item, idx) => (
                <SortableItem
                  key={item.id}
                  index={idx}
                  text={(idx + 1) + '. ' + item.text}
                  onMove={moveItem}
                  locked={ok || showAnswer}
                />
              ))}
              <div className="mt-4 flex flex-col gap-3">
                {checked && (
                  <FeedbackBanner type={ok ? 'success' : 'error'}>
                    {ok
                      ? (stage.storyScramble?.successMessage ?? 'Urutan sudah tepat!')
                      : showAnswer
                      ? 'Percobaan habis. Lihat kunci jawaban di bawah untuk melanjutkan.'
                      : 'Urutan belum tepat. Perhatikan logika kronologis setiap peristiwa.'}
                  </FeedbackBanner>
                )}
                {showAnswer && (
                  <AnswerKeyCard title="Urutan Kronologi yang Benar">
                    {sortedFragments.map((item: any, idx: number) => (
                      <div key={item.id} className="rounded-lg bg-white/70 p-2">
                        <span className="font-bold">{idx + 1}. </span>{item.text}
                      </div>
                    ))}
                  </AnswerKeyCard>
                )}
                {(ok || showAnswer) ? (
                  <ContinueActivityButton onClick={() => goPhase('essay1')} label="Lanjut ke Argumen NAT" />
                ) : (
                  <button
                    onClick={checkOrder}
                    className="self-end flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#628ECB] text-white font-bold text-sm hover:bg-[#395886] transition-all shadow-md active:scale-95"
                  >
                    Periksa Urutan <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase 2: Essay NAT */}
      {phase === 'essay1' && (
        <div className="animate-in fade-in duration-400">
          <EssayBox
            prompt={stage.constructivismEssay1 ?? ''}
            objectiveLabel="X.IP.9"
            submitLabel="Simpan Argumen"
            headerLabel="Argumen Logis"
            minWords={15}
            onSubmit={(text) => {
              setSaved((p: any) => ({ ...p, essay1: text }));
              goPhase('sort');
            }}
          />
        </div>
      )}

      {/* Phase 3: Analogy Sort - reveal cards */}
      {phase === 'sort' && (
        <div className="space-y-4 animate-in fade-in duration-400">
          <div className="rounded-xl border-2 border-[#8B5CF6]/20 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-[#8B5CF6]/8 border-b border-[#8B5CF6]/10">
              <p className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">
                Aktivitas 3 - Perbandingan IPv4 vs IPv6
              </p>
              <h3 className="text-base font-bold text-[#395886]">Klik setiap kartu untuk melihat analoginya</h3>
              <p className="text-xs text-[#395886]/60 mt-0.5">
                {sortRevealed.size}/{sortItems.length} kartu dibuka
              </p>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sortItems.map((item: any) => {
                const revealed = sortRevealed.has(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => setSortRevealed((prev) => new Set([...prev, item.id]))}
                    className={
                      'text-left p-4 rounded-xl border-2 transition-all ' +
                      (revealed
                        ? 'border-[#8B5CF6]/30 bg-[#F5F3FF]'
                        : 'border-[#D5DEEF] bg-white hover:border-[#8B5CF6]/30')
                    }
                  >
                    <p className="text-sm font-bold text-[#395886] leading-relaxed">{item.text}</p>
                    {revealed && (
                      <div className="flex items-start gap-2 mt-2.5 pt-2.5 border-t border-[#8B5CF6]/20">
                        <Lightbulb className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0 mt-0.5" />
                        <p className="text-xs text-[#8B5CF6] font-medium leading-relaxed italic">
                          {item.courierAnalogy}
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          {sortRevealed.size >= sortItems.length ? (
            <ContinueActivityButton onClick={() => goPhase('essay2')} label="Lanjut ke Refleksi IPv6" />
          ) : (
            <p className="text-center text-xs text-[#395886]/40 font-medium">
              Buka semua {sortItems.length} kartu untuk melanjutkan
            </p>
          )}
        </div>
      )}

      {/* Phase 4: Essay IPv6 benefits */}
      {phase === 'essay2' && (
        <div className="animate-in fade-in duration-400">
          <EssayBox
            prompt={stage.constructivismEssay2 ?? ''}
            objectiveLabel="X.IP.9"
            submitLabel="Simpan Refleksi"
            headerLabel="Refleksi Mandiri"
            minWords={15}
            onSubmit={(text) => {
              setSaved((p: any) => ({ ...p, essay2: text }));
              goPhase('conclusion');
            }}
          />
        </div>
      )}

      {/* Phase 5: ATP Conclusion */}
      {phase === 'conclusion' && (
        <div className="animate-in fade-in duration-400">
          <ATPConclusionBox
            atpBehavior={stage.atpAbcd?.behavior ?? ''}
            objectiveCode={stage.objectiveCode ?? 'X.IP.9'}
            stageType="constructivism"
            minWords={10}
            onSubmit={(text) =>
              onComplete({ ...saved, conclusion: text, conclusionText: text })
            }
          />
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// STAGE 2: INQUIRY
// ===========================================================================
function Lesson4InquiryStage({ stage, onComplete, onTrackerPhase }: Lesson4StageProps) {
  type Phase = 'explore' | 'flow' | 'reflect1' | 'match' | 'reflect2' | 'conclusion';
  const [phase, setPhase] = useState<Phase>('explore');
  const sections: any[] = stage.explorationSections ?? [];
  const flowItemsData: any[] = stage.flowItems ?? [];
  const matchingPairs: any[] = stage.matchingPairs ?? [];

  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [flowItems, setFlowItems] = useState<any[]>(() =>
    [...flowItemsData].sort(() => Math.random() - 0.5),
  );
  const [flowChecked, setFlowChecked] = useState(false);
  const [flowOk, setFlowOk] = useState(false);
  const [flowAttempts, setFlowAttempts] = useState(0);
  const [flowShowAnswer, setFlowShowAnswer] = useState(false);
  const [matchAnswers, setMatchAnswers] = useState<Record<number, string>>({});
  const [saved, setSaved] = useState<any>({});

  const allMatched =
    Object.keys(matchAnswers).length === matchingPairs.length &&
    Object.entries(matchAnswers).every(([k, v]) => v === matchingPairs[parseInt(k)]?.right);

  const goPhase = (p: Phase) => {
    setPhase(p);
    if (p === 'reflect1') onTrackerPhase?.('arguing');
    if (p === 'conclusion') onTrackerPhase?.('conclusion');
  };

  const checkFlow = () => {
    const correct = flowItems.every((item, idx) => item.correctOrder === idx + 1);
    const next = flowAttempts + 1;
    setFlowAttempts(next);
    setFlowChecked(true);
    if (correct) setFlowOk(true);
    else if (next >= MAX_TRIES) setFlowShowAnswer(true);
  };

  const moveFlow = (from: number, to: number) => {
    setFlowItems((prev) => {
      const arr = [...prev];
      const [m] = arr.splice(from, 1);
      arr.splice(to, 0, m);
      return arr;
    });
    setFlowChecked(false);
  };

  const sortedFlow = [...flowItemsData].sort((a: any, b: any) => a.correctOrder - b.correctOrder);

  return (
    <div className="space-y-5">
      <StepTracker
        steps={['Eksplorasi', 'Alur EUI-64', 'Argumentasi', 'Matching', 'Refleksi', 'Kesimpulan']}
        current={['explore', 'flow', 'reflect1', 'match', 'reflect2', 'conclusion'].indexOf(phase)}
      />

      {/* Phase 1: Exploration Accordion */}
      {phase === 'explore' && (
        <div className="space-y-4 animate-in fade-in duration-400">
          <div className="rounded-xl border-2 border-[#10B981]/20 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-[#10B981]/8 border-b border-[#10B981]/10">
              <p className="text-xs font-black uppercase tracking-widest text-[#10B981]">
                Aktivitas 1 - Eksplorasi Materi IPv6
              </p>
              <h3 className="text-base font-bold text-[#395886]">Format IPv6 dan Proses EUI-64</h3>
              <p className="text-xs text-[#395886]/60 mt-0.5">
                Buka setiap bagian materi ({openSections.size}/{sections.length} dibuka)
              </p>
            </div>
            <div className="divide-y divide-[#D5DEEF]/50">
              {sections.map((sec: any) => {
                const isOpen = openSections.has(sec.id);
                return (
                  <div key={sec.id}>
                    <button
                      onClick={() =>
                        setOpenSections((prev) => {
                          const n = new Set(prev);
                          n.add(sec.id);
                          return n;
                        })
                      }
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-[#F8FAFF] transition-colors"
                    >
                      <div
                        className={
                          'w-5 h-5 rounded-full flex items-center justify-center shrink-0 ' +
                          (isOpen ? 'bg-[#10B981] text-white' : 'bg-[#D5DEEF] text-[#395886]/50')
                        }
                      >
                        {isOpen ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </div>
                      <span className="text-sm font-bold text-[#395886] flex-1">{sec.title}</span>
                      <ChevronDown
                        className={
                          'w-4 h-4 text-[#395886]/40 shrink-0 transition-transform ' +
                          (isOpen ? 'rotate-180' : '')
                        }
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 pt-1 bg-[#F0FDF4]">
                        <p className="text-sm text-[#395886]/80 leading-relaxed">{sec.content}</p>
                        {sec.example && (
                          <div className="mt-3 p-3 rounded-lg bg-[#DCFCE7] border border-[#10B981]/20">
                            <p className="text-xs font-black uppercase tracking-widest text-[#10B981] mb-1.5">
                              Contoh
                            </p>
                            <p className="text-xs text-[#065F46] leading-relaxed font-mono">
                              {sec.example}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {openSections.size >= sections.length ? (
            <ContinueActivityButton onClick={() => goPhase('flow')} label="Lanjut ke Alur EUI-64" />
          ) : (
            <p className="text-center text-xs text-[#395886]/40 font-medium">
              Buka semua {sections.length} bagian materi untuk melanjutkan
            </p>
          )}
        </div>
      )}

      {/* Phase 2: EUI-64 Flow Ordering */}
      {phase === 'flow' && (
        <div className="space-y-4 animate-in fade-in duration-400">
          <div className="rounded-xl border-2 border-[#628ECB]/20 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-[#628ECB]/8 border-b border-[#628ECB]/10">
              <p className="text-xs font-black uppercase tracking-widest text-[#628ECB]">
                Aktivitas 2 - Keruntutan Berpikir
              </p>
              <div className="flex items-center justify-between gap-3 mt-0.5">
                <h3 className="text-base font-bold text-[#395886]">Urutkan 6 Langkah EUI-64</h3>
                <AttemptBadge attempts={flowAttempts} color="#628ECB" />
              </div>
              <p className="text-xs text-[#395886]/60 mt-0.5">{stage.flowInstruction}</p>
            </div>
            <div className="p-5 space-y-2">
              {flowItems.map((item: any, idx: number) => (
                <SortableItem
                  key={item.id}
                  index={idx}
                  text={(idx + 1) + '. ' + item.text}
                  onMove={moveFlow}
                  locked={flowOk || flowShowAnswer}
                />
              ))}
              <div className="mt-4 flex flex-col gap-3">
                {flowChecked && (
                  <FeedbackBanner type={flowOk ? 'success' : 'error'}>
                    {flowOk
                      ? 'Urutan 6 langkah EUI-64 sudah tepat! Kamu berhasil menyusun proses konversi MAC ke IPv6 Link-Local.'
                      : flowShowAnswer
                      ? 'Percobaan habis. Lihat kunci jawaban di bawah untuk melanjutkan.'
                      : 'Urutan belum tepat. Ingat: MAC -> Split 3+3 -> Sisip FF:FE -> Format 64-bit -> Flip bit ke-7 -> Prefix fe80::.'}
                  </FeedbackBanner>
                )}
                {flowShowAnswer && (
                  <AnswerKeyCard title="Urutan 6 Langkah EUI-64 yang Benar">
                    {sortedFlow.map((item: any, idx: number) => (
                      <div key={item.id} className="rounded-lg bg-white/70 p-2">
                        <span className="font-bold">{idx + 1}. </span>{item.text}
                      </div>
                    ))}
                  </AnswerKeyCard>
                )}
                {(flowOk || flowShowAnswer) ? (
                  <ContinueActivityButton
                    onClick={() => goPhase('reflect1')}
                    label="Lanjut ke Argumentasi Bit ke-7"
                  />
                ) : (
                  <button
                    onClick={checkFlow}
                    className="self-end flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#628ECB] text-white font-bold text-sm hover:bg-[#395886] transition-all shadow-md active:scale-95"
                  >
                    Periksa Urutan <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase 3: Reflection Essay 1 */}
      {phase === 'reflect1' && (
        <div className="animate-in fade-in duration-400">
          <EssayBox
            prompt={stage.inquiryReflection1 ?? ''}
            objectiveLabel="X.IP.10"
            submitLabel="Simpan Argumen"
            headerLabel="Argumen Logis"
            minWords={15}
            onSubmit={(text) => {
              setSaved((p: any) => ({ ...p, reflect1: text }));
              goPhase('match');
            }}
          />
        </div>
      )}

      {/* Phase 4: Matching pairs */}
      {phase === 'match' && (
        <div className="space-y-4 animate-in fade-in duration-400">
          <div className="rounded-xl border-2 border-[#F59E0B]/20 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-[#F59E0B]/8 border-b border-[#F59E0B]/10">
              <p className="text-xs font-black uppercase tracking-widest text-[#F59E0B]">
                Aktivitas 4 - Identifikasi Jenis Alamat IPv6
              </p>
              <h3 className="text-base font-bold text-[#395886]">Pasangkan Prefix dengan Deskripsi</h3>
              <p className="text-xs text-[#395886]/60 mt-0.5">
                Pilih deskripsi yang sesuai untuk setiap prefix IPv6.
              </p>
            </div>
            <div className="p-5 space-y-2.5">
              {matchingPairs.map((pair: any, idx: number) => {
                const selected = matchAnswers[idx] ?? '';
                const correct = selected === pair.right;
                return (
                  <div
                    key={idx}
                    className={
                      'flex items-center gap-3 p-3 rounded-xl border-2 transition-all flex-wrap sm:flex-nowrap ' +
                      (correct ? 'border-[#10B981]/30 bg-[#ECFDF5]' : 'border-[#D5DEEF] bg-[#F8FAFF]')
                    }
                  >
                    <span className="font-mono text-xs font-bold text-[#628ECB] shrink-0 w-24 text-center py-1 px-2 rounded-lg bg-[#628ECB]/10">
                      {pair.left}
                    </span>
                    <select
                      value={selected}
                      onChange={(e) =>
                        setMatchAnswers((prev) => ({ ...prev, [idx]: e.target.value }))
                      }
                      disabled={allMatched}
                      className={
                        'flex-1 min-w-0 px-3 py-2 rounded-lg border-2 text-xs font-medium outline-none transition-all cursor-pointer ' +
                        (correct
                          ? 'border-[#10B981] bg-[#ECFDF5] text-[#065F46]'
                          : 'border-[#D5DEEF] bg-white text-[#395886]')
                      }
                    >
                      <option value="">-- pilih deskripsi --</option>
                      {matchingPairs.map((p: any, i: number) => (
                        <option key={i} value={p.right}>
                          {p.right}
                        </option>
                      ))}
                    </select>
                    {correct && <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
          {allMatched && (
            <ContinueActivityButton
              onClick={() => goPhase('reflect2')}
              label="Lanjut ke Refleksi IPv6 vs NAT"
            />
          )}
        </div>
      )}

      {/* Phase 5: Reflection Essay 2 */}
      {phase === 'reflect2' && (
        <div className="animate-in fade-in duration-400">
          <EssayBox
            prompt={stage.inquiryReflection2 ?? ''}
            objectiveLabel="X.IP.10"
            submitLabel="Simpan Refleksi"
            headerLabel="Refleksi Mandiri"
            minWords={15}
            onSubmit={(text) => {
              setSaved((p: any) => ({ ...p, reflect2: text }));
              goPhase('conclusion');
            }}
          />
        </div>
      )}

      {/* Phase 6: ATP Conclusion */}
      {phase === 'conclusion' && (
        <div className="animate-in fade-in duration-400">
          <ATPConclusionBox
            atpBehavior={stage.atpAbcd?.behavior ?? ''}
            objectiveCode={stage.objectiveCode ?? 'X.IP.10'}
            stageType="inquiry"
            minWords={10}
            onSubmit={(text) =>
              onComplete({ ...saved, conclusion: text, conclusionText: text })
            }
          />
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// STAGE 3: QUESTIONING
// ===========================================================================
function Lesson4QuestioningStage({ stage, onComplete, onTrackerPhase }: Lesson4StageProps) {
  type Phase = 'qna' | 'reason' | 'conclusion';
  const [phase, setPhase] = useState<Phase>('qna');
  const questionBank: any[] = stage.questionBank ?? [];
  const reasonOptions: any[] = stage.reasonOptions ?? [];
  const [openQnA, setOpenQnA] = useState<Set<string>>(new Set());
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [reasonConfirmed, setReasonConfirmed] = useState(false);
  const [saved, setSaved] = useState<any>({});

  const selectedReasonData = reasonOptions.find((r: any) => r.id === selectedReason);

  const goPhase = (p: Phase) => {
    setPhase(p);
    if (p === 'reason') onTrackerPhase?.('arguing');
    if (p === 'conclusion') onTrackerPhase?.('conclusion');
  };

  return (
    <div className="space-y-5">
      <StepTracker
        steps={['Tanya Jawab', 'Sanggahan', 'Kesimpulan']}
        current={['qna', 'reason', 'conclusion'].indexOf(phase)}
      />

      {/* Phase 1: Scenario + Q&A */}
      {phase === 'qna' && (
        <div className="space-y-4 animate-in fade-in duration-400">
          <div className="rounded-xl border-2 border-[#8B5CF6]/20 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-[#8B5CF6]/8 border-b border-[#8B5CF6]/10">
              <p className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">
                Konteks Pembelajaran
              </p>
              <h3 className="text-base font-bold text-[#395886]">Skenario Kompresi IPv6</h3>
            </div>
            <div className="p-5 space-y-3">
              {stage.teacherQuestion && (
                <div className="p-4 rounded-xl bg-[#F5F3FF] border border-[#8B5CF6]/20">
                  <p className="text-xs font-black uppercase tracking-widest text-[#8B5CF6] mb-2">
                    Pertanyaan Guru
                  </p>
                  <p className="text-sm text-[#395886] font-semibold leading-relaxed">
                    {stage.teacherQuestion}
                  </p>
                </div>
              )}
              <div className="p-4 rounded-xl bg-[#F8FAFF] border border-[#D5DEEF]">
                <p className="text-xs font-black uppercase tracking-widest text-[#628ECB] mb-2">
                  Skenario Masalah
                </p>
                <p className="text-sm text-[#395886]/80 leading-relaxed">{stage.scenario}</p>
              </div>
              {stage.hint && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 leading-relaxed">
                    <span className="font-bold">Petunjuk: </span>
                    {stage.hint}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border-2 border-[#10B981]/20 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-[#10B981]/8 border-b border-[#10B981]/10">
              <p className="text-xs font-black uppercase tracking-widest text-[#10B981]">
                Aktivitas 1 - Keruntutan Berpikir
              </p>
              <h3 className="text-base font-bold text-[#395886]">Eksplorasi Aturan Kompresi IPv6</h3>
              <p className="text-xs text-[#395886]/60 mt-0.5">
                Klik setiap pertanyaan untuk melihat penjelasan ({openQnA.size}/{questionBank.length} dibuka)
              </p>
            </div>
            <div className="divide-y divide-[#D5DEEF]/50">
              {questionBank.map((q: any) => {
                const isOpen = openQnA.has(q.id);
                return (
                  <div key={q.id}>
                    <button
                      onClick={() => setOpenQnA((prev) => new Set([...prev, q.id]))}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-[#F8FAFF] transition-colors"
                    >
                      <div
                        className={
                          'w-5 h-5 rounded-full flex items-center justify-center shrink-0 ' +
                          (isOpen ? 'bg-[#10B981] text-white' : 'bg-[#10B981]/15 text-[#10B981]')
                        }
                      >
                        {isOpen ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <MessageSquare className="w-3 h-3" />
                        )}
                      </div>
                      <span className="text-sm font-bold text-[#395886] flex-1">{q.text}</span>
                      <ChevronDown
                        className={
                          'w-4 h-4 text-[#395886]/40 shrink-0 transition-transform ' +
                          (isOpen ? 'rotate-180' : '')
                        }
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 pt-1 bg-[#F0FDF4]">
                        <p className="text-sm text-[#065F46] leading-relaxed">{q.response}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {openQnA.size >= questionBank.length ? (
            <ContinueActivityButton onClick={() => goPhase('reason')} label="Lanjut ke Sanggahan" />
          ) : (
            <p className="text-center text-xs text-[#395886]/40 font-medium">
              Buka semua {questionBank.length} pertanyaan untuk melanjutkan
            </p>
          )}
        </div>
      )}

      {/* Phase 2: Choose correct reason */}
      {phase === 'reason' && (
        <div className="space-y-4 animate-in fade-in duration-400">
          <div className="rounded-xl border-2 border-[#8B5CF6]/20 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-[#8B5CF6]/8 border-b border-[#8B5CF6]/10">
              <p className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">
                Aktivitas 2 - Kemampuan Berargumen
              </p>
              <h3 className="text-base font-bold text-[#395886]">Pilih Sanggahan yang Tepat</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-4 rounded-xl bg-[#F5F3FF] border border-[#8B5CF6]/20">
                <p className="text-sm font-bold text-[#395886] leading-relaxed">
                  {stage.whyQuestion}
                </p>
              </div>
              <div className="space-y-2.5">
                {reasonOptions.map((opt: any) => {
                  const isSelected = selectedReason === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => !reasonConfirmed && setSelectedReason(opt.id)}
                      disabled={reasonConfirmed}
                      className={
                        'w-full text-left p-4 rounded-xl border-2 transition-all ' +
                        (reasonConfirmed && isSelected
                          ? opt.isCorrect
                            ? 'border-[#10B981] bg-[#ECFDF5]'
                            : 'border-red-300 bg-red-50'
                          : reasonConfirmed
                          ? 'border-[#D5DEEF] bg-white opacity-50 cursor-default'
                          : isSelected
                          ? 'border-[#8B5CF6] bg-[#F5F3FF]'
                          : 'border-[#D5DEEF] bg-white hover:border-[#8B5CF6]/30')
                      }
                    >
                      <p className="text-sm leading-relaxed text-[#395886]">{opt.text}</p>
                      {reasonConfirmed && isSelected && (
                        <div
                          className={
                            'mt-3 pt-3 border-t ' +
                            (opt.isCorrect ? 'border-[#10B981]/20' : 'border-red-200')
                          }
                        >
                          <p
                            className={
                              'text-xs leading-relaxed font-medium ' +
                              (opt.isCorrect ? 'text-[#065F46]' : 'text-red-700')
                            }
                          >
                            {opt.feedback}
                          </p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {selectedReason && !reasonConfirmed && (
                <button
                  onClick={() => {
                    setReasonConfirmed(true);
                    setSaved((p: any) => ({ ...p, selectedReason }));
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B5CF6] text-white font-bold text-sm hover:bg-[#7C3AED] transition-all shadow-md active:scale-95"
                >
                  Konfirmasi Pilihan <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
              {reasonConfirmed && selectedReasonData && (
                <ContinueActivityButton onClick={() => goPhase('conclusion')} label="Lanjut ke Kesimpulan" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Phase 3: ATP Conclusion */}
      {phase === 'conclusion' && (
        <div className="animate-in fade-in duration-400">
          <ATPConclusionBox
            atpBehavior={stage.atpAbcd?.behavior ?? ''}
            objectiveCode={stage.objectiveCode ?? 'X.IP.11'}
            stageType="questioning"
            minWords={10}
            onSubmit={(text) =>
              onComplete({ ...saved, conclusion: text, conclusionText: text })
            }
          />
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// STAGE 4: LEARNING COMMUNITY
// ===========================================================================
function Lesson4LearningCommunityStage({ stage, onComplete, onTrackerPhase }: Lesson4StageProps) {
  type Phase = 'caseA' | 'caseB' | 'discussion' | 'conclusion';
  const [phase, setPhase] = useState<Phase>('caseA');
  const [caseAChoice, setCaseAChoice] = useState<string | null>(null);
  const [caseAConfirmed, setCaseAConfirmed] = useState(false);
  const [caseBChoice, setCaseBChoice] = useState<string | null>(null);
  const [caseBConfirmed, setCaseBConfirmed] = useState(false);
  const [saved, setSaved] = useState<any>({});

  const caseA = stage.encapsulationCase;
  const caseB = stage.decapsulationCase;

  const goPhase = (p: Phase) => {
    setPhase(p);
    if (p === 'caseB') onTrackerPhase?.('arguing');
    if (p === 'discussion') onTrackerPhase?.('conclusion');
    if (p === 'conclusion') onTrackerPhase?.('conclusion');
  };

  function isCorrectLogic(logic: string): boolean {
    const lower = (logic ?? '').toLowerCase();
    return lower.startsWith('tepat') || lower.startsWith('langkah yang tepat') || lower.startsWith('mengakui');
  }

  function PeerCard({
    caseData,
    choice,
    confirmed,
    onChoose,
    onConfirm,
    onContinue,
    continueLabel,
  }: {
    caseData: any;
    choice: string | null;
    confirmed: boolean;
    onChoose: (id: string) => void;
    onConfirm: () => void;
    onContinue: () => void;
    continueLabel: string;
  }) {
    if (!caseData) return null;
    return (
      <div className="rounded-xl border-2 border-[#F59E0B]/20 bg-white shadow-sm overflow-hidden animate-in fade-in duration-400">
        <div className="px-5 py-3 bg-[#F59E0B]/8 border-b border-[#F59E0B]/10">
          <p className="text-xs font-black uppercase tracking-widest text-[#F59E0B]">Peer Review Audit - EUI-64</p>
          <h3 className="text-base font-bold text-[#395886]">{caseData.title}</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#F59E0B]/20">
            <p className="text-xs font-black uppercase tracking-widest text-[#F59E0B] mb-2">Konsep yang Diaudit</p>
            <p className="text-sm text-[#395886]/80 leading-relaxed">{caseData.concept}</p>
          </div>
          <div className="rounded-xl bg-slate-900 p-4 overflow-x-auto">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Hasil Kerja Siswa</p>
            <p className="text-sm text-slate-200 leading-relaxed font-mono whitespace-pre-line">{caseData.scenario}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#395886]/50 mb-3">{caseData.question}</p>
            <div className="space-y-2.5">
              {(caseData.options ?? []).map((opt: any) => {
                const isSelected = choice === opt.id;
                const correct = isCorrectLogic(opt.logic ?? '');
                return (
                  <button
                    key={opt.id}
                    onClick={() => !confirmed && onChoose(opt.id)}
                    disabled={confirmed}
                    className={
                      'w-full text-left p-4 rounded-xl border-2 transition-all ' +
                      (confirmed && isSelected
                        ? correct ? 'border-[#10B981] bg-[#ECFDF5]' : 'border-red-300 bg-red-50'
                        : confirmed ? 'border-[#D5DEEF] bg-white opacity-50 cursor-default'
                        : isSelected ? 'border-[#F59E0B] bg-[#FFFBEB]' : 'border-[#D5DEEF] bg-white hover:border-[#F59E0B]/30')
                    }
                  >
                    <p className="text-sm leading-relaxed text-[#395886]">{opt.text}</p>
                    {confirmed && isSelected && (
                      <div className={'mt-3 pt-3 border-t ' + (correct ? 'border-[#10B981]/20' : 'border-red-200')}>
                        <p className={'text-xs leading-relaxed font-medium ' + (correct ? 'text-[#065F46]' : 'text-red-700')}>
                          {opt.logic}
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          {choice && !confirmed && (
            <button
              onClick={onConfirm}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F59E0B] text-white font-bold text-sm hover:bg-[#D97706] transition-all shadow-md active:scale-95"
            >
              Konfirmasi Audit <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          {confirmed && (
            <ContinueActivityButton onClick={onContinue} label={continueLabel} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <StepTracker
        steps={['Audit Kartu A', 'Audit Kartu B', 'Diskusi', 'Kesimpulan']}
        current={['caseA', 'caseB', 'discussion', 'conclusion'].indexOf(phase)}
      />

      {phase === 'caseA' && (
        <PeerCard
          caseData={caseA}
          choice={caseAChoice}
          confirmed={caseAConfirmed}
          onChoose={setCaseAChoice}
          onConfirm={() => { setCaseAConfirmed(true); setSaved((p: any) => ({ ...p, caseAChoice })); }}
          onContinue={() => goPhase('caseB')}
          continueLabel="Lanjut ke Audit Kartu B"
        />
      )}

      {phase === 'caseB' && (
        <PeerCard
          caseData={caseB}
          choice={caseBChoice}
          confirmed={caseBConfirmed}
          onChoose={setCaseBChoice}
          onConfirm={() => { setCaseBConfirmed(true); setSaved((p: any) => ({ ...p, caseBChoice })); }}
          onContinue={() => goPhase('discussion')}
          continueLabel="Lanjut ke Diskusi Kelompok"
        />
      )}

      {phase === 'discussion' && (
        <div className="animate-in fade-in duration-400">
          <EssayBox
            prompt={stage.groupActivity?.discussionPrompt ?? ''}
            objectiveLabel="X.IP.12"
            submitLabel="Simpan Diskusi"
            headerLabel="Refleksi Mandiri"
            minWords={15}
            onSubmit={(text) => {
              setSaved((p: any) => ({ ...p, discussion: text }));
              goPhase('conclusion');
            }}
          />
        </div>
      )}

      {phase === 'conclusion' && (
        <div className="animate-in fade-in duration-400">
          <ATPConclusionBox
            atpBehavior={stage.atpAbcd?.behavior ?? ''}
            objectiveCode={stage.objectiveCode ?? 'X.IP.12'}
            stageType="learning-community"
            minWords={10}
            onSubmit={(text) =>
              onComplete({ ...saved, conclusion: text, conclusionText: text })
            }
          />
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// STAGE 6: REFLECTION
// ===========================================================================
function Lesson4ReflectionStage({ stage, onComplete, onTrackerPhase }: Lesson4StageProps) {
  type Phase = 'conceptmap' | 'essay' | 'selfeval' | 'conclusion';
  const [phase, setPhase] = useState<Phase>('conceptmap');
  const connections: any[] = stage.conceptMapConnections ?? [];
  const nodes: any[] = stage.conceptMapNodes ?? [];
  const selfEvalCriteria: any[] = stage.selfEvaluationCriteria ?? [];
  const [mapAnswers, setMapAnswers] = useState<Record<string, string>>({});
  const [essaysDone, setEssaysDone] = useState({ material: false, easy: false, hard: false });
  const [essaySaved, setEssaySaved] = useState({ material: false, easy: false, hard: false });
  const [selfEval, setSelfEval] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<any>({});

  const getNodeLabel = (id: string) => nodes.find((n: any) => n.id === id)?.label ?? id;
  const allConnected = connections.length > 0 &&
    connections.every((c: any) => !!mapAnswers[`${c.from}-${c.to}`]);

  const goPhase = (p: Phase) => {
    setPhase(p);
    if (p === 'essay') onTrackerPhase?.('arguing');
    if (p === 'conclusion') onTrackerPhase?.('conclusion');
  };

  return (
    <div className="space-y-5">
      <StepTracker
        steps={['Peta Konsep', 'Refleksi Essay', 'Evaluasi Diri', 'Kesimpulan']}
        current={['conceptmap', 'essay', 'selfeval', 'conclusion'].indexOf(phase)}
      />

      {/* Phase 1: Concept Map dropdowns */}
      {phase === 'conceptmap' && (
        <div className="space-y-4 animate-in fade-in duration-400">
          <div className="rounded-xl border-2 border-[#628ECB]/20 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-[#628ECB]/8 border-b border-[#628ECB]/10">
              <p className="text-xs font-black uppercase tracking-widest text-[#628ECB]">
                Aktivitas 1 - Keruntutan Berpikir
              </p>
              <h3 className="text-base font-bold text-[#395886]">Peta Konsep IPv6</h3>
              <p className="text-xs text-[#395886]/60 mt-0.5">
                Pilih label koneksi yang tepat ({connections.filter((c: any) => !!mapAnswers[`${c.from}-${c.to}`]).length}/{connections.length} dijawab)
              </p>
            </div>
            <div className="p-5 space-y-2.5">
              {connections.map((c: any) => {
                const key = `${c.from}-${c.to}`;
                const val = mapAnswers[key] ?? '';
                const correct = val === c.label;
                return (
                  <div
                    key={key}
                    className={
                      'flex items-center gap-2 p-3 rounded-xl border-2 transition-all flex-wrap sm:flex-nowrap ' +
                      (correct ? 'border-[#10B981]/30 bg-[#ECFDF5]' : 'border-[#D5DEEF] bg-[#F8FAFF]')
                    }
                  >
                    <span className="text-xs font-bold text-[#628ECB] shrink-0 px-2.5 py-1 rounded-lg bg-[#628ECB]/10 whitespace-nowrap">
                      {getNodeLabel(c.from)}
                    </span>
                    <select
                      value={val}
                      onChange={(e) => setMapAnswers((prev) => ({ ...prev, [key]: e.target.value }))}
                      className={
                        'flex-1 min-w-0 px-3 py-2 rounded-lg border-2 text-xs font-medium outline-none transition-all cursor-pointer ' +
                        (correct
                          ? 'border-[#10B981] bg-[#ECFDF5] text-[#065F46]'
                          : 'border-[#D5DEEF] bg-white text-[#395886]')
                      }
                    >
                      <option value="">-- pilih label koneksi --</option>
                      {(c.options ?? []).map((o: string) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                    <span className="text-xs font-bold text-[#395886] shrink-0 px-2.5 py-1 rounded-lg bg-[#395886]/8 whitespace-nowrap">
                      {getNodeLabel(c.to)}
                    </span>
                    {correct && <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
          {allConnected ? (
            <ContinueActivityButton onClick={() => { setSaved((p: any) => ({ ...p, mapAnswers: { ...mapAnswers } })); goPhase('essay'); }} label="Lanjut ke Refleksi Essay" />
          ) : (
            <p className="text-center text-xs text-[#395886]/40 font-medium">
              Jawab semua koneksi peta konsep untuk melanjutkan
            </p>
          )}
        </div>
      )}

      {/* Phase 2: Sequential essays — save and advance are decoupled */}
      {phase === 'essay' && (
        <div className="animate-in fade-in duration-400 space-y-2">
          {!essaysDone.material ? (
            <div className="space-y-2">
              <EssayBox
                prompt={stage.essayReflection?.materialSummaryPrompt ?? ''}
                objectiveLabel="X.IP.14"
                submitLabel="Simpan Perbandingan"
                headerLabel="Argumen Logis"
                minWords={20}
                onSubmit={(text) => {
                  setSaved((p: any) => ({ ...p, essayMaterial: text }));
                  setEssaySaved((p) => ({ ...p, material: true }));
                }}
              />
              {essaySaved.material ? (
                <ContinueActivityButton
                  onClick={() => setEssaysDone((p) => ({ ...p, material: true }))}
                  label="Lanjut ke Pertanyaan Berikutnya"
                />
              ) : (
                <button
                  onClick={() => { setSaved((p: any) => ({ ...p, essayMaterial: '' })); setEssaysDone((p) => ({ ...p, material: true })); }}
                  className="w-full text-center text-xs text-[#395886]/40 hover:text-[#395886]/70 py-1.5 font-medium transition-colors"
                >
                  Lanjut tanpa menjawab →
                </button>
              )}
            </div>
          ) : !essaysDone.easy ? (
            <div className="space-y-2">
              <EssayBox
                prompt={stage.essayReflection?.easyPartPrompt ?? ''}
                objectiveLabel="X.IP.14"
                submitLabel="Simpan Jawaban"
                headerLabel="Refleksi Mandiri"
                minWords={10}
                onSubmit={(text) => {
                  setSaved((p: any) => ({ ...p, essayEasy: text }));
                  setEssaySaved((p) => ({ ...p, easy: true }));
                }}
              />
              {essaySaved.easy ? (
                <ContinueActivityButton
                  onClick={() => setEssaysDone((p) => ({ ...p, easy: true }))}
                  label="Lanjut ke Pertanyaan Berikutnya"
                />
              ) : (
                <button
                  onClick={() => { setSaved((p: any) => ({ ...p, essayEasy: '' })); setEssaysDone((p) => ({ ...p, easy: true })); }}
                  className="w-full text-center text-xs text-[#395886]/40 hover:text-[#395886]/70 py-1.5 font-medium transition-colors"
                >
                  Lanjut tanpa menjawab →
                </button>
              )}
            </div>
          ) : !essaysDone.hard ? (
            <div className="space-y-2">
              <EssayBox
                prompt={stage.essayReflection?.hardPartPrompt ?? ''}
                objectiveLabel="X.IP.14"
                submitLabel="Simpan Jawaban"
                headerLabel="Refleksi Mandiri"
                minWords={10}
                onSubmit={(text) => {
                  setSaved((p: any) => ({ ...p, essayHard: text }));
                  setEssaySaved((p) => ({ ...p, hard: true }));
                }}
              />
              {essaySaved.hard ? (
                <ContinueActivityButton
                  onClick={() => setEssaysDone((p) => ({ ...p, hard: true }))}
                  label="Lanjut ke Pertanyaan Berikutnya"
                />
              ) : (
                <button
                  onClick={() => { setSaved((p: any) => ({ ...p, essayHard: '' })); setEssaysDone((p) => ({ ...p, hard: true })); }}
                  className="w-full text-center text-xs text-[#395886]/40 hover:text-[#395886]/70 py-1.5 font-medium transition-colors"
                >
                  Lanjut tanpa menjawab →
                </button>
              )}
            </div>
          ) : (
            <ContinueActivityButton onClick={() => goPhase('selfeval')} label="Lanjut ke Evaluasi Diri" />
          )}
        </div>
      )}

      {/* Phase 3: Self-evaluation checklist */}
      {phase === 'selfeval' && (
        <div className="space-y-4 animate-in fade-in duration-400">
          <div className="rounded-xl border-2 border-[#10B981]/20 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-[#10B981]/8 border-b border-[#10B981]/10">
              <p className="text-xs font-black uppercase tracking-widest text-[#10B981]">
                Aktivitas 3 - Evaluasi Diri
              </p>
              <h3 className="text-base font-bold text-[#395886]">Seberapa jauh pemahamanmu tentang IPv6?</h3>
              <p className="text-xs text-[#395886]/60 mt-0.5">
                Centang pernyataan yang sudah benar-benar kamu kuasai.
              </p>
            </div>
            <div className="p-5 space-y-2.5">
              {selfEvalCriteria.map((c: any) => (
                <label
                  key={c.id}
                  className={
                    'flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ' +
                    (selfEval.has(c.id)
                      ? 'border-[#10B981]/30 bg-[#ECFDF5]'
                      : 'border-[#D5DEEF] bg-white hover:border-[#10B981]/20')
                  }
                >
                  <input
                    type="checkbox"
                    checked={selfEval.has(c.id)}
                    onChange={() =>
                      setSelfEval((prev) => {
                        const n = new Set(prev);
                        if (n.has(c.id)) n.delete(c.id);
                        else n.add(c.id);
                        return n;
                      })
                    }
                    className="mt-0.5 w-4 h-4 shrink-0 accent-[#10B981]"
                  />
                  <span
                    className={
                      'text-sm leading-relaxed font-medium ' +
                      (selfEval.has(c.id) ? 'text-[#065F46]' : 'text-[#395886]/80')
                    }
                  >
                    {c.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <ContinueActivityButton
            onClick={() => {
              setSaved((p: any) => ({ ...p, selfEval: [...selfEval] }));
              goPhase('conclusion');
            }}
            label="Lanjut ke Kesimpulan Akhir"
          />
        </div>
      )}

      {/* Phase 4: ATP Conclusion */}
      {phase === 'conclusion' && (
        <div className="animate-in fade-in duration-400">
          <ATPConclusionBox
            atpBehavior={stage.atpAbcd?.behavior ?? ''}
            objectiveCode={stage.objectiveCode ?? 'X.IP.14'}
            stageType="reflection"
            minWords={10}
            onSubmit={(text) =>
              onComplete({ ...saved, conclusion: text, conclusionText: text, summary: text })
            }
          />
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// STAGE 7: AUTHENTIC ASSESSMENT
// ===========================================================================
function Lesson4AuthenticAssessmentStage({ stage, onComplete, onTrackerPhase }: Lesson4StageProps) {
  type Phase = 'context' | 'choice' | 'followup' | 'rca' | 'conclusion';
  const [phase, setPhase] = useState<Phase>('context');
  const scenario = stage.branchingScenario;
  const choices: any[] = scenario?.choices ?? [];
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [followUpChoice, setFollowUpChoice] = useState<string | null>(null);
  const [followUpConfirmed, setFollowUpConfirmed] = useState(false);
  const [saved, setSaved] = useState<any>({});

  const currentChoiceData = choices.find((c: any) => c.id === selectedChoice);
  const followUpChoices: any[] = currentChoiceData?.followUpChoices ?? [];
  const followUpData = followUpChoices.find((f: any) => f.id === followUpChoice);

  const goPhase = (p: Phase) => {
    setPhase(p);
    if (p === 'choice') onTrackerPhase?.('consistency');
    if (p === 'followup') onTrackerPhase?.('arguing');
    if (p === 'rca') onTrackerPhase?.('conclusion');
    if (p === 'conclusion') onTrackerPhase?.('conclusion');
  };

  return (
    <div className="space-y-5">
      <StepTracker
        steps={['Konteks', 'Investigasi', 'Tindak Lanjut', 'Dokumen RCA', 'Kesimpulan']}
        current={['context', 'choice', 'followup', 'rca', 'conclusion'].indexOf(phase)}
      />

      {/* Phase 1: Context */}
      {phase === 'context' && (
        <div className="space-y-4 animate-in fade-in duration-400">
          <div className="rounded-xl border-2 border-[#8B5CF6]/20 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-[#8B5CF6]/8 border-b border-[#8B5CF6]/10">
              <p className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">
                Studi Kasus - Investigasi Jaringan IPv6
              </p>
              <h3 className="text-base font-bold text-[#395886]">Laporan Insiden: Paket IPv6 Drop</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-4 rounded-xl bg-[#F5F3FF] border border-[#8B5CF6]/20">
                <p className="text-sm text-[#395886] leading-relaxed">{scenario?.context}</p>
              </div>
              {scenario?.focusAreas && (
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-[#395886]/40 mb-2">
                    Area Investigasi
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {scenario.focusAreas.map((area: string, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-[#F8FAFF] border border-[#D5DEEF] text-center">
                        <p className="text-xs font-bold text-[#395886]">{area}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#F59E0B]/20">
                <p className="text-xs font-black uppercase tracking-widest text-[#F59E0B] mb-2">
                  Pertanyaan Investigasi
                </p>
                <p className="text-sm font-bold text-[#395886] leading-relaxed">
                  {scenario?.initialQuestion}
                </p>
              </div>
            </div>
          </div>
          <ContinueActivityButton onClick={() => goPhase('choice')} label="Mulai Investigasi" />
        </div>
      )}

      {/* Phase 2: Choose investigation path */}
      {phase === 'choice' && (
        <div className="space-y-4 animate-in fade-in duration-400">
          <div className="rounded-xl border-2 border-[#8B5CF6]/20 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-[#8B5CF6]/8 border-b border-[#8B5CF6]/10">
              <p className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">
                Aktivitas 1 - Keruntutan Berpikir
              </p>
              <h3 className="text-base font-bold text-[#395886]">Pilih Langkah Investigasi Pertama</h3>
            </div>
            <div className="p-5 space-y-3">
              {choices.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedChoice(c.id)}
                  className={
                    'w-full text-left p-4 rounded-xl border-2 transition-all ' +
                    (selectedChoice === c.id
                      ? 'border-[#8B5CF6] bg-[#F5F3FF]'
                      : 'border-[#D5DEEF] bg-white hover:border-[#8B5CF6]/30')
                  }
                >
                  <p className="text-sm leading-relaxed text-[#395886]">{c.text}</p>
                </button>
              ))}
              {selectedChoice && currentChoiceData && (
                <div className="space-y-3">
                  <div
                    className={
                      'p-4 rounded-xl border-2 animate-in fade-in duration-300 ' +
                      (currentChoiceData.isOptimal
                        ? 'border-[#10B981]/30 bg-[#ECFDF5]'
                        : 'border-amber-200 bg-amber-50')
                    }
                  >
                    <p
                      className={
                        'text-sm leading-relaxed font-medium ' +
                        (currentChoiceData.isOptimal ? 'text-[#065F46]' : 'text-amber-800')
                      }
                    >
                      {currentChoiceData.consequence}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSaved((p: any) => ({ ...p, initialChoice: selectedChoice }));
                      goPhase('followup');
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B5CF6] text-white font-bold text-sm hover:bg-[#7C3AED] transition-all shadow-md active:scale-95"
                  >
                    Lanjutkan Investigasi <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Phase 3: Follow-up decision */}
      {phase === 'followup' && currentChoiceData && (
        <div className="space-y-4 animate-in fade-in duration-400">
          <div className="rounded-xl border-2 border-[#8B5CF6]/20 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-[#8B5CF6]/8 border-b border-[#8B5CF6]/10">
              <p className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">
                Aktivitas 2 - Kemampuan Berargumen
              </p>
              <h3 className="text-base font-bold text-[#395886]">Tindak Lanjut Investigasi</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-4 rounded-xl bg-[#F5F3FF] border border-[#8B5CF6]/20">
                <p className="text-sm font-bold text-[#395886] leading-relaxed">
                  {currentChoiceData.followUpQuestion}
                </p>
              </div>
              <div className="space-y-2.5">
                {followUpChoices.map((f: any) => {
                  const isSelected = followUpChoice === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => !followUpConfirmed && setFollowUpChoice(f.id)}
                      disabled={followUpConfirmed}
                      className={
                        'w-full text-left p-4 rounded-xl border-2 transition-all ' +
                        (followUpConfirmed && isSelected
                          ? f.isCorrect ? 'border-[#10B981] bg-[#ECFDF5]' : 'border-red-300 bg-red-50'
                          : followUpConfirmed ? 'border-[#D5DEEF] bg-white opacity-50 cursor-default'
                          : isSelected ? 'border-[#8B5CF6] bg-[#F5F3FF]' : 'border-[#D5DEEF] bg-white hover:border-[#8B5CF6]/30')
                      }
                    >
                      <p className="text-sm leading-relaxed text-[#395886]">{f.text}</p>
                      {followUpConfirmed && isSelected && (
                        <div className={'mt-3 pt-3 border-t ' + (f.isCorrect ? 'border-[#10B981]/20' : 'border-red-200')}>
                          <p className={'text-xs leading-relaxed font-medium ' + (f.isCorrect ? 'text-[#065F46]' : 'text-red-700')}>
                            {f.explanation}
                          </p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {followUpChoice && !followUpConfirmed && (
                <button
                  onClick={() => {
                    setFollowUpConfirmed(true);
                    setSaved((p: any) => ({ ...p, followUpChoice }));
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B5CF6] text-white font-bold text-sm hover:bg-[#7C3AED] transition-all shadow-md active:scale-95"
                >
                  Konfirmasi Jawaban <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
              {followUpConfirmed && followUpData && (
                <ContinueActivityButton onClick={() => goPhase('rca')} label="Susun Dokumen RCA" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Phase 4: RCA essay */}
      {phase === 'rca' && (
        <div className="animate-in fade-in duration-400">
          <EssayBox
            prompt={scenario?.finalEvaluation ?? ''}
            objectiveLabel="X.IP.15"
            submitLabel="Simpan Dokumen RCA"
            headerLabel="Penarikan Kesimpulan"
            minWords={20}
            onSubmit={(text) => {
              setSaved((p: any) => ({ ...p, rca: text }));
              goPhase('conclusion');
            }}
          />
        </div>
      )}

      {/* Phase 5: ATP Conclusion */}
      {phase === 'conclusion' && (
        <div className="animate-in fade-in duration-400">
          <ATPConclusionBox
            atpBehavior={stage.atpAbcd?.behavior ?? ''}
            objectiveCode={stage.objectiveCode ?? 'X.IP.15'}
            stageType="authentic-assessment"
            minWords={10}
            onSubmit={(text) =>
              onComplete({ ...saved, conclusion: text, conclusionText: text })
            }
          />
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// DISPATCHER
// ===========================================================================
export function Lesson4Stage(props: Lesson4StageProps) {
  switch (props.stage.type) {
    case 'constructivism':       return <Lesson4ConstructivismStage {...props} />;
    case 'inquiry':              return <Lesson4InquiryStage {...props} />;
    case 'questioning':          return <Lesson4QuestioningStage {...props} />;
    case 'learning-community':   return <Lesson4LearningCommunityStage {...props} />;
    case 'reflection':           return <Lesson4ReflectionStage {...props} />;
    case 'authentic-assessment': return <Lesson4AuthenticAssessmentStage {...props} />;
    default:                     return null;
  }
}
