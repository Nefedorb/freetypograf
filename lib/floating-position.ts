export const FLOATING_WINDOW_SIZE = 112;
export const FLOATING_MIN_VISIBLE_SIZE = FLOATING_WINDOW_SIZE;

export type FloatingPosition = {
  x: number;
  y: number;
};

export type FloatingScreenBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export function getFloatingScreenBounds(): FloatingScreenBounds {
  if (typeof window === "undefined") {
    return {
      left: 0,
      top: 0,
      width: 1920,
      height: 1080
    };
  }

  const screen = window.screen as Screen & {
    availLeft?: number;
    availTop?: number;
  };
  return {
    left: finiteOrDefault(screen.availLeft, 0),
    top: finiteOrDefault(screen.availTop, 0),
    width: finiteOrDefault(screen.availWidth, window.innerWidth),
    height: finiteOrDefault(screen.availHeight, window.innerHeight)
  };
}

export function clampFloatingPosition(
  position: FloatingPosition,
  bounds: FloatingScreenBounds,
  windowSize = FLOATING_WINDOW_SIZE,
  minVisibleSize = FLOATING_MIN_VISIBLE_SIZE
): FloatingPosition {
  const safeWindowSize = Math.max(1, finiteOrDefault(windowSize, FLOATING_WINDOW_SIZE));
  const safeMinVisibleSize = Math.min(
    safeWindowSize,
    Math.max(1, finiteOrDefault(minVisibleSize, FLOATING_MIN_VISIBLE_SIZE))
  );
  const left = finiteOrDefault(bounds.left, 0);
  const top = finiteOrDefault(bounds.top, 0);
  const width = Math.max(safeWindowSize, finiteOrDefault(bounds.width, safeWindowSize));
  const height = Math.max(safeWindowSize, finiteOrDefault(bounds.height, safeWindowSize));
  const minX = left - safeWindowSize + safeMinVisibleSize;
  const maxX = left + width - safeMinVisibleSize;
  const minY = top - safeWindowSize + safeMinVisibleSize;
  const maxY = top + height - safeMinVisibleSize;

  return {
    x: clamp(Math.round(finiteOrDefault(position.x, left)), minX, maxX),
    y: clamp(Math.round(finiteOrDefault(position.y, top)), minY, maxY)
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function finiteOrDefault(value: number | undefined | null, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
