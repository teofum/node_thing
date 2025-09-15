export function zip<T, U>(a: T[], b: U[]): [T, U][] {
  if (a.length !== b.length)
    throw new Error("arrays must have the same length");
  return a.map((el, i) => [el, b[i]]);
}
