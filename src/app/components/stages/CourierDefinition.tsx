import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileImage,
  Box,
  MapPin,
  Shield,
  Zap,
  ArrowRight,
  ChevronRight,
  Package,
  Radio,
  Network,
  Cable,
  BadgeCheck,
  GripVertical,
  X,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

interface LayerInfo {
  id: number;
  title: string;
  layerName: string;
  analogi: string;
  teknis: string;
  icon: React.ReactNode;
  accent: string;
  accentBg: string;
  badge: string;
}

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const DEFINITION_WORDS = ['Aturan', 'Universal', 'Pengiriman', 'Data', 'Utuh'];
const CORRECT_DEFINITION = 'Aturan Universal Pengiriman Data Utuh';

// ── Layer Data ─────────────────────────────────────────────────────────────

const LAYERS: LayerInfo[] = [
  {
    id: 5,
    title: 'Application Layer',
    layerName: 'Layer 5 — Application',
    analogi:
      'Ibarat kamu ingin mengirim foto ke teman lewat aplikasi chat. Data mentah berupa file gambar disiapkan di sisi pengirim.',
    teknis:
      'Layer Application menyediakan antarmuka bagi pengguna. Protokol: HTTP, FTP, SMTP, DNS.',
    icon: <FileImage className="w-7 h-7" />,
    accent: '#D97706',
    accentBg: 'bg-amber-50 border-amber-200 text-amber-700',
    badge: 'Data Mentah',
  },
  {
    id: 4,
    title: 'Transport Layer',
    layerName: 'Layer 4 — Transport',
    analogi:
      'Foto dipecah menjadi potongan kecil (segmen) dan diberi nomor urut supaya bisa disusun ulang nanti.',
    teknis:
      'Layer Transport memecah data menjadi segmen. TCP menjamin urutan & keutuhan. Ada nomor port & sequence number.',
    icon: <Box className="w-7 h-7" />,
    accent: '#3B82F6',
    accentBg: 'bg-blue-50 border-blue-200 text-blue-600',
    badge: 'Segmentasi',
  },
  {
    id: 3,
    title: 'Network Layer',
    layerName: 'Layer 3 — Network',
    analogi:
      'Setiap potongan diberi alamat tujuan seperti menulis alamat rumah di amplop surat.',
    teknis:
      'Layer Network menambahkan IP address pengirim & penerima. Protokol utama: IP (Internet Protocol).',
    icon: <MapPin className="w-7 h-7" />,
    accent: '#7C3AED',
    accentBg: 'bg-purple-50 border-purple-200 text-purple-600',
    badge: 'Routing IP',
  },
  {
    id: 2,
    title: 'Data Link Layer',
    layerName: 'Layer 2 — Data Link',
    analogi:
      'Amplop dibungkus plastik pelindung dan ditempel barcode alamat fisik (MAC) supaya sampai ke perangkat yang tepat.',
    teknis:
      'Layer Data Link membungkus paket menjadi frame. Menambahkan MAC Address. Ada error detection (CRC).',
    icon: <Shield className="w-7 h-7" />,
    accent: '#059669',
    accentBg: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    badge: 'Frame & MAC',
  },
  {
    id: 1,
    title: 'Physical Layer',
    layerName: 'Layer 1 — Physical',
    analogi:
      'Paket fisik dikirim lewat kurir, jalan raya, dan kabel menuju rumah penerima dalam bentuk sinyal.',
    teknis:
      'Layer Physical mengonversi frame menjadi sinyal listrik/cahaya/gelombang radio melalui media transmisi (kabel, fiber, wireless).',
    icon: <Zap className="w-7 h-7" />,
    accent: '#DB2777',
    accentBg: 'bg-rose-50 border-rose-200 text-rose-600',
    badge: 'Transmisi Bit',
  },
];

// ── Sub‑components ─────────────────────────────────────────────────────────

