# Certification / Review Notes

The following English text can be pasted into Chrome test instructions and Microsoft Edge “Notes for certification”.

## Reviewer notes

Nook is a Manifest V3 New Tab replacement. No account, subscription, payment, test credentials, or special network environment is required.

Test steps:

1. Install and enable the extension, then open a new browser tab.
2. The left panel reads the browser's current bookmarks. If the test profile has no bookmarks, Nook displays an empty state. Add a normal HTTP/HTTPS bookmark in the browser and the tree will refresh automatically.
3. Expand a bookmark folder and open a bookmark from the tree. Use the folder selector to display one specific folder, or hover a bookmark and pin it directly to the Pinned section.
4. On any ordinary HTTP/HTTPS page, click the Nook browser-toolbar icon. A localized compact popup pre-fills that page's name and URL; review or edit the fields, then confirm to add it to Pinned. A matching GitHub repository or profile URL offers its optional live-data switch and, where needed, account configuration in the same popup. Enabling it requests the same optional GitHub host access described below. Duplicate, invalid, successful, and failed saves are reported in the popup. In the Pinned section, use Add shortcut to search the bundled popular-site catalog or enter a custom HTTP/HTTPS URL. Edit or delete a shortcut, and drag either a shortcut card or an entire group card onto another card to change its order. Use Create group to select at least two shortcuts and place them in one folder-like card. Open the card to launch a member, edit its name or membership, or dissolve the group. Shortcuts, groups, and ordering are stored using browser-managed sync storage.
5. Add or edit a shortcut whose URL points to a GitHub public repository. The ordinary shortcut editor offers optional stars, forks, and open issues inside that card. A one-segment GitHub profile URL is detected as an account, while a `github.com` home-page shortcut asks for the public username to display; both can show the username, follower count, and public-repository count. There is no separate component-edit action in Settings. Enhanced shortcuts remain editable, groupable, removable, and draggable. The API is preferred; if anonymous API access is limited, Nook reads the same public information from the matching GitHub page. No Nook or GitHub sign-in is required.
6. Use the top controls to open separate language, appearance, and settings panels. Supported languages are English, Simplified Chinese, and Japanese. Appearance supports System, Light, and Dark.
7. In Settings, choose a bundled background or upload a JPEG, PNG, or WebP image up to 15 MB. Custom images remain in extension storage on the current browser profile and are not synchronized or uploaded by Nook.
8. Enter a complete URL in the search field to navigate directly, or enter search text to use the selected search provider.
9. At the bottom of the page, click a Browser utilities icon. Each icon navigates to a browser-owned internal management page or the appropriate extension store. Nook does not read history, downloads, passwords, tabs, or installed-extension data.
10. Click the subtle rating prompt in the bottom-right corner. Chrome opens the direct reviews URL for store ID `iamfgplmbhngnpjhegjoddlgifnilfah`; Edge opens the matching Edge Add-ons detail page. Opening the destination marks the prompt completed. Alternatively, close the prompt and verify that its device-local state snoozes it for 21 days.
11. In Settings, expand the Chrome footer guide to see instructions for hiding Chrome's browser-owned New Tab footer. This browser UI is outside the extension document and cannot be removed programmatically by Nook.

Permissions:

- `bookmarks`: read-only display of the real bookmark tree and live refresh after bookmark changes.
- `storage`: browser-managed storage for preferences, pinned shortcuts, ordering, selected bookmark folder, background preference, and local folder expansion state.
- `favicon`: browser-cached icons for pinned websites.
- `activeTab`: temporary access to the current tab's title and URL only when the reviewer clicks the Nook toolbar icon to add that page as a shortcut.
- Optional `api.github.com` and `github.com`: requested only when enabling live data on a GitHub public-repository or public-profile shortcut. The API supplies public metadata; the matching public page is used only as a rate-limit or availability fallback.

Network and remote code:

- There is no developer backend, analytics, advertising, telemetry, or remote executable code. Every shortcut-enhancement implementation is packaged with the extension.
- GitHub requests go directly to GitHub after an explicit user action. A temporary network or rate-limit error no longer blocks saving the shortcut, and the component retries through its normal refresh path. Successful results are cached locally; component configurations are browser-synced.
- If the browser favicon cache has no icon, the extension uses a locally bundled brand icon when available, then may load conventional icon files from that website with no referrer.
- Search and navigation occur only after a user action and go to the selected destination.

Chrome and Edge packages share the same product functionality. Only browser-owned internal URLs and extension-store URLs are adapted for each browser.
