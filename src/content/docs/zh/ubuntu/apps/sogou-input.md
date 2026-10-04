---
title: "Sogou Input"
summary: "> ⚠️ 已过时：这一页记录的是当时的做法，可能已经不适用。"
lang: zh
translationKey: "ubuntu-apps-sogou-input"
slug: sogou-input
track: ubuntu
stage: apps
order: 18
date: 2026-01-04
tags: []
status: zh draft
source: plae-lkm/ubuntu_setup:docs/apps/common/old/sogou_input.md
---
> ⚠️ **已过时**：这一页记录的是当时的做法，可能已经不适用。

Just use any input method you like, I just randomly pick one.  

## 安装方法

你可以参考下方的网页链接，按照教程进行安装，或者直接参考我的简要步骤：

1. In language support, add `chinese (simplified)` support, then change iput system to `fcitx`, then click apply to whole system and reboot. if `fcitx` not exist, run  

  ```bash
  sudo apt-get install fcitx
  ```

2. Download the `.deb` from [https://shurufa.sogou.com/linux](https://shurufa.sogou.com/linux), then run  

  ```bash
  sudo dpkg -i sudo dpkg -i sogoupinyin_版本号_amd64.deb

  # if you find lack dependency
  sudo apt -f install
  ```

3. reboot.  

## 参考链接

<!--ref:/assets/sogou_input/搜狗输入法 for linux 安装指南_utf8.html-->
> 参考（第三方页面）：[搜狗输入法 for Linux 安装指南](https://pinyin.sogou.com/linux/help.php)
