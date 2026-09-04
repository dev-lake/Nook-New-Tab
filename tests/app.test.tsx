import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../src/App';
import { DEFAULT_SETTINGS } from '../src/defaults';
import type { BrowserAdapter, SyncedSettings } from '../src/types';

vi.mock('wxt/browser', () => ({ browser: {} }));

beforeEach(() => window.localStorage.clear());

function createAdapter(initialSettings: SyncedSettings = DEFAULT_SETTINGS): BrowserAdapter & {
  saveSettings: ReturnType<typeof vi.fn>;
  saveLocalUiState: ReturnType<typeof vi.fn>;
  requestPluginAccess: ReturnType<typeof vi.fn>;
  loadPluginCache: ReturnType<typeof vi.fn>;
  savePluginCache: ReturnType<typeof vi.fn>;
} {
  return {
    getFaviconUrl: vi.fn((url: string) => `chrome-extension://test/_favicon/?pageUrl=${encodeURIComponent(url)}&size=32`),
    getBookmarkTree: vi.fn().mockResolvedValue([{
      id: 'work',
      title: 'Work',
      children: [{ id: 'github', title: 'GitHub', url: 'https://github.com/' }],
    }]),
    subscribeToBookmarks: vi.fn(() => () => undefined),
    openUtility: vi.fn().mockResolvedValue(undefined),
    openReviewPage: vi.fn().mockResolvedValue(undefined),
    navigateExternal: vi.fn().mockResolvedValue(undefined),
    loadSettings: vi.fn().mockResolvedValue(structuredClone(initialSettings)),
    saveSettings: vi.fn().mockResolvedValue(undefined),
    subscribeToSettings: vi.fn(() => () => undefined),
    loadLocalUiState: vi.fn().mockResolvedValue({ expandedFolderIds: [], bookmarkFolderId: null, background: 'none' }),
    saveLocalUiState: vi.fn().mockResolvedValue(undefined),
    loadCustomBackground: vi.fn().mockResolvedValue(null),
    saveCustomBackground: vi.fn().mockResolvedValue(undefined),
    clearCustomBackground: vi.fn().mockResolvedValue(undefined),
    hasPluginAccess: vi.fn().mockResolvedValue(true),
    requestPluginAccess: vi.fn().mockResolvedValue(true),
    loadPluginCache: vi.fn().mockResolvedValue(null),
    savePluginCache: vi.fn().mockResolvedValue(undefined),
    removePluginCache: vi.fn().mockResolvedValue(undefined),
  };
}

