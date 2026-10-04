---
title: 02 把 FGO 国服搬上 Ubuntu：十二个死胡同和一个版本号
summary: >-
  两天里试过容器、houdini、十六进制补丁，最后让它跑起来的变量只有一个：Android 16.0 rev 7 的系统镜像。它的 ARM
  翻译器不触发那条栈指针断言——问题从来不在显卡，也不在反外挂。
lang: zh
translationKey: android-games
slug: android-games
date: '2026-10-04'
series: tinkering-notes
seriesOrder: 2
tags:
  - 折腾
  - Android
  - Linux
  - 模拟器
status: preview
source: seasons/03-tinkering/02-android-games.zh.md
syncedAt: '2026-10-04T11:31:22.855Z'
---
<!-- 草稿：英文长稿在 android_gaming/docs/02-STORY.md（27 KB），这里只留主线与结论；
     每一步的命令、参数、自检方法都已经收进手册的《Linux 上的安卓游戏》两条 track 里。 -->

# 把 FGO 国服搬上 Ubuntu

目标很朴素：在这台 Ubuntu 上跑 FGO 国服，顺带明日方舟。之前已经失败过三轮——Genymotion、Bliss OS、以及 Android Studio 自带的模拟器。

两天之后它跑起来了，而且**没有改任何系统文件**：原始镜像、零补丁、不装 houdini。真正让它跑起来的变量只有一个——系统镜像的版本。

## 先修机器，再谈方案

动手之前，宿主机自己有两个坑：

1. **当前用户不在 `kvm` 组。** `kvm_intel` 已经加载，`/dev/kvm` 也在，但当前用户读不到——模拟器只能退化成纯软件模拟，慢到没法判断任何问题。
2. **NVIDIA 驱动装成了计算专用。** `nvidia-smi` 一切正常，CUDA 也能跑，但 `libGLX_nvidia` / `libEGL_nvidia` 根本没装，客人实际是用 `llvmpipe` 在画图。表现是：安卓能启动、能点、游戏一加载资源就停住。

第二个坑特别值得写下来，因为它会让后面所有实验的结论都失真——你会以为是翻译层的问题，其实是根本没有 GPU。判断方法只有一行：`glxinfo -B`，看到 `llvmpipe` 就是没在用卡。

## 对照组：明日方舟先跑起来了

修完这两处，先用 Android 35 的 `pixel_gaming` AVD 试明日方舟：下载了 15 GB 资源，打完一场，零崩溃。

这条对照极其重要。它证明**同一套机制是能用的**——那么 FGO 的问题就只可能出在 FGO 自己身上，而不是"Linux 跑不了安卓游戏"这种笼统结论。后面每一次失败，我都是拿它来校准的。

## 51 秒

FGO 在同样的 AVD 上，每次都在 **51 秒左右**死掉，稳定复现：

```
F berberis: Guest call didn't restore sp: expected 0x…fd0, actual 0x…fc0
F libc: Fatal signal 6 (SIGABRT)
```

`berberis` 是这套镜像里的 ARM 翻译层。它的 `ExecuteGuestCall` 要求客人返回时**栈指针逐字节还原**，而 FGO 差了整整 `0x10`。这不是配置问题，是一个断言，而且当时能拿到的三个 API 35 的 libndk 构建都带这条检查。

## 走过的地方

两天里试过并且记下来的死胡同，大致分四类：

- **容器路线**：redroid（Docker 里跑安卓）配 Intel houdini，UNITY 起来了但一个核被忙等吃满，画面停在启动页——容器在 NVIDIA 上拿不到 GPU。Waydroid 更直接：它的源码里写死了 `unsupported = ["nvidia"]`，因为安卓是 bionic libc，而 NVIDIA 的用户态驱动只有 glibc 版。
- **移植翻译层**：把 houdini 塞进 AVD，它自己的 loader 里就 `SIGSEGV`。
- **改二进制**：给那条断言打了个一字节的补丁，结果改到了 `int3` 填充里；把 16.1 的 berberis 换进去，报错变成警告，但游戏卡住。
- **换镜像**：Android 16.1 的镜像在开机时断言循环 48–72 次；16 KB page 的镜像会让 FGO 的反外挂 `libtersafe2.so` 挂掉（`DT_GNU_HASH`）。

还有一类是**方向性错误**，值得单独说：Wine / Proton / box64 / FEX 都帮不上忙。它们翻译的是 Windows 或别的指令集，而这里需要的是一个实现了 `NativeBridgeItf` 的安卓翻译层——没有这个东西，谁都快不起来。

## 一个版本号

最后起作用的是一个变量：把系统镜像换成 **Android 16.0（API 36）rev 7**，`google_apis`，x86_64，**原版、零修改**。它的翻译层是 berberis 16.0.0，不触发那条断言。

AVD 参数：8 GB 内存、6 核、32 GB 数据分区、`pixel_7`，启动加 `-gpu host -accel on -no-boot-anim`，并且**不加** `-writable-system`（加了反而会让镜像不再是原版）。FGO 装进去、首启按两下、下载 1.9 GB 资源，然后就是登录界面。

代价是实测出来的，不是猜的：约 107% 单核占用、13 GB 常驻内存、GPU 占用 14%、显存 1.5/16 GB、帧时间中位数 16 ms、39% 的帧被判为卡顿。能玩，不轻松。

## 反外挂不是原因

FGO 国服带腾讯 ACE（`libtersafe2.so` + `libtprt.so`）。在动手之前，我几乎认定它就是拦路的那一个。结果不是：它没有拦任何东西，而且它也删不掉——静态 `<clinit>` 一开始就会跑。

但有一句必须写在明处：**判定在服务端**。本地能跑起来，不代表账号安全，这条路上没有"确认没问题"这回事。

## 留下的东西

- 一套可复现的配置与自检命令：手册的《方案与配置》
- 每一条症状的查法，包括十一个假警报：手册的《排错》
- 以及这篇文章想说的那句话：**死胡同也要写下来**。这次省下时间最多的，不是哪个成功步骤，而是别人早就记录过的那几个失败方向。
