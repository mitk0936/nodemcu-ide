import type { RendererToMainRequests } from "../main/types";

declare global {
  interface Window {
    api: RendererToMainRequests;
  }
}
