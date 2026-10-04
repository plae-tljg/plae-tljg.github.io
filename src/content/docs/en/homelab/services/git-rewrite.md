---
title: "Deliberately rewriting repository history"
summary: "Sometimes you want to rewrite a Git repository from scratch (a breaking change), for example dropping an entirely new codebase in and keeping none of the old content. The steps below cover that case:"
lang: en
translationKey: "homelab-services-git-rewrite"
slug: git-rewrite
track: homelab
stage: services
order: 6
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/dev/git/breaking_change.md
aiTranslated: true
---
Sometimes you want to rewrite a Git repository from scratch (a breaking change), for example dropping an entirely new codebase in and keeping none of the old content. The steps below cover that case:  

## Steps

1. **Back up all the code on the current main branch (optional)**
   ```bash
   git checkout -b legacy-code-backup
   git push origin legacy-code-backup
   ```

2. **Switch back to the main branch and delete all the old code**
   ```bash
   git checkout main
   git rm -r .       # 删除所有被 git 跟踪的文件
   git commit -m "BREAKING CHANGE: 完全重写，移除旧代码"
   ```

3. **Copy the new code into the project directory, then commit**
   - Copy the code you just wrote into the project folder

   ```bash
   git add .
   git commit -m "Complete rewrite: 新代码库实现"
   git push origin main
   ```

That way the main branch keeps only the newest code, and the old content is replaced outright.  

> Small tip: make sure everyone agrees before you do this, and keep the old content on a branch as a backup so nothing is deleted by accident.