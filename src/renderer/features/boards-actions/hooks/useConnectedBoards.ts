import { useEffect, useState } from "react";
import { type PortInfo } from "../../../../main/types";

export function useConnectedBoards() {
  const [boards, setBoards] = useState<PortInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      window.api.getBoards().then(({ data: boards, error }) => {
        setBoards(boards ?? []);
        setError(error);
      });
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [setBoards]);

  return { boards, error };
}
