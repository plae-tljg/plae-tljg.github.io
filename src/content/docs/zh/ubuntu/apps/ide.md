---
title: "IDE 安装"
summary: "直接拿到 .deb 文件，用 dpkg -i 装上就行。"
lang: zh
translationKey: "ubuntu-apps-ide"
slug: ide
track: ubuntu
stage: apps
order: 5
date: 2026-01-04
tags: []
status: zh draft
source: plae-lkm/ubuntu_setup:docs/apps/common/ide.md
aiTranslated: true
---
## VS Code

直接拿到 `.deb` 文件，用 `dpkg -i` 装上就行。  

<figure class="archive-viewer" data-src="/archives/ubuntu-setup/assets/vs_code/Visual%20Studio%20Code%20on%20Linux.html" data-title="VS Code 官方安装指南" data-origin="https://code.visualstudio.com/docs/setup/linux">
  <figcaption class="archive-viewer__head">
    <span class="archive-viewer__label">第三方页面存档</span>
    <a href="https://code.visualstudio.com/docs/setup/linux" rel="noopener" target="_blank">VS Code 官方安装指南</a>
    <span class="archive-viewer__actions">
      <button type="button" data-archive-open>展开存档</button>
      <a href="/archives/ubuntu-setup/assets/vs_code/Visual%20Studio%20Code%20on%20Linux.html" target="_blank" rel="noopener">新窗口</a>
    </span>
  </figcaption>
  <p class="archive-viewer__note">他人页面的本地快照，版权归原作者；存档不会执行其中的脚本。</p>
  <div class="archive-viewer__body"></div>
</figure>

## Android Studio

先去 [https://developer.android.com/studio](https://developer.android.com/studio) 下载安装包，拿到的是 `.tar.gz`，解压之后放到你喜欢的任何目录，安装说明在 [https://developer.android.com/studio/install](https://developer.android.com/studio/install)：  

直接执行 `android-studio/bin/studio.sh`。  

要让它出现在应用列表里，就照下面写一个 `.dsektop` 条目：  

<!--code:title=Android Studio Desktop File · /lib/desktop_file/android_studio.desktop-->
```text
[Desktop Entry]
Type=Application
Name=Android Studio
Comment=Android Studio
Icon=/home/lkm/00app/android-studio-2024.1.1.13-linux/android-studio/bin/studio.png
Exec=/home/lkm/00app/android-studio-2024.1.1.13-linux/android-studio/bin/studio.sh
Categories=Graphics; # Choose an appropriate category.
Terminal=false
```

<br />

<figure class="archive-viewer" data-src="/archives/ubuntu-setup/assets/android_studio/Install%20Android%20Studio%20_%20Android%20Developers.html" data-title="Android Studio 官方安装指南" data-origin="https://developer.android.com/studio/install">
  <figcaption class="archive-viewer__head">
    <span class="archive-viewer__label">第三方页面存档</span>
    <a href="https://developer.android.com/studio/install" rel="noopener" target="_blank">Android Studio 官方安装指南</a>
    <span class="archive-viewer__actions">
      <button type="button" data-archive-open>展开存档</button>
      <a href="/archives/ubuntu-setup/assets/android_studio/Install%20Android%20Studio%20_%20Android%20Developers.html" target="_blank" rel="noopener">新窗口</a>
    </span>
  </figcaption>
  <p class="archive-viewer__note">他人页面的本地快照，版权归原作者；存档不会执行其中的脚本。</p>
  <div class="archive-viewer__body"></div>
</figure>

## Anaconda

装 anaconda 很简单，没什么好写的。  

<!--code:title=Anaconda Desktop File · /lib/desktop_file/anaconda.desktop-->
```text
[Desktop Entry]
Type=Application
Name=Anaconda
Comment=Anaconda
Icon=/home/lkm/00app/anaconda3/anaconda.png
Exec=/home/lkm/00app/anaconda3/bin/anaconda-navigator
Categories=Graphics; # Choose an appropriate category.
Terminal=false
```

## Arduino

装 arduino 很简单，没什么好写的。  

<!--code:title=Arduino Desktop File · /lib/desktop_file/arduino.desktop-->
```text
[Desktop Entry]
Type=Application
Name=Arduino
Comment=Arduino IDE
Icon=/home/lkm/00app/arduino-ide_2.3.2_Linux_64bit/resources/app/resources/icons/512x512.png
Exec=/home/lkm/00app/arduino-ide_2.3.2_Linux_64bit/arduino-ide
Categories=Graphics; # Choose an appropriate category.
Terminal=false
```

## Cursor

要装 cursor 这种 AI IDE，  

<!--code:title=Cursor Launcher File · /lib/cursor_ai/cursor_launcher.sh-->
```text
#!/bin/bash
appimage=$(find /home/fit/.app -name "cursor*.AppImage" -print -quit)
if [[ -f "$appimage" ]]; then
    exec "$appimage"
else
    echo "Cursor AppImage not found!" >&2
    exit 1
fi
```

<!--code:title=Cursor Desktop File · /lib/desktop_file/cursor_ai.desktop-->
```text
[Desktop Entry]
Type=Application
Name=Cursor
Comment=Cursor App
Icon=/home/lkm/00app/cursor/00icon/cursor-ai.jpeg
Exec=/home/lkm/00app/cursor/cursor_launcher.sh
Categories=Graphics; # Choose an appropriate category.
Terminal=false
```
