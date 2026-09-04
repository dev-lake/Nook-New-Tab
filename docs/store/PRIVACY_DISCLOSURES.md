# 商店隐私披露与权限说明

以下英文内容可直接粘贴到 Chrome Web Store Developer Dashboard 和 Microsoft Partner Center。提交前应再次对照当前 Manifest 和隐私政策。

## Single purpose

Nook replaces the browser's New Tab page with a focused workspace that displays the user's existing bookmark tree, editable pinned shortcuts with optional URL-matched public repository data, search, and compact browser-management links. The toolbar action also lets the user add the current page to those pinned shortcuts with one click. All features support this single purpose of making bookmarks and routine browser information accessible from the New Tab page.

## Permission justifications

### `bookmarks`

Required to read the user's existing bookmark tree and listen for bookmark changes so the New Tab page can display current bookmark folders and links. Nook provides read-only bookmark access: it does not create, edit, move, or delete bookmarks, and it does not copy bookmark contents into extension storage or send them to the developer.

### `storage`

Required to save user-selected language, theme, search engine, pinned shortcut titles, URLs, ordering, group membership and component configurations, selected bookmark folder, background preference, and expanded-folder interface state. Preferences, pinned shortcuts, shortcut groups, and component configurations use browser-managed sync storage; the last theme preference and optional rating prompt's completed or three-week snooze state are cached locally in the extension page, while interface preferences and live-data API responses use local storage. A user-selected custom background image is stored only in the extension's local IndexedDB database on the current browser profile and is not synchronized or uploaded by Nook. The developer does not operate a separate synchronization service.

### `favicon`

Required to retrieve browser-cached website icons on the New Tab page. If a cached icon is unavailable, Nook uses a locally bundled brand icon when possible, then may request conventional icon resources from the website itself. The permission is not used to inspect browsing history or page content.

### `activeTab`

Required to read the current tab's URL and title only after the user explicitly clicks the Nook toolbar icon. Nook validates that the URL uses HTTP or HTTPS, checks for an existing identical shortcut, and stores a new shortcut through browser-managed sync storage. Access is temporary and user-initiated; Nook does not continuously monitor tabs, read page contents, or collect browsing history.

## Optional host permissions

- `https://api.github.com/*`: requested only after the user enables live data on a GitHub public-repository or public-profile shortcut, to retrieve the selected public metadata and counters.
- `https://github.com/*`: requested at the same opt-in moment and used only to retrieve the corresponding public repository or profile page when GitHub's anonymous API is temporarily rate-limited or unavailable.

These permissions are optional and are not granted at installation. Nook requests only the public repository selected by the user and does not inspect unrelated tabs, private account data, browsing history, or page content.

## Permissions deliberately not requested

Nook does not request the persistent `tabs`, `history`, `downloads`, or `management` permissions. Its `activeTab` access is limited to the tab on which the user clicks the toolbar action. It requests only the optional API-host access described above after an explicit component action. Browser utility buttons navigate the current New Tab to browser-owned management URLs and do not read data from those APIs.

## Remote code

Select: **No, I am not using remote code.**

Justification if a text field is shown:

Nook is a Manifest V3 extension. All executable JavaScript and CSS, including every component implementation, are packaged with the extension. The extension does not download, evaluate, or execute remotely hosted code. GitHub returns data only. Website favicon files are images only and are never executed.

## Data usage questionnaire

Recommended response for the current build:

- Developer collection: **No user data is collected by or transmitted to the developer.**
- Analytics or telemetry: **No**
- Advertising or personalization: **No**
- Sale of user data: **No**
- Use unrelated to the extension's single purpose: **No**
- Human access to user data: **No**

Provider-specific disclosure:

- GitHub component: disclose a user-entered public repository identifier or public username if the form offers a relevant user-content or website-content category. It is transmitted directly to GitHub only to return the selected public metadata.
- The request is not received or retained by the Nook developer.

Reasoning:

Nook processes bookmarks locally for an explicitly visible feature. When the user clicks the toolbar action, the active page title and HTTP/HTTPS URL are used locally to create a pinned shortcut. Browser-managed `storage.sync` may synchronize preferences, pinned shortcuts, and component configurations under the user's browser account, but Nook does not operate or receive data from that service. Search and navigation requests go only to destinations selected by the user. Favicon fallback requests go directly to the pinned website. User-enabled GitHub repository and profile components request public information directly from GitHub. No request is sent to a developer or analytics service.

If a store form defines “collection” to include any local API access or transmission to a third-party data provider rather than transmission to the developer, disclose bookmark URLs/titles, public repository identifiers, and selected public GitHub usernames conservatively in the closest categories offered by that form. Explain which values stay local and which are sent directly to GitHub for an enabled feature. Do not select “no data” if analytics, crash reporting, a backend, or any developer-controlled network service is added later.

## Limited Use certifications

The current build can certify that:

- data is used only to provide the extension's single purpose and user-facing features;
- data is not transferred except as necessary for user-initiated functionality or browser-managed synchronization;
- data is not used for advertising, creditworthiness, lending, or unrelated profiling;
- data is not sold;
- humans do not read user data;
- the extension follows the Chrome Web Store User Data Policy, including Limited Use requirements.

## Privacy policy URL

`[PRIVACY_POLICY_URL]`

The URL must be public, use HTTPS, require no login, and show the same publisher identity used by the store account.
