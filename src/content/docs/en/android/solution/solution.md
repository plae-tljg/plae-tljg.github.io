---
title: "Running FGO 国服 on Ubuntu"
summary: "TL;DR — Don't fight it with containers, houdini patches or hex-edited translation libraries. Use the Android 16 (API 36) system image in the Android …"
lang: en
translationKey: "android-solution-solution"
slug: solution
track: android
stage: solution
order: 1
stageIndex: true
date: 2026-10-04
tags: []
status: en draft
source: android_gaming:docs/01-SOLUTION.md
---
> **TL;DR** — Don't fight it with containers, houdini patches or hex-edited translation libraries.
> Use the **Android 16 (API 36) system image** in the Android emulator. Its newer Google
> ARM-translation layer (`libndk_translation.so`, berberis **16.0.0**) no longer trips the
> stack-pointer abort that killed *every* previous attempt, and API 36.0's graphics stack is stable
> under the NVIDIA host GPU. **Stock image, no modifications of any kind.**
> Result: FGO installs, launches, downloads its ~1.9 GB of resources, renders its UI and plays.

Verified working on 2026-10-04. Screenshots: `evidence/fgo-attempts/api36/solution-state.png` (prologue scene),
`progress-now.png` (in-game download UI), `root-login-attempt.png` (bilibili login page).

---

## 1. What actually fixed it

Everything before this ran on **API 35** images. Those images ship `libndk_translation.so`
("berberis", version **0.2.3**), whose `ExecuteGuestCall` requires the guest stack pointer to come back
byte-identical from every translated ARM64 call. FGO's code violates that invariant by exactly `0x10`,
and 0.2.3 treats it as fatal:

```
F berberis: Guest call didn't restore sp: expected 0x…fd0, actual 0x…fc0
F libc    : Fatal signal 6 (SIGABRT) … pid … (bilibili.fatego)
```

That fired at ~51 s into every run. It is **not** an FGO ban, not ACE refusing to run, not a GPU problem
and not a configuration mistake — it is a bug in that build of Google's translator.

The **Android 16 image ships a different, newer bridge** (berberis **16.0.0**,
`sha256 fbadc774c989534a567e6af8fd16d2c00727b1f1d9cc778bf538d6b59ed9776d`, 5,403,704 bytes) which does
not abort on FGO's code. Nothing else was changed — the system image used for the working run is
**completely unmodified** (no `-writable-system`, no patched bridge, no libhoudini, no container).

Two supporting facts that also matter:

* **API 36.0 is stable here**; the newer **36.1** image is not — its SurfaceFlinger asserts
  (`!rcEnc->featureInfo()->hasReadColorBufferDma`) 48–72× per boot and `system_server` restarts during
  large installs. Use **36.0 rev 7**, not 36.1.
* **NVIDIA host rendering works** once the image is right: the guest reports
  `GLES: Google (NVIDIA Corporation), Android Emulator OpenGL ES Translator
  (NVIDIA GeForce RTX 5060 Ti/PCIe/SSE2), OpenGL ES 3.1 (4.5.0 NVIDIA 595.91.07)`.

---

## 2. What you need

| Item | Value used |
|---|---|
| Host | Ubuntu 22.04, i5-13500, 31 GB RAM, RTX 5060 Ti, NVIDIA **595.91.07**, `/dev/kvm` usable |
| Android SDK | `$ANDROID_SDK` (Android Studio 2024.1.1.13 bundle is fine) |
| Emulator | **37.3.2** (`sdkmanager --channel=3 emulator`) — 37.2.12 also ran the game |
| System image | **`system-images;android-36;google_apis;x86_64`** (Android 16.0, **rev 7**, `userdebug`) |
| AVD | `api36` — **8 GB RAM, 6 cores, 32 GB data partition**, device profile `pixel_7` |
| Game | `com.bilibili.fatego` v2.129.0, APK at `~/Music/test/android_gaming/assets/fatego.apk` (1.99 GB) |

---

## 3. Step-by-step, from zero

```bash
export ANDROID_HOME=$ANDROID_SDK
export ANDROID_SDK_ROOT=$ANDROID_HOME
export JAVA_HOME=~/00app/01lang/android-studio-2024.1.1.13-linux/android-studio/jbr

# 1) system image (Android 16.0).  sdkmanager sometimes stalls; a direct download also works:
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "system-images;android-36;google_apis;x86_64"
#   or: curl -L -o a36.zip https://dl.google.com/android/repository/sys-img/google_apis/x86_64-36_r07.zip
#       unzip -o a36.zip -d $ANDROID_HOME/system-images/android-36/google_apis/

# 2) AVD
echo no | $ANDROID_HOME/cmdline-tools/latest/bin/avdmanager create avd \
    -n api36 -k "system-images;android-36;google_apis;x86_64" -d pixel_7 --force

# 3) give it real resources (defaults are 2 GB RAM / 2 GB data — far too small)
CFG=~/.android/avd/api36.avd/config.ini
sed -i 's/^hw.ramSize=.*/hw.ramSize=8192/; s/^hw.cpu.ncore=.*/hw.cpu.ncore=6/; s/^disk.dataPartition.size=.*/disk.dataPartition.size=32G/' $CFG

# 4) boot it (or just press ▶ on the AVD in Android Studio's Device Manager)
$ANDROID_HOME/emulator/emulator -avd api36 -gpu host -accel on -no-boot-anim

# 5) install the game
adb install -r ~/Music/test/android_gaming/assets/fatego.apk     # ~2 GB; if streaming fails:
#   adb push fatego.apk /data/local/tmp/ && adb shell pm install -r -g /data/local/tmp/fatego.apk
```

