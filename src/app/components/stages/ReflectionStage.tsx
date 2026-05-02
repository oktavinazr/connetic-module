import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  PenLine, 
  CheckCircle, 
  ChevronRight, 
  Lightbulb, 
  RotateCcw, 
  Plus, 
  ArrowRight,
  Target,
  Users,
  Brain,
  MessageSquare,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  Search,
  Layout
} from 'lucide-react';
import { getCurrentUser } from '../../utils/auth';
import { getLessonProgress, saveStageAttempt } from '../../utils/progress';

// -- Types ----------------------------------------------------------------------

interface ConceptNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
}

interface Connection {
  from: string;
  to: string;
  label: string;
}

interface ReflectionStageProps {
  lessonId: string;
  stageIndex: number;
  moduleId: string; // e.g., 'X.TCP.9'
  onComplete: (answer: any) => void;
  isCompleted?: boolean;
}

// -- Concept Map Builder --------------------------------------------------------

const CONCEPT_POOL = [
  { id: 'tcp', label: 'TCP', color: '#628ECB' },
  { id: 'ip', label: 'IP Address', color: '#10B981' },
  { id: 'encap', label: 'Enkapsulasi', color: '#8B5CF6' },
  { id: 'decap', label: 'Dekapsulasi', color: '#EC4899' },
  { id: 'segment', label: 'Segmentasi', color: '#395886' },
  { id: 'pdu', label: 'PDU', color: '#F59E0B' },
];

const CONNECTION_LABELS = ['Berhubungan dengan', 'Bagian dari', 'Mengakibatkan', 'Membutuhkan', 'Mengamankan'];

