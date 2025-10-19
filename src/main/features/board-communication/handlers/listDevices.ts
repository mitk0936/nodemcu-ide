import { NodemcuToolFacade } from "../NodemcuToolFacade.js";
import { RendererToMainMethods } from "../../../types.js";
/**
 * Lists connected NodeMCU devices using the packaged CLI (JSON output).
 */
export async function listDevices(): ReturnType<
  RendererToMainMethods["getBoards"]
> {
  const proc = NodemcuToolFacade.devices(); // returns ChildProcess
  let stdout = "";
  let stderr = "";

  proc.stdout?.on("data", (chunk) => {
    stdout += chunk.toString();
  });

  proc.stderr?.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  return await new Promise((resolve) => {
    proc.on("error", (err) => {
      resolve({
        error: `Failed to start nodemcu-tool: ${err.message}`,
        data: null,
      });
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        const msg = stderr.trim() || "Unknown error";

        return resolve({
          error: `nodemcu-tool exited with code ${code}: ${msg}`,
          data: null,
        });
      }

      const raw = stdout.trim();

      if (!raw) {
        return resolve({
          error: "No devices detected.",
          data: null,
        });
      }

      try {
        const devices = JSON.parse(raw);
        resolve({ error: null, data: devices });
      } catch (parseErr) {
        resolve({
          error: `Invalid JSON from nodemcu-tool: ${
            (parseErr as Error).message
          }`,
          data: null,
        });
      }
    });
  });
}
