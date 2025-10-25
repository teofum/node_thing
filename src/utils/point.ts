export type Point = {
  x: number;
  y: number;
};

export type Size = {
  w: number;
  h: number;
};

export type Rectangle = Point & Size;

export function rectangleFromStyle(style: CSSStyleDeclaration): Rectangle {
  return {
    x: Number(style.left.slice(0, -2) || "0"),
    y: Number(style.top.slice(0, -2) || "0"),
    w: Number(style.width.slice(0, -2) || "0"),
    h: Number(style.height.slice(0, -2) || "0"),
  };
}
