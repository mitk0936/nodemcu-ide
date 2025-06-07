type EventCallback<Payload> = (p: Payload) => void;

type Unsubscribe = () => void;
export type EventSubscriber = <E extends keyof MainToRendererEvents>(
  event: E,
  callback: EventCallback<MainToRendererEvents[E]>
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

export type BoardStd = {
  path: string;
  type: "output" | "error";
  text: string;
};

export type PortInfo = {
  path: string;
  manufacturer: string | undefined;
  pnpId: string | undefined;
  productId: string | undefined;
  vendorId: string | undefined;
};

export interface RendererToMainMethods {
  getBoards: () => MainMethodResponse<Array<PortInfo>>;
  formatBoard: (path: string) => MainMethodResponse<boolean>;
  connectToBoard: (
    path: string,
    baudRate: number
  ) => MainMethodResponse<boolean>;
  resetBoard: (path: string) => MainMethodResponse<boolean>;
  disconnectBoard: () => MainMethodResponse<boolean>;
}

export interface MainToRendererEvents {
  serialData: PortConnection & {
    text: string;
  };
  portOpened: PortConnection;
  portClosed: PortConnection;
  portErrorOccured: PortConnection & {
    error: string;
  };
  boardStd: BoardStd;
}
