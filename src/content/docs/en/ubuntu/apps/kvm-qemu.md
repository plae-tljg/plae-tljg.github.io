---
title: "KVM/QEMU VM Configuration and Migration"
summary: "This page covers basic KVM/QEMU commands, common management operations, converting VirtualBox disks, bridged networking, and shared folder setup between host and VMs."
lang: en
translationKey: "ubuntu-apps-kvm-qemu"
slug: kvm-qemu
track: ubuntu
stage: apps
order: 17
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/apps/common/vm/kvm_qemu.md
aiTranslated: true
---
This page covers basic KVM/QEMU commands, common management operations, converting VirtualBox disks, bridged networking, and shared folder setup between host and VMs.

---

## 1. Basic KVM/QEMU management commands

Below are some common commands for managing VM instances.

**List all VMs:**
```bash
virsh list --all
```

**Start a VM (using myvm as an example):**
```bash
virsh start myvm
```

**Shut down a VM:**
```bash
virsh shutdown myvm
```

**Force shut down a VM:**
```bash
virsh destroy myvm
```

**Open the VM console:**
```bash
virsh console myvm
```

**Edit the VM definition (XML):**
```bash
virsh edit myvm
```

**Delete a VM (keeps the disk; be careful):**
```bash
virsh undefine myvm
```

---

## 2. Installing required tools

A KVM/QEMU host generally needs the following tools installed:

```bash
sudo apt update
sudo apt install qemu-utils virt-manager bridge-utils
```

* `qemu-utils`: QEMU-related tools, such as disk format conversion and image management  
* `virt-manager`: graphical VM manager  
* `bridge-utils`: bridged networking support tools   

---

## 3. Converting a VirtualBox VDI disk to QCOW2

If you have a VirtualBox `.vdi` image file, you can convert it to the QEMU/QCOW2 format like this:  

```bash
qemu-img convert -f vdi -O qcow2 /path/to/your/virtualbox_vm.vdi /path/to/new_vm.qcow2
```

- `/path/to/your/virtualbox_vm.vdi`: path of the original VDI image file  
- `/path/to/new_vm.qcow2`: path of the output QCOW2 file  

---

## 4. Bridged networking configuration

Using bridged networking lets the VM get an IP on the same subnet as the physical host, which makes access easier. The example below assumes the physical NIC is `enp4s0`, the bridge will be `br0`, and the static IP is `192.0.2.114`.  

Edit the netplan config file (e.g. `/etc/netplan/01-netcfg.yaml`) with the following contents:  

<!--code:title=Bridged Networking · /lib/kvm_qemu/01-netcfg.yaml-->
```yaml
  version: 2
  renderer: NetworkManager  # Change this if you need GUI management
  ethernets:
    enp4s0:
      dhcp4: no
      dhcp6: no
  bridges:
    br0:
      interfaces: [enp4s0]
      dhcp4: no
      addresses: [192.0.2.114/24]
      routes:
        - to: default
          via: 192.0.2.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
      parameters:
        stp: true
        forward-delay: 4
```

Apply the new network configuration and check it:

```bash
sudo netplan apply

# 查看 bridge 是否建立
sudo brctl show br0

# 查看 br0 的 IP 配置
ip addr show br0
```

---

## 5. Shared folders on the VM (virtiofs)

KVM supports efficient host-to-VM shared folders via `virtiofs`. Assume both the host and the VM have prepared the `/home/lkm/00shared` directory.

### Permissions

> **Recommendation**: to avoid permission issues, you can temporarily give maximum read/write permissions to the corresponding directory on both the host and the VM:
>
> Run on both the host and inside the VM (in production, adjust permissions as needed; do not use this for sensitive directories):
> ```bash
> sudo chmod 777 /home/lkm/00shared
> ```

### Mounting the shared folder

Mount it inside the VM:

```bash
# inside VM
sudo mount -t virtiofs /home/lkm/00shared /home/lkm/00shared
```

### Auto-mount at boot

Edit `/etc/fstab`:

```bash
sudo nano /etc/fstab
```

Add the following line to auto-mount the virtiofs shared directory (assuming both the share name and the mount point are `/home/lkm/00shared`):

```bash
/home/lkm/00shared /home/lkm/00shared  virtiofs  defaults,_netdev  0  0
```

> Note: make sure the virtiofs device was added when the VM was created and started. See [libvirt documentation](https://wiki.libvirt.org/guestfs-and-virtiofs.html) or the virt-manager graphical settings for details.

---

For more detailed tutorials, see the [official KVM/QEMU documentation](https://wiki.qemu.org/Documentation) or the [netplan network configuration example](/lib/kvm_qemu/01-netcfg.yaml) included in this repo.
