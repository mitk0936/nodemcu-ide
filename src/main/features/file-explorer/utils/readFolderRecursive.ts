import { join } from "node:path";
import { statSync } from "node:fs";

import { readdirSync } from "node:original-fs";
import { FolderItem } from "../../../types.js";

export function readFolderRecursive(folderPath: string): FolderItem[] {
  const items = readdirSync(folderPath);

  return items.map((name) => {
    const fullPath = join(folderPath, name);
    const stat = statSync(fullPath);
    const isDir = stat.isDirectory();

    return {
      name,
      path: fullPath,
      isDir,
      children: isDir ? readFolderRecursive(fullPath) : undefined,
    };
  });
}
