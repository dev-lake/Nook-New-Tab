import { describe, expect, it } from 'vitest';
import { availablePopularSites, POPULAR_SITES } from '../src/popular-sites';

describe('popular website catalog', () => {
  it('offers a broad built-in selection', () => {
    expect(POPULAR_SITES.length).toBeGreaterThanOrEqual(40);
  });

  it('searches names, domains, and localized keywords', () => {
    expect(availablePopularSites([], 'calendar').map((site) => site.title)).toContain('Google Calendar');
    expect(availablePopularSites([], '音乐').map((site) => site.title)).toContain('Spotify');
    expect(availablePopularSites([], 'github.com').map((site) => site.title)).toEqual(['GitHub']);
    expect(availablePopularSites([], '国内 搜索').map((site) => site.title)).toContain('百度');
    expect(availablePopularSites([], 'b站').map((site) => site.title)).toContain('哔哩哔哩');
  });

  it('does not offer sites that are already pinned', () => {
    const sites = availablePopularSites([
      { id: 'existing', title: 'GitHub', url: 'https://www.github.com/' },
    ]);
    expect(sites.some((site) => site.id === 'github')).toBe(false);
  });

  it('orders domestic sites first only for Simplified Chinese', () => {
    expect(availablePopularSites([], '', true)[0]?.title).toBe('百度');
    expect(availablePopularSites([], '', false)[0]?.title).toBe('ChatGPT');
  });
});
