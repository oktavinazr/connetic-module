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
import { EssayBox, ContinueActivityButton, ATPConclusionBox } from './StageKit';

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
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B5CF6]">Aktivitas Studi Kasus — Analogi Pizza</p>
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

// -- Layer Function Pairs (cable-matching activity) ----------------------------

const LAYER_FUNCTION_PAIRS = [
  { id: 'lf1', layerName: 'Application Layer', layerNum: 5, funcDesc: 'Menghasilkan dan memproses data pengguna melalui protokol HTTP, SMTP, dan FTP', icon: Smartphone, hexColor: '#8B5CF6', light: 'bg-[#EDE9FE]', border: 'border-[#8B5CF6]', text: 'text-[#6D28D9]', badge: 'bg-[#8B5CF6]' },
  { id: 'lf2', layerName: 'Transport Layer', layerNum: 4, funcDesc: 'Memecah data menjadi segmen dan memverifikasi integritas pengiriman melalui checksum TCP/UDP', icon: Box, hexColor: '#628ECB', light: 'bg-[#EEF4FF]', border: 'border-[#628ECB]', text: 'text-[#395886]', badge: 'bg-[#628ECB]' },
  { id: 'lf3', layerName: 'Network Layer', layerNum: 3, funcDesc: 'Menentukan rute terbaik dan mengalamati paket data menggunakan IP Address (Routing)', icon: Route, hexColor: '#10B981', light: 'bg-[#ECFDF5]', border: 'border-[#10B981]', text: 'text-[#065F46]', badge: 'bg-[#10B981]' },
  { id: 'lf4', layerName: 'Data Link Layer', layerNum: 2, funcDesc: 'Mengidentifikasi perangkat dalam jaringan lokal menggunakan MAC Address dan membungkus data menjadi Frame', icon: Home, hexColor: '#F59E0B', light: 'bg-[#FFFBEB]', border: 'border-[#F59E0B]', text: 'text-[#78350F]', badge: 'bg-[#F59E0B]' },
  { id: 'lf5', layerName: 'Physical Layer', layerNum: 1, funcDesc: 'Mengirimkan bit (0 dan 1) melalui media fisik: kabel UTP, serat optik, atau sinyal Wi-Fi', icon: Cable, hexColor: '#EC4899', light: 'bg-[#FDF2F8]', border: 'border-[#EC4899]', text: 'text-[#831843]', badge: 'bg-[#EC4899]' },
];

// Left: shuffled func descriptions. Right: layer order Application (5) → Physical (1)
const FUNC_DISPLAY_ORDER = ['lf5', 'lf3', 'lf1', 'lf4', 'lf2'];
const LAYER_DISPLAY_ORDER = ['lf1', 'lf2', 'lf3', 'lf4', 'lf5'];

// -- Function Matching Activity (tap-to-select → tap-to-assign, mobile-friendly) --

