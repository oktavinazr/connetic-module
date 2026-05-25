import { supabase } from './supabase';
import { lessons, globalPretest, globalPosttest, type Stage, type TestQuestion } from '../data/lessons';

// Bump this string whenever default questions are updated to force-reset stale DB overrides.
const QUESTION_DEFAULTS_VERSION = 'v6-2026-05-25';

async function maybeResetStaleDefault(key: string): Promise<void> {
  const storageKey = `qdefault_version_${key}`;
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored !== QUESTION_DEFAULTS_VERSION) {
      await deleteQuestionsFromDb(key);
      localStorage.setItem(storageKey, QUESTION_DEFAULTS_VERSION);
    }
  } catch {
    // localStorage not available — skip
  }
}

async function fetchQuestionsFromDb(key: string): Promise<TestQuestion[] | null> {
  try {
    const { data, error } = await supabase
      .from('admin_questions')
      .select('questions')
      .eq('test_key', key)
      .maybeSingle();
    if (error || !data) return null;
    return data.questions as TestQuestion[];
  } catch {
    return null;
  }
}

async function upsertQuestionsToDb(key: string, questions: TestQuestion[]): Promise<void> {
  await supabase
    .from('admin_questions')
    .upsert(
      { test_key: key, questions, updated_at: new Date().toISOString() },
      { onConflict: 'test_key' },
    );
}

async function deleteQuestionsFromDb(key: string): Promise<void> {
  await supabase.from('admin_questions').delete().eq('test_key', key);
}

export function getDefaultTestQuestions(key: string): TestQuestion[] {
  if (key === 'global-pretest') return globalPretest.questions.map((q) => ({ ...q }));
  if (key === 'global-posttest') return globalPosttest.questions.map((q) => ({ ...q }));
  const m = key.match(/^lesson_(.+)_(pretest|posttest)$/);
  if (m) {
    const lesson = lessons[m[1]];
    if (lesson) return lesson[m[2] as 'pretest' | 'posttest'].questions.map((q) => ({ ...q }));
  }
  return [];
}

export async function loadTestQuestions(key: string): Promise<TestQuestion[]> {
  await maybeResetStaleDefault(key);
  const remote = await fetchQuestionsFromDb(key);
  if (remote !== null) return remote;
  return getDefaultTestQuestions(key);
}

export async function getAdminTestQuestions(key: string): Promise<TestQuestion[]> {
  return loadTestQuestions(key);
}

export async function isTestOverridden(key: string): Promise<boolean> {
  const remote = await fetchQuestionsFromDb(key);
  return remote !== null;
}

export async function saveAdminTestQuestions(key: string, questions: TestQuestion[]): Promise<void> {
  await upsertQuestionsToDb(key, questions);
}

export async function resetAdminTestQuestions(key: string): Promise<void> {
  await deleteQuestionsFromDb(key);
}

export interface StageOverride {
  title?: string;
  description?: string;
  apersepsi?: string;
  question?: string;
  options?: Array<{ id: string; text: string }>;
  correctAnswer?: string;
  feedback?: { correct: string; incorrect: string };
  explorationSections?: Array<{ id: string; title: string; content: string; example?: string }>;
  groupItems?: Array<{ id: string; text: string; correctGroup: string }>;
  teacherQuestion?: string;
  scenario?: string;
  whyQuestion?: string;
  hint?: string;
  reasonOptions?: Array<{ id: string; text: string; isCorrect: boolean; feedback: string }>;
  questionBank?: Array<{ id: string; text: string; response: string }>;
  matchingPairs?: Array<{ left: string; right: string }>;
  caseScenario?: {
    id?: string;
    title: string;
    description?: string;
    scenario?: string;
    question: string;
    options: Array<{ id: string; text: string; description?: string; isCorrect?: boolean; feedback?: string }>;
  };
  steps?: Array<{ id: string; title: string; description: string; visual: string }>;
  items?: Array<{ id: string; text: string; order: number }>;
  reflectionPrompts?: string[];
  essayReflection?: { materialSummaryPrompt: string; easyPartPrompt: string; hardPartPrompt: string };
  branchingScenario?: {
    context: string;
    initialQuestion: string;
    focusAreas?: string[];
    choices: Array<{
      id: string;
      text: string;
      isOptimal: boolean;
      consequence: string;
      followUpQuestion?: string;
      followUpChoices?: Array<{ id: string; text: string; isCorrect: boolean; explanation: string }>;
    }>;
    finalEvaluation: string;
  };
}

const stageOverrideCache = new Map<string, StageOverride>();
const stageOverrideKey = (lessonId: string, stageIndex: number) => `${lessonId}:${stageIndex}`;

