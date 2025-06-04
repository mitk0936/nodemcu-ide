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

export function execFileAsync(
  file: string,
  args: string[] = [],
  options = {}
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(file, args, options, (error, stdout, stderr) => {
      if (error) {
        return reject({ error, stderr });
      }
      resolve({ stdout, stderr });
    });
  });
}

export async function formatBoard(
  path: string
): ReturnType<RendererToMainMethods["formatBoard"]> {
  const { error, data } = await tryCatch(
    execFileAsync(nodemcuToolPath, [
      "mkfs",
      "--port",
      path,
      "--connection-delay",
      "500",
    ])
  );

  if (error) {
    console.error(error);
    return {
      error: "An error occured, while trying to format a board.",
      data: null,
    };
  }

  return {
    error: null,
    data: true,
  };
}
