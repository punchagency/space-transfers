import React from "react";
import RulerSegment from "../rulers/RulerSegment";

interface CanvasRulersProps {
  showRulers: boolean;
  zoom: number;
}

export default function CanvasRulers({ showRulers, zoom }: CanvasRulersProps) {
  if (!showRulers) return null;

  return (
    <>
      {/* Top Ruler */}
      <div className="absolute top-0 left-8 w-full h-8 z-20 bg-transparent border-b border-gray-200 pointer-events-none overflow-hidden">
        <div
          className="h-full flex"
          style={{
            width: `${(1 / zoom) * 100}%`,
            transform: `scaleX(${zoom})`,
            transformOrigin: "left center",
          }}
        >
          {Array.from({ length: 25 }).map((_, i) => (
            <RulerSegment key={i} label={i} />
          ))}
        </div>
      </div>

      {/* Left Ruler */}
      <div className="absolute top-8 left-0 h-full w-8 z-20 bg-transparent border-r border-gray-200 pointer-events-none overflow-hidden">
        <div
          className="w-full flex flex-col"
          style={{
            height: `${(1 / zoom) * 100}%`,
            transform: `scaleY(${zoom})`,
            transformOrigin: "top left",
          }}
        >
          {Array.from({ length: 25 }).map((_, i) => (
            <RulerSegment key={i} label={i} vertical />
          ))}
        </div>
      </div>

      {/* Corner 0 Label */}
      <div className="absolute top-0 left-0 w-8 h-8 z-20 bg-white border-b border-r border-gray-200 flex items-center justify-center pointer-events-none">
        <span className="text-[9px] text-gray-500 font-medium">0</span>
      </div>
    </>
  );
}
