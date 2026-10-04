---
title: "SSH Basic Commands"
summary: "Sometimes even when the target server has password authentication enabled, you still can't log in with a password; try forcing a password connection like this:"
lang: en
translationKey: "ubuntu-remote-basics"
slug: basics
track: ubuntu
stage: remote
order: 1
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/dev/ssh/basics.md
aiTranslated: true
---
## SSH Password Login

Sometimes even when the target server has password authentication enabled, you still can't log in with a password; try forcing a password connection like this:    

```bash
ssh -o PubkeyAuthentication=no -o PreferredAuthentications=password user@hostname
```

If you're operating SSH inside Google Colab or another cloud environment, try this (requires `sshpass`):  

```bash
apt-get install sshpass
sshpass -p 'yourPassword' ssh -o StrictHostKeyChecking=no -p yourPort user@hostname
```

## SSH Key Login

If you've configured your private key but still can't log in, it's usually a permissions issue. Make sure the private key permissions are set correctly:

```bash
chmod 600 ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa.pub
chmod 600 ~/.ssh/your_key
```

Sometimes you need to manually add the key to ssh-agent:  

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
```

If the host fingerprint has changed, I recommend clearing the old record first and collecting it again:  

```bash
ssh-keygen -R hostname
ssh-keyscan -p yourPort hostname >> ~/.ssh/known_hosts
```

Debug the connection (add `-vvv` for verbose logs):  

```bash
ssh -vvv -p yourPort user@hostname -i ~/.ssh/your_key
```

## SSH Reverse Tunneling

For NAT traversal, reaching back to your local machine from a remote network:  

```bash
# 将远端 2222 端口映射到本地 22
ssh -R 2222:localhost:22 user@jump_host

# 以后可通过远程机器的 2222 ssh 回你的本地
ssh -p 2222 user@jump_host
```

Penetrate from the external network to other internal hosts:

```bash
ssh -R 2222:192.168.x.x:22 user@jump_host

# 然后可以在远端通过如下方式访问目标机
ssh -p 2222 user@localhost
```

Keep the tunnel more stable (for unattended setups, requires installing autossh):

```bash
autossh -M 0 -o "ServerAliveInterval=30" -o "ServerAliveCountMax=3" -o "ExitOnForwardFailure=yes" -N -R 2222:192.168.x.x:22 user@jump_host
```

## SSH Connection Troubleshooting

### "Broken pipe" Error Debugging

When an SSH connection shows the "client_loop: send disconnect: Broken pipe" error, it's usually caused by a connection timeout or a network issue. This error means the SSH connection was terminated due to inactivity.

#### Causes
- The SSH session is idle for a long time
- The client computer goes into sleep mode
- A network firewall or router has an idle timeout
- The server is configured to close idle connections

#### Debugging Steps

1. **Check the SSH server logs**:
   ```bash
   # 在目标服务器上
   sudo tail -f /var/log/auth.log | grep sshd
   sudo journalctl -u sshd.service -f
   ```

2. **Check the network connection**:
   ```bash
   # 从客户端检查
   ping hostname  # 或 IP 地址
   traceroute hostname
   ```

3. **Check the firewall settings**:
   ```bash
   # 在服务器上
   sudo ufw status
   sudo iptables -L -n -v
   ```

#### Solutions

**A. Configure the SSH client to keep the connection alive** (recommended, no server permissions needed):

Edit the local SSH configuration:
```bash
nano ~/.ssh/config
```

Add the configuration:
```
Host hostname
    HostName hostname
    User your_username
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

`ServerAliveInterval 60` makes the client send a keepalive packet every 60 seconds.

**B. Configure the SSH server settings** (requires server administrator permissions):

Edit the server SSH configuration:
```bash
sudo nano /etc/ssh/sshd_config
```

Add or modify:
```
ClientAliveInterval 60
ClientAliveCountMax 3
TCPKeepAlive yes
```

Restart the SSH service:
```bash
sudo systemctl restart sshd
```

**C. Check network device timeout settings**:
If you connect through a firewall, router, or load balancer, these devices may have their own idle timeout settings.

**D. Prevent the client from sleeping**:
If the local computer going to sleep drops the connection, configure the system not to sleep while an SSH session is active.

#### How to Test
After configuring, connect to the server and run a long-running command (such as `top`), then let it sit idle for 10-15 minutes and see whether the connection stays up.
