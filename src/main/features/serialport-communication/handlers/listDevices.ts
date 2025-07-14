import { tryCatch } from "../../../common/try-catch.js";
import { PortInfo, RendererToMainMethods } from "../../../types.js";
import listDevicess from "nodemcu-tool/lib/connector/list-devices.js";

export async function listDevices(): ReturnType<
  RendererToMainMethods["getBoards"]
> {
  const { error, data: devices } = await tryCatch(listDevicess());

  if (error) {
    return {
      error: `An error with getting Nodemcu devices - ${error}`,
      data: null,
    };
  }

  return {
    error: null,
    data: devices as PortInfo[],
  };
}
