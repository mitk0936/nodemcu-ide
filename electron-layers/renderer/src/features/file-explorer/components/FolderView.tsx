import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import FolderTree from "react-folder-tree";
import "react-folder-tree/dist/style.css";
import "./FolderView.css";

import type { FolderItem } from "apps/desktop/src/main/types";

function toFolderTreeFormat(items: FolderItem[]): any[] {
  return items.map((item) => ({
    id: item.path,
    name: item.name,
    isOpen: false,
    children: item.isDir ? toFolderTreeFormat(item.children || []) : undefined,
  }));
}

export default function FolderView() {
  const [treeData, setTreeData] = useState<any | null>(null);
  const { toast } = useToast();

  const handlePickFolder = async () => {
    const { error, data: result } = await window.api.pickSourceFolder();
    if (!result || error) {
      return toast({
        title: "Folder not selected.",
        variant: "destructive",
      });
    }

    const formatted = {
      id: result.folderPath,
      name: result.folderPath.split("/").pop(),
      isOpen: true,
      children: toFolderTreeFormat(result.tree),
    };

    setTreeData(formatted);
  };

  return (
    <div className="p-1">
      <button onClick={handlePickFolder}>Choose Folder</button>
      {treeData && (
        <div className="mt-4">
          <FolderTree
            data={treeData}
            initOpenStatus="closed"
            initCheckedStatus="custom"
          />
        </div>
      )}
    </div>
  );
}
