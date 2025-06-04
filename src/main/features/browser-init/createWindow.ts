import path from "node:path";
import { fileURLToPath } from "node:url";
import { BrowserWindow } from "electron";
import { ipcMainSend } from "../../ipc.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../../preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Loads the Dev server in dev mode, or the built index.html in prod
  win.loadURL(
    process.env.VITE_DEV_SERVER_URL ||
      `file://${path.join(__dirname, "../../dist/index.html")}`
  );

  return win;
};
