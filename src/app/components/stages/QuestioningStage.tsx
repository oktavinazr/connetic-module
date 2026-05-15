import React, { useState, useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import {
  AlertCircle, CheckCircle, ChevronRight, Clock, Eye,
  GripVertical, HelpCircle, Info, Lightbulb, MessageSquare, PenLine,
  RotateCcw, User, WifiOff, XCircle, Zap, ArrowRight, MapPin,
  Smartphone, Package, Map as MapIcon, Home, Activity, Route, Box, Cable, Layers
} from 'lucide-react';
import { getCurrentUser } from '../../utils/auth';
import { getLessonProgress, saveStageAttempt } from '../../utils/progress';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { EssayBox } from './StageKit';

// -- Interfaces -----------------------------------------------------------------

interface ReasonOption { id: string; text: string; isCorrect: boolean; feedback: string }
interface QuestionBankItem { id: string; text: string; response: string }
interface ProblemVisual { icon: string; title: string; description: string; problemType: 'corruption' | 'packet-loss' | 'collision' | 'delay' }

interface QuestioningStageProps {
  scenario?: string;
  whyQuestion?: string;
  hint?: string;
  reasonOptions?: ReasonOption[];
  teacherImage?: string;
  imageUrl?: string;
  teacherQuestion?: string;
  questionBank?: QuestionBankItem[];
  problemVisual?: ProblemVisual;
  lessonId: string;
  stageIndex: number;
  onComplete: (answer: { selectedId: string; isCorrect: boolean; askedQuestions: string[]; justification: string }) => void;
}

// -- Pizza Layers ---------------------------------------------------------------

const PIZZA_LAYERS = [
  {
    num: 5, name: 'Application Layer', icon: Smartphone, role: 'Pesanan Pizza',
    desc: 'Data asli yang dibuat pengguna - seperti pesan yang kamu tulis di aplikasi.',
    gradient: 'from-[#8B5CF6] to-[#7C3AED]', light: 'bg-[#EDE9FE]',
    border: 'border-[#8B5CF6]', text: 'text-[#6D28D9]', badge: 'bg-[#8B5CF6]',
  },
  {
    num: 4, name: 'Transport Layer', icon: Box, role: 'Boks Pemanas & Nomor Urut',
    desc: 'Membungkus data dengan checksum dan sequence number agar tiba utuh dan berurutan.',
    gradient: 'from-[#628ECB] to-[#395886]', light: 'bg-[#EEF4FF]',
    border: 'border-[#628ECB]', text: 'text-[#395886]', badge: 'bg-[#628ECB]',
  },
  {
    num: 3, name: 'Network Layer', icon: Route, role: 'GPS & Alamat Kompleks',
    desc: 'IP Address dan routing menentukan jalur terbaik dari pengirim ke penerima.',
    gradient: 'from-[#10B981] to-[#059669]', light: 'bg-[#ECFDF5]',
    border: 'border-[#10B981]', text: 'text-[#065F46]', badge: 'bg-[#10B981]',
  },
  {
    num: 2, name: 'Data Link Layer', icon: Home, role: 'Nomor Rumah & Bel Spesifik',
    desc: 'MAC Address mengidentifikasi perangkat tepat dalam jaringan lokal.',
    gradient: 'from-[#F59E0B] to-[#D97706]', light: 'bg-[#FFFBEB]',
    border: 'border-[#F59E0B]', text: 'text-[#78350F]', badge: 'bg-[#F59E0B]',
  },
  {
    num: 1, name: 'Physical Layer', icon: Cable, role: 'Jalan, Motor & Media Fisik',
    desc: 'Kabel, sinyal Wi-Fi, atau serat optik yang membawa bit secara fisik.',
    gradient: 'from-[#EC4899] to-[#DB2777]', light: 'bg-[#FDF2F8]',
    border: 'border-[#EC4899]', text: 'text-[#831843]', badge: 'bg-[#EC4899]',
  },
];

// -- Disruption Scenarios -------------------------------------------------------

const DISRUPTIONS = [
  {
    id: 'A', letter: 'A', 
    scenario: 'Satu Kompleks, Salah Ketuk Pintu',
    detail: 'Kurir sudah sampai di alamat jalan yang benar, tapi dia mengetuk pintu rumah nomor 10, padahal seharusnya nomor 50.',
    correctLayer: 'Data Link Layer',
    correctFeedback: 'Data Link Layer bertanggung jawab atas pengalamatan fisik (MAC Address) - seperti nomor rumah spesifik yang dipakai kurir untuk ketuk pintu yang benar.',
    wrongFeedback: {
      'Transport Layer': 'Transport Layer mengurus pembungkusan, bukan identitas fisik rumah tujuan.',
      'Network Layer': 'Network Layer (GPS) justru benar di skenario ini! Yang bermasalah adalah identifikasi lokal di bawahnya - nomor rumah = MAC Address = Data Link Layer.',
      'Application Layer': 'Application Layer hanya berisi pesanan pizza, bukan proses pengantaran fisik.',
      'Physical Layer': 'Jalanannya (media fisik) tidak ada masalah, hanya alamat pintunya yang salah.',
    }
  },
  {
    id: 'B', letter: 'B',
    scenario: 'Salah Rute, Masuk ke Gang Buntu',
    detail: 'Kurir tidak tahu jalan tercepat dan tersasar ke arah yang berlawanan dari alamat tujuan.',
    correctLayer: 'Network Layer',
    correctFeedback: 'Network Layer mengurus routing dan IP Address - seperti peta/GPS yang menentukan jalur terbaik antar wilayah.',
    wrongFeedback: {
      'Transport Layer': 'Transport Layer tidak menentukan rute perjalanan di jalan raya internet.',
      'Data Link Layer': 'Data Link Layer hanya mengurus pengantaran di dalam satu gang/kompleks, bukan rute antar wilayah.',
      'Physical Layer': 'Masalahnya ada di navigasi (logika rute), bukan pada kualitas aspal jalanan.',
      'Application Layer': 'Aplikasi tidak ikut campur dalam menentukan rute paket di internet.',
    }
  },
  {
    id: 'C', letter: 'C',
    scenario: 'Boks Terbuka, Pizza Rusak',
    detail: 'Pembungkus pizza terbuka di tengah jalan sehingga pizza terkena debu dan tidak layak makan.',
    correctLayer: 'Transport Layer',
    correctFeedback: 'Transport Layer bertanggung jawab atas integritas data via checksum TCP. Boks terbuka = checksum gagal -> segmen dianggap rusak dan perlu retransmission.',
    wrongFeedback: {
      'Network Layer': 'Alamat GPS/rute sudah benar. Yang rusak adalah pembungkus dan mekanisme verifikasi integritas - itu tanggung jawab Transport Layer.',
      'Data Link Layer': 'Data Link Layer hanya mengurus pengantaran, bukan integritas isi boks di dalamnya.',
      'Application Layer': 'Pizza (data asli) baik sebelum dibungkus. Yang gagal adalah proses pembungkusan dan checksum saat pengiriman - ranah Transport Layer.',
    }
  }
];

// -- Drag & Drop for Pizza Simulation -------------------------------------------

const DRAG_PIZZA = 'PIZZA_LAYER';

function DraggableLayerTag({ name, layer, disabled }: {
  name: string; layer: typeof PIZZA_LAYERS[0]; disabled?: boolean;
}) {
  const Icon = layer.icon;
  const [{ isDragging }, drag] = useDrag({
    type: DRAG_PIZZA,
    item: { layerName: name },
    canDrag: !disabled,
    collect: m => ({ isDragging: m.isDragging() }),
  });
  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-b-4 text-white text-xs font-black select-none transition-all
        bg-gradient-to-r ${layer.gradient} ${layer.border}
        ${disabled ? 'cursor-default opacity-60' : isDragging ? 'opacity-35 scale-90 cursor-grabbing shadow-2xl' : 'cursor-grab hover:scale-105 hover:-translate-y-1 shadow-md hover:shadow-xl'}`}
    >
      <GripVertical className="w-3.5 h-3.5 opacity-60 shrink-0" />
      <Icon className="w-4 h-4" />
      <span className="tracking-tight uppercase">{name}</span>
    </div>
  );
}

function DisruptionDropZone({ disruption, droppedLayerName, validated, isCorrect, onDrop }: {
  disruption: typeof DISRUPTIONS[0];
  droppedLayerName?: string;
  validated: boolean;
  isCorrect?: boolean;
  onDrop: (disruptionId: string, layerName: string) => void;
}) {
  const [{ isOver }, drop] = useDrop({
    accept: DRAG_PIZZA,
    drop: (d: { layerName: string }) => onDrop(disruption.id, d.layerName),
    collect: m => ({ isOver: m.isOver() }),
  });

  const droppedLayer = droppedLayerName ? PIZZA_LAYERS.find(l => l.name === droppedLayerName) : null;
  const DroppedIcon = droppedLayer?.icon;

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`rounded-lg border-2 p-5 transition-all duration-300 bg-white border-[#D5DEEF]
        ${isOver && !validated ? 'ring-4 ring-offset-2 ring-[#8B5CF6]/35 scale-[1.02] shadow-[0_0_32px_rgba(139,92,246,0.3)] border-[#8B5CF6]' : ''}`}
    >
      <div className="flex items-start gap-4 mb-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#395886] text-white text-sm font-black shadow-md">
          {disruption.letter}
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40 mb-1">Kasus {disruption.letter}</p>
          <p className="text-[13px] font-bold text-[#395886] leading-relaxed italic">"{disruption.scenario}"</p>
        </div>
      </div>

      <p className="text-xs text-[#395886]/60 leading-relaxed mb-6 font-medium">{disruption.detail}</p>

      <div className={`rounded-lg border-2 border-dashed p-4 min-h-[56px] flex items-center justify-center transition-all duration-300
        ${isOver && !validated ? 'bg-[#8B5CF6]/5 border-[#8B5CF6] shadow-inner' : droppedLayer ? 'border-transparent' : 'border-[#D5DEEF] bg-[#F8FAFF]'}`}
      >
        {droppedLayer && DroppedIcon ? (
          <div className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white text-xs font-black
            bg-gradient-to-r ${droppedLayer.gradient} shadow-lg`}
          >
            <DroppedIcon className="w-4 h-4" />
            <span className="flex-1 uppercase tracking-tight">{droppedLayer.name}</span>
            {validated && (isCorrect
              ? <CheckCircle className="w-5 h-5 shrink-0" />
              : <XCircle className="w-5 h-5 shrink-0" />)}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <p className={`text-[10px] font-black uppercase tracking-widest transition-colors
              ${isOver ? 'text-[#8B5CF6]' : 'text-[#395886]/25'}`}
            >
              {isOver ? '(drop)' : 'Tarik Layer ke Sini'}
            </p>
          </div>
        )}
      </div>

      {validated && droppedLayerName && (
        <div className={`mt-4 p-4 rounded-xl text-[11px] leading-relaxed font-bold
          ${isCorrect ? 'bg-[#10B981]/10 text-[#0F8A66] border border-[#10B981]/20'
            : 'bg-red-50 text-red-700 border border-red-100'}`}
        >
          {isCorrect
            ? <div className="flex gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-[#10B981]" />
                <span>{disruption.correctFeedback}</span>
              </div>
            : <div className="flex gap-2">
                <XCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>
                  <strong className="uppercase">Bukan {droppedLayerName}.</strong>{' '}
                  {(disruption.wrongFeedback as unknown as Record<string, string>)[droppedLayerName] ?? 'Analisis lebih dalam hubungan layer dengan skenario gangguan ini.'}
                </span>
              </div>
          }
        </div>
      )}
    </div>
  );
}

