---
title: "Troubleshooting"
summary: "02-STORY.md and research/ — this file links to them instead of repeating them."
lang: zh
translationKey: "android-trouble-troubleshooting"
slug: troubleshooting
track: android
stage: trouble
order: 1
stageIndex: true
date: 2026-10-04
tags: []
status: zh draft
source: android_gaming:docs/03-TROUBLESHOOTING.md
aiTranslated: true
---
*Single source of truth for symptoms. Concepts (why any of this is true) are explained once, in
`02-STORY.md` and `research/` — this file links to them instead of repeating them.*

**How to read an entry:** `Symptom` (exact text where we have it) → `Layer` → `Cause` → `Fix`.
Anything marked **⚠️ open** was never fixed on this machine.

---

## 0. Thirty-second triage

Run these five before believing any theory:

```bash
emulator -accel-check                     # 1) is KVM really usable?
ls -l /dev/kvm && id | grep -o kvm        #    …and is your user allowed to use it?
glxinfo -B | grep -i renderer             # 2) is OpenGL real (NVIDIA/AMD) or llvmpipe (software)?
adb shell getprop ro.build.version.sdk    # 3) which Android is the guest?  (need 36)
adb logcat -d -s berberis:* | grep -m1 Initialized   # 4) which translator?
adb logcat -d | grep -cE "restore sp|Fatal signal"   # 5) crash counters (want 0 0)
```

`tools/scripts/setup-fgo-avd.sh verify` runs 3–5 for you and says whether the config is the known-good one.

**The habit that matters:** work out *which layer* the failure is in before changing anything
(§7 has the list of things that looked like the culprit and were not).

---

## 1. Host / OS layer

| # | Symptom | Cause | Fix |
|---|---|---|---|
| 1.1 | `/dev/kvm is not found: VT disabled in BIOS or KVM kernel module not loaded` | **Misleading message.** VT-x was on and `kvm_intel` was loaded — the user simply wasn't in the `kvm` group (`crw-rw---- root:kvm`) | `sudo usermod -aG kvm $USER`, then **re-login**; confirm with `emulator -accel-check` |
| 1.2 | Guest renders at ~1 fps; `glxinfo -B` says `llvmpipe (LLVM 15.0.7, 256 bits)` — **while `nvidia-smi` prints a healthy GPU table** | Driver installed **compute-only**: `nvidia.ko`, `libcuda`, `nvidia-ml` present, but the **graphics** userspace (`libGLX_nvidia.so.0`, `libnvidia-glcore`, `libEGL_nvidia`) missing. One kernel module, **two independent userspaces** | Install the full open-kernel driver (`nvidia-driver-595-open` and friends). Verify `glxinfo -B` shows the real GPU, and in-guest `dumpsys SurfaceFlinger \| grep '^GLES'` |
| 1.3 | `nvidia-settings assert failure: free(): invalid pointer` at login | `nvidia-settings` came from the CUDA repo (`615.71.09`) while the driver is `595.91.07`, and it was not held | `sudo apt install --allow-downgrades nvidia-settings=595.91.07-1ubuntu1` + `sudo apt-mark hold nvidia-settings`. **⚠️ open on this machine** (`04-CLEANUP.md` §6.3) |
| 1.4 | DKMS cannot build the NVIDIA module after a kernel update | Missing `linux-headers-$(uname -r)` | `sudo apt install linux-headers-$(uname -r)` then `sudo dkms autoinstall -k $(uname -r)` |
| 1.5 | SDK tools fail with a path error even though the SDK is installed | `ANDROID_SDK_ROOT` pointed at a **non-existent** directory while `ANDROID_HOME` was correct — tools read `ANDROID_SDK_ROOT` first | Set both to the same real path in `~/.bash_env_vars` |
| 1.6 | Whole PC loses networking | A `docker run --network host` container (redroid) collided with the host's `wg0 10.0.0.0/24` | Never give redroid `--network host`; use a bridge network (see 6.3) |

## 2. Emulator layer

