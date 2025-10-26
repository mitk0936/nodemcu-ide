import { useCallback, useState } from "react";

type Options = {
  onError?: (err: string) => void;
  onSuccess?: () => void;
};

export function useFormatBoards({ onError, onSuccess }: Options = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const formatBoard = useCallback(async (path: string) => {
    setIsLoading(true);

    const { error, data } = await window.api.formatBoard(path);

    error && onError?.(error);
    data && onSuccess?.();

    setIsLoading(false);
  }, []);

  return {
    formatBoard,
    isLoading,
  };
}
