import type { BrowserAdapter, PluginCacheEntry, WidgetInstance } from '../types';
import type { Locale } from '../types';
import { getWidgetPlugin, widgetConfigKey } from './registry';
import type { WidgetData } from './types';

export class PluginPermissionError extends Error {
  constructor() {
    super('Plugin host access is not granted');
    this.name = 'PluginPermissionError';
  }
}

export interface WidgetSnapshot {
  data: WidgetData;
  updatedAt: number;
  fresh: boolean;
}

export async function readWidgetCache(
  adapter: BrowserAdapter,
  instance: WidgetInstance,
  now = Date.now(),
): Promise<WidgetSnapshot | null> {
  const definition = getWidgetPlugin(instance);
  const cached = await adapter.loadPluginCache(instance.id);
  if (
    !cached
    || cached.pluginId !== instance.pluginId
    || cached.configKey !== widgetConfigKey(instance)
    || !definition.isData(cached.data)
  ) return null;
  return {
    data: cached.data,
    updatedAt: cached.updatedAt,
    fresh: now - cached.updatedAt < definition.cacheTtlMs,
  };
}

export async function refreshWidgetData(
  adapter: BrowserAdapter,
  instance: WidgetInstance,
  locale: Locale,
  options: { requestAccess?: boolean; signal?: AbortSignal } = {},
): Promise<WidgetSnapshot> {
  const hasAccess = options.requestAccess
    ? await adapter.requestPluginAccess(instance.pluginId)
    : await adapter.hasPluginAccess(instance.pluginId);
  if (!hasAccess) throw new PluginPermissionError();
  const definition = getWidgetPlugin(instance);
  const data = await definition.fetchData(instance, locale, options.signal);
  const updatedAt = Date.now();
  const entry: PluginCacheEntry = {
    pluginId: instance.pluginId,
    configKey: widgetConfigKey(instance),
    updatedAt,
    data,
  };
  await adapter.savePluginCache(instance.id, entry);
  return { data, updatedAt, fresh: true };
}
