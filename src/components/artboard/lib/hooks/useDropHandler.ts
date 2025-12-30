import { useState } from "react";
import { readDPI, loadImageSize } from "../../lib/utils";
import { animateToPosition, animateBounce, animateShake } from "../../lib/utils";
import { calculateGridLayout, calculateDropPosition } from "../../lib/utils";
import { ArtboardItem } from "../../types";

export const useDropHandler = (
  items: ArtboardItem[],
  setItems: React.Dispatch<React.SetStateAction<ArtboardItem[]>>,
  counter: number,
  setCounter: React.Dispatch<React.SetStateAction<number>>,
  setSelectedId: React.Dispatch<React.SetStateAction<number | null>>,
  canvasWidth: number,
  zoom: number
) => {
  const [isDragging, setIsDragging] = useState(false);
  const [lowDpiCount, setLowDpiCount] = useState(0);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDropEvent = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files || []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (dropped.length === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const dropX = (e.clientX - rect.left) / (96 * zoom);
    const dropY = (e.clientY - rect.top) / (96 * zoom);
    const topCenterY = 1.0;

    const start = counter + 1;
    let lowDpiImages = 0;
    const created = await Promise.all(
      dropped.map(async (file, idx) => {
        const [{ dpiX, dpiY }, { widthPx, heightPx, url }] = await Promise.all([
          readDPI(file),
          loadImageSize(file),
        ]);
        const dpi = Math.max(1, Math.round(dpiX || dpiY || 150));
        if (dpi < 300) lowDpiImages++;
        const widthIn = widthPx / dpi;
        const heightIn = heightPx / dpi;
        return {
          id: start + idx,
          url,
          rotation: 0,
          locked: false,
          expanded: false,
          flipped: false,
          autoCrop: false,
          copies: 1,
          widthIn,
          heightIn,
          posX: dropX - widthIn / 2,
          posY: dropY - heightIn / 2,
          linked: true,
          price: 12.34,
          name: file.name,
          gravityActive: false,
        };
      })
    );

    if (lowDpiImages > 0) {
      setLowDpiCount(lowDpiImages);
      setTimeout(() => setLowDpiCount(0), 8000);
    }

    setItems((prev) => [...prev, ...created]);

    setTimeout(() => {
      created.forEach((newItem) => {
        const element = document.querySelector(
          `[data-item-id="${newItem.id}"]`
        ) as HTMLElement;
        if (element) {
          const { targetX, targetY } = calculateDropPosition(
            items,
            newItem,
            canvasWidth,
            topCenterY
          );

          animateToPosition(element, targetX, targetY, () => {
            animateBounce(element, targetY, () => {
              items.forEach((it) => {
                const existingElement = document.querySelector(
                  `[data-item-id="${it.id}"]`
                ) as HTMLElement;
                if (existingElement) animateShake(existingElement);
              });

              setTimeout(() => {
                setItems((prev) => {
                  const allItems = [...prev];
                  const updates = calculateGridLayout(allItems, canvasWidth, 0.5, false);
                  return allItems.map((it) => {
                    const update = updates.find((u) => u.id === it.id);
                    return update ? { ...it, ...update, gravityActive: true } : it;
                  });
                });
              }, 400);
            });
          });
        }
      });
    }, 50);

    setCounter(start + dropped.length - 1);
    setSelectedId(null);
  };

  return { isDragging, lowDpiCount, onDragOver, onDragLeave, onDropEvent };
};
