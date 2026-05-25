import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ChevronRight,
  Lightbulb,
  RefreshCw,
  BadgeCheck,
  CheckCircle,
  MapPin,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

interface StoryStep {
  id: number;
  title: string;
  subtitle: string;
  accent: string;
  analogy: string;
  teknis: string;
}

// ── Story Steps ────────────────────────────────────────────────────────────

const STORY_STEPS: StoryStep[] = [
  {
    id: 1,
    title: 'Laptop A Ingin Mengirim Data ke HP B',
    subtitle: 'Dua perangkat di jaringan berbeda ingin berkomunikasi',
    accent: '#6366F1',
    analogy:
      'Bayangkan kamu ingin mengirim bingkisan ke teman yang tinggal di kota lain. Kamu tahu nama teman kamu — tapi untuk mengirimnya, kamu perlu tahu alamat rumahnya yang lengkap dan tepat. Tanpa alamat, bingkisan tidak akan pernah sampai.',
    teknis:
      'Laptop A (IP: 192.168.1.10) dan HP B (IP: 203.0.113.5) berada di jaringan yang berbeda. Agar data bisa dikirim antar keduanya, dibutuhkan mekanisme pengalamatan — inilah tugas utama Internet Protocol di Network Layer.',
  },
  {
    id: 2,
    title: 'Internet Protocol Membungkus Data Menjadi Paket',
    subtitle: 'Network Layer mengemas data dengan IP Header',
    accent: '#8B5CF6',
    analogy:
      'Seperti memasukkan surat ke dalam amplop — Internet Protocol mengambil data dari lapisan atas (Transport Layer) dan membungkusnya menjadi sebuah "Paket IP" yang siap perjalanan melalui jaringan. Amplop inilah yang membawa informasi pengiriman.',
    teknis:
      'Internet Protocol (IP) bekerja di Network Layer (Layer 3 TCP/IP). IP menambahkan IP Header ke segmen data dari Transport Layer, membentuk Paket IP. IP Header berisi field-field penting: Version, TTL, Protocol, Source IP, dan Destination IP Address.',
  },
  {
    id: 3,
    title: 'IP Address — Setiap Perangkat Punya Alamat Unik',
    subtitle: 'Paket harus tahu ke mana harus diantarkan!',
    accent: '#3B82F6',
    analogy:
      'Seperti nomor rumah di sebuah jalan — setiap rumah punya nomor unik agar kurir tahu persis ke mana harus mengantar. Tanpa nomor rumah, kurir akan kebingungan di depan deretan rumah yang mirip. Di jaringan, IP Address adalah "nomor rumah digital" yang unik untuk setiap perangkat.',
    teknis:
      'IP Address adalah alamat logis 32-bit yang ditulis sebagai 4 oktet desimal dipisah titik (contoh: 192.168.1.10). IP Header menyimpan dua alamat kunci: Source IP Address (pengirim: 192.168.1.10) dan Destination IP Address (tujuan: 203.0.113.5) — inilah "label pengiriman" pada setiap paket.',
  },
  {
    id: 4,
    title: 'Router Membaca Alamat & Meneruskan Paket',
    subtitle: 'Paket melompat dari router ke router menuju tujuan',
    accent: '#F59E0B',
    analogy:
      'Seperti GPS yang memandu perjalanan paket kiriman — di setiap persimpangan jalan (router), kurir membaca alamat tujuan di amplop dan memilih jalan yang paling efisien untuk melanjutkan perjalanan. Proses ini berulang terus sampai paket akhirnya tiba di kota tujuan.',
    teknis:
      'Setiap router membaca Destination IP Address pada IP Header dan mencocokkannya dengan routing table untuk menentukan next hop (router berikutnya). Proses ini disebut Routing — berlanjut hop demi hop sampai paket mencapai jaringan tujuan dan diantarkan ke perangkat yang tepat.',
  },
  {
    id: 5,
    title: 'Paket Tiba! Komunikasi Berhasil ✅',
    subtitle: 'HP B menerima data dari Laptop A dengan tepat',
    accent: '#10B981',
    analogy:
      'Bingkisan berhasil tiba di rumah teman kamu! Berkat alamat yang jelas (IP Address) dan sistem pengiriman yang andal (Internet Protocol), data berhasil melakukan perjalanan dari Laptop A dan tiba persis di HP B — tidak nyasar ke perangkat lain di jaringan.',
    teknis:
      'HP B menerima Paket IP karena Destination IP Address cocok dengan IP-nya sendiri. HP B membaca Source IP (mengetahui data dari siapa) dan meneruskan payload ke Transport Layer. Internet Protocol berhasil memastikan paket terkirim dari sumber (192.168.1.10) ke tujuan (203.0.113.5) secara akurat.',
  },
];

