import { useState } from "react";
import { readDPI, loadImageSize } from "../utils";
import { animateBounce, animateShake, animateItemPosition } from "../utils";
import { calculateGridLayout } from "../utils";
import { ArtboardItem } from "../../types";
import { gsap } from "gsap";

export const useDropHandler = (
  items: ArtboardItem[],
  setItems: React.Dispatch<React.SetStateAction<ArtboardItem[]>>,
  counter: number,
  setCounter: React.Dispatch<React.SetStateAction<number>>,
  setSelectedId: React.Dispatch<React.SetStateAction<number | null>>,
  canvasWidth: number,
  zoom: number,
  autoNestStickers: boolean,
  spacing: number,
  marginSize: number
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
    const zoomVal = zoom || 1;
    const dropX = (e.clientX - rect.left) / (96 * zoomVal);
    const dropY = (e.clientY - rect.top) / (96 * zoomVal);

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
          isDropping: true,
        } as ArtboardItem;
      })
    );

    if (lowDpiImages > 0) {
      setLowDpiCount(lowDpiImages);
      setTimeout(() => setLowDpiCount(0), 8000);
    }

    // 1. Calculate the final intended layout for ALL items immediately
    setTimeout(() => {
      const artboardContainer = document.querySelector("#artboard-main-container") as HTMLElement;
      const currentCanvasWidth = artboardContainer ? artboardContainer.offsetWidth / 96 : (canvasWidth || 24);

      const allItems = [...created, ...items];
      const finalUpdates = calculateGridLayout(allItems, currentCanvasWidth, spacing, autoNestStickers, marginSize);

      // 2. Update state IMMEDIATELY but only for NEW items. 
      // Keep old items at their current positions to prevent "snapping" before they are pushed.
      setItems((prev) => {
        const withCreated = [...created, ...prev];
        return withCreated.map(it => {
          const isNew = created.some(c => c.id === it.id);
          if (isNew) {
            const update = finalUpdates.find(u => u.id === it.id);
            if (update) {
              return { ...it, posX: update.posX, posY: update.posY, gravityActive: false };
            }
          }
          return it;
        });
      });

      // 3. Perform the physical interaction sequence
      setTimeout(() => {
        const PPI = 96;

        // Calculate items that need to be pushed
        const itemsToPush = finalUpdates.filter(u => {
          const existing = items.find(ex => ex.id === u.id);
          return existing && (Math.abs(u.posX - existing.posX) > 0.01 || Math.abs(u.posY - existing.posY) > 0.01);
        });

        const pushedIds = new Set(itemsToPush.map(p => p.id));
        const newIds = new Set(created.map(c => c.id));

        // A. CONTACT POINT: Trigger 'Physical Shove' with progressive ripple (Domino effect)
        gsap.delayedCall(2.4, () => {
          // 1. Update React state for ALL affected items at once
          setItems(prev => prev.map(it => {
            const update = finalUpdates.find(u => u.id === it.id);
            const isNew = newIds.has(it.id);
            if (isNew) return { ...it, isDropping: false };
            if (update && pushedIds.has(it.id)) {
              return { ...it, posX: update.posX, posY: update.posY, gravityActive: true };
            }
            return it;
          }));

          // 2. Trigger staggered physical animations
          const sortedToPush = [...itemsToPush].sort((a, b) => {
            const indexA = finalUpdates.findIndex(u => u.id === a.id);
            const indexB = finalUpdates.findIndex(u => u.id === b.id);
            return indexA - indexB;
          });

          sortedToPush.forEach((u, index) => {
            const existing = items.find(ex => ex.id === u.id);
            if (!existing) return;
            const el = document.querySelector(`[data-item-id="${u.id}"]`) as HTMLElement;
            if (el) {
              gsap.delayedCall(index * 0.08, () => {
                animateItemPosition(el, u.posX, u.posY, true, existing.posX, existing.posY);
              });
            }
          });
        });

        // B. SETTLE POINT: Shake nearby items that WERE NOT pushed
        gsap.delayedCall(3.3, () => {
          finalUpdates.forEach((u) => {
            if (!pushedIds.has(u.id) && !newIds.has(u.id)) {
              const el = document.querySelector(`[data-item-id="${u.id}"]`) as HTMLElement;
              if (el) animateShake(el);
            }
          });
        });

        // C. INDIVIDUAL ANIMATIONS FOR NEW ITEMS
        created.forEach((item) => {
          const update = finalUpdates.find(u => u.id === item.id);
          if (!update) return;

          const element = document.querySelector(`[data-item-id="${item.id}"]`) as HTMLElement;
          if (!element) return;

          gsap.fromTo(element,
            {
              left: `${(dropX - item.widthIn / 2) * PPI}px`,
              top: `${(dropY - item.heightIn / 2) * PPI}px`,
              scale: 1.2,
              opacity: 0,
            },
            {
              left: `${update.posX * PPI}px`,
              top: `${update.posY * PPI}px`,
              scale: 1,
              opacity: 1,
              duration: 3.0,
              ease: "power2.out",
              onComplete: () => {
                animateBounce(element, update.posY);
              }
            }
          );
        });
      }, 50);
    }, 50);

    setCounter(start + dropped.length - 1);
    setSelectedId(null);
  };

  return { isDragging, lowDpiCount, onDragOver, onDragLeave, onDropEvent };
};
