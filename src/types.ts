export type Locale = 'en' | 'zh-CN' | 'ja';
export type LocalePreference = 'auto' | Locale;
export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';
export type SearchEngineId = 'google' | 'bing' | 'duckduckgo';
export type BackgroundPreference = 'none' | 'mist' | 'dunes' | 'midnight' | 'custom';
export type PluginId = 'github-repository' | 'github-profile';
export type PluginSurface = 'shortcut';

export interface Shortcut {
  id: string;
  title: string;
  url: string;
  enhancement?: ShortcutEnhancement;
}

export interface ShortcutGroup {
  id: string;
  title: string;
  shortcutIds: string[];
}

export interface GitHubRepositoryShortcutEnhancement {
  pluginId: 'github-repository';
  owner: string;
  repository: string;
}

export interface GitHubProfileShortcutEnhancement {
  pluginId: 'github-profile';
  username: string;
}

export type ShortcutEnhancement = GitHubRepositoryShortcutEnhancement | GitHubProfileShortcutEnhancement;
export type WidgetInstance = ShortcutEnhancement & { id: string };
export type GitHubRepositoryWidgetInstance = GitHubRepositoryShortcutEnhancement & { id: string };
export type GitHubProfileWidgetInstance = GitHubProfileShortcutEnhancement & { id: string };

export interface PluginCacheEntry {
  pluginId: PluginId;
  configKey: string;
  updatedAt: number;
  data: unknown;
}

export interface SyncedSettings {
  schemaVersion: 8;
  locale: LocalePreference;
  theme: ThemePreference;
  searchEngine: SearchEngineId;
  shortcuts: Shortcut[];
  shortcutGroups: ShortcutGroup[];
  pinnedOrder: string[];
}

export interface LocalUiState {
  expandedFolderIds: string[];
  bookmarkFolderId: string | null;
  background: BackgroundPreference;
}

export interface BookmarkNode {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkNode[];
}

export type UtilityTarget =
  | 'bookmarks'
  | 'passwords'
  | 'downloads'
  | 'history'
  | 'extensions'
  | 'store'
  | 'import';

export type BrowserFlavor = 'chrome' | 'edge';

export interface BrowserAdapter {
  getFaviconUrl(url: string, size?: number): string;
  getBookmarkTree(): Promise<BookmarkNode[]>;
  subscribeToBookmarks(listener: () => void): () => void;
  openUtility(target: UtilityTarget): Promise<void>;
  openReviewPage(): Promise<void>;
  navigateExternal(url: string): Promise<void>;
  loadSettings(): Promise<SyncedSettings>;
  saveSettings(settings: SyncedSettings): Promise<void>;
  subscribeToSettings(listener: (settings: SyncedSettings) => void): () => void;
  loadLocalUiState(): Promise<LocalUiState>;
  saveLocalUiState(state: LocalUiState): Promise<void>;
  loadCustomBackground(): Promise<Blob | null>;
  saveCustomBackground(image: Blob): Promise<void>;
  clearCustomBackground(): Promise<void>;
  hasPluginAccess(pluginId: PluginId): Promise<boolean>;
  requestPluginAccess(pluginId: PluginId): Promise<boolean>;
  loadPluginCache(instanceId: string): Promise<PluginCacheEntry | null>;
  savePluginCache(instanceId: string, entry: PluginCacheEntry): Promise<void>;
  removePluginCache(instanceId: string): Promise<void>;
}
