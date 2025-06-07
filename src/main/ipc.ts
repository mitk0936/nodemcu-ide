import { ipcMain, type WebContents } from "electron";
import { RendererToMainMethods, MainToRendererEvents } from "./types.js";

export function ipcMainHandle<ActionKey extends keyof RendererToMainMethods>(
  actionKey: ActionKey,
  handler: RendererToMainMethods[ActionKey]
) {
  // @ts-expect-error
  ipcMain.handle(actionKey, (_, ...args) => handler(...args));
}

export function ipcMainSend<EventName extends keyof MainToRendererEvents>(
  eventName: EventName,
  webContents: WebContents,
  payload: MainToRendererEvents[EventName]
): void {
  webContents.send(eventName, payload);
}
