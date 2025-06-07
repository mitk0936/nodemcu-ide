import { EventEmitter } from "events";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { PortConnection, MainToRendererEvents } from "../../../types.js";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodemcuToolPath = path.resolve(
  __dirname,
  "../../../../",
  "node_modules",
  ".bin",
  process.platform === "win32" ? "nodemcu-tool.cmd" : "nodemcu-tool"
);

class NodemcuToolConnectionService {
  private connection: PortConnection | null = null;
  private terminalProcess: ChildProcessWithoutNullStreams | null = null;
  private readline: readline.Interface | null = null;

  public eventEmitter = new EventEmitter();

  async connect(path: string, baudRate: number = 9600) {
    // Disconnect if already connected
    if (this.terminalProcess) {
      await this.disconnect();
    }

    this.connection = { path, baudRate };

    const connectionStarted: PortConnection = { ...this.connection };

    console.log("🔌 Spawning nodemcu-tool terminal...");

    this.terminalProcess = spawn(nodemcuToolPath, [
      "terminal",
      "--port",
      path,
      "--baud",
      baudRate.toString(),
    ]);

    this.readline = readline.createInterface({
      input: this.terminalProcess.stdout,
      crlfDelay: Infinity,
    });

    this.readline.on("line", (line: string) => {
      const text = line.trim();
      this.eventEmitter.emit("data", {
        ...connectionStarted,
        text,
      });
    });

    this.terminalProcess.stderr.on("data", (data: Buffer) => {
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

    this.terminalProcess.stdin.write(data + "\n", (err) => {
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
