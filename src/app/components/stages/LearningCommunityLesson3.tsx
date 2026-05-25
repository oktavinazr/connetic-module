import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CheckCircle, XCircle, Info, ChevronRight, RotateCcw, AlertCircle,
  Network, Globe, Lock, Lightbulb, BookOpen, Layers, MapPin,
  MessageSquare, Zap, PenLine, Users, FileSearch, ThumbsUp,
  Award, Clock, Sparkles, GraduationCap, ShieldCheck, PlayCircle, ArrowUpDown, Database,
} from 'lucide-react';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { Ipv4Analyzer } from '../ui/Ipv4Analyzer';
import { getCurrentUser } from '../../utils/auth';
import {
  upsertGroupDiscussion,
  getGroupDiscussions,
  toggleGroupDiscussionVote,
  getGroupMembers,
  type GroupDiscussion,
} from '../../utils/groups';
import { supabase } from '../../utils/supabase';
import {
  StepTracker, ActivityCard, InstructionBox, EssayBox, ATPConclusionBox,
  IndicatorSummaryCard, ContinueActivityButton, SectionDivider, anim,
} from './StageKit';

// ── Types ─────────────────────────────────────────────────────────────────────

type L3Phase =
  | 'analyzer' | 'a1_info' | 'a1_sorter' | 'a1_argue'
  | 'a1_conclusion' | 'a1_done' | 'a2_intro' | 'a2_puzzle'
  | 'a2_argue' | 'a2_conclusion' | 'group_result' | 'final';

interface Props {
  lessonId: string;
  stageIndex: number;
  groupName?: string;
  isCompleted?: boolean;
  onComplete: (answer: any) => void;
  onTrackerPhase?: (phase: 'consistency' | 'arguing' | 'conclusion') => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SORTER_ITEMS = [
  { ip: '10.0.0.1',       correct: 'kelas_a_private' },
  { ip: '172.16.5.200',   correct: 'kelas_b_private' },
  { ip: '192.168.1.1',    correct: 'kelas_c_private' },
  { ip: '8.8.8.8',        correct: 'public' },
  { ip: '172.217.0.1',    correct: 'public' },
  { ip: '192.168.100.5',  correct: 'kelas_c_private' },
];

const SORTER_CATEGORIES = [
  { id: 'kelas_a_private', label: 'Kelas A — Private' },
  { id: 'kelas_b_private', label: 'Kelas B — Private' },
  { id: 'kelas_c_private', label: 'Kelas C — Private' },
  { id: 'public',          label: 'Public / Internet' },
];

const PUZZLE_IPS = [
  { ip: '192.168.1.0',   correct: 'network_id',    hint: 'Host ID semua = 0' },
  { ip: '192.168.1.1',   correct: 'host_pertama',  hint: 'Host ID terkecil (1)' },
  { ip: '192.168.1.254', correct: 'host_terakhir', hint: 'Host ID terbesar (254)' },
  { ip: '192.168.1.255', correct: 'broadcast_id',  hint: 'Host ID semua = 1' },
];

const PUZZLE_ROLES = [
  { id: 'network_id',    label: 'Network ID' },
  { id: 'host_pertama',  label: 'Host Pertama' },
  { id: 'host_terakhir', label: 'Host Terakhir' },
  { id: 'broadcast_id',  label: 'Broadcast ID' },
];

const A1_BLANKS = [
  { key: 'jaringan', options: ['— pilih —', 'Lokal / Internal', 'Publik', 'Eksternal'],      correct: 'Lokal / Internal' },
  { key: 'akses',    options: ['— pilih —', 'Internet', 'Lokal', 'Wireless'],                 correct: 'Internet' },
  { key: 'pembeda',  options: ['— pilih —', 'Oktet Pertama', 'Oktet Terakhir', 'Subnet Mask'], correct: 'Oktet Pertama' },
];

const A2_BLANKS = [
  { key: 'dikurangi', options: ['— pilih —', '2', '1', '4'],                                correct: '2' },
  { key: 'pertama',   options: ['— pilih —', 'Network ID', 'Host Pertama', 'Broadcast ID'], correct: 'Network ID' },
  { key: 'terakhir',  options: ['— pilih —', 'Broadcast ID', 'Host Terakhir', 'Network ID'], correct: 'Broadcast ID' },
];

function phaseToStep(p: L3Phase): number {
  if (p === 'analyzer') return 0;
  if (['a1_info', 'a1_sorter', 'a1_argue', 'a1_conclusion', 'a1_done'].includes(p)) return 1;
  if (['a2_intro', 'a2_puzzle', 'a2_argue', 'a2_conclusion', 'group_result'].includes(p)) return 2;
  return 3;
}

function phaseToTracker(p: L3Phase): 'consistency' | 'arguing' | 'conclusion' {
  if (p === 'final') return 'conclusion';
  if (['a1_argue', 'a1_conclusion', 'a1_done', 'a2_argue', 'a2_conclusion'].includes(p)) return 'arguing';
  return 'consistency';
}

function getMainPhaseMeta(phase: L3Phase) {
  if (phase === 'analyzer') {
    return {
      title: 'IPv4 Tool',
      subtitle: 'Pengantar Learning Community',
      indicator: 'Keruntutan Berpikir',
      description: 'Mulai dari IPv4 Analyzer untuk membangun fondasi sebelum masuk ke aktivitas kelompok.',
    };
  }
  if (['a1_info', 'a1_sorter', 'a1_argue', 'a1_conclusion', 'a1_done'].includes(phase)) {
    return {
      title: 'X.IP.4',
      subtitle: 'Kelas IPv4 & Private/Public',
      indicator: ['a1_argue', 'a1_conclusion', 'a1_done'].includes(phase) ? 'Kemampuan Berargumen' : 'Keruntutan Berpikir',
      description: ['a1_argue', 'a1_conclusion', 'a1_done'].includes(phase)
        ? 'Analisis studi kasus, diskusi kelompok, vote, lalu simpulkan hasil aktivitas X.IP.4.'
        : 'Pelajari pola kelas IPv4 dan urutkan alamat IP secara sistematis sebelum berdiskusi.',
    };
  }
  if (['a2_intro', 'a2_puzzle', 'a2_argue', 'a2_conclusion', 'group_result'].includes(phase)) {
    return {
      title: 'X.IP.5',
      subtitle: 'Range Host IPv4',
      indicator: ['a2_argue', 'a2_conclusion', 'group_result'].includes(phase) ? 'Kemampuan Berargumen' : 'Keruntutan Berpikir',
      description: ['a2_argue', 'a2_conclusion', 'group_result'].includes(phase)
        ? 'Bahas Network ID, Broadcast ID, hasil vote kelompok, lalu kaitkan dengan usable host.'
        : 'Petakan peran alamat dalam subnet secara bertahap sebelum masuk ke studi kasus kelompok.',
    };
  }
  return {
    title: 'Tahap Selesai',
    subtitle: 'Refleksi Akhir Learning Community',
    indicator: 'Penarikan Kesimpulan',
    description: 'Rangkum hasil X.IP.4, X.IP.5, diskusi kelompok, dan pemahaman akhir yang kamu peroleh.',
  };
}

function MainActivityTracker({ phase }: { phase: L3Phase }) {
  const current = phaseToStep(phase);
  const meta = getMainPhaseMeta(phase);
  const cards = [
    { title: 'IPv4 Tool', subtitle: 'Pembuka', icon: <Network className="w-4 h-4" />, color: 'from-[#628ECB] to-[#395886]' },
    { title: 'X.IP.4', subtitle: 'Kelas IP', icon: <BookOpen className="w-4 h-4" />, color: 'from-[#10B981] to-[#059669]' },
    { title: 'X.IP.5', subtitle: 'Range Host', icon: <MapPin className="w-4 h-4" />, color: 'from-[#7C5CBF] to-[#5B21B6]' },
    { title: 'Tahap Selesai', subtitle: 'Refleksi', icon: <CheckCircle className="w-4 h-4" />, color: 'from-[#F59E0B] to-[#D97706]' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <div
              key={card.title}
              className={`rounded-2xl border-2 px-4 py-3 transition-all ${
                active
                  ? 'border-transparent bg-white shadow-lg ring-2 ring-[#395886]/10 -translate-y-0.5'
                  : done
                    ? 'border-[#10B981]/20 bg-[#F0FDF4]'
                    : 'border-[#D5DEEF] bg-white/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm bg-gradient-to-br ${done && !active ? 'from-[#10B981] to-[#059669]' : card.color}`}>
                  {done && !active ? <CheckCircle className="w-4 h-4" /> : card.icon}
                </div>
                <div className="min-w-0">
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${active ? 'text-[#395886]' : done ? 'text-[#10B981]' : 'text-[#395886]/35'}`}>
                    {done ? 'Selesai' : active ? 'Aktif' : 'Berikutnya'}
                  </p>
                  <p className="text-sm font-black text-[#395886]">{card.title}</p>
                  <p className="text-[10px] font-bold text-[#395886]/45">{card.subtitle}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-[#D5DEEF] bg-gradient-to-r from-white via-[#F8FAFF] to-[#EEF4FF] px-4 py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#628ECB]">{meta.subtitle}</p>
            <p className="text-sm font-black text-[#395886]">{meta.title} — {meta.indicator}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#628ECB]/15 bg-white px-3 py-1.5">
            <Zap className="w-3.5 h-3.5 text-[#628ECB]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]">Aktivitas Utama</span>
          </div>
        </div>
        <p className="mt-2 text-xs font-medium leading-relaxed text-[#395886]/70">{meta.description}</p>
      </div>
    </div>
  );
}

function SimpleNextButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#395886] text-white font-black text-sm hover:bg-[#2A4468] transition-all active:scale-95 shadow-md group"
    >
      {label} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </button>
  );
}

interface L3StudyOption {
  id: string;
  text: string;
}

interface L3StudyModule {
  id: string;
  title: string;
  conceptTitle: string;
  conceptBody: string;
  conceptPoints: string[];
  studyTitle: string;
  studyScenario: string;
  studyQuestion: string;
  studyOptions: L3StudyOption[];
  argumentPrompt: string;
  resultTitle: string;
}

const MODULE_XIP4: L3StudyModule = {
  id: 'X.IP.4',
  title: 'X.IP.4 — Kelas IPv4 & Private/Public',
  conceptTitle: 'Konsep Materi — Kelas IPv4',
  conceptBody: 'Kelas IPv4 dapat dikenali dari oktet pertama. Selain kelas A, B, dan C, siswa juga perlu membedakan alamat Private dan Public agar tidak salah menilai apakah sebuah IP dipakai untuk jaringan lokal atau dapat diakses dari Internet.',
  conceptPoints: [
    'Private Kelas A: 10.0.0.0/8 dipakai untuk jaringan lokal skala besar.',
    'Private Kelas B: 172.16.0.0–172.31.255.255 dipakai untuk jaringan internal menengah.',
    'Private Kelas C: 192.168.0.0/16 paling sering dipakai di rumah dan sekolah.',
    'Alamat di luar rentang private umumnya termasuk IP Public dan bisa dirutekan di Internet.',
  ],
  studyTitle: 'Studi Kasus — Memilih Kategori IP Jaringan',
  studyScenario: 'Tim teknisi sekolah menemukan dua alamat IP pada log router: 172.217.1.1 dan 192.168.10.25. Satu alamat berasal dari server Internet, sedangkan satu lagi berasal dari perangkat di jaringan lokal sekolah.',
  studyQuestion: 'Argumen mana yang paling tepat untuk menjelaskan perbedaan kedua alamat IP tersebut?',
  studyOptions: [
    { id: 'xip4_a', text: '172.217.1.1 termasuk IP Public karena berada di luar rentang private 172.16–172.31, sedangkan 192.168.10.25 termasuk IP Private karena berada pada blok 192.168.x.x.' },
    { id: 'xip4_b', text: 'Keduanya termasuk IP Private karena sama-sama diawali angka 172 dan 192 yang sering dipakai dalam jaringan lokal, sehingga keduanya tidak dapat dianggap sebagai alamat Internet.' },
    { id: 'xip4_c', text: '172.217.1.1 termasuk IP Private Kelas B karena semua alamat yang diawali 172 pasti private, sedangkan 192.168.10.25 dianggap Public karena bisa digunakan langsung untuk akses Internet.' },
  ],
  argumentPrompt: 'Jelaskan alasan teknismu berdasarkan oktet pertama dan rentang alamat private/public.',
  resultTitle: 'Hasil Diskusi Kelompok — Kelas IPv4',
};

const MODULE_XIP5: L3StudyModule = {
  id: 'X.IP.5',
  title: 'X.IP.5 — Range Host IPv4',
  conceptTitle: 'Konsep Materi — Range Host',
  conceptBody: 'Dalam satu subnet, tidak semua alamat IP dapat dipakai sebagai host. Network ID menandai jaringan, Broadcast ID mengirim ke semua host, sedangkan usable host berada di antara keduanya.',
  conceptPoints: [
    'Network ID adalah alamat pertama dalam subnet dan tidak dipakai host biasa.',
    'Broadcast ID adalah alamat terakhir dalam subnet dan dipakai untuk broadcast.',
    'Jumlah usable host dihitung dari total alamat dikurangi 2.',
    'Pada subnet /24, host usable berada dari .1 sampai .254.',
  ],
  studyTitle: 'Studi Kasus — Broadcast di Jaringan Rumah',
  studyScenario: 'Sebuah rumah memakai jaringan 192.168.1.0/24. Teknisi hendak memberi alamat ke printer baru dan sedang memilih antara 192.168.1.20, 192.168.1.0, 192.168.1.255, dan 192.168.1.254.',
  studyQuestion: 'Argumen mana yang paling tepat untuk menjelaskan alamat yang tidak boleh dipakai sebagai host biasa?',
  studyOptions: [
    { id: 'xip5_a', text: '192.168.1.0 adalah Network ID dan 192.168.1.255 adalah Broadcast ID, sehingga keduanya tidak boleh dipakai host biasa.' },
    { id: 'xip5_b', text: '192.168.1.254 tidak boleh dipakai karena selalu disimpan untuk router utama.' },
    { id: 'xip5_c', text: 'Semua alamat dalam 192.168.1.0/24 boleh dipakai host selama belum digunakan perangkat lain.' },
  ],
  argumentPrompt: 'Jelaskan alasanmu dengan menyebut fungsi Network ID, Broadcast ID, dan pengaruhnya pada usable host.',
  resultTitle: 'Hasil Diskusi Kelompok — Range Host',
};

function L3GroupMembersList({
  members,
  submissions = [],
}: {
  members: { user_id: string; user_name: string }[];
  submissions?: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-6">
      {members.map(member => {
        const hasSubmitted = submissions.includes(member.user_id);
        return (
          <div
            key={member.user_id}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border-2 transition-all ${hasSubmitted ? 'border-[#10B981] bg-[#F0FDF4]' : 'border-[#D5DEEF]'}`}
          >
            <div className={`w-2 h-2 rounded-full ${hasSubmitted ? 'bg-[#10B981]' : 'bg-[#D5DEEF]'} ${!hasSubmitted && 'animate-pulse'}`} />
            <span className={`text-[9px] font-black uppercase tracking-tight ${hasSubmitted ? 'text-[#065F46]' : 'text-[#395886]'}`}>{member.user_name}</span>
            {hasSubmitted && <CheckCircle className="w-3 h-3 text-[#10B981]" />}
          </div>
        );
      })}
      {members.length === 0 && <p className="text-[10px] font-bold text-[#395886]/30 uppercase italic">Menunggu anggota kelompok...</p>}
    </div>
  );
}

