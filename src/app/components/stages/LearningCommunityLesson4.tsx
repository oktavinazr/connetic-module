import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CheckCircle, XCircle, Info, ChevronRight, RotateCcw, AlertCircle,
  MessageSquare, Users, FileSearch, ThumbsUp, Award, Clock, Sparkles,
  Database, PenLine, ShieldCheck, PlayCircle, ArrowUpDown, BookOpen,
} from 'lucide-react';
import { useActivityTracker } from '../../hooks/useActivityTracker';
import { getCurrentUser } from '../../utils/auth';
import {
  upsertGroupDiscussion, getGroupDiscussions, toggleGroupDiscussionVote,
  getGroupMembers, type GroupDiscussion,
} from '../../utils/groups';
import { supabase } from '../../utils/supabase';
import {
  StepTracker, ActivityCard, InstructionBox, EssayBox, ATPConclusionBox,
  anim, SectionDivider,
} from './StageKit';

// =============================================================================
// TYPES
// =============================================================================

type L4Phase = 'intro' | 'module_a' | 'module_b' | 'group_result' | 'conclusion';

interface CaseOption { id: string; text: string; logic?: string; isCorrect?: boolean; }
interface CaseData {
  id: string; title: string; concept: string; scenario: string;
  question: string; options: CaseOption[];
}

interface Props {
  lessonId: string;
  stageIndex: number;
  groupName?: string;
  isCompleted?: boolean;
  encapsulationCase?: CaseData;
  decapsulationCase?: CaseData;
  atpBehavior?: string;
  onComplete: (answer: any) => void;
  onTrackerPhase?: (phase: 'consistency' | 'arguing' | 'conclusion') => void;
}

// =============================================================================
// MEMBER STATUS LIST
// =============================================================================

function MemberList({
  members, submissions,
}: {
  members: { user_id: string; user_name: string }[];
  submissions: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-2">
      {members.map((m) => {
        const done = submissions.includes(m.user_id);
        return (
          <div
            key={m.user_id}
            className={
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border-2 transition-all ' +
              (done ? 'border-[#10B981] bg-[#F0FDF4]' : 'border-[#D5DEEF]')
            }
          >
            <div
              className={
                'w-2 h-2 rounded-full ' +
                (done ? 'bg-[#10B981]' : 'bg-[#D5DEEF] animate-pulse')
              }
            />
            <span
              className={
                'text-xs font-black uppercase tracking-tight ' +
                (done ? 'text-[#065F46]' : 'text-[#395886]')
              }
            >
              {m.user_name}
            </span>
            {done && <CheckCircle className="w-3 h-3 text-[#10B981]" />}
          </div>
        );
      })}
      {members.length === 0 && (
        <p className="text-xs font-bold text-[#395886]/30 uppercase italic">
          Menunggu anggota...
        </p>
      )}
    </div>
  );
}

// =============================================================================
// CASE + ARGUMENT PHASE
// =============================================================================

