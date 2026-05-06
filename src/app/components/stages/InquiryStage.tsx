import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown, ChevronRight, CheckCircle, XCircle, RotateCcw, BookOpen,
  GripVertical, Info, AlertCircle, Layers, Tag, ArrowRight, PenLine,
  Link as LinkIcon, GraduationCap, Lightbulb
} from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import { getCurrentUser } from '../../utils/auth';
import { getLessonProgress, saveStageAttempt } from '../../utils/progress';
import { Ipv4Analyzer } from '../ui/Ipv4Analyzer';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { EssayBox } from './StageKit';

// -- Types ----------------------------------------------------------------------

interface ExplorationSection { id: string; title: string; content: string; example?: string }
interface Group { id: string; label: string; colorClass: 'blue' | 'green' | 'purple' | 'amber' | 'pink' | 'indigo' }
interface GroupItem { id: string; text: string; correctGroup: string }
interface FlowItem { id: string; text: string; correctOrder: number; description?: string; colorClass?: string }
interface MatchingPair { left: string; right: string }

interface InquiryStageProps {
  material?: {
    title: string;
    content: string[];
    examples?: string[];
  };
  explorationSections?: ExplorationSection[];
  groups?: Group[];
  groupItems?: GroupItem[];
  flowItems?: FlowItem[];
  flowInstruction?: string;
  matchingPairs?: MatchingPair[];
  inquiryReflection1?: string;
  inquiryReflection2?: string;
  lessonId: string;
  stageIndex: number;
  onComplete: (answer: any) => void;
  isCompleted?: boolean;
}

// -- Color maps -----------------------------------------------------------------

const colorMap = {
  blue:   { border: 'border-[#628ECB]', bg: 'bg-[#628ECB]/8', badge: 'bg-[#628ECB] text-white', light: 'bg-[#628ECB]/15 text-[#395886]' },
  green:  { border: 'border-[#10B981]', bg: 'bg-[#10B981]/8', badge: 'bg-[#10B981] text-white', light: 'bg-[#10B981]/15 text-[#065F46]' },
  purple: { border: 'border-[#8B5CF6]', bg: 'bg-[#8B5CF6]/8', badge: 'bg-[#8B5CF6] text-white', light: 'bg-[#8B5CF6]/15 text-[#4C1D95]' },
  amber:  { border: 'border-[#F59E0B]', bg: 'bg-[#F59E0B]/8', badge: 'bg-[#F59E0B] text-white', light: 'bg-[#F59E0B]/15 text-[#78350F]' },
  pink:   { border: 'border-[#EC4899]', bg: 'bg-[#EC4899]/8', badge: 'bg-[#EC4899] text-white', light: 'bg-[#EC4899]/15 text-[#831843]' },
  indigo: { border: 'border-[#6366F1]', bg: 'bg-[#6366F1]/8', badge: 'bg-[#6366F1] text-white', light: 'bg-[#6366F1]/15 text-[#312E81]' },
};

