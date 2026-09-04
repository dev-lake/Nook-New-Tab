import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ShortcutDialog } from '../src/components/ShortcutDialog';
import { translations } from '../src/i18n';

describe('ShortcutDialog', () => {
  const adapter = { requestPluginAccess: vi.fn().mockResolvedValue(true) };

  it('validates a shortcut and returns normalized values', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <ShortcutDialog adapter={adapter} locale="en" shortcut={null} t={translations.en} onCancel={vi.fn()} onSave={onSave} />,
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
      <ShortcutDialog adapter={adapter} locale="en" shortcut={null} t={translations.en} onCancel={vi.fn()} onSave={onSave} />,
    );
    await user.type(screen.getByLabelText('Name'), 'Private');
    const url = screen.getByLabelText('URL');
    await user.clear(url);
    await user.type(url, 'https://user:pass@example.com');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(/safe HTTP or HTTPS URL/)).toBeVisible();
  });

  it('saves an enhanced GitHub shortcut when live data is temporarily unavailable', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network unavailable')));
    render(
      <ShortcutDialog adapter={adapter} locale="en" shortcut={null} t={translations.en} onCancel={vi.fn()} onSave={onSave} />,
    );
    await user.type(screen.getByLabelText('Name'), 'OpenAI Node');
    const url = screen.getByLabelText('URL');
    await user.clear(url);
    await user.type(url, 'https://github.com/openai/openai-node');
    await user.click(screen.getByRole('checkbox', { name: 'Show live data on this shortcut' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({
      title: 'OpenAI Node',
      url: 'https://github.com/openai/openai-node',
      enhancement: {
        pluginId: 'github-repository',
        owner: 'openai',
        repository: 'openai-node',
      },
    }));
    vi.unstubAllGlobals();
  });

  it('shows a specific message when a GitHub repository is not public', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ message: 'Not Found' }, 404)));
    render(
      <ShortcutDialog adapter={adapter} locale="en" shortcut={null} t={translations.en} onCancel={vi.fn()} onSave={onSave} />,
    );
    await user.type(screen.getByLabelText('Name'), 'Private repository');
    const url = screen.getByLabelText('URL');
    await user.clear(url);
    await user.type(url, 'https://github.com/example/private-repo');
    await user.click(screen.getByRole('checkbox', { name: 'Show live data on this shortcut' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Public repository not found');
    expect(onSave).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('lets a GitHub home-page shortcut display a configured account', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({
      login: 'octocat',
      name: 'The Octocat',
      avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
      followers: 23900,
      following: 9,
      public_repos: 8,
    })));
    render(
      <ShortcutDialog adapter={adapter} locale="en" shortcut={null} t={translations.en} onCancel={vi.fn()} onSave={onSave} />,
    );
    await user.type(screen.getByLabelText('Name'), 'GitHub');
    const url = screen.getByLabelText('URL');
    await user.clear(url);
    await user.type(url, 'https://github.com/');

    expect(screen.getByRole('region', { name: 'GitHub profile live data is available' })).toBeVisible();
    await user.click(screen.getByRole('checkbox', { name: 'Show live data on this shortcut' }));
    await user.type(screen.getByLabelText('GitHub username'), 'octocat');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith(
      {
        title: 'GitHub',
        url: 'https://github.com/',
        enhancement: { pluginId: 'github-profile', username: 'octocat' },
      },
      expect.objectContaining({ kind: 'github-profile', login: 'octocat', followers: 23900 }),
    ));
    expect(adapter.requestPluginAccess).toHaveBeenCalledWith('github-profile');
    vi.unstubAllGlobals();
  });
});

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
