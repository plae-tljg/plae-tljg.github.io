---
title: "Image seeds: hiding files inside pictures"
summary: "Sometimes you receive large files of small pictures of short videos, there is possiblity that it is an image seed."
lang: en
translationKey: "ubuntu-shell-hidden-images"
slug: hidden-images
track: ubuntu
stage: shell
order: 11
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/utils/interesting_cmd/hidden_img.md
aiTranslated: true
---
Sometimes you receive large files of small pictures of short videos, there is possiblity that it is an image seed.  

Try rename it to `.zip`, `.rar`, `.7z` and on ubuntu unzip it in nautilus or terminal with `uzip`, `unzip`, `urar`, `unrar` (dont remember which is correct).  

If it is with password, you can consider the GPU password cracker of mine.  

## How to generate an image seed

Just use `cat` to append files.  

```bash
cat image.jpg data.zip > hidden_image.jpg
```

<br />

Try download following file and rename file extension to `.7z`:  

![Example image seed picture](/assets/image_seeds/hybrid.png)

> The picture above is about 32 MB and is not published with the site.

## How to tell if it is an image seed

General technique is to check whether the image or video is too small compared to what its resolution should need. For example when you download something from Wallpaper engine.  

```bash
binwalk hybrid.png
unzip hybrid.png
```

Technically just use ffmpeg, sox, vlc so on and some basic media files, then you know whether it is too large:  

For images:  

```bash
identify -format "%[opaque]" test.png
identify -format "%[channels]" test.png
identify -format "%z" test.png
ffprobe -v quiet -show_entries stream=width,height -of csv=p=0 test.png # dimension of photo
```

Just calculate `width * height * bytes per pixel`, see if the number is larger than your file size.  

For videos,  

```bash
 ffprobe -v quiet -show_format -show_streams test.mp4
```

See the `bit_rate` multiplied by `duration` for each stream (maybe one stream for audio and one stream for picture).  

## Steghide

Try `steghide` which will be less likely to be affected by CDN compression,  

for hiding,  

```bash
steghide embed -cf mooeow.wav -ef secret.pdf    # hide pdf in wav

steghide embed -cf mooeow.wav -ef secret.pdf -p mewbies -sf mooeow_secret.wav   # hiding with password and output name

```

for decrypting:  

```bash
steghide info mooeow_secret.wav -p mewbies
```

<figure class="archive-viewer" data-src="/archives/ubuntu-setup/assets/image_seeds/How%20To%20Conceal%20Data%20in%20An%20Audio%20Or%20Image%20File%20Using%20Steghide.html" data-title="Steghide" data-origin="https://mewbies.com/steganography/steghide/how_to_conceal_data_in_audio_or_image_file.htm">
  <figcaption class="archive-viewer__head">
    <span class="archive-viewer__label">Third-party page archive</span>
    <a href="https://mewbies.com/steganography/steghide/how_to_conceal_data_in_audio_or_image_file.htm" rel="noopener" target="_blank">Steghide</a>
    <span class="archive-viewer__actions">
      <button type="button" data-archive-open>Expand archive</button>
      <a href="/archives/ubuntu-setup/assets/image_seeds/How%20To%20Conceal%20Data%20in%20An%20Audio%20Or%20Image%20File%20Using%20Steghide.html" target="_blank" rel="noopener">New window</a>
    </span>
  </figcaption>
  <p class="archive-viewer__note">A local snapshot of someone else's page; copyright stays with the original author. The archive does not execute the scripts inside it.</p>
  <div class="archive-viewer__body"></div>
</figure>
