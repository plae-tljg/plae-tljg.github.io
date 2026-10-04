---
title: "数据库工具"
summary: "sudo apt-get install mysql-workbench"
lang: zh
translationKey: "ubuntu-apps-database-tools"
slug: database-tools
track: ubuntu
stage: apps
order: 12
date: 2026-01-04
tags: []
status: zh draft
source: plae-lkm/ubuntu_setup:docs/apps/common/database.md
---
## MySQL Workbench

```bash
sudo apt-get install mysql-workbench
```

或从官网下载最新版本：

```bash
wget https://dev.mysql.com/get/mysql-apt-config_0.8.x-x_all.deb
sudo dpkg -i mysql-apt-config_0.8.x-x_all.deb
sudo apt-get update
sudo apt-get install mysql-workbench-community
```

## DB Browser for SQLite

```bash
sudo apt-get install sqlitebrowser
```

或安装最新版本：

```bash
sudo add-apt-repository ppa:linuxgndu/sqlitebrowser
sudo apt-get update
sudo apt-get install sqlitebrowser
```
