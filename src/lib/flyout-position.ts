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
 *   1. Bottom-align submenu with parent: submenu.bottom = parent.bottom (i.e. submenu.top = parent.bottom - submenuHeight).
 *      This places the main menu item and the submenu card on the exact same horizontal bottom line.
 *   2. If submenu would extend below viewport (parentRect.bottom > maxBottom), shift upward so its bottom edge is 8px above viewport bottom.
 *   3. If submenu would extend above viewport, clamp to paddingTop (8px).
 *   4. Zero horizontal gap: submenu.left = sidebar.right.
 *   5. If submenu is taller than available viewport, apply maximum height and internal scrolling.
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
    const preferredTop = parentRect.bottom - submenuHeight;
    const maxBottom = viewportHeight - paddingBottom;

    if (preferredTop + submenuHeight <= maxBottom) {
      if (preferredTop >= paddingTop) {
        top = preferredTop;
      } else {
        overflowsViewport = true;
        top = paddingTop;
      }
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
