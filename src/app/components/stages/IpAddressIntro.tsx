import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ChevronRight,
  Lightbulb,
  RefreshCw,
  BadgeCheck,
  MapPin,
  Layers,
  Package,
  Network,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

interface ConceptInfo {
  id: number;
  title: string;
  componentName: string;
  analogi: string;
  teknis: string;
  icon: React.ReactNode;
  accent: string;
  badge: string;
}

type Step = 0 | 1 | 2 | 3 | 4 | 5;

// ── Concept Data ───────────────────────────────────────────────────────────

const CONCEPTS: ConceptInfo[] = [
  {
    id: 1,
    title: 'IP Address',
    componentName: 'Alamat Logis 32-bit (4 Oktet)',
    analogi:
      'Bayangkan setiap perangkat seperti sebuah rumah di komplek besar. Setiap rumah punya nomor unik — tanpa nomor, kurir tidak tahu harus antar paket ke mana. Di jaringan, IP Address adalah "nomor rumah digital" yang unik untuk setiap perangkat agar data selalu sampai ke tujuan yang tepat.',
    teknis:
      'IP Address adalah alamat logis 32-bit yang ditulis sebagai 4 angka desimal dipisah titik (contoh: 192.168.1.10). Setiap oktet bernilai 0–255. Memberi setiap perangkat identitas unik agar dapat dikenali dan dihubungi di jaringan.',
    icon: <MapPin className="w-7 h-7" />,
    accent: '#3B82F6',
    badge: '📍 Alamat Unik Perangkat',
  },
  {
    id: 2,
    title: 'Internet Protocol (IP)',
    componentName: 'Protokol pada Network Layer (Layer 3)',
    analogi:
      'IP adalah "petugas pos" di jaringan — ia bertugas menulis alamat pengirim dan penerima di setiap amplop data, lalu memastikan amplop itu dikirim melalui jalur yang benar hingga sampai ke tujuan. Tanpa IP, data tidak punya "label pengiriman" dan tidak akan tahu ke mana harus pergi.',
    teknis:
      'Internet Protocol (IP) bekerja di Layer 3 (Network Layer) dalam model TCP/IP. IP menambahkan IP Header ke setiap paket data — berisi Source IP Address, Destination IP Address, TTL, Protocol, dan Checksum — lalu menentukan jalur pengirimannya.',
    icon: <Layers className="w-7 h-7" />,
    accent: '#6366F1',
    badge: '🔌 Layer 3 — Network Layer',
  },
  {
    id: 3,
    title: 'Paket IP',
    componentName: 'IP Header (≥20 byte) + Payload Data',
    analogi:
      'Seperti amplop berisi surat — amplop (IP Header) punya label "dari mana" dan "ke mana", sedangkan surat di dalamnya (payload) adalah data aslinya. Router di sepanjang jalur hanya membaca labelnya, tidak perlu membuka isi suratnya untuk meneruskan pengiriman.',
    teknis:
      'Setiap paket IP terdiri dari IP Header (min. 20 byte) dan Payload. IP Header memuat: Version (4-bit), IHL, TTL, Protocol, Header Checksum, Source IP Address (32-bit), dan Destination IP Address (32-bit).',
    icon: <Package className="w-7 h-7" />,
    accent: '#10B981',
    badge: '📦 IP Header + Payload',
  },
  {
    id: 4,
    title: 'Routing',
    componentName: 'Pemilihan Jalur Paket Antar Jaringan',
    analogi:
      'Router bekerja seperti GPS di setiap persimpangan — setiap kali menerima paket, router membaca Destination IP Address dan memilih jalan terbaik untuk meneruskannya ke hop berikutnya. Proses ini berulang di setiap router sampai paket akhirnya tiba di tujuan.',
    teknis:
      'Routing adalah proses pemilihan jalur terbaik untuk meneruskan paket berdasarkan Destination IP Address. Router menggunakan routing table untuk menentukan next hop bagi setiap paket. Proses terus berulang hingga paket mencapai tujuan akhir.',
    icon: <Network className="w-7 h-7" />,
    accent: '#F59E0B',
    badge: '🗺️ Pemilihan Jalur Paket',
  },
];

// ── Network Visual ─────────────────────────────────────────────────────────

