---
title: "在 Ubuntu 上玩 FGO 国服"
summary: "一句话结论 别去折腾容器、libhoudini、改翻译层。把模拟器系统镜像换成 Android 16（API 36.0），问题就没了。 原始镜像、零修改，FGO 国服能正常安装、启动、下载资源、进入游戏。"
lang: zh
translationKey: "android-solution-solution"
slug: solution
track: android
stage: solution
order: 1
stageIndex: true
date: 2026-10-04
tags: []
status: zh draft
source: android_gaming:docs/01-SOLUTION.zh-CN.md
---
> **一句话结论**
> 别去折腾容器、libhoudini、改翻译层。**把模拟器系统镜像换成 Android 16（API 36.0）**，问题就没了。
> 原始镜像、**零修改**，FGO 国服能正常安装、启动、下载资源、进入游戏。

本文记录一套**已经跑通**的方案，包含：为什么以前都失败、完整复现步骤、验证方法、以及踩过的坑。
文中的路径都是示例，请按自己的环境替换。

---

## 一、为什么以前各种方法都失败

以前大家（包括各种教程）几乎都用 **API 35 及更早**的系统镜像。这些镜像里的 ARM 翻译层
`/system/lib64/libndk_translation.so`（Google 的 "berberis"，版本 **0.2.3**）有一个致命 bug：

它要求每一次「翻译执行的 ARM64 调用」返回时，guest 的栈指针必须**一模一样**，
而 FGO 的代码会差 **0x10（16 字节）**，于是 0.2.3 直接判定为致命错误并 `abort`：

```
F berberis: Guest call didn't restore sp: expected 0x……fd0, actual 0x……fc0
F libc    : Fatal signal 6 (SIGABRT) …… (bilibili.fatego)
```

表现就是：**游戏大约 51 秒左右必崩**（不管你怎么配、加多少内存、换哪个模拟器版本）。

> 关键认知：这**不是**模拟器配置问题，**不是**显卡问题，**不是** FGO 封杀模拟器，
> **也不是** ACE 反作弊拦你 —— 是**那个版本的 Google 翻译层本身有 bug**。

Android 16 镜像里带的是**更新版的翻译层**（berberis **16.0.0**，
`sha256 fbadc774c989534a567e6af8fd16d2c00727b1f1d9cc778bf538d6b59ed9776d`，5,403,704 字节），
它在这段代码上不再触发该断言。**一切问题随之消失。**

另外两点也很重要：

* **必须用 36.0（rev 7），不要用 36.1。** 36.1 的 SurfaceFlinger 每开机崩 48～72 次
  （`Assertion failed: !rcEnc->featureInfo()->hasReadColorBufferDma`），装大 APK 时
  `system_server` 还会重启，根本没法用。
* 镜像选对之后，**NVIDIA 显卡加速是正常的**，guest 内会显示：
  `GLES: Google (NVIDIA Corporation), … (NVIDIA GeForce RTX 5060 Ti/PCIe/SSE2), OpenGL ES 3.1`

---

## 二、实测通过的参考环境

| 项目 | 实测值 |
|---|---|
| 系统 | Ubuntu 22.04.5（X11 / GNOME 均可） |
| CPU | Intel i5-13500（**需要支持 VT-x 且 `/dev/kvm` 可用**） |
| 内存 | 31 GB（给模拟器 8 GB） |
| 显卡 | NVIDIA RTX 5060 Ti，驱动 **595.91.07**（`nvidia-smi` 正常、`glxinfo -B` 显示 NVIDIA 而非 llvmpipe） |
| Android SDK | Android Studio 自带的 SDK 即可（示例路径 `$HOME/android-sdk`） |
| 模拟器 | **37.3.2**（实测版本；建议用当前最新，旧版 37.2.12 在主机 GPU 路径上更容易崩） |
| 系统镜像 | **`system-images;android-36;google_apis;x86_64`（Android 16.0，rev 7，userdebug）** |
| AVD | 名称随意（示例 `api36`），**8 GB 内存 / 6 核 / 32 GB 数据分区**，设备档 `pixel_7` |
| 游戏 | `com.bilibili.fatego`（B 服官服，实测 v2.129.0，APK 约 1.99 GB） |
| 分辨率 | 1080×2400（游戏横屏后为 2400×1080） |

