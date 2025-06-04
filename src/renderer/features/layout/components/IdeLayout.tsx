import { useRef, lazy, Suspense } from "react";
import { useHorizontalResize } from "../hooks/useHorizontalResize";
import { useVerticalResize } from "../hooks/useVerticalResize";
import BoardActionsContainer from "@/features/boards-actions/components/BoardActionsContainer";
import Terminal from "@/features/console/components/Terminal";

export default function IdeLayout() {
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const fileExplorerPaneRef = useRef<HTMLDivElement>(null);
  const codeEditorPaneRef = useRef<HTMLDivElement>(null);

  const handleLeftPaneResizeStart = useHorizontalResize(leftPaneRef, {
    min: 150,
    max: 400,
  });

  const handleFileExplorerResizeStart = useVerticalResize(fileExplorerPaneRef, {
    min: 300,
    max: 600,
  });

  const handleCodeEditorResizeStart = useVerticalResize(codeEditorPaneRef, {
    min: 300,
    max: 600,
  });

  return (
    <div className="flex h-screen w-screen user-select-none">
      {/* Left pane */}
      <div
        ref={leftPaneRef}
        className="flex flex-col bg-gray-800 text-white w-64 min-w-[3rem] overflow-hidden"
      >
        {/* Top: File explorer */}
        <div ref={fileExplorerPaneRef} className="h-[600px] p-2 bg-gray-900">
          <p className="text-sm font-bold">File Explorer</p>
        </div>

        {/* Divider for resizing */}
        <div
          onMouseDown={handleFileExplorerResizeStart}
          className="h-1 cursor-row-resize bg-gray-600 hover:bg-blue-500"
        ></div>

        {/* Bottom: Boards Actions */}
        <div className="flex-1 min-h-[200px] overflow-auto bg-gray-950 p-2 scroll-box">
          <BoardActionsContainer />
        </div>
      </div>

      {/* Divider for resizing */}
      <div
        onMouseDown={handleLeftPaneResizeStart}
        className="w-1 cursor-col-resize bg-gray-600 hover:bg-blue-500"
      ></div>

      {/* Right pane */}
      <div className="flex flex-col flex-1 bg-gray-100">
        {/* Top: Code editor */}
        <div
          ref={codeEditorPaneRef}
          className="h-[600px] overflow-hidden bg-white border-b border-gray-300 p-2"
        >
          <p className="text-sm font-bold text-gray-600">Editor (Lua)</p>
        </div>

        {/* Divider for resizing */}
        <div
          onMouseDown={handleCodeEditorResizeStart}
          className="h-1 cursor-row-resize bg-gray-600 hover:bg-blue-500"
        ></div>

        {/* Bottom: Console */}
        <div className="flex flex-1 min-h-[200px] w-full h-full">
          <Terminal />
        </div>
      </div>
    </div>
  );
}
