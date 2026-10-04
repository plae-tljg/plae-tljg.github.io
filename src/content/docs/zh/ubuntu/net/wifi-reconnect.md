---
title: "Windows 下无法自动重连 Wi-Fi 的问题与解决方法"
summary: "> ⚠️ Windows 端：这一页记录的是当时的做法，可能已经不适用。"
lang: zh
translationKey: "ubuntu-net-wifi-reconnect"
slug: wifi-reconnect
track: ubuntu
stage: net
order: 3
date: 2026-01-04
tags: []
status: zh draft
source: plae-lkm/ubuntu_setup:docs/dev/internet/wifi_reconnect.md
---
> ⚠️ **Windows 端**：这一页记录的是当时的做法，可能已经不适用。

有时候在 Windows 系统下，即使已经勾选了 Wi-Fi 的“自动连接”选项，机器启动后或者睡眠唤醒后，Wi-Fi 依然不能自动连上，需要手动点一下网络才能恢复连接。这种情况特别常见于部分品牌笔记本或 USB 无线网卡。

## 常见表现

- Wi-Fi 已保存密码并设置自动连接，但重启或唤醒后没联网，需手动点 Wi-Fi
- 右下角网络图标显示已识别无线网络，但不是自动连上，必须手动选中并点“连接”

## 常见原因

- Windows 快速启动缓存导致硬件初始化异常
- 无线网卡驱动版本不兼容或未优化
- 电源管理设置让无线网卡“省电”后唤不醒
- 某些安全软件影响了自动连接流程

## 解决方法

### 1. 检查电源管理设置

1. 打开“设备管理器”（Device Manager）
2. 找到你的无线网卡，右键属性
3. 切换到“电源管理”选项卡
4. 取消勾选“允许计算机关闭此设备以节约电源”

### 2. 更新无线网卡驱动

- 去笔记本/主板/无线网卡厂家官网下载最新版驱动
- 或在设备管理器中右键自动更新驱动

### 3. 禁用快速启动

1. 控制面板 → 硬件和声音 → 电源选项 → 选择电源按钮的功能
2. 点击“更改当前不可用的设置”
3. 将“启用快速启动（推荐）”前的勾去掉，保存

### 4. 重建 Wi-Fi 配置

1. 删除已保存的 Wi-Fi 配置
2. 重新搜索并输入密码，勾选“自动连接”

### 5. 使用命令强制重连

如果以上设置都无效，可每次用命令行强制断开再连接（比如写成脚本，开机启动）：

```powershell
netsh wlan disconnect
netsh wlan connect name="你的WiFi名称"
```

把这两行写入 bat 或 powershell 脚本，让它开机或唤醒后自动执行。

---

