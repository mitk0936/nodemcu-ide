import { useCallback, useState } from "react";

type Options = {
  onError?: (err: string) => void;
  onSuccess?: () => void;
};

export function useResetBoard({ onError, onSuccess }: Options = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const resetBoard = useCallback(async (path: string) => {
    setIsLoading(true);

    const { error, data } = await window.api.resetBoard(path);

    error && onError?.(error);
    data && onSuccess?.();

    setIsLoading(false);
  }, []);

  return {
    resetBoard,
    isLoading,
  };
}
