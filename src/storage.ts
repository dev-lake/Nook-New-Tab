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
  ShortcutEnhancement,
  ShortcutGroup,
  SyncedSettings,
  ThemePreference,
  WidgetInstance,
} from './types';

const LOCALES: LocalePreference[] = ['auto', 'en', 'zh-CN', 'ja'];
const THEMES: ThemePreference[] = ['system', 'light', 'dark'];
const ENGINES: SearchEngineId[] = ['google', 'bing', 'duckduckgo'];
const GITHUB_PART_PATTERN = /^[A-Za-z0-9_.-]{1,100}$/;
const GITHUB_USERNAME_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;

function isGitHubUsername(value: string): boolean {
  return GITHUB_USERNAME_PATTERN.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateShortcutEnhancement(value: unknown): ShortcutEnhancement | null {
  if (!isRecord(value)) return null;

  if (value.pluginId === 'github-repository') {
    const owner = cleanText(value.owner, 100);
    const repository = cleanText(value.repository, 100);
    if (!owner || !repository || !GITHUB_PART_PATTERN.test(owner) || !GITHUB_PART_PATTERN.test(repository)) return null;
    return { pluginId: 'github-repository', owner, repository };
  }

  if (value.pluginId === 'github-profile') {
    const username = cleanText(value.username, 39);
    if (!username || !isGitHubUsername(username)) return null;
    return { pluginId: 'github-profile', username };
  }

  return null;
}

function validateShortcut(value: unknown): Shortcut | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== 'string' || !value.id) return null;
  if (typeof value.title !== 'string') return null;
  const title = value.title.trim().slice(0, MAX_SHORTCUT_TITLE_LENGTH);
  if (!title || typeof value.url !== 'string' || !isSafeHttpUrl(value.url)) return null;
  const enhancement = validateShortcutEnhancement(value.enhancement);
  return {
    id: value.id,
    title,
    url: new URL(value.url).toString(),
    ...(enhancement ? { enhancement } : {}),
  };
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

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const result = value.trim().slice(0, maxLength);
  return result || null;
}

function validateWidget(value: unknown): WidgetInstance | null {
  if (!isRecord(value)) return null;
  const id = cleanText(value.id, 120);
  if (!id) return null;

  if (value.pluginId === 'github-repository') {
    const owner = cleanText(value.owner, 100);
    const repository = cleanText(value.repository, 100);
    if (!owner || !repository || !GITHUB_PART_PATTERN.test(owner) || !GITHUB_PART_PATTERN.test(repository)) return null;
    return { id, pluginId: 'github-repository', owner, repository };
  }

  if (value.pluginId === 'github-profile') {
    const username = cleanText(value.username, 39);
    if (!username || !isGitHubUsername(username)) return null;
    return { id, pluginId: 'github-profile', username };
  }

  return null;
}

function validateWidgets(value: unknown): WidgetInstance[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set<string>();
  return value.flatMap((candidate) => {
    const widget = validateWidget(candidate);
    if (!widget || ids.has(widget.id)) return [];
    ids.add(widget.id);
    return [widget];
  });
}

export function sanitizeSettings(value: unknown): SyncedSettings {
  if (!isRecord(value)) return structuredClone(DEFAULT_SETTINGS);
  const storedShortcuts = Array.isArray(value.shortcuts)
    ? value.shortcuts
        .map(validateShortcut)
        .filter((item): item is Shortcut => item !== null)
    : DEFAULT_SETTINGS.shortcuts;
  const shortcutIds = new Set(storedShortcuts.map((shortcut) => shortcut.id));
  const legacyWidgets = validateWidgets(value.widgets);
  const migratedWidgetShortcuts = legacyWidgets.flatMap((widget): Shortcut[] => {
    if (widget.pluginId !== 'github-repository') return [];
    if (shortcutIds.has(widget.id)) return [];
    shortcutIds.add(widget.id);
    const { id, ...enhancement } = widget;
    return [{
      id,
      title: `${widget.owner}/${widget.repository}`,
      url: `https://github.com/${widget.owner}/${widget.repository}`,
      enhancement,
    }];
  });
  const shortcuts = [...storedShortcuts, ...migratedWidgetShortcuts];
  const shortcutGroups = validateShortcutGroups(value.shortcutGroups, shortcuts);
  const pinnedOrder = normalizePinnedOrder(value.pinnedOrder, shortcuts, shortcutGroups);
  return {
    schemaVersion: 8,
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
