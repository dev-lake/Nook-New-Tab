import type { BrowserFlavor, UtilityTarget } from './types';

export const CHROME_STORE_EXTENSION_ID = 'iamfgplmbhngnpjhegjoddlgifnilfah';

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

export function reviewUrl(flavor: BrowserFlavor, extensionId: string): string {
  const id = (flavor === 'chrome' ? CHROME_STORE_EXTENSION_ID : extensionId).trim();
  if (!/^[a-p]{32}$/.test(id)) return UTILITY_URLS[flavor].store;
  return flavor === 'edge'
    ? `https://microsoftedge.microsoft.com/addons/detail/${id}`
    : `https://chromewebstore.google.com/detail/${id}/reviews`;
}
