---
title: 08 有意识地重写仓库历史
summary: 有时候你想对一个 Git 仓库彻底重写（breaking change），比如把完全新的一套代码替换进来，旧的内容全部不要。这时可以参考如下步骤：
lang: zh
translationKey: tinkering-rewrite-history
slug: tinkering-rewrite-history
date: '2026-10-01'
series: tinkering-notes
seriesOrder: 8
tags:
  - 折腾
  - Ubuntu
status: preview
source: seasons/03-tinkering/08-rewrite-history.zh.md
syncedAt: '2026-10-04T10:26:34.594Z'
---
<!-- 草稿：从 plae-lkm/ubuntu_setup 的 docs/dev/git/breaking_change.md 导入，等待重写。
     原文开头写着"AI 推荐的可行步骤"。写文章时要把前提条件补上：什么时候可以重写、什么时候不可以。
     命令与截图先不删，重写时再决定留哪些。 -->
# Git Breaking Change 操作大破坏重写仓库（AI 推荐的可行步骤）

有时候你想对一个 Git 仓库彻底重写（breaking change），比如把完全新的一套代码替换进来，旧的内容全部不要。这时可以参考如下步骤：  

## 操作步骤

1. **备份当前主分支所有代码（可选）**
   ```bash
   git checkout -b legacy-code-backup
   git push origin legacy-code-backup
   ```

2. **切换回主分支并删除所有旧代码**
   ```bash
   git checkout main
   git rm -r .       # 删除所有被 git 跟踪的文件
   git commit -m "BREAKING CHANGE: 完全重写，移除旧代码"
   ```

3. **复制新代码到项目目录，然后提交**
   - 将你新写的代码复制进项目文件夹

   ```bash
   git add .
   git commit -m "Complete rewrite: 新代码库实现"
   git push origin main
   ```

这样，主分支会只保留最新的代码，旧内容会被彻底替换。  

> 小提示：操作前确保大家达成一致，且旧内容有分支备份防止误删。
