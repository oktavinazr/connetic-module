import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  CheckCircle,
  ChevronRight,
  Lightbulb,
  RotateCcw,
  ArrowRight,
  Brain,
  AlertCircle,
  GripVertical,
  Zap,
} from 'lucide-react';
import { getCurrentUser } from '../../utils/auth';
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

interface ReflectionStageProps {
  lessonId: string;
  stageIndex: number;
  moduleId: string;
  onComplete: (answer: any) => void;
  isCompleted?: boolean;
  conceptMapNodes?: ConceptMapNode[];
  conceptMapConnections?: ConceptMapConnection[];
  conceptMapTitle?: string;
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

const DEFAULT_COLOR = COLOR_MAP.blue;

// -- Concept Map Builder --------------------------------------------------------

function ConceptMapBuilder({
  lessonId, stageIndex, onComplete, nodes: rawNodes, connections: rawConnections, initialData, conceptMapTitle,
}: {
  lessonId: string; stageIndex: number; onComplete: (data: any) => void;
  nodes: ConceptMapNode[];
  connections: ConceptMapConnection[];
  initialData?: any;
  conceptMapTitle?: string;
}) {
  const tracker = useActivityTracker({ lessonId, stageIndex, stageType: 'reflection' });

  // Restore / init
  const [answers, setAnswers] = useState<Record<string, string>>(initialData?.answers || {});
  const [validated, setValidated] = useState(initialData?.validated || false);

  const connections = rawConnections || [];
  const nodes = rawNodes || [];

  const allAnswered = connections.length > 0 && connections.every(c => answers[`${c.from}->${c.to}`] !== undefined);
  const correctCount = connections.filter(c => {
    const chosen = answers[`${c.from}->${c.to}`];
    return chosen === c.label;
  }).length;

  useEffect(() => {
    void tracker.saveSnapshot(
      { answers, validated },
      { progressPercent: validated ? 95 : connections.length > 0 ? Math.min(80, 10 + Object.keys(answers).length * (70 / connections.length)) : 5 },
    );
  }, [answers, validated, connections.length, tracker]);

  const handleComplete = () => {
    setValidated(true);
    const finalAnswer = { answers, correctCount, totalConnections: connections.length, nodes, connections };
    void tracker.complete(finalAnswer, { answers, validated: true, finalAnswer });
    onComplete(finalAnswer);
  };

  // Predefined positions for nodes (top-to-bottom layout)
  const nodePositions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    const cols = [1, 2, 3, 1, 2, 3, 1, 2]; // zig-zag layout
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
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* Header — CTL style */}
      <div className="bg-white rounded-lg border-2 border-[#D5DEEF] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 bg-[#6366F1]/5 border-b-2 border-[#6366F1]/10">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6366F1]/10">
            <Brain className="w-5 h-5 text-[#6366F1]" />
          </div>
          <div className="flex-1">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6366F1]">Reflection — Concept Map</p>
            <h3 className="text-sm font-bold text-[#395886]">{conceptMapTitle || 'Hubungkan Antar Konsep TCP/IP'}</h3>
          </div>
          {validated && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-full">
              <CheckCircle className="w-3 h-3" /> Selesai
            </span>
          )}
        </div>

        <div className="p-6">
          <p className="text-sm font-bold text-[#395886]/60 mb-6 max-w-xl italic">
            Pilih label penghubung yang tepat untuk setiap garis antara dua konsep di bawah ini.
          </p>

          {/* Concept Map Canvas */}
          <div className="relative bg-[#F8FAFD] rounded-lg border-2 border-dashed border-[#D5DEEF] p-6 min-h-[420px] overflow-hidden mb-6">
            {/* SVG Lines */}
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
                    <line
                      x1={fp.x + 56} y1={fp.y + 24}
                      x2={tp.x + 56} y2={tp.y + 24}
                      stroke={strokeColor}
                      strokeWidth="2"
                      strokeDasharray={validated && isCorrect ? '0' : '4 3'}
                      className="transition-all duration-700"
                    />
                    {chosen && (
                      <rect
                        x={(fp.x + tp.x) / 2 + 56 - 40}
                        y={(fp.y + tp.y) / 2 - 10}
                        width="80" height="20" rx="6"
                        fill={isCorrect ? '#ECFDF5' : isWrong ? '#FEF2F2' : '#F8FAFD'}
                        stroke={isCorrect ? '#10B981' : isWrong ? '#EF4444' : '#D5DEEF'}
                        strokeWidth="1"
                      />
                    )}
                    {chosen && (
                      <text
                        x={(fp.x + tp.x) / 2 + 56}
                        y={(fp.y + tp.y) / 2 + 4}
                        textAnchor="middle"
                        className={`text-[9px] font-black ${isCorrect ? 'fill-[#10B981]' : isWrong ? 'fill-[#EF4444]' : 'fill-[#395886]'}`}
                      >
                        {chosen}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Nodes */}
            {nodes.map(node => {
              const pos = nodePositions[node.id];
              if (!pos) return null;
              const color = COLOR_MAP[node.colorClass || 'blue'];
              return (
                <div
                  key={node.id}
                  className={`absolute flex flex-col items-center justify-center px-3 py-2.5 rounded-lg border-2 shadow-sm transition-all duration-300 ${color.bg} ${color.border} hover:shadow-md`}
                  style={{ left: pos.x, top: pos.y, width: 112, minHeight: 48 }}
                  title={node.description}
                >
                  <span className={`text-[10px] font-black leading-tight text-center ${color.text}`}>
                    {node.label}
                  </span>
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
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    validated
                      ? isCorrect ? 'border-[#10B981]/30 bg-[#ECFDF5]' : isWrong ? 'border-red-200 bg-red-50' : 'border-[#D5DEEF] bg-white'
                      : 'border-[#D5DEEF] bg-white hover:border-[#6366F1]/20'
                  }`}
                >
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
                      <button
                        key={opt}
                        disabled={validated}
                        onClick={() => setAnswers(prev => ({ ...prev, [key]: opt }))}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold border-2 transition-all active:scale-95 whitespace-nowrap ${
                          chosen === opt
                            ? validated
                              ? (isCorrect ? 'bg-[#10B981] border-[#10B981] text-white' : 'bg-red-500 border-red-500 text-white')
                              : `bg-[#6366F1] border-[#6366F1] text-white`
                            : 'bg-white border-[#D5DEEF] text-[#395886]/50 hover:border-[#6366F1]/30'
                        }`}
                      >
                        {opt}
                      </button>
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

      {/* Footer */}
      <div className="bg-white rounded-lg border-2 border-[#D5DEEF] p-5 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-8 w-8 rounded-lg bg-[#6366F1]/10 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-[#6366F1]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#6366F1]">Refleksi Konsep</p>
            <p className="text-xs font-bold text-[#395886]/70">
              {validated
                ? `Kamu menjawab ${correctCount}/${connections.length} koneksi dengan tepat.`
                : `Hubungkan ${connections.length} pasangan konsep untuk menyelesaikan refleksi.`}
            </p>
          </div>
        </div>

        {!validated ? (
          <button
            onClick={handleComplete}
            disabled={!allAnswered}
            className={`w-full py-3.5 rounded-lg font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2 ${
              allAnswered
                ? 'bg-[#395886] text-white hover:bg-[#2A4468] shadow-lg'
                : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'
            }`}
          >
            {allAnswered ? 'Submit Aktivitas' : `Pilih ${connections.filter(c => answers[`${c.from}->${c.to}`] === undefined).length} label lagi`}
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 py-3 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 text-sm font-black text-[#065F46]">
            <CheckCircle className="w-4 h-4" /> Refleksi berhasil diselesaikan
          </div>
        )}
      </div>
    </div>
  );
}

// -- Root component ------------------------------------------------------------

export function ReflectionStage({
  lessonId, stageIndex, onComplete, isCompleted,
  conceptMapNodes, conceptMapConnections, conceptMapTitle,
}: ReflectionStageProps) {
  const tracker = useActivityTracker({ lessonId, stageIndex, stageType: 'reflection' });
  const [mapData, setMapData] = useState<any>(null);
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    if (!tracker.isLoading && tracker.session?.latestSnapshot && !isRestored) {
      const snap = tracker.session.latestSnapshot;
      if (snap.answers) setMapData({ answers: snap.answers, validated: snap.validated });
      setIsRestored(true);
    } else if (!tracker.isLoading) {
      setIsRestored(true);
    }
  }, [tracker.isLoading, tracker.session, isRestored]);

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

  return (
    <ConceptMapBuilder
      lessonId={lessonId}
      stageIndex={stageIndex}
      onComplete={(data) => {
        void tracker.trackEvent('reflection_map_completed', { correctCount: data.correctCount }, { progressPercent: 95 });
        onComplete(data);
      }}
      nodes={nodes}
      connections={connections}
      initialData={mapData}
      conceptMapTitle={conceptMapTitle}
    />
  );
}
