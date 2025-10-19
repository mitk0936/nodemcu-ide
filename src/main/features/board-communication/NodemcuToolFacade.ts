import { spawn, SpawnOptions } from "node:child_process";
import { join } from "node:path";
import { app } from "electron";

const DEFAULT_SPAWN_OPTIONS: Partial<SpawnOptions> = {
  stdio: ["ignore", "pipe", "pipe"],
  shell: false,
};

/**
 * Facade for communicating with the compiled nodemcu-tool package
 * nodemcu-tool is compiled into an exe
 */
export class NodemcuToolFacade {
  private static getBinaryPath() {
    if (!app.isPackaged) {
      // Dev: use workspace build output
      return join(
        process.cwd(),
        "packages",
        "nodemcu-tool-binary",
        "dist",
        "nodemcu-tool.exe"
      );
    }

    // Prod: after electron-builder copies from extraResources
    return process.resourcesPath, "extra-tools", "nodemcu-tool.exe";
  }

  static devices() {
    return spawn(
      this.getBinaryPath(),
      ["devices", "--json"],
      DEFAULT_SPAWN_OPTIONS
    );
  }

  static mkfs(port: string) {
    return spawn(
      this.getBinaryPath(),
      [
        "mkfs",
        `--port=${port}`,
        "--connection-delay",
        "500",
        "--noninteractive",
      ],
      DEFAULT_SPAWN_OPTIONS
    );
  }

  static reset(port: string) {
    return spawn(
      this.getBinaryPath(),
      ["reset", `--port=${port}`],
      DEFAULT_SPAWN_OPTIONS
    );
  }

  static terminal(port: string, baudRate: string) {
    return spawn(
      this.getBinaryPath(),
      ["terminal", "--port", port, "--baud", baudRate],
      DEFAULT_SPAWN_OPTIONS
    );
  }
}
