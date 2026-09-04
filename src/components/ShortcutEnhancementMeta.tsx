import {
  BookOpen,
  CircleDot,
  GitFork,
  Star,
  Users,
  UserPlus,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { Translation } from '../i18n';
import { PluginPermissionError, readWidgetCache, refreshWidgetData } from '../plugins/runtime';
import type { WidgetData } from '../plugins/types';
import type { BrowserAdapter, Locale, Shortcut } from '../types';
import { enhancementInstanceForShortcut } from '../plugins/shortcut-enhancements';

type Props = {
  adapter: BrowserAdapter;
  shortcut: Shortcut;
  locale: Locale;
  t: Translation;
};

export function ShortcutEnhancementMeta({ adapter, shortcut, locale, t }: Props) {
  const instance = enhancementInstanceForShortcut(shortcut);
  const [data, setData] = useState<WidgetData | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error' | 'permission'>('loading');

  const applySnapshot = useCallback((snapshot: Awaited<ReturnType<typeof refreshWidgetData>>) => {
    setData(snapshot.data);
    setState('ready');
  }, []);

  useEffect(() => {
    if (!instance) return;
    let active = true;
    const controller = new AbortController();
    void (async () => {
      let cached: Awaited<ReturnType<typeof readWidgetCache>> = null;
      try {
        cached = await readWidgetCache(adapter, instance);
        if (!active) return;
        if (cached) {
          setData(cached.data);
          setState('ready');
          if (cached.fresh) return;
        }
        const snapshot = await refreshWidgetData(adapter, instance, locale, { signal: controller.signal });
        if (active) applySnapshot(snapshot);
      } catch (error) {
        if (!active || controller.signal.aborted || cached) return;
        setState(error instanceof PluginPermissionError ? 'permission' : 'error');
      }
    })();
    return () => {
      active = false;
      controller.abort();
    };
  }, [adapter, applySnapshot, instance?.id, instance?.pluginId, shortcut.enhancement, locale]);

  if (!instance) return <small>{shortcut.url}</small>;
  if (!data) {
    const label = state === 'loading'
      ? t.enhancementUpdating
      : state === 'permission' ? t.pluginPermissionDenied : t.widgetLoadFailed;
    return <small className={`enhancement-meta is-${state}`}>{label}</small>;
  }

  if (instance.pluginId === 'github-repository' && data.kind === 'github-repository') {
    const formatter = new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 });
    return (
      <small className="enhancement-meta github" aria-label={`${t.stars} ${data.stars}, ${t.forks} ${data.forks}, ${t.openIssues} ${data.openIssues}`}>
        <span title={t.stars}><Star size={11} />{formatter.format(data.stars)}</span>
        <span title={t.forks}><GitFork size={11} />{formatter.format(data.forks)}</span>
        <span title={t.openIssues}><CircleDot size={11} />{formatter.format(data.openIssues)}</span>
      </small>
    );
  }

  if (instance.pluginId === 'github-profile' && data.kind === 'github-profile') {
    const formatter = new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 });
    return (
      <small
        className="enhancement-meta github github-profile"
        aria-label={`@${data.login}, ${t.followers} ${data.followers}, ${t.following} ${data.following}, ${t.publicRepositories} ${data.publicRepositories}`}
      >
        <span className="profile-login" title={data.name ? `${data.name} (@${data.login})` : `@${data.login}`}>@{data.login}</span>
        <span title={t.followers}><Users size={11} />{formatter.format(data.followers)}</span>
        <span title={t.following}><UserPlus size={11} />{formatter.format(data.following)}</span>
        <span title={t.publicRepositories}><BookOpen size={11} />{formatter.format(data.publicRepositories)}</span>
      </small>
    );
  }

  return <small>{shortcut.url}</small>;
}
