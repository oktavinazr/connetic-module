import React, { useState } from 'react';
import {
  AlertCircle, CheckCircle, Info, XCircle, RotateCcw, ChevronRight,
  PenLine,
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

// ── EssayBox ──────────────────────────────────────────────────────────────────
export function EssayBox({
  prompt, objectiveLabel, submitLabel, onSubmit, minChars = 30, accentColor = '#628ECB',
}: {
  prompt: string; objectiveLabel: string; submitLabel: string;
  onSubmit: (text: string) => void; minChars?: number; accentColor?: string;
}) {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const ready = text.trim().length >= minChars;
  return (
    <div className="rounded-lg border-2 border-[#628ECB]/20 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#628ECB]/8 border-b border-[#628ECB]/10">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#628ECB]/15">
          <PenLine className="w-4 h-4 text-[#628ECB]" />
        </div>
        <div className="flex-1">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#628ECB]">
            Esai Mandiri — {objectiveLabel}
          </p>
          <p className="text-xs font-bold text-[#395886]">Tulis pemahamanmu dengan kata-katamu sendiri</p>
        </div>
        {submitted && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" /> Tersimpan
          </span>
        )}
      </div>
      <div className="p-5 bg-white">
        <p className="text-sm font-semibold text-[#395886] leading-relaxed mb-3">{prompt}</p>
        <textarea
          value={text} onChange={e => setText(e.target.value)} disabled={submitted} rows={4}
          className="w-full p-3.5 border-2 border-[#D5DEEF] rounded-xl text-sm text-[#395886] focus:outline-none focus:border-[#628ECB] transition-all resize-none disabled:bg-[#F8FAFF] leading-relaxed"
          placeholder={`Tuliskan jawabanmu di sini... (minimal ${minChars} karakter)`}
        />
        <div className="flex items-center justify-between mt-2">
          <span className={`text-[10px] font-bold ${ready ? 'text-[#10B981]' : 'text-[#395886]/40'}`}>
            {text.trim().length} karakter{text.trim().length > 0 && text.trim().length < minChars ? ` (${minChars - text.trim().length} lagi)` : ''}
            {ready ? ' ✓' : ''}
          </span>
          {!submitted ? (
            <button onClick={() => { if (!ready) return; setSubmitted(true); onSubmit(text.trim()); }}
              disabled={!ready}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold text-xs transition-all active:scale-95
                ${ready ? 'bg-[#628ECB] text-white hover:bg-[#395886] shadow-sm' : 'bg-[#EEF2FF] text-[#395886]/30 cursor-not-allowed'}`}>
              {submitLabel} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-xs font-bold text-[#10B981]">Refleksi tersimpan ✓</span>
          )}
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
