import { GitBranch, UserRound } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
import type { Translation } from '../i18n';
import {
  fetchGitHubProfileData,
  GitHubProfileError,
  isGitHubUsername,
  normalizeGitHubUsername,
} from '../plugins/github-profile';
import { fetchGitHubRepositoryData, GitHubRepositoryError } from '../plugins/github-repository';
import { detectedEnhancementForUrl } from '../plugins/shortcut-enhancements';
import type { WidgetData } from '../plugins/types';
import { shortcutValidationError } from '../search';
import type {
  BrowserAdapter,
  GitHubProfileWidgetInstance,
  GitHubRepositoryWidgetInstance,
  Locale,
  Shortcut,
  ShortcutEnhancement,
} from '../types';

type ShortcutDialogProps = {
  adapter: Pick<BrowserAdapter, 'requestPluginAccess'>;
  locale: Locale;
  shortcut: Shortcut | null;
  t: Translation;
  onCancel: () => void;
  onSave: (value: Omit<Shortcut, 'id'>, prefetchedData?: WidgetData) => void | Promise<void>;
  onDelete?: () => void;
};

export function ShortcutDialog({ adapter, locale, shortcut, t, onCancel, onSave, onDelete }: ShortcutDialogProps) {
  const titleId = useId();
  const urlId = useId();
  const usernameId = useId();
  const [title, setTitle] = useState(shortcut?.title ?? '');
  const [url, setUrl] = useState(shortcut?.url ?? 'https://');
  const [githubUsername, setGitHubUsername] = useState(
    shortcut?.enhancement?.pluginId === 'github-profile' ? shortcut.enhancement.username : '',
  );
  const [error, setError] = useState<'title' | 'url' | 'githubUsername' | null>(null);
  const [message, setMessage] = useState('');
  const [enhancementEnabled, setEnhancementEnabled] = useState(Boolean(shortcut?.enhancement));
  const [loading, setLoading] = useState(false);
  const detectedEnhancement = useMemo(() => detectedEnhancementForUrl(url), [url]);
  const detectedProfileUsername = detectedEnhancement?.pluginId === 'github-profile'
    ? detectedEnhancement.username
    : null;
  const enhancementName = detectedEnhancement?.pluginId === 'github-profile'
    ? t.githubProfileWidget
    : t.githubRepositoryWidget;
  const enhancementHelp = detectedEnhancement?.pluginId === 'github-profile'
    ? t.githubProfileWidgetHelp
    : t.githubRepositoryWidgetHelp;

  useEffect(() => {
    if (!detectedEnhancement) setEnhancementEnabled(false);
  }, [detectedEnhancement]);

  useEffect(() => {
    if (detectedProfileUsername) setGitHubUsername(detectedProfileUsername);
  }, [detectedProfileUsername]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextError = shortcutValidationError(title, url);
    setError(nextError);
    setMessage('');
    if (nextError) return;

    let enhancement: ShortcutEnhancement | null = null;
    if (enhancementEnabled && detectedEnhancement) {
      if (detectedEnhancement.pluginId === 'github-profile') {
        const username = normalizeGitHubUsername(githubUsername);
        if (!isGitHubUsername(username)) {
          setError('githubUsername');
          return;
        }
        enhancement = { pluginId: 'github-profile', username };
      } else {
        enhancement = detectedEnhancement;
      }
    }
    const value: Omit<Shortcut, 'id'> = {
      title: title.trim(),
      url: new URL(url.trim()).toString(),
      ...(enhancement ? { enhancement } : {}),
    };
    let prefetchedData: WidgetData | undefined;
    if (enhancement) {
      setLoading(true);
      try {
        const granted = await adapter.requestPluginAccess(enhancement.pluginId);
        if (!granted) {
          setMessage(t.pluginPermissionDenied);
          setLoading(false);
          return;
        }
        prefetchedData = enhancement.pluginId === 'github-profile'
          ? await fetchGitHubProfileData({
              id: shortcut?.id ?? 'shortcut-preview',
              ...enhancement,
            } as GitHubProfileWidgetInstance)
          : await fetchGitHubRepositoryData({
              id: shortcut?.id ?? 'shortcut-preview',
              ...enhancement,
            } as GitHubRepositoryWidgetInstance);
      } catch (fetchError) {
        setLoading(false);
        if (fetchError instanceof GitHubProfileError && fetchError.kind === 'not-found') {
          setMessage(t.githubProfileNotFound);
          return;
        }
        if (fetchError instanceof GitHubRepositoryError && fetchError.kind === 'not-found') {
          setMessage(t.githubRepositoryNotFound);
          return;
        }
        // A temporary GitHub or network failure should not prevent saving the shortcut.
        // The card will retry through the normal cache refresh path after it is created.
        await onSave(value);
        return;
      }
      setLoading(false);
    }

    if (prefetchedData) await onSave(value, prefetchedData);
    else await onSave(value);
  };

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onCancel();
    }}>
      <section className="shortcut-dialog" role="dialog" aria-modal="true" aria-labelledby="shortcut-dialog-title">
        <h2 id="shortcut-dialog-title">{shortcut ? t.editShortcut : t.addShortcut}</h2>
        <form onSubmit={(event) => void submit(event)}>
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

          {detectedEnhancement && (
            <section className="shortcut-enhancement-offer" aria-label={t.enhancementAvailable(enhancementName)}>
              <div className="enhancement-offer-heading">
                <span className="enhancement-plugin-icon github">
                  {detectedEnhancement.pluginId === 'github-profile' ? <UserRound size={21} /> : <GitBranch size={21} />}
                </span>
                <span className="enhancement-offer-copy">
                  <strong>{t.enhancementAvailable(enhancementName)}</strong>
                  <small>{enhancementHelp}</small>
                </span>
                <label className="enhancement-toggle">
                  <input
                    type="checkbox"
                    checked={enhancementEnabled}
                    onChange={(event) => setEnhancementEnabled(event.target.checked)}
                  />
                  <span>{t.enableEnhancement}</span>
                </label>
                {detectedEnhancement.pluginId === 'github-profile' && enhancementEnabled && (
                  <div className="enhancement-profile-config">
                    <label htmlFor={usernameId}>{t.githubUsername}</label>
                    <input
                      id={usernameId}
                      value={githubUsername}
                      maxLength={40}
                      autoComplete="off"
                      spellCheck={false}
                      aria-invalid={error === 'githubUsername'}
                      onChange={(event) => {
                        setGitHubUsername(event.target.value);
                        if (error === 'githubUsername') setError(null);
                      }}
                    />
                    <small>{t.githubUsernameHelp}</small>
                    {error === 'githubUsername' && <p className="field-error">{t.invalidGitHubUsername}</p>}
                  </div>
                )}
              </div>
            </section>
          )}

          {message && <p className="field-error" role="alert">{message}</p>}
          <footer>
            {onDelete && <button className="danger-button" type="button" onClick={onDelete}>{t.delete}</button>}
            <span />
            <button type="button" onClick={onCancel}>{t.cancel}</button>
            <button className="primary-button" type="submit" disabled={loading}>{loading ? t.enhancementUpdating : t.save}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
