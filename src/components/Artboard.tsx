import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  MdZoomIn,
  MdZoomOut,
  MdLink,
  MdOpenInFull,
  MdRotateRight,
  MdLock,
  MdLockOpen,
  MdContentCopy,

  MdClose,
} from "react-icons/md";
import { LuFlipHorizontal } from "react-icons/lu";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FiLink } from "react-icons/fi";
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
}: {
  onHeaderInfoChange?: (info: {
    hasItem: boolean;
    areaSf?: number;
    widthIn?: number;
    heightIn?: number;
    name?: string;
    price?: number;
  }) => void;
  showRulers?: boolean;
  showGrid?: boolean;
  snapToGrid?: boolean;
  showMargins?: boolean;
  marginSize?: number;
  autoNestStickers?: boolean;
  spacing?: number;
  onDataChange?: (data: any) => void;
  initialData?: any;
}) {
  const [zoom, setZoom] = useState(1);
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 3;
  const [isDragging, setIsDragging] = useState(false);
  const [items, setItems] = useState<
    {
      id: number;
      url: string;
      rotation: number;
      locked: boolean;
      expanded: boolean;
      flipped: boolean;
      autoCrop: boolean;
      copies: number;
      widthIn: number;
      heightIn: number;
      posX: number;
      posY: number;
      linked: boolean;
      price: number;
      name?: string;
      isAnimating?: boolean;
      dropY?: number;
      velocityY?: number;
      gravityActive?: boolean;
    }[]
  >([]);
  const [counter, setCounter] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showProperties, setShowProperties] = useState<Record<number, boolean>>({});
  const [originalPositions, setOriginalPositions] = useState<Record<number, { posX: number; posY: number }>>({});
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isDraggingItem, setIsDraggingItem] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; posX: number; posY: number } | null>(null);
  const animationRef = React.useRef<number | null>(null);
  const [lowDpiCount, setLowDpiCount] = useState(0);

  // Load initial data
  useEffect(() => {
    if (initialData) {
      setItems(initialData.items || []);
      setCounter(initialData.counter || 0);
    }
  }, [initialData]);

  // Export data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange({ items, counter });
    }
  }, [items, counter]);
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.05 : 0.95;
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * factor));
    setZoom(next);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => {
    setIsDragging(false);
  };
  // Parse basic DPI from JPEG (JFIF) or PNG (pHYs). Fallback to 300 DPI.
  const readDPI = async (
    file: File
  ): Promise<{ dpiX?: number; dpiY?: number }> => {
    try {
      const buf = await file.arrayBuffer();
      const dv = new DataView(buf);
      // JPEG JFIF APP0
      if (dv.getUint16(0, false) === 0xffd8) {
        let off = 2;
        while (off + 4 <= dv.byteLength) {
          if (dv.getUint8(off) !== 0xff) break;
          const marker = dv.getUint8(off + 1);
          const len = dv.getUint16(off + 2, false);
          const segStart = off + 4;
          if (marker === 0xe0 && segStart + 11 <= dv.byteLength) {
            const id0 = dv.getUint8(segStart + 0);
            const id1 = dv.getUint8(segStart + 1);
            const id2 = dv.getUint8(segStart + 2);
            const id3 = dv.getUint8(segStart + 3);
            const id4 = dv.getUint8(segStart + 4);
            // 'JFIF\0'
            if (
              id0 === 0x4a &&
              id1 === 0x46 &&
              id2 === 0x49 &&
              id3 === 0x46 &&
              id4 === 0x00
            ) {
              const units = dv.getUint8(segStart + 7);
              const xd = dv.getUint16(segStart + 8, false);
              const yd = dv.getUint16(segStart + 10, false);
              if (units === 1) {
                return { dpiX: xd, dpiY: yd };
              } else if (units === 2) {
                const toInch = 2.54;
                return {
                  dpiX: Math.round(xd * toInch),
                  dpiY: Math.round(yd * toInch),
                };
              }
            }
          }
          off += len > 0 ? len + 2 : 2;
        }
      }
      // PNG pHYs
      const PNG_SIG = 0x89504e47;
      if (dv.getUint32(0, false) === PNG_SIG) {
        let off = 8; // after signature
        while (off + 12 <= dv.byteLength) {
          const length = dv.getUint32(off, false);
          const type = dv.getUint32(off + 4, false);
          // 'pHYs'
          if (type === 0x70485973 && length === 9) {
            const xppu = dv.getUint32(off + 8, false);
            const yppu = dv.getUint32(off + 12, false);
            const unit = dv.getUint8(off + 16);
            if (unit === 1) {
              const dpiX = Math.round(xppu * 0.0254);
              const dpiY = Math.round(yppu * 0.0254);
              return { dpiX, dpiY };
            }
            break;
          }
          off += 12 + length + 4; // len + type + data + crc
        }
      }
    } catch { }
    return {};
  };
  const loadImageSize = (
    file: File
  ): Promise<{ widthPx: number; heightPx: number; url: string }> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        resolve({
          widthPx: img.naturalWidth,
          heightPx: img.naturalHeight,
          url,
        });
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };
      img.src = url;
    });
  };
  const onDropEvent = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files || []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (dropped.length === 0) return;
    
    const artboard = e.currentTarget;
    const rect = artboard.getBoundingClientRect();
    const dropX = (e.clientX - rect.left) / (96 * zoom);
    const dropY = (e.clientY - rect.top) / (96 * zoom);
    
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
        console.log('Image dimensions:', { widthPx, heightPx, dpi, widthIn, heightIn, fileName: file.name });
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
          posX: dropX - (widthIn / 2),
          posY: dropY - (heightIn / 2),
          linked: true,
          price: 12.34,
          name: file.name,
          isAnimating: true,
          dropY: dropY - (heightIn / 2),
          velocityY: 0,
          gravityActive: true,
        } as (typeof items)[number] & { dropY: number; velocityY: number; gravityActive: boolean };
      })
    );
    if (lowDpiImages > 0) {
      setLowDpiCount(lowDpiImages);
      setTimeout(() => setLowDpiCount(0), 8000);
    }
    setItems((prev) => {
      const existingWithGravity = prev.map(it => ({ ...it, gravityActive: true, velocityY: -0.15 }));
      return [...existingWithGravity, ...created];
    });
    const newSelected = start + dropped.length - 1;
    setCounter(newSelected);
    setSelectedId(null);
  };
  const zoomIn = () =>
    setZoom((z) => Math.min(MAX_ZOOM, +(z + 0.1).toFixed(2)));
  const zoomOut = () =>
    setZoom((z) => Math.max(MIN_ZOOM, +(z - 0.1).toFixed(2)));
  
  const snapToGridPoint = (value: number) => Math.round(value / (gridSize / 96)) * (gridSize / 96);
  
  const gridSize = 20; // 1 inch = 96px
  const half = gridSize / 2;
  const smallGrid = gridSize / 0.5; // 0.25 inch
  const smallHalf = smallGrid / 2;

  const gridStyle = {
    backgroundImage: [
      // Grid lines - Commented out
      // showGrid ? `linear-gradient(#C0C0C0 1px, transparent 1px)` : '',
      // showGrid ? `linear-gradient(90deg, #C0C0C0 1px, transparent 1px)` : '',
      `linear-gradient(45deg, #E9F2F1 25%, transparent 25%)`,
      `linear-gradient(-45deg, #E9F2F1 25%, transparent 25%)`,
      `linear-gradient(45deg, transparent 75%, #E9F2F1 75%)`,
      `linear-gradient(-45deg, transparent 75%, #E9F2F1 75%)`
    ].filter(Boolean).join(', '),

    backgroundSize: [
      // Grid lines - Commented out
      // showGrid ? `${gridSize * zoom}px ${gridSize * zoom}px` : '',
      // showGrid ? `${gridSize * zoom}px ${gridSize * zoom}px` : '',
      `${smallGrid * zoom}px ${smallGrid * zoom}px`,
      `${smallGrid * zoom}px ${smallGrid * zoom}px`,
      `${smallGrid * zoom}px ${smallGrid * zoom}px`,
      `${smallGrid * zoom}px ${smallGrid * zoom}px`
    ].filter(Boolean).join(', '),

    backgroundPosition: [
      // Grid lines - Commented out
      // showGrid ? `-1px -1px` : '',
      // showGrid ? `-1px -1px` : '',
      `0 0`,
      `0 ${smallHalf * zoom}px`,
      `${smallHalf * zoom}px -${smallHalf * zoom}px`,
      `-${smallHalf * zoom}px 0px`
    ].filter(Boolean).join(', '),
  } as React.CSSProperties;

  const rotateSelected = () => {
    if (selectedId == null) return;
    setItems((prev) =>
      prev.map((it) =>
        it.id === selectedId
          ? { ...it, rotation: (it.rotation + 90) % 360 }
          : it
      )
    );
  };
  const toggleLockSelected = () => {
    if (selectedId == null) return;
    setItems((prev) =>
      prev.map((it) =>
        it.id === selectedId ? { ...it, locked: !it.locked } : it
      )
    );
  };
  const flipSelected = () => {
    if (selectedId == null) return;
    setItems((prev) =>
      prev.map((it) =>
        it.id === selectedId ? { ...it, flipped: !it.flipped } : it
      )
    );
  };
  const toggleAutoCrop = () => {
    if (selectedId == null) return;
    const item = items.find(it => it.id === selectedId);
    if (!item) return;
    
    if (!item.autoCrop) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
        
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const alpha = data[(y * canvas.width + x) * 4 + 3];
            if (alpha > 10) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        
        const cropWidth = maxX - minX + 1;
        const cropHeight = maxY - minY + 1;
        const dpi = Math.max(1, Math.round(150));
        const newWidthIn = cropWidth / dpi;
        const newHeightIn = cropHeight / dpi;
        
        setItems((prev) =>
          prev.map((it) =>
            it.id === selectedId ? { ...it, autoCrop: true, widthIn: newWidthIn, heightIn: newHeightIn } : it
          )
        );
      };
      img.src = item.url;
    } else {
      setItems((prev) =>
        prev.map((it) =>
          it.id === selectedId ? { ...it, autoCrop: false } : it
        )
      );
    }
  };
  const toggleLinked = () => {
    if (selectedId == null) return;
    setItems((prev) =>
      prev.map((it) =>
        it.id === selectedId ? { ...it, linked: !it.linked } : it
      )
    );
  };
  const setCopies = (n: number) => {
    if (selectedId == null) return;
    setItems((prev) =>
      prev.map((it) => (it.id === selectedId ? { ...it, copies: n } : it))
    );
  };
  const setWidthIn = (n: number) => {
    if (selectedId == null) return;
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === selectedId) {
          if (it.linked) {
            const ratio = it.heightIn / it.widthIn;
            return { ...it, widthIn: n, heightIn: n * ratio };
          }
          return { ...it, widthIn: n };
        }
        return it;
      })
    );
  };
  const setHeightIn = (n: number) => {
    if (selectedId == null) return;
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === selectedId) {
          if (it.linked) {
            const ratio = it.widthIn / it.heightIn;
            return { ...it, heightIn: n, widthIn: n * ratio };
          }
          return { ...it, heightIn: n };
        }
        return it;
      })
    );
  };
  const setPosX = (n: number) => {
    if (selectedId == null) return;
    const finalX = snapToGrid ? snapToGridPoint(n) : n;
    setItems((prev) =>
      prev.map((it) => (it.id === selectedId ? { ...it, posX: finalX } : it))
    );
  };
  const setPosY = (n: number) => {
    if (selectedId == null) return;
    const finalY = snapToGrid ? snapToGridPoint(n) : n;
    setItems((prev) =>
      prev.map((it) => (it.id === selectedId ? { ...it, posY: finalY } : it))
    );
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

  const handleResizeStart = (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation();
    const item = items.find(it => it.id === itemId);
    if (!item) return;
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY, width: item.widthIn, height: item.heightIn });
  };

  const handleDragStart = (e: React.MouseEvent, itemId: number) => {
    const item = items.find(it => it.id === itemId);
    if (!item || item.locked) return;
    setIsDraggingItem(true);
    setDragStart({ x: e.clientX, y: e.clientY, posX: item.posX, posY: item.posY });
    setItems(prev => prev.map(it => it.id === itemId ? it : { ...it, gravityActive: true, velocityY: -0.05 }));
  };

  useEffect(() => {
    if (!isResizing || !resizeStart || selectedId == null) return;

    const handleMouseMove = (e: MouseEvent) => {
      const item = items.find(it => it.id === selectedId);
      if (!item) return;

      const deltaX = (e.clientX - resizeStart.x) / (96 * zoom);
      const deltaY = (e.clientY - resizeStart.y) / (96 * zoom);
      const newWidth = Math.max(0.5, resizeStart.width + deltaX);
      const newHeight = Math.max(0.5, resizeStart.height + deltaY);

      if (item.linked) {
        const ratio = resizeStart.height / resizeStart.width;
        const avgDelta = (deltaX + deltaY / ratio) / 2;
        const finalWidth = Math.max(0.5, resizeStart.width + avgDelta);
        const finalHeight = finalWidth * ratio;
        setItems(prev => prev.map(it => it.id === selectedId ? { ...it, widthIn: finalWidth, heightIn: finalHeight } : it));
      } else {
        setItems(prev => prev.map(it => it.id === selectedId ? { ...it, widthIn: newWidth, heightIn: newHeight } : it));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeStart(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStart, selectedId, items, zoom]);

  useEffect(() => {
    if (!isDraggingItem || !dragStart || selectedId == null) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - dragStart.x) / (96 * zoom);
      const deltaY = (e.clientY - dragStart.y) / (96 * zoom);
      const newPosX = dragStart.posX + deltaX;
      const newPosY = dragStart.posY + deltaY;
      const finalX = snapToGrid ? snapToGridPoint(newPosX) : newPosX;
      const finalY = snapToGrid ? snapToGridPoint(newPosY) : newPosY;
      setItems(prev => prev.map(it => it.id === selectedId ? { ...it, posX: finalX, posY: finalY } : it));
    };

    const handleMouseUp = () => {
      setIsDraggingItem(false);
      setDragStart(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingItem, dragStart, selectedId, zoom, snapToGrid]);
  const deleteSelected = () => {
    if (selectedId == null) return;
    setItems((prev) => prev.filter((it) => it.id !== selectedId));
    setSelectedId(null);
  };

  useEffect(() => {
    if (snapToGrid) {
      setOriginalPositions(prev => {
        const newOriginals = { ...prev };
        items.forEach(it => {
          if (!newOriginals[it.id]) {
            newOriginals[it.id] = { posX: it.posX, posY: it.posY };
          }
        });
        return newOriginals;
      });
      setItems(prev => prev.map(it => ({
        ...it,
        posX: snapToGridPoint(it.posX),
        posY: snapToGridPoint(it.posY)
      })));
    } else {
      setItems(prev => prev.map(it => {
        const original = originalPositions[it.id];
        return original ? { ...it, posX: original.posX, posY: original.posY } : it;
      }));
    }
  }, [snapToGrid]);

  useEffect(() => {
    if (onHeaderInfoChange) {
      if (selectedId === null) {
        onHeaderInfoChange({ hasItem: false });
      } else {
        const target = items.find(it => it.id === selectedId);
        if (target) {
          const widthIn = +target.widthIn.toFixed(2);
          const heightIn = +target.heightIn.toFixed(2);
          const areaSf = +((widthIn * heightIn) / 144).toFixed(2);
          const pricePerSqFt = 5.50;
          const price = +(areaSf * pricePerSqFt).toFixed(2);
          onHeaderInfoChange({
            hasItem: true,
            areaSf,
            widthIn,
            heightIn,
            name: target.name || `Item #${target.id}`,
            price,
          });
        }
      }
    }
  }, [items, selectedId, onHeaderInfoChange]);
  const toggleExpandSelected = () => {
    if (selectedId == null) return;
    setItems((prev) =>
      prev.map((it) =>
        it.id === selectedId ? { ...it, expanded: !it.expanded } : it
      )
    );
  };

  useEffect(() => {
    const updateCanvasWidth = () => {
      const canvas = document.querySelector('.flex-1.relative.flex.items-center') as HTMLElement;
      if (canvas) {
        setCanvasWidth(canvas.offsetWidth / 96); // Convert pixels to inches
      }
    };
    updateCanvasWidth();
    window.addEventListener('resize', updateCanvasWidth);
    return () => window.removeEventListener('resize', updateCanvasWidth);
  }, []);

  useEffect(() => {
    items.forEach((it) => {
      const element = document.querySelector(`[data-item-id="${it.id}"]`) as HTMLElement;
      if (!element) return;
      
      if (it.gravityActive) {
        gsap.to(element, {
          left: `${it.posX * 96}px`,
          top: `${it.posY * 96}px`,
          duration: 2,
          ease: "bounce.out",
        });
      } else {
        gsap.to(element, {
          left: `${it.posX * 96}px`,
          top: `${it.posY * 96}px`,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    });
  }, [items]);

  // Ruler Segment Component
  const RulerSegment = ({ vertical = false, label }: { vertical?: boolean; label: number }) => {

    // 1 inch = 96px.
    // Ticks at:
    // 1/8 (12px), 1/4 (24px), 3/8 (36px), 1/2 (48px), 5/8 (60px), 3/4 (72px), 7/8 (84px)
    const ticks = [12, 24, 36, 48, 60, 72, 84];

    return (
      <div className={`relative ${vertical ? 'h-24 w-full border-t border-gray-300' : 'w-24 h-full border-l border-gray-300'} flex-shrink-0`}>
        {label !== 0 && (
          <span className={`absolute text-[9px] text-gray-500 font-medium select-none ${vertical ? 'top-1 left-4' : 'top-4 left-1'}`}>
            {label}
          </span>
        )}
        {ticks.map(pos => {
          let height = 'h-2'; // 1/8
          if (pos === 48) height = 'h-4'; // 1/2
          else if (pos === 24 || pos === 72) height = 'h-3'; // 1/4

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
  };

  return (
    <div className="flex-1 relative bg-gray-50 overflow-hidden flex flex-col">
      {lowDpiCount > 0 && (
        <div className="absolute w-[720px] text-center top-10 left-1/2 -translate-x-1/2 z-50 bg-[#FFFBEB] border border-[#EFB106] rounded-lg px-4 py-2 shadow-lg">
          <p style={{ fontFamily: 'Roboto', fontWeight: 400, fontSize: '14px', lineHeight: '20px', letterSpacing: '0px', color: '#EFB106' }}>
            {lowDpiCount} image{lowDpiCount > 1 ? 's have' : ' has'} resolution below 300 DPI. For optimal DTF printing quality, images should be at least 300 DPI at print size.
          </p>
        </div>
      )}
      <div className="flex-1 flex relative">
        {/* Main Canvas Area */}
        <div
          className="flex-1 relative flex items-center justify-center bg-white overflow-hidden"
          onWheel={onWheel}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDropEvent}
        >
          <div
            className="absolute inset-0 z-0 opacity-100"
            style={gridStyle}
          ></div>

          {/* Top Ruler */}
          {showRulers && (
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
          )}

          {/* Left Ruler */}
          {showRulers && (
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
          )}

          {/* Corner 0 Label */}
          {showRulers && (
            <div className="absolute top-0 left-0 w-8 h-8 z-20 bg-white border-b border-r border-gray-200 flex items-center justify-center pointer-events-none">
              <span className="text-[9px] text-gray-500 font-medium">0</span>
            </div>
          )}

          {/* Margins */}
          {showMargins && (
            <>
              <div
                className="absolute z-15 pointer-events-none border-2 border-dashed border-red-500 rounded-lg"
                style={{
                  top: showRulers ? "12px" : "0",
                  left: showRulers ? "12px" : "0",
                  right: "0",
                  bottom: "0",
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
          )}

          <div
            className="absolute inset-0"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center",
              transition: "transform 200ms ease-out",
            }}
            onClick={() => {
              setSelectedId(null);
              setShowProperties({});
            }}
          >
            <div className="absolute inset-0 z-10">
              {items.length > 0 ? (
                <>
                  {items.map((it) => (
                    <div
                      key={it.id}
                      data-item-id={it.id}
                      className={`absolute rounded-md ${
                        selectedId === it.id ? "ring-4 ring-blue-500" : ""
                      }`}
                      style={{
                        left: `${it.posX * 96}px`,
                        top: `${it.posY * 96}px`,
                        touchAction: "none",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedId === it.id && !showProperties[it.id]) {
                          setShowProperties((prev) => ({
                            ...prev,
                            [it.id]: true,
                          }));
                        } else if (selectedId !== it.id) {
                          setSelectedId(it.id);
                          setShowProperties({});
                        }
                      }}
                    >
                      {selectedId === it.id && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/95 border border-gray-200 shadow-xl rounded-lg px-2 py-1">
                          <button
                            className="p-0.5 text-gray-400 hover:text-black"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpandSelected();
                            }}
                          >
                            <MdOpenInFull className="w-4 h-4" />
                          </button>
                          <span className="w-px h-3 bg-gray-200" />
                          <button
                            className="p-0.5 text-gray-400 hover:text-black"
                            onClick={(e) => {
                              e.stopPropagation();
                              rotateSelected();
                            }}
                          >
                            <MdRotateRight className="w-4 h-4" />
                          </button>
                          <span className="w-px h-3 bg-gray-200" />
                          <button
                            className="p-0.5 text-gray-400 hover:text-black"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLockSelected();
                            }}
                          >
                            {it.locked ? (
                              <MdLock className="w-4 h-4" />
                            ) : (
                              <MdLockOpen className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            className="p-0.5 text-gray-400 hover:text-black"
                            onClick={(e) => {
                              e.stopPropagation();
                              flipSelected();
                            }}
                          >
                            <LuFlipHorizontal className="w-4 h-4" />
                          </button>
                          <span className="w-px h-3 bg-gray-200" />
                          <button
                            className="p-0.5 text-gray-400 hover:text-black"
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateSelected();
                            }}
                          >
                            <MdContentCopy className="w-4 h-4" />
                          </button>
                          <span className="w-px h-3 bg-gray-200" />
                          <button
                            className="p-0.5 text-red-400 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSelected();
                            }}
                          >
                            <RiDeleteBin5Line className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {selectedId === it.id && showProperties[it.id] && (
                        <div
                          className="absolute top-0 left-full ml-3 z-30 w-60 bg-white border border-gray-300 shadow-2xl rounded-xl"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-300">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[12px]">
                                Properties
                              </span>
                            </div>
                            <button
                              className="p-1 text-gray-600 hover:text-black"
                              onClick={() => {
                                setShowProperties({});
                              }}
                            >
                              <MdClose className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="px-3 py-2 flex items-center justify-between">
                            <div className="text-[10px]">
                              <div className="font-medium text-gray-900">
                                {it.name || `Item #${it.id}`}
                              </div>
                              <div className="text-gray-500">Linked copies</div>
                            </div>
                            <div className="text-[10px] font-semibold text-gray-900">
                              ${it.price.toFixed(2)}/each
                            </div>
                          </div>
                          <div className="px-3 py-2 border-t border-gray-300 flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900 text-[10px]">
                                Auto Crop
                              </div>
                              <div className="text-gray-500 text-[8px]">
                                Remove empty space
                              </div>
                            </div>
                            <button
                              className={`w-9 h-5 rounded-full flex items-center transition-colors ${
                                it.autoCrop ? "bg-blue-600" : "bg-gray-300"
                              }`}
                              onClick={toggleAutoCrop}
                            >
                              <span
                                className={`w-4 h-4 bg-white rounded-full shadow transform transition ${
                                  it.autoCrop
                                    ? "translate-x-4"
                                    : "translate-x-1"
                                }`}
                              ></span>
                            </button>
                          </div>
                          <div className="px-3 py-2 border-t border-gray-300">
                            <div className="text-[10px] font-medium text-gray-900 mb-2">
                              Number of Copies
                            </div>
                            <input
                              type="number"
                              min={1}
                              value={it.copies}
                              onChange={(e) =>
                                setCopies(
                                  Math.max(1, parseInt(e.target.value || "1"))
                                )
                              }
                              className="w-full h-6 px-2 border border-gray-300 rounded-md text-[8px] bg-[#F3F3F5]"
                            />
                          </div>
                          <div className="px-3 py-2 border-t border-gray-300">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-[10px] font-medium text-gray-900">
                                Dimensions
                              </div>
                              <button
                                className={`p-1 rounded ${
                                  it.linked ? "text-blue-600" : "text-gray-600"
                                }`}
                                onClick={toggleLinked}
                                title={it.linked ? "Linked" : "Unlinked"}
                              >
                                <MdLink className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[8px] text-gray-500">
                                  Width (in)
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={it.widthIn}
                                  onChange={(e) =>
                                    setWidthIn(
                                      parseFloat(e.target.value || "0")
                                    )
                                  }
                                  className="w-full h-6 px-2 border border-gray-300 rounded-md text-[8px] bg-[#F3F3F5]"
                                />
                              </div>
                              <div>
                                <label className="text-[8px] text-gray-500">
                                  Height (in)
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={it.heightIn}
                                  onChange={(e) =>
                                    setHeightIn(
                                      parseFloat(e.target.value || "0")
                                    )
                                  }
                                  className="w-full h-6 px-2 border border-gray-300 rounded-md text-[8px] bg-[#F3F3F5]"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="px-3 py-2 border-t border-gray-300">
                            <div className="text-[10px] font-medium text-gray-900 mb-2">
                              Position
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[8px] text-gray-500">
                                  X Wide
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={it.posX}
                                  onChange={(e) =>
                                    setPosX(parseFloat(e.target.value || "0"))
                                  }
                                  className="w-full h-6 px-2 border border-gray-300 rounded-md text-[8px] bg-[#F3F3F5]"
                                />
                              </div>
                              <div>
                                <label className="text-[8px] text-gray-500">
                                  Y Long
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={it.posY}
                                  onChange={(e) =>
                                    setPosY(parseFloat(e.target.value || "0"))
                                  }
                                  className="w-full h-6 px-2 border border-gray-300 rounded-md text-[8px] bg-[#F3F3F5]"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="px-3 py-3 border-t border-gray-300">
                            <button className="w-full bg-blue-600 text-white py-1.5 rounded-lg text-xs hover:bg-blue-700">
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      )}
                      {selectedId === it.id && (
                        <div className="absolute top-1 left-2 bg-blue-600 text-white text-xs rounded-xl px-2 h-5 flex items-center gap-1">
                          <FiLink className="w-3 h-3" />
                          <span>#{it.id}</span>
                        </div>
                      )}
                      <img
                        src={it.url}
                        alt="dropped"
                        className={`${
                          it.expanded
                            ? "max-w-[60vw] max-h-[60vh]"
                            : "max-w-[40vw] max-h-[40vh]"
                        } object-contain ${
                          !it.locked ? "cursor-move" : "cursor-default"
                        }`}
                        style={{
                          width: `${it.widthIn * 96}px`,
                          height: `${it.heightIn * 96}px`,
                          transform: `scaleX(${it.flipped ? -1 : 1}) rotate(${
                            it.rotation
                          }deg)`,
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleDragStart(e, it.id);
                        }}
                      />
                      {selectedId === it.id && (
                        <>
                          <span
                            className="absolute -top-2 -left-2 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white cursor-nwse-resize"
                            onMouseDown={(e) => handleResizeStart(e, it.id)}
                          ></span>
                          <span
                            className="absolute -top-2 -right-2 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white cursor-nesw-resize"
                            onMouseDown={(e) => handleResizeStart(e, it.id)}
                          ></span>
                          <span
                            className="absolute -bottom-2 -left-2 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white cursor-nesw-resize"
                            onMouseDown={(e) => handleResizeStart(e, it.id)}
                          ></span>
                          <span
                            className="absolute -bottom-2 -right-2 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white cursor-nwse-resize"
                            onMouseDown={(e) => handleResizeStart(e, it.id)}
                          ></span>
                        </>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-transparent rounded-xl flex items-center justify-center">
                      <img
                        src="/folder-icon.svg"
                        alt="folder"
                        className="w-[122px] h-[122px] drop-shadow-lg"
                      />
                    </div>
                    <p className="text-[20px] text-gray-800 italic font-light">
                      Just drop your files directly to the artboard
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          {isDragging && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              <div className="w-full h-full border-2 border-dashed border-blue-400 rounded"></div>
            </div>
          )}
          <div className="absolute top-10 right-3 z-20 flex gap-2">
            <button
              onClick={zoomOut}
              className="p-2 rounded-full bg-white border border-gray-200 shadow hover:bg-gray-50"
            >
              <MdZoomOut className="w-5 h-5 text-gray-800" />
            </button>
            <button
              onClick={zoomIn}
              className="p-2 rounded-full bg-white border border-gray-200 shadow hover:bg-gray-50"
            >
              <MdZoomIn className="w-5 h-5 text-gray-800" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
