import { contextBridge, ipcRenderer } from "electron";
import type {
  EventSubscriber,
  MainToRendererEvents,
  RendererToMainRequests,
} from "@nodemcu-ide/electron-bridge-types";

const allowedEvents: Array<keyof MainToRendererEvents> = [
  "serialData",
  "portOpened",
  "portClosed",
  "portErrorOccured",
  "boardStd",
] as const;

const subscriber =
  (type: "on" | "once"): EventSubscriber =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  (e: (typeof allowedEvents)[number], callback: Function) => {
    if (!allowedEvents.includes(e)) {
      throw new Error(
        `Subscribing to an event that is not allowed (${e}). Events allowed: (${allowedEvents.toString()})`
      );
    }

    const callbackMemo = <K extends keyof MainToRendererEvents>(
      _: Electron.IpcRendererEvent,
      value: MainToRendererEvents[K]
    ) => callback(value);

    ipcRenderer[type](e, callbackMemo);
    return () => {
      ipcRenderer.removeListener(e, callbackMemo);
    };
  };

const api: RendererToMainRequests = {
  formatBoard: (...args) => ipcRenderer.invoke("formatBoard", ...args),
  getBoards: (...args) => ipcRenderer.invoke("getBoards", ...args),
  connectToBoard: (...args) => ipcRenderer.invoke("connectToBoard", ...args),
  resetBoard: (...args) => ipcRenderer.invoke("resetBoard", ...args),
  disconnectBoard: (...args) => ipcRenderer.invoke("disconnectBoard", ...args),
  pickSourceFolder: (...args) =>
    ipcRenderer.invoke("pickSourceFolder", ...args),
  on: subscriber("on"),
  once: subscriber("once"),
};

contextBridge.exposeInMainWorld("api", api);
