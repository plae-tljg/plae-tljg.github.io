---
title: "Development Tools"
summary: "sudo apt-get install git sudo apt install git-lfs"
lang: en
translationKey: "ubuntu-apps-dev-tools"
slug: dev-tools
track: ubuntu
stage: apps
order: 13
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/apps/common/dev_tools.md
aiTranslated: true
---
## Git

```bash
sudo apt-get install git
sudo apt install git-lfs
```

## GitHub Desktop

```bash
sudo apt update && sudo apt install github-desktop
```

## JD-GUI

JD-GUI is a Java decompiler. Download it from the [JD-GUI official site](https://java-decompiler.github.io/):

```bash
# 下载 .deb 文件后
sudo dpkg -i jd-gui-x.x.x.deb
sudo apt --fix-broken install
```

Or use the AppImage:

```bash
chmod +x jd-gui-x.x.x.AppImage
./jd-gui-x.x.x.AppImage
```

## Code Comparison Tools

### Meld

```bash
sudo apt-get install meld
```

### fldiff

```bash
sudo apt install fldiff
```
