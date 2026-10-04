---
title: "systemd 常用命令"
summary: ""
lang: zh
translationKey: "ubuntu-shell-systemd"
slug: systemd
track: ubuntu
stage: shell
order: 3
date: 2026-01-04
tags: []
status: zh draft
source: plae-lkm/ubuntu_setup:docs/utils/common_cmd/README.md
---
| 命令             | 作用说明             |
|------------------|----------------------|
| cat /etc/group   | 查看系统所有用户组信息 |
| systemctl --user list-units --type=service --state=running  |  see user service  |

## Command to Reload and Restart Services

| 命令             | 作用说明             |
|------------------|----------------------|
|     sudo systemctl daemon-reload   | reload services |
| sudo systemctl restart xxx.services  |  restart service  |
