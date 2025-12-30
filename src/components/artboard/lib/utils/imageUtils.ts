export const readDPI = async (file: File): Promise<{ dpiX?: number; dpiY?: number }> => {
  try {
    const buf = await file.arrayBuffer();
    const dv = new DataView(buf);
    
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
          if (id0 === 0x4a && id1 === 0x46 && id2 === 0x49 && id3 === 0x46 && id4 === 0x00) {
            const units = dv.getUint8(segStart + 7);
            const xd = dv.getUint16(segStart + 8, false);
            const yd = dv.getUint16(segStart + 10, false);
            if (units === 1) {
              return { dpiX: xd, dpiY: yd };
            } else if (units === 2) {
              const toInch = 2.54;
              return { dpiX: Math.round(xd * toInch), dpiY: Math.round(yd * toInch) };
            }
          }
        }
        off += len > 0 ? len + 2 : 2;
      }
    }
    
    const PNG_SIG = 0x89504e47;
    if (dv.getUint32(0, false) === PNG_SIG) {
      let off = 8;
      while (off + 12 <= dv.byteLength) {
        const length = dv.getUint32(off, false);
        const type = dv.getUint32(off + 4, false);
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
        off += 12 + length + 4;
      }
    }
  } catch { }
  return {};
};

export const loadImageSize = (file: File): Promise<{ widthPx: number; heightPx: number; url: string }> => {
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