const flowLayerColors: Record<string, { gradient: string; borderB: string }> = {
  purple: { gradient: 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED]', borderB: 'border-b-[#6D28D9]' },
  blue:   { gradient: 'bg-gradient-to-r from-[#628ECB] to-[#395886]', borderB: 'border-b-[#1E3A5F]' },
  green:  { gradient: 'bg-gradient-to-r from-[#10B981] to-[#059669]', borderB: 'border-b-[#047857]' },
  amber:  { gradient: 'bg-gradient-to-r from-[#F59E0B] to-[#D97706]', borderB: 'border-b-[#B45309]' },
  pink:   { gradient: 'bg-gradient-to-r from-[#EC4899] to-[#DB2777]', borderB: 'border-b-[#9D174D]' },
};

// -- Standardized Essay Box (Uses unified StageKit EssayBox) --------------------

function InquiryEssayBox({
  prompt, objectiveLabel, submitLabel, onSubmit, minWords = 15,
}: {
  prompt: string; objectiveLabel: string; submitLabel: string; onSubmit: (text: string) => void; minWords?: number;
}) {
  return (
    <div className="mt-5">
      <EssayBox
        objectiveLabel={objectiveLabel}
        prompt={prompt}
        submitLabel={submitLabel}
        minChars={minWords * 5}
        onSubmit={onSubmit}
      />
    </div>
  );
}

// -- DnD Components ------------------------------------------------------------

const DRAG_LAYER = 'LAYER_SORT_CARD';
function DraggableFlowCard({ item }: { item: FlowItem }) {
  const colors = flowLayerColors[(item.colorClass as keyof typeof flowLayerColors) || 'blue'];
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

function DragDropLayerSorter({ flowItems, lessonId, stageIndex, onComplete, onNext, initialData }: {
  flowItems: FlowItem[]; lessonId: string; stageIndex: number; 
  onComplete: (currentSlots?: Record<number, string>) => void;
  onNext?: () => void;
  initialData?: { slots?: Record<number, string>; validated?: boolean };
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

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-700">
      <div className="bg-white rounded-2xl border-2 border-[#10B981]/25 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#10B981]/10 to-[#628ECB]/5 border-b border-[#10B981]/15">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#10B981]/15">
            <Layers className="w-5 h-5 text-[#10B981]" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#10B981]">X.TCP.3 - The Layer Sorting</p>
            <h3 className="text-sm font-bold text-[#395886]">Susun Urutan Lapisan TCP/IP</h3>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold
            ${attempts >= 3 ? 'border-red-200 bg-red-50 text-red-500' : 'border-[#10B981]/20 bg-white text-[#10B981]'}`}>
            <AlertCircle className="w-3 h-3" />
            {attempts >= 3 ? 'Habis' : `${3 - attempts} percobaan`}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-[#D5DEEF] shadow-sm p-5">
        {unplacedItems.length > 0 && (
          <div className="mb-6 p-4 bg-[#F8FAFF] rounded-2xl border-2 border-dashed border-[#D5DEEF]">
            <div className="flex flex-wrap gap-2.5">
              {unplacedItems.map(it => <DraggableFlowCard key={it.id} item={it} />)}
            </div>
          </div>
        )}

        <div className="space-y-1.5 mb-6">
          {flowItems.map((item, idx) => {
            const pos = idx + 1;
            const placedId = slots[pos];
            const placedItem = flowItems.find(f => f.id === placedId);
            const correct = validated && placedItem?.correctOrder === pos;
            return <FlowDropSlot key={pos} position={pos} placedItem={placedItem} validated={validated} isCorrect={correct} onDrop={handleDrop} />;
          })}
        </div>

        {!validated ? (
          <button onClick={handleValidate} disabled={!allPlaced}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${allPlaced ? 'bg-[#10B981] text-white hover:bg-[#059669] shadow-lg shadow-green-200' : 'bg-[#EEF2FF] text-[#395886]/30 cursor-not-allowed'}`}>
            Periksa Susunan
          </button>
        ) : isDone ? (
          <button onClick={onNext || (() => onComplete(slots))} className="w-full py-3 rounded-xl bg-[#628ECB] text-white font-black text-sm hover:bg-[#395886] shadow-lg transition-all active:scale-95">Lanjut ke Refleksi Praktik <ChevronRight className="w-4 h-4 ml-1 inline" /></button>
        ) : (
           <button onClick={handleRetry} className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm border-2 border-red-200 flex items-center justify-center gap-2">
             <RotateCcw className="w-4 h-4" /> Perbaiki yang Salah
           </button>
        )}
      </div>
    </div>
  );
}

// -- Explore Phase ------------------------------------------------------------

