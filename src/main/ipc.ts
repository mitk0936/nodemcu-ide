import { ipcMain, type WebContents } from "electron";
import { RendererToMainMethods, RenderToMainEvents } from "./types.js";

export function ipcMainHandle<ActionKey extends keyof RendererToMainMethods>(
  actionKey: ActionKey,
  handler: RendererToMainMethods[ActionKey]
) {
  ipcMain.handle(actionKey, (_, ...args) => handler(...(args as [any])));
}

export function ipcMainSend<EventName extends keyof RenderToMainEvents>(
  eventName: EventName,
  webContents: WebContents,
  payload: RenderToMainEvents[EventName]
): void {
  webContents.send(eventName, payload);
}