function InfoCards({ layer, visible }: { layer: LayerInfo; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="grid sm:grid-cols-2 gap-3"
        >
          {/* Analogi Card */}
          <div className="rounded-2xl border border-[#D5DEEF] bg-white/70 backdrop-blur-sm px-5 py-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/80">
                Apa yang Terjadi?
              </p>
            </div>
            <p className="text-sm text-[#395886]/80 leading-relaxed">{layer.analogi}</p>
          </div>

          {/* Teknis Card */}
          <div className="rounded-2xl border border-[#D5DEEF] bg-white/70 backdrop-blur-sm px-5 py-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-[#628ECB]/10 border border-[#628ECB]/20 flex items-center justify-center">
                <BadgeCheck className="w-3.5 h-3.5 text-[#628ECB]" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]/70">
                Istilah Teknis
              </p>
            </div>
            <p className="text-sm text-[#395886]/80 leading-relaxed">{layer.teknis}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SenderNode({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-14 h-14 rounded-2xl bg-[#628ECB]/8 border border-[#628ECB]/20 flex items-center justify-center shadow-sm">
        <Radio className="w-6 h-6 text-[#628ECB]" />
      </div>
      <span className="text-[10px] font-bold text-[#395886]/40 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function ReceiverNode({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-14 h-14 rounded-2xl bg-[#10B981]/8 border border-[#10B981]/20 flex items-center justify-center shadow-sm">
        <BadgeCheck className="w-6 h-6 text-[#10B981]" />
      </div>
      <span className="text-[10px] font-bold text-[#395886]/40 uppercase tracking-wider">{label}</span>
    </div>
  );
}

function DataFile({ accent, dimmed }: { accent: string; dimmed?: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -15 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="relative"
    >
      <div
        className={`w-20 h-24 rounded-xl flex flex-col items-center justify-center gap-1.5 shadow-sm ${dimmed ? 'opacity-50' : ''}`}
        style={{
          background: '#FFFFFF',
          border: `2px solid ${accent}40`,
        }}
      >
        <FileImage className="w-8 h-8" style={{ color: accent }} />
        <span className="text-[9px] font-black text-[#395886]/50 uppercase tracking-wider">File</span>
      </div>
    </motion.div>
  );
}

function TransportBox({
  accent,
  children,
  dimmed,
}: {
  accent: string;
  children: React.ReactNode;
  dimmed?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative"
    >
      <div
        className={`rounded-2xl border-2 border-dashed px-4 py-3 flex flex-col items-center gap-2 ${dimmed ? 'opacity-60' : ''}`}
        style={{ borderColor: `${accent}55`, background: `${accent}08` }}
      >
        {children}
        <span
          className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{ background: `${accent}15`, color: accent }}
        >
          Nomor Urut 1/5
        </span>
      </div>
    </motion.div>
  );
}

function IPLabel({ accent, dimmed }: { accent: string; dimmed?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className={`absolute -top-8 left-1/2 -translate-x-1/2 ${dimmed ? 'opacity-50' : ''}`}
    >
      <div
        className="rounded-full px-4 py-1.5 text-[10px] font-black tracking-wider shadow-sm"
        style={{
          background: '#FFFFFF',
          border: `1px solid ${accent}40`,
          color: accent,
        }}
      >
        192.168.1.10 → 10.0.0.5
      </div>
    </motion.div>
  );
}

function MACFrame({ accent, dimmed }: { accent: string; dimmed?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`absolute inset-0 rounded-2xl pointer-events-none ${dimmed ? 'opacity-50' : ''}`}
      style={{
        border: `3px solid ${accent}30`,
        background: `linear-gradient(135deg, ${accent}06, transparent)`,
      }}
    >
      <div
        className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold tracking-[0.15em] px-2.5 py-1 rounded-lg shadow-sm"
        style={{ background: '#FFFFFF', color: accent, border: `1px solid ${accent}30` }}
      >
        AA:BB:CC:DD:EE:FF
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export function CourierDefinition({ onComplete }: { onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [showCards, setShowCards] = useState(false);
  const [finished, setFinished] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const [availableWords, setAvailableWords] = useState<string[]>([...DEFINITION_WORDS]);
  const [arrangedWords, setArrangedWords] = useState<string[]>([]);
  const [definitionResult, setDefinitionResult] = useState<string | null>(null);

  const handleNext = useCallback(() => {
    if (currentStep < 5) {
      setShowCards(false);
      setTimeout(() => {
        setCurrentStep((prev) => (prev + 1) as Step);
        setTimeout(() => setShowCards(true), 400);
      }, 150);
    } else if (currentStep === 5) {
      setShowCards(false);
      setTimeout(() => {
        setCurrentStep(6);
        setFinished(true);
      }, 300);
    }
  }, [currentStep]);

  const handleStart = useCallback(() => {
    setCurrentStep(1);
    setTimeout(() => setShowCards(true), 400);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setShowCards(false);
    setFinished(false);
    setAvailableWords([...DEFINITION_WORDS]);
    setArrangedWords([]);
    setDefinitionResult(null);
  }, []);

  const moveToArranged = (word: string) => {
    setAvailableWords((prev) => prev.filter((w) => w !== word));
    setArrangedWords((prev) => [...prev, word]);
    setDefinitionResult(null);
  };

  const moveToAvailable = (word: string) => {
    setArrangedWords((prev) => prev.filter((w) => w !== word));
    setAvailableWords((prev) => [...prev, word]);
    setDefinitionResult(null);
  };

  const checkDefinition = () => {
    if (arrangedWords.length === 0) return;
    setDefinitionResult(arrangedWords.join(' '));
  };

  const isCorrect = definitionResult === CORRECT_DEFINITION;
  const currentLayer = currentStep >= 1 && currentStep <= 5 ? LAYERS[currentStep - 1] : null;

  return (
    <div className="bg-white rounded-[2rem] border border-[#D5DEEF] overflow-hidden shadow-sm">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#F8FAFD] to-white px-8 pt-6 pb-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#D5DEEF]/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#628ECB]/10 border border-[#628ECB]/20 flex items-center justify-center">
            <Package className="w-5 h-5 text-[#628ECB]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#628ECB]/60 mb-0.5">
              Konteks Pembelajaran
            </p>
            <h3 className="text-base font-black text-[#395886] tracking-tight">
              Perjalanan Paket TCP/IP
            </h3>
          </div>
        </div>

        {currentStep > 0 && !finished && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-[11px] font-bold text-[#395886]/35 hover:text-[#628ECB] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#628ECB]/5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Ulangi
          </button>
        )}
      </div>

      {/* ── Progress Bar ───────────────────────────────────────────── */}
      {currentStep > 0 && currentStep <= 5 && (
        <div className="px-8 pt-5 pb-3">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((dot) => (
              <div key={dot} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full transition-all duration-500"
                  style={{
                    background:
                      dot <= currentStep ? LAYERS[dot - 1].accent : '#D5DEEF',
                  }}
                />
                {dot < 5 && (
                  <div
                    className="w-8 h-px transition-all duration-500"
                    style={{
                      background:
                        dot < currentStep ? `${LAYERS[dot].accent}55` : '#D5DEEF',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {LAYERS.map((l, i) => (
              <span
                key={l.id}
                className="text-[8px] font-bold uppercase tracking-wider transition-all duration-300"
                style={{
                  color: i < currentStep ? l.accent : '#D5DEEF',
                }}
              >
                L{l.id}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Initial State ──────────────────────────────────────────── */}
      {currentStep === 0 && (
        <div className="px-8 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-10"
          >
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 rounded-full bg-[#628ECB]/8 border border-[#628ECB]/15 flex items-center justify-center">
                <Network className="w-10 h-10 text-[#628ECB]" />
              </div>
            </div>
            <h4 className="text-lg font-black text-[#395886] mb-3">
              Bagaimana Data Dikirim Melalui Internet?
            </h4>
            <p className="text-sm text-[#395886]/55 max-w-md mx-auto leading-relaxed mb-8">
              Ikuti perjalanan sebuah paket data dari pengirim ke penerima melalui 5
              lapisan TCP/IP. Setiap tahap menambahkan &ldquo;bungkusan&rdquo; baru — seperti
              mengemas barang sebelum dikirim kurir.
            </p>
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2.5 bg-[#628ECB] text-white px-7 py-3.5 rounded-2xl text-sm font-black shadow-md hover:bg-[#5179B5] hover:shadow-lg transition-all active:scale-95"
            >
              Mulai Perjalanan
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}

      {/* ── Layer Animation Area ───────────────────────────────────── */}
      {currentStep >= 1 && currentStep <= 5 && (
        <div className="px-8 pb-6 space-y-4">
          {/* Step indicator */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-sm"
                style={{ background: currentLayer!.accent }}
              >
                {currentLayer!.id}
              </div>
              <div>
                <p className="text-sm font-black text-[#395886]">{currentLayer!.title}</p>
                <p className="text-[10px] font-bold text-[#395886]/40 uppercase tracking-wider">
                  {currentLayer!.badge}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Visualization */}
          <div className="rounded-2xl border border-[#D5DEEF] bg-[#F8FAFD] p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Sender + Receiver + Path */}
                <div className="flex items-center justify-between gap-6 mb-6">
                  <SenderNode label="Pengirim" />

                  <div className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full h-px bg-gradient-to-r from-[#628ECB]/20 via-[#D5DEEF] to-[#10B981]/20 relative">
                      {currentStep === 5 && (
                        <motion.div
                          className="absolute top-1/2 -translate-y-1/2 left-0 w-full"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {Array.from({ length: 8 }).map((_, i) => {
                            const hue = 210 + i * 30;
                            return (
                              <motion.div
                                key={i}
                                className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                                style={{
                                  left: `${12.5 * (i + 1)}%`,
                                  background: `hsl(${hue}, 60%, 55%)`,
                                }}
                                animate={{
                                  x: [0, 16, 0],
                                  opacity: [0.35, 0.9, 0.35],
                                }}
                                transition={{
                                  duration: 1.2,
                                  repeat: Infinity,
                                  delay: i * 0.15,
                                  ease: 'easeInOut',
                                }}
                              />
                            );
                          })}
                        </motion.div>
                      )}
                    </div>
                    <span className="text-[9px] font-bold text-[#395886]/20 uppercase tracking-[0.2em]">
                      Jalur Transmisi
                    </span>
                  </div>

                  <ReceiverNode label="Penerima" />
                </div>

                {/* Layer Visualization — Package building */}
                <div className="flex justify-center">
                  <div className="relative">
                    {/* Layer 5: Application */}
                    {currentStep >= 1 && (
                      <DataFile
                        accent={LAYERS[0].accent}
                        dimmed={currentStep > 1}
                      />
                    )}

                    {/* Layer 4: Transport */}
                    {currentStep >= 2 && (
                      <div className="mt-3">
                        <TransportBox
                          accent={LAYERS[1].accent}
                          dimmed={currentStep > 2}
                        >
                          <FileImage className="w-6 h-6" style={{ color: LAYERS[1].accent }} />
                        </TransportBox>
                      </div>
                    )}

                    {/* Layer 3: Network */}
                    {currentStep >= 3 && (
                      <div className="mt-3 relative">
                        <div
                          className="rounded-2xl border-2 border-dashed px-5 py-4 flex flex-col items-center gap-2"
                          style={{
                            borderColor: `${LAYERS[1].accent}30`,
                            background: `${LAYERS[1].accent}06`,
                            opacity: currentStep > 3 ? 0.6 : 1,
                          }}
                        >
                          <FileImage className="w-5 h-5" style={{ color: LAYERS[1].accent, opacity: 0.5 }} />
                          <span className="text-[8px] font-black uppercase text-[#395886]/25">Segmen 1/5</span>
                        </div>
                        <IPLabel accent={LAYERS[2].accent} dimmed={currentStep > 3} />
                      </div>
                    )}

                    {/* Layer 2: Data Link */}
                    {currentStep >= 4 && (
                      <div className="mt-4 relative">
                        <div
                          className="rounded-2xl border-2 border-dashed px-6 py-5 flex flex-col items-center gap-2 relative"
                          style={{
                            borderColor: `${LAYERS[1].accent}25`,
                            background: `${LAYERS[1].accent}04`,
                            opacity: currentStep > 4 ? 0.6 : 1,
                          }}
                        >
                          <div className="flex flex-col items-center gap-1 opacity-40">
                            <FileImage className="w-4 h-4" style={{ color: LAYERS[1].accent }} />
                            <span className="text-[7px] font-black text-[#395886]/25">DATA</span>
                          </div>
                          <div
                            className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] font-bold px-3 py-1 rounded-full bg-white shadow-sm"
                            style={{
                              color: LAYERS[2].accent,
                              border: `1px solid ${LAYERS[2].accent}30`,
                            }}
                          >
                            192.168.1.10 → 10.0.0.5
                          </div>
                        </div>
                        <MACFrame accent={LAYERS[3].accent} dimmed={currentStep > 4} />
                      </div>
                    )}

                    {/* Layer 1: Physical */}
                    {currentStep >= 5 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 flex flex-col items-center gap-3"
                      >
                        <div
                          className="rounded-2xl border-2 border-dashed px-6 py-4 flex items-center gap-3"
                          style={{
                            borderColor: `${LAYERS[4].accent}40`,
                            background: `${LAYERS[4].accent}06`,
                          }}
                        >
                          <Package className="w-5 h-5" style={{ color: LAYERS[4].accent }} />
                          <span
                            className="text-[10px] font-black tracking-wider"
                            style={{ color: LAYERS[4].accent }}
                          >
                            Paket Terenkapsulasi
                          </span>
                        </div>
                        <motion.div
                          animate={{ opacity: [0.3, 0.8, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="flex items-center gap-1"
                        >
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: LAYERS[4].accent }}
                            />
                          ))}
                          <Cable className="w-4 h-4" style={{ color: `${LAYERS[4].accent}55` }} />
                          {Array.from({ length: 5 }).map((_, i) => (
                            <motion.div
                              key={`b-${i}`}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: LAYERS[4].accent }}
                              animate={{ x: [0, 4, 0] }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.1,
                              }}
                            />
                          ))}
                        </motion.div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Info Cards */}
          {currentLayer && <InfoCards layer={currentLayer} visible={showCards} />}

          {/* Next Button */}
          <AnimatePresence>
            {showCards && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-center pt-1"
              >
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-black text-white shadow-md hover:shadow-lg transition-all active:scale-95"
                  style={{
                    background:
                      currentStep < 5
                        ? currentLayer!.accent
                        : 'linear-gradient(135deg, #628ECB, #10B981)',
                  }}
                >
                  {currentStep < 5 ? (
                    <>
                      Lanjutkan Perjalanan
                      <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Selesaikan & Bangun Definisi
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Definition Builder (Step 6) ────────────────────────────── */}
      {currentStep === 6 && (
        <div className="px-8 pb-8 space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-black text-[#395886]">Bangun Definisi TCP/IP</p>
                <p className="text-[10px] font-bold text-[#395886]/40 uppercase tracking-wider">
                  Interactive Definition Builder
                </p>
              </div>
            </div>

            <p className="text-sm text-[#395886]/60 leading-relaxed mb-5">
              Berdasarkan perjalanan paket data yang baru saja kamu lihat, susun kata-kata
              berikut menjadi definisi TCP/IP yang tepat. Klik kata untuk memindahkannya.
            </p>

            {/* Arranged words area */}
            <div className="rounded-2xl border-2 border-dashed border-[#D5DEEF] bg-[#F8FAFD] min-h-[56px] p-4 mb-4 flex flex-wrap items-center gap-2">
              {arrangedWords.length === 0 && (
                <span className="text-xs text-[#395886]/25 italic">
                  Susun kata di sini...
                </span>
              )}
              <AnimatePresence>
                {arrangedWords.map((word) => (
                  <motion.button
                    key={word}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    onClick={() => moveToAvailable(word)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-black transition-all active:scale-95 bg-[#628ECB]/10 border border-[#628ECB]/30 text-[#628ECB]"
                  >
                    {word}
                    <X className="w-3 h-3 opacity-40" />
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* Available words */}
            <div className="flex flex-wrap gap-2 mb-5">
              <AnimatePresence>
                {availableWords.map((word) => (
                  <motion.button
                    key={word}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    onClick={() => moveToArranged(word)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 bg-white border border-[#D5DEEF] text-[#395886]/70 hover:border-[#628ECB]/40 hover:text-[#628ECB] shadow-sm"
                  >
                    <GripVertical className="w-3 h-3 opacity-25" />
                    {word}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* Check & Reset */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={checkDefinition}
                disabled={arrangedWords.length === 0}
                className="inline-flex items-center gap-2 bg-[#628ECB] text-white px-5 py-2.5 rounded-xl text-sm font-black shadow-sm hover:bg-[#5179B5] hover:shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <BadgeCheck className="w-4 h-4" />
                Periksa Definisi
              </button>
              <button
                onClick={() => {
                  setArrangedWords([]);
                  setAvailableWords([...DEFINITION_WORDS]);
                  setDefinitionResult(null);
                }}
                className="inline-flex items-center gap-2 text-[#395886]/30 hover:text-[#628ECB] text-sm font-bold transition-colors px-3 py-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>

            {/* Result */}
            <AnimatePresence>
              {definitionResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-5"
                >
                  <div
                    className={`rounded-2xl border p-5 ${
                      isCorrect
                        ? 'border-[#10B981]/25 bg-[#F0FDF4]'
                        : 'border-amber-200 bg-amber-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <BadgeCheck
                        className={`w-5 h-5 mt-0.5 ${
                          isCorrect ? 'text-[#10B981]' : 'text-amber-500'
                        }`}
                      />
                      <div>
                        <p
                          className={`text-sm font-black mb-1 ${
                            isCorrect ? 'text-[#10B981]' : 'text-amber-600'
                          }`}
                        >
                          {isCorrect ? 'Definisi Tepat!' : 'Hampir Tepat!'}
                        </p>
                        <p className="text-lg font-bold text-[#395886] leading-relaxed">
                          &ldquo;{definitionResult}&rdquo;
                        </p>
                        {isCorrect && (
                          <p className="mt-2 text-xs text-[#395886]/60 leading-relaxed">
                            <strong>TCP/IP (Transmission Control Protocol / Internet Protocol)</strong> adalah
                            aturan universal pengiriman data utuh melalui jaringan internet, yang bekerja dalam
                            lapisan-lapisan enkapsulasi dari Application hingga Physical layer.
                          </p>
                        )}
                        {!isCorrect && (
                          <p className="mt-2 text-xs text-[#395886]/45">
                            Coba susun ulang kata-katanya agar membentuk definisi yang tepat.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Completion — Confirmation + Lanjut ke Aktivitas */}
            {definitionResult && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="mt-6 pt-5 border-t border-[#D5DEEF]/60"
              >
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                        confirmed
                          ? 'bg-[#628ECB] border-[#628ECB]'
                          : 'border-[#D5DEEF] bg-white group-hover:border-[#628ECB]/40'
                      }`}
                    >
                      {confirmed && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3 h-3 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </motion.svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-[#395886]/70 font-medium leading-relaxed">
                    Saya sudah memahami alur pengiriman data melalui animasi di atas
                  </span>
                </label>

                <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 text-[#395886]/30 hover:text-[#628ECB] text-xs font-bold transition-colors px-2 py-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Ulangi dari Awal
                  </button>
                  <button
                    onClick={onComplete}
                    disabled={!confirmed}
                    className="inline-flex items-center gap-2 bg-[#628ECB] text-white px-6 py-3 rounded-2xl text-sm font-black shadow-sm transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:bg-[#5179B5] enabled:hover:shadow-md"
                  >
                    Lanjut ke Aktivitas
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default CourierDefinition;
