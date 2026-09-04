import { describe, expect, it } from 'vitest';
import {
  completeReviewPrompt,
  parseReviewPromptState,
  REVIEW_PROMPT_SNOOZE_MS,
  shouldShowReviewPrompt,
  snoozeReviewPrompt,
} from '../src/review-prompt';

describe('rating prompt schedule', () => {
  it('shows by default and sanitizes invalid stored values', () => {
    const state = parseReviewPromptState({ completed: 'yes', snoozedUntil: 'tomorrow' });
    expect(state).toEqual({ completed: false, snoozedUntil: 0 });
    expect(shouldShowReviewPrompt(state, 1)).toBe(true);
  });

  it('shows again three weeks after being closed', () => {
    const now = 1_000;
    const state = snoozeReviewPrompt(now);
    expect(state.snoozedUntil).toBe(now + REVIEW_PROMPT_SNOOZE_MS);
    expect(shouldShowReviewPrompt(state, state.snoozedUntil - 1)).toBe(false);
    expect(shouldShowReviewPrompt(state, state.snoozedUntil)).toBe(true);
  });

  it('does not show again after the review action is completed', () => {
    expect(shouldShowReviewPrompt(completeReviewPrompt(), Number.MAX_SAFE_INTEGER)).toBe(false);
  });
});
