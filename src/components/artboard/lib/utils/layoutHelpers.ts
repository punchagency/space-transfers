export interface LayoutItem {
  id: number;
  widthIn: number;
  heightIn: number;
  posX: number;
  posY: number;
  gravityActive?: boolean;
}

export const calculateGridLayout = (
  items: LayoutItem[],
  canvasWidth: number,
  spacing: number,
  autoNestStickers: boolean,
  margin: number = 0.25
): LayoutItem[] => {
  const maxWidth = canvasWidth - margin * 2;
  const rows: LayoutItem[][] = [];
  let currentRow: LayoutItem[] = [];
  let currentRowWidth = 0;

  items.forEach((it) => {
    const itemWidth = it.widthIn + spacing;
    if (currentRowWidth + itemWidth > maxWidth && currentRow.length > 0) {
      rows.push(currentRow);
      currentRow = [it];
      currentRowWidth = itemWidth;
    } else {
      currentRow.push(it);
      currentRowWidth += itemWidth;
    }
  });
  if (currentRow.length > 0) rows.push(currentRow);

  let currentY = margin;
  const updates = rows.flatMap((row) => {
    const rowWidth = row.reduce((sum, it, idx) => sum + it.widthIn + (idx > 0 ? spacing : 0), 0);
    let currentX = (canvasWidth - rowWidth) / 2;
    const maxHeight = Math.max(...row.map((it) => it.heightIn));

    const rowItems = row.map((it) => {
      const result = { ...it, posX: currentX, posY: currentY, gravityActive: false };
      currentX += it.widthIn + spacing;
      return result;
    });

    currentY += maxHeight + spacing;
    return rowItems;
  });

  return updates;
};

export const calculateDropPosition = (
  items: LayoutItem[],
  newItem: LayoutItem,
  canvasWidth: number,
  topCenterY: number,
  spacing: number = 1.5,
  margin: number = 1.5
): { targetX: number; targetY: number } => {
  const maxWidth = canvasWidth - margin * 2;
  const allItems = [...items, newItem];

  const rows: LayoutItem[][] = [];
  let currentRow: LayoutItem[] = [];
  let currentRowWidth = 0;

  allItems.forEach((it) => {
    const itemWidth = it.widthIn + spacing;
    if (currentRowWidth + itemWidth > maxWidth && currentRow.length > 0) {
      rows.push(currentRow);
      currentRow = [it];
      currentRowWidth = itemWidth;
    } else {
      currentRow.push(it);
      currentRowWidth += itemWidth;
    }
  });
  if (currentRow.length > 0) rows.push(currentRow);

  let targetX = canvasWidth / 2;
  let targetY = topCenterY;

  rows.forEach((row) => {
    const rowWidth = row.reduce((sum, it, idx) => sum + it.widthIn + (idx > 0 ? spacing : 0), 0);
    let currentX = (canvasWidth - rowWidth) / 2;

    row.forEach((it) => {
      if (it.id === newItem.id) {
        targetX = currentX;
        targetY = topCenterY;
      }
      currentX += it.widthIn + spacing;
    });
  });

  return { targetX, targetY };
};
