---
title: "Network Tools"
summary: "sudo apt-get install wireshark"
lang: en
translationKey: "ubuntu-apps-network-tools"
slug: network-tools
track: ubuntu
stage: apps
order: 11
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/apps/common/network.md
aiTranslated: true
---
## Wireshark

```bash
sudo apt-get install wireshark
```

When installing, choose to allow non-root users to capture packets.

## Zoiper5

Download the .deb file from the [Zoiper official website](https://www.zoiper.com/en/voip-softphone/download/zoiper5/for/linux):

```bash
sudo dpkg -i zoiper5_x.x.x_amd64.deb
sudo apt --fix-broken install
```

## ZeroTier

### Install the CLI

```bash
curl -s https://install.zerotier.com | sudo bash
```

### Install the GUI

```bash
git clone https://github.com/tralph3/ZeroTier-GUI.git
cd ZeroTier-GUI
chmod +x make_deb.sh
./make_deb.sh
sudo dpkg -i ZeroTier-GUI.deb
```
