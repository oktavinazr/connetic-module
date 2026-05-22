import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, CheckCircle, XCircle, Users, Link as LinkIcon, FileSearch,
  MessageSquare, Info, RotateCcw, AlertCircle, ThumbsUp, ArrowUpDown, GripVertical,
  Zap, Database, Cpu, Cable, Network, ShieldCheck, PlayCircle, Eye, ArrowRight,
  Vote, Award, Sparkles, Monitor, PenLine, BookOpen, GraduationCap, Lightbulb,
  Clock, Server, Lock, Unlock, ArrowDown, ArrowUp, Shuffle
} from 'lucide-react';
import { getCurrentUser } from '../../utils/auth';
import {
  upsertGroupDiscussion,
  getGroupDiscussions,
  toggleGroupDiscussionVote,
  getGroupMembers,
  type GroupDiscussion
} from '../../utils/groups';
import { supabase } from '../../utils/supabase';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { TcpIpInteractive } from '../ui/TcpIpInteractive';
import { StepTracker, ActivityCard, InstructionBox, EssayBox, ATPConclusionBox, anim, SectionDivider } from './StageKit';

// -- Types ----------------------------------------------------------------------

interface CaseStudyOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  logic?: string;
  description?: string;
}

interface CaseStudy {
  id: string;
  title: string;
  concept?: string;
  description?: string;
  scenario?: string;
  question: string;
  options: CaseStudyOption[];
  correctFeedback?: string;
  argumentPrompt?: string;
}

interface TimelineFlowchartData {
  instruction: string;
  blocks: Array<{ id: string; label: string; text: string; correctSlot: number }>;
  successMessage: string;
  errorFeedback: string;
}

interface LearningCommunityStageProps {
  lessonId: string;
  stageIndex: number;
  moduleId: string;
  groupName?: string;
  onComplete: (answer: any) => void;
  isCompleted?: boolean;
  layers5?: Array<{ id: string; name: string; pdu: string; color: string; desc: string }>;
  encapsulationCase?: CaseStudy;
  decapsulationCase?: CaseStudy;
  timelineFlowchart?: TimelineFlowchartData;
  onTrackerPhase?: (phase: 'consistency' | 'arguing' | 'conclusion') => void;
  atpBehavior?: string;
}

// -- Shared UI Components -------------------------------------------------------

