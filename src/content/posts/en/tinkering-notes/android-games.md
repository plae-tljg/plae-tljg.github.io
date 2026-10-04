---
title: 02 Twelve Dead Ends and One Image Version
summary: >-
  Two days of redroid, Waydroid, a houdini transplant and hex patches; what
  fixed it was one system-image version. The blocker was a stack-pointer assert
  in berberis 0.2.3 that FGO misses by 0x10. The recipe and the symptom index
  live in the manual.
lang: en
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
aiTranslated: true
source: seasons/03-tinkering/02-android-games.en.md
syncedAt: '2026-10-04T14:43:38.333Z'
---
Target is specific: run FGO CN `com.bilibili.fatego` v2.129.0 on this Ubuntu 22.04 (i5-13500 / 31 GB / RTX 5060 Ti / X11). Already failed three rounds before: Genymotion, Bliss OS, Android Studio built-in emulator.

Two days later it was running, and **without changing any system files**: raw image, zero patches, no houdini. Complete config, commands, and self-check methods in the manual's [Solution & Configuration](/zh/docs/android/solution/); look up by symptom in [Troubleshooting](/zh/docs/android/trouble/).

## Fix the host first, otherwise every step's conclusion is fake

Before starting, the host itself had two pits:

1. **Current user not in `kvm` group.** `kvm_intel` already loaded, `/dev/kvm` also present, but current user can't read it, emulator degrades to pure software emulation. If this isn't fixed, all "lag" afterward can't be distinguished as translation layer problem or simply no hardware acceleration.
2. **NVIDIA driver installed as compute-only.** `nvidia-smi` normal, CUDA runs, but `libGLX_nvidia` / `libEGL_nvidia` not installed, guest actually uses `llvmpipe` to draw. Manifestation: Android can start, can tap, game loads resources then stops at launch screen.

The second one is especially worth writing down because it makes all experimental conclusions distorted—you'd think the translation layer doesn't work, but actually there's no GPU at all. Judgment takes just one line `glxinfo -B`, details in another article: [Driver installed, but no rendering](/zh/writing/nvidia-drivers/).

## Control group: Arknights ran first

After fixing those two, first tried Arknights with API 35 `pixel_gaming` AVD (`google_apis_playstore`, 16 GB memory / 100 GB data partition): downloaded 15 GB resources, finished a battle, **0 crashes**.

The value of this control is it narrows the conclusion: same mechanism works, so the problem can only be on the FGO side, not "Linux can't run Android games". Every subsequent failure I used it to calibrate—this is also why I didn't continue investing in container solutions.
## 51 seconds

FGO dies at around 51 seconds every time on the same AVD, with stable reproduction:

```console
F berberis: Guest call didn't restore sp: expected 0x…fd0, actual 0x…fc0
F libc    : Fatal signal 6 (SIGABRT) … pid … (bilibili.fatego)
```

`berberis` is the ARM translation layer in this image. Its `ExecuteGuestCall` requires the guest to restore the stack pointer **byte for byte** on return, and FGO is off by a full `0x10`. This is not a configuration issue, it is an assertion; all three API 35 libndk builds that were available at the time carried this check.

## Places tried, and their respective signatures

- **Containers**: redroid (Android 13 running in Docker) with Intel houdini. Unity came up, but `UnityMain` busy-waits and saturates a whole core, and the screen freezes at the splash page — the container can't get a GPU on NVIDIA hardware. Waydroid is even more direct: its source hard-codes `unsupported = ["nvidia"]` (`tools/helpers/gpu.py`), for ABI reasons — Android uses bionic libc, and NVIDIA's user-space driver stack only ships a glibc build.
- **Porting the translation layer**: shoving houdini into the AVD segfaults in its own loader (`s_000067+1227`, `Fatal error (ID:0x01900158)`), and a different libndk build behaves the same.
- **Patching the binary**: patched that assertion with a single byte, and it landed in `int3` padding; swapping in the berberis from 16.1 turned the error into a warning `Trying to restore sp and continue...`, but the game got stuck at the ACE/login handoff.
- **Swapping images**: Android 16.1 loops on a SurfaceFlinger assertion at boot (`!rcEnc->featureInfo()->hasReadColorBufferDma`); the 16 KB page-size image makes ACE's `libtersafe2.so` fail outright with `dlopen failed: empty/missing DT_HASH/DT_GNU_HASH`; copying `libnbaio.so` / `libnblog.so` into `/system` keeps the system from booting.

