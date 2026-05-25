import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown, ChevronRight, CheckCircle, XCircle, RotateCcw, BookOpen,
  GripVertical, Info, AlertCircle, Layers, Tag, ArrowRight, PenLine,
  Link as LinkIcon, GraduationCap, Lightbulb, Database, Zap, Network, ShieldCheck
} from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import { getCurrentUser } from '../../utils/auth';
import { getLessonProgress, saveStageAttempt } from '../../utils/progress';
import { Ipv4Analyzer } from '../ui/Ipv4Analyzer';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { EssayBox, ContinueActivityButton, ATPConclusionBox, IndicatorSummaryCard } from './StageKit';

// -- Types ----------------------------------------------------------------------

interface ExplorationSection { id: string; title: string; content: string; example?: string }
interface Group { id: string; label: string; colorClass: 'blue' | 'green' | 'purple' | 'amber' | 'pink' | 'indigo' }
interface GroupItem { id: string; text: string; correctGroup: string }
interface FlowItem { id: string; text: string; correctOrder: number; description?: string; colorClass?: string }
interface MatchingPair { left: string; right: string }
interface MatchingState {
  matches: Record<string, string>;
  validated?: boolean;
  attempts?: number;
  correctCount?: number;
  showArgument?: boolean;
}

interface InquiryStageProps {
  material?: {
    title: string;
    content: string[];
    examples?: string[];
    osiLayers?: Array<{ name: string; number: number; mapsTo: string; desc: string }>;
  };
  explorationSections?: ExplorationSection[];
  groups?: Group[];
  groupItems?: GroupItem[];
  flowItems?: FlowItem[];
  flowInstruction?: string;
  matchingPairs?: MatchingPair[];
  question?: string;
  labelingSlots?: any;
  labelingLabels?: any;
  inquiryReflection1?: string;
  inquiryReflection2?: string;
  conclusionPrompt?: string;
  lessonId: string;
  stageIndex: number;
  onComplete: (answer: any) => void;
  isCompleted?: boolean;
  onTrackerPhase?: (phase: 'consistency' | 'arguing' | 'conclusion') => void;
}

// -- Color maps -----------------------------------------------------------------

const colorMap = {
  blue:   { border: 'border-[#628ECB]', bg: 'bg-[#628ECB]/8', badge: 'bg-[#628ECB] text-white', light: 'bg-[#628ECB]/15 text-[#395886]', text: 'text-[#395886]' },
  green:  { border: 'border-[#10B981]', bg: 'bg-[#10B981]/8', badge: 'bg-[#10B981] text-white', light: 'bg-[#10B981]/15 text-[#065F46]', text: 'text-[#065F46]' },
  purple: { border: 'border-[#8B5CF6]', bg: 'bg-[#8B5CF6]/8', badge: 'bg-[#8B5CF6] text-white', light: 'bg-[#8B5CF6]/15 text-[#4C1D95]', text: 'text-[#4C1D95]' },
  amber:  { border: 'border-[#F59E0B]', bg: 'bg-[#F59E0B]/8', badge: 'bg-[#F59E0B] text-white', light: 'bg-[#F59E0B]/15 text-[#78350F]', text: 'text-[#78350F]' },
  pink:   { border: 'border-[#EC4899]', bg: 'bg-[#EC4899]/8', badge: 'bg-[#EC4899] text-white', light: 'bg-[#EC4899]/15 text-[#831843]', text: 'text-[#831843]' },
  indigo: { border: 'border-[#6366F1]', bg: 'bg-[#6366F1]/8', badge: 'bg-[#6366F1] text-white', light: 'bg-[#6366F1]/15 text-[#312E81]', text: 'text-[#312E81]' },
};

const flowLayerColors: Record<string, { gradient: string; borderB: string }> = {
  purple: { gradient: 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED]', borderB: 'border-b-[#6D28D9]' },
  blue:   { gradient: 'bg-gradient-to-r from-[#628ECB] to-[#395886]', borderB: 'border-b-[#1E3A5F]' },
  green:  { gradient: 'bg-gradient-to-r from-[#10B981] to-[#059669]', borderB: 'border-b-[#047857]' },
  amber:  { gradient: 'bg-gradient-to-r from-[#F59E0B] to-[#D97706]', borderB: 'border-b-[#B45309]' },
  pink:   { gradient: 'bg-gradient-to-r from-[#EC4899] to-[#DB2777]', borderB: 'border-b-[#9D174D]' },
  indigo: { gradient: 'bg-gradient-to-r from-[#6366F1] to-[#4F46E5]', borderB: 'border-b-[#3730A3]' },
};

const inquiryMatchPalette = [
  { bg: 'bg-violet-50', border: 'border-violet-300', activeBorder: 'border-violet-500', text: 'text-violet-700', iconBg: 'bg-violet-500', ring: 'ring-violet-200', dot: 'bg-violet-400', badge: 'bg-violet-500 text-white' },
  { bg: 'bg-sky-50', border: 'border-sky-300', activeBorder: 'border-sky-500', text: 'text-sky-700', iconBg: 'bg-sky-500', ring: 'ring-sky-200', dot: 'bg-sky-400', badge: 'bg-sky-500 text-white' },
  { bg: 'bg-emerald-50', border: 'border-emerald-300', activeBorder: 'border-emerald-500', text: 'text-emerald-700', iconBg: 'bg-emerald-500', ring: 'ring-emerald-200', dot: 'bg-emerald-400', badge: 'bg-emerald-500 text-white' },
  { bg: 'bg-amber-50', border: 'border-amber-300', activeBorder: 'border-amber-500', text: 'text-amber-700', iconBg: 'bg-amber-500', ring: 'ring-amber-200', dot: 'bg-amber-400', badge: 'bg-amber-500 text-white' },
  { bg: 'bg-indigo-50', border: 'border-indigo-300', activeBorder: 'border-indigo-500', text: 'text-indigo-700', iconBg: 'bg-indigo-500', ring: 'ring-indigo-200', dot: 'bg-indigo-400', badge: 'bg-indigo-500 text-white' },
  { bg: 'bg-rose-50', border: 'border-rose-300', activeBorder: 'border-rose-500', text: 'text-rose-700', iconBg: 'bg-rose-500', ring: 'ring-rose-200', dot: 'bg-rose-400', badge: 'bg-rose-500 text-white' },
] as const;

const inquiryPairIcons = [
  <Network className="w-4 h-4" />,
  <ArrowRight className="w-4 h-4" />,
  <Zap className="w-4 h-4" />,
  <Layers className="w-4 h-4" />,
  <ShieldCheck className="w-4 h-4" />,
  <Database className="w-4 h-4" />,
];

// -- Standardized Essay Box (Uses unified StageKit EssayBox) --------------------

function InquiryEssayBox({
  prompt, objectiveLabel, submitLabel, onSubmit, minWords = 20,
  defaultValue = '', disabled = false, headerLabel,
}: {
  prompt: string; objectiveLabel: string; submitLabel: string; onSubmit: (text: string) => void; minWords?: number;
  defaultValue?: string; disabled?: boolean; headerLabel?: string;
}) {
  return (
    <div className="mt-5">
      <EssayBox
        objectiveLabel={objectiveLabel}
        prompt={prompt}
        submitLabel={submitLabel}
        minWords={minWords}
        onSubmit={onSubmit}
        defaultValue={defaultValue}
        disabled={disabled}
        {...(headerLabel ? { headerLabel } : {})}
      />
    </div>
  );
}

// -- DnD Components ------------------------------------------------------------

const DRAG_LAYER = 'LAYER_SORT_CARD';
function DraggableFlowCard({ item }: { item: FlowItem }) {
  const colors = flowLayerColors[(item.colorClass as keyof typeof flowLayerColors) || 'blue'] || flowLayerColors.blue;
  const [{ isDragging }, drag] = useDrag({
    type: DRAG_LAYER,
    item: { id: item.id },
    collect: m => ({ isDragging: m.isDragging() }),
  });
  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border-b-4 text-white font-bold text-sm select-none transition-all
        ${colors.gradient} ${colors.borderB}
        ${isDragging ? 'opacity-40 scale-90 cursor-grabbing shadow-2xl' : 'cursor-grab hover:scale-105 hover:-translate-y-1 shadow-md hover:shadow-xl'}`}
    >
      <GripVertical className="w-4 h-4 opacity-60 shrink-0" />
      <span className="tracking-tight">{item.text}</span>
    </div>
  );
}

function FlowDropSlot({ position, placedItem, validated, isCorrect, onDrop }: {
  position: number; placedItem?: FlowItem; validated: boolean; isCorrect?: boolean;
  onDrop: (pos: number, id: string) => void;
}) {
  const [{ isOver }, drop] = useDrop({
    accept: DRAG_LAYER,
    drop: (d: { id: string }) => onDrop(position, d.id),
    collect: m => ({ isOver: m.isOver() }),
  });
  const colors = placedItem ? flowLayerColors[(placedItem.colorClass as keyof typeof flowLayerColors) || 'blue'] : null;

  return (
    <div ref={drop as unknown as React.Ref<HTMLDivElement>} className="flex items-stretch gap-3">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black transition-all duration-300
        ${validated
          ? isCorrect ? 'bg-[#10B981] text-white ring-2 ring-[#10B981]/30 shadow-md' : 'bg-red-400 text-white ring-2 ring-red-400/30'
          : placedItem ? 'bg-[#628ECB] text-white shadow-sm' : 'bg-[#EEF2FF] text-[#395886]/30 border-2 border-dashed border-[#D5DEEF]'}`}
      >
        {position}
      </div>
      <div className={`flex-1 rounded-2xl border-2 transition-all duration-300 min-h-[52px]
        ${isOver ? 'border-[#628ECB] bg-[#628ECB]/12 shadow-[0_0_28px_rgba(98,142,203,0.35)] scale-[1.015] ring-2 ring-[#628ECB]/25' :
          placedItem ? 'border-transparent' : 'border-dashed border-[#D5DEEF] bg-[#F8FAFF] dnd-empty-indicator'}`}
      >
        {placedItem && colors ? (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl h-full ${colors.gradient} text-white border-b-4 ${colors.borderB} shadow-sm`}>
            <span className="font-bold text-sm flex-1 tracking-tight">{placedItem.text}</span>
            {validated && (isCorrect ? <CheckCircle className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />)}
          </div>
        ) : (
          <div className={`flex items-center justify-center h-full text-[10px] font-black uppercase transition-colors py-3
            ${isOver ? 'text-[#628ECB]' : 'text-[#395886]/20'}`}
          >
            {isOver ? '(drop)' : `Posisi ${position}`}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sequence-themed Draggable Card (TCP Sequence Number activities) ───────────

function SequenceDraggableCard({ item }: { item: FlowItem }) {
  const [{ isDragging }, drag] = useDrag({
    type: DRAG_LAYER,
    item: { id: item.id },
    collect: m => ({ isDragging: m.isDragging() }),
  });
  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 bg-white select-none transition-all group
        ${isDragging
          ? 'opacity-40 scale-95 cursor-grabbing border-[#628ECB]/60 shadow-lg'
          : 'cursor-grab hover:scale-[1.015] hover:-translate-y-0.5 hover:shadow-md border-[#628ECB]/20 hover:border-[#628ECB]/50 shadow-sm'}`}
    >
      <GripVertical className="w-4 h-4 text-[#395886]/25 group-hover:text-[#628ECB]/40 shrink-0 transition-colors" />
      <div className="w-px h-7 bg-gradient-to-b from-[#628ECB] to-[#395886]/20 rounded-full shrink-0" />
      <span className="text-xs font-bold text-[#395886] leading-relaxed flex-1">{item.text}</span>
    </div>
  );
}

// ── Sequence-themed Drop Slot ─────────────────────────────────────────────────

