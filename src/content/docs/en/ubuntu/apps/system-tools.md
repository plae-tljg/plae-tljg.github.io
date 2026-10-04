---
title: "System Tools"
summary: "sudo add-apt-repository ppa:danielrichter2007/grub-customizer sudo apt-get update sudo apt-get install grub-customizer"
lang: en
translationKey: "ubuntu-apps-system-tools"
slug: system-tools
track: ubuntu
stage: apps
order: 14
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/apps/common/system.md
aiTranslated: true
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

Launch:

```bash
boot-repair
```

## Terminator

```bash
sudo apt-get install terminator
```

Terminator is a powerful terminal emulator with features such as split panes and multiple tabs.
