---
title: 02 图种：把文件藏进图片里
summary: >-
  Sometimes you receive large files of small pictures of short videos, there is
  possiblity that it is a 图种.
lang: zh
translationKey: tinkering-hidden-images
slug: tinkering-hidden-images
date: '2026-10-01'
series: tinkering-notes
seriesOrder: 2
tags:
  - 折腾
  - Ubuntu
status: preview
source: seasons/03-tinkering/02-hidden-images.zh.md
syncedAt: '2026-10-04T10:26:34.592Z'
---
<!-- 草稿：从 plae-lkm/ubuntu_setup 的 docs/utils/interesting_cmd/hidden_img.md 导入，等待重写。
     原文的示例图片有 31 MB，没有随站点发布。文章里要换成一张小图或直接给命令与判断方法。
     命令与截图先不删，重写时再决定留哪些。 -->
# 图种

Sometimes you receive large files of small pictures of short videos, there is possiblity that it is a 图种.  

Try rename it to `.zip`, `.rar`, `.7z` and on ubuntu unzip it in nautilus or terminal with `uzip`, `unzip`, `urar`, `unrar` (dont remember which is correct).  

If it is with password, you can consider the GPU password cracker of me.  

## How to generate a 图种

Just use `cat` to append files.  

```bash
cat image.jpg data.zip > hidden_image.jpg
```

<br />

Try download following file and rename file extension to `.7z`:  

![示例图种图片](/assets/image_seeds/hybrid.png)

> 上图约 32 MB，未随站点发布。

## How to track If it is 图种

General technique is to get whether the image or video is too small compared to its size. For example when you download someting from Wallpaper engine.  

```bash
binwalk hybrid.png
unzip hybrid.png
```

Technically just use ffmpeg, sox, vlc so on and some basis of media files, then you know whether it is too large:  

For images:  

```bash
identify -format "%[opaque]" test.png
identify -format "%[channels]" test.png
identify -format "%z" test.png
ffprobe -v quiet -show_entries stream=width,height -of csv=p=0 test.png # dimension of photo
```

Just calculate `width * height * bytes per pixel`, see if the number larger than your file size.  

For videos,  

```bash
 ffprobe -v quiet -show_format -show_streams test.mp4
```

See the `bit_rate` multiplied by `duration` for each stream (maybe one stream for audio and one stream for picture).  

## Steghide

Try `steghide` which will be less likely be affected by CDN compression,  

for hiding,  

```bash
steghide embed -cf mooeow.wav -ef secret.pdf    # hide pdf in wav

steghide embed -cf mooeow.wav -ef secret.pdf -p mewbies -sf mooeow_secret.wav   # hiding with password and output name

```

for decrypting:  

```bash
steghide info mooeow_secret.wav -p mewbies
```

<!--ref:/assets/image_seeds/How To Conceal Data in An Audio Or Image File Using Steghide.html-->
> 参考（第三方页面）：[Steghide](https://mewbies.com/steganography/steghide/how_to_conceal_data_in_audio_or_image_file.htm)
