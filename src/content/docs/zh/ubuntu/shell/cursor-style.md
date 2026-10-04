---
title: "光标样式"
summary: "要管理光标样式，最好安装 gnome-tweaks 工具来管理其样式。"
lang: zh
translationKey: "ubuntu-shell-cursor-style"
slug: cursor-style
track: ubuntu
stage: shell
order: 8
date: 2026-01-04
tags: []
status: zh draft
source: plae-lkm/ubuntu_setup:docs/utils/user_config/cursor_style.md
aiTranslated: true
---
要管理光标样式，最好安装 `gnome-tweaks` 工具来管理其样式。  

注意，光标样式里的文件（X11 光标类型）可以用 `gimp` 查看。  

放置光标样式的位置在 `/usr/share/icons/` 里。  

## 构建光标样式

在网上随便下载一个光标样式即可，例如：[https://www.gnome-look.org/browse?cat=107&ord=latest](https://www.gnome-look.org/browse?cat=107&ord=latest)  

然后把里面的文件改成你自己的光标样式，比如你下载了 `oero_blue_cursors`，可以替换 `default`、`progress`、`text`、`pointer`、`help`、`alias`、`up-arrow` 等等。  

要部署的话，直接用 gnome-tweaks 工具，在 `appearance` 标签页里，把 `Themes` 下的 `Cursor` 改成你的光标样式。  

想自己尝试创建 X11 光标文件的话，记得我以前写过一个 C 的库，用来做 `cur2png` 和 `png2cur`。（哎呀，是 C 库还是 python 库能用来着？忘了）  

请看 `./lib/cursor_style_lib`，这个库的底层逻辑是：我已经拿到了一个窗口光标样式的 zip，所以想把它适配成 ubuntu 的样式。
