# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an ESP32-S3 camera project using the ESP-IDF framework. The device connects to WiFi, captures images from a camera sensor (OV2640), and uploads them via HTTP POST to a remote server. It also runs an HTTP server to receive commands.

## Build Commands

This project uses ESP-IDF's `idf.py` toolchain:

```bash
# Set target to ESP32-S3 (already configured in dependencies.lock)
idf.py set-target esp32s3

# Build the project
idf.py build

# Flash to device (auto-detects serial port)
idf.py flash

# Flash and start monitor
idf.py flash monitor

# Clean build
idf.py fullclean

# View serial output
idf.py monitor
```

## Architecture

### Main Components (`main/`)

- **main.c** - Entry point. Initializes all subsystems and creates the `task_http_client` FreeRTOS task
- **wifi.c/h** - WiFi station mode initialization
- **camera.c/h** - Camera initialization and capture using esp32-camera driver
- **http_server.c/h** - HTTP server for receiving commands via `/index` endpoint
- **http_client.c/h** - HTTP client for uploading captured images and heartbeat
- **ntp.c/h** - NTP time synchronization
- **nvs.c/h** - Non-volatile storage initialization
- **camera_pin.h** - Pin configuration for the camera sensor

### Data Flow

1. HTTP server receives command via `GET /index?id=X&type=Y&times=Z`
2. Command is queued to `queueMsg` (FreeRTOS Queue)
3. `task_http_client` dequeues and processes commands
4. On capture command: `camera_capture()` -> `http_client_upload()`
5. Image is sent via HTTP POST to remote server

### Key Configuration

- **Target**: ESP32-S3 with 16MB Flash and 8MB PSRAM
- **Camera Sensor**: OV2640 (configured in `sdkconfig.defaults`)
- **Partition Layout**: Factory app (1.1MB), NVS (24KB), SPIFFS (896KB)
- **Dependencies**: esp32-camera, esp_jpeg, cjson (from ESP Component Registry)

### Managed Components

External components are managed via IDF's component manager and stored in `managed_components/`. The `dependencies.lock` file pins exact versions.

## VSCode Integration

The project includes VSCode configuration for ESP-IDF debugging in `.vscode/launch.json` using the "espidf" debug adapter type.