<!--code:title=reconnect wifi in window · /lib/wifi_reconnect/reconnect_wifi_window.py collapse-->
```python
import subprocess
import time
import logging
from logging.handlers import RotatingFileHandler  # Add this import
from datetime import datetime
import sys
import ctypes

# ===== CONFIG =====
SSID = "LKM_Router"
CHECK_INTERVAL = 10  # seconds
LOG_FILE = "wifi_reconnect.log"
MAX_LOG_SIZE = 10 * 1024 * 1024  # 10 MB (10 * 1024KB * 1024 bytes)
BACKUP_COUNT = 3  # Keep 3 backup files (total 4 files including current)
# ==================

def hide_console():
    """Hide console window on Windows when running in background"""
    if sys.platform.startswith('win'):
        kernel32 = ctypes.WinDLL('kernel32')
        user32 = ctypes.WinDLL('user32')
        hWnd = kernel32.GetConsoleWindow()
        if hWnd:
            user32.ShowWindow(hWnd, 0)  # 0 = SW_HIDE

# Configure logging with rotation
log_formatter = logging.Formatter('%(asctime)s | %(levelname)s | %(message)s')

# Rotating file handler - automatically manages file size
file_handler = RotatingFileHandler(
    LOG_FILE, 
    maxBytes=MAX_LOG_SIZE,  # Rotate when file reaches this size
    backupCount=BACKUP_COUNT,  # Keep this many backup files
    encoding='utf-8'
)
file_handler.setFormatter(log_formatter)

# Console handler (still shows output if run manually)
console_handler = logging.StreamHandler()
console_handler.setFormatter(log_formatter)

# Set up root logger
logging.basicConfig(
    level=logging.INFO,
    handlers=[file_handler, console_handler]
)

def get_wifi_status():
    """Returns tuple: (state, current_ssid) - correctly parses SSID name"""
    try:
        result = subprocess.run(
            ['netsh', 'wlan', 'show', 'interfaces'],
            capture_output=True, timeout=10
        )
        
        if result.returncode != 0:
            logging.error(f"❌ netsh command failed with return code {result.returncode}")
            if result.stderr:
                logging.error(f"Error output: {result.stderr.decode('utf-8', errors='replace').strip()}")
            return "", ""
        
        output = result.stdout.decode('utf-8', errors='replace')
        lines = output.strip().split('\n')
        
        state = ""
        current_ssid = ""
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            if "state" in line.lower() or "狀態" in line.lower():
                if ':' in line:
                    parts = line.split(':', 1)
                elif '：' in line:
                    parts = line.split('：', 1)
                else:
                    continue
                    
                if len(parts) > 1:
                    state_raw = parts[1].strip().lower()
                    if "connected" in state_raw or "連線" in state_raw:
                        state = "connected"
                    elif "disconnected" in state_raw or "中斷" in state_raw:
                        state = "disconnected"
                    else:
                        state = state_raw
            
            # Look specifically for "SSID" field (not BSSID)
            elif line.lower().startswith("ssid") and ":" in line:
                parts = line.split(':', 1)
                if len(parts) > 1:
                    ssid_candidate = parts[1].strip()
                    # Only use this if it's not empty and not a MAC address format
                    if ssid_candidate and not (':' in ssid_candidate and len(ssid_candidate) <= 17):
                        current_ssid = ssid_candidate
        
        logging.debug(f"📶 Wi-Fi status - State: '{state}', SSID: '{current_ssid}'")
        return state, current_ssid
        
    except Exception as e:
        logging.error(f"❗ Failed to get Wi-Fi status: {e}")
        return "", ""

def connect_to_wifi():
    logging.info(f"📡 Connecting to '{SSID}'...")
    try:
        result = subprocess.run(
            ['netsh', 'wlan', 'connect', f'name={SSID}'],
            capture_output=True, timeout=15
        )
        
        stdout = result.stdout.decode('utf-8', errors='replace').strip() if result.stdout else ""
        stderr = result.stderr.decode('utf-8', errors='replace').strip() if result.stderr else ""
        
        full_output = f"{stdout}\n{stderr}".strip()
        
        if result.returncode == 0:
            success_indicators = ["成功", "completed successfully", "connected", "連線", "successfully"]
            if any(indicator.lower() in full_output.lower() for indicator in success_indicators):
                logging.info("✅ Connection succeeded")
                return True
            else:
                logging.warning(f"⚠️ Connection command succeeded but output doesn't indicate success: {full_output[:200]}")
                return False
        else:
            logging.error(f"❌ Connection failed with return code {result.returncode}")
            if full_output:
                logging.error(f"Error details: {full_output[:300]}")
            return False
            
    except subprocess.TimeoutExpired:
        logging.error("⏰ Connection attempt timed out after 15 seconds")
        return False
    except Exception as e:
        logging.error(f"💥 Connect error: {e}")
        return False

def main():
    # Hide console when running as background process
    hide_console()
    
    logging.info("🚀 Wi-Fi Auto-Reconnect Started")
    logging.info(f"Target SSID: '{SSID}', Interval: {CHECK_INTERVAL}s")
    logging.info(f"Python version: {sys.version.split()[0]}, OS: Windows")
    logging.info(f"📁 Log rotation: Max size {MAX_LOG_SIZE/1024/1024:.1f}MB, {BACKUP_COUNT} backup files kept")
    
    connection_attempts = 0
    successful_connections = 0
    last_state = ""
    last_ssid = ""
    
    while True:
        try:
            state, current_ssid = get_wifi_status()
            
            # Only log changes to avoid spam
            if state != last_state or current_ssid != last_ssid:
                logging.info(f"🌐 Current status - State: '{state}', SSID: '{current_ssid}'")
                last_state = state
                last_ssid = current_ssid
            
            # Check if we're connected to the correct network
            if state == "connected" and current_ssid and current_ssid.lower() == SSID.lower():
                if connection_attempts > 0:
                    logging.info(f"✅ Wi-Fi is properly connected to target network '{SSID}'")
                connection_attempts = 0
            else:
                connection_attempts += 1
                logging.warning(f"❌ Not properly connected (state='{state}', SSID='{current_ssid}', expected='{SSID}', attempt #{connection_attempts}) → reconnecting...")
                if connect_to_wifi():
                    successful_connections += 1
                    logging.info(f"📈 Total successful connections: {successful_connections}")
            
            time.sleep(CHECK_INTERVAL)
            
        except KeyboardInterrupt:
            logging.info("🛑 Stopped by user")
            logging.info(f"📊 Final stats: {successful_connections} successful connections out of {connection_attempts} attempts")
            break
        except Exception as e:
            logging.error(f"💥 Main loop error: {e}")
            time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main()
```

希望以上方法能帮助你解决 Windows 下 Wi-Fi 无法自动重连的问题。
