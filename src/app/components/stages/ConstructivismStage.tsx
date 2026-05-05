import { useState, useEffect, useMemo } from 'react';
import {
  ChevronRight, CheckCircle, XCircle, Lightbulb, HelpCircle, PlayCircle,
  RotateCcw, AlertCircle, Info, BookOpen, GripVertical, PenLine, ArrowRight,
} from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import { getCurrentUser } from '../../utils/auth';
import { getLessonProgress, saveStageAttempt } from '../../utils/progress';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { CourierDefinition } from './CourierDefinition';

// -- Types ----------------------------------------------------------------------

interface StoryFragment { id: string; text: string; order: number }
interface AnalogyGroup { id: string; label: string; colorClass: 'blue' | 'green' | 'purple' | 'amber' }
interface AnalogyItem { id: string; text: string; correctGroup: string; correctOrder?: number; courierAnalogy?: string }

interface ConstructivismStageProps {
  apersepsi?: string;
  question: string;
  options: Array<{ id: string; text: string }>;
  correctAnswer?: string;
  feedback?: { correct: string; incorrect: string };
  videoUrl?: string;
  storyScramble?: {
    instruction: string;
    fragments: StoryFragment[];
    successMessage: string;
    reflection?: string;
    reflectionAnswer?: string;
  };
  analogySortGroups?: AnalogyGroup[];
  analogySortItems?: AnalogyItem[];
  constructivismEssay1?: string;
  constructivismEssay2?: string;
  lessonId: string;
  stageIndex: number;
  onComplete: (answer: any) => void;
  isCompleted?: boolean;
}

// -- Helpers -------------------------------------------------------------------

function getYouTubeId(url: string) {
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return match && match[2].length === 11 ? match[2] : null;
}

// -- Essay Box -----------------------------------------------------------------

