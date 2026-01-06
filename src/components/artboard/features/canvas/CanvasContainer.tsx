import React from "react";
import { getGridStyle } from "../../lib/utils";
import CanvasRulers from "./CanvasRulers";
import CanvasMargins from "./CanvasMargins";
import EmptyState from "./EmptyState";
import ZoomControls from "../zoom/ZoomControls";
import ArtboardItem from "../items/ArtboardItem";
import { ArtboardItem as ArtboardItemType } from "../../types";

interface CanvasContainerProps {
  zoom: number;
  showRulers: boolean;
  showMargins: boolean;
  marginSize: number;
  isDragging: boolean;
  items: ArtboardItemType[];
  selectedId: number | null;
  showProperties: Record<number, boolean>;
  addedToCart: Set<number>;
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCanvasClick: () => void;
  onItemSelect: (id: number) => void;
  onToggleProperties: (id: number) => void;
  itemActions: any;
  onDuplicate: () => void;
  onDelete: () => void;
  onAddToCart: (item: any) => void;
  onCloseProperties: () => void;
  onDragStart: (e: React.MouseEvent, id: number) => void;
  onResizeStart: (e: React.MouseEvent, id: number) => void;
  isDraggingItem: boolean;
  canvasWidth: number;
}

export default function CanvasContainer({
  zoom,
  showRulers,
  showMargins,
  marginSize,
  isDragging,
  items,
  selectedId,
  showProperties,
  addedToCart,
  onWheel,
  onDragOver,
  onDragLeave,
  onDrop,
  onZoomIn,
  onZoomOut,
  onCanvasClick,
  onItemSelect,
  onToggleProperties,
  itemActions,
  onDuplicate,
  onDelete,
  onAddToCart,
  onCloseProperties,
  onDragStart,
  onResizeStart,
  isDraggingItem,
  canvasWidth,
}: CanvasContainerProps) {
  return (
    <div
      className="flex-1 relative flex items-center justify-center bg-white overflow-hidden"
      onWheel={onWheel}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="absolute inset-0 z-0 opacity-100" style={getGridStyle(zoom)} />
      <CanvasRulers showRulers={showRulers} zoom={zoom} />
      <CanvasMargins
        showMargins={showMargins}
        showRulers={showRulers}
        marginSize={marginSize}
        zoom={zoom}
      />
      <div
        className="absolute inset-0"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "center",
          transition: "transform 200ms ease-out",
        }}
        onClick={onCanvasClick}
      >
        <div className="absolute inset-0 z-10">
          {items.length > 0 ? (
            items.map((it) => (
              <ArtboardItem
                key={it.id}
                item={it}
                isSelected={selectedId === it.id}
                showProperties={showProperties[it.id] || false}
                addedToCart={addedToCart.has(it.id)}
                onSelect={() => onItemSelect(it.id)}
                onToggleProperties={() => onToggleProperties(it.id)}
                onExpand={itemActions.toggleExpandSelected}
                onRotate={itemActions.rotateSelected}
                onToggleLock={itemActions.toggleLockSelected}
                onFlip={itemActions.flipSelected}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                onToggleAutoCrop={itemActions.toggleAutoCrop}
                onSetCopies={itemActions.setCopies}
                onToggleLinked={itemActions.toggleLinked}
                onSetWidthIn={itemActions.setWidthIn}
                onSetHeightIn={itemActions.setHeightIn}
                onSetPosX={itemActions.setPosX}
                onSetPosY={itemActions.setPosY}
                onAddToCart={() => onAddToCart(it)}
                onCloseProperties={onCloseProperties}
                onDragStart={(e) => onDragStart(e, it.id)}
                onResizeStart={(e) => onResizeStart(e, it.id)}
                isDragging={isDraggingItem}
                canvasWidth={canvasWidth}
                marginSize={marginSize}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
      {isDragging && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="w-full h-full border-2 border-dashed border-blue-400 rounded" />
        </div>
      )}
      <ZoomControls zoom={zoom} onZoomIn={onZoomIn} onZoomOut={onZoomOut} />
    </div>
  );
}
