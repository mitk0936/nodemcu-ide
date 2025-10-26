import { ESPLoader, Transport } from "esptool-js";

let port: SerialPort;
let transport: Transport;
let esploader: ESPLoader;

export async function connectAndLog() {
  try {
    // Ask user to select a serial port
    port = await navigator.serial.requestPort();

    // Set up transport and loader
    transport = new Transport(port, true); // `true` enables debug logs
    esploader = new ESPLoader({
      transport,
      baudrate: 115200,
      romBaudrate: 115200,
      terminal: {
        clean: () => null,
        write: () => (msg: string) => console.log("[SERIAL]", msg),
        writeLine: () => (msg: string) => console.log("[SERIAL]", msg),
      },
      debugLogging: true,
    });

    // Try to connect to chip bootloader (e.g., reset into bootloader mode first)
    const mode = await esploader.main();
    console.log("Connected to chip with mode:", mode);
  } catch (err) {
    console.error("Error connecting to board:", err);
  }
}

document.getElementById("connectBtn")?.addEventListener("click", connectAndLog);
