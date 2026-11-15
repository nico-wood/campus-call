import { describe, expect, it } from "vitest";
import { infoTipPanelStyle } from "../src/app/info-tip";

const rect = {
  top: 100,
  bottom: 144,
  left: 200,
  right: 244,
  width: 44,
  height: 44,
} as DOMRect;

describe("infoTipPanelStyle", () => {
  it("fixes the panel above the trigger center by default", () => {
    const style = infoTipPanelStyle(rect, "top");
    expect(style.position).toBe("fixed");
    expect(style.top).toBe(92);
    expect(style.left).toBe(222);
    expect(style.transform).toBe("translate(-50%, -100%)");
  });

  it("flips below the trigger for side bottom", () => {
    const style = infoTipPanelStyle(rect, "bottom");
    expect(style.top).toBe(152);
    expect(style.left).toBe(222);
    expect(style.transform).toBe("translateX(-50%)");
  });

  it("centers vertically for side left and right", () => {
    const left = infoTipPanelStyle(rect, "left");
    expect(left.top).toBe(122);
    expect(left.left).toBe(192);
    expect(left.transform).toBe("translate(-100%, -50%)");

    const right = infoTipPanelStyle(rect, "right");
    expect(right.top).toBe(122);
    expect(right.left).toBe(252);
    expect(right.transform).toBe("translateY(-50%)");
  });

  it("caps the panel width so it never spans the viewport", () => {
    const style = infoTipPanelStyle(rect, "top");
    expect(style.maxWidth).toBe("min(20rem, calc(100vw - 2rem))");
    expect(style.pointerEvents).toBe("none");
  });
});