**Do not pass `-writable-system` and do not modify `/system`.** None of that is needed any more.

---

## 4. First launch — what to tap

1. Launch `命运-冠位指定` (or `adb shell am start -n com.bilibili.fatego/.EmptyClass`).
2. **"Viewing full screen" → tap `Got it`** (system overlay). On a 2400×1080 landscape screen it sits at
   about **(1697, 500)**.
3. **bilibili 用户协议与隐私政策 → tap `同意`** at about **(1411, 828)** — do *not* tap `拒绝`.
4. The game starts Unity, shows `连接中.`, then begins downloading its resources
   (~1.9 GB; it displays `下载中 (x MB/秒)  nnn MB / nnn MB  %`).
5. When the download finishes it enters the game — prologue cutscene, then the normal flow
   (bilibili login appears when the game asks for an account).

If you want to open the bilibili login page yourself, it is not exported, so it needs root:

```bash
adb root
adb shell am start -n com.bilibili.fatego/com.gsc.phone_login.PhoneLoginActivity
```

---

## 5. Evidence that it genuinely runs

* `berberis` version reported by the working image: **16.0.0** (the failing builds said `0.2.3`).
* **`restore sp` errors: 0. `Fatal signal`: 0.** across the whole session (many minutes of play).
* Resource download completed: `断点续传 下载成功 …` / `DownloadHandlerFileWithCrcCheck:CompleteContent()`,
  on-disk data **1,920 MB**.
* Game UI rendered and interactive — servant intro screen (the servant intro screen), and the
  prologue scene (`solution-state.png`).
* Native bilibili login page renders and is interactive (`+86 请输入手机号`, `账号密码登录`,
  `请输入账号/邮箱号/手机号`, `请输入密码`, `登录`).

---

## 5b. What it costs to run (measured, while playing)

Numbers taken from this machine while the game sat on the live main menu (42 minutes uptime, 0 crashes).
They are ballpark figures, not benchmarks — a battle scene will work the CPU harder.

| Metric | Value |
|---|---|
| Emulator process CPU | **~107 %** (≈ one host core pegged; the rest is translation + rendering) |
| Emulator RSS (RAM) | **≈ 13 GB** of the 31 GB host, for the 8 GB AVD |
| GPU utilisation | **14 %**, **1.5 GB / 16 GB** VRAM |
| Guest frame pacing (hwui stats) | 50th percentile **16 ms** (≈60 fps), 90th **65 ms**, 95th **117 ms** |
| Janky frames | **39 %** of 66 sampled — noticeable stutter in menus, consistent with ARM64-under-translation |

Read that as: **playable, comfortable on this hardware, but not smooth.** The GPU is mostly idle — the
bottleneck is the CPU translating ARM64, which is exactly what `02-STORY.md` §3 describes. If you want it
faster the lever is CPU (fewer other processes, more cores to the AVD), not the graphics settings.

## 6. Why the earlier attempts failed (so nobody repeats them)

| Attempted route | Outcome | Why |
|---|---|---|
| API 35 AVD, stock libndk | ✗ | berberis **0.2.3** aborts at ~51 s (`restore sp`, delta `0x10`) |
| API 35 AVD, three different libndk builds | ✗ | all three contain the same fatal check |
| API 35 AVD + libhoudini injected | ✗ | houdini SIGSEGVs in its own loader (`s_000067+1227`, `ID:0x01900158`) on stock AVD images |
| redroid container + libhoudini | ~ | FGO's Unity really runs, but it busy-waits on the splash (no GPU, `Cores=1`) |
| API 36.1 image (16.1) | ✗ | SurfaceFlinger assert-loops; `system_server` restarts on big installs |
| Android 16.1 berberis transplanted onto older OS | ~ | turns the fatal abort into `Trying to restore sp and continue`, but the game is left hung |
| `-gpu host` on emulator 37.2.12 | ✗ | gfxstream `error null ctx` storm → emulator SIGSEGV (use 37.3.2, or software GPU) |
| 16 KB page-size image (`ps16k`) | ✗ | `dlopen failed: empty/missing DT_HASH/DT_GNU_HASH in libtersafe2.so` |
| ARM64 AVD, Waydroid, Genymotion ARM64 | ✗ | blocked by the emulator policy / NVIDIA block / Apple-Silicon-only |
| **API 36.0 image, stock bridge** | **✓** | **berberis 16.0.0 does not trip the invariant; graphics stable** |