先自检两件事：

```bash
# 1) KVM 是否可用
emulator -accel-check        # 期望：KVM (version 12) is installed and usable.
ls -l /dev/kvm               # 若权限不足：sudo usermod -aG kvm $USER 后重新登录

# 2) 显卡驱动是否是真正的 NVIDIA（不是软件渲染 llvmpipe）
glxinfo -B | grep -i "OpenGL renderer"
```

---

## 三、完整复现步骤

### 1) 准备 SDK 与模拟器

```bash
export ANDROID_HOME=$HOME/android-sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export JAVA_HOME=$HOME/android-studio/jbr        # 用 Android Studio 自带 JBR 最省事

# 模拟器（想用最新的可以加 --channel=3）
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "emulator" "platform-tools"
```

### 2) 下载 Android 16.0 系统镜像

```bash
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "system-images;android-36;google_apis;x86_64"
```

> 如果 `sdkmanager` 卡住不动（实测遇到过），就**直接下 zip**：
> ```bash
> curl -L -o a36.zip https://dl.google.com/android/repository/sys-img/google_apis/x86_64-36_r07.zip
> mkdir -p $ANDROID_HOME/system-images/android-36/google_apis
> unzip -o a36.zip -d $ANDROID_HOME/system-images/android-36/google_apis/
> ```

### 3) 建 AVD，并把它调大

```bash
echo no | $ANDROID_HOME/cmdline-tools/latest/bin/avdmanager create avd \
    -n api36 -k "system-images;android-36;google_apis;x86_64" -d pixel_7 --force
```

**默认配置只有 2 GB 内存 / 2 GB 数据分区，装不下 2 GB 的 APK，必须改：**

```bash
CFG=$HOME/.android/avd/api36.avd/config.ini
sed -i 's/^hw.ramSize=.*/hw.ramSize=8192/; s/^hw.cpu.ncore=.*/hw.cpu.ncore=6/; s/^disk.dataPartition.size=.*/disk.dataPartition.size=32G/' $CFG
grep -E 'ramSize|ncore|dataPartition' $CFG    # 确认改完
```

### 4) 启动模拟器

```bash
$ANDROID_HOME/emulator/emulator -avd api36 -gpu host -accel on -no-boot-anim
```

> 也可以在 **Android Studio → Device Manager** 里点 ▶ 启动，效果一样。
> **不要**加 `-writable-system`，**不要**改 `/system` —— 这套方案完全不需要。

### 5) 安装游戏

```bash
adb install -r fatego.apk        # 约 2 GB，耐心等
```

如果报 `Broken pipe` 或 `not enough space`：

```bash
adb push fatego.apk /data/local/tmp/
adb shell pm install -r -g /data/local/tmp/fatego.apk
```

（`not enough space` = 第 3 步的数据分区没改成功；`Broken pipe` 多见于镜像不稳定，比如 36.1。）

### 6) 首次进游戏：点两个地方

启动后（图标「命运-冠位指定」，或 `adb shell am start -n com.bilibili.fatego/.EmptyClass`）：

1. 系统弹出 **“Viewing full screen”** → 点 **`Got it`**，约在 **(1697, 500)**
2. 弹出 **bilibili 用户协议与隐私政策** → 点 **`同意`**，约在 **(1411, 828)**
   ⚠️ 不要点「拒绝」

> 坐标基于 2400×1080 横屏。如果是别的分辨率，自己按比例换算，或先用
> `adb shell uiautomator dump` 找按钮位置。

### 7) 等资源下载，然后就能玩了

游戏会显示 `连接中.`，然后开始下载资源（界面左下角会显示
`下载中 (x.xx MB/秒)  已下载/总量  百分比`），一共 **约 1.9 GB**。
下完自动进入游戏：序章剧情 → 需要账号时再拉起 bilibili 登录。

---

## 四、怎么确认「真的成了」

