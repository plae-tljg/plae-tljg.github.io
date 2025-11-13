---
id: '2'
title: 'React 项目搭建指南'
date: '2024-01-02'
tags: ['React', '前端']
excerpt: '介绍如何使用 Vite 快速搭建一个现代化的 React 项目。'
---

## 为什么选择 Vite

Vite 是一个现代化的前端构建工具，具有以下优势：

- 极速的开发服务器启动
- 快速的热模块替换（HMR）
- 优化的生产构建
- 丰富的插件生态

## 快速开始

使用以下命令创建一个新的 React 项目：

```bash
npm create vite@latest my-app -- --template react
```

然后安装依赖并启动开发服务器：

```bash
cd my-app
npm install
npm run dev
```

## 项目结构

一个典型的 Vite + React 项目结构如下：

- `src/` - 源代码目录
- `public/` - 静态资源
- `index.html` - 入口 HTML 文件
- `vite.config.js` - Vite 配置文件

