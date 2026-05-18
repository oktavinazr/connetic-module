import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CheckCircle,
  ChevronRight,
  Lightbulb,
  ArrowRight,
  Brain,
  AlertCircle,
  PenLine,
  MessageSquare,
  Eye,
  BookOpen,
  Sparkles,
  Layers,
  LockKeyhole,
} from 'lucide-react';
import { useActivityTracker } from '../../hooks/useActivityTracker';

// -- Types ----------------------------------------------------------------------

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
}

// -- Color map ------------------------------------------------------------------

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; dot: string; line: string }> = {
  blue:    { bg: 'bg-[#EEF4FF]', border: 'border-[#628ECB]', text: 'text-[#395886]', dot: 'bg-[#628ECB]', line: '#628ECB' },
  green:   { bg: 'bg-[#ECFDF5]', border: 'border-[#10B981]', text: 'text-[#065F46]', dot: 'bg-[#10B981]', line: '#10B981' },
  purple:  { bg: 'bg-[#EDE9FE]', border: 'border-[#8B5CF6]', text: 'text-[#5B21B6]', dot: 'bg-[#8B5CF6]', line: '#8B5CF6' },
  amber:   { bg: 'bg-[#FFFBEB]', border: 'border-[#F59E0B]', text: 'text-[#78350F]', dot: 'bg-[#F59E0B]', line: '#F59E0B' },
  pink:    { bg: 'bg-[#FDF2F8]', border: 'border-[#EC4899]', text: 'text-[#831843]', dot: 'bg-[#EC4899]', line: '#EC4899' },
  indigo:  { bg: 'bg-[#EEF2FF]', border: 'border-[#6366F1]', text: 'text-[#3730A3]', dot: 'bg-[#6366F1]', line: '#6366F1' },
};

// -- Stage type label map -------------------------------------------------------

const STAGE_LABELS: Record<string, string> = {
  constructivism: 'Constructivism',
  inquiry: 'Inquiry',
  questioning: 'Questioning',
  'learning-community': 'Learning Community',
  modeling: 'Modeling',
  reflection: 'Reflection',
  'authentic-assessment': 'Authentic Assessment',
};

const STAGE_COLORS: Record<string, string> = {
  constructivism: '#628ECB',
  inquiry: '#10B981',
  questioning: '#8B5CF6',
  'learning-community': '#F59E0B',
  modeling: '#EC4899',
  reflection: '#6366F1',
  'authentic-assessment': '#8B5CF6',
};

// -- Step Tracker for Reflection phases -----------------------------------------

const REFLECTION_PHASES = [
  { key: 'review', label: 'Tinjau Hasil', icon: <Eye className="w-3.5 h-3.5" /> },
  { key: 'concept-map', label: 'Keruntutan Berpikir', icon: <Brain className="w-3.5 h-3.5" /> },
  { key: 'arguing', label: 'Kemampuan Berargumen', icon: <MessageSquare className="w-3.5 h-3.5" /> },
  { key: 'conclusion', label: 'Penarikan Kesimpulan', icon: <Sparkles className="w-3.5 h-3.5" /> },
];

