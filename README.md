# NodeMCU IDE — Monorepo Overview

## 🧩 Project Summary

NodeMCU IDE is an **Electron + Vite + TypeScript** desktop application designed for developing, flashing, and interacting with **NodeMCU (ESP8266/ESP32)** boards. It provides an integrated environment for Lua-based development, firmware management, and serial communication — all packaged into a secure, sandboxed Electron runtime.

The project follows a **multi-package monorepo** structure to separate responsibilities between Electron layers, UI, and tooling, ensuring scalability and efficient builds through **Turborepo**.

---

## 🏗️ Monorepo Structure

```
root/
├─ electron-layers/
│  ├─ main/                → Electron main process (window, app protocol, packaging)
│  ├─ bridge/
│  │  ├─ preload/          → Secure preload script, CommonJS context bridge
│  │  └─ types/            → Shared TypeScript interfaces for IPC
│  └─ renderer/            → React + Vite frontend (renderer process)
│
├─ packages/
│  ├─ nodemcu-tool-binary/ → Prebuilt Node 18 binary wrapping the nodemcu-tool CLI
│  └─ ui/ (optional)       → Shared UI components using Tailwind + ShadCN
│
└─ turbo.json              → Defines build and dev pipelines, dependencies between layers
```

Each layer is intentionally isolated:

- **Main** handles Electron app lifecycle and window creation.
- **Preload** bridges the secure sandboxed renderer with Node APIs.
- **Renderer** contains the React UI and communicates via IPC.
- **Types** defines shared contracts between main/preload/renderer.
- **nodemcu-tool-binary** encapsulates the CLI tooling and native bindings.

---

## ⚙️ Build and Dev Commands

The repository uses **Turborepo** to orchestrate builds and manage inter-package dependencies.

### Common scripts

- `dev` — Starts all layers in watch mode. Depends on the binary being built first.
- `build` — Builds all packages and outputs distributable artifacts.
- `build:serialport` — Rebuilds native serialport bindings for Node 18.

Each Electron package (`main`, `renderer`, `preload`, `types`) defines its own `dev` and `build` scripts, which are coordinated through Turbo’s dependency graph. The **binary package** acts as a prerequisite for all others.

### Dependency flow

```
renderer → preload → types → nodemcu-tool-binary
main     → preload → types → nodemcu-tool-binary
```

Turborepo ensures that if the binary package has not changed, its build is cached — preventing redundant rebuilds across Electron layers.

---

## 🧰 NodeMCU Tool Packaging Strategy

The **`nodemcu-tool-binary`** package wraps the `nodemcu-tool` CLI using `pkg`, producing a **Node 18-compatible executable** (`nodemcu-tool.exe`) embedded directly into the Electron build. This approach was chosen for:

1. **Portability** — The binary runs within Electron without requiring native rebuilds or system-wide Node installation.
2. **Version control** — The Node version is pinned (Node 18) to match Electron’s runtime compatibility.
3. **Reduced native friction** — SerialPort bindings are rebuilt only once via a dedicated task (`build:serialport`), not on every install.
4. **Cross-platform consistency** — The binary can be packaged for Windows/macOS/Linux without altering the Electron main process.

During Electron packaging, the binary is included as part of `extraResources` to ensure it ships inside the app bundle, alongside its `@serialport/bindings` artifacts.

---

## 🪄 Development Philosophy

This project emphasizes:

- **Isolation of layers** — renderer, preload, main, and tooling are decoupled for clarity and testing.
- **Incremental builds** — Turbo + TypeScript incremental compilation with per-package `.tsbuildinfo`.
- **Security** — strict `contextIsolation`, `sandbox`, and `nodeIntegration: false`.
- **Scalability** — packages can evolve independently, supporting features like firmware flashing, live serial output, or future cloud sync.

---

## 🧠 Future Enhancements

- Add Turborepo caching for `electron-builder` postinstall tasks.
- Integrate shared UI library (`packages/ui`) with Tailwind + ShadCN.
- Support macOS/Linux binary builds via `pkg` multi-target outputs.
- Add optional build caching for the SerialPort binding rebuild step.

---

## 🧾 Summary

NodeMCU IDE demonstrates a clean, maintainable architecture for Electron + TypeScript applications. It balances developer convenience and runtime safety while efficiently handling native dependencies through a modular, cache-friendly Turborepo setup.

The key design decision — **packaging `nodemcu-tool` as a prebuilt binary** — minimizes rebuilds, simplifies distribution, and allows the Electron app to execute CLI logic securely inside its sandboxed environment.
