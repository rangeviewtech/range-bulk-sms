import { describe, it, expect } from "vitest";
import { computeFlyoutPosition } from "@/lib/flyout-position";

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
    it("aligns submenu bottom flush with parent bottom on the same line when space allows", () => {
      const parentRect = { top: 500, bottom: 589, left: 0, right: 90, height: 89 };
      const submenuHeight = 108;
      const res = computeFlyoutPosition({
        parentRect,
        sidebarRect,
        submenuHeight,
        isLastItem: true,
        viewportHeight: 1000,
      });

      // Submenu bottom must equal parentRect.bottom so both share the exact same line
      expect(res.top).toBe(481); // 589 - 108
      expect(res.top + submenuHeight).toBe(parentRect.bottom);
      expect(res.left).toBe(90);
      expect(res.overflowsViewport).toBe(false);
    });

    it("guarantees the main menu item and submenu card are on the exact same baseline line for Settings", () => {
      const parentRect = { top: 667, bottom: 756, left: 0, right: 90, height: 89 };
      const submenuHeight = 107;
      const viewportHeight = 788;

      const res = computeFlyoutPosition({
        parentRect,
        sidebarRect,
        submenuHeight,
        isLastItem: true,
        viewportHeight,
      });

      // top = 756 - 107 = 649, bottom = 756 (flush with Settings button bottom)
      expect(res.top).toBe(649);
      expect(res.top + submenuHeight).toBe(parentRect.bottom);
      expect(res.left).toBe(90);
      expect(res.overflowsViewport).toBe(false);
    });

    it("shifts upward to keep bottom edge 8px above viewport when parent bottom extends beyond viewport", () => {
      // Parent bottom extends past viewport maxBottom
      const parentRect = { top: 720, bottom: 815, left: 0, right: 90, height: 89 };
      const submenuHeight = 109;
      const viewportHeight = 800;

      // maxBottom = 800 - 8 = 792
      // shiftedTop = 792 - 109 = 683
      const res = computeFlyoutPosition({
        parentRect,
        sidebarRect,
        submenuHeight,
        isLastItem: true,
        viewportHeight,
      });

      expect(res.top).toBe(683);
      expect(res.left).toBe(90);
      expect(res.top + submenuHeight).toBe(792); // exactly 8px above 800
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
      const parentRect = { top: 780, bottom: 869, left: 0, right: 90, height: 89 };
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
});
