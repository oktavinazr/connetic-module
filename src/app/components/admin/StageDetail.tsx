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
    // Standardized: prioritize 'summary' field (contains actual student essay content)
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
  try {
    switch (stage.type) {
      case 'constructivism': {
        const a = answer as any;
        
        if (a.selectedOption || a.mcqData) {
          const data = a.mcqData || a;
          const opt = stage.options?.find((o: any) => o.id === data.selectedOption);
          return (
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-xs font-bold text-[#395886]/50 uppercase">Pilihan:</span>
                <p className="text-[#395886] mt-0.5">{opt?.text ?? data.selectedOption ?? '—'}</p>
              </div>
              {data.reason && (
                <div>
                  <span className="text-xs font-bold text-[#395886]/50 uppercase">Alasan:</span>
                  <p className="text-[#395886] mt-0.5 bg-[#F0F3FA] rounded-lg px-3 py-2 text-xs leading-relaxed">{data.reason}</p>
                </div>
              )}
            </div>
          );
        }

        if (a.essay1 || a.essay2 || a.essay1Text || a.scrambleData || a.analogyData) {
          return (
            <div className="space-y-3 text-sm text-left">
              {(a.essay1 || a.essay1Text) && (
                <div className="bg-[#F0F3FA] rounded-lg p-2.5">
                   <p className="text-[10px] font-bold text-[#395886]/50 mb-1 uppercase">Jawaban Esai 1</p>
                   <p className="text-[#395886] text-xs italic">"{a.essay1 || a.essay1Text}"</p>
                </div>
              )}
              {a.essay2 && (
                <div className="bg-[#F0F3FA] rounded-lg p-2.5">
                   <p className="text-[10px] font-bold text-[#395886]/50 mb-1 uppercase">Jawaban Esai 2</p>
                   <p className="text-[#395886] text-xs italic">"{a.essay2}"</p>
                </div>
              )}
              {a.phase && (
                <p className="text-[10px] font-bold text-[#628ECB] uppercase">Posisi: {a.phase}</p>
              )}
            </div>
          );
        }

        return <p className="text-xs text-[#395886]/50 italic text-left">Selesai (Format lain)</p>;
      }
      case 'inquiry': {
        const a = answer as any;
        if (a.type === 'lesson1_format' || a.reflection1 || a.reflection2) {
          return (
            <div className="space-y-3 text-sm text-left">
               {(a.reflection1 || a.essays?.reflection1) && (
                 <div className="bg-[#F0F3FA] rounded-lg p-3">
                    <p className="text-[10px] font-bold text-[#395886]/50 mb-1 uppercase">Refleksi 1</p>
                    <p className="text-[#395886] italic text-xs">"{a.reflection1 || a.essays?.reflection1}"</p>
                 </div>
               )}
               {(a.reflection2 || a.essays?.reflection2) && (
                 <div className="bg-[#F0F3FA] rounded-lg p-3">
                    <p className="text-[10px] font-bold text-[#395886]/50 mb-1 uppercase">Refleksi 2</p>
                    <p className="text-[#395886] italic text-xs">"{a.reflection2 || a.essays?.reflection2}"</p>
                 </div>
               )}
               {a.activityStep && <p className="text-[10px] font-bold text-[#10B981] uppercase">Step: {a.activityStep}</p>}
            </div>
          );
        }
        if (a.flowData || a.groupData || a.matchingData) {
           return (
             <div className="space-y-1 text-xs text-left">
                {a.flowData && <p className="text-[#395886]"><span className="font-bold">Flow:</span> {Object.keys(a.flowData.slots || {}).length} item</p>}
                {a.groupData && <p className="text-[#395886]"><span className="font-bold">Group:</span> {Object.keys(a.groupData.placement || {}).length} item</p>}
                {a.matchingData && <p className="text-[#395886]"><span className="font-bold">Match:</span> {Object.keys(a.matchingData.matches || {}).length} item</p>}
             </div>
           );
        }
        const pairs = answer as Record<string, string>;
        return (
          <div className="space-y-1.5 text-left">
            {Object.entries(pairs).map(([left, right], i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="bg-[#628ECB]/10 text-[#628ECB] px-2 py-1 rounded font-medium flex-1 truncate">{left}</span>
                <ChevronRight className="w-3 h-3 text-[#395886]/40 shrink-0" />
                <span className="bg-[#10B981]/10 text-[#10B981] px-2 py-1 rounded font-medium flex-1 truncate">{right}</span>
              </div>
            ))}
          </div>
        );
      }
      case 'questioning': {
        const a = answer as { selectedAnswer?: number; isCorrect?: boolean; justification?: string; selectedId?: string };
        const opt = stage.options?.[a.selectedAnswer ?? -1];
        return (
          <div className="space-y-3 text-sm text-left">
            <div className="flex items-center gap-2">
              {a.isCorrect ? <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
              <span className={a.isCorrect ? 'text-[#10B981]' : 'text-red-600'}>
                {a.isCorrect ? 'Berhasil' : 'Perlu Tinjauan'} — {a.selectedId === 'pizza_simulation' || a.selectedId === 'disruption_simulation' ? 'Simulasi Pizza' : (opt ? String(opt) : `Opsi ${(a.selectedAnswer ?? 0) + 1}`)}
              </span>
            </div>
            {(a.justification || (a as any).summary) && (
              <div className="bg-[#F0F3FA] rounded-lg p-3">
                <p className="text-[10px] font-bold text-[#395886]/50 mb-1 uppercase">Argumentasi Logis</p>
                <p className="text-[#395886] italic text-xs leading-relaxed">"{a.justification || (a as any).summary}"</p>
              </div>
            )}
          </div>
        );
      }
      case 'learning-community': {
        const a = answer as any;
        
        // Handle comprehensive structure with module1Data/module2Data (discussions + votes)
        if (a.module1Data || a.module2Data) {
          return (
            <div className="space-y-4 text-left">
              {[
                { data: a.module1Data, label: 'Aktivitas Enkapsulasi' },
                { data: a.module2Data, label: 'Aktivitas Dekapsulasi' }
              ].map((mod, mi) => (
                mod.data && (
                  <div key={mi} className="bg-[#F0F3FA] rounded-xl p-3 border border-[#D5DEEF]/50">
                    <p className="text-[10px] font-black text-[#628ECB] mb-2 uppercase tracking-widest flex items-center gap-1.5">
                      <Users className="w-3 h-3" /> {mod.label}
                    </p>
                    <div className="space-y-2">
                       {mod.data.discussions?.map((d: any, di: number) => (
                         <div key={di} className="bg-white/60 p-2.5 rounded-lg border border-white shadow-sm">
                           <div className="flex justify-between items-start mb-1.5">
                             <div>
                               <p className="text-[10px] font-black text-[#395886] leading-none">{d.user_name}</p>
                               <p className="text-[9px] text-[#395886]/50 mt-1 font-bold">Opsi: {d.choice_text}</p>
                             </div>
                             <div className="flex items-center gap-1 bg-[#10B981]/10 text-[#10B981] px-1.5 py-0.5 rounded-md border border-[#10B981]/20">
                               <CheckCircle className="w-2.5 h-2.5" />
                               <span className="text-[9px] font-black">{d.votes?.length || 0} Vote</span>
                             </div>
                           </div>
                           <p className="text-[#395886] italic text-[11px] leading-relaxed border-t border-[#D5DEEF]/30 pt-1.5 mt-1.5">"{d.argument}"</p>
                         </div>
                       ))}
                       {(!mod.data.discussions || mod.data.discussions.length === 0) && (
                         <p className="text-[10px] text-[#395886]/40 italic py-1">Belum ada diskusi tercatat.</p>
                       )}
                    </div>
                  </div>
                )
              ))}
              {a.finalConclusion && (
                 <div className="bg-[#10B981]/5 rounded-xl p-3 border border-[#10B981]/10">
                    <p className="text-[10px] font-black text-[#10B981] mb-1 uppercase tracking-widest">Kesimpulan Individu</p>
                    <p className="text-[#395886] font-bold text-xs leading-relaxed italic">"{a.finalConclusion}"</p>
                 </div>
              )}
            </div>
          );
        }

        if (a?.encapsulation !== undefined && a?.decapsulation !== undefined) {
          return (
            <div className="space-y-3 text-sm text-left">
              <div className="bg-[#F0F3FA] rounded-lg p-3">
                <p className="text-xs font-bold text-[#395886]/50 mb-1 uppercase">X.TCP.6 — Encapsulation</p>
                <p className="text-[#395886] font-bold">Pilihan: {a.encapsulation.choice}</p>
                <p className="text-[#395886] mt-1 italic leading-relaxed text-xs">"{a.encapsulation.arg}"</p>
              </div>
              <div className="bg-[#F0F3FA] rounded-lg p-3">
                <p className="text-xs font-bold text-[#395886]/50 mb-1 uppercase">X.TCP.7 — Decapsulation</p>
                <p className="text-[#395886] font-bold">Pilihan: {a.decapsulation.choice}</p>
                <p className="text-[#395886] mt-1 italic leading-relaxed text-xs">"{a.decapsulation.arg}"</p>
              </div>
            </div>
          );
        }
        if (a.finalConclusion || a.summary) {
           return (
              <div className="bg-[#F0F3FA] rounded-lg p-3 text-left">
                <p className="text-[10px] font-bold text-[#395886]/50 mb-1 uppercase">Kesimpulan Akhir</p>
                <p className="text-[#395886] italic text-xs leading-relaxed">"{a.finalConclusion || a.summary}"</p>
              </div>
           );
        }
        return <p className="text-xs text-[#395886]/50 italic text-left">Selesai Berkolaborasi</p>;
      }
      case 'modeling': {
        return (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-left">
             <CheckCircle className="w-4 h-4 text-green-600" />
             <span className="text-xs font-bold text-green-700">Simulasi langkah-demi-langkah selesai disimak & dipraktikkan.</span>
          </div>
        );
      }
      case 'reflection': {
        const a = answer as any;
        if (a.phase === 'map' || a.nodes) {
          return (
            <div className="space-y-2 text-xs text-left">
               <p className="font-bold text-orange-600 uppercase text-[10px]">Sedang Menyusun Peta Konsep</p>
               <p className="text-[#395886]">{a.nodes?.length || 0} Konsep, {a.connections?.length || 0} Koneksi</p>
            </div>
          );
        }

        if (a.phase === 'essay' || a.essay || a.summary) {
          return (
            <div className="space-y-3 text-sm text-left">
               <div className="bg-[#F0F3FA] rounded-lg p-3">
                  <p className="text-[10px] font-bold text-[#395886]/50 mb-1 uppercase">Refleksi Akhir</p>
                  <p className="text-[#395886] leading-relaxed text-xs italic">"{a.essay || a.summary}"</p>
               </div>
               {a.confidence && <p className="text-[10px] font-bold text-orange-600">Keyakinan: {a.confidence}/5</p>}
            </div>
          );
        }
        return <p className="text-xs text-[#395886]/50 italic text-left">Refleksi Selesai</p>;
      }
      default:
        return <p className="text-xs text-[#395886]/50 text-left">{JSON.stringify(answer)}</p>;
    }
  } catch {
    return <p className="text-xs text-[#395886]/50 italic text-left">Data tidak terbaca</p>;
  }
}
