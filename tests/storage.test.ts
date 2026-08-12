import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../src/defaults';
import { sanitizeLocalUiState, sanitizeSettings } from '../src/storage';

describe('storage migration and validation', () => {
  it('falls back when settings are invalid', () => {
    const result = sanitizeSettings({
      locale: 'fr',
      theme: 'purple',
      searchEngine: 'ask',
      shortcuts: [{ id: 'x', title: 'Bad', url: 'javascript:alert(1)' }],
    });
    expect(result.locale).toBe(DEFAULT_SETTINGS.locale);
    expect(result.theme).toBe(DEFAULT_SETTINGS.theme);
    expect(result.searchEngine).toBe(DEFAULT_SETTINGS.searchEngine);
    expect(result.shortcuts).toEqual([]);
  });

  it('deduplicates local expansion IDs', () => {
    expect(sanitizeLocalUiState({ expandedFolderIds: ['1', '1', '2', 3] })).toEqual({
      expandedFolderIds: ['1', '2'],
    });
  });
});
