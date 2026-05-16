import { Link } from 'react-router';
import { CheckCircle, Lock } from 'lucide-react';
import { getStageDisplayTitle, type Lesson } from '../data/lessons';
import type { LessonProgress } from '../utils/progress';

interface LessonFlowSidebarProps {
  lesson: Lesson;
  lessonId: string;
  progress: LessonProgress;
  currentStep: 1 | 2 | 3 | 4;
  currentStageIndex?: number;
  fullyCompleted?: boolean;
  onStageClick?: (index: number) => void;
  isLocked?: boolean;
  syncStageIndex?: number;
}

export function LessonFlowSidebar({
  lesson,
  lessonId,
  progress,
  currentStep,
  currentStageIndex,
  fullyCompleted = false,
  onStageClick,
  isLocked = false,
  syncStageIndex = 0,
}: LessonFlowSidebarProps) {
  type StepItem = { step: number; label: string; completed: boolean; href: string; alwaysCompleted?: boolean; isCtl?: boolean };
  const mainSteps: StepItem[] = [
    { step: 1, label: 'Pendahuluan', completed: false, href: `/lesson-intro/${lessonId}`, alwaysCompleted: true },
    { step: 2, label: 'Pre-Test', completed: progress.pretestCompleted, href: `/lesson-pretest/${lessonId}` },
    { step: 3, label: 'Aktivitas CTL', completed: progress.completedStages.length === lesson.stages.length, href: `/lesson/${lessonId}`, isCtl: true },
    { step: 4, label: 'Post-Test', completed: progress.posttestCompleted, href: `/evaluation/${lessonId}` },
  ];

  return (
    <div className="bg-white rounded-[1.5rem] border-2 border-[#D5DEEF] shadow-sm overflow-hidden">
      {/* Identitas pertemuan */}
      <div className="px-5 py-5 border-b-2 border-[#D5DEEF] bg-gradient-to-br from-[#395886] to-[#628ECB]">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-1.5">Aktivitas Pertemuan</p>
        <p className="text-base font-black text-white leading-tight tracking-tight">{lesson.title}</p>
        <p className="text-[13px] font-bold text-white/80 mt-1 leading-snug">{lesson.topic}</p>
      </div>

      {/* Langkah-langkah */}
      <div className="p-4 space-y-1">
        {mainSteps.map((item, i) => {
          const isActive = item.step === currentStep;
          const isCompleted = item.alwaysCompleted || item.completed;
          // Dapat diklik jika: sudah selesai penuh dan bukan halaman saat ini, atau langkah sudah selesai
          const isClickable = !isLocked && (fullyCompleted || isCompleted) && !isActive && item.href !== null;

          return (
            <div key={item.step}>
              {/* Baris langkah utama */}
              {isClickable ? (
                <Link
                  to={item.href}
                  className="group flex items-center gap-3 px-3 py-3 rounded-[1rem] hover:bg-[#F0F3FA] transition-all border border-transparent hover:border-[#628ECB]/20"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-all shadow-sm ${isCompleted ? 'bg-[#10B981] text-white' : 'bg-[#D5DEEF] text-[#395886]/40'}`}>
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : item.step}
                  </div>
                  <span className={`text-sm font-bold flex-1 tracking-tight ${isCompleted ? 'text-[#10B981]' : 'text-[#395886]/60'}`}>
                    {item.label}
                  </span>
                </Link>
              ) : (
                <div className={`flex items-center gap-3 px-3 py-3 rounded-[1rem] transition-all border ${isActive ? 'bg-[#628ECB]/8 border-[#628ECB]/20' : 'border-transparent'}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-all shadow-sm ${
                    isCompleted ? 'bg-[#10B981] text-white' : isActive ? 'bg-[#628ECB] text-white shadow-[#628ECB]/20' : 'bg-[#D5DEEF] text-[#395886]/40'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : item.step}
                  </div>
                  <span className={`text-sm font-black flex-1 tracking-tight ${isCompleted ? 'text-[#10B981]' : isActive ? 'text-[#395886]' : 'text-[#395886]/35'}`}>
                    {item.label}
                  </span>
                  {!isActive && !isCompleted && item.step > currentStep && (
                    <Lock className="w-3.5 h-3.5 text-[#D5DEEF] shrink-0" />
                  )}
                </div>
              )}

              {/* Tahap CTL bersarang di bawah langkah 3 */}
              {item.isCtl && (
                <div className="ml-7 mt-2 mb-2 border-l-2 border-[#D5DEEF] pl-4 space-y-1">
                  {lesson.stages.map((stage, index) => {
                    const stageCompleted = progress.completedStages.includes(index);
                    const isCurrent = currentStep === 3 && index === currentStageIndex;
                    const isAdminStage = index === syncStageIndex;
                    // Hanya bisa diklik jika TEPAT di tahap yang diset admin
                    const stageClickable = !isLocked && isAdminStage && !isCurrent && onStageClick;
                    return (
                      <button
                        key={index}
                        onClick={() => stageClickable && onStageClick(index)}
                        disabled={!stageClickable}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                          isCurrent ? 'bg-[#628ECB]/8' : stageClickable ? 'hover:bg-[#F0F3FA]' : ''
                        } ${stageClickable ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        <div className={`h-2.5 w-2.5 shrink-0 rounded-full transition-all ${
                          stageCompleted ? 'bg-[#10B981]' : isCurrent ? 'bg-[#628ECB] ring-4 ring-[#628ECB]/15' : 'bg-[#D5DEEF]'
                        }`} />
                        <span className={`text-[13px] leading-tight flex-1 font-bold ${
                          isCurrent ? 'text-[#395886]' : stageCompleted ? 'text-[#10B981]' : 'text-[#395886]/40'
                        }`}>
                          {getStageDisplayTitle(stage.type)}
                        </span>
                        {stageCompleted && !isCurrent && <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" strokeWidth={3} />}
                        {!stageCompleted && !isCurrent && <Lock className="w-3 h-3 text-[#D5DEEF] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {i < mainSteps.length - 1 && !item.isCtl && (
                <div className="mx-6 my-1.5 h-px bg-[#D5DEEF]/60" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