function ExplorePhase({ explorationSections, onNext }: { explorationSections: ExplorationSection[]; onNext: () => void }) {
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
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700">
      <div className="bg-white rounded-[2.5rem] border-2 border-[#D5DEEF] shadow-sm p-8 sm:p-10 text-center">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 text-left">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-[#628ECB]/10 flex items-center justify-center text-[#628ECB] shadow-inner">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#395886] tracking-tight uppercase">Eksplorasi Konsep</h3>
              <p className="text-xs font-bold text-[#395886]/40 uppercase tracking-widest mt-1">Pelajari Alur Pengiriman Data Melalui 5 Lapisan TCP/IP</p>
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
                  {config.title}
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
                          {section?.title} Layer
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

        <div className="mt-12">
          <button
            onClick={onNext}
            disabled={!allOpened}
            className={`w-full py-5 rounded-[1.5rem] font-black text-sm transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95
              ${allOpened ? 'bg-[#10B981] text-white hover:bg-[#059669] shadow-green-200' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed shadow-none'}`}
          >
            {allOpened ? 'Lanjut ke Aktivitas Tantangan' : `Selesaikan Eksplorasi (${openedIds.size}/${explorationSections.length})`}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// -- Matching Phase -----------------------------------------------------------

function MatchingPhase({ pairs, lessonId, stageIndex, onComplete, shuffleRight, completeLabel, initialData }: {
  pairs: MatchingPair[]; lessonId: string; stageIndex: number;
  onComplete: (matches: Record<string, string>) => void;
  shuffleRight?: boolean; completeLabel?: string;
  initialData?: { matches?: Record<string, string>; validated?: boolean };
}) {
  const user = getCurrentUser();
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>(initialData?.matches || {});
  const [validated, setValidated] = useState(initialData?.validated || false);
  const [attempts, setAttempts] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const rightRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [, forceUpdate] = useState({});

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
      onComplete(next);
      return next;
    });
    setSelectedLeft(null);
  };

  const isAllCorrect = pairs.every(p => matches[p.left] === p.right);

  const handleValidate = async () => {
    const ok = isAllCorrect;
    const newA = await saveStageAttempt(user!.id, lessonId, stageIndex, ok, `stage_${stageIndex}_matching`);
    setAttempts(newA);
    setValidated(true);
    onComplete(matches);
  };

  const handleRetry = () => { setValidated(false); setMatches({}); setSelectedLeft(null); onComplete({}); };

  const allMatched = Object.keys(matches).length === pairs.length;

  const renderLines = () => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    return Object.entries(matches).map(([left, right]) => {
      const lEl = leftRefs.current[left]; const rEl = rightRefs.current[right];
      if (!lEl || !rEl) return null;
      const lR = lEl.getBoundingClientRect(), rR = rEl.getBoundingClientRect();
      const x1 = lR.right - rect.left, y1 = lR.top + lR.height / 2 - rect.top;
      const x2 = rR.left - rect.left, y2 = rR.top + rR.height / 2 - rect.top;
      const ok = validated ? pairs.find(p => p.left === left)?.right === right : undefined;
      const color = ok === false ? '#EF4444' : ok === true ? '#10B981' : '#628ECB';
      return <line key={`${left}-${right}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="3" strokeDasharray={validated ? '' : '5,5'} className="transition-all" />;
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-700">
      <div className="bg-white rounded-[2rem] border-2 border-[#628ECB]/20 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 bg-[#628ECB]/5 border-b-2 border-[#628ECB]/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#628ECB]/15">
            <Tag className="w-5 h-5 text-[#628ECB]" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]">Aktivitas X.TCP.4</p>
            <h3 className="text-sm font-bold text-[#395886]">Cocokkan Fungsi pada Setiap Layer</h3>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold
            ${attempts >= 3 ? 'border-red-200 bg-red-50 text-red-500' : 'border-[#628ECB]/20 bg-white text-[#628ECB]'}`}>
            <AlertCircle className="w-3 h-3" />
            {attempts >= 3 ? 'Habis' : `${3 - attempts} percobaan`}
          </div>
        </div>

        <div className="p-8 relative" ref={containerRef}>
          <svg className="absolute inset-0 pointer-events-none z-0" style={{ width: '100%', height: '100%' }}>{renderLines()}</svg>
          <div className="grid grid-cols-2 gap-24 relative z-10">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40 mb-2 text-center">Lapisan (Layer)</p>
              {pairs.map(p => (
                <button
                  key={p.left}
                  ref={el => { leftRefs.current[p.left] = el; }}
                  onClick={() => handleLeftClick(p.left)}
                  disabled={validated}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300
                    ${selectedLeft === p.left ? 'border-[#F59E0B] bg-[#FFFBEB] scale-[1.02] shadow-md' :
                      matches[p.left] ? 'border-[#628ECB] bg-white shadow-sm' : 'border-[#D5DEEF] bg-white hover:border-[#628ECB]/40'}`}
                >
                  <span className="text-xs font-black uppercase tracking-tight text-[#395886]">{p.left}</span>
                </button>
              ))}
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40 mb-2 text-center">Fungsi Utama</p>
              {displayedRights.map((right, idx) => {
                const isMatched = Object.values(matches).includes(right);
                return (
                  <button
                    key={idx}
                    ref={el => { rightRefs.current[right] = el; }}
                    onClick={() => handleRightClick(right)}
                    disabled={validated}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300
                      ${isMatched ? 'border-[#628ECB] bg-white shadow-sm' : 'border-[#D5DEEF] bg-white hover:border-[#628ECB]/40'}`}
                  >
                    <span className="text-xs font-bold text-[#395886]/70 leading-relaxed">{right}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-12 space-y-4">
            {!validated ? (
              <button
                onClick={handleValidate}
                disabled={!allMatched}
                className={`w-full py-4 rounded-2xl font-black text-sm transition-all shadow-lg
                  ${allMatched ? 'bg-[#628ECB] text-white hover:bg-[#395886] shadow-blue-200' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed shadow-none'}`}
              >
                {allMatched ? 'Periksa Pasangan' : `Tentukan ${pairs.length - Object.keys(matches).length} pasangan lagi`}
              </button>
            ) : !isAllCorrect && attempts < 3 ? (
              <button
                onClick={handleRetry}
                className="w-full py-4 rounded-2xl bg-red-50 text-red-600 font-black text-sm border-2 border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Coba Lagi ({3 - attempts} percobaan sisa)
              </button>
            ) : (
              <button
                onClick={() => onComplete(matches)}
                className="w-full py-4 rounded-2xl bg-[#10B981] text-white font-black text-sm hover:bg-[#059669] shadow-lg shadow-green-200 transition-all active:scale-95"
              >
                {completeLabel ?? 'Lanjut ke Refleksi Analisis'} <ChevronRight className="w-4 h-4 ml-1 inline" />
              </button>
            )}

            {validated && !isAllCorrect && attempts >= 3 && (
              <div className="mt-6 p-6 rounded-[2rem] bg-amber-50 border-2 border-amber-200 animate-in fade-in zoom-in-95 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest">Kunci Jawaban Benar</h4>
                </div>
                <div className="space-y-2">
                  {pairs.map((p, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white/60 p-3 rounded-xl border border-amber-100">
                      <span className="text-[10px] font-black text-amber-700 uppercase min-w-[100px]">{p.left}</span>
                      <ArrowRight className="w-3 h-3 text-amber-400 mt-1 shrink-0" />
                      <span className="text-[11px] font-bold text-amber-800 leading-relaxed">{p.right}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// -- Material Viewer ----------------------------------------------------------

function MaterialViewer({ material, onNext }: { material: InquiryStageProps['material'], onNext: () => void }) {
  if (!material) return null;
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 text-center">
      <div className="bg-white rounded-2xl border-2 border-[#10B981]/20 shadow-sm overflow-hidden p-8">
        <div className="flex items-center gap-4 mb-8 text-left">
          <div className="w-14 h-14 rounded-2xl bg-[#10B981]/10 flex items-center justify-center shrink-0">
            <GraduationCap className="w-8 h-8 text-[#10B981]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#10B981] uppercase tracking-widest">Materi Pembelajaran</p>
            <h2 className="text-xl font-black text-[#395886]">{material.title}</h2>
          </div>
        </div>
        <div className="space-y-4 mb-8 text-left">
          {material.content.map((p, i) => <p key={i} className="text-[#395886]/80 text-sm leading-relaxed font-medium">{p}</p>)}
        </div>
        {material.examples && (
          <div className="bg-[#F8FAFF] rounded-2xl p-6 border-2 border-[#10B981]/10 mb-8 text-left">
            <div className="grid sm:grid-cols-2 gap-3">
              {material.examples.map((ex, i) => <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#D5DEEF]"><div className="w-2 h-2 rounded-full bg-[#10B981]" /><span className="text-xs font-bold text-[#395886]">{ex}</span></div>)}
            </div>
          </div>
        )}
        <button onClick={onNext} className="w-full py-4 rounded-2xl bg-[#10B981] text-white font-black text-sm shadow-lg active:scale-95 transition-all">Saya Sudah Memahami Materi <ArrowRight className="w-5 h-5 ml-2 inline" /></button>
      </div>
    </div>
  );
}

// -- Inquiry Lesson 1 Flow -----------------------------------------------------

function InquiryLesson1Page(props: InquiryStageProps) {
  const { material, explorationSections, flowItems, matchingPairs, inquiryReflection1, inquiryReflection2, lessonId, stageIndex, onComplete, isCompleted } = props;
  const tracker = useActivityTracker({ lessonId, stageIndex, stageType: 'inquiry' });

  const [phase, setPhase] = useState<'material' | 'explore' | 'activities' | 'activities2'>('material');
  const [activityStep, setActivityStep] = useState<number>(1); // 1: Sorting, 2: Essay1, 3: Next Page (X.TCP.4)
  const [reflection1, setReflection1] = useState('');
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, string>>({});
  const [reflection2, setReflection2] = useState('');
  const [flowData, setFlowData] = useState<any>(null);
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    if (!tracker.isLoading && tracker.session?.latestSnapshot && !isRestored) {
      const snap = tracker.session.latestSnapshot;
      if (snap.phase) setPhase(snap.phase);
      if (snap.activityStep) setActivityStep(snap.activityStep);
      if (snap.reflection1) setReflection1(snap.reflection1);
      if (snap.matchingAnswers) setMatchingAnswers(snap.matchingAnswers);
      if (snap.reflection2) setReflection2(snap.reflection2);
      if (snap.flowData) setFlowData(snap.flowData);
      setIsRestored(true);
    } else if (!tracker.isLoading) {
      setIsRestored(true);
    }
  }, [tracker.isLoading, tracker.session, isRestored]);

  useEffect(() => {
    if (!isRestored) return;
    const progressMap = { material: 10, explore: 30, activities: 55, activities2: 85 } as const;
    void tracker.saveSnapshot({
      phase, activityStep, reflection1, matchingAnswers, reflection2, flowData,
    }, { progressPercent: progressMap[phase] });
  }, [activityStep, flowData, isRestored, matchingAnswers, phase, reflection1, reflection2, tracker]);

  if (isCompleted) return (
    <div className="flex justify-center py-8">
      <button onClick={() => onComplete({})} className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#10B981] text-white font-black shadow-lg hover:scale-105 transition-all">
        Lanjut ke Tahap Questioning <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  if (tracker.isLoading || !isRestored) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-12 h-12 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-bold text-[#395886]">Memuat progres...</p>
    </div>
  );

  if (phase === 'material') return <MaterialViewer material={material} onNext={() => setPhase('explore')} />;
  if (phase === 'explore') return <ExplorePhase explorationSections={explorationSections ?? []} onNext={() => setPhase('activities')} />;

  if (phase === 'activities') {
    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 text-center">
        <DragDropLayerSorter
          flowItems={flowItems ?? []}
          lessonId={lessonId}
          stageIndex={stageIndex}
          initialData={flowData}
          onComplete={(slots) => setFlowData({ slots })}
          onNext={() => { setFlowData((prev: any) => ({ ...prev, validated: true })); setActivityStep(2); }}
        />

        {activityStep >= 2 && (
          <InquiryEssayBox
            objectiveLabel="X.TCP.3"
            prompt={inquiryReflection1 ?? '...'}
            submitLabel="Lanjut ke Aktivitas X.TCP.4"
            minWords={20}
            onSubmit={(text) => {
              setReflection1(text);
              setPhase('activities2');
              setActivityStep(1);
            }}
          />
        )}
      </div>
    );
  }

  if (phase === 'activities2') {
    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20 text-center">
         <MatchingPhase
            pairs={matchingPairs ?? []}
            lessonId={lessonId}
            stageIndex={stageIndex}
            shuffleRight
            onComplete={(m) => {
              setMatchingAnswers(m);
              setActivityStep(2);
            }}
          />

          {activityStep >= 2 && (
            <InquiryEssayBox
              objectiveLabel="X.TCP.4"
              prompt={inquiryReflection2 ?? '...'}
              submitLabel="Selesaikan Tahap Inquiry"
              minWords={20}
              onSubmit={(text) => {
                setReflection2(text);
                const finalAnswer = { reflection1, reflection2: text, matchingAnswers, type: 'lesson1_format', summary: text };
                void tracker.complete(finalAnswer, { phase: 'activities2', activityStep: 2, reflection1, reflection2: text, matchingAnswers, finalAnswer });
                onComplete(finalAnswer);
              }}
            />
          )}
      </div>
    );
  }

  return null;
}

// -- Main InquiryStage Router --------------------------------------------------

export function InquiryStage(props: InquiryStageProps) {
  const { lessonId, stageIndex, onComplete } = props;
  const tracker = useActivityTracker({
    lessonId,
    stageIndex,
    stageType: 'inquiry',
  });

  if (lessonId === '1') return <InquiryLesson1Page {...props} />;
  
  const [phase, setPhase] = useState<'material' | 'explore' | 'analyzer' | 'activities'>('material');
  const [subPhase, setSubPhase] = useState<'flow' | 'group' | 'matching'>('flow');
  const [flowData, setFlowData] = useState<any>(null);
  const [groupData, setGroupData] = useState<any>(null);
  const [matchingData, setMatchingData] = useState<any>(null);
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    if (!tracker.isLoading && tracker.session?.latestSnapshot && !isRestored) {
      const snap = tracker.session.latestSnapshot;
      if (snap.phase) setPhase(snap.phase);
      if (snap.subPhase) setSubPhase(snap.subPhase);
      if (snap.flowData) setFlowData(snap.flowData);
      if (snap.groupData) setGroupData(snap.groupData);
      if (snap.matchingData) setMatchingData(snap.matchingData);
      setIsRestored(true);
    } else if (!tracker.isLoading) {
      setIsRestored(true);
    }
  }, [tracker.isLoading, tracker.session, isRestored]);

  useEffect(() => {
    if (!isRestored) return;
    const progressMap = { material: 10, explore: 30, analyzer: 45, activities: 65 } as const;
    void tracker.saveSnapshot(
      {
        phase,
        subPhase,
        flowData,
        groupData,
        matchingData,
        hasFlow: !!props.flowItems?.length,
        hasGroup: !!props.groupItems?.length,
        hasMatching: !!props.matchingPairs?.length,
      },
      { progressPercent: progressMap[phase] + (phase === 'activities' ? (subPhase === 'flow' ? 0 : subPhase === 'group' ? 10 : 20) : 0) },
    );
  }, [flowData, groupData, isRestored, matchingData, phase, props.flowItems?.length, props.groupItems?.length, props.matchingPairs?.length, subPhase, tracker]);

  if (tracker.isLoading || !isRestored) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="w-12 h-12 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-bold text-[#395886]">Memuat progres...</p>
    </div>
  );

  if (phase === 'material') return <MaterialViewer material={props.material} onNext={() => setPhase('explore')} />;
  if (phase === 'explore') return <ExplorePhase explorationSections={props.explorationSections ?? []} onNext={() => {
    if (props.lessonId === '3') setPhase('analyzer');
    else {
      setPhase('activities');
      if (props.flowItems) setSubPhase('flow');
      else if (props.groups) setSubPhase('group');
      else if (props.matchingPairs) setSubPhase('matching');
    }
  }} />;

  if (phase === 'analyzer' && props.lessonId === '3') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
         <Ipv4Analyzer />
         <div className="max-w-4xl mx-auto flex justify-center">
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
    if (subPhase === 'flow' && props.flowItems) return <DragDropLayerSorter flowItems={props.flowItems} lessonId={props.lessonId} stageIndex={props.stageIndex} initialData={flowData} onComplete={(slots) => setFlowData({ slots })} onNext={() => {
       if (props.groups) setSubPhase('group');
       else if (props.matchingPairs) setSubPhase('matching');
       else {
         const finalAnswer = { flowData: { ...flowData, validated: true } };
         void tracker.complete(finalAnswer, { phase: 'activities', subPhase: 'flow', finalAnswer });
         onComplete(finalAnswer);
       }
    }} />;
    // Other phases (Lesson 2, 3, 4) would go here similarly with standardized UI
  }

  return null;
}
