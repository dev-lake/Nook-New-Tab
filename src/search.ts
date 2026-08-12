import type { SearchEngineId } from './types';

const SEARCH_URLS: Record<SearchEngineId, string> = {
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
};

export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function looksLikeHost(value: string): boolean {
  const host = value.split('/')[0] ?? '';
  if (/^localhost(?::\d+)?$/i.test(host)) return true;
  if (/^(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?$/.test(host)) return true;
  return /^(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z]{2,}(?::\d+)?$/i.test(host);
}

export function normalizeNavigableUrl(input: string): string | null {
  const value = input.trim();
  if (!value || /\s/.test(value)) return null;

  if (/^https?:\/\//i.test(value)) {
    return isSafeHttpUrl(value) ? new URL(value).toString() : null;
  }

  if (!looksLikeHost(value)) return null;
  const protocol = /^localhost(?::\d+)?(?:\/|$)/i.test(value) ? 'http://' : 'https://';
  const normalized = `${protocol}${value}`;
  return isSafeHttpUrl(normalized) ? new URL(normalized).toString() : null;
}

export function buildNavigationTarget(input: string, engine: SearchEngineId): string {
  return normalizeNavigableUrl(input) ?? `${SEARCH_URLS[engine]}${encodeURIComponent(input.trim())}`;
}

export function shortcutValidationError(title: string, url: string): 'title' | 'url' | null {
  const cleanTitle = title.trim();
  if (!cleanTitle || cleanTitle.length > 40) return 'title';
  if (!isSafeHttpUrl(url.trim())) return 'url';
  return null;
}

export function displayDomain(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return value;
  }
}
