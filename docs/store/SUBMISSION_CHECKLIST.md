# 上架提交检查清单

## 1. 当前必须处理的事项

- [ ] 替换所有 `[PUBLISHER_NAME]`、`[SUPPORT_EMAIL]`、`[PRIVACY_POLICY_URL]`、`[SUPPORT_URL]`、`[PRODUCT_URL]` 占位符。
- [ ] 将 `PRIVACY_POLICY.md` 和 `SUPPORT.md` 发布到无需登录即可访问的 HTTPS 页面。
- [ ] 确认隐私政策上的发布者名称与 Chrome/Edge 开发者账号一致。
- [ ] 使用专门的演示书签数据制作商店截图，清除私人信息。
- [ ] 确认当前提交版本为 `0.4.0`，并在每次重新上传时递增。

## 2. Chrome 搜索政策风险

当前 Nook 搜索框允许用户选择 Google、Bing 或 DuckDuckGo，并默认使用 Google。Chrome 的扩展质量指南要求 New Tab 扩展尊重用户已有的搜索选择；不符合要求的通用搜索体验可能被拒绝。

提交 Chrome Web Store 前建议：

- [ ] 将 Chrome 构建改为使用浏览器当前默认搜索提供商，例如使用官方 `chrome.search` API；或者
- [ ] 获得明确的政策确认后再保留自选搜索引擎设计。

在代码未调整前，商店文案必须如实写明当前可选搜索引擎，不能宣称“自动使用浏览器默认搜索”。

参考：[Chrome Extensions Quality Guidelines](https://developer.chrome.com/docs/webstore/program-policies/quality-guidelines/)

## 3. 功能与隐私核对

- [ ] Manifest V3。
- [ ] 常规权限仅为 `bookmarks`、`storage`、`favicon`、`activeTab`；确认 `activeTab` 只在用户点击工具栏图标时读取当前页面标题和网址。
- [ ] GitHub API 和 GitHub 公共页面仅在用户为匹配仓库或账号快捷项启用实时数据时申请，且属于 optional host permissions。
- [ ] 无远程执行代码、`eval` 或动态下载脚本。
- [ ] 无分析、广告、追踪、账号或开发者后端。
- [ ] 书签只读，不复制到扩展存储。
- [ ] favicon 网站回退请求不携带 Referrer。
- [ ] 快捷项 URL 仅允许 HTTP/HTTPS 且禁止账号密码。
- [ ] Chrome 和 Edge 内部页面地址分别验证。
- [ ] 隐私问卷、商店描述和隐私政策互相一致。

## 4. 质量验证

- [ ] `pnpm test`
- [ ] `pnpm typecheck`
- [ ] `pnpm build`
- [ ] `pnpm build:edge`
- [ ] 在干净 Chrome 配置中加载 `.output/chrome-mv3`。
- [ ] 在干净 Edge 配置中加载 `.output/edge-mv3`。
- [ ] 验证无书签、单层书签、多层文件夹三种情况。
- [ ] 验证 favicon 成功、网站回退、文字回退。
- [ ] 验证快捷项新增、编辑、删除、拖放和同步失败回滚。
- [ ] 验证右下角好评入口使用正确商店 ID、关闭后记录 21 天冷却，并在点击评价入口后不再显示。
- [ ] 在 HTTP/HTTPS 页面点击工具栏 Nook 图标，验证弹窗预填、名称与网址修改、确认新增、重复检测、无效页面提示和同步失败提示；使用 GitHub 仓库、主页及 Profile URL 验证增强选项和账号配置。
- [ ] 验证英文、简体中文、日文及浅色、深色、系统主题。
- [ ] 验证 GitHub 公开仓库添加、计数显示、匿名 API 限流后的公共页面回退、明确的 404 提示、临时失败仍可保存和缓存。
- [ ] 验证 GitHub 主页手动填写用户名、Profile URL 自动识别、账号计数显示、无效用户名与账号 404 提示。
- [ ] 验证支持的 URL 会出现增强提示，未启用时仍保存为普通快捷项。
- [ ] 验证 GitHub 增强快捷项可编辑、删除、分组及与普通快捷项混排拖动。
- [ ] 验证设置菜单不显示独立的组件编辑按钮，GitHub 组件通过普通快捷项编辑窗口配置。
- [ ] 验证主页面底部和侧边栏底部均不显示组件或添加入口。
- [ ] 验证 1440×960、1024×768 和窄屏布局。
- [ ] 检查控制台无错误，所有按钮可通过键盘操作。

## 5. Chrome Web Store

- [ ] 注册并验证开发者账号与联系邮箱。
- [ ] 上传 `.output/nook-new-tab-0.4.0-chrome.zip`。
- [ ] 分类选择 Productivity。
- [ ] 填写三种语言的详细描述。
- [ ] 上传 128×128 图标、至少一张 1280×800 截图和宣传素材。
- [ ] 填写 Single purpose、四个权限理由、Remote code = No。
- [ ] 完成数据使用与 Limited Use 认证。
- [ ] 填写公开隐私政策 URL 和支持 URL。
- [ ] 填写测试说明。
- [ ] 选择发布范围和发布时机。

## 6. Microsoft Edge Add-ons

- [ ] 注册 Microsoft Partner Center Edge 开发者账号。
- [ ] 上传 `.output/nook-new-tab-0.4.0-edge.zip`。
- [ ] Visibility 选择 Public 或按发布计划选择 Hidden。
- [ ] Markets 确认目标市场。
- [ ] 分类选择 Productivity，填写支持联系方式。
- [ ] 在 Privacy 页面填写 Single Purpose、权限理由、Remote code = No、数据使用和隐私政策 URL。
- [ ] 每种包内语言均提供详细描述和 Logo。
- [ ] 详细描述长度保持在 Edge 要求的 250–10,000 字符范围。
- [ ] 搜索词不超过 7 项、合计不超过 21 个单词或词组，每项不超过 30 字符。
- [ ] 填写 Notes for certification 后提交。

## 7. 提交后

- [ ] 保存每次提交的 ZIP、版本号、商店文案和截图副本。
- [ ] 监控开发者联系邮箱并及时回复审核问题。
- [ ] 审核通过后检查公开商店页面的名称、描述、权限和隐私链接。
- [ ] 后续版本新增权限或数据处理前先更新隐私政策和商店披露。
