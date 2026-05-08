import React, { useState, useEffect, useRef } from 'react';
import {
  AlertCircle, CheckCircle, Info, XCircle, RotateCcw, ChevronRight,
  PenLine, Clock, LockKeyhole, ChevronDown,
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
// Supports: disabled (read-only completed), defaultValue (restore saved), locked mode
export function EssayBox({
  prompt, objectiveLabel, submitLabel, onSubmit, minChars = 30, minWords,
  disabled = false, defaultValue = '', locked = false,
}: {
  prompt: string; objectiveLabel: string; submitLabel: string;
  onSubmit: (text: string) => void; minChars?: number; minWords?: number;
  disabled?: boolean; defaultValue?: string; locked?: boolean;
}) {
  const [text, setText] = useState(defaultValue);
  const [submitted, setSubmitted] = useState(!!defaultValue && (disabled || locked));
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.trim().length;
  const useWords = minWords !== undefined && minWords > 0;
  const ready = useWords ? wordCount >= minWords! : charCount >= minChars;
  const countLabel = useWords ? `${wordCount} / ${minWords} kata` : `${charCount} / ${minChars} karakter`;
  const isLocked = locked || disabled || (disabled && submitted);

  return (
    <div className="rounded-2xl border-2 border-[#628ECB]/20 shadow-sm overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#628ECB]/8 to-transparent border-b border-[#628ECB]/10">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#628ECB]/10">
          <PenLine className="w-4 h-4 text-[#628ECB]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]/60">
            Refleksi Mandiri — {objectiveLabel}
          </p>
          <p className="text-xs font-bold text-[#395886]">Tulis pemahamanmu dengan kata-katamu sendiri</p>
        </div>
        {isLocked && (
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-full border border-[#10B981]/20">
            <LockKeyhole className="w-3 h-3" /> Tersimpan
          </span>
        )}
        {!isLocked && submitted && (
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-full border border-[#10B981]/20">
            <CheckCircle className="w-3 h-3" /> Tersimpan
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="mb-3 p-4 rounded-xl bg-[#F8FAFF] border border-[#D5DEEF]/80">
          <p className="text-sm font-semibold text-[#395886] leading-relaxed">{prompt}</p>
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
          placeholder={`Tuliskan jawabanmu di sini... (${useWords ? `minimal ${minWords} kata` : `minimal ${minChars} karakter`})`}
        />

        {/* Stats bar */}
        <div className="flex items-center justify-between mt-3 px-1">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-20 rounded-full bg-[#EEF2FF] overflow-hidden">
              <div className={`h-full transition-all duration-500 ${ready || isLocked ? 'bg-[#10B981]' : 'bg-[#628ECB]'}`}
                style={{ width: `${Math.min(100, (useWords ? wordCount / minWords! : charCount / minChars) * 100)}%` }} />
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
      </div>
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

// Need Eye icon import
import { Eye } from 'lucide-react';

// ── ActivityGuideBox ──────────────────────────────────────────────────────────
// Collapsible activity guide placed between stage title and activity content.
// Default collapsed — keeps the initial view clean. Each step is specific to the
// activity type (drag & drop, essay, discussion, simulation, etc.).
export function ActivityGuideBox({
  steps,
  accentColor = 'text-[#628ECB]',
  borderColor = 'border-[#628ECB]/25',
  collapsed = true,
  onToggle,
}: {
  steps: string[];
  accentColor?: string;
  borderColor?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  if (!steps || steps.length === 0) return null;
  return (
    <div className={`rounded-xl border ${borderColor} bg-[#F4F6FC] shadow-sm overflow-hidden transition-all duration-300`}>
      {/* Toggle header */}
      <button
        onClick={onToggle}
        className={`flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-[#EEF1F8] ${accentColor}`}
      >
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 shrink-0" />
          <span className="text-[11px] font-bold">
            {collapsed ? 'Lihat Panduan' : 'Sembunyikan Panduan'}
          </span>
          {collapsed && (
            <span className="text-[10px] font-medium text-[#395886]/40 hidden sm:inline">
              — {steps.length} langkah
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`}
        />
      </button>

      {/* Collapsible content */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          collapsed ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
        }`}
      >
        <div className="overflow-hidden">
          <ol className="space-y-1.5 px-4 pb-3.5">
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
