import {
  Bookmark,
  Check,
  Clock3,
  Download,
  Edit3,
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
  Sun,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { browserAdapter } from './browser-adapter';
import { BookmarkTree } from './components/BookmarkTree';
import { PreferencePopover } from './components/PreferencePopover';
import { SettingsPopover } from './components/SettingsPopover';
import { ShortcutFavicon } from './components/ShortcutFavicon';
import { ShortcutDialog } from './components/ShortcutDialog';
import { DEFAULT_SETTINGS, MAX_SHORTCUTS } from './defaults';
import { greetingForHour, localeForIntl, resolveLocale, translations } from './i18n';
import { buildNavigationTarget, displayDomain } from './search';
import { reorderShortcuts, type DropPlacement } from './shortcuts';
import type {
  BookmarkNode,
  BrowserAdapter,
  LocalePreference,
  ResolvedTheme,
  SearchEngineId,
  Shortcut,
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
  const [bookmarksLoading, setBookmarksLoading] = useState(true);
  const [bookmarksError, setBookmarksError] = useState(false);
  const [openPanel, setOpenPanel] = useState<'language' | 'theme' | 'settings' | null>(null);
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null | undefined>(undefined);
  const [now, setNow] = useState(() => new Date());
  const [toast, setToast] = useState('');
  const [draggedShortcutId, setDraggedShortcutId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; placement: DropPlacement } | null>(null);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const toastTimer = useRef<number | undefined>(undefined);

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
    void Promise.all([adapter.loadSettings(), adapter.loadLocalUiState()]).then(([nextSettings, ui]) => {
      if (!active) return;
      setSettings(nextSettings);
      setExpandedIds(new Set(ui.expandedFolderIds));
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

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.lang = locale;
    document.title = t.pageTitle;
  }, [locale, resolvedTheme, t.pageTitle]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

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
      void adapter.saveLocalUiState({ expandedFolderIds: [...next] }).catch(() => showToast(t.saveFailed));
      return next;
    });
    showToast(expanded ? t.folderExpanded(node.title) : t.folderCollapsed(node.title));
  }, [adapter, showToast, t]);

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

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const query = String(form.get('query') ?? '').trim();
    if (query) void navigate(buildNavigationTarget(query, settings.searchEngine));
  };

  const saveShortcut = (value: Omit<Shortcut, 'id'>) => {
    const isEditing = editingShortcut !== null && editingShortcut !== undefined;
    const nextShortcut: Shortcut = isEditing
      ? { ...editingShortcut, ...value }
      : { id: crypto.randomUUID(), ...value };
    const nextShortcuts = isEditing
      ? settings.shortcuts.map((item) => item.id === nextShortcut.id ? nextShortcut : item)
      : [...settings.shortcuts, nextShortcut];
    setEditingShortcut(undefined);
    void saveSettings({ ...settings, shortcuts: nextShortcuts }, t.shortcutSaved);
  };

  const deleteShortcut = () => {
    if (!editingShortcut) return;
    const next = settings.shortcuts.filter((item) => item.id !== editingShortcut.id);
    setEditingShortcut(undefined);
    void saveSettings({ ...settings, shortcuts: next }, t.shortcutDeleted);
  };

  const dropPlacementForEvent = (event: React.DragEvent<HTMLElement>): DropPlacement => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const verticalPosition = (event.clientY - bounds.top) / bounds.height;
    if (verticalPosition < 0.35) return 'before';
    if (verticalPosition > 0.65) return 'after';
    return event.clientX < bounds.left + bounds.width / 2 ? 'before' : 'after';
  };

  const handleShortcutDrop = (event: React.DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault();
    const sourceId = draggedShortcutId || event.dataTransfer.getData('text/plain');
    const placement = dropTarget?.id === targetId
      ? dropTarget.placement
      : dropPlacementForEvent(event);
    setDraggedShortcutId(null);
    setDropTarget(null);
    const nextShortcuts = reorderShortcuts(settings.shortcuts, sourceId, targetId, placement);
    if (nextShortcuts === settings.shortcuts) return;
    void saveSettings({ ...settings, shortcuts: nextShortcuts }, t.shortcutsReordered);
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

  return (
    <div className="app-shell">
      <BookmarkTree
        nodes={bookmarks}
        expandedIds={expandedIds}
        loading={bookmarksLoading}
        error={bookmarksError}
        t={t}
        onToggle={handleFolderToggle}
        onNavigate={(url) => void navigate(url)}
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
                onClose={() => setOpenPanel(null)}
                onSearchEngineChange={(value: SearchEngineId) => updateSettings('searchEngine', value)}
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
            <div className="section-heading"><h2>{t.pinned}</h2></div>
            <div className="shortcut-list">
              {settings.shortcuts.map((shortcut) => (
                <div
                  className={`shortcut${draggedShortcutId === shortcut.id ? ' is-dragging' : ''}${dropTarget?.id === shortcut.id ? ` drop-${dropTarget.placement}` : ''}`}
                  key={shortcut.id}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData('text/plain', shortcut.id);
                    setDraggedShortcutId(shortcut.id);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                    const placement = dropPlacementForEvent(event);
                    if (dropTarget?.id !== shortcut.id || dropTarget.placement !== placement) {
                      setDropTarget({ id: shortcut.id, placement });
                    }
                  }}
                  onDrop={(event) => handleShortcutDrop(event, shortcut.id)}
                  onDragEnd={() => {
                    setDraggedShortcutId(null);
                    setDropTarget(null);
                  }}
                >
                  <button className="shortcut-open" type="button" onClick={() => void navigate(shortcut.url)}>
                    <ShortcutFavicon adapter={adapter} title={shortcut.title} url={shortcut.url} />
                    <span><strong>{shortcut.title}</strong><small>{displayDomain(shortcut.url)}</small></span>
                  </button>
                  <span className="shortcut-drag-indicator" title={t.dragShortcut(shortcut.title)} aria-hidden="true">
                    <GripVertical size={13} />
                  </span>
                  <button className="shortcut-edit" type="button" aria-label={`${t.editShortcut}: ${shortcut.title}`} onClick={() => setEditingShortcut(shortcut)}>
                    <Edit3 size={14} />
                  </button>
                </div>
              ))}
              <button className="add-shortcut" type="button" onClick={() => {
                if (settings.shortcuts.length >= MAX_SHORTCUTS) showToast(t.shortcutLimit);
                else setEditingShortcut(null);
              }}>
                <Plus size={18} />
                {t.addShortcut}
              </button>
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
          shortcut={editingShortcut}
          t={t}
          onCancel={() => setEditingShortcut(undefined)}
          onSave={saveShortcut}
          onDelete={editingShortcut ? deleteShortcut : undefined}
        />
      )}

      <div className="toast" role="status" aria-live="polite" data-visible={Boolean(toast)}>
        <Check size={16} />
        {toast}
      </div>
    </div>
  );
}
