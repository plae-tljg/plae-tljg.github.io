---
title: "IP Camera 项目 - 安装指南"
summary: "> ⚠️ 旧方案：这一页记录的是当时的做法，可能已经不适用。"
lang: zh
translationKey: "homelab-home-ip-cam-old-install"
slug: ip-cam-old-install
track: homelab
stage: home
order: 3
date: 2026-01-04
tags: []
status: zh draft
source: plae-lkm/ubuntu_setup:docs/household/ip_cam/old/ip_cam_install.md
aiTranslated: true
---
> ⚠️ **旧方案**：这一页记录的是当时的做法，可能已经不适用。

这份指南会带你把 IP Camera 项目搭起来，把 Android 手机变成一个用来监控植物的摄像头。

## 项目概述

项目由 4 个主要组件组成：
1. **Android App** - 在手机上运行，采集视频并推流
2. **VideoServer** - Kotlin 服务端，接收手机发来的视频并对外提供
3. **WebApp** - 用来观看视频流的网页界面
4. **WebAppServer**（可选）- Node.js 服务端，负责用户认证和截图相册

## 前提条件

### 必需的软件

1. **Java 开发工具包（JDK）**
   - JDK 8 或更高版本
   - 检查：`java -version`

2. **Android Studio**（用于构建 Android 应用）
   - 下载地址：https://developer.android.com/studio
   - 自带 Android SDK 和构建工具

3. **Node.js 和 npm**（用于 WebApp 和 WebAppServer）
   - 推荐 Node.js 14 及以上
   - 检查：`node --version` 和 `npm --version`
   - 下载地址：https://nodejs.org/

4. **Gradle**（通常随 Android Studio 一起装，也可以单独安装）
   - 项目用的是 Gradle wrapper，所以它会自动下载

### 可选（用于 WebAppServer）

5. **MySQL**（只有想要截图相册功能时才需要）
   - MySQL 5.7+ 或 MariaDB
   - 安装并配置好数据库

## 安装步骤

### 第 1 步：构建 Android 应用

1. **打开 Android Studio**
   - 启动 Android Studio
   - 选择 "Open an Existing Project"
   - 在你的 IP-Camera 项目目录里找到 `Andorid` 文件夹（注意：文件夹名拼错了，本该是 "Android"）

2. **等待 Gradle 同步**
   - Android Studio 会自动同步项目
   - 它会下载依赖（可能要几分钟）
   - 确保你有网络连接

3. **连接你的 Android 手机**
   - 在手机上打开开发者选项：
     - 进入 设置 → 关于手机
     - 连点 "Build Number" 7 次
   - 打开 USB 调试：
     - 设置 → 开发者选项 → USB 调试
   - 用 USB 线连上手机
   - 弹出提示时允许 USB 调试

4. **构建并安装**
   - 点击 "Run" 按钮（绿色播放图标），或按 `Shift+F10`
   - 选择你已连接的设备
   - 应用会构建好并安装到手机上

   **或者从命令行构建：**
   ```bash
   cd /path/to/your/IP-Camera/Andorid
   ./gradlew assembleDebug
   ./gradlew installDebug
   ```

### 第 2 步：配置并运行 VideoServer

VideoServer 是一个 Kotlin 程序，接收手机发来的视频，并通过以下方式对外提供：
- WebSocket 服务器（端口 1234）
- MJPEG 服务器（端口 4444）
- Camera 服务器（端口 4321）

1. **进入 VideoServer 目录**
   ```bash
   cd /path/to/your/IP-Camera/VideoServer
   ```

2. **构建服务端**
   ```bash
   ./gradlew build
   ```

3. **运行服务端**
   ```bash
   ./gradlew run
   ```
   
   或者你手上已经有 JAR 文件：
   ```bash
   java -jar build/libs/VideoServer-1.0-SNAPSHOT.jar
   ```

4. **记下服务端的 IP 地址**
   - 在 Linux 上查你的 IP：`ip addr show` 或 `hostname -I`
   - 例子：`192.0.2.101`
   - 服务端会监听所有网络接口

### 第 3 步：配置 Android 应用

1. **在手机上打开应用**

2. **进入设置**
   - 在应用里打开设置页面

3. **填入 Camera Server 的 IP**
   - 填你电脑的 IP 地址和端口
   - 格式：`YOUR_IP:4321`
   - 例子：`192.0.2.101:4321`
   - 确保手机和电脑在同一个网络里

4. **开始推流**
   - 进入推流页面
   - 点击 "Start streaming"
   - 你的手机现在应该已经在往服务端发视频了

### 第 4 步：配置 WebApp（可选 - 用来访问网页界面）

