---
title: "IDE Installation"
summary: "Just get its .deb file and dpkg -i install it."
lang: en
translationKey: "ubuntu-apps-ide"
slug: ide
track: ubuntu
stage: apps
order: 5
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/apps/common/ide.md
---
## VS Code

Just get its `.deb` file and `dpkg -i` install it.  

<figure class="archive-viewer" data-src="/archives/ubuntu-setup/assets/vs_code/Visual%20Studio%20Code%20on%20Linux.html" data-title="Official VS Code Installation" data-origin="https://code.visualstudio.com/docs/setup/linux">
  <figcaption class="archive-viewer__head">
    <span class="archive-viewer__label">第三方页面存档</span>
    <a href="https://code.visualstudio.com/docs/setup/linux" rel="noopener" target="_blank">Official VS Code Installation</a>
    <span class="archive-viewer__actions">
      <button type="button" data-archive-open>展开存档</button>
      <a href="/archives/ubuntu-setup/assets/vs_code/Visual%20Studio%20Code%20on%20Linux.html" target="_blank" rel="noopener">新窗口</a>
    </span>
  </figcaption>
  <p class="archive-viewer__note">他人页面的本地快照，版权归原作者；存档不会执行其中的脚本。</p>
  <div class="archive-viewer__body"></div>
</figure>

## Android Studio

First download the package from [https://developer.android.com/studio](https://developer.android.com/studio), you get the `.tar.gz`, then unzip it, and place it somewhere you like, then installation guide is in [https://developer.android.com/studio/install](https://developer.android.com/studio/install):  

Just execute the `android-studio/bin/studio.sh`.  

To create `.dsektop` entry to make it appear in app deck, follow:  

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

<figure class="archive-viewer" data-src="/archives/ubuntu-setup/assets/android_studio/Install%20Android%20Studio%20_%20Android%20Developers.html" data-title="Official Android Studio Installation" data-origin="https://developer.android.com/studio/install">
  <figcaption class="archive-viewer__head">
    <span class="archive-viewer__label">第三方页面存档</span>
    <a href="https://developer.android.com/studio/install" rel="noopener" target="_blank">Official Android Studio Installation</a>
    <span class="archive-viewer__actions">
      <button type="button" data-archive-open>展开存档</button>
      <a href="/archives/ubuntu-setup/assets/android_studio/Install%20Android%20Studio%20_%20Android%20Developers.html" target="_blank" rel="noopener">新窗口</a>
    </span>
  </figcaption>
  <p class="archive-viewer__note">他人页面的本地快照，版权归原作者；存档不会执行其中的脚本。</p>
  <div class="archive-viewer__body"></div>
</figure>

## Anaconda

To install anaconda, it is easy, no effort to write here.  

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

To install arduino, it is easy, no effort to write here.  

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

To install AI IDE like cursor,  

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
