export const captureArtboard = async (): Promise<string> => {
  const artboard = document.querySelector('.flex-1.relative.flex.items-center') as HTMLElement;
  
  if (!artboard) {
    throw new Error('Artboard element not found');
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const rect = artboard.getBoundingClientRect();
  canvas.width = rect.width * 0.5;
  canvas.height = rect.height * 0.5;
  
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  // Draw background
  const gridBg = artboard.querySelector('.absolute.inset-0.z-0') as HTMLElement;
  if (gridBg) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const pattern = ctx.createPattern(await createPatternCanvas(), 'repeat');
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }
  
  // Draw images
  const images = artboard.querySelectorAll('img[alt="dropped"]');
  for (const img of Array.from(images)) {
    const htmlImg = img as HTMLImageElement;
    const parent = htmlImg.parentElement;
    if (parent) {
      const imgRect = parent.getBoundingClientRect();
      const x = (imgRect.left - rect.left) * 0.5;
      const y = (imgRect.top - rect.top) * 0.5;
      const w = imgRect.width * 0.5;
      const h = imgRect.height * 0.5;
      ctx.drawImage(htmlImg, x, y, w, h);
    }
  }
  
  return canvas.toDataURL('image/png');
};

const createPatternCanvas = async (): Promise<HTMLCanvasElement> => {
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = 40;
  patternCanvas.height = 40;
  const pCtx = patternCanvas.getContext('2d');
  if (pCtx) {
    pCtx.fillStyle = '#E9F2F1';
    pCtx.fillRect(0, 0, 10, 10);
    pCtx.fillRect(10, 10, 10, 10);
    pCtx.fillRect(20, 0, 10, 10);
    pCtx.fillRect(30, 10, 10, 10);
    pCtx.fillRect(0, 20, 10, 10);
    pCtx.fillRect(10, 30, 10, 10);
    pCtx.fillRect(20, 20, 10, 10);
    pCtx.fillRect(30, 30, 10, 10);
  }
  return patternCanvas;
};
