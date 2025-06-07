import { ipcMainSend } from "../../../ipc.js";

export const handleBoardCmdStd = (
  path: string,
  window: Electron.CrossProcessExports.BrowserWindow
) => {
  return {
    onData: (text: string) =>
      ipcMainSend("boardStd", window.webContents, {
        path,
        type: "output",
        text,
      }),
    onError: (e: string) =>
      ipcMainSend("boardStd", window.webContents, {
        path,
        type: "error",
        text: e,
      }),
  };
};
