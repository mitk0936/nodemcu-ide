import { dialog } from "electron";
import { readFolderRecursive } from "../utils/readFolderRecursive.js";

export async function pickSourceFolder() {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return {
      error: "No files selected.",
      data: null,
    };
  }

  const folderPath = result.filePaths[0];
  const tree = readFolderRecursive(folderPath);

  return {
    error: null,
    data: {
      folderPath,
      tree,
    },
  };
}
