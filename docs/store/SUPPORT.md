# Nook Support

Nook is a New Tab extension for Chrome and Microsoft Edge.

Support contact: `[SUPPORT_EMAIL]`

## Common questions

### Why did my New Tab page change?

Nook is a New Tab replacement. Disable or remove Nook from the browser's extension management page to restore the browser's previous New Tab page.

### Why are my bookmarks missing?

Confirm that Nook is enabled and has the Bookmarks permission. Nook displays HTTP and HTTPS bookmarks from the current browser profile. It does not display unsafe or unsupported URL schemes.

### Why is a website icon showing letters?

Nook first uses the browser's cached favicon, then a locally bundled brand icon when available, and finally the website's own conventional icon files. If none provides an icon, Nook displays a short text fallback.

### How do I reorder pinned shortcuts?

Drag a pinned shortcut or group card and drop it before or after another card. The new order is stored with the rest of your browser-synced Nook preferences.

### How do I organize pinned shortcuts into a group?

Select "Create group" in the Pinned heading, enter a name, and choose at least two shortcuts. The selected shortcuts appear inside one folder-like card. Open the card to access its members, use its edit control to change membership, or choose "Dissolve group" to return every member to the main grid.

### How do I remove Chrome's footer below Nook?

Open Nook Settings and expand "Hide Chrome footer" for the current instructions. The footer belongs to Chrome and cannot be hidden automatically by an extension. You can right-click the footer and choose "Hide footer on New Tab page," or open "Customize Chrome," select "Footer," and turn the footer off. A managed browser may let an administrator control this option.

### Where is my custom background stored?

The selected image is stored only in Nook's local extension database in the current browser profile. Nook does not upload or synchronize it. Use "Remove custom image" in Settings to delete it.

### Why is a component asking for site access?

When you enable live data on a GitHub public-repository or public-profile shortcut, Nook retrieves the selected public information directly from GitHub. Access to GitHub's API and public pages is requested only after you opt in. The API is preferred; the public page is used as a fallback when anonymous API requests are temporarily limited. If access is declined or later removed, ordinary shortcuts and the rest of Nook continue working.

### How do I add a component?

Edit a compatible GitHub shortcut with its normal card edit button. The same dialog offers the matching repository or profile component, so it can be enabled, configured, or disabled without a separate mode in Settings. Main-page and sidebar-bottom components are not currently available.

### Why is a component showing old data?

Nook keeps the last successful GitHub result on this device so a new tab can render quickly and remain useful offline. It refreshes stale information automatically. When GitHub temporarily limits anonymous API requests, Nook tries the matching public repository page; cached data remains visible if both routes are temporarily unavailable.

### How does account information work on GitHub shortcuts?

A shortcut to `github.com/username` fills the public username automatically. A shortcut to the GitHub home page cannot identify the signed-in account without authentication, so Nook asks which public username to display. Only public profile counters are requested; Nook does not read the signed-in GitHub session.

### How do I delete Nook data?

Delete individual pinned shortcuts from their edit dialog. Deleting an enhanced shortcut also removes its live-data cache from the current profile. To remove all Nook data, uninstall the extension and clear its synchronized extension data through the browser account or sync settings where available.

### Does Nook upload my bookmarks?

No. Bookmark contents are read only to render the bookmark tree and are not copied into extension storage or sent to the developer.

## Reporting a problem

When contacting support, include:

- browser name and version;
- Nook version;
- operating system;
- steps to reproduce the issue;
- a screenshot with private bookmark names or URLs removed.

Do not send passwords, authentication codes, private bookmark exports, or other sensitive information.
