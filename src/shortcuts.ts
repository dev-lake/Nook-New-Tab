import type { Shortcut, ShortcutGroup } from './types';

export type DropPlacement = 'before' | 'after';

export function shortcutOrderKey(id: string): string {
  return `shortcut:${id}`;
}

export function groupOrderKey(id: string): string {
  return `group:${id}`;
}

export function normalizePinnedOrder(
  value: unknown,
  shortcuts: Shortcut[],
  groups: ShortcutGroup[],
): string[] {
  const groupedIds = new Set(groups.flatMap((group) => group.shortcutIds));
  const fallbackOrder = [
    ...shortcuts.filter((shortcut) => !groupedIds.has(shortcut.id)).map((shortcut) => shortcutOrderKey(shortcut.id)),
    ...groups.map((group) => groupOrderKey(group.id)),
  ];
  const validKeys = new Set(fallbackOrder);
  const seen = new Set<string>();
  const storedOrder: string[] = [];
  if (Array.isArray(value)) {
    for (const key of value) {
      if (typeof key !== 'string' || !validKeys.has(key) || seen.has(key)) continue;
      seen.add(key);
      storedOrder.push(key);
    }
  }
  return [...storedOrder, ...fallbackOrder.filter((key) => !seen.has(key))];
}

export function reorderPinnedOrder(
  order: string[],
  sourceKey: string,
  targetKey: string,
  placement: DropPlacement,
): string[] {
  if (sourceKey === targetKey) return order;
  const source = order.find((key) => key === sourceKey);
  if (!source || !order.includes(targetKey)) return order;
  const remaining = order.filter((key) => key !== sourceKey);
  const targetIndex = remaining.indexOf(targetKey);
  const insertionIndex = placement === 'after' ? targetIndex + 1 : targetIndex;
  return [...remaining.slice(0, insertionIndex), source, ...remaining.slice(insertionIndex)];
}

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
