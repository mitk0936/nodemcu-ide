import { useEffect, useState } from "react";
import { type PortInfo } from "../../../../main/types";

export function useConnectedBoards() {
  const [boards, setBoards] = useState<PortInfo[]>([]);
  useEffect(() => {
    const interval = setInterval(() => {
      window.api
        .getBoards()
        .then(({ data: boards }) => setBoards(boards ?? []));
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [setBoards]);

  return { boards };
}
