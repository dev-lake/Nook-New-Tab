import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ShortcutDialog } from '../src/components/ShortcutDialog';
import { translations } from '../src/i18n';

describe('ShortcutDialog', () => {
  it('validates a shortcut and returns normalized values', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <ShortcutDialog shortcut={null} t={translations.en} onCancel={vi.fn()} onSave={onSave} />,
    );
    await user.type(screen.getByLabelText('Name'), 'Docs');
    const url = screen.getByLabelText('URL');
    await user.clear(url);
    await user.type(url, 'https://example.com/docs');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledWith({ title: 'Docs', url: 'https://example.com/docs' });
  });

  it('rejects credential-bearing URLs', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <ShortcutDialog shortcut={null} t={translations.en} onCancel={vi.fn()} onSave={onSave} />,
    );
    await user.type(screen.getByLabelText('Name'), 'Private');
    const url = screen.getByLabelText('URL');
    await user.clear(url);
    await user.type(url, 'https://user:pass@example.com');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(/safe HTTP or HTTPS URL/)).toBeVisible();
  });
});
