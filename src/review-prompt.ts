export const REVIEW_PROMPT_SNOOZE_MS = 21 * 24 * 60 * 60 * 1000;

const REVIEW_PROMPT_KEY = 'nook-review-prompt';

export interface ReviewPromptState {
  completed: boolean;
  snoozedUntil: number;
}

const DEFAULT_STATE: ReviewPromptState = {
  completed: false,
  snoozedUntil: 0,
};

export function parseReviewPromptState(value: unknown): ReviewPromptState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return DEFAULT_STATE;
  const candidate = value as Partial<ReviewPromptState>;
  return {
    completed: candidate.completed === true,
    snoozedUntil: typeof candidate.snoozedUntil === 'number' && Number.isFinite(candidate.snoozedUntil)
      ? Math.max(0, candidate.snoozedUntil)
      : 0,
  };
}

export function loadReviewPromptState(storage: Pick<Storage, 'getItem'> = window.localStorage): ReviewPromptState {
  try {
    const value = storage.getItem(REVIEW_PROMPT_KEY);
    return value ? parseReviewPromptState(JSON.parse(value)) : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveReviewPromptState(
  state: ReviewPromptState,
  storage: Pick<Storage, 'setItem'> = window.localStorage,
): void {
  try {
    storage.setItem(REVIEW_PROMPT_KEY, JSON.stringify(parseReviewPromptState(state)));
  } catch {
    // A disabled local storage backend should not affect the New Tab page.
  }
}

export function snoozeReviewPrompt(now = Date.now()): ReviewPromptState {
  return { completed: false, snoozedUntil: now + REVIEW_PROMPT_SNOOZE_MS };
}

export function completeReviewPrompt(): ReviewPromptState {
  return { completed: true, snoozedUntil: 0 };
}

export function shouldShowReviewPrompt(state: ReviewPromptState, now = Date.now()): boolean {
  return !state.completed && state.snoozedUntil <= now;
}
