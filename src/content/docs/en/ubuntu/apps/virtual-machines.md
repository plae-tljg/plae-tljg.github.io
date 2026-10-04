---
title: "Virtual Machine"
summary: "Download package from https://www.genymotion.com/product-desktop/download/"
lang: en
translationKey: "ubuntu-apps-virtual-machines"
slug: virtual-machines
track: ubuntu
stage: apps
order: 16
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/apps/common/vm/virtual_machines.md
---
## Genymotion

Download package from [https://www.genymotion.com/product-desktop/download/](https://www.genymotion.com/product-desktop/download/)  

```bash
chmod +x genymotion-X.Y.Z-linux_x64.run
./genymotion-X.Y.Z-linux_x64.run

#or specify path
./genymotion-X.Y.Z-linux_x64.run -d PATH
```

## Virtualbox

Do not use apt install virtualbox, that may install you the older version of virtualbox and may have some problem on running.  

Download package from [https://www.virtualbox.org/wiki/Downloads](https://www.virtualbox.org/wiki/Downloads) or [https://www.virtualbox.org/wiki/Linux_Downloads](https://www.virtualbox.org/wiki/Linux_Downloads)  

```bash
sudo dpkg -i virtualbox-7.0_7.0.14-161095~Ubuntu~jammy_amd64.deb
```

Remember also install the extension so that you can enjoy shared clipboard, ... Get the extension pack from first url.  

```bash
wget https://download.virtualbox.org/virtualbox/7.0.14/Oracle_VM_VirtualBox_Extension_Pack-7.0.14.vbox-extpack  ##change the version
sudo VBoxManage extpack install Oracle_VM_VirtualBox_Extension_Pack-7.0.14.vbox-extpack
```

<br />

<figure class="archive-viewer" data-src="/archives/ubuntu-setup/assets/virtualbox/How%20to%20Install%20VirtualBox%20on%20Ubuntu.html" data-title="Install Virtualbox on Ubuntu" data-origin="https://phoenixnap.com/kb/install-virtualbox-on-ubuntu">
  <figcaption class="archive-viewer__head">
    <span class="archive-viewer__label">第三方页面存档</span>
    <a href="https://phoenixnap.com/kb/install-virtualbox-on-ubuntu" rel="noopener" target="_blank">Install Virtualbox on Ubuntu</a>
    <span class="archive-viewer__actions">
      <button type="button" data-archive-open>展开存档</button>
      <a href="/archives/ubuntu-setup/assets/virtualbox/How%20to%20Install%20VirtualBox%20on%20Ubuntu.html" target="_blank" rel="noopener">新窗口</a>
    </span>
  </figcaption>
  <p class="archive-viewer__note">他人页面的本地快照，版权归原作者；存档不会执行其中的脚本。</p>
  <div class="archive-viewer__body"></div>
</figure>
