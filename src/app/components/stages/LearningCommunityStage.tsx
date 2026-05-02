import { useState, useRef, useEffect, useMemo } from 'react';
import {
  ChevronRight, CheckCircle, XCircle, Users, Link as LinkIcon, FileSearch,
  MessageSquare, Info, RotateCcw, AlertCircle, ThumbsUp, ArrowUpDown, GripVertical,
  Zap, Database, Cpu, Cable, Network, ShieldCheck, PlayCircle, Eye, ArrowRight,
  Vote, Award, Sparkles, Monitor
} from 'lucide-react';
import { getCurrentUser } from '../../utils/auth';
import { getLessonProgress, saveStageAttempt } from '../../utils/progress';
import { supabase } from '../../utils/supabase';

// -- Types ----------------------------------------------------------------------

interface GroupDiscussion {
  id: string;
  lesson_id: string;
  module_id: string;
  group_name: string;
  user_id: string;
  user_name: string;
  argument: string;
  choice_id?: string;
  choice_text?: string;
  votes: string[]; // array of user IDs
  created_at: string;
}

interface CaseStudy {
  id: string;
  title: string;
  description: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  correctFeedback: string;
}

interface LearningCommunityStageProps {
  lessonId: string;
  stageIndex: number;
  moduleId: string; // e.g., 'X.TCP.6'
  groupName?: string;
  onComplete: (answer: any) => void;
  isCompleted?: boolean;
}

// -- Animation variants ---------------------------------------------------------
const anim = {
  fadeIn: 'animate-in fade-in duration-500',
  fadeUp: 'animate-in fade-in slide-in-from-bottom-4 duration-500',
  zoomIn: 'animate-in fade-in zoom-in-95 duration-500',
};

// -- Module Phase 1: Concept ----------------------------------------------------

