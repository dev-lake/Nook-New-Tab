import type { BookmarkNode } from './types';
import { isSafeHttpUrl } from './search';

type RawBookmarkNode = {
  id?: unknown;
  title?: unknown;
  url?: unknown;
  children?: unknown;
};

export function normalizeBookmarkNode(raw: RawBookmarkNode): BookmarkNode | null {
  if (typeof raw.id !== 'string') return null;
  const title = typeof raw.title === 'string' ? raw.title : '';

  if (typeof raw.url === 'string') {
    if (!isSafeHttpUrl(raw.url)) return null;
    return { id: raw.id, title: title || raw.url, url: raw.url };
  }

  const rawChildren = Array.isArray(raw.children) ? raw.children : [];
  const children = rawChildren
    .map((child) => normalizeBookmarkNode(child as RawBookmarkNode))
    .filter((child): child is BookmarkNode => child !== null);

  return { id: raw.id, title, children };
}

export function normalizeBookmarkTree(rawTree: unknown): BookmarkNode[] {
  if (!Array.isArray(rawTree)) return [];
  return rawTree
    .map((node) => normalizeBookmarkNode(node as RawBookmarkNode))
    .filter((node): node is BookmarkNode => node !== null)
    .flatMap((node) => (node.id === '0' && node.children ? node.children : [node]));
}

export function countBookmarks(node: BookmarkNode): number {
  if (node.url) return 1;
  return (node.children ?? []).reduce((total, child) => total + countBookmarks(child), 0);
}

export function countBookmarkTree(nodes: BookmarkNode[]): number {
  return nodes.reduce((total, node) => total + countBookmarks(node), 0);
}

export function collectFolderIds(nodes: BookmarkNode[]): string[] {
  return nodes.flatMap((node) => {
    if (node.url) return [];
    return [node.id, ...collectFolderIds(node.children ?? [])];
  });
}
