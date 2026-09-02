# Nook New Tab

一个使用 React、TypeScript 和 WXT 构建的极简 Chromium New Tab 扩展。Nook 在左侧直接展示浏览器书签树，在右侧提供搜索、浏览器工具入口、快捷项与外观设置。

## 功能

- 读取真实书签，并在页面内递归展开任意层级的文件夹
- 可选择左侧只显示某个书签文件夹，并直接将书签固定到快捷项
- 窄窗口中书签栏保持在左侧并折叠为图标栏，需要时可展开为浮层
- 搜索或直接打开网址，支持 Google、Bing、DuckDuckGo
- 快速进入书签、密码、下载、历史、扩展管理和扩展商店
- 通过常用网站搜索或自定义网址新增快捷项，支持编辑、删除、拖动排序，也可将多个快捷项收纳进一个类似文件夹、可独立拖动排序的分组卡片；内容较多时 Pinned 区域独立滚动
- 使用浏览器缓存、本地内置品牌图标及网站自身 favicon 显示网站图标
- 内置多款背景图，也可上传保存在当前设备的自定义背景
- 系统、浅色、深色三种主题模式
- 英文、简体中文和日文界面
- 启动时先完成本地设置初始化，再一次性显示真实内容，避免默认快捷项和主题闪烁
- Chrome 与 Edge 地址适配

扩展申请 `bookmarks`、`storage` 和 `favicon` 权限。`favicon` 仅用于从浏览器本地缓存读取网站图标；常用品牌图标随扩展本地打包，仍不可用时才尝试请求网站自身的常规图标文件。Nook 不会向第三方图标服务发送网址。书签不会复制到扩展存储；设置、快捷项及其顺序由浏览器账号同步，文件夹展开状态、选中的书签文件夹、背景偏好和自定义背景图片仅保存在当前设备。

## 开发

```bash
pnpm install
pnpm dev
```

Edge 开发模式：

```bash
pnpm dev:edge
```

## 构建与加载

```bash
pnpm build
pnpm build:edge
```

- Chrome：打开 `chrome://extensions`，启用开发者模式，选择“加载已解压的扩展程序”，加载 `.output/chrome-mv3`
- Edge：打开 `edge://extensions`，启用开发人员模式，选择“加载解压缩的扩展”，加载 `.output/edge-mv3`

生成可分发压缩包：

```bash
pnpm zip
pnpm zip:edge
```

## 验证

```bash
pnpm test
pnpm typecheck
```

## 应用商店上架

Chrome Web Store 与 Microsoft Edge Add-ons 所需的商店文案、隐私披露、审核说明和提交清单位于 [`docs/store`](./docs/store/README.md)。
