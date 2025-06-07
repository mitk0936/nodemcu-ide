import { execFile } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { RendererToMainMethods } from "../../../types.js";
import { tryCatch } from "../../../common/try-catch.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodemcuToolPath = path.resolve(
  __dirname,
  "../../../../",
  "node_modules",
  ".bin",
  process.platform === "win32" ? "nodemcu-tool.cmd" : "nodemcu-tool"
);

type ResetBoardParams = {
  onData: (d: string) => void;
  onError: (e: string) => void;
};

export async function resetBoard(
  path: string,
  { onData, onError }: ResetBoardParams
): ReturnType<RendererToMainMethods["resetBoard"]> {
  const { error } = await tryCatch(
    new Promise<void>((resolve, reject) => {
      const child = execFile(
        nodemcuToolPath,
        ["reset", `--port=${path}`],
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
      error: `An error occured, while trying to reset the board (${path}). ${error}`,
      data: null,
    };
  }

  return {
    error: null,
    data: true,
  };
}
