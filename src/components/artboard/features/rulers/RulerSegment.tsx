export default function RulerSegment({ vertical = false, label }: { vertical?: boolean; label: number }) {
  const ticks = [12, 24, 36, 48, 60, 72, 84];

  return (
    <div className={`relative ${vertical ? 'h-24 w-full border-t border-gray-300' : 'w-24 h-full border-l border-gray-300'} flex-shrink-0`}>
      {label !== 0 && (
        <span className={`absolute text-[9px] text-gray-500 font-medium select-none ${vertical ? 'top-1 left-4' : 'top-4 left-1'}`}>
          {label}
        </span>
      )}
      {ticks.map(pos => {
        let height = 'h-2';
        if (pos === 48) height = 'h-4';
        else if (pos === 24 || pos === 72) height = 'h-3';

        const style = vertical
          ? { top: `${pos}px`, left: 0, width: height === 'h-4' ? '12px' : height === 'h-3' ? '8px' : '5px', height: '1px' }
          : { left: `${pos}px`, top: 0, height: height === 'h-4' ? '12px' : height === 'h-3' ? '8px' : '5px', width: '1px' };

        return (
          <div
            key={pos}
            className="absolute bg-gray-400"
            style={style}
          />
        );
      })}
    </div>
  );
}
