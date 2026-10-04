---
title: "Wi-Fi Auto-Reconnect Issues and Solutions on Windows"
summary: "> ⚠️ Windows: This page documents the approach at the time, which may no longer apply."
lang: en
translationKey: "ubuntu-net-wifi-reconnect"
slug: wifi-reconnect
track: ubuntu
stage: net
order: 3
date: 2026-01-04
tags: []
status: en draft
source: plae-lkm/ubuntu_setup:docs/dev/internet/wifi_reconnect.md
aiTranslated: true
---
> ⚠️ **Windows**: This page documents the approach at the time, which may no longer apply.

Sometimes on Windows, even with Wi-Fi's "Connect automatically" option checked, the Wi-Fi fails to connect automatically after boot or wake from sleep, requiring a manual click on the network to restore the connection. This is especially common on certain laptop brands or USB wireless adapters.

## Common Symptoms

- Wi-Fi has saved password and auto-connect enabled, but no internet after reboot or wake, requiring manual Wi-Fi click
- The system tray network icon shows recognized wireless networks, but they don't auto-connect; you must manually select and click "Connect"

## Common Causes

- Windows Fast Startup cache causes hardware initialization issues
- Wireless adapter driver version incompatible or unoptimized
- Power management settings put the wireless adapter to sleep and it fails to wake
- Certain security software interferes with the auto-connect process

## Solutions

### 1. Check Power Management Settings

1. Open "Device Manager"
2. Find your wireless adapter, right-click Properties
3. Switch to the "Power Management" tab
4. Uncheck "Allow the computer to turn off this device to save power"

### 2. Update Wireless Adapter Driver

- Download the latest driver from the laptop/motherboard/wireless adapter manufacturer's website
- Or right-click in Device Manager to auto-update the driver

### 3. Disable Fast Startup

1. Control Panel → Hardware and Sound → Power Options → Choose what the power buttons do
2. Click "Change settings that are currently unavailable"
3. Uncheck "Turn on fast startup (recommended)", save

### 4. Recreate Wi-Fi Configuration

1. Delete the saved Wi-Fi profile
2. Re-scan, enter password, check "Connect automatically"

### 5. Force Reconnect via Command

If the above settings don't work, you can use the command line to force disconnect and reconnect each time (e.g., write a script to run at startup):

```powershell
netsh wlan disconnect
netsh wlan connect name="你的WiFi名称"
```

Put these two lines in a .bat or PowerShell script and have it run automatically on boot or wake.

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

Hope these methods help you solve the Windows Wi-Fi auto-reconnect issue.