import { Plus, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Translation } from '../i18n';
import { availablePopularSites } from '../popular-sites';
import type { BrowserAdapter, Locale, Shortcut } from '../types';
import { ShortcutFavicon } from './ShortcutFavicon';

type ShortcutPickerDialogProps = {
  adapter: Pick<BrowserAdapter, 'getFaviconUrl'>;
  existingShortcuts: Shortcut[];
  locale: Locale;
  t: Translation;
  onCancel: () => void;
  onSelect: (value: Omit<Shortcut, 'id'>) => void;
  onCustom: () => void;
};

export function ShortcutPickerDialog({
  adapter,
  existingShortcuts,
  locale,
  t,
  onCancel,
  onSelect,
  onCustom,
}: ShortcutPickerDialogProps) {
  const [query, setQuery] = useState('');
  const sites = useMemo(
    () => availablePopularSites(existingShortcuts, query, locale === 'zh-CN'),
    [existingShortcuts, locale, query],
  );

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onCancel();
    }}>
      <section className="shortcut-dialog shortcut-picker-dialog" role="dialog" aria-modal="true" aria-labelledby="shortcut-picker-title">
        <header className="shortcut-picker-header">
          <div>
            <h2 id="shortcut-picker-title">{t.addShortcut}</h2>
            <p>{t.choosePopularSite}</p>
          </div>
          <button type="button" aria-label={t.cancel} onClick={onCancel}><X size={18} /></button>
        </header>

        <label className="shortcut-site-search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">{t.searchPopularSites}</span>
          <input
            autoFocus
            type="search"
            value={query}
            placeholder={t.searchPopularSites}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="popular-site-list">
          {sites.map((site) => (
            <button
              className="popular-site"
              key={site.id}
              type="button"
              aria-label={t.addPopularSite(site.title)}
              onClick={() => onSelect({ title: site.title, url: site.url })}
            >
              <ShortcutFavicon adapter={adapter} title={site.title} url={site.url} preferBundled />
              <span><strong>{site.title}</strong><small>{new URL(site.url).hostname.replace(/^www\./, '')}</small></span>
              <Plus size={16} aria-hidden="true" />
            </button>
          ))}
          {sites.length === 0 && <p className="popular-sites-empty">{t.noPopularSites}</p>}
        </div>

        <button className="custom-shortcut-button" type="button" aria-label={t.customShortcut} onClick={onCustom}>
          <Plus size={17} />
          <span><strong>{t.customShortcut}</strong><small>{t.customShortcutHelp}</small></span>
        </button>
      </section>
    </div>
  );
}
