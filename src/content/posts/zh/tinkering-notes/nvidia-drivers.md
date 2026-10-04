---
title: 01 驱动装好了，但没有渲染：NVIDIA 在这台机器上的三种坏法
summary: >-
  同一块 RTX 5060 Ti、同一个 Ubuntu 22.04，坏过三次：内核更新后模块没重编（nvidia-smi
  直接报错）、驱动装成计算专用所以一切正常但画面走 CPU、以及把 iGPU 当成元凶找了几个月。三种坏法的共同点是：判断「谁在渲染」的那条命令不是
  nvidia-smi。
lang: zh
translationKey: nvidia-drivers
slug: nvidia-drivers
date: '2026-10-04'
series: tinkering-notes
seriesOrder: 1
tags:
  - 折腾
  - NVIDIA
  - GPU
status: preview
source: seasons/03-tinkering/01-nvidia-drivers.zh.md
syncedAt: '2026-10-04T11:40:53.362Z'
---
<!-- 草稿：素材来自 ubuntu_setup 的《旧版 iGPU 问题记录（复盘）》《NVIDIA GPU 与 CUDA 环境配置》，
     以及 android_gaming 里记录的两个宿主机缺陷。命令留在手册页，这里写判断过程。 -->

# 驱动装好了，但没有渲染

这台机器是 Ubuntu 22.04、i5-13500、31 GB 内存、RTX 5060 Ti，驱动是 NVIDIA 595.91.07 的开源内核模块。同样一块卡，我遇到过三种完全不同的坏法，而它们需要的排查方向完全不一样。

完整的环境配置和命令在手册里：[GPU 与 CUDA](/zh/docs/ubuntu/gpu/cuda/)。

## 一、内核更新之后：报错很直接

从 `6.8.0-85` 升到 `6.8.0-87` 之后，症状是明摆着的：

```console
$ nvidia-smi
NVIDIA-SMI has failed because it couldn't communicate with the NVIDIA driver.

$ sudo modprobe nvidia
modprobe: FATAL: Module nvidia not found in directory /lib/modules/6.8.0-87-generic
```

`ls /lib/modules` 里新内核的目录是有的，里面就是没有 `nvidia.ko`。

原因不神秘：NVIDIA 的 `.run` 安装包是把模块编进**当时那个内核**的，内核一换，目录还在，模块不在。修法是重新安装驱动让它针对当前内核重编，或者一开始就用 DKMS 托管。

这一段的具体步骤（含回滚）在 [CUDA 环境配置 § 内核更新后驱动问题](/zh/docs/ubuntu/gpu/cuda/) 里。

## 二、真正难查的那种：一切正常，但没有渲染

第二种是在做安卓模拟器时才暴露出来的，也是这三种里最贵的。

当时 `nvidia-smi` 输出完全正常，CUDA 能跑，`torch.cuda.is_available()` 返回 `True`——**只有渲染是坏的**。安装 `.run` 包时如果没勾 GLX/EGL 那几项，`libGLX_nvidia.so` 和 `libEGL_nvidia.so` 根本不会装上，系统于是回落到 `llvmpipe`：CPU 软件光栅化，能出画面，慢到不能用。

表现极具误导性：安卓系统起来了、界面能点、游戏一加载资源就停在启动画面。看起来像翻译层的问题，实际是根本没有 GPU。

一条命令就能定性：

```console
$ glxinfo -B | grep -E "OpenGL renderer|OpenGL vendor"
OpenGL vendor string: Mesa
OpenGL renderer string: llvmpipe (LLVM 15.0.7, 256 bits)
```

看到 `llvmpipe` 就是没在用卡。相关的症状和处置记在 [Linux 上的安卓游戏 § 排错](/zh/docs/android/trouble/) 里。

## 三、最贵的不是修，是判断

第三种严格说不是新的故障，是同一个故障被我诊断错了方向。

屏幕出现撕裂、闪烁、分辨率不对的时候，我的第一反应是"核显和独显在打架"。于是：把 nouveau 加进黑名单、改 `xorg.conf`、反复重装驱动、把显示器换到主板输出口上试。这些都留下了记录，也都没有解决问题。

最后的结论只有一句：**驱动没有针对当时的内核重新编译**——也就是第一种。见 [旧版 iGPU 问题记录（复盘）](/zh/docs/ubuntu/gpu/igpu-postmortem/)。

## 顺带一个更隐蔽的：工具来自另一个分支

这台机器上还有个没收拾干净的地方：`nvidia-settings` 的版本是 615.71.09，而驱动是 595.91.07。它们不是一条分支上的东西，工具会给出和实际驱动对不上的报错。它不致命，但足够让下一个人（包括三个月后的我）往错误方向走一段。

## 判断顺序

1. **先问"现在谁在渲染"**：`glxinfo -B`。`llvmpipe` 就直接说明没有 GPU 参与。
2. **再看模块属于哪个内核**：`uname -r` 对 `modinfo nvidia | grep ^filename`。
3. **最后才动配置**：`xorg.conf`、黑名单、显示器接线，这些在模块那一步就对不上的时候，改了也白改。
