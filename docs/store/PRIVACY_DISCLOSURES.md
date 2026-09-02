# 商店隐私披露与权限说明

以下英文内容可直接粘贴到 Chrome Web Store Developer Dashboard 和 Microsoft Partner Center。提交前应再次对照当前 Manifest 和隐私政策。

## Single purpose

Nook replaces the browser's New Tab page with a focused workspace that displays the user's existing bookmark tree, editable pinned shortcuts, search, and compact links to browser management pages. All features support this single purpose of making bookmarks and routine browser navigation accessible from the New Tab page.

## Permission justifications

### `bookmarks`

Required to read the user's existing bookmark tree and listen for bookmark changes so the New Tab page can display current bookmark folders and links. Nook provides read-only bookmark access: it does not create, edit, move, or delete bookmarks, and it does not copy bookmark contents into extension storage or send them to the developer.

### `storage`

Required to save user-selected language, theme, search engine, pinned shortcut titles, URLs, ordering and group membership, selected bookmark folder, background preference, and expanded-folder interface state. Preferences, pinned shortcuts, and shortcut groups use browser-managed sync storage; the last theme preference is additionally cached in the extension page solely to prevent an incorrect first-paint color, while interface and background preferences use local storage. A user-selected custom background image is stored only in the extension's local IndexedDB database on the current browser profile and is not synchronized or uploaded by Nook. The developer does not operate a separate synchronization service.

### `favicon`

Required to retrieve browser-cached website icons on the New Tab page. If a cached icon is unavailable, Nook uses a locally bundled brand icon when possible, then may request conventional icon resources from the website itself. The permission is not used to inspect browsing history or page content.

## Host permissions

None requested.

## Permissions deliberately not requested

Nook does not request `tabs`, `history`, `downloads`, `management`, or host permissions. Browser utility buttons navigate the current New Tab to browser-owned management URLs and do not read data from those APIs.

## Remote code

Select: **No, I am not using remote code.**

Justification if a text field is shown:

Nook is a Manifest V3 extension. All executable JavaScript and CSS are packaged with the extension. The extension does not download, evaluate, or execute remotely hosted code. Website favicon files are images only and are never executed.

## Data usage questionnaire

Recommended response for the current build:

- Developer collection: **No user data is collected by or transmitted to the developer.**
- Analytics or telemetry: **No**
- Advertising or personalization: **No**
- Sale of user data: **No**
- Use unrelated to the extension's single purpose: **No**
- Human access to user data: **No**

Reasoning:

Nook processes bookmarks locally for an explicitly visible feature. Browser-managed `storage.sync` may synchronize preferences and pinned shortcuts under the user's browser account, but Nook does not operate or receive data from that service. Search and navigation requests go only to destinations selected by the user. Favicon fallback requests go directly to the pinned website, not to a developer or analytics service.

If a store form defines “collection” to include any local API access rather than transmission to the developer, disclose bookmark URLs/titles conservatively in the closest category offered by that form and explain that processing is local-only. Do not select “no data” if analytics, crash reporting, a backend, or any developer-controlled network service is added later.

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
