# NodeMCU IDE — Monorepo Overview

## Project Summary

NodeMCU IDE is an **Electron + Vite + TypeScript** desktop application designed for developing, flashing, and managing **NodeMCU (ESP8266/ESP32)** boards. It provides a secure, integrated environment for Lua development, firmware flashing, and serial communication.

The project follows a **multi-package monorepo** architecture powered by **Turborepo**, separating Electron layers, shared tooling, and UI into isolated workspaces. This structure ensures incremental builds, efficient caching, and clear development boundaries.

---

## Monorepo Structure

```
root/
├─ electron-layers/
│  ├─ main/                → Electron main process (app lifecycle, windows, packaging)
│  ├─ bridge/
│  │  ├─ preload/          → Secure preload script, context bridge between Node and Renderer
│  │  └─ types/            → Shared TypeScript definitions for IPC contracts
│  └─ renderer/            → React 19 + Vite 6 frontend for the UI
│
├─ packages/
│  ├─ nodemcu-tool-binary/ → Node 18 prebuilt CLI binary wrapping `nodemcu-tool`
│  └─ ui/ (optional)       → Shared Tailwind + ShadCN UI library
│
└─ turbo.json              → Root Turborepo configuration (pipelines, dependencies)
```

Each workspace is autonomous and type-safe. The `electron-layers` group represents Electron’s multi-process model, while `nodemcu-tool-binary` encapsulates all native tooling concerns.

---

## Turborepo Orchestration

### Root configuration

The root `turbo.json` defines top-level orchestration for all packages:

- `build` tasks depend on `^build` for cascading builds.
- `dev` tasks depend on both `^dev` and the binary build (`@nodemcu-ide/nodemcu-tool-binary#build`).
- Persistent tasks (like Electron or Vite dev) stay active during watch mode.

Example:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "dependsOn": ["^dev", "@nodemcu-ide/nodemcu-tool-binary#build"],
      "cache": false,
      "persistent": true
    }
  }
}
```

### Binary package configuration

Inside `packages/nodemcu-tool-binary/turbo.json`, local relationships are defined:

```json
{
  "extends": ["//"],
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build:serialport": {
      "outputs": [
        "node_modules/@serialport/bindings/build/Release/bindings.node"
      ]
    },
    "build": {
      "dependsOn": ["build:serialport"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "dependsOn": ["build", "build:serialport"],
      "cache": false
    }
  }
}
```

This isolates the build chain for native modules and the prebuilt CLI binary.

---

## NodeMCU Tool Binary Design

The **`nodemcu-tool-binary`** package wraps the original CLI using `pkg`, producing a **standalone Node 18 executable** (`nodemcu-tool.exe`). It ships inside the Electron app via `extraResources`.

### Key design decisions

1. **Compatibility** — Node 18 matches Electron’s native runtime version.
2. **Isolation** — Native serialport bindings are rebuilt only once via `build:serialport`.
3. **Portability** — No need for local Node installations on user machines.
4. **Performance** — Turbo caches the bindings and binary outputs independently.

This approach eliminates repetitive native rebuilds during development and ensures consistent runtime behavior across platforms.

---

## Development Workflow

### Standard commands

| Command         | Description                                                     |
| --------------- | --------------------------------------------------------------- | --- |
| `npm run dev`   | Starts Electron + Vite in watch mode (renderer, main, preload). |     |
| `npm run build` | Produces distributable builds for all layers.                   |
| `npm run clean` | Removes dist and cache folders.                                 |

## Cleaning Strategy

- **`npm run clean`** removes `dist/` and `.turbo/` caches while preserving dependencies.

## Security Model

- `contextIsolation: true`
- `sandbox: true`
- `nodeIntegration: false`

This ensures no direct Node access from the renderer, with all system interactions routed through the preload bridge.

---

## Summary

NodeMCU IDE combines Electron’s multi-process architecture, React’s modular UI, and Turborepo’s task orchestration into a clean, reproducible developer workflow.

By prebuilding and caching the `nodemcu-tool` binary and serialport bindings, the project achieves:

- Fast iterative development
- Predictable packaging
- Cross-platform portability

This architecture keeps development scalable and efficient while maintaining a minimal rebuild footprint — perfectly suited for long-term expansion and platform consistency.
