import { ipcMainSend } from "../../../ipc.js";
import { MainToRendererEvents } from "../../../types.js";
import NodemcuToolTerminalService from "../services/NodemcuToolTerminalService.js";

export const initSerialPortEventHandlers = (
  window: Electron.CrossProcessExports.BrowserWindow
) => {
  NodemcuToolTerminalService.eventEmitter.on(
    "data",
    (payload: MainToRendererEvents["serialData"]) => {
      console.log(payload.text);
      ipcMainSend("serialData", window.webContents, payload);
    }
  );

  NodemcuToolTerminalService.eventEmitter.on(
    "portOpened",
    (payload: MainToRendererEvents["portOpened"]) =>
      ipcMainSend("portOpened", window.webContents, payload)
  );

  NodemcuToolTerminalService.eventEmitter.on(
    "portClosed",
    (payload: MainToRendererEvents["portClosed"]) => {
      ipcMainSend("portClosed", window.webContents, payload);
    }
  );

  NodemcuToolTerminalService.eventEmitter.on(
    "portErrorOccured",
    (payload: MainToRendererEvents["portErrorOccured"]) => {
      ipcMainSend("portErrorOccured", window.webContents, payload);
    }
  );
};
