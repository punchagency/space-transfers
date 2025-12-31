import React from "react";

interface CanvasMarginsProps {
  showMargins: boolean;
  showRulers: boolean;
  marginSize: number;
  zoom: number;
}

export default function CanvasMargins({
  showMargins,
  showRulers,
  marginSize,
  zoom,
}: CanvasMarginsProps) {
  if (!showMargins) return null;

  return (
    <>
      <div
        className="absolute z-15 pointer-events-none border-2 border-dashed border-red-500 rounded-lg"
        style={{
          top: showRulers ? "12px" : "0",
          left: showRulers ? "12px" : "0",
          right: showRulers ? "12px" : "0",
          bottom: showRulers ? "12px" : "0",
          margin: `${marginSize * 96}px`,
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
        }}
      />
      <div
        className="absolute z-15 pointer-events-none text-red-500 text-xs font-medium"
        style={{
          top: showRulers ? "16px" : "4px",
          left: showRulers ? "16px" : "4px",
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
          marginTop: `${marginSize * 96 + 2}px`,
          marginLeft: `${marginSize * 96 + 2}px`,
        }}
      >
        Safe Print Area ({marginSize}" margin)
      </div>
    </>
  );
}
