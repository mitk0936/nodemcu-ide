import { contextBridge, ipcRenderer } from "electron";

import type { EventSubscriber, RendererToMainRequests } from "./types";

const subscriber =
  (type: "on" | "once"): EventSubscriber =>
  (e: string, callback: Function) => {
    // @ts-ignore-next-line
    const callbackMemo = (_, value) => callback(value);
    ipcRenderer[type](e, callbackMemo);
    return () => {
      ipcRenderer.removeListener(e, callbackMemo);
    };
  };

const api: RendererToMainRequests = {
  formatBoard: (...args) => ipcRenderer.invoke("formatBoard", ...args),
  getBoards: (...args) => ipcRenderer.invoke("getBoards", ...args),
  connectToBoard: (...args) => ipcRenderer.invoke("connectToBoard", ...args),
  on: subscriber("on"),
  once: subscriber("once"),
};

contextBridge.exposeInMainWorld("api", api satisfies RendererToMainRequests);
