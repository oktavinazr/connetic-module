import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronRight, CheckCircle, XCircle, Users, Link as LinkIcon, FileSearch,
  MessageSquare, Info, RotateCcw, AlertCircle, ThumbsUp, ArrowUpDown, GripVertical,
  Zap, Database, Cpu, Cable, Network, ShieldCheck, PlayCircle, Eye, ArrowRight,
  Vote, Award, Sparkles, Monitor, PenLine, BookOpen, GraduationCap, Lightbulb,
  Clock
} from 'lucide-react';
import { getCurrentUser } from '../../utils/auth';
import { 
  createGroupDiscussion, 
  getGroupDiscussions, 
  toggleGroupDiscussionVote, 
  getGroupMembers, 
  type GroupDiscussion 
} from '../../utils/groups';
import { supabase } from '../../utils/supabase';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { TcpIpInteractive } from '../ui/TcpIpInteractive';
import { StepTracker, ActivityCard, InstructionBox, EssayBox, anim, SectionDivider } from './StageKit';

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

// -- Phase 1: Concept -----------------------------------------------------------

function ConceptPhase({
  title, concept, layers, isEncapsulation, onNext,
}: {
  title: string; concept: string; layers: any[]; isEncapsulation: boolean; onNext: () => void;
}) {
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
          
          <SectionDivider label="Struktur Lapisan" icon={<Database className="w-3 h-3" />} />
          
          <div className="flex flex-col gap-2 max-w-sm mx-auto w-full">
            {layers.map((layer, idx) => (
              <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl border-2 border-[#D5DEEF] bg-[#F8FAFD] hover:border-[#628ECB]/30 transition-all`}>
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
        </div>
      </ActivityCard>

      <button onClick={onNext} className="w-full py-3.5 rounded-lg bg-[#395886] text-white font-black text-sm hover:bg-[#2A4468] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 group">
        Mulai Analisis Skenario <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

// -- Phase 2: Case Study + Argument Input --------------------------------------

function CasePhase({ study, isSubmitted, submitError, checkingSubmission, onNext }: { study: CaseStudy; isSubmitted?: boolean; submitError?: string | null; checkingSubmission?: boolean; onNext: (choiceId: string, choiceText: string, argument: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [argument, setArgument] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const ready = selected && argument.trim().length >= 15;

  if (checkingSubmission) return (
    <div className="flex flex-col items-center justify-center py-16 space-y-3">
      <RotateCcw className="w-8 h-8 text-[#F59E0B] animate-spin" />
      <p className="text-xs font-bold text-[#395886]/50">Memeriksa status pengiriman...</p>
    </div>
  );

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

          {(selected || isSubmitted) && (
            <div className={`space-y-3 p-5 rounded-2xl bg-[#F8FAFD] border-2 border-[#D5DEEF]/60 ${anim.fadeUp}`}>
              <div className="flex items-center gap-2">
                <PenLine className="w-4 h-4 text-[#395886]/60" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/60">Argumen Logismu</p>
              </div>
              <textarea
                value={argument}
                readOnly={isSubmitted}
                onChange={e => setArgument(e.target.value)}
                rows={3}
                className={`w-full p-4 border-2 border-[#D5DEEF] rounded-xl text-sm text-[#395886] focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/5 outline-none transition-all resize-none ${isSubmitted ? 'bg-[#F1F5F9] border-dashed cursor-not-allowed' : 'bg-white'}`}
                placeholder="Jelaskan alasan teknismu di sini..."
              />
              <div className="flex justify-between items-center">
                {isSubmitted ? (
                  <div className="flex items-center gap-1.5 text-[#10B981] font-black text-[10px] uppercase">
                    <CheckCircle className="w-3.5 h-3.5" /> Argumen Berhasil Dikirim ke Kelompok
                  </div>
                ) : (
                  <p className={`text-[10px] font-bold ${argument.trim().length >= 15 ? 'text-[#10B981]' : 'text-[#395886]/30'}`}>
                    {argument.trim().length} / 15 Karakter Minimal
                  </p>
                )}
              </div>
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
  const [checkingSubmission, setCheckingSubmission] = useState(true);
  const user = getCurrentUser();

  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── One-time submission guard: check if user already submitted ──
  useEffect(() => {
    let cancelled = false;
    getGroupDiscussions(lessonId, moduleId, groupName).then(existing => {
      if (cancelled) return;
      const alreadySubmitted = existing.some(d => d.user_id === user!.id);
      if (alreadySubmitted) {
        setIsSubmitted(true);
        // If all members have submitted, jump straight to discussion
        getGroupMembers(groupName).then(members => {
          const submissions = existing.map(d => d.user_id);
          const allDone = members.length > 0 && members.every(m => submissions.includes(m.user_id));
          if (allDone) {
            setPhase('discussion');
          }
        });
      }
      setCheckingSubmission(false);
    });
    return () => { cancelled = true; };
  }, []);

  const handleCaseSubmit = async (choiceId: string, choiceText: string, argument: string) => {
    setSubmitError(null);
    try {
      await createGroupDiscussion({
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
      {phase === 'concept' && <ConceptPhase title={title} concept={concept} layers={layers} isEncapsulation={isEncapsulation} onNext={() => setPhase('case')} />}
      {phase === 'case' && <CasePhase study={study} isSubmitted={isSubmitted} submitError={submitError} checkingSubmission={checkingSubmission} onNext={handleCaseSubmit} />}
      {phase === 'discussion' && <DiscussionPhase lessonId={lessonId} moduleId={moduleId} groupName={groupName} onNext={finalizeModule} />}
      {phase === 'result' && <ResultPhase moduleId={moduleId} discussions={discussions} onDone={handleResultDone} />}
    </div>
  );
}

// -- Overall Group Result -------------------------------------------------------

function OverallGroupResult({ module1Data, module2Data, groupName, onNext }: { module1Data: any; module2Data: any; groupName: string; onNext: () => void }) {
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
                <p className="text-[10px] font-black text-[#10B981] uppercase tracking-widest">Enkapsulasi (X.TCP.6)</p>
              </div>
              <p className="text-xs font-bold text-[#395886]/80 leading-relaxed italic bg-white/80 p-3.5 rounded-xl border border-[#10B981]/10">
                "{module1Data?.bestArgument?.argument || 'Hasil belum tersedia'}"
              </p>
            </div>
            <div className="p-5 rounded-2xl border-2 border-[#628ECB]/20 bg-[#EEF4FF]/30 space-y-3">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-[#628ECB]" />
                <p className="text-[10px] font-black text-[#628ECB] uppercase tracking-widest">Dekapsulasi (X.TCP.7)</p>
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
  layers5 = [], encapsulationCase, decapsulationCase
}: LearningCommunityStageProps) {
  const tracker = useActivityTracker({
    lessonId,
    stageIndex,
    stageType: 'learning-community',
  });
  
  const [subStage, setSubPhase] = useState<'simulasi' | 'x_tcp_6' | 'x_tcp_7' | 'group_result' | 'individual_summary'>(isCompleted ? 'individual_summary' : 'simulasi');
  const [understood, setUnderstood] = useState(false);
  const [module1Data, setModule1Data] = useState<any>(null);
  const [module2Data, setModule2Data] = useState<any>(null);
  const [members, setMembers] = useState<{ user_id: string; user_name: string }[]>([]);

  useEffect(() => {
    if (groupName) {
      getGroupMembers(groupName).then(setMembers);
    }
  }, [groupName]);

  useEffect(() => {
    const progressMap = { simulasi: 10, x_tcp_6: 35, x_tcp_7: 65, group_result: 85, individual_summary: 95 } as const;
    void tracker.saveSnapshot(
      { subStage, understood, module1Data, module2Data },
      { progressPercent: progressMap[subStage] },
    );
  }, [subStage, understood, module1Data, module2Data, tracker]);

  if (!groupName) return (
    <div className="w-full py-12 text-center bg-white rounded-lg border-2 border-dashed border-[#D5DEEF] shadow-inner">
       <div className="h-16 w-16 mx-auto mb-6 text-[#D5DEEF]"><Users className="w-full h-full" /></div>
       <h4 className="text-xl font-black text-[#395886] mb-2 uppercase tracking-tight">Kelompok Belum Terdeteksi</h4>
       <p className="text-sm font-bold text-[#395886]/40 italic max-w-sm mx-auto leading-relaxed">
         Pilih kelompokmu di <span className="text-[#628ECB] not-italic font-black">Dashboard</span> untuk memulai simulasi kolaborasi ini.
       </p>
    </div>
  );

  if (subStage === 'simulasi') return (
    <div className={`w-full space-y-6 ${anim.fadeUp}`}>
       <div className="bg-white rounded-lg border-2 border-[#628ECB]/20 p-5 shadow-sm overflow-hidden">
          <div className="flex items-center gap-4 mb-8 text-left border-b border-[#D5DEEF]/60 pb-5">
             <div className="h-12 w-12 rounded-xl bg-[#628ECB]/10 text-[#628ECB] flex items-center justify-center shadow-sm"><Monitor className="w-6 h-6" /></div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]">Tahap Simulasi</p>
                <h2 className="text-lg font-black text-[#395886]">Visualisasi Interaktif Enkapsulasi & Dekapsulasi</h2>
             </div>
          </div>
          
          <TcpIpInteractive />

          <div className={`mt-8 p-4 rounded-lg border-2 transition-all text-left flex items-start gap-3 ${understood ? 'border-[#10B981] bg-[#F0FDF4]/50' : 'border-[#D5DEEF] bg-[#F8FAFD]'}`}>
             <button onClick={() => setUnderstood(!understood)} className={`mt-1 h-6 w-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${understood ? 'bg-[#10B981] border-[#10B981]' : 'bg-white border-[#D5DEEF]'}`}>
                {understood && <CheckCircle className="w-4 h-4 text-white" />}
             </button>
             <label className="text-sm font-bold text-[#395886] leading-relaxed cursor-pointer select-none">
                Saya sudah memahami proses Enkapsulasi & Dekapsulasi melalui simulasi di atas dan siap menganalisis skenario bersama kelompok <span className="text-[#628ECB] font-black">{groupName}</span>.
             </label>
          </div>

          <button 
            onClick={() => setSubPhase('x_tcp_6')} 
            disabled={!understood} 
            className={`w-full mt-6 py-3.5 rounded-lg font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2
              ${understood ? 'bg-[#395886] text-white hover:bg-[#2A4468]' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'}`}
          >
             Mulai Aktivitas Kelompok <ChevronRight className="w-5 h-5" />
          </button>
       </div>
    </div>
  );

  if (subStage === 'x_tcp_6') return (
    <ModuleFlow 
      key="x_tcp_6"
      lessonId={lessonId} 
      moduleId={encapsulationCase?.id || 'X.TCP.6'} 
      groupName={groupName} 
      title={encapsulationCase?.title || 'Aktivitas Enkapsulasi'} 
      concept={encapsulationCase?.concept || 'Enkapsulasi adalah proses pembungkusan data.'} 
      layers={layers5} 
      study={encapsulationCase!} 
      isEncapsulation={true} 
      onModuleDone={d => { setModule1Data(d); setSubPhase('x_tcp_7'); }} 
    />
  );

  if (subStage === 'x_tcp_7') return (
    <ModuleFlow 
      key="x_tcp_7"
      lessonId={lessonId} 
      moduleId={decapsulationCase?.id || 'X.TCP.7'} 
      groupName={groupName} 
      title={decapsulationCase?.title || 'Aktivitas Dekapsulasi'} 
      concept={decapsulationCase?.concept || 'Dekapsulasi adalah proses pembukaan data.'} 
      layers={[...layers5].reverse()} 
      study={decapsulationCase!} 
      isEncapsulation={false} 
      onModuleDone={d => { setModule2Data(d); setSubPhase('group_result'); }} 
    />
  );

  if (subStage === 'group_result') return (
    <OverallGroupResult 
      module1Data={module1Data} 
      module2Data={module2Data} 
      groupName={groupName} 
      onNext={() => setSubPhase('individual_summary')} 
    />
  );

  if (subStage === 'individual_summary') return (
    <div className={`space-y-8 ${anim.fadeUp} w-full`}>
      <ActivityCard
        icon={<Award className="w-5 h-5 text-[#10B981]" />}
        label="Langkah Akhir"
        title="Kesimpulan Individu"
        headerBg="bg-[#10B981]/5"
        headerBorder="border-[#10B981]/20"
        iconBg="bg-[#10B981]/10"
        labelCls="text-[#10B981]"
      >
        <div className="space-y-6">
          <InstructionBox accent="text-[#10B981]">
            Selesaikan tahap Learning Community dengan menuliskan pemahaman pribadimu berdasarkan hasil kolaborasi kelompok.
          </InstructionBox>
          
          <EssayBox 
            objectiveLabel={moduleId}
            prompt="Berdasarkan hasil diskusi kelompokmu, simpulkan mengapa pemahaman alur enkapsulasi dan dekapsulasi sangat penting bagi seorang teknisi jaringan dalam melakukan troubleshooting?"
            submitLabel="Submit Aktivitas"
            onSubmit={essay => {
              const finalAnswer = { module1Data, module2Data, finalConclusion: essay };
              void tracker.complete(finalAnswer, { finalAnswer });
              onComplete(finalAnswer);
            }}
            minChars={50}
          />
        </div>
      </ActivityCard>
    </div>
  );

  return null;
}