| # | Symptom | Cause | Fix |
|---|---|---|---|
| 2.1 | `PANIC: Avd's CPU Architecture 'arm64' is not supported by the QEMU2 emulator on x86_64 host` | Deliberate policy: ARM64 guests are refused on x86_64 hosts (`qemu-system-aarch64` ships but is blocked) | Don't chase ARM64 AVDs. Use an **x86_64** image + the ARM translator |
| 2.2 | Stream of `gfxstream … error null ctx`, `Failed to find ColorBuffer`, then the emulator dies with **SIGSEGV** | gfxstream host-GL path is unstable, worst on emulator 37.2.12 | Use emulator **37.3.2+**; if it still happens, `-gpu swiftshader_indirect` (software, stable) |
| 2.3 | You believed you were testing ANGLE, but everything behaved like `host` | `ERROR \| gpuChoiceBasedOnGpuOptions: Selected GPU option 'angle_indirect' is not valid, switching to 'auto' mode` — `auto` selects **host** | Don't pass `angle_indirect`. Read that log line to know what actually ran |
| 2.4 | `adb remount` → `Device must be bootloader unlocked` | The emulator was started **without** `-writable-system` | Add the flag — but note the working FGO setup needs **no** system writes at all |
| 2.5 | `WARNING \| Emulator does not support more than 6 cores. Number of cores set to 6` | Cosmetic cap | Ignore |
| 2.6 | `INSTALL_FAILED_INSUFFICIENT_STORAGE` / `Requested internal only, but not enough space` | Fresh AVDs default to a **2 GB** data partition; FGO's APK alone is 2 GB | Set `disk.dataPartition.size=32G` (and `hw.ramSize=8192`) in `~/.android/avd/<name>.avd/config.ini` |
| 2.7 | `adb install` → `Failure calling service package: Broken pipe (32)` | `system_server` restarted mid-install: either an unstable image (36.1) or a too-small partition | Use Android **16.0 rev 7** and a 32 GB partition; or `adb push` + `adb shell pm install -r -g /data/local/tmp/x.apk` |
| 2.8 | `INSTALL_FAILED_DEPRECATED_SDK_VERSION: App package must target at least SDK version 24, but found 0` | An APK (ours: `armtest.apk`) built without `targetSdkVersion` — Android 14+ refuses it | Set `targetSdkVersion` ≥ 24 and rebuild (see `tools/armprobe/` for a correct example) |
| 2.9 | **The game feels slow**: 17–23 fps, frames 100–120 ms, ~30 % of frames miss vsync | The emulator's threads may run on **any** core, and on a hybrid CPU the scheduler lands them on the **E-cores** — on this i5-13500 the 6 P-cores run at 4.8 GHz while the 8 E-cores only reach 3.5 GHz. ARM64 translation is pure CPU work, so it inherits that penalty | **Pin the emulator to the P-cores.** Detect them, then hand them to `taskset`: <br>`P=$(lscpu -e=CPU,MAXMHZ \| awk 'NR>1 && $2+0>4000{printf "%s,",$1}' \| sed 's/,$//')` <br>`taskset -c "$P" emulator -avd api36 …` <br>Measured in battle: **17–23 fps / 30 % missed → 30.0 fps / 2–7 % missed**. Already wired into `avd`/`avdbg` in `~/.bash_env_vars` (`_avd_pcpu`; disable with `AVD_NO_PIN=1`) |
| 2.10 | You tune for 60 fps and never reach it | **FGO caps itself at 30 fps** (`Application.targetFrameRate`), so 33.3 ms frame intervals are the game's own design, not a fault. The AVD refreshes at 60 Hz, so a correctly configured setup shows exactly 30.0 fps | Don't chase 60. Judge the setup by **missed-vsync %** instead — see §10 for the `dumpsys SurfaceFlinger --latency` command; intervals should sit at ~33 ms |
| 2.11 | Adding RAM to the AVD hoping for smoother gameplay | With 8 GB the guest has ~4 GB *available* and Android's `lmkd` never fires, so there is no memory pressure to relieve. The host is the real constraint (this box: 31 GB, **no swap**, ~20 GB already used, emulator RSS ≈13 GB at 8 GB configured) | Don't. Going to 16 GB would push the host toward ~28 GB with no swap → OOM kills that look exactly like "random crashes" (§1.7). Fix CPU pinning (2.9) instead |
| 2.12 | The game holds a steady 30 fps, then **dips to ~19 fps for a few seconds** and recovers by itself | Not the emulator: it is **ACE's anti-cheat memory scanner**. During a dip the guest shows `ndk_translation_program_runner_binfmt_misc_arm64 ./memscan` burning **~204 % CPU** (two guest cores) — and it is itself translated ARM64 — while the game needs only ~64 % | Nothing to fix; it is a periodic in-game event. Recognise it instead of chasing RAM/GPU: `adb shell "top -n 1 -b \| head -10"` during a dip |

