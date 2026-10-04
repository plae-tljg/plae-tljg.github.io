---
title: "系统工具"
summary: "sudo add-apt-repository ppa:danielrichter2007/grub-customizer sudo apt-get update sudo apt-get install grub-customizer"
lang: zh
translationKey: "ubuntu-apps-system-tools"
slug: system-tools
track: ubuntu
stage: apps
order: 14
date: 2026-01-04
tags: []
status: zh draft
source: plae-lkm/ubuntu_setup:docs/apps/common/system.md
---
## Grub Customizer

```bash
sudo add-apt-repository ppa:danielrichter2007/grub-customizer
sudo apt-get update
sudo apt-get install grub-customizer
```

## Boot Repair

```bash
sudo add-apt-repository ppa:yannubuntu/boot-repair
sudo apt-get update
sudo apt-get install -y boot-repair
```

启动：

```bash
boot-repair
```

## Terminator

```bash
sudo apt-get install terminator
```

Terminator 是一个功能强大的终端模拟器，支持分屏、多标签等功能。