// -- Pizza Visual Map -----------------------------------------------------------

function PizzaLayerMap() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="bg-white rounded-lg border-2 border-[#D5DEEF] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
        <div className="h-9 w-9 rounded-lg bg-white shadow-sm flex items-center justify-center">
          <MapPin className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Peta Analogi Kontekstual</p>
          <h3 className="text-sm font-bold text-[#395886]">The Smart Pizza: 5 Lapisan TCP/IP</h3>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-white border border-amber-200 px-2.5 py-1 rounded-full shadow-sm">
          <Info className="w-3.5 h-3.5" /> Klik layer untuk detail
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-6 scrollbar-hide">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-[#395886] shadow-inner">
              <User className="w-6 h-6" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#395886]/40">Pengirim</p>
          </div>
          <div className="h-px w-6 bg-[#D5DEEF] shrink-0 border-t-2 border-dashed" />

          {PIZZA_LAYERS.map((layer, idx) => {
            const Icon = layer.icon;
            const isExpanded = expanded === layer.num;
            return (
              <React.Fragment key={layer.num}>
                <button
                  onClick={() => setExpanded(isExpanded ? null : layer.num)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border-b-4 shrink-0 w-[100px] text-center transition-all duration-300
                    bg-gradient-to-br ${layer.gradient} ${layer.border} text-white shadow-md
                    ${isExpanded ? 'scale-110 shadow-xl -translate-y-2 ring-4 ring-white/20' : 'hover:scale-105 hover:-translate-y-1 hover:shadow-lg'}`}
                >
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center mb-1">
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest leading-tight">{layer.role.split(' & ')[0]}</p>
                  <p className="text-[8px] opacity-70 font-bold uppercase">Lapis {layer.num}</p>
                </button>
                {idx < PIZZA_LAYERS.length - 1 && (
                  <div className="h-px w-6 bg-[#D5DEEF] shrink-0 border-t-2 border-dashed" />
                )}
              </React.Fragment>
            );
          })}

          <div className="h-px w-6 bg-[#D5DEEF] shrink-0 border-t-2 border-dashed" />
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-[#395886] shadow-inner">
              <Home className="w-6 h-6" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-[#395886]/40">Penerima</p>
          </div>
        </div>

        {expanded !== null && (() => {
          const layer = PIZZA_LAYERS.find(l => l.num === expanded)!;
          const Icon = layer.icon;
          return (
            <div className={`mt-4 p-5 rounded-lg border-2 animate-in slide-in-from-top-2 duration-300 ${layer.light} ${layer.border} shadow-inner`}>
              <div className="flex items-start gap-4">
                <div className={`h-10 w-10 rounded-lg ${layer.badge} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Lapisan {layer.num}</span>
                    <div className="h-1 w-1 rounded-full bg-current opacity-20" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{layer.name}</span>
                  </div>
                  <p className={`text-base font-black mb-1 ${layer.text}`}>{layer.role}</p>
                  <p className="text-xs text-[#395886]/80 leading-relaxed font-bold">{layer.desc}</p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      <div className="flex items-center justify-center gap-2 px-5 pb-5 flex-wrap">
        {PIZZA_LAYERS.map(l => (
          <span key={l.num} className={`text-[10px] font-black px-3 py-1 rounded-lg text-white shadow-sm flex items-center gap-1.5 ${l.badge}`}>
            <l.icon className="w-3 h-3" />
            {l.name.split(' ')[0]}
          </span>
        ))}
      </div>
    </div>
  );
}

// -- Disruption Simulation ------------------------------------------------------

function DisruptionSimulation({ lessonId, stageIndex, onComplete }: {
  lessonId: string; stageIndex: number; onComplete: (ans: Record<string, string>) => void;
}) {
  const user = getCurrentUser();
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [validated, setValidated] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    getLessonProgress(user!.id, lessonId).then(p => setAttempts(p.stageAttempts[`stage_${stageIndex}_disruption`] || 0));
  }, []);

  const handleDrop = (disruptionId: string, layerName: string) => {
    if (validated) return;
    setPlacements(prev => {
       const next = { ...prev };
       // If card was in another disruption, move it
       Object.keys(next).forEach(k => { if (next[k] === layerName) delete next[k]; });
       next[disruptionId] = layerName;
       return next;
    });
  };

  const handleReturnToPool = () => {
    if (validated) return;
    setPlacements({});
  };

  const isAllCorrect = DISRUPTIONS.every(d => placements[d.id] === d.correctLayer);
  const allPlaced = Object.keys(placements).length === DISRUPTIONS.length;

  const handleValidate = async () => {
    const ok = isAllCorrect;
    const newA = await saveStageAttempt(user!.id, lessonId, stageIndex, ok, `stage_${stageIndex}_disruption`);
    setAttempts(newA);
    setValidated(true);
  };

  const handleRetry = () => {
    setValidated(false);
  };

  const unplacedLayers = PIZZA_LAYERS.filter(l => !Object.values(placements).includes(l.name));
  const isDone = validated && (isAllCorrect || attempts >= 3);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border-2 border-[#8B5CF6]/20 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 bg-[#8B5CF6]/5 border-b-2 border-[#8B5CF6]/10">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#8B5CF6]/15">
            <Zap className="w-5 h-5 text-[#8B5CF6]" />
          </div>
          <div className="flex-1">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B5CF6]">Simulasi Gangguan - X.TCP.5</p>
            <h3 className="text-sm font-bold text-[#395886]">Analisis Dampak pada Lapisan Jaringan</h3>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold
            ${attempts >= 3 ? 'border-red-200 bg-red-50 text-red-500' : 'border-[#8B5CF6]/20 bg-white text-[#8B5CF6]'}`}>
            <AlertCircle className="w-3 h-3" />
            {attempts >= 3 ? 'Habis' : `${3 - attempts} percobaan`}
          </div>
        </div>
      </div>

      <div className={`p-5 rounded-lg border-2 border-dashed transition-all duration-300 min-h-[80px] border-[#D5DEEF] bg-[#F8FAFF]`}>
        <div className="flex items-center justify-between mb-4 px-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40 flex items-center gap-2">
            <GripVertical className="w-3 h-3" /> Kartu Layer ({unplacedLayers.length} tersisa) - Seret ke gangguan yang sesuai
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {unplacedLayers.map(l => <DraggableLayerTag key={l.num} name={l.name} layer={l} disabled={validated} />)}
          {unplacedLayers.length === 0 && !validated && (
            <div className="w-full text-center py-4 text-[11px] font-bold text-[#10B981]">
              Semua kartu sudah diletakkan - Kamu bisa langsung memindahkannya antar kotak gangguan
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {DISRUPTIONS.map(d => (
          <DisruptionDropZone
            key={d.id}
            disruption={d}
            droppedLayerName={placements[d.id]}
            validated={validated}
            isCorrect={validated ? placements[d.id] === d.correctLayer : undefined}
            onDrop={handleDrop}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 mt-6">
        {!validated ? (
          <button
            onClick={handleValidate}
            disabled={!allPlaced}
            className={`w-full py-3.5 rounded-lg font-black text-sm transition-all shadow-lg
              ${allPlaced ? 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-purple-200' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed shadow-none'}`}
          >
            {allPlaced ? 'Verifikasi Analisis' : `Tempatkan ${DISRUPTIONS.length - Object.keys(placements).length} kartu lagi`}
          </button>
        ) : isDone ? (
          <button
            onClick={() => onComplete(placements)}
            className="w-full py-4 rounded-2xl bg-[#10B981] text-white font-black text-sm hover:bg-[#059669] shadow-lg shadow-green-200 transition-all active:scale-95"
          >
            Submit & Lanjut <ArrowRight className="w-4 h-4 inline ml-2" />
          </button>
        ) : (
          <button
            onClick={handleRetry}
            className="w-full py-4 rounded-2xl bg-white border-2 border-red-200 text-red-600 font-black text-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" /> Coba Lagi ({3 - attempts} sisa)
          </button>
        )}
      </div>
    </div>
  );
}

// -- Inline Essay (now uses unified EssayBox from StageKit) --------------------

function InlineEssay({ onDone }: { onDone: (essay: string) => void }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <EssayBox
        objectiveLabel="X.TCP.5"
        prompt="Mengapa proses pengiriman data di internet harus mengikuti urutan lapisan (layer) yang baku?"
        submitLabel="Submit Aktivitas"
        minChars={60}
        onSubmit={onDone}
      />
    </div>
  );
}

// -- Lesson 1 Questioning (Pizza Analogy) ---------------------------------------

function QuestioningLesson1({ lessonId, stageIndex, onComplete }: QuestioningStageProps) {
  const tracker = useActivityTracker({
    lessonId,
    stageIndex,
    stageType: 'questioning',
  });
  const [subPhase, setSubPhase] = useState<'map' | 'simulation' | 'essay'>('map');
  const [selections, setPlacements] = useState<Record<string, string>>({});
  const [essay, setEssay] = useState('');
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    if (!tracker.isLoading && tracker.session?.latestSnapshot && !isRestored) {
      const snap = tracker.session.latestSnapshot;
      if (snap.subPhase) setSubPhase(snap.subPhase);
      if (snap.selections) setPlacements(snap.selections);
      if (snap.essay) setEssay(snap.essay);
      setIsRestored(true);
    } else if (!tracker.isLoading) {
      setIsRestored(true);
    }
  }, [tracker.isLoading, tracker.session, isRestored]);

  useEffect(() => {
    if (!isRestored) return;
    const progressMap = { map: 15, simulation: 55, essay: 85 } as const;
    void tracker.saveSnapshot(
      {
        subPhase,
        selections,
        essay,
      },
      { progressPercent: progressMap[subPhase] },
    );
  }, [essay, isRestored, selections, subPhase, tracker]);

  if (tracker.isLoading || !isRestored) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <div className="w-12 h-12 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-[#395886]">Memuat progres...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="flex flex-col md:flex-row items-center gap-6 rounded-lg border-2 border-[#8B5CF6]/20 bg-white p-6 shadow-sm">
        <div className="w-20 h-20 shrink-0 rounded-lg bg-[#8B5CF6] flex items-center justify-center text-white shadow-md">
          <User className="w-12 h-12" strokeWidth={2.5} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B5CF6]">Questioning — X.TCP.5 (Fasilitator)</p>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
              <MessageSquare className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span className="text-[10px] font-black text-[#8B5CF6] uppercase tracking-tighter">Diskusi Interaktif</span>
            </div>
          </div>
          <p className="text-base font-bold text-[#395886] leading-relaxed italic">
            "Setelah mengamati simulasi di tahap Modeling, sekarang mari kita analisis tantangan nyata yang mungkin terjadi jika satu lapisan saja mengalami kegagalan."
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <PizzaLayerMap />
        
        <div className="pt-6 border-t-2 border-dashed border-[#D5DEEF]/30 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <DisruptionSimulation
            lessonId={lessonId}
            stageIndex={stageIndex}
            onComplete={(ans) => { 
               setPlacements(ans); 
               setSubPhase('essay');
               void tracker.trackEvent('questioning_simulation_completed', { answerCount: Object.keys(ans ?? {}).length }, { progressPercent: 75 }); 
            }}
          />
        </div>

        {subPhase === 'essay' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <InlineEssay onDone={(text) => {
              setEssay(text);
              const finalAnswer = { selectedId: 'disruption_simulation', isCorrect: true, askedQuestions: [], justification: text, summary: text };
              void tracker.complete(finalAnswer, { subPhase: 'essay', selections, essay: text, finalAnswer });
              onComplete(finalAnswer);
            }} />
          </div>
        )}
      </div>
    </div>
  );
}

