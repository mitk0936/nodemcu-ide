import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MainToRendererEvents } from "src/main/types";

type Line = {
  [K in keyof MainToRendererEvents]: MainToRendererEvents[K] & { event: K };
}[keyof MainToRendererEvents];

const renderLine = (line: Line) => {
  switch (line.event) {
    case "portOpened":
      return `Port opened. ${line.path} (Baud: ${line.baudRate})`;
    case "serialData":
      return "text" in line ? `> ${line.text}` : "";
    case "portClosed":
      return `Port closed. ${line.path} (Baud: ${line.baudRate})`;
    case "portErrorOccured":
      return "error" in line && `❌ Port error occured: ${line.error}`;
    case "boardStd": {
      return line.text;
    }
  }
};

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateSerialLines = useCallback(
    <T extends keyof MainToRendererEvents>(
      evName: T,
      evData: MainToRendererEvents[T]
    ) => {
      const line = { event: evName, ...evData } as Line;
      setLines((lines) => [...lines, line]);
    },
    []
  );

  useEffect(() => {
    const { on } = window.api;

    const listeners = [
      on("portOpened", (evData) => updateSerialLines("portOpened", evData)),
      on("serialData", (evData) => updateSerialLines("serialData", evData)),
      on("portClosed", (evData) => updateSerialLines("portClosed", evData)),
      on("portErrorOccured", (evData) =>
        updateSerialLines("portErrorOccured", evData)
      ),
      on("boardStd", (evData) => updateSerialLines("boardStd", evData)),
    ];

    return () => {
      listeners.forEach((unsub) => unsub());
    };
  }, [updateSerialLines]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-auto bg-black text-green-400 font-mono p-2 text-base text- scroll-box select-text"
    >
      {lines.map((line, i) => {
        const classes = cn(
          line.event === "portOpened" && "mb-1",
          line.event === "portClosed" && "text-yellow-400 mb-1",
          line.event === "portErrorOccured" && "text-red-400 mb-1",
          "type" in line && line.type === "error" && "text-orange-400"
        );

        return (
          <div className={classes} key={`serial-line-${i}`}>
            {renderLine(line)}
          </div>
        );
      })}
    </div>
  );
}
