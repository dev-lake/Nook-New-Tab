import { useEffect, useId, useState } from 'react';
import type { Translation } from '../i18n';
import { shortcutValidationError } from '../search';
import type { Shortcut } from '../types';

type ShortcutDialogProps = {
  shortcut: Shortcut | null;
  t: Translation;
  onCancel: () => void;
  onSave: (value: Omit<Shortcut, 'id'>) => void;
  onDelete?: () => void;
};

export function ShortcutDialog({ shortcut, t, onCancel, onSave, onDelete }: ShortcutDialogProps) {
  const titleId = useId();
  const urlId = useId();
  const [title, setTitle] = useState(shortcut?.title ?? '');
  const [url, setUrl] = useState(shortcut?.url ?? 'https://');
  const [error, setError] = useState<'title' | 'url' | null>(null);

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
      <section className="shortcut-dialog" role="dialog" aria-modal="true" aria-labelledby="shortcut-dialog-title">
        <h2 id="shortcut-dialog-title">{shortcut ? t.editShortcut : t.addShortcut}</h2>
        <form onSubmit={(event) => {
          event.preventDefault();
          const nextError = shortcutValidationError(title, url);
          setError(nextError);
          if (!nextError) onSave({ title: title.trim(), url: new URL(url.trim()).toString() });
        }}>
          <label htmlFor={titleId}>{t.shortcutTitle}</label>
          <input
            id={titleId}
            autoFocus
            maxLength={40}
            value={title}
            aria-invalid={error === 'title'}
            onChange={(event) => setTitle(event.target.value)}
          />
          {error === 'title' && <p className="field-error">{t.invalidTitle}</p>}

          <label htmlFor={urlId}>{t.shortcutUrl}</label>
          <input
            id={urlId}
            inputMode="url"
            value={url}
            aria-invalid={error === 'url'}
            onChange={(event) => setUrl(event.target.value)}
          />
          {error === 'url' && <p className="field-error">{t.invalidUrl}</p>}

          <footer>
            {onDelete && <button className="danger-button" type="button" onClick={onDelete}>{t.delete}</button>}
            <span />
            <button type="button" onClick={onCancel}>{t.cancel}</button>
            <button className="primary-button" type="submit">{t.save}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