function EssayBox({
  prompt, objectiveLabel, submitLabel, onSubmit, minWords = 15,
}: {
  prompt: string; objectiveLabel: string; submitLabel: string; onSubmit: (text: string) => void; minWords?: number;
}) {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const ready = wordCount >= minWords;

  return (
    <div className="mt-5 p-6 rounded-[2rem] bg-gradient-to-br from-[#628ECB]/5 to-[#395886]/5 border-2 border-[#628ECB]/20 shadow-inner">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-xl bg-[#628ECB]/10 text-[#628ECB]">
          <PenLine className="w-4 h-4" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]/60">Refleksi Mandiri — {objectiveLabel}</p>
      </div>
      <p className="text-sm font-bold text-[#395886] leading-relaxed mb-4">{prompt}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={submitted}
        rows={4}
        className="w-full px-5 py-4 border-2 border-[#D5DEEF] rounded-2xl text-sm text-[#395886] focus:outline-none focus:ring-4 focus:ring-[#628ECB]/10 focus:border-[#628ECB] transition-all bg-white/80 backdrop-blur-sm resize-none disabled:bg-[#F0F3FA]/50"
        placeholder="Tuliskan pemikiran logismu di sini..."
      />
      <div className="flex items-center justify-between mt-3 mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-24 rounded-full bg-[#D5DEEF] overflow-hidden`}>
             <div className={`h-full transition-all duration-500 ${ready ? 'bg-[#10B981]' : 'bg-[#628ECB]'}`} style={{ width: `${Math.min(100, (wordCount / minWords) * 100)}%` }} />
          </div>
          <p className={`text-[11px] font-black uppercase tracking-tighter ${ready ? 'text-[#10B981]' : 'text-[#395886]/40'}`}>
            {wordCount} / {minWords} Kata
          </p>
        </div>
        {submitted && (
          <span className="flex items-center gap-1.5 text-xs font-black text-[#10B981] uppercase tracking-widest">
            <CheckCircle className="w-4 h-4" /> Tersimpan
          </span>
        )}
      </div>
      {!submitted && (
        <button
          onClick={() => { if (ready) { setSubmitted(true); onSubmit(text.trim()); } }}
          disabled={!ready}
          className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-95 ${ready ? 'bg-[#10B981] text-white hover:bg-[#059669] shadow-green-200' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'}`}
        >
          {submitLabel}
          <ArrowRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

// -- Story Scramble - Slot-Based DnD -------------------------------------------

const DRAG_SCRAMBLE = 'STORY_CARD_DRAG';

function DraggableStoryCard({ fragment, disabled }: { fragment: StoryFragment; disabled?: boolean }) {
  const [{ isDragging }, drag] = useDrag({
    type: DRAG_SCRAMBLE,
    item: { id: fragment.id },
    canDrag: !disabled,
    collect: m => ({ isDragging: m.isDragging() }),
  });
  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`flex items-start gap-2 p-3 rounded-xl border-2 text-xs text-[#395886] leading-relaxed transition-all select-none
        border-[#D5DEEF] bg-white hover:border-[#628ECB]/50 hover:shadow-sm
        ${disabled ? 'cursor-default opacity-60' : isDragging ? 'opacity-30 cursor-grabbing' : 'cursor-grab'}`}
    >
      {!disabled && <GripVertical className="w-3.5 h-3.5 text-[#395886]/30 shrink-0 mt-0.5" />}
      <p className="flex-1">{fragment.text}</p>
    </div>
  );
}

function StoryDropSlot({ slotNum, fragment, validated, onDrop, onReturn }: {
  slotNum: number;
  fragment?: StoryFragment;
  validated: boolean;
  onDrop: (slot: number, id: string) => void;
  onReturn: (slot: number) => void;
}) {
  const [{ isOver }, drop] = useDrop({
    accept: DRAG_SCRAMBLE,
    drop: (d: { id: string }) => onDrop(slotNum, d.id),
    collect: m => ({ isOver: m.isOver() }),
  });

  const isCorrect = validated && !!fragment && fragment.order === slotNum;
  const isWrong = validated && !!fragment && fragment.order !== slotNum;

  return (
    <div className="flex items-start gap-3">
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black mt-2.5
        ${isCorrect ? 'bg-[#10B981] text-white' : isWrong ? 'bg-red-400 text-white' : 'bg-[#395886]/10 text-[#395886]/50'}`}>
        {slotNum}
      </div>
      <div
        ref={drop as unknown as React.Ref<HTMLDivElement>}
        className={`flex-1 min-h-[52px] rounded-xl border-2 transition-all p-2.5
          ${isOver && !validated ? 'border-[#628ECB] bg-[#628ECB]/8 shadow-md' : ''}
          ${!fragment && !isOver ? 'border-dashed border-[#D5DEEF] bg-[#F8FAFF]' : ''}
          ${isCorrect ? 'border-[#10B981] bg-[#10B981]/8' : ''}
          ${isWrong ? 'border-red-300 bg-red-50' : ''}
          ${fragment && !validated && !isOver ? 'border-[#628ECB]/40 bg-[#628ECB]/5' : ''}`}
      >
        {fragment ? (
          <div className="flex items-start gap-2">
            <p className="flex-1 text-xs text-[#395886] leading-relaxed">{fragment.text}</p>
            {!validated && (
              <button
                onClick={() => onReturn(slotNum)}
                className="shrink-0 text-[#395886]/30 hover:text-red-400 transition text-sm font-bold leading-none mt-0.5"
                title="Kembalikan ke pool"
              >
                x
              </button>
            )}
            {isCorrect && <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />}
            {isWrong && <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
          </div>
        ) : (
          <p className={`text-[11px] font-medium text-center py-2 transition-colors ${isOver ? 'text-[#628ECB]' : 'text-[#395886]/30'}`}>
            {isOver ? '(drop)' : 'Seret cerita ke sini...'}
          </p>
        )}
      </div>
    </div>
  );
}

function StoryScramblePhase({
  storyScramble, videoUrl, apersepsi, essayPrompt, lessonId, stageIndex, onComplete, initialData,
}: {
  storyScramble: NonNullable<ConstructivismStageProps['storyScramble']>;
  videoUrl?: string;
  apersepsi?: string;
  essayPrompt?: string;
  lessonId: string;
  stageIndex: number;
  onComplete: (essayText?: string, currentSlots?: Record<number, string>) => void;
  initialData?: { slots?: Record<number, string>; validated?: boolean };
}) {
  const user = getCurrentUser();

  const shuffled = useMemo(() => {
    const arr = [...storyScramble.fragments];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  const [slots, setSlots] = useState<Record<number, string>>(initialData?.slots || {});
  const [validated, setValidated] = useState(initialData?.validated || false);
  const [attempts, setAttempts] = useState(0);
  const [showPost, setShowPost] = useState(false);

  useEffect(() => {
    getLessonProgress(user!.id, lessonId).then((p) => {
      setAttempts(p.stageAttempts[`stage_${stageIndex}`] || 0);
    });
  }, []);

  useEffect(() => {
    if (initialData?.slots) setSlots(initialData.slots);
    if (initialData?.validated) setValidated(initialData.validated);
  }, [initialData]);

  const placedIds = new Set(Object.values(slots));
  const pool = shuffled.filter(f => !placedIds.has(f.id));
  const allFilled = storyScramble.fragments.every((_, i) => slots[i + 1] !== undefined);

  const fragmentById = (id: string) => storyScramble.fragments.find(f => f.id === id);

  const handleDropToSlot = (slotNum: number, id: string) => {
    if (validated) return;
    setSlots(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { if (next[Number(k)] === id) delete next[Number(k)]; });
      next[slotNum] = id;
      onComplete(undefined, next);
      return next;
    });
  };

  const handleReturnToPool = (slotNum: number) => {
    if (validated) return;
    setSlots(prev => {
      const next = { ...prev };
      delete next[slotNum];
      onComplete(undefined, next);
      return next;
    });
  };

  const isCorrectOrder = allFilled && storyScramble.fragments.every((_, i) => {
    const f = fragmentById(slots[i + 1] ?? '');
    return f?.order === i + 1;
  });

  const handleValidate = async () => {
    const newAttempts = await saveStageAttempt(user!.id, lessonId, stageIndex, isCorrectOrder);
    setAttempts(newAttempts);
    setValidated(true);
    onComplete(undefined, slots);
    if (isCorrectOrder || newAttempts >= 3) {
      setTimeout(() => setShowPost(true), isCorrectOrder ? 700 : 0);
    }
  };

  const handleRetry = () => {
    const nextSlots = { ...slots };
    let hasChanges = false;
    Object.keys(nextSlots).forEach(key => {
      const slotNum = Number(key);
      const f = fragmentById(nextSlots[slotNum]);
      if (f?.order !== slotNum) {
        delete nextSlots[slotNum];
        hasChanges = true;
      }
    });
    if (hasChanges) {
      setSlots(nextSlots);
      onComplete(undefined, nextSlots);
    }
    setValidated(false);
  };

  const isTerminal = validated && (isCorrectOrder || attempts >= 3);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {(videoUrl || apersepsi) && (
        <div className="bg-white rounded-2xl border-2 border-[#628ECB]/20 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 bg-[#628ECB]/8 border-b border-[#628ECB]/20">
            <PlayCircle className="w-4 h-4 text-[#628ECB]" />
            <h3 className="text-sm font-bold text-[#395886]">Konteks Pembelajaran</h3>
          </div>
          {videoUrl ? (
            <div className="aspect-video w-full bg-black">
              {getYouTubeId(videoUrl) ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}`}
                  title="Video pembelajaran"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-sm">Video tidak dapat dimuat</div>
              )}
            </div>
          ) : (
            <div className="px-5 py-5 bg-gradient-to-br from-[#628ECB]/5 to-transparent">
              <div className="flex items-start gap-4">
                <Lightbulb className="w-5 h-5 text-[#628ECB] mt-0.5 shrink-0" />
                <p className="text-[#395886]/80 leading-relaxed text-sm italic">"{apersepsi}"</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl border-2 border-[#628ECB]/20 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 bg-[#628ECB]/8 border-b border-[#628ECB]/20">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#628ECB]/15">
            <BookOpen className="w-4 h-4 text-[#628ECB]" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]">Aktivitas 1 - Story Scramble (X.TCP.1)</p>
            <h3 className="text-sm font-bold text-[#395886]">Susun Cerita Digital Menjadi Urutan Logis</h3>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold
            ${attempts >= 3 ? 'border-red-200 bg-red-50 text-red-500' : 'border-[#628ECB]/20 bg-white text-[#628ECB]'}`}>
            <AlertCircle className="w-3 h-3" />
            {attempts >= 3 ? 'Habis' : `${3 - attempts} percobaan`}
          </div>
        </div>
        <div className="px-5 py-4 bg-gradient-to-br from-[#628ECB]/5 to-transparent">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-[#628ECB] mt-0.5 shrink-0" />
            <p className="text-sm text-[#395886]/80 leading-relaxed">{storyScramble.instruction}</p>
          </div>
          <p className="mt-2 text-xs text-[#628ECB] font-semibold">
            Hint: Seret kartu dari panel kanan ke slot bernomor di kiri. Klik x pada kartu yang sudah ditempatkan untuk mengembalikannya.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-[#D5DEEF] shadow-sm p-5">
        <div className="grid lg:grid-cols-[1fr_280px] gap-5">
          <div className="space-y-2.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/50 mb-3">
              Urutan Cerita (Slot 1-{storyScramble.fragments.length})
            </p>
            {storyScramble.fragments.map((_, i) => {
              const slotNum = i + 1;
              const placedId = slots[slotNum];
              const placedFragment = placedId ? fragmentById(placedId) : undefined;
              return (
                <StoryDropSlot
                  key={slotNum}
                  slotNum={slotNum}
                  fragment={placedFragment}
                  validated={validated}
                  onDrop={handleDropToSlot}
                  onReturn={handleReturnToPool}
                />
              );
            })}
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/50 mb-3">
              Kartu Cerita ({pool.length} tersisa)
            </p>
            <div className="space-y-2">
              {pool.map(fragment => (
                <DraggableStoryCard key={fragment.id} fragment={fragment} disabled={validated} />
              ))}
              {pool.length === 0 && !validated && (
                <div className="text-center py-6 text-xs text-[#395886]/30 border-2 border-dashed border-[#D5DEEF] rounded-xl">
                  Semua kartu sudah ditempatkan
                </div>
              )}
              {validated && (
                <div className={`p-3 rounded-xl border text-xs font-medium leading-relaxed
                  ${isCorrectOrder ? 'bg-[#10B981]/8 border-[#10B981]/30 text-[#065F46]' : attempts < 3 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                  {isCorrectOrder
                    ? <><CheckCircle className="inline w-3.5 h-3.5 mr-1" />{storyScramble.successMessage}</>
                    : attempts < 3
                    ? <><XCircle className="inline w-3.5 h-3.5 mr-1" />Urutan belum tepat - slot merah perlu diperbaiki.</>
                    : <><Info className="inline w-3.5 h-3.5 mr-1" />Lihat slot yang benar: urutan 1 ke {storyScramble.fragments.length} sesuai alur logis cerita.</>}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-[#EEF2FF] rounded-full overflow-hidden">
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${(Object.keys(slots).length / storyScramble.fragments.length) * 100}%`,
                background: allFilled ? 'linear-gradient(90deg,#10B981,#059669)' : 'linear-gradient(90deg,#628ECB,#395886)',
              }}
            />
          </div>
          <span className={`text-[10px] font-bold shrink-0 ${allFilled ? 'text-[#10B981]' : 'text-[#395886]/50'}`}>
            {Object.keys(slots).length}/{storyScramble.fragments.length}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {!validated && (
            <button
              onClick={handleValidate}
              disabled={!allFilled}
              className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all
                ${allFilled ? 'bg-[#628ECB] text-white hover:bg-[#395886] shadow-sm' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'}`}
            >
              {allFilled ? 'Periksa Urutan Cerita' : `Letakkan ${storyScramble.fragments.length - Object.keys(slots).length} kartu lagi...`}
            </button>
          )}
          {validated && !isCorrectOrder && attempts < 3 && (
            <button onClick={handleRetry} className="w-full py-2.5 rounded-xl font-bold text-sm bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100 flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> Perbaiki Slot yang Salah
            </button>
          )}
        </div>

        {isTerminal && !isCorrectOrder && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 border-2 border-amber-200">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">Urutan yang Benar:</p>
            <ol className="space-y-1.5">
              {[...storyScramble.fragments].sort((a, b) => a.order - b.order).map(f => (
                <li key={f.id} className="flex items-start gap-2 text-xs text-amber-800">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-[10px] font-black">{f.order}</span>
                  <span className="leading-relaxed">{f.text}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {showPost && essayPrompt && (
          <EssayBox
            prompt={essayPrompt}
            objectiveLabel="X.TCP.1"
            submitLabel="Lanjut ke Aktivitas 2 - Process Chain"
            onSubmit={(text) => onComplete(text)}
          />
        )}
        {showPost && !essayPrompt && (
          <button
            onClick={() => onComplete(undefined)}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#628ECB] text-white font-bold text-sm hover:bg-[#395886] shadow-sm"
          >
            Lanjut ke Aktivitas 2 <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

type BoxItemType = 'courier' | 'tcp';

interface BoxItem {
  id: string;
  sourceId: string;
  type: BoxItemType;
  text: string;
  correctOrder: number;
}

const DRAG_TYPE_BOX = 'TWO_BOX_ITEM';

function BoxDraggableCard({ item }: { item: BoxItem }) {
  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE_BOX,
    item: { id: item.id, itemType: item.type },
    collect: m => ({ isDragging: m.isDragging() }),
  });
  const isCourier = item.type === 'courier';
  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`flex items-start gap-2 p-2.5 rounded-xl border-2 text-xs font-medium leading-relaxed select-none transition-all cursor-grab active:cursor-grabbing
        ${isCourier
          ? 'border-[#628ECB]/30 bg-[#EEF4FF] text-[#395886] hover:border-[#628ECB]/60'
          : 'border-[#10B981]/30 bg-[#ECFDF5] text-[#395886] hover:border-[#10B981]/60'}
        ${isDragging ? 'opacity-30 scale-95' : 'hover:shadow-sm hover:-translate-y-px'}`}
    >
      <GripVertical className="w-3.5 h-3.5 text-[#395886]/30 shrink-0 mt-0.5" />
      <span className="flex-1">{item.text}</span>
    </div>
  );
}

function BoxDropSlot({ slotNum, placedItem, validated, isCorrect, onDrop, onReturn, boxType }: {
  slotNum: number; placedItem?: BoxItem; validated: boolean; isCorrect?: boolean;
  onDrop: (slot: number, id: string) => void; onReturn: (slot: number) => void;
  boxType: BoxItemType;
}) {
  const isCourier = boxType === 'courier';
  const [{ isOver, canDrop }, drop] = useDrop<{ id: string; itemType: BoxItemType }, any, { isOver: boolean; canDrop: boolean }>({
    accept: DRAG_TYPE_BOX,
    canDrop: (d) => d.itemType === boxType,
    drop: (d) => onDrop(slotNum, d.id),
    collect: m => ({ isOver: m.isOver(), canDrop: m.canDrop() }),
  });
  const isActive = isOver && canDrop;

  return (
    <div className="flex items-stretch gap-2">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black mt-1.5
        ${validated
          ? isCorrect ? 'bg-[#10B981] text-white' : 'bg-red-400 text-white'
          : isCourier ? 'bg-[#628ECB]/15 text-[#628ECB]' : 'bg-[#10B981]/15 text-[#10B981]'}`}>
        {slotNum}
      </div>
      <div
        ref={drop as unknown as React.Ref<HTMLDivElement>}
        className={`flex-1 min-h-[52px] rounded-xl border-2 transition-all p-2.5
          ${isActive ? (isCourier ? 'border-[#628ECB] bg-[#628ECB]/8 shadow-md' : 'border-[#10B981] bg-[#10B981]/8 shadow-md') : ''}
          ${!placedItem && !isActive ? 'border-dashed border-[#D5DEEF] bg-[#F8FAFF]' : ''}
          ${placedItem && !validated && !isActive ? (isCourier ? 'border-[#628ECB]/40 bg-[#EEF4FF]' : 'border-[#10B981]/40 bg-[#ECFDF5]') : ''}
          ${validated && isCorrect ? 'border-[#10B981] bg-[#10B981]/8' : ''}
          ${validated && !isCorrect && placedItem ? 'border-red-300 bg-red-50' : ''}`}
      >
        {placedItem ? (
          <div className="flex items-start gap-2">
            <p className="flex-1 text-xs text-[#395886] leading-relaxed">{placedItem.text}</p>
            {!validated && (
              <button onClick={() => onReturn(slotNum)} className="shrink-0 text-[#395886]/30 hover:text-red-400 transition text-sm font-bold leading-none mt-0.5">x</button>
            )}
            {validated && isCorrect && <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />}
            {validated && !isCorrect && <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
          </div>
        ) : (
          <p className={`text-[10px] font-medium text-center py-2.5 transition-colors ${isActive ? (isCourier ? 'text-[#628ECB]' : 'text-[#10B981]') : 'text-[#395886]/30'}`}>
            {isActive ? '(drop)' : `Slot ${slotNum}`}
          </p>
        )}
      </div>
    </div>
  );
}

function OrderedProcessChain({ items, essayPrompt, lessonId, stageIndex, onComplete, initialData }: {
  items: AnalogyItem[]; essayPrompt?: string; lessonId: string; stageIndex: number;
  onComplete: (essayText?: string, currentSlots?: Record<string, string>) => void;
  initialData?: { slots?: Record<string, string>; validated?: boolean };
}) {
  const user = getCurrentUser();

  const allBoxItems = useMemo<BoxItem[]>(() => {
    const result: BoxItem[] = [];
    for (const item of items) {
      result.push({ id: `courier-${item.id}`, sourceId: item.id, type: 'courier', text: item.courierAnalogy || '...', correctOrder: item.correctOrder ?? 0 });
      result.push({ id: `tcp-${item.id}`, sourceId: item.id, type: 'tcp', text: item.text, correctOrder: item.correctOrder ?? 0 });
    }
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }, []);

  const [slots, setSlots] = useState<Record<string, string>>(initialData?.slots || {});
  const [validated, setValidated] = useState(initialData?.validated || false);
  const [attempts, setAttempts] = useState(0);
  const [showEssay, setShowEssay] = useState(false);

  useEffect(() => {
    getLessonProgress(user!.id, lessonId).then(p =>
      setAttempts(p.stageAttempts[`stage_${stageIndex}_analogy`] || 0)
    );
  }, []);

  useEffect(() => {
    if (initialData?.slots) setSlots(initialData.slots);
    if (initialData?.validated) setValidated(initialData.validated);
  }, [initialData]);

  const placedIds = new Set(Object.values(slots));
  const pool = allBoxItems.filter(it => !placedIds.has(it.id));
  const allPlaced = placedIds.size === allBoxItems.length;

  const getItemById = (id: string) => allBoxItems.find(it => it.id === id);

  const handleDrop = (boxType: BoxItemType, slotNum: number, itemId: string) => {
    if (validated) return;
    setSlots(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { if (next[k] === itemId) delete next[k]; });
      next[`${boxType}-${slotNum}`] = itemId;
      onComplete(undefined, next);
      return next;
    });
  };

  const handleReturn = (boxType: BoxItemType, slotNum: number) => {
    if (validated) return;
    setSlots(prev => {
      const next = { ...prev };
      delete next[`${boxType}-${slotNum}`];
      onComplete(undefined, next);
      return next;
    });
  };

  const isCorrectOrder = allPlaced && allBoxItems.every(item => slots[`${item.type}-${item.correctOrder}`] === item.id);

  const handleValidate = async () => {
    const ok = isCorrectOrder;
    const newA = await saveStageAttempt(user!.id, lessonId, stageIndex, ok, `stage_${stageIndex}_analogy`);
    setAttempts(newA);
    setValidated(true);
    onComplete(undefined, slots);
    if (isCorrectOrder || newA >= 3) setShowEssay(true);
  };

  const handleRetry = () => {
    const nextSlots = { ...slots };
    let hasChanges = false;
    Object.keys(nextSlots).forEach(key => {
      const item = getItemById(nextSlots[key]);
      const [type, order] = key.split('-');
      if (item?.type !== type || item?.correctOrder !== Number(order)) {
        delete nextSlots[key];
        hasChanges = true;
      }
    });
    if (hasChanges) {
      setSlots(nextSlots);
      onComplete(undefined, nextSlots);
    }
    setValidated(false);
  };
  const isTerminal = validated && (isCorrectOrder || attempts >= 3);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="bg-white rounded-2xl border-2 border-[#628ECB]/20 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 bg-[#628ECB]/8 border-b border-[#628ECB]/20">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#628ECB]/15">
            <BookOpen className="w-4 h-4 text-[#628ECB]" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]">Aktivitas 2 - Analogy Sorting (X.TCP.2)</p>
            <h3 className="text-sm font-bold text-[#395886]">Urutkan: Tugas Kurir & Fungsi TCP</h3>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold
            ${attempts >= 3 ? 'border-red-200 bg-red-50 text-red-500' : 'border-[#628ECB]/20 bg-white text-[#628ECB]'}`}>
            <AlertCircle className="w-3 h-3" />
            {attempts >= 3 ? 'Habis' : `${3 - attempts} percobaan`}
          </div>
        </div>
        <div className="px-5 py-4 bg-gradient-to-br from-[#628ECB]/5 to-transparent">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-[#628ECB] mt-0.5 shrink-0" />
            <p className="text-sm text-[#395886]/80 leading-relaxed">
              Seret setiap kartu ke kotak yang sesuai pada nomor slot yang tepat (1-6).
              Kartu <span className="font-bold text-[#628ECB]">biru</span> = tugas kurir, kartu <span className="font-bold text-[#10B981]">hijau</span> = fungsi TCP.
            </p>
          </div>
        </div>
      </div>

      {pool.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-[#D5DEEF] shadow-sm p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/50 mb-3">Kartu Tersedia ({pool.length})</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {pool.map(item => <BoxDraggableCard key={item.id} item={item} />)}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border-2 border-[#628ECB]/20 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3 bg-[#628ECB] text-white">
            <GripVertical className="w-4 h-4 opacity-80" />
            <h4 className="text-sm font-bold tracking-widest uppercase">Kurir</h4>
          </div>
          <div className="p-4 space-y-2">
            {Array.from({ length: items.length }, (_, i) => {
              const slotNum = i + 1;
              const placedId = slots[`courier-${slotNum}`];
              const placedItem = placedId ? getItemById(placedId) : undefined;
              const correct = validated && placedItem?.correctOrder === slotNum;
              return (
                <BoxDropSlot key={slotNum} slotNum={slotNum} placedItem={placedItem}
                  validated={validated} isCorrect={validated ? correct : undefined}
                  onDrop={(s, id) => handleDrop('courier', s, id)}
                  onReturn={s => handleReturn('courier', s)} boxType="courier" />
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-[#10B981]/20 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3 bg-[#10B981] text-white">
            <BookOpen className="w-4 h-4 opacity-80" />
            <h4 className="text-sm font-bold tracking-widest uppercase">TCP</h4>
          </div>
          <div className="p-4 space-y-2">
            {Array.from({ length: items.length }, (_, i) => {
              const slotNum = i + 1;
              const placedId = slots[`tcp-${slotNum}`];
              const placedItem = placedId ? getItemById(placedId) : undefined;
              const correct = validated && placedItem?.correctOrder === slotNum;
              return (
                <BoxDropSlot key={slotNum} slotNum={slotNum} placedItem={placedItem}
                  validated={validated} isCorrect={validated ? correct : undefined}
                  onDrop={(s, id) => handleDrop('tcp', s, id)}
                  onReturn={s => handleReturn('tcp', s)} boxType="tcp" />
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-[#EEF2FF] rounded-full overflow-hidden">
          <div className="h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(placedIds.size / allBoxItems.length) * 100}%`, background: allPlaced ? 'linear-gradient(90deg,#10B981,#059669)' : 'linear-gradient(90deg,#628ECB,#395886)' }} />
        </div>
        <span className={`text-[10px] font-bold shrink-0 ${allPlaced ? 'text-[#10B981]' : 'text-[#395886]/50'}`}>{placedIds.size}/{allBoxItems.length}</span>
      </div>

      <div className="space-y-3">
        {!validated && (
          <button onClick={handleValidate} disabled={!allPlaced}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${allPlaced ? 'bg-[#628ECB] text-white hover:bg-[#395886] shadow-sm' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'}`}>
            {allPlaced ? 'Periksa Jawaban' : `Tempatkan ${allBoxItems.length - placedIds.size} kartu lagi...`}
          </button>
        )}
        {validated && !isCorrectOrder && attempts < 3 && (
          <button onClick={handleRetry} className="w-full py-2.5 rounded-xl font-bold text-sm bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100 flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> Perbaiki Jawaban
          </button>
        )}
      </div>

      {validated && (
        <div className={`p-4 rounded-xl border-2 ${isCorrectOrder ? 'bg-[#ECFDF5] border-[#10B981]/30 text-[#065F46]' : attempts < 3 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
          <div className="flex items-start gap-3">
            {isCorrectOrder ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> : attempts < 3 ? <XCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <Info className="w-5 h-5 shrink-0 mt-0.5" />}
            <p className="text-sm font-bold">
              {isCorrectOrder ? 'Luar biasa! Semua kartu berada di kotak dan slot yang tepat.'
                : attempts < 3 ? `Masih ada yang salah posisi. Sisa ${3 - attempts} percobaan.`
                : 'Coba perhatikan kunci jawaban di bawah untuk memahami urutan yang benar.'}
            </p>
          </div>
        </div>
      )}

      {isTerminal && !isCorrectOrder && (
        <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-200 shadow-sm">
          <h4 className="text-xs font-black uppercase tracking-widest text-amber-600 mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" /> Kunci Jawaban
          </h4>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#628ECB] mb-2">Kotak Kurir</p>
              {[...items].sort((a, b) => (a.correctOrder ?? 0) - (b.correctOrder ?? 0)).map(it => (
                <div key={it.id} className="flex items-start gap-2 text-xs text-amber-800 p-2 rounded-lg bg-white/50 mb-1.5">
                  <span className="font-black text-amber-600 shrink-0">{it.correctOrder}.</span>
                  <span>{it.courierAnalogy}</span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#10B981] mb-2">Kotak TCP</p>
              {[...items].sort((a, b) => (a.correctOrder ?? 0) - (b.correctOrder ?? 0)).map(it => (
                <div key={it.id} className="flex items-start gap-2 text-xs text-amber-800 p-2 rounded-lg bg-white/50 mb-1.5">
                  <span className="font-black text-amber-600 shrink-0">{it.correctOrder}.</span>
                  <span>{it.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showEssay && essayPrompt && (
        <EssayBox prompt={essayPrompt} objectiveLabel="X.TCP.2" submitLabel="Selesai & Lanjutkan" onSubmit={(text) => onComplete(text)} />
      )}
      {showEssay && !essayPrompt && (
        <button onClick={() => onComplete(undefined)} className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#628ECB] text-white font-bold text-sm hover:bg-[#395886] shadow-sm">
          Lanjutkan ke Tahap Berikutnya <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

const DRAG_TYPE = 'ANALOGY_ITEM';

const analogyColorMap = {
  blue:   { border: 'border-[#628ECB]', bg: 'bg-[#628ECB]/8',  badge: 'bg-[#628ECB] text-white' },
  green:  { border: 'border-[#10B981]', bg: 'bg-[#10B981]/8',  badge: 'bg-[#10B981] text-white' },
  purple: { border: 'border-[#8B5CF6]', bg: 'bg-[#8B5CF6]/8',  badge: 'bg-[#8B5CF6] text-white' },
  amber:  { border: 'border-[#F59E0B]', bg: 'bg-[#F59E0B]/8',  badge: 'bg-[#F59E0B] text-white' },
};

function AnalogyChip({ item, placed, validated, isCorrect }: { item: AnalogyItem; placed: boolean; validated: boolean; isCorrect?: boolean }) {
  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE,
    item: { id: item.id },
    canDrag: !placed || !validated,
    collect: (m) => ({ isDragging: m.isDragging() }),
  });
  let cls = 'bg-white border-[#D5DEEF] cursor-move hover:border-[#628ECB]/60 hover:shadow-sm';
  if (placed && validated) {
    cls = isCorrect ? 'bg-[#10B981]/10 border-[#10B981] cursor-default' : 'bg-red-50 border-red-400 cursor-move';
  } else if (placed) {
    cls = 'bg-[#628ECB]/8 border-[#628ECB]/40 cursor-move';
  }
  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`flex items-center gap-2 px-3 py-2 border-2 rounded-xl text-xs font-medium text-[#395886] select-none transition-all ${cls} ${isDragging ? 'opacity-50' : ''}`}
    >
      {(!placed || !validated) && <GripVertical className="w-3.5 h-3.5 text-[#395886]/30 shrink-0" />}
      {placed && validated && (isCorrect ? <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />)}
      <span className="leading-snug">{item.text}</span>
    </div>
  );
}

function AnalogyBucket({ group, items, validated, onDrop }: { group: AnalogyGroup; items: AnalogyItem[]; validated: boolean; onDrop: (groupId: string, itemId: string) => void }) {
  const colors = analogyColorMap[group.colorClass];
  const [{ isOver }, drop] = useDrop({
    accept: DRAG_TYPE,
    drop: (dragged: { id: string }) => onDrop(group.id, dragged.id),
    collect: (m) => ({ isOver: m.isOver() }),
  });
  return (
    <div ref={drop as unknown as React.Ref<HTMLDivElement>} className={`rounded-2xl border-2 p-4 min-h-[140px] transition-all ${isOver ? `${colors.border} ${colors.bg} shadow-md` : 'border-[#D5DEEF] bg-[#F8FAFF]'}`}>
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mb-3 ${colors.badge}`}>{group.label}</div>
      {items.length === 0
        ? <p className="text-xs text-[#395886]/40 italic text-center py-4">Seret item ke sini</p>
        : <div className="space-y-2">{items.map(item => {
            const isCorrect = validated ? item.correctGroup === group.id : undefined;
            return <AnalogyChip key={item.id} item={item} placed validated={validated} isCorrect={isCorrect} />;
          })}</div>}
    </div>
  );
}

function GroupBucketContent({
  groups, items, essayPrompt, lessonId, stageIndex, onComplete, initialData,
}: {
  groups: AnalogyGroup[];
  items: AnalogyItem[];
  essayPrompt?: string;
  lessonId: string;
  stageIndex: number;
  onComplete: (essayText?: string, currentPlacement?: Record<string, string>) => void;
  initialData?: { placement?: Record<string, string>; validated?: boolean };
}) {
  const user = getCurrentUser();
  const [placement, setPlacement] = useState<Record<string, string>>(initialData?.placement || {});
  const [validated, setValidated] = useState(initialData?.validated || false);
  const [attempts, setAttempts] = useState(0);
  const [showEssay, setShowEssay] = useState(false);

  useEffect(() => {
    getLessonProgress(user!.id, lessonId).then((p) => {
      setAttempts(p.stageAttempts[`stage_${stageIndex}_analogy`] || 0);
    });
  }, []);

  useEffect(() => {
    if (initialData?.placement) setPlacement(initialData.placement);
    if (initialData?.validated) setValidated(initialData.validated);
  }, [initialData]);

  const unplaced = items.filter(it => !placement[it.id]);
  const itemsInGroup = (gid: string) => items.filter(it => placement[it.id] === gid);
  const allPlaced = unplaced.length === 0;
  const correctCount = validated ? items.filter(it => placement[it.id] === it.correctGroup).length : 0;
  const allCorrect = validated && correctCount === items.length;
  const showExplanation = validated && (allCorrect || attempts >= 3);

  useEffect(() => {
    if (showExplanation && !showEssay) setShowEssay(true);
  }, [showExplanation]);

  const handleDrop = (groupId: string, itemId: string) => {
    if (validated) return;
    setPlacement(prev => {
      const next = { ...prev, [itemId]: groupId };
      onComplete(undefined, next);
      return next;
    });
  };

  const handleValidate = async () => {
    const isCorrect = items.every(it => placement[it.id] === it.correctGroup);
    const newAttempts = await saveStageAttempt(user!.id, lessonId, stageIndex, isCorrect, `stage_${stageIndex}_analogy`);
    setAttempts(newAttempts);
    setValidated(true);
    onComplete(undefined, placement);
  };

  const handleRetry = () => {
    const wrong = items.filter(it => placement[it.id] !== it.correctGroup);
    const next = { ...placement };
    wrong.forEach(it => delete next[it.id]);
    setPlacement(next);
    setValidated(false);
  };

  const progress = items.length > 0 ? Object.keys(placement).length / items.length : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="bg-white rounded-2xl border-2 border-[#F59E0B]/20 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 bg-[#F59E0B]/8 border-b border-[#F59E0B]/20">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F59E0B]/15">
            <BookOpen className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B]">Aktivitas 2 - Analogy Sorting (X.TCP.2)</p>
            <h3 className="text-sm font-bold text-[#395886]">Kelompokkan: Tugas Kurir vs Fungsi TCP</h3>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold
            ${attempts >= 3 ? 'border-red-200 bg-red-50 text-red-500' : 'border-[#F59E0B]/20 bg-white text-[#F59E0B]'}`}>
            <AlertCircle className="w-3 h-3" />
            {attempts >= 3 ? 'Habis' : `${3 - attempts} percobaan`}
          </div>
        </div>
        <div className="px-5 py-4 bg-gradient-to-br from-[#F59E0B]/5 to-transparent">
          <p className="text-sm text-[#395886]/80 leading-relaxed">
            Seret setiap kartu ke kelompok yang tepat - apakah ini <strong>tugas kurir fisik</strong> atau <strong>fungsi protokol TCP</strong>?
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-[#D5DEEF] shadow-sm p-5">
        <div className="mb-5">
          <div className="flex justify-between text-xs text-[#395886]/60 mb-1.5">
            <span>Item ditempatkan</span><span>{Object.keys(placement).length} / {items.length}</span>
          </div>
          <div className="h-2 w-full bg-[#D5DEEF] rounded-full overflow-hidden">
            <div className="h-2 bg-[#F59E0B] rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>

        {unplaced.length > 0 && !showExplanation && (
          <div className="mb-5 p-4 bg-[#F8FAFD] rounded-xl border-2 border-dashed border-[#D5DEEF]">
            <p className="text-xs font-bold text-[#395886]/60 mb-3 uppercase tracking-wide">Item tersedia ({unplaced.length})</p>
            <div className="flex flex-wrap gap-2">
              {unplaced.map(item => <AnalogyChip key={item.id} item={item} placed={false} validated={false} />)}
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          {groups.map(group => (
            <AnalogyBucket key={group.id} group={group} items={itemsInGroup(group.id)} validated={validated || attempts >= 3} onDrop={handleDrop} />
          ))}
        </div>

        {showExplanation && (
          <div className="mb-5 p-4 rounded-2xl bg-[#628ECB]/5 border-2 border-[#628ECB]/20 border-dashed">
            <p className="text-xs font-bold text-[#395886]/60 mb-3 uppercase tracking-widest text-center">Kunci Jawaban</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {items.map(item => {
                const group = groups.find(g => g.id === item.correctGroup);
                const colors = analogyColorMap[group?.colorClass || 'blue'];
                return (
                  <div key={item.id} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#D5DEEF] shadow-sm gap-2">
                    <span className="text-xs font-medium text-[#395886] flex-1">{item.text}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${colors.badge}`}>{group?.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {validated && (
          <div className={`mb-5 p-4 rounded-xl border-2 ${allCorrect ? 'bg-[#10B981]/8 border-[#10B981]/40' : attempts < 3 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-start gap-3">
              {allCorrect ? <CheckCircle className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" /> : attempts < 3 ? <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /> : <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
              <p className={`text-sm font-bold ${allCorrect ? 'text-[#10B981]' : attempts < 3 ? 'text-red-800' : 'text-amber-800'}`}>
                {allCorrect ? `Sempurna! Semua ${items.length} item dikelompokkan dengan benar.` : attempts < 3 ? `${correctCount}/${items.length} item benar. Punya ${3 - attempts} kesempatan lagi!` : 'Pelajari kunci jawaban di atas.'}
              </p>
            </div>
            {!allCorrect && attempts < 3 && (
              <button onClick={handleRetry} className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 ml-8">
                <RotateCcw className="w-3.5 h-3.5" /> Perbaiki Pengelompokan
              </button>
            )}
          </div>
        )}

        {!showExplanation && (
          <button onClick={handleValidate} disabled={!allPlaced} className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${allPlaced ? 'bg-[#F59E0B] text-white hover:bg-[#D97706] shadow-sm' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'}`}>
            Periksa Pengelompokan
          </button>
        )}

        {showEssay && essayPrompt && (
          <EssayBox prompt={essayPrompt} objectiveLabel="X.TCP.2" submitLabel="Selesai & Lanjutkan" onSubmit={(text) => onComplete(text)} />
        )}
        {showExplanation && !essayPrompt && (
          <button onClick={() => onComplete(undefined)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#628ECB] text-white font-bold text-sm hover:bg-[#395886] shadow-sm transition-all">
            {allCorrect ? 'Lanjutkan ke Tahap Berikutnya' : 'Selesai & Lanjut'} <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function AnalogyContent(props: {
  groups: AnalogyGroup[];
  items: AnalogyItem[];
  essayPrompt?: string;
  lessonId: string;
  stageIndex: number;
  onComplete: (essayText?: string, state?: any) => void;
  initialData?: any;
}) {
  const { groups, items, essayPrompt, lessonId, stageIndex, onComplete, initialData } = props;
  const isOrderedMode = items.length > 0 && items.every(it => it.correctOrder !== undefined);
  if (isOrderedMode) {
    return <OrderedProcessChain items={items} essayPrompt={essayPrompt} lessonId={lessonId} stageIndex={stageIndex} onComplete={onComplete} initialData={initialData} />;
  }
  return <GroupBucketContent groups={groups} items={items} essayPrompt={essayPrompt} lessonId={lessonId} stageIndex={stageIndex} onComplete={onComplete} initialData={initialData} />;
}

function AnalogyPhase(props: {
  groups: AnalogyGroup[];
  items: AnalogyItem[];
  essayPrompt?: string;
  lessonId: string;
  stageIndex: number;
  onComplete: (essayText?: string, state?: any) => void;
  initialData?: any;
}) {
  return <AnalogyContent {...props} />;
}

function MCQPhase({
  apersepsi, question, options, correctAnswer, feedback, videoUrl, lessonId, stageIndex, onComplete, initialData,
}: Omit<ConstructivismStageProps, 'storyScramble' | 'analogySortGroups' | 'analogySortItems' | 'constructivismEssay1' | 'constructivismEssay2'> & { initialData?: { selectedOption?: string; reason?: string; submitted?: boolean } }) {
  const user = getCurrentUser();
  const [selectedOption, setSelectedOption] = useState(initialData?.selectedOption || '');
  const [reason, setReason] = useState(initialData?.reason || '');
  const [submitted, setSubmitted] = useState(initialData?.submitted || false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    getLessonProgress(user!.id, lessonId).then((p) => {
      setAttempts(p.stageAttempts[`stage_${stageIndex}`] || 0);
    });
  }, []);

  useEffect(() => {
    if (initialData?.selectedOption) setSelectedOption(initialData.selectedOption);
    if (initialData?.reason) setReason(initialData.reason);
    if (initialData?.submitted) setSubmitted(initialData.submitted);
  }, [initialData]);

  const isCorrect = selectedOption === correctAnswer;
  const showExplanation = submitted && (isCorrect || attempts >= 3);

  const handleSubmit = async () => {
    if (!selectedOption) { setError('Pilih salah satu jawaban terlebih dahulu.'); return; }
    if (reason.trim().length < 10) { setError('Tuliskan alasan minimal 10 karakter.'); return; }
    setError('');
    const newAttempts = await saveStageAttempt(user!.id, lessonId, stageIndex, selectedOption === correctAnswer);
    setAttempts(newAttempts);
    setSubmitted(true);
    onComplete({ selectedOption, reason, isCorrect: selectedOption === correctAnswer });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="bg-white rounded-2xl border-2 border-[#628ECB]/20 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 bg-[#628ECB]/8 border-b border-[#628ECB]/20">
          <PlayCircle className="w-4 h-4 text-[#628ECB]" />
          <h3 className="text-sm font-bold text-[#395886]">Konteks Pembelajaran</h3>
        </div>
        <div className="p-0">
          {videoUrl ? (
            <div className="aspect-video w-full bg-black">
              {getYouTubeId(videoUrl) ? (
                <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}`} title="Video" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              ) : <div className="w-full h-full flex items-center justify-center text-white text-sm">Video tidak dapat dimuat</div>}
            </div>
          ) : (
            <div className="px-5 py-6 bg-gradient-to-br from-[#628ECB]/5 to-transparent">
              <div className="flex items-start gap-4">
                <Lightbulb className="w-5 h-5 text-[#628ECB] mt-0.5 shrink-0" />
                <p className="text-[#395886]/80 leading-relaxed text-sm italic">"{apersepsi}"</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-[#D5DEEF] shadow-sm p-5">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-[#628ECB] mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#628ECB] mb-0.5">Pertanyaan Pemantik</p>
              <p className="text-[#395886] font-semibold text-sm leading-relaxed">{question}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#628ECB]/5 border border-[#628ECB]/20 shrink-0 ml-3">
            <AlertCircle className="w-3.5 h-3.5 text-[#628ECB]" />
            <span className="text-[10px] font-bold text-[#628ECB]">{attempts < 3 ? `${3 - attempts} Percobaan` : 'Habis'}</span>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          {options.map(option => {
            const isSelected = selectedOption === option.id;
            const isThisCorrect = option.id === correctAnswer;
            let borderCls = 'border-[#D5DEEF] hover:border-[#628ECB]/50';
            let bgCls = '';
            if (showExplanation) { if (isThisCorrect) { borderCls = 'border-[#10B981]'; bgCls = 'bg-[#10B981]/8'; } else if (isSelected) { borderCls = 'border-red-400'; bgCls = 'bg-red-50'; } }
            else if (submitted) { if (isSelected) { borderCls = isCorrect ? 'border-[#10B981]' : 'border-red-400'; bgCls = isCorrect ? 'bg-[#10B981]/8' : 'bg-red-50'; } }
            else if (isSelected) { borderCls = 'border-[#628ECB]'; bgCls = 'bg-[#628ECB]/8'; }
            return (
              <label key={option.id} className={`flex items-start gap-3 p-3.5 border-2 rounded-xl cursor-pointer transition-all ${borderCls} ${bgCls}`}>
                <input type="radio" name="constructivism" value={option.id} checked={isSelected} onChange={() => { if (!submitted) { setSelectedOption(option.id); setError(''); } }} disabled={submitted} className="mt-0.5 accent-[#628ECB]" />
                <span className="flex-1 text-[#395886] text-[13px] leading-relaxed">{option.text}</span>
                {showExplanation && isThisCorrect && <CheckCircle className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />}
                {submitted && isSelected && !isThisCorrect && <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
              </label>
            );
          })}
        </div>

        {submitted && feedback && (
          <div className={`rounded-xl p-3.5 mb-5 border-2 ${isCorrect ? 'bg-[#10B981]/8 border-[#10B981]/40' : attempts < 3 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-start gap-3">
              {isCorrect ? <CheckCircle className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" /> : attempts < 3 ? <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /> : <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
              <p className={`text-[13px] ${isCorrect ? 'text-[#10B981]' : attempts < 3 ? 'text-red-700' : 'text-amber-800'}`}>
                {isCorrect ? feedback.correct : attempts >= 3 ? feedback.correct : feedback.incorrect}
              </p>
            </div>
          </div>
        )}

        <div className="mb-5">
          <label className="block text-[13px] font-bold text-[#395886] mb-1.5">Tuliskan alasanmu memilih jawaban tersebut:</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} disabled={submitted} rows={3} className="w-full px-4 py-2.5 border-2 border-[#D5DEEF] rounded-xl text-[13px] text-[#395886] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30 focus:border-[#628ECB] transition disabled:bg-[#F0F3FA] resize-none" placeholder="Jelaskan mengapa kamu memilih jawaban tersebut..." />
          <p className={`text-[11px] mt-1 ${reason.trim().length >= 10 ? 'text-[#10B981]' : 'text-[#395886]/50'}`}>{reason.trim().length} karakter (minimal 10)</p>
        </div>

        {error && <div className="bg-red-50 border-2 border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-xl mb-4">{error}</div>}

        {!submitted ? (
          <button onClick={handleSubmit} disabled={!selectedOption || reason.trim().length < 10} className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${selectedOption && reason.trim().length >= 10 ? 'bg-[#628ECB] text-white hover:bg-[#395886]' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'}`}>
            Periksa Jawaban
          </button>
        ) : (
          <button onClick={() => onComplete({ selectedOption, reason, isCorrect })} className="w-full py-2.5 rounded-xl bg-[#628ECB] text-white font-semibold text-sm hover:bg-[#395886] transition-all flex items-center justify-center gap-2 shadow-sm">
            Lanjutkan ke Tahap Berikutnya <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export function ConstructivismStage(props: ConstructivismStageProps) {
  const {
    storyScramble, analogySortGroups, analogySortItems,
    lessonId, stageIndex, onComplete,
    constructivismEssay1, constructivismEssay2,
    videoUrl, apersepsi, isCompleted,
  } = props;
  const tracker = useActivityTracker({
    lessonId,
    stageIndex,
    stageType: 'constructivism',
  });

  const [phase, setPhase] = useState<'scramble' | 'analogy' | 'mcq'>(() => {
    if (storyScramble) return 'scramble';
    if (analogySortGroups?.length) return 'analogy';
    return 'mcq';
  });

  const [essay1Text, setEssay1Text] = useState('');
  const [scrambleData, setScrambleData] = useState<any>(null);
  const [analogyData, setAnalogyData] = useState<any>(null);
  const [mcqData, setMcqData] = useState<any>(null);
  const [isRestored, setIsRestored] = useState(false);
  const [courierCompleted, setCourierCompleted] = useState(false);

  const hasEssayFlow = !!(constructivismEssay1 || constructivismEssay2);

  useEffect(() => {
    if (!tracker.isLoading && tracker.session?.latestSnapshot && !isRestored) {
      const snap = tracker.session.latestSnapshot;
      if (snap.phase) setPhase(snap.phase);
      if (snap.essay1Text) setEssay1Text(snap.essay1Text);
      if (snap.scrambleData) setScrambleData(snap.scrambleData);
      if (snap.analogyData) setAnalogyData(snap.analogyData);
      if (snap.mcqData) setMcqData(snap.mcqData);
      setIsRestored(true);
    } else if (!tracker.isLoading) {
      setIsRestored(true);
    }
  }, [tracker.isLoading, tracker.session, isRestored]);

  useEffect(() => {
    if (!isRestored) return;
    const progressMap = { scramble: 20, analogy: 55, mcq: 80 } as const;
    void tracker.saveSnapshot(
      {
        phase,
        essay1Text,
        scrambleData,
        analogyData,
        mcqData,
        hasStoryScramble: !!storyScramble,
        hasAnalogy: !!analogySortGroups?.length,
        hasEssayFlow,
      },
      { progressPercent: progressMap[phase] },
    );
  }, [analogyData, analogySortGroups?.length, essay1Text, hasEssayFlow, isRestored, mcqData, phase, scrambleData, storyScramble, tracker]);

  const SkipButton = ({ targetPhase, nextLabel }: { targetPhase?: 'analogy' | 'mcq' | 'complete'; nextLabel: string }) => {
    if (!isCompleted) return null;
    return (
      <div className="flex justify-center my-6">
        <button
          onClick={() => {
            if (targetPhase === 'complete') onComplete({});
            else if (targetPhase) setPhase(targetPhase);
          }}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#10B981] text-white font-black text-sm hover:bg-[#059669] transition-all shadow-xl shadow-[#10B981]/20 active:scale-95"
        >
          {nextLabel} <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  if (tracker.isLoading || !isRestored) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-[#628ECB] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-[#395886]">Memuat progres...</p>
      </div>
    );
  }

  if (phase === 'scramble' && storyScramble) {
    if (lessonId === '1' && !courierCompleted) {
      return (
        <div className="space-y-4">
          <CourierDefinition onComplete={() => setCourierCompleted(true)} />
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <StoryScramblePhase
          storyScramble={storyScramble}
          videoUrl={videoUrl}
          apersepsi={apersepsi}
          essayPrompt={constructivismEssay1}
          lessonId={lessonId}
          stageIndex={stageIndex}
          initialData={scrambleData}
          onComplete={(essayText, currentSlots) => {
            if (essayText !== undefined) setEssay1Text(essayText);
            if (currentSlots !== undefined) setScrambleData({ slots: currentSlots, validated: true });
            
            if (essayText !== undefined) {
              if (analogySortGroups?.length) {
                void tracker.trackEvent('constructivism_scramble_completed', { hasEssay: !!essayText }, { progressPercent: 45 });
                setPhase('analogy');
              } else if (hasEssayFlow || !props.options?.length) {
                const finalAnswer = { essay1: essayText, summary: essayText };
                void tracker.complete(finalAnswer, { phase: 'scramble', finalAnswer });
                onComplete(finalAnswer);
              } else {
                void tracker.trackEvent('constructivism_scramble_completed', { hasEssay: !!essayText }, { progressPercent: 70 });
                setPhase('mcq');
              }
            } else if (currentSlots) {
              setScrambleData({ slots: currentSlots });
            }
          }}
        />
        <SkipButton
          targetPhase={analogySortGroups?.length ? 'analogy' : props.options?.length ? 'mcq' : 'complete'}
          nextLabel={analogySortGroups?.length ? 'Lanjut ke Process Chain' : props.options?.length ? 'Lanjut ke Pertanyaan' : 'Selesaikan Tahap Ini'}
        />
      </div>
    );
  }

  if (phase === 'analogy' && analogySortGroups?.length && analogySortItems?.length) {
    return (
      <div className="space-y-4">
        <AnalogyPhase
          groups={analogySortGroups}
          items={analogySortItems}
          essayPrompt={constructivismEssay2}
          lessonId={lessonId}
          stageIndex={stageIndex}
          initialData={analogyData}
          onComplete={(essayText, currentState) => {
            if (currentState !== undefined) setAnalogyData({ ...currentState, validated: true });

            if (essayText !== undefined) {
              if (hasEssayFlow || !props.options?.length || !!storyScramble) {
                const finalAnswer = { essay1: essay1Text, essay2: essayText, summary: essayText };
                void tracker.complete(finalAnswer, { phase: 'analogy', finalAnswer });
                onComplete(finalAnswer);
              } else {
                void tracker.trackEvent('constructivism_analogy_completed', { hasEssay: !!essayText }, { progressPercent: 80 });
                setPhase('mcq');
              }
            } else if (currentState) {
              setAnalogyData(currentState);
            }
          }}
        />
        <SkipButton
          targetPhase={props.options?.length ? 'mcq' : 'complete'}
          nextLabel={props.options?.length ? 'Lanjut ke Pertanyaan' : 'Selesaikan Tahap Ini'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MCQPhase
        {...props}
        initialData={mcqData}
        onComplete={(answer) => {
          setMcqData({ ...answer, submitted: true });
          const finalAnswer = { ...answer, summary: answer.reason };
          void tracker.complete(finalAnswer, { phase: 'mcq', finalAnswer });
          onComplete(finalAnswer);
        }}
      />
      <SkipButton targetPhase="complete" nextLabel="Selesaikan Tahap Ini" />
    </div>
  );
}
