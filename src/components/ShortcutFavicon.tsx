import { useEffect, useState } from 'react';
import type { BrowserAdapter } from '../types';

type FaviconSource = 'browser' | 'website' | 'fallback';

type ShortcutFaviconProps = {
  adapter: BrowserAdapter;
  title: string;
  url: string;
};

function websiteFaviconUrl(value: string): string {
  try {
    return new URL('/favicon.ico', value).toString();
  } catch {
    return '';
  }
}

export function ShortcutFavicon({ adapter, title, url }: ShortcutFaviconProps) {
  const [source, setSource] = useState<FaviconSource>('browser');

  useEffect(() => setSource('browser'), [url]);

  const imageUrl = source === 'browser'
    ? adapter.getFaviconUrl(url, 32)
    : websiteFaviconUrl(url);

  return (
    <span className="shortcut-mark">
      <span>{title.slice(0, 2).toUpperCase()}</span>
      {source !== 'fallback' && imageUrl && (
        <img
          key={source}
          src={imageUrl}
          alt=""
          draggable={false}
          referrerPolicy="no-referrer"
          onError={() => setSource((current) => current === 'browser' ? 'website' : 'fallback')}
        />
      )}
    </span>
  );
}
