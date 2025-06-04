export function useHorizontalResize(
  targetRef: React.RefObject<HTMLElement | null>,
  options: { min?: number; max?: number } = {}
) {
  const { min = 150, max = 400 } = options;

  const onMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startWidth = targetRef?.current?.offsetWidth || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!targetRef?.current) return;
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.min(Math.max(startWidth + delta, min), max);
      targetRef.current.style.width = `${newWidth}px`;
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return onMouseDown;
}
