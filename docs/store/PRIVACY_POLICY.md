# Nook Privacy Policy / Nook 隐私政策

Effective date / 生效日期：2026-08-11

Publisher / 发布者：`[PUBLISHER_NAME]`

Contact / 联系方式：`[SUPPORT_EMAIL]`

## English

### 1. Scope

This Privacy Policy explains how the Nook browser extension handles information when it replaces the browser's New Tab page. Nook does not provide a developer-operated account, analytics service, advertising system, or cloud backend.

### 2. Information Nook accesses

Nook accesses the following information only to provide visible extension features:

- Browser bookmarks: bookmark titles, URLs, folder structure, and bookmark change events are read to display the bookmark tree. Bookmark contents are not copied into extension storage.
- User-created shortcuts and preferences: shortcut titles and URLs, shortcut order, group names and membership, language, theme, and selected search engine are stored through the browser's extension storage APIs.
- Local interface state: expanded bookmark folder identifiers, the selected bookmark folder, and the selected background are stored on the current device.
- Custom background image: if the user chooses an image, its file contents are stored in the extension's local IndexedDB database on the current browser profile. Nook does not synchronize or upload this image.
- Website icons: Nook first asks the browser for a cached favicon, then uses a locally bundled brand icon when available. If neither is available, the extension may request conventional icon files directly from the corresponding website with the referrer omitted.

### 3. How information is used

The information above is used only to display bookmarks, remember interface choices, provide pinned shortcuts, and show website icons on the New Tab page. It is not used for advertising, profiling, credit decisions, or unrelated purposes.

### 4. Storage and synchronization

Preferences and pinned shortcuts are stored using `storage.sync`, which means the browser provider may synchronize them through the user's signed-in browser account according to that provider's terms and privacy policy. The last theme preference is also cached locally in the extension page so the correct appearance can be applied before the New Tab page's first paint. Expanded bookmark folder state, selected bookmark folder, and background preference are stored using `storage.local` on the current browser profile. A custom background image is stored separately in the extension's local IndexedDB database and is not synchronized by Nook.

Nook does not operate or receive data from the browser synchronization service.

### 5. Network requests and third parties

Nook has no developer-controlled server and does not send bookmarks, settings, shortcuts, search queries, or usage analytics to the developer.

Network requests can occur when a user:

- submits a search, in which case the browser navigates to the selected search provider;
- opens a bookmark, shortcut, or store link, in which case the browser navigates to that destination; or
- displays a website icon and neither a cached nor bundled icon is available, in which case Nook may request that website's own conventional icon resources without a referrer.

Those destinations process requests under their own privacy policies. Nook does not add tracking parameters to these requests.

### 6. Sharing and sale

Nook does not sell, rent, or share user information with advertisers, data brokers, or other third parties. Nook does not use user information for personalized advertising and does not permit human review of user data.

### 7. Retention and deletion

Data remains in browser-managed storage until the user changes or deletes it, resets browser extension data, disables browser synchronization, or uninstalls the extension. A custom background can also be removed directly from Nook's settings. The browser provider may retain synchronized copies according to the user's browser account settings and the provider's policies.

### 8. Security

Nook uses browser extension APIs and does not execute remotely hosted code. The extension requests only the permissions required for its user-facing features.

### 9. Limited Use

Nook's use of information received from browser APIs complies with the Chrome Web Store User Data Policy, including the Limited Use requirements. Information is used only to provide or improve the extension's single, user-facing purpose.

### 10. Children's privacy

Nook is a general-purpose browser productivity extension and is not directed to children. The developer does not knowingly collect personal information from children.

### 11. Changes

If Nook's information practices change, this policy will be updated before or together with the relevant extension release. Material changes will be disclosed as required by applicable store policies and law.

### 12. Contact

Questions about this policy can be sent to `[SUPPORT_EMAIL]`.

## 简体中文

### 1. 适用范围

本隐私政策说明 Nook 浏览器扩展在替换浏览器新标签页时如何处理信息。Nook 不提供开发者运营的账号、分析服务、广告系统或云端后端。

### 2. Nook 访问的信息

Nook 仅为提供用户可见功能而访问以下信息：

- 浏览器书签：读取书签标题、网址、文件夹结构和书签变更事件，用于显示书签树；书签内容不会复制到扩展存储。
- 用户创建的快捷项与偏好设置：快捷项名称、网址和顺序、分组名称与成员关系，以及语言、主题、搜索引擎设置，通过浏览器扩展存储 API 保存。
- 本地界面状态：已展开书签文件夹的标识符、选中的书签文件夹和背景选择保存在当前设备。
- 自定义背景图片：如果用户选择图片，图片文件会保存在当前浏览器配置中的扩展本地 IndexedDB 数据库。Nook 不会同步或上传该图片。
- 网站图标：Nook 首先读取浏览器缓存的 favicon，并在可用时使用随扩展本地打包的品牌图标。如果两者都不可用，扩展可能在不发送来源页信息的情况下，直接请求相应网站自身的常规图标文件。

### 3. 信息用途

上述信息仅用于显示书签、记住界面选择、提供固定快捷项和显示网站图标，不用于广告、画像、信用决策或任何无关目的。

### 4. 存储与同步

偏好设置和固定快捷项使用 `storage.sync` 保存，因此浏览器提供商可能根据其服务条款和隐私政策，通过用户登录的浏览器账号同步这些数据。最近一次主题偏好也会缓存在扩展页面本地，仅用于在新标签页首次绘制前应用正确外观。书签文件夹展开状态、选中的书签文件夹和背景偏好使用 `storage.local` 保存在当前浏览器配置中。自定义背景图片单独保存在扩展的本地 IndexedDB 数据库中，Nook 不会同步该图片。

Nook 不运营浏览器同步服务，也不会从该服务接收数据。

### 5. 网络请求与第三方

Nook 没有开发者控制的服务器，不会把书签、设置、快捷项、搜索内容或使用分析发送给开发者。

以下操作会产生网络请求：提交搜索、打开书签或快捷项、访问扩展商店，以及在浏览器缓存和本地打包图标都不可用时请求该网站自身的常规图标文件。目标网站或搜索服务会根据其自身隐私政策处理请求。Nook 不添加跟踪参数。

### 6. 分享与出售

Nook 不会向广告商、数据经纪商或其他第三方出售、出租或分享用户信息，不使用用户信息进行个性化广告，也不允许人工查看用户数据。

### 7. 保留与删除

数据会保留在浏览器管理的存储中，直至用户修改或删除、清除扩展数据、关闭浏览器同步或卸载扩展。自定义背景也可以直接在 Nook 设置中移除。浏览器提供商可能根据浏览器账号设置和其自身政策保留同步副本。

### 8. 安全

Nook 使用浏览器扩展 API，不执行远程托管代码，并仅申请用户可见功能所必需的权限。

### 9. 有限使用

Nook 对浏览器 API 信息的使用遵守 Chrome Web Store 用户数据政策及其有限使用要求，所有信息仅用于提供或改进扩展唯一且面向用户的功能。

### 10. 儿童隐私

Nook 是通用浏览器效率工具，不以儿童为目标用户。开发者不会有意收集儿童个人信息。

### 11. 政策变更

如果 Nook 的信息处理方式发生变化，本政策会在相关版本发布之前或同时更新。重大变化将按应用商店政策和适用法律进行披露。

### 12. 联系方式

隐私问题请发送至 `[SUPPORT_EMAIL]`。
