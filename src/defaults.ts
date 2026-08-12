import type { LocalUiState, Shortcut, SyncedSettings } from './types';

export const MAX_SHORTCUTS = 8;
export const MAX_SHORTCUT_TITLE_LENGTH = 40;

export const DEFAULT_SHORTCUTS: Shortcut[] = [
  { id: 'gmail', title: 'Gmail', url: 'https://mail.google.com/' },
  { id: 'github', title: 'GitHub', url: 'https://github.com/' },
  { id: 'notion', title: 'Notion', url: 'https://www.notion.so/' },
  { id: 'youtube', title: 'YouTube', url: 'https://www.youtube.com/' },
];

export const DEFAULT_SETTINGS: SyncedSettings = {
  schemaVersion: 1,
  locale: 'auto',
  theme: 'system',
  searchEngine: 'google',
  shortcuts: DEFAULT_SHORTCUTS,
};

export const DEFAULT_LOCAL_UI_STATE: LocalUiState = {
  expandedFolderIds: [],
};
