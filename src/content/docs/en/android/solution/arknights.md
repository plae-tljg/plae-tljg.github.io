---
title: "Arknights on the same machine"
summary: "all. It runs on its own AVD and is not being migrated to the Android 16 base — this document records the configuration that works, as-is, for future …"
lang: en
translationKey: "android-solution-arknights"
slug: arknights
track: android
stage: solution
order: 2
date: 2026-10-04
tags: []
status: en draft
source: android_gaming:docs/05-ARKNIGHTS.md
---
*The second game in this project, and the **control case** that proved the ARM translation path works at
all. It runs on its own AVD and is **not** being migrated to the Android 16 base — this document records
the configuration that works, as-is, for future use.*

Package: `com.hypergryph.arknights` (ARM64-only) · Status: ✅ **fully playable**

---

## 1. Verified result

| What | Evidence |
|---|---|
| Game process alive and foreground | `com.hypergryph.arknights` pid 2876, Activity `com.u8.sdk.U8UnityContext`, **18 min 22 s** continuous |
| Full resource download | **14,975 MB (≈15 GB)** of game data |
| Actually played | in-game screenshot of a finished battle — **任务失败 / MISSION FAILED** (`evidence/fgo-work/arknights.png`) |
| Stability | **0 fatal signals, 0 ANR, 0 `restore sp`** assertions over the run |
| ABI under translation | `primaryCpuAbi=arm64-v8a` |
| Rendering | guest GLES reported as the real GPU: `(NVIDIA GeForce RTX 5060 Ti/PCIe/SSE2)` |

That last row is the important one historically: Arknights worked **while FGO was failing on the very same
AVD with the very same stock bridge** — which is what turned "Linux can't run these games" into "FGO trips a
specific translator bug" (see `02-STORY.md` §5).

---

## 2. The working configuration (do not change it)

| Element | Value |
|---|---|
| AVD | **`pixel_gaming`** (`~/.android/avd/pixel_gaming.avd/`) |
| System image | `system-images;android-35;google_apis_playstore;x86_64` — **Android 15 (API 35)**, `user` build |
| ABI | `x86_64` guest + ARM translation for the game |
| RAM / heap | **16384 MB** / `vm.heapSize=1024` |
| Cores | `hw.cpu.ncore=8` (the emulator clamps to 6) |
| Data partition | **100 GB** (the game alone holds ~15 GB) |
| GPU | `hw.gpu.mode=host` → real NVIDIA GLES |
| Native bridge | the image's **stock** `libndk_translation.so`, **berberis 0.2.3**, BuildID `3bdce8491a367d18e6b73dc5f0f90ffa`, sha256 `5c88c04fe52eeb8d…`, 3,612,288 B — a copy is kept at `tools/bridges/current.so` |
| Modifications | **none** — no `-writable-system`, no translator swap, no houdini |

Boot it exactly like the FGO AVD:

```bash
SDK=$ANDROID_SDK
$SDK/emulator/emulator -avd pixel_gaming -gpu host -accel on -no-boot-anim
# or just press ▶ on "pixel_gaming" in Android Studio's Device Manager
```

⚠️ **One emulator at a time.** Arknights' AVD wants 16 GB and the FGO AVD wants 8 GB; running several
emulators plus a browser is what caused an OOM kill (`lmkd`) in session 1 that looked like random crashes.
The 16 GB setting here was restored on 2026-10-04 after having been cut to 6 GB during that incident
(`04-CLEANUP.md` §7).

---

## 3. Why it works (and why that mattered)

Arknights is ARM64-only, so it exercises exactly the same machinery FGO does:

```
com.hypergryph.arknights  (arm64-v8a .so files)
        │
        ├── x86_64 Android system runs natively (full speed)
        ├── the game's ARM64 code is translated in-process by
        │   libndk_translation.so  ("berberis"), selected by
        │   ro.dalvik.vm.native.bridge
        └── real GPU via -gpu host
```

Three conditions have to hold at once — KVM for the CPU, the complete NVIDIA **graphics** stack (not just
CUDA), and an image whose translator actually supports ARM64. All three are documented in
`01-SOLUTION.md` §1–2 because they are common to both games.

