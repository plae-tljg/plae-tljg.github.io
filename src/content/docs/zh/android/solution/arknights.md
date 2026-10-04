---
title: "同一台机器上的明日方舟"
summary: "根本没问题。它跑在自己的 AVD 上，并没有迁移到 Android 16 基础环境——这份文档原样记录下当前可用的配置，留给以后用。"
lang: zh
translationKey: "android-solution-arknights"
slug: arknights
track: android
stage: solution
order: 2
date: 2026-10-04
tags: []
status: zh draft
source: android_gaming:docs/05-ARKNIGHTS.md
aiTranslated: true
---
*这个项目里的第二款游戏，也是证明了 ARM 翻译路线**确实可行**的**对照案例**。它跑在自己的 AVD
上，**不会**迁移到 Android 16 基础环境——这份文档原样记录下当前可用的配置，留给以后用。*

包名：`com.hypergryph.arknights`（仅 ARM64）· 状态：✅ **完全可玩**

---

## 1. 实测结果

| 项目 | 证据 |
|---|---|
| 游戏进程存活且在前台 | `com.hypergryph.arknights` pid 2876，Activity `com.u8.sdk.U8UnityContext`，**连续 18 分 22 秒** |
| 资源完整下载 | 游戏数据 **14,975 MB（约 15 GB）** |
| 真的玩过了 | 打完一场战斗的截屏——**任务失败 / MISSION FAILED**（`evidence/fgo-work/arknights.png`） |
| 稳定性 | 整轮运行下来**没有致命信号、没有 ANR、没有 `restore sp` 断言** |
| 翻译下的 ABI | `primaryCpuAbi=arm64-v8a` |
| 渲染 | guest 里的 GLES 报告的是真实 GPU：`(NVIDIA GeForce RTX 5060 Ti/PCIe/SSE2)` |

最后这一行从史料角度看才是关键：明日方舟能跑，**而当时 FGO 在完全相同的 AVD 上、用完全相同的原版
桥接层正在失败**——正是这件事把「Linux 跑不了这些游戏」变成了「FGO 触发了翻译器的某个具体 bug」
（见 `02-STORY.md` §5）。

---

## 2. 可用的配置（不要改）

| 项目 | 值 |
|---|---|
| AVD | **`pixel_gaming`**（`~/.android/avd/pixel_gaming.avd/`） |
| 系统镜像 | `system-images;android-35;google_apis_playstore;x86_64`——**Android 15（API 35）**，`user` 版 |
| ABI | guest 为 `x86_64`，游戏走 ARM 翻译 |
| 内存 / 堆 | **16384 MB** / `vm.heapSize=1024` |
| 核心数 | `hw.cpu.ncore=8`（模拟器会压到 6） |
| 数据分区 | **100 GB**（光游戏就占约 15 GB） |
| GPU | `hw.gpu.mode=host` → 真正的 NVIDIA GLES |
| 原生桥接 | 镜像自带的**原版** `libndk_translation.so`，**berberis 0.2.3**，BuildID `3bdce8491a367d18e6b73dc5f0f90ffa`，sha256 `5c88c04fe52eeb8d…`，3,612,288 B——`tools/bridges/current.so` 留了一份副本 |
| 改动 | **没有**——没有 `-writable-system`，没有替换翻译器，没有 houdini |

启动方式与 FGO 的 AVD 完全一样：

```bash
SDK=$ANDROID_SDK
$SDK/emulator/emulator -avd pixel_gaming -gpu host -accel on -no-boot-anim
# 或者在 Android Studio 的 Device Manager 里点 "pixel_gaming" 右边的 ▶
```

⚠️ **一次只开一个模拟器。**明日方舟的 AVD 要 16 GB，FGO 的 AVD 要 8 GB；开好几个模拟器再
加一个浏览器，第 1 次会话里就因为这个触发了 OOM kill（`lmkd`），表现却像是随机崩溃。
这里的 16 GB 设置是在那次事故期间被砍到 6 GB 之后，于 2026-10-04 恢复的
（`04-CLEANUP.md` §7）。

---

## 3. 为什么它能跑（以及这件事为什么重要）

明日方舟只有 ARM64 版本，所以它考验的正是 FGO 所用的同一套机制：

```
com.hypergryph.arknights  (arm64-v8a .so files)
        │
        ├── x86_64 Android system runs natively (full speed)
        ├── the game's ARM64 code is translated in-process by
        │   libndk_translation.so  ("berberis"), selected by
        │   ro.dalvik.vm.native.bridge
        └── real GPU via -gpu host
```

三个条件必须同时成立——CPU 侧的 KVM、完整的 NVIDIA **图形**栈（不只是 CUDA）、以及翻译器
确实支持 ARM64 的镜像。这三点都写在 `01-SOLUTION.md` §1–2，因为两款游戏是共通的。

明日方舟证明的是反面结论：它**带着和 FGO 同一个 ACE 反作弊家族**照样能跑
（它的 manifest 里有 9 项与 ACE 相关的条目，`libtersafe2.so` / `libtprt.so` 都在）。所以当 FGO
报 `berberis: Guest call didn't restore sp` 而死时，ACE 可以被排除——问题必然出在 FGO 自己的
ARM64 代码路径上，它们触发了翻译器的栈不变式（`02-STORY.md` §3.3、§5）。

**明日方舟从来没有碰到那个不变式。**在同一套桥接层、同一个 AVD 上，它完成了下载、进了一场
战斗并打完。

---

## 4. 反作弊备注（与 FGO 同属 ACE 家族）

