import { describe, expect, it } from 'vitest';
import { reorderShortcuts } from '../src/shortcuts';
import type { Shortcut } from '../src/types';

const shortcuts: Shortcut[] = [
  { id: 'a', title: 'A', url: 'https://a.example/' },
  { id: 'b', title: 'B', url: 'https://b.example/' },
  { id: 'c', title: 'C', url: 'https://c.example/' },
];

describe('shortcut ordering', () => {
  it('moves a shortcut before or after the drop target', () => {
    expect(reorderShortcuts(shortcuts, 'c', 'a', 'before').map((item) => item.id))
      .toEqual(['c', 'a', 'b']);
    expect(reorderShortcuts(shortcuts, 'a', 'b', 'after').map((item) => item.id))
      .toEqual(['b', 'a', 'c']);
  });

  it('keeps the same array when the move is invalid', () => {
    expect(reorderShortcuts(shortcuts, 'missing', 'a', 'before')).toBe(shortcuts);
    expect(reorderShortcuts(shortcuts, 'a', 'a', 'after')).toBe(shortcuts);
  });
});
