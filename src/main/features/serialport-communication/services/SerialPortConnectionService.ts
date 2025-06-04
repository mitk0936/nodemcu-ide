import { SerialPort, ReadlineParser } from "serialport";
import { EventEmitter } from "events";
import { PortConnection, RenderToMainEvents } from "../../../types.js";

class SerialConnectionService {
  private connection: PortConnection | null = null;
  private port: SerialPort | null = null;
  private parser: ReadlineParser | null = null;

  public eventEmitter = new EventEmitter();

  async connect(path: string, baudRate: number = 9600) {
    // Disconnect if already connected
    if (this.port?.isOpen) {
      await this.disconnect();
    }

    console.log("Opening port: ", path, baudRate);

    this.connection = { path, baudRate };

    // Initialize port (do not auto-open)
    this.port = new SerialPort({ path, baudRate, autoOpen: false });

    // Setup parser to read lines
    this.parser = this.port.pipe(new ReadlineParser({ delimiter: "\n" }));

    // Line-based data event
    this.parser.on("data", (line: string) => {
      this.eventEmitter.emit("data", {
        ...(this.connection as PortConnection),
        text: line.trim(),
      } satisfies RenderToMainEvents["serialData"]);
    });

    // Error handler
    this.port.on("error", (err) => {
      console.error("❌ Serial port error:", err.message);
      this.eventEmitter.emit("portErrorOccured", {
        ...this.connection,
        error: err.message,
      });
    });

    // Closed handler
    this.port.on("close", () => {
      console.log("⚠️ Port closed.");
      this.port = null;
      this.parser = null;
      this.eventEmitter.emit("portClosed", {
        ...this.connection,
      });
    });

    // Open port
    this.port.open((err) => {
      if (err) {
        console.error("❌ Error opening port:", err.message);
        this.eventEmitter.emit("portErrorOccured", {
          ...this.connection,
          error: err.message,
        });
        return;
      }

      console.log(`✅ Port ${path} opened`);
      this.eventEmitter.emit("portOpened", { ...this.connection });
    });
  }

  send(data: string) {
    if (!this.port?.isOpen) {
      console.error("❌ No open port to send data");
      return;
    }
    this.port.write(data, (err) => {
      if (err) {
        console.error("❌ Write error:", err.message);
      }
    });
  }

  disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.port?.isOpen) {
        console.log("Port is not open");
        this.port = null;
        this.parser = null;
        this.connection = null;
        return resolve();
      }

      this.port.close(() => {
        this.port = null;
        this.parser = null;
        this.connection = null;
        resolve();
      });
    });
  }

  isConnected(): boolean {
    return !!this.port?.isOpen;
  }

  getPort() {
    return this.port;
  }
}

export default new SerialConnectionService();
