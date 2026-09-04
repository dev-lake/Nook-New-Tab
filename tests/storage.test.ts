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
    expect(result.schemaVersion).toBe(8);
    expect(result).not.toHaveProperty('surfacePlugins');
  });

  it('keeps every valid shortcut without applying an item limit', () => {
    const shortcuts = Array.from({ length: 12 }, (_, index) => ({
      id: `shortcut-${index}`,
      title: `Shortcut ${index}`,
      url: `https://example.com/${index}`,
    }));

    expect(sanitizeSettings({ ...DEFAULT_SETTINGS, shortcuts }).shortcuts).toHaveLength(12);
  });

  it('migrates legacy GitHub widgets into shortcut components and drops weather widgets', () => {
    const result = sanitizeSettings({
      ...DEFAULT_SETTINGS,
      schemaVersion: 3,
      widgets: [
        {
          id: 'shanghai',
          pluginId: 'weather',
          location: {
            id: 1796236,
            name: '上海',
            country: '中国',
            countryCode: 'cn',
            latitude: 31.22,
            longitude: 121.46,
            timezone: 'Asia/Shanghai',
          },
          temperatureUnit: 'celsius',
        },
        {
          id: 'repo',
          pluginId: 'github-repository',
          owner: 'openai',
          repository: 'openai-node',
        },
        {
          id: 'bad-weather',
          pluginId: 'weather',
          location: { id: 1, name: 'Nowhere', latitude: 200, longitude: 0 },
        },
      ],
    });

    expect(result.schemaVersion).toBe(8);
    expect(result.shortcuts.at(-1)).toEqual(expect.objectContaining({
      id: 'repo',
      url: 'https://github.com/openai/openai-node',
      enhancement: expect.objectContaining({ owner: 'openai', repository: 'openai-node' }),
    }));
    expect(result).not.toHaveProperty('surfacePlugins');
  });

  it('removes retired weather enhancement data while preserving its ordinary shortcut', () => {
    const result = sanitizeSettings({
      ...DEFAULT_SETTINGS,
      schemaVersion: 5,
      shortcuts: [{
        id: 'weather-link',
        title: 'Weather',
        url: 'https://weather.com/',
        enhancement: {
          pluginId: 'weather',
          location: {
            id: 1796236,
            name: 'Shanghai',
            country: 'China',
            countryCode: 'CN',
            latitude: 31.22,
            longitude: 121.46,
            timezone: 'Asia/Shanghai',
          },
          temperatureUnit: 'celsius',
        },
      }],
      pinnedOrder: ['shortcut:weather-link'],
    });

    expect(result.shortcuts[0]).toEqual({ id: 'weather-link', title: 'Weather', url: 'https://weather.com/' });
    expect(result).not.toHaveProperty('surfacePlugins');
  });

  it('validates GitHub profile shortcut configuration', () => {
    const result = sanitizeSettings({
      ...DEFAULT_SETTINGS,
      schemaVersion: 7,
      shortcuts: [
        {
          id: 'profile',
          title: 'GitHub account',
          url: 'https://github.com/',
          enhancement: { pluginId: 'github-profile', username: 'octocat' },
        },
        {
          id: 'bad-profile',
          title: 'Bad account',
          url: 'https://github.com/',
          enhancement: { pluginId: 'github-profile', username: '-invalid-' },
        },
      ],
      pinnedOrder: ['shortcut:profile', 'shortcut:bad-profile'],
    });

    expect(result.schemaVersion).toBe(8);
    expect(result.shortcuts[0]?.enhancement).toEqual({ pluginId: 'github-profile', username: 'octocat' });
    expect(result.shortcuts[1]).not.toHaveProperty('enhancement');
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

    expect(result.schemaVersion).toBe(8);
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
