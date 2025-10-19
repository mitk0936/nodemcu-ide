import { BrowserWindow } from "electron";
import { ipcMainHandle, ipcMainSend } from "../../ipc.js";
import { listDevices } from "./handlers/listDevices.js";
import NodemcuToolTerminalService from "./NodemcuToolTerminalService.js";
import { MainToRendererEvents } from "../../types.js";
import { formatBoard } from "./handlers/formatBoard.js";
import { resetBoard } from "./handlers/resetBoard.js";

/**
 * Controls the main flow of events in regards of the board communication
 *
 * - Hanldes events coming via ipc (from renderer) = connectToBoard, resetBoard, etc.
 * - Listens for events on the stdout from board (NodemcuToolTerminalService) and sends back to renderer (portOpened, portClosed, serialData, etc.)
 */
export class BoardCommunicationController {
  constructor(private readonly window: BrowserWindow) {
    this.initIpcHandlers();
    this.initTerminalEventHandlers();
  }

  private initIpcHandlers() {
    // Board Actions Handlers
    ipcMainHandle("getBoards", listDevices);

    ipcMainHandle("connectToBoard", async (path: string, baudRate: number) => {
      await NodemcuToolTerminalService.disconnect();
      await NodemcuToolTerminalService.connect(path, baudRate);
      return Promise.resolve({ error: null, data: true });
    });

    ipcMainHandle("resetBoard", async (path: string) => {
      await NodemcuToolTerminalService.disconnect();
      return resetBoard(path, this.handleSendBoardStd(path));
    });

    ipcMainHandle("formatBoard", async (path: string) => {
      await NodemcuToolTerminalService.disconnect();
      return formatBoard(path, this.handleSendBoardStd(path));
    });

    ipcMainHandle("disconnectBoard", async () => {
      await NodemcuToolTerminalService.disconnect();
      return Promise.resolve({ error: null, data: true });
    });
  }

  private initTerminalEventHandlers() {
    NodemcuToolTerminalService.eventEmitter.on(
      "data",
      (payload: MainToRendererEvents["serialData"]) => {
        ipcMainSend("serialData", this.window.webContents, payload);
      }
    );

    NodemcuToolTerminalService.eventEmitter.on(
      "portOpened",
      (payload: MainToRendererEvents["portOpened"]) =>
        ipcMainSend("portOpened", this.window.webContents, payload)
    );

    NodemcuToolTerminalService.eventEmitter.on(
      "portClosed",
      (payload: MainToRendererEvents["portClosed"]) => {
        ipcMainSend("portClosed", this.window.webContents, payload);
      }
    );

    NodemcuToolTerminalService.eventEmitter.on(
      "portErrorOccured",
      (payload: MainToRendererEvents["portErrorOccured"]) => {
        ipcMainSend("portErrorOccured", this.window.webContents, payload);
      }
    );
  }

  private handleSendBoardStd = (path: string) => {
    return {
      onData: (text: string) =>
        ipcMainSend("boardStd", this.window.webContents, {
          path,
          type: "output",
          text,
        }),
      onError: (e: string) =>
        ipcMainSend("boardStd", this.window.webContents, {
          path,
          type: "error",
          text: e,
        }),
    };
  };
}
