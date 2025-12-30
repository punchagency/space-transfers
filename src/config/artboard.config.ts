// Zoom configuration
export const ZOOM = {
  MIN: 1,
  MAX: 3,
  STEP: 0.1,
  WHEEL_FACTOR_IN: 1.05,
  WHEEL_FACTOR_OUT: 0.95,
} as const;

// Canvas configuration
export const CANVAS = {
  PIXELS_PER_INCH: 96,
  DEFAULT_MARGIN: 1.0,
  DEFAULT_SPACING: 0.5,
  TOP_CENTER_Y: 1.0,
} as const;

// DPI configuration
export const DPI = {
  THRESHOLD: 300,
  DEFAULT: 150,
  WARNING_DURATION: 8000,
} as const;

// Animation configuration
export const ANIMATION = {
  DROP_DELAY: 50,
  BOUNCE_DELAY: 400,
  POSITION_DURATION: 0.6,
  BOUNCE_DURATION: 0.2,
  BOUNCE_OFFSET: 0.3,
  SHAKE_DURATION: 0.1,
  SHAKE_DISTANCE: 5,
  SHAKE_REPEATS: 3,
  GRAVITY_DURATION: 2,
  NORMAL_DURATION: 0.3,
  ZOOM_TRANSITION: "200ms",
} as const;

// Pricing configuration
export const PRICING = {
  DEFAULT_ITEM_PRICE: 12.34,
  PRICE_PER_SQ_FT: 5.5,
  SQUARE_INCHES_PER_SQ_FT: 144,
} as const;

// Grid configuration
export const GRID = {
  SIZE: 20,
  SMALL_GRID_DIVISOR: 0.5,
} as const;

// Item constraints
export const ITEM = {
  MIN_SIZE: 0.5,
  DUPLICATE_OFFSET: 0.5,
} as const;
