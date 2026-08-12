import type { Shortcut } from './types';

export type DropPlacement = 'before' | 'after';

export function reorderShortcuts(
  shortcuts: Shortcut[],
  sourceId: string,
  targetId: string,
  placement: DropPlacement,
): Shortcut[] {
  if (sourceId === targetId) return shortcuts;

  const source = shortcuts.find((shortcut) => shortcut.id === sourceId);
  if (!source || !shortcuts.some((shortcut) => shortcut.id === targetId)) return shortcuts;

  const remaining = shortcuts.filter((shortcut) => shortcut.id !== sourceId);
  const targetIndex = remaining.findIndex((shortcut) => shortcut.id === targetId);
  const insertionIndex = placement === 'after' ? targetIndex + 1 : targetIndex;
  return [
    ...remaining.slice(0, insertionIndex),
    source,
    ...remaining.slice(insertionIndex),
  ];
}
