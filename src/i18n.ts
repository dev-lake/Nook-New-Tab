import type { Locale, LocalePreference } from './types';

export type Translation = {
  pageTitle: string;
  bookmarks: string;
  bookmarkCount: (count: number) => string;
  viewAll: string;
  quickLinks: string;
  emptyBookmarks: string;
  retry: string;
  searchPlaceholder: string;
  searchLabel: string;
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  browserUtilities: string;
  utilityCount: string;
  pinned: string;
  githubRepositoryWidget: string;
  githubRepositoryWidgetHelp: string;
  githubProfileWidget: string;
  githubProfileWidgetHelp: string;
  githubUsername: string;
  githubUsernameHelp: string;
  invalidGitHubUsername: string;
  widgetLoadFailed: string;
  pluginPermissionDenied: string;
  enhancementAvailable: (name: string) => string;
  enableEnhancement: string;
  enhancementUpdating: string;
  githubRepositoryUnavailable: string;
  githubRepositoryNotFound: string;
  githubProfileNotFound: string;
  stars: string;
  forks: string;
  openIssues: string;
  followers: string;
  following: string;
  publicRepositories: string;
  addShortcut: string;
  addCurrentPage: string;
  addCurrentPageHelp: string;
  confirmAdd: string;
  currentPageUnavailable: string;
  shortcutAlreadyExists: string;
  createGroup: string;
  editGroup: string;
  deleteGroup: string;
  groupName: string;
  groupShortcuts: string;
  groupHelp: string;
  groupNeedsTwo: string;
  groupItemCount: (count: number) => string;
  openGroup: (name: string, count: number) => string;
  groupSaved: string;
  groupDeleted: string;
  choosePopularSite: string;
  searchPopularSites: string;
  noPopularSites: string;
  customShortcut: string;
  customShortcutHelp: string;
  addPopularSite: (name: string) => string;
  editShortcut: string;
  shortcutTitle: string;
  shortcutUrl: string;
  save: string;
  cancel: string;
  delete: string;
  settings: string;
  appearance: string;
  language: string;
  searchEngine: string;
  bookmarkFolder: string;
  allBookmarks: string;
  background: string;
  noBackground: string;
  mistBackground: string;
  dunesBackground: string;
  midnightBackground: string;
  customBackground: string;
  uploadBackground: string;
  removeBackground: string;
  invalidBackground: string;
  importBookmarks: string;
  footerGuideTitle: string;
  footerGuideIntro: string;
  footerGuideRightClick: string;
  footerGuideCustomize: string;
  footerGuideManaged: string;
  officialChromeHelp: string;
  system: string;
  light: string;
  dark: string;
  auto: string;
  privacy: string;
  rateNook: string;
  dismissRatingPrompt: string;
  folderExpanded: (name: string) => string;
  folderCollapsed: (name: string) => string;
  expandFolder: (name: string, count: number) => string;
  collapseFolder: (name: string, count: number) => string;
  openBookmark: (name: string) => string;
  pinBookmark: (name: string) => string;
  bookmarkAlreadyPinned: (name: string) => string;
  openFailed: string;
  saveFailed: string;
  shortcutSaved: string;
  shortcutDeleted: string;
  shortcutsReordered: string;
  dragShortcut: (name: string) => string;
  invalidTitle: string;
  invalidUrl: string;
  bookmarksTitle: string;
  passwordsTitle: string;
  downloadsTitle: string;
  historyTitle: string;
  extensionsTitle: string;
  storeTitle: string;
  bookmarksHelp: string;
  passwordsHelp: string;
  downloadsHelp: string;
  historyHelp: string;
  extensionsHelp: string;
  storeHelp: string;
};

