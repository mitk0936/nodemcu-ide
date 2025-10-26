/**
 * Main window creation & custom protocol setup for the NodeMCU IDE.
 * ---------------------------------------------------------------
 * Responsibilities:
 *  - Register a secure "app://" protocol to load local files in production.
 *  - Serve static assets from /dist using this protocol.
 *  - Configure platform-specific window icons.
 *  - Create and load the main BrowserWindow instance.
 */

import { app, protocol, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { lookup as getMimeType } from "mime-types";
import { createRequire } from "node:module";

// -----------------------------------------------------------------------------
// 🧭 Resolve runtime paths
// -----------------------------------------------------------------------------

// __dirname is not available in ES modules; we reconstruct it manually.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------------------------------------------------------
// 🔒 Register secure custom scheme before app ready
// -----------------------------------------------------------------------------

protocol.registerSchemesAsPrivileged([
  {
    scheme: "app", // we’ll serve app://index.html and other static files
    privileges: {
      secure: true, // ensures https-like security context
      standard: true, // allows relative paths, e.g. <link href="app://style.css">
    },
  },
]);

// -----------------------------------------------------------------------------
// 🪟 Main window factory
// -----------------------------------------------------------------------------

export const createWindow = async (): Promise<BrowserWindow> => {
  /**
   * ---------------------------------------------------------------------------
   * 1. Custom protocol handler
   * ---------------------------------------------------------------------------
   * This replaces file:// URLs with app:// URLs in production.
   * It allows loading local files (e.g. index.html, JS bundles, assets)
   * without exposing your filesystem paths.
   */
  protocol.handle("app", async (request) => {
    try {
      // Convert the request URL to a valid local file path.
      const url = new URL(request.url);
      const relativePath = url.pathname.replace(/^\/+/, "") || "index.html";
      const fullPath = path.join(
        __dirname,
        "../../../../renderer/dist",
        relativePath
      );

      // Read file contents and detect correct MIME type.
      const fileData = await readFile(fullPath);
      const mimeType = getMimeType(fullPath) || "text/plain";

      // Return a standard Response object (supported in modern Electron).
      return new Response(fileData as BodyInit, {
        headers: { "Content-Type": mimeType },
      });
    } catch (err: unknown) {
      console.error("⚠️ Protocol handler error:", err);
      return new Response(`Not found: ${err}`, { status: 404 });
    }
  });

  /**
   * ---------------------------------------------------------------------------
   * 2. Platform-specific icon setup (currently implemented only for windows)
   * ---------------------------------------------------------------------------
   * Each OS uses different icon formats and locations:
   *  - Windows → .ico (taskbar & window)
   */

  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, "icons", "icon.ico")
    : path.join(__dirname, "../../build/icon.ico");

  /**
   * ---------------------------------------------------------------------------
   * 3. BrowserWindow configuration
   * ---------------------------------------------------------------------------
   * We isolate the renderer for security, preload a safe API bridge,
   * and specify platform icon (where supported).
   */
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
    : createRequire(__dirname).resolve("@nodemcu-ide/electron-bridge-preload");

  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    icon: iconPath,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true, // prevent direct access to Node APIs
      nodeIntegration: false, // disable require() in renderer
      sandbox: true, // run renderer in a sandboxed environment
    },
  });

  /**
   * ---------------------------------------------------------------------------
   * 4. Load target URL
   * ---------------------------------------------------------------------------
   * In dev → load the Vite dev server for hot reload.
   * In prod → load from the custom app:// protocol.
   */
  const entryURL = process.env.VITE_DEV_SERVER_URL || "app://index.html";
  await win.loadURL(entryURL);

  return win;
};
