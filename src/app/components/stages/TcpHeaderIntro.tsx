import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ChevronRight,
  Lightbulb,
  RefreshCw,
  BadgeCheck,
  Hash,
  Send,
  Flag,
  Shield,
  FileCheck,
  Layers,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

interface ComponentInfo {
  id: number;
  title: string;
  componentName: string;
  analogi: string;
  teknis: string;
  icon: React.ReactNode;
  accent: string;
  badge: string;
}

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// ── Component Data ─────────────────────────────────────────────────────────

const COMPONENTS: ComponentInfo[] = [
  {
    id: 1,
    title: 'Source Port & Destination Port',
    componentName: 'Port (16-bit + 16-bit)',
    analogi:
      'Ibarat nomor loket di kantor pos. Port 80 untuk surat biasa (HTTP), port 443 untuk surat rahasia (HTTPS). Port memastikan data dari aplikasi pengirim sampai ke aplikasi penerima yang tepat.',
    teknis:
      'Source Port (16-bit) = identitas aplikasi pengirim. Destination Port (16-bit) = identitas aplikasi penerima. Nilai 0–65535.',
    icon: <Send className="w-7 h-7" />,
    accent: '#8B5CF6',
    badge: '🔢 Identitas Aplikasi',
  },
  {
    id: 2,
    title: 'Sequence Number',
    componentName: 'Sequence Number (32-bit)',
    analogi:
      'Seperti nomor halaman di buku. Jika halaman 1, 3, 5, 2, 4 tiba tidak berurutan, berkat nomor halaman kamu tetap bisa menyusunnya kembali dengan benar.',
    teknis:
      'Sequence Number (32-bit) = nomor urut byte pertama dalam segmen ini. Memungkinkan penerima menyusun ulang data meskipun segmen tiba tidak berurutan.',
    icon: <Hash className="w-7 h-7" />,
    accent: '#3B82F6',
    badge: '🔢 Nomor Urut Byte',
  },
  {
    id: 3,
    title: 'Acknowledgment Number',
    componentName: 'Acknowledgment Number (32-bit)',
    analogi:
      'Seperti tanda terima paket: "Paket #1–10 sudah diterima. Tolong kirim #11 berikutnya." ACK memberi tahu pengirim byte mana yang sudah sampai dengan selamat.',
    teknis:
      'Acknowledgment Number (32-bit) = nomor byte berikutnya yang diharapkan penerima. Semua byte sebelum nomor ini sudah diterima dengan benar.',
    icon: <FileCheck className="w-7 h-7" />,
    accent: '#10B981',
    badge: '✅ Konfirmasi Penerimaan',
  },
  {
    id: 4,
    title: 'TCP Flags',
    componentName: 'Flags (9-bit: SYN, ACK, FIN, RST, dll.)',
    analogi:
      'Seperti isyarat tangan dalam rapat: Angkat tangan (SYN) = mau mulai bicara, Anggukan (ACK) = paham, Lambaian (FIN) = selesai, Tanda stop (RST) = darurat!',
    teknis:
      'SYN=1: mulai koneksi. ACK=1: konfirmasi data. FIN=1: tutup koneksi. RST=1: hentikan darurat. Setiap flag hanya 1 bit.',
    icon: <Flag className="w-7 h-7" />,
    accent: '#F59E0B',
    badge: '🚩 Status Koneksi',
  },
  {
    id: 5,
    title: 'Window Size',
    componentName: 'Window Size (16-bit)',
    analogi:
      'Seperti nampan kasir: "Saya hanya bisa terima 10 barang dulu." Kalau nampan penuh, Window Size = 0 artinya "berhenti, jangan kirim lagi!" Ini mencegah pengirim membanjiri penerima.',
    teknis:
      'Window Size (16-bit) = jumlah byte yang boleh dikirim sebelum menunggu ACK. Mekanisme Flow Control TCP. Nilai 0 = zero window (berhenti sementara).',
    icon: <Layers className="w-7 h-7" />,
    accent: '#EC4899',
    badge: '📏 Pengatur Kecepatan',
  },
  {
    id: 6,
    title: 'Checksum',
    componentName: 'Checksum (16-bit)',
    analogi:
      'Seperti segel keamanan di paket kiriman. Penerima memeriksa ulang segelnya — jika rusak atau berbeda, artinya isi paket mungkin berubah di perjalanan dan harus dikirim ulang.',
    teknis:
      'Checksum (16-bit) = nilai yang dihitung dari seluruh isi segmen (data + header). Penerima menghitung ulang dan membandingkan. Jika berbeda → data rusak → kirim ulang.',
    icon: <Shield className="w-7 h-7" />,
    accent: '#6366F1',
    badge: '🛡️ Verifikasi Keutuhan',
  },
];

