import { useEffect, useState } from "react";
import { ArtboardItem } from "../../types";
import { animateItemPosition } from "../../lib/utils";
import { calculateGridLayout } from "../../lib/utils";
import { snapToGridPoint } from "../../lib/utils";

export const useArtboardEffects = (
  items: ArtboardItem[],
  setItems: React.Dispatch<React.SetStateAction<ArtboardItem[]>>,
  selectedId: number | null,
  snapToGrid: boolean,
  canvasWidth: number,
  spacing: number,
  autoNestStickers: boolean,
  onHeaderInfoChange?: (info: any) => void,
  initialData?: any,
  onDataChange?: (data: any) => void,
  counter?: number
) => {
  const [originalPositions, setOriginalPositions] = useState<
    Record<number, { posX: number; posY: number }>
  >({});

  // Load initial data
  useEffect(() => {
    if (initialData) {
      setItems(initialData.items || []);
    }
  }, [initialData, setItems]);

  // Export data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange({ items, counter });
    }
  }, [items, counter, onDataChange]);

  // Update canvas width
  useEffect(() => {
    const updateCanvasWidth = () => {
      const canvas = document.querySelector(
        ".flex-1.relative.flex.items-center"
      ) as HTMLElement;
      if (canvas) {
        return canvas.offsetWidth / 96;
      }
      return 0;
    };
    updateCanvasWidth();
  }, []);

  // Animate items
  useEffect(() => {
    items.forEach((it) => {
      const element = document.querySelector(
        `[data-item-id="${it.id}"]`
      ) as HTMLElement;
      if (!element) return;
      animateItemPosition(element, it.posX, it.posY, it.gravityActive || false);
    });
  }, [items]);

  // Gravity layout and Auto Nesting
  useEffect(() => {
    const hasGravity = items.some((it) => it.gravityActive);

    // If we're not auto-nesting and no items have gravity, we don't need to do anything
    if (canvasWidth === 0 || (!autoNestStickers && !hasGravity)) return;

    const updates = calculateGridLayout(items, canvasWidth, spacing, autoNestStickers);

    setItems((prev) => {
      // Check if any item actually needs to move to avoid infinite loops
      const needsUpdate = prev.some(it => {
        const update = updates.find((u) => u.id === it.id);
        if (!update) return false;
        // Check if position changed significantly
        return Math.abs(update.posX - it.posX) > 0.001 || Math.abs(update.posY - it.posY) > 0.001;
      });

      if (!needsUpdate) return prev;

      return prev.map((it) => {
        const update = updates.find((u) => u.id === it.id);
        if (update) {
          return { ...it, posX: update.posX, posY: update.posY, gravityActive: false };
        }
        return it;
      });
    });
  }, [items, canvasWidth, autoNestStickers, spacing, setItems]);

  // Snap to grid
  useEffect(() => {
    if (snapToGrid) {
      setOriginalPositions((prev) => {
        const newOriginals = { ...prev };
        items.forEach((it) => {
          if (!newOriginals[it.id]) {
            newOriginals[it.id] = { posX: it.posX, posY: it.posY };
          }
        });
        return newOriginals;
      });
      setItems((prev) =>
        prev.map((it) => ({
          ...it,
          posX: snapToGridPoint(it.posX),
          posY: snapToGridPoint(it.posY),
        }))
      );
    } else {
      setItems((prev) =>
        prev.map((it) => {
          const original = originalPositions[it.id];
          return original ? { ...it, posX: original.posX, posY: original.posY } : it;
        })
      );
    }
  }, [snapToGrid, setItems]);

  // Header info change
  useEffect(() => {
    if (onHeaderInfoChange) {
      // Calculate actual gang sheet dimensions from canvas
      const canvas = document.querySelector(".flex-1.relative.flex.items-center") as HTMLElement;
      let gangSheetWidthIn = 24; // default
      let gangSheetHeightIn = 19.5; // default

      if (canvas) {
        // Convert pixels to inches (96 DPI)
        gangSheetWidthIn = canvas.offsetWidth / 96;
        gangSheetHeightIn = canvas.offsetHeight / 96;
      }

      const areaSf = +((gangSheetWidthIn * gangSheetHeightIn) / 144).toFixed(2);

      // Calculate total price based on all items on the artboard
      const totalPrice = items.reduce((sum, item) => {
        const itemWidthIn = +item.widthIn.toFixed(2);
        const itemHeightIn = +item.heightIn.toFixed(2);
        const itemAreaSf = +((itemWidthIn * itemHeightIn) / 144).toFixed(2);
        const pricePerSqFt = 5.5;
        const itemPrice = +(itemAreaSf * pricePerSqFt * (item.copies || 1)).toFixed(2);
        return sum + itemPrice;
      }, 0);

      // Collect all image names
      const imageNames = items.map(item =>
        (item.name || `Item #${item.id}`).replace(/\.[^/.]+$/, "")
      );

      onHeaderInfoChange({
        hasItem: items.length > 0,
        areaSf,
        widthIn: gangSheetWidthIn,
        heightIn: gangSheetHeightIn,
        name: 'Gang Sheet',
        price: totalPrice,
        imageNames,
      });
    }
  }, [items, selectedId, onHeaderInfoChange]);
};
