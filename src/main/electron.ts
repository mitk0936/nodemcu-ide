import { app } from "electron";
import { createWindow } from "./features/browser-init/createWindow.js";
import { initInBrowserNavigation } from "./features/browser-init/initInBrowserNavigation.js";

import { ipcMainHandle } from "./ipc.js";
import { formatBoard } from "./features/serialport-communication/handlers/formatBoard.js";
import NodemcuToolTerminalService from "./features/serialport-communication/services/NodemcuToolTerminalService.js";
import { resetBoard } from "./features/serialport-communication/handlers/resetBoard.js";
import { handleBoardCmdStd } from "./features/serialport-communication/utils/handleBoardCmdStd.js";
import { initSerialPortEventHandlers } from "./features/serialport-communication/utils/initSerialPortEventHandlers.js";
import { listDevices } from "./features/serialport-communication/handlers/listDevices.js";
import { pickSourceFolder } from "./features/file-explorer/handlers/pickSourceFolder.js";

app.setName("NodemcuIDE");

// Listen for main app ready
app.whenReady().then(async () => {
  initInBrowserNavigation(app);
  const window = await createWindow();

  initSerialPortEventHandlers(window);

  // Board Actions Handlers
  ipcMainHandle("getBoards", listDevices);

  ipcMainHandle("connectToBoard", async (path: string, baudRate: number) => {
    await NodemcuToolTerminalService.disconnect();
    await NodemcuToolTerminalService.connect(path, baudRate);
    return Promise.resolve({ error: null, data: true });
  });

  ipcMainHandle("resetBoard", async (path: string) => {
    await NodemcuToolTerminalService.disconnect();
    return resetBoard(path, handleBoardCmdStd(path, window));
  });

  ipcMainHandle("formatBoard", async (path: string) => {
    await NodemcuToolTerminalService.disconnect();
    return formatBoard(path, handleBoardCmdStd(path, window));
  });

  ipcMainHandle("disconnectBoard", async () => {
    await NodemcuToolTerminalService.disconnect();
    return Promise.resolve({ error: null, data: true });
  });

  // File Explorer Actions
  ipcMainHandle("pickSourceFolder", pickSourceFolder);
});

console.log("🧪 Runtime Check:");
console.log("process.versions.electron:", process.versions.electron);
console.log("process.versions.node:", process.versions.node);
console.log("process.versions.modules:", process.versions.modules);
