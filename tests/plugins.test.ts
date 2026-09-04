import { describe, expect, it, vi } from 'vitest';
import {
  fetchGitHubRepositoryData,
  GitHubRepositoryError,
  isGitHubRepositoryData,
  parseGitHubRepositoryPage,
  parseGitHubRepositoryInput,
} from '../src/plugins/github-repository';
import {
  fetchGitHubProfileData,
  isGitHubProfileData,
  parseGitHubProfilePage,
} from '../src/plugins/github-profile';
import type { GitHubProfileWidgetInstance, GitHubRepositoryWidgetInstance } from '../src/types';
import { detectedEnhancementForUrl } from '../src/plugins/shortcut-enhancements';
import { pluginsForSurface } from '../src/plugins/registry';

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function publicRepositoryPage(): string {
  return `<!doctype html><html><body>
    <span id="issues-repo-tab-count" title="42" class="Counter">42</span>
    <script type="application/json" data-target="react-app.embeddedData">${JSON.stringify({
      payload: {
        codeViewRepoRoute: {
          sidebarAbout: {
            description: 'Official JavaScript library for the OpenAI API',
            stargazerCount: 12345,
            forksCount: 999,
          },
        },
      },
    })}</script>
  </body></html>`;
}

function publicProfilePage(): string {
  return `<!doctype html><html><head>
    <meta property="og:image" content="https://avatars.githubusercontent.com/u/583231?v=4&amp;s=400">
    <meta property="profile:username" content="octocat">
  </head><body>
    <a data-tab-item="repositories" href="/octocat?tab=repositories">Repositories <span title="8" class="Counter">8</span></a>
    <span class="p-name vcard-fullname d-block">The Octocat</span>
    <a href="https://github.com/octocat?tab=followers"><span class="text-bold">23.9k</span> followers</a>
    <a href="https://github.com/octocat?tab=following"><span class="text-bold">9</span> following</a>
  </body></html>`;
}

describe('GitHub repository plugin', () => {
  const repositoryWidget: GitHubRepositoryWidgetInstance = {
    id: 'repo-openai-node',
    pluginId: 'github-repository',
    owner: 'openai',
    repository: 'openai-node',
  };

  it('parses repository slugs and GitHub URLs safely', () => {
    expect(parseGitHubRepositoryInput('openai/openai-node')).toEqual({ owner: 'openai', repository: 'openai-node' });
    expect(parseGitHubRepositoryInput('https://github.com/openai/openai-node/issues')).toEqual({ owner: 'openai', repository: 'openai-node' });
    expect(parseGitHubRepositoryInput('https://example.com/openai/openai-node')).toBeNull();
    expect(parseGitHubRepositoryInput('only-owner')).toBeNull();
  });

  it('loads and validates public repository counters', async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({
      full_name: 'openai/openai-node',
      description: 'Official JavaScript library for the OpenAI API',
      stargazers_count: 12345,
      forks_count: 999,
      open_issues_count: 42,
      owner: { avatar_url: 'https://avatars.githubusercontent.com/u/14957082' },
    }));

    const result = await fetchGitHubRepositoryData(repositoryWidget, undefined, fetcher);

    expect(result).toEqual(expect.objectContaining({ stars: 12345, forks: 999, openIssues: 42 }));
    expect(result.url).toBe('https://github.com/openai/openai-node');
    expect(isGitHubRepositoryData(result)).toBe(true);
  });

  it('falls back to the public repository page when the anonymous API is rate limited', async () => {
    const fetcher = vi.fn().mockImplementation((input: string | URL | Request) => {
      const url = String(input);
      if (url.startsWith('https://api.github.com/')) {
        return Promise.resolve(jsonResponse({ message: 'API rate limit exceeded' }, 403));
      }
      return Promise.resolve(new Response(publicRepositoryPage(), {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }));
    });

    const result = await fetchGitHubRepositoryData(repositoryWidget, undefined, fetcher);

    expect(result).toEqual({
      kind: 'github-repository',
      fullName: 'openai/openai-node',
      description: 'Official JavaScript library for the OpenAI API',
      stars: 12345,
      forks: 999,
      openIssues: 42,
      url: 'https://github.com/openai/openai-node',
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(String(fetcher.mock.calls.at(1)?.[0])).toBe('https://github.com/openai/openai-node');
  });

  it('parses GitHub embedded page data without executing it', () => {
    expect(parseGitHubRepositoryPage(repositoryWidget, publicRepositoryPage())).toEqual(
      expect.objectContaining({ stars: 12345, forks: 999, openIssues: 42 }),
    );
  });

  it('distinguishes a repository that is not public', async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({ message: 'Not Found' }, 404));

    const error = await fetchGitHubRepositoryData(repositoryWidget, undefined, fetcher).catch((reason: unknown) => reason);
    expect(error).toBeInstanceOf(GitHubRepositoryError);
    expect(error).toMatchObject({
      name: 'GitHubRepositoryError',
      kind: 'not-found',
      status: 404,
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

describe('GitHub profile plugin', () => {
  const profileWidget: GitHubProfileWidgetInstance = {
    id: 'profile-octocat',
    pluginId: 'github-profile',
    username: 'octocat',
  };

  it('loads and validates public account information', async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({
      login: 'octocat',
      name: 'The Octocat',
      avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
      followers: 23900,
      following: 9,
      public_repos: 8,
    }));

    const result = await fetchGitHubProfileData(profileWidget, undefined, fetcher);

    expect(result).toEqual(expect.objectContaining({
      login: 'octocat',
      followers: 23900,
      following: 9,
      publicRepositories: 8,
    }));
    expect(isGitHubProfileData(result)).toBe(true);
  });

  it('parses public profile-page data as a rate-limit fallback', () => {
    expect(parseGitHubProfilePage(profileWidget, publicProfilePage())).toEqual({
      kind: 'github-profile',
      login: 'octocat',
      name: 'The Octocat',
      avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4&s=400',
      followers: 23900,
      following: 9,
      publicRepositories: 8,
      url: 'https://github.com/octocat',
    });
  });

  it('falls back to the public profile page after an API limit response', async () => {
    const fetcher = vi.fn().mockImplementation((input: string | URL | Request) => (
      String(input).startsWith('https://api.github.com/')
        ? Promise.resolve(jsonResponse({ message: 'API rate limit exceeded' }, 403))
        : Promise.resolve(new Response(publicProfilePage(), { status: 200 }))
    ));

    const result = await fetchGitHubProfileData(profileWidget, undefined, fetcher);

    expect(result.publicRepositories).toBe(8);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});

describe('shortcut enhancement detection', () => {
  it('offers repository data only for GitHub repository URLs', () => {
    expect(detectedEnhancementForUrl('https://github.com/openai/openai-node/issues')).toEqual({
      pluginId: 'github-repository',
      owner: 'openai',
      repository: 'openai-node',
    });
    expect(detectedEnhancementForUrl('https://github.com/settings/profile')).toBeNull();
    expect(detectedEnhancementForUrl('https://github.com/openai')).toEqual({
      pluginId: 'github-profile',
      username: 'openai',
    });
    expect(detectedEnhancementForUrl('https://github.com/')).toEqual({
      pluginId: 'github-profile',
      username: '',
    });
  });

  it('registers repository and profile data as shortcut components', () => {
    expect(pluginsForSurface('shortcut').map((plugin) => plugin.id)).toEqual(['github-repository', 'github-profile']);
  });
});
