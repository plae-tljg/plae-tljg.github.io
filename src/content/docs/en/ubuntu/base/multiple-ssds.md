---
title: "Managing Multiple SSDs for Storage and Quick Access"
summary: "This document records how I manage multiple SSDs on Ubuntu, including mounting partitions with different file systems and creating symbolic links for quick access."
lang: en
translationKey: "ubuntu-base-multiple-ssds"
slug: multiple-ssds
track: ubuntu
stage: base
order: 2
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/dev/multiple_ssds.md
aiTranslated: true
---
This document records how I manage multiple SSDs on Ubuntu, including mounting partitions with different file systems and creating symbolic links for quick access.

## System Disk Layout

The current system is configured with multiple NVMe SSDs. Here is the disk layout:

```
nvme0n1     259:0    0   1.9T  0 disk
├─nvme0n1p1 259:1    0   100M  0 part /boot/efi
├─nvme0n1p2 259:2    0    16M  0 part
├─nvme0n1p3 259:3    0 880.6G  0 part        # Windows NTFS 分区
├─nvme0n1p4 259:4    0   768M  0 part
└─nvme0n1p5 259:5    0     1T  0 part        # Ubuntu EXT4 分区

nvme1n1     259:6    0   1.9T  0 disk
├─nvme1n1p1 259:7    0    16M  0 part
└─nvme1n1p2 259:8    0   1.9T  0 part /      # 系统根目录
```

## Mounting Extra Partitions

### Creating Mount Points

```bash
# 为 Ubuntu 数据分区创建挂载点
sudo mkdir /mnt/ubuntu_ssd1_nvme0n1p5

# 为 Windows 数据分区创建挂载点
sudo mkdir /mnt/win_ssd1_nvme0n1p3
```

### Mounting Partitions

```bash
# 挂载 Ubuntu EXT4 分区
sudo mount /dev/nvme0n1p5 /mnt/ubuntu_ssd1_nvme0n1p5

# 挂载 Windows NTFS 分区
sudo mount /dev/nvme0n1p3 /mnt/win_ssd1_nvme0n1p3
```

### Configuring Automatic Mounts

Edit the `/etc/fstab` file to add automatic mounts:

```bash
sudo nano /etc/fstab
```

Add the following lines:
```
/dev/nvme0n1p5  /mnt/ubuntu_ssd1_nvme0n1p5  ext4  defaults  0  2
/dev/nvme0n1p3  /mnt/win_ssd1_nvme0n1p3  ntfs-3g  defaults  0  0
```

## Creating Symbolic Links for Quick Access

For convenience, create symbolic links to the user's home directory:

```bash
# 链接到 Ubuntu 分区的用户目录
sudo ln -s /mnt/ubuntu_ssd1_nvme0n1p5/home/lkm /home/lkm/ubuntu_ssd1_nvme0n1p5_lkm

# 链接到 Windows 分区的用户目录
sudo ln -s /mnt/win_ssd1_nvme0n1p3/Users/user /home/lkm/win_ssd1_nvme0n1p3_user
```

## Usage

After creating the symbolic links, you can access the data quickly like this:

- **Ubuntu data**: `~/ubuntu_ssd1_nvme0n1p5_lkm`
- **Windows data**: `~/win_ssd1_nvme0n1p3_user`

You can navigate to these locations directly in the file manager.

## Notes

1. **Permissions**: Make sure the mounted partitions have the appropriate permissions
2. **File system compatibility**: EXT4 for Linux, NTFS for Windows compatibility
3. **Symbolic links**: Use `ln -s` to create symbolic links instead of hard links
4. **fstab configuration**: Make sure the UUID or device path is correct, in case device order changes

## Troubleshooting

### Mount fails
- Check that the device path is correct: `ls /dev/nvme*`
- Confirm the partition table: `sudo fdisk -l /dev/nvme0n1`
- Check the file system: `sudo blkid /dev/nvme0n1p5`

### Permission problems
- Set the correct file permissions: `sudo chown -R $USER:$USER /mnt/mount_point`
- Check SELinux/AppArmor settings (if enabled)

### Symbolic link problems
- Create symbolic links with absolute paths
- Make sure the target directory exists and is accessible

## Further Reading

- [Linux disk management basics](https://wiki.archlinux.org/title/Device_file)
- [In-depth fstab configuration](https://wiki.archlinux.org/title/Fstab)
- [NTFS-3G mount options](https://manpages.ubuntu.com/manpages/focal/man8/mount.ntfs-3g.8.html)
