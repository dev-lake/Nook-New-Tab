import { parseGitHubRepositoryInput } from './github-repository';
import type { Shortcut, ShortcutEnhancement, WidgetInstance } from '../types';

const GITHUB_NON_REPOSITORY_ROOTS = new Set([
  'account',
  'about',
  'apps',
  'codespaces',
  'collections',
  'contact',
  'copilot',
  'customer-stories',
  'dashboard',
  'enterprise',
  'events',
  'explore',
  'features',
  'issues',
  'join',
  'login',
  'logout',
  'marketplace',
  'new',
  'notifications',
  'orgs',
  'organizations',
  'pricing',
  'pulls',
  'readme',
  'search',
  'security',
  'settings',
  'site',
  'sponsors',
  'stars',
  'topics',
  'trending',
  'users',
]);

const GITHUB_USERNAME_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;

export type DetectedShortcutEnhancement =
  | { pluginId: 'github-repository'; owner: string; repository: string }
  | { pluginId: 'github-profile'; username: string };

function normalizedHostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function detectedEnhancementForUrl(url: string): DetectedShortcutEnhancement | null {
  const hostname = normalizedHostname(url);
  if (!hostname) return null;
  if (hostname === 'github.com') {
    const parsedUrl = new URL(url);
    const parts = parsedUrl.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return { pluginId: 'github-profile', username: '' };
    const root = parts[0] ?? '';
    if (GITHUB_NON_REPOSITORY_ROOTS.has(root.toLowerCase())) return null;
    const repository = parseGitHubRepositoryInput(url);
    if (parts.length >= 2 && repository) return { pluginId: 'github-repository', ...repository };
    if (parts.length === 1 && GITHUB_USERNAME_PATTERN.test(root)) {
      return { pluginId: 'github-profile', username: root };
    }
  }
  return null;
}

export function enhancementInstanceForShortcut(shortcut: Shortcut): WidgetInstance | null {
  return shortcut.enhancement ? { id: shortcut.id, ...shortcut.enhancement } : null;
}

export function enhancementStillMatchesUrl(enhancement: ShortcutEnhancement, url: string): boolean {
  const detected = detectedEnhancementForUrl(url);
  return detected?.pluginId === enhancement.pluginId;
}