What Arknights proves is the negative: it runs **with the same ACE anti-cheat family that FGO ships**
(9 ACE-related entries in its manifest, `libtersafe2.so` / `libtprt.so` present). So when FGO died with
`berberis: Guest call didn't restore sp`, ACE could be ruled out — the failure had to be FGO's own ARM64
code paths tripping the translator's stack invariant (`02-STORY.md` §3.3, §5).

**Arknights never hit that invariant.** On the identical bridge and AVD, it completed a download, entered a
battle and settled it.

---

## 4. Anti-cheat notes (same ACE family as FGO)

| Question | Answer |
|---|---|
| Does Arknights ship ACE? | Yes — ACE entries in its manifest, `libtersafe2.so` + `libtprt.so` load normally |
| Does it block emulation? | **No, empirically** — it played through battles on this stock AVD |
| Does the ACE worker process crash-loop matter? | **No** — `GP7Service`/`GP7Worker` restarting does not affect the main process (the same loop appears in FGO runs that play fine — `03-TROUBLESHOOTING.md` 5.3) |
| Can ACE be removed? | **No** — it is loaded from a static initialiser (`AceApplication.<clinit>`); blanking the libraries causes an instant `UnsatisfiedLinkError`. Don't try |
| Risk | Verdicts are decided **server-side**. Emulators are not named in the ToS, but bans target RMT / mods / 24 h automation. Play normally on an account you can afford to risk |

---

## 5. If you ever need to rebuild this AVD

Two things to know before you wipe anything:

1. **We did not keep an Arknights APK.** `assets/` holds only the FGO clients. The game in `pixel_gaming`
   was installed inside that AVD, and its 15 GB of resources live in
   `~/.android/avd/pixel_gaming.avd/userdata-qemu.img.qcow2` (**44 GB on disk**). **Losing that file means
   re-downloading and re-installing the game** — so back it up before any reset, and never "clean up" the
   AVD folder.
2. **Reinstall route:** that AVD uses a **Play Store** image, so the simplest path is to install it from the
   Play Store inside the emulator (sign in with a Google account, register the device at
   `google.com/android/uncertified` if Play Protect complains). Alternatively sideload an APK you obtain
   yourself; the AVD's `abilist` is `x86_64,arm64-v8a`, so an `arm64-v8a` build installs and is translated.

Minimal rebuild recipe (if you ever must):

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

Back up / keep it healthy:

```bash
# the whole AVD is the save: back this directory up (60 GB) before any reset
du -sh ~/.android/avd/pixel_gaming.avd
# when it is NOT running, a cold copy is enough:
rsync -a --info=progress2 ~/.android/avd/pixel_gaming.avd/ /path/to/backup/pixel_gaming.avd/
```

---

## 6. Health check (run when something looks wrong)

```bash
export PATH=$PATH:$ANDROID_SDK/platform-tools
adb devices -l                                   # expect emulator-5554 with the game's AVD
adb shell getprop ro.build.version.sdk           # 35
adb shell getprop ro.dalvik.vm.native.bridge     # libndk_translation.so
adb shell dumpsys SurfaceFlinger | grep -m1 '^GLES'   # must name the NVIDIA GPU, not llvmpipe
adb shell ps -A | grep hypergryph                # process alive?
adb logcat -d | grep -cE "Fatal signal|ANR in"   # want 0
```

If `GLES` says `llvmpipe`, the host graphics stack is broken again — fix that first
(`03-TROUBLESHOOTING.md` 1.2), because then *everything* is slow, not just this game. (Session 1 measured
**30–60 seconds per frame** under `llvmpipe`; the same game is playable with the real driver.)

---

## 7. Where this fits in the doc set

| Topic | Document |
|---|---|
| The ARM64-translation concept, and why Arknights is the control case | `02-STORY.md` §3, §5 |
| The original (Chinese) explainer written at the time | `docs/archive/为什么明日方舟能在Ubuntu上运行.md` |
| Host prerequisites shared with FGO (KVM, NVIDIA graphics stack) | `01-SOLUTION.md` §1–2, `03-TROUBLESHOOTING.md` §1 |
| Translators: berberis vs libhoudini, the houdini "timebomb" | `02-STORY.md` §3.2, `docs/research/FGO-on-Linux-ARM-emulation-report.md` §3 |
| Do-not-delete rules and housekeeping | `04-CLEANUP.md` §3.1, §7 |
| Provenance of the bridge file kept as `tools/bridges/current.so` | `SOURCES.md` §2 |
