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
    expect(result.shortcutGroups).toEqual([]);
    expect(result.pinnedOrder).toEqual([]);
    expect(result.schemaVersion).toBe(3);
  });

  it('keeps every valid shortcut without applying an item limit', () => {
    const shortcuts = Array.from({ length: 12 }, (_, index) => ({
      id: `shortcut-${index}`,
      title: `Shortcut ${index}`,
      url: `https://example.com/${index}`,
    }));

    expect(sanitizeSettings({ ...DEFAULT_SETTINGS, shortcuts }).shortcuts).toHaveLength(12);
  });

  it('migrates and validates shortcut groups without duplicating members', () => {
    const shortcuts = [
      { id: 'a', title: 'A', url: 'https://a.example/' },
      { id: 'b', title: 'B', url: 'https://b.example/' },
      { id: 'c', title: 'C', url: 'https://c.example/' },
    ];
    const result = sanitizeSettings({
      ...DEFAULT_SETTINGS,
      schemaVersion: 1,
      shortcuts,
      shortcutGroups: [
        { id: 'first', title: 'First', shortcutIds: ['a', 'b', 'missing'] },
        { id: 'second', title: 'Second', shortcutIds: ['b', 'c'] },
      ],
    });

    expect(result.schemaVersion).toBe(3);
    expect(result.shortcutGroups).toEqual([
      { id: 'first', title: 'First', shortcutIds: ['a', 'b'] },
    ]);
    expect(result.pinnedOrder).toEqual(['shortcut:c', 'group:first']);
  });

  it('deduplicates local expansion IDs', () => {
    expect(sanitizeLocalUiState({ expandedFolderIds: ['1', '1', '2', 3] })).toEqual({
      expandedFolderIds: ['1', '2'],
      bookmarkFolderId: null,
      background: 'none',
    });
  });

  it('keeps a valid device-local bookmark folder selection', () => {
    expect(sanitizeLocalUiState({ expandedFolderIds: [], bookmarkFolderId: 'work' })).toEqual({
      expandedFolderIds: [],
      bookmarkFolderId: 'work',
      background: 'none',
    });
  });

  it('keeps valid local backgrounds and rejects unknown values', () => {
    expect(sanitizeLocalUiState({ expandedFolderIds: [], background: 'midnight' }).background).toBe('midnight');
    expect(sanitizeLocalUiState({ expandedFolderIds: [], background: 'remote-url' }).background).toBe('none');
  });
});
