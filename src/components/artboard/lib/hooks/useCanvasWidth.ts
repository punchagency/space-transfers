import { useState, useEffect } from "react";

export const useCanvasWidth = () => {
  const [canvasWidth, setCanvasWidth] = useState(0);

  useEffect(() => {
    const updateCanvasWidth = () => {
      const canvas = document.querySelector(
        ".flex-1.relative.flex.items-center"
      ) as HTMLElement;
      if (canvas) {
        setCanvasWidth(canvas.offsetWidth / 96);
      }
    };
    updateCanvasWidth();
    window.addEventListener("resize", updateCanvasWidth);
    return () => window.removeEventListener("resize", updateCanvasWidth);
  }, []);

  return canvasWidth;
};
