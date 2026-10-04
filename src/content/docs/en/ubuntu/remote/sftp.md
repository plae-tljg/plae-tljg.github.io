---
title: "Using SFTP"
summary: "You can open Nautilus straight from the terminal to connect to an SFTP server:"
lang: en
translationKey: "ubuntu-remote-sftp"
slug: sftp
track: ubuntu
stage: remote
order: 3
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/dev/ssh/sftp.md
aiTranslated: true
---
## Open SFTP from the terminal

### With Nautilus

You can open Nautilus straight from the terminal to connect to an SFTP server:

```bash
nautilus sftp://user@hostname
```

To open a specific directory:

```bash
nautilus sftp://user@hostname/home/user/
```

### With the command-line client

```bash
sftp user@hostname
```

Once connected, you can use these SFTP commands:
- `ls` - list the remote directory
- `cd` - change the remote directory
- `lcd` - change the local directory
- `get file` - download a file
- `put file` - upload a file
- `exit` - quit

## Connect in Nautilus

### Through the graphical interface

1. Open Nautilus
2. Click **Other Locations** in the sidebar
3. Enter the following in the **Connect to Server** field at the bottom:
   ```
   sftp://user@hostname
   ```
4. Press Enter and type your password

### Through the terminal

```bash
nautilus sftp://user@hostname
```

## Fixing authentication in Nautilus

If Nautilus reports "too many authentication failures" while connecting, add this to `~/.ssh/config`:

```
Host hostname
    User username
    IdentitiesOnly yes
    PreferredAuthentications password
    PubkeyAuthentication no
```

Nautilus then uses password authentication and stops trying several keys.

## Verify the connection

Before you connect, test it in the terminal first:

```bash
ssh -o PreferredAuthentications=password user@hostname
```

If the terminal connects, Nautilus should connect too.