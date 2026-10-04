---
title: "Android Local File Access"
summary: "Access files between Ubuntu and an Android phone over WiFi, no USB cable needed and nothing exposed to the internet."
lang: en
translationKey: "ubuntu-remote-android-access"
slug: android-access
track: ubuntu
stage: remote
order: 5
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/dev/ssh/android_access.md
aiTranslated: true
---
Access files between Ubuntu and an Android phone over WiFi, no USB cable needed and nothing exposed to the internet.

## Method 1: SSH/SFTP (Recommended, Secure)

Set up an SSH server on Android using Termux, then access it from Ubuntu via SFTP.

### Setup in Android Termux

#### 1. Install and Configure

```bash
# Grant storage permission
termux-setup-storage

# Install OpenSSH
pkg install openssh

# Set password
passwd

# Check username (usually u0_aXXX format)
whoami
```

#### 2. Configure SSH Server

Edit SSH config (to enable password authentication if needed):

```bash
nano /data/data/com.termux/files/usr/etc/ssh/sshd_config
```

Add or modify:
```
PasswordAuthentication yes
PubkeyAuthentication yes
```

#### 3. Start SSH Server

```bash
sshd
```

The SSH server runs on port **8022** (not the standard 22).

#### 4. Check Phone IP Address

```bash
ifconfig
```

Note the WiFi interface IP address (e.g., `192.0.2.20`).

### Connect from Ubuntu

#### Method A: Key Authentication (Recommended)

**Generate key on Ubuntu** (if you don't have one):

```bash
ssh-keygen -t ed25519
cat ~/.ssh/id_ed25519.pub
```

**Add public key in Termux**:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# Paste Ubuntu's public key, save
chmod 600 ~/.ssh/authorized_keys
```

**Connect from Ubuntu**:

```bash
sftp -P 8022 username@192.0.2.20
```

#### Method B: Password Authentication

If you get "Too many authentication failures" error, configure in `~/.ssh/config`:

```
Host android_phone
    HostName 192.0.2.20
    User u0_a322
    Port 8022
    IdentitiesOnly yes
    PreferredAuthentications password
    PubkeyAuthentication no
```

Then connect:

```bash
sftp android_phone
```

#### Access via Nautilus

Enter in Nautilus address bar:

```
sftp://username@192.0.2.20:8022
```

Or from terminal:

```bash
nautilus sftp://username@192.0.2.20:8022
```

### Troubleshooting

#### SSH Connection Issues

1. **Check if SSH server is running**:
   ```bash
   # In Termux
   ps aux | grep sshd
   ```

2. **Restart SSH server**:
   ```bash
   # In Termux
   pkill sshd && sshd
   ```

3. **Check IP address**: Phone IP may change, re-run `ifconfig` to confirm

4. **Ensure same WiFi network**: Both devices must be on the same LAN

#### Connection Issues After Copying .ssh Folder

When copying the `.ssh` folder from another computer to a new Ubuntu system, you may encounter connection issues. This is usually a file permission problem:

**Fix permissions**:
```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/android_fit  # or other private key file
chmod 644 ~/.ssh/known_hosts
chown -R $USER:$USER ~/.ssh
```

**If you get "Host key verification failed"**:
```bash
ssh-keygen -R 192.0.2.193  # Replace with your Android IP
```

#### Network Issue: "No route to host"

If you get `No route to host`, this is typically a network layer issue, not an SSH configuration problem.

**Odd network behavior**: Sometimes ping from Ubuntu to Android fails, but after pinging from Android to Ubuntu, the connection suddenly works. This is because:

- **ARP cache issue**: Android pinging Ubuntu first creates an ARP table entry
- **Stateful firewall**: Android pinging Ubuntu creates state allowing return traffic
- **Network interface wakeup**: Initial ping "wakes up" the network stack

**Solutions**:
1. Try pinging Ubuntu from Android first, then connect from Ubuntu
2. Or ping Android from Ubuntu a few times first:
   ```bash
   ping -c 2 192.0.2.193
   ```

#### Files Not Detected by Other Apps After Transfer

After transferring files to Android via SFTP, other apps (like `File Manager`) may not detect the new files unless you reboot the phone. This is an Android media scanner issue.

**Solution**: Run the media scan command in Termux:

```bash
termux-media-scan -r ~/storage/shared
```

This forces Android to re-scan media files, making them visible to other apps without a reboot.

**Create a shortcut**: For convenience, add an alias to `~/.bashrc`:

```bash
alias rescan='termux-media-scan -r ~/storage/shared'
```

After adding, run `source ~/.bashrc` to apply. Then just type `rescan`.

## Method 2: FTP Server (Simple, Quick)

Install an FTP server app on Android (like "FTP Server" or "Software Data Cable"), then enter the FTP address in Ubuntu's Nautilus:

```
ftp://192.0.2.20:port
```

## Method 3: LocalSend (Modern, Simple)

Install LocalSend:
- Android: from Play Store or F-Droid
- Ubuntu: download from official site or use Snap

LocalSend lets you transfer files directly on the local network with no configuration.

## Method 4: KDE Connect (Feature-Rich)

Install KDE Connect:
- Android: from Play Store
- Ubuntu: `sudo apt install kdeconnect`

Besides file transfer, it supports notification sync, remote control, and more.

## Security Notes

- All methods work only on the local network, nothing is exposed to the internet
- Ensure your WiFi network has a strong password
- SSH/SFTP is more secure than FTP
- Key authentication is more secure than password authentication

## Recommendations

- **Most secure**: SSH/SFTP + key authentication
- **Simplest**: LocalSend
- **Most features**: KDE Connect
- **Fastest setup**: FTP server app