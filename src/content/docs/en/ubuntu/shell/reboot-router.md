---
title: "Reboot Router"
summary: "Rebooting router is common technique to reobtain a public ip. Just log into your 192.0.2.1 (or sth similar), click restart router. Or if your router …"
lang: en
translationKey: "ubuntu-shell-reboot-router"
slug: reboot-router
track: ubuntu
stage: shell
order: 5
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/utils/common_cmd/reboot_router.md
aiTranslated: true
---
Rebooting router is common technique to reobtain a public ip. Just log into your `192.0.2.1` (or sth similar), click restart router. Or if your router has manual start button, just click it.  

Now but above is not automated enough, we need write scripts to automate router rebooting bu inspecting element of admin page.  

You can see my fork repository: [Restart-Router](https://github.com/plae-tljg/Restart-Router)  

You can view the original repo to see what is the complete flow to make the restarting call. *I try for several hours to try to view the assets js of the page and write a code with cursor but then fail.*