// ── Scene Visuals (per step) ───────────────────────────────────────────────

function Scene1() {
  return (
    <div className="flex items-center justify-center gap-4 py-2 flex-wrap">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-center gap-1.5">
        <div className="w-16 h-16 rounded-2xl bg-[#6366F1]/10 border-2 border-[#6366F1]/30 flex items-center justify-center text-3xl select-none">💻</div>
        <p className="text-[9px] font-black text-[#395886]">Laptop A</p>
        <div className="px-2 py-0.5 rounded-full text-[7px] font-black bg-[#6366F1]/10 border border-[#6366F1]/30 text-[#6366F1]">192.168.1.10</div>
      </motion.div>

      <div className="flex flex-col items-center gap-2">
        <motion.p
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="text-xl"
        >❓</motion.p>
        <div className="w-14 border-t-2 border-dashed border-[#D5DEEF]" />
        <p className="text-[7px] text-[#395886]/35 font-bold">Bagaimana<br/>caranya?</p>
      </div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-center gap-1.5">
        <div className="w-16 h-16 rounded-2xl bg-[#10B981]/10 border-2 border-[#10B981]/30 flex items-center justify-center text-3xl select-none">📱</div>
        <p className="text-[9px] font-black text-[#395886]">HP B</p>
        <div className="px-2 py-0.5 rounded-full text-[7px] font-black bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981]">203.0.113.5</div>
      </motion.div>
    </div>
  );
}

function Scene2() {
  return (
    <div className="flex items-center justify-center gap-3 py-2 flex-wrap">
      <div className="flex flex-col items-center gap-1.5 opacity-60">
        <div className="w-13 h-13 rounded-xl bg-[#8B5CF6]/10 border-2 border-[#8B5CF6]/25 flex items-center justify-center text-2xl select-none">💻</div>
        <p className="text-[8px] font-black text-[#395886]">Laptop A</p>
      </div>

      <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1, repeat: Infinity }}>
        <ArrowRight className="w-4 h-4 text-[#8B5CF6]/40" />
      </motion.div>

      {/* Raw data */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: 'spring' }}
        className="rounded-xl border-2 border-dashed border-[#8B5CF6]/30 bg-[#8B5CF6]/5 px-3 py-2 text-center"
      >
        <p className="text-[8px] font-bold text-[#8B5CF6]/50 mb-0.5">Data mentah</p>
        <p className="text-[11px] font-mono text-[#8B5CF6]/40">01101001...</p>
      </motion.div>

      <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}>
        <ArrowRight className="w-4 h-4 text-[#8B5CF6]/40" />
      </motion.div>

      {/* IP wraps it */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: 'spring' }}
        className="flex flex-col items-center gap-1"
      >
        <div className="rounded-2xl border-2 border-[#8B5CF6]/50 bg-[#8B5CF6]/10 px-4 py-2.5 text-center shadow-sm">
          <p className="text-2xl mb-0.5">📦</p>
          <p className="text-[9px] font-black text-[#8B5CF6]">Paket IP</p>
          <p className="text-[7px] text-[#8B5CF6]/50">IP Header + Data</p>
        </div>
        <div className="text-[7px] text-[#8B5CF6]/50 font-bold text-center">dibuat oleh<br/>Internet Protocol</div>
      </motion.div>
    </div>
  );
}

