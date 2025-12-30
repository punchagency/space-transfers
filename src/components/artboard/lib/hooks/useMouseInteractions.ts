import { useState, useEffect } from "react";
import { ArtboardItem } from "../../types";

export const useMouseInteractions = (
  items: ArtboardItem[],
  setItems: React.Dispatch<React.SetStateAction<ArtboardItem[]>>,
  selectedId: number | null,
  zoom: number,
  snapToGrid: boolean,
  snapToGridPoint: (value: number) => number,
  autoNestStickers: boolean
) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isDraggingItem, setIsDraggingItem] = useState(false);
  const [dragStart, setDragStart] = useState<{
    x: number;
    y: number;
    posX: number;
    posY: number;
  } | null>(null);

  const handleResizeStart = (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation();
    const item = items.find((it) => it.id === itemId);
    if (!item) return;
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: item.widthIn,
      height: item.heightIn,
    });
  };

  const handleDragStart = (e: React.MouseEvent, itemId: number) => {
    if (autoNestStickers) return; // Prevent dragging when auto-nest is on

    const item = items.find((it) => it.id === itemId);
    if (!item || item.locked) return;
    setIsDraggingItem(true);
    setDragStart({ x: e.clientX, y: e.clientY, posX: item.posX, posY: item.posY });
  };

  useEffect(() => {
    if (!isResizing || !resizeStart || selectedId == null) return;

    const handleMouseMove = (e: MouseEvent) => {
      const item = items.find((it) => it.id === selectedId);
      if (!item) return;

      const deltaX = (e.clientX - resizeStart.x) / (96 * zoom);
      const deltaY = (e.clientY - resizeStart.y) / (96 * zoom);
      const newWidth = Math.max(0.5, resizeStart.width + deltaX);
      const newHeight = Math.max(0.5, resizeStart.height + deltaY);

      if (item.linked) {
        const ratio = resizeStart.height / resizeStart.width;
        const avgDelta = (deltaX + deltaY / ratio) / 2;
        const finalWidth = Math.max(0.5, resizeStart.width + avgDelta);
        const finalHeight = finalWidth * ratio;
        setItems((prev) =>
          prev.map((it) =>
            it.id === selectedId
              ? { ...it, widthIn: finalWidth, heightIn: finalHeight }
              : it
          )
        );
      } else {
        setItems((prev) =>
          prev.map((it) =>
            it.id === selectedId ? { ...it, widthIn: newWidth, heightIn: newHeight } : it
          )
        );
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeStart(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, resizeStart, selectedId, items, zoom, setItems]);

  useEffect(() => {
    if (!isDraggingItem || !dragStart || selectedId == null) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - dragStart.x) / (96 * zoom);
      const deltaY = (e.clientY - dragStart.y) / (96 * zoom);
      const newPosX = dragStart.posX + deltaX;
      const newPosY = dragStart.posY + deltaY;
      const finalX = snapToGrid ? snapToGridPoint(newPosX) : newPosX;
      const finalY = snapToGrid ? snapToGridPoint(newPosY) : newPosY;
      setItems((prev) =>
        prev.map((it) =>
          it.id === selectedId ? { ...it, posX: finalX, posY: finalY } : it
        )
      );
    };

    const handleMouseUp = () => {
      setIsDraggingItem(false);
      setDragStart(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingItem, dragStart, selectedId, zoom, snapToGrid, snapToGridPoint, setItems]);

  return {
    handleResizeStart,
    handleDragStart,
    isDraggingItem,
  };
};
