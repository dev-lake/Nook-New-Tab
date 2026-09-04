import { browser } from 'wxt/browser';
import { clearCustomBackground, loadCustomBackground, saveCustomBackground } from './background-storage';
import { normalizeBookmarkTree } from './bookmarks';
import { detectBrowserFlavor, reviewUrl, utilityUrl } from './browser-targets';
import { sanitizeLocalUiState, sanitizeSettings } from './storage';
import type {
  BookmarkNode,
  BrowserAdapter,
  LocalUiState,
  PluginCacheEntry,
  PluginId,
  SyncedSettings,
  UtilityTarget,
} from './types';

const SETTINGS_KEY = 'settings';
const LOCAL_UI_KEY = 'uiState';
const PLUGIN_CACHE_PREFIX = 'pluginCache:';

const PLUGIN_ORIGINS: Record<PluginId, string[]> = {
  'github-repository': ['https://api.github.com/*', 'https://github.com/*'],
  'github-profile': ['https://api.github.com/*', 'https://github.com/*'],
};

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

  async openReviewPage() {
    await updateCurrentTab(reviewUrl(detectBrowserFlavor(navigator.userAgent), browser.runtime.id));
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

  async hasPluginAccess(pluginId) {
    return browser.permissions.contains({ origins: PLUGIN_ORIGINS[pluginId] });
  },

  async requestPluginAccess(pluginId) {
    return browser.permissions.request({ origins: PLUGIN_ORIGINS[pluginId] });
  },

  async loadPluginCache(instanceId): Promise<PluginCacheEntry | null> {
    const key = `${PLUGIN_CACHE_PREFIX}${instanceId}`;
    const stored = await browser.storage.local.get(key);
    const value = stored[key];
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const candidate = value as Partial<PluginCacheEntry>;
    if (
      !['github-repository', 'github-profile'].includes(candidate.pluginId ?? '')
      || typeof candidate.configKey !== 'string'
      || typeof candidate.updatedAt !== 'number'
      || !Number.isFinite(candidate.updatedAt)
    ) return null;
    return {
      pluginId: candidate.pluginId as PluginId,
      configKey: candidate.configKey,
      updatedAt: candidate.updatedAt,
      data: candidate.data,
    };
  },

  async savePluginCache(instanceId, entry) {
    await browser.storage.local.set({ [`${PLUGIN_CACHE_PREFIX}${instanceId}`]: entry });
  },

  async removePluginCache(instanceId) {
    await browser.storage.local.remove(`${PLUGIN_CACHE_PREFIX}${instanceId}`);
  },
};
