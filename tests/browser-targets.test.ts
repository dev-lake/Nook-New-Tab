import { describe, expect, it } from 'vitest';
import {
  CHROME_STORE_EXTENSION_ID,
  detectBrowserFlavor,
  reviewUrl,
  utilityUrl,
} from '../src/browser-targets';

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

  it('maps the installed extension id to the browser rating page', () => {
    const extensionId = 'abcdefghijklmnopabcdefghijklmnop';
    expect(reviewUrl('chrome', extensionId)).toBe(
      `https://chromewebstore.google.com/detail/${CHROME_STORE_EXTENSION_ID}/reviews`,
    );
    expect(reviewUrl('edge', extensionId)).toBe(
      `https://microsoftedge.microsoft.com/addons/detail/${extensionId}`,
    );
  });

  it('falls back to the extension store when an id is unavailable', () => {
    expect(reviewUrl('chrome', 'development')).toContain('chromewebstore.google.com');
  });
});
