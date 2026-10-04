---
title: "以无头模式运行 Linux"
summary: "如果你通过 SSH 连接，不需要图形界面（GUI），可以把系统切换到无头（纯文本）模式以节省资源。F…"
lang: zh
translationKey: "ubuntu-base-headless"
slug: headless
track: ubuntu
stage: base
order: 1
date: 2026-01-04
tags: []
status: zh draft
source: plae-lkm/ubuntu_setup:docs/dev/headless.md
aiTranslated: true
---
如果你通过 SSH 连接，不需要图形界面（GUI），可以把系统切换到无头（纯文本）模式以节省资源。按以下步骤操作：

1. **查看当前的默认 target（runlevel）：**
   ```bash
   systemctl get-default
   ```

2. **把默认 target 设置为文本模式（`multi-user.target`）：**
   ```bash
   sudo systemctl set-default multi-user.target
   ```

3. **禁用图形显示管理器：**  
   （根据你的系统选择对应的命令。）

   - 对于使用 `gdm3`（GNOME Display Manager）的系统：
     ```bash
     sudo systemctl disable gdm3
     ```
   - 对于使用 `lightdm` 的系统：
     ```bash
     sudo systemctl disable lightdm
     ```

4. **重启系统让改动生效：**
   ```bash
   sudo reboot
   ```

_注意：重启之后，机器启动时不会拉起 GUI，拿到的是纯粹的命令行环境。想在之后恢复 GUI，把默认 target 改回 `graphical.target`，并重新启用你的显示管理器即可。_