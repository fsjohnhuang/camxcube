# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Rust backend server using Axum web framework. It receives data from an ESP32-S3 camera device, handles file uploads, and exposes APIs for device heartbeat and photo capture commands.

## Build Commands

```bash
# Build the project
cargo build

# Run the server
cargo run

# Build in release mode
cargo build --release
```

## Architecture

### Routes (`src/main.rs`)

- `POST /api/heart_beat` - Receives device heartbeat with `ip` and `mac` fields
- `POST /api/upload` - Handles multipart file uploads, saves files to current directory
- `POST /api/phote` - Triggers photo capture by sending HTTP request to camera device at `http://192.168.1.12:80/index?id=1&type=1&times=10`
- `GET /api/health` - Health check endpoint

### Server Configuration

- Binds to `0.0.0.0:3000`
- Graceful shutdown on SIGTERM or Ctrl+C
- Logs best local IPv4 address on startup

### Key Dependencies

- **axum** - Web framework with multipart support
- **tokio** - Async runtime with full features
- **reqwest** - HTTP client for making requests to camera device
- **serde** - Serialization/deserialization
- **getifs** - Network interface discovery

### Data Flow

1. Camera device sends heartbeat to `/api/heart_beat`
2. Photos are uploaded via `POST /api/upload`
3. Server can trigger photo capture via `/api/phote` which proxies to the camera device
