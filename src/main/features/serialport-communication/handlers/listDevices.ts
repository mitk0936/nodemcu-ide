import path from "path";
import { tryCatch } from "../../../common/try-catch.js";
import { PortInfo, RendererToMainMethods } from "../../../types.js";
import { fileURLToPath } from "url";
import { execFile } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodemcuToolPath = path.resolve(
  __dirname,
  "../../../../",
  "node_modules",
  ".bin",
  process.platform === "win32" ? "nodemcu-tool.cmd" : "nodemcu-tool"
);

export async function listDevices(): ReturnType<
  RendererToMainMethods["getBoards"]
> {
  const { error, data: devices } = await tryCatch(
    new Promise<PortInfo[]>((resolve, reject) => {
      execFile(
        nodemcuToolPath,
        ["devices", "--json"],
        (err, stdout, stderr) => {
          if (err) {
            return reject(stderr);
          }

          resolve(Array.from(JSON.parse(stdout)));
        }
      );
    })
  );

  if (error) {
    return {
      error: "An error occured getting the ESP boards.",
      data: null,
    };
  }

  return {
    error: null,
    data: devices as PortInfo[],
  };
}
