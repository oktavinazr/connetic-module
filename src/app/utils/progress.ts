import { supabase } from './supabase';
import { lessons } from '../data/lessons';
import { completeActivitySession, trackActivityEvent, type CTLStageType } from './activityTracking';

export interface LessonProgress {
  lessonId: string;
  userId: string;
  pretestCompleted: boolean;
  pretestScore?: number;
  completedStages: number[];
  posttestCompleted: boolean;
  posttestScore?: number;
  answers: Record<string, any>;
  stageAttempts: Record<string, number>;
  stageSuccess: Record<string, boolean>;
}

export interface GlobalTestProgress {
  userId: string;
  globalPretestCompleted: boolean;
  globalPretestScore?: number;
  globalPretestAnswers?: number[];
  globalPosttestCompleted: boolean;
  globalPosttestScore?: number;
  globalPosttestAnswers?: number[];
}

export interface AssessmentDraft {
  userId: string;
  draftKey: string;
  answers: Array<number | null>;
  updatedAt?: string;
}

const progressCache = new Map<string, LessonProgress>();
const globalProgressCache = new Map<string, GlobalTestProgress>();
const assessmentDraftCache = new Map<string, AssessmentDraft>();

const cacheKey = (userId: string, lessonId: string) => `${userId}:${lessonId}`;
const draftCacheKey = (userId: string, draftKey: string) => `${userId}:${draftKey}`;

const isPlainObject = (value: unknown): value is Record<string, any> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const normalizeCompletedStages = (value: unknown): number[] =>
  Array.from(
    new Set(
      (Array.isArray(value) ? value : [])
        .map((item) => Number(item))
        .filter((item) => Number.isInteger(item) && item >= 0),
    ),
  );

const normalizeStageAttempts = (value: unknown): Record<string, number> => {
  if (!isPlainObject(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, item]) => [key, Number(item)] as const)
      .filter(([, item]) => Number.isFinite(item) && item >= 0),
  );
};

const normalizeStageSuccess = (value: unknown): Record<string, boolean> => {
  if (!isPlainObject(value)) return {};
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, Boolean(item)]),
  );
};

const normalizeAnswers = (value: unknown): Record<string, any> =>
  isPlainObject(value) ? { ...value } : {};

const normalizeNumberArray = (value: unknown): number[] =>
  Array.isArray(value)
    ? value.map((item) => Number(item)).filter((item) => Number.isFinite(item))
    : [];

const normalizeDraftAnswers = (value: unknown): Array<number | null> =>
  Array.isArray(value)
    ? value.map((item) => (item === null ? null : Number(item))).map((item) => (typeof item === 'number' && Number.isFinite(item) ? item : null))
    : [];

const createDefaultLessonProgress = (userId: string, lessonId: string): LessonProgress => ({
  lessonId,
  userId,
  pretestCompleted: false,
  completedStages: [],
  posttestCompleted: false,
  answers: {},
  stageAttempts: {},
  stageSuccess: {},
});

const createDefaultGlobalTestProgress = (userId: string): GlobalTestProgress => ({
  userId,
  globalPretestCompleted: false,
  globalPretestAnswers: [],
  globalPosttestCompleted: false,
  globalPosttestAnswers: [],
});

const cloneLessonProgress = (p: LessonProgress): LessonProgress => ({
  ...p,
  completedStages: [...p.completedStages],
  answers: { ...p.answers },
  stageAttempts: { ...p.stageAttempts },
  stageSuccess: { ...p.stageSuccess },
});

const cloneGlobalTestProgress = (p: GlobalTestProgress): GlobalTestProgress => ({
  ...p,
  globalPretestAnswers: [...(p.globalPretestAnswers ?? [])],
  globalPosttestAnswers: [...(p.globalPosttestAnswers ?? [])],
});

const cloneAssessmentDraft = (draft: AssessmentDraft): AssessmentDraft => ({
  ...draft,
  answers: [...draft.answers],
});

