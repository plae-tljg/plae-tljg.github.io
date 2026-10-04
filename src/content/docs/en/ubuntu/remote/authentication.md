---
title: "Troubleshooting SSH authentication"
summary: "When the SSH client tries too many authentication methods (several SSH keys, for example), the server refuses the connection and drops it. This is common when several SSH keys are loaded into the agent."
lang: en
translationKey: "ubuntu-remote-authentication"
slug: authentication
track: ubuntu
stage: remote
order: 2
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/dev/ssh/authentication.md
aiTranslated: true
---
## "Too many authentication failures" error

When the SSH client tries too many authentication methods (several SSH keys, for example), the server refuses the connection and drops it. This is common when several SSH keys are loaded into the agent.

### Solutions

#### 1. Use the `IdentitiesOnly=yes` option

```bash
ssh -o IdentitiesOnly=yes user@hostname
```

This tells SSH to use only the identity/key named in the configuration instead of trying every key in the agent.

#### 2. Configure the SSH config file

Create or edit `~/.ssh/config`:

```
Host hostname
    User username
    IdentitiesOnly yes
    PreferredAuthentications password
```

This forces SSH to use password authentication only, without trying several keys.

#### 3. Temporarily disable the SSH agent

If you use an SSH agent (ssh-agent, for example), you can disable it temporarily:

```bash
SSH_AUTH_SOCK= ssh user@hostname
```

This stops SSH from trying every key loaded into the agent.

#### 4. Point at the specific key

If you know which key should work:

```bash
ssh -i ~/.ssh/specific_key user@hostname
```

#### 5. Flush the keys in the SSH agent

```bash
ssh-add -D
```

This removes every loaded key.

### Authentication problems in Nautilus

When Nautilus connects over SFTP, it uses the system SSH configuration by default, but it cannot take extra arguments the way the terminal does.

**Fix**: configure this in `~/.ssh/config`:

```
Host hostname
    User username
    IdentitiesOnly yes
    PreferredAuthentications password
    PubkeyAuthentication no
```

With that in place, Nautilus picks up these settings when it connects over SFTP, which avoids the "too many authentication failures" error.

### Check the server's authentication limits

The server may allow only a low number of authentication attempts. You can check the `MaxAuthTries` setting in the server's `/etc/ssh/sshd_config` file.
