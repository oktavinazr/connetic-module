import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDrag, useDrop } from 'react-dnd';
import {
  CheckCircle, ArrowRight, BookOpen, Lightbulb, ChevronRight,
  AlertCircle, MessageSquare, Activity, GripVertical,
  Cable, Wifi, Radio, Lock, PenLine,
} from 'lucide-react';
import { useActivityTracker } from '../../hooks/useActivityTracker';

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

export function ModelingStage({
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
                  if (argumentText.trim().split(/\s+/).filter(Boolean).length < 20) return;
                  const finalAnswer = { userMessage, argument: argumentText.trim() };
                  void tracker.complete(finalAnswer, { step, userMessage, argument: argumentText.trim(), completed: true });
                  onComplete(finalAnswer);
                }}
                disabled={argumentText.trim().split(/\s+/).filter(Boolean).length < 20}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm
                  ${argumentText.trim().split(/\s+/).filter(Boolean).length >= 20
                    ? 'bg-[#10B981] text-white hover:bg-[#059669]'
                    : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'}`}
              >
                Simpan & Selesai <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
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
