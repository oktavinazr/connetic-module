import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ChevronDown, ChevronLeft, Download, HelpCircle, Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Header } from '../../components/layout/Header';
import { getAllStudents, getCurrentUser, logout, type User } from '../../utils/auth';
import { FormattedQuestion } from '../../components/stages/StageKit';
import { getGlobalTestProgress, getLessonProgress } from '../../utils/progress';

type TestType = 'global-pretest' | 'global-posttest' | 'lesson-pretest' | 'lesson-posttest';

interface AnswerData {
  studentName: string;
  answers: (number | null)[];
  isCorrect: boolean[];
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function AnswerResultsPage() {
  const { testType, lessonId } = useParams<{ testType: string; lessonId?: string }>();
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [students, setStudents] = useState<User[]>([]);
  const [results, setResults] = useState<AnswerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuestions, setShowQuestions] = useState(false);

  const testInfo = useMemo(() => {
    if (testType === 'global-pretest') return { title: 'Hasil Jawaban Pretest Umum', questions: globalPretest.questions };
    if (testType === 'global-posttest') return { title: 'Hasil Jawaban Posttest Umum', questions: globalPosttest.questions };
    if (lessonId) {
      const lesson = lessons[lessonId];
      if (testType === 'lesson-pretest') return { title: `Hasil Jawaban Pretest — ${lesson.title}`, questions: lesson.pretest.questions };
      if (testType === 'lesson-posttest') return { title: `Hasil Jawaban Posttest — ${lesson.title}`, questions: lesson.posttest.questions };
    }
    return { title: 'Hasil Jawaban', questions: [] as TestQuestion[] };
  }, [testType, lessonId]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const allStudents = await getAllStudents();
      setStudents(allStudents);
      const data: AnswerData[] = await Promise.all(
        allStudents.map(async (student: User) => {
          let answers: number[] = [];
          if (testType === 'global-pretest' || testType === 'global-posttest') {
            const prog = await getGlobalTestProgress(student.id);
            answers = (testType === 'global-pretest' ? prog.globalPretestAnswers : prog.globalPosttestAnswers) || [];
          } else if (lessonId) {
            const prog = await getLessonProgress(student.id, lessonId);
            answers = (testType === 'lesson-pretest' ? prog.answers['pretest'] : prog.answers['posttest']) || [];
          }
          const isCorrect = testInfo.questions.map((q: TestQuestion, i: number) => answers[i] === q.correctAnswer);
          return {
            studentName: student.name,
            answers: testInfo.questions.map((_: TestQuestion, i: number) => answers[i] ?? null),
            isCorrect,
          };
        })
      );
      setResults(data);
      setIsLoading(false);
    }
    loadData();
  }, [testType, lessonId, testInfo]);

  const answeredCount = results.filter(r => r.answers.some(a => a !== null)).length;
  const totalQ = testInfo.questions.length;

  // Per-question accuracy stats
  const questionStats = useMemo(() => {
    if (totalQ === 0 || results.length === 0) return [];
    return testInfo.questions.map((_: TestQuestion, qi: number) => {
      const answered = results.filter(r => r.answers[qi] !== null);
      const correct = results.filter(r => r.isCorrect[qi]).length;
      const pct = answered.length > 0 ? Math.round((correct / answered.length) * 100) : 0;
      return { correct, answered: answered.length, pct };
    });
  }, [results, testInfo.questions, totalQ]);

  function exportToXlsx() {
    const headerRow = [
      'Nama Siswa',
      ...testInfo.questions.map((_: TestQuestion, i: number) => `No. ${i + 1}`),
      'Benar',
      'Skor (%)',
    ];
    const keyRow = [
      'KUNCI JAWABAN',
      ...testInfo.questions.map((q: TestQuestion) => OPTION_LABELS[q.correctAnswer]),
      '',
      '',
    ];
    const dataRows = results.map(r => {
      const correct = r.isCorrect.filter(Boolean).length;
      return [
        r.studentName,
        ...r.answers.map(a => (a !== null ? OPTION_LABELS[a] : '-')),
        correct,
        totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0,
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([headerRow, keyRow, ...dataRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hasil Jawaban');
    XLSX.writeFile(wb, `hasil-${testType}-${lessonId || 'global'}.xlsx`);
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F0F3FA]">
      <Header
        user={user}
        onLogout={() => { logout(); navigate('/'); }}
        activeSection="Hasil Jawaban"
        role="admin"
      />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <button
          onClick={() => navigate('/admin?section=results')}
          className="flex items-center gap-2 text-[#395886]/60 hover:text-[#628ECB] font-bold text-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Kembali ke Analitik Hasil Belajar
        </button>

        {/* Header card */}
        <div className="overflow-hidden rounded-[2.5rem] border border-[#D5DEEF] bg-white shadow-xl">
          <div className="bg-gradient-to-br from-[#395886] via-[#4A6FA8] to-[#628ECB] px-8 py-7 text-white">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Detail Jawaban</p>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">{testInfo.title}</h1>
              </div>
              <button
                onClick={exportToXlsx}
                className="flex items-center gap-2 rounded-2xl bg-white/15 border border-white/30 px-6 py-3 text-sm font-black text-white transition-all hover:bg-white/25 active:scale-95 backdrop-blur-sm"
              >
                <Download className="w-4 h-4" /> Ekspor XLSX
              </button>
            </div>

            {/* Stats row */}
            <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-3 max-w-lg">
              <div className="rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-center">
                <p className="text-2xl font-black">{students.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/60 mt-0.5">Total Siswa</p>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-center">
                <p className="text-2xl font-black">{totalQ}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/60 mt-0.5">Jumlah Soal</p>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/20 px-4 py-3 text-center">
                <p className="text-2xl font-black text-[#34D399]">{answeredCount}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/60 mt-0.5">Sudah Mengerjakan</p>
              </div>
            </div>
          </div>

          {/* Question list panel */}
          {!isLoading && totalQ > 0 && (
            <div className="border-b border-[#D5DEEF]">
              <button
                onClick={() => setShowQuestions(v => !v)}
                className="w-full flex items-center justify-between px-8 py-4 hover:bg-[#F8FAFD] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-[#628ECB]" />
                  <span className="text-sm font-bold text-[#395886]">Daftar Soal & Kunci Jawaban</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#628ECB] bg-[#628ECB]/10 px-2 py-0.5 rounded-full border border-[#628ECB]/20">
                    {totalQ} soal
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#395886]/40 transition-transform ${showQuestions ? 'rotate-180' : ''}`} />
              </button>

              {showQuestions && (
                <div className="px-8 pb-6 space-y-3">
                  {testInfo.questions.map((q: TestQuestion, i: number) => {
                    const stat = questionStats[i];
                    return (
                      <div key={i} className="rounded-2xl border border-[#D5DEEF] bg-[#F8FAFD] p-5">
                        <div className="flex items-start gap-4">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#395886] text-white text-sm font-black shadow-sm">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <FormattedQuestion text={q.question} className="mb-3" />
                            <div className="grid grid-cols-2 gap-2">
                              {q.options.map((opt, oi) => (
                                <div
                                  key={oi}
                                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-xs transition-all ${
                                    oi === q.correctAnswer
                                      ? 'border-[#10B981]/30 bg-[#10B981]/10 text-[#0F8A66] font-bold'
                                      : 'border-[#D5DEEF] bg-white text-[#395886]/60'
                                  }`}
                                >
                                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black border ${
                                    oi === q.correctAnswer ? 'bg-[#10B981] text-white border-[#10B981]' : 'border-[#D5DEEF] text-[#395886]/40'
                                  }`}>
                                    {OPTION_LABELS[oi]}
                                  </span>
                                  <span className="flex-1 truncate">{opt}</span>
                                  {oi === q.correctAnswer && (
                                    <span className="shrink-0 text-[9px] font-black uppercase tracking-wider">Kunci</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          {stat && (
                            <div className="shrink-0 text-center min-w-[56px]">
                              <p className={`text-lg font-black ${stat.pct >= 70 ? 'text-[#10B981]' : stat.pct >= 50 ? 'text-[#F59E0B]' : 'text-red-500'}`}>
                                {stat.pct}%
                              </p>
                              <p className="text-[9px] font-bold text-[#395886]/40 uppercase tracking-wide">{stat.correct}/{stat.answered} benar</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Matrix Table */}
          <div className="p-6">
            {isLoading ? (
              <div className="rounded-[1.75rem] border border-[#D5DEEF] bg-[#F8FAFD] px-6 py-16 text-center">
                <div className="w-10 h-10 border-4 border-[#395886] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-medium text-[#395886]/45">Memuat data jawaban...</p>
              </div>
            ) : totalQ === 0 ? (
              <div className="rounded-[1.75rem] border border-[#D5DEEF] bg-[#F8FAFD] px-6 py-14 text-center text-sm font-medium text-[#395886]/45">
                Tidak ada soal pada evaluasi ini.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-[1.5rem] border border-[#D5DEEF]">
                <table className="w-full border-collapse text-sm" style={{ minWidth: `${220 + totalQ * 52}px` }}>
                  <thead>
                    {/* Column headers */}
                    <tr className="bg-[#F0F3FA]">
                      <th className="sticky left-0 z-20 bg-[#F0F3FA] px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-[#395886]/60 min-w-[200px] border-r border-[#D5DEEF]">
                        Nama Siswa
                      </th>
                      {testInfo.questions.map((_: TestQuestion, i: number) => (
                        <th
                          key={i}
                          className="px-2 py-3.5 text-center text-xs font-bold text-[#395886]/60 min-w-[48px] border-r border-[#D5DEEF]/50 last:border-r-0"
                          title={testInfo.questions[i]?.question}
                        >
                          <span className="cursor-help">{i + 1}</span>
                        </th>
                      ))}
                      <th className="px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wide text-[#395886]/60 min-w-[80px] border-l border-[#D5DEEF]">
                        Skor
                      </th>
                    </tr>

                    {/* Answer key row */}
                    <tr className="bg-amber-50 border-b-2 border-amber-200">
                      <td className="sticky left-0 z-20 bg-amber-50 px-5 py-3 border-r border-amber-200">
                        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-700">
                          <span className="h-2 w-2 rounded-full bg-amber-400" />
                          Kunci Jawaban
                        </span>
                      </td>
                      {testInfo.questions.map((q: TestQuestion, i: number) => (
                        <td key={i} className="px-2 py-3 text-center border-r border-amber-100 last:border-r-0">
                          <span className="inline-flex h-8 w-8 mx-auto items-center justify-center rounded-xl bg-amber-400 text-xs font-black text-white shadow-sm">
                            {OPTION_LABELS[q.correctAnswer]}
                          </span>
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center border-l border-amber-200">
                        <span className="text-xs font-bold text-amber-600">—</span>
                      </td>
                    </tr>

                    {/* Per-question accuracy row */}
                    {questionStats.length > 0 && (
                      <tr className="bg-[#F8FAFD] border-b-2 border-[#D5DEEF]">
                        <td className="sticky left-0 z-20 bg-[#F8FAFD] px-5 py-2.5 border-r border-[#D5DEEF]">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]">
                            Akurasi Per Soal
                          </span>
                        </td>
                        {questionStats.map((stat, i) => (
                          <td key={i} className="px-2 py-2.5 text-center border-r border-[#D5DEEF]/40 last:border-r-0">
                            <span className={`text-[10px] font-black ${stat.pct >= 70 ? 'text-[#10B981]' : stat.pct >= 50 ? 'text-[#F59E0B]' : 'text-red-500'}`}>
                              {stat.pct}%
                            </span>
                          </td>
                        ))}
                        <td className="px-4 py-2.5 text-center border-l border-[#D5DEEF]" />
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {results.length === 0 ? (
                      <tr>
                        <td colSpan={totalQ + 2} className="px-6 py-10 text-center text-sm text-[#395886]/40">
                          Belum ada siswa yang mengerjakan evaluasi ini.
                        </td>
                      </tr>
                    ) : (
                      results.map((res, rowIdx) => {
                        const correct = res.isCorrect.filter(Boolean).length;
                        const score = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
                        const hasAnswered = res.answers.some(a => a !== null);
                        return (
                          <tr
                            key={res.studentName}
                            className={`border-b border-[#D5DEEF]/60 transition-colors hover:bg-[#F8FAFD] ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFF]'}`}
                          >
                            <td className={`sticky left-0 z-10 px-5 py-3.5 border-r border-[#D5DEEF]/60 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFF]'}`}>
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#395886]/10 to-[#628ECB]/10 flex items-center justify-center text-[#395886] font-bold text-xs shrink-0">
                                  {res.studentName.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-[#395886] text-sm truncate max-w-[140px]">{res.studentName}</p>
                                  {!hasAnswered && (
                                    <p className="text-[10px] text-[#395886]/40 italic">Belum mengerjakan</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            {res.answers.map((ans, i) => {
                              if (ans === null) {
                                return (
                                  <td key={i} className="px-2 py-3 text-center border-r border-[#D5DEEF]/40 last:border-r-0">
                                    <span className="inline-flex h-8 w-8 mx-auto items-center justify-center rounded-xl bg-gray-100 text-xs font-medium text-gray-400">
                                      —
                                    </span>
                                  </td>
                                );
                              }
                              const isOk = res.isCorrect[i];
                              return (
                                <td key={i} className="px-2 py-3 text-center border-r border-[#D5DEEF]/40 last:border-r-0">
                                  <span
                                    className={`inline-flex h-8 w-8 mx-auto items-center justify-center rounded-xl text-xs font-black shadow-sm ${
                                      isOk ? 'bg-[#10B981] text-white' : 'bg-red-500 text-white'
                                    }`}
                                    title={isOk ? 'Benar' : `Salah (jawaban: ${OPTION_LABELS[ans]})`}
                                  >
                                    {OPTION_LABELS[ans]}
                                  </span>
                                </td>
                              );
                            })}
                            <td className="px-4 py-3 text-center border-l border-[#D5DEEF]/60">
                              {hasAnswered ? (
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className={`text-sm font-black ${score >= 80 ? 'text-[#10B981]' : score >= 60 ? 'text-[#F59E0B]' : 'text-red-500'}`}>
                                    {score}%
                                  </span>
                                  <span className="text-[9px] font-bold text-[#395886]/35">{correct}/{totalQ}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-[#395886]/30">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Legend */}
            {!isLoading && totalQ > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-5 px-1">
                <span className="text-xs font-bold text-[#395886]/50 uppercase tracking-wide">Keterangan:</span>
                <span className="inline-flex items-center gap-2 text-xs font-medium text-[#395886]/70">
                  <span className="h-6 w-6 rounded-lg bg-[#10B981] flex items-center justify-center text-[9px] font-black text-white">A</span>
                  Benar
                </span>
                <span className="inline-flex items-center gap-2 text-xs font-medium text-[#395886]/70">
                  <span className="h-6 w-6 rounded-lg bg-red-500 flex items-center justify-center text-[9px] font-black text-white">B</span>
                  Salah
                </span>
                <span className="inline-flex items-center gap-2 text-xs font-medium text-[#395886]/70">
                  <span className="h-6 w-6 rounded-xl bg-amber-400 flex items-center justify-center text-[9px] font-black text-white">C</span>
                  Kunci
                </span>
                <span className="inline-flex items-center gap-2 text-xs font-medium text-[#395886]/70">
                  <span className="h-6 w-6 rounded-lg bg-gray-100 flex items-center justify-center text-[9px] font-medium text-gray-400">—</span>
                  Tidak Dijawab
                </span>
                <span className="ml-auto text-xs text-[#395886]/40 italic">Arahkan kursor ke nomor soal untuk melihat teks soal</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
