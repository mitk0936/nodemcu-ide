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

  win.webContents.session.on(
    "select-serial-port",
    (event, portList, webContents, callback) => {
      // Add listeners to handle ports being added or removed before the callback for `select-serial-port`
      // is called.
      win.webContents.session.on("serial-port-added", (event, port) => {
        console.log("serial-port-added FIRED WITH", port);
        // Optionally update portList to add the new port
      });

      win.webContents.session.on("serial-port-removed", (event, port) => {
        console.log("serial-port-removed FIRED WITH", port);
        // Optionally update portList to remove the port
      });

      console.log(portList);

      const ports = portList.filter((p) => Boolean(p.productId));

      event.preventDefault();
      if (ports && ports.length > 0) {
        callback(ports[0].portId);
      } else {
        // eslint-disable-next-line n/no-callback-literal
        callback(""); // Could not find any matching devices
      }
    }
  );

  win.webContents.session.setDevicePermissionHandler((details) => {
    if (details.deviceType === "serial") {
      return true;
    }

    return false;
  });

  win.webContents.session.setPermissionCheckHandler(
    (__webContents, permission, requestingOrigin, details) => {
      return permission === "serial";
      return Boolean(
        (permission === "serial" && details.securityOrigin === "app://-") ||
          (!app.isPackaged &&
            requestingOrigin === process.env.VITE_DEV_SERVER_URL)
      );
    }
  );

  win.loadURL(process.env.VITE_DEV_SERVER_URL || "app://-");

  return win;
};
