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
  margin: number = 0.15
): LayoutItem[] => {
  const selectionBuffer = 0.2; // Room for blue ring and handles
  const maxWidth = canvasWidth - margin * 2;
  const rows: LayoutItem[][] = [];
  let currentRow: LayoutItem[] = [];
  let currentRowWidth = 0;

  items.forEach((it) => {
    const itemWidth = it.widthIn + selectionBuffer + spacing;
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

  let currentY = margin + selectionBuffer / 2;
  const updates = rows.flatMap((row) => {
    const rowWidth = row.reduce((sum, it, idx) => sum + (it.widthIn + selectionBuffer) + (idx > 0 ? spacing : 0), 0);
    let currentX = margin + (maxWidth - rowWidth) / 2;
    const maxHeight = Math.max(...row.map((it) => it.heightIn + selectionBuffer));

    const rowItems = row.map((it) => {
      const result = { ...it, posX: currentX + selectionBuffer / 2, posY: currentY + selectionBuffer / 2, gravityActive: false };
      currentX += it.widthIn + selectionBuffer + spacing;
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
  spacing: number = 0.5,
  margin: number = 0.15
): { targetX: number; targetY: number } => {
  const selectionBuffer = 0.2;
  const maxWidth = canvasWidth - margin * 2;
  const allItems = [...items, newItem];

  const rows: LayoutItem[][] = [];
  let currentRow: LayoutItem[] = [];
  let currentRowWidth = 0;

  allItems.forEach((it) => {
    const itemWidth = it.widthIn + selectionBuffer + spacing;
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
  let targetY = margin + selectionBuffer / 2;
  let found = false;

  for (const row of rows) {
    const rowWidth = row.reduce((sum, it, idx) => sum + (it.widthIn + selectionBuffer) + (idx > 0 ? spacing : 0), 0);
    let currentX = margin + (maxWidth - rowWidth) / 2;
    const maxHeight = Math.max(...row.map((it) => it.heightIn + selectionBuffer));

    for (const it of row) {
      if (it.id === newItem.id) {
        targetX = currentX + selectionBuffer / 2;
        found = true;
        break;
      }
      currentX += it.widthIn + selectionBuffer + spacing;
    }

    if (found) break;
    targetY += maxHeight + spacing;
  }

  return { targetX, targetY };
};
