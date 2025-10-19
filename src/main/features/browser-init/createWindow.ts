import { app, protocol, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { lookup as getMimeType } from "mime-types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// register custom protocol
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: { secure: true, standard: true },
  },
]);

let iconPath: string;

if (!app.isPackaged) {
  // Dev: use raw ico from repo (better than PNG on Windows)
  iconPath = path.resolve(__dirname, "../../../build/icon.ico");
} else {
  if (process.platform === "win32") {
    // Installed app: use bundled ico from extraResources
    iconPath = path.join(process.resourcesPath, "icons", "icon.ico");
  } else if (process.platform === "linux") {
    iconPath = path.join(process.resourcesPath, "icons", "256x256.png");
  } else if (process.platform === "darwin") {
    // macOS: dock icon
    app?.dock?.setIcon(path.join(process.resourcesPath, "icons", "icon.icns"));
  }
}

export const createWindow = async () => {
  // custom protocol handler
  protocol.handle("app", async (request) => {
    try {
      const url = new URL(request.url);
      let filePath = url.pathname.replace(/^\/+/, "");
      if (filePath === "" || filePath === "-") filePath = "index.html";

      const fullPath = path.join(__dirname, "../../../dist", filePath);
      const data = await readFile(fullPath);
      const contentType = getMimeType(fullPath) || "text/plain";

      return new Response(data as any, {
        headers: { "Content-Type": contentType },
      });
    } catch (err) {
      console.error("Protocol handler error:", err);
      return new Response("Not found: " + (err as any).message, {
        status: 404,
      });
    }
  });

  // main window
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    icon: iconPath, // 👈 ensures taskbar icon on Windows
    webPreferences: {
      preload: path.join(__dirname, "../../preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.loadURL(process.env.VITE_DEV_SERVER_URL || "app://-");
  return win;
};
