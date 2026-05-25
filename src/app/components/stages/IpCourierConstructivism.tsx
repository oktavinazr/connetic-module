import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, XCircle, ArrowRight, AlertTriangle, GripVertical,
  Sparkles, LockKeyhole, RefreshCw, AlertCircle, ChevronRight,
} from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import { IpAddressIntro } from './IpAddressIntro';
import { EssayBox } from './StageKit';

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = 'animation' | 'ordering' | 'simulation' | 'essay' | 'conclusion';

interface OrderCard { id: string; text: string; sub: string; icon: string; correctOrder: number }

// ── Constants ─────────────────────────────────────────────────────────────────

const ORDER_CARDS: OrderCard[] = [
  { id: 'oc1', text: 'Membungkus data dengan aman', sub: 'Tugas TCP — Transport Layer', icon: '📦', correctOrder: 1 },
  { id: 'oc2', text: 'Menentukan alamat dan rute perjalanan paket', sub: 'Tugas IP — Network Layer', icon: '🗺️', correctOrder: 2 },
  { id: 'oc3', text: 'Paket sampai dan dibuka oleh penerima', sub: 'Tujuan pengiriman tercapai', icon: '🏠', correctOrder: 3 },
];

const DROPDOWNS = [
  {
    id: 'fungsi',
    placeholder: 'Pilih fungsi IP...',
    options: [
      { value: 'keandalan', label: 'pengatur keandalan agar data tidak hilang', isCorrect: false },
      { value: 'alamat_rute', label: 'penentu alamat dan rute perjalanan data', isCorrect: true },
      { value: 'segmen', label: 'pemecah data menjadi segmen-segmen kecil', isCorrect: false },
    ],
  },
  {
    id: 'dampak',
    placeholder: 'Pilih dampak...',
    options: [
      { value: 'tidak_tahu', label: 'data tidak mengetahui tujuan pengiriman', isCorrect: true },
      { value: 'lambat', label: 'data terkirim lebih lambat dari biasanya', isCorrect: false },
      { value: 'tidak_aman', label: 'koneksi menjadi tidak aman dan mudah disadap', isCorrect: false },
    ],
  },
];

const TEMPLATE_PARTS = [
  'Hari ini saya belajar bahwa Internet Protocol pada layer Network berfungsi sebagai ',
  '. Jika lapisan ini tidak bekerja, maka ',
  '.',
];

const DRAG_TYPE = 'IP_COURIER_ORDER';
const MAX_ATTEMPTS = 3;

// ── Drag-and-Drop Card ────────────────────────────────────────────────────────

function DragCard({
  card, index, onMove, locked,
}: {
  card: OrderCard; index: number; onMove: (from: number, to: number) => void; locked: boolean;
}) {
  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE,
    item: { index },
    canDrag: !locked,
    collect: m => ({ isDragging: m.isDragging() }),
  });
  const [, drop] = useDrop({
    accept: DRAG_TYPE,
    hover: (item: { index: number }) => {
      if (item.index !== index) { onMove(item.index, index); item.index = index; }
    },
  });

  const colors = [
    'bg-[#EFF6FF] border-[#93C5FD]',
    'bg-[#F0FDF4] border-[#86EFAC]',
    'bg-[#FFF7ED] border-[#FCA5A5]',
  ];
  const labelColors = ['text-[#1D4ED8]', 'text-[#15803D]', 'text-[#B91C1C]'];
  const stepLabels = ['Langkah 1', 'Langkah 2', 'Langkah 3'];

  return (
    <div
      ref={(node) => { drag(drop(node)); }}
      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all select-none
        ${colors[index]}
        ${locked ? 'cursor-default' : isDragging ? 'opacity-40 scale-95 cursor-grabbing shadow-2xl' : 'cursor-grab hover:shadow-sm hover:-translate-y-0.5'}`}
    >
      {!locked && <GripVertical className="w-4 h-4 text-[#395886]/30 shrink-0" />}
      <span className="text-xl shrink-0">{card.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${labelColors[index]}`}>
          {stepLabels[index]}
        </p>
        <p className="text-sm font-bold text-[#395886]">{card.text}</p>
        <p className="text-[10px] text-[#395886]/55 mt-0.5">{card.sub}</p>
      </div>
    </div>
  );
}

