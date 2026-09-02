import { describe, expect, it } from 'vitest';
import { brandIconForUrl, bundledFaviconForUrl } from '../src/brand-icons';
import { faviconCandidates } from '../src/components/ShortcutFavicon';
import { POPULAR_SITES } from '../src/popular-sites';

describe('favicon fallbacks', () => {
  it('bundles brand icons for supported unvisited global and Chinese sites', () => {
    expect(brandIconForUrl('https://github.com/')).not.toBeNull();
    expect(brandIconForUrl('https://www.bilibili.com/video/')).not.toBeNull();
    expect(brandIconForUrl('https://www.zhihu.com/question/1')).not.toBeNull();
    expect(bundledFaviconForUrl('https://www.jd.com/')).toMatch(/^data:image\/png;base64,/);
    expect(bundledFaviconForUrl('https://www.feishu.cn/')).toMatch(/^data:image\/png;base64,/);
    expect(bundledFaviconForUrl('https://app.slack.com/')).toMatch(/^data:image\/png;base64,/);
    expect(POPULAR_SITES.every((site) => (
      brandIconForUrl(site.url) !== null || bundledFaviconForUrl(site.url) !== null
    ))).toBe(true);
  });

  it('tries same-site conventional icon files before initials', () => {
    const candidates = faviconCandidates('https://example.com/path', 'chrome-extension://test/favicon');
    expect(candidates.map((candidate) => candidate.kind === 'image' ? candidate.url : candidate.kind)).toEqual([
      'chrome-extension://test/favicon',
      'https://example.com/favicon.ico',
      'https://example.com/favicon.png',
      'https://example.com/apple-touch-icon.png',
      'fallback',
    ]);
  });

  it('prefers real favicon sources before bundled brand artwork', () => {
    const candidates = faviconCandidates('https://github.com/', 'chrome-extension://test/favicon');
    expect(candidates.map((candidate) => candidate.key)).toEqual([
      'browser',
      'favicon-ico',
      'favicon-png',
      'apple-touch-icon',
      'brand',
      'fallback',
    ]);
  });

  it('can prioritize bundled artwork inside the shortcut picker', () => {
    const candidates = faviconCandidates('https://github.com/', 'chrome-extension://test/favicon', true);
    expect(candidates.map((candidate) => candidate.key)).toEqual([
      'brand',
      'browser',
      'favicon-ico',
      'favicon-png',
      'apple-touch-icon',
      'fallback',
    ]);
  });
});