function ConceptPhase({
  title, concept, layers, isEncapsulation, onNext,
}: {
  title: string; concept: string; layers: any[]; isEncapsulation: boolean; onNext: () => void;
}) {
  return (
    <div className={`space-y-5 ${anim.fadeUp}`}>
      <div className="relative overflow-hidden rounded-2xl border-2 border-[#628ECB]/20 bg-white p-5 shadow-sm">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#628ECB] mb-1.5">Konsep Dasar</p>
        <h3 className="text-base font-bold text-[#395886] mb-2">{title}</h3>
        <p className="text-sm leading-relaxed text-[#395886]/75 relative z-10">{concept}</p>
      </div>

      <div className="bg-white rounded-[2rem] border-2 border-[#D5DEEF] p-8 shadow-sm">
        <div className="flex flex-col items-center gap-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40">Visualisasi Alur Data</p>
          <div className="flex flex-col gap-2 w-full max-w-sm">
            {layers.map((layer, idx) => (
              <div key={idx} className={`flex items-center gap-3 p-4 rounded-2xl border-2 border-[#D5DEEF] bg-[#F8FAFD] transition-all`}>
                <div className="h-8 w-8 rounded-lg bg-[#395886] text-white flex items-center justify-center font-black text-xs">{isEncapsulation ? idx + 1 : layers.length - idx}</div>
                <span className="text-sm font-bold text-[#395886]">{layer}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className={`h-12 w-1 w-1 bg-gradient-to-b ${isEncapsulation ? 'from-[#395886] to-[#10B981]' : 'from-[#10B981] to-[#395886]'} rounded-full`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#10B981]">{isEncapsulation ? 'Proses Membungkus' : 'Proses Membuka'}</span>
          </div>
        </div>
      </div>

      <button onClick={onNext} className="w-full py-4 rounded-2xl bg-[#395886] text-white font-black text-sm hover:bg-[#2A4468] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
        Pahami Studi Kasus <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// -- Module Phase 2: Case Study -------------------------------------------------

function CasePhase({ study, onNext }: { study: CaseStudy; onNext: (choiceId: string, choiceText: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className={`space-y-6 ${anim.zoomIn}`}>
      <div className="bg-white rounded-[2rem] border-2 border-[#F59E0B]/20 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B]"><FileSearch className="w-6 h-6" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B]">Studi Kasus Kelompok</p>
            <h3 className="text-base font-bold text-[#395886]">{study.title}</h3>
          </div>
        </div>
        <p className="text-sm text-[#395886]/80 leading-relaxed font-medium mb-8 bg-[#FFFBEB] p-5 rounded-2xl border border-[#F59E0B]/10 italic">"{study.description}"</p>
        <div className="grid gap-3">
          {study.options.map(opt => (
            <button key={opt.id} onClick={() => setSelected(opt.id)} className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${selected === opt.id ? 'border-[#F59E0B] bg-[#FFFBEB] shadow-md' : 'border-[#D5DEEF] bg-white hover:border-[#F59E0B]/30'}`}>
              <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${selected === opt.id ? 'border-[#F59E0B]' : 'border-[#D5DEEF]'}`}>{selected === opt.id && <div className="h-2 w-2 rounded-full bg-[#F59E0B]" />}</div>
              <span className={`text-xs font-bold ${selected === opt.id ? 'text-[#395886]' : 'text-[#395886]/60'}`}>{opt.text}</span>
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => selected && onNext(selected, study.options.find(o => o.id === selected)!.text)} disabled={!selected} className="w-full py-4 rounded-2xl bg-[#F59E0B] text-white font-black text-sm shadow-xl disabled:bg-[#D5DEEF] disabled:shadow-none transition-all active:scale-95">Masuk ke Ruang Diskusi</button>
    </div>
  );
}

// -- Module Phase 3: Discussion -------------------------------------------------

function DiscussionPhase({
  lessonId, moduleId, groupName, initialChoice, onNext,
}: {
  lessonId: string; moduleId: string; groupName: string; initialChoice: { id: string; text: string }; onNext: () => void;
}) {
  const user = getCurrentUser();
  const [argument, setArgument] = useState('');
  const [discussions, setDiscussions] = useState<GroupDiscussion[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    fetchDiscussions();
    const channel = supabase.channel(`discussion-${groupName}-${moduleId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_discussions', filter: `group_name=eq.${groupName}` }, () => fetchDiscussions())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [groupName, moduleId]);

  const fetchDiscussions = async () => {
    const { data } = await supabase.from('group_discussions').select('*').eq('lesson_id', lessonId).eq('module_id', moduleId).eq('group_name', groupName).order('created_at', { ascending: true });
    if (data) {
      setDiscussions(data);
      if (data.some(d => d.user_id === user!.id)) setHasSubmitted(true);
    }
  };

  const submitArgument = async () => {
    if (argument.trim().length < 10) return;
    const { error } = await supabase.from('group_discussions').insert({
      lesson_id: lessonId, module_id: moduleId, group_name: groupName, user_id: user!.id, user_name: user!.name, argument: argument.trim(), choice_id: initialChoice.id, choice_text: initialChoice.text, votes: []
    });
    if (!error) { setArgument(''); setHasSubmitted(true); fetchDiscussions(); }
  };

  const handleVote = async (discId: string) => {
    const disc = discussions.find(d => d.id === discId);
    if (!disc) return;
    const newVotes = disc.votes.includes(user!.id) ? disc.votes.filter(id => id !== user!.id) : [...disc.votes, user!.id];
    await supabase.from('group_discussions').update({ votes: newVotes }).eq('id', discId);
  };

  return (
    <div className={`space-y-6 ${anim.fadeUp}`}>
      <div className="bg-white rounded-[2rem] border-2 border-[#10B981]/20 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981]"><MessageSquare className="w-6 h-6" /></div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#10B981]">Ruang Diskusi - {groupName}</p>
            <h3 className="text-sm font-bold text-[#395886]">Berbagi Argumen dan Voting</h3>
          </div>
        </div>

        {!hasSubmitted ? (
          <div className="space-y-4 mb-10 bg-[#F0FDF4] p-6 rounded-[1.5rem] border border-[#10B981]/10">
            <p className="text-xs font-bold text-[#065F46]">Tulis argumenmu mengapa memilih jawaban tersebut:</p>
            <textarea value={argument} onChange={e => setArgument(e.target.value)} rows={3} className="w-full p-4 rounded-xl border-2 border-[#D5DEEF] text-sm focus:border-[#10B981] outline-none" placeholder="Contoh: Saya memilih ini karena pada layer..." />
            <button onClick={submitArgument} disabled={argument.trim().length < 10} className="w-full py-3 rounded-xl bg-[#10B981] text-white font-black text-sm shadow-md disabled:bg-[#D5DEEF]">Kirim Argumen Saya</button>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40 px-2">Daftar Argumen Anggota</p>
            <div className="grid gap-4">
              {discussions.map(disc => (
                <div key={disc.id} className={`p-5 rounded-2xl border-2 transition-all ${disc.user_id === user!.id ? 'border-[#10B981] bg-[#F0FDF4]' : 'border-[#D5DEEF] bg-[#F8FAFF]'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-lg bg-[#395886] text-white flex items-center justify-center text-[10px] font-black">{disc.user_name.substring(0,2).toUpperCase()}</div>
                       <span className="text-xs font-black text-[#395886]">{disc.user_name} {disc.user_id === user!.id && '(Kamu)'}</span>
                    </div>
                    <button onClick={() => handleVote(disc.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all ${disc.votes.includes(user!.id) ? 'bg-[#10B981] text-white border-[#10B981]' : 'bg-white text-[#395886]/40 border-[#D5DEEF] hover:border-[#10B981]'}`}>
                       <ThumbsUp className="w-3.5 h-3.5" /> <span className="text-[10px] font-black">{disc.votes.length} Vote</span>
                    </button>
                  </div>
                  <p className="text-xs font-bold text-[#395886]/70 leading-relaxed italic">"{disc.argument}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {hasSubmitted && <button onClick={onNext} className="w-full py-4 rounded-2xl bg-[#395886] text-white font-black text-sm shadow-xl active:scale-95">Lihat Hasil Voting Kelompok</button>}
    </div>
  );
}

// -- Module Phase 4: Result -----------------------------------------------------

function ResultPhase({ discussions, onDone }: { discussions: GroupDiscussion[]; onDone: () => void }) {
  const bestArgument = discussions[0];
  if (!bestArgument) return null;
  return (
    <div className={`space-y-6 ${anim.zoomIn}`}>
      <div className="bg-white rounded-[2.5rem] border-2 border-[#D5DEEF] shadow-xl overflow-hidden">
        <div className="px-8 py-6 bg-gradient-to-br from-[#395886] to-[#628ECB] text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-lg ring-1 ring-white/30">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-1">Hasil Voting Kelompok</p>
              <h3 className="text-xl font-black tracking-tight">Konsensus Jawaban Terbaik</h3>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-4">
          <p className="text-sm font-medium text-[#395886]/60 leading-relaxed mb-4">
            Berdasarkan hasil voting, berikut adalah urutan argumen anggota kelompok dari yang paling relevan secara teknis.
          </p>

          <div className="space-y-4">
            {discussions.map((disc, idx) => (
              <div
                key={disc.id}
                className={`p-5 rounded-[1.5rem] border-2 transition-all duration-300 ${
                  idx === 0
                    ? 'border-[#F59E0B] bg-[#FFFBEB] shadow-md scale-[1.01]'
                    : 'border-[#D5DEEF] bg-[#F8FAFF]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-md ${idx === 0 ? 'bg-[#F59E0B]' : 'bg-[#628ECB]'}`}>
                      {disc.user_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#395886]">{disc.user_name}</p>
                      <div className="flex items-center gap-1.5">
                        <Vote className={`w-3.5 h-3.5 ${idx === 0 ? 'text-[#F59E0B]' : 'text-[#628ECB]'}`} />
                        <span className={`text-[10px] font-black uppercase ${idx === 0 ? 'text-[#F59E0B]' : 'text-[#628ECB]'}`}>{disc.votes.length} Suara</span>
                      </div>
                    </div>
                  </div>
                  {idx === 0 && (
                    <div className="flex items-center gap-1.5 bg-[#F59E0B] text-white px-3 py-1 rounded-full shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Pilihan Utama</span>
                    </div>
                  )}
                </div>
                <div className="bg-white/60 p-4 rounded-xl border border-current/5 italic text-sm text-[#395886] leading-relaxed font-medium">
                  "{disc.argument}"
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-5 rounded-2xl bg-[#F0FDF4] border-2 border-[#10B981]/20 flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-[#10B981]" />
            </div>
            <div>
              <p className="text-xs font-black text-[#065F46] uppercase tracking-widest mb-1">Panduan Belajar</p>
              <p className="text-[13px] font-bold text-[#065F46]/80 leading-relaxed">
                Pelajari argumen <span className="text-[#F59E0B]">Pilihan Utama</span> sebagai referensi pemahaman kelompokmu. Kamu bisa berdiskusi lebih lanjut secara luring untuk memperdalam konsep ini.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onDone}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#395886] text-white font-black text-sm hover:bg-[#2A4468] shadow-xl shadow-[#395886]/20 transition-all active:scale-95 group"
      >
        Lanjutkan Aktivitas Berikutnya
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

// -- Module Overall Result ------------------------------------------------------

function OverallResult({ lessonId, groupName, onComplete }: { lessonId: string; groupName: string; onComplete: (essay: string) => void }) {
  const [essay, setEssay] = useState('');
  return (
    <div className={`space-y-8 ${anim.fadeUp}`}>
      <div className="bg-white rounded-[2rem] border-2 border-[#D5DEEF] p-8 shadow-sm text-center">
         <div className="w-20 h-20 rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#10B981] mx-auto mb-6"><Award className="w-10 h-10" /></div>
         <h3 className="text-2xl font-black text-[#395886] mb-2 uppercase tracking-tight">Hasil Keseluruhan Kelompok</h3>
         <p className="text-sm font-bold text-[#395886]/40 leading-relaxed mb-10">Berikut adalah rangkuman perjalanan kelompok <span className="text-[#628ECB]">{groupName}</span> dalam menganalisis alur data TCP/IP.</p>
         
         <div className="grid sm:grid-cols-2 gap-4 text-left mb-10">
            <div className="p-5 rounded-2xl bg-[#F0FDF4] border border-[#10B981]/20">
               <p className="text-[10px] font-black text-[#10B981] uppercase mb-1">Misi Enkapsulasi</p>
               <p className="text-xs font-bold text-[#065F46]/80">Berhasil memetakan pembungkusan data dari layer atas ke bawah.</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#EEF2FF] border border-[#628ECB]/20">
               <p className="text-[10px] font-black text-[#628ECB] uppercase mb-1">Misi Dekapsulasi</p>
               <p className="text-xs font-bold text-[#395886]/80">Berhasil memetakan pembukaan data di sisi penerima secara logis.</p>
            </div>
         </div>

         <div className="space-y-4 text-left">
            <label className="flex items-center gap-2 text-xs font-black text-[#628ECB] uppercase tracking-widest ml-1"><PenLine className="w-4 h-4" /> Kesimpulan Akhir Individu</label>
            <textarea value={essay} onChange={e => setEssay(e.target.value)} rows={4} className="w-full p-5 rounded-[1.5rem] border-2 border-[#D5DEEF] text-sm focus:border-[#628ECB] outline-none bg-[#F8FAFD]" placeholder="Tuliskan kesimpulan pribadimu tentang kolaborasi hari ini..." />
         </div>
         
         <button onClick={() => onComplete(essay)} disabled={essay.length < 30} className="w-full mt-8 py-4 rounded-2xl bg-[#10B981] text-white font-black text-sm shadow-xl disabled:bg-[#D5DEEF] transition-all">Selesaikan Tahap Learning Community</button>
      </div>
    </div>
  );
}

// -- Generic Module Flow Component ----------------------------------------------

function ModuleFlow({ 
  lessonId, moduleId, groupName, title, concept, layers, study, isEncapsulation, onModuleDone 
}: { 
  lessonId: string; moduleId: string; groupName: string; title: string; concept: string; layers: string[]; study: CaseStudy; isEncapsulation: boolean; onModuleDone: (data: any) => void 
}) {
  const [phase, setPhase] = useState<'concept' | 'case' | 'discussion' | 'result'>('concept');
  const [initialChoice, setInitialChoice] = useState<{ id: string; text: string } | null>(null);
  const [discussions, setDiscussions] = useState<GroupDiscussion[]>([]);

  const fetchResults = async () => {
    const { data } = await supabase.from('group_discussions').select('*').eq('lesson_id', lessonId).eq('module_id', moduleId).eq('group_name', groupName).order('votes', { ascending: false });
    if (data) setDiscussions(data);
  };

  if (phase === 'concept') return <ConceptPhase title={title} concept={concept} layers={layers} isEncapsulation={isEncapsulation} onNext={() => setPhase('case')} />;
  if (phase === 'case') return <CasePhase study={study} onNext={(id, text) => { setInitialChoice({ id, text }); setPhase('discussion'); }} />;
  if (phase === 'discussion') return <DiscussionPhase lessonId={lessonId} moduleId={moduleId} groupName={groupName} initialChoice={initialChoice!} onNext={() => { fetchResults(); setPhase('result'); }} />;
  if (phase === 'result') return <ResultPhase discussions={discussions} onDone={() => onModuleDone({ discussions, choice: initialChoice })} />;
  return null;
}

// -- Main LearningCommunityStage ------------------------------------------------

export function LearningCommunityStage({ lessonId, stageIndex, moduleId, groupName, onComplete, isCompleted }: LearningCommunityStageProps) {
  const user = getCurrentUser();
  const [subStage, setSubPhase] = useState<'init' | 'module1' | 'module2' | 'summary'>(isCompleted ? 'summary' : 'init');
  const [module1Data, setModule1Data] = useState<any>(null);
  const [module2Data, setModule2Data] = useState<any>(null);
  const [understood, setUnderstood] = useState(false);

  // Lesson 1 Case Data
  const encapStudy: CaseStudy = { id: 'cs1', title: 'Misi Pengiriman Pesan', description: 'Kamu sedang berada di PC A dan ingin mengirim pesan "Halo Dunia". Langkah manakah yang harus kamu ambil terlebih dahulu menurut aturan Enkapsulasi?', options: [{ id: 'o1', text: 'Menempelkan IP Address PC B', isCorrect: false }, { id: 'o2', text: 'Membungkus data dengan TCP Header', isCorrect: true }, { id: 'o3', text: 'Mengirimkan bit melalui kabel', isCorrect: false }], correctFeedback: 'TCP Header (Transport) adalah langkah pertama setelah data dibuat di Application.' };
  const decapStudy: CaseStudy = { id: 'cs2', title: 'Misi Penerimaan Pesan', description: 'Data telah sampai di PC B. Sebagai protokol penerima, langkah manakah yang harus dilakukan paling akhir sebelum pesan dibaca?', options: [{ id: 'o1', text: 'Membuka bungkusan MAC Frame', isCorrect: false }, { id: 'o2', text: 'Memverifikasi IP Address', isCorrect: false }, { id: 'o3', text: 'Membuka tumpukan TCP Header', isCorrect: true }], correctFeedback: 'TCP Header adalah lapisan terakhir yang dibuka sebelum data kembali ke Application.' };

  if (!groupName) return (
    <div className="max-w-4xl mx-auto p-12 text-center bg-white rounded-[2rem] border-2 border-dashed border-[#D5DEEF]">
       <Users className="w-12 h-12 text-[#D5DEEF] mx-auto mb-4" />
       <p className="text-sm font-bold text-[#395886]/40 italic">Silakan pilih kelompok terlebih dahulu di Dashboard untuk memulai aktivitas ini.</p>
    </div>
  );

  if (subStage === 'init') return (
    <div className={`max-w-4xl mx-auto space-y-6 ${anim.fadeUp}`}>
       <div className="bg-white rounded-[2rem] border-2 border-[#F59E0B]/20 p-10 shadow-sm text-center">
          <div className="h-16 w-16 rounded-2xl bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B] mx-auto mb-6"><PlayCircle className="w-8 h-8" /></div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#F59E0B]">Tahap Awal - Simulasi</p>
          <h3 className="text-2xl font-black text-[#395886] mb-4">Mari Berkolaborasi!</h3>
          <p className="text-sm font-medium text-[#395886]/60 leading-relaxed mb-8 max-w-md mx-auto">Dalam tahap ini, kamu akan bekerja sama dengan rekan kelompok <span className="text-[#F59E0B] font-black">{groupName}</span> untuk memecahkan studi kasus alur data.</p>
          
          <div className="bg-[#F8FAFD] p-6 rounded-2xl border-2 border-[#D5DEEF] mb-8 flex items-center gap-4 text-left">
             <input type="checkbox" id="understand" checked={understood} onChange={e => setUnderstood(e.target.checked)} className="h-5 w-5 accent-[#10B981]" />
             <label htmlFor="understand" className="text-xs font-bold text-[#395886] cursor-pointer">Saya telah memahami instruksi dan siap berdiskusi secara real-time dengan kelompok.</label>
          </div>

          <button onClick={() => setSubPhase('module1')} disabled={!understood} className="w-full py-4 rounded-2xl bg-[#395886] text-white font-black text-sm shadow-xl disabled:bg-[#D5DEEF] active:scale-95 transition-all">Mulai Aktivitas X.TCP.6</button>
       </div>
    </div>
  );

  if (subStage === 'module1') return <ModuleFlow lessonId={lessonId} moduleId="X.TCP.6" groupName={groupName} title="Proses Enkapsulasi" concept="Enkapsulasi adalah proses pembungkusan data dengan informasi kontrol (header) dari lapisan atas ke bawah." layers={['Application Data', 'TCP Segment', 'IP Packet', 'MAC Frame']} study={encapStudy} isEncapsulation={true} onModuleDone={d => { setModule1Data(d); setSubPhase('module2'); }} />;
  if (subStage === 'module2') return <ModuleFlow lessonId={lessonId} moduleId="X.TCP.7" groupName={groupName} title="Proses Dekapsulasi" concept="Dekapsulasi adalah kebalikan dari enkapsulasi, di mana header dilepas satu per satu dari lapisan bawah ke atas." layers={['MAC Frame', 'IP Packet', 'TCP Segment', 'Application Data']} study={decapStudy} isEncapsulation={false} onModuleDone={d => { setModule2Data(d); setSubPhase('summary'); }} />;
  if (subStage === 'summary') return <OverallResult lessonId={lessonId} groupName={groupName} onComplete={essay => onComplete({ module1Data, module2Data, finalConclusion: essay })} />;

  return null;
}
