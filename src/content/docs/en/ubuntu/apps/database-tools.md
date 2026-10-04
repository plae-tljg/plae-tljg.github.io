---
title: "Database Tools"
summary: "sudo apt-get install mysql-workbench"
lang: en
translationKey: "ubuntu-apps-database-tools"
slug: database-tools
track: ubuntu
stage: apps
order: 12
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/apps/common/database.md
aiTranslated: true
---
## MySQL Workbench

```bash
sudo apt-get install mysql-workbench
```

Or download the latest version from the official site:

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

Or install the latest version:

```bash
sudo add-apt-repository ppa:linuxgndu/sqlitebrowser
sudo apt-get update
sudo apt-get install sqlitebrowser
```
