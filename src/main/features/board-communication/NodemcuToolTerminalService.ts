import { EventEmitter } from "events";
import { PortConnection } from "../../types.js";
import readline from "readline";
import { ChildProcess } from "child_process";
import { NodemcuToolFacade } from "./NodemcuToolFacade.js";

/**
 * Service that abstracts the terminal stdio with nodemcu boards.
 * Exposed methods for:
 *  - connect
 *  - disconnect
 * Parses output and produces event via the NodemcuToolConnectionService.eventEmitter
 */
class NodemcuToolConnectionService {
  private connection: PortConnection | null = null;
  private terminalProcess: ChildProcess | null = null;
  private readline: readline.Interface | null = null;

  // TODO: use typed event emitter
  public eventEmitter = new EventEmitter();

  async connect(connectionPath: string, baudRate: number = 9600) {
    // Disconnect if already connected
    if (this.terminalProcess) {
      await this.disconnect();
    }

    this.connection = { path: connectionPath, baudRate };
    const connectionStarted: PortConnection = { ...this.connection };

    console.log("🔌 Spawning nodemcu-tool terminal...");

    this.terminalProcess = NodemcuToolFacade.terminal(
      connectionPath,
      baudRate.toString()
    );

    this.readline = readline.createInterface({
      input: this.terminalProcess.stdout!,
      crlfDelay: Infinity,
    });

    this.readline.on("line", (line: string) => {
      const text = line.trim();
      this.eventEmitter.emit("data", {
        ...connectionStarted,
        text,
      });
    });

    this.terminalProcess.stderr!.on("data", (data: Buffer) => {
      const error = data.toString().trim();
      console.error("⚠️ stderr:", error);
      this.eventEmitter.emit("portErrorOccured", {
        ...connectionStarted,
        error,
      });
    });

    this.terminalProcess.on("close", (code) => {
      console.log(`⚠️ nodemcu-tool terminal exited with code ${code}`);
      this.terminalProcess = null;
      this.eventEmitter.emit("portClosed", {
        ...connectionStarted,
      });
    });

    // Simulate open success (nodemcu-tool doesn't have a direct "open" event)
    setTimeout(() => {
      if (this.terminalProcess) {
        this.eventEmitter.emit("portOpened", { ...this.connection });
      }
    }, 500); // Adjust as needed
  }

  send(data: string) {
    if (!this.terminalProcess) {
      console.error("❌ No terminal process to send data");
      return;
    }

    this.terminalProcess.stdin!.write(data + "\n", (err) => {
      if (err) {
        console.error("❌ Write error:", err.message);
      }
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (this.terminalProcess) {
        this.terminalProcess.kill();
        this.terminalProcess = null;
      }

      if (this.readline) {
        this.readline.close();
        this.readline = null;
      }

      this.connection = null;
      resolve();
    });
  }

  isConnected(): boolean {
    return this.terminalProcess !== null;
  }

  getPort() {
    return null; // No SerialPort instance
  }

  getConnection() {
    return this.connection;
  }
}

export default new NodemcuToolConnectionService();