function ConceptMapBuilder({ lessonId, stageIndex, onNext }: { lessonId: string; stageIndex: number; onNext: (data: any) => void }) {
  const [nodes, setNodes] = useState<ConceptNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedFrom, setSelectedFrom] = useState<string | null>(null);

  const addNode = (concept: typeof CONCEPT_POOL[0]) => {
    if (nodes.find(n => n.id === concept.id)) return;
    const newNode: ConceptNode = {
      ...concept,
      x: 50 + Math.random() * 200,
      y: 50 + Math.random() * 150
    };
    setNodes([...nodes, newNode]);
  };

  const handleNodeClick = (id: string) => {
    if (!selectedFrom) {
      setSelectedFrom(id);
    } else if (selectedFrom === id) {
      setSelectedFrom(null);
    } else {
      // Create connection
      if (!connections.find(c => (c.from === selectedFrom && c.to === id) || (c.from === id && c.to === selectedFrom))) {
        setConnections([...connections, { from: selectedFrom, to: id, label: CONNECTION_LABELS[0] }]);
      }
      setSelectedFrom(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2rem] border-2 border-[#F59E0B]/20 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B]"><Brain className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F59E0B] mb-1">X.TCP.9 - Concept Map Builder</p>
            <h3 className="text-base font-bold text-[#395886]">Visualisasikan Hubungan Antar Konsep</h3>
          </div>
        </div>

        <div className="grid lg:grid-cols-[250px_1fr] gap-8">
           <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40 px-2">Pilih Konsep</p>
              <div className="grid gap-2">
                 {CONCEPT_POOL.map(c => (
                   <button key={c.id} onClick={() => addNode(c)} disabled={nodes.some(n => n.id === c.id)} className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${nodes.some(n => n.id === c.id) ? 'opacity-30 cursor-not-allowed' : 'bg-white border-[#D5DEEF] hover:border-[#628ECB]'}`}>
                      <Plus className="w-3.5 h-3.5 text-[#628ECB]" />
                      <span className="text-xs font-bold text-[#395886]">{c.label}</span>
                   </button>
                 ))}
              </div>
           </div>

           <div className="relative bg-[#F8FAFD] rounded-3xl border-2 border-[#D5DEEF] min-h-[400px] overflow-hidden shadow-inner p-8">
              {nodes.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-[#395886]/20 font-black uppercase text-xs tracking-widest">Kanvas Masih Kosong</div>}
              
              <div className="flex flex-wrap gap-4 relative z-10">
                 {nodes.map(node => (
                   <button key={node.id} onClick={() => handleNodeClick(node.id)} className={`px-5 py-3 rounded-2xl border-b-4 font-black text-xs transition-all shadow-md ${selectedFrom === node.id ? 'ring-4 ring-[#F59E0B]/30 scale-110' : 'hover:scale-105'}`} style={{ backgroundColor: node.color, color: 'white', borderColor: 'rgba(0,0,0,0.1)' }}>
                      {node.label}
                   </button>
                 ))}
              </div>

              <div className="mt-12 space-y-3 relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/30">Hubungan Terpetakan ({connections.length})</p>
                 {connections.map((c, i) => {
                   const fromNode = nodes.find(n => n.id === c.from);
                   const toNode = nodes.find(n => n.id === c.to);
                   return (
                     <div key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#D5DEEF] shadow-sm text-[11px] font-bold text-[#395886] mr-2">
                        {fromNode?.label} <ArrowRight className="w-3 h-3 text-[#628ECB]" /> {toNode?.label}
                     </div>
                   );
                 })}
              </div>
           </div>
        </div>
      </div>

      <button onClick={() => onNext({ nodes, connections })} disabled={nodes.length < 3 || connections.length < 2} className="w-full py-4 rounded-2xl bg-[#395886] text-white font-black text-sm shadow-xl disabled:bg-[#D5DEEF] transition-all">Lanjut ke Refleksi Esai</button>
    </div>
  );
}

// -- Essay + Self-Eval ---------------------------------------------------------

function EssayPhase({ onDone }: { onDone: (data: any) => void }) {
  const [essay, setEssay] = useState('');
  const [confidence, setConfidence] = useState(3);
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in zoom-in-95 duration-500">
      <div className="bg-white rounded-[2rem] border-2 border-[#D5DEEF] p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-[#628ECB]/10 flex items-center justify-center text-[#628ECB]"><PenLine className="w-6 h-6" /></div>
          <h3 className="text-xl font-black text-[#395886]">Refleksi Akhir Pertemuan</h3>
        </div>
        
        <p className="text-sm font-bold text-[#395886]/60 mb-6 leading-relaxed">Setelah melewati seluruh tahapan belajar hari ini, bagaimana kamu menyimpulkan peran protokol TCP/IP dalam menjaga keutuhan data di internet?</p>
        <textarea value={essay} onChange={e => setEssay(e.target.value)} rows={5} className="w-full p-5 rounded-[1.5rem] border-2 border-[#D5DEEF] text-sm focus:border-[#628ECB] outline-none bg-[#F8FAFD] mb-8" placeholder="Tuliskan refleksimu di sini..." />
        
        <div className="space-y-4">
           <p className="text-xs font-black uppercase tracking-widest text-[#395886]/40">Tingkat Keyakinan Pemahaman</p>
           <div className="flex items-center justify-between gap-2">
              {[1,2,3,4,5].map(v => (
                <button key={v} onClick={() => setConfidence(v)} className={`flex-1 py-3 rounded-xl border-2 font-black text-sm transition-all ${confidence === v ? 'bg-[#10B981] border-[#10B981] text-white shadow-md' : 'bg-white border-[#D5DEEF] text-[#395886]/30'}`}>{v}</button>
              ))}
           </div>
           <div className="flex justify-between px-1 text-[9px] font-black text-[#395886]/30 uppercase tracking-tighter">
              <span>Kurang Yakin</span>
              <span>Sangat Yakin</span>
           </div>
        </div>

        <button onClick={() => onDone({ essay, confidence })} disabled={essay.length < 50} className="w-full mt-10 py-4 rounded-2xl bg-[#10B981] text-white font-black text-sm shadow-xl disabled:bg-[#D5DEEF]">Selesaikan Seluruh Pertemuan</button>
      </div>
    </div>
  );
}

// -- Root component ------------------------------------------------------------

export function ReflectionStage({ lessonId, stageIndex, moduleId, onComplete, isCompleted }: ReflectionStageProps) {
  const [phase, setPhase] = useState<'map' | 'essay'>(isCompleted ? 'essay' : 'map');
  const [mapData, setMapData] = useState<any>(null);

  if (phase === 'map') return <ConceptMapBuilder lessonId={lessonId} stageIndex={stageIndex} onNext={(data) => { setMapData(data); setPhase('essay'); }} />;
  if (phase === 'essay') return <EssayPhase onDone={(data) => onComplete({ ...data, mapData })} />;
  return null;
}
