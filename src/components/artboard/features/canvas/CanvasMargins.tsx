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

  const marginTop = showRulers ? `${12 + marginSize * 96}px` : `${marginSize * 96}px`;
  const marginLeft = showRulers ? `${12 + marginSize * 96}px` : `${marginSize * 96}px`;
  const marginRight = showRulers ? `${12 + marginSize * 96}px` : `${marginSize * 96}px`;

  return (
    <>
      {/* Top border - left to right margin */}
      <div
        className="absolute z-15 pointer-events-none border-t-2 border-dashed border-red-500"
        style={{
          top: marginTop,
          left: marginLeft,
          right: marginRight,
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
        }}
      />
      {/* Left border - full height */}
      <div
        className="absolute z-15 pointer-events-none border-l-2 border-dashed border-red-500"
        style={{
          top: marginTop,
          left: marginLeft,
          bottom: 0,
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
        }}
      />
      {/* Right border - full height, positioned to connect with top border */}
      <div
        className="absolute z-15 pointer-events-none border-r-2 border-dashed border-red-500"
        style={{
          top: marginTop,
          right: marginRight,
          bottom: 0,
          transform: `scale(${zoom})`,
          transformOrigin: "top right",
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
