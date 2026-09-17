import { describe, it, expect } from "vitest";
import { computeFlyoutPosition, computeDeepMenuPosition } from "@/lib/flyout-position";

describe("computeFlyoutPosition", () => {
  const sidebarRect = { top: 0, bottom: 900, left: 0, right: 90, width: 90 };

  describe("Upper items (isLastItem: false)", () => {
    it("preserves top-item alignment by aligning submenu.top with parent.top when space allows", () => {
      const parentRect = { top: 350, bottom: 439, left: 0, right: 90, height: 89 };
      const res = computeFlyoutPosition({
        parentRect,
        sidebarRect,
        submenuHeight: 110,
        isLastItem: false,
        viewportHeight: 900,
      });

      expect(res.top).toBe(350);
      expect(res.left).toBe(90);
      expect(res.overflowsViewport).toBe(false);
    });

    it("clamps upper item submenu to keep bottom edge 8px above viewport when near bottom", () => {
      const parentRect = { top: 820, bottom: 909, left: 0, right: 90, height: 89 };
      const res = computeFlyoutPosition({
        parentRect,
        sidebarRect,
        submenuHeight: 110,
        isLastItem: false,
        viewportHeight: 900,
      });

      // viewportHeight - 8 - 110 = 782
      expect(res.top).toBe(782);
      expect(res.top + 110).toBe(892);
      expect(res.overflowsViewport).toBe(true);
    });
  });

  describe("Last sidebar item (isLastItem: true, e.g. Settings)", () => {
    it("aligns submenu.top exactly with parent.bottom when space allows", () => {
      const parentRect = { top: 500, bottom: 589, left: 0, right: 90, height: 89 };
      const res = computeFlyoutPosition({
        parentRect,
        sidebarRect,
        submenuHeight: 108,
        isLastItem: true,
        viewportHeight: 1000,
      });

      expect(res.top).toBe(589);
      expect(res.left).toBe(90);
      expect(res.overflowsViewport).toBe(false);
    });

    it("shifts upward by the minimum necessary amount when space is limited to keep bottom edge 8px above viewport", () => {
      // Settings button located near the bottom of viewport
      const parentRect = { top: 667, bottom: 756, left: 0, right: 90, height: 89 };
      const submenuHeight = 109;
      const viewportHeight = 788;

      // preferredTop = 756
      // preferredTop + 109 = 865 > 780 (788 - 8)
      // shiftedTop = 788 - 8 - 109 = 671
      const res = computeFlyoutPosition({
        parentRect,
        sidebarRect,
        submenuHeight,
        isLastItem: true,
        viewportHeight,
      });

      expect(res.top).toBe(671);
      expect(res.left).toBe(90);
      expect(res.top + submenuHeight).toBe(780); // exactly 8px above 788
      expect(res.overflowsViewport).toBe(true);
    });

    it("applies maximum height and internal scrolling if submenu is taller than viewport", () => {
      const parentRect = { top: 100, bottom: 189, left: 0, right: 90, height: 89 };
      const res = computeFlyoutPosition({
        parentRect,
        sidebarRect,
        submenuHeight: 500,
        isLastItem: true,
        viewportHeight: 300,
      });

      expect(res.top).toBe(8);
      expect(res.maxHeight).toBe(284); // 300 - 16
      expect(res.overflowsViewport).toBe(true);
    });

    it("maintains zero horizontal gap (submenu.left === sidebar.right)", () => {
      const parentRect = { top: 700, bottom: 789, left: 0, right: 90, height: 89 };
      const res = computeFlyoutPosition({
        parentRect,
        sidebarRect,
        submenuHeight: 109,
        isLastItem: true,
        viewportHeight: 900,
      });

      expect(res.left).toBe(sidebarRect.right);
    });
  });

  describe("computeDeepMenuPosition", () => {
    it("aligns deep menu naturally with category row when space allows", () => {
      const res = computeDeepMenuPosition({
        parentSubMenuTop: 400,
        categoryRowTopOffset: 33,
        deepMenuHeight: 150,
        viewportHeight: 900,
      });

      expect(res.topOffset).toBe(33);
      expect(res.screenTop).toBe(433);
      expect(res.overflowsViewport).toBe(false);
    });

    it("shifts deep menu upward when it would exceed the viewport bottom", () => {
      const res = computeDeepMenuPosition({
        parentSubMenuTop: 671,
        categoryRowTopOffset: 33,
        deepMenuHeight: 190,
        viewportHeight: 788,
      });

      // screenTop = 788 - 8 - 190 = 590
      // topOffset = 590 - 671 = -81
      expect(res.screenTop).toBe(590);
      expect(res.screenTop + 190).toBe(780); // 8px above 788
      expect(res.topOffset).toBe(-81);
      expect(res.overflowsViewport).toBe(true);
    });
  });
});