| 问题 | 答案 |
|---|---|
| 明日方舟带 ACE 吗？ | 带——manifest 里有 ACE 条目，`libtersafe2.so` + `libtprt.so` 都能正常加载 |
| 它会拦模拟器吗？ | **实测不会**——它在这个原版 AVD 上打完了战斗 |
| ACE 的 worker 进程反复崩溃有关系吗？ | **没有**——`GP7Service`/`GP7Worker` 重启不影响主进程（同样的循环也出现在玩得一切正常的 FGO 运行里——`03-TROUBLESHOOTING.md` 5.3） |
| ACE 能去掉吗？ | **不能**——它是从静态初始化器（`AceApplication.<clinit>`）加载的；把这些库清空会立刻抛 `UnsatisfiedLinkError`。别试 |
| 风险 | 判定是**在服务端**做的。ToS 里没有点名模拟器，但封号针对的是 RMT / mods / 24 小时自动化。就用一个你亏得起的账号正常玩 |

---

## 5. 万一需要重建这个 AVD

动手清空之前，有两件事要清楚：

1. **我们没有保留明日方舟的 APK。**`assets/` 里只有 FGO 的客户端。`pixel_gaming` 里的
   那个游戏是在这个 AVD 内部安装的，它那 15 GB 资源存放在
   `~/.android/avd/pixel_gaming.avd/userdata-qemu.img.qcow2`（**占盘 44 GB**）。**丢了这个文件就
   意味着重新下载并重装游戏**——所以任何重置之前先备份，也永远不要去「清理」这个
   AVD 目录。
2. **重装路线：**这个 AVD 用的是 **Play Store** 镜像，所以最简单的路径是在模拟器里从
   Play Store 安装（用一个 Google 账号登录；如果 Play 保护有意见，就到
   `google.com/android/uncertified` 注册这台设备）。也可以侧载你自己搞到的 APK；
   这个 AVD 的 `abilist` 是 `x86_64,arm64-v8a`，所以 `arm64-v8a` 的包能装上并被翻译。

最简重建步骤（真到了非做不可的时候）：

```bash
SDK=$ANDROID_SDK
# 1) image + AVD (keep API 35 — it is the configuration that works here)
$SDK/cmdline-tools/latest/bin/sdkmanager "system-images;android-35;google_apis_playstore;x86_64"
$SDK/cmdline-tools/latest/bin/avdmanager create avd -n pixel_gaming \
    -k "system-images;android-35;google_apis_playstore;x86_64" -d pixel_7
# 2) size it — the defaults (2 GB RAM / 2 GB data) cannot hold this game
CFG=~/.android/avd/pixel_gaming.avd/config.ini
sed -i 's/^hw.ramSize=.*/hw.ramSize=16384/; s/^hw.cpu.ncore=.*/hw.cpu.ncore=8/;
        s/^disk.dataPartition.size=.*/disk.dataPartition.size=100G/;
        s/^hw.gpu.enabled=.*/hw.gpu.enabled=yes/; s/^hw.gpu.mode=.*/hw.gpu.mode=host/' $CFG
# 3) boot, sign into Play Store, install Arknights, let it download ~15 GB
$SDK/emulator/emulator -avd pixel_gaming -gpu host -accel on -no-boot-anim
```

备份 / 保持健康：

```bash
# the whole AVD is the save: back this directory up (60 GB) before any reset
du -sh ~/.android/avd/pixel_gaming.avd
# when it is NOT running, a cold copy is enough:
rsync -a --info=progress2 ~/.android/avd/pixel_gaming.avd/ /path/to/backup/pixel_gaming.avd/
```

---

## 6. 健康检查（看起来不对劲的时候跑一下）

```bash
export PATH=$PATH:$ANDROID_SDK/platform-tools
adb devices -l                                   # expect emulator-5554 with the game's AVD
adb shell getprop ro.build.version.sdk           # 35
adb shell getprop ro.dalvik.vm.native.bridge     # libndk_translation.so
adb shell dumpsys SurfaceFlinger | grep -m1 '^GLES'   # must name the NVIDIA GPU, not llvmpipe
adb shell ps -A | grep hypergryph                # process alive?
adb logcat -d | grep -cE "Fatal signal|ANR in"   # want 0
```

如果 `GLES` 显示的是 `llvmpipe`，说明宿主机图形栈又坏了——先把那个修好
（`03-TROUBLESHOOTING.md` 1.2），因为那样的话*所有东西*都会变慢，不只是这一个游戏。（第 1 次
会话实测 `llvmpipe` 下**每帧 30–60 秒**；换成真实驱动后同一个游戏就能玩了。）

---

## 7. 它在整套文档里的位置

| 主题 | 文档 |
|---|---|
| ARM64 翻译这个概念，以及为什么明日方舟是对照案例 | `02-STORY.md` §3、§5 |
| 当时写下的原始（中文）说明 | `docs/archive/为什么明日方舟能在Ubuntu上运行.md` |
| 与 FGO 共用的宿主机前置条件（KVM、NVIDIA 图形栈） | `01-SOLUTION.md` §1–2，`03-TROUBLESHOOTING.md` §1 |
| 翻译器：berberis 对 libhoudini，houdini 的「定时炸弹」 | `02-STORY.md` §3.2，`docs/research/FGO-on-Linux-ARM-emulation-report.md` §3 |
| 不要删的规则与日常维护 | `04-CLEANUP.md` §3.1、§7 |
| 留作 `tools/bridges/current.so` 的那个桥接文件的来源 | `SOURCES.md` §2 |