---
title: 02 把 FGO 国服搬上 Ubuntu：十二个死胡同和一个版本号
summary: >-
  两天里试过 redroid、Waydroid、houdini 移植、十六进制补丁；最后让它跑起来的是一个系统镜像版本。失败的根因是 berberis
  0.2.3 的一条栈指针断言，FGO 差了 0x10。完整配置与排错在手册里。
lang: zh
translationKey: android-games
slug: android-games
date: '2026-10-04'
series: tinkering-notes
seriesOrder: 2
tags:
  - 折腾
  - Android
  - 模拟器
  - Linux
status: preview
source: seasons/03-tinkering/02-android-games.zh.md
syncedAt: '2026-10-04T11:40:53.363Z'
---
<!-- 草稿：英文长稿在 android_gaming/docs/02-STORY.md。这一版只留主线 + 可核对的细节，
     命令、参数、自检与 60 条症状索引都在手册里：
     /zh/docs/android/solution/ 与 /zh/docs/android/trouble/ -->

# 把 FGO 国服搬上 Ubuntu

目标很具体：在这台 Ubuntu 22.04（i5-13500 / 31 GB / RTX 5060 Ti / X11）上跑 FGO 国服 `com.bilibili.fatego` v2.129.0。之前已经失败过三轮：Genymotion、Bliss OS、Android Studio 自带模拟器。

两天后它跑起来了，而且**没有改任何系统文件**：原始镜像、零补丁、不装 houdini。完整配置、命令和自检方法在手册的 [方案与配置](/zh/docs/android/solution/)；按症状查在 [排错](/zh/docs/android/trouble/)。

## 先修宿主机，否则后面每一步的结论都是假的

动手之前宿主机自己有两个坑：

1. **当前用户不在 `kvm` 组。** `kvm_intel` 已加载、`/dev/kvm` 也在，但当前用户读不到，模拟器退化成纯软件模拟。这一条不修，后面所有"卡"都分不清是翻译层的问题还是根本没有硬件加速。
2. **NVIDIA 驱动装成了计算专用。** `nvidia-smi` 正常、CUDA 能跑，但 `libGLX_nvidia` / `libEGL_nvidia` 没装，客人实际用 `llvmpipe` 画图。表现是：安卓能启动、能点，游戏一加载资源就停在启动页。

第二条尤其值得写下来，因为它会让所有实验的结论失真——你会以为是翻译层不行，其实是根本没有 GPU。判断只要一行 `glxinfo -B`，详见另一篇：[驱动装好了，但没有渲染](/zh/writing/nvidia-drivers/)。

## 对照组：明日方舟先跑起来了

修完这两处，先用 API 35 的 `pixel_gaming` AVD（`google_apis_playstore`，16 GB 内存 / 100 GB 数据分区）试明日方舟：下载 15 GB 资源、打完一场、**0 崩溃**。

这条对照的价值在于它把结论收窄了：同一套机制能用，那问题就只可能在 FGO 这一侧，而不是"Linux 跑不了安卓游戏"。后面每次失败我都拿它校准——这也是为什么我没有继续在容器方案上投入。

## 51 秒

FGO 在同样的 AVD 上，每次都在 51 秒左右死掉，稳定复现：

```console
F berberis: Guest call didn't restore sp: expected 0x…fd0, actual 0x…fc0
F libc    : Fatal signal 6 (SIGABRT) … pid … (bilibili.fatego)
```

`berberis` 是这套镜像里的 ARM 翻译层。它的 `ExecuteGuestCall` 要求客人返回时栈指针**逐字节还原**，而 FGO 差了整整 `0x10`。这不是配置问题，是一条断言；当时能拿到的三个 API 35 的 libndk 构建都带这条检查。

## 走过的地方，以及它们各自的签名

- **容器**：redroid（Docker 里跑 Android 13）配 Intel houdini，Unity 起来了，但 `UnityMain` 忙等吃满一个核，画面停在启动页——容器在 NVIDIA 上拿不到 GPU。Waydroid 更直接，源码里写死了 `unsupported = ["nvidia"]`（`tools/helpers/gpu.py`），原因是 ABI：Android 是 bionic libc，NVIDIA 的用户态驱动栈只有 glibc 版。
- **移植翻译层**：把 houdini 塞进 AVD，它自己的 loader 里就 `SIGSEGV`（`s_000067+1227`，`Fatal error (ID:0x01900158)`），换另一个 libndk 构建也一样。
- **改二进制**：给那条断言打一字节补丁，打进了 `int3` 填充；把 16.1 的 berberis 换进来，报错变成警告 `Trying to restore sp and continue...`，但游戏卡在 ACE/登录交接处。
- **换镜像**：Android 16.1 在开机时 SurfaceFlinger 断言循环（`!rcEnc->featureInfo()->hasReadColorBufferDma`）；16 KB page 的镜像让 ACE 的 `libtersafe2.so` 直接 `dlopen failed: empty/missing DT_HASH/DT_GNU_HASH`；往 `/system` 里拷 `libnbaio.so` / `libnblog.so` 会让系统起不来。

