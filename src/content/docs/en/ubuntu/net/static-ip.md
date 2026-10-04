---
title: "How to set a static IP on Ubuntu (temporary and permanent methods)"
summary: "This page records how to set a static IP on Ubuntu, including the temporary and the permanent way, plus fixes for common failures such as DNS not resolving."
lang: en
translationKey: "ubuntu-net-static-ip"
slug: static-ip
track: ubuntu
stage: net
order: 1
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/dev/internet/static_ip.md
aiTranslated: true
---
This page records how to set a static IP on Ubuntu, including the temporary and the permanent way, plus fixes for common failures such as DNS not resolving.  

---

## 1. Change the IP temporarily (current session only)

It is lost after a reboot, so it suits testing or emergencies.  

**1. Check the NIC name on this machine**  

```bash
ip a         # 找到类似 enp0s3 或 eth0 的网卡名
```

**2. Check the current IP of that NIC**  

```bash
ip addr show dev enp0s3
```

> Remember to replace `enp0s3` with your real NIC name, e.g. `eth0`  

**3. Remove the existing IP (if any)**  

```bash
sudo ip addr del 192.0.2.120/24 dev enp0s3
```

**4. Add the new static IP**  

```bash
sudo ip addr add 192.0.2.114/24 dev enp0s3
```

**5. Add the default gateway (if your gateway is 192.0.2.1)**  

```bash
sudo ip route add default via 192.0.2.1 dev enp0s3
```

> If you often swap machines/VMs, the NIC name may also be `eth0`; change the command to:
> `sudo ip route add default via 192.0.2.1 dev eth0`

**Temporary fix when DNS does not resolve**  

If you get "can ping 8.8.8.8 but can't reach the internet / resolve domain names" (e.g. after a long uptime without a reboot), the usual cause is a missing default route or no DNS:  

- First check whether a default route exists  

```bash
ip route | grep default
```

- If there is no default route, add one temporarily (say the NIC is eth0):  

```bash
sudo ip route add default via 192.0.2.1 dev eth0
```

  > Replace `eth0` with your real NIC name. The same applies to enp0s3/ens33, etc.  

- If DNS is not configured, you can also add it in `/etc/resolv.conf`, effective temporarily:  

```bash
sudo bash -c "echo 'nameserver 8.8.8.8' > /etc/resolv.conf"
sudo bash -c "echo 'nameserver 223.5.5.5' >> /etc/resolv.conf"
```

---

## 2. Configure the static IP permanently (recommended)

Recommended for long-term needs such as servers: configure it once and it survives a reboot.  

1. **Edit the Netplan configuration file**

(New Ubuntu uses Netplan by default; the filename is an example: `/etc/netplan/01-network-manager-all.yaml`, in practice it may differ.)  

```yaml
network:
version: 2
renderer: NetworkManager
ethernets:
    enp0s3:                   # 注意替换为你的网卡名
    dhcp4: no
    addresses:
        - 192.0.2.114/24   # 你的静态 IP 和掩码
    gateway4: 192.0.2.1  # 默认网关
    nameservers:
        addresses: [8.8.8.8, 223.5.5.5]
```

2. **After saving, set the permissions (optional)**  

    ```bash
    sudo chmod 600 /etc/netplan/01-network-manager-all.yaml
    sudo chown root:root /etc/netplan/01-network-manager-all.yaml
    ```

3. **Apply the configuration**  

```bash
sudo netplan apply
```

Or test first with `sudo netplan try`, which rolls back automatically within 120 seconds if you do not confirm.

---

**Common notes:**  

- Every `enp0s3` or `eth0` above must be replaced with your real NIC name.  

- When done, use `ip addr` to view the IP, `ip route` to check the routes, and `cat /etc/resolv.conf` to check DNS.  

- A server with several NICs can keep adding more NIC entries in the same format.  

- If you used `renderer: NetworkManager`, manage it with the desktop tool NetworkManager or `nmcli`.  

**References**  

[https://www.freecodecamp.org/news/setting-a-static-ip-in-ubuntu-linux-ip-address-tutorial/](https://www.freecodecamp.org/news/setting-a-static-ip-in-ubuntu-linux-ip-address-tutorial/)
