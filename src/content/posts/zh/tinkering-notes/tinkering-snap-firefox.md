---
title: 07 Snap 版 Firefox 的问题
summary: >-
  建议使用 apt 方式安装 Firefox，而不是 snap 版本。因为 snap 版 Firefox
  可能会遇到一些兼容性问题，例如搜狗拼音输入法无法正常使用，或者鼠标指针样式无法显示等。
lang: zh
translationKey: tinkering-snap-firefox
slug: tinkering-snap-firefox
date: '2026-10-01'
series: tinkering-notes
seriesOrder: 7
tags:
  - 折腾
  - Ubuntu
status: preview
source: seasons/03-tinkering/07-snap-firefox.zh.md
syncedAt: '2026-10-04T10:26:34.594Z'
---
<!-- 草稿：从 plae-lkm/ubuntu_setup 的 docs/apps/common/firefox.md 导入，等待重写。
     安装命令保留在文档页（/zh/docs/ubuntu/apps/firefox/）。文章写"为什么 snap 版会这样"，以及 apt 版与 pin 的取舍。
     命令与截图先不删，重写时再决定留哪些。 -->
# Firefox

建议使用 apt 方式安装 Firefox，而不是 snap 版本。因为 snap 版 Firefox 可能会遇到一些兼容性问题，例如搜狗拼音输入法无法正常使用，或者鼠标指针样式无法显示等。

需要注意的是，即使你通过 apt 安装了 Firefox，如果不按照下述方法操作，有时在 Ubuntu 或系统更新后，apt 版 Firefox 仍可能会被自动替换为 snap 版。

## 备份提示

- 如果你使用的是 snap 版 Firefox，建议进入 `~/snap` 目录，找到你的 Firefox 配置文件夹（如 `gvgfc0ni.default-release`），并将其压缩备份。
- 如果你使用的是 apt 版 Firefox，则在 `~/.mozilla/firefox` 目录下找到对应的配置文件夹进行备份。

## 安装方法

你可以参考下方的网页链接，按照教程进行安装，或者直接参考我的简要步骤：

1. 移除 snap（注意：移除 snap 可能会影响你通过 snap 安装的软件包，比如 vlc、mysql workbench 等，请根据实际情况决定是否移除。本人未尝试过全部移除 snap 的影响，请自行斟酌。）

    ```bash
    sudo snap remove --purge snapd
    sudo apt remove --autoremove snapd
    ```

2. 防止 apt 之后再次自动安装 snap。

    ```bash
    sudo -H gedit /etc/apt/preferences.d/nosnap.pref
    ```

    在文件中添加以下内容并保存（-10 表示禁止安装）：

    ```bash
    Package: snapd
    Pin: release a=*
    Pin-Priority: -10
    ```

3. 通过 apt 安装 Firefox

    ```bash
    sudo apt update
    sudo add-apt-repository ppa:mozillateam/ppa
    sudo apt update
    sudo apt install -t 'o=LP-PPA-mozillateam' firefox
    ```

## 参考链接

<!--ref:/assets/apt_firefox/Completely Remove Snap from Ubuntu Linux [Tutorial].html-->
> 参考（第三方页面）：[Remove Snap from Ubuntu](https://www.debugpoint.com/remove-snap-ubuntu/)