function IpNetworkVisual({ currentStep }: { currentStep: number }) {
  const showIpLabels = currentStep >= 1;
  const showRouter = currentStep === 4 || currentStep === 5;

  if (currentStep === 2) {
    const layers = [
      { name: 'Application Layer', color: '#D5DEEF', isActive: false },
      { name: 'Transport Layer', color: '#D5DEEF', isActive: false },
      { name: 'Network Layer  ★ IP', color: '#6366F1', isActive: true },
      { name: 'Data Link Layer', color: '#D5DEEF', isActive: false },
      { name: 'Physical Layer', color: '#D5DEEF', isActive: false },
    ];
    return (
      <div className="rounded-2xl border border-[#D5DEEF] bg-[#F8FAFD] p-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40 mb-3 text-center">
          Model TCP/IP — Layer yang Aktif
        </p>
        <div className="max-w-xs mx-auto space-y-1.5">
          {layers.map((layer, i) => (
            <motion.div
              key={i}
              initial={{ opacity: layer.isActive ? 0.5 : 0.25 }}
              animate={{ opacity: layer.isActive ? 1 : 0.35, scale: layer.isActive ? 1.02 : 1 }}
              transition={{ duration: 0.5 }}
              className="rounded-xl border px-4 py-2 text-center"
              style={{
                borderColor: layer.isActive ? `${layer.color}50` : '#D5DEEF',
                background: layer.isActive ? `${layer.color}12` : '#FFFFFF',
              }}
            >
              <p className="text-[11px] font-bold" style={{ color: layer.isActive ? layer.color : '#C8D8F0' }}>
                {layer.name.replace(' ★ IP', '')}
              </p>
              {layer.isActive && (
                <p className="text-[8px] text-[#6366F1]/60 mt-0.5">Internet Protocol (IP) bekerja di sini</p>
              )}
            </motion.div>
          ))}
        </div>
        <p className="text-[8px] text-[#395886]/30 text-center mt-3">
          ⭐ Network Layer (Layer 3) — tempat Internet Protocol mengalamati & merutekan paket
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#D5DEEF] bg-[#F8FAFD] p-5">
      <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40 mb-4 text-center">
        Simulasi Komunikasi Perangkat
      </p>

      <div className="flex items-center justify-center gap-2 py-1 flex-wrap">
        {/* Device A */}
        <div className="flex flex-col items-center gap-1 min-w-[68px]">
          <div className="w-14 h-14 rounded-2xl bg-[#3B82F6]/10 border-2 border-[#3B82F6]/25 flex items-center justify-center text-2xl select-none">
            💻
          </div>
          <p className="text-[9px] font-black text-[#395886]">Laptop A</p>
          {showIpLabels && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-1.5 py-0.5 rounded-full text-[7px] font-black bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#3B82F6]"
            >
              192.168.1.10
            </motion.div>
          )}
        </div>

        {/* Middle — arrow or animated packet */}
        <div className="flex items-center justify-center w-16 overflow-hidden">
          {currentStep === 3 ? (
            <motion.div
              animate={{ x: [-28, 0, 28], opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-lg border border-[#10B981]/50 bg-[#10B981]/15 px-1.5 py-1 text-center"
            >
              <p className="text-[6px] font-black text-[#10B981] whitespace-nowrap">📦 Paket IP</p>
              <p className="text-[5.5px] text-[#10B981]/70 whitespace-nowrap">Dst: 203.0.113.5</p>
            </motion.div>
          ) : (
            <div className="flex items-center gap-0.5 w-full">
              <div className="flex-1 border-t-2 border-dashed border-[#D5DEEF]" />
              <ArrowRight className="w-3.5 h-3.5 text-[#395886]/25 flex-shrink-0" />
            </div>
          )}
        </div>

        {/* Router (step 4 & summary) */}
        {showRouter && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-1 min-w-[52px]"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 border-2 border-[#F59E0B]/30 flex items-center justify-center text-xl select-none">
                🔀
              </div>
              <p className="text-[8px] font-black text-[#F59E0B]">Router</p>
              <div className="px-1.5 py-0.5 rounded-full text-[6px] font-bold bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B]">
                Routing
              </div>
            </motion.div>
            <div className="flex items-center gap-0.5 w-10">
              <div className="flex-1 border-t-2 border-dashed border-[#D5DEEF]" />
              <ArrowRight className="w-3.5 h-3.5 text-[#395886]/25 flex-shrink-0" />
            </div>
          </>
        )}

        {/* Device B / Server */}
        <div className="flex flex-col items-center gap-1 min-w-[68px]">
          <div className="w-14 h-14 rounded-2xl bg-[#10B981]/10 border-2 border-[#10B981]/25 flex items-center justify-center text-2xl select-none">
            🌐
          </div>
          <p className="text-[9px] font-black text-[#395886]">Server Web</p>
          {showIpLabels && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-1.5 py-0.5 rounded-full text-[7px] font-black bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981]"
            >
              203.0.113.5
            </motion.div>
          )}
        </div>
      </div>

      <p className="text-[8px] text-[#395886]/30 text-center mt-3">
        {currentStep === 0 && '❓ Bagaimana data tahu harus dikirim ke mana?'}
        {currentStep === 1 && '✅ Setiap perangkat memiliki IP Address unik sebagai identitas di jaringan'}
        {currentStep === 3 && '📦 Paket IP berisi IP Header dengan alamat sumber dan tujuan'}
        {currentStep === 4 && '🗺️ Router membaca Destination IP dan meneruskan paket ke tujuan'}
        {currentStep === 5 && '🔗 IP Address + IP Protocol + Paket + Routing = Komunikasi Jaringan Utuh'}
      </p>
    </div>
  );
}

