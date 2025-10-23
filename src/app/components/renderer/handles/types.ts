import { Point, Rectangle, Size } from "@/utils/point";

export type HandleMutableState = {
  initial: Point;
  current: Rectangle;
  max: Size;
};

export const initialHandleState: HandleMutableState = {
  initial: { x: 0, y: 0 },
  current: { x: 0, y: 0, w: 0, h: 0 },
  max: { w: 0, h: 0 },
};
