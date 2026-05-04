import { useState, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  BookOpen,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react';
import { lessons, type TestQuestion } from '../../data/lessons';
import {
  getAdminTestQuestions,
  saveAdminTestQuestions,
  resetAdminTestQuestions,
  isTestOverridden,
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

type TestTab = 'global-pretest' | 'global-posttest' | 'per-lesson';
const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

function buildTestKey(tab: TestTab, lessonId: string, testType: 'pretest' | 'posttest'): string {
  if (tab === 'global-pretest') return 'global-pretest';
  if (tab === 'global-posttest') return 'global-posttest';
  return `lesson_${lessonId}_${testType}`;
}

function buildTestLabel(tab: TestTab, lessonTitle: string, testType: 'pretest' | 'posttest'): string {
  if (tab === 'global-pretest') return 'Pre-Test Umum';
  if (tab === 'global-posttest') return 'Post-Test Umum';
  return `${testType === 'pretest' ? 'Pre-Test' : 'Post-Test'} — ${lessonTitle}`;
}

interface FormState {
  question: string;
  options: string[];
  correctAnswer: number;
}

function emptyForm(): FormState {
  return { question: '', options: ['', '', '', ''], correctAnswer: 0 };
}

export function QuestionManagementSection() {
  const [testTab, setTestTab] = useState<TestTab>('global-pretest');
  const lessonList = Object.values(lessons);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(lessonList[0]?.id ?? '1');
  const [testType, setTestType] = useState<'pretest' | 'posttest'>('pretest');

  const currentKey = buildTestKey(testTab, selectedLessonId, testType);
  const selectedLesson = lessons[selectedLessonId];
  const currentLabel = buildTestLabel(testTab, selectedLesson?.title ?? '', testType);

  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [overridden, setOverridden] = useState(false);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    const [qs, overrideExists] = await Promise.all([
      getAdminTestQuestions(currentKey),
      isTestOverridden(currentKey),
    ]);
    setQuestions(qs);
    setOverridden(overrideExists);
  }

  useEffect(() => { refresh(); }, [currentKey]);

  function openAdd() {
    setForm(emptyForm());
    setFormErrors([]);
    setEditingIndex(-1);
  }

  function openEdit(index: number) {
    const q = questions[index];
    setForm({ question: q.question, options: [...q.options], correctAnswer: q.correctAnswer });
    setFormErrors([]);
    setEditingIndex(index);
  }

  function closeModal() {
    setEditingIndex(null);
    setFormErrors([]);
  }

  function validateForm(): string[] {
    const errors: string[] = [];
    if (!form.question.trim()) errors.push('Pertanyaan tidak boleh kosong.');
    if (form.options.some(o => !o.trim())) errors.push('Semua pilihan jawaban harus diisi.');
    if (form.correctAnswer < 0 || form.correctAnswer >= form.options.length) errors.push('Pilih jawaban yang benar.');
    return errors;
  }

  async function saveQuestion() {
    const errors = validateForm();
    if (errors.length > 0) { setFormErrors(errors); return; }
    const newQ: TestQuestion = {
      question: form.question.trim(),
      options: form.options.map(o => o.trim()),
      correctAnswer: form.correctAnswer,
    };
    const updated = [...questions];
    if (editingIndex === -1) {
      updated.push(newQ);
    } else if (editingIndex !== null && editingIndex >= 0) {
      updated[editingIndex] = newQ;
    }
    setSaving(true);
    await saveAdminTestQuestions(currentKey, updated);
    setSaving(false);
    await refresh();
    closeModal();
  }

  async function confirmDelete() {
    if (deleteIndex === null) return;
    const updated = questions.filter((_, i) => i !== deleteIndex);
    setSaving(true);
    await saveAdminTestQuestions(currentKey, updated);
    setSaving(false);
    setDeleteIndex(null);
    await refresh();
  }

  async function handleReset() {
    setSaving(true);
    await resetAdminTestQuestions(currentKey);
    setSaving(false);
    setResetConfirm(false);
    await refresh();
  }

  function addOption() {
    if (form.options.length < 6) {
      setForm(f => ({ ...f, options: [...f.options, ''] }));
    }
  }

  function removeOption(i: number) {
    if (form.options.length <= 2) return;
    const newOptions = form.options.filter((_, idx) => idx !== i);
    const newCorrect = form.correctAnswer >= newOptions.length ? newOptions.length - 1 : form.correctAnswer;
    setForm(f => ({ ...f, options: newOptions, correctAnswer: newCorrect }));
  }

  const tabItems: { id: TestTab; label: string }[] = [
    { id: 'global-pretest', label: 'Pre-Test Umum' },
    { id: 'global-posttest', label: 'Post-Test Umum' },
    { id: 'per-lesson', label: 'Per Pertemuan' },
  ];

  return (
    <div className="space-y-7">
      {/* Page header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#628ECB] mb-1">Evaluasi</p>
        <h1 className="text-2xl font-bold text-[#395886] tracking-tight">Manajemen Soal Pretest & Posttest</h1>
        <p className="text-sm text-[#395886]/60 mt-1">Kelola soal pilihan ganda pretest dan posttest secara terpisah dari aktivitas CTL yang bersifat read-only.</p>
      </div>

      {/* Test type tabs */}
      <div className="flex gap-1 bg-white border border-[#D5DEEF] rounded-2xl p-1 w-fit shadow-sm flex-wrap">
        {tabItems.map(t => (
          <button
            key={t.id}
            onClick={() => setTestTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              testTab === t.id
                ? 'bg-[#628ECB] text-white shadow-md'
                : 'text-[#395886]/60 hover:text-[#395886] hover:bg-[#F0F3FA]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Per-lesson selectors */}
      {testTab === 'per-lesson' && (
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={selectedLessonId}
            onChange={e => setSelectedLessonId(e.target.value)}
            className="border border-[#D5DEEF] rounded-xl px-4 py-2 text-sm text-[#395886] bg-white focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30 focus:border-[#628ECB] min-w-[220px]"
          >
            {lessonList.map(l => (
              <option key={l.id} value={l.id}>{l.title} — {l.topic}</option>
            ))}
          </select>
          <div className="flex gap-1 bg-white border border-[#D5DEEF] rounded-xl p-1">
            {(['pretest', 'posttest'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTestType(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  testType === t
                    ? 'bg-[#628ECB] text-white shadow-sm'
                    : 'text-[#395886]/60 hover:text-[#395886]'
                }`}
              >
                {t === 'pretest' ? 'Pre-Test' : 'Post-Test'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="font-bold text-[#395886]">{currentLabel}</h2>
          <span className="text-xs font-bold bg-[#628ECB]/10 text-[#628ECB] px-2.5 py-1 rounded-full border border-[#628ECB]/20">
            {questions.length} soal
          </span>
          {overridden && (
            <span className="text-xs font-bold bg-[#F59E0B]/10 text-[#F59E0B] px-2.5 py-1 rounded-full border border-[#F59E0B]/20 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Dimodifikasi
            </span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {overridden && (
            <button
              onClick={() => setResetConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#F59E0B] border border-[#F59E0B]/30 rounded-xl hover:bg-[#F59E0B]/5 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset ke Awal
            </button>
          )}
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#628ECB] rounded-xl hover:bg-[#395886] shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Soal
          </button>
        </div>
      </div>

      {/* Question list */}
      {questions.length === 0 ? (
        <div className="bg-white border border-[#D5DEEF] rounded-2xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-[#D5DEEF] mx-auto mb-3" />
          <p className="text-sm text-[#395886]/50 font-medium">Belum ada soal.</p>
          <p className="text-xs text-[#395886]/40 mt-1">Klik "Tambah Soal" untuk menambahkan soal baru.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={i} className="bg-white border border-[#D5DEEF] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-[#628ECB]/10 text-[#628ECB] text-sm font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm font-semibold text-[#395886] leading-relaxed">{q.question}</p>
                  </div>
                  <div className="mt-3 ml-10 space-y-1.5">
                    {q.options.map((opt, oi) => (
                      <div
                        key={oi}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
                          oi === q.correctAnswer
                            ? 'bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] font-semibold'
                            : 'bg-[#F8FAFD] text-[#395886]/70 border border-[#D5DEEF]'
                        }`}
                      >
                        <span className="shrink-0 w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">
                          {OPTION_LABELS[oi]}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {oi === q.correctAnswer && (
                          <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold">
                            <CheckCircle className="w-3 h-3" /> Benar
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(i)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#628ECB] border border-[#628ECB]/30 rounded-xl hover:bg-[#628ECB]/5 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteIndex(i)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {editingIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-2xl bg-white rounded-[2rem] border border-[#D5DEEF] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal header */}
            <div className="shrink-0 bg-gradient-to-r from-[#628ECB] to-[#395886] px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">
                    {editingIndex === -1 ? 'Tambah Soal Baru' : `Edit Soal ${editingIndex + 1}`}
                  </h3>
                  <p className="text-white/70 text-sm mt-0.5">{currentLabel}</p>
                </div>
                <button onClick={closeModal} className="text-white/70 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {formErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  {formErrors.map((e, i) => (
                    <p key={i} className="text-xs text-red-600 font-medium">{e}</p>
                  ))}
                </div>
              )}

              {/* Question text */}
              <div>
                <label className="block text-xs font-bold text-[#395886]/60 uppercase tracking-wide mb-1.5">
                  Pertanyaan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.question}
                  onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                  rows={3}
                  className="w-full border border-[#D5DEEF] rounded-xl px-4 py-3 text-sm text-[#395886] bg-[#F8FAFD] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30 focus:border-[#628ECB] resize-none"
                  placeholder="Tulis pertanyaan di sini..."
                />
              </div>

              {/* Options */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#395886]/60 uppercase tracking-wide">
                    Pilihan Jawaban <span className="text-red-500">*</span>
                  </label>
                  {form.options.length < 6 && (
                    <button
                      onClick={addOption}
                      className="text-xs font-bold text-[#628ECB] hover:text-[#395886] transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Tambah Opsi
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {form.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={form.correctAnswer === oi}
                        onChange={() => setForm(f => ({ ...f, correctAnswer: oi }))}
                        className="w-4 h-4 accent-[#628ECB] shrink-0"
                        title="Tandai sebagai jawaban benar"
                      />
                      <span className="shrink-0 w-6 h-6 rounded-full bg-[#628ECB]/10 text-[#628ECB] text-xs font-bold flex items-center justify-center">
                        {OPTION_LABELS[oi]}
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={e => {
                          const newOptions = [...form.options];
                          newOptions[oi] = e.target.value;
                          setForm(f => ({ ...f, options: newOptions }));
                        }}
                        className="flex-1 border border-[#D5DEEF] rounded-xl px-3 py-2 text-sm text-[#395886] bg-[#F8FAFD] focus:outline-none focus:ring-2 focus:ring-[#628ECB]/30 focus:border-[#628ECB]"
                        placeholder={`Pilihan ${OPTION_LABELS[oi]}`}
                      />
                      {form.options.length > 2 && (
                        <button
                          onClick={() => removeOption(oi)}
                          className="shrink-0 text-red-400 hover:text-red-600 transition-colors"
                          title="Hapus opsi ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#395886]/40 mt-2 italic">
                  Pilih radio di sebelah kiri untuk menentukan jawaban yang benar.
                </p>
              </div>
            </div>

            {/* Modal footer */}
            <div className="shrink-0 flex justify-end gap-3 border-t border-[#D5DEEF] px-6 py-4 bg-[#F8FAFD]">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 text-sm font-bold text-[#395886] border border-[#D5DEEF] rounded-xl hover:bg-[#F0F3FA] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={saveQuestion}
                disabled={saving}
                className="px-5 py-2.5 text-sm font-bold text-white bg-[#628ECB] rounded-xl hover:bg-[#395886] transition-colors shadow-sm disabled:opacity-60"
              >
                {saving ? 'Menyimpan...' : editingIndex === -1 ? 'Tambah Soal' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={deleteIndex !== null} onOpenChange={() => setDeleteIndex(null)}>
        <AlertDialogContent className="border-[#D5DEEF] rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#395886] text-xl font-bold">Hapus Soal</AlertDialogTitle>
            <AlertDialogDescription className="text-[#395886]/60 font-medium">
              Apakah Anda yakin ingin menghapus soal ke-{(deleteIndex ?? 0) + 1}? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="border-[#D5DEEF] text-[#395886] hover:bg-[#F0F3FA] rounded-xl font-bold">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600 rounded-xl font-bold shadow-lg shadow-red-200"
              onClick={confirmDelete}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset confirmation */}
      <AlertDialog open={resetConfirm} onOpenChange={setResetConfirm}>
        <AlertDialogContent className="border-[#D5DEEF] rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#395886] text-xl font-bold">Reset ke Data Awal</AlertDialogTitle>
            <AlertDialogDescription className="text-[#395886]/60 font-medium">
              Semua soal akan dikembalikan ke data awal. Perubahan yang telah dilakukan akan hilang permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="border-[#D5DEEF] text-[#395886] hover:bg-[#F0F3FA] rounded-xl font-bold">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#F59E0B] text-white hover:bg-[#D97706] rounded-xl font-bold"
              onClick={handleReset}
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
