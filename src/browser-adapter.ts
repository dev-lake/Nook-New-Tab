import { browser } from 'wxt/browser';
import { clearCustomBackground, loadCustomBackground, saveCustomBackground } from './background-storage';
import { normalizeBookmarkTree } from './bookmarks';
import { detectBrowserFlavor, utilityUrl } from './browser-targets';
import { sanitizeLocalUiState, sanitizeSettings } from './storage';
import type {
  BookmarkNode,
  BrowserAdapter,
  LocalUiState,
  SyncedSettings,
  UtilityTarget,
} from './types';

const SETTINGS_KEY = 'settings';
const LOCAL_UI_KEY = 'uiState';

async function updateCurrentTab(url: string): Promise<void> {
  await browser.tabs.update({ url });
}

export const browserAdapter: BrowserAdapter = {
  getFaviconUrl(url, size = 32) {
    // WXT types generated public assets, while Chromium exposes this virtual path at runtime.
    const getRuntimeUrl = browser.runtime.getURL as unknown as (path: string) => string;
    const faviconUrl = new URL(getRuntimeUrl('/_favicon/'));
    faviconUrl.searchParams.set('pageUrl', url);
    faviconUrl.searchParams.set('size', String(size));
    return faviconUrl.toString();
  },

  async getBookmarkTree(): Promise<BookmarkNode[]> {
    const tree = await browser.bookmarks.getTree();
    return normalizeBookmarkTree(tree);
  },

  subscribeToBookmarks(listener) {
    const events = [
      browser.bookmarks.onCreated,
      browser.bookmarks.onRemoved,
      browser.bookmarks.onChanged,
      browser.bookmarks.onMoved,
      browser.bookmarks.onChildrenReordered,
      browser.bookmarks.onImportEnded,
    ];
    events.forEach((event) => event.addListener(listener));
    return () => events.forEach((event) => event.removeListener(listener));
  },

  async openUtility(target) {
    await updateCurrentTab(utilityUrl(target, detectBrowserFlavor(navigator.userAgent)));
  },

  async navigateExternal(url) {
    if (!/^https?:\/\//i.test(url)) throw new Error('Unsupported URL');
    await updateCurrentTab(url);
  },

  async loadSettings() {
    const stored = await browser.storage.sync.get(SETTINGS_KEY);
    return sanitizeSettings(stored[SETTINGS_KEY]);
  },

  async saveSettings(settings) {
    await browser.storage.sync.set({ [SETTINGS_KEY]: sanitizeSettings(settings) });
  },

  subscribeToSettings(listener) {
    const handleChange = (
      changes: Record<string, { newValue?: unknown }>,
      areaName: string,
    ) => {
      if (areaName === 'sync' && changes[SETTINGS_KEY]) {
        listener(sanitizeSettings(changes[SETTINGS_KEY].newValue));
      }
    };
    browser.storage.onChanged.addListener(handleChange);
    return () => browser.storage.onChanged.removeListener(handleChange);
  },

  async loadLocalUiState(): Promise<LocalUiState> {
    const stored = await browser.storage.local.get(LOCAL_UI_KEY);
    return sanitizeLocalUiState(stored[LOCAL_UI_KEY]);
  },

  async saveLocalUiState(state) {
    await browser.storage.local.set({ [LOCAL_UI_KEY]: sanitizeLocalUiState(state) });
  },

  loadCustomBackground,
  saveCustomBackground,
  clearCustomBackground,
};
