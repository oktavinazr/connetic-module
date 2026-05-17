import React, { useState, useEffect, useRef } from 'react';
import {
  AlertCircle, CheckCircle, Info, XCircle, RotateCcw, ChevronRight,
  PenLine, Clock, LockKeyhole, ArrowRight, Trophy, Brain,
  ChevronDown, MessageSquare, Lightbulb as LightbulbIcon, Eye,
} from 'lucide-react';

// ── Animation class strings ───────────────────────────────────────────────────
export const anim = {
  fadeUp:   'animate-in fade-in slide-in-from-bottom-4 duration-500',
  fadeDown: 'animate-in fade-in slide-in-from-top-4 duration-400',
  fadeIn:   'animate-in fade-in duration-400',
  zoomIn:   'animate-in zoom-in-95 duration-300',
};

// ── AttemptBadge ──────────────────────────────────────────────────────────────
export function AttemptBadge({
  attempts, max = 3,
  colorClass = 'text-[#628ECB]',
  borderClass = 'border-[#628ECB]/20',
}: {
  attempts: number; max?: number;
  colorClass?: string; borderClass?: string;
}) {
  const exhausted = attempts >= max;
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold whitespace-nowrap shrink-0
      ${exhausted ? 'border-red-200 bg-red-50 text-red-500' : `${borderClass} bg-white ${colorClass}`}`}>
      <AlertCircle className="w-3 h-3" />
      {exhausted ? 'Habis' : `${max - attempts} percobaan`}
    </div>
  );
}

// ── FeedbackBanner ────────────────────────────────────────────────────────────
type FeedbackType = 'success' | 'error' | 'warning' | 'info';
const FB: Record<FeedbackType, { bg: string; border: string; text: string; ic: string; Icon: React.FC<any> }> = {
  success: { bg: 'bg-[#ECFDF5]', border: 'border-[#10B981]/30', text: 'text-[#065F46]', ic: 'text-[#10B981]', Icon: CheckCircle },
  error:   { bg: 'bg-red-50',    border: 'border-red-200',       text: 'text-red-800',   ic: 'text-red-500',  Icon: XCircle },
  warning: { bg: 'bg-amber-50',  border: 'border-amber-200',     text: 'text-amber-800', ic: 'text-amber-600',Icon: Info },
  info:    { bg: 'bg-[#EEF4FF]', border: 'border-[#628ECB]/20',  text: 'text-[#395886]', ic: 'text-[#628ECB]',Icon: Info },
};
export function FeedbackBanner({
  type, children, onRetry,
}: { type: FeedbackType; children: React.ReactNode; onRetry?: () => void }) {
  const c = FB[type]; const Icon = c.Icon;
  return (
    <div className={`p-4 rounded-xl border-2 animate-in fade-in duration-300 ${c.bg} ${c.border}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${c.ic}`} />
        <div className="flex-1">
          <div className={`text-sm font-bold leading-relaxed ${c.text}`}>{children}</div>
          {onRetry && (
            <button onClick={onRetry} className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition-colors">
              <RotateCcw className="w-3 h-3" /> Coba lagi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
export function ProgressBar({
  value, max, from = '#628ECB', to, className = '',
}: { value: number; max: number; from?: string; to?: string; className?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const done = value >= max && max > 0;
  const gFrom = done ? '#10B981' : from;
  const gTo   = done ? '#059669' : (to ?? from);
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-1.5 bg-[#EEF2FF] rounded-full overflow-hidden">
        <div className="h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg,${gFrom},${gTo})` }} />
      </div>
      <span className={`text-[10px] font-bold shrink-0 tabular-nums ${done ? 'text-[#10B981]' : 'text-[#395886]/50'}`}>
        {value}/{max}
      </span>
    </div>
  );
}

