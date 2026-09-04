import { Edit3, ExternalLink, Folder, X } from 'lucide-react';
import type { Translation } from '../i18n';
import { displayDomain } from '../search';
import type { BrowserAdapter, Locale, Shortcut, ShortcutGroup } from '../types';
import { ShortcutFavicon } from './ShortcutFavicon';
import { ShortcutEnhancementMeta } from './ShortcutEnhancementMeta';

type ShortcutGroupMenuProps = {
  adapter: BrowserAdapter;
  locale: Locale;
  group: ShortcutGroup;
  shortcuts: Shortcut[];
  t: Translation;
  onClose: () => void;
  onEdit: () => void;
  onNavigate: (url: string) => void;
};

export function ShortcutGroupMenu({ adapter, locale, group, shortcuts, t, onClose, onEdit, onNavigate }: ShortcutGroupMenuProps) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="shortcut-dialog group-menu-dialog" role="dialog" aria-modal="true" aria-labelledby="group-menu-title">
        <header className="group-dialog-header">
          <div>
            <span className="group-title-icon"><Folder size={18} /></span>
            <h2 id="group-menu-title">{group.title}</h2>
            <small>{t.groupItemCount(shortcuts.length)}</small>
          </div>
          <div>
            <button type="button" className="icon-button" aria-label={t.editGroup} onClick={onEdit}><Edit3 size={16} /></button>
            <button type="button" className="icon-button" aria-label={t.cancel} onClick={onClose}><X size={17} /></button>
          </div>
        </header>
        <div className="group-menu-list">
          {shortcuts.map((shortcut) => (
            <button key={shortcut.id} type="button" onClick={() => onNavigate(shortcut.url)}>
              <ShortcutFavicon adapter={adapter} title={shortcut.title} url={shortcut.url} />
              <span>
                <strong>{shortcut.title}</strong>
                {shortcut.enhancement
                  ? <ShortcutEnhancementMeta adapter={adapter} shortcut={shortcut} locale={locale} t={t} />
                  : <small>{displayDomain(shortcut.url)}</small>}
              </span>
              <ExternalLink size={14} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
