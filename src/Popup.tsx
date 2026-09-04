import { Check, GitBranch, LoaderCircle, Plus, UserRound, X } from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { browser } from 'wxt/browser';
import { browserAdapter } from './browser-adapter';
import { ShortcutFavicon } from './components/ShortcutFavicon';
import { MAX_SHORTCUT_TITLE_LENGTH } from './defaults';
import { resolveLocale, translations } from './i18n';
import {
  fetchGitHubProfileData,
  GitHubProfileError,
  isGitHubUsername,
  normalizeGitHubUsername,
} from './plugins/github-profile';
import { fetchGitHubRepositoryData, GitHubRepositoryError } from './plugins/github-repository';
import { widgetConfigKey } from './plugins/registry';
import { detectedEnhancementForUrl } from './plugins/shortcut-enhancements';
import type { WidgetData } from './plugins/types';
import { displayDomain, isSafeHttpUrl, shortcutValidationError } from './search';
import { addToolbarPageShortcut } from './toolbar-shortcut';
import type {
  GitHubProfileWidgetInstance,
  GitHubRepositoryWidgetInstance,
  Locale,
  ShortcutEnhancement,
  SyncedSettings,
  WidgetInstance,
} from './types';

function applyTheme(settings: SyncedSettings): void {
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = settings.theme === 'system'
    ? (systemDark ? 'dark' : 'light')
    : settings.theme;
}

function cleanPageTitle(title: string | undefined, url: string): string {
  const cleaned = title?.replace(/\s+/g, ' ').trim();
  return (cleaned || displayDomain(url)).slice(0, MAX_SHORTCUT_TITLE_LENGTH);
}