export const translations: Record<Locale, Translation> = {
  en: {
    pageTitle: 'New Tab — Nook',
    bookmarks: 'Bookmarks',
    bookmarkCount: (count) => `${count} ${count === 1 ? 'item' : 'items'}`,
    viewAll: 'View all',
    quickLinks: 'Quick links',
    emptyBookmarks: 'No web bookmarks found.',
    retry: 'Retry',
    searchPlaceholder: 'Search the web or type a URL',
    searchLabel: 'Search the web or navigate to a URL',
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    browserUtilities: 'Browser utilities',
    utilityCount: '6 tools',
    pinned: 'Pinned',
    githubRepositoryWidget: 'GitHub repository',
    githubRepositoryWidgetHelp: 'Stars, forks, and open issues for a public repository',
    githubProfileWidget: 'GitHub profile',
    githubProfileWidgetHelp: 'Followers, following, and public repositories for an account',
    githubUsername: 'GitHub username',
    githubUsernameHelp: 'Choose the public account to display; Profile URLs are filled automatically',
    invalidGitHubUsername: 'Enter a valid GitHub username.',
    widgetLoadFailed: 'Could not update live data.',
    pluginPermissionDenied: 'Allow access to this data provider to enable live shortcut data.',
    enhancementAvailable: (name) => `${name} live data is available`,
    enableEnhancement: 'Show live data on this shortcut',
    enhancementUpdating: 'Updating live data…',
    githubRepositoryUnavailable: 'That public repository could not be loaded.',
    githubRepositoryNotFound: 'Public repository not found. Check its URL and visibility.',
    githubProfileNotFound: 'GitHub account not found. Check the username.',
    stars: 'Stars',
    forks: 'Forks',
    openIssues: 'Open issues',
    followers: 'Followers',
    following: 'Following',
    publicRepositories: 'Public repositories',
    addShortcut: 'Add shortcut',
    addCurrentPage: 'Add current page',
    addCurrentPageHelp: 'Review or edit the details before adding this shortcut to Nook.',
    confirmAdd: 'Add to Pinned',
    currentPageUnavailable: 'Only HTTP and HTTPS pages can be added.',
    shortcutAlreadyExists: 'This page is already in Pinned.',
    createGroup: 'Create group',
    editGroup: 'Edit group',
    deleteGroup: 'Dissolve group',
    groupName: 'Group name',
    groupShortcuts: 'Shortcuts in this group',
    groupHelp: 'Select at least two shortcuts. Selecting an item already in another group moves it here.',
    groupNeedsTwo: 'Select at least two shortcuts.',
    groupItemCount: (count) => `${count} ${count === 1 ? 'shortcut' : 'shortcuts'}`,
    openGroup: (name, count) => `Open ${name}, ${count} shortcuts`,
    groupSaved: 'Group saved.',
    groupDeleted: 'Group dissolved.',
    choosePopularSite: 'Search common sites and add one instantly.',
    searchPopularSites: 'Search popular sites',
    noPopularSites: 'No matching sites found.',
    customShortcut: 'Add a custom website',
    customShortcutHelp: 'Enter any website name and URL',
    addPopularSite: (name) => `Add ${name}`,
    editShortcut: 'Edit shortcut',
    shortcutTitle: 'Name',
    shortcutUrl: 'URL',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    settings: 'Settings',
    appearance: 'Appearance',
    language: 'Language',
    searchEngine: 'Search engine',
    bookmarkFolder: 'Bookmark folder',
    allBookmarks: 'All bookmarks',
    background: 'Background',
    noBackground: 'None',
    mistBackground: 'Misty mountains',
    dunesBackground: 'Warm dunes',
    midnightBackground: 'Midnight flow',
    customBackground: 'Custom',
    uploadBackground: 'Choose image',
    removeBackground: 'Remove custom image',
    invalidBackground: 'Choose a JPEG, PNG, or WebP image up to 15 MB.',
    importBookmarks: 'Import bookmarks',
    footerGuideTitle: 'Hide Chrome footer',
    footerGuideIntro: 'Chrome controls the white footer, so Nook cannot hide it automatically. You can turn it off in either of these ways:',
    footerGuideRightClick: 'Right-click the footer and choose “Hide footer on New Tab page.”',
    footerGuideCustomize: 'Or select “Customize Chrome” → “Footer,” then turn off “Show footer on New Tab page.”',
    footerGuideManaged: 'If Chrome is managed by an organization, this option may be controlled by your administrator.',
    officialChromeHelp: 'Open official Chrome instructions',
    system: 'System',
    light: 'Light',
    dark: 'Dark',
    auto: 'Automatic',
    privacy: 'Bookmarks stay in this browser; enabled components connect directly to their data provider.',
    rateNook: 'Enjoying Nook? Rate it',
    dismissRatingPrompt: 'Remind me again in three weeks',
    folderExpanded: (name) => `${name} expanded`,
    folderCollapsed: (name) => `${name} collapsed`,
    expandFolder: (name, count) => `Expand ${name}, ${count} bookmarks`,
    collapseFolder: (name, count) => `Collapse ${name}, ${count} bookmarks`,
    openBookmark: (name) => `Open ${name}`,
    pinBookmark: (name) => `Pin ${name}`,
    bookmarkAlreadyPinned: (name) => `${name} is already pinned`,
    openFailed: 'Could not open that page.',
    saveFailed: 'Could not sync your changes. The previous settings were restored.',
    shortcutSaved: 'Shortcut saved.',
    shortcutDeleted: 'Shortcut deleted.',
    shortcutsReordered: 'Pinned shortcuts reordered.',
    dragShortcut: (name) => `Drag to reorder ${name}`,
    invalidTitle: 'Enter a name of 1–40 characters.',
    invalidUrl: 'Enter a safe HTTP or HTTPS URL without a username or password.',
    bookmarksTitle: 'Bookmarks',
    passwordsTitle: 'Passwords',
    downloadsTitle: 'Downloads',
    historyTitle: 'History',
    extensionsTitle: 'Manage Extensions',
    storeTitle: 'Extension Store',
    bookmarksHelp: 'Open your saved pages',
    passwordsHelp: 'Find saved sign-ins',
    downloadsHelp: 'View recent files',
    historyHelp: 'Return to a visited page',
    extensionsHelp: 'Review browser add-ons',
    storeHelp: 'Discover useful add-ons',
  },
  'zh-CN': {
    pageTitle: '新标签 — Nook',
    bookmarks: '书签',
    bookmarkCount: (count) => `${count} 项`,
    viewAll: '查看全部',
    quickLinks: '快捷链接',
    emptyBookmarks: '没有找到网页书签。',
    retry: '重试',
    searchPlaceholder: '搜索网页或输入网址',
    searchLabel: '搜索网页或打开网址',
    goodMorning: '早上好',
    goodAfternoon: '下午好',
    goodEvening: '晚上好',
    browserUtilities: '浏览器工具',
    utilityCount: '6 项工具',
    pinned: '已固定',
    githubRepositoryWidget: 'GitHub 仓库',
    githubRepositoryWidgetHelp: '显示公开仓库的 Stars、Forks 和待处理问题',
    githubProfileWidget: 'GitHub 账号',
    githubProfileWidgetHelp: '显示账号的关注者、正在关注和公开仓库数量',
    githubUsername: 'GitHub 用户名',
    githubUsernameHelp: '选择要显示的公开账号；Profile 网址会自动填写',
    invalidGitHubUsername: '请输入有效的 GitHub 用户名。',
    widgetLoadFailed: '无法更新实时数据。',
    pluginPermissionDenied: '需要允许访问对应的数据服务，才能显示快捷项实时数据。',
    enhancementAvailable: (name) => `可开启${name}实时数据`,
    enableEnhancement: '在此快捷项中显示实时数据',
    enhancementUpdating: '正在更新实时数据…',
    githubRepositoryUnavailable: '无法读取该公开仓库。',
    githubRepositoryNotFound: '未找到公开仓库，请检查网址及仓库可见性。',
    githubProfileNotFound: '未找到 GitHub 账号，请检查用户名。',
    stars: 'Stars',
    forks: 'Forks',
    openIssues: '待处理问题',
    followers: '关注者',
    following: '正在关注',
    publicRepositories: '公开仓库',
    addShortcut: '添加快捷项',
    addCurrentPage: '添加当前页面',
    addCurrentPageHelp: '添加到 Nook 前，可以确认或修改以下信息。',
    confirmAdd: '添加到已固定',
    currentPageUnavailable: '只能添加 HTTP 或 HTTPS 页面。',
    shortcutAlreadyExists: '此页面已存在于已固定快捷项中。',
    createGroup: '新建分组',
    editGroup: '编辑分组',
    deleteGroup: '解散分组',
    groupName: '分组名称',
    groupShortcuts: '分组内的快捷项',
    groupHelp: '至少选择两个快捷项；选择已在其他分组中的项目会将其移到这里。',
    groupNeedsTwo: '请至少选择两个快捷项。',
    groupItemCount: (count) => `${count} 个快捷项`,
    openGroup: (name, count) => `打开分组${name}，${count} 个快捷项`,
    groupSaved: '分组已保存。',
    groupDeleted: '分组已解散。',
    choosePopularSite: '搜索常用网站，点击即可添加。',
    searchPopularSites: '搜索常用网站',
    noPopularSites: '没有找到匹配的网站。',
    customShortcut: '添加自定义网站',
    customShortcutHelp: '输入任意网站名称和网址',
    addPopularSite: (name) => `添加 ${name}`,
    editShortcut: '编辑快捷项',
    shortcutTitle: '名称',
    shortcutUrl: '网址',
    save: '保存',
    cancel: '取消',
    delete: '删除',
    settings: '设置',
    appearance: '外观',
    language: '语言',
    searchEngine: '搜索引擎',
    bookmarkFolder: '书签文件夹',
    allBookmarks: '全部书签',
    background: '背景图片',
    noBackground: '无背景',
    mistBackground: '雾蓝山景',
    dunesBackground: '暖色沙丘',
    midnightBackground: '午夜流光',
    customBackground: '自定义',
    uploadBackground: '选择图片',
    removeBackground: '移除自定义图片',
    invalidBackground: '请选择不超过 15 MB 的 JPEG、PNG 或 WebP 图片。',
    importBookmarks: '导入书签',
    footerGuideTitle: '隐藏 Chrome 底部页脚',
    footerGuideIntro: '白色页脚由 Chrome 浏览器控制，Nook 无法直接关闭。可以通过以下任一方式隐藏：',
    footerGuideRightClick: '右键点击底部页脚，选择“隐藏新标签页上的页脚”。',
    footerGuideCustomize: '或点击“自定义 Chrome” → “页脚”，关闭“在新标签页上显示页脚”。',
    footerGuideManaged: '如果 Chrome 由组织管理，该选项可能由管理员控制。',
    officialChromeHelp: '查看 Chrome 官方说明',
    system: '跟随系统',
    light: '浅色',
    dark: '深色',
    auto: '自动',
    privacy: '书签保留在本浏览器；启用的组件会直接连接对应的数据服务。',
    rateNook: '喜欢 Nook？给个好评',
    dismissRatingPrompt: '关闭并在三周后提醒',
    folderExpanded: (name) => `已展开${name}`,
    folderCollapsed: (name) => `已折叠${name}`,
    expandFolder: (name, count) => `展开${name}，${count} 个书签`,
    collapseFolder: (name, count) => `折叠${name}，${count} 个书签`,
    openBookmark: (name) => `打开${name}`,
    pinBookmark: (name) => `将${name}固定到 PINNED`,
    bookmarkAlreadyPinned: (name) => `${name}已固定`,
    openFailed: '无法打开该页面。',
    saveFailed: '无法同步更改，已恢复之前的设置。',
    shortcutSaved: '快捷项已保存。',
    shortcutDeleted: '快捷项已删除。',
    shortcutsReordered: '已更新快捷项顺序。',
    dragShortcut: (name) => `拖动以调整${name}的顺序`,
    invalidTitle: '请输入 1–40 个字符的名称。',
    invalidUrl: '请输入不含用户名或密码的安全 HTTP/HTTPS 网址。',
    bookmarksTitle: '书签',
    passwordsTitle: '密码',
    downloadsTitle: '下载内容',
    historyTitle: '历史记录',
    extensionsTitle: '管理扩展程序',
    storeTitle: '扩展程序商店',
    bookmarksHelp: '打开保存的网页',
    passwordsHelp: '查找保存的登录信息',
    downloadsHelp: '查看最近下载的文件',
    historyHelp: '返回访问过的网页',
    extensionsHelp: '查看浏览器扩展',
    storeHelp: '发现实用的浏览器扩展',
  },
  ja: {
    pageTitle: '新しいタブ — Nook',
    bookmarks: 'ブックマーク',
    bookmarkCount: (count) => `${count} 件`,
    viewAll: 'すべて表示',
    quickLinks: 'クイックリンク',
    emptyBookmarks: 'ウェブブックマークがありません。',
    retry: '再試行',
    searchPlaceholder: 'ウェブを検索するか URL を入力',
    searchLabel: 'ウェブ検索または URL を開く',
    goodMorning: 'おはようございます',
    goodAfternoon: 'こんにちは',
    goodEvening: 'こんばんは',
    browserUtilities: 'ブラウザツール',
    utilityCount: '6 ツール',
    pinned: 'ピン留め',
    githubRepositoryWidget: 'GitHub リポジトリ',
    githubRepositoryWidgetHelp: '公開リポジトリの Stars、Forks、未解決 Issue を表示',
    githubProfileWidget: 'GitHub アカウント',
    githubProfileWidgetHelp: 'フォロワー、フォロー中、公開リポジトリ数を表示',
    githubUsername: 'GitHub ユーザー名',
    githubUsernameHelp: '表示する公開アカウントを指定します。Profile URL は自動入力されます',
    invalidGitHubUsername: '有効な GitHub ユーザー名を入力してください。',
    widgetLoadFailed: 'ライブデータを更新できませんでした。',
    pluginPermissionDenied: 'ショートカットにライブデータを表示するには、データ提供元へのアクセスを許可してください。',
    enhancementAvailable: (name) => `${name}のライブデータを利用できます`,
    enableEnhancement: 'このショートカットにライブデータを表示',
    enhancementUpdating: 'ライブデータを更新中…',
    githubRepositoryUnavailable: 'その公開リポジトリを読み込めませんでした。',
    githubRepositoryNotFound: '公開リポジトリが見つかりません。URL と公開設定を確認してください。',
    githubProfileNotFound: 'GitHub アカウントが見つかりません。ユーザー名を確認してください。',
    stars: 'Stars',
    forks: 'Forks',
    openIssues: '未解決 Issue',
    followers: 'フォロワー',
    following: 'フォロー中',
    publicRepositories: '公開リポジトリ',
    addShortcut: 'ショートカットを追加',
    addCurrentPage: '現在のページを追加',
    addCurrentPageHelp: 'Nook に追加する前に内容を確認または編集できます。',
    confirmAdd: 'ピン留めに追加',
    currentPageUnavailable: 'HTTP または HTTPS ページのみ追加できます。',
    shortcutAlreadyExists: 'このページはすでにピン留めされています。',
    createGroup: 'グループを作成',
    editGroup: 'グループを編集',
    deleteGroup: 'グループを解除',
    groupName: 'グループ名',
    groupShortcuts: 'グループ内のショートカット',
    groupHelp: '2 件以上選択してください。他のグループにある項目を選ぶとここに移動します。',
    groupNeedsTwo: 'ショートカットを 2 件以上選択してください。',
    groupItemCount: (count) => `${count} 件のショートカット`,
    openGroup: (name, count) => `${name} を開く、${count} 件のショートカット`,
    groupSaved: 'グループを保存しました。',
    groupDeleted: 'グループを解除しました。',
    choosePopularSite: 'よく使うサイトを検索し、クリックで追加できます。',
    searchPopularSites: '人気のサイトを検索',
    noPopularSites: '一致するサイトがありません。',
    customShortcut: 'カスタムサイトを追加',
    customShortcutHelp: 'サイト名と URL を入力',
    addPopularSite: (name) => `${name}を追加`,
    editShortcut: 'ショートカットを編集',
    shortcutTitle: '名前',
    shortcutUrl: 'URL',
    save: '保存',
    cancel: 'キャンセル',
    delete: '削除',
    settings: '設定',
    appearance: '外観',
    language: '言語',
    searchEngine: '検索エンジン',
    bookmarkFolder: 'ブックマークフォルダー',
    allBookmarks: 'すべてのブックマーク',
    background: '背景画像',
    noBackground: '背景なし',
    mistBackground: '霧の山々',
    dunesBackground: '暖かな砂丘',
    midnightBackground: 'ミッドナイトフロー',
    customBackground: 'カスタム',
    uploadBackground: '画像を選択',
    removeBackground: 'カスタム画像を削除',
    invalidBackground: '15 MB 以下の JPEG、PNG、WebP 画像を選択してください。',
    importBookmarks: 'ブックマークをインポート',
    footerGuideTitle: 'Chrome のフッターを非表示',
    footerGuideIntro: '白いフッターは Chrome が管理しているため、Nook から直接非表示にはできません。次のどちらかの方法でオフにできます。',
    footerGuideRightClick: 'フッターを右クリックし、「新しいタブページのフッターを非表示」を選択します。',
    footerGuideCustomize: 'または「Chrome をカスタマイズ」→「フッター」で「新しいタブページにフッターを表示」をオフにします。',
    footerGuideManaged: 'Chrome が組織によって管理されている場合、この設定は管理者によって制御されることがあります。',
    officialChromeHelp: 'Chrome 公式ヘルプを開く',
    system: 'システム',
    light: 'ライト',
    dark: 'ダーク',
    auto: '自動',
    privacy: 'ブックマークはブラウザ内に留まり、有効なコンポーネントはデータ提供元へ直接接続します。',
    rateNook: 'Nook を気に入ったら評価',
    dismissRatingPrompt: '閉じて3週間後に再通知',
    folderExpanded: (name) => `${name}を展開しました`,
    folderCollapsed: (name) => `${name}を折りたたみました`,
    expandFolder: (name, count) => `${name}を展開、${count}件のブックマーク`,
    collapseFolder: (name, count) => `${name}を折りたたむ、${count}件のブックマーク`,
    openBookmark: (name) => `${name}を開く`,
    pinBookmark: (name) => `${name}をピン留め`,
    bookmarkAlreadyPinned: (name) => `${name}はピン留め済みです`,
    openFailed: 'ページを開けませんでした。',
    saveFailed: '変更を同期できなかったため、以前の設定に戻しました。',
    shortcutSaved: 'ショートカットを保存しました。',
    shortcutDeleted: 'ショートカットを削除しました。',
    shortcutsReordered: 'ピン留めの順序を変更しました。',
    dragShortcut: (name) => `${name}をドラッグして並べ替え`,
    invalidTitle: '1〜40文字の名前を入力してください。',
    invalidUrl: 'ユーザー名やパスワードを含まない HTTP/HTTPS URL を入力してください。',
    bookmarksTitle: 'ブックマーク',
    passwordsTitle: 'パスワード',
    downloadsTitle: 'ダウンロード',
    historyTitle: '履歴',
    extensionsTitle: '拡張機能を管理',
    storeTitle: '拡張機能ストア',
    bookmarksHelp: '保存したページを開く',
    passwordsHelp: '保存したログイン情報を確認',
    downloadsHelp: '最近のファイルを表示',
    historyHelp: '以前のページに戻る',
    extensionsHelp: 'ブラウザの拡張機能を確認',
    storeHelp: '便利な拡張機能を探す',
  },
};

export function resolveLocale(preference: LocalePreference, browserLanguage = navigator.language): Locale {
  if (preference !== 'auto') return preference;
  const normalized = browserLanguage.toLowerCase();
  if (normalized.startsWith('zh')) return 'zh-CN';
  if (normalized.startsWith('ja')) return 'ja';
  return 'en';
}

export function greetingForHour(t: Translation, hour: number): string {
  if (hour < 12) return t.goodMorning;
  if (hour < 18) return t.goodAfternoon;
  return t.goodEvening;
}

export function localeForIntl(locale: Locale): string {
  return locale;
}
