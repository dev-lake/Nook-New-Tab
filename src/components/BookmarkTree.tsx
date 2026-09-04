import { Check, ChevronRight, ExternalLink, Folder, FolderTree, Globe2, PanelLeftClose, Pin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { countBookmarkTree, countBookmarks, type BookmarkFolderOption } from '../bookmarks';
import { displayDomain } from '../search';
import type { Translation } from '../i18n';
import type { BookmarkNode, BrowserAdapter } from '../types';
import { BookmarkFavicon } from './ShortcutFavicon';

type BookmarkTreeProps = {
  nodes: BookmarkNode[];
  expandedIds: Set<string>;
  loading: boolean;
  error: boolean;
  adapter: Pick<BrowserAdapter, 'getFaviconUrl'>;
  bookmarkFolderId: string | null;
  bookmarkFolders: BookmarkFolderOption[];
  pinnedUrls: Set<string>;
  t: Translation;
  onToggle: (node: BookmarkNode, expanded: boolean) => void;
  onBookmarkFolderChange: (value: string | null) => void;
  onNavigate: (url: string) => void;
  onPinBookmark: (node: BookmarkNode) => void;
  onViewAll: () => void;
  onRetry: () => void;
};

export function BookmarkTree({
  nodes,
  expandedIds,
  loading,
  error,
  adapter,
  bookmarkFolderId,
  bookmarkFolders,
  pinnedUrls,
  t,
  onToggle,
  onBookmarkFolderChange,
  onNavigate,
  onPinBookmark,
  onViewAll,
  onRetry,
}: BookmarkTreeProps) {
  const treeRef = useRef<HTMLDivElement>(null);
  const [narrowSidebar, setNarrowSidebar] = useState(() => window.matchMedia('(max-width: 900px)').matches);
  const [narrowSidebarOpen, setNarrowSidebarOpen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px)');
    const listener = (event: MediaQueryListEvent) => {
      setNarrowSidebar(event.matches);
      if (!event.matches) setNarrowSidebarOpen(false);
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const handleTreeKeys = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Home' && event.key !== 'End') return;
    const buttons = [...(treeRef.current?.querySelectorAll<HTMLButtonElement>('.folder-row') ?? [])];
    if (!buttons.length) return;
    event.preventDefault();
    (event.key === 'Home' ? buttons[0] : buttons.at(-1))?.focus();
  };

  return (
    <aside
      className="bookmark-sidebar"
      aria-labelledby={narrowSidebar && !narrowSidebarOpen ? undefined : 'bookmark-heading'}
      aria-label={narrowSidebar && !narrowSidebarOpen ? t.bookmarks : undefined}
      data-narrow-open={narrowSidebarOpen || undefined}
      onKeyDown={(event) => {
        if (narrowSidebar && narrowSidebarOpen && event.key === 'Escape') {
          event.preventDefault();
          setNarrowSidebarOpen(false);
        }
      }}
    >
      <button
        className="bookmark-sidebar-toggle"
        type="button"
        aria-label={t.bookmarks}
        aria-expanded={narrowSidebarOpen}
        aria-controls="bookmark-sidebar-content"
        onClick={() => setNarrowSidebarOpen((open) => !open)}
      >
        <span className="logo-mark" aria-hidden="true">N</span>
        <span className="bookmark-sidebar-toggle-name">Nook</span>
        <PanelLeftClose className="bookmark-sidebar-toggle-close" size={17} aria-hidden="true" />
      </button>

      <div
        className="bookmark-sidebar-content"
        id="bookmark-sidebar-content"
        hidden={narrowSidebar && !narrowSidebarOpen}
      >
        <a className="brand" href="#main" aria-label="Nook">
          <span className="logo-mark" aria-hidden="true">N</span>
          <span>Nook</span>
        </a>

        <div className="bookmark-header">
          <div>
            <h2 id="bookmark-heading">{t.bookmarks}</h2>
            <span>{t.bookmarkCount(countBookmarkTree(nodes))}</span>
          </div>
          <button className="text-button" type="button" onClick={onViewAll}>
            {t.viewAll}
            <ExternalLink size={15} aria-hidden="true" />
          </button>
        </div>

        <label className="bookmark-folder-select">
          <FolderTree size={15} aria-hidden="true" />
          <span className="sr-only">{t.bookmarkFolder}</span>
          <select
            aria-label={t.bookmarkFolder}
            value={bookmarkFolderId ?? ''}
            onChange={(event) => onBookmarkFolderChange(event.target.value || null)}
          >
            <option value="">{t.allBookmarks}</option>
            {bookmarkFolders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {`${'— '.repeat(folder.depth)}${folder.title || t.bookmarks}`}
              </option>
            ))}
          </select>
        </label>

        <div className="bookmark-scroll" ref={treeRef}>
          {loading && <BookmarkSkeleton />}
          {!loading && error && (
            <div className="bookmark-empty" role="alert">
              <p>{t.emptyBookmarks}</p>
              <button type="button" onClick={onRetry}>{t.retry}</button>
            </div>
          )}
          {!loading && !error && nodes.length === 0 && (
            <div className="bookmark-empty"><Globe2 size={22} /><p>{t.emptyBookmarks}</p></div>
          )}
          {!loading && !error && nodes.length > 0 && (
            <div className="bookmark-tree" role="tree" aria-label={t.bookmarks}>
              {nodes.map((node) => (
                <BookmarkTreeNode
                  key={node.id}
                  node={node}
                  expandedIds={expandedIds}
                  adapter={adapter}
                  t={t}
                  pinnedUrls={pinnedUrls}
                  onToggle={onToggle}
                  onNavigate={onNavigate}
                  onPinBookmark={onPinBookmark}
                  onTreeKeyDown={handleTreeKeys}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

type BookmarkTreeNodeProps = {
  node: BookmarkNode;
  expandedIds: Set<string>;
  adapter: Pick<BrowserAdapter, 'getFaviconUrl'>;
  t: Translation;
  pinnedUrls: Set<string>;
  onToggle: (node: BookmarkNode, expanded: boolean) => void;
  onNavigate: (url: string) => void;
  onPinBookmark: (node: BookmarkNode) => void;
  onTreeKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
};

function BookmarkTreeNode({
  node,
  expandedIds,
  adapter,
  t,
  pinnedUrls,
  onToggle,
  onNavigate,
  onPinBookmark,
  onTreeKeyDown,
}: BookmarkTreeNodeProps) {
  if (node.url) {
    const bookmarkName = node.title.trim() || displayDomain(node.url);
    const pinned = pinnedUrls.has(new URL(node.url).toString());
    return (
      <div className="bookmark-item" role="none">
        <a
          className="bookmark-link"
          href={node.url}
          role="treeitem"
          aria-label={t.openBookmark(bookmarkName)}
          onClick={(event) => {
            event.preventDefault();
            onNavigate(node.url!);
          }}
        >
          <BookmarkFavicon adapter={adapter} title={bookmarkName} url={node.url} />
          <span className="bookmark-label">
            <span>{bookmarkName}</span>
            <small>{displayDomain(node.url)}</small>
          </span>
        </a>
        <button
          className="bookmark-pin"
          type="button"
          disabled={pinned}
          aria-label={pinned ? t.bookmarkAlreadyPinned(bookmarkName) : t.pinBookmark(bookmarkName)}
          title={pinned ? t.bookmarkAlreadyPinned(bookmarkName) : t.pinBookmark(bookmarkName)}
          onClick={() => onPinBookmark(node)}
        >
          {pinned ? <Check size={14} /> : <Pin size={14} />}
        </button>
      </div>
    );
  }

  const children = node.children ?? [];
  const expanded = expandedIds.has(node.id);
  const childId = `bookmark-folder-${node.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  const count = countBookmarks(node);
  const name = node.title || t.bookmarks;

  return (
    <div className="folder-node" role="treeitem" aria-expanded={expanded}>
      <button
        className="folder-row"
        type="button"
        aria-expanded={expanded}
        aria-controls={childId}
        aria-label={expanded ? t.collapseFolder(name, count) : t.expandFolder(name, count)}
        onClick={() => onToggle(node, !expanded)}
        onKeyDown={(event) => {
          onTreeKeyDown(event);
          if (event.key === 'ArrowRight' && !expanded) {
            event.preventDefault();
            onToggle(node, true);
          }
          if (event.key === 'ArrowLeft' && expanded) {
            event.preventDefault();
            onToggle(node, false);
          }
        }}
      >
        <ChevronRight className="folder-chevron" size={16} aria-hidden="true" />
        <Folder size={17} aria-hidden="true" />
        <span>{name}</span>
        <small>{count}</small>
      </button>
      <div
        id={childId}
        className="folder-children"
        role="group"
        hidden={!expanded}
      >
        {children.map((child) => (
          <BookmarkTreeNode
            key={child.id}
            node={child}
            expandedIds={expandedIds}
            adapter={adapter}
            t={t}
            pinnedUrls={pinnedUrls}
            onToggle={onToggle}
            onNavigate={onNavigate}
            onPinBookmark={onPinBookmark}
            onTreeKeyDown={onTreeKeyDown}
          />
        ))}
      </div>
    </div>
  );
}

function BookmarkSkeleton() {
  return (
    <div className="bookmark-skeleton" aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => <span key={index} />)}
    </div>
  );
}
