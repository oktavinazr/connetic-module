import React from 'react';
import {
  CheckCircle,
  HelpCircle,
  Lightbulb,
  MonitorPlay,
  Search,
  Users,
  Video,
  FileText,
  FileSearch,
  XCircle,
  Award,
  PenLine,
  MessageSquare,
  Layers,
} from 'lucide-react';
import { type Stage } from '../../data/lessons';
import { getCurrentUser } from '../../utils/auth';

export const CTL_META = {
  constructivism: {
    label: 'Constructivism',
    icon: <Search className="w-3.5 h-3.5" />,
    bg: 'bg-[#628ECB]/10',
    text: 'text-[#628ECB]',
    border: 'border-[#628ECB]/20',
  },
  inquiry: {
    label: 'Inquiry',
    icon: <HelpCircle className="w-3.5 h-3.5" />,
    bg: 'bg-[#10B981]/10',
    text: 'text-[#10B981]',
    border: 'border-[#10B981]/20',
  },
  questioning: {
    label: 'Questioning',
    icon: <Lightbulb className="w-3.5 h-3.5" />,
    bg: 'bg-[#F59E0B]/10',
    text: 'text-[#F59E0B]',
    border: 'border-[#F59E0B]/20',
  },
  'learning-community': {
    label: 'Learning Community',
    icon: <Users className="w-3.5 h-3.5" />,
    bg: 'bg-[#8B5CF6]/10',
    text: 'text-[#8B5CF6]',
    border: 'border-[#8B5CF6]/20',
  },
  modeling: {
    label: 'Modeling',
    icon: <MonitorPlay className="w-3.5 h-3.5" />,
    bg: 'bg-[#EC4899]/10',
    text: 'text-[#EC4899]',
    border: 'border-[#EC4899]/20',
  },
  reflection: {
    label: 'Reflection',
    icon: <FileSearch className="w-3.5 h-3.5" />,
    bg: 'bg-[#6366F1]/10',
    text: 'text-[#6366F1]',
    border: 'border-[#6366F1]/20',
  },
  'authentic-assessment': {
    label: 'Authentic Assessment',
    icon: <FileText className="w-3.5 h-3.5" />,
    bg: 'bg-[#F43F5E]/10',
    text: 'text-[#F43F5E]',
    border: 'border-[#F43F5E]/20',
  },
};

export function getStageAnswerSummary(stage: Stage, answer: any): string {
  if (!answer) return '—';
  try {
    switch (stage.type) {
      case 'constructivism': {
        const a = answer as any;
        if (a.conclusion) return a.conclusion.slice(0, 40) + '...';
        if (a.essay2) return a.essay2.slice(0, 40) + '...';
        if (a.essay1) return a.essay1.slice(0, 40) + '...';
        if (a.reason) return `Pilihan + alasan tertulis`;
        return 'Selesai';
      }
      case 'inquiry': {
        const a = answer as any;
        if (a.conclusion) return a.conclusion.slice(0, 40) + '...';
        if (a.reflection2) return a.reflection2.slice(0, 40) + '...';
        if (a.reflection1) return a.reflection1.slice(0, 40) + '...';
        return 'Selesai';
      }
      case 'questioning': {
        const a = answer as any;
        if (a.conclusion) return a.conclusion.slice(0, 40) + '...';
        if (a.justification) return a.justification.slice(0, 40) + '...';
        return 'Analisis Selesai';
      }
      case 'learning-community': {
        const a = answer as any;
        if (a.finalConclusion) return a.finalConclusion.slice(0, 40) + '...';
        return 'Diskusi Selesai';
      }
      case 'reflection': {
        const a = answer as any;
        if (a.conclusionText) return a.conclusionText.slice(0, 40) + '...';
        if (a.argumentText) return a.argumentText.slice(0, 40) + '...';
        return 'Refleksi Selesai';
      }
      default:
        return 'Selesai';
    }
  } catch {
    return '—';
  }
}

// ── Shared Review Sub-components ──────────────────────────────────────────────