function CaseArguePhase({
  caseData, lessonId, moduleId, groupName, isSubmitted, submitError, onSubmit,
}: {
  caseData: CaseData;
  lessonId: string;
  moduleId: string;
  groupName: string;
  isSubmitted: boolean;
  submitError: string | null;
  onSubmit: (choiceId: string, choiceText: string, arg: string) => Promise<void>;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [argument, setArgument] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const MIN_WORDS = 10;
  const wordCount = argument.trim() ? argument.trim().split(/\s+/).length : 0;
  const ready = selected !== null && wordCount >= MIN_WORDS;

  return (
    <div className={'space-y-6 ' + anim.zoomIn}>
      <ActivityCard
        icon={<FileSearch className="w-5 h-5 text-[#F59E0B]" />}
        label="Audit Peer Review EUI-64"
        title={caseData.title}
        headerBg="bg-[#F59E0B]/5"
        headerBorder="border-[#F59E0B]/20"
        iconBg="bg-[#F59E0B]/10"
        labelCls="text-[#F59E0B]"
      >
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#F59E0B]/20">
            <p className="text-xs font-black uppercase tracking-widest text-[#F59E0B] mb-2">
              Konsep yang Diaudit
            </p>
            <p className="text-sm text-[#395886]/80 leading-relaxed">{caseData.concept}</p>
          </div>

          <div className="rounded-xl bg-slate-900 p-4 overflow-x-auto">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Hasil Kerja Siswa
            </p>
            <p className="text-sm text-slate-200 leading-relaxed font-mono whitespace-pre-line">
              {caseData.scenario}
            </p>
          </div>

          <p className="text-sm font-bold text-[#395886] px-1">{caseData.question}</p>

          <div className="grid gap-3">
            {caseData.options.map((opt) => (
              <button
                key={opt.id}
                disabled={isSubmitted}
                onClick={() => setSelected(opt.id)}
                className={
                  'p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ' +
                  (selected === opt.id
                    ? 'border-[#F59E0B] bg-[#FFFBEB] shadow-sm scale-[1.01]'
                    : 'border-[#D5DEEF] bg-white hover:border-[#F59E0B]/30') +
                  (isSubmitted && selected !== opt.id ? ' opacity-50' : '')
                }
              >
                <div
                  className={
                    'h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ' +
                    (selected === opt.id ? 'border-[#F59E0B]' : 'border-[#D5DEEF]')
                  }
                >
                  {selected === opt.id && (
                    <div className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                  )}
                </div>
                <span
                  className={
                    'text-sm font-medium ' +
                    (selected === opt.id ? 'text-[#395886]' : 'text-[#395886]/60')
                  }
                >
                  {opt.text}
                </span>
              </button>
            ))}
          </div>

          {selected !== null && (
            <div className={'space-y-3 p-5 rounded-2xl bg-[#F8FAFD] border-2 border-[#D5DEEF]/60 ' + anim.fadeUp}>
              <div className="flex items-center gap-2">
                <PenLine className="w-4 h-4 text-[#395886]/60" />
                <p className="text-xs font-black uppercase tracking-widest text-[#395886]/60">
                  Argumen Auditmu
                </p>
              </div>
              <textarea
                value={argument}
                readOnly={isSubmitted}
                onChange={(e) => !isSubmitted && setArgument(e.target.value)}
                rows={3}
                className={
                  'w-full p-4 border-2 border-[#D5DEEF] rounded-xl text-sm text-[#395886] ' +
                  'focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/5 outline-none ' +
                  'transition-all resize-none ' +
                  (isSubmitted ? 'bg-[#F1F5F9] border-dashed cursor-not-allowed' : 'bg-white')
                }
                placeholder="Jelaskan langkah mana yang salah dan dampak teknisnya..."
              />
              <p className={'text-xs font-bold ' + (wordCount >= MIN_WORDS ? 'text-[#10B981]' : 'text-[#395886]/30')}>
                {wordCount} / {MIN_WORDS} kata minimal
              </p>
            </div>
          )}

          {isSubmitted && selected === null && (
            <div className={'p-4 rounded-xl bg-[#10B981]/10 border-2 border-[#10B981]/20 flex items-center gap-3 ' + anim.fadeUp}>
              <CheckCircle className="w-5 h-5 text-[#10B981] shrink-0" />
              <p className="text-sm font-bold text-[#065F46]">
                Argumenmu sudah terkirim. Menunggu anggota lain...
              </p>
            </div>
          )}

          {submitError && (
            <div className={'p-4 rounded-xl border-2 border-red-200 bg-red-50 flex items-start gap-3 ' + anim.fadeUp}>
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-red-800">{submitError}</p>
            </div>
          )}
        </div>
      </ActivityCard>

      {!isSubmitted ? (
        <button
          onClick={async () => {
            if (ready) {
              setSubmitting(true);
              const choiceText = caseData.options.find((o) => o.id === selected)!.text;
              await onSubmit(selected!, choiceText, argument.trim());
              setSubmitting(false);
            }
          }}
          disabled={!ready || submitting}
          className={
            'w-full py-5 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ' +
            (ready ? 'bg-[#395886] text-white hover:bg-[#2A4468]' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed')
          }
        >
          {submitting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
          {submitting ? 'Mengirim...' : 'Submit Audit ke Kelompok'}
        </button>
      ) : (
        <div className={'p-4 rounded-2xl bg-[#10B981]/10 border-2 border-[#10B981]/20 flex items-center justify-center gap-3 ' + anim.fadeUp}>
          <Sparkles className="w-5 h-5 text-[#10B981]" />
          <p className="text-sm font-black text-[#065F46] uppercase tracking-tight">
            Menuju Papan Kolaborasi...
          </p>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// COLLABORATIVE BOARD (real-time Supabase)
// =============================================================================

function CollaborativeBoard({
  lessonId, moduleId, groupName, onNext,
}: {
  lessonId: string;
  moduleId: string;
  groupName: string;
  onNext: () => void;
}) {
  const user = getCurrentUser();
  const [discussions, setDiscussions] = useState<GroupDiscussion[]>([]);
  const [members, setMembers] = useState<{ user_id: string; user_name: string }[]>([]);

  const submissions = useMemo(() => discussions.map((d) => d.user_id), [discussions]);
  const missingMembers = useMemo(
    () => members.filter((m) => !submissions.includes(m.user_id)).map((m) => m.user_name),
    [members, submissions],
  );
  const allSubmitted = members.length > 0 && missingMembers.length === 0;

  const fetchData = useCallback(async () => {
    const [d, m] = await Promise.all([
      getGroupDiscussions(lessonId, moduleId, groupName),
      getGroupMembers(groupName),
    ]);
    setDiscussions(d);
    setMembers(m);
  }, [lessonId, moduleId, groupName]);

  useEffect(() => {
    void fetchData();
    const channel = supabase
      .channel('l4-board-' + moduleId + '-' + groupName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_discussions',
          filter:
            'lesson_id=eq.' + lessonId +
            '&module_id=eq.' + moduleId +
            '&group_name=eq.' + groupName,
        },
        () => void fetchData(),
      )
      .subscribe();
    const iv = setInterval(() => void fetchData(), 5000);
    return () => {
      void supabase.removeChannel(channel);
      clearInterval(iv);
    };
  }, [lessonId, moduleId, groupName, fetchData]);

  const handleVote = async (discId: string) => {
    if (!allSubmitted) return;
    await toggleGroupDiscussionVote(discId, user!.id);
    await fetchData();
  };

  return (
    <div className={'space-y-6 ' + anim.fadeUp}>
      <ActivityCard
        icon={<MessageSquare className="w-5 h-5 text-[#10B981]" />}
        label="Papan Kolaborasi Kelompok"
        title={'Diskusi Bersama — ' + groupName}
        headerBg="bg-[#10B981]/5"
        headerBorder="border-[#10B981]/20"
        iconBg="bg-[#10B981]/10"
        labelCls="text-[#10B981]"
      >
        <div className="space-y-6">
          <MemberList members={members} submissions={submissions} />

          {!allSubmitted && members.length > 0 && (
            <div className="grid gap-2">
              {members.map((m) => {
                const done = submissions.includes(m.user_id);
                if (done) return null;
                const isOwn = m.user_id === user!.id;
                return (
                  <div
                    key={m.user_id}
                    className={
                      'flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed ' +
                      (isOwn ? 'border-[#F59E0B]/40 bg-[#FFFBEB]' : 'border-[#D5DEEF] bg-[#F8FAFD]')
                    }
                  >
                    <Clock
                      className={
                        'w-4 h-4 animate-pulse ' +
                        (isOwn ? 'text-[#F59E0B]' : 'text-[#395886]/30')
                      }
                    />
                    <span
                      className={'text-sm font-bold ' + (isOwn ? 'text-[#F59E0B]' : 'text-[#395886]/40')}
                    >
                      Menunggu <span className="font-black">{m.user_name}</span>...
                      {isOwn && (
                        <span className="ml-1 text-xs font-bold text-[#F59E0B]/60">
                          (kamu belum submit)
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <SectionDivider label="Papan Diskusi" icon={<MessageSquare className="w-3 h-3" />} />

          <div className="flex items-center justify-center">
            {!allSubmitted ? (
              <div className="px-5 py-2.5 rounded-2xl bg-amber-50 text-amber-600 text-xs font-black uppercase border border-amber-100 flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                Menunggu semua anggota submit audit...
              </div>
            ) : (
              <div className="px-4 py-1.5 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-black uppercase border border-[#10B981]/20 flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5" /> Semua Submit — Voting Dibuka!
              </div>
            )}
          </div>

          <div className="grid gap-4">
            {discussions.map((disc) => {
              const isOwn = disc.user_id === user!.id;
              return (
                <div
                  key={disc.id}
                  className={
                    'p-5 rounded-2xl border-2 transition-all duration-500 ' +
                    (isOwn
                      ? 'border-[#10B981]/60 bg-[#F0FDF4] shadow-md shadow-[#10B981]/5'
                      : 'border-[#D5DEEF] bg-white hover:border-[#10B981]/20')
                  }
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={
                          'w-9 h-9 rounded-xl text-white flex items-center justify-center text-xs font-black shadow-sm ' +
                          (isOwn ? 'bg-[#10B981]' : 'bg-[#395886]')
                        }
                      >
                        {disc.user_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-[#395886]">{disc.user_name}</p>
                          {isOwn && (
                            <span className="text-xs font-black bg-[#10B981] text-white px-2 py-0.5 rounded-full uppercase">
                              Anda
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-[#395886]/40 uppercase tracking-tight">
                          Memilih: {disc.choice_text}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleVote(disc.id)}
                      disabled={!allSubmitted}
                      className={
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 transition-all active:scale-90 ' +
                        (disc.votes.includes(user!.id)
                          ? 'bg-[#10B981] text-white border-[#10B981] shadow-md shadow-[#10B981]/20'
                          : 'bg-white text-[#395886]/40 border-[#D5DEEF] hover:border-[#10B981]/50') +
                        ' disabled:opacity-50 disabled:cursor-not-allowed'
                      }
                    >
                      <ThumbsUp
                        className={'w-3.5 h-3.5 ' + (disc.votes.includes(user!.id) ? 'fill-current' : '')}
                      />
                      <span className="text-xs font-black">{disc.votes.length} Vote</span>
                    </button>
                  </div>
                  <p className="text-sm font-medium text-[#395886]/80 leading-relaxed italic bg-white/60 p-3 rounded-lg border border-current/5">
                    "{disc.argument}"
                  </p>
                </div>
              );
            })}
            {discussions.length === 0 && (
              <div className="py-16 text-center bg-[#F8FAFD] rounded-2xl border-2 border-dashed border-[#D5DEEF] text-xs font-black text-[#395886]/30 uppercase tracking-widest">
                Belum ada audit masuk...
              </div>
            )}
          </div>
        </div>
      </ActivityCard>

      {allSubmitted && (
        <button
          onClick={onNext}
          className={
            'w-full py-5 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all ' +
            'flex items-center justify-center gap-2 ' + anim.zoomIn +
            ' bg-[#395886] text-white hover:bg-[#2A4468]'
          }
        >
          Lihat Hasil Voting <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// =============================================================================
// RESULT BOARD (with tie-breaker)
// =============================================================================

function ResultBoard({
  moduleLabel, discussions, onDone,
}: {
  moduleLabel: string;
  discussions: GroupDiscussion[];
  onDone: () => void;
}) {
  const user = getCurrentUser();
  const sorted = [...discussions].sort((a, b) => b.votes.length - a.votes.length);
  const topVotes = sorted[0]?.votes.length ?? 0;
  const topArgs = sorted.filter((d) => d.votes.length === topVotes && d.votes.length > 0);
  const isTie = topArgs.length > 1;
  const [tieBroken, setTieBroken] = useState(false);
  const [tieWinnerId, setTieWinnerId] = useState<string | null>(null);

  if (sorted.length === 0) return null;

  const handleTieBreak = () => {
    const earliest = [...topArgs].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    setTieWinnerId(earliest[0].id);
    setTieBroken(true);
  };

  const displayed =
    isTie && !tieBroken
      ? topArgs
      : isTie && tieBroken
      ? [topArgs.find((a) => a.id === tieWinnerId)!]
      : [sorted[0]];

  return (
    <div className={'space-y-6 ' + anim.zoomIn}>
      <ActivityCard
        icon={<Award className="w-5 h-5 text-[#F59E0B]" />}
        label="Keputusan Audit Kelompok"
        title={'Argumen Terbaik — ' + moduleLabel}
        headerBg="bg-[#F59E0B]/5"
        headerBorder="border-[#F59E0B]/20"
        iconBg="bg-[#F59E0B]/10"
        labelCls="text-[#F59E0B]"
      >
        <div className="space-y-6">
          {isTie && !tieBroken ? (
            <>
              <InstructionBox accent="text-[#F59E0B]">
                <span className="font-black text-[#F59E0B]">Hasil Voting Setara!</span>{' '}
                Beberapa argumen mendapat vote yang sama. Gunakan tie-breaker untuk menentukan argumen utama.
              </InstructionBox>
              <div className="grid gap-3">
                {topArgs.map((disc) => (
                  <div
                    key={disc.id}
                    className="p-4 rounded-xl border-2 border-[#F59E0B]/30 bg-[#FFFBEB] shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white bg-[#F59E0B]">
                        {disc.user_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#395886]">{disc.user_name}</p>
                        <p className="text-xs font-black text-[#F59E0B]">
                          {disc.votes.length} Suara
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-[#395886] leading-relaxed italic">
                      "{disc.argument}"
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl bg-[#F8FAFD] border-2 border-dashed border-[#D5DEEF] space-y-3">
                <p className="text-xs font-black uppercase tracking-widest text-[#395886]/50 text-center">
                  Mekanisme Tie-Breaker
                </p>
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
                <div className="p-3 rounded-xl bg-[#10B981]/8 border border-[#10B981]/20 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#10B981]" />
                  <span className="text-sm font-bold text-[#065F46]">
                    Tie-breaker diterapkan: argumen tercepat dipilih
                  </span>
                </div>
              )}
              {displayed.map((best) => (
                <div
                  key={best.id}
                  className="p-5 rounded-lg border-2 border-[#F59E0B] bg-[#FFFBEB] shadow-sm relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Award className="w-20 h-20 text-[#F59E0B]" />
                  </div>
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white bg-[#F59E0B]">
                      {best.user_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#395886]">{best.user_name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <ThumbsUp className="w-3 h-3 text-[#F59E0B]" />
                        <span className="text-xs font-black text-[#F59E0B]">
                          {best.votes.length} Suara Kelompok
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-[#395886] leading-relaxed relative z-10 italic">
                    "{best.argument}"
                  </p>
                </div>
              ))}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F0FDF4] border border-[#10B981]/20">
                <CheckCircle className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                <p className="text-sm font-bold text-[#065F46]/80 leading-relaxed">
                  Argumen ini menjadi kesepakatan audit kelompok untuk kartu ini.
                </p>
              </div>
            </>
          )}
        </div>
      </ActivityCard>

      <button
        onClick={onDone}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-[#395886] text-white font-black text-sm hover:bg-[#2A4468] shadow-md transition-all active:scale-95 group"
      >
        Lanjutkan <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

// =============================================================================
// PEER REVIEW MODULE (case -> board -> result for one card)
// =============================================================================

function PeerReviewModule({
  lessonId, moduleId, groupName, caseData, label, onDone,
}: {
  lessonId: string;
  moduleId: string;
  groupName: string;
  caseData: CaseData;
  label: string;
  onDone: (data: { bestArgument: GroupDiscussion | null; discussions: GroupDiscussion[] }) => void;
}) {
  type MPhase = 'case' | 'board' | 'result';
  const [phase, setPhase] = useState<MPhase>('case');
  const [discussions, setDiscussions] = useState<GroupDiscussion[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const user = getCurrentUser();

  const STEPS = ['Analisis Kasus', 'Papan Kolaborasi', 'Hasil Audit'];
  const currentStep = phase === 'case' ? 0 : phase === 'board' ? 1 : 2;

  const handleCaseSubmit = async (choiceId: string, choiceText: string, argument: string) => {
    setSubmitError(null);
    try {
      await upsertGroupDiscussion({
        lesson_id: lessonId,
        module_id: moduleId,
        group_name: groupName,
        user_id: user!.id,
        user_name: user!.name,
        argument,
        choice_id: choiceId,
        choice_text: choiceText,
      });
      setIsSubmitted(true);
      setTimeout(() => setPhase('board'), 2000);
    } catch (err: any) {
      setSubmitError(err?.message || 'Gagal menyimpan. Silakan coba lagi.');
    }
  };

  const finalizeResult = async () => {
    const data = await getGroupDiscussions(lessonId, moduleId, groupName);
    setDiscussions(data);
    setPhase('result');
  };

  const handleResultDone = () => {
    const sorted = [...discussions].sort((a, b) => b.votes.length - a.votes.length);
    onDone({ bestArgument: sorted[0] ?? null, discussions });
  };

  return (
    <div className="w-full space-y-5">
      <div className="px-1">
        <p className="text-xs font-black uppercase tracking-widest text-[#F59E0B] mb-1.5">
          {label}
        </p>
        <StepTracker steps={STEPS} current={currentStep} />
      </div>

      {phase === 'case' && (
        <CaseArguePhase
          caseData={caseData}
          lessonId={lessonId}
          moduleId={moduleId}
          groupName={groupName}
          isSubmitted={isSubmitted}
          submitError={submitError}
          onSubmit={handleCaseSubmit}
        />
      )}
      {phase === 'board' && (
        <CollaborativeBoard
          lessonId={lessonId}
          moduleId={moduleId}
          groupName={groupName}
          onNext={finalizeResult}
        />
      )}
      {phase === 'result' && (
        <ResultBoard
          moduleLabel={label}
          discussions={discussions}
          onDone={handleResultDone}
        />
      )}
    </div>
  );
}

// =============================================================================
// GROUP RESULT PANEL
// =============================================================================

function GroupResultPanel({
  groupName, moduleAData, moduleBData, onNext,
}: {
  groupName: string;
  moduleAData: any;
  moduleBData: any;
  onNext: () => void;
}) {
  return (
    <div className={'space-y-6 ' + anim.zoomIn}>
      <ActivityCard
        icon={<Users className="w-5 h-5 text-[#628ECB]" />}
        label="Hasil Kolaborasi"
        title="Ringkasan Audit Kelompok"
        headerBg="bg-[#628ECB]/5"
        headerBorder="border-[#628ECB]/20"
        iconBg="bg-[#628ECB]/10"
        labelCls="text-[#628ECB]"
      >
        <div className="space-y-6">
          <p className="text-sm font-bold text-[#395886]/60 leading-relaxed text-center">
            Berikut kesepakatan audit terbaik kelompok{' '}
            <span className="text-[#628ECB] font-black">{groupName}</span> untuk setiap kartu.
          </p>
          <div className="grid md:grid-cols-2 gap-5 text-left">
            <div className="p-5 rounded-2xl border-2 border-[#10B981]/20 bg-[#F0FDF4]/30 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <p className="text-xs font-black text-[#10B981] uppercase tracking-widest">
                  Kartu A — Siti (Flip Bit ke-7)
                </p>
              </div>
              <p className="text-sm font-bold text-[#395886]/80 leading-relaxed italic bg-white/80 p-3.5 rounded-xl border border-[#10B981]/10">
                "{moduleAData?.bestArgument?.argument || 'Hasil belum tersedia'}"
              </p>
            </div>
            <div className="p-5 rounded-2xl border-2 border-[#628ECB]/20 bg-[#EEF4FF]/30 space-y-3">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-[#628ECB]" />
                <p className="text-xs font-black text-[#628ECB] uppercase tracking-widest">
                  Kartu B — Budi (Posisi FF:FE)
                </p>
              </div>
              <p className="text-sm font-bold text-[#395886]/80 leading-relaxed italic bg-white/80 p-3.5 rounded-xl border border-[#628ECB]/10">
                "{moduleBData?.bestArgument?.argument || 'Hasil belum tersedia'}"
              </p>
            </div>
          </div>
        </div>
      </ActivityCard>
      <button
        onClick={onNext}
        className="w-full py-3.5 rounded-lg bg-[#395886] text-white font-black text-sm shadow-md active:scale-95 transition-all hover:bg-[#2A4468] flex items-center justify-center gap-2 group"
      >
        Lanjut ke Kesimpulan <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function LearningCommunityLesson4({
  lessonId, stageIndex, groupName, isCompleted,
  encapsulationCase, decapsulationCase, atpBehavior,
  onComplete, onTrackerPhase,
}: Props) {
  useActivityTracker({ lessonId, stageIndex, stageType: 'learning-community' });

  const [phase, setPhase] = useState<L4Phase>(isCompleted ? 'conclusion' : 'intro');
  const [moduleAData, setModuleAData] = useState<any>(null);
  const [moduleBData, setModuleBData] = useState<any>(null);
  const [conclusionText, setConclusionText] = useState('');

  useEffect(() => {
    const phaseMap: Record<L4Phase, 'consistency' | 'arguing' | 'conclusion'> = {
      intro: 'consistency',
      module_a: 'arguing',
      module_b: 'arguing',
      group_result: 'arguing',
      conclusion: 'conclusion',
    };
    onTrackerPhase?.(phaseMap[phase]);
  }, [phase, onTrackerPhase]);

  if (!groupName) {
    return (
      <div className="w-full py-12 text-center bg-white rounded-lg border-2 border-dashed border-[#D5DEEF] shadow-inner">
        <div className="h-16 w-16 mx-auto mb-6 text-[#D5DEEF]">
          <Users className="w-full h-full" />
        </div>
        <h4 className="text-xl font-black text-[#395886] mb-2 uppercase tracking-tight">
          Kelompok Belum Terdeteksi
        </h4>
        <p className="text-sm font-bold text-[#395886]/40 italic max-w-sm mx-auto leading-relaxed">
          Pilih kelompokmu di{' '}
          <span className="text-[#628ECB] not-italic font-black">Dashboard</span>{' '}
          untuk memulai aktivitas kolaborasi ini.
        </p>
      </div>
    );
  }

  const OVERALL_STEPS = ['Orientasi', 'Audit Kartu A', 'Audit Kartu B', 'Hasil Kelompok', 'Kesimpulan'];
  const overallCurrent = ['intro', 'module_a', 'module_b', 'group_result', 'conclusion'].indexOf(phase);

  return (
    <div className="space-y-6 w-full">
      <StepTracker steps={OVERALL_STEPS} current={overallCurrent} />

      {/* INTRO */}
      {phase === 'intro' && (
        <div className={'space-y-6 ' + anim.fadeUp}>
          <ActivityCard
            icon={<BookOpen className="w-5 h-5 text-[#628ECB]" />}
            label="Orientasi Aktivitas"
            title="Peer Review Audit Proses EUI-64"
            headerBg="bg-[#628ECB]/5"
            headerBorder="border-[#628ECB]/20"
            iconBg="bg-[#628ECB]/10"
            labelCls="text-[#628ECB]"
          >
            <div className="space-y-5">
              <p className="text-sm font-medium text-[#395886]/80 leading-relaxed">
                Dalam aktivitas ini, kelompokmu berperan sebagai{' '}
                <span className="font-black text-[#628ECB]">tim auditor teknis</span>. Kalian akan
                mengevaluasi hasil kerja dua siswa fiktif yang mengonversi MAC Address menjadi IPv6
                Link-Local Address menggunakan standar EUI-64 — dan menemukan di mana kesalahan mereka.
              </p>
              <SectionDivider
                label="Referensi Cepat: 6 Langkah EUI-64"
                icon={<Info className="w-3 h-3" />}
              />
              <div className="grid gap-2">
                {[
                  { n: 1, text: 'Ambil MAC Address 48-bit perangkat', color: '#8B5CF6' },
                  { n: 2, text: 'Pisahkan menjadi dua bagian 24-bit: OUI dan NIC ID', color: '#628ECB' },
                  { n: 3, text: 'Sisipkan FF:FE di antara OUI dan NIC ID', color: '#10B981' },
                  { n: 4, text: 'Format ulang sebagai 4 blok 16-bit heksadesimal', color: '#F59E0B' },
                  { n: 5, text: 'Balik (flip) bit ke-7 dari oktet pertama', color: '#EF4444' },
                  { n: 6, text: 'Gabungkan dengan prefix fe80::/10', color: '#395886' },
                ].map((step) => (
                  <div
                    key={step.n}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white border-2 border-[#D5DEEF]"
                  >
                    <div
                      className="h-8 w-8 shrink-0 rounded-xl flex items-center justify-center text-white text-sm font-black"
                      style={{ backgroundColor: step.color }}
                    >
                      {step.n}
                    </div>
                    <p className="text-sm font-bold text-[#395886]">{step.text}</p>
                  </div>
                ))}
              </div>
              <InstructionBox accent="text-[#628ECB]">
                Gunakan referensi 6 langkah EUI-64 di atas untuk mengaudit kartu hasil kerja siswa fiktif.
                Temukan di langkah mana mereka melakukan kesalahan dan berikan argumen teknismu!
              </InstructionBox>
            </div>
          </ActivityCard>
          <button
            onClick={() => setPhase('module_a')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#395886] to-[#628ECB] text-white font-black text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 hover:opacity-90"
          >
            <Users className="w-4 h-4" /> Mulai Audit Kartu A — Siti{' '}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MODULE A */}
      {phase === 'module_a' && encapsulationCase && (
        <PeerReviewModule
          lessonId={lessonId}
          moduleId="X.IP.12.A"
          groupName={groupName}
          caseData={encapsulationCase}
          label="Audit Kartu A — Siti"
          onDone={(data) => {
            setModuleAData(data);
            setPhase('module_b');
          }}
        />
      )}

      {/* MODULE B */}
      {phase === 'module_b' && decapsulationCase && (
        <PeerReviewModule
          lessonId={lessonId}
          moduleId="X.IP.12.B"
          groupName={groupName}
          caseData={decapsulationCase}
          label="Audit Kartu B — Budi"
          onDone={(data) => {
            setModuleBData(data);
            setPhase('group_result');
          }}
        />
      )}

      {/* GROUP RESULT */}
      {phase === 'group_result' && (
        <GroupResultPanel
          groupName={groupName}
          moduleAData={moduleAData}
          moduleBData={moduleBData}
          onNext={() => setPhase('conclusion')}
        />
      )}

      {/* CONCLUSION */}
      {phase === 'conclusion' && (
        <div className={'space-y-6 ' + anim.fadeUp}>
          <EssayBox
            prompt="Dari kedua kartu peer review yang baru diaudit, kesalahan mana yang lebih berbahaya — lupa flip bit ke-7 atau salah posisi sisipan FF:FE? Jelaskan konsekuensi teknis dari masing-masing kesalahan dan berikan keputusan akhir Approved/Rejected untuk setiap kartu beserta intisari audit kelompokmu."
            objectiveLabel="X.IP.12"
            submitLabel="Simpan Diskusi Kelompok"
            headerLabel="Diskusi Kelompok"
            minWords={15}
            onSubmit={(text) => setConclusionText(text)}
          />
          {conclusionText && (
            <ATPConclusionBox
              atpBehavior={
                atpBehavior ??
                'mampu menganalisis setiap langkah proses EUI-64 untuk menentukan kebenaran hasil konversi alamat MAC menjadi IPv6 Link Local Address'
              }
              objectiveCode="X.IP.12"
              stageType="learning-community"
              minWords={10}
              onSubmit={(text) =>
                onComplete({ conclusionText, atpConclusion: text, moduleAData, moduleBData })
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