1. **进入 WebApp 目录**
   ```bash
   cd /path/to/your/IP-Camera/WebApp
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **注意：** 项目里用了 `webpack serve`，但并没有 webpack.config.js 文件。你可能需要：
   - 创建一个 webpack.config.js，或者
   - 换用一个简单的 HTTP 服务器：
     ```bash
     npx http-server public -p 8080
     ```

4. **访问网页应用**
   - 打开浏览器：`http://localhost:8080/` 或 `http://YOUR_SERVER_IP:8080/`
   - 打开设置页：`http://localhost:8080/settings.html`
   - 填 WebSocket 服务器的 IP：`YOUR_SERVER_IP:1234`（填你自己服务端的 IP，端口是 1234）
   - 点击 "Continue" 保存
   - 打开推流页：`http://localhost:8080/stream.html`
   - 点击 "Connect" 看视频流
   
   **重要：** WebApp 用的是 **1234** 端口（WebSocket），不是 4321 端口（4321 是给 Android 应用用的）

### 第 5 步：配置 WebAppServer（可选 - 用来截图）

只有你想截图并存下来才需要这一步。

1. **建好 MySQL 数据库**
   ```bash
   mysql -u root -p
   ```
   ```sql
   CREATE DATABASE ipcamera;
   USE ipcamera;
   SOURCE /path/to/your/IP-Camera/WebAppServer/user.sql;
   ```

2. **配置数据库连接**
   - 编辑 `/path/to/your/IP-Camera/WebAppServer/index.js`
   - 改 connection 对象（第 10-15 行）：
     ```javascript
     const connection = mysql.createConnection({
         'host': 'localhost',
         'user': 'your_username',
         'password': 'your_password',
         'database': 'ipcamera'
     })
     ```

3. **安装依赖**
   ```bash
   cd /path/to/your/IP-Camera/WebAppServer
   npm install
   ```

4. **运行服务端**
   ```bash
   node index.js
   ```

5. **改 WebApp 的后端地址**（如果需要）
   - 编辑 `WebApp/public/stream.html`
   - 把 `BACKEND_URL` 常量指向你的服务端

6. **创建一个用户**
   - 打开 `http://localhost:8080/register.html`
   - 注册一个新账号

7. **使用截图功能**
   - 在 `http://localhost:8080/login.html` 登录
   - 在推流页面上截图
   - 在 `http://localhost:8080/gallery.html` 查看相册

## 快速开始（最小安装）

只想看视频流的话，最简单的流程是：

1. **构建并安装 Android 应用**（第 1 步）
2. **运行 VideoServer**（第 2 步）
3. **配置 Android 应用**（第 3 步）
4. **在浏览器里看视频流**：`http://YOUR_IP:4444`

就这样！你可以直接在浏览器里或者 VLC 播放器里看视频流。

## 观看视频流

### 方式 1：直接用浏览器访问
- 打开：`http://YOUR_IP:4444`
- 任何现代浏览器都能用

### 方式 2：VLC 媒体播放器
- 文件 → 打开网络流
- 输入：`http://YOUR_IP:4444/`

### 方式 3：Web App 界面
- 按上面的第 4 步做
- 功能更多，界面也更好

## 故障排除

### Android 应用构建失败
- 确保 Android Studio 已经更新到最新
- 检查是否装了 Android SDK 35
- 试试：`./gradlew clean` 然后重新构建

### 手机连不上服务端
- 确保手机和电脑在同一个 WiFi 网络里
- 检查防火墙设置（4321、4444、1234 端口应该是开放的）
- 确认 IP 地址没填错
- 试着从手机 ping：装一个网络工具应用，ping 你电脑的 IP

### VideoServer 起不来
- 检查端口是不是已经被占用：`netstat -tulpn | grep -E '4321|4444|1234'`
- 确保 Java 装了：`java -version`
- 检查 Gradle 版本是否兼容

### WebApp 的问题
- 如果 `webpack serve` 不管用，换成 `npx http-server public -p 8080`
- 确保 Node.js 装了：`node --version`

## 网络要求

- **同一个 WiFi 网络**：手机和电脑必须在同一个局域网里
- **防火墙**：允许以下端口的入站连接：
  - 4321（Camera Server）
  - 4444（MJPEG Server）
  - 1234（WebSocket Server）
  - 3000（WebAppServer，用到才开）
  - 8080（WebApp，用到才开）

## 端口小结

- **4321**：Camera Server（Android 应用连这里）
- **4444**：MJPEG Server（浏览器/VLC 连这里）
- **1234**：WebSocket Server（WebApp 连这里）
- **3000**：WebAppServer（可选，用于截图）
- **8080**：WebApp 开发服务器（可选）

## 下一步

全部跑起来之后：
1. 把手机摆到能拍到植物的位置
2. 在你网络里的任意设备上访问视频流
3. 需要的话把自动截图配起来
4. 如果想要远程访问，可以考虑配置端口转发（需要改路由器设置）