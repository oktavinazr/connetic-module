import React from 'react';
import {
  CheckCircle,
  HelpCircle,
  Lightbulb,
  MonitorPlay,
  Search,
  Users,
  Video,
  FileText,
  FileSearch,
  XCircle,
  ChevronRight,
  Award,
} from 'lucide-react';
import { type Stage } from '../../data/lessons';

export const CTL_META = {
  constructivism: {
    label: 'Constructivism',
    icon: <Search className="w-3.5 h-3.5" />,
    bg: 'bg-[#628ECB]/10',
    text: 'text-[#628ECB]',
    border: 'border-[#628ECB]/20',
  },
  inquiry: {
    label: 'Inquiry',
    icon: <HelpCircle className="w-3.5 h-3.5" />,
    bg: 'bg-[#10B981]/10',
    text: 'text-[#10B981]',
    border: 'border-[#10B981]/20',
  },
  questioning: {
    label: 'Questioning',
    icon: <Lightbulb className="w-3.5 h-3.5" />,
    bg: 'bg-[#F59E0B]/10',
    text: 'text-[#F59E0B]',
    border: 'border-[#F59E0B]/20',
  },
  'learning-community': {
    label: 'Learning Community',
    icon: <Users className="w-3.5 h-3.5" />,
    bg: 'bg-[#8B5CF6]/10',
    text: 'text-[#8B5CF6]',
    border: 'border-[#8B5CF6]/20',
  },
  modeling: {
    label: 'Modeling',
    icon: <MonitorPlay className="w-3.5 h-3.5" />,
    bg: 'bg-[#EC4899]/10',
    text: 'text-[#EC4899]',
    border: 'border-[#EC4899]/20',
  },
  reflection: {
    label: 'Reflection',
    icon: <FileSearch className="w-3.5 h-3.5" />,
    bg: 'bg-[#6366F1]/10',
    text: 'text-[#6366F1]',
    border: 'border-[#6366F1]/20',
  },
  'authentic-assessment': {
    label: 'Authentic Assessment',
    icon: <FileText className="w-3.5 h-3.5" />,
    bg: 'bg-[#F43F5E]/10',
    text: 'text-[#F43F5E]',
    border: 'border-[#F43F5E]/20',
  },
};

export function getStageAnswerSummary(stage: Stage, answer: any): string {
  if (!answer) return '—';
  try {
    if (answer.summary) {
      return answer.summary.length > 50 ? `${answer.summary.slice(0, 47)}...` : answer.summary;
    }
    switch (stage.type) {
      case 'constructivism': {
        const a = answer as any;
        if (a.selectedOption || a.mcqData) {
          const data = a.mcqData || a;
          const opt = stage.options?.find((o: any) => o.id === data.selectedOption);
          return opt ? `Pilihan: "${opt.text.slice(0, 40)}..."` : 'Selesai (PG)';
        }
        if (a.essay1 || a.essay1Text) return 'Esai Selesai';
        if (a.phase === 'scramble') return 'Sedang Menyusun Cerita';
        if (a.phase === 'analogy') return 'Sedang Mengerjakan Analogi';
        return 'Selesai';
      }
      case 'inquiry': {
        const a = answer as any;
        if (a.reflection1 || a.reflection2) return 'Refleksi Selesai';
        if (a.flowData || a.groupData || a.matchingData) return 'Dalam Aktivitas';
        return 'Selesai';
      }
      case 'questioning': {
        const a = answer as any;
        if (a.justification) return a.justification.slice(0, 40) + '...';
        return 'Analisis Selesai';
      }
      case 'learning-community': {
        const a = answer as any;
        if (a.finalConclusion) return a.finalConclusion.slice(0, 40) + '...';
        return 'Diskusi Selesai';
      }
      case 'reflection': {
        const a = answer as any;
        if (a.essay) return a.essay.slice(0, 40) + '...';
        if (a.phase === 'map') return 'Sedang Membuat Peta Konsep';
        return 'Refleksi Selesai';
      }
      default:
        return 'Selesai';
    }
  } catch {
    return '—';
  }
}

export function StageAnswerDetail({ stage, answer }: { stage: Stage; answer: any }) {
  if (!answer) return <p className="text-xs text-[#395886]/50 italic">Belum dikerjakan</p>;

  const a = answer as any;
  const conclusionText = a.conclusion || a.summary;

  // Only show the reflection card — no other activity details
  if (conclusionText && typeof conclusionText === 'string') {
    return (
      <div className="bg-gradient-to-br from-[#ECFDF5] to-white rounded-xl border-2 border-[#10B981]/25 p-5 shadow-sm">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981]/15">
            <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <p className="text-xs font-black text-[#065F46] uppercase tracking-widest">Hasil Refleksi Kamu</p>
        </div>
        <p className="text-sm text-[#065F46] leading-relaxed font-medium">"{conclusionText}"</p>
      </div>
    );
  }

  return <p className="text-xs text-[#395886]/50 italic text-center py-2">Tidak ada refleksi tertulis.</p>;
}
