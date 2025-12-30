import { GRID, CANVAS } from "../../../../config/artboard.config";

export const getGridStyle = (zoom: number): React.CSSProperties => {
  const smallGrid = GRID.SIZE / GRID.SMALL_GRID_DIVISOR;
  const smallHalf = smallGrid / 2;

  return {
    backgroundImage: [
      `linear-gradient(45deg, #E9F2F1 25%, transparent 25%)`,
      `linear-gradient(-45deg, #E9F2F1 25%, transparent 25%)`,
      `linear-gradient(45deg, transparent 75%, #E9F2F1 75%)`,
      `linear-gradient(-45deg, transparent 75%, #E9F2F1 75%)`,
    ].join(", "),
    backgroundSize: [
      `${smallGrid * zoom}px ${smallGrid * zoom}px`,
      `${smallGrid * zoom}px ${smallGrid * zoom}px`,
      `${smallGrid * zoom}px ${smallGrid * zoom}px`,
      `${smallGrid * zoom}px ${smallGrid * zoom}px`,
    ].join(", "),
    backgroundPosition: [
      `0 0`,
      `0 ${smallHalf * zoom}px`,
      `${smallHalf * zoom}px -${smallHalf * zoom}px`,
      `-${smallHalf * zoom}px 0px`,
    ].join(", "),
  };
};

export const snapToGridPoint = (value: number, gridSize: number = GRID.SIZE): number =>
  Math.round(value / (gridSize / CANVAS.PIXELS_PER_INCH)) * (gridSize / CANVAS.PIXELS_PER_INCH);
