import type { BackgroundPreference } from './types';

export const BUILT_IN_BACKGROUNDS = [
  { id: 'mist', path: '/backgrounds/mist-mountains.jpg' },
  { id: 'dunes', path: '/backgrounds/warm-dunes.jpg' },
  { id: 'midnight', path: '/backgrounds/midnight-flow.jpg' },
] as const satisfies ReadonlyArray<{ id: Exclude<BackgroundPreference, 'none' | 'custom'>; path: string }>;

export const BACKGROUND_PREFERENCES: BackgroundPreference[] = [
  'none',
  ...BUILT_IN_BACKGROUNDS.map((background) => background.id),
  'custom',
];

export const MAX_CUSTOM_BACKGROUND_BYTES = 15 * 1024 * 1024;

export function builtInBackgroundPath(value: BackgroundPreference): string | null {
  return BUILT_IN_BACKGROUNDS.find((background) => background.id === value)?.path ?? null;
}

export function isValidCustomBackground(file: File): boolean {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    && file.size > 0
    && file.size <= MAX_CUSTOM_BACKGROUND_BYTES;
}
