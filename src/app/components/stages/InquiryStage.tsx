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

// -- Types ----------------------------------------------------------------------

interface ExplorationSection { id: string; title: string; content: string; example?: string }
interface Group { id: string; label: string; colorClass: 'blue' | 'green' | 'purple' | 'amber' | 'pink' | 'indigo' }
interface GroupItem { id: string; text: string; correctGroup: string }
interface FlowItem { id: string; text: string; correctOrder: number; description?: string; colorClass?: string }
interface LabelingSlot { id: string; label: string; description: string }
interface LabelingLabel { id: string; text: string; correctSlot: string }
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
  question?: string;
  flowItems?: FlowItem[];
  flowInstruction?: string;
  labelingSlots?: LabelingSlot[];
  labelingLabels?: LabelingLabel[];
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
type ColorKey = keyof typeof colorMap;

const flowLayerColors: Record<string, { gradient: string; borderB: string }> = {
  purple: { gradient: 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED]', borderB: 'border-b-[#6D28D9]' },
  blue:   { gradient: 'bg-gradient-to-r from-[#628ECB] to-[#395886]', borderB: 'border-b-[#1E3A5F]' },
  green:  { gradient: 'bg-gradient-to-r from-[#10B981] to-[#059669]', borderB: 'border-b-[#047857]' },
  amber:  { gradient: 'bg-gradient-to-r from-[#F59E0B] to-[#D97706]', borderB: 'border-b-[#B45309]' },
  pink:   { gradient: 'bg-gradient-to-r from-[#EC4899] to-[#DB2777]', borderB: 'border-b-[#9D174D]' },
};

// -- DnD Components ------------------------------------------------------------

const DRAG_GROUP = 'GROUP_ITEM';
function DraggableChip({ item, placed, validated, isCorrect }: { item: GroupItem; placed: boolean; validated: boolean; isCorrect?: boolean }) {
  const [{ isDragging }, drag] = useDrag({
    type: DRAG_GROUP,
    item: { id: item.id },
    canDrag: !validated,
    collect: (m) => ({ isDragging: m.isDragging() }),
  });
  let cls = 'bg-white border-[#D5DEEF] cursor-move hover:border-[#628ECB]/60 hover:shadow-sm';
  if (placed && validated) cls = isCorrect ? 'bg-[#10B981]/10 border-[#10B981] cursor-default' : 'bg-red-50 border-red-400 cursor-move';
  else if (placed) cls = 'bg-[#628ECB]/8 border-[#628ECB]/40 cursor-move';
  return (
    <div ref={drag as unknown as React.Ref<HTMLDivElement>} className={`flex items-center gap-2 px-3 py-2 border-2 rounded-xl text-xs font-bold text-[#395886] select-none transition-all ${cls} ${isDragging ? 'opacity-50' : ''}`}>
      {!validated && <GripVertical className="w-3.5 h-3.5 text-[#395886]/30 shrink-0" />}
      {placed && validated && (isCorrect ? <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />)}
      <span className="leading-snug">{item.text}</span>
    </div>
  );
}

function GroupBucket({ group, items, allItems, validated, onDrop }: { group: Group; items: string[]; allItems: GroupItem[]; validated: boolean; onDrop: (groupId: string, itemId: string) => void }) {
  const colors = colorMap[group.colorClass as ColorKey] || colorMap.blue;
  const [{ isOver }, drop] = useDrop({
    accept: DRAG_GROUP,
    drop: (dragged: { id: string }) => onDrop(group.id, dragged.id),
    collect: (m) => ({ isOver: m.isOver() }),
  });
  return (
    <div ref={drop as unknown as React.Ref<HTMLDivElement>} className={`rounded-2xl border-2 p-4 min-h-[140px] transition-all ${isOver ? `${colors.border} ${colors.bg} shadow-md` : 'border-[#D5DEEF] bg-[#F8FAFF]'}`}>
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase mb-3 ${colors.badge}`}>{group.label}</div>
      {items.length === 0 ? <p className="text-[10px] text-[#395886]/40 italic text-center py-5">Seret ke sini</p>
        : <div className="flex flex-wrap gap-2">{items.map(itemId => {
            const item = allItems.find(i => i.id === itemId);
            if (!item) return null;
            return <DraggableChip key={item.id} item={item} placed validated={validated} isCorrect={validated ? item.correctGroup === group.id : undefined} />;
          })}</div>}
    </div>
  );
}

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
        ${isDragging ? 'opacity-30 scale-90 cursor-grabbing' : 'cursor-grab hover:scale-105 hover:-translate-y-0.5 shadow-md hover:shadow-lg'}`}
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
  const posLabel = position === 1 ? 'Atas (dekat pengguna)' : position === 5 ? 'Bawah (fisik)' : null;

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
        ${isOver ? 'border-[#628ECB] bg-[#628ECB]/8 shadow-md scale-[1.01]' :
          placedItem ? 'border-transparent' : 'border-dashed border-[#D5DEEF] bg-[#F8FAFF]'}`}
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
            {isOver ? '(drop)' : (posLabel ?? `Posisi ${position}`)}
          </div>
        )}
      </div>
    </div>
  );
}

// -- Shared UI Sub-components --------------------------------------------------

function DragDropLayerSorter({ flowItems, flowInstruction, lessonId, stageIndex, onComplete }: {
  flowItems: FlowItem[]; flowInstruction?: string; lessonId: string; stageIndex: number; onComplete: () => void;
}) {
  const user = getCurrentUser();
  const [slots, setSlots] = useState<Record<number, string>>({});
  const [validated, setValidated] = useState(false);
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

  const handleDrop = (pos: number, id: string) => {
    if (validated) return;
    setSlots(prev => {
      const next = { ...prev };
      (Object.keys(next) as unknown as number[]).forEach(k => { if (next[Number(k)] === id) delete next[Number(k)]; });
      next[pos] = id;
      return next;
    });
  };

  const placedIds = new Set(Object.values(slots));
  const unplacedItems = shuffledPool.filter(it => !placedIds.has(it.id));
  const allPlaced = placedIds.size === flowItems.length;

  const isCorrectOrder = allPlaced && flowItems.every(item => {
    const pos = Number(Object.keys(slots).find(k => slots[Number(k)] === item.id));
    return pos === item.correctOrder;
  });

  const handleValidate = async () => {
    const ok = isCorrectOrder;
    const newA = await saveStageAttempt(user!.id, lessonId, stageIndex, ok, `stage_${stageIndex}_flow`);
    setAttempts(newA);
    setValidated(true);
  };

  const handleRetry = () => { setValidated(false); setSlots({}); };
  const isDone = validated && (isCorrectOrder || attempts >= 3);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="bg-white rounded-2xl border-2 border-[#10B981]/25 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#10B981]/10 to-[#628ECB]/5 border-b border-[#10B981]/15">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#10B981]/15">
            <Layers className="w-5 h-5 text-[#10B981]" />
          </div>
          <div className="flex-1">
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
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${allPlaced ? 'bg-[#10B981] text-white' : 'bg-[#EEF2FF] text-[#395886]/30 cursor-not-allowed'}`}>
            Periksa Susunan
          </button>
        ) : isDone ? (
          <button onClick={onComplete} className="w-full py-3 rounded-xl bg-[#628ECB] text-white font-bold text-sm">Lanjut</button>
        ) : (
           <button onClick={handleRetry} className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm">Coba Lagi</button>
        )}
      </div>
    </div>
  );
}

