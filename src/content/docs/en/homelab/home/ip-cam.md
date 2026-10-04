---
title: "IP Camera - CameraLink App"
summary: "Use an Android phone as a local camera for monitoring. The new version uses the CameraLink app, which is simpler than the old version and does not require an extra server."
lang: en
translationKey: "homelab-home-ip-cam"
slug: ip-cam
track: homelab
stage: home
order: 1
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/household/ip_cam/ip_cam.md
aiTranslated: true
---

## Overview

CameraLink is an open-source Android application that can convert any Android 12+ device into an HTTP-based IP camera. The application supports continuous streaming with the screen turned off and provides a browser-friendly MJPEG stream.

**Note**: This is a modified version of [onepersonhere/camera-link](https://github.com/onepersonhere/camera-link), fixing Gradle issues and various runtime bugs.

**GitHub project**: [plae-tljg/camera-link](https://github.com/plae-tljg/camera-link)

## Key Features

- HTTP MJPEG streaming, viewable via browser or VLC
- Foreground camera service, supporting continuous streaming with screen off
- Built-in HTTP endpoints: `/stream` (live), `/snapshot` (snapshot)
- Optional Tailscale keepalive service
- Persistent notification, supporting quick control

## Getting Started

### Prerequisites

- Android Studio Ladybug or newer
- Local installation of Android SDK 31 or higher
- Physical Android 12+ device with USB debugging enabled
- Java 17+ (if building from the command line)

### Clone and Build

```bash
git clone https://github.com/plae-tljg/camera-link.git
cd camera-link
./gradlew assembleDebug
```

### Install

**Android Studio**:
- Open the project in Android Studio, sync Gradle, connect a device, and press Run to deploy the debug build.

**Command line**:
```bash
./gradlew installDebug
# Or manually install the generated APK
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Building Release APK

For production deployment, build a signed release APK:

1. **Generate keystore** (already done in this project):
   ```bash
   # Keystore location: app/keystore.jks
   # Alias: androidkey
   # Password: android
   ```

2. **Build release APK**:
   ```bash
   ./gradlew assembleRelease
   ```

3. **Locate APK**:
   - Release APK: `app/build/outputs/apk/release/app-release.apk`
   - Debug APK: `app/build/outputs/apk/debug/app-debug.apk`

4. **Install release APK**:
   ```bash
   adb install app/build/outputs/apk/release/app-release.apk
   ```

**Note**: Release builds are signed and optimized for production use. For Google Play Store distribution, you need your own keystore and signing configuration.

## Usage

### Starting Streaming

1. Launch CameraLink on the device
2. Grant camera, notification, and foreground service permissions (when prompted)
3. Click **Start Streaming**. The UI and notification show the local stream URL (default `http://<device-ip>:8080`)
4. From any device on the same network, open the URL to view the live feed or trigger `/snapshot`
5. Stop streaming from the app button or notification

Screen-off and background streaming remain active as long as the foreground service runs. Disable battery optimization for best reliability.

### Tailscale Keepalive

1. TailscalePingService starts automatically (configurable in `MainActivity`)
2. Every 15 seconds (default), resolve configured peers (MagicDNS or 100.64.0.0/10 address), and ping them
3. Status displayed in the app and notification (success/failure count)
4. Use the **Manage Tailscale Peers** section to add or remove peers at runtime

## Configuration

- **Ping interval**: `app/src/main/java/.../TailscalePingService.kt`, `PING_INTERVAL_MS` constant
- **Default peers**: `TailscalePinger.kt`, `configuredTailscaleIps` set
- **HTTP port**: `CameraStreamingService.kt` and `MainActivity.kt` `port` value (default 8080)
- **Camera selection**: Update `cameraSelector` in `CameraStreamingService.startCamera()` to select front or rear camera
- **JPEG quality / FPS**: Adjust compression quality in `StreamingServer.imageProxyToJpeg()` and sleep duration in the streaming loop

## Testing

- **Local browser/VLC test**: Start streaming, access `/stream` or `/snapshot` from another device, or add the URL to VLC via "Open Network Stream"
- **Service persistence**: Run streaming for 30+ minutes with screen off, confirm wake lock behavior
- **Tailscale ping verification**: Run `adb logcat | grep TailscalePing` to confirm resolution and ping results

## Viewing Stream

### Browser viewing

- Open: `http://<device-ip>:8080/stream`
- Works in any modern browser

### VLC Media Player

- File → Open network stream
- Input: `http://<device-ip>:8080/stream`

### Snapshot

- Access: `http://<device-ip>:8080/snapshot`
- Get the current frame as a JPEG image

## Troubleshooting

### Common Issues

1. **App crashes on startup**
   - Ensure the device runs Android 12+
   - Check that camera, notification, and foreground service permissions have been granted
   - Try clearing app data and reinstalling

2. **Cannot connect to streaming**
   - Ensure the phone and viewing device are on the same WiFi network
   - Check firewall settings (port 8080 should be open)
   - Confirm the correct IP address

3. **Poor streaming quality or stuttering**
   - Use a stable WiFi connection
   - Disable battery optimization for reliable background running
   - Try different browsers (recommended: Chrome/Edge)

4. **Tailscale remote access issues**
   - Confirm Tailscale is configured correctly
   - Check MagicDNS hostname resolution
   - Verify the ping service is running

### Debug Commands

```bash
# View error logs
adb logcat *:E | grep -i camera

# Check running services
adb shell dumpsys activity services | grep camera

# Clear app data
adb shell pm clear com.example.cameralink
```

### Browser Compatibility

- ✅ Chrome/Edge: Best performance
- ⚠️ Firefox: May have slight delay
- ❌ Safari: Limited MJPEG support

## Tech Stack

- **Android app**: Kotlin + CameraX + Jetpack Compose
- **Streaming server**: NanoHTTPD
- **Network protocol**: HTTP MJPEG
- **Background service**: Android foreground service + wake lock

## Use Cases

- Plant growth monitoring
- Room security monitoring
- Pet activity monitoring
- Temporary security camera
- Remote monitoring (with Tailscale)

## Precautions

- All communication occurs over the local network and is not exposed to the internet (unless Tailscale is configured)
- Ensure the Android device is connected to a stable WiFi
- Video quality and frame rate depend on network conditions and device performance
- Recommend using a stable WiFi connection for the best experience
- The app requires Android 12+ because it uses modern camera API

## Old Version Notes

The old IP camera project required running VideoServer, WebApp, and other components on an Ubuntu server. CameraLink is a complete rewrite that only requires the Android app, no extra server needed, simpler and easier to use.

Old version documentation has moved to the [old/](./old/) directory.