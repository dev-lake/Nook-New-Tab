import { FolderPlus, X } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
import type { Translation } from '../i18n';
import { displayDomain } from '../search';
import type { BrowserAdapter, Shortcut, ShortcutGroup } from '../types';
import { ShortcutFavicon } from './ShortcutFavicon';

type ShortcutGroupDialogProps = {
  adapter: Pick<BrowserAdapter, 'getFaviconUrl'>;
  group: ShortcutGroup | null;
  shortcuts: Shortcut[];
  t: Translation;
  onCancel: () => void;
  onSave: (value: Pick<ShortcutGroup, 'title' | 'shortcutIds'>) => void;
  onDelete?: () => void;
};

export function ShortcutGroupDialog({
  adapter,
  group,
  shortcuts,
  t,
  onCancel,
  onSave,
  onDelete,
}: ShortcutGroupDialogProps) {
  const titleId = useId();
  const [title, setTitle] = useState(group?.title ?? '');
  const [selectedIds, setSelectedIds] = useState(() => new Set(group?.shortcutIds ?? []));
  const [error, setError] = useState<'title' | 'members' | null>(null);
  const selectedCount = selectedIds.size;
  const orderedShortcuts = useMemo(() => [...shortcuts].sort((left, right) => {
    const leftSelected = selectedIds.has(left.id) ? 0 : 1;
    const rightSelected = selectedIds.has(right.id) ? 0 : 1;
    return leftSelected - rightSelected;
  }), [selectedIds, shortcuts]);

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
      <section className="shortcut-dialog group-editor-dialog" role="dialog" aria-modal="true" aria-labelledby="group-editor-title">
        <header className="group-dialog-header">
          <h2 id="group-editor-title"><FolderPlus size={19} />{group ? t.editGroup : t.createGroup}</h2>
          <button type="button" className="icon-button" aria-label={t.cancel} onClick={onCancel}><X size={17} /></button>
        </header>
        <form onSubmit={(event) => {
          event.preventDefault();
          const normalizedTitle = title.trim();
          if (!normalizedTitle) {
            setError('title');
            return;
          }
          if (selectedCount < 2) {
            setError('members');
            return;
          }
          onSave({ title: normalizedTitle, shortcutIds: [...selectedIds] });
        }}>
          <label htmlFor={titleId}>{t.groupName}</label>
          <input
            id={titleId}
            autoFocus
            maxLength={40}
            value={title}
            aria-invalid={error === 'title'}
            onChange={(event) => {
              setTitle(event.target.value);
              if (error === 'title') setError(null);
            }}
          />
          {error === 'title' && <p className="field-error">{t.invalidTitle}</p>}

          <fieldset className="group-member-fieldset">
            <legend>{t.groupShortcuts}</legend>
            <p>{t.groupHelp}</p>
            <div className="group-member-list">
              {orderedShortcuts.map((shortcut) => (
                <label className="group-member-option" key={shortcut.id}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(shortcut.id)}
                    onChange={(event) => {
                      setSelectedIds((current) => {
                        const next = new Set(current);
                        if (event.target.checked) next.add(shortcut.id);
                        else next.delete(shortcut.id);
                        return next;
                      });
                      if (error === 'members') setError(null);
                    }}
                  />
                  <ShortcutFavicon adapter={adapter} title={shortcut.title} url={shortcut.url} />
                  <span><strong>{shortcut.title}</strong><small>{displayDomain(shortcut.url)}</small></span>
                </label>
              ))}
            </div>
          </fieldset>
          {error === 'members' && <p className="field-error">{t.groupNeedsTwo}</p>}

          <footer>
            {onDelete && <button className="danger-button" type="button" onClick={onDelete}>{t.deleteGroup}</button>}
            <span />
            <button type="button" onClick={onCancel}>{t.cancel}</button>
            <button className="primary-button" type="submit">{t.save}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