// ── StepTracker ───────────────────────────────────────────────────────────────
export function StepTracker({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-1 p-2.5 rounded-lg bg-white/70 backdrop-blur-sm border border-[#D5DEEF]/80 shadow-sm mb-5">
      {steps.map((label, idx) => {
        const done = idx < current; const active = idx === current;
        return (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center gap-0.5 shrink-0">
              <div className={`flex items-center justify-center w-7 h-7 rounded-xl text-[10px] font-black transition-all duration-300
                ${done ? 'bg-[#10B981] text-white' : active ? 'bg-[#395886] text-white scale-110 shadow-md' : 'bg-[#D5DEEF] text-[#395886]/40'}`}>
                {done ? '✓' : idx + 1}
              </div>
              <p className={`text-[8px] font-bold uppercase tracking-tight text-center leading-tight w-14 hidden sm:block
                ${active ? 'text-[#395886]' : 'text-[#395886]/30'}`}>{label}</p>
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-px flex-1 min-w-[8px] transition-colors duration-300 ${done ? 'bg-[#10B981]/50' : 'bg-[#D5DEEF]'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── ActivityCard ──────────────────────────────────────────────────────────────
export function ActivityCard({
  icon, label, title,
  headerBg, headerBorder, iconBg, labelCls,
  attempts, maxAttempts = 3, attemptCls, attemptBorderCls,
  children, bodyClass = 'p-5',
}: {
  icon: React.ReactNode; label: string; title: string;
  headerBg: string; headerBorder: string; iconBg: string; labelCls: string;
  attempts?: number; maxAttempts?: number; attemptCls?: string; attemptBorderCls?: string;
  children: React.ReactNode; bodyClass?: string;
}) {
  return (
    <div className="bg-white rounded-lg border-2 border-[#D5DEEF] shadow-sm overflow-hidden">
      <div className={`flex items-center gap-3 px-4 py-3 border-b border-[#D5DEEF]/60 ${headerBg}`}>
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${labelCls}`}>{label}</p>
          <h3 className="text-sm font-bold text-[#395886] leading-tight">{title}</h3>
        </div>
        {attempts !== undefined && (
          <AttemptBadge attempts={attempts} max={maxAttempts}
            colorClass={attemptCls ?? labelCls}
            borderClass={attemptBorderCls ?? headerBorder} />
        )}
      </div>
      <div className={bodyClass}>{children}</div>
    </div>
  );
}

// ── InstructionBox ────────────────────────────────────────────────────────────
export function InstructionBox({
  children, accent = 'text-[#628ECB]', className = '',
}: { children: React.ReactNode; accent?: string; className?: string }) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl bg-[#F8FAFF] border border-[#D5DEEF] ${className}`}>
      <Info className={`w-4 h-4 shrink-0 mt-0.5 ${accent}`} />
      <div className="text-sm text-[#395886]/80 leading-relaxed">{children}</div>
    </div>
  );
}

// ── UNIFIED EssayBox ──────────────────────────────────────────────────────────
// Standard essay/reflection box used across ALL CTL stages
// Default: 20 words minimum. Supports disabled (read-only), defaultValue (restore), locked mode.
export function EssayBox({
  prompt, objectiveLabel, submitLabel, onSubmit, minChars = 30, minWords = 20,
  disabled = false, defaultValue = '', locked = false,
  headerLabel = 'Refleksi Mandiri',
}: {
  prompt: string; objectiveLabel: string; submitLabel: string;
  onSubmit: (text: string) => void; minChars?: number; minWords?: number;
  disabled?: boolean; defaultValue?: string; locked?: boolean;
  headerLabel?: string;
}) {
  const [text, setText] = useState(defaultValue);
  const [submitted, setSubmitted] = useState(!!defaultValue && (disabled || locked));
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.trim().length;
  const useWords = minWords !== undefined && minWords > 0;
  const ready = useWords ? wordCount >= minWords : charCount >= minChars;
  const countLabel = useWords ? `${wordCount} / ${minWords} kata` : `${charCount} / ${minChars} karakter`;
  const isLocked = locked || disabled || (disabled && submitted);

  return (
    <div className="rounded-2xl border-2 border-[#628ECB]/20 shadow-sm overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#628ECB]/8 to-transparent border-b border-[#628ECB]/10">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#628ECB]/10">
          <PenLine className="w-4 h-4 text-[#628ECB]" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-left text-[10px] font-black uppercase tracking-widest text-[#628ECB]/60">
            {headerLabel} — {objectiveLabel}
          </p>
          <p className="text-left text-xs font-bold text-[#395886]">{headerLabel === 'Argumen Logis' ? 'Jelaskan alasan dan argumenmu' : 'Tulis pemahamanmu dengan kata-katamu sendiri'}</p>
        </div>
        {(isLocked || (!isLocked && submitted)) && (
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-full border border-[#10B981]/20">
            <LockKeyhole className="w-3 h-3" /> Tersimpan
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="mb-3 p-4 rounded-xl bg-[#F8FAFF] border border-[#D5DEEF]/80">
          <p className="text-sm font-semibold text-[#395886] leading-relaxed text-justify">{prompt}</p>
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={isLocked}
          rows={4}
          className={`w-full p-4 border-2 rounded-xl text-sm leading-relaxed outline-none transition-all resize-none
            ${isLocked
              ? 'border-[#10B981]/20 bg-[#ECFDF5] text-[#065F46] cursor-not-allowed'
              : 'border-[#D5DEEF] bg-white text-[#395886] focus:border-[#628ECB] focus:ring-4 focus:ring-[#628ECB]/5'}`}
          placeholder={`Tuliskan ${headerLabel === 'Argumen Logis' ? 'argumenmu' : 'jawabanmu'} di sini... (minimal ${minWords} kata)`}
        />

        {/* Stats bar */}
        <div className="mt-3 px-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-20 rounded-full bg-[#EEF2FF] overflow-hidden">
                <div className={`h-full transition-all duration-500 ${ready || isLocked ? 'bg-[#10B981]' : 'bg-[#628ECB]'}`}
                  style={{ width: `${Math.min(100, (useWords ? wordCount / minWords : charCount / minChars) * 100)}%` }} />
              </div>
              <span className={`text-[10px] font-bold ${ready || isLocked ? 'text-[#10B981]' : 'text-[#395886]/40'}`}>
                {countLabel}{ready || isLocked ? ' ✓' : ''}
              </span>
            </div>

            {!isLocked && !submitted && (
              <button
                onClick={() => { if (!ready) return; setSubmitted(true); onSubmit(text.trim()); }}
                disabled={!ready}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm
                  ${ready ? 'bg-[#628ECB] text-white hover:bg-[#395886]' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'}`}>
                {submitLabel} <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {!isLocked && !submitted && !ready && (
            <p className="text-[10px] text-[#395886]/40 font-medium">
              Minimal {minWords} kata untuk mengirim jawaban.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── ContinueActivityButton ────────────────────────────────────────────────────
// Shown after a sub-activity essay is saved, before advancing to the next sub-activity
export function ContinueActivityButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#10B981]/5 to-[#ECFDF5] border-2 border-[#10B981]/20 animate-in fade-in duration-500">
      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-[#10B981]" />
        <span className="text-sm font-bold text-[#10B981]">Jawaban berhasil disimpan!</span>
      </div>
      <button
        onClick={onClick}
        className="flex items-center gap-3 px-8 py-3 rounded-2xl bg-[#10B981] text-white font-black text-sm hover:bg-[#059669] shadow-xl shadow-[#10B981]/20 active:scale-95 transition-all"
      >
        {label} <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// ── Sticky Countdown Timer ────────────────────────────────────────────────────
export function CountdownTimer({
  seconds, onExpire, label, compact = false,
}: {
  seconds: number; onExpire?: () => void; label?: string; compact?: boolean;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onExpireRef.current?.();
      return;
    }
    const t = setInterval(() => setRemaining(r => {
      if (r <= 1) { clearInterval(t); onExpireRef.current?.(); return 0; }
      return r - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [remaining <= 0]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const urgent = remaining > 0 && remaining <= 60;
  const expired = remaining <= 0;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black transition-colors
        ${expired ? 'bg-red-100 text-red-600 border border-red-200' :
          urgent ? 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse' :
          'bg-[#628ECB]/8 text-[#628ECB] border border-[#628ECB]/20'}`}>
        <Clock className="w-3 h-3" />
        {expired ? 'Waktu Habis' : `${mins}:${String(secs).padStart(2, '0')}`}
      </div>
    );
  }

  return (
    <div className={`sticky top-[76px] z-40 flex items-center justify-between px-4 py-2.5 rounded-xl border-2 shadow-sm transition-colors
      ${expired ? 'bg-red-50 border-red-200' :
        urgent ? 'bg-amber-50 border-amber-200' :
        'bg-white border-[#D5DEEF]'}`}>
      <div className="flex items-center gap-2">
        <Clock className={`w-4 h-4 ${expired ? 'text-red-500' : urgent ? 'text-amber-600' : 'text-[#628ECB]'}`} />
        <span className={`text-[10px] font-black uppercase tracking-widest ${expired ? 'text-red-600' : 'text-[#395886]/50'}`}>
          {label || 'Waktu Tersisa'}
        </span>
      </div>
      <div className={`text-lg font-black tabular-nums ${expired ? 'text-red-600' : urgent ? 'text-amber-700' : 'text-[#395886]'}`}>
        {expired ? '00:00' : `${mins}:${String(secs).padStart(2, '0')}`}
      </div>
    </div>
  );
}

// ── Stage Completed Overlay ───────────────────────────────────────────────────
export function StageCompletedOverlay({
  stageName, onViewSummary,
}: { stageName: string; onViewSummary?: () => void }) {
  return (
    <div className="rounded-2xl border-2 border-[#10B981]/30 bg-gradient-to-br from-[#ECFDF5] to-white p-6 text-center space-y-4 shadow-sm">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#10B981]/10">
        <CheckCircle className="w-8 h-8 text-[#10B981]" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#10B981]">Tahap Selesai</p>
        <h3 className="text-lg font-black text-[#065F46] mt-1">{stageName} Telah Diselesaikan</h3>
        <p className="text-xs text-[#10B981]/70 mt-2 max-w-md mx-auto leading-relaxed">
          Aktivitas ini sudah tidak dapat diubah. Jawabanmu telah tersimpan dan dapat ditinjau kembali.
        </p>
      </div>
      {onViewSummary && (
        <button onClick={onViewSummary} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#10B981] text-white font-bold text-sm hover:bg-[#059669] transition-all shadow-md">
          <Eye className="w-4 h-4" /> Lihat Ringkasan Jawaban
        </button>
      )}
    </div>
  );
}
// ── ActivityGuideBox ──────────────────────────────────────────────────────────
// Always-visible activity guide placed between stage title and activity content.
// Each step is specific to the activity type (drag & drop, essay, discussion, etc.).
export function ActivityGuideBox({
  steps,
  accentColor = 'text-[#628ECB]',
  borderColor = 'border-[#628ECB]/25',
}: {
  steps: string[];
  accentColor?: string;
  borderColor?: string;
}) {
  const [isOpen, setIsOpen] = useState(true); // Default: open on first visit

  if (!steps || steps.length === 0) return null;
  return (
    <div className={`rounded-xl border ${borderColor} bg-[#F4F6FC] shadow-sm overflow-hidden`}>
      {/* Clickable header */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className={`w-full flex items-center gap-2.5 px-4 py-3 text-left ${accentColor} hover:bg-white/30 transition-colors`}
      >
        <Info className="w-4 h-4 shrink-0" />
        <span className="text-[11px] font-bold flex-1">Panduan Aktivitas</span>
        <span className="text-[10px] font-medium text-[#395886]/40 hidden sm:inline">
          {steps.length} langkah
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Collapsible content */}
      <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-3.5">
          <ol className="space-y-1.5">
            {steps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span
                  className={`flex shrink-0 items-center justify-center rounded-full text-[9px] font-black bg-white border ${borderColor} ${accentColor} mt-0.5`}
                  style={{ minWidth: '18px', height: '18px' }}
                >
                  {idx + 1}
                </span>
                <span className="text-[11px] font-medium text-[#395886]/80 leading-relaxed">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

// ── SectionDivider ────────────────────────────────────────────────────────────
export function SectionDivider({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 my-2">
      <div className="h-px flex-1 bg-gradient-to-r from-[#D5DEEF] to-transparent" />
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F8FAFF] border border-[#D5DEEF] text-[10px] font-black uppercase tracking-[0.2em] text-[#395886]/50 shrink-0">
        {icon && <span className="opacity-60">{icon}</span>}
        {label}
      </div>
      <div className="h-px flex-1 bg-gradient-to-l from-[#D5DEEF] to-transparent" />
    </div>
  );
}

// ── ATPConclusionBox ──────────────────────────────────────────────────────────
// Standardized conclusion box for ALL CTL stages.
// Forces students to connect their learning back to the ATP objective ("mampu" keyword).
// Implements the third logical thinking indicator: Penarikan Kesimpulan (Drawing Conclusions).
export function ATPConclusionBox({
  atpBehavior,
  objectiveCode,
  stageType,
  onSubmit,
  defaultValue = '',
  disabled = false,
}: {
  atpBehavior: string;
  objectiveCode: string;
  stageType?: string;
  onSubmit: (text: string) => void;
  defaultValue?: string;
  disabled?: boolean;
}) {
  const [text, setText] = useState(defaultValue);
  const [submitted, setSubmitted] = useState(!!defaultValue && disabled);
  const minWords = 15;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const ready = wordCount >= minWords;
  const isLocked = disabled || submitted;

  const stageLabels: Record<string, string> = {
    constructivism: 'Constructivism',
    inquiry: 'Inquiry',
    questioning: 'Questioning',
    'learning-community': 'Learning Community',
    modeling: 'Modeling',
    reflection: 'Reflection',
    'authentic-assessment': 'Authentic Assessment',
  };

  return (
    <div className="rounded-2xl border-2 border-[#10B981]/25 bg-gradient-to-br from-[#ECFDF5] to-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#10B981]/10 to-transparent border-b border-[#10B981]/15">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#10B981]/15">
          <CheckCircle className="w-4 h-4 text-[#10B981]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#10B981]/70">
            Penarikan Kesimpulan — {objectiveCode}
          </p>
          <p className="text-xs font-bold text-[#065F46]">
            {stageType ? stageLabels[stageType] + ': ' : ''}Buktikan Pemahamanmu
          </p>
        </div>
        {isLocked && (
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-full border border-[#10B981]/20">
            <LockKeyhole className="w-3 h-3" /> Tersimpan
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        {/* ATP Behavior prompt */}
        <div className="mb-4 p-4 rounded-xl bg-[#F0FDF4] border border-[#10B981]/20">
          <div className="flex items-start gap-2.5">
            <Trophy className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#10B981] mb-1">
                Tujuan Pembelajaran (ATP)
              </p>
              <p className="text-sm font-bold text-[#065F46] leading-relaxed">
                Saya {atpBehavior}
              </p>
            </div>
          </div>
        </div>

        {/* Instruction */}
        <div className="mb-3 flex items-start gap-2.5 p-3 rounded-lg bg-[#F8FAFF] border border-[#D5DEEF]">
          <Brain className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-[#395886] mb-1">Tunjukkan bahwa kamu telah mencapai tujuan pembelajaran ini:</p>
            <ol className="space-y-1">
              <li className="text-[10px] text-[#395886]/70 flex items-start gap-1.5">
                <span className="font-black text-[#8B5CF6]">1.</span>
                Jelaskan pemahamanmu berdasarkan aktivitas yang baru saja kamu lakukan.
              </li>
              <li className="text-[10px] text-[#395886]/70 flex items-start gap-1.5">
                <span className="font-black text-[#8B5CF6]">2.</span>
                Gunakan kata-katamu sendiri untuk membuktikan bahwa kamu benar-benar paham.
              </li>
              <li className="text-[10px] text-[#395886]/70 flex items-start gap-1.5">
                <span className="font-black text-[#8B5CF6]">3.</span>
                Hubungkan dengan aktivitas interaktif yang telah kamu selesaikan.
              </li>
            </ol>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={isLocked}
          rows={4}
          className={`w-full p-4 border-2 rounded-xl text-sm leading-relaxed outline-none transition-all resize-none
            ${isLocked
              ? 'border-[#10B981]/20 bg-[#ECFDF5] text-[#065F46] cursor-not-allowed'
              : 'border-[#D5DEEF] bg-white text-[#395886] focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/5'}`}
          placeholder={`Tuliskan kesimpulanmu di sini... (minimal ${minWords} kata)`}
        />

        {/* Stats bar */}
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
              onClick={() => { if (!ready) return; setSubmitted(true); onSubmit(text.trim()); }}
              disabled={!ready}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm
                ${ready ? 'bg-[#10B981] text-white hover:bg-[#059669]' : 'bg-[#D5DEEF] text-[#395886]/40 cursor-not-allowed'}`}
            >
              Simpan Kesimpulan <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {!isLocked && !ready && (
          <p className="text-[10px] text-[#395886]/40 font-medium mt-1 px-1">
            Minimal {minWords} kata untuk menyimpan kesimpulan.
          </p>
        )}
      </div>
    </div>
  );
}

// ── FormattedQuestion ─────────────────────────────────────────────────────────
// Renders question text with proper formatting:
// - Paragraphs separated by blank lines
// - Bullet points: lines starting with "- " or "* "
// - Numbered lists: lines starting with "1. " "2. " etc
// - Bold text: **text**

export function FormattedQuestion({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  if (!text) return null;

  const paragraphs = text.split(/\n\s*\n/);

  return (
    <div className={`space-y-3 ${className}`}>
      {paragraphs.map((paragraph, pIdx) => {
        const lines = paragraph.split('\n').filter(l => l.trim());
        if (lines.length === 0) return null;

        const isBulletList = lines.every(l => /^[-*•]\s/.test(l.trim()));
        const isNumberedList = lines.every(l => /^\d+[.)]\s/.test(l.trim()));

        if (isBulletList) {
          return (
            <ul key={pIdx} className="space-y-1.5 pl-0.5">
              {lines.map((line, lIdx) => {
                const cleaned = line.trim().replace(/^[-*•]\s*/, '');
                return (
                  <li key={lIdx} className="flex items-start gap-2.5 text-sm leading-relaxed">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#628ECB]" />
                    <span className="text-[#395886]" dangerouslySetInnerHTML={{ __html: renderBoldInline(cleaned) }} />
                  </li>
                );
              })}
            </ul>
          );
        }

        if (isNumberedList) {
          return (
            <ol key={pIdx} className="space-y-1.5 pl-0.5">
              {lines.map((line, lIdx) => {
                const cleaned = line.trim().replace(/^\d+[.)]\s*/, '');
                return (
                  <li key={lIdx} className="flex items-start gap-2.5 text-sm leading-relaxed">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#628ECB]/10 text-[11px] font-bold text-[#628ECB]">
                      {lIdx + 1}
                    </span>
                    <span className="text-[#395886]" dangerouslySetInnerHTML={{ __html: renderBoldInline(cleaned) }} />
                  </li>
                );
              })}
            </ol>
          );
        }

        return (
          <div key={pIdx} className="space-y-1.5">
            {lines.map((line, lIdx) => (
              <p
                key={lIdx}
                className="text-sm text-[#395886] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderBoldInline(line.trim()) }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function renderBoldInline(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#395886] font-extrabold">$1</strong>');
}

// ── LogicalThinkingTracker ────────────────────────────────────────────────────
// Shows 3 logical thinking indicators as a visual step progress bar.
// Auto-detects which indicator is active/done based on progressPercent.

interface TrackerStep {
  key: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const TRACKER_STEPS: TrackerStep[] = [
  {
    key: 'consistency',
    label: 'Keruntutan Berpikir',
    icon: <Brain className="w-4 h-4" />,
    description: 'Memahami & menyusun konsep',
  },
  {
    key: 'arguing',
    label: 'Kemampuan Berargumen',
    icon: <MessageSquare className="w-4 h-4" />,
    description: 'Menjelaskan alasan & argumen',
  },
  {
    key: 'conclusion',
    label: 'Penarikan Kesimpulan',
    icon: <LightbulbIcon className="w-4 h-4" />,
    description: 'Menyimpulkan hasil belajar',
  },
];

export function LogicalThinkingTracker({
  activePhase = 'consistency',
  isStageCompleted = false,
}: {
  activePhase?: 'consistency' | 'arguing' | 'conclusion';
  isStageCompleted?: boolean;
}) {
  const getStepStatus = (stepIndex: number): 'pending' | 'active' | 'done' => {
    if (isStageCompleted) return 'done';
    const phases: Record<string, number> = { consistency: 0, arguing: 1, conclusion: 2 };
    const currentIdx = phases[activePhase] ?? 0;
    if (stepIndex < currentIdx) return 'done';
    if (stepIndex === currentIdx) return 'active';
    return 'pending';
  };

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#D5DEEF]/60 shadow-sm">
      {TRACKER_STEPS.map((step, idx) => {
        const status = getStepStatus(idx);
        const isLast = idx === TRACKER_STEPS.length - 1;
        return (
          <div key={step.key} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${
              status === 'done' ? 'text-[#10B981]' : status === 'active' ? 'text-[#628ECB] bg-[#EEF4FF]' : 'text-[#395886]/25'
            }`}>
              {status === 'done' ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : status === 'active' ? (
                <div className="w-3.5 h-3.5 flex items-center justify-center">{step.icon}</div>
              ) : (
                <div className="w-3.5 h-3.5 flex items-center justify-center opacity-30">{step.icon}</div>
              )}
              <span className={`text-[10px] font-bold ${status === 'done' ? '' : status === 'active' ? '' : 'opacity-30'}`}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <span className={`text-[10px] ${status === 'done' ? 'text-[#10B981]/40' : 'text-[#D5DEEF]'}`}>›</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