function InlineReflectionBox({ prompt, label = 'Refleksi Pemahaman', onDone }: {
  prompt: string; label?: string; onDone: (essay: string) => void;
}) {
  const [essay, setEssay] = useState('');
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl border-2 border-[#628ECB]/20 shadow-sm overflow-hidden p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#628ECB] mb-2">{label}</p>
      <p className="text-sm font-bold text-[#395886] mb-4">{prompt}</p>
      <textarea
        value={essay}
        onChange={e => setEssay(e.target.value)}
        disabled={submitted}
        rows={4}
        className="w-full p-4 rounded-xl border-2 border-[#D5DEEF] bg-[#F8FAFF] focus:bg-white focus:border-[#628ECB] outline-none transition-all text-sm"
        placeholder="Tuliskan refleksimu di sini..."
      />
      {!submitted ? (
        <button onClick={() => { setSubmitted(true); onDone(essay); }} disabled={essay.length < 30}
          className="mt-4 w-full py-3 rounded-xl bg-[#628ECB] text-white font-bold text-sm">Kirim Refleksi</button>
      ) : (
        <div className="mt-4 flex items-center gap-2 text-[#10B981] font-bold text-sm"><CheckCircle className="w-5 h-5" /> Refleksi tersimpan.</div>
      )}
    </div>
  );
}

// -- Matching Phase -----------------------------------------------------------

