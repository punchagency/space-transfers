export default function RulerSegment({ vertical = false, label }: { vertical?: boolean; label: number }) {
  // Positions are defined as fractions of the segment (0–1),
  // mapped from the original 12/24/.../84 values over a 96px base.
  const base = 96;
  const rawTicks = [12, 24, 36, 48, 60, 72, 84];
  const ticks = rawTicks.map((pos) => ({
    pos: pos / base,
    size: pos === 48 ? "large" : pos === 24 || pos === 72 ? "medium" : "small",
  }));

  return (
    <div
      className={`relative ${vertical
        ? "flex-1 w-full border-t border-gray-300"
        : "flex-1 h-full border-l border-gray-300"
        }`}
    >
      {label !== 0 && label !== 24 && (
        <span
          className={`absolute text-[9px] text-gray-500 font-medium select-none ${vertical ? "top-1 left-4" : "top-4 left-1"
            }`}
        >
          {label}
        </span>
      )}
      {ticks.map((tick) => {
        const lengthPx =
          tick.size === "large" ? 12 : tick.size === "medium" ? 8 : 5;

        const style = vertical
          ? {
            top: `${tick.pos * 100}%`,
            left: 0,
            width: `${lengthPx}px`,
            height: "1px",
            transform: "translateY(-0.5px)",
          }
          : {
            left: `${tick.pos * 100}%`,
            top: 0,
            height: `${lengthPx}px`,
            width: "1px",
            transform: "translateX(-0.5px)",
          };

        return (
          <div
            key={tick.pos}
            className="absolute bg-gray-400"
            style={style}
          />
        );
      })}
    </div>
  );
}
