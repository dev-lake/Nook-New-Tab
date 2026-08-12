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
  addShortcut: string;
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
  importBookmarks: string;
  system: string;
  light: string;
  dark: string;
  auto: string;
  privacy: string;
  folderExpanded: (name: string) => string;
  folderCollapsed: (name: string) => string;
  expandFolder: (name: string, count: number) => string;
  collapseFolder: (name: string, count: number) => string;
  openBookmark: (name: string) => string;
  openFailed: string;
  saveFailed: string;
  shortcutSaved: string;
  shortcutDeleted: string;
  shortcutsReordered: string;
  dragShortcut: (name: string) => string;
  invalidTitle: string;
  invalidUrl: string;
  shortcutLimit: string;
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
    addShortcut: 'Add shortcut',
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
    importBookmarks: 'Import bookmarks',
    system: 'System',
    light: 'Light',
    dark: 'Dark',
    auto: 'Automatic',
    privacy: 'Bookmarks come from this browser; preferences sync with your browser account.',
    folderExpanded: (name) => `${name} expanded`,
    folderCollapsed: (name) => `${name} collapsed`,
    expandFolder: (name, count) => `Expand ${name}, ${count} bookmarks`,
    collapseFolder: (name, count) => `Collapse ${name}, ${count} bookmarks`,
    openBookmark: (name) => `Open ${name}`,
    openFailed: 'Could not open that page.',
    saveFailed: 'Could not sync your changes. The previous settings were restored.',
    shortcutSaved: 'Shortcut saved.',
    shortcutDeleted: 'Shortcut deleted.',
    shortcutsReordered: 'Pinned shortcuts reordered.',
    dragShortcut: (name) => `Drag to reorder ${name}`,
    invalidTitle: 'Enter a name of 1–40 characters.',
    invalidUrl: 'Enter a safe HTTP or HTTPS URL without a username or password.',
    shortcutLimit: 'You can pin up to 8 shortcuts.',
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
    addShortcut: '添加快捷项',
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
    importBookmarks: '导入书签',
    system: '跟随系统',
    light: '浅色',
    dark: '深色',
    auto: '自动',
    privacy: '书签来自本浏览器；偏好设置通过浏览器账号同步。',
    folderExpanded: (name) => `已展开${name}`,
    folderCollapsed: (name) => `已折叠${name}`,
    expandFolder: (name, count) => `展开${name}，${count} 个书签`,
    collapseFolder: (name, count) => `折叠${name}，${count} 个书签`,
    openBookmark: (name) => `打开${name}`,
    openFailed: '无法打开该页面。',
    saveFailed: '无法同步更改，已恢复之前的设置。',
    shortcutSaved: '快捷项已保存。',
    shortcutDeleted: '快捷项已删除。',
    shortcutsReordered: '已更新快捷项顺序。',
    dragShortcut: (name) => `拖动以调整${name}的顺序`,
    invalidTitle: '请输入 1–40 个字符的名称。',
    invalidUrl: '请输入不含用户名或密码的安全 HTTP/HTTPS 网址。',
    shortcutLimit: '最多可固定 8 个快捷项。',
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
    addShortcut: 'ショートカットを追加',
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
    importBookmarks: 'ブックマークをインポート',
    system: 'システム',
    light: 'ライト',
    dark: 'ダーク',
    auto: '自動',
    privacy: 'ブックマークはこのブラウザから取得し、設定はブラウザアカウントで同期されます。',
    folderExpanded: (name) => `${name}を展開しました`,
    folderCollapsed: (name) => `${name}を折りたたみました`,
    expandFolder: (name, count) => `${name}を展開、${count}件のブックマーク`,
    collapseFolder: (name, count) => `${name}を折りたたむ、${count}件のブックマーク`,
    openBookmark: (name) => `${name}を開く`,
    openFailed: 'ページを開けませんでした。',
    saveFailed: '変更を同期できなかったため、以前の設定に戻しました。',
    shortcutSaved: 'ショートカットを保存しました。',
    shortcutDeleted: 'ショートカットを削除しました。',
    shortcutsReordered: 'ピン留めの順序を変更しました。',
    dragShortcut: (name) => `${name}をドラッグして並べ替え`,
    invalidTitle: '1〜40文字の名前を入力してください。',
    invalidUrl: 'ユーザー名やパスワードを含まない HTTP/HTTPS URL を入力してください。',
    shortcutLimit: '最大8件までピン留めできます。',
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