// ── Info Cards ──────────────────────────────────────────────────────────────

function InfoCards({ concept, visible }: { concept: ConceptInfo; visible: boolean }) {
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
          <div className="rounded-2xl border border-[#D5DEEF] bg-white/70 backdrop-blur-sm px-5 py-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/80">
                Analogi Sederhana
              </p>
            </div>
            <p className="text-sm text-[#395886]/80 leading-relaxed">{concept.analogi}</p>
          </div>

          <div className="rounded-2xl border border-[#D5DEEF] bg-white/70 backdrop-blur-sm px-5 py-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-[#628ECB]/10 border border-[#628ECB]/20 flex items-center justify-center">
                <BadgeCheck className="w-3.5 h-3.5 text-[#628ECB]" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]/70">
                Istilah Teknis
              </p>
            </div>
            <p className="text-sm text-[#395886]/80 leading-relaxed">{concept.teknis}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export function IpAddressIntro({ onComplete }: { onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [showCards, setShowCards] = useState(false);
  const [finished, setFinished] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleNext = useCallback(() => {
    setShowCards(false);
    setTimeout(() => {
      setCurrentStep((prev) => (prev + 1) as Step);
      setTimeout(() => setShowCards(true), 400);
    }, 150);
  }, []);

  const handleStart = useCallback(() => {
    setCurrentStep(1);
    setTimeout(() => setShowCards(true), 400);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setShowCards(false);
    setFinished(false);
    setConfirmed(false);
  }, []);

  const handleShowSummary = useCallback(() => {
    setShowCards(false);
    setTimeout(() => {
      setCurrentStep(5);
      setFinished(true);
    }, 300);
  }, []);

  const currentConcept = currentStep >= 1 && currentStep <= 4 ? CONCEPTS[currentStep - 1] : null;

  return (
    <div className="bg-white rounded-[2rem] border border-[#D5DEEF] overflow-hidden shadow-sm">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#F8FAFD] to-white px-8 pt-6 pb-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#D5DEEF]/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-[#3B82F6]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3B82F6]/60 mb-0.5">
              Konteks Pembelajaran
            </p>
            <h3 className="text-base font-black text-[#395886] tracking-tight">
              Internet Protocol &amp; IP Address
            </h3>
          </div>
        </div>

        {currentStep > 0 && !finished && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-[11px] font-bold text-[#395886]/35 hover:text-[#3B82F6] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#3B82F6]/5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Ulangi
          </button>
        )}
      </div>

      {/* ── Progress Bar ───────────────────────────────────────────────── */}
      {currentStep > 0 && currentStep <= 4 && (
        <div className="px-8 pt-5 pb-3">
          <div className="flex items-center gap-1">
            {CONCEPTS.map((c, i) => (
              <div key={c.id} className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full transition-all duration-500"
                  style={{ background: i < currentStep ? c.accent : '#D5DEEF' }}
                />
                {i < 3 && (
                  <div
                    className="w-8 h-px transition-all duration-500"
                    style={{ background: i < currentStep - 1 ? `${c.accent}55` : '#D5DEEF' }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-9 mt-1">
            {CONCEPTS.map((c, i) => (
              <span
                key={c.id}
                className="text-[7px] font-bold uppercase tracking-wider transition-all duration-300"
                style={{ color: i < currentStep ? c.accent : '#D5DEEF' }}
              >
                {c.id}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 0: Intro ──────────────────────────────────────────────── */}
      {currentStep === 0 && (
        <div className="px-8 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-10"
          >
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 rounded-full bg-[#3B82F6]/8 border border-[#3B82F6]/15 flex items-center justify-center text-4xl">
                📡
              </div>
            </div>
            <h4 className="text-lg font-black text-[#395886] mb-3">
              Bagaimana Perangkat Saling Berkomunikasi?
            </h4>
            <p className="text-sm text-[#395886]/55 max-w-md mx-auto leading-relaxed mb-2">
              Di internet, miliaran perangkat saling berkomunikasi setiap detik. Agar data tidak
              nyasar, setiap perangkat butuh{' '}
              <strong className="text-[#395886]/75">alamat unik</strong> — inilah peran{' '}
              <strong className="text-[#3B82F6]">IP Address</strong> dan{' '}
              <strong className="text-[#6366F1]">Internet Protocol</strong>.
            </p>
            <p className="text-xs text-[#395886]/35 mb-8">
              Jelajahi 4 konsep kunci untuk memahaminya.
            </p>
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2.5 bg-[#3B82F6] text-white px-7 py-3.5 rounded-2xl text-sm font-black shadow-md hover:bg-[#2563EB] hover:shadow-lg transition-all active:scale-95"
            >
              Mulai Eksplorasi
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}

      {/* ── Steps 1–4: Concept Exploration ────────────────────────────── */}
      {currentStep >= 1 && currentStep <= 4 && currentConcept && (
        <div className="px-8 pb-6 space-y-4">
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
                style={{ background: currentConcept.accent }}
              >
                {currentConcept.id}
              </div>
              <div>
                <p className="text-sm font-black text-[#395886]">{currentConcept.title}</p>
                <p className="text-[10px] font-bold text-[#395886]/40 uppercase tracking-wider">
                  {currentConcept.badge}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <IpNetworkVisual currentStep={currentStep} />

          <InfoCards concept={currentConcept} visible={showCards} />

          <AnimatePresence>
            {showCards && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-center pt-1"
              >
                <button
                  onClick={currentStep < 4 ? handleNext : handleShowSummary}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-black text-white shadow-md hover:shadow-lg transition-all active:scale-95"
                  style={{ background: currentConcept.accent }}
                >
                  {currentStep < 4 ? (
                    <>
                      Lanjut ke Konsep Berikutnya
                      <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Lihat Ringkasan
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Step 5: Summary ────────────────────────────────────────────── */}
      {currentStep === 5 && finished && (
        <div className="px-8 py-6 space-y-5">
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
                <p className="text-sm font-black text-[#395886]">Ringkasan Internet Protocol</p>
                <p className="text-[10px] font-bold text-[#395886]/40 uppercase tracking-wider">
                  4 Konsep Kunci
                </p>
              </div>
            </div>

            <IpNetworkVisual currentStep={5} />

            <div className="mt-5 grid sm:grid-cols-2 gap-2.5">
              {CONCEPTS.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border px-4 py-3"
                  style={{ borderColor: `${c.accent}25`, background: `${c.accent}06` }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black text-white"
                      style={{ background: c.accent }}
                    >
                      {c.id}
                    </div>
                    <span className="text-[11px] font-black text-[#395886]">{c.title}</span>
                  </div>
                  <p className="text-[10px] text-[#395886]/50 leading-relaxed">{c.componentName}</p>
                </div>
              ))}
            </div>

            {/* Confirmation */}
            <div className="mt-6 pt-5 border-t border-[#D5DEEF]/60">
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
                        ? 'bg-[#3B82F6] border-[#3B82F6]'
                        : 'border-[#D5DEEF] bg-white group-hover:border-[#3B82F6]/40'
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
                  Saya sudah memahami peran IP Address dan Internet Protocol pada Network Layer dalam
                  komunikasi jaringan
                </span>
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-[#395886]/30 hover:text-[#3B82F6] text-xs font-bold transition-colors px-2 py-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Ulangi dari Awal
                </button>
                <button
                  onClick={onComplete}
                  disabled={!confirmed}
                  className="inline-flex items-center gap-2 bg-[#3B82F6] text-white px-6 py-3 rounded-2xl text-sm font-black shadow-sm transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:bg-[#2563EB] enabled:hover:shadow-md"
                >
                  Lanjut ke Aktivitas Matching
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default IpAddressIntro;
