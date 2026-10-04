---
title: "旧版 iGPU 问题记录（复盘）"
summary: "> 注意：以下内容是之前遇到的问题，现在已经解决。保留此文件作为历史参考。"
lang: zh
translationKey: "ubuntu-gpu-igpu-postmortem"
slug: igpu-postmortem
track: ubuntu
stage: gpu
order: 2
date: 2026-01-04
tags: []
status: zh draft
source: plae-lkm/ubuntu_setup:docs/apps/gpu/old_igpu_problems.md
---
> 注意：以下内容是之前遇到的问题，现在已经解决。保留此文件作为历史参考。

## 之前的 iGPU 使用问题

### 背景

想要使用 CPU 的集成显卡（iGPU）作为显示输出，而不是使用独立 GPU，只是简单地将 DP 线从 4060 拔下，然后插到主板的 DP 端口。这可能导致了问题？

### 检查集成显卡是否工作

```bash
# 检查集成显卡是否在工作（虽然物理上我们已经知道不是 GPU 在工作）
lspci -k | grep -EA3 'VGA|3D|Display'
lspci | egrep 'VGA|3D'
```

可能看到的输出：

```bash
00:02.0 VGA compatible controller: Intel Corporation HD Graphics 620 (rev 02)
        Subsystem: Dell HD Graphics 620
        Kernel driver in use: i915
        Kernel modules: i915
```

检查 GPU 是否正确连接：

```bash
sudo apt install mesa-utils
glxinfo | grep -E "OpenGL vendor|OpenGL renderer"
```

应该看到：

```bash
OpenGL vendor string: NVIDIA Corporation
OpenGL renderer string: GeForce GTX 1650/PCIe/SSE2
```

### 之前的尝试

AI 建议使用：

```bash
sudo nano /etc/modprobe.d/blacklist-nouveau.conf
```

添加以下行到文件：

```bash
blacklist nouveau
options nouveau modeset=0
```

更新 initramfs 并重启：

```bash
sudo update-initramfs -u
sudo reboot now
```

### 尝试解决的问题

运行：

```bash
sudo apt purge '*nvidia*'
sudo apt purge '*cuda*'
sudo apt-get purge nvidia*
reboot now
sudo ubuntu-drivers autoinstall
reboot now
nvidia-smi
```

`nvidia-smi` 显示：

```bash
NVIDIA-SMI has failed because it couldn't communicate with the NVIDIA driver. Make sure that the latest NVIDIA driver is installed and running.
```

## 使用 iGPU 显示、GPU 计算的相关参考资料

以下是用于"iGPU 显示渲染和 GPU 计算"目的的参考资料。第一个参考资料中的方法已经测试过，可以工作。

<!--ref:/assets/cuda/use_integrated_graphics/Use integrated graphics for display and NVIDIA GPU for CUDA on Ubuntu 14.04.html-->
> 参考（第三方页面）：[Use integrated graphics for display and NVIDIA GPU for CUDA on Ubuntu 14.04](https://gist.github.com/alexlee-gk/76a409f62a53883971a18a11af93241b?permalink_comment_id=3102545)

<!--ref:/assets/cuda/use_integrated_graphics/osdf's log _ Intel Integrated Graphics, dedicated GPU for CUDA and Ubuntu 13.10 and 14.04.html-->
> 参考（第三方页面）：[Intel Integrated Graphics, dedicated GPU for CUDA and Ubuntu 13.10 and 14.04](https://osdf.github.io/blog/intel-integrated-graphics-dedicated-gpu-for-cuda-and-ubuntu-1310.html)

<!--ref:/assets/cuda/use_integrated_graphics/[SOLVED] Run CUDA on dedicated NVIDIA GPU while connecting monitors to Intel HD graphics, is this possible_ - CUDA _ CUDA Setup and Installation - NVIDIA Developer Forums.html-->
> 参考（第三方页面）：[[SOLVED] Run CUDA on dedicated NVIDIA GPU while connecting monitors to Intel HD graphics, is this possible?](https://forums.developer.nvidia.com/t/solved-run-cuda-on-dedicated-nvidia-gpu-while-connecting-monitors-to-intel-hd-graphics-is-this-possible/47690)

<!--ref:/assets/cuda/use_integrated_graphics/drivers - How to configure iGPU for xserver and nvidia GPU for CUDA work - Ask Ubuntu.html-->
> 参考（第三方页面）：[Ask Ubuntu - How to configure iGPU for xserver and nvidia GPU for CUDA work](https://askubuntu.com/questions/1061551/how-to-configure-igpu-for-xserver-and-nvidia-gpu-for-cuda-work)

<!--ref:/assets/cuda/use_integrated_graphics/Using GPU for CUDA and integrated graphics for display - can't make it work - CUDA _ CUDA Setup and Installation - NVIDIA Developer Forums.html-->
> 参考（第三方页面）：[Using GPU for CUDA and integrated graphics for display - can't make it work ](https://forums.developer.nvidia.com/t/using-gpu-for-cuda-and-integrated-graphics-for-display-cant-make-it-work/49820)

<!--ref:/assets/cuda/How to make desktop Ubuntu boot in headless mode_ - Deep Learning - fast.ai Course Forums-->
> 参考（第三方页面）：[Using GPU for CUDA and integrated graphics for display - can't make it work ](https://forums.fast.ai/t/how-to-make-desktop-ubuntu-boot-in-headless-mode/19582/4?replies_to_post_number=4)

## 之前的问题总结

使用 `--no-opengl-files` 安装后，`nvidia-smi` 最初工作正常，但几周后出现了同样的问题。

最终必须将 DP 线插回 GPU 而不是主板。希望之后不会再有问题。

![CUDA Fail Again](/ubuntu/cuda/cuda_fail_again.png)

```
          _————             +--------------------------------------+  
         //¯¯\\\\           |    _  _     _    _ _                 |  
        // _  _\\           |   | \| |_ _(_)__| (_)__ _            |  
        \|(0)(0)\           |   | .` \ V / / _` | / _` |_          |  
        d  n ¨  b           |   |_|\_|\_/|_\__,_|_\__,_( )         |  
         \_U_^  /           |                          |/          |  
         /   \_/|_____      |       Nvidia,                        |  
      ___\   |__/\    \_    |          Fuck you!                   |  
     /   |   / |:|      \   |   ___        _                   _   |  
    /    /  /\ |:|     | \  |  | __|  _ __| |__  _  _ ___ _  _| |  |  
   |    /\__/ \|:\     |  \ |  | _| || / _| / / | || / _ \ || |_|  |  
    \  /\   / ||: \    \  | |  |_| \_,_\__|_\_\  \_, \___/\_,_(_)  |  
     \/  \_/  ||: |     |  \|                    |__/              |  
     /     /  //; \     |  |+--------------------------------------+  
     \    /  /|;   \    |  \  
```

## 解决方案

问题的根本原因是驱动没有针对新内核编译。这实际上与 iGPU 无关。

解决方案是重新安装驱动，这样它就会针对当前的内核进行编译。
