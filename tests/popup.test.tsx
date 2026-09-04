import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '../src/defaults';
import type { SyncedSettings } from '../src/types';

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  loadSettings: vi.fn(),
  saveSettings: vi.fn(),
  requestPluginAccess: vi.fn(),
  savePluginCache: vi.fn(),
  removePluginCache: vi.fn(),
  fetchRepository: vi.fn(),
}));

vi.mock('wxt/browser', () => ({
  browser: {
    tabs: { query: mocks.query },
  },
}));

vi.mock('../src/browser-adapter', () => ({
  browserAdapter: {
    getFaviconUrl: () => 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
    loadSettings: mocks.loadSettings,
    saveSettings: mocks.saveSettings,
    requestPluginAccess: mocks.requestPluginAccess,
    savePluginCache: mocks.savePluginCache,
    removePluginCache: mocks.removePluginCache,
  },
}));

vi.mock('../src/plugins/github-repository', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/plugins/github-repository')>();
  return { ...actual, fetchGitHubRepositoryData: mocks.fetchRepository };
});

import { Popup } from '../src/Popup';

describe('toolbar popup', () => {
  beforeEach(() => {
    mocks.query.mockReset().mockResolvedValue([{
      title: 'Example page',
      url: 'https://example.com/original',
    }]);
    mocks.loadSettings.mockReset().mockResolvedValue({
      ...DEFAULT_SETTINGS,
      shortcuts: [],
      pinnedOrder: [],
    });
    mocks.saveSettings.mockReset().mockResolvedValue(undefined);
    mocks.requestPluginAccess.mockReset().mockResolvedValue(true);
    mocks.savePluginCache.mockReset().mockResolvedValue(undefined);
    mocks.removePluginCache.mockReset().mockResolvedValue(undefined);
    mocks.fetchRepository.mockReset().mockResolvedValue({
      kind: 'github-repository',
      fullName: 'openai/codex',
      description: 'Coding agent',
      stars: 100,
      forks: 10,
      openIssues: 2,
      url: 'https://github.com/openai/codex',
    });
    vi.spyOn(window, 'close').mockImplementation(() => undefined);
  });

  it('lets the user review and edit page details before saving', async () => {
    const user = userEvent.setup();
    render(<Popup />);

    const name = await screen.findByRole('textbox', { name: 'Name' });
    const url = screen.getByRole('textbox', { name: 'URL' });
    expect(name).toHaveValue('Example page');
    expect(url).toHaveValue('https://example.com/original');

    await user.clear(name);
    await user.type(name, 'Edited page');
    await user.clear(url);
    await user.type(url, 'https://example.com/edited');
    await user.click(screen.getByRole('button', { name: 'Add to Pinned' }));

    await waitFor(() => expect(mocks.saveSettings).toHaveBeenCalledTimes(1));
    const saved = mocks.saveSettings.mock.calls[0]?.[0] as SyncedSettings;
    expect(saved.shortcuts[0]).toEqual(expect.objectContaining({
      title: 'Edited page',
      url: 'https://example.com/edited',
    }));
    expect(await screen.findByText('Shortcut saved.')).toBeVisible();
  });

  it('offers matching live data and saves the selected enhancement', async () => {
    const user = userEvent.setup();
    mocks.query.mockResolvedValue([{
      title: 'openai/codex',
      url: 'https://github.com/openai/codex',
    }]);
    render(<Popup />);

    const toggle = await screen.findByRole('checkbox', { name: 'Show live data on this shortcut' });
    expect(toggle).not.toBeChecked();
    await user.click(toggle);
    await user.click(screen.getByRole('button', { name: 'Add to Pinned' }));

    await waitFor(() => expect(mocks.requestPluginAccess).toHaveBeenCalledWith('github-repository'));
    await waitFor(() => expect(mocks.saveSettings).toHaveBeenCalledTimes(1));
    const saved = mocks.saveSettings.mock.calls[0]?.[0] as SyncedSettings;
    expect(saved.shortcuts[0]?.enhancement).toEqual({
      pluginId: 'github-repository',
      owner: 'openai',
      repository: 'codex',
    });
    expect(mocks.savePluginCache).toHaveBeenCalledTimes(1);
  });
});
