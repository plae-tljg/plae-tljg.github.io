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

<!--ref:/assets/vs_code/Visual Studio Code on Linux.html-->
> 参考（第三方页面）：[Official VS Code Installation](https://code.visualstudio.com/docs/setup/linux)

## Android Studio

First download the package from [https://developer.android.com/studio](https://developer.android.com/studio), you get the `.tar.gz`, then unzip it, and place it somewhere you like, then installation guide is in [https://developer.android.com/studio/install](https://developer.android.com/studio/install):  

Just execute the `android-studio/bin/studio.sh`.  

To create `.dsektop` entry to make it appear in app deck, follow:  

**Android Studio Desktop File**（`/lib/desktop_file/android_studio.desktop`）

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

<!--ref:/assets/android_studio/Install Android Studio _ Android Developers.html-->
> 参考（第三方页面）：[Official Android Studio Installation](https://developer.android.com/studio/install)

## Anaconda

To install anaconda, it is easy, no effort to write here.  

**Anaconda Desktop File**（`/lib/desktop_file/anaconda.desktop`）

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

**Arduino Desktop File**（`/lib/desktop_file/arduino.desktop`）

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

**Cursor Launcher File**（`/lib/cursor_ai/cursor_launcher.sh`）

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

**Cursor Desktop File**（`/lib/desktop_file/cursor_ai.desktop`）

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
