import type { RendererToMainRequests } from "@nodemcu-ide/electron-bridge-types";

declare global {
  interface Window {
    api: RendererToMainRequests;
  }

  // interface SerialPortFilter {
  //   usbVendorId?: number;
  //   usbProductId?: number;
  // }

  // interface SerialPortRequestOptions {
  //   filters?: SerialPortFilter[];
  // }

  // interface SerialOptions {
  //   baudRate: number;
  //   dataBits?: number;
  //   stopBits?: number;
  //   parity?: "none" | "even" | "odd";
  //   bufferSize?: number;
  //   flowControl?: "none" | "hardware";
  // }

  // interface SerialSignals {
  //   dataTerminalReady?: boolean;
  //   requestToSend?: boolean;
  // }

  // interface SerialPort {
  //   open(options: SerialOptions): Promise<void>;
  //   close(): Promise<void>;
  //   readable: ReadableStream<Uint8Array>;
  //   writable: WritableStream<Uint8Array>;
  //   setSignals(signals: SerialSignals): Promise<void>;
  //   getSignals(): Promise<SerialSignals>;
  //   // Add other methods you might use...
  // }

  // interface Navigator {
  //   serial: {
  //     requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;
  //     getPorts(): Promise<SerialPort[]>;
  //   };
  // }
}
