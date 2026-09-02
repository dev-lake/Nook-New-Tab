import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BookmarkTree } from '../src/components/BookmarkTree';
import { translations } from '../src/i18n';
import type { BookmarkNode } from '../src/types';

const nodes: BookmarkNode[] = [{
  id: 'work',
  title: 'Work',
  children: [
    { id: 'github', title: 'GitHub', url: 'https://github.com/' },
    {
      id: 'design',
      title: 'Design',
      children: [{ id: 'figma', title: 'Figma', url: 'https://figma.com/' }],
    },
  ],
}];

function Harness({
  onNavigate = vi.fn(),
  onPinBookmark = vi.fn(),
  pinnedUrls = new Set<string>(),
}: {
  onNavigate?: (url: string) => void;
  onPinBookmark?: (node: BookmarkNode) => void;
  pinnedUrls?: Set<string>;
}) {
  const [expanded, setExpanded] = useState(new Set<string>());
  return (
    <BookmarkTree
      nodes={nodes}
      expandedIds={expanded}
      loading={false}
      error={false}
      adapter={{
        getFaviconUrl: (url) => `chrome-extension://test/_favicon/?pageUrl=${encodeURIComponent(url)}&size=32`,
      }}
      bookmarkFolderId={null}
      bookmarkFolders={[
        { id: 'work', title: 'Work', depth: 0 },
        { id: 'design', title: 'Design', depth: 1 },
      ]}
      pinnedUrls={pinnedUrls}
      t={translations.en}
      onToggle={(node, next) => setExpanded((current) => {
        const value = new Set(current);
        if (next) value.add(node.id); else value.delete(node.id);
        return value;
      })}
      onNavigate={onNavigate}
      onPinBookmark={onPinBookmark}
      onBookmarkFolderChange={vi.fn()}
      onViewAll={vi.fn()}
      onRetry={vi.fn()}
    />
  );
}

describe('BookmarkTree', () => {
  it('keeps an ultra-narrow sidebar collapsed on the left until activated', async () => {
    const user = userEvent.setup();
    const matchMedia = vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query === '(max-width: 900px)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    }));

    render(<Harness />);
    const toggle = screen.getByRole('button', { name: 'Bookmarks' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: /Expand Work/ })).not.toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: /Expand Work/ })).toBeVisible();

    await user.keyboard('{Escape}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: /Expand Work/ })).not.toBeInTheDocument();
    matchMedia.mockRestore();
  });

  it('expands nested folders using native disclosure semantics', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const work = screen.getByRole('button', { name: /Expand Work/ });
    expect(work).toHaveAttribute('aria-expanded', 'false');
    await user.click(work);
    expect(work).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('treeitem', { name: 'Open GitHub' })).toBeVisible();
  });

  it('supports ArrowRight and direct bookmark navigation', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<Harness onNavigate={onNavigate} />);
    const work = screen.getByRole('button', { name: /Expand Work/ });
    work.focus();
    await user.keyboard('{ArrowRight}');
    await user.click(screen.getByRole('treeitem', { name: 'Open GitHub' }));
    expect(onNavigate).toHaveBeenCalledWith('https://github.com/');
  });

  it('prefers the real browser favicon before its local fallbacks', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: /Expand Work/ }));

    const bookmark = screen.getByRole('treeitem', { name: 'Open GitHub' });
    const browserIcon = bookmark.querySelector('.site-mark img') as HTMLImageElement;
    expect(browserIcon.src).toContain('_favicon/?pageUrl=');
    expect(browserIcon.closest('.site-mark')).not.toHaveClass('favicon-fallback');
    expect(bookmark.querySelector('.site-mark > span')).not.toBeInTheDocument();
    fireEvent.error(browserIcon);
    expect((bookmark.querySelector('.site-mark img') as HTMLImageElement).src).toBe('https://github.com/favicon.ico');
  });

  it('pins a bookmark directly and marks an existing shortcut', async () => {
    const user = userEvent.setup();
    const onPinBookmark = vi.fn();
    const { rerender } = render(<Harness onPinBookmark={onPinBookmark} />);
    await user.click(screen.getByRole('button', { name: /Expand Work/ }));
    await user.click(screen.getByRole('button', { name: 'Pin GitHub' }));
    expect(onPinBookmark).toHaveBeenCalledWith(expect.objectContaining({ id: 'github' }));

    rerender(<Harness onPinBookmark={onPinBookmark} pinnedUrls={new Set(['https://github.com/'])} />);
    expect(screen.getByRole('button', { name: 'GitHub is already pinned' })).toBeDisabled();
  });
});
