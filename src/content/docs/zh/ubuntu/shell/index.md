---
title: "终端与 Shell"
summary: "这台机器上的终端环境：用 bash，补全行为是改过的，.bashrc 拆成了几块；这一段收的都是敲命令时用得上的东西。"
lang: zh
translationKey: ubuntu-shell-index
slug: index
track: ubuntu
stage: shell
order: 0
stageIndex: true
date: 2026-01-04
tags: []
status: zh draft
source: hand-written
---

# 终端与 Shell

这一页是这一段的入口。这里记的不是"Linux 命令大全"，而是**这台机器上被改过的地方**——默认的终端有哪些不好用，我改成了什么，以及为什么。

## 现在的环境

- **shell**：bash。没有换 zsh，因为要改的地方用 `.bashrc` 就够了；真换了会写在这里。
- **补全**：默认的 Tab 补全只列一次候选就停住，不像 PuTTY 那边可以循环选择。改法是 `menu-complete`，见 [Bash 技巧](/zh/docs/ubuntu/shell/bash-tricks/)。
- **`.bashrc`**：拆成几块（环境变量、别名、补全），而不是一路往下堆。
- **systemd**：常用的是 `systemctl` 那几条和几个容易记错的组权限命令。

## 这一段里有什么

中文写的：

- [Bash 技巧](/zh/docs/ubuntu/shell/bash-tricks/)：补全、模块化 `.bashrc`、`source` / `.` / `./` 的区别
- [systemd 常用命令](/zh/docs/ubuntu/shell/systemd/)
- [重启路由器](/zh/docs/ubuntu/shell/reboot-router/)
- [图种](/zh/docs/ubuntu/shell/hidden-images/)
- [常用链接](/zh/docs/ubuntu/shell/links/)

只有英文的（侧边栏会给它们标 `EN`）：

- [音频命令](/en/docs/ubuntu/shell/audio-cmd/) · [发送邮件脚本](/en/docs/ubuntu/shell/send-email/) · [代码高亮](/en/docs/ubuntu/shell/code-highlight/) · [光标主题](/en/docs/ubuntu/shell/cursor-style/) · [有趣的命令](/en/docs/ubuntu/shell/fun-commands/) · [常用目录](/en/docs/ubuntu/shell/common-dirs/)

## 没写的

tmux / screen 这类复用工具目前不在我的流程里，所以这里没有它们的页面——不是漏了，是没用。哪天用上了，就加在这一段。