## 3. System-image layer

| # | Symptom | Cause | Fix |
|---|---|---|---|
| 3.1 | `dlopen failed: empty/missing DT_HASH/DT_GNU_HASH in "…/libtersafe2.so" (new hash type from the future?)` | **16 KB page-size** image (`google_apis_ps16k`) is incompatible with ACE's hardened `libtersafe2.so` | Use a normal (4 KB) image |
| 3.2 | On Android **36.1**: SurfaceFlinger crash-loops (`Abort message: 'Assertion failed: !rcEnc->featureInfo()->hasReadColorBufferDma'`, 48–72× per boot) and `system_server` restarts during large installs | That specific image build is broken on this emulator/GPU combination (both `host` and `swiftshader`) | Use **Android 16.0 rev 7** (`android-36;google_apis;x86_64`) |
| 3.3 | You read that only `google_apis_playstore` ships ARM translation | It's **false**: all three API 35 images set `ro.dalvik.vm.native.bridge=libndk_translation.so` | Check the image's own `build.prop` (and `getprop`) instead of trusting a summary |
| 3.4 | `boot_completed` never becomes 1 after copying files into `/system` | You overwrote ordinary system libraries from another build — classically `libnbaio.so` / `libnblog.so` — and `audioserver` SIGSEGV-loops every 5 s | **Only** ever copy `libndk_translation*` files. Recover by deleting `~/.android/avd/<name>.avd/system.img.qcow2` so it regenerates pristine |
| 3.5 | Your `/system` edits appear to "vanish" between boots (the bridge hash is suddenly the stock one again) — or, the reverse, a long-forgotten experiment comes back to life | A writable `/system` lives in `system.img.qcow2`, and that overlay is only mounted when the emulator is started with **`-writable-system`**. Boot without it and you get the pristine image; boot with it and you get whatever was last copied in | Decide which you want and *say so every time*. The FGO setup needs **no** system writes, so never pass the flag — or delete the overlay to be certain. Always confirm with the bridge hash (`avdgpu` / `tools/scripts/setup-fgo-avd.sh verify`) (bridge hash `fbadc774…` = stock/good, `af88b2c1…` = the failed 16.1 transplant). **State on this machine (2026-10-04): the overlay was deleted and `api36` re-verified at `fbadc774…`, so both AVDs are stock now** |
| 3.6 | No Play Store in the guest | Wrong image **tag**: `google_apis`, `google_apis_ps16k` and `default` have no Play Store; only `google_apis_playstore` does | Pick the tag you actually need (`google_apis`/`ps16k` are `userdebug` and therefore writable; `playstore` is `user` and is not) |
| 3.7 | In-guest "device isn't Play Protect certified", Google sign-in fails | The AVD isn't registered with Google; unpatched API 37 revisions are known to fail sign-in outright | Register the device ID at `google.com/android/uncertified`, cold-boot (`-no-snapshot-load`) after signing in, or stay on API 35/36. Irrelevant for FGO 国服 (no Google services needed) |

## 4. Translator layer (the heart of it)

