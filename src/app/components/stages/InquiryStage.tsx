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
import { EssayBox, ContinueActivityButton } from './StageKit';

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
};

// -- Standardized Essay Box (Uses unified StageKit EssayBox) --------------------

function InquiryEssayBox({
  prompt, objectiveLabel, submitLabel, onSubmit, minWords = 20,
  defaultValue = '', disabled = false,
}: {
  prompt: string; objectiveLabel: string; submitLabel: string; onSubmit: (text: string) => void; minWords?: number;
  defaultValue?: string; disabled?: boolean;
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
    <div className="w-full space-y-4 animate-in fade-in duration-700">
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
          <button onClick={onNext || (() => onComplete(slots))} className="w-full py-3 rounded-xl bg-[#628ECB] text-white font-black text-sm hover:bg-[#395886] shadow-lg transition-all active:scale-95">Submit & Lanjut <ChevronRight className="w-4 h-4 ml-1 inline" /></button>
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

function ExplorePhase({ explorationSections, onNext, onBackToMaterial }: { explorationSections: ExplorationSection[]; onNext: () => void; onBackToMaterial?: () => void }) {
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

function MatchingPhase({ pairs, lessonId, stageIndex, onComplete, onNext, shuffleRight, completeLabel, initialData }: {
  pairs: MatchingPair[]; lessonId: string; stageIndex: number;
  onComplete: (matches: Record<string, string>) => void;
  onNext?: () => void;
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
    <div className="w-full space-y-6 animate-in fade-in duration-700">
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
                onClick={() => { onComplete(matches); onNext?.(); }}
                className="w-full py-4 rounded-2xl bg-[#10B981] text-white font-black text-sm hover:bg-[#059669] shadow-lg shadow-green-200 transition-all active:scale-95"
              >
                {completeLabel ?? 'Submit & Lanjut'} <ChevronRight className="w-4 h-4 ml-1 inline" />
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
    'Internet':    { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]', border: 'border-[#10B981]/30' },
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
                {['Application', 'Transport', 'Internet', 'Data Link', 'Physical'].map((name, i) => {
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

    // Sub-phase: Sorting (with OSI comparison panel as reference)
    if (consistencyStep === 'sorting') {
      const osiLayers = material?.osiLayers ?? [];
      const tcpColorMap: Record<string, { bg: string; text: string; border: string }> = {
        'Application': { bg: 'bg-[#8B5CF6]/10', text: 'text-[#8B5CF6]', border: 'border-[#8B5CF6]/30' },
        'Transport':   { bg: 'bg-[#628ECB]/10', text: 'text-[#628ECB]', border: 'border-[#628ECB]/30' },
        'Internet':    { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]', border: 'border-[#10B981]/30' },
        'Data Link':   { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/30' },
        'Physical':    { bg: 'bg-[#EC4899]/10', text: 'text-[#EC4899]', border: 'border-[#EC4899]/30' },
      };

      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {/* Back to material button */}
          <button
            onClick={() => setConsistencyStep('material')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#628ECB]/20 bg-[#628ECB]/5 text-[#628ECB] text-xs font-bold hover:bg-[#628ECB]/10 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" /> Lihat Materi Lagi
          </button>

          {/* OSI-TCP/IP Reference Panel (always visible during sorting) */}
          {osiLayers.length > 0 && (
            <div className="rounded-2xl border-2 border-[#8B5CF6]/15 bg-gradient-to-br from-purple-50/50 to-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-[#8B5CF6]" />
                <h4 className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">Panduan: OSI (7 Layer) → TCP/IP (5 Layer)</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* OSI Column */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#8B5CF6]/50 mb-2 text-center">OSI (7 Layer)</p>
                  <div className="space-y-1">
                    {osiLayers.map((l, i) => {
                      const tcp = tcpColorMap[l.mapsTo] ?? tcpColorMap['Application'];
                      return (
                        <div key={i} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${tcp.border} ${tcp.bg}`}>
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-white text-[10px] font-black text-[#8B5CF6]">{l.number}</span>
                          <span className="text-[11px] font-bold text-[#395886]">{l.name}</span>
                          <ArrowRight className="w-3 h-3 text-[#395886]/20 shrink-0 ml-auto" />
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* TCP/IP Column */}
                <div className="flex flex-col justify-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#10B981]/50 mb-2 text-center">TCP/IP (5 Layer)</p>
                  <div className="space-y-2">
                    {['Application', 'Transport', 'Internet', 'Data Link', 'Physical'].map((name) => {
                      const c = tcpColorMap[name] ?? tcpColorMap['Application'];
                      return (
                        <div key={name} className={`rounded-lg border-2 ${c.border} ${c.bg} py-2 px-3 text-center`}>
                          <p className={`text-[11px] font-black ${c.text}`}>{name} Layer</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

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

          {/* OSI-TCP/IP Comparison Explanation (appears after sorting validated) */}
          {sortingValidated && osiLayers.length > 0 && (
            <div className="rounded-2xl border-2 border-[#10B981]/25 bg-gradient-to-br from-[#ECFDF5] to-white p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-[#10B981]" />
                <h4 className="text-sm font-black text-[#065F46]">Hubungan OSI & TCP/IP</h4>
              </div>
              <p className="text-xs text-[#395886]/80 mb-4 leading-relaxed">
                TCP/IP menyederhanakan 7 layer OSI menjadi 5 layer. Tiga layer atas OSI — <strong>Application, Presentation, dan Session</strong> — digabungkan menjadi satu <strong>Application Layer</strong> di TCP/IP karena ketiganya menangani fungsi yang berkaitan langsung dengan aplikasi pengguna. Empat layer bawah lainnya bersesuaian langsung antara kedua model.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
                <p className="text-[10px] font-bold text-amber-800">
                  💡 <strong>Kunci:</strong> OSI adalah model referensi konseptual (7 layer), sedangkan TCP/IP adalah model praktis yang digunakan di internet sesungguhnya (5 layer). OSI membantu memahami konsep, TCP/IP adalah implementasi nyatanya.
                </p>
              </div>

              {/* Submit button to move to next phase */}
              <button
                onClick={() => {
                  void tracker.trackEvent('inquiry_consistency_completed', {}, { progressPercent: 55 });
                  setPhase('arguing');
                }}
                className="mt-5 w-full py-3 rounded-xl bg-[#10B981] text-white font-bold text-sm hover:bg-[#059669] shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Lanjut ke Kemampuan Berargumen
              </button>
            </div>
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
    const prompt = props.conclusionPrompt || 'Berdasarkan eksplorasi materi, penyusunan lapisan, dan aktivitas analogi yang telah kamu lakukan, jelaskan bagaimana kamu mampu menguraikan susunan lapisan model TCP/IP berdasarkan perbandingan dengan model OSI. Tuliskan secara runtut dengan kata-katamu sendiri.';

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
        {/* Phase Header */}
        <div className="bg-white rounded-2xl border-2 border-[#10B981]/25 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#10B981]/10 to-[#628ECB]/5 border-b border-[#10B981]/15">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#10B981]/15">
              <CheckCircle className="w-5 h-5 text-[#10B981]" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#10B981]">Penarikan Kesimpulan</p>
              <h3 className="text-sm font-bold text-[#395886]">Simpulkan Hasil Inquiry-mu</h3>
            </div>
          </div>
          <div className="px-5 py-3 bg-gradient-to-br from-[#10B981]/3 to-transparent">
            <p className="text-xs text-[#395886]/70 leading-relaxed">
              Fokus refleksi: simpulkan lapisan model TCP/IP beserta perbandingannya dengan model OSI menggunakan bahasamu sendiri.
            </p>
          </div>
        </div>

        <InquiryEssayBox
          objectiveLabel="X.TCP.2"
          prompt={prompt}
          submitLabel="Simpan Kesimpulan & Selesaikan Tahap"
          minWords={25}
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

function GroupClassifier({ groups, groupItems, initialData, onComplete, onNext }: {
  groups: Group[]; groupItems: GroupItem[];
  initialData?: any;
  onComplete: (data: any) => void;
  onNext?: () => void;
}) {
  const [placements, setPlacements] = useState<Record<string, string>>(initialData?.placements || {});
  const [validated, setValidated] = useState(initialData?.validated || false);

  const unplaced = groupItems.filter(item => !placements[item.id]);
  const allPlaced = unplaced.length === 0;
  const correctCount = Object.entries(placements).filter(([itemId, groupId]) =>
    groupItems.find(i => i.id === itemId)?.correctGroup === groupId
  ).length;

  useEffect(() => {
    if (initialData?.validated) setValidated(true);
  }, [initialData]);

  const handleDrop = (groupId: string, itemId: string) => {
    if (validated) return;
    setPlacements(prev => ({ ...prev, [itemId]: groupId }));
  };

  const handleValidate = () => {
    setValidated(true);
    const data = { placements, validated: true, correctCount, total: groupItems.length };
    onComplete(data);
    onNext?.();
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-700">
      <div className="bg-white rounded-2xl border-2 border-[#10B981]/25 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#10B981]/10 to-[#628ECB]/5 border-b border-[#10B981]/15">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#10B981]/15">
            <Tag className="w-5 h-5 text-[#10B981]" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#10B981]">Aktivitas Klasifikasi</p>
            <h3 className="text-sm font-bold text-[#395886]">Kelompokkan Alamat IP ke Kelas yang Tepat</h3>
          </div>
          {validated && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-full">
              <CheckCircle className="w-3 h-3" /> {correctCount}/{groupItems.length} Benar
            </span>
          )}
        </div>
      </div>

      {!validated && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-[#D5DEEF] p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40 mb-3">Alamat IP — Seret ke kelas yang tepat</p>
          {unplaced.length === 0 ? (
            <p className="text-xs text-[#10B981] font-bold italic text-center py-1">Semua sudah ditempatkan! Klik "Periksa Klasifikasi".</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {unplaced.map(item => <GCChip key={item.id} id={item.id} text={item.text} validated={false} />)}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
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

      {validated && correctCount < groupItems.length && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Kunci Jawaban</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
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

      {!validated ? (
        <button
          onClick={handleValidate}
          disabled={!allPlaced}
          className={`w-full py-3.5 rounded-xl font-black text-sm transition-all active:scale-95 ${
            allPlaced ? 'bg-[#10B981] text-white hover:bg-[#059669] shadow-lg shadow-green-200' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'
          }`}
        >
          {allPlaced ? 'Periksa Klasifikasi' : `Tempatkan ${unplaced.length} alamat lagi`} <ChevronRight className="w-4 h-4 ml-1 inline" />
        </button>
      ) : (
        <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 text-sm font-black text-[#065F46]">
          <CheckCircle className="w-4 h-4" /> Klasifikasi selesai — tulis refleksimu di bawah
        </div>
      )}
    </div>
  );
}

// -- Main InquiryStage Router --------------------------------------------------

/** Thin wrapper for lesson 1 — no router tracker to avoid double-tracker conflict */
function InquiryStageForLesson1(props: InquiryStageProps) {
  return <InquiryLesson1Page {...props} />;
}

export function InquiryStage(props: InquiryStageProps) {
  const { lessonId, stageIndex, onComplete, onTrackerPhase } = props;

  // Always call hooks unconditionally (React rule)
  const tracker = useActivityTracker({
    lessonId,
    stageIndex,
    stageType: 'inquiry',
  });

  const [phase, setPhase] = useState<'material' | 'explore' | 'analyzer' | 'activities'>('material');
  const [subPhase, setSubPhase] = useState<'flow' | 'group' | 'matching'>('flow');
  const [flowData, setFlowData] = useState<any>(null);
  const [groupData, setGroupData] = useState<any>(null);
  const [matchingData, setMatchingData] = useState<any>(null);
  const [activityStep, setActivityStep] = useState(1);
  const [reflection1, setReflection1] = useState('');
  const [reflection2, setReflection2] = useState('');
  const [isRestored, setIsRestored] = useState(false);
  const [pendingNextSubPhase, setPendingNextSubPhase] = useState<'group' | 'matching' | null>(null);

  // Lesson 1 uses its own InquiryLesson1Page with internal tracker (router tracker is unused)
  if (lessonId === '1') return <InquiryStageForLesson1 {...props} />;

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
      if (snap.pendingNextSubPhase) setPendingNextSubPhase(snap.pendingNextSubPhase);
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
        phase, subPhase, flowData, groupData, matchingData,
        activityStep, reflection1, reflection2,
        pendingNextSubPhase,
        hasFlow: !!props.flowItems?.length,
        hasGroup: !!props.groupItems?.length,
        hasMatching: !!props.matchingPairs?.length,
      },
      { progressPercent: progressMap[phase] + (phase === 'activities' ? (subPhase === 'flow' ? 0 : subPhase === 'group' ? 10 : 20) : 0) },
    );
  }, [activityStep, flowData, groupData, isRestored, matchingData, pendingNextSubPhase, phase, props.flowItems?.length, props.groupItems?.length, props.matchingPairs?.length, reflection1, reflection2, subPhase, tracker]);

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
              initialData={flowData}
              onComplete={(slots) => setFlowData({ slots })}
              onNext={() => {
                setFlowData((prev: any) => ({ ...prev, validated: true }));
                setActivityStep(2);
              }}
            />
            {activityStep >= 2 && props.inquiryReflection1 && (
              <InquiryEssayBox
                objectiveLabel="Refleksi Aktivitas 1"
                prompt={props.inquiryReflection1}
                submitLabel="Submit Refleksi Aktivitas 1"
                minWords={20}
                defaultValue={reflection1}
                disabled={!!reflection1}
                onSubmit={(text) => {
                  setReflection1(text);
                  if (props.groups && props.groupItems) setPendingNextSubPhase('group');
                  else if (props.matchingPairs) setPendingNextSubPhase('matching');
                  else {
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
                minWords={20}
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
              onComplete={(matches) => setMatchingData({ matches })}
              onNext={() => setActivityStep(2)}
            />
            {activityStep >= 2 && props.inquiryReflection2 && (
              <InquiryEssayBox
                objectiveLabel="Refleksi Aktivitas 2"
                prompt={props.inquiryReflection2}
                submitLabel="Submit Aktivitas Inquiry"
                minWords={20}
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

  return null;
}
