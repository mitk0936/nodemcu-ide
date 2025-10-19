import { RendererToMainMethods } from "../../../types.js";
import { NodemcuToolFacade } from "../NodemcuToolFacade.js";

type ResetBoardParams = {
  onData?: (chunk: string) => void;
  onError?: (chunk: string) => void;
};

/**
 * Resets a NodeMCU board via NodemcuToolFacade.
 */
export async function resetBoard(
  port: string,
  { onData, onError }: ResetBoardParams = {}
): ReturnType<RendererToMainMethods["resetBoard"]> {
  const proc = NodemcuToolFacade.reset(port);

  proc.stdout?.on("data", (d) => onData?.(d.toString()));
  proc.stderr?.on("data", (d) => onError?.(d.toString()));

  await new Promise<Awaited<ReturnType<RendererToMainMethods["resetBoard"]>>>(
    (resolve) => {
      proc.once("error", () =>
        resolve({
          data: null,
          error: `Failed to execute reset on port ${port}.`,
        })
      );

      proc.once("close", (code) =>
        code === 0
          ? resolve({ data: true, error: null })
          : resolve({ data: null, error: `Reset failed on port ${port}.` })
      );
    }
  );

  return { error: null, data: true };
}
