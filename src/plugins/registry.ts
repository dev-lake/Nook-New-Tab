import type { PluginSurface, WidgetInstance } from '../types';
import { fetchGitHubProfileData, isGitHubProfileData } from './github-profile';
import { fetchGitHubRepositoryData, isGitHubRepositoryData } from './github-repository';
import type { WidgetPluginDefinition } from './types';

export const widgetPluginRegistry = {
  'github-repository': {
    id: 'github-repository',
    surfaces: ['shortcut'],
    cacheTtlMs: 30 * 60 * 1000,
    getConfigKey(instance) {
      if (instance.pluginId !== 'github-repository') return '';
      return `${instance.owner}/${instance.repository}`.toLowerCase();
    },
    async fetchData(instance, _locale, signal) {
      if (instance.pluginId !== 'github-repository') throw new Error('Invalid GitHub repository widget');
      return fetchGitHubRepositoryData(instance, signal);
    },
    isData: isGitHubRepositoryData,
  },
  'github-profile': {
    id: 'github-profile',
    surfaces: ['shortcut'],
    cacheTtlMs: 30 * 60 * 1000,
    getConfigKey(instance) {
      if (instance.pluginId !== 'github-profile') return '';
      return instance.username.toLowerCase();
    },
    async fetchData(instance, _locale, signal) {
      if (instance.pluginId !== 'github-profile') throw new Error('Invalid GitHub profile widget');
      return fetchGitHubProfileData(instance, signal);
    },
    isData: isGitHubProfileData,
  },
} satisfies Record<WidgetInstance['pluginId'], WidgetPluginDefinition>;

export function getWidgetPlugin(instance: WidgetInstance): WidgetPluginDefinition {
  return widgetPluginRegistry[instance.pluginId];
}

export function widgetConfigKey(instance: WidgetInstance): string {
  return getWidgetPlugin(instance).getConfigKey(instance);
}

export function pluginsForSurface(surface: PluginSurface): WidgetPluginDefinition[] {
  const plugins: WidgetPluginDefinition[] = Object.values(widgetPluginRegistry);
  return plugins.filter((plugin) => plugin.surfaces.includes(surface));
}