function ReviewCard({
  title, icon, children,
  accentColor = 'text-[#395886]',
  borderColor = 'border-[#D5DEEF]',
  bgColor = 'bg-[#F8FAFF]/40',
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accentColor?: string;
  borderColor?: string;
  bgColor?: string;
}) {
  return (
    <div className={`rounded-2xl border-2 ${borderColor} bg-white overflow-hidden`}>
      <div className={`flex items-center gap-2.5 px-4 py-3 border-b ${borderColor} ${bgColor}`}>
        <span className={accentColor}>{icon}</span>
        <h5 className="text-[10px] font-black uppercase tracking-widest text-[#395886]">{title}</h5>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function EssayDisplay({ text }: { text?: string }) {
  if (!text) return <p className="text-xs text-[#395886]/40 italic">Tidak ada jawaban tertulis.</p>;
  return (
    <div className="bg-[#F8FAFF] rounded-xl p-3.5 border border-[#D5DEEF]/60">
      <p className="text-sm text-[#395886] leading-relaxed">"{text}"</p>
    </div>
  );
}

function ActivityBadge({ label, done = true }: { label: string; done?: boolean }) {
  return (
    <div className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold ${done ? 'bg-[#F0FDF9] border-[#10B981]/20 text-[#065F46]' : 'bg-[#F8FAFF] border-[#D5DEEF] text-[#395886]/50'}`}>
      {done
        ? <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
        : <div className="w-3.5 h-3.5 rounded-full border-2 border-[#D5DEEF] shrink-0" />}
      {label}
    </div>
  );
}

function MissingData() {
  return <p className="text-xs text-[#395886]/40 italic text-center py-4">Belum ada data aktivitas.</p>;
}

// ── Stage-specific Review Components ─────────────────────────────────────────

function ConstructivismReview({ answer, snap }: { answer: any; snap?: Record<string, any> }) {
  const fa = snap?.finalAnswer ?? {};
  const essay1 = fa.essay1 ?? answer?.essay1;
  const essay2 = fa.essay2 ?? answer?.essay2;
  const conclusion = fa.conclusion ?? answer?.conclusion ?? answer?.summary;
  const selectedOption = fa.selectedOption ?? answer?.selectedOption;
  const reason = fa.reason ?? answer?.reason;
  const isCorrect = fa.isCorrect ?? answer?.isCorrect;

  const hasAny = essay1 || essay2 || selectedOption || conclusion;
  if (!hasAny) return <MissingData />;

  return (
    <div className="space-y-3">
      {(essay1 || essay2) && (
        <ReviewCard title="Esai Kamu" icon={<PenLine className="w-3.5 h-3.5" />} accentColor="text-[#628ECB]" borderColor="border-[#628ECB]/20" bgColor="bg-[#EEF4FF]/40">
          <div className="space-y-3">
            {essay1 && (
              <div>
                {essay2 && <p className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]/60 mb-1.5">Esai 1</p>}
                <EssayDisplay text={essay1} />
              </div>
            )}
            {essay2 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]/60 mb-1.5">Esai 2</p>
                <EssayDisplay text={essay2} />
              </div>
            )}
          </div>
        </ReviewCard>
      )}

      {selectedOption && (
        <ReviewCard
          title="Pilihan Analisis"
          icon={isCorrect ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          accentColor={isCorrect ? 'text-[#10B981]' : 'text-red-500'}
          borderColor={isCorrect ? 'border-[#10B981]/20' : 'border-red-200'}
          bgColor={isCorrect ? 'bg-[#F0FDF9]/40' : 'bg-red-50/40'}
        >
          <div className={`flex items-center gap-2.5 p-3 rounded-xl mb-3 ${isCorrect ? 'bg-[#10B981]/10' : 'bg-red-50'}`}>
            {isCorrect ? <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
            <p className="text-xs font-bold text-[#395886]">Pilihan: {selectedOption} — {isCorrect ? 'Benar' : 'Salah'}</p>
          </div>
          {reason && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/50 mb-1.5">Alasan</p>
              <EssayDisplay text={reason} />
            </div>
          )}
        </ReviewCard>
      )}

      {conclusion && (
        <ReviewCard title="Penarikan Kesimpulan" icon={<Lightbulb className="w-3.5 h-3.5" />} accentColor="text-[#8B5CF6]" borderColor="border-[#8B5CF6]/20" bgColor="bg-[#F5F3FF]/40">
          <EssayDisplay text={conclusion} />
        </ReviewCard>
      )}
    </div>
  );
}

function InquiryReview({ answer, snap }: { answer: any; snap?: Record<string, any> }) {
  const essay1 = snap?.essay1Text ?? answer?.essay1;
  const reflection1 = snap?.reflection1 ?? answer?.reflection1;
  const reflection2 = snap?.reflection2 ?? answer?.reflection2;
  const conclusion = snap?.conclusionText ?? answer?.conclusion ?? answer?.summary;
  const flowData = snap?.flowData ?? answer?.flowData;
  const analogyData = snap?.analogyData ?? answer?.analogyData;
  const groupData = snap?.groupData ?? answer?.groupData;
  const matchingData = snap?.matchingData ?? answer?.matchingData;

  const hasActivity = !!(flowData || analogyData || groupData || matchingData);
  const mainEssay = essay1 || reflection1;
  const hasEssay = !!(mainEssay || reflection2);

  if (!hasActivity && !hasEssay && !conclusion) return <MissingData />;

  return (
    <div className="space-y-3">
      {hasActivity && (
        <ReviewCard title="Hasil Aktivitas Interaktif" icon={<Search className="w-3.5 h-3.5" />} accentColor="text-[#10B981]" borderColor="border-[#10B981]/20" bgColor="bg-[#F0FDF9]/40">
          <div className="space-y-2">
            {flowData && (
              <ActivityBadge label={`Pengurutan Alur / Layer — Selesai${flowData.validated ? ' (tervalidasi)' : ''}`} />
            )}
            {analogyData && (
              <ActivityBadge label={`Aktivitas Analogi — Selesai`} />
            )}
            {groupData && (
              <ActivityBadge
                label={`Pengelompokan — Selesai${groupData.correctCount !== undefined ? ` (${groupData.correctCount}/${groupData.total ?? groupData.totalItems ?? '?'} benar)` : ''}`}
              />
            )}
            {matchingData && (
              <ActivityBadge label="Pencocokan Pasangan — Selesai" />
            )}
          </div>
        </ReviewCard>
      )}

      {hasEssay && (
        <ReviewCard title="Refleksi & Argumen" icon={<PenLine className="w-3.5 h-3.5" />} accentColor="text-[#10B981]" borderColor="border-[#10B981]/20" bgColor="bg-[#F0FDF9]/40">
          <div className="space-y-3">
            {mainEssay && (
              <div>
                {reflection2 && <p className="text-[10px] font-black uppercase tracking-widest text-[#10B981]/60 mb-1.5">Refleksi 1</p>}
                <EssayDisplay text={mainEssay} />
              </div>
            )}
            {reflection2 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#10B981]/60 mb-1.5">Refleksi 2</p>
                <EssayDisplay text={reflection2} />
              </div>
            )}
          </div>
        </ReviewCard>
      )}

      {conclusion && (
        <ReviewCard title="Penarikan Kesimpulan" icon={<Lightbulb className="w-3.5 h-3.5" />} accentColor="text-[#8B5CF6]" borderColor="border-[#8B5CF6]/20" bgColor="bg-[#F5F3FF]/40">
          <EssayDisplay text={conclusion} />
        </ReviewCard>
      )}
    </div>
  );
}

// Names/descs for Questioning Lesson 1 matching activity
const LAYER_FUNC_NAMES: Record<string, string> = {
  lf1: 'Application Layer', lf2: 'Transport Layer', lf3: 'Network Layer',
  lf4: 'Data Link Layer', lf5: 'Physical Layer',
};
const LAYER_FUNC_DESCS: Record<string, string> = {
  lf1: 'Protokol HTTP, SMTP, FTP (data pengguna)',
  lf2: 'Segmentasi & checksum TCP/UDP',
  lf3: 'Routing & IP Address',
  lf4: 'MAC Address & Frame (jaringan lokal)',
  lf5: 'Media fisik: kabel, Wi-Fi, serat optik',
};

function QuestioningReview({ answer, snap, stage, lessonId }: { answer: any; snap?: Record<string, any>; stage: Stage; lessonId?: string }) {
  const isLesson1 = lessonId === '1' || snap?.matchPlacements !== undefined || answer?.selectedId === 'function_matching';
  const isLesson2 = !isLesson1 && (lessonId === '2' || (snap?.openedQAIds !== undefined && snap?.matchPlacements === undefined));

  const essay = snap?.essay ?? answer?.justification;
  const conclusion = snap?.conclusionText ?? answer?.conclusion;

  // Lesson 1
  if (isLesson1) {
    const matchPlacements = snap?.matchPlacements as Record<string, string> | undefined;
    const matchValidated = snap?.matchValidated as boolean | undefined;
    const disruptionDone = snap?.disruptionDone ?? (answer?.disruptionDone as boolean | undefined);
    const openedQAIds = (snap?.openedQAIds ?? answer?.askedQuestions ?? []) as string[];

    const hasAny = matchPlacements || disruptionDone || openedQAIds.length > 0 || essay || conclusion;
    if (!hasAny) return <MissingData />;

    return (
      <div className="space-y-3">
        {matchPlacements && Object.keys(matchPlacements).length > 0 && (
          <ReviewCard title="Pencocokan Fungsi Layer TCP/IP" icon={<Layers className="w-3.5 h-3.5" />} accentColor="text-[#8B5CF6]" borderColor="border-[#8B5CF6]/20" bgColor="bg-[#F5F3FF]/40">
            <div className="space-y-1.5">
              {Object.entries(matchPlacements).map(([funcId, layerId]) => {
                const correct = funcId === layerId;
                return (
                  <div
                    key={funcId}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl text-xs border ${matchValidated ? (correct ? 'bg-[#F0FDF9] border-[#10B981]/20' : 'bg-red-50 border-red-100') : 'bg-[#F8FAFF] border-[#D5DEEF]'}`}
                  >
                    {matchValidated && (
                      correct
                        ? <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                        : <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#395886] leading-tight">{LAYER_FUNC_DESCS[funcId] ?? funcId}</p>
                      <p className="text-[#395886]/50 mt-0.5">→ {LAYER_FUNC_NAMES[layerId] ?? layerId}</p>
                    </div>
                  </div>
                );
              })}
              {!matchValidated && (
                <p className="text-[10px] text-[#395886]/40 italic pt-1">Belum divalidasi saat tahap selesai</p>
              )}
            </div>
          </ReviewCard>
        )}

        {(disruptionDone || openedQAIds.length > 0) && (
          <ReviewCard title="Analisis Gangguan & Tanya Jawab" icon={<Search className="w-3.5 h-3.5" />} accentColor="text-[#F59E0B]" borderColor="border-[#F59E0B]/20" bgColor="bg-[#FFFBEB]/40">
            <div className="space-y-2">
              {disruptionDone && <ActivityBadge label="Analisis gangguan jaringan (analogi pizza) — Selesai" />}
              {openedQAIds.length > 0 && <ActivityBadge label={`${openedQAIds.length} pertanyaan eksplorasi layer dibuka`} />}
            </div>
          </ReviewCard>
        )}

        {essay && (
          <ReviewCard title="Argumen Logis" icon={<PenLine className="w-3.5 h-3.5" />} accentColor="text-[#628ECB]" borderColor="border-[#628ECB]/20" bgColor="bg-[#EEF4FF]/40">
            <EssayDisplay text={essay} />
          </ReviewCard>
        )}

        {conclusion && (
          <ReviewCard title="Penarikan Kesimpulan" icon={<Lightbulb className="w-3.5 h-3.5" />} accentColor="text-[#8B5CF6]" borderColor="border-[#8B5CF6]/20" bgColor="bg-[#F5F3FF]/40">
            <EssayDisplay text={conclusion} />
          </ReviewCard>
        )}
      </div>
    );
  }

  // Lesson 2
  if (isLesson2) {
    const selectedId = snap?.selectedId ?? answer?.selectedId;
    const validated = snap?.validated ?? answer?.validated;
    const isCorrect = answer?.isCorrect;
    const openedQAIds = (snap?.openedQAIds ?? answer?.askedQuestions ?? []) as string[];
    const selectedOption = stage.reasonOptions?.find(o => o.id === selectedId);

    const hasAny = selectedId || essay || conclusion;
    if (!hasAny) return <MissingData />;

    return (
      <div className="space-y-3">
        {openedQAIds.length > 0 && (
          <ReviewCard title="Eksplorasi Pertanyaan" icon={<Search className="w-3.5 h-3.5" />} accentColor="text-[#8B5CF6]" borderColor="border-[#8B5CF6]/20" bgColor="bg-[#F5F3FF]/40">
            <ActivityBadge label={`${openedQAIds.length} pertanyaan eksplorasi dibuka`} />
          </ReviewCard>
        )}

        {selectedId && (
          <ReviewCard
            title="Identifikasi Field TCP Header"
            icon={isCorrect ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            accentColor={isCorrect ? 'text-[#10B981]' : 'text-red-500'}
            borderColor={isCorrect ? 'border-[#10B981]/20' : 'border-red-200'}
            bgColor={isCorrect ? 'bg-[#F0FDF9]/40' : 'bg-red-50/40'}
          >
            <div className={`flex items-start gap-2.5 p-3 rounded-xl ${isCorrect ? 'bg-[#10B981]/10' : 'bg-red-50'}`}>
              {isCorrect
                ? <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                : <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
              <div>
                <p className="text-xs font-bold text-[#395886]">{selectedOption?.text ?? selectedId}</p>
                {validated && selectedOption?.feedback && (
                  <p className={`text-[10px] mt-1 font-medium ${isCorrect ? 'text-[#10B981]' : 'text-red-600'}`}>{selectedOption.feedback}</p>
                )}
              </div>
            </div>
          </ReviewCard>
        )}

        {essay && (
          <ReviewCard title="Argumen Logis" icon={<PenLine className="w-3.5 h-3.5" />} accentColor="text-[#628ECB]" borderColor="border-[#628ECB]/20" bgColor="bg-[#EEF4FF]/40">
            <EssayDisplay text={essay} />
          </ReviewCard>
        )}

        {conclusion && (
          <ReviewCard title="Penarikan Kesimpulan" icon={<Lightbulb className="w-3.5 h-3.5" />} accentColor="text-[#8B5CF6]" borderColor="border-[#8B5CF6]/20" bgColor="bg-[#F5F3FF]/40">
            <EssayDisplay text={conclusion} />
          </ReviewCard>
        )}
      </div>
    );
  }

  // Original questioning (non-lesson-specific)
  const selectedId = snap?.selectedId ?? answer?.selectedId;
  const isCorrect = answer?.isCorrect;
  const origOption = stage.reasonOptions?.find(o => o.id === selectedId);
  const justification = snap?.justification ?? answer?.justification;

  if (!selectedId && !justification) return <MissingData />;

  return (
    <div className="space-y-3">
      {selectedId && (
        <ReviewCard
          title="Pilihan Analisis"
          icon={isCorrect ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          accentColor={isCorrect ? 'text-[#10B981]' : 'text-red-500'}
          borderColor={isCorrect ? 'border-[#10B981]/20' : 'border-red-200'}
          bgColor={isCorrect ? 'bg-[#F0FDF9]/40' : 'bg-red-50/40'}
        >
          <div className={`flex items-start gap-2.5 p-3 rounded-xl ${isCorrect ? 'bg-[#10B981]/10' : 'bg-red-50'}`}>
            {isCorrect ? <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
            <p className="text-xs font-bold text-[#395886]">{origOption?.text ?? selectedId}</p>
          </div>
        </ReviewCard>
      )}

      {justification && (
        <ReviewCard title="Alasan Logis" icon={<PenLine className="w-3.5 h-3.5" />} accentColor="text-[#628ECB]" borderColor="border-[#628ECB]/20" bgColor="bg-[#EEF4FF]/40">
          <EssayDisplay text={justification} />
        </ReviewCard>
      )}
    </div>
  );
}

function LearningCommunityReview({ answer, snap }: { answer: any; snap?: Record<string, any> }) {
  const module1 = snap?.module1Data ?? answer?.module1Data;
  const module2 = snap?.module2Data ?? answer?.module2Data;
  const finalConclusion = answer?.finalConclusion ?? snap?.finalConclusion;
  const user = getCurrentUser();

  const findMyArg = (moduleData: any) => {
    if (!moduleData) return null;
    const inDiscussions = moduleData.discussions?.find((d: any) => d.user_id === user?.id);
    return inDiscussions ?? moduleData.bestArgument ?? null;
  };

  const myArg1 = findMyArg(module1);
  const myArg2 = findMyArg(module2);
  const hasModuleData = !!(module1 || module2);

  if (!hasModuleData && !finalConclusion) return <MissingData />;

  return (
    <div className="space-y-3">
      {hasModuleData && (
        <ReviewCard title="Kontribusi Diskusi Kelompok" icon={<Users className="w-3.5 h-3.5" />} accentColor="text-[#8B5CF6]" borderColor="border-[#8B5CF6]/20" bgColor="bg-[#F5F3FF]/40">
          <div className="space-y-3">
            {myArg1 ? (
              <div>
                {myArg2 && <p className="text-[10px] font-black uppercase tracking-widest text-[#8B5CF6]/60 mb-1.5">Argumen Modul 1</p>}
                {myArg1.choice_text && (
                  <p className="text-[10px] font-black text-[#8B5CF6] mb-1.5">Pilihan: {myArg1.choice_text}</p>
                )}
                <EssayDisplay text={myArg1.argument} />
              </div>
            ) : (
              module1 && <ActivityBadge label="Modul diskusi 1 — Selesai" />
            )}
            {myArg2 ? (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8B5CF6]/60 mb-1.5">Argumen Modul 2</p>
                {myArg2.choice_text && (
                  <p className="text-[10px] font-black text-[#8B5CF6] mb-1.5">Pilihan: {myArg2.choice_text}</p>
                )}
                <EssayDisplay text={myArg2.argument} />
              </div>
            ) : (
              module2 && <ActivityBadge label="Modul diskusi 2 — Selesai" />
            )}
          </div>
        </ReviewCard>
      )}

      {finalConclusion && (
        <ReviewCard title="Kesimpulan Individual" icon={<PenLine className="w-3.5 h-3.5" />} accentColor="text-[#8B5CF6]" borderColor="border-[#8B5CF6]/20" bgColor="bg-[#F5F3FF]/40">
          <EssayDisplay text={finalConclusion} />
        </ReviewCard>
      )}
    </div>
  );
}

function ModelingReview({ answer, snap }: { answer: any; snap?: Record<string, any> }) {
  const essay = snap?.essay ?? answer?.essay ?? answer?.argument;
  const conclusion = snap?.conclusionText ?? answer?.conclusion;
  const completedSteps = (snap?.completedSteps ?? answer?.completedSteps) as number[] | undefined;
  const userMessage = snap?.userMessage ?? answer?.userMessage;

  const hasAny = completedSteps?.length || essay || conclusion || userMessage;
  if (!hasAny) return <MissingData />;

  return (
    <div className="space-y-3">
      {(completedSteps && completedSteps.length > 0) && (
        <ReviewCard title="Progres Simulasi" icon={<MonitorPlay className="w-3.5 h-3.5" />} accentColor="text-[#EC4899]" borderColor="border-[#EC4899]/20" bgColor="bg-[#FDF2F8]/40">
          <ActivityBadge label={`${completedSteps.length} langkah simulasi diselesaikan`} />
        </ReviewCard>
      )}

      {userMessage && (
        <ReviewCard title="Konteks Analisis" icon={<MessageSquare className="w-3.5 h-3.5" />} accentColor="text-[#EC4899]" borderColor="border-[#EC4899]/20" bgColor="bg-[#FDF2F8]/40">
          <EssayDisplay text={userMessage} />
        </ReviewCard>
      )}

      {essay && (
        <ReviewCard title="Argumen Logis" icon={<PenLine className="w-3.5 h-3.5" />} accentColor="text-[#628ECB]" borderColor="border-[#628ECB]/20" bgColor="bg-[#EEF4FF]/40">
          <EssayDisplay text={essay} />
        </ReviewCard>
      )}

      {conclusion && (
        <ReviewCard title="Penarikan Kesimpulan" icon={<Lightbulb className="w-3.5 h-3.5" />} accentColor="text-[#8B5CF6]" borderColor="border-[#8B5CF6]/20" bgColor="bg-[#F5F3FF]/40">
          <EssayDisplay text={conclusion} />
        </ReviewCard>
      )}
    </div>
  );
}

function ReflectionReview({ answer, snap }: { answer: any; snap?: Record<string, any> }) {
  const mapData = snap?.mapData ?? answer?.mapData;
  const argumentText = snap?.argumentText ?? answer?.argumentText;
  const evaluationData = snap?.evaluationData ?? answer?.evaluationData;
  const conclusion = snap?.conclusionText ?? answer?.conclusionText ?? answer?.conclusion;
  const isPipelineMode = mapData?.mode === 'tcp-pipeline';

  const hasAny = mapData || argumentText || conclusion || (evaluationData && Object.keys(evaluationData).length > 0);
  if (!hasAny) return <MissingData />;

  const checkedCount = evaluationData ? Object.values(evaluationData).filter(Boolean).length : 0;
  const totalCriteria = evaluationData ? Object.keys(evaluationData).length : 0;

  return (
    <div className="space-y-3">
      {mapData && (
        <ReviewCard title={isPipelineMode ? 'TCP Blueprint Constructor' : 'Peta Konsep'} icon={<Layers className="w-3.5 h-3.5" />} accentColor="text-[#6366F1]" borderColor="border-[#6366F1]/20" bgColor="bg-[#EEF2FF]/40">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#EEF2FF] border border-[#6366F1]/15">
            <CheckCircle className="w-4 h-4 text-[#6366F1] shrink-0" />
            <p className="text-xs font-bold text-[#3730A3]">
              {isPipelineMode
                ? mapData.isCorrect
                  ? 'Pipeline keandalan TCP tersusun dengan benar'
                  : `${mapData.correctCount ?? '?'} dari ${mapData.total ?? '?'} langkah pipeline benar`
                : mapData.correctCount !== undefined
                  ? `${mapData.correctCount}/${mapData.totalConnections ?? mapData.total ?? '?'} koneksi benar`
                  : 'Peta konsep selesai dikerjakan'}
            </p>
          </div>
        </ReviewCard>
      )}

      {totalCriteria > 0 && (
        <ReviewCard title="Evaluasi Diri" icon={<CheckCircle className="w-3.5 h-3.5" />} accentColor="text-[#6366F1]" borderColor="border-[#6366F1]/20" bgColor="bg-[#EEF2FF]/40">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#EEF2FF] border border-[#6366F1]/15">
            <Award className="w-4 h-4 text-[#6366F1] shrink-0" />
            <p className="text-xs font-bold text-[#3730A3]">{checkedCount} dari {totalCriteria} kriteria tercapai</p>
          </div>
        </ReviewCard>
      )}

      {argumentText && (
        <ReviewCard title="Kemampuan Berargumen" icon={<PenLine className="w-3.5 h-3.5" />} accentColor="text-[#628ECB]" borderColor="border-[#628ECB]/20" bgColor="bg-[#EEF4FF]/40">
          <EssayDisplay text={argumentText} />
        </ReviewCard>
      )}

      {conclusion && (
        <ReviewCard title="Penarikan Kesimpulan" icon={<Lightbulb className="w-3.5 h-3.5" />} accentColor="text-[#8B5CF6]" borderColor="border-[#8B5CF6]/20" bgColor="bg-[#F5F3FF]/40">
          <EssayDisplay text={conclusion} />
        </ReviewCard>
      )}
    </div>
  );
}

function AuthenticAssessmentReview({ answer, snap, stage }: { answer: any; snap?: Record<string, any>; stage: Stage }) {
  const initialChoice = snap?.initialChoice ?? answer?.initialChoice;
  const initialReason = snap?.initialReason ?? answer?.initialReason;
  const followUpChoice = snap?.followUpChoice ?? answer?.followUpChoice;
  const followUpReason = snap?.followUpReason ?? answer?.followUpReason;
  const isOptimal = answer?.isOptimal;
  const isFollowUpCorrect = answer?.isFollowUpCorrect;

  const scenario = (stage as any).branchingScenario;
  const initialBranch = scenario?.branches?.find((b: any) => b.id === initialChoice);
  const followUpOpt = initialBranch?.followUp?.options?.find((o: any) => o.id === followUpChoice);

  const hasAny = initialChoice || followUpChoice;
  if (!hasAny) return <MissingData />;

  return (
    <div className="space-y-3">
      {initialChoice && (
        <ReviewCard
          title="Diagnosis Awal"
          icon={isOptimal ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          accentColor={isOptimal ? 'text-[#10B981]' : isOptimal === false ? 'text-red-500' : 'text-[#628ECB]'}
          borderColor={isOptimal ? 'border-[#10B981]/20' : isOptimal === false ? 'border-red-200' : 'border-[#628ECB]/20'}
          bgColor={isOptimal ? 'bg-[#F0FDF9]/40' : isOptimal === false ? 'bg-red-50/40' : 'bg-[#EEF4FF]/40'}
        >
          <div className={`flex items-start gap-2.5 p-3 rounded-xl mb-3 ${isOptimal ? 'bg-[#10B981]/10' : isOptimal === false ? 'bg-red-50' : 'bg-[#EEF4FF]'}`}>
            {isOptimal === true && <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />}
            {isOptimal === false && <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
            <div>
              <p className="text-xs font-bold text-[#395886]">{initialBranch?.label ?? initialChoice}</p>
              {isOptimal !== undefined && (
                <p className={`text-[10px] mt-0.5 font-medium ${isOptimal ? 'text-[#10B981]' : 'text-red-600'}`}>
                  {isOptimal ? 'Pilihan optimal' : 'Bukan pilihan optimal'}
                </p>
              )}
            </div>
          </div>
          {initialReason && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/50 mb-1.5">Alasan Diagnosa</p>
              <EssayDisplay text={initialReason} />
            </div>
          )}
        </ReviewCard>
      )}

      {followUpChoice && (
        <ReviewCard
          title="Keputusan Tindak Lanjut"
          icon={isFollowUpCorrect ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          accentColor={isFollowUpCorrect ? 'text-[#10B981]' : isFollowUpCorrect === false ? 'text-red-500' : 'text-[#628ECB]'}
          borderColor={isFollowUpCorrect ? 'border-[#10B981]/20' : isFollowUpCorrect === false ? 'border-red-200' : 'border-[#628ECB]/20'}
          bgColor={isFollowUpCorrect ? 'bg-[#F0FDF9]/40' : isFollowUpCorrect === false ? 'bg-red-50/40' : 'bg-[#EEF4FF]/40'}
        >
          <div className={`flex items-start gap-2.5 p-3 rounded-xl mb-3 ${isFollowUpCorrect ? 'bg-[#10B981]/10' : isFollowUpCorrect === false ? 'bg-red-50' : 'bg-[#EEF4FF]'}`}>
            {isFollowUpCorrect === true && <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />}
            {isFollowUpCorrect === false && <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
            <div>
              <p className="text-xs font-bold text-[#395886]">{followUpOpt?.label ?? followUpChoice}</p>
              {isFollowUpCorrect !== undefined && (
                <p className={`text-[10px] mt-0.5 font-medium ${isFollowUpCorrect ? 'text-[#10B981]' : 'text-red-600'}`}>
                  {isFollowUpCorrect ? 'Keputusan tepat' : 'Keputusan perlu ditinjau'}
                </p>
              )}
            </div>
          </div>
          {followUpReason && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/50 mb-1.5">Alasan Tindak Lanjut</p>
              <EssayDisplay text={followUpReason} />
            </div>
          )}
        </ReviewCard>
      )}
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────────

export interface StageAnswerDetailProps {
  stage: Stage;
  answer: any;
  snapshot?: Record<string, any>;
  lessonId?: string;
}

export function StageAnswerDetail({ stage, answer, snapshot, lessonId }: StageAnswerDetailProps) {
  if (!answer) return <MissingData />;
  const snap = snapshot;

  switch (stage.type) {
    case 'constructivism':
      return <ConstructivismReview answer={answer} snap={snap} />;
    case 'inquiry':
      return <InquiryReview answer={answer} snap={snap} />;
    case 'questioning':
      return <QuestioningReview answer={answer} snap={snap} stage={stage} lessonId={lessonId} />;
    case 'learning-community':
      return <LearningCommunityReview answer={answer} snap={snap} />;
    case 'modeling':
      return <ModelingReview answer={answer} snap={snap} />;
    case 'reflection':
      return <ReflectionReview answer={answer} snap={snap} />;
    case 'authentic-assessment':
      return <AuthenticAssessmentReview answer={answer} snap={snap} stage={stage} />;
    default:
      return <MissingData />;
  }
}
