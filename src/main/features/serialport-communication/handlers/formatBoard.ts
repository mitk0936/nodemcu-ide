import { execFile } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { RendererToMainMethods } from "../../../types.js";
import { tryCatch } from "../../../common/try-catch.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodePath = "/home/dimitar/.nvm/versions/node/v22.13.0/bin/node";

const nodemcuToolPath = path.resolve(
  __dirname,
  "../../../../",
  "node_modules",
  ".bin",
  process.platform === "win32" ? "nodemcu-tool.cmd" : "nodemcu-tool"
);

type FormatBoardParams = {
  onData: (d: string) => void;
  onError: (e: string) => void;
};

export async function formatBoard(
  path: string,
  { onData, onError }: FormatBoardParams
): ReturnType<RendererToMainMethods["formatBoard"]> {
  const { error } = await tryCatch(
    new Promise<void>((resolve, reject) => {
      const child = execFile(
        nodePath,
        [
          nodemcuToolPath,
          "mkfs",
          `--port=${path}`,
          "--connection-delay",
          "500",
          "--noninteractive",
        ],
        (err, _, stderr) => {
          if (err) {
            return reject(stderr);
          }

          resolve();
        }
      );

      child.stdout?.on("data", (data) => onData?.(data.toString()));
      child.stderr?.on("data", (data) => onError?.(data.toString()));
    })
  );

  if (error) {
    return {
      error: `An error occured, while trying to format the board (${path}). ${error}`,
      data: null,
    };
  }

  return {
    error: null,
    data: true,
  };
}