function PhaseTracker({ current, completed }: { current: number; completed: Set<number> }) {
  return (
    <div className="flex items-center gap-1.5 mb-6 px-1">
      {REFLECTION_PHASES.map((phase, idx) => {
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
            {idx < REFLECTION_PHASES.length - 1 && (
              <div className={`h-px w-4 shrink-0 ${isDone ? 'bg-[#10B981]/40' : 'bg-[#D5DEEF]'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// -- Phase 0: Review Previous Stage Results -------------------------------------

function ReviewPreviousResults({ previousStageResults }: { previousStageResults: PreviousStageResult[] }) {
  const validResults = previousStageResults.filter(r => r.hasData);
  if (validResults.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6366F1]/10 mb-4">
          <Eye className="w-7 h-7 text-[#6366F1]/40" />
        </div>
        <p className="text-sm font-bold text-[#395886]/40">Belum ada hasil dari tahapan sebelumnya.</p>
        <p className="text-xs text-[#395886]/30 mt-1">Lanjutkan ke aktivitas berikutnya untuk mulai merefleksikan pembelajaran.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-[#EEF2FF] border border-[#6366F1]/15">
        <div className="flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-[#6366F1] shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#6366F1] mb-1">
              Rangkuman Pemahaman Sebelumnya
            </p>
            <p className="text-xs text-[#395886]/60 leading-relaxed">
              Berikut adalah kesimpulan yang telah kamu tulis di setiap tahapan CTL sebelumnya.
              Gunakan ini sebagai bahan untuk menyusun refleksi akhir pembelajaran.
            </p>
          </div>
        </div>
      </div>

      {validResults.map((result, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl border-2 border-[#D5DEEF] shadow-sm overflow-hidden transition-all hover:border-[#6366F1]/20"
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#D5DEEF]/60"
               style={{ backgroundColor: `${STAGE_COLORS[result.stageType] || '#628ECB'}08` }}>
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${STAGE_COLORS[result.stageType] || '#628ECB'}15` }}
            >
              <Layers className="w-3.5 h-3.5" style={{ color: STAGE_COLORS[result.stageType] || '#628ECB' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.2em]"
                 style={{ color: STAGE_COLORS[result.stageType] || '#628ECB' }}>
                {STAGE_LABELS[result.stageType] || result.stageType}
              </p>
              <p className="text-xs font-bold text-[#395886] truncate">
                {result.objectiveCode}: Kesimpulan Tahap {result.stageIndex + 1}
              </p>
            </div>
          </div>
          <div className="px-4 py-3.5">
            <p className="text-sm text-[#395886] leading-relaxed whitespace-pre-wrap text-justify">
              {result.conclusion || '(Tidak ada kesimpulan yang tersimpan)'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// -- Phase 1: Concept Map (Consistency of Thinking) -----------------------------

function ConceptMapPhase({
  nodes: rawNodes, connections: rawConnections, initialData, conceptMapTitle,
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

  const connections = rawConnections || [];
  const nodes = rawNodes || [];

  const allAnswered = connections.length > 0 && connections.every(c => answers[`${c.from}->${c.to}`] !== undefined);
  const correctCount = connections.filter(c => {
    const chosen = answers[`${c.from}->${c.to}`];
    return chosen === c.label;
  }).length;

  const handleValidate = () => {
    setValidated(true);
    const mapResult = { answers, correctCount, totalConnections: connections.length, nodes, connections, validated: true };
    onMapDataChange(mapResult);
  };

  // Predefined positions for nodes
  const nodePositions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    const cols = [1, 2, 3, 1, 2, 3, 1, 2];
    nodes.forEach((n, i) => {
      const col = cols[i % cols.length];
      const row = Math.floor(i / 3);
      pos[n.id] = { x: col * 110 - 55, y: row * 120 + 30 };
    });
    return pos;
  }, [nodes]);

  if (!nodes.length || !connections.length) {
    return (
      <div className="py-16 text-center text-[#395886]/30 font-black uppercase tracking-widest text-sm">
        Data peta konsep belum tersedia untuk pertemuan ini.
      </div>
    );
  }

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white rounded-lg border-2 border-[#D5DEEF] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 bg-[#6366F1]/5 border-b-2 border-[#6366F1]/10">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6366F1]/10">
            <Brain className="w-5 h-5 text-[#6366F1]" />
          </div>
          <div className="flex-1">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6366F1]">
              Keruntutan Berpikir — Peta Konsep
            </p>
            <h3 className="text-sm font-bold text-[#395886]">{conceptMapTitle || 'Hubungkan Antar Konsep'}</h3>
          </div>
          {validated && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-full">
              <CheckCircle className="w-3 h-3" /> Tervalidasi
            </span>
          )}
        </div>

        <div className="p-6">
          <p className="text-sm font-bold text-[#395886]/60 mb-6 max-w-xl italic">
            Pilih label penghubung yang tepat untuk setiap garis antara dua konsep di bawah ini.
            Aktivitas ini melatih keruntutan berpikir dalam memahami hubungan antar materi.
          </p>

          {/* Concept Map Canvas */}
          <div className="relative bg-[#F8FAFD] rounded-lg border-2 border-dashed border-[#D5DEEF] p-6 min-h-[420px] overflow-hidden mb-6">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {connections.map((conn, i) => {
                const fp = nodePositions[conn.from];
                const tp = nodePositions[conn.to];
                if (!fp || !tp) return null;
                const chosen = answers[`${conn.from}->${conn.to}`];
                const isCorrect = validated && chosen === conn.label;
                const isWrong = validated && chosen !== conn.label;
                const fromNode = nodes.find(n => n.id === conn.from);
                const color = COLOR_MAP[fromNode?.colorClass || 'blue'];
                const strokeColor = validated
                  ? (isCorrect ? '#10B981' : isWrong ? '#EF4444' : color.line)
                  : color.line;
                return (
                  <g key={i}>
                    <line x1={fp.x + 56} y1={fp.y + 24} x2={tp.x + 56} y2={tp.y + 24}
                      stroke={strokeColor} strokeWidth="2"
                      strokeDasharray={validated && isCorrect ? '0' : '4 3'}
                      className="transition-all duration-700" />
                    {chosen && (
                      <rect x={(fp.x + tp.x) / 2 + 56 - 40} y={(fp.y + tp.y) / 2 - 10}
                        width="80" height="20" rx="6"
                        fill={isCorrect ? '#ECFDF5' : isWrong ? '#FEF2F2' : '#F8FAFD'}
                        stroke={isCorrect ? '#10B981' : isWrong ? '#EF4444' : '#D5DEEF'} strokeWidth="1" />
                    )}
                    {chosen && (
                      <text x={(fp.x + tp.x) / 2 + 56} y={(fp.y + tp.y) / 2 + 4}
                        textAnchor="middle"
                        className={`text-[9px] font-black ${isCorrect ? 'fill-[#10B981]' : isWrong ? 'fill-[#EF4444]' : 'fill-[#395886]'}`}>
                        {chosen}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
            {nodes.map(node => {
              const pos = nodePositions[node.id];
              if (!pos) return null;
              const color = COLOR_MAP[node.colorClass || 'blue'];
              return (
                <div key={node.id}
                  className={`absolute flex flex-col items-center justify-center px-3 py-2.5 rounded-lg border-2 shadow-sm transition-all duration-300 ${color.bg} ${color.border} hover:shadow-md`}
                  style={{ left: pos.x, top: pos.y, width: 112, minHeight: 48 }}
                  title={node.description}>
                  <span className={`text-[10px] font-black leading-tight text-center ${color.text}`}>{node.label}</span>
                </div>
              );
            })}
          </div>

          {/* Connection Selectors */}
          <div className="grid gap-3">
            {connections.map((conn, i) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              const key = `${conn.from}->${conn.to}`;
              const chosen = answers[key];
              const isCorrect = validated && chosen === conn.label;
              const isWrong = validated && chosen && chosen !== conn.label;
              const color = COLOR_MAP[fromNode?.colorClass || 'blue'];
              return (
                <div key={i}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    validated
                      ? isCorrect ? 'border-[#10B981]/30 bg-[#ECFDF5]' : isWrong ? 'border-red-200 bg-red-50' : 'border-[#D5DEEF] bg-white'
                      : 'border-[#D5DEEF] bg-white hover:border-[#6366F1]/20'
                  }`}>
                  <div className="flex items-center gap-2 shrink-0 min-w-0">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${color.bg} ${color.text} border ${color.border} truncate`}>
                      {fromNode?.label || conn.from}
                    </span>
                    <ArrowRight className="w-3 h-3 text-[#395886]/30 shrink-0" />
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${COLOR_MAP[toNode?.colorClass || 'blue'].bg} ${COLOR_MAP[toNode?.colorClass || 'blue'].text} border ${COLOR_MAP[toNode?.colorClass || 'blue'].border} truncate`}>
                      {toNode?.label || conn.to}
                    </span>
                  </div>
                  <div className="h-px flex-1 bg-[#D5DEEF] min-w-[12px]" />
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    {conn.options.map(opt => (
                      <button key={opt} disabled={validated}
                        onClick={() => setAnswers(prev => ({ ...prev, [key]: opt }))}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold border-2 transition-all active:scale-95 whitespace-nowrap ${
                          chosen === opt
                            ? validated
                              ? (isCorrect ? 'bg-[#10B981] border-[#10B981] text-white' : 'bg-red-500 border-red-500 text-white')
                              : 'bg-[#6366F1] border-[#6366F1] text-white'
                            : 'bg-white border-[#D5DEEF] text-[#395886]/50 hover:border-[#6366F1]/30'
                        }`}>{opt}</button>
                    ))}
                  </div>
                  {validated && (
                    <span className="shrink-0">
                      {isCorrect ? <CheckCircle className="w-4 h-4 text-[#10B981]" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Validate button */}
      {!validated && (
        <div className="flex justify-center">
          <button
            onClick={handleValidate}
            disabled={!allAnswered}
            className={`px-8 py-3 rounded-xl font-black text-sm transition-all active:scale-95 flex items-center gap-2 ${
              allAnswered
                ? 'bg-[#395886] text-white hover:bg-[#2A4468] shadow-lg'
                : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'
            }`}>
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
              {correctCount}/{connections.length} koneksi tepat. Lanjutkan ke aktivitas berikutnya.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// -- Phase 2: Arguing Ability ---------------------------------------------------

function ArguingPhase({
  initialText, onSave, disabled,
}: {
  initialText: string;
  onSave: (text: string) => void;
  disabled: boolean;
}) {
  const [text, setText] = useState(initialText);
  const [saved, setSaved] = useState(!!initialText);
  const minWords = 20;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const ready = wordCount >= minWords;
  const isLocked = disabled || saved;

  const handleSave = () => {
    if (!ready || isLocked) return;
    setSaved(true);
    onSave(text.trim());
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="rounded-2xl border-2 border-[#8B5CF6]/20 shadow-sm overflow-hidden bg-white">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#8B5CF6]/8 to-transparent border-b border-[#8B5CF6]/10">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#8B5CF6]/10">
            <MessageSquare className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#8B5CF6]/70">
              Kemampuan Berargumen
            </p>
            <p className="text-xs font-bold text-[#395886]">
              Jelaskan Argumenmu Berdasarkan Peta Konsep
            </p>
          </div>
          {isLocked && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-full border border-[#10B981]/20">
              <LockKeyhole className="w-3 h-3" /> Tersimpan
            </span>
          )}
        </div>

        <div className="p-5">
          {/* Instruction */}
          <div className="mb-3 p-4 rounded-xl bg-[#F8FAFF] border border-[#D5DEEF]/80">
            <p className="text-sm font-semibold text-[#395886] leading-relaxed text-justify">
              Berdasarkan peta konsep yang telah kamu susun, jelaskan hubungan antar konsep, alasan penyusunan
              konsep, atau keterkaitan materi yang dipelajari. Tunjukkan bahwa kamu memahami bagaimana
              setiap konsep saling terhubung menjadi satu kesatuan yang utuh.
            </p>
          </div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
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
                <div className={`h-full transition-all duration-500 ${ready || isLocked ? 'bg-[#10B981]' : 'bg-[#8B5CF6]'}`}
                  style={{ width: `${Math.min(100, (wordCount / minWords) * 100)}%` }} />
              </div>
              <span className={`text-[10px] font-bold ${ready || isLocked ? 'text-[#10B981]' : 'text-[#395886]/40'}`}>
                {wordCount} / {minWords} kata{ready || isLocked ? ' ✓' : ''}
              </span>
            </div>
            {!isLocked && (
              <button onClick={handleSave} disabled={!ready}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm ${
                  ready ? 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED]' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'
                }`}>
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

// -- Phase 3: Final Conclusion (Drawing Conclusions) ----------------------------

function FinalConclusionPhase({
  initialText, onSave, disabled, conclusionPrompt, atpBehavior,
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
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const ready = wordCount >= minWords;
  const isLocked = disabled || saved;

  const handleSave = () => {
    if (!ready || isLocked) return;
    setSaved(true);
    onSave(text.trim());
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="rounded-2xl border-2 border-[#10B981]/25 bg-gradient-to-br from-[#ECFDF5] to-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#10B981]/10 to-transparent border-b border-[#10B981]/15">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#10B981]/15">
            <Sparkles className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#10B981]/70">
              Penarikan Kesimpulan
            </p>
            <p className="text-xs font-bold text-[#065F46]">
              Refleksi Akhir Pembelajaran
            </p>
          </div>
          {isLocked && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-full border border-[#10B981]/20">
              <LockKeyhole className="w-3 h-3" /> Tersimpan
            </span>
          )}
        </div>

        <div className="p-5">
          {/* ATP Behavior prompt */}
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
            <p className="text-sm font-semibold text-[#395886] leading-relaxed text-justify">
              {conclusionPrompt || 'Berdasarkan seluruh aktivitas yang telah kamu lakukan pada pertemuan ini, tuliskan kesimpulan umum tentang materi yang telah dipelajari. Gunakan kata-katamu sendiri dan hubungkan dengan hasil refleksi di tahap-tahap sebelumnya.'}
            </p>
          </div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
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
                <div className={`h-full transition-all duration-500 ${ready || isLocked ? 'bg-[#10B981]' : 'bg-[#10B981]/40'}`}
                  style={{ width: `${Math.min(100, (wordCount / minWords) * 100)}%` }} />
              </div>
              <span className={`text-[10px] font-bold ${ready || isLocked ? 'text-[#10B981]' : 'text-[#395886]/40'}`}>
                {wordCount} / {minWords} kata{ready || isLocked ? ' ✓' : ''}
              </span>
            </div>
            {!isLocked && (
              <button onClick={handleSave} disabled={!ready}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm ${
                  ready ? 'bg-[#10B981] text-white hover:bg-[#059669]' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'
                }`}>
                Simpan Kesimpulan <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {!isLocked && !ready && (
            <p className="text-[10px] text-[#395886]/40 font-medium mt-1 px-1">Minimal {minWords} kata untuk menyimpan kesimpulan.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// -- Self-Evaluation (integrated into Phase 3 flow) ----------------------------

function SelfEvaluationPhase({
  criteria, initialChecked, onSave, disabled,
}: {
  criteria: SelfEvalCriteria[];
  initialChecked: Record<string, boolean>;
  onSave: (checked: Record<string, boolean>) => void;
  disabled: boolean;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>(initialChecked);
  const [saved, setSaved] = useState(Object.keys(initialChecked).length > 0);

  const handleToggle = (id: string) => {
    if (disabled || saved) return;
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = () => {
    setSaved(true);
    onSave(checked);
  };

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const allChecked = checkedCount === criteria.length;

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
            Centang pernyataan yang menurutmu sudah benar-benar kamu kuasai. Evaluasi ini bersifat jujur untuk membantumu mengukur perkembangan belajar.
          </p>

          <div className="space-y-2 mb-4">
            {criteria.map(c => (
              <button
                key={c.id}
                onClick={() => handleToggle(c.id)}
                disabled={disabled || saved}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                  checked[c.id]
                    ? 'border-[#10B981]/30 bg-[#ECFDF5]'
                    : saved
                      ? 'border-[#D5DEEF] bg-white opacity-60'
                      : 'border-[#D5DEEF] bg-white hover:border-[#F59E0B]/20 hover:bg-[#FFFBEB]'
                }`}
              >
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all mt-0.5 ${
                  checked[c.id]
                    ? 'bg-[#10B981] border-[#10B981]'
                    : 'border-[#D5DEEF] bg-white'
                }`}>
                  {checked[c.id] && <CheckCircle className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
                <span className={`text-sm leading-relaxed ${checked[c.id] ? 'text-[#065F46] font-bold' : 'text-[#395886]/70'}`}>
                  {c.label}
                </span>
              </button>
            ))}
          </div>

          {!saved && (
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-[#395886]/40">
                {checkedCount} / {criteria.length} dicentang
              </span>
              <button onClick={handleSave}
                disabled={disabled}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm bg-[#F59E0B] text-white hover:bg-[#D97706]">
                Simpan Evaluasi <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -- Root Reflection Stage Component --------------------------------------------

export function ReflectionStage({
  lessonId, stageIndex, onComplete, isCompleted,
  conceptMapNodes, conceptMapConnections, conceptMapTitle,
  essayReflection, selfEvaluationCriteria, previousStageResults,
  conclusionPrompt,
}: ReflectionStageProps) {
  const tracker = useActivityTracker({ lessonId, stageIndex, stageType: 'reflection' });
  const [activePhase, setActivePhase] = useState(0);
  const [completedPhases, setCompletedPhases] = useState<Set<number>>(new Set());
  const [isRestored, setIsRestored] = useState(false);

  // Phase data
  const [mapData, setMapData] = useState<any>(null);
  const [argumentText, setArgumentText] = useState('');
  const [evaluationData, setEvaluationData] = useState<Record<string, boolean>>({});
  const [conclusionText, setConclusionText] = useState('');

  // Restore from snapshot
  useEffect(() => {
    if (!tracker.isLoading && tracker.session?.latestSnapshot && !isRestored) {
      const snap = tracker.session.latestSnapshot;
      if (snap.answers || snap.mapData) setMapData(snap.mapData || { answers: snap.answers, validated: snap.validated });
      if (snap.argumentText) setArgumentText(snap.argumentText);
      if (snap.evaluationData) setEvaluationData(snap.evaluationData);
      if (snap.conclusionText) setConclusionText(snap.conclusionText);
      if (snap.completedPhases) {
        setCompletedPhases(new Set(snap.completedPhases));
        setActivePhase(snap.activePhase || 0);
      }
      setIsRestored(true);
    } else if (!tracker.isLoading) {
      setIsRestored(true);
    }
  }, [tracker.isLoading, tracker.session, isRestored]);

  // Save snapshot on state changes
  const saveCurrentSnapshot = useCallback(() => {
    void tracker.saveSnapshot({
      mapData,
      argumentText,
      evaluationData,
      conclusionText,
      completedPhases: Array.from(completedPhases),
      activePhase,
    }, {
      progressPercent: completedPhases.size * 25,
    });
  }, [mapData, argumentText, evaluationData, conclusionText, completedPhases, activePhase, tracker]);

  useEffect(() => {
    if (isRestored) saveCurrentSnapshot();
  }, [isRestored, mapData, argumentText, evaluationData, conclusionText, completedPhases, activePhase]);

  const markPhaseComplete = (phaseIndex: number) => {
    setCompletedPhases(prev => new Set([...prev, phaseIndex]));
  };

  const handleMapDataChange = (data: any) => {
    setMapData(data);
    markPhaseComplete(1);
  };

  // Phase indices depend on whether evaluation criteria exist
  const hasEval = (selfEvaluationCriteria || []).length > 0;
  const ARGUING_PHASE = hasEval ? 3 : 2;
  const EVAL_PHASE = hasEval ? 2 : -1;
  const CONCLUSION_PHASE = hasEval ? 4 : 3;

  const handleArgumentSave = (text: string) => {
    setArgumentText(text);
    markPhaseComplete(ARGUING_PHASE);
  };

  const handleEvaluationSave = (checked: Record<string, boolean>) => {
    setEvaluationData(checked);
    markPhaseComplete(EVAL_PHASE);
  };

  const handleConclusionSave = (text: string) => {
    setConclusionText(text);
    markPhaseComplete(CONCLUSION_PHASE);
    const finalAnswer = {
      mapData,
      argumentText,
      evaluationData,
      conclusionText: text,
      completedPhases: Array.from(new Set([...completedPhases, CONCLUSION_PHASE])),
    };
    void tracker.trackEvent('reflection_completed', {
      mapCorrectCount: mapData?.correctCount,
      totalConnections: mapData?.totalConnections,
      evalCheckedCount: Object.values(evaluationData).filter(Boolean).length,
    }, { progressPercent: 100 });
    onComplete(finalAnswer);
  };

  const advancePhase = () => {
    if (activePhase < REFLECTION_PHASES.length - 1) {
      setActivePhase(prev => prev + 1);
    }
  };

  if (tracker.isLoading || !isRestored) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-10 h-10 border-3 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-[#395886]">Memuat progres...</p>
      </div>
    );
  }

  const nodes = conceptMapNodes || [];
  const connections = conceptMapConnections || [];
  const evalCriteria = selfEvaluationCriteria || [];
  const prevResults = previousStageResults || [];

  return (
    <div className="w-full space-y-6">
      {/* Phase Tracker */}
      <PhaseTracker current={activePhase} completed={completedPhases} />

      {/* Phase 0: Review Previous Results */}
      {activePhase === 0 && (
        <>
          <ReviewPreviousResults previousStageResults={prevResults} />
          <div className="flex justify-center mt-6">
            <button
              onClick={() => { markPhaseComplete(0); advancePhase(); }}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#6366F1] text-white font-black text-sm shadow-lg hover:bg-[#4F46E5] active:scale-95 transition-all"
            >
              Lanjut ke Peta Konsep
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {/* Phase 1: Concept Map (Consistency of Thinking) */}
      {activePhase === 1 && (
        <>
          <ConceptMapPhase
            nodes={nodes}
            connections={connections}
            initialData={mapData}
            conceptMapTitle={conceptMapTitle || 'Hubungkan Antar Konsep'}
            onMapDataChange={handleMapDataChange}
          />
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

      {/* Phase 2: Self-Evaluation */}
      {activePhase === EVAL_PHASE && hasEval && (
        <>
          <SelfEvaluationPhase
            criteria={evalCriteria}
            initialChecked={evaluationData}
            onSave={handleEvaluationSave}
            disabled={false}
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

      {/* Phase 2 or 3: Arguing Ability */}
      {activePhase === ARGUING_PHASE && (
        <>
          <ArguingPhase
            initialText={argumentText}
            onSave={handleArgumentSave}
            disabled={false}
          />
          {completedPhases.has(ARGUING_PHASE) && (
            <div className="flex justify-center mt-6">
              <button
                onClick={advancePhase}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#6366F1] text-white font-black text-sm shadow-lg hover:bg-[#4F46E5] active:scale-95 transition-all"
              >
                Lanjut ke Kesimpulan Akhir
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Phase 3 or 4: Final Conclusion */}
      {activePhase === CONCLUSION_PHASE && (
        <>
          <FinalConclusionPhase
            initialText={conclusionText}
            onSave={handleConclusionSave}
            disabled={false}
            conclusionPrompt={conclusionPrompt || 'Berdasarkan seluruh aktivitas yang telah kamu lakukan pada pertemuan ini, tuliskan kesimpulan umum tentang materi yang telah dipelajari.'}
            atpBehavior="mampu menyimpulkan seluruh materi yang telah dipelajari dalam pertemuan ini"
          />
        </>
      )}
    </div>
  );
}