function GroupMembersList({ members, submissions = [] }: { members: { user_id: string; user_name: string }[]; submissions?: string[] }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-6">
      {members.map((m, i) => {
        const hasSubmitted = submissions.includes(m.user_id);
        return (
          <div key={m.user_id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border-2 transition-all ${hasSubmitted ? 'border-[#10B981] bg-[#F0FDF4]' : 'border-[#D5DEEF]'}`}>
             <div className={`w-2 h-2 rounded-full ${hasSubmitted ? 'bg-[#10B981]' : 'bg-[#D5DEEF]'} ${!hasSubmitted && 'animate-pulse'}`} />
             <span className={`text-[9px] font-black uppercase tracking-tight ${hasSubmitted ? 'text-[#065F46]' : 'text-[#395886]'}`}>{m.user_name}</span>
             {hasSubmitted && <CheckCircle className="w-3 h-3 text-[#10B981]" />}
          </div>
        );
      })}
      {members.length === 0 && <p className="text-[10px] font-bold text-[#395886]/30 uppercase italic">Menunggu anggota lain...</p>}
    </div>
  );
}

// -- Interactive Timeline Flowchart (Lesson 2 Tahap 1: Keruntutan Berpikir) ------

const MAX_ATTEMPTS = 3;

function TimelineFlowchartSection({
  data, onSuccess,
}: {
  data: TimelineFlowchartData;
  onSuccess: () => void;
}) {
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect' | 'locked'>('idle');
  const [attempts, setAttempts] = useState(0);

  const remainingAttempts = MAX_ATTEMPTS - attempts;
  const isLocked = status === 'locked';
  const isEditable = status !== 'correct' && !isLocked;

  const availableBlocks = data.blocks.filter(b => !slots.includes(b.id));

  const handlePlaceBlock = (blockId: string, slotIndex: number) => {
    if (!isEditable) return;
    const newSlots = [...slots];
    if (newSlots[slotIndex]) return;
    const existingIdx = newSlots.indexOf(blockId);
    if (existingIdx !== -1) newSlots[existingIdx] = null;
    newSlots[slotIndex] = blockId;
    setSlots(newSlots);
    setStatus('idle');
  };

  const handleRemoveFromSlot = (slotIndex: number) => {
    if (!isEditable) return;
    const newSlots = [...slots];
    newSlots[slotIndex] = null;
    setSlots(newSlots);
    setStatus('idle');
  };

  const handleReset = () => {
    if (isLocked) return;
    setSlots([null, null, null]);
    setStatus('idle');
  };

  const handleCheck = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    const allCorrect = data.blocks.every(b => slots[b.correctSlot - 1] === b.id);
    if (allCorrect) {
      setStatus('correct');
    } else if (newAttempts >= MAX_ATTEMPTS) {
      // Reveal correct answer
      const correctSlots = [...slots];
      data.blocks.forEach(b => { correctSlots[b.correctSlot - 1] = b.id; });
      setSlots(correctSlots);
      setStatus('locked');
    } else {
      setStatus('incorrect');
    }
  };

  const getBlockById = (id: string) => data.blocks.find(b => b.id === id);

  return (
    <div className="space-y-6">
      {/* Single card — no duplicate heading */}
      <div className="bg-white rounded-2xl border-2 border-[#D5DEEF] shadow-sm overflow-hidden">
        {/* Top bar: instruction + attempt badge */}
        <div className="flex items-start justify-between gap-3 p-4 border-b border-[#D5DEEF]/60 bg-[#F8FAFD]">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <Info className="w-4 h-4 text-[#628ECB] shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-[#395886]/80 leading-relaxed">{data.instruction}</p>
          </div>
          <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold
            ${isLocked ? 'border-red-200 bg-red-50 text-red-500' : 'border-[#8B5CF6]/20 bg-white text-[#8B5CF6]'}`}>
            <AlertCircle className="w-3 h-3" />
            {isLocked ? 'Habis' : `${remainingAttempts} percobaan`}
          </div>
        </div>

        {/* Activity body */}
        <div className="p-5 space-y-5">
          {/* Timeline Slots — no sub-heading, langsung slot */}
          <div className="grid gap-3">
          {[1, 2, 3].map((stepNum, idx) => {
            const blockId = slots[idx];
            const block = blockId ? getBlockById(blockId) : null;
            const isOccupied = !!block;

            return (
              <div key={idx} className="relative">
                <div className="flex items-center gap-3 mb-1.5">
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-sm"
                    style={{ backgroundColor: idx === 0 ? '#628ECB' : idx === 1 ? '#8B5CF6' : '#10B981' }}
                  >
                    {stepNum}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40">Langkah {stepNum}</span>
                </div>

                <div
                  onClick={() => isOccupied && isEditable && handleRemoveFromSlot(idx)}
                  className={`min-h-[58px] rounded-2xl border-2 transition-all duration-300 flex items-center justify-center p-3
                    ${isEditable ? 'cursor-pointer border-dashed' : 'cursor-default'}
                    ${status === 'correct'
                      ? 'border-[#10B981] bg-[#F0FDF4]'
                      : isLocked
                        ? 'border-[#F59E0B] bg-[#FFFBEB]'
                        : status === 'incorrect' && !isOccupied
                          ? 'border-red-300 bg-red-50/50'
                          : isOccupied
                            ? 'border-[#628ECB] bg-[#EEF4FF] shadow-sm'
                            : isEditable
                              ? 'border-[#D5DEEF] bg-white hover:border-[#628ECB]/50'
                              : 'border-[#D5DEEF] bg-white'
                    }`}
                >
                  {isOccupied ? (
                    <div className="flex items-center gap-3 w-full group">
                      <span
                        className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black text-white"
                        style={{ backgroundColor: idx === 0 ? '#628ECB' : idx === 1 ? '#8B5CF6' : '#10B981' }}
                      >
                        {block!.label}
                      </span>
                      <span className="text-xs font-bold text-[#395886] flex-1 leading-relaxed">{block!.text}</span>
                      {isEditable && (
                        <XCircle className="w-4 h-4 text-[#395886]/20 group-hover:text-red-400 transition-colors shrink-0" />
                      )}
                      {isLocked && (
                        <CheckCircle className="w-4 h-4 text-[#F59E0B] shrink-0" />
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <ArrowDown className="w-4 h-4 text-[#D5DEEF]" />
                      <span className="text-[10px] font-bold text-[#D5DEEF] uppercase">Letakkan Blok di Sini</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Available Blocks — no sub-heading, langsung blok */}
        {isEditable && (
          <div className="grid gap-2">
            {availableBlocks.map(block => (
              <div key={block.id} className="flex flex-wrap gap-2">
                {[0, 1, 2].map(slotIdx => {
                  if (slots[slotIdx]) return null;
                  return (
                    <button
                      key={slotIdx}
                      onClick={() => handlePlaceBlock(block.id, slotIdx)}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-[#D5DEEF] bg-white hover:border-[#628ECB]/50 hover:bg-[#EEF4FF] transition-all text-left group flex-1 min-w-0"
                    >
                      <span
                        className="shrink-0 px-2 py-1 rounded-lg text-[10px] font-black text-white"
                        style={{ backgroundColor: slotIdx === 0 ? '#628ECB' : slotIdx === 1 ? '#8B5CF6' : '#10B981' }}
                      >
                        {block.label}
                      </span>
                      <span className="text-[11px] font-bold text-[#395886] leading-snug flex-1">{block.text}</span>
                      <div className="shrink-0 flex flex-col items-center text-[#628ECB]/30 group-hover:text-[#628ECB] transition-colors">
                        <span className="text-[8px] font-black">Ke</span>
                        <span className="text-[8px] font-black">Slot {slotIdx + 1}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
            {availableBlocks.length === 0 && (
              <p className="text-center text-[10px] font-bold text-[#395886]/30 py-2">Semua blok sudah ditempatkan. Periksa urutannya!</p>
            )}
          </div>
        )}

        {/* Feedback */}
        {status === 'incorrect' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 flex items-start gap-3"
          >
            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-800 mb-1">Urutan Belum Logis</p>
              <p className="text-xs text-red-600/80 leading-relaxed">{data.errorFeedback}</p>
              <button
                onClick={handleReset}
                className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Coba Susun Ulang
              </button>
            </div>
          </motion.div>
        )}

        {/* Locked state */}
        {isLocked && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-start gap-3">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-100 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800 mb-1">Batas Percobaan Tercapai (3×)</p>
                <p className="text-xs text-amber-600/80 leading-relaxed">
                  Kamu telah menggunakan semua kesempatan. Urutan yang benar telah ditampilkan di atas.
                  Pelajari alurnya: <strong>SYN → SYN-ACK → ACK</strong>, lalu lanjutkan ke papan kolaboratif.
                </p>
              </div>
            </div>

            <button
              onClick={onSuccess}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm shadow-lg transition-all active:scale-95 bg-gradient-to-r from-[#395886] to-[#628ECB] text-white hover:opacity-90"
            >
              <Users className="w-4 h-4" />
              Masuk ke Papan Kolaboratif
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {status === 'correct' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-5 rounded-2xl bg-[#F0FDF4] border-2 border-[#10B981] flex items-start gap-3">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-[#10B981]/15 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#065F46] mb-1">Koneksi Valid!</p>
                <p className="text-xs text-[#10B981]/80 leading-relaxed">{data.successMessage}</p>
              </div>
            </div>

            <button
              onClick={onSuccess}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm shadow-lg transition-all active:scale-95 bg-gradient-to-r from-[#395886] to-[#628ECB] text-white hover:opacity-90"
            >
              <Users className="w-4 h-4" />
              Masuk ke Papan Kolaboratif
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Check / Reset buttons */}
        {isEditable && (
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              disabled={slots.every(s => s === null)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 bg-white border-2 border-[#D5DEEF] text-[#395886]/60 hover:border-[#628ECB]/30 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleCheck}
              disabled={slots.some(s => s === null)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all active:scale-95 shadow-sm
                ${slots.some(s => s === null)
                  ? 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'
                  : 'bg-[#F59E0B] text-white hover:bg-amber-600'}`}
            >
              <CheckCircle className="w-4 h-4" />
              Periksa Urutan
            </button>
          </div>
        )}
        </div>{/* close activity body */}
      </div>{/* close single card */}
    </div>
  );
}

// -- Three-Way Handshake Animation (Lesson 2 simulasi phase) -------------------

const TWH_ANIM_STEPS = [
  {
    id: 'syn',
    dir: 'ltr' as const,
    stepLabel: 'Langkah 1 / 3',
    title: 'Client → Kirim SYN',
    packet: { name: 'SYN', flags: 'SYN = 1', seq: 'Seq = 1000', ack: null, color: '#628ECB' },
    clientStatus: 'SYN_SENT',
    serverStatus: 'LISTEN',
    explanation: 'Client memulai koneksi dengan memilih ISN (Initial Sequence Number) = 1000 secara acak, lalu mengirim paket SYN. Status Client berubah: CLOSED → SYN_SENT.',
    insight: 'ISN dipilih acak untuk keamanan — agar pihak luar tidak mudah menebak nomor urut koneksi aktif.',
  },
  {
    id: 'synack',
    dir: 'rtl' as const,
    stepLabel: 'Langkah 2 / 3',
    title: 'Server → Balas SYN-ACK',
    packet: { name: 'SYN-ACK', flags: 'SYN=1, ACK=1', seq: 'Seq = 5000', ack: 'Ack = 1001', color: '#8B5CF6' },
    clientStatus: 'SYN_SENT',
    serverStatus: 'SYN_RECEIVED',
    explanation: 'Server menerima SYN dari Client. Server memilih ISN-nya sendiri = 5000, lalu membalas dengan dua flag sekaligus: SYN+ACK. Ack=1001 karena ISN Client (1000) + 1. Status Server: SYN_RECEIVED.',
    insight: 'SYN-ACK adalah satu-satunya paket dengan DUA flag aktif sekaligus — efisiensi desain protokol TCP.',
  },
  {
    id: 'ack',
    dir: 'ltr' as const,
    stepLabel: 'Langkah 3 / 3',
    title: 'Client → Kirim ACK Final',
    packet: { name: 'ACK', flags: 'ACK = 1', seq: 'Seq = 1001', ack: 'Ack = 5001', color: '#10B981' },
    clientStatus: 'ESTABLISHED',
    serverStatus: 'ESTABLISHED',
    explanation: 'Client mengkonfirmasi SYN Server dengan Ack=5001 (ISN Server + 1). Sekarang KEDUA pihak berstatus ESTABLISHED — koneksi TCP terbuka penuh dan data siap mengalir!',
    insight: 'Setelah ACK ini, tidak ada SYN tambahan. Segmen data nyata mulai mengalir dengan Sequence Number = 1001.',
  },
] as const;

const STATUS_COLOR: Record<string, string> = {
  CLOSED: '#9CA3AF',
  LISTEN: '#F59E0B',
  SYN_SENT: '#628ECB',
  SYN_RECEIVED: '#8B5CF6',
  ESTABLISHED: '#10B981',
};

function TwhAnimationSection() {
  const [step, setStep] = useState(-1);
  const [packetIdx, setPacketIdx] = useState<number | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [replayCount, setReplayCount] = useState(0);

  const completedStep = step >= 0 ? TWH_ANIM_STEPS[step] : null;
  const clientStatus = completedStep ? completedStep.clientStatus : 'CLOSED';
  const serverStatus = completedStep ? completedStep.serverStatus : 'LISTEN';
  const allDone = step === TWH_ANIM_STEPS.length - 1;
  const flyingPacket = packetIdx !== null ? TWH_ANIM_STEPS[packetIdx] : null;

  const advance = () => {
    if (advancing || allDone) return;
    const nextIdx = step + 1;
    setAdvancing(true);
    setPacketIdx(nextIdx);
    setTimeout(() => {
      setStep(nextIdx);
      setPacketIdx(null);
      setAdvancing(false);
    }, 950);
  };

  const handleReplay = () => {
    setStep(-1);
    setPacketIdx(null);
    setAdvancing(false);
    setReplayCount(prev => prev + 1);
  };

  return (
    <div className="space-y-4">
      {/* Diagram card */}
      <div className="bg-white rounded-2xl border-2 border-[#D5DEEF] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#628ECB]/10 to-transparent border-b border-[#D5DEEF]">
          <div className="h-8 w-8 rounded-xl bg-[#628ECB]/15 flex items-center justify-center">
            <Network className="w-4 h-4 text-[#628ECB]" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#628ECB]">Animasi Interaktif</p>
            <h3 className="text-sm font-bold text-[#395886]">Three-Way Handshake TCP</h3>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {replayCount > 0 && (
              <span className="text-[9px] font-black text-[#628ECB] bg-[#628ECB]/10 px-2 py-0.5 rounded-full border border-[#628ECB]/20">
                Ulangan ke-{replayCount}
              </span>
            )}
            <div className="flex gap-1">
              {TWH_ANIM_STEPS.map((_, i) => (
                <div key={i} className={`rounded-full transition-all duration-400 ${i <= step ? 'w-5 h-2 bg-[#10B981]' : 'w-2 h-2 bg-[#D5DEEF]'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Node + packet lane */}
        <div className="px-5 py-6">
          <div className="flex items-center gap-3">
            {/* Client node */}
            <div className="flex flex-col items-center gap-2 w-[90px]">
              <div className="h-12 w-12 rounded-2xl bg-[#628ECB]/10 flex items-center justify-center shadow-sm border-2 border-[#628ECB]/20">
                <Monitor className="w-6 h-6 text-[#628ECB]" />
              </div>
              <span className="text-[10px] font-black text-[#395886] uppercase tracking-wide">CLIENT</span>
              <motion.span
                key={clientStatus}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-2.5 py-1 rounded-full text-[9px] font-black text-white"
                style={{ backgroundColor: STATUS_COLOR[clientStatus] }}
              >
                {clientStatus}
              </motion.span>
            </div>

            {/* Packet animation lane */}
            <div className="flex-1 relative h-14 flex items-center justify-center overflow-hidden">
              {/* Base dashed line */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-[#D5DEEF]" />

              <AnimatePresence>
                {flyingPacket && (
                  <motion.div
                    key={flyingPacket.id}
                    initial={{ x: flyingPacket.dir === 'ltr' ? '-130%' : '130%', opacity: 0 }}
                    animate={{ x: '0%', opacity: 1 }}
                    exit={{ x: flyingPacket.dir === 'ltr' ? '130%' : '-130%', opacity: 0 }}
                    transition={{ duration: 0.7, ease: 'easeInOut' }}
                    className="relative z-10 px-3 py-1.5 rounded-full text-white text-[10px] font-black shadow-lg whitespace-nowrap"
                    style={{ backgroundColor: flyingPacket.packet.color }}
                  >
                    {flyingPacket.packet.name}
                    {' '}({flyingPacket.packet.seq}{flyingPacket.packet.ack ? `, ${flyingPacket.packet.ack}` : ''})
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Direction arrow overlay */}
              {flyingPacket && (
                <div className={`absolute bottom-0.5 w-full flex ${flyingPacket.dir === 'ltr' ? 'justify-end pr-2' : 'justify-start pl-2'}`}>
                  <ArrowRight className={`w-3.5 h-3.5 text-[#628ECB]/50 ${flyingPacket.dir === 'rtl' ? 'rotate-180' : ''}`} />
                </div>
              )}

              {/* Completed arrow for current step (static) */}
              {!flyingPacket && completedStep && !allDone && (
                <div className={`absolute bottom-0.5 w-full flex ${completedStep.dir === 'ltr' ? 'justify-end pr-2' : 'justify-start pl-2'}`}>
                  <ArrowRight className={`w-3.5 h-3.5 text-[#10B981]/50 ${completedStep.dir === 'rtl' ? 'rotate-180' : ''}`} />
                </div>
              )}
            </div>

            {/* Server node */}
            <div className="flex flex-col items-center gap-2 w-[90px]">
              <div className="h-12 w-12 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center shadow-sm border-2 border-[#8B5CF6]/20">
                <Server className="w-6 h-6 text-[#8B5CF6]" />
              </div>
              <span className="text-[10px] font-black text-[#395886] uppercase tracking-wide">SERVER</span>
              <motion.span
                key={serverStatus}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-2.5 py-1 rounded-full text-[9px] font-black text-white"
                style={{ backgroundColor: STATUS_COLOR[serverStatus] }}
              >
                {serverStatus}
              </motion.span>
            </div>
          </div>

          {/* ESTABLISHED banner */}
          <AnimatePresence>
            {allDone && (
              <motion.div
                key={`done-r${replayCount}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-2"
              >
                <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#10B981]/10 border-2 border-[#10B981]/25">
                  <CheckCircle className="w-4 h-4 text-[#10B981]" />
                  <span className="text-xs font-black text-[#065F46]">Koneksi TCP Berhasil Terbentuk — ESTABLISHED!</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Step detail panel */}
      <AnimatePresence mode="wait">
        {completedStep && (
          <motion.div
            key={`${completedStep.id}-r${replayCount}`}
            initial={{ opacity: 0, y: 8, scale: replayCount > 0 ? 0.97 : 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border-2 shadow-sm overflow-hidden"
            style={{ borderColor: replayCount > 0 ? completedStep.packet.color : `${completedStep.packet.color}40`,
                     boxShadow: replayCount > 0 ? `0 0 0 3px ${completedStep.packet.color}25` : undefined }}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b"
              style={{ backgroundColor: `${completedStep.packet.color}10`, borderColor: `${completedStep.packet.color}20` }}>
              <div className="h-8 w-8 rounded-xl flex items-center justify-center text-white text-xs font-black"
                style={{ backgroundColor: completedStep.packet.color }}>
                {step + 1}
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: completedStep.packet.color }}>{completedStep.stepLabel}</p>
                <p className="text-sm font-bold text-[#395886]">{completedStep.title}</p>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {/* Packet values badges */}
              <div className="flex flex-wrap gap-1.5">
                {[completedStep.packet.flags, completedStep.packet.seq, completedStep.packet.ack].filter(Boolean).map((v, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-[10px] font-black text-[#395886] bg-[#F0F3FA] border border-[#D5DEEF]">
                    {v as string}
                  </span>
                ))}
              </div>
              <p className="text-xs text-[#395886]/70 leading-relaxed">{completedStep.explanation}</p>
              <div className="flex items-start gap-2 p-2.5 bg-[#FFFBEB] rounded-xl border border-[#F59E0B]/20">
                <Lightbulb className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#78350F] leading-relaxed">{completedStep.insight}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Initial hint */}
      {step < 0 && (
        <div className="flex items-start gap-3 p-4 bg-[#EEF4FF] rounded-2xl border border-[#628ECB]/20">
          <Info className="w-4 h-4 text-[#628ECB] shrink-0 mt-0.5" />
          <p className="text-xs text-[#395886]/70 leading-relaxed">
            Status awal: <strong>Client = CLOSED</strong>, <strong>Server = LISTEN</strong>.
            Klik tombol di bawah untuk memulai simulasi Three-Way Handshake langkah demi langkah.
          </p>
        </div>
      )}

      {/* Advance / replay buttons */}
      {!allDone ? (
        <button
          onClick={advance}
          disabled={advancing}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm transition-all active:scale-95 shadow-sm
            ${advancing
              ? 'bg-[#D5DEEF] text-[#395886]/40 cursor-wait'
              : 'bg-gradient-to-r from-[#395886] to-[#628ECB] text-white hover:opacity-90 shadow-[#628ECB]/15'}`}
        >
          {advancing
            ? <><RotateCcw className="w-4 h-4 animate-spin" /> Mengirim Paket...</>
            : step < 0
              ? <>Mulai Simulasi <ChevronRight className="w-4 h-4" /></>
              : <>Langkah Berikutnya ({step + 2} / {TWH_ANIM_STEPS.length}) <ChevronRight className="w-4 h-4" /></>
          }
        </button>
      ) : (
        <AnimatePresence>
          <motion.div
            key={`replay-panel-r${replayCount}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="space-y-3"
          >
            {/* Discussion prompt (shown after first watch) */}
            <div className="flex items-start gap-3 p-4 bg-[#EEF4FF] rounded-2xl border border-[#628ECB]/25">
              <Users className="w-4 h-4 text-[#628ECB] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-black text-[#395886]">Diskusikan bersama kelompokmu!</p>
                <p className="text-[11px] text-[#395886]/70 leading-relaxed">
                  Coba jelaskan kepada teman kelompokmu: apa yang terjadi pada tiap langkah SYN → SYN-ACK → ACK?
                  Ulangi animasi jika perlu agar kamu benar-benar paham alurnya.
                </p>
              </div>
            </div>

            {/* Replay button */}
            <button
              onClick={handleReplay}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm transition-all active:scale-95 bg-white border-2 border-[#628ECB]/30 text-[#395886] hover:bg-[#EEF4FF] hover:border-[#628ECB]/50"
            >
              <RotateCcw className="w-4 h-4" />
              Ulangi Animasi
              {replayCount > 0 && (
                <span className="ml-1 text-[10px] font-black text-[#628ECB] bg-[#628ECB]/10 px-2 py-0.5 rounded-full">
                  {replayCount}×
                </span>
              )}
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

// -- Phase 1: Concept -----------------------------------------------------------

function ConceptPhase({
  lessonId, title, concept, layers, isEncapsulation, onNext,
}: {
  lessonId: string; title: string; concept: string; layers: any[]; isEncapsulation: boolean; onNext: () => void;
}) {
  const isTcpHandshakeModule = lessonId === '2' && isEncapsulation;
  const isTcpFlowModule = lessonId === '2' && !isEncapsulation;

  return (
    <div className={`space-y-6 ${anim.fadeUp}`}>
      <ActivityCard
        icon={<GraduationCap className="w-5 h-5 text-[#10B981]" />}
        label="Konsep Inti"
        title={title}
        headerBg="bg-[#10B981]/5"
        headerBorder="border-[#10B981]/20"
        iconBg="bg-[#10B981]/10"
        labelCls="text-[#10B981]"
      >
        <div className="space-y-6">
          <p className="text-sm font-medium text-[#395886]/80 leading-relaxed">
            {concept}
          </p>

          {/* Lesson 2 Module 1: Three-Way Handshake reference steps */}
          {isTcpHandshakeModule && (
            <>
              <SectionDivider label="Alur Three-Way Handshake" icon={<Network className="w-3 h-3" />} />
              <div className="flex flex-col gap-2">
                {[
                  { step: 1, label: 'Client → SYN', color: '#628ECB', detail: 'SYN=1, Seq=1000 | Status: CLOSED → SYN_SENT' },
                  { step: 2, label: 'Server → SYN-ACK', color: '#8B5CF6', detail: 'SYN=1, ACK=1, Seq=5000, Ack=1001 | Status: SYN_RECEIVED' },
                  { step: 3, label: 'Client → ACK', color: '#10B981', detail: 'ACK=1, Seq=1001, Ack=5001 | Status: ESTABLISHED' },
                ].map(s => (
                  <div key={s.step} className="flex items-center gap-3 p-3 rounded-xl bg-white border-2 border-[#D5DEEF]">
                    <div className="h-8 w-8 shrink-0 rounded-xl flex items-center justify-center text-white text-xs font-black"
                      style={{ backgroundColor: s.color }}>
                      {s.step}
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#395886]">{s.label}</p>
                      <p className="text-[10px] text-[#395886]/50 font-medium">{s.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <InstructionBox accent="text-[#628ECB]">
                Gunakan pemahaman alur Three-Way Handshake di atas untuk menganalisis studi kasus berikut bersama kelompok.
              </InstructionBox>
            </>
          )}

          {/* Lesson 2 Module 2: Flow Control reference */}
          {isTcpFlowModule && (
            <>
              <SectionDivider label="Mekanisme Flow Control" icon={<Zap className="w-3 h-3" />} />
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Window Size = 65535', desc: 'Buffer penerima kosong — dapat menerima data penuh.', color: '#10B981' },
                  { label: 'Window Size = 8192', desc: 'Buffer mulai terisi — pengirim harus mulai melambat.', color: '#F59E0B' },
                  { label: 'Window Size ≈ 0', desc: 'Buffer penuh — pengirim harus berhenti mengirim (pause).', color: '#EF4444' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white border-2 border-[#D5DEEF]">
                    <div className="h-8 w-8 shrink-0 rounded-xl flex items-center justify-center text-white text-[9px] font-black"
                      style={{ backgroundColor: row.color }}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#395886]">{row.label}</p>
                      <p className="text-[10px] text-[#395886]/50 font-medium">{row.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <InstructionBox accent="text-[#628ECB]">
                Window Size mencerminkan ruang kosong di buffer penerima. Gunakan pemahaman ini untuk menganalisis studi kasus berikut.
              </InstructionBox>
            </>
          )}

          {/* Lesson 1 (generic): TCP/IP Layer list */}
          {lessonId !== '2' && (
            <>
              <SectionDivider label="Struktur Lapisan" icon={<Database className="w-3 h-3" />} />
              <div className="flex flex-col gap-2 max-w-sm mx-auto w-full">
                {layers.map((layer, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl border-2 border-[#D5DEEF] bg-[#F8FAFD] hover:border-[#628ECB]/30 transition-all">
                    <div className="h-8 w-8 rounded-xl bg-[#395886] text-white flex items-center justify-center font-black text-xs shadow-sm">
                      {isEncapsulation ? idx + 1 : layers.length - idx}
                    </div>
                    <span className="text-sm font-bold text-[#395886]">{layer.name || layer}</span>
                  </div>
                ))}
              </div>
              <InstructionBox accent="text-[#10B981]">
                Data akan diproses secara berurutan {isEncapsulation ? 'dari atas ke bawah (Enkapsulasi)' : 'dari bawah ke atas (Dekapsulasi)'}.
              </InstructionBox>
            </>
          )}
        </div>
      </ActivityCard>

      <button onClick={onNext} className="w-full py-3.5 rounded-lg bg-[#395886] text-white font-black text-sm hover:bg-[#2A4468] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 group">
        Mulai Analisis Skenario <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

// -- Phase 2: Case Study + Argument Input --------------------------------------

function CasePhase({ study, isSubmitted, submitError, onNext }: { study: CaseStudy; isSubmitted?: boolean; submitError?: string | null; onNext: (choiceId: string, choiceText: string, argument: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [argument, setArgument] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const wordCount = argument.trim() ? argument.trim().split(/\s+/).length : 0;
  const ready = selected && wordCount >= 20;

  return (
    <div className={`space-y-6 ${anim.zoomIn}`}>
      <ActivityCard
        icon={<FileSearch className="w-5 h-5 text-[#F59E0B]" />}
        label="Misi Analisis"
        title={study.title}
        headerBg="bg-[#F59E0B]/5"
        headerBorder="border-[#F59E0B]/20"
        iconBg="bg-[#F59E0B]/10"
        labelCls="text-[#F59E0B]"
      >
        <div className="space-y-6">
          <InstructionBox accent="text-[#F59E0B]">
            <span className="italic">"{study.scenario || study.description}"</span>
          </InstructionBox>

          <p className="text-sm font-bold text-[#395886] px-1">{study.question}</p>

          <div className="grid gap-3">
            {study.options.map(opt => (
              <button
                key={opt.id}
                disabled={isSubmitted}
                onClick={() => setSelected(opt.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${selected === opt.id ? 'border-[#F59E0B] bg-[#FFFBEB] shadow-sm scale-[1.01]' : 'border-[#D5DEEF] bg-white hover:border-[#F59E0B]/30'} ${isSubmitted && selected !== opt.id ? 'opacity-50' : ''}`}
              >
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${selected === opt.id ? 'border-[#F59E0B]' : 'border-[#D5DEEF]'}`}>
                  {selected === opt.id && <div className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />}
                </div>
                <span className={`text-xs font-bold ${selected === opt.id ? 'text-[#395886]' : 'text-[#395886]/60'}`}>{opt.text}</span>
              </button>
            ))}
          </div>

          {/* Argument box: only visible after student actively selects an option */}
          {selected !== null && (
            <div className={`space-y-3 p-5 rounded-2xl bg-[#F8FAFD] border-2 border-[#D5DEEF]/60 ${anim.fadeUp}`}>
              <div className="flex items-center gap-2">
                <PenLine className="w-4 h-4 text-[#395886]/60" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/60">Argumen Logismu</p>
              </div>
              <textarea
                value={argument}
                readOnly={isSubmitted}
                onChange={e => !isSubmitted && setArgument(e.target.value)}
                rows={3}
                className={`w-full p-4 border-2 border-[#D5DEEF] rounded-xl text-sm text-[#395886] focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/5 outline-none transition-all resize-none ${isSubmitted ? 'bg-[#F1F5F9] border-dashed cursor-not-allowed' : 'bg-white'}`}
                placeholder={study.argumentPrompt ?? 'Jelaskan alasan teknismu di sini...'}
              />
              <div className="flex justify-between items-center">
                {isSubmitted ? (
                  <div className="flex items-center gap-1.5 text-[#10B981] font-black text-[10px] uppercase">
                    <CheckCircle className="w-3.5 h-3.5" /> Argumen Berhasil Dikirim ke Kelompok
                  </div>
                ) : (
                  <>
                    <p className={`text-[10px] font-bold ${wordCount >= 20 ? 'text-[#10B981]' : 'text-[#395886]/30'}`}>
                      {wordCount} / 20 Kata Minimal
                    </p>
                    {wordCount > 0 && wordCount < 20 && (
                      <p className="text-[10px] text-amber-600 font-medium mt-1">Argumen minimal 20 kata ya! Baru {20 - wordCount} kata lagi.</p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Status when student already submitted (returning session) but hasn't re-selected */}
          {isSubmitted && selected === null && (
            <div className={`p-4 rounded-xl bg-[#10B981]/10 border-2 border-[#10B981]/20 flex items-center gap-3 ${anim.fadeUp}`}>
              <CheckCircle className="w-5 h-5 text-[#10B981] shrink-0" />
              <p className="text-sm font-bold text-[#065F46]">Argumenmu sudah terkirim ke kelompok. Menunggu anggota lain menyelesaikan pengiriman...</p>
            </div>
          )}

          {/* Error Banner */}
          {submitError && (
            <div className={`p-4 rounded-xl border-2 border-red-200 bg-red-50 flex items-start gap-3 ${anim.fadeUp}`}>
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-800 leading-relaxed">{submitError}</p>
                <p className="text-[10px] font-medium text-red-600/60 mt-1">Silakan coba kembali atau hubungi guru jika masalah berlanjut.</p>
              </div>
            </div>
          )}
        </div>
      </ActivityCard>

      {!isSubmitted ? (
        <button
          onClick={async () => {
            if (ready) {
              setIsSubmitting(true);
              const choiceText = study.options.find(o => o.id === selected)!.text;
              await onNext(selected, choiceText, argument.trim());
              setIsSubmitting(false);
            }
          }}
          disabled={!ready || isSubmitting}
          className={`w-full py-5 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2
            ${ready ? 'bg-[#395886] text-white hover:bg-[#2A4468]' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'}`}
        >
          {isSubmitting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
          {isSubmitting ? 'Mengirim...' : 'Submit Argumen ke Kelompok'}
        </button>
      ) : (
        <div className={`p-4 rounded-2xl bg-[#10B981]/10 border-2 border-[#10B981]/20 flex items-center justify-center gap-3 ${anim.fadeUp}`}>
           <Sparkles className="w-5 h-5 text-[#10B981]" />
           <p className="text-sm font-black text-[#065F46] uppercase tracking-tight">Menuju Papan Diskusi...</p>
        </div>
      )}
    </div>
  );
}

// -- Phase 3: Group Discussion & Voting -----------------------------------------

function DiscussionPhase({
  lessonId, moduleId, groupName, onNext,
}: {
  lessonId: string; moduleId: string; groupName: string; onNext: () => void;
}) {
  const user = getCurrentUser();
  const [discussions, setDiscussions] = useState<GroupDiscussion[]>([]);
  const [members, setMembers] = useState<{ user_id: string; user_name: string }[]>([]);
  
  const submissions = useMemo(() => discussions.map(d => d.user_id), [discussions]);
  const missingMembers = useMemo(() => 
    members.filter(m => !submissions.includes(m.user_id)).map(m => m.user_name),
    [members, submissions]
  );
  const allSubmitted = members.length > 0 && missingMembers.length === 0;

  // Fungsi fetch yang dipakai baik oleh subscription maupun polling
  const fetchData = useCallback(async () => {
    const [d, m] = await Promise.all([
      getGroupDiscussions(lessonId, moduleId, groupName),
      getGroupMembers(groupName)
    ]);
    setDiscussions(d);
    setMembers(m);
  }, [lessonId, moduleId, groupName]);

  // 1. Supabase REAL-TIME subscription (langsung refresh saat ada insert/update/delete)
  useEffect(() => {
    void fetchData();

    const channel = supabase
      .channel(`discussion-${lessonId}-${moduleId}-${groupName}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_discussions',
          filter: `lesson_id=eq.${lessonId}&module_id=eq.${moduleId}&group_name=eq.${groupName}`,
        },
        () => {
          // Re-fetch seluruh diskusi saat ada perubahan
          void fetchData();
        }
      )
      .subscribe();

    // 2. Polling fallback setiap 5 detik (jika real-time terblokir)
    const interval = setInterval(() => {
      void fetchData();
    }, 5000);

    return () => {
      void supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [lessonId, moduleId, groupName, fetchData]);

  const handleVote = async (discId: string) => {
    if (!allSubmitted) return;
    await toggleGroupDiscussionVote(discId, user!.id);
    await fetchData();
  };

  return (
    <div className={`space-y-6 ${anim.fadeUp}`}>
      <ActivityCard
        icon={<MessageSquare className="w-5 h-5 text-[#10B981]" />}
        label="Kolaborasi Kelompok"
        title={`Papan Diskusi — ${groupName}`}
        headerBg="bg-[#10B981]/5"
        headerBorder="border-[#10B981]/20"
        iconBg="bg-[#10B981]/10"
        labelCls="text-[#10B981]"
      >
        <div className="space-y-6">
          {/* Status Bar Anggota */}
          <GroupMembersList members={members} submissions={submissions} />

          {/* Indikator Menunggu per Anggota */}
          {!allSubmitted && members.length > 0 && (
            <div className="grid gap-2">
              {members.map(m => {
                const hasSubmitted = submissions.includes(m.user_id);
                if (hasSubmitted) return null;
                const isOwn = m.user_id === user!.id;
                return (
                  <div key={m.user_id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed transition-all ${
                    isOwn ? 'border-[#F59E0B]/40 bg-[#FFFBEB]' : 'border-[#D5DEEF] bg-[#F8FAFD]'
                  }`}>
                    <Clock className={`w-4 h-4 ${isOwn ? 'text-[#F59E0B]' : 'text-[#395886]/30'} animate-pulse`} />
                    <span className={`text-xs font-bold ${isOwn ? 'text-[#F59E0B]' : 'text-[#395886]/40'}`}>
                      Menunggu <span className="font-black">{m.user_name}</span>...
                      {isOwn && <span className="ml-1 text-[10px] font-bold text-[#F59E0B]/60">(kamu belum submit)</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <SectionDivider label="Papan Diskusi" icon={<MessageSquare className="w-3 h-3" />} />

          {/* Status Header */}
          <div className="flex items-center justify-center mb-4">
             {!allSubmitted ? (
               <div className="px-5 py-2.5 rounded-2xl bg-amber-50 text-amber-600 text-[10px] font-black uppercase border border-amber-100 flex flex-col items-center gap-2 text-center">
                 <div className="flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" /> 
                    <span>Menunggu Argumen Anggota...</span>
                 </div>
                 <p className="text-[9px] lowercase font-bold text-amber-500/80">
                   {missingMembers.length > 0 
                     ? `Belum mengirim: ${missingMembers.join(', ')}` 
                     : 'Memuat data anggota...'}
                 </p>
               </div>
             ) : (
               <div className="px-4 py-1.5 rounded-full bg-[#10B981]/10 text-[#10B981] text-[10px] font-black uppercase border border-[#10B981]/20 flex items-center gap-2">
                 <CheckCircle className="w-3.5 h-3.5" /> Semua Anggota Sudah Submit — Voting Dibuka
               </div>
             )}
          </div>
          
          {/* Papan Argumen — Card per anggota */}
          <div className="grid gap-4">
            {discussions.map(disc => {
              const isOwn = disc.user_id === user!.id;
              return (
                <div key={disc.id} className={`p-5 rounded-2xl border-2 transition-all duration-500 ${
                  isOwn 
                    ? 'border-[#10B981]/60 bg-[#F0FDF4] shadow-md shadow-[#10B981]/5' 
                    : 'border-[#D5DEEF] bg-white hover:border-[#10B981]/20'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                       <div className={`w-9 h-9 rounded-xl ${
                         isOwn ? 'bg-[#10B981]' : 'bg-[#395886]'
                       } text-white flex items-center justify-center text-[10px] font-black shadow-sm`}>
                         {disc.user_name.substring(0, 2).toUpperCase()}
                       </div>
                       <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-black text-[#395886]">{disc.user_name}</p>
                            {isOwn && (
                              <span className="text-[9px] font-black bg-[#10B981] text-white px-2 py-0.5 rounded-full uppercase">Anda</span>
                            )}
                          </div>
                          <p className="text-[10px] font-bold text-[#395886]/40 uppercase tracking-tight">Memilih: {disc.choice_text}</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => handleVote(disc.id)} 
                      disabled={!allSubmitted}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 transition-all active:scale-90 ${
                        disc.votes.includes(user!.id) 
                          ? 'bg-[#10B981] text-white border-[#10B981] shadow-md shadow-[#10B981]/20' 
                          : 'bg-white text-[#395886]/40 border-[#D5DEEF] hover:border-[#10B981]/50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                       <ThumbsUp className={`w-3.5 h-3.5 ${disc.votes.includes(user!.id) ? 'fill-current' : ''}`} />
                       <span className="text-[10px] font-black">{disc.votes.length} Vote</span>
                    </button>
                  </div>
                  <p className="text-sm font-medium text-[#395886]/80 leading-relaxed italic bg-white/60 p-3 rounded-lg border border-current/5">
                    "{disc.argument}"
                  </p>
                </div>
              );
            })}
            {discussions.length === 0 && (
              <div className="py-16 text-center bg-[#F8FAFD] rounded-2xl border-2 border-dashed border-[#D5DEEF] text-[10px] font-black text-[#395886]/30 uppercase tracking-widest">
                Belum ada argumen masuk...
              </div>
            )}
          </div>
        </div>
      </ActivityCard>
      
      {allSubmitted && (
        <button onClick={onNext} className={`w-full py-5 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 group ${anim.zoomIn} bg-[#395886] text-white hover:bg-[#2A4468]`}>
          Lihat Hasil Keputusan <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  );
}

// -- Phase 4: Activity Result (with Tie-Breaker) ------------------------------

function ResultPhase({ moduleId, discussions, onDone }: { moduleId: string; discussions: GroupDiscussion[]; onDone: () => void }) {
  const user = getCurrentUser();
  const sorted = [...discussions].sort((a, b) => b.votes.length - a.votes.length);
  const topVoteCount = sorted[0]?.votes.length ?? 0;
  const topArgs = sorted.filter(d => d.votes.length === topVoteCount && d.votes.length > 0);
  const isTie = topArgs.length > 1;

  if (sorted.length === 0) return null;

  const [tieBroken, setTieBroken] = useState(false);
  const [selectedTieBreaker, setSelectedTieBreaker] = useState<string | null>(null);

  // Tie-breaker: pick earliest submitted among tied
  const handleTieBreak = () => {
    const earliest = [...topArgs].sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    setSelectedTieBreaker(earliest[0].id);
    setTieBroken(true);
  };

  const displayedArgs = isTie && !tieBroken ? topArgs : isTie && tieBroken
    ? [topArgs.find(a => a.id === selectedTieBreaker)!]
    : [sorted[0]];

  return (
    <div className={`space-y-6 ${anim.zoomIn}`}>
      <ActivityCard
        icon={<Award className="w-5 h-5 text-[#F59E0B]" />}
        label="Keputusan Akhir"
        title={`Argumen Terbaik — ${moduleId}`}
        headerBg="bg-[#F59E0B]/5"
        headerBorder="border-[#F59E0B]/20"
        iconBg="bg-[#F59E0B]/10"
        labelCls="text-[#F59E0B]"
      >
        <div className="space-y-6">
          {isTie && !tieBroken ? (
            /* ── TIE STATE ── */
            <>
              <InstructionBox accent="text-[#F59E0B]">
                <span className="font-black text-[#F59E0B]">⚠ Hasil Voting Setara!</span> Beberapa argumen memiliki jumlah vote yang sama. Pilih mekanisme tie-breaker untuk menentukan argumen utama.
              </InstructionBox>

              <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-200 space-y-2 text-center">
                <div className="flex items-center justify-center gap-2 text-amber-700">
                  <ArrowUpDown className="w-5 h-5" />
                  <span className="text-sm font-black uppercase">Hasil Setara — {topArgs.length} Argumen Co-Top ({topVoteCount} Vote)</span>
                </div>
                <p className="text-xs text-amber-600/70">Perlu diskusi lanjutan atau gunakan tie-breaker di bawah.</p>
              </div>

              {/* Show all tied arguments side by side */}
              <div className="grid gap-3">
                {topArgs.map((disc, idx) => (
                  <div key={disc.id} className="p-4 rounded-xl border-2 border-[#F59E0B]/30 bg-[#FFFBEB] shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-black text-white shadow-md bg-[#F59E0B]">
                        {disc.user_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#395886]">{disc.user_name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <ThumbsUp className="w-3 h-3 text-[#F59E0B]" />
                          <span className="text-[10px] font-black uppercase text-[#F59E0B]">{disc.votes.length} Suara</span>
                          <span className="text-[9px] font-bold text-[#395886]/30 ml-1">#{idx + 1} Co-Top</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-[#395886] leading-relaxed italic">"{disc.argument}"</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFD] border-2 border-dashed border-[#D5DEEF] space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/50 text-center">Mekanisme Tie-Breaker</p>
                <button
                  onClick={handleTieBreak}
                  className="w-full py-3 rounded-xl bg-[#395886] text-white font-bold text-sm hover:bg-[#2A4468] transition-all flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" /> Gunakan Urutan Submit Tercepat
                </button>
                <p className="text-[10px] text-[#395886]/30 text-center">Argumen yang dikirim paling awal akan dipilih sebagai pemenang.</p>
              </div>
            </>
          ) : (
            /* ── RESOLVED STATE (single winner or tie broken) ── */
            <>
              {isTie && tieBroken && (
                <div className="p-3 rounded-xl bg-[#10B981]/8 border border-[#10B981]/20 flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-[#10B981]" />
                  <span className="text-xs font-bold text-[#065F46]">Tie-breaker diterapkan: argumen tercepat dipilih</span>
                </div>
              )}

              {displayedArgs.map((bestArgument) => (
                <div key={bestArgument.id} className="p-5 rounded-lg border-2 border-[#F59E0B] bg-[#FFFBEB] shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Award className="w-20 h-20 text-[#F59E0B]" /></div>
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-black text-white shadow-md bg-[#F59E0B]">
                      {bestArgument.user_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#395886]">{bestArgument.user_name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <ThumbsUp className="w-3 h-3 text-[#F59E0B]" />
                        <span className="text-[10px] font-black uppercase text-[#F59E0B]">{bestArgument.votes.length} Suara Kelompok</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-[#395886] leading-relaxed relative z-10 italic">
                    "{bestArgument.argument}"
                  </p>
                </div>
              ))}
            </>
          )}

          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F0FDF4] border border-[#10B981]/20">
            <CheckCircle className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
            <p className="text-xs font-bold text-[#065F46]/80 leading-relaxed">
              Argumen ini akan menjadi dasar pemahamanmu untuk aktivitas selanjutnya.
            </p>
          </div>
        </div>
      </ActivityCard>

      <button
        onClick={onDone}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-[#395886] text-white font-black text-sm hover:bg-[#2A4468] shadow-md transition-all active:scale-95 group"
      >
        Lanjutkan Aktivitas <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

// -- Generic Module Flow Component ----------------------------------------------

function ModuleFlow({
  lessonId, moduleId, groupName, title, concept, layers, study, isEncapsulation, onModuleDone
}: {
  lessonId: string; moduleId: string; groupName: string; title: string; concept: string; layers: any[]; study: CaseStudy; isEncapsulation: boolean; onModuleDone: (data: any) => void
}) {
  const [phase, setPhase] = useState<'concept' | 'case' | 'discussion' | 'result'>('concept');
  const [discussions, setDiscussions] = useState<GroupDiscussion[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const user = getCurrentUser();

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleCaseSubmit = async (choiceId: string, choiceText: string, argument: string) => {
    setSubmitError(null);
    try {
      await upsertGroupDiscussion({
        lesson_id: lessonId,
        module_id: moduleId,
        group_name: groupName,
        user_id: user!.id,
        user_name: user!.name,
        argument: argument,
        choice_id: choiceId,
        choice_text: choiceText,
      });
      setIsSubmitted(true);
      // Berikan jeda agar siswa bisa melihat status "Berhasil Terkirim"
      setTimeout(() => {
        setPhase('discussion');
      }, 2000);
    } catch (err: any) {
      const msg = err?.message || 'Gagal menyimpan argumen. Silakan coba lagi.';
      setSubmitError(msg);
      console.error('Failed to submit argument:', err);
    }
  };

  const finalizeModule = async () => {
    const data = await getGroupDiscussions(lessonId, moduleId, groupName);
    setDiscussions(data);
    setPhase('result');
  };

  const handleResultDone = () => {
    const sorted = [...discussions].sort((a, b) => b.votes.length - a.votes.length);
    onModuleDone({ bestArgument: sorted[0], discussions });
  };

  const steps = ['Konsep', 'Kasus', 'Diskusi', 'Hasil'];
  const currentStep = phase === 'concept' ? 0 : phase === 'case' ? 1 : phase === 'discussion' ? 2 : 3;

  return (
    <div className="w-full space-y-6">
      <StepTracker steps={steps} current={currentStep} />
      {phase === 'concept' && <ConceptPhase lessonId={lessonId} title={title} concept={concept} layers={layers} isEncapsulation={isEncapsulation} onNext={() => setPhase('case')} />}
      {phase === 'case' && <CasePhase study={study} isSubmitted={isSubmitted} submitError={submitError} onNext={handleCaseSubmit} />}
      {phase === 'discussion' && <DiscussionPhase lessonId={lessonId} moduleId={moduleId} groupName={groupName} onNext={finalizeModule} />}
      {phase === 'result' && <ResultPhase moduleId={moduleId} discussions={discussions} onDone={handleResultDone} />}
    </div>
  );
}

// -- Overall Group Result -------------------------------------------------------

function OverallGroupResult({ lessonId, module1Data, module2Data, groupName, onNext }: { lessonId: string; module1Data: any; module2Data: any; groupName: string; onNext: () => void }) {
  const isLesson2 = lessonId === '2';
  return (
    <div className={`space-y-6 ${anim.zoomIn} w-full`}>
      <ActivityCard
        icon={<Users className="w-5 h-5 text-[#628ECB]" />}
        label="Hasil Kolaborasi"
        title="Ringkasan Kesepakatan Kelompok"
        headerBg="bg-[#628ECB]/5"
        headerBorder="border-[#628ECB]/20"
        iconBg="bg-[#628ECB]/10"
        labelCls="text-[#628ECB]"
      >
        <div className="space-y-8 text-center">
          <p className="text-sm font-bold text-[#395886]/60 leading-relaxed px-4">
            Berikut adalah poin-poin kesepakatan terbaik kelompok <span className="text-[#628ECB] font-black">{groupName}</span> untuk setiap aktivitas.
          </p>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="p-5 rounded-2xl border-2 border-[#10B981]/20 bg-[#F0FDF4]/30 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <p className="text-[10px] font-black text-[#10B981] uppercase tracking-widest">
                  {isLesson2 ? 'Studi Kasus 1: TCP Handshake' : 'Enkapsulasi (X.TCP.6)'}
                </p>
              </div>
              <p className="text-xs font-bold text-[#395886]/80 leading-relaxed italic bg-white/80 p-3.5 rounded-xl border border-[#10B981]/10">
                "{module1Data?.bestArgument?.argument || 'Hasil belum tersedia'}"
              </p>
            </div>
            <div className="p-5 rounded-2xl border-2 border-[#628ECB]/20 bg-[#EEF4FF]/30 space-y-3">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-[#628ECB]" />
                <p className="text-[10px] font-black text-[#628ECB] uppercase tracking-widest">
                  {isLesson2 ? 'Studi Kasus 2: Flow Control' : 'Dekapsulasi (X.TCP.7)'}
                </p>
              </div>
              <p className="text-xs font-bold text-[#395886]/80 leading-relaxed italic bg-white/80 p-3.5 rounded-xl border border-[#628ECB]/10">
                "{module2Data?.bestArgument?.argument || 'Hasil belum tersedia'}"
              </p>
            </div>
          </div>

          <button onClick={onNext} className="w-full py-3.5 rounded-lg bg-[#395886] text-white font-black text-sm shadow-md active:scale-95 transition-all hover:bg-[#2A4468] flex items-center justify-center gap-2 group">
            Lanjut ke Kesimpulan Individu <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </ActivityCard>
    </div>
  );
}

// -- Main LearningCommunityStage ------------------------------------------------

export function LearningCommunityStage({
  lessonId, stageIndex, moduleId, groupName, onComplete, isCompleted,
  layers5 = [], encapsulationCase, decapsulationCase, timelineFlowchart, onTrackerPhase, atpBehavior
}: LearningCommunityStageProps) {
  const tracker = useActivityTracker({
    lessonId,
    stageIndex,
    stageType: 'learning-community',
  });

  const isLesson2WithFlowchart = lessonId === '2' && !!timelineFlowchart;
  const [subStage, setSubPhase] = useState<'simulasi' | 'keruntutan_berpikir' | 'x_tcp_6' | 'x_tcp_7' | 'group_result' | 'individual_summary'>(isCompleted ? 'individual_summary' : 'simulasi');
  const [understood, setUnderstood] = useState(false);
  const [flowchartCompleted, setFlowchartCompleted] = useState(false);
  const [module1Data, setModule1Data] = useState<any>(null);
  const [module2Data, setModule2Data] = useState<any>(null);
  const [members, setMembers] = useState<{ user_id: string; user_name: string }[]>([]);

  useEffect(() => {
    if (groupName) {
      getGroupMembers(groupName).then(setMembers);
    }
  }, [groupName]);

  useEffect(() => {
    const progressMap: Record<string, number> = {
      simulasi: 10, keruntutan_berpikir: 30, x_tcp_6: 55, x_tcp_7: 70, group_result: 85, individual_summary: 95,
    };
    void tracker.saveSnapshot(
      { subStage, understood, flowchartCompleted, module1Data, module2Data },
      { progressPercent: progressMap[subStage] || 10 },
    );
  }, [subStage, understood, flowchartCompleted, module1Data, module2Data, tracker]);

  useEffect(() => {
    let phase: 'consistency' | 'arguing' | 'conclusion' = 'consistency';
    if (subStage === 'x_tcp_6' || subStage === 'x_tcp_7' || subStage === 'group_result') phase = 'arguing';
    else if (subStage === 'individual_summary') phase = 'conclusion';
    onTrackerPhase?.(phase);
  }, [subStage, onTrackerPhase]);

  if (!groupName) return (
    <div className="w-full py-12 text-center bg-white rounded-lg border-2 border-dashed border-[#D5DEEF] shadow-inner">
       <div className="h-16 w-16 mx-auto mb-6 text-[#D5DEEF]"><Users className="w-full h-full" /></div>
       <h4 className="text-xl font-black text-[#395886] mb-2 uppercase tracking-tight">Kelompok Belum Terdeteksi</h4>
       <p className="text-sm font-bold text-[#395886]/40 italic max-w-sm mx-auto leading-relaxed">
         Pilih kelompokmu di <span className="text-[#628ECB] not-italic font-black">Dashboard</span> untuk memulai simulasi kolaborasi ini.
       </p>
    </div>
  );

  const isLesson2 = lessonId === '2';

  if (subStage === 'simulasi') return (
    <div className={`w-full space-y-6 ${anim.fadeUp}`}>
       <div className="bg-white rounded-2xl border-2 border-[#628ECB]/20 p-5 shadow-sm overflow-hidden">
          <div className="flex items-center gap-4 mb-6 text-left border-b border-[#D5DEEF]/60 pb-5">
             <div className="h-12 w-12 rounded-xl bg-[#628ECB]/10 text-[#628ECB] flex items-center justify-center shadow-sm">
               {isLesson2 ? <Network className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]">Tahap Simulasi — Fondasi Diskusi</p>
                <h2 className="text-base font-black text-[#395886]">
                  {isLesson2 ? 'Animasi Three-Way Handshake TCP' : 'Visualisasi Interaktif Enkapsulasi & Dekapsulasi'}
                </h2>
                {isLesson2 && (
                  <p className="text-xs text-[#395886]/60 mt-0.5">Pahami alur SYN → SYN-ACK → ACK sebelum menganalisis studi kasus bersama kelompok.</p>
                )}
             </div>
          </div>

          {isLesson2 ? <TwhAnimationSection /> : <TcpIpInteractive />}

          <div className={`mt-6 p-4 rounded-xl border-2 transition-all text-left flex items-start gap-3 ${understood ? 'border-[#10B981] bg-[#F0FDF4]/50' : 'border-[#D5DEEF] bg-[#F8FAFD]'}`}>
             <button onClick={() => setUnderstood(!understood)} className={`mt-1 h-6 w-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${understood ? 'bg-[#10B981] border-[#10B981]' : 'bg-white border-[#D5DEEF]'}`}>
                {understood && <CheckCircle className="w-4 h-4 text-white" />}
             </button>
             <label className="text-sm font-bold text-[#395886] leading-relaxed cursor-pointer select-none">
                {isLesson2
                  ? <>Saya sudah memahami alur <strong>Three-Way Handshake</strong> (SYN → SYN-ACK → ACK) dan siap menganalisis studi kasus bersama kelompok <span className="text-[#628ECB] font-black">{groupName}</span>.</>
                  : <>Saya sudah memahami proses Enkapsulasi & Dekapsulasi melalui simulasi di atas dan siap menganalisis skenario bersama kelompok <span className="text-[#628ECB] font-black">{groupName}</span>.</>
                }
             </label>
          </div>

          <button
            onClick={() => isLesson2WithFlowchart ? setSubPhase('keruntutan_berpikir') : setSubPhase('x_tcp_6')}
            disabled={!understood}
            className={`w-full mt-5 py-3.5 rounded-xl font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2
              ${understood ? 'bg-[#395886] text-white hover:bg-[#2A4468]' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'}`}
          >
             {isLesson2WithFlowchart ? 'Mulai Aktivitas Keruntutan Berpikir' : 'Mulai Aktivitas Kelompok'} <ChevronRight className="w-5 h-5" />
          </button>
       </div>
    </div>
  );

  if (subStage === 'keruntutan_berpikir') return (
    <div className={`w-full space-y-6 ${anim.fadeUp}`}>
      <div className="bg-white rounded-2xl border-2 border-[#8B5CF6]/20 p-5 shadow-sm overflow-hidden">
        <div className="flex items-center gap-4 mb-5 text-left border-b border-[#D5DEEF]/60 pb-5">
          <div className="h-12 w-12 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center shadow-sm">
            <Shuffle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#8B5CF6]">Keruntutan Berpikir</p>
            <h2 className="text-base font-black text-[#395886]">Protokol Kronologis: Amankan Jalur Koneksi</h2>
            <p className="text-xs text-[#395886]/60 mt-0.5">Susun blok proses TCP Three-Way Handshake secara berurutan sebelum masuk ke diskusi kelompok.</p>
          </div>
        </div>

        {timelineFlowchart && (
          <TimelineFlowchartSection
            data={timelineFlowchart}
            onSuccess={() => {
              setFlowchartCompleted(true);
              // Brief delay so student can see the success state
              setTimeout(() => setSubPhase('x_tcp_6'), 1500);
            }}
          />
        )}
      </div>
    </div>
  );

  if (subStage === 'x_tcp_6') return (
    <div className={`w-full space-y-6 ${anim.fadeUp}`}>
      <ModuleFlow
        key="x_tcp_6"
        lessonId={lessonId}
        moduleId={encapsulationCase?.id || 'X.TCP.6'}
        groupName={groupName}
        title={isLesson2WithFlowchart ? (encapsulationCase?.title || 'Studi Kasus Three-Way Handshake') : (encapsulationCase?.title || 'Aktivitas Enkapsulasi')}
        concept={encapsulationCase?.concept || 'Enkapsulasi adalah proses pembungkusan data.'}
        layers={layers5}
        study={encapsulationCase!}
        isEncapsulation={true}
        onModuleDone={d => {
          setModule1Data(d);
          if (isLesson2WithFlowchart) {
            setSubPhase('individual_summary');
          } else {
            setSubPhase('x_tcp_7');
          }
        }}
      />
    </div>
  );

  if (subStage === 'x_tcp_7') return (
    <ModuleFlow
      key="x_tcp_7"
      lessonId={lessonId}
      moduleId={decapsulationCase?.id || 'X.TCP.7'}
      groupName={groupName}
      title={decapsulationCase?.title || 'Aktivitas Dekapsulasi'}
      concept={decapsulationCase?.concept || 'Dekapsulasi adalah proses pembukaan data.'}
      layers={isLesson2 ? layers5 : [...layers5].reverse()}
      study={decapsulationCase!}
      isEncapsulation={false}
      onModuleDone={d => { setModule2Data(d); setSubPhase('group_result'); }}
    />
  );

  if (subStage === 'group_result') return (
    <OverallGroupResult
      lessonId={lessonId}
      module1Data={module1Data}
      module2Data={module2Data}
      groupName={groupName}
      onNext={() => setSubPhase('individual_summary')}
    />
  );

  if (subStage === 'individual_summary') return (
    <div className={`w-full space-y-6 ${anim.fadeUp}`}>
      <ATPConclusionBox
        atpBehavior={
          atpBehavior ||
          (isLesson2WithFlowchart
            ? 'mampu menerapkan proses TCP Three-Way Handshake untuk menentukan nilai SYN, SYN-ACK, dan ACK pada setiap langkah pembentukan koneksi'
            : isLesson2
              ? 'mampu menganalisis mekanisme TCP Three-Way Handshake dan Flow Control dalam proses komunikasi jaringan'
              : 'mampu menganalisis proses enkapsulasi dan dekapsulasi data dalam komunikasi jaringan komputer')
        }
        objectiveCode={moduleId}
        stageType="learning-community"
        onSubmit={essay => {
          const finalAnswer = { module1Data, module2Data, flowchartCompleted, finalConclusion: essay };
          void tracker.complete(finalAnswer, { finalAnswer });
          onComplete(finalAnswer);
        }}
      />
    </div>
  );

  return null;
}