// ── Phase A: Ordering Activity ────────────────────────────────────────────────

function OrderingActivity({ onComplete }: { onComplete: () => void }) {
  const [cards, setCards] = useState<OrderCard[]>(() => {
    const shuffled = [...ORDER_CARDS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  const [attempts, setAttempts] = useState(0);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const moveCard = useCallback((from: number, to: number) => {
    setCards(prev => {
      const c = [...prev];
      const [item] = c.splice(from, 1);
      c.splice(to, 0, item);
      return c;
    });
  }, []);

  const handleCheck = () => {
    const ok = cards[0].correctOrder === 1 && cards[1].correctOrder === 2 && cards[2].correctOrder === 3;
    setAttempts(prev => prev + 1);
    setIsCorrect(ok);
    setChecked(true);
  };

  const showCorrectOrder = checked && !isCorrect && attempts >= MAX_ATTEMPTS;
  const displayCards = showCorrectOrder ? [...ORDER_CARDS] : cards;
  const isTerminal = checked && (isCorrect || attempts >= MAX_ATTEMPTS);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl border-2 border-[#395886]/20 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 bg-[#395886]/8 border-b border-[#395886]/15">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#395886]/15">
            <GripVertical className="w-4 h-4 text-[#395886]" />
          </div>
          <div className="flex-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#395886]/60">Keruntutan Berpikir</p>
            <h3 className="text-sm font-bold text-[#395886]">Urutan Logika Pengiriman</h3>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold
            ${attempts >= MAX_ATTEMPTS ? 'border-red-200 bg-red-50 text-red-500' : 'border-[#395886]/20 bg-white text-[#395886]'}`}>
            <AlertCircle className="w-3 h-3" />
            {attempts >= MAX_ATTEMPTS ? 'Percobaan Habis' : `${MAX_ATTEMPTS - attempts}× tersisa`}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-[#F8FAFF] border border-[#D5DEEF]">
            <span className="text-sm shrink-0">🚚</span>
            <p className="text-xs text-[#395886]/75 leading-relaxed">
              Seret dan susun kartu-kartu berikut sesuai{' '}
              <strong>urutan logika pengiriman paket data</strong> yang benar — dari tahap paling awal hingga akhir.
            </p>
          </div>
          <div className="space-y-2">
            {displayCards.map((card, i) => (
              <DragCard key={card.id} card={card} index={i} onMove={moveCard} locked={isTerminal} />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`p-4 rounded-xl border-2 flex items-start gap-3
              ${isCorrect ? 'border-[#10B981]/30 bg-[#ECFDF5]' : 'border-red-200 bg-red-50'}`}
          >
            {isCorrect
              ? <CheckCircle className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
              : <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
            <div>
              {isCorrect ? (
                <>
                  <p className="text-sm font-bold text-[#065F46]">Urutan benar! 🎉</p>
                  <p className="text-xs text-[#10B981]/80 mt-1">
                    TCP membungkus data → IP menentukan alamat & rute → Paket tiba di penerima. Itulah alur yang tepat!
                  </p>
                </>
              ) : showCorrectOrder ? (
                <>
                  <p className="text-sm font-bold text-red-700">Percobaan habis — urutan yang benar ditampilkan</p>
                  <p className="text-xs text-red-600/80 mt-1">Perhatikan urutan di atas sebelum melanjutkan.</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-red-700">Urutan belum tepat ({MAX_ATTEMPTS - attempts}× percobaan tersisa)</p>
                  <p className="text-xs text-red-600/80 mt-1">
                    Ingat: TCP membungkus dulu → baru IP menentukan alamat & rute → baru paket bisa sampai ke tujuan.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!checked && (
        <button
          onClick={handleCheck}
          className="w-full py-3 rounded-xl bg-[#395886] text-white font-bold text-sm hover:bg-[#2E4A75] transition-all shadow-sm"
        >
          Periksa Urutan
        </button>
      )}
      {checked && !isCorrect && attempts < MAX_ATTEMPTS && (
        <button
          onClick={() => setChecked(false)}
          className="w-full py-3 rounded-xl border-2 border-[#D5DEEF] text-[#395886] font-bold text-sm hover:bg-[#F8FAFF] transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Coba Lagi
        </button>
      )}
      {isTerminal && (
        <button
          onClick={onComplete}
          className="w-full py-3 rounded-xl bg-[#628ECB] text-white font-bold text-sm hover:bg-[#395886] transition-all shadow-sm flex items-center justify-center gap-2"
        >
          Lanjut ke Kemampuan Berargumen <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ── Phase B: Simulasi Kurir Tersesat ─────────────────────────────────────────

type SimStage = 'intro' | 'walking' | 'lost' | 'result';

function SimulationPhase({ onComplete }: { onComplete: () => void }) {
  const [simStage, setSimStage] = useState<SimStage>('intro');

  useEffect(() => {
    if (simStage === 'walking') {
      const t = setTimeout(() => setSimStage('lost'), 2200);
      return () => clearTimeout(t);
    }
    if (simStage === 'lost') {
      const t = setTimeout(() => setSimStage('result'), 1800);
      return () => clearTimeout(t);
    }
  }, [simStage]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl border-2 border-[#F59E0B]/30 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 bg-[#F59E0B]/8 border-b border-[#F59E0B]/20">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F59E0B]/15">
            <span className="text-base">🚚</span>
          </div>
          <div className="flex-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#F59E0B]/70">Kemampuan Berargumen</p>
            <h3 className="text-sm font-bold text-[#395886]">Simulasi: Kirim Paket Tanpa Alamat</h3>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {simStage === 'intro' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="rounded-xl bg-[#FFF7ED] border border-[#FED7AA] p-4 space-y-2">
                <p className="text-xs font-black text-[#92400E] uppercase tracking-wide mb-2">🔧 Skenario Simulasi</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-[#92400E]/80">
                    <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                    <span>Paket sudah dibungkus TCP dengan aman</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#92400E]/80">
                    <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>Fungsi IP / Network Layer <strong>dimatikan</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#92400E]/80">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                    <span>Kurir tidak memiliki alamat tujuan atau peta jalan</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSimStage('walking')}
                className="w-full py-3 rounded-xl bg-[#F59E0B] text-white font-bold text-sm hover:bg-[#D97706] transition-all shadow-sm"
              >
                ▶ Mulai Simulasi
              </button>
            </motion.div>
          )}

          {simStage !== 'intro' && (
            <div className="rounded-2xl bg-gradient-to-b from-[#DBEAFE] to-[#93C5FD]/40 p-6 min-h-[160px] flex flex-col items-center justify-center relative overflow-hidden">
              {/* Road */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#6B7280]/15 rounded-b-2xl border-t border-[#6B7280]/20" />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6">
                {[1,2,3,4].map(n => (
                  <div key={n} className="w-6 h-1 bg-white/50 rounded-full" />
                ))}
              </div>

              <AnimatePresence mode="wait">
                {simStage === 'walking' && (
                  <motion.div key="walking" initial={{ x: -60, opacity: 0 }} animate={{ x: 40, opacity: 1 }} transition={{ duration: 2, ease: 'linear' }} className="text-5xl">
                    🚚
                  </motion.div>
                )}
                {simStage === 'lost' && (
                  <motion.div key="lost" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-2">
                    <div className="text-4xl">🚚</div>
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6 }}
                      className="flex items-center justify-center gap-3 text-2xl"
                    >
                      <span>↗️</span><span>❓</span><span>↘️</span>
                    </motion.div>
                    <p className="text-xs font-bold text-[#1E3A5F]">Berhenti di persimpangan...</p>
                  </motion.div>
                )}
                {simStage === 'result' && (
                  <motion.div key="result" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-1">
                    <div className="text-4xl">❌</div>
                    <div className="text-3xl">🚚💨</div>
                    <p className="text-xs font-black text-red-700">GAGAL DIKIRIM</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <AnimatePresence>
            {simStage === 'result' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <div className="p-4 rounded-xl border-2 border-red-200 bg-red-50 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-800">Gagal dikirim!</p>
                    <p className="text-xs text-red-700/80 mt-1 leading-relaxed">
                      Kurir tidak mengetahui tujuan paket karena tidak ada alamat/rute.{' '}
                      <strong>Internet Protocol (IP)</strong> pada Network Layer inilah yang menyediakan alamat tujuan
                      dan peta jalur pengiriman data.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onComplete}
                  className="w-full py-3 rounded-xl bg-[#628ECB] text-white font-bold text-sm hover:bg-[#395886] transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  Saya Mengerti — Tulis Argumen <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Phase D: Dropdown Conclusion ──────────────────────────────────────────────

function ConclusionDropdown({
  defaultAnswers, onComplete,
}: {
  defaultAnswers: Record<string, string>;
  onComplete: (answers: Record<string, string>, text: string) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(defaultAnswers);
  const [saved, setSaved] = useState(Object.keys(defaultAnswers).length === DROPDOWNS.length);
  const isLocked = saved;

  const allAnswered = DROPDOWNS.every(d => answers[d.id]);
  const allCorrect = allAnswered && DROPDOWNS.every(d => {
    const opt = d.options.find(o => o.value === answers[d.id]);
    return opt?.isCorrect;
  });

  const buildText = (ans: Record<string, string>) =>
    TEMPLATE_PARTS.map((part, i) => {
      if (i < DROPDOWNS.length) {
        const opt = DROPDOWNS[i].options.find(o => o.value === ans[DROPDOWNS[i].id]);
        return part + (opt?.label ?? '___');
      }
      return part;
    }).join('');

  const completedText = buildText(answers);

  const handleSave = () => {
    if (!allCorrect || isLocked) return;
    setSaved(true);
    onComplete(answers, completedText);
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl border-2 border-[#10B981]/25 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 bg-[#10B981]/8 border-b border-[#10B981]/15">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#10B981]/15">
            <Sparkles className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="flex-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#10B981]/70">Penarikan Kesimpulan</p>
            <h3 className="text-sm font-bold text-[#065F46]">Reflection — Lengkapi Kesimpulanmu</h3>
          </div>
          {isLocked && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-full border border-[#10B981]/20">
              <LockKeyhole className="w-3 h-3" /> Tersimpan
            </span>
          )}
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-xl border border-[#10B981]/15 bg-[#F0FDF4]/60 p-4">
            <div className="flex items-start gap-2">
              <span className="text-sm shrink-0">📖</span>
              <p className="text-xs font-semibold text-[#065F46] leading-relaxed">
                Lengkapi kalimat refleksi berikut dengan memilih jawaban yang tepat pada setiap dropdown.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-[#D5DEEF] bg-white p-5">
            <div className="flex flex-wrap items-center gap-2 leading-loose">
              {TEMPLATE_PARTS.map((part, i) => (
                <span key={i}>
                  <span className="text-sm font-semibold text-[#395886]">{part}</span>
                  {i < DROPDOWNS.length && (
                    <select
                      value={answers[DROPDOWNS[i].id] || ''}
                      disabled={isLocked}
                      onChange={e => setAnswers(prev => ({ ...prev, [DROPDOWNS[i].id]: e.target.value }))}
                      className={`ml-1 min-w-[210px] rounded-xl border-2 px-3 py-2 text-sm font-bold outline-none transition-all
                        ${isLocked
                          ? DROPDOWNS[i].options.find(o => o.value === answers[DROPDOWNS[i].id])?.isCorrect
                            ? 'border-[#10B981]/20 bg-[#ECFDF5] text-[#065F46]'
                            : 'border-red-200 bg-red-50 text-red-700'
                          : 'border-[#D5DEEF] bg-white text-[#395886] focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/5'
                        }`}
                    >
                      <option value="">{DROPDOWNS[i].placeholder}</option>
                      {DROPDOWNS[i].options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  )}
                </span>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {allAnswered && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border p-4 ${allCorrect ? 'border-[#10B981]/20 bg-[#ECFDF5]' : 'border-red-200 bg-red-50'}`}
              >
                <p className={`text-sm font-bold ${allCorrect ? 'text-[#065F46]' : 'text-red-700'}`}>
                  {allCorrect ? '✅ Kesimpulan tepat dan lengkap!' : '❌ Masih ada pilihan yang perlu diperbaiki.'}
                </p>
                {!allCorrect && (
                  <p className="text-xs text-red-600/80 mt-1">Pilih jawaban yang paling menggambarkan fungsi IP dan dampaknya bila tidak bekerja.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!isLocked && (
            <button
              onClick={handleSave}
              disabled={!allCorrect}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                ${allCorrect ? 'bg-[#10B981] text-white hover:bg-[#059669] shadow-sm' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'}`}
            >
              Simpan Kesimpulan <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {isLocked && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FDF4] border-2 border-[#10B981]/20"
            >
              <p className="text-[9px] font-black uppercase tracking-widest text-[#10B981] mb-3">📋 Hasil Refleksi Kamu</p>
              <p className="text-sm font-semibold text-[#065F46] leading-relaxed italic">
                "{completedText}"
              </p>
              <div className="mt-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                <span className="text-xs font-black text-[#10B981]">Tahap Constructivism selesai!</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function IpCourierConstructivism({
  tracker,
  snapshot,
  isCompleted,
  onTrackerPhase,
  onComplete,
}: {
  tracker: any;
  snapshot?: any;
  isCompleted?: boolean;
  onTrackerPhase?: (phase: 'consistency' | 'arguing' | 'conclusion') => void;
  onComplete: (answer: any) => void;
}) {
  const [phase, setPhase] = useState<Phase>(() => {
    if (snapshot?.l3Phase) return snapshot.l3Phase as Phase;
    if (isCompleted) return 'conclusion';
    return 'animation';
  });
  const [essayText, setEssayText] = useState<string>(() => snapshot?.l3EssayText || '');
  const [conclusionAnswers, setConclusionAnswers] = useState<Record<string, string>>(
    () => snapshot?.l3ConclusionAnswers || {},
  );

  // Report tracker phase to parent for indicator tracking
  useEffect(() => {
    if (phase === 'animation' || phase === 'ordering') onTrackerPhase?.('consistency');
    else if (phase === 'simulation' || phase === 'essay') onTrackerPhase?.('arguing');
    else if (phase === 'conclusion') onTrackerPhase?.('conclusion');
  }, [phase, onTrackerPhase]);

  // Save snapshot on state changes
  useEffect(() => {
    const progressMap: Record<Phase, number> = {
      animation: 15, ordering: 35, simulation: 55, essay: 70, conclusion: 90,
    };
    void tracker.saveImmediate(
      { l3Phase: phase, l3EssayText: essayText, l3ConclusionAnswers: conclusionAnswers },
      { progressPercent: progressMap[phase] },
    );
  }, [phase, essayText, conclusionAnswers, tracker]);

  if (phase === 'animation') {
    return (
      <IpAddressIntro
        onComplete={() => {
          void tracker.trackEvent('constructivism_animation_completed', {}, { progressPercent: 30 });
          setPhase('ordering');
        }}
      />
    );
  }

  if (phase === 'ordering') {
    return (
      <OrderingActivity
        onComplete={() => {
          void tracker.trackEvent('constructivism_ordering_completed', {}, { progressPercent: 45 });
          setPhase('simulation');
        }}
      />
    );
  }

  if (phase === 'simulation') {
    return <SimulationPhase onComplete={() => setPhase('essay')} />;
  }

  if (phase === 'essay') {
    return (
      <div className="space-y-4">
        <EssayBox
          prompt="Jelaskan mengapa Internet Protocol (IP) sangat penting dalam komunikasi jaringan dan mengapa TCP tetap membutuhkan IP meskipun data sudah dibungkus dengan aman."
          objectiveLabel="X.IP.1"
          headerLabel="Argumen Logis"
          submitLabel="Simpan Argumen"
          minWords={10}
          defaultValue={essayText}
          disabled={!!essayText}
          onSubmit={(text) => {
            setEssayText(text);
            void tracker.trackEvent('constructivism_arguing_completed', { hasEssay: true }, { progressPercent: 75 });
            setPhase('conclusion');
          }}
        />
      </div>
    );
  }

  if (phase === 'conclusion') {
    return (
      <ConclusionDropdown
        defaultAnswers={conclusionAnswers}
        onComplete={(answers, text) => {
          setConclusionAnswers(answers);
          const finalAnswer = { essayText, conclusionAnswers: answers, summary: text };
          void tracker.complete(finalAnswer, { phase: 'conclusion', finalAnswer });
          onComplete(finalAnswer);
        }}
      />
    );
  }

  return null;
}
