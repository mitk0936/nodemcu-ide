import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RenderToMainEvents } from "src/main/types";

type Line = {
  [K in keyof RenderToMainEvents]: RenderToMainEvents[K] & { event: K };
}[keyof RenderToMainEvents];

const renderLine = (line: Line) => {
  switch (line.event) {
    case "portOpened":
      return `Port opened. ${line.path} | ${line.baudRate}`;
    case "serialData":
      return "text" in line ? `> ${line.text}` : "";
    case "portClosed":
      return `Port closed. ${line.path} | ${line.baudRate}`;
    case "portErrorOccured":
      return "error" in line && `❌ Port error occured: ${line.error}`;
  }
};

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateSerialLines = useCallback(
    <T extends keyof RenderToMainEvents>(
      evName: T,
      evData: RenderToMainEvents[T]
    ) => {
      const line = { event: evName, ...evData } as Line;
      setLines((lines) => [...lines, line]);
    },
    []
  );

  useEffect(() => {
    const listeners = [
      window.api.on("portOpened", (evData) =>
        updateSerialLines("portOpened", evData)
      ),
      window.api.on("serialData", (evData) =>
        updateSerialLines("serialData", evData)
      ),
      window.api.on("portClosed", (evData) =>
        updateSerialLines("portClosed", evData)
      ),
      window.api.on("portErrorOccured", (evData) =>
        updateSerialLines("portErrorOccured", evData)
      ),
    ];

    return () => {
      listeners.forEach((l) => l());
    };
  }, [updateSerialLines]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-auto bg-black text-green-400 font-mono p-2 text-sm text- scroll-box select-text"
    >
      {lines.map((line, i) => {
        const classes = cn(
          line.event === "portOpened" && "text-base mb-1",
          line.event === "portClosed" && "text-base text-yellow-400 mb-1",
          line.event === "portErrorOccured" && "text-base text-red-400 mb-1"
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