function L3ConceptPhase({ module, onNext }: { module: L3StudyModule; onNext: () => void }) {
  return (
    <div className={`space-y-6 ${anim.fadeUp}`}>
      <ActivityCard
        icon={<GraduationCap className="w-5 h-5 text-[#10B981]" />}
        label="Konsep Inti"
        title={module.conceptTitle}
        headerBg="bg-[#10B981]/5"
        headerBorder="border-[#10B981]/20"
        iconBg="bg-[#10B981]/10"
        labelCls="text-[#10B981]"
      >
        <div className="space-y-6">
          <p className="text-sm font-medium text-[#395886]/80 leading-relaxed">{module.conceptBody}</p>
          <SectionDivider label="Poin Penting" icon={<Database className="w-3 h-3" />} />
          <div className="grid gap-2">
            {module.conceptPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-white border-2 border-[#D5DEEF]">
                <div className="h-8 w-8 shrink-0 rounded-xl bg-[#395886] text-white flex items-center justify-center font-black text-xs shadow-sm">
                  {index + 1}
                </div>
                <p className="text-xs font-bold text-[#395886] leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
          <InstructionBox accent="text-[#10B981]">
            Gunakan konsep di atas sebagai dasar saat menganalisis studi kasus dan berdiskusi dengan kelompok.
          </InstructionBox>
        </div>
      </ActivityCard>

      <button onClick={onNext} className="w-full py-3.5 rounded-lg bg-[#395886] text-white font-black text-sm hover:bg-[#2A4468] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 group">
        Mulai Analisis Skenario <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

function L3CasePhase({
  module,
  minWords = 10,
  isSubmitted,
  submitError,
  onNext,
}: {
  module: L3StudyModule;
  minWords?: number;
  isSubmitted?: boolean;
  submitError?: string | null;
  onNext: (choiceId: string, choiceText: string, argument: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [argument, setArgument] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayOptions] = useState(() => {
    const copied = [...module.studyOptions];
    for (let index = copied.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copied[index], copied[swapIndex]] = [copied[swapIndex], copied[index]];
    }
    return copied;
  });
  const wordCount = argument.trim() ? argument.trim().split(/\s+/).length : 0;
  const ready = selected && wordCount >= minWords;

  return (
    <div className={`space-y-6 ${anim.zoomIn}`}>
      <ActivityCard
        icon={<FileSearch className="w-5 h-5 text-[#F59E0B]" />}
        label="Misi Analisis"
        title={module.studyTitle}
        headerBg="bg-[#F59E0B]/5"
        headerBorder="border-[#F59E0B]/20"
        iconBg="bg-[#F59E0B]/10"
        labelCls="text-[#F59E0B]"
      >
        <div className="space-y-6">
          <InstructionBox accent="text-[#F59E0B]">
            <span className="italic">"{module.studyScenario}"</span>
          </InstructionBox>

          <p className="text-sm font-bold text-[#395886] px-1">{module.studyQuestion}</p>

          <div className="grid gap-3">
            {displayOptions.map(option => (
              <button
                key={option.id}
                disabled={isSubmitted}
                onClick={() => setSelected(option.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${selected === option.id ? 'border-[#F59E0B] bg-[#FFFBEB] shadow-sm scale-[1.01]' : 'border-[#D5DEEF] bg-white hover:border-[#F59E0B]/30'} ${isSubmitted && selected !== option.id ? 'opacity-50' : ''}`}
              >
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${selected === option.id ? 'border-[#F59E0B]' : 'border-[#D5DEEF]'}`}>
                  {selected === option.id && <div className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />}
                </div>
                <span className={`text-xs font-bold ${selected === option.id ? 'text-[#395886]' : 'text-[#395886]/60'}`}>{option.text}</span>
              </button>
            ))}
          </div>

          {selected !== null && (
            <div className={`space-y-3 p-5 rounded-2xl bg-[#F8FAFD] border-2 border-[#D5DEEF]/60 ${anim.fadeUp}`}>
              <div className="flex items-center gap-2">
                <PenLine className="w-4 h-4 text-[#395886]/60" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/60">Argumen Logismu</p>
              </div>
              <textarea
                value={argument}
                readOnly={isSubmitted}
                onChange={event => !isSubmitted && setArgument(event.target.value)}
                rows={3}
                className={`w-full p-4 border-2 border-[#D5DEEF] rounded-xl text-sm text-[#395886] focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/5 outline-none transition-all resize-none ${isSubmitted ? 'bg-[#F1F5F9] border-dashed cursor-not-allowed' : 'bg-white'}`}
                placeholder={module.argumentPrompt}
              />
              <div className="flex justify-between items-center">
                {isSubmitted ? (
                  <div className="flex items-center gap-1.5 text-[#10B981] font-black text-[10px] uppercase">
                    <CheckCircle className="w-3.5 h-3.5" /> Argumen Berhasil Dikirim ke Kelompok
                  </div>
                ) : (
                  <p className={`text-[10px] font-bold ${wordCount >= minWords ? 'text-[#10B981]' : 'text-[#395886]/30'}`}>
                    {wordCount} / {minWords} Kata Minimal
                  </p>
                )}
              </div>
            </div>
          )}

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
            if (!ready) return;
            setIsSubmitting(true);
            const choiceText = displayOptions.find(option => option.id === selected)?.text ?? module.studyOptions.find(option => option.id === selected)?.text ?? '';
            await onNext(selected!, choiceText, argument.trim());
            setIsSubmitting(false);
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

function L3DiscussionPhase({
  lessonId,
  moduleId,
  groupName,
  onNext,
}: {
  lessonId: string;
  moduleId: string;
  groupName: string;
  onNext: () => void;
}) {
  const user = getCurrentUser();
  const [discussions, setDiscussions] = useState<GroupDiscussion[]>([]);
  const [members, setMembers] = useState<{ user_id: string; user_name: string }[]>([]);

  const submissions = useMemo(() => discussions.map(discussion => discussion.user_id), [discussions]);
  const missingMembers = useMemo(
    () => members.filter(member => !submissions.includes(member.user_id)).map(member => member.user_name),
    [members, submissions],
  );
  const allSubmitted = members.length > 0 && missingMembers.length === 0;

  const fetchData = useCallback(async () => {
    const [discussionRows, memberRows] = await Promise.all([
      getGroupDiscussions(lessonId, moduleId, groupName),
      getGroupMembers(groupName),
    ]);
    setDiscussions(discussionRows);
    setMembers(memberRows);
  }, [groupName, lessonId, moduleId]);

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
          void fetchData();
        },
      )
      .subscribe();

    const interval = window.setInterval(() => {
      void fetchData();
    }, 5000);

    return () => {
      void supabase.removeChannel(channel);
      window.clearInterval(interval);
    };
  }, [fetchData, groupName, lessonId, moduleId]);

  const handleVote = async (discussionId: string) => {
    if (!allSubmitted || !user) return;
    await toggleGroupDiscussionVote(discussionId, user.id);
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
          <L3GroupMembersList members={members} submissions={submissions} />

          {!allSubmitted && members.length > 0 && (
            <div className="grid gap-2">
              {members.map(member => {
                const hasSubmitted = submissions.includes(member.user_id);
                if (hasSubmitted) return null;
                const isOwn = member.user_id === user?.id;
                return (
                  <div key={member.user_id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed transition-all ${isOwn ? 'border-[#F59E0B]/40 bg-[#FFFBEB]' : 'border-[#D5DEEF] bg-[#F8FAFD]'}`}>
                    <Clock className={`w-4 h-4 ${isOwn ? 'text-[#F59E0B]' : 'text-[#395886]/30'} animate-pulse`} />
                    <span className={`text-xs font-bold ${isOwn ? 'text-[#F59E0B]' : 'text-[#395886]/40'}`}>
                      Menunggu <span className="font-black">{member.user_name}</span>...
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <SectionDivider label="Papan Diskusi" icon={<MessageSquare className="w-3 h-3" />} />

          <div className="flex items-center justify-center mb-4">
            {!allSubmitted ? (
              <div className="px-5 py-2.5 rounded-2xl bg-amber-50 text-amber-600 text-[10px] font-black uppercase border border-amber-100 flex flex-col items-center gap-2 text-center">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menunggu Argumen Anggota...</span>
                </div>
                <p className="text-[9px] lowercase font-bold text-amber-500/80">
                  {missingMembers.length > 0 ? `Belum mengirim: ${missingMembers.join(', ')}` : 'Memuat data anggota...'}
                </p>
              </div>
            ) : (
              <div className="px-4 py-1.5 rounded-full bg-[#10B981]/10 text-[#10B981] text-[10px] font-black uppercase border border-[#10B981]/20 flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5" /> Semua Anggota Sudah Submit — Voting Dibuka
              </div>
            )}
          </div>

          <div className="grid gap-4">
            {discussions.map(discussion => {
              const isOwn = discussion.user_id === user?.id;
              return (
                <div
                  key={discussion.id}
                  className={`p-5 rounded-2xl border-2 transition-all duration-500 ${isOwn ? 'border-[#10B981]/60 bg-[#F0FDF4] shadow-md shadow-[#10B981]/5' : 'border-[#D5DEEF] bg-white hover:border-[#10B981]/20'}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl ${isOwn ? 'bg-[#10B981]' : 'bg-[#395886]'} text-white flex items-center justify-center text-[10px] font-black shadow-sm`}>
                        {discussion.user_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black text-[#395886]">{discussion.user_name}</p>
                          {isOwn && <span className="text-[9px] font-black bg-[#10B981] text-white px-2 py-0.5 rounded-full uppercase">Anda</span>}
                        </div>
                        <p className="text-[10px] font-bold text-[#395886]/40 uppercase tracking-tight">Memilih: {discussion.choice_text}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => void handleVote(discussion.id)}
                      disabled={!allSubmitted}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 transition-all active:scale-90 ${discussion.votes.includes(user?.id ?? '') ? 'bg-[#10B981] text-white border-[#10B981] shadow-md shadow-[#10B981]/20' : 'bg-white text-[#395886]/40 border-[#D5DEEF] hover:border-[#10B981]/50'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${discussion.votes.includes(user?.id ?? '') ? 'fill-current' : ''}`} />
                      <span className="text-[10px] font-black">{discussion.votes.length} Vote</span>
                    </button>
                  </div>
                  <p className="text-sm font-medium text-[#395886]/80 leading-relaxed italic bg-white/60 p-3 rounded-lg border border-current/5">
                    "{discussion.argument}"
                  </p>
                </div>
              );
            })}
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

function L3ResultPhase({
  module,
  discussions,
  onDone,
}: {
  module: L3StudyModule;
  discussions: GroupDiscussion[];
  onDone: () => void;
}) {
  const sorted = [...discussions].sort((a, b) => b.votes.length - a.votes.length);
  const topVoteCount = sorted[0]?.votes.length ?? 0;
  const topArgs = sorted.filter(discussion => discussion.votes.length === topVoteCount && discussion.votes.length > 0);
  const isTie = topArgs.length > 1;

  const [tieBroken, setTieBroken] = useState(false);
  const [selectedTieBreaker, setSelectedTieBreaker] = useState<string | null>(null);

  if (sorted.length === 0) return null;

  const handleTieBreak = () => {
    const earliest = [...topArgs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    setSelectedTieBreaker(earliest[0].id);
    setTieBroken(true);
  };

  const displayedArgs = isTie && !tieBroken ? topArgs : isTie && tieBroken ? [topArgs.find(item => item.id === selectedTieBreaker)!] : [sorted[0]];

  return (
    <div className={`space-y-6 ${anim.zoomIn}`}>
      <ActivityCard
        icon={<Award className="w-5 h-5 text-[#F59E0B]" />}
        label="Keputusan Akhir"
        title={module.resultTitle}
        headerBg="bg-[#F59E0B]/5"
        headerBorder="border-[#F59E0B]/20"
        iconBg="bg-[#F59E0B]/10"
        labelCls="text-[#F59E0B]"
      >
        <div className="space-y-6">
          {isTie && !tieBroken ? (
            <>
              <InstructionBox accent="text-[#F59E0B]">
                <span className="font-black text-[#F59E0B]">Hasil Voting Setara!</span> Beberapa argumen memiliki jumlah vote yang sama. Pilih tie-breaker untuk menentukan argumen utama.
              </InstructionBox>

              <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-200 space-y-2 text-center">
                <div className="flex items-center justify-center gap-2 text-amber-700">
                  <ArrowUpDown className="w-5 h-5" />
                  <span className="text-sm font-black uppercase">Hasil Setara — {topArgs.length} Argumen ({topVoteCount} Vote)</span>
                </div>
              </div>

              <div className="grid gap-3">
                {topArgs.map((discussion, index) => (
                  <div key={discussion.id} className="p-4 rounded-xl border-2 border-[#F59E0B]/30 bg-[#FFFBEB] shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-black text-white shadow-md bg-[#F59E0B]">
                        {discussion.user_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#395886]">{discussion.user_name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <ThumbsUp className="w-3 h-3 text-[#F59E0B]" />
                          <span className="text-[10px] font-black uppercase text-[#F59E0B]">{discussion.votes.length} Suara</span>
                          <span className="text-[9px] font-bold text-[#395886]/30 ml-1">#{index + 1} Co-Top</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-[#395886] leading-relaxed italic">"{discussion.argument}"</p>
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
              </div>
            </>
          ) : (
            <>
              {isTie && tieBroken && (
                <div className="p-3 rounded-xl bg-[#10B981]/8 border border-[#10B981]/20 flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-[#10B981]" />
                  <span className="text-xs font-bold text-[#065F46]">Tie-breaker diterapkan: argumen tercepat dipilih</span>
                </div>
              )}

              {displayedArgs.map(bestArgument => (
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
                  <p className="text-sm font-bold text-[#395886] leading-relaxed relative z-10 italic">"{bestArgument.argument}"</p>
                </div>
              ))}
            </>
          )}

          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F0FDF4] border border-[#10B981]/20">
            <CheckCircle className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
            <p className="text-xs font-bold text-[#065F46]/80 leading-relaxed">
              Argumen terbaik ini menjadi dasar untuk refleksi dan kesimpulan aktivitas.
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

function L3ModuleFlow({
  lessonId,
  module,
  groupName,
  onModuleDone,
}: {
  lessonId: string;
  module: L3StudyModule;
  groupName: string;
  onModuleDone: (data: any) => void;
}) {
  const [phase, setPhase] = useState<'concept' | 'case' | 'discussion' | 'result'>('concept');
  const [discussions, setDiscussions] = useState<GroupDiscussion[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const user = getCurrentUser();

  const handleCaseSubmit = async (choiceId: string, choiceText: string, argument: string) => {
    setSubmitError(null);
    try {
      await upsertGroupDiscussion({
        lesson_id: lessonId,
        module_id: module.id,
        group_name: groupName,
        user_id: user!.id,
        user_name: user!.name,
        argument,
        choice_id: choiceId,
        choice_text: choiceText,
      });
      setIsSubmitted(true);
      window.setTimeout(() => {
        setPhase('discussion');
      }, 1200);
    } catch (error: any) {
      setSubmitError(error?.message || 'Gagal menyimpan argumen. Silakan coba lagi.');
    }
  };

  const finalizeModule = async () => {
    const data = await getGroupDiscussions(lessonId, module.id, groupName);
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
      {phase === 'concept' && <L3ConceptPhase module={module} onNext={() => setPhase('case')} />}
      {phase === 'case' && <L3CasePhase module={module} minWords={10} isSubmitted={isSubmitted} submitError={submitError} onNext={handleCaseSubmit} />}
      {phase === 'discussion' && <L3DiscussionPhase lessonId={lessonId} moduleId={module.id} groupName={groupName} onNext={finalizeModule} />}
      {phase === 'result' && <L3ResultPhase module={module} discussions={discussions} onDone={handleResultDone} />}
    </div>
  );
}

// ── OktetSorter ───────────────────────────────────────────────────────────────

function OktetSorter({ onPass, onAttemptsChange }: { onPass: () => void; onAttemptsChange?: (attempts: number) => void }) {
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<'idle' | 'wrong' | 'correct' | 'locked'>('idle');
  const [wrongKeys, setWrongKeys] = useState<string[]>([]);

  const allFilled = SORTER_ITEMS.every(item => !!assignments[item.ip]);
  const isLocked = status === 'correct' || status === 'locked';

  useEffect(() => {
    onAttemptsChange?.(attempts);
  }, [attempts, onAttemptsChange]);

  const handleCheck = () => {
    const wrong = SORTER_ITEMS.filter(item => assignments[item.ip] !== item.correct).map(item => item.ip);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (wrong.length === 0) {
      setStatus('correct');
    } else if (newAttempts >= 3) {
      setWrongKeys(wrong);
      setStatus('locked');
    } else {
      setWrongKeys(wrong);
      setStatus('wrong');
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-[#EEF4FF] border border-[#628ECB]/25 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#628ECB] shrink-0 mt-0.5" />
        <p className="text-xs font-bold text-[#395886]/80 leading-relaxed">
          Sortir setiap alamat IP ke kategori yang tepat berdasarkan oktet pertamanya.
          {attempts < 3 && <span className="ml-1 text-[#628ECB] font-black">{3 - attempts} percobaan tersisa.</span>}
        </p>
      </div>

      <div className="space-y-2">
        {SORTER_ITEMS.map(item => {
          const isUserWrong = wrongKeys.includes(item.ip);
          const isUserCorrect = assignments[item.ip] === item.correct;
          const rowBorder =
            status === 'correct' ? 'border-[#10B981]/30 bg-[#ECFDF5]/50'
            : (status === 'locked' && isUserCorrect) ? 'border-[#10B981]/30 bg-[#ECFDF5]/50'
            : (status === 'locked' && !isUserCorrect) ? 'border-red-300 bg-red-50/50'
            : isUserWrong ? 'border-red-300 bg-red-50/50'
            : 'border-[#D5DEEF] bg-white';
          return (
            <div key={item.ip} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${rowBorder}`}>
              <span className="font-mono text-sm font-black text-[#395886] w-32 shrink-0">{item.ip}</span>
              <select
                value={assignments[item.ip] || ''}
                onChange={e => {
                  if (isLocked) return;
                  setAssignments(prev => ({ ...prev, [item.ip]: e.target.value }));
                  setStatus('idle'); setWrongKeys([]);
                }}
                disabled={isLocked}
                className={`flex-1 px-3 py-2 rounded-lg border text-xs font-bold text-[#395886] focus:outline-none focus:border-[#628ECB] bg-white
                  ${isLocked ? 'opacity-70 cursor-not-allowed' : 'border-[#D5DEEF] hover:border-[#628ECB]/50'}`}
              >
                <option value="">— pilih kategori —</option>
                {SORTER_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
              {(status === 'correct' || (status === 'locked' && isUserCorrect)) && <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" />}
              {(status === 'locked' && !isUserCorrect) && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
              {status === 'wrong' && isUserWrong && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
            </div>
          );
        })}
      </div>

      {status === 'wrong' && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200">
          <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-red-700">Beberapa IP salah kategori. Coba periksa oktet pertamanya!</p>
            <p className="text-[10px] text-red-500 mt-0.5">Tip: Private A = 10.x, Private B = 172.16–31.x, Private C = 192.168.x</p>
          </div>
        </div>
      )}

      {status === 'locked' && (
        <div className="space-y-3 animate-in fade-in duration-400">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-amber-700">
              Percobaan habis. Pelajari jawaban benar di bawah sebelum melanjutkan.
            </p>
          </div>
          <div className="rounded-xl border border-[#10B981]/25 overflow-hidden">
            <div className="px-3 py-2 bg-[#10B981]/8 border-b border-[#10B981]/15">
              <p className="text-[10px] font-black text-[#10B981] uppercase tracking-widest">Jawaban Benar</p>
            </div>
            <div className="divide-y divide-[#D5DEEF]">
              {SORTER_ITEMS.map(item => (
                <div key={item.ip} className="flex items-center gap-3 px-3 py-2.5 bg-white">
                  <span className="font-mono text-sm font-black text-[#395886] w-32 shrink-0">{item.ip}</span>
                  <ChevronRight className="w-3 h-3 text-[#10B981] shrink-0" />
                  <span className="text-xs font-bold text-[#065F46]">
                    {SORTER_CATEGORIES.find(c => c.id === item.correct)?.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {status === 'correct' && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#ECFDF5] border border-[#10B981]/25">
          <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-[#065F46]">Semua IP berhasil dikategorikan dengan benar!</p>
        </div>
      )}

      {!isLocked ? (
        <button
          onClick={handleCheck}
          disabled={!allFilled}
          className={`w-full py-3.5 rounded-xl font-black text-sm transition-all active:scale-95
            ${allFilled ? 'bg-[#395886] text-white hover:bg-[#2A4468]' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'}`}
        >
          Periksa Jawaban
        </button>
      ) : (
        <ContinueActivityButton onClick={onPass} label="Lanjut ke Studi Kasus" />
      )}
    </div>
  );
}

// ── IPMatrixPuzzle ─────────────────────────────────────────────────────────────

function IPMatrixPuzzle({ onPass, onAttemptsChange }: { onPass: () => void; onAttemptsChange?: (attempts: number) => void }) {
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<'idle' | 'wrong' | 'correct' | 'locked'>('idle');
  const [wrongKeys, setWrongKeys] = useState<string[]>([]);

  const allFilled = PUZZLE_IPS.every(item => !!assignments[item.ip]);
  const isLocked = status === 'correct' || status === 'locked';

  useEffect(() => {
    onAttemptsChange?.(attempts);
  }, [attempts, onAttemptsChange]);

  const handleCheck = () => {
    const wrong = PUZZLE_IPS.filter(item => assignments[item.ip] !== item.correct).map(item => item.ip);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    if (wrong.length === 0) {
      setStatus('correct');
    } else if (newAttempts >= 3) {
      setWrongKeys(wrong);
      setStatus('locked');
    } else {
      setWrongKeys(wrong);
      setStatus('wrong');
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#10B981]/25">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#10B981] mb-1">Jaringan: 192.168.1.0/24</p>
        <p className="text-xs font-bold text-[#065F46]">
          Subnet Mask: 255.255.255.0 | Total IP: 256 | Usable Hosts: 254
        </p>
      </div>

      <div className="p-4 rounded-xl bg-[#EEF4FF] border border-[#628ECB]/25 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#628ECB] shrink-0 mt-0.5" />
        <p className="text-xs font-bold text-[#395886]/80 leading-relaxed">
          Tentukan peran setiap alamat IP dalam jaringan 192.168.1.0/24.
          {attempts < 3 && <span className="ml-1 text-[#628ECB] font-black">{3 - attempts} percobaan tersisa.</span>}
        </p>
      </div>

      <div className="space-y-2">
        {PUZZLE_IPS.map(item => {
          const isUserWrong = wrongKeys.includes(item.ip);
          const isUserCorrect = assignments[item.ip] === item.correct;
          const rowBorder =
            status === 'correct' ? 'border-[#10B981]/30 bg-[#ECFDF5]/50'
            : (status === 'locked' && isUserCorrect) ? 'border-[#10B981]/30 bg-[#ECFDF5]/50'
            : (status === 'locked' && !isUserCorrect) ? 'border-red-300 bg-red-50/50'
            : isUserWrong ? 'border-red-300 bg-red-50/50'
            : 'border-[#D5DEEF] bg-white';
          return (
            <div key={item.ip} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${rowBorder}`}>
              <div className="w-36 shrink-0">
                <p className="font-mono text-sm font-black text-[#395886]">{item.ip}</p>
                <p className="text-[9px] text-[#395886]/40 font-bold">{item.hint}</p>
              </div>
              <select
                value={assignments[item.ip] || ''}
                onChange={e => {
                  if (isLocked) return;
                  setAssignments(prev => ({ ...prev, [item.ip]: e.target.value }));
                  setStatus('idle'); setWrongKeys([]);
                }}
                disabled={isLocked}
                className={`flex-1 px-3 py-2 rounded-lg border text-xs font-bold text-[#395886] focus:outline-none focus:border-[#628ECB] bg-white
                  ${isLocked ? 'opacity-70 cursor-not-allowed' : 'border-[#D5DEEF] hover:border-[#628ECB]/50'}`}
              >
                <option value="">— tentukan peran —</option>
                {PUZZLE_ROLES.map(role => (
                  <option key={role.id} value={role.id}>{role.label}</option>
                ))}
              </select>
              {(status === 'correct' || (status === 'locked' && isUserCorrect)) && <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" />}
              {(status === 'locked' && !isUserCorrect) && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
              {status === 'wrong' && isUserWrong && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
            </div>
          );
        })}
      </div>

      {status === 'wrong' && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200">
          <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-red-700">
            Beberapa peran belum tepat. IP pertama = Network (host=0), IP terakhir = Broadcast (host=255).
          </p>
        </div>
      )}

      {status === 'locked' && (
        <div className="space-y-3 animate-in fade-in duration-400">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-amber-700">
              Percobaan habis. Pelajari jawaban benar di bawah sebelum melanjutkan.
            </p>
          </div>
          <div className="rounded-xl border border-[#10B981]/25 overflow-hidden">
            <div className="px-3 py-2 bg-[#10B981]/8 border-b border-[#10B981]/15">
              <p className="text-[10px] font-black text-[#10B981] uppercase tracking-widest">Jawaban Benar — 192.168.1.0/24</p>
            </div>
            <div className="divide-y divide-[#D5DEEF]">
              {PUZZLE_IPS.map(item => (
                <div key={item.ip} className="flex items-center gap-3 px-3 py-2.5 bg-white">
                  <span className="font-mono text-sm font-black text-[#395886] w-36 shrink-0">{item.ip}</span>
                  <ChevronRight className="w-3 h-3 text-[#10B981] shrink-0" />
                  <span className="text-xs font-bold text-[#065F46]">
                    {PUZZLE_ROLES.find(r => r.id === item.correct)?.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {status === 'correct' && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#ECFDF5] border border-[#10B981]/25">
          <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-[#065F46]">Peta alamat 192.168.1.0/24 berhasil disusun!</p>
        </div>
      )}

      {!isLocked ? (
        <button
          onClick={handleCheck}
          disabled={!allFilled}
          className={`w-full py-3.5 rounded-xl font-black text-sm transition-all active:scale-95
            ${allFilled ? 'bg-[#395886] text-white hover:bg-[#2A4468]' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'}`}
        >
          Periksa Peta Jaringan
        </button>
      ) : (
        <ContinueActivityButton onClick={onPass} label="Lanjut ke Studi Kasus Broadcast" />
      )}
    </div>
  );
}

// ── DropdownReflection ────────────────────────────────────────────────────────

function DropdownReflection({
  blanks,
  templateParts,
  onConfirm,
  alreadyConfirmed,
  savedAnswers,
}: {
  blanks: typeof A1_BLANKS | typeof A2_BLANKS;
  templateParts: string[];
  onConfirm: (answers: Record<string, string>) => void;
  alreadyConfirmed: boolean;
  savedAnswers: Record<string, string>;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(savedAnswers);

  const allCorrect = blanks.every(b => answers[b.key] === b.correct);

  const setAnswer = (key: string, val: string) => {
    if (alreadyConfirmed) return;
    setAnswers(prev => ({ ...prev, [key]: val }));
  };

  const getAnswerColor = (b: (typeof blanks)[0]) => {
    if (!answers[b.key] || answers[b.key] === '— pilih —') return 'border-[#D5DEEF] bg-white text-[#395886]';
    if (alreadyConfirmed || answers[b.key] === b.correct) return 'border-[#10B981] bg-[#ECFDF5] text-[#065F46]';
    return 'border-[#D5DEEF] bg-white text-[#395886]';
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-[#F8FAFD] border-2 border-[#D5DEEF]">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40 mb-3">Isi Pernyataan Kesimpulan</p>
        <div className="text-sm font-bold text-[#395886] leading-loose">
          {templateParts.map((part, i) => (
            <React.Fragment key={i}>
              {part}
              {i < blanks.length && (
                <select
                  value={answers[blanks[i].key] || ''}
                  onChange={e => setAnswer(blanks[i].key, e.target.value)}
                  disabled={alreadyConfirmed}
                  className={`inline-block mx-1 px-2 py-1 rounded-lg border-2 text-xs font-black focus:outline-none transition-all
                    ${getAnswerColor(blanks[i])}
                    ${alreadyConfirmed ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:border-[#628ECB]/50'}`}
                >
                  {blanks[i].options.map(opt => <option key={opt} value={opt === '— pilih —' ? '' : opt}>{opt}</option>)}
                </select>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {alreadyConfirmed ? (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[#ECFDF5] border border-[#10B981]/25">
          <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" />
          <p className="text-xs font-bold text-[#065F46]">Isian tersimpan dan dikonfirmasi.</p>
        </div>
      ) : (
        <button
          onClick={() => allCorrect && onConfirm(answers)}
          disabled={!allCorrect}
          className={`w-full py-3 rounded-xl font-black text-sm transition-all active:scale-95
            ${allCorrect ? 'bg-[#10B981] text-white hover:bg-[#059669]' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'}`}
        >
          {allCorrect ? 'Konfirmasi Isian ✓' : 'Isi Semua Bagian dengan Benar'}
        </button>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function LearningCommunityLesson3({
  lessonId, stageIndex, groupName, isCompleted, onComplete, onTrackerPhase,
}: Props) {
  const tracker = useActivityTracker({ lessonId, stageIndex, stageType: 'learning-community' });

  const [phase, setPhase] = useState<L3Phase>(isCompleted ? 'final' : 'analyzer');
  const [a1ArgueText, setA1ArgueText] = useState('');
  const [a1ReflectionText, setA1ReflectionText] = useState('');
  const [a2ArgueText, setA2ArgueText] = useState('');
  const [a2ReflectionText, setA2ReflectionText] = useState('');
  const [conclusionText, setConclusionText] = useState('');
  const [module1Data, setModule1Data] = useState<any>(null);
  const [module2Data, setModule2Data] = useState<any>(null);
  const [isRestored, setIsRestored] = useState(false);
  const [a1Attempts, setA1Attempts] = useState(0);
  const [a2Attempts, setA2Attempts] = useState(0);

  useEffect(() => {
    if (!tracker.isLoading && tracker.session?.latestSnapshot && !isRestored) {
      const snap = tracker.session.latestSnapshot;
      if (snap.l3lc_phase) setPhase(snap.l3lc_phase);
      if (snap.l3lc_a1_argue) setA1ArgueText(snap.l3lc_a1_argue);
      if (snap.l3lc_a1_reflection) setA1ReflectionText(snap.l3lc_a1_reflection);
      if (snap.l3lc_a2_argue) setA2ArgueText(snap.l3lc_a2_argue);
      if (snap.l3lc_a2_reflection) setA2ReflectionText(snap.l3lc_a2_reflection);
      if (snap.l3lc_conclusion) setConclusionText(snap.l3lc_conclusion);
      if (snap.module1Data) setModule1Data(snap.module1Data);
      if (snap.module2Data) setModule2Data(snap.module2Data);
      setIsRestored(true);
    } else if (!tracker.isLoading) {
      setIsRestored(true);
    }
  }, [isRestored, tracker.isLoading, tracker.session]);

  // Auto-save snapshot on state changes
  useEffect(() => {
    if (!isRestored) return;
    const progressMap: Record<L3Phase, number> = {
      analyzer: 5, a1_info: 12, a1_sorter: 22, a1_argue: 35,
      a1_conclusion: 45, a1_done: 52, a2_intro: 60, a2_puzzle: 70,
      a2_argue: 80, a2_conclusion: 88, group_result: 92, final: 95,
    };
    void tracker.saveSnapshot(
      { l3lc_phase: phase, l3lc_a1_argue: a1ArgueText, l3lc_a1_reflection: a1ReflectionText,
        l3lc_a2_argue: a2ArgueText, l3lc_a2_reflection: a2ReflectionText,
        l3lc_conclusion: conclusionText, module1Data, module2Data, finalConclusion: conclusionText },
      { progressPercent: progressMap[phase] ?? 5 },
    );
  }, [phase, a1ArgueText, a1ReflectionText, a2ArgueText, a2ReflectionText, conclusionText, isRestored, module1Data, module2Data, tracker]);

  // Report tracker phase to parent
  useEffect(() => {
    onTrackerPhase?.(phaseToTracker(phase));
  }, [phase, onTrackerPhase]);

  const goTo = (p: L3Phase) => setPhase(p);

  // ── Render ──────────────────────────────────────────────────────────────────

  if (!groupName) {
    return (
      <div className="w-full py-12 text-center bg-white rounded-lg border-2 border-dashed border-[#D5DEEF] shadow-inner">
        <div className="h-16 w-16 mx-auto mb-6 text-[#D5DEEF]"><Users className="w-full h-full" /></div>
        <h4 className="text-xl font-black text-[#395886] mb-2 uppercase tracking-tight">Kelompok Belum Terdeteksi</h4>
        <p className="text-sm font-bold text-[#395886]/40 italic max-w-sm mx-auto leading-relaxed">
          Pilih kelompokmu di <span className="text-[#628ECB] not-italic font-black">Dashboard</span> untuk memulai Learning Community.
        </p>
      </div>
    );
  }

  if (tracker.isLoading || !isRestored) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-[#628ECB] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-[#395886]">Memuat progres...</p>
      </div>
    );
  }

  return (
    <div className={`w-full space-y-5 ${anim.fadeUp}`}>
      <MainActivityTracker phase={phase} />

      {/* ── Phase: analyzer ── */}
      {phase === 'analyzer' && (
        <ActivityCard
          icon={<Network className="w-5 h-5 text-[#628ECB]" />}
          label="X.IP.4 — Pengantar"
          title="IPv4 Analyzer: Eksplorasi Alamat IP"
          headerBg="bg-[#628ECB]/5"
          headerBorder="border-[#628ECB]/20"
          iconBg="bg-[#628ECB]/10"
          labelCls="text-[#628ECB]"
        >
          <div className="space-y-4">
            <InstructionBox>
              Gunakan alat di bawah untuk menganalisis alamat IPv4 secara real-time. Masukkan beberapa IP berbeda untuk memahami pola kelas dan jenis (Private/Public).
            </InstructionBox>
            <div className="rounded-xl border border-[#628ECB]/15 bg-[#EEF4FF]/60 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#628ECB] mb-1">Alur Berpikir</p>
              <p className="text-xs font-bold text-[#395886]/75">Amati pola alamat IP terlebih dahulu, lalu gunakan temuanmu sebagai bekal saat masuk ke X.IP.4 dan X.IP.5.</p>
            </div>
            <Ipv4Analyzer />
            <SimpleNextButton onClick={() => goTo('a1_info')} label="Lanjut ke X.IP.4 — Kelas IPv4" />
          </div>
        </ActivityCard>
      )}

      {/* ── Phase: a1_info ── */}
      {phase === 'a1_info' && (
        <ActivityCard
          icon={<BookOpen className="w-5 h-5 text-[#628ECB]" />}
          label="X.IP.4 — Infografis"
          title="Kelas IPv4 & Range Alamat"
          headerBg="bg-[#628ECB]/5"
          headerBorder="border-[#628ECB]/20"
          iconBg="bg-[#628ECB]/10"
          labelCls="text-[#628ECB]"
        >
          <div className="space-y-4">
            <InstructionBox>
              Pelajari 4 kelas utama IPv4 dan rentang alamat Private yang dipakai dalam jaringan lokal.
            </InstructionBox>
            <SectionDivider label="Keruntutan Berpikir" icon={<Layers className="w-3 h-3" />} />

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { cls: 'A', range: '1 – 126', subnet: '255.0.0.0', private: '10.0.0.0/8', color: '#628ECB' },
                { cls: 'B', range: '128 – 191', subnet: '255.255.0.0', private: '172.16.0.0/12', color: '#7C5CBF' },
                { cls: 'C', range: '192 – 223', subnet: '255.255.255.0', private: '192.168.0.0/16', color: '#10B981' },
                { cls: 'D/E', range: '224 – 255', subnet: '—', private: 'Multicast / Reserved', color: '#F59E0B' },
              ].map(item => (
                <div key={item.cls} className="rounded-xl border-2 overflow-hidden" style={{ borderColor: `${item.color}40` }}>
                  <div className="flex items-center gap-2 px-3 py-2" style={{ backgroundColor: `${item.color}15` }}>
                    <div className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ backgroundColor: item.color }}>
                      {item.cls}
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: item.color }}>Kelas {item.cls}</p>
                      <p className="text-[10px] font-black text-[#395886]">Oktet 1: {item.range}</p>
                    </div>
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-[10px] font-bold text-[#395886]/60">Subnet: <span className="font-black text-[#395886] font-mono">{item.subnet}</span></p>
                    <p className="text-[10px] font-bold text-[#395886]/60">Private: <span className="font-black text-[#395886] font-mono">{item.private}</span></p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-[#FFF7ED] border border-[#E07C39]/25">
              <p className="text-[10px] font-black text-[#E07C39] uppercase tracking-widest mb-1">Cara Cepat Mengenali Private IP</p>
              <ul className="space-y-1">
                {[
                  '10.x.x.x → Private Kelas A',
                  '172.16.x.x – 172.31.x.x → Private Kelas B',
                  '192.168.x.x → Private Kelas C',
                  'Selain itu → Public / Internet',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#E07C39] font-black text-[10px]">→</span>
                    <span className="text-[10px] font-bold text-[#92400E]">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <SimpleNextButton onClick={() => goTo('a1_sorter')} label="Mulai Oktet Sorter" />
          </div>
        </ActivityCard>
      )}

      {/* ── Phase: a1_sorter ── */}
      {phase === 'a1_sorter' && (
        <ActivityCard
          icon={<Layers className="w-5 h-5 text-[#628ECB]" />}
          label="X.IP.4 — Keruntutan Berpikir"
          title="Oktet Sorter — Klasifikasikan 6 Alamat IP"
          headerBg="bg-[#628ECB]/5"
          headerBorder="border-[#628ECB]/20"
          iconBg="bg-[#628ECB]/10"
          labelCls="text-[#628ECB]"
          attempts={a1Attempts}
          maxAttempts={3}
          attemptCls="text-[#628ECB]"
          attemptBorderCls="border-[#628ECB]/20"
        >
          <OktetSorter onPass={() => goTo('a1_argue')} onAttemptsChange={setA1Attempts} />
        </ActivityCard>
      )}

      {/* ── Phase: a1_argue ── */}
      {phase === 'a1_argue' && (
        <L3ModuleFlow
          lessonId={lessonId}
          module={MODULE_XIP4}
          groupName={groupName}
          onModuleDone={data => {
            setModule1Data(data);
            const myArgument = data?.discussions?.find((discussion: any) => discussion.user_id === getCurrentUser()?.id)?.argument ?? data?.bestArgument?.argument ?? '';
            setA1ArgueText(myArgument);
            goTo('a1_conclusion');
          }}
        />
      )}

      {/* ── Phase: a1_conclusion ── */}
      {phase === 'a1_conclusion' && (
        <ATPConclusionBox
          atpBehavior="mampu mengidentifikasi kelas alamat IPv4 serta membedakan alamat IP Private dan IP Public berdasarkan karakteristik oktet pertamanya"
          objectiveCode="X.IP.4"
          stageType="learning-community"
          defaultValue={a1ReflectionText}
          disabled={!!a1ReflectionText}
          minWords={10}
          onSubmit={text => {
            setA1ReflectionText(text);
            setTimeout(() => goTo('a1_done'), 600);
          }}
        />
      )}

      {/* ── Phase: a1_done ── */}
      {phase === 'a1_done' && (
        <div className="space-y-4">
          <ActivityCard
            icon={<CheckCircle className="w-5 h-5 text-[#10B981]" />}
            label="X.IP.4 — Selesai"
            title="Aktivitas 1 Selesai — Kelas & Jenis IPv4"
            headerBg="bg-[#10B981]/5"
            headerBorder="border-[#10B981]/20"
            iconBg="bg-[#10B981]/10"
            labelCls="text-[#10B981]"
          >
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'IP Disortir', value: '6', sub: 'ke 4 kategori' },
                  { label: 'Studi Kasus', value: '1', sub: '172.217.1.1' },
                  { label: 'Simpulan', value: '✓', sub: 'Dikonfirmasi' },
                ].map(item => (
                  <div key={item.label} className="text-center p-3 rounded-xl bg-[#F0FDF4] border border-[#10B981]/20">
                    <p className="text-xl font-black text-[#10B981]">{item.value}</p>
                    <p className="text-[9px] font-black text-[#065F46] uppercase tracking-widest">{item.label}</p>
                    <p className="text-[9px] text-[#065F46]/60 font-bold">{item.sub}</p>
                  </div>
                ))}
              </div>
              {a1ArgueText && (
                <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#F59E0B]/20">
                  <p className="text-[9px] font-black text-[#F59E0B] uppercase tracking-widest mb-1">Argumenmu tentang 172.217.1.1</p>
                  <p className="text-xs text-[#78350F] leading-relaxed">{a1ArgueText}</p>
                </div>
              )}
              {a1ReflectionText && (
                <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#10B981]/20">
                  <p className="text-[9px] font-black text-[#10B981] uppercase tracking-widest mb-1">Refleksi X.IP.4</p>
                  <p className="text-xs text-[#065F46] leading-relaxed">{a1ReflectionText}</p>
                </div>
              )}
              <button
                onClick={() => goTo('a2_intro')}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#395886] text-white font-black text-sm hover:bg-[#2A4468] transition-all active:scale-95"
              >
                Lanjut ke Aktivitas 2 — Range Host <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </ActivityCard>
        </div>
      )}

      {/* ── Phase: a2_intro ── */}
      {phase === 'a2_intro' && (
        <ActivityCard
          icon={<MapPin className="w-5 h-5 text-[#7C5CBF]" />}
          label="X.IP.5 — Materi"
          title="Range Host: Network ID, Host, Broadcast"
          headerBg="bg-[#7C5CBF]/5"
          headerBorder="border-[#7C5CBF]/20"
          iconBg="bg-[#7C5CBF]/10"
          labelCls="text-[#7C5CBF]"
        >
          <div className="space-y-4">
            <InstructionBox accent="text-[#7C5CBF]">
              Setiap subnet memiliki alamat khusus yang tidak bisa dipakai sebagai host biasa. Pelajari konsepnya sebelum menyelesaikan puzzle di bawah.
            </InstructionBox>
            <SectionDivider label="Keruntutan Berpikir" icon={<Layers className="w-3 h-3" />} />

            <div className="space-y-2.5">
              {[
                {
                  role: 'Network ID',
                  desc: 'Alamat pertama dalam subnet. Mengidentifikasi jaringan itu sendiri.',
                  example: '192.168.1.0',
                  color: '#628ECB',
                  detail: 'Host ID semua bit = 0',
                },
                {
                  role: 'Host (Usable)',
                  desc: 'Alamat yang bisa diberikan ke perangkat (PC, router, server).',
                  example: '192.168.1.1 – 192.168.1.254',
                  color: '#10B981',
                  detail: '254 host tersedia di /24',
                },
                {
                  role: 'Broadcast ID',
                  desc: 'Alamat terakhir dalam subnet. Mengirim data ke semua perangkat dalam jaringan.',
                  example: '192.168.1.255',
                  color: '#E07C39',
                  detail: 'Host ID semua bit = 1',
                },
              ].map(item => (
                <div key={item.role} className="flex items-start gap-3 p-3.5 rounded-xl border-2" style={{ borderColor: `${item.color}30`, backgroundColor: `${item.color}08` }}>
                  <div className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center text-white text-[10px] font-black" style={{ backgroundColor: item.color }}>
                    {item.role.split(' ')[0].charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-[#395886]">{item.role}</p>
                    <p className="text-[10px] text-[#395886]/60 leading-relaxed">{item.desc}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[10px] font-black text-[#395886] bg-white/70 px-2 py-0.5 rounded border border-white/50">{item.example}</span>
                      <span className="text-[9px] text-[#395886]/40 font-bold">{item.detail}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[#F0F3FA] border border-[#7C5CBF]/20">
              <p className="text-[10px] font-black text-[#7C5CBF] uppercase tracking-widest mb-1">Rumus Usable Host</p>
              <p className="text-sm font-black text-[#395886] font-mono">Usable = Total IP − 2</p>
              <p className="text-[10px] text-[#395886]/60 font-bold">Dikurangi 2: Network ID + Broadcast ID</p>
            </div>

            <SimpleNextButton onClick={() => goTo('a2_puzzle')} label="Mulai IP Matrix Puzzle" />
          </div>
        </ActivityCard>
      )}

      {/* ── Phase: a2_puzzle ── */}
      {phase === 'a2_puzzle' && (
        <ActivityCard
          icon={<Layers className="w-5 h-5 text-[#7C5CBF]" />}
          label="X.IP.5 — Keruntutan Berpikir"
          title="IP Matrix Puzzle — Peta Jaringan 192.168.1.0/24"
          headerBg="bg-[#7C5CBF]/5"
          headerBorder="border-[#7C5CBF]/20"
          iconBg="bg-[#7C5CBF]/10"
          labelCls="text-[#7C5CBF]"
          attempts={a2Attempts}
          maxAttempts={3}
          attemptCls="text-[#7C5CBF]"
          attemptBorderCls="border-[#7C5CBF]/20"
        >
          <IPMatrixPuzzle onPass={() => goTo('a2_argue')} onAttemptsChange={setA2Attempts} />
        </ActivityCard>
      )}

      {/* ── Phase: a2_argue ── */}
      {phase === 'a2_argue' && (
        <L3ModuleFlow
          lessonId={lessonId}
          module={MODULE_XIP5}
          groupName={groupName}
          onModuleDone={data => {
            setModule2Data(data);
            const myArgument = data?.discussions?.find((discussion: any) => discussion.user_id === getCurrentUser()?.id)?.argument ?? data?.bestArgument?.argument ?? '';
            setA2ArgueText(myArgument);
            goTo('a2_conclusion');
          }}
        />
      )}

      {/* ── Phase: a2_conclusion ── */}
      {phase === 'a2_conclusion' && (
        <ATPConclusionBox
          atpBehavior="mampu menjelaskan peran Network ID, Broadcast ID, dan jumlah usable host pada sebuah subnet IPv4 secara logis"
          objectiveCode="X.IP.5"
          stageType="learning-community"
          defaultValue={a2ReflectionText}
          disabled={!!a2ReflectionText}
          minWords={10}
          onSubmit={text => {
            setA2ReflectionText(text);
            setTimeout(() => goTo('group_result'), 600);
          }}
        />
      )}

      {phase === 'group_result' && (
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
                Berikut adalah poin-poin kesepakatan terbaik kelompok <span className="text-[#628ECB] font-black">{groupName}</span> untuk aktivitas X.IP.4 dan X.IP.5.
              </p>

              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="p-5 rounded-2xl border-2 border-[#10B981]/20 bg-[#F0FDF4]/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                    <p className="text-[10px] font-black text-[#10B981] uppercase tracking-widest">X.IP.4 — Kelas IPv4</p>
                  </div>
                  <p className="text-xs font-bold text-[#395886]/80 leading-relaxed italic bg-white/80 p-3.5 rounded-xl border border-[#10B981]/10">
                    "{module1Data?.bestArgument?.argument || 'Hasil belum tersedia'}"
                  </p>
                </div>
                <div className="p-5 rounded-2xl border-2 border-[#628ECB]/20 bg-[#EEF4FF]/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <PlayCircle className="w-4 h-4 text-[#628ECB]" />
                    <p className="text-[10px] font-black text-[#628ECB] uppercase tracking-widest">X.IP.5 — Range Host</p>
                  </div>
                  <p className="text-xs font-bold text-[#395886]/80 leading-relaxed italic bg-white/80 p-3.5 rounded-xl border border-[#628ECB]/10">
                    "{module2Data?.bestArgument?.argument || 'Hasil belum tersedia'}"
                  </p>
                </div>
              </div>

              <button onClick={() => goTo('final')} className="w-full py-3.5 rounded-lg bg-[#395886] text-white font-black text-sm shadow-md active:scale-95 transition-all hover:bg-[#2A4468] flex items-center justify-center gap-2 group">
                Lanjut ke Kesimpulan Individu <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </ActivityCard>
        </div>
      )}

      {/* ── Phase: final ── */}
      {phase === 'final' && (
        <div className="space-y-5">
          <ATPConclusionBox
            atpBehavior="mampu menerapkan pengetahuan kelas IPv4 beserta rentang alamat Private & Public serta konsep range host IPv4 dalam pengalamatan jaringan"
            objectiveCode="X.IP.4 & X.IP.5"
            stageType="learning-community"
            defaultValue={conclusionText}
            disabled={!!conclusionText}
            minWords={10}
            onSubmit={essay => {
              setConclusionText(essay);
              const finalAnswer = {
                a1ArgueText, a1ReflectionText, a2ArgueText, a2ReflectionText, module1Data, module2Data, finalConclusion: essay, conclusionText: essay,
              };
              void tracker.complete(finalAnswer, { l3lc_conclusion: essay, module1Data, module2Data, finalConclusion: essay });
              onComplete(finalAnswer);
            }}
          />

          {conclusionText && (
            <IndicatorSummaryCard
              title="Rekap Aktivitas — 3 Indikator Berpikir Logis (X.IP.4 & X.IP.5)"
              consistency={
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#628ECB]/8 border border-[#628ECB]/15">
                    <CheckCircle className="w-4 h-4 text-[#628ECB] shrink-0" />
                    <span className="text-xs font-bold text-[#395886]">
                      6 alamat IPv4 berhasil disortir ke 4 kategori: Kelas A Private, Kelas B Private, Kelas C Private, dan Public
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#628ECB]/8 border border-[#628ECB]/15">
                    <CheckCircle className="w-4 h-4 text-[#628ECB] shrink-0" />
                    <span className="text-xs font-bold text-[#395886]">
                      4 alamat jaringan 192.168.1.0/24 berhasil dipetakan: Network ID → Host Pertama → Host Terakhir → Broadcast ID
                    </span>
                  </div>
                </div>
              }
              arguing={
                <div className="space-y-2">
                  <div className="px-3 py-2.5 rounded-xl bg-[#FFFBEB] border border-[#F59E0B]/20">
                    <p className="text-[10px] font-black text-[#F59E0B] mb-1">Poin Penting Pembelajaran</p>
                    <p className="text-xs text-[#78350F] leading-relaxed">
                      Kelas IPv4 dikenali dari oktet pertama, sedangkan range host ditentukan oleh posisi Network ID, host pertama, host terakhir, dan Broadcast ID.
                    </p>
                  </div>
                  {module1Data?.bestArgument && (
                    <div className="px-3 py-2.5 rounded-xl bg-[#FFFBEB] border border-[#F59E0B]/20">
                      <p className="text-[10px] font-black text-[#F59E0B] mb-1">Hasil Diskusi X.IP.4</p>
                      <p className="text-[10px] font-bold text-[#92400E] mb-1">Pilihan kelompok: {module1Data.bestArgument.choice_text}</p>
                      <p className="text-xs text-[#78350F] leading-relaxed">{module1Data.bestArgument.argument}</p>
                    </div>
                  )}
                  {module2Data?.bestArgument && (
                    <div className="px-3 py-2.5 rounded-xl bg-[#FFFBEB] border border-[#F59E0B]/20">
                      <p className="text-[10px] font-black text-[#F59E0B] mb-1">Hasil Diskusi X.IP.5</p>
                      <p className="text-[10px] font-bold text-[#92400E] mb-1">Pilihan kelompok: {module2Data.bestArgument.choice_text}</p>
                      <p className="text-xs text-[#78350F] leading-relaxed">{module2Data.bestArgument.argument}</p>
                    </div>
                  )}
                </div>
              }
              conclusion={
                <div className="space-y-2">
                  {a1ReflectionText && (
                    <p className="text-xs text-[#065F46] leading-relaxed px-3 py-2.5 rounded-xl bg-[#ECFDF5] border border-[#10B981]/20">
                      <span className="font-black">Refleksi X.IP.4:</span> {a1ReflectionText}
                    </p>
                  )}
                  {a2ReflectionText && (
                    <p className="text-xs text-[#065F46] leading-relaxed px-3 py-2.5 rounded-xl bg-[#ECFDF5] border border-[#10B981]/20">
                      <span className="font-black">Refleksi X.IP.5:</span> {a2ReflectionText}
                    </p>
                  )}
                  <p className="text-xs text-[#065F46] leading-relaxed px-3 py-2.5 rounded-xl bg-[#ECFDF5] border border-[#10B981]/20">
                    {conclusionText}
                  </p>
                  <div className="px-3 py-2.5 rounded-xl bg-[#ECFDF5] border border-[#10B981]/20">
                    <p className="text-[10px] font-black text-[#10B981] mb-1">Kesimpulan Umum Pembelajaran</p>
                    <p className="text-xs text-[#065F46] leading-relaxed">
                      Siswa telah menyelesaikan X.IP.4 dan X.IP.5 melalui eksplorasi IPv4 Analyzer, klasifikasi alamat IP, analisis studi kasus kelompok, voting argumen, dan refleksi akhir tentang kelas IPv4 serta range host.
                    </p>
                  </div>
                </div>
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
