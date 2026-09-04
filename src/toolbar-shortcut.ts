import { MAX_SHORTCUT_TITLE_LENGTH } from './defaults';
import { displayDomain, isSafeHttpUrl } from './search';
import { normalizePinnedOrder, shortcutOrderKey } from './shortcuts';
import type { Shortcut, ShortcutEnhancement, SyncedSettings } from './types';

export type ToolbarShortcutStatus = 'added' | 'duplicate' | 'unsupported';

export interface ToolbarShortcutResult {
  status: ToolbarShortcutStatus;
  settings?: SyncedSettings;
}

export interface ToolbarPage {
  title?: string;
  url?: string;
  enhancement?: ShortcutEnhancement;
}

function pageTitle(title: string | undefined, url: string): string {
  const cleaned = title?.replace(/\s+/g, ' ').trim();
  return (cleaned || displayDomain(url)).slice(0, MAX_SHORTCUT_TITLE_LENGTH);
}

export function addToolbarPageShortcut(
  settings: SyncedSettings,
  page: ToolbarPage,
  id: string,
): ToolbarShortcutResult {
  if (!page.url || !isSafeHttpUrl(page.url)) return { status: 'unsupported' };

  const url = new URL(page.url).toString();
  const duplicate = settings.shortcuts.some((shortcut) => new URL(shortcut.url).toString() === url);
  if (duplicate) return { status: 'duplicate' };

  const shortcut: Shortcut = {
    id,
    title: pageTitle(page.title, url),
    url,
    ...(page.enhancement ? { enhancement: page.enhancement } : {}),
  };
  const currentOrder = normalizePinnedOrder(
    settings.pinnedOrder,
    settings.shortcuts,
    settings.shortcutGroups,
  );

  return {
    status: 'added',
    settings: {
      ...settings,
      shortcuts: [...settings.shortcuts, shortcut],
      pinnedOrder: [...currentOrder, shortcutOrderKey(shortcut.id)],
    },
  };
}
