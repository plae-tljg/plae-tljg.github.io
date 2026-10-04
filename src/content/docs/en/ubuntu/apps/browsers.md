---
title: "浏览器"
summary: "wget https://dl.google.com/linux/direct/google-chrome-stablecurrentamd64.deb sudo dpkg -i google-chrome-stablecurrentamd64.deb sudo apt --fix-broken …"
lang: en
translationKey: "ubuntu-apps-browsers"
slug: browsers
track: ubuntu
stage: apps
order: 2
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/apps/common/browsers.md
aiTranslated: true
---
## Google Chrome

```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo apt --fix-broken install
```

## Chromium

```bash
sudo apt-get install chromium-browser
```

## Brave Browser

```bash
sudo curl -fsSLo /usr/share/keyrings/brave-browser-archive-keyring.gpg https://brave-browser-apt-release.s3.brave.com/brave-browser-archive-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/brave-browser-archive-keyring.gpg arch=amd64] https://brave-browser-apt-release.s3.brave.com/ stable main"|sudo tee /etc/apt/sources.list.d/brave-browser-release.list

sudo apt update
sudo apt install brave-browser
```
