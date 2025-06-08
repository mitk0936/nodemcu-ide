import { app, protocol } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BrowserWindow } from "electron";
import { readFile } from "node:fs/promises";
import { lookup as getMimeType } from "mime-types";
import { existsSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

let iconPath: string;

if (app.isPackaged) {
  iconPath = path.join(process.resourcesPath, "build", "icons", "256x256.png");
} else {
  // Example: if __dirname is <repo>/dist-electron/main/features/browser-init
  iconPath = path.resolve(__dirname, "../../build/icons/256x256.png");
}

export const createWindow = async () => {
  protocol.handle("app", async (request) => {
    try {
      const url = new URL(request.url);
      let filePath = url.pathname;

      // Remove leading slash
      filePath = filePath.replace(/^\/+/, "");

      // Default to index.html for root path or just '-'
      if (filePath === "" || filePath === "-") {
        filePath = "index.html";
      }

      const fullPath = path.join(__dirname, "../../../dist", filePath);
      const data = await readFile(fullPath);
      const contentType = getMimeType(fullPath) || "text/plain";

      return new Response(data, {
        headers: { "Content-Type": contentType },
      });
    } catch (err) {
      console.error("Protocol handler error:", err);
      return new Response("Not found: " + (err as any).message, {
        status: 404,
      });
    }
  });

  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../../preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    icon: iconPath,
  });

  win.loadURL(process.env.VITE_DEV_SERVER_URL || "app://-");

  return win;
};
