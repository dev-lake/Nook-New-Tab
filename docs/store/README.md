# Nook 商店上架文档

本目录包含 Chrome Web Store 与 Microsoft Edge Add-ons 上架所需的文字材料。内容已对齐 Nook `0.4.0` 当前实现：Manifest V3、New Tab override、可选文件夹的真实书签树、带确认窗口和可选增强功能的工具栏一键添加、可拖动和分组的固定快捷项、在普通快捷项编辑窗口中配置的 GitHub 仓库与账号组件、网站图标、搜索、三语言、主题、自定义背景和可关闭的好评引导。主页面底部与侧边栏底部组件当前未开放。

## 文档索引

- [LISTING_COPY.md](./LISTING_COPY.md)：英文、简体中文、日文商店名称、短描述、详细描述、搜索词和截图文案
- [PRIVACY_POLICY.md](./PRIVACY_POLICY.md)：可公开托管的隐私政策
- [PRIVACY_DISCLOSURES.md](./PRIVACY_DISCLOSURES.md)：Chrome/Edge 后台隐私问卷、单一用途与权限说明
- [REVIEW_NOTES.md](./REVIEW_NOTES.md)：提供给审核人员的测试说明
- [RELEASE_NOTES.md](./RELEASE_NOTES.md)：版本更新说明
- [SUPPORT.md](./SUPPORT.md)：可公开托管的支持页面
- [ASSET_PLAN.md](./ASSET_PLAN.md)：商店图片尺寸与截图内容计划
- [SUBMISSION_CHECKLIST.md](./SUBMISSION_CHECKLIST.md)：提交前检查清单和已知审核风险

## 提交前必须替换

在发布隐私政策或提交商店之前，全局搜索并替换以下占位内容：

- `[PUBLISHER_NAME]`：开发者或公司法定名称
- `[SUPPORT_EMAIL]`：可正常接收邮件的支持地址
- `[PRIVACY_POLICY_URL]`：公开、无需登录、HTTPS 的隐私政策地址
- `[SUPPORT_URL]`：公开支持页面地址
- `[PRODUCT_URL]`：产品主页，可选

隐私政策和商店后台披露必须与实际行为始终保持一致。后续若增加分析、账号、后端、广告、遥测或新的权限，需要先更新这些文档再提交版本。

## 官方参考

- [Chrome：准备扩展](https://developer.chrome.com/docs/webstore/prepare)
- [Chrome：填写商店信息](https://developer.chrome.com/docs/webstore/cws-dashboard-listing)
- [Chrome：填写隐私字段](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)
- [Chrome Web Store 政策](https://developer.chrome.com/docs/webstore/program-policies/)
- [Edge：发布扩展](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension)
- [Edge Add-ons 开发者政策](https://learn.microsoft.com/en-us/legal/microsoft-edge/extensions/developer-policies)