---

## 7. Gotchas and troubleshooting

* **Never copy `libnbaio.so` / `libnblog.so` from another build into `/system/lib64`.** It makes
  `audioserver` SIGSEGV-loop and the device never finishes booting. Recovery: delete
  `~/.android/avd/<name>.avd/system.img.qcow2` and reboot (it regenerates pristine).
* **If the emulator dies with `error null ctx` / SIGSEGV in gfxstream**, it is the host-GPU path; retry,
  or use `-gpu swiftshader_indirect` (slower but stable).
* **`adb install` of the 2 GB APK can fail with `Broken pipe` / `not enough space`** — that is either a
  too-small data partition (set 32 G) or an unstable image (that is one of 36.1's symptoms).
* **`adb remount` says "Device must be bootloader unlocked"** → the emulator was started without
  `-writable-system`. You do not need it for the working setup.
* **redroid (container) side notes**, if you ever go back: the `binder_linux` module must be loaded or the
  container exits `129` with no logs
  (`docker run --rm --privileged --pid=host ubuntu:22.04 nsenter -t 1 -m -u -i -n -p -- /usr/sbin/modprobe binder_linux`),
  and `androidboot.redroid_gpu_mode=host` crash-loops SurfaceFlinger on NVIDIA — keep `guest`.
* Only **one** emulator at a time; FGO is happy with 8 GB RAM but the host has 31 GB total.
* **If the very first launch dies once, just relaunch it.** On a completely fresh install (no game data
  yet) we have seen the old `berberis: Guest call didn't restore sp` → SIGABRT fire exactly once, at
  ~51 s, with the **stock** Android 16.0 bridge. Relaunching and letting it download fixed it for good:
  the same AVD then ran for hours with 0 `restore sp` and 0 fatal signals. So treat one early crash as a
  first-run quirk, not a dead end.
* **Do not leave a modified system overlay lying around.** If you ever boot this AVD with
  `-writable-system` you will activate whatever was last copied into `/system` — on this machine that is
  the *failed* Android 16.1 transplant, which hangs the game at the ACE/login hand-off. Either never pass
  `-writable-system` (nothing needs it), or reset the overlay first:
  `rm ~/.android/avd/api36.avd/system.img.qcow2` (it regenerates pristine; the game data in
  `userdata-qemu.img.qcow2` is untouched). Verify with `tools/scripts/setup-fgo-avd.sh verify` — the
  bridge hash must read `fbadc774c989534a`.

## 8. Caveats

* Emulators are outside FGO's supported device list and ACE (Tencent Anti-Cheat, shipped inside the game)
  does report emulator signals server-side. **Play on an account you can afford to risk**, and prefer
  normal play over automation.
* Performance is playable but not native-phone-fast; the game is running ARM64 code under translation.
* **Verified end-to-end:** the account was signed in on the emulator and the game used normally — live
  main menu with the running event — after **36 minutes of continuous runtime
  with 0 crashes** (`evidence/fgo-attempts/api36/PLAYING-main-menu-36min.png`).
* **Keep the AVD "stock".** The configuration that works is the untouched Android 16.0 image. Every
  modification we tried (transplanted translators, houdini, containers) made things worse — see
  `docs/02-STORY.md` and `docs/03-TROUBLESHOOTING.md`.

## 8b. What "stock" means here — and one thing to double-check

The working run used the image's **own** bridge:
`/system/lib64/libndk_translation.so` = `fbadc774c989534a…` (berberis **16.0.0**), with the emulator
started **without** `-writable-system`.

During the investigation this same AVD was also used for a *different* experiment: the Android 16.1
translator set (22 files, `af88b2c1…`) was copied into its writable overlay. **That experiment failed** —
the game survived but then hung on a black Unity surface at the ACE/login hand-off. Because that overlay
is still on disk, the hash check above matters: `fbadc774…` = good, `af88b2c1…` = the failed transplant.
* This document describes *this machine's* verified working setup — if a future image update changes the
  bridge, re-check the `berberis` version string first.

## 9. Where things live

```
~/Music/test/android_gaming/docs/01-SOLUTION.md                     ← this document
~/Music/test/android_gaming/assets/fatego.apk                 ← the game (1.99 GB, CN bilibili channel)
~/Music/test/android_gaming/evidence/fgo-attempts/api36/                 ← evidence: screenshots, FINDINGS-LOGIN-PAGE.md
~/Music/test/android_gaming/docs/archive/FGO-STATUS-2026-10-04-round2.md     ← full investigation log + corrections
~/Music/test/android_gaming/evidence/fgo-attempts/redroid-touch/FINDINGS-A.md   ← redroid/houdini thread
~/Music/test/android_gaming/evidence/fgo-attempts/armprobe/FINDINGS-B.md        ← ARM64 translation probe results
~/Music/test/android_gaming/evidence/fgo-attempts/armprobe/FINDINGS-C.md        ← houdini-on-AVD results
~/.android/avd/api36.avd/                        ← the working AVD (Android 16.0)
```
