---
title: 03 libhoudini 的「定时炸弹」不是炸弹，是一个版本号
summary: >-
  社区里都说“houdini 到 9.1
  以后就不能用”，听起来像过期检查。实际是一段硬编码的计数器比较，附近没有任何取时间的调用；而它真正没被记录的杀招，是符号链接拓扑被动过时的一次自杀。
lang: zh
translationKey: houdini-timebomb
slug: houdini-timebomb
date: '2026-10-04'
series: tinkering-notes
seriesOrder: 3
tags:
  - 折腾
  - Android
  - 逆向
status: preview
source: seasons/03-tinkering/03-houdini-timebomb.zh.md
syncedAt: '2026-10-04T11:31:22.855Z'
---
<!-- 草稿：素材在 android_gaming/docs/02-STORY.md §3.2 与 docs/research/FGO-on-Linux-ARM-emulation-report.md。
     发布前确认署名与链接：itstaftaf/houdini-timebomb-fix、Vvamp/Libhoudini-hpe-14-timebomb-patch。 -->

# 「定时炸弹」是一个版本号

关于 libhoudini，流传最广的一句话是：**它到 9.1 以后就不让你用了**。听起来像一段过期检查——某个日期、某个时间戳，到了点就自毁。这也是"timebomb"这个名字的由来。

它不是。

## 实际是什么

在某一份从 Google Play Games for PC 镜像里拆出来的 libhoudini（hpe-14）中，问题位置是两条指令：

```asm
83 3d bf ac 76 00 02      cmp DWORD PTR [rip+0x76acbf], 0x2
0f 83 68 0d 00 00         jae 0xe6df3
```

一个内存里的整数，和一个字面量 `2` 比较，然后跳转。逆向这份代码的人写得很清楚：这是一个**构建/版本计数器**，附近**没有任何取时间的系统调用或运算**。

所以"定时炸弹"是个民间叫法，它真正的身份是**版本闸门**。之所以大家觉得像过期，是因为实际影响出现在某个时间点之后——那段时间里发行版更新，计数器越过了 `2`。

## 它长什么样

症状不像"授权失败"，而像卡死或崩溃：应用停在启动画面、无限加载，或者直接 `SIGILL` / `SIGABRT`，报错里点名 `libhoudini.so`，同时**一个进程吃掉超过 100% 的 CPU**（有人观察到 270%）。

## 补丁与它的边界

修法是把这个 `jae` 六字节 NOP 掉：

| 位数 | 文件偏移 | 原字节 | 补丁后 |
|---|---|---|---|
| 64 位 | `0xe6085` | `0f 83 68 0d 00 00` | `90 90 90 90 90 90` |
| 32 位 | `0x8a29a` | `0f 83 0b 0d 00 00` | `90 90 90 90 90 90` |

**但这两个偏移只对 hpe-14 那一个构建有效。** 我机器上那份根本不是 hpe-14；把网上的偏移直接套上去，改中的是别的东西——轻则无效，重则把一个能跑的文件改坏。任何"照着教程打补丁"的操作，第一步都应该是核对 sha256，而不是直接跳到偏移量。

## 没被记录过的第二段自毁

更值得写下来的是这个：houdini 还会**主动杀掉自己**——`tkill(gettid(), SIGILL)`，signal 4、code `SI_USER`。这是"人为发的信号"，不是硬件异常。

触发条件不是文件内容，而是**它在磁盘上的符号链接拓扑**。有人的对照实验是这样的：把**逐字节相同**的内容摊成四个独立普通文件，崩；恢复成原版符号链接布局（`/system/lib64/libhoudini.so → /vendor/lib64/libhoudini.so`），正常。

**拓扑，不是内容。** 这意味着任何把它打包成 Magisk 模块或 overlay 的做法，如果"顺手"把符号链接解成了普通文件，就会得到一个必然崩溃的 houdini——而且从文件内容上完全看不出问题。

## 三句话

1. 看到"timebomb"，先问它到底比较了什么，别接受名字给的解释。
2. 网上的字节偏移属于某一个构建；先对 hash，再动手。
3. 如果一个库的完整性检查包含**文件布局**，那么"内容一样"并不等于"等价"。
