import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle,
  ChevronRight,
  Eye,
  GripVertical,
  Layers,
  Lightbulb,
  LockKeyhole,
  MessageSquare,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useActivityTracker } from '../../hooks/useActivityTracker';

interface ConceptMapNode {
  id: string;
  label: string;
  description?: string;
  colorClass?: string;
}

interface ConceptMapConnection {
  from: string;
  to: string;
  label: string;
  options: string[];
}

interface SelfEvalCriteria {
  id: string;
  label: string;
}

interface EssayReflection {
  materialSummaryPrompt: string;
  easyPartPrompt: string;
  hardPartPrompt: string;
}

interface PreviousStageResult {
  stageIndex: number;
  stageType: string;
  stageTitle: string;
  objectiveCode: string;
  conclusion: string;
  hasData: boolean;
}

interface PipelineItem {
  id: string;
  label: string;
  description: string;
  correctOrder: number;
}

interface TcpReliabilityPipeline {
  instruction: string;
  items: PipelineItem[];
  successMessage: string;
}

interface DropdownOption {
  value: string;
  label: string;
  isCorrect: boolean;
}

interface DropdownDef {
  id: string;
  placeholder: string;
  options: DropdownOption[];
}

interface DropdownConclusion {
  instruction: string;
  templateParts: string[];
  dropdowns: DropdownDef[];
}

interface ReflectionStageProps {
  lessonId: string;
  stageIndex: number;
  moduleId: string;
  onComplete: (answer: any) => void;
  isCompleted?: boolean;
  conceptMapNodes?: ConceptMapNode[];
  conceptMapConnections?: ConceptMapConnection[];
  conceptMapTitle?: string;
  essayReflection?: EssayReflection;
  selfEvaluationCriteria?: SelfEvalCriteria[];
  previousStageResults?: PreviousStageResult[];
  conclusionPrompt?: string;
  tcpReliabilityPipeline?: TcpReliabilityPipeline;
  reliabilityArguingQuestion?: string;
  dropdownConclusion?: DropdownConclusion;
  onTrackerPhase?: (phase: 'consistency' | 'arguing' | 'conclusion') => void;
}

const STAGE_COLORS: Record<string, string> = {
  constructivism: '#628ECB',
  inquiry: '#10B981',
  questioning: '#8B5CF6',
  'learning-community': '#F59E0B',
  modeling: '#EC4899',
  reflection: '#6366F1',
  'authentic-assessment': '#8B5CF6',
};

const STAGE_LABELS: Record<string, string> = {
  constructivism: 'Constructivism',
  inquiry: 'Inquiry',
  questioning: 'Questioning',
  'learning-community': 'Learning Community',
  modeling: 'Modeling',
  reflection: 'Reflection',
  'authentic-assessment': 'Authentic Assessment',
};

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; line: string }> = {
  blue: { bg: 'bg-[#EEF4FF]', border: 'border-[#628ECB]', text: 'text-[#395886]', line: '#628ECB' },
  green: { bg: 'bg-[#ECFDF5]', border: 'border-[#10B981]', text: 'text-[#065F46]', line: '#10B981' },
  purple: { bg: 'bg-[#EDE9FE]', border: 'border-[#8B5CF6]', text: 'text-[#5B21B6]', line: '#8B5CF6' },
  amber: { bg: 'bg-[#FFFBEB]', border: 'border-[#F59E0B]', text: 'text-[#78350F]', line: '#F59E0B' },
  pink: { bg: 'bg-[#FDF2F8]', border: 'border-[#EC4899]', text: 'text-[#831843]', line: '#EC4899' },
};

const REFLECTION_PHASES = [
  { key: 'review', label: 'Tinjau Hasil', icon: <Eye className="w-3.5 h-3.5" /> },
  { key: 'concept-map', label: 'Keruntutan Berpikir', icon: <Brain className="w-3.5 h-3.5" /> },
  { key: 'arguing', label: 'Kemampuan Berargumen', icon: <MessageSquare className="w-3.5 h-3.5" /> },
  { key: 'conclusion', label: 'Penarikan Kesimpulan', icon: <Sparkles className="w-3.5 h-3.5" /> },
];

