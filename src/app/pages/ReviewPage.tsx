import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import {
  ChevronLeft,
  CheckCircle,
  X,
  Trophy,
  ClipboardList,
  BookOpen,
  ArrowRight,
  Eye,
  ChevronDown,
  Layout,
  MessageSquare,
  FileText,
  Search,
  HelpCircle,
  Users,
  MonitorPlay,
  Lightbulb,
  Info,
  Download,
} from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { getLessonProgress, LessonProgress } from '../utils/progress';
import { FormattedQuestion } from '../components/stages/StageKit';
import { Logo } from '../components/layout/Logo';
import { StageAnswerDetail, CTL_META } from '../components/admin/StageDetail';
import { getLessonActivitySessions, type CTLActivitySession } from '../utils/activityTracking';

type ReviewSection = 'pretest' | 'ctl' | 'posttest' | string;

export function ReviewPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [user] = useState(getCurrentUser);
  const lesson = lessonId ? lessons[lessonId] : null;
  const printRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [activitySessions, setActivitySessions] = useState<CTLActivitySession[]>([]);
  const [activeSection, setActiveSection] = useState<ReviewSection>('pretest');
  const [isLoading, setIsLoading] = useState(true);

  const handleDownloadPDF = () => {
    window.print();
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (!lesson) { navigate('/dashboard'); return; }
    
    setIsLoading(true);
    getLessonProgress(user.id, lessonId!).then(p => {
      setProgress(p);
      setIsLoading(false);
    });
    getLessonActivitySessions(user.id, lessonId!).then(setActivitySessions);
  }, [user, lesson, lessonId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F3FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#628ECB] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#395886] font-bold animate-pulse">Memuat data review...</p>
        </div>
      </div>
    );
  }

  if (!lesson || !progress) return null;

  const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

  // Helper for Sidebar navigation
  const sidebarItems = [
    { id: 'pretest', label: 'Pre-Test', icon: <Trophy className="w-4 h-4" />, status: progress.pretestCompleted ? 'completed' : 'pending' },
    ...lesson.stages.map((stage, idx) => ({
      id: `ctl-${idx}`,
      label: getStageDisplayTitle(stage.type),
      icon: CTL_META[stage.type].icon,
      status: progress.completedStages.includes(idx) ? 'completed' : 'pending',
      isCtl: true
    })),
    { id: 'posttest', label: 'Post-Test', icon: <ClipboardList className="w-4 h-4" />, status: progress.posttestCompleted ? 'completed' : 'pending' },
  ];

  return (
    <div className="min-h-screen bg-[#F0F3FA]">
      <header className="sticky top-0 z-50 w-full border-b border-[#C8D8F0] bg-white/95 shadow-md backdrop-blur-md transition-all print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[76px] items-center justify-between gap-6">
            <div className="flex min-w-0 items-center gap-4">
              <Link to="/dashboard">
                <Logo />
              </Link>
              <div className="h-8 w-px bg-[#D5DEEF] hidden sm:block" />
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#628ECB]/10 px-3 py-1 text-xs font-bold text-[#628ECB] uppercase tracking-widest border border-[#628ECB]/20">
                Review Materi
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10B981] text-white text-xs font-bold hover:bg-[#059669] shadow-sm transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Unduh PDF</span>
              </button>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-[#395886] hover:text-[#628ECB] transition-colors text-sm font-bold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Print-only header */}
      <div className="hidden print:block p-8 border-b border-gray-200 mb-6">
        <h1 className="text-2xl font-black text-gray-900">{lesson?.title}</h1>
        <p className="text-base text-gray-600 mt-1">{lesson?.topic}</p>
        <p className="text-sm text-gray-400 mt-2">Rekap Hasil Pembelajaran — {user?.name ?? 'Siswa'}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:px-0 print:py-0">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-72 shrink-0 print:hidden">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-[2rem] border border-[#D5DEEF] shadow-sm overflow-hidden p-3">
                <div className="px-4 py-3 mb-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#628ECB]">{lesson.title}</p>
                  <p className="text-sm font-bold text-[#395886] truncate">{lesson.topic}</p>
                </div>
                
                <nav className="space-y-1">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-all ${
                        activeSection === item.id 
                        ? 'bg-[#395886] text-white shadow-md' 
                        : 'text-[#395886]/60 hover:bg-[#F0F3FA] hover:text-[#395886]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${activeSection === item.id ? 'bg-white/20' : 'bg-[#F0F3FA]'}`}>
                          {item.icon}
                        </div>
                        <span className="text-xs font-bold text-left leading-tight">{item.label}</span>
                      </div>
                      {item.status === 'completed' && (
                        <CheckCircle className={`w-3.5 h-3.5 ${activeSection === item.id ? 'text-white' : 'text-[#10B981]'}`} />
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Summary Card */}
              <div className="bg-gradient-to-br from-[#395886] to-[#628ECB] rounded-[2rem] p-6 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Layout className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60 leading-none mb-1">Skor Akhir</p>
                    <p className="text-xl font-black">Hasil Belajar</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-xs font-medium text-white/70">Pre-Test</span>
                    <span className="text-sm font-black">{progress.pretestScore ?? 0}/{lesson.pretest.questions.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs font-medium text-white/70">Post-Test</span>
                    <span className="text-sm font-black">{progress.posttestScore ?? 0}/{lesson.posttest.questions.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 print:w-full">
            <div className="bg-white rounded-[2.5rem] border border-[#D5DEEF] shadow-sm overflow-hidden min-h-[600px] flex flex-col print:rounded-none print:border-none print:shadow-none">
              
              {/* Content Header */}
              {(() => {
                const item = sidebarItems.find(i => i.id === activeSection);
                return (
                  <div className="px-8 py-6 border-b border-[#D5DEEF] bg-[#F8FAFD]/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-white rounded-2xl shadow-sm border border-[#D5DEEF] flex items-center justify-center text-[#395886]">
                        {item?.icon}
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-[#395886] tracking-tight">{item?.label}</h2>
                        <p className="text-xs font-medium text-[#395886]/50">Peninjauan hasil pengerjaan materi</p>
                      </div>
                    </div>
                    {item?.status === 'completed' && (
                      <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10B981]/10 text-[#10B981] text-[10px] font-black uppercase border border-[#10B981]/20">
                        <CheckCircle className="w-3 h-3" /> Selesai
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* Content Body */}
              <div className="p-8 flex-1">
                {activeSection === 'pretest' && (
                  <TestReviewContent
                    title="Pre-Test"
                    questions={lesson.pretest.questions}
                    answers={progress.answers.pretest ?? []}
                    optionLabels={OPTION_LABELS}
                  />
                )}

                {activeSection.startsWith('ctl-') && (() => {
                  const idx = parseInt(activeSection.split('-')[1]);
                  const stage = lesson.stages[idx];
                  const answer = progress.answers[`stage_${idx}`] ?? progress.answers[idx];
                  const tracking = activitySessions.find((session) => session.stageIndex === idx);
                  const meta = CTL_META[stage.type];
                  
                  return (
                    <div className="space-y-6">
                      <div className={`p-6 rounded-3xl border-2 ${meta.border} ${meta.bg} flex items-start gap-4`}>
                        <div className={`p-3 rounded-2xl bg-white shadow-sm ${meta.text}`}>
                          {meta.icon}
                        </div>
                        <div>
                          <h3 className={`text-sm font-black uppercase tracking-widest ${meta.text} mb-1`}>
                            {idx + 1}. {meta.label}
                          </h3>
                          <p className="text-[#395886] font-bold">{stage.title}</p>
                          <p className="text-xs text-[#395886]/60 mt-1 leading-relaxed">{stage.description}</p>
                        </div>
                      </div>

                      <div className="bg-[#F8FAFD] rounded-[2rem] border border-[#D5DEEF] p-8">
                        <div className="flex items-center gap-2 mb-6">
                          <MessageSquare className="w-4 h-4 text-[#628ECB]" />
                          <h4 className="text-sm font-black text-[#395886]">Review Jawaban Kamu</h4>
                        </div>
                        <StageAnswerDetail stage={stage} answer={answer} />
                      </div>

                      {tracking && (
                        <div className="grid gap-3 sm:grid-cols-4">
                          <div className="bg-white rounded-2xl border border-[#D5DEEF] p-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40">Status</p>
                            <p className="text-sm font-bold text-[#395886] mt-1">{tracking.status}</p>
                          </div>
                          <div className="bg-white rounded-2xl border border-[#D5DEEF] p-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40">Percobaan</p>
                            <p className="text-sm font-bold text-[#395886] mt-1">{tracking.totalAttempts}</p>
                          </div>
                          <div className="bg-white rounded-2xl border border-[#D5DEEF] p-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40">Kesalahan</p>
                            <p className="text-sm font-bold text-[#395886] mt-1">{tracking.totalErrors}</p>
                          </div>
                          <div className="bg-white rounded-2xl border border-[#D5DEEF] p-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#395886]/40">Progress</p>
                            <p className="text-sm font-bold text-[#395886] mt-1">{tracking.progressPercent}%</p>
                          </div>
                        </div>
                      )}

                      <div className="bg-white rounded-3xl border border-[#D5DEEF] p-6 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
                          <Info className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#395886]">Poin Pembelajaran</p>
                          <p className="text-xs text-[#395886]/60">Tahapan ini membantu kamu dalam membangun kerangka berpikir logis terkait {lesson.topic}.</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {activeSection === 'posttest' && (
                  <TestReviewContent
                    title="Post-Test"
                    questions={lesson.posttest.questions}
                    answers={progress.answers.posttest ?? []}
                    optionLabels={OPTION_LABELS}
                  />
                )}
              </div>

              {/* Navigation Footer */}
              <div className="p-6 border-t border-[#D5DEEF] bg-[#F8FAFD]/30 flex justify-between items-center print:hidden">
                {(() => {
                  const currIdx = sidebarItems.findIndex(i => i.id === activeSection);
                  const prev = sidebarItems[currIdx - 1];
                  const next = sidebarItems[currIdx + 1];

                  return (
                    <>
                      {prev ? (
                        <button
                          onClick={() => setActiveSection(prev.id)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D5DEEF] bg-white text-xs font-bold text-[#395886] hover:bg-[#F0F3FA] transition-all active:scale-95"
                        >
                          <ChevronLeft className="w-4 h-4" /> {prev.label}
                        </button>
                      ) : <div />}

                      {next ? (
                        <button
                          onClick={() => setActiveSection(next.id)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#395886] text-white text-xs font-bold hover:bg-[#628ECB] shadow-md transition-all active:scale-95"
                        >
                          {next.label} <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#10B981] text-white text-xs font-bold hover:bg-[#059669] shadow-md transition-all active:scale-95"
                        >
                          Selesai Review <CheckCircle className="w-4 h-4" />
                        </Link>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function TestReviewContent({ title, questions, answers, optionLabels }: any) {
  if (!answers || answers.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-20 text-center">
        <div className="h-20 w-20 bg-[#F0F3FA] rounded-[2rem] flex items-center justify-center mb-4 border border-[#D5DEEF]">
          <FileText className="w-10 h-10 text-[#395886]/20" />
        </div>
        <h3 className="text-lg font-bold text-[#395886]">Belum Ada Data</h3>
        <p className="text-sm text-[#395886]/50 max-w-xs mt-1">Selesaikan aktivitas {title} terlebih dahulu untuk melihat review jawaban.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((q: any, i: number) => {
        const studentAnswer = answers[i];
        const isCorrect = studentAnswer === q.correctAnswer;
        return (
          <div key={i} className={`rounded-[2rem] border transition-all ${isCorrect ? 'border-[#10B981]/20 bg-[#10B981]/[0.02]' : 'border-red-100 bg-red-50/[0.01]'}`}>
            <div className="p-6">
              <div className="flex gap-4 mb-5">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black shadow-sm ${isCorrect ? 'bg-[#10B981] text-white' : 'bg-red-500 text-white'}`}>
                  {i + 1}
                </span>
                <FormattedQuestion text={q.question} className="pt-1" />
              </div>
              <div className="ml-12 space-y-2.5">
                {q.options.map((opt: string, j: number) => {
                  const isStudentChoice = studentAnswer === j;
                  const isCorrectChoice = q.correctAnswer === j;
                  let cls = 'flex items-start gap-3 rounded-2xl border-2 p-4 text-xs font-bold transition-all ';
                  
                  if (isCorrectChoice) {
                    cls += 'border-[#10B981] bg-[#10B981]/5 text-[#0F8A66] shadow-sm';
                  } else if (isStudentChoice && !isCorrect) {
                    cls += 'border-red-200 bg-red-50 text-red-700';
                  } else {
                    cls += 'border-[#D5DEEF] bg-white text-[#395886]/40';
                  }
                  
                  return (
                    <div key={j} className={cls}>
                      <span className="shrink-0 w-5">{optionLabels[j]}.</span>
                      <span className="flex-1">{opt}</span>
                      {isCorrectChoice && <CheckCircle className="ml-auto h-4 w-4 shrink-0 text-[#10B981]" />}
                      {isStudentChoice && !isCorrect && <X className="ml-auto h-4 w-4 shrink-0 text-red-500" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
