import React, { useState } from "react";
import { useItemActions, useMouseInteractions, useDropHandler, useCanvasWidth, useArtboardEffects } from "./artboard/lib/hooks";
import { snapToGridPoint } from "./artboard/lib/utils";
import { DpiWarning, CanvasContainer } from "./artboard/features/canvas";
import type { ArtboardProps } from "./artboard/types";

export default function Artboard({
  onHeaderInfoChange,
  showRulers = true,
  showGrid = true,
  snapToGrid = false,
  showMargins = false,
  marginSize = 0.25,
  autoNestStickers = false,
  spacing = 0.5,
  onDataChange,
  initialData,
  onAddToCart,
}: ArtboardProps) {
  const [zoom, setZoom] = useState(1);
  const [items, setItems] = useState<any[]>([]);
  const [counter, setCounter] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showProperties, setShowProperties] = useState<Record<number, boolean>>({});
  const [addedToCart, setAddedToCart] = useState<Set<number>>(new Set());

  const canvasWidth = useCanvasWidth();
  const { isDragging, lowDpiCount, onDragOver, onDragLeave, onDropEvent } = useDropHandler(
    items,
    setItems,
    counter,
    setCounter,
    setSelectedId,
    canvasWidth,
    zoom
  );
  const itemActions = useItemActions(items, setItems, selectedId, snapToGrid, snapToGridPoint);
  const { handleResizeStart, handleDragStart, isDraggingItem } = useMouseInteractions(
    items,
    setItems,
    selectedId,
    zoom,
    snapToGrid,
    snapToGridPoint,
    autoNestStickers
  );

  useArtboardEffects(
    items,
    setItems,
    selectedId,
    snapToGrid,
    canvasWidth,
    spacing,
    autoNestStickers,
    onHeaderInfoChange,
    initialData,
    onDataChange,
    counter
  );
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.05 : 0.95;
    setZoom((z) => Math.min(3, Math.max(1, z * factor)));
  };
  const duplicateSelected = () => {
    if (selectedId == null) return;
    const target = items.find((it) => it.id === selectedId);
    if (!target) return;
    const newId = counter + 1;
    setCounter(newId);
    const copy = { ...target, id: newId, posX: target.posX + 0.5, posY: target.posY + 0.5 };
    setItems((prev) => [...prev, copy]);
    setSelectedId(newId);
  };


  return (
    <div className="flex-1 relative bg-gray-50 overflow-hidden flex flex-col artboard-capture-area">
      <DpiWarning count={lowDpiCount} />
      <div className="flex-1 flex relative">
        <CanvasContainer
          zoom={zoom}
          showRulers={showRulers}
          showMargins={showMargins}
          marginSize={marginSize}
          isDragging={isDragging}
          items={items}
          selectedId={selectedId}
          showProperties={showProperties}
          addedToCart={addedToCart}
          onWheel={onWheel}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDropEvent}
          onZoomIn={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
          onZoomOut={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(2)))}
          onCanvasClick={() => {
            setSelectedId(null);
            setShowProperties({});
          }}
          onItemSelect={(id) => {
            setSelectedId(id);
            setShowProperties({});
          }}
          onToggleProperties={(id) =>
            setShowProperties((prev) => ({ ...prev, [id]: true }))
          }
          itemActions={itemActions}
          onDuplicate={duplicateSelected}
          onDelete={() => {
            itemActions.deleteSelected();
            setSelectedId(null);
          }}
          onAddToCart={(it) => {
            if (onAddToCart && !addedToCart.has(it.id)) {
              onAddToCart({
                id: it.id,
                name: it.name,
                widthIn: it.widthIn,
                heightIn: it.heightIn,
                copies: it.copies,
                price: it.price,
                url: it.url,
              });
              setAddedToCart((prev) => new Set(prev).add(it.id));
            }
          }}
          onCloseProperties={() => setShowProperties({})}
          onDragStart={handleDragStart}
          onResizeStart={handleResizeStart}
          isDraggingItem={isDraggingItem}
        />
      </div>
    </div>
  );
}