const cloneStageOverride = (override: StageOverride): StageOverride => JSON.parse(JSON.stringify(override));

export async function loadAllStageOverrides(): Promise<Record<string, StageOverride>> {
  const { data, error } = await supabase
    .from('admin_stage_overrides')
    .select('lesson_id, stage_index, override_data');

  if (error || !data) {
    if (error) console.error('[loadAllStageOverrides]', error.message);
    return Object.fromEntries(stageOverrideCache.entries().map(([key, value]) => [key, cloneStageOverride(value)]));
  }

  stageOverrideCache.clear();
  for (const row of data) {
    stageOverrideCache.set(
      stageOverrideKey(row.lesson_id, row.stage_index),
      cloneStageOverride((row.override_data ?? {}) as StageOverride),
    );
  }

  return Object.fromEntries(stageOverrideCache.entries().map(([key, value]) => [key, cloneStageOverride(value)]));
}

export async function loadStageOverride(lessonId: string, stageIndex: number): Promise<StageOverride> {
  const key = stageOverrideKey(lessonId, stageIndex);
  const cached = stageOverrideCache.get(key);
  if (cached) return cloneStageOverride(cached);

  const { data, error } = await supabase
    .from('admin_stage_overrides')
    .select('override_data')
    .eq('lesson_id', lessonId)
    .eq('stage_index', stageIndex)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error('[loadStageOverride]', error.message);
    return {};
  }

  const override = cloneStageOverride((data.override_data ?? {}) as StageOverride);
  stageOverrideCache.set(key, override);
  return cloneStageOverride(override);
}

export function getStageOverride(lessonId: string, stageIndex: number): StageOverride {
  return cloneStageOverride(stageOverrideCache.get(stageOverrideKey(lessonId, stageIndex)) ?? {});
}

export async function saveStageOverride(lessonId: string, stageIndex: number, override: StageOverride): Promise<void> {
  const normalized = cloneStageOverride(override);
  stageOverrideCache.set(stageOverrideKey(lessonId, stageIndex), normalized);
  const { error } = await supabase
    .from('admin_stage_overrides')
    .upsert(
      {
        lesson_id: lessonId,
        stage_index: stageIndex,
        override_data: normalized,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'lesson_id,stage_index' },
    );
  if (error) console.error('[saveStageOverride]', error.message);
}

export async function resetStageOverride(lessonId: string, stageIndex: number): Promise<void> {
  stageOverrideCache.delete(stageOverrideKey(lessonId, stageIndex));
  const { error } = await supabase
    .from('admin_stage_overrides')
    .delete()
    .eq('lesson_id', lessonId)
    .eq('stage_index', stageIndex);
  if (error) console.error('[resetStageOverride]', error.message);
}

export function hasStageOverride(lessonId: string, stageIndex: number): boolean {
  return stageOverrideCache.has(stageOverrideKey(lessonId, stageIndex));
}

export function getEffectiveStage(stage: Stage, override: StageOverride): Stage {
  return {
    ...stage,
    ...(override.title !== undefined && { title: override.title }),
    ...(override.description !== undefined && { description: override.description }),
    ...(override.apersepsi !== undefined && { apersepsi: override.apersepsi }),
    ...(override.question !== undefined && { question: override.question }),
    ...(override.options !== undefined && { options: override.options }),
    ...(override.correctAnswer !== undefined && { correctAnswer: override.correctAnswer }),
    ...(override.feedback !== undefined && { feedback: override.feedback }),
    ...(override.explorationSections !== undefined && { explorationSections: override.explorationSections }),
    ...(override.groupItems !== undefined && { groupItems: override.groupItems }),
    ...(override.teacherQuestion !== undefined && { teacherQuestion: override.teacherQuestion }),
    ...(override.scenario !== undefined && { scenario: override.scenario }),
    ...(override.whyQuestion !== undefined && { whyQuestion: override.whyQuestion }),
    ...(override.hint !== undefined && { hint: override.hint }),
    ...(override.reasonOptions !== undefined && { reasonOptions: override.reasonOptions }),
    ...(override.questionBank !== undefined && { questionBank: override.questionBank }),
    ...(override.matchingPairs !== undefined && { matchingPairs: override.matchingPairs }),
    ...(override.caseScenario !== undefined && { caseScenario: override.caseScenario }),
    ...(override.steps !== undefined && { steps: override.steps }),
    ...(override.items !== undefined && { items: override.items }),
    ...(override.reflectionPrompts !== undefined && { reflectionPrompts: override.reflectionPrompts }),
    ...(override.essayReflection !== undefined && { essayReflection: override.essayReflection }),
    ...(override.branchingScenario !== undefined && { branchingScenario: override.branchingScenario }),
  };
}
