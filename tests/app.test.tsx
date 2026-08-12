import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { App } from '../src/App';
import { DEFAULT_SETTINGS } from '../src/defaults';
import type { BrowserAdapter, SyncedSettings } from '../src/types';

vi.mock('wxt/browser', () => ({ browser: {} }));

function createAdapter(initialSettings: SyncedSettings = DEFAULT_SETTINGS): BrowserAdapter & { saveSettings: ReturnType<typeof vi.fn> } {
  return {
    getFaviconUrl: vi.fn((url: string) => `chrome-extension://test/_favicon/?pageUrl=${encodeURIComponent(url)}&size=32`),
    getBookmarkTree: vi.fn().mockResolvedValue([{
      id: 'work',
      title: 'Work',
      children: [{ id: 'github', title: 'GitHub', url: 'https://github.com/' }],
    }]),
    subscribeToBookmarks: vi.fn(() => () => undefined),
    openUtility: vi.fn().mockResolvedValue(undefined),
    navigateExternal: vi.fn().mockResolvedValue(undefined),
    loadSettings: vi.fn().mockResolvedValue(structuredClone(initialSettings)),
    saveSettings: vi.fn().mockResolvedValue(undefined),
    subscribeToSettings: vi.fn(() => () => undefined),
    loadLocalUiState: vi.fn().mockResolvedValue({ expandedFolderIds: [] }),
    saveLocalUiState: vi.fn().mockResolvedValue(undefined),
  };
}

describe('App integration', () => {
  it('loads browser data and persists theme and shortcut changes', async () => {
    const user = userEvent.setup();
    const adapter = createAdapter();
    render(<App adapter={adapter} />);

    expect(await screen.findByRole('button', { name: /Expand Work/ })).toBeVisible();
    expect(document.title).toBe('New Tab — Nook');
    expect(screen.getAllByRole('heading', { level: 2 })
      .map((heading) => heading.textContent)
      .filter((heading) => heading !== 'Bookmarks'))
      .toEqual(['Pinned', 'Browser utilities']);
    expect(screen.getByRole('button', { name: 'Passwords' })).toHaveAttribute('title', 'Passwords');
    expect(screen.queryByText('Manage saved credentials')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Language' }));
    expect(screen.getByRole('region', { name: 'Language' })).toBeVisible();
    expect(screen.queryByRole('region', { name: 'Appearance' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Language' }));

    await user.click(screen.getByRole('button', { name: 'Appearance' }));
    expect(screen.getByRole('region', { name: 'Appearance' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Dark' }));
    await waitFor(() => expect(adapter.saveSettings).toHaveBeenCalledWith(
      expect.objectContaining({ theme: 'dark' }),
    ));

    await user.click(screen.getByRole('button', { name: 'Add shortcut' }));
    await user.type(screen.getByLabelText('Name'), 'Docs');
    const url = screen.getByLabelText('URL');
    await user.clear(url);
    await user.type(url, 'https://example.com/');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      const lastCall = adapter.saveSettings.mock.calls.at(-1)?.[0] as SyncedSettings;
      expect(lastCall.shortcuts).toHaveLength(5);
      expect(lastCall.shortcuts.at(-1)?.title).toBe('Docs');
    });
  });

  it('renders browser favicons and saves drag-and-drop ordering', async () => {
    const adapter = createAdapter();
    render(<App adapter={adapter} />);

    const gmailCard = (await screen.findByRole('button', { name: 'Edit shortcut: Gmail' })).closest('.shortcut') as HTMLDivElement;
    const githubCard = screen.getByRole('button', { name: 'Edit shortcut: GitHub' }).closest('.shortcut') as HTMLDivElement;
    const browserIcon = gmailCard.querySelector('img') as HTMLImageElement;
    expect(browserIcon.src).toContain('_favicon/?pageUrl=');
    fireEvent.error(browserIcon);
    expect(gmailCard.querySelector('img')?.src).toBe('https://mail.google.com/favicon.ico');

    vi.spyOn(githubCard, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 180,
      bottom: 72,
      width: 180,
      height: 72,
      toJSON: () => ({}),
    });
    let draggedId = '';
    const dataTransfer = {
      effectAllowed: 'none',
      dropEffect: 'none',
      setData: (_type: string, value: string) => { draggedId = value; },
      getData: () => draggedId,
    };
    fireEvent.dragStart(gmailCard, { dataTransfer });
    fireEvent.dragOver(githubCard, { dataTransfer, clientX: 170, clientY: 36 });
    fireEvent.drop(githubCard, { dataTransfer, clientX: 170, clientY: 36 });

    await waitFor(() => {
      const saved = adapter.saveSettings.mock.calls.at(-1)?.[0] as SyncedSettings;
      expect(saved.shortcuts.slice(0, 2).map((shortcut) => shortcut.id)).toEqual(['github', 'gmail']);
    });
  });

  it('localizes the browser tab title', async () => {
    const adapter = createAdapter({ ...DEFAULT_SETTINGS, locale: 'zh-CN' });
    render(<App adapter={adapter} />);

    await screen.findByRole('heading', { name: '已固定' });
    expect(document.title).toBe('新标签 — Nook');
    expect(document.documentElement.lang).toBe('zh-CN');
  });
});
