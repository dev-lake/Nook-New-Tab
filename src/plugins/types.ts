import type { Locale, PluginId, PluginSurface, WidgetInstance } from '../types';
import type { GitHubProfileData } from './github-profile';
import type { GitHubRepositoryData } from './github-repository';

export type WidgetData = GitHubRepositoryData | GitHubProfileData;

export interface WidgetPluginDefinition {
  id: PluginId;
  surfaces: readonly PluginSurface[];
  cacheTtlMs: number;
  getConfigKey: (instance: WidgetInstance) => string;
  fetchData: (
    instance: WidgetInstance,
    locale: Locale,
    signal?: AbortSignal,
  ) => Promise<WidgetData>;
  isData: (value: unknown) => value is WidgetData;
}
