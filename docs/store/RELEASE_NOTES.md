# Release Notes

## Version 0.4.0

- Adds a localized toolbar popup for reviewing or editing the current HTTP/HTTPS page's name and URL before saving it to Pinned, with duplicate, validation, success, and sync-error feedback. Matching GitHub repository and profile URLs offer their optional live-data enhancement directly in this popup.
- Adds a subtle, localized and dismissible rating prompt in the bottom-right corner. Chrome uses store ID `iamfgplmbhngnpjhegjoddlgifnilfah` to open the direct reviews page; Edge uses its installed ID. Closing snoozes the prompt for 21 days, while opening the rating destination marks it completed.
- Improves bookmark-sidebar density and overflow behavior, removes the unwanted tree connector and hides its scrollbar until interaction.
- Fixes shortcut drag-and-drop at the first grid position and prevents the first Browser utilities hover label from being clipped.

## Version 0.3.0

- Adds an extensible, packaged shortcut-component framework with opt-in permissions, validated data, and local caching.
- Offers optional repository counters and public GitHub account summaries directly in the ordinary shortcut editor, with no required GitHub sign-in or separate component-edit mode in Settings.
- Displays GitHub live information inside the existing shortcut card. Enhanced shortcuts can be edited, grouped, removed, and drag-reordered exactly like ordinary shortcuts.
- Fixes disabling GitHub live data from an existing shortcut so the component and its local cache are removed immediately after saving.
- Adds a GitHub public-page fallback when the anonymous API rate limit is exhausted, distinguishes missing/private repositories from temporary failures, and no longer blocks saving during a recoverable outage.
- Adds optional GitHub account information to `github.com` home-page and one-segment Profile shortcuts. Home-page shortcuts accept a public username; Profile URLs fill it automatically and display the username, followers, and public repositories inside the existing card.
- Requests GitHub API and public-page access only when enabling a repository or profile shortcut component.

## Version 0.2.0

- Adds a searchable popular-site picker with localized ordering and reliable bundled icons.
- Removes the app-defined limit on the number of pinned shortcuts.
- Adds folder-like groups that place multiple pinned shortcuts inside one compact card and can be reordered alongside ordinary shortcut cards.
- Keeps the Pinned grid independently scrollable when it contains more cards than the available viewport space.
- Replaces pagination with a responsive grid that displays all top-level shortcuts and groups.
- Aligns the search field with the main content, moves top controls to the right edge, and reduces unused right-side spacing.
- Adds direct one-click pinning from the bookmark sidebar.
- Lets users choose a specific bookmark folder as the sidebar root.
- Shows real favicons for bookmarks and pinned sites, with bundled and website fallbacks.
- Adds built-in backgrounds and locally stored custom background images.
- Makes the bookmark sidebar compact by default, expanding on hover while gently shifting the main content; narrow windows use a persistent left rail instead of moving bookmarks above the page.
- Adds localized guidance for hiding Chrome's browser-owned New Tab footer.
- Prevents default shortcuts, language, and appearance from flashing before stored preferences finish loading.
- Improves localized New Tab titles, independent language and appearance panels, shortcut editing, and responsive layout behavior.

## Version 0.1.0 — Initial release

Nook introduces a focused New Tab experience for Chrome and Microsoft Edge.

- Displays the browser's real bookmark tree with nested folder expansion.
- Adds editable pinned shortcuts with real website icons and drag-and-drop ordering.
- Adds a searchable catalog of popular global and Chinese websites, plus bundled brand icons for sites not yet present in the browser favicon cache.
- Adds one-click pinning from the bookmark sidebar to the pinned shortcut area.
- Supports direct URL navigation and Google, Bing, or DuckDuckGo search.
- Provides compact links to bookmarks, passwords, downloads, history, extension management, and the extension store.
- Supports System, Light, and Dark appearance.
- Includes English, Simplified Chinese, and Japanese interfaces.
- Uses browser-managed storage and sync without a developer backend, analytics, or advertising.
