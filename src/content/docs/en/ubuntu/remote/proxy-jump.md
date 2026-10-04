---
title: "SSH Jump Hosts and Proxies"
summary: "When you need to connect to one machine through another (a jump host), you can use the SSH jump feature. For example: - Your computer → jump host → target VM/server - Access other machines on the internal network through the jump host"
lang: en
translationKey: "ubuntu-remote-proxy-jump"
slug: proxy-jump
track: ubuntu
stage: remote
order: 4
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/dev/ssh/proxy_jump.md
aiTranslated: true
---
## Use Cases

When you need to connect to one machine through another (a jump host), you can use the SSH jump feature. For example:
- Your computer → jump host → target VM/server
- Access other machines on the internal network through the jump host

## Method 1: ProxyJump (Recommended)

SSH 7.3+ supports the `ProxyJump` option:

```bash
ssh -J jump_user@jump_host target_user@target_host
```

Or step by step:

```bash
ssh -J jump_user@jump_host:port target_user@target_host
```

### Configure in SSH config

Edit `~/.ssh/config`:

```
Host jump_host
    HostName jump_host_ip
    User jump_user
    Port 22

Host target_host
    HostName target_host_ip
    User target_user
    ProxyJump jump_host
```

Then connect directly:

```bash
ssh target_host
```

## Method 2: ProxyCommand (for older versions)

For older SSH versions, use `ProxyCommand`:

```bash
ssh -o ProxyCommand="ssh -W %h:%p jump_user@jump_host" target_user@target_host
```

### Configure in SSH config

```
Host jump_host
    HostName jump_host_ip
    User jump_user

Host target_host
    HostName target_host_ip
    User target_user
    ProxyCommand ssh -W %h:%p jump_host
```

## Method 3: Multiple jump hosts

You can chain multiple jump hosts:

```bash
ssh -J jump1,jump2,jump3 target_host
```

Or in the config:

```
Host target_host
    HostName target_host_ip
    User target_user
    ProxyJump jump1,jump2,jump3
```

## Usage Examples

### Scenario: Accessing a VM through a jump host

Assume:
- Jump host: `jump_user@192.168.x.x`
- Target VM: `vm_user@10.0.0.x` (only accessible from the jump host)

**Method 1 (ProxyJump)**:
```bash
ssh -J jump_user@192.168.x.x vm_user@10.0.0.x
```

**Method 2 (config setup)**:
```
Host jump
    HostName 192.168.x.x
    User jump_user

Host vm
    HostName 10.0.0.x
    User vm_user
    ProxyJump jump
```

Then:
```bash
ssh vm
```

## SFTP through a jump host

SFTP also supports jump hosts (if you hit authentication failures or key problems, add `-o IdentitiesOnly=yes` so SFTP authenticates only with the configured keys):

```bash
sftp -J jump_user@jump_host target_user@target_host
```
> If it connects fine as is, `-o IdentitiesOnly=yes` can be omitted; add it only when you need it.

```bash
sftp -o IdentitiesOnly=yes -J jump_user@jump_host target_user@target_host
```

Or in Nautilus, configure the SSH config first, then:

```bash
nautilus sftp://target_user@target_host
```

## Notes

1. **Key authentication**: Make sure both the jump host and the target machine have the correct SSH keys configured
2. **Agent Forwarding**: You can use `ForwardAgent yes` to forward the SSH agent
3. **Keep the connection alive**: Use `ServerAliveInterval` to keep the connection active

### Complete configuration example

```
Host jump
    HostName 192.168.x.x
    User jump_user
    ForwardAgent yes
    ServerAliveInterval 60

Host target
    HostName 10.0.0.x
    User target_user
    ProxyJump jump
    ServerAliveInterval 60
```