// ── Sub‑components ─────────────────────────────────────────────────────────

function InfoCards({ component, visible }: { component: ComponentInfo; visible: boolean }) {
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
                Analogi Sederhana
              </p>
            </div>
            <p className="text-sm text-[#395886]/80 leading-relaxed">{component.analogi}</p>
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
            <p className="text-sm text-[#395886]/80 leading-relaxed">{component.teknis}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TcpHeaderVisual({ currentStep }: { currentStep: number }) {
  // Header fields layout — visualized as a table
  const fields = [
    { bit: '0–15',   label: 'Source Port',      color: '#8B5CF6', active: currentStep >= 1 },
    { bit: '16–31',  label: 'Destination Port',  color: '#8B5CF6', active: currentStep >= 1 },
    { bit: '32–63',  label: 'Sequence Number',   color: '#3B82F6', active: currentStep >= 2 },
    { bit: '64–95',  label: 'Acknowledgment Nr', color: '#10B981', active: currentStep >= 3 },
    { bit: '96–99',  label: 'Data Offset',       color: '#D5DEEF', active: false },
    { bit: '100–105',label: 'Reserved',           color: '#D5DEEF', active: false },
    { bit: '106–114',label: 'Flags',              color: '#F59E0B', active: currentStep >= 4 },
    { bit: '115–127',label: 'Window Size',        color: '#EC4899', active: currentStep >= 5 },
    { bit: '128–143',label: 'Checksum',           color: '#6366F1', active: currentStep >= 6 },
    { bit: '144–159',label: 'Urgent Pointer',     color: '#D5DEEF', active: false },
  ];

  return (
    <div className="rounded-2xl border border-[#D5DEEF] bg-[#F8FAFD] p-5">
      <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40 mb-3 text-center">
        Tata Letak TCP Header (20 byte / 160 bit)
      </p>
      <div className="grid grid-cols-2 gap-1.5 max-w-lg mx-auto">
        {fields.map((f, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0.3 }}
            animate={{
              opacity: f.active ? 1 : 0.3,
              scale: f.active ? 1.02 : 1,
            }}
            transition={{ duration: 0.5 }}
            className="rounded-lg border px-2.5 py-2 text-center"
            style={{
              borderColor: f.active ? `${f.color}40` : '#D5DEEF',
              background: f.active ? `${f.color}10` : '#FFFFFF',
            }}
          >
            <p
              className="text-[8px] font-mono font-bold"
              style={{ color: f.active ? f.color : '#D5DEEF' }}
            >
              {f.bit}
            </p>
            <p
              className="text-[9px] font-bold mt-0.5"
              style={{ color: f.active ? '#395886' : '#D5DEEF' }}
            >
              {f.label}
            </p>
          </motion.div>
        ))}
      </div>
      <p className="text-[8px] text-[#395886]/30 text-center mt-3">
        Hanya 6 komponen utama yang ditampilkan — Data Offset, Reserved, dan Urgent Pointer adalah field tambahan
      </p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export function TcpHeaderIntro({ onComplete }: { onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [showCards, setShowCards] = useState(false);
  const [finished, setFinished] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleNext = useCallback(() => {
    if (currentStep < 6) {
      setShowCards(false);
      setTimeout(() => {
        setCurrentStep((prev) => (prev + 1) as Step);
        setTimeout(() => setShowCards(true), 400);
      }, 150);
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
    setConfirmed(false);
  }, []);

  // After step 6, show summary
  const handleSummary = useCallback(() => {
    setShowCards(false);
    setTimeout(() => {
      setCurrentStep(6);
      setFinished(true);
    }, 300);
  }, []);

  const currentComponent = currentStep >= 1 && currentStep <= 6 ? COMPONENTS[currentStep - 1] : null;

  return (
    <div className="bg-white rounded-[2rem] border border-[#D5DEEF] overflow-hidden shadow-sm">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#F8FAFD] to-white px-8 pt-6 pb-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#D5DEEF]/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#6366F1]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#6366F1]/60 mb-0.5">
              Konteks Pembelajaran
            </p>
            <h3 className="text-base font-black text-[#395886] tracking-tight">
              Anatomi TCP Header
            </h3>
          </div>
        </div>

        {currentStep > 0 && !finished && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-[11px] font-bold text-[#395886]/35 hover:text-[#6366F1] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#6366F1]/5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Ulangi
          </button>
        )}
      </div>

      {/* ── Progress Bar ───────────────────────────────────────────── */}
      {currentStep > 0 && currentStep <= 6 && (
        <div className="px-8 pt-5 pb-3">
          <div className="flex items-center gap-1">
            {COMPONENTS.map((comp, i) => (
              <div key={comp.id} className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full transition-all duration-500"
                  style={{
                    background: i < currentStep ? comp.accent : '#D5DEEF',
                  }}
                />
                {i < 5 && (
                  <div
                    className="w-5 h-px transition-all duration-500"
                    style={{
                      background: i < currentStep - 1 ? `${comp.accent}55` : '#D5DEEF',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {COMPONENTS.map((c, i) => (
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

      {/* ── Initial State ──────────────────────────────────────────── */}
      {currentStep === 0 && (
        <div className="px-8 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-10"
          >
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 rounded-full bg-[#6366F1]/8 border border-[#6366F1]/15 flex items-center justify-center">
                <Layers className="w-10 h-10 text-[#6366F1]" />
              </div>
            </div>
            <h4 className="text-lg font-black text-[#395886] mb-3">
              Apa Isi TCP Header?
            </h4>
            <p className="text-sm text-[#395886]/55 max-w-md mx-auto leading-relaxed mb-8">
              Setiap kali data dikirim melalui TCP, data dibungkus dengan TCP Header — sebuah
              &ldquo;amplop pintar&rdquo; berisi 6 komponen utama. Jelajahi satu per satu
              untuk memahami fungsi setiap bagian.
            </p>
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2.5 bg-[#6366F1] text-white px-7 py-3.5 rounded-2xl text-sm font-black shadow-md hover:bg-[#4F46E5] hover:shadow-lg transition-all active:scale-95"
            >
              Mulai Eksplorasi
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}

      {/* ── Component Exploration ──────────────────────────────────── */}
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
                style={{ background: currentComponent!.accent }}
              >
                {currentComponent!.id}
              </div>
              <div>
                <p className="text-sm font-black text-[#395886]">{currentComponent!.title}</p>
                <p className="text-[10px] font-bold text-[#395886]/40 uppercase tracking-wider">
                  {currentComponent!.badge}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* TCP Header Visual */}
          <TcpHeaderVisual currentStep={currentStep} />

          {/* Info Cards */}
          {currentComponent && <InfoCards component={currentComponent} visible={showCards} />}

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
                  onClick={currentStep < 5 ? (() => handleNext()) : (() => setCurrentStep(6))}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-black text-white shadow-md hover:shadow-lg transition-all active:scale-95"
                  style={{
                    background: currentComponent!.accent,
                  }}
                >
                  {currentStep < 5 ? (
                    <>
                      Lanjut ke Komponen Berikutnya
                      <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Lihat Ringkasan TCP Header
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Summary (Step 6) ───────────────────────────────────────── */}
      {currentStep === 6 && (
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
                <p className="text-sm font-black text-[#395886]">Ringkasan TCP Header</p>
                <p className="text-[10px] font-bold text-[#395886]/40 uppercase tracking-wider">
                  6 Komponen Utama
                </p>
              </div>
            </div>

            {/* Full TCP Header Visual */}
            <TcpHeaderVisual currentStep={6} />

            {/* All components summary */}
            <div className="mt-5 grid sm:grid-cols-2 gap-2.5">
              {COMPONENTS.map(comp => (
                <div
                  key={comp.id}
                  className="rounded-xl border px-4 py-3"
                  style={{ borderColor: `${comp.accent}25`, background: `${comp.accent}06` }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black text-white"
                      style={{ background: comp.accent }}
                    >
                      {comp.id}
                    </div>
                    <span className="text-[11px] font-black text-[#395886]">{comp.title}</span>
                  </div>
                  <p className="text-[10px] text-[#395886]/50 leading-relaxed">{comp.componentName}</p>
                </div>
              ))}
            </div>

            {/* Confirmation + Lanjut */}
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
                        ? 'bg-[#6366F1] border-[#6366F1]'
                        : 'border-[#D5DEEF] bg-white group-hover:border-[#6366F1]/40'
                    }`}
                  >
                    {confirmed && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 text-white"
                        viewBox="0 0 24 24"
                        fill="none" stroke="currentColor"
                        strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </motion.svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-[#395886]/70 font-medium leading-relaxed">
                  Saya sudah memahami 6 komponen utama TCP Header dan fungsi masing-masing
                </span>
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-[#395886]/30 hover:text-[#6366F1] text-xs font-bold transition-colors px-2 py-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Ulangi dari Awal
                </button>
                <button
                  onClick={onComplete}
                  disabled={!confirmed}
                  className="inline-flex items-center gap-2 bg-[#6366F1] text-white px-6 py-3 rounded-2xl text-sm font-black shadow-sm transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:bg-[#4F46E5] enabled:hover:shadow-md"
                >
                  Lanjut ke Aktivitas Berikutnya
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

export default TcpHeaderIntro;
