import { app, protocol } from "electron";
import { createWindow } from "./features/browser-init/createWindow.js";
import { initInBrowserNavigation } from "./features/browser-init/initInBrowserNavigation.js";
import { listBoards } from "./features/serialport-communication/handlers/listBoards.js";

import { ipcMainHandle } from "./ipc.js";
import { formatBoard } from "./features/serialport-communication/handlers/formatBoard.js";
import NodemcuToolTerminalService from "./features/serialport-communication/services/NodemcuToolTerminalService.js";
import { resetBoard } from "./features/serialport-communication/handlers/resetBoard.js";
import { handleBoardCmdStd } from "./features/serialport-communication/utils/handleBoardCmdStd.js";
import { initSerialPortEventHandlers } from "./features/serialport-communication/utils/initSerialPortEventHandlers.js";
import { listDevices } from "./features/serialport-communication/handlers/listDevices.js";

// Listen for main app ready
app.whenReady().then(async () => {
  initInBrowserNavigation(app);
  const window = await createWindow();

  initSerialPortEventHandlers(window);

  // register ipcMain hanlders
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
});
