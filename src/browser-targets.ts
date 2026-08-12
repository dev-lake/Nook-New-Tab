import type { BrowserFlavor, UtilityTarget } from './types';

const UTILITY_URLS: Record<BrowserFlavor, Record<UtilityTarget, string>> = {
  chrome: {
    bookmarks: 'chrome://bookmarks/',
    passwords: 'chrome://password-manager/passwords',
    downloads: 'chrome://downloads/',
    history: 'chrome://history/',
    extensions: 'chrome://extensions/',
    store: 'https://chromewebstore.google.com/category/extensions',
    import: 'chrome://settings/importData',
  },
  edge: {
    bookmarks: 'edge://favorites/',
    passwords: 'edge://wallet/passwords',
    downloads: 'edge://downloads/',
    history: 'edge://history/all',
    extensions: 'edge://extensions/',
    store: 'https://microsoftedge.microsoft.com/addons/Microsoft-Edge-Extensions-Home',
    import: 'edge://settings/profiles/importBrowsingData',
  },
};

export function detectBrowserFlavor(userAgent: string): BrowserFlavor {
  return /Edg\//.test(userAgent) ? 'edge' : 'chrome';
}

export function utilityUrl(target: UtilityTarget, flavor: BrowserFlavor): string {
  return UTILITY_URLS[flavor][target];
}
