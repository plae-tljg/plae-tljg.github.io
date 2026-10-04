---
title: 01 Three Ways the NVIDIA Driver Broke on This Machine
summary: >-
  One RTX 5060 Ti, one Ubuntu 22.04, three failures: a module not rebuilt after
  a kernel update, a compute-only install that silently fell back to software
  rendering, and months spent blaming the iGPU. The command that settles which
  one you have is not nvidia-smi.
lang: en
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
aiTranslated: true
source: seasons/03-tinkering/01-nvidia-drivers.en.md
syncedAt: '2026-10-04T14:43:38.332Z'
---
<!-- Draft: material comes from ubuntu_setup's "Legacy iGPU Problem Record (Postmortem)" and "NVIDIA GPU and CUDA Environment Configuration",
     plus the two host defects recorded in android_gaming. The commands stay on the manual pages; this piece is the judgement process. -->

# The driver installed, but nothing renders

This machine is Ubuntu 22.04, an i5-13500, 31 GB of RAM and an RTX 5060 Ti, and the driver is the NVIDIA 595.91.07 open kernel module. With the same card I have run into three completely different failures, and each of them needs a completely different direction of investigation.

The full environment setup and the commands are in the manual: [GPU and CUDA](/zh/docs/ubuntu/gpu/cuda/).

## 1. After a kernel update: the error is direct

Upgrading from `6.8.0-85` to `6.8.0-87`, the symptom is plain:

```console
$ nvidia-smi
NVIDIA-SMI has failed because it couldn't communicate with the NVIDIA driver.

$ sudo modprobe nvidia
modprobe: FATAL: Module nvidia not found in directory /lib/modules/6.8.0-87-generic
```

In `ls /lib/modules` the directory for the new kernel is there; `nvidia.ko` simply is not in it.

Nothing mysterious about it: NVIDIA's `.run` installer compiles the module into **the kernel that was running at the time**, so once the kernel changes the directory stays and the module is gone. The fix is to reinstall the driver so it recompiles against the current kernel, or to have it managed by DKMS from the start.

The concrete steps for this section (including rollback) are in [CUDA Environment Setup § driver problem after a kernel update](/zh/docs/ubuntu/gpu/cuda/).

## 2. The hard one to find: everything is fine, but nothing renders

The second one only surfaced while I was building the Android emulator, and it is the most expensive of the three.

At the time `nvidia-smi` output was completely normal, CUDA ran, and `torch.cuda.is_available()` returned `True` — **only rendering was broken**. If you don't tick the GLX/EGL items when installing the `.run` package, `libGLX_nvidia.so` and `libEGL_nvidia.so` never get installed at all, and the system falls back to `llvmpipe`: CPU software rasterization, which does put a picture on screen, slow enough to be unusable.

The behavior is misleading: the Android system boots, the interface responds to clicks, and the game stops at the splash screen the moment it starts loading assets. It looks like a problem in the translation layer; in fact there is no GPU involved at all.

One command settles it:

```console
$ glxinfo -B | grep -E "OpenGL renderer|OpenGL vendor"
OpenGL vendor string: Mesa
OpenGL renderer string: llvmpipe (LLVM 15.0.7, 256 bits)
```

If you see `llvmpipe`, the card is not being used. The related symptoms and what to do about them are recorded in [Android games on Linux § troubleshooting](/zh/docs/android/trouble/).

## 3. The expensive part is not the fix, it is the diagnosis

The third is not, strictly speaking, a new failure; it is the same failure that I diagnosed in the wrong direction.

When the screen tore, flickered and ran at the wrong resolution, my first reaction was "the integrated GPU and the discrete GPU are fighting". So I blacklisted nouveau, edited `xorg.conf`, reinstalled the driver over and over, and moved the monitor onto the motherboard output to try that. All of it left records, and none of it solved the problem.

The final conclusion fits in one sentence: **the driver had not been recompiled for the kernel of the time** — that is, the first kind. See [Legacy iGPU Problem Record (postmortem)](/zh/docs/ubuntu/gpu/igpu-postmortem/).

## One more, quieter: the tool comes from another branch

There is still one spot on this machine I never cleaned up: `nvidia-settings` is version 615.71.09 while the driver is 595.91.07. They are not from the same branch, so the tool produces error messages that don't line up with the actual driver. It is not fatal, but it is enough to send the next person (including me three months later) down the wrong direction for a while.

## Order of diagnosis

1. **First ask "who is rendering right now"**: `glxinfo -B`. `llvmpipe` says directly that no GPU is involved.
2. **Then check which kernel the module belongs to**: `uname -r` against `modinfo nvidia | grep ^filename`.
3. **Only then touch the configuration**: `xorg.conf`, the blacklist, monitor cabling — once the module step doesn't line up, changing these changes nothing.