还有一类是**方向性错误**：Wine / Proton / box64 / FEX 都帮不上忙。它们翻译的是 Windows API 或别的指令集，而这里需要的是一个实现了 `NativeBridgeItf` 的安卓 ARM 翻译层——Android 的模拟器还明确拒绝在 x86_64 主机上跑 `arm64` 客人（`PANIC: Avd's CPU Architecture 'arm64' is not supported by the QEMU2 emulator on x86_64 host`），这是策略，不是 bug。

## 起作用的那一个变量

把系统镜像换成 **`system-images;android-36;google_apis;x86_64`（Android 16.0 rev 7，userdebug）**，原版、零修改。它的翻译层是 berberis **16.0.0**（`libndk_translation.so`，sha256 `fbadc774c989534a…`，5,403,704 字节），不触发那条断言。

配置：AVD `api36`，8 GB 内存 / 6 核 / 32 GB 数据分区，设备 profile `pixel_7`，模拟器 37.3.2，启动参数 `-gpu host -accel on -no-boot-anim`，并且**不加** `-writable-system`——加了会激活上一次拷进 `/system` 的东西（这台机器上恰好是失败的 16.1 移植，`af88b2c1…`，会让游戏卡在登录）。

有个怪癖值得先知道：全新安装、还没有游戏数据时，首启可能仍然崩一次（同样的 `restore sp`，同样的 51 秒）。重开让它继续下载就好，之后几小时运行里 0 次 `restore sp`、0 次致命信号。**一次早崩是首启现象，不是死胡同。**

代价是实测的：模拟器进程约 **107%** 单核占用、常驻内存约 **13 GB**（31 GB 主机、8 GB 的 AVD）、GPU 占用 14%、显存 1.5/16 GB、帧时间 50 分位 16 ms、90 分位 65 ms，66 个采样里 **39%** 判为卡顿。结论是能玩，但瓶颈在 CPU 翻译 ARM64，不在画质设置。

## 反外挂不是原因

FGO 国服带腾讯 ACE（`libtersafe2.so` 5,608,784 字节 + `libtprt.so`）。动手之前我几乎认定它就是拦路的那一个。结果它没有拦任何东西，而且删不掉——静态 `<clinit>` 一开始就会跑。

但有一句要写在明处：**判定在服务端**。本地跑起来不等于账号安全，这条路上没有"确认没问题"这回事。

## 附注：libhoudini 的「定时炸弹」[^houdini]

社区里的说法是"houdini 到 9.1 以后就不能用"，听起来像过期检查。实际是 hpe-14 构建里一个硬编码的计数器比较，附近没有任何取时间的调用：

```asm
83 3d bf ac 76 00 02      cmp DWORD PTR [rip+0x76acbf], 0x2
0f 83 68 0d 00 00         jae 0xe6df3
```

修法是把这条 `jae` 六字节 NOP 掉（64 位偏移 `0xe6085`，32 位 `0x8a29a`）——**但这两个偏移只对那一个构建有效**，套到别的构建上会改坏别的地方。这也是我没有在这台机器上打这个补丁的原因：这里的 houdini 不是 hpe-14。

另外还有一段没被广泛记录的：houdini 会用 `tkill(gettid(), SIGILL)` 主动杀掉自己（signal 4、`SI_USER`，即人为发送）。触发条件是**符号链接拓扑**被动过——逐字节相同的内容摊成四个普通文件就崩，恢复成原版符号链接布局就正常。**拓扑，不是内容。** 任何把它打包成 Magisk 模块或 overlay 的做法，只要顺手把符号链接解成普通文件，就会得到一个必然崩溃的 houdini，而文件内容上看不出任何问题。

[^houdini]: 依据两份公开的逆向工作（`itstaftaf/houdini-timebomb-fix`、`Vvamp/Libhoudini-hpe-14-timebomb-patch`），以及本项目在 `docs/02-STORY.md` §3.2 与 `docs/research/` 里的复现记录。

## 为什么把死胡同也写下来

这两天里省时间最多的不是哪个成功步骤，而是别人早就记录过的失败方向——Waydroid 在 NVIDIA 上不支持、ARM64 客人会被拒绝、16.1 的 SurfaceFlinger 有问题。所以手册里那页[排错](/zh/docs/android/trouble/)是刻意做长的：**现象 → 层次 → 原因 → 处理**，外加十一个假警报。
