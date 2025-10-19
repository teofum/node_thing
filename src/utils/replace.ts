export type Replace<
  T extends object,
  U extends { [K in keyof T]?: unknown },
> = Omit<T, keyof U> & U;
