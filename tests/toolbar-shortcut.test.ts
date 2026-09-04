import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../src/defaults';
import { addToolbarPageShortcut } from '../src/toolbar-shortcut';

describe('toolbar shortcut', () => {
  it('adds the current page to the end of the pinned order', () => {
    const result = addToolbarPageShortcut(
      DEFAULT_SETTINGS,
      { title: '  Example   Documentation  ', url: 'https://example.com/docs#start' },
      'toolbar-example',
    );

    expect(result.status).toBe('added');
    expect(result.settings?.shortcuts.at(-1)).toEqual({
      id: 'toolbar-example',
      title: 'Example Documentation',
      url: 'https://example.com/docs#start',
    });
    expect(result.settings?.pinnedOrder.at(-1)).toBe('shortcut:toolbar-example');
    expect(DEFAULT_SETTINGS.shortcuts).toHaveLength(6);
  });

  it('uses the domain when the page has no title', () => {
    const result = addToolbarPageShortcut(
      { ...DEFAULT_SETTINGS, shortcuts: [], pinnedOrder: [] },
      { url: 'https://www.example.com/path' },
      'toolbar-example',
    );

    expect(result.settings?.shortcuts[0]?.title).toBe('example.com');
  });

  it('keeps an enhancement selected in the toolbar popup', () => {
    const result = addToolbarPageShortcut(
      { ...DEFAULT_SETTINGS, shortcuts: [], pinnedOrder: [] },
      {
        title: 'OpenAI Codex',
        url: 'https://github.com/openai/codex',
        enhancement: { pluginId: 'github-repository', owner: 'openai', repository: 'codex' },
      },
      'toolbar-codex',
    );

    expect(result.settings?.shortcuts[0]?.enhancement).toEqual({
      pluginId: 'github-repository',
      owner: 'openai',
      repository: 'codex',
    });
  });

  it('does not add the same canonical URL twice', () => {
    const result = addToolbarPageShortcut(
      DEFAULT_SETTINGS,
      { title: 'GitHub again', url: 'https://github.com' },
      'toolbar-github',
    );

    expect(result).toEqual({ status: 'duplicate' });
  });

  it('rejects browser-owned and credential-bearing URLs', () => {
    expect(addToolbarPageShortcut(
      DEFAULT_SETTINGS,
      { title: 'Settings', url: 'chrome://settings/' },
      'toolbar-settings',
    )).toEqual({ status: 'unsupported' });
    expect(addToolbarPageShortcut(
      DEFAULT_SETTINGS,
      { title: 'Private', url: 'https://user:secret@example.com/' },
      'toolbar-private',
    )).toEqual({ status: 'unsupported' });
  });
});
