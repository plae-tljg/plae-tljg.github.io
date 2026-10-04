---
title: "systemd Common Commands"
summary: ""
lang: en
translationKey: "ubuntu-shell-systemd"
slug: systemd
track: ubuntu
stage: shell
order: 3
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/utils/common_cmd/README.md
aiTranslated: true
---
| Command          | Description             |
|------------------|-------------------------|
| cat /etc/group   | View all system user group information |
| systemctl --user list-units --type=service --state=running  |  see user service  |

## Command to Reload and Restart Services

| Command          | Description             |
|------------------|-------------------------|
|     sudo systemctl daemon-reload   | reload services |
| sudo systemctl restart xxx.services  |  restart service  |
