import { BAUD_RATES } from "../../../common/constants.js";
import { RendererToMainMethods } from "../../../types.js";
import SerialPortConnectionService from "../services/SerialPortConnectionService.js";

export const connectToBoard: RendererToMainMethods["connectToBoard"] = (
  path,
  baudRate = BAUD_RATES[0]
) => {
  SerialPortConnectionService.connect(path, baudRate);
};
