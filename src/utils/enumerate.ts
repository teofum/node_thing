export function enumerate<T>(a: T[]): [T, number][] {
  return a.map((el, i) => [el, i]);
}
