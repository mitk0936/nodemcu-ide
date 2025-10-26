import { RendererToMainMethods } from "../../../../../bridge/types/dist/index.js";
import { NodemcuToolFacade } from "../NodemcuToolFacade.js";

type FormatBoardParams = {
  onData?: (chunk: string) => void;
  onError?: (chunk: string) => void;
};

/**
 * Formats a NodeMCU board filesystem via NodemcuToolFacade.
 */
export async function formatBoard(
  port: string,
  { onData, onError }: FormatBoardParams = {}
): ReturnType<RendererToMainMethods["formatBoard"]> {
  const proc = NodemcuToolFacade.mkfs(port);

  proc.stdout?.on("data", (d) => onData?.(d.toString()));
  proc.stderr?.on("data", (d) => onError?.(d.toString()));

  await new Promise<Awaited<ReturnType<RendererToMainMethods["formatBoard"]>>>(
    (resolve) => {
      proc.once("error", () =>
        resolve({ data: null, error: "Failed to execute format board." })
      );
      proc.once("close", (code) =>
        code !== 0
          ? resolve({ data: null, error: "Format board failed." })
          : resolve({ data: true, error: null })
      );
    }
  );

  return { error: null, data: true };
}