| # | Symptom | Cause | Fix |
|---|---|---|---|
| 4.1 | **The original killer.** `F berberis: Guest call didn't restore sp: expected 0x…fd0, actual 0x…fc0` → `F libc: Fatal signal 6 (SIGABRT) … (bilibili.fatego)` at **~51 s**, every run, on API 35 images | `berberis 0.2.3`'s `ExecuteGuestCall` requires the guest SP to return byte-identical; FGO is off by exactly `0x10`. Three different API 35 libndk builds all contain the fatal check | **Use the Android 16.0 image** — its `berberis 16.0.0` does not trip it. This is the fix |
| 4.2 | Same message but as a **warning**: `E berberis: Warning: guest call didn't restore sp…` + `Trying to restore sp and continue...` — no crash, but the game then hangs forever (idle `UnityMain` in a private futex, black surface, zero network traffic) | The Android 16.1 bridge softens the abort but leaves the process in a broken state. Reproduced on API 35 **and** 36.0 | Don't transplant the 16.1 bridge. Use the **matched** 16.0 image so the fault never happens |
| 4.3 | After copying only `libndk_translation.so`: `Fatal signal 11 … #04 libndk_translation_proxy_libandroid.so (berberis::TrampolineFuncGenerator<…>::Func+15)` | A bridge and its `libndk_translation_proxy_*.so` files are a **matched set**; the trampolines call into the proxies | Copy the whole set (`tools/nbkit-a361/`) — or, better, don't transplant at all |
| 4.4 | libhoudini inside an AVD: `D houdini: Initialize library(version: 13.0.1_z.39540.g RELEASE)... successfully.` then `D houdini: Fatal error (ID:0x01900158).` and SIGSEGV at `s_000067+1227` inside `NativeLoaderNamespace::Load` — on *any* ARM64 library | houdini cannot be transplanted onto stock Google AVD images in this way; the image lacks whatever else it needs. Not SELinux, not binfmt, not the bridge filename (all three were tested) | Don't. It *does* work inside the purpose-built redroid image (6.4) |
| 4.5 | Apps hang on splash / die with `SIGILL`/`SIGABRT` naming `libhoudini.so`, one process pegging **270 % CPU**, "suddenly around September 2026" | The **hpe-14 build** of houdini has a hardcoded counter gate: `cmp [mem],2` / `jae` — the folk name is "timebomb", it is *not* a timestamp (`research/FGO-on-Linux-ARM-emulation-report.md` §3.2) | 6-byte NOP of that `jae` — 64-bit offset `0xe6085`, 32-bit `0x8a29a`. **Never apply those offsets to a different build**: on this machine's `13.0.1_z.39540.g` offset `0xe6085` holds `ff ff 0f 84 4b 07`, i.e. unrelated `.text`. Use `Vvamp`'s pattern-searching script, which refuses unknown hashes |
| 4.6 | houdini dies with `SIGILL` (`signal 4`, `SI_USER`) that is clearly **self-inflicted** | Second, undocumented self-destruct: houdini sends itself `tkill(gettid(), SIGILL)` when its **on-disk symlink topology** is disturbed — identical bytes as four regular files crash, the stock symlink layout works | Preserve the symlink layout when packaging houdini (Magisk/overlay) |
| 4.7 | `W …: Unexpected CPU variant for x86: x86_64.` + `Known variants: atom, sandybridge, silvermont, …` | **Benign ART noise** on 12th/13th-gen Intel — it is not a translator error, despite looking like one | Ignore |
| 4.8 | redroid: `zygote64` itself SIGSEGVs (`fault addr 0xffffffffffffffea`, `ndk_translation::WaitForAppProcess`) and nothing can start — regressed from previously working | The container had silently reverted to the image's **bundled 2023 libndk**, which doesn't recognise 13th-gen Intel | Use the purpose-built houdini image and verify the bridge hash after **every** container recreation |

## 5. Game / anti-cheat layer