const REFLECTION_PHASES_WITH_EVAL = [
  { key: 'review', label: 'Tinjau Hasil', icon: <Eye className="w-3.5 h-3.5" /> },
  { key: 'concept-map', label: 'Keruntutan Berpikir', icon: <Brain className="w-3.5 h-3.5" /> },
  { key: 'self-eval', label: 'Evaluasi Diri', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  { key: 'arguing', label: 'Kemampuan Berargumen', icon: <MessageSquare className="w-3.5 h-3.5" /> },
  { key: 'conclusion', label: 'Penarikan Kesimpulan', icon: <Sparkles className="w-3.5 h-3.5" /> },
];

function PhaseTracker({ current, completed, hasEval }: { current: number; completed: Set<number>; hasEval: boolean }) {
  const phases = hasEval ? REFLECTION_PHASES_WITH_EVAL : REFLECTION_PHASES;

  return (
    <div className="flex items-center gap-1.5 mb-6 px-1 flex-wrap">
      {phases.map((phase, idx) => {
        const isDone = completed.has(idx);
        const isActive = idx === current;
        return (
          <React.Fragment key={phase.key}>
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                isDone
                  ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                  : isActive
                    ? 'bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20 shadow-sm'
                    : 'text-[#395886]/25 border border-transparent'
              }`}
            >
              {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : phase.icon}
              <span className="text-[9px] font-bold uppercase tracking-tight whitespace-nowrap">{phase.label}</span>
            </div>
            {idx < phases.length - 1 && (
              <div className={`h-px w-4 shrink-0 ${isDone ? 'bg-[#10B981]/40' : 'bg-[#D5DEEF]'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function wordCountOf(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function determineTrackerPhase(
  activePhase: number,
  completedPhases: Set<number>,
  arguingPhase: number,
  conclusionPhase: number,
): 'consistency' | 'arguing' | 'conclusion' {
  if (completedPhases.has(conclusionPhase) || activePhase >= conclusionPhase) return 'conclusion';
  if (completedPhases.has(arguingPhase) || activePhase >= arguingPhase) return 'arguing';
  return 'consistency';
}

function buildInitialPipelineState(items: PipelineItem[]) {
  if (items.length <= 1) return { bank: items, slots: new Array(items.length).fill(null) };
  const rotated = [...items.slice(1), items[0]];
  return { bank: rotated, slots: new Array(items.length).fill(null) as Array<PipelineItem | null> };
}

function getProgressPercent(completedSize: number, totalPhases: number) {
  if (totalPhases <= 0) return 0;
  return Math.round((completedSize / totalPhases) * 100);
}

function getLogicalIndicatorStatuses(
  activePhase: number,
  completedPhases: Set<number>,
  arguingPhase: number,
  conclusionPhase: number,
) {
  const consistencyDone = completedPhases.has(1);
  const arguingDone = completedPhases.has(arguingPhase);
  const conclusionDone = completedPhases.has(conclusionPhase);

  return [
    {
      key: 'consistency',
      label: 'Keruntutan Berpikir',
      status: consistencyDone ? 'done' : activePhase === 1 ? 'active' : 'pending',
    },
    {
      key: 'arguing',
      label: 'Kemampuan Berargumen',
      status: arguingDone ? 'done' : activePhase === arguingPhase ? 'active' : 'pending',
    },
    {
      key: 'conclusion',
      label: 'Penarikan Kesimpulan',
      status: conclusionDone ? 'done' : activePhase === conclusionPhase ? 'active' : 'pending',
    },
  ] as const;
}

function findSummaryForPipelineItem(item: PipelineItem, results: PreviousStageResult[]) {
  const itemText = `${item.label} ${item.description}`.toLowerCase();
  const labelKeywords =
    item.id === 'twh'
      ? ['three-way handshake', 'syn', 'syn-ack', 'ack', 'handshake']
      : item.id === 'seqack'
        ? ['sequence', 'ack number', 'acknowledgment', 'urutan', 'out-of-order']
        : ['error recovery', 'timeout', 'retransmission', 'checksum', 'rusak', 'hilang'];

  const match = results.find((result) => {
    const haystack = `${result.stageTitle} ${result.conclusion} ${result.objectiveCode}`.toLowerCase();
    return labelKeywords.some((keyword) => haystack.includes(keyword)) || haystack.includes(itemText);
  });

  return match ?? null;
}

function ReviewPreviousResults({
  previousStageResults,
  pipelineItems,
  activePhase,
  completedPhases,
  arguingPhase,
  conclusionPhase,
}: {
  previousStageResults: PreviousStageResult[];
  pipelineItems?: PipelineItem[];
  activePhase: number;
  completedPhases: Set<number>;
  arguingPhase: number;
  conclusionPhase: number;
}) {
  const validResults = previousStageResults.filter((result) => result.hasData);
  const reviewCards = (pipelineItems || []).map((item) => ({
    item,
    matched: findSummaryForPipelineItem(item, validResults),
  }));
  const isTcpReview = reviewCards.length > 0;

  const logicalStatuses = getLogicalIndicatorStatuses(activePhase, completedPhases, arguingPhase, conclusionPhase);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-[#6366F1]/15 bg-gradient-to-br from-[#EEF2FF] to-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[#6366F1]/10">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6366F1]/10">
            <Eye className="w-4.5 h-4.5 text-[#6366F1]" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#6366F1]">
              Rekap Reflection Pertemuan 2
            </p>
            <p className="text-sm font-bold text-[#395886]">
              Tinjau hasil TCP sebelum masuk ke TCP Blueprint Constructor
            </p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-xl border border-[#6366F1]/10 bg-white/80 p-4">
            <p className="text-sm text-[#395886]/70 leading-relaxed">
              Rekap ini menghubungkan hasil Three-Way Handshake, analisis Sequence & ACK Number, dan Error Recovery
              agar siswa melihat keandalan TCP sebagai satu sistem yang utuh.
            </p>
          </div>

          {isTcpReview ? (
            <div className="grid gap-4 md:grid-cols-3">
              {reviewCards.map(({ item, matched }) => (
                <div key={item.id} className="rounded-2xl border-2 border-[#D5DEEF] bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 bg-[#F8FAFF] border-b border-[#D5DEEF]/60">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#628ECB]/10">
                      <Layers className="w-4 h-4 text-[#628ECB]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#628ECB]">Rekap Materi</p>
                      <p className="text-xs font-bold text-[#395886]">{item.label}</p>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-[11px] text-[#395886]/55 leading-relaxed">{item.description}</p>
                    <div className="rounded-xl border border-[#D5DEEF] bg-[#FBFCFF] p-3 min-h-[112px]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/45 mb-2">
                        {matched ? `${matched.stageTitle} • ${matched.objectiveCode}` : 'Belum ada ringkasan'}
                      </p>
                      <p className="text-xs text-[#395886] leading-relaxed">
                        {matched?.conclusion || 'Kesimpulan dari tahap sebelumnya belum tersedia untuk bagian ini.'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : validResults.length > 0 ? (
            <div className="space-y-4">
              {validResults.map((result) => (
                <div key={`${result.stageIndex}-${result.objectiveCode}`} className="rounded-2xl border-2 border-[#D5DEEF] bg-white shadow-sm overflow-hidden">
                  <div
                    className="flex items-center gap-3 px-4 py-3 border-b border-[#D5DEEF]/60"
                    style={{ backgroundColor: `${STAGE_COLORS[result.stageType] || '#628ECB'}08` }}
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${STAGE_COLORS[result.stageType] || '#628ECB'}15` }}
                    >
                      <Layers className="w-4 h-4" style={{ color: STAGE_COLORS[result.stageType] || '#628ECB' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: STAGE_COLORS[result.stageType] || '#628ECB' }}>
                        {STAGE_LABELS[result.stageType] || result.stageType}
                      </p>
                      <p className="text-xs font-bold text-[#395886]">
                        {result.objectiveCode}: {result.stageTitle}
                      </p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-[#395886] leading-relaxed whitespace-pre-wrap">{result.conclusion}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#D5DEEF] bg-white p-5 text-center">
              <p className="text-sm font-bold text-[#395886]/45">Belum ada hasil tahapan sebelumnya yang tersimpan.</p>
            </div>
          )}

          <div className="rounded-2xl border-2 border-[#D5DEEF] bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-[#F8FAFF] border-b border-[#D5DEEF]/60">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#10B981]/10">
                <Brain className="w-4 h-4 text-[#10B981]" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#10B981]">Logical Thinking</p>
                <p className="text-xs font-bold text-[#395886]">Status indikator refleksi saat ini</p>
              </div>
            </div>
            <div className="grid gap-3 p-4 md:grid-cols-3">
              {logicalStatuses.map((indicator) => {
                const style =
                  indicator.status === 'done'
                    ? 'border-[#10B981]/25 bg-[#ECFDF5] text-[#065F46]'
                    : indicator.status === 'active'
                      ? 'border-[#628ECB]/25 bg-[#EEF4FF] text-[#395886]'
                      : 'border-[#D5DEEF] bg-[#F8FAFF] text-[#395886]/45';
                return (
                  <div key={indicator.key} className={`rounded-xl border p-3 ${style}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      {indicator.status === 'done' ? (
                        <CheckCircle className="w-4 h-4 text-[#10B981]" />
                      ) : indicator.status === 'active' ? (
                        <AlertCircle className="w-4 h-4 text-[#628ECB]" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-current opacity-40" />
                      )}
                      <p className="text-xs font-bold">{indicator.label}</p>
                    </div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide">
                      {indicator.status === 'done'
                        ? 'Checklist berhasil'
                        : indicator.status === 'active'
                          ? 'Aktif / Progress'
                          : 'Nonaktif'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConceptMapPhase({
  nodes,
  connections,
  initialData,
  conceptMapTitle,
  onMapDataChange,
}: {
  nodes: ConceptMapNode[];
  connections: ConceptMapConnection[];
  initialData?: any;
  conceptMapTitle?: string;
  onMapDataChange: (data: any) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(initialData?.answers || {});
  const [validated, setValidated] = useState(initialData?.validated || false);

  const allAnswered = connections.length > 0 && connections.every((connection) => answers[`${connection.from}->${connection.to}`] !== undefined);
  const correctCount = connections.filter((connection) => answers[`${connection.from}->${connection.to}`] === connection.label).length;

  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const cols = [1, 2, 3, 1, 2, 3];
    nodes.forEach((node, index) => {
      const col = cols[index % cols.length];
      const row = Math.floor(index / 3);
      positions[node.id] = { x: col * 110 - 55, y: row * 120 + 30 };
    });
    return positions;
  }, [nodes]);

  if (!nodes.length || !connections.length) {
    return (
      <div className="py-16 text-center text-[#395886]/30 font-black uppercase tracking-widest text-sm">
        Data peta konsep belum tersedia untuk pertemuan ini.
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl border-2 border-[#D5DEEF] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 bg-[#6366F1]/5 border-b border-[#6366F1]/10">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6366F1]/10">
            <Brain className="w-4.5 h-4.5 text-[#6366F1]" />
          </div>
          <div className="flex-1">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6366F1]">Keruntutan Berpikir</p>
            <p className="text-sm font-bold text-[#395886]">{conceptMapTitle || 'Hubungkan Antar Konsep'}</p>
          </div>
          {validated && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-full">
              <CheckCircle className="w-3 h-3" /> Tervalidasi
            </span>
          )}
        </div>

        <div className="p-5 space-y-5">
          <p className="text-sm font-semibold text-[#395886]/65 leading-relaxed">
            Pilih label penghubung yang tepat untuk menunjukkan hubungan antar konsep secara runtut.
          </p>

          <div className="relative bg-[#F8FAFD] rounded-xl border-2 border-dashed border-[#D5DEEF] p-6 min-h-[420px] overflow-hidden">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {connections.map((connection) => {
                const fromPos = nodePositions[connection.from];
                const toPos = nodePositions[connection.to];
                if (!fromPos || !toPos) return null;
                const chosen = answers[`${connection.from}->${connection.to}`];
                const isCorrect = validated && chosen === connection.label;
                const isWrong = validated && chosen && chosen !== connection.label;
                const fromNode = nodes.find((node) => node.id === connection.from);
                const color = COLOR_MAP[fromNode?.colorClass || 'blue'];

                return (
                  <g key={`${connection.from}-${connection.to}`}>
                    <line
                      x1={fromPos.x + 56}
                      y1={fromPos.y + 24}
                      x2={toPos.x + 56}
                      y2={toPos.y + 24}
                      stroke={validated ? (isCorrect ? '#10B981' : isWrong ? '#EF4444' : color.line) : color.line}
                      strokeWidth="2"
                      strokeDasharray={validated && isCorrect ? '0' : '4 3'}
                    />
                    {chosen && (
                      <>
                        <rect
                          x={(fromPos.x + toPos.x) / 2 + 16}
                          y={(fromPos.y + toPos.y) / 2 - 10}
                          width="80"
                          height="20"
                          rx="6"
                          fill={isCorrect ? '#ECFDF5' : isWrong ? '#FEF2F2' : '#F8FAFD'}
                          stroke={isCorrect ? '#10B981' : isWrong ? '#EF4444' : '#D5DEEF'}
                        />
                        <text
                          x={(fromPos.x + toPos.x) / 2 + 56}
                          y={(fromPos.y + toPos.y) / 2 + 4}
                          textAnchor="middle"
                          className={`text-[9px] font-black ${isCorrect ? 'fill-[#10B981]' : isWrong ? 'fill-[#EF4444]' : 'fill-[#395886]'}`}
                        >
                          {chosen}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}
            </svg>

            {nodes.map((node) => {
              const position = nodePositions[node.id];
              if (!position) return null;
              const color = COLOR_MAP[node.colorClass || 'blue'];
              return (
                <div
                  key={node.id}
                  className={`absolute flex flex-col items-center justify-center px-3 py-2.5 rounded-lg border-2 shadow-sm ${color.bg} ${color.border}`}
                  style={{ left: position.x, top: position.y, width: 112, minHeight: 48 }}
                >
                  <span className={`text-[10px] font-black leading-tight text-center ${color.text}`}>{node.label}</span>
                </div>
              );
            })}
          </div>

          <div className="grid gap-3">
            {connections.map((connection) => {
              const key = `${connection.from}->${connection.to}`;
              const chosen = answers[key];
              const isCorrect = validated && chosen === connection.label;
              const isWrong = validated && chosen && chosen !== connection.label;
              const fromNode = nodes.find((node) => node.id === connection.from);
              const toNode = nodes.find((node) => node.id === connection.to);
              const fromColor = COLOR_MAP[fromNode?.colorClass || 'blue'];
              const toColor = COLOR_MAP[toNode?.colorClass || 'blue'];

              return (
                <div
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 ${
                    validated
                      ? isCorrect
                        ? 'border-[#10B981]/30 bg-[#ECFDF5]'
                        : isWrong
                          ? 'border-red-200 bg-red-50'
                          : 'border-[#D5DEEF] bg-white'
                      : 'border-[#D5DEEF] bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${fromColor.bg} ${fromColor.text} border ${fromColor.border}`}>
                      {fromNode?.label || connection.from}
                    </span>
                    <ArrowRight className="w-3 h-3 text-[#395886]/30 shrink-0" />
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${toColor.bg} ${toColor.text} border ${toColor.border}`}>
                      {toNode?.label || connection.to}
                    </span>
                  </div>

                  <div className="h-px flex-1 bg-[#D5DEEF]" />

                  <div className="flex gap-1.5 flex-wrap justify-end">
                    {connection.options.map((option) => (
                      <button
                        key={option}
                        disabled={validated}
                        onClick={() => setAnswers((prev) => ({ ...prev, [key]: option }))}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold border-2 transition-all ${
                          chosen === option
                            ? validated
                              ? isCorrect
                                ? 'bg-[#10B981] border-[#10B981] text-white'
                                : 'bg-red-500 border-red-500 text-white'
                              : 'bg-[#6366F1] border-[#6366F1] text-white'
                            : 'bg-white border-[#D5DEEF] text-[#395886]/50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {!validated && (
            <div className="flex justify-center">
              <button
                onClick={() => {
                  const result = {
                    mode: 'concept-map',
                    answers,
                    correctCount,
                    totalConnections: connections.length,
                    validated: true,
                  };
                  setValidated(true);
                  onMapDataChange(result);
                }}
                disabled={!allAnswered}
                className={`px-8 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${
                  allAnswered ? 'bg-[#395886] text-white hover:bg-[#2A4468] shadow-lg' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'
                }`}
              >
                Validasi Peta Konsep
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {validated && (
            <div className="rounded-xl border border-[#10B981]/20 bg-[#ECFDF5] p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-[#10B981] shrink-0" />
              <div>
                <p className="text-sm font-bold text-[#065F46]">Peta Konsep Tervalidasi</p>
                <p className="text-xs text-[#10B981]/70">
                  {correctCount}/{connections.length} koneksi tepat. Aktivitas keruntutan berpikir selesai.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TcpReliabilityPipelinePhase({
  pipeline,
  initialData,
  onSave,
}: {
  pipeline: TcpReliabilityPipeline;
  initialData?: any;
  onSave: (data: any) => void;
}) {
  const restoredState = useMemo(() => {
    const itemMap = new Map(pipeline.items.map((item) => [item.id, item]));
    const defaultState = buildInitialPipelineState(pipeline.items);

    if (!initialData?.slotItemIds && !initialData?.bankItemIds) return defaultState;

    const slots = (initialData.slotItemIds || []).map((id: string | null) => (id ? itemMap.get(id) || null : null));
    while (slots.length < pipeline.items.length) slots.push(null);

    const bankIds = initialData.bankItemIds || [];
    const usedIds = new Set(slots.filter(Boolean).map((item: PipelineItem) => item.id));
    const bank = bankIds
      .map((id: string) => itemMap.get(id))
      .filter(Boolean) as PipelineItem[];

    pipeline.items.forEach((item) => {
      if (!usedIds.has(item.id) && !bank.some((entry) => entry.id === item.id)) {
        bank.push(item);
      }
    });

    return { bank, slots };
  }, [initialData, pipeline.items]);

  const [bank, setBank] = useState<PipelineItem[]>(restoredState.bank);
  const [slots, setSlots] = useState<Array<PipelineItem | null>>(restoredState.slots);
  const [isSolved, setIsSolved] = useState(Boolean(initialData?.isCorrect));
  const [attempts, setAttempts] = useState<number>(initialData?.attempts || 0);
  const [feedback, setFeedback] = useState<'idle' | 'error' | 'locked'>(
    initialData?.isCorrect ? 'idle' : (initialData?.attempts || 0) >= 3 ? 'locked' : 'idle',
  );
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const MAX_ATTEMPTS = 3;

  const allPlaced = slots.every(Boolean);
  const isLocked = !isSolved && attempts >= MAX_ATTEMPTS;
  const isEditable = !isSolved && !isLocked;

  const moveItemToSlot = (itemId: string, slotIndex: number) => {
    const currentItem = [...bank, ...slots.filter(Boolean) as PipelineItem[]].find((item) => item.id === itemId);
    if (!currentItem || !isEditable) return;

    setFeedback('idle');
    setBank((prevBank) => prevBank.filter((item) => item.id !== itemId));
    setSlots((prevSlots) => {
      const nextSlots = prevSlots.map((item) => (item?.id === itemId ? null : item));
      const displaced = nextSlots[slotIndex];
      if (displaced) {
        setBank((prevBank) => [...prevBank, displaced]);
      }
      nextSlots[slotIndex] = currentItem;
      return nextSlots;
    });
  };

  const moveItemToBank = (itemId: string) => {
    if (!isEditable) return;
    setFeedback('idle');
    setSlots((prevSlots) => {
      const found = prevSlots.find((item) => item?.id === itemId);
      if (!found) return prevSlots;
      setBank((prevBank) => (prevBank.some((item) => item.id === itemId) ? prevBank : [...prevBank, found]));
      return prevSlots.map((item) => (item?.id === itemId ? null : item));
    });
  };

  const validatePipeline = () => {
    if (!allPlaced || isSolved || isLocked) return;
    const correctCount = slots.filter((item, index) => item && item.correctOrder === index + 1).length;
    const isCorrect = correctCount === pipeline.items.length;
    const nextAttempts = attempts + 1;

    const result = {
      mode: 'tcp-pipeline',
      slotItemIds: slots.map((item) => item?.id || null),
      bankItemIds: bank.map((item) => item.id),
      correctCount,
      total: pipeline.items.length,
      attempts: nextAttempts,
      isCorrect,
      validated: isCorrect,
      successMessage: isCorrect ? pipeline.successMessage : '',
    };

    if (isCorrect) {
      setAttempts(nextAttempts);
      setIsSolved(true);
      onSave(result);
      return;
    }

    setAttempts(nextAttempts);
    setFeedback(nextAttempts >= MAX_ATTEMPTS ? 'locked' : 'error');
  };

  const resetPipeline = (resetAttempts = false) => {
    const initial = buildInitialPipelineState(pipeline.items);
    setBank(initial.bank);
    setSlots(initial.slots);
    setIsSolved(false);
    setFeedback('idle');
    if (resetAttempts) setAttempts(0);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <div className="rounded-2xl border-2 border-[#D5DEEF] bg-white shadow-sm overflow-hidden">
        <div className={`flex items-center gap-3 px-5 py-3 border-b ${isSolved ? 'bg-[#EEF4FF] border-[#628ECB]/15' : 'bg-[#F8FAFF] border-[#D5DEEF]/60'}`}>
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isSolved ? 'bg-[#628ECB]/10' : 'bg-[#6366F1]/10'}`}>
            <Brain className={`w-4.5 h-4.5 ${isSolved ? 'text-[#628ECB]' : 'text-[#6366F1]'}`} />
          </div>
          <div className="flex-1">
            <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isSolved ? 'text-[#628ECB]' : 'text-[#6366F1]'}`}>
              TCP Blueprint Constructor
            </p>
            <p className="text-sm font-bold text-[#395886]">Susun pipeline keandalan TCP secara berurutan</p>
          </div>
          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold border ${
            isSolved
              ? 'border-[#628ECB]/20 bg-[#EEF4FF] text-[#395886]'
              : isLocked
                ? 'border-red-200 bg-red-50 text-red-500'
                : 'border-[#6366F1]/20 bg-white text-[#6366F1]'
          }`}>
            {isSolved ? <CheckCircle className="w-3 h-3 text-[#628ECB]" /> : <AlertCircle className="w-3 h-3" />}
            {isSolved ? 'Sistem Utuh' : isLocked ? 'Habis' : `${MAX_ATTEMPTS - attempts} percobaan`}
          </span>
        </div>

        <div className="p-5 space-y-5">
          <div className="rounded-xl border border-[#D5DEEF] bg-[#FBFCFF] p-4">
            <p className="text-sm font-semibold text-[#395886] leading-relaxed">{pipeline.instruction}</p>
          </div>

          <div
            className="rounded-2xl border-2 border-dashed border-[#D5DEEF] bg-[#F8FAFD] p-4"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const itemId = event.dataTransfer.getData('text/plain');
              if (itemId) moveItemToBank(itemId);
              setDraggedItemId(null);
            }}
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/45 mb-3">Bank Komponen</p>
            <div className="grid gap-3 md:grid-cols-3">
              {bank.map((item) => (
                <div
                  key={item.id}
                  draggable={isEditable}
                  onDragStart={(event) => {
                    event.dataTransfer.setData('text/plain', item.id);
                    setDraggedItemId(item.id);
                  }}
                  onDragEnd={() => setDraggedItemId(null)}
                  className={`rounded-2xl border-2 bg-white p-4 shadow-sm cursor-grab active:cursor-grabbing ${
                    draggedItemId === item.id ? 'border-[#628ECB] opacity-70' : 'border-[#D5DEEF]'
                  } ${!isEditable ? 'cursor-not-allowed opacity-70' : 'hover:border-[#628ECB]/30'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF4FF]">
                      <GripVertical className="w-4 h-4 text-[#628ECB]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#395886]">{item.label}</p>
                      <p className="text-xs text-[#395886]/60 leading-relaxed mt-1">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              {bank.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#D5DEEF] bg-white p-4 text-center md:col-span-3">
                  <p className="text-xs font-bold text-[#395886]/40">Semua komponen sudah ditempatkan ke pipeline.</p>
                </div>
              )}
            </div>
          </div>

          <div className={`rounded-2xl border-2 p-4 transition-all ${isSolved ? 'border-[#628ECB]/25 bg-[#EEF4FF]/65 shadow-[0_0_0_1px_rgba(98,142,203,0.08)]' : 'border-[#D5DEEF] bg-white'}`}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/45">Pipeline TCP</p>
              {!isSolved && (
                <button
                  onClick={() => resetPipeline(false)}
                  disabled={isLocked}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold ${
                    isLocked
                      ? 'border-[#D5DEEF] text-[#395886]/30 cursor-not-allowed'
                      : 'border-[#D5DEEF] text-[#395886]/70 hover:bg-[#F8FAFF]'
                  }`}
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {slots.map((item, index) => (
                <div key={`slot-${index}`} className="flex items-center gap-3">
                  <div
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      const itemId = event.dataTransfer.getData('text/plain');
                      if (itemId) moveItemToSlot(itemId, index);
                      setDraggedItemId(null);
                    }}
                    className={`flex-1 min-h-[170px] rounded-2xl border-2 border-dashed p-4 transition-all ${
                      isSolved ? 'border-[#628ECB]/40 bg-white shadow-sm' : 'border-[#D5DEEF] bg-[#FBFCFF]'
                    }`}
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/45 mb-3">Langkah {index + 1}</p>
                    {item ? (
                      <div
                        draggable={isEditable}
                        onDragStart={(event) => {
                          event.dataTransfer.setData('text/plain', item.id);
                          setDraggedItemId(item.id);
                        }}
                        onDragEnd={() => setDraggedItemId(null)}
                        className={`rounded-2xl border-2 p-4 bg-white shadow-sm ${isSolved ? 'border-[#628ECB]/25' : draggedItemId === item.id ? 'border-[#628ECB]' : 'border-[#D5DEEF]'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl ${isSolved ? 'bg-[#EEF4FF]' : 'bg-[#F8FAFF]'}`}>
                            <GripVertical className={`w-4 h-4 ${isSolved ? 'text-[#628ECB]' : 'text-[#395886]/50'}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#395886]">{item.label}</p>
                            <p className="text-xs text-[#395886]/60 leading-relaxed mt-1">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-[116px] items-center justify-center rounded-xl bg-white/70 text-center text-xs font-bold text-[#395886]/35">
                        Letakkan komponen di sini
                      </div>
                    )}
                  </div>
                  {index < slots.length - 1 && (
                    <div className={`hidden md:block h-1 w-10 rounded-full ${isSolved ? 'bg-[#628ECB]/35' : 'bg-[#D5DEEF]'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {feedback === 'error' && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700">Urutan pipeline belum tepat.</p>
                <p className="text-xs text-red-600/90 mt-1">
                  Periksa lagi fondasi koneksi, pelacakan nomor urut, lalu mekanisme pemulihan error sebelum memvalidasi ulang. Sisa {MAX_ATTEMPTS - attempts} percobaan.
                </p>
              </div>
            </div>
          )}

          {feedback === 'locked' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-800">Percobaan pipeline sudah habis.</p>
                <p className="text-xs text-amber-700/90 mt-1 leading-relaxed">
                  Kamu telah memakai {MAX_ATTEMPTS} percobaan pada aktivitas ini. Jika ingin mencoba lagi dari awal, gunakan tombol mulai ulang agar jatah percobaan kembali ke 3.
                </p>
                <button
                  onClick={() => resetPipeline(true)}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Mulai Ulang 3 Percobaan
                </button>
              </div>
            </div>
          )}

          {isSolved && (
            <div className="rounded-xl border border-[#628ECB]/20 bg-[#EEF4FF] p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#628ECB] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-[#395886]">Sistem Keandalan TCP Utuh</p>
                <p className="text-xs text-[#395886]/75 mt-1 leading-relaxed">{pipeline.successMessage}</p>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={validatePipeline}
              disabled={!allPlaced || isSolved || isLocked}
              className={`px-8 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2 ${
                !allPlaced || isSolved || isLocked
                  ? 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'
                  : 'bg-[#395886] text-white hover:bg-[#2A4468] shadow-lg'
              }`}
            >
              Validasi Pipeline
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArguingPhase({
  initialText,
  onSave,
  disabled,
  question,
  isTcpReflection,
}: {
  initialText: string;
  onSave: (text: string) => void;
  disabled: boolean;
  question: string;
  isTcpReflection: boolean;
}) {
  const [text, setText] = useState(initialText);
  const [saved, setSaved] = useState(!!initialText);
  const minWords = 20;
  const wordCount = wordCountOf(text);
  const ready = wordCount >= minWords;
  const isLocked = disabled || saved;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="rounded-2xl border-2 border-[#8B5CF6]/20 shadow-sm overflow-hidden bg-white">
        <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#8B5CF6]/8 to-transparent border-b border-[#8B5CF6]/10">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#8B5CF6]/10">
            <MessageSquare className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#8B5CF6]/70">Kemampuan Berargumen</p>
            <p className="text-xs font-bold text-[#395886]">
              {isTcpReflection ? 'Analisis dampak jika fondasi koneksi dihilangkan' : 'Jelaskan argumenmu berdasarkan hasil refleksi'}
            </p>
          </div>
          {isLocked && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-full border border-[#10B981]/20">
              <LockKeyhole className="w-3 h-3" /> Tersimpan
            </span>
          )}
        </div>

        <div className="p-5">
          <div className="mb-3 rounded-xl bg-[#F8FAFF] border border-[#D5DEEF]/80 p-4">
            <p className="text-sm font-semibold text-[#395886] leading-relaxed text-justify">{question}</p>
          </div>

          {isTcpReflection && (
            <div className="mb-4 rounded-xl border border-[#8B5CF6]/12 bg-[#FAF7FF] p-4">
              <p className="text-xs text-[#395886]/70 leading-relaxed">
                Tunjukkan bahwa tanpa pembentukan koneksi yang valid, pelacakan nomor urut dan retransmission tidak punya dasar sinkronisasi yang benar.
              </p>
            </div>
          )}

          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            disabled={isLocked}
            rows={5}
            className={`w-full p-4 border-2 rounded-xl text-sm leading-relaxed outline-none transition-all resize-none ${
              isLocked
                ? 'border-[#10B981]/20 bg-[#ECFDF5] text-[#065F46] cursor-not-allowed'
                : 'border-[#D5DEEF] bg-white text-[#395886] focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/5'
            }`}
            placeholder="Tuliskan argumenmu di sini... (minimal 20 kata)"
          />

          <div className="mt-3 px-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 rounded-full bg-[#EEF2FF] overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${ready || isLocked ? 'bg-[#10B981]' : 'bg-[#8B5CF6]'}`}
                  style={{ width: `${Math.min(100, (wordCount / minWords) * 100)}%` }}
                />
              </div>
              <span className={`text-[10px] font-bold ${ready || isLocked ? 'text-[#10B981]' : 'text-[#395886]/40'}`}>
                {wordCount} / {minWords} kata{ready || isLocked ? ' ✓' : ''}
              </span>
            </div>
            {!isLocked && (
              <button
                onClick={() => {
                  if (!ready) return;
                  setSaved(true);
                  onSave(text.trim());
                }}
                disabled={!ready}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm ${
                  ready ? 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED]' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'
                }`}
              >
                Simpan Argumen <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {!isLocked && !ready && (
            <p className="text-[10px] text-[#395886]/40 font-medium mt-1 px-1">Minimal {minWords} kata untuk menyimpan argumen.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DropdownConclusionPhase({
  initialAnswers,
  initialEssay,
  onSave,
  disabled,
  definition,
}: {
  initialAnswers: Record<string, string>;
  initialEssay: string;
  onSave: (answers: Record<string, string>, summaryText: string, essayText: string) => void;
  disabled: boolean;
  definition: DropdownConclusion;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [essayText, setEssayText] = useState(initialEssay);
  const [saved, setSaved] = useState(Object.keys(initialAnswers).length > 0 && !!initialEssay);
  const minWords = 20;

  const allAnswered = definition.dropdowns.every((dropdown) => answers[dropdown.id]);
  const isCorrect = definition.dropdowns.every((dropdown) => {
    const option = dropdown.options.find((entry) => entry.value === answers[dropdown.id]);
    return option?.isCorrect === true;
  });
  const essayWordCount = wordCountOf(essayText);
  const essayReady = essayWordCount >= minWords;
  const isLocked = disabled || saved;

  const finalText = useMemo(() => {
    if (definition.templateParts.length !== definition.dropdowns.length + 1) return '';
    return definition.dropdowns.reduce((acc, dropdown, index) => {
      const option = dropdown.options.find((entry) => entry.value === answers[dropdown.id]);
      return `${acc}${definition.templateParts[index]}${option?.label || dropdown.placeholder}`;
    }, '') + definition.templateParts[definition.templateParts.length - 1];
  }, [answers, definition]);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="rounded-2xl border-2 border-[#10B981]/25 bg-gradient-to-br from-[#ECFDF5] to-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#10B981]/10 to-transparent border-b border-[#10B981]/15">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#10B981]/15">
            <Sparkles className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#10B981]/70">Penarikan Kesimpulan</p>
            <p className="text-xs font-bold text-[#065F46]">Lengkapi kesimpulan TCP yang benar</p>
          </div>
          {isLocked && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-full border border-[#10B981]/20">
              <LockKeyhole className="w-3 h-3" /> Tersimpan
            </span>
          )}
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-xl border border-[#10B981]/15 bg-white/80 p-4">
            <div className="flex items-start gap-2.5">
              <BookOpen className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#10B981] mb-1">Template Refleksi</p>
                <p className="text-sm font-semibold text-[#395886] leading-relaxed">{definition.instruction}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-[#D5DEEF] bg-white p-5">
            <div className="flex flex-wrap items-center gap-3 leading-relaxed">
              <span className="text-sm font-semibold text-[#395886]">{definition.templateParts[0]}</span>
              {definition.dropdowns.map((dropdown, index) => {
                const option = dropdown.options.find((entry) => entry.value === answers[dropdown.id]);
                return (
                  <React.Fragment key={dropdown.id}>
                    <select
                      value={answers[dropdown.id] || ''}
                      disabled={isLocked}
                      onChange={(event) => setAnswers((prev) => ({ ...prev, [dropdown.id]: event.target.value }))}
                      className={`min-w-[180px] rounded-xl border-2 px-3 py-2 text-sm font-bold outline-none ${
                        isLocked
                          ? option?.isCorrect
                            ? 'border-[#10B981]/20 bg-[#ECFDF5] text-[#065F46]'
                            : 'border-red-200 bg-red-50 text-red-700'
                          : 'border-[#D5DEEF] bg-white text-[#395886] focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/5'
                      }`}
                    >
                      <option value="">{dropdown.placeholder}</option>
                      {dropdown.options.map((entry) => (
                        <option key={entry.value} value={entry.value}>
                          {entry.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm font-semibold text-[#395886]">{definition.templateParts[index + 1]}</span>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {allAnswered && (
            <div className={`rounded-xl border p-4 ${isCorrect ? 'border-[#10B981]/20 bg-[#ECFDF5]' : 'border-red-200 bg-red-50'}`}>
              <p className={`text-sm font-bold ${isCorrect ? 'text-[#065F46]' : 'text-red-700'}`}>
                {isCorrect ? 'Kesimpulan valid dan lengkap.' : 'Masih ada pilihan yang belum tepat.'}
              </p>
              <p className={`text-xs mt-1 leading-relaxed ${isCorrect ? 'text-[#10B981]/80' : 'text-red-600/90'}`}>{finalText}</p>
            </div>
          )}

          {isCorrect && (
            <div className="rounded-2xl border-2 border-[#D5DEEF] bg-white p-5">
              <div className="mb-3 rounded-xl border border-[#D5DEEF]/80 bg-[#F8FAFF] p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#10B981] mb-1">Refleksi Esai</p>
                <p className="text-sm font-semibold text-[#395886] leading-relaxed text-justify">
                  Sekarang tuliskan kesimpulanmu sendiri dalam bentuk esai. Gunakan hasil dropdown tadi sebagai dasar,
                  lalu jelaskan bagaimana Three-Way Handshake, Sequence & ACK Number, dan Error Recovery bekerja sebagai
                  satu sistem keandalan TCP.
                </p>
              </div>

              <textarea
                value={essayText}
                onChange={(event) => setEssayText(event.target.value)}
                disabled={isLocked}
                rows={5}
                className={`w-full p-4 border-2 rounded-xl text-sm leading-relaxed outline-none transition-all resize-none ${
                  isLocked
                    ? 'border-[#10B981]/20 bg-[#ECFDF5] text-[#065F46] cursor-not-allowed'
                    : 'border-[#D5DEEF] bg-white text-[#395886] focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/5'
                }`}
                placeholder="Tuliskan kesimpulan esaimu di sini... (minimal 20 kata)"
              />

              <div className="mt-3 flex items-center gap-2 px-1">
                <div className="h-1.5 w-20 rounded-full bg-[#EEF2FF] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${essayReady || isLocked ? 'bg-[#10B981]' : 'bg-[#10B981]/40'}`}
                    style={{ width: `${Math.min(100, (essayWordCount / minWords) * 100)}%` }}
                  />
                </div>
                <span className={`text-[10px] font-bold ${essayReady || isLocked ? 'text-[#10B981]' : 'text-[#395886]/40'}`}>
                  {essayWordCount} / {minWords} kata{essayReady || isLocked ? ' ✓' : ''}
                </span>
              </div>

              {!isLocked && !essayReady && (
                <p className="text-[10px] text-[#395886]/40 font-medium mt-1 px-1">
                  Minimal {minWords} kata untuk menyimpan kesimpulan esai.
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => {
                if (!allAnswered || !isCorrect || !essayReady || isLocked) return;
                setSaved(true);
                onSave(answers, finalText, essayText.trim());
              }}
              disabled={!allAnswered || !isCorrect || !essayReady || isLocked}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm ${
                !allAnswered || !isCorrect || !essayReady || isLocked
                  ? 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'
                  : 'bg-[#10B981] text-white hover:bg-[#059669]'
              }`}
            >
              Simpan Kesimpulan <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FinalConclusionPhase({
  initialText,
  onSave,
  disabled,
  conclusionPrompt,
  atpBehavior,
}: {
  initialText: string;
  onSave: (text: string) => void;
  disabled: boolean;
  conclusionPrompt: string;
  atpBehavior: string;
}) {
  const [text, setText] = useState(initialText);
  const [saved, setSaved] = useState(!!initialText);
  const minWords = 20;
  const wordCount = wordCountOf(text);
  const ready = wordCount >= minWords;
  const isLocked = disabled || saved;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="rounded-2xl border-2 border-[#10B981]/25 bg-gradient-to-br from-[#ECFDF5] to-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#10B981]/10 to-transparent border-b border-[#10B981]/15">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#10B981]/15">
            <Sparkles className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#10B981]/70">Penarikan Kesimpulan</p>
            <p className="text-xs font-bold text-[#065F46]">Refleksi Akhir Pembelajaran</p>
          </div>
          {isLocked && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-full border border-[#10B981]/20">
              <LockKeyhole className="w-3 h-3" /> Tersimpan
            </span>
          )}
        </div>

        <div className="p-5">
          {atpBehavior && (
            <div className="mb-4 p-4 rounded-xl bg-[#F0FDF4] border border-[#10B981]/20">
              <div className="flex items-start gap-2.5">
                <BookOpen className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#10B981] mb-1">Tujuan Pembelajaran</p>
                  <p className="text-sm font-bold text-[#065F46] leading-relaxed">Saya {atpBehavior}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-3 p-4 rounded-xl bg-[#F8FAFF] border border-[#D5DEEF]/80">
            <p className="text-sm font-semibold text-[#395886] leading-relaxed text-justify">{conclusionPrompt}</p>
          </div>

          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            disabled={isLocked}
            rows={5}
            className={`w-full p-4 border-2 rounded-xl text-sm leading-relaxed outline-none transition-all resize-none ${
              isLocked
                ? 'border-[#10B981]/20 bg-[#ECFDF5] text-[#065F46] cursor-not-allowed'
                : 'border-[#D5DEEF] bg-white text-[#395886] focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/5'
            }`}
            placeholder="Tuliskan kesimpulan akhir pembelajaranmu di sini... (minimal 20 kata)"
          />

          <div className="mt-3 px-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 rounded-full bg-[#EEF2FF] overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${ready || isLocked ? 'bg-[#10B981]' : 'bg-[#10B981]/40'}`}
                  style={{ width: `${Math.min(100, (wordCount / minWords) * 100)}%` }}
                />
              </div>
              <span className={`text-[10px] font-bold ${ready || isLocked ? 'text-[#10B981]' : 'text-[#395886]/40'}`}>
                {wordCount} / {minWords} kata{ready || isLocked ? ' ✓' : ''}
              </span>
            </div>
            {!isLocked && (
              <button
                onClick={() => {
                  if (!ready) return;
                  setSaved(true);
                  onSave(text.trim());
                }}
                disabled={!ready}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm ${
                  ready ? 'bg-[#10B981] text-white hover:bg-[#059669]' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'
                }`}
              >
                Simpan Kesimpulan <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SelfEvaluationPhase({
  criteria,
  initialChecked,
  onSave,
  disabled,
}: {
  criteria: SelfEvalCriteria[];
  initialChecked: Record<string, boolean>;
  onSave: (checked: Record<string, boolean>) => void;
  disabled: boolean;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>(initialChecked);
  const [saved, setSaved] = useState(Object.keys(initialChecked).length > 0);
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="rounded-2xl border-2 border-[#F59E0B]/20 shadow-sm overflow-hidden bg-white">
        <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#F59E0B]/8 to-transparent border-b border-[#F59E0B]/10">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#F59E0B]/10">
            <CheckCircle className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#F59E0B]/70">Evaluasi Diri</p>
            <p className="text-xs font-bold text-[#395886]">Nilai Pemahamanmu Sendiri</p>
          </div>
          {saved && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-full border border-[#10B981]/20">
              <LockKeyhole className="w-3 h-3" /> Tersimpan
            </span>
          )}
        </div>

        <div className="p-5">
          <p className="text-sm text-[#395886]/70 mb-4">
            Centang pernyataan yang menurutmu benar-benar sudah kamu kuasai.
          </p>

          <div className="space-y-2 mb-4">
            {criteria.map((criterion) => (
              <button
                key={criterion.id}
                onClick={() => {
                  if (disabled || saved) return;
                  setChecked((prev) => ({ ...prev, [criterion.id]: !prev[criterion.id] }));
                }}
                disabled={disabled || saved}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                  checked[criterion.id]
                    ? 'border-[#10B981]/30 bg-[#ECFDF5]'
                    : saved
                      ? 'border-[#D5DEEF] bg-white opacity-60'
                      : 'border-[#D5DEEF] bg-white hover:border-[#F59E0B]/20 hover:bg-[#FFFBEB]'
                }`}
              >
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 mt-0.5 ${checked[criterion.id] ? 'bg-[#10B981] border-[#10B981]' : 'border-[#D5DEEF] bg-white'}`}>
                  {checked[criterion.id] && <CheckCircle className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
                <span className={`text-sm leading-relaxed ${checked[criterion.id] ? 'text-[#065F46] font-bold' : 'text-[#395886]/70'}`}>
                  {criterion.label}
                </span>
              </button>
            ))}
          </div>

          {!saved && (
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-[#395886]/40">{checkedCount} / {criteria.length} dicentang</span>
              <button
                onClick={() => {
                  setSaved(true);
                  onSave(checked);
                }}
                disabled={disabled}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm bg-[#F59E0B] text-white hover:bg-[#D97706]"
              >
                Simpan Evaluasi <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReflectionStage({
  lessonId,
  stageIndex,
  onComplete,
  isCompleted,
  conceptMapNodes,
  conceptMapConnections,
  conceptMapTitle,
  selfEvaluationCriteria,
  previousStageResults,
  conclusionPrompt,
  tcpReliabilityPipeline,
  reliabilityArguingQuestion,
  dropdownConclusion,
  onTrackerPhase,
}: ReflectionStageProps) {
  const tracker = useActivityTracker({ lessonId, stageIndex, stageType: 'reflection' });
  const hasEval = (selfEvaluationCriteria || []).length > 0;
  const totalPhases = hasEval ? 5 : 4;
  const ARGUING_PHASE = hasEval ? 3 : 2;
  const EVAL_PHASE = hasEval ? 2 : -1;
  const CONCLUSION_PHASE = hasEval ? 4 : 3;
  const isTcpReflection = Boolean(tcpReliabilityPipeline && dropdownConclusion);

  const [activePhase, setActivePhase] = useState(0);
  const [completedPhases, setCompletedPhases] = useState<Set<number>>(new Set());
  const [isRestored, setIsRestored] = useState(false);

  const [mapData, setMapData] = useState<any>(null);
  const [argumentText, setArgumentText] = useState('');
  const [evaluationData, setEvaluationData] = useState<Record<string, boolean>>({});
  const [conclusionText, setConclusionText] = useState('');
  const [dropdownAnswers, setDropdownAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!tracker.isLoading && tracker.session?.latestSnapshot && !isRestored) {
      const snapshot = tracker.session.latestSnapshot;
      if (snapshot.mapData) setMapData(snapshot.mapData);
      if (snapshot.argumentText) setArgumentText(snapshot.argumentText);
      if (snapshot.evaluationData) setEvaluationData(snapshot.evaluationData);
      if (snapshot.conclusionText) setConclusionText(snapshot.conclusionText);
      if (snapshot.dropdownAnswers) setDropdownAnswers(snapshot.dropdownAnswers);
      if (snapshot.completedPhases) {
        setCompletedPhases(new Set(snapshot.completedPhases));
        setActivePhase(snapshot.activePhase || 0);
      }
      setIsRestored(true);
      return;
    }

    if (!tracker.isLoading) setIsRestored(true);
  }, [isRestored, tracker.isLoading, tracker.session]);

  const saveCurrentSnapshot = useCallback(() => {
    void tracker.saveSnapshot(
      {
        mapData,
        argumentText,
        evaluationData,
        conclusionText,
        dropdownAnswers,
        completedPhases: Array.from(completedPhases),
        activePhase,
      },
      {
        progressPercent: getProgressPercent(completedPhases.size, totalPhases),
      },
    );
  }, [activePhase, argumentText, completedPhases, conclusionText, dropdownAnswers, evaluationData, mapData, totalPhases, tracker]);

  useEffect(() => {
    if (isRestored) saveCurrentSnapshot();
  }, [activePhase, argumentText, completedPhases, conclusionText, dropdownAnswers, evaluationData, isRestored, mapData, saveCurrentSnapshot]);

  useEffect(() => {
    if (!onTrackerPhase) return;
    onTrackerPhase(determineTrackerPhase(activePhase, completedPhases, ARGUING_PHASE, CONCLUSION_PHASE));
  }, [ARGUING_PHASE, CONCLUSION_PHASE, activePhase, completedPhases, onTrackerPhase]);

  const markPhaseComplete = useCallback((phaseIndex: number) => {
    setCompletedPhases((prev) => new Set([...prev, phaseIndex]));
  }, []);

  const advancePhase = () => {
    if (activePhase < CONCLUSION_PHASE) {
      setActivePhase((prev) => prev + 1);
    }
  };

  const handleMapDataChange = (data: any) => {
    setMapData(data);
    markPhaseComplete(1);
    void tracker.trackEvent('reflection_consistency_completed', {
      mode: data?.mode || 'concept-map',
      correctCount: data?.correctCount,
      total: data?.total || data?.totalConnections,
    }, {
      isCorrect: true,
      progressPercent: getProgressPercent(completedPhases.size + 1, totalPhases),
    });
  };

  const handleArgumentSave = (text: string) => {
    setArgumentText(text);
    markPhaseComplete(ARGUING_PHASE);
    void tracker.trackEvent('reflection_argument_saved', {
      wordCount: wordCountOf(text),
    }, {
      isCorrect: true,
      progressPercent: getProgressPercent(completedPhases.size + 1, totalPhases),
    });
  };

  const handleEvaluationSave = (checked: Record<string, boolean>) => {
    setEvaluationData(checked);
    markPhaseComplete(EVAL_PHASE);
  };

  const finishStage = (finalConclusionText: string, extraAnswer?: Record<string, any>) => {
    const nextCompleted = new Set([...completedPhases, CONCLUSION_PHASE]);
    const finalAnswer = {
      mapData,
      argumentText,
      evaluationData,
      dropdownAnswers,
      conclusionText: finalConclusionText,
      conclusion: finalConclusionText,
      completedPhases: Array.from(nextCompleted),
      ...extraAnswer,
    };

    setConclusionText(finalConclusionText);
    setCompletedPhases(nextCompleted);
    void tracker.complete(finalAnswer, {
      mapData,
      argumentText,
      evaluationData,
      dropdownAnswers,
      conclusionText: finalConclusionText,
      completedPhases: Array.from(nextCompleted),
      activePhase: CONCLUSION_PHASE,
    });
    onComplete(finalAnswer);
  };

  if (tracker.isLoading || !isRestored) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-10 h-10 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-[#395886]">Memuat progres...</p>
      </div>
    );
  }

  const nodes = conceptMapNodes || [];
  const connections = conceptMapConnections || [];
  const evalCriteria = selfEvaluationCriteria || [];
  const prevResults = previousStageResults || [];
  const arguingQuestion = reliabilityArguingQuestion || 'Tuliskan argumen reflektifmu berdasarkan aktivitas yang baru kamu selesaikan.';

  return (
    <div className="w-full space-y-6">
      <PhaseTracker current={activePhase} completed={completedPhases} hasEval={hasEval} />

      {activePhase === 0 && (
        <>
          <ReviewPreviousResults
            previousStageResults={prevResults}
            pipelineItems={tcpReliabilityPipeline?.items}
            activePhase={activePhase}
            completedPhases={completedPhases}
            arguingPhase={ARGUING_PHASE}
            conclusionPhase={CONCLUSION_PHASE}
          />
          <div className="flex justify-center mt-6">
            <button
              onClick={() => {
                markPhaseComplete(0);
                advancePhase();
              }}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#6366F1] text-white font-black text-sm shadow-lg hover:bg-[#4F46E5] active:scale-95 transition-all"
            >
              Lanjut ke TCP Blueprint Constructor
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {activePhase === 1 && (
        <>
          {isTcpReflection && tcpReliabilityPipeline ? (
            <TcpReliabilityPipelinePhase pipeline={tcpReliabilityPipeline} initialData={mapData} onSave={handleMapDataChange} />
          ) : (
            <ConceptMapPhase
              nodes={nodes}
              connections={connections}
              initialData={mapData}
              conceptMapTitle={conceptMapTitle}
              onMapDataChange={handleMapDataChange}
            />
          )}

          {completedPhases.has(1) && (
            <div className="flex justify-center mt-6">
              <button
                onClick={advancePhase}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#6366F1] text-white font-black text-sm shadow-lg hover:bg-[#4F46E5] active:scale-95 transition-all"
              >
                {hasEval ? 'Lanjut ke Evaluasi Diri' : 'Lanjut ke Argumen'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {activePhase === EVAL_PHASE && hasEval && (
        <>
          <SelfEvaluationPhase
            criteria={evalCriteria}
            initialChecked={evaluationData}
            onSave={handleEvaluationSave}
            disabled={Boolean(isCompleted)}
          />
          {completedPhases.has(EVAL_PHASE) && (
            <div className="flex justify-center mt-6">
              <button
                onClick={advancePhase}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#6366F1] text-white font-black text-sm shadow-lg hover:bg-[#4F46E5] active:scale-95 transition-all"
              >
                Lanjut ke Argumen
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {activePhase === ARGUING_PHASE && (
        <>
          <ArguingPhase
            initialText={argumentText}
            onSave={handleArgumentSave}
            disabled={Boolean(isCompleted)}
            question={arguingQuestion}
            isTcpReflection={isTcpReflection}
          />
          {completedPhases.has(ARGUING_PHASE) && (
            <div className="flex justify-center mt-6">
              <button
                onClick={advancePhase}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#6366F1] text-white font-black text-sm shadow-lg hover:bg-[#4F46E5] active:scale-95 transition-all"
              >
                Lanjut ke Kesimpulan
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {activePhase === CONCLUSION_PHASE && (
        <>
          {isTcpReflection && dropdownConclusion ? (
            <DropdownConclusionPhase
              initialAnswers={dropdownAnswers}
              initialEssay={conclusionText}
              onSave={(answers, _summaryText, essayText) => {
                setDropdownAnswers(answers);
                finishStage(essayText, { dropdownAnswers: answers });
              }}
              disabled={Boolean(isCompleted)}
              definition={dropdownConclusion}
            />
          ) : (
            <FinalConclusionPhase
              initialText={conclusionText}
              onSave={(text) => finishStage(text)}
              disabled={Boolean(isCompleted)}
              conclusionPrompt={conclusionPrompt || 'Berdasarkan seluruh aktivitas yang telah kamu lakukan pada pertemuan ini, tuliskan kesimpulan umum tentang materi yang telah dipelajari.'}
              atpBehavior="mampu menyimpulkan seluruh materi yang telah dipelajari dalam pertemuan ini"
            />
          )}
        </>
      )}
    </div>
  );
}
