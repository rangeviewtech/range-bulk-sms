export interface FlyoutPositionOptions {
  parentRect: {
    top: number;
    bottom: number;
    left: number;
    right: number;
    height: number;
  };
  sidebarRect: {
    top: number;
    bottom: number;
    left: number;
    right: number;
    width: number;
  };
  submenuHeight: number;
  isLastItem: boolean;
  viewportHeight: number;
  viewportWidth?: number;
  paddingBottom?: number;
  paddingTop?: number;
}

export interface FlyoutPositionResult {
  top: number;
  left: number;
  maxHeight: number;
  overflowsViewport: boolean;
}

export interface DeepMenuPositionOptions {
  parentSubMenuTop: number;
  categoryRowTopOffset: number;
  deepMenuHeight: number;
  viewportHeight: number;
  paddingBottom?: number;
  paddingTop?: number;
}

export interface DeepMenuPositionResult {
  topOffset: number;
  screenTop: number;
  maxHeight: number;
  overflowsViewport: boolean;
}

/**
 * Computes submenu flyout position relative to the viewport.
 * 
 * Rules:
 * - Upper sidebar items (e.g. Agent): Align submenu.top = parent.top, clamped to viewport.
 * - Last sidebar item (Settings):
 *   1. Prefer submenu.top = parent.bottom and submenu.left = sidebar.right (no horizontal gap).
 *   2. If that position would extend below viewport, move upward only as much as necessary
 *      to keep its bottom edge 8px above the viewport bottom.
 *   3. In this overflow case, viewport visibility takes priority over exact alignment with parent's bottom edge.
 *   4. If submenu is taller than available viewport, apply maximum height and internal scrolling.
 */
export function computeFlyoutPosition({
  parentRect,
  sidebarRect,
  submenuHeight,
  isLastItem,
  viewportHeight,
  paddingBottom = 8,
  paddingTop = 8,
}: FlyoutPositionOptions): FlyoutPositionResult {
  const left = sidebarRect.right;
  const availableHeight = viewportHeight - (paddingTop + paddingBottom);
  const maxHeight = Math.max(100, availableHeight);

  let top: number;
  let overflowsViewport = false;

  if (isLastItem) {
    const preferredTop = parentRect.bottom;
    const maxBottom = viewportHeight - paddingBottom;

    if (preferredTop + submenuHeight <= maxBottom) {
      top = preferredTop;
    } else {
      overflowsViewport = true;
      const shiftedTop = maxBottom - submenuHeight;
      top = Math.max(paddingTop, shiftedTop);
    }
  } else {
    const preferredTop = parentRect.top;
    const maxBottom = viewportHeight - paddingBottom;

    if (preferredTop + submenuHeight <= maxBottom) {
      top = Math.max(paddingTop, preferredTop);
    } else {
      overflowsViewport = true;
      const shiftedTop = maxBottom - submenuHeight;
      top = Math.max(paddingTop, shiftedTop);
    }
  }

  return {
    top: Math.round(top),
    left: Math.round(left),
    maxHeight: Math.round(maxHeight),
    overflowsViewport,
  };
}

/**
 * Computes deep menu (Layer 3) offset relative to the submenu container,
 * ensuring it stays inside the viewport with at least paddingBottom space at the bottom.
 */
export function computeDeepMenuPosition({
  parentSubMenuTop,
  categoryRowTopOffset,
  deepMenuHeight,
  viewportHeight,
  paddingBottom = 8,
  paddingTop = 8,
}: DeepMenuPositionOptions): DeepMenuPositionResult {
  const naturalScreenTop = parentSubMenuTop + categoryRowTopOffset;
  const maxBottom = viewportHeight - paddingBottom;
  const maxHeight = Math.max(100, viewportHeight - (paddingTop + paddingBottom));

  let screenTop: number;
  let overflowsViewport = false;

  if (naturalScreenTop + deepMenuHeight <= maxBottom) {
    screenTop = Math.max(paddingTop, naturalScreenTop);
  } else {
    overflowsViewport = true;
    const shiftedTop = maxBottom - deepMenuHeight;
    screenTop = Math.max(paddingTop, shiftedTop);
  }

  const topOffset = screenTop - parentSubMenuTop;

  return {
    topOffset: Math.round(topOffset),
    screenTop: Math.round(screenTop),
    maxHeight: Math.round(maxHeight),
    overflowsViewport,
  };
}
