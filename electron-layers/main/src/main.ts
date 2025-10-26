import { app } from "electron";
import { createWindow } from "./features/browser-init/createWindow.js";
import { initInBrowserNavigation } from "./features/browser-init/initInBrowserNavigation.js";

import { ipcMainHandle } from "./ipc.js";

import { pickSourceFolder } from "./features/file-explorer/handlers/pickSourceFolder.js";
import { BoardCommunicationController } from "./features/board-communication/BoardCommunicationController.js";

app.setName("NodemcuIDE");
app.setAppUserModelId("com.nodemcu.ide");

// Listen for main app ready
app.whenReady().then(async () => {
  initInBrowserNavigation(app);
  const window = await createWindow();

  new BoardCommunicationController(window);

  // TODO: implement similar patterns for file management (like board communication)
  // File Explorer Actions
  ipcMainHandle("pickSourceFolder", pickSourceFolder);
});

console.log("🧪 Runtime Check:");
console.log("process.versions.electron:", process.versions.electron);
console.log("process.versions.node:", process.versions.node);
console.log("process.versions.modules:", process.versions.modules);
