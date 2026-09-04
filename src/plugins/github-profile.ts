import type { GitHubProfileWidgetInstance } from '../types';
import type { GitHubRepositoryErrorKind } from './github-repository';

export interface GitHubProfileData {
  kind: 'github-profile';
  login: string;
  name: string | null;
  avatarUrl: string;
  followers: number;
  following: number;
  publicRepositories: number;
  url: string;
}

type FetchLike = typeof fetch;
const GITHUB_USERNAME_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;

export class GitHubProfileError extends Error {
  constructor(
    public readonly kind: GitHubRepositoryErrorKind,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'GitHubProfileError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

export function isGitHubUsername(value: string): boolean {
  return GITHUB_USERNAME_PATTERN.test(normalizeGitHubUsername(value));
}

export function normalizeGitHubUsername(value: string): string {
  return value.trim().replace(/^@/, '');
}

function profileUrl(instance: GitHubProfileWidgetInstance): string {
  return `https://github.com/${encodeURIComponent(instance.username)}`;
}

export function isGitHubProfileData(value: unknown): value is GitHubProfileData {
  if (!isRecord(value) || value.kind !== 'github-profile') return false;
  return typeof value.login === 'string'
    && (typeof value.name === 'string' || value.name === null)
    && typeof value.avatarUrl === 'string'
    && isCount(value.followers)
    && isCount(value.following)
    && isCount(value.publicRepositories)
    && typeof value.url === 'string';
}

function dataFromApiPayload(
  instance: GitHubProfileWidgetInstance,
  payload: unknown,
): GitHubProfileData | null {
  if (
    !isRecord(payload)
    || typeof payload.login !== 'string'
    || typeof payload.avatar_url !== 'string'
    || !isCount(payload.followers)
    || !isCount(payload.following)
    || !isCount(payload.public_repos)
  ) return null;
  return {
    kind: 'github-profile',
    login: payload.login,
    name: typeof payload.name === 'string' ? payload.name : null,
    avatarUrl: payload.avatar_url,
    followers: payload.followers,
    following: payload.following,
    publicRepositories: payload.public_repos,
    url: profileUrl(instance),
  };
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number(code)));
}

function attributeValue(tag: string | undefined, attribute: string): string | null {
  if (!tag) return null;
  const match = tag.match(new RegExp(`\\b${attribute}=["']([^"']*)["']`, 'i'));
  return match?.[1] ? decodeHtml(match[1]) : null;
}

function metaContent(html: string, property: string): string | null {
  const escapedProperty = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tag = html.match(new RegExp(`<meta\\b(?=[^>]*(?:property|name)=["']${escapedProperty}["'])[^>]*>`, 'i'))?.[0];
  return attributeValue(tag, 'content');
}

function compactCount(value: string | null): number | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase().replaceAll(',', '');
  const match = normalized.match(/^([0-9]+(?:\.[0-9]+)?)([km])?$/);
  if (!match) return null;
  const multiplier = match[2] === 'k' ? 1_000 : match[2] === 'm' ? 1_000_000 : 1;
  const count = Math.round(Number(match[1]) * multiplier);
  return isCount(count) ? count : null;
}

function countFromLink(html: string, marker: string): number | null {
  const link = html.match(new RegExp(`<a\\b(?=[^>]*${marker})[^>]*>([\\s\\S]*?)<\\/a>`, 'i'))?.[1];
  if (!link) return null;
  const titledCount = attributeValue(link.match(/<span\b[^>]*\btitle=["'][^"']+["'][^>]*>/i)?.[0], 'title');
  const visibleCount = link.match(/<span\b[^>]*class=["'][^"']*text-bold[^"']*["'][^>]*>([^<]+)<\/span>/i)?.[1];
  return compactCount(titledCount ?? (visibleCount ? decodeHtml(visibleCount) : null));
}

function plainTextFromElement(html: string, className: string): string | null {
  const content = html.match(new RegExp(`<span\\b[^>]*class=["'][^"']*${className}[^"']*["'][^>]*>([\\s\\S]*?)<\\/span>`, 'i'))?.[1];
  if (!content) return null;
  const text = decodeHtml(content.replace(/<[^>]+>/g, '').trim());
  return text || null;
}

export function parseGitHubProfilePage(
  instance: GitHubProfileWidgetInstance,
  html: string,
): GitHubProfileData | null {
  const login = metaContent(html, 'profile:username') ?? instance.username;
  const avatarUrl = metaContent(html, 'og:image');
  const repositories = countFromLink(html, 'data-tab-item=["\']repositories["\']');
  const followers = countFromLink(html, '\\?tab=followers');
  const following = countFromLink(html, '\\?tab=following');
  if (!avatarUrl || repositories === null || followers === null || following === null) return null;
  return {
    kind: 'github-profile',
    login,
    name: plainTextFromElement(html, 'vcard-fullname'),
    avatarUrl,
    followers,
    following,
    publicRepositories: repositories,
    url: profileUrl(instance),
  };
}

async function fetchPublicProfilePage(
  instance: GitHubProfileWidgetInstance,
  signal: AbortSignal | undefined,
  fetcher: FetchLike,
  fallbackKind: GitHubRepositoryErrorKind,
): Promise<GitHubProfileData> {
  try {
    const response = await fetcher(profileUrl(instance), {
      signal,
      referrerPolicy: 'no-referrer',
      headers: { Accept: 'text/html' },
    });
    if (response.status === 404) throw new GitHubProfileError('not-found', 'GitHub profile was not found', 404);
    if (!response.ok) {
      throw new GitHubProfileError(fallbackKind, `GitHub public profile page request failed (${response.status})`, response.status);
    }
    const data = parseGitHubProfilePage(instance, await response.text());
    if (!data) throw new GitHubProfileError(fallbackKind, 'GitHub public profile page is incomplete');
    return data;
  } catch (error) {
    if (error instanceof GitHubProfileError || signal?.aborted) throw error;
    throw new GitHubProfileError(fallbackKind, 'GitHub public profile page could not be loaded');
  }
}

export async function fetchGitHubProfileData(
  instance: GitHubProfileWidgetInstance,
  signal?: AbortSignal,
  fetcher: FetchLike = fetch,
): Promise<GitHubProfileData> {
  const endpoint = `https://api.github.com/users/${encodeURIComponent(instance.username)}`;
  try {
    const response = await fetcher(endpoint, {
      signal,
      referrerPolicy: 'no-referrer',
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (response.status === 404) throw new GitHubProfileError('not-found', 'GitHub profile was not found', 404);
    if (response.ok) {
      const data = dataFromApiPayload(instance, await response.json());
      if (data) return data;
    }
    const rateLimited = response.status === 403 || response.status === 429;
    return fetchPublicProfilePage(instance, signal, fetcher, rateLimited ? 'rate-limited' : 'unavailable');
  } catch (error) {
    if (error instanceof GitHubProfileError || signal?.aborted) throw error;
    return fetchPublicProfilePage(instance, signal, fetcher, 'unavailable');
  }
}
