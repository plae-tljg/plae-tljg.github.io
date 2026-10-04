---
title: "Firefox"
summary: "建议使用 apt 方式安装 Firefox，而不是 snap 版本。因为 snap 版 Firefox 可能会遇到一些兼容性问题，例如搜狗拼音输入法无法正常使用，或者鼠标指针样式无法显示等。"
lang: zh
translationKey: "ubuntu-apps-firefox"
slug: firefox
track: ubuntu
stage: apps
order: 3
date: 2026-01-04
tags: []
status: zh draft
source: plae-lkm/ubuntu_setup:docs/apps/common/firefox.md
---
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

<figure class="archive-viewer" data-src="/archives/ubuntu-setup/assets/apt_firefox/Completely%20Remove%20Snap%20from%20Ubuntu%20Linux%20%5BTutorial%5D.html" data-title="Remove Snap from Ubuntu" data-origin="https://www.debugpoint.com/remove-snap-ubuntu/">
  <figcaption class="archive-viewer__head">
    <span class="archive-viewer__label">第三方页面存档</span>
    <a href="https://www.debugpoint.com/remove-snap-ubuntu/" rel="noopener" target="_blank">Remove Snap from Ubuntu</a>
    <span class="archive-viewer__actions">
      <button type="button" data-archive-open>展开存档</button>
      <a href="/archives/ubuntu-setup/assets/apt_firefox/Completely%20Remove%20Snap%20from%20Ubuntu%20Linux%20%5BTutorial%5D.html" target="_blank" rel="noopener">新窗口</a>
    </span>
  </figcaption>
  <p class="archive-viewer__note">他人页面的本地快照，版权归原作者；存档不会执行其中的脚本。</p>
  <div class="archive-viewer__body"></div>
</figure>

---

> **延伸阅读**：[Snap 版 Firefox 的问题](/zh/writing/tinkering-snap-firefox/)——同一件事的来龙去脉，收在《折腾笔记》里。
