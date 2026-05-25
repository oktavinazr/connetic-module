import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag, useDrop } from 'react-dnd';
import {
  CheckCircle, ArrowRight, BookOpen, Lightbulb, ChevronRight,
  AlertCircle, MessageSquare, Activity, GripVertical,
  Cable, Wifi, Radio, Lock, PenLine, Server, Monitor,
} from 'lucide-react';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { ContinueActivityButton, ATPConclusionBox, IndicatorSummaryCard } from './StageKit';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ModelingStep {
  id: string;
  type: 'practice' | 'example';
  title: string;
  content: string;
  interactiveAction?: string;
}

interface ModelingStageProps {
  modelingSteps?: ModelingStep[];
  lessonId: string;
  stageIndex: number;
  onComplete: (answer: any) => void;
  title?: string;
  description?: string;
  objectiveCode?: string;
  activityNumber?: number;
  isCompleted?: boolean;
  onTrackerPhase?: (phase: 'consistency' | 'arguing' | 'conclusion') => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TCP_DND_TYPE = 'MODELING_TCP_HEADER';

// Simplified destination options — conceptual, no raw IP addresses
const DEST_OPTIONS = [
  { id: 'self',   label: 'PC A — Pengirim',       sub: 'Itu kamu sendiri!',          icon: '🖥️', correct: false },
  { id: 'target', label: 'PC B — Komputer Tujuan', sub: 'Tujuan pengiriman data',     icon: '💻', correct: true  },
  { id: 'router', label: 'Router Jaringan',         sub: 'Penghubung antar jaringan', icon: '📡', correct: false },
  { id: 'other',  label: 'Komputer Lain',           sub: 'Tidak dikenal sistem',      icon: '❓', correct: false },
] as const;

const STEP_INSTRUCTIONS = [
  {
    layer: 'Application Layer', phase: 'Fase 1 — Enkapsulasi', phaseColor: '#628ECB',
    title: 'Ketik Pesan yang Ingin Dikirim',
    instruction: 'Kamu adalah PC A. Ketik pesan yang ingin dikirim ke PC B. Setelah diketik, pesanmu akan berubah menjadi objek DATA yang siap dibungkus lapisan-lapisan berikutnya.',
  },
  {
    layer: 'Transport Layer', phase: 'Fase 1 — Enkapsulasi', phaseColor: '#8B5CF6',
    title: 'Pasang TCP Header sebagai Pelindung',
    instruction: 'Seret badge "TCP Header" dan jatuhkan ke dalam kotak DATA. TCP bertugas mengatur dan melindungi pengiriman data agar tiba dengan aman dan berurutan.',
  },
  {
    layer: 'Network Layer', phase: 'Fase 1 — Enkapsulasi', phaseColor: '#10B981',
    title: 'Tetapkan Alamat Tujuan Data',
    instruction: 'Data harus tahu harus ke mana. Pilih komputer tujuan yang benar dari daftar. Jika alamat salah, data akan tersesat di jaringan!',
  },
  {
    layer: 'Data Link Layer', phase: 'Fase 1 — Enkapsulasi', phaseColor: '#F59E0B',
    title: 'Bungkus dengan MAC Frame',
    instruction: 'Aktifkan toggle MAC untuk membungkus PACKET menjadi FRAME. Ini adalah lapisan terakhir sebelum data siap dikirim secara fisik melalui kabel.',
  },
  {
    layer: 'Physical Layer', phase: 'Fase 2 — Transmisi', phaseColor: '#EC4899',
    title: 'Cek Jalur Dulu — CSMA/CD',
    instruction: 'Sebelum mengirim, komputer harus memastikan jalur tidak sedang dipakai orang lain. Tekan dan tahan tombol "Listen" sampai indikator berubah hijau!',
  },
  {
    layer: 'Physical Layer', phase: 'Fase 2 — Transmisi', phaseColor: '#EC4899',
    title: 'Kirim Data sebagai Sinyal BIT',
    instruction: 'Jalur kosong! Klik "Kirim" untuk mentransmisikan FRAME sebagai aliran bit (10101...) melalui kabel menuju PC B. Data sedang dalam perjalanan!',
  },
  {
    layer: 'Data Link + Network', phase: 'Fase 3 — Dekapsulasi', phaseColor: '#10B981',
    title: 'PC B Melepas Lapisan Terluar',
    instruction: 'PC B menerima data. Sekarang buka lapisan pembungkus dari luar ke dalam: lepas MAC Frame terlebih dahulu, lalu Alamat Tujuan. Urutan ini harus benar!',
  },
  {
    layer: 'Transport Layer', phase: 'Fase 3 — Dekapsulasi', phaseColor: '#8B5CF6',
    title: 'Buka TCP Header',
    instruction: 'Hampir sampai! SEGMENT ada di tangan PC B. Ketuk dua kali (double-click) pada TCP Header untuk membuka dan mengambil data aslinya.',
  },
  {
    layer: 'Application Layer', phase: 'Fase 3 — Dekapsulasi', phaseColor: '#10B981',
    title: 'Pesan Berhasil Diterima!',
    instruction: 'Proses dekapsulasi selesai! Aplikasi di PC B kini menampilkan pesan aslimu persis seperti yang kamu ketik. Transmisi TCP/IP end-to-end berhasil!',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function TcpDraggable({ isDropped }: { isDropped: boolean }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: TCP_DND_TYPE,
    canDrag: !isDropped,
    collect: (m) => ({ isDragging: m.isDragging() }),
  });
  drag(divRef);

  if (isDropped) return null;
  return (
    <motion.div
      ref={divRef}
      animate={{ opacity: isDragging ? 0.35 : 1, scale: isDragging ? 1.06 : 1 }}
      whileHover={{ scale: 1.04, boxShadow: '0 8px 30px rgba(139,92,246,0.35)' }}
      className="flex items-center gap-2.5 cursor-grab active:cursor-grabbing px-5 py-3.5 rounded-xl bg-[#8B5CF6]/10 border-2 border-dashed border-[#8B5CF6]/50 text-[#8B5CF6] font-bold text-sm select-none shadow-md"
    >
      <GripVertical className="w-4 h-4 opacity-60" />
      TCP Header
    </motion.div>
  );
}

function DataDropZone({ onDrop, isDropped, message }: { onDrop: () => void; isDropped: boolean; message: string }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: TCP_DND_TYPE,
    drop: () => onDrop(),
    collect: (m) => ({ isOver: m.isOver() }),
  });
  drop(divRef);

  return (
    <motion.div
      ref={divRef}
      animate={{
        boxShadow: isOver
          ? '0 0 36px rgba(139,92,246,0.55)'
          : isDropped
          ? '0 0 20px rgba(139,92,246,0.25)'
          : '0 0 0px transparent',
        borderColor: isOver || isDropped ? '#8B5CF6' : '#628ECB',
        scale: isOver ? 1.02 : 1,
      }}
      className={`w-full rounded-xl border-2 p-5 bg-[#628ECB]/5 transition-all ${isOver ? 'ring-2 ring-[#8B5CF6]/30' : ''}`}
    >
      <div className="text-xs font-black uppercase tracking-widest text-[#628ECB] mb-2">DATA</div>
      <div className="text-sm font-semibold text-[#395886]">"{message}"</div>
      {isOver && (
        <div className="mt-2 text-xs font-bold text-[#8B5CF6] animate-pulse">Lepaskan di sini…</div>
      )}
      {!isDropped && !isOver && (
        <div className="mt-2 text-xs text-[#628ECB]/40 font-medium">← area target drop</div>
      )}
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

// ─── ModelingLesson2: Three-Way Handshake Simulation ─────────────────────────

const TWH_STEPS = [
  {
    id: 'syn',
    actor: 'client',
    label: 'Langkah 1: Client → SYN',
    buttonLabel: 'Kirim SYN',
    packetLabel: 'SYN (Seq=1000, Flags=SYN)',
    packetColor: '#628ECB',
    statusAfter: { client: 'SYN_SENT', server: 'LISTEN' },
    detail: 'Client memilih ISN = 1000 secara acak, lalu mengirim paket SYN untuk membuka koneksi. Status Client berubah dari CLOSED → SYN_SENT.',
  },
  {
    id: 'synack',
    actor: 'server',
    label: 'Langkah 2: Server → SYN-ACK',
    buttonLabel: 'Balas SYN-ACK',
    packetLabel: 'SYN-ACK (Seq=5000, Ack=1001)',
    packetColor: '#8B5CF6',
    statusAfter: { client: 'SYN_SENT', server: 'SYN_RECEIVED' },
    detail: 'Server menerima SYN, memilih ISN-nya sendiri = 5000, lalu membalas dengan SYN+ACK. Ack=1001 berarti Server sudah terima byte sampai 1000. Status Server: SYN_RECEIVED.',
  },
  {
    id: 'ack',
    actor: 'client',
    label: 'Langkah 3: Client → ACK',
    buttonLabel: 'Kirim ACK Final',
    packetLabel: 'ACK (Seq=1001, Ack=5001)',
    packetColor: '#10B981',
    statusAfter: { client: 'ESTABLISHED', server: 'ESTABLISHED' },
    detail: 'Client mengkonfirmasi SYN Server dengan Ack=5001. Sekarang KEDUA pihak berstatus ESTABLISHED — koneksi TCP terbuka penuh!',
  },
];

const STATUS_COLORS: Record<string, string> = {
  CLOSED: '#9CA3AF',
  LISTEN: '#F59E0B',
  SYN_SENT: '#628ECB',
  SYN_RECEIVED: '#8B5CF6',
  ESTABLISHED: '#10B981',
};

function TWHPacketAnimation({ label, color, direction }: { label: string; color: string; direction: 'ltr' | 'rtl' }) {
  return (
    <motion.div
      initial={{ x: direction === 'ltr' ? '-60%' : '60%', opacity: 0 }}
      animate={{ x: '0%', opacity: 1 }}
      exit={{ x: direction === 'ltr' ? '60%' : '-60%', opacity: 0 }}
      transition={{ duration: 0.7, ease: 'easeInOut' }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <span
        className="px-3 py-1 rounded-full text-white text-xs font-black shadow-lg"
        style={{ backgroundColor: color }}
      >
        {label}
      </span>
    </motion.div>
  );
}

function ModelingLesson2({ lessonId, stageIndex, onComplete, objectiveCode = 'X.TCP.13', onTrackerPhase }: ModelingStageProps) {
  const tracker = useActivityTracker({ lessonId, stageIndex, stageType: 'modeling' });

  type L2Phase = 'intro' | 'handshake' | 'segmentation' | 'transfer' | 'conclusion';

  const [phase, setPhase] = useState<L2Phase>('intro');
  // TWH sub-step: 0=input_clientSeq 1=ready_syn 2=anim_syn 3=input_server 4=ready_synack 5=anim_synack 6=input_clientAck 7=ready_ack 8=anim_ack 9=established
  const [twhSub, setTwhSub] = useState(0);
  const [clientStatus, setClientStatus] = useState('CLOSED');
  const [serverStatus, setServerStatus] = useState('LISTEN');
  const [pkt, setPkt] = useState<{ label: string; color: string; dir: 'ltr' | 'rtl' } | null>(null);
  // TWH inputs
  const [inClientSeq, setInClientSeq] = useState('');
  const [inServerAck, setInServerAck] = useState('');
  const [inServerSeq, setInServerSeq] = useState('');
  const [inClientAck, setInClientAck] = useState('');
  const [twhErr, setTwhErr] = useState('');
  // Segmentation sub-step: 0=input_count 1=input_seq0 2=input_seq1 3=input_seq2 4=done
  const [segSub, setSegSub] = useState(0);
  const [inSegCount, setInSegCount] = useState('');
  const [inSegSeqs, setInSegSeqs] = useState(['', '', '']);
  const [segErr, setSegErr] = useState('');
  // Transfer: xferSeg=current segment index, xferState per segment
  const [xferSeg, setXferSeg] = useState(0);
  // 'send'=waiting to send | 'anim'=animating | 'ack'=input ACK | 'done'=complete
  const [xferStates, setXferStates] = useState<Array<'send' | 'anim' | 'ack' | 'done'>>(['send', 'send', 'send']);
  const [inXferAck, setInXferAck] = useState('');
  const [xferErr, setXferErr] = useState('');
  // Arguing checkpoint (after Segmen 1 is confirmed)
  const [arguingEssay, setArguingEssay] = useState('');
  const [arguingDraft, setArguingDraft] = useState('');
  const [conclusionText, setConclusionText] = useState('');
  const [isRestored, setIsRestored] = useState(false);

  const trackerRef = useRef(tracker);
  trackerRef.current = tracker;

  useEffect(() => {
    if (!tracker.isLoading && !isRestored) {
      const snap = tracker.session?.latestSnapshot;
      if (snap) {
        if (snap.phase) setPhase(snap.phase as L2Phase);
        if (snap.twhSub !== undefined) setTwhSub(snap.twhSub as number);
        if (snap.clientStatus) setClientStatus(snap.clientStatus as string);
        if (snap.serverStatus) setServerStatus(snap.serverStatus as string);
        if (snap.segSub !== undefined) setSegSub(snap.segSub as number);
        if (snap.xferSeg !== undefined) setXferSeg(snap.xferSeg as number);
        if (snap.xferStates) setXferStates(snap.xferStates as typeof xferStates);
        if (snap.arguingEssay) setArguingEssay(snap.arguingEssay as string);
        if (snap.conclusionText) setConclusionText(snap.conclusionText as string);
      }
      setIsRestored(true);
    }
  }, [tracker.isLoading, tracker.session, isRestored]);

  useEffect(() => {
    if (!isRestored) return;
    const doneSeg = xferStates.filter(s => s === 'done').length;
    const pct =
      phase === 'conclusion' ? (conclusionText ? 100 : 90)
      : phase === 'transfer' ? 60 + Math.round((doneSeg / 3) * 27)
      : phase === 'segmentation' ? 50 + Math.round((segSub / 4) * 10)
      : phase === 'handshake' ? Math.round((twhSub / 9) * 48)
      : 0;
    void trackerRef.current.saveSnapshot(
      { phase, twhSub, clientStatus, serverStatus, segSub, xferSeg, xferStates, arguingEssay, conclusionText },
      { progressPercent: pct },
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, twhSub, clientStatus, serverStatus, segSub, xferSeg, xferStates, arguingEssay, conclusionText, isRestored]);

  useEffect(() => {
    if (!isRestored) return;
    let tp: 'consistency' | 'arguing' | 'conclusion' = 'consistency';
    if (phase === 'conclusion') tp = 'conclusion';
    else if (phase === 'transfer' && xferStates[0] === 'done' && !arguingEssay) tp = 'arguing';
    onTrackerPhase?.(tp);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, xferStates, arguingEssay, isRestored]);

  if (tracker.isLoading || !isRestored) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-[#628ECB] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-[#395886]">Memuat progres...</p>
      </div>
    );
  }

  const SEGS = [
    { seq: 101, len: 100, ack: 201, label: 'Segmen 1' },
    { seq: 201, len: 100, ack: 301, label: 'Segmen 2' },
    { seq: 301, len: 100, ack: 401, label: 'Segmen 3' },
  ];

  const firePacket = (label: string, color: string, dir: 'ltr' | 'rtl', onDone: () => void) => {
    setPkt({ label, color, dir });
    setTimeout(() => { setPkt(null); setTimeout(onDone, 150); }, 1100);
  };

  const validateInt = (val: string, expected: number) => parseInt(val.trim(), 10) === expected;

  // ── Intro phase ─────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="space-y-5 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">
        <div className="bg-white rounded-2xl border-2 border-[#628ECB]/25 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#628ECB]/10 to-transparent border-b border-[#628ECB]/15">
            <div className="h-9 w-9 shrink-0 rounded-xl bg-[#628ECB]/15 flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#628ECB]" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#628ECB]">Keruntutan Berpikir · Fase A–C</p>
              <h3 className="text-sm font-bold text-[#395886]">Simulator TCP Interaktif</h3>
            </div>
          </div>
          <div className="px-5 py-4 space-y-4">
            <p className="text-xs text-[#395886]/70 leading-relaxed">
              Sebelum simulasi dimulai, pahami 4 konsep kunci TCP berikut:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { term: 'SYN', color: '#628ECB', desc: 'Flag untuk memulai koneksi. Dikirim oleh Client ke Server sebagai sinyal "Saya ingin terhubung".' },
                { term: 'SYN-ACK', color: '#8B5CF6', desc: 'Balasan Server: "Saya terima permintaanmu dan saya juga ingin terhubung ke kamu".' },
                { term: 'Sequence Number (Seq)', color: '#F59E0B', desc: 'Nomor urut byte data yang dikirim. Digunakan untuk menyusun ulang data di sisi penerima.' },
                { term: 'ACK Number', color: '#10B981', desc: 'Nomor byte berikutnya yang diharapkan penerima. Rumus: ACK = Seq_pengirim + 1 (atau + panjang data).' },
              ].map(c => (
                <div key={c.term} className="p-2.5 rounded-xl border border-[#D5DEEF] bg-[#F8FAFF]">
                  <p className="text-[9px] font-black mb-1" style={{ color: c.color }}>{c.term}</p>
                  <p className="text-[9px] text-[#395886]/65 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
            <div className="px-3 py-2 rounded-xl bg-[#FEF3C7] border border-[#F59E0B]/30 text-[10px] text-[#92400E]/80 leading-relaxed">
              💡 Dalam simulasi ini, kamu akan diminta <strong>menginput nilai Seq dan ACK secara manual</strong> sebelum paket dapat dikirim. Hitung dengan cermat!
            </div>
          </div>
        </div>
        <ContinueActivityButton
          onClick={() => {
            void trackerRef.current.trackEvent('modeling_intro_done', {}, { progressPercent: 5 });
            setPhase('handshake');
          }}
          label="Mulai Simulasi TCP"
        />
      </div>
    );
  }

  // ── Conclusion phase ─────────────────────────────────────────────────────────
  if (phase === 'conclusion') {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10">

        {/* Activity Summary — always visible so students have context while writing */}
        <div className="bg-white rounded-2xl border-2 border-[#D5DEEF] shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#395886]/8 to-transparent border-b border-[#D5DEEF]">
            <div className="h-8 w-8 rounded-xl bg-[#395886]/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#395886]" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#395886]/60">Ringkasan Simulasi</p>
              <p className="text-sm font-bold text-[#395886]">Hasil Aktivitas TCP — Pertemuan 2</p>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Fase A */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-md bg-[#628ECB]/15 flex items-center justify-center">
                  <span className="text-[8px] font-black text-[#628ECB]">A</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-wide text-[#628ECB]">Fase A — Three-Way Handshake</p>
              </div>
              <div className="ml-7 space-y-1.5">
                {[
                  { step: 'Langkah 1 (SYN)', values: 'Client Seq = 100', dir: 'Client → Server', color: '#628ECB' },
                  { step: 'Langkah 2 (SYN-ACK)', values: 'Server Seq = 500, Ack = 101', dir: 'Server → Client', color: '#8B5CF6' },
                  { step: 'Langkah 3 (ACK)', values: 'Client Ack = 501', dir: 'Client → Server', color: '#10B981' },
                ].map(r => (
                  <div key={r.step} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-[#F8FAFF] border border-[#D5DEEF]">
                    <div className="h-3.5 w-3.5 mt-0.5 rounded-full shrink-0 bg-[#10B981] flex items-center justify-center">
                      <CheckCircle className="w-2.5 h-2.5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-[#395886]">{r.step}</p>
                      <p className="text-[9px] text-[#395886]/60">{r.dir} · <span className="font-black" style={{ color: r.color }}>{r.values}</span></p>
                    </div>
                  </div>
                ))}
                <div className="px-3 py-1.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/25 text-[9px] font-black text-[#065F46]">
                  Status akhir: CLIENT = ESTABLISHED · SERVER = ESTABLISHED ✓
                </div>
              </div>
            </div>

            <div className="h-px bg-[#D5DEEF]" />

            {/* Fase B */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-md bg-[#F59E0B]/15 flex items-center justify-center">
                  <span className="text-[8px] font-black text-[#F59E0B]">B</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-wide text-[#F59E0B]">Fase B — Segmentasi Data</p>
              </div>
              <div className="ml-7 space-y-1.5">
                <div className="px-3 py-2 rounded-lg bg-[#F8FAFF] border border-[#D5DEEF] text-[9px]">
                  <span className="font-black text-[#395886]">Jumlah segmen: </span>
                  <span className="text-[#F59E0B] font-black">3 segmen</span>
                  <span className="text-[#395886]/60"> (300 Byte ÷ 100 Byte)</span>
                </div>
                <div className="flex gap-2">
                  {[{ label: 'Segmen 1', seq: 101 }, { label: 'Segmen 2', seq: 201 }, { label: 'Segmen 3', seq: 301 }].map(s => (
                    <div key={s.label} className="flex-1 flex flex-col">
                      <div className="px-2 py-1 rounded-t-lg bg-[#8B5CF6]/10 border border-b-0 border-[#8B5CF6]/25 text-center">
                        <p className="text-[7px] font-black text-[#6D28D9]">TCP HDR</p>
                        <p className="text-[7px] text-[#6D28D9]/70">Seq={s.seq}</p>
                      </div>
                      <div className="px-2 py-1 rounded-b-lg bg-[#628ECB]/10 border border-t-0 border-[#628ECB]/25 text-center">
                        <p className="text-[7px] font-black text-[#395886]">DATA 100B</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-px bg-[#D5DEEF]" />

            {/* Fase C */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-md bg-[#10B981]/15 flex items-center justify-center">
                  <span className="text-[8px] font-black text-[#10B981]">C</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-wide text-[#10B981]">Fase C — Pengiriman Data + ACK</p>
              </div>
              <div className="ml-7 space-y-1.5">
                {[
                  { label: 'Segmen 1', seq: 101, ack: 201 },
                  { label: 'Segmen 2', seq: 201, ack: 301 },
                  { label: 'Segmen 3', seq: 301, ack: 401 },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F8FAFF] border border-[#D5DEEF] text-[9px]">
                    <CheckCircle className="w-3 h-3 text-[#10B981] shrink-0" />
                    <span className="font-black text-[#395886]">{s.label}</span>
                    <span className="text-[#395886]/50">Seq={s.seq}, Len=100B</span>
                    <ArrowRight className="w-3 h-3 text-[#395886]/30 shrink-0" />
                    <span className="text-[#10B981] font-black">Server ACK={s.ack}</span>
                    <span className="text-[#395886]/40 ml-auto">({s.seq}+100)</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-[#D5DEEF]" />

            {/* Kemampuan Berargumen */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-md bg-[#F59E0B]/15 flex items-center justify-center">
                  <MessageSquare className="w-3 h-3 text-[#F59E0B]" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-wide text-[#F59E0B]">Kemampuan Berargumen</p>
              </div>
              <div className="ml-7 px-3 py-2.5 rounded-lg bg-[#FFFBEB] border border-[#F59E0B]/25">
                <p className="text-[9px] text-[#92400E]/60 mb-1.5 font-black">Pertanyaan: Mengapa Server mengirim ACK=201 setelah menerima Segmen 1 (Seq=101, 100 Byte)?</p>
                <p className="text-[10px] text-[#395886] leading-relaxed">{arguingEssay}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Conclusion form */}
        <ATPConclusionBox
          atpBehavior="mampu mensimulasikan mekanisme kerja TCP dari pembentukan koneksi, segmentasi data, hingga pengiriman data dengan acknowledgment yang tepat"
          objectiveCode={objectiveCode}
          stageType="modeling"
          defaultValue={conclusionText}
          disabled={!!conclusionText}
          onSubmit={(text) => {
            setConclusionText(text);
            const finalAnswer = { twhSub, segSub, xferStates, arguingEssay, conclusion: text };
            void tracker.complete(finalAnswer, { phase: 'conclusion', finalAnswer });
            onComplete(finalAnswer);
          }}
        />

        {/* After submission: success banner + conclusion text */}
        {conclusionText && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20">
              <CheckCircle className="w-5 h-5 text-[#10B981]" />
              <span className="text-sm font-black text-[#065F46]">Tahap Modeling selesai!</span>
            </div>
            <div className="bg-white rounded-2xl border-2 border-[#628ECB]/20 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#EFF4FF]/60 border-b border-[#628ECB]/15">
                <div className="h-5 w-5 rounded-md bg-[#628ECB]/15 flex items-center justify-center">
                  <BookOpen className="w-3 h-3 text-[#628ECB]" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-wide text-[#628ECB]">Penarikan Kesimpulan</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[10px] text-[#395886] leading-relaxed">{conclusionText}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Shared: Client-Server header strip ──────────────────────────────────────
  const renderCSHeader = (cs: string, ss: string) => (
    <div className="flex items-center justify-between mb-3">
      <div className="flex flex-col items-center gap-1">
        <div className="h-9 w-9 rounded-xl bg-[#628ECB]/10 flex items-center justify-center"><Monitor className="w-5 h-5 text-[#628ECB]" /></div>
        <span className="text-[9px] font-black text-[#395886]">CLIENT</span>
        <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black text-white transition-all duration-500" style={{ backgroundColor: STATUS_COLORS[cs] ?? '#9CA3AF' }}>{cs}</span>
      </div>
      <div className="flex-1 relative mx-2 min-h-[60px] flex items-center">
        <div className="w-full h-0.5 bg-[#D5DEEF]" />
        <AnimatePresence>
          {pkt && (
            <TWHPacketAnimation key={pkt.label + pkt.dir} label={pkt.label} color={pkt.color} direction={pkt.dir} />
          )}
        </AnimatePresence>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="h-9 w-9 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center"><Server className="w-5 h-5 text-[#8B5CF6]" /></div>
        <span className="text-[9px] font-black text-[#395886]">SERVER</span>
        <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black text-white transition-all duration-500" style={{ backgroundColor: STATUS_COLORS[ss] ?? '#9CA3AF' }}>{ss}</span>
      </div>
    </div>
  );

  // ── Input field helper ───────────────────────────────────────────────────────
  const InputField = ({ label, value, onChange, placeholder, disabled }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean }) => (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-black text-[#395886]/60 shrink-0 w-20">{label}</span>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder ?? '?'}
        className="w-20 text-xs font-black text-[#395886] border-2 border-[#D5DEEF] rounded-lg px-2 py-1 focus:border-[#628ECB] focus:outline-none transition-colors disabled:opacity-50 disabled:bg-[#F8FAFF]"
      />
    </div>
  );

  // ── Phase progress bar ───────────────────────────────────────────────────────
  const phaseOrder: Record<L2Phase, number> = { intro: 0, handshake: 1, segmentation: 2, transfer: 3, conclusion: 4 };
  const PHASES: { key: L2Phase; label: string }[] = [
    { key: 'handshake', label: 'Handshake' },
    { key: 'segmentation', label: 'Segmentasi' },
    { key: 'transfer', label: 'Transfer' },
  ];

  // ── Canvas content per phase ─────────────────────────────────────────────────
  const renderCanvas = () => {
    // ─ Handshake canvas ──────────────────────────────────────────────────────
    if (phase === 'handshake') {
      const sub = twhSub;
      const animating = sub === 2 || sub === 5 || sub === 8;
      return (
        <div className="space-y-3">
          {renderCSHeader(clientStatus, serverStatus)}

          {/* Step 1: Client Seq input */}
          <div className={`rounded-xl border-2 p-3 space-y-2 transition-all ${sub >= 3 ? 'border-[#10B981]/25 bg-[#F0FDF4]' : sub < 3 ? 'border-[#628ECB]/25 bg-[#F0F7FF]' : 'border-[#D5DEEF]'}`}>
            <div className="flex items-center gap-2">
              <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${sub >= 3 ? 'bg-[#10B981]' : 'bg-[#628ECB]/20'}`}>
                {sub >= 3 ? <CheckCircle className="w-3 h-3 text-white" /> : <span className="text-[8px] font-black text-[#628ECB]">1</span>}
              </div>
              <p className="text-[10px] font-black text-[#395886]">Langkah 1 — Client kirim SYN</p>
            </div>
            {sub < 3 && (
              <div className="space-y-2 pl-6">
                <InputField label="Client Seq =" value={inClientSeq} onChange={v => { setInClientSeq(v); setTwhErr(''); }} disabled={sub >= 1} />
                {sub === 0 && (
                  <button
                    onClick={() => { if (validateInt(inClientSeq, 100)) { setTwhSub(1); setTwhErr(''); } else setTwhErr('Nilai belum tepat. Seq awal Client = ?'); }}
                    className="px-3 py-1 rounded-lg text-[9px] font-black text-white bg-[#628ECB] hover:opacity-90 active:scale-95 transition-all"
                  >Cek Nilai</button>
                )}
                {sub === 1 && (
                  <button
                    onClick={() => { setTwhSub(2); firePacket('SYN (Seq=100)', '#628ECB', 'ltr', () => { setClientStatus('SYN_SENT'); setTwhSub(3); void trackerRef.current.trackEvent('modeling_syn_sent', {}, { progressPercent: 20 }); }); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black text-white bg-gradient-to-r from-[#395886] to-[#628ECB] hover:opacity-90 active:scale-95 shadow-sm transition-all"
                  >▶ Kirim SYN</button>
                )}
                {sub === 2 && <p className="text-[9px] text-[#628ECB] font-black animate-pulse">Mengirim SYN...</p>}
              </div>
            )}
            {sub >= 3 && <p className="text-[9px] text-[#065F46]/70 pl-6">SYN dikirim — Seq=100 ✓</p>}
          </div>

          {/* Step 2: Server SYN-ACK */}
          {sub >= 3 && (
            <div className={`rounded-xl border-2 p-3 space-y-2 transition-all ${sub >= 6 ? 'border-[#10B981]/25 bg-[#F0FDF4]' : 'border-[#8B5CF6]/25 bg-[#FAF5FF]'}`}>
              <div className="flex items-center gap-2">
                <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${sub >= 6 ? 'bg-[#10B981]' : 'bg-[#8B5CF6]/20'}`}>
                  {sub >= 6 ? <CheckCircle className="w-3 h-3 text-white" /> : <span className="text-[8px] font-black text-[#8B5CF6]">2</span>}
                </div>
                <p className="text-[10px] font-black text-[#395886]">Langkah 2 — Server balas SYN-ACK</p>
              </div>
              {sub < 6 && (
                <div className="space-y-2 pl-6">
                  <InputField label="Server Ack =" value={inServerAck} onChange={v => { setInServerAck(v); setTwhErr(''); }} disabled={sub >= 4} />
                  <InputField label="Server Seq =" value={inServerSeq} onChange={v => { setInServerSeq(v); setTwhErr(''); }} disabled={sub >= 4} />
                  {sub === 3 && (
                    <button
                      onClick={() => { if (validateInt(inServerAck, 101) && validateInt(inServerSeq, 500)) { setTwhSub(4); setTwhErr(''); } else setTwhErr('Periksa lagi: Ack = Seq_client + 1, Seq baru Server = 500'); }}
                      className="px-3 py-1 rounded-lg text-[9px] font-black text-white bg-[#8B5CF6] hover:opacity-90 active:scale-95 transition-all"
                    >Cek Nilai</button>
                  )}
                  {sub === 4 && (
                    <button
                      onClick={() => { setTwhSub(5); firePacket('SYN-ACK (Seq=500,Ack=101)', '#8B5CF6', 'rtl', () => { setServerStatus('SYN_RECEIVED'); setTwhSub(6); void trackerRef.current.trackEvent('modeling_synack_sent', {}, { progressPercent: 35 }); }); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black text-white bg-[#8B5CF6] hover:opacity-90 active:scale-95 shadow-sm transition-all"
                    >▶ Kirim SYN-ACK</button>
                  )}
                  {sub === 5 && <p className="text-[9px] text-[#8B5CF6] font-black animate-pulse">Mengirim SYN-ACK...</p>}
                </div>
              )}
              {sub >= 6 && <p className="text-[9px] text-[#065F46]/70 pl-6">SYN-ACK dikirim — Seq=500, Ack=101 ✓</p>}
            </div>
          )}

          {/* Step 3: Client ACK */}
          {sub >= 6 && (
            <div className={`rounded-xl border-2 p-3 space-y-2 transition-all ${sub >= 9 ? 'border-[#10B981]/25 bg-[#F0FDF4]' : 'border-[#10B981]/25 bg-[#F0FDF4]/50'}`}>
              <div className="flex items-center gap-2">
                <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${sub >= 9 ? 'bg-[#10B981]' : 'bg-[#10B981]/20'}`}>
                  {sub >= 9 ? <CheckCircle className="w-3 h-3 text-white" /> : <span className="text-[8px] font-black text-[#10B981]">3</span>}
                </div>
                <p className="text-[10px] font-black text-[#395886]">Langkah 3 — Client kirim ACK Final</p>
              </div>
              {sub < 9 && (
                <div className="space-y-2 pl-6">
                  <InputField label="Client Ack =" value={inClientAck} onChange={v => { setInClientAck(v); setTwhErr(''); }} disabled={sub >= 7} />
                  {sub === 6 && (
                    <button
                      onClick={() => { if (validateInt(inClientAck, 501)) { setTwhSub(7); setTwhErr(''); } else setTwhErr('Ack = Seq_server + 1 = 500 + 1 = ?'); }}
                      className="px-3 py-1 rounded-lg text-[9px] font-black text-white bg-[#10B981] hover:opacity-90 active:scale-95 transition-all"
                    >Cek Nilai</button>
                  )}
                  {sub === 7 && (
                    <button
                      onClick={() => { setTwhSub(8); firePacket('ACK (Seq=101,Ack=501)', '#10B981', 'ltr', () => { setClientStatus('ESTABLISHED'); setServerStatus('ESTABLISHED'); setTwhSub(9); void trackerRef.current.trackEvent('modeling_ack_sent', {}, { progressPercent: 48 }); }); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black text-white bg-[#10B981] hover:opacity-90 active:scale-95 shadow-sm transition-all"
                    >▶ Kirim ACK Final</button>
                  )}
                  {sub === 8 && <p className="text-[9px] text-[#10B981] font-black animate-pulse">Mengirim ACK Final...</p>}
                </div>
              )}
              {sub >= 9 && <p className="text-[9px] text-[#065F46]/70 pl-6">ACK Final dikirim — Ack=501 ✓</p>}
            </div>
          )}

          {twhErr && <p className="text-[9px] font-black text-red-500 px-1">{twhErr}</p>}

          {sub === 9 && (
            <>
              <div className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#10B981]/10 border-2 border-[#10B981]/30 animate-in fade-in zoom-in-95 duration-300">
                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                <span className="text-[10px] font-black text-[#065F46]">Koneksi ESTABLISHED!</span>
              </div>
              <ContinueActivityButton onClick={() => { void trackerRef.current.trackEvent('modeling_handshake_done', {}, { progressPercent: 50 }); setPhase('segmentation'); }} label="Lanjutkan ke Segmentasi Data" />
            </>
          )}
        </div>
      );
    }

    // ─ Segmentation canvas ────────────────────────────────────────────────────
    if (phase === 'segmentation') {
      const ss = segSub;
      return (
        <div className="space-y-3">
          <div className="px-3 py-2.5 rounded-xl border-2 border-[#628ECB]/20 bg-[#F0F7FF] text-center">
            <p className="text-[10px] font-black text-[#395886]">FILE DATA</p>
            <p className="text-lg font-black text-[#628ECB]">300 Byte</p>
            <p className="text-[9px] text-[#395886]/60">Siap dikirim ke Server</p>
          </div>

          {/* Q1: jumlah segmen */}
          <div className={`rounded-xl border-2 p-3 space-y-2 transition-all ${ss >= 1 ? 'border-[#10B981]/25 bg-[#F0FDF4]' : 'border-[#F59E0B]/25 bg-[#FFFBEB]'}`}>
            <p className="text-[10px] font-black text-[#395886]">Jika tiap segmen berukuran 100 Byte, berapa jumlah segmen?</p>
            {ss === 0 ? (
              <div className="flex items-center gap-2">
                <input type="number" value={inSegCount} onChange={e => { setInSegCount(e.target.value); setSegErr(''); }} placeholder="?" className="w-16 text-xs font-black text-[#395886] border-2 border-[#D5DEEF] rounded-lg px-2 py-1 focus:border-[#628ECB] focus:outline-none transition-colors" />
                <span className="text-[9px] text-[#395886]/60">segmen</span>
                <button
                  onClick={() => { if (validateInt(inSegCount, 3)) { setSegSub(1); setSegErr(''); } else setSegErr('300 ÷ 100 = ?'); }}
                  className="px-3 py-1 rounded-lg text-[9px] font-black text-white bg-[#F59E0B] hover:opacity-90 active:scale-95 transition-all"
                >Cek</button>
              </div>
            ) : (
              <p className="text-[9px] text-[#065F46]/70">3 segmen ✓ (300 ÷ 100 = 3)</p>
            )}
          </div>

          {/* Q2–Q4: Seq tiap segmen */}
          {ss >= 1 && (
            <div className="space-y-2">
              <p className="text-[9px] font-black text-[#395886]/60 px-1">Tentukan Sequence Number tiap segmen (melanjutkan dari Seq terakhir handshake):</p>
              {SEGS.map((seg, i) => {
                const inputDone = ss > i + 1;
                const isActive = ss === i + 1;
                return (
                  <div key={seg.label} className={`rounded-xl border-2 p-2.5 space-y-1.5 transition-all ${inputDone ? 'border-[#10B981]/25 bg-[#F0FDF4]' : isActive ? 'border-[#F59E0B]/25 bg-[#FFFBEB]' : 'border-[#D5DEEF] opacity-35'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${inputDone ? 'bg-[#10B981]' : 'bg-[#F59E0B]/20'}`}>
                        {inputDone ? <CheckCircle className="w-3 h-3 text-white" /> : <span className="text-[8px] font-black text-[#F59E0B]">{i + 1}</span>}
                      </div>
                      <p className={`text-[9px] font-black ${inputDone ? 'text-[#065F46]' : 'text-[#395886]'}`}>{seg.label} — Seq = ?</p>
                    </div>
                    {isActive && (
                      <div className="flex items-center gap-2 pl-6">
                        <input
                          type="number"
                          value={inSegSeqs[i]}
                          onChange={e => { const a = [...inSegSeqs]; a[i] = e.target.value; setInSegSeqs(a); setSegErr(''); }}
                          placeholder="?"
                          className="w-16 text-xs font-black text-[#395886] border-2 border-[#D5DEEF] rounded-lg px-2 py-1 focus:border-[#628ECB] focus:outline-none transition-colors"
                        />
                        <button
                          onClick={() => { if (validateInt(inSegSeqs[i], seg.seq)) { setSegSub(ss + 1); setSegErr(''); if (ss + 1 === 4) void trackerRef.current.trackEvent('modeling_seg_inputs_done', {}, { progressPercent: 60 }); } else setSegErr(`Ingat: Seq melanjutkan dari byte sebelumnya.`); }}
                          className="px-3 py-1 rounded-lg text-[9px] font-black text-white bg-[#F59E0B] hover:opacity-90 active:scale-95 transition-all"
                        >Cek</button>
                      </div>
                    )}
                    {inputDone && <p className="text-[9px] text-[#065F46]/70 pl-6">Seq={seg.seq} ✓</p>}
                  </div>
                );
              })}
            </div>
          )}

          {segErr && <p className="text-[9px] font-black text-red-500 px-1">{segErr}</p>}

          {ss >= 4 && (
            <>
              <div className="flex gap-2 justify-center">
                {SEGS.map(s => (
                  <div key={s.label} className="flex flex-col items-center">
                    <div className="px-2.5 py-1.5 rounded-t-lg bg-[#8B5CF6]/10 border border-b-0 border-[#8B5CF6]/30 text-center">
                      <p className="text-[8px] font-black text-[#6D28D9]">TCP HDR</p>
                      <p className="text-[8px] text-[#6D28D9]/70">Seq={s.seq}</p>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-b-lg bg-[#628ECB]/10 border border-t-0 border-[#628ECB]/30 text-center">
                      <p className="text-[8px] font-black text-[#395886]">DATA 100B</p>
                    </div>
                  </div>
                ))}
              </div>
              <ContinueActivityButton onClick={() => { void trackerRef.current.trackEvent('modeling_segmentation_done', {}, { progressPercent: 62 }); setPhase('transfer'); }} label="Lanjutkan ke Pengiriman Data" />
            </>
          )}
        </div>
      );
    }

    // ─ Transfer canvas ────────────────────────────────────────────────────────
    if (phase === 'transfer') {
      const allDone = xferStates.every(s => s === 'done');
      const cur = xferSeg < 3 ? SEGS[xferSeg] : null;
      const curState = xferSeg < 3 ? xferStates[xferSeg] : 'done';
      return (
        <div className="space-y-3">
          {renderCSHeader('ESTABLISHED', 'ESTABLISHED')}

          {/* Segment list */}
          {SEGS.map((seg, i) => {
            const st = xferStates[i];
            const isActive = i === xferSeg;
            // Block Seg 2+ until arguing essay is submitted
            const blockedByArguing = i >= 1 && xferStates[0] === 'done' && !arguingEssay;
            return (
              <div key={seg.label} className={`rounded-xl border-2 p-3 space-y-2 transition-all ${st === 'done' ? 'border-[#10B981]/25 bg-[#F0FDF4]' : isActive && !blockedByArguing ? 'border-[#628ECB]/25 bg-[#F0F7FF]' : 'border-[#D5DEEF] opacity-30'}`}>
                <div className="flex items-center gap-2">
                  <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${st === 'done' ? 'bg-[#10B981]' : 'bg-[#628ECB]/20'}`}>
                    {st === 'done' ? <CheckCircle className="w-3 h-3 text-white" /> : <span className="text-[8px] font-black text-[#628ECB]">{i + 1}</span>}
                  </div>
                  <p className={`flex-1 text-[10px] font-black ${st === 'done' ? 'text-[#065F46]' : 'text-[#395886]'}`}>{seg.label} — Seq={seg.seq}, Len=100B</p>
                </div>

                {isActive && st === 'send' && !blockedByArguing && (
                  <button
                    onClick={() => {
                      const ns = [...xferStates]; ns[i] = 'anim'; setXferStates(ns);
                      firePacket(`Seq=${seg.seq}`, '#628ECB', 'ltr', () => {
                        const ns2 = [...xferStates]; ns2[i] = 'ack'; setXferStates(ns2);
                        void trackerRef.current.trackEvent(`modeling_seg${i + 1}_sent`, {}, { progressPercent: 65 + i * 8 });
                      });
                    }}
                    className="ml-6 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black text-white bg-gradient-to-r from-[#395886] to-[#628ECB] hover:opacity-90 active:scale-95 shadow-sm transition-all"
                  >▶ Kirim {seg.label}</button>
                )}
                {isActive && st === 'anim' && !blockedByArguing && <p className="text-[9px] text-[#628ECB] font-black animate-pulse ml-6">Mengirim segmen...</p>}
                {isActive && st === 'ack' && !blockedByArguing && (
                  <div className="space-y-1.5 ml-6">
                    <p className="text-[9px] text-[#395886]/70">Segmen diterima Server. Berapa nilai ACK yang akan Server kirim?</p>
                    <p className="text-[9px] text-[#395886]/50">Rumus: ACK = Seq + Len = {seg.seq} + 100 = ?</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={inXferAck}
                        onChange={e => { setInXferAck(e.target.value); setXferErr(''); }}
                        placeholder="?"
                        className="w-16 text-xs font-black text-[#395886] border-2 border-[#D5DEEF] rounded-lg px-2 py-1 focus:border-[#628ECB] focus:outline-none transition-colors"
                      />
                      <span className="text-[9px] text-[#395886]/50">Server ACK = ?</span>
                      <button
                        onClick={() => {
                          if (validateInt(inXferAck, seg.ack)) {
                            const ns = [...xferStates]; ns[i] = 'done'; setXferStates(ns);
                            if (i + 1 < 3) setXferSeg(i + 1);
                            setInXferAck(''); setXferErr('');
                            void trackerRef.current.trackEvent(`modeling_seg${i + 1}_ack`, {}, { progressPercent: 68 + i * 9 });
                          } else setXferErr(`${seg.seq} + 100 = ?`);
                        }}
                        className="px-3 py-1 rounded-lg text-[9px] font-black text-white bg-[#10B981] hover:opacity-90 active:scale-95 transition-all"
                      >Konfirmasi ACK</button>
                    </div>
                    {xferErr && <p className="text-[9px] font-black text-red-500">{xferErr}</p>}
                  </div>
                )}
                {st === 'done' && (
                  <p className="text-[9px] text-[#065F46]/70 ml-6">Terkirim · Server ACK={seg.ack} ({seg.seq}+100) ✓</p>
                )}
              </div>
            );
          })}

          {/* Arguing checkpoint — pauses after Segmen 1 */}
          {xferStates[0] === 'done' && !arguingEssay && (
            <div className="rounded-xl border-2 border-[#F59E0B]/40 bg-[#FFFBEB] p-3 space-y-2.5 animate-in fade-in slide-in-from-bottom-4 duration-400">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-md bg-[#F59E0B]/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-3 h-3 text-[#F59E0B]" />
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-[#F59E0B]">Kemampuan Berargumen — Simulasi Dijeda</p>
                  <p className="text-[9px] font-black text-[#395886] mt-0.5">Jawab pertanyaan berikut sebelum melanjutkan</p>
                </div>
              </div>
              <div className="px-3 py-2 rounded-lg bg-[#FEF3C7] border border-[#F59E0B]/30">
                <p className="text-[9px] text-[#92400E]/85 leading-relaxed">
                  Mengapa setelah Segmen 1 dengan Seq=101 dan ukuran data 100 Byte diterima, Server mengirimkan ACK=201? Jelaskan rumus dan alasan teknisnya.
                </p>
              </div>
              <textarea
                value={arguingDraft}
                onChange={e => setArguingDraft(e.target.value)}
                className="w-full text-[10px] text-[#395886] border-2 border-[#D5DEEF] rounded-xl p-2.5 resize-none focus:border-[#F59E0B] focus:outline-none transition-colors leading-relaxed"
                rows={4}
                placeholder="Jelaskan alasanmu... (min. 20 kata)"
              />
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-black ${arguingDraft.trim().split(/\s+/).filter(Boolean).length >= 20 ? 'text-[#10B981]' : 'text-[#395886]/40'}`}>
                  {arguingDraft.trim().split(/\s+/).filter(Boolean).length} / 20 kata
                </span>
                <button
                  onClick={() => {
                    if (arguingDraft.trim().split(/\s+/).filter(Boolean).length < 20) return;
                    setArguingEssay(arguingDraft);
                    void trackerRef.current.trackEvent('modeling_arguing_done', { essay: arguingDraft }, { progressPercent: 75 });
                  }}
                  disabled={arguingDraft.trim().split(/\s+/).filter(Boolean).length < 20}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black text-white transition-all active:scale-95 ${arguingDraft.trim().split(/\s+/).filter(Boolean).length >= 20 ? 'bg-[#F59E0B] hover:opacity-90' : 'bg-[#D5DEEF] cursor-not-allowed'}`}
                >
                  Kirim Argumen & Lanjutkan
                </button>
              </div>
            </div>
          )}

          {xferStates[0] === 'done' && arguingEssay && !allDone && (
            <div className="px-3 py-2 rounded-xl bg-[#F0FDF4] border border-[#10B981]/25 text-[9px] text-[#065F46]/70">
              <span className="font-black text-[#065F46]">Argumen tersimpan.</span> Lanjutkan pengiriman segmen berikutnya.
            </div>
          )}

          {allDone && (
            <>
              <div className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#10B981]/10 border-2 border-[#10B981]/30 animate-in fade-in zoom-in-95 duration-300">
                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                <span className="text-[10px] font-black text-[#065F46]">Semua segmen berhasil dikirim!</span>
              </div>
              <ContinueActivityButton onClick={() => { void trackerRef.current.trackEvent('modeling_transfer_done', {}, { progressPercent: 88 }); setPhase('conclusion'); }} label="Lanjutkan ke Penarikan Kesimpulan" />
            </>
          )}
        </div>
      );
    }

    return null;
  };

  // ── Guide content per phase ──────────────────────────────────────────────────
  const renderGuide = () => {
    if (phase === 'handshake') {
      const tips = [
        { sub: [0], title: 'Tentukan Seq Client', body: 'Client memilih Initial Sequence Number (ISN) secara acak. Untuk simulasi ini, ISN Client = 100.' },
        { sub: [1, 2], title: 'Kirim SYN', body: 'Setelah Seq ditentukan, Client mengirim paket SYN ke Server untuk meminta koneksi.' },
        { sub: [3], title: 'Tentukan nilai SYN-ACK', body: 'Server harus mengkonfirmasi SYN Client. Rumus: Ack = Seq_client + 1. Server juga memilih ISN-nya sendiri = 500.' },
        { sub: [4, 5], title: 'Kirim SYN-ACK', body: 'Server mengirim SYN-ACK ke Client sebagai tanda "permintaan diterima".' },
        { sub: [6], title: 'Tentukan ACK Final Client', body: 'Client mengkonfirmasi SYN Server. Rumus: Ack = Seq_server + 1 = 500 + 1.' },
        { sub: [7, 8], title: 'Kirim ACK Final', body: 'Client mengirim ACK terakhir. Setelah ini kedua pihak berstatus ESTABLISHED.' },
      ];
      const activeTip = tips.find(t => t.sub.includes(twhSub)) ?? tips[tips.length - 1];
      return (
        <div className="space-y-3">
          <div className="px-3 py-2 rounded-xl bg-[#EFF4FF] border border-[#628ECB]/20">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#628ECB]">Keruntutan Berpikir</p>
            <p className="text-xs font-bold text-[#395886] mt-0.5">Fase A — Three-Way Handshake</p>
          </div>
          <div className="px-3 py-2.5 rounded-xl bg-[#F0F7FF] border border-[#628ECB]/15 space-y-1">
            <p className="text-[9px] font-black text-[#628ECB]">Langkah saat ini</p>
            <p className="text-[10px] font-black text-[#395886]">{activeTip.title}</p>
            <p className="text-[9px] text-[#395886]/65 leading-relaxed">{activeTip.body}</p>
          </div>
          <div className="space-y-1">
            {[
              { s: 3, label: 'SYN dikirim', sub: 'Seq=100 → Client: SYN_SENT' },
              { s: 6, label: 'SYN-ACK dikirim', sub: 'Seq=500, Ack=101 → Server: SYN_RECEIVED' },
              { s: 9, label: 'ACK Final dikirim', sub: 'Ack=501 → ESTABLISHED' },
            ].map((item, i) => (
              <div key={i} className={`flex gap-2 items-center px-2.5 py-1.5 rounded-lg text-[9px] border transition-all ${twhSub >= item.s ? 'border-[#10B981]/25 bg-[#F0FDF4]' : 'border-[#D5DEEF] opacity-40'}`}>
                <div className={`h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0 ${twhSub >= item.s ? 'bg-[#10B981]' : 'bg-[#D5DEEF]'}`}>
                  {twhSub >= item.s && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                </div>
                <div>
                  <p className={`font-black ${twhSub >= item.s ? 'text-[#065F46]' : 'text-[#395886]/30'}`}>{item.label}</p>
                  <p className={twhSub >= item.s ? 'text-[#065F46]/65' : 'text-[#395886]/25'}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (phase === 'segmentation') {
      return (
        <div className="space-y-3">
          <div className="px-3 py-2 rounded-xl bg-[#FEF3C7] border border-[#F59E0B]/20">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#F59E0B]">Keruntutan Berpikir</p>
            <p className="text-xs font-bold text-[#395886] mt-0.5">Fase B — Segmentasi Data</p>
          </div>
          <div className="px-3 py-2.5 rounded-xl bg-[#FFFBEB] border border-[#F59E0B]/15 space-y-1">
            <p className="text-[9px] font-black text-[#F59E0B]">Mengapa data dipecah?</p>
            <p className="text-[9px] text-[#395886]/65 leading-relaxed">TCP membagi data besar menjadi segmen-segmen kecil agar: (1) lebih mudah dikirim ulang jika ada yang hilang, (2) receiver dapat menyimpan buffer lebih efisien, (3) urutan data dapat dijaga.</p>
          </div>
          <div className="px-3 py-2.5 rounded-xl bg-[#FFFBEB] border border-[#F59E0B]/15 space-y-1">
            <p className="text-[9px] font-black text-[#F59E0B]">Cara menentukan Seq Number</p>
            <p className="text-[9px] text-[#395886]/65 leading-relaxed">Seq setiap segmen melanjutkan dari byte terakhir handshake. ACK terakhir handshake = 101, jadi data mulai dari Seq=101. Segmen berikutnya = Seq sebelumnya + ukuran data (100).</p>
          </div>
          <div className="space-y-1">
            {[
              { s: 1, label: 'Jumlah segmen', sub: '3 segmen (300÷100)' },
              { s: 2, label: 'Seq Segmen 1', sub: 'Seq=101' },
              { s: 3, label: 'Seq Segmen 2', sub: 'Seq=201' },
              { s: 4, label: 'Seq Segmen 3', sub: 'Seq=301' },
            ].map((item, i) => (
              <div key={i} className={`flex gap-2 items-center px-2.5 py-1.5 rounded-lg text-[9px] border transition-all ${segSub >= item.s ? 'border-[#10B981]/25 bg-[#F0FDF4]' : 'border-[#D5DEEF] opacity-40'}`}>
                <div className={`h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0 ${segSub >= item.s ? 'bg-[#10B981]' : 'bg-[#D5DEEF]'}`}>
                  {segSub >= item.s && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                </div>
                <div>
                  <p className={`font-black ${segSub >= item.s ? 'text-[#065F46]' : 'text-[#395886]/30'}`}>{item.label}</p>
                  <p className={segSub >= item.s ? 'text-[#065F46]/65' : 'text-[#395886]/25'}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (phase === 'transfer') {
      const isArguing = xferStates[0] === 'done' && !arguingEssay;
      return (
        <div className="space-y-3">
          <div className={`px-3 py-2 rounded-xl border ${isArguing ? 'bg-[#FEF3C7] border-[#F59E0B]/20' : 'bg-[#ECFDF5] border-[#10B981]/20'}`}>
            <p className={`text-[9px] font-black uppercase tracking-widest ${isArguing ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
              {isArguing ? 'Kemampuan Berargumen' : 'Keruntutan Berpikir'}
            </p>
            <p className="text-xs font-bold text-[#395886] mt-0.5">
              {isArguing ? 'Pause — Pertanyaan Analisis' : 'Fase C — Pengiriman Data + ACK'}
            </p>
          </div>
          {isArguing ? (
            <div className="space-y-2">
              <p className="text-[10px] text-[#395886]/65 leading-relaxed">Simulasi dijeda. Isi kolom argumen di canvas kiri untuk melanjutkan.</p>
              <div className="px-3 py-2 rounded-xl bg-[#FEF3C7] border border-[#F59E0B]/25">
                <p className="text-[9px] font-black text-[#92400E] mb-1">Rumus yang perlu kamu jelaskan</p>
                <p className="text-[9px] text-[#92400E]/75 leading-relaxed font-mono">ACK = Seq + Len<br/>ACK = 101 + 100 = 201</p>
              </div>
            </div>
          ) : (
            <div className="px-3 py-2.5 rounded-xl bg-[#ECFDF5] border border-[#10B981]/15 space-y-1">
              <p className="text-[9px] font-black text-[#10B981]">Rumus ACK</p>
              <p className="text-[9px] text-[#395886]/65 leading-relaxed">Setiap kali menerima segmen, Server mengirim ACK = Seq + ukuran data. Ini memberitahu Client: "Saya sudah terima byte sampai ACK-1, kirim mulai dari ACK."</p>
            </div>
          )}
          <div className="space-y-1">
            {SEGS.map((seg, i) => {
              const st = xferStates[i];
              const done = st === 'done';
              return (
                <div key={seg.label} className={`flex gap-2 items-start px-2.5 py-1.5 rounded-lg text-[9px] border transition-all ${done ? 'border-[#10B981]/25 bg-[#F0FDF4]' : i === xferSeg ? 'border-[#628ECB]/25 bg-[#F0F7FF]' : 'border-[#D5DEEF] opacity-40'}`}>
                  <div className={`h-3.5 w-3.5 mt-0.5 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-[#10B981]' : 'bg-[#D5DEEF]'}`}>
                    {done && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <div>
                    <p className={`font-black ${done ? 'text-[#065F46]' : i === xferSeg ? 'text-[#395886]' : 'text-[#395886]/30'}`}>{seg.label}</p>
                    <p className={done ? 'text-[#065F46]/65' : i === xferSeg ? 'text-[#395886]/55' : 'text-[#395886]/25'}>{seg.seq}+100 → ACK={seg.ack}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  // ── Two-panel layout ─────────────────────────────────────────────────────────
  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 pb-10 space-y-4">
      {/* Phase progress */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {PHASES.map((p, i) => {
          const pIdx = phaseOrder[p.key];
          const curIdx = phaseOrder[phase];
          const isDone = pIdx < curIdx;
          const isActive = pIdx === curIdx;
          return (
            <div key={p.key} className="flex items-center gap-1.5">
              {i > 0 && <div className={`h-0.5 w-4 rounded-full ${isDone || isActive ? 'bg-[#628ECB]/40' : 'bg-[#D5DEEF]'}`} />}
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black transition-all ${isActive ? 'bg-[#395886] text-white' : isDone ? 'bg-[#10B981]/15 text-[#10B981]' : 'bg-[#D5DEEF] text-[#395886]/40'}`}>
                {isDone ? `✓ ${p.label}` : p.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Two-panel */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="w-full lg:flex-[3] bg-white rounded-2xl border-2 border-[#D5DEEF] shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#D5DEEF]/60">
            <div className="h-5 w-5 rounded-md bg-[#628ECB]/10 flex items-center justify-center"><Activity className="w-3 h-3 text-[#628ECB]" /></div>
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#628ECB]">Interactive Canvas</p>
          </div>
          {renderCanvas()}
        </div>
        <div className="w-full lg:flex-[2] bg-white rounded-2xl border-2 border-[#D5DEEF] shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#D5DEEF]/60">
            <div className="h-5 w-5 rounded-md bg-[#F59E0B]/10 flex items-center justify-center"><BookOpen className="w-3 h-3 text-[#F59E0B]" /></div>
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#F59E0B]">Tutorial Guide</p>
          </div>
          {renderGuide()}
        </div>
      </div>
    </div>
  );
}

// ─── ModelingStageOriginal (Lesson 1) ─────────────────────────────────────────

const MAGIC_SCALE_BITS = [128, 64, 32, 16, 8, 4, 2, 1] as const;
const MAGIC_SCALE_TARGET = 192;

function ModelingLesson3({
  lessonId,
  stageIndex,
  onComplete,
  title = 'The 8-Bit Magic Scale',
  description,
  objectiveCode = 'X.IP.6',
  activityNumber,
  onTrackerPhase,
}: ModelingStageProps) {
  const tracker = useActivityTracker({ lessonId, stageIndex, stageType: 'modeling' });

  const [showIntro, setShowIntro] = useState(true);
  const [phase, setPhase] = useState<'simulation' | 'reflection'>('simulation');
  const [mode, setMode] = useState<'decToBin' | 'binToDec'>('decToBin');
  const [activeBitIndex, setActiveBitIndex] = useState(0);
  const [bits, setBits] = useState<Array<0 | 1 | null>>(Array(8).fill(null));
  const [remainder, setRemainder] = useState(MAGIC_SCALE_TARGET);
  const [stepFeedback, setStepFeedback] = useState<{ type: 'success' | 'error' | 'info'; title: string; text: string } | null>(null);
  const [checkpointOpen, setCheckpointOpen] = useState(false);
  const [checkpointSeen, setCheckpointSeen] = useState(false);
  const [checkpointText, setCheckpointText] = useState('');
  const [reverseStepIndex, setReverseStepIndex] = useState(0);
  const [reverseTotal, setReverseTotal] = useState(0);
  const [reverseFeedback, setReverseFeedback] = useState<{ title: string; text: string } | null>(null);
  const [conclusionText, setConclusionText] = useState('');
  const [isSubmittingConclusion, setIsSubmittingConclusion] = useState(false);
  const [isRestored, setIsRestored] = useState(false);

  const isDecimalModeDone = activeBitIndex >= MAGIC_SCALE_BITS.length && bits.every((bit) => bit !== null);
  const binaryResult = bits.map((bit) => bit ?? 0).join('');
  const checkpointWordCount = checkpointText.trim().split(/\s+/).filter(Boolean).length;
  const hasReverseAccess =
    checkpointWordCount >= 10 || mode === 'binToDec' || reverseStepIndex > 0 || phase === 'reflection';
  const canOpenReverseMode = isDecimalModeDone && !checkpointOpen && hasReverseAccess;
  const isReverseDone = reverseStepIndex >= MAGIC_SCALE_BITS.length;
  const logicalPhase: 'consistency' | 'arguing' | 'conclusion' =
    phase === 'reflection' ? 'conclusion' : checkpointOpen ? 'arguing' : 'consistency';

  useEffect(() => {
    onTrackerPhase?.(logicalPhase);
  }, [logicalPhase, onTrackerPhase]);

  useEffect(() => {
    if (!tracker.isLoading && !isRestored) {
      const snap = tracker.session?.latestSnapshot;
      if (snap) {
        if (typeof snap.showIntro === 'boolean') setShowIntro(snap.showIntro);
        if (snap.phase === 'simulation' || snap.phase === 'reflection') setPhase(snap.phase);
        if (snap.mode === 'decToBin' || snap.mode === 'binToDec') setMode(snap.mode);
        if (typeof snap.activeBitIndex === 'number') setActiveBitIndex(snap.activeBitIndex);
        if (Array.isArray(snap.bits) && snap.bits.length === 8) {
          setBits(snap.bits as Array<0 | 1 | null>);
        }
        if (typeof snap.remainder === 'number') setRemainder(snap.remainder);
        if (snap.stepFeedback) setStepFeedback(snap.stepFeedback);
        if (typeof snap.checkpointOpen === 'boolean') setCheckpointOpen(snap.checkpointOpen);
        if (typeof snap.checkpointSeen === 'boolean') setCheckpointSeen(snap.checkpointSeen);
        if (typeof snap.checkpointText === 'string') setCheckpointText(snap.checkpointText);
        if (typeof snap.reverseStepIndex === 'number') setReverseStepIndex(snap.reverseStepIndex);
        if (typeof snap.reverseTotal === 'number') setReverseTotal(snap.reverseTotal);
        if (snap.reverseFeedback) setReverseFeedback(snap.reverseFeedback);
        if (typeof snap.conclusionText === 'string') setConclusionText(snap.conclusionText);
      }
      setIsRestored(true);
    }
  }, [isRestored, tracker.isLoading, tracker.session?.latestSnapshot]);

  useEffect(() => {
    const progressPercent = showIntro
      ? 5
      : phase === 'simulation'
      ? mode === 'decToBin'
        ? Math.min(72, 12 + Math.round((activeBitIndex / MAGIC_SCALE_BITS.length) * 45))
        : Math.min(88, 52 + Math.round((reverseStepIndex / MAGIC_SCALE_BITS.length) * 30))
      : 92;

    void tracker.saveSnapshot(
      {
        showIntro,
        phase,
        mode,
        activeBitIndex,
        bits,
        remainder,
        stepFeedback,
        checkpointOpen,
        checkpointSeen,
        checkpointText,
        reverseStepIndex,
        reverseTotal,
        reverseFeedback,
        conclusionText,
      },
      { progressPercent },
    );
  }, [
    activeBitIndex,
    bits,
    checkpointOpen,
    checkpointSeen,
    checkpointText,
    conclusionText,
    mode,
    phase,
    remainder,
    reverseFeedback,
    reverseStepIndex,
    reverseTotal,
    showIntro,
    stepFeedback,
    tracker,
  ]);

  const handleDecision = (selectedBit: 0 | 1) => {
    if (showIntro || phase !== 'simulation' || mode !== 'decToBin' || checkpointOpen || isDecimalModeDone) return;

    const weight = MAGIC_SCALE_BITS[activeBitIndex];
    const shouldBeOne = remainder >= weight;

    if ((selectedBit === 1) !== shouldBeOne) {
      setStepFeedback({
        type: 'error',
        title: 'Keputusan belum tepat',
        text: shouldBeOne
          ? `Sisa angka ${remainder} masih cukup untuk mengambil bobot ${weight}, jadi bit ini harus bernilai 1.`
          : `Sisa angka ${remainder} lebih kecil dari bobot ${weight}, jadi bit ini harus bernilai 0.`,
      });
      return;
    }

    const nextBits = [...bits];
    nextBits[activeBitIndex] = selectedBit;
    const nextRemainder = selectedBit === 1 ? remainder - weight : remainder;
    const nextIndex = activeBitIndex + 1;

    setBits(nextBits);
    setRemainder(nextRemainder);
    setActiveBitIndex(nextIndex);
    setStepFeedback({
      type: selectedBit === 1 ? 'success' : 'info',
      title: selectedBit === 1 ? 'Bit 1 dinyalakan' : 'Bit 0 dipertahankan',
      text:
        selectedBit === 1
          ? `Bobot ${weight} dipakai, jadi karung Miko berkurang menjadi ${nextRemainder}.`
          : `Bobot ${weight} tidak dipakai karena sisa ${remainder} tidak cukup untuk dikurangi lagi.`,
    });

    if (nextRemainder === 0 && nextIndex < MAGIC_SCALE_BITS.length && !checkpointSeen) {
      setCheckpointSeen(true);
      setCheckpointOpen(true);
    }
  };

  const handleCheckpointSubmit = () => {
    if (checkpointWordCount < 10) return;
    setCheckpointOpen(false);
    setStepFeedback({
      type: 'success',
      title: 'Argumen logismu tersimpan',
      text: isDecimalModeDone
        ? 'Mode desimal ke biner sudah lengkap. Sekarang kamu bisa lanjut ke biner ke desimal.'
        : 'Lanjutkan bit berikutnya. Karena sisa angka sudah 0, semua bobot setelahnya pasti bernilai 0.',
    });
    if (isDecimalModeDone) {
      setMode('binToDec');
    }
  };

  const handleReverseAdvance = () => {
    if (phase !== 'simulation' || mode !== 'binToDec' || isReverseDone) return;

    const weight = MAGIC_SCALE_BITS[reverseStepIndex];
    const isActiveBit = (bits[reverseStepIndex] ?? 0) === 1;
    const nextTotal = isActiveBit ? reverseTotal + weight : reverseTotal;
    const nextIndex = reverseStepIndex + 1;

    setReverseTotal(nextTotal);
    setReverseStepIndex(nextIndex);
    setReverseFeedback({
      title: isActiveBit ? `Bobot ${weight} ditambahkan` : `Bobot ${weight} dilewati`,
      text: isActiveBit
        ? `Bit bernilai 1, jadi jumlah desimal bertambah menjadi ${nextTotal}.`
        : `Bit bernilai 0, jadi total tetap ${nextTotal}.`,
    });
  };

  const handleConclusionSubmit = async (text: string) => {
    if (isSubmittingConclusion) return;

    setIsSubmittingConclusion(true);
    const finalAnswer = {
      targetDecimal: MAGIC_SCALE_TARGET,
      binaryResult,
      bitDecisions: MAGIC_SCALE_BITS.map((weight, index) => ({
        weight,
        bit: bits[index] ?? 0,
      })),
      checkpointArgument: checkpointText.trim(),
      reverseConversion: {
        binary: binaryResult,
        decimal: reverseTotal,
        processedSteps: reverseStepIndex,
      },
      conclusion: text,
    };

    try {
      await tracker.complete(finalAnswer, {
        completed: true,
        phase: 'reflection',
        mode,
        activeBitIndex,
        bits,
        remainder,
        checkpointText,
        reverseStepIndex,
        reverseTotal,
        binaryResult,
        conclusionText: text,
      });
      setConclusionText(text);
      onComplete(finalAnswer);
    } catch (error) {
      console.error('[ModelingLesson3] failed to save conclusion:', error);
      setIsSubmittingConclusion(false);
    }
  };

  const completedSteps = bits.filter((bit) => bit !== null).length;
  const currentWeight = !isDecimalModeDone ? MAGIC_SCALE_BITS[activeBitIndex] : null;
  const shouldCurrentBitBeOne = currentWeight !== null ? remainder >= currentWeight : false;
  const activeReverseWeight = !isReverseDone ? MAGIC_SCALE_BITS[reverseStepIndex] : null;
  const activeReverseBit = activeReverseWeight !== null ? bits[reverseStepIndex] ?? 0 : 0;
  const processedReverseWeights = MAGIC_SCALE_BITS.slice(0, reverseStepIndex);
  const activeReverseContributors = processedReverseWeights.filter((_, index) => (bits[index] ?? 0) === 1);
  const reverseBreakdownText = activeReverseContributors.length > 0
    ? `${activeReverseContributors.join(' + ')} = ${reverseTotal}`
    : reverseStepIndex > 0
    ? `Belum ada bobot aktif yang ditambahkan. Total masih ${reverseTotal}.`
    : 'Belum ada bobot yang dijumlahkan. Mulai dari bit 128 terlebih dahulu.';
  const phaseSteps = [
    {
      key: 'consistency',
      title: 'Keruntutan Berpikir',
      desc: mode === 'decToBin' ? `${completedSteps}/8 bit diproses berurutan` : `${reverseStepIndex}/8 bit dijumlahkan`,
    },
    {
      key: 'arguing',
      title: 'Kemampuan Berargumen',
      desc: checkpointText ? 'Argumen checkpoint sudah tersimpan' : 'Checkpoint logis akan muncul saat sisa angka menjadi 0',
    },
    {
      key: 'conclusion',
      title: 'Penarikan Kesimpulan',
      desc: conclusionText ? 'Kesimpulan akhir sudah tersimpan' : 'Kesimpulan akhir dibuka setelah dua mode selesai',
    },
  ] as const;

  const guideTitle =
    phase === 'reflection'
      ? 'Penarikan Kesimpulan'
      : checkpointOpen
      ? 'Checkpoint Tantangan Miko'
      : mode === 'decToBin'
      ? `Mode Desimal ke Biner - Langkah ${Math.min(activeBitIndex + 1, 8)}`
      : `Mode Biner ke Desimal - Langkah ${Math.min(reverseStepIndex + 1, 8)}`;

  const guideText =
    phase === 'reflection'
      ? 'Gunakan kotak kesimpulan yang sama seperti pertemuan sebelumnya untuk merangkum hubungan dua arah antara desimal dan biner.'
      : checkpointOpen
      ? 'Miko berhenti sejenak untuk memastikan kamu memahami alasan logis mengapa bit berikutnya otomatis bernilai 0.'
      : mode === 'decToBin'
      ? currentWeight === null
        ? 'Mode pertama selesai. Sekarang kamu bisa membalik hasil biner kembali menjadi desimal.'
        : shouldCurrentBitBeOne
        ? `Bandingkan sisa angka ${remainder} dengan bobot ${currentWeight}. Karena sisa masih cukup, pilih 1 lalu kurangi.`
        : `Bandingkan sisa angka ${remainder} dengan bobot ${currentWeight}. Karena sisa lebih kecil, bit ini harus 0.`
      : activeReverseWeight === null
      ? 'Semua bobot sudah dijumlahkan. Hasil akhirnya harus kembali menjadi 192.'
      : activeReverseBit === 1
      ? `Bit ${activeReverseWeight} bernilai 1, jadi bobot ini perlu ditambahkan ke total desimal.`
      : `Bit ${activeReverseWeight} bernilai 0, jadi bobot ini dilewati dan total tidak berubah.`;

  if (showIntro) {
    return (
      <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-2xl border-2 border-[#628ECB]/20 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[#628ECB]/10 to-transparent border-b border-[#628ECB]/20">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#628ECB]/15">
              <BookOpen className="w-5 h-5 text-[#628ECB]" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-widest text-[#628ECB]">
                Aktivitas {activityNumber || 8} - {objectiveCode}
              </p>
              <h3 className="text-base font-bold text-[#395886]">{title}</h3>
            </div>
          </div>

          <div className="px-5 py-5 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-[#628ECB]/5 rounded-xl border border-[#628ECB]/15">
              <Lightbulb className="w-5 h-5 text-[#628ECB] mt-0.5 shrink-0" />
              <p className="text-sm text-[#395886]/80 leading-relaxed">
                {description ||
                  'Kamu akan membantu Miko mengubah angka desimal 192 menjadi biner 8-bit melalui simulasi yang runtut. Fokusnya bukan hanya hasil 11000000, tetapi alasan logis di balik setiap keputusan bit.'}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {[
                { title: 'Keruntutan Berpikir', desc: 'Bandingkan bobot bit dari kiri ke kanan secara terkunci.', color: '#628ECB' },
                { title: 'Kemampuan Berargumen', desc: 'Jelaskan mengapa bit setelah sisa 0 harus bernilai 0.', color: '#F59E0B' },
                { title: 'Penarikan Kesimpulan', desc: 'Rangkum aturan umum konversi 8-bit IPv4.', color: '#10B981' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border p-4"
                  style={{ backgroundColor: `${item.color}0D`, borderColor: `${item.color}30` }}
                >
                  <div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: item.color }}>
                    {item.title}
                  </div>
                  <div className="text-sm text-[#395886]/75 leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-[#D5DEEF] bg-[#F8FAFF] p-4">
              <div className="flex flex-wrap items-center gap-2">
                {MAGIC_SCALE_BITS.map((bit) => (
                  <div
                    key={bit}
                    className="min-w-[54px] rounded-xl border border-[#628ECB]/20 bg-white px-3 py-2 text-center shadow-sm"
                  >
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]/60">Bit</div>
                    <div className="text-sm font-bold text-[#395886]">{bit}</div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm text-[#395886]/70 leading-relaxed">
                Miko akan mengosongkan karung angka <span className="font-bold text-[#395886]">192</span> dengan
                memeriksa bobot 128, lalu 64, kemudian 32, dan seterusnya sampai 1.
              </p>
            </div>

            <button
              onClick={() => setShowIntro(false)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#395886] to-[#628ECB] text-white font-bold text-sm hover:opacity-90 transition-all shadow-md shadow-[#628ECB]/20 active:scale-95"
            >
              Mulai The 8-Bit Magic Scale <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'reflection') {
    return (
      <div className="w-full space-y-5 animate-in fade-in duration-500">
        <div className="rounded-2xl border-2 border-[#D5DEEF] bg-white px-4 py-3 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#628ECB]/65">Progress Modeling</p>
              <h3 className="text-sm font-bold text-[#395886]">Konversi IPv4 Dua Arah</h3>
            </div>
            <div className="grid gap-2 lg:grid-cols-3 xl:min-w-[620px]">
              {phaseSteps.map((item, index) => {
                const isActive = logicalPhase === item.key;
                const isDone = item.key === 'consistency'
                  ? isDecimalModeDone && isReverseDone
                  : item.key === 'arguing'
                  ? checkpointWordCount >= 10
                  : !!conclusionText;
                return (
                  <div
                    key={item.key}
                    className={`rounded-xl border px-3 py-2.5 transition-all ${isActive ? 'border-[#628ECB]/40 bg-[#EEF4FF]' : isDone ? 'border-[#10B981]/25 bg-[#ECFDF5]' : 'border-[#D5DEEF] bg-[#F8FAFF]'}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-black ${
                        isDone ? 'bg-[#10B981] text-white' : isActive ? 'bg-[#628ECB] text-white' : 'bg-[#E2E8F0] text-[#64748B]'
                      }`}>
                        {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#395886]">{item.title}</div>
                        <p className="text-[11px] text-[#395886]/60 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <ATPConclusionBox
          atpBehavior="mampu mensimulasikan konversi alamat IPv4 dari desimal ke biner dan dari biner ke desimal secara sistematis"
          objectiveCode={objectiveCode}
          stageType="modeling"
          defaultValue={conclusionText}
          disabled={!!conclusionText || isSubmittingConclusion}
          minWords={12}
          onSubmit={(text) => { void handleConclusionSubmit(text); }}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-500">
      <div className="rounded-2xl border-2 border-[#D5DEEF] bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#628ECB]/65">Progress Modeling</p>
            <h3 className="text-sm font-bold text-[#395886]">Konversi IPv4 Dua Arah</h3>
          </div>
          <div className="grid gap-2 lg:grid-cols-3 xl:min-w-[620px]">
            {phaseSteps.map((item, index) => {
              const isActive = logicalPhase === item.key;
              const isDone = item.key === 'consistency'
                ? isDecimalModeDone && isReverseDone
                : item.key === 'arguing'
                ? checkpointWordCount >= 10
                : !!conclusionText;
              return (
                <div
                  key={item.key}
                  className={`rounded-xl border px-3 py-2.5 transition-all ${isActive ? 'border-[#628ECB]/40 bg-[#EEF4FF]' : isDone ? 'border-[#10B981]/25 bg-[#ECFDF5]' : 'border-[#D5DEEF] bg-[#F8FAFF]'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-black ${
                      isDone ? 'bg-[#10B981] text-white' : isActive ? 'bg-[#628ECB] text-white' : 'bg-[#E2E8F0] text-[#64748B]'
                    }`}>
                      {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : index + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#395886]">{item.title}</div>
                      <p className="text-[11px] text-[#395886]/60 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-[#D5DEEF] shadow-sm overflow-hidden">
        <div className="flex flex-col gap-4 px-5 py-4 border-b border-[#D5DEEF] bg-gradient-to-r from-[#628ECB]/10 to-transparent xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-black uppercase tracking-widest text-[#628ECB]">Modeling Step-by-Step</p>
            <h3 className="text-base font-bold text-[#395886]">Bantu Miko Mengosongkan Karung Angka</h3>
          </div>
          <div className="flex w-full flex-col gap-3 xl:w-auto xl:items-end">
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#D5DEEF] bg-white p-1">
            <button
              onClick={() => setMode('decToBin')}
              disabled={phase === 'reflection'}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${mode === 'decToBin' ? 'bg-[#395886] text-white shadow-sm' : 'text-[#395886]/70 hover:bg-[#F1F5F9]'}`}
            >
              Desimal ke Biner
            </button>
            <button
              onClick={() => canOpenReverseMode && setMode('binToDec')}
              disabled={!canOpenReverseMode || phase === 'reflection'}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                mode === 'binToDec'
                  ? 'bg-[#10B981] text-white shadow-sm'
                  : canOpenReverseMode
                  ? 'text-[#395886]/70 hover:bg-[#F1F5F9]'
                  : 'text-[#94A3B8] cursor-not-allowed'
              }`}
            >
              Biner ke Desimal
            </button>
          </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-[#628ECB]/20 bg-white px-4 py-3 shadow-sm">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#628ECB]/60">
                  {mode === 'decToBin' ? 'Sisa Angka' : isReverseDone ? 'Hasil Desimal' : 'Total Sementara'}
                </div>
                <div className="mt-1 text-2xl font-black text-[#395886]">
                  {mode === 'decToBin' ? remainder : reverseTotal}
                </div>
              </div>
              <div className="rounded-2xl border border-[#10B981]/20 bg-white px-4 py-3 shadow-sm">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#10B981]/70">Hasil Biner</div>
                <div className="mt-1 text-xl font-black tracking-[0.22em] text-[#395886]">{binaryResult}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-4 lg:p-5 xl:grid-cols-[minmax(0,1.9fr)_320px]">
          <div className="rounded-3xl border-2 border-[#D5DEEF] bg-[#F8FAFF] p-5 lg:p-6">
            <div className="mb-5 flex flex-col gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#628ECB]">The 8-Bit Magic Scale</p>
                <p className="text-sm leading-relaxed text-[#395886]/78">
                  {mode === 'decToBin'
                    ? 'Bandingkan angka dengan bobot bit dari kiri ke kanan.'
                    : 'Jumlahkan bobot bit aktif untuk kembali ke nilai desimal.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {MAGIC_SCALE_BITS.map((weight, index) => {
                const bitValue = bits[index];
                const isActive = phase === 'simulation' && !checkpointOpen && (
                  mode === 'decToBin' ? index === activeBitIndex : index === reverseStepIndex
                );
                const isDone = mode === 'decToBin' ? bitValue !== null : index < reverseStepIndex;
                const isLocked = mode === 'decToBin' ? !isDone && index > activeBitIndex : false;
                const cardTone =
                  mode === 'binToDec' && (bitValue ?? 0) === 1
                    ? 'border-[#10B981]/35 bg-[#ECFDF5]'
                    : isActive
                    ? 'border-[#628ECB] bg-white'
                    : isDone && bitValue === 1
                    ? 'border-[#10B981]/30 bg-[#ECFDF5]'
                    : 'border-[#D5DEEF] bg-white';
                return (
                  <motion.div
                    key={weight}
                    layout
                    animate={{
                      y: isActive ? -6 : 0,
                      boxShadow: isActive ? '0 18px 36px rgba(98,142,203,0.18)' : '0 8px 20px rgba(57,88,134,0.08)',
                      scale: isActive ? 1.02 : 1,
                    }}
                    className={`rounded-3xl border-2 p-4 lg:p-5 transition-all ${cardTone}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-widest text-[#628ECB]/70">Bit</span>
                      {isLocked ? <Lock className="w-3.5 h-3.5 text-[#395886]/25" /> : null}
                    </div>
                    <div className="mt-3 rounded-2xl border border-[#D5DEEF] bg-[#F8FAFF] px-2 py-4 text-center">
                      <div className="text-[28px] font-black leading-none text-[#395886]">{weight}</div>
                    </div>
                    <div className={`mt-3 rounded-2xl px-3 py-3 text-center text-xl font-black ${
                      bitValue === 1
                        ? 'bg-[#10B981] text-white'
                        : bitValue === 0
                        ? 'bg-[#E2E8F0] text-[#395886]'
                        : isActive
                        ? 'bg-[#628ECB]/10 text-[#628ECB]'
                        : 'bg-[#F3F4F6] text-[#9CA3AF]'
                    }`}>
                      {bitValue ?? (mode === 'decToBin' ? '?' : 0)}
                    </div>
                    <p className="mt-2 text-center text-xs font-semibold leading-relaxed text-[#395886]/65">
                      {mode === 'decToBin'
                        ? bitValue === 1
                          ? `Dipakai: -${weight}`
                          : bitValue === 0
                          ? 'Tidak dipakai'
                          : isActive
                          ? 'Sedang diproses'
                          : 'Menunggu giliran'
                        : (bitValue ?? 0) === 1
                        ? `Aktif: +${weight}`
                        : 'Lewati'}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-5 rounded-3xl border border-[#628ECB]/15 bg-white p-4 lg:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-[#628ECB]/10 flex items-center justify-center text-2xl shrink-0">
                    🎒
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-[#628ECB]">
                      {mode === 'decToBin' ? 'Karung Angka Miko' : 'Kalkulator Bobot Miko'}
                    </div>
                    <div className="text-sm leading-relaxed text-[#395886]/78">
                      {mode === 'decToBin'
                        ? isDecimalModeDone
                          ? 'Mode pertama selesai. Hasil binernya siap dibalik lagi ke desimal.'
                          : currentWeight !== null
                          ? `Bandingkan sisa ${remainder} dengan bobot ${currentWeight}.`
                          : 'Periksa hasil binermu.'
                        : isReverseDone
                        ? 'Semua bobot aktif sudah dijumlahkan. Hasil akhirnya kembali menjadi 192.'
                        : activeReverseWeight !== null
                        ? `Periksa bit ${activeReverseWeight}. ${activeReverseBit === 1 ? 'Tambahkan bobotnya ke total sementara.' : 'Lewati karena bit bernilai 0, jadi total sementara tidak berubah.'}`
                        : 'Periksa hasil desimalmu.'}
                    </div>
                  </div>
                </div>

                {phase === 'simulation' && mode === 'decToBin' && !isDecimalModeDone && currentWeight !== null && (
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <button
                      onClick={() => handleDecision(1)}
                      disabled={checkpointOpen}
                      className="px-4 py-3 rounded-2xl bg-[#10B981] text-white text-sm font-bold shadow-sm hover:bg-[#059669] transition-all active:scale-95 disabled:opacity-40"
                    >
                      Pilih 1
                    </button>
                    <button
                      onClick={() => handleDecision(0)}
                      disabled={checkpointOpen}
                      className="px-4 py-3 rounded-2xl bg-[#E2E8F0] text-[#395886] text-sm font-bold shadow-sm hover:bg-[#CBD5E1] transition-all active:scale-95 disabled:opacity-40"
                    >
                      Pilih 0
                    </button>
                  </div>
                )}

                {phase === 'simulation' && mode === 'binToDec' && !isReverseDone && (
                  <button
                    onClick={handleReverseAdvance}
                    className="w-full px-4 py-3 rounded-2xl bg-[#10B981] text-white text-sm font-bold shadow-sm hover:bg-[#059669] transition-all active:scale-95 sm:w-auto"
                  >
                    {activeReverseBit === 1 ? `Tambah ${activeReverseWeight}` : `Lewati ${activeReverseWeight}`}
                  </button>
                )}
              </div>
            </div>

            {stepFeedback && (
              <div
                className={`mt-4 rounded-2xl border px-4 py-3 ${
                  stepFeedback.type === 'error'
                    ? 'border-[#FCA5A5] bg-[#FEF2F2]'
                    : stepFeedback.type === 'success'
                    ? 'border-[#86EFAC] bg-[#ECFDF5]'
                    : 'border-[#BFDBFE] bg-[#EFF6FF]'
                }`}
              >
                <div className="text-sm font-bold text-[#395886]">{stepFeedback.title}</div>
                <p className="mt-1 text-sm text-[#395886]/75 leading-relaxed">{stepFeedback.text}</p>
              </div>
            )}

            {mode === 'binToDec' && reverseFeedback && (
              <div className="mt-4 rounded-2xl border border-[#10B981]/20 bg-[#ECFDF5] p-4">
                <div className="text-sm font-bold text-[#065F46]">{reverseFeedback.title}</div>
                <p className="mt-1 text-sm text-[#065F46]/80 leading-relaxed">{reverseFeedback.text}</p>
              </div>
            )}

            {mode === 'binToDec' && (
              <div className="mt-4 rounded-2xl border border-[#628ECB]/15 bg-white p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]/60">Rincian Penjumlahan</div>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-[#395886]">{reverseBreakdownText}</p>
                {!isReverseDone && activeReverseWeight !== null && (
                  <p className="mt-2 text-xs leading-relaxed text-[#395886]/65">
                    Langkah aktif: bit {activeReverseWeight} bernilai {activeReverseBit}.{' '}
                    {activeReverseBit === 1
                      ? 'Jika kamu lanjutkan, bobot ini akan ditambahkan ke total sementara.'
                      : 'Karena bernilai 0, bobot ini hanya dilewati dan total sementara tetap sama.'}
                  </p>
                )}
              </div>
            )}

            {isDecimalModeDone && mode === 'decToBin' && phase === 'simulation' && (
              <div className="mt-4 rounded-2xl border-2 border-[#10B981]/25 bg-gradient-to-r from-[#ECFDF5] to-white p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-[#10B981]">Mode 1 Selesai</div>
                    <div className="text-base font-bold text-[#065F46]">192 berhasil dikonversi menjadi {binaryResult}</div>
                    <p className="mt-1 text-sm text-[#065F46]/80">
                      Lanjutkan ke mode biner ke desimal untuk membuktikan hubungan dua arah.
                    </p>
                  </div>
                  <button
                    onClick={() => setMode('binToDec')}
                    disabled={!canOpenReverseMode}
                    className={`px-5 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                      canOpenReverseMode
                        ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-sm hover:opacity-90'
                        : 'bg-[#E5E7EB] text-[#395886]/35 cursor-not-allowed'
                    }`}
                  >
                      Lanjut ke Biner ke Desimal
                  </button>
                </div>
              </div>
            )}

            {mode === 'binToDec' && isReverseDone && phase === 'simulation' && (
              <div className="mt-4 rounded-2xl border-2 border-[#10B981]/25 bg-gradient-to-r from-[#ECFDF5] to-white p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-[#10B981]">Mode 2 Selesai</div>
                    <div className="text-base font-bold text-[#065F46]">{binaryResult} berhasil dijumlahkan kembali menjadi {reverseTotal}</div>
                    <p className="mt-1 text-sm text-[#065F46]/80">
                      Sekarang simpulkan hubungan dua arah antara bentuk desimal dan bentuk biner.
                    </p>
                  </div>
                  <button
                    onClick={() => setPhase('reflection')}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-sm font-bold shadow-sm hover:opacity-90 transition-all active:scale-95"
                  >
                    Lanjut ke Penarikan Kesimpulan
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border-2 border-[#D5DEEF] bg-white p-4 lg:p-5 space-y-3 xl:space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#D5DEEF]">
              <div className="h-10 w-10 rounded-2xl bg-[#F59E0B]/12 flex items-center justify-center text-xl">🧭</div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F59E0B]">Panel Panduan Miko</p>
                <h4 className="text-sm font-bold text-[#395886]">{guideTitle}</h4>
              </div>
            </div>

            <div className="rounded-2xl border border-[#F59E0B]/20 bg-[#FFFBEB] p-4">
              <p className="text-sm text-[#78350F] leading-relaxed">{guideText}</p>
            </div>

            <div className="grid gap-3">
              <div className="rounded-2xl border border-[#D5DEEF] bg-[#F8FAFF] p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]/60">Status Saat Ini</div>
                <div className="mt-2 text-sm font-semibold leading-relaxed text-[#395886]">
                  {mode === 'decToBin'
                    ? isDecimalModeDone
                      ? `Semua bit selesai dipilih. Hasilnya ${binaryResult}.`
                      : `Sedang memproses bobot ${currentWeight} dengan sisa angka ${remainder}.`
                    : isReverseDone
                    ? `Semua bit sudah dijumlahkan. Total akhir ${reverseTotal}.`
                    : `Sedang memproses bobot ${activeReverseWeight} dengan total sementara ${reverseTotal}.`}
                </div>
              </div>

              <div className="rounded-2xl border border-[#D5DEEF] bg-[#F8FAFF] p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]/60">Alur Berpikir</div>
                <ol className="mt-2 space-y-2 text-sm text-[#395886]/76 leading-relaxed">
                  {mode === 'decToBin' ? (
                    <>
                      <li>1. Mulai dari bobot terbesar, yaitu 128.</li>
                      <li>2. Jika sisa angka masih cukup, pilih 1 lalu kurangi.</li>
                      <li>3. Jika sisa angka lebih kecil, pilih 0 dan lanjut ke bobot berikutnya.</li>
                      <li>4. Setelah sisa menjadi 0, semua bobot sisanya akan bernilai 0.</li>
                    </>
                  ) : (
                    <>
                      <li>1. Baca bit dari kiri ke kanan pada hasil 11000000.</li>
                      <li>2. Jika bit bernilai 1, tambahkan bobotnya ke total.</li>
                      <li>3. Jika bit bernilai 0, lewati bobot tersebut.</li>
                      <li>4. Jumlah akhir harus kembali ke nilai desimal semula.</li>
                    </>
                  )}
                </ol>
              </div>

              <div className="rounded-2xl border border-[#D5DEEF] bg-white p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]/60">Ringkasan Cepat</div>
                <div className="mt-2 grid gap-2">
                  <div className="rounded-xl bg-[#F8FAFF] px-3 py-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]/60">Biner</div>
                    <div className="text-base font-bold text-[#395886] tracking-[0.18em]">{binaryResult}</div>
                  </div>
                  <div className="rounded-xl bg-[#F8FAFF] px-3 py-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]/60">
                      {mode === 'binToDec' && !isReverseDone ? 'Total Sementara' : 'Desimal'}
                    </div>
                    <div className="text-base font-bold text-[#395886]">{mode === 'binToDec' ? reverseTotal : MAGIC_SCALE_TARGET}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {checkpointOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/35 px-4 backdrop-blur-[1px]">
          <div className="w-full max-w-xl rounded-3xl border-2 border-[#F59E0B]/25 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[#F59E0B]/12 to-transparent border-b border-[#F59E0B]/15">
              <div className="h-10 w-10 rounded-2xl bg-[#F59E0B]/15 flex items-center justify-center text-xl">🕵️</div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F59E0B]">Checkpoint Tantangan Miko</p>
                <h4 className="text-sm font-bold text-[#395886]">Mengapa bit berikutnya otomatis bernilai 0?</h4>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-2xl border border-[#F59E0B]/20 bg-[#FFFBEB] p-4">
                <p className="text-sm text-[#78350F] leading-relaxed">
                  Sisa karung Miko sekarang <span className="font-bold">0</span>. Saat Miko mencoba memasukkan angka 0 ke
                  bobot berikutnya <span className="font-bold">{MAGIC_SCALE_BITS[activeBitIndex]}</span>, timbangan langsung
                  menolak: <span className="font-bold">Zonk!</span>
                </p>
              </div>

              <div className="rounded-2xl border border-[#D5DEEF] bg-[#F8FAFF] p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]/60">Mini Simulasi</div>
                <div className="mt-3 flex items-center justify-between rounded-2xl border border-[#D5DEEF] bg-white px-4 py-3">
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-[#628ECB]/60">Sisa angka</div>
                    <div className="text-lg font-black text-[#395886]">0</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#F59E0B]" />
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-[#628ECB]/60">Bit berikutnya</div>
                    <div className="text-lg font-black text-[#395886]">{MAGIC_SCALE_BITS[activeBitIndex]}</div>
                  </div>
                </div>
                <div className="mt-3 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2 text-sm font-bold text-[#B91C1C]">
                  Zonk! 0 tidak cukup untuk mengurangi bobot berikutnya.
                </div>
              </div>

              <div className="rounded-2xl border border-[#D5DEEF] bg-white p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B]">Argumen Logis</div>
                <p className="mt-2 text-sm text-[#395886]/75 leading-relaxed">
                  Jelaskan singkat mengapa bit berikutnya wajib bernilai 0 dan apa hubungan sisa angka dengan nilai bit.
                </p>
                <textarea
                  value={checkpointText}
                  onChange={(event) => setCheckpointText(event.target.value)}
                  rows={4}
                  className="mt-3 w-full rounded-2xl border-2 border-[#D5DEEF] p-4 text-sm text-[#395886] outline-none transition-all resize-none focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/10"
                  placeholder="Tuliskan argumenmu di sini... (minimal 10 kata)"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className={`text-[11px] font-bold ${checkpointWordCount >= 10 ? 'text-[#10B981]' : 'text-[#395886]/45'}`}>
                    {checkpointWordCount} / 10 kata
                  </span>
                  <button
                    onClick={handleCheckpointSubmit}
                    disabled={checkpointWordCount < 10}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                      checkpointWordCount >= 10
                        ? 'bg-[#F59E0B] text-white hover:bg-[#D97706]'
                        : 'bg-[#E5E7EB] text-[#395886]/35 cursor-not-allowed'
                    }`}
                  >
                    Simpan Argumen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function ModelingStageOriginal({
  lessonId,
  stageIndex,
  onComplete,
  title = 'Laboratorium Virtual TCP/IP',
  description,
  objectiveCode = 'X.TCP.8',
  activityNumber,
}: ModelingStageProps) {
  const tracker = useActivityTracker({
    lessonId,
    stageIndex,
    stageType: 'modeling',
  });
  const [showIntro, setShowIntro] = useState(true);
  const [step, setStep] = useState(0);

  // Step 0
  const [userMessage, setUserMessage] = useState('');
  // Step 1 — TCP drag only (no port/seq)
  const [tcpDropped, setTcpDropped] = useState(false);
  // Step 2 — conceptual destination (no IP numbers)
  const [selectedDest, setSelectedDest] = useState<string | null>(null);
  const [wrongDestId, setWrongDestId] = useState<string | null>(null);
  // Step 3
  const [macToggled, setMacToggled] = useState(false);
  // Step 4
  const [listenState, setListenState] = useState<'idle' | 'listening' | 'clear'>('idle');
  const [listenProgress, setListenProgress] = useState(0);
  const listenIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Step 5
  const [transmitted, setTransmitted] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [bitStream, setBitStream] = useState('');
  // Step 6
  const [macStripped, setMacStripped] = useState(false);
  const [ipStripped, setIpStripped] = useState(false);
  // Step 7
  const [tapCount, setTapCount] = useState(0);
  const [tcpOpened, setTcpOpened] = useState(false);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Argumentation essay
  const [showArgumentEssay, setShowArgumentEssay] = useState(false);
  const [argumentText, setArgumentText] = useState('');
  // Conclusion (Penarikan Kesimpulan) — added for L3 3-indicator summary
  const [showConclusionBox, setShowConclusionBox] = useState(false);
  const [conclusionText, setConclusionText] = useState('');
  // UI
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (listenIntervalRef.current) clearInterval(listenIntervalRef.current);
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  useEffect(() => {
    void tracker.saveSnapshot(
      {
        showIntro,
        step,
        userMessage,
        tcpDropped,
        selectedDest,
        wrongDestId,
        macToggled,
        listenState,
        listenProgress,
        transmitted,
        isTransmitting,
        bitStream,
        macStripped,
        ipStripped,
        tapCount,
        tcpOpened,
        errorMsg,
      },
      { progressPercent: Math.min(100, Math.round((step / 8) * 100)) },
    );
  }, [
    bitStream,
    errorMsg,
    ipStripped,
    isTransmitting,
    lessonId,
    listenProgress,
    listenState,
    macStripped,
    macToggled,
    selectedDest,
    showIntro,
    stageIndex,
    step,
    tapCount,
    tcpDropped,
    tcpOpened,
    tracker,
    transmitted,
    userMessage,
    wrongDestId,
  ]);

  const showError = useCallback((msg: string) => {
    setErrorMsg(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setErrorMsg(null), 3500);
  }, []);

  const isStepDone = (() => {
    switch (step) {
      case 0: return userMessage.trim().length > 2;
      case 1: return tcpDropped;                    // simplified: just drop
      case 2: return selectedDest === 'target';     // simplified: conceptual choice
      case 3: return macToggled;
      case 4: return listenState === 'clear';
      case 5: return transmitted;
      case 6: return macStripped && ipStripped;
      case 7: return tcpOpened;
      case 8: return true;
      default: return false;
    }
  })();

  // Listen hold logic
  const startListen = useCallback(() => {
    if (listenState === 'clear') return;
    setListenState('listening');
    let p = 0;
    listenIntervalRef.current = setInterval(() => {
      p += 5;
      setListenProgress(p);
      if (p >= 100) {
        clearInterval(listenIntervalRef.current!);
        listenIntervalRef.current = null;
        setListenState('clear');
        setListenProgress(100);
      }
    }, 100);
  }, [listenState]);

  const stopListen = useCallback(() => {
    if (listenIntervalRef.current) {
      clearInterval(listenIntervalRef.current);
      listenIntervalRef.current = null;
    }
    if (listenState === 'listening') {
      setListenState('idle');
      setListenProgress(0);
    }
  }, [listenState]);

  // Double-tap TCP open
  const handleTcpTap = () => {
    const next = tapCount + 1;
    setTapCount(next);
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    if (next >= 2) { setTcpOpened(true); setTapCount(0); return; }
    tapTimerRef.current = setTimeout(() => setTapCount(0), 500);
  };

  // Bit transmission
  const startTransmit = () => {
    if (isTransmitting || transmitted) return;
    setIsTransmitting(true);
    const full = '10110100101101001011';
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setBitStream(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(iv);
        setTimeout(() => { setIsTransmitting(false); setTransmitted(true); }, 300);
      }
    }, 80);
  };

  // Destination click (conceptual)
  const handleDestClick = (id: string, correct: boolean) => {
    if (selectedDest) return;
    if (correct) {
      setSelectedDest(id);
    } else {
      setWrongDestId(id);
      showError('Bukan komputer tujuan yang tepat! Data bisa tersesat jika alamat salah.');
      setTimeout(() => setWrongDestId(null), 700);
    }
  };

  const goNext = () => {
    if (!isStepDone) return;
    if (step === 8) {
      setShowArgumentEssay(true);
      return;
    }
    setStep(s => s + 1);
    setErrorMsg(null);
  };
  const goPrev = () => {
    if (step === 0) return;
    setStep(s => s - 1);
    setErrorMsg(null);
  };

  // ── Intro ──────────────────────────────────────────────────────────────────

  if (showIntro) {
    return (
      <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-2xl border-2 border-[#628ECB]/20 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[#628ECB]/10 to-transparent border-b border-[#628ECB]/20">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#628ECB]/15">
              <BookOpen className="w-5 h-5 text-[#628ECB]" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-widest text-[#628ECB]">
                Aktivitas {activityNumber || 8} — {objectiveCode}
              </p>
              <h3 className="text-base font-bold text-[#395886]">{title}</h3>
            </div>
          </div>

          <div className="px-5 py-5 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-[#628ECB]/5 rounded-xl border border-[#628ECB]/15">
              <Lightbulb className="w-5 h-5 text-[#628ECB] mt-0.5 shrink-0" />
              <p className="text-sm text-[#395886]/80 leading-relaxed">
                {description || 'Kamu akan mensimulasikan perjalanan data TCP/IP secara langsung — dari mengetik pesan di PC A hingga pesan diterima utuh di PC B — melalui Enkapsulasi, Transmisi, dan Dekapsulasi.'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Fase 1', desc: 'Enkapsulasi', sub: 'PC A membungkus data', color: '#628ECB' },
                { label: 'Fase 2', desc: 'Transmisi', sub: 'CSMA/CD + Kirim Bit', color: '#EC4899' },
                { label: 'Fase 3', desc: 'Dekapsulasi', sub: 'PC B membuka data', color: '#10B981' },
              ].map(f => (
                <div key={f.label} className="rounded-xl p-3 text-center border" style={{ backgroundColor: `${f.color}0D`, borderColor: `${f.color}30` }}>
                  <div className="text-xs font-black uppercase tracking-widest mb-0.5" style={{ color: f.color }}>{f.label}</div>
                  <div className="text-sm font-bold text-[#395886]">{f.desc}</div>
                  <div className="text-xs text-[#395886]/50 mt-0.5">{f.sub}</div>
                </div>
              ))}
            </div>

            {/* Layer preview */}
            <div className="flex items-center justify-between px-4 py-4 bg-[#F0F3FA] rounded-xl">
              {['App', 'Trans', 'Net', 'Link', 'Phys'].map((l, i, arr) => (
                <div key={l} className="flex items-center gap-1.5">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="h-8 w-8 rounded-full bg-white border-2 border-[#D5DEEF] flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-[#D5DEEF]" />
                    </div>
                    <span className="text-[10px] font-black text-[#395886]/30">{l}</span>
                  </div>
                  {i < arr.length - 1 && <div className="h-px w-5 sm:w-8 bg-[#D5DEEF] mb-4" />}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowIntro(false)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#395886] to-[#628ECB] text-white font-bold text-sm hover:opacity-90 transition-all shadow-md shadow-[#628ECB]/20 active:scale-95"
            >
              Mulai Laboratorium Virtual <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Lab ────────────────────────────────────────────────────────────────────

  const inst = STEP_INSTRUCTIONS[step];

  // ── Workspace per step ────────────────────────────────────────────────────

  const renderWorkspace = () => {

    // ── Step 0: Application Layer ──
    if (step === 0) return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3.5 bg-[#628ECB]/8 rounded-xl border border-[#628ECB]/20">
          <Activity className="w-5 h-5 text-[#628ECB] shrink-0" />
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-[#628ECB]">PC A — Application Layer</div>
            <div className="text-sm text-[#395886]/60 font-medium mt-0.5">Kolom input pesan aplikasi</div>
          </div>
        </div>
        <input
          type="text"
          value={userMessage}
          onChange={e => setUserMessage(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-[#D5DEEF] focus:border-[#628ECB] focus:ring-4 focus:ring-[#628ECB]/10 outline-none text-sm font-medium transition-all"
          placeholder='Contoh: "Halo, apa kabar?"'
          maxLength={40}
        />
        <AnimatePresence>
          {userMessage.trim().length > 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93 }}
              className="rounded-xl border-2 border-[#628ECB] bg-[#628ECB]/8 p-4"
              style={{ boxShadow: '0 0 22px rgba(98,142,203,0.2)' }}
            >
              <div className="text-xs font-black uppercase tracking-widest text-[#628ECB] mb-2">Objek DATA Terbentuk ✓</div>
              <div className="text-base font-bold text-[#395886]">"{userMessage}"</div>
              <div className="mt-2 text-xs text-[#628ECB]/60 font-medium">Siap dibungkus Transport Layer →</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );

    // ── Step 1: Transport Layer — TCP drag-drop (simplified) ──
    if (step === 1) return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3.5 bg-[#8B5CF6]/8 rounded-xl border border-[#8B5CF6]/20">
          <div className="w-5 h-5 rounded-md bg-[#8B5CF6]/15 flex items-center justify-center shrink-0">
            <div className="w-2.5 h-2.5 rounded-sm bg-[#8B5CF6]" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">Transport Layer — Pasang TCP Header</div>
            <div className="text-sm text-[#395886]/60 font-medium mt-0.5">TCP melindungi data agar terkirim dengan aman</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex flex-col items-center gap-2 sm:w-44 shrink-0">
            <div className="text-xs font-bold text-[#8B5CF6]/60 text-center">
              {tcpDropped ? 'Terpasang ✓' : 'Seret ke kotak DATA →'}
            </div>
            <TcpDraggable isDropped={tcpDropped} />
            {tcpDropped && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-1.5 text-sm font-bold text-[#10B981]">
                <CheckCircle className="w-4 h-4" /> TCP terpasang!
              </motion.div>
            )}
          </div>
          <div className="flex-1 w-full">
            <DataDropZone onDrop={() => setTcpDropped(true)} isDropped={tcpDropped} message={userMessage} />
          </div>
        </div>

        <AnimatePresence>
          {tcpDropped && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden">
              <div className="p-4 rounded-xl border-2 border-[#8B5CF6]/25 bg-[#8B5CF6]/5 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#10B981] shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-[#395886]">DATA → SEGMENT</div>
                    <div className="text-sm text-[#395886]/60">TCP Header berhasil dipasang — data kini terlindungi dan siap dikirim!</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['Mengatur urutan', 'Memastikan tiba utuh', 'Melindungi data'].map(f => (
                    <span key={f} className="px-3 py-1 rounded-full bg-[#8B5CF6]/10 text-xs font-bold text-[#8B5CF6]">{f}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );

    // ── Step 2: Network Layer — conceptual destination (simplified) ──
    if (step === 2) return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3.5 bg-[#10B981]/8 rounded-xl border border-[#10B981]/20">
          <div className="w-5 h-5 rounded-full bg-[#10B981]/15 flex items-center justify-center shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-[#10B981]">Network Layer — Tetapkan Alamat Tujuan</div>
            <div className="text-sm text-[#395886]/60 font-medium mt-0.5">IP Address menentukan ke mana data harus pergi</div>
          </div>
        </div>

        <div>
          <div className="text-sm font-bold text-[#395886]/70 mb-3">Pilih komputer tujuan yang tepat untuk data ini:</div>
          <div className="grid grid-cols-2 gap-3">
            {DEST_OPTIONS.map(opt => {
              const isSel = selectedDest === opt.id;
              const isWrong = wrongDestId === opt.id;
              return (
                <motion.button key={opt.id}
                  onClick={() => handleDestClick(opt.id, opt.correct)}
                  animate={isWrong ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                  disabled={!!selectedDest}
                  className={`relative px-4 py-4 rounded-xl border-2 text-left transition-all
                    ${isSel
                      ? 'border-[#10B981] bg-[#10B981]/10 shadow-[0_0_18px_rgba(16,185,129,0.22)]'
                      : isWrong
                      ? 'border-[#EF4444] bg-[#EF4444]/5'
                      : selectedDest
                      ? 'border-[#D5DEEF] opacity-40 cursor-not-allowed'
                      : 'border-[#D5DEEF] bg-white hover:border-[#10B981]/50 hover:bg-[#10B981]/5 cursor-pointer active:scale-[0.98]'
                    }`}
                >
                  <div className="text-xl mb-1">{opt.icon}</div>
                  <div className={`text-sm font-bold leading-tight ${isSel ? 'text-[#10B981]' : 'text-[#395886]'}`}>
                    {opt.label}
                  </div>
                  <div className={`text-xs mt-0.5 ${isSel ? 'text-[#10B981]/70' : 'text-[#395886]/40'}`}>
                    {opt.sub}
                  </div>
                  {isSel && <CheckCircle className="absolute top-3 right-3 w-4 h-4 text-[#10B981]" />}
                </motion.button>
              );
            })}
          </div>
        </div>

        {selectedDest === 'target' && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-[#10B981]/8 border border-[#10B981]/20">
            <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" />
            <span className="text-sm font-bold text-[#10B981]">Alamat tujuan ditetapkan — SEGMENT → PACKET!</span>
          </motion.div>
        )}
      </div>
    );

    // ── Step 3: Data Link Layer — MAC toggle ──
    if (step === 3) return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3.5 bg-[#F59E0B]/8 rounded-xl border border-[#F59E0B]/20">
          <Cable className="w-5 h-5 text-[#F59E0B] shrink-0" />
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-[#F59E0B]">Data Link Layer — MAC Frame</div>
            <div className="text-sm text-[#395886]/60 font-medium mt-0.5">PACKET saat ini — butuh pembungkus MAC untuk transmisi lokal</div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-5 py-3">
          <p className="text-sm font-medium text-[#395886]/65 text-center max-w-sm">
            Aktifkan MAC Frame agar data dapat dikirim melalui jaringan lokal antar perangkat
          </p>
          <button onClick={() => setMacToggled(true)} disabled={macToggled}
            className={`flex items-center gap-5 px-6 py-4 rounded-2xl border-2 font-bold transition-all
              ${macToggled
                ? 'border-[#F59E0B] bg-[#F59E0B]/10 cursor-default'
                : 'border-[#D5DEEF] bg-white hover:border-[#F59E0B]/50 hover:bg-[#F59E0B]/5 cursor-pointer active:scale-95'
              }`}>
            <div className={`relative h-7 w-12 rounded-full transition-colors duration-300 ${macToggled ? 'bg-[#F59E0B]' : 'bg-[#D5DEEF]'}`}>
              <motion.div
                animate={{ x: macToggled ? 21 : 3 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-md"
              />
            </div>
            <div>
              <div className={`text-sm font-bold ${macToggled ? 'text-[#F59E0B]' : 'text-[#395886]'}`}>MAC Address Frame</div>
              <div className={`text-xs font-medium mt-0.5 ${macToggled ? 'text-[#F59E0B]/70' : 'text-[#395886]/40'}`}>
                {macToggled ? 'Aktif — data siap ditransmisikan' : 'Tap untuk mengaktifkan'}
              </div>
            </div>
            {macToggled && <CheckCircle className="w-5 h-5 text-[#F59E0B] ml-1" />}
          </button>
          {macToggled && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20">
              <CheckCircle className="w-4 h-4 text-[#F59E0B] shrink-0" />
              <span className="text-sm font-bold text-[#F59E0B]">PACKET → FRAME — Enkapsulasi lengkap!</span>
            </motion.div>
          )}
        </div>
      </div>
    );

    // ── Step 4: Physical — CSMA/CD Listen ──
    if (step === 4) {
      const isClear = listenState === 'clear';
      const isListening = listenState === 'listening';
      const statusColor = isClear ? '#10B981' : isListening ? '#F59E0B' : '#EF4444';
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 p-4 bg-[#F0F3FA] rounded-xl">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="h-9 w-9 rounded-lg bg-[#395886]/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#395886]" />
              </div>
              <span className="text-xs font-black text-[#395886]/40">PC A</span>
            </div>
            <div className="flex-1 relative h-7 flex items-center">
              <div className="w-full h-2 bg-[#D5DEEF] rounded-full" />
              <motion.div
                animate={{ scale: [1, 1.3, 1], backgroundColor: statusColor }}
                transition={{ repeat: isClear ? 0 : Infinity, duration: 0.7 }}
                className="absolute left-1/2 -translate-x-1/2 h-5 w-5 rounded-full shadow-md"
              />
            </div>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="h-9 w-9 rounded-lg bg-[#395886]/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#395886]" />
              </div>
              <span className="text-xs font-black text-[#395886]/40">PC B</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all"
            style={{ borderColor: `${statusColor}45`, backgroundColor: `${statusColor}0D` }}>
            <motion.div animate={{ scale: isClear ? 1 : [1, 1.2, 1] }} transition={{ repeat: isClear ? 0 : Infinity, duration: 0.6 }}
              className="h-3.5 w-3.5 rounded-full shrink-0" style={{ backgroundColor: statusColor }} />
            <div>
              <div className="text-sm font-black" style={{ color: statusColor }}>
                {isClear ? 'Channel IDLE — Jalur Aman' : isListening ? 'Mendeteksi Sinyal…' : 'Channel BUSY — Jalur Sibuk'}
              </div>
              {!isClear && !isListening && (
                <div className="text-xs text-[#395886]/50 font-medium mt-0.5">Tahan tombol Listen untuk memeriksa jalur</div>
              )}
            </div>
          </div>

          {!isClear ? (
            <div className="flex flex-col items-center gap-3">
              <div className="relative h-28 w-28">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 112 112">
                  <circle cx="56" cy="56" r="48" fill="none" stroke="#E5E7EB" strokeWidth="6" />
                  <circle cx="56" cy="56" r="48" fill="none" stroke="#EC4899" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 48}`}
                    strokeDashoffset={`${2 * Math.PI * 48 * (1 - listenProgress / 100)}`}
                    style={{ transition: 'stroke-dashoffset 0.1s linear' }} />
                </svg>
                <button
                  onMouseDown={startListen} onMouseUp={stopListen} onMouseLeave={stopListen}
                  onTouchStart={startListen} onTouchEnd={stopListen}
                  className={`absolute inset-2 rounded-full flex flex-col items-center justify-center select-none transition-all
                    ${isListening ? 'bg-[#EC4899]/20 text-[#EC4899]' : 'bg-[#EC4899]/8 text-[#EC4899]/60 hover:bg-[#EC4899]/15'}`}>
                  <Wifi className="w-6 h-6 mb-0.5" />
                  <span className="text-[10px] font-black">TAHAN</span>
                </button>
              </div>
              <span className="text-sm text-[#395886]/50 font-medium text-center">
                Tekan dan tahan ± 2 detik untuk mendeteksi sinyal
              </span>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-2 py-4">
              <CheckCircle className="w-12 h-12 text-[#10B981]" />
              <div className="text-base font-bold text-[#10B981]">Jalur kosong — siap kirim!</div>
            </motion.div>
          )}
        </div>
      );
    }

    // ── Step 5: Physical — Transmit bits ──
    if (step === 5) return (
      <div className="space-y-4">
        <div className="relative p-4 bg-[#F0F3FA] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="h-9 w-9 rounded-lg bg-[#395886]/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#395886]" />
              </div>
              <span className="text-xs font-black text-[#395886]/40">PC A</span>
            </div>
            <div className="flex-1 relative h-10 flex items-center overflow-hidden">
              <div className="w-full h-2 bg-[#D5DEEF] rounded-full absolute" />
              {(isTransmitting || transmitted) && (
                <motion.div
                  initial={{ x: '-110%' }}
                  animate={{ x: transmitted ? '110%' : '10%' }}
                  transition={{ duration: 1.6, ease: 'linear' }}
                  className="absolute font-mono text-xs font-black text-[#EC4899] tracking-widest whitespace-nowrap"
                >
                  {bitStream}
                </motion.div>
              )}
            </div>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${transmitted ? 'bg-[#10B981]/15' : 'bg-[#395886]/10'}`}>
                <Activity className={`w-5 h-5 ${transmitted ? 'text-[#10B981]' : 'text-[#395886]'}`} />
              </div>
              <span className={`text-xs font-black ${transmitted ? 'text-[#10B981]' : 'text-[#395886]/40'}`}>PC B</span>
            </div>
          </div>
        </div>

        {!transmitted ? (
          <button onClick={startTransmit} disabled={isTransmitting}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm transition-all
              ${isTransmitting
                ? 'bg-[#EC4899]/15 text-[#EC4899] cursor-wait'
                : 'bg-gradient-to-r from-[#EC4899] to-[#F43F5E] text-white shadow-md shadow-[#EC4899]/20 hover:opacity-90 active:scale-95'
              }`}>
            <Radio className={`w-5 h-5 ${isTransmitting ? 'animate-pulse' : ''}`} />
            {isTransmitting ? 'Mengirim Bit…' : 'Kirim FRAME sebagai BITS'}
          </button>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-3 py-4 rounded-xl bg-[#10B981]/10 border-2 border-[#10B981]/30">
            <CheckCircle className="w-5 h-5 text-[#10B981]" />
            <span className="font-bold text-sm text-[#10B981]">Transmisi Selesai — FRAME diterima PC B!</span>
          </motion.div>
        )}
      </div>
    );

    // ── Step 6: Decapsulation — strip MAC then IP ──
    if (step === 6) return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3.5 bg-[#10B981]/8 rounded-xl border border-[#10B981]/20">
          <Activity className="w-5 h-5 text-[#10B981] shrink-0" />
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-[#10B981]">PC B — Menerima FRAME</div>
            <div className="text-sm text-[#395886]/60 font-medium mt-0.5">Lepas lapisan pembungkus dari luar ke dalam: MAC dulu, lalu Alamat</div>
          </div>
        </div>

        <AnimatePresence>
          {!macStripped && (
            <motion.div
              exit={{ x: '110%', opacity: 0 }}
              transition={{ duration: 0.4 }}
              drag="x"
              dragConstraints={{ left: 0, right: 400 }}
              onDragEnd={(_, info) => { if (info.offset.x > 80) setMacStripped(true); }}
              onClick={() => setMacStripped(true)}
              whileHover={{ boxShadow: '0 0 14px rgba(245,158,11,0.25)' }}
              className="p-4 rounded-xl border-2 border-[#F59E0B] bg-[#F59E0B]/8 cursor-pointer select-none"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-[#F59E0B]">MAC Frame — Lapisan Terluar</div>
                  <div className="text-sm font-medium text-[#395886]/70 mt-0.5">Pembungkus jaringan lokal</div>
                </div>
                <div className="text-xs font-bold text-[#F59E0B]/60">← Geser / Klik</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {macStripped && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl border border-[#0EA5E9]/30 bg-[#0EA5E9]/5">
            <CheckCircle className="w-4 h-4 text-[#0EA5E9]" />
            <span className="text-sm font-bold text-[#0EA5E9]">MAC Frame dilepas ✓</span>
          </div>
        )}

        <AnimatePresence>
          {!ipStripped && (
            <motion.div
              exit={{ x: '110%', opacity: 0 }}
              transition={{ duration: 0.4 }}
              drag={macStripped ? 'x' : false}
              dragConstraints={{ left: 0, right: 400 }}
              onDragEnd={(_, info) => {
                if (!macStripped) { showError('Lepas MAC Frame terlebih dahulu!'); return; }
                if (info.offset.x > 80) setIpStripped(true);
              }}
              onClick={() => {
                if (!macStripped) { showError('Lepas MAC Frame terlebih dahulu!'); return; }
                setIpStripped(true);
              }}
              whileHover={macStripped ? { boxShadow: '0 0 14px rgba(16,185,129,0.25)' } : undefined}
              className={`p-4 rounded-xl border-2 select-none transition-all
                ${macStripped
                  ? 'border-[#10B981] bg-[#10B981]/8 cursor-pointer'
                  : 'border-[#D5DEEF] bg-[#F0F3FA] opacity-50 cursor-not-allowed'
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xs font-black uppercase tracking-widest ${macStripped ? 'text-[#10B981]' : 'text-[#395886]/30'}`}>
                    Alamat Tujuan (Network Layer)
                  </div>
                  <div className="text-sm font-medium text-[#395886]/60 mt-0.5">Label arah pengiriman ke PC B</div>
                </div>
                {macStripped
                  ? <div className="text-xs font-bold text-[#10B981]/60">← Geser / Klik</div>
                  : <Lock className="w-4 h-4 text-[#395886]/20" />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {ipStripped && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl border border-[#0EA5E9]/30 bg-[#0EA5E9]/5">
            <CheckCircle className="w-4 h-4 text-[#0EA5E9]" />
            <span className="text-sm font-bold text-[#0EA5E9]">Alamat Tujuan dilepas ✓</span>
          </div>
        )}

        <div className="p-3.5 rounded-xl border-2 border-[#8B5CF6]/20 bg-[#8B5CF6]/5 opacity-50">
          <div className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]/50">TCP Header + DATA</div>
          <div className="text-sm font-medium text-[#395886]/40 mt-0.5">SEGMENT — langkah berikutnya</div>
        </div>

        {macStripped && ipStripped && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-[#10B981]/8 border border-[#10B981]/20">
            <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" />
            <span className="text-sm font-bold text-[#10B981]">Lapisan terluar dilepas — SEGMENT siap dibuka!</span>
          </motion.div>
        )}
      </div>
    );

    // ── Step 7: Decap TCP — double-click ──
    if (step === 7) return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3.5 bg-[#8B5CF6]/8 rounded-xl border border-[#8B5CF6]/20">
          <Lock className="w-5 h-5 text-[#8B5CF6] shrink-0" />
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">PC B — Transport Layer</div>
            <div className="text-sm text-[#395886]/60 font-medium mt-0.5">Double-click untuk membuka TCP Header dan mengambil data</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          {!tcpOpened ? (
            <motion.div
              animate={{
                scale: [1, 1.02, 1],
                boxShadow: ['0 0 16px rgba(139,92,246,0.15)', '0 0 28px rgba(139,92,246,0.35)', '0 0 16px rgba(139,92,246,0.15)'],
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              onDoubleClick={() => setTcpOpened(true)}
              onClick={handleTcpTap}
              className="w-full max-w-xs p-6 rounded-xl border-2 border-[#8B5CF6] bg-[#8B5CF6]/8 cursor-pointer select-none"
            >
              <div className="text-center space-y-3">
                <div className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">TCP Header</div>
                <Lock className="w-10 h-10 text-[#8B5CF6] mx-auto" />
                <div className="text-sm font-medium text-[#395886]/50">
                  Double-click untuk membuka
                  {tapCount === 1 && <span className="text-[#8B5CF6] ml-1 font-bold animate-pulse">(sekali lagi!)</span>}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-xs space-y-2">
              <motion.div initial={{ height: 70, opacity: 1 }} animate={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }} className="overflow-hidden">
                <div className="p-4 rounded-xl border-2 border-[#8B5CF6] bg-[#8B5CF6]/8">
                  <div className="text-xs font-black text-[#8B5CF6]">TCP Header — Terbuka ✓</div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="p-5 rounded-xl border-2 border-[#628ECB] bg-[#628ECB]/8 text-center"
                style={{ boxShadow: '0 0 24px rgba(98,142,203,0.25)' }}>
                <div className="text-xs font-black uppercase tracking-widest text-[#628ECB] mb-2">DATA</div>
                <div className="text-lg font-black text-[#395886]">"{userMessage}"</div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    );

    // ── Step 8: Complete ──
    return (
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-5 py-3">
        <div className="relative">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-lg shadow-[#10B981]/25">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white border-2 border-[#10B981] flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-[#10B981]" />
          </motion.div>
        </div>
        <div className="text-center">
          <div className="text-xs font-black uppercase tracking-widest text-[#10B981] mb-1">Transmisi TCP/IP Berhasil!</div>
          <div className="text-sm font-medium text-[#395886]/55 mb-3">Pesan diterima utuh di Application Layer PC B</div>
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-xl font-black text-[#395886] bg-[#628ECB]/8 px-6 py-3.5 rounded-xl border-2 border-[#628ECB]/30">
            "{userMessage}"
          </motion.div>
        </div>
        <div className="grid grid-cols-3 gap-2.5 w-full">
          {[
            { label: 'Enkapsulasi', val: '4 lapisan' },
            { label: 'Transmisi', val: 'Lewat kabel' },
            { label: 'Dekapsulasi', val: '3 lapisan' },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-xl bg-[#10B981]/8 border border-[#10B981]/20 text-center">
              <div className="text-xs font-black text-[#10B981] mb-0.5">✓</div>
              <div className="text-xs font-bold text-[#395886]">{s.label}</div>
              <div className="text-xs font-black text-[#10B981]">{s.val}</div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const inst2 = STEP_INSTRUCTIONS[step];

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">

      {/* ── Journey Progress Tracker (U-Shape) ── */}
      {(() => {
        const JOURNEY = [
          { label: 'App',    sub: 'PC A',    phase: 'enc' as const },
          { label: 'TCP',    sub: 'Trans',   phase: 'enc' as const },
          { label: 'IP',     sub: 'Network', phase: 'enc' as const },
          { label: 'MAC',    sub: 'Link',    phase: 'enc' as const },
          { label: 'Listen', sub: 'CSMA/CD', phase: 'phy' as const },
          { label: 'BIT',    sub: 'Kirim',   phase: 'phy' as const },
          { label: 'MAC',    sub: 'Link',    phase: 'dec' as const },
          { label: 'TCP',    sub: 'Trans',   phase: 'dec' as const },
          { label: 'App',    sub: 'PC B',    phase: 'dec' as const },
        ] as const;
        const phaseColor = { enc: '#628ECB', phy: '#EC4899', dec: '#10B981' } as const;
        const pktColor = step <= 3 ? '#628ECB' : step <= 5 ? '#EC4899' : '#10B981';
        const allDone = step === 8;
        const fillPct = (step / 8) * 100;

        return (
          <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all duration-700 ${allDone ? 'border-[#10B981]/40' : 'border-[#D5DEEF]'} mt-6`}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-6 pb-2">
              <div className="flex items-center gap-2.5">
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: pktColor }}
                />
                <span className="text-xs font-black uppercase tracking-widest text-[#628ECB]">
                  Perjalanan Data: PC A → PC B
                </span>
              </div>
              <span className={`text-xs font-bold ${allDone ? 'text-[#10B981]' : 'text-[#395886]/40'}`}>
                {allDone ? 'Sampai ✓' : `${step + 1} / 9`}
              </span>
            </div>

            {/* Section labels */}
            <div className="flex items-end px-5 pt-3 pb-0 text-[8px] font-black uppercase tracking-widest leading-none select-none">
              <div className="flex-[4] text-center text-[#628ECB] opacity-70">◄ PC A • Enkapsulasi ►</div>
              <div className="flex-[2] text-center text-[#EC4899] opacity-70">• Fisik •</div>
              <div className="flex-[3] text-center text-[#10B981] opacity-70">◄ PC B • Dekapsulasi ►</div>
            </div>

            {/* Scrollable track */}
            <div className="overflow-x-auto scrollbar-hide px-3 pb-6 pt-6">
              <div className="relative" style={{ minWidth: '500px', height: '90px' }}>

                {/* Section background bands */}
                <div className="absolute inset-y-0 flex overflow-hidden" style={{ left: '14px', right: '14px' }}>
                  <div className="flex-[4]" style={{ background: 'rgba(98,142,203,0.05)' }} />
                  <div className="flex-[2]" style={{ background: 'rgba(236,72,153,0.05)' }} />
                  <div className="flex-[3]" style={{ background: 'rgba(16,185,129,0.05)' }} />
                </div>

                {/* Track background line */}
                <div className="absolute rounded-full bg-[#E8ECF4]"
                  style={{ top: '16px', left: '14px', right: '14px', height: '2px' }} />

                {/* Progress fill */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    top: '16px',
                    left: '14px',
                    height: '2px',
                    background: 'linear-gradient(to right, #628ECB 0%, #628ECB 44%, #EC4899 56%, #10B981 100%)',
                  }}
                  animate={{ width: step === 0 ? '0px' : `calc(${fillPct}% - ${fillPct / 100 * 28}px)` }}
                  transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                />

                {/* Animated packet dot */}
                <motion.div
                  animate={{ left: `calc(14px + ${step / 8} * (100% - 28px))` }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  style={{ position: 'absolute', top: '8px', transform: 'translateX(-50%)', zIndex: 30, pointerEvents: 'none' }}
                >
                  {/* Outer ripple */}
                  <motion.div
                    animate={{ scale: [1, 2.8], opacity: [0.5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: 'easeOut' }}
                    style={{ position: 'absolute', inset: '-2px', borderRadius: '50%', backgroundColor: pktColor }}
                  />
                  {/* Second ring */}
                  <motion.div
                    animate={{ scale: [1, 1.9], opacity: [0.35, 0] }}
                    transition={{ repeat: Infinity, duration: 1.4, delay: 0.35, ease: 'easeOut' }}
                    style={{ position: 'absolute', inset: '-2px', borderRadius: '50%', backgroundColor: pktColor }}
                  />
                  {/* Core dot */}
                  <div style={{
                    position: 'relative', width: '16px', height: '16px', borderRadius: '50%',
                    backgroundColor: pktColor,
                    boxShadow: `0 0 14px ${pktColor}90, 0 0 6px ${pktColor}60`,
                    border: '2.5px solid white',
                  }}>
                    <div style={{
                      position: 'absolute', top: '3px', left: '3px',
                      width: '4px', height: '4px', borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.8)',
                    }} />
                  </div>
                </motion.div>

                {/* Nodes */}
                {JOURNEY.map((node, i) => {
                  const isDone = i < step;
                  const isActive = i === step;
                  const color = phaseColor[node.phase];
                  return (
                    <div key={i} style={{
                      position: 'absolute', top: 0,
                      left: `calc(14px + ${i / 8} * (100% - 28px))`,
                      transform: 'translateX(-50%)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      zIndex: 10, width: '34px',
                    }}>
                      <motion.div
                        animate={{
                          backgroundColor: isDone ? '#395886' : isActive ? color : 'white',
                          borderColor: isDone ? '#395886' : isActive ? color : '#DDE3EE',
                          boxShadow: isActive ? `0 0 0 4px ${color}18, 0 0 16px ${color}55` : 'none',
                          scale: isActive ? 1.22 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                        style={{
                          width: '30px', height: '30px', borderRadius: '50%',
                          border: '2px solid', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', flexShrink: 0,
                        }}
                      >
                        {isDone
                          ? <CheckCircle style={{ width: '14px', height: '14px', color: 'white' }} />
                          : <span style={{
                              fontSize: '7px', fontWeight: 900,
                              color: isActive ? color : '#C5CDD8',
                              lineHeight: 1, textAlign: 'center', letterSpacing: '-0.02em',
                            }}>{node.label}</span>
                        }
                      </motion.div>
                      {/* Node label */}
                      <span style={{
                        fontSize: '8px', fontWeight: 700, marginTop: '4px',
                        textAlign: 'center', lineHeight: 1.2,
                        color: isDone ? '#395886' : isActive ? color : '#C5CDD8',
                        maxWidth: '34px', overflow: 'hidden', whiteSpace: 'nowrap',
                      }}>
                        {node.sub}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Step Header & Instruction ── */}
      <div className="bg-white rounded-2xl border-2 border-[#D5DEEF] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#D5DEEF]"
          style={{ background: `linear-gradient(to right, ${inst2.phaseColor}12, transparent)` }}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-xs font-black shrink-0"
            style={{ backgroundColor: inst2.phaseColor }}>
            {step + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-black uppercase tracking-widest" style={{ color: inst2.phaseColor }}>
              {inst2.phase} — {inst2.layer}
            </div>
            <h3 className="text-base font-bold text-[#395886] truncate">{inst2.title}</h3>
          </div>
        </div>
        <div className="px-5 py-3.5 flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" style={{ color: inst2.phaseColor }} />
          <p className="text-sm text-[#395886]/65 leading-relaxed">{inst2.instruction}</p>
        </div>
      </div>

      {/* ── Interactive Workspace ── */}
      <div className="bg-white rounded-2xl border-2 border-[#D5DEEF] shadow-sm p-5 min-h-[280px]">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22 }}>
            {renderWorkspace()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Scaffolding / Error message ── */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#FFF7ED] border-2 border-[#F59E0B]/35"
          >
            <AlertCircle className="w-5 h-5 text-[#F59E0B] shrink-0" />
            <span className="text-sm font-bold text-[#92400E]">{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Argumentation Essay (Kemampuan Berargumen) ── */}
      {showArgumentEssay && (
        <div className="rounded-2xl border-2 border-[#10B981]/25 bg-gradient-to-br from-[#ECFDF5] to-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#10B981]/10 to-transparent border-b border-[#10B981]/15">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#10B981]/15">
              <PenLine className="w-4 h-4 text-[#10B981]" />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#10B981]/70">Kemampuan Berargumen — {objectiveCode}</p>
              <p className="text-xs font-bold text-[#065F46]">Jelaskan Pemahamanmu</p>
            </div>
          </div>
          <div className="p-5">
            <div className="mb-3 p-4 rounded-xl bg-[#F0FDF4] border border-[#10B981]/20">
              <p className="text-sm font-semibold text-[#065F46] leading-relaxed">
                Berdasarkan simulasi yang baru saja kamu lakukan, jelaskan:
              </p>
              <ol className="mt-2 space-y-1 text-xs text-[#065F46]/80">
                <li>1. Bagaimana data berubah bentuk dari Application hingga Physical Layer?</li>
                <li>2. Mengapa setiap lapisan perlu menambahkan header-nya masing-masing?</li>
                <li>3. Apa yang terjadi jika salah satu lapisan tidak menjalankan fungsinya?</li>
              </ol>
            </div>
            <textarea
              value={argumentText}
              onChange={e => setArgumentText(e.target.value)}
              rows={5}
              className="w-full p-4 border-2 border-[#D5DEEF] rounded-xl text-sm leading-relaxed outline-none transition-all resize-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/5"
              placeholder="Tuliskan argumenmu di sini... (minimal 20 kata)"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className={`text-[10px] font-bold ${argumentText.trim().split(/\s+/).filter(Boolean).length >= 20 ? 'text-[#10B981]' : 'text-[#395886]/40'}`}>
                {argumentText.trim().split(/\s+/).filter(Boolean).length} / 20 kata
              </span>
              <button
                onClick={() => {
                  const wc = argumentText.trim().split(/\s+/).filter(Boolean).length;
                  if (wc < 20) return;
                  if (lessonId === '3') {
                    // For L3, show conclusion box instead of completing directly
                    setShowConclusionBox(true);
                  } else {
                    const finalAnswer = { userMessage, argument: argumentText.trim() };
                    void tracker.complete(finalAnswer, { step, userMessage, argument: argumentText.trim(), completed: true });
                    onComplete(finalAnswer);
                  }
                }}
                disabled={argumentText.trim().split(/\s+/).filter(Boolean).length < 20 || (lessonId === '3' && showConclusionBox)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm
                  ${argumentText.trim().split(/\s+/).filter(Boolean).length >= 20 && !(lessonId === '3' && showConclusionBox)
                    ? 'bg-[#10B981] text-white hover:bg-[#059669]'
                    : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'}`}
              >
                {lessonId === '3' ? 'Lanjut ke Penarikan Kesimpulan' : 'Simpan & Selesai'} <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── L3 Conclusion + Summary (Penarikan Kesimpulan) ── */}
      {lessonId === '3' && showConclusionBox && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ATPConclusionBox
            atpBehavior="mampu mensimulasikan proses konversi alamat IPv4 dari format desimal ke biner secara sistematis"
            objectiveCode="X.IP.6"
            stageType="modeling"
            defaultValue={conclusionText}
            disabled={!!conclusionText}
            minWords={10}
            onSubmit={(text) => {
              setConclusionText(text);
              const finalAnswer = { userMessage, argument: argumentText.trim(), conclusion: text };
              void tracker.complete(finalAnswer, { step, userMessage, argument: argumentText.trim(), conclusionText: text, completed: true });
              onComplete(finalAnswer);
            }}
          />
          {conclusionText && (
            <IndicatorSummaryCard
              consistency={
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#628ECB]/8 border border-[#628ECB]/15">
                  <CheckCircle className="w-4 h-4 text-[#628ECB] shrink-0" />
                  <span className="text-xs font-bold text-[#395886]">9 langkah simulasi konversi desimal ↔ biner IPv4 diselesaikan secara sistematis</span>
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
      )}

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between gap-4 py-2">
        <button onClick={goPrev} disabled={step === 0}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all
            ${step === 0 ? 'text-[#395886]/20 cursor-not-allowed' : 'text-[#395886] hover:text-[#628ECB] hover:bg-[#628ECB]/5'}`}>
          <ChevronRight className="w-4 h-4 rotate-180" /> Sebelumnya
        </button>

        <div className="flex-1 flex justify-center gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={`rounded-full transition-all duration-300
              ${i === step ? 'h-1.5 w-4 bg-[#628ECB]' : i < step ? 'h-1.5 w-1.5 bg-[#10B981]' : 'h-1.5 w-1.5 bg-[#D5DEEF]'}`} />
          ))}
        </div>

        <button onClick={goNext} disabled={!isStepDone || showArgumentEssay}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm text-white transition-all shadow-md active:scale-95
            ${isStepDone && !showArgumentEssay
              ? step === 8
                ? 'bg-gradient-to-r from-[#10B981] to-[#059669] shadow-[#10B981]/20 hover:opacity-90'
                : 'bg-gradient-to-r from-[#395886] to-[#628ECB] shadow-[#628ECB]/20 hover:opacity-90'
              : 'bg-[#E5E7EB] cursor-not-allowed shadow-none text-[#395886]/30'
            }`}>
          {step === 8 ? (showArgumentEssay ? 'Tulis Argumen' : 'Lanjut ke Argumen') : 'Lanjut'} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function ModelingStage(props: ModelingStageProps) {
  if (props.lessonId === '2') return <ModelingLesson2 {...props} />;
  if (props.lessonId === '3') return <ModelingLesson3 {...props} />;
  return <ModelingStageOriginal {...props} />;
}
