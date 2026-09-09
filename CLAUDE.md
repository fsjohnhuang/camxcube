# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a camera system monorepo with three applications:
- **web** - React frontend (React 19, Vite, HeroUI)
- **server** - Rust/Axum backend that receives camera uploads
- **esp32-camera** - ESP32-S3 firmware that captures and uploads photos

## Build Commands

```bash
# Install dependencies (requires pnpm v11+)
pnpm install

# Run all apps in development mode (parallel)
pnpm dev

# Build all apps via Turborepo
pnpm build
```

### Individual App Commands

**Web app** (`apps/web`):
```bash
cd apps/web
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # Run oxlint
pnpm preview      # Preview production build
```

**Server** (`apps/server`):
```bash
cd apps/server
cargo build       # Build
cargo run         # Run server
cargo build --release  # Release build
```

**ESP32-Camera** (`apps/esp32-camera`):
```bash
cd apps/esp32-camera
idf.py build              # Build firmware
idf.py flash              # Flash to device
idf.py flash monitor      # Flash and monitor serial
idf.py set-target esp32s3 # Set target (already configured)
```

## Architecture

### Monorepo Structure

```
camxcube/
├── apps/
│   ├── web/           # React frontend (TypeScript)
│   ├── server/        # Rust backend
│   └── esp32-camera/  # ESP-IDF firmware (C)
├── packages/          # Shared packages (currently empty)
├── turbo.json         # Turborepo configuration
├── pnpm-workspace.yaml
└── package.json       # Root workspace config
```

### Technology Stack

| App | Framework | Key Dependencies |
|-----|-----------|------------------|
| web | Vite + React 19 | HeroUI, React Compiler, Rolldown |
| server | Axum (Rust) | tokio, reqwest, serde |
| esp32-camera | ESP-IDF | esp32-camera driver, FreeRTOS |

### System Data Flow

```
┌─────────────────┐     HTTP POST      ┌─────────────┐
│  ESP32-Camera   │ ────────────────▶  │   Server    │
│  (OV2640)       │   /api/upload      │  (Axum)     │
└─────────────────┘                    └──────┬──────┘
       ▲                                      │
       │                                      │ HTTP GET/POST
       │                                ┌─────▼──────┐
       └────── /index (commands)        │    Web     │
                                        │  (React)   │
                                        └────────────┘
```

### Web App Configuration

- **Bundler**: Rolldown (via Vite) with Babel plugin for React Compiler
- **Styling**: Uses HeroUI styles with Tailwind CSS 4.x
- **Linter**: oxlint (configured in `.oxlintrc.json`)

## VSCode Configuration

- `.vscode/launch.json` - ESP-IDF debugging configuration for esp32-camera
- `.vscode/settings.json` - Project-specific settings

## Additional CLAUDE.md Files

Each app has its own detailed CLAUDE.md:
- `apps/server/CLAUDE.md` - Server-specific architecture and routes
- `apps/esp32-camera/CLAUDE.md` - ESP32 firmware details and pin configuration
