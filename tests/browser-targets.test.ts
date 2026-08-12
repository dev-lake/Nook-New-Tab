import { describe, expect, it } from 'vitest';
import { detectBrowserFlavor, utilityUrl } from '../src/browser-targets';

describe('browser target mapping', () => {
  it('detects Edge and uses Edge internal pages', () => {
    expect(detectBrowserFlavor('Mozilla/5.0 Edg/140.0')).toBe('edge');
    expect(utilityUrl('bookmarks', 'edge')).toBe('edge://favorites/');
    expect(utilityUrl('store', 'edge')).toContain('microsoftedge.microsoft.com');
  });

  it('defaults Chromium UAs to Chrome targets', () => {
    expect(detectBrowserFlavor('Mozilla/5.0 Chrome/140.0')).toBe('chrome');
    expect(utilityUrl('extensions', 'chrome')).toBe('chrome://extensions/');
  });
});
