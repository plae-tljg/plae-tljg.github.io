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

<!--ref:/assets/virtualbox/How to Install VirtualBox on Ubuntu.html-->
> 参考（第三方页面）：[Install Virtualbox on Ubuntu](https://phoenixnap.com/kb/install-virtualbox-on-ubuntu)
> 本地存档：[快照](/archives/ubuntu-setup/assets/virtualbox/How%20to%20Install%20VirtualBox%20on%20Ubuntu.html)
