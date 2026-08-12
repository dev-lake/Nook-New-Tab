import { describe, expect, it } from 'vitest';
import {
  buildNavigationTarget,
  isSafeHttpUrl,
  normalizeNavigableUrl,
  shortcutValidationError,
} from '../src/search';

describe('search navigation', () => {
  it('normalizes domains and localhost', () => {
    expect(normalizeNavigableUrl('example.com/docs')).toBe('https://example.com/docs');
    expect(normalizeNavigableUrl('localhost:3000/app')).toBe('http://localhost:3000/app');
  });

  it('routes non-URLs to the selected search engine', () => {
    expect(buildNavigationTarget('new tab design', 'duckduckgo')).toBe(
      'https://duckduckgo.com/?q=new%20tab%20design',
    );
  });

  it('rejects unsafe schemes and credentials', () => {
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeHttpUrl('https://user:pass@example.com')).toBe(false);
    expect(shortcutValidationError('Private', 'https://user:pass@example.com')).toBe('url');
  });
});
