---
title: "IP Camera"
summary: "> ⚠️ Legacy setup: this page records how I did it at the time; it may no longer apply."
lang: en
translationKey: "homelab-home-ip-cam-old"
slug: ip-cam-old
track: homelab
stage: home
order: 2
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/household/ip_cam/old/camera_monitoring.md
aiTranslated: true
---
> ⚠️ **Legacy setup**: this page records how I did it at the time; it may no longer apply.

Using an Android phone as a local camera for monitoring.

## Project Overview

Turning an Android device into an IP camera, based on the [BalioFVFX/IP-Camera](https://github.com/BalioFVFX/IP-Camera) project.

![Preview](https://github.com/BalioFVFX/IP-Camera/blob/main/media/preview.gif?raw=true)

[Fullscreen demo](https://youtu.be/NtQ_Al-56Qs)

## System Architecture

![Overview](https://github.com/BalioFVFX/IP-Camera/blob/main/media/high_level_overview.png?raw=true)

## Installation and Setup

### Ubuntu Server Setup

1. **Clone the project**:
   ```bash
   git clone https://github.com/BalioFVFX/IP-Camera.git
   cd IP-Camera
   ```

2. **Install dependencies**:
   ```bash
   # 安装 Node.js (如果还没有)
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # 安装项目依赖
   npm install
   ```

3. **Start the video server**:
   ```bash
   # 启动 VideoServer
   cd VideoServer
   node server.js
   ```

   By default, the video server starts 3 servers:
   - WebSocket server (port 1234)
   - MJPEG server (port 4444)
   - Camera server (port 4321)

### Android App Setup

1. **Download and install the app**:
   Download the Android APK from [GitHub Releases](https://github.com/BalioFVFX/IP-Camera/releases)

2. **Configure the server IP**:
   Open the app settings and enter the Ubuntu server's IP address, for example `192.0.2.101:4321`

3. **Start streaming**:
   Open the streaming interface and click the "Start Streaming" button

---

## Usage

### Start the live stream

You can watch the demo video or follow these steps:

1. Make sure the video server is running (see the Ubuntu setup above)
2. Install the app on an Android phone
3. Configure the camera server IP in the app settings (for example `192.0.2.101:4321`)
4. Open the streaming interface and click the "Start Streaming" button
5. The phone now sends video data to the camera server

### Watch the video stream

The video stream can be watched in a browser, a web app, or VLC media player.

#### Watch in a browser

Open a browser and go to the MJPEG server's IP address, for example `http://192.0.2.101:4444`

![Preview](https://github.com/BalioFVFX/IP-Camera/blob/main/media/browser.gif?raw=true)

#### VLC media player

Open VLC media player, File -> Open Network -> Network, and enter the MJPEG server IP address, for example `http://192.0.2.101:4444/`

![Preview](https://github.com/BalioFVFX/IP-Camera/blob/main/media/vlc.gif?raw=true)

#### Web app

1. Go into the WebApp directory and run `webpack serve` in the terminal
2. Open a browser and go to `http://localhost:8080/`
3. Go into settings and enter the WebSocket server IP address, for example `192.0.2.101:1234`
4. Open the streaming page `http://localhost:8080/stream.html` and click the connect button

![Preview](https://github.com/BalioFVFX/IP-Camera/blob/main/media/webapp.gif?raw=true)

### Configure the web app server (optional)

Note: this section is only needed when you take screenshots from the web app.

1. Open the WebAppServer project
2. Open index.js and edit the connection object to match your MySQL credentials
3. Run the SQL queries in `user.sql` to create the required tables
4. Run `node index.js` in the root directory
5. You may need to update the IP the web app connects to. You can edit this IP in the web app's `stream.html` file (the `BACKEND_URL` constant)
6. Create a user through the web app at `http://localhost:8080/register.html`
7. Take a screenshot from `http://localhost:8080/stream.html`
8. View the screenshots at `http://localhost:8080/gallery.html`

![Preview](https://github.com/BalioFVFX/IP-Camera/blob/main/media/webapp_gallery.gif?raw=true)

---

## Tech Stack

- **Android app**: Kotlin + Camera2 API
- **Video server**: Node.js
- **Web app**: JavaScript + WebSocket
- **Streaming formats**: MJPEG, WebSocket

## Use cases

- Plant growth monitoring
- Room security monitoring
- Pet activity monitoring
- Temporary security camera

## Notes

- All communication happens on the local network and is never exposed to the internet
- Make sure the Android device and the Ubuntu server are on the same WiFi network
- Video quality and frame rate depend on network conditions and device performance
- Use a stable WiFi connection for the best experience