function SequenceDropSlot({ position, placedItem, validated, isCorrect, onDrop }: {
  position: number; placedItem?: FlowItem; validated: boolean; isCorrect?: boolean;
  onDrop: (pos: number, id: string) => void;
}) {
  const [{ isOver }, drop] = useDrop({
    accept: DRAG_LAYER,
    drop: (d: { id: string }) => onDrop(position, d.id),
    collect: m => ({ isOver: m.isOver() }),
  });
  return (
    <div ref={drop as unknown as React.Ref<HTMLDivElement>} className="flex items-stretch gap-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black transition-all duration-300
        ${validated
          ? isCorrect
            ? 'bg-[#10B981] text-white shadow-md'
            : 'bg-red-400 text-white shadow-md'
          : placedItem
            ? 'bg-[#395886] text-white shadow-sm'
            : 'bg-white text-[#395886]/30 border-2 border-dashed border-[#D5DEEF]'}`}
      >
        {position}
      </div>
      <div className={`flex-1 rounded-xl border-2 transition-all duration-300 min-h-[52px]
        ${isOver
          ? 'border-[#628ECB] bg-[#EEF4FF] shadow-[0_0_20px_rgba(98,142,203,0.18)] ring-1 ring-[#628ECB]/20'
          : placedItem
            ? 'border-[#628ECB]/25 bg-white shadow-sm'
            : 'border-dashed border-[#D5DEEF] bg-[#F8FAFF]'}`}
      >
        {placedItem ? (
          <div className="flex items-center gap-3 px-4 py-3 h-full">
            <div className="w-1 h-7 rounded-full bg-gradient-to-b from-[#628ECB] to-[#395886]/20 shrink-0" />
            <span className="text-xs font-bold text-[#395886] leading-relaxed flex-1">{placedItem.text}</span>
            {validated && (isCorrect
              ? <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" />
              : <XCircle className="w-4 h-4 text-red-400 shrink-0" />)}
          </div>
        ) : (
          <div className={`flex items-center justify-center h-full text-[10px] font-bold uppercase tracking-wide py-3
            ${isOver ? 'text-[#628ECB]' : 'text-[#395886]/20'}`}>
            {isOver ? '— lepaskan di sini —' : `Langkah ke-${position}`}
          </div>
        )}
      </div>
    </div>
  );
}

// ── DragDropLayerSorter ───────────────────────────────────────────────────────

function DragDropLayerSorter({ flowItems, lessonId, stageIndex, onComplete, onNext, initialData, title, instruction, theme }: {
  flowItems: FlowItem[]; lessonId: string; stageIndex: number;
  onComplete: (currentSlots?: Record<number, string>) => void;
  onNext?: () => void;
  initialData?: { slots?: Record<number, string>; validated?: boolean };
  title?: string;
  instruction?: string;
  theme?: 'sequence';
}) {
  const user = getCurrentUser();
  const [slots, setSlots] = useState<Record<number, string>>(initialData?.slots || {});
  const [validated, setValidated] = useState(initialData?.validated || false);
  const [attempts, setAttempts] = useState(0);
  const [shuffledPool] = useState<FlowItem[]>(() => {
    const arr = [...flowItems];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });

  useEffect(() => {
    getLessonProgress(user!.id, lessonId).then(p =>
      setAttempts(p.stageAttempts[`stage_${stageIndex}_flow`] || 0)
    );
  }, []);

  useEffect(() => {
    if (initialData?.slots) setSlots(initialData.slots);
    if (initialData?.validated) setValidated(initialData.validated);
  }, [initialData]);

  const handleDrop = (pos: number, id: string) => {
    if (validated) return;
    setSlots(prev => {
      const next = { ...prev };
      (Object.keys(next) as unknown as number[]).forEach(k => { if (next[Number(k)] === id) delete next[Number(k)]; });
      next[pos] = id;
      onComplete(next);
      return next;
    });
  };

  const placedIds = new Set(Object.values(slots));
  const unplacedItems = shuffledPool.filter(it => !placedIds.has(it.id));
  const allPlaced = placedIds.size === flowItems.length;

  const isCorrectOrder = allPlaced && flowItems.every(item => slots[item.correctOrder] === item.id);

  const handleValidate = async () => {
    const ok = isCorrectOrder;
    const newA = await saveStageAttempt(user!.id, lessonId, stageIndex, ok, `stage_${stageIndex}_flow`);
    setAttempts(newA);
    setValidated(true);
    onComplete(slots);
  };

  const handleRetry = () => {
    const nextSlots = { ...slots };
    Object.keys(nextSlots).forEach(key => {
       const slotNum = Number(key);
       const it = flowItems.find(f => f.id === nextSlots[slotNum]);
       if (it?.correctOrder !== slotNum) delete nextSlots[slotNum];
    });
    setSlots(nextSlots);
    setValidated(false);
    onComplete(nextSlots);
  };

  const isDone = validated && (isCorrectOrder || attempts >= 3);

  const isSeq = theme === 'sequence';

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-700">
      {/* Header card */}
      <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden ${isSeq ? 'border-[#628ECB]/25' : 'border-[#10B981]/25'}`}>
        <div className={`flex items-center gap-3 px-5 py-3 border-b ${isSeq ? 'bg-[#628ECB]/5 border-[#628ECB]/10' : 'bg-gradient-to-r from-[#10B981]/10 to-[#628ECB]/5 border-[#10B981]/15'}`}>
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isSeq ? 'bg-[#628ECB]/10' : 'bg-[#10B981]/15'}`}>
            <Layers className={`w-5 h-5 ${isSeq ? 'text-[#628ECB]' : 'text-[#10B981]'}`} />
          </div>
          <div className="flex-1 text-left">
            <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isSeq ? 'text-[#628ECB]' : 'text-[#10B981]'}`}>
              Aktivitas Keruntutan Berpikir (Consistency of Thinking)
            </p>
            <h3 className="text-sm font-bold text-[#395886]">{title ?? 'Susun Urutan Lapisan TCP/IP'}</h3>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold
            ${attempts >= 3 ? 'border-red-200 bg-red-50 text-red-500' : isSeq ? 'border-[#628ECB]/20 bg-white text-[#628ECB]' : 'border-[#10B981]/20 bg-white text-[#10B981]'}`}>
            <AlertCircle className="w-3 h-3" />
            {attempts >= 3 ? 'Habis' : `${3 - attempts} percobaan`}
          </div>
        </div>
      </div>

      {/* Main content card */}
      <div className="bg-white rounded-2xl border-2 border-[#D5DEEF] shadow-sm p-5">
        {/* Instruction */}
        {instruction && (
          <div className={`mb-4 p-3 rounded-xl border flex items-start gap-2 ${isSeq ? 'bg-[#F0F6FF] border-[#628ECB]/20' : 'bg-[#EEF4FF] border-[#628ECB]/20'}`}>
            <Info className="w-4 h-4 text-[#628ECB] shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-[#395886] leading-relaxed">{instruction}</p>
          </div>
        )}

        {/* Sequence progress flow (only for sequence theme) */}
        {isSeq && (
          <div className="flex items-center justify-center gap-1.5 mb-5 px-4 py-3 bg-[#F8FAFF] rounded-xl border border-[#D5DEEF]/70">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#395886]/30 mr-1">Urutan:</span>
            {flowItems.map((_, i) => {
              const pos = i + 1;
              const isFilled = !!slots[pos];
              const isNextFilled = !!slots[pos + 1];
              return (
                <React.Fragment key={pos}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black border-2 transition-all duration-300
                    ${isFilled ? 'bg-[#395886] text-white border-[#395886] shadow-sm' : 'bg-white text-[#628ECB]/30 border-dashed border-[#D5DEEF]'}`}>
                    {pos}
                  </div>
                  {i < flowItems.length - 1 && (
                    <span className={`text-xs font-bold transition-colors px-0.5 ${isFilled && isNextFilled ? 'text-[#628ECB]' : 'text-[#D5DEEF]'}`}>→</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Unplaced cards pool */}
        {unplacedItems.length > 0 && (
          isSeq ? (
            <div className="mb-5 p-4 bg-[#F0F4FA] rounded-xl border-2 border-dashed border-[#628ECB]/20">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#628ECB]/50 mb-3">
                Kartu tersedia — seret ke urutan yang benar
              </p>
              <div className="flex flex-col gap-2">
                {unplacedItems.map(it => <SequenceDraggableCard key={it.id} item={it} />)}
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-[#F8FAFF] rounded-2xl border-2 border-dashed border-[#D5DEEF]">
              <div className="flex flex-wrap gap-2.5">
                {unplacedItems.map(it => <DraggableFlowCard key={it.id} item={it} />)}
              </div>
            </div>
          )
        )}

        {/* Drop slots */}
        <div className="space-y-2 mb-6">
          {flowItems.map((item, idx) => {
            const pos = idx + 1;
            const placedId = slots[pos];
            const placedItem = flowItems.find(f => f.id === placedId);
            const correct = validated && placedItem?.correctOrder === pos;
            return isSeq
              ? <SequenceDropSlot key={pos} position={pos} placedItem={placedItem} validated={validated} isCorrect={correct} onDrop={handleDrop} />
              : <FlowDropSlot key={pos} position={pos} placedItem={placedItem} validated={validated} isCorrect={correct} onDrop={handleDrop} />;
          })}
        </div>

        {/* Action buttons */}
        {!validated ? (
          <button
            onClick={handleValidate}
            disabled={!allPlaced}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all
              ${allPlaced
                ? isSeq
                  ? 'bg-[#395886] text-white hover:bg-[#2d4a72] shadow-lg shadow-blue-200/50'
                  : 'bg-[#10B981] text-white hover:bg-[#059669] shadow-lg shadow-green-200'
                : 'bg-[#EEF2FF] text-[#395886]/30 cursor-not-allowed'}`}
          >
            Periksa Susunan
          </button>
        ) : isDone ? (
          <button
            onClick={onNext || (() => onComplete(slots))}
            className="w-full py-3 rounded-xl bg-[#628ECB] text-white font-black text-sm hover:bg-[#395886] shadow-lg transition-all active:scale-95"
          >
            Lanjut ke Argumen Logis <ChevronRight className="w-4 h-4 ml-1 inline" />
          </button>
        ) : (
          <button
            onClick={handleRetry}
            className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm border-2 border-red-200 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Perbaiki yang Salah ({3 - attempts} sisa)
          </button>
        )}

        {/* Correct answer reveal — sequence theme, attempts exhausted */}
        {isSeq && validated && !isCorrectOrder && attempts >= 3 && (
          <div className="mt-5 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-200">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">Urutan yang Benar</span>
              </div>
              <div className="space-y-2">
                {[...flowItems].sort((a, b) => a.correctOrder - b.correctOrder).map(item => (
                  <div key={item.id} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-amber-100">
                    <div className="w-6 h-6 rounded-lg bg-[#395886] text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      {item.correctOrder}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-[#395886] leading-relaxed">{item.text}</p>
                      {item.description && (
                        <p className="text-[10px] text-[#628ECB]/60 mt-1 italic">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#EEF4FF] border border-[#628ECB]/20 flex items-start gap-3">
              <Info className="w-4 h-4 text-[#628ECB] shrink-0 mt-0.5" />
              <p className="text-xs text-[#395886]/80 leading-relaxed">
                <span className="font-black text-[#395886]">Penjelasan singkat: </span>
                TCP Sequence Number bekerja secara berurutan: ISN ditetapkan saat handshake, setiap byte data diberi nomor urut, segmen dikirim dan diperiksa penerima, konfirmasi dikirim via ACK Number, lalu data yang hilang dikirim ulang dan disusun kembali. Tanpa urutan ini, penerima tidak dapat mengetahui apakah data sudah lengkap atau dalam urutan yang benar.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// -- Explore Phase ------------------------------------------------------------

function ExplorePhase({ explorationSections, onNext, onBackToMaterial, subtitle, useGenericTitles }: { explorationSections: ExplorationSection[]; onNext: () => void; onBackToMaterial?: () => void; subtitle?: string; useGenericTitles?: boolean }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openedIds, setOpenedIds] = useState<Set<string>>(new Set());
  const handleToggle = (id: string) => {
    setActiveId(prev => (prev === id ? null : id));
    setOpenedIds(prev => new Set(prev).add(id));
  };
  const allOpened = explorationSections.every(s => openedIds.has(s.id));
  
  const layerConfigs = [
    { title: 'Application', color: 'from-[#8B5CF6] to-[#7C3AED]', border: 'border-[#8B5CF6]/30', shadow: 'shadow-[#8B5CF6]/20', icon: <Layers className="w-5 h-5" /> },
    { title: 'Transport',   color: 'from-[#628ECB] to-[#395886]', border: 'border-[#628ECB]/30', shadow: 'shadow-[#628ECB]/20', icon: <RotateCcw className="w-5 h-5" /> },
    { title: 'Network',     color: 'from-[#10B981] to-[#059669]', border: 'border-[#10B981]/30', shadow: 'shadow-[#10B981]/20', icon: <Tag className="w-5 h-5" /> },
    { title: 'Data Link',   color: 'from-[#F59E0B] to-[#D97706]', border: 'border-[#F59E0B]/30', shadow: 'shadow-[#F59E0B]/20', icon: <LinkIcon className="w-5 h-5" /> },
    { title: 'Physical',    color: 'from-[#EC4899] to-[#DB2777]', border: 'border-[#EC4899]/30', shadow: 'shadow-[#EC4899]/20', icon: <GripVertical className="w-5 h-5" /> },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700">
      <div className="bg-white rounded-[2.5rem] border-2 border-[#D5DEEF] shadow-sm p-8 sm:p-10 text-center">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 text-left">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-[#628ECB]/10 flex items-center justify-center text-[#628ECB] shadow-inner">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#395886] tracking-tight uppercase">Eksplorasi Konsep</h3>
              <p className="text-xs font-bold text-[#395886]/40 uppercase tracking-widest mt-1">{subtitle ?? 'Pelajari Alur Pengiriman Data Melalui 5 Lapisan TCP/IP'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 bg-[#F8FAFD] rounded-2xl border-2 border-[#D5DEEF]/50">
             <div className="flex -space-x-2">
                {explorationSections.map((s, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full border-2 border-white transition-all duration-500 ${openedIds.has(s.id) ? 'bg-[#10B981]' : 'bg-[#D5DEEF]'}`} />
                ))}
             </div>
             <span className="text-xs font-black text-[#395886]/60 uppercase tracking-tighter ml-2">Progres: {openedIds.size}/{explorationSections.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
          {explorationSections.map((section, idx) => {
            const config = layerConfigs[idx] || layerConfigs[0];
            const isOpened = openedIds.has(section.id);
            const isActive = activeId === section.id;
            return (
              <button
                key={section.id}
                onClick={() => handleToggle(section.id)}
                className={`relative flex flex-col items-center p-5 rounded-[1.8rem] border-2 transition-all duration-500 group overflow-hidden
                  ${isActive ? `bg-gradient-to-br ${config.color} text-white ${config.border} shadow-2xl ${config.shadow} -translate-y-2` 
                             : `bg-white border-[#D5DEEF] text-[#395886] hover:border-[#628ECB]/40 hover:bg-[#F8FAFD] hover:-translate-y-1`}
                `}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-500
                  ${isActive ? 'bg-white/20 rotate-[10deg]' : 'bg-[#F0F3FA] text-[#395886]/40 group-hover:scale-110'}
                `}>
                  {isActive ? config.icon : <span className="text-lg font-black">{idx + 1}</span>}
                </div>
                <span className={`font-black text-[10px] uppercase tracking-widest text-center leading-tight transition-colors duration-500
                  ${isActive ? 'text-white' : 'text-[#395886]/60 group-hover:text-[#628ECB]'}
                `}>
                  {useGenericTitles ? `Konsep ${idx + 1}` : config.title}
                </span>
                {isOpened && !isActive && (
                  <div className="absolute top-3 right-3 animate-in zoom-in duration-300">
                    <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
                  </div>
                )}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30 animate-progress" />
                )}
              </button>
            );
          })}
        </div>

        <div className="min-h-[200px] text-left">
          {activeId ? (
            <div className="bg-[#F8FAFD] border-2 border-[#D5DEEF]/60 rounded-[2.5rem] p-8 md:p-10 animate-in slide-in-from-top-4 fade-in duration-500 shadow-inner">
              {(() => {
                const section = explorationSections.find(s => s.id === activeId);
                const idx = explorationSections.findIndex(s => s.id === activeId);
                const config = layerConfigs[idx] || layerConfigs[0];
                return (
                  <div className="grid lg:grid-cols-[1fr_280px] gap-10">
                    <div className="space-y-5">
                      <div className="flex items-center gap-4 mb-2">
                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-white text-sm font-black shadow-lg ${config.shadow}`}>
                          {idx + 1}
                        </div>
                        <h4 className="text-2xl font-black text-[#395886] tracking-tight">
                          {useGenericTitles ? section?.title : `${section?.title} Layer`}
                        </h4>
                      </div>
                      <p className="text-[15px] text-[#395886]/80 leading-relaxed font-medium">
                        {section?.content}
                      </p>
                    </div>
                    {section?.example && (
                      <div className="bg-white rounded-3xl p-6 border-2 border-[#D5DEEF]/40 shadow-sm self-start">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600"><Lightbulb className="w-4 h-4" /></div>
                          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[#395886]/40">Contoh Kontekstual</span>
                        </div>
                        <p className="text-xs font-bold text-[#628ECB] leading-relaxed italic">
                          "{section.example}"
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 bg-[#F8FAFD] rounded-[2.5rem] border-2 border-dashed border-[#D5DEEF]">
               <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                  <Info className="w-8 h-8 text-[#D5DEEF]" />
               </div>
               <p className="text-sm font-bold text-[#395886]/40 text-center max-w-xs leading-relaxed uppercase tracking-widest">
                  Klik salah satu kartu layer di atas untuk membuka materi eksplorasi
               </p>
            </div>
          )}
        </div>

        <div className="mt-12 space-y-3">
          {onBackToMaterial && (
            <button
              onClick={onBackToMaterial}
              className="w-full py-3.5 rounded-[1.5rem] font-black text-sm transition-all flex items-center justify-center gap-2 border-2 border-[#628ECB]/30 bg-[#628ECB]/5 text-[#628ECB] hover:bg-[#628ECB]/10 active:scale-95"
            >
              <BookOpen className="w-4 h-4" /> Lihat Materi Lagi
            </button>
          )}
          <button
            onClick={onNext}
            disabled={!allOpened}
            className={`w-full py-5 rounded-[1.5rem] font-black text-sm transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95
              ${allOpened ? 'bg-[#10B981] text-white hover:bg-[#059669] shadow-green-200' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed shadow-none'}`}
          >
            {allOpened ? 'Lanjut ke Aktivitas Tantangan' : `Buka Semua Eksplorasi (${openedIds.size}/${explorationSections.length})`}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// -- Matching Phase -----------------------------------------------------------

function MatchingPhase({
  pairs,
  lessonId,
  stageIndex,
  onComplete,
  onNext,
  shuffleRight,
  completeLabel,
  initialData,
  activityLabel,
  activityTitle,
  leftColumnLabel,
  rightColumnLabel,
  successTitle,
  successDescription,
  autoAdvanceOnExhausted = false,
  autoAdvanceDelayMs = 2600,
}: {
  pairs: MatchingPair[]; lessonId: string; stageIndex: number;
  onComplete: (state: MatchingState) => void;
  onNext?: () => void;
  shuffleRight?: boolean; completeLabel?: string;
  initialData?: MatchingState;
  activityLabel?: string;
  activityTitle?: string;
  leftColumnLabel?: string;
  rightColumnLabel?: string;
  successTitle?: string;
  successDescription?: string;
  autoAdvanceOnExhausted?: boolean;
  autoAdvanceDelayMs?: number;
}) {
  const user = getCurrentUser();
  const pairIndexMap = Object.fromEntries(pairs.map((pair, index) => [pair.left, index]));
  const rightIndexMap = Object.fromEntries(pairs.map((pair, index) => [pair.right, index]));
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>(initialData?.matches || {});
  const [validated, setValidated] = useState(initialData?.validated || false);
  const [attempts, setAttempts] = useState(initialData?.attempts || 0);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rightRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [, forceUpdate] = useState({});
  const autoAdvancedRef = useRef(false);

  const [displayedRights] = useState<string[]>(() => {
    const rights = pairs.map(p => p.right);
    if (shuffleRight) {
      for (let i = rights.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rights[i], rights[j]] = [rights[j], rights[i]];
      }
    }
    return rights;
  });

  useEffect(() => {
    getLessonProgress(user!.id, lessonId).then((p) => setAttempts(p.stageAttempts[`stage_${stageIndex}_matching`] || 0));
  }, []);

  useEffect(() => {
    if (initialData?.matches) setMatches(initialData.matches);
    if (initialData?.validated) setValidated(initialData.validated);
    if (typeof initialData?.attempts === 'number') setAttempts(initialData.attempts);
  }, [initialData]);

  useEffect(() => {
    const handler = () => forceUpdate({});
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleLeftClick = (left: string) => { if (!validated) setSelectedLeft(prev => prev === left ? null : left); };
  const handleRightClick = (right: string) => {
    if (validated || !selectedLeft) return;
    setMatches(prev => {
      const next = { ...prev };
      const oldLeft = Object.keys(next).find(k => next[k] === right);
      if (oldLeft) delete next[oldLeft];
      next[selectedLeft] = right;
      onComplete({ matches: next, validated: false, attempts });
      return next;
    });
    setSelectedLeft(null);
  };

  const isAllCorrect = pairs.every(p => matches[p.left] === p.right);
  const matchedLeftIds = Object.keys(matches);
  const allMatched = matchedLeftIds.length === pairs.length;
  const correctCount = validated ? pairs.filter(p => matches[p.left] === p.right).length : 0;

  useEffect(() => {
    if (!autoAdvanceOnExhausted || autoAdvancedRef.current) return;
    if (!validated || isAllCorrect || attempts < 3) return;

    autoAdvancedRef.current = true;
    setIsAutoAdvancing(true);
    const timer = window.setTimeout(() => {
      onComplete({ matches, validated: true, attempts, correctCount });
      onNext?.();
    }, autoAdvanceDelayMs);

    return () => window.clearTimeout(timer);
  }, [attempts, autoAdvanceDelayMs, autoAdvanceOnExhausted, isAllCorrect, matches, onComplete, onNext, validated]);

  const handleValidate = async () => {
    const ok = isAllCorrect;
    const newA = await saveStageAttempt(user!.id, lessonId, stageIndex, ok, `stage_${stageIndex}_matching`);
    setAttempts(newA);
    setValidated(true);
    onComplete({
      matches,
      validated: true,
      attempts: newA,
      correctCount: pairs.filter(p => matches[p.left] === p.right).length,
    });
  };

  const handleRetry = () => {
    setValidated(false);
    setMatches({});
    setSelectedLeft(null);
    setIsAutoAdvancing(false);
    autoAdvancedRef.current = false;
    onComplete({ matches: {}, validated: false, attempts });
  };

  const renderLines = () => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    return Object.entries(matches).map(([left, right]) => {
      const lEl = leftRefs.current[left]; const rEl = rightRefs.current[right];
      if (!lEl || !rEl) return null;
      const lR = lEl.getBoundingClientRect(), rR = rEl.getBoundingClientRect();
      const x1 = lR.right - rect.left, y1 = lR.top + lR.height / 2 - rect.top;
      const x2 = rR.left - rect.left, y2 = rR.top + rR.height / 2 - rect.top;
      const paletteIndex = pairIndexMap[left] ?? 0;
      const pal = inquiryMatchPalette[paletteIndex % inquiryMatchPalette.length];
      const ok = validated ? pairs.find(p => p.left === left)?.right === right : undefined;
      const color = ok === false ? '#EF4444' : ok === true ? '#10B981' : pal.iconBg.replace('bg-', '').includes('violet') ? '#8B5CF6' : pal.dot === 'bg-sky-400' ? '#38BDF8' : pal.dot === 'bg-emerald-400' ? '#34D399' : pal.dot === 'bg-amber-400' ? '#FBBF24' : pal.dot === 'bg-indigo-400' ? '#818CF8' : '#FB7185';
      return <line key={`${left}-${right}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="3.5" strokeDasharray={validated ? '' : '6,6'} className="drop-shadow-sm transition-all" />;
    });
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-700">
      <div className="overflow-hidden rounded-2xl border-2 border-[#395886]/15 shadow-md">
        <div className="flex items-center gap-4 bg-gradient-to-r from-[#395886] via-[#4A6FA8] to-[#628ECB] px-5 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-inner border border-white/30">
            <LinkIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-white/55 mb-0.5">{activityLabel ?? 'Aktivitas Inquiry'}</p>
            <h3 className="text-base font-black text-white leading-tight">{activityTitle ?? 'Cocokkan Fungsi pada Setiap Layer'}</h3>
          </div>
          <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black shrink-0
            ${attempts >= 3 ? 'border-red-300/60 bg-red-500/20 text-red-200' : 'border-white/25 bg-white/15 text-white'}`}>
            <AlertCircle className="w-3 h-3" />
            {attempts >= 3 ? 'Habis' : `${3 - attempts}x lagi`}
          </div>
        </div>

        <div className="bg-white px-5 py-4 border-b border-[#D5DEEF]">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#628ECB] mb-2.5">Komponen IP Header</p>
          <div className="flex rounded-xl overflow-hidden border border-[#C8D8F0] shadow-sm text-[9px] font-bold">
            {pairs.map((pair, index) => {
              const pal = inquiryMatchPalette[index % inquiryMatchPalette.length];
              return (
                <div key={pair.left} className={`flex-1 py-2 text-center border-r border-[#C8D8F0] last:border-r-0 ${pal.bg} ${pal.text}`}>
                  {pair.left.split(' ')[0]}
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-[10px] text-[#628ECB]/70 font-medium text-center">
            Setiap field memiliki fungsi penting agar paket dapat diarahkan, diperiksa, dan diteruskan dengan benar
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#F8FAFD] to-[#EEF3FB] px-5 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2.5 flex-1">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#395886] text-white text-[10px] font-black">1</div>
              <p className="text-xs font-semibold text-[#395886]/75">Klik komponen di <span className="font-black text-[#395886]">kiri</span></p>
            </div>
            <ArrowRight className="hidden sm:block w-4 h-4 text-[#395886]/30 shrink-0" />
            <div className="flex items-center gap-2.5 flex-1">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#628ECB] text-white text-[10px] font-black">2</div>
              <p className="text-xs font-semibold text-[#395886]/75">Klik fungsi yang sesuai di <span className="font-black text-[#395886]">kanan</span></p>
            </div>
            <ArrowRight className="hidden sm:block w-4 h-4 text-[#395886]/30 shrink-0" />
            <div className="flex items-center gap-2.5 flex-1">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-white text-[10px] font-black">3</div>
              <p className="text-xs font-semibold text-[#395886]/75">Ulangi sampai semua pasangan terhubung</p>
            </div>
          </div>
          {selectedLeft && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#395886] px-4 py-2.5 text-white shadow-md animate-pulse">
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <p className="text-xs font-bold">
                <span className="font-black">{selectedLeft}</span> dipilih - klik fungsi yang sesuai di kanan
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 relative" ref={containerRef}>
        <svg className="absolute inset-0 pointer-events-none z-0 hidden md:block" style={{ width: '100%', height: '100%' }}>{renderLines()}</svg>

        <div className="space-y-2.5 relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-[#395886]" />
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#395886]">{leftColumnLabel ?? 'Komponen IP Header'}</p>
          </div>
          {pairs.map((p, index) => {
            const pal = inquiryMatchPalette[index % inquiryMatchPalette.length];
            const icon = inquiryPairIcons[index % inquiryPairIcons.length];
            const isSelected = selectedLeft === p.left;
            const isMatched = !!matches[p.left];
            const matchedRightText = matches[p.left];
            const matchedRightIdx = matchedRightText ? rightIndexMap[matchedRightText] ?? index : index;
            const matchedPal = inquiryMatchPalette[matchedRightIdx % inquiryMatchPalette.length];
            const isCorrectMatch = validated && matches[p.left] === p.right;
            const isWrongMatch = validated && matches[p.left] && matches[p.left] !== p.right;

            return (
              <button
                key={p.left}
                ref={el => { leftRefs.current[p.left] = el; }}
                onClick={() => handleLeftClick(p.left)}
                disabled={validated}
                className={`group w-full text-left rounded-2xl border-2 transition-all duration-200 select-none
                  ${isSelected
                    ? `${pal.bg} ${pal.activeBorder} ring-2 ${pal.ring} shadow-lg scale-[1.02]`
                    : isCorrectMatch
                      ? 'bg-[#ECFDF5] border-[#10B981] shadow-md shadow-[#10B981]/20'
                      : isWrongMatch
                        ? 'bg-red-50 border-red-300 shadow-sm'
                        : isMatched
                          ? `${matchedPal.bg} ${matchedPal.border} shadow-sm`
                          : 'bg-white border-[#D5DEEF] hover:border-[#628ECB]/40 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                  }`}
              >
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all
                    ${isCorrectMatch ? 'bg-[#10B981] text-white shadow-md shadow-[#10B981]/30'
                      : isWrongMatch ? 'bg-red-400 text-white'
                      : isMatched || isSelected ? `${pal.iconBg} text-white shadow-md`
                      : 'bg-[#EEF3FB] text-[#395886]/50 group-hover:bg-[#628ECB]/15 group-hover:text-[#628ECB]'
                    }`}>
                    {isCorrectMatch ? <CheckCircle className="w-4 h-4" /> : isWrongMatch ? <XCircle className="w-4 h-4" /> : icon}
                  </div>
                  <span className={`flex-1 text-sm font-bold leading-snug
                    ${isWrongMatch ? 'text-red-700' : isCorrectMatch ? 'text-[#065F46]' : isMatched || isSelected ? pal.text : 'text-[#395886]'}`}>
                    {p.left}
                  </span>
                  {!validated && isMatched && (
                    <span className={`text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded-full shrink-0 ${matchedPal.badge}`}>
                      terhubung
                    </span>
                  )}
                  {!validated && isSelected && (
                    <span className="text-[9px] font-black text-white bg-[#395886] px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                      pilih {'->'}
                    </span>
                  )}
                  {!validated && !isMatched && !isSelected && (
                    <span className="text-[9px] font-bold text-[#395886]/30 group-hover:text-[#628ECB]/60 transition-colors shrink-0">
                      klik
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-2.5 relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-[#628ECB]" />
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#628ECB]">{rightColumnLabel ?? 'Fungsi Komponen'}</p>
          </div>
          {displayedRights.map((right) => {
            const pairIdx = rightIndexMap[right] ?? 0;
            const pal = inquiryMatchPalette[pairIdx % inquiryMatchPalette.length];
            const matchedLeftEntry = Object.entries(matches).find(([_, value]) => value === right);
            const isMatched = !!matchedLeftEntry;
            const matchedLeft = matchedLeftEntry?.[0];
            const connectedLeftIdx = matchedLeft ? pairIndexMap[matchedLeft] ?? pairIdx : pairIdx;
            const connectedPal = inquiryMatchPalette[connectedLeftIdx % inquiryMatchPalette.length];
            const isCorrectMatch = validated && matchedLeft && pairs.find(p => p.left === matchedLeft)?.right === right;
            const isWrongMatch = validated && matchedLeft && pairs.find(p => p.left === matchedLeft)?.right !== right;
            const isSelectable = !!selectedLeft && !validated;

            return (
              <button
                key={right}
                ref={el => { rightRefs.current[right] = el; }}
                onClick={() => handleRightClick(right)}
                disabled={validated || !selectedLeft}
                className={`group w-full text-left rounded-2xl border-2 transition-all duration-200 select-none
                  ${isCorrectMatch
                    ? 'bg-[#ECFDF5] border-[#10B981] shadow-md shadow-[#10B981]/20'
                    : isWrongMatch
                      ? 'bg-red-50 border-red-300 shadow-sm'
                      : isMatched
                        ? `${connectedPal.bg} ${connectedPal.border} shadow-sm`
                        : isSelectable
                          ? `bg-white border-[#D5DEEF] border-dashed hover:shadow-md hover:scale-[1.01] cursor-pointer`
                          : 'bg-white border-[#D5DEEF]'
                  }`}
              >
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <div className={`mt-1 h-3 w-3 rounded-full shrink-0 flex-none transition-all ring-2 ring-offset-2
                    ${isCorrectMatch ? 'bg-[#10B981] ring-[#10B981]/30'
                      : isWrongMatch ? 'bg-red-400 ring-red-200'
                      : isMatched ? `${connectedPal.dot} ring-transparent`
                      : isSelectable ? 'bg-[#628ECB]/30 ring-[#628ECB]/15 animate-pulse'
                      : 'bg-[#D5DEEF] ring-transparent'
                    }`}
                  />
                  <p className={`flex-1 text-xs leading-relaxed font-medium
                    ${isWrongMatch ? 'text-red-700' : isCorrectMatch ? 'text-[#065F46]' : isMatched ? connectedPal.text : isSelectable ? 'text-[#395886]' : 'text-[#395886]/70'}`}>
                    {right}
                  </p>
                  {validated && isCorrectMatch && <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />}
                  {validated && isWrongMatch && <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                  {!validated && isSelectable && (
                    <span className="text-[9px] font-black text-[#628ECB] shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">pilih</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border-2 border-[#D5DEEF] bg-white p-4">
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-2 flex-1">
            <LinkIcon className="w-4 h-4 text-[#628ECB]" />
            <span className="text-xs font-bold text-[#395886]">Koneksi terbuat</span>
          </div>
          <span className={`text-sm font-black ${allMatched ? 'text-[#10B981]' : 'text-[#395886]/70'}`}>
            {matchedLeftIds.length} / {pairs.length}
          </span>
        </div>

        <div className="flex gap-1.5 mb-4">
          {pairs.map((p, index) => {
            const pal = inquiryMatchPalette[index % inquiryMatchPalette.length];
            const isConnected = !!matches[p.left];
            const isCorrectMatch = validated && matches[p.left] === p.right;
            const isWrongMatch = validated && matches[p.left] && matches[p.left] !== p.right;
            return (
              <div key={p.left} className={`flex-1 h-2 rounded-full transition-all duration-500
                ${isCorrectMatch ? 'bg-[#10B981]' : isWrongMatch ? 'bg-red-400' : isConnected ? pal.dot : 'bg-[#D5DEEF]'}`}
              />
            );
          })}
        </div>

        <div className="space-y-3">
          {validated && isAllCorrect && (
            <div className="flex items-center gap-3 p-4 rounded-xl border-2 bg-[#ECFDF5] border-[#10B981]/40">
              <CheckCircle className="w-5 h-5 text-[#10B981] shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-[#065F46]">{successTitle ?? 'Jawaban Benar'}</p>
                <p className="text-xs leading-relaxed text-[#065F46]/80 mt-1">
                  {successDescription ?? 'Setiap komponen IP Header memiliki peran berbeda agar paket dapat dikenali, diarahkan, dibatasi perjalanannya, dan diperiksa sebelum diteruskan.'}
                </p>
              </div>
            </div>
          )}

          {!validated ? (
            <button
              onClick={handleValidate}
              disabled={!allMatched}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                ${allMatched
                  ? 'bg-gradient-to-r from-[#395886] to-[#628ECB] text-white hover:from-[#2E4A75] hover:to-[#4A79BA] shadow-lg shadow-[#395886]/20 active:scale-[0.98]'
                  : 'bg-[#F0F3FA] text-[#395886]/40 cursor-not-allowed'
                }`}
            >
              {allMatched
                ? <><CheckCircle className="w-4 h-4" /> Periksa Semua Pasangan</>
                : <><LinkIcon className="w-4 h-4 opacity-40" /> Pasangkan {pairs.length - matchedLeftIds.length} lagi...</>
              }
            </button>
          ) : !isAllCorrect && attempts < 3 ? (
            <>
              <div className="flex items-center gap-3 p-4 rounded-xl border-2 bg-red-50 border-red-200">
                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-sm font-bold flex-1 text-red-800">
                  {correctCount}/{pairs.length} pasangan benar. Sisa {3 - attempts} percobaan.
                </p>
              </div>
              <button
                onClick={handleRetry}
                className="w-full py-2.5 rounded-xl font-bold text-sm bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 active:scale-[0.98] flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Perbaiki Pasangan yang Salah
              </button>
            </>
          ) : isAutoAdvancing ? (
            <div className="w-full rounded-2xl border-2 border-[#10B981]/20 bg-gradient-to-r from-[#ECFDF5] to-white px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full border-2 border-[#10B981] border-t-transparent animate-spin shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-black text-[#065F46]">Membuka Argumen Logis...</p>
                  <p className="text-xs text-[#065F46]/75 mt-0.5">
                    Jawaban benar sudah ditampilkan. Sistem sedang memindahkan kamu ke bagian argumen.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { onComplete({ matches, validated: true, attempts, correctCount, showArgument: true }); onNext?.(); }}
              className="w-full py-4 rounded-2xl bg-[#10B981] text-white font-black text-sm hover:bg-[#059669] shadow-lg shadow-green-200 transition-all active:scale-95"
            >
              {completeLabel ?? 'Lanjut ke Argumen Logis'} <ChevronRight className="w-4 h-4 ml-1 inline" />
            </button>
          )}

          {validated && !isAllCorrect && attempts >= 3 && (
            <div className="flex items-center gap-3 p-4 rounded-xl border-2 bg-amber-50 border-amber-200">
              <Info className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-sm font-bold flex-1 text-amber-800">
                Jawaban benar ditampilkan sebagai bahan belajar sebelum masuk ke Argumen Logis.
              </p>
            </div>
          )}
        </div>
      </div>

      {validated && !isAllCorrect && attempts >= 3 && (
        <div className="rounded-2xl overflow-hidden border-2 border-amber-200 shadow-sm">
          <div className="flex items-center gap-3 px-5 py-3 bg-amber-50 border-b border-amber-200">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <p className="text-xs font-black uppercase tracking-widest text-amber-600">Kunci Jawaban</p>
          </div>
          <div className="p-4 bg-white space-y-2">
            {pairs.map((p, index) => {
              const pal = inquiryMatchPalette[index % inquiryMatchPalette.length];
              const icon = inquiryPairIcons[index % inquiryPairIcons.length];
              return (
                <div key={p.left} className={`flex items-start gap-3 p-3 rounded-xl border ${pal.bg} ${pal.border}`}>
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${pal.iconBg} text-white`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-black ${pal.text}`}>{p.left}</p>
                    <p className="text-[11px] text-[#395886]/65 leading-relaxed mt-0.5">{p.right}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {isAutoAdvancing && (
            <div className="border-t border-amber-200 bg-amber-50/70 px-4 py-3">
              <p className="text-xs font-bold text-amber-800">
                Aktivitas akan dilanjutkan otomatis ke <span className="font-black">Argumen Logis</span>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// -- Material Viewer (Redesigned - modern, visual, interactive, with OSI comparison) --

function MaterialViewer({ material, onNext, onBackToMaterial }: { material: InquiryStageProps['material'], onNext: () => void; onBackToMaterial?: () => void }) {
  if (!material) return null;

  const mainConcepts = material.content.slice(0, Math.ceil(material.content.length / 2));
  const details = material.content.slice(Math.ceil(material.content.length / 2));
  const osiLayers = material.osiLayers ?? [];

  const conceptIcons = [
    { icon: <Database className="w-5 h-5" />, bg: 'bg-[#628ECB]/10', text: 'text-[#628ECB]' },
    { icon: <Zap className="w-5 h-5" />, bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]' },
    { icon: <Layers className="w-5 h-5" />, bg: 'bg-[#8B5CF6]/10', text: 'text-[#8B5CF6]' },
    { icon: <Network className="w-5 h-5" />, bg: 'bg-[#10B981]/10', text: 'text-[#10B981]' },
    { icon: <Lightbulb className="w-5 h-5" />, bg: 'bg-[#EC4899]/10', text: 'text-[#EC4899]' },
    { icon: <ShieldCheck className="w-5 h-5" />, bg: 'bg-[#6366F1]/10', text: 'text-[#6366F1]' },
  ];

  // Build TCP/IP layer color map for OSI panel
  const tcpColorMap: Record<string, { bg: string; text: string; border: string }> = {
    'Application': { bg: 'bg-[#8B5CF6]/10', text: 'text-[#8B5CF6]', border: 'border-[#8B5CF6]/30' },
    'Transport':   { bg: 'bg-[#628ECB]/10', text: 'text-[#628ECB]', border: 'border-[#628ECB]/30' },
    'Network':     { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]', border: 'border-[#10B981]/30' },
    'Data Link':   { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/30' },
    'Physical':    { bg: 'bg-[#EC4899]/10', text: 'text-[#EC4899]', border: 'border-[#EC4899]/30' },
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* Header card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] p-6 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Materi Pembelajaran</p>
            <h2 className="text-xl font-black text-white leading-tight">{material.title}</h2>
            <p className="text-xs text-white/70 mt-1">Pahami konsep dasar sebelum eksplorasi lebih lanjut</p>
          </div>
        </div>
      </div>

      {/* Concept cards grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {mainConcepts.map((paragraph, i) => {
          const ico = conceptIcons[i % conceptIcons.length];
          return (
            <div key={i} className="group relative rounded-2xl border-2 border-[#D5DEEF] bg-white p-5 shadow-sm hover:shadow-md hover:border-[#10B981]/30 transition-all duration-300">
              <div className={`w-10 h-10 rounded-xl ${ico.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <span className={ico.text}>{ico.icon}</span>
              </div>
              <span className="absolute top-4 right-4 text-[10px] font-black text-[#395886]/15">0{i + 1}</span>
              <p className="text-sm text-[#395886]/80 leading-relaxed font-medium">{paragraph}</p>
            </div>
          );
        })}
      </div>

      {/* Detail section - timeline style */}
      {details.length > 0 && (
        <div className="rounded-2xl border-2 border-[#10B981]/15 bg-[#F0FDF6] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Info className="w-4 h-4 text-[#10B981]" />
            <p className="text-[10px] font-black uppercase tracking-widest text-[#10B981]">Pendalaman Konsep</p>
          </div>
          <div className="space-y-4">
            {details.map((paragraph, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-sm">
                    {mainConcepts.length + i + 1}
                  </div>
                  {i < details.length - 1 && <div className="w-0.5 flex-1 bg-[#10B981]/20 mt-1" />}
                </div>
                <div className="flex-1 bg-white rounded-xl border border-[#10B981]/10 p-4 -mt-1">
                  <p className="text-sm text-[#395886]/80 leading-relaxed font-medium">{paragraph}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Examples accordion */}
      {material.examples && material.examples.length > 0 && (
        <div className="rounded-2xl border-2 border-[#F59E0B]/20 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-[#F59E0B]" />
            <p className="text-xs font-black uppercase tracking-widest text-[#F59E0B]">Contoh di Dunia Nyata</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {material.examples.map((ex, i) => (
              <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-[#F59E0B]/15 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-black text-[#F59E0B]">{i + 1}</span>
                </div>
                <p className="text-xs font-bold text-[#395886] leading-relaxed">{ex}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── OSI vs TCP/IP Comparison Panel ── */}
      {osiLayers.length > 0 && (
        <div className="rounded-2xl border-2 border-[#8B5CF6]/20 bg-gradient-to-br from-purple-50 to-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Layers className="w-5 h-5 text-[#8B5CF6]" />
            <p className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">Perbandingan OSI (7 Layer) → TCP/IP (5 Layer)</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* OSI Column */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#8B5CF6]/50 mb-3 text-center">Model OSI</p>
              <div className="space-y-1.5">
                {osiLayers.map((l, i) => {
                  const tcp = tcpColorMap[l.mapsTo] ?? tcpColorMap['Application'];
                  return (
                    <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${tcp.border} ${tcp.bg} transition-all hover:shadow-sm`}>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-black text-[#8B5CF6]">{l.number}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#395886]">{l.name}</p>
                        <p className="text-[9px] text-[#395886]/50">{l.desc}</p>
                      </div>
                      <ArrowRight className="w-3 h-3 text-[#395886]/25 shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
            {/* TCP/IP Column */}
            <div className="flex flex-col justify-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#10B981]/50 mb-3 text-center">TCP/IP</p>
              <div className="space-y-3">
                {['Application', 'Transport', 'Network', 'Data Link', 'Physical'].map((name, i) => {
                  const c = tcpColorMap[name] ?? tcpColorMap['Application'];
                  const osiMapped = osiLayers.filter(l => l.mapsTo === name).map(l => l.name).join(' + ');
                  return (
                    <div key={i} className={`rounded-xl border-2 ${c.border} ${c.bg} p-3 text-center`}>
                      <p className={`text-xs font-black ${c.text}`}>{name} Layer</p>
                      <p className="text-[9px] text-[#395886]/50 mt-0.5">← {osiMapped}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
            <p className="text-[10px] font-bold text-amber-800">
              💡 TCP/IP menyederhanakan 7 layer OSI menjadi 5 layer dengan menggabungkan Application, Presentation, dan Session menjadi satu Application Layer.
            </p>
          </div>
        </div>
      )}

      {/* CTA button */}
      <button
        onClick={onNext}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-black text-sm shadow-lg shadow-[#10B981]/20 hover:shadow-xl hover:shadow-[#10B981]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        Saya Sudah Memahami Materi
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// -- Inquiry Lesson 1 Flow (New: 3-phase with OSI comparison & analogy) --

function InquiryLesson1Page(props: InquiryStageProps) {
  const { material, explorationSections, flowItems, groups, groupItems, inquiryReflection1, lessonId, stageIndex, onComplete, isCompleted, onTrackerPhase } = props;
  const tracker = useActivityTracker({ lessonId, stageIndex, stageType: 'inquiry' });

  // Phase: 'consistency' (Keruntutan Berpikir), 'arguing' (Kemampuan Berargumen), or 'conclusion' (Penarikan Kesimpulan)
  const [phase, setPhase] = useState<'consistency' | 'arguing' | 'conclusion'>('consistency');
  // Sub-phase within consistency: material → explore → sorting
  const [consistencyStep, setConsistencyStep] = useState<'material' | 'explore' | 'sorting'>('material');
  // Sorting data
  const [flowData, setFlowData] = useState<any>(null);
  const [sortingValidated, setSortingValidated] = useState(false);
  // Analogy data (Kemampuan Berargumen)
  const [analogyData, setAnalogyData] = useState<any>(null);
  const [analogyStep, setAnalogyStep] = useState<number>(1); // 1=analogy, 2=essay
  const [essay1Text, setEssay1Text] = useState('');
  const [conclusionText, setConclusionText] = useState('');
  // Restoration
  const [isRestored, setIsRestored] = useState(false);
  const [pendingNextPhase, setPendingNextPhase] = useState(false);

  // Report tracker phase
  useEffect(() => {
    onTrackerPhase?.(phase);
  }, [phase, onTrackerPhase]);

  useEffect(() => {
    if (!tracker.isLoading && tracker.session?.latestSnapshot && !isRestored) {
      const snap = tracker.session.latestSnapshot;
      if (snap.phase) setPhase(snap.phase);
      if (snap.consistencyStep) setConsistencyStep(snap.consistencyStep);
      if (snap.flowData) setFlowData(snap.flowData);
      if (snap.sortingValidated) setSortingValidated(snap.sortingValidated);
      if (snap.analogyData) setAnalogyData(snap.analogyData);
      if (snap.analogyStep) setAnalogyStep(snap.analogyStep);
      if (snap.essay1Text) setEssay1Text(snap.essay1Text);
      if (snap.pendingNextPhase) setPendingNextPhase(snap.pendingNextPhase);
      if (snap.conclusionText) setConclusionText(snap.conclusionText);
      setIsRestored(true);
    } else if (!tracker.isLoading) {
      setIsRestored(true);
    }
  }, [tracker.isLoading, tracker.session, isRestored]);

  useEffect(() => {
    if (!isRestored) return;
    const progressMap: Record<string, number> = {
      'consistency-material': 15, 'consistency-explore': 30, 'consistency-sorting': 50,
      'arguing': 70,
      'conclusion': 90,
    };
    void tracker.saveSnapshot(
      { phase, consistencyStep, flowData, sortingValidated, analogyData, analogyStep, essay1Text, conclusionText, pendingNextPhase },
      { progressPercent: progressMap[`${phase}-${consistencyStep}`] ?? progressMap[phase] ?? 50 },
    );
  }, [analogyData, analogyStep, consistencyStep, essay1Text, conclusionText, flowData, isRestored, pendingNextPhase, phase, sortingValidated, tracker]);

  // Completed state is handled externally by LessonPage overlay

  if (tracker.isLoading || !isRestored) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-12 h-12 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-bold text-[#395886]">Memuat progres...</p>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 1: CONSISTENCY (Keruntutan Berpikir)
  // ═══════════════════════════════════════════════════════════════════
  if (phase === 'consistency') {
    // Sub-phase: Material
    if (consistencyStep === 'material') {
      // Safety: show fallback if material data is missing
      if (!material) {
        return (
          <div className="w-full space-y-6 animate-in fade-in duration-500">
            <div className="rounded-2xl border-2 border-[#F59E0B]/20 bg-gradient-to-br from-amber-50 to-white p-6 text-center shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <p className="text-sm font-bold text-amber-800">Data materi belum tersedia</p>
              </div>
              <p className="text-xs text-[#395886]/60">Silakan lanjutkan ke eksplorasi konsep.</p>
              <button
                onClick={() => setConsistencyStep('explore')}
                className="mt-4 px-6 py-2.5 rounded-xl bg-[#628ECB] text-white font-bold text-sm hover:bg-[#395886] transition-all"
              >
                Lanjut ke Eksplorasi Konsep <ArrowRight className="w-4 h-4 ml-1 inline" />
              </button>
            </div>
          </div>
        );
      }
      return <MaterialViewer material={material} onNext={() => setConsistencyStep('explore')} />;
    }

    // Sub-phase: Explore
    if (consistencyStep === 'explore') {
      return (
        <ExplorePhase
          explorationSections={explorationSections ?? []}
          onNext={() => setConsistencyStep('sorting')}
          onBackToMaterial={() => setConsistencyStep('material')}
        />
      );
    }

    // Sub-phase: Sorting
    if (consistencyStep === 'sorting') {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {/* Back to material button */}
          <button
            onClick={() => setConsistencyStep('material')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#628ECB]/20 bg-[#628ECB]/5 text-[#628ECB] text-xs font-bold hover:bg-[#628ECB]/10 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" /> Lihat Materi Lagi
          </button>

          {/* Sorting Activity */}
          <DragDropLayerSorter
            flowItems={flowItems ?? []}
            lessonId={lessonId}
            stageIndex={stageIndex}
            initialData={flowData}
            onComplete={(slots) => setFlowData({ slots })}
            onNext={() => {
              setFlowData((prev: any) => ({ ...prev, validated: true }));
              setSortingValidated(true);
            }}
          />

          {/* Proceed button (appears after sorting validated) */}
          {sortingValidated && (
            <button
              onClick={() => {
                void tracker.trackEvent('inquiry_consistency_completed', {}, { progressPercent: 55 });
                setPhase('arguing');
              }}
              className="w-full py-3 rounded-xl bg-[#10B981] text-white font-bold text-sm hover:bg-[#059669] shadow-sm transition-all flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <CheckCircle className="w-4 h-4" /> Lanjut ke Kemampuan Berargumen
            </button>
          )}
        </div>
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 2: ARGUING (Kemampuan Berargumen)
  // ═══════════════════════════════════════════════════════════════════
  if (phase === 'arguing') {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
        {/* Analogy Activity Header */}
        <div className="bg-white rounded-2xl border-2 border-[#F59E0B]/20 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 bg-[#F59E0B]/8 border-b border-[#F59E0B]/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F59E0B]/15">
              <Tag className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B]">Kemampuan Berargumen</p>
              <h3 className="text-sm font-bold text-[#395886]">Cocokkan Contoh Keseharian ke Lapisan TCP/IP</h3>
            </div>
          </div>
          <div className="px-5 py-4 bg-gradient-to-br from-[#F59E0B]/5 to-transparent">
            <p className="text-sm text-[#395886]/80 leading-relaxed">
              Seret setiap kartu contoh ke lapisan TCP/IP yang sesuai. Aktivitas ini membantu kamu memahami <strong>peran setiap lapisan</strong> dalam kehidupan sehari-hari.
            </p>
          </div>
        </div>

        {/* Group Classifier for Analogy */}
        {groups && groupItems && (
          <GroupClassifier
            groups={groups as Group[]}
            groupItems={groupItems as GroupItem[]}
            initialData={analogyData}
            onComplete={(data) => {
              setAnalogyData(data);
              setAnalogyStep(2);
            }}
          />
        )}

        {/* Argument Essay Box (appears after analogy done) */}
        {analogyStep >= 2 && inquiryReflection1 && (
          <InquiryEssayBox
            objectiveLabel="X.TCP.2"
            headerLabel="Argumen Logis"
            prompt={inquiryReflection1}
            submitLabel="Simpan Argumen"
            minWords={20}
            defaultValue={essay1Text}
            disabled={!!essay1Text}
            onSubmit={(text) => {
              setEssay1Text(text);
              setPendingNextPhase(true);
            }}
          />
        )}

        {/* Submit & transition to conclusion phase */}
        {essay1Text && pendingNextPhase && (
          <ContinueActivityButton
            onClick={() => {
              void tracker.trackEvent('inquiry_arguing_completed', {}, { progressPercent: 80 });
              setPhase('conclusion');
            }}
            label="Lanjutkan ke Penarikan Kesimpulan"
          />
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 3: CONCLUSION (Penarikan Kesimpulan)
  // ═══════════════════════════════════════════════════════════════════
  if (phase === 'conclusion') {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
        <ATPConclusionBox
          atpBehavior="mampu menguraikan susunan lapisan model TCP/IP berdasarkan perbandingan dengan model OSI"
          objectiveCode="X.TCP.2"
          stageType="inquiry"
          defaultValue={conclusionText}
          disabled={!!conclusionText}
          onSubmit={(text) => {
            setConclusionText(text);
            const finalAnswer = { flowData, analogyData, essay1: essay1Text, conclusion: text, summary: text };
            void tracker.complete(finalAnswer, { phase: 'conclusion', finalAnswer });
            onComplete(finalAnswer);
          }}
        />

        {conclusionText && (
          <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 animate-in fade-in zoom-in-95 duration-300">
            <CheckCircle className="w-5 h-5 text-[#10B981]" />
            <span className="text-sm font-black text-[#065F46]">Kesimpulan tersimpan — Tahap Inquiry selesai!</span>
          </div>
        )}
      </div>
    );
  }

  return null;
}

function IpHeaderIntro({ onComplete }: { onComplete: () => void }) {
  const components = [
    {
      id: 'ver',
      label: 'Version',
      bits: '4 bit',
      short: 'Menentukan versi IP yang digunakan',
      detail: 'Field ini berisi informasi versi IP yang dipakai oleh paket, misalnya IPv4 atau IPv6. Pada IPv4 nilainya ditulis dalam biner 0100. Router membaca field ini terlebih dahulu agar paket diproses dengan format header yang benar.',
    },
    {
      id: 'ihl',
      label: 'Header Length',
      bits: '4 bit',
      short: 'Menunjukkan panjang header IPv4',
      detail: 'Field ini menunjukkan panjang header IPv4 dalam satuan 32 bit. Nilai minimum adalah 5 yang berarti 20 byte header standar. Jika ada opsi tambahan, nilainya bisa bertambah hingga maksimum 20.',
    },
    {
      id: 'tos',
      label: 'Type of Service (ToS)',
      bits: '8 bit',
      short: 'Memberi prioritas layanan paket',
      detail: 'ToS digunakan untuk pengaturan Quality of Service atau QoS. Field ini membantu jaringan memberikan prioritas tertentu pada paket data, misalnya agar layanan yang sensitif terhadap waktu seperti suara atau video dapat diproses lebih dulu.',
    },
    {
      id: 'len',
      label: 'Total Length',
      bits: '16 bit',
      short: 'Menunjukkan ukuran seluruh paket IP',
      detail: 'Field ini menunjukkan ukuran keseluruhan paket IP, yaitu gabungan header dan data. Karena berukuran 16 bit, ukuran maksimum paket yang dapat ditunjukkan adalah 65.535 byte.',
    },
    {
      id: 'ident',
      label: 'Identification',
      bits: '16 bit',
      short: 'Identitas paket saat fragmentasi',
      detail: 'Identification berfungsi sebagai identitas paket ketika proses fragmentasi terjadi. Jika satu paket dipecah menjadi beberapa fragmen, semua fragmen itu membawa nilai identification yang sama agar bisa dikenali sebagai bagian dari paket asal yang sama.',
    },
    {
      id: 'flag',
      label: 'IP Flag',
      bits: '3 bit',
      short: 'Mengatur proses fragmentasi',
      detail: 'Field flag dipakai untuk mengatur fragmentasi paket. Bit penting di dalamnya adalah DF atau Don’t Fragment yang berarti paket tidak boleh dipecah, dan MF atau More Fragment yang berarti masih ada fragmen lain setelah fragmen ini.',
    },
    {
      id: 'offset',
      label: 'Fragment Offset',
      bits: '13 bit',
      short: 'Menentukan posisi fragmen',
      detail: 'Fragment Offset menunjukkan posisi suatu fragmen di dalam paket aslinya. Informasi ini membantu perangkat penerima menyusun kembali fragmen-fragmen ke urutan yang benar setelah semuanya diterima.',
    },
    {
      id: 'ttl',
      label: 'TTL',
      bits: '8 bit',
      short: 'Membatasi perjalanan paket di jaringan',
      detail: 'TTL atau Time to Live menentukan batas perjalanan paket dalam jaringan. Nilainya akan berkurang setiap kali paket melewati router. Jika TTL mencapai 0, paket dibuang agar tidak terus berputar dan menyebabkan looping.',
    },
    {
      id: 'proto',
      label: 'Protocol',
      bits: '8 bit',
      short: 'Menentukan protokol layer atas',
      detail: 'Field Protocol menunjukkan protokol layer atas yang digunakan oleh data di dalam paket. Contohnya TCP bernilai 6 dan UDP bernilai 17. Dengan field ini, perangkat penerima tahu apakah data harus diteruskan ke TCP, UDP, atau protokol lain.',
    },
    {
      id: 'sum',
      label: 'Header Checksum',
      bits: '16 bit',
      short: 'Memeriksa kesalahan pada header IP',
      detail: 'Header Checksum digunakan untuk memeriksa apakah terjadi kesalahan pada header IP selama pengiriman. Jika hasil pemeriksaan tidak cocok, perangkat mengetahui bahwa header bermasalah dan paket tidak diproses begitu saja.',
    },
    {
      id: 'src',
      label: 'Source Address',
      bits: '32 bit',
      short: 'Berisi alamat IP sumber',
      detail: 'Source Address berisi alamat IP sumber atau pengirim paket. Field ini menunjukkan dari perangkat mana paket berasal dan dipakai saat perangkat tujuan perlu mengirim balasan kembali ke pengirim.',
    },
    {
      id: 'dst',
      label: 'Destination Address',
      bits: '32 bit',
      short: 'Berisi alamat IP tujuan',
      detail: 'Destination Address berisi alamat IP tujuan atau penerima paket. Router menggunakan field ini untuk menentukan jalur pengiriman yang tepat agar paket sampai ke perangkat yang benar.',
    },
    {
      id: 'option',
      label: 'IP Option',
      bits: 'Opsional',
      short: 'Menyimpan opsi tambahan pada header',
      detail: 'IP Option berisi opsi tambahan tertentu pada header IP, misalnya informasi route khusus atau kebutuhan kontrol tertentu. Jika field ini digunakan, panjang header akan bertambah melebihi ukuran minimum.',
    },
    {
      id: 'data',
      label: 'Data',
      bits: 'Variabel',
      short: 'Isi utama yang dikirim',
      detail: 'Data adalah isi utama yang dibawa paket dari layer atas menuju layer bawah. Bagian inilah yang berisi pesan, file, atau informasi aplikasi yang ingin dikirim melalui jaringan.',
    },
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  const [openedIds, setOpenedIds] = useState<Set<string>>(() => new Set([components[0].id]));
  const allOpened = openedIds.size === components.length;

  const handleSelect = (index: number) => {
    setActiveIndex(index);
    setOpenedIds((prev) => new Set(prev).add(components[index].id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="relative overflow-hidden rounded-[2rem] border-2 border-[#10B981]/25 bg-gradient-to-br from-[#ECFDF5] via-white to-[#EEF4FF] p-6 shadow-sm">
        <div className="relative">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#10B981]/12 text-[#10B981] shadow-inner">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10B981]">Keruntutan Berpikir</p>
              <h3 className="text-2xl font-black tracking-tight text-[#395886]">Eksplorasi Konsep - Komponen IP Header</h3>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-[#395886]/75">
                Klik setiap komponen pada ilustrasi IP Header untuk mempelajari nama komponen, ukuran bit, fungsi, dan perannya dalam proses pengiriman data jaringan.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[1.75rem] border-2 border-[#D5DEEF] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Network className="w-4 h-4 text-[#628ECB]" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]">Ilustrasi IP Header</p>
              </div>
              <div className="rounded-[1.5rem] border-2 border-[#D5DEEF] bg-[#F8FAFF] p-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {components.map((component, index) => {
                    const isActive = index === activeIndex;
                    const isOpened = openedIds.has(component.id);
                    return (
                      <button
                        key={component.id}
                        type="button"
                        onClick={() => handleSelect(index)}
                        className={`rounded-2xl border-2 p-4 text-left transition-all ${
                          isActive
                            ? 'border-[#10B981] bg-[#ECFDF5] shadow-sm'
                            : isOpened
                              ? 'border-[#628ECB]/25 bg-white'
                              : 'border-[#D5DEEF] bg-white hover:border-[#628ECB]/35'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-[#10B981]' : 'text-[#395886]/45'}`}>
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          {isOpened && <CheckCircle className={`w-3.5 h-3.5 ${isActive ? 'text-[#10B981]' : 'text-[#628ECB]'}`} />}
                        </div>
                        <p className="mt-3 text-xs font-black leading-snug text-[#395886]">{component.label}</p>
                        <p className="mt-1 text-[11px] font-bold text-[#628ECB]">{component.bits}</p>
                        <p className="mt-1 text-[11px] font-medium text-[#395886]/60">{component.short}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#D5DEEF] bg-[#F8FAFF] px-4 py-3">
                <p className="text-xs font-semibold text-[#395886]/70">Komponen yang sudah dieksplorasi</p>
                <span className="text-xs font-black text-[#10B981]">{openedIds.size}/{components.length}</span>
              </div>
            </div>

            <div className="rounded-[1.75rem] border-2 border-[#628ECB]/20 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[#F59E0B]" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B]">Penjelasan Komponen</p>
              </div>
              <div className="rounded-2xl border border-[#10B981]/15 bg-[#ECFDF5]/60 p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#10B981]">{components[activeIndex].label}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#628ECB] border border-[#628ECB]/20">
                    {components[activeIndex].bits}
                  </span>
                  <span className="text-sm font-bold text-[#395886]">{components[activeIndex].short}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#395886]/85">{components[activeIndex].detail}</p>
              </div>
              <div className="mt-4 space-y-2 rounded-2xl border border-[#D5DEEF] bg-[#F8FAFF] p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]">Komponen Penting Lainnya</p>
                {components.map((component, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={component.id}
                      type="button"
                      onClick={() => handleSelect(index)}
                      className={`w-full rounded-xl border px-3 py-2 text-left text-xs font-bold transition-all ${
                        isActive
                          ? 'border-[#10B981] bg-white text-[#10B981]'
                          : 'border-[#D5DEEF] bg-white text-[#395886]/70 hover:border-[#628ECB]/35'
                      }`}
                    >
                      <span className="block">{component.label}</span>
                      <span className="block mt-0.5 text-[10px] font-semibold text-[#628ECB]">{component.bits}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-xs font-medium leading-relaxed text-[#395886]/65">
                Aktivitas ini selesai setelah semua komponen sudah kamu klik dan pahami.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onComplete}
        disabled={!allOpened}
        className={`w-full py-4 rounded-2xl text-white font-black text-sm shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
          allOpened
            ? 'bg-gradient-to-r from-[#10B981] to-[#059669] shadow-[#10B981]/20 hover:shadow-xl hover:shadow-[#10B981]/30'
            : 'bg-[#D5DEEF] text-[#395886]/50 shadow-none cursor-not-allowed'
        }`}
      >
        Lanjut ke Aktivitas Interaktif
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

function InquiryLesson3Page(props: InquiryStageProps) {
  const { lessonId, stageIndex, onComplete, onTrackerPhase } = props;
  const tracker = useActivityTracker({ lessonId, stageIndex, stageType: 'inquiry' });
  const headerGroups: Group[] = [
    { id: 'identity', label: 'Identitas Paket', colorClass: 'purple' },
    { id: 'addressing', label: 'Pengalamatan', colorClass: 'blue' },
    { id: 'delivery', label: 'Pengaturan Pengiriman', colorClass: 'green' },
    { id: 'validation', label: 'Pemeriksaan Kesalahan', colorClass: 'amber' },
    { id: 'fragmentation', label: 'Fragmentasi Paket', colorClass: 'pink' },
  ];
  const headerGroupItems: GroupItem[] = [
    { id: 'gi1', text: 'Version', correctGroup: 'identity' },
    { id: 'gi2', text: 'Header Length (IHL)', correctGroup: 'identity' },
    { id: 'gi3', text: 'Type of Service (ToS)', correctGroup: 'delivery' },
    { id: 'gi4', text: 'Total Length', correctGroup: 'delivery' },
    { id: 'gi5', text: 'Source Address', correctGroup: 'addressing' },
    { id: 'gi6', text: 'Destination Address', correctGroup: 'addressing' },
    { id: 'gi7', text: 'TTL (Time to Live)', correctGroup: 'delivery' },
    { id: 'gi8', text: 'Protocol', correctGroup: 'delivery' },
    { id: 'gi9', text: 'Header Checksum', correctGroup: 'validation' },
    { id: 'gi10', text: 'Identification', correctGroup: 'fragmentation' },
    { id: 'gi11', text: 'IP Flag', correctGroup: 'fragmentation' },
    { id: 'gi12', text: 'Fragment Offset', correctGroup: 'fragmentation' },
    { id: 'gi13', text: 'IP Option', correctGroup: 'identity' },
    { id: 'gi14', text: 'Data', correctGroup: 'delivery' },
  ];
  const headerMatchingPairs: MatchingPair[] = [
    { left: 'Source Address', right: 'Menentukan alamat pengirim paket.' },
    { left: 'Destination Address', right: 'Menentukan alamat tujuan paket.' },
    { left: 'TTL', right: 'Membatasi perjalanan paket.' },
    { left: 'Protocol', right: 'Menentukan protokol layer atas.' },
    { left: 'Header Checksum', right: 'Memeriksa kesalahan header.' },
    { left: 'Identification', right: 'Identitas paket saat fragmentasi.' },
  ];
  const argumentPrompt = 'Jelaskan secara singkat mengapa komponen-komponen pada IP Header memiliki fungsi penting dalam pengiriman data jaringan. Bagaimana fungsi setiap komponen tersebut membantu paket data mencapai tujuan dengan benar?';

  const [phase, setPhase] = useState<'intro' | 'consistency' | 'matching' | 'argument' | 'conclusion'>('intro');
  const [groupData, setGroupData] = useState<any>(null);
  const [matchingData, setMatchingData] = useState<any>(null);
  const [argumentText, setArgumentText] = useState('');
  const [conclusionText, setConclusionText] = useState('');
  const [isRestored, setIsRestored] = useState(false);
  const showArgumentBox = phase === 'argument' || !!matchingData?.showArgument || !!argumentText;
  const argumentSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tracker.isLoading && tracker.session?.latestSnapshot && !isRestored) {
      const snap = tracker.session.latestSnapshot;
      if (snap.phase) setPhase(snap.phase === 'explore' ? 'intro' : snap.phase === 'argument' ? 'matching' : snap.phase);
      if (snap.groupData) setGroupData(snap.groupData);
      if (snap.matchingData) setMatchingData(snap.matchingData);
      if (snap.argumentText) setArgumentText(snap.argumentText);
      if (snap.conclusionText) setConclusionText(snap.conclusionText);
      setIsRestored(true);
    } else if (!tracker.isLoading) {
      setIsRestored(true);
    }
  }, [tracker.isLoading, tracker.session, isRestored]);

  useEffect(() => {
    if (!isRestored) return;
    const progressMap = { intro: 25, consistency: 50, matching: 68, argument: 78, conclusion: 90 } as const;
    void tracker.saveSnapshot(
      { phase, groupData, matchingData, argumentText, conclusionText },
      { progressPercent: progressMap[phase] },
    );
  }, [argumentText, conclusionText, groupData, isRestored, matchingData, phase, tracker]);

  useEffect(() => {
    if (!isRestored) return;
    let trackerPhase: 'consistency' | 'arguing' | 'conclusion' = 'consistency';
    if (phase === 'matching' || phase === 'argument') trackerPhase = 'arguing';
    if (phase === 'conclusion') trackerPhase = 'conclusion';
    onTrackerPhase?.(trackerPhase);
  }, [isRestored, onTrackerPhase, phase]);

  useEffect(() => {
    if (!showArgumentBox) return;
    const timer = window.setTimeout(() => {
      argumentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 180);
    return () => window.clearTimeout(timer);
  }, [showArgumentBox]);

  if (tracker.isLoading || !isRestored) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-12 h-12 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-bold text-[#395886]">Memuat progres...</p>
    </div>
  );

  if (phase === 'intro') {
    return <IpHeaderIntro onComplete={() => setPhase('consistency')} />;
  }

  if (phase === 'consistency') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <GroupClassifier
          groups={headerGroups}
          groupItems={headerGroupItems}
          lessonId={lessonId}
          stageIndex={stageIndex}
          initialData={groupData}
          activityTitle="Kelompokkan Komponen IP Header Sesuai Fungsinya"
          poolHint="Komponen IP Header - seret ke kategori fungsi yang tepat"
          onComplete={(data) => setGroupData(data)}
          onNext={() => {
            void tracker.trackEvent('inquiry_consistency_completed', {}, { progressPercent: 58 });
            setPhase('matching');
          }}
        />
      </div>
    );
  }

  if (phase === 'matching' || phase === 'argument') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <MatchingPhase
          pairs={headerMatchingPairs}
          lessonId={lessonId}
          stageIndex={stageIndex}
          shuffleRight
          completeLabel="Lanjut ke Argumen Logis"
          activityLabel="Aktivitas Kemampuan Berargumen"
          activityTitle="Pasangkan Komponen IP Header dengan Fungsinya"
          leftColumnLabel="Komponen IP Header"
          rightColumnLabel="Fungsi Komponen"
          successTitle="Jawaban Benar"
          successDescription="Pasangan yang kamu buat sudah sesuai. Komponen seperti Source Address, Destination Address, TTL, Protocol, Header Checksum, dan Identification bekerja sama agar paket dapat dikenali, diarahkan, dibatasi perjalanannya, dan diperiksa saat dikirim di jaringan."
          autoAdvanceOnExhausted
          initialData={matchingData}
          onComplete={(state) => setMatchingData(state)}
          onNext={() => {
            setMatchingData((prev: any) => ({ ...prev, validated: true, showArgument: true }));
            void tracker.trackEvent('inquiry_matching_completed', {}, { progressPercent: 72 });
            setPhase('argument');
          }}
        />

        {showArgumentBox && (
          <div ref={argumentSectionRef} className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#D5DEEF]" />
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#395886] to-[#628ECB] shadow-sm">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Kemampuan Berargumen</span>
              </div>
              <div className="flex-1 h-px bg-[#D5DEEF]" />
            </div>

            <InquiryEssayBox
              objectiveLabel="X.IP.2"
              headerLabel="Argumen Logis"
              prompt={argumentPrompt}
              submitLabel="Simpan Argumen"
              minWords={10}
              defaultValue={argumentText}
              disabled={!!argumentText}
              onSubmit={(text) => setArgumentText(text)}
            />

            {argumentText && (
              <ContinueActivityButton
                onClick={() => {
                  void tracker.trackEvent('inquiry_arguing_completed', {}, { progressPercent: 82 });
                  setPhase('conclusion');
                }}
                label="Lanjutkan ke Refleksi Inquiry"
              />
            )}
          </div>
        )}
      </div>
    );
  }

  if (phase === 'conclusion') {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
        <ATPConclusionBox
          atpBehavior="mampu menguraikan komponen IP Header beserta fungsinya melalui aktivitas inquiry secara runtut"
          objectiveCode="X.IP.2"
          stageType="inquiry"
          minWords={10}
          defaultValue={conclusionText}
          disabled={!!conclusionText}
          onSubmit={(text) => {
            setConclusionText(text);
            const finalAnswer = { groupData, matchingData, essay1: argumentText, conclusion: text, summary: text };
            void tracker.complete(finalAnswer, { phase: 'conclusion', finalAnswer });
            onComplete(finalAnswer);
          }}
        />

        {conclusionText && (
          <IndicatorSummaryCard
            consistency={
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#628ECB]/8 border border-[#628ECB]/15">
                  <CheckCircle className="w-4 h-4 text-[#628ECB] shrink-0" />
                  <span className="text-xs font-bold text-[#395886]">14 komponen IP Header dikategorikan ke 5 kelompok fungsi (Identitas, Pengalamatan, Pengaturan Pengiriman, Pemeriksaan Kesalahan, Fragmentasi)</span>
                </div>
              </div>
            }
            arguing={
              <div className="px-3 py-2.5 rounded-xl bg-[#FFFBEB] border border-[#F59E0B]/20">
                <p className="text-xs text-[#78350F] leading-relaxed">{argumentText}</p>
              </div>
            }
            conclusion={
              <div className="px-3 py-2.5 rounded-xl bg-[#ECFDF5] border border-[#10B981]/20">
                <p className="text-xs text-[#065F46] leading-relaxed">{conclusionText}</p>
              </div>
            }
          />
        )}
      </div>
    );
  }

  return null;
}

// -- Group Classifier ----------------------------------------------------------

const DRAG_GC = 'GC_ITEM';

function GCChip({ id, text, validated, isCorrect, isWrong }: {
  id: string; text: string; validated: boolean; isCorrect?: boolean; isWrong?: boolean;
}) {
  const [{ isDragging }, drag] = useDrag({
    type: DRAG_GC,
    item: { id },
    canDrag: !validated,
    collect: m => ({ isDragging: m.isDragging() }),
  });
  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`px-3 py-1.5 rounded-lg border-2 font-mono text-xs font-bold select-none transition-all
        ${!validated ? 'cursor-grab hover:scale-105 bg-[#F0F3FA] border-[#D5DEEF] text-[#395886]' : ''}
        ${validated && isCorrect ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46] cursor-default' : ''}
        ${validated && isWrong ? 'bg-red-50 border-red-300 text-red-600 cursor-default' : ''}
        ${isDragging ? 'opacity-30 cursor-grabbing' : ''}`}
    >
      {text}{validated && (isCorrect ? ' ✓' : isWrong ? ' ✗' : '')}
    </div>
  );
}

function GCZone({ group, items, allItems, validated, onDrop }: {
  group: Group; items: GroupItem[]; allItems: GroupItem[]; validated: boolean;
  onDrop: (groupId: string, itemId: string) => void;
}) {
  const cm = colorMap[group.colorClass] || colorMap.blue;
  const [{ isOver }, drop] = useDrop({
    accept: DRAG_GC,
    drop: (d: { id: string }) => onDrop(group.id, d.id),
    collect: m => ({ isOver: m.isOver() }),
  });
  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`rounded-2xl border-2 p-4 min-h-[100px] transition-all duration-300
        ${validated ? `${cm.bg} ${cm.border}` : isOver ? `${cm.bg} ${cm.border}` : 'bg-white border-[#D5DEEF]'}`}
    >
      <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${cm.text}`}>{group.label}</p>
      <div className="flex flex-wrap gap-1.5 min-h-[36px]">
        {items.length === 0 ? (
          <span className="text-[10px] text-[#395886]/25 italic font-bold self-center w-full text-center py-1">
            {validated ? '(Kosong)' : 'Seret IP ke sini...'}
          </span>
        ) : items.map(item => {
          const isCorrect = validated && item.correctGroup === group.id;
          const isWrong = validated && item.correctGroup !== group.id;
          return (
            <GCChip key={item.id} id={item.id} text={item.text} validated={validated} isCorrect={isCorrect} isWrong={isWrong} />
          );
        })}
      </div>
    </div>
  );
}

function GroupClassifier({ groups, groupItems, initialData, onComplete, onNext, activityTitle, poolHint, lessonId, stageIndex }: {
  groups: Group[]; groupItems: GroupItem[];
  initialData?: any;
  onComplete: (data: any) => void;
  onNext?: () => void;
  activityTitle?: string;
  poolHint?: string;
  lessonId?: string;
  stageIndex?: number;
}) {
  const user = getCurrentUser();
  const [placements, setPlacements] = useState<Record<string, string>>(initialData?.placements || {});
  const [validated, setValidated] = useState(initialData?.validated || false);
  const [attempts, setAttempts] = useState(0);

  const unplaced = groupItems.filter(item => !placements[item.id]);
  const allPlaced = unplaced.length === 0;
  const correctCount = Object.entries(placements).filter(([itemId, groupId]) =>
    groupItems.find(i => i.id === itemId)?.correctGroup === groupId
  ).length;
  const hasAttemptLimit = !!lessonId && stageIndex !== undefined;

  useEffect(() => {
    if (initialData?.validated) setValidated(true);
  }, [initialData]);

  useEffect(() => {
    if (!hasAttemptLimit) return;
    getLessonProgress(user!.id, lessonId!).then((p) => {
      setAttempts(p.stageAttempts[`stage_${stageIndex}_group`] || 0);
    });
  }, [hasAttemptLimit, lessonId, stageIndex, user]);

  const handleDrop = (groupId: string, itemId: string) => {
    if (validated) return;
    setPlacements(prev => ({ ...prev, [itemId]: groupId }));
  };

  const handleValidate = async () => {
    if (hasAttemptLimit) {
      const nextAttempts = await saveStageAttempt(user!.id, lessonId!, stageIndex!, correctCount === groupItems.length, `stage_${stageIndex}_group`);
      setAttempts(nextAttempts);
    }
    setValidated(true);
    const data = { placements, validated: true, correctCount, total: groupItems.length };
    onComplete(data);
  };

  const handleRetry = () => {
    const nextPlacements = { ...placements };
    Object.keys(nextPlacements).forEach((itemId) => {
      const correctGroup = groupItems.find((item) => item.id === itemId)?.correctGroup;
      if (nextPlacements[itemId] !== correctGroup) delete nextPlacements[itemId];
    });
    setPlacements(nextPlacements);
    setValidated(false);
    onComplete({ placements: nextPlacements });
  };

  const attemptsExhausted = hasAttemptLimit && attempts >= 3;
  const isCorrect = correctCount === groupItems.length;

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-700">
      <div className="bg-white rounded-2xl border-2 border-[#10B981]/25 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#10B981]/10 to-[#628ECB]/5 border-b border-[#10B981]/15">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#10B981]/15">
            <Tag className="w-5 h-5 text-[#10B981]" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#10B981]">Aktivitas Klasifikasi</p>
            <h3 className="text-sm font-bold text-[#395886]">{activityTitle ?? 'Kelompokkan Analogi Fungsi yang Tepat'}</h3>
          </div>
          {hasAttemptLimit && !validated && (
            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${
              attemptsExhausted ? 'text-red-500 bg-red-50 border border-red-200' : 'text-[#10B981] bg-[#10B981]/10'
            }`}>
              <AlertCircle className="w-3 h-3" /> {attemptsExhausted ? 'Habis' : `${3 - attempts} percobaan`}
            </span>
          )}
          {validated && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-full">
              <CheckCircle className="w-3 h-3" /> {correctCount}/{groupItems.length} Benar
            </span>
          )}
        </div>
      </div>

      {!validated && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-[#D5DEEF] p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40 mb-3">{poolHint ?? 'Alamat IP — Seret ke kelas yang tepat'}</p>
          {unplaced.length === 0 ? (
            <p className="text-xs text-[#10B981] font-bold italic text-center py-1">Semua sudah ditempatkan! Klik "Periksa Klasifikasi".</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {unplaced.map(item => <GCChip key={item.id} id={item.id} text={item.text} validated={false} />)}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {groups.map(group => (
          <GCZone
            key={group.id}
            group={group}
            items={groupItems.filter(item => placements[item.id] === group.id)}
            allItems={groupItems}
            validated={validated}
            onDrop={handleDrop}
          />
        ))}
      </div>

      {validated && attemptsExhausted && !isCorrect && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Kunci Jawaban</p>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-3">
            {groups.map(group => {
              const cm = colorMap[group.colorClass] || colorMap.blue;
              return (
                <div key={group.id} className="bg-white rounded-xl p-3 border border-amber-100">
                  <p className={`text-[10px] font-black uppercase tracking-wider mb-2 ${cm.text}`}>{group.label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {groupItems.filter(i => i.correctGroup === group.id).map(item => (
                      <span key={item.id} className={`px-2 py-1 rounded-lg text-xs font-bold font-mono ${cm.bg} ${cm.text} border ${cm.border}`}>{item.text}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {validated && isCorrect && (
        <div className="bg-[#ECFDF5] border-2 border-[#10B981]/25 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-[#10B981]" />
            <p className="text-[10px] font-black uppercase tracking-widest text-[#10B981]">Jawaban Benar</p>
          </div>
          <p className="text-sm font-bold text-[#065F46] mb-2">
            Pengelompokanmu sudah tepat.
          </p>
          <p className="text-xs leading-relaxed text-[#065F46]/80">
            Komponen IP Header dipahami lebih logis jika dilihat dari fungsinya: ada komponen untuk identitas paket, ada yang mengatur alamat sumber dan tujuan, ada yang mengontrol pengiriman, ada yang memeriksa kesalahan, dan ada yang membantu proses fragmentasi paket.
          </p>
        </div>
      )}

      {!validated ? (
        <button
          onClick={handleValidate}
          disabled={!allPlaced}
          className={`w-full py-3.5 rounded-xl font-black text-sm transition-all active:scale-95 ${
            allPlaced ? 'bg-[#10B981] text-white hover:bg-[#059669] shadow-lg shadow-green-200' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'
          }`}
        >
          {allPlaced ? 'Periksa Klasifikasi' : `Tempatkan ${unplaced.length} komponen lagi`} <ChevronRight className="w-4 h-4 ml-1 inline" />
        </button>
      ) : hasAttemptLimit && !isCorrect && !attemptsExhausted ? (
        <button
          onClick={handleRetry}
          className="w-full py-3.5 rounded-xl font-black text-sm transition-all active:scale-95 bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Perbaiki yang Salah ({3 - attempts} sisa)
        </button>
      ) : hasAttemptLimit && (isCorrect || attemptsExhausted) ? (
        <button
          onClick={() => onNext?.()}
          className="w-full py-3.5 rounded-xl font-black text-sm transition-all active:scale-95 bg-[#10B981] text-white hover:bg-[#059669] shadow-lg shadow-green-200"
        >
          Lanjut ke Aktivitas Berikutnya <ChevronRight className="w-4 h-4 ml-1 inline" />
        </button>
      ) : (
        <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 text-sm font-black text-[#065F46]">
          <CheckCircle className="w-4 h-4" /> Klasifikasi selesai - lanjut ke aktivitas berikutnya
        </div>
      )}
    </div>
  );
}

// -- Main InquiryStage Router (pure router — no hooks) -------------------------

export function InquiryStage(props: InquiryStageProps) {
  if (props.lessonId === '1') return <InquiryLesson1Page {...props} />;
  if (props.lessonId === '3') return <InquiryLesson3Page {...props} />;
  return <InquiryStageGeneric {...props} />;
}

function InquiryStageGeneric(props: InquiryStageProps) {
  const { lessonId, stageIndex, onComplete, onTrackerPhase } = props;

  const tracker = useActivityTracker({
    lessonId,
    stageIndex,
    stageType: 'inquiry',
  });

  const [phase, setPhase] = useState<'material' | 'explore' | 'analyzer' | 'activities' | 'conclusion'>('material');
  const [subPhase, setSubPhase] = useState<'flow' | 'group' | 'matching'>('flow');
  const [flowData, setFlowData] = useState<any>(null);
  const [groupData, setGroupData] = useState<any>(null);
  const [matchingData, setMatchingData] = useState<any>(null);
  const [activityStep, setActivityStep] = useState(1);
  const [reflection1, setReflection1] = useState('');
  const [reflection2, setReflection2] = useState('');
  const [conclusionText, setConclusionText] = useState('');
  const [isRestored, setIsRestored] = useState(false);
  const [pendingNextSubPhase, setPendingNextSubPhase] = useState<'group' | 'matching' | null>(null);

  useEffect(() => {
    if (!tracker.isLoading && tracker.session?.latestSnapshot && !isRestored) {
      const snap = tracker.session.latestSnapshot;
      if (snap.phase) setPhase(snap.phase);
      if (snap.subPhase) setSubPhase(snap.subPhase);
      if (snap.flowData) setFlowData(snap.flowData);
      if (snap.groupData) setGroupData(snap.groupData);
      if (snap.matchingData) setMatchingData(snap.matchingData);
      if (snap.activityStep) setActivityStep(snap.activityStep);
      if (snap.reflection1) setReflection1(snap.reflection1);
      if (snap.reflection2) setReflection2(snap.reflection2);
      if (snap.conclusionText) setConclusionText(snap.conclusionText);
      if (snap.pendingNextSubPhase) setPendingNextSubPhase(snap.pendingNextSubPhase);
      setIsRestored(true);
    } else if (!tracker.isLoading) {
      setIsRestored(true);
    }
  }, [tracker.isLoading, tracker.session, isRestored]);

  useEffect(() => {
    if (!isRestored) return;
    const progressMap = { material: 10, explore: 30, analyzer: 45, activities: 65, conclusion: 90 } as const;
    void tracker.saveSnapshot(
      {
        phase, subPhase, flowData, groupData, matchingData,
        activityStep, reflection1, reflection2, conclusionText,
        pendingNextSubPhase,
        hasFlow: !!props.flowItems?.length,
        hasGroup: !!props.groupItems?.length,
        hasMatching: !!props.matchingPairs?.length,
      },
      { progressPercent: progressMap[phase] + (phase === 'activities' ? (subPhase === 'flow' ? 0 : subPhase === 'group' ? 10 : 20) : 0) },
    );
  }, [activityStep, flowData, groupData, isRestored, matchingData, pendingNextSubPhase, phase, props.flowItems?.length, props.groupItems?.length, props.matchingPairs?.length, reflection1, reflection2, subPhase, tracker]);

  // Report tracker phase to parent for LogicalThinkingTracker
  useEffect(() => {
    if (!isRestored) return;
    let tp: 'consistency' | 'arguing' | 'conclusion';
    if (phase === 'conclusion') tp = 'conclusion';
    else if (phase === 'activities' && activityStep >= 2) tp = 'arguing';
    else tp = 'consistency';
    onTrackerPhase?.(tp);
  }, [phase, activityStep, isRestored, onTrackerPhase]);

  if (tracker.isLoading || !isRestored) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-12 h-12 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-bold text-[#395886]">Memuat progres...</p>
    </div>
  );

  if (phase === 'material') return <MaterialViewer material={props.material} onNext={() => setPhase('explore')} />;
  if (phase === 'explore') return (
    <ExplorePhase
      explorationSections={props.explorationSections ?? []}
      useGenericTitles
      subtitle={
        props.lessonId === '2' ? 'Pelajari Mekanisme TCP Sequence Number secara Mendalam' : undefined
      }
      onNext={() => {
        if (props.lessonId === '3') setPhase('analyzer');
        else {
          setPhase('activities');
          if (props.flowItems) setSubPhase('flow');
          else if (props.groups) setSubPhase('group');
          else if (props.matchingPairs) setSubPhase('matching');
        }
      }}
    />
  );

  if (phase === 'analyzer' && props.lessonId === '3') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
         <Ipv4Analyzer />
         <div className="w-full flex justify-center">
            <button 
              onClick={() => {
                setPhase('activities');
                if (props.flowItems) setSubPhase('flow');
                else if (props.groups) setSubPhase('group');
                else if (props.matchingPairs) setSubPhase('matching');
              }}
              className="px-10 py-4 rounded-2xl bg-[#10B981] text-white font-black shadow-lg shadow-green-200 hover:scale-105 transition-all"
            >
               Lanjut ke Aktivitas Klasifikasi <ChevronRight className="w-5 h-5 ml-1 inline" />
            </button>
         </div>
      </div>
    );
  }

  if (phase === 'activities') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        {subPhase === 'flow' && props.flowItems && (
          <>
            <DragDropLayerSorter
              flowItems={props.flowItems}
              lessonId={props.lessonId}
              stageIndex={props.stageIndex}
              title={props.lessonId === '2' ? 'Susun Tahapan TCP Sequence Number' : undefined}
              instruction={props.flowInstruction}
              theme={props.lessonId === '2' ? 'sequence' : undefined}
              initialData={flowData}
              onComplete={(slots) => setFlowData({ slots })}
              onNext={() => {
                setFlowData((prev: any) => ({ ...prev, validated: true }));
                setActivityStep(2);
              }}
            />
            {activityStep >= 2 && props.inquiryReflection1 && (
              <InquiryEssayBox
                objectiveLabel={props.lessonId === '2' ? 'X.TCP.10' : 'Refleksi Aktivitas 1'}
                headerLabel={props.lessonId === '2' ? 'Argumen Logis' : undefined}
                prompt={props.inquiryReflection1}
                submitLabel={props.lessonId === '2' ? 'Simpan Argumen' : 'Submit Refleksi Aktivitas 1'}
                minWords={props.lessonId === '3' || props.lessonId === '4' ? 10 : 20}
                defaultValue={reflection1}
                disabled={!!reflection1}
                onSubmit={(text) => {
                  setReflection1(text);
                  if (props.groups && props.groupItems) setPendingNextSubPhase('group');
                  else if (props.matchingPairs) setPendingNextSubPhase('matching');
                  else if (props.conclusionPrompt) {
                    void tracker.trackEvent('inquiry_arguing_completed', {}, { progressPercent: 80 });
                    setPhase('conclusion');
                  } else {
                    const finalAnswer = { flowData, reflection1: text, summary: text };
                    void tracker.complete(finalAnswer, { phase: 'done', finalAnswer });
                    onComplete(finalAnswer);
                  }
                }}
              />
            )}
            {reflection1 && pendingNextSubPhase && (
              <ContinueActivityButton
                onClick={() => {
                  const next = pendingNextSubPhase;
                  setPendingNextSubPhase(null);
                  setActivityStep(1);
                  setSubPhase(next);
                }}
                label={pendingNextSubPhase === 'group' ? 'Lanjutkan ke Aktivitas Klasifikasi Kelas IP' : 'Lanjutkan ke Aktivitas Pencocokan Fungsi Layer'}
              />
            )}
          </>
        )}

        {subPhase === 'group' && props.groups && props.groupItems && (
          <>
            <GroupClassifier
              groups={props.groups as Group[]}
              groupItems={props.groupItems as GroupItem[]}
              initialData={groupData}
              onComplete={(data) => setGroupData(data)}
              onNext={() => setActivityStep(2)}
            />
            {activityStep >= 2 && props.inquiryReflection2 && (
              <InquiryEssayBox
                objectiveLabel="Refleksi Aktivitas 2"
                prompt={props.inquiryReflection2}
                submitLabel="Submit Aktivitas Inquiry"
                minWords={props.lessonId === '3' || props.lessonId === '4' ? 10 : 20}
                onSubmit={(text) => {
                  setReflection2(text);
                  const finalAnswer = { flowData, groupData, reflection1, reflection2: text, summary: text };
                  void tracker.complete(finalAnswer, { phase: 'done', finalAnswer });
                  onComplete(finalAnswer);
                }}
              />
            )}
          </>
        )}

        {subPhase === 'matching' && props.matchingPairs && (
          <>
            <MatchingPhase
              pairs={props.matchingPairs}
              lessonId={props.lessonId}
              stageIndex={props.stageIndex}
              shuffleRight
              initialData={matchingData}
              onComplete={(state) => setMatchingData(state)}
              onNext={() => setActivityStep(2)}
            />
            {activityStep >= 2 && props.inquiryReflection2 && (
              <InquiryEssayBox
                objectiveLabel="Refleksi Aktivitas 2"
                prompt={props.inquiryReflection2}
                submitLabel="Submit Aktivitas Inquiry"
                minWords={props.lessonId === '3' || props.lessonId === '4' ? 10 : 20}
                onSubmit={(text) => {
                  setReflection2(text);
                  const finalAnswer = { flowData, matchingData, reflection1, reflection2: text, summary: text };
                  void tracker.complete(finalAnswer, { phase: 'done', finalAnswer });
                  onComplete(finalAnswer);
                }}
              />
            )}
          </>
        )}
      </div>
    );
  }

  if (phase === 'conclusion' && props.conclusionPrompt) {
    const atpBehaviorMap: Record<string, string> = {
      '2': 'mampu menguraikan mekanisme TCP Sequence Number dalam memastikan urutan pengiriman',
    };
    const objectiveCodeMap: Record<string, string> = {
      '2': 'X.TCP.10',
    };
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
        <ATPConclusionBox
          atpBehavior={atpBehaviorMap[props.lessonId] ?? props.conclusionPrompt}
          objectiveCode={objectiveCodeMap[props.lessonId] ?? ''}
          stageType="inquiry"
          minWords={props.lessonId === '3' || props.lessonId === '4' ? 10 : 15}
          defaultValue={conclusionText}
          disabled={!!conclusionText}
          onSubmit={(text) => {
            setConclusionText(text);
            const finalAnswer = { flowData, reflection1, reflection2, conclusion: text, summary: text };
            void tracker.complete(finalAnswer, { phase: 'conclusion', finalAnswer });
            onComplete(finalAnswer);
          }}
        />
        {conclusionText && (
          <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 animate-in fade-in zoom-in-95 duration-300">
            <CheckCircle className="w-5 h-5 text-[#10B981]" />
            <span className="text-sm font-black text-[#065F46]">Kesimpulan tersimpan — Tahap Inquiry selesai!</span>
          </div>
        )}
      </div>
    );
  }

  return null;
}