```bash
# 1) 翻译层版本：应该是 16.0.0（失败的那些是 0.2.3）
adb logcat -d -s berberis:* | grep -m1 Initialized

# 2) 全程不该出现这两行（出现即失败）
adb logcat -d | grep -E "restore sp|Fatal signal"

# 3) 显卡是否真的在加速
adb shell dumpsys SurfaceFlinger | grep -m1 '^GLES'

# 4) 资源是否在下
adb shell du -sm /sdcard/Android/data/com.bilibili.fatego
```

跑通时可以看到：
* `berberis: Initialized Berberis (aarch64), version 16.0.0`
* `restore sp` 与 `Fatal signal` **都是 0 次**
* 数据目录涨到 **约 1,920 MB**
* 游戏内正常显示 UI（从者介绍页、序章剧情画面等）

### 实测性能（**战斗中**实测，用 SurfaceFlinger 帧时间戳）

| 指标 | 数值 |
|---|---|
| 帧率 | **稳定 30.0 fps** —— 这是 **FGO 自己的上限**，不是模拟器的限制 |
| 帧间隔 | 平均 33.3 ms，最差 36–54 ms，丢帧（missed vsync）**0–6%** |
| 模拟器 CPU | 约 100%（≈ 一个宿主核心） |
| 模拟器内存 | 约 13 GB（宿主 31 GB，AVD 配置 8 GB） |
| 显卡 | 占用 19%，显存约 1.4 GB |
| 客体可用内存 | 8 GB 中约 4 GB 空闲，Android 的 lmkd 从不触发 |

**真正有用的一步：把模拟器钉在 P-core（大核）上。**
本机 i5-13500：6 个 P-core 跑 4.8 GHz，8 个 E-core 只有 3.5 GHz。默认情况下模拟器线程可以跑在所有
20 个 CPU 上，于是被调度到慢核上。同一个战斗场景、其他条件不变：

| | 帧率 | 平均帧 | 最差帧 | 丢帧 |
|---|---|---|---|---|
| 默认（20 个 CPU 随便跑） | 17–23 fps | 42–59 ms | 101–117 ms | **30–35%** |
| **钉在 P-core** | **30.0 fps** | 33.3 ms | 50–52 ms | **2–7%** |

现在 `avd` / `avdbg` 已自动这么做（`~/.bash_env_vars` 里的 `_avd_pcpu`，用 `AVD_NO_PIN=1` 可关掉）。

**所以：加内存没用。** 客体还空着 4 GB，从不触发 OOM；真正紧张的是宿主（31 GB、**没有 swap**、已用约
20 GB），把客体加到 16 GB 反而可能把宿主压出 OOM —— 那正是"莫名闪退"的来源。
而且 FGO 本来就锁 30 fps，也没有更高的帧率可追：**看丢帧率，别看帧率。**

---

## 五、踩过的坑（照抄避雷）

| 现象 / 做法 | 说明 |
|---|---|
| **千万别把其他版本的 `libnbaio.so` / `libnblog.so` 拷进 `/system/lib64`** | 会让 `audioserver` 每 5 秒段错误一次，**开机永远完不成**。恢复方法：删掉 `~/.android/avd/<名字>.avd/system.img.qcow2`（会自动重建为原始镜像） |
| 模拟器崩溃，日志里全是 `error null ctx` / gfxstream | 主机 GPU 路径不稳定。重开一次；仍不行就换 `-gpu swiftshader_indirect`（慢但稳） |
| 用了 Android **36.1** 镜像 | SurfaceFlinger 疯狂重启、`system_server` 在装 APK 时重启 → 一律失败。**用 36.0 rev 7** |
| `adb remount` 报 `Device must be bootloader unlocked` | 说明启动时没加 `-writable-system`。**本方案不需要**，忽略即可 |
| 第一次装完启动就闪退 | 实测在「全新安装后的第一次启动」偶发一次旧报错，**重新启动游戏**、让它把资源下完即可 |
| 同时开多个模拟器 | 别这么干。FGO 给 8 GB 内存够用，但主机总共就那么多内存 |
| 容器方案（redroid / Waydroid） | NVIDIA 上 Waydroid 源码层直接不支持；redroid 的 `gpu_mode=host` 会让 SurfaceFlinger 崩溃循环，只能 `guest`（无 GPU 加速），游戏能跑但一直卡在标题 |
| 用 16 KB 页大小镜像（ps16k） | `dlopen failed: … DT_HASH/DT_GNU_HASH in libtersafe2.so`，ACE 的加固库不兼容 |
| ARM64 镜像 / Genymotion 本地 ARM64 | 模拟器策略直接拒绝 arm64 guest；Genymotion 本地 ARM64 仅 Apple Silicon |

