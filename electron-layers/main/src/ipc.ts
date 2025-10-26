import { ipcMain, type WebContents } from "electron";
import {
  RendererToMainMethods,
  MainToRendererEvents,
} from "../../bridge/types/dist/index.js";

export function ipcMainHandle<ActionKey extends keyof RendererToMainMethods>(
  actionKey: ActionKey,
  handler: RendererToMainMethods[ActionKey]
) {
  ipcMain.handle(actionKey, (_, ...args) => {
    try {
      // @ts-expect-error Handle all actions, no need of types here
      return handler(...args);
    } catch {
      // TODO: add proper error logging
      return {
        error: "Unknown failure",
        data: null,
      };
    }
  });
}

export function ipcMainSend<EventName extends keyof MainToRendererEvents>(
  eventName: EventName,
  webContents: WebContents,
  payload: MainToRendererEvents[EventName]
): void {
  webContents.send(eventName, payload);
}