function Scene3() {
  return (
    <div className="space-y-3 py-1">
      {/* House analogy at top */}
      <div className="flex justify-center gap-5 flex-wrap">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-1.5"
        >
          <p className="text-2xl">🏠</p>
          <div className="rounded-xl border-2 border-[#3B82F6]/40 bg-[#3B82F6]/8 px-3 py-2 text-center min-w-[90px]">
            <p className="text-[7px] text-[#3B82F6]/60 font-bold uppercase tracking-wide mb-0.5">Source IP</p>
            <p className="text-[10px] font-black text-[#3B82F6]">192.168.1.10</p>
            <p className="text-[7px] text-[#3B82F6]/50 mt-0.5">Laptop A</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-1.5"
        >
          <p className="text-2xl">🏠</p>
          <div className="rounded-xl border-2 border-[#10B981]/40 bg-[#10B981]/8 px-3 py-2 text-center min-w-[90px]">
            <p className="text-[7px] text-[#10B981]/60 font-bold uppercase tracking-wide mb-0.5">Destination IP</p>
            <p className="text-[10px] font-black text-[#10B981]">203.0.113.5</p>
            <p className="text-[7px] text-[#10B981]/50 mt-0.5">HP B</p>
          </div>
        </motion.div>
      </div>

      {/* Packet with address labels */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mx-auto max-w-xs rounded-xl border-2 border-[#3B82F6]/25 bg-[#3B82F6]/5 px-4 py-2"
      >
        <div className="flex items-center gap-2">
          <p className="text-base">📦</p>
          <div className="flex-1 space-y-0.5">
            <div className="flex gap-1.5 items-center">
              <span className="text-[7px] font-bold text-[#3B82F6]/50 w-14">Src IP:</span>
              <span className="text-[8px] font-black text-[#3B82F6]">192.168.1.10</span>
            </div>
            <div className="flex gap-1.5 items-center">
              <span className="text-[7px] font-bold text-[#10B981]/50 w-14">Dst IP:</span>
              <span className="text-[8px] font-black text-[#10B981]">203.0.113.5</span>
            </div>
            <div className="flex gap-1.5 items-center">
              <span className="text-[7px] font-bold text-[#395886]/30 w-14">Data:</span>
              <span className="text-[7px] text-[#395886]/30 font-mono">payload...</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Scene4() {
  return (
    <div className="py-2">
      {/* Network path */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {/* Laptop A */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 border-2 border-[#F59E0B]/20 flex items-center justify-center text-xl select-none">💻</div>
          <div className="text-[6px] font-black text-[#F59E0B] px-1 py-0.5 rounded bg-[#F59E0B]/10 border border-[#F59E0B]/20">.1.10</div>
        </div>

        {/* Animated packet arrow */}
        <div className="flex items-center gap-0.5">
          <motion.div
            animate={{ x: [0, 6, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <ArrowRight className="w-3.5 h-3.5 text-[#F59E0B]/40" />
          </motion.div>
          <motion.p
            animate={{ x: [-4, 4, -4] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="text-sm"
          >📦</motion.p>
        </div>

        {/* Router 1 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/15 border-2 border-[#F59E0B]/50 flex items-center justify-center text-xl select-none">🔀</div>
          <p className="text-[7px] font-black text-[#F59E0B]">Router 1</p>
          <div className="text-[5.5px] text-[#F59E0B]/60 font-bold text-center leading-tight">baca<br/>Dst IP</div>
        </motion.div>

        <div className="flex items-center gap-0.5">
          <motion.div
            animate={{ x: [0, 6, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
          >
            <ArrowRight className="w-3.5 h-3.5 text-[#F59E0B]/40" />
          </motion.div>
          <motion.p
            animate={{ x: [-4, 4, -4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
            className="text-sm"
          >📦</motion.p>
        </div>

        {/* Router 2 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/15 border-2 border-[#F59E0B]/50 flex items-center justify-center text-xl select-none">🔀</div>
          <p className="text-[7px] font-black text-[#F59E0B]">Router 2</p>
          <div className="text-[5.5px] text-[#F59E0B]/60 font-bold text-center leading-tight">forward<br/>next hop</div>
        </motion.div>

        <div className="flex items-center gap-0.5">
          <motion.div
            animate={{ x: [0, 6, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
          >
            <ArrowRight className="w-3.5 h-3.5 text-[#F59E0B]/40" />
          </motion.div>
          <motion.p
            animate={{ x: [-4, 4, -4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
            className="text-sm"
          >📦</motion.p>
        </div>

        {/* HP B */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 border-2 border-[#10B981]/20 flex items-center justify-center text-xl select-none">📱</div>
          <div className="text-[6px] font-black text-[#10B981] px-1 py-0.5 rounded bg-[#10B981]/10 border border-[#10B981]/20">.13.5</div>
        </motion.div>
      </div>

      {/* Routing info */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-[8px] text-[#395886]/35 font-bold text-center mt-3"
      >
        🗺️ Setiap router membaca Destination IP → memilih jalur → forward ke next hop
      </motion.p>
    </div>
  );
}

function Scene5() {
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {/* Laptop A (faded) */}
        <div className="flex flex-col items-center gap-1 opacity-35">
          <div className="w-12 h-12 rounded-xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-xl select-none">💻</div>
          <p className="text-[7px] font-bold text-gray-400">Laptop A</p>
        </div>

        {/* Traveling packet */}
        <div className="flex items-center gap-1 overflow-hidden w-20">
          <div className="flex-1 border-t-2 border-dashed border-[#10B981]/25" />
          <motion.p
            animate={{ x: [-20, 20] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
            className="text-sm flex-shrink-0"
          >📦</motion.p>
          <div className="flex-1 border-t-2 border-dashed border-[#10B981]/25" />
        </div>

        {/* HP B (success) */}
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#10B981]/15 border-2 border-[#10B981]/50 flex items-center justify-center text-2xl select-none">📱</div>
          <p className="text-[9px] font-black text-[#10B981]">HP B</p>
          <div className="px-2 py-0.5 rounded-full text-[7px] font-black bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981]">203.0.113.5</div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring' }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/25"
      >
        <CheckCircle className="w-4 h-4 text-[#10B981] flex-shrink-0" />
        <span className="text-[10px] font-black text-[#065F46]">
          Data diterima! IP Address memastikan paket tiba di perangkat yang tepat.
        </span>
      </motion.div>
    </div>
  );
}

function SceneDispatch({ step }: { step: number }) {
  switch (step) {
    case 1: return <Scene1 />;
    case 2: return <Scene2 />;
    case 3: return <Scene3 />;
    case 4: return <Scene4 />;
    case 5: return <Scene5 />;
    default: return null;
  }
}

// ── Info Cards ──────────────────────────────────────────────────────────────

function InfoCards({ step, visible }: { step: StoryStep; visible: boolean }) {
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
          {/* Analogy */}
          <div className="rounded-2xl border border-[#D5DEEF] bg-white/70 backdrop-blur-sm px-5 py-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/80">
                Analogi Sederhana
              </p>
            </div>
            <p className="text-sm text-[#395886]/80 leading-relaxed">{step.analogy}</p>
          </div>

          {/* Technical */}
          <div className="rounded-2xl border border-[#D5DEEF] bg-white/70 backdrop-blur-sm px-5 py-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-[#628ECB]/10 border border-[#628ECB]/20 flex items-center justify-center">
                <BadgeCheck className="w-3.5 h-3.5 text-[#628ECB]" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]/70">
                Penjelasan Teknis
              </p>
            </div>
            <p className="text-sm text-[#395886]/80 leading-relaxed">{step.teknis}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Summary Scene ──────────────────────────────────────────────────────────

function SummaryScene() {
  return (
    <div className="rounded-2xl border border-[#D5DEEF] bg-[#F8FAFD] p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40 mb-3 text-center">
        Alur Komunikasi IP — Ringkasan
      </p>
      <div className="flex items-center justify-center gap-1 flex-wrap">
        {/* Device A */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 rounded-xl bg-[#6366F1]/10 border-2 border-[#6366F1]/25 flex items-center justify-center text-lg select-none">💻</div>
          <p className="text-[7px] font-black text-[#6366F1]">Laptop A</p>
        </div>
        <div className="flex flex-col items-center gap-0.5 mx-1">
          <p className="text-[7px] text-[#8B5CF6]/60 font-bold">IP</p>
          <ArrowRight className="w-3 h-3 text-[#8B5CF6]/40" />
        </div>
        {/* Packet */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 rounded-xl bg-[#8B5CF6]/10 border-2 border-[#8B5CF6]/25 flex items-center justify-center text-lg select-none">📦</div>
          <p className="text-[7px] font-black text-[#8B5CF6]">Paket IP</p>
        </div>
        <div className="flex flex-col items-center gap-0.5 mx-1">
          <p className="text-[7px] text-[#3B82F6]/60 font-bold">Dst IP</p>
          <ArrowRight className="w-3 h-3 text-[#3B82F6]/40" />
        </div>
        {/* Router */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 rounded-xl bg-[#F59E0B]/10 border-2 border-[#F59E0B]/25 flex items-center justify-center text-lg select-none">🔀</div>
          <p className="text-[7px] font-black text-[#F59E0B]">Router</p>
        </div>
        <div className="flex flex-col items-center gap-0.5 mx-1">
          <p className="text-[7px] text-[#F59E0B]/60 font-bold">route</p>
          <ArrowRight className="w-3 h-3 text-[#F59E0B]/40" />
        </div>
        {/* Device B */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 rounded-xl bg-[#10B981]/10 border-2 border-[#10B981]/25 flex items-center justify-center text-lg select-none">📱</div>
          <p className="text-[7px] font-black text-[#10B981]">HP B ✅</p>
        </div>
      </div>
      <p className="text-[8px] text-[#395886]/30 text-center mt-3">
        Internet Protocol (Network Layer) mengatur pengalamatan dan pengiriman paket dari sumber ke tujuan
      </p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export function IpAddressIntro({ onComplete }: { onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [showCards, setShowCards] = useState(false);
  const [finished, setFinished] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const currentStepData = currentStep >= 1 && currentStep <= 5 ? STORY_STEPS[currentStep - 1] : null;

  const advance = () => {
    setShowCards(false);
    setTimeout(() => {
      const next = (currentStep + 1) as Step;
      setCurrentStep(next);
      if (next <= 5) {
        setTimeout(() => setShowCards(true), 380);
      }
    }, 120);
  };

  const handleStart = () => {
    setCurrentStep(1);
    setTimeout(() => setShowCards(true), 380);
  };

  const handleShowSummary = () => {
    setShowCards(false);
    setTimeout(() => {
      setCurrentStep(6);
      setFinished(true);
    }, 250);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setShowCards(false);
    setFinished(false);
    setConfirmed(false);
  };

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
              Animasi Analogi Interaktif
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

      {/* ── Progress dots ───────────────────────────────────────────────── */}
      {currentStep >= 1 && currentStep <= 5 && (
        <div className="px-8 pt-5 pb-2">
          <div className="flex items-center gap-1.5">
            {STORY_STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-1.5">
                <motion.div
                  animate={{
                    background: i < currentStep ? s.accent : '#D5DEEF',
                    scale: i === currentStep - 1 ? 1.3 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-2 h-2 rounded-full"
                />
                {i < 4 && (
                  <div
                    className="h-px w-6 transition-all duration-500"
                    style={{ background: i < currentStep - 1 ? `${s.accent}55` : '#D5DEEF' }}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-[8px] font-bold text-[#395886]/30 mt-1.5">
            Langkah {currentStep} dari {STORY_STEPS.length}
          </p>
        </div>
      )}

      {/* ── Step 0: Start Screen ────────────────────────────────────────── */}
      {currentStep === 0 && (
        <div className="px-8 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-10"
          >
            {/* Mini preview of what the animation shows */}
            <div className="flex items-center justify-center gap-3 mb-6">
              {['💻', '📦', '🔀', '📱'].map((emoji, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className="flex items-center gap-1.5"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#F0F3FA] border border-[#D5DEEF] flex items-center justify-center text-xl select-none">
                    {emoji}
                  </div>
                  {i < 3 && <ArrowRight className="w-3 h-3 text-[#D5DEEF]" />}
                </motion.div>
              ))}
            </div>

            <h4 className="text-lg font-black text-[#395886] mb-2">
              Simulasi: Bagaimana Data Sampai ke Tujuan?
            </h4>
            <p className="text-sm text-[#395886]/50 max-w-sm mx-auto leading-relaxed mb-2">
              Ikuti animasi langkah demi langkah untuk memahami peran{' '}
              <strong className="text-[#3B82F6]">IP Address</strong> dan{' '}
              <strong className="text-[#6366F1]">Internet Protocol</strong> dalam
              mengantarkan data dari perangkat pengirim ke penerima.
            </p>
            <p className="text-xs text-[#395886]/30 mb-8">5 langkah · klik Lanjut setiap tahap</p>
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2.5 bg-[#3B82F6] text-white px-7 py-3.5 rounded-2xl text-sm font-black shadow-md hover:bg-[#2563EB] hover:shadow-lg transition-all active:scale-95"
            >
              Mulai Animasi
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}

      {/* ── Steps 1–5: Story Animation ──────────────────────────────────── */}
      {currentStep >= 1 && currentStep <= 5 && currentStepData && (
        <div className="px-8 pb-6 space-y-4">

          {/* Step title */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.28 }}
              className="flex items-center gap-3"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-sm flex-shrink-0"
                style={{ background: currentStepData.accent }}
              >
                {currentStepData.id}
              </div>
              <div>
                <p className="text-sm font-black text-[#395886] leading-tight">{currentStepData.title}</p>
                <p className="text-[10px] font-bold text-[#395886]/40">{currentStepData.subtitle}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Scene visual */}
          <div className="rounded-2xl border border-[#D5DEEF] bg-[#F8FAFD] p-4 min-h-[120px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                <SceneDispatch step={currentStep} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Analogy + Technical cards */}
          <InfoCards step={currentStepData} visible={showCards} />

          {/* Next / Summary button */}
          <AnimatePresence>
            {showCards && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-center pt-1"
              >
                <button
                  onClick={currentStep < 5 ? advance : handleShowSummary}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-black text-white shadow-md hover:shadow-lg transition-all active:scale-95"
                  style={{ background: currentStepData.accent }}
                >
                  {currentStep < 5 ? (
                    <>
                      Lanjut ke Langkah Berikutnya
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

      {/* ── Step 6: Summary + Confirmation ─────────────────────────────── */}
      {currentStep === 6 && finished && (
        <div className="px-8 py-6 space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Summary header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-black text-[#395886]">Ringkasan Animasi</p>
                <p className="text-[10px] font-bold text-[#395886]/40 uppercase tracking-wider">
                  Internet Protocol &amp; IP Address
                </p>
              </div>
            </div>

            {/* Summary visual */}
            <SummaryScene />

            {/* Mini recap cards */}
            <div className="mt-4 grid sm:grid-cols-2 gap-2">
              {STORY_STEPS.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl border px-3.5 py-2.5"
                  style={{ borderColor: `${s.accent}22`, background: `${s.accent}06` }}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <div
                      className="w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-black text-white flex-shrink-0"
                      style={{ background: s.accent }}
                    >
                      {s.id}
                    </div>
                    <span className="text-[10px] font-black text-[#395886] leading-tight">{s.title}</span>
                  </div>
                  <p className="text-[9px] text-[#395886]/45 leading-relaxed pl-6">{s.subtitle}</p>
                </div>
              ))}
            </div>

            {/* Confirmation */}
            <div className="mt-6 pt-5 border-t border-[#D5DEEF]/60">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 flex-shrink-0">
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
                  Saya sudah memahami peran Internet Protocol dan IP Address dalam proses pengiriman
                  data antar perangkat melalui Network Layer
                </span>
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-[#395886]/30 hover:text-[#3B82F6] text-xs font-bold transition-colors px-2 py-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Ulangi Animasi
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