| # | Symptom | Cause | Fix |
|---|---|---|---|
| 5.1 | `Input dispatching timed out (… is not responding. Waited 500xms for MotionEvent(… source=MOUSE … action=HOVER_MOVE))` | Input from a **mouse** (scrcpy forwarding hover) — FGO is touch-only and never consumes hover events | Drive it with **touch** only: `adb shell input tap X Y`. Don't attach a mouse to the game surface |
| 5.2 | Game "hangs" on a static splash that is byte-identical across screenshots | Sometimes it really is loading; sometimes a dialog is on top that screencap doesn't show | Dump the UI (`uiautomator dump`) and the top activity before concluding "frozen". In our case a `GSCPushAuthActivity` prompt was waiting |
| 5.3 | `E GP7Worker: Invalid ID 0x00000000.` and the ACE worker process restart-loops every ~17 s | ACE's own worker failing — looks alarming | **Benign**: the same loop appears in runs that reach the login page and play normally |
| 5.4 | `V BgcPlugin: … NullPointerException: … com.base.bgcplugin.BgcPluginManager.onlyDownloadAndInstall() on a null object reference` | B站 game CDN/plugin deployment step throwing | **Benign**: byte-identical NPE appears in the successful run too |
| 5.5 | Removing/zeroing ACE to "get past" it → `UnsatisfiedLinkError` at `com.ace.gshell.AceApplication.<clinit>` (and `pm disable-user` doesn't help) | ACE is loaded from a static initialiser and re-bound by the game | Don't. ACE is **not** the blocker anyway (4.1 is) — and tampering is server-side visible |
| 5.6 | redroid: `E AHardwareBuffer: GraphicBuffer(w=4, h=4, lc=1) failed (Unknown error -3)` repeatedly | Guest GPU path (software/VirtIO) can't allocate certain buffers | Part of why the container route renders poorly; use the AVD |
| 5.7 | Login page won't open from adb: `SecurityException: … not exported from uid …` | The bilibili login activities are not exported | `adb root` first, then `am start -n com.bilibili.fatego/com.gsc.phone_login.PhoneLoginActivity` |

## 6. Container route (redroid / Waydroid)

| # | Symptom | Cause | Fix |
|---|---|---|---|
| 6.1 | redroid container exits **`129` with no logs at all** | The `binder_linux` kernel module was not loaded | Load it without sudo: `docker run --rm --privileged --pid=host ubuntu:22.04 nsenter -t 1 -m -u -i -n -p -- /usr/sbin/modprobe binder_linux` |
| 6.2 | redroid "can't connect over adb — port 5555 is taken by the emulator" | **Misdiagnosis.** The container had **no network attachment at all** (`Networks={}`, its network had 0 members); `adbd` was listening on 5555 *inside* it | Attach a network and publish a port (`-p 5556:5555`), then `adb connect 127.0.0.1:5556` — or `adb connect <container-ip>:5555` |
| 6.3 | Host loses all networking when redroid starts | `--network host` + redroid's internal `10.0.0.0/24` collided with the host's `wg0` | Use a bridge network (`redroid-net`, `172.30.0.0/24`), never `--network host` |
| 6.4 | redroid with `androidboot.redroid_gpu_mode=host` → SurfaceFlinger SIGSEGV loop, `init.svc.surfaceflinger = restarting`, boot never completes | NVIDIA's proprietary driver doesn't provide the standard Mesa/DRM interfaces redroid's gralloc expects | Keep `gpu_mode=guest` (software). There is no GPU path for redroid on NVIDIA |
| 6.5 | redroid: game runs but `UnityMain` pegs **~105 % of a core** forever on a frozen splash, `RenderThread` idle | Unity's job system spin-waiting in translated code; environment has no GPU accel and Unity is told `Cores = 1` although the guest really has 20 | No fix found. This is why the container route is a dead end for FGO |
| 6.6 | Waydroid: 3D unplayable, `ro.hardware.egl=swiftshader` no matter what you set | **By design**: Waydroid's `tools/helpers/gpu.py` contains `unsupported = ["nvidia"]`; Android needs bionic EGL/GLES, NVIDIA ships glibc-only userspace | Don't fight it — use the AVD. Waydroid is fine for 2D/media on this box |
| 6.7 | Waydroid won't start on this desktop at all | Waydroid is a **Wayland client**; this session is X11/GNOME 42 | Nested Weston (`weston --backend=x11-backend.so --shell=kiosk-shell.so`) — see `02-STORY.md` §4 |
| 6.8 | Container: "no Vulkan drivers" / graphics init failure in Vulkan-only ARM64 games; config edits (e.g. DPI) silently ignored | ARM bridges provide no Vulkan path; and Waydroid's `make_base_props()` only re-runs on `init`/`upgrade`, so `[properties]` edits appear to do nothing | No Vulkan workaround. For config: `sudo waydroid upgrade -o` after editing, or set it at runtime (`wm density`). Both are moot for FGO — use the AVD |
| 6.9 | **Dangerous:** pressing "Power off" *inside* the Android container shuts down the **host** root filesystem (every new host process segfaults; hard reboot required) | `F2FS_IOC_SHUTDOWN` from the container reaches the host superblock through the rbind'd `/data` (upstream Waydroid issue #2438) | Never press Android's power-off in a container. Keep container data off the root filesystem |
| 6.10 | Banking apps / Play Integrity refuse to run | A container is not a Google-certified device: no TEE, SELinux off, wrong ABI list | Nothing to fix; Magisk-style hiding doesn't restore hardware attestation. Irrelevant for FGO 国服 |

## 7. False alarms — things that looked like the culprit and were not

Worth reading before you spend a day on any of them.

| Suspect | Why it looked guilty | Verdict |
|---|---|---|
| **ACE anti-cheat** | FGO ships it (`libtersafe2.so`, `libtprt.so`, GP6/GP7 services) and won't run without it | ❌ Not the blocker. Arknights ships the same ACE family and plays; FGO passes ACE to the agreement page |
| **Mouse-hover ANR** | Six ANR traces, all identical | ⚠️ Real, but an *input artefact*. Touch-only input removed it |
| **"adb port 5555 conflict"** | The emulator did hold 5555 | ❌ The container simply had no network (6.2) |
| **`BgcPluginManager` NPE** | Thrown during startup, looks fatal | ❌ Present in the successful run too |
| **`GP7Worker` restart loop** | Looks like anti-cheat failing | ❌ Present in successful runs |
| **Our first ARM64 probe crashing** | Suggested translation was broken | ❌ The APK had `targetSdk 0` and couldn't even install on Android 14+ (2.8) |
| **"Only Play Store images have ARM translation"** | Widely repeated | ❌ False (3.3) |
| **ARM64 AVD** | Seems like the obvious way to run ARM games | ❌ Refused by policy (2.1) |
| **Different libndk builds** | Different sizes, different build IDs | ❌ All three carry the same fatal check (4.1) |
| **Blaming the GPU/driver for the crash** | `restore sp` sounds graphics-adjacent | ❌ It's the translator's stack invariant |
| **`Unexpected CPU variant for x86`** | Sounds like a CPU-support error | ❌ Benign ART noise (4.7) |

## 8. Concepts → where each is explained (no duplicates)

| Concept | Explained in |
|---|---|
| Native bridge / `NativeBridgeItf`, why only itu can work | `02-STORY.md` §3.1 |
| berberis vs libndk_translation vs libhoudini; which to use when | `02-STORY.md` §3 · `research/FGO-on-Linux-ARM-emulation-report.md` |
| The `ExecuteGuestCall` SP invariant (the actual bug) | `02-STORY.md` §3.3 · `research/ACE-ARCHITECTURE-AND-CONTAINER-VIABILITY.md` §5 |
| houdini "timebomb" (counter gate) + symlink-topology SIGILL | `02-STORY.md` §3.2 · `research/FGO-on-Linux-ARM-emulation-report.md` §3.2 |
| bionic vs glibc ABI → why NVIDIA can't be injected | `02-STORY.md` §2.1 · `archive/waydroid-ubuntu2204-nvidia-report.md` |
| Why Wine/Proton/box64/FEX can't help | `02-STORY.md` §2.2 |
| X11 vs Wayland, nested Weston, explicit sync | `02-STORY.md` §4 |
| ACE internals (userspace, server-side verdicts) | `research/ACE-ARCHITECTURE-AND-CONTAINER-VIABILITY.md` |
| LXC vs Docker containers, binderfs, `gpu_mode` | `02-STORY.md` §2 · `04-CLEANUP.md` §5.4 |
| 16 KB page size and why ACE's library breaks | `02-STORY.md` §3 · 3.1 above |
| KVM, gfxstream/ANGLE/SwiftShader, SurfaceFlinger | `02-STORY.md` §4 · 2.2 above |
| Host-bug vs scheme-limit framing (method) | `archive/ANDROID-模拟器-困境与出路.md` (Chinese, session 1) |
| The Arknights control case | `archive/为什么明日方舟能在Ubuntu上运行.md` (Chinese) |
| Dynamic partitions (`super`, what `system.img` really is) | `02-STORY.md` §10.2 |
| `NativeBridgeItf` in depth (`loadLibrary`, `getTrampoline`, `createNamespace`) | `02-STORY.md` §10.1 |

---

## 9. Corrections register — claims in the archived documents that are **wrong**

The documents in `docs/archive/` (and the two `research/` reports) are session-1 history and were
deliberately **not** rewritten, so their reasoning trail stays intact. Several of their conclusions were
later falsified. Carry this table if you read them.

| Wrong claim | Where it appears | Correct fact |
|---|---|---|
| "Only `google_apis_playstore` images ship ARM translation" | `archive/ANDROID-模拟器-困境与出路.md`, `archive/为什么明日方舟能在Ubuntu上运行.md` | **All three** API 35 images set `ro.dalvik.vm.native.bridge=libndk_translation.so` — read their `build.prop` |
| "redroid won't connect because the emulator holds adb port 5555" | `archive/FGO-STATUS-…-round2.md` §9 | The container had **no network attachment at all**, and `binder_linux` was unloaded (container exits `129` with no logs) — see 6.1/6.2 |
| "redroid + libndk SIGSEGVs 3/3 in 60–80 ms — intrinsic to the stack" | `archive/…`, `research/ACE-…` §3.1 | That was a **silently reverted bridge install** (container recreated, houdini swap lost); the bundled 2023 libndk crashes `zygote64` itself — see 4.8 |
| "redroid's blocker is performance / ANR" | `archive/…` | The six ANRs are **mouse-hover input timeouts** (5.1); with touch-only input there is no ANR. The real redroid blocker is a Unity busy-wait (6.5) |
| "FGO 国服 does not ship Tencent ACE" | `research/FGO-on-Linux-ARM-emulation-report.md` §8.1 | It **does**: `libtersafe2.so` (5,608,784 B) + `libtprt.so`, `com.ace.gshell.GP6Service/GP7Service/GP7Worker` in its own manifest |
| "Waydroid on NVIDIA: ruled out, no workaround" | `archive/waydroid-ubuntu2204-nvidia-report.md`, `research/…` §9.1 | Stock Waydroid is hard-blocked (6.6), **but** a community fork plus `persist.waydroid.use_subsurface=false` reportedly retains GPU acceleration — untested here, and it expects KWin/Plasma 6, not this GNOME 42 X11 desktop |
| "ARM64 AVDs work, just slowly" | `archive/ANDROID-EMULATOR-UBUNTU.md` §3h, `archive/ANDROID-模拟器-困境与出路.md` | **Refused at launch**: `PANIC: … arm64 … not supported by the QEMU2 emulator on x86_64 host` (2.1) |
| Older environment numbers: driver 580.76.05, emulator 36.1.9, `llvmpipe` rendering | `archive/ANDROID-EMULATOR-UBUNTU.md`, `archive/waydroid-…` | Final state: driver **595.91.07** (open module, real GLX), emulator **37.3.2**, API **36.0** image |
| "`nvidia-settings` mismatch fixed" | `archive/ANDROID-模拟器-困境与出路.md` §9 | **Still mismatched** (615.71.09 vs 595.91.07) — `04-CLEANUP.md` §6.3 |
| "FGO can't run on the AVD; the transplanted bridge is the workaround" | `archive/FGO-STATUS-…-round2.md` §9.4, `evidence/fgo-attempts/api36/FINDINGS-LOGIN-PAGE.md` | The **final, working** run used the **stock** Android 16.0 bridge (`fbadc774…`) with **no** `-writable-system`; the transplanted 16.1 set (`af88b2c1…`) is the configuration that **hangs** (4.2). Both statements were true at different moments of the investigation — the FINDINGS file describes an intermediate experiment, not the solution |
| `Cores = 1` (redroid) / `Cores = 2` (AVD) reported to Unity | `archive/FGO-STATUS-…` §5 | The guest really has 20 CPUs; this is a **native-bridge mis-report** (4.7-adjacent, see 6.5) |

---

## 10. Measuring the frame rate yourself (the metric that actually matters here)

`dumpsys gfxinfo` is **useless for FGO**: Unity draws on its own surface, so the hwui counters report ~0
frames (an early attempt to measure this way produced a completely misleading "39 % janky" reading from
66 frames). Use SurfaceFlinger's per-frame timestamps for the game's **BLAST layer** instead:

```bash
ADB=$ANDROID_SDK/platform-tools/adb
D=emulator-5554
# 1) find the layer (Unity's SurfaceView — the one tagged BLAST)
L=$($ADB -s $D shell "dumpsys SurfaceFlinger --list" | tr -d '\r' \
    | sed -n 's/.*RequestedLayerState{\(.*\)}$/\1/p' | grep -i fatego | grep -i BLAST | head -1 \
    | sed 's/ parentId=.*//')
# 2) the last ~128 frames; each row is "desired  actual  ready" in nanoseconds
$ADB -s $D shell "dumpsys SurfaceFlinger --latency '$L'" > /tmp/lat.txt
# 3) fps, worst frame, missed vsync
awk 'NR>1 && NF==3 && $2>0 {n++; if(!t0)t0=$2; t1=$2
     if(prev){d=($2-prev)/1e6; s+=d; if(d>mx)mx=d} prev=$2
     if($2-$1>16666666) late++}
     END{printf "%.1f fps  avg %.1f ms  worst %.0f ms  missed-vsync %.0f%%\n",
         (n-1)/((t1-t0)/1e9), s/(n-1), mx, 100*late/n}' /tmp/lat.txt
```

**How to read it:** `30.0 fps` with a worst frame under ~50 ms is the healthy state for FGO — the game caps
itself at 30, so more is neither expected nor possible. If you see 17–23 fps with ~30 % missed vsync, the
emulator is running on the E-cores → fix it per §2.9.