const normalizeLessonProgress = (
  raw: Record<string, any> | null | undefined,
  userId: string,
  lessonId: string,
): LessonProgress => {
  const defaults = createDefaultLessonProgress(userId, lessonId);
  if (!raw) return defaults;
  return {
    lessonId,
    userId,
    pretestCompleted: Boolean(raw.pretest_completed ?? raw.pretestCompleted),
    pretestScore: raw.pretest_score ?? raw.pretestScore,
    completedStages: normalizeCompletedStages(raw.completed_stages ?? raw.completedStages),
    posttestCompleted: Boolean(raw.posttest_completed ?? raw.posttestCompleted),
    posttestScore: raw.posttest_score ?? raw.posttestScore,
    answers: normalizeAnswers(raw.answers),
    stageAttempts: normalizeStageAttempts(raw.stage_attempts ?? raw.stageAttempts),
    stageSuccess: normalizeStageSuccess(raw.stage_success ?? raw.stageSuccess),
  };
};

const normalizeGlobalTestProgress = (
  raw: Record<string, any> | null | undefined,
  userId: string,
): GlobalTestProgress => {
  if (!raw) return createDefaultGlobalTestProgress(userId);
  return {
    userId,
    globalPretestCompleted: Boolean(raw.global_pretest_completed ?? raw.globalPretestCompleted),
    globalPretestScore: raw.global_pretest_score ?? raw.globalPretestScore,
    globalPretestAnswers: normalizeNumberArray(raw.global_pretest_answers ?? raw.globalPretestAnswers),
    globalPosttestCompleted: Boolean(raw.global_posttest_completed ?? raw.globalPosttestCompleted),
    globalPosttestScore: raw.global_posttest_score ?? raw.globalPosttestScore,
    globalPosttestAnswers: normalizeNumberArray(raw.global_posttest_answers ?? raw.globalPosttestAnswers),
  };
};

export const getGlobalTestProgress = async (userId: string): Promise<GlobalTestProgress> => {
  const cached = globalProgressCache.get(userId);
  if (cached) return cloneGlobalTestProgress(cached);

  if (!isUuid(userId)) return createDefaultGlobalTestProgress(userId);

  const { data, error } = await supabase
    .from('global_test_progress')
    .select('user_id,global_pretest_completed,global_pretest_score,global_pretest_answers,global_posttest_completed,global_posttest_score,global_posttest_answers')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[getGlobalTestProgress]', error.message);
    return createDefaultGlobalTestProgress(userId);
  }

  const result = normalizeGlobalTestProgress(data, userId);
  globalProgressCache.set(userId, cloneGlobalTestProgress(result));
  return cloneGlobalTestProgress(result);
};

