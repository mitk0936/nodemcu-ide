import { SerialPort } from "serialport";
import { tryCatch } from "../../../common/try-catch.js";
import { RendererToMainMethods } from "../../../types.js";

export async function listBoards(): ReturnType<
  RendererToMainMethods["getBoards"]
> {
  const { data: boards, error } = await tryCatch(SerialPort.list());
  error && console.error(error);

  if (!Array.isArray(boards)) {
    return {
      error: "Unable to get connected boards.",
      data: null,
    };
  }

  return {
    error: null,
    data: boards.filter(
      (board) => true || Boolean(board.manufacturer || board.serialNumber)
    ),
  };
}
