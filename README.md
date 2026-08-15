# 梧桐的个人博客

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Astro](https://img.shields.io/badge/Astro-4.x-blue.svg)
![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-blue.svg)

个人技术博客。托管在 GitHub Pages，域名 [`blog.wuto.site`](https://blog.wuto.site)。

## 本地运行

需要 Node.js 18+ (推荐 20+)。

```bash
# 装依赖（第一次）
npm install

# 起本地 server，访问 http://127.0.0.1:4321
npm run dev

# 只 build，看产物在 dist/
npm run build

# 预览 build 产物
npm run preview
```

## 目录结构

```
.
├── astro.config.mjs           # Astro 配置（Markdown / sitemap / 输出格式）
├── public/                    # 静态资产（构建时原样拷到 dist/）
│   ├── CNAME                  # → blog.wuto.site
│   ├── favicon.ico
│   └── images/                # 站内用图
├── src/
│   ├── content/
│   │   ├── config.ts          # Content Collections schema
│   │   └── posts/             # 文章 markdown (YYYY-MM-DD-标题.md)
│   ├── layouts/
│   │   ├── BaseLayout.astro   # 页面骨架
│   │   └── PostLayout.astro   # 文章页（含 prev/next 导航）
│   ├── pages/
│   │   ├── index.astro        # 首页（单页时间线流）
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── rss.xml.ts         # RSS 输出（由 @astrojs/rss 生成）
│   │   └── blog/[...slug].astro  # 文章动态路由
│   ├── components/            # 可复用组件
│   └── styles/global.css      # Design tokens + reset
├── .github/workflows/deploy.yml  # GitHub Action: build + deploy
├── package.json
├── tsconfig.json
└── LICENSE
```

## 写一篇新文章

文件名约定：`YYYY-MM-DD-标题.md`，放在 `src/content/posts/` 下。

最小 front-matter：

```markdown
---
title: "我的新文章"
date: 2026-08-15 18:30:00 +0800
categories: [iOS]
tags: [swift, xcode]
description: "一句话摘要，会出现在首页卡片和 meta 描述里"
draft: false
---
```

> 缺 `description` 时首页会用正文前 180 字自动生成摘要。

## 部署

默认由 GitHub Actions 部署：`git push origin main` → workflow `.github/workflows/deploy.yml` 跑 `npm run build` → 上传 `dist/` → 部署到 `blog.wuto.site`。

## 许可证

[MIT](LICENSE)
