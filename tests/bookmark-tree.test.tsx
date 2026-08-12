import { render, screen } from '@testing-library/react';
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

function Harness({ onNavigate = vi.fn() }: { onNavigate?: (url: string) => void }) {
  const [expanded, setExpanded] = useState(new Set<string>());
  return (
    <BookmarkTree
      nodes={nodes}
      expandedIds={expanded}
      loading={false}
      error={false}
      t={translations.en}
      onToggle={(node, next) => setExpanded((current) => {
        const value = new Set(current);
        if (next) value.add(node.id); else value.delete(node.id);
        return value;
      })}
      onNavigate={onNavigate}
      onViewAll={vi.fn()}
      onRetry={vi.fn()}
    />
  );
}

describe('BookmarkTree', () => {
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
});
