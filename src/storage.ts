import {
  DEFAULT_LOCAL_UI_STATE,
  DEFAULT_SETTINGS,
  MAX_SHORTCUTS,
  MAX_SHORTCUT_TITLE_LENGTH,
} from './defaults';
import { isSafeHttpUrl } from './search';
import type {
  LocalUiState,
  LocalePreference,
  SearchEngineId,
  Shortcut,
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

export function sanitizeSettings(value: unknown): SyncedSettings {
  if (!isRecord(value)) return structuredClone(DEFAULT_SETTINGS);
  const shortcuts = Array.isArray(value.shortcuts)
    ? value.shortcuts
        .map(validateShortcut)
        .filter((item): item is Shortcut => item !== null)
        .slice(0, MAX_SHORTCUTS)
    : DEFAULT_SETTINGS.shortcuts;

  return {
    schemaVersion: 1,
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
  };
}

export function sanitizeLocalUiState(value: unknown): LocalUiState {
  if (!isRecord(value) || !Array.isArray(value.expandedFolderIds)) {
    return structuredClone(DEFAULT_LOCAL_UI_STATE);
  }
  return {
    expandedFolderIds: [...new Set(value.expandedFolderIds.filter((id): id is string => typeof id === 'string'))],
  };
}