function MatchingPhase({ pairs, lessonId, stageIndex, onComplete, shuffleRight, completeLabel }: {
  pairs: MatchingPair[]; lessonId: string; stageIndex: number;
  onComplete: (matches: Record<string, string>) => void;
  shuffleRight?: boolean; completeLabel?: string;
}) {
  const user = getCurrentUser();
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [validated, setValidated] = useState(false);
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
  };

  const handleRetry = () => { setValidated(false); setMatches({}); setSelectedLeft(null); };

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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white rounded-[2rem] border-2 border-[#628ECB]/20 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 bg-[#628ECB]/5 border-b-2 border-[#628ECB]/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#628ECB]/15">
            <Tag className="w-5 h-5 text-[#628ECB]" />
          </div>
          <div className="flex-1">
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
                className="w-full py-4 rounded-2xl bg-[#10B981] text-white font-black text-sm hover:bg-[#059669] shadow-lg shadow-green-200 transition-all"
              >
                {completeLabel ?? 'Lanjut'}
              </button>
            )}

            {validated && !isAllCorrect && attempts >= 3 && (
              <div className="mt-6 p-6 rounded-[2rem] bg-amber-50 border-2 border-amber-200 animate-in fade-in zoom-in-95">
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

// -- Grouping Phase -----------------------------------------------------------

function GroupingPhase({ groups, items, lessonId, stageIndex, onComplete }: {
  groups: Group[]; items: GroupItem[]; lessonId: string; stageIndex: number; onComplete: (answer: any) => void;
}) {
  const user = getCurrentUser();
  const [placement, setPlacement] = useState<Record<string, string[]>>(
    Object.fromEntries(groups.map(g => [g.id, []]))
  );
  const [validated, setValidated] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    getLessonProgress(user!.id, lessonId).then(p => setAttempts(p.stageAttempts[`stage_${stageIndex}_group`] || 0));
  }, []);

  const handleDropToGroup = (groupId: string, itemId: string) => {
    if (validated) return;
    setPlacement(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(gId => { next[gId] = next[gId].filter(id => id !== itemId); });
      next[groupId] = [...next[groupId], itemId];
      return next;
    });
  };

  const placedItemIds = new Set(Object.values(placement).flat());
  const unplacedItems = items.filter(i => !placedItemIds.has(i.id));
  const allPlaced = placedItemIds.size === items.length;

  const handleValidate = async () => {
    const ok = items.every(i => placement[i.correctGroup]?.includes(i.id));
    const newA = await saveStageAttempt(user!.id, lessonId, stageIndex, ok, `stage_${stageIndex}_group`);
    setAttempts(newA); setValidated(true);
  };

  const handleRetry = () => {
    setValidated(false);
    setPlacement(Object.fromEntries(groups.map(g => [g.id, []])));
  };

  const isDone = validated && (items.every(i => placement[i.correctGroup]?.includes(i.id)) || attempts >= 3);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
       <div className="bg-white p-6 rounded-2xl border-2 border-[#D5DEEF] shadow-sm">
          {unplacedItems.length > 0 && (
            <div className="mb-8 p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
               <p className="text-[10px] font-black uppercase text-gray-400 mb-4 flex items-center gap-2">
                 <GripVertical className="w-3 h-3" /> Item Tersisa ({unplacedItems.length})
               </p>
               <div className="flex flex-wrap gap-2">
                  {unplacedItems.map(i => <DraggableChip key={i.id} item={i} placed={false} validated={false} />)}
               </div>
            </div>
          )}
          
          <div className="grid md:grid-cols-3 gap-4 mb-8">
             {groups.map(g => <GroupBucket key={g.id} group={g} items={placement[g.id]} allItems={items} validated={validated} onDrop={handleDropToGroup} />)}
          </div>

          {!validated ? (
            <button 
              onClick={handleValidate} 
              disabled={!allPlaced} 
              className={`w-full py-4 rounded-2xl font-black transition-all ${allPlaced ? 'bg-[#628ECB] text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              Periksa Pengelompokan
            </button>
          ) : isDone ? (
            <button 
              onClick={() => onComplete(placement)} 
              className="w-full py-4 rounded-2xl bg-[#10B981] text-white font-black shadow-lg shadow-green-200 hover:bg-[#059669] transition-all active:scale-95"
            >
              Selesaikan Aktivitas <ChevronRight className="w-4 h-4 inline ml-1" />
            </button>
          ) : (
             <button 
               onClick={handleRetry} 
               className="w-full py-4 rounded-2xl bg-red-50 text-red-600 font-bold border-2 border-red-100 hover:bg-red-100 transition-all active:scale-95"
             >
               Susun Ulang <RotateCcw className="w-4 h-4 inline ml-1" />
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
    { color: 'bg-[#8B5CF6]', hover: 'hover:bg-[#7C3AED]', border: 'border-[#8B5CF6]/20' },
    { color: 'bg-[#628ECB]', hover: 'hover:bg-[#395886]', border: 'border-[#628ECB]/20' },
    { color: 'bg-[#10B981]', hover: 'hover:bg-[#059669]', border: 'border-[#10B981]/20' },
    { color: 'bg-[#F59E0B]', hover: 'hover:bg-[#D97706]', border: 'border-[#F59E0B]/20' },
    { color: 'bg-[#EC4899]', hover: 'hover:bg-[#DB2777]', border: 'border-[#EC4899]/20' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2rem] border-2 border-[#D5DEEF] shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-[#628ECB]/10 flex items-center justify-center text-[#628ECB]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#395886] tracking-tight uppercase">Eksplorasi Konsep</h3>
            <p className="text-xs font-bold text-[#395886]/40 uppercase tracking-widest mt-1">Klik setiap lapisan untuk mempelajari fungsinya</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-stretch gap-3 mb-10 overflow-x-auto pb-4 scrollbar-hide">
          {explorationSections.map((section, idx) => {
            const config = layerConfigs[idx % layerConfigs.length];
            const isOpened = openedIds.has(section.id);
            const isActive = activeId === section.id;
            return (
              <div key={section.id} className="flex-1 min-w-[200px] flex flex-col">
                <button
                  onClick={() => handleToggle(section.id)}
                  className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-b-8 transition-all duration-300 group
                    ${config.color} ${config.hover} text-white shadow-md
                    ${isActive ? 'scale-[1.02] -translate-y-1' : ''}`}
                >
                  {isOpened && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="w-4 h-4 text-white/60" />
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-lg font-black">{idx + 1}</span>
                  </div>
                  <span className="font-black text-xs uppercase tracking-widest text-center leading-tight">
                    {section.title}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {activeId && (
          <div className="bg-[#F8FAFD] border-2 border-[#D5DEEF] rounded-[2rem] p-8 mb-8 animate-in zoom-in-95 duration-300">
            {(() => {
              const section = explorationSections.find(s => s.id === activeId);
              const idx = explorationSections.findIndex(s => s.id === activeId);
              const config = layerConfigs[idx % layerConfigs.length];
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-8 w-8 rounded-lg ${config.color} flex items-center justify-center text-white text-xs font-black`}>
                      {idx + 1}
                    </div>
                    <h4 className="text-lg font-black text-[#395886] uppercase tracking-tight">
                      {section?.title}
                    </h4>
                  </div>
                  <p className="text-sm text-[#395886]/80 leading-relaxed font-medium">
                    {section?.content}
                  </p>
                  {section?.example && (
                    <div className="mt-6 p-4 rounded-xl bg-white border border-[#D5DEEF] shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-[#F59E0B]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40">Contoh Implementasi</span>
                      </div>
                      <p className="text-xs font-bold text-[#628ECB] italic">
                        {section.example}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          <p className={`text-xs font-bold transition-all ${allOpened ? 'text-[#10B981]' : 'text-[#395886]/30'}`}>
            {allOpened ? 'Semua materi telah dieksplorasi!' : `${openedIds.size}/${explorationSections.length} materi dibuka`}
          </p>
          <button
            onClick={onNext}
            disabled={!allOpened}
            className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg
              ${allOpened ? 'bg-[#10B981] text-white hover:bg-[#059669] shadow-green-200' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed shadow-none'}`}
          >
            Lanjut ke Aktivitas
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// -- Material Viewer ----------------------------------------------------------

function MaterialViewer({ material, onNext }: { material: InquiryStageProps['material'], onNext: () => void }) {
  if (!material) return null;
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl border-2 border-[#10B981]/20 shadow-sm overflow-hidden p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#10B981]/10 flex items-center justify-center shrink-0">
            <GraduationCap className="w-8 h-8 text-[#10B981]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#10B981] uppercase tracking-widest">Materi Pembelajaran</p>
            <h2 className="text-xl font-black text-[#395886]">{material.title}</h2>
          </div>
        </div>
        <div className="space-y-4 mb-8">
          {material.content.map((p, i) => <p key={i} className="text-[#395886]/80 text-sm leading-relaxed font-medium">{p}</p>)}
        </div>
        {material.examples && (
          <div className="bg-[#F8FAFF] rounded-2xl p-6 border-2 border-[#10B981]/10 mb-8">
            <div className="grid sm:grid-cols-2 gap-3">
              {material.examples.map((ex, i) => <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#D5DEEF]"><div className="w-2 h-2 rounded-full bg-[#10B981]" /><span className="text-xs font-bold text-[#395886]">{ex}</span></div>)}
            </div>
          </div>
        )}
        <button onClick={onNext} className="w-full py-4 rounded-2xl bg-[#10B981] text-white font-black text-sm shadow-lg">Saya Sudah Memahami Materi <ArrowRight className="w-5 h-5 ml-2 inline" /></button>
      </div>
    </div>
  );
}

// -- Inquiry Lesson 1 Flow -----------------------------------------------------

function InquiryLesson1Page(props: InquiryStageProps) {
  const { material, explorationSections, flowItems, flowInstruction, matchingPairs, inquiryReflection1, inquiryReflection2, lessonId, stageIndex, onComplete, isCompleted } = props;
  const [phase, setPhase] = useState<'material' | 'explore' | 'activities'>('material');
  const [activityStep, setActivityStep] = useState<number>(1); // 1: X.TCP.3, 2: Refleksi 1, 3: X.TCP.4, 4: Refleksi 2

  const [reflection1, setReflection1] = useState('');
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, string>>({});
  const [reflection2, setReflection2] = useState('');

  if (isCompleted) return (
    <div className="flex justify-center py-8">
      <button onClick={() => onComplete({})} className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#10B981] text-white font-black shadow-lg hover:scale-105 transition-all">
        Lanjut ke Tahap Questioning <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  if (phase === 'material') return <MaterialViewer material={material} onNext={() => setPhase('explore')} />;
  if (phase === 'explore') return <ExplorePhase explorationSections={explorationSections ?? []} onNext={() => setPhase('activities')} />;

  // phase === 'activities'
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {activityStep === 1 && (
        <DragDropLayerSorter
          flowItems={flowItems ?? []}
          flowInstruction={flowInstruction}
          lessonId={lessonId}
          stageIndex={stageIndex}
          onComplete={() => setActivityStep(2)}
        />
      )}

      {activityStep === 2 && (
        <InlineReflectionBox
          label="Esai Mandiri (X.TCP.3)"
          prompt={inquiryReflection1 ?? '...'}
          onDone={(text) => {
            setReflection1(text);
            setActivityStep(3);
          }}
        />
      )}

      {activityStep === 3 && (
        <MatchingPhase
          pairs={matchingPairs ?? []}
          lessonId={lessonId}
          stageIndex={stageIndex}
          shuffleRight
          completeLabel="Lanjut ke Refleksi"
          onComplete={(m) => {
            setMatchingAnswers(m);
            setActivityStep(4);
          }}
        />
      )}

      {activityStep === 4 && (
        <InlineReflectionBox
          label="Esai Mandiri (X.TCP.4)"
          prompt={inquiryReflection2 ?? '...'}
          onDone={(text) => {
            setReflection2(text);
            onComplete({ reflection1, reflection2, matchingAnswers, type: 'lesson1_format' });
          }}
        />
      )}
    </div>
  );
}

// -- Main InquiryStage Router --------------------------------------------------

export function InquiryStage(props: InquiryStageProps) {
  if (props.lessonId === '1') return <InquiryLesson1Page {...props} />;
  
  // Dynamic Phase Router for other lessons
  const [phase, setPhase] = useState<'material' | 'explore' | 'analyzer' | 'activities'>('material');
  const [subPhase, setSubPhase] = useState<'flow' | 'group' | 'matching'>('flow');

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
    if (subPhase === 'flow' && props.flowItems) return <DragDropLayerSorter flowItems={props.flowItems} lessonId={props.lessonId} stageIndex={props.stageIndex} onComplete={() => {
       if (props.groups) setSubPhase('group');
       else if (props.matchingPairs) setSubPhase('matching');
       else props.onComplete({});
    }} />;
    if (subPhase === 'group' && props.groups && props.groupItems) return <GroupingPhase groups={props.groups} items={props.groupItems} lessonId={props.lessonId} stageIndex={props.stageIndex} onComplete={() => {
       if (props.matchingPairs) setSubPhase('matching');
       else props.onComplete({});
    }} />;
    if (subPhase === 'matching' && props.matchingPairs) return <MatchingPhase pairs={props.matchingPairs} lessonId={props.lessonId} stageIndex={props.stageIndex} onComplete={props.onComplete} />;
  }

  return null;
}