export function Popup() {
  const [settings, setSettings] = useState<SyncedSettings | null>(null);
  const [locale, setLocale] = useState<Locale>(() => resolveLocale('auto'));
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [enhancementEnabled, setEnhancementEnabled] = useState(false);
  const [githubUsername, setGitHubUsername] = useState('');
  const t = translations[locale];
  const detectedEnhancement = useMemo(() => detectedEnhancementForUrl(url), [url]);
  const enhancementName = detectedEnhancement?.pluginId === 'github-profile'
    ? t.githubProfileWidget
    : t.githubRepositoryWidget;
  const enhancementHelp = detectedEnhancement?.pluginId === 'github-profile'
    ? t.githubProfileWidgetHelp
    : t.githubRepositoryWidgetHelp;

  useEffect(() => {
    if (!detectedEnhancement) {
      setEnhancementEnabled(false);
      setGitHubUsername('');
      return;
    }
    if (detectedEnhancement.pluginId === 'github-profile') {
      setGitHubUsername(detectedEnhancement.username);
    } else {
      setGitHubUsername('');
    }
  }, [detectedEnhancement]);

  useEffect(() => {
    let active = true;
    void Promise.all([
      browserAdapter.loadSettings(),
      browser.tabs.query({ active: true, currentWindow: true }),
    ]).then(([nextSettings, tabs]) => {
      if (!active) return;
      const nextLocale = resolveLocale(nextSettings.locale);
      const tab = tabs[0];
      const pageUrl = tab?.url ?? '';
      setSettings(nextSettings);
      setLocale(nextLocale);
      applyTheme(nextSettings);
      document.documentElement.lang = nextLocale;
      document.title = translations[nextLocale].addCurrentPage;

      if (isSafeHttpUrl(pageUrl)) {
        const normalizedUrl = new URL(pageUrl).toString();
        setUrl(normalizedUrl);
        setTitle(cleanPageTitle(tab?.title, normalizedUrl));
      } else {
        setMessage(translations[nextLocale].currentPageUnavailable);
      }
    }).catch(() => {
      if (active) setMessage(translations[locale].currentPageUnavailable);
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!settings || saving) return;

    const validationError = shortcutValidationError(title, url);
    if (validationError === 'title') {
      setMessage(t.invalidTitle);
      return;
    }
    if (validationError === 'url') {
      setMessage(t.invalidUrl);
      return;
    }

    let enhancement: ShortcutEnhancement | undefined;
    if (enhancementEnabled && detectedEnhancement) {
      if (detectedEnhancement.pluginId === 'github-profile') {
        const username = normalizeGitHubUsername(githubUsername);
        if (!isGitHubUsername(username)) {
          setMessage(t.invalidGitHubUsername);
          return;
        }
        enhancement = { pluginId: 'github-profile', username };
      } else {
        enhancement = detectedEnhancement;
      }
    }

    const shortcutId = `toolbar-${crypto.randomUUID()}`;
    const result = addToolbarPageShortcut(
      settings,
      { title, url: url.trim(), ...(enhancement ? { enhancement } : {}) },
      shortcutId,
    );
    if (result.status === 'duplicate') {
      setMessage(t.shortcutAlreadyExists);
      return;
    }
    if (!result.settings) {
      setMessage(t.currentPageUnavailable);
      return;
    }

    setSaving(true);
    setMessage('');
    let prefetchedData: WidgetData | undefined;
    if (enhancement) {
      let granted = false;
      try {
        granted = await browserAdapter.requestPluginAccess(enhancement.pluginId);
      } catch {
        // Treat a browser permission error the same as a declined request.
      }
      if (!granted) {
        setMessage(t.pluginPermissionDenied);
        setSaving(false);
        return;
      }
      try {
        prefetchedData = enhancement.pluginId === 'github-profile'
          ? await fetchGitHubProfileData({ id: shortcutId, ...enhancement } as GitHubProfileWidgetInstance)
          : await fetchGitHubRepositoryData({ id: shortcutId, ...enhancement } as GitHubRepositoryWidgetInstance);
      } catch (fetchError) {
        if (fetchError instanceof GitHubProfileError && fetchError.kind === 'not-found') {
          setMessage(t.githubProfileNotFound);
          setSaving(false);
          return;
        }
        if (fetchError instanceof GitHubRepositoryError && fetchError.kind === 'not-found') {
          setMessage(t.githubRepositoryNotFound);
          setSaving(false);
          return;
        }
        // Temporary data errors should not prevent the shortcut itself from being saved.
      }
    }

    let cacheSaved = false;
    if (enhancement && prefetchedData) {
      const instance: WidgetInstance = { id: shortcutId, ...enhancement };
      try {
        await browserAdapter.savePluginCache(shortcutId, {
          pluginId: enhancement.pluginId,
          configKey: widgetConfigKey(instance),
          updatedAt: Date.now(),
          data: prefetchedData,
        });
        cacheSaved = true;
      } catch {
        // The shortcut can still refresh its live data after it appears on the New Tab page.
      }
    }

    try {
      await browserAdapter.saveSettings(result.settings);
      setSuccess(true);
      window.setTimeout(() => window.close(), 700);
    } catch {
      if (cacheSaved) await browserAdapter.removePluginCache(shortcutId).catch(() => undefined);
      setMessage(t.saveFailed);
      setSaving(false);
    }
  };

  if (success) {
    return (
      <main className="popup-success" role="status">
        <span className="success-icon"><Check size={24} strokeWidth={2.2} /></span>
        <strong>{t.shortcutSaved}</strong>
      </main>
    );
  }

  return (
    <main className="popup-shell">
      <header className="popup-header">
        <span className="nook-mark" aria-hidden="true">N</span>
        <div className="popup-heading">
          <strong>{t.addCurrentPage}</strong>
          <span>{t.addCurrentPageHelp}</span>
        </div>
        <button className="icon-button" type="button" aria-label={t.cancel} onClick={() => window.close()}>
          <X size={18} />
        </button>
      </header>

      {loading ? (
        <div className="popup-loading" aria-label={t.addCurrentPage} aria-busy="true">
          <LoaderCircle size={22} className="spin" />
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="site-preview">
            <ShortcutFavicon
              adapter={browserAdapter}
              title={title || 'Nook'}
              url={isSafeHttpUrl(url) ? url : 'https://example.invalid/'}
            />
            <span>{isSafeHttpUrl(url) ? displayDomain(url) : '—'}</span>
          </div>

          <label className="field">
            <span>{t.shortcutTitle}</span>
            <input
              autoFocus
              maxLength={MAX_SHORTCUT_TITLE_LENGTH}
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setMessage('');
              }}
            />
          </label>

          <label className="field">
            <span>{t.shortcutUrl}</span>
            <input
              inputMode="url"
              spellCheck={false}
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                setMessage('');
              }}
            />
          </label>

          {detectedEnhancement && (
            <section className="popup-enhancement" aria-label={t.enhancementAvailable(enhancementName)}>
              <span className="popup-enhancement-icon" aria-hidden="true">
                {detectedEnhancement.pluginId === 'github-profile'
                  ? <UserRound size={18} />
                  : <GitBranch size={18} />}
              </span>
              <span className="popup-enhancement-copy">
                <strong>{t.enhancementAvailable(enhancementName)}</strong>
                <small>{enhancementHelp}</small>
              </span>
              <label className="popup-enhancement-toggle">
                <input
                  type="checkbox"
                  checked={enhancementEnabled}
                  onChange={(event) => {
                    setEnhancementEnabled(event.target.checked);
                    setMessage('');
                  }}
                />
                <span aria-hidden="true" />
                <em>{t.enableEnhancement}</em>
              </label>
              {detectedEnhancement.pluginId === 'github-profile' && enhancementEnabled && (
                <label className="field popup-profile-field">
                  <span>{t.githubUsername}</span>
                  <input
                    value={githubUsername}
                    maxLength={40}
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(event) => {
                      setGitHubUsername(event.target.value);
                      setMessage('');
                    }}
                  />
                  <small>{t.githubUsernameHelp}</small>
                </label>
              )}
            </section>
          )}

          <div className="form-message" role={message ? 'alert' : undefined}>{message}</div>

          <div className="popup-actions">
            <button className="cancel-button" type="button" onClick={() => window.close()}>{t.cancel}</button>
            <button className="confirm-button" type="submit" disabled={!settings || saving}>
              {saving ? <LoaderCircle size={16} className="spin" /> : <Plus size={16} />}
              {t.confirmAdd}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