---

## 六、其他方案为什么不推荐（一览）

| 方案 | 结果 | 原因 |
|---|---|---|
| API 35 镜像 + 原版翻译层 | ✗ | berberis 0.2.3 在 ~51 秒 `SIGABRT` |
| API 35 + 换三个不同的 libndk 版本 | ✗ | 三个版本都含同一个致命断言 |
| API 35 + 注入 Intel libhoudini | ✗ | houdini 自己加载库时就段错误（`s_000067+1227`, `ID:0x01900158`） |
| redroid 容器 + libhoudini | △ | Unity 真能跑起来，但没有 GPU 加速、Unity 只看到 1 核，一直忙等卡住 |
| Android 16.1 镜像 | ✗ | SurfaceFlinger 断言崩溃循环，装 APK 时 system_server 重启 |
| 把 16.1 的翻译层移植到旧系统 | △ | 致命崩溃变成 `Trying to restore sp and continue`（只警告不崩），但游戏随后死锁 |
| 模拟器 37.2.12 + `-gpu host` | ✗ | gfxstream 报错风暴后模拟器自己段错误（37.3.2 好一些） |
| **Android 16.0 镜像 + 原版翻译层** | **✓** | **berberis 16.0.0 不再触发该断言，图形栈也稳定** |

---

## 七、注意事项（请务必看一眼）

* **模拟器不在 FGO 官方支持列表内**，游戏内置的腾讯 ACE 反作弊会检测模拟器特征
  （`TssSDKCmd_IsEmulator`、`emulator_name` 等）并且**判定在服务器侧**。
  也就是说：能不能封、封不封，不是你本地能控制的。
  **请用你输得起的账号玩，别用主号，也别做自动化脚本刷本。**
* 性能是「能玩」级别，不如真机：毕竟是在 x86 上翻译执行 ARM64 代码。
* 这是一次**实测快照**。以后镜像/翻译层更新，判断方法很简单：
  **先看 `berberis` 版本号**（`adb logcat -d -s berberis:* | grep Initialized`）。
* 打游戏过程中如果突然闪退，先把当次日志抓下来：
  `adb logcat -d > fgo.log`，再搜 `restore sp` / `Fatal signal` 即可确认是不是老问题复发。

---

## 八、速查卡（最短路径）

```bash
# 镜像
sdkmanager "system-images;android-36;google_apis;x86_64"      # 36.0，不要 36.1
# AVD
avdmanager create avd -n api36 -k "system-images;android-36;google_apis;x86_64" -d pixel_7
sed -i 's/^hw.ramSize=.*/hw.ramSize=8192/; s/^hw.cpu.ncore=.*/hw.cpu.ncore=6/; s/^disk.dataPartition.size=.*/disk.dataPartition.size=32G/' \
    ~/.android/avd/api36.avd/config.ini
# 启动
emulator -avd api36 -gpu host -accel on -no-boot-anim
# 装游戏
adb install -r fatego.apk
# 首次进游戏：点 "Got it"(≈1697,500) → 点 "同意"(≈1411,828) → 等约 1.9 GB 下载
# 自检
adb logcat -d -s berberis:* | grep Initialized     # 应为 16.0.0
adb logcat -d | grep -cE "restore sp|Fatal signal" # 应为 0
```

---

> **来龙去脉**：[把 FGO 国服搬上 Ubuntu：十二个死胡同和一个版本号](/zh/writing/android-games/)——这一步为什么是这样，以及当时卡在哪里。
