---
title: "Terminal & Shell"
summary: "The terminal setup on this machine: bash, a completion behaviour that has been changed, and a .bashrc split into pieces."
lang: en
translationKey: ubuntu-shell-index
slug: index
track: ubuntu
stage: shell
order: 0
stageIndex: true
date: 2026-01-04
tags: []
status: en draft
source: hand-written
---

# Terminal & Shell

This is the entry point for this stage, and it is not a tour of Linux commands — it is
**what was changed on this machine**, why the defaults were annoying, and what they
became.

## The setup

- **Shell**: bash. Not zsh — everything needed so far fits in `.bashrc`, and if that
  changes it will be written up here.
- **Completion**: the default Tab completion prints the candidates once and stops, unlike
  PuTTY's, which cycles. The fix is `menu-complete`; see [Bash tricks](/zh/docs/ubuntu/shell/bash-tricks/) (Chinese).
- **`.bashrc`**: split into environment variables, aliases and completion instead of one
  growing file.
- **systemd**: the usual `systemctl` verbs, plus the group/permission commands that are
  easy to misremember.

## What is in this stage

Written in English:

- [Audio commands](/en/docs/ubuntu/shell/audio-cmd/) — `spd-say`, espeak, and converting to the 8 kHz mono that Asterisk wants
- [Sending mail](/en/docs/ubuntu/shell/send-email/)
- [Code highlighting](/en/docs/ubuntu/shell/code-highlight/) — a dialplan syntax for gedit
- [Cursor themes](/en/docs/ubuntu/shell/cursor-style/)
- [Fun commands](/en/docs/ubuntu/shell/fun-commands/)
- [Common directories](/en/docs/ubuntu/shell/common-dirs/)

Chinese only, for now — the sidebar links them with a `ZH` marker:

- [Bash tricks](/zh/docs/ubuntu/shell/bash-tricks/) · [systemd](/zh/docs/ubuntu/shell/systemd/) · [rebooting the router](/zh/docs/ubuntu/shell/reboot-router/) · [links](/zh/docs/ubuntu/shell/links/) · [hidden images](/zh/docs/ubuntu/shell/hidden-images/)

## Not here

tmux and screen are not part of how I work right now, so there are no pages for them.
That is a gap in the setup, not in the manual — if they arrive, they land in this stage.
