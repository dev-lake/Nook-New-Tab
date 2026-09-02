import {
  DEFAULT_LOCAL_UI_STATE,
  DEFAULT_SETTINGS,
  MAX_SHORTCUT_TITLE_LENGTH,
} from './defaults';
import { BACKGROUND_PREFERENCES } from './backgrounds';
import { isSafeHttpUrl } from './search';
import { normalizePinnedOrder } from './shortcuts';
import type {
  LocalUiState,
  BackgroundPreference,
  LocalePreference,
  SearchEngineId,
  Shortcut,
  ShortcutGroup,
  SyncedSettings,
  ThemePreference,
} from './types';

const LOCALES: LocalePreference[] = ['auto', 'en', 'zh-CN', 'ja'];
const THEMES: ThemePreference[] = ['system', 'light', 'dark'];
const ENGINES: SearchEngineId[] = ['google', 'bing', 'duckduckgo'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateShortcut(value: unknown): Shortcut | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== 'string' || !value.id) return null;
  if (typeof value.title !== 'string') return null;
  const title = value.title.trim().slice(0, MAX_SHORTCUT_TITLE_LENGTH);
  if (!title || typeof value.url !== 'string' || !isSafeHttpUrl(value.url)) return null;
  return { id: value.id, title, url: new URL(value.url).toString() };
}

function validateShortcutGroups(value: unknown, shortcuts: Shortcut[]): ShortcutGroup[] {
  if (!Array.isArray(value)) return [];
  const shortcutIds = new Set(shortcuts.map((shortcut) => shortcut.id));
  const assignedShortcutIds = new Set<string>();
  const groupIds = new Set<string>();
  const groups: ShortcutGroup[] = [];

  for (const candidate of value) {
    if (!isRecord(candidate) || typeof candidate.id !== 'string' || !candidate.id || groupIds.has(candidate.id)) continue;
    if (typeof candidate.title !== 'string' || !Array.isArray(candidate.shortcutIds)) continue;
    const title = candidate.title.trim().slice(0, MAX_SHORTCUT_TITLE_LENGTH);
    const memberIds = [...new Set(candidate.shortcutIds.filter((id): id is string => (
      typeof id === 'string' && shortcutIds.has(id) && !assignedShortcutIds.has(id)
    )))];
    if (!title || memberIds.length < 2) continue;
    groupIds.add(candidate.id);
    memberIds.forEach((id) => assignedShortcutIds.add(id));
    groups.push({ id: candidate.id, title, shortcutIds: memberIds });
  }

  return groups;
}

export function sanitizeSettings(value: unknown): SyncedSettings {
  if (!isRecord(value)) return structuredClone(DEFAULT_SETTINGS);
  const shortcuts = Array.isArray(value.shortcuts)
    ? value.shortcuts
        .map(validateShortcut)
        .filter((item): item is Shortcut => item !== null)
    : DEFAULT_SETTINGS.shortcuts;
  const shortcutGroups = validateShortcutGroups(value.shortcutGroups, shortcuts);
  const pinnedOrder = normalizePinnedOrder(value.pinnedOrder, shortcuts, shortcutGroups);

  return {
    schemaVersion: 3,
    locale: LOCALES.includes(value.locale as LocalePreference)
      ? (value.locale as LocalePreference)
      : DEFAULT_SETTINGS.locale,
    theme: THEMES.includes(value.theme as ThemePreference)
      ? (value.theme as ThemePreference)
      : DEFAULT_SETTINGS.theme,
    searchEngine: ENGINES.includes(value.searchEngine as SearchEngineId)
      ? (value.searchEngine as SearchEngineId)
      : DEFAULT_SETTINGS.searchEngine,
    shortcuts,
    shortcutGroups,
    pinnedOrder,
  };
}

export function sanitizeLocalUiState(value: unknown): LocalUiState {
  if (!isRecord(value) || !Array.isArray(value.expandedFolderIds)) {
    return structuredClone(DEFAULT_LOCAL_UI_STATE);
  }
  return {
    expandedFolderIds: [...new Set(value.expandedFolderIds.filter((id): id is string => typeof id === 'string'))],
    bookmarkFolderId: typeof value.bookmarkFolderId === 'string' && value.bookmarkFolderId
      ? value.bookmarkFolderId
      : null,
    background: BACKGROUND_PREFERENCES.includes(value.background as BackgroundPreference)
      ? (value.background as BackgroundPreference)
      : DEFAULT_LOCAL_UI_STATE.background,
  };
}
