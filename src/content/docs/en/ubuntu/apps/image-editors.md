---
title: "Image Editing Tools"
summary: "sudo apt-get install gimp"
lang: en
translationKey: "ubuntu-apps-image-editors"
slug: image-editors
track: ubuntu
stage: apps
order: 6
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/apps/common/image_editors.md
aiTranslated: true
---
## GIMP

```bash
sudo apt-get install gimp
```

## KolourPaint

```bash
sudo apt-get install kolourpaint
```

## Draw.io (diagrams.net)

### Method 1: Using AppImage

Download the AppImage from the [draw.io official site](https://github.com/jgraph/drawio-desktop/releases):

```bash
chmod +x drawio-x.x.x-x86_64.AppImage
./drawio-x.x.x-x86_64.AppImage
```

### Method 2: Using Snap

```bash
sudo snap install drawio
```

### Method 3: Using a .deb package

Download the .deb file from the [draw.io official site](https://github.com/jgraph/drawio-desktop/releases):

```bash
sudo dpkg -i drawio-amd64-x.x.x.deb
sudo apt --fix-broken install
```

## ImageMagick

```bash
sudo apt-get install imagemagick
```
