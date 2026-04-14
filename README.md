# 八字记录网站脚手架

基于 Next.js + Tailwind CSS 的简易脚手架，包含：

- 首页记录列表（`/`）
- 添加记录页面（`/add`）

## 项目规范

- 代码注释统一使用中文，且保持简洁明确。
- UI 风格遵循简约中式风（留白、克制、沉稳）。
- 使用 TypeScript 编写，禁止使用 `any` 类型。

## 本地运行

1. 安装 Node.js 18+（推荐 20+）
2. 安装依赖
3. 启动开发服务器

```bash
npm install
npm run dev
```

然后访问 [http://localhost:3000](http://localhost:3000)。

## 后续可扩展

- 将 `data/mock-records.ts` 改为数据库读取
- 在 `/add` 页面接入 API 路由并保存数据
- 增加详情页、编辑页、删除功能与搜索筛选