describe('App integration', () => {
  it('does not render default shortcuts before stored settings finish loading', async () => {
    let resolveSettings!: (settings: SyncedSettings) => void;
    const storedSettings = new Promise<SyncedSettings>((resolve) => {
      resolveSettings = resolve;
    });
    const adapter = createAdapter();
    adapter.loadSettings = vi.fn(() => storedSettings);
    render(<App adapter={adapter} />);

    expect(screen.getByLabelText('Nook')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('button', { name: 'Edit shortcut: Gmail' })).not.toBeInTheDocument();

    resolveSettings({
      ...DEFAULT_SETTINGS,
      locale: 'zh-CN',
      shortcuts: [{ id: 'stored', title: '已保存网站', url: 'https://example.com/' }],
      shortcutGroups: [],
      pinnedOrder: ['shortcut:stored'],
    });

    expect(await screen.findByRole('button', { name: '编辑快捷项: 已保存网站' })).toBeVisible();
    expect(screen.queryByLabelText('Nook', { selector: '.app-loading' })).not.toBeInTheDocument();
    expect(document.title).toBe('新标签 — Nook');
  });

  it('opens the browser-specific rating page from the bottom-right prompt', async () => {
    const user = userEvent.setup();
    const adapter = createAdapter();
    render(<App adapter={adapter} />);

    await user.click(await screen.findByRole('button', { name: 'Enjoying Nook? Rate it' }));
    expect(adapter.openReviewPage).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Enjoying Nook? Rate it' })).not.toBeInTheDocument();
  });

  it('lets the user close and snooze the rating prompt', async () => {
    const user = userEvent.setup();
    const adapter = createAdapter();
    render(<App adapter={adapter} />);

    await user.click(await screen.findByRole('button', { name: 'Remind me again in three weeks' }));
    expect(screen.queryByRole('button', { name: 'Enjoying Nook? Rate it' })).not.toBeInTheDocument();
    expect(window.localStorage.getItem('nook-review-prompt')).toContain('snoozedUntil');
  });

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
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem('nook-theme')).toBe('dark');

    await user.click(screen.getByRole('button', { name: 'Add shortcut' }));
    expect(screen.getByRole('searchbox', { name: 'Search popular sites' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Add Google Calendar' }).querySelector('.bundled-brand-icon')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add a custom website' }));
    await user.type(screen.getByLabelText('Name'), 'Docs');
    const url = screen.getByLabelText('URL');
    await user.clear(url);
    await user.type(url, 'https://example.com/');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      const lastCall = adapter.saveSettings.mock.calls.at(-1)?.[0] as SyncedSettings;
      expect(lastCall.shortcuts).toHaveLength(DEFAULT_SETTINGS.shortcuts.length + 1);
      expect(lastCall.shortcuts.at(-1)?.title).toBe('Docs');
    });
  });

  it('searches common websites and adds one directly from the picker', async () => {
    const user = userEvent.setup();
    const adapter = createAdapter();
    render(<App adapter={adapter} />);

    await screen.findByRole('button', { name: /Expand Work/ });
    await user.click(screen.getByRole('button', { name: 'Add shortcut' }));
    await user.type(screen.getByRole('searchbox', { name: 'Search popular sites' }), 'calendar');

    expect(screen.getByRole('button', { name: 'Add Google Calendar' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Add Slack' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add Google Calendar' }));

    await waitFor(() => {
      const saved = adapter.saveSettings.mock.calls.at(-1)?.[0] as SyncedSettings;
      expect(saved.shortcuts.at(-1)).toEqual(expect.objectContaining({
        title: 'Google Calendar',
        url: 'https://calendar.google.com/',
      }));
    });
    expect(screen.queryByRole('dialog', { name: 'Add shortcut' })).not.toBeInTheDocument();
  });

  it('prefers the real browser favicon and retains local fallbacks while saving drag ordering', async () => {
    const adapter = createAdapter();
    render(<App adapter={adapter} />);

    const gmailCard = (await screen.findByRole('button', { name: 'Edit shortcut: Gmail' })).closest('.shortcut') as HTMLDivElement;
    const githubCard = screen.getByRole('button', { name: 'Edit shortcut: GitHub' }).closest('.shortcut') as HTMLDivElement;
    const browserIcon = gmailCard.querySelector('.shortcut-mark img') as HTMLImageElement;
    expect(browserIcon.src).toContain('_favicon/?pageUrl=');
    expect(browserIcon.closest('.shortcut-mark')).not.toHaveClass('favicon-fallback');
    expect(gmailCard.querySelector('.shortcut-mark > span')).not.toBeInTheDocument();
    fireEvent.error(browserIcon);
    expect((gmailCard.querySelector('.shortcut-mark img') as HTMLImageElement).src).toBe('https://mail.google.com/favicon.ico');
    expect(gmailCard.querySelector('.shortcut-mark > span')).not.toBeInTheDocument();

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
      expect(saved.pinnedOrder.slice(0, 2)).toEqual(['shortcut:github', 'shortcut:gmail']);
    });
  });

  it('moves a later shortcut to the first position when dropped anywhere on the first card', async () => {
    const adapter = createAdapter();
    render(<App adapter={adapter} />);

    const firstCard = (await screen.findByRole('button', { name: 'Edit shortcut: Gmail' })).closest('.shortcut') as HTMLDivElement;
    const laterCard = screen.getByRole('button', { name: 'Edit shortcut: YouTube' }).closest('.shortcut') as HTMLDivElement;
    vi.spyOn(firstCard, 'getBoundingClientRect').mockReturnValue({
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
    let draggedKey = '';
    const dataTransfer = {
      effectAllowed: 'none',
      dropEffect: 'none',
      setData: (_type: string, value: string) => { draggedKey = value; },
      getData: () => draggedKey,
    };

    fireEvent.dragStart(laterCard, { dataTransfer });
    fireEvent.dragOver(firstCard, { dataTransfer, clientX: 170, clientY: 36 });
    expect(firstCard).toHaveClass('drop-before');
    fireEvent.drop(firstCard, { dataTransfer, clientX: 170, clientY: 36 });

    await waitFor(() => {
      const saved = adapter.saveSettings.mock.calls.at(-1)?.[0] as SyncedSettings;
      expect(saved.pinnedOrder.slice(0, 2)).toEqual(['shortcut:youtube', 'shortcut:gmail']);
    });
  });

  it('localizes the browser tab title', async () => {
    const adapter = createAdapter({ ...DEFAULT_SETTINGS, locale: 'zh-CN' });
    render(<App adapter={adapter} />);

    await screen.findByRole('heading', { name: '已固定' });
    expect(document.title).toBe('新标签 — Nook');
    expect(document.documentElement.lang).toBe('zh-CN');
  });

  it('lets the user display the contents of a specific bookmark folder', async () => {
    const user = userEvent.setup();
    const adapter = createAdapter();
    render(<App adapter={adapter} />);

    expect(await screen.findByRole('button', { name: /Expand Work/ })).toBeVisible();
    await user.selectOptions(screen.getByLabelText('Bookmark folder'), 'work');

    expect(screen.queryByRole('button', { name: /Expand Work/ })).not.toBeInTheDocument();
    expect(screen.getByRole('treeitem', { name: 'Open GitHub' })).toBeVisible();
    await waitFor(() => expect(adapter.saveLocalUiState).toHaveBeenCalledWith({
      expandedFolderIds: [],
      bookmarkFolderId: 'work',
      background: 'none',
    }));
  });

  it('adds a bookmark directly to pinned shortcuts', async () => {
    const user = userEvent.setup();
    const adapter = createAdapter({ ...DEFAULT_SETTINGS, shortcuts: [] });
    render(<App adapter={adapter} />);

    await user.click(await screen.findByRole('button', { name: /Expand Work/ }));
    await user.click(screen.getByRole('button', { name: 'Pin GitHub' }));

    await waitFor(() => {
      const saved = adapter.saveSettings.mock.calls.at(-1)?.[0] as SyncedSettings;
      expect(saved.shortcuts).toEqual([
        expect.objectContaining({ title: 'GitHub', url: 'https://github.com/' }),
      ]);
    });
    expect(screen.getByRole('button', { name: 'GitHub is already pinned' })).toBeDisabled();
  });

  it('shows more than eight pinned shortcuts without pagination', async () => {
    const user = userEvent.setup();
    const shortcuts = Array.from({ length: 8 }, (_, index) => ({
      id: `shortcut-${index}`,
      title: `Shortcut ${index}`,
      url: `https://example.com/${index}`,
    }));
    const adapter = createAdapter({ ...DEFAULT_SETTINGS, shortcuts });
    render(<App adapter={adapter} />);

    await user.click(await screen.findByRole('button', { name: /Expand Work/ }));
    await user.click(screen.getByRole('button', { name: 'Pin GitHub' }));

    await waitFor(() => {
      const saved = adapter.saveSettings.mock.calls.at(-1)?.[0] as SyncedSettings;
      expect(saved.shortcuts).toHaveLength(9);
      expect(saved.shortcuts.at(-1)).toEqual(expect.objectContaining({ title: 'GitHub' }));
    });

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Edit shortcut:/ })).toHaveLength(9);
    expect(screen.getByRole('button', { name: 'Edit shortcut: GitHub' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Edit shortcut: Shortcut 0' })).toBeVisible();

    const shortcutList = document.querySelector('.shortcut-list') as HTMLDivElement;
    Object.defineProperties(shortcutList, {
      clientHeight: { configurable: true, value: 160 },
      scrollHeight: { configurable: true, value: 400 },
      scrollTop: { configurable: true, value: 0, writable: true },
    });
    fireEvent.scroll(shortcutList);
    expect(shortcutList).not.toHaveAttribute('data-fade-top');
    expect(shortcutList).toHaveAttribute('data-fade-bottom', 'true');
    shortcutList.scrollTop = 80;
    fireEvent.scroll(shortcutList);
    expect(shortcutList).toHaveAttribute('data-fade-top', 'true');
    expect(shortcutList).toHaveAttribute('data-fade-bottom', 'true');
    shortcutList.scrollTop = 240;
    fireEvent.scroll(shortcutList);
    expect(shortcutList).toHaveAttribute('data-fade-top', 'true');
    expect(shortcutList).not.toHaveAttribute('data-fade-bottom');

    await user.click(screen.getByRole('button', { name: 'Add shortcut' }));
    expect(screen.getByRole('dialog', { name: 'Add shortcut' })).toBeVisible();
  });

  it('groups multiple shortcuts into one folder-like card', async () => {
    const user = userEvent.setup();
    const adapter = createAdapter();
    render(<App adapter={adapter} />);

    await screen.findByRole('heading', { name: 'Pinned' });
    await user.click(screen.getByRole('button', { name: 'Create group' }));
    await user.type(screen.getByLabelText('Group name'), 'Work');
    await user.click(screen.getByRole('checkbox', { name: /Gmail/ }));
    await user.click(screen.getByRole('checkbox', { name: /GitHub/ }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      const saved = adapter.saveSettings.mock.calls.at(-1)?.[0] as SyncedSettings;
      expect(saved.shortcutGroups).toEqual([
        expect.objectContaining({ title: 'Work', shortcutIds: ['gmail', 'github'] }),
      ]);
    });
    expect(screen.queryByRole('button', { name: 'Edit shortcut: Gmail' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit shortcut: GitHub' })).not.toBeInTheDocument();

    const groupButton = screen.getByRole('button', { name: 'Open Work, 2 shortcuts' });
    const groupCard = groupButton.closest('.shortcut') as HTMLDivElement;
    const chatgptCard = screen.getByRole('button', { name: 'Edit shortcut: ChatGPT' }).closest('.shortcut') as HTMLDivElement;
    expect(groupCard).toHaveAttribute('draggable', 'true');
    vi.spyOn(chatgptCard, 'getBoundingClientRect').mockReturnValue({
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
    let draggedKey = '';
    const dataTransfer = {
      effectAllowed: 'none',
      dropEffect: 'none',
      setData: (_type: string, value: string) => { draggedKey = value; },
      getData: () => draggedKey,
    };
    fireEvent.dragStart(groupCard, { dataTransfer });
    fireEvent.dragOver(chatgptCard, { dataTransfer, clientX: 170, clientY: 36 });
    fireEvent.drop(chatgptCard, { dataTransfer, clientX: 170, clientY: 36 });

    await waitFor(() => {
      const saved = adapter.saveSettings.mock.calls.at(-1)?.[0] as SyncedSettings;
      const groupId = saved.shortcutGroups[0]?.id;
      expect(saved.pinnedOrder.slice(0, 2)).toEqual(['shortcut:chatgpt', `group:${groupId}`]);
    });

    await user.click(groupButton);
    expect(screen.getByRole('dialog', { name: 'Work' })).toBeVisible();
    expect(screen.getByRole('button', { name: /Gmail/ })).toBeVisible();
    expect(screen.getByRole('button', { name: /GitHub/ })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Edit group' }));
    await user.click(screen.getByRole('button', { name: 'Dissolve group' }));
    await waitFor(() => {
      const saved = adapter.saveSettings.mock.calls.at(-1)?.[0] as SyncedSettings;
      expect(saved.shortcutGroups).toEqual([]);
    });
    expect(screen.getByRole('button', { name: 'Edit shortcut: Gmail' })).toBeVisible();
  });

  it('lets the user choose built-in and custom background images', async () => {
    const user = userEvent.setup();
    const adapter = createAdapter();
    render(<App adapter={adapter} />);

    await screen.findByRole('button', { name: /Expand Work/ });
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    await user.click(screen.getByRole('button', { name: 'Misty mountains' }));
    await waitFor(() => expect(adapter.saveLocalUiState).toHaveBeenCalledWith({
      expandedFolderIds: [],
      bookmarkFolderId: null,
      background: 'mist',
    }));
    expect(document.querySelector('.app-shell')).toHaveAttribute('data-background', 'true');

    const file = new File(['image'], 'background.png', { type: 'image/png' });
    const chooseImageButton = screen.getByRole('button', { name: 'Choose image' });
    expect(chooseImageButton).toHaveClass('text-button');
    expect(chooseImageButton.querySelector('svg')).toBeInTheDocument();
    await user.upload(screen.getByLabelText('Choose image'), file);
    await waitFor(() => expect(adapter.saveCustomBackground).toHaveBeenCalledWith(file));
    await waitFor(() => expect(adapter.saveLocalUiState).toHaveBeenCalledWith({
      expandedFolderIds: [],
      bookmarkFolderId: null,
      background: 'custom',
    }));
  });

  it('shows localized instructions for hiding Chrome\'s New Tab footer', async () => {
    const user = userEvent.setup();
    const adapter = createAdapter({ ...DEFAULT_SETTINGS, locale: 'zh-CN' });
    render(<App adapter={adapter} />);

    await screen.findByRole('heading', { name: '已固定' });
    await user.click(screen.getByRole('button', { name: '设置' }));
    await user.click(screen.getByText('隐藏 Chrome 底部页脚'));

    expect(screen.getByText(/Nook 无法直接关闭/)).toBeVisible();
    expect(screen.getByText(/右键点击底部页脚/)).toBeVisible();
    expect(screen.getByText(/自定义 Chrome/)).toBeVisible();
    expect(screen.getByRole('link', { name: /Chrome 官方说明/ })).toHaveAttribute(
      'href',
      'https://support.google.com/chrome/answer/11032183',
    );
  });

  it('offers and renders public GitHub data inside a matching shortcut', async () => {
    const user = userEvent.setup();
    const adapter = createAdapter();
    let cachedEntry: Awaited<ReturnType<BrowserAdapter['loadPluginCache']>> = null;
    adapter.savePluginCache.mockImplementation(async (_instanceId, entry) => {
      cachedEntry = entry;
    });
    adapter.loadPluginCache.mockImplementation(async () => cachedEntry);
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify({
      full_name: 'openai/openai-node',
      description: 'Official JavaScript library',
      stargazers_count: 12000,
      forks_count: 900,
      open_issues_count: 42,
      owner: { avatar_url: 'https://avatars.githubusercontent.com/u/14957082' },
    }), { status: 200, headers: { 'content-type': 'application/json' } })));
    vi.stubGlobal('fetch', fetchMock);

    render(<App adapter={adapter} />);
    await screen.findByRole('heading', { name: 'Pinned' });
    await user.click(screen.getByRole('button', { name: 'Add shortcut' }));
    await user.click(screen.getByRole('button', { name: 'Add a custom website' }));
    await user.type(screen.getByLabelText('Name'), 'OpenAI Node');
    const url = screen.getByLabelText('URL');
    await user.clear(url);
    await user.type(url, 'https://github.com/openai/openai-node');
    expect(screen.getByRole('region', { name: 'GitHub repository live data is available' })).toBeVisible();
    await user.click(screen.getByRole('checkbox', { name: 'Show live data on this shortcut' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      const saved = adapter.saveSettings.mock.calls.at(-1)?.[0] as SyncedSettings;
      expect(saved.shortcuts.at(-1)).toEqual(expect.objectContaining({
        title: 'OpenAI Node',
        enhancement: expect.objectContaining({ pluginId: 'github-repository', owner: 'openai', repository: 'openai-node' }),
      }));
    });
    expect(screen.queryByRole('heading', { name: 'Widgets' })).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Edit shortcut: OpenAI Node' })).toBeVisible();
    expect(screen.getByTitle('Stars')).toHaveTextContent('12K');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(adapter.requestPluginAccess).toHaveBeenCalledWith('github-repository');
    expect(adapter.savePluginCache).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ pluginId: 'github-repository' }),
    );
    vi.unstubAllGlobals();
  });

  it('removes GitHub live data when it is unchecked while editing', async () => {
    const user = userEvent.setup();
    const repositoryShortcut = {
      id: 'openai-node',
      title: 'OpenAI Node',
      url: 'https://github.com/openai/openai-node',
      enhancement: {
        pluginId: 'github-repository' as const,
        owner: 'openai',
        repository: 'openai-node',
      },
    };
    const adapter = createAdapter({
      ...DEFAULT_SETTINGS,
      shortcuts: [repositoryShortcut],
      shortcutGroups: [],
      pinnedOrder: ['shortcut:openai-node'],
    });
    adapter.loadPluginCache.mockResolvedValue({
      pluginId: 'github-repository',
      configKey: 'openai/openai-node',
      updatedAt: Date.now(),
      data: {
        kind: 'github-repository',
        fullName: 'openai/openai-node',
        description: 'Official JavaScript library',
        stars: 12000,
        forks: 900,
        openIssues: 42,
        url: 'https://github.com/openai/openai-node',
        ownerAvatarUrl: 'https://avatars.githubusercontent.com/u/14957082',
      },
    });

    render(<App adapter={adapter} />);
    await user.click(await screen.findByRole('button', { name: 'Edit shortcut: OpenAI Node' }));
    const enhancementToggle = screen.getByRole('checkbox', { name: 'Show live data on this shortcut' });
    expect(enhancementToggle).toBeChecked();
    await user.click(enhancementToggle);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      const saved = adapter.saveSettings.mock.calls.at(-1)?.[0] as SyncedSettings;
      expect(saved.shortcuts[0]).toEqual({
        id: 'openai-node',
        title: 'OpenAI Node',
        url: 'https://github.com/openai/openai-node',
      });
    });
    expect(adapter.removePluginCache).toHaveBeenCalledWith('openai-node');
    expect(screen.getByRole('button', { name: 'OpenAI Nodegithub.com' })).toHaveTextContent('github.com');
  });

  it('renders configured GitHub account information inside a home-page shortcut', async () => {
    const profileShortcut = {
      id: 'github-account',
      title: 'GitHub',
      url: 'https://github.com/',
      enhancement: {
        pluginId: 'github-profile' as const,
        username: 'octocat',
      },
    };
    const adapter = createAdapter({
      ...DEFAULT_SETTINGS,
      shortcuts: [profileShortcut],
      shortcutGroups: [],
      pinnedOrder: ['shortcut:github-account'],
    });
    adapter.loadPluginCache.mockResolvedValue({
      pluginId: 'github-profile',
      configKey: 'octocat',
      updatedAt: Date.now(),
      data: {
        kind: 'github-profile',
        login: 'octocat',
        name: 'The Octocat',
        avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
        followers: 23900,
        following: 9,
        publicRepositories: 8,
        url: 'https://github.com/octocat',
      },
    });

    render(<App adapter={adapter} />);

    expect(await screen.findByText('@octocat')).toBeVisible();
    expect(screen.getByTitle('Followers')).toHaveTextContent('23.9K');
    expect(screen.getByTitle('Following')).toHaveTextContent('9');
    expect(screen.getByTitle('Public repositories')).toHaveTextContent('8');
  });

  it('keeps component editing out of Settings and offers enhancements in the shortcut editor', async () => {
    const user = userEvent.setup();
    const repositoryShortcut = {
      id: 'openai-node',
      title: 'OpenAI Node',
      url: 'https://github.com/openai/openai-node',
    };
    const adapter = createAdapter({
      ...DEFAULT_SETTINGS,
      shortcuts: [repositoryShortcut],
      shortcutGroups: [],
      pinnedOrder: ['shortcut:openai-node'],
    });

    render(<App adapter={adapter} />);
    await screen.findByRole('heading', { name: 'Pinned' });

    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.queryByRole('button', { name: 'Edit shortcut components' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Edit shortcut: OpenAI Node' }));
    expect(screen.getByRole('region', { name: 'GitHub repository live data is available' })).toBeVisible();
  });
});
