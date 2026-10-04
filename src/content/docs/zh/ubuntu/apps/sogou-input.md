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

<figure class="archive-viewer" data-src="/archives/ubuntu-setup/assets/sogou_input/%E6%90%9C%E7%8B%97%E8%BE%93%E5%85%A5%E6%B3%95%20for%20linux%20%E5%AE%89%E8%A3%85%E6%8C%87%E5%8D%97_utf8.html" data-title="搜狗输入法 for Linux 安装指南" data-origin="https://pinyin.sogou.com/linux/help.php">
  <figcaption class="archive-viewer__head">
    <span class="archive-viewer__label">第三方页面存档</span>
    <a href="https://pinyin.sogou.com/linux/help.php" rel="noopener" target="_blank">搜狗输入法 for Linux 安装指南</a>
    <span class="archive-viewer__actions">
      <button type="button" data-archive-open>展开存档</button>
      <a href="/archives/ubuntu-setup/assets/sogou_input/%E6%90%9C%E7%8B%97%E8%BE%93%E5%85%A5%E6%B3%95%20for%20linux%20%E5%AE%89%E8%A3%85%E6%8C%87%E5%8D%97_utf8.html" target="_blank" rel="noopener">新窗口</a>
    </span>
  </figcaption>
  <p class="archive-viewer__note">他人页面的本地快照，版权归原作者；存档不会执行其中的脚本。</p>
  <div class="archive-viewer__body"></div>
</figure>
