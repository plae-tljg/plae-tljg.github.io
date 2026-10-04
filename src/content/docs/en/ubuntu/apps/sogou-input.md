---
title: "Sogou Input"
summary: "> ⚠️ Outdated: This page records the approach at the time, which may no longer apply."
lang: en
translationKey: "ubuntu-apps-sogou-input"
slug: sogou-input
track: ubuntu
stage: apps
order: 18
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/apps/common/old/sogou_input.md
aiTranslated: true
---
> ⚠️ **Outdated**: This page records the approach at the time, which may no longer apply.

Just use any input method you like, I just randomly pick one.

## Installation

You can refer to the web links below and follow the tutorial to install, or just follow my brief steps:

1. In language support, add `chinese (simplified)` support, then change input system to `fcitx`, then click apply to whole system and reboot. if `fcitx` not exist, run

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

## Reference Links

<figure class="archive-viewer" data-src="/archives/ubuntu-setup/assets/sogou_input/%E6%90%9C%E7%8B%97%E8%BE%93%E5%85%A5%E6%B3%95%20for%20linux%20%E5%AE%89%E8%A3%85%E6%8C%87%E5%8D%97_utf8.html" data-title="Sogou Pinyin for Linux Installation Guide" data-origin="https://pinyin.sogou.com/linux/help.php">
  <figcaption class="archive-viewer__head">
    <span class="archive-viewer__label">Third-party archive</span>
    <a href="https://pinyin.sogou.com/linux/help.php" rel="noopener" target="_blank">Sogou Pinyin for Linux Installation Guide</a>
    <span class="archive-viewer__actions">
      <button type="button" data-archive-open>Expand archive</button>
      <a href="/archives/ubuntu-setup/assets/sogou_input/%E6%90%9C%E7%8B%97%E8%BE%93%E5%85%A5%E6%B3%95%20for%20linux%20%E5%AE%89%E8%A3%85%E6%8C%87%E5%8D%97_utf8.html" target="_blank" rel="noopener">New window</a>
    </span>
  </figcaption>
  <p class="archive-viewer__note">Local snapshot of a third-party page, copyright belongs to the original author; the archive will not execute any scripts within it.</p>
  <div class="archive-viewer__body"></div>
</figure>
