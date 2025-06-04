export function useVerticalResize(
  targetRef: React.RefObject<HTMLElement | null>,
  options: { min?: number; max?: number } = {}
) {
  const { min = 100, max = 800 } = options;

  const onMouseDown = (e: React.MouseEvent) => {
    const startY = e.clientY;
    const startHeight = targetRef.current?.offsetHeight || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!targetRef.current) return;

      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.min(Math.max(startHeight + deltaY, min), max);
      targetRef.current.style.height = `${newHeight}px`;
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
