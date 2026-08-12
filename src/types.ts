export type Locale = 'en' | 'zh-CN' | 'ja';
export type LocalePreference = 'auto' | Locale;
export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';
export type SearchEngineId = 'google' | 'bing' | 'duckduckgo';

export interface Shortcut {
  id: string;
  title: string;
  url: string;
}

export interface SyncedSettings {
  schemaVersion: 1;
  locale: LocalePreference;
  theme: ThemePreference;
  searchEngine: SearchEngineId;
  shortcuts: Shortcut[];
}

export interface LocalUiState {
  expandedFolderIds: string[];
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
  navigateExternal(url: string): Promise<void>;
  loadSettings(): Promise<SyncedSettings>;
  saveSettings(settings: SyncedSettings): Promise<void>;
  subscribeToSettings(listener: (settings: SyncedSettings) => void): () => void;
  loadLocalUiState(): Promise<LocalUiState>;
  saveLocalUiState(state: LocalUiState): Promise<void>;
}
