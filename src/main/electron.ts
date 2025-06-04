import { app } from "electron";
import { createWindow } from "./features/browser-init/createWindow.js";
import { initInBrowserNavigation } from "./features/browser-init/initInBrowserNavigation.js";
import { listBoards } from "./features/serialport-communication/handlers/listBoards.js";

import { ipcMainHandle, ipcMainSend } from "./ipc.js";
import { formatBoard } from "./features/serialport-communication/handlers/formatBoard.js";
import { connectToBoard } from "./features/serialport-communication/handlers/connectToBoard.js";
import SerialPortConnectionService from "./features/serialport-communication/services/SerialPortConnectionService.js";
import { RenderToMainEvents } from "./types.js";

// Listen for main app ready
app.whenReady().then(() => {
  initInBrowserNavigation(app);

  // register ipcMain hanlders
  ipcMainHandle("getBoards", listBoards);
  ipcMainHandle("formatBoard", formatBoard);
  ipcMainHandle("connectToBoard", connectToBoard);

  const window = createWindow();

  SerialPortConnectionService.eventEmitter.on(
    "data",
    (payload: RenderToMainEvents["serialData"]) => {
      console.log(payload.text);
      ipcMainSend("serialData", window.webContents, payload);
    }
  );

  SerialPortConnectionService.eventEmitter.on(
    "portOpened",
    (payload: RenderToMainEvents["portOpened"]) =>
      ipcMainSend("portOpened", window.webContents, payload)
  );

  SerialPortConnectionService.eventEmitter.on(
    "portClosed",
    (payload: RenderToMainEvents["portClosed"]) => {
      ipcMainSend("portClosed", window.webContents, payload);
    }
  );

  SerialPortConnectionService.eventEmitter.on(
    "portErrorOccured",
    (payload: RenderToMainEvents["portErrorOccured"]) => {
      ipcMainSend("portErrorOccured", window.webContents, payload);
    }
  );

  app.on("window-all-closed", () => {
    app.quit();
  });
});
