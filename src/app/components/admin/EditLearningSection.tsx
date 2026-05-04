import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  Edit2,
  Layout,
  Trophy,
} from 'lucide-react';
import { lessons, globalPretest, globalPosttest } from '../../data/lessons';
import {
  getStageOverride,
  hasStageOverride,
  isTestOverridden,
  loadAllStageOverrides,
} from '../../utils/adminData';
import { QuestionCRUD, StageEditModal, CTL_META } from './ActivityManagementSection';

type EditTab = 'lessons' | 'global';
type LessonTab = 'pretest' | 'stages' | 'posttest';

export function EditLearningSection() {
  const [activeTab, setActiveTab] = useState<EditTab>('lessons');
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [activeLessonTab, setActiveLessonTab] = useState<Record<string, LessonTab>>({});
  const [editingStage, setEditingStage] = useState<{ lessonId: string; stageIndex: number } | null>(null);
  const [, forceUpdate] = useState(0);

  const [overrideMap, setOverrideMap] = useState<Record<string, boolean>>({});

  const lessonList = Object.values(lessons);

  const refreshOverrides = useCallback(async () => {
    await loadAllStageOverrides();

    const keys: string[] = [];
    lessonList.forEach(l => {
      keys.push(`lesson_${l.id}_pretest`);
      keys.push(`lesson_${l.id}_posttest`);
    });
    // Add global tests too
    keys.push('global-pretest');
    keys.push('global-posttest');

    const overrides: Record<string, boolean> = {};
    await Promise.all(keys.map(async key => {
      overrides[key] = await isTestOverridden(key);
    }));
    setOverrideMap(overrides);
  }, [lessonList]);

  useEffect(() => {
    refreshOverrides();
  }, [refreshOverrides]);

  function getLessonTab(lessonId: string): LessonTab {
    return activeLessonTab[lessonId] ?? 'pretest';
  }

  function setLessonTab(lessonId: string, tab: LessonTab) {
    setActiveLessonTab(prev => ({ ...prev, [lessonId]: tab }));
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#628ECB] mb-1">Manajemen Konten</p>
        <h1 className="text-2xl font-bold text-[#395886]">Manajemen Konten Pembelajaran</h1>
        <p className="text-sm text-[#395886]/60 mt-1">
          Kelola seluruh materi, soal, dan aktivitas pembelajaran dalam satu tempat.
        </p>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-1 bg-white border border-[#D5DEEF] rounded-2xl p-1 w-fit shadow-sm">
        <button
          onClick={() => setActiveTab('lessons')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'lessons'
              ? 'bg-[#628ECB] text-white shadow-md'
              : 'text-[#395886]/60 hover:text-[#395886] hover:bg-[#F0F3FA]'
          }`}
        >
          <Layout className="w-4 h-4" />
          Per Pertemuan
        </button>
        <button
          onClick={() => setActiveTab('global')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'global'
              ? 'bg-[#628ECB] text-white shadow-md'
              : 'text-[#395886]/60 hover:text-[#395886] hover:bg-[#F0F3FA]'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Test Global
        </button>
      </div>

      {activeTab === 'lessons' && (
        <div className="space-y-4">
          {lessonList.map(lesson => {
            const isOpen = expandedLesson === lesson.id;
            const modCount = lesson.stages.filter((_, si) => hasStageOverride(lesson.id, si)).length;

            const preKey = `lesson_${lesson.id}_pretest`;
            const postKey = `lesson_${lesson.id}_posttest`;

            const preOverride = overrideMap[preKey] || false;
            const postOverride = overrideMap[postKey] || false;
            const totalMod = modCount + (preOverride ? 1 : 0) + (postOverride ? 1 : 0);
            const currentTab = getLessonTab(lesson.id);

            return (
              <div key={lesson.id} className="bg-white border border-[#D5DEEF] rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Lesson header */}
                <button
                  onClick={() => setExpandedLesson(isOpen ? null : lesson.id)}
                  className="w-full flex items-center justify-between px-6 py-5 hover:bg-[#F8FAFD] transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#395886] via-[#4A6FA8] to-[#628ECB] text-white flex items-center justify-center font-black text-sm shadow-md">
                      P{lesson.id}
                    </div>
                    <div>
                      <p className="font-black text-[#395886] text-lg leading-tight">{lesson.title}</p>
                      <p className="text-sm font-bold text-[#628ECB]">{lesson.topic}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {totalMod > 0 && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                        {totalMod} Dimodifikasi
                      </span>
                    )}
                    <ChevronDown className={`w-5 h-5 text-[#395886]/30 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Expanded: inner tab system */}
                {isOpen && (
                  <div className="border-t border-[#D5DEEF]">
                    {/* Tab bar */}
                    <div className="flex bg-[#F8FAFD] border-b border-[#D5DEEF] px-4 pt-3 gap-0.5">
                      {([
                        {
                          id: 'pretest' as LessonTab,
                          label: 'Pre-Test',
                          badge: preOverride ? '!' : null,
                          activeStyle: 'border-green-500 text-green-700 bg-white',
                          inactiveStyle: 'border-transparent text-[#395886]/50 hover:text-green-700 hover:bg-white/70',
                        },
                        {
                          id: 'stages' as LessonTab,
                          label: `Tahapan CTL (${lesson.stages.length})`,
                          badge: modCount > 0 ? modCount.toString() : null,
                          activeStyle: 'border-[#628ECB] text-[#628ECB] bg-white',
                          inactiveStyle: 'border-transparent text-[#395886]/50 hover:text-[#628ECB] hover:bg-white/70',
                        },
                        {
                          id: 'posttest' as LessonTab,
                          label: 'Post-Test',
                          badge: postOverride ? '!' : null,
                          activeStyle: 'border-amber-500 text-amber-700 bg-white',
                          inactiveStyle: 'border-transparent text-[#395886]/50 hover:text-amber-700 hover:bg-white/70',
                        },
                      ] as const).map(t => (
                        <button
                          key={t.id}
                          onClick={() => setLessonTab(lesson.id, t.id)}
                          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold border-b-2 -mb-px rounded-t-xl transition-all ${
                            currentTab === t.id ? t.activeStyle : t.inactiveStyle
                          }`}
                        >
                          {t.label}
                          {t.badge && (
                            <span className="w-4 h-4 rounded-full bg-amber-400 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                              {t.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Tab content */}
                    <div className="p-5">
                      {currentTab === 'pretest' && (
                        <QuestionCRUD
                          testKey={`lesson_${lesson.id}_pretest`}
                          title={`Pre-Test ${lesson.title}`}
                        />
                      )}

                      {currentTab === 'stages' && (
                        <div className="space-y-2.5">
                          {lesson.stages.map((stage, si) => {
                            const override = getStageOverride(lesson.id, si);
                            const modified = hasStageOverride(lesson.id, si);
                            const meta = CTL_META[stage.type] ?? CTL_META.constructivism;
                            const displayTitle = override.title ?? stage.title;

                            return (
                              <div
                                key={si}
                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${
                                  modified
                                    ? 'border-amber-200 bg-amber-50/40'
                                    : 'border-[#D5DEEF] bg-[#F8FAFD] hover:bg-white hover:border-[#C8D8F0]'
                                }`}
                              >
                                <span className="text-xs font-black text-[#395886]/30 w-5 shrink-0 text-center">{si + 1}</span>
                                <div className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider ${meta.bg} ${meta.text} ${meta.border}`}>
                                  {meta.icon} {meta.label}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-sm text-[#395886] truncate">{displayTitle}</p>
                                  {modified && (
                                    <p className="text-[9px] font-black text-amber-500 uppercase mt-0.5 tracking-wide">
                                      Konten dikustomisasi
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => setEditingStage({ lessonId: lesson.id, stageIndex: si })}
                                  className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-[#628ECB] bg-white border border-[#D5DEEF] px-4 py-2 rounded-xl hover:border-[#628ECB] hover:bg-[#628ECB]/5 transition-all shadow-sm"
                                >
                                  <Edit2 className="w-3.5 h-3.5" /> Edit
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {currentTab === 'posttest' && (
                        <QuestionCRUD
                          testKey={`lesson_${lesson.id}_posttest`}
                          title={`Post-Test ${lesson.title}`}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'global' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-[#D5DEEF] rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#395886]">Pre-Test Umum</h3>
                <p className="text-sm text-[#395886]/50 font-medium">Tes awal standar sistem</p>
              </div>
            </div>
            <QuestionCRUD testKey="global-pretest" title="Pre-Test Umum" />
          </div>

          <div className="bg-white border border-[#D5DEEF] rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#395886]">Post-Test Umum</h3>
                <p className="text-sm text-[#395886]/50 font-medium">Evaluasi akhir standar sistem</p>
              </div>
            </div>
            <QuestionCRUD testKey="global-posttest" title="Post-Test Umum" />
          </div>
        </div>
      )}

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
