import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  CheckCircle,
  Edit2,
  FileText,
  HelpCircle,
  Lightbulb,
  MonitorPlay,
  Plus,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  Users,
  Video,
  X,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { lessons, type Stage, type TestQuestion } from '../../data/lessons';
import {
  getStageOverride,
  loadAllStageOverrides,
  saveStageOverride,
  resetStageOverride,
  hasStageOverride,
  getAdminTestQuestions,
  saveAdminTestQuestions,
  resetAdminTestQuestions,
  isTestOverridden,
  type StageOverride,
} from '../../utils/adminData';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

// ── CTL metadata ──────────────────────────────────────────────

export const CTL_META: Record<string, { label: string; icon: React.ReactNode; bg: string; text: string; border: string }> = {
  constructivism: { label: 'Constructivism', icon: <Video className="w-3.5 h-3.5" />, bg: 'bg-[#628ECB]/10', text: 'text-[#628ECB]', border: 'border-[#628ECB]/25' },
  inquiry: { label: 'Inquiry', icon: <Search className="w-3.5 h-3.5" />, bg: 'bg-[#10B981]/10', text: 'text-[#10B981]', border: 'border-[#10B981]/25' },
  questioning: { label: 'Questioning', icon: <HelpCircle className="w-3.5 h-3.5" />, bg: 'bg-[#8B5CF6]/10', text: 'text-[#8B5CF6]', border: 'border-[#8B5CF6]/25' },
  'learning-community': { label: 'Learning Community', icon: <Users className="w-3.5 h-3.5" />, bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/25' },
  modeling: { label: 'Modeling', icon: <MonitorPlay className="w-3.5 h-3.5" />, bg: 'bg-[#EC4899]/10', text: 'text-[#EC4899]', border: 'border-[#EC4899]/25' },
  reflection: { label: 'Reflection', icon: <Lightbulb className="w-3.5 h-3.5" />, bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
  'authentic-assessment': { label: 'Authentic Assessment', icon: <FileText className="w-3.5 h-3.5" />, bg: 'bg-[#6366F1]/10', text: 'text-[#6366F1]', border: 'border-[#6366F1]/25' },
};

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];
const uid = () => Math.random().toString(36).slice(2, 8);

// ── Helpers ───────────────────────────────────────────────────

function TextArea({ label, value, onChange, rows = 3, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#395886]/60 uppercase tracking-wide mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full border border-[#D5DEEF] rounded-xl px-4 py-2.5 text-sm text-[#395886] bg-[#F8FAFD] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30 focus:border-[#628ECB] resize-none"
      />
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#395886]/60 uppercase tracking-wide mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-[#D5DEEF] rounded-xl px-4 py-2.5 text-sm text-[#395886] bg-[#F8FAFD] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30 focus:border-[#628ECB]"
      />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold text-[#628ECB] uppercase tracking-widest mb-3 mt-5 first:mt-0">{children}</p>;
}

// ── Question CRUD widget (inline) ─────────────────────────────

interface QForm { question: string; options: string[]; correctAnswer: number }
const emptyQForm = (): QForm => ({ question: '', options: ['', '', '', ''], correctAnswer: 0 });

export function QuestionCRUD({ testKey, title, onUpdate }: { testKey: string; title: string; onUpdate?: () => void | Promise<void> }) {
  const [questions, setQs] = useState<TestQuestion[]>([]);
  const [overridden, setOverridden] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [form, setForm] = useState<QForm>(emptyQForm());
  const [delIdx, setDelIdx] = useState<number | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);

  async function refresh() {
    const [qs, ov] = await Promise.all([
      getAdminTestQuestions(testKey),
      isTestOverridden(testKey),
    ]);
    setQs(qs);
    setOverridden(ov);
  }

  useEffect(() => { refresh(); }, [testKey]);

  function openAdd() { setForm(emptyQForm()); setEditIdx(-1); }
  function openEdit(i: number) {
    const q = questions[i];
    setForm({ question: q.question, options: [...q.options], correctAnswer: q.correctAnswer });
    setEditIdx(i);
  }
  function closeModal() { setEditIdx(null); }

  async function save() {
    if (!form.question.trim() || form.options.some(o => !o.trim())) return;
    const nq: TestQuestion = { question: form.question.trim(), options: form.options.map(o => o.trim()), correctAnswer: form.correctAnswer };
    const updated = [...questions];
    if (editIdx === -1) updated.push(nq);
    else if (editIdx !== null) updated[editIdx] = nq;
    await saveAdminTestQuestions(testKey, updated);
    await refresh();
    await onUpdate?.();
    closeModal();
  }

  async function confirmDel() {
    if (delIdx === null) return;
    await saveAdminTestQuestions(testKey, questions.filter((_, i) => i !== delIdx));
    setDelIdx(null);
    await refresh();
    await onUpdate?.();
  }

  async function handleReset() {
    await resetAdminTestQuestions(testKey);
    setResetConfirm(false);
    await refresh();
    await onUpdate?.();
  }

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold bg-[#628ECB]/10 text-[#628ECB] px-2.5 py-1 rounded-full border border-[#628ECB]/20">
            {questions.length} soal
          </span>
          {overridden && (
            <span className="text-xs font-bold bg-[#F59E0B]/10 text-[#F59E0B] px-2 py-1 rounded-full border border-[#F59E0B]/20 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Dimodifikasi
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {overridden && (
            <button onClick={() => setResetConfirm(true)} className="flex items-center gap-1 text-xs font-bold text-[#F59E0B] border border-[#F59E0B]/30 px-3 py-1.5 rounded-xl hover:bg-[#F59E0B]/5">
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          )}
          <button onClick={openAdd} className="flex items-center gap-1 text-xs font-bold text-white bg-[#628ECB] px-3 py-1.5 rounded-xl hover:bg-[#395886] shadow-sm">
            <Plus className="w-3 h-3" /> Tambah Soal
          </button>
        </div>
      </div>

      {/* Question list */}
      {questions.length === 0 ? (
        <div className="bg-[#F8FAFD] border border-[#D5DEEF] rounded-xl p-6 text-center">
          <p className="text-xs text-[#395886]/40">Belum ada soal. Klik "Tambah Soal".</p>
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((q, i) => (
            <div key={i} className="bg-white border border-[#D5DEEF] rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-[#628ECB]/10 text-[#628ECB] text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                    <p className="text-sm font-semibold text-[#395886] leading-snug">{q.question}</p>
                  </div>
                  <div className="mt-2 ml-7 space-y-1">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs ${
                        oi === q.correctAnswer ? 'bg-[#10B981]/10 text-[#10B981] font-semibold border border-[#10B981]/20' : 'bg-[#F8FAFD] text-[#395886]/60 border border-[#D5DEEF]'
                      }`}>
                        <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[9px] font-bold shrink-0">{OPTION_LABELS[oi]}</span>
                        <span className="flex-1">{opt}</span>
                        {oi === q.correctAnswer && <CheckCircle className="w-3 h-3 shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => openEdit(i)} className="text-xs font-bold text-[#628ECB] border border-[#628ECB]/30 px-2.5 py-1 rounded-lg hover:bg-[#628ECB]/5">
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button onClick={() => setDelIdx(i)} className="text-xs font-bold text-red-500 border border-red-200 px-2.5 py-1 rounded-lg hover:bg-red-50">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit modal */}
      {editIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-xl bg-white rounded-[2rem] border border-[#D5DEEF] shadow-2xl flex flex-col max-h-[92vh]">
            <div className="shrink-0 bg-gradient-to-r from-[#628ECB] to-[#395886] px-6 py-4 text-white flex items-center justify-between rounded-t-[2rem]">
              <div>
                <h3 className="font-bold">{editIdx === -1 ? 'Tambah Soal' : `Edit Soal ${editIdx + 1}`}</h3>
                <p className="text-white/70 text-xs mt-0.5">{title}</p>
              </div>
              <button onClick={closeModal}><X className="w-5 h-5 text-white/70 hover:text-white" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#395886]/60 uppercase tracking-wide mb-1.5">Pertanyaan</label>
                <textarea
                  value={form.question}
                  onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                  rows={3}
                  className="w-full border border-[#D5DEEF] rounded-xl px-4 py-2.5 text-sm text-[#395886] bg-[#F8FAFD] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30 focus:border-[#628ECB] resize-none"
                  placeholder="Tulis pertanyaan..."
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#395886]/60 uppercase tracking-wide">Pilihan Jawaban</label>
                  {form.options.length < 6 && (
                    <button onClick={() => setForm(f => ({ ...f, options: [...f.options, ''] }))} className="text-xs font-bold text-[#628ECB]">+ Opsi</button>
                  )}
                </div>
                <div className="space-y-2">
                  {form.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input type="radio" checked={form.correctAnswer === oi} onChange={() => setForm(f => ({ ...f, correctAnswer: oi }))} className="accent-[#628ECB] shrink-0" />
                      <span className="shrink-0 w-5 h-5 rounded-full bg-[#628ECB]/10 text-[#628ECB] text-[10px] font-bold flex items-center justify-center">{OPTION_LABELS[oi]}</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={e => { const o = [...form.options]; o[oi] = e.target.value; setForm(f => ({ ...f, options: o })); }}
                        className="flex-1 border border-[#D5DEEF] rounded-xl px-3 py-2 text-sm text-[#395886] bg-[#F8FAFD] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30"
                        placeholder={`Pilihan ${OPTION_LABELS[oi]}`}
                      />
                      {form.options.length > 2 && (
                        <button onClick={() => { const o = form.options.filter((_, i) => i !== oi); setForm(f => ({ ...f, options: o, correctAnswer: Math.min(f.correctAnswer, o.length - 1) })); }} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[#395886]/40 mt-1.5 italic">Pilih radio untuk menandai jawaban benar.</p>
              </div>
            </div>
            <div className="shrink-0 flex justify-end gap-2 border-t border-[#D5DEEF] px-5 py-3 bg-[#F8FAFD] rounded-b-[2rem]">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-bold text-[#395886] border border-[#D5DEEF] rounded-xl hover:bg-[#F0F3FA]">Batal</button>
              <button onClick={save} disabled={!form.question.trim() || form.options.some(o => !o.trim())} className="px-4 py-2 text-sm font-bold text-white bg-[#628ECB] rounded-xl hover:bg-[#395886] shadow-sm disabled:opacity-50">
                {editIdx === -1 ? 'Tambah' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={delIdx !== null} onOpenChange={() => setDelIdx(null)}>
        <AlertDialogContent className="border-[#D5DEEF] rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#395886] font-bold">Hapus Soal</AlertDialogTitle>
            <AlertDialogDescription className="text-[#395886]/60">Yakin ingin menghapus soal ke-{(delIdx ?? 0) + 1}?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-[#D5DEEF] text-[#395886] rounded-xl font-bold">Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 text-white rounded-xl font-bold" onClick={confirmDel}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={resetConfirm} onOpenChange={setResetConfirm}>
        <AlertDialogContent className="border-[#D5DEEF] rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#395886] font-bold">Reset ke Data Awal</AlertDialogTitle>
            <AlertDialogDescription className="text-[#395886]/60">Semua perubahan soal akan dikembalikan ke data asli.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-[#D5DEEF] text-[#395886] rounded-xl font-bold">Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-[#F59E0B] text-white rounded-xl font-bold" onClick={handleReset}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Stage Edit Modal ──────────────────────────────────────────

export function StageEditModal({
  stage,
  override,
  lessonId,
  stageIndex,
  onClose,
  onSaved,
}: {
  stage: Stage;
  override: StageOverride;
  lessonId: string;
  stageIndex: number;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [form, setForm] = useState<StageOverride>({ ...override });
  const meta = CTL_META[stage.type] ?? CTL_META.constructivism;

  function set<K extends keyof StageOverride>(key: K, value: StageOverride[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function save() {
    await saveStageOverride(lessonId, stageIndex, form);
    await onSaved();
    onClose();
  }

  async function reset() {
    await resetStageOverride(lessonId, stageIndex);
    await onSaved();
    onClose();
  }

  const isModified = hasStageOverride(lessonId, stageIndex);

  // ── Helpers for array editors ──

  function ArrayItemEditor<T extends Record<string, any>>({
    label, items, onChange, newItem, renderItem,
  }: {
    label: string;
    items: T[];
    onChange: (items: T[]) => void;
    newItem: () => T;
    renderItem: (item: T, idx: number, update: (updated: T) => void, remove: () => void) => React.ReactNode;
  }) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-[#395886]/60 uppercase tracking-wide">{label}</label>
          <button onClick={() => onChange([...items, newItem()])} className="text-xs font-bold text-[#628ECB] flex items-center gap-1 hover:text-[#395886]">
            <Plus className="w-3 h-3" /> Tambah
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item, i) => renderItem(
            item,
            i,
            (updated) => { const arr = [...items]; arr[i] = updated; onChange(arr); },
            () => onChange(items.filter((_, idx) => idx !== i))
          ))}
          {items.length === 0 && <p className="text-xs text-[#395886]/40 italic">Belum ada item.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-[2rem] border border-[#D5DEEF] shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className={`shrink-0 px-6 py-5 text-white rounded-t-[2rem] bg-gradient-to-r from-[#628ECB] to-[#395886]`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold mb-2 ${meta.bg} ${meta.text} ${meta.border} bg-opacity-20`}>
                {meta.icon} {meta.label}
              </div>
              <h3 className="text-lg font-bold leading-tight">{stage.title}</h3>
              <p className="text-white/70 text-xs mt-0.5">Pertemuan {lessonId} • Tahap {stageIndex + 1}</p>
            </div>
            <button onClick={onClose}><X className="w-5 h-5 text-white/70 hover:text-white" /></button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Basic fields */}
          <SectionLabel>Dasar</SectionLabel>
          <TextField label="Judul Tahap" value={form.title ?? stage.title} onChange={v => set('title', v)} />
          <TextArea label="Deskripsi" value={form.description ?? stage.description} onChange={v => set('description', v)} rows={2} />

          {/* ── Constructivism ── */}
          {stage.type === 'constructivism' && (
            <>
              <SectionLabel>Konten Constructivism</SectionLabel>
              <TextArea label="Apersepsi / Skenario Awal" value={form.apersepsi ?? stage.apersepsi ?? ''} onChange={v => set('apersepsi', v)} rows={3} placeholder="Narasi pembuka berbasis pengalaman siswa..." />
              <TextArea label="Pertanyaan" value={form.question ?? stage.question ?? ''} onChange={v => set('question', v)} rows={2} placeholder="Pertanyaan pilihan ganda..." />
              {/* Options */}
              <ArrayItemEditor
                label="Pilihan Jawaban"
                items={form.options ?? stage.options ?? []}
                onChange={v => set('options', v)}
                newItem={() => ({ id: uid(), text: '' })}
                renderItem={(item, i, update, remove) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={(form.correctAnswer ?? stage.correctAnswer) === item.id}
                      onChange={() => set('correctAnswer', item.id)}
                      className="accent-[#628ECB] shrink-0"
                      title="Jawaban benar"
                    />
                    <span className="text-xs font-bold text-[#628ECB] w-5 text-center">{OPTION_LABELS[i]}</span>
                    <input
                      type="text"
                      value={item.text}
                      onChange={e => update({ ...item, text: e.target.value })}
                      className="flex-1 border border-[#D5DEEF] rounded-xl px-3 py-2 text-sm text-[#395886] bg-[#F8FAFD] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30"
                      placeholder={`Pilihan ${OPTION_LABELS[i]}`}
                    />
                    <button onClick={remove} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              />
              <p className="text-[10px] text-[#395886]/40 italic">Pilih radio untuk menandai jawaban benar.</p>
              <div className="grid grid-cols-2 gap-3">
                <TextArea label="Umpan Balik — Benar" value={form.feedback?.correct ?? stage.feedback?.correct ?? ''} onChange={v => set('feedback', { correct: v, incorrect: form.feedback?.incorrect ?? stage.feedback?.incorrect ?? '' })} rows={2} />
                <TextArea label="Umpan Balik — Salah" value={form.feedback?.incorrect ?? stage.feedback?.incorrect ?? ''} onChange={v => set('feedback', { correct: form.feedback?.correct ?? stage.feedback?.correct ?? '', incorrect: v })} rows={2} />
              </div>
            </>
          )}

          {/* ── Inquiry ── */}
          {stage.type === 'inquiry' && (
            <>
              <SectionLabel>Konten Inquiry</SectionLabel>
              <ArrayItemEditor
                label="Bagian Eksplorasi (Konten Klik)"
                items={form.explorationSections ?? stage.explorationSections ?? []}
                onChange={v => set('explorationSections', v)}
                newItem={() => ({ id: uid(), title: '', content: '', example: '' })}
                renderItem={(item, i, update, remove) => (
                  <div key={i} className="bg-[#F8FAFD] border border-[#D5DEEF] rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#395886]/50">Bagian {i + 1}</span>
                      <button onClick={remove} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <input type="text" value={item.title} onChange={e => update({ ...item, title: e.target.value })} placeholder="Judul bagian" className="w-full border border-[#D5DEEF] rounded-lg px-3 py-2 text-sm text-[#395886] bg-white focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30" />
                    <textarea value={item.content} onChange={e => update({ ...item, content: e.target.value })} rows={2} placeholder="Isi konten..." className="w-full border border-[#D5DEEF] rounded-lg px-3 py-2 text-sm text-[#395886] bg-white focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30 resize-none" />
                    <input type="text" value={item.example ?? ''} onChange={e => update({ ...item, example: e.target.value })} placeholder="Contoh (opsional)" className="w-full border border-[#D5DEEF] rounded-lg px-3 py-2 text-sm text-[#395886] bg-white focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30" />
                  </div>
                )}
              />
              <ArrayItemEditor
                label="Item Drag-Drop (Pengelompokan)"
                items={form.groupItems ?? stage.groupItems ?? []}
                onChange={v => set('groupItems', v)}
                newItem={() => ({ id: uid(), text: '', correctGroup: stage.groups?.[0]?.id ?? '' })}
                renderItem={(item, i, update, remove) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="text" value={item.text} onChange={e => update({ ...item, text: e.target.value })} placeholder="Teks item" className="flex-1 border border-[#D5DEEF] rounded-xl px-3 py-2 text-sm text-[#395886] bg-[#F8FAFD] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30" />
                    <select value={item.correctGroup} onChange={e => update({ ...item, correctGroup: e.target.value })} className="border border-[#D5DEEF] rounded-xl px-3 py-2 text-sm text-[#395886] bg-[#F8FAFD] focus:outline-none">
                      {(stage.groups ?? []).map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                    </select>
                    <button onClick={remove} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              />
            </>
          )}

          {/* ── Questioning ── */}
          {stage.type === 'questioning' && (
            <>
              <SectionLabel>Konten Questioning</SectionLabel>
              <TextArea label="Pertanyaan Guru" value={form.teacherQuestion ?? stage.teacherQuestion ?? ''} onChange={v => set('teacherQuestion', v)} rows={2} />
              <TextArea label="Skenario Kontekstual" value={form.scenario ?? stage.scenario ?? ''} onChange={v => set('scenario', v)} rows={3} />
              <TextArea label="Pertanyaan 'Mengapa'" value={form.whyQuestion ?? stage.whyQuestion ?? ''} onChange={v => set('whyQuestion', v)} rows={2} />
              <TextField label="Petunjuk (Hint)" value={form.hint ?? stage.hint ?? ''} onChange={v => set('hint', v)} placeholder="Petunjuk opsional untuk siswa..." />
              <ArrayItemEditor
                label="Pilihan Alasan (dengan Umpan Balik)"
                items={form.reasonOptions ?? stage.reasonOptions ?? []}
                onChange={v => set('reasonOptions', v)}
                newItem={() => ({ id: uid(), text: '', isCorrect: false, feedback: '' })}
                renderItem={(item, i, update, remove) => (
                  <div key={i} className="bg-[#F8FAFD] border border-[#D5DEEF] rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input type="radio" checked={item.isCorrect} onChange={() => {
                          const all = (form.reasonOptions ?? stage.reasonOptions ?? []).map((r, ri) => ({ ...r, isCorrect: ri === i }));
                          set('reasonOptions', all);
                        }} className="accent-[#628ECB]" title="Jawaban benar" />
                        <span className="text-xs font-bold text-[#395886]/50">Opsi {i + 1} {item.isCorrect && '(Benar)'}</span>
                      </div>
                      <button onClick={remove} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <input type="text" value={item.text} onChange={e => update({ ...item, text: e.target.value })} placeholder="Teks pilihan..." className="w-full border border-[#D5DEEF] rounded-lg px-3 py-2 text-sm text-[#395886] bg-white focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30" />
                    <input type="text" value={item.feedback} onChange={e => update({ ...item, feedback: e.target.value })} placeholder="Umpan balik untuk pilihan ini..." className="w-full border border-[#D5DEEF] rounded-lg px-3 py-2 text-sm text-[#395886] bg-white focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30" />
                  </div>
                )}
              />
              <ArrayItemEditor
                label="Bank Pertanyaan Siswa"
                items={form.questionBank ?? stage.questionBank ?? []}
                onChange={v => set('questionBank', v)}
                newItem={() => ({ id: uid(), text: '', response: '' })}
                renderItem={(item, i, update, remove) => (
                  <div key={i} className="bg-[#F8FAFD] border border-[#D5DEEF] rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#395886]/50">Pertanyaan {i + 1}</span>
                      <button onClick={remove} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <input type="text" value={item.text} onChange={e => update({ ...item, text: e.target.value })} placeholder="Pertanyaan yang bisa diajukan siswa..." className="w-full border border-[#D5DEEF] rounded-lg px-3 py-2 text-sm text-[#395886] bg-white focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30" />
                    <textarea value={item.response} onChange={e => update({ ...item, response: e.target.value })} rows={2} placeholder="Respons otomatis media..." className="w-full border border-[#D5DEEF] rounded-lg px-3 py-2 text-sm text-[#395886] bg-white focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30 resize-none" />
                  </div>
                )}
              />
            </>
          )}

          {/* ── Learning Community ── */}
          {stage.type === 'learning-community' && (
            <>
              <SectionLabel>Konten Learning Community</SectionLabel>
              <ArrayItemEditor
                label="Pasangan Matching"
                items={form.matchingPairs ?? stage.matchingPairs ?? []}
                onChange={v => set('matchingPairs', v)}
                newItem={() => ({ left: '', right: '' })}
                renderItem={(item, i, update, remove) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="text" value={item.left} onChange={e => update({ ...item, left: e.target.value })} placeholder="Kiri" className="flex-1 border border-[#D5DEEF] rounded-xl px-3 py-2 text-sm text-[#395886] bg-[#F8FAFD] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30" />
                    <span className="text-[#395886]/40 text-xs font-bold">↔</span>
                    <input type="text" value={item.right} onChange={e => update({ ...item, right: e.target.value })} placeholder="Kanan" className="flex-1 border border-[#D5DEEF] rounded-xl px-3 py-2 text-sm text-[#395886] bg-[#F8FAFD] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30" />
                    <button onClick={remove} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              />
              {/* Case Scenario */}
              <SectionLabel>Studi Kasus</SectionLabel>
              <TextField label="Judul Studi Kasus" value={form.caseScenario?.title ?? stage.caseScenario?.title ?? ''} onChange={v => set('caseScenario', { ...(form.caseScenario ?? stage.caseScenario ?? { title: '', description: '', question: '', options: [] }), title: v })} />
              <TextArea label="Deskripsi Kasus" value={form.caseScenario?.description ?? stage.caseScenario?.description ?? ''} onChange={v => set('caseScenario', { ...(form.caseScenario ?? stage.caseScenario ?? { title: '', description: '', question: '', options: [] }), description: v })} rows={3} />
              <TextArea label="Pertanyaan Kasus" value={form.caseScenario?.question ?? stage.caseScenario?.question ?? ''} onChange={v => set('caseScenario', { ...(form.caseScenario ?? stage.caseScenario ?? { title: '', description: '', question: '', options: [] }), question: v })} rows={2} />
              <ArrayItemEditor
                label="Pilihan Jawaban Kasus"
                items={form.caseScenario?.options ?? stage.caseScenario?.options ?? []}
                onChange={opts => set('caseScenario', { ...(form.caseScenario ?? stage.caseScenario ?? { title: '', description: '', question: '' }), options: opts })}
                newItem={() => ({ id: uid(), text: '', isCorrect: false, feedback: '' })}
                renderItem={(item, i, update, remove) => (
                  <div key={i} className="bg-[#F8FAFD] border border-[#D5DEEF] rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={item.isCorrect} onChange={e => update({ ...item, isCorrect: e.target.checked })} className="accent-[#628ECB]" />
                        <span className="text-xs font-bold text-[#395886]/50">Opsi {i + 1} {item.isCorrect && '✓ Benar'}</span>
                      </div>
                      <button onClick={remove} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <input type="text" value={item.text} onChange={e => update({ ...item, text: e.target.value })} placeholder="Teks pilihan..." className="w-full border border-[#D5DEEF] rounded-lg px-3 py-2 text-sm text-[#395886] bg-white focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30" />
                    <input type="text" value={item.feedback} onChange={e => update({ ...item, feedback: e.target.value })} placeholder="Umpan balik..." className="w-full border border-[#D5DEEF] rounded-lg px-3 py-2 text-sm text-[#395886] bg-white focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30" />
                  </div>
                )}
              />
            </>
          )}

          {/* ── Modeling ── */}
          {stage.type === 'modeling' && (
            <>
              <SectionLabel>Langkah Pemodelan</SectionLabel>
              <ArrayItemEditor
                label="Langkah-langkah"
                items={form.steps ?? stage.steps ?? []}
                onChange={v => set('steps', v)}
                newItem={() => ({ id: uid(), title: '', description: '', visual: '' })}
                renderItem={(item, i, update, remove) => (
                  <div key={i} className="bg-[#F8FAFD] border border-[#D5DEEF] rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#395886]/50">Langkah {i + 1}</span>
                      <button onClick={remove} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={item.title} onChange={e => update({ ...item, title: e.target.value })} placeholder="Judul langkah" className="flex-1 border border-[#D5DEEF] rounded-lg px-3 py-2 text-sm text-[#395886] bg-white focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30" />
                      <input type="text" value={item.visual} onChange={e => update({ ...item, visual: e.target.value })} placeholder="Ikon/emoji" className="w-20 border border-[#D5DEEF] rounded-lg px-3 py-2 text-sm text-center text-[#395886] bg-white focus:outline-none" />
                    </div>
                    <textarea value={item.description} onChange={e => update({ ...item, description: e.target.value })} rows={2} placeholder="Deskripsi langkah..." className="w-full border border-[#D5DEEF] rounded-lg px-3 py-2 text-sm text-[#395886] bg-white focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30 resize-none" />
                  </div>
                )}
              />
              <ArrayItemEditor
                label="Item Pengurutan (Drag-Drop)"
                items={form.items ?? stage.items ?? []}
                onChange={v => set('items', v)}
                newItem={() => ({ id: uid(), text: '', order: (form.items ?? stage.items ?? []).length + 1 })}
                renderItem={(item, i, update, remove) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#628ECB]/10 text-[#628ECB] text-xs font-bold flex items-center justify-center">{item.order}</span>
                    <input type="text" value={item.text} onChange={e => update({ ...item, text: e.target.value })} placeholder="Teks item" className="flex-1 border border-[#D5DEEF] rounded-xl px-3 py-2 text-sm text-[#395886] bg-[#F8FAFD] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30" />
                    <button onClick={remove} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              />
            </>
          )}

          {/* ── Reflection ── */}
          {stage.type === 'reflection' && (
            <>
              <SectionLabel>Prompt Refleksi</SectionLabel>
              <ArrayItemEditor
                label="Pertanyaan Refleksi"
                items={(form.reflectionPrompts ?? stage.reflectionPrompts ?? []).map((p, i) => ({ id: String(i), text: p }))}
                onChange={arr => set('reflectionPrompts', arr.map(a => a.text))}
                newItem={() => ({ id: uid(), text: '' })}
                renderItem={(item, i, update, remove) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                    <input type="text" value={item.text} onChange={e => update({ ...item, text: e.target.value })} placeholder="Pertanyaan refleksi..." className="flex-1 border border-[#D5DEEF] rounded-xl px-3 py-2 text-sm text-[#395886] bg-[#F8FAFD] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30" />
                    <button onClick={remove} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              />
              {stage.essayReflection && (
                <>
                  <SectionLabel>Prompt Esai Refleksi</SectionLabel>
                  <TextField label="Ringkasan Materi" value={form.essayReflection?.materialSummaryPrompt ?? stage.essayReflection?.materialSummaryPrompt ?? ''} onChange={v => set('essayReflection', { ...(form.essayReflection ?? stage.essayReflection!), materialSummaryPrompt: v })} />
                  <TextField label="Bagian Mudah" value={form.essayReflection?.easyPartPrompt ?? stage.essayReflection?.easyPartPrompt ?? ''} onChange={v => set('essayReflection', { ...(form.essayReflection ?? stage.essayReflection!), easyPartPrompt: v })} />
                  <TextField label="Bagian Sulit" value={form.essayReflection?.hardPartPrompt ?? stage.essayReflection?.hardPartPrompt ?? ''} onChange={v => set('essayReflection', { ...(form.essayReflection ?? stage.essayReflection!), hardPartPrompt: v })} />
                </>
              )}
            </>
          )}

          {/* ── Authentic Assessment ── */}
          {stage.type === 'authentic-assessment' && (
            <>
              <SectionLabel>Skenario Bercabang</SectionLabel>
              <TextArea label="Konteks Skenario" value={form.branchingScenario?.context ?? stage.branchingScenario?.context ?? ''} onChange={v => set('branchingScenario', { ...(form.branchingScenario ?? (stage.branchingScenario ? { ...stage.branchingScenario } : { context: '', initialQuestion: '', choices: [], finalEvaluation: '' })), context: v })} rows={3} />
              <TextArea label="Pertanyaan Awal" value={form.branchingScenario?.initialQuestion ?? stage.branchingScenario?.initialQuestion ?? ''} onChange={v => set('branchingScenario', { ...(form.branchingScenario ?? (stage.branchingScenario ? { ...stage.branchingScenario } : { context: '', initialQuestion: '', choices: [], finalEvaluation: '' })), initialQuestion: v })} rows={2} />
              <ArrayItemEditor
                label="Pilihan/Cabang"
                items={form.branchingScenario?.choices ?? stage.branchingScenario?.choices?.map(c => ({ id: c.id, text: c.text, isOptimal: c.isOptimal, consequence: c.consequence })) ?? []}
                onChange={choices => set('branchingScenario', { ...(form.branchingScenario ?? (stage.branchingScenario ? { ...stage.branchingScenario } : { context: '', initialQuestion: '', choices: [], finalEvaluation: '' })), choices })}
                newItem={() => ({ id: uid(), text: '', isOptimal: false, consequence: '' })}
                renderItem={(item, i, update, remove) => (
                  <div key={i} className="bg-[#F8FAFD] border border-[#D5DEEF] rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={item.isOptimal} onChange={e => update({ ...item, isOptimal: e.target.checked })} className="accent-[#628ECB]" />
                        <span className="text-xs font-bold text-[#395886]/50">Pilihan {i + 1} {item.isOptimal && '(Optimal)'}</span>
                      </div>
                      <button onClick={remove} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <input type="text" value={item.text} onChange={e => update({ ...item, text: e.target.value })} placeholder="Teks pilihan..." className="w-full border border-[#D5DEEF] rounded-lg px-3 py-2 text-sm text-[#395886] bg-white focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30" />
                    <textarea value={item.consequence} onChange={e => update({ ...item, consequence: e.target.value })} rows={2} placeholder="Konsekuensi/dampak pilihan ini..." className="w-full border border-[#D5DEEF] rounded-lg px-3 py-2 text-sm text-[#395886] bg-white focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30 resize-none" />
                  </div>
                )}
              />
              <TextArea label="Evaluasi Akhir" value={form.branchingScenario?.finalEvaluation ?? stage.branchingScenario?.finalEvaluation ?? ''} onChange={v => set('branchingScenario', { ...(form.branchingScenario ?? (stage.branchingScenario ? { ...stage.branchingScenario } : { context: '', initialQuestion: '', choices: [], finalEvaluation: '' })), finalEvaluation: v })} rows={2} />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between border-t border-[#D5DEEF] px-6 py-4 bg-[#F8FAFD] rounded-b-[2rem]">
          {isModified ? (
            <button onClick={reset} className="flex items-center gap-1.5 text-sm font-bold text-[#F59E0B] hover:text-[#D97706]">
              <RefreshCw className="w-4 h-4" /> Reset ke Awal
            </button>
          ) : <div />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-[#395886] border border-[#D5DEEF] rounded-xl hover:bg-[#F0F3FA]">Batal</button>
            <button onClick={save} className="px-5 py-2.5 text-sm font-bold text-white bg-[#628ECB] rounded-xl hover:bg-[#395886] shadow-sm">Simpan</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────

export function ActivityManagementSection() {
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [expandedSub, setExpandedSub] = useState<Record<string, string | null>>({});
  const [editingStage, setEditingStage] = useState<{ lessonId: string; stageIndex: number } | null>(null);
  const [, forceUpdate] = useState(0);

  const [overrideMap, setOverrideMap] = useState<Record<string, boolean>>({});
  const [questionCountMap, setQuestionCountMap] = useState<Record<string, number>>({});

  const lessonList = Object.values(lessons);

  const refreshOverrides = useCallback(async () => {
    await loadAllStageOverrides();

    const keys: string[] = [];
    lessonList.forEach(l => {
      keys.push(`lesson_${l.id}_pretest`);
      keys.push(`lesson_${l.id}_posttest`);
    });

    const overrides: Record<string, boolean> = {};
    const counts: Record<string, number> = {};

    await Promise.all(keys.map(async key => {
      const [qs, overridden] = await Promise.all([
        getAdminTestQuestions(key),
        isTestOverridden(key)
      ]);
      overrides[key] = overridden;
      counts[key] = qs.length;
    }));

    setOverrideMap(overrides);
    setQuestionCountMap(counts);
  }, [lessonList]);

  useEffect(() => {
    refreshOverrides();
  }, [refreshOverrides]);

  function toggleSub(lessonId: string, sub: string) {
    setExpandedSub(prev => ({ ...prev, [lessonId]: prev[lessonId] === sub ? null : sub }));
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#628ECB] mb-1">Konten Pembelajaran</p>
        <h1 className="text-2xl font-bold text-[#395886]">Aktivitas Pembelajaran</h1>
        <p className="text-sm text-[#395886]/60 mt-1">
          Kelola soal dan interaktivitas setiap pertemuan — pre-test, tahapan CTL, dan post-test.
        </p>
      </div>

      {/* Lesson list */}
      <div className="space-y-4">
        {lessonList.map(lesson => {
          const isOpen = expandedLesson === lesson.id;
          const modCount = lesson.stages.filter((_, si) => hasStageOverride(lesson.id, si)).length;

          const preKey = `lesson_${lesson.id}_pretest`;
          const postKey = `lesson_${lesson.id}_posttest`;

          const preOverride = overrideMap[preKey] || false;
          const postOverride = overrideMap[postKey] || false;
          const totalMod = modCount + (preOverride ? 1 : 0) + (postOverride ? 1 : 0);

          return (
            <div key={lesson.id} className="bg-white border border-[#D5DEEF] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Lesson header */}
              <button
                onClick={() => setExpandedLesson(isOpen ? null : lesson.id)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#F8FAFD] transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#628ECB] to-[#395886] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    P{lesson.id}
                  </div>
                  <div>
                    <p className="font-bold text-[#395886]">{lesson.title}</p>
                    <p className="text-xs text-[#628ECB]">{lesson.topic}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {totalMod > 0 && (
                    <span className="hidden sm:flex items-center gap-1 text-xs font-bold bg-[#F59E0B]/10 text-[#F59E0B] px-2.5 py-1 rounded-full border border-[#F59E0B]/20">
                      <AlertCircle className="w-3 h-3" /> {totalMod} dimodifikasi
                    </span>
                  )}
                  <span className="hidden sm:block text-xs font-bold bg-[#628ECB]/10 text-[#628ECB] px-2.5 py-1 rounded-full border border-[#628ECB]/20">
                    {lesson.stages.length} tahap CTL
                  </span>
                  <ChevronDown className={`w-5 h-5 text-[#395886]/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="border-t border-[#D5DEEF] divide-y divide-[#D5DEEF]">

                  {/* ── Pre-Test ── */}
                  <div>
                    <button
                      onClick={() => toggleSub(lesson.id, 'pretest')}
                      className="w-full flex items-center justify-between px-6 py-3 bg-[#F8FAFD] hover:bg-[#F0F3FA] transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 px-2.5 py-1 rounded-full">Pre-Test</span>
                        <span className="text-sm font-semibold text-[#395886]">{questionCountMap[preKey] ?? 0} soal</span>
                        {preOverride && <span className="text-xs font-bold text-[#F59E0B] flex items-center gap-1"><AlertCircle className="w-3 h-3" />Dimodifikasi</span>}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-[#395886]/40 transition-transform ${expandedSub[lesson.id] === 'pretest' ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedSub[lesson.id] === 'pretest' && (
                      <div className="px-6 py-4">
                        <QuestionCRUD
                          testKey={preKey}
                          title={`Pre-Test ${lesson.title}`}
                          onUpdate={refreshOverrides}
                        />
                      </div>
                    )}
                  </div>

                  {/* ── CTL Stages ── */}
                  <div>
                    <button
                      onClick={() => toggleSub(lesson.id, 'stages')}
                      className="w-full flex items-center justify-between px-6 py-3 bg-[#F8FAFD] hover:bg-[#F0F3FA] transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold bg-[#628ECB]/10 text-[#628ECB] border border-[#628ECB]/20 px-2.5 py-1 rounded-full">Tahapan CTL</span>
                        <span className="text-sm font-semibold text-[#395886]">{lesson.stages.length} tahap</span>
                        {modCount > 0 && <span className="text-xs font-bold text-[#F59E0B] flex items-center gap-1"><AlertCircle className="w-3 h-3" />{modCount} dimodifikasi</span>}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-[#395886]/40 transition-transform ${expandedSub[lesson.id] === 'stages' ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedSub[lesson.id] === 'stages' && (
                      <div className="divide-y divide-[#D5DEEF]/50">
                        {lesson.stages.map((stage, si) => {
                          const override = getStageOverride(lesson.id, si);
                          const modified = hasStageOverride(lesson.id, si);
                          const meta = CTL_META[stage.type] ?? CTL_META.constructivism;
                          const displayTitle = override.title ?? stage.title;

                          return (
                            <div key={si} className="px-6 py-3.5 flex items-center gap-4">
                              <span className="text-xs font-bold text-[#395886]/30 w-5 text-center shrink-0">{si + 1}</span>
                              <div className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold ${meta.bg} ${meta.text} ${meta.border}`}>
                                {meta.icon}
                                <span className="hidden sm:block">{meta.label}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold text-sm text-[#395886] truncate">{displayTitle}</p>
                                  {modified && <span className="text-[10px] font-bold bg-[#F59E0B]/10 text-[#F59E0B] px-2 py-0.5 rounded-full border border-[#F59E0B]/20 shrink-0">Dimodifikasi</span>}
                                </div>
                              </div>
                              <button
                                onClick={() => setEditingStage({ lessonId: lesson.id, stageIndex: si })}
                                className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-[#628ECB] border border-[#628ECB]/30 px-3 py-1.5 rounded-xl hover:bg-[#628ECB]/5 transition-colors"
                              >
                                <Edit2 className="w-3 h-3" /> Edit
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* ── Post-Test ── */}
                  <div>
                    <button
                      onClick={() => toggleSub(lesson.id, 'posttest')}
                      className="w-full flex items-center justify-between px-6 py-3 bg-[#F8FAFD] hover:bg-[#F0F3FA] transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 px-2.5 py-1 rounded-full">Post-Test</span>
                        <span className="text-sm font-semibold text-[#395886]">{questionCountMap[postKey] ?? 0} soal</span>
                        {postOverride && <span className="text-xs font-bold text-[#F59E0B] flex items-center gap-1"><AlertCircle className="w-3 h-3" />Dimodifikasi</span>}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-[#395886]/40 transition-transform ${expandedSub[lesson.id] === 'posttest' ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedSub[lesson.id] === 'posttest' && (
                      <div className="px-6 py-4">
                        <QuestionCRUD
                          testKey={postKey}
                          title={`Post-Test ${lesson.title}`}
                          onUpdate={refreshOverrides}
                        />
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stage edit modal */}
      {editingStage && (() => {
        const lesson = lessons[editingStage.lessonId];
        const stage = lesson?.stages[editingStage.stageIndex];
        if (!lesson || !stage) return null;
        const override = getStageOverride(editingStage.lessonId, editingStage.stageIndex);
        return (
          <StageEditModal
            stage={stage}
            override={override}
            lessonId={editingStage.lessonId}
            stageIndex={editingStage.stageIndex}
            onClose={() => setEditingStage(null)}
            onSaved={async () => {
              await refreshOverrides();
              forceUpdate(v => v + 1);
            }}
          />
        );
      })()}
    </div>
  );
}
