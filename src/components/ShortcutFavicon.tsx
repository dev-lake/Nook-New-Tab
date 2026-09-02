import { useEffect, useState } from 'react';
import { brandIconForUrl, bundledFaviconForUrl } from '../brand-icons';
import type { BrowserAdapter } from '../types';

type FaviconCandidate =
  | { kind: 'image'; key: string; url: string }
  | { kind: 'brand'; key: string; path: string; hex: string }
  | { kind: 'fallback'; key: string };

type ShortcutFaviconProps = {
  adapter: Pick<BrowserAdapter, 'getFaviconUrl'>;
  title: string;
  url: string;
  preferBundled?: boolean;
};

type SiteFaviconProps = ShortcutFaviconProps & {
  className: 'shortcut-mark' | 'site-mark';
};

export function faviconCandidates(
  value: string,
  browserUrl: string,
  preferBundled = false,
): FaviconCandidate[] {
  try {
    const pageUrl = new URL(value);
    const brand = brandIconForUrl(value);
    const bundledFavicon = bundledFaviconForUrl(value);
    const realIconCandidates: FaviconCandidate[] = [
      { kind: 'image', key: 'browser', url: browserUrl },
      { kind: 'image', key: 'favicon-ico', url: new URL('/favicon.ico', pageUrl).toString() },
      { kind: 'image', key: 'favicon-png', url: new URL('/favicon.png', pageUrl).toString() },
      { kind: 'image', key: 'apple-touch-icon', url: new URL('/apple-touch-icon.png', pageUrl).toString() },
    ];
    const localIconCandidates: FaviconCandidate[] = [
      ...(bundledFavicon
        ? [{ kind: 'image' as const, key: 'bundled-favicon', url: bundledFavicon }]
        : []),
      ...(brand ? [{ kind: 'brand' as const, key: 'brand', path: brand.path, hex: brand.hex }] : []),
    ];
    return [
      ...(preferBundled ? localIconCandidates : realIconCandidates),
      ...(preferBundled ? realIconCandidates : localIconCandidates),
      { kind: 'fallback', key: 'fallback' },
    ];
  } catch {
    return [{ kind: 'fallback', key: 'fallback' }];
  }
}

function browserFaviconIsBlank(image: HTMLImageElement): boolean {
  try {
    const width = Math.max(1, Math.min(image.naturalWidth || 32, 32));
    const height = Math.max(1, Math.min(image.naturalHeight || 32, 32));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return false;
    context.drawImage(image, 0, 0, width, height);
    const pixels = context.getImageData(0, 0, width, height).data;
    for (let index = 3; index < pixels.length; index += 4) {
      if ((pixels[index] ?? 0) > 8) return false;
    }
    return true;
  } catch {
    // If the browser prevents pixel inspection, keep the successfully loaded icon.
    return false;
  }
}

function SiteFavicon({ adapter, title, url, preferBundled = false, className }: SiteFaviconProps) {
  const [candidateIndex, setCandidateIndex] = useState(0);
  const candidates = faviconCandidates(url, adapter.getFaviconUrl(url, 32), preferBundled);
  const candidate: FaviconCandidate = candidates[Math.min(candidateIndex, candidates.length - 1)]
    ?? { kind: 'fallback', key: 'fallback' };

  useEffect(() => setCandidateIndex(0), [preferBundled, url]);

  return (
    <span className={`${className}${candidate.kind === 'fallback' ? ' favicon-fallback' : ''}`} aria-hidden="true">
      {candidate.kind === 'fallback' ? (
        <span>{title.slice(0, 2).toUpperCase()}</span>
      ) : candidate.kind === 'brand' ? (
        <svg
          className="bundled-brand-icon"
          data-invert-on-dark={['000000', '181717'].includes(candidate.hex.toUpperCase()) ? 'true' : undefined}
          viewBox="0 0 24 24"
          style={{ color: `#${candidate.hex}` }}
        >
          <path fill="currentColor" d={candidate.path} />
        </svg>
      ) : (
        <img
          key={candidate.key}
          src={candidate.url}
          alt=""
          draggable={false}
          referrerPolicy="no-referrer"
          onLoad={(event) => {
            if (candidate.key === 'browser' && browserFaviconIsBlank(event.currentTarget)) {
              setCandidateIndex((current) => Math.min(current + 1, candidates.length - 1));
            }
          }}
          onError={() => setCandidateIndex((current) => Math.min(current + 1, candidates.length - 1))}
        />
      )}
    </span>
  );
}

export function ShortcutFavicon(props: ShortcutFaviconProps) {
  return <SiteFavicon {...props} className="shortcut-mark" />;
}

export function BookmarkFavicon(props: ShortcutFaviconProps) {
  return <SiteFavicon {...props} className="site-mark" />;
}
