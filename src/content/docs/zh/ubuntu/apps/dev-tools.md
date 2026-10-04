---
title: "开发工具"
summary: "sudo apt-get install git sudo apt install git-lfs"
lang: zh
translationKey: "ubuntu-apps-dev-tools"
slug: dev-tools
track: ubuntu
stage: apps
order: 13
date: 2026-01-04
tags: []
status: zh draft
source: plae-lkm/ubuntu_setup:docs/apps/common/dev_tools.md
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

JD-GUI 是 Java 反编译工具。从 [JD-GUI 官网](https://java-decompiler.github.io/) 下载：

```bash
# 下载 .deb 文件后
sudo dpkg -i jd-gui-x.x.x.deb
sudo apt --fix-broken install
```

或使用 AppImage：

```bash
chmod +x jd-gui-x.x.x.AppImage
./jd-gui-x.x.x.AppImage
```

## 代码比较工具

### Meld

```bash
sudo apt-get install meld
```

### fldiff

```bash
sudo apt install fldiff
```
