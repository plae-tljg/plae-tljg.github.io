---
title: "Asterisk Phone System Setup"
summary: "Asterisk is an open-source phone system (PBX) platform. This doc collects Asterisk's common commands, configuration methods, and real working examples."
lang: en
translationKey: "homelab-services-index"
slug: index
track: homelab
stage: services
order: 0
stageIndex: true
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/dev/asterisk/README.md
---
Asterisk is an open-source phone system (PBX) platform. This doc collects Asterisk's common commands, configuration methods, and real working examples.

## Doc Structure

- [Basic Commands and Configuration](/en/docs/homelab/services/asterisk-basics/) - common commands, file locations, basic operations
- [Trunk Configuration](/en/docs/homelab/services/asterisk-trunk/) - SIP trunk configuration, based on real working examples
- [Audio Processing](/en/docs/homelab/services/asterisk-audio/) - audio file conversion and processing

## Quick Start

### Viewing Logs and the Console

```bash
# 进入 Asterisk 控制台
sudo asterisk -rvvv

# 添加更多 v 来增加详细程度
sudo asterisk -rvvvvvvvvvvvvvv
```

### Configuration File Locations

- `/etc/asterisk/` - configuration file directory
  - `pjsip.conf` - PJSIP endpoint configuration
  - `extensions.conf` - dial plan configuration
- `/var/lib/asterisk/` - audio files, scripts, and so on
- `/var/spool/asterisk/` - files Asterisk generates (recordings, for example)

### Reloading Configuration

```bash
# 在 Asterisk 控制台中
pjsip reload      # 重载端点
dialplan reload   # 重载拨号计划
core reload       # 重载几乎所有配置

# 或在命令行中
sudo asterisk -rx "pjsip reload"
sudo asterisk -rx "dialplan reload"
sudo asterisk -rx "core reload"
```