// -- Original Questioning Stage (for other lessons) -------------------------------

function QuestioningOriginal({
  scenario, whyQuestion, reasonOptions = [], lessonId, stageIndex, onComplete, problemVisual, teacherQuestion, questionBank = []
}: QuestioningStageProps) {
  const user = getCurrentUser();
  const tracker = useActivityTracker({
    lessonId,
    stageIndex,
    stageType: 'questioning',
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [justification, setJustification] = useState('');
  const [validated, setValidated] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    getLessonProgress(user!.id, lessonId).then(p => setAttempts(p.stageAttempts[`stage_${stageIndex}`] || 0));
  }, []);

  useEffect(() => {
    if (!tracker.isLoading && tracker.session?.latestSnapshot && !isRestored) {
      const snap = tracker.session.latestSnapshot;
      if (snap.selectedId) setSelectedId(snap.selectedId);
      if (snap.justification) setJustification(snap.justification);
      if (snap.validated) setValidated(snap.validated);
      if (snap.askedQuestions) setAskedQuestions(snap.askedQuestions);
      if (snap.activeQuestionId) setActiveQuestionId(snap.activeQuestionId);
      setIsRestored(true);
    } else if (!tracker.isLoading) {
      setIsRestored(true);
    }
  }, [tracker.isLoading, tracker.session, isRestored]);

  const isCorrect = reasonOptions.find(o => o.id === selectedId)?.isCorrect ?? false;

  useEffect(() => {
    if (!isRestored) return;
    void tracker.saveSnapshot(
      {
        selectedId,
        justification,
        validated,
        attempts,
        askedQuestions,
        activeQuestionId,
      },
      { progressPercent: validated ? (isCorrect || attempts >= 3 ? 85 : 60) : selectedId ? 30 : 10 },
    );
  }, [activeQuestionId, askedQuestions, attempts, isCorrect, isRestored, justification, selectedId, tracker, validated]);

  const handleQuestionClick = (qId: string) => {
    setActiveQuestionId(qId);
    if (!askedQuestions.includes(qId)) setAskedQuestions([...askedQuestions, qId]);
    void tracker.trackEvent('question_opened', { questionId: qId }, { progressPercent: 20 });
  };

  const handleValidate = async () => {
    if (!selectedId) return;
    const ok = reasonOptions.find(o => o.id === selectedId)?.isCorrect ?? false;
    const newA = await saveStageAttempt(user!.id, lessonId, stageIndex, ok);
    setAttempts(newA); setValidated(true);
    void tracker.trackEvent('questioning_validation', { selectedId }, { isCorrect: ok, progressPercent: ok ? 70 : 55 });
  };

  const activeResponse = questionBank?.find(q => q.id === activeQuestionId)?.response;

  if (tracker.isLoading || !isRestored) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-[#628ECB] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-[#395886]">Memuat progres...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border-2 border-[#D5DEEF] shadow-sm flex flex-col md:flex-row items-start gap-6">
        <div className="w-16 h-16 shrink-0 rounded-2xl bg-[#EEF2FF] flex items-center justify-center text-[#628ECB]"><HelpCircle className="w-8 h-8" /></div>
        <div className="flex-1">
          <p className="text-xs font-bold text-[#628ECB] uppercase tracking-widest mb-1">Kasus Analisis</p>
          <p className="text-sm font-medium text-[#395886]/80 leading-relaxed italic">"{scenario}"</p>
        </div>
      </div>

      {questionBank.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border-2 border-[#628ECB]/20 shadow-sm">
          <h3 className="text-sm font-bold text-[#395886] mb-4 flex items-center gap-2"><Eye className="w-4 h-4 text-[#628ECB]" /> {teacherQuestion || 'Ajukan pertanyaan untuk mencari bukti:'}</h3>
          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {questionBank.map(q => (
              <button key={q.id} onClick={() => handleQuestionClick(q.id)} className={`p-4 rounded-xl border-2 text-left text-xs font-bold transition-all ${activeQuestionId === q.id ? 'border-[#628ECB] bg-[#EEF2FF] text-[#395886]' : 'border-[#D5DEEF] bg-white hover:border-[#628ECB]/40'}`}>
                {q.text}
              </button>
            ))}
          </div>
          {activeResponse && (
            <div className="p-4 rounded-xl bg-[#F0FDF4] border-2 border-[#10B981]/20 animate-in fade-in slide-in-from-top-2">
              <p className="text-[10px] font-black text-[#10B981] uppercase mb-1 flex items-center gap-1.5"><Info className="w-3 h-3" /> Fakta Ditemukan</p>
              <p className="text-xs font-bold text-[#065F46] leading-relaxed">{activeResponse}</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border-2 border-[#D5DEEF] shadow-sm">
        <h3 className="text-sm font-bold text-[#395886] mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-[#F59E0B]" /> {whyQuestion || 'Tentukan penyebab utamanya:'}</h3>
        <div className="space-y-3 mb-6">
          {reasonOptions.map(opt => (
            <button key={opt.id} onClick={() => !validated && setSelectedId(opt.id)} disabled={validated} className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedId === opt.id ? (validated ? (opt.isCorrect ? 'border-[#10B981] bg-[#F0FDF4]' : 'border-red-400 bg-red-50') : 'border-[#628ECB] bg-[#EEF2FF]') : 'border-[#D5DEEF] bg-white'}`}>
              <p className="text-xs font-bold text-[#395886]">{opt.text}</p>
              {validated && selectedId === opt.id && <p className={`text-[10px] font-bold mt-2 ${opt.isCorrect ? 'text-[#10B981]' : 'text-red-500'}`}>{opt.feedback}</p>}
            </button>
          ))}
        </div>

        {(isCorrect || attempts >= 3) && (
          <div className="space-y-3 animate-in fade-in">
            <label className="block text-xs font-bold text-[#395886]">Berikan alasan logismu:</label>
            <textarea value={justification} onChange={e => setJustification(e.target.value)} rows={3}
              className="w-full p-4 rounded-xl border-2 border-[#D5DEEF] text-xs font-medium focus:border-[#628ECB] outline-none resize-none"
              placeholder="Tuliskan alasan teknismu... (minimal 20 kata)" />
            <p className={`text-[10px] ${justification.trim().split(/\s+/).filter(Boolean).length >= 20 ? 'text-[#10B981]' : 'text-[#395886]/40'}`}>
              {justification.trim().split(/\s+/).filter(Boolean).length} / 20 kata{justification.trim().split(/\s+/).filter(Boolean).length >= 20 ? ' ✓' : ' — minimal 20 kata untuk mengirim'}
            </p>
            <button
              onClick={() => { const finalAnswer = { selectedId: selectedId!, isCorrect, askedQuestions, justification }; void tracker.complete(finalAnswer, { finalAnswer, selectedId, askedQuestions, justification }); onComplete(finalAnswer); }}
              disabled={justification.trim().split(/\s+/).filter(Boolean).length < 20}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${justification.trim().split(/\s+/).filter(Boolean).length >= 20 ? 'bg-[#628ECB] text-white hover:bg-[#395886]' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'}`}>
              Submit Aktivitas
            </button>
          </div>
        )}

        {!validated && (
          <button onClick={handleValidate} disabled={!selectedId} className="w-full py-3 bg-[#395886] text-white rounded-xl font-bold text-sm hover:bg-[#628ECB] transition-all">Periksa Analisis</button>
        )}
      </div>
    </div>
  );
}

// -- Main Export ----------------------------------------------------------------

export function QuestioningStage(props: QuestioningStageProps) {
  if (props.lessonId === '1') {
    return <QuestioningLesson1 {...props} />;
  }
  return <QuestioningOriginal {...props} />;
}
