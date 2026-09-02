import type { Shortcut } from './types';

export type PopularSite = Omit<Shortcut, 'id'> & {
  id: string;
  keywords: string[];
};

const DOMESTIC_SITE_IDS = new Set([
  'baidu', 'bilibili', 'zhihu', 'weibo', 'xiaohongshu', 'douban', 'taobao', 'jd',
  'douyin', 'netease-music', 'qq-mail', 'feishu', 'dingtalk', 'yuque', 'juejin',
  'csdn', 'baidu-pan', 'amap',
]);

export const POPULAR_SITES: PopularSite[] = [
  { id: 'baidu', title: '百度', url: 'https://www.baidu.com/', keywords: ['baidu', 'search', '搜索', '国内', '中国'] },
  { id: 'bilibili', title: '哔哩哔哩', url: 'https://www.bilibili.com/', keywords: ['bilibili', 'b站', 'video', '视频', '动画'] },
  { id: 'zhihu', title: '知乎', url: 'https://www.zhihu.com/', keywords: ['zhihu', '问答', '知识', '社区'] },
  { id: 'weibo', title: '微博', url: 'https://weibo.com/', keywords: ['weibo', 'social', '社交', '新闻'] },
  { id: 'xiaohongshu', title: '小红书', url: 'https://www.xiaohongshu.com/', keywords: ['xiaohongshu', 'rednote', '种草', '生活', '社区'] },
  { id: 'douban', title: '豆瓣', url: 'https://www.douban.com/', keywords: ['douban', '电影', '书籍', '音乐', '评分'] },
  { id: 'taobao', title: '淘宝', url: 'https://www.taobao.com/', keywords: ['taobao', 'shopping', '购物', '电商'] },
  { id: 'jd', title: '京东', url: 'https://www.jd.com/', keywords: ['jd', 'jingdong', 'shopping', '购物', '电商'] },
  { id: 'douyin', title: '抖音', url: 'https://www.douyin.com/', keywords: ['douyin', 'tiktok', 'video', '短视频'] },
  { id: 'netease-music', title: '网易云音乐', url: 'https://music.163.com/', keywords: ['netease', '163', 'music', '音乐'] },
  { id: 'qq-mail', title: 'QQ 邮箱', url: 'https://mail.qq.com/', keywords: ['qq', 'mail', 'email', '邮箱'] },
  { id: 'feishu', title: '飞书', url: 'https://www.feishu.cn/', keywords: ['feishu', 'lark', '办公', '协作', '团队'] },
  { id: 'dingtalk', title: '钉钉', url: 'https://www.dingtalk.com/', keywords: ['dingtalk', '办公', '协作', '团队'] },
  { id: 'yuque', title: '语雀', url: 'https://www.yuque.com/', keywords: ['yuque', '文档', '笔记', '知识库'] },
  { id: 'juejin', title: '稀土掘金', url: 'https://juejin.cn/', keywords: ['juejin', 'developer', '开发', '编程', '技术'] },
  { id: 'csdn', title: 'CSDN', url: 'https://www.csdn.net/', keywords: ['developer', '开发', '编程', '技术'] },
  { id: 'baidu-pan', title: '百度网盘', url: 'https://pan.baidu.com/', keywords: ['baidu', 'cloud', '网盘', '云盘', '文件'] },
  { id: 'amap', title: '高德地图', url: 'https://www.amap.com/', keywords: ['amap', '地图', '导航', '出行'] },
  { id: 'chatgpt', title: 'ChatGPT', url: 'https://chatgpt.com/', keywords: ['ai', 'openai', '人工智能', '生成ai', 'aiチャット'] },
  { id: 'gmail', title: 'Gmail', url: 'https://mail.google.com/', keywords: ['mail', 'email', 'google', '邮箱', 'メール'] },
  { id: 'youtube', title: 'YouTube', url: 'https://www.youtube.com/', keywords: ['video', 'google', '视频', '動画'] },
  { id: 'github', title: 'GitHub', url: 'https://github.com/', keywords: ['code', 'git', 'developer', '代码', '开发', '開発'] },
  { id: 'notion', title: 'Notion', url: 'https://www.notion.so/', keywords: ['notes', 'docs', 'workspace', '笔记', '文档', 'ノート'] },
  { id: 'google-drive', title: 'Google Drive', url: 'https://drive.google.com/', keywords: ['files', 'cloud', 'storage', '云盘', '文件', 'ドライブ'] },
  { id: 'google-calendar', title: 'Google Calendar', url: 'https://calendar.google.com/', keywords: ['date', 'schedule', '日历', '日程', 'カレンダー'] },
  { id: 'google-maps', title: 'Google Maps', url: 'https://maps.google.com/', keywords: ['map', 'navigation', '地图', '导航', 'マップ'] },
  { id: 'google-photos', title: 'Google Photos', url: 'https://photos.google.com/', keywords: ['photo', 'images', '相册', '照片', 'フォト'] },
  { id: 'outlook', title: 'Outlook', url: 'https://outlook.live.com/mail/', keywords: ['mail', 'email', 'microsoft', '邮箱', 'メール'] },
  { id: 'microsoft-365', title: 'Microsoft 365', url: 'https://www.microsoft365.com/', keywords: ['office', 'word', 'excel', 'powerpoint', '办公'] },
  { id: 'slack', title: 'Slack', url: 'https://app.slack.com/', keywords: ['chat', 'work', 'team', '团队', '沟通'] },
  { id: 'discord', title: 'Discord', url: 'https://discord.com/app', keywords: ['chat', 'community', 'gaming', '社区', '游戏'] },
  { id: 'figma', title: 'Figma', url: 'https://www.figma.com/files/', keywords: ['design', 'prototype', 'ui', '设计', 'デザイン'] },
  { id: 'canva', title: 'Canva', url: 'https://www.canva.com/', keywords: ['design', 'presentation', '设计', '演示', 'デザイン'] },
  { id: 'trello', title: 'Trello', url: 'https://trello.com/', keywords: ['tasks', 'kanban', 'project', '任务', '项目'] },
  { id: 'dropbox', title: 'Dropbox', url: 'https://www.dropbox.com/home', keywords: ['files', 'cloud', 'storage', '云盘', '文件'] },
  { id: 'reddit', title: 'Reddit', url: 'https://www.reddit.com/', keywords: ['community', 'forum', 'news', '社区', '论坛'] },
  { id: 'x', title: 'X', url: 'https://x.com/', keywords: ['twitter', 'social', 'news', '推特', '社交'] },
  { id: 'linkedin', title: 'LinkedIn', url: 'https://www.linkedin.com/', keywords: ['jobs', 'career', 'work', '职场', '求职'] },
  { id: 'wikipedia', title: 'Wikipedia', url: 'https://www.wikipedia.org/', keywords: ['knowledge', 'encyclopedia', '维基百科', '知识'] },
  { id: 'spotify', title: 'Spotify', url: 'https://open.spotify.com/', keywords: ['music', 'audio', '音乐', '音楽'] },
  { id: 'netflix', title: 'Netflix', url: 'https://www.netflix.com/', keywords: ['movies', 'tv', 'video', '电影', '影视'] },
  { id: 'amazon', title: 'Amazon', url: 'https://www.amazon.com/', keywords: ['shopping', 'store', '购物', 'ショッピング'] },
];

function comparableUrl(value: string): string {
  const url = new URL(value);
  return `${url.hostname.replace(/^www\./, '')}${url.pathname.replace(/\/$/, '')}`.toLowerCase();
}

export function availablePopularSites(
  existing: Shortcut[],
  query = '',
  domesticFirst = false,
): PopularSite[] {
  const existingUrls = new Set(existing.map((shortcut) => comparableUrl(shortcut.url)));
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);

  const matches = POPULAR_SITES.filter((site) => {
    if (existingUrls.has(comparableUrl(site.url))) return false;
    const haystack = [site.title, new URL(site.url).hostname, ...site.keywords]
      .join(' ')
      .toLocaleLowerCase();
    return terms.every((term) => haystack.includes(term));
  });

  return matches.sort((left, right) => {
    const leftDomestic = DOMESTIC_SITE_IDS.has(left.id);
    const rightDomestic = DOMESTIC_SITE_IDS.has(right.id);
    if (leftDomestic === rightDomestic) return 0;
    return leftDomestic === domesticFirst ? -1 : 1;
  });
}
