---
title: "Common Command for Audio"
summary: "spd-say 'lkm' spd-say \"mu ka de ku lun no ka\""
lang: en
translationKey: "ubuntu-shell-audio-cmd"
slug: audio-cmd
track: ubuntu
stage: shell
order: 4
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/utils/common_cmd/audio_cmd.md
---
## spd-say

```bash
spd-say 'lkm'
spd-say "mu ka de ku lun no ka"
```

## Espeak

Try install espeak and do TTS:  

<!--ref:/assets/espeak/解决espeak编译的一些问题 - inss!w! - 博客园.html-->
> 参考（第三方页面）：[Compile for Espeak](https://www.cnblogs.com/Hfolsvh/p/15057694.html)
> 本地存档：[快照](/archives/ubuntu-setup/assets/espeak/%E8%A7%A3%E5%86%B3espeak%E7%BC%96%E8%AF%91%E7%9A%84%E4%B8%80%E4%BA%9B%E9%97%AE%E9%A2%98%20-%20inss!w!%20-%20%E5%8D%9A%E5%AE%A2%E5%9B%AD.html)

```bash
espeak -v en-us -s 150 -p 50 -w my_speech.wav "This is a custom voice with adjusted speed and pitch."

espeak -v zh -s 150 -p 50 -w my_speech1.wav "阿米诺斯"

espeak -v zh-yue -s 150 -p 50 -w my_speech1.wav "啊米诺斯"
```

If used for asterisk, do some sox:  

```bash
sox my_speech1.wav -r 8000 -c 1 -e signed-integer -b 16 asterisk_speech.wav
```

Unified commands as follows:  

```bash
espeak -v zh -s 150 -p 50 --stdout "阿米诺斯" | sox -t raw -r 22050 -c 1 -e signed-integer -b 16 - -r 8000 -c 1 -e signed-integer -b 16 welcome.wav
espeak -v zh -s 150 -p 50 --stdout "一德格拉米" | sox -t raw -r 22050 -c 1 -e signed-integer -b 16 - -r 8000 -c 1 -e signed-integer -b 16 menu.wav
espeak -v zh -s 150 -p 50 --stdout "阿莫西诺斯" | sox -t raw -r 22050 -c 1 -e signed-integer -b 16 - -r 8000 -c 1 -e signed-integer -b 16 bye.wav
```
