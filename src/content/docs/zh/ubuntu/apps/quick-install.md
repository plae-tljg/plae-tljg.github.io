---
title: "常用软件安装"
summary: "wget https://dl.google.com/linux/direct/google-chrome-stablecurrentamd64.deb sudo dpkg -i google-chrome-stablecurrentamd64.deb sudo apt --fix-broken …"
lang: zh
translationKey: "ubuntu-apps-quick-install"
slug: quick-install
track: ubuntu
stage: apps
order: 1
date: 2026-01-04
tags: []
status: zh draft
source: plae-lkm/ubuntu_setup:docs/apps/common/quick_apps.md
aiTranslated: true
---
## Google Chrome、Chromium

```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo apt --fix-broken install
```

```bash
sudo apt-get install chromium-browser
```

## Git

```bash
sudo apt-get install git
sudo apt install git-lfs
```

也可以安装 GitHub Desktop，对我来说没什么用。  

```bash
sudo apt update && sudo apt install github-desktop
```

## 办公软件

系统里已经有 libreoffice，接下来是 WPS。从 [https://www.wps.com/download/](https://www.wps.com/download/) 下载 WPS，然后  

```bash
sudo dpkg -i wps-office_11.X4F7VK7r.1.0.11723.XA_amd64.deb
```

再装几个类似的工具，比如 meld、fldiff

```bash
sudo apt-get install meld
sudo apt install fldiff
```

## 多媒体

### 视频

```bash
sudo apt-get install vlc
```

### 图片

```bash
sudo apt-get install imagemagick
sudo apt-get install gimp
```

## 游戏

```bash
sudo apt-get install gnome-mines
sudo apt-get install 2048-qt
sudo add-apt-repository ppa:libretro/stable && sudo apt-get update && sudo apt-get install retroarch
```

## Zerotier

```bash
curl -s https://install.zerotier.com | sudo bash    #install zerotier-cli
```

要安装 GUI，可能需要用 sudo 运行：  

```bash
git clone https://github.com/tralph3/ZeroTier-GUI.git
cd Zerotier-GUI
chmod +x make_deb.sh
./make_deb.sh
sudo dpkg -i ZeroTier-GUI.deb
```

## 用户配置

```bash
sudo apt install gnome-tweaks
```

## 我写的工具

安装一个用于创建和管理 SSH 密钥的 GUI，  

```bash
sudo dpkg -i ssh-manager_1.0.0_amd64.deb
```

```bash
sudo dpkg -i shareboard_1.0.0_all.deb
sudo dpkg -i daily-commands.deb
```
