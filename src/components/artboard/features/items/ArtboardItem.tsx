import React from "react";
import { FiLink } from "react-icons/fi";
import ItemToolbar from "./ItemToolbar";
import PropertiesPanel from "./PropertiesPanel";

interface ArtboardItemProps {
  item: {
    id: number;
    url: string;
    rotation: number;
    locked: boolean;
    expanded: boolean;
    flipped: boolean;
    widthIn: number;
    heightIn: number;
    posX: number;
    posY: number;
    name?: string;
    price: number;
    autoCrop: boolean;
    copies: number;
    linked: boolean;
  };
  isSelected: boolean;
  showProperties: boolean;
  addedToCart: boolean;
  onSelect: () => void;
  onToggleProperties: () => void;
  onExpand: () => void;
  onRotate: () => void;
  onToggleLock: () => void;
  onFlip: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleAutoCrop: () => void;
  onSetCopies: (n: number) => void;
  onToggleLinked: () => void;
  onSetWidthIn: (n: number) => void;
  onSetHeightIn: (n: number) => void;
  onSetPosX: (n: number) => void;
  onSetPosY: (n: number) => void;
  onAddToCart: () => void;
  onCloseProperties: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  onResizeStart: (e: React.MouseEvent) => void;
  isDragging: boolean;
}

export default function ArtboardItem({
  item,
  isSelected,
  showProperties,
  addedToCart,
  onSelect,
  onToggleProperties,
  onExpand,
  onRotate,
  onToggleLock,
  onFlip,
  onDuplicate,
  onDelete,
  onToggleAutoCrop,
  onSetCopies,
  onToggleLinked,
  onSetWidthIn,
  onSetHeightIn,
  onSetPosX,
  onSetPosY,
  onAddToCart,
  onCloseProperties,
  onDragStart,
  onResizeStart,
  isDragging,
}: ArtboardItemProps) {
  return (
    <div
      data-item-id={item.id}
      className={`absolute rounded-md ${isSelected ? "ring-4 ring-blue-500 z-40" : "z-10"}`}
      style={{
        left: `${item.posX * 96}px`,
        top: `${item.posY * 96}px`,
        touchAction: "none",
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (isSelected && !showProperties) {
          onToggleProperties();
        } else if (!isSelected) {
          onSelect();
        }
      }}
    >
      {isSelected && (
        <ItemToolbar
          locked={item.locked}
          onExpand={onExpand}
          onRotate={onRotate}
          onToggleLock={onToggleLock}
          onFlip={onFlip}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          position={item.posY <= 0.5 ? 'bottom' : 'top'}
        />
      )}
      {isSelected && showProperties && !isDragging && (
        <PropertiesPanel
          item={item}
          addedToCart={addedToCart}
          onClose={onCloseProperties}
          onToggleAutoCrop={onToggleAutoCrop}
          onSetCopies={onSetCopies}
          onToggleLinked={onToggleLinked}
          onSetWidthIn={onSetWidthIn}
          onSetHeightIn={onSetHeightIn}
          onSetPosX={onSetPosX}
          onSetPosY={onSetPosY}
          onAddToCart={onAddToCart}
        />
      )}
      {isSelected && (
        <div className="absolute top-1 left-2 bg-blue-600 text-white text-xs rounded-xl px-2 h-5 flex items-center gap-1">
          <FiLink className="w-3 h-3" />
          <span>#{item.id}</span>
        </div>
      )}
      {!item.autoCrop && item.copies > 1 && (
        <div className="absolute bottom-1 right-1 bg-gray-900 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
          {item.copies}
        </div>
      )}
      <img
        src={item.url}
        alt="dropped"
        className={`${item.expanded ? "max-w-[60vw] max-h-[60vh]" : "max-w-[40vw] max-h-[40vh]"
          } object-contain ${!item.locked ? "cursor-move" : "cursor-default"}`}
        style={{
          width: `${item.widthIn * 96}px`,
          height: `${item.heightIn * 96}px`,
          transform: `scaleX(${item.flipped ? -1 : 1}) rotate(${item.rotation}deg)`,
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          onDragStart(e);
        }}
      />
      {isSelected && (
        <>
          <span
            className="absolute -top-2 -left-2 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white cursor-nwse-resize"
            onMouseDown={onResizeStart}
          />
          <span
            className="absolute -top-2 -right-2 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white cursor-nesw-resize"
            onMouseDown={onResizeStart}
          />
          <span
            className="absolute -bottom-2 -left-2 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white cursor-nesw-resize"
            onMouseDown={onResizeStart}
          />
          <span
            className="absolute -bottom-2 -right-2 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white cursor-nwse-resize"
            onMouseDown={onResizeStart}
          />
        </>
      )}
    </div>
  );
}
