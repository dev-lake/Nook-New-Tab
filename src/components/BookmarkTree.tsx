import { ChevronRight, ExternalLink, Folder, Globe2 } from 'lucide-react';
import { useRef } from 'react';
import { countBookmarkTree, countBookmarks } from '../bookmarks';
import { displayDomain } from '../search';
import type { Translation } from '../i18n';
import type { BookmarkNode } from '../types';

type BookmarkTreeProps = {
  nodes: BookmarkNode[];
  expandedIds: Set<string>;
  loading: boolean;
  error: boolean;
  t: Translation;
  onToggle: (node: BookmarkNode, expanded: boolean) => void;
  onNavigate: (url: string) => void;
  onViewAll: () => void;
  onRetry: () => void;
};

function markFor(title: string): string {
  return title.trim().slice(0, 2).toUpperCase() || '•';
}

export function BookmarkTree({
  nodes,
  expandedIds,
  loading,
  error,
  t,
  onToggle,
  onNavigate,
  onViewAll,
  onRetry,
}: BookmarkTreeProps) {
  const treeRef = useRef<HTMLDivElement>(null);

  const handleTreeKeys = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Home' && event.key !== 'End') return;
    const buttons = [...(treeRef.current?.querySelectorAll<HTMLButtonElement>('.folder-row') ?? [])];
    if (!buttons.length) return;
    event.preventDefault();
    (event.key === 'Home' ? buttons[0] : buttons.at(-1))?.focus();
  };

  return (
    <aside className="bookmark-sidebar" aria-labelledby="bookmark-heading">
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
                depth={0}
                expandedIds={expandedIds}
                t={t}
                onToggle={onToggle}
                onNavigate={onNavigate}
                onTreeKeyDown={handleTreeKeys}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

type BookmarkTreeNodeProps = {
  node: BookmarkNode;
  depth: number;
  expandedIds: Set<string>;
  t: Translation;
  onToggle: (node: BookmarkNode, expanded: boolean) => void;
  onNavigate: (url: string) => void;
  onTreeKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
};

function BookmarkTreeNode({
  node,
  depth,
  expandedIds,
  t,
  onToggle,
  onNavigate,
  onTreeKeyDown,
}: BookmarkTreeNodeProps) {
  if (node.url) {
    return (
      <a
        className="bookmark-link"
        href={node.url}
        role="treeitem"
        aria-label={t.openBookmark(node.title)}
        style={{ '--depth': depth } as React.CSSProperties}
        onClick={(event) => {
          event.preventDefault();
          onNavigate(node.url!);
        }}
      >
        <span className="site-mark" aria-hidden="true">{markFor(node.title)}</span>
        <span className="bookmark-label">
          <span>{node.title}</span>
          <small>{displayDomain(node.url)}</small>
        </span>
        <ExternalLink className="external-icon" size={14} aria-hidden="true" />
      </a>
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
        style={{ '--depth': depth } as React.CSSProperties}
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
            depth={depth + 1}
            expandedIds={expandedIds}
            t={t}
            onToggle={onToggle}
            onNavigate={onNavigate}
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
