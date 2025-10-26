# 🧠 NodeMCU IDE — Electron Monorepo

A desktop IDE built with **Electron**, **Vite**, and **TypeScript**, designed for NodeMCU (ESP8266/ESP32) boards.  
This project uses a **monorepo structure** with modular Electron layers and shared packages.

---

## 📁 Project Structure

```
.
├─ electron-layers/
│  ├─ main/          # Electron main process (window creation, protocol, packaging)
│  ├─ bridge/
│  │   ├─ preload/   # Context bridge (CJS preload entry)
│  │   └─ types/     # Shared preload types/interfaces
│  └─ renderer/      # React + Vite frontend (renderer process)
│
├─ packages/
│  ├─ nodemcu-tool-binary/  # Pre-built Node.js binary wrapped via pkg
│  └─ ui/ / types (optional shared packages)
│
├─ .assets/          # Application icons, metadata
└─ package.json      # Root workspace + electron-builder config
```

---

## ⚙️ Development Flow

All workspace packages have their own `dev` scripts.  
The root `dev` command orchestrates everything:

```bash
npm run dev
```

This runs:

- Vite dev server for the renderer
- TypeScript watchers for main & preload
- Electron live-reload (`electronmon`)
- Waits for port 5173 before launching the app

### Root `package.json`

```json
"scripts": {
  "dev": "concurrently \"npm run dev:workspaces\" \"wait-on http://localhost:5173 && npm run dev:electron\"",
  "dev:workspaces": "npm run dev -w electron-layers/renderer | npm run dev -w electron-layers/bridge/preload | npm run dev -w electron-layers/bridge/types | npm run dev -w electron-layers/main",
  "dev:electron": "cross-env NODE_ENV=development VITE_DEV_SERVER_URL=http://localhost:5173 electronmon --inspect=9229 electron-layers/main/dist/main.js --watch electron-layers/main/dist",
  "build": "npm run build --workspaces --if-present && electron-builder"
}
```

---

## 🧩 Electron Layer Details

### **Main process** (`electron-layers/main`)

Handles:

- Custom secure `app://` protocol
- Production asset loading
- `BrowserWindow` creation
- Dynamic preload path resolution

**Preload path resolution (works for dev & prod):**

```ts
import path from "node:path";
import { createRequire } from "node:module";
import { app } from "electron";

const require = createRequire(import.meta.url);

const preloadPath = app.isPackaged
  ? path.join(
      process.resourcesPath,
      "app.asar",
      "electron-layers",
      "bridge",
      "preload",
      "dist",
      "preload.js"
    )
  : require.resolve("@nodemcu-ide/electron-bridge-preload");
```

---

### **Preload bridge** (`electron-layers/bridge/preload`)

- Written in TypeScript, compiled as **CommonJS**.
- Exposes a secure IPC API via `contextBridge.exposeInMainWorld`.
- Depends on types from `electron-layers/bridge/types`.

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "outDir": "dist",
    "declaration": true,
    "strict": true
  }
}
```

---

### **Renderer** (`electron-layers/renderer`)

- React 19 + Vite 6 app.
- Imports types and constants from other workspaces.
- Uses standard `vite.config.ts` with `outDir: "dist"`.

---

## 🛠 Packaging & Build (electron-builder)

The root uses `electron-builder` to produce `.exe` installers.

### `package.json` (root excerpt)

```json
"main": "electron-layers/main/dist/main.js",
"build": {
  "appId": "com.nodemcu.ide",
  "productName": "NodemcuIDE",
  "directories": {
    "output": "dist",
    "buildResources": "build"
  },
  "files": [
    "electron-layers/main/dist/**/*",
    "electron-layers/renderer/dist/**/*",
    "electron-layers/bridge/preload/dist/**/*",
    "packages/**/*",
    "node_modules/**/*",
    "package.json"
  ],
  "extraResources": [
    { "from": "./.assets", "to": "icons" },
    { "from": "./packages/nodemcu-tool-binary/dist/nodemcu-tool.exe", "to": "extra-tools/nodemcu-tool.exe" },
    { "from": "./node_modules/@serialport/bindings", "to": "node_modules/@serialport/bindings" }
  ]
}
```

### 🧩 Resource layout inside `dist/win-unpacked/resources`

```
resources/
├─ app.asar/                     ← main + preload + renderer code
├─ extra-tools/
│  └─ nodemcu-tool.exe           ← bundled NodeMCU CLI binary
└─ icons/
   └─ icon.ico
```

---

## ⚙️ The `nodemcu-tool-binary` Package

Located in `packages/nodemcu-tool-binary`,  
it builds a standalone CLI executable using **pkg**.

### `package.json`

```json
{
  "name": "@nodemcu-ide/nodemcu-tool-binary",
  "version": "0.1.0",
  "private": true,
  "bin": { "nodemcu-tool": "./index.js" },
  "scripts": {
    "rebuild:serialport": "npm rebuild @serialport/bindings --target=18.0.0 --runtime=node",
    "build:win": "npm run rebuild:serialport && pkg . --targets node18-win-x64 --output dist/nodemcu-tool.exe",
    "build": "npm run build:win"
  },
  "pkg": {
    "scripts": ["index.js", "node_modules/nodemcu-tool/bin/nodemcu-tool.js"],
    "assets": ["node_modules/@serialport/bindings/**/*"],
    "outputPath": "dist"
  },
  "dependencies": {
    "nodemcu-tool": "^3.2.1",
    "serialport": "^13.0.0"
  },
  "devDependencies": {
    "pkg": "^5.8.1"
  }
}
```

**Purpose:**

- Ensures a stable, precompiled Node binary (Node 18 ABI) independent of Electron.
- Avoids runtime rebuilds when Electron upgrades its embedded Node.

---

## 🧩 Executing the Binary from Electron

```ts
import { execFile } from "node:child_process";
import { app } from "electron";
import path from "node:path";

const toolPath = app.isPackaged
  ? path.join(process.resourcesPath, "extra-tools", "nodemcu-tool.exe")
  : path.join(
      __dirname,
      "../../../packages/nodemcu-tool-binary/dist/nodemcu-tool.exe"
    );

execFile(toolPath, ["--help"], (err, stdout, stderr) => {
  if (err) console.error(err);
  else console.log(stdout || stderr);
});
```

---

## 🧩 Preload Access Example

From the renderer (React):

```ts
window.api.getBoards().then(({ data }) => console.log(data));
window.api.on("serialData", (payload) => console.log("Serial:", payload.text));
```

---

## 🔒 Security Defaults

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- `preload` built as CommonJS
- No filesystem exposure in renderer

---

## 🚀 Next Steps

- [ ] Integrate Turborepo for caching & parallel builds
- [ ] Add macOS/Linux builds of the CLI
- [ ] Add E2E smoke test that spawns the `.exe`
- [ ] Automate packaging in GitHub Actions

---

## 💡 Summary

| Layer                   | Purpose                         | Build Target       |
| ----------------------- | ------------------------------- | ------------------ |
| **main**                | App lifecycle, window, protocol | ESM → CJS in ASAR  |
| **bridge/preload**      | Secure IPC context bridge       | CJS                |
| **bridge/types**        | Shared IPC interfaces           | ESM                |
| **renderer**            | UI (Vite + React)               | ESM bundle         |
| **nodemcu-tool-binary** | NodeMCU CLI executable          | pkg Node 18 binary |
