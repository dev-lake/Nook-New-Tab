import { describe, expect, it } from 'vitest';
import {
  collectBookmarkFolders,
  collectFolderIds,
  countBookmarkTree,
  findBookmarkFolder,
  normalizeBookmarkTree,
} from '../src/bookmarks';

describe('bookmark tree helpers', () => {
  const raw = [{
    id: '0',
    title: '',
    children: [{
      id: '1',
      title: 'Work',
      children: [
        { id: '2', title: 'GitHub', url: 'https://github.com/' },
        { id: '3', title: 'Unsafe', url: 'javascript:alert(1)' },
        {
          id: '4',
          title: 'Design',
          children: [{ id: '5', title: 'Figma', url: 'https://figma.com/' }],
        },
      ],
    }],
  }];

  it('normalizes a Chrome tree and filters unsafe bookmarks', () => {
    const tree = normalizeBookmarkTree(raw);
    expect(tree).toHaveLength(1);
    expect(countBookmarkTree(tree)).toBe(2);
    expect(tree[0]?.children?.some((node) => node.title === 'Unsafe')).toBe(false);
  });

  it('collects recursive folder IDs', () => {
    expect(collectFolderIds(normalizeBookmarkTree(raw))).toEqual(['1', '4']);
  });

  it('collects nested folder choices and finds the selected folder', () => {
    const tree = normalizeBookmarkTree(raw);
    expect(collectBookmarkFolders(tree)).toEqual([
      { id: '1', title: 'Work', depth: 0 },
      { id: '4', title: 'Design', depth: 1 },
    ]);
    expect(findBookmarkFolder(tree, '4')?.title).toBe('Design');
    expect(findBookmarkFolder(tree, 'missing')).toBeNull();
  });
});
