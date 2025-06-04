type EventCallback<Payload> = (p: Payload) => void;

type Unsubscribe = () => void;
export type EventSubscriber = <E extends keyof RenderToMainEvents>(
  event: E,
  callback: EventCallback<RenderToMainEvents[E]>
) => Unsubscribe;

export type RendererToMainRequests = RendererToMainMethods & {
  on: EventSubscriber;
  once: EventSubscriber;
};

type MainMethodResponse<T> = Promise<
  { error: string; data: null } | { error: null; data: T }
>;

export type PortConnection = {
  path: string;
  baudRate: number;
};

export type PortInfo = {
  path: string;
  manufacturer: string | undefined;
  serialNumber: string | undefined;
  pnpId: string | undefined;
  locationId: string | undefined;
  productId: string | undefined;
  vendorId: string | undefined;
};

export interface RendererToMainMethods {
  getBoards: () => MainMethodResponse<Array<PortInfo>>;
  formatBoard: (path: string) => MainMethodResponse<boolean>;
  connectToBoard: (path: string, baudRate?: number) => void;
}

export interface RenderToMainEvents {
  serialData: PortConnection & {
    text: string;
  };
  portOpened: PortConnection;
  portClosed: PortConnection;
  portErrorOccured: PortConnection & {
    error: string;
  };
}
