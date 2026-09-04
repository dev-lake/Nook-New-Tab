import {
  Bookmark,
  Check,
  Clock3,
  Download,
  Edit3,
  FolderPlus,
  GripVertical,
  Grid2X2,
  History,
  KeyRound,
  Languages,
  Moon,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  Sun,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { browserAdapter } from './browser-adapter';
import { builtInBackgroundPath, isValidCustomBackground } from './backgrounds';
import { BookmarkTree } from './components/BookmarkTree';
import { PreferencePopover } from './components/PreferencePopover';
import { SettingsPopover } from './components/SettingsPopover';
import { ShortcutFavicon } from './components/ShortcutFavicon';
import { ShortcutDialog } from './components/ShortcutDialog';
import { ShortcutEnhancementMeta } from './components/ShortcutEnhancementMeta';
import { ShortcutGroupDialog } from './components/ShortcutGroupDialog';
import { ShortcutGroupMenu } from './components/ShortcutGroupMenu';
import { ShortcutPickerDialog } from './components/ShortcutPickerDialog';
import { DEFAULT_SETTINGS } from './defaults';
import { collectBookmarkFolders, findBookmarkFolder } from './bookmarks';
import { greetingForHour, localeForIntl, resolveLocale, translations } from './i18n';
import { buildNavigationTarget, displayDomain } from './search';
import { enhancementInstanceForShortcut } from './plugins/shortcut-enhancements';
import {
  completeReviewPrompt,
  loadReviewPromptState,
  saveReviewPromptState,
  shouldShowReviewPrompt,
  snoozeReviewPrompt,
} from './review-prompt';
import { widgetConfigKey } from './plugins/registry';
import type { WidgetData } from './plugins/types';
import {
  groupOrderKey,
  normalizePinnedOrder,
  reorderPinnedOrder,
  shortcutOrderKey,
  type DropPlacement,
} from './shortcuts';
import type {
  BookmarkNode,
  BackgroundPreference,
  BrowserAdapter,
  LocalePreference,
  ResolvedTheme,
  SearchEngineId,
  Shortcut,
  ShortcutGroup,
  SyncedSettings,
  ThemePreference,
  UtilityTarget,
} from './types';

type AppProps = {
  adapter?: BrowserAdapter;
};

const utilityIcons = {
  bookmarks: Bookmark,
  passwords: KeyRound,
  downloads: Download,
  history: History,
  extensions: Grid2X2,
  store: ShoppingBag,
} satisfies Record<Exclude<UtilityTarget, 'import'>, typeof Bookmark>;

export function App({ adapter = browserAdapter }: AppProps) {
  const [settings, setSettings] = useState<SyncedSettings>(DEFAULT_SETTINGS);
  const [bookmarks, setBookmarks] = useState<BookmarkNode[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [bookmarkFolderId, setBookmarkFolderId] = useState<string | null>(null);
  const [background, setBackground] = useState<BackgroundPreference>('none');
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState<string | null>(null);
  const [localUiLoaded, setLocalUiLoaded] = useState(false);
  const [bookmarksLoading, setBookmarksLoading] = useState(true);
  const [bookmarksError, setBookmarksError] = useState(false);
  const [openPanel, setOpenPanel] = useState<'language' | 'theme' | 'settings' | null>(null);
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null | undefined>(undefined);
  const [editingGroup, setEditingGroup] = useState<ShortcutGroup | null | undefined>(undefined);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const [shortcutPickerOpen, setShortcutPickerOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [reviewPrompt, setReviewPrompt] = useState(() => loadReviewPromptState());
  const [toast, setToast] = useState('');
  const [draggedPinnedKey, setDraggedPinnedKey] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ key: string; placement: DropPlacement } | null>(null);
  const [pinnedScrollEdges, setPinnedScrollEdges] = useState({ top: false, bottom: false });
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const toastTimer = useRef<number | undefined>(undefined);
  const shortcutListRef = useRef<HTMLDivElement>(null);

  const locale = resolveLocale(settings.locale);
  const t = translations[locale];
  const resolvedTheme: ResolvedTheme = settings.theme === 'system'
    ? (systemDark ? 'dark' : 'light')
    : settings.theme;

  const showToast = useCallback((message: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(''), 2800);
  }, []);

  const loadBookmarks = useCallback(async () => {
    setBookmarksLoading(true);
    try {
      setBookmarks(await adapter.getBookmarkTree());
      setBookmarksError(false);
    } catch {
      setBookmarksError(true);
    } finally {
      setBookmarksLoading(false);
    }
  }, [adapter]);

  useEffect(() => {
    let active = true;
    void Promise.allSettled([
      adapter.loadSettings(),
      adapter.loadLocalUiState(),
      adapter.loadCustomBackground(),
    ]).then(([settingsResult, uiResult, backgroundResult]) => {
      if (!active) return;
      if (settingsResult.status === 'fulfilled') {
        setSettings(settingsResult.value);
      }
      if (uiResult.status === 'fulfilled') {
        setExpandedIds(new Set(uiResult.value.expandedFolderIds));
        setBookmarkFolderId(uiResult.value.bookmarkFolderId);
        setBackground(uiResult.value.background);
      }
      if (backgroundResult.status === 'fulfilled' && backgroundResult.value && typeof URL.createObjectURL === 'function') {
        try {
          setCustomBackgroundUrl(URL.createObjectURL(backgroundResult.value));
        } catch {
          setCustomBackgroundUrl(null);
        }
      }
      setLocalUiLoaded(true);
    });
    void loadBookmarks();
    const unsubscribeBookmarks = adapter.subscribeToBookmarks(() => void loadBookmarks());
    const unsubscribeSettings = adapter.subscribeToSettings((nextSettings) => setSettings(nextSettings));
    return () => {
      active = false;
      unsubscribeBookmarks();
      unsubscribeSettings();
    };
  }, [adapter, loadBookmarks]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  useLayoutEffect(() => {
    if (!localUiLoaded) return;
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.lang = locale;
    document.title = t.pageTitle;
    try {
      window.localStorage.setItem('nook-theme', settings.theme);
    } catch {
      // A disabled storage backend should not prevent the New Tab page from rendering.
    }
  }, [localUiLoaded, locale, resolvedTheme, settings.theme, t.pageTitle]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  useEffect(() => () => {
    if (customBackgroundUrl && typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(customBackgroundUrl);
    }
  }, [customBackgroundUrl]);

  const saveSettings = useCallback(async (next: SyncedSettings, successMessage?: string) => {
    const previous = settings;
    setSettings(next);
    try {
      await adapter.saveSettings(next);
      if (successMessage) showToast(successMessage);
    } catch {
      setSettings(previous);
      showToast(t.saveFailed);
    }
  }, [adapter, settings, showToast, t.saveFailed]);

  const updateSettings = <K extends keyof SyncedSettings>(key: K, value: SyncedSettings[K]) => {
    void saveSettings({ ...settings, [key]: value });
  };

  const handleFolderToggle = useCallback((node: BookmarkNode, expanded: boolean) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (expanded) next.add(node.id);
      else next.delete(node.id);
      void adapter.saveLocalUiState({
        expandedFolderIds: [...next],
        bookmarkFolderId,
        background,
      }).catch(() => showToast(t.saveFailed));
      return next;
    });
    showToast(expanded ? t.folderExpanded(node.title) : t.folderCollapsed(node.title));
  }, [adapter, background, bookmarkFolderId, showToast, t]);

  const bookmarkFolders = useMemo(() => collectBookmarkFolders(bookmarks), [bookmarks]);
  const selectedBookmarkFolder = useMemo(
    () => bookmarkFolderId ? findBookmarkFolder(bookmarks, bookmarkFolderId) : null,
    [bookmarks, bookmarkFolderId],
  );
  const visibleBookmarks = bookmarkFolderId && selectedBookmarkFolder
    ? (selectedBookmarkFolder.children ?? [])
    : bookmarks;
  const pinnedShortcutUrls = useMemo(
    () => new Set(settings.shortcuts.map((shortcut) => new URL(shortcut.url).toString())),
    [settings.shortcuts],
  );
  const shortcutById = useMemo(
    () => new Map(settings.shortcuts.map((shortcut) => [shortcut.id, shortcut])),
    [settings.shortcuts],
  );
  const groupById = useMemo(
    () => new Map(settings.shortcutGroups.map((group) => [group.id, group])),
    [settings.shortcutGroups],
  );
  const currentPinnedOrder = useMemo(
    () => normalizePinnedOrder(settings.pinnedOrder, settings.shortcuts, settings.shortcutGroups),
    [settings.pinnedOrder, settings.shortcutGroups, settings.shortcuts],
  );
  const updatePinnedScrollEdges = useCallback(() => {
    const list = shortcutListRef.current;
    if (!list) return;
    const next = {
      top: list.scrollTop > 1,
      bottom: list.scrollTop + list.clientHeight < list.scrollHeight - 1,
    };
    setPinnedScrollEdges((current) => (
      current.top === next.top && current.bottom === next.bottom ? current : next
    ));
  }, []);

  useEffect(() => {
    if (!localUiLoaded) return;
    const list = shortcutListRef.current;
    if (!list) return;
    updatePinnedScrollEdges();
    window.addEventListener('resize', updatePinnedScrollEdges);
    const observer = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(updatePinnedScrollEdges);
    observer?.observe(list);
    return () => {
      window.removeEventListener('resize', updatePinnedScrollEdges);
      observer?.disconnect();
    };
  }, [currentPinnedOrder.length, localUiLoaded, updatePinnedScrollEdges]);

  useEffect(() => {
    if (!localUiLoaded || bookmarksLoading || !bookmarkFolderId || selectedBookmarkFolder) return;
    setBookmarkFolderId(null);
    void adapter.saveLocalUiState({
      expandedFolderIds: [...expandedIds],
      bookmarkFolderId: null,
      background,
    }).catch(() => showToast(t.saveFailed));
  }, [adapter, background, bookmarkFolderId, bookmarksLoading, expandedIds, localUiLoaded, selectedBookmarkFolder, showToast, t.saveFailed]);

  const handleBookmarkFolderChange = (nextFolderId: string | null) => {
    const previous = bookmarkFolderId;
    setBookmarkFolderId(nextFolderId);
    void adapter.saveLocalUiState({
      expandedFolderIds: [...expandedIds],
      bookmarkFolderId: nextFolderId,
      background,
    }).catch(() => {
      setBookmarkFolderId(previous);
      showToast(t.saveFailed);
    });
  };

  const handleBackgroundChange = (nextBackground: BackgroundPreference) => {
    const previous = background;
    setBackground(nextBackground);
    void adapter.saveLocalUiState({
      expandedFolderIds: [...expandedIds],
      bookmarkFolderId,
      background: nextBackground,
    }).catch(() => {
      setBackground(previous);
      showToast(t.saveFailed);
    });
  };

  const handleCustomBackgroundUpload = async (file: File) => {
    if (!isValidCustomBackground(file)) {
      showToast(t.invalidBackground);
      return;
    }
    try {
      await adapter.saveCustomBackground(file);
      if (typeof URL.createObjectURL === 'function') {
        setCustomBackgroundUrl(URL.createObjectURL(file));
      }
      handleBackgroundChange('custom');
    } catch {
      showToast(t.saveFailed);
    }
  };

  const handleRemoveCustomBackground = async () => {
    try {
      await adapter.clearCustomBackground();
      setCustomBackgroundUrl(null);
      if (background === 'custom') handleBackgroundChange('none');
    } catch {
      showToast(t.saveFailed);
    }
  };

  const navigate = useCallback(async (url: string) => {
    try {
      await adapter.navigateExternal(url);
    } catch {
      showToast(t.openFailed);
    }
  }, [adapter, showToast, t.openFailed]);

  const openUtility = useCallback(async (target: UtilityTarget) => {
    try {
      await adapter.openUtility(target);
    } catch {
      showToast(t.openFailed);
    }
  }, [adapter, showToast, t.openFailed]);

  const openReviewPage = useCallback(async () => {
    const previous = reviewPrompt;
    const completed = completeReviewPrompt();
    setReviewPrompt(completed);
    saveReviewPromptState(completed);
    try {
      await adapter.openReviewPage();
    } catch {
      setReviewPrompt(previous);
      saveReviewPromptState(previous);
      showToast(t.openFailed);
    }
  }, [adapter, reviewPrompt, showToast, t.openFailed]);

  const dismissReviewPrompt = useCallback(() => {
    const snoozed = snoozeReviewPrompt();
    setReviewPrompt(snoozed);
    saveReviewPromptState(snoozed);
  }, []);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const query = String(form.get('query') ?? '').trim();
    if (query) void navigate(buildNavigationTarget(query, settings.searchEngine));
  };

  const saveShortcut = async (value: Omit<Shortcut, 'id'>, prefetchedData?: WidgetData) => {
    const isEditing = editingShortcut !== null && editingShortcut !== undefined;
    const nextShortcut: Shortcut = isEditing
      ? {
          id: editingShortcut.id,
          title: value.title,
          url: value.url,
          ...(value.enhancement ? { enhancement: value.enhancement } : {}),
        }
      : { id: crypto.randomUUID(), ...value };
    const nextShortcuts = isEditing
      ? settings.shortcuts.map((item) => item.id === nextShortcut.id ? nextShortcut : item)
      : [...settings.shortcuts, nextShortcut];
    const nextOrder = isEditing
      ? currentPinnedOrder
      : [...currentPinnedOrder, shortcutOrderKey(nextShortcut.id)];
    const previousInstance = isEditing && editingShortcut
      ? enhancementInstanceForShortcut(editingShortcut)
      : null;
    const nextInstance = enhancementInstanceForShortcut(nextShortcut);
    if (nextInstance && prefetchedData) {
      await adapter.savePluginCache(nextShortcut.id, {
        pluginId: nextInstance.pluginId,
        configKey: widgetConfigKey(nextInstance),
        updatedAt: Date.now(),
        data: prefetchedData,
      }).catch(() => undefined);
    } else if (previousInstance && (!nextInstance || widgetConfigKey(previousInstance) !== widgetConfigKey(nextInstance))) {
      await adapter.removePluginCache(nextShortcut.id).catch(() => undefined);
    }
    setEditingShortcut(undefined);
    setShortcutPickerOpen(false);
    await saveSettings({ ...settings, shortcuts: nextShortcuts, pinnedOrder: nextOrder }, t.shortcutSaved);
  };

  const pinBookmark = (node: BookmarkNode) => {
    if (!node.url || pinnedShortcutUrls.has(new URL(node.url).toString())) return;
    void saveShortcut({
      title: node.title.trim() || displayDomain(node.url),
      url: new URL(node.url).toString(),
    });
  };

  const deleteShortcut = () => {
    if (!editingShortcut) return;
    const next = settings.shortcuts.filter((item) => item.id !== editingShortcut.id);
    const nextGroups = settings.shortcutGroups
      .map((group) => ({ ...group, shortcutIds: group.shortcutIds.filter((id) => id !== editingShortcut.id) }))
      .filter((group) => group.shortcutIds.length >= 2);
    const nextGroupIds = new Set(nextGroups.map((group) => group.id));
    const nextOrderBase = currentPinnedOrder.flatMap((key) => {
      if (key === shortcutOrderKey(editingShortcut.id)) return [];
      if (!key.startsWith('group:')) return [key];
      const groupId = key.slice('group:'.length);
      if (nextGroupIds.has(groupId)) return [key];
      const dissolvedGroup = groupById.get(groupId);
      return dissolvedGroup
        ? dissolvedGroup.shortcutIds
            .filter((id) => id !== editingShortcut.id)
            .map(shortcutOrderKey)
        : [];
    });
    const nextOrder = normalizePinnedOrder(nextOrderBase, next, nextGroups);
    if (editingShortcut.enhancement) {
      void adapter.removePluginCache(editingShortcut.id).catch(() => undefined);
    }
    setEditingShortcut(undefined);
    void saveSettings({ ...settings, shortcuts: next, shortcutGroups: nextGroups, pinnedOrder: nextOrder }, t.shortcutDeleted);
  };

  const saveShortcutGroup = (value: Pick<ShortcutGroup, 'title' | 'shortcutIds'>) => {
    const nextGroup: ShortcutGroup = editingGroup
      ? { ...editingGroup, ...value }
      : { id: crypto.randomUUID(), ...value };
    const selectedIds = new Set(nextGroup.shortcutIds);
    const nextGroups = settings.shortcutGroups
      .filter((group) => group.id !== nextGroup.id)
      .map((group) => ({ ...group, shortcutIds: group.shortcutIds.filter((id) => !selectedIds.has(id)) }))
      .filter((group) => group.shortcutIds.length >= 2);
    const previousIndex = settings.shortcutGroups.findIndex((group) => group.id === nextGroup.id);
    nextGroups.splice(previousIndex < 0 ? nextGroups.length : Math.min(previousIndex, nextGroups.length), 0, nextGroup);
    const targetGroupKey = groupOrderKey(nextGroup.id);
    const selectedShortcutKeys = new Set(nextGroup.shortcutIds.map(shortcutOrderKey));
    const affectedGroupKeys = new Set(
      settings.shortcutGroups
        .filter((group) => group.id === nextGroup.id || group.shortcutIds.some((id) => selectedIds.has(id)))
        .map((group) => groupOrderKey(group.id)),
    );
    const anchorKeys = new Set<string>([targetGroupKey, ...selectedShortcutKeys, ...affectedGroupKeys]);
    const nextGroupIds = new Set(nextGroups.map((group) => group.id));
    const insertionMarker = '\0nook-group-insertion';
    let markerInserted = false;
    const nextOrderBase = currentPinnedOrder.flatMap((key) => {
      const values: string[] = [];
      if (!markerInserted && anchorKeys.has(key)) {
        values.push(insertionMarker);
        markerInserted = true;
      }
      if (key === targetGroupKey || selectedShortcutKeys.has(key)) return values;
      if (key.startsWith('group:')) {
        const groupId = key.slice('group:'.length);
        if (!nextGroupIds.has(groupId)) {
          const dissolvedGroup = groupById.get(groupId);
          if (dissolvedGroup) {
            values.push(...dissolvedGroup.shortcutIds
              .filter((id) => !selectedIds.has(id))
              .map(shortcutOrderKey));
          }
          return values;
        }
      }
      values.push(key);
      return values;
    });
    if (!markerInserted) nextOrderBase.push(insertionMarker);
    const nextOrder = normalizePinnedOrder(
      nextOrderBase.map((key) => key === insertionMarker ? targetGroupKey : key),
      settings.shortcuts,
      nextGroups,
    );
    setEditingGroup(undefined);
    setOpenGroupId(null);
    void saveSettings({ ...settings, shortcutGroups: nextGroups, pinnedOrder: nextOrder }, t.groupSaved);
  };

  const deleteShortcutGroup = () => {
    if (!editingGroup) return;
    const nextGroups = settings.shortcutGroups.filter((group) => group.id !== editingGroup.id);
    const targetGroupKey = groupOrderKey(editingGroup.id);
    const nextOrderBase = currentPinnedOrder.flatMap((key) => (
      key === targetGroupKey ? editingGroup.shortcutIds.map(shortcutOrderKey) : [key]
    ));
    const nextOrder = normalizePinnedOrder(nextOrderBase, settings.shortcuts, nextGroups);
    setEditingGroup(undefined);
    setOpenGroupId(null);
    void saveSettings({ ...settings, shortcutGroups: nextGroups, pinnedOrder: nextOrder }, t.groupDeleted);
  };

  const dropPlacementForEvent = (
    event: React.DragEvent<HTMLElement>,
    targetKey: string,
    sourceKey = draggedPinnedKey || event.dataTransfer.getData('text/plain'),
  ): DropPlacement => {
    if (targetKey === currentPinnedOrder[0] && sourceKey !== targetKey) return 'before';
    const bounds = event.currentTarget.getBoundingClientRect();
    const verticalPosition = (event.clientY - bounds.top) / bounds.height;
    if (verticalPosition < 0.35) return 'before';
    if (verticalPosition > 0.65) return 'after';
    return event.clientX < bounds.left + bounds.width / 2 ? 'before' : 'after';
  };

  const handlePinnedDrop = (event: React.DragEvent<HTMLDivElement>, targetKey: string) => {
    event.preventDefault();
    const sourceKey = draggedPinnedKey || event.dataTransfer.getData('text/plain');
    const placement = dropTarget?.key === targetKey
      ? dropTarget.placement
      : dropPlacementForEvent(event, targetKey, sourceKey);
    setDraggedPinnedKey(null);
    setDropTarget(null);
    const nextOrder = reorderPinnedOrder(currentPinnedOrder, sourceKey, targetKey, placement);
    if (nextOrder === currentPinnedOrder) return;
    void saveSettings({ ...settings, pinnedOrder: nextOrder }, t.shortcutsReordered);
  };

  const dateText = new Intl.DateTimeFormat(localeForIntl(locale), {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(now);
  const timeText = new Intl.DateTimeFormat(localeForIntl(locale), {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);

  const utilities = useMemo(() => [
    { id: 'bookmarks' as const, title: t.bookmarksTitle },
    { id: 'passwords' as const, title: t.passwordsTitle },
    { id: 'downloads' as const, title: t.downloadsTitle },
    { id: 'history' as const, title: t.historyTitle },
    { id: 'extensions' as const, title: t.extensionsTitle },
    { id: 'store' as const, title: t.storeTitle },
  ], [t]);

  const openShortcutGroup = settings.shortcutGroups.find((group) => group.id === openGroupId);
  const openGroupShortcuts = openShortcutGroup
    ? openShortcutGroup.shortcutIds.flatMap((id) => shortcutById.get(id) ?? [])
    : [];

  const backgroundImageUrl = background === 'custom'
    ? customBackgroundUrl
    : builtInBackgroundPath(background);

  if (!localUiLoaded) {
    return (
      <div className="app-loading" aria-label="Nook" aria-busy="true">
        <span className="app-loading-mark" aria-hidden="true">N</span>
      </div>
    );
  }

  return (
    <div
      className="app-shell"
      data-background={backgroundImageUrl ? 'true' : undefined}
      style={backgroundImageUrl
        ? { '--nook-background-image': `url("${backgroundImageUrl}")` } as React.CSSProperties
        : undefined}
    >
      <BookmarkTree
        nodes={visibleBookmarks}
        expandedIds={expandedIds}
        loading={bookmarksLoading}
        error={bookmarksError}
        adapter={adapter}
        bookmarkFolderId={bookmarkFolderId && selectedBookmarkFolder ? bookmarkFolderId : null}
        bookmarkFolders={bookmarkFolders}
        pinnedUrls={pinnedShortcutUrls}
        t={t}
        onToggle={handleFolderToggle}
        onBookmarkFolderChange={handleBookmarkFolderChange}
        onNavigate={(url) => void navigate(url)}
        onPinBookmark={pinBookmark}
        onViewAll={() => void openUtility('bookmarks')}
        onRetry={() => void loadBookmarks()}
      />

      <main className="main-pane" id="main">
        <header className="topbar">
          <form className="search-box" role="search" onSubmit={handleSearch}>
            <Search size={20} aria-hidden="true" />
            <label className="sr-only" htmlFor="nook-search">{t.searchLabel}</label>
            <input id="nook-search" name="query" autoComplete="off" placeholder={t.searchPlaceholder} />
            <kbd>⌘K</kbd>
          </form>
          <div className="top-actions">
            <div className="top-action-slot">
              <button
                className="language-button"
                type="button"
                onClick={() => setOpenPanel((current) => current === 'language' ? null : 'language')}
                aria-label={t.language}
                aria-expanded={openPanel === 'language'}
              >
                <Languages size={18} />
                <span>{locale === 'zh-CN' ? '简体中文' : locale === 'ja' ? '日本語' : 'English'}</span>
              </button>
              <PreferencePopover<LocalePreference>
                open={openPanel === 'language'}
                label={t.language}
                closeLabel={t.cancel}
                value={settings.locale}
                options={[
                  { value: 'auto', label: t.auto },
                  { value: 'en', label: 'English' },
                  { value: 'zh-CN', label: '简体中文' },
                  { value: 'ja', label: '日本語' },
                ]}
                onChange={(value) => updateSettings('locale', value)}
                onClose={() => setOpenPanel(null)}
              />
            </div>
            <div className="top-action-slot">
              <button
                className="icon-button"
                type="button"
                aria-label={t.appearance}
                aria-expanded={openPanel === 'theme'}
                onClick={() => setOpenPanel((current) => current === 'theme' ? null : 'theme')}
              >
                {resolvedTheme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
              </button>
              <PreferencePopover<ThemePreference>
                open={openPanel === 'theme'}
                label={t.appearance}
                closeLabel={t.cancel}
                value={settings.theme}
                options={[
                  { value: 'system', label: t.system },
                  { value: 'light', label: t.light },
                  { value: 'dark', label: t.dark },
                ]}
                onChange={(value) => updateSettings('theme', value)}
                onClose={() => setOpenPanel(null)}
              />
            </div>
            <div className="top-action-slot">
              <button
                className="icon-button"
                type="button"
                aria-label={t.settings}
                aria-expanded={openPanel === 'settings'}
                onClick={() => setOpenPanel((current) => current === 'settings' ? null : 'settings')}
              >
                <Settings size={19} />
              </button>
              <SettingsPopover
                open={openPanel === 'settings'}
                t={t}
                searchEngine={settings.searchEngine}
                background={backgroundImageUrl || background !== 'custom' ? background : 'none'}
                customBackgroundUrl={customBackgroundUrl}
                onClose={() => setOpenPanel(null)}
                onSearchEngineChange={(value: SearchEngineId) => updateSettings('searchEngine', value)}
                onBackgroundChange={handleBackgroundChange}
                onCustomBackgroundUpload={(file) => void handleCustomBackgroundUpload(file)}
                onRemoveCustomBackground={() => void handleRemoveCustomBackground()}
                onImportBookmarks={() => void openUtility('import')}
              />
            </div>
          </div>
        </header>

        <section className="content-area">
          <section className="greeting" aria-label={`${timeText} ${dateText}`}>
            <div className="time-line"><Clock3 size={17} /><time>{timeText}</time><span>{dateText}</span></div>
            <h1>{greetingForHour(t, now.getHours())}</h1>
          </section>

          <section className="pinned-section">
            <div className="section-heading">
              <h2>{t.pinned}</h2>
              <div className="pinned-heading-actions">
                <button
                  className="add-shortcut"
                  type="button"
                  disabled={settings.shortcuts.length < 2}
                  onClick={() => setEditingGroup(null)}
                >
                  <FolderPlus size={14} />
                  {t.createGroup}
                </button>
                <button className="add-shortcut" type="button" onClick={() => setShortcutPickerOpen(true)}>
                  <Plus size={14} />
                  {t.addShortcut}
                </button>
              </div>
            </div>
            <div
              className="shortcut-list"
              ref={shortcutListRef}
              data-fade-top={pinnedScrollEdges.top || undefined}
              data-fade-bottom={pinnedScrollEdges.bottom || undefined}
              onScroll={updatePinnedScrollEdges}
            >
              {currentPinnedOrder.map((orderKey) => {
                const dragClassName = `${draggedPinnedKey === orderKey ? ' is-dragging' : ''}${dropTarget?.key === orderKey ? ` drop-${dropTarget.placement}` : ''}`;
                const dragHandlers = {
                  draggable: true,
                  onDragStart: (event: React.DragEvent<HTMLDivElement>) => {
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData('text/plain', orderKey);
                    setDraggedPinnedKey(orderKey);
                  },
                  onDragOver: (event: React.DragEvent<HTMLDivElement>) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                    const placement = dropPlacementForEvent(event, orderKey);
                    if (dropTarget?.key !== orderKey || dropTarget.placement !== placement) {
                      setDropTarget({ key: orderKey, placement });
                    }
                  },
                  onDrop: (event: React.DragEvent<HTMLDivElement>) => handlePinnedDrop(event, orderKey),
                  onDragEnd: () => {
                    setDraggedPinnedKey(null);
                    setDropTarget(null);
                  },
                };

                if (orderKey.startsWith('shortcut:')) {
                  const shortcut = shortcutById.get(orderKey.slice('shortcut:'.length));
                  if (!shortcut) return null;
                  return (
                    <div
                      className={`shortcut${dragClassName}`}
                      key={orderKey}
                      {...dragHandlers}
                    >
                      <button className="shortcut-open" type="button" onClick={() => void navigate(shortcut.url)}>
                        <ShortcutFavicon adapter={adapter} title={shortcut.title} url={shortcut.url} />
                        <span>
                          <strong>{shortcut.title}</strong>
                          {shortcut.enhancement
                            ? <ShortcutEnhancementMeta adapter={adapter} shortcut={shortcut} locale={locale} t={t} />
                            : <small>{displayDomain(shortcut.url)}</small>}
                        </span>
                      </button>
                      <span className="shortcut-drag-indicator" title={t.dragShortcut(shortcut.title)} aria-hidden="true">
                        <GripVertical size={13} />
                      </span>
                      <button
                        className="shortcut-edit"
                        type="button"
                        aria-label={`${t.editShortcut}: ${shortcut.title}`}
                        onClick={() => setEditingShortcut(shortcut)}
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  );
                }

                const group = groupById.get(orderKey.slice('group:'.length));
                if (!group) return null;
                const members = group.shortcutIds.flatMap((id) => shortcutById.get(id) ?? []);
                return (
                  <div
                    className={`shortcut shortcut-group-card${dragClassName}`}
                    key={orderKey}
                    {...dragHandlers}
                  >
                    <button
                      className="shortcut-open group-open"
                      type="button"
                      aria-label={t.openGroup(group.title, members.length)}
                      onClick={() => setOpenGroupId(group.id)}
                    >
                      <span className="group-mark" aria-hidden="true">
                        {members.slice(0, 4).map((shortcut) => (
                          <ShortcutFavicon key={shortcut.id} adapter={adapter} title={shortcut.title} url={shortcut.url} />
                        ))}
                      </span>
                      <span><strong>{group.title}</strong><small>{t.groupItemCount(members.length)}</small></span>
                    </button>
                    <span className="shortcut-drag-indicator" title={t.dragShortcut(group.title)} aria-hidden="true">
                      <GripVertical size={13} />
                    </span>
                    <button className="shortcut-edit" type="button" aria-label={`${t.editGroup}: ${group.title}`} onClick={() => setEditingGroup(group)}>
                      <Edit3 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="utility-section">
            <div className="section-heading">
              <h2>{t.browserUtilities}</h2>
            </div>
            <div className="utility-grid">
              {utilities.map((utility) => {
                const Icon = utilityIcons[utility.id];
                return (
                  <button
                    key={utility.id}
                    className="utility-card"
                    type="button"
                    aria-label={utility.title}
                    title={utility.title}
                    onClick={() => void openUtility(utility.id)}
                  >
                    <span className="card-icon"><Icon size={16} /></span>
                    <span className="utility-name" aria-hidden="true">{utility.title}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <footer className="privacy-note"><ShieldCheck size={15} /><span>{t.privacy}</span></footer>
        </section>
      </main>

      {editingShortcut !== undefined && (
        <ShortcutDialog
          adapter={adapter}
          locale={locale}
          shortcut={editingShortcut}
          t={t}
          onCancel={() => setEditingShortcut(undefined)}
          onSave={saveShortcut}
          onDelete={editingShortcut ? deleteShortcut : undefined}
        />
      )}

      {shortcutPickerOpen && (
        <ShortcutPickerDialog
          adapter={adapter}
          existingShortcuts={settings.shortcuts}
          locale={locale}
          t={t}
          onCancel={() => setShortcutPickerOpen(false)}
          onSelect={saveShortcut}
          onCustom={() => {
            setShortcutPickerOpen(false);
            setEditingShortcut(null);
          }}
        />
      )}

      {editingGroup !== undefined && (
        <ShortcutGroupDialog
          adapter={adapter}
          group={editingGroup}
          shortcuts={settings.shortcuts}
          t={t}
          onCancel={() => setEditingGroup(undefined)}
          onSave={saveShortcutGroup}
          onDelete={editingGroup ? deleteShortcutGroup : undefined}
        />
      )}

      {openShortcutGroup && (
        <ShortcutGroupMenu
          adapter={adapter}
          locale={locale}
          group={openShortcutGroup}
          shortcuts={openGroupShortcuts}
          t={t}
          onClose={() => setOpenGroupId(null)}
          onEdit={() => {
            setOpenGroupId(null);
            setEditingGroup(openShortcutGroup);
          }}
          onNavigate={(url) => void navigate(url)}
        />
      )}

      <div className="toast" role="status" aria-live="polite" data-visible={Boolean(toast)}>
        <Check size={16} />
        {toast}
      </div>

      {shouldShowReviewPrompt(reviewPrompt, now.getTime()) && (
        <aside className="rating-prompt" aria-label={t.rateNook}>
          <button className="rating-prompt-link" type="button" onClick={() => void openReviewPage()}>
            <Star size={15} aria-hidden="true" />
            <span>{t.rateNook}</span>
          </button>
          <button
            className="rating-prompt-close"
            type="button"
            aria-label={t.dismissRatingPrompt}
            title={t.dismissRatingPrompt}
            onClick={dismissReviewPrompt}
          >
            <X size={13} aria-hidden="true" />
          </button>
        </aside>
      )}
    </div>
  );
}
