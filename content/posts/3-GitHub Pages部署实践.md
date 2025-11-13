---
id: '3'
title: 'GitHub Pages 部署实践'
date: '2024-01-03'
tags: ['部署', 'GitHub']
excerpt: '分享如何将 React 项目部署到 GitHub Pages 的实践经验。'
---

## 准备工作

在部署之前，需要确保项目已经配置好 GitHub Pages 的基础路径。

## 配置 Vite

在 `vite.config.js` 中设置 `base` 选项：

```javascript
export default defineConfig({
  base: '/your-repo-name/',
  // ... 其他配置
})
```

## 构建和部署

使用以下命令构建项目：

```bash
npm run build
```

构建完成后，将 `dist` 目录的内容推送到 `gh-pages` 分支即可。

## 注意事项

- 确保 base 路径与仓库名称一致
- 使用相对路径引用资源
- 检查路由配置是否正确