function FunctionMatchingActivity({ placements, validated, onPlacementsChange, onValidate, onNext }: {
  placements: Record<string, string>;
  validated: boolean;
  onPlacementsChange: (p: Record<string, string>) => void;
  onValidate: () => void;
  onNext: () => void;
}) {
  const [selectedFuncId, setSelectedFuncId] = useState<string | null>(null);

  const funcOrder = FUNC_DISPLAY_ORDER.map(id => LAYER_FUNCTION_PAIRS.find(lf => lf.id === id)!);
  const layerOrder = LAYER_DISPLAY_ORDER.map(id => LAYER_FUNCTION_PAIRS.find(lf => lf.id === id)!);

  const allPlaced = Object.keys(placements).length === LAYER_FUNCTION_PAIRS.length;
  const correctCount = LAYER_FUNCTION_PAIRS.filter(lf => placements[lf.id] === lf.id).length;
  const allCorrect = correctCount === LAYER_FUNCTION_PAIRS.length;

  const handleFuncTap = (funcId: string) => {
    if (validated) return;
    setSelectedFuncId(prev => prev === funcId ? null : funcId);
  };

  const handleLayerTap = (layerId: string) => {
    if (validated || !selectedFuncId) return;
    const next = { ...placements };
    // Lepas func lain yang sebelumnya ada di layer ini
    Object.keys(next).forEach(k => { if (next[k] === layerId) delete next[k]; });
    // Toggle: jika sudah terpasang di sini, lepas; jika belum, pasang
    if (next[selectedFuncId] === layerId) {
      delete next[selectedFuncId];
    } else {
      next[selectedFuncId] = layerId;
    }
    onPlacementsChange(next);
    setSelectedFuncId(null);
  };

  const placedCount = Object.keys(placements).length;

  return (
    <div className="space-y-4">
      {/* Instruction */}
      {!validated && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#F8F5FF] border border-[#8B5CF6]/20">
          <div className="w-5 h-5 rounded-full bg-[#8B5CF6] flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-white text-[9px] font-black">{selectedFuncId ? '2' : '1'}</span>
          </div>
          <p className="text-[11px] font-bold text-[#6D28D9] leading-relaxed">
            {selectedFuncId
              ? 'Fungsi dipilih — sekarang ketuk lapisan yang sesuai di bawah'
              : 'Ketuk kartu fungsi untuk memilih, lalu ketuk lapisan yang sesuai'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
        {/* Kiri / Atas: Deskripsi Fungsi */}
        <div className="space-y-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#395886]/40 text-center pb-1">
            Deskripsi Fungsi
          </p>
          {funcOrder.map(lf => {
            const assignedLayerId = placements[lf.id];
            const assignedLayer = assignedLayerId ? LAYER_FUNCTION_PAIRS.find(l => l.id === assignedLayerId) : null;
            const isSelected = selectedFuncId === lf.id;
            const isCorrect = validated && placements[lf.id] === lf.id;
            const isWrong = validated && !!placements[lf.id] && !isCorrect;

            return (
              <button
                key={lf.id}
                onClick={() => handleFuncTap(lf.id)}
                disabled={validated}
                className={`w-full px-3 py-2.5 rounded-xl border-2 text-left text-xs font-bold leading-relaxed transition-all duration-150
                  ${validated
                    ? isCorrect
                      ? 'border-[#10B981]/40 bg-[#F0FDF9] text-[#065F46] cursor-default'
                      : isWrong
                        ? 'border-red-200 bg-red-50 text-red-700 cursor-default'
                        : 'border-[#D5DEEF] bg-white text-[#395886] cursor-default'
                    : isSelected
                      ? 'border-[#8B5CF6] bg-[#F3F0FF] text-[#395886] shadow-md ring-2 ring-[#8B5CF6]/25 scale-[1.02] cursor-pointer'
                      : 'bg-white text-[#395886] cursor-pointer hover:bg-[#F8F5FF] active:scale-[0.98]'
                  }`}
                style={
                  !validated && !isSelected
                    ? { borderColor: assignedLayer ? assignedLayer.hexColor + '80' : '#D5DEEF' }
                    : {}
                }
              >
                <div className="flex items-start gap-2">
                  {!validated && (
                    <div
                      className="w-3 h-3 rounded-full shrink-0 mt-0.5 border-2 transition-all"
                      style={{
                        backgroundColor: isSelected ? '#8B5CF6' : assignedLayer ? assignedLayer.hexColor + '33' : 'transparent',
                        borderColor: isSelected ? '#8B5CF6' : assignedLayer ? assignedLayer.hexColor : '#D5DEEF',
                      }}
                    />
                  )}
                  {validated && isCorrect && <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />}
                  {validated && isWrong && <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <span>{lf.funcDesc}</span>
                    {!validated && assignedLayer && (
                      <span
                        className="mt-1.5 ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-[9px] font-black"
                        style={{ backgroundColor: assignedLayer.hexColor }}
                      >
                        <assignedLayer.icon className="w-2.5 h-2.5" />
                        {assignedLayer.layerName.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Kanan / Bawah: Lapisan TCP/IP */}
        <div className="space-y-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#395886]/40 text-center pb-1">
            {selectedFuncId ? 'Ketuk lapisan yang sesuai' : 'Lapisan TCP/IP'}
          </p>
          {layerOrder.map(lf => {
            const LayerIcon = lf.icon;
            const connectedFuncId = Object.entries(placements).find(([, v]) => v === lf.id)?.[0];
            const connectedFunc = connectedFuncId ? LAYER_FUNCTION_PAIRS.find(f => f.id === connectedFuncId) : null;
            const isTarget = !!selectedFuncId && !validated;
            const isCorrect = validated && connectedFuncId === lf.id;
            const isWrong = validated && !!connectedFuncId && !isCorrect;

            return (
              <button
                key={lf.id}
                onClick={() => handleLayerTap(lf.id)}
                disabled={validated || !selectedFuncId}
                className={`w-full px-3 py-2.5 rounded-xl border-2 text-left flex items-center gap-2.5 transition-all duration-150
                  ${validated
                    ? isWrong ? 'border-red-200 bg-red-50 cursor-default' : 'cursor-default'
                    : isTarget
                      ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-md'
                      : 'cursor-default'
                  }`}
                style={{
                  backgroundColor: validated
                    ? isWrong ? undefined : lf.hexColor + '12'
                    : lf.hexColor + '10',
                  borderColor: validated
                    ? isCorrect ? lf.hexColor + '55' : isWrong ? undefined : lf.hexColor + '30'
                    : isTarget ? lf.hexColor : connectedFunc ? lf.hexColor + '55' : lf.hexColor + '22',
                  boxShadow: isTarget ? `0 0 0 3px ${lf.hexColor}22` : undefined,
                }}
              >
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${lf.badge} text-white shadow-sm`}>
                  <LayerIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black uppercase opacity-50" style={{ color: lf.hexColor }}>
                    Lapisan {lf.layerNum}
                  </p>
                  <p className="text-xs font-black" style={{ color: lf.hexColor }}>{lf.layerName}</p>
                  {!validated && connectedFunc && (
                    <p className="text-[9px] text-[#395886]/50 mt-0.5 truncate font-medium">
                      {connectedFunc.funcDesc.slice(0, 38)}...
                    </p>
                  )}
                </div>
                {validated && isCorrect && <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" />}
                {validated && isWrong && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                {/* Target indicator when a func is selected */}
                {!validated && isTarget && (
                  <div
                    className="w-5 h-5 rounded-full border-2 border-dashed flex items-center justify-center shrink-0 animate-pulse"
                    style={{ borderColor: lf.hexColor + '80' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: lf.hexColor + '70' }} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress + reset */}
      {!validated && placedCount > 0 && (
        <div className="flex items-center justify-between px-3 py-2 bg-[#F8FAFF] rounded-xl border border-[#D5DEEF]">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 bg-[#D5DEEF] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8B5CF6] rounded-full transition-all duration-300"
                style={{ width: `${(placedCount / LAYER_FUNCTION_PAIRS.length) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-[#395886]/60">
              {placedCount}/{LAYER_FUNCTION_PAIRS.length} dipasangkan
            </span>
          </div>
          <button
            onClick={() => { onPlacementsChange({}); setSelectedFuncId(null); }}
            className="flex items-center gap-1 text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      )}

      {!validated ? (
        <button
          onClick={onValidate}
          disabled={!allPlaced}
          className={`w-full py-3.5 rounded-xl font-black text-sm transition-all shadow-sm active:scale-[0.98]
            ${allPlaced ? 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-purple-100' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'}`}
        >
          {allPlaced ? 'Verifikasi Pasangan Fungsi' : `Pasangkan ${LAYER_FUNCTION_PAIRS.length - placedCount} fungsi lagi`}
        </button>
      ) : (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {allCorrect ? (
            <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 text-center">
              <CheckCircle className="w-5 h-5 text-[#10B981] mx-auto mb-1.5" />
              <p className="text-sm font-black text-[#065F46]">Semua pasangan tepat!</p>
              <p className="text-xs font-bold text-[#065F46]/70 mt-1">Kamu sudah memahami perbedaan fungsi setiap lapisan TCP/IP.</p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <p className="text-sm font-bold text-amber-800">
                {correctCount} dari 5 pasangan benar — perhatikan koreksi merah di atas.
              </p>
            </div>
          )}
          <button
            onClick={onNext}
            className="w-full py-3.5 rounded-xl bg-[#10B981] text-white font-black text-sm hover:bg-[#059669] shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <ArrowRight className="w-4 h-4" /> Lanjut ke Kemampuan Berargumen
          </button>
        </div>
      )}
    </div>
  );
}

// -- Layer Q&A Section (Phase 2) ------------------------------------------------

function LayerQASection({ questionBank, activeId, openedIds, onOpen }: {
  questionBank: QuestionBankItem[]; activeId: string | null;
  openedIds: string[]; onOpen: (id: string) => void;
}) {
  const activeResponse = questionBank.find(q => q.id === activeId)?.response;
  if (questionBank.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl border-2 border-[#628ECB]/25 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#628ECB]/10 to-transparent border-b border-[#628ECB]/15">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#628ECB]/15">
          <MessageSquare className="w-4 h-4 text-[#628ECB]" />
        </div>
        <div className="flex-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#628ECB]/60">Tanya Jawab Interaktif</p>
          <p className="text-xs font-bold text-[#395886]">Perbedaan Fungsi Lapisan TCP/IP</p>
        </div>
      </div>
      <div className="p-5">
        <p className="text-xs text-[#395886]/60 mb-4 leading-relaxed">Klik pertanyaan untuk melihat penjelasannya. Gunakan jawaban ini sebagai bahan argumenmu.</p>
        <div className="space-y-2 mb-4">
          {questionBank.map(q => (
            <button
              key={q.id}
              onClick={() => onOpen(q.id)}
              className={`w-full p-3.5 rounded-xl border-2 text-left text-xs font-bold transition-all flex items-center gap-2
                ${activeId === q.id
                  ? 'border-[#628ECB] bg-[#EEF4FF] text-[#395886]'
                  : openedIds.includes(q.id)
                  ? 'border-[#10B981]/30 bg-[#F0FDF4] text-[#395886]'
                  : 'border-[#D5DEEF] bg-white hover:border-[#628ECB]/40 text-[#395886]'}`}
            >
              <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${activeId === q.id ? 'rotate-90 text-[#628ECB]' : 'text-[#395886]/30'}`} />
              <span className="flex-1 leading-relaxed">{q.text}</span>
              {openedIds.includes(q.id) && activeId !== q.id && (
                <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              )}
            </button>
          ))}
        </div>
        {activeResponse && (
          <div className="p-4 rounded-xl bg-[#F0FDF4] border-2 border-[#10B981]/20 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-[10px] font-black text-[#10B981] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Info className="w-3 h-3" /> Jawaban
            </p>
            <p className="text-xs font-bold text-[#065F46] leading-relaxed">{activeResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// -- Questioning Lesson 1 (3-phase: Consistency → Arguing → Conclusion) ---------

function QuestioningLesson1({ lessonId, stageIndex, onComplete, questionBank = [] }: QuestioningStageProps) {
  const tracker = useActivityTracker({ lessonId, stageIndex, stageType: 'questioning' });

  const [phase, setPhase] = useState<'consistency' | 'arguing' | 'conclusion'>('consistency');
  const [matchPlacements, setMatchPlacements] = useState<Record<string, string>>({});
  const [matchValidated, setMatchValidated] = useState(false);
  const [disruptionDone, setDisruptionDone] = useState(false);
  const [activeQAId, setActiveQAId] = useState<string | null>(null);
  const [openedQAIds, setOpenedQAIds] = useState<string[]>([]);
  const [essay, setEssay] = useState('');
  const [conclusionText, setConclusionText] = useState('');
  const [isRestored, setIsRestored] = useState(false);

  // Always keep a stable ref to tracker so the snapshot effect doesn't re-fire on every render
  const trackerRef = useRef(tracker);
  trackerRef.current = tracker;

  useEffect(() => {
    if (!tracker.isLoading && !isRestored) {
      const snap = tracker.session?.latestSnapshot;
      if (snap) {
        if (snap.phase) setPhase(snap.phase);
        if (snap.matchPlacements) {
          // New format uses funcId keys (lf1, lf2…); discard stale layerName-keyed snapshots
          const keys = Object.keys(snap.matchPlacements as Record<string, string>);
          if (keys.length === 0 || keys.every(k => /^lf\d+$/.test(k))) {
            setMatchPlacements(snap.matchPlacements as Record<string, string>);
          }
        }
        if (snap.matchValidated) setMatchValidated(snap.matchValidated);
        if (snap.disruptionDone) setDisruptionDone(snap.disruptionDone);
        if (snap.openedQAIds) setOpenedQAIds(snap.openedQAIds);
        if (snap.activeQAId) setActiveQAId(snap.activeQAId);
        if (snap.essay) setEssay(snap.essay);
        if (snap.conclusionText) setConclusionText(snap.conclusionText);
      }
      setIsRestored(true);
    }
  }, [tracker.isLoading, tracker.session, isRestored]);

  useEffect(() => {
    if (!isRestored) return;
    // Progress reflects actual state so it stays in sync with trackEvent calls
    const progress =
      phase === 'conclusion'
        ? (conclusionText ? 100 : 90)
        : phase === 'arguing'
          ? (essay ? 85 : openedQAIds.length > 0 ? 72 : disruptionDone ? 60 : 50)
          : (matchValidated ? 30 : Object.keys(matchPlacements).length > 0 ? 18 : 10);
    void trackerRef.current.saveSnapshot(
      { phase, matchPlacements, matchValidated, disruptionDone, openedQAIds, activeQAId, essay, conclusionText },
      { progressPercent: progress },
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, matchPlacements, matchValidated, disruptionDone, openedQAIds, activeQAId, essay, conclusionText, isRestored]);

  if (tracker.isLoading || !isRestored) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <div className="w-12 h-12 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-[#395886]">Memuat progres...</p>
      </div>
    );
  }

  // ── Phase 1: Keruntutan Berpikir ──────────────────────────────────────────────
  if (phase === 'consistency') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
        <div className="bg-white rounded-2xl border-2 border-[#8B5CF6]/25 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#8B5CF6]/10 to-transparent border-b border-[#8B5CF6]/15">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#8B5CF6]/15">
              <Layers className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B5CF6]">Keruntutan Berpikir (Consistency of Thinking)</p>
              <h3 className="text-sm font-bold text-[#395886]">Cocokkan Fungsi dengan Lapisan TCP/IP</h3>
            </div>
          </div>
          <div className="px-5 py-3 bg-gradient-to-br from-[#8B5CF6]/3 to-transparent">
            <p className="text-xs text-[#395886]/70 leading-relaxed">
              Seret setiap kartu deskripsi fungsi ke lapisan TCP/IP yang tepat. Aktivitas ini membantu kamu memahami <strong>perbedaan fungsi setiap lapisan</strong> secara runtut dan logis.
            </p>
          </div>
        </div>

        <FunctionMatchingActivity
          placements={matchPlacements}
          validated={matchValidated}
          onPlacementsChange={setMatchPlacements}
          onValidate={() => {
            setMatchValidated(true);
            void tracker.trackEvent('questioning_consistency_validated', {}, { progressPercent: 30 });
          }}
          onNext={() => {
            void tracker.trackEvent('questioning_consistency_completed', {}, { progressPercent: 35 });
            setPhase('arguing');
          }}
        />
      </div>
    );
  }

  // ── Phase 2: Kemampuan Berargumen ─────────────────────────────────────────────
  if (phase === 'arguing') {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
        <div className="bg-white rounded-2xl border-2 border-[#F59E0B]/20 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#F59E0B]/10 to-transparent border-b border-[#F59E0B]/15">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F59E0B]/15">
              <Zap className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#F59E0B]">Kemampuan Berargumen (Arguing Ability)</p>
              <h3 className="text-sm font-bold text-[#395886]">Studi Kasus & Tanya Jawab Fungsi Lapisan</h3>
            </div>
          </div>
          <div className="px-5 py-3 bg-gradient-to-br from-[#F59E0B]/3 to-transparent">
            <p className="text-xs text-[#395886]/70 leading-relaxed">Pelajari peta analogi pizza, analisis gangguan jaringan, lalu lakukan tanya jawab untuk memperdalam pemahaman fungsi setiap lapisan.</p>
          </div>
        </div>

        <PizzaLayerMap />

        <div className="pt-2 border-t-2 border-dashed border-[#D5DEEF]/40">
          <DisruptionSimulation
            lessonId={lessonId}
            stageIndex={stageIndex}
            onComplete={(ans) => {
              setDisruptionDone(true);
              void tracker.trackEvent('questioning_disruption_done', { answerCount: Object.keys(ans ?? {}).length }, { progressPercent: 60 });
            }}
          />
        </div>

        {disruptionDone && (
          <>
            <LayerQASection
              questionBank={questionBank}
              activeId={activeQAId}
              openedIds={openedQAIds}
              onOpen={(id) => {
                setActiveQAId(id);
                if (!openedQAIds.includes(id)) setOpenedQAIds(prev => [...prev, id]);
                void tracker.trackEvent('qa_opened', { questionId: id }, { progressPercent: 70 });
              }}
            />

            <EssayBox
              objectiveLabel="X.TCP.3"
              headerLabel="Argumen Logis"
              prompt="Berdasarkan aktivitas analogi pizza dan analisis gangguan yang telah kamu lakukan, jelaskan mengapa setiap lapisan TCP/IP memiliki fungsi yang berbeda dan tidak bisa saling menggantikan."
              submitLabel="Simpan Argumen"
              minWords={20}
              defaultValue={essay}
              disabled={!!essay}
              onSubmit={(text) => {
                setEssay(text);
                void tracker.trackEvent('questioning_essay_done', {}, { progressPercent: 80 });
              }}
            />
          </>
        )}

        {essay && (
          <ContinueActivityButton
            onClick={() => {
              void tracker.trackEvent('questioning_arguing_completed', {}, { progressPercent: 85 });
              setPhase('conclusion');
            }}
            label="Lanjutkan ke Penarikan Kesimpulan"
          />
        )}
      </div>
    );
  }

  // ── Phase 3: Penarikan Kesimpulan ─────────────────────────────────────────────
  if (phase === 'conclusion') {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
        <ATPConclusionBox
          atpBehavior="mampu membedakan fungsi setiap lapisan model TCP/IP dalam proses komunikasi jaringan"
          objectiveCode="X.TCP.3"
          stageType="questioning"
          defaultValue={conclusionText}
          disabled={!!conclusionText}
          onSubmit={(text) => {
            setConclusionText(text);
            const finalAnswer = { selectedId: 'function_matching', isCorrect: true, askedQuestions: openedQAIds, justification: essay, conclusion: text };
            void tracker.complete(finalAnswer, { phase: 'conclusion', finalAnswer });
            onComplete(finalAnswer);
          }}
        />
        {conclusionText && (
          <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 animate-in fade-in zoom-in-95 duration-300">
            <CheckCircle className="w-5 h-5 text-[#10B981]" />
            <span className="text-sm font-black text-[#065F46]">Kesimpulan tersimpan — Tahap Questioning selesai!</span>
          </div>
        )}
      </div>
    );
  }

  return null;
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
    <div className="w-full space-y-6">
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

// -- Questioning Lesson 2 (TCP Sequence Number / Out-of-Order Packets) ----------

function QuestioningLesson2({
  lessonId, stageIndex, onComplete, scenario, problemVisual, teacherQuestion, questionBank = [],
  whyQuestion, hint, reasonOptions = [],
}: QuestioningStageProps) {
  const tracker = useActivityTracker({ lessonId, stageIndex, stageType: 'questioning' });

  const [phase, setPhase] = useState<'consistency' | 'arguing' | 'conclusion'>('consistency');
  const [activeQAId, setActiveQAId] = useState<string | null>(null);
  const [openedQAIds, setOpenedQAIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);
  const [essay, setEssay] = useState('');
  const [conclusionText, setConclusionText] = useState('');
  const [isRestored, setIsRestored] = useState(false);

  const trackerRef = useRef(tracker);
  trackerRef.current = tracker;

  useEffect(() => {
    if (!tracker.isLoading && !isRestored) {
      const snap = tracker.session?.latestSnapshot;
      if (snap) {
        if (snap.phase) setPhase(snap.phase as typeof phase);
        if (snap.openedQAIds) setOpenedQAIds(snap.openedQAIds as string[]);
        if (snap.activeQAId) setActiveQAId(snap.activeQAId as string);
        if (snap.selectedId) setSelectedId(snap.selectedId as string);
        if (snap.validated) setValidated(snap.validated as boolean);
        if (snap.essay) setEssay(snap.essay as string);
        if (snap.conclusionText) setConclusionText(snap.conclusionText as string);
      }
      setIsRestored(true);
    }
  }, [tracker.isLoading, tracker.session, isRestored]);

  useEffect(() => {
    if (!isRestored) return;
    const progress =
      phase === 'conclusion' ? (conclusionText ? 100 : 90)
      : phase === 'arguing' ? (essay ? 85 : validated ? 65 : selectedId ? 40 : 30)
      : (openedQAIds.length >= 2 ? 25 : openedQAIds.length > 0 ? 15 : 10);
    void trackerRef.current.saveSnapshot(
      { phase, openedQAIds, activeQAId, selectedId, validated, essay, conclusionText },
      { progressPercent: progress },
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, openedQAIds, activeQAId, selectedId, validated, essay, conclusionText, isRestored]);

  if (tracker.isLoading || !isRestored) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-[#395886]">Memuat progres...</p>
      </div>
    );
  }

  const isCorrect = reasonOptions.find(o => o.id === selectedId)?.isCorrect ?? false;
  const canProceedPhase1 = openedQAIds.length >= 2;
  const activeResponse = questionBank.find(q => q.id === activeQAId)?.response;

  // ── Phase 1: Keruntutan Berpikir ───────────────────────────────────────────
  if (phase === 'consistency') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
        <div className="bg-white rounded-2xl border-2 border-[#8B5CF6]/25 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#8B5CF6]/10 to-transparent border-b border-[#8B5CF6]/15">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#8B5CF6]/15">
              <AlertCircle className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8B5CF6]">Keruntutan Berpikir (Consistency of Thinking)</p>
              <h3 className="text-sm font-bold text-[#395886]">Analisis Skenario Out-of-Order Packets</h3>
            </div>
          </div>
          <div className="px-5 py-3 bg-gradient-to-br from-[#8B5CF6]/3 to-transparent">
            <p className="text-xs text-[#395886]/70 leading-relaxed">
              Pelajari skenario masalah TCP berikut dan buka minimal 2 pertanyaan eksplorasi untuk mengumpulkan bukti sebelum menentukan penyebabnya.
            </p>
          </div>
        </div>

        {/* Problem visual */}
        {problemVisual && (
          <div className="bg-white rounded-2xl border-2 border-[#D5DEEF] shadow-sm p-5">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 shrink-0 rounded-2xl bg-[#FEF3C7] flex items-center justify-center text-2xl">
                ⚠️
              </div>
              <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-widest text-[#F59E0B] mb-1">Gejala Jaringan</p>
                <h3 className="text-sm font-bold text-[#395886] mb-1">{problemVisual.title}</h3>
                <p className="text-xs text-[#395886]/70 leading-relaxed">{problemVisual.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Scenario */}
        {scenario && (
          <div className="flex items-start gap-3 p-4 bg-[#EEF4FF] rounded-2xl border border-[#628ECB]/20">
            <Info className="w-4 h-4 text-[#628ECB] mt-0.5 shrink-0" />
            <p className="text-xs text-[#395886]/80 leading-relaxed italic">"{scenario}"</p>
          </div>
        )}

        {/* Question bank */}
        {questionBank.length > 0 && (
          <div className="bg-white rounded-2xl border-2 border-[#628ECB]/20 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4 text-[#628ECB]" />
              <h3 className="text-sm font-bold text-[#395886]">{teacherQuestion || 'Buka pertanyaan eksplorasi:'}</h3>
              <span className={`ml-auto text-[10px] font-black px-2 py-0.5 rounded-full
                ${openedQAIds.length >= 2 ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#D5DEEF] text-[#395886]/40'}`}>
                {openedQAIds.length} / 2 dibuka
              </span>
            </div>
            <div className="space-y-2 mb-4">
              {questionBank.map(q => (
                <button key={q.id}
                  onClick={() => {
                    setActiveQAId(q.id);
                    if (!openedQAIds.includes(q.id)) {
                      setOpenedQAIds(prev => [...prev, q.id]);
                      void tracker.trackEvent('qa_opened', { questionId: q.id }, { progressPercent: 18 });
                    }
                  }}
                  className={`w-full p-3 rounded-xl border-2 text-left text-xs font-bold transition-all
                    ${activeQAId === q.id ? 'border-[#628ECB] bg-[#EEF4FF] text-[#395886]'
                    : openedQAIds.includes(q.id) ? 'border-[#10B981]/40 bg-[#F0FDF4] text-[#065F46]'
                    : 'border-[#D5DEEF] bg-white hover:border-[#628ECB]/40 text-[#395886]'}`}>
                  <span className="flex items-center gap-2">
                    {openedQAIds.includes(q.id) && <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" />}
                    {q.text}
                  </span>
                </button>
              ))}
            </div>
            {activeResponse && (
              <div className="p-4 rounded-xl bg-[#F0FDF4] border-2 border-[#10B981]/20 animate-in fade-in slide-in-from-top-2">
                <p className="text-[10px] font-black text-[#10B981] uppercase mb-1 flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3" /> Fakta Ditemukan
                </p>
                <p className="text-xs font-bold text-[#065F46] leading-relaxed">{activeResponse}</p>
              </div>
            )}
          </div>
        )}

        {canProceedPhase1 && (
          <ContinueActivityButton
            onClick={() => {
              void tracker.trackEvent('questioning_consistency_completed', {}, { progressPercent: 30 });
              setPhase('arguing');
            }}
            label="Lanjutkan ke Kemampuan Berargumen"
          />
        )}
      </div>
    );
  }

  // ── Phase 2: Kemampuan Berargumen ──────────────────────────────────────────
  if (phase === 'arguing') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
        <div className="bg-white rounded-2xl border-2 border-[#F59E0B]/20 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#F59E0B]/10 to-transparent border-b border-[#F59E0B]/15">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F59E0B]/15">
              <Zap className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#F59E0B]">Kemampuan Berargumen (Arguing Ability)</p>
              <h3 className="text-sm font-bold text-[#395886]">Identifikasi & Argumen Logis</h3>
            </div>
          </div>
          <div className="px-5 py-3 bg-gradient-to-br from-[#F59E0B]/3 to-transparent">
            <p className="text-xs text-[#395886]/70 leading-relaxed">
              Pilih field TCP Header yang paling berperan, periksa pilihanmu, lalu tulis argumen logis berdasarkan fakta yang kamu temukan.
            </p>
          </div>
        </div>

        {/* Reason options */}
        <div className="bg-white rounded-2xl border-2 border-[#D5DEEF] shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#395886] mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#F59E0B]" /> {whyQuestion || 'Field TCP Header mana yang paling berperan?'}
          </h3>
          {hint && (
            <div className="mb-3 flex items-start gap-2 p-3 bg-[#FFFBEB] rounded-xl border border-[#F59E0B]/20">
              <Lightbulb className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
              <p className="text-xs text-[#78350F] leading-relaxed">{hint}</p>
            </div>
          )}
          <div className="space-y-2 mb-4">
            {reasonOptions.map(opt => (
              <button key={opt.id}
                onClick={() => !validated && setSelectedId(opt.id)}
                disabled={validated}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all
                  ${selectedId === opt.id
                    ? (validated ? (opt.isCorrect ? 'border-[#10B981] bg-[#F0FDF4]' : 'border-red-400 bg-red-50') : 'border-[#628ECB] bg-[#EEF4FF]')
                    : 'border-[#D5DEEF] bg-white hover:border-[#628ECB]/30'}`}>
                <p className="text-xs font-bold text-[#395886]">{opt.text}</p>
                {validated && selectedId === opt.id && (
                  <p className={`text-[10px] font-bold mt-2 ${opt.isCorrect ? 'text-[#10B981]' : 'text-red-500'}`}>{opt.feedback}</p>
                )}
              </button>
            ))}
          </div>
          {!validated && (
            <button
              onClick={() => {
                if (!selectedId) return;
                setValidated(true);
                void tracker.trackEvent('questioning_validation', { selectedId }, {
                  isCorrect: reasonOptions.find(o => o.id === selectedId)?.isCorrect ?? false,
                  progressPercent: 55,
                });
              }}
              disabled={!selectedId}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all
                ${selectedId ? 'bg-[#395886] text-white hover:bg-[#628ECB]' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'}`}>
              Periksa Pilihan
            </button>
          )}
        </div>

        {/* Essay after validation */}
        {validated && (
          <EssayBox
            objectiveLabel="X.TCP.11"
            headerLabel="Argumen Logis"
            prompt="Berdasarkan skenario out-of-order packets dan pilihan field TCP Header yang baru saja kamu analisis, jelaskan secara teknis: (1) Mengapa field tersebut (bukan yang lain) yang memungkinkan penerima merekonstruksi data dengan benar? (2) Apa yang terjadi jika TCP tidak memiliki field tersebut?"
            submitLabel="Simpan Argumen"
            minWords={20}
            defaultValue={essay}
            disabled={!!essay}
            onSubmit={(text) => {
              setEssay(text);
              void tracker.trackEvent('questioning_essay_done', {}, { progressPercent: 80 });
            }}
          />
        )}

        {essay && (
          <ContinueActivityButton
            onClick={() => {
              void tracker.trackEvent('questioning_arguing_completed', {}, { progressPercent: 85 });
              setPhase('conclusion');
            }}
            label="Lanjutkan ke Penarikan Kesimpulan"
          />
        )}
      </div>
    );
  }

  // ── Phase 3: Penarikan Kesimpulan ──────────────────────────────────────────
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
      <ATPConclusionBox
        atpBehavior="mampu membedakan kondisi pengiriman data normal dengan kondisi yang memerlukan error recovery pada TCP berdasarkan nilai Sequence Number"
        objectiveCode="X.TCP.11"
        stageType="questioning"
        defaultValue={conclusionText}
        disabled={!!conclusionText}
        onSubmit={(text) => {
          setConclusionText(text);
          const finalAnswer = { selectedId: selectedId ?? '', isCorrect, askedQuestions: openedQAIds, justification: essay, conclusion: text };
          void tracker.complete(finalAnswer, { phase: 'conclusion', finalAnswer });
          onComplete(finalAnswer);
        }}
      />
      {conclusionText && (
        <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 animate-in fade-in zoom-in-95 duration-300">
          <CheckCircle className="w-5 h-5 text-[#10B981]" />
          <span className="text-sm font-black text-[#065F46]">Kesimpulan tersimpan — Tahap Questioning selesai!</span>
        </div>
      )}
    </div>
  );
}

// -- Main Export ----------------------------------------------------------------

export function QuestioningStage(props: QuestioningStageProps) {
  if (props.lessonId === '1') return <QuestioningLesson1 {...props} />;
  if (props.lessonId === '2') return <QuestioningLesson2 {...props} />;
  return <QuestioningOriginal {...props} />;
}
