import type { GitHubRepositoryWidgetInstance } from '../types';

export interface GitHubRepositoryData {
  kind: 'github-repository';
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  url: string;
}

type FetchLike = typeof fetch;
const REPOSITORY_PART_PATTERN = /^[A-Za-z0-9_.-]{1,100}$/;

export type GitHubRepositoryErrorKind = 'not-found' | 'rate-limited' | 'unavailable';

export class GitHubRepositoryError extends Error {
  constructor(
    public readonly kind: GitHubRepositoryErrorKind,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'GitHubRepositoryError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

export function parseGitHubRepositoryInput(value: string): Pick<GitHubRepositoryWidgetInstance, 'owner' | 'repository'> | null {
  const input = value.trim();
  if (!input) return null;
  let parts: string[];
  try {
    const withProtocol = /^https?:\/\//i.test(input) ? input : `https://${input}`;
    const url = new URL(withProtocol);
    if (url.hostname.toLowerCase() !== 'github.com') throw new Error('Not a GitHub URL');
    parts = url.pathname.split('/').filter(Boolean).slice(0, 2);
  } catch {
    parts = input.replace(/^\/+|\/+$/g, '').split('/');
  }
  if (parts.length !== 2) return null;
  const owner = parts[0]?.trim() ?? '';
  const repository = (parts[1]?.trim() ?? '').replace(/\.git$/i, '');
  if (!REPOSITORY_PART_PATTERN.test(owner) || !REPOSITORY_PART_PATTERN.test(repository)) return null;
  return { owner, repository };
}

export function isGitHubRepositoryData(value: unknown): value is GitHubRepositoryData {
  if (!isRecord(value) || value.kind !== 'github-repository') return false;
  return typeof value.fullName === 'string'
    && (typeof value.description === 'string' || value.description === null)
    && isCount(value.stars)
    && isCount(value.forks)
    && isCount(value.openIssues)
    && typeof value.url === 'string';
}

function repositoryUrl(instance: GitHubRepositoryWidgetInstance): string {
  return `https://github.com/${encodeURIComponent(instance.owner)}/${encodeURIComponent(instance.repository)}`;
}

function dataFromApiPayload(
  instance: GitHubRepositoryWidgetInstance,
  payload: unknown,
): GitHubRepositoryData | null {
  if (
    !isRecord(payload) || typeof payload.full_name !== 'string'
    || !isCount(payload.stargazers_count)
    || !isCount(payload.forks_count)
    || !isCount(payload.open_issues_count)
  ) return null;
  return {
    kind: 'github-repository',
    fullName: payload.full_name,
    description: typeof payload.description === 'string' ? payload.description : null,
    stars: payload.stargazers_count,
    forks: payload.forks_count,
    openIssues: payload.open_issues_count,
    url: repositoryUrl(instance),
  };
}

type PublicPageSummary = {
  description: string | null;
  stars: number;
  forks: number;
};

function findPublicPageSummary(value: unknown): PublicPageSummary | null {
  if (!isRecord(value)) return null;
  if (isCount(value.stargazerCount) && isCount(value.forksCount)) {
    return {
      description: typeof value.description === 'string' ? value.description : null,
      stars: value.stargazerCount,
      forks: value.forksCount,
    };
  }
  for (const child of Object.values(value)) {
    const summary = findPublicPageSummary(child);
    if (summary) return summary;
  }
  return null;
}

function countFromAttribute(tag: string | undefined, attribute: string): number | null {
  if (!tag) return null;
  const match = tag.match(new RegExp(`\\b${attribute}=["']([0-9,]+)["']`, 'i'));
  if (!match) return null;
  const value = Number(match[1]!.replaceAll(',', ''));
  return isCount(value) ? value : null;
}

export function parseGitHubRepositoryPage(
  instance: GitHubRepositoryWidgetInstance,
  html: string,
): GitHubRepositoryData | null {
  let summary: PublicPageSummary | null = null;
  const embeddedDataPattern = /<script\b[^>]*data-target=["']react-app\.embeddedData["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(embeddedDataPattern)) {
    try {
      summary = findPublicPageSummary(JSON.parse(match[1]!));
      if (summary) break;
    } catch {
      // GitHub can include unrelated embedded payloads. Continue to the next one.
    }
  }

  if (!summary) {
    const stars = Number(html.match(/"stargazerCount":([0-9]+)/)?.[1]);
    const forks = Number(html.match(/"forksCount":([0-9]+)/)?.[1]);
    if (isCount(stars) && isCount(forks)) summary = { description: null, stars, forks };
  }
  if (!summary) return null;

  const issuesTag = html.match(/<span\b[^>]*\bid=["']issues-repo-tab-count["'][^>]*>/i)?.[0];
  return {
    kind: 'github-repository',
    fullName: `${instance.owner}/${instance.repository}`,
    description: summary.description,
    stars: summary.stars,
    forks: summary.forks,
    openIssues: countFromAttribute(issuesTag, 'title') ?? 0,
    url: repositoryUrl(instance),
  };
}

async function fetchPublicRepositoryPage(
  instance: GitHubRepositoryWidgetInstance,
  signal: AbortSignal | undefined,
  fetcher: FetchLike,
  fallbackKind: GitHubRepositoryErrorKind,
): Promise<GitHubRepositoryData> {
  try {
    const response = await fetcher(repositoryUrl(instance), {
      signal,
      referrerPolicy: 'no-referrer',
      headers: { Accept: 'text/html' },
    });
    if (response.status === 404) {
      throw new GitHubRepositoryError('not-found', 'GitHub public repository was not found', 404);
    }
    if (!response.ok) {
      throw new GitHubRepositoryError(
        fallbackKind,
        `GitHub public repository page request failed (${response.status})`,
        response.status,
      );
    }
    const data = parseGitHubRepositoryPage(instance, await response.text());
    if (!data) {
      throw new GitHubRepositoryError(fallbackKind, 'GitHub public repository page is incomplete');
    }
    return data;
  } catch (error) {
    if (error instanceof GitHubRepositoryError || signal?.aborted) throw error;
    throw new GitHubRepositoryError(fallbackKind, 'GitHub public repository page could not be loaded');
  }
}

export async function fetchGitHubRepositoryData(
  instance: GitHubRepositoryWidgetInstance,
  signal?: AbortSignal,
  fetcher: FetchLike = fetch,
): Promise<GitHubRepositoryData> {
  const endpoint = `https://api.github.com/repos/${encodeURIComponent(instance.owner)}/${encodeURIComponent(instance.repository)}`;
  try {
    const response = await fetcher(endpoint, {
      signal,
      referrerPolicy: 'no-referrer',
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (response.status === 404) {
      throw new GitHubRepositoryError('not-found', 'GitHub public repository was not found', 404);
    }
    if (response.ok) {
      const data = dataFromApiPayload(instance, await response.json());
      if (data) return data;
    }
    const rateLimited = response.status === 403 || response.status === 429;
    return fetchPublicRepositoryPage(instance, signal, fetcher, rateLimited ? 'rate-limited' : 'unavailable');
  } catch (error) {
    if (error instanceof GitHubRepositoryError || signal?.aborted) throw error;
    return fetchPublicRepositoryPage(instance, signal, fetcher, 'unavailable');
  }
}
