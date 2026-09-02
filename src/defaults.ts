import { shortcutOrderKey } from './shortcuts';
import type { LocalUiState, Shortcut, SyncedSettings } from './types';

export const MAX_SHORTCUT_TITLE_LENGTH = 40;

export const DEFAULT_SHORTCUTS: Shortcut[] = [
  { id: 'gmail', title: 'Gmail', url: 'https://mail.google.com/' },
  { id: 'github', title: 'GitHub', url: 'https://github.com/' },
  { id: 'chatgpt', title: 'ChatGPT', url: 'https://chatgpt.com/' },
  { id: 'notion', title: 'Notion', url: 'https://www.notion.so/' },
  { id: 'youtube', title: 'YouTube', url: 'https://www.youtube.com/' },
  { id: 'google-drive', title: 'Google Drive', url: 'https://drive.google.com/' },
];

export const DEFAULT_SETTINGS: SyncedSettings = {
  schemaVersion: 3,
  locale: 'auto',
  theme: 'system',
  searchEngine: 'google',
  shortcuts: DEFAULT_SHORTCUTS,
  shortcutGroups: [],
  pinnedOrder: DEFAULT_SHORTCUTS.map((shortcut) => shortcutOrderKey(shortcut.id)),
};

export const DEFAULT_LOCAL_UI_STATE: LocalUiState = {
  expandedFolderIds: [],
  bookmarkFolderId: null,
  background: 'none',
};