There is also a category of **wrong-direction attempts**: Wine / Proton / box64 / FEX are all no help. They translate Windows APIs or a different instruction set, whereas what is needed here is an Android ARM translation layer that implements `NativeBridgeItf` — and Android's emulator explicitly refuses to run an `arm64` guest on an x86_64 host (`PANIC: Avd's CPU Architecture 'arm64' is not supported by the QEMU2 emulator on x86_64 host`); that is policy, not a bug.

## The one variable that made it work

Swapping the system image to **`system-images;android-36;google_apis;x86_64` (Android 16.0 rev 7, userdebug)**, stock and unmodified. Its translation layer is berberis **16.0.0** (`libndk_translation.so`, sha256 `fbadc774c989534a…`, 5,403,704 bytes), which does not trip that assertion.

Config: AVD `api36`, 8 GB RAM / 6 cores / 32 GB data partition, device profile `pixel_7`, emulator 37.3.2, boot arguments `-gpu host -accel on -no-boot-anim`, and **do not add** `-writable-system` — adding it would activate whatever was copied into `/system` last time (on this machine that happened to be the failed 16.1 port, `af88b2c1…`, which gets the game stuck at login).

One quirk is worth knowing up front: on a fresh install with no game data yet, the first launch may still crash once (same `restore sp`, same 51 seconds). Just restart it and let it keep downloading; over the following hours of running there were 0 `restore sp` occurrences and 0 fatal signals. **An early crash is a first-launch phenomenon, not a dead end.**
## Making it smoother: not a memory problem

The first thing I did after getting it running was to ask: can it be made smoother, for instance by giving the AVD 16 GB? The question itself is a detour, and the answer isn't about memory either.

**Memory isn't the lever here.** About 4 GB of the guest's 8 GB is still free, and Android's `lmkd` has never triggered once; what is tight is the host (31 GB, no swap, about 20 GB already used). Raising the guest to 16 GB pushes the host toward OOM, and that kind of crash looks like random app terminations. On top of that, FGO locks itself to 30 fps on its own, so there were never more frames to chase.

The step that actually helped was **pinning the emulator to the P-cores (big cores)**. This i5-13500 has 6 P-cores (4.8 GHz) plus 8 E-cores (3.5 GHz), while qemu's default affinity is `0-19`: all 20 CPUs are available. Same battle, everything else unchanged:

| | fps | average frame | worst | vsync drops |
|---|---|---|---|---|
| Default (20 CPUs) | 17–23 | 42–59 ms | 101–117 ms | **30–35%** |
| Pinned to P-cores | **30.0** | 33.3 ms | 50–52 ms | **2–7%** |

```bash
P=$(lscpu -e=CPU,MAXMHZ | awk 'NR>1 && $2+0>4000{printf "%s,",$1}' | sed 's/,$//')
taskset -c "$P" emulator -avd api36 -gpu host -accel on -no-boot-anim
```

An emulator that is already running does not need a restart: `taskset -apc 0-11 $(pgrep -f '[q]emu-system-x86_64' | head -1)`.

**The limits of the evidence need to be stated plainly**: that pinning is faster is something I measured; **"because the threads landed on the E-cores" is an inference** — per-core utilization was never sampled during the whole run (no `mpstat`, no `perf`), and the only evidence about placement is a single `ps -o psr` snapshot, which was taken after pinning anyway. Equally untried are the governor (it was `powersave` the whole time) and `isolcpus` / `nohz_full`.

One more thing has to be corrected, because my later self is likely to cite it: **`dumpsys gfxinfo` is meaningless for FGO**. Unity draws on its own surface, and this command has read 66 frames and computed a "39% stutter" from them — a completely misleading number — and has also read 0 frames and a "percentile" of 4950 ms. To measure frames, use `dumpsys SurfaceFlinger --latency '<BLAST layer>'`.

Pinning cores does not save every stutter either: after running for a while it suddenly drops to 19.1 fps (41% drops), and `top` on the guest shows ACE's `memscan` walking memory (about 204% CPU after translation). That is the anti-cheat's own periodic cost, and no configuration change will solve it.

The full performance table and the self-check commands are in [Solution and configuration](/zh/docs/android/solution/), and the two related failures are 2.9 and 2.12 in [Troubleshooting](/zh/docs/android/trouble/).

## The anti-cheat is not the cause

The Chinese server build of FGO ships with Tencent ACE (`libtersafe2.so`, 5,608,784 bytes + `libtprt.so`). Before touching anything I was almost certain it was the one blocking us. In the end it blocked nothing, and it cannot be removed either — the static `<clinit>` runs from the very start.

But one thing has to be written down plainly: **the verdict is server-side**. Getting it running locally does not mean the account is safe, and there is no "confirmed fine" on this path.

## Aside: libhoudini's "time bomb"[^houdini]

What the community says is "houdini stops working after 9.1", which sounds like an expiry check. In reality it is a hardcoded counter comparison in the hpe-14 build, with no time-fetching call anywhere near it:

```asm
83 3d bf ac 76 00 02      cmp DWORD PTR [rip+0x76acbf], 0x2
0f 83 68 0d 00 00         jae 0xe6df3
```

The fix is to NOP out that six-byte `jae` (64-bit offset `0xe6085`, 32-bit `0x8a29a`) — **but those two offsets are valid for that one build only**, and applying them to another build breaks something else. That is also why I did not apply this patch on this machine: the houdini here is not hpe-14.

There is also a part that is not widely documented: houdini kills itself with `tkill(gettid(), SIGILL)` (signal 4, `SI_USER`, that is, sent by a process). The trigger is **symbolic link topology** having been disturbed — spreading byte-for-byte identical content across four ordinary files crashes it, and restoring the original symlink layout makes it behave normally again. **Topology, not content.** Any approach that packages it as a Magisk module or an overlay will, as soon as it happens to resolve the symlinks into ordinary files, give you a houdini that crashes every time, while nothing about the file contents looks wrong.

[^houdini]: Based on two public reverse-engineering efforts (`itstaftaf/houdini-timebomb-fix`, `Vvamp/Libhoudini-hpe-14-timebomb-patch`), plus this project's reproduction records in `docs/02-STORY.md` §3.2 and `docs/research/`.

## Why the dead ends are written down too

The biggest time-saver over these two days was not any successful step, but the directions others had already recorded as failures — Waydroid is unsupported on NVIDIA, ARM64 guests get rejected, SurfaceFlinger in 16.1 is broken. So the [Troubleshooting](/zh/docs/android/trouble/) page in the manual is deliberately long: **symptom → layer → cause → handling**, plus eleven false alarms.