const upsertGlobalTestProgress = async (progress: GlobalTestProgress) => {
  globalProgressCache.set(progress.userId, cloneGlobalTestProgress(progress));

  if (!isUuid(progress.userId)) return;

  const payload = {
    user_id: progress.userId,
    global_pretest_completed: progress.globalPretestCompleted,
    global_pretest_score: progress.globalPretestScore ?? null,
    global_pretest_answers: progress.globalPretestAnswers ?? [],
    global_posttest_completed: progress.globalPosttestCompleted,
    global_posttest_score: progress.globalPosttestScore ?? null,
    global_posttest_answers: progress.globalPosttestAnswers ?? [],
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('global_test_progress')
    .upsert(payload, { onConflict: 'user_id' });

  if (error) console.error('[upsertGlobalTestProgress]', error.message);
};

export const saveGlobalPretestResult = async (userId: string, score: number, answers: any[]) => {
  const progress = await getGlobalTestProgress(userId);
  progress.globalPretestCompleted = true;
  progress.globalPretestScore = score;
  progress.globalPretestAnswers = normalizeNumberArray(answers);
  await upsertGlobalTestProgress(progress);
};

export const saveGlobalPosttestResult = async (userId: string, score: number, answers: any[]) => {
  const progress = await getGlobalTestProgress(userId);
  progress.globalPosttestCompleted = true;
  progress.globalPosttestScore = score;
  progress.globalPosttestAnswers = normalizeNumberArray(answers);
  await upsertGlobalTestProgress(progress);
};

export const getCachedProgress = (userId: string, lessonId: string): LessonProgress | null => {
  const cached = progressCache.get(cacheKey(userId, lessonId));
  return cached ? cloneLessonProgress(cached) : null;
};

export const getLessonProgress = async (userId: string, lessonId: string): Promise<LessonProgress> => {
  const key = cacheKey(userId, lessonId);
  const cached = progressCache.get(key);
  if (cached) return cloneLessonProgress(cached);

  if (!isUuid(userId)) return createDefaultLessonProgress(userId, lessonId);

  const { data, error } = await supabase
    .from('lesson_progress')
    .select('user_id,lesson_id,pretest_completed,pretest_score,completed_stages,posttest_completed,posttest_score,answers,stage_attempts,stage_success')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle();

  if (error) {
    console.error('[getLessonProgress]', error.message);
    return createDefaultLessonProgress(userId, lessonId);
  }

  const result = normalizeLessonProgress(data, userId, lessonId);
  progressCache.set(key, cloneLessonProgress(result));
  return cloneLessonProgress(result);
};

const upsertLessonProgress = async (progress: LessonProgress) => {
  const key = cacheKey(progress.userId, progress.lessonId);
  progressCache.set(key, cloneLessonProgress(progress));

  if (!isUuid(progress.userId)) return;

  const payload = {
    user_id: progress.userId,
    lesson_id: progress.lessonId,
    pretest_completed: progress.pretestCompleted,
    pretest_score: progress.pretestScore ?? null,
    completed_stages: normalizeCompletedStages(progress.completedStages),
    posttest_completed: progress.posttestCompleted,
    posttest_score: progress.posttestScore ?? null,
    answers: normalizeAnswers(progress.answers),
    stage_attempts: normalizeStageAttempts(progress.stageAttempts),
    stage_success: normalizeStageSuccess(progress.stageSuccess),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('lesson_progress')
    .upsert(payload, { onConflict: 'user_id,lesson_id' });

  if (error) console.error('[upsertLessonProgress]', error.message);
};

export const savePretestResult = async (
  userId: string, lessonId: string, score: number, answers: any[],
) => {
  const progress = await getLessonProgress(userId, lessonId);
  progress.pretestCompleted = true;
  progress.pretestScore = score;
  progress.answers.pretest = answers;
  await upsertLessonProgress(progress);
};

export const savePosttestResult = async (
  userId: string, lessonId: string, score: number, answers: any[],
) => {
  const progress = await getLessonProgress(userId, lessonId);
  progress.posttestCompleted = true;
  progress.posttestScore = score;
  progress.answers.posttest = answers;
  await upsertLessonProgress(progress);
};

export const saveReflectionResult = async (
  userId: string, lessonId: string, reflectionData: any,
) => {
  const progress = await getLessonProgress(userId, lessonId);
  progress.answers.main_reflection = reflectionData;
  await upsertLessonProgress(progress);
};

export const saveStageAttempt = async (
  userId: string, lessonId: string, stageIndex: number,
  isCorrect: boolean, attemptKey?: string,
): Promise<number> => {
  const progress = await getLessonProgress(userId, lessonId);
  const stageKey = attemptKey ?? `stage_${stageIndex}`;
  progress.stageAttempts[stageKey] = (progress.stageAttempts[stageKey] || 0) + 1;
  if (isCorrect) progress.stageSuccess[stageKey] = true;
  await upsertLessonProgress(progress);
  const stageType = lessons[lessonId]?.stages?.[stageIndex]?.type as CTLStageType | undefined;
  if (stageType) {
    await trackActivityEvent({
      userId,
      lessonId,
      stageIndex,
      stageType,
      eventType: 'attempt_recorded',
      eventData: { attemptKey: stageKey },
      isCorrect,
      errorCount: isCorrect ? 0 : 1,
      attemptDelta: 1,
    });
  }
  return progress.stageAttempts[stageKey];
};

export const saveStageProgress = async (
  userId: string, lessonId: string, stageIndex: number, answer: any,
) => {
  const progress = await getLessonProgress(userId, lessonId);
  const indexNum = Number(stageIndex);
  if (!progress.completedStages.includes(indexNum)) {
    progress.completedStages.push(indexNum);
  }
  progress.answers[`stage_${indexNum}`] = answer;
  progress.answers[indexNum] = answer;
  await upsertLessonProgress(progress);
  const stageType = lessons[lessonId]?.stages?.[indexNum]?.type as CTLStageType | undefined;
  if (stageType) {
    // Store answer directly as latestSnapshot so extractors can find fields at snap.key.
    // If a richer session was already saved by useActivityTracker, the guard in
    // completeActivitySession prevents overwriting it (sessions are immutable once completed).
    const snapshotPayload = answer && typeof answer === 'object' && !Array.isArray(answer)
      ? answer as Record<string, any>
      : { finalAnswer: answer };
    await completeActivitySession({
      userId,
      lessonId,
      stageIndex: indexNum,
      stageType,
      finalAnswer: answer,
      latestSnapshot: snapshotPayload,
    });
  }
};

export const getAllProgress = async (userId: string): Promise<LessonProgress[]> => {
  const lessonIds = Object.keys(lessons);
  return Promise.all(lessonIds.map((lessonId) => getLessonProgress(userId, lessonId)));
};

export const isLessonUnlocked = async (userId: string, lessonId: string): Promise<boolean> => {
  const globalTest = await getGlobalTestProgress(userId);
  if (!globalTest.globalPretestCompleted) return false;
  if (lessonId === '1') return true;

  const prevLessonId = String(Number(lessonId) - 1);
  const prevProgress = await getLessonProgress(userId, prevLessonId);
  const prevLesson = lessons[prevLessonId];
  if (!prevLesson) return false;

  return prevProgress.pretestCompleted && prevProgress.posttestCompleted;
};

export const isGlobalPosttestUnlocked = async (userId: string): Promise<boolean> => {
  const allProgress = await getAllProgress(userId);
  const lessonIds = Object.keys(lessons);
  if (allProgress.length < lessonIds.length) return false;
  return allProgress.every((progress) => {
    const lesson = lessons[progress.lessonId];
    if (!lesson) return true;
    return progress.pretestCompleted && progress.posttestCompleted;
  });
};

export const getAssessmentDraft = async (userId: string, draftKey: string): Promise<AssessmentDraft | null> => {
  const key = draftCacheKey(userId, draftKey);
  const cached = assessmentDraftCache.get(key);
  if (cached) return cloneAssessmentDraft(cached);

  if (!isUuid(userId)) return null;

  const { data, error } = await supabase
    .from('assessment_drafts')
    .select('user_id, draft_key, answers, updated_at')
    .eq('user_id', userId)
    .eq('draft_key', draftKey)
    .maybeSingle();

  if (error) {
    console.error('[getAssessmentDraft]', error.message);
    return null;
  }

  if (!data) return null;

  const draft: AssessmentDraft = {
    userId,
    draftKey,
    answers: normalizeDraftAnswers(data.answers),
    updatedAt: data.updated_at,
  };

  assessmentDraftCache.set(key, cloneAssessmentDraft(draft));
  return cloneAssessmentDraft(draft);
};

export const saveAssessmentDraft = async (userId: string, draftKey: string, answers: Array<number | null>) => {
  if (!isUuid(userId)) return;

  const draft: AssessmentDraft = {
    userId,
    draftKey,
    answers: [...answers],
    updatedAt: new Date().toISOString(),
  };

  assessmentDraftCache.set(draftCacheKey(userId, draftKey), cloneAssessmentDraft(draft));

  const { error } = await supabase
    .from('assessment_drafts')
    .upsert(
      {
        user_id: userId,
        draft_key: draftKey,
        answers,
        updated_at: draft.updatedAt,
      },
      { onConflict: 'user_id,draft_key' },
    );

  if (error) console.error('[saveAssessmentDraft]', error.message);
};

export const clearAssessmentDraft = async (userId: string, draftKey: string) => {
  assessmentDraftCache.delete(draftCacheKey(userId, draftKey));

  if (!isUuid(userId)) return;

  const { error } = await supabase
    .from('assessment_drafts')
    .delete()
    .eq('user_id', userId)
    .eq('draft_key', draftKey);

  if (error) console.error('[clearAssessmentDraft]', error.message);
};
